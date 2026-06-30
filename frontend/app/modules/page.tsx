import type { Metadata } from "next";
import Image from "next/image";

import { SiteFooter } from "@/app/components/home/SiteFooter";
import { SiteNav } from "@/app/components/home/SiteNav";
import { learningModules } from "@/app/data/home";
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
            <article className={styles.card} key={module.code}>
              <div className={styles.photo}>
                <Image src={module.image} alt="" fill sizes="(max-width: 900px) 100vw, 388px" />
              </div>
              <div className={styles.desc}>
                <div className={styles["module-title-row"]}>
                  <h2>{module.code}</h2>
                  <span>{module.title}</span>
                </div>
                <p>{module.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
