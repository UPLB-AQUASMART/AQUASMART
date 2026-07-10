"use client";

import Image from "next/image";
import { useState } from "react";

import type { LearningModule } from "@/app/data/home";
import styles from "./LearningModuleCard.module.css";

type LearningModuleCardProps = {
  module: LearningModule;
};

export function LearningModuleCard({ module }: LearningModuleCardProps) {
  const [imageSrc, setImageSrc] = useState(module.image);
  const hasPdf = module.pdfHref && module.pdfHref !== "#";
  const isRemoteImage =
    imageSrc.startsWith("http://") || imageSrc.startsWith("https://");
  const isApiImage = imageSrc.startsWith("/api/");

  return (
    <article className={styles.card}>
      <div className={styles.photo}>
        <Image
          src={imageSrc}
          alt=""
          fill
          onError={() => setImageSrc("/assets/module-networking.png")}
          sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 390px"
          unoptimized={isRemoteImage || isApiImage}
        />
      </div>
      <div className={styles.desc}>
        <span className={styles.category}>{module.category}</span>
        <div className={styles["module-title-row"]}>
          <h2>{module.code}</h2>
          <span>{module.title}</span>
        </div>
        <p>{module.description}</p>
        <div className={styles.footer}>
          {module.date ? <span>{module.date}</span> : null}
          {hasPdf ? (
            <a href={module.pdfHref} rel="noreferrer" target="_blank">
              View PDF -&gt;
            </a>
          ) : (
            <span>PDF pending</span>
          )}
        </div>
      </div>
    </article>
  );
}
