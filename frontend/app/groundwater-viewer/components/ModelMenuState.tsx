export function ModelMenuState() {
  return (
    <div className="menu-state" id="menu-3d-state">
      <header className="cluster-header">
        <h1>Cluster 1A</h1>
        <div className="cluster-location">Los Baños Laguna</div>
        <div className="active-wells-label">Active Wells</div>
        <div className="active-wells-count" id="active-well-count">
          0/0
        </div>
      </header>
      <div className="status" id="status">
        Loading scene JSON...
      </div>
      <p className="model-scope-note">
        Conceptual 3D viewer. Run a top-view scenario for MODFLOW output.
      </p>
      <div className="legend" id="legend" />
      <div className="well-picker" id="well-picker" />
      <p className="well-menu-hint">click an active well for more information</p>
    </div>
  );
}
