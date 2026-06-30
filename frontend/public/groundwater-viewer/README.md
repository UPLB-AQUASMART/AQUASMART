# Groundwater Viewer File Map

This folder contains the standalone AQUASMART groundwater model that is opened
from the Next.js `/simulation` route.

## Main Files

- `index.html`
  - Markup shell for the viewer.
  - Edit this when adding/removing panels, buttons, inputs, dialogs, or canvas
    elements.

- `styles/groundwater-viewer.css`
  - Visual styling for the standalone viewer inside the iframe.
  - Edit this for colors, spacing, layout, button design, panels, sliders,
    labels, and responsive behavior.

- `scripts/groundwater-viewer-app.js`
  - Runtime behavior for the model.
  - Owns the Three.js 3D model, 2D well section, top-view canvas,
    sensor specs, scenario configuration, and API calls.

## Related Next.js Wrapper

The header and fullscreen iframe wrapper are outside this folder:

- `frontend/app/simulation/components/SimulationModelEntry.tsx`
- `frontend/app/simulation/components/SimulationModelEntry.module.css`

## Data And Assets

- `../generated/demo_groundwater_scene.json`
  - 3D/2D scene input data.

- `../generated/modflow_topview.json`
  - Base top-view MODFLOW/FloPy result data.

- `assets/`
  - Pipe screen, soil, and river images used by the viewer.
