"use client";

import { Leaf } from "lucide-react";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { parameterCards, parameterNames } from "@/app/data/home";
import revealStyles from "./ScrollReveal.module.css";
import styles from "./ParametersSection.module.css";

const MOBILE_PARAMETER_DELAY_MS = 4500;

export function ParametersSection() {
  const [activeParameter, setActiveParameter] = useState(parameterCards[0].active);
  const [previousParameter, setPreviousParameter] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const transitionTimer = useRef<number | null>(null);

  const activeCard = useMemo(
    () =>
      parameterCards.find((card) => card.active === activeParameter) ??
      parameterCards[0],
    [activeParameter],
  );

  const previousCard = useMemo(
    () =>
      previousParameter
        ? parameterCards.find((card) => card.active === previousParameter)
        : null,
    [previousParameter],
  );

  const activeParameterIndex = Math.max(
    0,
    parameterNames.indexOf(activeParameter),
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 720px)");
    const updateViewport = () => setIsMobile(mediaQuery.matches);

    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);

    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.35 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    return () => {
      if (transitionTimer.current) {
        window.clearTimeout(transitionTimer.current);
      }
    };
  }, []);

  const handleParameterChange = useCallback((parameter: string) => {
    if (parameter === activeParameter) return;

    if (transitionTimer.current) {
      window.clearTimeout(transitionTimer.current);
    }

    setPreviousParameter(activeParameter);
    setActiveParameter(parameter);
    setIsTransitioning(true);

    transitionTimer.current = window.setTimeout(() => {
      setIsTransitioning(false);
      setPreviousParameter(null);
    }, 640);
  }, [activeParameter]);

  useEffect(() => {
    if (!isMobile || !isInView) return;

    const autoRotateTimer = window.setTimeout(() => {
      const nextIndex = (activeParameterIndex + 1) % parameterNames.length;
      handleParameterChange(parameterNames[nextIndex]);
    }, MOBILE_PARAMETER_DELAY_MS);

    return () => window.clearTimeout(autoRotateTimer);
  }, [activeParameterIndex, handleParameterChange, isInView, isMobile]);

  const renderMedia = (className: string, source: string) => {
    if (source.endsWith(".mp4") || source.endsWith(".webm")) {
      return (
        <video
          aria-hidden="true"
          autoPlay
          className={className}
          key={source}
          loop
          muted
          playsInline
          src={source}
        />
      );
    }

    return <img className={className} src={source} alt="" key={source} />;
  };

  return (
    <section
      className={`${styles["parameters-section"]} ${revealStyles["scroll-reveal"]}`}
      data-mobile-auto-advance={isMobile ? "true" : undefined}
      id="parameters"
      ref={sectionRef}
    >
      <article
        className={`${styles["parameters-card"]}${
          isTransitioning ? ` ${styles["parameter-transitioning"]}` : ""
        }`}
      >
        {previousCard
          ? renderMedia(
              `${styles["parameters-card-media"]} ${styles["parameter-card-media-previous"]}`,
              previousCard.image,
            )
          : null}
        {renderMedia(`${styles["parameters-card-media"]} ${styles["parameter-card-media-current"]}`, activeCard.image)}
        <div className={styles["parameters-card-overlay"]} />
        <img
          className={`${styles["parameters-radial"]} ${styles["parameters-radial-left"]}`}
          src="/assets/radial.svg"
          alt=""
        />
        <img
          className={`${styles["parameters-radial"]} ${styles["parameters-radial-right"]}`}
          src="/assets/radial.svg"
          alt=""
        />
        <img
          className={`${styles["parameters-radial"]} ${styles["parameters-radial-bottom"]}`}
          src="/assets/radial.svg"
          alt=""
        />
        <div className={`${styles["parameters-card-content"]} ${revealStyles["parameters-card-content"]}`}>
          <h2>Parameters We Track</h2>

          <div
            className={styles["parameter-switches"]}
            aria-label="Water quality parameters"
            style={
              {
                "--parameter-active-index": activeParameterIndex,
              } as CSSProperties
            }
          >
            <div className={styles["parameter-active-marker"]} aria-hidden="true">
              <span className={styles["parameter-active-bar"]} />
              <Leaf size={24} strokeWidth={2.25} />
            </div>
            {parameterNames.map((parameter) => {
              const isActive = parameter === activeParameter;

              return (
                <button
                  aria-pressed={isActive}
                  className={isActive ? styles.active : undefined}
                  key={parameter}
                  onClick={() => handleParameterChange(parameter)}
                  type="button"
                >
                  <span>{parameter}</span>
                </button>
              );
            })}
          </div>

          <p className={styles["parameter-description"]} key={activeCard.active}>
            <Leaf aria-hidden="true" size={24} strokeWidth={2.25} />
            <span>{activeCard.description}</span>
          </p>
        </div>
      </article>
    </section>
  );
}
