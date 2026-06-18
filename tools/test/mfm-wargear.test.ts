import { describe, it, expect } from "vitest";
import { MfmDump } from "../src/mfm/loader.js";
import { deriveWargear, withinEditDistance1 } from "../src/mfm/wargear.js";

/**
 * A hand-built minimal dump exercising the full derivation: two model types
 * (a capped leader + bulk), a base loadout each, a per-model loadout choice with
 * a heavy-weapon branch, and a 1-per-5 squad cap. Mirrors the shape verified
 * against World Eaters Chaos Terminators.
 */
function fixtureDump(): MfmDump {
  const wi = (id: string, name: string) => ({ id, wargearType: "weapon", localisations: { en: { name } } });
  return new MfmDump({
    data: {
      miniature: [
        { id: "m-champ", localisations: { en: { name: "Champion" } } },
        { id: "m-trooper", localisations: { en: { name: "Trooper" } } },
      ],
      wargear_item: [
        wi("wi-bolter", "Combi-bolter"),
        wi("wi-blade", "Accursed weapon"),
        wi("wi-fist", "Power fist"),
        wi("wi-reaper", "Reaper autocannon"),
      ],
      wargear_option: [
        { id: "wo-bolter", wargearItemId: "wi-bolter", wargearOptionGroupId: "g1", inputType: "", defaultValue: 0, points: 0, displayOrder: 0 },
        { id: "wo-blade", wargearItemId: "wi-blade", wargearOptionGroupId: "g1", inputType: "", defaultValue: 0, points: 0, displayOrder: 1 },
      ],
      base_miniature_loadout: [
        { id: "bml-champ", datasheetId: "ds1", miniatureId: "m-champ" },
        { id: "bml-trooper", datasheetId: "ds1", miniatureId: "m-trooper" },
      ],
      base_miniature_loadout_wargear_option: [
        { id: "b1", count: 1, wargearOptionId: "wo-bolter", baseMiniatureLoadoutId: "bml-champ" },
        { id: "b2", count: 1, wargearOptionId: "wo-blade", baseMiniatureLoadoutId: "bml-champ" },
        { id: "b3", count: 1, wargearOptionId: "wo-bolter", baseMiniatureLoadoutId: "bml-trooper" },
        { id: "b4", count: 1, wargearOptionId: "wo-blade", baseMiniatureLoadoutId: "bml-trooper" },
      ],
      loadout_choice_set: [
        { id: "lcs-trooper", limit: 1, allowDuplicates: false, datasheetId: "ds1", miniatureId: "m-trooper", alternate: false },
      ],
      loadout_choice: [
        { id: "lc1", loadoutChoiceSetId: "lcs-trooper" },
        { id: "lc2", loadoutChoiceSetId: "lcs-trooper" },
      ],
      loadout_choice_wargear_item: [
        // branch 1 = the base (combi-bolter + accursed weapon) → excluded as no-op
        { id: "i1", count: 1, wargearItemId: "wi-bolter", loadoutChoiceId: "lc1" },
        { id: "i2", count: 1, wargearItemId: "wi-blade", loadoutChoiceId: "lc1" },
        // branch 2 = power fist + reaper autocannon
        { id: "i3", count: 1, wargearItemId: "wi-fist", loadoutChoiceId: "lc2" },
        { id: "i4", count: 1, wargearItemId: "wi-reaper", loadoutChoiceId: "lc2" },
      ],
      limited_wargear_choice_set: [
        { id: "lim1", mandatory: false, datasheetId: "ds1", miniatureId: "m-trooper" },
      ],
      limited_wargear_choice: [{ id: "lwc1", limitedWargearChoiceSetId: "lim1" }],
      limited_wargear_choice_wargear_item: [
        { id: "li1", count: 1, wargearItemId: "wi-reaper", limitedWargearChoiceId: "lwc1" },
      ],
      // 1 reaper per 5 models
      wargear_limit: [
        { id: "wl1", modelCount: 5, choiceLimit: 1, duplicateLimit: null, limitedWargearChoiceSetId: "lim1" },
      ],
    },
  });
}

const VALID = new Set(["combi-bolter", "accursed-weapon", "power-fist", "reaper-autocannon"]);
const resolve = (name: string) => {
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return VALID.has(id) ? id : null;
};

describe("deriveWargear", () => {
  const d = deriveWargear(fixtureDump(), "ds1", resolve);

  it("derives per-model default loadouts from base_miniature_loadout", () => {
    expect(d.defaultsByModel.get("Champion")).toEqual(["combi-bolter", "accursed-weapon"]);
    expect(d.defaultsByModel.get("Trooper")).toEqual(["combi-bolter", "accursed-weapon"]);
  });

  it("emits a per-model swap option that replaces the base and offers the non-base branch", () => {
    expect(d.options).toHaveLength(1);
    const o = d.options[0];
    expect(o.replaces).toEqual(["combi-bolter", "accursed-weapon"]);
    // The base branch is dropped as a no-op; the heavy branch remains.
    expect(o.replacement).toEqual(["power-fist", "reaper-autocannon"]);
    // 1-per-5 squad cap → per_n_models 5, scoped to the bulk model.
    expect(o.model_constraint).toEqual({ model_name: "Trooper", per_n_models: 5 });
  });

  it("leaves no orphan: every offered weapon is a default or reachable via an option", () => {
    const reach = new Set<string>();
    for (const id of d.defaultsByModel.get("Trooper") ?? []) reach.add(id);
    for (const o of d.options) {
      for (const id of o.replaces ?? []) reach.add(id);
      for (const id of o.replacement ?? []) reach.add(id);
      for (const g of o.replacement_choice ?? []) for (const id of g) reach.add(id);
    }
    for (const w of VALID) expect(reach.has(w), `${w} reachable`).toBe(true);
  });

  it("reports no unresolved names when the vocabulary is complete", () => {
    expect(d.unresolved).toEqual([]);
  });
});

describe("withinEditDistance1", () => {
  it("matches GW↔repo spelling drift", () => {
    expect(withinEditDistance1("absolvor-bolt-pistol", "absolver-bolt-pistol")).toBe(true); // substitution
    expect(withinEditDistance1("twin-killsaws", "twin-killsaw")).toBe(true); // deletion
    expect(withinEditDistance1("nuncio-acquila", "nuncio-aquila")).toBe(true); // insertion
  });
  it("rejects distance ≥2 and unequal stems", () => {
    expect(withinEditDistance1("lascannon", "autocannon")).toBe(false);
    expect(withinEditDistance1("meltagun", "plasma-gun")).toBe(false);
    expect(withinEditDistance1("bolt-rifle", "bolt-pistol")).toBe(false);
  });
});
