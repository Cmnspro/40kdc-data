/**
 * Bundles every authored data file under `data/` into a single embedded module,
 * `src/data/bundle.generated.ts`.
 *
 * The bundle is inlined as an escaped JSON *string* that is `JSON.parse`d at load
 * time (mirroring the Rust crate's `include_str!`): tsc typechecks it instantly
 * (it is just a string), it parses once at import, and it compiles into `dist`
 * with no runtime filesystem access — so the published package works in Node,
 * bundlers, and browsers alike, where `data/` is not shipped.
 *
 * Run via `npm run codegen:data`. The output is gitignored and regenerated on
 * build/test/pack.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

import { emptyRawData, type RawData } from "./data/types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "../..");
const DATA_ROOTS = [join(REPO_ROOT, "data", "core"), join(REPO_ROOT, "data", "enrichment")];
const OUT_FILE = join(__dirname, "data", "bundle.generated.ts");
/** Committed share-token id registry (authored by `npm run registry:build`). */
const REGISTRY_IN = join(REPO_ROOT, "data", "share-registry.json");
const REGISTRY_OUT = join(__dirname, "share", "registry.generated.ts");

/** Directory names that hold examples/scratch data and must never be bundled. */
const EXCLUDED_DIRS = new Set(["_example", "_port-audit"]);

/** Map a data file's base name (sans `.json`) to its `RawData` collection key. */
const FILE_TO_COLLECTION: Record<string, keyof RawData> = {
  units: "units",
  "target-profiles": "targetProfiles",
  weapons: "weapons",
  "weapon-keywords": "weaponKeywords",
  "unit-keywords": "unitKeywords",
  factions: "factions",
  abilities: "abilities",
  "phase-mappings": "phaseMappings",
  detachments: "detachments",
  allies: "alliedRules",
  stratagems: "stratagems",
  enhancements: "enhancements",
  "leader-attachments": "leaderAttachments",
  "unit-compositions": "unitCompositions",
  "wargear-options": "wargearOptions",
  wargear: "wargear",
  "game-versions": "gameVersions",
  missions: "missions",
  "mission-matchups": "missionMatchups",
  "secondary-cards": "missionCards",
  "deployment-patterns": "deploymentPatterns",
  "force-dispositions": "forceDispositions",
  "terrain-templates": "terrainTemplates",
  "terrain-layouts": "terrainLayouts",
  "hull-shapes": "hullShapes",
  "resource-pools": "resourcePools",
  "interaction-flags": "interactionFlags",
};

/** The id-bearing key for a collection, used only for duplicate-id reporting. */
const ID_KEY: Partial<Record<keyof RawData, string>> = {
  abilities: "ability_id",
};

/** Recursively collect bundleable `.json` files, skipping excluded dirs/examples. */
function collectFiles(dir: string): string[] {
  const out: string[] = [];
  // Sort so the bundle order (and thus first-wins for any shared id) is
  // reproducible across filesystems, not dependent on readdir() enumeration.
  for (const entry of readdirSync(dir).sort()) {
    if (EXCLUDED_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...collectFiles(full));
    } else if (entry.endsWith(".json") && !entry.endsWith(".example.json")) {
      out.push(full);
    }
  }
  return out;
}

function baseName(file: string): string {
  // Use node:path basename so this works on Windows (backslash) paths too — a bare
  // lastIndexOf("/") returns the whole path on Windows, so nothing bundles.
  return basename(file, ".json");
}

/** The faction a data file belongs to: the first path segment under `root`
 *  (e.g. `.../data/core/necrons/weapons.json` → `necrons`). Undefined when the
 *  file sits directly in the root (faction-less), so the caller can skip it. */
function factionOfFile(root: string, file: string): string | undefined {
  const seg = relative(root, file).split(sep)[0];
  return seg && !seg.endsWith(".json") ? seg : undefined;
}

