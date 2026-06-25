/**
 * Opponent-list ingest — shared by the example apps that consume an event
 * pull (teams-planner's prep flow, atc-viewer's public browser).
 *
 * The data is a sanitized JSON of the shape `{ event, teams: [{ id, name,
 * players: [{ id, name, faction, armyListText }] }] }` (teams-planner pulls it
 * live via its event-fetch script; atc-viewer ships a committed snapshot).
 *
 * `armyListText` wraps a standard GW-app list in a `++++` header preamble
 * (Player/Team/Factions/Disposition/Detachment). Parsing the raw text misfires
 * (the header lines look like a detachment + a phantom unit), so we split the
 * header off: its fields are a clean structured source (esp. the chosen
 * Disposition, which the GW body parse drops), and the body alone feeds
 * `tryImportRoster` cleanly.
 */
import {
  tryImportRoster,
  type Dataset,
  type ForceDispositionId,
  type ImportResult,
} from "@alpaca-software/40kdc-data";

export interface OpponentPlayer {
  id: string;
  name: string;
  faction: string | null;
  armyListText: string | null;
}

export interface OpponentTeam {
  id: string;
  name: string;
  players: OpponentPlayer[];
}

export interface OpponentData {
  event: { id: string; name: string | null; teamEvent: boolean };
  teams: OpponentTeam[];
}

/** Validate a parsed event-pull JSON into OpponentData, or null if it isn't one. */
export function loadOpponents(json: unknown): OpponentData | null {
  if (typeof json !== "object" || json === null) return null;
  const obj = json as Record<string, unknown>;
  if (!Array.isArray(obj.teams)) return null;
  const ev = (obj.event ?? {}) as Record<string, unknown>;
  const teams: OpponentTeam[] = [];
  for (const t of obj.teams) {
    if (typeof t !== "object" || t === null) continue;
    const tt = t as Record<string, unknown>;
    if (!Array.isArray(tt.players)) continue;
    const players: OpponentPlayer[] = [];
    for (const p of tt.players) {
      if (typeof p !== "object" || p === null) continue;
      const pp = p as Record<string, unknown>;
      players.push({
        id: String(pp.id ?? `${tt.id}-${players.length}`),
        name: typeof pp.name === "string" ? pp.name : "—",
        faction: typeof pp.faction === "string" ? pp.faction : null,
        armyListText: typeof pp.armyListText === "string" ? pp.armyListText : null,
      });
    }
    teams.push({
      id: String(tt.id ?? teams.length),
      name: typeof tt.name === "string" ? tt.name : "—",
      players,
    });
  }
  if (teams.length === 0) return null;
  return {
    event: {
      id: String(ev.id ?? ""),
      name: typeof ev.name === "string" ? ev.name : null,
      teamEvent: ev.teamEvent !== false,
    },
    teams,
  };
}

const PLUS_LINE = /^\++\s*$/;

/** The parsed key→value fields of a `++++` header block (lowercased keys). */
export type BcpHeader = Record<string, string>;

/**
 * Split `armyListText` into the header field map and the GW-format body.
 * If no `++++…++++` header is present, the whole text is the body and the
 * header is empty.
 */
export function splitBcpList(armyListText: string): { header: BcpHeader; body: string } {
  const lines = armyListText.split(/\r?\n/);
  const fences: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (PLUS_LINE.test(lines[i]) && lines[i].trim().length >= 10) fences.push(i);
    if (fences.length === 2) break;
  }
  if (fences.length < 2) return { header: {}, body: armyListText };

  const header: BcpHeader = {};
  for (let i = fences[0] + 1; i < fences[1]; i++) {
    const m = lines[i].match(/^([^:]+):\s*(.*)$/);
    if (m) header[m[1].trim().toLowerCase()] = m[2].trim();
  }
  const body = lines.slice(fences[1] + 1).join("\n").trim();
  return { header, body };
}

const DISPOSITION_IDS: ForceDispositionId[] = [
  "take-and-hold",
  "disruption",
  "purge-the-foe",
  "priority-assets",
  "reconnaissance",
];

/** Normalize a prose disposition ("purge the foe", "Priority Assets") to its id. */
export function dispositionId(prose: string | undefined | null): ForceDispositionId | null {
  if (!prose) return null;
  const slug = prose.trim().toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "");
  return DISPOSITION_IDS.find((id) => slug === id || slug.startsWith(id)) ?? null;
}

/**
 * Parse a player's list for review. Strips the event-export header first (see module
 * doc) and runs the body through the auto-detecting importer. Returns null when
 * the player has no text list (e.g. an image-only submission). The dataset is
 * injected so this module stays app-agnostic (each app passes its own
 * `Dataset.embedded()` singleton).
 */
export function parsePlayerRoster(player: OpponentPlayer, dataset: Dataset): ImportResult | null {
  if (!player.armyListText || !player.armyListText.trim()) return null;
  const { body } = splitBcpList(player.armyListText);
  return tryImportRoster(body || player.armyListText, { dataset });
}
