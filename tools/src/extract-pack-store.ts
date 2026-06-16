/**
 * extract-pack-store — deterministic PDF → out-of-repo raw-text store for a
 * faction pack's stratagems and enhancements, capturing the FULL card prose
 * (cost + WHEN/TARGET/EFFECT/RESTRICTIONS for stratagems; the description for
 * enhancements) in the same shape as the 11e PDF ingest.
 *
 * Why this exists: the structure extractor (`extract-faction-pack.ts`) is
 * IP-firewalled — it captures names/metadata for data/core but never prose. The
 * model-built ingest manifest was the lossy step that silently dropped entities
 * (e.g. Custodes' Prioritised Eradication + the Moritoi enhancements). This tool
 * captures prose deterministically so nothing is missed.
 *
 * Completeness: every "<DETACHMENT> <TYPE> STRATAGEM" marker is an anchor; the
 * count of markers is the expected stratagem count. The tool reports any anchor
 * it could not turn into a store entry — that report IS the gate.
 *
 * IP posture: prose lands ONLY in the out-of-repo store (default ../40kdc-abilities),
 * never in this repo. Match to canonical ability_id via data/core entities
 * (name-slug + detachment), so store keys line up with the app's lookup.
 *
 * Precedence: writes with source.kind "pdf" (11e, verbatim) and OVERWRITES any
 * game-datacards 10e entry for the same id (pdf supersedes 10e); never touches a
 * different existing pdf entry unless --force.
 *
 * Usage:
 *   npx tsx tools/src/extract-pack-store.ts <pdf> --faction <id> [--store <dir>] [--dry-run]
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { slug, decodeEntities } from "./pack-blocks.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const REPO = resolve(__dirname, "../..");
const args = process.argv.slice(2);
const flag = (n: string): string | undefined => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
const PDF = args.find((a, i) => !a.startsWith("--") && !["--faction", "--store"].includes(args[i - 1]));
const FACTION = flag("--faction");
const STORE_ROOT = resolve(REPO, flag("--store") ?? "../40kdc-abilities");
const DRY = args.includes("--dry-run");
if (!PDF || !FACTION) { console.error("usage: extract-pack-store <pdf> --faction <id> [--store <dir>] [--dry-run]"); process.exit(2); }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Json = any;
const clean = (s: string): string => decodeEntities(String(s)).replace(/\s+/g, " ").trim();
// reading-order text (no -layout): linearizes the two-column cards.
const lines = execFileSync("pdftotext", [resolve(REPO, PDF), "-"], { encoding: "utf-8", maxBuffer: 1 << 28 })
  .split("\n").map((l) => l.replace(/ /g, " ").trimEnd());

// Subtitle under every stratagem card. Existing detachments print
// "<DET> – <TYPE> STRATAGEM"; NEW detachments print just "<DET> STRATAGEM"
// (no type word) — match both, then strip any trailing type tag + dash/mojibake.
const STRAT_MARKER = /\sSTRATAGEM$/;
const TYPE_TAIL = /\s*[�–—-][\s�]*(BATTLE TACTIC|STRATEGIC PLOY|EPIC DEED|WARGEAR)$/i;
const detachmentOf = (line: string): string =>
  line.trim().replace(/\s+STRATAGEM$/i, "").replace(TYPE_TAIL, "").replace(/[\s�–—-]+$/, "").trim();
const SECTION = /^(DETACHMENT RULES?|ENHANCEMENTS?|STRATAGEMS?|WARGEAR|KEYWORDS?|DATASHEETS?|LEGENDS)\b/i;
const isCaps = (t: string): boolean => /[A-Z]/.test(t) && t === t.toUpperCase() && /^[-A-Z0-9 ',()\/]+$/.test(t) && t.length > 2 && t.length < 60;
const stripField = (t: string, re: RegExp): string => t.replace(re, "").trim();

interface Strat { name: string; detachment: string; cost: string | null; when: string; target: string; effect: string; restrictions: string }
const strats: Strat[] = [];
let markerCount = 0;

// --- stratagems: anchored on the "<DET> <TYPE> STRATAGEM" marker line ---
for (let i = 0; i < lines.length; i++) {
  if (!STRAT_MARKER.test(lines[i]) || /^STRATAGEMS?$/i.test(lines[i].trim())) continue;
  markerCount++;
  const detachment = clean(detachmentOf(lines[i]));
  // name: nearest non-empty caps line above the marker (may carry "<NAME> NNCP" or NN CP)
  let name = "", cost: string | null = null;
  for (let j = i - 1; j >= 0 && j > i - 6; j--) {
    const t = lines[j].trim();
    if (!t) continue;
    const cpm = t.match(/^(.*?)\s*(\d+)\s?CP$/);
    const cand = cpm ? cpm[1].trim() : t;
    if (isCaps(cand)) { name = clean(cand); if (cpm) cost = cpm[2]; break; }
  }
  if (!name) continue;
  // body: collect lines after the marker until the next marker / section / next caps card name
  const body: string[] = [];
  for (let j = i + 1; j < lines.length && j < i + 30; j++) {
    const t = lines[j].trim();
    if (!t) continue;
    if (STRAT_MARKER.test(lines[j]) || SECTION.test(t)) break;
    if (isCaps(t.replace(/\s*\d+\s?CP$/, ""))) break; // next card's name
    body.push(t);
    if (/\bCP$/.test(t)) { /* possible next card cost line */ }
  }
  const blob = clean(body.join(" "));
  const grab = (label: RegExp, next: RegExp[]): string => {
    const mm = blob.match(label);
    if (!mm) return "";
    let rest = blob.slice(mm.index! + mm[0].length);
    let end = rest.length;
    for (const n of next) { const nm = rest.match(n); if (nm && nm.index! < end) end = nm.index!; }
    return clean(rest.slice(0, end));
  };
  const when = grab(/WHEN:/i, [/TARGET:/i, /EFFECT:/i, /RESTRICTIONS:/i]);
  const target = grab(/TARGET:/i, [/EFFECT:/i, /RESTRICTIONS:/i]);
  const effect = grab(/EFFECT:/i, [/RESTRICTIONS:/i]);
  const restrictions = grab(/RESTRICTIONS:/i, []);
  if (cost === null) { const cm = blob.match(/(\d+)\s?CP/); if (cm) cost = cm[1]; }
  strats.push({ name, detachment, cost, when, target, effect, restrictions });
}

