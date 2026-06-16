// ─────────────────────────────────────────────────────────────────────────
// The deterministic report SELECTION ENGINE. Pure, no DOM, no AI.
// Turns a score profile into the assembled "Reporting Trust Report" by choosing
// content entries from trust-index-content.js by deterministic rules. Spec:
// _OPS/TRUST_INDEX.md + the content library's authored `when` conditions.
//
// buildReport(areas) returns the full report model AND a compact `profile`
// payload that doubles as the lead pre-data (so an email opt-in can hand the
// pitch the visitor's self-assessed profile).
// ─────────────────────────────────────────────────────────────────────────
import { computeTrustIndex, normPublic, PILLARS, PILLAR_LABEL, CLARITY, OPERATING } from './trust-index.js';
import { CONTENT } from './trust-index-content.js';

// id -> entry maps per module (so selection is a lookup, not a scan)
const MAP = {};
for (const m of Object.keys(CONTENT)) {
  if (Array.isArray(CONTENT[m])) { MAP[m] = new Map(CONTENT[m].map((e) => [e.id, e])); }
}
function pick(module, id) { return (MAP[module] && MAP[module].get(id)) || null; }
function firstMatch(module, candidates) {
  for (const c of candidates) if (c.test) return pick(module, c.id);
  return null;
}

// Pattern rules: id + priority + predicate. Priorities match the content's authored `when`.
function patternRules(h) {
  const { aLo, aHi, pLo, pHi, pv, band, capped, CH, OH, gap, aiN, aiChip, countLow, countHigh, allPresentHigh, presentPillars } = h;
  const min = (...xs) => Math.min(...xs.filter((x) => x != null && Number.isFinite(x)));
  const RU = min(pv('R'), pv('U'));
  const operatingAhead = gap != null && gap <= -25 && OH != null && OH >= 60 && CH != null && CH < 40;
  return [
    { id: 'systemic', pri: 100, test: band === 'critical' && countLow >= 3 },
    { id: 'foundation', pri: 95, test: pLo('R') && pLo('U') && band === 'critical' },
    { id: 'foundations_cracked', pri: 94, test: pLo('R') && pLo('U') && band !== 'critical' },
    { id: 'conflicting', pri: 88, test: aLo('source') && aLo('duplication') },
    { id: 'accountability', pri: 85, test: aLo('ownership') && aLo('governance') },
    { id: 'exec_blind', pri: 84, test: aLo('alignment') && aLo('usage') },
    { id: 'manual_errors', pri: 80, test: aLo('manual') && aLo('quality') },
    { id: 'trusted_ungoverned', pri: 78, test: gap != null && gap >= 25 && CH >= 60 && OH < 40 },
    { id: 'operating_ahead', pri: 77, test: operatingAhead },
    { id: 'build_abandon', pri: 75, test: aLo('usage') && aLo('duplication') },
    { id: 'premature_ai', pri: 65, test: aiChip != null && aiChip < 40 && aiN != null && Number.isFinite(RU) && RU <= aiN },
    { id: 'fragile', pri: 60, test: pHi('R') && pHi('U') && pLo('S') },
    { id: 'last_mile', pri: 58, test: pHi('R') && (aLo('usage') || aLo('alignment')) },
    { id: 'binding_pillar', pri: 52, test: h.bindingPillarStable },
    { id: 'weak_link', pri: 50, test: countHigh >= 4 && countLow === 1 },
    { id: 'two_halves_split', pri: 48, test: pLo('X') && pv('S') != null && pv('S') >= 40 && h.clarityMin != null && h.clarityMin >= pv('X') },
    { id: 'source_split', pri: 47, test: (aHi('ownership') && aLo('source')) || (aHi('source') && aLo('ownership')) },
    { id: 'ai_overconfident', pri: 46, test: aHi('ai') && Number.isFinite(RU) && RU < 40 },
    { id: 'governance_ahead', pri: 45, test: aHi('governance') && (aLo('kpi') || aLo('source')) && !operatingAhead },
    { id: 'capped_band', pri: 44, test: capped === true },
    { id: 'balanced_mid', pri: 42, test: presentPillars.length > 0 && presentPillars.every((p) => pv(p) >= 40 && pv(p) < 65) },
    { id: 'mature_finishing', pri: 41, test: band === 'strong' && !allPresentHigh },
    { id: 'healthy', pri: 40, test: band === 'strong' && allPresentHigh },
  ];
}

