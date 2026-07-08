/* eslint-disable */
/* Shared DOM references, constants, data tables, and runtime state. */

// DOM references
const sceneRoot = document.querySelector("#scene");
const statusEl = document.querySelector("#status");
const legendEl = document.querySelector("#legend");
const wellPickerEl = document.querySelector("#well-picker");
const menuPanelEl = document.querySelector("#menu-panel");
const menu3dStateEl = document.querySelector("#menu-3d-state");
const menuSectionStateEl = document.querySelector("#menu-section-state");
const activeWellCountEl = document.querySelector("#active-well-count");
const showPanelButton = document.querySelector("#show-panel");
const hidePanelButton = document.querySelector("#hide-panel");
const sectionViewEl = document.querySelector("#section-view");
const sectionCanvas = document.querySelector("#section-canvas");
const sectionTitleEl = document.querySelector("#section-title");
const sectionWellLocationEl = document.querySelector(
  "#section-well-location",
);
const sectionDischargeInput =
  document.querySelector("#section-discharge");
const sectionDischargeValueEl = document.querySelector(
  "#section-discharge-value",
);
const influenceValueEl = document.querySelector("#influence-value");
const influenceTrackEl = document.querySelector("#influence-track");
const soilTypeSelect = document.querySelector("#soil-type");
const soilDropdownEl = document.querySelector("#soil-dropdown");
const soilSelectButtonEl = document.querySelector("#soil-select-button");
const soilSelectValueEl = document.querySelector("#soil-select-value");
const soilSelectMenuEl = document.querySelector("#soil-select-menu");
const soilFigureEl = document.querySelector("#soil-figure");
const soilDescriptionEl = document.querySelector("#soil-description");
const screenOptionsEl = document.querySelector("#screen-options");
const pipeScreenStackEl = document.querySelector("#pipe-screen-stack");
const sensorSpecsEl = document.querySelector("#sensor-specs");
const sensorSpecsTitleEl = document.querySelector("#sensor-specs-title");
const sensorSpecsSelectEl = document.querySelector(
  "#sensor-specs-select",
);
const sensorSpecsListEl = document.querySelector("#sensor-specs-list");
const topViewBackButton = document.querySelector("#top-view-back");
const planViewSummaryEl = document.querySelector("#plan-view-summary");
const planViewModelEl = document.querySelector("#plan-view-model");
const planViewDetailsEl = document.querySelector("#plan-view-details");
const planScenarioStatusEl = document.querySelector(
  "#plan-scenario-status",
);
const planSoilReadoutEl = document.querySelector("#plan-soil-readout");
const planScreenReadoutEl = document.querySelector(
  "#plan-screen-readout",
);
const aquiferSetupPanelEl = document.querySelector("#aquifer-setup");
const aquiferSetupTitleEl = document.querySelector("#aquifer-setup-title");
const aquiferSetupStatusEl = document.querySelector("#aquifer-setup-status");
const rechargeRateValueEl = document.querySelector(
  "#recharge-rate-value",
);
const modflowTransitionEl = document.querySelector("#modflow-transition");
const modflowTransitionTitleEl = document.querySelector(
  "#modflow-transition-title",
);
const modflowTransitionDetailEl = document.querySelector(
  "#modflow-transition-detail",
);
const modflowTransitionProgressEl = document.querySelector(
  "#modflow-transition-progress",
);
const scenarioRunButton = document.querySelector("#scenario-run");
const scenarioCancelButton = document.querySelector("#scenario-cancel");
const scenarioDirectionButtons = document.querySelectorAll(
  "[data-direction]",
);
const scenarioRechargeZoneRadios = document.querySelectorAll(
  "[name='scenario-recharge-zone-ui']",
);
const scenarioLeakageDirectionRadios = document.querySelectorAll(
  "[name='scenario-leakage-direction-ui']",
);
const scenarioInputs = {
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
const wellUnavailableToastEl = document.querySelector(
  "#well-unavailable-toast",
);
const compactViewerQuery = window.matchMedia("(max-width: 760px)");

// Viewer scale and Three.js scene setup
const sectionContext = sectionCanvas.getContext("2d");
const xScale = 1 / 1000;
const yScale = 1 / 1000;
const zScale = 11 / 1000;
const domain = { lx_m: 60000, ly_m: 25000 };
const centerX = domain.lx_m / 2;
const centerY = domain.ly_m / 2;

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: false,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xdff6fd, 1);
sceneRoot.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xdff6fd, 95, 165);