// --- enhancements: under "ENHANCEMENTS" headers; name (strip " UPGRADE") + rule text
//     (a leading flavour paragraph is dropped when a rule-start line is found) ---
interface Enh { name: string; text: string }
const enhancements: Enh[] = [];
const RULE_START = /(unit only|model only|models only|Once per|Each time|While |Add \d|Subtract|Improve|In your|At the (start|end)|You can|This (unit|model)|Models in|Designate)/i;
const ehName = (t: string): string => t.replace(/\s+\d+\s?CP$/i, "").replace(/\s*UPGRADE$/i, "").trim();
let inEnh = false;
for (let i = 0; i < lines.length; i++) {
  const t = lines[i].trim();
  if (/^ENHANCEMENTS?$/i.test(t)) { inEnh = true; continue; }
  if (!inEnh) continue;
  if (STRAT_MARKER.test(lines[i]) || /^(DETACHMENT RULES?|STRATAGEMS?|DATASHEETS?|LEGENDS|WARGEAR)\b/i.test(t)) { inEnh = false; continue; }
  if (!isCaps(ehName(t))) continue;
  const name = clean(ehName(t));
  const body: string[] = [];
  for (let j = i + 1; j < lines.length && j < i + 12; j++) {
    const u = lines[j].trim();
    if (!u) continue;
    if (STRAT_MARKER.test(lines[j]) || /^(ENHANCEMENTS?|DETACHMENT RULES?|STRATAGEMS?)\b/i.test(u) || isCaps(ehName(u))) break;
    body.push(u);
  }
  let start = body.findIndex((l) => RULE_START.test(l));
  if (start < 0) start = 0;
  const text = clean(body.slice(start).join(" "));
  if (text.length > 10) enhancements.push({ name, text });
}

// --- match to canonical core ability_id (name-slug, prefer same detachment) ---
const coreStrat: Json[] = existsSync(join(REPO, "data/core", FACTION, "stratagems.json")) ? JSON.parse(readFileSync(join(REPO, "data/core", FACTION, "stratagems.json"), "utf-8")) : [];
const coreEnh: Json[] = existsSync(join(REPO, "data/core", FACTION, "enhancements.json")) ? JSON.parse(readFileSync(join(REPO, "data/core", FACTION, "enhancements.json"), "utf-8")) : [];
const normEnh = (s: string): string => slug(String(s).replace(/\s*upgrade\s*$/i, ""));
const enhKey = (name: string): string | null => { const ns = normEnh(name); const h = coreEnh.find((c) => normEnh(c.name) === ns); return h ? (h.ability_id ?? h.id) : null; };
const keyFor = (name: string, detachment: string): string | null => {
  const ns = slug(name), ds = slug(detachment);
  const byBoth = coreStrat.find((c) => slug(c.name) === ns && c.detachment_id === ds);
  const byName = coreStrat.find((c) => slug(c.name) === ns);
  const hit = byBoth ?? byName;
  return hit ? (hit.ability_id ?? hit.id) : null;
};

