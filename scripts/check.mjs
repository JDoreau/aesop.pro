// scripts/check.mjs — repo invariants, run before every build (local + CI).
// Enforces the rules documented in CLAUDE.md so drift fails the build
// instead of shipping. Keep checks fast and deterministic.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");
let failures = [];
let warnings = [];

function walk(dir, exts, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, exts, out);
    else if (exts.some((e) => p.endsWith(e))) out.push(p);
  }
  return out;
}
const files = walk(SRC, [".astro", ".css", ".ts", ".mjs", ".js"]);
const read = (p) => readFileSync(p, "utf-8");
const rel = (p) => relative(ROOT, p).replaceAll("\\", "/");

// Remove fenced EMBEDDED-DOC regions — embedded print documents are allowed
// ONLY inside fences (see CLAUDE.md → Danger zones #1).
function stripFenced(s) {
  return s.replace(
    /\/\* =+ EMBEDDED-DOC REGION: START =+[\s\S]*?EMBEDDED-DOC REGION: END =+ \*\//g,
    "/* [fenced region stripped for checks] */"
  );
}

// ── 1. Owl single-source: the path lives only in OwlMark.astro ──────────────
const OWL_SIG = "M38.27,123.78";
for (const f of files) {
  const s = stripFenced(read(f));
  if (s.includes(OWL_SIG) && !f.endsWith("OwlMark.astro")) {
    failures.push(`owl path duplicated outside OwlMark.astro: ${rel(f)} — use <OwlMark />`);
  }
}

