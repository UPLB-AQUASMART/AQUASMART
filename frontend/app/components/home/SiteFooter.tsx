import { footerColumns } from "@/app/data/home";
import revealStyles from "./ScrollReveal.module.css";
import styles from "./SiteFooter.module.css";

export function SiteFooter({
  className,
  reveal = false,
}: {
  className?: string;
  reveal?: boolean;
}) {
  return (
    <footer
      className={`${styles["site-footer"]}${reveal ? ` ${revealStyles["scroll-reveal"]}` : ""}${className ? ` ${className}` : ""}`}
      id="contact"
    >
      <div className={styles["footer-upper"]}>
        <div className={styles["footer-brand"]}>
          <img
            className={styles["footer-logo"]}
            src="/assets/logo_2.png"
            alt="AQUASMART Mini"
          />
          <p>
            AQUASMART empowers farmers and water managers with real-time data,
            AI insights, and smart irrigation recommendations for a sustainable
            future.
          </p>
          <div className={styles.socials}>
            <img src="/figma/facebook.svg" alt="Facebook" />
            <img src="/figma/instagram.svg" alt="Instagram" />
            <img src="/figma/linkedin.svg" alt="LinkedIn" />
          </div>
        </div>
        <div className={styles["footer-links"]}>
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3>{column.title}</h3>
              {column.links.map((link) => (
                <a href={link.href} key={link.label}>
                  {link.label}
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className={styles["footer-lower"]}>
        <span>{"\u00a9"} 2026 AQUASMART. All rights reserved.</span>
        <div>
          <a href="#contact">Privacy Policy</a>
          <a href="#contact">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
