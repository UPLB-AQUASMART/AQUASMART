import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AQUASMART Mini",
  description: "Groundwater simulation and weather forecasting for farmers",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
