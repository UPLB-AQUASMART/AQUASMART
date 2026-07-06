"use client";

import { ChevronDown, CloudRain, Info } from "lucide-react";
import { ChartGrid, projectionDays } from "./dashboardData";
import type { ProjectionDay } from "./openMeteoWeather";
import { Rainfall2DModel } from "./Rainfall2DModel";
import { Rainfall3DModel } from "./Rainfall3DModel";
import { rainfallVolumeLiters } from "./rainfallModelUtils";
import styles from "./PrecipitationSection.module.css";
import { useState } from "react";
import type { CSSProperties } from "react";

const hourlyLabels = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"];

function hourlyPeriodLabel(index: number) {
  const start = hourlyLabels[index] ?? hourlyLabels[0];
  const endHour = Math.min(index * 4 + 3, 23);
  return `${start}-${String(endHour).padStart(2, "0")}:59`;
}

function peakRainfallIndex(values: number[]) {
  return values.reduce((peakIndex, value, index) => (
    value > (values[peakIndex] ?? 0) ? index : peakIndex
  ), 0);
}

function roundHourlyRain(value = 0) {
  return Math.round(value * 10) / 10;
}

type PrecipitationSectionProps = {
  projectionDays?: ProjectionDay[];
};

export function PrecipitationSection({ projectionDays: liveProjectionDays }: PrecipitationSectionProps) {
  const [selectedDayIndex, setSelectedDayIndex] = useState(5);
  const [selectedHourIndex, setSelectedHourIndex] = useState(() => peakRainfallIndex(projectionDays[5]?.hourlyRain ?? []));
  const [rainfallView, setRainfallView] = useState<"2d" | "3d">("2d");
  const days = liveProjectionDays?.length ? liveProjectionDays : projectionDays;
  const safeSelectedDayIndex = Math.min(selectedDayIndex, days.length - 1);
  const selectedDay = days[safeSelectedDayIndex] ?? days[0];
  const maxHourlyRain = Math.max(...selectedDay.hourlyRain, 1);
  const safeSelectedHourIndex = Math.max(0, Math.min(selectedHourIndex, selectedDay.hourlyRain.length - 1));
  const selectedHourPeriodLabel = hourlyPeriodLabel(safeSelectedHourIndex);
  const rainfallMm = roundHourlyRain(selectedDay.hourlyRain[safeSelectedHourIndex] ?? 0);
  const rainfallLiters = rainfallVolumeLiters(rainfallMm);
  const isDry = rainfallMm <= 0;
  const rainIntensity = isDry ? 0 : Math.min(Math.max(rainfallMm / maxHourlyRain, 0.08), 1);
  const waterLevelPercent = isDry ? 0 : Math.min(Math.max((rainfallMm / maxHourlyRain) * 100, 8), 100);
  const fieldSceneStyle = {
    "--water-level": `${waterLevelPercent}%`,
    "--water-opacity": isDry ? "0" : "1",
    "--rain-opacity": isDry ? "0" : `${0.18 + rainIntensity * 0.62}`,
    "--rain-speed": `${Math.max(460, 1480 - rainIntensity * 880)}ms`,
    "--rain-spacing-primary": `${Math.max(18, 34 - rainIntensity * 12)}px`,
    "--rain-spacing-secondary": `${Math.max(25, 48 - rainIntensity * 14)}px`,
  } as CSSProperties;
  const selectedPeriodLabel = `${selectedDay.day}, ${selectedDay.date}`;
  const selectedHourlyPeriodLabel = `${selectedPeriodLabel}, ${selectedHourPeriodLabel}`;
  const activeViewLabel = rainfallView === "2d" ? "Rainfall depth equivalent view" : "3D rainfall equivalent field model";

  return (
    <section className={styles.section} aria-labelledby="precipitation-title">
      <div className={styles.sectionTitle}>
        <CloudRain aria-hidden="true" size={34} />
        <div>
          <h2 id="precipitation-title">Precipitation</h2>
          <p>Visualize rainfall patterns and short-term forecasts.</p>
        </div>
      </div>

      <div className={styles.grid}>
        <article className={styles.visualCard}>
          <div className={styles.cardHeader}>
            <h3>Rainfall Visualization</h3>
            <div className={styles.viewSwitch} data-view={rainfallView} role="group" aria-label="Rainfall visualization view">
              <button
                type="button"
                aria-pressed={rainfallView === "2d"}
                onClick={() => setRainfallView("2d")}
              >
                2D
              </button>
              <button
                type="button"
                aria-pressed={rainfallView === "3d"}
                onClick={() => setRainfallView("3d")}
              >
                3D
              </button>
            </div>
          </div>

          <div className={styles.rainfallModel} key={`${selectedDay.date}-${rainfallView}`}>
            <div className={styles.modelReadout}>
              <span>{activeViewLabel}</span>
              <strong>{rainfallMm} mm</strong>
              <small>
                Projected rainfall from {selectedHourPeriodLabel} over a 1 hectare crop field. Daily total: {selectedDay.rain} mm.
              </small>
            </div>

            <div className={`${styles.modelStage} ${rainfallView === "3d" ? styles.modelStage3d : ""}`}>
              {rainfallView === "2d" ? (
                <Rainfall2DModel
                  rainfallMm={rainfallMm}
                  rainfallLiters={rainfallLiters}
                  selectedDate={`${selectedDay.date}, ${selectedHourPeriodLabel}`}
                  selectedPeriodLabel={selectedHourlyPeriodLabel}
                  style={fieldSceneStyle}
                />
              ) : (
                <Rainfall3DModel
                  rainfallMm={rainfallMm}
                  rainfallLiters={rainfallLiters}
                  rainIntensity={rainIntensity}
                  selectedDate={`${selectedDay.date}, ${selectedHourPeriodLabel}`}
                  selectedPeriodLabel={selectedHourlyPeriodLabel}
                  style={fieldSceneStyle}
                />
              )}
            </div>
          </div>
        </article>

        <article className={styles.projectionCard}>
          <div className={styles.cardHeader}>
            <h3>7-Day Precipitation Projection</h3>
            <button className={styles.rangeButton} type="button">
              Next 7 days <ChevronDown aria-hidden="true" size={16} />
            </button>
          </div>
          <p className={styles.helper}>Select day for visualization</p>
          <div className={styles.dayPicker}>
            {days.map((item, index) => (
              <button
                key={item.date}
                type="button"
                aria-pressed={index === safeSelectedDayIndex}
                className={index === safeSelectedDayIndex ? styles.activeDay : undefined}
                onClick={() => {
                  setSelectedDayIndex(index);
                  setSelectedHourIndex(peakRainfallIndex(item.hourlyRain));
                }}
              >
                <strong>{item.day}</strong>
                <span>{item.date}</span>
              </button>
            ))}
          </div>
          <div className={styles.projectionTransition} key={selectedDay.date}>
            <div className={styles.barChart}>
              <div className={styles.gridLines}><ChartGrid /></div>
              {selectedDay.hourlyRain.map((value, index) => (
                <div
                  key={hourlyLabels[index]}
                  className={`${styles.barColumn}${index === safeSelectedHourIndex ? ` ${styles.activeHour}` : ""}`}
                >
                  <strong>{value > 0 ? `${value} mm` : "0 mm"}</strong>
                  <span style={{ height: `${value > 0 ? Math.max((value / maxHourlyRain) * 100, 8) : 3}%` }} />
                </div>
              ))}
            </div>
            <div className={styles.xAxisLabels} aria-label="Hours of the day">
              {hourlyLabels.map((hour, index) => (
                <span key={hour} className={index === safeSelectedHourIndex ? styles.activeHourLabel : undefined}>{hour}</span>
              ))}
            </div>
            <div className={styles.timeSlider}>
              <label htmlFor="rainfall-time-slider">
                <span>Time projection</span>
                <strong>{selectedDay.date}, {selectedHourPeriodLabel}</strong>
              </label>
              <input
                id="rainfall-time-slider"
                type="range"
                min="0"
                max={Math.max(selectedDay.hourlyRain.length - 1, 0)}
                step="1"
                value={safeSelectedHourIndex}
                onChange={(event) => setSelectedHourIndex(Number(event.target.value))}
                aria-label={`Rainfall time projection for ${selectedPeriodLabel}`}
              />
              <div className={styles.timeTicks} aria-hidden="true">
                {hourlyLabels.map((hour) => (
                  <span key={hour}>{hour}</span>
                ))}
              </div>
            </div>
            <div className={styles.note}>
              <Info aria-hidden="true" size={17} />
              Showing hourly rainfall for {selectedDay.day}, {selectedDay.date}. Total: {selectedDay.rain} mm.
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