// --- write to store (fill-only; pdf supersedes game-datacards) ---
const storePath = join(STORE_ROOT, `${FACTION}.json`);
const store: Json[] = existsSync(storePath) ? JSON.parse(readFileSync(storePath, "utf-8")) : [];
const byId = new Map(store.map((e) => [e.ability_id, e]));
let written = 0, supersededGdc = 0, unmatched = 0; const unmatchedNames: string[] = [];
const GV = { edition: "11th", dataslate: "pre-launch-provisional" };
const ref = PDF.split(/[\\/]/).pop();
// canonical store shape: stratagems carry structured fields (no raw_text/cost).
const sections = (s: Strat): Json => { const o: Json = { when: s.when, target: s.target, effect: s.effect }; if (s.restrictions) o.restrictions = s.restrictions; return o; };
for (const s of strats) {
  if (!s.when && !s.effect) { continue; }
  const key = keyFor(s.name, s.detachment);
  if (!key) { unmatched++; unmatchedNames.push(`${s.name} (${s.detachment})`); continue; }
  const existing = byId.get(key);
  if (existing) {
    if (existing.source?.kind === "game-datacards") { delete existing.raw_text; Object.assign(existing, sections(s)); existing.source = { kind: "pdf", ref, edition: "11e" }; supersededGdc++; written++; }
    // existing pdf entry: leave it (already authoritative)
  } else {
    const entry = { ability_id: key, name: s.name.replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\B\w/g, (c) => c.toLowerCase()), faction_id: FACTION, unit_ids: [], ability_type: "stratagem", game_version: GV, source: { kind: "pdf", ref, edition: "11e" }, ...sections(s) };
    store.push(entry); byId.set(key, entry); written++;
  }
}

// --- write enhancements (fill-only; pdf supersedes game-datacards; single-prose raw_text) ---
let ehWritten = 0, ehSuperseded = 0, ehUnmatched = 0; const ehUnmatchedNames: string[] = [];
const titleCase = (s: string): string => s.replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\B\w/g, (c) => c.toLowerCase());
for (const e of enhancements) {
  const key = enhKey(e.name);
  if (!key) { ehUnmatched++; ehUnmatchedNames.push(e.name); continue; }
  const existing = byId.get(key);
  if (existing) {
    if (existing.source?.kind === "game-datacards") { existing.raw_text = e.text; existing.source = { kind: "pdf", ref, edition: "11e" }; ehSuperseded++; ehWritten++; }
  } else {
    const entry = { ability_id: key, name: titleCase(e.name), faction_id: FACTION, unit_ids: [], ability_type: "enhancement", game_version: GV, source: { kind: "pdf", ref, edition: "11e" }, raw_text: e.text };
    store.push(entry); byId.set(key, entry); ehWritten++;
  }
}

console.log(`${FACTION}: strat markers=${markerCount} parsed=${strats.length} written=${written}(gdc ${supersededGdc}) unmatched=${unmatched}  |  enh parsed=${enhancements.length} written=${ehWritten}(gdc ${ehSuperseded}) unmatched=${ehUnmatched}`);
if (unmatchedNames.length) console.log("  strat-unmatched:", unmatchedNames.slice(0, 10).join(" | "));
if (ehUnmatchedNames.length) console.log("  enh-unmatched:", ehUnmatchedNames.slice(0, 10).join(" | "));
if (markerCount !== strats.length) console.log(`  ⚠ COMPLETENESS: ${markerCount - strats.length} stratagem marker(s) not parsed — review.`);
if ((written || ehWritten) && !DRY) {
  if (!existsSync(STORE_ROOT)) mkdirSync(STORE_ROOT, { recursive: true });
  writeFileSync(storePath, JSON.stringify(store, null, 2) + "\n");
}
if (DRY) console.log("  (dry-run — nothing written)");
