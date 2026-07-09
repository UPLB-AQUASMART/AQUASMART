"use client";

import Image from "next/image";

import { coreTeam, type TeamMember } from "@/app/data/team";

import styles from "./TeamSection.module.css";

// Real headshots aren't wired up yet — every row falls back to this
// placeholder until each member's photo is available.
const PLACEHOLDER_PHOTO = "/assets/team/sample.svg";

function TeamRow({ member, index }: { member: TeamMember; index: number }) {
  const title = member.role ?? member.focus;

  return (
    <article className={styles.row}>
      <div className={styles.visual}>
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

      <div className={styles.descStage}>
        <div className={styles.descInner}>
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
