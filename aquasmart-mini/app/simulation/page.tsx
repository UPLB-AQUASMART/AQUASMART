"use client";

import {
  Download,
  Droplet,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  Thermometer,
  TrendingUp,
  Trash2,
  Upload,
} from "lucide-react";
import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { useMemo, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Doughnut, Line } from "react-chartjs-2";
import { Header } from "../components/Header";
import { PageIntro } from "../components/PageIntro";

type Tab = "discharge" | "statistics";
type ReadingKey = "dissolvedOxygen" | "ph" | "temperature" | "salinity" | "tds" | "electricalConductivity" | "groundwaterLevel";
type Readings = Record<ReadingKey, number>;

type Well = {
  id: number;
  name: string;
  discharge: number;
  x: number;
  y: number;
  readings: Readings;
};

ChartJS.register(ArcElement, CategoryScale, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip);

function makeReadings(id: number, discharge: number): Readings {
  const dischargePressure = discharge / 500;

  return {
    dissolvedOxygen: Number((8.1 - dischargePressure * 1.25 - id * 0.06).toFixed(1)),
    ph: Number((7.62 - dischargePressure * 0.42 + id * 0.03).toFixed(1)),
    temperature: Number((26.4 + dischargePressure * 1.15 + id * 0.12).toFixed(1)),
    salinity: Number((0.42 + dischargePressure * 0.92 + id * 0.04).toFixed(1)),
    tds: Math.round(430 + discharge * 1.32 + id * 18),
    electricalConductivity: Math.round(640 + discharge * 1.85 + id * 24),
    groundwaterLevel: Number((14.2 - dischargePressure * 2.55 - id * 0.18).toFixed(1)),
  };
}

