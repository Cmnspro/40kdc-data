import { readFileSync } from "node:fs";
import { glob } from "glob";
import { resolve, basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { ValidationResult } from "./validate.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const DATA_ROOT = resolve(__dirname, "../../data");

/**
 * Factions whose units carry exactly one bare legion/faction faction_keyword.
 *
 * These are the shared-datasheet factions where contamination has been observed:
 * a unit materialized from a parent template keeps the parent's faction keyword
 * (e.g. a World Eaters Chaos Rhino left carrying `Emperor's Children`, or a Chaos
 * Space Marines unit carrying the full multi-legion union line). For a faction in
 * this map, every unit's `faction_keywords` must be a subset of `{home}`.
 *
 * Factions absent from this map (e.g. Space Marine chapters, which legitimately
 * carry several faction_keywords) are not subject to the membership check, so the
 * guard never produces a false positive on them. Extend this map as other
 * single-token factions adopt the convention.
 */
export const FACTION_HOME_KEYWORD: Record<string, string> = {
  "chaos-space-marines": "Heretic Astartes",
  "world-eaters": "World Eaters",
  "death-guard": "Death Guard",
  "thousand-sons": "Thousand Sons",
  "emperors-children": "Emperor’s Children",
};

interface UnitLike {
  id?: string;
  ability_ids?: string[];
  faction_keywords?: string[];
  weapon_ids?: string[];
}
interface CompModelLike {
  name?: string;
  default_weapon_ids?: string[];
}
interface CompLike {
  unit_id?: string;
  models?: CompModelLike[];
}
interface AbilityLike {
  ability_id?: string;
}

/**
 * Known, accepted loadout orphans — a `<faction>/<unit_id>/<weapon_id>` triple
 * whose weapon is in the unit's `weapon_ids` but is neither a recorded
 * `default_weapon_ids` entry nor reachable through any wargear-option. Each entry
 * is a deliberate, reviewed exception — a NEW orphan (any triple not listed) fails
 * CI, and a listed triple that is no longer an orphan is reported as stale so the
 * list stays minimal.
 *
 * This set is now EMPTY: every former orphan has been resolved by restructuring
 * the unit composition to match the GW MFM dump's per-figure miniature rows
 * (collapsed single-figure squads, daemon split-models, kill-team weapon variants,
 * and same-named distinct-loadout figures). Keep the gate zero-tolerance — add a
 * triple here only with a comment justifying why the dump genuinely cannot model
 * the loadout, never to silence a fixable data gap.
 */
export const KNOWN_LOADOUT_ORPHANS: ReadonlySet<string> = new Set<string>([]);
interface WargearOptionLike {
  id?: string;
  replaces?: string[];
  replacement?: string[];
  replacement_choice?: string[][];
}

/**
 * Corruption signatures of a wargear-option weapon ref synthesized from prose
 * rather than structural data — the failure mode of the retired army-assist prose
 * lineage, kept here as a source-agnostic regression tripwire:
 *  - a dangling conjunction tail ("…-and"/"…-or") — a severed "A and B" group;
 *  - a captured prose qualifier ("options-you-cannot-select-the-same-option…",
 *    "duplicates-are-not-allowed") swallowed as a fake weapon.
 * Neither shape can occur in a real weapon/wargear id, so flagging them is safe.
 */
const DANGLING_CONJUNCTION = /-(?:and|or)$/;
const CAPTURED_QUALIFIER = /^options-|-you-cannot-|-not-allowed$|-the-same-option/;

function readArray<T>(file: string): T[] {
  return JSON.parse(readFileSync(file, "utf-8")) as T[];
}

function loadAbilityIds(file: string, into: Set<string>): void {
  try {
    for (const a of readArray<AbilityLike>(file)) {
      if (a.ability_id) into.add(a.ability_id);
    }
  } catch {
    // file absent — faction has no enrichment abilities, or no shared core pool
  }
}

/**
 * Cross-entity referential integrity that per-file JSON Schema validation cannot
 * express:
 *
 *  - every unit `ability_id` must resolve to an ability defined in that faction's
 *    `enrichment/<faction>/abilities.json` (or the shared `enrichment/_core` pool).
 *    Same-faction scoping is deliberate — a union check would pass shared-unit
 *    contaminants because they happen to be defined in some *other* faction's
 *    enrichment.
 *  - every unit `faction_keywords` entry must be permitted for the unit's faction
 *    (see {@link FACTION_HOME_KEYWORD}).
 *
 * Results reuse {@link ValidationResult} so the CLI reporter can render them.
 */
export async function checkReferentialIntegrity(dataRoot?: string): Promise<ValidationResult> {
  const root = dataRoot ?? DATA_ROOT;
  const result: ValidationResult = {
    totalFiles: 0,
    totalItems: 0,
    passed: 0,
    failed: 0,
    errors: [],
  };

  // Shared core ability pool, available to every faction (optional).
  const coreAbilities = new Set<string>();
  loadAbilityIds(resolve(root, "enrichment/_core/abilities.json"), coreAbilities);

  const unitFiles = await glob("core/*/units.json", { cwd: root, absolute: true });
  unitFiles.sort();

  for (const file of unitFiles) {
    const faction = basename(dirname(file));
    if (faction.startsWith("_")) continue; // scratch/example/report dirs

    let units: UnitLike[];
    try {
      units = readArray<UnitLike>(file);
    } catch {
      continue; // structural problems are the AJV pass's job
    }
    if (!Array.isArray(units)) continue;

    // No two units in a faction file may share an id. The linked API keys units
    // by id with first-wins (`Collection`), so a duplicate silently shadows the
    // later entry — e.g. a stale `pre-launch-provisional` points row hiding the
    // authoritative `launch` row, so the corrected points never reach consumers.
    // An append-instead-of-replace ingest is the recurring cause; flag any
    // collision so it can't ship.
    const idCounts = new Map<string, number>();
    for (const u of units) if (u.id) idCounts.set(u.id, (idCounts.get(u.id) ?? 0) + 1);
    const dupIds = [...idCounts].filter(([, n]) => n > 1).map(([id]) => id);
    if (dupIds.length > 0) {
      result.failed++;
      result.errors.push({
        file,
        index: 0,
        errors: dupIds.map((id) => ({
          path: "/",
          message: `duplicate unit id "${id}" appears ${idCounts.get(id)}× in ${faction}/units.json — the linked API keys by id (first-wins), so the later entry is silently shadowed; keep exactly one`,
        })),
      });
    }

    const defined = new Set<string>(coreAbilities);
    loadAbilityIds(resolve(root, `enrichment/${faction}/abilities.json`), defined);
    const home = FACTION_HOME_KEYWORD[faction];

    result.totalFiles++;
    for (let i = 0; i < units.length; i++) {
      const u = units[i];
      result.totalItems++;
      const errs: Array<{ path: string; message: string }> = [];

      for (const aid of u.ability_ids ?? []) {
        if (!defined.has(aid)) {
          errs.push({
            path: `/${i}/ability_ids`,
            message: `unit "${u.id}": ability_id "${aid}" is not defined in ${faction} enrichment`,
          });
        }
      }

      if (home !== undefined) {
        for (const fk of u.faction_keywords ?? []) {
          if (fk !== home) {
            errs.push({
              path: `/${i}/faction_keywords`,
              message: `unit "${u.id}": faction_keyword "${fk}" is not permitted for ${faction} (expected only "${home}")`,
            });
          }
        }
      }

      if (errs.length > 0) {
        result.failed++;
        result.errors.push({ file, index: i, errors: errs });
      } else {
        result.passed++;
      }
    }
  }

  // Wargear-option weapon refs must not carry a parser-corruption signature. This
  // guards against the "1 A and 1 B" choice-group severing recurring on any
  // future data regeneration or hand-edit.
  const optionFiles = await glob("core/*/wargear-options.json", { cwd: root, absolute: true });
  optionFiles.sort();
  for (const file of optionFiles) {
    const faction = basename(dirname(file));
    if (faction.startsWith("_")) continue;

    let options: WargearOptionLike[];
    try {
      options = readArray<WargearOptionLike>(file);
    } catch {
      continue;
    }
    if (!Array.isArray(options)) continue;

    // The faction's weapon ids — to catch plural-of-weapon refs ("lascannons"
    // where only the singular "lascannon" is a real weapon), the relic of a
    // converter that lacked a "2 X" → singular fallback.
    let weaponIds = new Set<string>();
    try {
      weaponIds = new Set(readArray<{ id?: string }>(resolve(dirname(file), "weapons.json")).map((w) => w.id ?? ""));
    } catch {
      // no weapons file — skip the plural-of-weapon check for this faction
    }

    result.totalFiles++;
    for (let i = 0; i < options.length; i++) {
      const o = options[i];
      result.totalItems++;
      const errs: Array<{ path: string; message: string }> = [];

      const refs = [...(o.replaces ?? []), ...(o.replacement ?? [])];
      for (const group of o.replacement_choice ?? []) refs.push(...group);
      for (const ref of refs) {
        if (DANGLING_CONJUNCTION.test(ref)) {
          errs.push({
            path: `/${i}`,
            message: `wargear-option "${o.id}": weapon ref "${ref}" ends in a dangling conjunction — a prose-derived ref severed an "A and B" group`,
          });
        } else if (CAPTURED_QUALIFIER.test(ref)) {
          errs.push({
            path: `/${i}`,
            message: `wargear-option "${o.id}": weapon ref "${ref}" is a captured prose qualifier, not a weapon`,
          });
        } else if (!weaponIds.has(ref) && ref.endsWith("s") && weaponIds.has(ref.slice(0, -1))) {
          errs.push({
            path: `/${i}`,
            message: `wargear-option "${o.id}": weapon ref "${ref}" is a plural of weapon "${ref.slice(0, -1)}" — use the singular weapon id`,
          });
        }
      }

      if (errs.length > 0) {
        result.failed++;
        result.errors.push({ file, index: i, errors: errs });
      } else {
        result.passed++;
      }
    }
  }

  // ── Loadout coverage: no orphan weapons on a populated composition ──
  //
  // A unit's `weapon_id` must be either a recorded per-model default or reachable
  // through some wargear-option (the swap/add structure). A weapon that is
  // neither — an "orphan" — is the defect class behind the Chaos Terminators
  // illegal-loadout bug (a special/heavy weapon the data never modeled as an
  // option). The check is scoped to *populated* compositions (every model row
  // carries `default_weapon_ids`); an unpopulated composition falls back to the
  // loadout layer's derivation and is out of scope. Known, reviewed residue lives
  // in {@link KNOWN_LOADOUT_ORPHANS}; a new orphan fails, a stale allowlist entry
  // is reported.
  const seenAllowed = new Set<string>();
  const scannedFactions = new Set<string>();
  const compFiles = await glob("core/*/unit-compositions.json", { cwd: root, absolute: true });
  compFiles.sort();
  for (const file of compFiles) {
    const faction = basename(dirname(file));
    if (faction.startsWith("_")) continue;
    scannedFactions.add(faction);

    let comps: CompLike[];
    try {
      comps = readArray<CompLike>(file);
    } catch {
      continue;
    }
    if (!Array.isArray(comps)) continue;

    const dir = dirname(file);
    let units: UnitLike[];
    try {
      units = readArray<UnitLike>(resolve(dir, "units.json"));
    } catch {
      continue;
    }
    const weaponIdsByUnit = new Map<string, string[]>(units.map((u) => [u.id ?? "", u.weapon_ids ?? []]));
    const reachableByUnit = new Map<string, Set<string>>();
    try {
      for (const o of readArray<WargearOptionLike & { unit_id?: string }>(resolve(dir, "wargear-options.json"))) {
        const set = reachableByUnit.get(o.unit_id ?? "") ?? new Set<string>();
        for (const id of o.replaces ?? []) set.add(id);
        for (const id of o.replacement ?? []) set.add(id);
        for (const g of o.replacement_choice ?? []) for (const id of g) set.add(id);
        reachableByUnit.set(o.unit_id ?? "", set);
      }
    } catch {
      // no wargear-options file — every weapon must be a default then
    }

    result.totalFiles++;
    for (let i = 0; i < comps.length; i++) {
      const c = comps[i];
      result.totalItems++;
      const models = c.models ?? [];
      // Populated = every model row carries a non-empty default loadout.
      const populated = models.length > 0 && models.every((m) => (m.default_weapon_ids?.length ?? 0) > 0);
      if (!populated) {
        result.passed++;
        continue;
      }
      const defaults = new Set<string>();
      for (const m of models) for (const id of m.default_weapon_ids ?? []) defaults.add(id);
      const reachable = reachableByUnit.get(c.unit_id ?? "") ?? new Set<string>();
      const errs: Array<{ path: string; message: string }> = [];
      for (const wid of weaponIdsByUnit.get(c.unit_id ?? "") ?? []) {
        if (defaults.has(wid) || reachable.has(wid)) continue;
        const key = `${faction}/${c.unit_id}/${wid}`;
        if (KNOWN_LOADOUT_ORPHANS.has(key)) {
          seenAllowed.add(key);
          continue;
        }
        errs.push({
          path: `/${i}`,
          message: `unit "${c.unit_id}": weapon "${wid}" is an orphan — neither a default_weapon_ids entry nor reachable via a wargear-option`,
        });
      }
      if (errs.length > 0) {
        result.failed++;
        result.errors.push({ file, index: i, errors: errs });
      } else {
        result.passed++;
      }
    }
  }

  // A stale allowlist entry (no longer an orphan) must be removed so the list
  // can't silently mask a future regression at that triple. Only entries whose
  // faction was actually scanned are eligible — so a partial dataset (e.g. a test
  // fixture with no compositions for that faction) never spuriously flags them.
  const stale = [...KNOWN_LOADOUT_ORPHANS].filter(
    (k) => scannedFactions.has(k.split("/")[0]) && !seenAllowed.has(k),
  );
  if (stale.length > 0) {
    result.failed++;
    result.errors.push({
      file: "tools/src/integrity.ts",
      index: 0,
      errors: stale.map((k) => ({
        path: "/KNOWN_LOADOUT_ORPHANS",
        message: `allowlist entry "${k}" is no longer an orphan — remove it`,
      })),
    });
  }

  return result;
}
