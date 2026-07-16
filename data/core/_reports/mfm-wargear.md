# MFM wargear — APPLIED

Dump-primary `default_weapon_ids` + wargear-options. BSData retained only for
dump-absent (repo-only) units. Unresolved weapon names are triaged, never guessed.

| Dir | Matched | Options | Defaults Δ | Synth | Unresolved | Fuzzy | Notes | New-in-dump | Repo-only (fallback) |
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| adepta-sororitas | 37 | 56 | 0 | 0 | 12 | 0 | 0 | 0 | 0 |
| adeptus-astartes | 194 | 271 | 0 | 0 | 58 | 1 | 7 | 0 | 0 |
| adeptus-custodes | 35 | 23 | 0 | 0 | 7 | 0 | 0 | 0 | 0 |
| adeptus-mechanicus | 38 | 34 | 0 | 0 | 10 | 0 | 0 | 0 | 0 |
| aeldari | 76 | 93 | 6 | 0 | 32 | 2 | 0 | 0 | 0 |
| agents-of-the-imperium | 33 | 47 | 0 | 0 | 42 | 2 | 4 | 0 | 0 |
| astra-militarum | 75 | 159 | 0 | 0 | 33 | 0 | 1 | 0 | 0 |
| chaos-daemons | 53 | 14 | 0 | 0 | 6 | 0 | 0 | 92 | 0 |
| chaos-knights | 20 | 20 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| chaos-space-marines | 58 | 96 | 0 | 0 | 11 | 3 | 3 | 99 | 0 |
| death-guard | 35 | 31 | 0 | 0 | 4 | 0 | 0 | 6 | 0 |
| drukhari | 27 | 39 | 0 | 0 | 3 | 1 | 0 | 0 | 0 |
| emperors-children | 20 | 24 | 0 | 0 | 0 | 0 | 4 | 6 | 0 |
| genestealer-cults | 28 | 17 | 0 | 0 | 18 | 1 | 0 | 0 | 0 |
| grey-knights | 30 | 41 | 0 | 0 | 14 | 1 | 0 | 0 | 0 |
| imperial-knights | 23 | 31 | 0 | 0 | 0 | 0 | 1 | 0 | 0 |
| leagues-of-votann | 26 | 32 | 0 | 0 | 18 | 1 | 1 | 0 | 0 |
| necrons | 57 | 25 | 2 | 0 | 23 | 0 | 0 | 0 | 0 |
| orks | 63 | 51 | 0 | 0 | 20 | 2 | 0 | 0 | 0 |
| tau-empire | 47 | 87 | 4 | 0 | 23 | 0 | 0 | 0 | 0 |
| thousand-sons | 32 | 41 | 0 | 0 | 6 | 0 | 0 | 6 | 0 |
| tyranids | 57 | 18 | 0 | 0 | 2 | 1 | 0 | 0 | 0 |
| world-eaters | 29 | 40 | 0 | 0 | 0 | 0 | 0 | 5 | 0 |
| **TOTAL** | **1093** | **1290** | **12** | **0** | **342** | **15** | **21** | **214** | **0** |

## adepta-sororitas

**Unresolved weapon names (no repo id — option/default incomplete):**
- `Salvationist Medikit` — sanctifiers
- `Stocks and Fists` — sanctuary-guardians-battle-sisters-squad

## adeptus-astartes

**Fuzzy-resolved spelling drift (GW name → repo id, edit-distance ≤1):**
- `Omnissian power axe` → `omnissiah-power-axe` (was `omnissian-power-axe`)