const perspectiveCamera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  400,
);
const orthoSize = 36;
const orthoCamera = new THREE.OrthographicCamera(
  -orthoSize,
  orthoSize,
  orthoSize,
  -orthoSize,
  0.1,
  400,
);
let activeCamera = perspectiveCamera;
const controls = new OrbitControls(activeCamera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.target.set(0, 0, 0);
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

// Runtime state shared by 3D, 2D section, and top-view modes
let cameraTween = null;
let sceneData = null;
let modflowTopViewData = null;
let activeSectionWell = null;
let sectionZoom = 1;
let sectionMode = false;
let sectionPanX = 0;
let sectionPanY = 0;
let sectionDischarge = 0;
let selectedSoilType = "loam";
let activeSoilLevel = 1;
let soilTypeByLevel = new Map();
let selectedScreenLevels = new Set();
let isSectionDragging = false;
let lastSectionPointer = { x: 0, y: 0 };
let lastSectionCursor = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
};
let sensorHitBoxes = [];
let aquiferHitRegions = [];
let hoveredAquiferLevel = null;
let topViewMode = false;
let activeTopLayer = 0;
let topViewZoom = 1;
let topViewPanX = 0;
let topViewPanY = 0;
let topViewSetupMode = false;
let pendingTopViewRegion = null;
let selectedAquiferRegion = null;
let scenarioDirection = "left-to-right";
let activeScenarioConfig = null;
let topViewAnimatedDischarge = 0;
let topViewDischargeFrame = null;
let modflowTransitionTimer = null;
let wellUnavailableToastTimer = null;
let sensorSpecsVisible = false;
let activeSensorIndex = 0;
const STREAMBED_HYDRAULIC_CONDUCTIVITY_M_DAY = 0.00016;
const STREAMBED_CONTACT_AREA_M2 = 0.2;
const STREAMBED_THICKNESS_M = 1;
const STREAMBED_CONDUCTANCE_M2_DAY =
  (STREAMBED_HYDRAULIC_CONDUCTIVITY_M_DAY * STREAMBED_CONTACT_AREA_M2) /
  STREAMBED_THICKNESS_M;
const MAX_RECHARGE_DRAWDOWN_REDUCTION = 0.7;

function rechargeDrawdownFactor({
  enabled = scenarioInputs.rechargeEnabled?.checked,
  rate = Number(scenarioInputs.rechargeRate?.value || 0),
  maxRate = Number(scenarioInputs.rechargeRate?.max || 1000),
} = {}) {
  if (!enabled || rate <= 0 || maxRate <= 0) {
    return 1;
  }
  const normalizedRecharge = Math.min(1, Math.max(0, rate / maxRate));
  return 1 - normalizedRecharge * MAX_RECHARGE_DRAWDOWN_REDUCTION;
}

const aquiferLevelNames = {
  "Upper Aquifer": "Level 1",
  "Middle Aquifer": "Level 2",
  "Lower Aquifer": "Level 3",
};
const aquiferLevelNumbers = {
  "Upper Aquifer": 1,
  "Middle Aquifer": 2,
  "Lower Aquifer": 3,
};
const modflowTransitionStages = [
  {
    title: "Building aquifer grid",
    detail:
      "Rows, columns, layers, and active cells are being written for MODFLOW.",
    progress: 24,
  },
  {
    title: "Applying recharge and river boundary",
    detail:
      "Rainfall infiltration, stream leakage, and constant-head edges are settling in.",
    progress: 46,
  },
  {
    title: "Solving groundwater heads",
    detail:
      "FloPy has handed the scenario to MODFLOW 6 for the numerical solve.",
    progress: 68,
  },
  {
    title: "Tracing drawdown and flow",
    detail:
      "Heads, cell budgets, contours, and vectors are being shaped for the top view.",
    progress: 86,
  },
];

