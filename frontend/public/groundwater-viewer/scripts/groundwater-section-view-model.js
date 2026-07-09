/* eslint-disable */
/* 2D well-section renderer, section transitions, zoom, and top-view discharge animation. */

function drawSectionView() {
  updateSectionViewModeClass();
  if (topViewMode) {
    drawTopView();
    return;
  }
  if (!sceneData || !activeSectionWell) {
    return;
  }
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
  const backgroundGradient = sectionContext.createRadialGradient(
    width * 0.54,
    height * 0.48,
    80,
    width * 0.54,
    height * 0.48,
    Math.max(width, height) * 0.78,
  );
  backgroundGradient.addColorStop(0, "#f8fdff");
  backgroundGradient.addColorStop(1, "#DFF6FD");
  sectionContext.fillStyle = backgroundGradient;
  sectionContext.fillRect(0, 0, width, height);

  const { marginX, marginTop, plotWidth, plotHeight } =
    getSectionLayout();
  const xFactor = (plotWidth * sectionZoom) / sceneData.domain.lx_m;
  const zMin = sceneData.domain.bottom_m;
  const zMax = sceneData.domain.top_m;
  const zFactor = (plotHeight * sectionZoom) / (zMax - zMin);
  const originX =
    marginX - ((sectionZoom - 1) * plotWidth) / 2 + sectionPanX;
  const originY =
    marginTop + ((sectionZoom - 1) * plotHeight) / 2 + sectionPanY;
  const skewX = 130;
  const skewY = -74;

  function project(x, z) {
    return {
      x: originX + x * xFactor,
      y: originY + (zMax - z) * zFactor,
    };
  }

  function projectSide(z, x = sceneData.domain.lx_m) {
    const front = project(x, z);
    return { x: front.x + skewX, y: front.y + skewY };
  }

  const layerColors = sceneData.legend.layerColors;
  const sectionY = activeSectionWell.y_m;
  const topRows = sceneData.layers.map((layer) =>
    surfaceRowAtY(layer.topSurface, sectionY),
  );
  const bedrockRow = surfaceRowAtY(sceneData.bedrock, sectionY);
  const baseRow = surfaceRowAtY(sceneData.base, sectionY);
  const layerBottomRows = sceneData.layers.map((_, index) =>
    index < sceneData.layers.length - 1 ? topRows[index + 1] : bedrockRow,
  );
  const discharge01 =
    sectionDischarge / Number(sectionDischargeInput.max);
  const rechargeFactor = rechargeDrawdownFactor();
  const wellX = activeSectionWell.x_m;
  const aquiferBands = getAquiferBandsAtWell(
    activeSectionWell,
    topRows,
    layerBottomRows,
  );
  const visibleScreenBands = aquiferBands.filter((band) =>
    selectedScreenLevels.has(band.level),
  );

  function getBandDrawdownConfig(band) {
    const soilProfile = getSoilProfileForLevel(band.level);
    return {
      soilProfile,
      influenceRadius:
        (4500 + discharge01 * 12000) * soilProfile.influence,
      maxDrawdown:
        discharge01 * 130 * soilProfile.depth * rechargeFactor,
    };
  }

  function drawdownAtX(x, band, scale = 1) {
    const config = getBandDrawdownConfig(band);
    const distance = Math.abs(x - wellX);
    const shape =
      config.soilProfile.type === "sand"
        ? Math.pow(
            Math.max(0, 1 - distance / config.influenceRadius),
            0.9,
          )
        : Math.exp(
            -(distance * distance) /
              (2 * config.influenceRadius * config.influenceRadius),
          );
    return config.maxDrawdown * scale * shape;
  }

  function drawdownHeadZ(x, band, originalHeadZ, scale = 1) {
    return originalHeadZ - drawdownAtX(x, band, scale);
  }

  function clippedDrawdownZ(x, band, originalHeadZ, scale = 1) {
    const layerTopZ = interpolateRowZ(topRows[band.firstIndex], x);
    const layerBottomZ = interpolateRowZ(
      layerBottomRows[band.lastIndex],
      x,
    );
    const rawZ = drawdownHeadZ(x, band, originalHeadZ, scale);
    return Math.max(
      layerBottomZ + 5,
      Math.min(originalHeadZ, Math.min(layerTopZ - 5, rawZ)),
    );
  }

  function clipToBand(band, callback) {
    const topPath = xzPath(topRows[band.firstIndex], project);
    const bottomPath = xzPath(
      layerBottomRows[band.lastIndex],
      project,
    ).reverse();
    sectionContext.save();
    sectionContext.beginPath();
    for (const [idx, point] of [...topPath, ...bottomPath].entries()) {
      if (idx === 0) sectionContext.moveTo(point.x, point.y);
      else sectionContext.lineTo(point.x, point.y);
    }
    sectionContext.closePath();
    sectionContext.clip();
    callback();
    sectionContext.restore();
  }

  function drawInflowCurrents(
    originalHeadZ,
    bandTopZ,
    bandBottomZ,
    influenceRadius,
    band,
    scale = 1,
  ) {
    const currentCount = 4;
    const span = Math.min(influenceRadius * 0.72, 11000);
    const screenMid = (bandTopZ + bandBottomZ) / 2;
    for (let side of [-1, 1]) {
      for (let index = 0; index < currentCount; index += 1) {
        const t = (index + 1) / (currentCount + 1);
        const startX = wellX + side * span * (0.28 + t * 0.6);
        const startZ =
          screenMid + (bandTopZ - bandBottomZ) * (0.22 - t * 0.11);
        const endX = wellX + (side * 17) / xFactor;
        const endZ = Math.max(
          bandBottomZ + 4,
          Math.min(
            bandTopZ - 4,
            drawdownHeadZ(wellX, band, originalHeadZ, scale) +
              (screenMid - originalHeadZ) * 0.22,
          ),
        );
        const start = project(startX, startZ);
        const end = project(endX, endZ);
        const control = project(
          wellX + side * span * (0.12 + t * 0.16),
          startZ - Math.abs(startZ - endZ) * 0.34 - 10,
        );
        sectionContext.beginPath();
        sectionContext.moveTo(start.x, start.y);
        sectionContext.quadraticCurveTo(
          control.x,
          control.y,
          end.x,
          end.y,
        );
        sectionContext.strokeStyle = `rgba(191, 239, 255, ${0.2 + t * 0.12})`;
        sectionContext.lineWidth = 1.1 + t * 0.35;
        sectionContext.stroke();
      }
    }
  }

  sectionContext.lineJoin = "round";
  sectionContext.lineCap = "round";

  for (let i = 0; i < sceneData.layers.length; i += 1) {
    const layer = sceneData.layers[i];
    const top = xzPath(topRows[i], project);
    const bottom = xzPath(layerBottomRows[i], project).reverse();
    sectionContext.beginPath();
    for (const [idx, point] of [...top, ...bottom].entries()) {
      if (idx === 0) sectionContext.moveTo(point.x, point.y);
      else sectionContext.lineTo(point.x, point.y);
    }
    sectionContext.closePath();
    const fill = getLayerFill(layer);
    sectionContext.fillStyle = fill;
    sectionContext.fill();
    if (isAquiferType(layer.type)) {
      drawSubtleWaterTexture(sectionContext, top, bottom);
      const polygon = [...top, ...bottom];
      const level = aquiferLevelNumbers[layer.type];
      const hasScreen = selectedScreenLevels.has(level);
      if (hasScreen) {
        aquiferHitRegions.push({ level, type: layer.type, polygon });
      }
      if (hasScreen && hoveredAquiferLevel === level) {
        sectionContext.beginPath();
        polygon.forEach((point, pointIndex) =>
          pointIndex === 0
            ? sectionContext.moveTo(point.x, point.y)
            : sectionContext.lineTo(point.x, point.y),
        );
        sectionContext.closePath();
        sectionContext.fillStyle = "rgba(56, 189, 248, 0.16)";
        sectionContext.fill();
      }
    }
    sectionContext.strokeStyle = "rgba(2, 4, 10, 0.78)";
    sectionContext.lineWidth = 1.25;
    sectionContext.stroke();
  }

  const bedrockTop = xzPath(bedrockRow, project);
  const baseBottom = xzPath(baseRow, project).reverse();
  sectionContext.beginPath();
  for (const [idx, point] of [...bedrockTop, ...baseBottom].entries()) {
    if (idx === 0) sectionContext.moveTo(point.x, point.y);
    else sectionContext.lineTo(point.x, point.y);
  }
  sectionContext.closePath();
  sectionContext.fillStyle = layerColors.Bedrock || "#686868";
  sectionContext.fill();
  sectionContext.strokeStyle = "rgba(2, 4, 10, 0.78)";
  sectionContext.stroke();

  const rightX = sceneData.domain.lx_m;
  for (let i = 0; i < sceneData.layers.length; i += 1) {
    const layer = sceneData.layers[i];
    const topFront = project(rightX, topRows[i].at(-1)[2]);
    const bottomFront = project(rightX, layerBottomRows[i].at(-1)[2]);
    const topBack = projectSide(topRows[i].at(-1)[2]);
    const bottomBack = projectSide(layerBottomRows[i].at(-1)[2]);
    sectionContext.beginPath();
    sectionContext.moveTo(topFront.x, topFront.y);
    sectionContext.lineTo(topBack.x, topBack.y);
    sectionContext.lineTo(bottomBack.x, bottomBack.y);
    sectionContext.lineTo(bottomFront.x, bottomFront.y);
    sectionContext.closePath();
    sectionContext.fillStyle = getLayerFill(layer);
    sectionContext.fill();
    sectionContext.strokeStyle = "rgba(2, 4, 10, 0.72)";
    sectionContext.stroke();
  }

  const terrain = xzPath(
    surfaceRowAtY(sceneData.terrain, sectionY),
    project,
  );
  const terrainBack = surfaceRow(sceneData.terrain, -1).map((point) =>
    projectSide(point[2], point[0]),
  );
  sectionContext.beginPath();
  for (const [idx, point] of [
    ...terrain,
    ...terrainBack.reverse(),
  ].entries()) {
    if (idx === 0) sectionContext.moveTo(point.x, point.y);
    else sectionContext.lineTo(point.x, point.y);
  }
  sectionContext.closePath();
  sectionContext.fillStyle = "#83aa5a";
  sectionContext.fill();
  sectionContext.strokeStyle = "rgba(2, 4, 10, 0.72)";
  sectionContext.stroke();

  if (visibleScreenBands.length > 0) {
    for (const [bandIndex, band] of visibleScreenBands.entries()) {
      const originalHeadZ = (band.topZ + band.bottomZ) / 2;
      const bandScale = 1;
      const originalWater = topRows[0].map((point) =>
        project(point[0], originalHeadZ),
      );
      const drawdownWater = topRows[0].map((point) =>
        project(
          point[0],
          clippedDrawdownZ(point[0], band, originalHeadZ, bandScale),
        ),
      );
      if (sectionDischarge > 0) {
        clipToBand(band, () => {
          sectionContext.beginPath();
          for (const [idx, point] of originalWater.entries()) {
            if (idx === 0) sectionContext.moveTo(point.x, point.y);
            else sectionContext.lineTo(point.x, point.y);
          }
          for (const point of [...drawdownWater].reverse()) {
            sectionContext.lineTo(point.x, point.y);
          }
          sectionContext.closePath();
          sectionContext.fillStyle =
            bandIndex === 0
              ? "rgba(248, 113, 113, 0.22)"
              : "rgba(251, 146, 60, 0.17)";
          sectionContext.fill();
          drawInflowCurrents(
            originalHeadZ,
            band.topZ,
            band.bottomZ,
            getBandDrawdownConfig(band).influenceRadius,
            band,
            bandScale,
          );
        });
      }

      clipToBand(band, () => {
        sectionContext.beginPath();
        for (const [idx, point] of drawdownWater.entries()) {
          if (idx === 0) sectionContext.moveTo(point.x, point.y);
          else sectionContext.lineTo(point.x, point.y);
        }
        sectionContext.strokeStyle =
          sectionDischarge > 0 ? "#f97316" : "rgba(56, 189, 248, 0.78)";
        sectionContext.lineWidth = bandIndex === 0 ? 2.25 : 1.75;
        sectionContext.stroke();
      });
    }
  }

  if (visibleScreenBands.length > 0 && sectionDischarge > 0) {
    const deepestBand = visibleScreenBands.at(-1);
    const deepestOriginalHeadZ =
      (deepestBand.topZ + deepestBand.bottomZ) / 2;
    const deepestDrawdownZ = clippedDrawdownZ(
      wellX,
      deepestBand,
      deepestOriginalHeadZ,
      1,
    );
    const deepestInfluenceRadius =
      getBandDrawdownConfig(deepestBand).influenceRadius;
    const coneLabel = project(
      Math.max(2400, wellX - deepestInfluenceRadius * 0.46),
      deepestDrawdownZ + 22,
    );
    drawCalloutText(
      sectionContext,
      "drawdown at screens",
      coneLabel.x,
      coneLabel.y,
      {
        font: "800 12px Inter, system-ui, sans-serif",
        color: "#fed7aa",
        background: "rgba(67, 20, 7, 0.76)",
        border: "rgba(251, 146, 60, 0.48)",
      },
    );

    let influenceLabelAnchor = null;
    for (const [bandIndex, band] of visibleScreenBands.entries()) {
      const originalHeadZ = (band.topZ + band.bottomZ) / 2;
      const { influenceRadius } = getBandDrawdownConfig(band);
      const influenceXMin = Math.max(0, wellX - influenceRadius);
      const influenceXMax = Math.min(
        sceneData.domain.lx_m,
        wellX + influenceRadius,
      );
      const leftInfluence = project(influenceXMin, originalHeadZ + 18);
      const rightInfluence = project(influenceXMax, originalHeadZ + 18);
      sectionContext.strokeStyle = "rgba(250, 204, 21, 0.94)";
      sectionContext.lineWidth = 2.1;
      sectionContext.setLineDash([10, 7]);
      sectionContext.beginPath();
      sectionContext.moveTo(leftInfluence.x, leftInfluence.y);
      sectionContext.lineTo(rightInfluence.x, rightInfluence.y);
      sectionContext.stroke();
      sectionContext.setLineDash([]);
      sectionContext.strokeStyle = "rgba(254, 240, 138, 0.96)";
      sectionContext.lineWidth = 1.8;
      sectionContext.beginPath();
      sectionContext.moveTo(leftInfluence.x, leftInfluence.y - 5);
      sectionContext.lineTo(leftInfluence.x, leftInfluence.y + 5);
      sectionContext.moveTo(rightInfluence.x, rightInfluence.y - 5);
      sectionContext.lineTo(rightInfluence.x, rightInfluence.y + 5);
      sectionContext.stroke();
      if (!influenceLabelAnchor) {
        influenceLabelAnchor = {
          x: Math.min(
            rightInfluence.x - 82,
            Math.max(
              project(wellX, originalHeadZ).x + 126,
              (leftInfluence.x + rightInfluence.x) / 2 + 140,
            ),
          ),
          y: leftInfluence.y - 15,
        };
      }
    }
    if (influenceLabelAnchor) {
      drawCalloutText(
        sectionContext,
        "area of influence",
        influenceLabelAnchor.x,
        influenceLabelAnchor.y,
        {
          align: "center",
          font: "900 11px Inter, system-ui, sans-serif",
          color: "#fef9c3",
          background: "rgba(66, 32, 6, 0.82)",
          border: "rgba(250, 204, 21, 0.55)",
        },
      );
    }
  }

  const top = project(
    activeSectionWell.x_m,
    activeSectionWell.screen_top_m,
  );
  const bottom = project(
    activeSectionWell.x_m,
    activeSectionWell.screen_bottom_m,
  );
  const pipeWidth = 16;
  const pipeX = top.x - pipeWidth / 2;
  const pipeTopY = top.y - 42;
  const casingGradient = sectionContext.createLinearGradient(
    pipeX,
    0,
    pipeX + pipeWidth,
    0,
  );
  casingGradient.addColorStop(0, "#6b7280");
  casingGradient.addColorStop(0.28, "#f8fafc");
  casingGradient.addColorStop(0.55, "#cbd5e1");
  casingGradient.addColorStop(1, "#475569");
  sectionContext.fillStyle = casingGradient;
  sectionContext.strokeStyle = "#111827";
  sectionContext.lineWidth = 1.4;
  sectionContext.beginPath();
  sectionContext.roundRect(
    pipeX,
    pipeTopY,
    pipeWidth,
    bottom.y - pipeTopY + 6,
    5,
  );
  sectionContext.fill();
  sectionContext.stroke();

  sectionContext.fillStyle = "#e5e7eb";
  sectionContext.strokeStyle = "#111827";
  sectionContext.lineWidth = 1.2;
  sectionContext.beginPath();
  sectionContext.ellipse(
    top.x,
    pipeTopY,
    pipeWidth * 0.72,
    4.8,
    0,
    0,
    Math.PI * 2,
  );
  sectionContext.fill();
  sectionContext.stroke();

  for (const band of visibleScreenBands) {
    const segmentTop = project(activeSectionWell.x_m, band.topZ);
    const segmentBottom = project(activeSectionWell.x_m, band.bottomZ);
    const segmentTopY = Math.max(
      pipeTopY + 8,
      Math.min(segmentTop.y, segmentBottom.y),
    );
    const segmentBottomY = Math.min(
      bottom.y + 2,
      Math.max(segmentTop.y, segmentBottom.y),
    );
    if (segmentBottomY - segmentTopY < 14) {
      continue;
    }
    const screenGradient = sectionContext.createLinearGradient(
      pipeX,
      0,
      pipeX + pipeWidth,
      0,
    );
    screenGradient.addColorStop(0, "#075985");
    screenGradient.addColorStop(0.35, "#38bdf8");
    screenGradient.addColorStop(0.65, "#0ea5e9");
    screenGradient.addColorStop(1, "#075985");
    sectionContext.fillStyle = screenGradient;
    sectionContext.strokeStyle = "#082f49";
    sectionContext.lineWidth = 1.4;
    sectionContext.beginPath();
    sectionContext.roundRect(
      pipeX - 1,
      segmentTopY,
      pipeWidth + 2,
      segmentBottomY - segmentTopY,
      5,
    );
    sectionContext.fill();
    sectionContext.stroke();

    sectionContext.fillStyle = "rgba(14, 165, 233, 0.42)";
    sectionContext.beginPath();
    sectionContext.roundRect(
      pipeX + 3,
      segmentTopY + 5,
      pipeWidth - 6,
      Math.max(10, segmentBottomY - segmentTopY - 10),
      4,
    );
    sectionContext.fill();

    for (
      let holeY = segmentTopY + 10;
      holeY < segmentBottomY - 7;
      holeY += 13
    ) {
      for (const side of [-1, 1]) {
        const holeX = top.x + side * 5.1;
        sectionContext.strokeStyle = "rgba(186, 230, 253, 0.95)";
        sectionContext.fillStyle = "rgba(8, 47, 73, 0.86)";
        sectionContext.lineWidth = 1.45;
        sectionContext.beginPath();
        sectionContext.ellipse(holeX, holeY, 2.1, 3.0, 0, 0, Math.PI * 2);
        sectionContext.fill();
        sectionContext.stroke();
        sectionContext.beginPath();
        sectionContext.moveTo(top.x + side * 25, holeY - 5);
        sectionContext.quadraticCurveTo(
          top.x + side * 15,
          holeY - 2,
          holeX + side * 1.5,
          holeY,
        );
        sectionContext.strokeStyle = "rgba(125, 211, 252, 0.72)";
        sectionContext.lineWidth = 1.35;
        sectionContext.stroke();
      }
    }
  }

  sectionContext.fillStyle =
    activeSectionWell.role === "Pumping" ? "#65a8ff" : "#f8fafc";
  sectionContext.font = "800 16px Inter, system-ui, sans-serif";
  sectionContext.textAlign = "center";
  const activeWellName =
    wellPresentation[activeSectionWell.id]?.name || activeSectionWell.id;
  sectionContext.fillText(activeWellName, top.x, top.y - 58);
  const sensorLabels = ["WL", "pH", "T", "EC"];
  const sensorTipY = bottom.y + 22;
  const sensorOffsets = [-33, -11, 11, 33];
  sectionContext.strokeStyle = "rgba(8, 47, 73, 0.72)";
  sectionContext.lineWidth = 1.5;
  sectionContext.beginPath();
  sectionContext.moveTo(bottom.x, bottom.y + 5);
  sectionContext.lineTo(bottom.x, sensorTipY - 9);
  sectionContext.moveTo(bottom.x - 39, sensorTipY - 9);
  sectionContext.lineTo(bottom.x + 39, sensorTipY - 9);
  sectionContext.stroke();

  sensorHitBoxes = sensorOffsets.map((offsetX, index) => {
    const sensorX = bottom.x + offsetX;
    const sensorY = sensorTipY;
    sectionContext.strokeStyle = "rgba(8, 47, 73, 0.55)";
    sectionContext.lineWidth = 1.2;
    sectionContext.beginPath();
    sectionContext.moveTo(sensorX, sensorTipY - 9);
    sectionContext.lineTo(sensorX, sensorY - 7);
    sectionContext.stroke();

    const sensorGradient = sectionContext.createRadialGradient(
      sensorX - 2,
      sensorY - 2,
      2,
      sensorX,
      sensorY,
      10,
    );
    sensorGradient.addColorStop(0, "#e0f2fe");
    sensorGradient.addColorStop(0.5, "#22d3ee");
    sensorGradient.addColorStop(1, "#0e7490");
    sectionContext.fillStyle = sensorGradient;
    sectionContext.strokeStyle =
      activeSensorIndex === index ? "#fef08a" : "#cffafe";
    sectionContext.lineWidth = activeSensorIndex === index ? 2.6 : 1.8;
    sectionContext.beginPath();
    sectionContext.arc(sensorX, sensorY, 7.5, 0, Math.PI * 2);
    sectionContext.fill();
    sectionContext.stroke();

    sectionContext.fillStyle = "#083344";
    sectionContext.beginPath();
    sectionContext.arc(sensorX, sensorY, 2.3, 0, Math.PI * 2);
    sectionContext.fill();

    sectionContext.fillStyle = "#0b1f3a";
    sectionContext.font = "800 9px Inter, system-ui, sans-serif";
    sectionContext.textAlign = "center";
    sectionContext.fillText(sensorLabels[index], sensorX, sensorY + 20);
    return {
      index,
      x: sensorX - 13,
      y: sensorY - 13,
      width: 26,
      height: 38,
    };
  });

  if (topViewSetupMode && selectedAquiferRegion?.polygon?.length) {
    const polygon = selectedAquiferRegion.polygon;
    const target = polygon.reduce(
      (acc, point) => ({
        x: acc.x + point.x / polygon.length,
        y: acc.y + point.y / polygon.length,
      }),
      { x: 0, y: 0 },
    );
    const start = {
      x: Math.max(28, target.x - 180),
      y: Math.max(58, target.y - 76),
    };
    const angle = Math.atan2(target.y - start.y, target.x - start.x);
    sectionContext.save();
    sectionContext.strokeStyle = "#1fa3c9";
    sectionContext.fillStyle = "#1fa3c9";
    sectionContext.lineWidth = 3.2;
    sectionContext.setLineDash([10, 7]);
    sectionContext.beginPath();
    sectionContext.moveTo(start.x, start.y);
    sectionContext.quadraticCurveTo(
      (start.x + target.x) / 2,
      start.y - 42,
      target.x,
      target.y,
    );
    sectionContext.stroke();
    sectionContext.setLineDash([]);
    sectionContext.beginPath();
    sectionContext.moveTo(target.x, target.y);
    sectionContext.lineTo(
      target.x - Math.cos(angle - 0.45) * 16,
      target.y - Math.sin(angle - 0.45) * 16,
    );
    sectionContext.lineTo(
      target.x - Math.cos(angle + 0.45) * 16,
      target.y - Math.sin(angle + 0.45) * 16,
    );
    sectionContext.closePath();
    sectionContext.fill();
    drawCalloutText(
      sectionContext,
      `selected ${selectedAquiferRegion.type.toLowerCase()}`,
      start.x,
      start.y - 10,
      {
        align: "left",
        font: "900 11px Inter, system-ui, sans-serif",
        color: "#0b1f3a",
        background: "rgba(223, 246, 253, 0.9)",
        border: "rgba(31, 163, 201, 0.58)",
      },
    );
    sectionContext.restore();
  }
}

