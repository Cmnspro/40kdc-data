/**
 * wargear.ts — Phase 5: derive per-model default loadouts AND wargear-options
 * from the GW MFM dump, the authoritative source (BSData is the fallback).
 *
 * The dump models loadouts at a different altitude than the repo schema:
 *   - `base_miniature_loadout` gives each model-type's out-of-the-box weapons →
 *     maps directly onto `unit-composition.models[].default_weapon_ids`.
 *   - `loadout_choice_set` enumerates the *complete* per-model loadouts (the
 *     cross-product of every swappable slot), base branch included. Every weapon
 *     a model can field appears in some branch, so translating each set into one
 *     `replaces` (the base set) + `replacement_choice` (the non-base branches)
 *     option makes every weapon reachable — no orphans — without trying to factor
 *     the cross-product back into independent per-slot swaps (fragile + lossy).
 *   - `limited_wargear_choice_set` + `wargear_limit` carry per-weapon squad caps
 *     ("1 heavy weapon per 5 models"). The repo's per-option `model_constraint`
 *     can't express a per-weapon cap inside a cross-product option, so caps are
 *     applied best-effort (the tightest applicable ratio) and the residue is
 *     reported. Caps affect only the *advisory* maximal loadout — the pinned base
 *     loadout reads `default_weapon_ids` and is always exact.
 *
 * DRY RUN by default; `--write` applies. Matching is per faction (a datasheet is
 * reconciled against the repo unit in its own faction dir, with Space Marine /
 * Chaos shared-roster fallback to the parent dir).
 */
import * as fs from "fs";
import * as path from "path";
import { nameToId } from "../converters/id-generator.js";
import {
  MfmDump,
  REPO_ROOT,
  type DatasheetRow,
  type PublicationRow,
  type FactionKeywordRow,
  type MiniatureRow,
  type WargearItemRow,
  type WargearOptionRow,
  type BaseMiniatureLoadoutRow,
  type BaseMiniatureLoadoutWargearOptionRow,
  type LoadoutChoiceSetRow,
  type LoadoutChoiceRow,
  type LoadoutChoiceWargearItemRow,
  type LimitedWargearChoiceSetRow,
  type WargearLimitRow,
} from "./loader.js";
import { repoDirForFactionName, repoDirs, FACTION_ALIASES, SHARED_ROSTERS } from "./faction-map.js";

const CORE_DIR = path.join(REPO_ROOT, "data", "core");
const UNMATCHED_DIR = path.join(REPO_ROOT, "_private", "mfm");
const CONFIRMED = { edition: "11th", dataslate: "launch" };

interface ModelConstraint {
  model_name?: string;
  per_n_models?: number;
  max_count?: number;
  any_number?: boolean;
}
interface DerivedOption {
  replaces?: string[];
  replacement?: string[];
  replacement_choice?: string[][];
  model_constraint: ModelConstraint | null;
}
export interface DerivedWargear {
  /** model-type display name → ordered default weapon/wargear ids (repeated by count). */
  defaultsByModel: Map<string, string[]>;
  options: DerivedOption[];
  unresolved: { name: string; context: string }[];
  notes: string[];
}

interface UnitRecord {
  id: string;
  name?: string;
  weapon_ids?: string[];
  [k: string]: unknown;
}
interface CompModel {
  name: string;
  min: number;
  max: number;
  default_weapon_ids?: string[];
  is_leader_model?: boolean;
  [k: string]: unknown;
}
interface CompRecord {
  unit_id: string;
  models: CompModel[];
  [k: string]: unknown;
}
interface WargearOptionRecord {
  id: string;
  unit_id: string;
  game_version: { edition: string; dataslate: string };
  model_constraint?: ModelConstraint | null;
  replaces?: string[];
  replacement?: string[];
  replacement_choice?: string[][];
  is_free?: boolean;
  [k: string]: unknown;
}

function readJson<T>(p: string): T[] {
  return fs.existsSync(p) ? (JSON.parse(fs.readFileSync(p, "utf8")) as T[]) : [];
}

