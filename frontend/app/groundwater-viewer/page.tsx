import { GroundwaterViewerShell } from "./components/GroundwaterViewerShell";
import "./groundwater-viewer.css";

export const metadata = {
  title: "AQUASMART Groundwater 3D Viewer",
};

export default function GroundwaterViewerPage() {
  return <GroundwaterViewerShell />;
}
