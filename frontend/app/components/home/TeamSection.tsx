"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

import { coreTeam } from "@/app/data/team";
import revealStyles from "./ScrollReveal.module.css";
import styles from "./TeamSection.module.css";

gsap.registerPlugin(ScrollTrigger);

const teamMembers = coreTeam.slice(0, 3);

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0]?.[0]?.toUpperCase() ?? "";
  }

  return `${parts[0]?.[0] ?? ""}${parts.at(-1)?.[0] ?? ""}`.toUpperCase();
}

export function TeamSection() {
  const teamSectionRef = useRef<HTMLElement | null>(null);
  const teamViewportRef = useRef<HTMLDivElement | null>(null);
  const teamTrackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const section = teamSectionRef.current;
    const viewport = teamViewportRef.current;
    const track = teamTrackRef.current;

    if (!section || !viewport || !track) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) return;

    const getViewportContentWidth = () => {
      const viewportStyles = window.getComputedStyle(viewport);
      const paddingLeft = Number.parseFloat(viewportStyles.paddingLeft) || 0;
      const paddingRight = Number.parseFloat(viewportStyles.paddingRight) || 0;

      return Math.max(1, viewport.clientWidth - paddingLeft - paddingRight);
    };

    const getScrollDistance = () => Math.max(0, track.scrollWidth - getViewportContentWidth());
    const getPinDistance = () => Math.max(1, getScrollDistance() + window.innerHeight * 0.18);
    let horizontalTween: gsap.core.Tween | null = null;

    const refreshTween = () => {
      horizontalTween?.kill();
      horizontalTween = gsap.to(track, {
        x: () => -getScrollDistance(),
        ease: "none",
        paused: true,
      });
    };

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: () => `+=${getPinDistance()}`,
      pin: true,
      scrub: 0.55,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onRefresh: refreshTween,
      onUpdate: (self) => {
        horizontalTween?.progress(self.progress);
      },
    });

    refreshTween();
    ScrollTrigger.refresh();

    return () => {
      horizontalTween?.kill();
      trigger.kill();
      gsap.set(track, { clearProps: "transform" });
    };
  }, []);

  return (
    <section
      className={`${styles["team-section"]} ${revealStyles["scroll-reveal"]}`}
      id="team"
      ref={teamSectionRef}
    >
      <div className={styles["team-header-group"]}>
        <div className={styles["team-tag"]}>Meet the team</div>
        <h2>The Experts Behind AQUASMART</h2>
      </div>

      <div
        className={styles["team-carousel-viewport"]}
        aria-label="AQUASMART team members"
        ref={teamViewportRef}
      >
        <div className={styles["team-carousel-track"]} ref={teamTrackRef}>
          {teamMembers.map((member) => {
            const title = member.role ?? member.focus ?? "";

            return (
              <article
                className={`${styles["team-carousel-card"]} ${styles["is-active"]}`}
                key={member.name}
              >
                <div className={styles["team-image-box"]}>
                  <div className={styles["team-blob-shape"]} />
                  {member.image ? (
                    <img src={member.image} alt={member.name} />
                  ) : (
                    <span className={styles["team-initials-avatar"]} aria-hidden="true">
                      {getInitials(member.name)}
                    </span>
                  )}
                </div>
                <div className={styles["team-info-area"]}>
                  <span className={styles["team-role-label"]}>{title}</span>
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
            );
          })}
        </div>
      </div>
    </section>
  );
}
