/* eslint-disable */
/* Aquifer setup, sensors, well picker, scene loading, event wiring, and animation loop. */

const MODFLOW_GRID_LIMITS = {
  minRows: 5,
  maxRows: 50,
  minColumns: 5,
  maxColumns: 50,
  maxCells: 2500,
  minGridSizeM: 5,
  maxGridSizeM: 250,
};

function hideModflowTransition(delay = 260) {
  if (!modflowTransitionEl) return;
  window.clearInterval(modflowTransitionTimer);
  modflowTransitionTimer = null;
  window.setTimeout(() => {
    modflowTransitionEl.classList.remove("is-visible");
    modflowTransitionEl.setAttribute("aria-hidden", "true");
    window.setTimeout(() => {
      modflowTransitionEl.hidden = true;
      document.body.classList.remove("is-modflow-running");
    }, 280);
  }, delay);
}

// MODFLOW aquifer setup panel state and API integration
function updateScenarioDirectionButtons() {
  for (const button of scenarioDirectionButtons) {
    button.classList.toggle(
      "is-active",
      button.dataset.direction === scenarioDirection,
    );
  }
}

function formatElevationMeters(value) {
  return `${Number(value).toLocaleString(undefined, {
    maximumFractionDigits: 1,
  })} m`;
}

function formatHydraulicValue(value) {
  return Number(value).toLocaleString(undefined, {
    maximumFractionDigits: 4,
  });
}

function resetHydraulicPropertiesForLevel(level, soilType) {
  soilHydraulicByLevel.set(level, {
    ...getHydraulicDefaultsForSoil(soilType),
  });
}

function readHydraulicInputValues() {
  return {
    k: clampNumber(soilHorizontalKInput.value, 0.001, 200),
    k33: clampNumber(soilVerticalKInput.value, 0.0001, 50),
    sy: clampNumber(soilSpecificYieldInput.value, 0.01, 0.5),
  };
}

function normalizeHydraulicInputs() {
  const properties = readHydraulicInputValues();
  soilHorizontalKInput.value = String(properties.k);
  soilVerticalKInput.value = String(properties.k33);
  soilSpecificYieldInput.value = String(properties.sy);
  applyHydraulicInputsToActiveLevel({ classify: true });
}

function writeHydraulicInputs(level = activeSoilLevel) {
  const properties = getHydraulicPropertiesForLevel(level);
  soilHorizontalKInput.value = String(properties.k);
  soilVerticalKInput.value = String(properties.k33);
  soilSpecificYieldInput.value = String(properties.sy);
}

function updateHydraulicNote(soilType = getSoilTypeForLevel(activeSoilLevel)) {
  const range = getHydraulicRangeForSoil(soilType);
  if (!soilHydraulicNoteEl || !range) return;
  const properties = getHydraulicPropertiesForLevel(activeSoilLevel);
  soilHydraulicNoteEl.textContent = `${range.label} Current Kx ${formatHydraulicValue(properties.k)} m/day.`;
}

function applyHydraulicInputsToActiveLevel({ classify = false } = {}) {
  const properties = readHydraulicInputValues();
  soilHydraulicByLevel.set(activeSoilLevel, properties);
  if (classify) {
    const inferredSoilType = classifySoilByHydraulicK(properties.k);
    selectedSoilType = inferredSoilType;
    soilTypeByLevel.set(activeSoilLevel, inferredSoilType);
  }
  updateSoilControl({ writeHydraulicValues: false });
  updateDischargeLabel();
  drawSectionView();
}

function calculateStreamLeakage(groundwaterElevation, riverElevation) {
  const headDifference = riverElevation - groundwaterElevation;
  return STREAMBED_CONDUCTANCE_M2_DAY * headDifference;
}

function formatStreamLeakage(value) {
  const leakage = Math.abs(value) < 0.00005 ? 0 : value;
  return leakage.toFixed(4);
}

function signedStreamLeakageFromControls() {
  const direction = scenarioInputs.leakageDirection.value;
  const magnitude = Math.abs(clampNumber(scenarioInputs.streamLeakage.value, -1, 1));
  return direction === "negative" ? -magnitude : magnitude;
}

function writeSignedStreamLeakage(value) {
  const leakage = clampNumber(value, -1, 1);
  scenarioInputs.streamLeakage.value = formatStreamLeakage(leakage);
  scenarioInputs.leakageDirection.value = leakage < 0 ? "negative" : "positive";
}

function clampInteger(value, min, max) {
  const number = Math.round(Number(value));
  if (!Number.isFinite(number)) return min;
  return Math.min(max, Math.max(min, number));
}

function clampNumber(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.min(max, Math.max(min, number));
}

