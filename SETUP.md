# AQUASMART Setup

This project is set up for a free-tier-friendly prototype:

- Frontend: Next.js, TypeScript, Tailwind CSS, Supabase, React Three Fiber, Three.js, Drei, D3 color scales, Radix Slider, Lucide React.
- Backend: FastAPI, Uvicorn, Pydantic, Supabase Python client, FloPy, NumPy, Pandas.
- Database/Auth/Storage: Supabase Free.
- Deployment: Vercel Hobby for frontend, Render Free for backend.

Heavy optional geospatial packages such as Rasterio, GeoPandas, and SciPy are intentionally not installed by default. Add them only if the prototype truly needs them.

## Current Setup Status

Completed locally:

- Frontend dependencies installed in `frontend/package.json`.
- Backend scaffold created in `backend/`.
- Backend Python dependencies installed locally in `backend/.venv`.
- Supabase project `AQUASMART` configured.
- Frontend `.env.local` pointed at the Supabase `AQUASMART` project.
- Supabase PostGIS, tables, RLS policies, and v1 storage buckets created.
- Frontend lint/build verified.
- Backend import and `/health` verified.
- Render backend service configured and deployed from `main`.

Still requires account-side action:

- Render `SUPABASE_SERVICE_ROLE_KEY`. Supabase service role keys are secret dashboard credentials and are not exposed by the available Supabase connector.

Supabase project used:

```text
Name: AQUASMART
Project ref: erjcmensjjhdpwwqnisq
URL: https://erjcmensjjhdpwwqnisq.supabase.co
Region: ap-southeast-1
```

Render backend:

```text
Service URL: https://aquasmart-zf44.onrender.com
Health URL: https://aquasmart-zf44.onrender.com/health
Root Directory: backend
Build Command: pip install -r requirements.txt
Start Command: uvicorn api.main:app --host 0.0.0.0 --port $PORT
Health Check Path: /health
```

Vercel frontend:

```text
Project: aquasmart-frontend
Production URL: https://aquasmart-frontend-tawny.vercel.app
Latest deployment: https://aquasmart-frontend-g6dxkc6n1-quevinjamesx26-9519s-projects.vercel.app
Root Directory: frontend
Build Command: npm run build
```

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
  SETUP.md            Setup guide
```

## Frontend Setup

From the frontend folder:

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Set these values in `frontend/.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Installed frontend dependencies:

- `next`
- `react`
- `react-dom`
- `tailwindcss`
- `@supabase/supabase-js`
- `@supabase/ssr`
- `three`
- `@react-three/fiber`
- `@react-three/drei`
- `d3-scale`
- `d3-scale-chromatic`
- `lucide-react`
- `@radix-ui/react-slider`
- `class-variance-authority`
- `clsx`
- `tailwind-merge`

## Backend Setup

From the backend folder:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
cp .env.example .env
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

Set these values in `backend/.env` for local development:

```bash
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
FRONTEND_ORIGIN=http://localhost:3000
```

Do not expose `SUPABASE_SERVICE_ROLE_KEY` in the browser or in the Next.js app.

Local backend checks:

```bash
curl http://localhost:8000/health
open http://localhost:8000/docs
```

## Supabase Setup

The Supabase project has already been configured using the Free-plan project named `AQUASMART`.

Configured:

- Auth for user sign-in.
- PostGIS extension.
- Postgres tables for projects, farm boundaries, wells, sensors, simulations, and simulation files.
- Row level security policies for project-owned records.
- Storage buckets for lightweight visualization files.

Created v1 storage buckets:

```text
terrain
groundwater
flow
boundaries
```

Created public tables:

```text
projects
farm_boundaries
wells
sensors
simulations
simulation_files
```

Keep v1 files small:

- Use precomputed demo outputs.
- Prefer compact JSON for the first 3D visualization.
- Avoid storing dense timestep arrays in Postgres.
- Avoid large live MODFLOW runs on free hosting.

## Render Backend Deployment

The repo includes `render.yaml`, so you can deploy through a Render Blueprint or create the service manually.

The current Render service has already been configured from the Render dashboard.

Recommended manual settings:

