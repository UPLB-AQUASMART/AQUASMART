import { ModelMenuState } from "./ModelMenuState";
import { SectionMenuState } from "./SectionMenuState";

export function ViewerPanel() {
  return (
    <aside className="panel" id="menu-panel" aria-label="Model controls">
      <button
        className="panel-mobile-dismiss"
        id="hide-panel"
        type="button"
        aria-controls="menu-panel"
      >
        Hide menu
      </button>
      <ModelMenuState />
      <SectionMenuState />
    </aside>
  );
}