function validateScenarioGridInputs({ writeValues = false } = {}) {
  const rawRows = Number(scenarioInputs.rows.value);
  const rawColumns = Number(scenarioInputs.columns.value);
  const rawGridSizeM = Number(scenarioInputs.gridSize.value);
  let rows = clampInteger(
    scenarioInputs.rows.value,
    MODFLOW_GRID_LIMITS.minRows,
    MODFLOW_GRID_LIMITS.maxRows,
  );
  let columns = clampInteger(
    scenarioInputs.columns.value,
    MODFLOW_GRID_LIMITS.minColumns,
    MODFLOW_GRID_LIMITS.maxColumns,
  );
  const gridSizeM = clampNumber(
    scenarioInputs.gridSize.value,
    MODFLOW_GRID_LIMITS.minGridSizeM,
    MODFLOW_GRID_LIMITS.maxGridSizeM,
  );
  const messages = [];

  if (rawRows !== rows) {
    messages.push(
      `Rows must be ${MODFLOW_GRID_LIMITS.minRows}-${MODFLOW_GRID_LIMITS.maxRows}.`,
    );
  }
  if (rawColumns !== columns) {
    messages.push(
      `Columns must be ${MODFLOW_GRID_LIMITS.minColumns}-${MODFLOW_GRID_LIMITS.maxColumns}.`,
    );
  }
  if (rawGridSizeM !== gridSizeM) {
    messages.push(
      `Grid size must be ${MODFLOW_GRID_LIMITS.minGridSizeM}-${MODFLOW_GRID_LIMITS.maxGridSizeM} m.`,
    );
  }

  if (rows * columns > MODFLOW_GRID_LIMITS.maxCells) {
    if (rows >= columns) {
      rows = Math.max(
        MODFLOW_GRID_LIMITS.minRows,
        Math.floor(MODFLOW_GRID_LIMITS.maxCells / columns),
      );
    } else {
      columns = Math.max(
        MODFLOW_GRID_LIMITS.minColumns,
        Math.floor(MODFLOW_GRID_LIMITS.maxCells / rows),
      );
    }
    messages.push(
      `Grid capped at ${MODFLOW_GRID_LIMITS.maxCells.toLocaleString()} cells for responsive MODFLOW runs.`,
    );
  }

  if (writeValues) {
    scenarioInputs.rows.value = String(rows);
    scenarioInputs.columns.value = String(columns);
    scenarioInputs.gridSize.value = String(gridSizeM);
  }

  return {
    rows,
    columns,
    gridSizeM,
    cellCount: rows * columns,
    areaKm2: (rows * columns * gridSizeM * gridSizeM) / 1_000_000,
    valid: messages.length === 0,
    message: messages[0] || "",
  };
}

function calculateGridAreaKm2() {
  return validateScenarioGridInputs().areaKm2;
}

function formatGridArea(value) {
  if (value >= 1) {
    return value.toFixed(2);
  }
  if (value >= 0.01) {
    return value.toFixed(4);
  }
  return value.toFixed(6);
}

function updateAquiferSetupReadouts({ syncStreamLeakageFromElevations = false } = {}) {
  const gridValidation = validateScenarioGridInputs();
  const groundwaterElevation = Number(
    scenarioInputs.groundwaterElevation.value,
  );
  const riverElevation = Number(scenarioInputs.riverElevation.value);
  const groundwaterValue = formatElevationMeters(groundwaterElevation);
  const riverValue = formatElevationMeters(riverElevation);
  let streamLeakage = signedStreamLeakageFromControls();
  if (syncStreamLeakageFromElevations) {
    streamLeakage = calculateStreamLeakage(
      groundwaterElevation,
      riverElevation,
    );
    writeSignedStreamLeakage(streamLeakage);
  } else {
    scenarioInputs.streamLeakage.value = formatStreamLeakage(streamLeakage);
  }
  scenarioInputs.groundwaterElevation
    .closest(".aquifer-elevation-control")
    ?.querySelector(".aquifer-elevation-control__value")
    ?.replaceChildren(document.createTextNode(groundwaterValue));
  scenarioInputs.riverElevation
    .closest(".aquifer-elevation-control")
    ?.querySelector(".aquifer-elevation-control__value")
    ?.replaceChildren(document.createTextNode(riverValue));
  scenarioInputs.area.value = formatGridArea(calculateGridAreaKm2());
  for (const radio of scenarioLeakageDirectionRadios) {
    radio.checked = radio.value === scenarioInputs.leakageDirection.value;
  }
  syncAquiferSetupChoiceCards();
  rechargeRateValueEl.textContent = `${Number(
    scenarioInputs.rechargeRate.value,
  ).toLocaleString()} m³/day`;
  if (gridValidation.message) {
    aquiferSetupStatusEl.textContent = gridValidation.message;
  } else if (
    aquiferSetupStatusEl.textContent.startsWith("Grid capped at") ||
    aquiferSetupStatusEl.textContent.includes(" must be ")
  ) {
    aquiferSetupStatusEl.textContent =
      "Configure the selected aquifer before generating the top view.";
  }
}

function syncAquiferSetupChoiceCards() {
  for (const radio of scenarioRechargeZoneRadios) {
    radio.closest(".aquifer-option")?.classList.toggle(
      "is-active",
      radio.checked,
    );
  }
  for (const radio of scenarioLeakageDirectionRadios) {
    radio.closest(".aquifer-leakage-option")?.classList.toggle(
      "is-active",
      radio.checked,
    );
  }
}

