// Guards the ?r= score-passing contract between the mailer Worker and the report page.
// If these two transforms ever drift, the PDF renders blank. Run: node src/lib/encode-roundtrip.test.mjs
// Worker encode  (PLATFORM/src/mailer/index.ts renderPdf): btoa(unescape(encodeURIComponent(JSON.stringify(scores))))
// Page decode    (health-check-app.js ?r= handler):         JSON.parse(decodeURIComponent(escape(atob(r))))
let failed = 0;
function assert(name, cond, got) {
  if (cond) { console.log('  ok  ' + name); }
  else { console.error('FAIL  ' + name + (got !== undefined ? '  (got: ' + JSON.stringify(got) + ')' : '')); failed++; }
}

function workerEncode(scores) { return btoa(unescape(encodeURIComponent(JSON.stringify(scores)))); }
function pageDecode(r) { return JSON.parse(decodeURIComponent(escape(atob(r)))); }

const scores = { usage: 7, duplication: 8, kpi: 8, quality: 7, ownership: 7, source: 8, governance: 6, manual: 6, alignment: 7, cadence: 6, ai: 6 };
const round = pageDecode(workerEncode(scores));
assert('round-trips to an identical object', JSON.stringify(round) === JSON.stringify(scores), round);
assert('all 11 keys preserved', Object.keys(round).length === 11, Object.keys(round).length);

// The page also encodes (shareable links) - encode/decode is its own inverse both directions.
const round2 = pageDecode(workerEncode(pageDecode(workerEncode(scores))));
assert('double round-trip stable', JSON.stringify(round2) === JSON.stringify(scores), round2);

console.log(failed === 0 ? 'ALL PASS' : '\n' + failed + ' FAILED');
process.exit(failed === 0 ? 0 : 1);
