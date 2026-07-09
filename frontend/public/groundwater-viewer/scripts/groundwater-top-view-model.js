/* eslint-disable */
/* MODFLOW top-view renderer, contouring, plan arrows, and plan-view layout helpers. */

function drawCalloutText(context, text, x, y, options = {}) {
  const font = options.font || "800 13px Inter, system-ui, sans-serif";
  const paddingX = options.paddingX || 8;
  const paddingY = options.paddingY || 5;
  context.save();
  context.font = font;
  context.textAlign = options.align || "left";
  context.textBaseline = "middle";
  const metrics = context.measureText(text);
  const width = metrics.width + paddingX * 2;
  const height = options.height || 23;
  const boxX = context.textAlign === "center" ? x - width / 2 : x;
  context.fillStyle = options.background || "rgba(223, 246, 253, 0.82)";
  context.strokeStyle = options.border || "rgba(226, 232, 240, 0.22)";
  context.lineWidth = 1;
  context.beginPath();
  context.roundRect(boxX, y - height / 2, width, height, 6);
  context.fill();
  context.stroke();
  context.fillStyle = options.color || "#f8fafc";
  context.fillText(
    text,
    context.textAlign === "center" ? x : x + paddingX,
    y + (options.baselineOffset || 0),
  );
  context.restore();
}

function pointInPolygon(point, polygon) {
  let inside = false;
  for (
    let i = 0, j = polygon.length - 1;
    i < polygon.length;
    j = i, i += 1
  ) {
    const a = polygon[i];
    const b = polygon[j];
    const crosses =
      a.y > point.y !== b.y > point.y &&
      point.x <
        ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y || 1e-9) + a.x;
    if (crosses) inside = !inside;
  }
  return inside;
}