// View transitions and zoom controls
function openSectionView(well) {
  activeSectionWell = well;
  sectionMode = true;
  topViewMode = false;
  topViewSetupMode = false;
  pendingTopViewRegion = null;
  selectedAquiferRegion = null;
  sectionZoom = 1;
  sectionPanX = 0;
  sectionPanY = 0;
  lastSectionCursor = {
    x: sectionCanvas.clientWidth / 2,
    y: sectionCanvas.clientHeight / 2,
  };
  sectionDischarge = Math.abs(well.pumping_m3_day || 0);
  sectionDischargeInput.value = String(
    Math.min(Number(sectionDischargeInput.max), sectionDischarge),
  );
  sectionDischarge = Number(sectionDischargeInput.value);
  selectedScreenLevels = new Set();
  soilTypeByLevel = new Map(
    Object.entries(defaultSoilByLevel).map(([level, soilType]) => [
      Number(level),
      soilType,
    ]),
  );
  soilHydraulicByLevel = new Map(
    Object.entries(defaultSoilByLevel).map(([level, soilType]) => [
      Number(level),
      { ...getHydraulicDefaultsForSoil(soilType) },
    ]),
  );
  activeSoilLevel = 1;
  selectedSoilType = getSoilTypeForLevel(activeSoilLevel);
  soilTypeSelect.value = selectedSoilType;
  updateScreenOptions(well);
  updateDischargeLabel();
  controls.enabled = false;
  const presentation = wellPresentation[well.id] || {
    name: `${well.id} ${well.role}`,
    sectionLocation: "Los Baños Laguna",
  };
  sectionTitleEl.textContent = presentation.name;
  sectionWellLocationEl.textContent = presentation.sectionLocation;
  updateMetricFields(well);
  menuPanelEl.classList.add("is-section-mode");
  menuPanelEl.classList.remove("is-plan-mode");
  menuPanelEl.classList.remove("is-aquifer-setup-mode");
  planViewSummaryEl.hidden = true;
  aquiferSetupPanelEl.hidden = true;
  topViewBackButton.hidden = true;
  menu3dStateEl.hidden = true;
  menuSectionStateEl.hidden = false;
  setPanelHidden(false);
  updateWellSelectorStates(well.id);
  statusEl.textContent = `Selected ${well.id}: 2D section view.`;
  sectionViewEl.classList.add("is-open");
  try {
    drawSectionView();
  } catch (error) {
    console.error("Could not draw 2D section view", error);
  }
}

