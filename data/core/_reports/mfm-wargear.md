# MFM wargear — APPLIED

Dump-primary `default_weapon_ids` + wargear-options. BSData retained only for
dump-absent (repo-only) units. Unresolved weapon names are triaged, never guessed.

| Dir | Matched | Options | Defaults Δ | Synth | Unresolved | Fuzzy | Notes | New-in-dump | Repo-only (fallback) |
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| adepta-sororitas | 32 | 56 | 0 | 0 | 2 | 0 | 6 | 5 | 0 |
| adeptus-astartes | 172 | 263 | 0 | 0 | 18 | 1 | 21 | 22 | 0 |
| adeptus-custodes | 31 | 22 | 0 | 0 | 8 | 0 | 6 | 4 | 0 |
| adeptus-mechanicus | 31 | 33 | 0 | 0 | 0 | 0 | 15 | 7 | 0 |
| aeldari | 72 | 92 | 0 | 0 | 28 | 3 | 21 | 4 | 0 |
| agents-of-the-imperium | 28 | 47 | 0 | 0 | 12 | 1 | 8 | 5 | 0 |
| astra-militarum | 66 | 155 | 0 | 0 | 12 | 0 | 14 | 9 | 0 |
| chaos-daemons | 53 | 14 | 0 | 0 | 6 | 0 | 4 | 92 | 0 |
| chaos-knights | 20 | 20 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| chaos-space-marines | 53 | 91 | 0 | 0 | 28 | 3 | 11 | 104 | 0 |
| death-guard | 30 | 24 | 0 | 0 | 39 | 0 | 7 | 11 | 0 |
| drukhari | 23 | 39 | 0 | 0 | 3 | 1 | 0 | 4 | 0 |
| emperors-children | 17 | 24 | 0 | 0 | 0 | 0 | 3 | 9 | 0 |
| genestealer-cults | 24 | 17 | 0 | 0 | 2 | 1 | 5 | 4 | 0 |
| grey-knights | 26 | 39 | 0 | 0 | 8 | 1 | 6 | 4 | 0 |
| imperial-knights | 22 | 28 | 0 | 0 | 0 | 0 | 1 | 1 | 0 |
| leagues-of-votann | 22 | 31 | 0 | 0 | 8 | 1 | 4 | 4 | 0 |
| necrons | 52 | 25 | 2 | 0 | 15 | 0 | 15 | 5 | 0 |
| orks | 53 | 49 | 0 | 0 | 8 | 1 | 3 | 10 | 0 |
| tau-empire | 43 | 74 | 2 | 0 | 13 | 0 | 8 | 4 | 0 |
| thousand-sons | 28 | 36 | 0 | 0 | 39 | 0 | 3 | 10 | 0 |
| tyranids | 51 | 17 | 0 | 0 | 0 | 1 | 14 | 6 | 0 |
| world-eaters | 25 | 40 | 0 | 0 | 0 | 0 | 6 | 9 | 0 |
| **TOTAL** | **974** | **1236** | **4** | **0** | **249** | **14** | **181** | **333** | **0** |

## adepta-sororitas

**Unresolved weapon names (no repo id — option/default incomplete):**
- `Salvationist Medikit` — sanctifiers

**Notes (cap approximations / alternates):**
- mortifiers: composition has row(s) absent from the dump (Mortifiers) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- arco-flagellants: composition has row(s) absent from the dump (Arco-flagellants) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- celestian-insidiants: composition has row(s) absent from the dump (Insidiant Superior) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- penitent-engines: composition has row(s) absent from the dump (Penitent Engines) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
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
- `Watcher in the Dark` — deathwing-knights, deathwing-terminator-squad

