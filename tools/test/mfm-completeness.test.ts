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
 * Coverage is gated PER GAME MODE: competitive (matched-play) coverage is checked
 * against the matched-play gap allowlist, and each non-competitive mode
 * (combat-patrol, …) against its own. So Combat Patrol content that the repo has
 * not authored no longer inflates the competitive gap set — the headline
 * competitive coverage number is measured cleanly, while non-competitive content
 * is tracked on its own dimension.
 *
 * The per-mode + safety-net assertions give these semantics:
 *   - Delete a repo entity without regenerating the golden → its golden id is in
 *     neither repo nor gaps → RED (a real regression is caught).
 *   - A new MFM adds entities → regenerate the golden → the new ids are missing from
 *     repo & gaps → RED until the data is authored or the id is explicitly added to
 *     mfm-gaps.json ("test cases I break").
 *   - A gap closed by authoring the data → the now-covered id is still allowlisted →
 *     the "already resolved" assertion trips → forces an mfm-gaps.json regeneration.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import {
  repoIds,
  GOLDEN_CATEGORIES,
  GOLDEN_PATH,
  GAPS_PATH,
  idsForMode,
  type GoldenManifest,
} from "../src/mfm/golden.js";
import { GOLDEN_MODES } from "../src/mfm/game-mode.js";

const golden = JSON.parse(fs.readFileSync(GOLDEN_PATH, "utf8")) as GoldenManifest;
const gaps = JSON.parse(fs.readFileSync(GAPS_PATH, "utf8")) as GoldenManifest;

describe("MFM data completeness (golden vs repo)", () => {
  for (const category of GOLDEN_CATEGORIES) {
    describe(category, () => {
      const goldenScopes = golden.categories[category] ?? {};
      const gapScopes = gaps.categories[category] ?? {};
      const repo = repoIds(category);

      for (const mode of GOLDEN_MODES) {
        it(`${mode}: every golden id is covered by the repo or allowlisted in mfm-gaps.json`, () => {
          const missing: string[] = [];
          for (const scope of Object.keys(goldenScopes)) {
            const have = repo[scope] ?? new Set<string>();
            const allow = new Set(idsForMode(gaps, category, scope, mode));
            for (const id of idsForMode(golden, category, scope, mode)) {
              if (!have.has(id) && !allow.has(id)) missing.push(`${category}/${scope}/${id}`);
            }
          }
          expect(
            missing,
            `missing ${mode} golden ids (add the data, or allowlist in mfm-gaps.json):\n${missing.join("\n")}`,
          ).toEqual([]);
        });
      }

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
          `stale gap not in golden (regenerate mfm-gaps.json via just mfm-golden):\n${stale.join("\n")}`,
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
          `resolved gap still allowlisted (regenerate mfm-gaps.json via just mfm-golden):\n${resolved.join("\n")}`,
        ).toEqual([]);
      });
    });
  }

  it("every allowlisted gap id's mode matches the golden's mode for that id", () => {
    const mismatched: string[] = [];
    for (const [category, scopes] of Object.entries(gaps.modes ?? {})) {
      for (const [scope, byId] of Object.entries(scopes)) {
        const goldenScope = golden.modes[category]?.[scope] ?? {};
        for (const [id, mode] of Object.entries(byId)) {
          const goldenMode = goldenScope[id] ?? "matched-play";
          if (goldenMode !== mode) {
            mismatched.push(`${category}/${scope}/${id}: gaps=${mode} golden=${goldenMode}`);
          }
        }
      }
    }
    expect(
      mismatched,
      `gap/golden mode mismatch (regenerate mfm-gaps.json via just mfm-golden):\n${mismatched.join("\n")}`,
    ).toEqual([]);
  });
});
