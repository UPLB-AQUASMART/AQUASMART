#!/usr/bin/env python3
"""Export a completed MODFLOW 6/FloPy simulation for the web plan viewer."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import flopy
import numpy as np


LAYER_NAMES = ("Upper Aquifer", "Middle Aquifer", "Lower Aquifer")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--simulation-workspace", type=Path, required=True)
    parser.add_argument("--baseline-workspace", type=Path)
    parser.add_argument(
        "--output",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "generated" / "modflow_topview.json",
    )
    return parser.parse_args()


def compact(values: np.ndarray, digits: int = 5) -> list[float]:
    return np.round(np.asarray(values, dtype=float), digits).tolist()


def contour_paths(x: np.ndarray, y: np.ndarray, values: np.ndarray) -> list[dict]:
    """Create contour polylines once in Python so the browser remains lightweight."""
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
    paths: list[dict] = []
    for level, segments in zip(contour_set.levels, contour_set.allsegs):
        for segment in segments:
            if len(segment) >= 2:
                paths.append({"level": round(float(level), 2), "points": np.round(segment, 2).tolist()})
    plt.close(figure)
    return paths


def package_cells(model, package_name: str) -> list[int]:
    package = model.get_package(package_name)
    if package is None or package.packagedata is None:
        return []
    data = package.packagedata.get_data()
    return [int(row["cellid"][-1]) for row in data]


def export_top_view(simulation_workspace: Path, baseline_workspace: Path | None) -> dict:
    simulation = flopy.mf6.MFSimulation.load(sim_ws=simulation_workspace, verbosity_level=0)
    model = simulation.get_model()
    grid = model.modelgrid
    if grid.grid_type != "vertex":
        raise ValueError(f"Expected a DISV vertex grid, received {grid.grid_type!r}")

    head_path = simulation_workspace / f"{model.name}.hds"
    budget_path = simulation_workspace / f"{model.name}.cbc"
    layer_count = int(grid.nlay)
    heads = np.asarray(flopy.utils.HeadFile(head_path).get_data(), dtype=float).reshape(layer_count, -1)
    spdis = flopy.utils.CellBudgetFile(budget_path, precision="double").get_data(text="DATA-SPDIS")[-1]
    qx = np.asarray(spdis["qx"], dtype=float).reshape(layer_count, -1)
    qy = np.asarray(spdis["qy"], dtype=float).reshape(layer_count, -1)
    qz = np.asarray(spdis["qz"], dtype=float).reshape(layer_count, -1)

    baseline_heads = None
    if baseline_workspace:
        baseline_path = baseline_workspace / f"{model.name}.hds"
        if baseline_path.exists():
            baseline_heads = np.asarray(flopy.utils.HeadFile(baseline_path).get_data(), dtype=float).reshape(layer_count, -1)

    vertices = np.asarray(grid.verts, dtype=float)
    cells = []
    for center_x, center_y, vertex_ids in zip(grid.xcellcenters, grid.ycellcenters, grid.iverts):
        ids = [int(vertex_id) for vertex_id in vertex_ids]
        if len(ids) > 1 and ids[0] == ids[-1]:
            ids.pop()
        cells.append({"vertexIds": ids, "center": [round(float(center_x), 2), round(float(center_y), 2)]})

    layer_results = []
    for index in range(layer_count):
        baseline = baseline_heads[index] if baseline_heads is not None else heads[index]
        layer_results.append(
            {
                "index": index,
                "name": LAYER_NAMES[index] if index < len(LAYER_NAMES) else f"Layer {index + 1}",
                "head": compact(heads[index]),
                "baselineHead": compact(baseline),
                "drawdown": compact(np.maximum(0.0, baseline - heads[index])),
                "qx": compact(qx[index], 7),
                "qy": compact(qy[index], 7),
                "qz": compact(qz[index], 7),
                "contours": contour_paths(np.asarray(grid.xcellcenters), np.asarray(grid.ycellcenters), heads[index]),
            }
        )

    wells = []
    maw = model.get_package("maw")
    if maw is not None:
        package_data = maw.packagedata.get_data()
        connection_data = maw.connectiondata.get_data()
        period_data = maw.perioddata.get_data().get(0, [])
        rates = {int(row["ifno"]): float(row["mawsetting_data"]) for row in period_data if str(row["mawsetting"]).lower() == "rate"}
        for row in package_data:
            well_index = int(row["ifno"])
            connections = [connection for connection in connection_data if int(connection["ifno"]) == well_index]
            cell_index = int(connections[0]["cellid"][-1])
            wells.append(
                {
                    "id": f"MAW-{well_index + 1}",
                    "x": round(float(grid.xcellcenters[cell_index]), 2),
                    "y": round(float(grid.ycellcenters[cell_index]), 2),
                    "rate": round(rates.get(well_index, 0.0), 2),
                    "connections": [
                        {
                            "layer": int(connection["cellid"][0]),
                            "cell": int(connection["cellid"][-1]),
                            "screenTop": float(connection["scrn_top"]),
                            "screenBottom": float(connection["scrn_bot"]),
                        }
                        for connection in connections
                    ],
                }
            )

    return {
        "schema": "aquasmart.modflowPlanView.v1",
        "source": {
            "simulation": model.name,
            "solver": "MODFLOW 6",
            "processor": f"FloPy {flopy.__version__}",
            "state": "steady state",
        },
        "domain": {
            "xmin": round(float(vertices[:, 0].min()), 2),
            "xmax": round(float(vertices[:, 0].max()), 2),
            "ymin": round(float(vertices[:, 1].min()), 2),
            "ymax": round(float(vertices[:, 1].max()), 2),
        },
        "grid": {
            "type": "DISV",
            "vertices": np.round(vertices, 2).tolist(),
            "cells": cells,
        },
        "layers": layer_results,
        "wells": wells,
        "streamCells": package_cells(model, "sfr"),
    }


def main() -> None:
    args = parse_args()
    payload = export_top_view(args.simulation_workspace.resolve(), args.baseline_workspace.resolve() if args.baseline_workspace else None)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, separators=(",", ":")), encoding="utf-8")
    print(f"Exported {len(payload['grid']['cells'])} cells to {args.output}")


if __name__ == "__main__":
    main()