**Notes (cap approximations / alternates):**
- firestrike-servo-turrets: composition has row(s) absent from the dump (Firestrike Servo-turrets) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- victrix-honour-guard: Chapter Ancient: no model_count — base_miniature_loadout fallback
- victrix-honour-guard: Chapter Champion: no model_count — base_miniature_loadout fallback
- wardens-of-ultramar: composition has row(s) absent from the dump (Victrix Guard) while 4 dump row(s) are missing — manual reconcile, not auto-synthesized
- outrider-squad: Invader ATV: no model_count — base_miniature_loadout fallback
- sword-brethren-squad: alternate loadout_choice_set f0e5f28e (Sword Brother) — review
- sword-brethren-squad: composition has row(s) absent from the dump (Sword Brethren Squad) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- death-company-marines-with-bolt-rifles: composition has row(s) absent from the dump (Death Company Marines with Bolt Rifles) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- fenrisian-wolves: composition has row(s) absent from the dump (Fenrisian Wolves) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- deathwatch-veterans: composition has row(s) absent from the dump (Deathwatch Veteran) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- deathwatch-veterans: composition has row(s) absent from the dump (Deathwatch Veteran) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- wulfen-with-storm-shields: composition has row(s) absent from the dump (Wulfen with Storm Shields) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- death-company-marines-with-jump-packs: composition has row(s) absent from the dump (Death Company Marines with Jump Packs) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- ezekiel: composition has row(s) absent from the dump (Ezekiel) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- inner-circle-companions: composition has row(s) absent from the dump (Inner Circle Companions) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- decimus-kill-team: Deathwatch Veteran: no model_count — base_miniature_loadout fallback
- decimus-kill-team: composition has row(s) absent from the dump (Watch Sergeant) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- decimus-kill-team: composition has row(s) absent from the dump (Watch Sergeant) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- death-company-marines: composition has row(s) absent from the dump (Death Company Marines) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- talonstrike-kill-team: composition has row(s) absent from the dump (Kill Team Heavy Intercessor with Jump Pack) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- talonstrike-kill-team: composition has row(s) absent from the dump (Kill Team Heavy Intercessor with Jump Pack) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized

## adeptus-custodes

**Unresolved weapon names (no repo id — option/default incomplete):**
- `Praesidium Shield` — custodian-guard, shield-captain
- `Tarsis buckler` — venatari-custodians
- `Vexilla` — allarus-custodians, custodian-guard, custodian-wardens

**Notes (cap approximations / alternates):**
- allarus-custodians: composition has row(s) absent from the dump (Allarus Custodians) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- custodian-wardens: composition has row(s) absent from the dump (Custodian Wardens) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- aquilon-custodians: composition has row(s) absent from the dump (Aquilon Custodians) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- vertus-praetors: composition has row(s) absent from the dump (Vertus Praetors) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- sagittarum-custodians: composition has row(s) absent from the dump (Sagittarum Custodians) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- venatari-custodians: composition has row(s) absent from the dump (Venatari Custodians) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized

## adeptus-mechanicus

**Notes (cap approximations / alternates):**
- corpuscarii-electro-priests: composition has row(s) absent from the dump (Corpuscarii Electro-Priests) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- fulgurite-electro-priests: composition has row(s) absent from the dump (Fulgurite Electro-Priests) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- pteraxii-skystalkers: composition has row(s) absent from the dump (Pteraxii Alpha) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- pteraxii-sterylizors: composition has row(s) absent from the dump (Pteraxii Alpha) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- kataphron-breachers: composition has row(s) absent from the dump (Kataphron Breachers) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- kataphron-destroyers: composition has row(s) absent from the dump (Kataphron Destroyers) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- serberys-raiders: composition has row(s) absent from the dump (Serberys Alpha) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- serberys-sulphurhounds: composition has row(s) absent from the dump (Serberys Alpha) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- sicarian-infiltrators: composition has row(s) absent from the dump (Sicarian Princeps) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- sicarian-ruststalkers: composition has row(s) absent from the dump (Sicarian Princeps) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- skitarii-rangers: composition has row(s) absent from the dump (Ranger Alpha) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- skitarii-vanguard: composition has row(s) absent from the dump (Vanguard Alpha) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- sydonian-dragoons-with-radium-jezzails: composition has row(s) absent from the dump (Sydonian Dragoons with Radium Jezzails) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- sydonian-dragoons-with-taser-lances: composition has row(s) absent from the dump (Sydonian Dragoons with Taser Lances) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- kastelan-robots: composition has row(s) absent from the dump (Kastelan Robots) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized

