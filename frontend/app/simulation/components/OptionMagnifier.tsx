"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

import styles from "./OptionMagnifier.module.css";

type LensPosition = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function OptionMagnifier({
  children,
  forceActive = false,
}: {
  children: ReactNode;
  forceActive?: boolean;
}) {
  const frameRef = useRef<HTMLSpanElement>(null);
  const [position, setPosition] = useState<LensPosition>({
    x: 0,
    y: 0,
    width: 1,
    height: 1,
  });
  const [isPointerActive, setIsPointerActive] = useState(false);
  const isActive = forceActive || isPointerActive;

  function updateLensPosition(clientX: number, clientY: number) {
    const frame = frameRef.current;

    if (!frame) {
      return;
    }

    const rect = frame.getBoundingClientRect();

    setPosition({
      x: clientX - rect.left,
      y: clientY - rect.top,
      width: rect.width,
      height: rect.height,
    });
  }

  useEffect(() => {
    if (!forceActive) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      const frame = frameRef.current;

      if (!frame) {
        return;
      }

      const rect = frame.getBoundingClientRect();

      setPosition({
        x: rect.width / 2,
        y: rect.height / 2,
        width: rect.width,
        height: rect.height,
      });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [forceActive]);

  return (
    <span
      className={`${styles.frame} ${isActive ? styles.frameActive : ""}`}
      ref={frameRef}
      onPointerEnter={(event) => {
        updateLensPosition(event.clientX, event.clientY);
        setIsPointerActive(true);
      }}
      onPointerMove={(event) => updateLensPosition(event.clientX, event.clientY)}
      onPointerLeave={() => setIsPointerActive(false)}
      style={
        {
          "--lens-x": `${position.x}px`,
          "--lens-y": `${position.y}px`,
          "--frame-width": `${position.width}px`,
          "--frame-height": `${position.height}px`,
        } as CSSProperties
      }
    >
      <span className={styles.content}>{children}</span>
      <span className={styles.lens} aria-hidden="true">
        <span className={styles.lensViewport}>
          <span className={styles.lensContent}>{children}</span>
        </span>
      </span>
    </span>
  );
}
