"use client";

import { WeatherSection } from "@/app/components/home/WeatherSection";
import { ForecastAnalyticsDashboard } from "./ForecastAnalyticsDashboard";
import { useOpenMeteoWeather } from "./components/openMeteoWeather";

export function ForecastPageClient() {
  const { data, isLoading } = useOpenMeteoWeather();

  return (
    <>
      <WeatherSection
        forecastDetails={data?.details}
        forecastItems={data?.forecast}
        isForecastLoading={isLoading}
      />
      <ForecastAnalyticsDashboard weatherData={data} />
    </>
  );
}
