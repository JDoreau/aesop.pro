# Website (Aesop Propylaia)

The marketing and content site for **Aesop Analytics**, a data-governance
software company based in Nashville, TN — building **Aesop Manteia**, entered
through its reporting-modernization and data-trust practice (see
[`../IDENTITY.md`](../IDENTITY.md)).

**Live:** [aesopanalytics.com](https://aesopanalytics.com)
**Tagline:** *Every dataset has a moral.*
**Repo:** `github.com/JDoreau/aesop.pro`

> **Working on this code?** Read [`CLAUDE.md`](CLAUDE.md) first - the
> architecture map, danger zones, and verification recipes for both human
> developers and AI agents. The expensive mistakes here are documented ones.

---

## What this is

A statically-generated site built with **Astro 4.16**. Pages are authored as
`.astro` components and compiled to plain HTML/CSS at build time — fast to load,
easy to version, no client-side framework. The only scripts are the writing
hub's pillar filter and the two browser tools.

> **Nov 2026:** the site is Jonathan Doreau's personal research and writing site
> (see the identity note at the foot of `CLAUDE.md`) and was redesigned on the
> Hallmark **Newsprint** system, locked in [`design.md`](design.md). Parts of this
> README below still describe the earlier company site (services, assessment,
> forms, booking): those pages no longer exist. The build is produced by GitHub Actions and published
to GitHub Pages behind Cloudflare.

> Migrated from a hand-maintained static HTML site in June 2026. See
> `CUTOVER.md` (historical record — do not execute).

## Tech & hosting

| | |
|---|---|
| **Framework** | Astro 4.16 (static output) |
| **Hosting** | GitHub Pages — built & deployed via GitHub Actions on push to `main` |
| **DNS / CDN / security** | Cloudflare — DNS, CDN, and security headers (A grade) |
| **Domain** | aesopanalytics.com (`CNAME`) |
| **Mailbox** | `hello@aesopanalytics.com` |
| **Transactional email** | SendGrid — SPF / DKIM / DMARC verified |
| **Forms** | Formspree (`mojzdqlk`) → `/thanks` |
| **Booking** | Cal.com (free diagnostic) |
| **Analytics** | Google Analytics 4 (`G-4TVCCT0XW9`) |
| **Fonts** | Zilla Slab 700 (headings, figures) · Spectral (text, labels) · Libre Franklin 500 (figures in tables and charts) · Abril Fatface (wordmark + æ end mark only) |

## Brand

| Token | Value |
|---|---|
| Paper (background) | `--color-paper` · `oklch(94% 0.011 92)` |
| Ink (text, authority) | `--color-ink` · `oklch(17% 0.012 60)` |
| Brick (the one accent: links, focus, the series a chart argues from) | `--color-accent` · `oklch(44% 0.13 32)` |
| Rules | `--color-rule` hairline · `--rule-double` for major breaks |
| Container | 1440px, twelve columns, 64px gutters |
| Logo | Owl mark — *not* the æ ligature (the æ is the article end mark) |

Every colour, face, size and space lives in `src/styles/tokens.css`; the locked
system is described in `design.md`. The `/brand` page (`public/brand/`) still
documents the pre-redesign identity.

---

## Repository structure

```
src/
├── pages/                  One file per route
│   ├── index.astro         Homepage
│   ├── services.astro      Offer ladder (+ OfferCatalog schema)
│   ├── assessment.astro    Flagship: Reporting Clarity Assessment (+ Service & FAQPage schema)
│   ├── work.astro          Case studies / portfolio
│   ├── insights.astro      Content hub (renders from data/insights.ts)
│   ├── insights/           21 articles + field studies (via ArticleLayout)
│   ├── resources.astro     Free resources hub + embedded reporting self-check
│   ├── resources/          4 interactive tools (health-check, dashboard-audit,
│   │                       sample-assessment, trust-letter)
│   ├── about.astro         About / founder
│   ├── contact.astro       Contact + fit/no-fit
│   ├── diagnostic.astro    Cal.com booking
│   ├── privacy.astro       Privacy disclosure
│   ├── thanks.astro        Form confirmation (noindex)
│   └── 404.astro           Not-found page (noindex)
│
├── layouts/
│   ├── BaseLayout.astro    Wraps every standard page; composes head + nav + footer
│   └── ArticleLayout.astro Wraps articles; emits Article schema + byline
│
├── components/
│   ├── Seo.astro           THE shared <head>: meta, OG, fonts, GA4, structured data
│   ├── Nav.astro           Header (renders from data/nav.ts)
│   ├── Footer.astro        Footer
│   ├── Wordmark.astro      The lockup (owl + aesop + ANALYTICS): masthead, bar, footer
│   └── OwlMark.astro       The owl SVG, single-sourced (build-enforced)
│
├── data/
│   ├── nav.ts              Site IA, CTA, the `site` object, and canonicalUrl()
│   └── insights.ts         Insights hub content (pillars, articles, sidebar)
│
└── styles/
    ├── tokens.css          Every colour, face, size and space (single source)
    ├── base.css            Reset and type defaults
    ├── site.css            The shared vocabulary (rules, index, box score, bands, controls)
    └── article.css         Article and field-study components

astro.config.mjs            Site config + custom inline sitemap generator
scripts/check.mjs           Repo invariants — run before every build (local + CI)
public/                     Static assets served as-is (favicon, /brand, images)
.github/                    GitHub Actions build + deploy workflow
```

> The internal engagement-delivery toolkit (`assessment-kit/` + the two xlsx
> templates) moved to the private DELIVERY-OS repo on 2026-06-12 — it is paid
> delivery IP, not site content. This repo's git history retains the pre-move
> versions.

---

## SEO & structured data

The `<head>` is defined once in `src/components/Seo.astro`, used by both
`BaseLayout` and `ArticleLayout`, so meta, Open Graph, fonts, GA4, and JSON-LD
never drift across pages. Pages pass a full `title` and `description`; utility
pages can pass `noindex`, and any page can pass page-specific `schema`.

**Structured data emitted:**

- **`ProfessionalService`** — sitewide, from `Seo.astro` (logo, founder, address, LinkedIn in `sameAs`, `knowsAbout`, `priceRange`, slogan).
- **`BreadcrumbList`** — sitewide, *derived from the URL path* against `nav.ts`, so the trail can't drift from the IA.
- **`Service`** — on the Assessment page (`$5,000–$9,500` range), via the `schema` prop.
- **`OfferCatalog`** — on the Services page, listing the four paid offers and their ranges.
- **`Article`** — on every article, from `ArticleLayout`.
- **`FAQPage`** — on the Assessment page.

> Not yet emitted: `Review` / `AggregateRating`. Deferred until the real,
> anonymized client testimonials are finalized — review schema on in-flux data is
> a quality risk, not a win.

**Crawlability:** `/thanks` and `/404` carry `noindex, follow`. The custom sitemap
generator in `astro.config.mjs` reads the built page list and writes `sitemap.xml`,
excluding `404` and any `noindex` utility pages. (We don't use `@astrojs/sitemap` —
its `build:done` hook in v3.7.3 crashes against Astro 4.16.)

---

## Content pillars

Articles in the Insights hub are organized into five pillars (defined in
`src/data/insights.ts`):

1. **Reporting Trust** — why dashboards lose trust and how to rebuild it
2. **KPI Definitions** — metric ownership, dictionaries, conflict resolution
3. **Dashboard Modernization** — design, perception, what belongs on a dashboard
4. **Governance & Strategy** — practical governance, data strategy
5. **AI Readiness** — why trusted metrics precede AI

Plus **Field Studies** — original data analysis (wage inequality, productivity–pay
gap, corporate profits & inflation). Field studies cite primary sources (BEA, EPI, SSA).

---

## Conventions

- **Headers** use Newsreader; body/UI uses DM Sans; Abril Fatface is reserved for the "aesop" wordmark and the æ moniker marks only (narrowed 2026-07).
- **The owl** is the logo. Do not reintroduce the æ ligature as a logo substitute (it's fine as a faint decorative background mark).
- **Pricing** must match the Operating Brief offer ladder. Flagship Assessment: `$5,000–$9,500` standard (reduced for nonprofit/referral/small-scope). Keep schema price ranges in sync with on-page prices.
- **No fabricated** testimonials, metrics, logos, or client results — ever. Case studies are anonymized.
- **Even-handed** on contested economic/political topics in field studies.

---

## Analytics & privacy

GA4 (`G-4TVCCT0XW9`) loads sitewide from `Seo.astro`. A plain-language privacy
disclosure lives at `/privacy` and is linked from every footer.

---

## Building & deploying

```bash
npm install        # first time
npm run dev        # local dev server
npm run check      # repo invariant checks only (scripts/check.mjs)
npm run build      # invariant checks + production build → dist/ (+ sitemap.xml)
```

A build that fails with `INVARIANT FAILURE` was stopped by `scripts/check.mjs`
— the rules it enforces are documented in `CLAUDE.md`.

To deploy: commit to a feature branch, merge to `main` (`--no-ff`), and push.
GitHub Actions builds the Astro site and publishes to GitHub Pages within a minute
or two. Verify live against the apex domain with a cache-buster (Cloudflare caches
HTML):

```bash
curl -sL "https://aesopanalytics.com/?v=$RANDOM" | grep -i "<title>"
```

---

## Project status

- **Infrastructure (GTM Sprint 0) — complete.** GA4, Search Console + Bing, SPF/DKIM/DMARC via SendGrid, Cloudflare security headers (A), custom sitemap, robots.txt, custom 404, `/privacy`, `/diagnostic` (Cal.com), Formspree contact → `/thanks`.
- **SEO Foundation (GTM Sprint 1) — complete.** Keyword map; keyword-tuned metadata across all pages; `ProfessionalService` + `BreadcrumbList` + `Service` + `OfferCatalog` structured data; `noindex` on utility pages; sitemap synced to noindex.
- **Next:**
  - **Testimonials & case-study refresh** — surface real (anonymized) client work, then add `Review`/`AggregateRating` schema.
  - **Google Business Profile** — Nashville, NAP-consistent.
  - Later GTM sprints per the roadmap.

> **Sprint numbering note:** commit-message "Sprint N" labels are dev-sprint
> numbers and do not map 1:1 to the GTM-roadmap sprint numbers above.

---

## Related

- **Canon** — positioning, services, pricing, voice, and the live plan are
  maintained in `../_OPS/` (TRUE_NORTH.md + PORTFOLIO.md + INITIATIVES/),
  version-controlled as the private `aesop-ops` repo. Notion is a mirror.
- **Repo:** `github.com/JDoreau/aesop.pro`

---

## Ecosystem position

> Part of the **Aesop Analytics ecosystem** — one business, several independent repos that connect into a whole. This component runs on its own, but it is one piece of that whole. Full map → [../ECOSYSTEM-MAP.md](../ECOSYSTEM-MAP.md).

**What this is:** Website (Aesop Propylaia) — the public aesopanalytics.com marketing and content site (static Astro) — the front door that explains the offering and captures inbound leads.

**Role:** Top-of-funnel lead generation and brand/content surface for Aesop Analytics. 40 statically-generated pages: offer ladder (services), flagship Reporting Clarity Assessment, a Pistis/platform teaser, 21 insights articles + field studies, and 4 interactive self-serve tools (notably the Dokimē front-door assessment — a standalone diagnostic *hosted on* Propylaia, not a sub-page of it, scored by the TRUST Index engine, "Aesop Krisis" — disambiguated 2026-07-02 from HUB's separately-built graph-computed engine, which keeps "Gnomon"; see HUB/docs/NAMES.md). It is where prospects discover the firm and convert into leads; it does not run engagements or hold a database itself.

**Repo:** github.com/JDoreau/aesop.pro (git remote origin: https://github.com/JDoreau/aesop.pro.git). NOTE: the repo is literally named aesop.pro but contains ONLY the WEBSITE — it is its own independent git repo, NOT a monorepo of the whole ecosystem. Canon (_OPS) is the separate private aesop-ops repo.

**State:** live.

**Runs independently:** Fully independent static Astro 4.16 site, no backend in-repo. `npm install` then `npm run dev` (astro dev) locally; `npm run build` runs scripts/check.mjs invariants then `astro build` → dist/ (+ a custom inline sitemap in astro.config.mjs). Deploys via GitHub Actions on push to main → GitHub Pages, fronted by Cloudflare (DNS/CDN/security headers), apex aesopanalytics.com (public/CNAME). Node pinned to 22. `npm run check` runs invariants standalone.

**Consumes (upstream):**
- Website visitors / prospects — no upstream CODE component feeds it. Contact-form free text + name/email/company.
- UTM params (utm_source/medium/campaign) read off tracked inbound links and persisted to sessionStorage for campaign attribution (contact.astro captureUtm).
- Health-check questionnaire answers (10 reporting areas) entered by visitors at /resources/health-check.
- Canon it CONFORMS to but does NOT import at build time: _OPS (pricing/offer ladder, voice, TRUST_INDEX.md spec). Human-synced references per CLAUDE.md, not a code dependency.

**Feeds (downstream):**
- LEADS via Formspree: contact form POSTs to https://formspree.io/f/mojzdqlk (delivers to hello@aesopanalytics.com, redirects to /thanks); trust-letter resource uses Formspree form xgobkdgd. Hidden utm_* fields ride along.
- BOOKINGS via Cal.com: /diagnostic embeds the Cal.com inline widget (event 'diagnostic') for the free diagnostic call — booking lives in Cal.com, not in-repo.
- HEALTH-CHECK PDF + Aesop-copy: health-check-app.js POSTs {email, scores, turnstileToken} to an external Cloudflare Worker MAILER_ENDPOINT (https://aesop-healthcheck-mailer.doreau-jonathan.workers.dev/email) which emails the visitor a branded PDF and sends Aesop the pre-data.
- GA4 (G-4TVCCT0XW9) loaded sitewide from Seo.astro; fires generate_lead on contact submit.
- Transactional email path uses SendGrid (SPF/DKIM/DMARC verified).

**Connections to other components:**
- **PLATFORM (the Operator)** — STRONGEST link, but by CONVENTION and HTTP contract, NOT a code import. (a) The TRUST-Index seam is a MANUAL area-id mirror, not a shared module. PLATFORM does not import `src/lib/trust-index.js` (a grep across `PLATFORM/src` + `PLATFORM/web` returns zero imports of it). What PLATFORM hand-mirrors is only the *area-id list*: `AREA_KEYS` in `PLATFORM/src/mailer/intake-forward.ts` mirrors the keys of this repo's `src/lib/trust-index-areas.js` so a forwarded Health Check lead lists the same reporting areas. The scoring MATH (`trust-index.js`) lives only here and is never re-imported — if the area ids change, that mirror must be updated by hand; there is no drift guard across the repo line. (b) src/lib/encode-roundtrip.test.mjs explicitly mirrors 'PLATFORM/src/mailer/index.ts renderPdf' base64 encode — the website tests that its health-check score encoding round-trips with PLATFORM's mailer Worker. (c) contact.astro comments state the intent that the UTM-tagged Formspree lead is read back by the platform intake (extractUtm) onto the opportunity, closing the post→lead attribution loop. The health-check forward IS wired on the PLATFORM side (`intake-forward.ts` best-effort POSTs the lead into the Operator's Formspree front door when `INTAKE_URL`/`INTAKE_TOKEN` are set). HONESTY: the plain contact-form path is still Form → Formspree → email; no webhook from THIS repo into PLATFORM was observed — the contact-form handoff is by email + described attribution, not an observed direct code wire in this repo.
- **External Cloudflare Worker 'aesop-healthcheck-mailer'** — health-check-app.js POSTs to it; a sibling service that lives outside this repo.
- **_OPS (canon)** — CLAUDE.md/README point to ../_OPS (TRUE_NORTH.md, PORTFOLIO.md, TRUST_INDEX.md, INITIATIVES, DONE_LOG) as the governing canon; trust-index.js cites _OPS/TRUST_INDEX.md as its spec. Cross-reference/governance link, not a code import.
- **DELIVERY-OS** — historical/handoff link: the former in-repo assessment-kit + xlsx templates were MOVED to the private DELIVERY-OS repo on 2026-06-12 (README + CUTOVER note); the website no longer ships delivery IP. No live data handoff observed today.
- **HUB / the product seal (now Pistis, formerly Imprimatur)** — referenced as marketing: /platform.astro + index/services tease the seal (the Manteia/HUB product, Portal+Agent). The "Imprimatur" name has been fully eliminated from `src/` and `public/` (verified 2026-07-10 — zero hits). The website MARKETS the product but has no code/data wire into HUB.

> When this component's wiring changes, update this section AND the matching row/seam in [../ECOSYSTEM-MAP.md](../ECOSYSTEM-MAP.md); mirror any topology change into `_OPS/HANDOFF/MASTER_TECHNICAL_HANDOFF.md`.

---

*Aesop Analytics LLC · Nashville, TN · Every dataset has a moral.*
