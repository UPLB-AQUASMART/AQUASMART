"use client";
import { SiteFooter } from "@/app/components/home/SiteFooter";
import {
  ChartNoAxesCombined,
  ChevronDown,
  Droplet,
  Eye,
  Image as ImageIcon,
  LogOut,
  Map as MapIcon,
  Pencil,
  Plus,
  RefreshCw,
  Shuffle,
  Trash2,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import "leaflet/dist/leaflet.css";
import { SiteNav } from "@/app/components/home/SiteNav";
import { GroundwaterDashboard } from "./components/GroundwaterDashboard";
import styles from "./page.module.css";
import type { ReadingKey, Readings, Well } from "./types";

const safeYield = 1000;
const maxWells = 7;
const parameterOptions = [
  "pH Level",
  "Temperature",
  "Salinity",
  "Electrical Conductivity (EC)",
  "Total Dissolved Solids (TDS)",
  "Dissolved Oxygen (DO)",
  "Groundwater Level",
  "Soil Moisture",
] as const;

type ParameterOption = (typeof parameterOptions)[number];

type ParameterValues = Record<ParameterOption, number>;

type KnownMapPoint = {
  id: string;
  label: string;
  position: [number, number];
  values: ParameterValues;
};

const parameterUnits: Record<ParameterOption, string> = {
  "pH Level": "pH",
  Temperature: "°C",
  Salinity: "ppt",
  "Electrical Conductivity (EC)": "µS/cm",
  "Total Dissolved Solids (TDS)": "mg/L",
  "Dissolved Oxygen (DO)": "mg/L",
  "Groundwater Level": "m",
  "Soil Moisture": "%",
};

const knownMapPoints: KnownMapPoint[] = [
  {
    id: "north-field",
    label: "North Field",
    position: [14.1744, 121.243],
    values: {
      "pH Level": 7.4,
      Temperature: 27.1,
      Salinity: 0.48,
      "Electrical Conductivity (EC)": 785,
      "Total Dissolved Solids (TDS)": 512,
      "Dissolved Oxygen (DO)": 7.5,
      "Groundwater Level": 12.8,
      "Soil Moisture": 35,
    },
  },
  {
    id: "east-canal",
    label: "East Canal",
    position: [14.1667, 121.2522],
    values: {
      "pH Level": 7.2,
      Temperature: 28.4,
      Salinity: 0.56,
      "Electrical Conductivity (EC)": 860,
      "Total Dissolved Solids (TDS)": 568,
      "Dissolved Oxygen (DO)": 7.1,
      "Groundwater Level": 11.9,
      "Soil Moisture": 31,
    },
  },
  {
    id: "south-aquifer",
    label: "South Aquifer",
    position: [14.1578, 121.2438],
    values: {
      "pH Level": 7.6,
      Temperature: 26.8,
      Salinity: 0.42,
      "Electrical Conductivity (EC)": 720,
      "Total Dissolved Solids (TDS)": 486,
      "Dissolved Oxygen (DO)": 7.8,
      "Groundwater Level": 13.4,
      "Soil Moisture": 40,
    },
  },
  {
    id: "west-ridge",
    label: "West Ridge",
    position: [14.1653, 121.2336],
    values: {
      "pH Level": 7.0,
      Temperature: 29.0,
      Salinity: 0.62,
      "Electrical Conductivity (EC)": 930,
      "Total Dissolved Solids (TDS)": 620,
      "Dissolved Oxygen (DO)": 6.9,
      "Groundwater Level": 10.8,
      "Soil Moisture": 28,
    },
  },
];

const mapCenter: [number, number] = [14.166, 121.243];
const mapBounds: [[number, number], [number, number]] = [
  [14.142, 121.214],
  [14.189, 121.272],
];
const randomizedPointQuadrants = [
  { lat: 1, lng: -1 },
  { lat: 1, lng: 1 },
  { lat: -1, lng: 1 },
  { lat: -1, lng: -1 },
];

function formatParameterValue(parameter: ParameterOption, value: number) {
  const unit = parameterUnits[parameter];
  const decimals =
    parameter === "Electrical Conductivity (EC)" ||
    parameter === "Total Dissolved Solids (TDS)" ||
    parameter === "Soil Moisture"
      ? 0
      : 1;
  return `${value.toFixed(decimals)} ${unit}`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function randomizeKnownPointLocations(
  points: KnownMapPoint[],
): KnownMapPoint[] {
  return points.map((point, index) => {
    const quadrant =
      randomizedPointQuadrants[index % randomizedPointQuadrants.length];
    const latOffset = (0.0048 + Math.random() * 0.0054) * quadrant.lat;
    const lngOffset = (0.0048 + Math.random() * 0.0064) * quadrant.lng;

    return {
      ...point,
      position: [
        Number((mapCenter[0] + latOffset).toFixed(6)),
        Number((mapCenter[1] + lngOffset).toFixed(6)),
      ],
    };
  });
}

function makeReadings(id: number, discharge: number): Readings {
  const pressure = discharge / 500;
  return {
    dissolvedOxygen: Number((8.1 - pressure * 1.25 - id * 0.06).toFixed(1)),
    ph: Number((7.62 - pressure * 0.42 + id * 0.03).toFixed(1)),
    temperature: Number((26.4 + pressure * 1.15 + id * 0.12).toFixed(1)),
    salinity: Number((0.42 + pressure * 0.92 + id * 0.04).toFixed(1)),
    tds: Math.round(430 + discharge * 1.32 + id * 18),
    electricalConductivity: Math.round(640 + discharge * 1.85 + id * 24),
    groundwaterLevel: Number((14.2 - pressure * 2.55 - id * 0.18).toFixed(1)),
  };
}

function initialWell(): Well {
  return {
    id: 1,
    name: "Option 1",
    discharge: 138,
    x: 51,
    y: 53,
    readings: makeReadings(1, 138),
  };
}

function normalizePdfText(value: string) {
  return value
    .replace(/m³/g, "m3")
    .replace(/°/g, "deg")
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function decodePdfText(value: string) {
  return value
    .replace(/\\\(/g, "(")
    .replace(/\\\)/g, ")")
    .replace(/\\\\/g, "\\")
    .trim();
}

function extractPdfCells(pdfText: string) {
  return Array.from(
    pdfText.matchAll(/\(([^()]*(?:\\.[^()]*)*)\)\s*Tj/g),
    (match) => decodePdfText(match[1]),
  );
}

export default function GroundwaterSimulationPage() {
  const [simulationOpen, setSimulationOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [parameterMenuOpen, setParameterMenuOpen] = useState(false);
  const [selectedParameter, setSelectedParameter] =
    useState<ParameterOption>("Soil Moisture");
  const [knownPoints, setKnownPoints] =
    useState<KnownMapPoint[]>(knownMapPoints);
  const [wells, setWells] = useState<Well[]>([initialWell()]);
  const [selectedWellId, setSelectedWellId] = useState<number | null>(null);
  const [importMessage, setImportMessage] = useState("");
  const [draggingWellId, setDraggingWellId] = useState<number | null>(null);
  const leafletContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<import("leaflet").Map | null>(null);
  const knownPointLayerRef = useRef<import("leaflet").LayerGroup | null>(null);
  const projectedLayerRef = useRef<import("leaflet").LayerGroup | null>(null);
  const selectedParameterRef = useRef<ParameterOption>("Soil Moisture");
  const knownPointsRef = useRef<KnownMapPoint[]>(knownMapPoints);
  const dragMoved = useRef(false);
  const scenarioCardRef = useRef<HTMLElement | null>(null);

  const selectedWell = wells.find((well) => well.id === selectedWellId) ?? null;
  const totalDischarge = useMemo(
    () => wells.reduce((sum, well) => sum + well.discharge, 0),
    [wells],
  );
  const scenario = useMemo(() => {
    const drawdowns = wells.map(
      (well) => 0.82 + well.discharge / 145 + well.id * 0.04,
    );
    const averageDrawdown =
      drawdowns.reduce((sum, value) => sum + value, 0) /
      Math.max(wells.length, 1);
    const capacityUtilization = Math.min(
      100,
      (totalDischarge / safeYield) * 100,
    );
    const criticalWells = wells.filter(
      (well, index) => well.discharge >= 430 || drawdowns[index] >= 3.8,
    ).length;
    const sustainability =
      criticalWells > 0 || capacityUtilization >= 85
        ? "Critical"
        : capacityUtilization >= 65
          ? "Watch"
          : "Sustainable";
    return {
      averageDrawdown,
      capacityUtilization,
      criticalWells,
      sustainability,
      recoveryTime: Math.round(
        36 +
          averageDrawdown * 22 +
          capacityUtilization * 0.28 +
          criticalWells * 18,
      ),
    };
  }, [totalDischarge, wells]);

  useEffect(() => {
    selectedParameterRef.current = selectedParameter;
  }, [selectedParameter]);

  useEffect(() => {
    knownPointsRef.current = knownPoints;
  }, [knownPoints]);

  useEffect(() => {
    if (!simulationOpen || !mapOpen || !leafletContainerRef.current) return;

    let cancelled = false;

    async function mountLeafletMap() {
      const L = await import("leaflet");
      if (cancelled || !leafletContainerRef.current || leafletMapRef.current) {
        return;
      }
      const bounds = L.latLngBounds(mapBounds);

      const map = L.map(leafletContainerRef.current, {
        center: mapCenter,
        zoom: 14,
        minZoom: 13,
        maxZoom: 19,
        maxBounds: bounds,
        maxBoundsViscosity: 1,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: true,
        zoomAnimation: true,
        fadeAnimation: true,
        markerZoomAnimation: true,
      });
      map.fitBounds(bounds, { animate: false });

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        },
      ).addTo(map);

      L.control
        .zoom({
          position: "topright",
        })
        .addTo(map);

      L.control
        .attribution({
          position: "bottomleft",
          prefix: false,
        })
        .addAttribution(
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        )
        .addTo(map);

      const wellIcon = L.divIcon({
        className: styles.leafletWellPin,
        html: "<span><i></i></span>",
        iconSize: [42, 42],
        iconAnchor: [21, 42],
        popupAnchor: [0, -38],
      });

      L.marker(mapCenter, {
        icon: wellIcon,
        title: "AQUASMART groundwater well",
      }).addTo(map);

      L.circle(mapCenter, {
        radius: 420,
        color: "#0891b2",
        weight: 2,
        fillColor: "#67e8f9",
        fillOpacity: 0.14,
      }).addTo(map);

      const projectionGroup = L.layerGroup().addTo(map);
      projectedLayerRef.current = projectionGroup;

      map.on("click", (event) => {
        const parameter = selectedParameterRef.current;
        const points = knownPointsRef.current;
        const exactPoint = points.find(
          (point) => map.distance(event.latlng, point.position) < 22,
        );
        if (exactPoint) return;

        const weighted = points.map((point) => {
          const distance = Math.max(
            map.distance(event.latlng, point.position),
            1,
          );
          const weight = 1 / distance ** 2;
          return {
            point,
            distance,
            weight,
          };
        });
        const weightTotal = weighted.reduce(
          (sum, item) => sum + item.weight,
          0,
        );
        const estimate =
          weighted.reduce(
            (sum, item) => sum + item.point.values[parameter] * item.weight,
            0,
          ) / weightTotal;
        const nearest = [...weighted].sort(
          (a, b) => a.distance - b.distance,
        )[0];

        projectionGroup.clearLayers();
        L.circleMarker(event.latlng, {
          radius: 8,
          color: "#0b1f3a",
          weight: 2,
          fillColor: "#1fa3c9",
          fillOpacity: 0.9,
        }).addTo(projectionGroup);

        L.popup({
          className: styles.idwPopup,
          closeButton: true,
          autoPanPadding: [24, 24],
        })
          .setLatLng(event.latlng)
          .setContent(
            `<div class="${styles.idwPopupBody}">
              <strong>Projected ${escapeHtml(parameter)}</strong>
              <span>${formatParameterValue(parameter, estimate)}</span>
              <small>IDW estimate from 4 known monitoring points. Nearest: ${escapeHtml(nearest.point.label)} (${Math.round(nearest.distance)} m)</small>
            </div>`,
          )
          .openOn(map);
      });

      leafletMapRef.current = map;
      window.setTimeout(() => map.invalidateSize(), 80);
    }

    mountLeafletMap();

    return () => {
      cancelled = true;
    };
  }, [mapOpen, simulationOpen]);

  useEffect(() => {
    if (!mapOpen || !leafletMapRef.current) return;

    let cancelled = false;

    async function refreshKnownPoints() {
      const map = leafletMapRef.current;
      if (!map) return;
      const L = await import("leaflet");
      if (cancelled) return;

      projectedLayerRef.current?.clearLayers();
      map.closePopup();
      knownPointLayerRef.current?.remove();
      const group = L.layerGroup();

      knownPoints.forEach((point) => {
        const value = point.values[selectedParameter];
        const marker = L.marker(point.position, {
          icon: L.divIcon({
            className: styles.knownPointMarker,
            html: `<span>${point.label.charAt(0)}</span>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
          }),
          title: `${point.label}: ${formatParameterValue(selectedParameter, value)}`,
        });

        marker
          .bindTooltip(
            `<strong>${escapeHtml(point.label)}</strong><span>${formatParameterValue(selectedParameter, value)}</span>`,
            {
              className: styles.knownPointLabel,
              direction: "top",
              offset: [0, -14],
              permanent: true,
              opacity: 1,
            },
          )
          .bindPopup(
            `<div class="${styles.idwPopupBody}">
              <strong>${escapeHtml(point.label)}</strong>
              <span>${escapeHtml(selectedParameter)}: ${formatParameterValue(selectedParameter, value)}</span>
              <small>Known monitoring point</small>
            </div>`,
            { className: styles.idwPopup },
          );

        marker.on("click", (event) => {
          L.DomEvent.stopPropagation(event);
        });

        marker.addTo(group);
      });

      group.addTo(map);
      knownPointLayerRef.current = group;
    }

    refreshKnownPoints();

    return () => {
      cancelled = true;
    };
  }, [knownPoints, mapOpen, selectedParameter]);

  useEffect(() => {
    if (!mapOpen) return;
    const frame = window.requestAnimationFrame(() => {
      leafletMapRef.current?.invalidateSize();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [mapOpen]);

  function addWell() {
    if (wells.length >= maxWells) return;
    const id = Math.max(0, ...wells.map((well) => well.id)) + 1;
    const discharge = id === 2 ? 407 : 100;
    const well: Well = {
      id,
      name: `Option ${id}`,
      discharge,
      x: id === 2 ? 72 : 34 + ((id * 17) % 48),
      y: id === 2 ? 36 : 31 + ((id * 13) % 36),
      readings: makeReadings(id, discharge),
    };
    setWells((current) => [...current, well]);
    setSelectedWellId(id);
  }

  function updateWell(id: number, updates: Partial<Well>) {
    setWells((current) =>
      current.map((well) => (well.id === id ? { ...well, ...updates } : well)),
    );
  }

  function updateDischarge(id: number, discharge: number) {
    setWells((current) =>
      current.map((well) =>
        well.id === id
          ? { ...well, discharge, readings: makeReadings(well.id, discharge) }
          : well,
      ),
    );
  }

  function updateReading(id: number, key: ReadingKey, value: number) {
    setWells((current) =>
      current.map((well) =>
        well.id === id
          ? { ...well, readings: { ...well.readings, [key]: value } }
          : well,
      ),
    );
  }

  function removeWell(id: number) {
    if (wells.length === 1) return;
    setWells((current) => current.filter((well) => well.id !== id));
    setSelectedWellId(null);
  }

  function resetSimulation() {
    setWells([initialWell()]);
    setSelectedWellId(null);
    setImportMessage("");
  }

  function exitSimulation() {
    setSelectedWellId(null);
    setDraggingWellId(null);
    setMapOpen(false);
    setParameterMenuOpen(false);
    setSimulationOpen(false);
  }

  function toggleMapView() {
    const next = !mapOpen;
    if (next) setSelectedWellId(null);
    else setParameterMenuOpen(false);
    setMapOpen(next);
  }

  function randomizeKnownPoints() {
    setKnownPoints((current) => randomizeKnownPointLocations(current));
  }

  function cancelWellDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDraggingWellId(null);
  }

  function startWellDrag(event: ReactPointerEvent<HTMLDivElement>, id: number) {
    if (!simulationOpen) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragMoved.current = false;
    setDraggingWellId(id);
  }

  function moveWell(event: ReactPointerEvent<HTMLDivElement>, id: number) {
    if (draggingWellId !== id) return;
    const surface = event.currentTarget.parentElement;
    if (!surface) return;
    const bounds = surface.getBoundingClientRect();
    let pointerX = event.clientX;
    let pointerY = event.clientY;
    const cardBounds = scenarioCardRef.current?.getBoundingClientRect();

    if (cardBounds) {
      const wellClearance = 74;
      const insideProtectedArea =
        pointerX >= cardBounds.left - wellClearance &&
        pointerX <= cardBounds.right + wellClearance &&
        pointerY >= cardBounds.top - wellClearance &&
        pointerY <= cardBounds.bottom + wellClearance;

      if (insideProtectedArea) {
        const distanceToTop = Math.abs(
          pointerY - (cardBounds.top - wellClearance),
        );
        const distanceToRight = Math.abs(
          pointerX - (cardBounds.right + wellClearance),
        );
        if (distanceToTop <= distanceToRight)
          pointerY = cardBounds.top - wellClearance;
        else pointerX = cardBounds.right + wellClearance;
      }
    }

    const x = Math.min(
      94,
      Math.max(6, ((pointerX - bounds.left) / bounds.width) * 100),
    );
    const y = Math.min(
      88,
      Math.max(15, ((pointerY - bounds.top) / bounds.height) * 100),
    );
    dragMoved.current = true;
    updateWell(id, { x, y });
  }

  function stopWellDrag(event: ReactPointerEvent<HTMLDivElement>, id: number) {
    if (!simulationOpen) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDraggingWellId(null);
    if (!dragMoved.current) {
      setSelectedWellId((current) => (current === id ? null : id));
    }
  }

  function downloadPdfReport() {
    const headers = [
      "Well ID",
      "Discharge",
      "DO",
      "pH",
      "Temp",
      "Salinity",
      "TDS",
      "EC",
      "GW Level",
      "Map X",
      "Map Y",
    ];
    const rows = wells.map((well) => [
      well.name,
      `${well.discharge} m3/day`,
      well.readings.dissolvedOxygen.toFixed(1),
      well.readings.ph.toFixed(1),
      well.readings.temperature.toFixed(1),
      well.readings.salinity.toFixed(1),
      Math.round(well.readings.tds).toString(),
      Math.round(well.readings.electricalConductivity).toString(),
      well.readings.groundwaterLevel.toFixed(1),
      well.x.toFixed(1),
      well.y.toFixed(1),
    ]);
    const widths = [92, 76, 44, 40, 48, 58, 54, 54, 62, 48, 48];
    const left = 32;
    const rowHeight = 22;
    const tableWidth = widths.reduce((sum, width) => sum + width, 0);
    const lines = [
      "BT /F1 21 Tf 32 552 Td (AQUASMART Mini Groundwater Simulation Report) Tj ET",
      `BT /F1 9 Tf 32 532 Td (${normalizePdfText(`Generated: ${new Date().toLocaleString()}`)}) Tj ET`,
      `BT /F1 10 Tf 32 506 Td (${normalizePdfText(`Total discharge: ${totalDischarge} m3/day | Capacity: ${scenario.capacityUtilization.toFixed(1)}% | Status: ${scenario.sustainability}`)}) Tj ET`,
      "BT /F1 12 Tf 32 474 Td (Well configuration and parameter readings) Tj ET",
    ];
    let y = 442;
    let x = left;
    lines.push(`0.8 w ${left} ${y} ${tableWidth} ${rowHeight} re S`);
    headers.forEach((header, index) => {
      lines.push(
        `BT /F1 7 Tf ${x + 4} ${y + 8} Td (${normalizePdfText(header)}) Tj ET`,
      );
      if (index > 0) lines.push(`${x} ${y} m ${x} ${y + rowHeight} l S`);
      x += widths[index];
    });
    y -= rowHeight;
    rows.forEach((row) => {
      x = left;
      lines.push(`0.4 w ${left} ${y} ${tableWidth} ${rowHeight} re S`);
      row.forEach((cell, index) => {
        lines.push(
          `BT /F1 7 Tf ${x + 4} ${y + 8} Td (${normalizePdfText(cell)}) Tj ET`,
        );
        if (index > 0) lines.push(`${x} ${y} m ${x} ${y + rowHeight} l S`);
        x += widths[index];
      });
      y -= rowHeight;
    });
    lines.push(
      "BT /F1 8 Tf 32 30 Td (Generated by AQUASMART Mini. Upload this report to restore its well configuration.) Tj ET",
    );
    const content = lines.join("\n");
    const objects = [
      "<< /Type /Catalog /Pages 2 0 R >>",
      "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
      "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 595] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
      `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    ];
    let pdf = "%PDF-1.4\n";
    const offsets = [0];
    objects.forEach((object, index) => {
      offsets.push(pdf.length);
      pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
    });
    const xref = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    offsets.slice(1).forEach((offset) => {
      pdf += `${offset.toString().padStart(10, "0")} 00000 n \n`;
    });
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
    const url = URL.createObjectURL(
      new Blob([pdf], { type: "application/pdf" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `aquasmart-wells-${new Date().toISOString().slice(0, 10)}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async function uploadPdfReport(file?: File) {
    if (!file) return;
    try {
      const cells = extractPdfCells(
        new TextDecoder("latin1").decode(await file.arrayBuffer()),
      );
      const start = cells.findIndex(
        (cell, index) =>
          cell === "Well ID" &&
          cells[index + 1] === "Discharge" &&
          cells[index + 2] === "DO",
      );
      if (start < 0) throw new Error("Invalid report");
      const values = cells.slice(start + 11, -1);
      const imported: Well[] = [];
      for (let index = 0; index + 10 < values.length; index += 11) {
        if (imported.length >= maxWells) break;
        const row = values.slice(index, index + 11);
        const discharge = Number(row[1].replace(/[^\d.-]/g, ""));
        if (!row[0] || Number.isNaN(discharge)) continue;
        const id = imported.length + 1;
        imported.push({
          id,
          name: row[0],
          discharge,
          readings: {
            dissolvedOxygen: Number(row[2]) || 0,
            ph: Number(row[3]) || 0,
            temperature: Number(row[4]) || 0,
            salinity: Number(row[5]) || 0,
            tds: Number(row[6]) || 0,
            electricalConductivity: Number(row[7]) || 0,
            groundwaterLevel: Number(row[8]) || 0,
          },
          x: Number(row[9]) || 50,
          y: Number(row[10]) || 50,
        });
      }
      if (!imported.length) throw new Error("No wells");
      setWells(imported);
      setSimulationOpen(true);
      setSelectedWellId(null);
      setImportMessage(
        `Imported ${imported.length} well${imported.length === 1 ? "" : "s"} from PDF.`,
      );
    } catch {
      setImportMessage(
        "This PDF could not be imported. Please use a report exported from this page.",
      );
    }
  }

  return (
    <main className={styles.page}>
      <div
        className={`${styles.mapStage} ${simulationOpen ? styles.simulating : ""} ${mapOpen ? styles.mapViewOpen : ""}`}
      >
        <img
          className={styles.map}
          src="/figma/groundwater-map-expanded.png"
          alt="Groundwater simulation field map"
        />
        {simulationOpen && (
          <div
            ref={leafletContainerRef}
            className={styles.leafletMap}
            aria-hidden={!mapOpen}
          />
        )}
        <SiteNav activeLabel="Simulation" />
        {simulationOpen && !mapOpen && (
          <button
            className={styles.mapToggleButton}
            type="button"
            onClick={toggleMapView}
            title="Show map view"
            aria-label="Show map view"
            aria-pressed={mapOpen}
          >
            <MapIcon size={22} strokeWidth={2.4} />
          </button>
        )}
        {simulationOpen && mapOpen && (
          <>
            <div className={styles.mapModeHeader}>
              <h1>IDW Interpolation</h1>
              <div
                className={`${styles.parameterDropdown} ${parameterMenuOpen ? styles.open : ""}`}
              >
                <button
                  className={styles.parameterPreview}
                  type="button"
                  onClick={() => setParameterMenuOpen((current) => !current)}
                  aria-haspopup="listbox"
                  aria-expanded={parameterMenuOpen}
                >
                  <span>{selectedParameter || "Choose parameter"}</span>
                  <ChevronDown size={24} strokeWidth={2} />
                </button>
                {parameterMenuOpen && (
                  <div
                    className={styles.parameterMenu}
                    role="listbox"
                    aria-label="Map parameter"
                  >
                    {parameterOptions.map((option) => (
                      <button
                        type="button"
                        role="option"
                        aria-selected={selectedParameter === option}
                        className={
                          selectedParameter === option
                            ? styles.selectedParameter
                            : ""
                        }
                        key={option}
                        onClick={() => {
                          setSelectedParameter(option);
                          setParameterMenuOpen(false);
                        }}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <button
              className={styles.mapBackButton}
              type="button"
              onClick={toggleMapView}
              title="Show field view"
              aria-label="Show field view"
            >
              <ImageIcon size={22} strokeWidth={2.4} />
            </button>
            <button
              className={styles.mapRandomizeButton}
              type="button"
              onClick={randomizeKnownPoints}
              title="Randomize monitoring points"
              aria-label="Randomize monitoring point locations"
            >
              <Shuffle size={20} strokeWidth={2.4} />
              <span>Shuffle Points</span>
            </button>
          </>
        )}
        <div className={styles.navClearance} aria-hidden="true" />

        <section className={styles.hero}>
          <div className={styles.heroContent}>
            {!simulationOpen && (
              <h1>
                IDW Interpolation & <span>Groundwater Simulation</span>
              </h1>
            )}

            {!simulationOpen ? (
              <div className={styles.heroBottom}>
                <p>
                  Simulate groundwater response across wells and field zones ,
                  proximity layers, and mock parameter readings from AQUASMART
                  Mini.
                </p>
                <button
                  className={styles.eyeButton}
                  type="button"
                  onClick={() => setSimulationOpen(true)}
                  aria-label="Open groundwater simulation"
                >
                  <Eye size={34} strokeWidth={2.3} />
                </button>
              </div>
            ) : (
              <>
                {!mapOpen && (
                  <>
                    <aside
                      ref={scenarioCardRef}
                      className={styles.scenarioCard}
                      aria-label="Current scenario statistics"
                    >
                      <div className={styles.scenarioHeader}>
                        <h2>
                          <ChartNoAxesCombined size={20} strokeWidth={2.5} />{" "}
                          Model Statistics
                        </h2>
                        <button
                          type="button"
                          onClick={resetSimulation}
                          title="Reset wells"
                          aria-label="Reset wells"
                        >
                          <RefreshCw size={16} />
                        </button>
                      </div>
                      <div className={styles.scenarioBody}>
                        <div>
                          <span>Total Pumping Discharge</span>
                          <strong>{totalDischarge} m³/day</strong>
                        </div>
                        <div>
                          <span>Safe Yield Capacity</span>
                          <strong>{safeYield} m³/day</strong>
                        </div>
                        <div>
                          <span>Capacity Utilization</span>
                          <strong>
                            {scenario.capacityUtilization.toFixed(1)}%
                          </strong>
                        </div>
                        <i className={styles.progress}>
                          <b
                            style={{
                              width: `${scenario.capacityUtilization}%`,
                            }}
                          />
                        </i>
                        <div>
                          <span>Average Drawdown</span>
                          <strong>
                            {scenario.averageDrawdown.toFixed(1)} m
                          </strong>
                        </div>
                        <div>
                          <span>Critical Wells</span>
                          <strong>{scenario.criticalWells}</strong>
                        </div>
                        <div>
                          <span>Sustainability Status</span>
                          <em data-status={scenario.sustainability}>
                            {scenario.sustainability}
                          </em>
                        </div>
                        <div>
                          <span>Est. Recovery Time</span>
                          <strong>{scenario.recoveryTime} days</strong>
                        </div>
                      </div>
                    </aside>
                    <button
                      className={styles.exitButton}
                      type="button"
                      onClick={exitSimulation}
                      title="Exit simulation"
                      aria-label="Exit simulation"
                    >
                      <LogOut size={20} />
                    </button>
                  </>
                )}
                {!mapOpen && (
                  <button
                    className={styles.addButton}
                    type="button"
                    onClick={addWell}
                    aria-label={
                      wells.length >= maxWells
                        ? "Maximum of 7 wells reached"
                        : "Add well"
                    }
                    disabled={wells.length >= maxWells}
                    title={
                      wells.length >= maxWells
                        ? "Maximum of 7 wells reached"
                        : "Add well"
                    }
                  >
                    <Plus size={35} strokeWidth={3.5} />
                  </button>
                )}
              </>
            )}

            {!mapOpen &&
              (simulationOpen ? wells : wells.slice(0, 1)).map((well) => (
                <div
                  className={`${styles.wellAnchor} ${draggingWellId === well.id ? styles.dragging : ""}`}
                  style={{ left: `${well.x}%`, top: `${well.y}%` }}
                  key={well.id}
                  onPointerDown={(event) => startWellDrag(event, well.id)}
                  onPointerMove={(event) => moveWell(event, well.id)}
                  onPointerUp={(event) => stopWellDrag(event, well.id)}
                  onPointerCancel={cancelWellDrag}
                >
                  <span className={styles.influenceOuter} aria-hidden="true" />
                  <span className={styles.influenceInner} aria-hidden="true" />
                  <button
                    className={`${styles.wellMarker} ${selectedWellId === well.id ? styles.selected : ""}`}
                    type="button"
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ")
                        setSelectedWellId((current) =>
                          current === well.id ? null : well.id,
                        );
                    }}
                    aria-label={`Configure ${well.name}`}
                  >
                    <img src="/figma/groundwater-well.png" alt="" />
                  </button>
                </div>
              ))}

            {simulationOpen && !mapOpen && selectedWell && (
              <div
                className={styles.wellPopover}
                style={{
                  left: `${Math.min(72, selectedWell.x + 7)}%`,
                  top: `${Math.max(5, selectedWell.y - 28)}%`,
                }}
              >
                <button
                  className={styles.closePopover}
                  onClick={() => setSelectedWellId(null)}
                  aria-label="Close well controls"
                >
                  <X size={15} />
                </button>
                <div className={styles.popoverTitle}>
                  <label className={styles.wellNameEditor}>
                    <Droplet size={18} />
                    <input
                      value={selectedWell.name}
                      onChange={(event) =>
                        updateWell(selectedWell.id, {
                          name: event.target.value,
                        })
                      }
                      aria-label="Well name"
                      title="Edit well name"
                      maxLength={32}
                    />
                    <Pencil size={13} aria-hidden="true" />
                  </label>
                  <strong>{selectedWell.discharge} m³/day</strong>
                </div>
                <input
                  className={styles.range}
                  type="range"
                  min="0"
                  max="500"
                  value={selectedWell.discharge}
                  onChange={(event) =>
                    updateDischarge(selectedWell.id, Number(event.target.value))
                  }
                  aria-label={`${selectedWell.name} discharge`}
                />
                <div className={styles.rangeLabels}>
                  <span>0</span>
                  <span>500</span>
                </div>
                {wells.length > 1 && (
                  <button
                    className={styles.removeButton}
                    onClick={() => removeWell(selectedWell.id)}
                  >
                    <Trash2 size={14} /> Remove well
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      <GroundwaterDashboard
        wells={wells}
        importMessage={importMessage}
        onDownloadPdf={downloadPdfReport}
        onUploadPdf={(file) => void uploadPdfReport(file)}
        onUpdateWell={updateWell}
        onUpdateDischarge={updateDischarge}
        onUpdateReading={updateReading}
      />

      <SiteFooter />
    </main>
  );
}