/**
 * Reviewed dump-name → repo-id overrides, by faction, for weapon-name divergences
 * the fuzzy fallback can't safely bridge (edit distance >1, or a repo "profile
 * mode" id that names the weapon differently from the GW dump). Keyed by the slug
 * `nameToId` produces from the GW wargear-item name. Each entry was confirmed by
 * the per-faction orphan diagnosis (adversarially verified: the two are the same
 * physical weapon and the target id is genuinely in the unit's weapon_ids).
 */
const WEAPON_ALIASES: Record<string, Record<string, string>> = {
  aeldari: {
    "kha-vir": "kha-vir-the-sword-of-sorrows",
    "fire-axe": "the-fire-axe",
    "blade-of-destruction": "strike",
  },
  "chaos-space-marines": {
    "hades-battle-cannon": "defiler-cannon",
    "shearing-claws": "defiler-claws",
    "tyrants-claw-heavy-flamer": "ranged",
  },
  "genestealer-cults": {
    "leaders-bio-weapons": "leaders-cult-weapons",
  },
  tyranids: {
    "screamer-killer-talons": "scream-killer-talons",
  },
};

/**
 * Reviewed always-on weapons to ensure present in a model's `default_weapon_ids`,
 * by `faction → unit_id → model display name → [weapon ids]`. These are weapons a
 * model always carries that the GW dump does not model as a base-loadout item for
 * the matched datasheet (named-character weapons, profile variants, repo
 * weapon-id spelling that differs from the dump). Merged into the derived defaults
 * after resolution — making the implicit orphan→base fallback explicit so the
 * loadout-coverage gate sees no orphan. Each entry was confirmed by the
 * per-faction orphan resolution (the weapon is fixed, not a swap/choice).
 */
const MANUAL_DEFAULTS: Record<string, Record<string, Record<string, string[]>>> = {
  // Single fixed model (min=max=1) carries the weapon the GW dump doesn't model
  // as a base item for the matched datasheet. Verified per-unit (resolution pass):
  // each target is a single-figure model row, so the weapon lands on exactly that
  // figure — never multiplied across a bulk model-type.
  "adeptus-astartes": {
    "decimus-kill-team": { "Watch Sergeant": ["plasma-pistol"] },
  },
  "agents-of-the-imperium": {
    "aquila-kill-team": { "Watch Sergeant": ["plasma-pistol"] },
    "rogue-trader-entourage": { "Lectro-Maester": ["voltaic-pistol"] },
  },
  "astra-militarum": {
    "gaunts-ghosts": { "Try Again Bragg": ["braggs-autocannon"] },
  },
  necrons: {
    "tesseract-vault": { "Tesseract Vault": ["tesla-spheres"] },
    "the-silent-king": { Szarekh: ["scythe-of-dust", "staff-of-stars"] },
  },
  "tau-empire": {
    "breacher-team": { "Fire Warrior Shas’ui": ["support-turret"] },
    "strike-team": { "Fire Warrior Shas’ui": ["support-turret"] },
  },
};

/** True when `a` and `b` differ by at most one insertion/deletion/substitution. */
export function withinEditDistance1(a: string, b: string): boolean {
  if (a === b) return true;
  const la = a.length;
  const lb = b.length;
  if (Math.abs(la - lb) > 1) return false;
  if (la === lb) {
    let diff = 0;
    for (let i = 0; i < la; i++) if (a[i] !== b[i]) if (++diff > 1) return false;
    return diff === 1;
  }
  // One longer: check it's the shorter with a single char inserted.
  const [short, long] = la < lb ? [a, b] : [b, a];
  let i = 0;
  let j = 0;
  let skipped = false;
  while (i < short.length && j < long.length) {
    if (short[i] === long[j]) {
      i++;
      j++;
    } else {
      if (skipped) return false;
      skipped = true;
      j++; // consume one extra char from the longer string
    }
  }
  return true;
}

export interface AutoResolution {
  name: string;
  from: string;
  to: string;
}

/**
 * A faction-scoped name→id resolver. Exact kebab match first; on a miss, a
 * *conservative* fuzzy fallback maps GW↔repo spelling drift (e.g. "Absolvor bolt
 * pistol" → `absolver-bolt-pistol`, plural drift) — edit distance ≤1 against the
 * faction vocabulary, the candidate unique and ≥6 chars so short ids never
 * collide. Every fuzzy hit is recorded for the report; genuine misses return null
 * (→ triaged). Mutates `audit` with each fuzzy resolution.
 */
