"use client";

import { Eye, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";

import frameStyles from "./SimulationModelEntry.module.css";

type SimulationModelEntryProps = {
  heroCopy: string;
  styles: Record<string, string>;
};

export function SimulationModelEntry({
  heroCopy,
  styles,
}: SimulationModelEntryProps) {
  const [isOpening, setIsOpening] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);

  useEffect(() => {
    if (!viewerOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [viewerOpen]);

  function openViewer() {
    if (isOpening || viewerOpen) return;
    setIsOpening(true);
    window.setTimeout(() => {
      setViewerOpen(true);
      setIsOpening(false);
    }, 560);
  }

  function closeViewer() {
    setViewerOpen(false);
  }

  return (
    <>
      <section
        className={`${styles["idw-map-hero"]} ${
          isOpening ? styles["idw-map-hero-entering"] : ""
        }`}
      >
        <img className={styles["idw-map-image"]} src="/figma/idw-map.png" alt="" />
        <div className={styles["idw-map-content"]}>
          <h1>
            Spatial Drawdown
            <span>Map</span>
          </h1>
          <div className={styles["idw-map-bottom"]}>
            <p>{heroCopy}</p>
            <button
              className={styles["idw-view-button"]}
              type="button"
              aria-label="Open groundwater model viewer"
              disabled={isOpening}
              onClick={openViewer}
            >
              {isOpening ? (
                <Loader2 aria-hidden="true" className={frameStyles.spinner} />
              ) : (
                <Eye aria-hidden="true" size={31} strokeWidth={2.4} />
              )}
            </button>
          </div>
        </div>
      </section>

      {viewerOpen ? (
        <div className={frameStyles.overlay} role="dialog" aria-modal="true">
          <div className={frameStyles.toolbar}>
            <div>
              <strong>AQUASMART Groundwater Model</strong>
              <span>FloPy/MODFLOW-ready scenario viewer</span>
            </div>
            <button type="button" onClick={closeViewer}>
              <X aria-hidden="true" size={19} strokeWidth={2.4} />
              Back to simulation
            </button>
          </div>
          <iframe
            className={frameStyles.viewerFrame}
            src="/groundwater-viewer/index.html"
            title="AQUASMART 3D groundwater simulation viewer"
          />
        </div>
      ) : null}
    </>
  );
}