function build(): RawData {
  const data = emptyRawData();
  for (const root of DATA_ROOTS) {
    for (const file of collectFiles(root)) {
      const collection = FILE_TO_COLLECTION[baseName(file)];
      if (!collection) continue; // schema/scratch json we don't bundle
      const parsed = JSON.parse(readFileSync(file, "utf-8")) as unknown;
      if (!Array.isArray(parsed)) {
        throw new Error(`expected a JSON array in ${file}`);
      }
      // Stamp each weapon with its owning faction (its data/core/<faction>/ dir)
      // so a unit's weapon_ids resolve within its own faction. A bare id shared
      // across factions (e.g. "close-combat-weapon") otherwise collapses to
      // whichever faction bundled first — issue #59. Faction-less weapons (none
      // today) keep no faction_id and fall back to global first-wins.
      if (collection === "weapons") {
        const faction = factionOfFile(root, file);
        if (faction) {
          for (const w of parsed as Record<string, unknown>[]) {
            if (w && typeof w === "object" && w.faction_id === undefined) w.faction_id = faction;
          }
        }
      }
      (data[collection] as unknown[]).push(...parsed);
    }
  }
  return data;
}

/** Warn (do not fail) on duplicate primary ids — a data-hygiene signal. */
function reportDuplicateIds(data: RawData): void {
  for (const [collection, key] of Object.entries(ID_KEY) as [keyof RawData, string][]) {
    const seen = new Set<string>();
    const dupes = new Set<string>();
    for (const item of data[collection] as Record<string, unknown>[]) {
      const id = item[key] as string | undefined;
      if (id === undefined) continue;
      if (seen.has(id)) dupes.add(id);
      else seen.add(id);
    }
    if (dupes.size > 0) {
      console.warn(`  ⚠ ${collection}: ${dupes.size} duplicate ${key}(s), e.g. ${[...dupes].slice(0, 3).join(", ")}`);
    }
  }
  // Weapons legitimately share bare ids across factions (each faction file may
  // define its own "close-combat-weapon"); the resolver disambiguates by
  // faction. A TRUE duplicate is the same (faction_id, id) pair — an authoring
  // error, so flag it.
  const wseen = new Set<string>();
  const wdupes = new Set<string>();
  for (const w of data.weapons) {
    const key = `${w.faction_id ?? ""}::${w.id}`;
    if (wseen.has(key)) wdupes.add(w.id);
    else wseen.add(key);
  }
  if (wdupes.size > 0) {
    console.warn(`  ⚠ weapons: ${wdupes.size} duplicate (faction_id,id) pair(s), e.g. ${[...wdupes].slice(0, 3).join(", ")}`);
  }
}

function emit(data: RawData): string {
  // JSON.stringify of the JSON text yields a valid, fully-escaped JS string
  // literal — safe to drop straight into the generated source.
  const jsonText = JSON.stringify(data);
  const literal = JSON.stringify(jsonText);
  return `/* GENERATED by 'npm run codegen:data' from the repository's data/ tree. DO NOT EDIT BY HAND. */
import type { RawData } from "./types.js";

const JSON_TEXT = ${literal};

/** The full 40kdc dataset, embedded at build time and parsed once at load. */
export const RAW_DATA: RawData = JSON.parse(JSON_TEXT) as RawData;
`;
}

/**
 * Inline the committed share-token registry as a parsed-once module, mirroring
 * the dataset bundle so the codec stays filesystem-free. The registry itself is
 * regenerated only by `npm run registry:build`; here we just embed it verbatim.
 */
function emitRegistry(): string {
  const jsonText = readFileSync(REGISTRY_IN, "utf-8");
  const literal = JSON.stringify(jsonText);
  return `/* GENERATED by 'npm run codegen:data' from data/share-registry.json. DO NOT EDIT BY HAND. */
import type { ShareRegistry } from "./registry.js";

const JSON_TEXT = ${literal};

/** The committed share-token id registry, embedded at build time. */
export const SHARE_REGISTRY: ShareRegistry = JSON.parse(JSON_TEXT) as ShareRegistry;
`;
}

function main(): void {
  const data = build();
  reportDuplicateIds(data);
  writeFileSync(OUT_FILE, emit(data));
  writeFileSync(REGISTRY_OUT, emitRegistry());
  const counts = (Object.keys(data) as (keyof RawData)[])
    .map((k) => `${k}=${data[k].length}`)
    .join(", ");
  console.log(`Wrote ${OUT_FILE}\n  ${counts}`);
  console.log(`Wrote ${REGISTRY_OUT}`);
}

main();