function makeResolver(
  validIds: Set<string>,
  audit: AutoResolution[],
  aliases: Record<string, string> = {},
): (name: string) => string | null {
  const idList = [...validIds].filter((id) => id.length >= 6);
  return (name: string) => {
    let id: string;
    try {
      id = nameToId(name);
    } catch {
      return null;
    }
    if (validIds.has(id)) return id;
    // Reviewed faction override (weapon-name divergence the fuzzy pass can't bridge).
    const aliased = aliases[id];
    if (aliased && validIds.has(aliased)) {
      audit.push({ name, from: id, to: aliased });
      return aliased;
    }
    if (id.length < 6) return null;
    const near = idList.filter((v) => withinEditDistance1(id, v));
    if (near.length === 1) {
      audit.push({ name, from: id, to: near[0] });
      return near[0];
    }
    return null;
  };
}

/** Multiset difference `a − b` (per-id counts), preserving a's order. */
function multisetDiff(a: string[], b: string[]): string[] {
  const rem = new Map<string, number>();
  for (const x of b) rem.set(x, (rem.get(x) ?? 0) + 1);
  const out: string[] = [];
  for (const x of a) {
    const n = rem.get(x) ?? 0;
    if (n > 0) rem.set(x, n - 1);
    else out.push(x);
  }
  return out;
}

/** Set-equality on two id multisets (order-insensitive, count-sensitive). */
function sameMultiset(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const count = new Map<string, number>();
  for (const x of a) count.set(x, (count.get(x) ?? 0) + 1);
  for (const x of b) {
    const n = (count.get(x) ?? 0) - 1;
    if (n < 0) return false;
    count.set(x, n);
  }
  return true;
}

/**
 * Resolve a datasheet's per-model default loadout from `base_miniature_loadout`.
 * Returns a map keyed by miniature display name; unresolved items are collected.
 */
function deriveDefaults(
  dump: MfmDump,
  datasheetId: string,
  resolve: (name: string) => string | null,
  unresolved: { name: string; context: string }[],
): { byName: Map<string, string[]>; byMiniId: Map<string, string[]> } {
  const miniName = (id: string) => dump.enName(dump.byId<MiniatureRow>("miniature").get(id)) ?? id;
  const wiName = dump.byId<WargearItemRow>("wargear_item");
  const woById = dump.byId<WargearOptionRow>("wargear_option");
  const bmlOpts = dump.groupBy<BaseMiniatureLoadoutWargearOptionRow>(
    "base_miniature_loadout_wargear_option",
    "baseMiniatureLoadoutId",
  );

  const byName = new Map<string, string[]>();
  const byMiniId = new Map<string, string[]>();
  const bmls = dump
    .groupBy<BaseMiniatureLoadoutRow>("base_miniature_loadout", "datasheetId")
    .get(datasheetId);
  for (const b of bmls ?? []) {
    const ids: string[] = [];
    // If a base *weapon* fails to resolve (the GW dump names a built-in gun
    // differently from the repo — common for vehicles like the Defiler), do NOT
    // half-populate this model: a partial default would leave the unresolved
    // weapon as a false orphan. Leaving the model unpopulated lets the loadout
    // layer's orphan→base fallback handle it correctly. A non-weapon item
    // (medikit, banner) that doesn't resolve is harmless — skip just the item.
    let unresolvedWeapon = false;
    for (const x of bmlOpts.get(b.id) ?? []) {
      const wo = woById.get(x.wargearOptionId);
      if (!wo) continue;
      const item = wiName.get(wo.wargearItemId);
      const name = dump.enName(item);
      if (!name) continue;
      const id = resolve(name);
      if (!id) {
        unresolved.push({ name, context: `base loadout of ${miniName(b.miniatureId)}` });
        if ((item as WargearItemRow | undefined)?.wargearType === "weapon") unresolvedWeapon = true;
        continue;
      }
      for (let i = 0; i < Math.max(1, x.count); i++) ids.push(id);
    }
    if (ids.length && !unresolvedWeapon) {
      byName.set(miniName(b.miniatureId), ids);
      byMiniId.set(b.miniatureId, ids);
    }
  }
  return { byName, byMiniId };
}

