import Image from "next/image";

import { SiteFooter } from "@/app/components/home/SiteFooter";
import { SiteNav } from "@/app/components/home/SiteNav";
import styles from "./page.module.css";

const spotlightPartners = [
  {
    name: "EGU",
    fullName: "European Geosciences Union",
    logo: "/assets/partners/partner-1.png",
    logoWidth: 220,
    logoHeight: 88,
    description:
      "EGU, the European Geosciences Union, is Europe’s premier geosciences union, dedicated to the pursuit of excellence in the Earth, planetary, and space sciences for the benefit of humanity, worldwide. It was established in September 2002 as a merger of the European Geophysical Society (EGS) and the European Union of Geosciences (EUG), and has headquarters in Munich, Germany.",
  },
  {
    name: "GWYN",
    fullName: "Groundwater Youth Network",
    logo: "/assets/partners/partner-8.png",
    logoWidth: 200,
    logoHeight: 96,
    description:
      "The Groundwater Youth Network (GWYN) is a youth led network aiming to provide a coordination mechanism between pre-existing youth organizations focused on water, and more specifically groundwater. The network will place an emphasis on inclusiveness and diversity in order to facilitate the global exchange of ideas, to contribute to groundwater resilience around the world.",
  },
];

const spotlightNews = {
  headline: "EGU Public Engagement Grants: 2025 Winners Announced",
  image: "/assets/partners/egu-news.svg",
  href: "https://www.egu.eu/news/1511/egu-public-engagement-grants-2025-winners-announced/",
};

export default function PartnersPage() {
  return (
    <main className={styles.page}>
      <SiteNav activeLabel="Partners" />
      <PartnerSpotlight />
      <SiteFooter />
    </main>
  );
}

export function PartnerSpotlight() {
  return (
    <section className={styles.spotlight} id="partner-spotlight">
      <div className={styles.inner}>
        <div className={styles.copyColumn}>
          <h2 className={styles.heading}>
            Proudly
            <br />
            Supported
            <br />
            <span className={styles.accent}>Internationally</span>.
          </h2>

          <div className={styles.partnerList}>
            {spotlightPartners.map((partner) => (
              <div className={styles.partnerBlock} key={partner.name}>
                <div className={styles.logoRow}>
                  <Image
                    src={partner.logo}
                    alt={partner.fullName}
                    width={partner.logoWidth}
                    height={partner.logoHeight}
                  />
                </div>
                <p>{partner.description}</p>
              </div>
            ))}
          </div>
        </div>

        <a
          className={styles.newsCard}
          href={spotlightNews.href}
          rel="noopener noreferrer"
          target="_blank"
        >
          <Image
            alt={spotlightNews.headline}
            className={styles.newsImage}
            fill
            sizes="(max-width: 900px) 100vw, 50vw"
            src={spotlightNews.image}
          />
        </a>
      </div>
    </section>
  );
}
