import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Droplet,
  Info,
  Sprout,
  TriangleAlert,
} from "lucide-react";
import type { PlannerView } from "./IrrigationScheduleDashboard";
import type {
  CalendarStatus,
  IrrigationScheduleData,
  ScheduleStatus,
} from "./irrigationScheduleData";
import styles from "./SchedulePlanner.module.css";

function StatusIcon({ status }: { status: ScheduleStatus | CalendarStatus }) {
  if (status === "irrigate") {
    return <Sprout aria-hidden="true" />;
  }

  if (status === "caution") {
    return <TriangleAlert aria-hidden="true" />;
  }

  if (status === "skip") {
    return <Check aria-hidden="true" />;
  }

  if (status === "empty" || status === "muted") {
    return null;
  }

  return <Droplet aria-hidden="true" fill="currentColor" />;
}

export function SchedulePlanner({
  data,
  loading,
  onMonthChange,
  onSelectDay,
  onViewChange,
  onWeekChange,
  transitionKey,
  view,
}: {
  data: IrrigationScheduleData;
  loading: boolean;
  onMonthChange: (direction: -1 | 1) => void;
  onSelectDay: (dateKey: string) => void;
  onViewChange: (view: PlannerView) => void;
  onWeekChange: (direction: -1 | 1) => void;
  transitionKey: number;
  view: PlannerView;
}) {
  const isWeekly = view === "weekly";

  return (
    <aside className={styles.panel} aria-labelledby="irrigation-schedule-heading">
      <div className={styles.titleRow}>
        <span className={styles.titleIcon}>
          <CalendarDays aria-hidden="true" />
        </span>
        <div>
          <h1 id="irrigation-schedule-heading">Irrigation Schedule Planner</h1>
          <p>
            {loading
              ? "Fetching live Open-Meteo weather and soil inputs."
              : "Smart scheduling based on weather and soil conditions."}
          </p>
        </div>
      </div>

      <div className={styles.segmented} aria-label="Schedule view">
        <button
          className={view === "weekly" ? styles.activeSegment : undefined}
          type="button"
          onClick={() => onViewChange("weekly")}
        >
          Weekly View
        </button>
        <button
          className={view === "monthly" ? styles.activeSegment : undefined}
          type="button"
          onClick={() => onViewChange("monthly")}
        >
          Monthly View
        </button>
      </div>

      {loading ? (
        <div className={styles.loadingPanel} role="status">
          <strong>Loading Open-Meteo scenario</strong>
          <p>Fetching rainfall, ET0 demand, and soil moisture estimates for your field.</p>
        </div>
      ) : isWeekly ? (
        <WeeklySchedule
          data={data}
          onSelectDay={onSelectDay}
          onWeekChange={onWeekChange}
          transitionKey={transitionKey}
        />
      ) : (
        <MonthlySchedule
          data={data}
          onMonthChange={onMonthChange}
          onSelectDay={onSelectDay}
          transitionKey={transitionKey}
        />
      )}
    </aside>
  );
}

function WeeklySchedule({
  data,
  onSelectDay,
  onWeekChange,
  transitionKey,
}: {
  data: IrrigationScheduleData;
  onSelectDay: (dateKey: string) => void;
  onWeekChange: (direction: -1 | 1) => void;
  transitionKey: number;
}) {
  return (
    <>
      <div className={styles.weekNav} key={`week-nav-${transitionKey}`}>
        <button
          type="button"
          aria-label="Previous week"
          disabled={!data.canViewPreviousWeek}
          onClick={() => onWeekChange(-1)}
        >
          <ChevronLeft aria-hidden="true" />
        </button>
        <div>
          <strong>{data.selectedDateLabel}</strong>
          <span>{data.weekLabel}</span>
        </div>
        <button
          type="button"
          aria-label="Next week"
          disabled={!data.canViewNextWeek}
          onClick={() => onWeekChange(1)}
        >
          <ChevronRight aria-hidden="true" />
        </button>
      </div>

      <div className={styles.weekList} key={`week-list-${transitionKey}`}>
        {data.weeklySchedule.map((item) => (
          <article
            className={`${styles.weekItem} ${item.selected ? styles.selectedWeekItem : ""}`}
            data-status={item.status}
            role="button"
            tabIndex={0}
            key={`${item.weekday}-${item.day}`}
            onClick={() => onSelectDay(item.dateKey)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelectDay(item.dateKey);
              }
            }}
          >
            <time>
              <span>{item.weekday}</span>
              <strong>{item.day}</strong>
            </time>
            <span className={styles.statusBadge}>
              <StatusIcon status={item.status} />
            </span>
            <div className={styles.weekCopy}>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
            </div>
            <button
              type="button"
              aria-label={`Open ${item.weekday} schedule details`}
              onClick={(event) => {
                event.stopPropagation();
                onSelectDay(item.dateKey);
              }}
            >
              {item.status === "healthy" && !item.selected ? (
                <Check aria-hidden="true" />
              ) : (
                <ChevronRight aria-hidden="true" />
              )}
            </button>
          </article>
        ))}
      </div>

      <p className={styles.note}>
        <Info aria-hidden="true" />
        Schedule adjusts automatically based on forecast and soil moisture.
      </p>
    </>
  );
}

function MonthlySchedule({
  data,
  onMonthChange,
  onSelectDay,
  transitionKey,
}: {
  data: IrrigationScheduleData;
  onMonthChange: (direction: -1 | 1) => void;
  onSelectDay: (dateKey: string) => void;
  transitionKey: number;
}) {
  return (
    <>
      <div className={styles.monthNav} key={`month-nav-${transitionKey}`}>
        <button
          type="button"
          aria-label="Previous month"
          disabled={!data.canViewPreviousMonth}
          onClick={() => onMonthChange(-1)}
        >
          <ChevronLeft aria-hidden="true" />
        </button>
        <strong>{data.monthLabel}</strong>
        <button
          type="button"
          aria-label="Next month"
          disabled={!data.canViewNextMonth}
          onClick={() => onMonthChange(1)}
        >
          <ChevronRight aria-hidden="true" />
        </button>
      </div>

      <div className={styles.weekdays} aria-hidden="true" key={`weekdays-${transitionKey}`}>
        {["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((day) => (
          <span key={day}>{day.charAt(0).toUpperCase()}</span>
        ))}
      </div>

      <div className={styles.calendarGrid} key={`calendar-${transitionKey}`}>
        {data.calendarDays.map((item, index) => (
          <button
            className={styles.calendarDay}
            data-selected={item.selected ? "true" : "false"}
            data-status={item.status}
            disabled={!item.selectable}
            key={`${item.dateKey}-${index}`}
            type="button"
            aria-label={`${item.dateKey}, ${item.status} status`}
            onClick={() => onSelectDay(item.dateKey)}
          >
            <span>{item.day}</span>
            <StatusIcon status={item.status} />
          </button>
        ))}
      </div>

      <div className={styles.legend} key={`legend-${transitionKey}`}>
        <h2>Legend</h2>
        {[
          ["healthy", "Healthy", "Sufficient rain, no irrigation needed"],
          ["irrigate", "Irrigate", "Watering recommended"],
          ["caution", "Caution", "Monitor soil moisture"],
          ["skip", "Skip", "Rain sufficient, skip irrigation"],
        ].map(([status, title, description]) => (
          <div className={styles.legendItem} data-status={status} key={status}>
            <span>
              <StatusIcon status={status as ScheduleStatus} />
            </span>
            <div>
              <strong>{title}</strong>
              <p>{description}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