function normalizePdfText(value: string) {
  return value
    .replace(/mÂ³/g, "m3")
    .replace(/Â°/g, "deg")
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function decodePdfText(value: string) {
  return value
    .replace(/\\\(/g, "(")
    .replace(/\\\)/g, ")")
    .replace(/\\\\/g, "\\")
    .trim();
}

function extractExportedPdfCells(pdfText: string) {
  return Array.from(pdfText.matchAll(/\(([^()]*(?:\\.[^()]*)*)\)\s*Tj/g), (match) => decodePdfText(match[1]));
}

export default function SimulationPage() {
  const initialWells: Well[] = [{ id: 1, name: "Option 1", discharge: 138, x: 45, y: 36, readings: makeReadings(1, 138) }];
  const [wells, setWells] = useState(initialWells);
  const [tab, setTab] = useState<Tab>("discharge");
  const [draggingWell, setDraggingWell] = useState<number | null>(null);
  const [exitingWells, setExitingWells] = useState<number[]>([]);
  const [isResetting, setIsResetting] = useState(false);
  const [importMessage, setImportMessage] = useState("");
  const safeYield = 1000;
  const totalDischarge = useMemo(() => wells.reduce((sum, well) => sum + well.discharge, 0), [wells]);
  const scenario = useMemo(() => {
    const drawdowns = wells.map((well) => 0.82 + well.discharge / 145 + well.id * 0.04);
    const averageDrawdown = drawdowns.reduce((sum, drawdown) => sum + drawdown, 0) / drawdowns.length;
    const capacityUtilization = Math.min(100, (totalDischarge / safeYield) * 100);
    const criticalWells = wells.filter((well, index) => well.discharge >= 430 || drawdowns[index] >= 3.8).length;
    const sustainability = criticalWells > 0 || capacityUtilization >= 85
      ? "Critical"
      : capacityUtilization >= 65
        ? "Watch"
        : "Sustainable";
    const recoveryTime = Math.round(36 + averageDrawdown * 22 + capacityUtilization * 0.28 + criticalWells * 18);

    return {
      averageDrawdown,
      capacityUtilization,
      criticalWells,
      recoveryTime,
      sustainability,
      sustainabilityClass: sustainability.toLowerCase(),
    };
  }, [totalDischarge, wells]);
  const parameterRows = useMemo(() => wells.map((well) => [
    well.name,
    `${well.discharge} mÂ³/day`,
    well.readings.dissolvedOxygen.toFixed(1),
    well.readings.ph.toFixed(1),
    well.readings.temperature.toFixed(1),
    well.readings.salinity.toFixed(1),
    Math.round(well.readings.tds).toString(),
    Math.round(well.readings.electricalConductivity).toString(),
    well.readings.groundwaterLevel.toFixed(1),
  ]), [wells]);
  const averageParameters = useMemo(() => {
    const average = (key: ReadingKey) => wells.reduce((sum, well) => sum + well.readings[key], 0) / wells.length;

    return {
      dissolvedOxygen: average("dissolvedOxygen"),
      ph: average("ph"),
      temperature: average("temperature"),
      salinity: average("salinity"),
      tds: average("tds"),
      electricalConductivity: average("electricalConductivity"),
      groundwaterLevel: average("groundwaterLevel"),
    };
  }, [wells]);
  const parameterDonutData = useMemo(() => ({
    labels: ["DO", "pH", "Temperature", "Salinity", "TDS", "EC", "GW Level"],
    datasets: [{
      data: [
        averageParameters.dissolvedOxygen,
        averageParameters.ph,
        averageParameters.temperature,
        averageParameters.salinity * 10,
        averageParameters.tds / 100,
        averageParameters.electricalConductivity / 100,
        averageParameters.groundwaterLevel,
      ],
      backgroundColor: ["#0b2545", "#46c5df", "#4dbb5d", "#ee9b22", "#638de3", "#2f8f63", "#09a9d5"],
      borderColor: "#ffffff",
      borderWidth: 2,
      hoverOffset: 8,
    }],
  }), [averageParameters]);
  const temperatureTrendData = useMemo(() => ({
    labels: ["Nov 24", "Nov 25", "Nov 26", "Nov 27", "Nov 28", "Nov 29", "Nov 30", "Dec 1", "Dec 2", "Dec 3", "Dec 4", "Dec 5", "Dec 6", "Dec 7"],
    datasets: [
      {
        label: "Max Temperature",
        data: [5.2, 6.2, 7.2, 4.2, 3.2, 5.2, 2.2, 4.2, 6.2, 1.2, 3.2, 5.2, 7.2, 6.2].map((offset) => Number((averageParameters.temperature + offset).toFixed(1))),
        borderColor: "#0b2545",
        backgroundColor: "rgba(11,37,69,.16)",
        pointBackgroundColor: "#ffffff",
        pointBorderColor: "#0b2545",
        pointRadius: 4,
        tension: 0.38,
        fill: "+1",
      },
      {
        label: "Min Temperature",
        data: [-2.8, -1.8, -0.8, -3.8, -4.8, -2.8, -5.8, -3.8, -1.8, -6.8, -4.8, -2.8, -0.8, -1.8].map((offset) => Number((averageParameters.temperature + offset).toFixed(1))),
        borderColor: "#46c5df",
        backgroundColor: "rgba(70,197,223,.1)",
        pointBackgroundColor: "#ffffff",
        pointBorderColor: "#46c5df",
        pointRadius: 4,
        tension: 0.38,
        fill: false,
      },
    ],
  }), [averageParameters.temperature]);
  const donutOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    cutout: "62%",
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: { boxWidth: 12, color: "#0b2545", padding: 18, font: { size: 12, family: "Inter" } },
      },
      tooltip: {
        callbacks: {
          label(context: { label?: string; parsed: number }) {
            const units: Record<string, string> = {
              DO: "mg/L",
              pH: "",
              Temperature: "Â°C",
              Salinity: "ppt",
              TDS: "mg/L",
              EC: "ÂµS/cm",
              "GW Level": "m",
            };
            const rawValues: Record<string, number> = {
              DO: averageParameters.dissolvedOxygen,
              pH: averageParameters.ph,
              Temperature: averageParameters.temperature,
              Salinity: averageParameters.salinity,
              TDS: averageParameters.tds,
              EC: averageParameters.electricalConductivity,
              "GW Level": averageParameters.groundwaterLevel,
            };
            const label = context.label ?? "";
            const value = rawValues[label] ?? context.parsed;
            return `${label}: ${value.toFixed(label === "TDS" || label === "EC" ? 0 : 1)} ${units[label] ?? ""}`.trim();
          },
        },
      },
    },
  }), [averageParameters]);
  const lineOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index" as const, intersect: false },
    scales: {
      x: {
        grid: { color: "rgba(95,117,146,.15)" },
        ticks: { color: "#5f7592", font: { size: 12, family: "Inter" } },
      },
      y: {
        title: { display: true, text: "Temperature (Â°C)", color: "#5f7592", font: { size: 12, family: "Inter" } },
        grid: { color: "rgba(95,117,146,.16)" },
        ticks: { color: "#5f7592", font: { size: 12, family: "Inter" } },
      },
    },
    plugins: {
      legend: {
        position: "top" as const,
        labels: { color: "#0b2545", boxWidth: 14, padding: 18, font: { size: 12, family: "Inter", weight: "bold" as const } },
      },
    },
  }), []);

  function addWell() {
    const id = Math.max(0, ...wells.map((well) => well.id)) + 1;
    const discharge = id === 2 ? 407 : 100;
    setWells((current) => [
      ...current,
      {
        id,
        name: `Option ${id}`,
        discharge,
        x: id === 2 ? 78 : 34 + ((id * 17) % 48),
        y: id === 2 ? 73 : 25 + ((id * 13) % 45),
        readings: makeReadings(id, discharge),
      },
    ]);
  }

  function removeWell(id: number) {
    setExitingWells((current) => [...current, id]);
    window.setTimeout(() => {
      setWells((current) => current.filter((well) => well.id !== id));
      setExitingWells((current) => current.filter((wellId) => wellId !== id));
    }, 280);
  }

  function resetSimulation() {
    if (isResetting) return;

    const removableIds = wells.filter((well) => well.id !== 1).map((well) => well.id);
    setIsResetting(true);
    setExitingWells(removableIds);

    window.setTimeout(() => {
      setWells(initialWells);
      setExitingWells([]);
      setIsResetting(false);
      setImportMessage("");
    }, removableIds.length ? 360 : 520);
  }

  function updateWell(id: number, discharge: number) {
    setWells((current) => current.map((well) => well.id === id ? { ...well, discharge, readings: makeReadings(well.id, discharge) } : well));
  }

  function updateWellName(id: number, name: string) {
    setWells((current) => current.map((well) => well.id === id ? { ...well, name } : well));
  }

  function updateReading(id: number, key: ReadingKey, value: number) {
    setWells((current) => current.map((well) => well.id === id ? {
      ...well,
      readings: { ...well.readings, [key]: value },
    } : well));
  }

  function downloadPdfReport() {
    const reportDate = new Date().toLocaleString();
    const headers = ["Well ID", "Discharge", "DO", "pH", "Temp", "Salinity", "TDS", "EC", "GW Level"];
    const rows = parameterRows;
    const objects: string[] = [];
    const pageWidth = 842;
    const pageHeight = 595;
    const left = 38;
    const colWidths = [108, 86, 56, 48, 62, 70, 64, 64, 72];
    const rowHeight = 24;
    const tableWidth = colWidths.reduce((sum, width) => sum + width, 0);
    const textLines: string[] = [
      "BT /F1 22 Tf 38 552 Td (AQUASMART Mini Groundwater Simulation Report) Tj ET",
      `BT /F1 9 Tf 38 532 Td (${normalizePdfText(`Generated: ${reportDate}`)}) Tj ET`,
      "BT /F1 12 Tf 38 500 Td (Scenario Summary) Tj ET",
      `BT /F1 10 Tf 38 482 Td (${normalizePdfText(`Total Pumping Discharge: ${totalDischarge} m3/day`)}) Tj ET`,
      `BT /F1 10 Tf 38 466 Td (${normalizePdfText(`Safe Yield Capacity: ${safeYield} m3/day`)}) Tj ET`,
      `BT /F1 10 Tf 38 450 Td (${normalizePdfText(`Capacity Utilization: ${scenario.capacityUtilization.toFixed(1)}%`)}) Tj ET`,
      `BT /F1 10 Tf 318 482 Td (${normalizePdfText(`Average Drawdown: ${scenario.averageDrawdown.toFixed(1)} m`)}) Tj ET`,
      `BT /F1 10 Tf 318 466 Td (${normalizePdfText(`Critical Wells: ${scenario.criticalWells}`)}) Tj ET`,
      `BT /F1 10 Tf 318 450 Td (${normalizePdfText(`Sustainability Status: ${scenario.sustainability}`)}) Tj ET`,
      `BT /F1 10 Tf 590 482 Td (${normalizePdfText(`Est. Recovery Time: ${scenario.recoveryTime} days`)}) Tj ET`,
      "BT /F1 12 Tf 38 414 Td (Well Parameter Readings) Tj ET",
    ];

    let y = 390;
    textLines.push(`0.85 w ${left} ${y} ${tableWidth} ${rowHeight} re S`);
    let x = left;
    headers.forEach((header, index) => {
      textLines.push(`BT /F1 8 Tf ${x + 6} ${y + 9} Td (${normalizePdfText(header)}) Tj ET`);
      if (index > 0) textLines.push(`${x} ${y} m ${x} ${y + rowHeight} l S`);
      x += colWidths[index];
    });

    y -= rowHeight;
    rows.forEach((row) => {
      textLines.push(`0.45 w ${left} ${y} ${tableWidth} ${rowHeight} re S`);
      x = left;
      row.forEach((cell, index) => {
        textLines.push(`BT /F1 8 Tf ${x + 6} ${y + 9} Td (${normalizePdfText(cell)}) Tj ET`);
        if (index > 0) textLines.push(`${x} ${y} m ${x} ${y + rowHeight} l S`);
        x += colWidths[index];
      });
      y -= rowHeight;
    });

    textLines.push(`BT /F1 8 Tf 38 36 Td (${normalizePdfText("All values are editable prototype readings for simulation and reporting review.")}) Tj ET`);

    const content = textLines.join("\n");
    objects.push("<< /Type /Catalog /Pages 2 0 R >>");
    objects.push("<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>`);
    objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
    objects.push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);

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

    const blob = new Blob([pdf], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `aquasmart-simulation-report-${new Date().toISOString().slice(0, 10)}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async function uploadPdfReport(file: File | undefined) {
    if (!file) return;

    try {
      const pdfText = new TextDecoder("latin1").decode(await file.arrayBuffer());
      const cells = extractExportedPdfCells(pdfText);
      const tableStart = cells.findIndex((cell, index) => (
        cell === "Well ID" &&
        cells[index + 1] === "Discharge" &&
        cells[index + 2] === "DO"
      ));

      if (tableStart === -1) {
        setImportMessage("This PDF does not look like an AQUASMART simulation report.");
        return;
      }

      const importedRows = cells.slice(tableStart + 9, -1);
      const importedWells: Well[] = [];

      for (let index = 0; index + 8 < importedRows.length; index += 9) {
        const [name, dischargeText, dissolvedOxygen, ph, temperature, salinity, tds, electricalConductivity, groundwaterLevel] = importedRows.slice(index, index + 9);
        const discharge = Number(dischargeText.replace(/[^\d.-]/g, ""));

        if (!name || Number.isNaN(discharge)) continue;

        const id = importedWells.length + 1;
        importedWells.push({
          id,
          name,
          discharge,
          x: id === 1 ? 45 : Math.min(84, 34 + ((id * 17) % 48)),
          y: id === 1 ? 36 : Math.min(78, 25 + ((id * 13) % 45)),
          readings: {
            dissolvedOxygen: Number(dissolvedOxygen) || 0,
            ph: Number(ph) || 0,
            temperature: Number(temperature) || 0,
            salinity: Number(salinity) || 0,
            tds: Number(tds) || 0,
            electricalConductivity: Number(electricalConductivity) || 0,
            groundwaterLevel: Number(groundwaterLevel) || 0,
          },
        });
      }

      if (!importedWells.length) {
        setImportMessage("No well rows were found in that PDF.");
        return;
      }

      setWells(importedWells);
      setExitingWells([]);
      setTab("statistics");
      setImportMessage(`Imported ${importedWells.length} well${importedWells.length === 1 ? "" : "s"} from PDF.`);
    } catch {
      setImportMessage("Could not read that PDF. Try exporting a fresh report from this page.");
    }
  }

  function startWellDrag(event: ReactPointerEvent<HTMLDivElement>, id: number) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDraggingWell(id);
  }

  function moveWell(event: ReactPointerEvent<HTMLDivElement>, id: number) {
    if (draggingWell !== id) return;

    const map = event.currentTarget.parentElement;
    if (!map) return;

    const bounds = map.getBoundingClientRect();
    const x = Math.min(96, Math.max(4, ((event.clientX - bounds.left) / bounds.width) * 100));
    const y = Math.min(92, Math.max(8, ((event.clientY - bounds.top) / bounds.height) * 100));

    setWells((current) => current.map((well) => well.id === id ? { ...well, x, y } : well));
  }

  function stopWellDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDraggingWell(null);
  }

  return (
    <main>
      <Header />
      <PageIntro title="Groundwater Simulation" />
      <section className="simulation-map">
        <div className="simulation-panel">
          <div className="tabs" role="tablist">
            <button className={tab === "discharge" ? "selected" : ""} onClick={() => setTab("discharge")}>Water Discharge</button>
            <button className={tab === "statistics" ? "selected" : ""} onClick={() => setTab("statistics")}>Statistics</button>
          </div>
          {tab === "discharge" ? (
            <div className="panel-heading">
              <h2>MODFLOW/FLOPY Groundwater Simulation</h2>
              <button className={`icon-button${isResetting ? " resetting" : ""}`} onClick={resetSimulation} title="Reset simulation"><RefreshCw size={20} strokeWidth={2.4} /></button>
            </div>
          ) : (
            <div className="statistics-heading">
              <h2><TrendingUp size={21} strokeWidth={2.4} /> Model Statistics</h2>
              <p>Current scenario performance metrics</p>
            </div>
          )}

          {tab === "discharge" ? (
            <div className="well-list">
              {wells.map((well) => (
                <div className={`well-control${exitingWells.includes(well.id) ? " exiting" : ""}`} key={well.id}>
                  <div className="well-row">
                    <span>
                      <Droplet size={17} strokeWidth={2.2} />
                      <input
                        className="well-name-input"
                        aria-label={`${well.name} name`}
                        value={well.name}
                        onChange={(event) => updateWellName(well.id, event.target.value)}
                      />
                    </span>
                    <strong>{well.discharge} mÂ³/day</strong>
                    {wells.length > 1 && (
                      <button className="delete-well" title={`Remove ${well.name}`} onClick={() => removeWell(well.id)}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <input aria-label={`${well.name} discharge`} type="range" min="0" max="500" value={well.discharge} onChange={(event) => updateWell(well.id, Number(event.target.value))} />
                  <div className="range-labels"><span>0</span><span>500</span></div>
                </div>
              ))}
              <button className="add-well" onClick={addWell}>Add Well <Plus size={18} strokeWidth={2} /></button>
            </div>
          ) : (
            <div className="statistics">
              <div className="statistics-card">
                <div className="stat-row"><span>Total Pumping Discharge</span><strong>{totalDischarge} mÂ³/day</strong></div>
                <div className="stat-row"><span>Safe Yield Capacity</span><strong>{safeYield} mÂ³/day</strong></div>
                <div className="stat-row utilization-row"><span>Capacity Utilization</span><strong>{scenario.capacityUtilization.toFixed(1)}%</strong></div>
                <div className="utilization-track" aria-label={`Capacity utilization: ${scenario.capacityUtilization.toFixed(1)} percent`}><i style={{ width: `${scenario.capacityUtilization}%` }} /></div>
                <div className="stat-row"><span>Average Drawdown</span><strong>{scenario.averageDrawdown.toFixed(1)} m</strong></div>
                <div className="stat-row"><span>Critical Wells</span><strong>{scenario.criticalWells}</strong></div>
                <div className="stat-row"><span>Sustainability Status</span><strong className={`sustainable-pill ${scenario.sustainabilityClass}`}>{scenario.sustainability}</strong></div>
                <div className="stat-row"><span>Est. Recovery Time</span><strong>{scenario.recoveryTime} days</strong></div>
              </div>
            </div>
          )}
        </div>

        {wells.map((well) => (
          <div
            className={`well-marker${draggingWell === well.id ? " dragging" : ""}${exitingWells.includes(well.id) ? " exiting" : ""}`}
            key={well.id}
            style={{ left: `${well.x}%`, top: `${well.y}%` }}
            onPointerDown={(event) => startWellDrag(event, well.id)}
            onPointerMove={(event) => moveWell(event, well.id)}
            onPointerUp={stopWellDrag}
            onPointerCancel={stopWellDrag}
            title={`Drag ${well.name} across the map`}
          >
            <i className="influence-ring ring-outer" />
            <i className="influence-ring ring-middle" />
            <i className="influence-ring ring-inner" />
            <i className="well-ripple ripple-one" />
            <i className="well-ripple ripple-two" />
            <img className="well-image" src="/well-cropped.png" alt="" aria-hidden="true" />
          </div>
        ))}
      </section>

      <section className="readings-section">
        <div className="section-inner">
          <div className="readings-header">
            <h2>All Parameters - Current Readings (All Zones)</h2>
            <div className="report-actions">
              <label className="download-report upload-report">
                <Upload size={16} strokeWidth={2.2} />
                Upload PDF
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(event) => {
                    void uploadPdfReport(event.target.files?.[0]);
                    event.currentTarget.value = "";
                  }}
                />
              </label>
              <button className="download-report" onClick={downloadPdfReport}>
                <Download size={16} strokeWidth={2.2} />
                Download PDF
              </button>
            </div>
          </div>
          {importMessage && <p className="import-message">{importMessage}</p>}
          <div className="table-wrap">
            <table>
              <thead><tr>{["Well ID", "Discharge", "DO (mg/L)", "pH", "Temp (°C)", "Salinity (ppt)", "TDS (mg/L)", "EC (µS/cm)", "GW Level (m)"].map((label) => <th key={label}>{label}</th>)}</tr></thead>
              <tbody>{wells.map((well) => (
                <tr key={well.id}>
                  <td><input className="table-input text" aria-label={`Name for ${well.name}`} value={well.name} onChange={(event) => updateWellName(well.id, event.target.value)} /></td>
                  <td><input className="table-input" aria-label={`${well.name} discharge`} type="number" min="0" max="500" value={well.discharge} onChange={(event) => updateWell(well.id, Number(event.target.value))} /></td>
                  <td><input className="table-input" aria-label={`${well.name} dissolved oxygen`} type="number" step="0.1" value={well.readings.dissolvedOxygen} onChange={(event) => updateReading(well.id, "dissolvedOxygen", Number(event.target.value))} /></td>
                  <td><input className="table-input" aria-label={`${well.name} pH`} type="number" step="0.1" value={well.readings.ph} onChange={(event) => updateReading(well.id, "ph", Number(event.target.value))} /></td>
                  <td><input className="table-input" aria-label={`${well.name} temperature`} type="number" step="0.1" value={well.readings.temperature} onChange={(event) => updateReading(well.id, "temperature", Number(event.target.value))} /></td>
                  <td><input className="table-input" aria-label={`${well.name} salinity`} type="number" step="0.1" value={well.readings.salinity} onChange={(event) => updateReading(well.id, "salinity", Number(event.target.value))} /></td>
                  <td><input className="table-input" aria-label={`${well.name} TDS`} type="number" step="1" value={well.readings.tds} onChange={(event) => updateReading(well.id, "tds", Number(event.target.value))} /></td>
                  <td><input className="table-input" aria-label={`${well.name} electrical conductivity`} type="number" step="1" value={well.readings.electricalConductivity} onChange={(event) => updateReading(well.id, "electricalConductivity", Number(event.target.value))} /></td>
                  <td><input className="table-input" aria-label={`${well.name} groundwater level`} type="number" step="0.1" value={well.readings.groundwaterLevel} onChange={(event) => updateReading(well.id, "groundwaterLevel", Number(event.target.value))} /></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <div className="parameter-analytics">
            <article className="chart-card">
              <div className="chart-card-heading">
                <h3>Average <span>Water Parameters</span></h3>
                <SlidersHorizontal size={16} strokeWidth={2} />
              </div>
              <div className="donut-wrap">
                <Doughnut data={parameterDonutData} options={donutOptions} />
              </div>
            </article>
            <article className="chart-card">
              <div className="chart-card-heading">
                <h3><Thermometer size={19} strokeWidth={2.2} /> Temperature Trends</h3>
                <SlidersHorizontal size={16} strokeWidth={2} />
              </div>
              <div className="line-wrap">
                <Line data={temperatureTrendData} options={lineOptions} />
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>

  );
}

