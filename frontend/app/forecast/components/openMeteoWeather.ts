"use client";

import { useEffect, useState } from "react";
import type { ForecastIcon, ForecastItem } from "@/app/data/home";

export type ForecastDetail = {
  title: string;
  chance: string;
  date: string;
  time: string;
  bullets: string[];
  recommendation: string;
  status: string;
  metrics: Array<[string, string]>;
};

export type ProjectionDay = {
  day: string;
  date: string;
  rain: number;
  hourlyRain: number[];
};

export type ClimateOverviewData = {
  months: string[];
  monthlyPrecipitation: number[];
  monthlyTemperature: number[];
  monthlyHumidity: number[];
  currentTemperatureC: number;
  condition: string;
  todayLabel: string;
  recommendation: string;
};

export type LiveFactorData = {
  value: string;
  recommendation: string;
  series: Array<{
    label: string;
    color: "max" | "avg" | "min";
    values: number[];
  }>;
};

export type EtoDemandData = {
  temperature: string;
  condition: string;
  dateLabel: string;
  outlook: string;
  recommendations: string[];
  demand: string;
  metrics: Array<{ label: string; value: string }>;
};

export type ForecastPageWeatherData = {
  forecast: ForecastItem[];
  details: ForecastDetail[];
  analytics: ClimateOverviewData;
  precipitation: ProjectionDay[];
  factorDayLabels: Array<{ label: string; date: string }>;
  factors: Partial<Record<string, LiveFactorData>>;
  eto: EtoDemandData;
  isFallbackLocation: boolean;
};

type Coordinates = {
  latitude: number;
  longitude: number;
};

type ForecastApiResponse = {
  timezone?: string;
  current?: {
    time: string;
    temperature_2m?: number;
    relative_humidity_2m?: number;
    precipitation?: number;
    weather_code?: number;
    cloud_cover?: number;
    wind_speed_10m?: number;
    wind_gusts_10m?: number;
  };
  hourly?: Record<string, Array<number | string | null> | undefined> & {
    time?: string[];
  };
  daily?: Record<string, Array<number | string | null> | undefined> & {
    time?: string[];
  };
};

type HistoricalApiResponse = {
  daily?: {
    time?: string[];
    temperature_2m_mean?: Array<number | null>;
    relative_humidity_2m_mean?: Array<number | null>;
    precipitation_sum?: Array<number | null>;
  };
};

const fallbackCoordinates: Coordinates = {
  latitude: 14.5995,
  longitude: 120.9842,
};

const hourlyRainLabels = [0, 4, 8, 12, 16, 20];

function round(value = 0, digits = 0) {
  const multiplier = 10 ** digits;
  return Math.round(value * multiplier) / multiplier;
}

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function validNumbers(values: Array<number | null | undefined>) {
  return values.filter((value): value is number => typeof value === "number" && Number.isFinite(value));
}

function stats(values: Array<number | null | undefined>) {
  const numbers = validNumbers(values);
  if (!numbers.length) return { min: 0, avg: 0, max: 0 };

  return {
    min: Math.min(...numbers),
    avg: average(numbers),
    max: Math.max(...numbers),
  };
}

function toDateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function parseDateOnly(date: string) {
  return new Date(`${date}T12:00:00`);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

function formatDate(date: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(undefined, options).format(parseDateOnly(date));
}

function formatTime(time?: string) {
  if (!time) return "";
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(time));
}

function weatherCondition(code = 0, cloudCover = 0, rainChance = 0) {
  if (code >= 95) return "Thunderstorm";
  if (code >= 80) return "Rain showers";
  if (code >= 61 || rainChance >= 70) return "Rainy";
  if (code >= 51) return "Light rain";
  if (code === 45 || code === 48) return "Foggy";
  if (code >= 2 || cloudCover >= 45) return "Cloudy";
  if (code === 1) return "Mostly clear";
  return "Sunny";
}

