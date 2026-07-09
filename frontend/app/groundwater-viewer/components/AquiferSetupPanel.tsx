import { Icon } from "@iconify/react";
import { NumericInput, RangeInput } from "./FormControls";
import { rechargeModes } from "./constants";

export function AquiferSetupPanel() {
  return (
    <div
      className="aquifer-setup"
      id="aquifer-setup"
      aria-label="Aquifer MODFLOW setup"
      hidden
    >
      <h3 className="aquifer-setup__title" id="aquifer-setup-title">
        Layer Aquifer Setup
      </h3>
      <p className="aquifer-setup__subtitle">with FloPy &amp; MODFLOW</p>
      <GridSetupCard />
      <div className="aquifer-setup__content-grid">
        <RechargeSetupCard />
        <BoundarySetupCard />
      </div>
      <div className="aquifer-setup__actions">
        <button id="scenario-cancel" type="button">
          Cancel
        </button>
        <button
          className="aquifer-setup__run-button"
          id="scenario-run"
          type="button"
        >
          Run MODFLOW
        </button>
      </div>
      <p className="aquifer-setup__status" id="aquifer-setup-status" />
    </div>
  );
}

function GridSetupCard() {
  return (
    <div className="aquifer-card">
      <GridDimensionsRow />
      <GridLayerRow />
    </div>
  );
}

function GridDimensionsRow() {
  return (
    <div className="aquifer-grid-row">
      <span className="aquifer-icon" aria-hidden="true">
        <Icon
          className="aquifer-icon__svg"
          icon="uim:grids"
          height="20px"
          width="20px"
        />
      </span>
      <span className="aquifer-grid-row__copy">
        <strong>Rows &amp; Columns</strong>
        <small>Defines the Grid Structure</small>
      </span>
      <span className="aquifer-field-grid">
        <label className="aquifer-field">
          Rows:
          <NumericInput
            id="scenario-rows"
            min="5"
            max="50"
            step="1"
            defaultValue="10"
          />
        </label>
        <label className="aquifer-field">
          Columns:
          <NumericInput
            id="scenario-columns"
            min="5"
            max="50"
            step="1"
            defaultValue="10"
          />
        </label>
        <label className="aquifer-field">
          Area (km²):
          <NumericInput
            id="scenario-area"
            min="0"
            max="10000"
            step="0.0001"
            defaultValue="0.0100"
            disabled
          />
        </label>
      </span>
    </div>
  );
}

function GridLayerRow() {
  return (
    <div className="aquifer-grid-row">
      <span className="aquifer-icon" aria-hidden="true">
        <Icon className="aquifer-icon__svg" icon="at-icons:layers" />
      </span>
      <span className="aquifer-grid-row__copy">
        <strong>Size &amp; Layers</strong>
        <small>Set Grid Size and Layers</small>
      </span>
      <span className="aquifer-field-grid aquifer-field-grid--two">
        <label className="aquifer-field">
          Grid Size (m):
          <NumericInput
            id="scenario-grid-size"
            min="5"
            max="250"
            step="1"
            defaultValue="10"
          />
        </label>
        <label className="aquifer-field">
          Layers
          <NumericInput
            id="scenario-layers"
            min="1"
            max="3"
            step="1"
            defaultValue="3"
            disabled
          />
        </label>
      </span>
    </div>
  );
}

