import type { Metadata } from "next";
import Image from "next/image";

import { AquaWebGLBackground } from "@/app/components/effects/AquaWebGLBackground";
import { SiteFooter } from "@/app/components/home/SiteFooter";
import { SiteNav } from "@/app/components/home/SiteNav";
import { coreTeam, type TeamMember } from "@/app/data/team";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Our Team | AQUASMART Mini",
  description:
    "Meet the researchers, engineers, coordinators, and interns behind AQUASMART Mini.",
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0]?.[0]?.toUpperCase() ?? "";
  }

  return `${parts[0]?.[0] ?? ""}${parts.at(-1)?.[0] ?? ""}`.toUpperCase();
}

function TeamCard({
  member,
  label,
}: {
  member: TeamMember;
  label?: string;
}) {
  const title = member.role ?? member.focus ?? "";

  return (
    <article className={styles.card}>
      <div className={member.image ? styles["portrait-wrap"] : styles["avatar-wrap"]}>
        {member.image ? (
          <>
            <Image
              className={styles.portrait}
              src={member.image}
              alt={member.name}
              width={130}
              height={130}
            />
            {member.lead ? (
              <span className={styles["lead-mark"]} aria-label="Team lead">
                ★
              </span>
            ) : null}
          </>
        ) : (
          <span className={styles["initials-avatar"]} aria-hidden="true">
            {getInitials(member.name)}
          </span>
        )}
      </div>

      {label ? <span className={styles["member-label"]}>{label}</span> : null}
      <h3>{member.name}</h3>
      <p className={styles.role}>{title}</p>
      <div className={styles.tags} aria-label={`${member.name} specialties`}>
        {member.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      <div className={styles.divider} aria-hidden="true" />
      <p className={styles.bio}>{member.bio}</p>
      {member.linkedin ? (
        <a
          className={styles["card-link"]}
          href={member.linkedin}
          rel="noreferrer"
          target="_blank"
        >
          Connect on LinkedIn
        </a>
      ) : null}
    </article>
  );
}

export default function TeamPage() {
  return (
    <main className={styles["team-page"]}>
      <SiteNav activeLabel="Team" />

      <section className={styles.hero} aria-labelledby="team-page-title">
        <div className={styles["hero-orb-one"]} aria-hidden="true" />
        <div className={styles["hero-orb-two"]} aria-hidden="true" />
        <div className={styles["hero-layout"]}>
          <div className={styles["hero-content"]}>
            <span className={styles.eyebrow}>The Team</span>
            <h1 id="team-page-title">
              The Experts Behind <span>AQUASMART mini</span>
            </h1>
            <p>
              A collaborative team of academic researchers, technical
              specialists, environmental scientists, and field practitioners
              dedicated to groundwater sustainability, climate adaptation, and
              smart agricultural water management in the Philippines.
            </p>
          </div>
          <div className={styles["hero-visual"]} aria-hidden="true">
            <AquaWebGLBackground className={styles["hero-canvas"]} />
            <span className={styles["visual-label"]}>Living water intelligence</span>
            <span className={styles["visual-caption"]}>AQUASMART / WebGL2</span>
          </div>
        </div>
      </section>

      <section className={styles["core-section"]} aria-labelledby="core-team-title">
        <div className={styles["section-heading"]}>
          <span>Core team</span>
          <h2 id="core-team-title">The experts building AQUASMART mini</h2>
          <p>
            Engineering, field operations, data science, communications, and
            water-quality work joined into one climate-smart platform.
          </p>
        </div>

        <div className={styles["team-grid"]}>
          {coreTeam.map((member) => (
            <TeamCard key={member.name} member={member} />
          ))}
        </div>
      </section>

      <section className={styles.cta} aria-labelledby="team-contact-title">
        <div>
          <span>Let&apos;s work together</span>
          <h2 id="team-contact-title">Connect with the AQUASMART team</h2>
          <p>
            Have a research idea, partnership opportunity, or question about our
            work? We would love to hear from you.
          </p>
        </div>
        <a href="mailto:aquasmartph@gmail.com">Contact the team</a>
      </section>

      <SiteFooter />
    </main>
  );
}
