import type { ReactNode } from "react";

type SectionPillProps = {
  children: ReactNode;
};

export function SectionPill({ children }: SectionPillProps) {
  return <div className="section-pill">{children}</div>;
}
