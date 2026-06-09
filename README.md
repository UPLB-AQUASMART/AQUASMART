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

The active app is in `aquasmart-mini/`.

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
- FastAPI backend scaffold in `api/`
- FloPy / NumPy / Pandas backend dependencies
- Render Blueprint in `render.yaml`

Not yet added:

- Supabase schema/migrations
- Production MODFLOW execution flow
- 3D dashboard scene implementation

Add these only when the app needs them, keeping the prototype small and cheap.

See `SETUP.md` for local setup and deployment steps.
