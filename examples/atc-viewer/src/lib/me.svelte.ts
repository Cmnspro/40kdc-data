/**
 * The author's own entry in the snapshot, and a one-shot "reveal me" signal.
 *
 * The Hero byline fires `reveal()`; App clears the search filter and the author's
 * own PlayerCard reacts (expand + scroll into view + brief highlight). Matching on
 * the stable player id rather than the display name keeps it robust to name
 * collisions in a 248-player field.
 */

/** Will Mitchell — World Eaters, team "SUPER. COOL. DUDES." */
export const OWN_PLAYER_ID = "fV8gG63AGc0e";

let token = $state(0);

/** Monotonic reveal counter — incrementing it re-fires the reveal reactions. */
export const reveal = {
  get token(): number {
    return token;
  },
  fire(): void {
    token++;
  },
};
