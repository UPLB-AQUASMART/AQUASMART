"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useEffect } from "react";

gsap.registerPlugin(ScrollTrigger);

/**
 * Wraps the app in a smoothed virtual scroll powered by Lenis, synced to
 * GSAP's ticker and ScrollTrigger. This smooths ALL scrolling on the page
 * (not just the GSAP timelines), which is the bulk of what gives sites like
 * helixearth.com their fluid, lagged-trailing feel.
 *
 * Mount this once near the root of the app (e.g. in app/layout.tsx),
 * wrapping `children`.
 */
export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const lenis = new Lenis({
      // Higher = more "floaty"/lagged smoothing, lower = snappier.
      // 1.0–1.2 is a good starting point for a Helix-style feel.
      duration: 1.1,
      easing: (t: number) => 1 - Math.pow(1 - t, 3), // cubic ease-out
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    // Let ScrollTrigger know whenever Lenis moves the page.
    lenis.on("scroll", ScrollTrigger.update);

    // Drive Lenis from GSAP's own rAF loop so they never fall out of sync.
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove((time) => {
        lenis.raf(time * 1000);
      });
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
