import { navItems } from "@/app/data/home";

export function SiteNav() {
  return (
    <header className="site-nav">
      <a className="nav-logo" href="#home" aria-label="AQUASMART Mini home">
        <img src="/assets/logo_2.png" alt="AQUASMART Mini" />
      </a>
      <nav className="nav-links" aria-label="Primary navigation">
        {navItems.map((item) => (
          <a className={item.active ? "active" : undefined} href={item.href} key={item.label}>
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
