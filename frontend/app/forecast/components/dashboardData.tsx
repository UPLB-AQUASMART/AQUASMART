import type { LucideIcon } from "lucide-react";
import { Cloud, CloudRain, Droplets, Thermometer, Wind } from "lucide-react";

export const months = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const monthlyPrecipitation = [36, 27, 17, 11, 12, 15];
export const monthlyTemperature = [30, 29, 24, 19, 15, 11];
export const monthlyHumidity = [61, 66, 64, 64, 70, 75];

export const projectionDays = [
  { day: "Mon", date: "27 Oct", rain: 2, hourlyRain: [0, 0.2, 0.4, 0.8, 0.4, 0.2] },
  { day: "Tue", date: "28 Oct", rain: 5, hourlyRain: [0.2, 0.6, 0.8, 1.6, 1.2, 0.6] },
  { day: "Wed", date: "29 Oct", rain: 12, hourlyRain: [0.4, 1.6, 2.5, 3.4, 2.6, 1.5] },
  { day: "Thu", date: "30 Oct", rain: 18, hourlyRain: [0.8, 2.1, 3.6, 5.2, 4.1, 2.2] },
  { day: "Fri", date: "31 Oct", rain: 8, hourlyRain: [0.1, 0.8, 1.5, 2.6, 1.9, 1.1] },
  { day: "Sat", date: "1 Nov", rain: 4, hourlyRain: [0, 0.3, 0.7, 1.5, 1, 0.5] },
  { day: "Sun", date: "2 Nov", rain: 1, hourlyRain: [0, 0.1, 0.2, 0.4, 0.2, 0.1] },
];

export const rainProbability = [
  { label: "Mon", date: "27 Oct", max: 20, avg: 10, min: 5 },
  { label: "Tue", date: "28 Oct", max: 25, avg: 15, min: 8 },
  { label: "Wed", date: "29 Oct", max: 35, avg: 20, min: 12 },
  { label: "Thu", date: "30 Oct", max: 40, avg: 22, min: 13 },
  { label: "Fri", date: "31 Oct", max: 45, avg: 25, min: 15 },
  { label: "Sat", date: "1 Nov", max: 55, avg: 30, min: 18 },
  { label: "Sun", date: "2 Nov", max: 30, avg: 18, min: 8 },
];

export const forecastFactors = [
  { label: "Wind Speed", variable: "wind_speed_10m", value: "12 km/h" },
  { label: "Wind Gusts", variable: "wind_gusts_10m", value: "24 km/h" },
  { label: "Humidity", variable: "relative_humidity_2m", value: "61%" },
  { label: "Cloud Cover", variable: "cloud_cover", value: "18%" },
  { label: "Soil Moisture", variable: "soil_moisture_0_to_1cm", value: "0.31" },
];

export const etoMetrics: Array<{ label: string; value: string; Icon: LucideIcon }> = [
  { label: "Precipitation", value: "4 mm", Icon: Droplets },
  { label: "Wind Speed", value: "12 km/h", Icon: Wind },
  { label: "Wind Gusts", value: "24 km/h", Icon: Cloud },
  { label: "Humidity", value: "61%", Icon: Droplets },
  { label: "Cloud Cover", value: "18%", Icon: CloudRain },
  { label: "Temperature", value: "31°", Icon: Thermometer },
];

export function polyline(values: number[], width: number, height: number, max = 100) {
  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - (value / max) * height;
      return `${x},${y}`;
    })
    .join(" ");
}

export function ChartGrid({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <span key={index} style={{ top: `${(index / (rows - 1)) * 100}%` }} />
      ))}
    </>
  );
}
