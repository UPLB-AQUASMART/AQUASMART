"use client";

import {
  ChevronLeft,
  ChevronRight,
  CloudSun,
  Download,
  Droplet,
  Upload,
  Plus,
  RefreshCw,
  TrendingUp,
  Trash2,
} from "lucide-react";
import { useMemo, useState, type PointerEvent as ReactPointerEvent } from "react";

type View = "simulation" | "forecast";
type Tab = "discharge" | "statistics";
type ReadingKey = "dissolvedOxygen" | "ph" | "temperature" | "salinity" | "tds" | "groundwaterLevel";

type Readings = Record<ReadingKey, number>;

type Well = {
  id: number;
  name: string;
  discharge: number;
  x: number;
  y: number;
  readings: Readings;
};

const forecastDays = [
  { day: "Tomorrow", rain: 60, temp: 24 },
  { day: "June 10", rain: 60, temp: 25 },
  { day: "June 11", rain: 60, temp: 24 },
  { day: "June 12", rain: 60, temp: 26 },
  { day: "June 13", rain: 45, temp: 27 },
];

function makeReadings(id: number, discharge: number): Readings {
  const dischargePressure = discharge / 500;

  return {
    dissolvedOxygen: Number((8.1 - dischargePressure * 1.25 - id * 0.06).toFixed(1)),
    ph: Number((7.62 - dischargePressure * 0.42 + id * 0.03).toFixed(1)),
    temperature: Number((26.4 + dischargePressure * 1.15 + id * 0.12).toFixed(1)),
    salinity: Number((0.42 + dischargePressure * 0.92 + id * 0.04).toFixed(1)),
    tds: Math.round(430 + discharge * 1.32 + id * 18),
    groundwaterLevel: Number((14.2 - dischargePressure * 2.55 - id * 0.18).toFixed(1)),
  };
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

function Logo() {
  return (
    <div className="brand" aria-label="AQUASMART Mini">
      <span className="brand-mark"><Droplet size={22} fill="currentColor" /></span>
      <span className="brand-aqua">AQUA</span>
      <span className="brand-navy">SMART</span>
      <small>mini</small>
    </div>
  );
}

function Header({ view, onView }: { view: View; onView: (view: View) => void }) {
  return (
    <header className="site-header">
      <Logo />
      <nav aria-label="Primary navigation">
        <button>Home</button>
        <button>About</button>
        <button className={view === "simulation" ? "active" : ""} onClick={() => onView("simulation")}>Simulation</button>
        <button className={view === "forecast" ? "active" : ""} onClick={() => onView("forecast")}>Weather Forecast</button>
        <button>Team</button>
        <button>Contact</button>
      </nav>
    </header>
  );
}

function PageIntro({ title }: { title: string }) {
  return (
    <section className="page-intro">
      <h1>{title}</h1>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </p>
    </section>
  );
}

function Simulation() {
  const initialWells: Well[] = [{ id: 1, name: "Option 1", discharge: 138, x: 45, y: 36, readings: makeReadings(1, 138) }];
  const [wells, setWells] = useState(initialWells);
  const [tab, setTab] = useState<Tab>("discharge");
  const [draggingWell, setDraggingWell] = useState<number | null>(null);
  const [exitingWells, setExitingWells] = useState<number[]>([]);
  const [isResetting, setIsResetting] = useState(false);
  const [importMessage, setImportMessage] = useState("");
  const totalDischarge = useMemo(() => wells.reduce((sum, well) => sum + well.discharge, 0), [wells]);
  const safeYield = 1000;
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
    `${well.discharge} m³/day`,
    well.readings.dissolvedOxygen.toFixed(1),
    well.readings.ph.toFixed(1),
    well.readings.temperature.toFixed(1),
    well.readings.salinity.toFixed(1),
    Math.round(well.readings.tds).toString(),
    well.readings.groundwaterLevel.toFixed(1),
  ]), [wells]);

  function addWell() {
    const id = Math.max(0, ...wells.map((well) => well.id)) + 1;
    setWells((current) => [
      ...current,
      {
        id,
        name: `Option ${id}`,
        discharge: id === 2 ? 407 : 100,
        x: id === 2 ? 78 : 34 + ((id * 17) % 48),
        y: id === 2 ? 73 : 25 + ((id * 13) % 45),
        readings: makeReadings(id, id === 2 ? 407 : 100),
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
    const headers = ["Well ID", "Discharge", "DO", "pH", "Temp", "Salinity", "TDS", "GW Level"];
    const rows = parameterRows;
    const objects: string[] = [];
    const pageWidth = 842;
    const pageHeight = 595;
    const left = 38;
    const top = 552;
    const colWidths = [116, 94, 62, 58, 70, 80, 76, 82];
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

      const importedRows = cells.slice(tableStart + 8, -1);
      const importedWells: Well[] = [];

      for (let index = 0; index + 7 < importedRows.length; index += 8) {
        const [name, dischargeText, dissolvedOxygen, ph, temperature, salinity, tds, groundwaterLevel] = importedRows.slice(index, index + 8);
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
    <>
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
                    <strong>{well.discharge} m³/day</strong>
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
                <div className="stat-row"><span>Total Pumping Discharge</span><strong>{totalDischarge} m³/day</strong></div>
                <div className="stat-row"><span>Safe Yield Capacity</span><strong>{safeYield} m³/day</strong></div>
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
              <thead><tr>{["Well ID", "Discharge", "DO (mg/L)", "pH", "Temp (°C)", "Salinity (ppt)", "TDS (mg/L)", "GW Level (m)"].map((label) => <th key={label}>{label}</th>)}</tr></thead>
              <tbody>{wells.map((well) => (
                <tr key={well.id}>
                  <td>
                    <input
                      className="table-input text"
                      aria-label={`Name for ${well.name}`}
                      value={well.name}
                      onChange={(event) => updateWellName(well.id, event.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      className="table-input"
                      aria-label={`${well.name} discharge`}
                      type="number"
                      min="0"
                      max="500"
                      value={well.discharge}
                      onChange={(event) => updateWell(well.id, Number(event.target.value))}
                    />
                  </td>
                  <td>
                    <input
                      className="table-input"
                      aria-label={`${well.name} dissolved oxygen`}
                      type="number"
                      step="0.1"
                      value={well.readings.dissolvedOxygen}
                      onChange={(event) => updateReading(well.id, "dissolvedOxygen", Number(event.target.value))}
                    />
                  </td>
                  <td>
                    <input
                      className="table-input"
                      aria-label={`${well.name} pH`}
                      type="number"
                      step="0.1"
                      value={well.readings.ph}
                      onChange={(event) => updateReading(well.id, "ph", Number(event.target.value))}
                    />
                  </td>
                  <td>
                    <input
                      className="table-input"
                      aria-label={`${well.name} temperature`}
                      type="number"
                      step="0.1"
                      value={well.readings.temperature}
                      onChange={(event) => updateReading(well.id, "temperature", Number(event.target.value))}
                    />
                  </td>
                  <td>
                    <input
                      className="table-input"
                      aria-label={`${well.name} salinity`}
                      type="number"
                      step="0.1"
                      value={well.readings.salinity}
                      onChange={(event) => updateReading(well.id, "salinity", Number(event.target.value))}
                    />
                  </td>
                  <td>
                    <input
                      className="table-input"
                      aria-label={`${well.name} TDS`}
                      type="number"
                      step="1"
                      value={well.readings.tds}
                      onChange={(event) => updateReading(well.id, "tds", Number(event.target.value))}
                    />
                  </td>
                  <td>
                    <input
                      className="table-input"
                      aria-label={`${well.name} groundwater level`}
                      type="number"
                      step="0.1"
                      value={well.readings.groundwaterLevel}
                      onChange={(event) => updateReading(well.id, "groundwaterLevel", Number(event.target.value))}
                    />
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}

function Forecast() {
  const [selected, setSelected] = useState(0);
  const current = forecastDays[selected];

  return (
    <>
      <PageIntro title="Weather Forecast" />
      <section className="forecast-band">
        <div className="forecast-grid">
          <article className="forecast-card">
            <div className="current-weather">
              <div className="weather-symbol"><CloudSun size={88} strokeWidth={1.2} /><strong>{current.temp}°</strong></div>
              <div className="weather-facts">
                <div><strong>{current.rain}%</strong><b>Chance of Rain</b></div>
                <div><b>Last Rainfall:</b><b>5 Days Ago</b></div>
                <div><b>Irrigation Status:</b><b className="excellent">Excellent</b></div>
              </div>
            </div>

            <div className="forecast-selector">
              <button className="arrow-button" title="Previous day" onClick={() => setSelected((selected - 1 + forecastDays.length) % forecastDays.length)}><ChevronLeft /></button>
              <div className="forecast-days">
                {forecastDays.slice(0, 4).map((item, index) => (
                  <button key={item.day} className={selected === index ? "selected-day" : ""} onClick={() => setSelected(index)}>
                    <span>{item.day}</span><CloudSun size={45} strokeWidth={1.2} /><strong>{item.rain}%</strong>
                  </button>
                ))}
              </div>
              <button className="arrow-button" title="Next day" onClick={() => setSelected((selected + 1) % forecastDays.length)}><ChevronRight /></button>
            </div>
          </article>

          <aside className="forecast-summary">
            <span>Field outlook</span>
            <h2>Good conditions for scheduled irrigation</h2>
            <div className="rain-bars" aria-label="Rain probability chart">
              {forecastDays.map((day) => <div key={day.day}><i style={{ height: `${day.rain}%` }} /><small>{day.day.replace("June ", "")}</small></div>)}
            </div>
          </aside>
        </div>
      </section>

      <section className="aquifer-section">
        <div className="aquifer-visual">
          <div className="north-arrow">N<span>➤</span></div>
          {["W-1|Pumping", "W-2|Monitoring", "W-3|Pumping", "W-4|Monitoring"].map((well, index) => {
            const [name, state] = well.split("|");
            return <div className={`aquifer-well well-${index + 1}`} key={name}><strong>{name}</strong><span>({state})</span><i /></div>;
          })}
          <div className="land" />
          <div className="soil soil-one" />
          <div className="soil soil-two" />
          <div className="water-table" />
        </div>
      </section>
    </>
  );
}

export default function Home() {
  const [view, setView] = useState<View>("simulation");
  return (
    <main>
      <Header view={view} onView={setView} />
      {view === "simulation" ? <Simulation /> : <Forecast />}
    </main>
  );
}
