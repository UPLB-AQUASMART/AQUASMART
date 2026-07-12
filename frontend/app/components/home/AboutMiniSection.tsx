import { SectionPill } from "./SectionPill";
import revealStyles from "./ScrollReveal.module.css";
import styles from "./AboutMiniSection.module.css";

export function AboutMiniSection() {
  return (
    <section className={`${styles["about-mini-section"]} ${revealStyles["scroll-reveal"]}`}>
      <SectionPill className={styles["section-pill"]}>About AQUASMART Mini</SectionPill>
      <h2>
        <span>Smaller Scale</span>
        for Better Understanding
      </h2>
      <p>
        AQUASMART Mini combines a <strong>miniature aquifer model</strong>,{" "}
        <strong>low-cost sensors</strong>, and a <strong>live dashboard</strong>{" "}
        to show how infiltration, recharge, groundwater flow, pumping, and water
        quality connect with sustainable farming.
      </p>
    </section>
  );
}
