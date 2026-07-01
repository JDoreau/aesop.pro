# AESOP-COMPONENT: Website (Aesop Propylaia)

> Part of the **Aesop Analytics ecosystem** — one business, several independent repos that connect into a whole. This component runs on its own, but it is one piece of that whole. **Full map → [../ECOSYSTEM-MAP.md](../ECOSYSTEM-MAP.md)**

**What this is:** Website (Aesop Propylaia) — the public aesopanalytics.com marketing and content site (static Astro) — the front door that explains the offering and captures inbound leads.

**Role:** Top-of-funnel lead generation and brand/content surface for Aesop Analytics. 36 statically-generated pages: offer ladder (services), flagship Reporting Clarity Assessment, a Pistis/platform teaser, 20 insights articles + field studies, and 4 interactive self-serve tools (notably the Dokimē front-door assessment — a standalone diagnostic *hosted on* Propylaia, not a sub-page of it, scored by the TRUST Index engine, "Aesop Krisis" -- disambiguated 2026-07-02 from HUB's separately-built graph-computed engine, which keeps "Gnomon"; see HUB/docs/NAMES.md). It is where prospects discover the firm and convert into leads; it does not run engagements or hold a database itself.

**Repo:** github.com/JDoreau/aesop.pro (git remote origin: https://github.com/JDoreau/aesop.pro.git). NOTE: the repo is literally named aesop.pro but contains ONLY the WEBSITE — it is its own independent git repo, NOT a monorepo of the whole ecosystem. Canon (_OPS) is the separate private aesop-ops repo.  ·  **State:** live

**Runs independently:** Fully independent static Astro 4.16 site, no backend in-repo. `npm install` then `npm run dev` (astro dev) locally; `npm run build` runs scripts/check.mjs invariants then `astro build` -> dist/ (+ a custom inline sitemap in astro.config.mjs). Deploys via GitHub Actions on push to main -> GitHub Pages, fronted by Cloudflare (DNS/CDN/security headers), apex aesopanalytics.com (public/CNAME). Node pinned to 22. `npm run check` runs invariants standalone.

**Consumes (upstream):**
- Website visitors / prospects — no upstream CODE component feeds it. Contact-form free text + name/email/company.
- UTM params (utm_source/medium/campaign) read off tracked inbound links and persisted to sessionStorage for campaign attribution (contact.astro captureUtm).
- Health-check questionnaire answers (10 reporting areas) entered by visitors at /resources/health-check.
- Canon it CONFORMS to but does NOT import at build time: _OPS (pricing/offer ladder, voice, TRUST_INDEX.md spec). These are human-synced references per CLAUDE.md, not a code dependency.

**Feeds (downstream):**
- LEADS via Formspree: contact form POSTs to https://formspree.io/f/mojzdqlk (delivers to hello@aesopanalytics.com, redirects to /thanks); trust-letter resource uses Formspree form xgobkdgd. Hidden utm_* fields ride along.
- BOOKINGS via Cal.com: /diagnostic embeds the Cal.com inline widget (event 'diagnostic') for the free diagnostic call — booking lives in Cal.com, not in-repo.
- HEALTH-CHECK PDF + Aesop-copy: health-check-app.js POSTs {email, scores, turnstileToken} to an external Cloudflare Worker MAILER_ENDPOINT (https://aesop-healthcheck-mailer.doreau-jonathan.workers.dev/email) which emails the visitor a branded PDF and sends Aesop the pre-data.
- GA4 (G-4TVCCT0XW9) loaded sitewide from Seo.astro; fires generate_lead on contact submit — feeds Google Analytics, not a code component.
- Transactional email path uses SendGrid (SPF/DKIM/DMARC verified).

**Start here:** README.md + CLAUDE.md — what it is and the danger zones / invariants (read first). · src/pages/contact.astro — the lead form (Formspree action + UTM capture + submit handler); the primary lead exit. · src/lib/health-check-app.js — the TRUST-Index health-check UI + the MAILER_ENDPOINT POST to the external Cloudflare Worker. · src/lib/trust-index.js — the canonical TRUST Index scorer (spec _OPS/TRUST_INDEX.md); header explicitly says PLATFORM imports this module directly. · src/data/nav.ts + src/data/insights.ts + astro.config.mjs + scripts/check.mjs — site IA/helpers, content data source, build config, and the invariant guard.

**Connections to other components:**
- PLATFORM (the Operator) — STRONGEST link. (a) src/lib/trust-index.js header comment: 'The future operator console (PLATFORM) imports this module directly.' So the website's TRUST-Index scorer is the shared scoring source-of-truth with PLATFORM. (b) src/lib/encode-roundtrip.test.mjs explicitly mirrors 'PLATFORM/src/mailer/index.ts renderPdf' base64 encode — the website tests that its health-check score encoding round-trips with PLATFORM's mailer Worker. (c) contact.astro comments (lines 94, 201-202) state the intent that the UTM-tagged Formspree lead is read back by 'the platform intake (extractUtm) onto the opportunity, closing the post->lead attribution loop.' NOTE/HONESTY: the wired path is Form -> Formspree -> email; whether PLATFORM actually ingests Formspree submissions (webhook) is described as intent in comments but I saw NO webhook/endpoint to PLATFORM in this repo — the lead handoff to the Operator is by email + described attribution, not an observed direct code wire here.
- External Cloudflare Worker 'aesop-healthcheck-mailer' — health-check-app.js POSTs to it; this Worker is a sibling service (matches the aesop-healthcheck launch-state) but lives outside this repo.
- _OPS (canon) — CLAUDE.md/README point to ../_OPS (TRUE_NORTH.md, PORTFOLIO.md, TRUST_INDEX.md, INITIATIVES, DONE_LOG) as the governing canon; trust-index.js cites _OPS/TRUST_INDEX.md as its spec. Cross-reference/governance link, not a code import.
- DELIVERY-OS — historical/handoff link: the former in-repo assessment-kit + xlsx templates were MOVED to the private DELIVERY-OS repo on 2026-06-12 (README + CUTOVER note); the website no longer ships delivery IP. No live data handoff observed between WEBSITE and DELIVERY-OS today.
- HUB / the product seal (now **Pistis**, formerly *Imprimatur*) — referenced as marketing: /platform.astro + index/services tease the seal (the Manteia/HUB product, Portal+Agent). ⚠️ The live copy still uses the **retired name "Imprimatur"** (17 lines across index/platform/services) — rename to **Pistis** at the next content pass. The website MARKETS the product but has no code/data wire into HUB.

---
*`#aesop-ecosystem` — when this component's wiring changes, update this card AND the matching row/seam in [../ECOSYSTEM-MAP.md](../ECOSYSTEM-MAP.md); mirror any topology change into `_OPS/HANDOFF/MASTER_TECHNICAL_HANDOFF.md`.*
