/**
 * Turn a parsed {@link Roster} into a list-builder share link — but only when
 * the list round-trips in full. This gate IS the validation showcase: a list
 * earns an "Open in list-builder" link only if every unit resolved AND every id
 * encodes against the embedded share registry.
 *
 *   1. Any unresolved unit → no link (the importer couldn't match a datasheet).
 *   2. `rosterToShareList` drops registry-unknown ids; if that drops a unit, the
 *      token wouldn't faithfully represent the list → no link.
 *   3. `encodeShareToken` still throws on a resolved-but-unregistered id (a stale
 *      registry); the try/catch turns that into "no link" rather than a crash.
 */
import { encodeShareToken, rosterToShareList, type Roster } from "@alpaca-software/40kdc-data";
import { LIST_BUILDER_URL } from "../../../_shared/links";

export function builderLink(roster: Roster): string | null {
  if (roster.diagnostics.unresolved_units > 0) return null;
  try {
    const share = rosterToShareList(roster);
    if (share.units.length !== roster.units.length) return null;
    return `${LIST_BUILDER_URL}/#l=${encodeShareToken(share)}`;
  } catch {
    return null;
  }
}
