# MFM enhancement reconcile — APPLIED

Reconciles source-owned fields and seeds source-complete matched-play
enhancements whose detachment already exists. `keyword_restriction_groups`
preserves exact OR-of-AND eligibility. Eligibility and exclusions are
authoritative when all source keywords resolve: they replace stale core
values and absent source relations clear them. Prose is never read or written.

| Dir | Matched | Cost | upgrade | max_tgt | eligibility | exclusions | Repo-only |
|---|--:|--:|--:|--:|--:|--:|--:|
| adepta-sororitas | 27 | 0 | 0 | 0 | 0 | 0 | 0 |
| adeptus-astartes | 61 | 0 | 0 | 0 | 0 | 0 | 0 |
| adeptus-custodes | 32 | 0 | 0 | 0 | 0 | 0 | 0 |
| adeptus-mechanicus | 36 | 0 | 0 | 0 | 0 | 0 | 0 |
| aeldari | 54 | 0 | 0 | 0 | 0 | 0 | 3 |
| agents-of-the-imperium | 22 | 0 | 0 | 0 | 0 | 0 | 0 |
| astra-militarum | 40 | 0 | 0 | 0 | 0 | 0 | 1 |
| black-templars | 75 | 0 | 0 | 0 | 0 | 0 | 1 |
| blood-angels | 84 | 0 | 0 | 0 | 0 | 0 | 0 |
| chaos-daemons | 29 | 0 | 0 | 0 | 0 | 0 | 0 |
| chaos-knights | 28 | 0 | 0 | 0 | 0 | 0 | 0 |
| chaos-space-marines | 64 | 0 | 0 | 0 | 0 | 0 | 0 |
| crimson-fists | 56 | 0 | 0 | 0 | 0 | 0 | 0 |
| dark-angels | 84 | 1 | 0 | 0 | 0 | 0 | 0 |
| death-guard | 32 | 0 | 0 | 0 | 0 | 0 | 0 |
| deathwatch | 60 | 0 | 0 | 0 | 0 | 0 | 0 |
| drukhari | 32 | 0 | 0 | 0 | 0 | 0 | 0 |
| emperors-children | 36 | 2 | 0 | 0 | 0 | 0 | 1 |
| genestealer-cults | 32 | 0 | 0 | 0 | 0 | 0 | 0 |
| grey-knights | 32 | 0 | 0 | 0 | 0 | 0 | 1 |
| imperial-fists | 60 | 0 | 0 | 0 | 0 | 0 | 0 |
| imperial-knights | 26 | 0 | 0 | 0 | 0 | 0 | 2 |
| iron-hands | 60 | 0 | 0 | 0 | 0 | 0 | 0 |
| leagues-of-votann | 36 | 0 | 0 | 0 | 0 | 0 | 1 |
| necrons | 44 | 0 | 0 | 0 | 0 | 0 | 2 |
| orks | 30 | 0 | 0 | 0 | 0 | 1 | 30 |
| raven-guard | 59 | 0 | 0 | 0 | 0 | 0 | 1 |
| salamanders | 57 | 0 | 0 | 0 | 0 | 0 | 0 |
| space-wolves | 80 | 0 | 0 | 0 | 0 | 0 | 1 |
| tau-empire | 25 | 1 | 0 | 0 | 0 | 0 | 3 |
| thousand-sons | 32 | 1 | 0 | 0 | 0 | 0 | 0 |
| tyranids | 36 | 1 | 0 | 0 | 0 | 0 | 3 |
| ultramarines | 64 | 0 | 0 | 0 | 0 | 0 | 0 |
| white-scars | 60 | 0 | 0 | 0 | 0 | 0 | 0 |
| world-eaters | 28 | 0 | 0 | 0 | 0 | 0 | 0 |
| **TOTAL** | **1613** | **6** | **0** | **0** | **0** | **1** | **50** |

## aeldari

**Repo enhancements absent from dump** (left as-is):
- stave-of-kurnos-spirit-conclave
- harmonisation-matrix-armoured-warhost
- guileful-strategist-armoured-warhost

## astra-militarum

**Repo enhancements absent from dump** (left as-is):
- sharp-eyes-light-fingers-abhuman-auxiliaries

## black-templars

**Repo enhancements absent from dump** (left as-is):
- oathbound-examplar-companions-of-vehemence

## dark-angels

**Cost changes** (old → new):
- recon-hunter-company-of-hunters: 20 → 30

## emperors-children

**Cost changes** (old → new):
- possessed-blade-carnival-of-excess: 25 → 35
- warp-walker-carnival-of-excess: 30 → 35

**Repo enhancements absent from dump** (left as-is):
- pledge-to-eternal-servitude-coterie-of-the-conceited

## grey-knights

**Repo enhancements absent from dump** (left as-is):
- eye-of-the-augurim-hallowed-conclave

## imperial-knights

**Repo enhancements absent from dump** (left as-is):
- omnissian-champion-questor-forgepact
- vocifer-magnificat-aura-questor-forgepact

