import type { CSSProperties } from "react";
import { formatLiters } from "./rainfallModelUtils";
import styles from "./Rainfall2DModel.module.css";

type Rainfall2DModelProps = {
  rainfallMm: number;
  rainfallLiters: number;
  selectedDate: string;
  selectedPeriodLabel: string;
  style: CSSProperties;
};

export function Rainfall2DModel({
  rainfallMm,
  rainfallLiters,
  selectedDate,
  selectedPeriodLabel,
  style,
}: Rainfall2DModelProps) {
  return (
    <div
      className={styles.field2d}
      style={style}
      aria-label={`${rainfallMm} millimeters of accumulated rainfall on ${selectedPeriodLabel} is about ${formatLiters(rainfallLiters)} liters over one hectare.`}
    >
      <div className={styles.rainLayer} aria-hidden="true" />
      <div className={styles.surfaceWater} aria-hidden="true" />
      <div className={styles.soilMoisture} aria-hidden="true" />
      <div className={styles.precipitationRuler} aria-hidden="true">
        <b>Rainfall (mm)</b>
        <span>20</span>
        <span>15</span>
        <span>10</span>
        <span>5</span>
        <span>0</span>
      </div>
      <div className={styles.waterLevelMarker} aria-hidden="true">
        <strong>Rainfall equivalent: {rainfallMm} mm</strong>
        <span>{formatLiters(rainfallLiters)} L across 1 ha on {selectedDate}</span>
      </div>
    </div>
  );
}
