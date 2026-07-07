"use client";

import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Gauge,
  ListChecks,
  Target,
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

import styles from "./ModelViewsSection.module.css";
import { OptionMagnifier } from "./OptionMagnifier";

const modelViews = [
  {
    id: "side",
    title: "2D Side View",
    image: "/assets/simulation/model-side-view.png",
    options: [
      {
        title: "Water Quality Controls",
        image: "/assets/simulation/options-2d-view.png",
      },
    ],
    what:
      "Cross-section of the aquifer system showing layers, wells, screens, and groundwater levels with depth.",
    why:
      "Shows how groundwater moves through layers and where drawdown occurs across depth.",
    reads: [
      "Layer thickness and aquifer boundaries",
      "Monitoring well position and screen intervals",
      "Vertical drawdown behavior near the well",
    ],
    decisions: [
      "Check if the well screen intersects the correct aquifer layer",
      "Compare shallow and deep groundwater response",
      "Explain why pumping affects some depths more than others",
    ],
  },
  {
    id: "three",
    title: "3D View",
    image: "/assets/simulation/model-3d-view.png",
    options: [
      {
        title: "Active Well Selection",
        image: "/assets/simulation/options-3d-view.png",
      },
    ],
    what:
      "Overview of terrain, aquifer layers, wells, and simulated flow paths across the model area.",
    why: "Gives a complete picture of how groundwater moves through the system.",
    reads: [
      "Well locations across the site",
      "Terrain, aquifer blocks, and modeled surface features",
      "Directional flow paths between pumping and monitoring points",
    ],
    decisions: [
      "Choose which active well or monitoring scenario to inspect",
      "Understand how local pumping connects to wider flow patterns",
      "Spot relationships that are hard to see in a flat diagram",
    ],
  },
  {
    id: "top",
    title: "Top View",
    image: "/assets/simulation/model-top-view.png",
    options: [
      {
        title: "Aquifer Setup",
        image: "/assets/simulation/options-top-view-setup.png",
      },
      {
        title: "Simulation Results",
        image: "/assets/simulation/options-top-view-simulation.png",
      },
    ],
    what: "Hydraulic head contours and horizontal flow directions.",
    why: "Identifies flow patterns, recharge areas, and potential impact zones.",
    reads: [
      "Hydraulic head gradients from high to low values",
      "Groundwater flow arrows across model cells",
      "Well influence zones, stream cells, and contour spacing",
    ],
    decisions: [
      "Locate likely drawdown and influence areas",
      "Review how recharge, river, and pumping assumptions alter flow",
      "Compare setup inputs against MODFLOW result overlays",
    ],
  },
];

