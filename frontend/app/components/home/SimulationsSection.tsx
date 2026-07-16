"use client";

import type { MouseEvent } from "react";
import { useEffect, useRef, useState } from "react";

import { simulations } from "@/app/data/home";

import { SectionPill } from "./SectionPill";
import frameStyles from "./Frame.module.css";
import revealStyles from "./ScrollReveal.module.css";
import styles from "./SimulationsSection.module.css";

type Simulation = (typeof simulations)[number];

// Single shared period for every card. There is exactly one timer for the
// whole section (see SimulationsSection below), so this offset can never
// drift relative to itself the way independent per-card timers can.
const TICK_INTERVAL_MS = 4600;

function SimulationCard({
  simulation,
  tick,
}: {
  simulation: Simulation;
  tick: number;
}) {
  const activeState = tick % simulation.states.length;
  const currentState = simulation.states[activeState];

  return (
    <a
      className={`${styles["simulation-card"]} ${revealStyles["simulation-card"]}`}
      href={simulation.href}
    >
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
        <span
          aria-label={`State ${activeState + 1} of ${simulation.states.length}`}
        >
          {simulation.states.map((state, index) => (
            <i
              className={index === activeState ? styles.active : undefined}
              key={state.label}
            />
          ))}
        </span>
      </div>
      <p key={currentState.label}>{currentState.body}</p>
    </a>
  );
}

export function SimulationsSection() {
  const cursorDotRef = useRef<HTMLDivElement | null>(null);
  const cursorOutlineRef = useRef<HTMLDivElement | null>(null);
  const [isCursorVisible, setIsCursorVisible] = useState(false);

  // One shared tick drives every card's rotation. Advancing this single
  // counter (instead of letting each card run its own setInterval) is what
  // guarantees the cards stay a fixed, permanent number of states apart —
  // there's no second independent timer for the first one to drift against.
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const intervalId = window.setInterval(() => {
      setTick((current) => current + 1);
    }, TICK_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, []);

  const moveCursor = (event: MouseEvent<HTMLElement>) => {
    const transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`;

    if (cursorDotRef.current) {
      cursorDotRef.current.style.transform = transform;
    }

    if (cursorOutlineRef.current) {
      cursorOutlineRef.current.style.transform = transform;
    }
  };

  const showCursor = (event: MouseEvent<HTMLElement>) => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches)
      return;

    moveCursor(event);
    setIsCursorVisible(true);
  };

  const hideCursor = () => {
    setIsCursorVisible(false);
  };

  return (
    <section
      className={`${styles["simulations-section"]} ${revealStyles["scroll-reveal"]}`}
      id="simulations"
    >
      <SectionPill>All Simulations</SectionPill>
      <div
        className={`${frameStyles["dark-frame"]} ${frameStyles["simulations-frame"]} ${styles["custom-cursor-area"]}`}
        onMouseEnter={showCursor}
        onMouseLeave={hideCursor}
        onMouseMove={moveCursor}
      >
        <img
          className={frameStyles["frame-bg"]}
          src="/figma/simulations-bg.png"
          alt=""
        />
        <div
          className={`${frameStyles["frame-copy"]} ${revealStyles["frame-copy"]}`}
        >
          <h2>Simulate How We Operate</h2>
          <p>
            AQUASMART mini helps make water system management familiar to users
            through simplified groundwater mapping, drawdown behavior, and
            weather-linked irrigation decisions.
          </p>
        </div>
        <div className={styles["simulation-grid"]}>
          {simulations.map((simulation, index) => (
            <SimulationCard
              key={simulation.title}
              simulation={simulation}
              tick={tick}
            />
          ))}
        </div>
      </div>
      <div
        aria-hidden="true"
        className={`${styles["cursor-dot"]}${
          isCursorVisible ? ` ${styles.visible}` : ""
        }`}
        ref={cursorDotRef}
      />
      <div
        aria-hidden="true"
        className={`${styles["cursor-dot-outline"]}${
          isCursorVisible ? ` ${styles.visible}` : ""
        }`}
        ref={cursorOutlineRef}
      />
    </section>
  );
}
