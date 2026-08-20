# Codex: Orks 11e conversion

This ledger tracks the public-safe state of the Codex: Orks conversion. It records structural facts, repository IDs, provenance references, decisions, commands, and verification only. Source images, OCR output, and Games Workshop prose remain in ignored private storage or the sibling raw-text store.

## Campaign contract

| Field | Value |
| --- | --- |
| Release target | `1.3.0` |
| Working bookmark | `wnmitch/codex-orks-1.3.0` |
| Base | `main` at package `1.2.6` |
| Faction | `orks` |
| Planned rules snapshot | `11th/codex-orks` |
| Private source key | `codex-orks-11e/rev-2683` |
| Source inventory | 33 frozen slides; 36 captured image resources representing 34 unique photographs |
| OCR inventory | Three Tesseract candidates per slide plus upright-photo OCR and Vision candidates used for visual review |
| Review policy | Exact matches to the trusted baseline may auto-resolve; every changed or novel field and every ability transcription requires human review |
| Release gate | Full in-scope book coverage, no unresolved review blockers, generated-artifact parity, and green `just preflight` |

`1.3.0` is one atomic release objective even though the work will span multiple sessions and commits. Package versions remain unchanged until the release commit.

## Source and precedence

The frozen source snapshot is immutable. A later source revision becomes a new snapshot and receives a structural diff; it never silently changes accepted values.

When sources disagree, use this order:

1. Visibly readable Codex: Orks material for fields printed in the book.
2. Checked-in data derived from MFM version `925` for structural relations and fields the book does not print.
3. The local private MFM version `895` only as a relational reference. Never replay it wholesale over newer checked-in data.
4. Existing repository data only where neither source speaks.

Codex OCR may replace an MFM-derived value only when the changed book value is visually confirmed. Ambiguous values enter the review queue; they are not guessed. The eventual official app/MFM release may supersede this snapshot after a field-by-field reconciliation.

## IP boundary

- Keep frozen images, crops, OCR candidates, and review transcriptions under `_private/`.
- Store raw ability prose only in the sibling `40kdc-abilities` repository.
- Commit only numerical or structural game data, community-authored DSL, source identifiers, counts, hashes, and review status.
- Never copy source prose into this ledger, repository comments, tests, commits, or pull-request text.

## Baseline inventory

Counts on `main` before Codex reconciliation:

| Entity | Count | Known setup debt |
| --- | ---: | --- |
| Units | 63 | Reconcile every Codex datasheet and preserve out-of-book records unless an authoritative source removes them |
| Weapons | 172 | Reconcile all profiles and add the new `hunter` keyword semantics |
| Detachments | 14 | Reconcile the photographed inventory against the 15-detachment Codex target |
| Stratagems | 78 | 54 records have no `ability_id` |
| Enhancements | 52 | 44 records have no `ability_id` |
| Detachment rules | 14 | 2 detachments have no `detachment_rule_id` |
| Leader attachments | 19 | Reconcile against current MFM relations |
| Unit compositions | 58 | Reconcile names, tiers, and model counts |
| Wargear options | 66 | Resolve 9 records still present in `_wargear-options.unparsed.json` |
| Wargear abilities | 11 | Reconcile book changes and ability links |
| Authored abilities | 159 | Replace stale 10e/provisional mechanics and reach complete Codex coverage |
| Phase mappings | 194 | Rebuild after the final ability set is stable |

The frozen deck visibly covers 13 unique detachments. Official release material names 15, so two detachments remain source-absent and block full-book coverage; the extra named rule on the Madcap Meks close-up is a second rule for that detachment, not a 14th photographed detachment.

## Modeling decisions

- Treat `11th/codex-orks` as a distinct rules snapshot. Do not invent an official effective date; add the game-version record when a defensible publication/effective date is available.
- Cleanly replace obsolete Orks-only 10e/provisional records where the Codex speaks. Preserve stable IDs when mechanics remain the same. Add share-registry aliases for unavoidable ID renames.
- Model the repeated `Riled Up` state as a reusable, first-class rules bundle rather than duplicating four effects at every grant site. Add schema, integrity, describer, cruncher, TS/Rust/Python/Go, and conformance support before authored data depends on it.
- Migrate `Waaagh` to the same reusable bundle contract as proof that the shape is generic. Keep relational role systems such as `Guided` out of this migration unless their own contract requires it.
- Treat `hunter` as a real weapon keyword. Encode its rule through existing effects if faithful; otherwise add the smallest honest first-class shape with four-port parity and conformance coverage. Never ship it as an inert label.
- Prove new shapes against their cross-faction family, but keep this release's data re-authoring scoped to Codex: Orks except where an existing conformance case must migrate.
- Keep appendix/community material separately measurable from Codex coverage. It may update Orks-wide records when corroborated, but must retain its own provenance.

