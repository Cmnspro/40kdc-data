import { describe, it, expect } from "vitest";
import { dispositionId, loadOpponents, parsePlayerRoster, splitBcpList } from "./opponents";

describe("splitBcpList", () => {
  it("splits the ++++ header fields from the GW body", () => {
    const text = [
      "++++++++++++++++++++",
      "Player Name: Dakota",
      "Team Name: Team 3in",
      "Factions Used: World Eaters",
      "Disposition Used: Disruption",
      "++++++++++++++++++++",
      "",
      "World Eaters: title (2000 points)",
      "Strike Force (2000 points)",
    ].join("\n");
    const { header, body } = splitBcpList(text);
    expect(header["player name"]).toBe("Dakota");
    expect(header["disposition used"]).toBe("Disruption");
    expect(body.startsWith("World Eaters: title")).toBe(true);
    // the header lines must NOT leak into the body (that misfires the parser)
    expect(body).not.toContain("Team Name");
  });

  it("returns the whole text as body when there is no header", () => {
    const text = "World Eaters\nStrike Force (2000 points)";
    const { header, body } = splitBcpList(text);
    expect(header).toEqual({});
    expect(body).toBe(text);
  });
});

describe("dispositionId", () => {
  it("normalizes prose to force-disposition ids", () => {
    expect(dispositionId("Purge the Foe")).toBe("purge-the-foe");
    expect(dispositionId("Take and Hold")).toBe("take-and-hold");
    expect(dispositionId("Disruption")).toBe("disruption");
    expect(dispositionId("Priority Assets")).toBe("priority-assets");
    expect(dispositionId("Reconnaissance")).toBe("reconnaissance");
  });
  it("returns null for empty / unknown", () => {
    expect(dispositionId(null)).toBe(null);
    expect(dispositionId("")).toBe(null);
    expect(dispositionId("Something Else")).toBe(null);
  });
});

describe("loadOpponents", () => {
  it("validates a BCP-pull shape into OpponentData", () => {
    const data = loadOpponents({
      event: { id: "e", name: "ATC", teamEvent: true },
      teams: [{ id: "t", name: "Team", players: [{ id: "p", name: "Ann", faction: "Orks", armyListText: "x" }] }],
    });
    expect(data).not.toBeNull();
    expect(data!.teams[0].players[0].name).toBe("Ann");
  });

  it("rejects payloads without teams", () => {
    expect(loadOpponents({ event: {} })).toBeNull();
    expect(loadOpponents(null)).toBeNull();
    expect(loadOpponents({ teams: [] })).toBeNull();
  });
});

describe("parsePlayerRoster", () => {
  it("returns null when the player has no list text", () => {
    expect(parsePlayerRoster({ id: "p", name: "x", faction: null, armyListText: null })).toBeNull();
  });
  it("returns an import result for a list with text", () => {
    const r = parsePlayerRoster({
      id: "p",
      name: "x",
      faction: "World Eaters",
      armyListText: "++++\nFactions Used: World Eaters\n++++\n\nWorld Eaters\nStrike Force (2000 points)\n\nAngron (435 points)\n",
    });
    expect(r).not.toBeNull();
    expect(typeof r!.ok).toBe("boolean");
  });
});
