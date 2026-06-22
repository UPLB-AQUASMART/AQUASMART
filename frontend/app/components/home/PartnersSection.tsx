"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import revealStyles from "./ScrollReveal.module.css";
import styles from "./PartnersSection.module.css";

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
  const teamCount = teamMembers.length;
  const [teamPosition, setTeamPosition] = useState(teamCount);
  const [isCarouselAnimating, setIsCarouselAnimating] = useState(true);
  const autoSlideTimeoutRef = useRef<number | null>(null);
  const activeIndex = ((teamPosition % teamCount) + teamCount) % teamCount;
  const carouselMembers = useMemo(
    () => [...teamMembers, ...teamMembers, ...teamMembers],
    [],
  );
  const partnerLoop = useMemo(() => [...partnerLogos, ...partnerLogos, ...partnerLogos], []);
  const partnerLoopReverse = useMemo(
    () => [...partnerLogos].reverse().concat([...partnerLogos].reverse(), [...partnerLogos].reverse()),
    [],
  );

  const clearAutoSlide = useCallback(() => {
    if (autoSlideTimeoutRef.current === null) {
      return;
    }

    window.clearTimeout(autoSlideTimeoutRef.current);
    autoSlideTimeoutRef.current = null;
  }, []);

  const scheduleAutoSlide = useCallback(() => {
    clearAutoSlide();
    autoSlideTimeoutRef.current = window.setTimeout(() => {
      setIsCarouselAnimating(true);
      setTeamPosition((currentPosition) => currentPosition + 1);
    }, 3600);
  }, [clearAutoSlide]);

  useEffect(() => {
    scheduleAutoSlide();

    return () => {
      if (autoSlideTimeoutRef.current !== null) {
        window.clearTimeout(autoSlideTimeoutRef.current);
      }
    };
  }, [scheduleAutoSlide]);

  const jumpToSlide = (index: number) => {
    setIsCarouselAnimating(true);
    setTeamPosition(teamCount + index);
    scheduleAutoSlide();
  };

  const handleCarouselTransitionEnd = () => {
    if (teamPosition >= teamCount * 2) {
      setIsCarouselAnimating(false);
      setTeamPosition(teamPosition - teamCount);
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setIsCarouselAnimating(true));
      });
    }

    if (teamPosition < teamCount) {
      setIsCarouselAnimating(false);
      setTeamPosition(teamPosition + teamCount);
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setIsCarouselAnimating(true));
      });
    }

    scheduleAutoSlide();
  };

  return (
    <>
      <section className={`${styles["team-section"]} ${revealStyles["scroll-reveal"]}`} id="team">
        <div className={styles["team-header-group"]}>
          <div className={styles["team-tag"]}>Meet the team</div>
          <h2>The Experts Behind AquaSmart</h2>
        </div>

        <div className={styles["team-carousel-viewport"]} aria-label="AQUASMART team members">
          <div
            className={`${styles["team-carousel-track"]}${isCarouselAnimating ? "" : ` ${styles["no-transition"]}`}`}
            onTransitionEnd={handleCarouselTransitionEnd}
            style={{ "--team-position": teamPosition } as CSSProperties}
          >
            {carouselMembers.map((member, index) => (
              <article
                aria-hidden={index !== teamPosition}
                className={`${styles["team-carousel-card"]}${index === teamPosition ? ` ${styles["is-active"]}` : ""}`}
                key={`${member.name}-${index}`}
              >
                <div className={styles["team-image-box"]}>
                  <div className={styles["team-blob-shape"]} style={{ backgroundColor: member.color }} />
                  <img src={member.image} alt={member.name} />
                </div>
                <div className={styles["team-info-area"]}>
                  <span className={styles["team-role-label"]}>{member.role}</span>
                  <h3>{member.name}</h3>
                  <p>{member.bio}</p>
                  <div className={styles["team-tags-row"]}>
                    {member.tags.map((tag) => (
                      <span className={styles["team-tag-pill"]} key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className={styles["team-pagination"]} aria-label="Choose team member">
          {teamMembers.map((member, index) => (
            <button
              aria-label={`Show ${member.name}`}
              aria-pressed={index === activeIndex}
              className={index === activeIndex ? styles.active : undefined}
              key={member.name}
              onClick={() => jumpToSlide(index)}
              type="button"
            />
          ))}
        </div>
      </section>

      <section className={`${styles["partners-section"]} ${revealStyles["scroll-reveal"]}`} id="partners">
        <div className={styles["partners-header"]}>
          <h2>Research &amp; Institutional Partners</h2>
        </div>
        <div className={styles["partners-marquee-viewport"]} aria-label="Research and institutional partner logos">
          <div className={`${styles["partners-marquee-track"]} ${styles["partners-row-left"]}`}>
            {partnerLoop.map((logo, index) => (
              <div className={styles["partner-logo-tile"]} key={`${logo}-left-${index}`}>
                <img src={logo} alt="" />
              </div>
            ))}
          </div>
          <div className={`${styles["partners-marquee-track"]} ${styles["partners-row-right"]}`}>
            {partnerLoopReverse.map((logo, index) => (
              <div className={styles["partner-logo-tile"]} key={`${logo}-right-${index}`}>
                <img src={logo} alt="" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