function readScenarioConfig(region = pendingTopViewRegion) {
  const level = region?.level || 1;
  const grid = validateScenarioGridInputs({ writeValues: true });
  return {
    layerIndex: level - 1,
    layerName: region?.type || `Layer ${level}`,
    wellId: activeSectionWell?.id || "unknown",
    wellName:
      wellPresentation[activeSectionWell?.id]?.name ||
      activeSectionWell?.id ||
      "Unknown well",
    well: activeSectionWell
      ? {
          x: activeSectionWell.x_m,
          y: activeSectionWell.y_m,
          pumpingRate: sectionDischarge,
        }
      : null,
    grid: {
      rows: grid.rows,
      columns: grid.columns,
      areaKm2: grid.areaKm2,
      gridSizeM: grid.gridSizeM,
      layers: Number(scenarioInputs.layers.value),
    },
    boundary: {
      type: scenarioInputs.boundary.value,
      direction: scenarioDirection,
      groundwaterElevation: Number(
        scenarioInputs.groundwaterElevation.value,
      ),
      riverElevation: Number(scenarioInputs.riverElevation.value),
      streamLeakage: signedStreamLeakageFromControls(),
      leakageDirection: scenarioInputs.leakageDirection.value,
    },
    recharge: {
      enabled: scenarioInputs.rechargeEnabled.checked,
      rateMmDay: Number(scenarioInputs.rechargeRate.value),
      zoneMode: scenarioInputs.rechargeZone.value,
    },
    screens: [...selectedScreenLevels].sort((a, b) => a - b),
    soilsByLevel: Object.fromEntries(
      [1, 2, 3].map((levelNumber) => [
        String(levelNumber),
        getSoilTypeForLevel(levelNumber),
      ]),
    ),
    hydraulicByLevel: Object.fromEntries(
      [1, 2, 3].map((levelNumber) => [
        String(levelNumber),
        getHydraulicPropertiesForLevel(levelNumber),
      ]),
    ),
    dischargeM3Day: sectionDischarge,
  };
}

function openTopViewSetup(region) {
  if (!modflowTopViewData) {
    statusEl.textContent = "MODFLOW plan-view data is not available.";
    return;
  }
  scenarioInputs.boundary.value = "river";
  topViewSetupMode = true;
  pendingTopViewRegion = region;
  selectedAquiferRegion = region;
  sectionZoom = 1;
  sectionPanX = 0;
  sectionPanY = 0;
  aquiferSetupPanelEl.hidden = false;
  planViewSummaryEl.hidden = true;
  menu3dStateEl.hidden = true;
  menuSectionStateEl.hidden = false;
  menuPanelEl.classList.add("is-aquifer-setup-mode");
  menuPanelEl.classList.add("is-section-mode");
  menuPanelEl.classList.remove("is-plan-mode");
  revealPanel();
  menuPanelEl.scrollTop = 0;
  topViewBackButton.hidden = false;
  aquiferSetupStatusEl.textContent =
    "Configure the selected aquifer before generating the top view.";
  aquiferSetupTitleEl.textContent = `Layer ${region.level} Aquifer Setup`;
  sectionTitleEl.textContent = `${region.type} Setup`;
  sectionWellLocationEl.textContent = "with FloPy & MODFLOW";
  updateScenarioDirectionButtons();
  updateAquiferSetupReadouts();
  syncAquiferSetupChoiceCards();
  drawSectionView();
}

function closeTopViewSetup() {
  topViewSetupMode = false;
  pendingTopViewRegion = null;
  selectedAquiferRegion = null;
  aquiferSetupPanelEl.hidden = true;
  menuPanelEl.classList.remove("is-aquifer-setup-mode");
  topViewBackButton.hidden = topViewMode ? false : true;
  const presentation = wellPresentation[activeSectionWell.id] || {};
  sectionTitleEl.textContent =
    presentation.name || `${activeSectionWell.id} ${activeSectionWell.role}`;
  sectionWellLocationEl.textContent =
    presentation.sectionLocation || "Los Baños Laguna";
  drawSectionView();
}


async function fetchScenarioTopView(config) {
  const apiCandidates = [
    "/api/simulation/top-view",
    "http://localhost:8000/simulation/top-view",
  ];
  const errors = [];
  for (const url of apiCandidates) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (response.ok) {
        return await response.json();
      }
      let detail = `HTTP ${response.status}`;
      try {
        const payload = await response.json();
        detail = payload.detail || payload.error || payload.message || detail;
      } catch {
        // Keep the status-only detail when the response body is not JSON.
      }
      const message =
        typeof detail === "string" ? detail : JSON.stringify(detail);
      errors.push(`${url}: ${message}`);
      console.warn(`Scenario API unavailable at ${url}: ${message}`);
    } catch (error) {
      errors.push(
        `${url}: ${error instanceof Error ? error.message : String(error)}`,
      );
      console.warn(`Scenario API unavailable at ${url}`, error);
    }
  }
  throw new Error(errors.join(" | ") || "No scenario API returned data.");
}

async function fetchFirstJson(candidates) {
  let lastError = null;
  for (const url of candidates) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (response.ok) {
        return await response.json();
      }
      lastError = new Error(`HTTP ${response.status} from ${url}`);
      console.warn(lastError.message);
    } catch (error) {
      lastError = error;
      console.warn(`Could not load JSON from ${url}`, error);
    }
  }
  throw lastError || new Error("No JSON sources configured.");
}

