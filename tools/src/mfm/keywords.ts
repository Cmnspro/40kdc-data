/**
 * keywords.ts — WS0 shared foundation: resolve GW MFM dump keyword ids to the
 * repository keyword *label* (the Title-Case display string the repo stores in
 * `keyword_restrictions`, `exclusion_keywords`, detachment `tags`,
 * `granted_keywords`, etc.).
 *
 * The dump has two distinct keyword tables:
 *   - `keyword`         — ordinary datasheet/wargear keywords (e.g. "Vehicle").
 *   - `faction_keyword` — army/sub-faction keywords (e.g. "Adeptus Custodes").
 * Both carry the label under `localisations.en.name`, which is exactly the form
 * the repo authors (the schema type `$defs/keyword` is a free 1–64 char string,
 * and existing data spells keywords as their GW display name). So resolution is
 * `dump.enName(row)` — no case/slug transform.
 *
 * These functions are the single id→label seam reused by the enhancement,
 * detachment, and (later) wargear/unit keyword passes, so every consumer resolves
 * a keyword the same way. They are PURE reads: a missing id or a row without an
 * English name returns `null`, and the *consumer* decides what an unresolved label
 * means (skip + warn, mirroring the weapon-keyword parser's closed-set discipline)
 * — a keyword pass must never write a `null`/empty label.
 */
import type { MfmDump } from "./loader.js";

/** Resolve an ordinary `keyword` id to its repo label, or `null` if unknown. */
export function keywordLabel(dump: MfmDump, keywordId: string | null | undefined): string | null {
  if (!keywordId) return null;
  return dump.enName(dump.byId("keyword").get(keywordId)) ?? null;
}

/** Resolve a `faction_keyword` id to its repo label, or `null` if unknown. */
export function factionKeywordLabel(
  dump: MfmDump,
  factionKeywordId: string | null | undefined,
): string | null {
  if (!factionKeywordId) return null;
  return dump.enName(dump.byId("faction_keyword").get(factionKeywordId)) ?? null;
}

/**
 * Resolve a list of `keyword` ids to a sorted, de-duplicated label array, dropping
 * any that don't resolve. Returns `null` when the input is empty OR nothing
 * resolves, so callers can store `null` (schema shape for "no restriction") rather
 * than an empty array. `unresolved` collects the dropped ids for the caller to
 * surface as a warning.
 */
export function keywordLabels(
  dump: MfmDump,
  keywordIds: readonly (string | null | undefined)[],
  unresolved?: string[],
): string[] | null {
  const labels = new Set<string>();
  for (const id of keywordIds) {
    const label = keywordLabel(dump, id);
    if (label) labels.add(label);
    else if (id && unresolved) unresolved.push(id);
  }
  if (labels.size === 0) return null;
  return [...labels].sort((a, b) => a.localeCompare(b));
}

/** Faction-keyword variant of {@link keywordLabels}. */
export function factionKeywordLabels(
  dump: MfmDump,
  factionKeywordIds: readonly (string | null | undefined)[],
  unresolved?: string[],
): string[] | null {
  const labels = new Set<string>();
  for (const id of factionKeywordIds) {
    const label = factionKeywordLabel(dump, id);
    if (label) labels.add(label);
    else if (id && unresolved) unresolved.push(id);
  }
  if (labels.size === 0) return null;
  return [...labels].sort((a, b) => a.localeCompare(b));
}
