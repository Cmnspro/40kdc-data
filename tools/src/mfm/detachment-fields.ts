/**
 * detachment-fields.ts — WS2: reconcile detachment entity fields against the GW
 * MFM dump. Two structured fields the dump is authoritative for, both fill-only
 * and non-destructive (mirroring the enhancement / faction reconciles):
 *
 *   - restrictions.required_keywords ← detachment_faction_keyword (applicability)
 *   - tags                           ← detachment_unique_keyword (mutual-exclusivity)
 *
 * The derivation helpers ({@link requiredKeywordsForDetachment},
 * {@link tagsForDetachment}) are pure and are ALSO consumed by the matched-play
 * seeder ({@link seed-detachments}) so a freshly-seeded chapter-locked detachment
 * carries the same fields this reconcile would maintain on the next dump upload —
 * the "permanent" half of the fill: seeder creates, reconcile maintains.
 *
 * ── required_keywords: the applicability-vs-ownership discriminator ──
 * detachment_faction_keyword lists every faction keyword that MAY take a detachment.
 * For a roster-wide detachment (Gladius Task Force) that list is the ownership
 * keyword ("Adeptus Astartes") PLUS every sub-faction — an enumeration of "everyone
 * qualifies", NOT a restriction. For a chapter-locked detachment (Hammer of Avernii)
 * the list is exactly the locking keyword(s) ("Iron Hands") and OMITS the ownership
 * keyword. So applicability is a genuine required-keyword restriction *iff the
 * ownership keyword is absent from it* — the clean rule that separates the 7
 * chapter-locked detachments from the 259 unrestricted ones in the current dump.
 *
 * ── tags: mutual-exclusivity keyword ──
 * detachment_unique_keyword is GW's "you may include at most one detachment carrying
 * this keyword" grouping (two detachments sharing "Battlesuit" ⇒ only one per army).
 * The repo stores it as a lowercase slug (nameToId of the label), matching authored
 * data ("armoury", "lions", "reverend").
 *
 * IP: reads only ids and English keyword display names. No rules/lore prose.
 */
import * as fs from "fs";
import * as path from "path";
import { nameToId } from "../converters/id-generator.js";
import { MfmDump } from "./loader.js";
import { CORE_DIR, readJsonArray } from "./repo-files.js";
import { repoDirForFactionName, repoDirs } from "./faction-map.js";
import { keywordLabel, factionKeywordLabel } from "./keywords.js";
import type { StagedWrite } from "./apply.js";

interface DetRecord {
  id: string;
  name: string;
  faction_id: string;
  tags?: string[];
  restrictions?: { required_keywords?: string[]; excluded_keywords?: string[]; notes?: string } | null;
  [k: string]: unknown;
}

/**
 * Required-keyword labels for a detachment, or null when it is not sub-faction
 * locked. The applicability list is a genuine restriction only when it NARROWS
 * eligibility below the owning roster (see file header):
 *   - ownership keyword present in the list ⇒ roster-wide enumeration of who
 *     qualifies (all of them), not a restriction ⇒ null;
 *   - otherwise keep only applicability keywords NARROWER than the roster — drop
 *     any label that is the detachment's own roster/home keyword (its slug equals
 *     the routed dir) or the ownership keyword. Requiring the roster keyword is
 *     trivially satisfied by every unit in the army (e.g. "Aeldari" over an
 *     Asuryani-owned Aeldari detachment), so a purely-roster list ⇒ null.
 * `unresolved` collects any faction-keyword id that did not resolve to a label.
 */
export function requiredKeywordsForDetachment(
  dump: MfmDump,
  detId: string,
  unresolved?: string[],
): string[] | null {
  const ownFk = dump.factionKeywordOfDetachment(detId);
  const ownName = ownFk ? factionKeywordLabel(dump, ownFk) : null;
  const dir = repoDirForFactionName(ownName ?? undefined);
  const edges = dump.children("detachment_faction_keyword.detachmentId", detId);
  const labels: string[] = [];
  for (const e of edges) {
    const label = factionKeywordLabel(dump, e.factionKeywordId);
    if (label) labels.push(label);
    else if (unresolved) unresolved.push(e.factionKeywordId);
  }
  if (labels.length === 0) return null;
  // Ownership keyword present ⇒ roster-wide enumeration, not a restriction.
  if (ownName && labels.includes(ownName)) return null;
  // Ownership absent: a genuine lock keeps only labels narrower than the roster.
  // Drop the roster/home keyword (slug == dir) and the owner itself — requiring
  // the roster keyword restricts nothing.
  const narrowing = [...new Set(labels)].filter(
    (l) => l !== ownName && !(dir && nameToId(l) === dir),
  );
  if (narrowing.length === 0) return null;
  return narrowing.sort((a, b) => a.localeCompare(b));
}

