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
    name: "Jastine Mae J. Galang",
    role: "Field Coordinator & Technology Specialist",
    image: "/assets/team/team-galang.png",
    bio: "Jastine Mae J. Galang is a registered Agricultural and Biosystems Engineer specializing in land and water management, with a focus on climate-resilient agricultural and watershed systems. Her current work focuses on using hydrologic models to support evidence-based watershed planning and water resource management. She continues to build her expertise by exploring GIS, remote sensing, and emerging AI applications to improve decision-making in agricultural water management.",
    tags: ["Hydrologic Models", "GIS", "Watersheds"],
    linkedin: "https://www.linkedin.com/in/jastine-mae-galang-397b4a188/",
  },
  {
    name: "Alea Fate E. Borlaza",
    role: "Communications Coordinator & Irrigation Specialist",
    image: "/assets/team/team-borlaza.png",
    bio: "Alea Fate E. Borlaza is a summa cum laude graduate of Agricultural and Biosystems Engineering from the University of the Philippines Los Baños, specializing in Land and Water Resources Engineering. Her work focuses on soil-water interactions and science-based approaches for climate-responsive agricultural water management. As a Project Technical Assistant, she supports data-driven irrigation planning, climate-adaptive water management strategies, and farm-level decision support.",
    tags: ["Irrigation", "Climate Risk", "Decision Support"],
    linkedin: "https://linkedin.com/in/aleafateborlaza/?skipRedirect=true",
  },
  {
    name: "Jerome G. Perez",
    role: "Project Coordinator & Data Specialist",
    image: "/assets/team/team-perez.png",
    bio: "Jerome G. Perez is a registered Agricultural and Biosystems Engineer specializing in land and water resources engineering, with a focus on groundwater hydrology and water quality. He has expertise in aquifer characterization, numerical modelling, and spatial groundwater quality assessment. His current work provides technical support on groundwater studies, geo-resistivity surveys, and solar-powered pump irrigation projects.",
    tags: ["Groundwater", "Water Quality", "Modelling"],
    linkedin: "https://linkedin.com/in/jerome-perez-990163322/?skipRedirect=true",
  },
  {
    name: "Grace C. Maligaya",
    role: "Outreach Coordinator & Water Quality Specialist",
    image: "/assets/team/team-maligaya.png",
    bio: "Grace Cabesas Maligaya is a Filipina engineer from Calamba, Laguna, Philippines. She graduated from the University of the Philippines Los Baños in August 2024 as the College of Engineering and Agro-industrial Technology Class Valedictorian and the first-ever summa cum laude of the BS Agricultural and Biosystems Engineering program. She is currently a Research Associate at the UPLB School of Environmental Science and Management, where her work centers on emerging contaminants in Laguna Lake.",
    tags: ["Outreach", "Water Quality", "Contaminants"],
    linkedin: "https://www.linkedin.com/in/grace-maligaya-a6b110318/",
  },
];

const researchers: TeamMember[] = [
  {
    name: "Jayson J. Labrador",
    focus: "IoT Groundwater Level Monitoring",
    bio: "Jayson J. Labrador is a graduate of BS Agricultural and Biosystems Engineering, major in Land and Water Resources Engineering, from the University of the Philippines Los Baños. His undergraduate thesis, “Development of a Low-Cost IoT-Based System for Automatic Groundwater Level Monitoring,” focused on the design and laboratory validation of a solar-powered IoT system for automated groundwater level monitoring.",
    tags: ["IoT", "Groundwater", "Solar Monitoring"],
  },
  {
    name: "Clark Win R. Basical",
    focus: "Groundwater Temperature & pH Monitoring",
    bio: "Clark Win R. Basical is a BS Agricultural and Biosystems Engineering student majoring in Land and Water Resources Engineering at the University of the Philippines Los Baños. His research focuses on the development of an Arduino-based IoT system for groundwater temperature and pH monitoring in support of sustainable irrigation management.",
    tags: ["Arduino", "pH Monitoring", "Water Quality"],
  },
  {
    name: "Christian R. Danganan",
    focus: "Groundwater Quality Monitoring",
    bio: "Christian R. Danganan is a BS Agricultural and Biosystems Engineering student majoring in Land and Water Resources Engineering at the University of the Philippines Los Baños. His undergraduate research focuses on an IoT-based groundwater quality monitoring system designed to assess electrical conductivity, total dissolved solids, and salinity in shallow aquifer systems.",
    tags: ["EC", "TDS", "Salinity"],
  },
  {
    name: "John Carlo Dominic A. Enriquez",
    focus: "Groundwater Modeling",
    bio: "John Carlo Dominic A. Enriquez is a BS Agricultural and Biosystems Engineering student majoring in Land and Water Resources Engineering at the University of the Philippines Los Baños. His work focuses on applying engineering tools to improve water resources planning and management through groundwater modeling and analysis of subsurface water movement.",
    tags: ["Groundwater", "Modeling", "Planning"],
  },
  {
    name: "Gianna Patricia G. Jimenez",
    focus: "AI Weather Forecasting",
    bio: "Gianna Patricia G. Jimenez is a BS Agricultural and Biosystems Engineering student majoring in Land and Water Resources Engineering at the University of the Philippines Los Baños. Her research focuses on developing an AI-based weather forecasting model to predict daily rainfall and evapotranspiration for precision agriculture.",
    tags: ["AI", "Rainfall", "Evapotranspiration"],
  },
  {
    name: "Irnst Jason J. Asperga",
    focus: "Rice-Fish Water Management",
    bio: "Irnst Jason J. Asperga is a BS Agricultural and Biosystems Engineering student majoring in Land and Water Resources Engineering at the University of the Philippines Los Baños. His research interests lie in aquaculture, water quality, and practical engineering solutions, focusing on an integrated rice-fish production system under sensor-informed water management.",
    tags: ["Aquaculture", "Water Quality", "Systems"],
  },
  {
    name: "Jhulianah L. Cariño",
    focus: "Soil Moisture Sensor Development",
    bio: "Jhulianah L. Cariño is a BS Agricultural and Biosystems Engineering student majoring in Land and Water Resources Engineering at the University of the Philippines Los Baños. Her research focuses on the development of an Arduino-based sensor system for monitoring soil moisture as an indicator of groundwater conditions.",
    tags: ["Soil Moisture", "Arduino", "Sensors"],
  },
];

const interns: TeamMember[] = [
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
  {
    name: "Jhulianah L. Cariño",
    focus: "Sensor Development",
    bio: "Contributes to sensor development and data acquisition work through Arduino-based soil moisture monitoring for groundwater-related field insights.",
    tags: ["Sensors", "Arduino"],
  },
  {
    name: "Marzell Jhake Llamas",
    focus: "Sensor Development",
    bio: "Provides project support for sensor development, research preparation, documentation, and field-oriented AQUASMART tasks.",
    tags: ["Sensors", "Research"],
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
              The Experts Behind <span>AQUASMART</span>
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
          <h2 id="core-team-title">The experts building AQUASMART</h2>
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

      <section className={styles["researchers-section"]} aria-labelledby="researchers-team-title">
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
      </section>

      <section className={styles["intern-section"]} aria-labelledby="intern-team-title">
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
