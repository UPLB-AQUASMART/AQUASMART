import * as THREE from "three";

/**
 * Ported from groundwater-viewer-app.js (toScenePoint / colorArray /
 * makeTerrainColors / makeSurface). Converts the raw scene JSON's
 * (x_m, y_m, elevation_m) coordinates into Three.js scene units, and
 * builds BufferGeometry from the pre-triangulated vertex/face lists.
 */

const X_SCALE = 1 / 1000;
const Y_SCALE = 1 / 1000;
const Z_SCALE = 11 / 1000;

/** Returns a (point) => THREE.Vector3 converter for the given scene domain. */
export function makeSceneScaler(domain) {
  const centerX = domain.lx_m / 2;
  const centerY = domain.ly_m / 2;
  return (point) =>
    new THREE.Vector3(
      (point[0] - centerX) * X_SCALE,
      (point[2] || 0) * Z_SCALE,
      (point[1] - centerY) * Y_SCALE
    );
}

function colorArray(hexColors) {
  const values = [];
  const color = new THREE.Color();
  for (const hex of hexColors) {
    color.set(hex);
    values.push(color.r, color.g, color.b);
  }
  return new Float32Array(values);
}

/** Same elevation/river/sand heuristic the original app uses to tint the terrain top. */
function makeTerrainColors(vertices, domain) {
  const values = [];
  const color = new THREE.Color();
  for (const [x, y, z] of vertices) {
    const x01 = x / domain.lx_m;
    const y01 = y / domain.ly_m;
    const riverA = Math.abs(y01 - (0.22 + 0.08 * Math.sin(x01 * 10)));
    const riverB = Math.abs(y01 - (0.68 - 0.05 * Math.cos(x01 * 13)));
    if (riverA < 0.015 || riverB < 0.012) {
      color.set("#2f83d8");
    } else if (z > 354) {
      color.set("#557c35");
    } else if ((x01 > 0.58 && y01 > 0.48) || z < 300) {
      color.set("#c7b783");
    } else {
      color.set("#78a953");
    }
    values.push(color.r, color.g, color.b);
  }
  return new Float32Array(values);
}

/**
 * Builds a BufferGeometry from a { vertices, faces } surface object.
 * options.terrainColors -> tint per-vertex using elevation heuristic (needs domain)
 * options.vertexColors  -> use surface.vertexColors hex array if present
 */
export function buildSurfaceGeometry(surface, toScenePoint, options = {}) {
  const geometry = new THREE.BufferGeometry();
  const positions = [];
  for (const vertex of surface.vertices) {
    const p = toScenePoint(vertex);
    positions.push(p.x, p.y, p.z);
  }
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(surface.faces.flat());
  geometry.computeVertexNormals();

  if (options.terrainColors && options.domain) {
    geometry.setAttribute(
      "color",
      new THREE.BufferAttribute(makeTerrainColors(surface.vertices, options.domain), 3)
    );
  } else if (surface.vertexColors) {
    geometry.setAttribute("color", new THREE.BufferAttribute(colorArray(surface.vertexColors), 3));
  }

  return geometry;
}

/** Display names for well IDs, ported from wellPresentation in the original app. */
export const WELL_PRESENTATION = {
  "W-1": { name: "UP Pumping" },
  "W-2": { name: "DOST Monitoring" },
  "W-3": { name: "Pili Pumping" },
  "W-4": { name: "Calamba Monitoring" },
};
