import Image from "next/image";
import { Handshake, LineChart, Sprout, Users } from "lucide-react";

import revealStyles from "./ScrollReveal.module.css";
import styles from "./PartnersSection.module.css";

const partnerOutcomes = [
  {
    icon: Sprout,
    title: "Field Impact",
    body: "Support groundwater literacy, sensor-led learning, and sustainable irrigation practices in farming communities.",
  },
  {
    icon: LineChart,
    title: "Research Visibility",
    body: "Help translate monitoring, modeling, and water-quality insights into public-facing educational tools.",
  },
  {
    icon: Users,
    title: "Youth Engagement",
    body: "Connect young researchers, students, and practitioners through hands-on groundwater and climate adaptation outreach.",
  },
  {
    icon: Handshake,
    title: "Institutional Collaboration",
    body: "Build shared programs with academic, development, food systems, and geoscience partners.",
  },
];

const miniPartners = [
  {
    name: "European Geosciences Union",
    logo: "/assets/partners/partner-1.png",
    href: "https://www.egu.eu/",
  },
  {
    name: "Food and Agriculture Organization of the United Nations",
    logo: "/assets/partners/partner-2.png",
    href: "https://www.fao.org/home/en",
  },
  {
    name: "Nestle",
    logo: "/assets/partners/partner-3.png",
    href: "https://www.nestle.com/",
  },
  {
    name: "UNESCO",
    logo: "/assets/partners/partner-4.png",
    href: "https://www.unesco.org/en",
  },
  {
    name: "Youth Impact",
    logo: "/assets/partners/partner-5.png",
    href: "#partners",
  },
  {
    name: "World Food Forum Global Youth Action",
    logo: "/assets/partners/partner-6.png",
    href: "https://www.world-food-forum.org/",
  },
  {
    name: "Swiss Water Partnership Youth",
    logo: "/assets/partners/partner-7.png",
    href: "https://www.swisswaterpartnership.ch/youth/",
  },
  {
    name: "Groundwater Youth Network",
    logo: "/assets/partners/partner-8.png",
    href: "#partners",
  },
];

export function PartnersSection() {
  return (
    <section className={`${styles.partners} ${revealStyles["scroll-reveal"]}`} id="partners">
      <div className={styles.inner}>
        <div className={styles.header}>
          <span className={styles.kicker}>Sponsors & Partners</span>
          <h2>
            Don&apos;t Just Fund a Model.
            <span>Move Groundwater Learning Forward.</span>
          </h2>
          <p>
            AQUASMART Mini brings together research institutions, food systems
            partners, youth networks, and geoscience communities to make
            groundwater science easier to understand, teach, and act on.
          </p>
        </div>

        <div className={styles.outcomeGrid} aria-label="Partnership outcomes">
          {partnerOutcomes.map((item) => {
            const Icon = item.icon;

            return (
              <article className={styles.outcomeCard} key={item.title}>
                <span className={styles.iconBox} aria-hidden="true">
                  <Icon size={26} strokeWidth={2.1} />
                </span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            );
          })}
        </div>

        <div className={styles.logoBlock}>
          <span className={styles.logoLabel}>Past Sponsors & Partners</span>
          <div className={styles.logoGrid}>
            {miniPartners.map((partner) => (
              <a
                className={styles.logoCard}
                href={partner.href}
                key={partner.name}
                rel={partner.href.startsWith("http") ? "noopener noreferrer" : undefined}
                target={partner.href.startsWith("http") ? "_blank" : undefined}
              >
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  width={260}
                  height={120}
                />
              </a>
            ))}
          </div>
        </div>

        <a className={styles.cta} href="/contact">
          Partner With AQUASMART Mini <span aria-hidden="true">-&gt;</span>
        </a>
      </div>
    </section>
  );
}
