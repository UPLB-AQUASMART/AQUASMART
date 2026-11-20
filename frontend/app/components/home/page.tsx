import { WeatherPreviewSection } from "./WeatherPreviewSection";
import { ModulesSection } from "./ModulesSection";
import { getLearningModules } from "@/app/modules/moduleData";

import styles from "./page.module.css";

export default async function HomePage() {
  const modules = await getLearningModules();

  return (
    <main className={styles["merged-section"]}>
      <WeatherPreviewSection />
      <ModulesSection modules={modules} />
    </main>
  );
}
