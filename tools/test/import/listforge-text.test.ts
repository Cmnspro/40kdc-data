/**
 * ListForge plain-text adapter unit tests.
 *
 * ListForge's copy-paste export: a `name - faction - detachment (N Points)`
 * first line, mixed-case role sections ending with `:`, units as
 * `Name (N pts)` headers, and indented `•` bullets for model groups, wargear,
 * the `E: <name>` enhancement annotation, and the bare `Warlord` marker.
 * These tests pin the parse and the disjointness from the other text matchers.
 */
import { describe, it, expect } from "vitest";
import { Dataset } from "../../src/data/dataset.js";
import { tryImportRoster } from "../../src/import/import-roster.js";
import { listForgeTextAdapter, _internals } from "../../src/import/listforge-text.js";
import { gwAdapter } from "../../src/import/gw.js";
import { newRecruitSimpleAdapter } from "../../src/import/newrecruit-simple.js";

const ds = Dataset.embedded();

// Condensed from the reference Chaos Daemons export.
const SAMPLE = `all gas no breaks - Chaos Daemons - Daemonic Incursion (1995 Points)


Epic Hero:
Rotigus (250 pts)
  • Gnarlrod
  • Streams of brackish filth


Character:
Great Unclean One (295 pts)
  • Putrid vomit
  • Bileblade
  • Bilesword
  • E: The Endless Gift
  • Warlord

Bloodmaster (65 pts)
  • Blade of blood


Battleline:
Bloodletters (110 pts)
  • Bloodreaper
    • Hellblade
  • Instrument of Chaos
  • Daemonic Icon
  • 9x Bloodletter
    • 9x Hellblade


Beast:
Flesh Hounds (75 pts)
  • Gore Hound
    • Burning maw
    • Collar of Khorne
    • Gore-drenched fangs
  • 4x Flesh Hound
    • 4x Collar of Khorne
    • 4x Gore-drenched fangs
`;

describe("listForgeTextAdapter.matches", () => {
  it("recognises the ListForge text export", () => {
    expect(listForgeTextAdapter.matches(SAMPLE)).toBe(true);
  });

  it("rejects non-string payloads and other text formats", () => {
    expect(listForgeTextAdapter.matches({ roster: {} })).toBe(false);
    // newrecruit-simple first line ends `- [N pts]`, not `(N Points)`.
    expect(
      listForgeTextAdapter.matches(
        "Chaos - Chaos Knights - List - [2000 pts]\n\n# ++ Army Roster ++ [2000 pts]\nUnit [5 pts]:\n• 1x Model: Gun",
      ),
    ).toBe(false);
    // A GW export's first non-blank line is the `++++` fence.
    expect(
      listForgeTextAdapter.matches(
        "++++\n+ FACTION KEYWORD: Chaos - Chaos Knights\n++++\nUnit (5 pts)\n• 1x Gun",
      ),
    ).toBe(false);
  });

  it("requires bullets and refuses WTC `N with` bodies", () => {
    const noBullets = "name - Faction - Detachment (1000 Points)\nUnit (50 pts)";
    expect(listForgeTextAdapter.matches(noBullets)).toBe(false);
    const withLines =
      "name - Faction - Detachment (1000 Points)\nUnit (50 pts)\n  • Gun\n1 with Sword";
    expect(listForgeTextAdapter.matches(withLines)).toBe(false);
  });

  it("stays disjoint from the other text matchers on its own sample", () => {
    expect(gwAdapter.matches(SAMPLE)).toBe(false);
    expect(newRecruitSimpleAdapter.matches(SAMPLE)).toBe(false);
  });
});

describe("listForgeTextAdapter via tryImportRoster", () => {
  it("auto-detects the format and resolves against the dataset", () => {
    const result = tryImportRoster(SAMPLE, { dataset: ds });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.format).toBe("listforge-text");
      expect(result.roster.faction_id).toBe("chaos-daemons");
    }
  });
});

