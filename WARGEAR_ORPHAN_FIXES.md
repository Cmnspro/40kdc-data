# Wargear orphan fixes — 1.0.2 follow-up worklist

Branch `wnmitch/wargear-1.0.2` (commit `e870853c`) shipped the MFM-dump-primary wargear
ingest. It drove loadout **orphans 95 → 52** and populated **926/994** compositions. The
52 residual are documented in `KNOWN_LOADOUT_ORPHANS` (`tools/src/integrity.ts`) so the
zero-tolerance gate stays green. **Every one of these has a real loadout in the GW app —
this doc is the worklist to fill each hole and delete its allowlist entry.**

## How to work this list

1. An **orphan** = a weapon in a unit's `units.json` `weapon_ids` that is neither in any
   composition model's `default_weapon_ids` nor reachable through a `wargear-options.json`
   entry (`replaces`/`replacement`/`replacement_choice`) for that unit.
2. Fix the data (per category below), then **remove the matching line from
   `KNOWN_LOADOUT_ORPHANS`**. The integrity gate fails if a listed entry is no longer an
   orphan (stale) *and* if a new orphan appears — so the list stays honest as you go.
3. Re-derive + verify after a data edit:
   ```bash
   cd tools && npx tsx src/ingest-mfm.ts wargear --write   # if the fix is dump-derivable
   npm run build && npm run validate                        # gate must stay green
   # then regen the other bundles IN ORDER (python copies the rust bundle!):
   cargo run -p xtask -- bundle-data && python3 ../python/codegen/sync_bundle.py && bash ../go/codegen/sync.sh
   ```
