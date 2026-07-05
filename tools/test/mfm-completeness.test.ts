/**
 * mfm-completeness.test.ts — the committed data-completeness gate.
 *
 * Turns "the repo no longer mirrors the live MFM" into a red build. It compares the
 * repo against two COMMITTED audit artifacts (regenerated locally via `just mfm-golden`
 * when a new MFM lands): `data/_audit/mfm-golden.json` (the authoritative dump
 * inventory) and `data/_audit/mfm-gaps.json` (the accepted-gap allowlist).
 *
 * CI-SAFE by construction: it reads only the committed golden/gaps + `data/core/`
 * through `repoIds`. It NEVER imports `loadDump` or touches the gitignored
 * `_private/dump.json`, so it runs in CI where the dump is absent. (The golden/gaps
 * artifacts themselves are hand-regenerated and are deliberately NOT part of
 * `just verify-clean` — CI cannot reproduce them without the dump.)
 *
 * The three assertions per category/scope give these semantics:
 *   - Delete a repo entity without regenerating the golden → its golden id is in
 *     neither repo nor gaps → RED (a real regression is caught).
 *   - A new MFM adds entities → regenerate the golden → the new ids are missing from
 *     repo & gaps → RED until the data is authored or the id is explicitly added to
 *     mfm-gaps.json ("test cases I break").
 *   - A gap closed by authoring the data → the now-covered id is still allowlisted →
 *     assertion 3 trips → forces an mfm-gaps.json regeneration, keeping it truthful.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import {
  repoIds,
  GOLDEN_CATEGORIES,
  GOLDEN_PATH,
  GAPS_PATH,
  type GoldenManifest,
} from "../src/mfm/golden.js";

const golden = JSON.parse(fs.readFileSync(GOLDEN_PATH, "utf8")) as GoldenManifest;
const gaps = JSON.parse(fs.readFileSync(GAPS_PATH, "utf8")) as GoldenManifest;

describe("MFM data completeness (golden vs repo)", () => {
  for (const category of GOLDEN_CATEGORIES) {
    describe(category, () => {
      const goldenScopes = golden.categories[category] ?? {};
      const gapScopes = gaps.categories[category] ?? {};
      const repo = repoIds(category);

      it("every golden id is covered by the repo or allowlisted in mfm-gaps.json", () => {
        const missing: string[] = [];
        for (const [scope, ids] of Object.entries(goldenScopes)) {
          const have = repo[scope] ?? new Set<string>();
          const allow = new Set(gapScopes[scope] ?? []);
          for (const id of ids) {
            if (!have.has(id) && !allow.has(id)) missing.push(`${category}/${scope}/${id}`);
          }
        }
        expect(
          missing,
          `missing golden ids (add the data, or allowlist in mfm-gaps.json):\n${missing.join("\n")}`
        ).toEqual([]);
      });

      it("no allowlisted gap is stale (every gap id is still in the golden)", () => {
        const stale: string[] = [];
        for (const [scope, ids] of Object.entries(gapScopes)) {
          const inGolden = new Set(goldenScopes[scope] ?? []);
          for (const id of ids) {
            if (!inGolden.has(id)) stale.push(`${category}/${scope}/${id}`);
          }
        }
        expect(
          stale,
          `stale gap not in golden (regenerate mfm-gaps.json via just mfm-golden):\n${stale.join("\n")}`
        ).toEqual([]);
      });

      it("no allowlisted gap is already resolved by the repo", () => {
        const resolved: string[] = [];
        for (const [scope, ids] of Object.entries(gapScopes)) {
          const have = repo[scope] ?? new Set<string>();
          for (const id of ids) {
            if (have.has(id)) resolved.push(`${category}/${scope}/${id}`);
          }
        }
        expect(
          resolved,
          `resolved gap still allowlisted (regenerate mfm-gaps.json via just mfm-golden):\n${resolved.join("\n")}`
        ).toEqual([]);
      });
    });
  }
});
