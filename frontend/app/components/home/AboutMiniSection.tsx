import { SectionPill } from "./SectionPill";

export function AboutMiniSection() {
  return (
    <section className="about-mini-section">
      <SectionPill>About AQUASMART mini</SectionPill>
      <h2>
        <span>Smaller Scale</span>
        for Better Understanding
      </h2>
      <p>
        AQUASMART Mini provides <strong>information</strong>,{" "}
        <strong>projection</strong>, and <strong>simulation</strong> related to
        irrigation systems and models while also providing a simplified version
        and views for all users.
      </p>
    </section>
  );
}
