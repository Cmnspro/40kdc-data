import { describe, it, expect } from "vitest";

import { parseOption } from "../src/converters/option-parser.js";

/** Convenience: assert a parse succeeded and return the option. */
function ok(desc: string) {
  const r = parseOption(desc);
  expect(r.ok, `expected parse ok for: ${desc}`).toBe(true);
  if (r.ok !== true) throw new Error("unreachable");
  return r.option;
}

describe("parseOption — skips", () => {
  it.each([null, "", "None", "* These options cannot be taken on the same model.", "This weapon cannot be replaced."])(
    "skips non-option %p",
    (desc) => {
      expect(parseOption(desc as string).ok).toBe("skip");
    },
  );
});

describe("parseOption — Khorne Berzerkers (the dogfood case)", () => {
  it("champion bolt pistol → plasma pistol (max 1)", () => {
    const o = ok("The Khorne Berzerker Champion's bolt pistol can be replaced with 1 plasma pistol.");
    expect(o.kind).toBe("swap");
    expect(o.constraint).toEqual({ model_name: "Khorne Berzerker Champion", max_count: 1 });
    expect(o.replaces).toEqual(["bolt pistol"]);
    expect(o.replacement).toEqual(["plasma pistol"]);
  });

  it("ratio bolt pistol → plasma pistol (per 5)", () => {
    const o = ok("For every 5 models in this unit, 1 Khorne Berzerker's bolt pistol can be replaced with 1 plasma pistol.");
    expect(o.constraint.per_n_models).toBe(5);
    expect(o.replaces).toEqual(["bolt pistol"]);
    expect(o.replacement).toEqual(["plasma pistol"]);
  });

  it("ratio chainblade → Khornate eviscerator (per 5)", () => {
    const o = ok("For every 5 models in this unit, 1 Khorne Berzerker's chainblade can be replaced with 1 Khornate eviscerator.");
    expect(o.constraint.per_n_models).toBe(5);
    expect(o.replaces).toEqual(["chainblade"]);
    expect(o.replacement).toEqual(["Khornate eviscerator"]);
  });

  it("icon of Khorne add-on (no replaces)", () => {
    const o = ok("1 model can be equipped with 1 icon of Khorne.");
    expect(o.kind).toBe("addon");
    expect(o.constraint.max_count).toBe(1);
    expect(o.replaces).toEqual([]);
    expect(o.replacement).toEqual(["icon of Khorne"]);
  });
});

describe("parseOption — verb voices and shapes", () => {
  it("active voice: '1 model can replace its X with Y'", () => {
    const o = ok("1 model can replace its melta rifle with 1 multi-melta.");
    expect(o.kind).toBe("swap");
    expect(o.constraint.max_count).toBe(1);
    expect(o.replaces).toEqual(["melta rifle"]);
    expect(o.replacement).toEqual(["multi-melta"]);
  });

  it("any number, 'have their X and Z replaced with A and B'", () => {
    const o = ok("Any number of Boyz can each have their slugga and choppa replaced with 1 shoota and 1 close combat weapon.");
    expect(o.constraint.any_number).toBe(true);
    expect(o.replaces).toEqual(["slugga", "choppa"]);
    expect(o.replacement).toEqual(["shoota", "close combat weapon"]);
  });

  it("up to N", () => {
    const o = ok("Up to 2 Noise Marines can each replace their sonic blaster with 1 blastmaster.");
    expect(o.constraint.max_count).toBe(2);
    expect(o.replaces).toEqual(["sonic blaster"]);
    expect(o.replacement).toEqual(["blastmaster"]);
  });

  it("choice: 'one of the following' → replacement_choice", () => {
    const o = ok("The Boss Nob's big choppa can be replaced with one of the following:1 power klaw1 kombi-weapon");
    expect(o.replacement_choice).toEqual([["power klaw"], ["kombi-weapon"]]);
    expect(o.replacement).toBeUndefined();
  });

  it("equipped-with colon variant", () => {
    const o = ok("This model can be equipped with:1 lobba");
    expect(o.kind).toBe("addon");
    expect(o.replacement).toEqual(["lobba"]);
  });

  it("single-alternative 'one of the following' collapses to a flat replacement", () => {
    const o = ok("This model's gun can be replaced with one of the following:1 plasma gun");
    expect(o.replacement).toEqual(["plasma gun"]);
    expect(o.replacement_choice).toBeUndefined();
  });

  it("strips footnote markers from names", () => {
    const o = ok("Up to 2 models can each replace their sonic blaster with 1 blastmaster*");
    expect(o.replacement).toEqual(["blastmaster"]);
  });
});

