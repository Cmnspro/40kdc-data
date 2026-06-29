# Ability-DSL shape backlog (ranked)

Highest-value *new DSL shapes* still missing — recurring mechanics no existing
effect/condition/trigger enum can express. From the embeddings-clustering
analysis (full-corpus run, model all-MiniLM-L6-v2, threshold 0.85; reports are
gitignored in ../40kdc-embeddings). Ranked by coverage × genuine
unexpressibility. Counts are abilities / factions.

| # | Shape | Kind | Coverage | Status |
|---|---|---|---|---|
| 1 | pooled-resource economy (tokens + valued dice) | effect + condition | 101 / 5 | **landed (1.0.8)** |
| 2 | `modifier-immunity` | effect | 46 / 25 | **landed (1.0.14)** |
| 3 | `usage` limit | meta-constraint field | 366 / 34 | **landed (field; adoption 1.0.14)** |
| 4 | `stratagem-cost-modifier` | effect | 50 / 22 | **landed (1.0.14)** |
| 5 | `targeting-permission` (was "targetable-only-if") | effect | 29 / 15 | **landed (1.0.14)** |
| ~~6~~ | ~~sticky-objective~~ | — | — | **dropped — already expressible** |

> Coverage counts are whole-store (incl. enhancements/stratagems). The DSL data
> layer enriches only core/faction/detachment/unit + the enriched enhancement/
> stratagem subset, so each shape's *migratable data footprint* is smaller than
> the store coverage; see per-shape notes.

## 1. Pooled-resource economy — tokens + valued dice (SHAPE LANDED, 1.0.8)

Shipped: `pool-add-die {value}` + `replace-roll-from-pool {rolls}` effects (the
latter revives the v1.0.0-retired dice-substitution), a `token-count-at-or-above
{pool_id, threshold}` condition, and a `cap {count, per}` field on `resource-spend`.
Schema + four byte-identical describers + cruncher fail-safe + conformance goldens.
Representative usages authored: Sororitas `acts-of-faith` (→ replace-roll-from-pool,
off the over-claiming guarantee-crit punt) and `solemn-procession` (→ pool-add-die
value 6); Drukhari `experimental-enhancements` (token-count gate + spend cap).

Incremental follow-up (data adoption, not new shape): broaden to the rest of
Drukhari Pain, Votann YP, Aeldari Battle Focus, and the remaining Sororitas
Miracle-dice abilities. Deliberately left as-is — neither new effect fits faithfully:
`stirring-rhetoric` (sets an existing die's value) and the Imagifier reroll
(re-rolls a die); both remain opaque ability-grant grant_type until a "modify a
pooled die" shape exists.

## 2. modifier-immunity (effect) — LANDED 1.0.14

`single-effect` leaf `modifier-immunity { scope, exclude? }`. Negates *applied*
modifiers — not `stat-modifier` (adds/sets a value), not a condition.
`scope: characteristics` is the grounded mechanic ("ignore any/all modifiers to a
unit's characteristics" — champion-of-humanity / obfuscation / ceramite family).
`scope: enemy-stratagems | enemy-abilities` ("cannot be affected by enemy
Stratagems / abilities") + the `exclude` carve-out are reserved for incoming
faction-pack content — no current store ability uses them (pinned by unit test,
not data). Roll-modifier immunity stays on `roll-modifier { operation:
ignore-modifiers }` (e.g. inescapable-accuracy, the BS/Hit attack-scoped family —
it fits, not torture); a "characteristics AND rolls" rule composes the two via a
`sequence`. Data migration: the lone char+roll
`ability-grant{ignore-characteristic-and-roll-modifiers}` (adeptus-astartes) →
sequence of the two leaves. Most of the 46/25 store coverage is
enhancements/stratagems not yet enriched in the data layer.

## 3. usage limit (meta-constraint field) — FIELD LANDED; adoption 1.0.14

`ability.usage { frequency, count?, per? }` (schema) rendered by `usageClause`
(front-of-sentence "Once per turn, …"). Distinguishes once-per-turn-per-unit
from once-per-battle-army where `scope.duration: one-use` was too coarse. 1.0.14
adopts it on the abilities that still encode their limit in prose / a timing
marker.

## 4. stratagem-cost-modifier (effect) — LANDED 1.0.14

`single-effect` leaf `stratagem-cost-modifier { operation, amount?|set_to?,
applies_to, stratagem? }`. `cp-gain`/`cp-refund` cover *gaining* CP; this
modifies a Stratagem's *cost*. The genuine gap is the cost-increase / opponent-
tax direction — the 7 "enemy Stratagems targeting a unit within 12" cost 1 more
CP" auras (unorthodox-strategist, guile-of-the-wolf, lord-of-deceit,
one-head-looks-back, agent-of-discord, mind-like-a-steel-trap, malign-presence)
were mis-encoded as `cp-gain{enemy-stratagem-tax}` → migrated to `{operation:
increase, applies_to: stratagems-targeting-bearer}`. mirror-of-fates re-authored
as a two-clause sequence. The "use a Stratagem for 0CP" reduction stays on
`cp-refund` (49 uses). `operation:set-to` / `applies_to:stratagems-used-by-bearer`
are reserved (pinned by unit test). NB: `master-of-the-fleet` is a Deep Strike
granter, not a cost modifier (original backlog mis-cited it).

## 5. targeting-permission (effect, was "targetable-only-if") — LANDED 1.0.14

`single-effect` leaf `targeting-permission { attack_type, gate, range? }` — the
bearer can only be *selected as a target* of (ranged) attacks if a selection-time
gate holds. Framed as a condition originally, but a targeting restriction has no
condition host, so it is an effect leaf sibling to `attack-restriction`
(resolution-time) and `targeting-range-limit` (the bearer's own offence).
Replaces the opaque baked-range slugs (`ranged-attack-only-within-range-18`,
`ranged-attacks-only-within-18`, `within-18-inches`, and the deleted
`cannot-be-targeted-unless-closest-or-within-12`). The deleted slug was the core
**Lone Operative** encoding (16 factions) — migrated faithfully to `{ranged,
within-range, 12}` (the slug name's "closest" clause was spurious for Lone
Operative); fog-of-dreams / illusions-of-tzeentch → `{ranged, within-range, 18}`,
haloed-in-soulfire → `{any, within-range, 18}`. `gate: closest-eligible |
closest-or-within-range` reserved (pinned by unit test). orbital-oversight keeps
its `ranged-attack-range` slug — it carries a Lone-Operative-conditional 6" range
the leaf cannot yet express.

## Dropped

- **sticky-objective** — already expressible via `objective-control-modifier
  {sticky:true}` (26 uses across nearly every faction; describer renders the
  "retains control until the enemy retakes" prose). The loose match regex
  inflated it; its "example" ids (liberator-armoured-speartip,
  hunters-trail-company-of-hunters) do not exist in the data.
- **rule-replacement / transformation** — 0 real battle-time matches; the lone
  daemonic-allegiance is a list-building keyword choice (re-type bucket), now
  covered by `rule-state`.

## How each shape gets added

Same cross-language parity path #1 takes: schema enum → four describers
(byte-identical) → cruncher (handle or fail-safe `unsupported`) → conformance
golden (driven by re-authoring real abilities, since gen-conformance
auto-discovers types from data) → SPEC_VERSION bump → four version files in
lockstep. Patch releases (additive tool-surface + SPEC bump), not minors.
