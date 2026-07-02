/* eslint-disable */
/* Three.js 3D groundwater model helpers, camera controls, wells, and flow traces. */

function toScenePoint(point) {
  return new THREE.Vector3(
    (point[0] - centerX) * xScale,
    (point[2] || 0) * zScale,
    (point[1] - centerY) * yScale,
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

const waterTextureCache = new Map();

function isAquiferType(type) {
  return Object.hasOwn(aquiferLevelNumbers, type);
}

function aquiferColor(type) {
  if (type === "Upper Aquifer") return "#1f9bef";
  if (type === "Middle Aquifer") return "#158bd7";
  if (type === "Lower Aquifer") return "#0d72bd";
  return "#158bd7";
}

function getLayerFill(layer) {
  if (isAquiferType(layer.type)) {
    return aquiferColor(layer.type);
  }
  return (
    sceneData?.legend?.layerColors?.[layer.type] ||
    layer.sideColor ||
    "#9ca3af"
  );
}

function makeWaterTexture(colorHex) {
  if (waterTextureCache.has(colorHex)) {
    return waterTextureCache.get(colorHex);
  }
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  context.fillStyle = colorHex;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = "rgba(226, 246, 255, 0.16)";
  context.lineWidth = 2;
  for (let y = -24; y < canvas.height + 24; y += 18) {
    context.beginPath();
    for (let x = -12; x <= canvas.width + 12; x += 12) {
      const yy = y + Math.sin((x + y) * 0.07) * 4;
      if (x === -12) context.moveTo(x, yy);
      else context.lineTo(x, yy);
    }
    context.stroke();
  }
  context.strokeStyle = "rgba(8, 47, 73, 0.16)";
  context.lineWidth = 1.1;
  for (let y = -18; y < canvas.height + 18; y += 23) {
    context.beginPath();
    for (let x = -8; x <= canvas.width + 8; x += 16) {
      const yy = y + Math.cos((x - y) * 0.065) * 3;
      if (x === -8) context.moveTo(x, yy);
      else context.lineTo(x, yy);
    }
    context.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 3);
  waterTextureCache.set(colorHex, texture);
  return texture;
}

function makeTerrainColors(vertices) {
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

function makeSurface(surface, options = {}) {
  const geometry = new THREE.BufferGeometry();
  const positions = [];
  for (const vertex of surface.vertices) {
    const p = toScenePoint(vertex);
    positions.push(p.x, p.y, p.z);
  }

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setIndex(surface.faces.flat());
  geometry.computeVertexNormals();

  const materialOptions = {
    transparent: options.solid ? false : true,
    opacity: options.opacity ?? 0.74,
    side: THREE.DoubleSide,
  };
  if (!options.unlit) {
    materialOptions.roughness = 0.9;
    materialOptions.metalness = 0;
  }

  if (options.waterColor) {
    materialOptions.color = options.waterColor;
    materialOptions.map = makeWaterTexture(options.waterColor);
  } else if (options.terrainColors) {
    geometry.setAttribute(
      "color",
      new THREE.BufferAttribute(makeTerrainColors(surface.vertices), 3),
    );
    materialOptions.vertexColors = true;
  } else if (surface.vertexColors) {
    geometry.setAttribute(
      "color",
      new THREE.BufferAttribute(colorArray(surface.vertexColors), 3),
    );
    materialOptions.vertexColors = true;
  } else {
    materialOptions.color = surface.color || options.color || "#9ca3af";
  }

  const Material = options.unlit
    ? THREE.MeshBasicMaterial
    : THREE.MeshStandardMaterial;
  const mesh = new THREE.Mesh(geometry, new Material(materialOptions));
  mesh.name = surface.name;
  if (options.renderOrder !== undefined) {
    mesh.renderOrder = options.renderOrder;
  }
  return mesh;
}

function addEdges(mesh, color = 0x0b1f3a, opacity = 0.46) {
  const edges = new THREE.EdgesGeometry(mesh.geometry, 18);
  const lines = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({ color, transparent: true, opacity }),
  );
  mesh.add(lines);
  return mesh;
}

function addOutline(mesh, color = 0x0b1f3a, opacity = 0.5) {
  const edges = new THREE.EdgesGeometry(mesh.geometry, 42);
  const lines = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({ color, transparent: true, opacity }),
  );
  lines.renderOrder = 15;
  mesh.add(lines);
  return mesh;
}

function makeTextSprite(
  text,
  color = "#f8fafc",
  background = "rgba(11,31,58,0.74)",
) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const scale = 3;
  canvas.width = 360 * scale;
  canvas.height = 84 * scale;
  context.scale(scale, scale);
  context.font = "700 24px Inter, system-ui, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  const metrics = context.measureText(text);
  const width = Math.min(336, metrics.width + 34);
  const x = (360 - width) / 2;
  context.fillStyle = background;
  context.strokeStyle = "rgba(255,255,255,0.28)";
  context.lineWidth = 1;
  context.beginPath();
  context.roundRect(x, 12, width, 60, 10);
  context.fill();
  context.stroke();
  context.fillStyle = color;
  context.fillText(text, 180, 42);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(7.2, 1.68, 1);
  sprite.renderOrder = 20;
  return sprite;
}