## aeldari

**Fuzzy-resolved spelling drift (GW name → repo id, edit-distance ≤1):**
- `Blade of Destruction` → `strike` (was `blade-of-destruction`)
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

**Notes (cap approximations / alternates):**
- warlock-skyrunners: composition has row(s) absent from the dump (Warlock Skyrunners) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- rangers: composition has row(s) absent from the dump (Rangers) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- ynnari-venom: composition has row(s) absent from the dump (Ynnari Venom) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- skyweavers: composition has row(s) absent from the dump (Skyweavers) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- wraithblades: composition has row(s) absent from the dump (Wraithblades) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- the-yncarne: composition has row(s) absent from the dump (The Yncarne) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- the-visarch: composition has row(s) absent from the dump (The Visarch) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- windriders: composition has row(s) absent from the dump (Windriders) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- ynnari-succubus: composition has row(s) absent from the dump (Ynnari Succubus) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- ynnari-archon: composition has row(s) absent from the dump (Ynnari Archon) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- warlock-conclave: composition has row(s) absent from the dump (Warlock Conclave) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- shroud-runners: composition has row(s) absent from the dump (Shroud Runners) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- corsair-skyreavers: non-integer cap 2/5 on Skyreaver — approximated to per_n_models 3 (advisory maximal only)
- ynnari-raider: composition has row(s) absent from the dump (Ynnari Raider) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- war-walkers: composition has row(s) absent from the dump (War Walkers) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- troupe: non-integer cap 4/10 on Player — approximated to per_n_models 3 (advisory maximal only)
- troupe: non-integer cap 4/10 on Lead Player — approximated to per_n_models 3 (advisory maximal only)
- troupe: non-integer cap 4/10 on Player — approximated to per_n_models 3 (advisory maximal only)
- troupe: non-integer cap 4/10 on Lead Player — approximated to per_n_models 3 (advisory maximal only)
- vyper: composition has row(s) absent from the dump (Vyper) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- corsair-voidscarred: composition has row(s) absent from the dump (Way Seeker) while 2 dump row(s) are missing — manual reconcile, not auto-synthesized

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
- `Tome‐skull` — inquisitorial-agents

**Notes (cap approximations / alternates):**
- voidsmen-at-arms: Voidsman: 2 default loadout groups — base_miniature_loadout fallback
- rogue-trader-entourage: composition has row(s) absent from the dump (Canid, Lectro-Maester) while 2 dump row(s) are missing — manual reconcile, not auto-synthesized
- aquila-kill-team: Deathwatch Veteran: no model_count — base_miniature_loadout fallback
- aquila-kill-team: composition has row(s) absent from the dump (Watch Sergeant) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- imperial-navy-breachers: Navis Armsman: 3 default loadout groups — base_miniature_loadout fallback
- deathwatch-kill-team: composition has row(s) absent from the dump (Deathwatch Veteran) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- subductor-squad: composition has row(s) absent from the dump (Subductor Proctor) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- vigilant-squad: composition has row(s) absent from the dump (Vigilant Proctor) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized

## astra-militarum

**Unresolved weapon names (no repo id — option/default incomplete):**
- `Alchemyk Counteragents` — krieg-command-squad
- `Death Korps Medi-pack` — death-korps-of-krieg
- `Medi-pack` — cadian-command-squad, catachan-command-squad, militarum-tempestus-command-squad
- `Melta Mine` — kasrkin
- `Remote Mine` — krieg-combat-engineers
- `Servo-scribes` — krieg-command-squad

