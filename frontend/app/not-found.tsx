import Link from "next/link";

import { SiteFooter } from "@/app/components/home/SiteFooter";
import { SiteNav } from "@/app/components/home/SiteNav";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <main className={styles.page}>
      <SiteNav />
      <section className={styles.hero}>
        <div className={styles.shell}>
          <span className={styles.kicker}>404 Error</span>
          <h1>Page Not Found</h1>
          <p>
            The page you are looking for may have been moved, renamed, or is not
            available in AQUASMART Mini.
          </p>
          <div className={styles.actions}>
            <Link className={styles.primaryAction} href="/">
              Back to Home
            </Link>
            <Link className={styles.secondaryAction} href="/contact">
              Contact the team
            </Link>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