/**
 * Mutual-exclusivity `tags` (lowercase slugs) for a detachment, from its unique
 * keywords. Empty array when the dump lists none. `unresolved` collects any
 * keyword id that did not resolve to a label.
 */
export function tagsForDetachment(dump: MfmDump, detId: string, unresolved?: string[]): string[] {
  const edges = dump.children("detachment_unique_keyword.detachmentId", detId);
  const tags = new Set<string>();
  for (const e of edges) {
    const label = keywordLabel(dump, e.keywordId);
    if (label) tags.add(nameToId(label));
    else if (unresolved) unresolved.push(e.keywordId);
  }
  return [...tags].sort((a, b) => a.localeCompare(b));
}

/**
 * Repo detachment-id → dump detachment UUID, per repo dir. A dump detachment is
 * registered under EVERY dir the repo might file it in: its publication-ownership
 * dir AND — when it is chapter-locked — each chapter dir named by its required
 * keyword(s). The repo files a chapter-locked detachment (e.g. Hammer of Avernii,
 * owned by Adeptus Astartes but locked to Iron Hands) under the CHAPTER dir
 * (`iron-hands/`), not the ownership dir, so ownership-only routing would never
 * reach it to fill its required_keywords/tags. Slug derivation mirrors
 * `buildCanon`/`dispositions` so ids line up; first observed wins on a collision.
 */
function dumpDetIdByRepoId(dump: MfmDump): Map<string, Map<string, string>> {
  const byDir = new Map<string, Map<string, string>>();
  const register = (dir: string, slug: string, detId: string): void => {
    const m = byDir.get(dir) ?? new Map<string, string>();
    if (!m.has(slug)) m.set(slug, detId);
    byDir.set(dir, m);
  };
  for (const det of dump.table("detachment")) {
    const name = dump.enName(det);
    if (!det.id || !name) continue;
    let slug: string;
    try {
      slug = nameToId(name);
    } catch {
      continue;
    }
    const ownFk = dump.factionKeywordOfDetachment(det.id);
    const ownDir = repoDirForFactionName((ownFk ? factionKeywordLabel(dump, ownFk) : undefined) ?? undefined);
    if (ownDir) register(ownDir, slug, det.id);
    // Chapter-lock: also register under each required-keyword's chapter dir.
    for (const kw of requiredKeywordsForDetachment(dump, det.id) ?? []) {
      const chapterDir = repoDirForFactionName(kw);
      if (chapterDir && chapterDir !== ownDir) register(chapterDir, slug, det.id);
    }
  }
  return byDir;
}

export interface DirDetFieldResult {
  dir: string;
  matched: number;
  tagsFilled: { id: string; to: string[] }[];
  tagsConfirmed: number;
  tagsReview: { id: string; authored: string[]; derived: string[] }[];
  reqFilled: { id: string; to: string[] }[];
  reqConfirmed: number;
  reqReview: { id: string; authored: string[]; derived: string[] }[];
  unresolvedKeywords: { id: string; ids: string[] }[];
}

export interface DetFieldsReport {
  dirs: DirDetFieldResult[];
  staged: StagedWrite[];
}

/** Sorted-array equality treating null/undefined as the empty list. */
function same(a: readonly string[] | null | undefined, b: readonly string[] | null | undefined): boolean {
  const x = [...(a ?? [])].sort();
  const y = [...(b ?? [])].sort();
  return x.length === y.length && x.every((v, i) => v === y[i]);
}

