"use client";

import { useMemo, useState } from "react";

import { coreTeam } from "@/app/data/team";
import revealStyles from "./ScrollReveal.module.css";
import styles from "./TeamSection.module.css";

const PAGE_SIZE = 3;

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0]?.[0]?.toUpperCase() ?? "";
  }

  return `${parts[0]?.[0] ?? ""}${parts.at(-1)?.[0] ?? ""}`.toUpperCase();
}

// Placeholder social icons. Swap the `href="#"` values for real links once
// each team member has a `socials` field in the data source.
function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d="M13.5 21v-8h2.68l.4-3.11h-3.08V8.02c0-.9.25-1.51 1.54-1.51h1.65V3.73C15.9 3.62 14.94 3.5 13.8 3.5c-2.4 0-4.04 1.46-4.04 4.15v2.24H7.07v3.11h2.69v8h3.74Z" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d="M6.94 8.5H3.56V20h3.38V8.5ZM5.25 3.25a1.96 1.96 0 1 0 0 3.92 1.96 1.96 0 0 0 0-3.92ZM20.44 20h-3.37v-5.9c0-1.4-.03-3.2-1.95-3.2-1.95 0-2.25 1.53-2.25 3.1V20H9.5V8.5h3.24v1.57h.05c.45-.86 1.56-1.77 3.2-1.77 3.43 0 4.06 2.26 4.06 5.2V20Z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d="m13.66 10.55 6.13-7.13h-1.7l-5.32 6.19-4.25-6.19H3l6.43 9.36L3 20.58h1.7l5.62-6.53 4.49 6.53h4.52l-6.67-10.03Zm-1.99 2.31-.65-.93-5.18-7.42h2.62l4.18 5.98.65.93 5.44 7.78h-2.62l-4.44-6.34Z" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d="M12 2.5a9.5 9.5 0 0 0-3 18.52c.48.09.65-.21.65-.46v-1.7c-2.64.57-3.2-1.14-3.2-1.14-.43-1.1-1.06-1.4-1.06-1.4-.87-.6.07-.58.07-.58.96.07 1.46.99 1.46.99.85 1.46 2.24 1.04 2.78.8.09-.62.34-1.04.6-1.28-2.1-.24-4.32-1.05-4.32-4.68 0-1.03.37-1.87.98-2.53-.1-.24-.42-1.22.1-2.54 0 0 .8-.26 2.62 1a9.03 9.03 0 0 1 4.78 0c1.82-1.26 2.62-1 2.62-1 .52 1.32.2 2.3.1 2.54.61.66.98 1.5.98 2.53 0 3.64-2.23 4.44-4.35 4.67.34.3.65.87.65 1.76v2.6c0 .26.17.56.66.46A9.5 9.5 0 0 0 12 2.5Z" />
    </svg>
  );
}

const socialIcons = [
  { key: "facebook", Icon: FacebookIcon, label: "Facebook" },
  { key: "linkedin", Icon: LinkedinIcon, label: "LinkedIn" },
  { key: "x", Icon: XIcon, label: "X" },
  { key: "github", Icon: GithubIcon, label: "GitHub" },
];

// Ensures the Project Manager & Technical Lead always lands in the center
// seat of the first page, regardless of the order in the data source.
function withLeadCentered(team: typeof coreTeam) {
  const list = [...team];
  const leadIndex = list.findIndex(
    (member) =>
      /project manager/i.test(member.role ?? "") ||
      /leunell/i.test(member.name ?? ""),
  );

  if (leadIndex !== -1) {
    const [lead] = list.splice(leadIndex, 1);
    const centerSlot = Math.min(1, list.length);
    list.splice(centerSlot, 0, lead);
  }

  return list;
}

function TeamAvatar({ name, image }: { name: string; image?: string | null }) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(image) && !failed;

  return showImage ? (
    <img src={image ?? ""} alt={name} onError={() => setFailed(true)} />
  ) : (
    <span className={styles["team-initials-avatar"]} aria-hidden="true">
      {getInitials(name)}
    </span>
  );
}

export function TeamSection() {
  const [page, setPage] = useState(0);

  const orderedTeam = useMemo(() => withLeadCentered(coreTeam), []);
  const totalPages = Math.max(1, Math.ceil(orderedTeam.length / PAGE_SIZE));
  const visibleMembers = useMemo(
    () => orderedTeam.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE),
    [orderedTeam, page],
  );
  const middleIndex = Math.floor((visibleMembers.length - 1) / 2);

  return (
    <section
      className={`${styles["team-section"]} ${revealStyles["scroll-reveal"]}`}
      id="team"
    >
      <div className={styles["team-header-group"]}>
        <div className={styles["team-tag"]}>Meet the team</div>
        <h2>
          <span className={styles["team-heading-accent"]}>Team</span> Behind
          AQUASMART Mini
        </h2>
        <p className={styles["team-subheading"]}>
          Meet our outstanding team — a synergy of talent, creativity, and
          dedication, crafting success together with passion and innovation.
        </p>
      </div>

      <div className={styles["team-grid"]} aria-label="AQUASMART team members">
        {visibleMembers.map((member, index) => {
          const title = member.role ?? member.focus ?? "";
          const isFeatured = index === middleIndex && visibleMembers.length > 1;

          return (
            <article
              className={`${styles["team-card"]} ${isFeatured ? styles["is-featured"] : ""}`}
              key={member.name}
            >
              <div className={styles["team-photo-frame"]}>
                <TeamAvatar name={member.name} image={member.image} />
              </div>

              <div className={styles["team-info-area"]}>
                <h3>{member.name}</h3>
                {title ? (
                  <span className={styles["team-role-pill"]}>{title}</span>
                ) : null}
                <p>{member.bio}</p>

                <div className={styles["team-social-row"]}>
                  {socialIcons.map(({ key, Icon, label }) => (
                    <a
                      key={key}
                      href="#"
                      className={styles["team-social-link"]}
                      aria-label={`${member.name} on ${label}`}
                    >
                      <Icon />
                    </a>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {totalPages > 1 ? (
        <div className={styles["team-dots"]} role="tablist" aria-label="Team pages">
          {Array.from({ length: totalPages }).map((_, dotIndex) => (
            <button
              key={dotIndex}
              type="button"
              role="tab"
              aria-selected={dotIndex === page}
              aria-label={`Show team members ${dotIndex + 1}`}
              className={`${styles["team-dot"]} ${dotIndex === page ? styles["is-active"] : ""}`}
              onClick={() => setPage(dotIndex)}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}