/**
 * Bridge helpers between the importer's flat-data {@link Roster} types and
 * the linked {@link UnitView} the cruncher consumes. The importer ships
 * unit entries as plain interfaces (`RosterUnit` is data, not behaviour),
 * so the lookup is a free function rather than a method.
 *
 * @packageDocumentation
 */
import type { Roster, RosterDetachment, RosterUnit, RosterWargear } from "../import/types.js";
import type { Dataset } from "./dataset.js";
import type { UnitView, WeaponView } from "./entities.js";
import { validateLoadout, type Violation } from "./loadout.js";

/**
 * Resolve a roster's unit entry against the dataset, returning the linked
 * {@link UnitView}. Returns `undefined` when:
 *   - the roster's `ref.id` is `null` (the importer couldn't match the unit), or
 *   - the id doesn't appear in the dataset (e.g. the roster was authored
 *     against an older dataslate than the bundled one).
 *
 * Doesn't surface diagnostics — the caller already has them on the roster's
 * own `diagnostics` field.
 */
export function resolveRosterUnit(
  rosterUnit: RosterUnit,
  dataset: Dataset,
  factionId?: string | null,
): UnitView | undefined {
  const id = rosterUnit.ref.id;
  if (id === null) return undefined;
  // A shared chassis (e.g. `chaos-terminators` in World Eaters *and* Emperors
  // Children) genuinely diverges per faction — different points, options, and
  // composition — so resolve the roster's own faction copy when known. Fall back
  // to first-wins `getAny` (which opts out of the units guard) when the roster
  // carries no faction or the faction has no copy of this id.
  if (factionId) {
    const scoped = dataset.units.getInFaction(id, factionId);
    if (scoped) return scoped;
  }
  return dataset.units.getAny(id);
}

/**
 * Resolve every wargear entry on a roster unit to a {@link WeaponView},
 * keeping each entry's count alongside. Unresolved entries are dropped
 * silently (matching {@link resolveRosterUnit}). Useful when the SPA
 * needs to enumerate firing options after the user picks a roster unit.
 */
export function resolveRosterWargear(
  wargear: RosterWargear[],
  dataset: Dataset,
): { weapon: WeaponView; count: number }[] {
  const out: { weapon: WeaponView; count: number }[] = [];
  for (const w of wargear) {
    const id = w.ref.id;
    if (id === null) continue;
    const weapon = dataset.weapons.get(id);
    if (!weapon) continue;
    out.push({ weapon, count: w.count });
  }
  return out;
}

/** The loadout-legality verdict for one resolved roster unit. */
export interface UnitLegality {
  /** Resolved unit id. */
  unitId: string;
  /** The unit's position in `roster.units` (source order). */
  unitIndex: number;
  /** Model count the loadout was checked against. */
  modelCount: number;
  /** Every count/swap rule the unit's loadout breaks; empty when legal. */
  violations: Violation[];
}

/**
 * Check every resolved unit in a roster for loadout legality — the building
 * block for a "is this list legal" report (e.g. a tournament-organiser check).
 *
 * For each unit it resolves the unit, its authored wargear options and its
 * unit-composition models the same way the loadout conformance surface does
 * ({@link resolveRosterUnit} → {@link Dataset.wargearOptionsOf} →
 * `unitCompositions` by `unit_id`), sums the roster's per-weapon counts, and
 * runs {@link validateLoadout}. The check is non-destructive and never alters
 * the roster: an illegal list still imports, it just reports violations — so a
 * TO can load a player's list verbatim and see exactly what's wrong rather than
 * have counts silently clamped or the import rejected.
 *
 * Returns one {@link UnitLegality} per **resolved** unit, in source order, with
 * an empty `violations` array when the unit is legal (the entries double as a
 * record of what was checked). Units the importer couldn't resolve (`ref.id`
 * null, or an id absent from the dataset) are skipped — they're already flagged
 * on the roster's `diagnostics`, and there's no datasheet to check them against.
 * A roster is fully legal iff every entry's `violations` is empty **and** the
 * roster reports no unresolved units.
 */