function inferGrid(surface) {
  const firstY = surface.vertices[0][1];
  let cols = 0;
  while (
    cols < surface.vertices.length &&
    surface.vertices[cols][1] === firstY
  ) {
    cols += 1;
  }
  return { rows: surface.vertices.length / cols, cols };
}

function surfaceRow(surface, rowIndex) {
  const { rows, cols } = inferGrid(surface);
  const row = rowIndex === -1 ? rows - 1 : rowIndex;
  return surface.vertices.slice(row * cols, row * cols + cols);
}

function surfaceRowAtY(surface, yValue) {
  const { rows, cols } = inferGrid(surface);
  let bestRow = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (let row = 0; row < rows; row += 1) {
    const rowY = surface.vertices[row * cols][1];
    const distance = Math.abs(rowY - yValue);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestRow = row;
    }
  }
  return surface.vertices.slice(bestRow * cols, bestRow * cols + cols);
}

function xzPath(points, project) {
  return points.map((point) => project(point[0], point[2]));
}

function interpolateRowZ(row, xValue) {
  if (xValue <= row[0][0]) {
    return row[0][2];
  }
  for (let index = 1; index < row.length; index += 1) {
    const previous = row[index - 1];
    const current = row[index];
    if (xValue <= current[0]) {
      const t = (xValue - previous[0]) / (current[0] - previous[0] || 1);
      return previous[2] + (current[2] - previous[2]) * t;
    }
  }
  return row.at(-1)[2];
}

function getAquiferBandsAtWell(well, topRows, layerBottomRows) {
  const bandsByLevel = new Map();
  for (let index = 0; index < sceneData.layers.length; index += 1) {
    const layer = sceneData.layers[index];
    const level = aquiferLevelNumbers[layer.type];
    if (!level) {
      continue;
    }
    const topZ = interpolateRowZ(topRows[index], well.x_m);
    const bottomZ = interpolateRowZ(layerBottomRows[index], well.x_m);
    const screenTopZ = Math.min(well.screen_top_m, topZ);
    const screenBottomZ = Math.max(well.screen_bottom_m, bottomZ);
    if (screenTopZ <= screenBottomZ) {
      continue;
    }
    const existing = bandsByLevel.get(level) || {
      level,
      label: `${aquiferLevelNames[layer.type]} ${layer.type.replace(" Aquifer", "")}`,
      type: layer.type,
      firstIndex: index,
      lastIndex: index,
      topZ: screenTopZ,
      bottomZ: screenBottomZ,
    };
    existing.firstIndex = Math.min(existing.firstIndex, index);
    existing.lastIndex = Math.max(existing.lastIndex, index);
    existing.topZ = Math.max(existing.topZ, screenTopZ);
    existing.bottomZ = Math.min(existing.bottomZ, screenBottomZ);
    bandsByLevel.set(level, existing);
  }
  return [...bandsByLevel.values()].sort((a, b) => a.level - b.level);
}

