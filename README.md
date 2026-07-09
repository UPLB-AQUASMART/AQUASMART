# AQUASMART Mini

AQUASMART Mini is a smart agricultural water-management prototype for groundwater monitoring, weather-aware irrigation planning, and education-focused simulation. It combines a Next.js public site, interactive dashboards, Three.js groundwater visualizations, and a Python/FastAPI backend that can run lightweight MODFLOW 6 scenarios through FloPy.

The project is designed for farmers, students, researchers, and water managers who need a clear way to connect field conditions, weather forecasts, aquifer behavior, and irrigation decisions.

## Key Features

- **Agricultural water-intelligence site** with home, about, modules, team, partners, contact, forecast, and simulation pages.
- **Groundwater simulation dashboard** for adding wells, adjusting discharge, reviewing safe-yield utilization, drawdown, recovery time, and water-quality indicators.
- **Interactive groundwater model viewer** with Three.js-based 3D, section, and plan-view experiences for aquifer layers, wells, recharge, river boundaries, soil types, screens, and MODFLOW top-view outputs.
- **Live weather forecast dashboard** using Open-Meteo data from the user's browser location, including rainfall, temperature, humidity, precipitation projections, rain probability, and evapotranspiration demand.
- **Irrigation schedule planner** that combines weather data with crop, field area, soil type, soil moisture target, irrigation method, and efficiency inputs to generate weekly/monthly recommendations.
- **Schedule export support** for field-ready irrigation recommendation rows based on precipitation, crop ET demand, water balance, soil moisture, and irrigation volume.
- **Learning modules section** for groundwater monitoring, smart sensor networks, weather forecasting, irrigation planning, water quality, and decision dashboards.
- **Contact workflow** powered by Resend, with validation, team notification, and sender confirmation emails.
- **Supabase-ready foundation** for auth, Postgres/PostGIS metadata, row-level security, and lightweight storage buckets.
- **Free-tier-conscious deployment** using Vercel for the frontend and Render for the Python backend.

## Tech Stack

### Frontend

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- CSS Modules
- Three.js, React Three Fiber, and Drei
- Chart.js and React Chart.js 2
- D3 color scales
- Framer Motion, GSAP, and Lenis
- Lucide React and Iconify icons
- Supabase browser/server clients
- Resend contact email API
- Vercel Analytics and Speed Insights

### Backend

- FastAPI
- Pydantic
- Uvicorn
- FloPy
- MODFLOW 6
- NumPy, Pandas, and Matplotlib
- Supabase Python client
- Python dotenv

## Project Structure

```text
AQUASMART/
  frontend/                         Next.js application
    app/                            App Router pages, API routes, and UI components
    app/forecast/                   Open-Meteo forecast and analytics dashboards
    app/groundwater-viewer/         Next.js wrapper for the groundwater viewer
    app/simulation/                 Simulation landing, groundwater, and irrigation pages
    public/groundwater-viewer/      Standalone Three.js viewer scripts and assets
    public/generated/               Static fallback simulation data
  backend/                          Python backend workspace
    api/                            FastAPI app and MODFLOW runner
    generated/                      Generated groundwater demo/top-view JSON
    scripts/                        Data/model generation scripts
    viewer/                         Standalone local groundwater viewer
    bin/mf6                         Local MODFLOW 6 executable for macOS arm64
  output/docs/                      Architecture and audit notes
  DESIGN.md                         Visual design guide
  SETUP.md                          Detailed setup and deployment guide
  render.yaml                       Render backend Blueprint
```

## Main Application Areas

