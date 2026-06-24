"use client";

import {
  ChevronLeft,
  ChevronRight,
  Cloud,
  CloudRain,
  CloudSun,
  Droplets,
  Gauge,
  Loader2,
  MapPin,
  Sprout,
  Sun,
  Wind,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SiteNav } from "../components/home/SiteNav";
import { PageIntro } from "../components/PageIntro";

type Coordinates = {
  latitude: number;
  longitude: number;
};

type OpenMeteoResponse = {
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
  hourly?: {
    time: string[];
    precipitation_probability?: number[];
    soil_moisture_0_to_1cm?: number[];
    et0_fao_evapotranspiration?: number[];
  };
  daily?: {
    time: string[];
    weather_code?: number[];
    temperature_2m_max?: number[];
    precipitation_sum?: number[];
    precipitation_probability_max?: number[];
    wind_speed_10m_max?: number[];
    wind_gusts_10m_max?: number[];
    et0_fao_evapotranspiration_sum?: number[];
  };
};

type ForecastDay = {
  date: string;
  label: string;
  weatherCode: number;
  condition: string;
  temp: number;
  rainChance: number;
  precipitation: number;
  windSpeed: number;
  windGusts: number;
  eto: number;
};

type WeatherData = {
  current: ForecastDay & {
    humidity: number;
    cloudCover: number;
    soilMoisture: number;
    observedAt: string;
  };
  forecastDays: ForecastDay[];
  timezone: string;
  coordinates: Coordinates;
  locationName: string;
  usedFallbackLocation: boolean;
};

const fallbackLocation: Coordinates = {
  latitude: 14.5995,
  longitude: 120.9842,
};

const fallbackLocationName = "Manila, Philippines";

const weatherCodeLabels: Record<number, string> = {
  0: "Sunny",
  1: "Mostly clear",
  2: "Partly cloudy",
  3: "Cloudy",
  45: "Foggy",
  48: "Foggy",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  56: "Freezing drizzle",
  57: "Freezing drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  66: "Freezing rain",
  67: "Freezing rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Rain showers",
  81: "Rain showers",
  82: "Heavy showers",
  85: "Snow showers",
  86: "Snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm",
  99: "Thunderstorm",
};

function getWeatherLabel(code = 0) {
  return weatherCodeLabels[code] ?? "Forecast";
}

function getNearestHourlyIndex(times: string[], observedAt?: string) {
  if (!times.length) return 0;
  const target = observedAt ? new Date(observedAt).getTime() : Date.now();
  let nearestIndex = 0;
  let nearestDistance = Number.POSITIVE_INFINITY;

  times.forEach((time, index) => {
    const distance = Math.abs(new Date(time).getTime() - target);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = index;
    }
  });

  return nearestIndex;
}

function formatDay(date: string, index: number) {
  if (index === 0) return "Today";
  return new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" }).format(new Date(`${date}T12:00:00`));
}

function formatObservedAt(time: string, timezone: string) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone,
  }).format(new Date(time));
}

function buildOpenMeteoUrl({ latitude, longitude }: Coordinates) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    timezone: "auto",
    forecast_days: "7",
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
      "precipitation_probability",
      "soil_moisture_0_to_1cm",
      "et0_fao_evapotranspiration",
    ].join(","),
    daily: [
      "weather_code",
      "temperature_2m_max",
      "precipitation_sum",
      "precipitation_probability_max",
      "wind_speed_10m_max",
      "wind_gusts_10m_max",
      "et0_fao_evapotranspiration_sum",
    ].join(","),
  });

  return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
}

function formatCoordinates({ latitude, longitude }: Coordinates) {
  return `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`;
}

function formatLocationName(address: Record<string, string> = {}) {
  return (
    address.locality ||
    address.suburb ||
    address.neighbourhood ||
    address.neighborhood ||
    address.quarter ||
    address.village ||
    address.hamlet ||
    address.municipality ||
    address.city ||
    address.town ||
    ""
  );
}

