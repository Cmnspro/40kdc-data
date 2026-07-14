import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { DEFAULT_DUMP_PATH, loadDump, MfmDump } from "../src/mfm/loader.js";
import { CORE_DIR } from "../src/mfm/repo-files.js";
import {
  runDetachmentFields,
  requiredKeywordsForDetachment,
  tagsForDetachment,
  type DirDetFieldResult,
} from "../src/mfm/detachment-fields.js";

/**
 * WS2 detachment-field reconcile. The derivation helpers are unit-tested with
 * synthetic fixtures (no dump needed); the whole-repo reconcile is dump-guarded
 * (the dump is gitignored, so CI without it skips those).
 */

/** Minimal synthetic dump: a chapter-locked detachment, a roster-wide one, an
 *  umbrella (parent-keyword) broadening, and a unique-keyword tag. */
function fixture(): MfmDump {
  return new MfmDump({
    data: {
      faction_keyword: [
        { id: "fk-astartes", localisations: { en: { name: "Adeptus Astartes" } } },
        { id: "fk-iron", localisations: { en: { name: "Iron Hands" } } },
        { id: "fk-asuryani", localisations: { en: { name: "Asuryani" } } },
        { id: "fk-aeldari", localisations: { en: { name: "Aeldari" } } },
      ],
      keyword: [{ id: "kw-battlesuit", localisations: { en: { name: "Battlesuit" } } }],
      publication: [
        { id: "pub-astartes", factionKeywordId: "fk-astartes" },
        { id: "pub-asuryani", factionKeywordId: "fk-asuryani" },
      ],
      detachment: [
        // chapter-locked: owned by Adeptus Astartes, applies to Iron Hands only.
        { id: "d-lock", publicationId: "pub-astartes", detachmentPointsCost: 2, isCombatPatrol: false, localisations: { en: { name: "Hammer of Avernii" } } },
        // roster-wide: owned by Adeptus Astartes, applicability enumerates the roster + a chapter.
        { id: "d-wide", publicationId: "pub-astartes", detachmentPointsCost: 2, isCombatPatrol: false, localisations: { en: { name: "Gladius Task Force" } } },
        // umbrella broadening: owned by Asuryani, applies to Aeldari (the roster).
        { id: "d-umbrella", publicationId: "pub-asuryani", detachmentPointsCost: 0, isCombatPatrol: true, localisations: { en: { name: "Kygharil's Protectors" } } },
        // tagged: owned by Adeptus Astartes, carries a unique mutual-exclusivity keyword.
        { id: "d-tag", publicationId: "pub-astartes", detachmentPointsCost: 2, isCombatPatrol: false, localisations: { en: { name: "Solar Spearhead" } } },
      ],
      detachment_faction_keyword: [
        { detachmentId: "d-lock", factionKeywordId: "fk-iron" },
        { detachmentId: "d-wide", factionKeywordId: "fk-astartes" },
        { detachmentId: "d-wide", factionKeywordId: "fk-iron" },
        { detachmentId: "d-umbrella", factionKeywordId: "fk-aeldari" },
      ],
      detachment_unique_keyword: [{ detachmentId: "d-tag", keywordId: "kw-battlesuit" }],
    },
  });
}

describe("detachment-field derivation (synthetic)", () => {
  const dump = fixture();

  it("locks a detachment to the sub-faction keyword absent from the roster", () => {
    expect(requiredKeywordsForDetachment(dump, "d-lock")).toEqual(["Iron Hands"]);
  });

  it("treats a roster-wide enumeration (ownership keyword present) as no restriction", () => {
    expect(requiredKeywordsForDetachment(dump, "d-wide")).toBeNull();
  });

  it("treats an umbrella/roster keyword as a broadening, not a lock", () => {
    // Owned by Asuryani, applicable to the whole Aeldari roster → requiring "Aeldari"
    // is trivially satisfied, so no restriction is emitted.
    expect(requiredKeywordsForDetachment(dump, "d-umbrella")).toBeNull();
  });

  it("derives a lowercase mutual-exclusivity tag slug from the unique keyword", () => {
    expect(tagsForDetachment(dump, "d-tag")).toEqual(["battlesuit"]);
    expect(tagsForDetachment(dump, "d-lock")).toEqual([]);
  });

  it("collects an unresolved faction-keyword id rather than emitting a null label", () => {
    const d = new MfmDump({
      data: {
        faction_keyword: [{ id: "fk-astartes", localisations: { en: { name: "Adeptus Astartes" } } }],
        publication: [{ id: "pub", factionKeywordId: "fk-astartes" }],
        detachment: [{ id: "d", publicationId: "pub", detachmentPointsCost: 2, isCombatPatrol: false, localisations: { en: { name: "X" } } }],
        detachment_faction_keyword: [{ detachmentId: "d", factionKeywordId: "fk-missing" }],
      },
    });
    const unresolved: string[] = [];
    expect(requiredKeywordsForDetachment(d, "d", unresolved)).toBeNull();
    expect(unresolved).toContain("fk-missing");
  });
});

describe.skipIf(!fs.existsSync(DEFAULT_DUMP_PATH))("detachment-fields over the real dump", () => {
  const report = runDetachmentFields(loadDump());
  const byDir = new Map<string, DirDetFieldResult>(report.dirs.map((d) => [d.dir, d]));
  const sum = (f: (d: DirDetFieldResult) => number) => report.dirs.reduce((a, d) => a + f(d), 0);

  it("reconciles mutual-exclusivity tags from the dump, surfacing disagreements (idempotent end-state)", () => {
    // End-state, not per-run delta: whether this run fills or (post-apply) confirms,
    // a non-trivial set of detachments carry a dump-derived tag, and the tau/votann
    // curated tags that differ from the dump's shared keyword stay surfaced for review.
    expect(sum((d) => d.tagsFilled.length + d.tagsConfirmed)).toBeGreaterThan(0);
    expect(sum((d) => d.tagsReview.length)).toBeGreaterThan(0);
  });

  it("locks the 7 chapter-locked detachments, routed to their chapter dir (idempotent end-state)", () => {
    // The chapter-locked SM detachments are filed under the chapter dir (iron-hands,
    // ultramarines, …), reached via required-keyword routing. Whether this run fills
    // or (post-apply) confirms, exactly 7 carry their lock, and the data reflects it.
    expect(sum((d) => d.reqFilled.length + d.reqConfirmed)).toBe(7);
    const hammer = JSON.parse(
      fs.readFileSync(path.join(CORE_DIR, "iron-hands", "detachments.json"), "utf8"),
    ).find((d: { id: string }) => d.id === "hammer-of-avernii") as { restrictions?: { required_keywords?: string[] } };
    expect(hammer.restrictions?.required_keywords).toEqual(["Iron Hands"]);
  });

  it("does not spuriously lock the Aeldari Combat-Patrol detachment to its own roster", () => {
    const aeldari = byDir.get("aeldari");
    expect(aeldari?.reqFilled.some((r) => r.id === "kygharils-protectors")).not.toBe(true);
  });

  it("only stages dirs it actually changed", () => {
    for (const s of report.staged) expect(s.path).toMatch(/detachments\.json$/);
  });
});
