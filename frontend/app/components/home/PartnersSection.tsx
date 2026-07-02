import revealStyles from "./ScrollReveal.module.css";
import styles from "./PartnersSection.module.css";

const partnerLogos = [
  "/assets/partners/partner-8.png",
  "/assets/partners/partner-7.png",
  "/assets/partners/partner-6.png",
  "/assets/partners/partner-5.png",
  // "/assets/partners/partner-4.png",
  // "/assets/partners/partner-3.png",
  // "/assets/partners/partner-2.png",
  "/assets/partners/partner-1.png",
];

const partnerLoop = [...partnerLogos, ...partnerLogos, ...partnerLogos];
const reversedPartnerLogos = [...partnerLogos].reverse();
const partnerLoopReverse = [
  ...reversedPartnerLogos,
  ...reversedPartnerLogos,
  ...reversedPartnerLogos,
];

export function PartnersSection() {
  return (
    <section className={`${styles["partners-section"]} ${revealStyles["scroll-reveal"]}`} id="partners">
      <div className={styles["partners-header"]}>
        <h2>Supported By</h2>
      </div>
      <div className={styles["partners-marquee-viewport"]} aria-label="Research and institutional partner logos">
        <div className={`${styles["partners-marquee-track"]} ${styles["partners-row-left"]}`}>
          {partnerLoop.map((logo, index) => (
            <div className={styles["partner-logo-tile"]} key={`${logo}-left-${index}`}>
              <img src={logo} alt="" />
            </div>
          ))}
        </div>
        <div className={`${styles["partners-marquee-track"]} ${styles["partners-row-right"]}`}>
          {partnerLoopReverse.map((logo, index) => (
            <div className={styles["partner-logo-tile"]} key={`${logo}-right-${index}`}>
              <img src={logo} alt="" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
