import { simulations } from "@/app/data/home";

import { SectionPill } from "./SectionPill";
import frameStyles from "./Frame.module.css";
import revealStyles from "./ScrollReveal.module.css";
import styles from "./SimulationsSection.module.css";

export function SimulationsSection() {
  return (
    <section className={`${styles["simulations-section"]} ${revealStyles["scroll-reveal"]}`} id="simulations">
      <SectionPill>All Simulations</SectionPill>
      <div className={`${frameStyles["dark-frame"]} ${frameStyles["simulations-frame"]}`}>
        <img className={frameStyles["frame-bg"]} src="/figma/simulations-bg.png" alt="" />
        <div className={`${frameStyles["frame-copy"]} ${revealStyles["frame-copy"]}`}>
          <h2>Simulate How We Operate</h2>
          <p>
            AQUASMART mini helps make water system management familiar to users
            through simplified groundwater mapping, drawdown behavior, and
            weather-linked irrigation decisions.
          </p>
        </div>
        <div className={styles["simulation-grid"]}>
          {simulations.map((simulation) => (
            <a className={`${styles["simulation-card"]} ${revealStyles["simulation-card"]}`} href={simulation.href} key={simulation.title}>
              <h3>
                {simulation.title} <span>{simulation.highlight}</span>
              </h3>
              <img src={simulation.image} alt="" />
              <p>{simulation.body}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
