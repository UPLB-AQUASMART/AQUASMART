import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

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

      <div className={styles["weather-preview-content"]}>
        <div className={styles["weather-description"]}>
          <Link
            className={styles["weather-heading"]}
            href="/forecast"
            aria-label="Open real-time weather forecast page"
          >
            <span>Real-time</span>
            <strong>Weather Forecast</strong>
          </Link>
          <p>
            AQUASMART pulls live rainfall, temperature, and evapotranspiration
            data throughout the day and turns it into an irrigation-ready
            forecast, so you know not just whether it will rain, but whether
            your field actually needs water.
          </p>
          <p>
            Each forecast is paired with your field&apos;s own salinity and pH
            readings, so recommendations reflect real conditions on the ground,
            not just the sky above it.
          </p>
          <Link className={styles["forecast-cta"]} href="/forecast">
            <span>View Today's Forecast</span>
            <ArrowRight size={25} strokeWidth={2.8} aria-hidden="true" />
          </Link>
        </div>

        <Link className={styles["forecast-preview-card"]} href="/forecast" aria-label="Open forecast page">
          {previewImages.map((image, index) => (
            <Image
              alt={image.alt}
              className={styles["forecast-preview-image"]}
              fill
              key={image.src}
              priority={index === 0}
              sizes="(max-width: 900px) 100vw, 45vw"
              src={image.src}
            />
          ))}
        </Link>
      </div>
    </section>
  );
}
