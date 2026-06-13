// src/data/insights.ts
// Single source for the Insights hub: hero, pillar filter, featured card,
// pillar sections (rows), and sidebar. The hub page renders entirely from this,
// so adding/moving an article is a data edit — no markup changes.

// The pillar ids are a closed set — typos in a pillar would silently break
// the hub filter, so the union makes them a compile-time error instead.
export type Pillar =
  | "reporting-trust"
  | "kpi"
  | "modernization"
  | "governance"
  | "ai-readiness"
  | "field-study";

export interface Row {
  slug: string;   // route is /insights/<slug> — check.mjs enforces the file exists
  published: string; // ISO date. Derived from git history (first commit that added
                  // the article, legacy HTML or .astro). The repo only reaches back
                  // to 2026-06-07, so earlier true dates aren't provable — override
                  // here if a real earlier publication date is known. Feeds the
                  // Article JSON-LD datePublished and the byline via ArticleLayout.
  title: string;
  desc: string;
  pill: string;   // display label on the row. Deliberately finer-grained than the
                  // pillar (e.g. "Design"/"Modernization" within Dashboard Design);
                  // it is cosmetic only — filtering uses the section's pillar.
  time: string;
}
export interface Section {
  heading: string;
  pillar: Pillar; // data-pillar; rows inherit it for filtering (data-cat)
  rows: Row[];
}

export const hero = {
  eyebrow: "Insights",
  title: "Articles & field studies.",
  intro:
    "Practical writing on reporting trust, KPI definitions, dashboard design, data governance, and AI readiness — from fifteen years of applied analytics practice.",
};

// One id→label declaration; the filter buttons and the sidebar both derive
// from it (plus the All / Field Studies entries), so a renamed pillar is a
// one-line change.
const PILLAR_LABELS: Record<Exclude<Pillar, "field-study">, string> = {
  "reporting-trust": "Reporting Trust",
  "kpi": "KPI Definitions",
  "modernization": "Dashboard Design",
  "governance": "Governance & Strategy",
  "ai-readiness": "AI Readiness",
};
const BUTTON_LABELS: Partial<Record<Pillar, string>> = { governance: "Governance" }; // shorter label in the filter row

export const pillarButtons: { cat: Pillar | "all"; label: string }[] = [
  { cat: "all", label: "All" },
  ...(Object.keys(PILLAR_LABELS) as Exclude<Pillar, "field-study">[]).map((id) => ({
    cat: id as Pillar,
    label: BUTTON_LABELS[id] ?? PILLAR_LABELS[id],
  })),
  { cat: "field-study", label: "Field Studies" },
];

export const featured: { slug: string; published: string; cat: Pillar; tag: string; title: string; desc: string; read: string } = {
  slug: "productivity-pay-study",
  published: "2026-06-07",
  cat: "field-study",
  tag: "Field Study · Labor & the Economy",
  title: "The Productivity–Pay Gap: where did the middle class's gains go?",
  desc: "Productivity rose ~90% since 1979; typical pay rose ~33%. An honest look at what actually drives the divergence.",
  read: "Read the study →",
};

