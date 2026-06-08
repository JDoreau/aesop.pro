# KPI Dictionary & Conflict Map

**Aesop Analytics · TRUST Method, Phase 2 (Reconcile)** Deliverables 3 (KPI Conflict Map) and the KPI Dictionary template. The dictionary captures how each metric is *actually* defined today; the conflict map flags where the same metric name means different things to different teams. Most "whose number is right" arguments live here.

**Client:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_  **Compiled by:** \_\_\_\_\_\_\_\_\_\_\_\_  **Date:** \_\_\_\_\_\_\_\_\_\_\_\_

---

## Part 1 — KPI Dictionary

One row per metric, capturing the *current* definition as it genuinely exists — not the ideal one. The job at this phase is to document reality, including its contradictions.

### Column definitions

| Column | What goes in it |
| :---- | :---- |
| **Metric** | The name as used (e.g. "Active Customers," "Net Revenue," "Occupancy Rate"). |
| **Used by** | Which teams/reports use this term (cross-ref inventory IDs). |
| **Definition (as found)** | Plain-language definition currently in use. If several exist, list each with who holds it. |
| **Formula / logic** | The actual calculation — SQL, DAX, spreadsheet logic, or described steps. |
| **Inclusions / exclusions** | What counts and what doesn't — this is where conflicts usually hide. |
| **Filters / scope** | Date ranges, segments, status filters applied. |
| **Source field(s)** | Which system/table/column it's computed from (cross-ref Source-of-Truth Map). |
| **Owner** | Who, if anyone, owns the definition. "None" is a finding. |
| **Caveats** | Known issues, edge cases, "don't trust this before the 5th of the month," etc. |

### Dictionary table

| Metric | Used by | Definition (as found) | Formula / logic | Inclusions / exclusions | Filters / scope | Source field(s) | Owner | Caveats |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
|  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |

---

## Part 2 — Conflict Map

For every metric where more than one definition exists, document the conflict here. This is the deliverable that most directly explains why leadership argues about numbers.

### Column definitions

| Column | What goes in it |
| :---- | :---- |
| **Metric** | The contested term. |
| **Definition A / who holds it** | First definition \+ the team/report/person using it. |
| **Definition B / who holds it** | Competing definition \+ who uses it. (Add C, D as needed.) |
| **The divergence** | The specific difference — what one includes that the other doesn't. |
| **Observed impact** | What this causes: which decisions, which arguments, what magnitude (quantify where possible — "\~8% gap in reported customer count"). |
| **Failure type** | Definition / ownership / source / adoption — usually definition \+ ownership. |
| **Recommended resolution** | The proposed single definition, and who should own it. Framed diplomatically. |

### Conflict table

| Metric | Definition A / who | Definition B / who | The divergence | Observed impact | Failure type | Recommended resolution |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |

---

## Working principles for the Reconcile phase

- **Capture before you correct.** Document every definition as found, including the wrong ones, before proposing the canonical version. The conflict *is* the finding.  
- **Quantify the divergence where you can.** "These differ" is weak; "these differ by \~8%, which is why the Q3 board number didn't match Finance's" is a finding leadership acts on.  
- **Frame conflicts diplomatically.** A conflict map can read as "Team X is wrong." It isn't — it's "these definitions evolved independently and were never reconciled." Keep it structural and blameless; that's what makes the recommended resolution adoptable.  
- **Not every conflict is material.** Flag which conflicts actually affect decisions versus which are harmless naming differences. Spend the client's attention on the ones that cost them.  
- **Owner-less metrics are the root cause.** A definition with no owner will re-diverge no matter how well you resolve it today. Every resolution should name a proposed owner — this is the bridge to the Unify phase and the Governance Gap Assessment.

**The line that lands:** "You don't have a data problem — you have five definitions of 'active customer' and no one who owns which one is correct." Reconcile is where you can prove that, specifically, with their own numbers.

---

*Aesop Analytics — Reporting Clarity Assessment delivery kit · Every dataset has a moral.*  
