/**
 * enhancements.ts — Phase 3A: reconcile enhancement point costs against the
 * GW MFM dump.
 *
 * The repo enhancement id is `detachmentScopedId(name, detachment-name)`, which
 * is exactly how the dump's (enhancement, detachment) pair slugs — so matching is
 * a direct id lookup. For each matched enhancement we set the canon `cost`, clear
 * `points_provisional`, and stamp the confirmed launch dataslate (cost is the
 * provisional field here, so confirming it is precisely what those flags record —
 * unlike Phase 2 dispositions, where touching game_version would over-claim).
 *
 * Prose (`localisations.en.rules`/`lore`) is NOT handled here — it routes to the
 * out-of-repo store in a dedicated unified pass (3B), never into this repo.
 */
import * as fs from "fs";
import * as path from "path";
import { detachmentScopedId } from "../converters/id-generator.js";
import { MfmDump, type DetachmentRow,
type EnhancementRow,
type MfmTableName, type MfmStringKey, type MfmRow, } from "./loader.js";
import { readJsonArray, CORE_DIR } from "./repo-files.js";
import { repoDirs } from "./faction-map.js";
import { keywordLabel, factionKeywordLabel, keywordLabels } from "./keywords.js";
import type { StagedWrite } from "./apply.js";


const CONFIRMED = { edition: "11th", dataslate: "launch" };

interface EnhRecord {
  id: string;
  name: string;
  cost: number;
  points_provisional?: boolean;
  game_version?: { edition: string; dataslate: string };
  game_modes?: string[];
  upgrade_tag?: boolean;
  max_targets?: number;
  exclusion_keywords?: string[] | null;
  keyword_restrictions?: string[] | null;
  [k: string]: unknown;
}

export interface DirEnhResult {
  dir: string;
  matched: number;
  costChanged: { id: string; from: number; to: number }[];
  confirmed: number; // matched enhancements whose provisional/slate flags flipped
  unmatchedRepo: string[];
  // WS1a field-accuracy reconcile (upgrade_tag / max_targets / keywords).
  upgradeChanged: { id: string; from: boolean; to: boolean }[];
  maxTargetsChanged: { id: string; from: number; to: number }[];
  // Keyword fields are FILL-ONLY: written only when the repo authored nothing, so a
  // finer authored restriction (a unit keyword the dump's army-level group omits) is
  // never destroyed. A populated authored value that disagrees is surfaced, not written.
  exclusionFilled: { id: string; to: string[] }[];
  exclusionReview: { id: string; authored: string[]; derived: string[] }[];
  restrictionsFilled: { id: string; to: string[] }[];
  /** Populated authored restrictions that differ from the dump (kept, review). `reason`
   *  is "multi-group-or" (flat list can't hold the OR) or "differs" (authored is finer). */
  restrictionsReview: { id: string; authored: string[] | null; derived: string[]; reason: string }[];
  /** Dump keyword ids that did not resolve to a repo label (skipped, not written). */
  unresolvedKeywords: { id: string; ids: string[] }[];
}

export interface EnhReport {
  dirs: DirEnhResult[];
  newInDump: string[];
  cpExcluded: string[]; // CP-only dump enhancement ids held back from newInDump (default)
  staged: StagedWrite[];
}



/**
 * Strip a trailing parenthetical tag the dump appends to enhancement names
 * (" (Upgrade)", " (Aura)", " (Psychic)") but the repo entity name (and thus its
 * id) omits. This is the canonical repo representation of an MFM enhancement name:
 * `buildEnhCanon`, `buildEnhFieldCanon`, the seeder, the golden (`enhIdsByDir`),
 * and the id-normalizer all route names through here so a fresh MFM import and the
 * committed data agree on one id per enhancement.
 */
export function cleanEnhName(name: string): string {
  return name.replace(/\s*\([^)]*\)\s*$/, "").trim();
}

/** Enhancement repo-id → canon base points cost, from the dump. Combat-Patrol
 *  enhancements carry a null `basePointsCost` (CP has no enhancement points), so
 *  the value is `number | null` and callers must not overwrite an authored cost
 *  with null. */
export function buildEnhCanon(dump: MfmDump): Map<string, number | null> {
  const detName = dump.byId("detachment");
  const m = new Map<string, number | null>();
  for (const e of dump.table("enhancement")) {
    const en = dump.enName(e);
    const dn = dump.enName(detName.get(e.detachmentId));
    if (!en || !dn) continue;
    try {
      m.set(detachmentScopedId(cleanEnhName(en), dn), e.basePointsCost);
    } catch {
      /* unsluggable — skip */
    }
  }
  return m;
}

