import { WeatherPreviewSection } from "./WeatherPreviewSection";
import { ModulesSection } from "./ModulesSection";

import styles from "./page.module.css";

export default function HomePage() {
  return (
    <main className={styles["merged-section"]}>
      <WeatherPreviewSection />
      <ModulesSection />
    </main>
  );
}
