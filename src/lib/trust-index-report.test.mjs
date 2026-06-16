// Node test for the report selection engine. Run: node src/lib/trust-index-report.test.mjs
// Proves: every profile yields a COMPLETE report (no broken slots), and known shapes
// resolve to the expected band / archetype / lead / binding.
import { buildReport } from './trust-index-report.js';

let failed = 0;
function assert(name, cond, got) {
  if (cond) return;
  console.error('FAIL  ' + name + (got !== undefined ? '  (got: ' + JSON.stringify(got) + ')' : ''));
  failed++;
}

const REPORTING = ['usage', 'duplication', 'kpi', 'quality', 'ownership', 'source', 'governance', 'manual', 'alignment'];
const ALL = [...REPORTING, 'ai']; // cadence is gated until it ships, so omitted

function complete(input, label) {
  const r = buildReport(input);
  const provided = Object.keys(input).filter((k) => Number.isFinite(input[k]));
  // Always-present slots
  assert(label + ': band statement', r.bandStatement && r.bandStatement.body, r.bandStatement && r.bandStatement.id);
  assert(label + ': archetype', r.archetype && r.archetype.body, r.archetype && r.archetype.id);
  assert(label + ': conversion', r.conversion && r.conversion.body, r.conversion && r.conversion.id);
  assert(label + ': binding advice', r.bindingAdvice && r.bindingAdvice.body, r.binding);
  assert(label + ': half-gap read', r.halfGapRead && r.halfGapRead.body, r.halfGap);
  // AI read only when an ai score was provided
  if (input.ai != null) assert(label + ': AI read', r.aiRead && r.aiRead.body, r.aiChip);
  else assert(label + ': no AI read when ai absent', r.aiRead == null, r.aiRead && r.aiRead.id);
  // One read per present pillar (5 here) and one per provided area
  assert(label + ': 5 pillar reads resolved', r.pillarReads.length === 5 && r.pillarReads.every((x) => x.entry && x.entry.body), r.pillarReads.map((x) => x.entry && x.entry.id));
  assert(label + ': area reads match input + resolved', r.areaReads.length === provided.length && r.areaReads.every((x) => x.entry && x.entry.body), r.areaReads.map((x) => x.area + ':' + (x.entry && x.entry.id)));
  assert(label + ': index 0..100', r.index >= 0 && r.index <= 100, r.index);
  assert(label + ': profile payload', r.profile && r.profile.binding && typeof r.profile.index === 'number', r.profile);
  return r;
}

function areasFrom(map, fill) {
  const o = {};
  for (const k of ALL) o[k] = map[k] != null ? map[k] : fill;
  return o;
}

// 1) Uniform sweeps 1..10
for (let v = 1; v <= 10; v++) complete(areasFrom({}, v), 'uniform-' + v);

// 2) Each single area tanked (=1) with the rest healthy (=8)
for (const k of ALL) complete(areasFrom({ [k]: 1 }, 8), 'tank-' + k);

// 3) Each single pillar tanked (both its areas =1), rest =8
const PILLAR_AREAS = { T: ['usage', 'duplication'], R: ['kpi', 'quality'], U: ['ownership', 'source'], S: ['governance', 'manual'], X: ['alignment'] };
for (const [p, ks] of Object.entries(PILLAR_AREAS)) {
  const m = {}; ks.forEach((k) => (m[k] = 1));
  complete(areasFrom(m, 8), 'tankpillar-' + p);
}

// 4) Deterministic pseudo-random sweep (LCG) — 600 profiles, scores 1..10
let seed = 987654321;
function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
function rscore() { return 1 + Math.floor(rnd() * 10); }
for (let i = 0; i < 600; i++) {
  const o = {}; for (const k of ALL) o[k] = rscore();
  complete(o, 'rand-' + i);
}

// 5) Spot checks — worked example A (Clarity 100 / Operating 0)
const A = buildReport({ usage: 10, duplication: 10, kpi: 10, quality: 10, ownership: 10, source: 10, governance: 1, manual: 1, alignment: 1 });
assert('A: band critical', A.band === 'critical', A.band);
assert('A: archetype = trusted-but-ungoverned', A.archetype.id === 'arch:03-trusted-but-ungoverned', A.archetype.id);
assert('A: lead = trusted_ungoverned', A.leadPattern && A.leadPattern.id === 'trusted_ungoverned', A.leadPattern && A.leadPattern.id);
assert('A: binding is an operating pillar', A.binding === 'S' || A.binding === 'X', A.binding);

// Worked example B (no ai score)
const B = complete({ kpi: 8, source: 4, ownership: 3, usage: 7, manual: 5, quality: 6, governance: 2, alignment: 4, duplication: 7 }, 'B');
assert('B: band concern', B.band === 'concern', B.band);
assert('B: binding U', B.binding === 'U', B.binding);

// all-10 -> strong, healthy
const hi = buildReport(areasFrom({}, 10));
assert('all-10: band strong', hi.band === 'strong', hi.band);
assert('all-10: lead healthy', hi.leadPattern && hi.leadPattern.id === 'healthy', hi.leadPattern && hi.leadPattern.id);

// even-solid (all 7) -> stable, complete even if no notable pattern fires
const even = complete(areasFrom({}, 7), 'even-7');
assert('even-7: band stable', even.band === 'stable', even.band);

console.log(failed === 0 ? 'ALL PASS' : '\n' + failed + ' FAILED');
process.exit(failed === 0 ? 0 : 1);
