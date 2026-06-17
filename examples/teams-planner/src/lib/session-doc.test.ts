/** Session-doc mapping: round-trips, minimal diffs on id-disjoint paths, and
 *  convergence of the diff→apply loop (what the live session actually runs). */
import { describe, expect, it } from "vitest";
import { applyDocOps } from "../../../_shared/doc-protocol";
import {
  adoptSessionDoc,
  diffSessionDocs,
  fromCloudPayload,
  isSessionShaped,
  planToSessionDoc,
  sessionDocToPlan,
  toSnapshotPayload,
  type SessionDoc,
} from "./session-doc";
import { sanitizePlan } from "./share-plan";
import type { Player, TeamPlan } from "./coverage";

function player(id: string, name: string): Player {
  return { id, name, factionIds: [], armies: [], preferences: [], locked: {} };
}

const plan: TeamPlan = {
  teamName: "Crusaders",
  size: 5,
  players: [player("p1", "Alice"), player("p2", "Bob")],
};

describe("planToSessionDoc / sessionDocToPlan", () => {
  it("round-trips a plan preserving order", () => {
    const doc = planToSessionDoc(plan);
    expect(doc.playerOrder).toEqual(["p1", "p2"]);
    expect(sessionDocToPlan(doc)).toEqual(plan);
  });

  it("tolerates LWW-race artifacts: dangling order ids and orphan players", () => {
    const doc = planToSessionDoc(plan);
    const raced: SessionDoc = {
      ...doc,
      playerOrder: ["ghost", "p2", "p1", "p2"],
      playersById: { ...doc.playersById, p3: player("p3", "Cara") },
    };
    const restored = sessionDocToPlan(raced);
    expect(restored.players.map((p) => p.id)).toEqual(["p2", "p1", "p3"]);
  });
});

describe("diffSessionDocs", () => {
  it("emits nothing for identical docs", () => {
    const doc = planToSessionDoc(plan);
    expect(diffSessionDocs(doc, planToSessionDoc(plan))).toEqual([]);
  });

  it("touches only the changed player's path", () => {
    const prev = planToSessionDoc(plan);
    const next = planToSessionDoc({
      ...plan,
      players: [player("p1", "Alicia"), player("p2", "Bob")],
    });
    const ops = diffSessionDocs(prev, next);
    expect(ops).toEqual([{ o: "set", p: ["playersById", "p1"], v: player("p1", "Alicia") }]);
  });

  it("diff→apply converges (the live-session loop invariant)", () => {
    const prev = planToSessionDoc(plan);
    const next = planToSessionDoc({
      teamName: "Despoilers",
      size: 8,
      players: [player("p2", "Bob"), player("p3", "Cara")],
    });
    const applied = applyDocOps(prev, diffSessionDocs(prev, next)) as SessionDoc;
    expect(applied).toEqual(next);
    // And a second diff is empty — no oscillation between peers.
    expect(diffSessionDocs(applied, next)).toEqual([]);
  });

  it("concurrent edits to different players commute under any order", () => {
    const base = planToSessionDoc(plan);
    const aliceEdit = diffSessionDocs(
      base,
      planToSessionDoc({ ...plan, players: [player("p1", "Alicia"), player("p2", "Bob")] }),
    );
    const bobEdit = diffSessionDocs(
      base,
      planToSessionDoc({ ...plan, players: [player("p1", "Alice"), player("p2", "Bobby")] }),
    );
    const ab = applyDocOps(applyDocOps(base, aliceEdit), bobEdit) as SessionDoc;
    const ba = applyDocOps(applyDocOps(base, bobEdit), aliceEdit) as SessionDoc;
    expect(ab).toEqual(ba);
    expect(ab.playersById.p1.name).toBe("Alicia");
    expect(ab.playersById.p2.name).toBe("Bobby");
  });
});

