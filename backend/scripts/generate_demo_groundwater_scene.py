"""Generate a lightweight 3D groundwater scene for browser viewing.

This is a conceptual starter model based on the sample block diagram:
- 60 km x 25 km x 0.8 km model domain
- 120 x 50 x 8 MODFLOW-style grid
- alternating aquifer/aquitard layers
- four wells and sampled groundwater-flow arrows

The output is intentionally compact JSON: enough geometry for a web viewer
without sending every MODFLOW cell to the browser.
"""

from __future__ import annotations

import argparse
import json
import warnings
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any

import flopy
import numpy as np
import pandas as pd


DOMAIN = {
    "lx_m": 60_000.0,
    "ly_m": 25_000.0,
    "top_m": 400.0,
    "bottom_m": -400.0,
    "grid": {"ncol": 120, "nrow": 50, "nlay": 8},
}


LAYER_TYPES = [
    "Upper Aquifer",
    "Upper Aquifer",
    "Confining Layer",
    "Middle Aquifer",
    "Middle Aquifer",
    "Confining Layer",
    "Lower Aquifer",
    "Lower Aquifer",
]


LAYER_COLORS = {
    "Upper Aquifer": "#1f9bef",
    "Middle Aquifer": "#158bd7",
    "Lower Aquifer": "#0d72bd",
    "Confining Layer": "#9a7b48",
    "Bedrock": "#686868",
}


@dataclass(frozen=True)
class Well:
    id: str
    role: str
    x_m: float
    y_m: float
    screen_top_m: float
    screen_bottom_m: float
    pumping_m3_day: float


WELLS = [
    Well("W-1", "Pumping", 10_000.0, 6_000.0, 372.0, 120.0, -4_200.0),
    Well("W-2", "Monitoring", 22_000.0, 10_000.0, 360.0, 155.0, 0.0),
    Well("W-3", "Pumping", 35_000.0, 13_000.0, 355.0, -210.0, -6_000.0),
    Well("W-4", "Monitoring", 51_000.0, 17_500.0, 335.0, -90.0, 0.0),
]


def build_flopy_shell() -> flopy.modflow.Modflow:
    """Create a tiny FloPy model object so metadata matches MODFLOW concepts.

    The script does not run MODFLOW. It creates a DIS package shell and then
    uses NumPy arrays for synthetic heads/flow suitable for a lightweight demo.
    """

    ncol = DOMAIN["grid"]["ncol"]
    nrow = DOMAIN["grid"]["nrow"]
    nlay = DOMAIN["grid"]["nlay"]
    with warnings.catch_warnings():
        warnings.filterwarnings("ignore", message="The program mf2005 does not exist or is not executable.")
        model = flopy.modflow.Modflow("aquasmart_demo", exe_name="mf2005")
    flopy.modflow.ModflowDis(
        model,
        nlay=nlay,
        nrow=nrow,
        ncol=ncol,
        delr=DOMAIN["lx_m"] / ncol,
        delc=DOMAIN["ly_m"] / nrow,
        top=DOMAIN["top_m"],
        botm=np.linspace(300.0, DOMAIN["bottom_m"], nlay),
    )
    return model


def terrain_surface(x: np.ndarray, y: np.ndarray) -> np.ndarray:
    x01 = x / DOMAIN["lx_m"]
    y01 = y / DOMAIN["ly_m"]
    ridges = 28.0 * np.sin(2.4 * np.pi * x01 + 0.45) + 18.0 * np.cos(3.2 * np.pi * y01)
    hills = 22.0 * np.sin(5.0 * np.pi * x01) * np.sin(2.0 * np.pi * y01)
    river_valley = -42.0 * np.exp(-((x01 - 0.72) ** 2 / 0.038 + (y01 - 0.62) ** 2 / 0.055))
    slope = 380.0 - 44.0 * x01 + 22.0 * y01
    return slope + ridges + hills + river_valley


