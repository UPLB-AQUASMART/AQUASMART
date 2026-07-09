import { NumericInput, RangeInput } from "./FormControls";
import { soilOptions } from "./constants";

export function SectionControls() {
  return (
    <>
      <div className="section-slider-grid">
        <div className="section-discharge">
          <label htmlFor="section-discharge">
            <span>Water Discharge</span>
            <span id="section-discharge-value">0 m³/day</span>
          </label>
          <RangeInput
            id="section-discharge"
            min="0"
            max="8000"
            step="100"
            defaultValue="0"
          />
          <div className="slider-range">
            <span>0</span>
            <span>8,000</span>
          </div>
        </div>
        <div className="derived-control">
          <div className="derived-control-header">
            <span>Area of Influence</span>
            <span className="derived-control-value" id="influence-value">
              0 km
            </span>
          </div>
          <div className="derived-control-track" id="influence-track" />
          <div className="slider-range">
            <span>0</span>
            <span>18 km</span>
          </div>
        </div>
      </div>
      <div className="section-option-grid">
        <SoilControl />
        <ScreenControl />
      </div>
    </>
  );
}

function SoilControl() {
  return (
    <div className="section-option-card">
      <img
        className="soil-figure"
        id="soil-figure"
        src="/groundwater-viewer/assets/soil/loam.png"
        alt="Loam soil texture"
      />
      <div className="section-option-content">
        <div className="soil-dropdown" id="soil-dropdown">
          <button
            className="soil-select-button"
            id="soil-select-button"
            type="button"
            aria-haspopup="listbox"
            aria-expanded="false"
          >
            <span id="soil-select-value">Loam</span>
            <span className="soil-select-chevron" aria-hidden="true" />
          </button>
          <div
            className="soil-select-menu"
            id="soil-select-menu"
            role="listbox"
            hidden
          >
            {soilOptions.map((soil) => (
              <button
                className={`soil-select-option${soil === "loam" ? " is-current" : ""}`}
                type="button"
                role="option"
                data-soil-option={soil}
                aria-selected={soil === "loam"}
                key={soil}
              >
                {soil[0].toUpperCase() + soil.slice(1)}
              </button>
            ))}
          </div>
          <select
            id="soil-type"
            aria-hidden="true"
            tabIndex={-1}
            defaultValue="loam"
          >
            {soilOptions.map((soil) => (
              <option value={soil} key={soil}>
                {soil[0].toUpperCase() + soil.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <p className="soil-description" id="soil-description">
          Holds a balanced amount of water and allows moderate drainage, so
          water drawdown is usually steady and controlled.
        </p>
        <div className="soil-hydraulic-grid" aria-label="Hydraulic properties">
          <label>
            <span>Kx</span>
            <NumericInput
              id="soil-horizontal-k"
              min="0.001"
              max="200"
              step="0.001"
              defaultValue="5"
            />
            <small>0.001-200 m/day</small>
          </label>
          <label>
            <span>Kz</span>
            <NumericInput
              id="soil-vertical-k"
              min="0.0001"
              max="50"
              step="0.0001"
              defaultValue="0.5"
            />
            <small>0.0001-50 m/day</small>
          </label>
          <label>
            <span>Sy</span>
            <NumericInput
              id="soil-specific-yield"
              min="0.01"
              max="0.5"
              step="0.01"
              defaultValue="0.16"
            />
            <small>0.01-0.5</small>
          </label>
        </div>
        <p className="soil-hydraulic-note" id="soil-hydraulic-note">
          Kx 2.5-15 m/day maps to Loam.
        </p>
      </div>
    </div>
  );
}

function ScreenControl() {
  return (
    <div className="section-option-card">
      <div
        className="pipe-screen-stack"
        id="pipe-screen-stack"
        aria-label="Pipe screen levels preview"
      >
        {[1, 2, 3].map((level) => (
          <div className="pipe-screen-segment" data-level={level} key={level}>
            <img src="/groundwater-viewer/assets/pipe-screen.svg" alt="" />
          </div>
        ))}
      </div>
      <div className="section-option-content">
        <div className="screen-card-title">Pipe Screen Level</div>
        <div className="screen-options" id="screen-options" />
      </div>
    </div>
  );
}
