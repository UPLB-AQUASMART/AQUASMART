import Image from "next/image";

import type { LearningModule } from "@/app/data/home";
import styles from "./LearningModuleCard.module.css";

type LearningModuleCardProps = {
  module: LearningModule;
};

export function LearningModuleCard({ module }: LearningModuleCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.photo}>
        <Image
          src={module.image}
          alt=""
          fill
          sizes="(max-width: 900px) 100vw, 388px"
        />
      </div>
      <div className={styles.desc}>
        <div className={styles["module-title-row"]}>
          <h2>{module.code}</h2>
          <span>{module.title}</span>
        </div>
        <p>{module.description}</p>
      </div>
    </article>
  );
}