function bandStatementId(h) {
  const { band, gap, binding, brokenCount, atLeast55Count, lowest, secondLowest } = h;
  if (band === 'critical') return firstMatch('bandStatements', [
    { id: 'band:critical:broken-pillar', test: (brokenCount === 1 || brokenCount === 2) && atLeast55Count >= 2 },
    { id: 'band:critical:operating-broken', test: gap != null && gap >= 25 },
    { id: 'band:critical:uniform', test: true },
  ]);
  if (band === 'concern') return firstMatch('bandStatements', [
    { id: 'band:concern:trusted-immature', test: gap != null && gap >= 25 },
    { id: 'band:concern:foundation-gap', test: (gap == null || gap < 25) && (binding === 'R' || binding === 'U') },
    { id: 'band:concern:operating-led', test: gap != null && gap <= -25 },
    { id: 'band:concern:mixed', test: true },
  ]);
  if (band === 'stable') return firstMatch('bandStatements', [
    { id: 'band:stable:bounded-gap', test: lowest != null && lowest < 50 && secondLowest != null && secondLowest >= 50 },
    { id: 'band:stable:even', test: true },
  ]);
  return firstMatch('bandStatements', [
    { id: 'band:strong:clarity-led', test: gap != null && gap > 0 && gap < 25 },
    { id: 'band:strong:mature', test: true },
  ]);
}

function archetypeId(h) {
  const { pv, pLo, pHi, gap, CH, binding, brokenCount, atLeast55Count, presentPillars, lowest, hasOutlier, anyBroken, allAtLeast75 } = h;
  return firstMatch('archetypes', [
    { id: 'arch:01-one-broken-pillar', test: brokenCount === 1 && atLeast55Count >= 4 },
    { id: 'arch:02-uniformly-early', test: presentPillars.length > 0 && presentPillars.every((p) => pv(p) < 40) },
    { id: 'arch:06-foundations-cracked', test: pLo('R') && pLo('U') && presentPillars.some((p) => pv(p) >= 40) },
    { id: 'arch:03-trusted-but-ungoverned', test: CH != null && CH >= 60 && gap != null && gap >= 25 },
    { id: 'arch:04-process-without-foundation', test: gap != null && gap <= -25 && (binding === 'T' || binding === 'R' || binding === 'U') },
    { id: 'arch:05-clarity-led-last-mile', test: pHi('T') && pHi('R') && pHi('U') && binding === 'X' && !pLo('S') },
    { id: 'arch:07-balanced-and-stable', test: !hasOutlier && !anyBroken && !allAtLeast75 },
    { id: 'arch:08-mature-and-governed', test: true },
  ]);
}

function aiReadId(h) {
  const { aiChip, aiN, pv, aHi } = h;
  if (aiChip == null) return null;
  const RU = Math.min(pv('R') ?? Infinity, pv('U') ?? Infinity);
  return firstMatch('aiReads', [
    { id: 'ai:premature', test: aiChip < 40 && aiN != null && RU < aiN },
    { id: 'ai:foundation-first', test: aiChip < 40 && aiN != null && aiN <= RU },
    { id: 'ai:developing', test: aiChip >= 40 && aiChip < 65 },
    { id: 'ai:ahead-of-itself', test: aHi('ai') && aiN != null && RU < aiN },
    { id: 'ai:ready', test: true },
  ]);
}

function conversionId(h) {
  const { band, gap, brokenCount, atLeast55Count } = h;
  if (band === 'critical') return firstMatch('conversion', [
    { id: 'cta:critical-broken-pillar', test: brokenCount === 1 && atLeast55Count >= 2 },
    { id: 'cta:critical', test: true },
  ]);
  if (band === 'concern') return firstMatch('conversion', [
    { id: 'cta:concern-trusted', test: gap != null && gap >= 25 },
    { id: 'cta:concern-general', test: true },
  ]);
  if (band === 'stable') return pick('conversion', 'cta:stable');
  return pick('conversion', 'cta:strong');
}

function pillarBandWord(v) { return v < 40 ? 'low' : v < 65 ? 'mid' : 'high'; }
function areaBandWord(s) { return s <= 3 ? 'low' : s <= 6 ? 'mid' : 'high'; }

