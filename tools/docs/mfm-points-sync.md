# Syncing points from the online Munitorum Field Manual

`tools/src/sync-mfm-points.ts` refreshes unit point costs and enhancement costs from
the official online MFM (<https://mfm.warhammer-community.com/en>) and reconciles them
into `data/core/` as the **authoritative** points source (it supersedes the points the
army-assist `convert-faction.ts` path produces).

It is the mechanism to run whenever GW publishes a new MFM / points dataslate.

## What it does

1. Fetches each faction page `…/en/{slug}` (30 factions) and caches the raw HTML under
   the gitignored `_private/mfm/` so re-runs don't re-hit GW.
2. Parses unit points (including the 11e per-army-ordinal tiers), enhancement costs, and
   the MFM version string from the page.
3. Matches MFM names to existing entity IDs (`nameToId`), deduplicating shared rosters
   (Space Marine chapter pages, mono-god Chaos legion daemons).
4. With `--write`, overwrites matched entities' `points` / enhancement `cost`, sets
   `points_provisional: false`, and stamps `game_version = { "11th", "launch" }`.
5. Always writes a coverage/diff report to `data/core/_reports/mfm-sync.md` and a
   machine-readable `_private/mfm/unmatched.json`.

## Run it

```bash
cd tools
npm install                                  # once

# Dry run — fetch (or use cache), parse, match, write the report only. No data changes.
npx tsx src/sync-mfm-points.ts

# Review coverage + every old→new change:
#   ../data/core/_reports/mfm-sync.md

# Apply (overwrites data/core/**/units.json + enhancements.json for matched entities):
npx tsx src/sync-mfm-points.ts --write

# Useful flags:
npx tsx src/sync-mfm-points.ts --refetch              # ignore the HTML cache, re-download
npx tsx src/sync-mfm-points.ts adepta-sororitas orks  # subset by MFM slug
```

## After `--write`: regenerate artifacts and verify

A `data/` change requires regenerating the embedded bundles, or CI's "artifacts up to
date" job fails. From the repo root:

```bash
cd tools && npm run validate          # schema (AJV) + referential integrity
npm run codegen:data                   # TS embedded bundle
cd .. && cargo run -p xtask -- bundle-data    # Rust bundle.generated.json
python3 python/codegen/sync_bundle.py         # Python _bundle.json (copies from Rust)
bash go/codegen/sync.sh                        # Go bundle.json + schemas/ + spec.go

# Tests (each impl pins some shipped-data values; update any that legitimately moved):
cd tools && npm test
cargo test -p wh40kdc
cd python && python -m pytest -q
cd go && go test ./...
```

Conformance only needs a `conformance/SPEC_VERSION` bump + golden regen
(`npm run gen:conformance`) **if** a points change shifts a pinned golden — a plain
points refresh usually doesn't, because cost-bearing paths take the cost from the roster
source, not from `dataset.unit.points`.

### Toolchain notes

- `npm run codegen:types` / `python3 python/codegen/gen_typeddicts.py` are only needed
  when the **schema** changes, not for a points-only refresh.
- `gen_typeddicts.py` needs `ruff` **on PATH** (its `ruff-format` pass silently no-ops
  otherwise and the generated `_types.py` drifts). `pip install ruff` or add the Python
  `Scripts/` dir to PATH.
- `go/codegen/sync.sh` is pure file-copy bash — it does not need the `go` binary; only
  `go test` does.

## Per-army-ordinal pricing (11e)

11e prices many datasheets by how many copies you field ("your 1st-2nd units cost X,
your 3rd+ unit costs Y"). This is modeled by two **optional** fields on each
`unit.points` item:

```jsonc
{ "models": 1, "cost": 180, "unit_count_min": 1, "unit_count_max": 1 },   // 1st unit
{ "models": 1, "cost": 220, "unit_count_min": 2, "unit_count_max": null } // 2nd+ unit
```

Absent `unit_count_min`/`unit_count_max` (the common case) means the cost applies to
every copy. `unit_count_max: null` is an open-ended top band.

## Known mapping rules and gaps

- **Faction slug ≠ repo dir.** MFM `space-marines` → `adeptus-astartes`,
  `imperial-agents` → `agents-of-the-imperium`. See `FACTION_DIR` in the script.
- **Shared rosters are deduped, not double-written.** SM chapter pages repeat the
  generic Astartes roster (lives in `adeptus-astartes`); mono-god Chaos legion pages
  repeat their patron's daemons (`chaos-daemons`) + shared engines like the Defiler
  (`chaos-space-marines`). These are reported as "shared-SM skipped" and synced only
  from their home page. See `SHARED_ROSTERS`.
- **New datasheets can't be synced** until the unit/enhancement entity exists in the
  repo. The report's "New units in MFM, no repo entity" section is the authoring
  worklist.
- **`titan-legions` / `chaos-titan-legions` are unsupported** — the repo has no
  `adeptus-titanicus/units.json` and those pages use a different layout.
- The parser reads GW's Next.js RSC markup (cost values are Suspense-streamed via
  `S:XX`/`P:XX` id pairs). A future GW site rebuild can break it; the parsing
  assumptions are isolated in the script and the `_private/mfm/` HTML cache lets you
  diff offline.
