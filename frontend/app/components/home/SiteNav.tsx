"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { navItems } from "@/app/data/home";
import styles from "./SiteNav.module.css";

export function SiteNav({ activeLabel = "Home" }: { activeLabel?: string }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className={`${styles["site-nav"]}${isMenuOpen ? ` ${styles["menu-open"]}` : ""}`}>
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
        {navItems.map((item) => (
          <Link
            className={item.label === activeLabel ? styles.active : undefined}
            href={item.href}
            key={item.label}
            onClick={closeMenu}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <nav className={styles["mobile-nav-panel"]} id="home-mobile-menu" aria-label="Mobile navigation">
        {navItems.map((item) => (
          <Link
            className={item.label === activeLabel ? styles.active : undefined}
            href={item.href}
            key={item.label}
            onClick={closeMenu}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
