/**
 * One-shot repair: re-derive corrupt wargear-option `replaces` / `replacement` /
 * `replacement_choice` from the authoritative game-datacards 10e datasheet text,
 * using the (now fixed) option parser. Existing entity ids/unit_id/constraint/
 * is_free are preserved — only the weapon-list content is rewritten.
 *
 * Entities are matched to a game-datacards option by the *flattened set* of
 * replacement weapon ids, which survives the old parser's mis-grouping (a severed
 * "A and B" pair keeps the same weapons, just wrongly split). This avoids relying
 * on the corrupt `replaces`/grouping for matching.
 *
 * One-shot, kept as provenance for the data fix it produced (the usual
 * convert-faction.ts path needs army-assist, which was unavailable). The
 * durable fixes live in option-parser.ts / wargear-options.ts (so a future
 * regeneration is correct) and integrity.ts (so the corruption can't return).
 *
 * Source files are read from .gdc-cache/<faction-id>.json (gitignored). To
 * repopulate, download from game-datacards 10th/json, e.g.:
 *   curl -sL https://raw.githubusercontent.com/game-datacards/datasources/main/10th/json/<file>.json \
 *     -o .gdc-cache/<faction-id>.json
 * (faction→file map: adepta-sororitas→adeptasororitas, adeptus-astartes→space_marines
 *  plus _sm_<chapter> for chapter units, chaos-space-marines→chaos_spacemarines, …)
 *
 * Run with --apply to write; default is a dry-run report.
 *
 * Usage: npx tsx tools/src/repair-wargear-from-gdc.ts [--apply]
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseOption } from "./converters/option-parser.js";
import { nameToId } from "./converters/id-generator.js";

const REPO = resolve(fileURLToPath(new URL(".", import.meta.url)), "../..");
const APPLY = process.argv.includes("--apply");

const FACTIONS = [
  "adepta-sororitas", "adeptus-astartes", "adeptus-custodes", "adeptus-mechanicus",
  "aeldari", "agents-of-the-imperium", "astra-militarum", "chaos-knights",
  "chaos-space-marines", "drukhari", "grey-knights", "imperial-knights",
  "leagues-of-votann", "necrons", "orks", "tau-empire",
];

// Our generic `adeptus-astartes` holds chapter units (Wolf Scouts, Death
// Company, Deathwatch …) that game-datacards splits into per-chapter files.
const EXTRA_GDC: Record<string, string[]> = {
  "adeptus-astartes": [
    "_sm_blacktemplar", "_sm_bloodangels", "_sm_darkangels",
    "_sm_deathwatch", "_sm_spacewolves", "_sm_marines_leviathan",
  ],
};

interface Card { name?: string; wargear?: string[] }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function cards(j: any): Card[] {
  if (Array.isArray(j)) return j;
  return (j.datasheets as Card[]) ?? (Object.values(j).find((v) => Array.isArray(v)) as Card[]) ?? [];
}
const readJSON = (p: string) => JSON.parse(readFileSync(p, "utf-8"));

/** game-datacards lists each alternative on a "◦" bullet; gluing the bullet to
 * the next item's count reproduces the army-assist shape the parser expects. A
 * trailing "*" footnote sentence is dropped. */
function preprocess(s: string): string {
  return s
    .replace(/\s*\*.*$/s, "")        // drop trailing "*" footnote
    .replace(/\s*[◦•·]\s*/g, "")     // glue bulleted alternatives
    .replace(/\s*[\r\n]+\s*/g, "")   // glue newline-separated alternatives
    .trim();
}

// A prose qualifier the old parser captured as a fake item / wargear entity.
const BOGUS = /^options-|-you-cannot-|-not-allowed$|-the-same-option/;
const CORRUPT_ID = /-and$|-or$|^options-|-you-cannot-|-not-allowed$|-the-same-option/;

