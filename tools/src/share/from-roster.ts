/**
 * Bridge an imported {@link Roster} to a {@link ShareList} for share-token
 * encoding.
 *
 * `tryImportRoster` yields a lossless {@link Roster} whose refs may be
 * unresolved (`id === null`) and whose resolved ids may still predate the
 * embedded share registry. {@link encodeShareList}, by contrast, throws on any
 * id it can't index. {@link rosterToShareList} is the best-effort adapter
 * between them: it emits a {@link ShareList} carrying only resolved,
 * registry-known ids, dropping anything the token can't represent.
 *
 * It never throws. Callers decide what a partial mapping means: compare
 * `result.units.length` to `roster.units.length` to detect dropped units, then
 * encode inside a try/catch (a resolved id absent from the registry still
 * throws at encode time) — a list earns a share link only when it maps and
 * encodes in full.
 */
import type { Roster, RosterUnit } from "../import/types.js";
import type { ShareList, ShareLoadoutEntry, ShareUnit } from "./codec.js";
import type { ShareRegistryIndex } from "./registry.js";

/** A bodyguard match key: prefer the resolved id, fall back to the raw name. */
function unitKey(u: RosterUnit): string {
  return u.ref.id ?? u.ref.raw_name;
}

/**
 * Convert a {@link Roster} to a {@link ShareList}, keeping only the ids the
 * given registry knows. Units whose datasheet is unresolved or unknown to the
 * registry are dropped; `attachedToOrdinal` indexes into the *emitted* units.
 */
export function rosterToShareList(roster: Roster, registry: ShareRegistryIndex): ShareList {
  const known = (kind: Parameters<ShareRegistryIndex["index"]>[0], id: string | null): boolean =>
    id !== null && registry.index(kind, id) !== undefined;

  // The units that survive into the token, in roster order. Everything below
  // indexes against this list — never `roster.units` — so a dropped unit can't
  // shift a leader's `attachedToOrdinal`.
  const emitted = roster.units.filter((u) => known("unit", u.ref.id));
  const ordinalByKey = new Map<string, number>();
  emitted.forEach((u, i) => {
    const k = unitKey(u);
    if (!ordinalByKey.has(k)) ordinalByKey.set(k, i);
  });

  const units: ShareUnit[] = emitted.map((u) => {
    const loadout: ShareLoadoutEntry[] = u.wargear
      .filter((w) => known("wargear", w.ref.id))
      .map((w) => [w.ref.id as string, w.count]);

    const la = u.leader_attachment;
    const attachedToOrdinal = la
      ? (ordinalByKey.get(la.bodyguard_ref.id ?? la.bodyguard_ref.raw_name) ?? null)
      : null;

    return {
      datasheetId: u.ref.id as string,
      modelCount: u.model_count,
      isWarlord: u.is_warlord,
      enhancementId: known("enhancement", u.enhancement?.id ?? null)
        ? (u.enhancement?.id as string)
        : null,
      // The importer doesn't track allied sourcing or detachment-keyword grants.
      allyFactionId: null,
      allyRuleId: null,
      attachedToOrdinal,
      grants: [],
      loadout,
    };
  });

  return {
    name: roster.name,
    factionId: known("faction", roster.faction_id) ? roster.faction_id : null,
    detachmentIds: roster.detachments
      .map((d) => d.ref.id)
      .filter((id): id is string => known("detachment", id)),
    // The codec defaults an absent battle size to strike-force; ATC lists are
    // strike-force, so a null import (the source didn't encode one) maps there.
    battleSize: roster.battle_size ?? "strike-force",
    disposition: known("disposition", roster.force_disposition) ? roster.force_disposition : null,
    units,
  };
}
