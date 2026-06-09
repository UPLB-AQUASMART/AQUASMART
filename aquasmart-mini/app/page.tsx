"use client";

import {
  ChevronLeft,
  ChevronRight,
  CloudSun,
  Droplet,
  Plus,
  RefreshCw,
  TrendingUp,
  Trash2,
} from "lucide-react";
import { useMemo, useState, type PointerEvent as ReactPointerEvent } from "react";

type View = "simulation" | "forecast";
type Tab = "discharge" | "statistics";

type Well = {
  id: number;
  name: string;
  discharge: number;
  x: number;
  y: number;
};

const readings = [
  ["Well-1", "7.3", "7.5", "27.6", "1.0", "569", "13.0"],
  ["Well-2", "6.8", "7.2", "26.9", "0.8", "514", "12.4"],
  ["Well-3", "7.1", "7.4", "27.2", "1.2", "602", "14.1"],
  ["Well-4", "6.9", "7.3", "26.7", "0.9", "548", "12.8"],
];

const forecastDays = [
  { day: "Tomorrow", rain: 60, temp: 24 },
  { day: "June 10", rain: 60, temp: 25 },
  { day: "June 11", rain: 60, temp: 24 },
  { day: "June 12", rain: 60, temp: 26 },
  { day: "June 13", rain: 45, temp: 27 },
];

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
  const initialWells: Well[] = [{ id: 1, name: "Option 1", discharge: 138, x: 45, y: 36 }];
  const [wells, setWells] = useState(initialWells);
  const [tab, setTab] = useState<Tab>("discharge");
  const [draggingWell, setDraggingWell] = useState<number | null>(null);
  const totalDischarge = useMemo(() => wells.reduce((sum, well) => sum + well.discharge, 0), [wells]);

  function addWell() {
    const id = Math.max(0, ...wells.map((well) => well.id)) + 1;
    setWells((current) => [
      ...current,
      {
        id,
        name: `Option ${id}`,
        discharge: 100,
        x: 34 + ((id * 17) % 48),
        y: 25 + ((id * 13) % 45),
      },
    ]);
  }

  function updateWell(id: number, discharge: number) {
    setWells((current) => current.map((well) => well.id === id ? { ...well, discharge } : well));
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
              <button className="icon-button" onClick={() => setWells(initialWells)} title="Reset simulation"><RefreshCw size={20} strokeWidth={2.4} /></button>
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
                <div className="well-control" key={well.id}>
                  <div className="well-row">
                    <span><Droplet size={17} strokeWidth={2.2} />{well.name}</span>
                    <strong>{well.discharge} m³/day</strong>
                    {wells.length > 1 && (
                      <button className="delete-well" title={`Remove ${well.name}`} onClick={() => setWells((current) => current.filter((item) => item.id !== well.id))}>
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
                <div className="stat-row"><span>Safe Yield Capacity</span><strong>1000 m³/day</strong></div>
                <div className="stat-row utilization-row"><span>Capacity Utilization</span><strong>93.2%</strong></div>
                <div className="utilization-track" aria-label="Capacity utilization: 93.2 percent"><i /></div>
                <div className="stat-row"><span>Average Drawdown</span><strong>1.9 m</strong></div>
                <div className="stat-row"><span>Critical Wells</span><strong>0</strong></div>
                <div className="stat-row"><span>Sustainability Status</span><strong className="sustainable-pill">Sustainable</strong></div>
                <div className="stat-row"><span>Est. Recovery Time</span><strong>94 days</strong></div>
              </div>
            </div>
          )}
        </div>

        {wells.map((well) => (
          <div
            className={`well-marker${draggingWell === well.id ? " dragging" : ""}`}
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
          <h2>All Parameters - Current Readings (All Zones)</h2>
          <div className="table-wrap">
            <table>
              <thead><tr>{["Well ID", "DO (mg/L)", "pH", "Temp (°C)", "Salinity (ppt)", "TDS (mg/L)", "GW Level (m)"].map((label) => <th key={label}>{label}</th>)}</tr></thead>
              <tbody>{readings.map((row) => <tr key={row[0]}>{row.map((cell, index) => <td key={cell}>{index === 0 ? <strong>{cell}</strong> : cell}</td>)}</tr>)}</tbody>
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