async function runScenarioAndOpenTopView() {
  if (!pendingTopViewRegion) return;
  const region = pendingTopViewRegion;
  const config = readScenarioConfig(region);
  activeScenarioConfig = config;
  aquiferSetupStatusEl.textContent = "Running MODFLOW scenario...";
  scenarioRunButton.disabled = true;
  setPanelHidden(true);
  showModflowTransition();
  try {
    const scenarioData = await fetchScenarioTopView(config);
    if (scenarioData?.layers?.length) {
      modflowTopViewData = scenarioData;
      aquiferSetupStatusEl.textContent = "Scenario solved. Opening top view...";
      completeModflowTransition();
      await new Promise((resolve) => window.setTimeout(resolve, 420));
      openTopView(region, config);
      hideModflowTransition(520);
    } else {
      aquiferSetupStatusEl.textContent =
        "The model run returned an unexpected response.";
      hideModflowTransition(0);
      revealPanel();
    }
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : "Unknown scenario run error.";
    aquiferSetupStatusEl.textContent = `MODFLOW run failed: ${detail}`;
    hideModflowTransition(0);
    revealPanel();
  } finally {
    scenarioRunButton.disabled = false;
  }
}

function openTopView(region, config = activeScenarioConfig) {
  if (!modflowTopViewData) {
    statusEl.textContent = "MODFLOW plan-view data is not available.";
    return;
  }
  transitionSectionCanvas(() => {
    topViewMode = true;
    topViewSetupMode = false;
    pendingTopViewRegion = null;
    selectedAquiferRegion = null;
    activeTopLayer = Math.max(
      0,
      Math.min(modflowTopViewData.layers.length - 1, region.level - 1),
    );
    topViewZoom = 1;
    topViewPanX = 0;
    topViewPanY = 0;
    stopTopViewDischargeAnimation();
    topViewAnimatedDischarge = sectionDischarge;
    hoveredAquiferLevel = null;
    hideSensorSpecs();
    aquiferSetupPanelEl.hidden = true;
    menuPanelEl.classList.add("is-plan-mode");
    menuPanelEl.classList.remove("is-aquifer-setup-mode");
    planViewSummaryEl.hidden = false;
    topViewBackButton.hidden = false;
    const layer = modflowTopViewData.layers[activeTopLayer];
    const gridType = modflowTopViewData.grid.type || "MODFLOW";
    sectionTitleEl.textContent = `${region.type} Top View`;
    sectionWellLocationEl.textContent = `MODFLOW Layer ${activeTopLayer + 1}`;
    planViewModelEl.textContent = `${modflowTopViewData.source.solver} ${modflowTopViewData.source.state} result`;
    planViewDetailsEl.textContent = `${modflowTopViewData.grid.cells.length} ${gridType} cells rendered from FloPy head, contour, well, river, and specific-discharge output for ${layer.name}. ${config ? `${config.grid.rows} × ${config.grid.columns} setup, ${config.boundary.direction.replaceAll("-", " ")} boundary.` : ""}`;
    sectionViewEl.setAttribute(
      "aria-label",
      `${region.type} MODFLOW plan view`,
    );
    revealPanel();
    menuPanelEl.scrollTop = 0;
  });
}

function closeTopView() {
  if (topViewSetupMode) {
    closeTopViewSetup();
    return;
  }
  if (!topViewMode) return;
  transitionSectionCanvas(() => {
    stopTopViewDischargeAnimation();
    topViewMode = false;
    selectedAquiferRegion = null;
    menuPanelEl.classList.remove("is-plan-mode");
    menuPanelEl.classList.remove("is-aquifer-setup-mode");
    aquiferSetupPanelEl.hidden = true;
    planViewSummaryEl.hidden = true;
    topViewBackButton.hidden = true;
    const presentation = wellPresentation[activeSectionWell.id] || {};
    sectionTitleEl.textContent =
      presentation.name ||
      `${activeSectionWell.id} ${activeSectionWell.role}`;
    sectionWellLocationEl.textContent =
      presentation.sectionLocation || "Los Baños Laguna";
    sectionViewEl.setAttribute("aria-label", "2D well section view");
  });
}

function updateDischargeLabel() {
  const soilProfile = getSoilProfileForLevel(activeSoilLevel);
  const discharge01 =
    sectionDischarge / Number(sectionDischargeInput.max);
  const influenceKm = (
    (4.5 + discharge01 * 12) *
    soilProfile.influence
  ).toFixed(1);
  sectionDischargeValueEl.textContent = `${Math.round(sectionDischarge).toLocaleString()} m³/day`;
  sectionDischargeValueEl.title = `${soilProfile.label} drawdown profile`;
  influenceValueEl.textContent = `${influenceKm} km`;
  influenceTrackEl.style.setProperty(
    "--influence-progress",
    `${Math.min(100, (Number(influenceKm) / 18) * 100)}%`,
  );
  soilDescriptionEl.textContent =
    soilDescriptions[soilProfile.type] || soilDescriptions.loam;
}

