import Image from "next/image";
import { CloudSun, Droplets } from "lucide-react";
import { etoMetrics } from "./dashboardData";
import type { EtoDemandData } from "./openMeteoWeather";
import styles from "./EtoDemandSection.module.css";

type EtoDemandSectionProps = {
  data?: EtoDemandData;
};

export function EtoDemandSection({ data }: EtoDemandSectionProps) {
  const metrics = etoMetrics.map((metric) => ({
    ...metric,
    value: data?.metrics.find((item) => item.label === metric.label)?.value ?? metric.value,
  }));

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
            <CloudSun aria-hidden="true" size={60} />
            <div>
              <strong>
                {data?.temperature ?? "22°"} <span>{data?.condition ?? "Sunny"}</span>
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
