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
const files = walk(SRC, [".astro", ".css", ".ts", ".mjs"]);
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
// styles/*.css must use tokens (tokens.css itself defines them). Page <style>
// blocks get a warning count so drift is visible without blocking ships.
// The hex list is PARSED from tokens.css so it can never drift from the
// palette again (it used to be a hand-copied subset and missed real hits).
const tokenCss = read(join(SRC, "styles", "tokens.css"));
const tokenHexes = [...new Set([...tokenCss.matchAll(/--[\w-]+:\s*(#[0-9A-Fa-f]{6})\b/g)].map((m) => m[1].slice(1)))];
const BRAND_HEX = new RegExp(`#(?:${tokenHexes.join("|")})\\b`, "gi");
for (const f of files.filter((x) => x.includes("styles") && x.endsWith(".css"))) {
  if (f.endsWith("tokens.css")) continue;
  const hits = (read(f).match(BRAND_HEX) || []).length;
  if (hits) failures.push(`raw brand hex in ${rel(f)} (${hits}) — use var(--token)`);
}
let pageHexTotal = 0;
for (const f of files.filter((x) => x.endsWith(".astro"))) {
  const styles = stripFenced(read(f)).match(/<style[\s>][\s\S]*?<\/style>/g) || [];
  const hits = styles.join("").match(BRAND_HEX) || [];
  if (hits.length) { pageHexTotal += hits.length; warnings.push(`${hits.length} raw brand hex in <style> of ${rel(f)}`); }
}

// ── 5. Wordmark nudge guard ──────────────────────────────────────────────────
// The measured optical nudges must survive refactors (CLAUDE.md → Brand facts).
const wm = read(join(SRC, "components", "Wordmark.astro"));
for (const n of ["nudge: 3,", "nudge: 2.5,", "nudge: 2.75,"]) {
  if (!wm.includes(n)) failures.push(`Wordmark.astro missing measured nudge value "${n.trim()}"`);
}

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
console.log(`check: all invariants hold (${files.length} files scanned${pageHexTotal ? `, ${pageHexTotal} legacy hex warnings` : ""}).`);
