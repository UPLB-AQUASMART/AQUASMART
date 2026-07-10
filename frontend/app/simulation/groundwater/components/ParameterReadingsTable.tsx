import { ChartNoAxesCombined, Download, Upload } from "lucide-react";
import type { ReadingKey, Well } from "../types";
import styles from "./ParameterReadingsTable.module.css";

type ParameterReadingsTableProps = {
  wells: Well[];
  importMessage: string;
  onDownloadPdf: () => void;
  onUploadPdf: (file?: File) => void;
  onUpdateWell: (id: number, updates: Partial<Well>) => void;
  onUpdateDischarge: (id: number, discharge: number) => void;
  onUpdateReading: (id: number, key: ReadingKey, value: number) => void;
};

export function ParameterReadingsTable({
  wells,
  importMessage,
  onDownloadPdf,
  onUploadPdf,
  onUpdateWell,
  onUpdateDischarge,
  onUpdateReading,
}: ParameterReadingsTableProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3>
          <ChartNoAxesCombined size={20} /> All Parameters - Current Readings
          (All Zones)
        </h3>
        <div className={styles.reportActions}>
          <label>
            <Upload size={16} /> Upload PDF
            <input
              type="file"
              accept="application/pdf"
              onChange={(event) => {
                onUploadPdf(event.target.files?.[0]);
                event.currentTarget.value = "";
              }}
            />
          </label>
          <button onClick={onDownloadPdf}>
            <Download size={16} /> Download PDF
          </button>
        </div>
      </div>
      {importMessage && <p className={styles.importMessage}>{importMessage}</p>}
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
                "Status",
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
                      onUpdateWell(well.id, { name: event.target.value })
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
                      onUpdateDischarge(well.id, Number(event.target.value))
                    }
                  />
                </td>
                {(
                  [
                    ["dissolvedOxygen", "0.1"],
                    ["ph", "0.1"],
                    ["temperature", "0.1"],
                    ["salinity", "0.1"],
                    ["tds", undefined],
                    ["electricalConductivity", undefined],
                    ["groundwaterLevel", "0.1"],
                  ] as [ReadingKey, string | undefined][]
                ).map(([key, step]) => (
                  <td key={key}>
                    <input
                      type="number"
                      step={step}
                      value={well.readings[key]}
                      onChange={(event) =>
                        onUpdateReading(well.id, key, Number(event.target.value))
                      }
                    />
                  </td>
                ))}
                <td>
                  <span className={styles.statusPill}>Online</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
