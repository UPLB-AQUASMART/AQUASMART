"use client";

import { useEffect } from "react";

export function ScrollRevealInit() {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>(".scroll-reveal"));

    if (!elements.length) {
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion || !("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const revealVisible = () => {
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

      elements.forEach((element) => {
        if (element.classList.contains("is-visible")) {
          return;
        }

        const rect = element.getBoundingClientRect();
        const entersViewport = rect.top < viewportHeight * 0.92;

        if (entersViewport) {
          element.classList.add("is-visible");
        }
      });
    };

    let ticking = false;
    const scheduleReveal = () => {
      if (ticking) {
        return;
      }

      ticking = true;
      window.requestAnimationFrame(() => {
        revealVisible();
        ticking = false;
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.18,
      },
    );

    elements.forEach((element) => observer.observe(element));
    revealVisible();
    window.addEventListener("scroll", scheduleReveal, { passive: true });
    window.addEventListener("resize", scheduleReveal);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", scheduleReveal);
      window.removeEventListener("resize", scheduleReveal);
    };
  }, []);

  return null;
}
