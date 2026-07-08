"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { navItems } from "@/app/data/home";
import styles from "./SiteNav.module.css";

const glassBlurStyle = {
  backdropFilter: "blur(25px)",
  WebkitBackdropFilter: "blur(25px)",
};

const simulationOptions = [
  { label: "Groundwater Simulation", href: "/simulation/groundwater" },
  { label: "Spatial Drawdown Map", href: "/simulation" },
];

export function SiteNav({ activeLabel = "Home" }: { activeLabel?: string }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const closeMenu = () => setIsMenuOpen(false);

  const renderSimulationDropdown = (variant: "desktop" | "mobile") => {
    const simulationItem = navItems.find((item) => item.label === "Simulation");
    if (!simulationItem) {
      return null;
    }

    const triggerClassName = [
      styles["nav-link"],
      itemIsActive("Simulation") ? styles.active : "",
      styles["simulation-trigger"],
    ]
      .filter(Boolean)
      .join(" ");

    const dropdown = (
      <div className={styles["simulation-dropdown"]}>
        <Link
          className={styles["simulation-dropdown-primary"]}
          href={isHomePage ? simulationItem.href : "/simulation"}
          onClick={closeMenu}
        >
          All Sims
        </Link>
        <span className={styles["simulation-dropdown-divider"]} aria-hidden="true" />
        <div className={styles["simulation-dropdown-options"]}>
          {simulationOptions.map((option) => (
            <Link href={option.href} key={option.label} onClick={closeMenu}>
              {option.label}
            </Link>
          ))}
        </div>
      </div>
    );

    return (
      <div
        className={`${styles["simulation-nav-item"]} ${styles[`${variant}-simulation-nav-item`]}`}
        key="Simulation"
      >
        {isHomePage ? (
          <Link className={triggerClassName} href={simulationItem.href} onClick={closeMenu}>
            {simulationItem.label}
          </Link>
        ) : (
          <button
            className={triggerClassName}
            type="button"
            aria-haspopup="true"
          >
            {simulationItem.label}
          </button>
        )}
        {dropdown}
      </div>
    );
  };

  const itemIsActive = (label: string) => label === activeLabel;

  return (
    <header
      className={`${styles["site-nav"]}${isMenuOpen ? ` ${styles["menu-open"]}` : ""}`}
      style={glassBlurStyle}
    >
      <Link className={styles["nav-logo"]} href="/#home" aria-label="AQUASMART Mini home" onClick={closeMenu}>
        <img src="/assets/logo_2.png" alt="AQUASMART Mini" />
      </Link>
      <button
        className={styles["nav-menu-toggle"]}
        type="button"
        aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-controls="home-mobile-menu"
        aria-expanded={isMenuOpen}
        onClick={() => setIsMenuOpen((open) => !open)}
      >
        <span>Menu</span>
        {isMenuOpen ? <X size={18} strokeWidth={1.8} /> : <Menu size={18} strokeWidth={1.8} />}
      </button>
      <nav className={styles["nav-links"]} aria-label="Primary navigation">
        {navItems.map((item) =>
          item.label === "Simulation" ? (
            renderSimulationDropdown("desktop")
          ) : (
            <Link
              className={`${styles["nav-link"]}${itemIsActive(item.label) ? ` ${styles.active}` : ""}`}
              href={item.href}
              key={item.label}
              onClick={closeMenu}
            >
              {item.label}
            </Link>
          ),
        )}
      </nav>
      <nav
        className={styles["mobile-nav-panel"]}
        id="home-mobile-menu"
        aria-label="Mobile navigation"
        style={glassBlurStyle}
      >
        {navItems.map((item) =>
          item.label === "Simulation" ? (
            renderSimulationDropdown("mobile")
          ) : (
            <Link
              className={`${styles["nav-link"]}${itemIsActive(item.label) ? ` ${styles.active}` : ""}`}
              href={item.href}
              key={item.label}
              onClick={closeMenu}
            >
              {item.label}
            </Link>
          ),
        )}
      </nav>
    </header>
  );
}
