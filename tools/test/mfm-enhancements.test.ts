import { describe, it, expect } from "vitest";
import { MfmDump } from "../src/mfm/loader.js";
import {
  buildEnhCanon,
  buildEnhFieldCanon,
  combatPatrolEnhIds,
  runEnhancements,
} from "../src/mfm/enhancements.js";

/**
 * Enhancement matching keys on `detachmentScopedId(name, detachment)`. The dump
 * appends parenthetical tags ("(Upgrade)", "(Aura)") to enhancement names that
 * the repo id omits — buildEnhCanon must strip them, or upgrade-tag enhancements
 * silently fail to match (regression guard for the systematic miss found in 3A).
 */
function dump(): MfmDump {
  return new MfmDump({
    data: {
      detachment: [
        { id: "det-mm", publicationId: "p", localisations: { en: { name: "Might of the Moritoi" } } },
        {
          id: "det-cp",
          publicationId: "p",
          isCombatPatrol: true,
          localisations: { en: { name: "Synthetic Patrol Cadre" } },
        },
      ],
      enhancement: [
        {
          id: "e1",
          detachmentId: "det-mm",
          basePointsCost: 15,
          localisations: { en: { name: "Auramite Sarcophagus (Upgrade)" } },
        },
        {
          id: "e2",
          detachmentId: "det-mm",
          basePointsCost: 20,
          localisations: { en: { name: "Interred Expertise (Aura)" } },
        },
        {
          id: "e3",
          detachmentId: "det-mm",
          basePointsCost: 10,
          localisations: { en: { name: "Plain Relic" } },
        },
        {
          // A Combat-Patrol-box enhancement under a fabricated detachment so it
          // exists in no repo dir and always lands in the unmatched bucket.
          id: "e-cp",
          detachmentId: "det-cp",
          isCombatPatrol: true,
          basePointsCost: 5,
          localisations: { en: { name: "Synthetic Patrol Relic" } },
        },
      ],
    },
  });
}

const CP_ENH_ID = "synthetic-patrol-relic-synthetic-patrol-cadre";

describe("buildEnhCanon", () => {
  it("strips trailing parenthetical tags so upgrade/aura enhancements match repo ids", () => {
    const canon = buildEnhCanon(dump());
    expect(canon.get("auramite-sarcophagus-might-of-the-moritoi")).toBe(15);
    expect(canon.get("interred-expertise-might-of-the-moritoi")).toBe(20);
    // the tagged form must NOT be what we key on
    expect(canon.has("auramite-sarcophagus-upgrade-might-of-the-moritoi")).toBe(false);
  });

  it("leaves untagged names alone", () => {
    expect(buildEnhCanon(dump()).get("plain-relic-might-of-the-moritoi")).toBe(10);
  });
});

/**
 * buildEnhFieldCanon derives the structured fields the dump can supply beyond cost:
 *   - upgrade_tag           ← enhancementType === "upgrade"
 *   - max_targets           ← limit
 *   - exclusion_keywords    ← enhancement_excluded_keyword
 *   - keyword_restrictions  ← required-keyword-group keyword/faction-keyword members
 *                             + the datasheet-scoped group's datasheet name
 * Multi-group enhancements with divergent member sets are an OR the flat list can't
 * hold, and are flagged `keywordRestrictionsAmbiguous`.
 */