function weatherIcon(code = 0, cloudCover = 0, rainChance = 0): ForecastIcon {
  if (code >= 51 || rainChance >= 60) return "rain";
  if (code >= 2 || cloudCover >= 45) return "cloud";
  return "sun";
}

function weatherTitle(icon: ForecastIcon, condition: string) {
  if (icon === "rain") return condition.includes("Thunderstorm") ? "Thunderstorm" : "Heavy Rainfall";
  if (icon === "cloud") return condition.includes("Fog") ? "Foggy Conditions" : "Partly Cloudy";
  return "Today is Sunny";
}

function rainBullet(rainChance: number, precipitation: number) {
  if (rainChance >= 70 || precipitation >= 8) {
    return `There is a high chance of rainfall today, estimated at ${round(precipitation, 1)} mm.`;
  }

  if (rainChance >= 35 || precipitation > 0) {
    return `There is a moderate rain signal today, estimated at ${round(precipitation, 1)} mm.`;
  }

  return "There is no major rain scheduled for today.";
}

function irrigationRecommendation(rainChance: number, precipitation: number, eto: number, soilMoisture: number) {
  if (rainChance >= 70 || precipitation >= 8) {
    return "We recommend postponing irrigation and reassessing the field after rainfall.";
  }

  if (soilMoisture < 0.25 || eto >= 4.5) {
    return "We recommend checking soil moisture and preparing irrigation if crops show water stress.";
  }

  return "We recommend light monitoring before irrigation because moisture demand is moderate.";
}

function irrigationOutlook(rainChance: number, precipitation: number, eto: number, soilMoisture: number) {
  if (rainChance >= 70 || precipitation >= 8) {
    return "Rain is likely today, so irrigation can wait while the field receives natural moisture.";
  }

  if (soilMoisture < 0.25 || eto >= 4.5) {
    return "Low soil moisture or high ETO suggests monitoring the field closely before delaying irrigation.";
  }

  return "Low rain and moderate ETO suggest monitoring soil moisture before irrigation.";
}

function hourlyValuesForDate(hourly: ForecastApiResponse["hourly"], variable: string, date: string) {
  const times = hourly?.time ?? [];
  const values = hourly?.[variable] ?? [];
  return times
    .map((time, index) => (time.startsWith(date) ? values[index] : null))
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
}

function hourlyRainBuckets(hourly: ForecastApiResponse["hourly"], date: string) {
  const times = hourly?.time ?? [];
  const values = hourly?.precipitation ?? [];

  return hourlyRainLabels.map((hour) => {
    const bucketTotal = times.reduce((sum, time, index) => {
      if (!time.startsWith(date)) return sum;

      const timeHour = Number(time.slice(11, 13));
      const value = values[index];

      if (
        Number.isFinite(timeHour) &&
        timeHour >= hour &&
        timeHour < hour + 4 &&
        typeof value === "number" &&
        Number.isFinite(value)
      ) {
        return sum + value;
      }

      return sum;
    }, 0);

    return round(bucketTotal, 1);
  });
}

function forecastUrl({ latitude, longitude }: Coordinates) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    timezone: "auto",
    forecast_days: "7",
    past_days: "7",
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "precipitation",
      "weather_code",
      "cloud_cover",
      "wind_speed_10m",
      "wind_gusts_10m",
    ].join(","),
    hourly: [
      "temperature_2m",
      "relative_humidity_2m",
      "precipitation_probability",
      "precipitation",
      "weather_code",
      "cloud_cover",
      "wind_speed_10m",
      "wind_gusts_10m",
      "soil_moisture_0_to_1cm",
      "et0_fao_evapotranspiration",
    ].join(","),
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_mean",
      "precipitation_sum",
      "precipitation_probability_max",
      "precipitation_probability_mean",
      "precipitation_probability_min",
      "wind_speed_10m_max",
      "wind_speed_10m_mean",
      "wind_speed_10m_min",
      "wind_gusts_10m_max",
      "wind_gusts_10m_mean",
      "wind_gusts_10m_min",
      "relative_humidity_2m_max",
      "relative_humidity_2m_mean",
      "relative_humidity_2m_min",
      "cloud_cover_max",
      "cloud_cover_mean",
      "cloud_cover_min",
      "et0_fao_evapotranspiration_sum",
    ].join(","),
  });

  return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
}