describe("listForgeTextAdapter.parse", () => {
  const parsed = listForgeTextAdapter.parse(SAMPLE);

  it("reads name, faction, detachment, and points from the first line", () => {
    expect(parsed.name).toBe("all gas no breaks");
    expect(parsed.faction_raw_name).toBe("Chaos Daemons");
    expect(parsed.detachment_raw_names).toEqual(["Daemonic Incursion"]);
    expect(parsed.total_reported).toBe(1995);
    // ListForge reports only the army total — it doubles as the limit.
    expect(parsed.declared_limit).toBe(1995);
  });

  it("captures units in declaration order", () => {
    expect(parsed.units.map((u) => u.raw_name)).toEqual([
      "Rotigus",
      "Great Unclean One",
      "Bloodmaster",
      "Bloodletters",
      "Flesh Hounds",
    ]);
  });

  it("flags characters from the Epic Hero / Character sections", () => {
    const flags = Object.fromEntries(
      parsed.units.map((u) => [u.raw_name, u.is_character]),
    );
    expect(flags["Rotigus"]).toBe(true);
    expect(flags["Great Unclean One"]).toBe(true);
    expect(flags["Bloodmaster"]).toBe(true);
    expect(flags["Bloodletters"]).toBe(false);
    expect(flags["Flesh Hounds"]).toBe(false);
  });

  it("reads the E: enhancement annotation without claiming points for it", () => {
    const guo = parsed.units.find((u) => u.raw_name === "Great Unclean One")!;
    expect(guo.enhancement_raw_name).toBe("The Endless Gift");
    expect(guo.enhancement_points).toBeNull();
    expect(guo.points).toBe(295); // displayed points stay as-is
    expect(guo.is_warlord).toBe(true);
  });

  it("derives model counts from bulleted model groups", () => {
    const bloodletters = parsed.units.find((u) => u.raw_name === "Bloodletters")!;
    expect(bloodletters.model_count).toBe(10); // Bloodreaper + 9x Bloodletter
    const hounds = parsed.units.find((u) => u.raw_name === "Flesh Hounds")!;
    expect(hounds.model_count).toBe(5); // Gore Hound + 4x Flesh Hound
    const rotigus = parsed.units.find((u) => u.raw_name === "Rotigus")!;
    expect(rotigus.model_count).toBe(1); // wargear-only bullets
  });

  it("aggregates squad-wide wargear from child bullets and leaf bullets", () => {
    const bloodletters = parsed.units.find((u) => u.raw_name === "Bloodletters")!;
    const gear = Object.fromEntries(
      bloodletters.wargear.map((w) => [w.raw_name, w.count]),
    );
    expect(gear["Hellblade"]).toBe(10); // 1 (Bloodreaper's) + 9 (squad line)
    expect(gear["Instrument of Chaos"]).toBe(1);
    expect(gear["Daemonic Icon"]).toBe(1);
  });

  it("sums total_computed from unit points", () => {
    expect(parsed.total_computed).toBe(250 + 295 + 65 + 110 + 75);
  });

  it("does not leak any prose fields", () => {
    const json = JSON.stringify(parsed);
    expect(json.includes("description")).toBe(false);
    expect(json.includes("rules")).toBe(false);
  });
});

// 11e ListForge headers gained a Force Disposition segment and comma-joined
// multi-detachment tails: `<name> - <faction> - <disposition> - <det>[, <det>]`.
// These pin the header slotting (the disposition must not be mistaken for the
// faction) and end-to-end resolution against real dataset entities.
describe("listForgeTextAdapter 11e header (disposition + multi-detachment)", () => {
  // Modelled on real user exports (Votann two-detachment list, Necron list).
  const VOTANN_HEADER =
    "1.5k - Leagues of Votann - Priority Assets - Hearthfyre Arsenal, Hearthguard Covenant (1485 Points)";
  const NECRON_HEADER =
    "Starshatter - Necrons - Priority Assets - Starshatter Arsenal (2000 Points)";
  const VOTANN_LIST = `${VOTANN_HEADER}

Character:
Kâhl (75 pts)
  • Volkanite disintegrator
`;

  it("slots name/faction/disposition and comma-splits the detachment tail", () => {
    const h = _internals.parseFirstLine(VOTANN_HEADER)!;
    expect(h.name).toBe("1.5k");
    expect(h.faction_raw_name).toBe("Leagues of Votann");
    expect(h.disposition_raw_name).toBe("Priority Assets");
    expect(h.detachment_raw_names).toEqual([
      "Hearthfyre Arsenal",
      "Hearthguard Covenant",
    ]);
  });

  it("keeps a single-detachment 4-segment header as one detachment", () => {
    const h = _internals.parseFirstLine(NECRON_HEADER)!;
    expect(h.faction_raw_name).toBe("Necrons");
    expect(h.disposition_raw_name).toBe("Priority Assets");
    expect(h.detachment_raw_names).toEqual(["Starshatter Arsenal"]);
  });

  it("leaves legacy 3-segment headers with no disposition", () => {
    const h = _internals.parseFirstLine(
      "all gas no breaks - Chaos Daemons - Daemonic Incursion (1995 Points)",
    )!;
    expect(h.disposition_raw_name).toBeNull();
    expect(h.detachment_raw_names).toEqual(["Daemonic Incursion"]);
  });

  it("resolves both detachments and the disposition end-to-end", () => {
    const result = tryImportRoster(VOTANN_LIST, { dataset: ds });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.format).toBe("listforge-text");
      expect(result.roster.faction_id).toBe("leagues-of-votann");
      expect(result.roster.detachments.map((d) => d.ref.id)).toEqual([
        "hearthfyre-arsenal",
        "hearthguard-covenant",
      ]);
      expect(result.roster.force_disposition).toBe("priority-assets");
    }
  });
});

