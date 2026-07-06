"use client";

import { Leaf, Sun, Thermometer } from "lucide-react";
import {
  monthlyHumidity,
  monthlyPrecipitation,
  monthlyTemperature,
  months,
  polyline,
} from "./dashboardData";
import type { ClimateOverviewData } from "./openMeteoWeather";
import styles from "./WeatherAnalyticsSection.module.css";
import { useState } from "react";

type WeatherAnalyticsSectionProps = {
  data?: ClimateOverviewData;
};

export function WeatherAnalyticsSection({ data }: WeatherAnalyticsSectionProps) {
  const [temperatureUnit, setTemperatureUnit] = useState<"C" | "F">("C");
  const chartHeight = 300;
  const chartWidth = 700;
  const chartMonths = data?.months ?? months;
  const precipitation = data?.monthlyPrecipitation ?? monthlyPrecipitation;
  const temperature = data?.monthlyTemperature ?? monthlyTemperature;
  const humidity = data?.monthlyHumidity ?? monthlyHumidity;
  const currentTemperatureC = data?.currentTemperatureC ?? 22;
  const currentTemperatureF = Math.round((currentTemperatureC * 9) / 5 + 32);
  const currentTemperature =
    temperatureUnit === "C" ? currentTemperatureC : currentTemperatureF;
  const precipitationMax = Math.max(40, ...precipitation);
  const temperatureMin = -10;
  const temperatureMax = 40;
  const temperatureRange = temperatureMax - temperatureMin;
  const temperaturePoints = temperature
    .map((value, index) => {
      const x = (index / (temperature.length - 1)) * chartWidth;
      const y = ((temperatureMax - value) / temperatureRange) * chartHeight;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <section className={styles.grid} aria-label="Weather analytics overview">
      <article className={styles.card}>
        <div className={styles.cardHeader}>
          <h3>Monthly Climate Overview</h3>
          <button type="button" className={styles.periodButton}>
            Last 6 months
          </button>
        </div>
        <div className={styles.chartShell}>
          <div className={styles.axisLabels}>
            <span>Temperature (°C)</span>
            <span>Relative Humidity (%)</span>
          </div>
          <div className={styles.chart}>
            <div className={styles.leftScale} aria-hidden="true">
              {[40, 30, 20, 10, 0, -10].map((value) => (
                <span key={value}>{value}</span>
              ))}
            </div>
            <div className={styles.rightScale} aria-hidden="true">
              {[100, 75, 50, 25, 0].map((value) => (
                <span key={value}>{value}</span>
              ))}
            </div>
            <div className={styles.gridLines}>
              {Array.from({ length: 6 }).map((_, index) => (
                <span key={index} style={{ top: `${(index / 5) * 100}%` }} />
              ))}
            </div>
            <div className={styles.bars}>
              {precipitation.map((value, index) => (
                <span
                  key={chartMonths[index]}
                  style={{ height: `${Math.min((value / precipitationMax) * 100, 100)}%` }}
                />
              ))}
            </div>
            <svg
              className={styles.lineChart}
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              aria-hidden="true"
            >
              <polyline
                points={polyline(humidity, chartWidth, chartHeight, 100)}
                className={styles.humidityLine}
              />
              <polyline
                points={temperaturePoints}
                className={styles.temperatureLine}
              />
              {humidity.map((value, index) => {
                const x = (index / (humidity.length - 1)) * chartWidth;
                const y = chartHeight - (value / 100) * chartHeight;
                return (
                  <circle
                    key={chartMonths[index]}
                    cx={x}
                    cy={y}
                    r="5"
                    className={styles.humidityDot}
                  />
                );
              })}
              {temperature.map((value, index) => {
                const x =
                  (index / (temperature.length - 1)) * chartWidth;
                const y =
                  ((temperatureMax - value) / temperatureRange) * chartHeight;
                return (
                  <circle
                    key={chartMonths[index]}
                    cx={x}
                    cy={y}
                    r="5"
                    className={styles.temperatureDot}
                  />
                );
              })}
            </svg>
            <div className={styles.months}>
              {chartMonths.map((month) => (
                <span key={month}>{month}</span>
              ))}
            </div>
          </div>
          <div className={styles.legend}>
            <span>
              <i className={styles.blueDash} />
              Relative Humidity (%)
            </span>
            <span>
              <i className={styles.navyLine} />
              Temperature (°C)
            </span>
            <span>
              <i className={styles.orangeBar} />
              Precipitation (mm)
            </span>
          </div>
        </div>
      </article>

      <article className={styles.temperatureCard}>
        <div className={styles.tempIntro}>
          <span className={styles.iconBubble}>
            <Thermometer aria-hidden="true" size={34} />
          </span>
          <div>
            <h3>Temperature</h3>
            <p>
              Air temperature shows how hot or cool the day is and helps guide
              crop water demand and irrigation timing.
            </p>
          </div>
        </div>
        <div className={styles.controls}>
          <button
            type="button"
            className={
              temperatureUnit === "C" ? styles.activeControl : undefined
            }
            aria-pressed={temperatureUnit === "C"}
            onClick={() => setTemperatureUnit("C")}
          >
            °C
          </button>
          <button
            type="button"
            className={
              temperatureUnit === "F" ? styles.activeControl : undefined
            }
            aria-pressed={temperatureUnit === "F"}
            onClick={() => setTemperatureUnit("F")}
          >
            °F
          </button>
        </div>
        <div className={styles.weatherSummary} key={temperatureUnit}>
          <Sun aria-hidden="true" size={48} />
          <strong>{currentTemperature}°</strong>
          <span>{data?.condition ?? "Sunny"}</span>
          <small>{data?.todayLabel ?? "Today, Friday, 1 Nov"}</small>
        </div>
        <div className={styles.recommendation}>
          <Leaf aria-hidden="true" size={34} />
          <div>
            <strong>Recommendation</strong>
            <p>
              {data?.recommendation ?? "Warm conditions and low rain support monitoring soil moisture before irrigation."}
            </p>
          </div>
        </div>
      </article>
    </section>
  );
}