**Unresolved weapon names (no repo id — option/default incomplete):**
- `Armoured Impact` — assault-force-land-speeder
- `Banner of Macragge` — victrix-honour-guard
- `Book of Salvation` — ezekiel
- `Centurion assault launcher` — centurion-assault-squad
- `Chainsword` — askars-wolfpack-blood-claws, assault-force-intercessor-squad, sanguinary-spearhead-assault-intercessor-squad, vow-sworn-crusader-squad, vow-sworn-sword-brethren-squad
- `Feral Claws` — askars-wolfpack-wulfen
- `Fulmination` — assault-force-librarian
- `Grenade Launcher` — assault-force-intercessor-squad
- `Knives and Fists` — assault-force-intercessor-squad, vengeful-brethren-hellblaster-squad, vengeful-brethren-intercessor-squad, vow-sworn-crusader-squad
- `Orbital Comms Array (Aura)` — impulsor
- `Refractor Field` — wardens-of-ultramar
- `Terminator Storm Shield` — ancient-in-terminator-armour
- `The Lion Helm` — azrael
- `Watcher in the Dark` — deathwing-knights, deathwing-terminator-squad

**Notes (cap approximations / alternates):**
- victrix-honour-guard: Chapter Ancient: no model_count — base_miniature_loadout fallback
- victrix-honour-guard: Chapter Champion: no model_count — base_miniature_loadout fallback
- outrider-squad: Invader ATV: no model_count — base_miniature_loadout fallback
- sword-brethren-squad: alternate loadout_choice_set f0e5f28e (Sword Brother) — review
- decimus-kill-team: Deathwatch Veteran: no model_count — base_miniature_loadout fallback
- decimus-kill-team: composition has row(s) absent from the dump (Watch Sergeant) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- talonstrike-kill-team: composition has row(s) absent from the dump (Kill Team Heavy Intercessor with Jump Pack) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized

## adeptus-custodes

**Unresolved weapon names (no repo id — option/default incomplete):**
- `Praesidium Shield` — custodian-guard, gilded-blades-custodian-guard, shield-captain
- `Tarsis buckler` — venatari-custodians

## adeptus-mechanicus

**Unresolved weapon names (no repo id — option/default incomplete):**
- `Alpha’s Combat Artefact` — purge-corps-skitarii-vanguard
- `Gun Stocks` — purge-corps-skitarii-vanguard
- `Talons` — purge-corps-pteraxii-sterylizors

## aeldari

**Fuzzy-resolved spelling drift (GW name → repo id, edit-distance ≤1):**
- `Fire Axe` → `the-fire-axe` (was `fire-axe`)
- `Kha-vir` → `kha-vir-the-sword-of-sorrows` (was `kha-vir`)

**Unresolved weapon names (no repo id — option/default incomplete):**
- `Aspect Shrine Token` — dark-reapers, dire-avengers, fire-dragons, howling-banshees, striking-scorpions, swooping-hawks, warp-spiders
- `Channeller Stones` — corsair-voidscarred
- `Faolchú` — corsair-voidscarred
- `Flip Belt` — death-jester, shadowseer, solitaire, troupe, troupe-master
- `Forceshield` — wraithblades
- `Serpent shield` — storm-guardians
- `Shadow Field` — ynnari-archon
- `Weapon Strike` — kygharils-protectors-dire-avengers, kygharils-protectors-warp-spiders

## agents-of-the-imperium

**Fuzzy-resolved spelling drift (GW name → repo id, edit-distance ≤1):**
- `Agent’s Firearm` → `agent-firearm` (was `agents-firearm`)
- `Nuncio-acquila` → `nuncio-aquila` (was `nuncio-acquila`)

**Unresolved weapon names (no repo id — option/default incomplete):**
- `Agent’s Implement` — inquisitors-hand-inquisitorial-agents
- `Arbites Medi-kit` — exaction-squad
- `Combat Shotgun` — inquisitors-hand-vigilant-squad
- `Endurant Shield` — imperial-navy-breachers
- `Glovodan Psyber‐eagle` — inquisitor-coteaz
- `Grenade Launcher` — inquisitors-hand-vigilant-squad
- `Gun Stocks` — inquisitors-hand-vigilant-squad
- `Healing serum` — rogue-trader-entourage
- `Salvationist Medikit` — sanctifiers
- `Shotpistol` — inquisitors-hand-vigilant-squad
- `Simulacrum Imperialis` — sanctifiers, sisters-of-battle-squad
- `Soulguilt Scanner` — exaction-squad
- `Tome‐skull` — inquisitorial-agents

