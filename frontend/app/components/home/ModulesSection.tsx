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
  const deckCardRefs = useRef<Array<HTMLElement | null>>([]);
  const carouselShellRef = useRef<HTMLDivElement | null>(null);
  const carouselTrackRef = useRef<HTMLDivElement | null>(null);
  const marqueeTlRef = useRef<gsap.core.Timeline | null>(null);
  const router = useRouter();
  const loopModules = useMemo(() => [...learningModules, ...learningModules], []);

  const getCardMetrics = () => {
    const isMobile = window.matchMedia("(max-width: 720px)").matches;
    const cardWidth = isMobile ? 260 : 388;
    const gap = isMobile ? 20 : 48;
    const step = cardWidth + gap;
    const centerIndex = (learningModules.length - 1) / 2;

    return { cardWidth, gap, step, centerIndex };
  };

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

    if (carouselShellRef.current) {
      gsap.set(carouselShellRef.current, { autoAlpha: 0 });
      carouselShellRef.current.style.display = "none";
    }
  }, []);

  const getSpreadOffset = (index: number) => {
    const { step, centerIndex } = getCardMetrics();
    return (index - centerIndex) * step;
  };

  
  const getAlignedTrackX = () => {
    const { cardWidth, step, centerIndex } = getCardMetrics();
    const viewportCenterX = document.documentElement.clientWidth / 2;

    return viewportCenterX - centerIndex * step - cardWidth / 2;
  };

  const stopMarquee = () => {
    marqueeTlRef.current?.kill();
    marqueeTlRef.current = null;
  };

  const startMarquee = () => {
    const track = carouselTrackRef.current;
    if (!track) return;

    const { step } = getCardMetrics();
    const loopWidth = step * learningModules.length;
    const alignedX = getAlignedTrackX();
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    stopMarquee();
    gsap.set(track, { x: alignedX });

    if (prefersReducedMotion) return;

    marqueeTlRef.current = gsap.timeline({ repeat: -1 }).fromTo(
      track,
      { x: alignedX },
      { x: alignedX - loopWidth, duration: loopWidth / 70, ease: "none" },
    );
  };

  const revealDeck = () => {
    if (isRevealed || isAnimating) return;

    setIsAnimating(true);
    setIsRevealed(true);

    const cards = deckCardRefs.current.filter(Boolean);
    const shell = carouselShellRef.current;

    const timeline = gsap.timeline({
      defaults: { ease: "power4.out" },
    });

    timeline
      .to(cards, {
        autoAlpha: 1,
        x: (index) => getSpreadOffset(index),
        y: 0,
        rotate: 0,
        scale: 1,
        duration: 0.9,
        stagger: {
          each: 0.07,
          from: "center",
        },
        ease: "power3.inOut",
      })
      .call(() => {

        gsap.killTweensOf(cards);
        if (shell) gsap.killTweensOf(shell);

        cards.forEach((card) => {
          (card as HTMLElement).style.transition = "none";
        });
        if (shell) shell.style.transition = "none";

        startMarquee();
        if (shell) {
          shell.style.display = "";
          gsap.set(shell, { autoAlpha: 1 });
        }
        gsap.set(cards, { autoAlpha: 0 });

        cards.forEach((card) => {
          (card as HTMLElement).style.display = "none";
        });

  
        void (shell ?? cards[0])?.offsetHeight;

        requestAnimationFrame(() => {
          cards.forEach((card) => {
            (card as HTMLElement).style.transition = "";
          });
          if (shell) shell.style.transition = "";
        });

        setIsAnimating(false);
      });
  };

  const collapseDeck = () => {
    if (!isRevealed || isAnimating) return;

    setIsAnimating(true);
    stopMarquee();

    const cards = deckCardRefs.current.filter(Boolean);
    const shell = carouselShellRef.current;

    if (shell) {
      gsap.set(shell, { autoAlpha: 0 });
      shell.style.display = "none";
    }

    cards.forEach((card) => {
      (card as HTMLElement).style.display = "";
    });

    gsap.set(cards, {
      autoAlpha: 1,
      x: (index) => getSpreadOffset(index),
      y: 0,
      rotate: 0,
      scale: 1,
    });

    const timeline = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: () => {
        setIsRevealed(false);
        setIsAnimating(false);
      },
    });

    timeline.to(cards, {
      x: (index) => (index - 1) * 12,
      y: (index) => index * 8,
      rotate: (index) => [-5, 0, 5, -2, 3, -4][index] ?? 0,
      scale: (index) => 1 - index * 0.018,
      duration: 0.7,
      stagger: {
        each: 0.06,
        from: "center",
      },
      ease: "power3.inOut",
      zIndex: (index) => learningModules.length - index,
    });
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

        <div
          className={styles["carousel-shell"]}
          onMouseEnter={() => marqueeTlRef.current?.pause()}
          onMouseLeave={() => marqueeTlRef.current?.play()}
          ref={carouselShellRef}
        >
          <div className={styles["carousel-track"]} ref={carouselTrackRef}>
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
        <Image
          src={module.image}
          alt=""
          fill
          sizes="388px"
          loading={isRevealed ? "eager" : undefined}
        />
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