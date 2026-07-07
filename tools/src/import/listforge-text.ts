/**
 * ListForge plain-text adapter: lower ListForge's copy-paste text export to a
 * {@link ParsedRoster}.
 *
 * This is the bullet-list text users copy out of the ListForge app (distinct
 * from the base64+gzip share-JSON the `listforge` adapter handles). Shape:
 *
 * ```
 * all gas no breaks - Chaos Daemons - Daemonic Incursion (1995 Points)
 *
 * Epic Hero:
 * Rotigus (250 pts)
 *   • Gnarlrod
 *   • Streams of brackish filth
 *
 * Battleline:
 * Bloodletters (110 pts)
 *   • Bloodreaper
 *     • Hellblade
 *   • Daemonic Icon
 *   • 9x Bloodletter
 *     • 9x Hellblade
 * ```
 *
 * - The first non-blank line is
 *   `<list name> - <faction> - [<disposition> - ]<detachment(s)> (<N> Points)`.
 *   The list name is a single segment (ListForge never inserts ` - `; a name
 *   that contains it breaks the split — a documented ListForge limitation, not
 *   ours). The faction is the second segment; the LAST segment is the detachment
 *   list (comma-joined when a list fields several under an 11e detachment-point
 *   cap); any segment between faction and detachment is the selected Force
 *   Disposition (e.g. `Priority Assets`). Legacy 3-segment headers with no
 *   disposition still parse.
 * - Sections are mixed-case battlefield-role lines ending with `:`
 *   (`Epic Hero:`, `Character:`, `Battleline:`, …). Units under `Epic Hero:` or
 *   `Character:` are characters.
 * - Bullet classification mirrors the GW adapter: a top-level bullet with
 *   deeper children is a **model group** (its `Nx` count — implicitly 1 —
 *   adds to the model count); without children it's **wargear**. Child-bullet
 *   `Nx` counts are already squad-wide totals; a child without a count is one
 *   item (`• Hellblade` under a lone Bloodreaper).
 * - `E: <name>` is the enhancement annotation (ListForge reports no points for
 *   it, so `enhancement_points` stays null and unit points stay as displayed).
 *   A bare `Warlord` bullet flags the warlord.
 * - An `Attached Units:` section groups leader+bodyguard pairs. Each group is a
 *   combined `<Leader> + <Bodyguard> (<total> pts)` header (a marker, not a
 *   unit — its points are the sub-units' sum) followed by the leader and
 *   bodyguard as indented `Name (N pts)` sub-units, leader first. The leader is
 *   emitted as a character carrying an explicit `leader`-role
 *   `leader_attachment` to the bodyguard, so {@link resolve} reconstructs the
 *   link directly instead of falling back to `support`-only inference.
 *
 * **Disjointness**: the `(N Points)` first-line suffix is unique to this
 * format — newrecruit-simple's first line ends `- [N pts]`, the GW export
 * opens with a `++++` fence, and the WTC formats carry `N with` lines or no
 * bullets at all.
 *
 * @packageDocumentation
 */
import type { FormatAdapter } from "./adapter.js";
import type {
  ParsedLeaderAttachment,
  ParsedRoster,
  ParsedUnit,
  ParsedWargear,
} from "./types.js";
import { inferBattleSizeRaw } from "./newrecruit-text.js";

