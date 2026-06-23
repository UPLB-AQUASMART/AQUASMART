"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import revealStyles from "./ScrollReveal.module.css";
import styles from "./TaglineSection.module.css";

gsap.registerPlugin(ScrollTrigger);

const FARM_FILL_START = 0.1168;
const FARM_FILL_DURATION = 0.229632;
const ENVIRONMENT_FILL_START = 0.317728;
const ENVIRONMENT_FILL_DURATION = 0.277472;
const BACKGROUND_START = 0.54;
const BACKGROUND_DURATION = 0.368;
const ZOOM_START = 0.6504;
const ZOOM_DURATION = 0.3496;
const VANISH_START = 0.944064;
const VANISH_DURATION = 0.055936;

export function TaglineSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const sticky = stickyRef.current;

    if (!section || !sticky) {
      return;
    }

    const context = gsap.context(() => {
      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${Math.max(1, section.offsetHeight - window.innerHeight)}`,
          scrub: true,
          pin: sticky,
          pinSpacing: false,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      timeline
        .to(
          section,
          { "--tagline-farm-clip": "0%", duration: FARM_FILL_DURATION },
          FARM_FILL_START,
        )
        .to(
          section,
          {
            "--tagline-environment-clip": "0%",
            duration: ENVIRONMENT_FILL_DURATION,
          },
          ENVIRONMENT_FILL_START,
        )
        .to(
          section,
          { "--tagline-bg": 1, duration: BACKGROUND_DURATION },
          BACKGROUND_START,
        )
        .to(
          section,
          {
            "--tagline-zoom": 1,
            "--tagline-scale": () =>
              window.innerWidth < 720 ? 11 : window.innerWidth < 1100 ? 13 : 16,
            "--tagline-y": () =>
              `${window.innerWidth < 720 ? -20 : window.innerWidth < 1100 ? -24 : -28}vh`,
            duration: ZOOM_DURATION,
          },
          ZOOM_START,
        )
        .to(
          section,
          {
            "--tagline-text-opacity": 0,
            "--tagline-blur": "4px",
            duration: VANISH_DURATION,
          },
          VANISH_START,
        );
    }, section);

    return () => {
      context.revert();
    };
  }, []);

  return (
    <section className={styles["tagline-section"]} ref={sectionRef}>
      <div
        className={`${styles["tagline-sticky"]} ${revealStyles["scroll-reveal"]}`}
        ref={stickyRef}
      >
        <h2 className={styles["tagline-heading"]} aria-label="For Farmers For Environment">
          <span className={`${styles["tagline-layer"]} ${styles["tagline-layer-base"]}`} aria-hidden="true">
            <span className={styles["tagline-line-farm"]}>For Farmers</span>
            <strong className={styles["tagline-line-environment"]}>For Environment</strong>
          </span>
          <span className={`${styles["tagline-layer"]} ${styles["tagline-layer-fill"]}`} aria-hidden="true">
            <span className={styles["tagline-line-farm"]}>For Farmers</span>
            <strong className={styles["tagline-line-environment"]}>For Environment</strong>
          </span>
        </h2>
      </div>
    </section>
  );
}
