# Reporting Clarity Assessment — Sample Deliverable

> **This is an anonymized sample.** It illustrates the structure, depth, and output of a
> real Reporting Clarity Assessment. The client is fictional ("Meridian Health Research")
> but the findings, conflicts, and recommendations reflect patterns Aesop sees repeatedly
> in mid-size healthcare and research organizations. Names, numbers, and systems are
> illustrative. *Every dataset has a moral.*

---

**Client:** Meridian Health Research Institute *(fictional)*
**Engagement:** Reporting Clarity Assessment
**Sector:** Clinical research operations / public-health grants
**Size:** ~280 employees · ~40 active research programs
**Duration:** 2.5 weeks · Fixed fee
**Prepared by:** Jonathan Doreau, Aesop Analytics
**Sponsor:** VP of Research Operations

---

## Executive summary

Meridian asked us to review its reporting environment after the board questioned two
conflicting enrollment numbers in the same quarterly meeting. What we found is common and
fixable: **Meridian does not have a data-quality problem — it has a definition and
ownership problem.** The underlying data is largely sound. The trouble is that the same
metrics are defined differently across Research Ops, Finance, and individual program
teams, almost no report has a named owner, and a large share of board-level reporting is
assembled by hand in spreadsheets each cycle.

Three findings drive most of the pain:

1. **"Active enrollment" is defined four different ways** across the institute, which is
   the direct cause of the board discrepancy that prompted this engagement.
2. **Of 34 recurring reports reviewed, 19 have no identifiable owner** — when something
   breaks or is questioned, no one is accountable for the answer.
3. **The monthly grant-status pack takes an estimated 22 person-hours to assemble**, almost
   all of it manual spreadsheet work that could be substantially reduced.

None of these require new software. The 30-day plan below is fully self-executable by
Meridian's team. The 60–90 day work — reconciling definitions and standing up lightweight
governance — is where outside help may be useful, and we flag honestly where it would and
would not add value.

---

## What we reviewed

| Scope | Detail |
|---|---|
| Reports & dashboards | 34 recurring reports across Power BI, Excel, and the grants system |
| Interviews | 5 — VP Research Ops (sponsor), 2 program analysts, Finance controller, a program director |
| Systems | Power BI, the grants management system (eRA-linked), Finance/ERP, REDCap enrollment data, shared SharePoint report library |
| Method | TRUST — Triage and Reconcile phases, with Unify-phase recommendations |

---

## Finding 1 — The "active enrollment" conflict

The trigger for this engagement. In the Q3 board meeting, Research Ops reported 1,247
active participants; a program director's slide showed 1,089. Both were "correct" — they
were measuring different things with the same words.

| Definition in use | Held by | What it counts |
|---|---|---|
| **A:** Consented & not withdrawn | Research Ops dashboard | Anyone who signed consent and hasn't formally withdrawn |
| **B:** Consented & had a visit in last 90 days | Program directors | "Active" = clinically active, recent contact |
| **C:** Enrolled in current funding period | Finance / grants | Tied to the grant reporting window |
| **D:** In REDCap with status = active | Program analysts | Whatever the source system flag says |

**The divergence:** Definition A (1,247) includes participants with no recent activity;
Definition B (1,089) excludes them. The ~13% gap is entirely explained by the 158
participants who are consented but haven't had a visit in 90+ days.

**Observed impact:** Beyond the board discrepancy, this surfaces in grant reporting, where
using the wrong definition risks misstating enrollment to funders — a compliance concern,
not just an internal one.

**Failure type:** Definition + ownership. No one owns the canonical definition of "active
enrollment," so four reasonable interpretations evolved independently.

**Recommended resolution:** Adopt a tiered definition — "consented," "clinically active
(90-day)," and "grant-period active" as three explicitly named metrics, never collapsed
into one ambiguous "active" number. Assign the Research Ops data lead as owner. This ends
the argument because everyone gets the number they actually need, clearly labeled.

---

## Finding 2 — Ownership gaps across the estate

Of 34 recurring reports, **19 have no identifiable owner.** When we asked "who owns this?"
in interviews, the answer was frequently "I think [name] built it, but they left" or "it
just kind of exists."

| Report tier | Count | Have a named owner | No clear owner |
|---|:--:|:--:|:--:|
| Board / executive | 6 | 4 | 2 |
| Program / operational | 18 | 9 | 9 |
| Finance / grant | 10 | 2 | 8 |

**Observed impact:** Ownership gaps are the root cause of the trust problem. A report with
no owner has no one to answer "is this right?", no one accountable when it breaks, and no
one authorized to approve a definition change. The Finance/grant tier is the most exposed —
8 of 10 reports there are effectively orphaned.

**Failure type:** Ownership. This is structural, not anyone's fault — ownership was never
formally assigned as people built reports to meet immediate needs.

**Recommended resolution:** Assign a business owner and a technical owner to every Tier-1
(board) and Tier-2 (operational) report within 30 days. The full ownership model is a
60-day item.

---

## Finding 3 — Manual reporting burden

The monthly grant-status pack — the single most important recurring deliverable to funders —
is assembled almost entirely by hand.

