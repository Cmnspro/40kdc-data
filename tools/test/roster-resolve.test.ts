import { describe, expect, it } from "vitest";
import { Dataset } from "../src/data/dataset.js";
import {
  checkRosterLegality,
  primaryDetachment,
  primaryDetachmentId,
  resolveAttachedLeader,
  resolveAttachmentPartners,
  resolveRosterUnit,
  resolveRosterWargear,
} from "../src/data/roster-resolve.js";
import type {
  Roster,
  RosterDetachment,
  RosterUnit,
  RosterWargear,
} from "../src/import/types.js";

const ds = Dataset.embedded();

function rosterUnit(id: string | null, rawName = "Test Unit"): RosterUnit {
  return {
    ref: { id, raw_name: rawName, resolved: id !== null, candidates: [] },
    model_count: 5,
    points: null,
    is_warlord: false,
    enhancement: null,
    enhancement_points: null,
    wargear: [],
    leader_attachment: null,
  };
}

describe("resolveRosterUnit", () => {
  it("returns the linked UnitView for a resolved roster entry", () => {
    const view = resolveRosterUnit(rosterUnit("intercessor-squad"), ds);
    expect(view).toBeDefined();
    expect(view!.id).toBe("intercessor-squad");
  });

  it("returns undefined for an unresolved (null id) ref", () => {
    expect(resolveRosterUnit(rosterUnit(null), ds)).toBeUndefined();
  });

  it("returns undefined for an id not present in the dataset", () => {
    expect(resolveRosterUnit(rosterUnit("no-such-unit"), ds)).toBeUndefined();
  });
});

function rosterOf(units: RosterUnit[]): Roster {
  return {
    name: "Test Roster",
    source: { format: "listforge", generated_by: null },
    faction_id: "adepta-sororitas",
    detachments: [],
    battle_size: null,
    points: { declared_limit: null, detachment_cap: null, total_reported: null, total_computed: 0 },
    units,
    game_version: { edition: "11th", dataslate: "pre-launch-provisional" },
    diagnostics: {
      resolved_units: units.length,
      unresolved_units: 0,
      resolved_weapons: 0,
      unresolved_weapons: 0,
      warnings: [],
    },
  };
}

function leaderUnit(leaderId: string, bodyguardId: string): RosterUnit {
  const u = rosterUnit(leaderId);
  u.leader_attachment = {
    bodyguard_ref: { id: bodyguardId, raw_name: bodyguardId, resolved: true, candidates: [] },
    provisional: true,
  };
  return u;
}

describe("resolveAttachedLeader", () => {
  it("finds the leader attached to a given body unit", () => {
    const roster = rosterOf([
      rosterUnit("battle-sisters-squad"),
      leaderUnit("palatine", "battle-sisters-squad"),
    ]);
    const leader = resolveAttachedLeader(roster, "battle-sisters-squad");
    expect(leader?.ref.id).toBe("palatine");
  });

  it("returns undefined when no leader is attached to the body unit", () => {
    const roster = rosterOf([
      rosterUnit("battle-sisters-squad"),
      leaderUnit("palatine", "dominion-squad"),
    ]);
    expect(resolveAttachedLeader(roster, "battle-sisters-squad")).toBeUndefined();
  });

  it("returns undefined for a roster with no attachments at all", () => {
    const roster = rosterOf([rosterUnit("battle-sisters-squad"), rosterUnit("palatine")]);
    expect(resolveAttachedLeader(roster, "battle-sisters-squad")).toBeUndefined();
  });
});

describe("resolveAttachmentPartners", () => {
  const roster = rosterOf([
    rosterUnit("battle-sisters-squad"),
    leaderUnit("palatine", "battle-sisters-squad"),
  ]);

  it("finds the partner from the bodyguard's end (the attached leader)", () => {
    const partners = resolveAttachmentPartners(roster, "battle-sisters-squad").map((u) => u.ref.id);
    expect(partners).toEqual(["palatine"]);
  });

  it("finds the partner from the leader's end (the bodyguard it joined)", () => {
    const partners = resolveAttachmentPartners(roster, "palatine").map((u) => u.ref.id);
    expect(partners).toEqual(["battle-sisters-squad"]);
  });

  it("returns an empty array when the unit is in no attachment", () => {
    const lone = rosterOf([rosterUnit("battle-sisters-squad"), rosterUnit("palatine")]);
    expect(resolveAttachmentPartners(lone, "battle-sisters-squad")).toEqual([]);
  });
});

describe("resolveRosterWargear", () => {
  it("resolves each resolved entry, drops the unresolved ones", () => {
    const wargear: RosterWargear[] = [
      {
        ref: { id: "bolt-rifle", raw_name: "Bolt rifle", resolved: true, candidates: [] },
        count: 5,
      },
      { ref: { id: null, raw_name: "Mystery gun", resolved: false, candidates: [] }, count: 1 },
      {
        ref: { id: "no-such-weapon", raw_name: "Phantom", resolved: true, candidates: [] },
        count: 2,
      },
    ];
    const resolved = resolveRosterWargear(wargear, ds);
    expect(resolved).toHaveLength(1);
    expect(resolved[0].weapon.id).toBe("bolt-rifle");
    expect(resolved[0].count).toBe(5);
  });
});

