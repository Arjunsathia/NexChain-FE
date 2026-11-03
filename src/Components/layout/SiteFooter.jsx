import React from "react";
import { Link } from "react-router-dom";
import SiteLogo from "../../assets/Img/logo.webp";
import { DISCLAIMER, DATA_SOURCES } from "./siteInfo";

// Only routes that exist. Signed-out visitors following an app link are sent to
// /auth by the route guard.
const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Markets", to: "/cryptolist" },
      { label: "Portfolio", to: "/portfolio" },
      { label: "Learning hub", to: "/public-learning" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign in", to: "/auth" },
      { label: "Create account", to: "/auth" },
    ],
  },
];

/** Footer for the public landing page (always dark). The signed-in app has none. */
export default function SiteFooter() {
  return (
    <footer className="dark border-t border-line text-fg-muted">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid gap-8 py-10 md:grid-cols-[1.4fr_repeat(2,1fr)]">
          <div className="max-w-sm space-y-3">
            <img src={SiteLogo} alt="NexChain" className="h-7 w-auto" />
            <p className="text-sm leading-relaxed">
              Practice crypto trading with $10,000 in virtual funds, live market prices and
              professional order types.
            </p>
          </div>
          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-fg">{column.title}</h3>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm transition-colors hover:text-fg">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3 border-t border-line py-5 text-xs text-fg-subtle md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} NexChain. {DISCLAIMER}
          </p>
          <p className="shrink-0">Market data: {DATA_SOURCES.join(" · ")}</p>
        </div>
      </div>
    </footer>
  );
}
