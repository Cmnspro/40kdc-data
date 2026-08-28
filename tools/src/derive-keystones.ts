/**
 * Derive measurement keystones for the Battlemaster Chapter Approved layouts.
 *
 * The 45 `bm-*` layouts ship exact geometry but no keystones, so a reference
 * card has no dimension callouts to print. This tool authors the selection the
 * schema stores (board edge → footprint vertex); the printed distance is always
 * derived by `keystoneMeasurements`, so nothing here can disagree with the
 * layout.
 *
 * Heuristic (the hand-authored KOTC colosseum idiom, generalized): each
 * terrain piece gets two keystones anchored to the SAME footprint vertex — the
 * vertex of the placed outline nearest the piece's nearest board corner (the
 * natural tape-measure target), measured to its nearest horizontal edge
 * (top/bottom) and its nearest vertical edge (left/right), in that order.
 *
 * `is_objective` pieces are included: in the Battlemaster data they are full
 * terrain composites that HOST an objective marker (the marker sits inside the
 * footprint), so a table crew places them by tape measure like any other
 * piece. Pieces that already carry authored keystones are never overwritten.
 *
 * The Battlemaster boards are 180°-rotationally symmetric, so the derivation
 * is validated by pairing: every terrain piece must have a twin whose centroid
 * reflects onto it, and the twins' derived distances must agree within 0.25″
 * (the same tolerance the layout intake's keystone-pairing check used) — both
 * halves of a printed card measure alike. Any violation fails the run.
 *
 * Usage: npx tsx tools/src/derive-keystones.ts [--write]
 * Dry run prints the per-layout summary; --write persists
 * data/core/terrain-layouts.json.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  resolveLayout,
  type Keystone,
  type ResolvedPiece,
  type TerrainLayout,
  type TerrainTemplate,
} from "./terrain/resolve.js";
import { keystoneMeasurements, BOARD_INCHES } from "./terrain/keystones.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const LAYOUTS_PATH = join(ROOT, "data", "core", "terrain-layouts.json");
const TEMPLATES_PATH = join(ROOT, "data", "core", "terrain-templates.json");

const PAIR_TOLERANCE_IN = 0.25;
const TWIN_CENTROID_TOLERANCE_IN = 0.5;

function centroid(rp: ResolvedPiece): { x: number; y: number } {
  let x = 0;
  let y = 0;
  for (const v of rp.vertices) {
    x += v.x;
    y += v.y;
  }
  return { x: x / rp.vertices.length, y: y / rp.vertices.length };
}

/** The two keystones for a placed piece: nearest-corner vertex, measured to
 * the nearest horizontal and vertical board edges (KOTC ordering). */
function deriveForPiece(rp: ResolvedPiece): Keystone[] {
  const c = centroid(rp);
  const corner = {
    x: c.x < BOARD_INCHES.width / 2 ? 0 : BOARD_INCHES.width,
    y: c.y < BOARD_INCHES.height / 2 ? 0 : BOARD_INCHES.height,
  };
  let index = 0;
  let best = Infinity;
  for (let i = 0; i < rp.vertices.length; i++) {
    const v = rp.vertices[i]!;
    const d = (v.x - corner.x) ** 2 + (v.y - corner.y) ** 2;
    if (d < best - 1e-9) {
      best = d;
      index = i;
    }
  }
  return [
    { edge: corner.y === 0 ? "top" : "bottom", ref: { kind: "vertex", index } },
    { edge: corner.x === 0 ? "left" : "right", ref: { kind: "vertex", index } },
  ];
}

/** Walk the resolver's emission contract: the resolved piece for each explicit
 * layout piece, skipping the composed features an unparented templated piece
 * emits after itself (mirrors `keystoneMeasurements`). */
function explicitResolved(
  layout: TerrainLayout,
  templates: TerrainTemplate[],
): ResolvedPiece[] {
  const resolved = resolveLayout(layout, templates);
  const byTemplate = new Map(templates.map((t) => [t.id, t] as const));
  const pieces = layout.pieces ?? [];
  const out: ResolvedPiece[] = [];
  let cursor = 0;
  for (const piece of pieces) {
    const rp = resolved[cursor];
    if (!rp) throw new Error(`${layout.id}: resolved emission shorter than layout.pieces`);
    out.push(rp);
    cursor += 1;
    if (!piece.parent_area_id && piece.template) {
      cursor += byTemplate.get(piece.template)?.features?.length ?? 0;
    }
  }
  return out;
}