function updateSoilControl({ writeHydraulicValues = true } = {}) {
  const profile = getSoilProfileForLevel(activeSoilLevel);
  soilSelectValueEl.textContent = profile.label;
  soilFigureEl.src = soilImages[profile.type] || soilImages.loam;
  soilFigureEl.alt = `${profile.label} soil texture`;
  for (const option of soilSelectMenuEl.querySelectorAll(
    "[data-soil-option]",
  )) {
    const isCurrent = option.dataset.soilOption === profile.type;
    option.classList.toggle("is-current", isCurrent);
    option.setAttribute("aria-selected", String(isCurrent));
  }
  soilTypeSelect.value = profile.type;
  if (writeHydraulicValues) {
    writeHydraulicInputs(activeSoilLevel);
  }
  updateHydraulicNote(profile.type);
  updateScreenPreview();
}

function setSoilMenuOpen(isOpen) {
  soilSelectMenuEl.hidden = !isOpen;
  soilSelectButtonEl.setAttribute("aria-expanded", String(isOpen));
}

function updateMetricFields(well) {
  const values = wellMetrics[well.id] || wellMetrics["W-1"];
  for (const input of document.querySelectorAll("[data-metric]")) {
    const value = values[input.dataset.metric];
    if (value !== undefined) {
      input.value = String(value);
    }
  }
}

function getSensorSpecs(well, sensorIndex = activeSensorIndex) {
  const profile = sensorProfiles[sensorIndex] || sensorProfiles[0];
  return {
    "Sensor ID": `${well.id}-S${sensorIndex + 1}`,
    Sensor: profile.model,
    Purpose: profile.description,
    Placement: "Lowest point of well",
    ...profile.specs,
  };
}

function showSensorSpecs(sensorIndex = activeSensorIndex) {
  if (!activeSectionWell) {
    return;
  }
  activeSensorIndex = sensorIndex;
  sensorSpecsSelectEl.replaceChildren();
  for (let index = 0; index < 4; index += 1) {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `${activeSectionWell.id}-S${index + 1} · ${sensorProfiles[index].shortName}`;
    option.selected = index === activeSensorIndex;
    sensorSpecsSelectEl.appendChild(option);
  }
  const specs = getSensorSpecs(activeSectionWell, activeSensorIndex);
  sensorSpecsTitleEl.textContent =
    sensorProfiles[activeSensorIndex].shortName;
  sensorSpecsListEl.replaceChildren();
  for (const [label, value] of Object.entries(specs)) {
    const term = document.createElement("dt");
    term.textContent = label;
    const description = document.createElement("dd");
    description.textContent = value;
    sensorSpecsListEl.append(term, description);
  }
  sensorSpecsVisible = true;
  sensorSpecsEl.hidden = false;
  drawSectionView();
}

function hideSensorSpecs() {
  sensorSpecsVisible = false;
  sensorSpecsEl.hidden = true;
}

function addLegend(layerColors) {
  legendEl.replaceChildren();
  for (const [label, color] of Object.entries(layerColors)) {
    const item = document.createElement("div");
    item.className = "legend-item";
    item.innerHTML = `<span class="swatch" style="background:${color}"></span><span>${label}</span>`;
    legendEl.appendChild(item);
  }
}

