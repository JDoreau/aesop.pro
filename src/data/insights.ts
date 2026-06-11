// src/data/insights.ts
// Single source for the Insights hub: hero, pillar filter, featured card,
// pillar sections (rows), and sidebar. The hub page renders entirely from this,
// so adding/moving an article is a data edit — no markup changes.

export interface Row {
  slug: string;   // route is /insights/<slug>
  cat: string;    // filter category (data-cat)
  title: string;
  desc: string;
  pill: string;   // pill label shown on the row
  time: string;
}
export interface Section {
  heading: string;
  pillar: string; // data-pillar
  rows: Row[];
}

export const hero = {
  eyebrow: "Insights",
  title: "Articles & field studies.",
  intro:
    "Practical writing on reporting trust, KPI definitions, dashboard design, data governance, and AI readiness — from fifteen years of applied analytics practice.",
};

export const pillarButtons: { cat: string; label: string }[] = [
  { cat: "all", label: "All" },
  { cat: "reporting-trust", label: "Reporting Trust" },
  { cat: "kpi", label: "KPI Definitions" },
  { cat: "modernization", label: "Dashboard Design" },
  { cat: "governance", label: "Governance" },
  { cat: "ai-readiness", label: "AI Readiness" },
  { cat: "field-study", label: "Field Studies" },
];

export const featured = {
  slug: "productivity-pay-study",
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
      { slug: "why-reports-dont-match", cat: "reporting-trust", title: "Why your reports don't match", desc: "Two reports, same metric, different numbers — and it's almost never a data error. The five real reasons reports disagree, and the decision that fixes it.", pill: "Reporting Trust", time: "6 min" },
      { slug: "dashboards-not-trusted", cat: "reporting-trust", title: "Why your dashboards are not trusted even when the data is correct", desc: "Dashboard distrust is an ownership, definition, and process problem — not a data accuracy problem. The fix is different than you think.", pill: "Reporting Trust", time: "6 min" },
    ],
  },
  {
    heading: "Pillar 2 — KPI Definitions",
    pillar: "kpi",
    rows: [
      { slug: "kpi-dictionary", cat: "kpi", title: "How to build a KPI dictionary", desc: "What goes in it, how to structure it, and how to make it stick — including a complete example entry for MRR.", pill: "KPI Definitions", time: "7 min" },
      { slug: "kpi-owner", cat: "kpi", title: "Why every KPI needs an owner", desc: "Ownership is the missing link in reporting trust. A specific person, not a team. What it means — and how to assign it.", pill: "KPI Definitions", time: "5 min" },
      { slug: "hidden-cost-conflicting-kpis", cat: "kpi", title: "The hidden cost of conflicting KPIs", desc: "Most organizations know metric disagreements are a problem. Almost none have counted what they actually cost — the number is bigger than it looks.", pill: "Reporting Trust", time: "6 min" },
    ],
  },
  {
    heading: "Pillar 3 — Dashboard Design",
    pillar: "modernization",
    rows: [
      { slug: "manual-reporting-trap", cat: "modernization", title: "The manual reporting trap", desc: "Analysts spend their weeks assembling reports instead of analyzing them — and the cost is five costs, not one. How to measure the burden in a week, and why the fix order is retire, consolidate, then automate.", pill: "Modernization", time: "7 min" },
      { slug: "reporting-not-dashboard-redesign", cat: "modernization", title: "Reporting modernization is not a dashboard redesign", desc: "The dashboard is the last 10% of the problem. Most organizations start there — and wonder why the project didn't work.", pill: "Modernization", time: "7 min" },
      { slug: "what-belongs-on-a-dashboard", cat: "modernization", title: "What belongs on a dashboard", desc: "A dashboard is a claim about what matters, not a warehouse of everything available. A framework for deciding what earns a place on screen.", pill: "Design", time: "8 min" },
      { slug: "what-chart-to-choose", cat: "modernization", title: "How to choose the right chart", desc: "Chart choice is a question about the relationship in your data. A decision framework for the six relationships that show up in business dashboards — and the common choices that quietly fail.", pill: "Design", time: "9 min" },
      { slug: "dashboard-design-basics", cat: "modernization", title: "Dashboard design, the basics", desc: "Grid, spacing, hierarchy, typography, and color — the five principles that separate dashboards people use from ones they ignore.", pill: "Design", time: "6 min" },
      { slug: "gestalt-perception", cat: "modernization", title: "Gestalt & perception in dashboard design", desc: "Seven Gestalt principles, eye-scan patterns, and why the Invisible Gorilla experiment matters for layout.", pill: "Design", time: "7 min" },
    ],
  },
  {
    heading: "Pillar 4 — Data Governance & Strategy",
    pillar: "governance",
    rows: [
      { slug: "data-strategy", cat: "governance", title: "Data strategy before data tools", desc: "Why the plan has to come before the platform — the seven components, the four questions, and where initiatives fail.", pill: "Governance", time: "7 min" },
      { slug: "design-thinking", cat: "governance", title: "Design thinking in business intelligence", desc: "A four-phase method for when you know there's a better answer but aren't sure exactly what it is.", pill: "Process", time: "6 min" },
      { slug: "governance-operators", cat: "governance", title: "Data governance for operators, not committees", desc: "A lightweight model that creates accountability without creating overhead — the five questions governance has to answer.", pill: "Governance", time: "7 min" },
    ],
  },
  {
    heading: "Pillar 5 — AI Readiness",
    pillar: "ai-readiness",
    rows: [
      { slug: "ai-readiness-trusted-metrics", cat: "ai-readiness", title: "AI readiness starts with trusted metrics", desc: "AI doesn't fix reporting chaos. It inherits it — and makes it sound authoritative. The data foundation every AI initiative actually needs.", pill: "AI Readiness", time: "6 min" },
      { slug: "bad-reporting-blocks-ai", cat: "ai-readiness", title: "Why bad reporting blocks AI adoption", desc: "Your AI initiative isn't blocked by the AI. It's blocked by fragmented sources, undefined metrics, and unowned KPIs — and a pre-flight checklist to fix it.", pill: "AI Readiness", time: "6 min" },
    ],
  },
  {
    heading: "Field Studies — Economics & Data",
    pillar: "field-study",
    rows: [
      { slug: "corporate-profits-inflation", cat: "field-study", title: "Did corporate profits drive post-COVID inflation?", desc: "Profits accounted for 54% of price growth vs. 11% historically. What the BEA data says — and what it doesn't.", pill: "Field Study", time: "8 min" },
      { slug: "wage-inequality-forty-years", cat: "field-study", title: "Forty years of wage inequality", desc: "Between 1979 and 2021 the top 0.1% of wages grew 465% while the bottom 90% grew 29%. What the aggregate average hides — using SSA earnings data.", pill: "Field Study", time: "9 min" },
    ],
  },
];

// The sidebar lists exactly the five numbered pillars (the Field Studies stream
// stays in the filter row above). Labels come from this map; counts are derived
// from the sections, so the numbers shown can never drift from the articles.
const PILLAR_LABELS: Record<string, string> = {
  "reporting-trust": "Reporting Trust",
  "kpi": "KPI Definitions",
  "modernization": "Dashboard Design",
  "governance": "Governance & Strategy",
  "ai-readiness": "AI Readiness",
};
export const sidebarPillars: { label: string; cat: string; count: number }[] =
  sections
    .filter((s) => s.pillar !== "field-study")
    .map((s) => ({ label: PILLAR_LABELS[s.pillar], cat: s.pillar, count: s.rows.length }));
