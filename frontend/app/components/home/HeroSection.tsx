import revealStyles from "./ScrollReveal.module.css";
import styles from "./HeroSection.module.css";

export function HeroSection() {
  return (
    <section className={`${styles["hero-section"]} ${revealStyles["scroll-reveal"]}`}>
      <img className={styles["hero-image"]} src="/figma/hero.png" alt="" />
      <div className={styles["hero-fade"]} />
      <div className={styles["hero-copy"]}>
        <h1>
          Smarter System
          <span>
            Stronger <em>Harvest</em>
          </span>
        </h1>
        <p>
          AQUASMART provides real-time irrigation monitoring, water analytics,
          and AI-powered smart farming solutions for sustainable agriculture.
        </p>
      </div>
    </section>
  );
}
