/**
 * seed-detachments.ts — create skeleton Combat-Patrol detachment + enhancement
 * entities for CP-box detachments the GW MFM dump defines but the repo has not
 * authored yet. The detachment/enhancement analog of {@link seed-units}.
 *
 * Every OTHER detachment/enhancement subcommand only ENRICHES entities that
 * already exist — `dispositions` and `enhancements` match a dump row to a repo
 * entity by slug and hold back anything with no match (their `cpExcluded`
 * branches). This command acts on exactly that branch: it emits schema- and
 * integrity-valid entities for the held-back Combat-Patrol content, mirroring the
 * World Eaters `frenzied-reavers` pilot.
 *
 * It is scoped to Combat Patrol only (`detachment.isCombatPatrol`) and, like
 * `seed-units`, holds those back unless `--include-combat-patrol` is passed (a
 * plain run reports what WOULD be created but writes nothing). New competitive
 * detachments are a separate concern (faction packs) and are NOT seeded here.
 *
 * Values come from the SAME dump fields the golden + reconcilers use, so an
 * emitted entity's id / DP / disposition cannot drift from them:
 *   - detachment id      = nameToId(name)                        (detIdsByDir / buildCanon)
 *   - detachment_points  = detachmentPointsCost (+ per-faction override)
 *   - force_dispositions = detachment_force_disposition → force_disposition slug
 *   - enhancement id     = detachmentScopedId(name, detName)     (enhIdsByDir / buildEnhCanon)
 * Combat Patrol has no enhancement points (the dump's `basePointsCost` is null for
 * every CP enhancement), so enhancements are authored `cost: 0`, matching the
 * pilot — the values the `enhancements` reconcile pass leaves untouched for CP.
 *
 * IP: reads ONLY numeric/id fields (detachmentPointsCost, force-disposition
 * names, enhancement names/costs). It NEVER dereferences GW rules/lore prose.
 */
import * as path from "path";
import { nameToId, detachmentScopedId } from "../converters/id-generator.js";
import { MfmDump, type DetachmentRow,
type EnhancementRow,
type DetachmentForceDispositionRow, } from "./loader.js";
import { readJsonArray, CORE_DIR } from "./repo-files.js";
import { repoDirForFactionName, repoDirs } from "./faction-map.js";
import { buildCanon, dispositionIdMap } from "./dispositions.js";
import { cleanEnhName } from "./enhancements.js";
import type { StagedWrite } from "./apply.js";


const CONFIRMED = { edition: "11th", dataslate: "launch" } as const;
/** Combat-Patrol-only entities carry this so the golden files them on the
 *  combat-patrol coverage dimension instead of inflating competitive gaps. */
const COMBAT_PATROL_ONLY: readonly string[] = ["combat-patrol"];

interface SeedDetachment {
  id: string;
  name: string;
  faction_id: string;
  enhancement_ids: string[];
  game_version: { edition: string; dataslate: string };
  game_modes: string[];
  detachment_points: number;
  force_dispositions: string[];
}

interface SeedEnhancement {
  id: string;
  name: string;
  detachment_id: string;
  cost: number;
  is_unique: boolean;
  game_version: { edition: string; dataslate: string };
  game_modes: string[];
  points_provisional: boolean;
}

interface IdRecord {
  id: string;
  [k: string]: unknown;
}

export interface SeedDetachmentsOptions {
  onlyDir?: string;
  includeCombatPatrol?: boolean;
}

export interface DirSeedDetResult {
  dir: string;
  createdDetachments: { id: string; name: string }[];
  createdEnhancements: { id: string; name: string }[];
  /** CP detachments held back because --include-combat-patrol was not passed. */
  cpExcluded: { id: string; name: string }[];
  /** CP detachments/enhancements already present in the repo (idempotent skip). */
  skipped: { id: string; reason: string }[];
}

export interface SeedDetachmentsReport {
  dirs: DirSeedDetResult[];
  staged: StagedWrite[];
}

function detachmentsPath(dir: string): string {
  return path.join(CORE_DIR, dir, "detachments.json");
}
function enhancementsPath(dir: string): string {
  return path.join(CORE_DIR, dir, "enhancements.json");
}



/** One dump CP detachment resolved to its dir + derived skeleton facts. */
export interface CandidateDet {
  dir: string;
  id: string;
  name: string;
  dp: number;
  disposition: string;
  enhancements: SeedEnhancement[];
}