export function buildReport(areas, opts = {}) {
  const result = computeTrustIndex(areas, opts);
  const P = result.pillars;
  const pv = (p) => P[p];
  const present = PILLARS.filter((p) => P[p] != null);
  const vals = present.map((p) => P[p]);
  const sorted = [...vals].sort((a, b) => a - b);
  const aVal = (k) => (Number.isFinite(areas[k]) ? areas[k] : null);

  const h = {
    pv, band: result.band, capped: result.capped,
    CH: result.clarityMean, OH: result.operatingMean, gap: result.halfGap,
    binding: result.binding,
    aiChip: result.aiChip, aiN: aVal('ai') != null ? normPublic(aVal('ai')) : null,
    aLo: (k) => aVal(k) != null && aVal(k) <= 3,
    aHi: (k) => aVal(k) != null && aVal(k) >= 7,
    pLo: (p) => P[p] != null && P[p] < 40,
    pHi: (p) => P[p] != null && P[p] >= 65,
    presentPillars: present,
    countLow: present.filter((p) => P[p] < 40).length,
    countHigh: present.filter((p) => P[p] >= 65).length,
    brokenCount: present.filter((p) => P[p] < 25).length,
    atLeast55Count: present.filter((p) => P[p] >= 55).length,
    allPresentHigh: present.length > 0 && present.every((p) => P[p] >= 65),
    allAtLeast75: present.length > 0 && present.every((p) => P[p] >= 75),
    anyBroken: present.some((p) => P[p] < 25),
    lowest: sorted[0] ?? null,
    secondLowest: sorted[1] ?? null,
    hasOutlier: sorted.length >= 2 && (sorted[1] - sorted[0]) >= 20,
    clarityMin: (() => { const cv = CLARITY.filter((p) => P[p] != null).map((p) => P[p]); return cv.length ? Math.min(...cv) : null; })(),
  };
  // binding_pillar pattern (Stable + a single clear laggard with healthy others)
  h.bindingPillarStable = result.band === 'stable' && sorted.length >= 2
    && sorted[0] < 50 && (sorted[1] - sorted[0]) >= 15
    && present.filter((p) => P[p] !== sorted[0]).every((p) => P[p] >= 50);

  // Patterns: fire all, sort by priority desc
  const fired = patternRules(h).filter((r) => r.test).sort((a, b) => b.pri - a.pri);
  const firedEntries = fired.map((r) => pick('patterns', r.id)).filter(Boolean);
  const leadPattern = firedEntries[0] || null;
  const secondaryPatterns = firedEntries.slice(1, 5);

  const pillarReads = present.map((p) => ({ pillar: p, label: PILLAR_LABEL[p], band: pillarBandWord(P[p]), entry: pick('pillarReads', `pillar:${p}:${pillarBandWord(P[p])}`) }));
  const areaOrder = ['usage', 'duplication', 'kpi', 'quality', 'ownership', 'source', 'governance', 'manual', 'alignment', 'cadence', 'ai'];
  const areaReads = areaOrder.filter((k) => aVal(k) != null).map((k) => ({ area: k, band: areaBandWord(aVal(k)), entry: pick('areaReads', `area:${k}:${areaBandWord(aVal(k))}`) }));

  const gapRead = result.halfGap == null ? null
    : result.halfGap >= 25 ? pick('halfGap', 'gap:clarity-led')
    : result.halfGap <= -25 ? pick('halfGap', 'gap:operating-led')
    : pick('halfGap', 'gap:balanced');

  const archetype = archetypeId(h);

  return {
    index: result.index, band: result.band, bandLabel: { critical: 'Critical', concern: 'Concern', stable: 'Stable', strong: 'Strong' }[result.band],
    raw: result.raw, capped: result.capped, ceiling: result.ceiling,
    pillars: present.map((p) => ({ id: p, label: PILLAR_LABEL[p], score: P[p], band: pillarBandWord(P[p]), half: CLARITY.includes(p) ? 'clarity' : 'operating' })),
    binding: result.binding, bindingLabel: result.bindingLabel,
    clarityMean: result.clarityMean, operatingMean: result.operatingMean, halfGap: result.halfGap,
    bandStatement: bandStatementId(h),
    leadPattern, secondaryPatterns,
    archetype,
    halfGapRead: gapRead,
    pillarReads, areaReads,
    bindingAdvice: result.binding ? pick('bindingAdvice', `bind:${result.binding}`) : null,
    aiChip: result.aiChip, aiRead: aiReadId(h),
    conversion: conversionId(h),
    // pre-data payload: the lead-intelligence summary (feeds the pitch on email opt-in)
    profile: {
      index: result.index, band: result.band,
      pillars: PILLARS.reduce((o, p) => { o[p] = P[p]; return o; }, {}),
      binding: result.binding, archetype: archetype && archetype.id,
      leadPattern: leadPattern && leadPattern.id, firedPatterns: firedEntries.map((e) => e.id),
      aiChip: result.aiChip,
    },
  };
}
