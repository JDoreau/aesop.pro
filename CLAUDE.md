# CLAUDE.md — Engineering guide for agents & developers

Read this before editing anything. It exists because this repo is maintained
largely through AI-agent sessions, and the expensive mistakes here are all
*avoidable* with the context below. The README covers what the project is;
this file covers how to work on it without breaking it.

---

## Governing canon — the Standing Directive

This repo is governed by the ecosystem-wide **[Standing Agentic Development Directive](../STANDING-DIRECTIVE.md)** (`CODE/aesop.pro/STANDING-DIRECTIVE.md`) — standing law for **all** Aesop software dev. The detailed engineering guidance below is how its universal rules manifest on a **public marketing site**:

- **§4 Privacy / §5 Demo (this site is public).** Never expose PII or real client data; lead data flows to the Operator (PLATFORM) via the signed webhook channels — never log it client-side, never put it in URLs. Choose the privacy-preserving option on consent; no tracking beyond what's disclosed.
- **No fabricated numbers** (also under "Voice" below): illustrative figures must say so, and testimonial/Review structured data stays gated until approved quotes + attribution exist.
- **§8 Productization, accessibility, and the anti-hype voice** apply to every page. The TRUST Index scorer (`src/lib/trust-index.js`) is shared method canon from `_OPS` — keep its constants in sync, never fork them.

**Live state first — never assume a clean tree:** run `node ../ecosystem-status.mjs` (every repo's real git state) + read [`../WORKING-STATE.md`](../WORKING-STATE.md) for the *why* + next step behind any uncommitted WIP. (Note: this repo **auto-deploys on push to `main`** — don't push casually.)

Litmus test for any change: does this make the site more secure, maintainable, explainable, accessible, and trustworthy — or add hidden fragility? When in doubt, the directive governs; business canon lives in `../_OPS/`.

---

## Architecture map (30 seconds)

```
src/
  layouts/    BaseLayout.astro (all standard pages) · ArticleLayout.astro (insights articles)
  components/ Nav.astro · Footer.astro · Seo.astro · Wordmark.astro · OwlMark.astro
  data/       nav.ts (site IA + canonicalUrl helper) · insights.ts (DRIVES /insights — add rows here)
  styles/     tokens.css (THE palette/type source) · base.css · article.css (article components)
  pages/      one .astro per route; insights/ (21 articles incl. field studies); resources/ (4 interactive tools)
public/
  brand/      standalone brand style-guide page (the ONE remaining self-contained page)
  assets/     favicon.svg, owl-mark svgs, og-image.png
astro.config.mjs  custom inline sitemap generator (see Gotcha #3)
scripts/check.mjs repo invariants — runs before every build, local and CI
```