// ── 2. One canonical Google Fonts URL across src/ ────────────────────────────
const fontUrls = new Set();
for (const f of files) {
  // Embedded print documents (fenced) import their own font set by design.
  for (const m of stripFenced(read(f)).matchAll(/fonts\.googleapis\.com\/css2\?[^"'\s)]+/g)) fontUrls.add(m[0]);
}
if (fontUrls.size > 1) {
  failures.push(`expected 1 canonical Google Fonts URL in src/, found ${fontUrls.size}:\n    ${[...fontUrls].join("\n    ")}`);
}

// ── 3. No embedded documents outside fences ──────────────────────────────────
// a) '</style>' inside a JS string literal is the corruption-prone pattern.
// b) per-file <style> open/close balance catches strays.
for (const f of files) {
  const s = stripFenced(read(f));
  if (/['"`]\s*<\/style>|<\/style>\s*['"`]\s*[+;,)]/.test(s)) {
    failures.push(`'</style>' inside a JS string outside an EMBEDDED-DOC fence: ${rel(f)}`);
  }
  if (f.endsWith(".astro")) {
    const opens = (s.match(/<style[\s>]/g) || []).length;
    const closes = (s.match(/<\/style>/g) || []).length;
    if (opens !== closes) failures.push(`unbalanced <style> tags (${opens} open / ${closes} close): ${rel(f)}`);
  }
}

// ── 4. Token discipline ──────────────────────────────────────────────────────
// tokens.css is the ONE place a colour or a font is declared (design.md locks the
// system; CLAUDE.md → Brand facts). Everything else reads var(--token). Since the
// Nov 2026 redesign the palette is OKLCH and the charts are tokenised too, so the
// old "hex list parsed from tokens.css" guard is replaced by three stricter ones:
//   a) no colour literal outside tokens.css: not in src/styles/*.css, not in a
//      page <style> block, not in a style="" attribute, not in an SVG fill/stroke;
//   b) no font-family literal outside tokens.css (and no font-family="" on SVG text);
//   c) every var(--token) that src/ reads is declared in tokens.css, or locally in
//      the same file (a component's own --wm-* style variables, for instance).
// Fenced EMBEDDED-DOC regions stay exempt (a print iframe cannot read the page's
// custom properties). color-mix() of tokens is fine; `none`, `transparent`,
// `currentColor` and `inherit` are not colours.
const tokenCss = read(join(SRC, "styles", "tokens.css"));
const declaredTokens = new Set([...tokenCss.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]));
const COLOR_LITERAL = /#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch|hwb)\(|\bcolor\(\s*(?:srgb|display-p3)/i;
const NAMED_COLOR = /(?:^|[\s:,(])(?:white|black)\b(?![-\w(])/i;
const styleContexts = (f, s) => {
  // returns [{ where, text }] for every place a colour or a face could be written
  if (f.endsWith(".css")) return [{ where: "css", text: s.replace(/\/\*[\s\S]*?\*\//g, "") }];
  const out = [];
  for (const m of s.matchAll(/<style[\s>][\s\S]*?<\/style>/g)) out.push({ where: "<style>", text: m[0].replace(/\/\*[\s\S]*?\*\//g, "") });
  for (const m of s.matchAll(/\sstyle\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) out.push({ where: "style attribute", text: m[1] ?? m[2] ?? "" });
  for (const m of s.matchAll(/\s(?:fill|stroke|stop-color|flood-color|lighting-color|color|bgcolor)\s*=\s*"([^"]*)"/g)) out.push({ where: "SVG/HTML colour attribute", text: m[1] });
  // colours handed to the DOM from an inline script: 'background:#abc', "…color: rgb(…)"
  for (const m of s.matchAll(/<script[\s>][\s\S]*?<\/script>/g)) for (const q of m[0].matchAll(/(['"`])#[0-9a-fA-F]{3,8}\1/g)) out.push({ where: "script colour string", text: q[0] });
  return out;
};
for (const f of files.filter((x) => (x.endsWith(".css") || x.endsWith(".astro")) && !x.endsWith("tokens.css"))) {
  const s = stripFenced(read(f));
  const hits = new Map();
  for (const ctx of styleContexts(f, s)) {
    if (COLOR_LITERAL.test(ctx.text) || NAMED_COLOR.test(ctx.text)) hits.set(`colour literal in ${ctx.where}`, (hits.get(`colour literal in ${ctx.where}`) || 0) + 1);
    for (const m of ctx.text.matchAll(/font-family\s*:\s*([^;}"']+)/g)) {
      if (!/^\s*(?:var\(--font-|inherit\b)/.test(m[1])) hits.set(`font-family literal in ${ctx.where}`, (hits.get(`font-family literal in ${ctx.where}`) || 0) + 1);
    }
    for (const m of ctx.text.matchAll(/\bfont\s*:\s*([^;}"']+)/g)) {
      if (!/var\(--font-|inherit\b/.test(m[1])) hits.set(`font shorthand without a --font token in ${ctx.where}`, (hits.get(`font shorthand without a --font token in ${ctx.where}`) || 0) + 1);
    }
  }
  if (f.endsWith(".astro")) {
    const n = (s.match(/\sfont-family\s*=\s*"/g) || []).length;
    if (n) hits.set('font-family="" attribute (delete it: the shared rule sets the face)', n);
  }
  for (const [what, n] of hits) failures.push(`${what} (${n}) in ${rel(f)} — use var(--token) from tokens.css`);
}
for (const f of files.filter((x) => x.endsWith(".js") || x.endsWith(".mjs") || x.endsWith(".ts"))) {
  if (f.endsWith(".test.mjs")) continue;
  const n = (stripFenced(read(f)).match(/(['"`])#[0-9a-fA-F]{6}\1|background\s*:\s*#[0-9a-fA-F]{3,8}|color\s*:\s*#[0-9a-fA-F]{3,8}/g) || []).length;
  if (n) failures.push(`colour literal in a script (${n}) in ${rel(f)} — assign a class or a var(--token) instead`);
}
for (const f of files.filter((x) => x.endsWith(".css") || x.endsWith(".astro") || x.endsWith(".js"))) {
  // comments may name a token as an example ("use var(--token)"): they are not code
  const s = stripFenced(read(f)).replace(/\/\*[\s\S]*?\*\//g, "").replace(/<!--[\s\S]*?-->/g, "").replace(/^\s*\/\/.*$/gm, "");
  const local = new Set([...s.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]));
  for (const m of s.matchAll(/setProperty\(\s*['"`](--[\w-]+)/g)) local.add(m[1]);
  const missing = new Set();
  for (const m of s.matchAll(/var\(\s*(--[\w-]+)/g)) if (!declaredTokens.has(m[1]) && !local.has(m[1])) missing.add(m[1]);
  if (missing.size) failures.push(`undeclared token(s) ${[...missing].join(", ")} in ${rel(f)} — declare in tokens.css or use an existing token`);
}

// ── 5. Wordmark optical-alignment guard ──────────────────────────────────────
// ANALYTICS is optically centred on the x-height of "aesop" from two MEASURED
// face ratios (the x-height of Abril Fatface, the cap height of Libre Franklin),
// which replaced the old per-variant pixel nudges in the Nov 2026 redesign. The
// ratios and the transform that uses them must survive refactors (CLAUDE.md →
// Brand facts): re-measure if a face changes, never remove them.
const wm = read(join(SRC, "components", "Wordmark.astro"));
const wmXh = Number((wm.match(/const WM_XH\s*=\s*([\d.]+)/) || [])[1]);
const wmCap = Number((wm.match(/const WM_CAP\s*=\s*([\d.]+)/) || [])[1]);
if (!(wmXh > 0.4 && wmXh < 0.6)) failures.push(`Wordmark.astro: measured x-height ratio WM_XH missing or implausible (${wmXh})`);
if (!(wmCap > 0.6 && wmCap < 0.85)) failures.push(`Wordmark.astro: measured cap-height ratio WM_CAP missing or implausible (${wmCap})`);
if (!/translateY\(calc\([^;]*--wm-cap[^;]*--wm-xh/.test(wm)) failures.push("Wordmark.astro: the optical-centring transform (translateY from --wm-cap and --wm-xh) is missing");
if (!/font-family:\s*var\(--font-wordmark\)/.test(wm)) failures.push('Wordmark.astro: "aesop" must be set in var(--font-wordmark)');

// ── 6. Insights data/page contract ───────────────────────────────────────────
// The hub renders entirely from insights.ts: every slug must have a page and
// every article page must have a data row, or the hub ships 404 links /
// invisible articles. Also: every row/section pillar must be a declared key.
const insightsTs = read(join(SRC, "data", "insights.ts"));
const dataSlugs = new Set([...insightsTs.matchAll(/slug:\s*["']([\w-]+)["']/g)].map((m) => m[1]));
const pageSlugs = new Set(
  readdirSync(join(SRC, "pages", "insights")).filter((f) => f.endsWith(".astro")).map((f) => f.replace(/\.astro$/, ""))
);
for (const s of dataSlugs) if (!pageSlugs.has(s)) failures.push(`insights.ts slug "${s}" has no src/pages/insights/${s}.astro — hub would link a 404`);
for (const s of pageSlugs) if (!dataSlugs.has(s)) failures.push(`src/pages/insights/${s}.astro has no row in insights.ts — article invisible from the hub`);
const pillarBlock = (insightsTs.match(/PILLAR_LABELS[\s\S]*?\{([\s\S]*?)\}/) || [, ""])[1];
const pillarKeys = new Set([...pillarBlock.matchAll(/["']([\w-]+)["']\s*:/g)].map((x) => x[1]));
if (pillarKeys.size) {
  for (const m of insightsTs.matchAll(/pillar:\s*["']([\w-]+)["']/g)) {
    if (!pillarKeys.has(m[1]) && m[1] !== "field-study") failures.push(`insights.ts pillar "${m[1]}" missing from PILLAR_LABELS — sidebar would render undefined`);
  }
}

// ── 7. Sitemap noindex sync ──────────────────────────────────────────────────
// astro.config.mjs's NOINDEX list must match the pages passing noindex={true},
// or a noindexed page lands in the sitemap (or an indexable one vanishes).
const configSrc = read(join(ROOT, "astro.config.mjs"));
const noindexList = (configSrc.match(/const NOINDEX = \[([^\]]*)\]/) || [, ""])[1]
  .split(",").map((s) => s.trim().replace(/["']/g, "")).filter(Boolean).sort();
const noindexPages = files
  .filter((f) => f.endsWith(".astro") && /noindex=\{true\}/.test(read(f)))
  .map((f) => rel(f).replace(/^src\/pages\//, "").replace(/\.astro$/, "").replace(/\/index$/, ""))
  .sort();
if (JSON.stringify(noindexList) !== JSON.stringify(noindexPages)) {
  failures.push(`noindex drift: astro.config.mjs NOINDEX [${noindexList}] != pages with noindex={true} [${noindexPages}]`);
}

// ── 8. Internal links use the trailing-slash form ────────────────────────────
// GitHub Pages 301s the slash-less route (/about → /about/), which is also the
// canonical + sitemap form. A literal href="/about" makes Google crawl a
// redirect from our own pages (GSC "Page with redirect"). Render link targets
// through linkHref() (nav.ts) or write the /slash/ form directly. Exempt: "/",
// files (a dot in the last path segment), #fragments/?queries on a slashed path,
// external/protocol-relative links, and fenced print docs. The nav.ts DATA stays
// slash-less by design (breadcrumb-matcher contract) — it uses `href:` not
// `href="`, so it is not matched here.
for (const f of files.filter((x) => x.endsWith(".astro"))) {
  const s = stripFenced(read(f));
  for (const m of s.matchAll(/href="(\/[^"]*)"/g)) {
    const href = m[1];
    if (href.startsWith("//") || href.includes("${")) continue;
    const path = href.split(/[?#]/)[0];
    if (path === "/" || path.endsWith("/")) continue;
    const last = path.slice(path.lastIndexOf("/") + 1);
    if (last.includes(".")) continue; // a file, not a route
    failures.push(`slash-less internal link href="${href}" in ${rel(f)} — use the trailing-slash form (linkHref() or /slash/)`);
  }
}

// ── 9. TRUST Index scorer constant integrity ─────────────────────────────────
// src/lib/trust-index.js is the SINGLE source for the scorer math — the public
// health-check imports it (via trust-index-report.js); there is no mirror copy.
// The constants are version-pinned (TRUST_INDEX.md §6, ratified 2026-06-15); a
// careless hand-edit would otherwise ship silently. Assert internal consistency.
try {
  const ti = await import("../src/lib/trust-index.js");
  const { AREA_TO_PILLAR, PILLARS, CLARITY, OPERATING, BAND_CUTS, GATE } = ti;
  for (const [area, p] of Object.entries(AREA_TO_PILLAR)) {
    if (!PILLARS.includes(p)) failures.push(`trust-index.js: area "${area}" maps to unknown pillar "${p}"`);
  }
  const halves = [...CLARITY, ...OPERATING].sort();
  if (JSON.stringify(halves) !== JSON.stringify([...PILLARS].sort()))
    failures.push(`trust-index.js: CLARITY+OPERATING [${halves}] do not partition PILLARS [${PILLARS}]`);
  const { critical, concern, stable } = BAND_CUTS;
  if (!(0 < critical && critical < concern && concern < stable && stable < 100))
    failures.push(`trust-index.js: BAND_CUTS not strictly ascending within (0,100): ${JSON.stringify(BAND_CUTS)}`);
  for (const k of ["ANY_PILLAR_CRITICAL", "OP_MIN_CRITICAL", "OP_MIN_CONCERN", "ANY_PILLAR_STABLE_CAP"]) {
    const v = GATE[k];
    if (typeof v !== "number" || !(v > 0 && v < 100)) failures.push(`trust-index.js: GATE.${k} missing or out of range: ${v}`);
  }
} catch (e) {
  failures.push(`trust-index.js: could not load scorer for the constant-integrity check — ${e.message}`);
}

// ── Report ───────────────────────────────────────────────────────────────────
if (warnings.length) {
  console.log(`check: ${warnings.length} warning(s) (non-blocking):`);
  for (const w of warnings) console.log("  ~ " + w);
}
if (failures.length) {
  console.error(`check: ${failures.length} INVARIANT FAILURE(S):`);
  for (const f of failures) console.error("  x " + f);
  process.exit(1);
}
console.log(`check: all invariants hold (${files.length} files scanned).`);
