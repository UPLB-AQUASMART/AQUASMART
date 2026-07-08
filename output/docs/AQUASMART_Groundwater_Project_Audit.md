# AQUASMART Groundwater Project Audit

Source PDF converted with MarkItDown from the cloned GitHub repository:
`tmp/markitdown-conversion/markitdown`.

Converted Markdown:
`output/docs/AQUASMART_Groundwater_Architecture_Review.md`

## High-Level Finding

The converted architecture review is partly outdated compared with the current
project. The document says FastAPI is only a scaffold and scenario changes are
browser-side estimates. The current project now has a real FastAPI + FloPy +
MODFLOW 6 top-view execution path.

The 3D model and vertical 2D section are still conceptual visualizations. The
top-view scenario path now builds, runs, reads, and exports a MODFLOW result.

## Current Flow

1. `/simulation` opens the model through `SimulationModelEntry`.
2. The model iframe loads the Next route `/groundwater-viewer`.
3. `/groundwater-viewer` renders componentized viewer markup and loads public
   viewer scripts.
4. Viewer setup sends scenario JSON to `/api/simulation/top-view`.
5. Next forwards the request to FastAPI at `/simulation/top-view`.
6. FastAPI validates the request, runs FloPy/MODFLOW 6, reads outputs, and
   returns frontend-ready JSON.

## Backend Checklist Against Section 8.2

| Step | Status | Notes |
| --- | --- | --- |
| Receive scenario JSON | Yes | `frontend/app/api/simulation/top-view/route.ts` forwards to FastAPI. |
| Validate grid, layer, screens, pumping, boundaries | Yes | `backend/api/main.py` uses Pydantic and grid size limits. |
| Build model domain and layer elevations | Yes, simplified | `backend/api/modflow_runner.py` builds a structured DIS model from scenario grid values. |
| Apply initial head and active/inactive cells | Partial | Initial heads use a left/right gradient. `idomain` is all active cells. |
| Apply hydraulic properties from soil choices | Yes | Soil maps to `k`, `k33`, and `sy`. |
| Apply recharge, well, river/stream boundaries | Yes | Uses CHD, RCH, RIV, and WEL packages. |
| Run MODFLOW through FloPy | Yes | Runs baseline and scenario workspaces with `mf6`. |
| Read head and cell-budget output | Yes | Reads `.hds`, `.cbc`, and `DATA-SPDIS`. |
| Compute derived outputs | Yes | Exports drawdown, contours, flow vectors, area-of-influence cells, and water-budget summary. |
| Return frontend-ready JSON | Yes | Returns `aquasmart.modflowPlanView.v1`. |

## Verified Runtime Checks

- `backend/bin/mf6 -v` reports `mf6: 6.7.0 02/05/2026`.
- `GET /simulation/modflow-health` returns healthy diagnostics.
- Direct FastAPI scenario POST returned:
  - schema: `aquasmart.modflowPlanView.v1`
  - grid type: `DIS`
  - cells: `100` for the sample 10 x 10 run
  - source: MODFLOW 6 + FloPy 3.9.5
- Next proxy scenario POST also returned valid MODFLOW JSON.
- Repeated identical scenarios hit the FastAPI cache and returned quickly.
- `npm run build` passes.

## Important Differences From The Converted PDF

The PDF states:

- FastAPI is not involved in rendering or simulation requests.
- Browser-side scenario changes are estimates.
- Top-view base data is MODFLOW-derived, but slider changes do not rerun
  MODFLOW.

Current project state:

- FastAPI is involved for top-view scenario runs.
- Top-view scenario changes can now trigger a real MODFLOW run.
- The 3D and vertical 2D section remain conceptual/browser-rendered.
- The initial preloaded top-view JSON is still direct static JSON, but the
  scenario run path uses the backend.

## Issues To Fix Or Clarify

### 1. Layer naming mismatch

`backend/api/modflow_runner.py` uses:

```python
LAYER_NAMES = ("Upper Aquifer", "Confining Layer", "Lower Aquifer")
```

The UI and conceptual model treat selectable levels as:

- Upper Aquifer
- Middle Aquifer
- Lower Aquifer

This means a selected middle aquifer top-view result can be labeled as
`Confining Layer`. That is likely confusing and should be corrected.

### 2. WEL/RIV packages are labeled as MAW/SFR in the UI

The current backend uses:

- `ModflowGwfwel` for wells
- `ModflowGwfriv` for river boundaries

Some UI labels still say:

- `MODFLOW MAW well`
- `SFR stream cells`

Either the labels should be changed to WEL/RIV, or the backend should be
upgraded to MAW/SFR if those packages are required for the scientific story.

### 3. 3D and vertical 2D section are still conceptual

`backend/scripts/generate_demo_groundwater_scene.py` explicitly notes that
MODFLOW is not executed for the conceptual scene. The 2D section drawdown is
still a visual approximation. This is fine for demonstration, but should be
labeled clearly.

### 4. Static JSON is still used for initial loading

The viewer still loads:

- `/generated/demo_groundwater_scene.json`
- `/generated/modflow_topview.json`

The backend is used when the user runs a scenario. For production, direct JSON
loading could be replaced with API endpoints so validation, cache metadata, and
versioning are centralized.

### 5. Synchronous MODFLOW requests may become slow

The sample cached request is fast, but first-time runs can take seconds. Larger
grids could exceed normal request expectations. The PDF recommendation for a
job ID and polling/background worker is still valid for production.

### 6. Runtime MODFLOW installation is convenient but risky

`modflow_runner.py` can attempt runtime installation using
`flopy.utils.get_modflow`. That is helpful locally, but production should
prefer a pinned executable in the image or server environment.

## Recommended Next Actions

1. Fix layer labels so frontend aquifer levels match backend output.
2. Decide whether the science should be WEL/RIV or MAW/SFR, then align labels
   and backend packages.
3. Add visible UI wording that the 3D and vertical 2D views are conceptual.
4. Keep the real MODFLOW top-view path, but add job/polling support before
   large production scenarios.
5. Replace direct static top-view JSON loading with API-driven initial data when
   the backend is stable.