function headColor(value, low, high) {
  const stops = [
    [0, [68, 1, 84]],
    [0.25, [59, 82, 139]],
    [0.5, [33, 145, 140]],
    [0.75, [94, 201, 98]],
    [1, [253, 231, 37]],
  ];
  const t = Math.max(
    0,
    Math.min(1, (value - low) / Math.max(1e-9, high - low)),
  );
  const upperIndex = Math.min(
    stops.length - 1,
    Math.ceil(t * (stops.length - 1)),
  );
  const lowerIndex = Math.max(0, upperIndex - 1);
  const lower = stops[lowerIndex];
  const upper = stops[upperIndex];
  const span = upper[0] - lower[0] || 1;
  const local = (t - lower[0]) / span;
  const rgb = lower[1].map((channel, index) =>
    Math.round(channel + (upper[1][index] - channel) * local),
  );
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

function drawPlanArrow(
  context,
  start,
  dx,
  dy,
  color = "rgba(5, 19, 34, 0.82)",
) {
  const end = { x: start.x + dx, y: start.y + dy };
  const angle = Math.atan2(dy, dx);
  const head = 4.5;
  context.beginPath();
  context.moveTo(start.x, start.y);
  context.lineTo(end.x, end.y);
  context.lineTo(
    end.x - head * Math.cos(angle - Math.PI / 6),
    end.y - head * Math.sin(angle - Math.PI / 6),
  );
  context.moveTo(end.x, end.y);
  context.lineTo(
    end.x - head * Math.cos(angle + Math.PI / 6),
    end.y - head * Math.sin(angle + Math.PI / 6),
  );
  context.strokeStyle = color;
  context.lineWidth = 1.35;
  context.stroke();
}

function getTopViewLayout(width, height) {
  if (compactViewerQuery.matches) {
    const hasVisiblePanel = !menuPanelEl.classList.contains("is-hidden");
    const bottomPanelSpace = hasVisiblePanel
      ? Math.min(window.innerHeight * 0.28, 220)
      : 28;
    return {
      marginLeft: 22,
      marginRight: 22,
      marginTop: 76,
      marginBottom: bottomPanelSpace,
      plotWidth: Math.max(220, width - 44),
      plotHeight: Math.max(220, height - 76 - bottomPanelSpace),
    };
  }

  const panelBounds = menuPanelEl.classList.contains("is-hidden")
    ? null
    : menuPanelEl.getBoundingClientRect();
  const safeLeft = panelBounds ? panelBounds.right + 28 : 68;
  const marginLeft = Math.min(Math.max(68, width - 390), safeLeft);
  const marginRight = 170;
  const marginTop = 98;
  const marginBottom = 72;
  return {
    marginLeft,
    marginRight,
    marginTop,
    marginBottom,
    plotWidth: Math.max(220, width - marginLeft - marginRight),
    plotHeight: Math.max(220, height - marginTop - marginBottom),
  };
}

function setPanelHidden(isHidden) {
  menuPanelEl.classList.toggle("is-hidden", isHidden);
  showPanelButton.classList.toggle("is-visible", isHidden);
  showPanelButton.hidden = false;
  showPanelButton.style.display = isHidden ? "inline-flex" : "";
  showPanelButton.style.visibility = "visible";
  showPanelButton.setAttribute("aria-expanded", String(!isHidden));
  showPanelButton.textContent = isHidden ? "Show menu" : "Menu visible";
  if (topViewMode) requestAnimationFrame(drawSectionView);
}

function revealPanel() {
  menuPanelEl.classList.remove("is-hidden");
  menuPanelEl.hidden = false;
  menuPanelEl.style.display = "";
  menuPanelEl.style.opacity = "";
  menuPanelEl.style.pointerEvents = "";
  menuPanelEl.style.visibility = "";
  showPanelButton.classList.remove("is-visible");
  showPanelButton.hidden = false;
  showPanelButton.style.display = "";
  showPanelButton.setAttribute("aria-expanded", "true");
}

function updateSectionViewModeClass() {
  sectionViewEl.classList.toggle("is-top-view", topViewMode);
}

function canScrollElement(element, deltaY) {
  if (!element || deltaY === 0) return false;
  const hasScrollableContent = element.scrollHeight > element.clientHeight + 1;
  if (!hasScrollableContent) return false;
  if (deltaY > 0) {
    return element.scrollTop + element.clientHeight < element.scrollHeight - 1;
  }
  return element.scrollTop > 0;
}

function getScrollableMenuTarget(target, deltaY) {
  let element = target;
  while (element && element !== menuPanelEl) {
    const style = window.getComputedStyle(element);
    const allowsVerticalScroll =
      style.overflowY === "auto" || style.overflowY === "scroll";
    if (allowsVerticalScroll && canScrollElement(element, deltaY)) {
      return element;
    }
    element = element.parentElement;
  }
  return menuPanelEl;
}

function getTopViewScenario(
  data,
  layer,
  dischargeValue = sectionDischarge,
) {
  const isSolvedModflowScenario =
    Boolean(data.scenario) ||
    data.source?.state === "scenario steady state";
  const dischargeRatio =
    dischargeValue / Math.max(1, Number(sectionDischargeInput.max));
  const rechargeFactor = activeScenarioConfig?.recharge
    ? rechargeDrawdownFactor({
        enabled: activeScenarioConfig.recharge.enabled,
        rate: activeScenarioConfig.recharge.rateMmDay,
        maxRate: Number(scenarioInputs.rechargeRate?.max || 1000),
      })
    : rechargeDrawdownFactor();
  const screenLevel = activeTopLayer + 1;
  const soil = getSoilProfileForLevel(screenLevel);
  const screenActive = selectedScreenLevels.has(screenLevel);
  const domainWidth = data.domain.xmax - data.domain.xmin;
  const domainHeight = data.domain.ymax - data.domain.ymin;
  const wellX =
    data.domain.xmin +
    (activeSectionWell.x_m / sceneData.domain.lx_m) * domainWidth;
  const wellY =
    data.domain.ymin +
    (activeSectionWell.y_m / sceneData.domain.ly_m) * domainHeight;
  const radius =
    Math.min(domainWidth, domainHeight) * (0.08 + 0.16 * soil.influence);
  if (isSolvedModflowScenario) {
    const drawdown = Array.isArray(layer.drawdown) ? layer.drawdown : [];
    const baselineHead = Array.isArray(layer.baselineHead)
      ? layer.baselineHead
      : layer.head;
    const scenarioWellX = data.wells?.[0]?.x ?? wellX;
    const scenarioWellY = data.wells?.[0]?.y ?? wellY;
    const solvedDischarge = Math.max(
      1,
      Number(
        data.scenario?.dischargeM3Day ||
          data.source?.effectivePumpingM3Day ||
          sectionDischargeInput.max,
      ),
    );
    const dischargeScale = Math.max(0, dischargeValue) / solvedDischarge;
    const scaledDrawdown = drawdown.map(
      (value) => (Number(value) || 0) * dischargeScale,
    );
    const solvedMaximumDrawdown =
      scaledDrawdown.length > 0 ? Math.max(...scaledDrawdown) : 0;
    const shouldUseFallbackDrawdown =
      solvedMaximumDrawdown <= 0.001 && screenActive && dischargeValue > 0;
    const maximumDrawdown = shouldUseFallbackDrawdown
      ? dischargeRatio * 9.5 * soil.depth * rechargeFactor
      : solvedMaximumDrawdown;
    const baselineFlowScale = Math.max(
      ...layer.qx.map((qx, index) => Math.hypot(qx, layer.qy[index])),
      1e-9,
    );
    const flowBoost = shouldUseFallbackDrawdown
      ? dischargeRatio * baselineFlowScale * 1.15 * soil.depth * rechargeFactor
      : 0;
    const adjustedHead = [];
    const adjustedQx = [];
    const adjustedQy = [];

    for (let index = 0; index < data.grid.cells.length; index += 1) {
      if (!shouldUseFallbackDrawdown) {
        adjustedHead.push(Number(baselineHead[index]) - (scaledDrawdown[index] || 0));
        adjustedQx.push(layer.qx[index]);
        adjustedQy.push(layer.qy[index]);
        continue;
      }

      const [cellX, cellY] = data.grid.cells[index].center;
      const dx = scenarioWellX - cellX;
      const dy = scenarioWellY - cellY;
      const distance = Math.hypot(dx, dy);
      const influence =
        soil.type === "sand"
          ? Math.pow(Math.max(0, 1 - distance / radius), 0.9)
          : Math.exp(-(distance * distance) / (2 * radius * radius));
      const directionX = distance > 1e-6 ? dx / distance : 0;
      const directionY = distance > 1e-6 ? dy / distance : 0;
      adjustedHead.push(Number(baselineHead[index]) - maximumDrawdown * influence);
      adjustedQx.push(layer.qx[index] + directionX * flowBoost * influence);
      adjustedQy.push(layer.qy[index] + directionY * flowBoost * influence);
    }

    return {
      soil,
      discharge: dischargeValue,
      dischargeRatio,
      screenLevel,
      screenActive,
      wellX: scenarioWellX,
      wellY: scenarioWellY,
      radius,
      rechargeFactor: data.source?.rechargeDrawdownFactor ?? rechargeFactor,
      maximumDrawdown,
      head: adjustedHead,
      qx: adjustedQx,
      qy: adjustedQy,
      usesSolvedHeads: true,
      usesFallbackDrawdown: shouldUseFallbackDrawdown,
    };
  }
  const maximumDrawdown = screenActive
    ? dischargeRatio * 9.5 * soil.depth * rechargeFactor
    : 0;
  const baselineFlowScale = Math.max(
    ...layer.qx.map((qx, index) => Math.hypot(qx, layer.qy[index])),
    1e-9,
  );
  const flowBoost = screenActive
    ? dischargeRatio * baselineFlowScale * 1.15 * soil.depth * rechargeFactor
    : 0;
  const adjustedHead = [];
  const adjustedQx = [];
  const adjustedQy = [];

  for (let index = 0; index < data.grid.cells.length; index += 1) {
    const [cellX, cellY] = data.grid.cells[index].center;
    const dx = wellX - cellX;
    const dy = wellY - cellY;
    const distance = Math.hypot(dx, dy);
    const influence =
      soil.type === "sand"
        ? Math.pow(Math.max(0, 1 - distance / radius), 0.9)
        : Math.exp(-(distance * distance) / (2 * radius * radius));
    const directionX = distance > 1e-6 ? dx / distance : 0;
    const directionY = distance > 1e-6 ? dy / distance : 0;
    adjustedHead.push(layer.head[index] - maximumDrawdown * influence);
    adjustedQx.push(layer.qx[index] + directionX * flowBoost * influence);
    adjustedQy.push(layer.qy[index] + directionY * flowBoost * influence);
  }

  return {
    soil,
    discharge: dischargeValue,
    dischargeRatio,
    screenLevel,
    screenActive,
    wellX,
    wellY,
    radius,
    rechargeFactor,
    maximumDrawdown,
    head: adjustedHead,
    qx: adjustedQx,
    qy: adjustedQy,
    usesSolvedHeads: false,
  };
}

function buildScenarioContours(data, values) {
  const xs = [
    ...new Set(
      data.grid.cells.map((cell) => Number(cell.center[0].toFixed(2))),
    ),
  ].sort((a, b) => a - b);
  const ys = [
    ...new Set(
      data.grid.cells.map((cell) => Number(cell.center[1].toFixed(2))),
    ),
  ].sort((a, b) => a - b);
  if (xs.length < 2 || ys.length < 2) {
    return [];
  }
  const valueByCenter = new Map();
  data.grid.cells.forEach((cell, index) => {
    valueByCenter.set(
      `${Number(cell.center[0].toFixed(2))}:${Number(cell.center[1].toFixed(2))}`,
      values[index],
    );
  });
  const finiteValues = values.filter(Number.isFinite);
  const low = Math.min(...finiteValues);
  const high = Math.max(...finiteValues);
  if (!Number.isFinite(low) || !Number.isFinite(high) || low === high) {
    return [];
  }
  const levels = Array.from({ length: 6 }, (_, index) =>
    low + ((index + 1) / 7) * (high - low),
  );
  const contours = [];

  function valueAt(xIndex, yIndex) {
    return valueByCenter.get(`${xs[xIndex]}:${ys[yIndex]}`);
  }

  function interpolate(a, b, level) {
    const t = (level - a.value) / (b.value - a.value || 1);
    return {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
    };
  }

  for (const level of levels) {
    const segments = [];
    for (let yi = 0; yi < ys.length - 1; yi += 1) {
      for (let xi = 0; xi < xs.length - 1; xi += 1) {
        const corners = [
          { x: xs[xi], y: ys[yi], value: valueAt(xi, yi) },
          { x: xs[xi + 1], y: ys[yi], value: valueAt(xi + 1, yi) },
          {
            x: xs[xi + 1],
            y: ys[yi + 1],
            value: valueAt(xi + 1, yi + 1),
          },
          { x: xs[xi], y: ys[yi + 1], value: valueAt(xi, yi + 1) },
        ];
        if (corners.some((corner) => !Number.isFinite(corner.value))) {
          continue;
        }
        const crossings = [];
        const edges = [
          [corners[0], corners[1]],
          [corners[1], corners[2]],
          [corners[2], corners[3]],
          [corners[3], corners[0]],
        ];
        for (const [a, b] of edges) {
          const crosses =
            (a.value <= level && b.value > level) ||
            (b.value <= level && a.value > level);
          if (crosses) {
            crossings.push(interpolate(a, b, level));
          }
        }
        if (crossings.length === 2) {
          segments.push(crossings);
        } else if (crossings.length === 4) {
          segments.push([crossings[0], crossings[1]]);
          segments.push([crossings[2], crossings[3]]);
        }
      }
    }
    const polylines = [];
    const unused = segments.slice();
    const closeEnough = (a, b) =>
      Math.hypot(a.x - b.x, a.y - b.y) < Math.min(xs[1] - xs[0], ys[1] - ys[0]) * 0.15;
    while (unused.length > 0) {
      const line = unused.pop();
      let changed = true;
      while (changed) {
        changed = false;
        for (let index = unused.length - 1; index >= 0; index -= 1) {
          const candidate = unused[index];
          if (closeEnough(line.at(-1), candidate[0])) {
            line.push(candidate[1]);
          } else if (closeEnough(line.at(-1), candidate[1])) {
            line.push(candidate[0]);
          } else if (closeEnough(line[0], candidate[1])) {
            line.unshift(candidate[0]);
          } else if (closeEnough(line[0], candidate[0])) {
            line.unshift(candidate[1]);
          } else {
            continue;
          }
          unused.splice(index, 1);
          changed = true;
        }
      }
      if (line.length >= 2) {
        polylines.push(line);
      }
    }
    for (const line of polylines) {
      contours.push({
        level,
        points: line.map((point) => [point.x, point.y]),
      });
    }
  }
  return contours;
}

// MODFLOW top-view renderer
function drawTopView() {
  if (!modflowTopViewData) return;
  updateSectionViewModeClass();
  const ratio = Math.min(window.devicePixelRatio, 2);
  const width = sectionCanvas.clientWidth;
  const height = sectionCanvas.clientHeight;
  sectionCanvas.width = Math.max(1, Math.floor(width * ratio));
  sectionCanvas.height = Math.max(1, Math.floor(height * ratio));
  sensorHitBoxes = [];
  aquiferHitRegions = [];
  sectionContext.setTransform(ratio, 0, 0, ratio, 0, 0);
  sectionContext.clearRect(0, 0, width, height);
  sectionContext.fillStyle = "#DFF6FD";
  sectionContext.fillRect(0, 0, width, height);

  const data = modflowTopViewData;
  const layer =
    data.layers[Math.min(activeTopLayer, data.layers.length - 1)];
  const scenario = getTopViewScenario(
    data,
    layer,
    topViewAnimatedDischarge,
  );
  const domainWidth = data.domain.xmax - data.domain.xmin;
  const domainHeight = data.domain.ymax - data.domain.ymin;
  const {
    marginLeft,
    marginRight,
    marginTop,
    marginBottom,
    plotWidth,
    plotHeight,
  } = getTopViewLayout(width, height);
  const baseScale = Math.min(
    plotWidth / domainWidth,
    plotHeight / domainHeight,
  );
  const scale = baseScale * topViewZoom;
  const centerX = marginLeft + plotWidth / 2 + topViewPanX;
  const centerY = marginTop + plotHeight / 2 + topViewPanY;
  const worldCenterX = (data.domain.xmin + data.domain.xmax) / 2;
  const worldCenterY = (data.domain.ymin + data.domain.ymax) / 2;
  const project = (x, y) => ({
    x: centerX + (x - worldCenterX) * scale,
    y: centerY - (y - worldCenterY) * scale,
  });
  const low = Math.min(...scenario.head);
  const high = Math.max(...scenario.head);

  sectionContext.lineJoin = "round";
  for (let index = 0; index < data.grid.cells.length; index += 1) {
    const cell = data.grid.cells[index];
    const points = cell.vertexIds.map((vertexId) =>
      project(...data.grid.vertices[vertexId]),
    );
    sectionContext.beginPath();
    points.forEach((point, pointIndex) =>
      pointIndex === 0
        ? sectionContext.moveTo(point.x, point.y)
        : sectionContext.lineTo(point.x, point.y),
    );
    sectionContext.closePath();
    sectionContext.fillStyle = headColor(scenario.head[index], low, high);
    sectionContext.fill();
    sectionContext.strokeStyle = "rgba(11, 31, 58, 0.12)";
    sectionContext.lineWidth = 0.55;
    sectionContext.stroke();
  }

  for (const cellIndex of data.streamCells) {
    const cell = data.grid.cells[cellIndex];
    if (!cell) continue;
    const points = cell.vertexIds.map((vertexId) =>
      project(...data.grid.vertices[vertexId]),
    );
    sectionContext.beginPath();
    points.forEach((point, pointIndex) =>
      pointIndex === 0
        ? sectionContext.moveTo(point.x, point.y)
        : sectionContext.lineTo(point.x, point.y),
    );
    sectionContext.closePath();
    sectionContext.strokeStyle = "rgba(14, 165, 233, 0.95)";
    sectionContext.lineWidth = 2.2;
    sectionContext.stroke();
  }

  const foregroundLabels = [];
  sectionContext.font = "700 11px Inter, system-ui, sans-serif";
  const scenarioContours = buildScenarioContours(data, scenario.head);
  for (const contour of scenarioContours) {
    const points = contour.points.map((point) =>
      project(point[0], point[1]),
    );
    sectionContext.beginPath();
    points.forEach((point, index) =>
      index === 0
        ? sectionContext.moveTo(point.x, point.y)
        : sectionContext.lineTo(point.x, point.y),
    );
    sectionContext.strokeStyle = "rgba(255, 255, 255, 0.88)";
    sectionContext.lineWidth = 1.35;
    sectionContext.stroke();
    if (points.length > 4) {
      const labelPoint = points[Math.floor(points.length * 0.55)];
      foregroundLabels.push({
        text: contour.level.toFixed(2),
        x: labelPoint.x + 4,
        y: labelPoint.y - 4,
        font: "700 11px Inter, system-ui, sans-serif",
      });
    }
  }

  if (scenario.maximumDrawdown > 0.01) {
    const wellPosition = project(scenario.wellX, scenario.wellY);
    sectionContext.save();
    sectionContext.setLineDash([6, 5]);
    for (let ring = 1; ring <= 4; ring += 1) {
      const ringRatio = ring / 4;
      const ringRadius = scenario.radius * ringRatio * scale;
      const ringInfluence =
        scenario.soil.type === "sand"
          ? Math.pow(Math.max(0, 1 - ringRatio), 0.9)
          : Math.exp(-(ringRatio * ringRatio) / 2);
      const drawdown = scenario.maximumDrawdown * ringInfluence;
      sectionContext.beginPath();
      sectionContext.arc(
        wellPosition.x,
        wellPosition.y,
        ringRadius,
        0,
        Math.PI * 2,
      );
      sectionContext.strokeStyle = "rgba(255, 255, 255, 0.9)";
      sectionContext.lineWidth = 1.4;
      sectionContext.stroke();
      sectionContext.fillStyle = "#ffffff";
      sectionContext.font = "700 10px Inter, system-ui, sans-serif";
      if (drawdown >= 0.05) {
        foregroundLabels.push({
          text: `-${drawdown.toFixed(1)} m`,
          x: wellPosition.x + ringRadius + 4,
          y: wellPosition.y,
          font: "700 10px Inter, system-ui, sans-serif",
        });
      }
    }
    sectionContext.restore();
  }

  const magnitudes = scenario.qx.map((qx, index) =>
    Math.hypot(qx, scenario.qy[index]),
  );
  const maxMagnitude = Math.max(...magnitudes, 1e-9);
  const finiteCellWidths = data.grid.cells
    .map((cell) => {
      const projected = cell.vertexIds.map((vertexId) =>
        project(...data.grid.vertices[vertexId]),
      );
      const xs = projected.map((point) => point.x);
      const ys = projected.map((point) => point.y);
      return Math.min(
        Math.max(...xs) - Math.min(...xs),
        Math.max(...ys) - Math.min(...ys),
      );
    })
    .filter((value) => Number.isFinite(value) && value > 0)
    .sort((a, b) => a - b);
  const typicalCellWidth =
    finiteCellWidths.length > 0
      ? finiteCellWidths[Math.floor(finiteCellWidths.length / 2)]
      : 18;
  for (let index = 0; index < data.grid.cells.length; index += 1) {
    const magnitude = magnitudes[index];
    if (magnitude <= 1e-12) continue;
    const center = project(...data.grid.cells[index].center);
    const length = Math.max(
      5,
      Math.min(
        typicalCellWidth * 0.74,
        4 + typicalCellWidth * 0.64 * Math.sqrt(magnitude / maxMagnitude),
      ),
    );
    drawPlanArrow(
      sectionContext,
      center,
      (scenario.qx[index] / magnitude) * length,
      -(scenario.qy[index] / magnitude) * length,
    );
  }

  for (const well of data.wells) {
    const position = project(well.x, well.y);
    sectionContext.beginPath();
    sectionContext.arc(position.x, position.y, 7, 0, Math.PI * 2);
    sectionContext.fillStyle = "#ffffff";
    sectionContext.fill();
    sectionContext.strokeStyle = "#e11d48";
    sectionContext.lineWidth = 3;
    sectionContext.stroke();
    sectionContext.fillStyle = "#0b1f3a";
    sectionContext.font = "800 11px Inter, system-ui, sans-serif";
    sectionContext.fillText(well.id, position.x + 10, position.y - 8);
  }

  const scenarioWellPosition = project(scenario.wellX, scenario.wellY);
  sectionContext.beginPath();
  sectionContext.arc(
    scenarioWellPosition.x,
    scenarioWellPosition.y,
    10,
    0,
    Math.PI * 2,
  );
  sectionContext.fillStyle = scenario.screenActive
    ? "#22d3ee"
    : "#ffffff";
  sectionContext.fill();
  sectionContext.strokeStyle = scenario.screenActive
    ? "#0b1f3a"
    : "#94a3b8";
  sectionContext.lineWidth = 3;
  sectionContext.stroke();
  sectionContext.fillStyle = "#0b1f3a";
  sectionContext.font = "800 11px Inter, system-ui, sans-serif";
  const scenarioWellName =
    wellPresentation[activeSectionWell.id]?.name || activeSectionWell.id;
  sectionContext.fillText(
    `${scenarioWellName} scenario`,
    scenarioWellPosition.x + 14,
    scenarioWellPosition.y + 4,
  );

  sectionContext.save();
  sectionContext.textAlign = "left";
  sectionContext.textBaseline = "alphabetic";
  sectionContext.lineJoin = "round";
  for (const label of foregroundLabels) {
    sectionContext.font = label.font;
    sectionContext.lineWidth = 3.5;
    sectionContext.strokeStyle = "rgba(11, 31, 58, 0.92)";
    sectionContext.strokeText(label.text, label.x, label.y);
    sectionContext.fillStyle = "#ffffff";
    sectionContext.fillText(label.text, label.x, label.y);
  }
  sectionContext.restore();

  sectionContext.fillStyle = "#0b1f3a";
  sectionContext.font = "700 20px Inter, system-ui, sans-serif";
  sectionContext.fillText(
    `${layer.name}: hydraulic head and flow`,
    marginLeft,
    42,
  );
  sectionContext.font = "500 12px Inter, system-ui, sans-serif";
  sectionContext.fillStyle = "#52657d";
  const gridType = data.grid.type || "MODFLOW";
  const wellPackage = data.source?.wellPackage || "WEL";
  sectionContext.fillText(
    `${data.source.solver} · ${data.grid.cells.length} ${gridType} cells · ${data.wells.length} ${wellPackage} wells`,
    marginLeft,
    64,
  );

  const screenState = scenario.screenActive
    ? "screen active"
    : "screen inactive";
  const rechargeReduction = Math.round((1 - scenario.rechargeFactor) * 100);
  const drawdownSourceLabel = scenario.usesFallbackDrawdown
    ? "interactive maximum drawdown"
    : scenario.usesSolvedHeads
    ? "MODFLOW maximum drawdown"
    : "estimated maximum drawdown";
  planScenarioStatusEl.textContent = scenario.screenActive
    ? `${scenario.soil.label} · ${Math.round(scenario.discharge).toLocaleString()} m³/day · Level ${scenario.screenLevel} ${screenState} · recharge reduces drawdown ${rechargeReduction}% · ${drawdownSourceLabel} ${scenario.maximumDrawdown.toFixed(1)} m`
    : `${scenario.soil.label} · Level ${scenario.screenLevel} ${screenState} · showing the unadjusted MODFLOW result`;
  planSoilReadoutEl.textContent = scenario.soil.label;
  const screenLabels = [...selectedScreenLevels]
    .sort((a, b) => a - b)
    .map((level) => `L${level}`);
  planScreenReadoutEl.textContent =
    screenLabels.length > 0 ? screenLabels.join(", ") : "None";

  const legendX = width - 96;
  const legendY = Math.max(120, height / 2 - 110);
  const gradient = sectionContext.createLinearGradient(
    0,
    legendY + 190,
    0,
    legendY,
  );
  for (let step = 0; step <= 10; step += 1) {
    gradient.addColorStop(
      step / 10,
      headColor(low + (high - low) * (step / 10), low, high),
    );
  }
  sectionContext.fillStyle = gradient;
  sectionContext.fillRect(legendX, legendY, 24, 190);
  sectionContext.strokeStyle = "rgba(11, 31, 58, 0.55)";
  sectionContext.strokeRect(legendX, legendY, 24, 190);
  sectionContext.fillStyle = "#0b1f3a";
  sectionContext.font = "700 11px Inter, system-ui, sans-serif";
  sectionContext.fillText(
    `${high.toFixed(1)} m`,
    legendX + 34,
    legendY + 5,
  );
  sectionContext.fillText(
    `${low.toFixed(1)} m`,
    legendX + 34,
    legendY + 190,
  );
  sectionContext.save();
  sectionContext.translate(legendX - 14, legendY + 126);
  sectionContext.rotate(-Math.PI / 2);
  sectionContext.fillText("Hydraulic head", 0, 0);
  sectionContext.restore();
}

// 2D well section renderer