// Pipe screen, soil, and drawdown configuration controls
function getSoilTypeForLevel(level) {
  return (
    soilTypeByLevel.get(level) ||
    defaultSoilByLevel[level] ||
    selectedSoilType ||
    "loam"
  );
}

function getSoilProfileForLevel(level) {
  const soilType = getSoilTypeForLevel(level);
  return {
    type: soilType,
    ...(soilDrawdownProfiles[soilType] || soilDrawdownProfiles.loam),
  };
}

function setActiveSoilLevel(level) {
  activeSoilLevel = level;
  selectedSoilType = getSoilTypeForLevel(level);
  soilTypeSelect.value = selectedSoilType;
  updateSoilControl();
  updateDischargeLabel();
  updateScreenPreview();
}

function updateScreenOptions(well) {
  if (!sceneData || !well) {
    screenOptionsEl.replaceChildren();
    return;
  }
  const sectionY = well.y_m;
  const topRows = sceneData.layers.map((layer) =>
    surfaceRowAtY(layer.topSurface, sectionY),
  );
  const bedrockRow = surfaceRowAtY(sceneData.bedrock, sectionY);
  const layerBottomRows = sceneData.layers.map((_, index) =>
    index < sceneData.layers.length - 1 ? topRows[index + 1] : bedrockRow,
  );
  const bands = getAquiferBandsAtWell(well, topRows, layerBottomRows);
  const availableLevels = bands.map((band) => band.level);
  for (const level of availableLevels) {
    if (!soilTypeByLevel.has(level)) {
      soilTypeByLevel.set(level, defaultSoilByLevel[level] || "loam");
    }
  }
  selectedScreenLevels = new Set(
    [...selectedScreenLevels].filter((level) =>
      availableLevels.includes(level),
    ),
  );
  if (selectedScreenLevels.size === 0) {
    selectedScreenLevels = new Set(availableLevels);
  }
  if (!availableLevels.includes(activeSoilLevel)) {
    activeSoilLevel = availableLevels[0] || 1;
  }
  screenOptionsEl.replaceChildren();
  for (const band of bands) {
    const id = `screen-level-${band.level}`;
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.id = id;
    input.value = String(band.level);
    input.checked = selectedScreenLevels.has(band.level);
    input.addEventListener("change", () => {
      if (input.checked) {
        selectedScreenLevels.add(band.level);
      } else {
        selectedScreenLevels.delete(band.level);
      }
      if (selectedScreenLevels.size === 0) {
        input.checked = true;
        selectedScreenLevels.add(band.level);
      }
      if (!selectedScreenLevels.has(activeSoilLevel)) {
        activeSoilLevel = [...selectedScreenLevels][0] || band.level;
        selectedSoilType = getSoilTypeForLevel(activeSoilLevel);
        soilTypeSelect.value = selectedSoilType;
      }
      updateScreenPreview();
      updateSoilControl();
      updateDischargeLabel();
      drawSectionView();
    });
    const text = document.createElement("span");
    text.textContent = `Level ${band.level}`;
    const soilButton = document.createElement("button");
    soilButton.type = "button";
    soilButton.className = "screen-soil-button";
    soilButton.dataset.soilLevel = String(band.level);
    soilButton.title = `Set Level ${band.level} soil type`;
    soilButton.setAttribute(
      "aria-label",
      `Set Level ${band.level} soil type`,
    );
    soilButton.addEventListener("click", () => {
      setActiveSoilLevel(band.level);
      setSoilMenuOpen(true);
    });
    const soilIcon = document.createElement("img");
    soilIcon.alt = "";
    soilButton.appendChild(soilIcon);
    label.append(input, text, soilButton);
    screenOptionsEl.appendChild(label);
  }
  setActiveSoilLevel(activeSoilLevel);
  updateScreenPreview();
}

