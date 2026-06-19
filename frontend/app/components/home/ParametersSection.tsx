"use client";

import { Leaf } from "lucide-react";
import { useMemo, useState } from "react";

import { parameterCards, parameterNames } from "@/app/data/home";

export function ParametersSection() {
  const [activeParameter, setActiveParameter] = useState(parameterCards[0].active);

  const activeCard = useMemo(
    () =>
      parameterCards.find((card) => card.active === activeParameter) ??
      parameterCards[0],
    [activeParameter],
  );

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
    <section className="parameters-section">
      <article className="parameters-card scroll-reveal">
        {renderMedia("parameters-card-media", activeCard.image)}
        <div className="parameters-card-overlay" />
        <img
          className="parameters-radial parameters-radial-left"
          src="/assets/radial.svg"
          alt=""
        />
        <img
          className="parameters-radial parameters-radial-right"
          src="/assets/radial.svg"
          alt=""
        />
        <img
          className="parameters-radial parameters-radial-bottom"
          src="/assets/radial.svg"
          alt=""
        />
        <div className="parameters-card-content">
          <h2>Parameters We Track</h2>

          <div className="parameter-switches" aria-label="Water quality parameters">
            {parameterNames.map((parameter) => {
              const isActive = parameter === activeCard.active;

              return (
                <button
                  aria-pressed={isActive}
                  className={isActive ? "active" : undefined}
                  key={parameter}
                  onClick={() => setActiveParameter(parameter)}
                  type="button"
                >
                  <span className="parameter-active-bar" aria-hidden="true" />
                  <Leaf aria-hidden="true" size={24} strokeWidth={2.25} />
                  <span>{parameter}</span>
                </button>
              );
            })}
          </div>

          <p className="parameter-description">
            <Leaf aria-hidden="true" size={24} strokeWidth={2.25} />
            <span>{activeCard.description}</span>
          </p>
        </div>
      </article>
    </section>
  );
}
