"use client";

import Image from "next/image";
import { Bookmark, Check, Cloud, CloudFog, CloudLightning, CloudRain, Droplets, Sun } from "lucide-react";
import { useState } from "react";
import { etoMetrics } from "./dashboardData";
import type { EtoDemandData } from "./openMeteoWeather";
import styles from "./EtoDemandSection.module.css";

type EtoDemandSectionProps = {
  data?: EtoDemandData;
};

function getWeatherIconClass(condition = "Sunny") {
  const normalized = condition.toLowerCase();

  if (normalized.includes("thunder")) return styles.iconThunder;
  if (normalized.includes("rain") || normalized.includes("drizzle") || normalized.includes("shower")) {
    return styles.iconRain;
  }
  if (normalized.includes("fog")) return styles.iconFog;
  if (normalized.includes("cloud") || normalized.includes("overcast")) return styles.iconCloud;
  return styles.iconSun;
}

function WeatherConditionIcon({ condition = "Sunny", size }: { condition?: string; size: number }) {
  const normalized = condition.toLowerCase();
  const className = getWeatherIconClass(condition);

  if (normalized.includes("thunder")) {
    return <CloudLightning aria-hidden="true" className={className} size={size} />;
  }
  if (normalized.includes("rain") || normalized.includes("drizzle") || normalized.includes("shower")) {
    return <CloudRain aria-hidden="true" className={className} size={size} />;
  }
  if (normalized.includes("fog")) return <CloudFog aria-hidden="true" className={className} size={size} />;
  if (normalized.includes("cloud") || normalized.includes("overcast")) {
    return <Cloud aria-hidden="true" className={className} size={size} />;
  }
  return <Sun aria-hidden="true" className={className} size={size} />;
}

export function EtoDemandSection({ data }: EtoDemandSectionProps) {
  const [isRecommendationSaved, setIsRecommendationSaved] = useState(false);
  const metrics = etoMetrics.map((metric) => ({
    ...metric,
    value: data?.metrics.find((item) => item.label === metric.label)?.value ?? metric.value,
  }));
  const condition = data?.condition ?? "Sunny";

  return (
    <section className={styles.section} aria-labelledby="eto-demand-title">
      <div className={styles.titleBlock}>
        <Droplets aria-hidden="true" size={34} />
        <div>
          <h2 id="eto-demand-title">ETO Demand</h2>
          <p>Evapotranspiration demand and key weather factors.</p>
        </div>
      </div>

      <div className={styles.layout}>
        <aside className={styles.recommendationCard}>
          <h3>Today&apos;s Data Recommendation</h3>
          <div className={styles.todayWeather}>
            <WeatherConditionIcon condition={condition} size={60} />
            <div>
              <strong>
                {data?.temperature ?? "22°"} <span>{condition}</span>
              </strong>
              <small>{data?.dateLabel ?? "Today, Friday, 1 Nov"}</small>
            </div>
          </div>
          <div className={styles.outlook}>
            <h4>Irrigation outlook</h4>
            <p>
              {data?.outlook ?? "Low rain and moderate ETO suggest monitoring soil moisture before irrigation."}
            </p>
          </div>
          <div className={styles.recommendations}>
            <h4>Recommendations</h4>
            <ol>
              {(data?.recommendations ?? [
                "Low rain probability. Irrigation may still be needed if soil moisture remains low.",
                "Weather is nice, do not irrigate yet",
                "Amazing! You can irrigate tomorrow",
                "Fantastic! Tocino is weathering tomorrow",
              ]).map((recommendation) => (
                <li key={recommendation}>{recommendation}</li>
              ))}
            </ol>
          </div>
          <button
            className={`${styles.saveButton}${isRecommendationSaved ? ` ${styles.saved}` : ""}`}
            type="button"
            onClick={() => setIsRecommendationSaved(true)}
          >
            {isRecommendationSaved ? (
              <Check aria-hidden="true" size={18} strokeWidth={2.6} />
            ) : (
              <Bookmark aria-hidden="true" size={18} strokeWidth={2.4} />
            )}
            {isRecommendationSaved ? "Recommendation saved" : "Save recommendation"}
          </button>
        </aside>

        <article className={styles.etoCard}>
          <div className={styles.etoHeader}>
            <div>
              <h3>Today&apos;s ETO Demand</h3>
              <strong>{data?.demand ?? "3.1 mm"}</strong>
            </div>
          </div>
          <div className={styles.metricGrid}>
            {metrics.map(({ label, value, Icon }) => (
              <div key={label} className={styles.metric}>
                <span>
                  <Icon aria-hidden="true" size={24} />
                </span>
                <p>{label}</p>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          <div className={styles.visualPanel}>
            <div className={styles.visualImage}>
              <Image
                alt="Evapotranspiration factors around a plant showing sunlight, wind, temperature, cloud cover, humidity, transpiration, evaporation, and ETO demand."
                fill
                sizes="(max-width: 1180px) 100vw, 940px"
                src="/assets/eto-visual.png"
              />
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