4. Manual `unit-compositions.json` / `units.json` edits survive a re-ingest only if they're
   in `units.json` `weapon_ids` (ingest doesn't touch those) or encoded as `WEAPON_ALIASES`
   / `MANUAL_DEFAULTS` in `tools/src/mfm/wargear.ts` (ingest applies those). A raw
   `default_weapon_ids` edit will be overwritten by the next `wargear --write`.

The fullest map of dump↔repo weapon-name divergences is
`data/core/_reports/mfm-wargear.md` — **214 unresolved dump weapon names** (GW weapons whose
kebab'd name has no repo weapon id). Many fixes below come down to reconciling one of those.

---

## Category ① — Stale repo weapons absent from current GW data (11)

The repo `weapon_ids` carry old / Forge-World / Legends configs the live MFM dump no longer
lists for the datasheet. **Fix: confirm against the GW app, then cull the dead weapon from
the unit's `weapon_ids`** (these are share-registry-adjacent — a weapon-id removal; verify
nothing else references it). Exceptions noted inline.

| allowlist entry | note / GW-app check |
|---|---|
| `adeptus-astartes/venerable-dreadnought/armoured-feet` | Dump VD base = dreadnought-combat-weapon + storm-bolter + assault-cannon; arms offered = heavy-plasma-cannon, twin-lascannon, heavy-flamer, multi-melta. These 5 are not in the current datasheet → cull. |
| `adeptus-astartes/venerable-dreadnought/dreadnought-inferno-cannon` | as above (cull) |
| `adeptus-astartes/venerable-dreadnought/twin-autocannon` | as above (cull) |
| `adeptus-astartes/venerable-dreadnought/twin-heavy-bolter` | as above (cull) |
| `adeptus-astartes/venerable-dreadnought/twin-heavy-flamer` | as above (cull) |
| `adeptus-astartes/venerable-dreadnought/twin-lascannon` | **Dump DOES offer "Twin lascannon"** — likely a datasheet-disambiguation miss (3 VD-ish datasheets in dump). May resolve by matching the right datasheet rather than culling. |
| `adeptus-astartes/baal-predator/heavy-flamer-1` | `-1` numbered duplicate of heavy-flamer; reconcile/cull. |
| `adeptus-astartes/devastator-squad/storm-bolter` | confirm vs current Devastator datasheet. |
| `imperial-knights/canis-rex/chainbreaker-multi-laser` | **NOT stale** — dump item "Questoris multi-laser" has a profile literally named "Chainbreaker multi-laser" (BS2+, Sustained Hits 1). Fix = set canis-rex's `default_weapon_ids` to `chainbreaker-multi-laser` (it currently records `questoris-multi-laser`, the generic BS3 profile). |
| `tau-empire/the-twin-lance/fusion-eliminator` | confirm vs datasheet. |
| `astra-militarum/gaunts-ghosts/corbecs-hot-shot-lascarbine` | named-character weapon (Try Again Bragg got `braggs-autocannon` as a MANUAL_DEFAULT; Corbec needs the same). |

---

## Category ② — Collapsed single-figure miniatures (31)

The repo composition merges several **distinct named single-figure dump miniatures** (each
with its own fixed loadout) into one model-type, so a per-model `default_weapon_ids` can't
say which figure carries which weapon without forcing every model to carry it (illegal
carry-all). **Fix: restructure the composition into per-figure model rows (`min=max=1`)
each with its own `default_weapon_ids`.** This recomputes points tiers / allocation /
base-sizes — re-verify points after. Per-unit detail from the diagnosis:

- **`chaos-space-marines/masters-of-the-maelstrom`** (×6: absolvor-bolt-pistol, force-stave,
  laspistol, mind-wrench, power-sabre, reductor-array) — repo rows are Katar Garrix, The
  Enforcer, Corsair (bulk ×3). The 6 weapons belong to the named characters, not the bulk
  Corsair. Split into per-character rows.
- **`adeptus-astartes/wardens-of-ultramar`** (×4: astropathic-blast, bolt-rifle, force-stave,
  power-weapon) — dump has 6 unique named minis (Dainal Komelius, Gaius Silva, Aemelia
  Minervas, Ancient Gadriel, + the 2 already-modelled). bolt-rifle = Gadriel; force-stave =
  Dainal; power-weapon = Gaius & Aemelia. Model each named figure.
- **`adeptus-astartes/decimus-kill-team`** (xenophase-blade) — Watch Sergeant got plasma-pistol
  as a MANUAL_DEFAULT; xenophase-blade is another sergeant/veteran option. Confirm the figure.
- **`adeptus-astartes/spectrus-kill-team`** (deathwatch-occulus-bolt-carbine, paired-combat-blades)
- **`adeptus-astartes/fortis-kill-team`** (heavy-bolt-pistol, pyreblaster)
- **`adeptus-astartes/deathwing-terminator-squad`** (power-weapon) — the Deathwing Sergeant
  mini was collapsed into the rank-and-file row.
- **`adeptus-astartes/victrix-honour-guard`** (blades-of-honour) — Chapter Champion mini (pts 10) collapsed.
- **`adeptus-astartes/wolf-guard-headtakers`** (teeth-and-claws) — Hunting Wolf's weapon
  (min0-max2 row); could be a MANUAL_DEFAULT once confirmed it's always-on for that row.
- **`adepta-sororitas/sanctifiers`** & **`agents-of-the-imperium/sanctifiers`** (burning-hands)
  — the Miraculist (min2-max2) carries Burning Hands; add to that model's default.
- **`agents-of-the-imperium/rogue-trader-entourage`** (dartmask, death-cult-power-blade) —
  Lectro-Maester got voltaic-pistol as a MANUAL_DEFAULT; dartmask/death-cult-power-blade
  belong to other entourage figures (Canid? Rejuvenat Adept?).
- **`astra-militarum/krieg-command-squad`** (lasgun) — dump has 5 distinct Veteran Guardsman
  minis with different base loadouts collapsed into one row.
- **`leagues-of-votann/brokhyr-iron-master`** (autoch-pattern-bolt-pistol, manipulator-arms) —
  3 distinct E-COG minis; manipulator-arms is E-COG-C's sole wargear.
- **`aeldari/corsair-voidscarred`** (paired-hekatarii-blades) — dump has 5 minis (Way Seeker,
  Voidscarred, …); only Way Seeker is in the repo comp.
- **`chaos-daemons/pink-horrors`** (blue-claws, coruscating-blue-flames) — belong to the Blue
  Horror split-mini (Pink→Blue→Brimstone) not modelled as a separate row.
- **`chaos-daemons/blue-horrors`** (yellow-claws, coruscating-yellow-flames) — Brimstone Horror split-mini.
- **`chaos-daemons/flesh-hounds`** (burning-roar) — the **Gore Hound**, a mandatory separate
  miniature (min1/max1) absent from the repo comp.

(Full set, copy-paste for tracking:)
```
chaos-space-marines/masters-of-the-maelstrom/absolvor-bolt-pistol
chaos-space-marines/masters-of-the-maelstrom/force-stave
chaos-space-marines/masters-of-the-maelstrom/laspistol
chaos-space-marines/masters-of-the-maelstrom/mind-wrench
chaos-space-marines/masters-of-the-maelstrom/power-sabre
chaos-space-marines/masters-of-the-maelstrom/reductor-array
adeptus-astartes/wardens-of-ultramar/astropathic-blast
adeptus-astartes/wardens-of-ultramar/bolt-rifle
adeptus-astartes/wardens-of-ultramar/force-stave
adeptus-astartes/wardens-of-ultramar/power-weapon
adeptus-astartes/decimus-kill-team/xenophase-blade
adeptus-astartes/spectrus-kill-team/deathwatch-occulus-bolt-carbine
adeptus-astartes/spectrus-kill-team/paired-combat-blades
adeptus-astartes/fortis-kill-team/heavy-bolt-pistol
adeptus-astartes/fortis-kill-team/pyreblaster
adeptus-astartes/deathwing-terminator-squad/power-weapon
adeptus-astartes/victrix-honour-guard/blades-of-honour
adeptus-astartes/wolf-guard-headtakers/teeth-and-claws
adepta-sororitas/sanctifiers/burning-hands
agents-of-the-imperium/sanctifiers/burning-hands
agents-of-the-imperium/rogue-trader-entourage/dartmask
agents-of-the-imperium/rogue-trader-entourage/death-cult-power-blade
astra-militarum/krieg-command-squad/lasgun
leagues-of-votann/brokhyr-iron-master/autoch-pattern-bolt-pistol
leagues-of-votann/brokhyr-iron-master/manipulator-arms
aeldari/corsair-voidscarred/paired-hekatarii-blades
chaos-daemons/pink-horrors/blue-claws
chaos-daemons/pink-horrors/coruscating-blue-flames
chaos-daemons/blue-horrors/yellow-claws
chaos-daemons/blue-horrors/coruscating-yellow-flames
chaos-daemons/flesh-hounds/burning-roar
```

---

## Category ③ — Profile-mode / generic-label weapon id (1)

The repo weapon id is a generic profile label, not a named weapon. **Fix: rename the repo
weapon id to the real weapon name (and any references), or map it.**

- `aeldari/striking-scorpions/melee` — dump weapon is "Scorpion's claw" (`scorpions-claw`,
  which exists in `weapons.json`). Reconcile the unit's `weapon_ids`/default to use the named
  weapon rather than the `melee` profile label.

---

## Category ④ — Model-name-mismatch fixed weapons (9)

A weapon the dump carries on a specific miniature whose display name doesn't match any repo
composition model row, so it lands in neither a default nor (being unchanged across the
dump's loadout choices) a swap option. **Fix: reconcile the dump miniature name to the repo
composition model row** (rename the repo model, or add a `MANUAL_DEFAULTS` entry once the
right figure is confirmed). These were exposed by the delta-factoring (cleaner options).

```
adeptus-astartes/fortis-kill-team/castellan-launcher
adeptus-astartes/fortis-kill-team/plasma-incinerator
adeptus-astartes/indomitor-kill-team/twin-power-fists
adeptus-astartes/ravenwing-command-squad/black-knight-combat-weapon
adeptus-astartes/spectrus-kill-team/special-issue-bolt-pistol
astra-militarum/krieg-command-squad/close-combat-weapon
orks/breaka-boyz/choppa
tau-empire/kroot-carnivores/kroot-pistol       # Long-quill mini, absent from repo comp
tyranids/hyperadapted-raveners/ravener-heavy-claws-and-talons
```

---

## Where the machinery lives

- Ingest: `tools/src/mfm/wargear.ts` (`deriveWargear`, `runWargear`), wired in `tools/src/ingest-mfm.ts`.
  Overrides: `WEAPON_ALIASES` (dump-name→repo-id) and `MANUAL_DEFAULTS` (always-on weapon →
  single-figure model) near the top of `wargear.ts`.
- Gate + allowlist: `tools/src/integrity.ts` (`KNOWN_LOADOUT_ORPHANS`, the loadout-coverage pass).
- Loadout contract: `tools/src/data/loadout.ts` (+ `loadout.rs`/`loadout.py`/`go/loadout.go`);
  `base_loadout` is the pinned conformance op (`conformance/linked-api/cases.json`, SPEC 43).
- Reports: `data/core/_reports/mfm-wargear.md` (per-faction matched/unresolved/notes),
  `_private/mfm/unmatched-wargear.json` (the raw unresolved names).