| Area | Route | Purpose |
| --- | --- | --- |
| Home | `/` | Public project overview, goals, weather preview, simulations, modules, team, and partners |
| About | `/about` | Project background with groundwater visual sections |
| Forecast | `/forecast` | Live weather analytics and irrigation-related climate signals |
| Simulations | `/simulation` | Simulation entry page with model views and boundary-condition context |
| Groundwater Simulation | `/simulation/groundwater` | Well placement, discharge, drawdown, and water-quality scenario dashboard |
| Groundwater Viewer | `/groundwater-viewer` | Interactive 3D/section/top-view aquifer model experience |
| Irrigation Planner | `/simulation/irrigation-schedule` | Weather-linked irrigation scenario setup, calendar, metrics, chart, and export actions |
| Modules | `/modules` | Learning module browser |
| Team | `/team` | Team explorer |
| Contact | `/contact` | Inquiry form backed by the Resend API route |
| Partners | `/partners` | Partner and sponsor page |

## Backend API

The Python API lives in `backend/api/main.py` and exposes:

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/health` | Backend health check |
| `GET` | `/simulation/demo` | Lightweight demo metadata |
| `GET` | `/simulation/modflow-health` | MODFLOW executable diagnostics |
| `GET` | `/simulation/demo-scene` | Canonical groundwater scene JSON |
| `GET` | `/simulation/top-view/base` | Seed MODFLOW top-view JSON |
| `POST` | `/simulation/top-view` | Validates a scenario, runs FloPy/MODFLOW 6, caches the result, and returns frontend-ready JSON |

The Next.js app also includes same-origin API routes under `frontend/app/api/` that proxy simulation requests to the Python backend and handle contact form email delivery.

## Local Development

Run the backend and frontend in separate terminals.

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
cp .env.example .env
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

Useful backend URLs:

- API health: `http://localhost:8000/health`
- API docs: `http://localhost:8000/docs`
- MODFLOW diagnostics: `http://localhost:8000/simulation/modflow-health`

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Useful frontend URL:

- App: `http://localhost:3000`

## Environment Variables

### Frontend

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
NEXT_PUBLIC_API_URL=http://localhost:8000
AQUASMART_API_URL=http://127.0.0.1:8000
RESEND_SECRET=your_resend_api_key
```

### Backend

```bash
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
FRONTEND_ORIGIN=http://localhost:3000
MODFLOW_EXE=bin/mf6
SIMULATION_CACHE_SIZE=32
MAX_GRID_ROWS=50
MAX_GRID_COLUMNS=50
MAX_GRID_CELLS=2500
MIN_GRID_SIZE_M=5
MAX_GRID_SIZE_M=250
```

Keep `SUPABASE_SERVICE_ROLE_KEY` only on the backend. Never expose it through browser code or `NEXT_PUBLIC_*` variables.

## MODFLOW Notes

The `/simulation/top-view` backend endpoint builds and runs a compact MODFLOW 6 model through FloPy. The repository includes a local macOS arm64 executable at `backend/bin/mf6`.

On another platform, install a compatible MODFLOW 6 executable on `PATH` or set `MODFLOW_EXE` to the correct binary. During Render builds, `render.yaml` removes the local macOS binary and downloads a Linux-compatible MODFLOW 6 executable.

To keep the prototype responsive and free-tier friendly, the API validates grid size and defaults to a small in-memory simulation cache.

## Deployment

The intended low-cost deployment model is:

- **Frontend:** Vercel Hobby, rooted at `frontend/`
- **Backend:** Render Free web service, rooted at `backend/`
- **Database/Auth/Storage:** Supabase Free

`render.yaml` contains the backend Blueprint, including Python version, build command, start command, health check path, and MODFLOW setup.

See `SETUP.md` for detailed account-side setup, Supabase notes, Render configuration, and deployment troubleshooting.

## Design Direction

The interface follows the AQUASMART Mini design guide in `DESIGN.md`: deep navy structure, aqua water-system accents, green sustainability cues, soft scientific surfaces, rounded controls, field imagery, and data-forward dashboards.

## Prototype Scope

This repository is intentionally lightweight. It favors compact JSON outputs, small model grids, precomputed demo data, and free-tier infrastructure. Heavy geospatial processing, dense timestep storage, and long-running MODFLOW workloads should be added only when the product needs them.

Known areas for future work include production Supabase migrations, real sensor ingestion, authenticated project workspaces, persistent simulation history, and larger geospatial model support.
