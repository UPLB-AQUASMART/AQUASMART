"use client";
import { SiteFooter } from "@/app/components/home/SiteFooter";
import {
  ChartNoAxesCombined,
  ChevronDown,
  Download,
  Droplet,
  Eye,
  Image as ImageIcon,
  LogOut,
  Map as MapIcon,
  Pencil,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  Thermometer,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import "leaflet/dist/leaflet.css";
import { Doughnut, Line } from "react-chartjs-2";
import { SiteNav } from "@/app/components/home/SiteNav";
import styles from "./page.module.css";

type ReadingKey =
  | "dissolvedOxygen"
  | "ph"
  | "temperature"
  | "salinity"
  | "tds"
  | "electricalConductivity"
  | "groundwaterLevel";

type Readings = Record<ReadingKey, number>;

type Well = {
  id: number;
  name: string;
  discharge: number;
  x: number;
  y: number;
  readings: Readings;
};

ChartJS.register(
  ArcElement,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
);

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
  const [wells, setWells] = useState<Well[]>([initialWell()]);
  const [selectedWellId, setSelectedWellId] = useState<number | null>(null);
  const [importMessage, setImportMessage] = useState("");
  const [draggingWellId, setDraggingWellId] = useState<number | null>(null);
  const leafletContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<import("leaflet").Map | null>(null);
  const knownPointLayerRef = useRef<import("leaflet").LayerGroup | null>(null);
  const projectedLayerRef = useRef<import("leaflet").LayerGroup | null>(null);
  const selectedParameterRef = useRef<ParameterOption>("Soil Moisture");
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

  const averages = useMemo(() => {
    const average = (key: ReadingKey) =>
      wells.reduce((sum, well) => sum + well.readings[key], 0) /
      Math.max(wells.length, 1);
    return {
      dissolvedOxygen: average("dissolvedOxygen"),
      ph: average("ph"),
      temperature: average("temperature"),
      salinity: average("salinity"),
      tds: average("tds"),
      electricalConductivity: average("electricalConductivity"),
      groundwaterLevel: average("groundwaterLevel"),
    };
  }, [wells]);

  const donutData = useMemo(
    () => ({
      labels: ["DO", "pH", "Temperature", "Salinity", "TDS", "EC", "GW Level"],
      datasets: [
        {
          data: [
            averages.dissolvedOxygen,
            averages.ph,
            averages.temperature,
            averages.salinity * 10,
            averages.tds / 100,
            averages.electricalConductivity / 100,
            averages.groundwaterLevel,
          ],
          backgroundColor: [
            "#0b1f3a",
            "#46c5df",
            "#4dbb5d",
            "#ee9b22",
            "#638de3",
            "#2f8f63",
            "#09a9d5",
          ],
          borderColor: "#fff",
          borderWidth: 2,
          hoverOffset: 7,
        },
      ],
    }),
    [averages],
  );

  const lineData = useMemo(
    () => ({
      labels: [
        "Nov 24",
        "Nov 25",
        "Nov 26",
        "Nov 27",
        "Nov 28",
        "Nov 29",
        "Nov 30",
        "Dec 1",
        "Dec 2",
        "Dec 3",
        "Dec 4",
        "Dec 5",
        "Dec 6",
        "Dec 7",
      ],
      datasets: [
        {
          label: "Max Temperature",
          data: [
            5.2, 6.2, 7.2, 4.2, 3.2, 5.2, 2.2, 4.2, 6.2, 1.2, 3.2, 5.2, 7.2,
            6.2,
          ].map((offset) => averages.temperature + offset),
          borderColor: "#0b2545",
          backgroundColor: "rgba(11,37,69,.12)",
          pointRadius: 3,
          tension: 0.38,
          fill: "+1",
        },
        {
          label: "Min Temperature",
          data: [
            -2.8, -1.8, -0.8, -3.8, -4.8, -2.8, -5.8, -3.8, -1.8, -6.8, -4.8,
            -2.8, -0.8, -1.8,
          ].map((offset) => averages.temperature + offset),
          borderColor: "#46c5df",
          backgroundColor: "rgba(70,197,223,.08)",
          pointRadius: 3,
          tension: 0.38,
        },
      ],
    }),
    [averages.temperature],
  );

  useEffect(() => {
    selectedParameterRef.current = selectedParameter;
  }, [selectedParameter]);

  useEffect(() => {
    if (!simulationOpen || !mapOpen || !leafletContainerRef.current) return;

    let cancelled = false;

    async function mountLeafletMap() {
      const L = await import("leaflet");
      if (cancelled || !leafletContainerRef.current || leafletMapRef.current) {
        return;
      }

      const map = L.map(leafletContainerRef.current, {
        center: [14.166, 121.243],
        zoom: 14,
        minZoom: 12,
        maxZoom: 18,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

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
        .addAttribution("&copy; OpenStreetMap contributors")
        .addTo(map);

      const wellIcon = L.divIcon({
        className: styles.leafletWellPin,
        html: "<span></span>",
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      L.marker([14.166, 121.243], {
        icon: wellIcon,
        title: "AQUASMART groundwater well",
      }).addTo(map);

      L.circle([14.166, 121.243], {
        radius: 420,
        color: "#1f9d67",
        weight: 1.5,
        fillColor: "#68b96b",
        fillOpacity: 0.18,
      }).addTo(map);

      const projectionGroup = L.layerGroup().addTo(map);
      projectedLayerRef.current = projectionGroup;

      map.on("click", (event) => {
        const parameter = selectedParameterRef.current;
        const exactPoint = knownMapPoints.find(
          (point) => map.distance(event.latlng, point.position) < 22,
        );
        if (exactPoint) return;

        const weighted = knownMapPoints.map((point) => {
          const distance = Math.max(map.distance(event.latlng, point.position), 1);
          const weight = 1 / distance ** 2;
          return {
            point,
            distance,
            weight,
          };
        });
        const weightTotal = weighted.reduce((sum, item) => sum + item.weight, 0);
        const estimate =
          weighted.reduce(
            (sum, item) => sum + item.point.values[parameter] * item.weight,
            0,
          ) / weightTotal;
        const nearest = [...weighted].sort((a, b) => a.distance - b.distance)[0];

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

      knownMapPoints.forEach((point) => {
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
  }, [mapOpen, selectedParameter]);

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
        {simulationOpen && mapOpen && (
          <>
            <div className={styles.mapModeHeader}>
              <h1>IWD Interpolation</h1>
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
          </>
        )}
        <div className={styles.navClearance} aria-hidden="true" />

        <section className={styles.hero}>
          <div className={styles.heroContent}>
            {!simulationOpen && (
              <h1>
                MODFLOW/FLOPY<span>Groundwater Simulation</span>
              </h1>
            )}

            {!simulationOpen ? (
              <div className={styles.heroBottom}>
                <p>
                  Simulate groundwater response across wells and field zones
                  using MODFLOW/FLOPY outputs, proximity layers, and live
                  parameter readings from AQUASMART mini.
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

      <section className={styles.readings} aria-labelledby="readings-title">
        <div className={styles.readingsHeader}>
          <h2 id="readings-title">
            All Parameters — Current Readings (All Zones)
          </h2>
          <div className={styles.reportActions}>
            <label>
              <Upload size={16} /> Upload PDF
              <input
                type="file"
                accept="application/pdf"
                onChange={(event) => {
                  void uploadPdfReport(event.target.files?.[0]);
                  event.currentTarget.value = "";
                }}
              />
            </label>
            <button onClick={downloadPdfReport}>
              <Download size={16} /> Download PDF
            </button>
          </div>
        </div>
        {importMessage && (
          <p className={styles.importMessage}>{importMessage}</p>
        )}
        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                {[
                  "Well ID",
                  "Discharge",
                  "DO (mg/L)",
                  "pH",
                  "Temp (°C)",
                  "Salinity (ppt)",
                  "TDS (mg/L)",
                  "EC (µS/cm)",
                  "GW Level (m)",
                ].map((label) => (
                  <th key={label}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {wells.map((well) => (
                <tr key={well.id}>
                  <td>
                    <input
                      className={styles.nameInput}
                      value={well.name}
                      onChange={(event) =>
                        updateWell(well.id, { name: event.target.value })
                      }
                      aria-label={`${well.name} name`}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      max="500"
                      value={well.discharge}
                      onChange={(event) =>
                        updateDischarge(well.id, Number(event.target.value))
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.1"
                      value={well.readings.dissolvedOxygen}
                      onChange={(event) =>
                        updateReading(
                          well.id,
                          "dissolvedOxygen",
                          Number(event.target.value),
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.1"
                      value={well.readings.ph}
                      onChange={(event) =>
                        updateReading(well.id, "ph", Number(event.target.value))
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.1"
                      value={well.readings.temperature}
                      onChange={(event) =>
                        updateReading(
                          well.id,
                          "temperature",
                          Number(event.target.value),
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.1"
                      value={well.readings.salinity}
                      onChange={(event) =>
                        updateReading(
                          well.id,
                          "salinity",
                          Number(event.target.value),
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={well.readings.tds}
                      onChange={(event) =>
                        updateReading(
                          well.id,
                          "tds",
                          Number(event.target.value),
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={well.readings.electricalConductivity}
                      onChange={(event) =>
                        updateReading(
                          well.id,
                          "electricalConductivity",
                          Number(event.target.value),
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.1"
                      value={well.readings.groundwaterLevel}
                      onChange={(event) =>
                        updateReading(
                          well.id,
                          "groundwaterLevel",
                          Number(event.target.value),
                        )
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.analytics}>
          <article className={styles.chartCard}>
            <div className={styles.chartHeading}>
              <h3>
                Average <span>Water Parameters</span>
              </h3>
              <SlidersHorizontal size={16} />
            </div>
            <div className={styles.donut}>
              <Doughnut
                data={donutData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  cutout: "62%",
                  plugins: {
                    legend: {
                      position: "bottom",
                      labels: { boxWidth: 11, color: "#0b2545", padding: 14 },
                    },
                  },
                }}
              />
            </div>
          </article>
          <article className={styles.chartCard}>
            <div className={styles.chartHeading}>
              <h3>
                <Thermometer size={19} /> Temperature Trends
              </h3>
              <SlidersHorizontal size={16} />
            </div>
            <div className={styles.line}>
              <Line
                data={lineData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  interaction: { mode: "index", intersect: false },
                  plugins: { legend: { position: "top" } },
                  scales: {
                    y: { title: { display: true, text: "Temperature (°C)" } },
                  },
                }}
              />
            </div>
          </article>
        </div>
      </section>

      <SiteFooter reveal />
    </main>
  );
}
