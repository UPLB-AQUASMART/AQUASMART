"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";

const teamMembers = [
  {
    name: "Leunell Chris M. Buela",
    role: "Project Manager & Technical Lead",
    bio: "Assistant Professor at UPLB specializing in water science, climate adaptation, and AI-supported decision tools.",
    tags: ["Water Science", "AI Decision Tools", "Sustainability"],
    image: "/assets/team/team-buela.png",
    color: "#4a8996",
  },
  {
    name: "Jastine Mae J. Galang",
    role: "Field Coordinator & Tech Specialist",
    bio: "Expert in climate-resilient water systems using GIS, remote sensing, and emerging AI applications.",
    tags: ["GIS Mapping", "Remote Sensing", "AI Apps"],
    image: "/assets/team/team-galang.png",
    color: "#57c784",
  },
  {
    name: "Grace C. Maligaya",
    role: "Outreach & Water Quality Specialist",
    bio: "Specializing in sustainable water management strategies and science-based monitoring for long-term protection.",
    tags: ["Water Quality", "Outreach", "Science"],
    image: "/assets/team/team-maligaya.png",
    color: "#f6c344",
  },
  {
    name: "Jerome G. Perez",
    role: "Project Coordinator & Data",
    bio: "Registered Agricultural Engineer focusing on groundwater hydrology and solar-powered irrigation development.",
    tags: ["Engineering", "Solar Tech", "Hydrology"],
    image: "/assets/team/team-perez.png",
    color: "#4a8996",
  },
  {
    name: "Alea Fate E. Borlaza",
    role: "Communications & Irrigation Planning",
    bio: "Dedicated to climate-responsive water management and bridging data analytics with practical irrigation planning.",
    tags: ["Communications", "Irrigation", "Data"],
    image: "/assets/team/team-borlaza.png",
    color: "#57c784",
  },
];

const partnerLogos = [
  "/assets/partners/partner-8.png",
  "/assets/partners/partner-7.png",
  "/assets/partners/partner-6.png",
  "/assets/partners/partner-5.png",
  "/assets/partners/partner-4.png",
  "/assets/partners/partner-3.png",
  "/assets/partners/partner-2.png",
  "/assets/partners/partner-1.png",
];

export function PartnersSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const partnerLoop = useMemo(() => [...partnerLogos, ...partnerLogos, ...partnerLogos], []);
  const partnerLoopReverse = useMemo(
    () => [...partnerLogos].reverse().concat([...partnerLogos].reverse(), [...partnerLogos].reverse()),
    [],
  );

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % teamMembers.length);
    }, 3600);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <>
      <section className="team-section scroll-reveal" id="team">
        <div className="team-header-group">
          <div className="team-tag">Meet the team</div>
          <h2>The Experts Behind AquaSmart</h2>
        </div>

        <div className="team-carousel-viewport" aria-label="AQUASMART team members">
          <div
            className="team-carousel-track"
            style={{ "--team-index": activeIndex } as CSSProperties}
          >
            {teamMembers.map((member, index) => (
              <article
                className={`team-carousel-card${index === activeIndex ? " is-active" : ""}`}
                key={member.name}
              >
                <div className="team-image-box">
                  <div className="team-blob-shape" style={{ backgroundColor: member.color }} />
                  <img src={member.image} alt={member.name} />
                </div>
                <div className="team-info-area">
                  <span className="team-role-label">{member.role}</span>
                  <h3>{member.name}</h3>
                  <p>{member.bio}</p>
                  <div className="team-tags-row">
                    {member.tags.map((tag) => (
                      <span className="team-tag-pill" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="team-pagination" aria-label="Choose team member">
          {teamMembers.map((member, index) => (
            <button
              aria-label={`Show ${member.name}`}
              aria-pressed={index === activeIndex}
              className={index === activeIndex ? "active" : undefined}
              key={member.name}
              onClick={() => setActiveIndex(index)}
              type="button"
            />
          ))}
        </div>
      </section>

      <section className="partners-section scroll-reveal" id="partners">
        <div className="partners-header">
          <h2>Research &amp; Institutional Partners</h2>
        </div>
        <div className="partners-marquee-viewport" aria-label="Research and institutional partner logos">
          <div className="partners-marquee-track partners-row-left">
            {partnerLoop.map((logo, index) => (
              <div className="partner-logo-tile" key={`${logo}-left-${index}`}>
                <img src={logo} alt="" />
              </div>
            ))}
          </div>
          <div className="partners-marquee-track partners-row-right">
            {partnerLoopReverse.map((logo, index) => (
              <div className="partner-logo-tile" key={`${logo}-right-${index}`}>
                <img src={logo} alt="" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
