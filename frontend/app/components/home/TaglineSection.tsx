"use client";

import { useEffect, useRef } from "react";

export function TaglineSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) {
      return;
    }

    let frame = 0;

    const updateProgress = () => {
      frame = 0;
      const pinStart = section.offsetTop;
      const pinEnd = section.offsetTop + section.offsetHeight - window.innerHeight;
      const travel = Math.max(1, pinEnd - pinStart);
      const rawProgress = Math.min(1, Math.max(0, (window.scrollY - pinStart) / travel));
      const progress = Math.min(1, Math.max(0, (rawProgress - 0.08) / 0.92));
      const fill = Math.min(1, Math.max(0, (progress - 0.04) / 0.52));
      const fillFarm = Math.min(1, fill / 0.48);
      const fillEnvironment = Math.min(1, Math.max(0, (fill - 0.42) / 0.58));
      const zoom = Math.min(1, Math.max(0, (progress - 0.62) / 0.38));
      const background = Math.min(1, Math.max(0, (progress - 0.5) / 0.4));
      const vanish = Math.min(1, Math.max(0, (zoom - 0.68) / 0.32));
      const maxScale = window.innerWidth < 720 ? 11 : window.innerWidth < 1100 ? 13 : 16;
      const offset = window.innerWidth < 720 ? 20 : window.innerWidth < 1100 ? 24 : 28;
      const pinState = window.scrollY < pinStart ? "before" : window.scrollY > pinEnd ? "after" : "pinned";

      section.dataset.pin = pinState;
      section.style.setProperty("--tagline-progress", progress.toFixed(4));
      section.style.setProperty("--tagline-fill", fill.toFixed(4));
      section.style.setProperty("--tagline-farm-clip", `${((1 - fillFarm) * 100).toFixed(2)}%`);
      section.style.setProperty("--tagline-environment-clip", `${((1 - fillEnvironment) * 100).toFixed(2)}%`);
      section.style.setProperty("--tagline-zoom", zoom.toFixed(4));
      section.style.setProperty("--tagline-bg", background.toFixed(4));
      section.style.setProperty("--tagline-vanish", vanish.toFixed(4));
      section.style.setProperty("--tagline-text-opacity", (1 - vanish).toFixed(4));
      section.style.setProperty("--tagline-blur", `${(vanish * 4).toFixed(2)}px`);
      section.style.setProperty("--tagline-scale", (1 + zoom * (maxScale - 1)).toFixed(4));
      section.style.setProperty("--tagline-y", `${(-offset * zoom).toFixed(3)}vh`);
    };

    const requestUpdate = () => {
      if (frame) {
        return;
      }
      frame = window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  return (
    <section className="tagline-section" ref={sectionRef}>
      <div className="tagline-sticky scroll-reveal">
        <h2 className="tagline-heading" aria-label="For Farmers For Environment">
          <span className="tagline-layer tagline-layer-base" aria-hidden="true">
            <span className="tagline-line-farm">For Farmers</span>
            <strong className="tagline-line-environment">For Environment</strong>
          </span>
          <span className="tagline-layer tagline-layer-fill" aria-hidden="true">
            <span className="tagline-line-farm">For Farmers</span>
            <strong className="tagline-line-environment">For Environment</strong>
          </span>
        </h2>
      </div>
    </section>
  );
}