function detachmentEntry(id: string | null, rawName = id ?? "Unknown"): RosterDetachment {
  return {
    ref: { id, raw_name: rawName, resolved: id !== null, candidates: [] },
    dp_cost: id === null ? null : 1,
  };
}

function rosterWithDetachments(detachments: RosterDetachment[]): Roster {
  return { ...rosterOf([]), detachments };
}

describe("primaryDetachment / primaryDetachmentId", () => {
  it("returns the first detachment in source order", () => {
    const roster = rosterWithDetachments([
      detachmentEntry("hallowed-martyrs"),
      detachmentEntry("penitent-host"),
    ]);
    expect(primaryDetachment(roster)?.ref.id).toBe("hallowed-martyrs");
    expect(primaryDetachmentId(roster)).toBe("hallowed-martyrs");
  });

  it("returns undefined / null when the roster carries no detachment", () => {
    const roster = rosterWithDetachments([]);
    expect(primaryDetachment(roster)).toBeUndefined();
    expect(primaryDetachmentId(roster)).toBeNull();
  });

  it("returns the entry but a null id when the primary detachment is unresolved", () => {
    const roster = rosterWithDetachments([detachmentEntry(null, "Mystery Detachment")]);
    expect(primaryDetachment(roster)?.ref.raw_name).toBe("Mystery Detachment");
    expect(primaryDetachmentId(roster)).toBeNull();
  });
});

// --- checkRosterLegality ---------------------------------------------------

function wargear(id: string, count: number): RosterWargear {
  return { ref: { id, raw_name: id, resolved: true, candidates: [] }, count };
}

/** A World Eaters Chaos Terminators roster entry with the given weapon counts. */
function chaosTerminators(modelCount: number, wg: RosterWargear[]): RosterUnit {
  return {
    ref: { id: "chaos-terminators", raw_name: "Chaos Terminators", resolved: true, candidates: [] },
    model_count: modelCount,
    points: null,
    is_warlord: false,
    enhancement: null,
    enhancement_points: null,
    wargear: wg,
    leader_attachment: null,
  };
}

function worldEatersRoster(units: RosterUnit[]): Roster {
  return {
    name: "WE Test",
    source: { format: "listforge", generated_by: null },
    faction_id: "world-eaters",
    detachments: [],
    battle_size: null,
    points: { declared_limit: null, detachment_cap: null, total_reported: null, total_computed: 0 },
    units,
    game_version: { edition: "11th", dataslate: "launch" },
    diagnostics: {
      resolved_units: units.length,
      unresolved_units: 0,
      resolved_weapons: 0,
      unresolved_weapons: 0,
      warnings: [],
    },
  };
}

describe("checkRosterLegality", () => {
  it("flags the illegal 5× reaper-autocannon Chaos Terminators loadout (10 models)", () => {
    // The motivating bug: 10x Chaos Terminators with 5x Reaper autocannon. A
    // 'per 5 models' allowance caps reaper well below 5 at 10 models.
    const roster = worldEatersRoster([
      chaosTerminators(10, [
        wargear("combi-bolter", 10),
        wargear("accursed-weapon", 10),
        wargear("reaper-autocannon", 5),
      ]),
    ]);
    const report = checkRosterLegality(roster, ds);
    expect(report).toHaveLength(1);
    const reaper = report[0].violations.find((v) => v.id === "reaper-autocannon");
    expect(reaper?.code).toBe("exceeds-max");
  });

  it("passes a legal default Chaos Terminators loadout (no swaps)", () => {
    const roster = worldEatersRoster([
      chaosTerminators(10, [wargear("combi-bolter", 10), wargear("accursed-weapon", 10)]),
    ]);
    const report = checkRosterLegality(roster, ds);
    expect(report).toHaveLength(1);
    expect(report[0].violations).toEqual([]);
  });

  it("resolves the faction's own copy of a shared chassis (World Eaters, not first-wins)", () => {
    const roster = worldEatersRoster([chaosTerminators(10, [])]);
    const report = checkRosterLegality(roster, ds);
    expect(report[0].unitId).toBe("chaos-terminators");
    // World Eaters' chaos-terminators resolves (faction-scoped), not a miss.
    expect(report).toHaveLength(1);
  });

  it("skips unresolved units (no datasheet to check)", () => {
    const roster = worldEatersRoster([
      { ...chaosTerminators(5, []), ref: { id: null, raw_name: "???", resolved: false, candidates: [] } },
    ]);
    expect(checkRosterLegality(roster, ds)).toEqual([]);
  });
});
