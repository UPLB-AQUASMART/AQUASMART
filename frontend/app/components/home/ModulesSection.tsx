"use client";

import gsap from "gsap";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { learningModules } from "@/app/data/home";

import revealStyles from "./ScrollReveal.module.css";
import styles from "./ModulesSection.module.css";

export function ModulesSection() {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isCarouselRunning, setIsCarouselRunning] = useState(false);
  const deckCardRefs = useRef<Array<HTMLElement | null>>([]);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const loopModules = useMemo(() => [...learningModules, ...learningModules], []);

  const setDeckStack = () => {
    const cards = deckCardRefs.current.filter(Boolean);

    gsap.set(cards, {
      autoAlpha: 1,
      x: (index) => (index - 1) * 12,
      y: (index) => index * 8,
      rotate: (index) => [-5, 0, 5, -2, 3, -4][index] ?? 0,
      scale: (index) => 1 - index * 0.018,
      zIndex: (index) => learningModules.length - index,
    });
  };

  useEffect(() => {
    setDeckStack();

    if (carouselRef.current) {
      gsap.set(carouselRef.current, { autoAlpha: 0, y: 24 });
    }
  }, []);

  const getSpreadOffset = (index: number) => {
    const isMobile = window.matchMedia("(max-width: 720px)").matches;
    const cardWidth = isMobile ? 260 : 388;
    const gap = isMobile ? 20 : 48;
    const centerIndex = (learningModules.length - 1) / 2;

    return (index - centerIndex) * (cardWidth + gap);
  };

  const revealDeck = () => {
    if (isRevealed || isAnimating) return;

    setIsAnimating(true);
    setIsRevealed(true);
    setIsCarouselRunning(false);

    const cards = deckCardRefs.current.filter(Boolean);
    const timeline = gsap.timeline({
      defaults: { ease: "power4.out" },
      onComplete: () => setIsAnimating(false),
    });

    timeline
      .to(cards, {
        autoAlpha: 1,
        x: (index) => getSpreadOffset(index),
        y: 0,
        rotate: 0,
        scale: 1,
        duration: 0.86,
        stagger: 0.075,
      })
      .to({}, { duration: 0.18 })
      .to(
        carouselRef.current,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.36,
        },
        "-=0.02",
      )
      .call(() => setIsCarouselRunning(true))
      .to(
        cards,
        {
          autoAlpha: 0,
          duration: 0.24,
          stagger: 0.02,
        },
        "-=0.18",
      );
  };

  const collapseDeck = () => {
    if (!isRevealed || isAnimating) return;

    setIsAnimating(true);
    setIsCarouselRunning(false);

    const cards = deckCardRefs.current.filter(Boolean);
    const timeline = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: () => {
        setIsRevealed(false);
        setIsAnimating(false);
      },
    });

    timeline
      .to(carouselRef.current, {
        autoAlpha: 0,
        y: 24,
        duration: 0.28,
      })
      .set(cards, {
        autoAlpha: 1,
        x: (index) => getSpreadOffset(index),
        y: 0,
        rotate: 0,
        scale: 1,
      })
      .to(
        cards,
        {
          x: (index) => (index - 1) * 12,
          y: (index) => index * 8,
          rotate: (index) => [-5, 0, 5, -2, 3, -4][index] ?? 0,
          scale: (index) => 1 - index * 0.018,
          duration: 0.62,
          stagger: 0.055,
          zIndex: (index) => learningModules.length - index,
        },
        "-=0.06",
      );
  };

  const handleCollapsedCardClick = () => {
    revealDeck();
  };

  const openModulesPage = () => {
    router.push("/modules");
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
        <div
          aria-label="Open learning modules carousel"
          className={`${styles.deck}${isRevealed ? ` ${styles["deck-unpacked"]}` : ""}`}
          onClick={handleCollapsedCardClick}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              handleCollapsedCardClick();
            }
          }}
          role="button"
          tabIndex={isRevealed ? -1 : 0}
        >
          {learningModules.map((module, index) => (
            <ModuleCard
              cardRef={(node) => {
                deckCardRefs.current[index] = node;
              }}
              key={module.code}
              module={module}
              onClick={handleCollapsedCardClick}
            />
          ))}
        </div>

        <div className={styles["carousel-shell"]} ref={carouselRef}>
          <div
            className={`${styles["carousel-track"]}${
              isCarouselRunning ? ` ${styles["carousel-running"]}` : ""
            }`}
          >
            {loopModules.map((module, index) => (
              <ModuleCard
                isRevealed
                key={`${module.code}-${index}`}
                module={module}
                onClick={openModulesPage}
              />
            ))}
          </div>
        </div>

        {isRevealed ? (
          <button
            className={styles["collapse-button"]}
            disabled={isAnimating}
            onClick={collapseDeck}
            type="button"
          >
            Collapse deck
          </button>
        ) : null}

        <p className={styles.hint}>
          {isRevealed
            ? "Hover on a card to focus"
            : "Click the deck to browse modules"}
        </p>
      </div>

      {/* <a className={styles["see-all"]} href="/modules">
        See All Materials <span aria-hidden="true">→</span>
      </a> */}
    </section>
  );
}

function ModuleCard({
  cardRef,
  isRevealed = false,
  module,
  onClick,
}: {
  cardRef?: (node: HTMLElement | null) => void;
  isRevealed?: boolean;
  module: (typeof learningModules)[number];
  onClick?: () => void;
}) {
  return (
    <article
      className={`${styles.card}${isRevealed ? ` ${styles.cardRevealed}` : ""}`}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.();
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          event.stopPropagation();
          onClick?.();
        }
      }}
      ref={cardRef}
      role="button"
      tabIndex={0}
    >
      <div className={styles.photo}>
        <Image src={module.image} alt="" fill sizes="388px" />
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
