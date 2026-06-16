// Display metadata for the Health Check input (names, signal questions, scale labels).
// Scoring lives in trust-index.js; report content in trust-index-content.js. This file is
// only what the questionnaire SHOWS. Areas are grouped by TRUST pillar so the input teaches
// the method; 'ai' is a separate step (the readiness chip, not a pillar).

export const AREAS = {
  // T - Triage
  usage: { name: 'Dashboard Usage', low: 'Unused', high: 'Drives decisions',
    desc: 'Are your dashboards actually driving decisions, or artifacts of past effort?',
    qs: ['Leadership regularly uses dashboards to make specific, traceable decisions.',
      'We know which dashboards are actively used and which are rarely opened.',
      'Dashboards were designed around real decision needs, not around available data.'] },
  duplication: { name: 'Report Duplication', low: 'Rampant duplication', high: 'Clean & consolidated',
    desc: 'Is your reporting estate rationalized, or accumulating without governance?',
    qs: ['We maintain a current inventory of every dashboard and report.',
      'We could retire 20% of our reports today with no meaningful impact.',
      'Different reports covering the same metric consistently show the same number.'] },
  // R - Reconcile
  kpi: { name: 'KPI Definitions', low: 'Undefined', high: 'Defined & owned',
    desc: 'Are your key metrics documented, agreed upon, and consistently understood?',
    qs: ['Our most important KPIs have written definitions, not assumed ones.',
      'Finance, Sales, and Operations use the same definitions without debate.',
      'Every major KPI has a named individual responsible for its definition.'] },
  quality: { name: 'Data Quality', low: 'Frequent errors', high: 'Trusted & validated',
    desc: 'Are data quality issues caught before they reach leadership and erode trust?',
    qs: ['Monitoring catches data errors before reports are distributed.',
      'When an error is found in a distributed report, resolution is clear and fast.',
      'Known data quality issues are documented and tracked toward resolution.'] },
  // U - Unify
  ownership: { name: 'Report Ownership', low: 'Nobody owns it', high: 'Clear owners',
    desc: 'Does every report and dashboard have a clearly accountable, named owner?',
    qs: ['Every active report has a named individual responsible for its accuracy.',
      'There is a documented process for updating or retiring outdated reports.',
      'Users can tell which reports are official versus informal or experimental.'] },
  source: { name: 'Data Source Clarity', low: 'No source of truth', high: 'Single source of truth',
    desc: 'Does everyone know which system is authoritative for each critical domain?',
    qs: ['We have a documented source of truth for each critical data domain.',
      'When two systems disagree on a number, a clear rule decides which wins.',
      'A new analyst could learn in two days where authoritative data lives.'] },
  // S - Standardize
  governance: { name: 'Governance', low: 'No process', high: 'Governed',
    desc: 'Are there defined, functioning processes for managing reporting decisions?',
    qs: ['There is a formal intake process for new report requests.',
      'Changes to KPI definitions go through a documented approval process.',
      'One person has named, accountable ownership of the reporting operating model.'] },
  manual: { name: 'Manual Reporting Effort', low: 'All manual', high: 'Automated',
    desc: 'How much analyst time is consumed by spreadsheet work that could be automated?',
    qs: ['Analysts spend most of their time on analysis, not assembling reports.',
      'We can quantify the person-hours per week spent on manual reporting.',
      'The volume of manual reporting is stable or decreasing, not growing.'] },
  // X - Transition
  alignment: { name: 'Executive Decision Alignment', low: 'Misaligned', high: 'Fully aligned',
    desc: 'Do your reports match what leadership actually needs to decide?',
    qs: ["Leadership's recurring decisions are reliably supported by existing reports.",
      "Executives rarely ask for data the reporting environment can't quickly provide.",
      'Reporting was designed around how leadership decides, not around what was easy to build.'] },
  cadence: { name: 'Operating Cadence', low: 'No rhythm', high: 'Runs on a defined rhythm',
    desc: 'Does reporting run on a dependable schedule, or happen on request at the last minute?',
    qs: ['The key reports run on a standing schedule, not on ad-hoc request.',
      'The right numbers reach the right people on time without a scramble or a reminder.',
      "The cadence holds even when the person who usually runs it is busy or away."] },
  // AI - separate readiness chip (not a pillar)
  ai: { name: 'AI & Data Readiness', low: 'Not ready', high: 'AI-ready',
    desc: 'Is your data foundation documented and reliable enough to support AI tools?',
    qs: ['Metric definitions and sources are documented well enough to configure an AI tool.',
      'We can give an AI system a crisp, consistent definition of our critical terms.',
      'If an AI produced a surprising number, we know exactly who to call to investigate.'] },
};

// The five pillar steps (input grouped by TRUST pillar so the form teaches the method).
export const PILLAR_STEPS = [
  { pillar: 'T', label: 'Triage', title: 'Triage the reporting estate', blurb: 'What reporting do you have, and does it earn its keep?', areas: ['usage', 'duplication'] },
  { pillar: 'R', label: 'Reconcile', title: 'Reconcile the definitions', blurb: 'Do the numbers agree, and are they believed?', areas: ['kpi', 'quality'] },
  { pillar: 'U', label: 'Unify', title: 'Unify ownership & source of truth', blurb: 'Who owns each number, and which system is authoritative?', areas: ['ownership', 'source'] },
  { pillar: 'S', label: 'Standardize', title: 'Standardize the practice', blurb: 'Is there a process that keeps reporting trustworthy as it changes?', areas: ['governance', 'manual'] },
  { pillar: 'X', label: 'Transition', title: 'Transition to an operating cadence', blurb: 'Has reporting become how the org runs, sustainably?', areas: ['alignment', 'cadence'] },
];

// Final input step: AI readiness (separate chip).
export const AI_STEP = { label: 'AI Readiness', title: 'AI & data readiness', blurb: 'A separate read: could your data foundation support an AI tool? (Held out of the headline score.)', areas: ['ai'] };
