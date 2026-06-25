import { describe, it, expect } from "vitest";
import { parsePlayerRoster } from "../../../_shared/opponents";
import { atcData } from "./atc-data";
import { builderLink } from "./builder-link";
import { ds } from "./dataset";

describe("ATC 2026 snapshot", () => {
  it("loads the committed event with teams and players", () => {
    expect(atcData.teams.length).toBeGreaterThan(0);
    const players = atcData.teams.flatMap((t) => t.players);
    expect(players.length).toBe(248);
  });

  it("parses the overwhelming majority of lists and links the clean ones", () => {
    const players = atcData.teams.flatMap((t) => t.players);
    let ok = 0;
    let failed = 0;
    let linked = 0;
    for (const p of players) {
      const parsed = parsePlayerRoster(p, ds);
      if (!parsed) continue; // no list text
      if (parsed.ok) {
        ok++;
        if (builderLink(parsed.roster)) linked++;
      } else {
        failed++;
      }
    }
    // Diagnostic visibility when the dataset/registry drifts.
    // eslint-disable-next-line no-console
    console.log(`ATC parse: ${ok} ok, ${failed} failed, ${linked} earned a builder link`);

    expect(ok).toBeGreaterThan(200); // ~234 of 248 expected
    expect(linked).toBeGreaterThan(0); // the round-trip showcase must produce links
    expect(linked).toBeLessThanOrEqual(ok);
  });
});
