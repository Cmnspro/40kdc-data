/**
 * stratagems.ts — Phase 6: reconcile stratagem numeric/structural fields against
 * the GW MFM dump.
 *
 * The repo stratagem id is `detachmentScopedId(name, detachment-name)` (bare
 * `nameToId(name)` for the 11 core stratagems with no detachment), which is how
 * the dump's (stratagem, detachment) pair slugs — so matching is a direct id
 * lookup, mirroring enhancements (Phase 3A).
 *
 * APPLIED from the dump:
 *   - cp_cost ← `cpCost` (authoritative numeric) — the only dump-verified field.
 *
 * `game_version` is left as-authored: unlike enhancements (where the confirmed
 * cost justified flipping provisional→launch), a stratagem's structural fields
 * (phases/timing) are NOT dump-verified here, so stamping launch would over-claim.
 *
 * DERIVED FOR REVIEW ONLY (reported, NOT written): phases / player_turn parsed
 * from `localisations.en.whenRules`. Naive parsing is lossy on the common
 * defensive idiom "Your opponent's Shooting phase or the Fight phase" (the Fight
 * phase belongs to either turn) and "Movement or Charge phase" (the word "phase"
 * appears once), so auto-applying would regress careful authored values. The
 * report surfaces derived-vs-authored diffs for manual triage instead. The prose
 * itself is never stored here (it routes to the out-of-repo store in 3B).
 *
 * NOT touched: `timing` (once-per-*) — the dump has no structured field for it.
 */
import * as fs from "fs";
import * as path from "path";
import { nameToId, detachmentScopedId } from "../converters/id-generator.js";
import { MfmDump, REPO_ROOT, type DetachmentRow, type StratagemRow } from "./loader.js";
import { repoDirs, repoDirForFactionName } from "./faction-map.js";
import type { StagedWrite } from "./apply.js";

const CORE_DIR = path.join(REPO_ROOT, "data", "core");

type Phase = "command" | "movement" | "shooting" | "charge" | "fight";
type PlayerTurn = "your-turn" | "opponent-turn" | "either";

interface StratRecord {
  id: string;
  name: string;
  cp_cost: number;
  phases?: Phase[];
  player_turn?: PlayerTurn;
  timing?: string;
  game_version?: { edition: string; dataslate: string };
  [k: string]: unknown;
}

interface Canon {
  cp_cost: number | null;
  phases: Phase[] | null;
  player_turn: PlayerTurn | null;
}

/** Strip BattleScribe-style inline tags (`<b>…</b>`, `<k>…</k>`) to plain text. */
function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

const PHASE_WORDS: [Phase, RegExp][] = [
  ["command", /\bcommand phase\b/i],
  ["movement", /\bmovement phase\b/i],
  ["shooting", /\bshooting phase\b/i],
  ["charge", /\bcharge phase\b/i],
  ["fight", /\bfight phase\b/i],
];

/** Derive { phases, player_turn } from a stratagem's whenRules prose. Either field
 * is null when the prose doesn't determine it (→ keep the authored value). */
