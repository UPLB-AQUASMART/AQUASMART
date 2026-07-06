import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

import { ScrollToTopButton } from "@/app/components/ScrollToTopButton";
import { SmoothScrollProvider } from "@/app/components/SmoothScrollProvider";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

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
        <Script id="reset-scroll-position" strategy="beforeInteractive">
          {`if ("scrollRestoration" in history) history.scrollRestoration = "manual";
window.scrollTo(0, 0);
window.addEventListener("DOMContentLoaded", function () { window.scrollTo(0, 0); }, { once: true });`}
        </Script>
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
        <ScrollToTopButton />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
