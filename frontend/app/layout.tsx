import type { Metadata } from "next";
import "./globals.css";

import { ScrollToTopButton } from "@/app/components/ScrollToTopButton";

export const metadata: Metadata = {
  title: "AQUASMART Mini",
  description: "Groundwater simulation and weather forecasting for farmers",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <ScrollToTopButton />
      </body>
    </html>
  );
}