**Notes (cap approximations / alternates):**
- voidsmen-at-arms: Voidsman: 2 default loadout groups — base_miniature_loadout fallback
- aquila-kill-team: Deathwatch Veteran: no model_count — base_miniature_loadout fallback
- aquila-kill-team: composition has row(s) absent from the dump (Watch Sergeant) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- imperial-navy-breachers: Navis Armsman: 3 default loadout groups — base_miniature_loadout fallback

## astra-militarum

**Unresolved weapon names (no repo id — option/default incomplete):**
- `Alchemyk Counteragents` — krieg-command-squad
- `Aquiline Prow` — commissar-graves
- `Death Korps Medi-pack` — death-korps-of-krieg
- `Gun Stocks` — draydens-lance-command-squad, draydens-lance-kasrkin
- `Medi-pack` — cadian-command-squad, catachan-command-squad, militarum-tempestus-command-squad
- `Melta Mine` — kasrkin
- `Remote Mine` — krieg-combat-engineers
- `Servo-scribes` — krieg-command-squad
- `Vox‑relay Beacon` — cadian-recon-squad

**Notes (cap approximations / alternates):**
- krieg-command-squad: composition has row(s) absent from the dump (Veteran Guardsman (Chainsword), Veteran Guardsman (Servo-scribes), Veteran Guardsman (Master Vox), Veteran Guardsman (Regimental Standard), Veteran Guardsman (Boltgun)) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized

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
- `Blades and Cudgels` — zarkans-daemonkin-cultist-mob
- `Fists and Knives` — zarkans-daemonkin-legionaries
- `Voice Eater` — nemesis-claw

**Notes (cap approximations / alternates):**
- havocs: Havoc: non-uniform default count — base_miniature_loadout fallback
- chaos-terminator-squad: alternate loadout_choice_set bbd655f9 (Chaos Terminator) — review
- chaos-terminator-squad: alternate loadout_choice_set c1fa45a8 (Terminator Champion) — review

## death-guard

**Unresolved weapon names (no repo id — option/default incomplete):**
- `Icon of Despair (Aura)` — deathshroud-terminators, plague-marines
- `Numerological Artefacts` — septimol-fulg-maggot-lords-tallyman

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
- callous-blades-infractors: Obsessionist: no model_count — base_miniature_loadout fallback
- callous-blades-infractors: Infractor: no model_count — base_miniature_loadout fallback

## genestealer-cults

**Fuzzy-resolved spelling drift (GW name → repo id, edit-distance ≤1):**
- `Leader’s bio-weapons` → `leaders-cult-weapons` (was `leaders-bio-weapons`)

**Unresolved weapon names (no repo id — option/default incomplete):**
- `Alchemicus Familiar` — biophagus
- `Leader’s Weapon Symbiote` — claw-of-ascension-hybrid-metamorphs
- `Missile Launcher` — claw-of-ascension-achilles-ridgerunner
- `Stolen Blade` — claw-of-ascension-atalan-jackals, shanus-daskovian
- `Stolen Firearms` — claw-of-ascension-atalan-jackals

## grey-knights

**Fuzzy-resolved spelling drift (GW name → repo id, edit-distance ≤1):**
- `Omnissian power axe` → `omnissiah-power-axe` (was `omnissian-power-axe`)

**Unresolved weapon names (no repo id — option/default incomplete):**
- `Ancient’s Banner` — brotherhood-terminator-squad, paladin-squad
- `Ceramite Fists` — crowes-sanctifiers-strike-squad
- `Dreadnought Fist` — crowes-sanctifiers-venerable-dreadnought

## imperial-knights

**Notes (cap approximations / alternates):**
- sir-hekhtur: Sir Hekhtur: no model_count — base_miniature_loadout fallback