export function checkRosterLegality(roster: Roster, dataset: Dataset): UnitLegality[] {
  const out: UnitLegality[] = [];
  roster.units.forEach((rosterUnit, unitIndex) => {
    const view = resolveRosterUnit(rosterUnit, dataset, roster.faction_id);
    if (!view) return;
    // Options and composition are faction-scoped off the resolved unit's own
    // faction, so a shared chassis is checked against the right faction's rules.
    const options = dataset.wargearOptionsOf(view.raw);
    const composition = dataset.unitCompositionOf(view.raw);
    const counts = new Map<string, number>();
    for (const w of rosterUnit.wargear) {
      const id = w.ref.id;
      if (id === null) continue;
      counts.set(id, (counts.get(id) ?? 0) + w.count);
    }
    out.push({
      unitId: view.id,
      unitIndex,
      modelCount: rosterUnit.model_count,
      violations: validateLoadout(view.raw, rosterUnit.model_count, options, counts, composition?.models),
    });
  });
  return out;
}

/**
 * The roster's leader entry attached to `bodyguardUnitId`, if any. Import
 * stores the inferred (always-provisional) attachment on the *leader's*
 * {@link RosterUnit}, pointing down to its bodyguard via
 * `leader_attachment.bodyguard_ref`. Selection UIs start from the body unit,
 * so this scans for the leader whose `bodyguard_ref.id` matches. Returns
 * `undefined` when no leader in the roster is attached to that unit (the
 * common case — attachments are optional at game start).
 */
export function resolveAttachedLeader(
  roster: Roster,
  bodyguardUnitId: string,
): RosterUnit | undefined {
  return roster.units.find(
    (u) => u.leader_attachment?.bodyguard_ref.id === bodyguardUnitId,
  );
}

/**
 * Every roster unit attached to `unitId`, resolved from *either* end of the
 * attachment. A leader+bodyguard are one combined unit, so a selection UI may
 * start from either half:
 *   - `unitId` is the **bodyguard** → the leader(s) whose
 *     `leader_attachment.bodyguard_ref.id` points at it (body-first, the
 *     {@link resolveAttachedLeader} direction), and
 *   - `unitId` is the **leader** → the bodyguard its own `leader_attachment`
 *     points to.
 * Returns the partner {@link RosterUnit}s (deduped, source order). Empty when
 * the unit has no attachment in this roster — the common case, since
 * attachments are optional at game start. Shaped as a list to carry 11th
 * edition's multi-member attachments without an API change.
 */
export function resolveAttachmentPartners(
  roster: Roster,
  unitId: string,
): RosterUnit[] {
  const seen = new Set<RosterUnit>();
  const out: RosterUnit[] = [];
  const add = (u: RosterUnit | undefined) => {
    if (!u || seen.has(u)) return;
    seen.add(u);
    out.push(u);
  };

  for (const u of roster.units) {
    // Body-first: leaders pointing down at `unitId`.
    if (u.leader_attachment?.bodyguard_ref.id === unitId) add(u);
    // Leader-first: `unitId`'s own entry points down at a bodyguard.
    if (u.ref.id === unitId && u.leader_attachment) {
      add(roster.units.find((b) => b.ref.id === u.leader_attachment!.bodyguard_ref.id));
    }
  }
  return out;
}

/**
 * The roster's **primary detachment** — the first in source order. 11th
 * edition rosters may field several detachments under a detachment-point cap,
 * but single-detachment consumers (and every pre-11e list) just want "the"
 * detachment. This names that choice so callers stop reaching into
 * `detachments[0]` directly. Returns `undefined` only when the roster carries
 * no detachment at all (the source declared none, or none parsed).
 */
export function primaryDetachment(roster: Roster): RosterDetachment | undefined {
  return roster.detachments[0];
}

/**
 * The resolved entity id of the {@link primaryDetachment}. `null` when the
 * roster carries no detachment, or when the primary one failed to resolve to a
 * known id (the raw name is still retained on the detachment's `ref`).
 */
export function primaryDetachmentId(roster: Roster): string | null {
  return roster.detachments[0]?.ref.id ?? null;
}
