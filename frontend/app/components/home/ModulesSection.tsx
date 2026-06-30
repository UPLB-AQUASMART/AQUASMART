"use client";

import gsap from "gsap";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import { learningModules } from "@/app/data/home";

import revealStyles from "./ScrollReveal.module.css";
import styles from "./ModulesSection.module.css";

export function ModulesSection() {
  const [isRevealed, setIsRevealed] = useState(false);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const loopModules = useMemo(
    () => [...learningModules, ...learningModules],
    [],
  );

  useEffect(() => {
    if (isRevealed) return;

    const cards = cardRefs.current.filter(Boolean);
    gsap.set(cards, {
      x: (index) => (index - 1) * 12,
      y: (index) => index * 8,
      rotate: (index) => [-5, 0, 5, -2, 3, -4][index] ?? 0,
      scale: (index) => 1 - index * 0.018,
      zIndex: (index) => learningModules.length - index,
    });
  }, [isRevealed]);

  useEffect(() => {
    if (!isRevealed || !carouselRef.current) return;

    const cards = cardRefs.current.filter(Boolean);
    gsap.fromTo(
      cards,
      { opacity: 0, y: 32, scale: 0.96 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.62,
        ease: "power3.out",
        stagger: 0.045,
      },
    );
  }, [isRevealed]);

  const revealDeck = () => {
    if (isRevealed) return;

    const cards = cardRefs.current.filter(Boolean);
    gsap.to(cards, {
      x: (index) => (index - 2.5) * 82,
      y: (index) => Math.abs(index - 2.5) * 10,
      rotate: 0,
      scale: 0.98,
      duration: 0.42,
      ease: "power2.out",
      stagger: 0.025,
      onComplete: () => setIsRevealed(true),
    });
  };

  return (
    <section
      className={`${styles["modules-section"]} ${revealStyles["scroll-reveal"]}`}
      id="modules"
      aria-labelledby="modules-title"
    >
      <div className={styles["section-pill"]}>Learning Modules</div>

      <div className={styles["section-copy"]}>
        <h2 id="modules-title">
          <span>Beneath</span>
          the Surface
        </h2>
        <p>
          Access learning modules and materials to better understand how we
          maximize the water from pump to crop.
        </p>
      </div>

      <div className={styles.wrapper}>
        {!isRevealed ? (
          <button
            className={styles.deck}
            onClick={revealDeck}
            type="button"
            aria-label="Open learning modules carousel"
          >
            {learningModules.map((module, index) => (
              <ModuleCard
                cardRef={(node) => {
                  cardRefs.current[index] = node;
                }}
                key={module.code}
                module={module}
              />
            ))}
          </button>
        ) : (
          <div className={styles["carousel-shell"]} ref={carouselRef}>
            <div className={styles["carousel-track"]}>
              {loopModules.map((module, index) => (
                <ModuleCard
                  cardRef={(node) => {
                    cardRefs.current[index] = node;
                  }}
                  isRevealed
                  key={`${module.code}-${index}`}
                  module={module}
                />
              ))}
            </div>
          </div>
        )}

        <p className={styles.hint}>
          {isRevealed ? "Hover on card to focus" : "Click the deck to browse modules"}
        </p>
      </div>

      <a className={styles["see-all"]} href="#modules">
        See All Materials <span aria-hidden="true">→</span>
      </a>
    </section>
  );
}

function ModuleCard({
  cardRef,
  isRevealed = false,
  module,
}: {
  cardRef: (node: HTMLElement | null) => void;
  isRevealed?: boolean;
  module: (typeof learningModules)[number];
}) {
  return (
    <article
      className={`${styles.card}${isRevealed ? ` ${styles.cardRevealed}` : ""}`}
      ref={cardRef}
    >
      <div className={styles.photo}>
        <Image src={module.image} alt="" fill sizes="320px" />
      </div>
      <div className={styles.desc}>
        <div className={styles["module-title-row"]}>
          <h3>{module.code}</h3>
          <span>{module.title}</span>
        </div>
        <p>{module.description}</p>
      </div>
    </article>
  );
}
