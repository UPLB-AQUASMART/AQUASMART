"use client";

import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";

import { coreTeam, type TeamMember } from "@/app/data/team";

import styles from "./TeamSection.module.css";

gsap.registerPlugin(ScrollTrigger);

// Real headshots aren't wired up yet — every row falls back to this
// placeholder until each member's photo is available.
const PLACEHOLDER_PHOTO = "/assets/team/sample.svg";

function TeamRow({ member, index }: { member: TeamMember; index: number }) {
  const rowRef = useRef<HTMLElement | null>(null);
  const visualRef = useRef<HTMLDivElement | null>(null);
  const descInnerRef = useRef<HTMLDivElement | null>(null);
  // The sticky description frame is sized to match the visual column's own
  // height (photo + role + name + link) rather than the full viewport, so
  // the bio/tags bottom out at the same level as the name instead of
  // trailing on down toward the bottom of the screen.
  const [frameHeight, setFrameHeight] = useState<number | null>(null);

  useEffect(() => {
    const visual = visualRef.current;
    if (!visual) return;

    const updateHeight = () => setFrameHeight(visual.getBoundingClientRect().height);
    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(visual);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const row = rowRef.current;
    const inner = descInnerRef.current;
    if (!row || !inner || frameHeight === null) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const context = gsap.context(() => {
      gsap.fromTo(
        inner,
        { y: 0 },
        {
          y: () => Math.max(frameHeight - inner.offsetHeight - 1, 0),
          ease: "none",
          scrollTrigger: {
            trigger: row,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      );
    }, row);

    return () => context.revert();
  }, [frameHeight]);

  const title = member.role ?? member.focus;

  return (
    <article className={styles.row} ref={rowRef}>
      <div className={styles.visual} ref={visualRef}>
        <div className={styles.imageFrame}>
          <Image
            className={styles.photo}
            src={PLACEHOLDER_PHOTO}
            alt={member.image ? member.name : `Placeholder photo for ${member.name}`}
            fill
            sizes="(max-width: 900px) 100vw, 320px"
          />
        </div>

        {title && (
          <span className={styles.role}>
            {title}
            {member.lead && <span className={styles.leadBadge}>Team Lead</span>}
          </span>
        )}

        <h3 className={styles.name}>{member.name}</h3>

        {member.linkedin && (
          <a
            className={styles.linkedin}
            href={member.linkedin}
            target="_blank"
            rel="noopener noreferrer"
          >
            View LinkedIn
            <span aria-hidden="true">↗</span>
          </a>
        )}
      </div>

      <div
        className={styles.descStage}
        style={frameHeight ? { height: frameHeight } : undefined}
      >
        <div className={styles.descInner} ref={descInnerRef}>
          <span className={styles.descIndex}>{String(index + 1).padStart(2, "0")}</span>
          <p className={styles.bio}>{member.bio}</p>
          {member.tags && member.tags.length > 0 && (
            <ul className={styles.tags}>
              {member.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </article>
  );
}

export function TeamSection() {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <span className={styles.kicker}>Meet the Team</span>
        <h2 className={styles.heading}>
          <span className={styles.headingLight}>Behind</span>
          <span className={styles.headingAccent}>AQUASMART Mini</span>
        </h2>
      </div>

      <div className={styles.list}>
        {coreTeam.map((member, i) => (
          <TeamRow key={i} member={member} index={i} />
        ))}
      </div>
    </section>
  );
}