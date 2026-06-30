/*
  Static domain data for the AQUASMART groundwater viewer.

  Edit this file when changing well names, soil behavior, sensor specs,
  default water quality readings, or aquifer labels.
*/

export const aquiferLevelNames = {
  "Upper Aquifer": "Level 1",
  "Middle Aquifer": "Level 2",
  "Lower Aquifer": "Level 3",
};
export const aquiferLevelNumbers = {
  "Upper Aquifer": 1,
  "Middle Aquifer": 2,
  "Lower Aquifer": 3,
};

// Domain data, labels, sensor profiles, and default well presentation
export const soilDrawdownProfiles = {
  sand: { label: "Sand", influence: 0.68, depth: 1.15 },
  loam: { label: "Loam", influence: 1.05, depth: 0.9 },
  silt: { label: "Silt", influence: 1.22, depth: 0.78 },
  clay: { label: "Clay", influence: 1.38, depth: 0.66 },
  gravel: { label: "Gravel", influence: 0.82, depth: 1.02 },
};
export const soilDescriptions = {
  sand: "Drains water quickly because of large particles, causing faster water drawdown and lower water retention.",
  loam: "Holds a balanced amount of water and allows moderate drainage, so water drawdown is usually steady and controlled.",
  clay: "Holds water for a long time because of very small particles, resulting in slower water drawdown and poor drainage.",
};
export const soilImages = {
  loam: "./assets/soil/loam.png",
  sand: "./assets/soil/sand.png",
  clay: "./assets/soil/clay.png",
};
export const defaultSoilByLevel = {
  1: "loam",
  2: "loam",
  3: "loam",
};
export const wellPresentation = {
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
export const wellMetrics = {
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
export const sensorProfiles = [
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
