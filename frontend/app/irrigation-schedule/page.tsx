import {
  CalendarDays,
  CheckCircle2,
  CloudRain,
  Droplets,
  Gauge,
  Sprout,
  TriangleAlert,
  Waves,
} from "lucide-react";

import { ScrollRevealInit } from "@/app/components/home/ScrollRevealInit";
import { SiteNav } from "@/app/components/home/SiteNav";
import styles from "./page.module.css";

const scheduleDays = [
  { day: "01", status: "healthy" },
  { day: "02", status: "selected" },
  { day: "03", status: "healthy" },
  { day: "04", status: "healthy" },
  { day: "05", status: "healthy" },
  { day: "06", status: "healthy" },
  { day: "07", status: "healthy" },
  { day: "08", status: "irrigate" },
  { day: "09", status: "irrigate" },
  { day: "10", status: "irrigate" },
  { day: "11", status: "irrigate" },
  { day: "12", status: "irrigate" },
  { day: "13", status: "irrigate" },
  { day: "14", status: "irrigate" },
  { day: "15", status: "caution" },
  { day: "16", status: "caution" },
  { day: "17", status: "caution" },
  { day: "18", status: "caution" },
  { day: "19", status: "caution" },
  { day: "20", status: "caution" },
  { day: "21", status: "caution" },
  { day: "22", status: "healthy" },
  { day: "23", status: "healthy" },
  { day: "24", status: "healthy" },
  { day: "25", status: "healthy" },
  { day: "26", status: "healthy" },
  { day: "27", status: "healthy" },
  { day: "28", status: "healthy" },
] as const;

const metricCards = [
  {
    label: "Precipitation",
    value: "2 mm",
    helper: "Observed rainfall",
    icon: CloudRain,
    tone: "blue",
  },
  {
    label: "Crop ET Demand",
    value: "1.1 mm",
    helper: "Daily crop water use",
    icon: Sprout,
    tone: "green",
  },
  {
    label: "Water Balance",
    value: "1.9 mm",
    helper: "Available moisture",
    icon: Waves,
    tone: "teal",
  },
  {
    label: "Irrigation Required",
    value: "0 m3",
    helper: "No pump volume today",
    icon: Gauge,
    tone: "orange",
  },
] as const;

const chartDays = [
  { label: "May 22", rain: 1, demand: 2, balance: 12 },
  { label: "May 23", rain: 44, demand: 2, balance: 50 },
  { label: "May 24", rain: 62, demand: 1, balance: 66 },
  { label: "May 25", rain: 28, demand: 3, balance: 44 },
  { label: "May 26", rain: 78, demand: 1, balance: 82 },
  { label: "May 27", rain: 0, demand: 4, balance: 14 },
  { label: "May 28", rain: 18, demand: 3, balance: 28 },
  { label: "May 29", rain: 100, demand: 1, balance: 98 },
  { label: "May 30", rain: 44, demand: 2, balance: 52 },
  { label: "May 31", rain: 12, demand: 5, balance: 20 },
] as const;

const timeline = [
  { label: "Morning", value: "Skip", note: "Rainfall keeps balance positive" },
  { label: "Midday", value: "Monitor", note: "Check field sensor drift" },
  { label: "Evening", value: "Hold", note: "No extra volume scheduled" },
] as const;

function ScheduleIcon({ status }: { status: (typeof scheduleDays)[number]["status"] }) {
  if (status === "irrigate") {
    return <Sprout aria-hidden="true" size={18} strokeWidth={2.5} />;
  }

  if (status === "caution") {
    return <TriangleAlert aria-hidden="true" size={18} strokeWidth={2.7} />;
  }

  return <Droplets aria-hidden="true" size={18} fill="currentColor" strokeWidth={2.2} />;
}

