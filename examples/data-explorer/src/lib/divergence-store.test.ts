import { describe, it, expect } from "vitest";
import { parseDivergenceReport, type DivergenceIndex } from "./divergence-store.js";

// Distinct sentinels for every prose field the parser must drop (IP boundary).
const GW = "SECRET GW PROSE — must never reach app state";
const EN = "describer english snippet — must never reach app state";

const sampleReport = {
  scope: "all",
  model: "all-MiniLM-L6-v2",
  kind: "divergence",
  raw_threshold: 0.85,
  en_threshold: 0.5,
  totals: {
    abilities_paired: 2641,
    divergent_clusters: 2,
    divergent_pairs: 2,
    mean_gap: 0.545,
    max_gap: 0.9371,
  },
  clusters: [
    {
      size: 2,
      medoid: "self-repair",
      raw_min_sim: 0.83,
      raw_mean_sim: 0.89,
      en_min_sim: 0.0,
      en_mean_sim: 0.12,
      gap: 0.77,
      members: [
        {
          ability_id: "self-repair",
          faction: "necrons",
          ability_type: "unit",
          gw: GW,
          english: EN,
        },
        {
          ability_id: "fixit-da-grot",
          faction: "orks",
          ability_type: "unit",
          gw: GW,
          english: EN,
        },
      ],
      pairs: [
        {
          a: { ability_id: "fixit-da-grot", faction: "orks" },
          b: { ability_id: "self-repair", faction: "necrons" },
          raw_sim: 0.94,
          en_sim: 0.05,
          gap: 0.89,
          a_gw: GW,
          a_english: EN,
          b_gw: GW,
          b_english: EN,
        },
      ],
    },
    {
      size: 2,
      medoid: "tank-shock",
      raw_min_sim: 0.86,
      raw_mean_sim: 0.91,
      en_min_sim: 0.1,
      en_mean_sim: 0.2,
      gap: 0.71,
      members: [
        { ability_id: "tank-shock", faction: "astra-militarum", ability_type: "unit", gw: GW },
        { ability_id: "ram", faction: "orks", ability_type: "unit", gw: GW },
      ],
      pairs: [
        {
          a: { ability_id: "tank-shock", faction: "astra-militarum" },
          b: { ability_id: "ram", faction: "orks" },
          raw_sim: 0.9,
          en_sim: 0.18,
          gap: 0.72,
          a_gw: GW,
          b_gw: GW,
        },
      ],
    },
  ],
};

describe("parseDivergenceReport", () => {
  it("parses a valid report into the structural index", () => {
    const idx: DivergenceIndex = parseDivergenceReport(sampleReport);
    expect(idx.scope).toBe("all");
    expect(idx.model).toBe("all-MiniLM-L6-v2");
    expect(idx.totals.abilities_paired).toBe(2641);
    expect(idx.totals.divergent_clusters).toBe(2);
    expect(idx.totals.divergent_pairs).toBe(2);
    expect(idx.totals.max_gap).toBeCloseTo(0.9371);
    expect(idx.clusters).toHaveLength(2);
    expect(idx.clusters[0].medoid).toBe("self-repair");
    expect(idx.clusters[0].members).toHaveLength(2);
    expect(idx.clusters[0].pairs).toHaveLength(1);
    expect(idx.clusters[0].pairs[0].gap).toBeCloseTo(0.89);
    expect(idx.clusters[0].pairs[0].a.ability_id).toBe("fixit-da-grot");
  });

  it("drops every GW prose snippet — none leak into app state (IP boundary)", () => {
    const idx = parseDivergenceReport(sampleReport);
    const serialized = JSON.stringify(idx);
    expect(serialized).not.toContain(GW);
    expect(serialized).not.toContain(EN);

    // Parsed objects carry only the expected structural keys — no `gw`/`english`/
    // `a_gw`/`a_english`/`b_gw`/`b_english`.
    const member = idx.clusters[0].members[0];
    expect(Object.keys(member).sort()).toEqual(["ability_id", "ability_type", "faction"]);
    const pair = idx.clusters[0].pairs[0];
    expect(Object.keys(pair).sort()).toEqual(["a", "b", "en_sim", "gap", "raw_sim"]);
    expect(Object.keys(pair.a).sort()).toEqual(["ability_id", "faction"]);
    expect(Object.keys(pair.b).sort()).toEqual(["ability_id", "faction"]);
  });

  it("derives cluster/pair counts when totals are absent", () => {
    const { totals, ...noTotals } = sampleReport;
    void totals;
    const idx = parseDivergenceReport(noTotals);
    expect(idx.totals.divergent_clusters).toBe(2);
    expect(idx.totals.divergent_pairs).toBe(2);
    expect(Number.isNaN(idx.totals.mean_gap)).toBe(true);
  });

  it("rejects a non-object report", () => {
    expect(() => parseDivergenceReport([1, 2, 3])).toThrow(/JSON object/);
    expect(() => parseDivergenceReport(null)).toThrow(/JSON object/);
  });

  it("rejects a report with the wrong kind", () => {
    expect(() => parseDivergenceReport({ ...sampleReport, kind: "roundtrip" })).toThrow(
      /divergence/,
    );
  });

  it("rejects a missing clusters array", () => {
    expect(() => parseDivergenceReport({ kind: "divergence" })).toThrow(/clusters/);
  });

  it("rejects a pair end missing a string ability_id", () => {
    const bad = {
      kind: "divergence",
      clusters: [
        {
          medoid: "x",
          members: [{ ability_id: "x", faction: "orks", ability_type: "unit" }],
          pairs: [{ a: { faction: "orks" }, b: { ability_id: "y", faction: "necrons" } }],
        },
      ],
    };
    expect(() => parseDivergenceReport(bad)).toThrow(/ability_id/);
  });
});
