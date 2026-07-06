"use client";

import {
  ChevronDown,
  ChevronUp,
  Cloud,
  Droplets,
  FileText,
  Gauge,
  Info,
  Leaf,
  Percent,
  Wind,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { polyline } from "./dashboardData";
import type { LiveFactorData } from "./openMeteoWeather";
import styles from "./RainProbabilitySection.module.css";
import { useMemo, useState } from "react";

type ForecastFactor = {
  id: string;
  label: string;
  value: string;
  description: string;
  formula: string;
  content: string;
  source: string;
  sourceLabel: string;
  recommendationTitle: string;
  recommendation: string;
  chartTitle: string;
  unit: string;
  chartMax: number;
  Icon: LucideIcon;
  series: Array<{
    label: string;
    color: "max" | "avg" | "min";
    values: number[];
  }>;
};

const defaultDayLabels = [
  { label: "Mon", date: "27 Oct" },
  { label: "Tue", date: "28 Oct" },
  { label: "Wed", date: "29 Oct" },
  { label: "Thu", date: "30 Oct" },
  { label: "Fri", date: "31 Oct" },
  { label: "Sat", date: "1 Nov" },
  { label: "Sun", date: "2 Nov" },
];

const forecastFactorOptions: ForecastFactor[] = [
  {
    id: "chance-of-rain",
    label: "Chance of Rain",
    value: "18%",
    description: "Chance of measurable rain today",
    formula: "Confidence (C) x Area with rain (A)",
    content: "Based on humidity, cloud cover, and forecast precipitation",
    source: "Open-Meteo precipitation probability",
    sourceLabel: "What is chance of rain?",
    recommendationTitle: "Recommendation",
    recommendation:
      "Low rain probability. Irrigation may still be needed if soil moisture remains low.",
    chartTitle: "7-Day Rain Probability",
    unit: "%",
    chartMax: 100,
    Icon: Percent,
    series: [
      { label: "Max (%)", color: "max", values: [20, 25, 35, 40, 45, 55, 30] },
      { label: "Avg (%)", color: "avg", values: [10, 15, 20, 22, 25, 30, 18] },
      { label: "Min (%)", color: "min", values: [5, 8, 12, 13, 15, 18, 8] },
    ],
  },
  {
    id: "wind-speed",
    label: "Wind Speed",
    value: "12 km/h",
    description: "Average wind speed near the field today",
    formula: "10 m wind speed converted to km/h",
    content: "Based on Open-Meteo hourly wind speed at 10 meters",
    source: "Open-Meteo wind_speed_10m",
    sourceLabel: "What is wind speed?",
    recommendationTitle: "Recommendation",
    recommendation:
      "Moderate wind may increase evapotranspiration. Check soil moisture before extending irrigation intervals.",
    chartTitle: "7-Day Wind Speed",
    unit: "km/h",
    chartMax: 30,
    Icon: Wind,
    series: [
      {
        label: "Max (km/h)",
        color: "max",
        values: [18, 20, 22, 19, 24, 26, 21],
      },
      {
        label: "Avg (km/h)",
        color: "avg",
        values: [10, 12, 14, 13, 16, 18, 12],
      },
      { label: "Min (km/h)", color: "min", values: [5, 6, 8, 7, 10, 11, 6] },
    ],
  },
  {
    id: "wind-gusts",
    label: "Wind Gusts",
    value: "24 km/h",
    description: "Peak wind gust expected today",
    formula: "Highest hourly gust over the selected day",
    content: "Based on Open-Meteo hourly wind gust forecasts",
    source: "Open-Meteo wind_gusts_10m",
    sourceLabel: "What are wind gusts?",
    recommendationTitle: "Recommendation",
    recommendation:
      "Stronger gusts can dry exposed soil faster. Avoid overhead irrigation during peak gust periods.",
    chartTitle: "7-Day Wind Gusts",
    unit: "km/h",
    chartMax: 45,
    Icon: Gauge,
    series: [
      {
        label: "Max (km/h)",
        color: "max",
        values: [24, 26, 31, 28, 35, 38, 29],
      },
      {
        label: "Avg (km/h)",
        color: "avg",
        values: [16, 17, 21, 19, 24, 26, 18],
      },
      {
        label: "Min (km/h)",
        color: "min",
        values: [9, 10, 13, 11, 15, 16, 10],
      },
    ],
  },
  {
    id: "humidity",
    label: "Humidity",
    value: "61%",
    description: "Relative humidity expected today",
    formula: "Water vapor ratio relative to saturation",
    content: "Based on Open-Meteo hourly relative humidity at 2 meters",
    source: "Open-Meteo relative_humidity_2m",
    sourceLabel: "What is humidity?",
    recommendationTitle: "Recommendation",
    recommendation:
      "Moderate humidity can slow water loss. Pair this with soil readings before irrigating.",
    chartTitle: "7-Day Humidity",
    unit: "%",
    chartMax: 100,
    Icon: Droplets,
    series: [
      { label: "Max (%)", color: "max", values: [76, 78, 81, 74, 70, 68, 73] },
      { label: "Avg (%)", color: "avg", values: [58, 61, 64, 59, 55, 53, 57] },
      { label: "Min (%)", color: "min", values: [42, 46, 48, 44, 39, 37, 41] },
    ],
  },
  {
    id: "cloud-cover",
    label: "Cloud Cover",
    value: "18%",
    description: "Average sky coverage expected today",
    formula: "Cloud-covered sky fraction over time",
    content: "Based on Open-Meteo hourly total cloud cover forecasts",
    source: "Open-Meteo cloud_cover",
    sourceLabel: "What is cloud cover?",
    recommendationTitle: "Recommendation",
    recommendation:
      "Low cloud cover means stronger sunlight and possible higher crop water demand.",
    chartTitle: "7-Day Cloud Cover",
    unit: "%",
    chartMax: 100,
    Icon: Cloud,
    series: [
      { label: "Max (%)", color: "max", values: [35, 42, 58, 50, 45, 38, 32] },
      { label: "Avg (%)", color: "avg", values: [18, 24, 35, 30, 27, 22, 19] },
      { label: "Min (%)", color: "min", values: [8, 12, 20, 16, 14, 10, 9] },
    ],
  },
  {
    id: "soil-moisture",
    label: "Soil Moisture",
    value: "0.31",
    description: "Top-layer soil water estimate today",
    formula: "Volumetric water content for the top soil layer",
    content: "Based on Open-Meteo soil moisture model data near the surface",
    source: "Open-Meteo soil_moisture_0_to_1cm",
    sourceLabel: "What is soil moisture?",
    recommendationTitle: "Recommendation",
    recommendation:
      "Soil moisture is still low enough to monitor closely before delaying irrigation.",
    chartTitle: "7-Day Soil Moisture",
    unit: "m3/m3",
    chartMax: 0.5,
    Icon: Droplets,
    series: [
      {
        label: "Max",
        color: "max",
        values: [0.34, 0.36, 0.39, 0.35, 0.32, 0.31, 0.33],
      },
      {
        label: "Avg",
        color: "avg",
        values: [0.28, 0.3, 0.33, 0.31, 0.29, 0.27, 0.29],
      },
      {
        label: "Min",
        color: "min",
        values: [0.22, 0.24, 0.27, 0.25, 0.22, 0.21, 0.23],
      },
    ],
  },
];

const selectableOptionCount = forecastFactorOptions.length - 1;

type RainProbabilitySectionProps = {
  dayLabels?: Array<{ label: string; date: string }>;
  liveFactors?: Partial<Record<string, LiveFactorData>>;
};

export function RainProbabilitySection({ dayLabels, liveFactors }: RainProbabilitySectionProps) {
  const [selectedFactorId, setSelectedFactorId] = useState(
    forecastFactorOptions[0].id,
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const selectedFactor = useMemo(
    () => {
      const baseFactor =
        forecastFactorOptions.find((item) => item.id === selectedFactorId) ??
        forecastFactorOptions[0];
      const liveFactor = liveFactors?.[baseFactor.id];

      return liveFactor
        ? {
            ...baseFactor,
            value: liveFactor.value,
            recommendation: liveFactor.recommendation,
            series: liveFactor.series,
          }
        : baseFactor;
    },
    [liveFactors, selectedFactorId],
  );
  const SelectedIcon = selectedFactor.Icon;
  const chartWidth = 720;
  const chartHeight = 220;
  const xLabels = dayLabels?.length ? dayLabels : defaultDayLabels;
  const chartMax = Math.max(
    selectedFactor.chartMax,
    ...selectedFactor.series.flatMap((series) => series.values),
  );

  return (
    <section
      className={styles.grid}
      aria-label={`${selectedFactor.label} forecast factor`}
    >
      <article className={styles.chanceCard}>
        <div className={styles.factorContent} key={`${selectedFactor.id}-summary`}>
          <div className={styles.chanceHeader}>
            <span className={styles.percentBubble}>
              <SelectedIcon aria-hidden="true" size={42} />
            </span>
            <div>
              <h3>{selectedFactor.label}</h3>
              <p>
                <strong>{selectedFactor.value}</strong>{" "}
                {selectedFactor.description}
              </p>
            </div>
          </div>
        </div>

        <div className={styles.dropdown}>
          <button
            type="button"
            className={styles.dropdownButton}
            aria-expanded={isMenuOpen}
            aria-haspopup="listbox"
            onClick={() => setIsMenuOpen((value) => !value)}
          >
            <strong>{selectedFactor.label}</strong>
            <span>{selectableOptionCount} options</span>
            {isMenuOpen ? (
              <ChevronUp aria-hidden="true" size={22} />
            ) : (
              <ChevronDown aria-hidden="true" size={22} />
            )}
          </button>

          {isMenuOpen ? (
            <div
              className={styles.dropdownMenu}
              role="listbox"
              aria-label="Forecast factor"
            >
              {forecastFactorOptions.map((factor) => (
                <button
                  key={factor.id}
                  type="button"
                  role="option"
                  aria-selected={factor.id === selectedFactor.id}
                  className={
                    factor.id === selectedFactor.id
                      ? styles.selectedOption
                      : undefined
                  }
                  onClick={() => {
                    setSelectedFactorId(factor.id);
                    setIsMenuOpen(false);
                  }}
                >
                  {factor.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className={styles.factorContent} key={`${selectedFactor.id}-details`}>
          <div className={styles.rows}>
            <div className={styles.detailRow}>
              <Info aria-hidden="true" size={18} />
              <strong>Formula</strong>
              <span>{selectedFactor.formula}</span>
            </div>
            <div className={styles.detailRow}>
              <FileText aria-hidden="true" size={18} />
              <strong>Content</strong>
              <span>{selectedFactor.content}</span>
            </div>
            <div className={styles.detailRow}>
              <Info aria-hidden="true" size={18} />
              <strong>Source</strong>
              <span className={styles.sourceText} title={selectedFactor.source}>
                {selectedFactor.sourceLabel}
              </span>
            </div>
          </div>

          <div className={styles.greenNote}>
            <Leaf aria-hidden="true" size={34} />
            <div>
              <strong>{selectedFactor.recommendationTitle}</strong>
              <p>{selectedFactor.recommendation}</p>
            </div>
          </div>
        </div>
      </article>

      <article className={styles.chartCard}>
        <div className={styles.chartContent} key={`${selectedFactor.id}-chart`}>
          <div className={styles.cardHeader}>
            <h3>{selectedFactor.chartTitle}</h3>
            <button type="button">
              Next 7 days <ChevronDown aria-hidden="true" size={16} />
            </button>
          </div>
          <div className={styles.legend}>
            {selectedFactor.series.map((series) => (
              <span key={series.label}>
                <i className={styles[`${series.color}Dot`]} />
                {series.label}
              </span>
            ))}
          </div>
          <div className={styles.svgWrap}>
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              role="img"
              aria-label={`${selectedFactor.chartTitle} chart`}
            >
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
                <line
                  key={ratio}
                  x1="0"
                  x2={chartWidth}
                  y1={chartHeight - ratio * chartHeight}
                  y2={chartHeight - ratio * chartHeight}
                  className={styles.gridLine}
                />
              ))}
              {selectedFactor.series.map((series) => (
                <polyline
                  key={series.label}
                  points={polyline(
                    series.values,
                    chartWidth,
                    chartHeight,
                    chartMax,
                  )}
                  className={styles[`${series.color}Line`]}
                />
              ))}
              {selectedFactor.series[0].values.map((_, index) => {
                const x =
                  (index / (selectedFactor.series[0].values.length - 1)) *
                  chartWidth;
                return (
                  <g key={xLabels[index]?.date ?? index}>
                    {selectedFactor.series.map((series) => {
                      const y =
                        chartHeight -
                        (series.values[index] / chartMax) *
                          chartHeight;
                      return (
                        <circle
                          key={series.label}
                          cx={x}
                          cy={y}
                          r={series.color === "max" ? 7 : 6}
                          className={styles[`${series.color}Circle`]}
                        />
                      );
                    })}
                    <text
                      x={x}
                      y={
                        chartHeight -
                        (selectedFactor.series[0].values[index] /
                          chartMax) *
                          chartHeight -
                        14
                      }
                      textAnchor="middle"
                    >
                      {selectedFactor.series[0].values[index]}
                      {selectedFactor.unit === "%" ? "%" : ""}
                    </text>
                  </g>
                );
              })}
            </svg>
            <div className={styles.xLabels}>
              {xLabels.map((item) => (
                <span key={item.date}>
                  {item.label}
                  <small>{item.date}</small>
                </span>
              ))}
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}
