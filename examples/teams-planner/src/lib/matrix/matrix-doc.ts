/**
 * MatrixDoc — the threat matrix as both the working model AND the live-sync
 * wire shape. Unlike the team plan there is no separate storage form: the doc
 * is already id-keyed for concurrency, so `adopt` is the identity and the
 * push-diff compares two docs directly.
 *
 * Why id-keyed (the same reasoning as session-doc.ts): two captains scoring two
 * different cells on the TV become `set` ops on disjoint paths
 * (`["cellsById","p1:threat"]` vs `["cellsById","p2:avoid"]`), so they commute
 * under the server's total order. Array-index ops would land on the wrong cell
 * after a concurrent axis insert/remove. Team/axis order are whole-array LWW:
 * losing an ordering race is benign, losing a score is not.
 */
import type { DocOp } from "../../../../_shared/doc-protocol";
import { DEFAULT_AXES, type CellValue, type MatrixTeam, type ThreatAxis } from "./types";
import { dispositionId, splitBcpList, type OpponentData } from "../opponents";

export interface MatrixDoc {
  eventName: string | null;
  /** Which team is "us" (rendered muted, never scored). Null until picked. */
  ourTeamId: string | null;
  teamsById: Record<string, MatrixTeam>;
  teamOrder: string[];
  axesById: Record<string, ThreatAxis>;
  axisOrder: string[];
  /** Keyed `"<playerId>:<axisId>"`. Absent key = unset. */
  cellsById: Record<string, CellValue>;
}

export function cellKey(playerId: string, axisId: string): string {
  return `${playerId}:${axisId}`;
}

export function emptyMatrixDoc(): MatrixDoc {
  const axesById: Record<string, ThreatAxis> = {};
  for (const a of DEFAULT_AXES) axesById[a.id] = { ...a };
  return {
    eventName: null,
    ourTeamId: null,
    teamsById: {},
    teamOrder: [],
    axesById,
    axisOrder: DEFAULT_AXES.map((a) => a.id),
    cellsById: {},
  };
}

/**
 * Build a fresh matrix from a loaded BCP event: a light row per player (name +
 * faction + parsed disposition) and the default axes. List text is deliberately
 * dropped — it stays in the local OpponentData for review and never syncs.
 */
export function seedMatrixDoc(data: OpponentData): MatrixDoc {
  const doc = emptyMatrixDoc();
  doc.eventName = data.event.name;
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
 *  one (which carries `playersById`). Used to route the shared doc-session. */
export function isMatrixShaped(payload: unknown): payload is MatrixDoc {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "cellsById" in payload &&
    "axesById" in payload &&
    typeof (payload as { axesById: unknown }).axesById === "object"
  );
}

/** Heal a possibly-partial doc (older save, LWW artifact) into a complete one
 *  without dropping data: missing containers default, dangling order ids drop,
 *  present-but-unordered entries append. Deterministic, so peers converge. */
export function normalizeMatrixDoc(doc: Partial<MatrixDoc> | null | undefined): MatrixDoc {
  const base = emptyMatrixDoc();
  if (!doc) return base;
  const teamsById = { ...(doc.teamsById ?? {}) };
  const axesById = Object.keys(doc.axesById ?? {}).length ? { ...doc.axesById } as Record<string, ThreatAxis> : base.axesById;
  const order = (ids: string[] | undefined, by: Record<string, unknown>): string[] => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const id of ids ?? []) if (by[id] && !seen.has(id)) (out.push(id), seen.add(id));
    for (const id of Object.keys(by)) if (!seen.has(id)) out.push(id);
    return out;
  };
  return {
    eventName: doc.eventName ?? null,
    ourTeamId: doc.ourTeamId ?? null,
    teamsById,
    teamOrder: order(doc.teamOrder, teamsById),
    axesById,
    axisOrder: order(doc.axisOrder, axesById),
    cellsById: { ...(doc.cellsById ?? {}) },
  };
}

/** Minimal op batch turning `prev` into `next`: per-key set/del on disjoint id
 *  paths for the three maps, whole-value sets for scalars and the order arrays. */
export function diffMatrixDocs(prev: MatrixDoc, next: MatrixDoc): DocOp[] {
  const ops: DocOp[] = [];
  if (prev.eventName !== next.eventName) ops.push({ o: "set", p: ["eventName"], v: next.eventName });
  if (prev.ourTeamId !== next.ourTeamId) ops.push({ o: "set", p: ["ourTeamId"], v: next.ourTeamId });

  diffMap(ops, "teamsById", prev.teamsById, next.teamsById);
  diffMap(ops, "axesById", prev.axesById, next.axesById);
  diffMap(ops, "cellsById", prev.cellsById, next.cellsById);

  if (JSON.stringify(prev.teamOrder) !== JSON.stringify(next.teamOrder)) {
    ops.push({ o: "set", p: ["teamOrder"], v: next.teamOrder });
  }
  if (JSON.stringify(prev.axisOrder) !== JSON.stringify(next.axisOrder)) {
    ops.push({ o: "set", p: ["axisOrder"], v: next.axisOrder });
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
