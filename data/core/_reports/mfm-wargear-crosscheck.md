# BSData ↔ GW MFM dump wargear cross-check

Structural agreement on which units carry wargear options. Item-level names
drift between sources (and the dump lists base/default items, not swap deltas),
so this checks unit-level presence + whether option weapon-id sets overlap.

- **Both sources list options:** 439
  - of which share ≥1 weapon id: 436
  - of which share NO weapon id (genuine disagreement — investigate): 3
- **BSData-only (GW dump lists none — check for over-extraction):** 34
- **GW-dump-only (BSData missed — see triage reports):** 678

## BSData-only units (BSData extracted options, GW dump has none)

_NB: Space Marine chapter units (Crusader Squad, Deathwing, Kill Teams, …)_
_appear here because the dump keys them to per-chapter faction keywords that_
_don't consolidate to `adeptus-astartes` — a dump-side mapping artifact, not_
_over-extraction. The unit genuinely has the options BSData found._

- adeptus-astartes/crusader-squad
- adeptus-astartes/sword-brethren-squad
- adeptus-astartes/death-company-marines-with-jump-packs
- adeptus-astartes/sanguinary-guard
- adeptus-astartes/death-company-marines-with-bolt-rifles
- adeptus-astartes/ravenwing-command-squad
- adeptus-astartes/deathwing-knights
- adeptus-astartes/deathwing-terminator-squad
- adeptus-astartes/deathwatch-terminator-squad
- adeptus-astartes/fortis-kill-team
- adeptus-astartes/indomitor-kill-team
- adeptus-astartes/spectrus-kill-team
- adeptus-astartes/deathwatch-veterans
- adeptus-astartes/talonstrike-kill-team
- adeptus-astartes/wolf-guard-terminators
- adeptus-astartes/wulfen
- adeptus-astartes/thunderwolf-cavalry
- adeptus-astartes/wulfen-with-storm-shields
- adeptus-astartes/castellan
- adeptus-astartes/marshal
- adeptus-astartes/execrator
- adeptus-astartes/baal-predator
- adeptus-astartes/blood-angels-captain
- adeptus-astartes/death-company-captain-with-jump-pack
- adeptus-astartes/corvus-blackstar
- adeptus-astartes/sammael
- adeptus-astartes/nephilim-jetfighter
- adeptus-astartes/land-speeder-vengeance
- adeptus-astartes/ravenwing-darkshroud
- adeptus-astartes/bjorn-the-fell-handed
- adeptus-astartes/wulfen-dreadnought
- adeptus-astartes/venerable-dreadnought
- adeptus-astartes/wolf-guard-battle-leader
- tau-empire/tidewall-shieldline

## Both list options but share no weapon id (investigate)

- adeptus-astartes/repulsor
- agents-of-the-imperium/subductor-squad
- death-guard/deathshroud-terminators

