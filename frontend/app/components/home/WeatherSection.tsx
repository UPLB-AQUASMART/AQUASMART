"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";

import { forecast, type ForecastIcon } from "@/app/data/home";

import { SectionPill } from "./SectionPill";

const forecastDetails = [
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

function WeatherIcon({ type }: { type: ForecastIcon }) {
  return (
    <span className={`weather-icon ${type}`} aria-hidden="true">
      <span />
    </span>
  );
}

export function WeatherSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [slideDirection, setSlideDirection] = useState<"forward" | "back">("forward");
  const activeForecast = forecast[activeIndex];
  const activeDetail = forecastDetails[activeIndex] ?? forecastDetails[0];
  const isRainy = activeForecast.icon === "rain";

  const handleSelectDay = (index: number) => {
    setSlideDirection(index >= activeIndex ? "forward" : "back");
    setActiveIndex(index);
    setDetailsOpen(false);
  };

  const weatherClassName = [
    "weather-section",
    isRainy ? "weather-rainy" : "",
    `weather-slide-${slideDirection}`,
    "scroll-reveal",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={weatherClassName} id="weather">
      <div className={`weather-sun weather-sun-${activeForecast.icon}`} aria-hidden="true" />
      <div className="weather-layout">
        <div className="weather-copy">
          <div className="weather-copy-panel" key={activeIndex}>
            <SectionPill>Weather Forecast</SectionPill>
            <div className="weather-meta">
              <strong>{activeDetail.date}</strong>
              <span>{activeDetail.time}</span>
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
            <p className="weather-recommendation">
              {activeDetail.recommendation}
            </p>
          </div>
        </div>

        <div className={detailsOpen ? "week-card detail-mode" : "week-card"}>
          {detailsOpen ? (
            <div className="forecast-detail-view" aria-live="polite">
              <div className="forecast-detail-header">
                <button
                  aria-label="Back to weekly forecast"
                  className="forecast-back-button"
                  onClick={() => setDetailsOpen(false)}
                  type="button"
                >
                  <ArrowLeft aria-hidden="true" size={18} strokeWidth={2.2} />
                </button>
                <h3>Today&apos;s Forecast Data</h3>
                <span>Open-Meteo</span>
              </div>

              <div className="forecast-current-card">
                <WeatherIcon type={activeForecast.icon} />
                <div>
                  <strong>{activeForecast.temp}</strong>
                  <small>{activeForecast.day}</small>
                </div>
                <span>{activeDetail.status}</span>
              </div>

              <div className="forecast-outlook">
                <strong>Irrigation outlook</strong>
                <p>{activeDetail.recommendation}</p>
              </div>

              <dl className="forecast-detail-list">
                {activeDetail.metrics.slice(0, 6).map(([label, value]) => (
                  <div key={label}>
                    <dt>
                      <span aria-hidden="true" />
                      {label}
                    </dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>

              <div className="forecast-eto-row">
                <span aria-hidden="true" />
                <strong>ET0 {activeDetail.metrics[6]?.[1] ?? "3.1 mm"} demand</strong>
              </div>
            </div>
          ) : (
            <>
              <span>This Week</span>
              {forecast.map((item, index) => {
                const isActive = index === activeIndex;

                return (
                  <div
                    className={isActive ? "forecast-row active" : "forecast-row"}
                    key={item.day}
                  >
                    <button
                      aria-pressed={isActive}
                      className="forecast-day-button"
                      onClick={() => handleSelectDay(index)}
                      type="button"
                    >
                      <WeatherIcon type={item.icon} />
                      <span className="forecast-day-info">
                        <strong>{item.temp}</strong>
                        <small>{item.day}</small>
                      </span>
                    </button>
                    {isActive ? (
                      <button
                        aria-expanded="false"
                        aria-label={`Show forecast details for ${item.day}`}
                        className="forecast-arrow-button"
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
