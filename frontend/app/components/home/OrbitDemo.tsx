"use client";

import { Orbit } from "./Orbit";

// Card data now comes from @/app/data/home (see the `orbitCards` export
// there) instead of being passed in as a prop — this demo just renders
// the component as it'll actually be used on the real page.
export default function OrbitDemo() {
  return (
    <section
      style={{
        display: "flex",
        alignItems: "center",
        gap: "48px",
        minHeight: "100vh",
        padding: "0 48px",
        background: "linear-gradient(155deg, #0a1626 0%, #0b1f3a 55%, #0a1626 100%)",
      }}
    >
      <div style={{ flex: "1 1 640px" }}>
        <Orbit
          align="left"
          rotateSpeed={45}
          // Swap in a real GIF path once you have one, e.g. "/assets/orbit-bg.gif"
          backgroundImageUrl={undefined}
        />
      </div>

      <div style={{ flex: "1 1 420px", color: "#ffffff", fontFamily: "Sora, sans-serif" }}>
        <span
          style={{
            display: "inline-block",
            marginBottom: "16px",
            padding: "10px 24px",
            borderRadius: "999px",
            background: "#eaf7fb",
            color: "#1fa3c9",
            fontSize: "13px",
            fontWeight: 700,
          }}
        >
          Meet the Team
        </span>
        <h1 style={{ margin: "0 0 16px", fontSize: "clamp(32px, 3.6vw, 46px)", fontWeight: 800 }}>
          Behind <span style={{ color: "#4fc3e8" }}>AQUASMART Mini</span>
        </h1>
        <p style={{ margin: 0, color: "rgba(226, 236, 245, 0.72)", fontSize: "16px", lineHeight: 1.7 }}>
          This is a placeholder page just to preview the Orbit component.
          Delete or adapt this file once you&apos;ve wired Orbit into your actual
          page.
        </p>
      </div>
    </section>
  );
}
