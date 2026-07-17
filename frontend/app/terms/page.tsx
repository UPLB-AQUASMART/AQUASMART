import type { Metadata } from "next";

import { SiteFooter } from "@/app/components/home/SiteFooter";
import { SiteNav } from "@/app/components/home/SiteNav";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Terms of Service | AQUASMART Mini",
  description:
    "Terms of use for AQUASMART Mini's educational groundwater and irrigation tools.",
};

export default function TermsPage() {
  return (
    <main className={styles.page}>
      <SiteNav />
      <section className={styles.hero}>
        <div className={styles.shell}>
          <span className={styles.kicker}>In Progress</span>
          <h1>Terms of Service Coming Soon</h1>
          <p>
            This page is currently being prepared by the AQUASMART Mini team.
            The final terms of service will be added here once it is ready for
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
