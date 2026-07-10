export type ReadingKey =
  | "dissolvedOxygen"
  | "ph"
  | "temperature"
  | "salinity"
  | "tds"
  | "electricalConductivity"
  | "groundwaterLevel";

export type Readings = Record<ReadingKey, number>;

export type Well = {
  id: number;
  name: string;
  discharge: number;
  x: number;
  y: number;
  readings: Readings;
};

export type ChartParameterKey =
  | "discharge"
  | "dissolvedOxygen"
  | "ph"
  | "temperature"
  | "salinity"
  | "tds"
  | "electricalConductivity"
  | "groundwaterLevel";

export type ChartDropdownOption<T extends string> = {
  label: string;
  value: T;
};
