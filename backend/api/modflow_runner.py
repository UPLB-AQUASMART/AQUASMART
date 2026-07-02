from __future__ import annotations

import math
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Any

import flopy
import numpy as np


SOIL_PROPERTIES = {
    "gravel": {"k": 80.0, "k33": 8.0, "sy": 0.25},
    "sand": {"k": 25.0, "k33": 2.5, "sy": 0.22},
    "loam": {"k": 5.0, "k33": 0.5, "sy": 0.16},
    "silt": {"k": 1.0, "k33": 0.1, "sy": 0.10},
    "clay": {"k": 0.05, "k33": 0.005, "sy": 0.05},
}

LAYER_NAMES = ("Upper Aquifer", "Confining Layer", "Lower Aquifer")
STREAMBED_CONDUCTANCE_M2_DAY = 0.0001


class ModflowExecutionError(RuntimeError):
    """Raised when the MODFLOW 6 executable is missing or the solve fails."""


def resolve_modflow_executable() -> str:
    backend_dir = Path(__file__).resolve().parents[1]
    executable = os.getenv("MODFLOW_EXE")
    errors: list[str] = []
    candidates = []
    if executable:
        configured_path = Path(executable)
        candidates.append(configured_path)
        if not configured_path.is_absolute():
            candidates.append(backend_dir / configured_path)
    candidates.append(backend_dir / "bin" / "mf6")

    for candidate in candidates:
        if candidate.is_file() and _modflow_binary_works(candidate, errors):
            return str(candidate)

    resolved = shutil.which(executable or "mf6")
    if resolved and _modflow_binary_works(Path(resolved), errors):
        return resolved

    installed = _install_runtime_modflow(backend_dir / "bin", errors)
    if installed and _modflow_binary_works(installed, errors):
        return str(installed)

    detail = " ".join(errors)
    raise ModflowExecutionError(
        f"MODFLOW 6 executable not available. Add backend/bin/mf6, install mf6 on PATH, or set MODFLOW_EXE. {detail}".strip()
    )


def modflow_diagnostics() -> dict[str, Any]:
    errors: list[str] = []
    executable = Path(resolve_modflow_executable())
    version = _run_modflow_version(executable, errors)
    return {
        "executable": str(executable),
        "exists": executable.exists(),
        "isFile": executable.is_file(),
        "isExecutable": os.access(executable, os.X_OK),
        "version": version,
        "errors": errors,
    }


def _modflow_binary_works(path: Path, errors: list[str]) -> bool:
    if not os.access(path, os.X_OK):
        try:
            path.chmod(path.stat().st_mode | 0o755)
        except OSError as error:
            errors.append(f"{path} is not executable: {error}")
            return False
    return _run_modflow_version(path, errors) is not None


def _run_modflow_version(path: Path, errors: list[str]) -> str | None:
    try:
        completed = subprocess.run(
            [str(path), "-v"],
            check=False,
            capture_output=True,
            text=True,
            timeout=15,
        )
    except OSError as error:
        errors.append(f"{path} could not start: {error}")
        return None
    except subprocess.TimeoutExpired:
        errors.append(f"{path} timed out while checking version")
        return None
    output = "\n".join(part for part in [completed.stdout, completed.stderr] if part).strip()
    if completed.returncode != 0:
        errors.append(f"{path} version check failed with code {completed.returncode}: {output[-500:]}")
        return None
    return output.splitlines()[0] if output else "MODFLOW 6"


def _install_runtime_modflow(target_dir: Path, errors: list[str]) -> Path | None:
    try:
        target_dir.mkdir(parents=True, exist_ok=True)
        target = target_dir / "mf6"
        if target.exists():
            target.unlink()
        completed = subprocess.run(
            [
                sys.executable,
                "-m",
                "flopy.utils.get_modflow",
                str(target_dir),
                "--subset",
                "mf6",
                "--quiet",
            ],
            check=False,
            capture_output=True,
            text=True,
            timeout=180,
        )
    except (OSError, subprocess.TimeoutExpired) as error:
        errors.append(f"Runtime MODFLOW install failed: {error}")
        return None
    if completed.returncode != 0:
        output = "\n".join(part for part in [completed.stdout, completed.stderr] if part).strip()
        errors.append(f"Runtime MODFLOW install exited {completed.returncode}: {output[-1000:]}")
        return None
    target.chmod(target.stat().st_mode | 0o755)
    return target if target.exists() else None


