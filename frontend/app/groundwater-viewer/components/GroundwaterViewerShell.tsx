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
      <div
        className="modflow-transition"
        id="modflow-transition"
        role="status"
        aria-live="polite"
        aria-hidden="true"
        hidden
      >
        <div className="modflow-transition__copy">
          <strong id="modflow-transition-title">Preparing model grid</strong>
          <span id="modflow-transition-detail">
            Mapping recharge, river boundary, wells, and aquifer layers.
          </span>
        </div>
        <div
          className="modflow-transition__progress"
          aria-hidden="true"
        >
          <span id="modflow-transition-progress" />
        </div>
      </div>
    </>
  );
}
