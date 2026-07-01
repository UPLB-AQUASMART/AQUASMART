export function SectionViewOverlay() {
  return (
    <section
      className="section-view"
      id="section-view"
      aria-label="2D well section view"
    >
      <canvas id="section-canvas" />
      <div className="section-toolbar">
        <div className="section-actions">
          <ToolbarButton id="top-view-back" icon="back" label="Back to section" hidden />
          <ToolbarButton id="section-zoom-out" icon="zoomOut" label="Zoom out" />
          <ToolbarButton id="section-zoom-in" icon="zoomIn" label="Zoom in" />
          <ToolbarButton id="hide-section-panel" icon="panel" label="Hide menu" />
          <ToolbarButton id="section-exit" icon="close" label="Exit 2D view" />
        </div>
      </div>
      <SensorSpecsPanel />
    </section>
  );
}

function ToolbarButton({
  id,
  icon,
  label,
  hidden,
}: {
  id: string;
  icon: "back" | "zoomOut" | "zoomIn" | "panel" | "close";
  label: string;
  hidden?: boolean;
}) {
  return (
    <button id={id} type="button" hidden={hidden}>
      <ToolbarIcon icon={icon} />
      <span>{label}</span>
    </button>
  );
}

function ToolbarIcon({
  icon,
}: {
  icon: "back" | "zoomOut" | "zoomIn" | "panel" | "close";
}) {
  if (icon === "back") {
    return (
      <svg className="ui-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="m12 19-7-7 7-7" />
        <path d="M19 12H5" />
      </svg>
    );
  }

  if (icon === "panel") {
    return (
      <svg className="ui-icon" viewBox="0 0 24 24" aria-hidden="true">
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M9 3v18" />
        <path d="m16 15-3-3 3-3" />
      </svg>
    );
  }

  if (icon === "close") {
    return (
      <svg className="ui-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </svg>
    );
  }

  return (
    <svg className="ui-icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <path d="M8 11h6" />
      {icon === "zoomIn" ? <path d="M11 8v6" /> : null}
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function SensorSpecsPanel() {
  return (
    <aside className="sensor-specs" id="sensor-specs" hidden>
      <header>
        <h2 id="sensor-specs-title">Sensor specs</h2>
        <button id="sensor-specs-close" type="button">
          Close
        </button>
      </header>
      <select id="sensor-specs-select" aria-label="Select sensor" />
      <dl id="sensor-specs-list" />
    </aside>
  );
}