/**
 * The *binding* (most restrictive) squad cap across a datasheet's limited-wargear
 * sets, scoped to a miniature (or datasheet-wide). A limit is `choiceLimit` picks
 * per `modelCount` models → an allowed ratio `choiceLimit/modelCount`; the binding
 * constraint is the smallest ratio (fewest copies allowed). It maps to
 * `per_n_models = ceil(1/ratio)` — rounded up so `floor(models/per_n)` never
 * *exceeds* the allowed count (conservative: the advisory maximal stays legal).
 * `non` flags a non-integer ratio (e.g. 3-per-5) the schema can't express exactly.
 */
function bindingCap(
  dump: MfmDump,
  datasheetId: string,
  miniatureId: string | null,
): { per_n_models?: number; max_count?: number; non?: string } | null {
  const sets = dump
    .groupBy<LimitedWargearChoiceSetRow>("limited_wargear_choice_set", "datasheetId")
    .get(datasheetId);
  if (!sets?.length) return null;
  const limitsBySet = dump.groupBy<WargearLimitRow>("wargear_limit", "limitedWargearChoiceSetId");
  let minRatio: number | null = null;
  let nonInteger: string | undefined;
  let flatMax: number | null = null;
  for (const s of sets) {
    // A miniature-scoped limited set applies only to that model; datasheet-wide
    // (miniatureId null) applies to all.
    if (s.miniatureId && miniatureId && s.miniatureId !== miniatureId) continue;
    for (const l of limitsBySet.get(s.id) ?? []) {
      if (l.modelCount > 0 && l.choiceLimit > 0) {
        const ratio = l.choiceLimit / l.modelCount; // copies allowed per model
        if (minRatio == null || ratio < minRatio) {
          minRatio = ratio;
          nonInteger = l.modelCount % l.choiceLimit === 0 ? undefined : `${l.choiceLimit}/${l.modelCount}`;
        }
      } else if (l.choiceLimit > 0) {
        // modelCount 0 → a flat per-unit cap.
        flatMax = flatMax == null ? l.choiceLimit : Math.min(flatMax, l.choiceLimit);
      }
    }
  }
  if (minRatio != null) return { per_n_models: Math.ceil(1 / minRatio), non: nonInteger };
  if (flatMax != null) return { max_count: flatMax };
  return null;
}

/**
 * Derive defaults + wargear-options for one datasheet. Pure over the dump + a
 * faction-scoped name resolver; the caller persists.
 */