## leagues-of-votann

**Repo enhancements absent from dump** (left as-is):
- farstryder-node-hearthfyre-arsenal

## necrons

**Repo enhancements absent from dump** (left as-is):
- mask-of-the-nekrosor-cursed-legion
- mortality-shroud-aura-the-phaerons-armoury

## orks

**exclusion_keywords changes:**
- slippery-git-taktikal-brigade: null → ["Mega Armour"]

**Repo enhancements absent from dump** (left as-is):
- dreadherder-dread-mob
- ard-boyz-green-tide
- blitzboss-brute-bosses
- brutal-but-kunnin-brute-bosses
- competitive-streak-kult-of-speed
- da-boss-is-watchin-war-horde
- da-gobshot-thunderbuss-brute-bosses
- da-krunch-wurrband
- eadbanger-wurrband
- enhanced-runt-maw-madcap-meks
- extra-sneaky-runt-swarm
- flyboss-flyboyz
- impulsive-recon-flyboyz
- it-came-from-da-drops-da-big-hunt
- kaptins-hat-wreckas
- kill-kommando-taktikal-brigade
- mekwaaagh-mastermind-madcap-meks
- minefield-detail-runt-swarm
- morgogs-finkin-cap-brute-bosses
- proper-killy-brute-bosses
- smoky-gubbinz-kult-of-speed
- supa-glowy-fing-shoota-boyz
- supa-snazz-dakka-upgrade-wreckas
- surly-as-a-squiggoth-brute-bosses
- targetin-squigs-shoota-boyz
- tellyporta-boss-bully-boyz
- temperamental-shokka-madcap-meks
- throat-slittas-upgrade-taktikal-brigade
- warphead-wurrband
- wimp-kickaz-bully-boyz

## raven-guard

**Repo enhancements absent from dump** (left as-is):
- unparalleled-tactician-shadowmark-talon

## space-wolves

**Repo enhancements absent from dump** (left as-is):
- howling-onslaught-saga-of-the-great-wolf

## tau-empire

**Cost changes** (old → new):
- strike-swiftly-montka: 35 → 45

**Repo enhancements absent from dump** (left as-is):
- fanatical-convert-auxiliary-cadre
- transponder-lock-module-auxiliary-cadre
- fusion-blades-experimental-prototype-cadre

## thousand-sons

**Cost changes** (old → new):
- umbralefic-crystal-grand-coven: 20 → 30

## tyranids

**Cost changes** (old → new):
- synaptoprescience-upgrade-talons-of-the-norn-queen: 25 → 30

**Repo enhancements absent from dump** (left as-is):
- synaptic-lynchpin-invasion-fleet
- synaptic-tyrant-warrior-bioform-onslaught
- sensory-assimilation-warrior-bioform-onslaught

## Enhancement seeds skipped (14)

- bionik-workshop-freebooter-krew: detachment freebooter-krew has no repo entity
- boarding-ramps-upgrade-rollin-deff: detachment rollin-deff has no repo entity
- da-gobshot-thunderbuss-more-dakka: detachment more-dakka has no repo entity
- da-kaptin-freebooter-krew: detachment freebooter-krew has no repo entity
- dakkamek-speedwaaagh: detachment speedwaaagh has no repo entity
- dead-shiny-shootas-upgrade-more-dakka: detachment more-dakka has no repo entity
- git-spotter-squig-freebooter-krew: detachment freebooter-krew has no repo entity
- kunnin-hunta-equatorial-hordes: detachment equatorial-hordes has no repo entity
- kustom-shokk-box-speedwaaagh: detachment speedwaaagh has no repo entity
- master-meknologist-speedwaaagh: detachment speedwaaagh has no repo entity
- razgits-magik-map-freebooter-krew: detachment freebooter-krew has no repo entity
- supa-burny-fuel-speedwaaagh: detachment speedwaaagh has no repo entity
- targetin-gizmos-upgrade-rollin-deff: detachment rollin-deff has no repo entity
- unkillable-scourge-equatorial-hordes: detachment equatorial-hordes has no repo entity

## Unresolved enhancements in dump (no unambiguous repo detachment)

- bionik-workshop-freebooter-krew
- boarding-ramps-upgrade-rollin-deff
- da-gobshot-thunderbuss-more-dakka
- da-kaptin-freebooter-krew
- dakkamek-speedwaaagh
- dead-shiny-shootas-upgrade-more-dakka
- git-spotter-squig-freebooter-krew
- kunnin-hunta-equatorial-hordes
- kustom-shokk-box-speedwaaagh
- master-meknologist-speedwaaagh
- razgits-magik-map-freebooter-krew
- supa-burny-fuel-speedwaaagh
- targetin-gizmos-upgrade-rollin-deff
- unkillable-scourge-equatorial-hordes

## Combat-Patrol enhancements held back (2 — pass --include-combat-patrol to author)

- extra-platin-ardmob
- rallying-war-cry-ardmob

