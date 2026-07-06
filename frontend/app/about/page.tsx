import { AquaWebGLBackground } from "@/app/components/effects/AquaWebGLBackground";
import { ScrollRevealInit } from "@/app/components/home/ScrollRevealInit";
import revealStyles from "@/app/components/home/ScrollReveal.module.css";
import { SiteFooter } from "@/app/components/home/SiteFooter";
import { SiteNav } from "@/app/components/home/SiteNav";
import { WaterSavingScaleSection } from "@/app/about/WaterSavingScaleSection";
import GroundwaterSection from "./GroundwaterSection";
import styles from "./page.module.css";

const narrativeItems = [
  {
    number: "01",
    title: "Hands-on Groundwater Learning",
    body: "AQUASMART Mini introduces climate-resilient groundwater management through an interactive aquifer and farm model.",
  },
  {
    number: "02",
    title: "Visible Subsurface Processes",
    body: "The model demonstrates infiltration, recharge, groundwater flow, pumping, and contaminant transport.",
  },
  {
    number: "03",
    title: "Real-time Sensor Data",
    body: "Low-cost sensors monitor groundwater depth, pH, electrical conductivity, and salinity.",
  },
  {
    number: "04",
    title: "Web-based Dashboard",
    body: "Live readings are transmitted to a dashboard with simple visualizations of groundwater conditions.",
  },
  {
    number: "05",
    title: "Community Outreach",
    body: "Demonstrations, workshops, booklets, activity sheets, and posters make the science accessible.",
  },
];

export default function AboutPage() {
  return (
    <main className={styles.page}>
      <ScrollRevealInit />
      <SiteNav activeLabel="About" />
      <section className={`${styles.introSection} ${revealStyles["scroll-reveal"]}`}>
        <div className={styles.heroOrbOne} aria-hidden="true" />
        <div className={styles.heroOrbTwo} aria-hidden="true" />
        <div className={styles.introReveal}>
          <div className={styles.introCopy}>
            <div className={styles.badge}>About AQUASMART Mini</div>
            <h1>
              AQUASMART <span>Mini</span>
            </h1>
            <p>
              AQUASMART Mini translates groundwater science into an
              interactive, sensor-based miniature aquifer and farm system. It
              helps students, teachers, farmers, local officials, and
              communities understand how groundwater connects to sustainable
              agriculture and climate-resilient water management.
            </p>
          </div>

          <div className={styles.introVisual} aria-hidden="true">
            <AquaWebGLBackground className={styles.introCanvas} />
            <span className={styles.visualLabel}>Living water intelligence</span>
            <span className={styles.visualCaption}>AQUASMART / WebGL2</span>
          </div>
        </div>
      </section>
      <WaterSavingScaleSection />
      <GroundwaterSection />
      <section
        className={`${styles.narrativeSection} ${revealStyles["scroll-reveal"]}`}
        id="about-narrative"
      >
        {/* <div className={styles.narrativeWatermark} aria-hidden="true">
          AQUA
        </div> */}
        <div className={styles.narrativeShell}>
          <div className={styles.narrativeCopy}>
            <span className={styles.narrativeEyebrow}>AQUASMART Mini</span>
            <h2>
              Project Purpose.
              <br />
              <span>Outreach in Action.</span>
            </h2>
            <p>
              AQUASMART Mini is the public engagement component of the larger
              AQUASMART research project at the University of the Philippines
              Los Banos. It promotes climate-resilient groundwater management
              in farming systems through hands-on learning.
            </p>
            <p>
              By combining a miniature aquifer and farm model, low-cost
              sensors, live dashboard data, and printed learning tools, the
              project turns hidden groundwater processes into clear and
              relatable experiences for students, teachers, farmers, local
              officials, and communities.
            </p>
            {/* <a className={styles.narrativeCta} href="#contact">
              Connect With Us <span aria-hidden="true">-&gt;</span>
            </a> */}
          </div>

          <div className={styles.narrativeList}>
            {narrativeItems.map((item) => (
              <article className={styles.narrativeItem} key={item.number}>
                <span>{item.number}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <SiteFooter dark />
    </main>
  );
}