function RechargeSetupCard() {
  return (
    <div className="aquifer-card">
      <div className="aquifer-card__header">
        <span className="aquifer-icon" aria-hidden="true">
          <Icon className="aquifer-icon__svg" icon="noto-v1:cloud-with-rain" />
        </span>
        <span>
          <strong>Water Recharge Boundary Control</strong>
          <small>
            Recharge represents water entering from rainfall, irrigation return
            flow, or infiltration.
          </small>
        </span>
      </div>
      <label className="aquifer-toggle">
        Enable Recharge
        <input id="scenario-recharge-enabled" type="checkbox" defaultChecked />
      </label>
      <label className="aquifer-field">
        <span>
          <Icon className="aquifer-icon__svg" icon="mdi:water-outline" />
          Recharge Rate
          <strong className="aquifer-field__value" id="recharge-rate-value">
            138 m³/day
          </strong>
        </span>
        <small>Amount of water entering the system</small>
        <RangeInput
          id="scenario-recharge-rate"
          min="0"
          max="1000"
          step="1"
          defaultValue="138"
        />
      </label>
      <div className="aquifer-zone-mode">
        <span className="aquifer-zone-mode__copy">
          <strong>Recharge Zone Mode</strong>
          <small>Choose how recharge is applied in the model</small>
        </span>
        <div className="aquifer-option-grid">
          {rechargeModes
            .filter((mode) => mode.value !== "variable")
            .map((mode) => (
              <label
                className={`aquifer-option${mode.active ? " is-active" : ""}${
                  mode.disabled ? " is-disabled" : ""
                }`}
                key={mode.value}
              >
                <input
                  name="scenario-recharge-zone-ui"
                  type="radio"
                  defaultValue={mode.value}
                  defaultChecked={mode.active}
                  disabled={mode.disabled}
                  hidden
                />
                <span className="aquifer-option__choice" aria-hidden="true" />
                <Icon className="aquifer-icon__svg" icon={mode.icon} />
                <span className="aquifer-option__text">
                  {mode.label}
                  <small>{mode.note}</small>
                </span>
              </label>
            ))}
        </div>
      </div>
      <select id="scenario-recharge-zone" hidden defaultValue="uniform">
        {rechargeModes.map((mode) => (
          <option value={mode.value} key={mode.value}>
            {mode.label}
          </option>
        ))}
      </select>
      <p className="aquifer-note">
        <Icon
          className="aquifer-icon__svg"
          icon="material-symbols:info-outline"
        />
        High recharge weakens drawdown
      </p>
    </div>
  );
}

function BoundarySetupCard() {
  return (
    <div className="aquifer-card">
      <div className="aquifer-card__header">
        <img
          className="aquifer-card__image"
          src="/groundwater-viewer/assets/river.png"
          alt=""
        />
        <span>
          <strong>River or Streams Boundary Control</strong>
          <small>
            Rivers can supply water to the aquifer or drain groundwater
            depending on head difference.
          </small>
        </span>
      </div>
      <select id="scenario-boundary" hidden defaultValue="river">
        <option value="constant-head">Constant head</option>
        <option value="river">River/stream</option>
        <option value="recharge">Recharge dominated</option>
      </select>
      <div className="aquifer-elevation-grid">
        <ElevationControl
          id="scenario-groundwater-elevation"
          label="Groundwater Elevation"
        />
        <ElevationControl
          id="scenario-river-elevation"
          label="River Elevation"
        />
      </div>
      <label className="aquifer-field">
        Stream Leakage (flux)
        <small>Positive means stream adds water to aquifer</small>
        <NumericInput
          id="scenario-stream-leakage"
          min="-1"
          max="1"
          step="0.0001"
          defaultValue="0.0000"
        />
      </label>
      <div className="aquifer-leakage-grid">
        <LeakageOption
          value="positive"
          label="+Positive"
          note="Stream losing water"
          active
        />
        <LeakageOption
          value="negative"
          label="-Negative"
          note="Aquifer discharging"
        />
      </div>
      <select id="scenario-leakage-direction" hidden defaultValue="positive">
        <option value="negative">Aquifer to stream</option>
        <option value="positive">Stream to aquifer</option>
      </select>
    </div>
  );
}

function ElevationControl({ id, label }: { id: string; label: string }) {
  return (
    <div className="aquifer-elevation-control">
      <span className="aquifer-elevation-control__scale">
        <span className="aquifer-elevation-control__scale-value">1000</span>
        <RangeInput
          className="aquifer-elevation-control__slider"
          id={id}
          min="0"
          max="1000"
          step="1"
          defaultValue="1000"
        />
        <span className="aquifer-elevation-control__scale-value">0</span>
      </span>
      <label>
        {label}
        <span className="aquifer-elevation-control__value">1000 m</span>
      </label>
    </div>
  );
}

function LeakageOption({
  value,
  label,
  note,
  active,
}: {
  value: string;
  label: string;
  note: string;
  active?: boolean;
}) {
  return (
    <label className={`aquifer-leakage-option${active ? " is-active" : ""}`}>
      <input
        name="scenario-leakage-direction-ui"
        type="radio"
        defaultValue={value}
        defaultChecked={active}
        hidden
      />
      {label}
      <br />
      <small>{note}</small>
    </label>
  );
}
