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
easy to version, no client-side framework. A little inline JS handles the nav
toggle and scroll reveals. The build is produced by GitHub Actions and published
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
| **Fonts** | Newsreader (headings & display accents) · DM Sans (body / UI) · Abril Fatface (wordmark + æ moniker only) |

## Brand

| Token | Value |
|---|---|
| Navy (primary) | `#0F1F38` |
| Twine (accent / links) | `#C18C5D` |
| Paper (background) | `#FBFAF5` |
| Ink (body text) | `#1B1B1B` |
| Max content width | 1080px |
| Logo | Owl mark — *not* the æ ligature |

Palette and type tokens live in `src/styles/tokens.css`. The full brand reference
page is at `/brand` (`public/brand/`).

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
│   ├── insights/           20 articles + field studies (via ArticleLayout)
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
│   ├── Wordmark.astro      The lockup (owl + aesop + ANALYTICS), all four variants
│   └── OwlMark.astro       The owl SVG, single-sourced (build-enforced)
│
├── data/
│   ├── nav.ts              Site IA, CTA, the `site` object, and canonicalUrl()
│   └── insights.ts         Insights hub content (pillars, articles, sidebar)
│
└── styles/
    ├── tokens.css          Brand palette + type tokens (single source)
    ├── base.css            Global base styles
    └── article.css         Article-specific styles

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

*Aesop Analytics LLC · Nashville, TN · Every dataset has a moral.*