async function fetchLocationName(coordinates: Coordinates, usedFallbackLocation: boolean) {
  if (usedFallbackLocation) return fallbackLocationName;

  try {
    const params = new URLSearchParams({
      latitude: String(coordinates.latitude),
      longitude: String(coordinates.longitude),
      localityLanguage: "en",
    });
    const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?${params.toString()}`);

    if (!response.ok) {
      throw new Error("Reverse geocoding failed.");
    }

    const data = await response.json();
    return formatLocationName(data) || formatCoordinates(coordinates);
  } catch {
    return formatCoordinates(coordinates);
  }
}

function mapWeatherResponse(data: OpenMeteoResponse, coordinates: Coordinates, locationName: string, usedFallbackLocation: boolean): WeatherData {
  const timezone = data.timezone ?? "UTC";
  const current = data.current;
  const daily = data.daily;

  if (!current || !daily?.time?.length) {
    throw new Error("Open-Meteo returned an incomplete forecast.");
  }

  const hourlyIndex = getNearestHourlyIndex(data.hourly?.time ?? [], current.time);
  const forecastDays = daily.time.map((date, index) => ({
    date,
    label: formatDay(date, index),
    weatherCode: daily.weather_code?.[index] ?? current.weather_code ?? 0,
    condition: getWeatherLabel(daily.weather_code?.[index] ?? current.weather_code ?? 0),
    temp: Math.round(daily.temperature_2m_max?.[index] ?? current.temperature_2m ?? 0),
    rainChance: Math.round(daily.precipitation_probability_max?.[index] ?? 0),
    precipitation: Number((daily.precipitation_sum?.[index] ?? current.precipitation ?? 0).toFixed(1)),
    windSpeed: Math.round(daily.wind_speed_10m_max?.[index] ?? current.wind_speed_10m ?? 0),
    windGusts: Math.round(daily.wind_gusts_10m_max?.[index] ?? current.wind_gusts_10m ?? 0),
    eto: Number((daily.et0_fao_evapotranspiration_sum?.[index] ?? data.hourly?.et0_fao_evapotranspiration?.[hourlyIndex] ?? 0).toFixed(1)),
  }));

  return {
    current: {
      ...forecastDays[0],
      temp: Math.round(current.temperature_2m ?? forecastDays[0].temp),
      precipitation: Number((current.precipitation ?? forecastDays[0].precipitation).toFixed(1)),
      windSpeed: Math.round(current.wind_speed_10m ?? forecastDays[0].windSpeed),
      windGusts: Math.round(current.wind_gusts_10m ?? forecastDays[0].windGusts),
      humidity: Math.round(current.relative_humidity_2m ?? 0),
      cloudCover: Math.round(current.cloud_cover ?? 0),
      soilMoisture: Number((data.hourly?.soil_moisture_0_to_1cm?.[hourlyIndex] ?? 0).toFixed(2)),
      observedAt: formatObservedAt(current.time, timezone),
    },
    forecastDays,
    timezone,
    coordinates,
    locationName,
    usedFallbackLocation,
  };
}

function WeatherIcon({ code, size = 45 }: { code: number; size?: number }) {
  if (code === 0 || code === 1) return <Sun size={size} strokeWidth={1.2} />;
  if (code >= 51) return <CloudRain size={size} strokeWidth={1.2} />;
  if (code >= 2) return <CloudSun size={size} strokeWidth={1.2} />;
  return <Cloud size={size} strokeWidth={1.2} />;
}

function getIrrigationOutlook(current: WeatherData["current"]) {
  if (current.precipitation >= 8 || current.rainChance >= 70) {
    return "Rain is likely today, so irrigation can wait while the field absorbs natural moisture.";
  }

  if (current.eto >= 4 || current.soilMoisture < 0.18) {
    return "High ET0 or low near-surface soil moisture suggests irrigation should be prioritized today.";
  }

  return "Low rain and moderate ET0 suggest monitoring soil moisture before irrigation.";
}

function getLocation() {
  return new Promise<Coordinates>((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      }),
      () => reject(new Error("Location permission was not granted.")),
      { enableHighAccuracy: true, maximumAge: 300000, timeout: 10000 },
    );
  });
}

async function fetchOpenMeteoForecast(coordinates: Coordinates, usedFallbackLocation: boolean) {
  const [locationName, response] = await Promise.all([
    fetchLocationName(coordinates, usedFallbackLocation),
    fetch(buildOpenMeteoUrl(coordinates)),
  ]);

  if (!response.ok) {
    throw new Error("Unable to load the Open-Meteo forecast.");
  }

  return mapWeatherResponse(await response.json(), coordinates, locationName, usedFallbackLocation);
}

export default function ForecastPage() {
  const [selected, setSelected] = useState(0);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadForecast() {
      setIsLoading(true);
      setError("");

      try {
        const coordinates = await getLocation();
        const forecast = await fetchOpenMeteoForecast(coordinates, false);
        if (isMounted) setWeatherData(forecast);
      } catch (locationError) {
        try {
          const forecast = await fetchOpenMeteoForecast(fallbackLocation, true);
          if (isMounted) {
            setWeatherData(forecast);
            setError(locationError instanceof Error ? locationError.message : "Location unavailable.");
          }
        } catch (forecastError) {
          if (isMounted) {
            setError(forecastError instanceof Error ? forecastError.message : "Unable to load weather data.");
          }
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadForecast();

    return () => {
      isMounted = false;
    };
  }, []);

  const current = weatherData?.current;
  const forecastDays = weatherData?.forecastDays ?? [];
  const selectedDay = forecastDays[selected] ?? forecastDays[0];
  const outlook = useMemo(() => (current ? getIrrigationOutlook(current) : ""), [current]);

  return (
    <main className="forecast-page">
      <SiteNav activeLabel="Weather" />
      <PageIntro title="Weather Forecast" />
      <section className="forecast-band">
        <div className="forecast-grid">
          <article className="forecast-card">
            {isLoading ? (
              <div className="forecast-state">
                <Loader2 className="spin" size={34} />
                <strong>Loading local forecast</strong>
                <span>Requesting your location and Open-Meteo weather data.</span>
              </div>
            ) : current && selectedDay ? (
              <>
                <div className="forecast-meta">
                  <span><MapPin size={16} /> {weatherData.locationName}</span>
                  <span>{current.observedAt}</span>
                </div>

                {error ? <p className="forecast-alert">{error} Showing Manila weather until location access is available.</p> : null}

                <div className="current-weather">
                  <div className="weather-symbol">
                    <WeatherIcon code={selectedDay.weatherCode} size={88} />
                    <strong>{selectedDay.temp}°</strong>
                    <span>{selectedDay.condition}</span>
                  </div>
                  <div className="weather-facts">
                    <div><strong>{selectedDay.rainChance}%</strong><b>Chance of Rain</b></div>
                    <div><strong>{selectedDay.precipitation} mm</strong><b>Precipitation</b></div>
                    <div><strong>{selectedDay.eto} mm</strong><b>ET0 Demand</b></div>
                  </div>
                </div>

                <div className="forecast-metrics" aria-label="Today's forecast data">
                  <div><Droplets size={22} /><span>Humidity</span><strong>{current.humidity}%</strong></div>
                  <div><Cloud size={22} /><span>Cloud Cover</span><strong>{current.cloudCover}%</strong></div>
                  <div><Sprout size={22} /><span>Soil Moisture</span><strong>{current.soilMoisture}</strong></div>
                  <div><Wind size={22} /><span>Wind Speed</span><strong>{selectedDay.windSpeed} km/h</strong></div>
                  <div><Gauge size={22} /><span>Wind Gusts</span><strong>{selectedDay.windGusts} km/h</strong></div>
                </div>

                <div className="forecast-selector">
                  <button className="arrow-button" title="Previous day" onClick={() => setSelected((selected - 1 + forecastDays.length) % forecastDays.length)}><ChevronLeft /></button>
                  <div className="forecast-days">
                    {forecastDays.slice(0, 4).map((item, index) => (
                      <button key={item.date} className={selected === index ? "selected-day" : ""} onClick={() => setSelected(index)}>
                        <span>{item.label}</span><WeatherIcon code={item.weatherCode} /><strong>{item.rainChance}%</strong>
                      </button>
                    ))}
                  </div>
                  <button className="arrow-button" title="Next day" onClick={() => setSelected((selected + 1) % forecastDays.length)}><ChevronRight /></button>
                </div>
              </>
            ) : (
              <div className="forecast-state">
                <CloudRain size={34} />
                <strong>Weather unavailable</strong>
                <span>{error || "Open-Meteo did not return forecast data."}</span>
              </div>
            )}
          </article>

          <aside className="forecast-summary">
            <span>Open-Meteo</span>
            <h2>{current ? outlook : "Waiting for today's field outlook"}</h2>
            {current ? (
              <div className="outlook-card">
                <b>Irrigation outlook</b>
                <p>{outlook}</p>
              </div>
            ) : null}
            <div className="rain-bars" aria-label="Rain probability chart">
              {(forecastDays.length ? forecastDays : [{ date: "loading", rainChance: 0, label: "Today" } as ForecastDay]).map((day) => (
                <div key={day.date}><i style={{ height: `${Math.max(day.rainChance, 4)}%` }} /><small>{day.label}</small></div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="aquifer-section">
        <div className="aquifer-visual">
          <div className="north-arrow">N<span>➤</span></div>
          {["W-1|Pumping", "W-2|Monitoring", "W-3|Pumping", "W-4|Monitoring"].map((well, index) => {
            const [name, state] = well.split("|");
            return <div className={`aquifer-well well-${index + 1}`} key={name}><strong>{name}</strong><span>({state})</span><i /></div>;
          })}
          <div className="land" />
          <div className="soil soil-one" />
          <div className="soil soil-two" />
          <div className="water-table" />
        </div>
      </section>
    </main>
  );
}
