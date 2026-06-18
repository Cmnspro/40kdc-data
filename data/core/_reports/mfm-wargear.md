# MFM wargear — APPLIED

Dump-primary `default_weapon_ids` + wargear-options. BSData retained only for
dump-absent (repo-only) units. Unresolved weapon names are triaged, never guessed.

| Dir | Matched | Options | Defaults Δ | Unresolved | Fuzzy | Notes | New-in-dump | Repo-only (fallback) |
|---|--:|--:|--:|--:|--:|--:|--:|--:|
| adepta-sororitas | 32 | 55 | 29 | 1 | 0 | 2 | 5 | 0 |
| adeptus-astartes | 172 | 264 | 146 | 16 | 1 | 1 | 22 | 0 |
| adeptus-custodes | 31 | 22 | 14 | 8 | 0 | 0 | 4 | 0 |
| adeptus-mechanicus | 31 | 34 | 16 | 0 | 0 | 0 | 7 | 0 |
| aeldari | 72 | 92 | 45 | 21 | 3 | 5 | 4 | 0 |
| agents-of-the-imperium | 28 | 47 | 22 | 9 | 1 | 0 | 5 | 0 |
| astra-militarum | 66 | 155 | 53 | 12 | 0 | 2 | 9 | 0 |
| chaos-daemons | 53 | 14 | 26 | 5 | 0 | 0 | 92 | 0 |
| chaos-knights | 20 | 20 | 20 | 0 | 0 | 0 | 0 | 0 |
| chaos-space-marines | 53 | 91 | 47 | 26 | 3 | 2 | 104 | 0 |
| death-guard | 30 | 24 | 18 | 34 | 0 | 2 | 11 | 0 |
| drukhari | 23 | 39 | 19 | 2 | 1 | 0 | 4 | 0 |
| emperors-children | 17 | 24 | 5 | 0 | 0 | 2 | 9 | 0 |
| genestealer-cults | 24 | 17 | 20 | 2 | 1 | 3 | 4 | 0 |
| grey-knights | 26 | 39 | 19 | 8 | 1 | 3 | 4 | 0 |
| imperial-knights | 22 | 28 | 20 | 0 | 0 | 0 | 1 | 0 |
| leagues-of-votann | 22 | 31 | 11 | 6 | 1 | 0 | 4 | 0 |
| necrons | 52 | 25 | 29 | 12 | 0 | 0 | 5 | 0 |
| orks | 53 | 49 | 46 | 5 | 1 | 0 | 10 | 0 |
| tau-empire | 43 | 74 | 31 | 13 | 0 | 0 | 4 | 0 |
| thousand-sons | 28 | 36 | 16 | 34 | 0 | 0 | 10 | 0 |
| tyranids | 51 | 18 | 29 | 0 | 1 | 0 | 6 | 0 |
| world-eaters | 25 | 41 | 14 | 0 | 0 | 0 | 9 | 0 |
| **TOTAL** | **974** | **1239** | **695** | **214** | **14** | **22** | **333** | **0** |

## adepta-sororitas

**Unresolved weapon names (no repo id — option/default incomplete):**
- `Salvationist Medikit` — sanctifiers

**Notes (cap approximations / alternates):**
- seraphim-squad: non-integer cap 4/10 on Seraphim — approximated to per_n_models 3 (advisory maximal only)
- seraphim-squad: non-integer cap 4/10 on Seraphim — approximated to per_n_models 3 (advisory maximal only)

## adeptus-astartes

**Fuzzy-resolved spelling drift (GW name → repo id, edit-distance ≤1):**
- `Omnissian power axe` → `omnissiah-power-axe` (was `omnissian-power-axe`)

**Unresolved weapon names (no repo id — option/default incomplete):**
- `Banner of Macragge` — victrix-honour-guard
- `Book of Salvation` — ezekiel
- `Centurion assault launcher` — centurion-assault-squad
- `Death Totem` — wulfen, wulfen-with-storm-shields
- `Orbital Comms Array (Aura)` — impulsor
- `Refractor Field` — wardens-of-ultramar
- `Terminator Storm Shield` — ancient-in-terminator-armour
- `The Lion Helm` — azrael

**Notes (cap approximations / alternates):**
- sword-brethren-squad: alternate loadout_choice_set f0e5f28e (Sword Brother) — review

## adeptus-custodes

**Unresolved weapon names (no repo id — option/default incomplete):**
- `Praesidium Shield` — custodian-guard, shield-captain
- `Tarsis buckler` — venatari-custodians
- `Vexilla` — allarus-custodians, custodian-guard, custodian-wardens

## aeldari

**Fuzzy-resolved spelling drift (GW name → repo id, edit-distance ≤1):**
- `Blade of Destruction` → `strike` (was `blade-of-destruction`)
- `Fire Axe` → `the-fire-axe` (was `fire-axe`)
- `Kha-vir` → `kha-vir-the-sword-of-sorrows` (was `kha-vir`)