describe("parseOption — paired-weapon choice groups (regression: '-and' truncation)", () => {
  // The "one of the following" list runs items together with no separator, and
  // each alternative is itself a pair "1 A and 1 B". The choice splitter must
  // break only at the glued boundary (…B1 A…), never at the space before the
  // "1 B" of a pair — otherwise the pair is severed and "A and" leaks an
  // "a-and" id (see Seraphim/Captain/Telemon corruption).
  it("keeps each 'A and B' alternative intact (Seraphim-style)", () => {
    const o = ok(
      "The Seraphim Superior's two bolt pistols can be replaced with one of the following:" +
        "1 bolt pistol and 1 chainsword" +
        "1 bolt pistol and 1 plasma pistol" +
        "1 plasma pistol and 1 chainsword",
    );
    expect(o.replacement_choice).toEqual([
      ["bolt pistol", "chainsword"],
      ["bolt pistol", "plasma pistol"],
      ["plasma pistol", "chainsword"],
    ]);
    // No alternative may carry a dangling conjunction.
    for (const g of o.replacement_choice!) {
      for (const name of g) expect(name).not.toMatch(/\band$/i);
    }
  });

  it("keeps a three-weapon 'A and B and C' alternative intact", () => {
    const o = ok(
      "This model's storm bolter can be replaced with one of the following:" +
        "1 heavy bolt pistol and 1 master-crafted power weapon and 1 relic shield" +
        "1 power fist",
    );
    expect(o.replacement_choice).toEqual([
      ["heavy bolt pistol", "master-crafted power weapon", "relic shield"],
      ["power fist"],
    ]);
  });

  it("single glued alternatives still split (no false merge)", () => {
    const o = ok("The Boss Nob's big choppa can be replaced with one of the following:1 power klaw1 kombi-weapon");
    expect(o.replacement_choice).toEqual([["power klaw"], ["kombi-weapon"]]);
  });

  it("accepts 'N of the following' (not just 'one of the following')", () => {
    const o = ok("This model's reaper chainsword can be replaced with 1 of the following:1 thermal cannon1 gatling cannon and 1 heavy darkflamer");
    expect(o.replacement_choice).toEqual([
      ["thermal cannon"],
      ["gatling cannon", "heavy darkflamer"],
    ]);
  });

  it("strips an 'options (qualifier)' clause after 'the following'", () => {
    const o = ok(
      "Up to 2 Raptors can each have their Astartes chainsword replaced with one of the following options (you cannot select the same option more than once):" +
        "1 flamer and 1 close combat weapon" +
        "1 meltagun and 1 close combat weapon",
    );
    expect(o.replacement_choice).toEqual([
      ["flamer", "close combat weapon"],
      ["meltagun", "close combat weapon"],
    ]);
  });

  it("splits Oxford-comma triples 'A, B and C'", () => {
    const o = ok(
      "This model's gun can be replaced with one of the following:" +
        "1 arachnus storm cannon, 1 caestus and 1 plasma projector" +
        "1 power fist",
    );
    expect(o.replacement_choice).toEqual([
      ["arachnus storm cannon", "caestus", "plasma projector"],
      ["power fist"],
    ]);
  });

  it("Telemon Heavy Dreadnought: full 5-way choice with pairs and comma-triples", () => {
    // Authoritative wargear text (game-datacards 10th), in the glued shape the
    // upstream source emits. This is the exact corruption case from the report.
    const o = ok(
      "This model's 2 iliastus accelerator culverins can be replaced with one of the following:" +
        "2 arachnus storm cannons" +
        "2 Telemon caestus and 2 twin plasma projectors" +
        "1 iliastus accelerator culverin and 1 arachnus storm cannon" +
        "1 iliastus accelerator culverin, 1 Telemon caestus and 1 twin plasma projector" +
        "1 arachnus storm cannon, 1 Telemon caestus and 1 twin plasma projector",
    );
    expect(o.replaces).toEqual(["iliastus accelerator culverins"]);
    expect(o.replacement_choice).toEqual([
      ["arachnus storm cannons"],
      ["Telemon caestus", "twin plasma projectors"],
      ["iliastus accelerator culverin", "arachnus storm cannon"],
      ["iliastus accelerator culverin", "Telemon caestus", "twin plasma projector"],
      ["arachnus storm cannon", "Telemon caestus", "twin plasma projector"],
    ]);
    // Every captured name is a clean weapon name — no dangling conjunction.
    for (const g of o.replacement_choice!) for (const n of g) expect(n).not.toMatch(/\b(and|or)$/i);
  });
});
