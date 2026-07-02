import Image from "next/image";

import revealStyles from "./ScrollReveal.module.css";
import styles from "./PartnersSection.module.css";

const sponsorships = [
  {
    id: "egu",
    logo: "/assets/partners/partner-1.png",
    logoAlt: "European Geosciences Union",
    image: "/assets/partners/egu-news.png",
    imageAlt: "EGU Public Engagement Grants news card",
    description: (
      <>
        The <strong>European Geosciences Union</strong> (EGU) is the leading organisation for Earth,
        planetary and space science research in Europe. With our partner organisations worldwide, we
        foster fundamental geoscience research, alongside applied research that addresses key societal
        and environmental challenges.
      </>
    ),
  },
  {
    id: "gwyn",
    logo: "/assets/partners/partner-8.png",
    logoAlt: "Groundwater Youth Network",
    image: "/assets/partners/gwyn-photo.png",
    imageAlt: "Groundwater Youth Network gathering",
    description: (
      <>
        The <strong>Groundwater Youth Network</strong> (GWYN) is a youth led network aiming to provide
        a coordination mechanism between pre-existing youth organizations focused on water, and more
        specifically groundwater. The network will place an emphasis on inclusiveness and diversity in
        order to facilitate the global exchange of ideas, to contribute to groundwater resilience around
        the world.
      </>
    ),
  },
];

export function PartnersSection() {
  return (
    <section className={`${styles.sponsors} ${revealStyles["scroll-reveal"]}`} id="partners">
      <h2 className={styles.sponsorships}>Sponsorships</h2>

      <article className={`${styles.sponsorRow} ${styles.eguRow}`}>
        <div className={styles.sponsorDescription}>
          <Image
            className={styles.eguLogo}
            src={sponsorships[0].logo}
            alt={sponsorships[0].logoAlt}
            width={267}
            height={117}
            priority={false}
          />
          <p>{sponsorships[0].description}</p>
        </div>

        <Image
          className={styles.sponsorImage}
          src={sponsorships[0].image}
          alt={sponsorships[0].imageAlt}
          width={534}
          height={462}
        />
      </article>

      <article className={`${styles.sponsorRow} ${styles.gwynRow}`}>
        <Image
          className={styles.sponsorImage}
          src={sponsorships[1].image}
          alt={sponsorships[1].imageAlt}
          width={533}
          height={462}
        />

        <div className={`${styles.sponsorDescription} ${styles.gwynDescription}`}>
          <Image
            className={styles.gwynLogo}
            src={sponsorships[1].logo}
            alt={sponsorships[1].logoAlt}
            width={210}
            height={100}
          />
          <p>{sponsorships[1].description}</p>
        </div>
      </article>
    </section>
  );
}