/** groupBy that tolerates a focused fixture omitting the table (returns empty). */
function safeGroupBy<N extends MfmTableName, K extends MfmStringKey<N>>(
  dump: MfmDump,
  name: N,
  key: K,
): ReadonlyMap<string, readonly MfmRow<N>[]> {
  return dump.tables[name] ? dump.groupBy(name, key) : new Map<string, readonly MfmRow<N>[]>();
}

/** Sorted-array equality treating null/undefined as the empty list. */
function sameLabels(a: readonly string[] | null | undefined, b: readonly string[] | null | undefined): boolean {
  const x = a ?? [];
  const y = b ?? [];
  return x.length === y.length && x.every((v, i) => v === y[i]);
}

/** Structured enhancement fields the dump can supply beyond cost. */
export interface EnhFields {
  upgrade_tag: boolean;
  max_targets: number;
  /** Resolved exclusion keyword labels, or null when the dump lists none. */
  exclusion_keywords: string[] | null;
  /** Resolved required-keyword restriction labels, or null when the dump lists none. */
  keyword_restrictions: string[] | null;
  /** True when >1 required-keyword group carries a *different* member set — an OR the
   *  flat keyword_restrictions list can't express, so the reconcile preserves authored. */
  keywordRestrictionsAmbiguous: boolean;
  /** Dump keyword/faction-keyword ids that did not resolve to a repo label. */
  unresolvedKeywordIds: string[];
}

/**
 * Enhancement repo-id → structured fields, from the dump. Keyed identically to
 * {@link buildEnhCanon} (`detachmentScopedId(cleanEnhName, detachment)`) so a
 * matched repo enhancement's fields line up with its cost.
 *
 *   - upgrade_tag           ← enhancementType === "upgrade" (11e upgrade class)
 *   - max_targets           ← limit (how many copies may be taken; default 1)
 *   - exclusion_keywords    ← enhancement_excluded_keyword.keywordId → labels
 *   - keyword_restrictions  ← required-keyword-group keyword + faction-keyword members
 *
 * Required-keyword groups model "bearer must have keyword(s)"; datasheet-scoped
 * groups carry no keyword members (verified in the dump), so unioning members
 * across all of an enhancement's groups is faithful for the single-group majority.
 * Multi-group enhancements with divergent member sets are an OR the flat list
 * can't hold — flagged `keywordRestrictionsAmbiguous` so the reconcile keeps the
 * authored value rather than over-claim an AND.
 */
export function buildEnhFieldCanon(dump: MfmDump): Map<string, EnhFields> {
  const detName = dump.byId("detachment");
  const excludedByEnh = safeGroupBy(dump, "enhancement_excluded_keyword", "enhancementId");
  const groupsByEnh = safeGroupBy(dump, "enhancement_required_keyword_group", "enhancementId");
  const kwByGroup = safeGroupBy(dump, "enhancement_required_keyword_group_keyword", "enhancementRequiredKeywordGroupId");
  const fkwByGroup = safeGroupBy(dump, "enhancement_required_keyword_group_faction_keyword", "enhancementRequiredKeywordGroupId");

  const out = new Map<string, EnhFields>();
  for (const e of dump.table("enhancement")) {
    const en = dump.enName(e);
    const dn = dump.enName(detName.get(e.detachmentId));
    if (!en || !dn) continue;
    let id: string;
    try {
      id = detachmentScopedId(cleanEnhName(en), dn);
    } catch {
      continue; // unsluggable — skip
    }

    const unresolved: string[] = [];
    const exclusion_keywords = keywordLabels(
      dump,
      (excludedByEnh.get(e.id) ?? []).map((r) => r.keywordId),
      unresolved,
    );

    const datasheetById = dump.tables.datasheet ? dump.byId("datasheet") : undefined;
    const groupSets: string[][] = [];
    for (const g of groupsByEnh.get(e.id) ?? []) {
      const members = new Set<string>();
      for (const r of kwByGroup.get(g.id) ?? []) {
        const label = keywordLabel(dump, r.keywordId);
        if (label) members.add(label);
        else unresolved.push(r.keywordId);
      }
      for (const r of fkwByGroup.get(g.id) ?? []) {
        const label = factionKeywordLabel(dump, r.factionKeywordId);
        if (label) members.add(label);
        else unresolved.push(r.factionKeywordId);
      }
      // A datasheet-scoped group names the specific unit the enhancement (usually a
      // wargear upgrade) attaches to; the repo authors that datasheet name as a
      // restriction keyword (e.g. "Exorcist"). Include it so a FILL of an empty field
      // carries the unit specificity, not just the army keyword.
      if (g.datasheetId) {
        const dsName = dump.enName(datasheetById?.get(g.datasheetId));
        if (dsName) members.add(dsName);
        else unresolved.push(g.datasheetId);
      }
      if (members.size) groupSets.push([...members].sort((a, b) => a.localeCompare(b)));
    }
    const distinctSets = new Set(groupSets.map((s) => s.join(" ")));
    const union = [...new Set(groupSets.flat())].sort((a, b) => a.localeCompare(b));

    out.set(id, {
      upgrade_tag: e.enhancementType === "upgrade",
      max_targets: typeof e.limit === "number" ? e.limit : 1,
      exclusion_keywords,
      keyword_restrictions: union.length ? union : null,
      keywordRestrictionsAmbiguous: distinctSets.size > 1,
      unresolvedKeywordIds: [...new Set(unresolved)],
    });
  }
  return out;
}

