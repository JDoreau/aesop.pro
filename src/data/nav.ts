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

export const cta = { label: "Book a diagnostic", href: "/contact", mobileLabel: "Book a diagnostic call" };

export const site = {
  name: "Aesop Analytics",
  tagline: "Reporting modernization & data trust consulting.",
  promise: "We bring you value, or we tell you honestly that we can’t.",
  email: "hello@aesopanalytics.com",
  linkedin: "https://www.linkedin.com/company/90403604",
  location: "Nashville, TN",
  url: "https://aesopanalytics.com",
};
