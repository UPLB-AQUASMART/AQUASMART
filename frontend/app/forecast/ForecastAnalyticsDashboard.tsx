"use client";

import { CloudRain, Info } from "lucide-react";
import { EtoDemandSection } from "./components/EtoDemandSection";
import type { ForecastPageWeatherData } from "./components/openMeteoWeather";
import { PrecipitationSection } from "./components/PrecipitationSection";
import { RainProbabilitySection } from "./components/RainProbabilitySection";
import { WeatherAnalyticsSection } from "./components/WeatherAnalyticsSection";
import styles from "./ForecastAnalyticsDashboard.module.css";

type ForecastAnalyticsDashboardProps = {
  weatherData?: ForecastPageWeatherData | null;
};

export function ForecastAnalyticsDashboard({ weatherData }: ForecastAnalyticsDashboardProps) {
  return (
    <section className={styles.dashboard} aria-labelledby="weather-analytics-title">
      <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.titleGroup}>
            <CloudRain aria-hidden="true" size={32} />
            <div>
              <h2 id="weather-analytics-title">Weather Analytics</h2>
              <p>Live data and forecasts to support smarter irrigation decisions.</p>
            </div>
          </div>
          <span className={styles.sourcePill}>
            Data source: Open-Meteo
            <Info aria-hidden="true" size={16} />
          </span>
        </header>

        <WeatherAnalyticsSection data={weatherData?.analytics} />
        <PrecipitationSection projectionDays={weatherData?.precipitation} />
        <RainProbabilitySection dayLabels={weatherData?.factorDayLabels} liveFactors={weatherData?.factors} />
        <EtoDemandSection data={weatherData?.eto} />
      </div>
    </section>
  );
}