## Batch and review policy

Core-data batches follow coherent source boundaries:

- one photographed or preview datasheet per core/OCR review batch;
- one complete detachment spread per detachment review batch;
- five to eight related abilities per DSL execution batch.

Before applying a batch:

1. Compare OCR candidates against checked-in MFM `925`-derived data.
2. Auto-resolve only exact matches.
3. Review the image for every changed or novel stat, profile, keyword, relationship, or identifier.
4. Review every ability transcription, including high-confidence OCR.
5. Record accepted fields and blockers in the private review queue.
6. Apply only the accepted batch, then validate it before starting the next batch.

The private review surface lives at `_private/sources/codex-orks-11e/rev-2683/review/index.html`. It is generated and ignored. The core-data queue is beside it as `review/review-queue.json`; exact prose transcripts live under `review/transcripts/`.

## Campaign state

### Setup

- [x] Preserve the unrelated pre-campaign working copy at local bookmark `wnmitch/pre-orks-worktree`.
- [x] Isolate and publish the terrain/layout work as pull request `#166`.
- [x] Create `wnmitch/codex-orks-1.3.0` from clean `main` and reserve a sibling data workspace for campaign changes.
- [x] Freeze Google Slides revision `2683` as 33 slides containing 36 image resources and 34 unique photographs.
- [x] Generate the slide-level and upright-photo OCR candidate sets with Tesseract `5.5.1` and Vision.
- [x] Generate the 33-item private core review queue and the 178-record transcript review surface.
- [x] Create this public-safe campaign ledger.

### Source review

- [x] Classify all visible ability-bearing source regions and map them to canonical entity IDs.
- [ ] Split slide-level core review items into field-level crops and candidate values.
- [ ] Review every changed or novel core field.
- [x] Review every imported ability transcription against an upright original photograph.
- [x] Resolve the photographed detachment inventory: 13 unique detachments and 14 named detachment-rule records.
- [ ] Obtain authoritative source material for the two official detachments absent from the frozen deck.
- [ ] Record appendix provenance separately from Codex provenance.

### Core data

- [ ] Reconcile units, weapons, compositions, options, attachments, detachments, stratagems, and enhancements against MFM `925`.
- [ ] Apply reviewed Codex stat, profile, keyword, and relationship changes in coherent batches.
- [ ] Resolve the 9 unparsed wargear-option records.
- [ ] Implement and validate `hunter` weapon-keyword semantics.
- [ ] Add `11th/codex-orks` when its effective date is defensible.

### Ability data

- [x] Create the matching `wnmitch/codex-orks-1.3.0` bookmark in `40kdc-abilities`.
- [x] Ingest 178 exact raw ability records into the sibling store and regenerate its index (`1b13d69a`).
- [ ] Add the reusable rules-bundle contract across schemas and all four ports.
- [ ] Migrate `Waaagh` and author the canonical `Riled Up` bundle.
- [ ] Author and adversarially verify every in-scope Codex ability.
- [ ] Reconcile phase mappings, stale abilities, and orphan links.

### Release

- [ ] Reconcile the expected official MFM snapshot without replacing accepted Codex values blindly.
- [ ] Reach zero unresolved in-scope review blockers.
- [ ] Rebuild the share registry before generated bundles if any IDs changed.
- [ ] Regenerate TypeScript, Rust, Python, Go, and conformance artifacts.
- [ ] Run `just preflight` from a stable committed state.
- [ ] Bump all four package versions together to `1.3.0`.
- [ ] Publish the Codex: Orks release pull request.

## Session log

### 2026-08-20 — source and workspace setup

- Frozen source revision `2683`: 33 slides, 36 image resources, and 34 unique photographs with byte counts and SHA-256 values in the private manifest.
- Generated slide-level and upright-photo OCR candidates; zero OCR process failures.
- Recovered correct orientation for every unique source photograph and built a private side-by-side review page with persistent local decisions.
- Visually verified 178 imported prose records: 96 unit abilities, 14 detachment rules, 34 enhancements, and 34 stratagems. No imported transcript remains unresolved.
- Corrected OCR-invented headings and split mechanically distinct same-name abilities before raw-store ingestion.
- Added the exact records to the sibling raw-text store and regenerated `index.json` in commit `1b13d69a`.
- Preserved unrelated local work before cutting the clean campaign bookmark.
- Published the prerequisite terrain work separately as pull request `#166`; all GitHub checks pass.