function closeSectionView() {
  stopTopViewDischargeAnimation();
  sectionMode = false;
  topViewMode = false;
  topViewSetupMode = false;
  pendingTopViewRegion = null;
  selectedAquiferRegion = null;
  activeSectionWell = null;
  hideSensorSpecs();
  controls.enabled = true;
  sectionViewEl.classList.remove("is-open");
  menuPanelEl.classList.remove("is-section-mode");
  menuPanelEl.classList.remove("is-plan-mode");
  menuPanelEl.classList.remove("is-aquifer-setup-mode");
  planViewSummaryEl.hidden = true;
  aquiferSetupPanelEl.hidden = true;
  topViewBackButton.hidden = true;
  menuSectionStateEl.hidden = true;
  menu3dStateEl.hidden = false;
  updateWellSelectorStates(null);
  statusEl.textContent = sceneData
    ? `${sceneData.layers.length} layers, ${sceneData.flowArrows.length} arrows, ${sceneData.wells.length} wells loaded.`
    : "3D view restored.";
}

function setSectionZoom(nextZoom) {
  sectionZoom = Math.min(2.4, Math.max(0.65, nextZoom));
  drawSectionView();
}

function getSectionLayout() {
  const width = sectionCanvas.clientWidth;
  const height = sectionCanvas.clientHeight;
  const panelBounds =
    topViewSetupMode && !menuPanelEl.classList.contains("is-hidden")
      ? menuPanelEl.getBoundingClientRect()
      : null;
  const marginX = panelBounds
    ? Math.min(width - 520, panelBounds.right + 92)
    : Math.min(410, Math.max(92, width * 0.2));
  const marginTop = topViewSetupMode ? 188 : 116;
  const marginBottom = topViewSetupMode ? 220 : 76;
  const availableWidth = width - marginX - 70;
  const plotWidth = panelBounds
    ? Math.max(480, Math.min(740, availableWidth * 0.56))
    : width - marginX - 220;
  const plotHeight = topViewSetupMode
    ? Math.max(260, Math.min(460, height - marginTop - marginBottom))
    : height - marginTop - marginBottom;
  return { marginX, marginTop, plotWidth, plotHeight };
}