function historicalUrl({ latitude, longitude }: Coordinates, startDate: string, endDate: string) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    timezone: "auto",
    start_date: startDate,
    end_date: endDate,
    daily: [
      "temperature_2m_mean",
      "relative_humidity_2m_mean",
      "precipitation_sum",
    ].join(","),
  });

  return `https://archive-api.open-meteo.com/v1/archive?${params.toString()}`;
}

function getBrowserLocation() {
  return new Promise<Coordinates>((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not available."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      }),
      reject,
      { enableHighAccuracy: true, maximumAge: 300000, timeout: 10000 },
    );
  });
}

function buildMonthlyClimate(history: HistoricalApiResponse, currentTemperatureC: number): ClimateOverviewData {
  const today = new Date();
  const firstMonth = new Date(today.getFullYear(), today.getMonth() - 5, 1);
  const monthKeys = Array.from({ length: 6 }, (_, index) => {
    const date = addMonths(firstMonth, index);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  });
  const labels = monthKeys.map((key) => {
    const [year, month] = key.split("-").map(Number);
    return new Intl.DateTimeFormat(undefined, { month: "short" }).format(new Date(year, month - 1, 1));
  });

  const daily = history.daily;
  if (!daily?.time?.length) {
    return {
      months: labels,
      monthlyPrecipitation: [36, 27, 17, 11, 12, 15],
      monthlyTemperature: [30, 29, 24, 19, 15, currentTemperatureC],
      monthlyHumidity: [61, 66, 64, 64, 70, 75],
      currentTemperatureC,
      condition: "Sunny",
      todayLabel: "Today",
      recommendation: "Warm conditions and low rain support monitoring soil moisture before irrigation.",
    };
  }

  const grouped = monthKeys.map((key) => {
    const indices = daily.time?.flatMap((date, index) => (date.startsWith(key) ? [index] : [])) ?? [];
    const precipitation = indices.reduce((sum, index) => sum + (daily.precipitation_sum?.[index] ?? 0), 0);
    const temperatures = validNumbers(indices.map((index) => daily.temperature_2m_mean?.[index]));
    const humidity = validNumbers(indices.map((index) => daily.relative_humidity_2m_mean?.[index]));
    return {
      precipitation: round(precipitation),
      temperature: round(average(temperatures)),
      humidity: round(average(humidity)),
    };
  });

  return {
    months: labels,
    monthlyPrecipitation: grouped.map((item) => item.precipitation),
    monthlyTemperature: grouped.map((item) => item.temperature || currentTemperatureC),
    monthlyHumidity: grouped.map((item) => item.humidity || 0),
    currentTemperatureC,
    condition: "Sunny",
    todayLabel: "Today",
    recommendation: "Warm conditions and low rain support monitoring soil moisture before irrigation.",
  };
}

function buildLiveFactor(
  value: string,
  recommendation: string,
  maxLabel: string,
  avgLabel: string,
  minLabel: string,
  maxValues: number[],
  avgValues: number[],
  minValues: number[],
): LiveFactorData {
  return {
    value,
    recommendation,
    series: [
      { label: maxLabel, color: "max", values: maxValues },
      { label: avgLabel, color: "avg", values: avgValues },
      { label: minLabel, color: "min", values: minValues },
    ],
  };
}

