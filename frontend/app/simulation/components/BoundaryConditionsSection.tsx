"use client";

import { Settings } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import styles from "./BoundaryConditionsSection.module.css";

const boundaryCards = [
  {
    id: "grid",
    title: "Grid & Layers",
    image: "/assets/simulation/boundary-grid.png",
    what: "Divides the aquifer into a 3D grid of cells and layers.",
    why: "Organizes the subsurface so flow can be simulated accurately.",
    details: [
      "Splits the aquifer into rows, columns, and vertical layers so the model can solve groundwater movement cell by cell.",
      "Each layer can represent a different material, water-bearing zone, or confining unit.",
      "A clear grid makes simulated drawdown, recharge, and flow paths easier to compare across the site.",
    ],
  },
  {
    id: "recharge",
    title: "Recharge Boundary",
    image: "/assets/simulation/boundary-recharge.png",
    what: "Adds water to the aquifer from rainfall or infiltration.",
    why: "Provides the natural input that sustains groundwater levels.",
    details: [
      "Recharge controls how much water enters the groundwater system from rainfall, irrigation return flow, or surface infiltration.",
      "Higher recharge can soften drawdown near wells by replacing part of the pumped water.",
      "The boundary can be applied uniformly or by zones when the land surface has different recharge behavior.",
    ],
  },
  {
    id: "river",
    title: "River / Stream Boundary",
    image: "/assets/simulation/boundary-river.png",
    what: "Allows water to flow between the stream and aquifer.",
    why: "Streams can add water to or receive water from groundwater.",
    details: [
      "Stream boundaries let the model exchange water between a river channel and connected aquifer cells.",
      "The direction depends on the difference between river stage and groundwater head.",
      "This helps reveal whether nearby pumping may draw water from streams or discharge groundwater into them.",
    ],
  },
  {
    id: "pumping",
    title: "Pumping / Wells",
    image: "/assets/simulation/boundary-pumping.png",
    what: "Removes water from the aquifer through wells.",
    why: "Creates drawdown and affects nearby water levels.",
    details: [
      "Well boundaries define where water is extracted and how much discharge is applied during a scenario.",
      "The model uses these rates to calculate drawdown cones and changes in nearby hydraulic head.",
      "Monitoring wells can then be compared against simulated effects to understand pumping influence.",
    ],
  },
  {
    id: "soil",
    title: "Aquifer / Soil & Screens",
    image: "/assets/simulation/boundary-soil-screens.png",
    what: "Defines soil types, conductivity, and screened intervals.",
    why: "Controls how easily water moves and where wells can intercept it.",
    details: [
      "Aquifer materials set conductivity, storage, and the resistance water experiences as it moves through each layer.",
      "Screen intervals determine which layers a well can interact with during pumping or monitoring.",
      "Together, soil properties and screens control how vertical and horizontal flow appear in the simulation.",
    ],
  },
  {
    id: "importance",
    title: "Why Boundary Conditions Matter",
    image: "/assets/simulation/boundary-importance.png",
    what: "Sets the rules for how water enters, leaves, and flows.",
    why: "Shapes groundwater flow patterns and top-view results.",
    details: [
      "Boundary conditions are the assumptions that connect the modeled aquifer to the real system around it.",
      "They define inflows, outflows, layer behavior, and external controls that drive simulated results.",
      "When these assumptions are organized well, the model becomes easier to explain, test, and refine.",
    ],
  },
];

const autoScrollPixelsPerSecond = 62;
const resumeDelayMs = 520;

