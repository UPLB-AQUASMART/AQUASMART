import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { SlidersHorizontal, Thermometer } from "lucide-react";
import { useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  chartOffsetPattern,
  chartParameterMeta,
  chartParameterOptions,
  timeRangeOptions,
} from "../chartConfig";
import type { ChartParameterKey, Well } from "../types";
import { ChartDropdown } from "./ChartDropdown";
import styles from "./ChartAnalytics.module.css";

ChartJS.register(
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
);

type ChartAnalyticsProps = {
  wells: Well[];
};

function addMonths(date: Date, months: number) {
  const next = new Date(date);
  const day = next.getDate();
  next.setMonth(next.getMonth() + months);
  if (next.getDate() !== day) next.setDate(0);
  return next;
}

function buildDateSeries(start: Date, end: Date, count: number) {
  if (count <= 1) return [end];
  const span = end.getTime() - start.getTime();
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(start.getTime() + (span / (count - 1)) * index);
    date.setHours(0, 0, 0, 0);
    return date;
  });
}

function formatChartDate(date: Date, includeYear = false) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    ...(includeYear ? { year: "numeric" } : {}),
  }).format(date);
}

function getChartLabels(
  selectedTimeRange: (typeof timeRangeOptions)[number],
  today: Date,
) {
  const end = new Date(today);
  end.setHours(0, 0, 0, 0);

  if (selectedTimeRange === "Last 3 Months") {
    return buildDateSeries(addMonths(end, -3), end, 8).map((date) =>
      formatChartDate(date),
    );
  }

  if (selectedTimeRange === "Last 12 Months") {
    return buildDateSeries(addMonths(end, -11), end, 12).map((date) =>
      formatChartDate(date, true),
    );
  }

  return buildDateSeries(addMonths(end, -6), end, 7).map((date) =>
    formatChartDate(date),
  );
}

export function ChartAnalytics({ wells }: ChartAnalyticsProps) {
  const [selectedChartParameter, setSelectedChartParameter] =
    useState<ChartParameterKey>("ph");
  const [selectedChartWellId, setSelectedChartWellId] = useState("1");
  const [selectedTimeRange, setSelectedTimeRange] =
    useState<(typeof timeRangeOptions)[number]>("Last 6 Months");
  const [openChartDropdown, setOpenChartDropdown] = useState<string | null>(
    null,
  );

  const selectedChartWell =
    wells.find((well) => String(well.id) === selectedChartWellId) ?? wells[0];
  const chartWellOptions = wells.map((well) => ({
    label: well.name,
    value: String(well.id),
  }));
  const timeRangeDropdownOptions = timeRangeOptions.map((option) => ({
    label: option,
    value: option,
  }));
  const chartBaseValue =
    selectedChartParameter === "discharge"
      ? selectedChartWell.discharge
      : selectedChartWell.readings[selectedChartParameter];
  const chartMeta = chartParameterMeta[selectedChartParameter];
  const today = useMemo(() => new Date(), []);
  const chartLabels = useMemo(() => {
    return getChartLabels(selectedTimeRange, today);
  }, [selectedTimeRange, today]);
  const lineData = useMemo(() => {
    const pattern =
      selectedTimeRange === "Last 12 Months"
        ? chartOffsetPattern.slice(0, 12)
        : chartOffsetPattern.slice(-chartLabels.length);
    const highValues = pattern.map((offset) =>
      Number(
        (chartBaseValue + chartMeta.spread + offset * chartMeta.spread).toFixed(
          2,
        ),
      ),
    );
    const lowValues = pattern.map((offset) =>
      Number(
        (
          chartBaseValue -
          chartMeta.spread +
          offset * chartMeta.spread * 0.82
        ).toFixed(2),
      ),
    );

    return {
      labels: chartLabels,
      datasets: [
        {
          label: `${chartMeta.label} - upper range`,
          data: highValues,
          borderColor: "#0b2545",
          backgroundColor: "rgba(11,37,69,.12)",
          pointRadius: 3,
          tension: 0.38,
          fill: "+1",
        },
        {
          label: `${chartMeta.label} - lower range`,
          data: lowValues,
          borderColor: "#46c5df",
          backgroundColor: "rgba(70,197,223,.08)",
          pointRadius: 3,
          tension: 0.38,
        },
      ],
    };
  }, [
    chartBaseValue,
    chartLabels,
    chartMeta.label,
    chartMeta.spread,
    selectedTimeRange,
  ]);

  return (
    <div className={styles.analytics}>
      <article className={styles.chartCard}>
        <div className={styles.chartHeading}>
          <h3>
            Chart <span>Parameters</span>
          </h3>
          <SlidersHorizontal size={16} />
        </div>
        <div className={styles.controls}>
          <ChartDropdown
            id="chart-parameter"
            label="Parameter"
            options={chartParameterOptions}
            value={selectedChartParameter}
            open={openChartDropdown === "parameter"}
            onOpenChange={(isOpen) =>
              setOpenChartDropdown(isOpen ? "parameter" : null)
            }
            onChange={setSelectedChartParameter}
          />
          <ChartDropdown
            id="chart-well"
            label="Well"
            options={chartWellOptions}
            value={selectedChartWellId}
            open={openChartDropdown === "well"}
            onOpenChange={(isOpen) =>
              setOpenChartDropdown(isOpen ? "well" : null)
            }
            onChange={setSelectedChartWellId}
          />
          <ChartDropdown
            id="chart-time-range"
            label="Time Range"
            options={timeRangeDropdownOptions}
            value={selectedTimeRange}
            open={openChartDropdown === "time"}
            onOpenChange={(isOpen) =>
              setOpenChartDropdown(isOpen ? "time" : null)
            }
            onChange={setSelectedTimeRange}
          />
          <p className={styles.chartHint}>
            Explore temporal trends for selected parameters across wells. Adjust
            filters to customize the chart view.
          </p>
        </div>
      </article>
      <article className={styles.chartCard}>
        <div className={styles.chartHeading}>
          <h3>
            <Thermometer size={19} /> Chart Plot
          </h3>
          <SlidersHorizontal size={16} />
        </div>
        <div className={styles.line}>
          <Line
            data={lineData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              interaction: { mode: "index", intersect: false },
              plugins: { legend: { position: "top" } },
              scales: {
                y: { title: { display: true, text: chartMeta.axis } },
              },
            }}
          />
        </div>
      </article>
    </div>
  );
}
