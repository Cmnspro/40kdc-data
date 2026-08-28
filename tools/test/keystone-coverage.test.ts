import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type { TerrainLayout, TerrainTemplate } from "../src/terrain/resolve.js";
import { BOARD_INCHES, keystoneMeasurements } from "../src/terrain/keystones.js";
import { authorKeystones, keystonePairingViolations } from "../src/derive-keystones.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const layouts = JSON.parse(
  readFileSync(join(ROOT, "data", "core", "terrain-layouts.json"), "utf8"),
) as TerrainLayout[];
const templates = JSON.parse(
  readFileSync(join(ROOT, "data", "core", "terrain-templates.json"), "utf8"),
) as TerrainTemplate[];

interface Piece {
  id?: string;
  is_objective?: boolean;
  keystones?: unknown[];
}

const bmLayouts = layouts.filter((l) => l.id.startsWith("bm-"));

describe("Battlemaster layout keystone coverage", () => {
  it("covers all 45 layouts", () => {
    expect(bmLayouts).toHaveLength(45);
  });

  it("gives every terrain piece exactly two keystones and objectives none", () => {
    for (const layout of bmLayouts) {
      for (const piece of (layout.pieces ?? []) as Piece[]) {
        if (piece.is_objective === true) {
          expect(piece.keystones, `${layout.id}/${piece.id}`).toBeUndefined();
        } else {
          expect(piece.keystones, `${layout.id}/${piece.id}`).toHaveLength(2);
        }
      }
    }
  });

  it("derives an on-board distance for every keystone", () => {
    for (const layout of bmLayouts) {
      const measured = keystoneMeasurements(layout, templates);
      const terrain = ((layout.pieces ?? []) as Piece[]).filter(
        (p) => p.is_objective !== true,
      );
      expect(measured, layout.id).toHaveLength(terrain.length * 2);
      for (const m of measured) {
        const extent =
          m.edge === "left" || m.edge === "right"
            ? BOARD_INCHES.width
            : BOARD_INCHES.height;
        expect(m.distance, `${layout.id}/${m.piece_id}/${m.edge}`).toBeGreaterThanOrEqual(0);
        expect(m.distance, `${layout.id}/${m.piece_id}/${m.edge}`).toBeLessThanOrEqual(extent);
      }
    }
  });

  it("measures 180°-twin pieces alike (both card halves print the same numbers)", () => {
    expect(keystonePairingViolations(layouts, templates)).toEqual([]);
  });

  it("is a fixed point of the derivation (regenerating authors nothing new)", () => {
    const copy = JSON.parse(JSON.stringify(layouts)) as TerrainLayout[];
    expect(authorKeystones(copy, templates)).toBe(0);
  });
});
