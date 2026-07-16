import { describe, expect, it } from "vitest";
import {
  aggregateEntityFieldGaps,
  classifyUnconsumedTables,
  consumedTables,
  entityNameFromSchema,
  isActionableFieldGap,
  tableOfSource,
  type Catalog,
  type Mapping,
  type MappingField,
} from "../src/audit-mfm-contract.js";

function field(over: Partial<MappingField>): MappingField {
  return {
    provenance: "derived",
    coverage: "implemented",
    sources: [],
    consumers: ["tools/src/x.ts#f"],
    reason: "r",
    ...over,
  };
}

describe("isActionableFieldGap", () => {
  it("flags unresolved-candidate (dump has data, no transform)", () => {
    expect(isActionableFieldGap(field({ provenance: "unresolved-candidate", coverage: "unimplemented", sources: ["data.t.f"] }))).toBe(true);
  });
  it("flags partial coverage", () => {
    expect(isActionableFieldGap(field({ coverage: "partial", sources: ["data.t.f"] }))).toBe(true);
  });
  it("flags unimplemented only when a dump source exists", () => {
    expect(isActionableFieldGap(field({ coverage: "unimplemented", sources: ["data.t.f"] }))).toBe(true);
    expect(isActionableFieldGap(field({ provenance: "repo-authored", coverage: "unimplemented", sources: [] }))).toBe(false);
  });
  it("does not flag implemented fields", () => {
    expect(isActionableFieldGap(field({ coverage: "implemented", sources: ["data.t.f"] }))).toBe(false);
  });
});

describe("aggregateEntityFieldGaps", () => {
  const mapping: Mapping = {
    entity_schema: "schemas/core/unit.schema.json",
    root_tables: ["datasheet"],
    fields: {
      "/name": field({ coverage: "implemented", provenance: "direct", sources: ["data.datasheet.localisations.*.name"] }),
      // three /base_size_mm pointers share source + reason → collapse to one group
      "/base_size_mm": field({ provenance: "unresolved-candidate", coverage: "unimplemented", sources: ["data.datasheet.localisations.*.baseSize"], reason: "no transform" }),
      "/base_size_mm/shape": field({ provenance: "unresolved-candidate", coverage: "unimplemented", sources: ["data.datasheet.localisations.*.baseSize"], reason: "no transform" }),
      "/base_size_mm/size": field({ provenance: "unresolved-candidate", coverage: "unimplemented", sources: ["data.datasheet.localisations.*.baseSize"], reason: "no transform" }),
      // distinct source → separate group even though reason matches
      "/profiles/*/invuln_sv": field({ coverage: "partial", sources: ["data.invulnerable_save.save"], reason: "partial" }),
      "/profiles/*/invuln_sv_melee": field({ coverage: "partial", sources: ["data.invulnerable_save.meleeSave"], reason: "partial" }),
    },
    unmapped_mfm_fields: [
      { source: "data.datasheet.bannerImage", candidate_pointer: null, reason: "artwork" },
      { source: "data.invulnerable_save.localisations.*.rules", candidate_pointer: "/profiles/*/invuln_sv", reason: "caveats" },
    ],
  };

  const agg = aggregateEntityFieldGaps(mapping);

  it("counts coverage buckets over raw field entries", () => {
    expect(agg.counts.total).toBe(6);
    expect(agg.counts.implemented).toBe(1);
    expect(agg.counts.partial).toBe(2);
    expect(agg.counts.unimplemented).toBe(3);
  });

  it("collapses /* expansions sharing source+reason and keeps distinct sources apart", () => {
    // base_size (1 group, 3 pointers) + invuln_sv + invuln_sv_melee (2 groups) = 3
    expect(agg.gapGroups).toHaveLength(3);
    const baseGroup = agg.gapGroups.find((g) => g.representative === "/base_size_mm");
    expect(baseGroup?.pointers).toHaveLength(3);
    expect(agg.gapGroups.filter((g) => g.representative.startsWith("/profiles"))).toHaveLength(2);
  });

  it("keeps only unmapped fields with a candidate destination", () => {
    expect(agg.unmapped).toHaveLength(1);
    expect(agg.unmapped[0].candidatePointer).toBe("/profiles/*/invuln_sv");
  });
});

