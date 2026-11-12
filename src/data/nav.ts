// nav.ts — the site's information architecture, defined once.
// Nav.astro renders BOTH the desktop and mobile menus from this array,
// so the header can never drift across pages again.
export interface NavItem {
  label: string;
  href: string;
  accent?: boolean;      // unused since the Nov 2026 redesign (was the accent-coloured Assessment link)
  mobileLabel?: string;  // unused since the Nov 2026 redesign: the four sections fit one row at every width, so there is no mobile menu
}

// Research-site IA (Nov 2026): Aesop Analytics LLC closed and the site became
// Jonathan Doreau's personal research and writing site. Every href points at a
// real route (breadcrumb matcher + isCurrent() compare against these paths).
export const nav: NavItem[] = [
  { label: "Research", href: "/publications", mobileLabel: "Research — field studies" },
  { label: "Writing",  href: "/insights",     mobileLabel: "Writing — articles" },
  { label: "Tools",    href: "/resources",    mobileLabel: "Free tools" },
  { label: "About",    href: "/about" },
];

export const site = {
  name: "Aesop Analytics",
  author: "Jonathan Doreau",
  tagline: "Research and writing on data, measurement and the economy.",
  linkedin: "https://www.linkedin.com/in/jonathan-doreau-1a00b233/",
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

// linkHref — the trailing-slash form for an INTERNAL <a href> target, applied at
// render time (Nav, Footer, ArticleLayout). GitHub Pages 301s the slash-less
// route (/about → /about/), which is also the canonical + sitemap form, so a
// literal href="/about" makes Google crawl a redirect from our own pages. This
// returns the final /slash/ form instead. The nav[].href DATA stays slash-less
// by design — Seo.astro's breadcrumb matcher and Nav's isCurrent() compare
// against it — so the transform lives only at the link sites, never in the data.
// Preserves #fragment / ?query; leaves "/", external/mailto, and file paths alone.
export function linkHref(href: string): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const cut = href.search(/[?#]/);
  const path = cut === -1 ? href : href.slice(0, cut);
  const suffix = cut === -1 ? "" : href.slice(cut);
  if (path === "/" || path.endsWith("/")) return href;
  const last = path.slice(path.lastIndexOf("/") + 1);
  if (last.includes(".")) return href; // a file, not a route
  return path + "/" + suffix;
}

// ctaHref — internal-placement attribution for CONVERSION CTAs (and only those).
// Stamps the ratified internal scheme: utm_source=site · utm_medium=internal ·
// utm_campaign=<placement>. The medium "internal" is deliberately its own channel
// bucket in the operator's funnel (PLATFORM normalizeChannel keeps any unknown
// medium as its own key), so it can never masquerade as organic/paid/social.
// NEVER stamps utm_content — that key is reserved for the publisher's per-piece
// content-asset id (Content Mind, PLATFORM migration 0024). Genuine inbound
// campaigns are protected by the FIRST-TOUCH session capture in Seo.astro: an
// internal placement is only ever recorded when the session arrived untagged.
// Query goes on a trailing-slash path (check.mjs §8-clean); #fragment preserved.
export function ctaHref(href: string, campaign: string): string {
  const base = linkHref(href);
  const cut = base.indexOf("#");
  const path = cut === -1 ? base : base.slice(0, cut);
  const frag = cut === -1 ? "" : base.slice(cut);
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}utm_source=site&utm_medium=internal&utm_campaign=${encodeURIComponent(campaign)}${frag}`;
}