Every `src/pages` page uses a layout. The insights hub (`/insights`) renders
entirely from `src/data/insights.ts` — new articles get a data row FIRST
(check.mjs fails the build if a row and its page file don't both exist).

## ⚠ Danger zones — read before touching these files

### 1. Embedded print documents inside JS strings (currently NONE — rule stands)
`src/pages/resources.astro` and `src/pages/resources/health-check.astro`
previously each contained a **complete HTML document (with its own
`<style>…</style>`) inside JavaScript string concatenation**, used to build a
print iframe `srcdoc`. Both were rebuilt (the Health Check now prints via
`@media print` CSS; the resources page is a plain hub) and **no EMBEDDED-DOC
fences remain in src/** — but check.mjs still enforces the fencing rule, so if
an embedded doc ever returns it must be fenced. The historical consequences:

- These files contain **more than one `</style>`**. A regex like
  "insert before `</style>`" with no occurrence count WILL corrupt the
  print engine by injecting into a JS string literal. This nearly shipped
  once. **Always count occurrences first and scope to the first match.**
- The print CSS in those JS strings **cannot use `var(--token)`** — the
  iframe document can't read the parent page's custom properties. Hex
  literals inside print strings are intentional. Keep them in sync with
  `tokens.css` manually (values are commented at the definitions).
- `CC_COLOR` and similar JS color maps are literals for the same reason.

Both regions are fenced with `EMBEDDED-DOC` sentinel comments. Respect them.
check.mjs strips fenced regions before running its invariants, so deleting a
sentinel will itself fail the build.

### 2. Astro CSS bundling vs. inlining (verification trap)
Astro 4.16 inlines *small* page styles directly into the HTML and bundles
the rest to `dist/_astro/*.css`. **Grepping only the page HTML for a CSS
change will produce false "MISSING" results.** Verify against the union of
the page HTML + all `dist/_astro/*.css`, or better, assert computed styles
in a real browser. Page scripts bundle to `dist/_astro/hoisted.*.js`
(string literals survive minification — grep there for print-engine CSS).

### 3. The sitemap is custom
`@astrojs/sitemap` v3.7.3 crashes against Astro 4.16 (`routes` undefined in
`build:done`). The working solution is the inline generator in
`astro.config.mjs`. Don't "upgrade" it back to the plugin without testing.
Its `NOINDEX` list is cross-checked against pages passing `noindex={true}`
by check.mjs — keep both in sync or the build fails.

### 4. The remaining standalone page + the two health checks
- `public/brand/index.html` is the ONE page that still re-declares tokens,
  owl SVG, and wordmark CSS locally (intentional: it displays 16 owl
  specimens by design and links no site stylesheets). A brand change is
  **not done** until that copy is reviewed too.
- The two health-check instruments were CONSOLIDATED: `/resources` is now a
  hub that hands off to the ONE canonical instrument at
  `/resources/health-check` (engine: `src/lib/trust-index*.js` +
  `health-check-app.js`, storage key `aesop-hc-v3`).

## URL rule

GitHub Pages serves directory-style routes; the slash-less form 301s.
**Every internal URL uses the trailing-slash form** so we never link to a
redirect from our own pages (a slash-less link makes Googlebot crawl a 301 →
GSC "Page with redirect"). Two helpers in `src/data/nav.ts`, never hand-built:

- **Absolute URLs** (canonical, og:url, breadcrumbs, Article JSON-LD) →
  `canonicalUrl()`.
- **`<a href>` link targets** → `linkHref()`, applied at the render site
  (Nav, Footer, ArticleLayout, the insights hub). It appends the slash to the
  path part only, preserving `#fragment`/`?query`, and leaves `/`, files, and
  external/mailto links alone. **Keep `nav[].href` DATA slash-less** — Seo's
  breadcrumb matcher and Nav's `isCurrent()` compare against it; only the
  *rendered* href gets the slash. Static literal links may also just be
  written in `/slash/` form directly.

`check.mjs` §8 fails the build on any literal slash-less internal `href="/…"`
in `src/` (files, `/`, and fenced print docs exempt). Dynamic `href={…}` links
are not caught by the check — route them through `linkHref()`.

## Brand facts (so you don't re-derive them)

- **Tokens:** `src/styles/tokens.css` is canonical. Palette + semantic
  status colors (`--good/--warn/--info`) + the brand ratification record.
  check.mjs PARSES this file to build its raw-hex guard — any token value
  hardcoded in `src/styles/*.css` fails the build; in page `<style>` blocks
  it warns.
- **Logo:** the owl is the ONE logo. The æ ligature is an editorial
  flourish only (insights row markers, callout watermarks) — never a lockup.
- **Wordmark:** Abril Fatface "aesop" + DM Sans letterspaced "ANALYTICS",
  centralized in `src/components/Wordmark.astro` (all four variants).
  ANALYTICS is *optically centered on the x-height* via measured
  `translateY` nudges (nav 3px, footer 2.5px, article nav 2.75px, article
  footer 2.5px). The `p` descender skews flex centering — don't remove the
  nudges (check.mjs guards them), and re-measure if font sizes change.
  The standalone `/brand` page carries its own copy (see Danger #4).
- **Type roles:** Newsreader = site headings · DM Sans = body/UI · Abril =
  wordmark, big numerals, hero watermarks, article display only.
- **Voice:** principal-led, plainspoken, anti-hype. Never lead with AI.
  Never fabricate numbers — illustrative figures must say so.

## Working conventions

- **Branches:** feature branch → `git merge --no-ff` to `main` → push.
  GitHub Actions builds and deploys on push to main.
- **Invariants:** `scripts/check.mjs` runs before every build (local + CI
  via `npm run build`; standalone via `npm run check`). It enforces: owl
  single-source, one canonical fonts URL, no embedded docs outside fences,
  token discipline (hex list parsed from tokens.css), wordmark nudges,
  insights data↔page bijection, sitemap/noindex sync, and TRUST Index scorer
  constant integrity (`src/lib/trust-index.js` — pillars/bands/gate). **A new
  repo rule belongs in this file AND as a check there.**
- **Patch scripts:** for multi-file edits, stage a Python script to temp and
  run it. Scripts must use strict replacement-count assertions and **fail
  loudly** on any mismatch — a "FAIL but saved anyway" script is how files
  get corrupted. Read utf-8, write `newline=""`.
- **Build:** `npm run build` → page count must match `src/pages` (40 at
  last update; sitemap lists 38 — 404 + thanks excluded), ~3s. Zero-warning builds are the norm; treat new warnings
  as failures (the check.mjs hex warnings are known-legacy, currently in
  the resources pages only).
- **Node:** pinned to 22 (package.json `engines`, deploy.yml `node-version`).
- **Verification (live):** deploys take ~200–320s after push. Verify on the
  apex domain with cache-busting (`curl -sL "https://aesopanalytics.com/…?v=$RANDOM"`)
  — Cloudflare caches HTML. For CSS/visual changes, assert computed styles
  with a real browser session, not greps.
- **Print engines:** any change to `resources.astro` or
  `resources/health-check.astro` requires a print regression — generate a
  report through the live engine and render the srcdoc to PDF.

## What NOT to do

- Don't inject before `</style>` without an occurrence count (Danger #1).
- Don't add raw brand hexes in `src/` styles — use tokens. (Exceptions:
  inline data-viz SVGs in articles; print-engine JS strings inside fences.)
- Don't add testimonial/Review structured data — GATED until approved
  quotes + attribution + ratings exist on-page (see
  `_OPS/INITIATIVES/business-launch.md`, Pending decisions).
- Don't trust a dist grep that only reads page HTML (Danger #2).
- Don't edit `public/brand/index.html` for content — brand-critical fixes
  only; it is deliberately self-contained.
- Don't hand-build absolute site URLs — use `canonicalUrl()` (URL rule).

## Business context lives elsewhere

Strategy, the portfolio plan, decisions, and the done-log are in `../_OPS/`
(TRUE_NORTH.md = master facts, PORTFOLIO.md = what's active,
INITIATIVES/ = the two live roadmaps, DONE_LOG.md = append-only history) —
outside this repo, version-controlled as the private `aesop-ops` repo.
Update DONE_LOG.md after every ship.
---
**Identity source of truth: [../IDENTITY.md](../IDENTITY.md).** Aesop Analytics is a SaaS-first **data-governance software company**; the product is **Aesop Manteia**; the consulting/assessment work is the **on-ramp**, not the company's definition. If anything in this repo implies "consulting-only" or "solo," it is a relic and IDENTITY.md wins. (Product name locked = Aesop Manteia; the "Analytica" name is retired.)
