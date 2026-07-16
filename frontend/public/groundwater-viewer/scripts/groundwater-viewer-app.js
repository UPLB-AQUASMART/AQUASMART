/*
  AQUASMART Groundwater Viewer App

  Lightweight module loader for the standalone groundwater viewer.
  View-specific implementation lives in the sibling files below.
*/

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const viewerScriptBase = new URL("./", import.meta.url);
const viewerRuntimeVersion = "river-flow-arrow-response-20260714";
const viewerRuntimeFiles = [
  "groundwater-viewer-shared.js",
  "groundwater-3d-model-view.js",
  "groundwater-top-view-model.js",
  "groundwater-section-view-model.js",
  "groundwater-viewer-controls.js",
];

async function loadViewerRuntime() {
  window.THREE = THREE;
  window.OrbitControls = OrbitControls;

  for (const fileName of viewerRuntimeFiles) {
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      const scriptUrl = new URL(fileName, viewerScriptBase);
      scriptUrl.searchParams.set("v", viewerRuntimeVersion);
      script.src = scriptUrl.href;
      script.async = false;
      script.onload = resolve;
      script.onerror = () =>
        reject(new Error(`Could not load ${fileName}`));
      document.head.appendChild(script);
    });
  }
}

loadViewerRuntime().catch((error) => {
  const statusEl = document.querySelector("#status");
  if (statusEl) {
    statusEl.className = "status error";
    statusEl.textContent = "Could not start the groundwater viewer runtime.";
  }
  console.error("Could not start groundwater viewer", error);
});
