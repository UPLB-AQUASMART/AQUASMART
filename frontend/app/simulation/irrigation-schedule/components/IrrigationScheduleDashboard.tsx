"use client";

import { useState } from "react";
import { useOpenMeteoWeather } from "@/app/forecast/components/openMeteoWeather";
import { IrrigationScenarioSetup } from "./IrrigationScenarioSetup";
import {
  buildIrrigationScheduleData,
  type IrrigationScenario,
} from "./irrigationScheduleData";
import { MetricsSummary } from "./MetricsSummary";
import { ScheduleExportActions } from "./ScheduleExportActions";
import { SchedulePlanner } from "./SchedulePlanner";
import { WaterBalanceChart } from "./WaterBalanceChart";
import styles from "./IrrigationScheduleDashboard.module.css";

export type PlannerView = "weekly" | "monthly";

function IrrigationScenarioDashboard({ scenario }: { scenario: IrrigationScenario }) {
  const { data, error, isLoading, status } = useOpenMeteoWeather();
  const [plannerView, setPlannerView] = useState<PlannerView>("weekly");
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDateKey, setSelectedDateKey] = useState<string | undefined>();
  const [transitionKey, setTransitionKey] = useState(0);
  const scheduleData = buildIrrigationScheduleData(
    data,
    scenario,
    weekOffset,
    selectedDateKey,
    monthOffset,
  );
  const isUnavailable = status === "location-unavailable" || status === "weather-unavailable";
  const replayTransition = () => setTransitionKey((current) => current + 1);

  const changeWeek = (direction: -1 | 1) => {
    setWeekOffset((current) => current + direction);
    setSelectedDateKey(undefined);
    replayTransition();
  };
  const changeMonth = (direction: -1 | 1) => {
    const next = monthOffset + direction;
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + next, 1);
    const firstDayInMonth = data?.irrigationWindow.find((day) => {
      const date = new Date(`${day.date}T12:00:00`);
      return (
        date.getFullYear() === nextMonth.getFullYear() &&
        date.getMonth() === nextMonth.getMonth()
      );
    });

    setMonthOffset(next);
    setSelectedDateKey(firstDayInMonth?.date);
    replayTransition();
  };

  const selectDay = (dateKey: string) => {
    setSelectedDateKey(dateKey);
    replayTransition();
  };

  const changeView = (view: PlannerView) => {
    setPlannerView(view);
    replayTransition();
  };

  return (
    <section
      className={styles.dashboard}
      aria-label="Irrigation schedule planner"
      data-loading={isLoading ? "true" : "false"}
    >
      <div className={styles.plannerColumn}>
        <SchedulePlanner
          data={scheduleData}
          loading={isLoading}
          onMonthChange={changeMonth}
          onSelectDay={selectDay}
          onViewChange={changeView}
          onWeekChange={changeWeek}
          transitionKey={transitionKey}
          view={plannerView}
        />
      </div>
      <div className={styles.analytics}>
        {isUnavailable ? (
          <p className={styles.weatherAlert}>
            Unable to load Open-Meteo data{error ? `: ${error}` : "."}
          </p>
        ) : null}
        <MetricsSummary
          data={scheduleData}
          loading={isLoading}
          transitionKey={transitionKey}
        />
        <WaterBalanceChart
          data={scheduleData.chart}
          loading={isLoading}
          selectedDateKey={scheduleData.selectedDateKey}
          transitionKey={transitionKey}
        />
        <ScheduleExportActions
          loading={isLoading}
          scenario={scenario}
          weatherData={data}
        />
      </div>
    </section>
  );
}

export function IrrigationScheduleDashboard() {
  const [scenario, setScenario] = useState<IrrigationScenario | null>(null);

  if (!scenario) {
    return <IrrigationScenarioSetup onGenerate={setScenario} />;
  }

  return <IrrigationScenarioDashboard scenario={scenario} />;
}