function updateScreenPreview() {
  for (const segment of pipeScreenStackEl.querySelectorAll(
    ".pipe-screen-segment",
  )) {
    const level = Number(segment.dataset.level);
    segment.classList.toggle(
      "is-active",
      selectedScreenLevels.has(level),
    );
  }
  for (const button of screenOptionsEl.querySelectorAll(
    ".screen-soil-button",
  )) {
    const level = Number(button.dataset.soilLevel);
    const soilType = getSoilTypeForLevel(level);
    const image = button.querySelector("img");
    if (image) {
      image.src = soilImages[soilType] || soilImages.loam;
      image.alt = "";
    }
    button.classList.toggle("is-selected", level === activeSoilLevel);
    button.disabled = !selectedScreenLevels.has(level);
    button.title = selectedScreenLevels.has(level)
      ? `Level ${level}: ${getSoilProfileForLevel(level).label}`
      : `Level ${level} screen is inactive`;
  }
}

function drawSubtleWaterTexture(context, topPath, bottomPath) {
  context.save();
  context.beginPath();
  for (const [idx, point] of [...topPath, ...bottomPath].entries()) {
    if (idx === 0) context.moveTo(point.x, point.y);
    else context.lineTo(point.x, point.y);
  }
  context.closePath();
  context.clip();
  context.strokeStyle = "rgba(226, 246, 255, 0.2)";
  context.lineWidth = 1.05;
  const xs = [...topPath, ...bottomPath].map((point) => point.x);
  const ys = [...topPath, ...bottomPath].map((point) => point.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  for (let y = minY + 12; y < maxY; y += 18) {
    context.beginPath();
    for (let x = minX - 20; x <= maxX + 20; x += 18) {
      const yy = y + Math.sin((x + y) * 0.018) * 4;
      if (x === minX - 20) context.moveTo(x, yy);
      else context.lineTo(x, yy);
    }
    context.stroke();
  }
  context.restore();
}

function makeLayerSides(topSurface, bottomSurface, color) {
  const { rows, cols } = inferGrid(topSurface);
  const vertices = [];
  const faces = [];

  function pushQuad(topA, topB, bottomA, bottomB) {
    const base = vertices.length;
    for (const source of [topA, bottomA, topB, bottomB]) {
      const p = toScenePoint(source);
      vertices.push(p.x, p.y, p.z);
    }
    faces.push(base, base + 1, base + 2, base + 2, base + 1, base + 3);
  }

  for (let col = 0; col < cols - 1; col += 1) {
    const a = col;
    const b = col + 1;
    const c = (rows - 1) * cols + col;
    const d = c + 1;
    pushQuad(
      topSurface.vertices[a],
      topSurface.vertices[b],
      bottomSurface.vertices[a],
      bottomSurface.vertices[b],
    );
    pushQuad(
      topSurface.vertices[c],
      topSurface.vertices[d],
      bottomSurface.vertices[c],
      bottomSurface.vertices[d],
    );
  }

  for (let row = 0; row < rows - 1; row += 1) {
    const leftA = row * cols;
    const leftB = (row + 1) * cols;
    const rightA = row * cols + cols - 1;
    const rightB = (row + 1) * cols + cols - 1;
    pushQuad(
      topSurface.vertices[leftA],
      topSurface.vertices[leftB],
      bottomSurface.vertices[leftA],
      bottomSurface.vertices[leftB],
    );
    pushQuad(
      topSurface.vertices[rightA],
      topSurface.vertices[rightB],
      bottomSurface.vertices[rightA],
      bottomSurface.vertices[rightB],
    );
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3),
  );
  geometry.setIndex(faces);
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({
      color,
      transparent: false,
      opacity: 1,
      roughness: 0.86,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    }),
  );
  mesh.renderOrder = 4;
  return addEdges(mesh, 0x0b1f3a, 0.62);
}

