import type { ForecastPageWeatherData } from "@/app/forecast/components/openMeteoWeather";

export type ScheduleStatus = "healthy" | "irrigate" | "caution" | "skip";
export type CalendarStatus = ScheduleStatus | "empty" | "muted";

export type IrrigationScenario = {
  cropType: string;
  fieldAreaHa: number;
  irrigationMethod: string;
  soilMoistureTarget: number;
  soilType: string;
  forecastPeriod: string;
  irrigationEfficiency: number;
};

export type WeeklyScheduleItem = {
  dateKey: string;
  weekday: string;
  day: string;
  title: string;
  description: string;
  status: ScheduleStatus;
  selected: boolean;
};

export type CalendarDay = {
  dateKey: string;
  day: string;
  status: CalendarStatus;
  selectable: boolean;
  selected: boolean;
};

export type IrrigationMetric = {
  label: "Precipitation" | "Crop ET Demand" | "Water Balance" | "Irrigation Required";
  value: string;
  unit: string;
  tone: "blue" | "green" | "orange";
};

export type IrrigationChartPoint = {
  dateKey: string;
  label: string;
  rain: number;
  demand: number;
  balance: number;
};

export type IrrigationScheduleData = {
  metrics: IrrigationMetric[];
  recommendation: {
    status: ScheduleStatus;
    headline: string;
    detail: string;
  };
  weeklySchedule: WeeklyScheduleItem[];
  calendarDays: CalendarDay[];
  chart: IrrigationChartPoint[];
  weekLabel: string;
  monthLabel: string;
  sourceLabel: string;
  selectedDateKey: string;
  selectedDateLabel: string;
  canViewPreviousWeek: boolean;
  canViewNextWeek: boolean;
  canViewPreviousMonth: boolean;
  canViewNextMonth: boolean;
};

export type IrrigationScheduleExportRow = {
  date: string;
  label: string;
  precipitationMm: number;
  cropEtDemandMm: number;
  waterBalanceMm: number;
  soilMoisture: number;
  irrigationRequiredM3: number;
  status: ScheduleStatus;
  recommendation: string;
};

export const defaultScenario: IrrigationScenario = {
  cropType: "Rice (Inbred)",
  fieldAreaHa: 2,
  irrigationMethod: "Drip",
  soilMoistureTarget: 30,
  soilType: "Loamy",
  forecastPeriod: "14-day forecast",
  irrigationEfficiency: 85,
};

const cropDemandFactors: Record<string, number> = {
  "Rice (Inbred)": 1.15,
  "Rice (Hybrid)": 1.25,
  Corn: 0.85,
  Vegetables: 0.75,
};

export function cropDemandFactor(cropType: string) {
  return cropDemandFactors[cropType] ?? 1;
}

function round(value = 0, digits = 0) {
  const multiplier = 10 ** digits;
  return Math.round(value * multiplier) / multiplier;
}