**Notes (cap approximations / alternates):**
- attilan-rough-riders: composition has row(s) absent from the dump (Attilan Rough Rider) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- armoured-sentinels: composition has row(s) absent from the dump (Armoured Sentinels) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- cadian-shock-troops: composition has row(s) absent from the dump (Cadian Sergeant, Cadian Shock Trooper) while 2 dump row(s) are missing — manual reconcile, not auto-synthesized
- death-korps-of-krieg: composition has row(s) absent from the dump (Watchmaster) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- scout-sentinels: composition has row(s) absent from the dump (Scout Sentinels) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- gaunts-ghosts: composition has row(s) absent from the dump (Brin Milo, Try Again Bragg) while 2 dump row(s) are missing — manual reconcile, not auto-synthesized
- cadian-heavy-weapons-squad: composition has row(s) absent from the dump (Cadian Heavy Weapons Squad) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- catachan-heavy-weapons-squad: composition has row(s) absent from the dump (Catachan Heavy Weapons Squad) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- catachan-jungle-fighters: composition has row(s) absent from the dump (Catachan Sergeant, Catachan Jungle Fighter) while 2 dump row(s) are missing — manual reconcile, not auto-synthesized
- field-ordnance-battery: composition has row(s) absent from the dump (Field Ordnance Battery) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- ratlings: composition has row(s) absent from the dump (Ratlings) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- tempestus-aquilons: composition has row(s) absent from the dump (Tempestor) while 2 dump row(s) are missing — manual reconcile, not auto-synthesized
- tempestus-scions: non-integer cap 4/10 on Tempestus Scion — approximated to per_n_models 3 (advisory maximal only)
- tempestus-scions: non-integer cap 4/10 on Tempestus Scion — approximated to per_n_models 3 (advisory maximal only)

## chaos-daemons

**Unresolved weapon names (no repo id — option/default incomplete):**
- `Brass Collar of Bloody Vengeance` — karanak
- `Collar of Khorne` — flesh-hounds

**Notes (cap approximations / alternates):**
- beasts-of-nurgle: composition has row(s) absent from the dump (Beasts of Nurgle) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- nurglings: composition has row(s) absent from the dump (Nurglings) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- hellflayers: composition has row(s) absent from the dump (Hellflayers) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- screamers: composition has row(s) absent from the dump (Screamers) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized

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
- traitor-guardsmen-squad: composition has row(s) absent from the dump (Traitor Guardsman) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- fellgor-beastmen: composition has row(s) absent from the dump (Fellgor Mangler, Fellgor Beastman) while 2 dump row(s) are missing — manual reconcile, not auto-synthesized
- cultist-mob: composition has row(s) absent from the dump (Cultist) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- havocs: Havoc: non-uniform default count — base_miniature_loadout fallback
- chaos-terminator-squad: alternate loadout_choice_set bbd655f9 (Chaos Terminator) — review
- chaos-terminator-squad: alternate loadout_choice_set c1fa45a8 (Terminator Champion) — review
- mutilators: composition has row(s) absent from the dump (Mutilators) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- masters-of-the-maelstrom: composition has row(s) absent from the dump (Corsair) while 3 dump row(s) are missing — manual reconcile, not auto-synthesized
- nemesis-claw: composition has row(s) absent from the dump (Nemesis Champion, Nemesis Claw) while 2 dump row(s) are missing — manual reconcile, not auto-synthesized
- obliterators: composition has row(s) absent from the dump (Obliterators) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- red-corsairs-raiders: composition has row(s) absent from the dump (Corsair Champion, Red Corsair) while 2 dump row(s) are missing — manual reconcile, not auto-synthesized

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
- foetid-bloat-drone-with-heavy-blight-launcher: composition has row(s) absent from the dump (Foetid Bloat-Drone with Heavy Blight Launcher) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- helbrute: composition has row(s) absent from the dump (Helbrute) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- myphitic-blight-haulers: composition has row(s) absent from the dump (Myphitic Blight-haulers) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- blightlord-terminators: non-integer cap 3/5 on Blightlord Champion — approximated to per_n_models 2 (advisory maximal only)
- blightlord-terminators: non-integer cap 3/5 on Blightlord Champion — approximated to per_n_models 2 (advisory maximal only)
- poxwalkers: composition has row(s) absent from the dump (Poxwalkers) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- foetid-bloat-drone: composition has row(s) absent from the dump (Foetid Bloat-Drone) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized

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
- noise-marines: composition has row(s) absent from the dump (Noise Champion) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized

## genestealer-cults

**Fuzzy-resolved spelling drift (GW name → repo id, edit-distance ≤1):**
- `Leader’s bio-weapons` → `leaders-cult-weapons` (was `leaders-bio-weapons`)

