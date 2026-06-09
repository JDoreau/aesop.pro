# Aesop Analytics — Website

The marketing and content site for **Aesop Analytics**, a boutique reporting
modernization and data-trust consultancy based in Nashville, TN.

**Live:** [aesopanalytics.com](https://aesopanalytics.com)
**Tagline:** *Every dataset has a moral.*

---

## What this is

A static HTML/CSS site — no build step, no framework, no JavaScript dependencies
beyond small inline scripts for nav and form handling. It's hosted on GitHub Pages
with a custom domain. The whole site is hand-authored HTML so it loads fast, is easy
to version, and has no toolchain to maintain.

## Tech & hosting

| | |
|---|---|
| **Stack** | Static HTML + CSS, minimal inline JS |
| **Hosting** | GitHub Pages |
| **Domain** | aesopanalytics.com (DNS via Squarespace) |
| **Email** | Google Workspace — `hello@aesopanalytics.com` |
| **Forms** | Formspree (contact, dashboard audit, Trust Letter signup) |
| **Fonts** | Newsreader (display/headers) · DM Sans (body) · Abril Fatface (sparing accent) |

## Brand

| Token | Value |
|---|---|
| Navy (primary) | `#0F1F38` |
| Twine (accent/links) | `#C18C5D` |
| Paper (background) | `#FBFAF5` |
| Ink (body text) | `#1B1B1B` |
| Max content width | 1080px |
| Logo | Owl mark (see `assets/`) — *not* the æ ligature |

Full brand reference lives in `brand.html`.

---

## Repository structure

```
/
├── index.html                  Homepage
├── services.html               Service offer ladder
├── assessment.html             Flagship: Reporting Clarity Assessment
├── work.html                   Case studies / portfolio
├── insights.html               Content hub (articles + field studies)
├── resources.html              Free resources (Reporting Trust Health Check)
├── about.html                  About / founder
├── contact.html                Contact + fit/no-fit
├── trust-letter.html           Newsletter signup (The Reporting Trust Letter)
├── brand.html                  Internal brand reference page
│
├── article-*.html              Content articles (5 pillars)
├── aesop-productivity-pay-study.html      Field study
├── article-corporate-profits-inflation.html   Field study
├── article-wage-inequality-forty-years.html    Field study
│
├── assets/                     Shared visual assets
│   ├── favicon.svg             Owl favicon (linked site-wide)
│   ├── owl-mark.svg            Standalone owl, light backgrounds
│   ├── owl-mark-reversed.svg   Standalone owl, dark backgrounds
│   └── README.md               Asset documentation
│
├── assessment-kit/             INTERNAL — delivery toolkit (not site content)
│   └── ...                     Intake, interview guides, templates, rubrics
│
├── sitemap.xml                 Search engine sitemap
└── robots.txt                  Crawler directives
```

> **Note on `assessment-kit/`:** this folder holds internal engagement-delivery
> documents (Markdown), not public web pages. It lives in the repo for version control.
> It is not linked from the site and not intended to be served as content.

---

## Content pillars

Articles in `insights.html` are organized into five pillars:

1. **Reporting Trust** — why dashboards lose trust and how to rebuild it
2. **KPI Definitions** — metric ownership, dictionaries, conflict resolution
3. **Dashboard Modernization** — design, perception, what belongs on a dashboard
4. **Governance & Strategy** — practical governance, data strategy
5. **AI Readiness** — why trusted metrics precede AI

Plus **Field Studies** — original data analysis (wage inequality, productivity–pay gap,
corporate profits & inflation) that demonstrate the firm's analytical rigor.

---

## Conventions

- **Every page** links the shared favicon: `<link rel="icon" type="image/svg+xml" href="assets/favicon.svg">`
- **Headers** use Newsreader; body uses DM Sans; Abril Fatface is reserved for article
  display titles, standout statistics, and decorative marks only.
- **The owl** is the logo. Do not reintroduce the æ ligature as a logo substitute.
- **Pricing** must match the Operating Brief offer ladder. Current flagship Assessment:
  $5,000–$9,500 standard (reduced rates for nonprofit/referral/small-scope).
- **No fabricated** testimonials, metrics, logos, or client results — ever.

---

## Analytics

Google Analytics (GA4, measurement ID `G-4TVCCT0XW9`) is loaded site-wide from
`src/components/Seo.astro` -- the single shared head fragment used by both
`BaseLayout` and `ArticleLayout`, so it covers every page. A plain-language
privacy disclosure lives at `/privacy` (`src/pages/privacy.astro`) and is linked
from the footer fine print.

---

## Deploying changes

1. Edit files locally.
2. In GitHub Desktop: review the changes, write a clear commit summary, **Commit to main**.
3. **Push origin.** GitHub Pages redeploys automatically within a minute or two.

To change the favicon site-wide, edit `assets/favicon.svg` only — every page references it.

---

## Related

- **Operating Brief** — the single source of truth for positioning, services, pricing,
  and voice. (Maintained separately; mirrored in Notion.)
- **Repo:** `github.com/JDoreau/aesop.pro`

---

*Aesop Analytics LLC · Nashville, TN · Every dataset has a moral.*
