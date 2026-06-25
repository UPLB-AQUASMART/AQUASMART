import Image from "next/image";
import Link from "next/link";

import revealStyles from "./ScrollReveal.module.css";
import styles from "./WeatherPreviewSection.module.css";

const previewImages = [
  {
    src: "/assets/weather-preview-light-rain.png",
    alt: "AQUASMART light rainfall forecast preview",
  },
  {
    src: "/assets/weather-preview-heavy-rain.png",
    alt: "AQUASMART heavy rainfall forecast preview",
  },
  {
    src: "/assets/weather-preview-sunny.png",
    alt: "AQUASMART sunny weather forecast preview",
  },
];

export function WeatherPreviewSection() {
  return (
    <section
      className={`${styles["weather-preview-section"]} ${revealStyles["scroll-reveal"]}`}
      id="weather"
    >
      <div className={styles["radial-accent"]} aria-hidden="true" />
      <div className={styles["radial-accent-bottom"]} aria-hidden="true" />

      <Link className={styles["weather-heading"]} href="/forecast" aria-label="Open real-time weather forecast page">
        <span>Real-time</span>
        <strong>Weather Forecast</strong>
      </Link>

      <div className={styles["weather-preview-content"]}>
        <Link className={styles["forecast-preview-card"]} href="/forecast" aria-label="Open forecast page">
          {previewImages.map((image, index) => (
            <Image
              alt={image.alt}
              className={styles["forecast-preview-image"]}
              fill
              key={image.src}
              priority={index === 0}
              sizes="(max-width: 900px) 100vw, 54vw"
              src={image.src}
            />
          ))}
        </Link>

        <div className={styles["weather-description"]}>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
            tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim  
            veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea  
            commodo consequat. Duis aute irure dolor in reprehenderit in voluptate  
            velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint  occaecat 
            cupidatat non proident, sunt in culpa qui officia deserunt  mollit anim id 
            est laborum Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
            tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim  
            veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea  
            commodo consequat. 
  
          </p>
          <p>
            Open the full weather page to compare sunny, light-rain, and
            heavy-rain scenarios, review the weekly forecast card, and see
            irrigation guidance based on rainfall, salinity, and pH readings.
          </p>
        </div>
      </div>
    </section>
  );
}
