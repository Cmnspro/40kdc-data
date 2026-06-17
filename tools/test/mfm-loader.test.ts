import { describe, it, expect } from "vitest";
import { MfmDump } from "../src/mfm/loader.js";

/**
 * Loader joins are pure over the in-memory table set, so they're exercised
 * against a hand-built mini dump — no dependence on the gitignored
 * _private/dump.json (which CI never has).
 */
function miniDump(): MfmDump {
  return new MfmDump({
    metadata: { data_version: 42 },
    data: {
      faction_keyword: [
        { id: "fk-orks", localisations: { en: { name: "Orks" } } },
        { id: "fk-nec", localisations: { en: { name: "Necrons" } } },
      ],
      publication: [
        { id: "pub-1", factionKeywordId: "fk-orks" },
        { id: "pub-2", factionKeywordId: "fk-nec" },
      ],
      datasheet: [
        { id: "ds-boyz", publicationId: "pub-1", localisations: { en: { name: "Boyz" } } },
        { id: "ds-warriors", publicationId: "pub-2", localisations: { en: { name: "Warriors" } } },
      ],
      detachment: [
        { id: "det-waaagh", publicationId: "pub-1", localisations: { en: { name: "Waaagh Tribe" } } },
      ],
      detachment_force_disposition: [
        { detachmentId: "det-waaagh", forceDispositionId: "fd-take-and-hold" },
      ],
    },
  });
}

describe("MfmDump", () => {
  it("exposes data_version from metadata", () => {
    expect(miniDump().version).toBe(42);
  });

  it("indexes a table by id and caches the index", () => {
    const d = miniDump();
    const idx1 = d.byId("datasheet");
    const idx2 = d.byId("datasheet");
    expect(idx1).toBe(idx2); // cached, same Map instance
    expect(d.enName(idx1.get("ds-boyz"))).toBe("Boyz");
  });

  it("groups a table by a foreign key", () => {
    const grouped = miniDump().groupBy("detachment_force_disposition", "detachmentId");
    expect(grouped.get("det-waaagh")).toHaveLength(1);
    expect(grouped.get("nope")).toBeUndefined();
  });

  it("throws on an unknown table name", () => {
    expect(() => miniDump().table("not_a_table")).toThrow(/no table/);
  });

  it("resolves a datasheet's owning faction keyword via its publication", () => {
    const d = miniDump();
    expect(d.factionKeywordOfDatasheet("ds-boyz")).toBe("fk-orks");
    expect(d.factionKeywordOfDatasheet("ds-warriors")).toBe("fk-nec");
    expect(d.factionKeywordOfDatasheet("missing")).toBeNull();
  });

  it("resolves a detachment's owning faction keyword and its disposition", () => {
    const d = miniDump();
    expect(d.factionKeywordOfDetachment("det-waaagh")).toBe("fk-orks");
    expect(d.dispositionOfDetachment("det-waaagh")).toBe("fd-take-and-hold");
    expect(d.dispositionOfDetachment("missing")).toBeNull();
  });

  it("returns undefined for a missing English name", () => {
    expect(miniDump().enName(undefined)).toBeUndefined();
    expect(miniDump().enName({ localisations: {} })).toBeUndefined();
  });
});