def layer_surfaces(x: np.ndarray, y: np.ndarray) -> list[np.ndarray]:
    top = terrain_surface(x, y)
    x01 = x / DOMAIN["lx_m"]
    y01 = y / DOMAIN["ly_m"]
    structural_dip = -24.0 * x01 + 8.0 * (y01 - 0.5)
    long_wave = 18.0 * np.sin(2.0 * np.pi * x01 + 0.65)
    cross_wave = 7.0 * np.cos(2.4 * np.pi * y01)
    pumping_trough = -58.0 * np.exp(-((x01 - 0.6) ** 2 / 0.018 + (y01 - 0.52) ** 2 / 0.06))
    fold = structural_dip + long_wave + cross_wave + pumping_trough

    # Target layer-bottom elevations make the cutaway read like a geologic block
    # diagram instead of a shallow stack of nearly parallel surfaces.
    base_elevations = [315.0, 225.0, 180.0, 70.0, 10.0, -75.0, -205.0, -315.0]
    fold_strengths = [0.1, 0.22, 0.34, 0.46, 0.56, 0.68, 0.82, 1.0]

    surfaces = [top]
    previous = top
    for elevation, strength in zip(base_elevations, fold_strengths, strict=True):
        surface = elevation + fold * strength
        # Keep a minimum layer thickness even where terrain dips sharply.
        surface = np.minimum(surface, previous - 22.0)
        surfaces.append(surface)
        previous = surface
    return surfaces


def synthetic_heads(x: np.ndarray, y: np.ndarray, z: np.ndarray) -> np.ndarray:
    """Head field dominated by depth so downward/deep zones render warm."""

    x01 = x / DOMAIN["lx_m"]
    y01 = y / DOMAIN["ly_m"]
    z01 = (z - DOMAIN["bottom_m"]) / (DOMAIN["top_m"] - DOMAIN["bottom_m"])
    regional = 120.0 - 36.0 * x01 + 12.0 * y01
    depth_bonus = 150.0 * (1.0 - z01)
    pumping_warm_cone = np.zeros_like(regional)

    for well in WELLS:
        if well.pumping_m3_day >= 0:
            continue
        rx = (x - well.x_m) / 7_400.0
        ry = (y - well.y_m) / 4_800.0
        rz = np.clip((well.screen_top_m - z) / 520.0, 0.0, 1.0)
        pumping_warm_cone += abs(well.pumping_m3_day) / 6_000.0 * 36.0 * np.exp(-(rx**2 + ry**2)) * rz

    return regional + depth_bonus + pumping_warm_cone


def head_to_color(head: float, head_min: float, head_max: float) -> str:
    """Blue/cyan near lower values, yellow/orange/red for higher/deeper values."""

    stops = np.array(
        [
            [35, 102, 245],
            [49, 205, 214],
            [128, 229, 79],
            [255, 218, 40],
            [255, 132, 25],
            [217, 42, 38],
        ],
        dtype=float,
    )
    t = np.clip((head - head_min) / (head_max - head_min), 0.0, 1.0)
    scaled = t * (len(stops) - 1)
    low = int(np.floor(scaled))
    high = min(low + 1, len(stops) - 1)
    local_t = scaled - low
    rgb = np.round(stops[low] * (1.0 - local_t) + stops[high] * local_t).astype(int)
    return "#{:02x}{:02x}{:02x}".format(*rgb)


def layer_side_color(layer_type: str, head: np.ndarray, head_min: float, head_max: float) -> str:
    if layer_type == "Confining Layer":
        return LAYER_COLORS[layer_type]
    return LAYER_COLORS[layer_type]


def stride_indices(length: int, stride: int) -> np.ndarray:
    indices = list(range(0, length, stride))
    if indices[-1] != length - 1:
        indices.append(length - 1)
    return np.array(indices, dtype=int)


def decimated_surface(
    name: str,
    x: np.ndarray,
    y: np.ndarray,
    z: np.ndarray,
    color: str | None = None,
    head: np.ndarray | None = None,
    head_min: float | None = None,
    head_max: float | None = None,
    stride: int = 5,
) -> dict[str, Any]:
    row_idx = stride_indices(x.shape[0], stride)
    col_idx = stride_indices(x.shape[1], stride)
    xs = x[np.ix_(row_idx, col_idx)]
    ys = y[np.ix_(row_idx, col_idx)]
    zs = z[np.ix_(row_idx, col_idx)]
    vertices = np.column_stack([xs.ravel(), ys.ravel(), zs.ravel()])
    rows, cols = xs.shape

    faces = []
    for row in range(rows - 1):
        for col in range(cols - 1):
            a = row * cols + col
            b = a + 1
            c = a + cols
            d = c + 1
            faces.append([a, c, b])
            faces.append([b, c, d])

    payload: dict[str, Any] = {
        "name": name,
        "vertices": np.round(vertices, 2).tolist(),
        "faces": faces,
    }
    if color:
        payload["color"] = color
    if head is not None:
        h = head[np.ix_(row_idx, col_idx)]
        h_min = float(np.nanmin(head) if head_min is None else head_min)
        h_max = float(np.nanmax(head) if head_max is None else head_max)
        payload["vertexColors"] = [head_to_color(float(value), h_min, h_max) for value in h.ravel()]
    return payload


