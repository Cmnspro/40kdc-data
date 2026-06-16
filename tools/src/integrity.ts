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
}
interface AbilityLike {
  ability_id?: string;
}
interface WargearOptionLike {
  id?: string;
  replaces?: string[];
  replacement?: string[];
  replacement_choice?: string[][];
}

/**
 * Corruption signatures left in a wargear-option weapon ref when the option
 * parser mis-handles a "one of the following" list (see option-parser.ts):
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
            message: `wargear-option "${o.id}": weapon ref "${ref}" ends in a dangling conjunction — the option parser severed an "A and B" group (see option-parser.ts)`,
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

  return result;
}
