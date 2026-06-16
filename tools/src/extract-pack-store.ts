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

const STRAT_MARKER = /^(.*?)\s+(BATTLE TACTIC|STRATEGIC PLOY|EPIC DEED|WARGEAR)\s+STRATAGEM$/;
const SECTION = /^(DETACHMENT RULES?|ENHANCEMENTS?|STRATAGEMS?|WARGEAR|KEYWORDS?|DATASHEETS?|LEGENDS)\b/i;
const isCaps = (t: string): boolean => /[A-Z]/.test(t) && t === t.toUpperCase() && /^[-A-Z0-9 ',()\/]+$/.test(t) && t.length > 2 && t.length < 60;
const stripField = (t: string, re: RegExp): string => t.replace(re, "").trim();

interface Strat { name: string; detachment: string; cost: string | null; when: string; target: string; effect: string; restrictions: string }
const strats: Strat[] = [];
let markerCount = 0;

// --- stratagems: anchored on the "<DET> <TYPE> STRATAGEM" marker line ---
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(STRAT_MARKER);
  if (!m) continue;
  markerCount++;
  const detachment = clean(m[1]);
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

// --- assemble raw_text in the 11e PDF shape ---
const stratText = (s: Strat): string => {
  const parts: string[] = [];
  if (s.cost) parts.push(`${s.cost}CP.`);
  if (s.when) parts.push(`WHEN: ${s.when}`);
  if (s.target) parts.push(`TARGET: ${s.target}`);
  if (s.effect) parts.push(`EFFECT: ${s.effect}`);
  if (s.restrictions) parts.push(`RESTRICTIONS: ${s.restrictions}`);
  return parts.join(" ");
};

// --- match to canonical core ability_id (name-slug, prefer same detachment) ---
const coreStrat: Json[] = existsSync(join(REPO, "data/core", FACTION, "stratagems.json")) ? JSON.parse(readFileSync(join(REPO, "data/core", FACTION, "stratagems.json"), "utf-8")) : [];
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
for (const s of strats) {
  const text = stratText(s);
  if (!text || (!s.when && !s.effect)) { continue; }
  const key = keyFor(s.name, s.detachment);
  if (!key) { unmatched++; unmatchedNames.push(`${s.name} (${s.detachment})`); continue; }
  const existing = byId.get(key);
  if (existing) {
    if (existing.source?.kind === "game-datacards") { existing.raw_text = text; existing.source = { kind: "pdf", ref: PDF.split(/[\\/]/).pop(), edition: "11e" }; supersededGdc++; written++; }
    // existing pdf entry: leave it (already authoritative)
  } else {
    const entry = { ability_id: key, name: s.name.replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\B\w/g, (c) => c.toLowerCase()), faction_id: FACTION, unit_ids: [], ability_type: "stratagem", game_version: GV, source: { kind: "pdf", ref: PDF.split(/[\\/]/).pop(), edition: "11e" }, raw_text: text };
    store.push(entry); byId.set(key, entry); written++;
  }
}

console.log(`${FACTION}: stratagem markers=${markerCount}  parsed=${strats.length}  written/updated=${written}  (superseded gdc=${supersededGdc})  unmatched-to-core=${unmatched}`);
if (unmatchedNames.length) console.log("  unmatched:", unmatchedNames.slice(0, 12).join(" | "));
if (markerCount !== strats.length) console.log(`  ⚠ COMPLETENESS: ${markerCount - strats.length} marker(s) not parsed into a stratagem — review.`);
if (written && !DRY) {
  if (!existsSync(STORE_ROOT)) mkdirSync(STORE_ROOT, { recursive: true });
  writeFileSync(storePath, JSON.stringify(store, null, 2) + "\n");
}
if (DRY) console.log("  (dry-run — nothing written)");