## leagues-of-votann

**Fuzzy-resolved spelling drift (GW name → repo id, edit-distance ≤1):**
- `Panspectral Scanner` → `pan-spectral-scanner` (was `panspectral-scanner`)

**Unresolved weapon names (no repo id — option/default incomplete):**
- `Armoured Fists` — bane-slayers-bulwark-hearthkyn-warriors
- `Multiwave Comms Array` — hernkyn-pioneers
- `Powered Strikes` — bane-slayers-bulwark-brokhyr-thunderkyn
- `Preymark Crest` — ironkin-steeljacks-with-heavy-volkanite-disintegrators, ironkin-steeljacks-with-melee-weapons
- `Rollbar Searchlight` — hernkyn-pioneers
- `Theyn’s Armaments` — bane-slayers-bulwark-hearthkyn-warriors

**Notes (cap approximations / alternates):**
- brokhyr-iron-master: composition has row(s) absent from the dump (E-COG with Autoch-pattern Bolt Pistol, E-COG with Plasma Torch, E-COG with Manipulator Arms) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized

## necrons

**Unresolved weapon names (no repo id — option/default incomplete):**
- `Antimatter Meteor` — tesseract-vault
- `Blade tail and whip coils` — nekrosor-ammentar
- `Combat Attachments` — amonhotekhs-guard-necron-warriors
- `Cosmic Fire` — tesseract-vault
- `Fabricator Claw Array (Aura)` — canoptek-spyders
- `Gloom Prism (Aura)` — canoptek-spyders
- `Hyperphase Blades` — amonhotekhs-guard-skorpekh-destroyers
- `Nanoscarab Projector` — canoptek-macrocytes
- `Nullstone Field Generator (Aura)` — nekrosor-ammentar
- `Time’s Arrow` — tesseract-vault
- `Weapons of the Final Triarch` — the-silent-king

## orks

**Fuzzy-resolved spelling drift (GW name → repo id, edit-distance ≤1):**
- `Choppas` → `choppa` (was `choppas`)
- `Twin killsaws` → `twin-killsaw` (was `twin-killsaws`)

**Unresolved weapon names (no repo id — option/default incomplete):**
- `Ammo Runt` — flash-gitz, nobz
- `Blasta` — ardmob-gretchin
- `Bomb Squig` — kommandos, squighog-boyz
- `Distraction Grot` — kommandos
- `Grot Assistant` — big-mek-with-shokk-attack-gun
- `Grot Oiler` — big-mek-in-mega-armour
- `Kustom Choppa` — ardmob-warboss
- `Lobbin' Bombs` — ardmob-gretchin
- `Psychic Powers` — ardmob-weirdboy
- `Pulsa Rokkit` — tankbustas
- `Scavenged Shivs` — ardmob-gretchin
- `Waaagh! Staff` — ardmob-weirdboy

## tau-empire

**Unresolved weapon names (no repo id — option/default incomplete):**
- `Advanced Guardian Drone` — commander-shadowsun
- `Command-link Drone (Aura)` — commander-shadowsun
- `Gun Stocks` — sudden-dawn-cadre-breacher-team, sudden-dawn-cadre-pathfinder-team
- `Hover Drone` — ethereal
- `MV15 Gun Drone` — the-twin-lance
- `Missile Drone` — broadside-battlesuits, riptide-battlesuit
- `Pech’ra` — kroot-farstalkers

## thousand-sons

**Unresolved weapon names (no repo id — option/default incomplete):**
- `Stocks and Fists` — prism-of-zadophon-rubric-marines

## tyranids

**Fuzzy-resolved spelling drift (GW name → repo id, edit-distance ≤1):**
- `Screamer-Killer talons` → `scream-killer-talons` (was `screamer-killer-talons`)

**Unresolved weapon names (no repo id — option/default incomplete):**
- `Chitinous Talons` — vardenghast-swarm-von-ryans-leapers

