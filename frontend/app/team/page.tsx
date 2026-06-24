import type { Metadata } from "next";
import Image from "next/image";

import { SiteFooter } from "@/app/components/home/SiteFooter";
import { SiteNav } from "@/app/components/home/SiteNav";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Our Team | AQUASMART Mini",
  description:
    "Meet the researchers, engineers, coordinators, and interns behind AQUASMART Mini.",
};

const coreTeam = [
  {
    name: "Leunell Chris M. Buela",
    role: "Project Manager & Technical Lead",
    image: "/assets/team/team-buela.png",
    bio: "Leads the technical architecture and project management for the AQUASMART platform, including sensor-network deployment and system integration.",
    tags: ["Systems Engineering", "Leadership", "IoT"],
    lead: true,
  },
  {
    name: "Jastine Mae J. Galang",
    role: "Field Coordinator & Technology Specialist",
    image: "/assets/team/team-galang.png",
    bio: "Manages on-site sensor deployment and maintenance, coordinates field operations, and bridges technical infrastructure with farm implementation.",
    tags: ["Field Operations", "Technology", "Sensors"],
  },
  {
    name: "Alea Fate E. Borlaza",
    role: "Communications & Irrigation Specialist",
    image: "/assets/team/team-borlaza.png",
    bio: "Manages partner communications and leads irrigation scheduling, translating field data into clear and actionable recommendations.",
    tags: ["Communications", "Irrigation", "Stakeholders"],
  },
  {
    name: "Jerome G. Perez",
    role: "Project Coordinator & Data Specialist",
    image: "/assets/team/team-perez.png",
    bio: "Coordinates project logistics and manages the data-processing pipeline, helping the research team receive accurate and timely insights.",
    tags: ["Data Analysis", "Coordination", "GIS"],
  },
  {
    name: "Grace C. Maligaya",
    role: "Outreach & Water Quality Specialist",
    image: "/assets/team/team-maligaya.png",
    bio: "Leads community outreach initiatives and conducts water-quality analysis across monitoring zones to support reliable field decisions.",
    tags: ["Outreach", "Water Quality", "Community"],
  },
];

const interns = [
  {
    name: "Daphne Canape",
    focus: "Designer & Developer",
    bio: "Supports the AQUASMART team through research assistance, documentation, and collaborative project work.",
  },
  {
    name: "Quevin James Custodio",
    focus: "Model Developer",
    bio: "Assists with field activities, data organization, and day-to-day coordination across project tasks.",
  },
  {
    name: "Jhulianah Cariño",
    focus: "Sensor Development",
    bio: "Contributes to project communications, research materials, and community-focused AQUASMART initiatives.",
  },
  {
    name: "Marzell Jhake Llamas",
    focus: "Sensor Development",
    bio: "Provides general project support and assists the team with research, documentation, and field preparation.",
  },
];

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0]?.[0]?.toUpperCase() ?? "";
  }

  return `${parts[0]?.[0] ?? ""}${parts.at(-1)?.[0] ?? ""}`.toUpperCase();
}

export default function TeamPage() {
  return (
    <main className={styles["team-page"]}>
      <SiteNav activeLabel="Team" />

      <section className={styles.hero} aria-labelledby="team-page-title">
        <div className={styles["hero-orb-one"]} aria-hidden="true" />
        <div className={styles["hero-orb-two"]} aria-hidden="true" />
        <div className={styles["hero-content"]}>
          <span className={styles.eyebrow}>People behind the platform</span>
          <h1 id="team-page-title">
            Meet the <span>AQUASMART Team</span>
          </h1>
          <p>
            A multidisciplinary group working together to make groundwater
            monitoring and smarter irrigation more practical, accessible, and
            sustainable.
          </p>
        </div>
      </section>

      <section className={styles["core-section"]} aria-labelledby="core-team-title">
        <div className={styles["section-heading"]}>
          <span>Core team</span>
          <h2 id="core-team-title">The experts building AQUASMART</h2>
          <p>
            Bringing together engineering, field operations, data, communication,
            and community engagement.
          </p>
        </div>

        <div className={styles["team-grid"]}>
          {coreTeam.map((member) => (
            <article className={styles.card} key={member.name}>
              <div className={styles["portrait-wrap"]}>
                <div className={styles["portrait-ring"]} aria-hidden="true" />
                <Image
                  className={styles.portrait}
                  src={member.image}
                  alt={member.name}
                  width={164}
                  height={164}
                />
                {member.lead ? (
                  <span className={styles["lead-mark"]} aria-label="Team lead">
                    ★
                  </span>
                ) : null}
              </div>
              <h3>{member.name}</h3>
              <p className={styles.role}>{member.role}</p>
              <div className={styles.tags} aria-label={`${member.name} specialties`}>
                {member.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <p className={styles.bio}>{member.bio}</p>
              <a
                className={styles["card-link"]}
                href="https://www.linkedin.com/company/aquasmartph/"
                rel="noreferrer"
                target="_blank"
              >
                Connect on LinkedIn <span aria-hidden="true">↗</span>
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className={styles["intern-section"]} aria-labelledby="intern-team-title">
        <div className={styles["section-heading"]}>
          <span>Project interns</span>
          <h2 id="intern-team-title">Supporting the mission</h2>
          <p>
            Our interns contribute across research, fieldwork, communication, and
            project coordination.
          </p>
        </div>

        <div className={`${styles["team-grid"]} ${styles["intern-grid"]}`}>
          {interns.map((intern) => (
            <article className={`${styles.card} ${styles["intern-card"]}`} key={intern.name}>
              <div className={styles["initials-avatar"]} aria-hidden="true">
                {getInitials(intern.name)}
              </div>
              <span className={styles["intern-label"]}>AQUASMART Intern</span>
              <h3>{intern.name}</h3>
              <p className={styles.role}>{intern.focus}</p>
              <div className={styles.tags}>
                <span>Collaboration</span>
                <span>Research</span>
              </div>
              <p className={styles.bio}>{intern.bio}</p>
            </article>
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
