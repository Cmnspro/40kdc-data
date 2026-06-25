/**
 * Threat-matrix vocabulary. A matrix is, per opposing team, a table of THEIR
 * players (rows) × configurable threat/priority axes (columns) — a triage tool
 * for "who do we most want to kill / avoid / answer" before the structured
 * pairing dance the Pairings-practice tab simulates.
 *
 * Axes are editable and synced, so the default set below is only a starting
 * point the captain can rename / add to / drop around the TV.
 */
import type { ForceDispositionId } from "@alpaca-software/40kdc-data";

/** How a cell under an axis is entered (and therefore rendered + colored). */
export type AxisKind = "rating" | "tier" | "flag" | "text";

export interface ThreatAxis {
  id: string;
  label: string;
  kind: AxisKind;
}

/** A cell's stored value. Shape follows the axis kind:
 *   rating → 0..3 (number)   tier → "low"|"med"|"high"   flag → boolean   text → string
 *  An unset cell has no entry in `cellsById` (reads as null). */
export type CellValue = number | string | boolean | null;

/** Ordered tier levels for `tier` axes (index = severity). */
export const TIER_VALUES = ["low", "med", "high"] as const;
export type TierValue = (typeof TIER_VALUES)[number];

/** Max stars for a `rating` axis. */
export const RATING_MAX = 3;

/** The starting axis set — mirrors the captain's usual triage columns. */
export const DEFAULT_AXES: ThreatAxis[] = [
  { id: "kill-priority", label: "Kill priority", kind: "rating" },
  { id: "threat", label: "Threat", kind: "tier" },
  { id: "avoid", label: "Avoid", kind: "flag" },
  { id: "notes", label: "Notes", kind: "text" },
];

/** A light opponent row carried in the synced doc (no list text — that stays
 *  local). `disposition` is the chosen Force Disposition id when known. */
export interface MatrixPlayer {
  id: string;
  name: string;
  faction: string | null;
  disposition: ForceDispositionId | null;
}

export interface MatrixTeam {
  id: string;
  name: string;
  players: MatrixPlayer[];
}
