/*
  DOM element references for the standalone groundwater viewer.

  Keep selector IDs in sync with index.html. Runtime behavior belongs in
  groundwater-viewer-app.js; this file only centralizes element lookups.
*/

export const sceneRoot = document.querySelector("#scene");
export const statusEl = document.querySelector("#status");
export const legendEl = document.querySelector("#legend");
export const wellPickerEl = document.querySelector("#well-picker");
export const menuPanelEl = document.querySelector("#menu-panel");
export const menu3dStateEl = document.querySelector("#menu-3d-state");
export const menuSectionStateEl = document.querySelector("#menu-section-state");
export const activeWellCountEl = document.querySelector("#active-well-count");
export const showPanelButton = document.querySelector("#show-panel");
export const sectionViewEl = document.querySelector("#section-view");
export const sectionCanvas = document.querySelector("#section-canvas");
export const sectionTitleEl = document.querySelector("#section-title");
export const sectionWellLocationEl = document.querySelector(
  "#section-well-location",
);
export const sectionDischargeInput =
  document.querySelector("#section-discharge");
export const sectionDischargeValueEl = document.querySelector(
  "#section-discharge-value",
);
export const influenceValueEl = document.querySelector("#influence-value");
export const influenceTrackEl = document.querySelector("#influence-track");
export const soilTypeSelect = document.querySelector("#soil-type");
export const soilDropdownEl = document.querySelector("#soil-dropdown");
export const soilSelectButtonEl = document.querySelector("#soil-select-button");
export const soilSelectValueEl = document.querySelector("#soil-select-value");
export const soilSelectMenuEl = document.querySelector("#soil-select-menu");
export const soilFigureEl = document.querySelector("#soil-figure");
export const soilDescriptionEl = document.querySelector("#soil-description");
export const screenOptionsEl = document.querySelector("#screen-options");
export const pipeScreenStackEl = document.querySelector("#pipe-screen-stack");
export const sensorSpecsEl = document.querySelector("#sensor-specs");
export const sensorSpecsTitleEl = document.querySelector("#sensor-specs-title");
export const sensorSpecsSelectEl = document.querySelector(
  "#sensor-specs-select",
);
export const sensorSpecsListEl = document.querySelector("#sensor-specs-list");
export const topViewBackButton = document.querySelector("#top-view-back");
export const planViewSummaryEl = document.querySelector("#plan-view-summary");
export const planViewModelEl = document.querySelector("#plan-view-model");
export const planViewDetailsEl = document.querySelector("#plan-view-details");
export const planScenarioStatusEl = document.querySelector(
  "#plan-scenario-status",
);
export const planSoilReadoutEl = document.querySelector("#plan-soil-readout");
export const planScreenReadoutEl = document.querySelector(
  "#plan-screen-readout",
);
export const topSetupPanelEl = document.querySelector("#top-setup-panel");
export const topSetupTitleEl = document.querySelector("#top-setup-title");
export const topSetupStatusEl = document.querySelector("#top-setup-status");
export const rechargeRateValueEl = document.querySelector(
  "#recharge-rate-value",
);
export const scenarioRunButton = document.querySelector("#scenario-run");
export const scenarioCancelButton = document.querySelector("#scenario-cancel");
export const scenarioDirectionButtons = document.querySelectorAll(
  "[data-direction]",
);
export const scenarioRechargeZoneRadios = document.querySelectorAll(
  "[name='scenario-recharge-zone-ui']",
);
export const scenarioLeakageDirectionRadios = document.querySelectorAll(
  "[name='scenario-leakage-direction-ui']",
);
export const scenarioInputs = {
  rows: document.querySelector("#scenario-rows"),
  columns: document.querySelector("#scenario-columns"),
  area: document.querySelector("#scenario-area"),
  gridSize: document.querySelector("#scenario-grid-size"),
  layers: document.querySelector("#scenario-layers"),
  boundary: document.querySelector("#scenario-boundary"),
  rechargeEnabled: document.querySelector("#scenario-recharge-enabled"),
  rechargeRate: document.querySelector("#scenario-recharge-rate"),
  groundwaterElevation: document.querySelector(
    "#scenario-groundwater-elevation",
  ),
  riverElevation: document.querySelector("#scenario-river-elevation"),
  streamLeakage: document.querySelector("#scenario-stream-leakage"),
  rechargeZone: document.querySelector("#scenario-recharge-zone"),
  leakageDirection: document.querySelector(
    "#scenario-leakage-direction",
  ),
};
export const wellUnavailableToastEl = document.querySelector(
  "#well-unavailable-toast",
);
