/**
 * Threat-matrix vocabulary. The matrix is a **matchup grid**: OUR team's players
 * (rows) × the selected opposing team's players (columns). Each cell holds a
 * single matchup verdict — Good / So-so / Bad — the captain's read on how that
 * one of our players fares into that one opponent, before the structured pairing
 * dance the Pairings-practice tab simulates.
 *
 * "So-so" is the default and is stored *implicitly*: an absent cell reads as
 * soso (yellow), so only explicit good/bad verdicts ride the synced doc.
 */
import type { ForceDispositionId } from "@alpaca-software/40kdc-data";

/** A cell's *stored* verdict. The third state, "so-so" (yellow), is the absence
 *  of an entry in `cellsById` — see {@link nextVerdict}. */
export type Verdict = "good" | "bad";

/** Cell colors: good=green (success), so-so=amber (warning), bad=red (danger).
 *  Hardcoded rather than CSS vars so they work in inline `style` on the buttons,
 *  matching the existing token values in `src/app.css`. */
export const VERDICT_HUE = {
  good: "#22c55e",
  soso: "#f59e0b",
  bad: "#ef4444",
} as const;

/**
 * Triple-toggle order: soso (null) → good → bad → soso. `null` is the so-so
 * default, so cycling off "bad" returns to an unset (yellow) cell.
 */
export function nextVerdict(current: Verdict | null): Verdict | null {
  if (current === null) return "good";
  if (current === "good") return "bad";
  return null;
}

/** A light OUR-team row carried in the synced doc — a snapshot of a plan player
 *  (its stable `Player.id` is reused so cells key off it). */
export interface MatrixOurPlayer {
  id: string;
  name: string;
  /** Faction ids the player may bring (snapshot of the plan's `factionIds`). */
  factionIds: string[];
}

/** A light opponent column carried in the synced doc (no list text — that stays
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
