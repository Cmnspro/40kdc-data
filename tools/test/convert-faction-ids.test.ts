import { describe, it, expect } from "vitest";
import { dataset } from "../src/data/index.js";
import { RAW_DATA } from "../src/data/bundle.generated.js";
import { detachmentScopedId, nameToId } from "../src/converters/id-generator.js";

/**
 * Guards the army-assist → core-data pipeline against re-introducing the bare
 * `<name-slug>` ids that PR #32 migrated away from. `convert-faction.ts` emits
 * detachment-scoped stratagem/enhancement ids via
 * `detachmentScopedId(name, detachmentName)`; this test asserts that scheme
 * reproduces every committed canonical id, so re-running the converter on a
 * migrated faction causes zero id drift. The embedded (committed) dataset is
 * the oracle. A failure here means the converter's slug algorithm has diverged
 * from whatever produced the committed ids — fix the converter, not this test.
 */
describe("convert-faction canonical id scheme", () => {
  it("reproduces every detachment-scoped stratagem id", () => {
    const mismatches: string[] = [];
    for (const s of dataset.stratagems.all) {
      // Core/shared stratagems carry no detachment and stay bare.
      if (s.detachment_id == null) continue;
      const det = dataset.detachments.get(s.detachment_id);
      expect(det, `unresolved detachment "${s.detachment_id}" for stratagem "${s.id}"`).toBeDefined();
      const expected = detachmentScopedId(s.name, det!.name);
      if (s.id !== expected) mismatches.push(`${s.id} (expected ${expected})`);
    }
    expect(mismatches, `${mismatches.length} stratagem id mismatches`).toEqual([]);
  });

  it("reproduces every detachment-scoped enhancement id", () => {
    const mismatches: string[] = [];
    for (const e of dataset.enhancements.all) {
      if (e.detachment_id == null) continue;
      const det = dataset.detachments.get(e.detachment_id);
      expect(det, `unresolved detachment "${e.detachment_id}" for enhancement "${e.id}"`).toBeDefined();
      const expected = detachmentScopedId(e.name, det!.name);
      if (e.id !== expected) mismatches.push(`${e.id} (expected ${expected})`);
    }
    expect(mismatches, `${mismatches.length} enhancement id mismatches`).toEqual([]);
  });

  it("keeps every detachment stratagem_id / enhancement_id cross-ref resolvable", () => {
    const dangling: string[] = [];
    for (const d of dataset.detachments.all) {
      for (const sid of d.stratagem_ids ?? []) {
        if (!dataset.stratagems.get(sid)) dangling.push(`detachment "${d.id}" → stratagem "${sid}"`);
      }
      for (const eid of d.enhancement_ids ?? []) {
        if (!dataset.enhancements.get(eid)) dangling.push(`detachment "${d.id}" → enhancement "${eid}"`);
      }
    }
    expect(dangling, `${dangling.length} dangling cross-refs`).toEqual([]);
  });

  // PR #32's migration hyphenated diacritics in some ids (e.g. "BRÊKKEKNOTS" →
  // "br-kkeknots-...") while `nameToId` — used everywhere else, including the
  // share registry — strips them ("brekkeknots-..."). This guards the whole
  // dataset (stratagems, enhancements, AND authored enrichment abilities like
  // detachment rules) against that artifact. It only fires for names that carry
  // a combining mark, so apostrophe/detachment-suffix conventions don't trip it.
  it("strips diacritics in ids rather than hyphenating them", () => {
    const hasDiacritic = (s: string): boolean => /\p{Mn}/u.test(s.normalize("NFD"));
    const offenders: string[] = [];
    const check = (id: string, name: string, kind: string): void => {
      if (!hasDiacritic(name)) return;
      // `nameToId(name)` is the diacritic-stripped slug; it must appear in the
      // (possibly detachment-suffixed) id. A hyphenated diacritic breaks this.
      if (!id.includes(nameToId(name))) offenders.push(`${kind} "${id}" (name "${name}")`);
    };
    for (const s of RAW_DATA.stratagems) check(s.id, s.name, "stratagem");
    for (const e of RAW_DATA.enhancements) check(e.id, e.name, "enhancement");
    for (const a of RAW_DATA.abilities) check(a.ability_id, a.name, "ability");
    expect(offenders, `${offenders.length} hyphenated-diacritic ids`).toEqual([]);
  });
});
