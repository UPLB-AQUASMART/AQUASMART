import { ScrollRevealInit } from "@/app/components/home/ScrollRevealInit";
import { SiteNav } from "@/app/components/home/SiteNav";
import { SiteFooter } from "@/app/components/home/SiteFooter";
import { ForecastPageClient } from "./ForecastPageClient";

import styles from "./page.module.css";

export default function ForecastPage() {
  return (
    <main className={styles["weather-page"]}>
      <ScrollRevealInit />
      <SiteNav activeLabel="Weather" />
      <ForecastPageClient />
      <SiteFooter />
    </main>
  );
}