/**
 * Repo-ids of the dump's Combat-Patrol-box enhancements. These are intentionally
 * not authored in the repo (mirroring how `seed-units`/`dispositions` hold back
 * Combat-Patrol content), so they are filtered out of `newInDump` by default.
 * Id'd exactly as `buildEnhCanon` keys its canon so the ids line up.
 */
export function combatPatrolEnhIds(dump: MfmDump): Set<string> {
  const detName = dump.byId("detachment");
  const ids = new Set<string>();
  for (const e of dump.table("enhancement")) {
    if (!e.isCombatPatrol) continue;
    const en = dump.enName(e);
    const dn = dump.enName(detName.get(e.detachmentId));
    if (!en || !dn) continue;
    try {
      ids.add(detachmentScopedId(cleanEnhName(en), dn));
    } catch {
      /* unsluggable — skip */
    }
  }
  return ids;
}

export function runEnhancements(
  dump: MfmDump,
  write: boolean,
  opts: { includeCombatPatrol?: boolean } = {}
): EnhReport {
  const canon = buildEnhCanon(dump);
  const fieldCanon = buildEnhFieldCanon(dump);
  const matchedIds = new Set<string>();
  const dirs: DirEnhResult[] = [];
  const staged: StagedWrite[] = [];
  // CP enhancements carry the combat-patrol game mode so a reconcile of authored
  // Combat Patrol content keeps it filed on the non-competitive dimension.
  const cpIds = combatPatrolEnhIds(dump);

  for (const dir of [...repoDirs()].sort()) {
    const p = path.join(CORE_DIR, dir, "enhancements.json");
    if (!fs.existsSync(p)) continue;
    const enhs = readJsonArray<EnhRecord>(p);
    const res: DirEnhResult = {
      dir,
      matched: 0,
      costChanged: [],
      confirmed: 0,
      unmatchedRepo: [],
      upgradeChanged: [],
      maxTargetsChanged: [],
      exclusionFilled: [],
      exclusionReview: [],
      restrictionsFilled: [],
      restrictionsReview: [],
      unresolvedKeywords: [],
    };
    for (const e of enhs) {
      const cost = canon.get(e.id);
      if (cost === undefined) {
        res.unmatchedRepo.push(e.id);
        continue;
      }
      matchedIds.add(e.id);
      res.matched++;
      // The dump carries no points cost for Combat-Patrol enhancements
      // (basePointsCost is null; CP has no enhancement points). Leave the authored
      // cost untouched (0 by convention) rather than overwriting it with null;
      // still reconcile game mode + confirm below.
      if (cost !== null) {
        if (e.cost !== cost) res.costChanged.push({ id: e.id, from: e.cost, to: cost });
      }
      const needsConfirm =
        e.points_provisional !== false ||
        e.game_version?.dataslate !== CONFIRMED.dataslate ||
        e.game_version?.edition !== CONFIRMED.edition;
      if (needsConfirm) res.confirmed++;
      // Mutate in-memory in BOTH modes; the dry-run rehearsal validates the result.
      if (cost !== null) e.cost = cost;
      e.points_provisional = false;
      if (e.game_version) {
        e.game_version.edition = CONFIRMED.edition;
        e.game_version.dataslate = CONFIRMED.dataslate;
      }
      if (cpIds.has(e.id)) e.game_modes = ["combat-patrol"];

      // WS1a field-accuracy reconcile. Mutate in BOTH modes; the dry run rehearses.
      const f = fieldCanon.get(e.id);
      if (f) {
        if ((e.upgrade_tag ?? false) !== f.upgrade_tag) {
          res.upgradeChanged.push({ id: e.id, from: e.upgrade_tag ?? false, to: f.upgrade_tag });
          e.upgrade_tag = f.upgrade_tag;
        }
        if ((e.max_targets ?? 1) !== f.max_targets) {
          res.maxTargetsChanged.push({ id: e.id, from: e.max_targets ?? 1, to: f.max_targets });
          e.max_targets = f.max_targets;
        }
        // Exclusions — FILL-ONLY. Fill when the repo lists none; confirm when equal;
        // surface a populated disagreement rather than clobber an authored exclusion.
        const exclAuthored = e.exclusion_keywords ?? [];
        if (f.exclusion_keywords !== null) {
          if (exclAuthored.length === 0) {
            res.exclusionFilled.push({ id: e.id, to: f.exclusion_keywords });
            e.exclusion_keywords = f.exclusion_keywords;
          } else if (!sameLabels(exclAuthored, f.exclusion_keywords)) {
            res.exclusionReview.push({ id: e.id, authored: exclAuthored, derived: f.exclusion_keywords });
          }
        }
        // Keyword restrictions — FILL-ONLY, and never fill from a multi-group OR the
        // flat list can't hold. The dump's required-keyword group is army-level; the
        // repo often authors a finer unit keyword, so a populated value is kept and any
        // disagreement is surfaced for a human to reconcile, never auto-overwritten.
        const restrAuthored = e.keyword_restrictions ?? [];
        if (f.keyword_restrictions !== null) {
          if (restrAuthored.length === 0) {
            if (f.keywordRestrictionsAmbiguous) {
              res.restrictionsReview.push({ id: e.id, authored: null, derived: f.keyword_restrictions, reason: "multi-group-or" });
            } else {
              res.restrictionsFilled.push({ id: e.id, to: f.keyword_restrictions });
              e.keyword_restrictions = f.keyword_restrictions;
            }
          } else if (!sameLabels(restrAuthored, f.keyword_restrictions)) {
            res.restrictionsReview.push({
              id: e.id,
              authored: restrAuthored,
              derived: f.keyword_restrictions,
              reason: f.keywordRestrictionsAmbiguous ? "multi-group-or" : "differs",
            });
          }
        }
        if (f.unresolvedKeywordIds.length) res.unresolvedKeywords.push({ id: e.id, ids: f.unresolvedKeywordIds });
      }
    }
    staged.push({ path: p, value: enhs });
    dirs.push(res);
  }

  const unmatched = [...canon.keys()].filter((id) => !matchedIds.has(id));
  const cp = cpIds;
  const cpExcluded: string[] = [];
  const newInDump: string[] = [];
  for (const id of unmatched) {
    if (!opts.includeCombatPatrol && cp.has(id)) cpExcluded.push(id);
    else newInDump.push(id);
  }
  newInDump.sort();
  cpExcluded.sort();
  return { dirs, newInDump, cpExcluded, staged };
}