/**
 * Resolve every Combat-Patrol detachment in the dump to a repo dir plus the
 * complete detachment + enhancement skeletons, using the same derivation the
 * golden + reconcilers use. Throws on a genuinely unauthorable row (missing dir,
 * missing disposition, null DP, or an enhancement whose raw name would slug to a
 * DIFFERENT id than the cleaned name — which the golden and reconciler would then
 * disagree on; see the file header) so the failure is loud, not a silent gap.
 */
export function collectCombatPatrolDetachments(dump: MfmDump): CandidateDet[] {
  const { overrideBySlugDir } = buildCanon(dump);
  const dispOf = dispositionIdMap(dump);
  const detDisp = dump.groupBy("detachment_force_disposition", "detachmentId");
  const knownDirs = repoDirs();

  // Bucket CP enhancements by their detachment UUID.
  const enhByDet = new Map<string, EnhancementRow[]>();
  for (const e of dump.table("enhancement")) {
    if (!e.isCombatPatrol) continue;
    (enhByDet.get(e.detachmentId) ?? enhByDet.set(e.detachmentId, []).get(e.detachmentId)!).push(e);
  }

  const out: CandidateDet[] = [];
  for (const det of dump.table("detachment")) {
    if (!det.isCombatPatrol || !det.id) continue;
    const name = dump.enName(det);
    if (!name) throw new Error(`CP detachment <${det.id}> has no English name`);
    const id = nameToId(name);
    const fkId = dump.factionKeywordOfDetachment(det.id);
    const fkName = fkId ? dump.enName(dump.byId("faction_keyword").get(fkId)) : undefined;
    const dir = repoDirForFactionName(fkName);
    if (!dir || !knownDirs.has(dir)) {
      throw new Error(`CP detachment "${name}" routes to unknown dir (faction "${fkName}")`);
    }
    const dp = overrideBySlugDir.get(`${id}@@${dir}`) ?? det.detachmentPointsCost;
    if (dp == null) throw new Error(`CP detachment "${name}" has no detachment_points in the dump`);
    const dispUuid = detDisp.get(det.id)?.[0]?.forceDispositionId;
    const disposition = dispUuid ? dispOf.get(dispUuid) : undefined;
    if (!disposition) throw new Error(`CP detachment "${name}" has no force disposition in the dump`);

    const enhancements: SeedEnhancement[] = [];
    for (const e of enhByDet.get(det.id) ?? []) {
      const en = dump.enName(e);
      if (!en) throw new Error(`CP enhancement <${e.id}> of "${name}" has no English name`);
      const clean = cleanEnhName(en);
      const enhId = detachmentScopedId(clean, name);
      // The golden (enhIdsByDir) slugs the RAW dump name; the reconcile canon +
      // repo convention slug the cleaned name. They coincide only when the name
      // carries no parenthetical tag. Fail loudly if they diverge so the golden
      // derivation is fixed BEFORE a mismatched id ships as an uncovered gap.
      if (detachmentScopedId(en, name) !== enhId) {
        throw new Error(
          `CP enhancement "${en}" of "${name}" slugs differently raw vs cleaned — ` +
            `fix enhIdsByDir to use cleanEnhName before seeding`,
        );
      }
      enhancements.push({
        id: enhId,
        name: clean,
        detachment_id: id,
        cost: 0,
        is_unique: true,
        game_version: { ...CONFIRMED },
        game_modes: [...COMBAT_PATROL_ONLY],
        points_provisional: false,
      });
    }
    enhancements.sort((a, b) => a.id.localeCompare(b.id));
    out.push({ dir, id, name, dp, disposition, enhancements });
  }
  return out;
}