export const sections: Section[] = [
  {
    heading: "Pillar 1 — Reporting Trust",
    pillar: "reporting-trust",
    rows: [
      { slug: "who-finds-the-error", published: "2026-06-11", title: "Who finds the error matters more than the error", desc: "The same mistake costs minutes at the builder's desk and credibility in the boardroom. Data quality isn't a purity contest — it's a question of where errors get caught, and three capabilities decide the answer.", pill: "Reporting Trust", time: "6 min" },
      { slug: "why-reports-dont-match", published: "2026-06-11", title: "Why your reports don't match", desc: "Two reports, same metric, different numbers — and it's almost never a data error. The five real reasons reports disagree, and the decision that fixes it.", pill: "Reporting Trust", time: "6 min" },
      { slug: "dashboards-not-trusted", published: "2026-06-07", title: "Why your dashboards are not trusted even when the data is correct", desc: "Dashboard distrust is an ownership, definition, and process problem — not a data accuracy problem. The fix is different than you think.", pill: "Reporting Trust", time: "6 min" },
    ],
  },
  {
    heading: "Pillar 2 — KPI Definitions",
    pillar: "kpi",
    rows: [
      { slug: "kpi-dictionary", published: "2026-06-07", title: "How to build a KPI dictionary", desc: "What goes in it, how to structure it, and how to make it stick — including a complete example entry for MRR.", pill: "KPI Definitions", time: "7 min" },
      { slug: "kpi-owner", published: "2026-06-07", title: "Why every KPI needs an owner", desc: "Ownership is the missing link in reporting trust. A specific person, not a team. What it means — and how to assign it.", pill: "KPI Definitions", time: "5 min" },
      { slug: "hidden-cost-conflicting-kpis", published: "2026-06-07", title: "The hidden cost of conflicting KPIs", desc: "Most organizations know metric disagreements are a problem. Almost none have counted what they actually cost — the number is bigger than it looks.", pill: "KPI Definitions", time: "6 min" },
    ],
  },
  {
    heading: "Pillar 3 — Dashboard Design",
    pillar: "modernization",
    rows: [
      { slug: "manual-reporting-trap", published: "2026-06-11", title: "The manual reporting trap", desc: "Analysts spend their weeks assembling reports instead of analyzing them — and the cost is five costs, not one. How to measure the burden in a week, and why the fix order is retire, consolidate, then automate.", pill: "Modernization", time: "7 min" },
      { slug: "reporting-not-dashboard-redesign", published: "2026-06-07", title: "Reporting modernization is not a dashboard redesign", desc: "The dashboard is the last 10% of the problem. Most organizations start there — and wonder why the project didn't work.", pill: "Modernization", time: "7 min" },
      { slug: "what-belongs-on-a-dashboard", published: "2026-06-08", title: "What belongs on a dashboard", desc: "A dashboard is a claim about what matters, not a warehouse of everything available. A framework for deciding what earns a place on screen.", pill: "Design", time: "8 min" },
      { slug: "what-chart-to-choose", published: "2026-06-08", title: "How to choose the right chart", desc: "Chart choice is a question about the relationship in your data. A decision framework for the six relationships that show up in business dashboards — and the common choices that quietly fail.", pill: "Design", time: "9 min" },
      { slug: "dashboard-design-basics", published: "2026-06-07", title: "Dashboard design, the basics", desc: "Grid, spacing, hierarchy, typography, and color — the five principles that separate dashboards people use from ones they ignore.", pill: "Design", time: "6 min" },
      { slug: "gestalt-perception", published: "2026-06-07", title: "Gestalt & perception in dashboard design", desc: "Seven Gestalt principles, eye-scan patterns, and why the Invisible Gorilla experiment matters for layout.", pill: "Design", time: "7 min" },
    ],
  },
  {
    heading: "Pillar 4 — Data Governance & Strategy",
    pillar: "governance",
    rows: [
      { slug: "data-strategy", published: "2026-06-07", title: "Data strategy before data tools", desc: "Why the plan has to come before the platform — the seven components, the four questions, and where initiatives fail.", pill: "Governance", time: "7 min" },
      { slug: "design-thinking", published: "2026-06-07", title: "Design thinking in business intelligence", desc: "A four-phase method for when you know there's a better answer but aren't sure exactly what it is.", pill: "Process", time: "6 min" },
      { slug: "governance-operators", published: "2026-06-07", title: "Data governance for operators, not committees", desc: "A lightweight model that creates accountability without creating overhead — the five questions governance has to answer.", pill: "Governance", time: "7 min" },
    ],
  },
  {
    heading: "Pillar 5 — AI Readiness",
    pillar: "ai-readiness",
    rows: [
      { slug: "ai-readiness-trusted-metrics", published: "2026-06-07", title: "AI readiness starts with trusted metrics", desc: "AI doesn't fix reporting chaos. It inherits it — and makes it sound authoritative. The data foundation every AI initiative actually needs.", pill: "AI Readiness", time: "6 min" },
      { slug: "bad-reporting-blocks-ai", published: "2026-06-07", title: "Why bad reporting blocks AI adoption", desc: "Your AI initiative isn't blocked by the AI. It's blocked by fragmented sources, undefined metrics, and unowned KPIs — and a pre-flight checklist to fix it.", pill: "AI Readiness", time: "6 min" },
    ],
  },
  {
    heading: "Field Studies — Economics & Data",
    pillar: "field-study",
    rows: [
      { slug: "corporate-profits-inflation", published: "2026-06-07", title: "Did corporate profits drive post-COVID inflation?", desc: "Profits accounted for 54% of price growth vs. 11% historically. What the BEA data says — and what it doesn't.", pill: "Field Study", time: "8 min" },
      { slug: "wage-inequality-forty-years", published: "2026-06-08", title: "Forty years of wage inequality", desc: "Between 1979 and 2021 the top 0.1% of wages grew 465% while the bottom 90% grew 29%. What the aggregate average hides — using SSA earnings data.", pill: "Field Study", time: "9 min" },
    ],
  },
];

// The sidebar lists exactly the five numbered pillars (the Field Studies stream
// stays in the filter row above). Labels come from PILLAR_LABELS at the top;
// counts are derived from the sections, so they can never drift from the articles.
export const sidebarPillars: { label: string; cat: Pillar; count: number }[] =
  sections
    .filter((s) => s.pillar !== "field-study")
    .map((s) => ({ label: PILLAR_LABELS[s.pillar as Exclude<Pillar, "field-study">], cat: s.pillar, count: s.rows.length }));