export function buildEnhReport(report: EnhReport, write: boolean): string {
  const { dirs, newInDump, cpExcluded } = report;
  const sum = (f: (d: DirEnhResult) => number) => dirs.reduce((a, d) => a + f(d), 0);
  const L: string[] = [];
  L.push(`# MFM enhancement reconcile — ${write ? "APPLIED" : "DRY RUN"}`);
  L.push("");
  L.push("Reconciles enhancement `cost` (confirmed → `points_provisional: false`, launch");
  L.push("dataslate) and the GW-authoritative scalars `upgrade_tag`/`max_targets` (overwritten).");
  L.push("`exclusion_keywords`/`keyword_restrictions` are FILL-ONLY — written only when the repo");
  L.push("authored none; a populated disagreement is surfaced (review), never overwritten, so a");
  L.push("finer authored unit keyword the dump's army-level group omits is preserved. Prose untouched.");
  L.push("");
  L.push("| Dir | Matched | Cost | upgrade | max_tgt | excl-fill | excl-rev | restr-fill | restr-rev | Repo-only |");
  L.push("|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|");
  for (const d of dirs.filter((d) => d.matched || d.unmatchedRepo.length)) {
    L.push(
      `| ${d.dir} | ${d.matched} | ${d.costChanged.length} | ${d.upgradeChanged.length} | ${d.maxTargetsChanged.length} | ${d.exclusionFilled.length} | ${d.exclusionReview.length} | ${d.restrictionsFilled.length} | ${d.restrictionsReview.length} | ${d.unmatchedRepo.length} |`
    );
  }
  L.push(
    `| **TOTAL** | **${sum((d) => d.matched)}** | **${sum((d) => d.costChanged.length)}** | **${sum((d) => d.upgradeChanged.length)}** | **${sum((d) => d.maxTargetsChanged.length)}** | **${sum((d) => d.exclusionFilled.length)}** | **${sum((d) => d.exclusionReview.length)}** | **${sum((d) => d.restrictionsFilled.length)}** | **${sum((d) => d.restrictionsReview.length)}** | **${sum((d) => d.unmatchedRepo.length)}** |`
  );
  L.push("");
  for (const d of dirs) {
    const hasDetail =
      d.costChanged.length ||
      d.upgradeChanged.length ||
      d.maxTargetsChanged.length ||
      d.exclusionFilled.length ||
      d.exclusionReview.length ||
      d.restrictionsFilled.length ||
      d.restrictionsReview.length ||
      d.unresolvedKeywords.length ||
      d.unmatchedRepo.length;
    if (!hasDetail) continue;
    L.push(`## ${d.dir}`);
    if (d.costChanged.length) {
      L.push("", "**Cost changes** (old → new):");
      d.costChanged.forEach((c) => L.push(`- ${c.id}: ${c.from} → ${c.to}`));
    }
    if (d.upgradeChanged.length) {
      L.push("", "**upgrade_tag changes:**");
      d.upgradeChanged.forEach((c) => L.push(`- ${c.id}: ${c.from} → ${c.to}`));
    }
    if (d.maxTargetsChanged.length) {
      L.push("", "**max_targets changes:**");
      d.maxTargetsChanged.forEach((c) => L.push(`- ${c.id}: ${c.from} → ${c.to}`));
    }
    if (d.exclusionFilled.length) {
      L.push("", "**exclusion_keywords filled:**");
      d.exclusionFilled.forEach((c) => L.push(`- ${c.id}: [${c.to.join(", ")}]`));
    }
    if (d.restrictionsFilled.length) {
      L.push("", "**keyword_restrictions filled:**");
      d.restrictionsFilled.forEach((c) => L.push(`- ${c.id}: [${c.to.join(", ")}]`));
    }
    if (d.exclusionReview.length) {
      L.push("", "**exclusion_keywords — authored differs from dump (kept, REVIEW):**");
      d.exclusionReview.forEach((c) =>
        L.push(`- ${c.id}: authored [${c.authored.join(", ")}] vs dump [${c.derived.join(", ")}]`),
      );
    }
    if (d.restrictionsReview.length) {
      L.push("", "**keyword_restrictions — authored kept, REVIEW:**");
      d.restrictionsReview.forEach((c) =>
        L.push(`- ${c.id} (${c.reason}): authored [${(c.authored ?? []).join(", ")}] vs dump-union [${c.derived.join(", ")}]`),
      );
    }
    if (d.unresolvedKeywords.length) {
      L.push("", "**Unresolved dump keyword ids (skipped):**");
      d.unresolvedKeywords.forEach((c) => L.push(`- ${c.id}: ${c.ids.join(", ")}`));
    }
    if (d.unmatchedRepo.length) {
      L.push("", "**Repo enhancements absent from dump** (left as-is):");
      d.unmatchedRepo.forEach((id) => L.push(`- ${id}`));
    }
    L.push("");
  }
  if (newInDump.length) {
    L.push("## New enhancements in dump (no repo entity — author in a follow-up)");
    L.push("");
    newInDump.slice(0, 200).forEach((s) => L.push(`- ${s}`));
    if (newInDump.length > 200) L.push(`- …and ${newInDump.length - 200} more`);
    L.push("");
  }
  if (cpExcluded.length) {
    L.push(
      `## Combat-Patrol enhancements held back (${cpExcluded.length} — pass --include-combat-patrol to author)`
    );
    L.push("");
    cpExcluded.slice(0, 200).forEach((s) => L.push(`- ${s}`));
    if (cpExcluded.length > 200) L.push(`- …and ${cpExcluded.length - 200} more`);
    L.push("");
  }
  return L.join("\n") + "\n";
}
