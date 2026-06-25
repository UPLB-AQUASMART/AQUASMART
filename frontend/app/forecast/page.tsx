"use client";

import { CloudRain, CloudSun, Sun } from "lucide-react";
import Image from "next/image";

import { SiteNav } from "@/app/components/home/SiteNav";
import { forecast } from "@/app/data/home";
import styles from "./page.module.css";

function ForecastIcon({ icon }: { icon: "sun" | "rain" | "cloud" }) {
  if (icon === "sun") return <Sun aria-hidden="true" size={22} strokeWidth={1.7} />;
  if (icon === "cloud") return <CloudSun aria-hidden="true" size={24} strokeWidth={1.65} />;
  return <CloudRain aria-hidden="true" size={24} strokeWidth={1.65} />;
}

export default function ForecastPage() {
  return (
    <main className={styles["weather-page"]}>
      <SiteNav activeLabel="Weather" />
      <section className={styles["weather-frame"]} aria-label="AQUASMART weather forecast">
        <div className={styles["background-clouds"]} aria-hidden="true" />
        <div className={styles["light-rain-layer"]} aria-hidden="true" />
        <div className={styles["radar-rings"]} aria-hidden="true" />

        <div className={styles["hero-cloud"]} aria-hidden="true">
          <Image src="/assets/weather-cloud-icon.png" alt="" width={558} height={310} priority />
        </div>

        <section className={styles["forecast-copy"]}>
          <p className={styles["eyebrow"]}>Weather Forecast</p>
          <div className={styles["date-row"]}>
            <strong>Today, June 16</strong>
            <span>2:34 pm</span>
          </div>
          <h1>
            Heavy Rainfall
            <span>with 87% chance of rain</span>
          </h1>
          <ul>
            <li>There is a high chance of heavy rainfall, est. 5 mm</li>
            <li>Water Salinity of 5.6 is optimal for Rice and Corn irrigation</li>
            <li>pH level of 5 is optimal for irrigation of all crops</li>
          </ul>
          <p className={styles.recommendation}>
            We recommend you to irrigate your crops in 3-4 days
            <span>...</span>
          </p>
        </section>

        <aside className={styles["weekly-card"]} aria-label="This week forecast">
          <p className={styles["weekly-title"]}>This Week</p>
          <div className={styles["weekly-list"]}>
            {forecast.map((item, index) => (
              <article className={index === 0 ? `${styles["forecast-row"]} ${styles.selected}` : styles["forecast-row"]} key={`${item.day}-${item.temp}`}>
                <span className={styles["icon-bubble"]}>
                  <ForecastIcon icon={item.icon} />
                </span>
                <div className={styles["day-pill"]}>
                  <strong>{item.temp}</strong>
                  <span>{item.day}</span>
                </div>
              </article>
            ))}
          </div>
          <div className={styles["pager-dots"]} aria-hidden="true">
            <span />
            <span />
          </div>
        </aside>
      </section>
    </main>
  );
}
