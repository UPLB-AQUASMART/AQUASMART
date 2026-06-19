export function HeroSection() {
  return (
    <section className="hero-section scroll-reveal">
      <img className="hero-image" src="/figma/hero.png" alt="" />
      <div className="hero-fade" />
      <div className="hero-copy">
        <h1>
          Smarter System
          <span>
            Stronger <em>Harvest</em>
          </span>
        </h1>
        <p>
          AQUASMART provides real-time irrigation monitoring, water analytics,
          and AI-powered smart farming solutions for sustainable agriculture.
        </p>
      </div>
    </section>
  );
}
