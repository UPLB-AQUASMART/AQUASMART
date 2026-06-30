# Groundwater Viewer File Map

This folder contains the standalone AQUASMART groundwater model that is opened
from the Next.js `/simulation` route.

## Main Files

- `index.html`
  - Markup shell for the viewer.
  - Edit this when adding/removing panels, buttons, inputs, dialogs, or canvas
    elements.

- `styles/groundwater-viewer.css`
  - Main CSS entry point.
  - It imports the smaller component styles in `styles/components/`.

- `styles/components/00-base.css`
  - Base page styles, global buttons, scene mount, and loading states.

- `styles/components/01-section-canvas.css`
  - Fullscreen 2D canvas, toolbar, discharge controls, and sensor popover.

- `styles/components/02-panel-layout.css`
  - Shared left panel sizing and panel mode layout rules.

- `styles/components/03-top-view-setup.css`
  - FloPy/MODFLOW aquifer setup panel, top-view result cards, and legends.

- `styles/components/04-well-menu.css`
  - 3D well selector menu, active/inactive well cards, and action buttons.

- `styles/components/05-section-controls.css`
  - 2D metric cards, sliders, pipe screen controls, and soil level controls.

- `styles/components/06-responsive.css`
  - Mobile and narrow viewport overrides.

- `styles/components/07-soil-dropdown.css`
  - Custom soil dropdown component.

- `scripts/groundwater-viewer-app.js`
  - Runtime behavior for the model.
  - Owns the Three.js 3D model, 2D well section, top-view canvas, rendering,
    zoom/pan, and event wiring.

- `scripts/data/groundwater-domain-data.js`
  - Aquifer labels, soil behavior, soil image paths, well display names,
    default readings, and sensor specs.

- `scripts/dom/viewer-dom-elements.js`
  - Centralized `document.querySelector` references.
  - Keep selector IDs synced with `index.html`.

- `scripts/api/modflow-scenario-api.js`
  - Frontend helper for requesting scenario-based top-view results from the
    Next.js API proxy / FastAPI backend.

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
