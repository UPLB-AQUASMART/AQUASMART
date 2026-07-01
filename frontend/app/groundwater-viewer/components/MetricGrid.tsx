import { metricCards } from "./constants";

export function MetricGrid() {
  return (
    <div className="metric-grid" id="metric-grid">
      {metricCards.map((metric) => (
        <label className="metric-card" key={metric.metric}>
          <span className="metric-card-header">
            <span className="metric-icon">{metric.icon}</span>
            <span>
              <span className="metric-name">{metric.label}</span>
              <br />
              <span className="metric-unit">{metric.unit}</span>
            </span>
          </span>
          <span className="metric-value-row">
            <span>Latest</span>
            <input
              data-metric={metric.metric}
              type="number"
              step={metric.step}
              defaultValue={metric.value}
            />
          </span>
        </label>
      ))}
    </div>
  );
}
