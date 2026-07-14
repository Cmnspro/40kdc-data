import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { DEFAULT_DUMP_PATH, loadDump } from "../src/mfm/loader.js";
import { CORE_DIR } from "../src/mfm/repo-files.js";
import { runFactionFields, type DirFactionResult } from "../src/mfm/faction-fields.js";

/**
 * WS3 faction-field reconcile over the real GW MFM dump (gitignored, so CI without
 * it skips this). Asserts the fill-only / confirm / review contract:
 *   - a single-army-rule faction confirms its authored faction_rule_id,
 *   - the parenthetical-stripped army-rule name matches the authored slug,
 *   - a faction whose authored rule is NOT among its owned army rules is surfaced
 *     for review and NEVER overwritten,
 *   - a chapter confirms parent_faction_id: adeptus-astartes,
 *   - the localized common name is appended to aliases,
 *   - and runFactionFields only stages files it actually changed.
 */
describe.skipIf(!fs.existsSync(DEFAULT_DUMP_PATH))("faction-fields over the real dump", () => {
  const report = runFactionFields(loadDump());
  const byDir = new Map<string, DirFactionResult>(report.dirs.map((d) => [d.dir, d]));

  it("confirms a single-rule faction's authored faction_rule_id", () => {
    expect(byDir.get("adepta-sororitas")?.ruleConfirmed).toBe(true);
  });

  it("confirms an authored slug whose dump name carries a stripped parenthetical", () => {
    // Death Guard authored "nurgles-gift"; the dump names it "Nurgle's Gift (Aura)".
    expect(byDir.get("death-guard")?.ruleConfirmed).toBe(true);
    expect(byDir.get("death-guard")?.ruleReview).toBeUndefined();
  });

  it("surfaces (never overwrites) a rule not among the faction's owned army rules", () => {
    const ba = byDir.get("blood-angels");
    expect(ba?.ruleFilled).toBeUndefined();
    expect(ba?.ruleReview?.authored).toBe("the-red-thirst");
    expect(ba?.ruleReview?.candidates).toContain("the-sons-of-sanguinius");
  });

  it("confirms a chapter's parent faction", () => {
    expect(byDir.get("black-templars")?.parentConfirmed).toBe(true);
  });

  it("ensures the localized common name is present in aliases (idempotent end-state)", () => {
    // Assert the end-state, not the per-run delta: whether this run adds it or a
    // prior --write already did, "Space Marines" must be an Adeptus Astartes alias.
    const added = byDir.get("adeptus-astartes")?.aliasesAdded ?? [];
    const record = JSON.parse(
      fs.readFileSync(path.join(CORE_DIR, "adeptus-astartes", "factions.json"), "utf8"),
    )[0] as { aliases?: string[] };
    expect(added.includes("Space Marines") || (record.aliases ?? []).includes("Space Marines")).toBe(true);
  });

  it("never stages a confirmed-only dir", () => {
    // adepta-sororitas confirms its rule with no fill/alias → nothing to write, ever.
    const sororitasStaged = report.staged.some((s) => s.path.includes("/adepta-sororitas/"));
    expect(sororitasStaged).toBe(false);
  });
});