describe("table axis", () => {
  it("parses the table from a source pointer", () => {
    expect(tableOfSource("data.unit_composition.points")).toBe("unit_composition");
    expect(tableOfSource("data.datasheet.localisations.*.name")).toBe("datasheet");
    expect(tableOfSource("not-a-source")).toBeNull();
  });

  it("collects consumed tables from root_tables and field sources", () => {
    const consumed = consumedTables([
      {
        entity_schema: "schemas/core/unit.schema.json",
        root_tables: ["datasheet"],
        fields: { "/points": field({ sources: ["data.unit_composition.points"] }) },
        unmapped_mfm_fields: [],
      },
    ]);
    expect(consumed.has("datasheet")).toBe(true);
    expect(consumed.has("unit_composition")).toBe(true);
    expect(consumed.has("miniature")).toBe(false);
  });

  it("splits prose-dominant tables from structured ones and drops empty/consumed", () => {
    const catalog: Catalog = {
      catalog_version: 1,
      tables: {
        datasheet: { description: "d", row_shape: "observed", identity: { fields: ["id"], status: "verified" }, fields: { id: { description: "", ip_class: "identifier", shape_review: "observed" } } },
        datasheet_ability: {
          description: "prose+structural, no numeric",
          row_shape: "observed",
          identity: { fields: ["id"], status: "verified" },
          fields: {
            id: { description: "", ip_class: "identifier", shape_review: "observed" },
            abilityType: { description: "", ip_class: "structural", shape_review: "observed" },
            rules: { description: "", ip_class: "prose", shape_review: "observed" },
          },
        },
        detachment_rule: {
          description: "has numeric → structured gap",
          row_shape: "observed",
          identity: { fields: ["id"], status: "verified" },
          fields: {
            id: { description: "", ip_class: "identifier", shape_review: "observed" },
            displayOrder: { description: "", ip_class: "numeric", shape_review: "observed" },
            rules: { description: "", ip_class: "prose", shape_review: "observed" },
          },
        },
        empty_table: { description: "no rows", row_shape: "unobserved", identity: { fields: [], status: "none" }, fields: {} },
      },
    };
    const consumed = new Set(["datasheet"]);
    const rowCounts = new Map([["datasheet", 10], ["datasheet_ability", 2025], ["detachment_rule", 306], ["empty_table", 0]]);
    const gaps = classifyUnconsumedTables(catalog, consumed, new Set(), rowCounts);

    // consumed datasheet excluded; empty_table excluded (0 rows)
    expect(gaps.map((g) => g.table).sort()).toEqual(["datasheet_ability", "detachment_rule"]);
    expect(gaps.find((g) => g.table === "datasheet_ability")?.proseDominant).toBe(true);
    expect(gaps.find((g) => g.table === "detachment_rule")?.proseDominant).toBe(false);
  });

  it("falls back to catalog row_shape when no dump row counts are given", () => {
    const catalog: Catalog = {
      catalog_version: 1,
      tables: {
        observed_t: { description: "", row_shape: "observed", identity: { fields: [], status: "none" }, fields: { f: { description: "", ip_class: "structural", shape_review: "observed" } } },
        unobserved_t: { description: "", row_shape: "unobserved", identity: { fields: [], status: "none" }, fields: {} },
      },
    };
    const gaps = classifyUnconsumedTables(catalog, new Set(), new Set(), null);
    expect(gaps.map((g) => g.table)).toEqual(["observed_t"]);
  });
});

describe("entityNameFromSchema", () => {
  it("extracts the entity base name", () => {
    expect(entityNameFromSchema("schemas/core/wargear-option.schema.json")).toBe("wargear-option");
  });
});
