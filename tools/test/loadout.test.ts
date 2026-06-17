import { describe, it, expect } from "vitest";

import { dataset } from "../src/data/index.js";
import {
  optionCap,
  baseLoadout,
  maximalLoadout,
  weaponBounds,
  clampWeaponCount,
  validateLoadout,
} from "../src/data/loadout.js";
import type { WargearOption } from "../src/generated.js";

const GV = { edition: "10th", dataslate: "2025-q3" };
function opt(p: Partial<WargearOption>): WargearOption {
  return { id: "x", unit_id: "u", game_version: GV, ...p } as WargearOption;
}

describe("optionCap", () => {
  it("per_n_models floors model_count / n", () => {
    expect(optionCap(opt({ model_constraint: { per_n_models: 5 } }), 10)).toBe(2);
    expect(optionCap(opt({ model_constraint: { per_n_models: 5 } }), 9)).toBe(1);
  });
  it("any_number → every model", () => {
    expect(optionCap(opt({ model_constraint: { any_number: true } }), 7)).toBe(7);
  });
  it("max_count alone defaults to a 1-model cap", () => {
    expect(optionCap(opt({ model_constraint: { max_count: 1 } }), 10)).toBe(1);
  });
  it("max_count clamps a ratio", () => {
    expect(optionCap(opt({ model_constraint: { per_n_models: 5, max_count: 1 } }), 20)).toBe(1);
  });
});

describe("baseLoadout — Khorne Berzerkers @ 10 (legal default)", () => {
  it("carries only the base weapons on every model, no swaps applied", () => {
    const bz = dataset.units.get("khorne-berzerkers")!;
    const options = dataset.wargearOptionsOf(bz.raw);
    const lo = baseLoadout(bz.raw, 10, options);
    // Base weapons (never a replacement) only — none of the swap/add-on ids.
    expect(Object.fromEntries(lo.counts)).toEqual({
      "bolt-pistol": 10,
      "chainblade": 10,
    });
    // The legal default is itself valid (the maximal take-every-swap set is not).
    expect(validateLoadout(bz.raw, 10, options, lo.counts)).toEqual([]);
  });
});

describe("maximalLoadout — Khorne Berzerkers @ 10 (dogfood target)", () => {
  it("derives 7 bolt pistols, 3 plasma, 8 chainblades, 2 eviscerators, 1 icon", () => {
    const bz = dataset.units.get("khorne-berzerkers")!;
    const options = dataset.wargearOptionsOf(bz.raw);
    expect(options.length).toBe(4); // 3 swaps + 1 add-on
    const lo = maximalLoadout(bz.raw, 10, options);
    expect(Object.fromEntries(lo.counts)).toEqual({
      "bolt-pistol": 7,
      "chainblade": 8,
      "plasma-pistol": 3,
      "khornate-eviscerator": 2,
      "icon-of-khorne": 1,
    });
  });
});

describe("weaponBounds + clampWeaponCount + validateLoadout", () => {
  const bz = dataset.units.get("khorne-berzerkers")!;
  const options = dataset.wargearOptionsOf(bz.raw);

  it("caps a replacement weapon at its max and a base weapon at model_count", () => {
    const bounds = weaponBounds(bz.raw, 10, options);
    // plasma pistol: champion (1) + per-5 (2) = 3 max
    expect(bounds.get("plasma-pistol")).toEqual({ min: 0, max: 3 });
    // bolt pistol: base 10, up to 3 swapped away
    expect(bounds.get("bolt-pistol")).toEqual({ min: 7, max: 10 });
  });

  it("clamps an over-cap request down to the max", () => {
    const bounds = weaponBounds(bz.raw, 10, options);
    expect(clampWeaponCount(bounds, "plasma-pistol", 4)).toBe(3);
    expect(clampWeaponCount(bounds, "plasma-pistol", 2)).toBe(2);
  });

  it("flags an over-cap loadout", () => {
    const violations = validateLoadout(bz.raw, 10, options, new Map([["plasma-pistol", 4]]));
    expect(violations).toEqual([
      { id: "plasma-pistol", code: "exceeds-max", message: "plasma-pistol: 4 exceeds max 3" },
    ]);
  });

  it("accepts the maximal loadout as valid", () => {
    const lo = maximalLoadout(bz.raw, 10, options);
    expect(validateLoadout(bz.raw, 10, options, lo.counts)).toEqual([]);
  });

  it("flags a swap conflict: base weapon kept while its replacement is also taken", () => {
    // War Dog Brigand's lone option swaps the diabolus heavy stubber for a havoc
    // multi-launcher — a model takes one or the other, never both. Each id sits
    // independently within [0,1], so only the swap-conservation check catches it.
    const wd = dataset.units.get("war-dog-brigand")!;
    const opts = dataset.wargearOptionsOf(wd.raw);
    expect(
      validateLoadout(
        wd.raw,
        1,
        opts,
        new Map([
          ["diabolus-heavy-stubber", 1],
          ["havoc-multi-launcher", 1],
        ]),
      ),
    ).toEqual([
      {
        id: "diabolus-heavy-stubber",
        code: "swap-conflict",
        message:
          "diabolus-heavy-stubber and its swap replacement(s) total 2, exceeding 1 (a model takes the base weapon or a swap, not both)",
      },
    ]);
    // Either single choice is legal.
    expect(
      validateLoadout(wd.raw, 1, opts, new Map([["diabolus-heavy-stubber", 1]])),
    ).toEqual([]);
    expect(validateLoadout(wd.raw, 1, opts, new Map([["havoc-multi-launcher", 1]]))).toEqual([]);
  });
});

describe("wargearOptionsOf accessor", () => {
  it("returns options for a unit and empty for one without", () => {
    const bz = dataset.units.get("khorne-berzerkers")!;
    expect(dataset.wargearOptionsOf(bz.raw).length).toBeGreaterThan(0);
    expect(bz.wargearOptions.length).toBe(dataset.wargearOptionsOf(bz.raw).length);
  });
});
