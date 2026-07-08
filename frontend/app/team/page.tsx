import type { Metadata } from "next";

import { AquaWebGLBackground } from "@/app/components/effects/AquaWebGLBackground";
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

        <div className={styles.heroLayout}>
          <div className={styles.heroCopy}>
            <div className={styles.badge}>The AQUASMART Mini Team</div>
            <h1 id="team-page-title">
              AQUASMART <span>Mini</span>
            </h1>
            <p>
              The AQUASMART Mini team brings together hydrogeologic research,
              web development, model-building, and outreach into one hands-on
              learning platform for sustainable groundwater management.
            </p>
          </div>

          <div className={styles.heroVisual} aria-hidden="true">
            <AquaWebGLBackground className={styles.heroCanvas} />
            <span className={styles.visualLabel}>Living water intelligence</span>
            <span className={styles.visualCaption}>AQUASMART / WebGL2</span>
          </div>
        </div>

        <TeamExplorer members={coreTeam} />
      </section>

      <SiteFooter />
    </main>
  );
}