function wellIconMarkup(role) {
  if (role === "Monitoring") {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 18.5h2.25v-4H3v4Zm4.1 0h2.25v-7H7.1v7Zm4.1 0h2.25V9h-2.25v9.5Zm4.1 0h2.25V6h-2.25v12.5Zm4.1 0h1.5V3.5h-1.5v15ZM3.4 11.6l4.3-4.1 3.3 2.6 6.1-6.2 1.3 1.3-7.3 7.4-3.3-2.5-3.1 3-1.3-1.5Z"/>
      </svg>`;
  }
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.4c-.7 1.3-6.2 8.2-6.2 12.2A6.2 6.2 0 0 0 12 20.8a6.2 6.2 0 0 0 6.2-6.2C18.2 10.6 12.7 3.7 12 2.4Zm-2.8 13c.2 1.4 1.1 2.2 2.4 2.6-2.1.3-3.8-1.2-3.8-3.3 0-1.2.6-2.5 1.5-3.8-.2 1.6-.3 3.1-.1 4.5Z"/>
    </svg>`;
}

function updateWellSelectorStates(selectedWellId) {
  for (const button of wellPickerEl.querySelectorAll(".well-selector")) {
    button.classList.toggle(
      "is-selected",
      button.dataset.wellId === selectedWellId,
    );
  }
}

function addWellPicker(wells) {
  wellPickerEl.replaceChildren();
  for (const well of wells) {
    const presentation = wellPresentation[well.id] || {
      name: `${well.id} ${well.role}`,
      location: `${Math.round(well.x_m / 1000)} km model station`,
      active: true,
    };
    const button = document.createElement("button");
    button.type = "button";
    button.className = "well-selector";
    button.dataset.wellId = well.id;
    button.classList.toggle("is-monitoring", well.role === "Monitoring");
    const isInactive = presentation.active === false;
    button.classList.toggle("is-alert", isInactive);
    button.disabled = isInactive;
    button.setAttribute(
      "aria-label",
      isInactive
        ? `${presentation.name} is inactive and unavailable`
        : `Open ${presentation.name} 2D section`,
    );
    button.title = isInactive
      ? "This well is currently inactive and cannot be opened."
      : "";
    button.innerHTML = `
      <span class="well-selector-label">
        <span class="well-selector-icon">${wellIconMarkup(well.role)}</span>
        <span>${presentation.name}</span>
      </span>
      <span class="well-selector-location">${presentation.location}</span>
      ${isInactive ? '<span class="well-selector-unavailable">Inactive · Unavailable</span>' : ""}`;
    if (!isInactive) {
      button.addEventListener("click", () => transitionToWell(well));
    }
    wellPickerEl.appendChild(button);
  }
  const activeCount = wells.filter(
    (well) => wellPresentation[well.id]?.active !== false,
  ).length;
  activeWellCountEl.textContent = `${activeCount}/${wells.length}`;
}

async function loadScene() {
  try {
    const data = await fetchFirstJson([
      "/api/simulation/demo-scene",
      "http://localhost:8000/simulation/demo-scene",
      `/generated/demo_groundwater_scene.json?v=${Date.now()}`,
    ]);
    sceneData = data;
    try {
      modflowTopViewData = await fetchFirstJson([
        "/api/simulation/top-view/base",
        "http://localhost:8000/simulation/top-view/base",
        `/generated/modflow_topview.json?v=${Date.now()}`,
      ]);
    } catch (topViewError) {
      console.warn(
        "MODFLOW plan-view data could not be loaded",
        topViewError,
      );
    }
    domain.lx_m = data.domain.lx_m;
    domain.ly_m = data.domain.ly_m;

    updateOrthoCamera();
    frameGroup.add(
      makeSurface(data.terrain, { opacity: 1, terrainColors: true }),
    );
    if (data.base) {
      frameGroup.add(
        makeSurface(data.base, {
          opacity: 1,
          solid: true,
          unlit: true,
          renderOrder: 1,
        }),
      );
    }
    if (!data.cutawayFaces?.length) {
      frameGroup.add(
        addEdges(
          makeSurface(data.bedrock, { opacity: 0.94 }),
          0x0b1f3a,
          0.56,
        ),
      );
    }

    if (data.cutawayFaces?.length) {
      for (const face of data.cutawayFaces) {
        const layerMatch = face.name.match(/^Layer\s+(\d+)/);
        const layer = layerMatch
          ? data.layers[Number(layerMatch[1]) - 1]
          : null;
        const waterColor =
          layer && isAquiferType(layer.type)
            ? aquiferColor(layer.type)
            : null;
        headsGroup.add(
          makeSurface(face, {
            opacity: 1,
            solid: true,
            renderOrder: 5,
            waterColor,
          }),
        );
      }
    } else {
      for (let i = 0; i < data.layers.length - 1; i += 1) {
        const layer = data.layers[i];
        const nextLayer = data.layers[i + 1];
        headsGroup.add(
          makeLayerSides(
            layer.topSurface,
            nextLayer.topSurface,
            getLayerFill(layer),
          ),
        );
      }

      const deepestLayer = data.layers[data.layers.length - 1];
      headsGroup.add(
        makeLayerSides(
          deepestLayer.topSurface,
          data.bedrock,
          getLayerFill(deepestLayer),
        ),
      );
    }

    for (const flow of data.flowArrows) {
      if (arrowsGroup.children.length % 2 === 0) {
        arrowsGroup.add(makeFlowArrow(flow));
      }
    }
    arrowsGroup.add(makeFlowTraces());

    for (const well of data.wells) {
      wellsGroup.add(makeWell(well));
    }

    addLegend(data.legend.layerColors);
    addWellPicker(data.wells);
    statusEl.textContent = `${data.layers.length} layers, ${data.flowArrows.length} arrows, ${data.wells.length} wells loaded.`;
    resetCamera();
  } catch (error) {
    statusEl.className = "status error";
    statusEl.textContent =
      "Could not load JSON. Start the viewer with: python3 -m http.server 8765 -d backend";
    console.error(error);
  }
}

document
  .querySelector("#hide-section-panel")
  .addEventListener("click", () => {
    setPanelHidden(true);
  });
hidePanelButton.addEventListener("click", () => {
  setPanelHidden(true);
});
showPanelButton.addEventListener("click", () => {
  setPanelHidden(false);
});
menuPanelEl.addEventListener(
  "wheel",
  (event) => {
    if (menuPanelEl.classList.contains("is-hidden")) return;
    const scrollTarget = getScrollableMenuTarget(event.target, event.deltaY);
    if (!canScrollElement(scrollTarget, event.deltaY)) return;

    event.preventDefault();
    event.stopPropagation();
    scrollTarget.scrollTop += event.deltaY;
  },
  { passive: false },
);
document
  .querySelector("#section-exit")
  .addEventListener("click", closeSectionView);
topViewBackButton.addEventListener("click", closeTopView);
scenarioCancelButton.addEventListener("click", closeTopViewSetup);
scenarioRunButton.addEventListener("click", runScenarioAndOpenTopView);
for (const button of scenarioDirectionButtons) {
  button.addEventListener("click", () => {
    scenarioDirection = button.dataset.direction;
    updateScenarioDirectionButtons();
  });
}
for (const radio of scenarioRechargeZoneRadios) {
  radio.addEventListener("change", () => {
    if (!radio.checked) return;
    scenarioInputs.rechargeZone.value = radio.value;
    syncAquiferSetupChoiceCards();
    drawSectionView();
  });
}
for (const radio of scenarioLeakageDirectionRadios) {
  radio.addEventListener("change", () => {
    if (!radio.checked) return;
    scenarioInputs.leakageDirection.value = radio.value;
    scenarioInputs.streamLeakage.value = formatStreamLeakage(
      signedStreamLeakageFromControls(),
    );
    syncAquiferSetupChoiceCards();
    drawSectionView();
  });
}
for (const input of [
  scenarioInputs.rows,
  scenarioInputs.columns,
  scenarioInputs.gridSize,
]) {
  input.addEventListener("input", updateAquiferSetupReadouts);
  input.addEventListener("change", () => {
    validateScenarioGridInputs({ writeValues: true });
    updateAquiferSetupReadouts();
  });
}
scenarioInputs.groundwaterElevation.addEventListener(
  "input",
  () => updateAquiferSetupReadouts({ syncStreamLeakageFromElevations: true }),
);
scenarioInputs.riverElevation.addEventListener(
  "input",
  () => updateAquiferSetupReadouts({ syncStreamLeakageFromElevations: true }),
);
scenarioInputs.streamLeakage.addEventListener("input", () => {
  const leakage = Number(scenarioInputs.streamLeakage.value);
  if (!Number.isFinite(leakage)) return;
  scenarioInputs.leakageDirection.value = leakage < 0 ? "negative" : "positive";
  for (const radio of scenarioLeakageDirectionRadios) {
    radio.checked = radio.value === scenarioInputs.leakageDirection.value;
  }
  syncAquiferSetupChoiceCards();
  drawSectionView();
});
scenarioInputs.streamLeakage.addEventListener("change", () => {
  scenarioInputs.streamLeakage.value = formatStreamLeakage(
    signedStreamLeakageFromControls(),
  );
  updateAquiferSetupReadouts();
});
scenarioInputs.rechargeRate.addEventListener(
  "input",
  () => {
    updateAquiferSetupReadouts();
    drawSectionView();
  },
);
scenarioInputs.rechargeEnabled.addEventListener("change", () => {
  updateAquiferSetupReadouts();
  drawSectionView();
});
document
  .querySelector("#sensor-specs-close")
  .addEventListener("click", hideSensorSpecs);
sensorSpecsSelectEl.addEventListener("change", () => {
  showSensorSpecs(Number(sensorSpecsSelectEl.value));
});
document
  .querySelector("#section-zoom-out")
  .addEventListener("click", () => {
    if (topViewMode) {
      zoomTopViewAt(
        topViewZoom - 0.14,
        lastSectionCursor.x,
        lastSectionCursor.y,
      );
    } else {
      zoomSectionAt(
        sectionZoom - 0.12,
        lastSectionCursor.x,
        lastSectionCursor.y,
      );
    }
  });
document
  .querySelector("#section-zoom-in")
  .addEventListener("click", () => {
    if (topViewMode) {
      zoomTopViewAt(
        topViewZoom + 0.14,
        lastSectionCursor.x,
        lastSectionCursor.y,
      );
    } else {
      zoomSectionAt(
        sectionZoom + 0.12,
        lastSectionCursor.x,
        lastSectionCursor.y,
      );
    }
  });
sectionDischargeInput.addEventListener("input", () => {
  sectionDischarge = Number(sectionDischargeInput.value);
  updateDischargeLabel();
  if (topViewMode) {
    animateTopViewDischarge(sectionDischarge);
  } else {
    drawSectionView();
  }
  if (sensorSpecsVisible) {
    showSensorSpecs();
  }
});
soilTypeSelect.addEventListener("change", () => {
  selectedSoilType = soilTypeSelect.value;
  soilTypeByLevel.set(activeSoilLevel, selectedSoilType);
  resetHydraulicPropertiesForLevel(activeSoilLevel, selectedSoilType);
  updateSoilControl();
  updateDischargeLabel();
  drawSectionView();
  if (sensorSpecsVisible) {
    showSensorSpecs();
  }
});
soilHorizontalKInput.addEventListener("input", () => {
  applyHydraulicInputsToActiveLevel({ classify: true });
});
soilVerticalKInput.addEventListener("input", () => {
  applyHydraulicInputsToActiveLevel();
});
soilSpecificYieldInput.addEventListener("input", () => {
  applyHydraulicInputsToActiveLevel();
});
soilHorizontalKInput.addEventListener("change", normalizeHydraulicInputs);
soilVerticalKInput.addEventListener("change", normalizeHydraulicInputs);
soilSpecificYieldInput.addEventListener("change", normalizeHydraulicInputs);
soilSelectButtonEl.addEventListener("click", () => {
  setSoilMenuOpen(soilSelectMenuEl.hidden);
});
for (const option of soilSelectMenuEl.querySelectorAll(
  "[data-soil-option]",
)) {
  option.addEventListener("click", () => {
    soilTypeSelect.value = option.dataset.soilOption;
    soilTypeSelect.dispatchEvent(new Event("change"));
    setSoilMenuOpen(false);
  });
}
document.addEventListener("pointerdown", (event) => {
  if (!soilDropdownEl.contains(event.target)) {
    setSoilMenuOpen(false);
  }
});
updateSoilControl();

sectionCanvas.addEventListener("pointerdown", (event) => {
  if (!sectionMode) {
    return;
  }
  const rect = sectionCanvas.getBoundingClientRect();
  lastSectionCursor = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
  const sensorHit = sensorHitBoxes.find(
    (box) =>
      lastSectionCursor.x >= box.x &&
      lastSectionCursor.x <= box.x + box.width &&
      lastSectionCursor.y >= box.y &&
      lastSectionCursor.y <= box.y + box.height,
  );
  if (sensorHit) {
    showSensorSpecs(sensorHit.index);
    return;
  }
  if (topViewSetupMode) {
    return;
  }
  if (!topViewMode) {
    const aquiferHit = aquiferHitRegions.find((region) =>
      pointInPolygon(lastSectionCursor, region.polygon),
    );
    if (aquiferHit) {
      openTopViewSetup(aquiferHit);
      return;
    }
  }
  isSectionDragging = true;
  lastSectionPointer = { x: event.clientX, y: event.clientY };
  sectionCanvas.setPointerCapture(event.pointerId);
});

sectionCanvas.addEventListener("pointermove", (event) => {
  const rect = sectionCanvas.getBoundingClientRect();
  lastSectionCursor = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
  const sensorHit = sensorHitBoxes.find(
    (box) =>
      lastSectionCursor.x >= box.x &&
      lastSectionCursor.x <= box.x + box.width &&
      lastSectionCursor.y >= box.y &&
      lastSectionCursor.y <= box.y + box.height,
  );
  const aquiferHit = topViewMode
    || topViewSetupMode
    ? null
    : aquiferHitRegions.find((region) =>
        pointInPolygon(lastSectionCursor, region.polygon),
      );
  const nextHoveredLevel = aquiferHit?.level || null;
  if (!isSectionDragging && hoveredAquiferLevel !== nextHoveredLevel) {
    hoveredAquiferLevel = nextHoveredLevel;
    drawSectionView();
  }
  sectionCanvas.style.cursor =
    topViewSetupMode
      ? "default"
      : sensorHit || aquiferHit
      ? "pointer"
      : isSectionDragging
        ? "grabbing"
        : "grab";
  if (!isSectionDragging) {
    return;
  }
  if (topViewSetupMode) {
    return;
  }
  if (topViewMode) {
    topViewPanX += event.clientX - lastSectionPointer.x;
    topViewPanY += event.clientY - lastSectionPointer.y;
  } else {
    sectionPanX += event.clientX - lastSectionPointer.x;
    sectionPanY += event.clientY - lastSectionPointer.y;
  }
  lastSectionPointer = { x: event.clientX, y: event.clientY };
  drawSectionView();
});

sectionCanvas.addEventListener("pointerup", (event) => {
  isSectionDragging = false;
  if (sectionCanvas.hasPointerCapture(event.pointerId)) {
    sectionCanvas.releasePointerCapture(event.pointerId);
  }
});

sectionCanvas.addEventListener("pointercancel", () => {
  isSectionDragging = false;
});

sectionCanvas.addEventListener(
  "wheel",
  (event) => {
    event.preventDefault();
    const rect = sectionCanvas.getBoundingClientRect();
    lastSectionCursor = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    if (topViewMode) {
      zoomTopViewAt(
        topViewZoom + (event.deltaY < 0 ? 0.12 : -0.12),
        lastSectionCursor.x,
        lastSectionCursor.y,
      );
    } else if (topViewSetupMode) {
      return;
    } else {
      zoomSectionAt(
        sectionZoom + (event.deltaY < 0 ? 0.1 : -0.1),
        lastSectionCursor.x,
        lastSectionCursor.y,
      );
    }
  },
  { passive: false },
);

renderer.domElement.addEventListener("pointerdown", (event) => {
  if (sectionMode) {
    return;
  }
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, activeCamera);
  const hits = raycaster.intersectObjects(wellsGroup.children, true);
  const selectedWell = hits
    .map((hit) => findWellObject(hit.object))
    .find(Boolean);
  if (selectedWell) {
    transitionToWell(selectedWell);
  }
});

window.addEventListener("resize", () => {
  perspectiveCamera.aspect = window.innerWidth / window.innerHeight;
  perspectiveCamera.updateProjectionMatrix();
  updateOrthoCamera();
  renderer.setSize(window.innerWidth, window.innerHeight);
  if (sectionMode) {
    drawSectionView();
  }
});

function animate() {
  updateCameraTween();
  controls.update();
  renderer.render(scene, activeCamera);
  requestAnimationFrame(animate);
}

loadScene();
animate();