/** Author keystones in place for every bare terrain piece of the `bm-*`
 * layouts. Returns the number of pieces authored. */
export function authorKeystones(
  layouts: TerrainLayout[],
  templates: TerrainTemplate[],
): number {
  let piecesAuthored = 0;
  for (const layout of layouts) {
    if (!layout.id.startsWith("bm-")) continue;
    const pieces = layout.pieces ?? [];
    const resolved = explicitResolved(layout, templates);
    for (let i = 0; i < pieces.length; i++) {
      const piece = pieces[i]!;
      if (piece.keystones && piece.keystones.length > 0) continue;
      piece.keystones = deriveForPiece(resolved[i]!);
      piecesAuthored += 1;
    }
  }
  return piecesAuthored;
}

/** Validate the 180°-pairing invariant on the `bm-*` layouts: every terrain
 * piece has a reflected twin, and the twins' derived distances agree within
 * {@link PAIR_TOLERANCE_IN} — both halves of a printed card measure alike.
 * Returns human-readable violations (empty when the invariant holds). */
export function keystonePairingViolations(
  layouts: TerrainLayout[],
  templates: TerrainTemplate[],
): string[] {
  const violations: string[] = [];
  for (const layout of layouts) {
    if (!layout.id.startsWith("bm-")) continue;
    const pieces = layout.pieces ?? [];
    const resolved = explicitResolved(layout, templates);
    const measured = keystoneMeasurements(layout, templates);
    const byPiece = new Map<number, number[]>();
    for (const m of measured) {
      const list = byPiece.get(m.piece_index) ?? [];
      list.push(m.distance);
      byPiece.set(m.piece_index, list);
    }
    const terrainIdx = pieces.map((_, i) => i);
    for (const i of terrainIdx) {
      const c = centroid(resolved[i]!);
      const reflected = { x: BOARD_INCHES.width - c.x, y: BOARD_INCHES.height - c.y };
      const twin = terrainIdx.find((j) => {
        const cj = centroid(resolved[j]!);
        return (
          Math.abs(cj.x - reflected.x) <= TWIN_CENTROID_TOLERANCE_IN &&
          Math.abs(cj.y - reflected.y) <= TWIN_CENTROID_TOLERANCE_IN
        );
      });
      if (twin === undefined) {
        violations.push(`${layout.id}: piece ${pieces[i]!.id ?? i} has no 180° twin`);
        continue;
      }
      // The twin's keystones anchor the reflected vertex to the opposite
      // edges, so the sorted distance pairs must match.
      const a = [...(byPiece.get(i) ?? [])].sort((x, y) => x - y);
      const b = [...(byPiece.get(twin) ?? [])].sort((x, y) => x - y);
      if (a.length !== 2 || b.length !== 2) {
        violations.push(`${layout.id}: piece ${pieces[i]!.id ?? i} expected 2 keystones`);
        continue;
      }
      for (let k = 0; k < 2; k++) {
        if (Math.abs(a[k]! - b[k]!) > PAIR_TOLERANCE_IN) {
          violations.push(
            `${layout.id}: pieces ${pieces[i]!.id ?? i}/${pieces[twin]!.id ?? twin} measure apart ` +
              `(${a[k]!.toFixed(3)}″ vs ${b[k]!.toFixed(3)}″)`,
          );
        }
      }
    }
  }
  return violations;
}

function main(): void {
  const write = process.argv.includes("--write");
  const layouts = JSON.parse(readFileSync(LAYOUTS_PATH, "utf8")) as TerrainLayout[];
  const templates = JSON.parse(readFileSync(TEMPLATES_PATH, "utf8")) as TerrainTemplate[];

  const piecesAuthored = authorKeystones(layouts, templates);
  const violations = keystonePairingViolations(layouts, templates);

  console.log(`pieces authored: ${piecesAuthored}`);
  if (violations.length > 0) {
    console.error(`\n${violations.length} pairing violations:`);
    for (const v of violations) console.error(`  ${v}`);
    process.exitCode = 1;
    return;
  }
  if (write) {
    writeFileSync(LAYOUTS_PATH, `${JSON.stringify(layouts, null, 2)}\n`);
    console.log(`wrote ${LAYOUTS_PATH}`);
  } else {
    console.log("dry run — pass --write to persist");
  }
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1].replace(/\\/g, "/")}`).href) {
  main();
}
