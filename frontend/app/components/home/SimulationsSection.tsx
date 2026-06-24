"use client";

import { useEffect, useState } from "react";

import { simulations } from "@/app/data/home";

import { SectionPill } from "./SectionPill";
import frameStyles from "./Frame.module.css";
import revealStyles from "./ScrollReveal.module.css";
import styles from "./SimulationsSection.module.css";

type Simulation = (typeof simulations)[number];

function SimulationCard({ simulation, delay }: { simulation: Simulation; delay: number }) {
  const [activeState, setActiveState] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let intervalId: number | undefined;
    const timeoutId = window.setTimeout(() => {
      setActiveState((current) => (current + 1) % simulation.states.length);
      intervalId = window.setInterval(() => {
        setActiveState((current) => (current + 1) % simulation.states.length);
      }, 4600);
    }, delay);

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [delay, simulation.states.length]);

  const currentState = simulation.states[activeState];

  return (
    <a className={`${styles["simulation-card"]} ${revealStyles["simulation-card"]}`} href={simulation.href}>
      <h3>
        {simulation.title} <span>{simulation.highlight}</span>
      </h3>
      <div className={styles["simulation-media"]}>
        {simulation.states.map((state, index) => (
          <img
            className={`${styles["simulation-state-image"]}${index === activeState ? ` ${styles.active}` : ""}`}
            src={state.image}
            alt=""
            aria-hidden={index !== activeState}
            key={state.label}
          />
        ))}
      </div>
      <div className={styles["simulation-state-heading"]}>
        <strong>{currentState.label}</strong>
        <span aria-label={`State ${activeState + 1} of ${simulation.states.length}`}>
          {simulation.states.map((state, index) => (
            <i className={index === activeState ? styles.active : undefined} key={state.label} />
          ))}
        </span>
      </div>
      <p key={currentState.label}>{currentState.body}</p>
    </a>
  );
}

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
          {simulations.map((simulation, index) => (
            <SimulationCard simulation={simulation} delay={index === 0 ? 2600 : 3400} key={simulation.title} />
          ))}
        </div>
      </div>
    </section>
  );
}
