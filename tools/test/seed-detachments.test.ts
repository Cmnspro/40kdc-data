import { describe, it, expect } from "vitest";
import * as fs from "fs";
import { DEFAULT_DUMP_PATH, loadDump } from "../src/mfm/loader.js";
import {
  collectCombatPatrolDetachments,
  runSeedDetachments,
  type CandidateDet,
} from "../src/mfm/seed-detachments.js";
import { repoDirs } from "../src/mfm/faction-map.js";

// Integration over the real dump — only when _private/dump.json is present (it is
// gitignored, so CI without it skips this). Guards both the pure dump→entity
// derivation and the committed end-state: every Combat-Patrol detachment the dump
// defines is authored (one per faction) with dump-derived DP + disposition and
// cost-0 enhancements, and a re-run is idempotent.
describe.skipIf(!fs.existsSync(DEFAULT_DUMP_PATH))("seed-detachments over the real dump", () => {
  const collect = (): CandidateDet[] => collectCombatPatrolDetachments(loadDump());

  it("derives one CP detachment per faction with a valid DP, disposition, and dir", () => {
    const candidates = collect();
    // 24 Combat-Patrol boxes: the 23 non-WE factions plus the World Eaters pilot.
    expect(candidates).toHaveLength(24);
    const dirs = repoDirs();
    for (const c of candidates) {
      expect(dirs.has(c.dir), `${c.id} → unknown dir ${c.dir}`).toBe(true);
      expect(Number.isInteger(c.dp) && c.dp >= 1, `${c.id} dp=${c.dp}`).toBe(true);
      expect(c.disposition.length, `${c.id} has no disposition`).toBeGreaterThan(0);
    }
  });

  it("authors every CP enhancement at cost 0, unique, combat-patrol, scoped to its detachment", () => {
    const candidates = collect();
    const allEnh = candidates.flatMap((c) => c.enhancements);
    // 47 CP enhancements across the 24 boxes (Orks carry only one).
    expect(allEnh).toHaveLength(47);
    for (const c of candidates) {
      for (const e of c.enhancements) {
        expect(e.cost, `${e.id} cost`).toBe(0);
        expect(e.is_unique).toBe(true);
        expect(e.points_provisional).toBe(false);
        expect(e.game_modes).toEqual(["combat-patrol"]);
        expect(e.detachment_id, `${e.id} detachment_id`).toBe(c.id);
      }
    }
  });

  it("reproduces the World Eaters frenzied-reavers pilot exactly", () => {
    const byId = new Map(collect().map((c) => [c.id, c]));
    const fr = byId.get("frenzied-reavers");
    expect(fr).toBeDefined();
    expect(fr!.dp).toBe(1);
    expect(fr!.disposition).toBe("purge-the-foe");
    expect(fr!.enhancements.map((e) => e.id).sort()).toEqual([
      "bane-of-the-craven-frenzied-reavers",
      "fearsome-presence-frenzied-reavers",
    ]);
  });

  it("derives a non-WE detachment (Sanctuary Guardians) from the dump", () => {
    const byId = new Map(collect().map((c) => [c.id, c]));
    const sg = byId.get("sanctuary-guardians");
    expect(sg).toBeDefined();
    expect(sg!.dir).toBe("adepta-sororitas");
    expect(sg!.dp).toBe(1);
    expect(sg!.disposition).toBe("take-and-hold");
    expect(sg!.enhancements.map((e) => e.id)).toContain("divine-miracle-sanctuary-guardians");
  });

  it("is idempotent once seeded — a --write re-run creates nothing", () => {
    const r = runSeedDetachments(loadDump(), { includeCombatPatrol: true });
    const dets = r.dirs.reduce((a, d) => a + d.createdDetachments.length, 0);
    const enhs = r.dirs.reduce((a, d) => a + d.createdEnhancements.length, 0);
    // Every dump CP detachment already lives in the repo, so nothing is created.
    expect({ dets, enhs }).toEqual({ dets: 0, enhs: 0 });
  });
});