export function deriveWargear(
  dump: MfmDump,
  datasheetId: string,
  resolve: (name: string) => string | null,
): DerivedWargear {
  const unresolved: { name: string; context: string }[] = [];
  const notes: string[] = [];
  const { byName: defaultsByModel, byMiniId: baseByMiniId } = deriveDefaults(
    dump,
    datasheetId,
    resolve,
    unresolved,
  );

  const miniName = (id: string) => dump.enName(dump.byId<MiniatureRow>("miniature").get(id)) ?? id;
  const wiName = dump.byId<WargearItemRow>("wargear_item");
  const choicesBySet = dump.groupBy<LoadoutChoiceRow>("loadout_choice", "loadoutChoiceSetId");
  const itemsByChoice = dump.groupBy<LoadoutChoiceWargearItemRow>(
    "loadout_choice_wargear_item",
    "loadoutChoiceId",
  );
  const sets = dump
    .groupBy<LoadoutChoiceSetRow>("loadout_choice_set", "datasheetId")
    .get(datasheetId);

  const multiModel = defaultsByModel.size > 1;
  const options: DerivedOption[] = [];

  for (const set of (sets ?? []).slice().sort((a, b) => a.id.localeCompare(b.id))) {
    const mini = set.miniatureId ? miniName(set.miniatureId) : null;
    // Base = the miniature's recorded base loadout (by id — robust to a dump↔repo
    // model-name mismatch that would otherwise misidentify the no-swap branch).
    const base = (set.miniatureId && baseByMiniId.get(set.miniatureId)) || null;
    if (set.alternate) notes.push(`alternate loadout_choice_set ${set.id.slice(0, 8)} (${mini ?? "all"}) — review`);

    // Resolve each choice branch to an id multiset; drop unresolved-emptied branches.
    const branches: string[][] = [];
    for (const ch of (choicesBySet.get(set.id) ?? []).slice().sort((a, b) => a.id.localeCompare(b.id))) {
      const ids: string[] = [];
      let dropped = false;
      for (const it of itemsByChoice.get(ch.id) ?? []) {
        const name = dump.enName(wiName.get(it.wargearItemId));
        if (!name) continue;
        const id = resolve(name);
        if (!id) {
          unresolved.push({ name, context: `loadout choice (${mini ?? "all"})` });
          dropped = true;
          continue;
        }
        for (let i = 0; i < Math.max(1, it.count); i++) ids.push(id);
      }
      if (dropped && ids.length === 0) continue;
      if (ids.length) branches.push(ids);
    }
    if (branches.length === 0) continue;

    const baseSet = base ?? branches[0];
    // Factor each branch into its DELTA vs the model's base loadout: only the
    // weapons that actually change become a swap, so an unchanged slot's weapon
    // never lands on both the `replaces` and `replacement` side (which would make
    // a fixed base weapon look swappable and corrupt its bounds). Branches that
    // remove the same set are grouped into one option's `replacement_choice`.
    const groups = new Map<string, { removed: string[]; added: string[][] }>();
    const seenAdded = new Set<string>();
    for (const b of branches) {
      const removed = multisetDiff(baseSet, b);
      const added = multisetDiff(b, baseSet);
      if (removed.length === 0 && added.length === 0) continue; // == base, no-op
      const rKey = [...removed].sort().join("|");
      const aKey = `${rKey}>>${[...added].sort().join("|")}`;
      if (seenAdded.has(aKey)) continue; // duplicate delta
      seenAdded.add(aKey);
      const g = groups.get(rKey) ?? { removed, added: [] };
      // A pure-removal branch (added empty) can't be a replacement; skip it — the
      // base already covers "not taking the upgrade".
      if (added.length > 0) g.added.push(added);
      groups.set(rKey, g);
    }

    const cap = bindingCap(dump, datasheetId, set.miniatureId);
    const mc: ModelConstraint = {};
    if (mini && multiModel) mc.model_name = mini;
    if (cap?.per_n_models) {
      mc.per_n_models = cap.per_n_models;
      if (cap.non)
        notes.push(`non-integer cap ${cap.non} on ${mini ?? "all"} — approximated to per_n_models ${cap.per_n_models} (advisory maximal only)`);
    } else if (cap?.max_count) {
      mc.max_count = cap.max_count;
    } else {
      mc.any_number = true;
    }

    for (const { removed, added } of groups.values()) {
      if (added.length === 0) continue;
      const opt: DerivedOption = {
        model_constraint: Object.keys(mc).length ? { ...mc } : null,
      };
      if (removed.length > 0) opt.replaces = removed;
      if (added.length === 1) opt.replacement = added[0];
      else opt.replacement_choice = added;
      options.push(opt);
    }
  }

  return { defaultsByModel, options, unresolved, notes };
}

// ─────────────────────────── per-faction apply ───────────────────────────

/**
 * All candidate repo dirs for a datasheet's faction keyword. The direct dir
 * (when one exists) PLUS any shared-roster parents: a Space Marine chapter dir
 * (`black-templars`) holds only chapter-specific entities — its generic units
 * (Crusader Squad) live in the shared `adeptus-astartes` roster — so a chapter
 * datasheet must be allowed to match in the parent too. The first candidate that
 * actually contains the unit id wins (handled by the caller's matched-set guard).
 */
function candidateDirs(dump: MfmDump, ds: DatasheetRow): string[] {
  const pub = dump.byId<PublicationRow>("publication").get(ds.publicationId);
  const name = pub?.factionKeywordId
    ? dump.enName(dump.byId<FactionKeywordRow>("faction_keyword").get(pub.factionKeywordId))
    : undefined;
  if (!name) return [];
  const out: string[] = [];
  const direct = repoDirForFactionName(name);
  if (direct) out.push(direct);
  let slug: string | undefined;
  try {
    slug = FACTION_ALIASES[name] ?? nameToId(name);
  } catch {
    slug = undefined;
  }
  for (const p of (slug ? SHARED_ROSTERS[slug] : undefined) ?? []) {
    if (repoDirs().has(p) && !out.includes(p)) out.push(p);
  }
  return out.filter((d) => repoDirs().has(d));
}