def run_top_view_model(scenario: Any) -> dict[str, Any]:
    """Build, run, and export a scenario-specific FloPy/MODFLOW 6 model."""

    executable = resolve_modflow_executable()
    with tempfile.TemporaryDirectory(prefix="aquasmart_modflow_") as workspace:
        root = Path(workspace)
        baseline_workspace = root / "baseline"
        scenario_workspace = root / "scenario"
        _build_simulation(scenario, baseline_workspace, executable, pumping_enabled=False)
        _build_simulation(scenario, scenario_workspace, executable, pumping_enabled=True)
        _run_simulation(baseline_workspace, executable)
        _run_simulation(scenario_workspace, executable)
        return _export_frontend_json(scenario_workspace, baseline_workspace, scenario)


def _run_simulation(workspace: Path, executable: str) -> None:
    try:
        simulation = flopy.mf6.MFSimulation.load(
            sim_ws=workspace,
            exe_name=executable,
            verbosity_level=0,
        )
        success, output = simulation.run_simulation(silent=True)
    except OSError as error:
        raise ModflowExecutionError(f"MODFLOW 6 could not start from {executable}: {error}") from error
    if not success:
        tail = "\n".join(output[-20:]) if isinstance(output, list) else str(output)
        raise ModflowExecutionError(f"MODFLOW 6 failed for {workspace.name}.\n{tail}")


def _build_simulation(
    scenario: Any,
    workspace: Path,
    executable: str,
    pumping_enabled: bool,
) -> None:
    nlay = int(scenario.grid.layers)
    nrow = int(scenario.grid.rows)
    ncol = int(scenario.grid.columns)
    delr = float(scenario.grid.gridSizeM)
    delc = float(scenario.grid.gridSizeM)
    top, bottoms = _layer_elevations(scenario, nlay)
    starting_heads = _starting_heads(scenario, nlay, nrow, ncol)
    hk, vk = _hydraulic_conductivity(scenario, nlay)

    simulation_name = "aqsmart_scenario"
    simulation = flopy.mf6.MFSimulation(
        sim_name=simulation_name,
        exe_name=executable,
        version="mf6",
        sim_ws=workspace,
    )
    flopy.mf6.ModflowTdis(
        simulation,
        time_units="DAYS",
        nper=1,
        perioddata=[(1.0, 1, 1.0)],
    )
    flopy.mf6.ModflowIms(
        simulation,
        complexity="SIMPLE",
        linear_acceleration="BICGSTAB",
        outer_dvclose=1e-4,
        inner_dvclose=1e-4,
        outer_maximum=100,
        inner_maximum=100,
    )
    model = flopy.mf6.ModflowGwf(
        simulation,
        modelname=simulation_name,
        save_flows=True,
        newtonoptions="NEWTON",
    )
    flopy.mf6.ModflowGwfdis(
        model,
        nlay=nlay,
        nrow=nrow,
        ncol=ncol,
        delr=delr,
        delc=delc,
        top=top,
        botm=bottoms,
        idomain=np.ones((nlay, nrow, ncol), dtype=int),
    )
    flopy.mf6.ModflowGwfic(model, strt=starting_heads)
    flopy.mf6.ModflowGwfnpf(
        model,
        icelltype=1,
        k=hk,
        k33=vk,
        save_specific_discharge=True,
        save_saturation=True,
    )
    flopy.mf6.ModflowGwfsto(
        model,
        iconvert=1,
        ss=1e-5,
        sy=_specific_yield(scenario, nlay),
        steady_state={0: True},
        transient={0: False},
    )
    _add_constant_head_boundaries(model, scenario, nlay, nrow, ncol)
    _add_recharge(model, scenario, nrow, ncol)
    stream_cells = _stream_cells(nrow, ncol)
    if scenario.boundary.type == "river":
        _add_river(model, scenario, stream_cells)
    if pumping_enabled and scenario.dischargeM3Day > 0:
        _add_wells(model, scenario, nlay, nrow, ncol)

    flopy.mf6.ModflowGwfoc(
        model,
        head_filerecord=f"{simulation_name}.hds",
        budget_filerecord=f"{simulation_name}.cbc",
        saverecord=[("HEAD", "ALL"), ("BUDGET", "ALL")],
    )
    simulation.write_simulation(silent=True)


