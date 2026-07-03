"use client";

import dynamic from "next/dynamic";

// The Three.js canvas touches window/WebGL, so it must be client-only.
// Loading it via next/dynamic with ssr:false keeps the server render clean.
const GroundwaterModel = dynamic(() => import("./GroundwaterModel"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#9aa3af",
        fontSize: "13px",
      }}
    >
      Loading model…
    </div>
  ),
});

export default function GroundwaterSection() {
  return (
    <section className="gw-section">
      <div className="gw-grid">
        <div className="gw-model-col">
          <div className="gw-model-frame">
            <GroundwaterModel />
          </div>
          <p className="gw-caption">Rotate model to observe</p>
        </div>

        <div className="gw-copy-col">
          <h2 className="gw-heading">
            <span className="gw-heading-accent">Smaller Scale</span>
            <span className="gw-heading-dark">for Better</span>
            <span className="gw-heading-dark">Understanding</span>
          </h2>
          <p className="gw-body">
            We translate complex hydrogeological concepts into a hands-on,
            sensor-based model supported by digital and printed learning
            tools, this project promotes public awareness of groundwater
            systems, sustainable farming, and climate adaptation.
          </p>
        </div>
      </div>

      <style jsx>{`
        .gw-section {
          width: 100%;
          padding: 64px 24px;
          background: #ffffff;
        }

        .gw-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: center;
        }

        .gw-model-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
        }

        .gw-model-frame {
          width: 100%;
          aspect-ratio: 16 / 10;
        }

        .gw-caption {
          font-size: 13px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #6b7280;
          margin: 0;
        }

        .gw-copy-col {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .gw-heading {
          margin: 0;
          font-size: 44px;
          line-height: 1.12;
          font-weight: 800;
          display: flex;
          flex-direction: column;
        }

        .gw-heading-accent {
          color: #4ade80;
        }

        .gw-heading-dark {
          color: #0f2540;
        }

        .gw-body {
          margin: 0;
          font-size: 17px;
          line-height: 1.7;
          color: #6b7280;
          max-width: 46ch;
        }

        @media (max-width: 900px) {
          .gw-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }

          .gw-copy-col {
            text-align: center;
            align-items: center;
          }

          .gw-heading {
            font-size: 34px;
            align-items: center;
          }

          .gw-body {
            max-width: 100%;
          }
        }
      `}</style>
    </section>
  );
}
