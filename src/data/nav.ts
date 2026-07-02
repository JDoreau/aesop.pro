// nav.ts — the site's information architecture, defined once.
// Nav.astro renders BOTH the desktop and mobile menus from this array,
// so the header can never drift across pages again.
export interface NavItem {
  label: string;
  href: string;
  accent?: boolean;      // twine-coloured link (the Assessment)
  mobileLabel?: string;  // longer label shown in the mobile menu
}

// Product-first IA (the reface, SITE-DIRECTION §1) — the nav order is the single
// loudest positioning signal, so the PRODUCT leads and services demote to the
// Assessment on-ramp. Every href points at a real, existing route (breadcrumb
// matcher + isCurrent() compare against these paths, so they stay clean & 404-free).
// "Product" is the Manteia platform page; "Why trust it" and "Work" are the proof
// surfaces; the Assessment is the accented human on-ramp.
export const nav: NavItem[] = [
  { label: "Product",    href: "/platform", mobileLabel: "The Product — Aesop Manteia" },
  { label: "Why trust it", href: "/work", mobileLabel: "Why trust it — recent work" },
  { label: "Assessment", href: "/assessment", accent: true, mobileLabel: "Reporting Clarity Assessment" },
  { label: "Insights",   href: "/insights" },
  { label: "Resources",  href: "/resources" },
  { label: "About",      href: "/about" },
  { label: "Contact",    href: "/contact" },
];

// The product-led primary CTA the site never had — "See it on your estate"
// (SITE-DIRECTION §1). It still lands on the diagnostic (the human on-ramp),
// but the LABEL now leads with the product, not the services funnel.
export const cta = { label: "See it on your estate", href: "/diagnostic", mobileLabel: "See it on your estate" };

export const site = {
  name: "Aesop Analytics",
  tagline: "A data-governance software company.",
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
