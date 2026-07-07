import type { Metadata } from "next";

import { SiteFooter } from "@/app/components/home/SiteFooter";
import { SiteNav } from "@/app/components/home/SiteNav";
import { learningModules } from "@/app/data/home";
import { LearningModuleCard } from "./components/LearningModuleCard";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Learning Modules | AQUASMART Mini",
  description:
    "Access AQUASMART learning modules on groundwater, sensors, weather forecasting, irrigation, and water quality.",
};

export default function ModulesPage() {
  return (
    <main className={styles["modules-page"]}>
      <SiteNav activeLabel="Modules" />

      <section className={styles["modules-hero"]} aria-labelledby="modules-title">
        <div className={styles["section-pill"]}>Learning Modules</div>
        <div className={styles["section-copy"]}>
          <h1 id="modules-title">
            <span>Beneath</span>
            the Surface
          </h1>
          <p>
            Access learning modules and materials to better understand how we
            maximize the water from pump to crop.
          </p>
        </div>

        <div className={styles["materials-grid"]}>
          {learningModules.map((module) => (
            <LearningModuleCard module={module} key={module.code} />
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
