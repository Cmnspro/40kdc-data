# Planning doc: centralize shared Space Marine content

**Status:** proposal — not yet implemented. Written after the canonical-id /
structured-store work (40kdc-data #32) surfaced the duplication.

## Problem

Space Marine **chapters** (`black-templars`, `blood-angels`, `dark-angels`,
`deathwatch`, `space-wolves`, `crimson-fists`, `imperial-fists`, `iron-hands`,
`raven-guard`, `salamanders`, `ultramarines`, `white-scars`) duplicate the
generic marine detachments' content.

Measured at the time of writing (`data/core/`):

| | adeptus-astartes (generic) | 12 chapters (total) |
|---|--:|--:|
| units | 225 | **0** (chapters reference astartes units) |
| stratagems | 67 | **965** |
| enhancements | 55 | **779** |

Units are already centralized (chapters carry none). But the generic marine
detachments (Gladius Task Force, etc.) and their stratagems/enhancements are
**repeated in every chapter dir** — several chapters have identical counts
(67/55, 72/59), i.e. the generic set copied verbatim plus a chapter-specific
detachment. That's ~1,700 duplicated entries that must be kept in sync by hand,
and each duplicate gets its own `ability_id` + raw-text store entry (the store
index dedupes identical text, but the source data does not).

## Goal

One source of truth: the generic marine detachments live once in
`adeptus-astartes`; each chapter declares only its **chapter-specific**
detachments and **inherits** the generic ones.

## Sketch (needs design review before building)

1. **Schema:** add a faction-inheritance field (e.g. `parent_faction` or
   `inherits_detachments_from: "adeptus-astartes"`) on the chapter `factions.json`
   entry, or a `shared_with` flag on the generic detachments.
2. **Resolution:** a chapter's available detachments = its own +
   the parent's generic ones. Implement in the TS `Dataset` view and mirror in
   Rust/Python/Go (conformance corpus must pin the resolved set per chapter).
3. **Data migration:** remove the duplicated generic detachments/stratagems/
   enhancements from the 12 chapter dirs, keeping only chapter-specific ones.
   Regenerate bundles + store + index; share-registry will tombstone the removed
   duplicate ids (old tokens still decode the generic id via the parent).
4. **Store:** the generic content has one set of canonical ids under
   `adeptus-astartes`; chapter-specific content keeps its `<name>-<detachment>` id.

## Risks / open questions

- The inheritance mechanism is a new cross-cutting concept — it touches the
  schema, all four language `Dataset` impls, and the conformance corpus. Sizeable.
- Confirm chapters truly take the generic detachments unchanged (no per-chapter
  rule tweaks) before deduping — spot-check a few.
- Downstream consumers (the app) must understand inherited detachments.

## Scope

This is its own PR (or PR series), independent of the structured-store /
canonical-id work. Do not bundle it.