function zoomSectionAt(nextZoom, anchorX, anchorY) {
  if (topViewSetupMode) {
    return;
  }
  const previousZoom = sectionZoom;
  const clampedZoom = Math.min(2.4, Math.max(0.65, nextZoom));
  if (clampedZoom === previousZoom) {
    return;
  }
  const zoomRatio = clampedZoom / previousZoom;
  const { marginX, marginTop, plotWidth, plotHeight } =
    getSectionLayout();
  const xAnchorBase = marginX + sectionPanX + plotWidth / 2;
  const yAnchorBase = marginTop + sectionPanY - plotHeight / 2;
  sectionPanX =
    anchorX -
    marginX -
    plotWidth / 2 -
    (anchorX - xAnchorBase) * zoomRatio;
  sectionPanY =
    anchorY -
    marginTop +
    plotHeight / 2 -
    (anchorY - yAnchorBase) * zoomRatio;
  sectionZoom = clampedZoom;
  drawSectionView();
}

function zoomTopViewAt(nextZoom, anchorX, anchorY) {
  const previousZoom = topViewZoom;
  const clampedZoom = Math.min(5, Math.max(0.65, nextZoom));
  if (clampedZoom === previousZoom) return;
  const ratio = clampedZoom / previousZoom;
  const width = sectionCanvas.clientWidth;
  const height = sectionCanvas.clientHeight;
  const { marginLeft, marginTop, plotWidth, plotHeight } =
    getTopViewLayout(width, height);
  const baseCenterX = marginLeft + plotWidth / 2;
  const baseCenterY = marginTop + plotHeight / 2;
  const oldCenterX = baseCenterX + topViewPanX;
  const oldCenterY = baseCenterY + topViewPanY;
  topViewPanX = anchorX - baseCenterX - (anchorX - oldCenterX) * ratio;
  topViewPanY = anchorY - baseCenterY - (anchorY - oldCenterY) * ratio;
  topViewZoom = clampedZoom;
  drawSectionView();
}

