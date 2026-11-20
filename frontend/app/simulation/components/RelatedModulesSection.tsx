import { Construction, Layers } from "lucide-react";

import { getLearningModules } from "@/app/modules/moduleData";
import { LearningModuleCard } from "@/app/modules/components/LearningModuleCard";
import styles from "./RelatedModulesSection.module.css";

export async function RelatedModulesSection() {
  const modules = await getLearningModules();
  const displayModules = modules.slice(0, 4);

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

        {displayModules.length > 0 ? (
          <div className={styles.grid}>
            {displayModules.map((module) => (
              <LearningModuleCard module={module} key={module.code} />
            ))}
          </div>
        ) : (
          <div className={styles.wipContainer}>
            <Construction size={36} strokeWidth={1.5} className={styles.wipIcon} />
            <p className={styles.wipText}>
              Related learning modules are being prepared and will appear here
              once published.
            </p>
            <span className={styles.wipBadge}>Work in Progress</span>
          </div>
        )}
      </div>
    </section>
  );
}
