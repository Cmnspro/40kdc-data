/**
 * Breakglass importer: pull a single datasheet out of a BattleScribe `.cat`
 * catalog and emit the core entities for it (unit, weapons, unit-composition).
 *
 * Why this exists: the original ingestion source (`~/army-assist`) used by
 * `convert-faction.ts` was retired, leaving the BattleScribe `.cat` files in
 * `_private/wh40k-10e/` as the only available source of datasheet data. This
 * tool reads that XML directly so missing units (see
 * `audit-missing-units.ts`) can be filled. It is deliberately scoped to one
 * named datasheet per run.
 *
 * v1 coverage — the shapes the Knight Destrier needs:
 *   - a single-model datasheet (`selectionEntry type="model"`),
 *   - its Unit profile (M/T/Sv/W/Ld/OC) + invuln from an `Invulnerable Save`
 *     infoLink,
 *   - points, category keywords, faction keyword,
 *   - weapons gathered from inline weapon `selectionEntry` profiles AND from
 *     `entryLink`s that resolve to shared weapon entries elsewhere in the file.
 *
 * Not yet modelled (warned, not fabricated):
 *   - wargear-options loadout trees (nested ranged/melee choices) — a wrong
 *     swap rule is worse than none; author these by hand for now,
 *   - multi-model unit compositions and degrading stat brackets,
 *   - base sizes (BattleScribe does not carry them).
 *
 * IP safety: imports numerical stat lines, points, keywords and weapon
 * profiles only. Ability/rules prose is never copied into committed data —
 * ability DSL is wired separately via `link-abilities.ts` against the
 * community-authored enrichment stubs.
 *
 * Usage:
 *   npx tsx tools/src/import-catalog.ts --cat "<file>.cat" --unit "Knight Destrier" --faction imperial-knights [--dry-run]
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname, join, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";
import { XMLParser } from "fast-xml-parser";
import { nameToId } from "./converters/id-generator.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = resolve(__dirname, "../..");

const GAME_VERSION = { edition: "11th", dataslate: "pre-launch-provisional" } as const;

// ─── small helpers ────────────────────────────────────────────────────────

type AnyNode = Record<string, any>;
type StatValue = number | string;

/** fast-xml-parser collapses single children to objects; force an array. */
function asArray<T>(x: T | T[] | undefined | null): T[] {
  if (x === undefined || x === null) return [];
  return Array.isArray(x) ? x : [x];
}

/**
 * Deep-collect every node that appeared as a value under property `key`,
 * anywhere in the tree (handles BattleScribe's deeply nested grouping).
 */
function collectByKey(node: any, key: string, out: AnyNode[] = []): AnyNode[] {
  if (Array.isArray(node)) {
    for (const v of node) collectByKey(v, key, out);
  } else if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      if (k === key) for (const e of asArray(v)) out.push(e as AnyNode);
      collectByKey(v, key, out);
    }
  }
  return out;
}

/** Strip a leading bullet, trailing whitespace, surrounding quotes. */
function cleanText(s: string): string {
  return String(s).replace(/^[➤•➤]\s*/, "").trim();
}

