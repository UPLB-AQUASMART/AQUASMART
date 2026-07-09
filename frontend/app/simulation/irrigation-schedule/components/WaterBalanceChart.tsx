import { BarChart3, ChevronDown, Info } from "lucide-react";
import type { CSSProperties } from "react";
import type { IrrigationChartPoint } from "./irrigationScheduleData";
import styles from "./WaterBalanceChart.module.css";

const chartHeight = 320;

function linePath(points: { x: number; y: number }[]) {
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
}

function buildTicks(min: number, max: number) {
  const step = (max - min) / 6;
  return Array.from({ length: 7 }, (_, index) => Math.round(max - step * index));
}

export function WaterBalanceChart({
  data,
  loading,
  selectedDateKey,
  transitionKey,
}: {
  data: IrrigationChartPoint[];
  loading: boolean;
  selectedDateKey: string;
  transitionKey: number;
}) {
  const values = data.flatMap((item) => [item.rain, item.demand, item.balance]);
  const min = Math.min(0, ...values);
  const max = Math.max(10, ...values);
  const range = max - min;
  const width = 760;
  const points = data.map((item, index) => ({
    x: 50 + index * ((width - 100) / (data.length - 1)),
    y: 20 + ((max - item.balance) / range) * (chartHeight - 40),
  }));

  return (
    <section
      className={styles.card}
      aria-labelledby="water-balance-chart-heading"
      data-loading={loading ? "true" : "false"}
    >
      <div className={styles.header} key={`chart-header-${transitionKey}`}>
        <div className={styles.title}>
          <span>
            <BarChart3 aria-hidden="true" />
          </span>
          <h2 id="water-balance-chart-heading">Water Balance Chart</h2>
        </div>
        <button type="button" aria-label="Change chart range">
          Last 10 days
          <ChevronDown aria-hidden="true" />
        </button>
      </div>

      <div className={styles.legend} aria-hidden="true" key={`chart-legend-${transitionKey}`}>
        <span className={styles.rainKey}>Precipitation (mm)</span>
        <span className={styles.demandKey}>ET Demand (mm/day)</span>
        <span className={styles.balanceKey}>Water Balance (mm)</span>
      </div>

      <div className={styles.chart} data-mode="weekly" key={`chart-${transitionKey}`}>
        {loading ? (
          <div className={styles.loadingChart} role="status">
            Loading live chart data
          </div>
        ) : null}
        <div className={styles.axis} aria-hidden="true">
          {buildTicks(min, max).map((tick) => (
            <span key={tick}>{tick}</span>
          ))}
        </div>

        <div className={styles.plot}>
          <div className={styles.gridLines} aria-hidden="true" />
          <div className={styles.bars} aria-hidden="true">
            {data.map((item) => (
              <div
                className={styles.barGroup}
                data-selected={item.dateKey === selectedDateKey ? "true" : "false"}
                key={item.dateKey}
              >
                <span
                  className={styles.rainBar}
                  style={{ "--value": `${Math.max((item.rain / max) * 100, item.rain > 0 ? 3 : 0)}%` } as CSSProperties}
                />
                <span
                  className={styles.demandBar}
                  style={{ "--value": `${Math.max((item.demand / max) * 100, 3)}%` } as CSSProperties}
                />
              </div>
            ))}
          </div>
          <svg className={styles.line} viewBox={`0 0 ${width} ${chartHeight}`} role="img">
            <title>Water balance trend</title>
            <path d={linePath(points)} />
            {points.map((point, index) => (
              <circle
                cx={point.x}
                cy={point.y}
                data-selected={data[index].dateKey === selectedDateKey ? "true" : "false"}
                key={data[index].dateKey}
                r="5"
              />
            ))}
          </svg>
        </div>

        <div className={styles.labels}>
          {data.map((item) => (
            <span
              data-selected={item.dateKey === selectedDateKey ? "true" : "false"}
              key={item.dateKey}
            >
              {item.label}
            </span>
          ))}
        </div>
      </div>

      <p className={styles.note} key={`chart-note-${transitionKey}`}>
        <Info aria-hidden="true" />
        Positive values indicate water surplus. Negative values indicate water deficit.
      </p>
    </section>
  );
}
