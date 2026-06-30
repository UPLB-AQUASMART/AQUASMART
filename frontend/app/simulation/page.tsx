import { SiteFooter } from "@/app/components/home/SiteFooter";
import { SiteNav } from "@/app/components/home/SiteNav";
import { SimulationModelEntry } from "./components/SimulationModelEntry";
import styles from "./page.module.css";

const heroCopy =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad mini...";

const detailCopy =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum";

const longCopy =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

const drawdownCopy =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum";

export default function SimulationPage() {
  return (
    <main className={styles["idw-page"]}>
      <SiteNav activeLabel="Simulation" />

      <SimulationModelEntry heroCopy={heroCopy} styles={styles} />

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