| Step | Current state | Est. time/month |
|---|---|:--:|
| Pull enrollment from REDCap | Manual export → Excel | 4 hrs |
| Reconcile against grants system | Manual VLOOKUP matching | 6 hrs |
| Pull spend from Finance/ERP | Manual export, reformatted | 3 hrs |
| Assemble pack & format | Copy-paste into template | 5 hrs |
| Review & fix discrepancies | Manual checking | 4 hrs |
| **Total** | | **~22 hrs/month** |

**Observed impact:** ~22 person-hours monthly (~264/year) on assembly rather than analysis.
Worse, the manual reconciliation in steps 2 and 5 is exactly where the enrollment-definition
conflict (Finding 1) introduces errors that then need hand-correction.

**Failure type:** Maintainability + the downstream cost of the definition problem.

**Recommended resolution:** Once "active enrollment" is defined (Finding 1), much of the
manual reconciliation disappears. Semi-automating the REDCap and ERP pulls is a 60–90 day
item that would likely recover the majority of these hours — a candidate for a Modernization
Sprint if Meridian wants help building it.

---

## Trust & Usage Scorecard (excerpt)

Scored 1–5 across five dimensions. Full scorecard for all 34 reports is in the appendix;
here are the six board-tier reports — the ones that matter most.

| Report | Business value | Trust | Maintainability | Duplication | Decision relevance | Total /25 | Flag |
|---|:--:|:--:|:--:|:--:|:--:|:--:|---|
| Quarterly Board Enrollment | 5 | 2 | 2 | 3 | 4 | 16 | **High value / low trust — priority** |
| Grant Status Pack | 5 | 3 | 1 | 4 | 5 | 18 | **Fragile — automate** |
| Program Performance Dashboard | 4 | 4 | 3 | 2 | 4 | 17 | Duplication to resolve |
| Enrollment Funnel (PBI) | 4 | 2 | 3 | 2 | 3 | 14 | **High value / low trust — priority** |
| Finance Burn-Rate | 5 | 4 | 3 | 4 | 5 | 21 | Protect & standardize |
| Recruitment Pipeline | 3 | 3 | 2 | 2 | 3 | 13 | Review |

**Reading the scores:** The two priority reports (Quarterly Board Enrollment, Enrollment
Funnel) are high-value but low-trust — exactly the enrollment-definition problem showing up
in the scores. The Grant Status Pack is trusted but dangerously fragile (maintainability 1).
The Finance Burn-Rate report is the model to protect and replicate.

---

## The 30/60/90-day roadmap

### First 30 days — quick wins (self-executable)

| Action | Impact | Effort | Owner | Risk if skipped |
|---|:--:|:--:|---|---|
| Adopt the 3-tier enrollment definition; publish it | High | S | Research Ops data lead | Board discrepancy recurs |
| Assign owners to all 6 board-tier reports | High | S | VP Research Ops | No accountability for key numbers |
| Document the source-of-truth for board enrollment | High | S | Research Ops data lead | Continued reconciliation errors |
| Retire 3 confirmed duplicate program reports | Med | S | Program analysts | Wasted effort, confusion |

### Days 31–60 — reconcile & standardize

| Action | Impact | Effort | Owner | Risk if skipped |
|---|:--:|:--:|---|---|
| Assign owners to all operational + grant reports | High | M | VP Research Ops | Orphaned reports persist |
| Build KPI dictionary for top 15 metrics | High | M | Research Ops data lead | Definitions re-diverge |
| Stand up a simple report-request intake | Med | M | Research Ops | Ad hoc sprawl continues |
| Semi-automate REDCap → grant pack pull | High | M | Analytics (or Sprint) | 22 hrs/month stays manual |

### Days 61–90 — govern & sustain

| Action | Impact | Effort | Owner | Risk if skipped |
|---|:--:|:--:|---|---|
| Establish monthly governance cadence | High | L | VP Research Ops | Standards decay without rhythm |
| Rebuild the Grant Status Pack as automated report | High | L | Sprint engagement | Fragility & funder risk remain |
| Define report certification process | Med | L | Research Ops | "Which report is official?" persists |

---

## Where this leads — our honest recommendation

Most of this plan, Meridian can execute itself. The 30-day items require no outside help,
and we'd encourage the team to own them — that's how the fixes stick.

Two items are genuine candidates for help, and we name them plainly:

- **Rebuilding the Grant Status Pack** as an automated report is a well-scoped **Modernization
  Sprint** (~4–6 weeks). The funder-facing risk and the 22-hour monthly burden justify it.
- **Standing up the governance cadence and certification process** could be supported by a
  **Governance Starter Kit** if Meridian wants structure faster than it can build alone.

Everything else — the definitions, the ownership assignments, the intake process — Meridian
should do in-house. We'd rather see those owned internally than billed. If the team wants a
single point of senior oversight while it works through the 60–90 day plan, a light
**Fractional Retainer** is an option, but it is not required for this plan to succeed.

> **The bottom line for the board:** Meridian's numbers can be trusted again within 30 days
> for the metrics that matter most, with no new software and no large project. The enrollment
> argument that started this engagement is resolved by naming three metrics clearly and
> giving them an owner.

---

*Sample deliverable · Aesop Analytics · Reporting Clarity Assessment · Every dataset has a moral.*
*Fictional client; illustrative findings. No real patient, participant, or organizational data is represented.*
