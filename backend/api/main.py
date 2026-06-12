import os
from typing import Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv


load_dotenv()


class HealthResponse(BaseModel):
    status: str
    service: str
    storage: str


def _allowed_origins() -> list[str]:
    raw_origins = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")
    return [origin.strip() for origin in raw_origins.split(",") if origin.strip()]


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