export default function IrrigationSchedulePage() {
  return (
    <main className={styles.page}>
      <ScrollRevealInit />
      <SiteNav activeLabel="Weather" />

      <section className={styles.hero} aria-labelledby="irrigation-schedule-title">
        <div className={styles.shell}>
          <div className={styles.heroGrid}>
            <div className={styles.copy}>
              <span className={styles.eyebrow}>
                <CalendarDays aria-hidden="true" size={16} />
                Irrigation schedule
              </span>
              <h1 id="irrigation-schedule-title">Water only when the field needs it.</h1>
              <p>
                A forecast-aligned irrigation view that combines rainfall, crop ET demand,
                and water balance into a clear daily action plan.
              </p>
            </div>

            <div className={styles.statusCard} aria-label="Current irrigation recommendation">
              <span className={styles.statusIcon}>
                <CheckCircle2 aria-hidden="true" size={30} />
              </span>
              <div>
                <small>Status and recommendation</small>
                <strong>Skip irrigation today</strong>
                <p>Sufficient rain is expected to cover crop demand.</p>
              </div>
            </div>
          </div>

          <div className={styles.dashboard}>
            <aside className={styles.calendarPanel} aria-labelledby="calendar-title">
              <div className={styles.panelHeader}>
                <div>
                  <h2 id="calendar-title">January</h2>
                  <p>Daily field status</p>
                </div>
                <span>2026</span>
              </div>

              <div className={styles.weekdays} aria-hidden="true">
                <span>M</span>
                <span>T</span>
                <span>W</span>
                <span>T</span>
                <span>F</span>
                <span>S</span>
                <span>S</span>
              </div>

              <div className={styles.calendarGrid}>
                {scheduleDays.map((item) => (
                  <button
                    className={styles.day}
                    data-status={item.status}
                    key={item.day}
                    type="button"
                    aria-label={`January ${item.day}, ${item.status} status`}
                  >
                    <span>{item.day}</span>
                    <ScheduleIcon status={item.status} />
                  </button>
                ))}
              </div>

              <div className={styles.legend} aria-label="Schedule legend">
                <span>
                  <Droplets aria-hidden="true" size={18} fill="currentColor" />
                  Healthy
                </span>
                <span>
                  <Sprout aria-hidden="true" size={18} />
                  Irrigate
                </span>
                <span>
                  <TriangleAlert aria-hidden="true" size={18} />
                  Caution
                </span>
              </div>
            </aside>

            <div className={styles.analytics}>
              <section className={styles.metricsGrid} aria-label="Irrigation metrics">
                {metricCards.map(({ helper, icon: Icon, label, tone, value }) => (
                  <article className={styles.metricCard} data-tone={tone} key={label}>
                    <span>
                      <Icon aria-hidden="true" size={22} />
                    </span>
                    <div>
                      <p>{label}</p>
                      <strong>{value}</strong>
                      <small>{helper}</small>
                    </div>
                  </article>
                ))}
              </section>

              <section className={styles.chartCard} aria-labelledby="chart-title">
                <div className={styles.cardHeader}>
                  <div>
                    <h2 id="chart-title">Water Balance Chart</h2>
                    <p>Rainfall supply compared with crop water demand.</p>
                  </div>
                  <span>10-day view</span>
                </div>

                <div className={styles.chartLegend} aria-hidden="true">
                  <span className={styles.precipitationKey}>Precipitation</span>
                  <span className={styles.demandKey}>ET Demand</span>
                  <span className={styles.balanceKey}>Water Balance</span>
                </div>

                <div className={styles.chart} aria-label="Water balance comparison chart">
                  <svg className={styles.balanceLine} viewBox="0 0 900 260" role="img">
                    <title>Water balance trend</title>
                    <path d="M20 220 C 60 216, 85 211, 100 204 S 160 112, 180 104 S 240 58, 260 62 S 315 190, 340 164 S 415 40, 430 44 S 485 218, 520 214 S 575 184, 600 170 S 675 34, 700 42 S 755 132, 780 124 S 845 206, 880 218" />
                    {chartDays.map((item, index) => {
                      const x = 20 + index * 95;
                      const y = 230 - item.balance * 1.9;
                      return <circle cx={x} cy={y} key={item.label} r="5" />;
                    })}
                  </svg>

                  <div className={styles.barLayer}>
                    {chartDays.map((item) => (
                      <div className={styles.barGroup} key={item.label}>
                        <span
                          className={styles.rainBar}
                          style={{ "--bar-height": `${item.rain}%` } as React.CSSProperties}
                        />
                        <span
                          className={styles.demandBar}
                          style={{ "--bar-height": `${Math.max(item.demand * 8, 12)}%` } as React.CSSProperties}
                        />
                        <small>{item.label}</small>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className={styles.timelineCard} aria-labelledby="timeline-title">
                <div className={styles.cardHeader}>
                  <div>
                    <h2 id="timeline-title">Today&apos;s Plan</h2>
                    <p>Operational actions for the selected day.</p>
                  </div>
                </div>

                <div className={styles.timeline}>
                  {timeline.map((item) => (
                    <article key={item.label}>
                      <small>{item.label}</small>
                      <strong>{item.value}</strong>
                      <p>{item.note}</p>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