def cutaway_surface(
    name: str,
    top: np.ndarray,
    bottom: np.ndarray,
    x: np.ndarray,
    y: np.ndarray,
    edge: str,
    color: str | None = None,
    head_min: float | None = None,
    head_max: float | None = None,
    stride: int = 5,
) -> dict[str, Any]:
    """Build a vertical edge strip between two layer surfaces."""

    if edge == "south":
        col_idx = stride_indices(x.shape[1], stride)
        top_line = top[0, col_idx]
        bottom_line = bottom[0, col_idx]
        x_line = x[0, col_idx]
        y_line = y[0, col_idx]
    elif edge == "north":
        col_idx = stride_indices(x.shape[1], stride)
        top_line = top[-1, col_idx]
        bottom_line = bottom[-1, col_idx]
        x_line = x[-1, col_idx]
        y_line = y[-1, col_idx]
    elif edge == "west":
        row_idx = stride_indices(x.shape[0], stride)
        top_line = top[row_idx, 0]
        bottom_line = bottom[row_idx, 0]
        x_line = x[row_idx, 0]
        y_line = y[row_idx, 0]
    elif edge == "east":
        row_idx = stride_indices(x.shape[0], stride)
        top_line = top[row_idx, -1]
        bottom_line = bottom[row_idx, -1]
        x_line = x[row_idx, -1]
        y_line = y[row_idx, -1]
    else:
        raise ValueError(f"Unsupported cutaway edge: {edge}")

    vertices = []
    vertex_colors = []
    for x_value, y_value, top_z, bottom_z in zip(x_line, y_line, top_line, bottom_line, strict=True):
        vertices.append([float(x_value), float(y_value), float(top_z)])
        vertices.append([float(x_value), float(y_value), float(bottom_z)])
        if color is None:
            assert head_min is not None and head_max is not None
            top_head = synthetic_heads(np.array(x_value), np.array(y_value), np.array(top_z))
            bottom_head = synthetic_heads(np.array(x_value), np.array(y_value), np.array(bottom_z))
            vertex_colors.append(head_to_color(float(top_head), head_min, head_max))
            vertex_colors.append(head_to_color(float(bottom_head), head_min, head_max))

    faces = []
    for col in range(len(x_line) - 1):
        a = col * 2
        b = a + 1
        c = a + 2
        d = a + 3
        faces.append([a, b, c])
        faces.append([c, b, d])

    payload: dict[str, Any] = {
        "name": name,
        "edge": edge,
        "vertices": np.round(np.array(vertices), 2).tolist(),
        "faces": faces,
    }
    if color:
        payload["color"] = color
    else:
        payload["vertexColors"] = vertex_colors
    return payload


def build_flow_arrows(x: np.ndarray, y: np.ndarray, surfaces: list[np.ndarray]) -> list[dict[str, Any]]:
    arrows: list[dict[str, Any]] = []
    sample_cols = np.linspace(12, x.shape[1] - 14, 9, dtype=int)
    sample_rows = np.linspace(8, x.shape[0] - 9, 4, dtype=int)
    layer_pairs = [(1, 2), (3, 4), (6, 7)]

    for layer_top_idx, layer_bottom_idx in layer_pairs:
        mid_z = (surfaces[layer_top_idx] + surfaces[layer_bottom_idx]) / 2.0
        head = synthetic_heads(x, y, mid_z)
        grad_y, grad_x = np.gradient(head)
        vertical_bias = -0.28 if layer_top_idx >= 3 else -0.12

        for row in sample_rows:
            for col in sample_cols:
                gx = -float(grad_x[row, col])
                gy = -float(grad_y[row, col])
                magnitude = max((gx * gx + gy * gy) ** 0.5, 1e-6)
                arrows.append(
                    {
                        "start": [
                            round(float(x[row, col]), 2),
                            round(float(y[row, col]), 2),
                            round(float(mid_z[row, col]), 2),
                        ],
                        "direction": [
                            round(gx / magnitude, 4),
                            round(gy / magnitude, 4),
                            vertical_bias,
                        ],
                        "length_m": 1_900,
                        "color": "#ffffff",
                    }
                )
    return arrows