**Unresolved weapon names (no repo id — option/default incomplete):**
- `Channeller Stones` — corsair-voidscarred
- `Faolchú` — corsair-voidscarred
- `Flip Belt` — death-jester, shadowseer, solitaire, troupe, troupe-master
- `Forceshield` — wraithblades
- `Serpent shield` — storm-guardians
- `Shadow Field` — ynnari-archon

**Notes (cap approximations / alternates):**
- corsair-skyreavers: non-integer cap 2/5 on Skyreaver — approximated to per_n_models 3 (advisory maximal only)
- troupe: non-integer cap 4/10 on Player — approximated to per_n_models 3 (advisory maximal only)
- troupe: non-integer cap 4/10 on Lead Player — approximated to per_n_models 3 (advisory maximal only)
- troupe: non-integer cap 4/10 on Player — approximated to per_n_models 3 (advisory maximal only)
- troupe: non-integer cap 4/10 on Lead Player — approximated to per_n_models 3 (advisory maximal only)

## agents-of-the-imperium

**Fuzzy-resolved spelling drift (GW name → repo id, edit-distance ≤1):**
- `Nuncio-acquila` → `nuncio-aquila` (was `nuncio-acquila`)

**Unresolved weapon names (no repo id — option/default incomplete):**
- `Arbites Medi-kit` — exaction-squad
- `Endurant Shield` — imperial-navy-breachers
- `Glovodan Psyber‐eagle` — inquisitor-coteaz
- `Healing serum` — rogue-trader-entourage
- `Salvationist Medikit` — sanctifiers
- `Simulacrum Imperialis` — sanctifiers, sisters-of-battle-squad
- `Soulguilt Scanner` — exaction-squad

## astra-militarum

**Unresolved weapon names (no repo id — option/default incomplete):**
- `Alchemyk Counteragents` — krieg-command-squad
- `Death Korps Medi-pack` — death-korps-of-krieg
- `Medi-pack` — cadian-command-squad, catachan-command-squad, militarum-tempestus-command-squad
- `Melta Mine` — kasrkin
- `Remote Mine` — krieg-combat-engineers
- `Servo-scribes` — krieg-command-squad

**Notes (cap approximations / alternates):**
- tempestus-scions: non-integer cap 4/10 on Tempestus Scion — approximated to per_n_models 3 (advisory maximal only)
- tempestus-scions: non-integer cap 4/10 on Tempestus Scion — approximated to per_n_models 3 (advisory maximal only)

## chaos-daemons

**Unresolved weapon names (no repo id — option/default incomplete):**
- `Brass Collar of Bloody Vengeance` — karanak
- `Collar of Khorne` — flesh-hounds

## chaos-space-marines

**Fuzzy-resolved spelling drift (GW name → repo id, edit-distance ≤1):**
- `Hades battle cannon` → `defiler-cannon` (was `hades-battle-cannon`)
- `Shearing claws` → `defiler-claws` (was `shearing-claws`)
- `Tyrant’s Claw heavy flamer` → `ranged` (was `tyrants-claw-heavy-flamer`)

**Unresolved weapon names (no repo id — option/default incomplete):**
- `Ectoplasma destructor` — defiler
- `Electroscourge` — defiler
- `Hades lascannon` — defiler
- `Heavy baleflamer` — defiler
- `Heavy missile launcher` — defiler
- `Heavy reaper autocannon` — defiler
- `Voice Eater` — nemesis-claw

**Notes (cap approximations / alternates):**
- chaos-terminator-squad: alternate loadout_choice_set bbd655f9 (Chaos Terminator) — review
- chaos-terminator-squad: alternate loadout_choice_set c1fa45a8 (Terminator Champion) — review

## death-guard

**Unresolved weapon names (no repo id — option/default incomplete):**
- `Ectoplasma destructor` — defiler
- `Electroscourge` — defiler
- `Excruciator cannon` — defiler
- `Hades battle cannon` — defiler
- `Hades lascannon` — defiler
- `Heavy baleflamer` — defiler
- `Heavy missile launcher` — defiler
- `Heavy reaper autocannon` — defiler
- `Icon of Despair (Aura)` — deathshroud-terminators, plague-marines
- `Magma cutters` — defiler
- `Shearing claws` — defiler

**Notes (cap approximations / alternates):**
- blightlord-terminators: non-integer cap 3/5 on Blightlord Champion — approximated to per_n_models 2 (advisory maximal only)
- blightlord-terminators: non-integer cap 3/5 on Blightlord Champion — approximated to per_n_models 2 (advisory maximal only)

## drukhari

**Fuzzy-resolved spelling drift (GW name → repo id, edit-distance ≤1):**
- `Macro-scalpel` → `maco-scalpel` (was `macro-scalpel`)

