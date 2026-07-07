"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import type { TeamMember } from "@/app/data/team";
import styles from "./page.module.css";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0]?.[0]?.toUpperCase() ?? "";
  }

  return `${parts[0]?.[0] ?? ""}${parts.at(-1)?.[0] ?? ""}`.toUpperCase();
}

function getDisplayName(name: string) {
  return name.split(" ")[0] ?? name;
}

function splitBio(bio: string) {
  const sentences = bio.match(/[^.!?]+[.!?]+/g);

  if (!sentences || sentences.length < 3) {
    return [bio];
  }

  return [
    sentences.slice(0, 2).join(" ").trim(),
    sentences.slice(2, 4).join(" ").trim(),
    sentences.slice(4).join(" ").trim(),
  ].filter(Boolean);
}

export function TeamExplorer({ members }: { members: TeamMember[] }) {
  const curatedMembers = useMemo(() => members.slice(0, 3), [members]);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeMember = curatedMembers[activeIndex] ?? curatedMembers[0];

  if (!activeMember) {
    return null;
  }

  return (
    <div className={styles.explorer}>
      <div className={styles.memberList} aria-label="Team members">
        {curatedMembers.map((member, index) => {
          const isActive = activeIndex === index;
          const title = member.role ?? member.focus ?? "";

          return (
            <button
              aria-pressed={isActive}
              className={`${styles.memberButton}${isActive ? ` ${styles.activeMember}` : ""}`}
              key={member.name}
              onClick={() => setActiveIndex(index)}
              type="button"
            >
              <span className={styles.thumb}>
                {member.image ? (
                  <Image
                    src={member.image}
                    alt=""
                    fill
                    sizes="(max-width: 720px) 88px, 180px"
                  />
                ) : (
                  <span className={styles.initialsAvatar}>
                    {getInitials(member.name)}
                  </span>
                )}
              </span>
              <span className={styles.memberMeta}>
                <strong>{getDisplayName(member.name)}</strong>
                <span>{title}</span>
              </span>
            </button>
          );
        })}
      </div>

      <article className={styles.detailPanel}>
        <span className={styles.kicker}>Selected profile</span>
        <h2>{activeMember.name}</h2>
        <p className={styles.role}>{activeMember.role ?? activeMember.focus}</p>

        <div className={styles.tags}>
          {activeMember.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>

        <div className={styles.bioText}>
          {splitBio(activeMember.bio).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        {activeMember.linkedin ? (
          <a
            className={styles.profileLink}
            href={activeMember.linkedin}
            rel="noreferrer"
            target="_blank"
          >
            View LinkedIn -&gt;
          </a>
        ) : null}
      </article>
    </div>
  );
}