// ListForge emits attached leaders in an `Attached Units:` section: a combined
// `Leader + Bodyguard (total pts)` marker, then the leader and bodyguard as
// indented sub-units. Condensed from a real Votann export. Kâhl is a `leader`-
// role epic hero, so the `support`-only inference (resolve Pass 2) never
// attaches it — only this explicit encoding does.
const ATTACHED = `1.5k - Leagues of Votann - Priority Assets - Hearthfyre Arsenal (1485 Points)

Attached Units:
Kâhl + Einhyr Hearthguard (205 pts)
  Kâhl (75 pts)
    • Volkanite disintegrator
    • Warlord
    • E: Ironskein
  Einhyr Hearthguard (130 pts)
    • Hesyr
      • EtaCarn plasma gun
    • 4x Einhyr Hearthguard
      • 4x Volkanite disintegrator

Character:
Einhyr Champion (65 pts)
  • Darkstar axe
`;

describe("listForgeTextAdapter Attached Units section", () => {
  const parsed = listForgeTextAdapter.parse(ATTACHED);

  it("skips the combined marker and emits leader + bodyguard as units", () => {
    expect(parsed.units.map((u) => u.raw_name)).toEqual([
      "Kâhl",
      "Einhyr Hearthguard",
      "Einhyr Champion",
    ]);
    // The marker's points are the sub-units' sum; counting it would double.
    expect(parsed.total_computed).toBe(75 + 130 + 65);
  });

  it("flags the attached leader as a character and links its bodyguard", () => {
    const kahl = parsed.units.find((u) => u.raw_name === "Kâhl")!;
    expect(kahl.is_character).toBe(true);
    expect(kahl.is_warlord).toBe(true);
    expect(kahl.enhancement_raw_name).toBe("Ironskein");
    expect(kahl.leader_attachment).toEqual({
      bodyguard_raw_name: "Einhyr Hearthguard",
      role: "leader",
      provisional: false,
    });
  });

  it("leaves the bodyguard a non-character unit with its models and wargear", () => {
    const bg = parsed.units.find((u) => u.raw_name === "Einhyr Hearthguard")!;
    expect(bg.is_character).toBe(false);
    expect(bg.leader_attachment ?? null).toBeNull();
    expect(bg.model_count).toBe(5); // Hesyr + 4x Einhyr Hearthguard
  });

  it("resets attachment state when a normal section follows", () => {
    const champ = parsed.units.find((u) => u.raw_name === "Einhyr Champion")!;
    expect(champ.is_character).toBe(true); // Character section
    expect(champ.leader_attachment ?? null).toBeNull();
  });

  it("resolves the explicit leader→bodyguard attachment end-to-end", () => {
    const result = tryImportRoster(ATTACHED, { dataset: ds });
    expect(result.ok).toBe(true);
    if (result.ok) {
      const kahl = result.roster.units.find((u) => u.ref.id === "kahl")!;
      expect(kahl.leader_attachment).not.toBeNull();
      expect(kahl.leader_attachment?.bodyguard_ref.id).toBe(
        "einhyr-hearthguard",
      );
      expect(kahl.leader_attachment?.role).toBe("leader");
      expect(kahl.leader_attachment?.provisional).toBe(false);
    }
  });
});