describe("adoptSessionDoc (live-loop convergence through sanitizePlan)", () => {
  // A player who just clicked "+ Add army": the new army has a real faction
  // but no detachments yet. sanitizePlan drops empty armies, so the live loop
  // must NOT echo that drop back to the sender (which would make the army
  // vanish on screen). World Eaters is a known faction in the dataset.
  const withEmptyArmy: TeamPlan = {
    teamName: "Crusaders",
    size: 5,
    players: [
      {
        id: "p1",
        name: "Alice",
        factionIds: ["world-eaters"],
        armies: [{ id: "a1", name: "", factionId: "world-eaters", detachmentIds: [] }],
        preferences: [],
        locked: {},
      },
    ],
  };

  it("the raw wire doc, naively re-sanitized, would echo a deletion (the bug)", () => {
    // What the sender pushes (its local empty army is kept locally, unsanitized).
    const wire = planToSessionDoc(withEmptyArmy);
    // A peer adopting it the *old* way: render sanitized, but keep the raw doc
    // as lastSessionDoc. The next push diff is then non-empty — it deletes the
    // empty army and echoes that back to the sender.
    const sanitized = sanitizePlan(sessionDocToPlan(wire));
    expect(sanitized).not.toBeNull();
    const echo = diffSessionDocs(wire, planToSessionDoc(sanitized!.plan));
    expect(echo).not.toEqual([]);
  });

  it("adoptSessionDoc preserves the in-progress army and emits no echo", () => {
    const wire = planToSessionDoc(withEmptyArmy);
    const adopted = adoptSessionDoc(wire);
    // Lossless: the just-added empty army survives (it is NOT pruned), so the
    // peer keeps showing it instead of echoing a deletion back to the sender.
    expect(adopted.plan.players[0].armies).toHaveLength(1);
    expect(adopted.plan.players[0].armies[0].detachmentIds).toEqual([]);
    // The push $effect diffs planToSessionDoc(plan) against lastSessionDoc;
    // adoptSessionDoc guarantees they match, so nothing echoes.
    expect(diffSessionDocs(adopted.lastSessionDoc, planToSessionDoc(adopted.plan))).toEqual([]);
  });

  it("is idempotent: adopting the adopted doc changes nothing", () => {
    const once = adoptSessionDoc(planToSessionDoc(withEmptyArmy));
    const twice = adoptSessionDoc(once.lastSessionDoc);
    expect(twice.lastSessionDoc).toEqual(once.lastSessionDoc);
    expect(twice.plan).toEqual(once.plan);
  });

  it("a populated, fully-valid plan adopts unchanged (no spurious echo)", () => {
    // An army with a real detachment survives sanitize untouched, so adoption
    // is a no-op and produces no echo.
    const valid: TeamPlan = {
      teamName: "Crusaders",
      size: 5,
      players: [
        {
          id: "p1",
          name: "Alice",
          factionIds: ["world-eaters"],
          armies: [
            { id: "a1", name: "Goretrack Onslaught", factionId: "world-eaters", detachmentIds: ["goretrack-onslaught"] },
          ],
          preferences: [],
          locked: {},
        },
      ],
    };
    const wire = planToSessionDoc(sanitizePlan(valid)!.plan);
    const adopted = adoptSessionDoc(wire);
    expect(adopted.lastSessionDoc).toEqual(wire);
    expect(diffSessionDocs(adopted.lastSessionDoc, planToSessionDoc(adopted.plan))).toEqual([]);
  });
});

describe("cloud payload shape bridge", () => {
  it("detects session-shaped payloads and converts them to the plan shape", () => {
    const doc = planToSessionDoc(plan);
    expect(isSessionShaped(doc)).toBe(true);
    expect(isSessionShaped(plan)).toBe(false);
    expect(fromCloudPayload(doc)).toEqual(plan);
  });

  it("passes storage-shaped and garbage payloads through untouched", () => {
    expect(fromCloudPayload(plan)).toBe(plan);
    expect(fromCloudPayload(null)).toBe(null);
    expect(fromCloudPayload("junk")).toBe("junk");
    expect(fromCloudPayload({ unrelated: true })).toEqual({ unrelated: true });
  });

  it("snapshot export always yields the storage/interop shape", () => {
    // A live-edited doc (session shape) and a plain upload both export the
    // same plan — what a cross-app shortlink consumer expects.
    expect(toSnapshotPayload(planToSessionDoc(plan))).toEqual(plan);
    expect(toSnapshotPayload(plan)).toBe(plan);
  });

  it("round-trips: plan → session → cloud → plan", () => {
    expect(fromCloudPayload(planToSessionDoc(plan))).toEqual(plan);
  });
});