```text
Service type: Web Service
Runtime: Python
Root directory: backend
Build command: pip install -r requirements.txt
Start command: uvicorn api.main:app --host 0.0.0.0 --port $PORT
Health check path: /health
Plan: Free
```

Important: the backend is inside `backend/`. If Render uses the repository root, it may detect the wrong runtime or run Node/Yarn commands. Render's Root Directory setting makes the build and start commands run from the backend folder.

Render environment variables:

```bash
PYTHON_VERSION=3.12.8
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
FRONTEND_ORIGIN=https://aquasmart-frontend-tawny.vercel.app
```

For this project:

```bash
PYTHON_VERSION=3.12.8
SUPABASE_URL=https://erjcmensjjhdpwwqnisq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=copy_from_supabase_dashboard
FRONTEND_ORIGIN=http://localhost:3000
```

After changing `render.yaml`, redeploy the Render service so `FRONTEND_ORIGIN` is applied in production.

Where to get the service role key:

```text
Supabase Dashboard
→ Project Settings
→ API
→ Project API keys
→ service_role key
```

Keep the service role key only in Render backend environment variables. Never put it in `frontend/.env.local`, Vercel public variables, or browser code.

Render free services spin down after idle time. That is acceptable for a prototype, but the first request after inactivity can be slow.

Official Render references:

- FastAPI deployment: https://render.com/docs/deploy-fastapi
- Environment variables: https://render.com/docs/configure-environment-variables
- Free service limits: https://render.com/docs/free
- Blueprint reference: https://render.com/docs/blueprint-spec
- Monorepo root directory: https://render.com/docs/monorepo-support

### Render Error: Missing `package.json`

If Render fails with:

```text
error Couldn't find a package.json file in "/opt/render/project/src"
```

Render is trying to deploy the repo root as a Node app. Fix the service settings:

```text
Language: Python
Root Directory: backend
Build Command: pip install -r requirements.txt
Start Command: uvicorn api.main:app --host 0.0.0.0 --port $PORT
```

Then click:

```text
Manual Deploy
→ Clear build cache & deploy
```

If Render does not let you change the language/runtime on the existing service, delete that failed service and create a new Web Service with the settings above.

## Vercel Frontend Deployment

Deploy `frontend` to Vercel.

This step still needs Vercel account authentication. The local CLI requested device login, so you can either complete that login locally or deploy from the Vercel dashboard.

Recommended settings:

```text
Framework preset: Next.js
Root directory: frontend
Build command: npm run build
Install command: npm install
Output directory: leave default
Plan: Hobby
```

Vercel environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://erjcmensjjhdpwwqnisq.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=copy_from_frontend_env_local_or_supabase_dashboard
NEXT_PUBLIC_API_URL=https://your-render-service.onrender.com
```

After Vercel deploys, copy the Vercel URL into Render's `FRONTEND_ORIGIN`.

CLI deployment path after login:

```bash
cd frontend
npx vercel login
npx vercel env add NEXT_PUBLIC_SUPABASE_URL production
npx vercel env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY production
npx vercel env add NEXT_PUBLIC_API_URL production
npx vercel deploy --prod
```

Dashboard deployment path:

```text
Vercel Dashboard
→ Add New Project
→ Import Git Repository
→ Set Root Directory to frontend
→ Add environment variables
→ Deploy
```

## Verification

Frontend:

```bash
cd frontend
npm run lint
npm run build
```

Backend:

```bash
cd backend
source .venv/bin/activate
python -m uvicorn api.main:app --host 0.0.0.0 --port 8000
```

Then open:

```text
http://localhost:8000/health
http://localhost:8000/docs
```

## Cost Notes

This setup is suitable for a small prototype on free tiers if you keep data small and preprocessed.

Expected free-tier-friendly pattern:

```text
Next.js dashboard
→ FastAPI metadata/demo endpoint
→ Supabase metadata and small storage files
→ Browser renders lightweight 3D visualization
```

Avoid in v1:

- Production-scale live MODFLOW execution from button clicks.
- Large simulation uploads.
- Huge JSON timestep downloads.
- Storing full model grids as database rows.
- Render persistent disk assumptions.