export function ModelViewsSection() {
  const [flippedView, setFlippedView] = useState<string | null>(null);

  return (
    <section className={styles.section} aria-labelledby="model-views-title">
      <div className={styles.shell}>
        <header className={styles.header}>
          <Eye aria-hidden="true" />
          <h2 id="model-views-title">Explore the 3 Modeling Views</h2>
        </header>

        {modelViews.map((view, index) => (
          <input
            className={styles.viewToggle}
            type="radio"
            name="model-view"
            id={`model-view-${view.id}`}
            defaultChecked={index === 0}
            key={view.id}
          />
        ))}

        <div className={styles.content}>
          <aside className={styles.explainer}>
            {modelViews.map((view) => (
              <div
                className={`${styles.explainerPane} ${styles[`${view.id}Pane`]}`}
                key={view.id}
              >
                <InfoBlock
                  icon={<Eye aria-hidden="true" />}
                  title="What you see"
                  body={view.what}
                />
                <InfoBlock
                  icon={<Target aria-hidden="true" />}
                  title="Why it matters"
                  body={view.why}
                />
                <InfoBlock
                  icon={<Gauge aria-hidden="true" />}
                  title="Model reads"
                  items={view.reads}
                />
                <InfoBlock
                  icon={<ListChecks aria-hidden="true" />}
                  title="Use it to decide"
                  items={view.decisions}
                />
              </div>
            ))}
          </aside>

          <div className={styles.previewPanel}>
            <div className={styles.previewStage}>
              {modelViews.map((view) => (
                <figure
                  className={`${styles.preview} ${styles[`${view.id}Pane`]}`}
                  key={view.id}
                >
                  <figcaption>{view.title}</figcaption>
                  <input
                    className={styles.flipToggle}
                    type="checkbox"
                    id={`model-view-${view.id}-flip`}
                    checked={flippedView === view.id}
                    onChange={(event) => {
                      setFlippedView(event.target.checked ? view.id : null);
                    }}
                  />
                  <label
                    className={styles.flipCard}
                    htmlFor={`model-view-${view.id}-flip`}
                    aria-label={`Flip ${view.title} card to show or hide available options`}
                  >
                    <span className={styles.flipInner}>
                      <span className={`${styles.flipFace} ${styles.flipFront}`}>
                        <span className={styles.modelImageSlot}>
                          <img
                            src={view.image}
                            alt={`${view.title} groundwater simulation preview`}
                          />
                        </span>
                        <span className={styles.flipHint}>
                          Click card to view available options
                        </span>
                      </span>
                      <span className={`${styles.flipFace} ${styles.flipBack}`}>
                        <span className={styles.optionsPanel}>
                          <OptionMagnifier forceActive={flippedView === view.id}>
                            <span className={styles.optionList}>
                              {view.options.map((option) => (
                                <span
                                  className={styles.optionCard}
                                  key={option.title}
                                >
                                  <strong>{option.title}</strong>
                                  <img
                                    src={option.image}
                                    alt={`${view.title} ${option.title} panel`}
                                  />
                                </span>
                              ))}
                            </span>
                          </OptionMagnifier>
                          <span className={styles.flipHint}>
                            Click card again to return to the model view
                          </span>
                        </span>
                      </span>
                    </span>
                  </label>
                </figure>
              ))}
            </div>

            <div className={styles.thumbnails} aria-label="Model view picker">
              <label
                className={`${styles.arrowButton} ${styles.sidePrev}`}
                htmlFor="model-view-top"
                aria-label="Previous model view"
                onClick={() => setFlippedView(null)}
              >
                <ChevronLeft aria-hidden="true" />
              </label>
              <label
                className={`${styles.arrowButton} ${styles.threePrev}`}
                htmlFor="model-view-side"
                aria-label="Previous model view"
                onClick={() => setFlippedView(null)}
              >
                <ChevronLeft aria-hidden="true" />
              </label>
              <label
                className={`${styles.arrowButton} ${styles.topPrev}`}
                htmlFor="model-view-three"
                aria-label="Previous model view"
                onClick={() => setFlippedView(null)}
              >
                <ChevronLeft aria-hidden="true" />
              </label>
              {modelViews.map((view) => (
                <label
                  className={`${styles.thumbnail} ${styles[`${view.id}Tab`]}`}
                  htmlFor={`model-view-${view.id}`}
                  key={view.id}
                  onClick={() => setFlippedView(null)}
                >
                  <span>{view.title}</span>
                  <img src={view.image} alt="" />
                </label>
              ))}
              <label
                className={`${styles.arrowButton} ${styles.sideNext}`}
                htmlFor="model-view-three"
                aria-label="Next model view"
                onClick={() => setFlippedView(null)}
              >
                <ChevronRight aria-hidden="true" />
              </label>
              <label
                className={`${styles.arrowButton} ${styles.threeNext}`}
                htmlFor="model-view-top"
                aria-label="Next model view"
                onClick={() => setFlippedView(null)}
              >
                <ChevronRight aria-hidden="true" />
              </label>
              <label
                className={`${styles.arrowButton} ${styles.topNext}`}
                htmlFor="model-view-side"
                aria-label="Next model view"
                onClick={() => setFlippedView(null)}
              >
                <ChevronRight aria-hidden="true" />
              </label>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoBlock({
  icon,
  title,
  body,
  items,
}: {
  icon: ReactNode;
  title: string;
  body?: string;
  items?: string[];
}) {
  return (
    <div className={styles.infoBlock}>
      <div className={styles.infoTitle}>
        {icon}
        <h4>{title}</h4>
      </div>
      {body ? <p>{body}</p> : null}
      {items ? (
        <ul>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