/** "12\"" → 12, "3+" → 3, "6+" → 6. Returns NaN if not an integer stat. */
function parseStatInt(raw: string | undefined): number {
  if (raw === undefined) return NaN;
  const m = String(raw).replace(/[",\s]/g, "").match(/-?\d+/);
  return m ? parseInt(m[0], 10) : NaN;
}

/** "6" → 6, "D6+3" → "D6+3", "-1" → -1. Preserves dice strings. */
function parseStatValue(raw: string | undefined): StatValue {
  const s = cleanText(String(raw ?? "")).replace(/"/g, "");
  if (/^-?\d+$/.test(s)) return parseInt(s, 10);
  return s;
}

/** "36\"" → 36, "Melee" → "Melee". */
function parseRange(raw: string | undefined): number | "Melee" {
  const s = cleanText(String(raw ?? ""));
  if (/melee/i.test(s)) return "Melee";
  return parseStatInt(s);
}

/** Read a `<characteristic>` value by characteristic name from a profile. */
function charByName(profile: AnyNode, name: string): string | undefined {
  for (const c of asArray<AnyNode>(profile.characteristics?.characteristic)) {
    if (String(c.name).toLowerCase() === name.toLowerCase()) {
      return c["#text"] !== undefined ? String(c["#text"]) : "";
    }
  }
  return undefined;
}

// ─── weapon keyword parsing ─────────────────────────────────────────────────

interface KeywordCatalogEntry {
  id: string;
  required_parameters?: string[];
}

interface WeaponKeywordRef {
  keyword_id: string;
  parameters?: { value?: StatValue; target_keyword?: string; threshold?: number };
}

/**
 * Parse a BattleScribe weapon Keywords cell ("Assault, Rapid Fire 3") into the
 * weapon-keyword catalog references the schema expects. Unknown keywords are
 * returned in `unknown` so the caller can warn rather than silently drop them.
 */
function parseWeaponKeywords(
  cell: string | undefined,
  catalog: Map<string, KeywordCatalogEntry>,
): { keywords: WeaponKeywordRef[]; unknown: string[] } {
  const keywords: WeaponKeywordRef[] = [];
  const unknown: string[] = [];
  const text = cleanText(String(cell ?? ""));
  if (!text || text === "-") return { keywords, unknown };

  for (const rawTok of text.split(",")) {
    const tok = rawTok.trim();
    if (!tok || tok === "-") continue;

    // Anti-<keyword> <n>+
    const anti = tok.match(/^anti-(.+?)\s+(\d)\+$/i);
    if (anti && catalog.has("anti")) {
      keywords.push({
        keyword_id: "anti",
        parameters: { target_keyword: anti[1].trim(), threshold: parseInt(anti[2], 10) },
      });
      continue;
    }

    // <name> <value>  (e.g. Rapid Fire 3, Melta 2, Sustained Hits 1)
    const valued = tok.match(/^(.+?)\s+([0-9].*|D\d.*)$/i);
    if (valued) {
      const id = safeId(valued[1]);
      if (id && catalog.has(id)) {
        keywords.push({ keyword_id: id, parameters: { value: parseStatValue(valued[2]) } });
        continue;
      }
    }

    // bare keyword (Assault, Blast, Lance, Lethal Hits…)
    const id = safeId(tok);
    if (id && catalog.has(id)) {
      keywords.push({ keyword_id: id });
      continue;
    }

    unknown.push(tok);
  }
  return { keywords, unknown };
}

/** nameToId that returns null instead of throwing on un-id-able input. */
function safeId(name: string): string | null {
  try {
    return nameToId(name);
  } catch {
    return null;
  }
}

// ─── weapon extraction ──────────────────────────────────────────────────────

interface WeaponProfile {
  name: string;
  range: number | "Melee";
  stats: Record<string, StatValue>;
  keywords: WeaponKeywordRef[];
}

interface CoreWeapon {
  id: string;
  name: string;
  type: "ranged" | "melee";
  profiles: WeaponProfile[];
  game_version: typeof GAME_VERSION;
}

function weaponProfilesOf(entry: AnyNode): AnyNode[] {
  return asArray<AnyNode>(entry.profiles?.profile).filter((p) => {
    const tn = String(p.typeName ?? "");
    return /Ranged Weapons|Melee Weapons/i.test(tn);
  });
}

function hasWeaponProfiles(entry: AnyNode): boolean {
  return weaponProfilesOf(entry).length > 0;
}

/** Turn a weapon `selectionEntry` into a core weapon object (sans final id). */
function buildWeapon(
  entry: AnyNode,
  catalog: Map<string, KeywordCatalogEntry>,
  warnings: string[],
): Omit<CoreWeapon, "id"> {
  const rawProfiles = weaponProfilesOf(entry);
  const isRanged = rawProfiles.some((p) => /Ranged Weapons/i.test(String(p.typeName)));
  const name = cleanText(String(entry.name));

  const profiles: WeaponProfile[] = rawProfiles.map((p) => {
    const ranged = /Ranged Weapons/i.test(String(p.typeName));
    const stats: Record<string, StatValue> = {
      A: parseStatValue(charByName(p, "A")),
      S: parseStatValue(charByName(p, "S")),
      AP: parseStatInt(charByName(p, "AP")),
      D: parseStatValue(charByName(p, "D")),
    };
    if (ranged) {
      const bs = parseStatInt(charByName(p, "BS"));
      if (!Number.isNaN(bs)) stats.BS = bs;
    } else {
      const ws = parseStatInt(charByName(p, "WS"));
      if (!Number.isNaN(ws)) stats.WS = ws;
    }
    const { keywords, unknown } = parseWeaponKeywords(charByName(p, "Keywords"), catalog);
    for (const u of unknown) {
      warnings.push(`weapon "${name}": unknown weapon keyword "${u}" (dropped — add to weapon-keywords catalog or check spelling)`);
    }
    return {
      name: profileName(name, String(p.name)),
      range: parseRange(charByName(p, "Range")),
      stats,
      keywords,
    };
  });

  return { name, type: isRanged ? "ranged" : "melee", profiles, game_version: GAME_VERSION };
}

/** "➤ Bellatus reaper chainsword - strike" → "Strike"; single profile → weapon name. */
function profileName(weaponName: string, profileRaw: string): string {
  const clean = cleanText(profileRaw);
  const dash = clean.lastIndexOf(" - ");
  if (dash !== -1) {
    const tail = clean.slice(dash + 3).trim();
    return tail.charAt(0).toUpperCase() + tail.slice(1);
  }
  return clean || weaponName;
}

// ─── collision-aware id assignment ──────────────────────────────────────────

function profilesEqual(a: WeaponProfile[], b: WeaponProfile[]): boolean {
  const norm = (ps: WeaponProfile[]) =>
    JSON.stringify(
      [...ps]
        .map((p) => ({ ...p, keywords: [...p.keywords].sort((x, y) => x.keyword_id.localeCompare(y.keyword_id)) }))
        .sort((x, y) => x.name.localeCompare(y.name)),
    );
  return norm(a) === norm(b);
}

// ─── core file IO ───────────────────────────────────────────────────────────

function readJSON<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf-8")) as T;
}

function writeJSON(path: string, data: unknown): void {
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
}

/** Replace an entry with the same `id`/`unit_id`, else append. */
function upsert<T extends Record<string, any>>(arr: T[], item: T, key: keyof T): T[] {
  const idx = arr.findIndex((e) => e[key] === item[key]);
  if (idx === -1) return [...arr, item];
  const copy = [...arr];
  copy[idx] = item;
  return copy;
}

// ─── main import ────────────────────────────────────────────────────────────

export interface ImportOptions {
  catPath: string;
  unitName: string;
  faction: string;
  rootDir?: string;
  dryRun?: boolean;
}

export interface ImportResult {
  unit: AnyNode;
  composition: AnyNode;
  newWeapons: CoreWeapon[];
  reusedWeaponIds: string[];
  warnings: string[];
}

export function importCatalogUnit(opts: ImportOptions): ImportResult {
  const root = opts.rootDir ?? DEFAULT_ROOT;
  const catPath = isAbsolute(opts.catPath) ? opts.catPath : resolve(root, opts.catPath);
  if (!existsSync(catPath)) throw new Error(`Catalog file not found: ${catPath}`);

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    textNodeName: "#text",
    parseAttributeValue: false,
    trimValues: true,
  });
  const doc = parser.parse(readFileSync(catPath, "utf-8"));

  // Global index of every selectionEntry by id (for entryLink resolution).
  const allEntries = collectByKey(doc, "selectionEntry");
  const byId = new Map<string, AnyNode>();
  for (const e of allEntries) if (e.id) byId.set(String(e.id), e);

  // Locate the target datasheet.
  const want = opts.unitName.trim().toLowerCase();
  const model =
    allEntries.find((e) => String(e.name).trim().toLowerCase() === want && e.type === "model") ??
    allEntries.find(
      (e) =>
        String(e.name).trim().toLowerCase() === want &&
        asArray<AnyNode>(e.profiles?.profile).some((p) => /^Unit$/i.test(String(p.typeName))),
    );
  if (!model) {
    throw new Error(
      `Datasheet "${opts.unitName}" not found in ${catPath} (looked for a selectionEntry type="model" or one carrying a Unit profile).`,
    );
  }

  const warnings: string[] = [];
  const unitName = cleanText(String(model.name));
  const unitId = nameToId(unitName);

  // Unit stat profile.
  const unitProfileNode = asArray<AnyNode>(model.profiles?.profile).find((p) =>
    /^Unit$/i.test(String(p.typeName)),
  );
  if (!unitProfileNode) throw new Error(`"${unitName}" has no Unit profile (stat line).`);
  const profile: AnyNode = {
    name: unitName,
    M: parseStatInt(charByName(unitProfileNode, "M")),
    T: parseStatInt(charByName(unitProfileNode, "T")),
    W: parseStatInt(charByName(unitProfileNode, "W")),
    Sv: parseStatInt(charByName(unitProfileNode, "SV")),
    Ld: parseStatInt(charByName(unitProfileNode, "LD")),
    OC: parseStatInt(charByName(unitProfileNode, "OC")),
  };

  // Invuln from an "Invulnerable Save (N+*)" infoLink on the model.
  for (const il of collectByKey(model, "infoLink")) {
    const m = String(il.name ?? "").match(/Invulnerable Save\s*\((\d)\+/i);
    if (m) {
      profile.invuln_sv = parseInt(m[1], 10);
      break;
    }
  }

  // Keywords from categoryLinks; "Faction: X" → faction_keywords.
  const keywords: string[] = [];
  const factionKeywords: string[] = [];
  let role: string | undefined;
  for (const cl of asArray<AnyNode>(model.categoryLinks?.categoryLink)) {
    const name = String(cl.name).trim();
    if (/^Faction:\s*/i.test(name)) {
      const fk = name.replace(/^Faction:\s*/i, "").trim();
      if (fk && !factionKeywords.includes(fk)) factionKeywords.push(fk);
      continue;
    }
    if (!keywords.includes(name)) keywords.push(name);
    if (/^Character$/i.test(name)) role = "character";
    else if (/^Epic Hero$/i.test(name)) role = "epic-hero";
    else if (/^Battleline$/i.test(name) && !role) role = "battleline";
    else if (/^Dedicated Transport$/i.test(name) && !role) role = "dedicated-transport";
  }

  // Points (the "pts" cost).
  let cost = 0;
  for (const c of asArray<AnyNode>(model.costs?.cost)) {
    if (String(c.name).toLowerCase() === "pts") cost = parseInt(String(c.value), 10) || 0;
  }

  // Weapons: inline weapon selectionEntries + entryLinks that resolve to shared
  // weapon entries. Dedup by resolved entry id; skip non-weapon links (Warlord,
  // Enhancements, Weapon Modifications, etc.).
  const weaponEntries = new Map<string, AnyNode>();
  for (const e of collectByKey(model, "selectionEntry")) {
    if (hasWeaponProfiles(e) && e.id) weaponEntries.set(String(e.id), e);
  }
  for (const link of collectByKey(model, "entryLink")) {
    if (String(link.type) !== "selectionEntry") continue;
    const target = byId.get(String(link.targetId));
    if (target && hasWeaponProfiles(target) && target.id) {
      weaponEntries.set(String(target.id), target);
    }
  }

  // Build weapons, resolve ids against existing faction weapons.
  const catalog = loadKeywordCatalog(root);
  const weaponsPath = join(root, "data/core", opts.faction, "weapons.json");
  const existingWeapons = existsSync(weaponsPath) ? readJSON<CoreWeapon[]>(weaponsPath) : [];
  const existingById = new Map(existingWeapons.map((w) => [w.id, w]));

  const newWeapons: CoreWeapon[] = [];
  const reusedWeaponIds: string[] = [];
  const weaponIds = new Set<string>();

  for (const entry of weaponEntries.values()) {
    const built = buildWeapon(entry, catalog, warnings);
    const baseId = nameToId(built.name);
    const existing = existingById.get(baseId);

    let finalId: string;
    if (existing && profilesEqual(existing.profiles, built.profiles)) {
      finalId = baseId; // identical — reuse, add nothing
      reusedWeaponIds.push(baseId);
    } else if (existing) {
      finalId = `${baseId}-${unitId}`; // collision with different stats → variant
      warnings.push(
        `weapon "${built.name}" (${baseId}) already exists with different stats; emitting variant "${finalId}". Reconcile if these should be the same weapon.`,
      );
      if (!existingById.has(finalId)) newWeapons.push({ id: finalId, ...built });
    } else {
      finalId = baseId;
      newWeapons.push({ id: finalId, ...built });
    }
    weaponIds.add(finalId);
  }

  // Compose the unit. ability_ids left empty — link-abilities wires them from
  // the enrichment stubs that already reference this unit.
  const unit: AnyNode = {
    id: unitId,
    name: unitName,
    faction_id: opts.faction,
    ...(role ? { role } : {}),
    profiles: [profile],
    points: [{ models: 1, cost }],
    points_provisional: true,
    keywords,
    faction_keywords: factionKeywords,
    base_size_mm: null,
    model_count: { min: 1, max: 1 },
    weapon_ids: [...weaponIds].sort(),
    ability_ids: [],
    game_version: GAME_VERSION,
    is_legend: false,
  };
  warnings.push(`base_size_mm set to null (not present in BattleScribe data) — fill from the model's physical base.`);
  warnings.push(`wargear-options not generated for "${unitId}" — author loadout swaps by hand (BattleScribe loadout trees are not modelled in v1).`);

  const composition: AnyNode = {
    unit_id: unitId,
    models: [{ name: unitName, min: 1, max: 1 }],
    game_version: GAME_VERSION,
  };

  // Write (unless dry-run).
  if (!opts.dryRun) {
    const unitsPath = join(root, "data/core", opts.faction, "units.json");
    const compsPath = join(root, "data/core", opts.faction, "unit-compositions.json");
    const units = existsSync(unitsPath) ? readJSON<AnyNode[]>(unitsPath) : [];
    const comps = existsSync(compsPath) ? readJSON<AnyNode[]>(compsPath) : [];

    writeJSON(unitsPath, upsert(units, unit, "id"));
    writeJSON(compsPath, upsert(comps, composition, "unit_id"));
    if (newWeapons.length > 0) {
      writeJSON(weaponsPath, [...existingWeapons, ...newWeapons]);
    }
  }

  return { unit, composition, newWeapons, reusedWeaponIds, warnings };
}

function loadKeywordCatalog(root: string): Map<string, KeywordCatalogEntry> {
  const path = join(root, "data/core/weapon-keywords.json");
  const entries = existsSync(path) ? readJSON<KeywordCatalogEntry[]>(path) : [];
  return new Map(entries.map((e) => [e.id, e]));
}

// ─── CLI ────────────────────────────────────────────────────────────────────

const isMain =
  process.argv[1] &&
  resolve(process.argv[1]).replace(/\.\w+$/, "") ===
    fileURLToPath(import.meta.url).replace(/\.\w+$/, "");

if (isMain) {
  const args = process.argv.slice(2);
  const flag = (name: string): string | undefined => {
    const i = args.indexOf(name);
    return i !== -1 ? args[i + 1] : undefined;
  };

  if (args.includes("--help") || args.includes("-h") || args.length === 0) {
    console.log(
      'Usage: npx tsx tools/src/import-catalog.ts --cat "<file>.cat" --unit "<Datasheet Name>" --faction <faction-id> [--dry-run]',
    );
    process.exit(args.length === 0 ? 1 : 0);
  }

  const catPath = flag("--cat");
  const unitName = flag("--unit");
  const faction = flag("--faction");
  const dryRun = args.includes("--dry-run");

  if (!catPath || !unitName || !faction) {
    console.error("Error: --cat, --unit and --faction are all required.");
    process.exit(1);
  }

  const result = importCatalogUnit({ catPath, unitName, faction, dryRun });

  console.log(`Unit:            ${result.unit.id} (${result.unit.name})`);
  console.log(`  profile:       ${JSON.stringify(result.unit.profiles[0])}`);
  console.log(`  points:        ${JSON.stringify(result.unit.points)}`);
  console.log(`  keywords:      ${result.unit.keywords.join(", ")}`);
  console.log(`  faction kw:    ${result.unit.faction_keywords.join(", ")}`);
  console.log(`  weapon_ids:    ${result.unit.weapon_ids.join(", ")}`);
  console.log(`New weapons:     ${result.newWeapons.map((w) => w.id).join(", ") || "(none)"}`);
  console.log(`Reused weapons:  ${result.reusedWeaponIds.join(", ") || "(none)"}`);

  if (result.warnings.length) {
    console.log(`\nWarnings (${result.warnings.length}):`);
    for (const w of result.warnings) console.log(`  - ${w}`);
  }

  if (dryRun) {
    console.log("\n(dry-run; no files written)\n");
    console.log(JSON.stringify({ unit: result.unit, composition: result.composition, newWeapons: result.newWeapons }, null, 2));
  } else {
    console.log(`\nWrote data/core/${faction}/{units,unit-compositions${result.newWeapons.length ? ",weapons" : ""}}.json`);
  }
}
