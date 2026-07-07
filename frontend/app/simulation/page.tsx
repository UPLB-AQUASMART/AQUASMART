import { SiteFooter } from "@/app/components/home/SiteFooter";
import { SiteNav } from "@/app/components/home/SiteNav";
import { BoundaryConditionsSection } from "./components/BoundaryConditionsSection";
import { HowItIsBuiltSection } from "./components/HowItIsBuiltSection";
import { ModelViewsSection } from "./components/ModelViewsSection";
import { RelatedModulesSection } from "./components/RelatedModulesSection";
import { SimulationModelEntry } from "./components/SimulationModelEntry";
import styles from "./page.module.css";

const heroCopy =
  "Simulate what goes underneath, providing spatial views for better groundwater understanding and monitoring through accurate representations of working models.";

export default function SimulationPage() {
  return (
    <main className={`${styles.page} ${styles["idw-page"]}`}>
      <SiteNav activeLabel="Simulation" />
      <SimulationModelEntry heroCopy={heroCopy} styles={styles} />
      <section className={styles.overview} aria-labelledby="simulation-title">
        <div>
          <span className={styles.eyebrow}>Groundwater Flow Simulation</span>
          <h2 id="simulation-title">
            Model Simulation of the factors affecting Groundwater Flow through
            FloPy and MODFLOW.
          </h2>
        </div>
        <p>Data source: Mock Data</p>
      </section>
      <ModelViewsSection />
      <BoundaryConditionsSection />
      <HowItIsBuiltSection />
      <RelatedModulesSection />
      <SiteFooter className={styles.footer} />
    </main>
  );
}
