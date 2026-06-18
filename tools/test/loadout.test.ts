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

// The loadout *maths* (maximal/bounds/clamp/validate/swap-conflict) is exercised
// with synthetic options rather than a live unit: dump-primary wargear data is
// regenerated per ingest, so pinning a real unit's take-every-swap maximal would
// couple these maths tests to churning data. (Base loadout — the pinned contract
// — is still asserted against a real unit above; maximal is advisory per
// CONFORMANCE.) A 10-model squad whose models carry bolt-pistol + chainblade,
// with two per-5 swaps and a one-per-unit add-on.
const SYN_UNIT = { weapon_ids: ["bolt-pistol", "chainblade"] } as never;
const SYN_OPTS: WargearOption[] = [
  opt({ replaces: ["bolt-pistol"], replacement: ["plasma-pistol"], model_constraint: { per_n_models: 5 } }),
  opt({ replaces: ["chainblade"], replacement: ["khornate-eviscerator"], model_constraint: { per_n_models: 5 } }),
  opt({ replacement: ["icon-of-khorne"], model_constraint: { max_count: 1 } }),
];

describe("maximalLoadout — synthetic dogfood target", () => {
  it("applies every swap at its cap and the add-on once", () => {
    const lo = maximalLoadout(SYN_UNIT, 10, SYN_OPTS);
    expect(Object.fromEntries(lo.counts)).toEqual({
      "bolt-pistol": 8, // 10 base − 2 swapped to plasma
      "plasma-pistol": 2, // per-5 cap at 10 models
      chainblade: 8, // 10 base − 2 swapped to eviscerator
      "khornate-eviscerator": 2,
      "icon-of-khorne": 1, // add-on, max 1
    });
  });
});

describe("weaponBounds + clampWeaponCount + validateLoadout", () => {
  it("caps a replacement weapon at its max and a base weapon at model_count", () => {
    const bounds = weaponBounds(SYN_UNIT, 10, SYN_OPTS);
    // plasma pistol: per-5 → 2 max
    expect(bounds.get("plasma-pistol")).toEqual({ min: 0, max: 2 });
    // bolt pistol: base 10, up to 2 swapped away
    expect(bounds.get("bolt-pistol")).toEqual({ min: 8, max: 10 });
  });

  it("clamps an over-cap request down to the max", () => {
    const bounds = weaponBounds(SYN_UNIT, 10, SYN_OPTS);
    expect(clampWeaponCount(bounds, "plasma-pistol", 4)).toBe(2);
    expect(clampWeaponCount(bounds, "plasma-pistol", 1)).toBe(1);
  });

  it("flags an over-cap loadout", () => {
    const violations = validateLoadout(SYN_UNIT, 10, SYN_OPTS, new Map([["plasma-pistol", 4]]));
    expect(violations).toEqual([
      { id: "plasma-pistol", code: "exceeds-max", message: "plasma-pistol: 4 exceeds max 2" },
    ]);
  });

  it("accepts the maximal loadout as valid", () => {
    const lo = maximalLoadout(SYN_UNIT, 10, SYN_OPTS);
    expect(validateLoadout(SYN_UNIT, 10, SYN_OPTS, lo.counts)).toEqual([]);
  });

  it("flags a swap conflict: base weapon kept while its replacement is also taken", () => {
    // A lone plain single-target swap (base weapon → one replacement, max 1): a
    // model takes one or the other, never both. Each id sits independently within
    // [0,1], so only the swap-conservation check catches keeping both.
    const unit = { weapon_ids: ["diabolus-heavy-stubber"] } as never;
    const opts = [
      opt({
        replaces: ["diabolus-heavy-stubber"],
        replacement: ["havoc-multi-launcher"],
        model_constraint: { max_count: 1 },
      }),
    ];
    expect(
      validateLoadout(
        unit,
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
    expect(validateLoadout(unit, 1, opts, new Map([["diabolus-heavy-stubber", 1]]))).toEqual([]);
    expect(validateLoadout(unit, 1, opts, new Map([["havoc-multi-launcher", 1]]))).toEqual([]);
  });
});

describe("wargearOptionsOf accessor", () => {
  it("returns options for a unit and empty for one without", () => {
    const bz = dataset.units.get("khorne-berzerkers")!;
    expect(dataset.wargearOptionsOf(bz.raw).length).toBeGreaterThan(0);
    expect(bz.wargearOptions.length).toBe(dataset.wargearOptionsOf(bz.raw).length);
  });
});
