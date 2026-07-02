import { AquiferSetupPanel } from "./AquiferSetupPanel";
import { MetricGrid } from "./MetricGrid";
import { PlanViewSummary } from "./PlanViewSummary";
import { SectionControls } from "./SectionControls";

export function SectionMenuState() {
  return (
    <div className="menu-state" id="menu-section-state" hidden>
      <header className="section-panel-header">
        <h2 id="section-title">2D Well Section</h2>
        <div className="section-well-location" id="section-well-location">
          Los Baños Laguna
        </div>
      </header>
      <p className="section-panel-eyebrow">Latest water quality readings</p>
      <MetricGrid />
      <SectionControls />
      <AquiferSetupPanel />
      <PlanViewSummary />
    </div>
  );
}
