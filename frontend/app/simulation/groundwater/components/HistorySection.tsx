import { useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import type { Well } from "../types";
import { ChartDropdown } from "./ChartDropdown";
import styles from "./HistorySection.module.css";

const years = ["2016", "2017", "2018", "2019", "2020"] as const;
type HistoryYear = (typeof years)[number];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const yearOffsets: Record<HistoryYear, number> = {
  "2016": -9,
  "2017": -6,
  "2018": -3,
  "2019": 2,
  "2020": 0,
};
const monthlyOffsets = [-4, -1, 2, 5, 1, 4];
const fallbackWell: Well = {
  id: 0,
  name: "Well",
  discharge: 0,
  x: 50,
  y: 50,
  readings: {
    dissolvedOxygen: 7,
    ph: 7.4,
    temperature: 27,
    salinity: 1,
    tds: 550,
    electricalConductivity: 780,
    groundwaterLevel: 12.5,
  },
};

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getScoreStatus(score: number) {
  if (score >= 80) return "Excellent";
  if (score >= 65) return "Good";
  if (score >= 50) return "Fair";
  return "Needs Review";
}

function getWellMetricScores(well: Well, year: HistoryYear) {
  const yearAdjustment = yearOffsets[year] * 0.45;
  return [
    [
      "Salinity",
      clampScore(96 - well.readings.salinity * 34 + yearAdjustment),
      "#2f80ed",
    ],
    [
      "Temperature",
      clampScore(
        94 - Math.abs(well.readings.temperature - 27) * 10 + yearAdjustment,
      ),
      "#ef5b75",
    ],
    [
      "pH",
      clampScore(98 - Math.abs(well.readings.ph - 7.4) * 70 + yearAdjustment),
      "#4dbb5d",
    ],
    [
      "Electrical Conductivity",
      clampScore(
        100 -
          Math.max(0, well.readings.electricalConductivity - 650) / 7 +
          yearAdjustment,
      ),
      "#a855f7",
    ],
  ] satisfies [string, number, string][];
}

function getBaseWaterScore(well: Well, year: HistoryYear) {
  const metrics = getWellMetricScores(well, year);
  const dissolvedOxygenScore = clampScore(well.readings.dissolvedOxygen * 11);
  const groundwaterScore = clampScore(100 - Math.abs(well.readings.groundwaterLevel - 12.5) * 8);
  const metricAverage =
    metrics.reduce((sum, [, value]) => sum + value, 0) / metrics.length;
  return clampScore(metricAverage * 0.72 + dissolvedOxygenScore * 0.16 + groundwaterScore * 0.12);
}

function getWaterScoreHistory(well: Well, year: HistoryYear) {
  const baseScore = getBaseWaterScore(well, year);
  const wellSignature = ((well.id * 3) % 7) - 3;
  return monthlyOffsets.map((offset, index) =>
    clampScore(baseScore + offset + wellSignature + (index % 2 === 0 ? -1 : 1)),
  );
}

type HistorySectionProps = {
  wells: Well[];
};

export function HistorySection({ wells }: HistorySectionProps) {
  const [selectedYear, setSelectedYear] = useState<HistoryYear>("2020");
  const [selectedWellId, setSelectedWellId] = useState(
    String(wells[0]?.id ?? ""),
  );
  const [wellDropdownOpen, setWellDropdownOpen] = useState(false);
  const activeWellId = wells.some((well) => String(well.id) === selectedWellId)
    ? selectedWellId
    : String(wells[0]?.id ?? "");
  const selectedWell =
    wells.find((well) => String(well.id) === activeWellId) ??
    wells[0] ??
    fallbackWell;
  const wellOptions = wells.map((well) => ({
    label: well.name,
    value: String(well.id),
  }));
  const metricScores = getWellMetricScores(selectedWell, selectedYear);
  const selectedScores = getWaterScoreHistory(selectedWell, selectedYear);
  const selectedScore = selectedScores[selectedScores.length - 1];
  const scoreStatus = getScoreStatus(selectedScore);

  const historyLineData = useMemo(
    () => ({
      labels: months,
      datasets: [
        {
          label: `${selectedWell.name} ${selectedYear} Water Score`,
          data: selectedScores,
          borderColor: "#2563eb",
          backgroundColor: "rgba(37, 99, 235, 0.14)",
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.38,
        },
      ],
    }),
    [selectedScores, selectedWell.name, selectedYear],
  );

  return (
    <article className={styles.section}>
      <div className={styles.header}>
        <div className={styles.sectionTitle}>
          <h3>Water Score and Historical Data</h3>
          <p>
            View the water score from the current groundwater dataset and recent
            trends.
          </p>
        </div>
        <div className={styles.wellSelector}>
          <ChartDropdown
            id="history-well"
            label="Well"
            options={wellOptions}
            value={activeWellId}
            open={wellDropdownOpen}
            onOpenChange={setWellDropdownOpen}
            onChange={setSelectedWellId}
          />
        </div>
      </div>
      <div className={styles.historyGrid}>
        <div className={styles.scoreCard}>
          <div
            className={styles.scoreRing}
            style={{
              background: `radial-gradient(circle, #fff 56%, transparent 57%), conic-gradient(#35aee2 0 ${selectedScore}%, #e6f2fa ${selectedScore}% 100%)`,
            }}
          >
            <strong>{selectedScore}</strong>
            <span>/100</span>
            <em>{scoreStatus}</em>
          </div>
          {metricScores.map(([label, value, color]) => (
            <div className={styles.scoreMetric} key={label}>
              <span>{label}</span>
              <b>{value}%</b>
              <i>
                <em
                  style={{
                    width: `${value}%`,
                    background: color,
                  }}
                />
              </i>
            </div>
          ))}
        </div>
        <div className={styles.historyChart}>
          <div className={styles.yearTabs}>
            {years.map((year) => (
              <button
                className={year === selectedYear ? styles.activeYear : ""}
                key={year}
                type="button"
                onClick={() => setSelectedYear(year)}
                aria-pressed={year === selectedYear}
              >
                {year}
              </button>
            ))}
          </div>
          <div className={styles.chartCanvas}>
            <Line
              data={historyLineData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: "index", intersect: false },
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: (context) =>
                        `${selectedWell.name} water score: ${context.parsed.y}/100`,
                    },
                  },
                },
                scales: {
                  y: {
                    min: 0,
                    max: 100,
                    title: { display: true, text: "Water Score" },
                    ticks: { stepSize: 20 },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
