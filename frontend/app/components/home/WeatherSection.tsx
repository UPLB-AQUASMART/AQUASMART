"use client";
import Image from "next/image";

import { Icon } from "@iconify/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ForecastDetail } from "@/app/forecast/components/openMeteoWeather";

import { forecast as defaultForecast } from "@/app/data/home";
import type { ForecastItem } from "@/app/data/home";

import { SectionPill } from "./SectionPill";
import styles from "./WeatherSection.module.css";

function formatLiveTime(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

const defaultForecastDetails: ForecastDetail[] = [
  {
    title: "Today is Sunny",
    chance: "with 0% chance of rain",
    date: "Today, June 16",
    time: "2:34 pm",
    bullets: [
      "There is no rain scheduled in this coming week.",
      "Water Salinity of 5.6 is optimal for Rice and Corn irrigation",
      "pH level of 5 is optimal for irrigation of all crops",
    ],
    recommendation: "We recommend you to irrigate your crops as soon as possible",
    status: "Sunny",
    metrics: [
      ["Precipitation", "0 mm"],
      ["Wind Speed", "9 km/h"],
      ["Wind Gusts", "18 km/h"],
      ["Humidity", "44%"],
      ["Cloud Cover", "8%"],
      ["Soil Moisture", "Good"],
      ["ET0", "3.1 mm"],
    ],
  },
  {
    title: "Heavy Rainfall",
    chance: "with 87% chance of rain",
    date: "Today, June 16",
    time: "2:34 pm",
    bullets: [
      "There is a high chance of heavy rainfall, est. 5 mm",
      "Water Salinity of 5.6 is optimal for Rice and Corn irrigation",
      "pH level of 5 is optimal for irrigation of all crops",
    ],
    recommendation: "We recommend you to irrigate your crops in 3-4 days",
    status: "Rainy",
    metrics: [
      ["Precipitation", "5 mm"],
      ["Wind Speed", "18 km/h"],
      ["Wind Gusts", "24 km/h"],
      ["Humidity", "87%"],
      ["Cloud Cover", "92%"],
      ["Soil Moisture", "Wet"],
      ["ET0", "1.2 mm"],
    ],
  },
  {
    title: "Partly Cloudy",
    chance: "with 18% chance of rain",
    date: "Saturday, Nov 2",
    time: "11:20 am",
    bullets: [
      "Cloud cover may lower evapotranspiration during peak hours.",
      "Water Salinity of 5.6 remains within the irrigation watch range.",
      "Prioritize early morning irrigation for heat-sensitive crops.",
    ],
    recommendation: "We recommend light irrigation during early morning hours",
    status: "Cloudy",
    metrics: [
      ["Precipitation", "1 mm"],
      ["Wind Speed", "11 km/h"],
      ["Wind Gusts", "21 km/h"],
      ["Humidity", "58%"],
      ["Cloud Cover", "46%"],
      ["Soil Moisture", "Stable"],
      ["ET0", "2.5 mm"],
    ],
  },
  {
    title: "Heavy Rainfall",
    chance: "with 87% chance of rain",
    date: "Today, June 16",
    time: "2:34 pm",
    bullets: [
      "There is a high chance of heavy rainfall, est. 5 mm",
      "Water Salinity of 5.6 is optimal for Rice and Corn irrigation",
      "pH level of 5 is optimal for irrigation of all crops",
    ],
    recommendation: "We recommend you to irrigate your crops in 3-4 days",
    status: "Rainy",
    metrics: [
      ["Precipitation", "5 mm"],
      ["Wind Speed", "16 km/h"],
      ["Wind Gusts", "24 km/h"],
      ["Humidity", "86%"],
      ["Cloud Cover", "90%"],
      ["Soil Moisture", "Wet"],
      ["ET0", "1.4 mm"],
    ],
  },
  {
    title: "Heavy Rainfall",
    chance: "with 87% chance of rain",
    date: "Today, June 16",
    time: "2:34 pm",
    bullets: [
      "There is a high chance of heavy rainfall, est. 5 mm",
      "Water Salinity of 5.6 is optimal for Rice and Corn irrigation",
      "pH level of 5 is optimal for irrigation of all crops",
    ],
    recommendation: "We recommend you to irrigate your crops in 3-4 days",
    status: "Rainy",
    metrics: [
      ["Precipitation", "5 mm"],
      ["Wind Speed", "12 km/h"],
      ["Wind Gusts", "24 km/h"],
      ["Humidity", "84%"],
      ["Cloud Cover", "88%"],
      ["Soil Moisture", "Wet"],
      ["ET0", "1.5 mm"],
    ],
  },
  {
    title: "Heavy Rainfall",
    chance: "with 87% chance of rain",
    date: "Today, June 16",
    time: "2:34 pm",
    bullets: [
      "There is a high chance of heavy rainfall, est. 5 mm",
      "Water Salinity of 5.6 is optimal for Rice and Corn irrigation",
      "pH level of 5 is optimal for irrigation of all crops",
    ],
    recommendation: "We recommend you to irrigate your crops in 3-4 days",
    status: "Rainy",
    metrics: [
      ["Precipitation", "5 mm"],
      ["Wind Speed", "17 km/h"],
      ["Wind Gusts", "24 km/h"],
      ["Humidity", "89%"],
      ["Cloud Cover", "94%"],
      ["Soil Moisture", "Wet"],
      ["ET0", "1.1 mm"],
    ],
  },
  {
    title: "Heavy Rainfall",
    chance: "with 87% chance of rain",
    date: "Today, June 16",
    time: "2:34 pm",
    bullets: [
      "There is a high chance of heavy rainfall, est. 5 mm",
      "Water Salinity of 5.6 is optimal for Rice and Corn irrigation",
      "pH level of 5 is optimal for irrigation of all crops",
    ],
    recommendation: "We recommend you to irrigate your crops in 3-4 days",
    status: "Rainy",
    metrics: [
      ["Precipitation", "5 mm"],
      ["Wind Speed", "14 km/h"],
      ["Wind Gusts", "24 km/h"],
      ["Humidity", "85%"],
      ["Cloud Cover", "91%"],
      ["Soil Moisture", "Wet"],
      ["ET0", "1.7 mm"],
    ],
  },
];

const forecastMetricIcons: Record<string, string> = {
  Precipitation: "solar:cloud-rain-linear",
  "Wind Speed": "solar:wind-linear",
  "Wind Gusts": "solar:wind-bold",
  Humidity: "material-symbols:humidity-percentage-outline",
  "Cloud Cover": "solar:cloud-linear",
  "Soil Moisture": "solar:waterdrops-linear",
  ET0: "solar:leaf-linear",
};

const WEATHER_DISSOLVE_MS = 260;
const WEATHER_TRANSITION_MS = 1180;
const TEST_SUNNY_FORECAST_INDEX = 6;

type WeatherTransitionPhase = "idle" | "leaving" | "entering";

function WeatherIcon({
  type,
}: {
  type: "sun" | "rain" | "cloud";
}) {
  const iconMap = {
    sun: "/assets/weather/sunny-icon.svg",
    rain: "/assets/weather/rainy-icon.svg",
    cloud: "/assets/weather/cloudy-sunny-icon.svg",
  };

  return (
    <Image
      src={iconMap[type]}
      height={48}
      alt=""
      width={48}
      aria-hidden="true"
    />
  );
}

// function WeatherIcon({ type }: { type: ForecastIcon }) {
//   return (
//     <span
//       className={`${styles["weather-icon"]}${type === "sun" ? "" : ` ${styles[type]}`}`}
//       aria-hidden="true"
//     >
//       <span />
//     </span>
//   );
// }

type WeatherSectionProps = {
  forecastItems?: ForecastItem[];
  forecastDetails?: ForecastDetail[];
  isForecastLoading?: boolean;
};

export function WeatherSection({
  forecastItems,
  forecastDetails,
  isForecastLoading = false,
}: WeatherSectionProps = {}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  const [weatherTransitionPhase, setWeatherTransitionPhase] =
    useState<WeatherTransitionPhase>("idle");
  const [isWeatherMorphing, setIsWeatherMorphing] = useState(false);
  const [slideDirection, setSlideDirection] = useState<"forward" | "back">("forward");
  const [liveTime, setLiveTime] = useState(() => new Date());
  const sectionRef = useRef<HTMLElement | null>(null);
  const shouldAnchorAfterLoadRef = useRef(false);
  const transitionTimersRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const sourceForecast = forecastItems?.length ? forecastItems : defaultForecast;
  const sourceDetails = forecastDetails?.length ? forecastDetails : defaultForecastDetails;
  const weeklyForecast = sourceForecast.map((item, index) =>
    index === TEST_SUNNY_FORECAST_INDEX ? { ...item, icon: "sun" as const } : item,
  );
  const detailForecast = sourceDetails.map((item, index) =>
    index === TEST_SUNNY_FORECAST_INDEX
      ? {
          ...item,
          title: "Sunny Weather",
          chance: "with 0% chance of rain",
          bullets: [
            "Testing sunny transition state for the final forecast day.",
            "Low rainfall is expected for this selected day.",
            "Monitor soil moisture before planning irrigation.",
          ],
          recommendation:
            "Sunny conditions can raise ETO demand, so monitor soil moisture before irrigation.",
          status: "Sunny",
        }
      : item,
  );
  const safeActiveIndex = Math.min(activeIndex, weeklyForecast.length - 1);
  const activeForecast = weeklyForecast[safeActiveIndex] ?? weeklyForecast[0];
  const activeDetail = detailForecast[safeActiveIndex] ?? detailForecast[0] ?? defaultForecastDetails[0];
  const isRainy = activeForecast.icon === "rain";
  const displayedTime = safeActiveIndex === 0 ? formatLiveTime(liveTime) : activeDetail.time;

  const anchorWeatherSection = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;

    const navOffset = window.matchMedia("(max-width: 720px)").matches ? 72 : 96;
    const sectionTop = section.getBoundingClientRect().top + window.scrollY - navOffset;
    window.scrollTo({ top: Math.max(sectionTop, 0), behavior: "auto" });
  }, []);

  useEffect(() => {
    return () => {
      transitionTimersRef.current.forEach((timer) => clearTimeout(timer));
      transitionTimersRef.current = [];
    };
  }, []);

  useEffect(() => {
    const clockTimer = window.setInterval(() => {
      setLiveTime(new Date());
    }, 1000);

    return () => window.clearInterval(clockTimer);
  }, []);

  useEffect(() => {
    if (!shouldAnchorAfterLoadRef.current || isWeatherLoading) return;

    shouldAnchorAfterLoadRef.current = false;
    window.requestAnimationFrame(() => {
      anchorWeatherSection();
    });
  }, [activeIndex, anchorWeatherSection, isWeatherLoading]);

  const handleSelectDay = (index: number) => {
    if (index === safeActiveIndex || isWeatherLoading || isForecastLoading) return;

    transitionTimersRef.current.forEach((timer) => clearTimeout(timer));
    transitionTimersRef.current = [];

    setSlideDirection(index >= safeActiveIndex ? "forward" : "back");
    setDetailsOpen(false);
    setIsWeatherLoading(true);
    setWeatherTransitionPhase("leaving");
    setIsWeatherMorphing(weeklyForecast[index]?.icon !== activeForecast.icon);
    shouldAnchorAfterLoadRef.current = true;
    window.requestAnimationFrame(() => {
      anchorWeatherSection();
    });

    const swapTimer = setTimeout(() => {
      setActiveIndex(index);
      setWeatherTransitionPhase("entering");
    }, WEATHER_DISSOLVE_MS);

    const doneTimer = setTimeout(() => {
      setIsWeatherLoading(false);
      setWeatherTransitionPhase("idle");
      setIsWeatherMorphing(false);
      transitionTimersRef.current = [];
    }, WEATHER_TRANSITION_MS);

    transitionTimersRef.current = [swapTimer, doneTimer];
  };

  const weatherClassName = [
    styles["weather-section"],
    isRainy ? styles["weather-rainy"] : "",
    styles[`weather-slide-${slideDirection}`],
    weatherTransitionPhase !== "idle"
      ? styles[`weather-transition-${weatherTransitionPhase}`]
      : "",
    isWeatherMorphing ? styles["weather-transition-weather-change"] : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={weatherClassName} id="weather" ref={sectionRef}>
      <div
        className={`${styles["weather-sun"]}${activeForecast.icon === "sun" ? "" : ` ${styles[`weather-sun-${activeForecast.icon}`]}`}`}
        aria-hidden="true"
      />
      <div
        className={[
          styles["weather-cloud-hero"],
          styles[`weather-hero-${activeForecast.icon}`],
        ]
          .filter(Boolean)
          .join(" ")}
        aria-hidden="true"
      />
      <div className={styles["weather-layout"]}>
        {isForecastLoading ? (
          <div className={styles["weather-loading"]} role="status" aria-live="polite">
            <span />
            <strong>Loading forecast</strong>
            <small>Fetching Open-Meteo weather data...</small>
          </div>
        ) : null}
        <div className={styles["weather-copy"]}>
          <div className={styles["weather-copy-panel"]} key={safeActiveIndex}>
            <SectionPill className={styles["section-pill"]}>Weather Forecast</SectionPill>
            <div className={styles["weather-meta"]}>
              <strong>{activeDetail.date}</strong>
              <span>{displayedTime}</span>
            </div>
            <h2>
              {activeDetail.title}
              <span>{activeDetail.chance}</span>
            </h2>
            <ul>
              {activeDetail.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
            <p className={styles["weather-recommendation"]}>
              {activeDetail.recommendation}
            </p>
          </div>
        </div>

        <div className={`${styles["week-card"]}${detailsOpen ? ` ${styles["detail-mode"]}` : ""}`}>
          {detailsOpen ? (
            <div className={styles["forecast-detail-view"]} aria-live="polite">
              <div className={styles["forecast-detail-header"]}>
                <button
                  aria-label="Back to weekly forecast"
                  className={styles["forecast-back-button"]}
                  onClick={() => setDetailsOpen(false)}
                  type="button"
                >
                  <ArrowLeft aria-hidden="true" size={18} strokeWidth={2.2} />
                </button>
                <h3>Today&apos;s Forecast Data</h3>
                <span>Open-Meteo</span>
              </div>

              <div className={styles["forecast-current-card"]}>
                <WeatherIcon type={activeForecast.icon} />
                <div>
                  <strong>{activeForecast.temp}</strong>
                  <small>{activeForecast.day}</small>
                </div>
                <span>{activeDetail.status}</span>
              </div>

              <dl className={styles["forecast-detail-list"]}>
                {activeDetail.metrics.slice(0, 6).map(([label, value]) => (
                  <div key={label}>
                    <dt>
                      <span aria-hidden="true">
                        <Icon icon={forecastMetricIcons[label] ?? "solar:chart-linear"} />
                      </span>
                      {label}
                    </dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>

              <div className={styles["forecast-eto-row"]}>
                <span aria-hidden="true">
                  <Icon icon={forecastMetricIcons.ET0} />
                </span>
                <strong>ET0 {activeDetail.metrics[6]?.[1] ?? "3.1 mm"} demand</strong>
              </div>
            </div>
          ) : (
            <>
              <span>This Week</span>
              {weeklyForecast.map((item, index) => {
                const isActive = index === safeActiveIndex;

                return (
                  <div
                    className={`${styles["forecast-row"]}${isActive ? ` ${styles.active}` : ""}`}
                    key={item.day}
                  >
                    <button
                      aria-pressed={isActive}
                      className={styles["forecast-day-button"]}
                      onClick={() => handleSelectDay(index)}
                      type="button"
                    >
                      <WeatherIcon type={item.icon} />
                      <span className={styles["forecast-day-info"]}>
                        <strong>{item.temp}</strong>
                        <small>{item.day}</small>
                      </span>
                    </button>
                    {isActive ? (
                      <button
                        aria-expanded={detailsOpen}
                        aria-label={`Show forecast details for ${item.day}`}
                        className={styles["forecast-arrow-button"]}
                        onClick={() => setDetailsOpen(true)}
                        type="button"
                      >
                        <ArrowRight aria-hidden="true" size={28} strokeWidth={2.1} />
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