def _layer_elevations(scenario: Any, nlay: int) -> tuple[float, list[float]]:
    reference_head = max(
        float(scenario.boundary.groundwaterElevation),
        float(scenario.boundary.riverElevation),
        1.0,
    )
    total_thickness = max(30.0 * nlay, 0.35 * reference_head, 45.0)
    top = reference_head + max(5.0, total_thickness * 0.08)
    layer_weights = np.array([0.4, 0.22, 0.38][:nlay], dtype=float)
    if len(layer_weights) < nlay:
        layer_weights = np.ones(nlay, dtype=float)
    layer_weights = layer_weights / layer_weights.sum()
    thicknesses = layer_weights * total_thickness
    return float(top), [float(top - thicknesses[: index + 1].sum()) for index in range(nlay)]


def _starting_heads(scenario: Any, nlay: int, nrow: int, ncol: int) -> np.ndarray:
    left_head, right_head = _edge_heads(scenario)
    gradient = np.linspace(left_head, right_head, ncol, dtype=float)
    heads = np.repeat(gradient[np.newaxis, :], nrow, axis=0)
    return np.repeat(heads[np.newaxis, :, :], nlay, axis=0)


def _edge_heads(scenario: Any) -> tuple[float, float]:
    base = float(scenario.boundary.groundwaterElevation)
    river = float(scenario.boundary.riverElevation)
    gradient = max(0.5, abs(river - base) * 0.25, 2.0)
    if scenario.boundary.type == "river":
        base = (base + river) / 2.0
    if scenario.boundary.direction == "right-to-left":
        return base - gradient, base + gradient
    return base + gradient, base - gradient


def _hydraulic_conductivity(scenario: Any, nlay: int) -> tuple[np.ndarray, np.ndarray]:
    hk = np.zeros(nlay, dtype=float)
    vk = np.zeros(nlay, dtype=float)
    for layer in range(nlay):
        soil_name = scenario.soilsByLevel.get(str(layer + 1), "loam")
        props = SOIL_PROPERTIES.get(soil_name, SOIL_PROPERTIES["loam"])
        hk[layer] = props["k"]
        vk[layer] = props["k33"]
    return hk, vk


def _specific_yield(scenario: Any, nlay: int) -> np.ndarray:
    sy = np.zeros(nlay, dtype=float)
    for layer in range(nlay):
        soil_name = scenario.soilsByLevel.get(str(layer + 1), "loam")
        sy[layer] = SOIL_PROPERTIES.get(soil_name, SOIL_PROPERTIES["loam"])["sy"]
    return sy


def _add_constant_head_boundaries(model: Any, scenario: Any, nlay: int, nrow: int, ncol: int) -> None:
    left_head, right_head = _edge_heads(scenario)
    stress_period_data = []
    for layer in range(nlay):
        for row in range(nrow):
            stress_period_data.append(((layer, row, 0), left_head))
            stress_period_data.append(((layer, row, ncol - 1), right_head))
    flopy.mf6.ModflowGwfchd(model, stress_period_data=stress_period_data, pname="CHD")