function makeBoundaryLines(surface) {
  const { rows, cols } = inferGrid(surface);
  const material = new THREE.LineBasicMaterial({
    color: 0x0b1f3a,
    transparent: true,
    opacity: 0.95,
    depthTest: false,
  });
  const group = new THREE.Group();
  const edges = [
    Array.from({ length: cols }, (_, col) => col),
    Array.from({ length: cols }, (_, col) => (rows - 1) * cols + col),
    Array.from({ length: rows }, (_, row) => row * cols),
    Array.from({ length: rows }, (_, row) => row * cols + cols - 1),
  ];

  for (const edge of edges) {
    const points = edge.map((index) => {
      const point = toScenePoint(surface.vertices[index]);
      point.y += 0.018;
      return point;
    });
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(points),
      material.clone(),
    );
    line.renderOrder = 30;
    group.add(line);
  }
  return group;
}

// 3D model builders
function makeWireBox(sceneData) {
  const lx = sceneData.domain.lx_m * xScale;
  const ly = sceneData.domain.ly_m * yScale;
  const lz =
    (sceneData.domain.top_m - sceneData.domain.bottom_m) * zScale;
  const box = new THREE.BoxGeometry(lx, lz, ly);
  const edges = new THREE.EdgesGeometry(box);
  const lines = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({
      color: 0xe2e8f0,
      transparent: true,
      opacity: 0.34,
    }),
  );
  lines.position.y =
    ((sceneData.domain.top_m + sceneData.domain.bottom_m) / 2) * zScale;
  return lines;
}

function makeWell(well) {
  const top = toScenePoint([well.x_m, well.y_m, well.screen_top_m]);
  const bottom = toScenePoint([well.x_m, well.y_m, well.screen_bottom_m]);
  const height = top.distanceTo(bottom);
  const mid = top.clone().add(bottom).multiplyScalar(0.5);
  const casing = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.11, height, 16),
    new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 0.1,
      roughness: 0.36,
    }),
  );
  casing.position.copy(mid);
  const marker = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.16, 0.38, 16),
    new THREE.MeshStandardMaterial({
      color: well.role === "Pumping" ? 0x0057ff : 0xf8fafc,
    }),
  );
  marker.position.copy(top);
  marker.position.y += 0.18;
  const screen = new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.13,
      0.13,
      Math.max(height * 0.34, 0.5),
      16,
    ),
    new THREE.MeshStandardMaterial({
      color: well.role === "Pumping" ? 0x00a3ff : 0x38d6d1,
    }),
  );
  screen.position.copy(bottom.clone().lerp(top, 0.22));
  const presentation = wellPresentation[well.id];
  const label = makeTextSprite(
    presentation?.name || `${well.id} ${well.role}`,
    well.role === "Pumping" ? "#65a8ff" : "#f8fafc",
  );
  label.position.copy(top);
  label.position.y += 2.2;
  const group = new THREE.Group();
  group.userData.well = well;
  group.add(casing, screen, marker, label);
  group.traverse((child) => {
    child.userData.well = well;
    child.userData.selectableWell = true;
  });
  return group;
}

function makeFlowArrow(flow) {
  const origin = toScenePoint(flow.start);
  const direction = new THREE.Vector3(
    flow.direction[0],
    flow.direction[2] * 3,
    flow.direction[1],
  ).normalize();
  const arrow = new THREE.ArrowHelper(
    direction,
    origin,
    flow.length_m * xScale * 1.45,
    0xffffff,
    0.74,
    0.3,
  );
  arrow.traverse((child) => {
    if (child.material) {
      child.material.depthTest = false;
      child.material.transparent = true;
      child.material.opacity = 0.92;
    }
    child.renderOrder = 10;
  });
  return arrow;
}

