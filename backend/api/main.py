import copy
import json
import os
import traceback
from collections import OrderedDict
from time import perf_counter
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator, model_validator
from dotenv import load_dotenv

from .modflow_runner import ModflowExecutionError, modflow_diagnostics, run_top_view_model


load_dotenv()

SIMULATION_CACHE_SIZE = int(os.getenv("SIMULATION_CACHE_SIZE", "32"))
MAX_GRID_ROWS = int(os.getenv("MAX_GRID_ROWS", "50"))
MAX_GRID_COLUMNS = int(os.getenv("MAX_GRID_COLUMNS", "50"))
MAX_GRID_CELLS = int(os.getenv("MAX_GRID_CELLS", "2500"))
MIN_GRID_SIZE_M = float(os.getenv("MIN_GRID_SIZE_M", "5"))
MAX_GRID_SIZE_M = float(os.getenv("MAX_GRID_SIZE_M", "250"))
_top_view_cache: OrderedDict[str, dict[str, Any]] = OrderedDict()


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


def _scenario_cache_key(scenario: "TopViewScenarioRequest") -> str:
    return json.dumps(
        scenario.model_dump(mode="json"),
        sort_keys=True,
        separators=(",", ":"),
    )


def _get_cached_top_view(cache_key: str) -> dict[str, Any] | None:
    if SIMULATION_CACHE_SIZE <= 0:
        return None
    cached = _top_view_cache.get(cache_key)
    if cached is None:
        return None
    _top_view_cache.move_to_end(cache_key)
    result = copy.deepcopy(cached)
    result.setdefault("source", {})["cacheHit"] = True
    return result


def _set_cached_top_view(cache_key: str, result: dict[str, Any]) -> None:
    if SIMULATION_CACHE_SIZE <= 0:
        return
    _top_view_cache[cache_key] = copy.deepcopy(result)
    _top_view_cache.move_to_end(cache_key)
    while len(_top_view_cache) > SIMULATION_CACHE_SIZE:
        _top_view_cache.popitem(last=False)


class ScenarioGrid(BaseModel):
    rows: int = Field(ge=5, le=MAX_GRID_ROWS)
    columns: int = Field(ge=5, le=MAX_GRID_COLUMNS)
    areaKm2: float = Field(ge=0, le=10000)
    gridSizeM: float = Field(ge=MIN_GRID_SIZE_M, le=MAX_GRID_SIZE_M)
    layers: int = Field(ge=1, le=3)

    @model_validator(mode="after")
    def validate_grid_cell_count(self) -> "ScenarioGrid":
        if self.rows * self.columns > MAX_GRID_CELLS:
            raise ValueError(
                f"grid cell count must be {MAX_GRID_CELLS} or fewer for responsive MODFLOW runs"
            )
        expected_area = (self.rows * self.columns * self.gridSizeM * self.gridSizeM) / 1_000_000
        if abs(self.areaKm2 - expected_area) > max(0.001, expected_area * 0.02):
            raise ValueError("areaKm2 must match rows * columns * gridSizeM^2")
        return self


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

    @model_validator(mode="after")
    def validate_layer_references(self) -> "TopViewScenarioRequest":
        if self.layerIndex >= self.grid.layers:
            raise ValueError("layerIndex must be lower than grid.layers")
        invalid_screens = [screen for screen in self.screens if screen > self.grid.layers]
        if invalid_screens:
            raise ValueError("screens cannot reference layers deeper than grid.layers")
        if self.well and abs(self.well.pumpingRate - self.dischargeM3Day) > 1e-6:
            raise ValueError("well.pumpingRate must match dischargeM3Day")
        return self


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


@app.get("/simulation/modflow-health")
def simulation_modflow_health() -> dict[str, Any]:
    """Report whether the backend can find and execute MODFLOW 6."""
    try:
        diagnostics = modflow_diagnostics()
    except ModflowExecutionError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    return {
        "status": "ok",
        "modflow": diagnostics,
    }


@app.post("/simulation/top-view")
def top_view_scenario(scenario: TopViewScenarioRequest) -> dict[str, Any]:
    """Build and run a FloPy/MODFLOW model, then return frontend-ready JSON."""
    cache_key = _scenario_cache_key(scenario)
    cached = _get_cached_top_view(cache_key)
    if cached is not None:
        return cached

    started_at = perf_counter()
    try:
        result = run_top_view_model(scenario)
        result.setdefault("source", {})["runtimeSeconds"] = round(
            perf_counter() - started_at,
            3,
        )
        result["source"]["cacheHit"] = False
        _set_cached_top_view(cache_key, result)
        return result
    except ModflowExecutionError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    except Exception as error:
        detail = {
            "message": str(error),
            "type": type(error).__name__,
            "traceback": traceback.format_exc(limit=8),
        }
        raise HTTPException(status_code=500, detail=detail) from error
