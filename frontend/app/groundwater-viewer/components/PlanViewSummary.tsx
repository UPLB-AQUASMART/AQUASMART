import { planLegendItems } from "./constants";

export function PlanViewSummary() {
  return (
    <div className="plan-view-summary" id="plan-view-summary" hidden>
      <strong id="plan-view-model">MODFLOW 6 steady-state result</strong>
      <span id="plan-view-details">
        FloPy processed head and specific-discharge output.
      </span>
      <p className="plan-scenario-status" id="plan-scenario-status">
        Scenario configuration active
      </p>
      <div className="plan-config-readout" aria-label="Fixed scenario configuration">
        <div>
          <span>Soil type</span>
          <strong id="plan-soil-readout">Loam</strong>
        </div>
        <div>
          <span>Pipe screens</span>
          <strong id="plan-screen-readout">Levels 1-3</strong>
        </div>
      </div>
      <div className="plan-legend" aria-label="Top view legend">
        {planLegendItems.map(([type, label]) => (
          <div className="plan-legend-item" key={type}>
            <i className={`plan-legend-symbol ${type}`} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
