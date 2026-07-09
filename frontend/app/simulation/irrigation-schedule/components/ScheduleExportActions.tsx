"use client";

import { Download, FileText, Table2 } from "lucide-react";
import type { ForecastPageWeatherData } from "@/app/forecast/components/openMeteoWeather";
import {
  buildIrrigationScheduleExportRows,
  type IrrigationScenario,
  type IrrigationScheduleExportRow,
} from "./irrigationScheduleData";
import styles from "./ScheduleExportActions.module.css";

type ScheduleExportActionsProps = {
  loading: boolean;
  scenario: IrrigationScenario;
  weatherData: ForecastPageWeatherData | null;
};

const disclaimer =
  "Forecast accuracy and irrigation recommendations may vary by field conditions, sensor calibration, crop stage, and local microclimate. Weather data is provided by Open-Meteo.";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function normalizePdfText(value: string) {
  return value
    .replace(/m³/g, "m3")
    .replace(/°/g, "deg")
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function escapeHtml(value: string | number) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function scenarioSummary(scenario: IrrigationScenario) {
  return [
    `Crop: ${scenario.cropType}`,
    `Field Area: ${scenario.fieldAreaHa} ha`,
    `Irrigation Method: ${scenario.irrigationMethod} (${scenario.irrigationEfficiency}% efficient)`,
    `Soil Type: ${scenario.soilType}`,
    `Soil Moisture Target: ${scenario.soilMoistureTarget}%`,
    `Forecast Period: ${scenario.forecastPeriod}`,
  ];
}

function exportFilename(extension: "pdf" | "xls") {
  return `aquasmart-irrigation-schedule-${new Date().toISOString().slice(0, 10)}.${extension}`;
}

function formatNumber(value: number, digits = 1) {
  return Number.isFinite(value) ? value.toFixed(digits) : "0.0";
}

function buildExcelDocument(rows: IrrigationScheduleExportRow[], scenario: IrrigationScenario) {
  const headers = [
    "Date",
    "Precipitation (mm)",
    "Crop ET Demand (mm)",
    "Water Balance (mm)",
    "Soil Moisture",
    "Irrigation Required (m3)",
    "Status",
    "Recommendation",
  ];

  const bodyRows = rows
    .map(
      (row) => `
        <tr>
          <td>${escapeHtml(row.label)}</td>
          <td>${escapeHtml(formatNumber(row.precipitationMm))}</td>
          <td>${escapeHtml(formatNumber(row.cropEtDemandMm))}</td>
          <td>${escapeHtml(formatNumber(row.waterBalanceMm))}</td>
          <td>${escapeHtml(formatNumber(row.soilMoisture, 2))}</td>
          <td>${escapeHtml(formatNumber(row.irrigationRequiredM3))}</td>
          <td>${escapeHtml(row.status.toUpperCase())}</td>
          <td>${escapeHtml(row.recommendation)}</td>
        </tr>`,
    )
    .join("");

  return `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, sans-serif; }
          h1 { color: #071f78; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #d7e7f7; padding: 8px; text-align: left; }
          th { background: #eaf6ff; color: #071f78; }
          .note { color: #5b6f9f; }
        </style>
      </head>
      <body>
        <h1>AQUASMART Mini Irrigation Schedule</h1>
        <p>Generated: ${escapeHtml(new Date().toLocaleString())}</p>
        <p>${scenarioSummary(scenario).map(escapeHtml).join("<br />")}</p>
        <p class="note">${escapeHtml(disclaimer)}</p>
        <table>
          <thead>
            <tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr>
          </thead>
          <tbody>${bodyRows}</tbody>
        </table>
      </body>
    </html>`;
}

function buildPdfDocument(rows: IrrigationScheduleExportRow[], scenario: IrrigationScenario) {
  const headers = ["Date", "Rain", "ET", "Balance", "Soil", "Irrig.", "Status", "Recommendation"];
  const widths = [92, 48, 48, 58, 48, 58, 64, 262];
  const left = 28;
  const rowHeight = 15;
  const tableWidth = widths.reduce((sum, width) => sum + width, 0);
  const lines = [
    "BT /F1 18 Tf 28 558 Td (AQUASMART Mini Irrigation Schedule) Tj ET",
    `BT /F1 8 Tf 28 540 Td (${normalizePdfText(`Generated: ${new Date().toLocaleString()}`)}) Tj ET`,
    `BT /F1 8 Tf 28 525 Td (${normalizePdfText(scenarioSummary(scenario).slice(0, 3).join(" | "))}) Tj ET`,
    `BT /F1 8 Tf 28 510 Td (${normalizePdfText(scenarioSummary(scenario).slice(3).join(" | "))}) Tj ET`,
    `BT /F1 7 Tf 28 34 Td (${normalizePdfText(disclaimer)}) Tj ET`,
  ];

  let y = 482;
  let x = left;
  lines.push(`0.8 w ${left} ${y} ${tableWidth} ${rowHeight} re S`);
  headers.forEach((header, index) => {
    lines.push(`BT /F1 7 Tf ${x + 3} ${y + 5} Td (${normalizePdfText(header)}) Tj ET`);
    if (index > 0) lines.push(`${x} ${y} m ${x} ${y + rowHeight} l S`);
    x += widths[index];
  });

  rows.forEach((row) => {
    y -= rowHeight;
    x = left;
    const cells = [
      row.label,
      `${formatNumber(row.precipitationMm)} mm`,
      `${formatNumber(row.cropEtDemandMm)} mm`,
      `${formatNumber(row.waterBalanceMm)} mm`,
      formatNumber(row.soilMoisture, 2),
      `${formatNumber(row.irrigationRequiredM3)} m3`,
      row.status.toUpperCase(),
      row.recommendation,
    ];

    lines.push(`0.35 w ${left} ${y} ${tableWidth} ${rowHeight} re S`);
    cells.forEach((cell, index) => {
      const clippedCell = cell.length > 44 ? `${cell.slice(0, 41)}...` : cell;
      lines.push(`BT /F1 6 Tf ${x + 3} ${y + 5} Td (${normalizePdfText(clippedCell)}) Tj ET`);
      if (index > 0) lines.push(`${x} ${y} m ${x} ${y + rowHeight} l S`);
      x += widths[index];
    });
  });

  const content = lines.join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 595] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${offset.toString().padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return pdf;
}

export function ScheduleExportActions({
  loading,
  scenario,
  weatherData,
}: ScheduleExportActionsProps) {
  const rows = buildIrrigationScheduleExportRows(weatherData, scenario);
  const disabled = loading || rows.length === 0;

  const downloadExcel = () => {
    if (disabled) return;
    downloadBlob(
      new Blob([buildExcelDocument(rows, scenario)], {
        type: "application/vnd.ms-excel;charset=utf-8",
      }),
      exportFilename("xls"),
    );
  };

  const downloadPdf = () => {
    if (disabled) return;
    downloadBlob(
      new Blob([buildPdfDocument(rows, scenario)], { type: "application/pdf" }),
      exportFilename("pdf"),
    );
  };

  return (
    <section className={styles.exports} aria-label="Schedule export options">
      <div className={styles.copy}>
        <span className={styles.icon} aria-hidden="true">
          <Download size={18} strokeWidth={2.4} />
        </span>
        <div>
          <h2>Export irrigation schedule</h2>
          <p>
            Downloads include {rows.length || "all available"} fetched Open-Meteo
            day{rows.length === 1 ? "" : "s"} for this scenario.
          </p>
        </div>
      </div>
      <div className={styles.actions}>
        <button type="button" onClick={downloadPdf} disabled={disabled}>
          <FileText size={17} strokeWidth={2.3} />
          PDF
        </button>
        <button type="button" onClick={downloadExcel} disabled={disabled}>
          <Table2 size={17} strokeWidth={2.3} />
          Excel
        </button>
      </div>
      <p className={styles.disclaimer}>{disclaimer}</p>
    </section>
  );
}
