import type { ChartDropdownOption, ChartParameterKey } from "./types";

export const timeRangeOptions = [
  "Last 3 Months",
  "Last 6 Months",
  "Last 12 Months",
] as const;

export const chartParameterOptions: ChartDropdownOption<ChartParameterKey>[] = [
  { label: "Discharge", value: "discharge" },
  { label: "DO (mg/L)", value: "dissolvedOxygen" },
  { label: "pH", value: "ph" },
  { label: "Temp (°C)", value: "temperature" },
  { label: "Salinity (ppt)", value: "salinity" },
  { label: "TDS (mg/L)", value: "tds" },
  { label: "EC (µS/cm)", value: "electricalConductivity" },
  { label: "GW Level (m)", value: "groundwaterLevel" },
];

export const chartParameterMeta: Record<
  ChartParameterKey,
  { label: string; axis: string; spread: number }
> = {
  discharge: { label: "Discharge", axis: "Discharge (m3/day)", spread: 18 },
  dissolvedOxygen: { label: "DO", axis: "DO (mg/L)", spread: 0.35 },
  ph: { label: "pH", axis: "pH", spread: 0.2 },
  temperature: { label: "Temperature", axis: "Temp (deg C)", spread: 2 },
  salinity: { label: "Salinity", axis: "Salinity (ppt)", spread: 0.08 },
  tds: { label: "TDS", axis: "TDS (mg/L)", spread: 28 },
  electricalConductivity: { label: "EC", axis: "EC (uS/cm)", spread: 42 },
  groundwaterLevel: { label: "GW Level", axis: "GW Level (m)", spread: 0.55 },
};

export const chartOffsetPattern = [
  0, 0.3, 0.58, -0.12, -0.36, 0.12, -0.52, -0.08, 0.36, -0.62, -0.18, 0.2,
  0.52, 0.36,
];
