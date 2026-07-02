import Link from "next/link";

import { ScrollRevealInit } from "@/app/components/home/ScrollRevealInit";
import revealStyles from "@/app/components/home/ScrollReveal.module.css";
import { SiteFooter } from "@/app/components/home/SiteFooter";
import { SiteNav } from "@/app/components/home/SiteNav";
import { WaterSavingScaleSection } from "@/app/about/WaterSavingScaleSection";
import styles from "./page.module.css";

const stats = [
  {
    number: "28",
    label: "Active sensors deployed across farm zones",
  },
  {
    number: "91%",
    label: "Average irrigation efficiency across zones",
  },
  {
    number: "6",
    label: "Monitoring zones under active management",
  },
  {
    number: "23%",
    label: "Water productivity improvement in pilot study",
  },
];

const techStack = [
  {
    title: "IoT Sensors",
    body: "Real-time groundwater, soil moisture, and water quality sensors",
  },
  {
    title: "AI Engine",
    body: "Machine learning models for irrigation scheduling and anomaly detection",
  },
  {
    title: "Satellite Data",
    body: "Remote sensing for crop health and water stress mapping",
  },
  {
    title: "Analytics Platform",
    body: "Interactive dashboards, reports, and decision-support tools",
  },
];

export default function AboutPage() {
  return (
    <main className={styles.page}>
      <ScrollRevealInit />
      <SiteNav activeLabel="About" />
      <WaterSavingScaleSection />

      <section className={`${styles.introSection} ${revealStyles["scroll-reveal"]}`}>
        <div className={styles.introReveal}>
          <div className={styles.badge}>About AquaSmart</div>
          <h1>
            <span>Water Intelligence</span> for a Sustainable Future
          </h1>
          <p>
            AQUASMART is an integrated water resources management initiative focused on
            strengthening the resilience and sustainability of rice-fish farming systems
            through groundwater monitoring, AI-assisted forecasting, and data-driven
            irrigation management.
          </p>
        </div>
      </section>

      <section className={`${styles.storySection} ${revealStyles["scroll-reveal"]}`}>
        <div className={styles.storyGrid}>
          <div className={styles.storyContent}>
            <h2>Our Story &amp; Mission</h2>
            <p>
              AQUASMART was developed to address groundwater over-extraction, inefficient
              irrigation practices, and increasing climate variability affecting agricultural
              communities in the Philippines.
            </p>
            <p>
              The project integrates low-cost groundwater sensors, real-time data transmission,
              AI-based weather forecasting, and MODFLOW-based groundwater modeling to support
              data-driven irrigation and aquaculture decisions.
            </p>
            <p>
              A web-based platform provides accessible information on groundwater levels,
              water quality, flow direction, and short-term climate forecasts to support
              adaptive water-use planning and sustainable farming practices.
            </p>
            <p>
              AQUASMART collaborates with research institutions, environmental organizations,
              and agricultural stakeholders to promote sustainable water management and
              climate-resilient farming systems.
            </p>
            <Link className={styles.partnerCta} href="/#partners">
              Partner With Us <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className={styles.statsGrid}>
            {stats.map((stat) => (
              <article className={styles.statCard} key={stat.label}>
                <div className={styles.statNumber}>{stat.number}</div>
                <div className={styles.statLabel}>{stat.label}</div>
              </article>
            ))}
            <article className={`${styles.statCard} ${styles.wide}`}>
              <div className={`${styles.statNumber} ${styles.green}`}>6 Partners</div>
              <div className={styles.statLabel}>
                International institutions supporting AQUASMART&apos;s research and deployment
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className={`${styles.missionTechSection} ${revealStyles["scroll-reveal"]}`}>
        <div className={styles.missionContainer}>
          <div className={styles.mvGrid}>
            <article className={styles.mvCard}>
              <h2>Our Mission</h2>
              <p>
                To empower farmers and water managers with real-time environmental intelligence,
                enabling data-driven decisions that conserve water, improve yields, and build
                resilience against climate change — one farm zone at a time.
              </p>
            </article>

            <article className={styles.mvCard}>
              <h2>Our Vision</h2>
              <p>
                A world where every farming community has access to precision water intelligence —
                where technology bridges the gap between environmental data and agricultural
                action, creating food systems that are resilient, efficient, and sustainable.
              </p>
            </article>
          </div>

          <article className={styles.techCard}>
            <h2>Technology Stack</h2>
            <div className={styles.techGrid}>
              {techStack.map((item) => (
                <div className={styles.techItem} key={item.title}>
                  <h4>{item.title}</h4>
                  <p>{item.body}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
