/**
 * MatrixDoc — the threat matrix as both the working model AND the live-sync
 * wire shape. Unlike the team plan there is no separate storage form: the doc
 * is already id-keyed for concurrency, so `adopt` is the identity and the
 * push-diff compares two docs directly.
 *
 * The matrix is a matchup grid: OUR players (rows, snapshotted from the team
 * plan) × the selected opposing team's players (columns). Why id-keyed (the
 * same reasoning as session-doc.ts): two captains scoring two different cells
 * on the TV become `set` ops on disjoint paths
 * (`["cellsById","ours1:theirs1"]` vs `["cellsById","ours2:theirs2"]`), so they
 * commute under the server's total order. Array-index ops would land on the
 * wrong cell after a concurrent row/column change. `ourPlayers` and the team
 * order are whole-array LWW: losing an ordering/roster race is benign, losing a
 * verdict is not.
 */
import type { ForceDispositionId } from "@alpaca-software/40kdc-data";
import type { DocOp } from "../../../../_shared/doc-protocol";
import type { MatrixOurPlayer, MatrixPlayer, MatrixTeam, Verdict } from "./types";
import { dispositionId, splitBcpList, type OpponentData } from "../../../../_shared/opponents";
import type { TeamPlan } from "../coverage";

export interface MatrixDoc {
  eventName: string | null;
  /** Which opposing team is "us" (excluded from the opponent dropdown). Null
   *  until picked. Our rows come from `ourPlayers`, not from this team. */
  ourTeamId: string | null;
  /** Snapshot of the plan's team name (top-left header cell). */
  ourTeamName: string | null;
  /** OUR rows — snapshot of the team plan's players. */
  ourPlayers: MatrixOurPlayer[];
  teamsById: Record<string, MatrixTeam>;
  teamOrder: string[];
  /** Keyed `"<ourPlayerId>:<opponentPlayerId>"`. Absent key = so-so (yellow). */
  cellsById: Record<string, Verdict>;
  /** Keyed `<opponentTeamId>` → our player id chosen as lead-off defender into
   *  that team. Absent key = no pick. Per-team because the matrix spans a whole
   *  event and you lead off differently into each roster — id-keyed like
   *  `cellsById` so concurrent picks on different teams commute under sync. */
  leadOffByTeam: Record<string, string>;
  /** Keyed `<opponentPlayerId>` → the captain's hand-entered Force Disposition
   *  for that opponent. Overlays the seed-time parsed value on `MatrixPlayer`
   *  (an absent key falls back to it — see {@link effectiveDisposition}). Most
   *  BCP rows arrive without a parsed disposition, so this is how a captain
   *  records what each opponent is bringing. Id-keyed like `cellsById` so two
   *  captains entering different opponents commute under sync (a whole-`teamsById`
   *  set would clobber). */
  dispositionsById: Record<string, ForceDispositionId>;
}

/** The disposition to show/use for an opponent: the captain's hand-entered
 *  override if present, else the seed-time parsed value, else null. */
export function effectiveDisposition(
  doc: MatrixDoc,
  player: MatrixPlayer,
): ForceDispositionId | null {
  return doc.dispositionsById[player.id] ?? player.disposition;
}

export function cellKey(ourPlayerId: string, opponentPlayerId: string): string {
  return `${ourPlayerId}:${opponentPlayerId}`;
}

export function emptyMatrixDoc(): MatrixDoc {
  return {
    eventName: null,
    ourTeamId: null,
    ourTeamName: null,
    ourPlayers: [],
    teamsById: {},
    teamOrder: [],
    cellsById: {},
    leadOffByTeam: {},
    dispositionsById: {},
  };
}

/** Snapshot the plan's players into light matrix rows (id reused so cells key
 *  off the stable plan `Player.id`). */
export function seedOurPlayers(plan: TeamPlan): MatrixOurPlayer[] {
  return plan.players.map((p) => ({ id: p.id, name: p.name, factionIds: [...p.factionIds] }));
}

/**
 * Build a fresh matrix from a loaded BCP event + the current team plan: a light
 * column per opponent player (name + faction + parsed disposition), and OUR
 * rows snapshotted from the plan. List text is deliberately dropped — it stays
 * in the local OpponentData for review and never syncs.
 */
export function seedMatrixDoc(data: OpponentData, plan: TeamPlan): MatrixDoc {
  const doc = emptyMatrixDoc();
  doc.eventName = data.event.name;
  doc.ourTeamName = plan.teamName || null;
  doc.ourPlayers = seedOurPlayers(plan);
  for (const team of data.teams) {
    doc.teamsById[team.id] = {
      id: team.id,
      name: team.name,
      players: team.players.map((p) => ({
        id: p.id,
        name: p.name,
        faction: p.faction,
        disposition: p.armyListText ? dispositionId(splitBcpList(p.armyListText).header["disposition used"]) : null,
      })),
    };
    doc.teamOrder.push(team.id);
  }
  return doc;
}

