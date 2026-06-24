import Link from "next/link";

import { SiteFooter } from "@/app/components/home/SiteFooter";
import styles from "./page.module.css";

const navLinks = [
  { label: "Home", href: "/#home" },
  { label: "About", href: "/#about" },
  { label: "Simulation", href: "/#simulations", active: true },
  { label: "Weather", href: "/#weather" },
  { label: "Team", href: "/team" },
  { label: "Contact", href: "/#contact" },
  { label: "Partners", href: "/#partners" },
];

const heroCopy =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad mini...";

const detailCopy =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum";

const longCopy =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

const drawdownCopy =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum";

function IdwNav() {
  return (
    <header className={styles["idw-nav"]} aria-label="AQUASMART Mini navigation">
      <Link className={styles["idw-nav-logo"]} href="/#home" aria-label="AQUASMART Mini home">
        <img src="/assets/logo_2.png" alt="AQUASMART Mini" />
      </Link>
      <nav className={styles["idw-nav-links"]} aria-label="Primary navigation">
        {navLinks.map((link) => (
          <Link className={link.active ? styles.active : undefined} href={link.href} key={link.label}>
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

export default function SimulationPage() {
  return (
    <main className={styles["idw-page"]}>
      <IdwNav />

      <section className={styles["idw-map-hero"]}>
        <img className={styles["idw-map-image"]} src="/figma/idw-map.png" alt="" />
        <div className={styles["idw-map-content"]}>
          <h1>
            Spatial Drawdown
            <span>Map</span>
          </h1>
          <div className={styles["idw-map-bottom"]}>
            <p>{heroCopy}</p>
            <a className={styles["idw-view-button"]} href="#idw-info" aria-label="View IDW explanation">
              <span aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section className={styles["idw-info-section"]} id="idw-info">
        <h2>What is Inverse Distance Weighting?</h2>
        <p>{detailCopy}</p>
        <div className={styles["idw-info-row"]}>
          <img src="/figma/idw-surface.png" alt="Interpolated IDW surface with measured points" />
          <p>{longCopy}</p>
        </div>
      </section>

      <section className={styles["idw-drawdown-section"]}>
        <h2>How does drawdown work?</h2>
        <p>{drawdownCopy}</p>
        <div className={styles["idw-drawdown-images"]}>
          <img src="/figma/idw-drawdown-well.png" alt="Well drawdown cone of depression diagram" />
          <img src="/figma/idw-aquifer-pumping.png" alt="Water-table drawdown and recovery after pumping diagram" />
        </div>
        <p>{drawdownCopy}</p>
      </section>

      <div className={styles["idw-navy-spacer"]} aria-hidden="true" />
      <SiteFooter className={styles["site-footer"]} />
    </main>
  );
}
