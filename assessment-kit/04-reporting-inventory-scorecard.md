# Reporting Inventory & Trust \+ Usage Scorecard

**Aesop Analytics · TRUST Method, Phase 1 (Triage)** Deliverables 1 & 2\. The inventory catalogs *what exists*; the scorecard rates *what matters*. They share rows — every report gets one line in the inventory and one set of scores. In practice this lives in a spreadsheet; this file is the spec, the column definitions, and the scoring rubric so every engagement scores consistently.

**Client:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_  **Compiled by:** \_\_\_\_\_\_\_\_\_\_\_\_  **Date:** \_\_\_\_\_\_\_\_\_\_\_\_

---

## Part 1 — Reporting Inventory

Every dashboard, recurring report, and load-bearing spreadsheet gets one row. Aim for *complete over perfect* — a row with three fields filled is better than an omitted report.

### Column definitions

| Column | What goes in it |
| :---- | :---- |
| **ID** | Short unique tag (e.g. FIN-01, OPS-03). Used to cross-reference in other deliverables. |
| **Report name** | What people actually call it, not the file name. |
| **Tool / location** | Power BI, Tableau, Excel \+ path, etc. |
| **Owner** | Who maintains it. "Unknown" is a finding, not a blank. |
| **Audience** | Who consumes it (role, not name). |
| **Cadence** | How often it refreshes / is produced (real-time, daily, weekly, monthly, ad hoc). |
| **Purpose / decision** | The decision it supports. If none can be named, flag it. |
| **Usage level** | Observed: heavy / moderate / light / unknown. From interviews \+ tool analytics. |
| **Manual?** | Is production manual, semi-manual, or automated? Cross-refs the Fragility Register. |
| **Notes** | Anything material — sensitivities, known issues, "everyone says this is wrong." |

### Inventory table

| ID | Report name | Tool / location | Owner | Audience | Cadence | Purpose / decision | Usage | Manual? | Notes |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
|  |  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |  |

---

## Part 2 — Trust & Usage Scorecard

Score each report (by ID) on five dimensions, 1–5. The scores turn a long inventory into a prioritized picture: what to trust, what to fix, what to retire.

### Scoring rubric

Score each dimension **1 (worst) to 5 (best)**. Definitions matter — score against these, not gut feel, so two engagements are comparable.

**Business value** — how much the report matters to a real decision.

- 1: No clear decision attached. · 3: Supports a routine operational decision. · 5: Drives a high-stakes leadership/board decision.

**Trust** — how much the audience believes the numbers.

- 1: Actively distrusted; people recompute it. · 3: Used but with caveats. · 5: Treated as authoritative without second-guessing.

**Maintainability** — how robustly it's produced.

- 1: Fragile, manual, one-person dependency, breaks often. · 3: Semi-automated, documented in part. · 5: Automated, documented, resilient if the builder leaves.

**Duplication** — whether it overlaps other reports (note: low score \= more duplication).

- 1: Multiple competing versions of this exact thing exist. · 3: Some overlap with other reports. · 5: Unique, no redundancy.

**Decision relevance** — whether what it shows matches what the decision needs.

- 1: Shows what's easy to measure, not what's needed. · 3: Mostly relevant, some noise. · 5: Tightly matched to the decision it serves.

### Scorecard table

| ID | Report name | Business value | Trust | Maintainability | Duplication | Decision relevance | Total /25 | Flag |
| :---- | :---- | :---: | :---: | :---: | :---: | :---: | :---: | :---- |
|  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |

### Reading the scores — the action quadrants

The combination of **Business value × Trust** is the heart of the engagement:

- **High value, low trust** → the priority. These are what the engagement exists to fix. A report that drives big decisions but isn't believed is the most expensive problem in the estate.  
- **High value, high trust** → protect and standardize. Document these so they stay reliable.  
- **Low value, low trust** → retirement candidates (feeds deliverable 9). Don't spend effort fixing what shouldn't exist.  
- **Low value, high trust** → harmless but low-priority; leave alone.

Low **Maintainability** anywhere → cross-reference the Manual Work & Fragility Register. Low **Duplication** scores (i.e. heavy overlap) → cross-reference Retirement/Consolidation Candidates.

**Use the scores to tell a story, not to rank-and-forget.** The readout should say "here are your three high-value, low-trust reports and why they're not trusted" — that framing lands with leadership far better than a spreadsheet of numbers.

---

## Compilation notes

- Pull usage data from BI tool analytics where available (view counts, last-accessed) to ground "usage level" in evidence, not just interview impressions.  
- When owner is genuinely unknown after interviews, that's a headline governance finding — log it and carry it to the Governance Gap Assessment.  
- Keep IDs stable; every other deliverable references them.

---

*Aesop Analytics — Reporting Clarity Assessment delivery kit · Every dataset has a moral.*  