export function runSeedDetachments(
  dump: MfmDump,
  opts: SeedDetachmentsOptions = {},
): SeedDetachmentsReport {
  const { onlyDir, includeCombatPatrol = false } = opts;
  const candidates = collectCombatPatrolDetachments(dump);

  // dir → mutated detachment/enhancement arrays (loaded once, appended in place).
  const detsByDir = new Map<string, IdRecord[]>();
  const enhsByDir = new Map<string, IdRecord[]>();
  const loadDets = (dir: string): IdRecord[] => {
    let a = detsByDir.get(dir);
    if (!a) detsByDir.set(dir, (a = readJsonArray<IdRecord>(detachmentsPath(dir))));
    return a;
  };
  const loadEnhs = (dir: string): IdRecord[] => {
    let a = enhsByDir.get(dir);
    if (!a) enhsByDir.set(dir, (a = readJsonArray<IdRecord>(enhancementsPath(dir))));
    return a;
  };

  const resultByDir = new Map<string, DirSeedDetResult>();
  const result = (dir: string): DirSeedDetResult => {
    let r = resultByDir.get(dir);
    if (!r) {
      resultByDir.set(
        dir,
        (r = { dir, createdDetachments: [], createdEnhancements: [], cpExcluded: [], skipped: [] }),
      );
    }
    return r;
  };
  const touchedDets = new Set<string>();
  const touchedEnhs = new Set<string>();

  for (const c of candidates.sort((a, b) => a.dir.localeCompare(b.dir) || a.id.localeCompare(b.id))) {
    if (onlyDir && c.dir !== onlyDir) continue;
    const res = result(c.dir);
    const dets = loadDets(c.dir);

    // A detachment already in the repo is fully authored (its enhancements were
    // seeded alongside it), so this is an idempotent skip in BOTH modes — a re-run
    // is a no-op, mirroring how seed-units filters datasheets that already exist.
    if (dets.some((d) => d.id === c.id)) {
      res.skipped.push({ id: c.id, reason: `detachment "${c.id}" already in ${c.dir}` });
      continue;
    }
    // Not yet authored: without the flag it is held back (reported, not created),
    // mirroring how seed-units holds back Combat-Patrol datasheets.
    if (!includeCombatPatrol) {
      res.cpExcluded.push({ id: c.id, name: c.name });
      continue;
    }

    const enhs = loadEnhs(c.dir);
    const enhIds = new Set(enhs.map((e) => e.id));
    const enhancementIds: string[] = [];
    for (const enh of c.enhancements) {
      enhancementIds.push(enh.id);
      if (enhIds.has(enh.id)) {
        res.skipped.push({ id: enh.id, reason: `enhancement "${enh.id}" already in ${c.dir}` });
        continue;
      }
      enhs.push(enh as unknown as IdRecord);
      enhIds.add(enh.id);
      touchedEnhs.add(c.dir);
      res.createdEnhancements.push({ id: enh.id, name: enh.name });
    }

    const detachment: SeedDetachment = {
      id: c.id,
      name: c.name,
      faction_id: c.dir,
      enhancement_ids: enhancementIds,
      game_version: { ...CONFIRMED },
      game_modes: [...COMBAT_PATROL_ONLY],
      detachment_points: c.dp,
      force_dispositions: [c.disposition],
    };
    dets.push(detachment as unknown as IdRecord);
    touchedDets.add(c.dir);
    res.createdDetachments.push({ id: c.id, name: c.name });
  }

  const staged: StagedWrite[] = [];
  for (const dir of [...touchedDets].sort()) staged.push({ path: detachmentsPath(dir), value: detsByDir.get(dir) });
  for (const dir of [...touchedEnhs].sort()) staged.push({ path: enhancementsPath(dir), value: enhsByDir.get(dir) });

  return { dirs: [...resultByDir.values()].sort((a, b) => a.dir.localeCompare(b.dir)), staged };
}

export function buildSeedDetachmentsReport(report: SeedDetachmentsReport, write: boolean): string {
  const { dirs } = report;
  const L: string[] = [];
  L.push(`# MFM seed-detachments — ${write ? "APPLIED" : "DRY RUN"}`);
  L.push("");
  L.push("Skeleton Combat-Patrol detachments + enhancements created for dump CP-box");
  L.push("detachments that had no repo entity. Stratagems are left as combat-patrol");
  L.push("gaps (the dump has no structured `timing` field to author them faithfully).");
  L.push("");
  L.push("| Dir | Detachments created | Enhancements created | Held back (CP) | Skipped (exist) |");
  L.push("| --- | --- | --- | --- | --- |");
  for (const d of dirs) {
    L.push(
      `| ${d.dir} | ${d.createdDetachments.length} | ${d.createdEnhancements.length} | ${d.cpExcluded.length} | ${d.skipped.length} |`,
    );
  }
  const sum = (f: (d: DirSeedDetResult) => number): number => dirs.reduce((a, d) => a + f(d), 0);
  L.push("");
  L.push(
    `Total: ${sum((d) => d.createdDetachments.length)} detachment(s), ` +
      `${sum((d) => d.createdEnhancements.length)} enhancement(s) created; ` +
      `${sum((d) => d.cpExcluded.length)} held back; ${sum((d) => d.skipped.length)} skipped.`,
  );
  L.push("");
  for (const d of dirs) {
    if (!d.createdDetachments.length && !d.cpExcluded.length) continue;
    L.push(`## ${d.dir}`);
    for (const c of d.createdDetachments) L.push(`- created detachment \`${c.id}\` (${c.name})`);
    for (const c of d.createdEnhancements) L.push(`  - enhancement \`${c.id}\` (${c.name})`);
    for (const c of d.cpExcluded) L.push(`- held back \`${c.id}\` (${c.name})`);
    L.push("");
  }
  return L.join("\n") + "\n";
}
