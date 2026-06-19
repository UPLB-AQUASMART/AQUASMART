import Link from "next/link";

const navLinks = [
  { label: "Home", href: "/#home" },
  { label: "About", href: "/#about" },
  { label: "Simulation", href: "/#simulations", active: true },
  { label: "Weather", href: "/#weather" },
  { label: "Team", href: "/#partners" },
  { label: "Contact", href: "/#contact" },
  { label: "Partners", href: "/#partners" },
];

const readings = [
  {
    well: "Well-1",
    do: "7.3",
    ph: "7.5",
    temp: "27.6",
    salinity: "1.0",
    tds: "500",
    gwLevel: "12.4",
    status: "Optimal",
  },
  {
    well: "Well-2",
    do: "6.9",
    ph: "7.1",
    temp: "28.2",
    salinity: "1.3",
    tds: "545",
    gwLevel: "13.1",
    status: "Watch",
  },
  {
    well: "Well-3",
    do: "7.8",
    ph: "7.4",
    temp: "26.9",
    salinity: "0.9",
    tds: "486",
    gwLevel: "11.8",
    status: "Optimal",
  },
];

const researchCards = [
  "/figma/groundwater-thumb-1.png",
  "/figma/groundwater-thumb-2.png",
  "/figma/groundwater-thumb-3.png",
  "/figma/groundwater-thumb-4.png",
];

function GroundwaterNav() {
  return (
    <header className="groundwater-nav" aria-label="AQUASMART Mini navigation">
      <Link className="groundwater-nav-logo" href="/#home" aria-label="AQUASMART Mini home">
        <img src="/figma/groundwater-logo.png" alt="AQUASMART Mini" />
        <span>mini</span>
      </Link>
      <nav className="groundwater-nav-links" aria-label="Primary navigation">
        {navLinks.map((link) => (
          <Link className={link.active ? "active" : undefined} href={link.href} key={link.label}>
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

export default function GroundwaterSimulationPage() {
  return (
    <main className="groundwater-page">
      <GroundwaterNav />

      <section className="groundwater-hero">
        <img className="groundwater-hero-map" src="/figma/groundwater-map.png" alt="" />
        <div className="groundwater-hero-content">
          <h1>
            MODFLOW/FLOPY
            <span>Groundwater Simulation</span>
          </h1>
          <div className="groundwater-hero-bottom">
            <p>
              Simulate groundwater response across wells and field zones using MODFLOW/FLOPY
              outputs, proximity layers, and live parameter readings from AQUASMART mini.
            </p>
            <a className="groundwater-plus-button" href="#groundwater-overview" aria-label="Read groundwater simulation overview">
              <img src="/figma/groundwater-plus.svg" alt="" />
            </a>
          </div>
          <img className="groundwater-proximity" src="/figma/groundwater-proximity.png" alt="" />
          <img className="groundwater-well-marker" src="/figma/groundwater-well.png" alt="" />
        </div>
      </section>

      <section className="groundwater-overview" id="groundwater-overview">
        <h2>Groundwater Simulation</h2>
        <p>
          AQUASMART mini combines well-level sensor data, groundwater level estimates,
          and modelled flow behavior to help teams understand field conditions before
          irrigation decisions are made.
        </p>
        <div className="groundwater-overview-row">
          <img src="/figma/groundwater-detail.png" alt="Groundwater simulation output map" />
          <p>
            The simulation view brings model outputs and monitoring layers into one
            workspace. Well proximity, groundwater level, salinity, pH, dissolved oxygen,
            and temperature readings can be compared against field zones so shifts are
            easier to spot. This makes the screen useful for checking whether pumping,
            rainfall, or irrigation activity is likely to affect nearby areas.
          </p>
        </div>
      </section>

      <section className="groundwater-table-section" aria-labelledby="groundwater-table-title">
        <div className="groundwater-table-card">
          <h2 id="groundwater-table-title">ALL PARAMETERS - CURRENT READINGS (ALL ZONES)</h2>
          <div className="groundwater-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Well ID</th>
                  <th>DO (mg/L)</th>
                  <th>pH</th>
                  <th>Temp (C)</th>
                  <th>Salinity (ppt)</th>
                  <th>TDS (mg/L)</th>
                  <th>GW Level (m)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {readings.map((reading) => (
                  <tr key={reading.well}>
                    <th scope="row">{reading.well}</th>
                    <td>{reading.do}</td>
                    <td>{reading.ph}</td>
                    <td>{reading.temp}</td>
                    <td>{reading.salinity}</td>
                    <td>{reading.tds}</td>
                    <td>{reading.gwLevel}</td>
                    <td>
                      <span className={reading.status === "Optimal" ? "optimal" : "watch"}>
                        {reading.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="groundwater-research">
        <div className="groundwater-research-heading">
          <p>Research Institutions/Partners</p>
          <div className="groundwater-carousel-buttons" aria-hidden="true">
            <span>
              <img src="/figma/groundwater-chevron-left.svg" alt="" />
            </span>
            <span>
              <img src="/figma/groundwater-chevron-right.svg" alt="" />
            </span>
          </div>
        </div>
        <div className="groundwater-research-grid">
          {researchCards.map((image, index) => (
            <article className="groundwater-research-card" key={image}>
              <img src={image} alt="" />
              <div>
                <h3>Partner Research {index + 1}</h3>
                <p>Groundwater data, field observations, and irrigation planning references.</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className="groundwater-footer">
        <div className="groundwater-footer-brand">
          <img src="/figma/groundwater-footer-mark.png" alt="" />
          <div>
            <p>AQUASMART mini</p>
            <span>Groundwater simulation and water-quality monitoring for field decisions.</span>
          </div>
        </div>
        <div className="groundwater-footer-links">
          {navLinks.map((link) => (
            <Link href={link.href} key={link.label}>
              {link.label}
            </Link>
          ))}
        </div>
      </footer>
    </main>
  );
}
