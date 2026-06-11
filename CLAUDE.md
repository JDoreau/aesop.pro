# CLAUDE.md — Engineering guide for agents & developers

Read this before editing anything. It exists because this repo is maintained
largely through AI-agent sessions, and the expensive mistakes here are all
*avoidable* with the context below. The README covers what the project is;
this file covers how to work on it without breaking it.

---

## Architecture map (30 seconds)

```
src/
  layouts/    BaseLayout.astro (all standard pages) · ArticleLayout.astro (insights articles)
  components/ Nav.astro · Footer.astro · Seo.astro
  data/       nav.ts (site constants) · insights.ts (DRIVES the /insights hub — add rows here)
  styles/     tokens.css (THE palette/type source) · base.css · article.css (article components)
  pages/      one .astro per route; insights/ subfolder for articles
public/
  resources/  4 LEGACY standalone HTML pages (trust-letter, sample-assessment,
              dashboard-audit, health-check) — self-contained, duplicate brand CSS
  brand/      standalone brand style-guide page
  assets/     favicon.svg, owl-mark.svg, og-image.png
astro.config.mjs  custom inline sitemap generator (see Gotcha #3)
```

Every `src/pages` page uses a layout. The insights hub (`/insights`) renders
entirely from `src/data/insights.ts` — new articles get a data row FIRST.

---

## ⚠ Danger zones — read before touching these files

### 1. Embedded print documents inside JS strings
`src/pages/resources.astro` and `public/resources/health-check/index.html`
each contain a **complete HTML document (with its own `<style>…</style>`)
inside JavaScript string concatenation**, used to build a print iframe
`srcdoc`. Consequences:

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

### 4. Legacy pages duplicate the brand
The four `public/resources/` pages + `public/brand/` are standalone HTML:
they re-declare tokens, owl SVG, and wordmark CSS locally. A brand change is
**not done** until those copies are updated too. (Wordmark optical nudges,
for example, live in 8+ places — see Brand facts below.)

---

## Brand facts (so you don't re-derive them)

- **Tokens:** `src/styles/tokens.css` is canonical. Palette + semantic
  status colors (`--good/--warn/--info`) + the brand ratification record.
- **Logo:** the owl is the ONE logo. The æ ligature is an editorial
  flourish only (insights row markers, callout watermarks) — never a lockup.
- **Wordmark:** Abril Fatface "aesop" + DM Sans letterspaced "ANALYTICS".
  ANALYTICS is *optically centered on the x-height* via measured
  `translateY` nudges (nav 3px, footer 2.5px, article nav 2.75px, article
  footer 2.5px, brand page 3px). The `p` descender skews flex centering —
  don't remove the nudges, and re-measure if font sizes change.
- **Type roles:** Newsreader = site headings · DM Sans = body/UI · Abril =
  wordmark, big numerals, hero watermarks, article display only.
- **Voice:** principal-led, plainspoken, anti-hype. Never lead with AI.
  Never fabricate numbers — illustrative figures must say so.

---

## Working conventions

- **Branches:** feature branch → `git merge --no-ff` to `main` → push.
  GitHub Actions builds and deploys on push to main.
- **Patch scripts:** for multi-file edits, stage a Python script to temp and
  run it. Scripts must use strict replacement-count assertions and **fail
  loudly** on any mismatch — a "FAIL but saved anyway" script is how files
  get corrupted. Read utf-8, write `newline=""`.
- **Build:** `npm run build` → currently 30 pages, ~1.5s. Zero-warning
  builds are the norm; treat new warnings as failures.
- **Verification (live):** deploys take ~200–320s after push. Verify on the
  apex domain with cache-busting (`curl -sL "https://aesopanalytics.com/…?v=$RANDOM"`)
  — Cloudflare caches HTML. For CSS/visual changes, assert computed styles
  with a real browser session, not greps.
- **Print engines:** any change to `resources.astro` or the health-check
  page requires a print regression — generate a report through the live
  engine and render the srcdoc to PDF.

---

## What NOT to do

- Don't inject before `</style>` without an occurrence count (Danger #1).
- Don't add raw brand hexes in `src/` styles — use tokens. (Exceptions:
  inline data-viz SVGs in older articles; print-engine JS strings.)
- Don't add testimonial/Review structured data — GATED until approved
  quotes + attribution + ratings exist on-page (see `_OPS/ROADMAP.md`).
- Don't trust a dist grep that only reads page HTML (Danger #2).
- Don't edit `public/resources/` pages for content — they're legacy frozen
  artifacts; brand-critical fixes only, until they're migrated into Astro.

---

## Business context lives elsewhere

Strategy, roadmap, decisions, and the done-log are in `../_OPS/`
(TRUE_NORTH.md, ROADMAP.md, DONE_LOG.md) — outside this repo. Update
DONE_LOG.md after every ship.
