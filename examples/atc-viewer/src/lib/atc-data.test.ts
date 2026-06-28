import { describe, it, expect } from "vitest";
import { parsePlayerRoster, type OpponentData } from "../../../_shared/opponents";
import { atcByVariant, ATC_VARIANTS } from "./atc-data";
import { builderLink } from "./builder-link";
import { ds } from "./dataset";

describe("ATC snapshots", () => {
  for (const variant of ATC_VARIANTS) {
    const data: OpponentData = atcByVariant[variant];

    it(`${variant}: loads the committed event with teams and players`, () => {
      expect(data.teams.length).toBeGreaterThan(0);
      const players = data.teams.flatMap((t) => t.players);
      expect(players.length).toBeGreaterThan(0);
    });

    it(`${variant}: carries final team standings (concluded event)`, () => {
      const placed = data.teams.filter((t) => t.standing);
      expect(placed.length).toBeGreaterThan(0);
      // Placings are a 1..N sequence — the winner is present.
      expect(Math.min(...placed.map((t) => t.standing!.placing))).toBe(1);
    });

    it(`${variant}: parses the majority of lists and links the clean ones`, () => {
      const players = data.teams.flatMap((t) => t.players);
      let ok = 0;
      let failed = 0;
      let linked = 0;
      let withList = 0;
      for (const p of players) {
        const parsed = parsePlayerRoster(p, ds);
        if (!parsed) continue; // no list text
        withList++;
        if (parsed.ok) {
          ok++;
          if (builderLink(parsed.roster)) linked++;
        } else {
          failed++;
        }
      }
      // Diagnostic visibility when the dataset/registry drifts.
      // eslint-disable-next-line no-console
      console.log(`ATC ${variant} parse: ${ok} ok, ${failed} failed, ${linked} earned a builder link`);

      expect(ok).toBeGreaterThan(withList * 0.8); // ~95% parse in practice
      expect(linked).toBeGreaterThan(0); // the round-trip showcase must produce links
      expect(linked).toBeLessThanOrEqual(ok);
    });
  }
});
