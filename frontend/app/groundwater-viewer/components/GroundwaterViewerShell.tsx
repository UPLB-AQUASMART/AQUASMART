import { SectionViewOverlay } from "./SectionViewOverlay";
import { ViewerPanel } from "./ViewerPanel";
import { ViewerScripts } from "./ViewerScripts";

export function GroundwaterViewerShell() {
  return (
    <>
      <ViewerScripts />
      <main id="scene" aria-label="3D groundwater model viewer" />
      <button className="panel-toggle" id="show-panel" type="button">
        Show menu
      </button>
      <div
        className="well-unavailable-toast"
        id="well-unavailable-toast"
        role="status"
        aria-live="polite"
        hidden
      />
      <ViewerPanel />
      <SectionViewOverlay />
    </>
  );
}
