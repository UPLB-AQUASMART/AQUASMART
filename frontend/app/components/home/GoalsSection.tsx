import { CloudRain, Mail, Radar, Sprout, Waves } from "lucide-react";
import type { ComponentType } from "react";

import { goals, type GoalIcon, type GoalItem } from "@/app/data/home";

import { SectionPill } from "./SectionPill";

const goalIcons: Record<GoalIcon, ComponentType<{ size?: number; strokeWidth?: number }>> = {
  soil: Sprout,
  weather: CloudRain,
  water: Waves,
  monitoring: Radar,
  notifications: Mail,
};

function splitHighlightedTitle(title: string, highlight: string) {
  const [before, after = ""] = title.split(highlight);
  return { before, after };
}

function GoalCard({ item }: { item: GoalItem }) {
  const Icon = goalIcons[item.icon];
  const { before, after } = splitHighlightedTitle(item.title, item.highlight);

  return (
    <article className="goal-card" tabIndex={0}>
      <div className="goal-icon">
        <Icon size={34} strokeWidth={1.7} />
      </div>
      <h3>
        {before}
        <span>{item.highlight}</span>
        {after}
      </h3>
      <p>{item.body}</p>
    </article>
  );
}

export function GoalsSection() {
  return (
    <section className="goals-section" id="about">
      <SectionPill>Our Goals</SectionPill>
      <div className="dark-frame goals-frame scroll-reveal">
        {/* <img className="frame-bg" src="/figma/goals-bg.png" alt="" /> */}
        <img className="goals-dots goals-dots-left" src="/assets/radial.svg" alt="" />
        <img className="goals-dots goals-dots-right" src="/assets/radial.svg" alt="" />
        <div className="goals-gif-wrap" aria-hidden="true">
          <img
            className="goals-gif"
            src="/assets/nsp-ezgif.com-gif-maker.gif"
            alt=""
          />
        </div>
        <div className="frame-copy">
          <h2>Water Intelligence</h2>
          <p>
            AQUASMART is an integrated water resources management initiative
            focused on strengthening the resilience and sustainability of
            rice-fish farming systems through groundwater monitoring,
            AI-assisted forecasting, and data-driven irrigation management.
          </p>
        </div>
        <div className="goal-grid">
          {goals.map((item) => (
            <GoalCard key={item.title} item={item} />
          ))}
          <div className="goal-card empty-card" />
        </div>
      </div>
    </section>
  );
}
