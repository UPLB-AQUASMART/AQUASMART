import { Layers } from "lucide-react";

import { learningModules } from "@/app/data/home";
import { LearningModuleCard } from "@/app/modules/components/LearningModuleCard";
import styles from "./RelatedModulesSection.module.css";

const placeholderModules = learningModules.slice(0, 4);

export function RelatedModulesSection() {
  return (
    <section className={styles.section} aria-labelledby="related-title">
      <div className={styles.shell}>
        <header className={styles.header}>
          <Layers aria-hidden="true" />
          <div>
            <h2 id="related-title">Related Modules</h2>
            <p>
              These learning modules will connect the simulation to field
              monitoring, weather context, water-quality interpretation, and
              irrigation decisions as the module feature is integrated.
            </p>
          </div>
        </header>
        <div className={styles.grid}>
          {placeholderModules.map((module) => (
            <LearningModuleCard module={module} key={module.code} />
          ))}
        </div>
      </div>
    </section>
  );
}