**Unresolved weapon names (no repo id — option/default incomplete):**
- `Alchemicus Familiar` — biophagus

**Notes (cap approximations / alternates):**
- acolyte-hybrids-with-hand-flamers: non-integer cap 4/10 on Acolyte Hybrid — approximated to per_n_models 3 (advisory maximal only)
- acolyte-hybrids-with-hand-flamers: non-integer cap 4/10 on Acolyte Leader — approximated to per_n_models 3 (advisory maximal only)
- achilles-ridgerunners: composition has row(s) absent from the dump (Achilles Ridgerunners) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- purestrain-genestealers: composition has row(s) absent from the dump (Purestrain Genestealers) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
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
- purgation-squad: composition has row(s) absent from the dump (Justicar) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- stormraven-gunship: composition has row(s) absent from the dump (Stormraven Gunship) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- interceptor-squad: composition has row(s) absent from the dump (Justicar) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized

## imperial-knights

**Notes (cap approximations / alternates):**
- sir-hekhtur: Sir Hekhtur: no model_count — base_miniature_loadout fallback

## leagues-of-votann

**Fuzzy-resolved spelling drift (GW name → repo id, edit-distance ≤1):**
- `Panspectral Scanner` → `pan-spectral-scanner` (was `panspectral-scanner`)

**Unresolved weapon names (no repo id — option/default incomplete):**
- `Multiwave Comms Array` — hernkyn-pioneers
- `Preymark Crest` — ironkin-steeljacks-with-heavy-volkanite-disintegrators, ironkin-steeljacks-with-melee-weapons
- `Rollbar Searchlight` — hernkyn-pioneers

**Notes (cap approximations / alternates):**
- hernkyn-pioneers: composition has row(s) absent from the dump (Hernkyn Pioneers) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- brokhyr-iron-master: composition has row(s) absent from the dump (E-COG with Autoch-pattern Bolt Pistol, E-COG with Plasma Torch, E-COG with Manipulator Arms) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- cthonian-beserks: composition has row(s) absent from the dump (Cthonian Beserks) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- kapricus-defenders: composition has row(s) absent from the dump (Kapricus Defenders) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized

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

**Notes (cap approximations / alternates):**
- deathmarks: composition has row(s) absent from the dump (Deathmarks) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- immortals: composition has row(s) absent from the dump (Immortals) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- tomb-blades: composition has row(s) absent from the dump (Tomb Blades) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- skorpekh-destroyers: composition has row(s) absent from the dump (Skorpekh Destroyers) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- flayed-ones: composition has row(s) absent from the dump (Flayed Ones) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- cryptothralls: composition has row(s) absent from the dump (Cryptothralls) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- canoptek-wraiths: composition has row(s) absent from the dump (Canoptek Wraiths) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- triarch-praetorians: composition has row(s) absent from the dump (Triarch Praetorians) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- canoptek-spyders: composition has row(s) absent from the dump (Canoptek Spyders) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- lokhust-destroyers: composition has row(s) absent from the dump (Lokhust Destroyers) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- necron-warriors: composition has row(s) absent from the dump (Necron Warriors) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- canoptek-scarab-swarms: composition has row(s) absent from the dump (Canoptek Scarab Swarms) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- ophydian-destroyers: composition has row(s) absent from the dump (Ophydian Destroyers) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- convergence-of-dominion: composition has row(s) absent from the dump (Convergence of Dominion) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- lokhust-heavy-destroyers: composition has row(s) absent from the dump (Lokhust Heavy Destroyers) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized

## orks

**Fuzzy-resolved spelling drift (GW name → repo id, edit-distance ≤1):**
- `Twin killsaws` → `twin-killsaw` (was `twin-killsaws`)

**Unresolved weapon names (no repo id — option/default incomplete):**
- `Ammo Runt` — flash-gitz, nobz
- `Bomb Squig` — kommandos, squighog-boyz
- `Distraction Grot` — kommandos
- `Grot Assistant` — big-mek-with-shokk-attack-gun
- `Grot Oiler` — big-mek-in-mega-armour
- `Pulsa Rokkit` — tankbustas