function mapForecastData(
  forecast: ForecastApiResponse,
  history: HistoricalApiResponse,
  isFallbackLocation: boolean,
): ForecastPageWeatherData {
  const current = forecast.current;
  const daily = forecast.daily;

  if (!current || !daily?.time?.length) {
    throw new Error("Open-Meteo forecast response is missing current or daily data.");
  }

  const currentDate = current.time.slice(0, 10);
  const startIndex = Math.max(daily.time.findIndex((date) => date >= currentDate), 0);
  const dayIndices = daily.time.slice(startIndex, startIndex + 7).map((_, index) => startIndex + index);
  const firstDayIndex = dayIndices[0] ?? startIndex;
  const todayRainChance = Number(daily.precipitation_probability_max?.[firstDayIndex] ?? 0);
  const todayPrecipitation = Number(daily.precipitation_sum?.[firstDayIndex] ?? current.precipitation ?? 0);
  const todayEto = Number(daily.et0_fao_evapotranspiration_sum?.[firstDayIndex] ?? 0);
  const todaySoilStats = stats(hourlyValuesForDate(forecast.hourly, "soil_moisture_0_to_1cm", daily.time[firstDayIndex]));
  const todaySoilMoisture = todaySoilStats.avg || 0;
  const todayCondition = weatherCondition(current.weather_code, current.cloud_cover, todayRainChance);
  const outlook = irrigationOutlook(todayRainChance, todayPrecipitation, todayEto, todaySoilMoisture);
  const recommendation = irrigationRecommendation(todayRainChance, todayPrecipitation, todayEto, todaySoilMoisture);

  const forecastItems: ForecastItem[] = dayIndices.map((dailyIndex) => {
    const date = daily.time?.[dailyIndex] ?? currentDate;
    const code = Number(daily.weather_code?.[dailyIndex] ?? current.weather_code ?? 0);
    const cloudCover = Number(daily.cloud_cover_mean?.[dailyIndex] ?? current.cloud_cover ?? 0);
    const rainChance = Number(daily.precipitation_probability_max?.[dailyIndex] ?? 0);
    return {
      temp: `${Math.round(Number(daily.temperature_2m_max?.[dailyIndex] ?? current.temperature_2m ?? 0))}°`,
      day: formatDate(date, { weekday: "long", day: "numeric", month: "short" }),
      icon: weatherIcon(code, cloudCover, rainChance),
    };
  });

  const details: ForecastDetail[] = dayIndices.map((dailyIndex, index) => {
    const date = daily.time?.[dailyIndex] ?? currentDate;
    const code = Number(daily.weather_code?.[dailyIndex] ?? current.weather_code ?? 0);
    const rainChance = Number(daily.precipitation_probability_max?.[dailyIndex] ?? 0);
    const precipitation = Number(daily.precipitation_sum?.[dailyIndex] ?? 0);
    const cloudCover = Number(daily.cloud_cover_mean?.[dailyIndex] ?? 0);
    const soilMoisture = stats(hourlyValuesForDate(forecast.hourly, "soil_moisture_0_to_1cm", date)).avg;
    const eto = Number(daily.et0_fao_evapotranspiration_sum?.[dailyIndex] ?? 0);
    const condition = weatherCondition(code, cloudCover, rainChance);
    const icon = weatherIcon(code, cloudCover, rainChance);

    return {
      title: index === 0 ? weatherTitle(icon, condition) : condition,
      chance: `with ${Math.round(rainChance)}% chance of rain`,
      date: index === 0 ? `Today, ${formatDate(date, { month: "long", day: "numeric" })}` : formatDate(date, { weekday: "long", month: "long", day: "numeric" }),
      time: index === 0 ? formatTime(current.time) : "Forecast",
      bullets: [
        rainBullet(rainChance, precipitation),
        `Humidity is ${Math.round(Number(daily.relative_humidity_2m_mean?.[dailyIndex] ?? current.relative_humidity_2m ?? 0))}% with ${Math.round(cloudCover)}% cloud cover.`,
        `ET0 demand is ${round(eto, 1)} mm and top soil moisture is ${round(soilMoisture, 2)}.`,
      ],
      recommendation: irrigationRecommendation(rainChance, precipitation, eto, soilMoisture),
      status: condition,
      metrics: [
        ["Precipitation", `${round(precipitation, 1)} mm`],
        ["Wind Speed", `${Math.round(Number(daily.wind_speed_10m_max?.[dailyIndex] ?? current.wind_speed_10m ?? 0))} km/h`],
        ["Wind Gusts", `${Math.round(Number(daily.wind_gusts_10m_max?.[dailyIndex] ?? current.wind_gusts_10m ?? 0))} km/h`],
        ["Humidity", `${Math.round(Number(daily.relative_humidity_2m_mean?.[dailyIndex] ?? current.relative_humidity_2m ?? 0))}%`],
        ["Cloud Cover", `${Math.round(cloudCover)}%`],
        ["Soil Moisture", `${round(soilMoisture, 2)}`],
        ["ET0", `${round(eto, 1)} mm`],
      ],
    };
  });

  const projectionDays = dayIndices.map((dailyIndex) => {
    const date = daily.time?.[dailyIndex] ?? currentDate;
    return {
      day: formatDate(date, { weekday: "short" }),
      date: formatDate(date, { day: "numeric", month: "short" }),
      rain: round(Number(daily.precipitation_sum?.[dailyIndex] ?? 0), 1),
      hourlyRain: hourlyRainBuckets(forecast.hourly, date),
    };
  });

  const factorDayLabels = dayIndices.map((dailyIndex) => {
    const date = daily.time?.[dailyIndex] ?? currentDate;
    return {
      label: formatDate(date, { weekday: "short" }),
      date: formatDate(date, { day: "numeric", month: "short" }),
    };
  });

  const dailySeries = (maxKey: string, avgKey: string, minKey: string, digits = 0) => ({
    max: dayIndices.map((index) => round(Number(daily[maxKey]?.[index] ?? 0), digits)),
    avg: dayIndices.map((index) => round(Number(daily[avgKey]?.[index] ?? 0), digits)),
    min: dayIndices.map((index) => round(Number(daily[minKey]?.[index] ?? 0), digits)),
  });
  const soilSeriesStats = dayIndices.map((index) => stats(hourlyValuesForDate(forecast.hourly, "soil_moisture_0_to_1cm", daily.time?.[index] ?? currentDate)));
  const rainProbability = dailySeries("precipitation_probability_max", "precipitation_probability_mean", "precipitation_probability_min");
  const windSpeed = dailySeries("wind_speed_10m_max", "wind_speed_10m_mean", "wind_speed_10m_min");
  const windGusts = dailySeries("wind_gusts_10m_max", "wind_gusts_10m_mean", "wind_gusts_10m_min");
  const humidity = dailySeries("relative_humidity_2m_max", "relative_humidity_2m_mean", "relative_humidity_2m_min");
  const cloudCover = dailySeries("cloud_cover_max", "cloud_cover_mean", "cloud_cover_min");

  const analytics = {
    ...buildMonthlyClimate(history, Math.round(Number(current.temperature_2m ?? 0))),
    condition: todayCondition,
    todayLabel: `Today, ${formatDate(currentDate, { weekday: "long", day: "numeric", month: "short" })}`,
    recommendation: outlook,
  };

  return {
    forecast: forecastItems,
    details,
    analytics,
    precipitation: projectionDays,
    factorDayLabels,
    factors: {
      "chance-of-rain": buildLiveFactor(
        `${Math.round(todayRainChance)}%`,
        todayRainChance >= 70 ? "High rain probability. Delay irrigation until rainfall has passed." : "Low rain probability. Irrigation may still be needed if soil moisture remains low.",
        "Max (%)",
        "Avg (%)",
        "Min (%)",
        rainProbability.max,
        rainProbability.avg,
        rainProbability.min,
      ),
      "wind-speed": buildLiveFactor(`${Math.round(Number(current.wind_speed_10m ?? 0))} km/h`, "Wind can increase evapotranspiration. Check soil moisture before extending irrigation intervals.", "Max (km/h)", "Avg (km/h)", "Min (km/h)", windSpeed.max, windSpeed.avg, windSpeed.min),
      "wind-gusts": buildLiveFactor(`${Math.round(Number(current.wind_gusts_10m ?? 0))} km/h`, "Stronger gusts can dry exposed soil faster. Avoid overhead irrigation during peak gust periods.", "Max (km/h)", "Avg (km/h)", "Min (km/h)", windGusts.max, windGusts.avg, windGusts.min),
      humidity: buildLiveFactor(`${Math.round(Number(current.relative_humidity_2m ?? 0))}%`, "Pair humidity with soil readings before irrigating.", "Max (%)", "Avg (%)", "Min (%)", humidity.max, humidity.avg, humidity.min),
      "cloud-cover": buildLiveFactor(`${Math.round(Number(current.cloud_cover ?? 0))}%`, "Lower cloud cover can raise crop water demand during peak sunlight.", "Max (%)", "Avg (%)", "Min (%)", cloudCover.max, cloudCover.avg, cloudCover.min),
      "soil-moisture": buildLiveFactor(`${round(todaySoilMoisture, 2)}`, "Use top-layer soil moisture as a model estimate and compare it with field sensor readings.", "Max", "Avg", "Min", soilSeriesStats.map((item) => round(item.max, 2)), soilSeriesStats.map((item) => round(item.avg, 2)), soilSeriesStats.map((item) => round(item.min, 2))),
    },
    eto: {
      temperature: `${Math.round(Number(current.temperature_2m ?? 0))}°`,
      condition: todayCondition,
      dateLabel: `Today, ${formatDate(currentDate, { weekday: "long", day: "numeric", month: "short" })}`,
      outlook,
      recommendations: [
        recommendation,
        todayRainChance >= 70 ? "Use rainfall as the primary water input today." : "Review local soil moisture before scheduling irrigation.",
        todayEto >= 4.5 ? "High ETO means exposed crops may need closer monitoring." : "Moderate ETO allows normal irrigation timing checks.",
        todaySoilMoisture < 0.25 ? "Top-layer soil moisture is low, so verify with field sensors." : "Top-layer soil moisture is within a stable forecast range.",
      ],
      demand: `${round(todayEto, 1)} mm`,
      metrics: [
        { label: "Precipitation", value: `${round(todayPrecipitation, 1)} mm` },
        { label: "Wind Speed", value: `${Math.round(Number(current.wind_speed_10m ?? 0))} km/h` },
        { label: "Wind Gusts", value: `${Math.round(Number(current.wind_gusts_10m ?? 0))} km/h` },
        { label: "Humidity", value: `${Math.round(Number(current.relative_humidity_2m ?? 0))}%` },
        { label: "Cloud Cover", value: `${Math.round(Number(current.cloud_cover ?? 0))}%` },
        { label: "Temperature", value: `${Math.round(Number(current.temperature_2m ?? 0))}°` },
      ],
    },
    isFallbackLocation,
  };
}

async function fetchJson<T>(url: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Weather request failed with ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function useOpenMeteoWeather() {
  const [data, setData] = useState<ForecastPageWeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadWeather() {
      setIsLoading(true);
      setError(null);

      let coordinates = fallbackCoordinates;
      let isFallbackLocation = false;

      try {
        coordinates = await getBrowserLocation();
      } catch {
        isFallbackLocation = true;
      }

      const today = new Date();
      const historyStart = new Date(today.getFullYear(), today.getMonth() - 5, 1);
      const historyEnd = addDays(today, -1);

      try {
        const [forecastResponse, historyResponse] = await Promise.all([
          fetchJson<ForecastApiResponse>(forecastUrl(coordinates), controller.signal),
          fetchJson<HistoricalApiResponse>(historicalUrl(coordinates, toDateKey(historyStart), toDateKey(historyEnd)), controller.signal),
        ]);
        setData(mapForecastData(forecastResponse, historyResponse, isFallbackLocation));
      } catch (weatherError) {
        if (!controller.signal.aborted) {
          setError(weatherError instanceof Error ? weatherError.message : "Unable to load Open-Meteo data.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadWeather();

    return () => controller.abort();
  }, []);

  return { data, isLoading, error };
}
