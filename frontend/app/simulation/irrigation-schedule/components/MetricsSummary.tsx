import {
  Check,
  CloudRain,
  Leaf,
  Scale,
  ShowerHead,
  TriangleAlert,
} from "lucide-react";
import type { IrrigationScheduleData } from "./irrigationScheduleData";
import styles from "./MetricsSummary.module.css";

const metricIcons = {
  Precipitation: CloudRain,
  "Crop ET Demand": Leaf,
  "Water Balance": Scale,
  "Irrigation Required": ShowerHead,
} as const;

export function MetricsSummary({
  data,
  loading,
  transitionKey,
}: {
  data: IrrigationScheduleData;
  loading: boolean;
  transitionKey: number;
}) {
  const RecommendationIcon = data.recommendation.status === "caution" ? TriangleAlert : Check;

  return (
    <section
      className={styles.summary}
      aria-labelledby="irrigation-summary-heading"
      data-loading={loading ? "true" : "false"}
    >
      <h2 id="irrigation-summary-heading" className={styles.srOnly}>
        Irrigation Summary
      </h2>
      <div className={styles.weeklyGrid} key={`metrics-${transitionKey}`}>
        {data.metrics.map(({ label, tone, unit, value }) => {
          const Icon = metricIcons[label];
          return (
          <article className={styles.metric} data-tone={tone} key={label}>
            <span className={styles.icon}>
              <Icon aria-hidden="true" />
            </span>
            <p>{label}</p>
            <strong>
              {loading ? "..." : value}
              <small>{loading ? "" : unit}</small>
            </strong>
          </article>
          );
        })}

        <article className={styles.recommendation} data-status={data.recommendation.status}>
          <span>
            <RecommendationIcon aria-hidden="true" />
          </span>
          <p>Status & Recommendation</p>
          <strong>{loading ? "LOADING" : data.recommendation.headline}</strong>
          <small>{loading ? "Open-Meteo" : data.recommendation.detail}</small>
        </article>
      </div>
    </section>
  );
}
