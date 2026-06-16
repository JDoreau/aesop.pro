// ─────────────────────────────────────────────────────────────────────────
// The canonical TRUST Index scorer. Pure, deterministic, no DOM, no AI.
// Spec: _OPS/TRUST_INDEX.md (ratified 2026-06-15).
//
// One 0-100 score across the five TRUST pillars (Triage, Reconcile, Unify,
// Standardize, Transition), as the equal-weight mean of the pillar sub-scores
// BAND-GATED downward so a weak Operating half (S + Transition) or any broken
// pillar can never be masked by a strong Clarity half (T + R + U). The headline
// number and the five-bar breakdown always agree.
//
// This module is the source of truth for the math. The public self-check
// (resources/health-check.astro) runs the same logic; because that page uses an
// is:inline script (runtime DOM + global handlers) it cannot ES-import, so it
// carries a mirrored copy guarded by a check.mjs invariant on the constants
// below. The future operator console (PLATFORM) imports this module directly.
// ─────────────────────────────────────────────────────────────────────────

// The 9 reporting areas -> their TRUST pillar. The 10th public area, 'ai',
// is NOT a pillar (held out as a separate readiness chip, TRUE_NORTH Rule 3).
// 'exec' is the slider's id for the health-check's 'alignment' -> aliased below.
// 'cadence' is the new Transition input added per the ratified decision.
export const AREA_TO_PILLAR = {
  usage: 'T', duplication: 'T',
  kpi: 'R', quality: 'R',
  ownership: 'U', source: 'U',
  governance: 'S', manual: 'S',
  alignment: 'X', cadence: 'X',
};

export const PILLARS = ['T', 'R', 'U', 'S', 'X'];
export const CLARITY = ['T', 'R', 'U'];
export const OPERATING = ['S', 'X'];
export const PILLAR_LABEL = { T: 'Triage', R: 'Reconcile', U: 'Unify', S: 'Standardize', X: 'Transition' };

// Gate thresholds (ratified v1; version-pinned). Tune only deliberately.
export const GATE = { ANY_PILLAR_CRITICAL: 20, OP_MIN_CRITICAL: 25, OP_MIN_CONCERN: 50, ANY_PILLAR_STABLE_CAP: 40 };
export const BAND_CUTS = { critical: 30, concern: 55, stable: 75 }; // <= cut -> band
export const BAND_LABEL = { critical: 'Critical', concern: 'Concern', stable: 'Stable', strong: 'Strong' };

export function normPublic(s) { return ((s - 1) / 9) * 100; }   // 1-10 -> 0-100
export function normDelivery(d) { return ((d - 1) / 4) * 100; } // 1-5  -> 0-100

export function getBand(index) {
  return index <= BAND_CUTS.critical ? 'critical'
    : index <= BAND_CUTS.concern ? 'concern'
    : index <= BAND_CUTS.stable ? 'stable'
    : 'strong';
}

function mean(xs) { return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null; }

/**
 * Compute the TRUST Index from per-area scores.
 * @param {Object} rawAreas - area id -> score. Public mode: 1-10. 'exec' aliases 'alignment'.
 *   Percentage bridges (delivery U_owner% / X_cadence%) may be passed already on 0-100 via opts.preNormalized keys.
 * @param {Object} [opts] - { mode: 'public' | 'delivery' }
 * @returns full result (deterministic).
 */
export function computeTrustIndex(rawAreas, opts = {}) {
  const areas = { ...rawAreas };
  if (areas.exec != null && areas.alignment == null) areas.alignment = areas.exec; // canonical alias
  const norm = opts.mode === 'delivery' ? normDelivery : normPublic;

  // Per-pillar normalized inputs; NOT-CAPTURED (null/NaN) are dropped, never zero-filled.
  const inputs = { T: [], R: [], U: [], S: [], X: [] };
  for (const [area, pillar] of Object.entries(AREA_TO_PILLAR)) {
    const v = areas[area];
    if (v == null || Number.isNaN(v)) continue;
    inputs[pillar].push(norm(v));
  }

  // STEP 1: pillar sub-scores (mean of present inputs; null if the pillar has none)
  const sub = {};
  for (const p of PILLARS) sub[p] = mean(inputs[p]);

  // STEP 2: raw headline = equal-weight mean of present pillar sub-scores
  const present = PILLARS.filter((p) => sub[p] != null);
  const raw = present.length ? present.reduce((a, p) => a + sub[p], 0) / present.length : 0;

  // STEP 3: band-gate (downward only). Carry full precision; round only at the end.
  const opVals = OPERATING.filter((p) => sub[p] != null).map((p) => sub[p]);
  const opMin = opVals.length ? Math.min(...opVals) : null;
  const allVals = present.map((p) => sub[p]);
  const anyMin = allVals.length ? Math.min(...allVals) : null;
  let ceiling = 100;
  if ((opMin != null && opMin < GATE.OP_MIN_CRITICAL) || (anyMin != null && anyMin < GATE.ANY_PILLAR_CRITICAL)) ceiling = 30;
  else if (opMin != null && opMin < GATE.OP_MIN_CONCERN) ceiling = 55;
  else if (anyMin != null && anyMin < GATE.ANY_PILLAR_STABLE_CAP) ceiling = 75;

  // STEP 4: round only the final index + displayed sub-scores
  const index = Math.round(Math.min(raw, ceiling));

  // Binding constraint = lowest present pillar (tie broken by fixed order T,R,U,S,X)
  let binding = null, lo = Infinity;
  for (const p of PILLARS) if (sub[p] != null && sub[p] < lo) { lo = sub[p]; binding = p; }

  // Half means + half gap (Clarity lead reveals the "trusted data, immature program" profile)
  const clarityMean = mean(CLARITY.filter((p) => sub[p] != null).map((p) => sub[p]));
  const operatingMean = mean(OPERATING.filter((p) => sub[p] != null).map((p) => sub[p]));
  const halfGap = (clarityMean != null && operatingMean != null) ? clarityMean - operatingMean : null;

  // AI readiness chip: held out of the headline; capped at min(ai, R, U) so it
  // can never read higher than the definition/source foundations beneath it.
  let aiChip = null;
  if (areas.ai != null && !Number.isNaN(areas.ai)) {
    const caps = [norm(areas.ai)];
    if (sub.R != null) caps.push(sub.R);
    if (sub.U != null) caps.push(sub.U);
    aiChip = Math.round(Math.min(...caps));
  }

  const pillars = {};
  for (const p of PILLARS) pillars[p] = sub[p] == null ? null : Math.round(sub[p]);

  return {
    index,
    band: getBand(index),
    raw: Math.round(raw * 10) / 10,
    capped: index < Math.round(raw),
    ceiling,
    pillars,            // rounded 0-100 for display
    pillarsRaw: sub,    // full precision
    binding,
    bindingLabel: binding ? PILLAR_LABEL[binding] : null,
    clarityMean: clarityMean == null ? null : Math.round(clarityMean),
    operatingMean: operatingMean == null ? null : Math.round(operatingMean),
    halfGap: halfGap == null ? null : Math.round(halfGap),
    aiChip,
  };
}