/** 0 when `dir` is the datasheet's own home faction dir, 1 when it's a shared-roster import. */
function homeScore(dump: MfmDump, ds: DatasheetRow, dir: string): number {
  const pub = dump.byId<PublicationRow>("publication").get(ds.publicationId);
  const name = pub?.factionKeywordId
    ? dump.enName(dump.byId<FactionKeywordRow>("faction_keyword").get(pub.factionKeywordId))
    : undefined;
  return name && repoDirForFactionName(name) === dir ? 0 : 1;
}

export interface DirWargearResult {
  dir: string;
  matched: number;
  optionsChanged: number;
  defaultsChanged: number;
  unresolvedNames: { id: string; name: string; context: string }[];
  /** GW↔repo spelling drift auto-resolved by the fuzzy fallback (auditable). */
  autoResolved: { name: string; from: string; to: string }[];
  notes: { id: string; note: string }[];
  /** dump-present datasheet with no repo unit by that id (author follow-up). */
  newInDump: string[];
  /** repo unit not present in the dump → keeps its BSData-derived data (fallback). */
  repoOnlyFallback: string[];
}
export interface WargearReport {
  dirs: DirWargearResult[];
}

export function runWargear(dump: MfmDump, write: boolean, onlyDir?: string): WargearReport {
  const dirs = repoDirs();
  // Bucket datasheets by candidate repo dir.
  const byDir = new Map<string, DatasheetRow[]>();
  for (const ds of dump.table<DatasheetRow>("datasheet")) {
    if (ds.isLegends) continue;
    for (const dir of candidateDirs(dump, ds)) {
      if (!dirs.has(dir)) continue;
      (byDir.get(dir) ?? byDir.set(dir, []).get(dir)!).push(ds);
    }
  }

  const results: DirWargearResult[] = [];
  for (const dir of [...dirs].sort()) {
    if (onlyDir && dir !== onlyDir) continue;
    const upath = path.join(CORE_DIR, dir, "units.json");
    const wpath = path.join(CORE_DIR, dir, "wargear-options.json");
    const cpath = path.join(CORE_DIR, dir, "unit-compositions.json");
    const weaponsPath = path.join(CORE_DIR, dir, "weapons.json");
    if (!fs.existsSync(upath)) continue;

    const units = readJson<UnitRecord>(upath);
    const byId = new Map(units.map((u) => [u.id, u]));
    const comps = readJson<CompRecord>(cpath);
    // A unit can carry several compositions (different build tiers) — index ALL
    // of them so derived defaults and manual overrides patch every one, not just
    // the last (a Map keyed by unit_id would silently drop the earlier tiers).
    const compsByUnit = new Map<string, CompRecord[]>();
    for (const c of comps) (compsByUnit.get(c.unit_id) ?? compsByUnit.set(c.unit_id, []).get(c.unit_id)!).push(c);
    const wopts = readJson<WargearOptionRecord>(wpath);

    // Faction-wide valid id vocabulary: every weapon + every id already referenced
    // by a unit or an existing option (so dump weapons missing from weapons.json
    // but present as a unit weapon_id still resolve).
    const validIds = new Set<string>(readJson<{ id?: string }>(weaponsPath).map((w) => w.id ?? ""));
    for (const u of units) for (const id of u.weapon_ids ?? []) validIds.add(id);
    for (const o of wopts) {
      for (const id of o.replaces ?? []) validIds.add(id);
      for (const id of o.replacement ?? []) validIds.add(id);
      for (const g of o.replacement_choice ?? []) for (const id of g) validIds.add(id);
    }
    const autoResolved: AutoResolution[] = [];
    const resolve = makeResolver(validIds, autoResolved, WEAPON_ALIASES[dir] ?? {});

    const res: DirWargearResult = {
      dir,
      matched: 0,
      optionsChanged: 0,
      defaultsChanged: 0,
      unresolvedNames: [],
      autoResolved: [],
      notes: [],
      newInDump: [],
      repoOnlyFallback: [],
    };
    const matchedRepoIds = new Set<string>();
    const optionsByUnit = new Map<string, WargearOptionRecord[]>();
    let compsChanged = false;
    let optsChanged = false;

    // Process home-faction datasheets before shared-roster imports, so a unit's
    // own-faction loadout wins over a chapter/legion variant of the same name.
    const dsList = (byDir.get(dir) ?? [])
      .slice()
      .sort((a, b) => homeScore(dump, a, dir) - homeScore(dump, b, dir));
    for (const ds of dsList) {
      const name = dump.enName(ds);
      if (!name) continue;
      let id: string;
      try {
        id = nameToId(name);
      } catch {
        continue;
      }
      const rec = byId.get(id);
      if (!rec) {
        if (!res.newInDump.includes(id)) res.newInDump.push(id);
        continue;
      }
      if (matchedRepoIds.has(id)) continue; // first candidate dir wins
      matchedRepoIds.add(id);
      res.matched++;

      const derived = deriveWargear(dump, ds.id!, resolve);
      for (const u of derived.unresolved) res.unresolvedNames.push({ id, name: u.name, context: u.context });
      for (const n of derived.notes) res.notes.push({ id, note: n });

      // ── defaults → composition model rows (match by model name), every tier ──
      if (derived.defaultsByModel.size) {
        for (const comp of compsByUnit.get(id) ?? []) {
          for (const m of comp.models) {
            const ids = derived.defaultsByModel.get(m.name);
            if (!ids?.length) continue;
            const cur = Array.isArray(m.default_weapon_ids) ? m.default_weapon_ids : [];
            if (!sameMultiset(cur, ids)) {
              res.defaultsChanged++;
              if (write) m.default_weapon_ids = ids;
              compsChanged = true;
            }
          }
        }
      }

      // ── options → wargear-options for this unit ──
      const built: WargearOptionRecord[] = derived.options.map((o, i) => {
        const rec: WargearOptionRecord = {
          id: `${id}-wgo-mfm-${i + 1}`,
          unit_id: id,
          game_version: { ...CONFIRMED },
          is_free: true,
        };
        if (o.replaces) rec.replaces = o.replaces;
        if (o.replacement) rec.replacement = o.replacement;
        if (o.replacement_choice) rec.replacement_choice = o.replacement_choice;
        if (o.model_constraint) rec.model_constraint = o.model_constraint;
        return rec;
      });
      optionsByUnit.set(id, built);
      if (built.length) {
        res.optionsChanged += built.length;
        optsChanged = true;
      }
    }

    // ── MANUAL_DEFAULTS: reviewed always-on weapons appended to a model's defaults
    // (faction → unit → model → ids). Applied here, after the dump pass, so it lands
    // whether or not the dump matched the datasheet, and APPENDS to the model's
    // current default loadout — never dropping a derived or pre-existing weapon.
    for (const [unitId, perModel] of Object.entries(MANUAL_DEFAULTS[dir] ?? {})) {
      for (const comp of compsByUnit.get(unitId) ?? []) {
        for (const m of comp.models) {
          const add = perModel[m.name];
          if (!add?.length) continue;
          const cur = Array.isArray(m.default_weapon_ids) ? m.default_weapon_ids : [];
          const merged = [...cur, ...add.filter((x) => !cur.includes(x))];
          if (!sameMultiset(cur, merged)) {
            res.defaultsChanged++;
            if (write) m.default_weapon_ids = merged;
            compsChanged = true;
          }
        }
      }
    }

    // Dump-primary rebuild of wargear-options: replace every matched unit's
    // options with the dump-derived set; keep options for dump-absent units.
    if (write && optsChanged) {
      const kept = wopts.filter((o) => !optionsByUnit.has(o.unit_id));
      const rebuilt = [...kept];
      for (const u of units) {
        const built = optionsByUnit.get(u.id);
        if (built) rebuilt.push(...built);
      }
      fs.writeFileSync(wpath, JSON.stringify(rebuilt, null, 2) + "\n");
    }
    if (write && compsChanged) fs.writeFileSync(cpath, JSON.stringify(comps, null, 2) + "\n");

    const seenAuto = new Set<string>();
    for (const a of autoResolved) {
      const k = `${a.from}→${a.to}`;
      if (seenAuto.has(k)) continue;
      seenAuto.add(k);
      res.autoResolved.push(a);
    }
    res.autoResolved.sort((a, b) => a.from.localeCompare(b.from));
    for (const u of units) {
      if (!matchedRepoIds.has(u.id)) res.repoOnlyFallback.push(u.id);
    }
    res.repoOnlyFallback.sort();
    res.newInDump.sort();
    res.unresolvedNames.sort((a, b) => a.id.localeCompare(b.id) || a.name.localeCompare(b.name));
    results.push(res);
  }

  if (write && results.some((r) => r.unresolvedNames.length)) {
    if (!fs.existsSync(UNMATCHED_DIR)) fs.mkdirSync(UNMATCHED_DIR, { recursive: true });
    fs.writeFileSync(
      path.join(UNMATCHED_DIR, "unmatched-wargear.json"),
      JSON.stringify(
        results.flatMap((r) => r.unresolvedNames.map((u) => ({ dir: r.dir, ...u }))),
        null,
        2,
      ) + "\n",
    );
  }
  return { dirs: results };
}

