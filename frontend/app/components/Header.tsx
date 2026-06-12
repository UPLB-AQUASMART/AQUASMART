"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function Logo() {
  return (
    <Link className="brand" href="/simulation" aria-label="AQUASMART Mini">
      <img src="/logo_2.png" alt="AQUASMART Mini" />
    </Link>
  );
}

export function Header() {
  const pathname = usePathname();
  const activePage = pathname.startsWith("/forecast") ? "forecast" : "simulation";

  return (
    <header className="site-header">
      <Logo />
      <nav aria-label="Primary navigation">
        <Link href="/simulation">Home</Link>
        <Link href="/simulation">About</Link>
        <Link className={activePage === "simulation" ? "active" : ""} href="/simulation">Simulation</Link>
        <Link className={activePage === "forecast" ? "active" : ""} href="/forecast">Weather Forecast</Link>
        <Link href="/simulation">Team</Link>
        <Link href="/simulation">Contact</Link>
      </nav>
    </header>
  );
}