**Unresolved weapon names (no repo id — option/default incomplete):**
- `Shadowfield` — archon
- `Stimm-needler` — hand-of-the-archon

## emperors-children

**Notes (cap approximations / alternates):**
- chaos-terminators: alternate loadout_choice_set ce82b2b8 (Chaos Terminator) — review
- chaos-terminators: alternate loadout_choice_set dc056a28 (Terminator Champion) — review

## genestealer-cults

**Fuzzy-resolved spelling drift (GW name → repo id, edit-distance ≤1):**
- `Leader’s bio-weapons` → `leaders-cult-weapons` (was `leaders-bio-weapons`)

**Unresolved weapon names (no repo id — option/default incomplete):**
- `Alchemicus Familiar` — biophagus

**Notes (cap approximations / alternates):**
- acolyte-hybrids-with-hand-flamers: non-integer cap 4/10 on Acolyte Hybrid — approximated to per_n_models 3 (advisory maximal only)
- acolyte-hybrids-with-hand-flamers: non-integer cap 4/10 on Acolyte Leader — approximated to per_n_models 3 (advisory maximal only)
- acolyte-hybrids-with-autopistols: non-integer cap 6/10 on Acolyte Hybrid — approximated to per_n_models 2 (advisory maximal only)

## grey-knights

**Fuzzy-resolved spelling drift (GW name → repo id, edit-distance ≤1):**
- `Omnissian power axe` → `omnissiah-power-axe` (was `omnissian-power-axe`)

**Unresolved weapon names (no repo id — option/default incomplete):**
- `Ancient’s Banner` — brotherhood-terminator-squad, paladin-squad

**Notes (cap approximations / alternates):**
- purifier-squad: non-integer cap 4/10 on Purifier — approximated to per_n_models 3 (advisory maximal only)
- purifier-squad: non-integer cap 4/10 on Purifier — approximated to per_n_models 3 (advisory maximal only)
- paladin-squad: non-integer cap 2/5 on Paladin — approximated to per_n_models 3 (advisory maximal only)

## leagues-of-votann

**Fuzzy-resolved spelling drift (GW name → repo id, edit-distance ≤1):**
- `Panspectral Scanner` → `pan-spectral-scanner` (was `panspectral-scanner`)

**Unresolved weapon names (no repo id — option/default incomplete):**
- `Multiwave Comms Array` — hernkyn-pioneers
- `Preymark Crest` — ironkin-steeljacks-with-heavy-volkanite-disintegrators, ironkin-steeljacks-with-melee-weapons
- `Rollbar Searchlight` — hernkyn-pioneers

## necrons

**Unresolved weapon names (no repo id — option/default incomplete):**
- `Antimatter Meteor` — tesseract-vault
- `Blade tail and whip coils` — nekrosor-ammentar
- `Cosmic Fire` — tesseract-vault
- `Fabricator Claw Array (Aura)` — canoptek-spyders
- `Gloom Prism (Aura)` — canoptek-spyders
- `Nanoscarab Projector` — canoptek-macrocytes
- `Nullstone Field Generator (Aura)` — nekrosor-ammentar
- `Time’s Arrow` — tesseract-vault
- `Weapons of the Final Triarch` — the-silent-king

## orks

**Fuzzy-resolved spelling drift (GW name → repo id, edit-distance ≤1):**
- `Twin killsaws` → `twin-killsaw` (was `twin-killsaws`)

**Unresolved weapon names (no repo id — option/default incomplete):**
- `Bomb Squig` — kommandos, squighog-boyz
- `Grot Assistant` — big-mek-with-shokk-attack-gun
- `Grot Oiler` — big-mek-in-mega-armour
- `Pulsa Rokkit` — tankbustas

## tau-empire

**Unresolved weapon names (no repo id — option/default incomplete):**
- `Advanced Guardian Drone` — commander-shadowsun
- `Command-link Drone (Aura)` — commander-shadowsun
- `Hover Drone` — ethereal
- `MV15 Gun Drone` — the-twin-lance
- `Missile Drone` — broadside-battlesuits, riptide-battlesuit
- `Pech’ra` — kroot-farstalkers

## thousand-sons

**Unresolved weapon names (no repo id — option/default incomplete):**
- `Ectoplasma destructor` — defiler
- `Electroscourge` — defiler
- `Excruciator cannon` — defiler
- `Hades battle cannon` — defiler
- `Hades lascannon` — defiler
- `Heavy baleflamer` — defiler
- `Heavy missile launcher` — defiler
- `Heavy reaper autocannon` — defiler
- `Pyraflux magma cutters` — defiler
- `Shearing claws` — defiler

## tyranids

**Fuzzy-resolved spelling drift (GW name → repo id, edit-distance ≤1):**
- `Screamer-Killer talons` → `scream-killer-talons` (was `screamer-killer-talons`)