**Notes (cap approximations / alternates):**
- deffkoptas: composition has row(s) absent from the dump (Deffkoptas) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- mek-gunz: composition has row(s) absent from the dump (Mek Gunz) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- killa-kans: composition has row(s) absent from the dump (Killa Kans) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized

## tau-empire

**Unresolved weapon names (no repo id — option/default incomplete):**
- `Advanced Guardian Drone` — commander-shadowsun
- `Command-link Drone (Aura)` — commander-shadowsun
- `Hover Drone` — ethereal
- `MV15 Gun Drone` — the-twin-lance
- `Missile Drone` — broadside-battlesuits, riptide-battlesuit
- `Pech’ra` — kroot-farstalkers

**Notes (cap approximations / alternates):**
- kroot-farstalkers: composition has row(s) absent from the dump (Kill-Broker) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- firesight-team: composition has row(s) absent from the dump (Firesight Team) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- krootox-riders: composition has row(s) absent from the dump (Krootox Riders) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- kroot-hounds: composition has row(s) absent from the dump (Kroot Hounds) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- piranhas: composition has row(s) absent from the dump (Piranhas) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- breacher-team: composition has row(s) absent from the dump (Fire Warrior Shas’ui, Fire Warrior) while 2 dump row(s) are missing — manual reconcile, not auto-synthesized
- stealth-battlesuits: composition has row(s) absent from the dump (Stealth Battlesuit) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- kroot-carnivores: composition has row(s) absent from the dump (Kroot Trail Shaper) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized

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

**Notes (cap approximations / alternates):**
- sorcerer: composition has row(s) absent from the dump (Sorcerer) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- exalted-sorcerer-on-disc-of-tzeentch: composition has row(s) absent from the dump (Exalted Sorcerer on Disc of Tzeentch) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- sekhetar-robots: composition has row(s) absent from the dump (Sekhetar Robots) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized

## tyranids

**Fuzzy-resolved spelling drift (GW name → repo id, edit-distance ≤1):**
- `Screamer-Killer talons` → `scream-killer-talons` (was `screamer-killer-talons`)

**Notes (cap approximations / alternates):**
- carnifexes: composition has row(s) absent from the dump (Carnifexes) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- von-ryans-leapers: composition has row(s) absent from the dump (Von Ryan’s Leapers) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- termagants: composition has row(s) absent from the dump (Termagants) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- spore-mines: composition has row(s) absent from the dump (Spore Mines) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- raveners: composition has row(s) absent from the dump (Raveners) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- hormagaunts: composition has row(s) absent from the dump (Hormagaunts) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- gargoyles: composition has row(s) absent from the dump (Gargoyles) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- genestealers: composition has row(s) absent from the dump (Genestealers) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- barbgaunts: composition has row(s) absent from the dump (Barbgaunts) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- biovores: composition has row(s) absent from the dump (Biovores) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- pyrovores: composition has row(s) absent from the dump (Pyrovores) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- mucolid-spores: composition has row(s) absent from the dump (Mucolid Spores) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- ripper-swarms: composition has row(s) absent from the dump (Ripper Swarms) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- venomthropes: composition has row(s) absent from the dump (Venomthropes) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized

## world-eaters

**Notes (cap approximations / alternates):**
- heldrake: composition has row(s) absent from the dump (Heldrake) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- chaos-rhino: composition has row(s) absent from the dump (Chaos Rhino) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- goremongers: composition has row(s) absent from the dump (Goremonger Pack Leader, Goremonger) while 2 dump row(s) are missing — manual reconcile, not auto-synthesized
- khorne-berzerkers: composition has row(s) absent from the dump (Berzerker Champion) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- lord-on-juggernaut: composition has row(s) absent from the dump (Lord on Juggernaut) while 1 dump row(s) are missing — manual reconcile, not auto-synthesized
- chaos-terminators: composition has row(s) absent from the dump (Terminator Champion, Chaos Terminator) while 2 dump row(s) are missing — manual reconcile, not auto-synthesized