export function buildWargearReport(report: WargearReport, write: boolean): string {
  const { dirs } = report;
  const sum = (f: (d: DirWargearResult) => number) => dirs.reduce((a, d) => a + f(d), 0);
  const L: string[] = [];
  L.push(`# MFM wargear — ${write ? "APPLIED" : "DRY RUN"}`);
  L.push("");
  L.push("Dump-primary `default_weapon_ids` + wargear-options. BSData retained only for");
  L.push("dump-absent (repo-only) units. Unresolved weapon names are triaged, never guessed.");
  L.push("");
  L.push("| Dir | Matched | Options | Defaults Δ | Unresolved | Fuzzy | Notes | New-in-dump | Repo-only (fallback) |");
  L.push("|---|--:|--:|--:|--:|--:|--:|--:|--:|");
  for (const d of dirs.filter((d) => d.matched || d.repoOnlyFallback.length)) {
    L.push(
      `| ${d.dir} | ${d.matched} | ${d.optionsChanged} | ${d.defaultsChanged} | ${d.unresolvedNames.length} | ${d.autoResolved.length} | ${d.notes.length} | ${d.newInDump.length} | ${d.repoOnlyFallback.length} |`,
    );
  }
  L.push(
    `| **TOTAL** | **${sum((d) => d.matched)}** | **${sum((d) => d.optionsChanged)}** | **${sum((d) => d.defaultsChanged)}** | **${sum((d) => d.unresolvedNames.length)}** | **${sum((d) => d.autoResolved.length)}** | **${sum((d) => d.notes.length)}** | **${sum((d) => d.newInDump.length)}** | **${sum((d) => d.repoOnlyFallback.length)}** |`,
  );
  L.push("");
  for (const d of dirs) {
    if (!d.unresolvedNames.length && !d.notes.length && !d.autoResolved.length) continue;
    L.push(`## ${d.dir}`);
    if (d.autoResolved.length) {
      L.push("", "**Fuzzy-resolved spelling drift (GW name → repo id, edit-distance ≤1):**");
      d.autoResolved.forEach((a) => L.push(`- \`${a.name}\` → \`${a.to}\` (was \`${a.from}\`)`));
    }
    if (d.unresolvedNames.length) {
      L.push("", "**Unresolved weapon names (no repo id — option/default incomplete):**");
      const byName = new Map<string, Set<string>>();
      for (const u of d.unresolvedNames) (byName.get(u.name) ?? byName.set(u.name, new Set()).get(u.name)!).add(u.id);
      for (const [name, units] of [...byName].sort()) L.push(`- \`${name}\` — ${[...units].sort().join(", ")}`);
    }
    if (d.notes.length) {
      L.push("", "**Notes (cap approximations / alternates):**");
      d.notes.forEach((n) => L.push(`- ${n.id}: ${n.note}`));
    }
    L.push("");
  }
  return L.join("\n") + "\n";
}
