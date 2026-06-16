// Node test for the canonical TRUST Index scorer. Run: node src/lib/trust-index.test.mjs
// Verifies the spec's worked examples + edge cases (_OPS/TRUST_INDEX.md).
import { computeTrustIndex } from './trust-index.js';

let failed = 0;
function assert(name, cond, got) {
  if (cond) { console.log('  ok  ' + name); }
  else { console.error('FAIL  ' + name + (got !== undefined ? '  (got: ' + JSON.stringify(got) + ')' : '')); failed++; }
}

const allAreas = ['usage', 'duplication', 'kpi', 'quality', 'ownership', 'source', 'governance', 'manual', 'alignment', 'cadence'];
const uniform = (v) => Object.fromEntries(allAreas.map((k) => [k, v]));

// Worked example A: Clarity (T,R,U)=100, Operating (S,X)=0 -> the case Jonathan ruled out.
// A plain mean = 60 ("Stable"); the gate must force Critical 30.
const A = computeTrustIndex({ usage: 10, duplication: 10, kpi: 10, quality: 10, ownership: 10, source: 10, governance: 1, manual: 1, alignment: 1, cadence: 1 });
assert('A: index = 30 (gated, not the 60 mean)', A.index === 30, A.index);
assert('A: band = critical', A.band === 'critical', A.band);
assert('A: capped = true', A.capped === true, A.capped);
assert('A: binding constraint is an Operating pillar (S/X at 0)', A.binding === 'S' || A.binding === 'X', A.binding);
assert('A: clarity 100 / operating 0, halfGap = 100', A.clarityMean === 100 && A.operatingMean === 0 && A.halfGap === 100, [A.clarityMean, A.operatingMean, A.halfGap]);

// Worked example B: kpi8 source4 own3 use7 manual5 quality6 gov2 align4 dup7 (no cadence/ai).
// Per STEP 4 (carry full precision, round only the final), raw = 44.44 -> 44, band Concern, NOT capped
// (44.44 already < the 55 ceiling). NOTE: the spec prose says "45" but that rounded the sub-scores
// early, contrary to STEP 4 -- 44 is the deterministic answer. Flagging for the spec to correct.
const B = computeTrustIndex({ kpi: 8, source: 4, ownership: 3, usage: 7, manual: 5, quality: 6, governance: 2, alignment: 4, duplication: 7 });
assert('B: index = 44 (STEP 4: round only final)', B.index === 44, B.index);
assert('B: band = concern', B.band === 'concern', B.band);
assert('B: capped = false (raw already under the ceiling)', B.capped === false, B.capped);
assert('B: cadence absent -> X rests on alignment alone (X = 33)', B.pillars.X === 33, B.pillars.X);

// Edges
const hi = computeTrustIndex(uniform(10));
assert('all-10: index = 100, Strong', hi.index === 100 && hi.band === 'strong', [hi.index, hi.band]);
const lo = computeTrustIndex(uniform(1));
assert('all-1: index = 0, Critical', lo.index === 0 && lo.band === 'critical', [lo.index, lo.band]);

// Strong is unreachable while one pillar lags: all 10 except governance=1 (S half drops)
const spike = computeTrustIndex({ ...uniform(10), governance: 1, manual: 1 });
assert('spike: tall clarity cannot reach Strong (operating gated)', spike.band !== 'strong', spike.band);

// exec aliases alignment
const ex = computeTrustIndex({ usage: 5, duplication: 5, kpi: 5, quality: 5, ownership: 5, source: 5, governance: 5, manual: 5, exec: 5, cadence: 5 });
assert('exec alias feeds Transition (X present)', ex.pillars.X !== null, ex.pillars.X);

// AI chip held out + capped by R and U
const ai = computeTrustIndex({ usage: 8, duplication: 8, kpi: 2, quality: 2, ownership: 2, source: 2, governance: 8, manual: 8, alignment: 8, cadence: 8, ai: 10 });
assert('ai chip capped below its own 100 by weak R/U', ai.aiChip !== null && ai.aiChip < 100, ai.aiChip);

// NOT-CAPTURED dropped, not zero-filled: omit both U inputs -> U is null, index computed on 4 pillars
const partial = computeTrustIndex({ usage: 6, duplication: 6, kpi: 6, quality: 6, governance: 6, manual: 6, alignment: 6, cadence: 6 });
assert('missing U inputs -> U null (dropped, not 0)', partial.pillarsRaw.U === null, partial.pillarsRaw.U);

console.log(failed === 0 ? '\nALL PASS' : `\n${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
