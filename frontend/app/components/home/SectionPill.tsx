import type { ReactNode } from "react";
import styles from "./SectionPill.module.css";

type SectionPillProps = {
  children: ReactNode;
  className?: string;
};

export function SectionPill({ children, className }: SectionPillProps) {
  return (
    <div className={`${styles["section-pill"]}${className ? ` ${className}` : ""}`}>
      {children}
    </div>
  );
}