/** Structural predicate: tells a matrix welcome/payload apart from a team-plan
 *  one (which carries `playersById`). Used to route the shared doc-session. The
 *  matrix carries `cellsById` + `teamsById`; the plan carries `playersById`. */
export function isMatrixShaped(payload: unknown): payload is MatrixDoc {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "cellsById" in payload &&
    "teamsById" in payload &&
    typeof (payload as { teamsById: unknown }).teamsById === "object"
  );
}

/** Heal a possibly-partial doc (older save, LWW artifact) into a complete one
 *  without dropping data: missing containers default, dangling order ids drop,
 *  present-but-unordered entries append. Deterministic, so peers converge.
 *
 *  Migration: a legacy doc from the original threat-axis design carries
 *  `axesById` and cells keyed `<player>:<axisId>` — meaningless under the new
 *  `<ours>:<theirs>` key scheme, so its verdicts are dropped rather than
 *  mis-rendered. The feature shipped one release earlier, so this clears at
 *  most a single event's in-progress scores. */
export function normalizeMatrixDoc(doc: Partial<MatrixDoc> | null | undefined): MatrixDoc {
  const base = emptyMatrixDoc();
  if (!doc) return base;
  const legacy = "axesById" in doc;
  const teamsById = { ...(doc.teamsById ?? {}) };
  const order = (ids: string[] | undefined, by: Record<string, unknown>): string[] => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const id of ids ?? []) if (by[id] && !seen.has(id)) (out.push(id), seen.add(id));
    for (const id of Object.keys(by)) if (!seen.has(id)) out.push(id);
    return out;
  };
  // Every opponent player id present across the loaded teams — used to drop
  // dangling disposition overrides whose player is gone.
  const opponentIds = new Set<string>();
  for (const team of Object.values(teamsById)) {
    for (const p of team?.players ?? []) opponentIds.add(p.id);
  }
  return {
    eventName: doc.eventName ?? null,
    ourTeamId: doc.ourTeamId ?? null,
    ourTeamName: doc.ourTeamName ?? null,
    ourPlayers: Array.isArray(doc.ourPlayers) ? doc.ourPlayers : [],
    teamsById,
    teamOrder: order(doc.teamOrder, teamsById),
    cellsById: legacy ? {} : { ...(doc.cellsById ?? {}) },
    // Drop picks whose opposing team is gone (deterministic, so peers converge).
    leadOffByTeam: Object.fromEntries(
      Object.entries(doc.leadOffByTeam ?? {}).filter(([teamId]) => teamId in teamsById),
    ),
    // Drop overrides whose opponent player is gone (deterministic, like above).
    dispositionsById: Object.fromEntries(
      Object.entries(doc.dispositionsById ?? {}).filter(([playerId]) => opponentIds.has(playerId)),
    ),
  };
}

/** Minimal op batch turning `prev` into `next`: per-key set/del on disjoint id
 *  paths for the two maps, whole-value sets for scalars and the LWW arrays. */
export function diffMatrixDocs(prev: MatrixDoc, next: MatrixDoc): DocOp[] {
  const ops: DocOp[] = [];
  if (prev.eventName !== next.eventName) ops.push({ o: "set", p: ["eventName"], v: next.eventName });
  if (prev.ourTeamId !== next.ourTeamId) ops.push({ o: "set", p: ["ourTeamId"], v: next.ourTeamId });
  if (prev.ourTeamName !== next.ourTeamName) ops.push({ o: "set", p: ["ourTeamName"], v: next.ourTeamName });

  diffMap(ops, "teamsById", prev.teamsById, next.teamsById);
  diffMap(ops, "cellsById", prev.cellsById, next.cellsById);
  diffMap(ops, "leadOffByTeam", prev.leadOffByTeam, next.leadOffByTeam);
  diffMap(ops, "dispositionsById", prev.dispositionsById, next.dispositionsById);

  if (JSON.stringify(prev.ourPlayers) !== JSON.stringify(next.ourPlayers)) {
    ops.push({ o: "set", p: ["ourPlayers"], v: next.ourPlayers });
  }
  if (JSON.stringify(prev.teamOrder) !== JSON.stringify(next.teamOrder)) {
    ops.push({ o: "set", p: ["teamOrder"], v: next.teamOrder });
  }
  return ops;
}

function diffMap(
  ops: DocOp[],
  field: string,
  prev: Record<string, unknown>,
  next: Record<string, unknown>,
): void {
  for (const [id, val] of Object.entries(next)) {
    const before = prev[id];
    if (before === undefined || JSON.stringify(before) !== JSON.stringify(val)) {
      ops.push({ o: "set", p: [field, id], v: val });
    }
  }
  for (const id of Object.keys(prev)) {
    if (!(id in next)) ops.push({ o: "del", p: [field, id] });
  }
}
