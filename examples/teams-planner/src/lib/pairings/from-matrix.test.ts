import { describe, it, expect } from "vitest";
import { emptyMatrixDoc, type MatrixDoc } from "../matrix/matrix-doc";
import type { MatrixTeam } from "../matrix/types";
import { matrixTeamToSimPlayers } from "./from-matrix";

const TEAM: MatrixTeam = {
  id: "t1",
  name: "Alpha",
  players: [
    { id: "p1", name: "Ann", faction: "world-eaters", disposition: "purge-the-foe" },
    { id: "p2", name: "Bob", faction: "orks", disposition: null },
    { id: "p3", name: "", faction: null, disposition: null },
  ],
};

describe("matrixTeamToSimPlayers", () => {
  it("maps faction → factionId and the parsed disposition → fd, keeping ids", () => {
    const sim = matrixTeamToSimPlayers(TEAM, emptyMatrixDoc());
    expect(sim[0]).toEqual({ id: "p1", name: "Ann", factionId: "world-eaters", fd: "purge-the-foe" });
  });

  it("applies a hand-entered disposition override over the parsed default", () => {
    const doc: MatrixDoc = { ...emptyMatrixDoc(), dispositionsById: { p1: "take-and-hold" } };
    expect(matrixTeamToSimPlayers(TEAM, doc)[0].fd).toBe("take-and-hold");
  });

  it("defaults an unknown disposition so the team is always startable", () => {
    // p2 has neither a parsed value nor an override → falls back to the first disposition.
    const sim = matrixTeamToSimPlayers(TEAM, emptyMatrixDoc());
    expect(sim[1].fd).toBe("take-and-hold");
    // …but an override on the same player still wins.
    const doc: MatrixDoc = { ...emptyMatrixDoc(), dispositionsById: { p2: "disruption" } };
    expect(matrixTeamToSimPlayers(TEAM, doc)[1].fd).toBe("disruption");
  });

  it("sends a factionless / nameless opponent neutral with a placeholder name", () => {
    const sim = matrixTeamToSimPlayers(TEAM, emptyMatrixDoc());
    expect(sim[2].factionId).toBe("");
    expect(sim[2].name).toBe("Opponent 3");
  });

  it("preserves opponent order and count", () => {
    const sim = matrixTeamToSimPlayers(TEAM, emptyMatrixDoc());
    expect(sim.map((s) => s.id)).toEqual(["p1", "p2", "p3"]);
  });
});
