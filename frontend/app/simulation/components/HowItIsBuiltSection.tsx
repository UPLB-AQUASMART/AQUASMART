import { Braces, Box, Cpu, DatabaseZap } from "lucide-react";

import styles from "./HowItIsBuiltSection.module.css";

const buildSteps = [
  {
    title: "Three.js rendering layer",
    body: "Presents the aquifer as interactive 2D, 3D, and top-view scenes with wells, layers, flow direction, and monitoring overlays.",
    icon: Box,
  },
  {
    title: "FloPy model preparation",
    body: "Translates grid size, aquifer layers, recharge, river boundaries, pumping wells, soil types, and screen levels into MODFLOW-ready inputs.",
    icon: Braces,
  },
  {
    title: "MODFLOW simulation core",
    body: "Solves groundwater flow behavior, hydraulic head, drawdown response, and boundary interactions across the modeled aquifer cells.",
    icon: DatabaseZap,
  },
  {
    title: "Scenario data pipeline",
    body: "Connects water-quality readings, discharge settings, area of influence, and model outputs into the visual controls shown in the simulation.",
    icon: Cpu,
  },
];

export function HowItIsBuiltSection() {
  return (
    <section className={styles.section} aria-labelledby="built-title">
      <div className={styles.shell}>
        <header className={styles.header}>
          <Braces aria-hidden="true" />
          <div>
            <h2 id="built-title">How It Is Built</h2>
            <p>
              The groundwater flow simulation combines browser visualization,
              Python model setup, and a numerical groundwater solver to turn
              field assumptions into readable spatial outputs.
            </p>
          </div>
        </header>

        <div className={styles.grid}>
          {buildSteps.map((step) => {
            const Icon = step.icon;

            return (
              <article className={styles.card} key={step.title}>
                <div className={styles.iconWrap}>
                  <Icon aria-hidden="true" />
                </div>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </article>
            );
          })}
        </div>

        <div className={styles.note}>
          <strong>Supporting technologies</strong>
          <span>
            React and Next.js structure the page, TypeScript keeps the model
            configuration predictable, and API routes can connect the interface
            to FloPy/MODFLOW workflows as the simulation backend matures.
          </span>
        </div>
      </div>
    </section>
  );
}
