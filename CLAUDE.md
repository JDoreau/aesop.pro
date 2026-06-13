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
  components/ Nav.astro · Footer.astro · Seo.astro · Wordmark.astro · OwlMark.astro
  data/       nav.ts (site IA + canonicalUrl helper) · insights.ts (DRIVES /insights — add rows here)
  styles/     tokens.css (THE palette/type source) · base.css · article.css (article components)
  pages/      one .astro per route; insights/ (20 articles); resources/ (4 interactive tools)
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

### 1. Embedded print documents inside JS strings
`src/pages/resources.astro` and `src/pages/resources/health-check.astro`
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
- The site currently has TWO health-check instruments: the 10-area slider
  checklist embedded on `/resources` and the 3-questions-per-area scored
  version at `/resources/health-check`. They have separate engines, storage
  keys, and print documents. A change to one does NOT propagate to the
  other — and whether they should consolidate is an open owner decision
  (see `_OPS/INITIATIVES/business-launch.md`).

## URL rule

GitHub Pages serves directory-style routes; the slash-less form 301s.
**Every internal absolute URL uses the trailing-slash form**, produced by
`canonicalUrl()` in `src/data/nav.ts` — canonicals, og:url, breadcrumbs, and
Article JSON-LD all flow through it. Don't hand-build absolute URLs.

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
  insights data↔page bijection, and sitemap/noindex sync. **A new repo rule
  belongs in this file AND as a check there.**
- **Patch scripts:** for multi-file edits, stage a Python script to temp and
  run it. Scripts must use strict replacement-count assertions and **fail
  loudly** on any mismatch — a "FAIL but saved anyway" script is how files
  get corrupted. Read utf-8, write `newline=""`.
- **Build:** `npm run build` → page count must match `src/pages` (36 at
  last update), ~3s. Zero-warning builds are the norm; treat new warnings
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