export function runDetachmentFields(dump: MfmDump): DetFieldsReport {
  const detIdByRepoId = dumpDetIdByRepoId(dump);
  const dirs: DirDetFieldResult[] = [];
  const staged: StagedWrite[] = [];

  for (const dir of [...repoDirs()].sort()) {
    const p = path.join(CORE_DIR, dir, "detachments.json");
    if (!fs.existsSync(p)) continue;
    const dets = readJsonArray<DetRecord>(p);
    const idMap = detIdByRepoId.get(dir);
    const res: DirDetFieldResult = {
      dir,
      matched: 0,
      tagsFilled: [],
      tagsConfirmed: 0,
      tagsReview: [],
      reqFilled: [],
      reqConfirmed: 0,
      reqReview: [],
      unresolvedKeywords: [],
    };
    let changed = false;

    for (const det of dets) {
      const detId = idMap?.get(det.id);
      if (!detId) continue;
      res.matched++;
      const unresolved: string[] = [];

      // tags — FILL-ONLY. Fill when authored empty; confirm when equal; a populated
      // disagreement is surfaced, never overwritten (a curated tag may encode intent
      // the dump's shared mutual-exclusivity keyword doesn't, e.g. "retaliation").
      const tags = tagsForDetachment(dump, detId, unresolved);
      const tagsAuthored = det.tags ?? [];
      if (tags.length > 0) {
        if (tagsAuthored.length === 0) {
          det.tags = tags;
          res.tagsFilled.push({ id: det.id, to: tags });
          changed = true;
        } else if (same(tagsAuthored, tags)) {
          res.tagsConfirmed++;
        } else {
          res.tagsReview.push({ id: det.id, authored: tagsAuthored, derived: tags });
        }
      }

      // restrictions.required_keywords — FILL-ONLY within the restrictions object.
      const req = requiredKeywordsForDetachment(dump, detId, unresolved);
      if (req && req.length > 0) {
        const reqAuthored = det.restrictions?.required_keywords ?? [];
        if (reqAuthored.length === 0) {
          const restrictions = det.restrictions ?? {};
          restrictions.required_keywords = req;
          det.restrictions = restrictions;
          res.reqFilled.push({ id: det.id, to: req });
          changed = true;
        } else if (same(reqAuthored, req)) {
          res.reqConfirmed++;
        } else {
          res.reqReview.push({ id: det.id, authored: reqAuthored, derived: req });
        }
      }

      if (unresolved.length) res.unresolvedKeywords.push({ id: det.id, ids: [...new Set(unresolved)] });
    }

    if (changed) staged.push({ path: p, value: dets });
    dirs.push(res);
  }

  return { dirs, staged };
}

export function buildDetFieldsReport(report: DetFieldsReport, write: boolean): string {
  const { dirs } = report;
  const sum = (f: (d: DirDetFieldResult) => number) => dirs.reduce((a, d) => a + f(d), 0);
  const L: string[] = [];
  L.push(`# MFM detachment fields — ${write ? "APPLIED" : "DRY RUN"}`);
  L.push("");
  L.push("Fill-only reconcile of `tags` (mutual-exclusivity unique keyword → slug) and");
  L.push("`restrictions.required_keywords` (chapter-lock applicability keyword). Authored");
  L.push("values are confirmed or surfaced for review, never overwritten. Prose untouched.");
  L.push("");
  L.push("| Dir | Matched | tags-fill | tags-ok | tags-rev | req-fill | req-ok | req-rev |");
  L.push("|---|--:|--:|--:|--:|--:|--:|--:|");
  for (const d of dirs.filter((d) => d.matched)) {
    if (!d.tagsFilled.length && !d.tagsConfirmed && !d.tagsReview.length && !d.reqFilled.length && !d.reqConfirmed && !d.reqReview.length)
      continue;
    L.push(
      `| ${d.dir} | ${d.matched} | ${d.tagsFilled.length} | ${d.tagsConfirmed} | ${d.tagsReview.length} | ${d.reqFilled.length} | ${d.reqConfirmed} | ${d.reqReview.length} |`,
    );
  }
  L.push(
    `| **TOTAL** | **${sum((d) => d.matched)}** | **${sum((d) => d.tagsFilled.length)}** | **${sum((d) => d.tagsConfirmed)}** | **${sum((d) => d.tagsReview.length)}** | **${sum((d) => d.reqFilled.length)}** | **${sum((d) => d.reqConfirmed)}** | **${sum((d) => d.reqReview.length)}** |`,
  );
  L.push("");
  for (const d of dirs) {
    const details: string[] = [];
    d.tagsFilled.forEach((c) => details.push(`- tags filled ${c.id}: [${c.to.join(", ")}]`));
    d.tagsReview.forEach((c) => details.push(`- tags REVIEW ${c.id}: authored [${c.authored.join(", ")}] vs dump [${c.derived.join(", ")}]`));
    d.reqFilled.forEach((c) => details.push(`- required_keywords filled ${c.id}: [${c.to.join(", ")}]`));
    d.reqReview.forEach((c) => details.push(`- required_keywords REVIEW ${c.id}: authored [${c.authored.join(", ")}] vs dump [${c.derived.join(", ")}]`));
    d.unresolvedKeywords.forEach((c) => details.push(`- unresolved keyword ids ${c.id}: ${c.ids.join(", ")}`));
    if (details.length) L.push(`## ${d.dir}`, ...details, "");
  }
  return L.join("\n") + "\n";
}
