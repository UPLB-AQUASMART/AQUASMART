import type { Metadata } from "next";
import Image from "next/image";

import { AquaWebGLBackground } from "@/app/components/effects/AquaWebGLBackground";
import { SiteFooter } from "@/app/components/home/SiteFooter";
import { SiteNav } from "@/app/components/home/SiteNav";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Our Team | AQUASMART Mini",
  description:
    "Meet the researchers, engineers, coordinators, and interns behind AQUASMART Mini.",
};

type TeamMember = {
  name: string;
  role?: string;
  focus?: string;
  image?: string;
  bio: string;
  tags: string[];
  lead?: boolean;
  linkedin?: string;
};

const coreTeam: TeamMember[] = [
  {
    name: "Leunell Chris M. Buela",
    role: "Project Manager & Technical Lead",
    image: "/assets/team/team-buela.png",
    bio: "Leunell Chris Buela is an Assistant Professor at the University of the Philippines Los Baños working at the intersection of water science, climate adaptation, and sustainable agri-food systems. His work focuses on groundwater and surface water modeling, flood and drought risk assessment, and climate-resilient irrigation and precision agriculture. He currently leads and contributes to multiple national and international projects on groundwater monitoring, contaminant transport, integrated water resources management, and AI-supported decision tools for agriculture, including the AQUASMART initiative.",
    tags: ["Water Science", "Climate Adaptation", "AI Tools"],
    lead: true,
    linkedin: "https://www.linkedin.com/in/lmbuela/?skipRedirect=true",
  },
  {
    name: "Daphne Canape",
    focus: "Designer & Developer",
    bio: "Daphne Canape is an undergraduate Computer Science student at the University of the Philippines Los Baños, with a growing focus on bridging the gap between intuitive web experiences and data-driven insights. Her recent academic projects have centered on full-stack web development and UI/UX design, utilizing frameworks like React to build user-centric applications. Complementing her technical foundation, she has expanded her expertise into data science and predictive modeling using Python. Daphne is eager to apply her technical skills to solve real-world problems, with a specific interest in leveraging data to provide actionable insights that create meaningful business and social impact.",
    tags: ["Design", "Development"],
  },
  {
    name: "Quevin James A. Custodio",
    focus: "Model Developer",
    bio: "Assists with model development, data organization, and technical support for AQUASMART research and simulation workflows.",
    tags: ["Modeling", "Data"],
  },
];


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

      {/* <section className={styles["researchers-section"]} aria-labelledby="researchers-team-title">
        <div className={styles["section-heading"]}>
          <span>Researchers</span>
          <h2 id="researchers-team-title">Research support and system studies</h2>
          <p>
            The research group advances sensing, modeling, forecasting, and
            water-management studies that support the AQUASMART system.
          </p>
        </div>

        <div className={styles["team-grid"]}>
          {researchers.map((researcher) => (
            <TeamCard key={researcher.name} label="AQUASMART Researcher" member={researcher} />
          ))}
        </div>
      </section> */}

      {/* <section className={styles["intern-section"]} aria-labelledby="intern-team-title">
        <div className={styles["section-heading"]}>
          <span>Project interns</span>
          <h2 id="intern-team-title">Supporting the mission</h2>
          <p>
            The interns contribute across design, development, modeling, sensor
            work, documentation, and day-to-day project support.
          </p>
        </div>

        <div className={`${styles["team-grid"]} ${styles["intern-grid"]}`}>
          {interns.map((intern) => (
            <TeamCard key={intern.name} label="AQUASMART Intern" member={intern} />
          ))}
        </div>
      </section> */}

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