export function BoundaryConditionsSection() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [flippedCard, setFlippedCard] = useState<string | null>(null);
  const [resumeHold, setResumeHold] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frameRef = useRef<number | null>(null);
  const scrollRef = useRef(0);
  const lastFrameTime = useRef<number | null>(null);
  const isPausedRef = useRef(false);
  const isPaused = hoveredCard !== null || resumeHold;

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    function wrap(value: number, max: number) {
      return ((value % max) + max) % max;
    }

    function measureStep() {
      const firstCard = cardRefs.current[0];

      if (!firstCard) {
        return 0;
      }

      const carousel = carouselRef.current;
      const cardGap = carousel
        ? Number.parseFloat(
            getComputedStyle(carousel).getPropertyValue("--card-gap"),
          )
        : 0;

      return firstCard.offsetWidth + (Number.isFinite(cardGap) ? cardGap : 0);
    }

    function positionCards(timestamp: number) {
      const carousel = carouselRef.current;
      const step = measureStep();
      const trackWidth = step * boundaryCards.length;

      if (!carousel || !step || !trackWidth) {
        frameRef.current = requestAnimationFrame(positionCards);
        return;
      }

      if (lastFrameTime.current === null) {
        lastFrameTime.current = timestamp;
      }

      const deltaSeconds = (timestamp - lastFrameTime.current) / 1000;
      lastFrameTime.current = timestamp;

      if (!isPausedRef.current) {
        scrollRef.current = wrap(
          scrollRef.current + autoScrollPixelsPerSecond * deltaSeconds,
          trackWidth,
        );
      }

      cardRefs.current.forEach((card, index) => {
        if (!card) {
          return;
        }

        const rawX = index * step - scrollRef.current;
        let x = wrap(rawX, trackWidth);

        if (x > trackWidth - step) {
          x -= trackWidth;
        }

        card.style.transform = `translate3d(${x}px, 0, 0)`;
      });

      frameRef.current = requestAnimationFrame(positionCards);
    }

    frameRef.current = requestAnimationFrame(positionCards);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }

      if (resumeTimer.current) {
        clearTimeout(resumeTimer.current);
      }
    };
  }, []);

  function clearResumeTimer() {
    if (resumeTimer.current) {
      clearTimeout(resumeTimer.current);
      resumeTimer.current = null;
    }
  }

  function handlePointerEnter(instanceId: string) {
    clearResumeTimer();
    setResumeHold(false);
    setHoveredCard(instanceId);
  }

  function handlePointerLeave(instanceId: string) {
    setHoveredCard((current) => (current === instanceId ? null : current));

    if (flippedCard === instanceId) {
      setFlippedCard(null);
      setResumeHold(true);
      clearResumeTimer();
      resumeTimer.current = setTimeout(() => {
        setResumeHold(false);
        resumeTimer.current = null;
      }, resumeDelayMs);
    }
  }

  function handleCardClick(instanceId: string) {
    setFlippedCard((current) => (current === instanceId ? null : instanceId));
  }

  return (
    <section className={styles.section} aria-labelledby="boundary-title">
      <div className={styles.shell}>
        <header className={styles.header}>
          <Settings aria-hidden="true" />
          <div>
            <h2 id="boundary-title">Boundary Conditions & Model Parameters</h2>
            <p>
              Boundary conditions define how water enters, leaves, and interacts
              within the model. These assumptions control the flow patterns and
              results you see from the simulation.
            </p>
          </div>
        </header>
        <div
          className={styles.carousel}
          aria-label="Boundary conditions carousel"
        >
          <div className={styles.track} ref={carouselRef}>
            <div className={styles.cardGroup}>
              {boundaryCards.map((card, index) => (
                <BoundaryCarouselCard
                  card={card}
                  instanceId={card.id}
                  isFlipped={flippedCard === card.id}
                  key={card.id}
                  onClick={handleCardClick}
                  onPointerEnter={handlePointerEnter}
                  onPointerLeave={handlePointerLeave}
                  setCardRef={(node) => {
                    cardRefs.current[index] = node;
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BoundaryCarouselCard({
  card,
  instanceId,
  isFlipped,
  onClick,
  onPointerEnter,
  onPointerLeave,
  setCardRef,
}: {
  card: (typeof boundaryCards)[number];
  instanceId: string;
  isFlipped: boolean;
  onClick: (instanceId: string) => void;
  onPointerEnter: (instanceId: string) => void;
  onPointerLeave: (instanceId: string) => void;
  setCardRef: (node: HTMLElement | null) => void;
}) {
  return (
    <article
      className={styles.cardShell}
      ref={setCardRef}
      onPointerEnter={() => onPointerEnter(instanceId)}
      onPointerLeave={() => onPointerLeave(instanceId)}
    >
      <button
        className={`${styles.card} ${isFlipped ? styles.cardFlipped : ""}`}
        type="button"
        onClick={() => onClick(instanceId)}
        aria-pressed={isFlipped}
        aria-label={`${isFlipped ? "Hide" : "Show"} details for ${card.title}`}
      >
        <span className={styles.cardInner}>
          <span className={`${styles.cardFace} ${styles.cardFront}`}>
            <h3>{card.title}</h3>
            <img src={card.image} alt="" />
            <span className={styles.cardCopy}>
              <strong>What it does</strong>
              <span>{card.what}</span>
            </span>
            <span className={styles.cardCopy}>
              <strong>Why it matters</strong>
              <span>{card.why}</span>
            </span>
          </span>
          <span className={`${styles.cardFace} ${styles.cardBack}`}>
            <span className={styles.backHeader}>
              <span>Model detail</span>
              <strong>{card.title}</strong>
            </span>
            <span className={styles.detailList}>
              {card.details.map((detail) => (
                <span className={styles.detailItem} key={detail}>
                  {detail}
                </span>
              ))}
            </span>
            <span className={styles.backHint}>Click again to return</span>
          </span>
        </span>
      </button>
    </article>
  );
}
