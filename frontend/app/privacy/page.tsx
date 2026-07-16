import type { Metadata } from "next";

import { SiteFooter } from "@/app/components/home/SiteFooter";
import { SiteNav } from "@/app/components/home/SiteNav";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Privacy Policy | AQUASMART Mini",
  description:
    "Privacy information for AQUASMART Mini visitors, students, and collaborators.",
};

export default function PrivacyPage() {
  return (
    <main className={styles.page}>
      <SiteNav />
      <section className={styles.hero}>
        <div className={styles.shell}>
          <span className={styles.kicker}>In Progress</span>
          <h1>Privacy Policy Coming Soon</h1>
          <p>
            This page is currently being prepared by the AQUASMART Mini team.
            The final privacy policy will be added here once it is ready for
            publication.
          </p>
          <a className={styles.actionLink} href="/contact">
            Contact the team
          </a>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