function makeFlowTraces() {
  const group = new THREE.Group();
  const material = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.9,
    depthTest: false,
  });
  const frontY = -centerY * yScale - 0.18;
  const levels = [1.2, 0.35, -0.65, -1.55, -2.45, -3.3];
  for (let row = 0; row < levels.length; row += 1) {
    for (let band = 0; band < 2; band += 1) {
      const points = [];
      const start = -27 + band * 3.8;
      const end = 25 - band * 2.8;
      for (let i = 0; i <= 52; i += 1) {
        const t = i / 52;
        const x = start + (end - start) * t;
        const dip = Math.sin(t * Math.PI * 1.7 + row * 0.55) * 0.22;
        const pumpSag = -0.52 * Math.exp(-Math.pow((t - 0.62) / 0.18, 2));
        const y = levels[row] + dip + pumpSag;
        points.push(new THREE.Vector3(x, y, frontY - row * 0.018));
      }
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(points),
        material.clone(),
      );
      line.renderOrder = 12;
      group.add(line);

      const arrowPoint = points[Math.floor(points.length * 0.72)];
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(0.16, 0.42, 18),
        new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.92,
          depthTest: false,
        }),
      );
      cone.position.copy(arrowPoint);
      cone.rotation.z = -Math.PI / 2.8;
      cone.rotation.x = Math.PI / 2;
      cone.renderOrder = 13;
      group.add(cone);
    }
  }
  return group;
}

function resetCamera() {
  activeCamera = perspectiveCamera;
  controls.object = activeCamera;
  perspectiveCamera.position.set(44, 9, 34);
  controls.target.set(0, -1.35, 0);
  perspectiveCamera.updateProjectionMatrix();
  controls.update();
}

function updateOrthoCamera() {
  const aspect = window.innerWidth / window.innerHeight;
  orthoCamera.left = (-orthoSize * aspect) / 2;
  orthoCamera.right = (orthoSize * aspect) / 2;
  orthoCamera.top = orthoSize / 2;
  orthoCamera.bottom = -orthoSize / 2;
  orthoCamera.updateProjectionMatrix();
}

function animateCameraTo(
  targetCamera,
  targetPosition,
  targetLookAt,
  duration = 850,
) {
  const sourceCamera = activeCamera;
  const startPosition = sourceCamera.position.clone();
  const startTarget = controls.target.clone();
  const startTime = performance.now();
  cameraTween = {
    targetCamera,
    startPosition,
    startTarget,
    targetPosition,
    targetLookAt,
    duration,
    startTime,
  };
}

function transitionToWell(well) {
  const presentation = wellPresentation[well.id];
  if (presentation?.active === false) {
    showUnavailableWell(well, presentation);
    return;
  }
  openSectionView(well);
}

function showUnavailableWell(
  well,
  presentation = wellPresentation[well.id],
) {
  if (wellUnavailableToastTimer !== null) {
    window.clearTimeout(wellUnavailableToastTimer);
  }
  const name = presentation?.name || `${well.id} ${well.role}`;
  wellUnavailableToastEl.textContent = `${name} is inactive and currently unavailable.`;
  wellUnavailableToastEl.hidden = false;
  wellUnavailableToastTimer = window.setTimeout(() => {
    wellUnavailableToastEl.hidden = true;
    wellUnavailableToastTimer = null;
  }, 3200);
}

function updateCameraTween() {
  if (!cameraTween) {
    return;
  }
  const elapsed = performance.now() - cameraTween.startTime;
  const t = Math.min(elapsed / cameraTween.duration, 1);
  const eased = 1 - Math.pow(1 - t, 3);
  activeCamera.position.lerpVectors(
    cameraTween.startPosition,
    cameraTween.targetPosition,
    eased,
  );
  controls.target.lerpVectors(
    cameraTween.startTarget,
    cameraTween.targetLookAt,
    eased,
  );
  activeCamera.lookAt(controls.target);
  activeCamera.updateProjectionMatrix();
  if (t >= 1) {
    cameraTween = null;
  }
}

function findWellObject(object) {
  let current = object;
  while (current) {
    if (current.userData?.well) {
      return current.userData.well;
    }
    current = current.parent;
  }
  return null;
}
