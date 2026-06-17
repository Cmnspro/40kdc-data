import { describe, it, expect } from "vitest";
import { MfmDump } from "../src/mfm/loader.js";
import { buildCanon, dispositionIdMap } from "../src/mfm/dispositions.js";

/**
 * Canon-building joins the dump's detachment / disposition / per-faction DP-cost
 * tables. Tested against a synthetic dump so it runs without _private/dump.json.
 * Faction names used ("Black Templars") must resolve to real repo dirs, since
 * the override map keys on the resolved dir.
 */
function dump(): MfmDump {
  return new MfmDump({
    data: {
      force_disposition: [
        { id: "fd-pth", localisations: { en: { name: "Purge the Foe" } } },
        { id: "fd-tah", localisations: { en: { name: "Take and Hold" } } },
      ],
      faction_keyword: [{ id: "fk-bt", localisations: { en: { name: "Black Templars" } } }],
      detachment: [
        {
          id: "det-zerk",
          publicationId: "p",
          detachmentPointsCost: 3,
          localisations: { en: { name: "Berzerker Warband" } },
        },
        {
          id: "det-storm",
          publicationId: "p",
          detachmentPointsCost: 3,
          localisations: { en: { name: "Stormlance Task Force" } },
        },
      ],
      detachment_force_disposition: [
        { detachmentId: "det-zerk", forceDispositionId: "fd-pth" },
        { detachmentId: "det-storm", forceDispositionId: "fd-tah" },
      ],
      detachment_faction_detachment_points_cost: [
        { detachmentId: "det-storm", factionKeywordId: "fk-bt", detachmentPointsCost: 2 },
      ],
    },
  });
}

describe("dispositionIdMap", () => {
  it("maps disposition UUIDs to their kebab repo ids", () => {
    const m = dispositionIdMap(dump());
    expect(m.get("fd-pth")).toBe("purge-the-foe");
    expect(m.get("fd-tah")).toBe("take-and-hold");
  });
});

describe("buildCanon", () => {
  it("derives base DP + disposition per detachment slug", () => {
    const { bySlug } = buildCanon(dump());
    expect(bySlug.get("berzerker-warband")).toEqual({ dp: 3, disposition: "purge-the-foe" });
    expect(bySlug.get("stormlance-task-force")).toEqual({ dp: 3, disposition: "take-and-hold" });
  });

  it("keys per-faction DP overrides by (slug, repo dir)", () => {
    const { overrideBySlugDir } = buildCanon(dump());
    expect(overrideBySlugDir.get("stormlance-task-force@@black-templars")).toBe(2);
    expect(overrideBySlugDir.get("stormlance-task-force@@adeptus-astartes")).toBeUndefined();
  });
});
