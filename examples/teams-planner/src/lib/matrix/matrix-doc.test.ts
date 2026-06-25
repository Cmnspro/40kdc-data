import { describe, it, expect } from "vitest";
import {
  cellKey,
  diffMatrixDocs,
  emptyMatrixDoc,
  isMatrixShaped,
  normalizeMatrixDoc,
  seedMatrixDoc,
  seedOurPlayers,
  type MatrixDoc,
} from "./matrix-doc";
import { planToSessionDoc } from "../session-doc";
import type { TeamPlan } from "../coverage";
import type { OpponentData } from "../../../../_shared/opponents";

const SAMPLE: OpponentData = {
  event: { id: "evt", name: "ATC", teamEvent: true },
  teams: [
    {
      id: "t1",
      name: "Alpha",
      players: [
        // header carries a disposition we should parse onto the light column
        {
          id: "p1",
          name: "Ann",
          faction: "World Eaters",
          armyListText: "++++++++++\nDisposition Used: Purge the Foe\n++++++++++\n\nbody",
        },
        { id: "p2", name: "Bob", faction: "Orks", armyListText: null },
      ],
    },
  ],
};

const PLAN: TeamPlan = {
  teamName: "Our Crew",
  size: 5,
  players: [
    { id: "us1", name: "Cal", factionIds: ["aeldari"], armies: [], preferences: [], locked: {} },
    { id: "us2", name: "Dot", factionIds: ["orks", "necrons"], armies: [], preferences: [], locked: {} },
  ],
};

describe("seedMatrixDoc", () => {
  it("snapshots our rows + team name and drops opponent list text", () => {
    const doc = seedMatrixDoc(SAMPLE, PLAN);
    expect(doc.teamOrder).toEqual(["t1"]);
    expect(doc.teamsById.t1.players.map((p) => p.id)).toEqual(["p1", "p2"]);
    expect(doc.ourTeamName).toBe("Our Crew");
    expect(doc.ourPlayers.map((p) => p.id)).toEqual(["us1", "us2"]);
    expect(doc.ourPlayers[1].factionIds).toEqual(["orks", "necrons"]);
    // no armyListText leaks into the synced doc
    expect(JSON.stringify(doc)).not.toContain("body");
    expect(doc.cellsById).toEqual({});
  });

  it("parses the BCP-header disposition onto the opponent column", () => {
    const doc = seedMatrixDoc(SAMPLE, PLAN);
    expect(doc.teamsById.t1.players[0].disposition).toBe("purge-the-foe");
    expect(doc.teamsById.t1.players[1].disposition).toBe(null);
  });

  it("seedOurPlayers reuses the plan player id (so cells key off it)", () => {
    expect(seedOurPlayers(PLAN)).toEqual([
      { id: "us1", name: "Cal", factionIds: ["aeldari"] },
      { id: "us2", name: "Dot", factionIds: ["orks", "necrons"] },
    ]);
  });
});

describe("isMatrixShaped", () => {
  it("accepts a matrix doc and rejects a team-plan session doc", () => {
    expect(isMatrixShaped(seedMatrixDoc(SAMPLE, PLAN))).toBe(true);
    const planDoc = planToSessionDoc({ teamName: "x", size: 5, players: [] });
    expect(isMatrixShaped(planDoc)).toBe(false);
    expect(isMatrixShaped(null)).toBe(false);
  });
});

describe("verdict cells", () => {
  it("an absent cell reads as so-so; good/bad round-trip through the key", () => {
    const doc = seedMatrixDoc(SAMPLE, PLAN);
    expect(doc.cellsById[cellKey("us1", "p1")]).toBeUndefined(); // so-so default
    const next: MatrixDoc = { ...doc, cellsById: { [cellKey("us1", "p1")]: "good" } };
    expect(next.cellsById["us1:p1"]).toBe("good");
  });
});

describe("diffMatrixDocs", () => {
  it("emits a disjoint set op per changed cell", () => {
    const a = seedMatrixDoc(SAMPLE, PLAN);
    const b: MatrixDoc = { ...a, cellsById: { ...a.cellsById, [cellKey("us1", "p1")]: "good" } };
    const ops = diffMatrixDocs(a, b);
    expect(ops).toEqual([{ o: "set", p: ["cellsById", "us1:p1"], v: "good" }]);
  });

  it("emits a del op for a cell returned to so-so", () => {
    const a: MatrixDoc = { ...emptyMatrixDoc(), cellsById: { "us1:p1": "bad" } };
    const b: MatrixDoc = { ...a, cellsById: {} };
    expect(diffMatrixDocs(a, b)).toEqual([{ o: "del", p: ["cellsById", "us1:p1"] }]);
  });

  it("two cells changed → two independent ops (commute under the server)", () => {
    const a = emptyMatrixDoc();
    const b: MatrixDoc = { ...a, cellsById: { "us1:p1": "good", "us2:p2": "bad" } };
    const ops = diffMatrixDocs(a, b);
    expect(ops).toHaveLength(2);
    expect(ops.every((o) => o.o === "set" && o.p[0] === "cellsById")).toBe(true);
  });

  it("our roster + team name changes ride as whole-array / scalar LWW", () => {
    const a = emptyMatrixDoc();
    const b: MatrixDoc = {
      ...a,
      ourTeamName: "New Name",
      ourPlayers: [{ id: "us9", name: "Eve", factionIds: [] }],
    };
    const ops = diffMatrixDocs(a, b);
    expect(ops).toContainEqual({ o: "set", p: ["ourTeamName"], v: "New Name" });
    expect(ops).toContainEqual({ o: "set", p: ["ourPlayers"], v: b.ourPlayers });
  });

  it("identical docs diff to nothing (self-stabilizing)", () => {
    const a = seedMatrixDoc(SAMPLE, PLAN);
    expect(diffMatrixDocs(a, a)).toEqual([]);
  });
});

describe("normalizeMatrixDoc", () => {
  it("fills missing containers", () => {
    const n = normalizeMatrixDoc({ eventName: "E" } as Partial<MatrixDoc>);
    expect(n.teamsById).toEqual({});
    expect(n.ourPlayers).toEqual([]);
    expect(n.ourTeamName).toBe(null);
    expect(n.cellsById).toEqual({});
  });

  it("drops dangling order ids and appends unordered entries", () => {
    const n = normalizeMatrixDoc({
      teamsById: { real: { id: "real", name: "R", players: [] } },
      teamOrder: ["ghost", "real"],
    } as Partial<MatrixDoc>);
    expect(n.teamOrder).toEqual(["real"]);
  });

  it("migrates a legacy axis-keyed doc by clearing its now-meaningless cells", () => {
    // The original threat-axis design keyed cells `<player>:<axisId>`; under the
    // new `<ours>:<theirs>` scheme those verdicts can't be mapped, so drop them.
    const legacy = {
      eventName: "Old",
      axesById: { threat: { id: "threat", label: "Threat", kind: "tier" } },
      axisOrder: ["threat"],
      cellsById: { "p1:threat": "high" },
    } as unknown as Partial<MatrixDoc>;
    const n = normalizeMatrixDoc(legacy);
    expect(n.cellsById).toEqual({});
    expect("axesById" in n).toBe(false);
  });
});
