import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import styles from "./PartnersSection.module.css";

const partners = [
  {
    name: "EGU",
    logo: "/assets/partners/partner-1.png",
    defaultLogo: "/assets/partners/partner-1-default.png",
    logoWidth: 240,
    description:
      "EGU, the European Geosciences Union, is Europe's premier geosciences union, dedicated to the pursuit of excellence in the Earth, planetary, and space sciences for the benefit of humanity, worldwide. It was established in September 2002 as a merger of the European Geophysical Society (EGS) and the European Union of Geosciences (EUG), and has headquarters in Munich, Germany.",
  },
  {
    name: "GWYN",
    logo: "/assets/partners/partner-8.png",
    defaultLogo: "/assets/partners/partner-8-default.png",
    logoWidth: 190,
    description:
      "The Groundwater Youth Network (GWYN) is a youth led network aiming to provide a coordination mechanism between pre-existing youth organizations focused on water, and more specifically groundwater. The network will place an emphasis on inclusiveness and diversity in order to facilitate the global exchange of ideas, to contribute to groundwater resilience around the world.",
  },
];

export function PartnersSection() {
  return (
    <section className={styles.partners} id="partners">
      <div className={styles.inner}>
        <div className={styles.header}>
          <span className={styles.kicker}>Collaboration</span>
          <h2>
            Our <span>Partners</span>
          </h2>
          <Link
            className={styles["weather-heading"]}
            href="/partners"
            aria-label="Open real-time weather forecast page"
          >
            <span>Our</span>
            <strong>Sponsors</strong>
          </Link>
          <p>
            AQUASMART Mini works alongside research and water-management
            organizations to keep our models grounded in real science and
            real fields.
          </p>
        </div>

        <div className={styles.partnerGrid}>
          {partners.map((partner) => (
            <div
              aria-label={partner.description}
              className={styles.partnerLogo}
              key={partner.name}
              style={{ "--logo-width": `${partner.logoWidth}px` } as CSSProperties}
              tabIndex={0}
            >
              <div className={styles.logoFrame}>
                <Image
                  className={`${styles.logoImage} ${styles.defaultLogo}`}
                  src={partner.defaultLogo}
                  alt={`${partner.name} logo`}
                  width={531}
                  height={199}
                />
                <Image
                  aria-hidden="true"
                  className={`${styles.logoImage} ${styles.hoverLogo}`}
                  src={partner.logo}
                  alt=""
                  width={531}
                  height={199}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