function animateTopViewDischarge(targetDischarge) {
  if (topViewDischargeFrame !== null) {
    cancelAnimationFrame(topViewDischargeFrame);
  }
  const startDischarge = topViewAnimatedDischarge;
  const change = targetDischarge - startDischarge;
  const startedAt = performance.now();
  const duration = 420;

  const step = (timestamp) => {
    const progress = Math.min(1, (timestamp - startedAt) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    topViewAnimatedDischarge = startDischarge + change * eased;
    drawSectionView();
    if (progress < 1 && topViewMode) {
      topViewDischargeFrame = requestAnimationFrame(step);
    } else {
      topViewAnimatedDischarge = targetDischarge;
      topViewDischargeFrame = null;
      if (topViewMode) drawSectionView();
    }
  };

  topViewDischargeFrame = requestAnimationFrame(step);
}

function stopTopViewDischargeAnimation() {
  if (topViewDischargeFrame !== null) {
    cancelAnimationFrame(topViewDischargeFrame);
    topViewDischargeFrame = null;
  }
}

function transitionSectionCanvas(callback) {
  sectionViewEl.classList.add("is-changing");
  window.setTimeout(() => {
    callback();
    drawSectionView();
    requestAnimationFrame(() =>
      sectionViewEl.classList.remove("is-changing"),
    );
  }, 180);
}

function setModflowTransitionStage(stage) {
  if (!modflowTransitionEl || !stage) return;
  modflowTransitionTitleEl.textContent = stage.title;
  modflowTransitionDetailEl.textContent = stage.detail;
  modflowTransitionProgressEl.style.width = `${stage.progress}%`;
}

function showModflowTransition() {
  if (!modflowTransitionEl) return;
  let stageIndex = 0;
  setModflowTransitionStage(modflowTransitionStages[stageIndex]);
  document.body.classList.add("is-modflow-running");
  modflowTransitionEl.hidden = false;
  modflowTransitionEl.setAttribute("aria-hidden", "false");
  requestAnimationFrame(() =>
    modflowTransitionEl.classList.add("is-visible"),
  );
  window.clearInterval(modflowTransitionTimer);
  modflowTransitionTimer = window.setInterval(() => {
    stageIndex = Math.min(
      stageIndex + 1,
      modflowTransitionStages.length - 1,
    );
    setModflowTransitionStage(modflowTransitionStages[stageIndex]);
  }, 1100);
}

function completeModflowTransition() {
  window.clearInterval(modflowTransitionTimer);
  modflowTransitionTimer = null;
  setModflowTransitionStage({
    title: "Top view ready",
    detail:
      "MODFLOW heads, drawdown, flow vectors, and budget terms are ready to render.",
    progress: 100,
  });
}