// Domain data, labels, sensor profiles, and default well presentation
const soilDrawdownProfiles = {
  sand: { label: "Sand", influence: 0.68, depth: 1.15 },
  loam: { label: "Loam", influence: 1.05, depth: 0.9 },
  silt: { label: "Silt", influence: 1.22, depth: 0.78 },
  clay: { label: "Clay", influence: 1.38, depth: 0.66 },
  gravel: { label: "Gravel", influence: 0.82, depth: 1.02 },
};
const soilDescriptions = {
  sand: "Drains water quickly because of large particles, causing faster water drawdown and lower water retention.",
  loam: "Holds a balanced amount of water and allows moderate drainage, so water drawdown is usually steady and controlled.",
  clay: "Holds water for a long time because of very small particles, resulting in slower water drawdown and poor drainage.",
};
const soilImages = {
  loam: "/groundwater-viewer/assets/soil/loam.png",
  sand: "/groundwater-viewer/assets/soil/sand.png",
  clay: "/groundwater-viewer/assets/soil/clay.png",
};
const defaultSoilByLevel = {
  1: "loam",
  2: "loam",
  3: "loam",
};
const wellPresentation = {
  "W-1": {
    name: "UP Pumping",
    location: "Batong Malake UP Pumping",
    sectionLocation: "Batong Malake Los Baños",
    active: true,
  },
  "W-2": {
    name: "DOST Monitoring",
    location: "Quezon City DOST",
    sectionLocation: "DOST Los Baños",
    active: true,
  },
  "W-3": {
    name: "Pili Pumping",
    location: "Pili Drive 1251",
    sectionLocation: "Pili Drive Los Baños",
    active: true,
  },
  "W-4": {
    name: "Calamba Monitoring",
    location: "SM City Calamba",
    sectionLocation: "Calamba Laguna",
    active: false,
  },
};
const wellMetrics = {
  "W-1": {
    oxygen: 7.2,
    ph: 7.6,
    temperature: 27.7,
    salinity: 0.9,
    tds: 536,
    gwLevel: 12.0,
  },
  "W-2": {
    oxygen: 6.9,
    ph: 7.3,
    temperature: 27.1,
    salinity: 0.7,
    tds: 488,
    gwLevel: 10.8,
  },
  "W-3": {
    oxygen: 7.4,
    ph: 7.5,
    temperature: 28.2,
    salinity: 1.0,
    tds: 552,
    gwLevel: 13.6,
  },
  "W-4": {
    oxygen: 6.4,
    ph: 7.1,
    temperature: 28.7,
    salinity: 1.3,
    tds: 611,
    gwLevel: 14.2,
  },
};
const sensorProfiles = [
  {
    shortName: "Water level",
    model: "SS634 Water Level Pressure Sensor",
    description: "Submersible pressure sensor for groundwater depth.",
    specs: {
      Range: "0–60 m water depth",
      Accuracy: "±0.5% full scale at 25 °C",
      Response: "<4 ms",
      Protection: "IP68",
    },
  },
  {
    shortName: "pH",
    model: "SEN0161-V2 Analog pH Sensor",
    description: "Industrial probe for continuous water pH monitoring.",
    specs: {
      Range: "pH 0–14",
      Accuracy: "±0.1 pH at 25 °C",
      Response: "<1 min",
      "Water temperature": "0–60 °C",
    },
  },
  {
    shortName: "Temperature",
    model: "DS18B20 Waterproof Temperature Sensor",
    description: "Waterproof digital temperature probe.",
    specs: {
      Range: "−55 to 125 °C",
      Accuracy: "±0.05 °C from −10 to 85 °C",
      Resolution: "9–12 bit selectable",
      Probe: "Stainless steel",
    },
  },
  {
    shortName: "EC / TDS / Salinity",
    model: "Atlas Scientific K1 EZO Conductivity Kit",
    description: "Conductivity probe with derived TDS and salinity.",
    specs: {
      "EC range": "5–200,000 µS/cm",
      Accuracy: "±2 µS/cm",
      Outputs: "EC, TDS (KCl), salinity (PSS-78)",
      "Water temperature": "0–70 °C",
    },
  },
];

const headsGroup = new THREE.Group();
const arrowsGroup = new THREE.Group();
const wellsGroup = new THREE.Group();
const frameGroup = new THREE.Group();
scene.add(headsGroup, arrowsGroup, wellsGroup, frameGroup);

// Lighting
scene.add(new THREE.HemisphereLight(0xffffff, 0x162033, 2.35));
const sun = new THREE.DirectionalLight(0xffffff, 3.0);
sun.position.set(-18, 30, 24);
scene.add(sun);

// Geometry and rendering helpers
