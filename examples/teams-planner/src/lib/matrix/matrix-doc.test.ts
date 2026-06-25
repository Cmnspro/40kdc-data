import { describe, it, expect } from "vitest";
import {
  cellKey,
  diffMatrixDocs,
  emptyMatrixDoc,
  isMatrixShaped,
  normalizeMatrixDoc,
  seedMatrixDoc,
  type MatrixDoc,
} from "./matrix-doc";
import { planToSessionDoc } from "../session-doc";
import type { OpponentData } from "../opponents";

const SAMPLE: OpponentData = {
  event: { id: "evt", name: "ATC", teamEvent: true },
  teams: [
    {
      id: "t1",
      name: "Alpha",
      players: [
        // header carries a disposition we should parse onto the light row
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

describe("seedMatrixDoc", () => {
  it("builds light rows + default axes and drops list text", () => {
    const doc = seedMatrixDoc(SAMPLE);
    expect(doc.teamOrder).toEqual(["t1"]);
    expect(doc.teamsById.t1.players.map((p) => p.id)).toEqual(["p1", "p2"]);
    // no armyListText leaks into the synced doc
    expect(JSON.stringify(doc)).not.toContain("body");
    expect(doc.axisOrder.length).toBeGreaterThan(0);
  });

  it("parses the BCP-header disposition onto the row", () => {
    const doc = seedMatrixDoc(SAMPLE);
    expect(doc.teamsById.t1.players[0].disposition).toBe("purge-the-foe");
    expect(doc.teamsById.t1.players[1].disposition).toBe(null);
  });
});

describe("isMatrixShaped", () => {
  it("accepts a matrix doc and rejects a team-plan session doc", () => {
    expect(isMatrixShaped(seedMatrixDoc(SAMPLE))).toBe(true);
    const planDoc = planToSessionDoc({ teamName: "x", size: 5, players: [] });
    expect(isMatrixShaped(planDoc)).toBe(false);
    expect(isMatrixShaped(null)).toBe(false);
  });
});

describe("diffMatrixDocs", () => {
  it("emits a disjoint set op per changed cell", () => {
    const a = seedMatrixDoc(SAMPLE);
    const b: MatrixDoc = { ...a, cellsById: { ...a.cellsById, [cellKey("p1", "threat")]: "high" } };
    const ops = diffMatrixDocs(a, b);
    expect(ops).toEqual([{ o: "set", p: ["cellsById", "p1:threat"], v: "high" }]);
  });

  it("emits a del op for a cleared cell", () => {
    const a: MatrixDoc = { ...emptyMatrixDoc(), cellsById: { "p1:threat": "high" } };
    const b: MatrixDoc = { ...a, cellsById: {} };
    expect(diffMatrixDocs(a, b)).toEqual([{ o: "del", p: ["cellsById", "p1:threat"] }]);
  });

  it("two cells changed → two independent ops (commute under the server)", () => {
    const a = emptyMatrixDoc();
    const b: MatrixDoc = { ...a, cellsById: { "p1:threat": "high", "p2:avoid": true } };
    const ops = diffMatrixDocs(a, b);
    expect(ops).toHaveLength(2);
    expect(ops.every((o) => o.o === "set" && o.p[0] === "cellsById")).toBe(true);
  });

  it("handles axis add/remove and order as whole-array LWW", () => {
    const a = emptyMatrixDoc();
    const b: MatrixDoc = {
      ...a,
      axesById: { ...a.axesById, custom: { id: "custom", label: "X", kind: "flag" } },
      axisOrder: [...a.axisOrder, "custom"],
    };
    const ops = diffMatrixDocs(a, b);
    expect(ops).toContainEqual({ o: "set", p: ["axesById", "custom"], v: { id: "custom", label: "X", kind: "flag" } });
    expect(ops).toContainEqual({ o: "set", p: ["axisOrder"], v: b.axisOrder });
  });

  it("identical docs diff to nothing (self-stabilizing)", () => {
    const a = seedMatrixDoc(SAMPLE);
    expect(diffMatrixDocs(a, a)).toEqual([]);
  });
});

describe("normalizeMatrixDoc", () => {
  it("fills missing containers and defaults axes", () => {
    const n = normalizeMatrixDoc({ eventName: "E" } as Partial<MatrixDoc>);
    expect(n.teamsById).toEqual({});
    expect(n.axisOrder.length).toBeGreaterThan(0);
    expect(n.cellsById).toEqual({});
  });

  it("drops dangling order ids and appends unordered entries", () => {
    const n = normalizeMatrixDoc({
      teamsById: { real: { id: "real", name: "R", players: [] } },
      teamOrder: ["ghost", "real"],
    } as Partial<MatrixDoc>);
    expect(n.teamOrder).toEqual(["real"]);
  });
});