function fieldsDump(): MfmDump {
  return new MfmDump({
    data: {
      detachment: [{ id: "det", publicationId: "p", localisations: { en: { name: "Chorus of Condemnation" } } }],
      keyword: [{ id: "k-inf", localisations: { en: { name: "Infantry" } } }],
      faction_keyword: [{ id: "fk-as", localisations: { en: { name: "Adepta Sororitas" } } }],
      datasheet: [{ id: "ds-ex", localisations: { en: { name: "Exorcist" } } }],
      enhancement: [
        // wargear upgrade: type=upgrade, limit=3, one group carrying datasheet Exorcist + fkw
        { id: "e-up", detachmentId: "det", enhancementType: "upgrade", limit: 3, basePointsCost: 15, localisations: { en: { name: "Symphonic Payload (Upgrade)" } } },
        // miniature: type=miniature, limit=1, single fkw group + an excluded keyword
        { id: "e-min", detachmentId: "det", enhancementType: "miniature", limit: 1, basePointsCost: 20, localisations: { en: { name: "Plain Relic" } } },
        // multi-group OR: two groups with different members
        { id: "e-multi", detachmentId: "det", enhancementType: "miniature", limit: 1, basePointsCost: 10, localisations: { en: { name: "Split Relic" } } },
      ],
      enhancement_required_keyword_group: [
        { id: "g-up", enhancementId: "e-up", datasheetId: "ds-ex" },
        { id: "g-min", enhancementId: "e-min", datasheetId: null },
        { id: "g-m1", enhancementId: "e-multi", datasheetId: null },
        { id: "g-m2", enhancementId: "e-multi", datasheetId: "ds-ex" },
      ],
      enhancement_required_keyword_group_keyword: [{ enhancementRequiredKeywordGroupId: "g-m1", keywordId: "k-inf" }],
      enhancement_required_keyword_group_faction_keyword: [
        { enhancementRequiredKeywordGroupId: "g-up", factionKeywordId: "fk-as" },
        { enhancementRequiredKeywordGroupId: "g-min", factionKeywordId: "fk-as" },
      ],
      enhancement_excluded_keyword: [{ enhancementId: "e-min", keywordId: "k-inf" }],
    },
  });
}

describe("buildEnhFieldCanon", () => {
  it("derives upgrade_tag, max_targets, exclusions and a datasheet+fkw restriction", () => {
    const canon = buildEnhFieldCanon(fieldsDump());
    const up = canon.get("symphonic-payload-chorus-of-condemnation");
    expect(up).toBeDefined();
    expect(up!.upgrade_tag).toBe(true);
    expect(up!.max_targets).toBe(3);
    expect(up!.keyword_restrictions).toEqual(["Adepta Sororitas", "Exorcist"]);
    expect(up!.keywordRestrictionsAmbiguous).toBe(false);
    expect(up!.exclusion_keywords).toBeNull();
  });

  it("maps a miniature enhancement's fkw group and its exclusion", () => {
    const min = buildEnhFieldCanon(fieldsDump()).get("plain-relic-chorus-of-condemnation")!;
    expect(min.upgrade_tag).toBe(false);
    expect(min.max_targets).toBe(1);
    expect(min.keyword_restrictions).toEqual(["Adepta Sororitas"]);
    expect(min.exclusion_keywords).toEqual(["Infantry"]);
  });

  it("flags a divergent multi-group enhancement as ambiguous", () => {
    const multi = buildEnhFieldCanon(fieldsDump()).get("split-relic-chorus-of-condemnation")!;
    expect(multi.keywordRestrictionsAmbiguous).toBe(true);
    // union across both groups; the flat list can't express the OR, so the reconcile
    // will not overwrite/fill from it.
    expect(multi.keyword_restrictions).toEqual(["Exorcist", "Infantry"]);
  });
});

describe("combatPatrolEnhIds", () => {
  it("collects only the Combat-Patrol enhancement ids", () => {
    const cp = combatPatrolEnhIds(dump());
    expect(cp.has(CP_ENH_ID)).toBe(true);
    expect(cp.has("plain-relic-might-of-the-moritoi")).toBe(false);
    expect(cp.size).toBe(1);
  });
});

describe("runEnhancements Combat-Patrol filtering", () => {
  it("holds Combat-Patrol enhancements out of newInDump by default", () => {
    const report = runEnhancements(dump(), false);
    expect(report.newInDump).not.toContain(CP_ENH_ID);
    expect(report.cpExcluded).toContain(CP_ENH_ID);
  });

  it("includes them when --include-combat-patrol is set", () => {
    const report = runEnhancements(dump(), false, { includeCombatPatrol: true });
    expect(report.newInDump).toContain(CP_ENH_ID);
    expect(report.cpExcluded).toHaveLength(0);
  });
});
