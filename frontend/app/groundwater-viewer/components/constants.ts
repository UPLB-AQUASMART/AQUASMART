export const VIEWER_IMPORT_MAP = {
  imports: {
    three: "https://unpkg.com/three@0.184.0/build/three.module.js",
    "three/addons/": "https://unpkg.com/three@0.184.0/examples/jsm/",
  },
};

export const metricCards = [
  {
    icon: "O₂",
    label: "Dissolved Oxygen",
    unit: "mg/L",
    metric: "oxygen",
    step: "0.1",
    value: "7.2",
  },
  {
    icon: "pH",
    label: "pH Balance",
    unit: "pH",
    metric: "ph",
    step: "0.1",
    value: "7.6",
  },
  {
    icon: "°C",
    label: "Temperature",
    unit: "degrees C",
    metric: "temperature",
    step: "0.1",
    value: "27.7",
  },
  {
    icon: "S",
    label: "Salinity",
    unit: "ppt",
    metric: "salinity",
    step: "0.1",
    value: "0.9",
  },
  {
    icon: "T",
    label: "TDS",
    unit: "mg/L",
    metric: "tds",
    step: "1",
    value: "536",
  },
  {
    icon: "GW",
    label: "GW Level",
    unit: "meters",
    metric: "gwLevel",
    step: "0.1",
    value: "12.0",
  },
];

export const soilOptions = ["sand", "loam", "clay"] as const;

export const rechargeModes = [
  {
    value: "uniform",
    label: "Uniform",
    note: "Same recharge everywhere",
    icon: "wi:raindrops",
    active: true,
  },
  {
    value: "variable",
    label: "Variable",
    note: "Variable recharge by zone",
    icon: "wi:raindrops",
  },
  {
    value: "zoned",
    label: "Zoned",
    note: "Variable recharge by zones",
    icon: "streamline-color:map-fold-flat",
    disabled: true,
  },
];

export const planLegendItems = [
  ["head", "Hydraulic head: low to high"],
  ["contour", "Equal-head contour"],
  ["flow", "Groundwater flow"],
  ["well", "MODFLOW well cells"],
  ["stream", "River/stream cells"],
] as const;
