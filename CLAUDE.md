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
design.md     the LOCKED design system (Hallmark · Newsprint). Read it before any visual change.
src/
  layouts/    BaseLayout.astro (all standard pages; `front` prop = the homepage nameplate) · ArticleLayout.astro (insights articles)
  components/ Nav.astro (the masthead) · Footer.astro · Seo.astro · Wordmark.astro · OwlMark.astro
  data/       nav.ts (site IA + canonicalUrl helper) · insights.ts (DRIVES /insights, Home and Research — add rows here)
  styles/     tokens.css (THE token source: every colour, face, size, space) · base.css (reset + type defaults)
              site.css (the shared vocabulary; its FIRST LINES are the Hallmark stamp) · article.css (article components)
  pages/      one .astro per route; insights/ (21 articles incl. 4 field studies); resources/ (2 interactive tools)
public/
  brand/      standalone brand style-guide page (the ONE remaining self-contained page; documents the PRE-redesign identity)
  assets/     favicon.svg, owl-mark svgs, og-image.png (source: scripts/og-image.html), jonathan-doreau.jpg, world-cup/
astro.config.mjs       custom inline sitemap generator (see Gotcha #3)
scripts/check.mjs      repo invariants — runs before every build, local and CI
scripts/og-image.html  source of the social share image (render recipe in its header comment)
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
  **not done** until that copy is reviewed too. **Since the Nov 2026
  redesign it documents the PREVIOUS identity** (navy/twine, Newsreader +
  DM Sans, the old favicon colours): it was left untouched on the owner's
  instruction and is pending its own decision (update or retire).
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

The look was redesigned in Nov 2026 with the Hallmark skill (theme: **Newsprint**).
`design.md` at the repo root is the locked system; this is the short version.

- **Tokens:** `src/styles/tokens.css` is canonical and is the ONLY file that
  may contain a colour or a font name. The palette is OKLCH: paper
  (`--color-paper`, `-2`, `-3`), ink (`--color-ink`, `-2`, `--color-muted`),
  rules (`--color-rule`, `--color-rule-2`), ONE accent, a dried brick
  (`--color-accent`), plus the ink-band pairs (`--color-on-ink…`), the chart
  roles (`--chart-*`) and the tool status roles (`--status-*`). Navy and twine
  are retired. check.mjs fails the build on any colour or font literal outside
  tokens.css (page `<style>` blocks, `style=""` attributes, SVG `fill`/`stroke`
  and inline scripts included) and on any `var(--token)` that tokens.css does
  not declare.
- **Charts re-ink with the site:** inline SVG charts and diagrams never carry a
  literal. They use the roles: `--chart-accent` (the one series a chart argues
  from), `--chart-ink` (the comparison), `--chart-soft/-pale/-faint` (context),
  `--chart-grid`, `--chart-axis`, `--chart-text`, `--chart-text-2`. SVG text
  takes no `font-family` attribute (article.css sets the agate face).
- **Logo:** the owl is the ONE logo (`OwlMark.astro`; body in ink, eyes in
  brick). The æ ligature is the site's one ornament: the end mark that closes
  every article (`.endmark`, set by ArticleLayout). Never a lockup, never a
  watermark, never a row marker.
- **Wordmark:** "aesop" in Abril Fatface (`--font-wordmark`) + "ANALYTICS" in
  Libre Franklin caps, centralized in `src/components/Wordmark.astro` (three
  variants: `masthead`, `bar`, `footer`). ANALYTICS is *optically centered on
  the x-height* of "aesop": both words sit on one baseline and ANALYTICS is
  raised by half the difference between the x-height of Abril Fatface
  (`WM_XH = 0.48`) and the cap height of Libre Franklin (`WM_CAP = 0.745`),
  both MEASURED from the loaded faces. This replaced the old per-variant pixel
  nudges and holds at every size; check.mjs guards the two ratios and the
  transform. Re-measure if either face changes. The standalone `/brand` page
  carries its own, older copy (see Danger #4).
- **Type roles:** Zilla Slab 700 (roman, never lighter, never italic) = every
  heading, big figure and button label · Spectral 400/500/700 = all text,
  labels, captions and meta, in sentence case, never tracked, never uppercase ·
  Libre Franklin 500 ("agate") = figures in lists, tables and charts ONLY ·
  Abril Fatface = the "aesop" wordmark + the æ end mark ONLY (owner directive
  2026-07, still in force). One fonts URL, in `Seo.astro`.
- **Surfaces:** rules, never boxes. Radius 0 and no shadow anywhere. A hairline
  for ordinary breaks, the double rule (`--rule-double`) for major ones, a well
  (`--color-paper-2` ruled top and bottom) for an aside, at most one ink band
  (`.band--ink` / `.callout`) beside it. The brick never fills a box or a
  button. Nothing animates: no reveal, no counting numbers, no growing bars.
- **Pictures** print black and white (`.plate`), with a one-line caption.
- **Voice:** principal-led, plainspoken, anti-hype. Never lead with AI.
  Never fabricate numbers — illustrative figures must say so.

## Working conventions

- **Branches:** feature branch → `git merge --no-ff` to `main` → push.
  GitHub Actions builds and deploys on push to main.
- **Invariants:** `scripts/check.mjs` runs before every build (local + CI
  via `npm run build`; standalone via `npm run check`). It enforces: owl
  single-source, one canonical fonts URL, no embedded docs outside fences,
  token discipline (no colour or font literal outside tokens.css, and no
  undeclared `var(--token)`), the wordmark's measured optical-alignment ratios,
  insights data↔page bijection, sitemap/noindex sync, and TRUST Index scorer
  constant integrity (`src/lib/trust-index.js` — pillars/bands/gate). **A new
  repo rule belongs in this file AND as a check there.**
- **Design lint (not part of the build):** the typographic and layout rules
  that check.mjs does not cover (no tracked/uppercase labels, no eyebrows, the
  spacing scale, contrast, focus rings, fold and overflow at 320 to 1920) are
  checked by Hallmark's linter against the running dev server:
  `node ~/.claude/skills/hallmark/scripts/sloplint.mjs src/styles src/layouts src/components src/pages/<file>.astro --genre editorial --render --url http://localhost:4321/<route>/`
  (add `--scope app` for the two tools). The stamp in the first lines of
  `src/styles/site.css` carries the design's recorded waivers and answers: keep
  it as the first thing in that file.
- **Patch scripts:** for multi-file edits, stage a Python script to temp and
  run it. Scripts must use strict replacement-count assertions and **fail
  loudly** on any mismatch — a "FAIL but saved anyway" script is how files
  get corrupted. Read utf-8, write `newline=""`.
- **Build:** `npm run build` → page count must match `src/pages` (30 at
  last update; sitemap lists 29 — 404 excluded), ~3s. Zero-warning builds are the norm; treat new warnings
  as failures (check.mjs has no warning tier any more: the legacy hex
  warnings were cleared in the Nov 2026 redesign).
- **Node:** pinned to 22 (package.json `engines`, deploy.yml `node-version`).
- **Verification (live):** deploys take ~200–320s after push. Verify on the
  apex domain with cache-busting (`curl -sL "https://aesopanalytics.com/…?v=$RANDOM"`)
  — Cloudflare caches HTML. For CSS/visual changes, assert computed styles
  with a real browser session, not greps.
- **Print engine:** any change to `resources/health-check.astro` requires a
  print regression — open `/resources/health-check/?r=<base64 scores>`, wait
  for `[data-hc-ready]`, and print to PDF (the report prints via `@media
  print`, on white stock, in two to three Letter pages).

## What NOT to do

- Don't inject before `</style>` without an occurrence count (Danger #1).
- Don't write a colour or a font name anywhere in `src/` outside
  `tokens.css` — use tokens, charts and inline scripts included. (The only
  exception is a print-engine JS string inside an EMBEDDED-DOC fence.)
- Don't reach for a card, a rounded corner, a shadow, an uppercase tracked
  label, an eyebrow above a heading, or an animation: the system has none
  (see `design.md`). Compose the shared pieces in `site.css` / `article.css`.
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
**Identity (Nov 2026): this is Jonathan Doreau's personal research and writing site.** Aesop Analytics LLC closed; the name stays as the site's brand. There are no services, pricing, product (Manteia), booking, contact or email-capture pages, and nothing a visitor enters leaves the browser. Don't add a funnel, a form, a lead webhook or a sales CTA back. The nav is Research (`/publications`, field studies) · Writing (`/insights`) · Tools (`/resources`) · About. Older notes in this file and in `../IDENTITY.md` / `../_OPS/` that describe a SaaS company or a consulting funnel are historical.
