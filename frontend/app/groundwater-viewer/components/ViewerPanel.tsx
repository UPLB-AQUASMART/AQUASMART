import { ModelMenuState } from "./ModelMenuState";
import { SectionMenuState } from "./SectionMenuState";

export function ViewerPanel() {
  return (
    <aside className="panel" id="menu-panel">
      <ModelMenuState />
      <SectionMenuState />
    </aside>
  );
}
