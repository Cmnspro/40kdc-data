import { describe, it, expect } from "vitest";

import { dataset } from "../src/data/index.js";
import { baseUnitPoints, pointsTierMissing, wargearPoints } from "../src/data/pricing.js";

// World Eaters Chaos Terminators are priced by army ordinal: 165 for your 1st–2nd
// copy, 175 for your 3rd+ at 5 models, and 330/340 for a 6–10 model squad (a
// range tier). The id is shared with Emperor's Children, so resolve the WE copy.
const ct = dataset.units.getInFaction("chaos-terminators", "world-eaters")!.raw;

describe("baseUnitPoints — ordinal bands", () => {
  it("prices the 1st–2nd army copy at the lower band", () => {
    expect(baseUnitPoints(ct, 5, 1)).toBe(165);
    expect(baseUnitPoints(ct, 5, 2)).toBe(165);
    expect(baseUnitPoints(ct, 10, 1)).toBe(330);
  });

  it("prices the 3rd+ army copy at the higher band", () => {
    expect(baseUnitPoints(ct, 5, 3)).toBe(175);
    expect(baseUnitPoints(ct, 10, 3)).toBe(340);
    expect(baseUnitPoints(ct, 5, 7)).toBe(175); // open-ended top band
  });

  it("defaults to the 1st army copy when no ordinal is given", () => {
    expect(baseUnitPoints(ct, 5)).toBe(165);
  });

  it("picks the highest model tier the count reaches, within the band", () => {
    expect(baseUnitPoints(ct, 10, 1)).toBe(330);
    expect(baseUnitPoints(ct, 7, 1)).toBe(330); // inside the 6–10 range tier
    expect(baseUnitPoints(ct, 4, 1)).toBe(165); // below smallest tier → lowest tier
  });

  it("ignores ordinal for an unbanded unit (no unit_count_min)", () => {
    const bz = dataset.units.getAny("khorne-berzerkers")!.raw;
    expect(baseUnitPoints(bz, 10, 1)).toBe(baseUnitPoints(bz, 10, 99));
  });
});

describe("pointsTierMissing — ordinal-aware", () => {
  it("is false for a covered model count + ordinal, true below the smallest tier", () => {
    expect(pointsTierMissing(ct, 5, 1)).toBe(false);
    expect(pointsTierMissing(ct, 5, 3)).toBe(false);
    expect(pointsTierMissing(ct, 4, 1)).toBe(true);
  });
});

// Venatari Custodians are GW range-priced: 3 models @150 for the first two
// copies (160 thereafter), or 4–6 @300 (310 thereafter). The range tiers carry
// models_max=6, so every size in their range prices at the matching tier cost.
const ven = dataset.units.getInFaction("venatari-custodians", "adeptus-custodes")!.raw;

describe("range-priced tiers (models_max)", () => {
  it("prices every size in a range tier at that tier's cost", () => {
    expect(ven.points).toEqual([
      { models: 3, cost: 150, unit_count_min: 1, unit_count_max: 2 },
      { models: 4, models_max: 6, cost: 300, unit_count_min: 1, unit_count_max: 2 },
      { models: 3, cost: 160, unit_count_min: 3, unit_count_max: null },
      { models: 4, models_max: 6, cost: 310, unit_count_min: 3, unit_count_max: null },
    ]);
    expect(baseUnitPoints(ven, 3)).toBe(150);
    expect(baseUnitPoints(ven, 4)).toBe(300);
    expect(baseUnitPoints(ven, 5)).toBe(300);
    expect(baseUnitPoints(ven, 6)).toBe(300);
  });

  it("flags counts outside every tier range (below floor, above ceiling)", () => {
    expect(pointsTierMissing(ven, 2)).toBe(true); // below the 3-model tier
    expect(pointsTierMissing(ven, 3)).toBe(false);
    expect(pointsTierMissing(ven, 4)).toBe(false);
    expect(pointsTierMissing(ven, 6)).toBe(false);
    expect(pointsTierMissing(ven, 7)).toBe(true); // above the 6-model ceiling
  });
});

// A Terminator Assault Squad's five thunder hammers are a priced DEFAULT (5 pts
// each, in the loadout by default); the Victrix Honour Guard's Banner of Macragge
// is a priced non-weapon wargear default (15 pts).
const tas = dataset.units.getInFaction("terminator-assault-squad", "adeptus-astartes")!.raw;
const vhg = dataset.units.getInFaction("victrix-honour-guard", "adeptus-astartes")!.raw;

describe("wargearPoints — per-item MFM surcharge over a loadout", () => {
  it("charges each priced item per copy in the final loadout", () => {
    expect(tas.wargear_costs).toContainEqual({ item_id: "thunder-hammer", cost: 5 });
    expect(wargearPoints(tas, new Map([["thunder-hammer", 5]]))).toBe(25); // 5 hammers × 5
    expect(wargearPoints(tas, new Map([["thunder-hammer", 2]]))).toBe(10);
  });

  it("charges a non-weapon wargear default (Banner of Macragge)", () => {
    expect(vhg.wargear_costs).toEqual(
      expect.arrayContaining([
        { item_id: "banner-of-macragge", cost: 15 },
        { item_id: "blades-of-honour", cost: 10 },
      ]),
    );
    expect(wargearPoints(vhg, new Map([["banner-of-macragge", 1]]))).toBe(15);
    expect(wargearPoints(vhg, new Map([["banner-of-macragge", 1], ["blades-of-honour", 1]]))).toBe(25);
  });

  it("is 0 for items with no cost entry and for a unit without wargear_costs", () => {
    expect(wargearPoints(tas, new Map([["storm-bolter", 3]]))).toBe(0);
    expect(wargearPoints(ven, new Map([["kinetic-destroyer", 6]]))).toBe(0);
  });
});
