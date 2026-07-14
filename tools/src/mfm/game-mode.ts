/**
 * game-mode.ts — the game-mode axis for the MFM golden + ingest.
 *
 * A golden id belongs to exactly one game mode. Only `combat-patrol` is
 * auto-detectable from the dump (a Combat Patrol product carries
 * `publication.isCombatPatrol` — and detachments/enhancements mirror it on their
 * own `isCombatPatrol` flag); everything else is `matched-play`, the competitive
 * default. This mirrors the schema `game-mode-id` enum, restricted to the modes
 * the dump can distinguish, so the completeness golden can report competitive
 * coverage cleanly while tracking non-competitive content on its own dimension.
 *
 * The mode of an id is always derived in the SAME pass that derives the id (see
 * ingest-mfm.ts / stratagems.ts / wargear.ts inventories), so id and mode can
 * never drift apart.
 */
import type { MfmDump, PublicationRow } from "./loader.js";

/** The game modes the golden distinguishes. `matched-play` is competitive; the
 *  rest are non-competitive and tracked on their own coverage dimension. */
export type GoldenMode = "matched-play" | "combat-patrol";

/** The single competitive mode — the headline coverage denominator. */
export const COMPETITIVE_MODE: GoldenMode = "matched-play";

/** Non-competitive modes the golden reports coverage for, in stable order. Only
 *  combat-patrol has a dump signal today; boarding-actions/crusade are schema-homed
 *  for hand-authoring and gain a dimension here once a source exists. */
export const NON_COMPETITIVE_MODES: readonly GoldenMode[] = ["combat-patrol"];

/** Every mode the golden dimensions by, competitive first. */
export const GOLDEN_MODES: readonly GoldenMode[] = [COMPETITIVE_MODE, ...NON_COMPETITIVE_MODES];

/** True when a dump publication is a Combat Patrol product. */
export function isCombatPatrolPublication(
  dump: MfmDump,
  publicationId: string | undefined | null,
): boolean {
  if (!publicationId) return false;
  return dump.byId("publication").get(publicationId)?.isCombatPatrol === true;
}

/** The game mode a dump publication implies. */
export function modeOfPublication(
  dump: MfmDump,
  publicationId: string | undefined | null,
): GoldenMode {
  return isCombatPatrolPublication(dump, publicationId) ? "combat-patrol" : "matched-play";
}

/** Fold two modes for a shared id: matched-play always wins (an id reachable in
 *  competitive play is competitive, even if a Combat Patrol datasheet also uses it). */
export function mergeMode(a: GoldenMode | undefined, b: GoldenMode): GoldenMode {
  if (a === undefined) return b;
  return a === "matched-play" || b === "matched-play" ? "matched-play" : b;
}
