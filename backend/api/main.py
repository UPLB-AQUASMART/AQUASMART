import os
from typing import Any
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
from dotenv import load_dotenv


load_dotenv()


class HealthResponse(BaseModel):
    status: str
    service: str
    storage: str


def _allowed_origins() -> list[str]:
    raw_origins = os.getenv(
        "FRONTEND_ORIGIN",
        "http://localhost:3000,http://localhost:8768,http://127.0.0.1:8768",
    )
    return [origin.strip() for origin in raw_origins.split(",") if origin.strip()]


class ScenarioGrid(BaseModel):
    rows: int = Field(ge=5, le=120)
    columns: int = Field(ge=5, le=120)
    areaKm2: float = Field(ge=1, le=60)
    gridSizeM: float = Field(ge=1, le=1000)
    layers: int = Field(ge=1, le=3)


class ScenarioBoundary(BaseModel):
    type: str
    direction: str
    groundwaterElevation: float = Field(ge=-500, le=1000)
    riverElevation: float = Field(ge=-500, le=1000)
    streamLeakage: float = Field(ge=-1, le=1)
    leakageDirection: str

    @field_validator("type")
    @classmethod
    def validate_boundary_type(cls, value: str) -> str:
        allowed = {"constant-head", "river", "recharge"}
        if value not in allowed:
            raise ValueError(f"boundary type must be one of {sorted(allowed)}")
        return value

    @field_validator("direction")
    @classmethod
    def validate_direction(cls, value: str) -> str:
        allowed = {"left-to-right", "right-to-left"}
        if value not in allowed:
            raise ValueError(f"direction must be one of {sorted(allowed)}")
        return value

    @field_validator("leakageDirection")
    @classmethod
    def validate_leakage_direction(cls, value: str) -> str:
        allowed = {"positive", "negative"}
        if value not in allowed:
            raise ValueError(f"leakageDirection must be one of {sorted(allowed)}")
        return value


class ScenarioRecharge(BaseModel):
    enabled: bool
    rateMmDay: float = Field(ge=0, le=1000)
    zoneMode: str

    @field_validator("zoneMode")
    @classmethod
    def validate_zone_mode(cls, value: str) -> str:
        allowed = {"uniform", "zoned", "variable"}
        if value not in allowed:
            raise ValueError(f"zoneMode must be one of {sorted(allowed)}")
        return value


class ScenarioWell(BaseModel):
    x: float
    y: float
    pumpingRate: float = Field(ge=0, le=100000)


class TopViewScenarioRequest(BaseModel):
    layerIndex: int = Field(ge=0, le=2)
    layerName: str
    wellId: str
    wellName: str
    well: ScenarioWell | None = None
    grid: ScenarioGrid
    boundary: ScenarioBoundary
    recharge: ScenarioRecharge
    screens: list[int]
    soilsByLevel: dict[str, str]
    dischargeM3Day: float = Field(ge=0, le=100000)

    @field_validator("screens")
    @classmethod
    def validate_screens(cls, value: list[int]) -> list[int]:
        cleaned = sorted(set(value))
        if not cleaned or any(level < 1 or level > 3 for level in cleaned):
            raise ValueError("screens must contain one or more levels from 1 to 3")
        return cleaned

    @field_validator("soilsByLevel")
    @classmethod
    def validate_soils(cls, value: dict[str, str]) -> dict[str, str]:
        allowed = {"sand", "loam", "clay", "silt", "gravel"}
        invalid = [soil for soil in value.values() if soil not in allowed]
        if invalid:
            raise ValueError(f"soil values must be one of {sorted(allowed)}")
        return value


SOIL_PROFILES = {
    "sand": {"influence": 0.68, "depth": 1.15},
    "loam": {"influence": 1.05, "depth": 0.9},
    "silt": {"influence": 1.22, "depth": 0.78},
    "clay": {"influence": 1.38, "depth": 0.66},
    "gravel": {"influence": 0.82, "depth": 1.02},
}


def _generated_topview_path() -> Path:
    return Path(__file__).resolve().parents[1] / "generated" / "modflow_topview.json"


def _load_topview_payload() -> dict[str, Any]:
    path = _generated_topview_path()
    return __import__("json").loads(path.read_text(encoding="utf-8"))


