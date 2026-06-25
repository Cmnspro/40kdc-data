/**
 * Bridge from the threat matrix to the pairings sim: turn a scouted opponent
 * team (a `MatrixTeam` of light, BCP-loaded columns) into the `SimPlayer[]` the
 * pairings practice uses as its opposing side. Lets a captain rehearse the
 * *real* matchup instead of the random archetype roll `generateCpuTeam` deals.
 *
 * Pure (no DOM, no dataset lookups) so it's unit-testable. Legality is NOT
 * enforced here — the sim surfaces issues without blocking, matching the random
 * path; a real event roster is legal by construction anyway.
 */
import { DISPOSITIONS } from "../../../../_shared/matchup-grid.js";
import { effectiveDisposition, type MatrixDoc } from "../matrix/matrix-doc";
import type { MatrixTeam } from "../matrix/types";
import type { SimPlayer } from "./types";

/**
 * Map each opponent column to a sim card. `faction` → `factionId` (a column with
 * no faction goes neutral, exactly as `RosterSetup.asSimPlayer` treats a
 * factionless plan player); the disposition comes from the captain's matrix
 * override (or the parsed default), falling back to the first disposition when
 * still unknown so the team is always startable. Ids are the BCP player ids,
 * distinct from the plan's own player ids.
 */
export function matrixTeamToSimPlayers(team: MatrixTeam, doc: MatrixDoc): SimPlayer[] {
  return team.players.map((p, i) => ({
    id: p.id,
    name: p.name || `Opponent ${i + 1}`,
    factionId: p.faction ?? "",
    fd: effectiveDisposition(doc, p) ?? DISPOSITIONS[0],
  }));
}
