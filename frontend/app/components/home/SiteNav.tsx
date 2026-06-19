"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";

import { navItems } from "@/app/data/home";

export function SiteNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className={`site-nav${isMenuOpen ? " menu-open" : ""}`}>
      <a className="nav-logo" href="#home" aria-label="AQUASMART Mini home" onClick={closeMenu}>
        <img src="/assets/logo_2.png" alt="AQUASMART Mini" />
      </a>
      <button
        className="nav-menu-toggle"
        type="button"
        aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-controls="home-mobile-menu"
        aria-expanded={isMenuOpen}
        onClick={() => setIsMenuOpen((open) => !open)}
      >
        <span>Menu</span>
        {isMenuOpen ? <X size={18} strokeWidth={1.8} /> : <Menu size={18} strokeWidth={1.8} />}
      </button>
      <nav className="nav-links" aria-label="Primary navigation">
        {navItems.map((item) => (
          <a
            className={item.active ? "active" : undefined}
            href={item.href}
            key={item.label}
            onClick={closeMenu}
          >
            {item.label}
          </a>
        ))}
      </nav>
      <nav className="mobile-nav-panel" id="home-mobile-menu" aria-label="Mobile navigation">
        {navItems.map((item) => (
          <a
            className={item.active ? "active" : undefined}
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
