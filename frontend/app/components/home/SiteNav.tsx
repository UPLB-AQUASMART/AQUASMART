"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";

import { navItems } from "@/app/data/home";
import styles from "./SiteNav.module.css";

export function SiteNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className={`${styles["site-nav"]}${isMenuOpen ? ` ${styles["menu-open"]}` : ""}`}>
      <a className={styles["nav-logo"]} href="#home" aria-label="AQUASMART Mini home" onClick={closeMenu}>
        <img src="/assets/logo_2.png" alt="AQUASMART Mini" />
      </a>
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
          <a
            className={item.active ? styles.active : undefined}
            href={item.href}
            key={item.label}
            onClick={closeMenu}
          >
            {item.label}
          </a>
        ))}
      </nav>
      <nav className={styles["mobile-nav-panel"]} id="home-mobile-menu" aria-label="Mobile navigation">
        {navItems.map((item) => (
          <a
            className={item.active ? styles.active : undefined}
            href={item.href}
            key={item.label}
            onClick={closeMenu}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