export function deriveTrigger(whenRulesRaw: string | undefined | null): {
  phases: Phase[] | null;
  player_turn: PlayerTurn | null;
} {
  if (!whenRulesRaw) return { phases: null, player_turn: null };
  const t = stripTags(whenRulesRaw).toLowerCase();

  const phases: Phase[] = [];
  for (const [p, re] of PHASE_WORDS) if (re.test(t)) phases.push(p);

  // turn ownership: "your opponent's <phase>" → opponent; "your <phase>" → yours;
  // both present, or "any/either" → either; nothing decisive → null.
  const hasOpponent = /opponent('|’)s\b|opponent's\b/.test(t) || /\bopponent(’|')?s? \w*\s*phase/.test(t);
  const hasYours = /\byour (?!opponent)/.test(t);
  let player_turn: PlayerTurn | null = null;
  if (/\b(any|either)\b/.test(t) && phases.length) player_turn = "either";
  else if (hasOpponent && hasYours) player_turn = "either";
  else if (hasOpponent) player_turn = "opponent-turn";
  else if (hasYours) player_turn = "your-turn";

  return { phases: phases.length ? phases : null, player_turn };
}

/** Repo id for a dump stratagem: `detachmentScopedId` when detachment-scoped, bare
 *  `nameToId` for the coreless few. Null if the name can't be slugged. The single
 *  id rule shared by {@link buildStratCanon} and {@link stratagemInventory}. */
export function stratagemRepoId(dump: MfmDump, s: StratagemRow): string | null {
  const name = dump.enName(s);
  if (!name) return null;
  try {
    if (s.detachmentId) {
      const dn = dump.enName(dump.byId<DetachmentRow>("detachment").get(s.detachmentId));
      if (!dn) return null;
      return detachmentScopedId(name, dn);
    }
    return nameToId(name);
  } catch {
    return null;
  }
}

/** Stratagem repo-id → canon cp_cost + derived trigger, from the dump. */
export function buildStratCanon(dump: MfmDump): Map<string, Canon> {
  const m = new Map<string, Canon>();
  for (const s of dump.table<StratagemRow>("stratagem")) {
    const id = stratagemRepoId(dump, s);
    if (!id) continue;
    const when = (s.localisations?.en as { whenRules?: string } | undefined)?.whenRules;
    const { phases, player_turn } = deriveTrigger(when);
    const cp = s.cpCost != null ? parseInt(String(s.cpCost), 10) : null;
    m.set(id, { cp_cost: Number.isFinite(cp as number) ? (cp as number) : null, phases, player_turn });
  }
  return m;
}

/** dir → detachment-scoped stratagem repo-ids (the golden's `stratagems` category).
 *  Routed by the stratagem's detachment faction. The coreless stratagems (no
 *  detachmentId) live in the shared root store, so they are covered by the repo-id
 *  reader's root∪dir union rather than carried per-dir here. */
export function stratagemInventory(dump: MfmDump): Map<string, string[]> {
  const out = new Map<string, string[]>();
  for (const s of dump.table<StratagemRow>("stratagem")) {
    if (!s.detachmentId) continue;
    const id = stratagemRepoId(dump, s);
    if (!id) continue;
    const fkId = dump.factionKeywordOfDetachment(s.detachmentId);
    const fkName = fkId ? dump.enName(dump.byId("faction_keyword").get(fkId)) : undefined;
    const dir = repoDirForFactionName(fkName);
    if (!dir) continue;
    (out.get(dir) ?? out.set(dir, []).get(dir)!).push(id);
  }
  return out;
}

export interface DirStratResult {
  dir: string;
  matched: number;
  cpChanged: { id: string; from: number; to: number }[];
  phasesChanged: { id: string; from: Phase[]; to: Phase[] }[];
  turnChanged: { id: string; from?: PlayerTurn; to: PlayerTurn }[];
  unmatchedRepo: string[];
}
export interface StratReport {
  dirs: DirStratResult[];
  newInDump: number;
  staged: StagedWrite[];
}

function readJson<T>(p: string): T[] {
  return fs.existsSync(p) ? (JSON.parse(fs.readFileSync(p, "utf8")) as T[]) : [];
}
function sameArr(a: Phase[] = [], b: Phase[] = []): boolean {
  return a.length === b.length && [...a].sort().join() === [...b].sort().join();
}

export function runStratagems(dump: MfmDump, write: boolean): StratReport {
  const canon = buildStratCanon(dump);
  const matchedIds = new Set<string>();
  const dirs: DirStratResult[] = [];
  const staged: StagedWrite[] = [];

  // include the global core stratagems file alongside the per-faction ones
  const targets: string[] = ["", ...[...repoDirs()].sort()];

  for (const dir of targets) {
    const p = dir ? path.join(CORE_DIR, dir, "stratagems.json") : path.join(CORE_DIR, "stratagems.json");
    if (!fs.existsSync(p)) continue;
    const strats = readJson<StratRecord>(p);
    const res: DirStratResult = {
      dir: dir || "(core)",
      matched: 0,
      cpChanged: [],
      phasesChanged: [],
      turnChanged: [],
      unmatchedRepo: [],
    };
    let dirty = false;
    for (const s of strats) {
      const c = canon.get(s.id);
      if (!c) {
        res.unmatchedRepo.push(s.id);
        continue;
      }
      matchedIds.add(s.id);
      res.matched++;

      if (c.cp_cost != null && s.cp_cost !== c.cp_cost) {
        res.cpChanged.push({ id: s.id, from: s.cp_cost, to: c.cp_cost });
        s.cp_cost = c.cp_cost; // mutate in BOTH modes; rehearsal validates the result
        dirty = true;
      }
      // phases / player_turn: derived for review only — reported, never written
      // (naive whenRules parsing regresses "…or the Fight phase" / "X or Y phase").
      if (c.phases && !sameArr(s.phases, c.phases)) {
        res.phasesChanged.push({ id: s.id, from: s.phases ?? [], to: c.phases });
      }
      if (c.player_turn && s.player_turn !== c.player_turn) {
        res.turnChanged.push({ id: s.id, from: s.player_turn, to: c.player_turn });
      }
      // game_version intentionally left as-authored: only cp_cost is dump-verified;
      // phases/timing aren't, so flipping provisional→launch would over-claim.
    }
    if (dirty) staged.push({ path: p, value: strats });
    dirs.push(res);
  }

  const newInDump = [...canon.keys()].filter((id) => !matchedIds.has(id)).length;
  return { dirs, newInDump, staged };
}

export function buildStratReport(report: StratReport, write: boolean): string {
  const { dirs, newInDump } = report;
  const sum = (f: (d: DirStratResult) => number) => dirs.reduce((a, d) => a + f(d), 0);
  const L: string[] = [];
  L.push(`# MFM stratagems — ${write ? "APPLIED" : "DRY RUN"}`);
  L.push("");
  L.push("APPLIED: only `cp_cost` (authoritative). phases/turn columns are DERIVED FROM");
  L.push("whenRules FOR REVIEW ONLY (not written — lossy on \"…or the Fight phase\" idioms);");
  L.push("`timing` + `game_version` left authored. Triage the diffs below by hand.");
  L.push("");
  L.push("| Dir | Matched | cp applied | phases (review) | turn (review) | repo-only |");
  L.push("|---|--:|--:|--:|--:|--:|");
  for (const d of dirs.filter((d) => d.matched || d.unmatchedRepo.length)) {
    L.push(
      `| ${d.dir} | ${d.matched} | ${d.cpChanged.length} | ${d.phasesChanged.length} | ${d.turnChanged.length} | ${d.unmatchedRepo.length} |`
    );
  }
  L.push(
    `| **TOTAL** | **${sum((d) => d.matched)}** | **${sum((d) => d.cpChanged.length)}** | **${sum((d) => d.phasesChanged.length)}** | **${sum((d) => d.turnChanged.length)}** | **${sum((d) => d.unmatchedRepo.length)}** |`
  );
  L.push("");
  for (const d of dirs) {
    if (!d.cpChanged.length && !d.phasesChanged.length && !d.turnChanged.length) continue;
    L.push(`## ${d.dir}`);
    if (d.cpChanged.length) {
      L.push("", "**CP changes:**");
      d.cpChanged.forEach((c) => L.push(`- ${c.id}: ${c.from} → ${c.to}`));
    }
    if (d.phasesChanged.length) {
      L.push("", "**Phases — authored vs derived (review only, NOT applied):**");
      d.phasesChanged.forEach((c) => L.push(`- ${c.id}: [${c.from.join(",")}] vs [${c.to.join(",")}]`));
    }
    if (d.turnChanged.length) {
      L.push("", "**Player-turn — authored vs derived (review only, NOT applied):**");
      d.turnChanged.forEach((c) => L.push(`- ${c.id}: ${c.from ?? "—"} vs ${c.to}`));
    }
    L.push("");
  }
  L.push(`Stratagems in dump with no repo match (author in a follow-up): ${newInDump}`);
  L.push("");
  return L.join("\n") + "\n";
}
