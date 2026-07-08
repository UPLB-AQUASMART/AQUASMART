"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

import styles from "./WaterSavingScaleSection.module.css";

gsap.registerPlugin(ScrollTrigger);

export function WaterSavingScaleSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const numberRef = useRef<HTMLSpanElement | null>(null);
  const imagePanelRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const leftContentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const number = numberRef.current;

    if (!section || !number) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      number.textContent = "70";
      gsap.set(`.${styles.heading}`, { color: "#91a052" });
      gsap.set(imagePanelRef.current, { xPercent: 50 });
      gsap.set(imageRef.current, { xPercent: -40 });
      gsap.set([`.${styles.boxOne}`, `.${styles.boxTwo}`], { scale: 1 });
      gsap.set(`.${styles.boxThree}`, { scaleY: 0.7 });
      gsap.set(`.${styles.boxFour}`, { scaleX: 1 });
      gsap.set(leftContentRef.current, { opacity: 1 });
      return;
    }

    const context = gsap.context(() => {
      const counter = { value: 0 };

      gsap.set(leftContentRef.current, { opacity: 0, y: 16 });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          pin: true,
          end: "+=1500",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      timeline
        .to(counter, {
          value: 70,
          duration: 90,
          snap: { value: 1 },
          onUpdate: () => {
            number.textContent = String(Math.round(counter.value));
          },
        })
        .to(
          `.${styles.heading}`,
          {
            duration: 60,
            color: "#91a052",
          },
          0,
        )
        .to(
          imagePanelRef.current,
          {
            xPercent: 50,
            duration: 20,
          },
          0,
        )
        .to(
          imageRef.current,
          {
            xPercent: -40,
            duration: 20,
          },
          0,
        )
        .to(
          leftContentRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 12,
            ease: "power1.out",
          },
          20,
        )
        .to(
          imageRef.current,
          {
            transformOrigin: "bottom center",
            scale: 0.9,
            duration: 70,
          },
          30,
        )
        .to(
          `.${styles.boxOne}`,
          {
            scaleY: 1,
            duration: 10,
          },
          30,
        )
        .to(
          `.${styles.boxTwo}`,
          {
            scaleX: 1,
            duration: 10,
          },
          40,
        )
        .to(
          `.${styles.boxThree}`,
          {
            scaleY: 0.7,
            duration: 10,
          },
          50,
        )
        .to(
          `.${styles.boxFour}`,
          {
            scaleX: 1,
            duration: 10,
          },
          60,
        );
    }, section);

    return () => context.revert();
  }, []);

  return (
    <section className={styles.section} ref={sectionRef}>
      <div className={styles.divider} />
      <div className={`${styles.box} ${styles.boxOne}`} />
      <div className={`${styles.box} ${styles.boxTwo}`} />
      <div className={`${styles.box} ${styles.boxThree}`} />
      <div className={`${styles.box} ${styles.boxFour}`} />

      <div className={styles.imagePanel} ref={imagePanelRef}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.image}
          ref={imageRef}
          // src="https://assets.codepen.io/2479807/field.jpeg"
          // src="https://www.twl-irrigation.com/wp-content/uploads/2021/12/Crop-Irrigation.jpg"
          // src="https://www.agrivi.com/wp-content/uploads/2022/08/wepik-photo-mode-2022729-171433.jpeg"
          alt="Green agricultural field"
          src="https://blogmedia.testbook.com/blog/wp-content/uploads/2023/08/surface-irrigation-compressed-e2b5850c.webp"
        />
      </div>

      <div className={styles.container}>
        <div className={styles.imageScale}>
          <div className={styles.left} ref={leftContentRef}>
            <span className={styles.topline}>Our solutions use</span>
            <h2 className={styles.heading}>
              <span ref={numberRef}>0</span>% <br />
              less water
            </h2>
            <p>
              Over 600 gallons of water can be wasted every minute by using outdated irrigation
              methods. AQUASMART mini helps reduce water waste with smarter monitoring,
              weather-aware recommendations, and data-guided decisions.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
