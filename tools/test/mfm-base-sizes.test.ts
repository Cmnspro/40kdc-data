import { describe, it, expect, beforeAll } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { DEFAULT_DUMP_PATH, loadDump } from "../src/mfm/loader.js";
import { CORE_DIR } from "../src/mfm/repo-files.js";
import { parseBaseSize, baseSizeEqual, runBaseSizes } from "../src/mfm/base-sizes.js";

/**
 * WS7 base-size reconcile. The parser is the load-bearing piece — a strict
 * closed set that only accepts confident round/oval strings, so it can never
 * fabricate a base from a category or a per-model list. The dump-guarded
 * reconcile pins the end-state (non-draft authored disagreements are surfaced,
 * never overwritten — the dump has real 0.5-1mm oval rounding errors).
 */

describe("parseBaseSize (closed set)", () => {
  it("parses a clean round diameter, including a decimal", () => {
    expect(parseBaseSize("40mm")).toEqual({ shape: "round", diameter: 40 });
    expect(parseBaseSize("28.5mm")).toEqual({ shape: "round", diameter: 28.5 });
  });

  it("parses an oval with and without the 'Oval Base' suffix and spacing", () => {
    expect(parseBaseSize("120 x 92mm Oval Base")).toEqual({ shape: "oval", width: 120, length: 92 });
    expect(parseBaseSize("75x42mm")).toEqual({ shape: "oval", width: 75, length: 42 });
    expect(parseBaseSize("60x35.5mm Oval Base")).toEqual({ shape: "oval", width: 60, length: 35.5 });
  });

  it("skips categories, per-model/multi strings, and ambiguous ovals", () => {
    for (const raw of [
      "Hull",
      "Large Flying Base",
      "Small Flying Base",
      "Unique",
      "None",
      "25mm, 28.5mm", // comma multi
      "Sword Brother: 40mm\nInitiates: 32mm", // per-model
      "105mm oval", // ambiguous single-number oval
      "150mm Oval Base", // single-number oval
      "",
      null,
      undefined,
    ]) {
      expect(parseBaseSize(raw)).toBeNull();
    }
  });
});

describe("baseSizeEqual (dimensional, ignores draft)", () => {
  it("compares round by diameter and oval by width+length", () => {
    expect(baseSizeEqual({ shape: "round", diameter: 40, draft: true }, { shape: "round", diameter: 40 })).toBe(true);
    expect(baseSizeEqual({ shape: "round", diameter: 40 }, { shape: "round", diameter: 32 })).toBe(false);
    expect(baseSizeEqual({ shape: "oval", width: 120, length: 92 }, { shape: "oval", width: 120, length: 92 })).toBe(true);
    expect(baseSizeEqual({ shape: "oval", width: 120, length: 92 }, { shape: "oval", width: 120, length: 90 })).toBe(false);
    expect(baseSizeEqual({ shape: "round", diameter: 40 }, { shape: "oval", width: 40, length: 40 })).toBe(false);
    expect(baseSizeEqual(undefined, { shape: "round", diameter: 40 })).toBe(false);
  });
});

describe.skipIf(!fs.existsSync(DEFAULT_DUMP_PATH))("base-size reconcile over the real dump", () => {
  // Load the dump lazily in beforeAll — never in the describe body, which Vitest
  // executes at collection time regardless of skipIf, before the guard applies.
  let report: ReturnType<typeof runBaseSizes>;
  beforeAll(() => {
    report = runBaseSizes(loadDump());
  });

  it("is idempotent after apply — no fills/corrections remain, only stable reviews", () => {
    // The pass was already applied to the tree, so a fresh run confirms and
    // surfaces the same non-draft disagreements without writing.
    expect(report.filled).toEqual([]);
    expect(report.corrected).toEqual([]);
    expect(report.staged).toEqual([]);
    expect(report.confirmed).toBeGreaterThan(700);
  });

  it("surfaces (never overwrites) a non-draft authored value the dump contradicts", () => {
    // Yvraine: authored oval 75x42 is the correct GW base; the dump rounds to 74x42.
    const yvraine = report.review.find((r) => r.id === "yvraine");
    expect(yvraine).toBeTruthy();
    const rec = JSON.parse(
      fs.readFileSync(path.join(CORE_DIR, "aeldari", "units.json"), "utf8"),
    ).find((u: { id: string }) => u.id === "yvraine") as { base_size_mm: { width: number; length: number } };
    expect(rec.base_size_mm).toMatchObject({ width: 75, length: 42 }); // authored value untouched
  });

  it("corrected the draft Vyper flying-base to the dump's authoritative oval", () => {
    const rec = JSON.parse(
      fs.readFileSync(path.join(CORE_DIR, "aeldari", "units.json"), "utf8"),
    ).find((u: { id: string }) => u.id === "vyper") as { base_size_mm: Record<string, unknown> };
    expect(rec.base_size_mm).toEqual({ shape: "oval", width: 105, length: 70 });
  });
});
