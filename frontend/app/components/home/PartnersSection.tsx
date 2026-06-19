import { partners } from "@/app/data/home";

export function PartnersSection() {
  return (
    <section className="partners-section" id="partners">
      <h2>Research Institutions/Partners</h2>
      <div className="partner-grid">
        {partners.map((partner) => (
          <div className="partner-logo" key={partner}>
            {partner}
          </div>
        ))}
      </div>
    </section>
  );
}