def _add_recharge(model: Any, scenario: Any, nrow: int, ncol: int) -> None:
    if not scenario.recharge.enabled or scenario.recharge.rateMmDay <= 0:
        return
    recharge_m_day = float(scenario.recharge.rateMmDay) / 1000.0
    if scenario.recharge.zoneMode == "zoned":
        recharge = np.full((nrow, ncol), recharge_m_day * 0.65, dtype=float)
        recharge[:, : max(1, ncol // 3)] = recharge_m_day
        recharge[:, -max(1, ncol // 3) :] = recharge_m_day * 0.35
    else:
        recharge = np.full((nrow, ncol), recharge_m_day, dtype=float)
    flopy.mf6.ModflowGwfrcha(model, recharge=recharge, pname="RCH")


def _stream_cells(nrow: int, ncol: int) -> list[tuple[int, int, int]]:
    row = nrow // 2
    return [(0, row, col) for col in range(ncol)]


def _add_river(model: Any, scenario: Any, stream_cells: list[tuple[int, int, int]]) -> None:
    river_stage = float(scenario.boundary.riverElevation)
    conductance = max(
        0.001,
        abs(float(scenario.boundary.streamLeakage)) * 1000.0,
        STREAMBED_CONDUCTANCE_M2_DAY * 1000.0,
    )
    river_bottom = river_stage - 2.0
    stress_period_data = [
        (cell, river_stage, conductance, river_bottom)
        for cell in stream_cells
    ]
    flopy.mf6.ModflowGwfriv(model, stress_period_data=stress_period_data, pname="RIV")


def _add_wells(model: Any, scenario: Any, nlay: int, nrow: int, ncol: int) -> None:
    row, col = _well_row_col(scenario, nrow, ncol)
    screened_layers = [
        layer - 1
        for layer in scenario.screens
        if 1 <= layer <= nlay
    ]
    if not screened_layers:
        screened_layers = [min(int(scenario.layerIndex), nlay - 1)]
    rate = -float(scenario.dischargeM3Day) / len(screened_layers)
    stress_period_data = [
        ((layer, row, col), rate)
        for layer in screened_layers
    ]
    flopy.mf6.ModflowGwfwel(model, stress_period_data=stress_period_data, pname="WEL")


def _well_row_col(scenario: Any, nrow: int, ncol: int) -> tuple[int, int]:
    if scenario.well is None:
        return nrow // 2, ncol // 2
    x_fraction = min(0.999999, max(0.0, float(scenario.well.x) / 60000.0))
    y_fraction = min(0.999999, max(0.0, float(scenario.well.y) / 25000.0))
    col = int(x_fraction * ncol)
    row = int((1.0 - y_fraction) * nrow)
    return min(nrow - 1, max(0, row)), min(ncol - 1, max(0, col))


def _export_frontend_json(
    scenario_workspace: Path,
    baseline_workspace: Path,
    scenario: Any,
) -> dict[str, Any]:
    model_name = "aqsmart_scenario"
    simulation = flopy.mf6.MFSimulation.load(sim_ws=scenario_workspace, verbosity_level=0)
    model = simulation.get_model(model_name)
    grid = model.modelgrid
    nlay = int(grid.nlay)
    nrow = int(grid.nrow)
    ncol = int(grid.ncol)

    heads = np.asarray(
        flopy.utils.HeadFile(scenario_workspace / f"{model_name}.hds").get_data(),
        dtype=float,
    )
    baseline_heads = np.asarray(
        flopy.utils.HeadFile(baseline_workspace / f"{model_name}.hds").get_data(),
        dtype=float,
    )
    budget = flopy.utils.CellBudgetFile(scenario_workspace / f"{model_name}.cbc", precision="double")
    spdis = budget.get_data(text="DATA-SPDIS")[-1]
    qx = np.asarray(spdis["qx"], dtype=float).reshape(nlay, nrow, ncol)
    qy = np.asarray(spdis["qy"], dtype=float).reshape(nlay, nrow, ncol)
    qz = np.asarray(spdis["qz"], dtype=float).reshape(nlay, nrow, ncol)

    vertices, cells = _structured_grid_geometry(nrow, ncol, float(grid.delr[0]), float(grid.delc[0]))
    x_centers = np.asarray([cell["center"][0] for cell in cells], dtype=float)
    y_centers = np.asarray([cell["center"][1] for cell in cells], dtype=float)

    layers = []
    for layer in range(nlay):
        layer_heads = heads[layer].reshape(-1)
        layer_baseline = baseline_heads[layer].reshape(-1)
        drawdown = np.maximum(0.0, layer_baseline - layer_heads)
        layers.append(
            {
                "index": layer,
                "name": LAYER_NAMES[layer] if layer < len(LAYER_NAMES) else f"Layer {layer + 1}",
                "head": _compact(layer_heads),
                "baselineHead": _compact(layer_baseline),
                "drawdown": _compact(drawdown),
                "qx": _compact(qx[layer].reshape(-1), 7),
                "qy": _compact(qy[layer].reshape(-1), 7),
                "qz": _compact(qz[layer].reshape(-1), 7),
                "contours": _contour_paths(x_centers, y_centers, layer_heads),
            }
        )

    active_layer = min(max(int(scenario.layerIndex), 0), nlay - 1)
    active_drawdown = np.asarray(layers[active_layer]["drawdown"], dtype=float)
    return {
        "schema": "aquasmart.modflowPlanView.v1",
        "source": {
            "simulation": model_name,
            "solver": "MODFLOW 6",
            "processor": f"FloPy {flopy.__version__}",
            "state": "scenario steady state",
        },
        "domain": {
            "xmin": 0.0,
            "xmax": round(float(ncol * grid.delr[0]), 2),
            "ymin": 0.0,
            "ymax": round(float(nrow * grid.delc[0]), 2),
        },
        "grid": {
            "type": "DIS",
            "vertices": vertices,
            "cells": cells,
        },
        "layers": layers,
        "wells": [_well_summary(scenario, nrow, ncol, float(grid.delr[0]), float(grid.delc[0]))],
        "streamCells": [_cell_index(row, col, ncol) for _, row, col in _stream_cells(nrow, ncol)]
        if scenario.boundary.type == "river"
        else [],
        "derived": {
            "areaOfInfluenceCells": [
                index for index, value in enumerate(active_drawdown) if value >= max(0.05, active_drawdown.max() * 0.1)
            ],
            "flowVectors": _sample_flow_vectors(cells, qx[active_layer], qy[active_layer], ncol),
            "waterBudget": _water_budget_summary(budget),
        },
        "scenario": scenario.model_dump(),
    }


def _structured_grid_geometry(
    nrow: int,
    ncol: int,
    delr: float,
    delc: float,
) -> tuple[list[list[float]], list[dict[str, Any]]]:
    vertices = []
    vertex_index: dict[tuple[int, int], int] = {}
    for row in range(nrow + 1):
        y = (nrow - row) * delc
        for col in range(ncol + 1):
            vertex_index[(row, col)] = len(vertices)
            vertices.append([round(col * delr, 2), round(y, 2)])

    cells = []
    for row in range(nrow):
        for col in range(ncol):
            cells.append(
                {
                    "vertexIds": [
                        vertex_index[(row, col)],
                        vertex_index[(row, col + 1)],
                        vertex_index[(row + 1, col + 1)],
                        vertex_index[(row + 1, col)],
                    ],
                    "center": [
                        round((col + 0.5) * delr, 2),
                        round((nrow - row - 0.5) * delc, 2),
                    ],
                }
            )
    return vertices, cells


def _well_summary(scenario: Any, nrow: int, ncol: int, delr: float, delc: float) -> dict[str, Any]:
    row, col = _well_row_col(scenario, nrow, ncol)
    return {
        "id": scenario.wellId,
        "name": scenario.wellName,
        "x": round((col + 0.5) * delr, 2),
        "y": round((nrow - row - 0.5) * delc, 2),
        "rate": round(-float(scenario.dischargeM3Day), 2),
        "connections": [
            {"layer": layer - 1, "cell": _cell_index(row, col, ncol)}
            for layer in scenario.screens
            if 1 <= layer <= int(scenario.grid.layers)
        ],
    }


def _cell_index(row: int, col: int, ncol: int) -> int:
    return row * ncol + col


def _compact(values: np.ndarray, digits: int = 5) -> list[float]:
    return np.round(np.asarray(values, dtype=float), digits).tolist()


def _sample_flow_vectors(cells: list[dict[str, Any]], qx: np.ndarray, qy: np.ndarray, ncol: int) -> list[dict[str, float]]:
    flat_qx = qx.reshape(-1)
    flat_qy = qy.reshape(-1)
    step = max(1, int(math.sqrt(len(cells) / 80)))
    vectors = []
    for index in range(0, len(cells), step):
        row = index // ncol
        col = index % ncol
        if row % step != 0 or col % step != 0:
            continue
        vectors.append(
            {
                "x": cells[index]["center"][0],
                "y": cells[index]["center"][1],
                "qx": round(float(flat_qx[index]), 7),
                "qy": round(float(flat_qy[index]), 7),
            }
        )
    return vectors


def _water_budget_summary(budget: Any) -> dict[str, float]:
    summary: dict[str, float] = {}
    for record_name in budget.get_unique_record_names():
        if isinstance(record_name, bytes):
            text = record_name.decode("utf-8", errors="ignore").strip()
        else:
            text = str(record_name).strip()
        if not text or text == "DATA-SPDIS":
            continue
        try:
            data = budget.get_data(text=text)[-1]
        except Exception:
            continue
        if hasattr(data, "dtype") and data.dtype.names and {"q", "node"}.issubset(data.dtype.names):
            summary[text] = round(float(np.asarray(data["q"], dtype=float).sum()), 5)
    return summary


def _contour_paths(x: np.ndarray, y: np.ndarray, values: np.ndarray) -> list[dict[str, Any]]:
    try:
        import matplotlib

        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
        import matplotlib.tri as mtri
    except ImportError:
        return []

    finite = np.isfinite(values)
    if finite.sum() < 3:
        return []
    low = float(np.nanmin(values[finite]))
    high = float(np.nanmax(values[finite]))
    if np.isclose(low, high):
        return []
    levels = np.linspace(low, high, 8)[1:-1]
    triangulation = mtri.Triangulation(x[finite], y[finite])
    figure, axis = plt.subplots()
    contour_set = axis.tricontour(triangulation, values[finite], levels=levels)
    paths: list[dict[str, Any]] = []
    for level, segments in zip(contour_set.levels, contour_set.allsegs):
        for segment in segments:
            if len(segment) >= 2:
                paths.append({"level": round(float(level), 2), "points": np.round(segment, 2).tolist()})
    plt.close(figure)
    return paths
