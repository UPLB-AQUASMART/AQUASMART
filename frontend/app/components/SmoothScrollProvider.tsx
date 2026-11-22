"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      // higher = more "floaty"/lagged smoothing, lower = snappier.
      duration: 0.8,
      easing: (t: number) => 1 - Math.pow(1 - t, 3), // cubic ease-out
      smoothWheel: true,
      touchMultiplier: 1.5,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const updateLenis = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(updateLenis);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useLayoutEffect(() => {
    const resetScroll = () => {
      const lenis = lenisRef.current;
      const hash = window.location.hash;
      const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;

      lenis?.resize();

      if (target) {
        // Cross-page anchor links (e.g. /partners#partner-spotlight).
        if (lenis) lenis.scrollTo(target, { immediate: true, force: true });
        else target.scrollIntoView({ behavior: "instant" as ScrollBehavior });
        return;
      }

      // Stop any in-flight smooth scroll from the previous page and jump to top.
      lenis?.stop();
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
      lenis?.scrollTo(0, { immediate: true, force: true });
      lenis?.start();
    };

    resetScroll();

    // Re-apply after the new page has painted/laid out, since Next.js and
    // late-mounting content can shift the position after the first reset.
    let frame2 = 0;
    const frame1 = requestAnimationFrame(() => {
      resetScroll();
      frame2 = requestAnimationFrame(() => {
        resetScroll();
        ScrollTrigger.refresh();
      });
    });

    return () => {
      cancelAnimationFrame(frame1);
      cancelAnimationFrame(frame2);
    };
  }, [pathname]);

  return <>{children}</>;
}