/** Data-internal repair for entities with no game-datacards match: strip dangling
 * "-and" by merging each such group with the following group; drop bogus items. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mergeChainFallback(e: any): void {
  const strip = (id: string) => id.replace(/-and$/, "");
  if (Array.isArray(e.replacement)) e.replacement = e.replacement.map(strip);
  if (Array.isArray(e.replaces)) e.replaces = e.replaces.map(strip);
  if (Array.isArray(e.replacement_choice)) {
    const groups: string[][] = e.replacement_choice
      .map((g: string[]) => g.filter((id) => !BOGUS.test(id)))
      .filter((g: string[]) => g.length > 0);
    const out: string[][] = [];
    for (let i = 0; i < groups.length; ) {
      const cur = [...groups[i]]; i++;
      while (cur.length && cur[cur.length - 1].endsWith("-and")) {
        cur[cur.length - 1] = cur[cur.length - 1].slice(0, -4);
        if (i < groups.length) { cur.push(...groups[i]); i++; } else break;
      }
      out.push(cur);
    }
    e.replacement_choice = out;
  }
}

let totalRewrite = 0, totalSkip = 0;

for (const fac of FACTIONS) {
  const gdcPath = resolve(REPO, ".gdc-cache", `${fac}.json`);
  const optPath = resolve(REPO, "data/core", fac, "wargear-options.json");
  if (!existsSync(gdcPath) || !existsSync(optPath)) { console.log(`SKIP ${fac} (missing file)`); continue; }

  // Faction registry. Weapons resolve first (with a plural→singular fallback);
  // only genuine *non-weapon* wargear counts as wargear. A plural-of-weapon
  // entity ("arachnus-storm-cannons") is a relic the old no-fallback converter
  // forged from a "2 X" count — it is not genuine wargear and must not shadow the
  // real singular weapon id.
  const weaponOnly = new Set<string>(readJSON(resolve(REPO, "data/core", fac, "weapons.json")).map((w: { id: string }) => w.id));
  const wgPath = resolve(REPO, "data/core", fac, "wargear.json");
  const allWargear: { id: string }[] = existsSync(wgPath) ? readJSON(wgPath) : [];
  const pluralOfWeapon = (id: string) => id.endsWith("s") && weaponOnly.has(id.slice(0, -1));
  const genuineWargear = new Set<string>(
    allWargear.map((w) => w.id).filter((id) => !CORRUPT_ID.test(id) && !pluralOfWeapon(id)),
  );

  const resolveId = (name: string): string | null => {
    let id: string;
    try { id = nameToId(name); } catch { return null; }
    if (weaponOnly.has(id)) return id;
    if (id.endsWith("s") && weaponOnly.has(id.slice(0, -1))) return id.slice(0, -1);
    if (genuineWargear.has(id)) return id;
    return null; // unknown to the registry — caller flags
  };
  const resolveGroup = (names: string[]): string[] | null => {
    const out: string[] = [];
    for (const n of names) { const id = resolveId(n); if (!id) return null; out.push(id); }
    return out;
  };
  // Does an existing ref id resolve to a real weapon (incl. plural) or genuine wargear?
  const resolvesId = (id: string): boolean =>
    weaponOnly.has(id) || (id.endsWith("s") && weaponOnly.has(id.slice(0, -1))) || genuineWargear.has(id);

  // Is this entity corrupt? Only those get rewritten; clean army-assist-derived
  // entities are left exactly as they are. A plural-of-weapon ref is corrupt too
  // (it should be the singular weapon id), so it gets re-derived.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isCorrupt = (e: any): boolean => {
    const refs: string[] = [...(e.replaces ?? []), ...(e.replacement ?? [])];
    for (const grp of e.replacement_choice ?? []) refs.push(...grp);
    return refs.some((id) => CORRUPT_ID.test(id) || pluralOfWeapon(id) || !resolvesId(id));
  };

  // Per unit-id → list of authoritative parsed options (only the resolvable ones).
  const gdcByUnit = new Map<string, { replaces: string[]; replacement?: string[]; replacement_choice?: string[][]; flat: Set<string> }[]>();
  const gdcCards: Card[] = [...cards(readJSON(gdcPath))];
  for (const extra of EXTRA_GDC[fac] ?? []) {
    const p = resolve(REPO, ".gdc-cache", `${extra}.json`);
    if (existsSync(p)) gdcCards.push(...cards(readJSON(p)));
  }
  for (const c of gdcCards) {
    if (!c.name || !Array.isArray(c.wargear)) continue;
    let unitId: string;
    try { unitId = nameToId(c.name); } catch { continue; }
    for (const raw of c.wargear) {
      if (typeof raw !== "string") continue;
      const r = parseOption(preprocess(raw));
      if (r.ok !== true) continue;
      const o = r.option;
      const replaces = resolveGroup(o.replaces) ?? null;
      let replacement: string[] | undefined;
      let replacement_choice: string[][] | undefined;
      const flat = new Set<string>();
      let bad = replaces === null;
      if (o.replacement) { const g = resolveGroup(o.replacement); if (!g) bad = true; else { replacement = g; g.forEach((x) => flat.add(x)); } }
      if (o.replacement_choice) {
        const groups: string[][] = [];
        for (const grp of o.replacement_choice) { const g = resolveGroup(grp); if (!g) { bad = true; break; } groups.push(g); g.forEach((x) => flat.add(x)); }
        if (!bad) replacement_choice = groups;
      }
      if (bad || flat.size === 0) continue; // need a fully-resolved option to match on
      const list = gdcByUnit.get(unitId) ?? [];
      list.push({ replaces: replaces!, replacement, replacement_choice, flat });
      gdcByUnit.set(unitId, list);
    }
  }

  // Match each of our entities by flattened replacement-id set.
  const opts = readJSON(optPath);
  let facRewrite = 0, facSkip = 0;
  const skips: string[] = [];
  for (const e of opts) {
    if (!isCorrupt(e)) continue; // leave clean entities exactly as-is
    const flatE = new Set<string>();
    for (const x of e.replacement ?? []) flatE.add(x.replace(/-and$/, ""));
    for (const grp of e.replacement_choice ?? []) for (const x of grp) flatE.add(x.replace(/-and$/, ""));
    // singularize to align with registry
    const norm = new Set([...flatE].map((id) => (!weaponOnly.has(id) && id.endsWith("s") && weaponOnly.has(id.slice(0, -1)) ? id.slice(0, -1) : id)));
    const cand = gdcByUnit.get(e.unit_id) ?? [];
    // best overlap
    let best: typeof cand[number] | null = null, bestScore = 0;
    for (const g of cand) {
      const inter = [...norm].filter((x) => g.flat.has(x)).length;
      const union = new Set([...norm, ...g.flat]).size;
      const score = union ? inter / union : 0;
      if (score > bestScore) { bestScore = score; best = g; }
    }
    if (best && bestScore >= 0.6) {
      if (best.replaces.length > 0) e.replaces = best.replaces; else delete e.replaces;
      if (best.replacement) { e.replacement = best.replacement; delete e.replacement_choice; }
      else if (best.replacement_choice) { e.replacement_choice = best.replacement_choice; delete e.replacement; }
      facRewrite++;
    } else {
      // No authoritative game-datacards match (chapter weapon not in this
      // faction's registry, or a pre-existing wrong-unit mis-association). Fall
      // back to a data-internal repair: drop bogus captured-qualifier items, then
      // merge each severed "A and"-group with the group that follows it.
      mergeChainFallback(e);
      facSkip++; skips.push(`${e.id} (best=${bestScore.toFixed(2)})`);
    }
  }
  totalRewrite += facRewrite; totalSkip += facSkip;
  console.log(`${fac}: rewrote ${facRewrite}, unmatched-with-'-and' ${facSkip}${skips.length ? "  -> " + skips.join(", ") : ""}`);
  if (APPLY) writeFileSync(optPath, JSON.stringify(opts, null, 2) + "\n");

  // Purge orphan wargear entities the old parser forged from severed
  // conjunctions / captured qualifiers, now that no option references them.
  if (existsSync(wgPath)) {
    const referenced = new Set<string>();
    for (const e of opts) {
      for (const r of [...(e.replaces ?? []), ...(e.replacement ?? [])]) referenced.add(r);
      for (const grp of e.replacement_choice ?? []) for (const r of grp) referenced.add(r);
    }
    const wg = readJSON(wgPath);
    const kept = wg.filter((w: { id: string }) => !((CORRUPT_ID.test(w.id) || pluralOfWeapon(w.id)) && !referenced.has(w.id)));
    if (kept.length !== wg.length) {
      console.log(`  purged ${wg.length - kept.length} orphan wargear entities from ${fac}/wargear.json`);
      if (APPLY) writeFileSync(wgPath, JSON.stringify(kept, null, 2) + "\n");
    }
  }
}
console.log(`\n${APPLY ? "APPLIED" : "DRY-RUN"}: rewrote ${totalRewrite} entities; ${totalSkip} still carry '-and' (need fallback)`);

// ── Global plural-of-weapon singularisation ──────────────────────────────────
// The old converter lacked a singular fallback, so a "2 lascannons" count left a
// plural ref ("lascannons") that no weapon id matches. This also affects factions
// with no "-and" corruption, so sweep ALL of them. Singularising to the real
// weapon id is registry-validated and game-datacards-independent.
let pluralFixed = 0, pluralEntities = 0;
const coreRoot = resolve(REPO, "data/core");
for (const fac of readdirSync(coreRoot)) {
  if (fac.startsWith("_")) continue;
  const optPath = resolve(coreRoot, fac, "wargear-options.json");
  const wpPath = resolve(coreRoot, fac, "weapons.json");
  if (!existsSync(optPath) || !existsSync(wpPath)) continue;
  const weaponOnly = new Set<string>(readJSON(wpPath).map((w: { id: string }) => w.id));
  const singularise = (id: string) =>
    !weaponOnly.has(id) && id.endsWith("s") && weaponOnly.has(id.slice(0, -1)) ? id.slice(0, -1) : id;

  const opts = readJSON(optPath);
  let changed = false;
  for (const e of opts) {
    if (Array.isArray(e.replaces)) { const n = e.replaces.map(singularise); if (JSON.stringify(n) !== JSON.stringify(e.replaces)) { e.replaces = n; changed = true; pluralFixed++; } }
    if (Array.isArray(e.replacement)) { const n = e.replacement.map(singularise); if (JSON.stringify(n) !== JSON.stringify(e.replacement)) { e.replacement = n; changed = true; pluralFixed++; } }
    if (Array.isArray(e.replacement_choice)) {
      const n = e.replacement_choice.map((g: string[]) => g.map(singularise));
      if (JSON.stringify(n) !== JSON.stringify(e.replacement_choice)) { e.replacement_choice = n; changed = true; pluralFixed++; }
    }
  }
  if (changed && APPLY) writeFileSync(optPath, JSON.stringify(opts, null, 2) + "\n");

  // Purge now-unreferenced plural-of-weapon wargear entities.
  const wgPath = resolve(coreRoot, fac, "wargear.json");
  if (existsSync(wgPath)) {
    const referenced = new Set<string>();
    for (const e of opts) {
      for (const r of [...(e.replaces ?? []), ...(e.replacement ?? [])]) referenced.add(r);
      for (const g of e.replacement_choice ?? []) for (const r of g) referenced.add(r);
    }
    const wg = readJSON(wgPath);
    const kept = wg.filter((w: { id: string }) => !(w.id.endsWith("s") && weaponOnly.has(w.id.slice(0, -1)) && !referenced.has(w.id)));
    if (kept.length !== wg.length) { pluralEntities += wg.length - kept.length; if (APPLY) writeFileSync(wgPath, JSON.stringify(kept, null, 2) + "\n"); }
  }
}
console.log(`plural-of-weapon: singularised ${pluralFixed} ref-lists, purged ${pluralEntities} duplicate wargear entities`);
