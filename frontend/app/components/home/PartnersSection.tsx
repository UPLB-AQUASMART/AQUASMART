import styles from "./PartnersSection.module.css";

// Swap `wordmark`/`accentIndex` for a real logo image once artwork is
// available — e.g. replace the <span> block below with:
// <img src="/assets/partners/egu.svg" alt="EGU" />
const partners = [
  {
    name: "EGU",
    wordmark: "EGU",
    accentIndex: 1,
    tagline: "Earth & Geosciences",
    description:
      "Collaborating on groundwater and climate research that informs how AQUASMART Mini models water systems.",
  },
  {
    name: "GWYN",
    wordmark: "Gwyn",
    accentIndex: 0,
    tagline: "Water Resources",
    description:
      "Partnering on field data and irrigation insights that help ground AQUASMART Mini's simulations in real conditions.",
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
          <p>
            AQUASMART Mini works alongside research and water-management
            organizations to keep our models grounded in real science and
            real fields.
          </p>
        </div>

        <div className={styles.partnerGrid}>
          {partners.map((partner) => (
            <div className={styles.partnerColumn} key={partner.name}>
              <div className={styles.logoMark}>
                <span className={styles.logoWordmark}>
                  {partner.wordmark.split("").map((letter, index) => (
                    <span
                      className={index === partner.accentIndex ? styles.accent : undefined}
                      key={`${partner.name}-${index}`}
                    >
                      {letter}
                    </span>
                  ))}
                  <span className={styles.logoTagline}>{partner.tagline}</span>
                </span>
              </div>

              <h3>{partner.name}</h3>
              <p>{partner.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
