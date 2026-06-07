# Aesop Analytics

> **Reporting modernization and data trust consulting.**  
> Helping growing companies turn messy, manual, and mistrusted reporting into governed decision systems.

**Live site:** [aesop.pro](https://aesop.pro) &nbsp;|&nbsp; **GitHub Pages:** [jdoreau.github.io/aesop.pro](https://jdoreau.github.io/aesop.pro)

---

## What this is

The public website for **Aesop Analytics**, a boutique consulting practice specializing in reporting modernization and data governance for companies with 50-500 employees.

The site serves two purposes:

- **Lead generation** -- flagship offer (Reporting Clarity Assessment), services, contact, and a free interactive diagnostic tool
- **Content platform** -- original articles and field studies demonstrating applied analytics expertise across five content pillars

---

## Stack

Pure static HTML/CSS -- no framework, no build step, no dependencies.

| Layer | Choice | Why |
|---|---|---|
| Markup | HTML5 | Straightforward, fast, universally hostable |
| Styling | CSS (external + inline) | Shared architecture with page-specific overrides |
| Typography | Abril Fatface + DM Sans (Google Fonts) | Display/body type pair -- editorial feel |
| Hosting | GitHub Pages | Free, fast, zero infrastructure |
| Version control | Git / GitHub | This repo |

---

## CSS Architecture

Three-file shared CSS system extracted from inline styles, eliminating ~2,500 lines of duplication across 23 pages.

```
shared.css    ->  CSS variables, reset, scroll-behavior, reveal animation
core.css      ->  Nav, mobile menu, footer, .btn variants, .wrap (1080px)
article.css   ->  Compact nav, article typography, article footer, .wrap (740px)
```

| Pages | Files loaded |
|---|---|
| index, work, services, assessment, resources, insights, about, contact, health-check | shared.css + core.css + page-specific style block |
| All 14 article and field study pages | shared.css + article.css + page-specific style block |

**Color tokens:**

```css
--navy: #0F1F38   --navy-2: #162A4A   --navy-3: #1E3555
--twine: #C18C5D  --sepia: #98673A    --contessa: #CE796B
--paper: #FBFAF5  --paper-2: #F3EFE6  --ink: #1B1B1B
```

---

## Site Structure

### Core pages (9)

| File | Purpose |
|---|---|
| index.html | Homepage -- pain section, TRUST method, offer ladder |
| work.html | Portfolio -- 4 anonymized case studies with SVG illustrations |
| services.html | Full offer ladder with deliverables and FAQ |
| assessment.html | Flagship conversion page -- 10 deliverables, 4-phase process |
| resources.html | Lead magnet landing page |
| health-check.html | Interactive Reporting Trust Health Check (scored quiz, 10 areas) |
| insights.html | Article hub with pillar filters and sidebar |
| about.html | Founder background, career arc, tools, philosophy |
| contact.html | Channels, process expectations, fit guide |

### Articles (12)

| File | Pillar | Topic |
|---|---|---|
| article-dashboards-not-trusted.html | Reporting Trust | Why correct data is not trusted |
| article-reporting-not-dashboard-redesign.html | Reporting Trust | Modernization is not a redesign |
| article-hidden-cost-conflicting-kpis.html | KPI Definitions | The hidden cost of conflicting KPIs |
| article-kpi-dictionary.html | KPI Definitions | How to build a KPI dictionary |
| article-kpi-owner.html | KPI Definitions | Why every KPI needs an owner |
| article-dashboard-design-basics.html | Dashboard Design | Five design fundamentals |
| article-gestalt-perception.html | Dashboard Design | Gestalt and perception in dashboards |
| article-governance-operators.html | Data Governance | Governance for operators, not committees |
| article-data-strategy.html | Data Governance | Data strategy before data tools |
| article-design-thinking.html | Data Governance | Design thinking in BI |
| article-ai-readiness-trusted-metrics.html | AI Readiness | AI readiness starts with trusted metrics |
| article-bad-reporting-blocks-ai.html | AI Readiness | Why bad reporting blocks AI adoption |

### Field studies (2)

| File | Dataset | Topic |
|---|---|---|
| aesop-productivity-pay-study.html | BEA NIPA | Productivity-pay gap since 1979 |
| article-corporate-profits-inflation.html | BEA NIPA Tables 1.15 + 6.16D | Corporate profits and post-COVID inflation |

---

## The TRUST Method

Aesop's signature reporting modernization framework -- referenced throughout the site and all client engagements.

| Letter | Phase | Description |
|---|---|---|
| **T** | Triage | Catalog every dashboard, spreadsheet, and report. Map owners, usage, and trust levels. |
| **R** | Reconcile | Identify conflicting KPI definitions across Finance, Sales, and Operations. |
| **U** | Unify | Assign metric owners, designate authoritative source systems per domain. |
| **S** | Standardize | Naming conventions, request intake, certification rules, report retirement. |
| **T** | Transition | Governance cadences, quality monitoring, continuous improvement. |

---

## Development Workflow

### Everyday changes

```bash
cd "C:/Users/dorea/OneDrive/Desktop/CODE/aesop.pro/WEBSITE"

git add .
git commit -m "Describe what changed"
git push
```

GitHub Pages auto-deploys on every push to main. Changes are live within ~60 seconds.

### Adding a new article

1. Copy an existing article as a template (article-kpi-owner.html is a clean example)
2. Update the title, meta description, h1, article content, and read-next links
3. Add the article to insights.html under the correct pillar section
4. Add the URL to sitemap.xml
5. Commit and push

### Modifying shared styles

Edit shared.css, core.css, or article.css -- changes propagate to all pages immediately.  
Do not move shared styles back into individual page style blocks.

---

## Content Pillars

| # | Pillar | Articles live |
|---|---|---|
| 1 | Reporting Trust | 3 |
| 2 | KPI Definitions | 3 |
| 3 | Dashboard Design and Modernization | 3 |
| 4 | Data Governance and Strategy | 3 |
| 5 | AI Readiness | 2 |
| -- | Field Studies | 2 |

---

## Roadmap

- [ ] Third field study -- wages and inequality (EPI + BEA data, research files ready)
- [ ] Tableau / Power BI portfolio showcase expansion
- [ ] KPI Dictionary downloadable template (promised on resources page)
- [ ] Reporting Inventory spreadsheet template
- [ ] Dashboard Audit checklist

---

## Author

**Jonathan Doreau** -- 15+ years in analytics and BI leadership across finance, healthcare/research (NIH), real estate, and nonprofit. Strengths: turning fragmented, distrusted data environments into reporting people rely on.

Nashville, TN | [doreau.jonathan@gmail.com](mailto:doreau.jonathan@gmail.com) | [LinkedIn](https://www.linkedin.com/in/jonathan-doreau-1a00b233/)

---

*Every dataset has a moral.*