def _scenario_influence(scenario: TopViewScenarioRequest, cell: dict[str, Any], domain: dict[str, float]) -> tuple[float, float, float]:
    level = scenario.layerIndex + 1
    soil_name = scenario.soilsByLevel.get(str(level), "loam")
    soil = SOIL_PROFILES.get(soil_name, SOIL_PROFILES["loam"])
    domain_width = domain["xmax"] - domain["xmin"]
    domain_height = domain["ymax"] - domain["ymin"]
    well_x = domain["xmin"] + 0.5 * domain_width
    well_y = domain["ymin"] + 0.5 * domain_height
    if scenario.well:
        # The conceptual 3D model is 60 km by 25 km; map the selected well into
        # the MODFLOW exercise domain for a stable scenario location.
        well_x = domain["xmin"] + (scenario.well.x / 60000) * domain_width
        well_y = domain["ymin"] + (scenario.well.y / 25000) * domain_height

    cell_x, cell_y = cell["center"]
    dx = well_x - cell_x
    dy = well_y - cell_y
    distance = (dx * dx + dy * dy) ** 0.5
    radius = min(domain_width, domain_height) * (0.08 + 0.16 * soil["influence"])
    if radius <= 0:
        return 0.0, 0.0, 0.0
    if soil_name == "sand":
        influence = max(0.0, 1 - distance / radius) ** 0.9
    else:
        influence = __import__("math").exp(-(distance * distance) / (2 * radius * radius))
    direction_x = dx / distance if distance > 1e-6 else 0.0
    direction_y = dy / distance if distance > 1e-6 else 0.0
    return influence, direction_x, direction_y


def _apply_scenario(payload: dict[str, Any], scenario: TopViewScenarioRequest) -> dict[str, Any]:
    import copy
    import math

    result = copy.deepcopy(payload)
    layer = result["layers"][scenario.layerIndex]
    level = scenario.layerIndex + 1
    soil_name = scenario.soilsByLevel.get(str(level), "loam")
    soil = SOIL_PROFILES.get(soil_name, SOIL_PROFILES["loam"])
    screen_active = level in scenario.screens
    discharge_ratio = scenario.dischargeM3Day / 8000
    recharge_factor = scenario.recharge.rateMmDay / 138 if scenario.recharge.enabled else 0
    boundary_factor = 1.0
    if scenario.boundary.type == "river":
        boundary_factor = 0.86
    elif scenario.boundary.type == "recharge":
        boundary_factor = 1.12
    max_drawdown = discharge_ratio * 9.5 * soil["depth"] * boundary_factor if screen_active else 0
    if scenario.recharge.enabled:
        max_drawdown = max(0.0, max_drawdown - 0.8 * min(2.0, recharge_factor))

    magnitudes = [math.hypot(qx, qy) for qx, qy in zip(layer["qx"], layer["qy"])]
    baseline_flow = max(magnitudes or [1e-9], default=1e-9)
    flow_boost = discharge_ratio * baseline_flow * 1.15 * soil["depth"] if screen_active else 0
    if scenario.boundary.direction == "right-to-left":
        flow_boost *= -1

    adjusted_head = []
    adjusted_drawdown = []
    adjusted_qx = []
    adjusted_qy = []
    for index, cell in enumerate(result["grid"]["cells"]):
        influence, direction_x, direction_y = _scenario_influence(scenario, cell, result["domain"])
        drawdown = max_drawdown * influence
        adjusted_head.append(round(layer["head"][index] - drawdown, 5))
        adjusted_drawdown.append(round(max(0.0, layer["baselineHead"][index] - (layer["head"][index] - drawdown)), 5))
        adjusted_qx.append(round(layer["qx"][index] + direction_x * flow_boost * influence, 7))
        adjusted_qy.append(round(layer["qy"][index] + direction_y * flow_boost * influence, 7))

    layer["head"] = adjusted_head
    layer["drawdown"] = adjusted_drawdown
    layer["qx"] = adjusted_qx
    layer["qy"] = adjusted_qy
    result["source"]["state"] = "scenario steady state"
    result["source"]["processor"] = f"{result['source'].get('processor', 'FloPy')} + scenario validation"
    result["scenario"] = scenario.model_dump()
    result["scenario"]["screenActive"] = screen_active
    result["scenario"]["maximumDrawdownM"] = round(max_drawdown, 3)
    return result


app = FastAPI(
    title="AQUASMART API",
    description="Lightweight API for groundwater dashboard prototype data.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins(),
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
def health() -> dict[str, str]:
    return {
        "status": "ok",
        "service": "aquasmart-api",
        "storage": "supabase",
    }


@app.get("/simulation/demo")
def demo_simulation() -> dict[str, Any]:
    return {
        "project": "demo-farm",
        "mode": "precomputed-lightweight",
        "timesteps": ["2026-01", "2026-02", "2026-03"],
        "layers": {
            "terrain": "/storage/terrain/demo-terrain.json",
            "groundwater": "/storage/groundwater/demo-timesteps.json",
            "flowVectors": "/storage/flow/demo-vectors.json",
        },
    }


@app.post("/simulation/top-view")
def top_view_scenario(scenario: TopViewScenarioRequest) -> dict[str, Any]:
    """Validate a groundwater scenario and return MODFLOW/FloPy plan-view data.

    The prototype uses the existing FloPy-exported MODFLOW result as the base
    dataset, then applies the user scenario consistently on the server. When the
    production MODFLOW workspace is wired in, this endpoint is the boundary where
    the request should build/write/run the transient or steady-state model before
    exporting the same JSON shape back to the viewer.
    """
    payload = _load_topview_payload()
    return _apply_scenario(payload, scenario)
