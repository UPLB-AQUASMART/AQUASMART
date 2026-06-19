import { forecast, type ForecastIcon } from "@/app/data/home";

import { SectionPill } from "./SectionPill";

function WeatherIcon({ type }: { type: ForecastIcon }) {
  return (
    <span className={`weather-icon ${type}`} aria-hidden="true">
      <span />
    </span>
  );
}

export function WeatherSection() {
  return (
    <section className="weather-section" id="weather">
      <div className="weather-sun" aria-hidden="true" />
      <div className="weather-layout">
        <div className="weather-copy">
          <SectionPill>Weather Forecast</SectionPill>
          <div className="weather-meta">
            <strong>Today, June 16</strong>
            <span>2:34 pm</span>
          </div>
          <h2>
            Today is Sunny
            <span>with 0% chance of rain</span>
          </h2>
          <ul>
            <li>There is no rain scheduled in this coming week.</li>
            <li>Water Salinity of 5.6 is optimal for Rice and Corn irrigation</li>
            <li>pH level of 5 is optimal for irrigation of all crops</li>
          </ul>
          <p className="weather-recommendation">
            We recommend you to irrigate your crops as soon as possible
          </p>
        </div>

        <div className="week-card">
          <span>This Week</span>
          {forecast.map((item, index) => (
            <div className={index === 0 ? "forecast-row active" : "forecast-row"} key={item.day}>
              <WeatherIcon type={item.icon} />
              <div>
                <strong>{item.temp}</strong>
                <small>{item.day}</small>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
