import { footerColumns } from "@/app/data/home";

export function SiteFooter() {
  return (
    <footer className="site-footer scroll-reveal" id="contact">
      <div className="footer-upper">
        <div className="footer-brand">
          <img src="/assets/logo_2.png" alt="AQUASMART Mini" />
          <p>
            AQUASMART empowers farmers and water managers with real-time data,
            AI insights, and smart irrigation recommendations for a sustainable
            future.
          </p>
          <div className="socials">
            <img src="/figma/facebook.svg" alt="Facebook" />
            <img src="/figma/instagram.svg" alt="Instagram" />
            <img src="/figma/linkedin.svg" alt="LinkedIn" />
          </div>
        </div>
        <div className="footer-links">
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3>{column.title}</h3>
              {column.links.map((link) => (
                <a href={link.href} key={link.label}>
                  {link.label}
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="footer-lower">
        <span>{"\u00a9"} 2026 AQUASMART. All rights reserved.</span>
        <div>
          <a href="#contact">Privacy Policy</a>
          <a href="#contact">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
