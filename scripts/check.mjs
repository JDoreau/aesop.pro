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
const BRAND_HEX = /#(?:0F1F38|C18C5D|FBFAF5|98673A|CE796B|5E9A82|D4A844|5A7090)\b/gi;
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
