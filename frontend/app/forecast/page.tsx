"use client";

import { ChevronLeft, ChevronRight, CloudSun } from "lucide-react";
import { useState } from "react";
import { Header } from "../components/Header";
import { PageIntro } from "../components/PageIntro";

const forecastDays = [
  { day: "Tomorrow", rain: 60, temp: 24 },
  { day: "June 10", rain: 60, temp: 25 },
  { day: "June 11", rain: 60, temp: 24 },
  { day: "June 12", rain: 60, temp: 26 },
  { day: "June 13", rain: 45, temp: 27 },
];

export default function ForecastPage() {
  const [selected, setSelected] = useState(0);
  const current = forecastDays[selected];

  return (
    <main>
      <Header />
      <PageIntro title="Weather Forecast" />
      <section className="forecast-band">
        <div className="forecast-grid">
          <article className="forecast-card">
            <div className="current-weather">
              <div className="weather-symbol"><CloudSun size={88} strokeWidth={1.2} /><strong>{current.temp}°</strong></div>
              <div className="weather-facts">
                <div><strong>{current.rain}%</strong><b>Chance of Rain</b></div>
                <div><b>Last Rainfall:</b><b>5 Days Ago</b></div>
                <div><b>Irrigation Status:</b><b className="excellent">Excellent</b></div>
              </div>
            </div>

            <div className="forecast-selector">
              <button className="arrow-button" title="Previous day" onClick={() => setSelected((selected - 1 + forecastDays.length) % forecastDays.length)}><ChevronLeft /></button>
              <div className="forecast-days">
                {forecastDays.slice(0, 4).map((item, index) => (
                  <button key={item.day} className={selected === index ? "selected-day" : ""} onClick={() => setSelected(index)}>
                    <span>{item.day}</span><CloudSun size={45} strokeWidth={1.2} /><strong>{item.rain}%</strong>
                  </button>
                ))}
              </div>
              <button className="arrow-button" title="Next day" onClick={() => setSelected((selected + 1) % forecastDays.length)}><ChevronRight /></button>
            </div>
          </article>

          <aside className="forecast-summary">
            <span>Field outlook</span>
            <h2>Good conditions for scheduled irrigation</h2>
            <div className="rain-bars" aria-label="Rain probability chart">
              {forecastDays.map((day) => <div key={day.day}><i style={{ height: `${day.rain}%` }} /><small>{day.day.replace("June ", "")}</small></div>)}
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
