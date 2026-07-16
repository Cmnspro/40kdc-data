# MFM dump — wargear cap mechanisms

This file records only the ingestion policy for wargear caps. The durable source
contract lives in:

- `dump.catalog.json` for reviewed table/field meanings and verified relations;
- `mappings/wargear-option.mapping.json` and `mappings/unit.mapping.json` for
  repository-field provenance, transforms, consumers, and precedence;
- `dump.schema.json` for generated source shape and nullability.

Run `npm run mfm:contract -- --check` and `--report` before changing the policy;
use `--write` only after reviewing catalog and mapping changes. `_private/dump.json`
is the ignored raw source, and `_private/dump.schema.json` is only an ignored
byte-identical mirror of the committed schema.

## The settled cap rule (structural — no prose parsing)

The cataloged precedence for an optional swap is:

1. A `wargear_limit` ratio on the applicable mini-scoped
   `limited_wargear_choice_set` determines `per_n_models`; the smallest ratio
   binds.
2. Otherwise, `wargear_option.inputType` determines the unit-wide shape:
   `checkbox` produces `model_constraint.max_count: 1`, while `stepper` produces
   `any_number`.

`loadout_choice_set.limit` is a per-model choice count, not the squad cap. The
implementation symbols and exact source/relation chain are recorded in the two
mapping sidecars above; `wargear.ts` must consume that shared interpretation
rather than introducing another traversal. The list engine already honors the
result through `data/loadout.ts#optionCap` and `#weaponBounds`.

## Source contract

Do not duplicate the table graph here. `dump.catalog.json` is authoritative for
field descriptions, identity guarantees, relation status, cardinality, and
purpose. The mapping sidecars are authoritative for joins, filters, transforms,
consumer symbols, and the precedence above. If the app shows a cap that the
mapping does not explain, search `_private/dump.json`, update the reviewed
catalog/mapping, regenerate, and add a focused fixture before changing ingestion.