function parseMetricValue(value?: string) {
  if (!value) return 0;
  const parsed = Number.parseFloat(value.replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseDateOnly(date?: string) {
  if (!date) return new Date();
  const parsed = new Date(`${date}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function formatDate(date: Date, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(undefined, options).format(date);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

function toDateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function statusFromBalance(balance: number, soilMoisture: number, target: number): ScheduleStatus {
  if (balance >= 1) return "skip";
  if (balance >= 0) return "healthy";
  if (soilMoisture > 0 && soilMoisture * 100 < target - 8) return "caution";
  if (balance <= -3) return "caution";
  return "irrigate";
}

function copyForStatus(status: ScheduleStatus, deficit: number) {
  if (status === "skip") {
    return {
      title: "Skip",
      description: "Rainfall covers crop demand.",
    };
  }

  if (status === "healthy") {
    return {
      title: "Healthy",
      description: "No irrigation needed.",
    };
  }

  if (status === "caution") {
    return {
      title: "Caution",
      description: "Monitor soil moisture closely.",
    };
  }

  return {
    title: deficit > 1.5 ? "Moderate Irrigation" : "Irrigate",
    description: deficit > 1.5 ? "Watering recommended this evening." : "Light watering recommended.",
  };
}

function irrigationRequiredForDeficit(deficit: number, scenario: IrrigationScenario) {
  const efficiency = Math.max(scenario.irrigationEfficiency, 1) / 100;
  return round((Math.max(deficit, 0) * scenario.fieldAreaHa * 10) / efficiency, 1);
}

export function buildIrrigationScheduleExportRows(
  weatherData: ForecastPageWeatherData | null | undefined,
  scenario: IrrigationScenario,
): IrrigationScheduleExportRow[] {
  const cropFactor = cropDemandFactor(scenario.cropType);

  return (weatherData?.irrigationWindow ?? []).map((day) => {
    const cropEtDemand = round(day.eto * cropFactor, 1);
    const waterBalance = round(day.rain - cropEtDemand, 1);
    const deficit = Math.max(cropEtDemand - day.rain, 0);
    const status = statusFromBalance(
      waterBalance,
      day.soilMoisture,
      scenario.soilMoistureTarget,
    );
    const copy = copyForStatus(status, deficit);

    return {
      date: day.date,
      label: formatDate(parseDateOnly(day.date), {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      precipitationMm: round(day.rain, 1),
      cropEtDemandMm: cropEtDemand,
      waterBalanceMm: waterBalance,
      soilMoisture: round(day.soilMoisture, 2),
      irrigationRequiredM3: irrigationRequiredForDeficit(deficit, scenario),
      status,
      recommendation: `${copy.title}: ${copy.description}`,
    };
  });
}

function weekStartIndexForData(
  data: ForecastPageWeatherData | null | undefined,
  weekOffset: number,
  selectedDateKey?: string,
) {
  const todayKey = toDateKey(new Date());
  const windowDays = data?.irrigationWindow ?? [];
  const todayIndex = Math.max(windowDays.findIndex((day) => day.date >= todayKey), 0);
  const maxStartIndex = Math.max(windowDays.length - 7, 0);
  const selectedIndex = selectedDateKey
    ? windowDays.findIndex((day) => day.date === selectedDateKey)
    : -1;

  if (selectedIndex >= 0) {
    return Math.min(Math.max(Math.floor(selectedIndex / 7) * 7, 0), maxStartIndex);
  }

  return Math.min(Math.max(todayIndex + weekOffset * 7, 0), maxStartIndex);
}

function buildChart(
  data: ForecastPageWeatherData | null | undefined,
  scenario: IrrigationScenario,
  weekOffset: number,
  selectedDateKey?: string,
) {
  const windowDays = data?.irrigationWindow ?? [];
  const startIndex = weekStartIndexForData(data, weekOffset, selectedDateKey);
  const cropFactor = cropDemandFactor(scenario.cropType);

  if (windowDays.length) {
    return windowDays.slice(startIndex, startIndex + 7).map((day) => {
      const demand = round(day.eto * cropFactor, 1);

      return {
        dateKey: day.date,
        label: day.label,
        rain: round(day.rain, 1),
        demand,
        balance: round(day.rain - demand, 1),
      };
    });
  }

  return (data?.precipitation ?? []).slice(0, 7).map((day) => {
    const demand = parseMetricValue(data?.eto.demand) * cropFactor;
    return {
      dateKey: day.date,
      label: day.date,
      rain: round(day.rain, 1),
      demand: round(demand, 1),
      balance: round(day.rain - demand, 1),
    };
  });
}

function buildCalendarDays(
  scenario: IrrigationScenario,
  data: ForecastPageWeatherData | null | undefined,
  monthOffset: number,
  selectedDateKey: string,
) {
  const today = new Date();
  const viewedMonth = addMonths(new Date(today.getFullYear(), today.getMonth(), 1), monthOffset);
  const monthStart = new Date(viewedMonth.getFullYear(), viewedMonth.getMonth(), 1);
  const monthEnd = new Date(viewedMonth.getFullYear(), viewedMonth.getMonth() + 1, 0);
  const leadingDays = (monthStart.getDay() + 6) % 7;
  const cells: CalendarDay[] = [];
  const statusByDate = new Map<string, ScheduleStatus>();

  (data?.irrigationWindow ?? []).forEach((day) => {
    const cropEtDemand = day.eto * cropDemandFactor(scenario.cropType);
    statusByDate.set(
      day.date,
      statusFromBalance(
        day.rain - cropEtDemand,
        day.soilMoisture,
        scenario.soilMoistureTarget,
      ),
    );
  });

  for (let index = leadingDays; index > 0; index -= 1) {
    const date = new Date(monthStart);
    date.setDate(monthStart.getDate() - index);
    cells.push({
      dateKey: toDateKey(date),
      day: String(date.getDate()),
      status: "muted",
      selectable: false,
      selected: false,
    });
  }

  for (let day = 1; day <= monthEnd.getDate(); day += 1) {
    const date = new Date(monthStart);
    date.setDate(day);
    const dateKey = toDateKey(date);
    const status = statusByDate.get(dateKey) ?? "empty";
    cells.push({
      dateKey,
      day: String(day),
      status,
      selectable: status !== "empty",
      selected: dateKey === selectedDateKey,
    });
  }

  while (cells.length % 7 !== 0) {
    const date = new Date(monthEnd);
    date.setDate(monthEnd.getDate() + cells.length - leadingDays - monthEnd.getDate() + 1);
    cells.push({
      dateKey: toDateKey(date),
      day: String(date.getDate()),
      status: "muted",
      selectable: false,
      selected: false,
    });
  }

  return cells;
}

export function buildIrrigationScheduleData(
  weatherData: ForecastPageWeatherData | null | undefined,
  scenario: IrrigationScenario,
  weekOffset = 0,
  selectedDateKey?: string,
  monthOffset = 0,
): IrrigationScheduleData {
  const chart = buildChart(weatherData, scenario, weekOffset, selectedDateKey);
  const safeChart = chart.length
    ? chart
    : Array.from({ length: 7 }, (_, index) => ({
        label: `Day ${index + 1}`,
        dateKey: toDateKey(addDays(new Date(), index)),
        rain: 0,
        demand: 0,
        balance: 0,
      }));
  const todayKey = toDateKey(new Date());
  const windowDays = weatherData?.irrigationWindow ?? [];
  const weekStartIndex = weekStartIndexForData(weatherData, weekOffset, selectedDateKey);
  const maxStartIndex = Math.max(windowDays.length - 7, 0);
  const firstWindowDate = windowDays[weekStartIndex]?.date ?? windowDays.find((day) => day.date >= todayKey)?.date;
  const firstDate = parseDateOnly(firstWindowDate);
  const weeklyDateKeys = safeChart.map((_, index) => toDateKey(addDays(firstDate, index)));
  const selectedWindowDate = selectedDateKey
    ? windowDays.find((day) => day.date === selectedDateKey)?.date
    : undefined;
  const activeDateKey =
    selectedWindowDate
      ? selectedWindowDate
      : weeklyDateKeys[0] ?? todayKey;
  const selectedChartIndex = Math.max(safeChart.findIndex((point) => point.dateKey === activeDateKey), 0);
  const selectedPoint = safeChart[selectedChartIndex] ?? safeChart[0];
  const selectedWindow = windowDays.find((day) => day.date === activeDateKey);
  const selectedSoilMoisture = selectedWindow?.soilMoisture ?? 0;
  const selectedStatus = statusFromBalance(
    selectedPoint.balance,
    selectedSoilMoisture,
    scenario.soilMoistureTarget,
  );
  const deficit = Math.max(selectedPoint.demand - selectedPoint.rain, 0);
  const irrigationRequiredM3 = irrigationRequiredForDeficit(deficit, scenario);
  const lastDate = addDays(firstDate, safeChart.length - 1);
  const selectedDate = parseDateOnly(activeDateKey);

  return {
    metrics: [
      { label: "Precipitation", value: String(round(selectedPoint.rain, 1)), unit: "mm", tone: "blue" },
      { label: "Crop ET Demand", value: String(round(selectedPoint.demand, 1)), unit: "mm", tone: "green" },
      { label: "Water Balance", value: String(round(selectedPoint.balance, 1)), unit: "mm", tone: "blue" },
      { label: "Irrigation Required", value: String(irrigationRequiredM3), unit: "m3", tone: "orange" },
    ],
    recommendation: {
      status: selectedStatus,
      headline: selectedStatus === "skip" || selectedStatus === "healthy" ? "SKIP -" : "IRRIGATE",
      detail:
        selectedStatus === "skip"
          ? "Sufficient Rain"
          : selectedStatus === "healthy"
            ? "Balanced Moisture"
            : selectedStatus === "caution"
              ? "Check Soil Moisture"
              : "Watering Recommended",
    },
    weeklySchedule: safeChart.map((point, index) => {
      const forecastDate = addDays(firstDate, index);
      const dateKey = toDateKey(forecastDate);
      const soilMoisture =
        weatherData?.irrigationWindow.find((day) => day.date === dateKey)?.soilMoisture ?? 0;
      const status = statusFromBalance(point.balance, soilMoisture, scenario.soilMoistureTarget);
      const copy = copyForStatus(status, Math.max(point.demand - point.rain, 0));

      return {
        dateKey,
        weekday: formatDate(forecastDate, { weekday: "short" }).toUpperCase(),
        day: String(forecastDate.getDate()).padStart(2, "0"),
        title: copy.title,
        description: copy.description,
        status,
        selected: dateKey === activeDateKey,
      };
    }),
    calendarDays: buildCalendarDays(scenario, weatherData, monthOffset, activeDateKey),
    chart: safeChart,
    weekLabel: `${formatDate(firstDate, { month: "short", day: "numeric" })} - ${formatDate(lastDate, {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`,
    monthLabel: formatDate(addMonths(new Date(new Date().getFullYear(), new Date().getMonth(), 1), monthOffset), { month: "long", year: "numeric" }),
    sourceLabel: weatherData ? "Data source: Open-Meteo" : "Waiting for Open-Meteo data",
    selectedDateKey: activeDateKey,
    selectedDateLabel: formatDate(selectedDate, { weekday: "long", month: "long", day: "numeric" }),
    canViewPreviousWeek: weekStartIndex - 7 >= 0,
    canViewNextWeek: weekStartIndex + 7 <= maxStartIndex,
    canViewPreviousMonth: (() => {
      const firstWindowDate = windowDays[0]?.date;
      if (!firstWindowDate) return false;
      const currentMonth = addMonths(new Date(new Date().getFullYear(), new Date().getMonth(), 1), monthOffset);
      const previousMonth = addMonths(currentMonth, -1);
      const firstWindowMonth = new Date(parseDateOnly(firstWindowDate).getFullYear(), parseDateOnly(firstWindowDate).getMonth(), 1);
      return previousMonth >= firstWindowMonth;
    })(),
    canViewNextMonth: (() => {
      const lastWindowDate = windowDays[windowDays.length - 1]?.date;
      if (!lastWindowDate) return false;
      const currentMonth = addMonths(new Date(new Date().getFullYear(), new Date().getMonth(), 1), monthOffset);
      const nextMonth = addMonths(currentMonth, 1);
      const lastWindowMonth = new Date(parseDateOnly(lastWindowDate).getFullYear(), parseDateOnly(lastWindowDate).getMonth(), 1);
      return nextMonth <= lastWindowMonth;
    })(),
  };
}
