import revealStyles from "./ScrollReveal.module.css";
import styles from "./HeroSection.module.css";

export function HeroSection() {
  return (
    <section className={`${styles["hero-section"]} ${revealStyles["scroll-reveal"]}`}>
      <img className={styles["hero-image"]} src="/figma/hero.png" alt="" />
      <div className={styles["hero-fade"]} />
      <div className={styles["hero-copy"]}>
        <h1>
          AQUASMART Mini
          <span>
            Groundwater <em>Awareness</em>
          </span>
        </h1>
        <p>
          AQUASMART Mini is an interactive, sensor-based miniature aquifer and farm system
          designed to improve public understanding of groundwater and its link to sustainable agriculture.
        </p>
      </div>
    </section>
  );
}
