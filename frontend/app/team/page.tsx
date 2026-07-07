import type { Metadata } from "next";

import { SiteFooter } from "@/app/components/home/SiteFooter";
import { SiteNav } from "@/app/components/home/SiteNav";
import { coreTeam } from "@/app/data/team";
import { TeamExplorer } from "./TeamExplorer";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Our Team | AQUASMART Mini",
  description:
    "Meet Leunell, Daphne, and Quevin, the team behind AQUASMART Mini.",
};

export default function TeamPage() {
  return (
    <main className={styles.page}>
      <SiteNav activeLabel="Team" />

      <section className={styles.teamSection} aria-labelledby="team-page-title">
        <div className={styles.backdropRingOne} aria-hidden="true" />
        <div className={styles.backdropRingTwo} aria-hidden="true" />

        <div className={styles.intro}>
          <h1 id="team-page-title">
            Built by a team who understands
            <span>water, code, and field learning</span>
          </h1>
          <p>
            AQUASMART Mini brings together hydrogeologic research, web
            development, model-building, and outreach into one hands-on learning
            platform for sustainable groundwater management.
          </p>
        </div>

        <TeamExplorer members={coreTeam} />
      </section>

      <SiteFooter />
    </main>
  );
}
