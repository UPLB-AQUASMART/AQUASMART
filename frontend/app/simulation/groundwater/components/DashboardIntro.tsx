import { Droplet } from "lucide-react";
import styles from "./DashboardIntro.module.css";

export function DashboardIntro() {
  return (
    <div className={styles.dashboardIntro}>
      <div className={styles.dashboardMark}>
        <Droplet size={38} fill="currentColor" />
        <span />
      </div>
      <div>
        <p>AQUASMART Mini</p>
        <h2 id="readings-title">Groundwater Parameters</h2>
        <span>
          Groundwater parameter simulation using sample data for future
          projection.
        </span>
      </div>
      <em>Data source: Mock Data</em>
    </div>
  );
}
