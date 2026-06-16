/**
 * extract-detachment-rules — deterministic PDF → detachment-rule filler.
 *
 * Each faction-pack detachment block is laid out as:
 *   [<DETACHMENT NAME>] (caps)  →  DETACHMENT RULE(S) (exact header)  →
 *   <RULE NAME> (caps)  →  <flavour sentence>  →  <rule text>  →
 *   ENHANCEMENTS / <DET> STRATAGEM markers …
 * The first "<DET> STRATAGEM" marker after a rule header identifies the
 * detachment (uniform for the first block, which omits the name header, and
 * every later block). End-of-pack "… Detachment Rule Change to:" errata use a
 * mixed-case line and live after DATASHEETS, so we stop at the first DATASHEETS
 * header and only honour exact "DETACHMENT RULE(S)" headers.
 *
 * Unlike extract-pack-store (store-only, IP-firewalled), a detachment rule has
 * NO existing core link or enrichment entity, so filling one is a 3-way write:
 *   - data/core/<f>/detachments.json : detachment_rule_id (or _ids if >1)
 *   - data/enrichment/<f>/abilities.json : an [APPROX] DSL stub (no prose)
 *   - <store>/<f>.json : raw_text (prose lands ONLY here)
 * Canonical id = `<rule-name-slug>-<detachment-slug>`.
 *
 * Fill-only: detachments that already carry a rule are left untouched. The
 * completeness gate reports any core detachment left ruleless after the run.
 *
 * Usage:
 *   npx tsx tools/src/extract-detachment-rules.ts <pdf> --faction <id> [--store <dir>] [--dry-run]
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
// restrict which core detachment ids may be filled (comma-separated). Useful when
// only a few specific new-11e detachments should be taken from a pack.
const ONLY = new Set((flag("--only") ?? "").split(",").map((s) => s.trim()).filter(Boolean));
if (!PDF || !FACTION) { console.error("usage: extract-detachment-rules <pdf> --faction <id> [--store <dir>] [--dry-run]"); process.exit(2); }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Json = any;
const clean = (s: string): string => decodeEntities(String(s)).replace(/\s+/g, " ").trim();
const lines = execFileSync("pdftotext", [resolve(REPO, PDF), "-"], { encoding: "utf-8", maxBuffer: 1 << 28 })
  .split("\n").map((l) => l.replace(/ /g, " ").trimEnd());

const RULE_HEADER = /^DETACHMENT RULES?$/i;
const STRAT_MARKER = /\sSTRATAGEM$/;
const TYPE_TAIL = /\s*[�–—-][\s�]*(BATTLE TACTIC|STRATEGIC PLOY|EPIC DEED|WARGEAR)$/i;
const detachmentOf = (line: string): string =>
  line.trim().replace(/\s+STRATAGEM$/i, "").replace(TYPE_TAIL, "").replace(/[\s�–—-]+$/, "").trim();
// rule body ends at a STANDALONE section header (not rule text that merely starts
// with the word "Enhancements"/etc.)
const BODY_END = /^(ENHANCEMENTS?|STRATAGEMS?|DATASHEETS?|LEGENDS|WARGEAR|KEYWORDS?|DETACHMENT RULES?)$/i;
const DATASHEETS = /^DATASHEETS?$/i;
// caps line; rule names may carry ! ? . & and punctuation
const isRuleName = (t: string): boolean =>
  /[A-Z]/.test(t) && t === t.toUpperCase() && /^[-A-Z0-9 ',()\/!?.&]+$/.test(t) && t.length > 2 && t.length < 60;
// a line that reads as the start of mechanical rule text (used, with the leading
// bullet signal, to drop the flavour sentence that precedes the rule)
const RULE_START = /^(Friendly|Models? |Each time|Once per|While |Add \d|Subtract|Improve|In your|At the (start|end)|You can|This (detachment|unit|model|army)|Designate|Whenever|If (a|an|your|you|this)|Units? |When |Enhancements |Select |Roll |Re-?roll|Your |Enemy |Ranged |Melee )/i;

interface Rule { detachment: string; name: string; text: string }
const rules: Rule[] = [];
const flavorOnly: string[] = [];

for (let i = 0; i < lines.length; i++) {
  if (DATASHEETS.test(lines[i].trim())) break; // errata/amendments live past here
  if (!RULE_HEADER.test(lines[i].trim())) continue;
  // rule name: nearest caps line below the header
  let ni = -1, name = "";
  for (let j = i + 1; j < lines.length && j < i + 5; j++) {
    const t = lines[j].trim();
    if (!t) continue;
    if (isRuleName(t)) { ni = j; name = clean(t); }
    break;
  }
  if (ni < 0) continue;
  // body: lines after the name until the next section / card. Keep the leading-
  // bullet signal (rule lines render with a leading space; flavour does not).
  const body: { t: string; bullet: boolean }[] = [];
  for (let j = ni + 1; j < lines.length && j < ni + 30; j++) {
    const t = lines[j].trim();
    if (!t) continue;
    if (BODY_END.test(t) || STRAT_MARKER.test(lines[j]) || isRuleName(t)) break;
    body.push({ t, bullet: /^[\s]/.test(lines[j]) });
  }
  // detachment: first "<DET> STRATAGEM" marker after this header
  let detachment = "";
  for (let j = i + 1; j < lines.length; j++) {
    if (STRAT_MARKER.test(lines[j]) && !/^STRATAGEMS?$/i.test(lines[j].trim())) { detachment = clean(detachmentOf(lines[j])); break; }
  }
  // rule text starts at the first bulleted OR rule-keyword line (drops flavour).
  // If none is found we have only flavour — skip and report rather than store it.
  const start = body.findIndex((b) => b.bullet || RULE_START.test(b.t));
  if (start < 0) { if (name && detachment) flavorOnly.push(`${name} (${detachment})`); continue; }
  const text = clean(body.slice(start).map((b) => b.t).join(" "));
  if (name && detachment && text.length > 10) rules.push({ detachment, name, text });
}

// --- match to core detachments (fill-only) ---
const detPath = join(REPO, "data/core", FACTION, "detachments.json");
const dets: Json[] = existsSync(detPath) ? JSON.parse(readFileSync(detPath, "utf-8")) : [];
const detBySlug = new Map<string, Json>();
for (const d of dets) { detBySlug.set(d.id, d); detBySlug.set(slug(d.name), d); }
const hasRule = (d: Json): boolean => !!(d.detachment_rule_id || (Array.isArray(d.detachment_rule_ids) && d.detachment_rule_ids.length));

// group extracted rules by resolved core detachment id
const byDet = new Map<string, Rule[]>();
const unmatched: string[] = [];
for (const r of rules) {
  const d = detBySlug.get(slug(r.detachment));
  if (!d) { unmatched.push(`${r.name} (${r.detachment})`); continue; }
  if (hasRule(d)) continue; // fill-only
  if (ONLY.size && !ONLY.has(d.id)) continue; // restricted to specific detachments
  if (!byDet.has(d.id)) byDet.set(d.id, []);
  byDet.get(d.id)!.push(r);
}

// --- 3-way write ---
const enrPath = join(REPO, "data/enrichment", FACTION, "abilities.json");
const enr: Json[] = existsSync(enrPath) ? JSON.parse(readFileSync(enrPath, "utf-8")) : [];
const enrIds = new Set(enr.map((a) => a.ability_id));
const storePath = join(STORE_ROOT, `${FACTION}.json`);
const store: Json[] = existsSync(storePath) ? JSON.parse(readFileSync(storePath, "utf-8")) : [];
const storeIds = new Set(store.map((e) => e.ability_id));
const GV = { edition: "11th", dataslate: "pre-launch-provisional" };
const ref = PDF.split(/[\\/]/).pop();
const titleCase = (s: string): string => s.replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\B\w/g, (c) => c.toLowerCase());

let filled = 0, abilitiesAdded = 0, storeAdded = 0;
for (const [detId, rs] of byDet) {
  const d = detBySlug.get(detId)!;
  const ids: string[] = [];
  for (const r of rs) {
    const id = slug(r.name); // bare id — matches the detachment-rule convention
    ids.push(id);
    if (!enrIds.has(id)) {
      enr.push({
        ability_id: id, name: r.name, authored_by: "40kdc-community", game_version: GV,
        version: "2025-q3", supersedes: null, unit_ids: [], faction_id: FACTION,
        detachment_id: detId, ability_type: "detachment", behavior: "passive",
        effect: { type: "stat-modifier", target: "unit", modifier: {} },
        scope: { range: "unit", duration: "permanent" },
        community_notes: "[APPROX] DSL stub — detachment rule; mechanics pending authoring. Full rule in raw-text store.",
      });
      enrIds.add(id); abilitiesAdded++;
    }
    if (!storeIds.has(id)) {
      store.push({
        ability_id: id, name: titleCase(r.name), faction_id: FACTION, unit_ids: [],
        ability_type: "detachment", game_version: GV,
        source: { kind: "pdf", edition: "11e", ref }, raw_text: r.text,
      });
      storeIds.add(id); storeAdded++;
    }
  }
  if (ids.length === 1) d.detachment_rule_id = ids[0];
  else d.detachment_rule_ids = ids;
  filled++;
}

// --- completeness gate ---
const ruleless = dets.filter((d) => !hasRule(d)).map((d) => d.id);

console.log(`${FACTION}: rules parsed=${rules.length} | detachments filled=${filled} (abilities +${abilitiesAdded}, store +${storeAdded}) | unmatched-rules=${unmatched.length}`);
if (unmatched.length) console.log("  unmatched:", unmatched.slice(0, 10).join(" | "));
if (flavorOnly.length) console.log("  flavour-only (skipped, no rule text found):", flavorOnly.slice(0, 10).join(" | "));
if (ruleless.length) console.log(`  ⚠ still ruleless (${ruleless.length}):`, ruleless.slice(0, 12).join(", ") + (ruleless.length > 12 ? ` … +${ruleless.length - 12}` : ""));

if (!DRY && (abilitiesAdded || storeAdded || filled)) {
  writeFileSync(detPath, JSON.stringify(dets, null, 2) + "\n");
  writeFileSync(enrPath, JSON.stringify(enr, null, 2) + "\n");
  if (!existsSync(STORE_ROOT)) mkdirSync(STORE_ROOT, { recursive: true });
  writeFileSync(storePath, JSON.stringify(store, null, 2) + "\n");
}
if (DRY) console.log("  (dry-run — nothing written)");