const FIRST_LINE = /^(.+)\s\(\s*(\d+)\s*Points?\s*\)\s*$/i;
const SECTION_HEADER = /^[A-Za-z][A-Za-z0-9 /&'-]*:$/;
const UNIT_HEADER = /^(.+?)\s*\(\s*(\d+)\s*pts?\s*\)\s*$/i;
const BULLET_LINE = /^(\s*)•\s*(.+?)\s*$/u;
const NX_PREFIX = /^(\d+)x\s+(.+)$/;
const BULLET = /^[\t ]*•/mu;
const WITH_LINE = /^[\t ]*\d+\s+with\b/m;

const ENHANCEMENT_PREFIX = "E: ";
const WARLORD_MARKER = "Warlord";
const CHARACTER_SECTIONS = new Set(["epic hero", "character"]);
/** ListForge groups leader+bodyguard pairs under this section. Each group is a
 * combined `Leader + Bodyguard (total pts)` header followed by the two units as
 * indented sub-entries (leader first), so the leader's attachment is explicit. */
const ATTACHED_SECTION = "attached units";
const ATTACHED_SEP = " + ";

/** Accept plain text whose first non-blank line is the ListForge
 * `name - faction - detachment (N Points)` header, with `•` bullets and no
 * WTC `N with` lines. */
function isListForgeText(decoded: unknown): string | null {
  if (typeof decoded !== "string") return null;
  const firstNonBlank = decoded
    .split(/\r?\n/)
    .find((l) => l.trim().length > 0);
  if (!firstNonBlank) return null;
  const first = FIRST_LINE.exec(firstNonBlank.trim());
  if (!first || first[1].split(" - ").length < 3) return null;
  if (!BULLET.test(decoded)) return null;
  if (WITH_LINE.test(decoded)) return null;
  return decoded;
}

interface Header {
  name: string;
  faction_raw_name: string | null;
  detachment_raw_names: string[];
  disposition_raw_name: string | null;
  total_reported: number | null;
}

/** Split a detachment segment on commas — 11e lists field several detachments
 * comma-joined in a single header segment (`"A, B"`); one detachment stays one. */
function splitDetachments(segment: string): string[] {
  return segment
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseFirstLine(line: string): Header | null {
  const m = FIRST_LINE.exec(line.trim());
  if (!m) return null;
  const parts = m[1].split(" - ").map((s) => s.trim()).filter(Boolean);
  if (parts.length < 3) return null;
  // `<name> - <faction> - [<disposition> - ]<detachment(s)>`. The name is the
  // first segment (ListForge never inserts ` - `), the faction the second, the
  // LAST segment the comma-joined detachment list, and any segment in between
  // is the selected Force Disposition. Legacy 3-segment headers have no
  // disposition; the middle slice is then empty.
  return {
    name: parts[0],
    faction_raw_name: parts[1],
    detachment_raw_names: splitDetachments(parts[parts.length - 1]),
    disposition_raw_name:
      parts.length >= 4 ? parts[parts.length - 2] : null,
    total_reported: Number.parseInt(m[2], 10),
  };
}

interface Bullet {
  indent: number;
  count: number | null;
  text: string;
}

interface UnitAcc {
  raw_name: string;
  displayed_pts: number | null;
  is_character: boolean;
  bullets: Bullet[];
  /** Set on an attached leader (from the `Attached Units:` section) linking it
   * to its bodyguard; null for every ordinary unit. */
  leader_attachment: ParsedLeaderAttachment | null;
}

function finishUnit(acc: UnitAcc): ParsedUnit {
  const topIndent = acc.bullets.length
    ? Math.min(...acc.bullets.map((b) => b.indent))
    : 0;

  const wargear = new Map<string, number>();
  let model_count = 0;
  let is_warlord = false;
  let enhancement_raw_name: string | null = null;

  const addWargear = (raw_name: string, count: number): void => {
    wargear.set(raw_name, (wargear.get(raw_name) ?? 0) + count);
  };

  for (let i = 0; i < acc.bullets.length; i += 1) {
    const b = acc.bullets[i];

    // Child bullet: a model group's weapon. ListForge child counts are
    // squad-wide totals; a count-less child is a single item.
    if (b.indent > topIndent) {
      addWargear(b.text, b.count ?? 1);
      continue;
    }

    // Top-level annotations.
    if (b.count === null) {
      if (b.text === WARLORD_MARKER) {
        is_warlord = true;
        continue;
      }
      if (b.text.startsWith(ENHANCEMENT_PREFIX)) {
        if (enhancement_raw_name === null) {
          enhancement_raw_name = b.text.slice(ENHANCEMENT_PREFIX.length).trim();
        }
        continue;
      }
    }

    // Top-level entry: a model group when it has child bullets beneath it,
    // otherwise plain wargear. Either way a missing `Nx` count means 1.
    const next = acc.bullets[i + 1];
    if (next && next.indent > b.indent) {
      model_count += b.count ?? 1;
    } else {
      addWargear(b.text, b.count ?? 1);
    }
  }

  if (model_count === 0) model_count = 1;

  return {
    raw_name: acc.raw_name,
    is_character: acc.is_character,
    model_count,
    points: acc.displayed_pts,
    is_warlord,
    enhancement_raw_name,
    // ListForge's text export reports no enhancement cost, so the unit's
    // displayed points stay as-is and no enhancement points are claimed.
    enhancement_points: null,
    wargear: [...wargear].map(
      ([raw_name, count]): ParsedWargear => ({ raw_name, count }),
    ),
    leader_attachment: acc.leader_attachment,
  };
}

export const listForgeTextAdapter: FormatAdapter = {
  id: "listforge-text",

  matches(decoded: unknown): boolean {
    return isListForgeText(decoded) !== null;
  },

  parse(decoded: unknown): ParsedRoster {
    const text = isListForgeText(decoded);
    if (text === null) {
      throw new Error("listforge-text: input is not a ListForge text export");
    }

    const lines = text.split(/\r?\n/);
    let header: Header | null = null;
    const units: ParsedUnit[] = [];
    let current: UnitAcc | null = null;
    let sectionIsCharacter = false;
    // `Attached Units:` section state. A combined `Leader + Bodyguard` header
    // sets `pendingBodyguardName`; the next two sub-units are the leader
    // (`groupMemberIndex` 0, a character) and the bodyguard (index 1).
    let inAttachedSection = false;
    let pendingBodyguardName: string | null = null;
    let groupMemberIndex = 0;

    const finalize = (): void => {
      if (current) {
        units.push(finishUnit(current));
        current = null;
      }
    };

    for (const raw of lines) {
      const line = raw.trim();
      if (!line) continue;

      if (!header) {
        header = parseFirstLine(line);
        if (header) continue;
      }

      const bulletMatch = BULLET_LINE.exec(raw);
      if (bulletMatch) {
        if (current) {
          const rest = bulletMatch[2];
          const nx = NX_PREFIX.exec(rest);
          current.bullets.push({
            indent: bulletMatch[1].length,
            count: nx ? Number.parseInt(nx[1], 10) : null,
            text: (nx ? nx[2] : rest).trim(),
          });
        }
        continue;
      }

      if (SECTION_HEADER.test(line)) {
        finalize();
        const sectionKey = line.slice(0, -1).trim().toLowerCase();
        sectionIsCharacter = CHARACTER_SECTIONS.has(sectionKey);
        inAttachedSection = sectionKey === ATTACHED_SECTION;
        pendingBodyguardName = null;
        groupMemberIndex = 0;
        continue;
      }

      const unitMatch = UNIT_HEADER.exec(line);
      if (unitMatch) {
        const rawName = unitMatch[1].trim();

        // In the attached section, a `Leader + Bodyguard (total pts)` header is
        // a grouping marker, not a unit: it names the pair and prefaces the two
        // real sub-units. Skip it (its points are the sum of the sub-units', so
        // emitting it would double-count) and remember the bodyguard name.
        if (inAttachedSection && rawName.includes(ATTACHED_SEP)) {
          finalize();
          pendingBodyguardName = rawName
            .slice(rawName.indexOf(ATTACHED_SEP) + ATTACHED_SEP.length)
            .trim();
          groupMemberIndex = 0;
          continue;
        }

        finalize();
        // First sub-unit of a group (index 0) is the attaching leader — a
        // character carrying an explicit `leader`-role attachment to the
        // bodyguard; the second (index 1) is the bodyguard unit itself.
        const isAttachedLeader =
          inAttachedSection &&
          pendingBodyguardName !== null &&
          groupMemberIndex === 0;
        current = {
          raw_name: rawName,
          displayed_pts: Number.parseInt(unitMatch[2], 10),
          is_character: inAttachedSection ? isAttachedLeader : sectionIsCharacter,
          bullets: [],
          leader_attachment: isAttachedLeader
            ? {
                bodyguard_raw_name: pendingBodyguardName as string,
                role: "leader",
                provisional: false,
              }
            : null,
        };
        if (inAttachedSection) groupMemberIndex += 1;
      }
    }
    finalize();

    if (!header) {
      throw new Error("listforge-text: missing ListForge header line");
    }

    let total_computed = 0;
    for (const u of units) total_computed += u.points ?? 0;

    // Like the GW export, ListForge text reports only the army total — use it
    // as the declared limit so battle-size inference stays round-trippable.
    const declared_limit = header.total_reported;

    return {
      name: header.name,
      generated_by: "List Forge",
      faction_raw_name: header.faction_raw_name,
      detachment_raw_names: header.detachment_raw_names,
      force_disposition_raw_name: header.disposition_raw_name,
      battle_size_raw: inferBattleSizeRaw(declared_limit),
      declared_limit,
      total_reported: header.total_reported,
      total_computed,
      units,
      multi_force: false,
    };
  },
};

// Internals re-exported for unit tests.
export const _internals = {
  isListForgeText,
  parseFirstLine,
};
