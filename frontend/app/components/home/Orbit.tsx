"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";

import { orbitCards } from "@/app/data/home";
import styles from "./Orbit.module.css";

export interface OrbitCard {
  name: string;
  description: string;
  href?: string;
}

export interface OrbitProps {
  /** Seconds for one full revolution. Lower = faster. */
  rotateSpeed?: number;
  /** Optional GIF/image URL shown behind the circles, clipped to the round frame. */
  backgroundImageUrl?: "/assets/1.gif";
  /**
   * "center" (default): the ring sits centered in its container, like the
   * original standalone version.
   * "left": the ring's center is pinned to the left edge of its container
   * and the left half is clipped off, so only the right half peeks in —
   * useful as a hero graphic sitting beside text content.
   */
  align?: "center" | "left";
  /**
   * How many cards are shown on the ring at once. If your data set is
   * bigger than this, the visible set cycles through the rest over time
   * instead of cramming everything onto the ring simultaneously.
   * Default: 5.
   */
  visibleCount?: number;
  cycleIntervalMs?: number;
}

export function Orbit({
  rotateSpeed = 26,
  backgroundImageUrl = "/assets/1.gif",
  align = "center",
  visibleCount = 5,
  cycleIntervalMs = 4000,
}: OrbitProps) {
  const allCards: OrbitCard[] = orbitCards;
  const windowSize = Math.max(1, Math.min(visibleCount, allCards.length));

  const [startIndex, setStartIndex] = useState(0);

  // useEffect(() => {
  //   // Nothing to cycle through if everything already fits on the ring.
  //   if (allCards.length <= windowSize) return;

  //   const timer = window.setInterval(() => {
  //     setStartIndex((current) => (current + 1) % allCards.length);
  //   }, cycleIntervalMs);

  //   return () => window.clearInterval(timer);
  // }, [allCards.length, windowSize, cycleIntervalMs]);


  const cards = Array.from(
    { length: windowSize },
    (_, i) => allCards[(startIndex + i) % allCards.length],
  );
  const count = cards.length;

  const voidStyle = {
    "--rotate-speed": rotateSpeed,
    "--count": count,
  } as CSSProperties;

  const isLeftAligned = align === "left";

  return (
    <div
      className={`${styles.frame} ${isLeftAligned ? styles["frame-left"] : ""}`}
      style={
        backgroundImageUrl
          ? { backgroundImage: `url(${backgroundImageUrl})` }
          : undefined
      }
    >
      <div
        className={`${styles.void} ${isLeftAligned ? styles["void-left"] : ""}`}
        style={voidStyle}
      >
        
        <div className={styles["last-circle"]} />
        <div className={styles["second-circle"]} />

        <div className={styles.crop}>
          <div className={styles.mask} />
        </div>

        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <circle cx="50" cy="50" r="49.5" fill="none" stroke="rgba(184,174,252,0.18)" strokeWidth="0.3" strokeDasharray="1 2" />
          <circle cx="50" cy="50" r="20" fill="none" stroke="rgba(184,174,252,0.12)" strokeWidth="0.3" strokeDasharray="1 2" />
        </svg>

        <ul className={styles.ring}>
          {cards.map((item, index) => {
            // Each card's orbit position + counter-rotation delay is derived
            // from its index, so any number of visible cards distributes
            // evenly around the ring without needing per-index CSS rules.
            const delay = `calc((${rotateSpeed} / ${count}) * -${index}s)`;
            const itemStyle = { animationDelay: delay } as CSSProperties;

            return (
              <li key={`${item.name}-${startIndex}-${index}`} style={itemStyle}>
                <div className={styles.card} style={itemStyle}>
                  <a href={item.href ?? "#"} className={styles["model-name"]}>
                    {item.name}
                  </a>
                  <p>{item.description}</p>
                </div>
              </li>
            );
          })}
        </ul>

        <div className={styles["center-circle"]} />
      </div>
    </div>
  );
}