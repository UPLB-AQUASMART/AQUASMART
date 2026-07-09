import { SiteNav } from "@/app/components/home/SiteNav";
import { IrrigationScheduleDashboard } from "./components/IrrigationScheduleDashboard";
import styles from "./page.module.css";

export default function SimulationIrrigationSchedulePage() {
  return (
    <main className={styles.page}>
      <SiteNav activeLabel="Simulation" />
      <IrrigationScheduleDashboard />
    </main>
  );
}
