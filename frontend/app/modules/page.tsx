import type { Metadata } from "next";

import { SiteFooter } from "@/app/components/home/SiteFooter";
import { SiteNav } from "@/app/components/home/SiteNav";
import { learningModules } from "@/app/data/home";
import { ModulesBrowser } from "./ModulesBrowser";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Learning Modules | AQUASMART Mini",
  description:
    "Access AQUASMART learning modules on groundwater, sensors, weather forecasting, irrigation, and water quality.",
};

export default function ModulesPage() {
  return (
    <main className={styles.page}>
      <SiteNav activeLabel="Modules" />

      <section className={styles.hero} aria-labelledby="modules-title">
        <div className={styles.heroInner}>
          <div className={styles.badge}>Learning Modules</div>
          <h1 id="modules-title">
            Scientific Learning &
            <span>Climate-Resilient Water Insights</span>
          </h1>
          <p>
            Search AQUASMART Mini modules, filter by topic, and open supporting
            PDF learning materials for groundwater, sensors, forecasting, and
            sustainable irrigation.
          </p>

          <ModulesBrowser modules={learningModules} />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
