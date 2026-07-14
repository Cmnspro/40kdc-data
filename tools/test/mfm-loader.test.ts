import { describe, expect, it } from "vitest";
import {
  MfmDump,
  type DatasheetRow,
  type DetachmentRow,
  type FactionKeywordRow,
  type MfmDumpPayload,
  type PublicationRow,
} from "../src/mfm/loader.js";

const factionKeyword = (id: string, name: string): FactionKeywordRow => ({
  armySelectionImage: "",
  excludedFromArmyBuilder: false,
  id,
  localisations: { en: { commonName: null, lore: "Fabricated fixture lore.", name } },
  mandatoryWarlordId: null,
  moreInfoImage: "",
  parentFactionKeywordId: null,
  rosterFactionImage: "",
  rosterHeaderImage: "",
});

const publication = (id: string, factionKeywordId: string | null, name: string): PublicationRow => ({
  displayOrder: 0,
  errataDate: null,
  factionBackgroundImage: "",
  factionKeywordId,
  id,
  isCombatPatrol: false,
  isCoreRules: false,
  isLegends: false,
  localisations: { en: { combatPatrolName: null, name } },
  productId: null,
});

const datasheet = (id: string, publicationId: string, name: string): DatasheetRow => ({
  allegianceAbilityGroupId: null,
  bannerImage: "",
  displayOrder: 0,
  id,
  isFreeFromEntitlements: false,
  isLegends: false,
  isSuccessorChapter: false,
  localisations: { en: { baseSize: null, lore: null, name, unitComposition: "One fabricated model." } },
  maxModelCount: null,
  publicationId,
  rowImage: "",
});

const detachment = (id: string, publicationId: string, name: string): DetachmentRow => ({
  bannerImage: "",
  detachmentPointsCost: 0,
  displayOrder: 0,
  id,
  isCombatPatrol: false,
  isFreeFromEntitlements: false,
  localisations: { en: { name } },
  pointsCost: null,
  publicationId,
  rowImage: "",
});

/** Focused fixtures may omit tables, but every supplied row is the complete generated row type. */
function miniDump(): MfmDump {
  return new MfmDump({
    metadata: { data_version: 42 },
    data: {
      faction_keyword: [
        factionKeyword("fk-green", "Green Coalition"),
        factionKeyword("fk-silver", "Silver Coalition"),
        factionKeyword("fk-applicable", "Applicable Coalition"),
      ],
      publication: [
        publication("pub-1", "fk-green", "Green Source"),
        publication("pub-2", "fk-silver", "Silver Source"),
        publication("pub-null", null, "Unowned Source"),
      ],
      datasheet: [
        datasheet("ds-one", "pub-1", "First Cohort"),
        datasheet("ds-two", "pub-2", "Second Cohort"),
      ],
      datasheet_faction_keyword: [
        { id: "app-1", datasheetId: "ds-one", displayOrder: 0, factionKeywordId: "fk-applicable" },
      ],
      detachment: [detachment("det-one", "pub-1", "First Formation")],
      force_disposition: [
        { id: "fd-one", localisations: { en: { name: "First Disposition" } } },
      ],
      detachment_force_disposition: [
        { detachmentId: "det-one", forceDispositionId: "fd-one" },
      ],
    },
  });
}

// Exact on-disk payloads require all 129 table keys; focused MfmDumpInit fixtures intentionally do not.
// @ts-expect-error an exact MfmDumpPayload cannot omit generated tables
const incompleteExactPayload: MfmDumpPayload = { metadata: { data_version: 1 }, data: {} };
void incompleteExactPayload;

describe("MfmDump", () => {
  it("exposes data_version and preserves the known-table missing guard", () => {
    const dump = miniDump();
    expect(dump.version).toBe(42);
    expect(() => dump.table("army_rule")).toThrow('GW MFM dump has no table "army_rule"');
  });

  it("indexes by identity, caches indexes, and rejects duplicate identities", () => {
    const dump = miniDump();
    const first = dump.byId("datasheet");
    expect(dump.byId("datasheet")).toBe(first);
    expect(dump.enName(first.get("ds-one"))).toBe("First Cohort");

    const duplicate = new MfmDump({
      data: { datasheet: [datasheet("same", "pub-1", "One"), datasheet("same", "pub-1", "Two")] },
    });
    expect(() => duplicate.byId("datasheet")).toThrow(
      'GW MFM table "datasheet" has duplicate identity "same"',
    );
  });

  it("groups rows by generated string keys and caches the result", () => {
    const dump = miniDump();
    const first = dump.groupBy("detachment_force_disposition", "detachmentId");
    expect(first.get("det-one")).toHaveLength(1);
    expect(dump.groupBy("detachment_force_disposition", "detachmentId")).toBe(first);
  });

  it("follows verified parents and children, including nullable parents", () => {
    const dump = miniDump();
    const firstDatasheet = dump.byId("datasheet").get("ds-one")!;
    expect(dump.parent("datasheet.publicationId", firstDatasheet)?.id).toBe("pub-1");
    expect(dump.children("datasheet.publicationId", "pub-1").map((row) => row.id)).toEqual(["ds-one"]);
    const unowned = dump.byId("publication").get("pub-null")!;
    expect(dump.parent("publication.factionKeywordId", unowned)).toBeUndefined();
  });

  it("derives ownership through publication, never applicability", () => {
    const dump = miniDump();
    expect(dump.factionKeywordOfDatasheet("ds-one")).toBe("fk-green");
    expect(dump.factionKeywordOfDatasheet("ds-two")).toBe("fk-silver");
    expect(dump.factionKeywordOfDatasheet("missing")).toBeNull();
    expect(dump.table("datasheet_faction_keyword")[0].factionKeywordId).toBe("fk-applicable");
  });

  it("derives detachment ownership and force disposition through verified relations", () => {
    const dump = miniDump();
    expect(dump.factionKeywordOfDetachment("det-one")).toBe("fk-green");
    const association = dump.children("detachment_force_disposition.detachmentId", "det-one")[0];
    expect(association).toEqual({ detachmentId: "det-one", forceDispositionId: "fd-one" });
    expect(dump.parent("detachment_force_disposition.forceDispositionId", association)?.id).toBe("fd-one");
    expect(dump.dispositionOfDetachment("det-one")).toBe("fd-one");
    expect(dump.dispositionOfDetachment("missing")).toBeNull();
  });

  it("trims English names and returns undefined when absent", () => {
    const row = factionKeyword("fk-trim", "  Trimmed Coalition  ");
    expect(miniDump().enName(row)).toBe("Trimmed Coalition");
    expect(miniDump().enName(undefined)).toBeUndefined();
  });
});
