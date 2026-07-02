# AQUASMART

Lightweight prototype for a geospatial groundwater monitoring dashboard.

## Cost Target

Keep the first version free-tier friendly:

- Vercel Hobby for the Next.js frontend.
- Supabase Free for auth, Postgres/PostGIS metadata, and small storage objects.
- Render Free for a prototype FastAPI service if a Python API is needed.
- Precomputed or very small groundwater model outputs for demos.

Avoid heavy live MODFLOW jobs, large timestep downloads, and storing dense simulation grids in Postgres during v1.

## Current Setup

The active frontend app is in `frontend/`.

Already configured:

- Next.js
- TypeScript
- Tailwind CSS
- React Three Fiber / Three.js / Drei
- D3 color scales
- Lucide React icons
- Radix Slider
- Supabase browser/server clients
- Supabase session middleware
- FastAPI backend scaffold in `backend/`
- FloPy / NumPy / Pandas backend dependencies
- Render Blueprint in `render.yaml`

## Project Structure

```text
AQUASMART/
  frontend/           Next.js React app
  backend/            Python backend workspace
    api/              FastAPI application package
    scripts/          Data/model generation scripts
    generated/        Lightweight generated demo data
    viewer/           Standalone local groundwater scene viewer
  render.yaml         Render Blueprint for the backend
  SETUP.md            Setup and deployment guide
```

## Local Development

Run the frontend and backend in separate terminal windows.

Backend:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
cp .env.example .env
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

Frontend:

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Local URLs:

- Frontend: `http://localhost:3000`
- Backend health check: `http://localhost:8000/health`
- Backend API docs: `http://localhost:8000/docs`

Local frontend environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
NEXT_PUBLIC_API_URL=http://localhost:8000
AQUASMART_API_URL=http://127.0.0.1:8000
```

Local backend environment variables:

```bash
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
FRONTEND_ORIGIN=http://localhost:3000
MODFLOW_EXE=bin/mf6
```

`/simulation/top-view` builds and runs a MODFLOW 6 model through FloPy. The
project includes a local macOS arm64 executable at `backend/bin/mf6`. On another
platform, install a compatible MODFLOW 6 executable on PATH, or set
`MODFLOW_EXE` to that binary.

Render production builds replace the local macOS `backend/bin/mf6` with a
Linux-compatible MODFLOW 6 executable during `render.yaml` build.

Keep `SUPABASE_SERVICE_ROLE_KEY` only on the backend. Never expose it in browser code or `NEXT_PUBLIC_*` variables.

Not yet added:

- Supabase schema/migrations
- 3D dashboard scene implementation

Add these only when the app needs them, keeping the prototype small and cheap.

See `SETUP.md` for local setup and deployment steps.