def build_scene() -> dict[str, Any]:
    model = build_flopy_shell()
    ncol = DOMAIN["grid"]["ncol"]
    nrow = DOMAIN["grid"]["nrow"]
    x_values = np.linspace(0.0, DOMAIN["lx_m"], ncol)
    y_values = np.linspace(0.0, DOMAIN["ly_m"], nrow)
    x, y = np.meshgrid(x_values, y_values)
    surfaces = layer_surfaces(x, y)
    layer_heads = []
    for idx in range(len(LAYER_TYPES)):
        mid = (surfaces[idx] + surfaces[idx + 1]) / 2.0
        layer_heads.append(synthetic_heads(x, y, mid))

    global_head_min = float(min(np.nanmin(head) for head in layer_heads))
    global_head_max = float(max(np.nanmax(head) for head in layer_heads))

    layers = []
    cutaway_faces = []
    visible_edges = ["south", "north", "east", "west"]
    for idx, layer_type in enumerate(LAYER_TYPES):
        mid = (surfaces[idx] + surfaces[idx + 1]) / 2.0
        heads = layer_heads[idx]
        layer_side = layer_side_color(layer_type, heads, global_head_min, global_head_max)
        layers.append(
            {
                "index": idx + 1,
                "type": layer_type,
                "sideColor": layer_side,
                "topSurface": decimated_surface(
                    f"Layer {idx + 1} top",
                    x,
                    y,
                    surfaces[idx],
                    color=LAYER_COLORS[layer_type],
                ),
                "headSurface": decimated_surface(
                    f"Layer {idx + 1} hydraulic head",
                    x,
                    y,
                    mid,
                    head=heads,
                    head_min=global_head_min,
                    head_max=global_head_max,
                ),
            }
        )
        for edge in visible_edges:
            cutaway_faces.append(
                cutaway_surface(
                    f"Layer {idx + 1} {edge} cutaway",
                    surfaces[idx],
                    surfaces[idx + 1],
                    x,
                    y,
                    edge,
                    color=LAYER_COLORS[layer_type],
                    head_min=global_head_min,
                    head_max=global_head_max,
                )
            )

    bedrock_top = surfaces[-1] - 55.0
    bedrock_bottom = np.full_like(bedrock_top, DOMAIN["bottom_m"])
    for edge in visible_edges:
        cutaway_faces.append(
            cutaway_surface(
                f"Bedrock {edge} cutaway",
                bedrock_top,
                bedrock_bottom,
                x,
                y,
                edge,
                color=LAYER_COLORS["Bedrock"],
            )
        )

    well_frame = pd.DataFrame([asdict(well) for well in WELLS])

    return {
        "schema": "aquasmart.groundwaterScene.v1",
        "source": {
            "kind": "synthetic_floPy_modflow_style_demo",
            "modflowModelName": model.name,
            "note": "Conceptual sample derived from the provided hydrogeologic block diagram; MODFLOW is not executed.",
        },
        "domain": DOMAIN,
        "legend": {
            "layerColors": LAYER_COLORS,
            "headColorRule": "Higher/deeper/downward-flow zones trend red-orange; shallower zones are lighter/cooler.",
            "headRangeM": [round(global_head_min, 2), round(global_head_max, 2)],
        },
        "terrain": decimated_surface("Terrain", x, y, surfaces[0], color="#6ea45a", stride=4),
        "layers": layers,
        "cutawayFaces": cutaway_faces,
        "bedrock": decimated_surface("Bedrock", x, y, bedrock_top, color=LAYER_COLORS["Bedrock"]),
        "base": decimated_surface(
            "Model base",
            x,
            y,
            np.full_like(x, DOMAIN["bottom_m"]),
            color="#4f4f4f",
        ),
        "flowArrows": build_flow_arrows(x, y, surfaces),
        "wells": well_frame.to_dict(orient="records"),
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--output",
        default="generated/demo_groundwater_scene.json",
        help="Path to write compact scene JSON.",
    )
    args = parser.parse_args()

    scene = build_scene()
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(scene, separators=(",", ":"), ensure_ascii=False), encoding="utf-8")

    size_kb = output.stat().st_size / 1024
    print(f"Wrote {output} ({size_kb:.1f} KB)")
    print(f"Layers: {len(scene['layers'])}; flow arrows: {len(scene['flowArrows'])}; wells: {len(scene['wells'])}")


if __name__ == "__main__":
    main()
