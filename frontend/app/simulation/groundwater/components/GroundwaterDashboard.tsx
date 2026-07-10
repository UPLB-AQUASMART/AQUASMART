import type { ReadingKey, Well } from "../types";
import { ChartAnalytics } from "./ChartAnalytics";
import { DashboardIntro } from "./DashboardIntro";
import { HistorySection } from "./HistorySection";
import { IdwInfoSection } from "./IdwInfoSection";
import { ParameterReadingsTable } from "./ParameterReadingsTable";
import styles from "./GroundwaterDashboard.module.css";

type GroundwaterDashboardProps = {
  wells: Well[];
  importMessage: string;
  onDownloadPdf: () => void;
  onUploadPdf: (file?: File) => void;
  onUpdateWell: (id: number, updates: Partial<Well>) => void;
  onUpdateDischarge: (id: number, discharge: number) => void;
  onUpdateReading: (id: number, key: ReadingKey, value: number) => void;
};

export function GroundwaterDashboard({
  wells,
  importMessage,
  onDownloadPdf,
  onUploadPdf,
  onUpdateWell,
  onUpdateDischarge,
  onUpdateReading,
}: GroundwaterDashboardProps) {
  return (
    <section className={styles.readings} aria-labelledby="readings-title">
      <DashboardIntro />
      <ParameterReadingsTable
        wells={wells}
        importMessage={importMessage}
        onDownloadPdf={onDownloadPdf}
        onUploadPdf={onUploadPdf}
        onUpdateWell={onUpdateWell}
        onUpdateDischarge={onUpdateDischarge}
        onUpdateReading={onUpdateReading}
      />
      <ChartAnalytics wells={wells} />
      <IdwInfoSection />
      <HistorySection wells={wells} />
    </section>
  );
}
