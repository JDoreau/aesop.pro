// nav.ts — the site's information architecture, defined once.
// Nav.astro renders BOTH the desktop and mobile menus from this array,
// so the header can never drift across pages again.
export interface NavItem {
  label: string;
  href: string;
  accent?: boolean;      // twine-coloured link (the Assessment)
  mobileLabel?: string;  // longer label shown in the mobile menu
}

export const nav: NavItem[] = [
  { label: "Services",   href: "/services" },
  { label: "Work",       href: "/work" },
  { label: "Assessment", href: "/assessment", accent: true, mobileLabel: "Reporting Clarity Assessment" },
  { label: "Insights",   href: "/insights" },
  { label: "Resources",  href: "/resources" },
  { label: "About",      href: "/about" },
  { label: "Contact",    href: "/contact" },
];

export const cta = { label: "Book a diagnostic", href: "/diagnostic", mobileLabel: "Book a diagnostic call" };

export const site = {
  name: "Aesop Analytics",
  tagline: "Reporting modernization & data trust consulting.",
  // Canonical brand promise (TRUE_NORTH §1). Not yet rendered anywhere —
  // the homepage promise band hardcodes its own longer wording.
  promise: "We bring you value, or we tell you honestly that we can’t.",
  email: "hello@aesopanalytics.com",
  linkedin: "https://www.linkedin.com/company/90403604",
  location: "Nashville, TN",
  url: "https://aesopanalytics.com",
};

// The ONE URL rule: GitHub Pages serves directory-style routes, so every
// internal absolute URL (canonical, og:url, JSON-LD, breadcrumbs) uses the
// trailing-slash form — the same form the sitemap emits. Keeping this in one
// helper is what stops canonical-vs-sitemap drift.
export function canonicalUrl(path: string): string {
  let p = path.startsWith("/") ? path : "/" + path;
  if (!p.endsWith("/")) p += "/";
  return new URL(p, site.url).href;
}
