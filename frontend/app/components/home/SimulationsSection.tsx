import { simulations } from "@/app/data/home";

import { SectionPill } from "./SectionPill";

export function SimulationsSection() {
  return (
    <section className="simulations-section" id="simulations">
      <SectionPill>All Simulations</SectionPill>
      <div className="dark-frame simulations-frame scroll-reveal">
        <img className="frame-bg" src="/figma/simulations-bg.png" alt="" />
        <div className="frame-copy">
          <h2>Simulate How We Operate</h2>
          <p>
            AQUASMART mini helps make water system management familiar to users
            through simplified groundwater mapping, drawdown behavior, and
            weather-linked irrigation decisions.
          </p>
        </div>
        <div className="simulation-grid">
          {simulations.map((simulation) => (
            <a className="simulation-card" href={simulation.href} key={simulation.title}>
              <h3>
                {simulation.title} <span>{simulation.highlight}</span>
              </h3>
              <img src={simulation.image} alt="" />
              <p>{simulation.body}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
