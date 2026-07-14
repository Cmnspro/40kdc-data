# MFM enhancement reconcile — APPLIED

Reconciles enhancement `cost` (confirmed → `points_provisional: false`, launch
dataslate) and the GW-authoritative scalars `upgrade_tag`/`max_targets` (overwritten).
`exclusion_keywords`/`keyword_restrictions` are FILL-ONLY — written only when the repo
authored none; a populated disagreement is surfaced (review), never overwritten, so a
finer authored unit keyword the dump's army-level group omits is preserved. Prose untouched.

| Dir | Matched | Cost | upgrade | max_tgt | excl-fill | excl-rev | restr-fill | restr-rev | Repo-only |
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| adepta-sororitas | 27 | 0 | 0 | 0 | 0 | 0 | 0 | 10 | 0 |
| adeptus-astartes | 58 | 0 | 0 | 0 | 0 | 0 | 0 | 29 | 0 |
| adeptus-custodes | 32 | 0 | 0 | 0 | 0 | 0 | 0 | 13 | 0 |
| adeptus-mechanicus | 36 | 0 | 0 | 0 | 0 | 0 | 0 | 26 | 0 |
| aeldari | 52 | 0 | 0 | 0 | 0 | 0 | 0 | 50 | 3 |
| agents-of-the-imperium | 18 | 0 | 0 | 0 | 0 | 0 | 0 | 12 | 0 |
| astra-militarum | 39 | 0 | 0 | 0 | 0 | 0 | 0 | 37 | 1 |
| black-templars | 74 | 0 | 0 | 0 | 0 | 0 | 0 | 41 | 1 |
| blood-angels | 83 | 0 | 0 | 0 | 0 | 0 | 0 | 54 | 0 |
| chaos-daemons | 29 | 0 | 0 | 0 | 0 | 0 | 0 | 27 | 0 |
| chaos-knights | 28 | 0 | 0 | 0 | 0 | 0 | 0 | 7 | 0 |
| chaos-space-marines | 64 | 0 | 0 | 0 | 0 | 0 | 0 | 52 | 0 |
| crimson-fists | 56 | 0 | 0 | 0 | 0 | 0 | 0 | 29 | 0 |
| dark-angels | 83 | 0 | 0 | 0 | 0 | 0 | 0 | 54 | 0 |
| death-guard | 32 | 0 | 0 | 0 | 0 | 0 | 0 | 19 | 0 |
| deathwatch | 60 | 0 | 0 | 0 | 0 | 0 | 0 | 32 | 0 |
| drukhari | 32 | 0 | 0 | 0 | 0 | 0 | 0 | 24 | 0 |
| emperors-children | 35 | 0 | 0 | 0 | 0 | 0 | 0 | 15 | 1 |
| genestealer-cults | 32 | 0 | 0 | 0 | 0 | 0 | 0 | 22 | 0 |
| grey-knights | 31 | 0 | 0 | 0 | 0 | 0 | 0 | 14 | 1 |
| imperial-fists | 60 | 0 | 0 | 0 | 0 | 0 | 0 | 33 | 0 |
| imperial-knights | 26 | 0 | 0 | 0 | 0 | 0 | 0 | 5 | 2 |
| iron-hands | 60 | 0 | 0 | 0 | 0 | 0 | 0 | 33 | 0 |
| leagues-of-votann | 33 | 0 | 0 | 0 | 0 | 0 | 0 | 14 | 1 |
| necrons | 38 | 0 | 0 | 0 | 0 | 0 | 0 | 20 | 2 |
| orks | 38 | 0 | 0 | 0 | 0 | 0 | 0 | 28 | 7 |
| raven-guard | 59 | 0 | 0 | 0 | 0 | 0 | 0 | 30 | 1 |
| salamanders | 57 | 0 | 0 | 0 | 0 | 0 | 0 | 32 | 0 |
| space-wolves | 80 | 0 | 0 | 0 | 0 | 0 | 0 | 45 | 1 |
| tau-empire | 25 | 0 | 0 | 0 | 0 | 0 | 0 | 14 | 3 |
| thousand-sons | 32 | 0 | 0 | 0 | 0 | 0 | 0 | 18 | 0 |
| tyranids | 35 | 0 | 0 | 0 | 0 | 0 | 0 | 17 | 3 |
| ultramarines | 64 | 1 | 0 | 0 | 0 | 0 | 0 | 29 | 0 |
| white-scars | 60 | 0 | 0 | 0 | 0 | 0 | 0 | 30 | 0 |
| world-eaters | 28 | 0 | 0 | 0 | 0 | 0 | 0 | 12 | 0 |
| **TOTAL** | **1596** | **1** | **0** | **0** | **0** | **0** | **0** | **927** | **27** |

## adepta-sororitas

**keyword_restrictions — authored kept, REVIEW:**
- mantle-of-ophelia-hallowed-martyrs (multi-group-or): authored [Adepta Sororitas] vs dump-union [Canoness, Palatine]
- verse-of-holy-piety-penitent-host (differs): authored [Adepta Sororitas] vs dump-union [Penitent]
- refrain-of-enduring-faith-penitent-host (differs): authored [Adepta Sororitas] vs dump-union [Penitent]
- catechism-of-divine-penitence-penitent-host (multi-group-or): authored [Adepta Sororitas] vs dump-union [Canoness, Ministorum Priest, Palatine]
- iron-surplice-of-saint-istalela-bringers-of-flame (multi-group-or): authored [Adepta Sororitas] vs dump-union [Canoness, Palatine]
- litanies-of-faith-army-of-faith (multi-group-or): authored [Adepta Sororitas] vs dump-union [Canoness, Palatine]
- clarion-of-urgency-chorus-of-condemnation (differs): authored [Canoness with Jump Pack] vs dump-union [Adepta Sororitas, Canoness with Jump Pack]
- symphonic-payload-chorus-of-condemnation (differs): authored [Exorcist] vs dump-union [Adepta Sororitas, Exorcist]
- writ-of-compunction-sacred-champions (differs): authored [Celestian Sacresants] vs dump-union [Adepta Sororitas, Celestian Sacresants]
- hagiomnifex-sanctified-orators (differs): authored [Adepta Sororitas Character] vs dump-union [Adepta Sororitas, Character]

## adeptus-astartes

**keyword_restrictions — authored kept, REVIEW:**
- the-blade-driven-deep-vanguard-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Infantry]
- adept-of-the-codex-gladius-task-force (differs): authored [Adeptus Astartes] vs dump-union [Captain]
- execute-and-redeploy-vanguard-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Phobos]
- shadow-war-veteran-vanguard-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Phobos]
- indomitable-fury-anvil-siege-force (differs): authored [Adeptus Astartes] vs dump-union [Gravis]
- fleet-commander-anvil-siege-force (differs): authored [Adeptus Astartes] vs dump-union [Captain]
- target-augury-web-ironstorm-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Techmarine]
- adept-of-the-omnissiah-ironstorm-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Techmarine]
- champion-of-humanity-firestorm-assault-force (differs): authored [Adeptus Astartes] vs dump-union [Tacticus]
- war-tempered-artifice-firestorm-assault-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Infantry]
- fury-of-the-storm-stormlance-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Mounted]
- hunters-instincts-stormlance-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Mounted]
- rites-of-war-1st-company-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Terminator]
- iron-resolve-1st-company-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Terminator]
- celerity-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- prescience-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- obfuscation-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- temporal-corridor-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- fusillade-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- bellicose-weapon-spirits-fulguris-task-force (differs): authored [Adeptus Astartes] vs dump-union [Speeder]
- raptorial-cogitator-core-fulguris-task-force (differs): authored [Adeptus Astartes] vs dump-union [Speeder]
- shroud-field-subversion-assets (differs): authored [Adeptus Astartes] vs dump-union [Phobos]
- death-in-the-dark-subversion-assets (differs): authored [Adeptus Astartes] vs dump-union [Infantry, Phobos]
- shock-deployment-armoured-speartip (multi-group-or): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Gravis, Terminator]
- honour-indefatigable-ceramite-sentinels (differs): authored [Adeptus Astartes] vs dump-union [Gravis]
- redoubtable-machine-spirit-headhunter-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Vehicle]
- gunnery-honours-headhunter-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Vehicle]
- firestorm-coordinators-headhunter-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Vehicle]
- astartes-tank-ace-headhunter-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Vehicle]

## adeptus-custodes

**keyword_restrictions — authored kept, REVIEW:**
- from-the-hall-of-armouries-shield-host (differs): authored [Adeptus Custodes] vs dump-union [Shield-Captain]
- castellans-mark-shield-host (differs): authored [Adeptus Custodes] vs dump-union [Shield-Captain]
- auric-mantle-shield-host (multi-group-or): authored [Adeptus Custodes] vs dump-union [Blade Champion, Shield-Captain]
- panoptispex-shield-host (multi-group-or): authored [Adeptus Custodes] vs dump-union [Blade Champion, Shield-Captain]
- raptor-blade-null-maiden-vigil (differs): authored [Adeptus Custodes] vs dump-union [Anathema Psykana]
- enhanced-voidsheen-cloak-null-maiden-vigil (differs): authored [Adeptus Custodes] vs dump-union [Anathema Psykana]
- huntress-eye-null-maiden-vigil (differs): authored [Adeptus Custodes] vs dump-union [Anathema Psykana]
- oblivion-knight-null-maiden-vigil (differs): authored [Adeptus Custodes] vs dump-union [Anathema Psykana]
- honoured-fallen-solar-spearhead (differs): authored [Adeptus Custodes] vs dump-union [Adeptus Custodes, Vehicle]
- veteran-of-the-kataphraktoi-solar-spearhead (multi-group-or): authored [Adeptus Custodes] vs dump-union [Adeptus Custodes, Infantry, Mounted]
- superior-creation-lions-of-the-emperor (differs): authored [Adeptus Custodes] vs dump-union [Adeptus Custodes, Infantry]
- fierce-conqueror-lions-of-the-emperor (differs): authored [Adeptus Custodes] vs dump-union [Shield-Captain]
- admonimortis-lions-of-the-emperor (differs): authored [Adeptus Custodes] vs dump-union [Shield-Captain]

## adeptus-mechanicus

**keyword_restrictions — authored kept, REVIEW:**
- cantic-thrallnet-skitarii-hunter-cohort (differs): authored [Adeptus Mechanicus] vs dump-union [Marshal]
- clandestine-infiltrator-skitarii-hunter-cohort (differs): authored [Adeptus Mechanicus] vs dump-union [Skitarii]
- veiled-hunter-skitarii-hunter-cohort (differs): authored [Adeptus Mechanicus] vs dump-union [Marshal]
- battle-sphere-uplink-skitarii-hunter-cohort (differs): authored [Adeptus Mechanicus] vs dump-union [Skitarii]
- mechanicus-locum-data-psalm-conclave (differs): authored [Adeptus Mechanicus] vs dump-union [Tech-Priest]
- mantle-of-the-gnosticarch-data-psalm-conclave (differs): authored [Adeptus Mechanicus] vs dump-union [Tech-Priest]
- data-blessed-autosermon-data-psalm-conclave (differs): authored [Adeptus Mechanicus] vs dump-union [Tech-Priest]
- temporcopia-data-psalm-conclave (differs): authored [Adeptus Mechanicus] vs dump-union [Tech-Priest]
- magos-explorator-maniple (differs): authored [Adeptus Mechanicus] vs dump-union [Tech-Priest]
- genetor-explorator-maniple (differs): authored [Adeptus Mechanicus] vs dump-union [Tech-Priest]
- logis-explorator-maniple (differs): authored [Adeptus Mechanicus] vs dump-union [Tech-Priest]
- artisan-explorator-maniple (differs): authored [Adeptus Mechanicus] vs dump-union [Tech-Priest]
- necromechanic-cohort-cybernetica (differs): authored [Adeptus Mechanicus] vs dump-union [Tech-Priest]
- lord-of-machines-cohort-cybernetica (differs): authored [Adeptus Mechanicus] vs dump-union [Tech-Priest]
- emotionless-clarity-cohort-cybernetica (differs): authored [Adeptus Mechanicus] vs dump-union [Tech-Priest]
- arch-negator-cohort-cybernetica (differs): authored [Adeptus Mechanicus] vs dump-union [Tech-Priest]
- transoracular-dyad-wafers-haloscreed-battle-clade (differs): authored [Adeptus Mechanicus] vs dump-union [Cybernetica Datasmith]
- inloaded-lethality-haloscreed-battle-clade (multi-group-or): authored [Adeptus Mechanicus] vs dump-union [Dominus, Manipulus]
- explorator-dispensation-cohort-acquisitus (differs): authored [Skitarii Marshal] vs dump-union [Adeptus Mechanicus, Skitarii Marshal]
- stealth-screened-cybercanids-cohort-acquisitus (differs): authored [Serberys Raiders] vs dump-union [Adeptus Mechanicus, Serberys Raiders]
- vinghs-wafers-of-dynamism-lords-of-the-forge (differs): authored [Cybernetica Datasmith] vs dump-union [Adeptus Mechanicus, Cybernetica Datasmith]
- tl-4-9-lords-of-the-forge (differs): authored [Tech-Priest] vs dump-union [Adeptus Mechanicus, Tech-Priest]
- voltagheist-reliquary-luminen-auto-choir (differs): authored [Tech-Priest] vs dump-union [Adeptus Mechanicus, Tech-Priest]
- electromiasmic-brazier-luminen-auto-choir (differs): authored [Tech-Priest] vs dump-union [Adeptus Mechanicus, Tech-Priest]
- omnicogitator-eradication-cohort (differs): authored [Skitarii Marshal] vs dump-union [Marshal, Skitarii]
- omnissiahs-fury-eradication-cohort (differs): authored [Skitarii Marshal] vs dump-union [Marshal, Skitarii]

## aeldari

**keyword_restrictions — authored kept, REVIEW:**
- firstdrawn-blade-windrider-host (differs): authored [Aeldari] vs dump-union [Asuryani, Mounted]
- phoenix-gem-warhost (differs): authored [Aeldari] vs dump-union [Asuryani]
- mirage-field-windrider-host (differs): authored [Aeldari] vs dump-union [Asuryani, Mounted]
- seersight-strike-windrider-host (differs): authored [Aeldari] vs dump-union [Asuryani, Mounted, Psyker]
- echoes-of-ulthanesh-windrider-host (differs): authored [Aeldari] vs dump-union [Asuryani, Mounted]
- guiding-presence-armoured-warhost (differs): authored [Aeldari] vs dump-union [Asuryani, Psyker]
- light-of-clarity-spirit-conclave (differs): authored [Aeldari] vs dump-union [Spiritseer]
- rune-of-mists-spirit-conclave (differs): authored [Aeldari] vs dump-union [Spiritseer]
- spirit-stone-of-raelyth-armoured-warhost (differs): authored [Aeldari] vs dump-union [Asuryani, Psyker]
- higher-duty-spirit-conclave (differs): authored [Aeldari] vs dump-union [Spiritseer]
- cegorachs-coil-ghosts-of-the-webway (differs): authored [Aeldari] vs dump-union [Troupe Master]
- mask-of-secrets-ghosts-of-the-webway (differs): authored [Aeldari] vs dump-union [Harlequins]
- murders-jest-ghosts-of-the-webway (differs): authored [Aeldari] vs dump-union [Death Jester]
- mistweave-ghosts-of-the-webway (differs): authored [Aeldari] vs dump-union [Shadowseer]
- timeless-strategist-warhost (differs): authored [Aeldari] vs dump-union [Asuryani]
- gift-of-foresight-warhost (differs): authored [Aeldari] vs dump-union [Asuryani]
- psychic-destroyer-warhost (differs): authored [Aeldari] vs dump-union [Asuryani, Psyker]
- craftworlds-champion-guardian-battlehost (differs): authored [Aeldari] vs dump-union [Asuryani]
- ethereal-pathway-guardian-battlehost (differs): authored [Aeldari] vs dump-union [Asuryani]
- protector-of-the-paths-guardian-battlehost (differs): authored [Aeldari] vs dump-union [Asuryani]
- breath-of-vaul-guardian-battlehost (differs): authored [Aeldari] vs dump-union [Asuryani]
- gaze-of-ynnead-devoted-of-ynnead (differs): authored [Aeldari] vs dump-union [Farseer]
- storm-of-whispers-devoted-of-ynnead (differs): authored [Aeldari] vs dump-union [Warlock]
- borrowed-vigour-devoted-of-ynnead (differs): authored [Aeldari] vs dump-union [Archon]
- morbid-might-devoted-of-ynnead (differs): authored [Aeldari] vs dump-union [Succubus]
- lucid-eye-seer-council (differs): authored [Aeldari] vs dump-union [Asuryani, Psyker]
- runes-of-warding-seer-council (differs): authored [Aeldari] vs dump-union [Asuryani, Psyker]
- stone-of-eldritch-fury-seer-council (differs): authored [Aeldari] vs dump-union [Asuryani, Psyker]
- torc-of-morai-heg-seer-council (differs): authored [Aeldari] vs dump-union [Asuryani, Psyker]
- aspect-of-murder-aspect-host (multi-group-or): authored [Aeldari] vs dump-union [Autarch, Autarch Wayleaper]
- mantle-of-wisdom-aspect-host (multi-group-or): authored [Aeldari] vs dump-union [Autarch, Autarch Wayleaper]
- shimmerstone-aspect-host (multi-group-or): authored [Aeldari] vs dump-union [Autarch, Autarch Wayleaper]
- strategic-savant-aspect-host (multi-group-or): authored [Aeldari] vs dump-union [Autarch, Autarch Wayleaper]
- key-of-ghosts-serpents-brood (differs): authored [Aeldari] vs dump-union [Harlequins]
- weavers-wail-serpents-brood (differs): authored [Aeldari] vs dump-union [Troupe Master]
- fanged-leer-serpents-brood (differs): authored [Aeldari] vs dump-union [Death Jester]
- shedskin-raiment-serpents-brood (differs): authored [Aeldari] vs dump-union [Shadowseer]
- pirate-prince-eldritch-raiders (differs): authored [Aeldari] vs dump-union [Prince Yriel]
- alacritous-assault-eldritch-raiders (differs): authored [Aeldari] vs dump-union [Anhrathe]
- exotic-munitions-eldritch-raiders (differs): authored [Aeldari] vs dump-union [Anhrathe]
- adrenal-infusions-eldritch-raiders (differs): authored [Aeldari] vs dump-union [Anhrathe, Infantry]
- infamy-corsair-coterie (differs): authored [Aeldari] vs dump-union [Anhrathe]
- webway-pathstone-corsair-coterie (differs): authored [Aeldari] vs dump-union [Anhrathe]
- archraider-corsair-coterie (differs): authored [Aeldari] vs dump-union [Anhrathe, Character]
- voidstone-corsair-coterie (differs): authored [Aeldari] vs dump-union [Anhrathe, Infantry]
- a-foot-in-the-future-fateful-performance (differs): authored [Aeldari] vs dump-union [Harlequins, Troupe Master]
- mistweave-fateful-performance (differs): authored [Aeldari] vs dump-union [Harlequins, Shadowseer]
- camouflaged-snipers-path-of-the-outcast (differs): authored [Aeldari] vs dump-union [Asuryani, Rangers]
- shadowfall-masks-twilight-flickers (differs): authored [Aeldari] vs dump-union [Harlequins, Troupe]
- prelude-performer-twilight-flickers (differs): authored [Aeldari] vs dump-union [Harlequins]

**Repo enhancements absent from dump** (left as-is):
- stave-of-kurnos-spirit-conclave
- harmonisation-matrix-armoured-warhost
- guileful-strategist-armoured-warhost

## agents-of-the-imperium

**keyword_restrictions — authored kept, REVIEW:**
- beacon-angelis-ordo-xenos-alien-hunters (differs): authored [Agents of the Imperium] vs dump-union [Watch Master]
- amulet-of-auto-chastisement-ordo-xenos-alien-hunters (differs): authored [Agents of the Imperium] vs dump-union [Watch Master]
- liber-heresius-ordo-hereticus-purgation-force (multi-group-or): authored [Agents of the Imperium] vs dump-union [Inquisitor, Ministorum Priest]
- no-escape-ordo-hereticus-purgation-force (differs): authored [Agents of the Imperium] vs dump-union [Inquisitor]
- witch-hunter-ordo-hereticus-purgation-force (multi-group-or): authored [Agents of the Imperium] vs dump-union [Inquisitor, Ministorum Priest]
- ignis-judicium-ordo-hereticus-purgation-force (multi-group-or): authored [Agents of the Imperium] vs dump-union [Inquisitor, Ministorum Priest]
- formidable-resolve-ordo-malleus-daemon-hunters (differs): authored [Agents of the Imperium] vs dump-union [Inquisitor]
- daemon-slayer-ordo-malleus-daemon-hunters (differs): authored [Agents of the Imperium] vs dump-union [Inquisitor]
- grimoire-of-true-names-ordo-malleus-daemon-hunters (differs): authored [Agents of the Imperium] vs dump-union [Inquisitor]
- gift-of-the-prescient-ordo-malleus-daemon-hunters (differs): authored [Agents of the Imperium] vs dump-union [Inquisitor]
- fleetmaster-imperialis-fleet (differs): authored [Agents of the Imperium] vs dump-union [Voidfarers]
- combat-landers-imperialis-fleet (differs): authored [Agents of the Imperium] vs dump-union [Voidfarers]

## astra-militarum

**keyword_restrictions — authored kept, REVIEW:**
- death-mask-of-ollanius-combined-arms (differs): authored [Astra Militarum] vs dump-union [Officer]
- bombast-class-vox-array-bridgehead-strike (differs): authored [Astra Militarum] vs dump-union [Astra Militarum, Militarum Tempestus, Officer]
- drill-commander-combined-arms (differs): authored [Astra Militarum] vs dump-union [Officer]
- priority-drop-beacon-bridgehead-strike (differs): authored [Astra Militarum] vs dump-union [Astra Militarum, Militarum Tempestus, Officer]
- grand-strategist-combined-arms (differs): authored [Astra Militarum] vs dump-union [Officer]
- reactive-command-combined-arms (differs): authored [Astra Militarum] vs dump-union [Officer]
- eager-advance-siege-regiment (differs): authored [Astra Militarum] vs dump-union [Infantry, Officer]
- flash-grenades-siege-regiment (differs): authored [Astra Militarum] vs dump-union [Infantry, Officer]
- legacy-sidearm-siege-regiment (differs): authored [Astra Militarum] vs dump-union [Infantry, Officer]
- stalwarts-honours-siege-regiment (differs): authored [Astra Militarum] vs dump-union [Officer]
- bold-leadership-mechanised-assault (differs): authored [Astra Militarum] vs dump-union [Infantry, Officer]
- sacred-unguents-mechanised-assault (differs): authored [Astra Militarum] vs dump-union [Astra Militarum, Tech-Priest Enginseer]
- smoke-grenades-mechanised-assault (differs): authored [Astra Militarum] vs dump-union [Infantry, Officer]
- vanguard-honours-mechanised-assault (differs): authored [Astra Militarum] vs dump-union [Infantry, Officer]
- calm-under-fire-hammer-of-the-emperor (differs): authored [Astra Militarum] vs dump-union [Officer, Vehicle]
- indomitable-steed-hammer-of-the-emperor (differs): authored [Astra Militarum] vs dump-union [Officer, Vehicle]
- regimental-banner-hammer-of-the-emperor (differs): authored [Astra Militarum] vs dump-union [Officer, Vehicle]
- veteran-crew-hammer-of-the-emperor (differs): authored [Astra Militarum] vs dump-union [Officer, Vehicle]
- guerrilla-honours-recon-element (differs): authored [Astra Militarum] vs dump-union [Infantry, Officer]
- scare-gas-grenades-recon-element (differs): authored [Astra Militarum] vs dump-union [Astra Militarum, Infantry]
- survival-gear-recon-element (differs): authored [Astra Militarum] vs dump-union [Astra Militarum, Infantry]
- tripwires-recon-element (differs): authored [Astra Militarum] vs dump-union [Astra Militarum, Infantry]
- abhuman-detail-grizzled-company (differs): authored [Astra Militarum] vs dump-union [Commissar]
- aquilan-eye-grizzled-company (differs): authored [Astra Militarum] vs dump-union [Astra Militarum, Officer]
- spec-ops-veteran-grizzled-company (differs): authored [Astra Militarum] vs dump-union [Astra Militarum, Infantry, Officer]
- laud-hailer-grizzled-company (differs): authored [Astra Militarum] vs dump-union [Astra Militarum, Officer]
- exemplar-of-duty-abhuman-auxiliaries (differs): authored [Astra Militarum] vs dump-union [Commissar]
- long-range-scout-designation-force (differs): authored [Astra Militarum] vs dump-union [Astra Militarum, Scout Sentinels]
- recon-star-designation-force (differs): authored [Astra Militarum] vs dump-union [Astra Militarum, Infantry, Platoon]
- battalion-commander-steel-hammer (differs): authored [Astra Militarum] vs dump-union [Astra Militarum, Titanic]
- titan-killer-steel-hammer (differs): authored [Astra Militarum] vs dump-union [Astra Militarum, Titanic]
- engine-speaker-steel-hammer (differs): authored [Astra Militarum] vs dump-union [Astra Militarum, Tech-Priest Enginseer]
- assault-hatches-steel-hammer (differs): authored [Astra Militarum] vs dump-union [Astra Militarum, Titanic, Transport]
- exemplary-officer-armoured-infantry (differs): authored [Astra Militarum] vs dump-union [Infantry, Officer]
- master-manoeuvrist-armoured-infantry (differs): authored [Astra Militarum] vs dump-union [Infantry, Officer]
- omnissian-unguents-armoured-infantry (differs): authored [Astra Militarum] vs dump-union [Astra Militarum, Tech-Priest Enginseer]
- grand-strategist-armoured-infantry (differs): authored [Astra Militarum] vs dump-union [Officer]

**Repo enhancements absent from dump** (left as-is):
- sharp-eyes-light-fingers-abhuman-auxiliaries

## black-templars

**keyword_restrictions — authored kept, REVIEW:**
- incendiary-animus-companions-of-vehemence (multi-group-or): authored [Black Templars] vs dump-union [Chaplain, Judiciar]
- merciless-denunciation-companions-of-vehemence (multi-group-or): authored [Black Templars] vs dump-union [Chaplain, Judiciar]
- zealous-vanguard-companions-of-vehemence (differs): authored [Black Templars] vs dump-union [Adeptus Astartes]
- imperialis-of-the-eternal-crusade-vindication-task-force (differs): authored [Black Templars] vs dump-union [Ancient]
- consecrating-aura-vindication-task-force (differs): authored [Black Templars] vs dump-union [Adeptus Astartes]
- orb-of-the-emperors-aegis-vindication-task-force (differs): authored [Black Templars] vs dump-union [Adeptus Astartes]
- warden-of-honour-vindication-task-force (differs): authored [Black Templars] vs dump-union [Crusade Ancient]
- benediction-of-fury-wrathful-procession (differs): authored [Black Templars] vs dump-union [Chaplain]
- adaptable-executioner-wrathful-procession (differs): authored [Black Templars] vs dump-union [Black Templars, Execrator]
- fervent-exemplars-marshals-household (differs): authored [Black Templars] vs dump-union [Black Templars, Sword Brethren Squad]
- inheritors-of-sigismund-marshals-household (differs): authored [Black Templars] vs dump-union [Black Templars, Sword Brethren Squad]
- guiding-omens-the-living-miracle (differs): authored [Black Templars] vs dump-union [Black Templars, Emperor’s Champion]
- rites-of-war-1st-company-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Terminator]
- iron-resolve-1st-company-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Terminator]
- adept-of-the-codex-gladius-task-force (differs): authored [Adeptus Astartes] vs dump-union [Captain]
- fury-of-the-storm-stormlance-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Mounted]
- hunters-instincts-stormlance-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Mounted]
- celerity-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- prescience-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- obfuscation-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- temporal-corridor-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- fusillade-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- the-blade-driven-deep-vanguard-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Infantry]
- execute-and-redeploy-vanguard-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Phobos]
- shadow-war-veteran-vanguard-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Phobos]
- indomitable-fury-anvil-siege-force (differs): authored [Adeptus Astartes] vs dump-union [Gravis]
- fleet-commander-anvil-siege-force (differs): authored [Adeptus Astartes] vs dump-union [Captain]
- champion-of-humanity-firestorm-assault-force (differs): authored [Adeptus Astartes] vs dump-union [Tacticus]
- war-tempered-artifice-firestorm-assault-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Infantry]
- target-augury-web-ironstorm-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Techmarine]
- adept-of-the-omnissiah-ironstorm-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Techmarine]
- bellicose-weapon-spirits-fulguris-task-force (differs): authored [Adeptus Astartes] vs dump-union [Speeder]
- raptorial-cogitator-core-fulguris-task-force (differs): authored [Adeptus Astartes] vs dump-union [Speeder]
- shroud-field-subversion-assets (differs): authored [Adeptus Astartes] vs dump-union [Phobos]
- death-in-the-dark-subversion-assets (differs): authored [Adeptus Astartes] vs dump-union [Infantry, Phobos]
- shock-deployment-armoured-speartip (multi-group-or): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Gravis, Terminator]
- honour-indefatigable-ceramite-sentinels (differs): authored [Adeptus Astartes] vs dump-union [Gravis]
- redoubtable-machine-spirit-headhunter-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Vehicle]
- gunnery-honours-headhunter-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Vehicle]
- firestorm-coordinators-headhunter-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Vehicle]
- astartes-tank-ace-headhunter-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Vehicle]

**Repo enhancements absent from dump** (left as-is):
- oathbound-examplar-companions-of-vehemence

## blood-angels

**keyword_restrictions — authored kept, REVIEW:**
- sanguinius-grace-the-lost-brethren (differs): authored [Blood Angels] vs dump-union [Death Company]
- blood-shard-the-lost-brethren (differs): authored [Blood Angels] vs dump-union [Death Company]
- to-slay-the-warmaster-the-lost-brethren (differs): authored [Blood Angels] vs dump-union [Death Company]
- vengeful-onslaught-the-lost-brethren (differs): authored [Blood Angels] vs dump-union [Death Company]
- artisan-of-war-the-angelic-host (differs): authored [Blood Angels] vs dump-union [Adeptus Astartes, Jump Pack]
- visage-of-death-the-angelic-host (differs): authored [Blood Angels] vs dump-union [Adeptus Astartes, Jump Pack]
- archangels-shard-the-angelic-host (differs): authored [Blood Angels] vs dump-union [Adeptus Astartes, Jump Pack]
- gleaming-pinions-the-angelic-host (differs): authored [Blood Angels] vs dump-union [Adeptus Astartes, Jump Pack]
- prescient-flash-angelic-inheritors (differs): authored [Blood Angels] vs dump-union [Adeptus Astartes]
- troubling-visions-angelic-inheritors (differs): authored [Blood Angels] vs dump-union [Adeptus Astartes]
- blazing-icon-angelic-inheritors (differs): authored [Blood Angels] vs dump-union [Adeptus Astartes, Infantry]
- ordained-sacrifice-angelic-inheritors (differs): authored [Blood Angels] vs dump-union [Adeptus Astartes]
- carmine-reliquary-rage-cursed-onslaught (differs): authored [Blood Angels] vs dump-union [Chaplain]
- master-of-the-red-thirst-rage-cursed-onslaught (differs): authored [Blood Angels] vs dump-union [Adeptus Astartes]
- sanguinary-tear-rage-cursed-onslaught (differs): authored [Blood Angels] vs dump-union [Adeptus Astartes]
- angels-fang-rage-cursed-onslaught (differs): authored [Blood Angels] vs dump-union [Adeptus Astartes]
- angelic-executioner-encarmine-speartip (differs): authored [Blood Angels] vs dump-union [Adeptus Astartes, Jump Pack]
- shadow-of-abomination-encarmine-speartip (differs): authored [Blood Angels] vs dump-union [Adeptus Astartes, Jump Pack]
- blood-boil-legacy-of-grace (differs): authored [Blood Angels] vs dump-union [Adeptus Astartes, Psyker]
- aureole-of-the-angel-legacy-of-grace (differs): authored [Blood Angels] vs dump-union [Adeptus Astartes]
- instinctive-interception-wrath-of-the-doomed (differs): authored [Blood Angels] vs dump-union [Death Company]
- speed-of-the-primarch-liberator-assault-group (differs): authored [Blood Angels] vs dump-union [Adeptus Astartes]
- rage-fuelled-warrior-liberator-assault-group (differs): authored [Blood Angels] vs dump-union [Adeptus Astartes]
- icon-of-the-angel-liberator-assault-group (differs): authored [Blood Angels] vs dump-union [Adeptus Astartes]
- gift-of-foresight-liberator-assault-group (differs): authored [Blood Angels] vs dump-union [Adeptus Astartes]
- rites-of-war-1st-company-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Terminator]
- iron-resolve-1st-company-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Terminator]
- adept-of-the-codex-gladius-task-force (differs): authored [Adeptus Astartes] vs dump-union [Captain]
- fury-of-the-storm-stormlance-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Mounted]
- hunters-instincts-stormlance-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Mounted]
- celerity-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- prescience-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- obfuscation-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- temporal-corridor-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- fusillade-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- the-blade-driven-deep-vanguard-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Infantry]
- execute-and-redeploy-vanguard-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Phobos]
- shadow-war-veteran-vanguard-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Phobos]
- indomitable-fury-anvil-siege-force (differs): authored [Adeptus Astartes] vs dump-union [Gravis]
- fleet-commander-anvil-siege-force (differs): authored [Adeptus Astartes] vs dump-union [Captain]
- champion-of-humanity-firestorm-assault-force (differs): authored [Adeptus Astartes] vs dump-union [Tacticus]
- war-tempered-artifice-firestorm-assault-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Infantry]
- target-augury-web-ironstorm-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Techmarine]
- adept-of-the-omnissiah-ironstorm-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Techmarine]
- bellicose-weapon-spirits-fulguris-task-force (differs): authored [Adeptus Astartes] vs dump-union [Speeder]
- raptorial-cogitator-core-fulguris-task-force (differs): authored [Adeptus Astartes] vs dump-union [Speeder]
- shroud-field-subversion-assets (differs): authored [Adeptus Astartes] vs dump-union [Phobos]
- death-in-the-dark-subversion-assets (differs): authored [Adeptus Astartes] vs dump-union [Infantry, Phobos]
- shock-deployment-armoured-speartip (multi-group-or): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Gravis, Terminator]
- honour-indefatigable-ceramite-sentinels (differs): authored [Adeptus Astartes] vs dump-union [Gravis]
- redoubtable-machine-spirit-headhunter-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Vehicle]
- gunnery-honours-headhunter-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Vehicle]
- firestorm-coordinators-headhunter-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Vehicle]
- astartes-tank-ace-headhunter-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Vehicle]

## chaos-daemons

**keyword_restrictions — authored kept, REVIEW:**
- argath-the-king-of-blades-daemonic-incursion (differs): authored [Chaos Daemons] vs dump-union [Khorne, Legiones Daemonica]
- the-everstave-daemonic-incursion (differs): authored [Chaos Daemons] vs dump-union [Legiones Daemonica, Tzeentch]
- the-endless-gift-daemonic-incursion (differs): authored [Chaos Daemons] vs dump-union [Legiones Daemonica, Nurgle]
- soulstealer-daemonic-incursion (differs): authored [Chaos Daemons] vs dump-union [Legiones Daemonica, Slaanesh]
- slaughterthirst-blood-legion (differs): authored [Chaos Daemons] vs dump-union [Khorne, Legiones Daemonica]
- furys-cage-blood-legion (differs): authored [Chaos Daemons] vs dump-union [Khorne, Legiones Daemonica, Monster]
- brazenmaw-blood-legion (differs): authored [Chaos Daemons] vs dump-union [Khorne, Legiones Daemonica]
- gateway-unto-damnation-blood-legion (differs): authored [Chaos Daemons] vs dump-union [Khorne, Legiones Daemonica, Monster]
- inescapable-eye-scintillating-legion (differs): authored [Chaos Daemons] vs dump-union [Legiones Daemonica, Tzeentch]
- infernal-puppeteer-scintillating-legion (differs): authored [Chaos Daemons] vs dump-union [Legiones Daemonica, Monster, Tzeentch]
- neverblade-scintillating-legion (differs): authored [Chaos Daemons] vs dump-union [Legiones Daemonica, Monster, Tzeentch]
- improbable-shield-scintillating-legion (differs): authored [Chaos Daemons] vs dump-union [Legiones Daemonica, Tzeentch]
- cankerblight-plague-legion (differs): authored [Chaos Daemons] vs dump-union [Legiones Daemonica, Nurgle]
- maggot-maws-plague-legion (differs): authored [Chaos Daemons] vs dump-union [Legiones Daemonica, Nurgle]
- droning-shroud-plague-legion (differs): authored [Chaos Daemons] vs dump-union [Legiones Daemonica, Monster, Nurgle]
- font-of-spores-plague-legion (differs): authored [Chaos Daemons] vs dump-union [Legiones Daemonica, Monster, Nurgle]
- false-majesty-legion-of-excess (differs): authored [Chaos Daemons] vs dump-union [Legiones Daemonica, Slaanesh]
- dreaming-crown-legion-of-excess (differs): authored [Chaos Daemons] vs dump-union [Legiones Daemonica, Slaanesh]
- avatar-of-perfection-legion-of-excess (differs): authored [Chaos Daemons] vs dump-union [Legiones Daemonica, Monster, Slaanesh]
- soul-glutton-legion-of-excess (differs): authored [Chaos Daemons] vs dump-union [Legiones Daemonica, Monster, Slaanesh]
- leaping-shadows-shadow-legion (differs): authored [Chaos Daemons] vs dump-union [Shadow Legion]
- mantle-of-gloom-shadow-legion (differs): authored [Chaos Daemons] vs dump-union [Shadow Legion]
- fade-to-darkness-shadow-legion (differs): authored [Chaos Daemons] vs dump-union [Shadow Legion]
- malice-made-manifest-shadow-legion (differs): authored [Chaos Daemons] vs dump-union [Shadow Legion]
- swollen-with-power-lords-of-the-warp (differs): authored [Legiones Daemonica, Character] vs dump-union [Character, Legiones Daemonica]
- bane-forged-weapons-warptide (differs): authored [Legiones Daemonica, Battleline] vs dump-union [Battleline, Legiones Daemonica]
- soul-hungry-slaughterers-warptide (differs): authored [Legiones Daemonica, Battleline] vs dump-union [Battleline, Legiones Daemonica]

## chaos-knights

**keyword_restrictions — authored kept, REVIEW:**
- preyslayers-mantle-houndpack-lance (differs): authored [Chaos Knights] vs dump-union [War Dog]
- final-howl-houndpack-lance (differs): authored [Chaos Knights] vs dump-union [War Dog]
- loping-predator-houndpack-lance (differs): authored [Chaos Knights] vs dump-union [War Dog]
- panoply-of-the-cursed-knights-houndpack-lance (differs): authored [Chaos Knights] vs dump-union [War Dog]
- pterrorshade-rookery-bastions-of-tyranny (differs): authored [Knight Tyrant] vs dump-union [Chaos Knights, Knight Tyrant]
- hate-filled-dominion-bastions-of-tyranny (differs): authored [Knight Tyrant] vs dump-union [Chaos Knights, Knight Tyrant]
- throne-tyrannicus-helhunt-lance (differs): authored [Chaos Knights] vs dump-union [Chaos Knights, Titanic]

## chaos-space-marines

**keyword_restrictions — authored kept, REVIEW:**
- warmasters-gift-veterans-of-the-long-war (differs): authored [Chaos Space Marines] vs dump-union [Chaos Lord]
- talisman-of-burning-blood-pactbound-zealots (differs): authored [Chaos Space Marines] vs dump-union [Heretic Astartes, Khorne]
- eye-of-tzeentch-pactbound-zealots (differs): authored [Chaos Space Marines] vs dump-union [Heretic Astartes, Tzeentch]
- eager-for-vengeance-veterans-of-the-long-war (differs): authored [Chaos Space Marines] vs dump-union [Heretic Astartes]
- eye-of-abaddon-veterans-of-the-long-war (differs): authored [Chaos Space Marines] vs dump-union [Heretic Astartes]
- orbs-of-unlife-pactbound-zealots (differs): authored [Chaos Space Marines] vs dump-union [Heretic Astartes, Nurgle]
- mark-of-legend-veterans-of-the-long-war (differs): authored [Chaos Space Marines] vs dump-union [Heretic Astartes]
- intoxicating-elixir-pactbound-zealots (differs): authored [Chaos Space Marines] vs dump-union [Heretic Astartes, Slaanesh]
- falsehood-deceptors (differs): authored [Chaos Space Marines] vs dump-union [Chaos Lord]
- cursed-fang-deceptors (differs): authored [Chaos Space Marines] vs dump-union [Heretic Astartes, Infantry]
- shroud-of-obfuscation-deceptors (differs): authored [Chaos Space Marines] vs dump-union [Heretic Astartes, Infantry]
- soul-link-deceptors (differs): authored [Chaos Space Marines] vs dump-union [Heretic Astartes, Infantry]
- despots-claim-renegade-raiders (differs): authored [Chaos Space Marines] vs dump-union [Heretic Astartes]
- dread-reaver-renegade-raiders (differs): authored [Chaos Space Marines] vs dump-union [Heretic Astartes]
- mark-of-the-hound-renegade-raiders (differs): authored [Chaos Space Marines] vs dump-union [Heretic Astartes]
- tyrants-lash-renegade-raiders (differs): authored [Chaos Space Marines] vs dump-union [Heretic Astartes]
- nights-shroud-dread-talons (differs): authored [Chaos Space Marines] vs dump-union [Chaos Lord]
- willbreaker-dread-talons (differs): authored [Chaos Space Marines] vs dump-union [Heretic Astartes]
- warp-fuelled-thrusters-dread-talons (differs): authored [Chaos Space Marines] vs dump-union [Chaos Lord, Jump Pack]
- eater-of-dread-dread-talons (differs): authored [Chaos Space Marines] vs dump-union [Heretic Astartes]
- bastion-plate-fellhammer-siege-host (differs): authored [Chaos Space Marines] vs dump-union [Chaos Lord]
- warp-tracer-fellhammer-siege-host (differs): authored [Chaos Space Marines] vs dump-union [Heretic Astartes]
- ironbound-enmity-fellhammer-siege-host (differs): authored [Chaos Space Marines] vs dump-union [Heretic Astartes]
- iron-artifice-fellhammer-siege-host (differs): authored [Chaos Space Marines] vs dump-union [Heretic Astartes, Infantry]
- cultists-brand-chaos-cult (multi-group-or): authored [Chaos Space Marines] vs dump-union [Damned, Dark Apostle]
- amulet-of-tainted-vigour-chaos-cult (differs): authored [Chaos Space Marines] vs dump-union [Dark Apostle]
- incendiary-goad-chaos-cult (multi-group-or): authored [Chaos Space Marines] vs dump-union [Damned, Dark Apostle]
- warped-foresight-chaos-cult (multi-group-or): authored [Chaos Space Marines] vs dump-union [Damned, Dark Apostle]
- invigorated-mechatendrils-soulforged-warpack (differs): authored [Chaos Space Marines] vs dump-union [Warpsmith]
- tempting-addendum-soulforged-warpack (differs): authored [Chaos Space Marines] vs dump-union [Heretic Astartes]
- forges-blessing-soulforged-warpack (differs): authored [Chaos Space Marines] vs dump-union [Heretic Astartes]
- soul-harvester-soulforged-warpack (differs): authored [Chaos Space Marines] vs dump-union [Heretic Astartes]
- surgical-precision-creations-of-bile (differs): authored [Chaos Space Marines] vs dump-union [Heretic Astartes]
- living-carapace-creations-of-bile (differs): authored [Chaos Space Marines] vs dump-union [Chaos Lord]
- helm-of-all-seeing-creations-of-bile (differs): authored [Chaos Space Marines] vs dump-union [Heretic Astartes, Infantry]
- prime-test-subject-creations-of-bile (differs): authored [Chaos Space Marines] vs dump-union [Heretic Astartes, Infantry]
- touched-by-the-warp-cabal-of-chaos (differs): authored [Chaos Space Marines] vs dump-union [Heretic Astartes]
- greyveil-hex-nightmare-hunt (differs): authored [Chaos Space Marines] vs dump-union [Chaos Lord]
- warp-fuelled-thrusters-nightmare-hunt (differs): authored [Chaos Space Marines] vs dump-union [Chaos Lord, Jump Pack]
- terrorglut-parasite-nightmare-hunt (differs): authored [Chaos Space Marines] vs dump-union [Heretic Astartes]
- sorrowscent-vulture-nightmare-hunt (differs): authored [Chaos Space Marines] vs dump-union [Chaos Lord, Jump Pack]
- voice-of-the-tyrant-hurons-marauders (differs): authored [Chaos Space Marines] vs dump-union [Heretic Astartes]
- raid-leader-hurons-marauders (differs): authored [Chaos Space Marines] vs dump-union [Heretic Astartes]
- dread-reputation-hurons-marauders (differs): authored [Chaos Space Marines] vs dump-union [Heretic Astartes]
- eager-for-bloodshed-hurons-marauders (differs): authored [Chaos Space Marines] vs dump-union [Heretic Astartes]
- weaponised-hatred-renegade-warband (differs): authored [Chaos Space Marines] vs dump-union [Heretic Astartes]
- eyes-of-the-hunter-renegade-warband (differs): authored [Chaos Space Marines] vs dump-union [Heretic Astartes]
- fratricidal-trophies-renegade-warband (differs): authored [Chaos Space Marines] vs dump-union [Heretic Astartes, Terminator]
- empyric-symbiote-renegade-warband (differs): authored [Chaos Space Marines] vs dump-union [Heretic Astartes]
- conduit-of-chaos-cabal-of-chaos (differs): authored [Heretic Astartes, Daemon] vs dump-union [Daemon, Heretic Astartes]
- shadowcowl-talisman-murdertalon-raiders (differs): authored [Chaos Lord with Jump Pack] vs dump-union [Chaos Lord with Jump Pack, Heretic Astartes]
- pact-of-cursed-pinions-murdertalon-raiders (differs): authored [Chaos Lord with Jump Pack] vs dump-union [Chaos Lord with Jump Pack, Heretic Astartes]

## crimson-fists

**keyword_restrictions — authored kept, REVIEW:**
- rites-of-war-1st-company-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Terminator]
- iron-resolve-1st-company-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Terminator]
- adept-of-the-codex-gladius-task-force (differs): authored [Adeptus Astartes] vs dump-union [Captain]
- fury-of-the-storm-stormlance-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Mounted]
- hunters-instincts-stormlance-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Mounted]
- celerity-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- prescience-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- obfuscation-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- temporal-corridor-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- fusillade-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- the-blade-driven-deep-vanguard-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Infantry]
- execute-and-redeploy-vanguard-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Phobos]
- shadow-war-veteran-vanguard-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Phobos]
- indomitable-fury-anvil-siege-force (differs): authored [Adeptus Astartes] vs dump-union [Gravis]
- fleet-commander-anvil-siege-force (differs): authored [Adeptus Astartes] vs dump-union [Captain]
- champion-of-humanity-firestorm-assault-force (differs): authored [Adeptus Astartes] vs dump-union [Tacticus]
- war-tempered-artifice-firestorm-assault-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Infantry]
- target-augury-web-ironstorm-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Techmarine]
- adept-of-the-omnissiah-ironstorm-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Techmarine]
- bellicose-weapon-spirits-fulguris-task-force (differs): authored [Adeptus Astartes] vs dump-union [Speeder]
- raptorial-cogitator-core-fulguris-task-force (differs): authored [Adeptus Astartes] vs dump-union [Speeder]
- shroud-field-subversion-assets (differs): authored [Adeptus Astartes] vs dump-union [Phobos]
- death-in-the-dark-subversion-assets (differs): authored [Adeptus Astartes] vs dump-union [Infantry, Phobos]
- shock-deployment-armoured-speartip (multi-group-or): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Gravis, Terminator]
- honour-indefatigable-ceramite-sentinels (differs): authored [Adeptus Astartes] vs dump-union [Gravis]
- redoubtable-machine-spirit-headhunter-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Vehicle]
- gunnery-honours-headhunter-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Vehicle]
- firestorm-coordinators-headhunter-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Vehicle]
- astartes-tank-ace-headhunter-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Vehicle]

## dark-angels

**keyword_restrictions — authored kept, REVIEW:**
- shroud-of-heroes-unforgiven-task-force (differs): authored [Dark Angels] vs dump-union [Adeptus Astartes]
- stubborn-tenacity-unforgiven-task-force (differs): authored [Dark Angels] vs dump-union [Adeptus Astartes]
- weapons-of-the-first-legion-unforgiven-task-force (differs): authored [Dark Angels] vs dump-union [Adeptus Astartes]
- pennant-of-remembrance-unforgiven-task-force (multi-group-or): authored [Dark Angels] vs dump-union [Ancient, Bladeguard Ancient]
- champion-of-the-deathwing-inner-circle-task-force (differs): authored [Dark Angels] vs dump-union [Deathwing]
- eye-of-the-unseen-inner-circle-task-force (differs): authored [Dark Angels] vs dump-union [Deathwing]
- singular-will-inner-circle-task-force (differs): authored [Dark Angels] vs dump-union [Deathwing]
- deathwing-assault-inner-circle-task-force (differs): authored [Dark Angels] vs dump-union [Deathwing]
- calibanite-armaments-lions-blade-task-force (differs): authored [Dark Angels] vs dump-union [Adeptus Astartes]
- lord-of-the-hunt-lions-blade-task-force (differs): authored [Dark Angels] vs dump-union [Ravenwing]
- stalwart-champion-lions-blade-task-force (multi-group-or): authored [Dark Angels] vs dump-union [Captain, Chaplain, Lieutenant]
- fulgus-magna-lions-blade-task-force (differs): authored [Dark Angels] vs dump-union [Deathwing]
- tempered-in-battle-wrath-of-the-rock (differs): authored [Dark Angels] vs dump-union [Adeptus Astartes]
- ancient-weapons-wrath-of-the-rock (differs): authored [Dark Angels] vs dump-union [Adeptus Astartes]
- lord-of-the-ravenwing-wrath-of-the-rock (differs): authored [Dark Angels] vs dump-union [Ravenwing]
- petition-of-stability-dark-age-arsenal (differs): authored [Dark Angels] vs dump-union [Adeptus Astartes]
- entreaty-of-perpetual-ardour-dark-age-arsenal (differs): authored [Dark Angels] vs dump-union [Adeptus Astartes, Hellblaster Squad]
- thundercowl-turbines-darkflight-pursuit (differs): authored [Dark Angels] vs dump-union [Fly, Ravenwing]
- nightforged-battery-darkflight-pursuit (differs): authored [Dark Angels] vs dump-union [Dark Angels, Land Speeder Vengeance]
- limitless-zeal-interrogation-conclave (differs): authored [Dark Angels] vs dump-union [Chaplain]
- inescapable-interrogation-interrogation-conclave (differs): authored [Dark Angels] vs dump-union [Chaplain]
- master-crafted-weapon-company-of-hunters (differs): authored [Dark Angels] vs dump-union [Ravenwing]
- mounted-strategist-company-of-hunters (differs): authored [Dark Angels] vs dump-union [Ravenwing]
- master-of-manoeuvre-company-of-hunters (differs): authored [Dark Angels] vs dump-union [Ravenwing]
- recon-hunter-company-of-hunters (differs): authored [Dark Angels] vs dump-union [Ravenwing]
- rites-of-war-1st-company-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Terminator]
- iron-resolve-1st-company-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Terminator]
- adept-of-the-codex-gladius-task-force (differs): authored [Adeptus Astartes] vs dump-union [Captain]
- fury-of-the-storm-stormlance-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Mounted]
- hunters-instincts-stormlance-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Mounted]
- celerity-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- prescience-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- obfuscation-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- temporal-corridor-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- fusillade-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- the-blade-driven-deep-vanguard-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Infantry]
- execute-and-redeploy-vanguard-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Phobos]
- shadow-war-veteran-vanguard-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Phobos]
- indomitable-fury-anvil-siege-force (differs): authored [Adeptus Astartes] vs dump-union [Gravis]
- fleet-commander-anvil-siege-force (differs): authored [Adeptus Astartes] vs dump-union [Captain]
- champion-of-humanity-firestorm-assault-force (differs): authored [Adeptus Astartes] vs dump-union [Tacticus]
- war-tempered-artifice-firestorm-assault-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Infantry]
- target-augury-web-ironstorm-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Techmarine]
- adept-of-the-omnissiah-ironstorm-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Techmarine]
- bellicose-weapon-spirits-fulguris-task-force (differs): authored [Adeptus Astartes] vs dump-union [Speeder]
- raptorial-cogitator-core-fulguris-task-force (differs): authored [Adeptus Astartes] vs dump-union [Speeder]
- shroud-field-subversion-assets (differs): authored [Adeptus Astartes] vs dump-union [Phobos]
- death-in-the-dark-subversion-assets (differs): authored [Adeptus Astartes] vs dump-union [Infantry, Phobos]
- shock-deployment-armoured-speartip (multi-group-or): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Gravis, Terminator]
- honour-indefatigable-ceramite-sentinels (differs): authored [Adeptus Astartes] vs dump-union [Gravis]
- redoubtable-machine-spirit-headhunter-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Vehicle]
- gunnery-honours-headhunter-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Vehicle]
- firestorm-coordinators-headhunter-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Vehicle]
- astartes-tank-ace-headhunter-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Vehicle]

## death-guard

**keyword_restrictions — authored kept, REVIEW:**
- bilemaw-blight-mortarions-hammer (differs): authored [Death Guard] vs dump-union [Malignant Plaguecaster]
- insectile-murmuration-flyblown-host (differs): authored [Death Guard] vs dump-union [Death Guard, Plague Marines]
- rejuvenating-swarm-paragons-of-putrescence (differs): authored [Death Guard] vs dump-union [Death Guard, Infantry]
- plagueveil-flyblown-host (differs): authored [Death Guard] vs dump-union [Death Guard, Plague Marines]
- tendrilous-emissions-mortarions-hammer (differs): authored [Death Guard] vs dump-union [Lord of Virulence]
- final-ingredient-champions-of-contagion (differs): authored [Death Guard] vs dump-union [Biologus Putrifier]
- visions-of-virulence-champions-of-contagion (differs): authored [Death Guard] vs dump-union [Malignant Plaguecaster]
- needle-of-nurgle-champions-of-contagion (differs): authored [Death Guard] vs dump-union [Plague Surgeon]
- cornucophagus-champions-of-contagion (differs): authored [Death Guard] vs dump-union [Lord of Poxes]
- entropic-knell-tallyband-summoners (differs): authored [Death Guard] vs dump-union [Great Unclean One]
- tome-of-bounteous-blessings-tallyband-summoners (differs): authored [Death Guard] vs dump-union [Malignant Plaguecaster]
- witherbone-pipes-shamblerot-vectorium (differs): authored [Death Guard] vs dump-union [Noxious Blightbringer]
- sorrowsyphon-shamblerot-vectorium (differs): authored [Death Guard] vs dump-union [Malignant Plaguecaster]
- face-of-death-death-lords-chosen (differs): authored [Death Guard] vs dump-union [Terminator]
- vile-vigour-death-lords-chosen (differs): authored [Death Guard] vs dump-union [Terminator]
- warprot-talisman-death-lords-chosen (differs): authored [Death Guard] vs dump-union [Terminator]
- helm-of-the-fly-king-death-lords-chosen (differs): authored [Death Guard] vs dump-union [Terminator]
- parasitic-woe-reaper-contagion-engines (differs): authored [Contagion Engine] vs dump-union [Contagion Engines]
- lancet-of-the-worldsore-contagion-engines (multi-group-or): authored [Helbrute] vs dump-union [Death Guard, Helbrute, Myphitic Blight-haulers]

## deathwatch

**keyword_restrictions — authored kept, REVIEW:**
- thief-of-secrets-black-spear-task-force (differs): authored [Deathwatch] vs dump-union [Adeptus Astartes]
- osseus-key-black-spear-task-force (multi-group-or): authored [Deathwatch] vs dump-union [Adeptus Astartes, Techmarine, Watch Master]
- the-tome-of-ectoclades-black-spear-task-force (multi-group-or): authored [Deathwatch] vs dump-union [Adeptus Astartes, Captain, Watch Master]
- rites-of-war-1st-company-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Terminator]
- iron-resolve-1st-company-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Terminator]
- adept-of-the-codex-gladius-task-force (differs): authored [Adeptus Astartes] vs dump-union [Captain]
- fury-of-the-storm-stormlance-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Mounted]
- hunters-instincts-stormlance-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Mounted]
- celerity-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- prescience-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- obfuscation-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- temporal-corridor-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- fusillade-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- the-blade-driven-deep-vanguard-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Infantry]
- execute-and-redeploy-vanguard-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Phobos]
- shadow-war-veteran-vanguard-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Phobos]
- indomitable-fury-anvil-siege-force (differs): authored [Adeptus Astartes] vs dump-union [Gravis]
- fleet-commander-anvil-siege-force (differs): authored [Adeptus Astartes] vs dump-union [Captain]
- champion-of-humanity-firestorm-assault-force (differs): authored [Adeptus Astartes] vs dump-union [Tacticus]
- war-tempered-artifice-firestorm-assault-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Infantry]
- target-augury-web-ironstorm-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Techmarine]
- adept-of-the-omnissiah-ironstorm-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Techmarine]
- bellicose-weapon-spirits-fulguris-task-force (differs): authored [Adeptus Astartes] vs dump-union [Speeder]
- raptorial-cogitator-core-fulguris-task-force (differs): authored [Adeptus Astartes] vs dump-union [Speeder]
- shroud-field-subversion-assets (differs): authored [Adeptus Astartes] vs dump-union [Phobos]
- death-in-the-dark-subversion-assets (differs): authored [Adeptus Astartes] vs dump-union [Infantry, Phobos]
- shock-deployment-armoured-speartip (multi-group-or): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Gravis, Terminator]
- honour-indefatigable-ceramite-sentinels (differs): authored [Adeptus Astartes] vs dump-union [Gravis]
- redoubtable-machine-spirit-headhunter-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Vehicle]
- gunnery-honours-headhunter-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Vehicle]
- firestorm-coordinators-headhunter-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Vehicle]
- astartes-tank-ace-headhunter-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Vehicle]

## drukhari

**keyword_restrictions — authored kept, REVIEW:**
- labyrinthine-cunning-realspace-raiders (differs): authored [Drukhari] vs dump-union [Archon]
- eye-of-spite-realspace-raiders (differs): authored [Drukhari] vs dump-union [Succubus]
- crucible-of-malediction-realspace-raiders (differs): authored [Drukhari] vs dump-union [Haemonculus]
- archraider-reapers-wager (multi-group-or): authored [Drukhari] vs dump-union [Drukhari, Harlequins]
- webway-walker-reapers-wager (multi-group-or): authored [Drukhari] vs dump-union [Drukhari, Harlequins]
- reapers-cowl-reapers-wager (differs): authored [Drukhari] vs dump-union [Harlequins]
- pharmacophex-spectacle-of-spite (differs): authored [Drukhari] vs dump-union [Succubus]
- chronoshard-spectacle-of-spite (differs): authored [Drukhari] vs dump-union [Succubus]
- periapt-of-torments-spectacle-of-spite (differs): authored [Drukhari] vs dump-union [Succubus]
- morghennas-curse-spectacle-of-spite (differs): authored [Drukhari] vs dump-union [Succubus]
- master-regenesist-covenite-coterie (differs): authored [Drukhari] vs dump-union [Haemonculus]
- master-nemesine-covenite-coterie (differs): authored [Drukhari] vs dump-union [Haemonculus]
- master-artisan-covenite-coterie (differs): authored [Drukhari] vs dump-union [Haemonculus]
- master-repugnomancer-covenite-coterie (differs): authored [Drukhari] vs dump-union [Haemonculus]
- leechbite-plate-kabalite-cartel (differs): authored [Drukhari] vs dump-union [Archon]
- webway-awl-kabalite-cartel (differs): authored [Drukhari] vs dump-union [Archon]
- informant-network-kabalite-cartel (differs): authored [Drukhari] vs dump-union [Archon]
- towering-arrogance-kabalite-cartel (differs): authored [Drukhari] vs dump-union [Archon]
- periapt-of-torments-exhibition-of-slaughter (differs): authored [Drukhari] vs dump-union [Drukhari, Succubus]
- hyperstimm-trafficker-exhibition-of-slaughter (differs): authored [Drukhari] vs dump-union [Drukhari, Succubus]
- towering-arrogance-kabalite-agonysts (differs): authored [Drukhari] vs dump-union [Archon, Drukhari]
- contempt-for-rivals-kabalite-agonysts (differs): authored [Drukhari] vs dump-union [Archon, Drukhari]
- gnarlskin-experimentor-tools-of-torment (differs): authored [Drukhari] vs dump-union [Drukhari, Haemonculus]
- elixir-of-the-corpse-courts-tools-of-torment (multi-group-or): authored [Drukhari] vs dump-union [Cronos, Drukhari, Talos]

## emperors-children

**keyword_restrictions — authored kept, REVIEW:**
- rise-to-the-challenge-peerless-bladesmen (differs): authored [Emperor’s Children] vs dump-union [Emperor’s Children, Infantry]
- sublime-prescience-rapid-evisceration (differs): authored [Emperor’s Children] vs dump-union [Emperor’s Children, Infantry]
- spearhead-striker-rapid-evisceration (differs): authored [Emperor’s Children] vs dump-union [Emperor’s Children, Infantry]
- accomplished-tactician-rapid-evisceration (differs): authored [Emperor’s Children] vs dump-union [Emperor’s Children, Infantry]
- heretek-adept-rapid-evisceration (differs): authored [Emperor’s Children] vs dump-union [Emperor’s Children, Infantry]
- dark-blessings-carnival-of-excess (differs): authored [Emperor’s Children] vs dump-union [Emperor’s Children, Infantry]
- warp-walker-carnival-of-excess (multi-group-or): authored [Emperor’s Children] vs dump-union [Emperor’s Children, Keeper of Secrets]
- exalted-patron-court-of-the-phoenician (differs): authored [Emperor’s Children] vs dump-union [Lord Exultant]
- spiritsliver-court-of-the-phoenician (differs): authored [Emperor’s Children] vs dump-union [Daemon Prince, Emperor’s Children]
- cacophonic-accompaniment-elegant-brutes (differs): authored [Emperor's Children] vs dump-union [Emperor’s Children, Lord Kakophonist]
- frenzied-ferocity-elegant-brutes (differs): authored [Emperor's Children, Terminator Squad] vs dump-union [Emperor’s Children, Terminator Squad]
- euphoric-crown-frenzied-host (differs): authored [Emperor's Children] vs dump-union [Emperor’s Children, Lord Exultant]
- howling-plate-frenzied-host (differs): authored [Emperor's Children] vs dump-union [Emperor’s Children, Lord Exultant]
- eager-patrons-spectacle-of-slaughter (differs): authored [Emperor's Children, Flawless Blades] vs dump-union [Emperor’s Children, Flawless Blades]
- beguiling-grotesquerie-spectacle-of-slaughter (differs): authored [Emperor's Children, Flawless Blades] vs dump-union [Emperor’s Children, Flawless Blades]

**Repo enhancements absent from dump** (left as-is):
- pledge-to-eternal-servitude-coterie-of-the-conceited

## genestealer-cults

**keyword_restrictions — authored kept, REVIEW:**
- gene-sires-reliquant-xenocreed-congregation (multi-group-or): authored [Genestealer Cults] vs dump-union [Acolyte Iconward, Magus, Primus]
- denunciator-of-tyrants-xenocreed-congregation (multi-group-or): authored [Genestealer Cults] vs dump-union [Acolyte Iconward, Magus, Primus]
- deeds-that-speak-to-the-masses-xenocreed-congregation (multi-group-or): authored [Genestealer Cults] vs dump-union [Acolyte Iconward, Magus, Primus]
- incendiary-inspiration-xenocreed-congregation (multi-group-or): authored [Genestealer Cults] vs dump-union [Acolyte Iconward, Magus, Primus]
- predatory-instincts-biosanctic-broodsurge (multi-group-or): authored [Genestealer Cults] vs dump-union [Abominant, Biophagus, Patriarch]
- biomorph-adaptation-biosanctic-broodsurge (multi-group-or): authored [Genestealer Cults] vs dump-union [Abominant, Patriarch]
- mutagenic-regeneration-biosanctic-broodsurge (multi-group-or): authored [Genestealer Cults] vs dump-union [Abominant, Biophagus, Patriarch]
- alien-majesty-biosanctic-broodsurge (multi-group-or): authored [Genestealer Cults] vs dump-union [Abominant, Biophagus, Patriarch]
- serpentine-tactics-outlander-claw (differs): authored [Genestealer Cults] vs dump-union [Genestealer Cults, Mounted]
- starfall-shells-outlander-claw (differs): authored [Genestealer Cults] vs dump-union [Genestealer Cults, Mounted]
- martial-espionage-brood-brothers-auxilia (differs): authored [Genestealer Cults] vs dump-union [Genestealer Cults, Infantry]
- adaptive-reprisal-brood-brothers-auxilia (differs): authored [Genestealer Cults] vs dump-union [Genestealer Cults, Infantry]
- the-hero-returned-brood-brothers-auxilia (differs): authored [Genestealer Cults] vs dump-union [Genestealer Cults, Infantry]
- fire-point-commander-brood-brothers-auxilia (differs): authored [Genestealer Cults] vs dump-union [Genestealer Cults, Infantry]
- synaptic-auger-final-day (differs): authored [Genestealer Cults] vs dump-union [Tyranids]
- vanguard-tyrant-final-day (differs): authored [Genestealer Cults] vs dump-union [Winged Hive Tyrant]
- gene-tailored-toxins-heroes-of-the-uprising (multi-group-or): authored [Genestealer Cults] vs dump-union [Genestealer Cults, Locus, Sanctus]
- contraband-munitions-heroes-of-the-uprising (multi-group-or): authored [Genestealer Cults] vs dump-union [Genestealer Cults, Kelermorph, Reductus Saboteur]
- mark-of-the-star-children-purestrain-broodswarm (differs): authored [Genestealer Cults] vs dump-union [Genestealer Cults, Purestrain Genestealers]
- talons-of-the-sire-purestrain-broodswarm (differs): authored [Genestealer Cults] vs dump-union [Genestealer Cults, Patriarch]
- inspired-to-greatness-xenocult-masses (multi-group-or): authored [Genestealer Cults] vs dump-union [Genestealer Cults, Magus, Primus]
- devious-disguises-xenocult-masses (differs): authored [Genestealer Cults] vs dump-union [Genestealer Cults, Neophyte Hybrids]

## grey-knights

**keyword_restrictions — authored kept, REVIEW:**
- driven-by-duty-sanctic-spearhead (differs): authored [Grey Knights] vs dump-union [Grey Knights, Walker]
- quickening-foci-sanctic-spearhead (differs): authored [Grey Knights] vs dump-union [Grey Knights, Infantry]
- spiritus-machina-sanctic-spearhead (differs): authored [Grey Knights] vs dump-union [Grey Knights, Infantry]
- sanctic-reaper-hallowed-conclave (differs): authored [Grey Knights] vs dump-union [Grey Knights, Terminator]
- nemesis-rounds-hallowed-conclave (differs): authored [Grey Knights] vs dump-union [Grey Knights, Terminator]
- ephemeral-tome-banishers (differs): authored [Grey Knights] vs dump-union [Grey Knights, Infantry]
- radiant-champion-warpbane-task-force (differs): authored [Grey Knights] vs dump-union [Grey Knights, Infantry]
- phial-of-the-abyss-warpbane-task-force (differs): authored [Grey Knights] vs dump-union [Grey Knights, Infantry]
- psychic-celerity-argent-assault (differs): authored [Grey Knights] vs dump-union [Terminator]
- vigilance-of-titan-argent-assault (differs): authored [Grey Knights] vs dump-union [Terminator]
- precognicient-volleys-fires-of-purgation (differs): authored [Grey Knights] vs dump-union [Grey Knights, Purgation Squad]
- boons-of-deimos-fires-of-purgation (differs): authored [Grey Knights] vs dump-union [Grey Knights, Purgation Squad]
- predestined-coordinates-immaterial-interdiction (differs): authored [Grey Knights] vs dump-union [Grey Knights, Interceptor Squad]
- astral-overlap-immaterial-interdiction (differs): authored [Grey Knights] vs dump-union [Grey Knights, Interceptor Squad]

**Repo enhancements absent from dump** (left as-is):
- eye-of-the-augurim-hallowed-conclave

## imperial-fists

**keyword_restrictions — authored kept, REVIEW:**
- champion-of-the-feast-emperors-shield (differs): authored [Imperial Fists] vs dump-union [Adeptus Astartes]
- disciple-of-rhetoricus-emperors-shield (differs): authored [Imperial Fists] vs dump-union [Adeptus Astartes, Terminator]
- indomitable-champion-emperors-shield (differs): authored [Imperial Fists] vs dump-union [Adeptus Astartes, Terminator]
- malodraxian-standard-emperors-shield (differs): authored [Imperial Fists] vs dump-union [Adeptus Astartes, Ancient]
- rites-of-war-1st-company-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Terminator]
- iron-resolve-1st-company-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Terminator]
- adept-of-the-codex-gladius-task-force (differs): authored [Adeptus Astartes] vs dump-union [Captain]
- fury-of-the-storm-stormlance-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Mounted]
- hunters-instincts-stormlance-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Mounted]
- celerity-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- prescience-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- obfuscation-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- temporal-corridor-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- fusillade-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- the-blade-driven-deep-vanguard-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Infantry]
- execute-and-redeploy-vanguard-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Phobos]
- shadow-war-veteran-vanguard-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Phobos]
- indomitable-fury-anvil-siege-force (differs): authored [Adeptus Astartes] vs dump-union [Gravis]
- fleet-commander-anvil-siege-force (differs): authored [Adeptus Astartes] vs dump-union [Captain]
- champion-of-humanity-firestorm-assault-force (differs): authored [Adeptus Astartes] vs dump-union [Tacticus]
- war-tempered-artifice-firestorm-assault-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Infantry]
- target-augury-web-ironstorm-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Techmarine]
- adept-of-the-omnissiah-ironstorm-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Techmarine]
- bellicose-weapon-spirits-fulguris-task-force (differs): authored [Adeptus Astartes] vs dump-union [Speeder]
- raptorial-cogitator-core-fulguris-task-force (differs): authored [Adeptus Astartes] vs dump-union [Speeder]
- shroud-field-subversion-assets (differs): authored [Adeptus Astartes] vs dump-union [Phobos]
- death-in-the-dark-subversion-assets (differs): authored [Adeptus Astartes] vs dump-union [Infantry, Phobos]
- shock-deployment-armoured-speartip (multi-group-or): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Gravis, Terminator]
- honour-indefatigable-ceramite-sentinels (differs): authored [Adeptus Astartes] vs dump-union [Gravis]
- redoubtable-machine-spirit-headhunter-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Vehicle]
- gunnery-honours-headhunter-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Vehicle]
- firestorm-coordinators-headhunter-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Vehicle]
- astartes-tank-ace-headhunter-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Vehicle]

## imperial-knights

**keyword_restrictions — authored kept, REVIEW:**
- magos-questoris-questor-forgepact (differs): authored [Imperial Knights] vs dump-union [Tech-Priest]
- blessed-plate-dominus-foebreakers (differs): authored [Imperial Knights] vs dump-union [Dominus, Imperial Knights]
- archeotech-autoloaders-dominus-foebreakers (differs): authored [Imperial Knights] vs dump-union [Dominus, Imperial Knights]
- gyro-optimised-actuators-throne-bonded-outriders (differs): authored [Imperial Knights, Armiger] vs dump-union [Armiger]
- ancestral-overbleed-throne-bonded-outriders (differs): authored [Imperial Knights, Armiger] vs dump-union [Armiger]

**Repo enhancements absent from dump** (left as-is):
- omnissian-champion-questor-forgepact
- vocifer-magnificat-questor-forgepact

## iron-hands

**keyword_restrictions — authored kept, REVIEW:**
- spiritus-ferrum-hammer-of-avernii (differs): authored [Iron Hands] vs dump-union [Adeptus Astartes]
- medusan-roar-hammer-of-avernii (differs): authored [Iron Hands] vs dump-union [Adeptus Astartes]
- iron-laurel-hammer-of-avernii (differs): authored [Iron Hands] vs dump-union [Adeptus Astartes]
- steel-font-hammer-of-avernii (differs): authored [Iron Hands] vs dump-union [Adeptus Astartes, Terminator]
- rites-of-war-1st-company-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Terminator]
- iron-resolve-1st-company-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Terminator]
- adept-of-the-codex-gladius-task-force (differs): authored [Adeptus Astartes] vs dump-union [Captain]
- fury-of-the-storm-stormlance-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Mounted]
- hunters-instincts-stormlance-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Mounted]
- celerity-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- prescience-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- obfuscation-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- temporal-corridor-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- fusillade-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- the-blade-driven-deep-vanguard-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Infantry]
- execute-and-redeploy-vanguard-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Phobos]
- shadow-war-veteran-vanguard-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Phobos]
- indomitable-fury-anvil-siege-force (differs): authored [Adeptus Astartes] vs dump-union [Gravis]
- fleet-commander-anvil-siege-force (differs): authored [Adeptus Astartes] vs dump-union [Captain]
- champion-of-humanity-firestorm-assault-force (differs): authored [Adeptus Astartes] vs dump-union [Tacticus]
- war-tempered-artifice-firestorm-assault-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Infantry]
- target-augury-web-ironstorm-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Techmarine]
- adept-of-the-omnissiah-ironstorm-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Techmarine]
- bellicose-weapon-spirits-fulguris-task-force (differs): authored [Adeptus Astartes] vs dump-union [Speeder]
- raptorial-cogitator-core-fulguris-task-force (differs): authored [Adeptus Astartes] vs dump-union [Speeder]
- shroud-field-subversion-assets (differs): authored [Adeptus Astartes] vs dump-union [Phobos]
- death-in-the-dark-subversion-assets (differs): authored [Adeptus Astartes] vs dump-union [Infantry, Phobos]
- shock-deployment-armoured-speartip (multi-group-or): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Gravis, Terminator]
- honour-indefatigable-ceramite-sentinels (differs): authored [Adeptus Astartes] vs dump-union [Gravis]
- redoubtable-machine-spirit-headhunter-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Vehicle]
- gunnery-honours-headhunter-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Vehicle]
- firestorm-coordinators-headhunter-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Vehicle]
- astartes-tank-ace-headhunter-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Vehicle]

## leagues-of-votann

**keyword_restrictions — authored kept, REVIEW:**
- quake-multigenerator-hearthband (differs): authored [Leagues of Votann] vs dump-union [Kâhl, Leagues of Votann]
- high-kahl-hearthband (differs): authored [Leagues of Votann] vs dump-union [Kâhl, Leagues of Votann]
- tactical-alchemy-brandfast-oathband (differs): authored [Leagues of Votann] vs dump-union [Kâhl]
- precursive-judgement-brandfast-oathband (differs): authored [Leagues of Votann] vs dump-union [Kâhl]
- signature-restoration-brandfast-oathband (differs): authored [Leagues of Votann] vs dump-union [Brôkhyr]
- calculated-tenacity-hearthfyre-arsenal (multi-group-or): authored [Leagues of Votann] vs dump-union [Brôkhyr, Memnyr Strategist]
- mantle-of-elders-hearthfyre-arsenal (differs): authored [Leagues of Votann] vs dump-union [Memnyr Strategist]
- graviton-vault-hearthfyre-arsenal (differs): authored [Leagues of Votann] vs dump-union [Brôkhyr]
- mercenary-prospector-mercenary-oathband (differs): authored [Leagues of Votann] vs dump-union [Kâhl]
- metaphysical-brokerage-mercenary-oathband (differs): authored [Leagues of Votann] vs dump-union [Memnyr Strategist]
- saturation-rounds-armoured-trailblazers (differs): authored [Leagues of Votann] vs dump-union [Leagues of Votann, Sagitaur]
- optimised-attack-lines-armoured-trailblazers (differs): authored [Leagues of Votann] vs dump-union [Leagues of Votann, Sagitaur]
- pan-spectral-lockons-farseekers (differs): authored [Leagues of Votann] vs dump-union [Pioneers]
- ironskein-hearthguard-covenant (differs): authored [Leagues of Votann] vs dump-union [Kâhl]

**Repo enhancements absent from dump** (left as-is):
- farstryder-node-hearthfyre-arsenal

## necrons

**keyword_restrictions — authored kept, REVIEW:**
- soulless-reaper-annihilation-legion (differs): authored [Necrons] vs dump-union [Destroyer Cult]
- eldritch-nightmare-annihilation-legion (differs): authored [Necrons] vs dump-union [Destroyer Cult]
- dimensional-sanctum-canoptek-court (differs): authored [Necrons] vs dump-union [Cryptek]
- hyperphasic-fulcrum-canoptek-court (differs): authored [Necrons] vs dump-union [Cryptek]
- autodivinator-canoptek-court (differs): authored [Necrons] vs dump-union [Cryptek]
- metalodermal-tesla-weave-canoptek-court (differs): authored [Necrons] vs dump-union [Cryptek]
- honourable-combatant-obeisance-phalanx (differs): authored [Necrons] vs dump-union [Overlord]
- unflinching-will-obeisance-phalanx (differs): authored [Necrons] vs dump-union [Overlord]
- warrior-noble-obeisance-phalanx (differs): authored [Necrons] vs dump-union [Overlord]
- eternal-conqueror-obeisance-phalanx (differs): authored [Necrons] vs dump-union [Overlord]
- dread-majesty-starshatter-arsenal (multi-group-or): authored [Necrons] vs dump-union [Catacomb Command Barge, Overlord]
- destroyer-ankh-cursed-legion (multi-group-or): authored [Necrons] vs dump-union [Catacomb Command Barge, Overlord]
- murdermind-cursed-legion (differs): authored [Necrons] vs dump-union [Cryptek]
- cursed-circlet-cursed-legion (differs): authored [Necrons] vs dump-union [Destroyer Cult]
- atomic-disintegrators-cryptek-conclave (differs): authored [Necrons] vs dump-union [Cryptek]
- gravitic-bolas-cryptek-conclave (differs): authored [Necrons] vs dump-union [Cryptek]
- enlivened-sentinels-hand-of-the-dynasty (differs): authored [Necrons] vs dump-union [Necron Warriors, Necrons]
- tools-of-dominion-hand-of-the-dynasty (differs): authored [Necrons] vs dump-union [Immortals, Necrons]
- recursive-reanimation-skyshroud-spearhead (differs): authored [Necrons] vs dump-union [Necrons, Tomb Blades]
- deepening-madness-skyshroud-spearhead (differs): authored [Necrons] vs dump-union [Destroyer Cult, Mounted]

**Repo enhancements absent from dump** (left as-is):
- mask-of-the-nekrosor-cursed-legion
- mortality-shroud-the-phaerons-armoury

## orks

**keyword_restrictions — authored kept, REVIEW:**
- glory-hog-da-big-hunt (differs): authored [Orks] vs dump-union [Beastboss on Squigosaur]
- skrag-every-stash-da-big-hunt (differs): authored [Orks] vs dump-union [Beast Snagga]
- proper-killy-da-big-hunt (differs): authored [Orks] vs dump-union [Beast Snagga]
- surly-as-a-squiggoth-da-big-hunt (differs): authored [Orks] vs dump-union [Beastboss on Squigosaur]
- wazblasta-kult-of-speed (differs): authored [Orks] vs dump-union [Deffkilla Wartrike]
- fasta-than-yooz-kult-of-speed (differs): authored [Orks] vs dump-union [Infantry, Orks]
- squig-hide-tyres-kult-of-speed (differs): authored [Orks] vs dump-union [Deffkilla Wartrike]
- smoky-gubbinz-dread-mob (differs): authored [Orks] vs dump-union [Mek]
- supa-glowy-fing-dread-mob (differs): authored [Orks] vs dump-union [Mek]
- press-it-fasta-dread-mob (differs): authored [Orks] vs dump-union [Mek]
- gitfinder-gogglez-dread-mob (differs): authored [Orks] vs dump-union [Mek]
- ferocious-show-off-green-tide (differs): authored [Orks] vs dump-union [Infantry, Orks]
- brutal-but-kunnin-green-tide (differs): authored [Orks] vs dump-union [Infantry, Orks]
- bloodthirsty-belligerence-green-tide (differs): authored [Orks] vs dump-union [Infantry, Orks]
- raucous-warcaller-green-tide (differs): authored [Orks] vs dump-union [Infantry, Orks]
- tellyporta-bully-boyz (differs): authored [Orks] vs dump-union [Warboss in Mega Armour]
- big-gob-bully-boyz (differs): authored [Orks] vs dump-union [Infantry, Warboss]
- da-biggest-boss-bully-boyz (differs): authored [Orks] vs dump-union [Infantry, Warboss]
- eadstompa-bully-boyz (differs): authored [Orks] vs dump-union [Infantry, Warboss]
- da-gobshot-thunderbuss-more-dakka (differs): authored [Orks] vs dump-union [Infantry, Orks]
- dead-shiny-shootas-more-dakka (differs): authored [Orks] vs dump-union [Infantry, Orks]
- da-kaptin-freebooter-krew (differs): authored [Orks] vs dump-union [Warboss]
- bionik-workshop-freebooter-krew (multi-group-or): authored [Orks] vs dump-union [Big Mek, Painboy]
- boarding-ramps-rollin-deff (differs): authored [Orks] vs dump-union [Wagon]
- targetin-gizmos-rollin-deff (differs): authored [Orks] vs dump-union [Wagon]
- runnin-boots-blitz-brigade (differs): authored [Orks] vs dump-union [Infantry, Orks]
- supercharged-squig-oil-blitz-brigade (differs): authored [Orks] vs dump-union [Mek]
- tuff-git-blitz-brigade (differs): authored [Orks] vs dump-union [Infantry, Orks]

**Repo enhancements absent from dump** (left as-is):
- skwad-leader-taktikal-brigade
- mek-kaptin-taktikal-brigade
- gob-boomer-taktikal-brigade
- targetin-squigs-more-dakka
- zog-off-and-eat-dakka-more-dakka
- dead-shiny-shootas-rollin-deff
- da-gobshot-thunderbuss-rollin-deff

## raven-guard

**keyword_restrictions — authored kept, REVIEW:**
- blackwing-shroud-shadowmark-talon (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Infantry]
- coronal-susurrant-shadowmark-talon (differs): authored [Adeptus Astartes] vs dump-union [Phobos]
- rites-of-war-1st-company-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Terminator]
- iron-resolve-1st-company-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Terminator]
- adept-of-the-codex-gladius-task-force (differs): authored [Adeptus Astartes] vs dump-union [Captain]
- fury-of-the-storm-stormlance-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Mounted]
- celerity-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- prescience-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- obfuscation-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- temporal-corridor-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- fusillade-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- the-blade-driven-deep-vanguard-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Infantry]
- execute-and-redeploy-vanguard-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Phobos]
- shadow-war-veteran-vanguard-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Phobos]
- indomitable-fury-anvil-siege-force (differs): authored [Adeptus Astartes] vs dump-union [Gravis]
- fleet-commander-anvil-siege-force (differs): authored [Adeptus Astartes] vs dump-union [Captain]
- champion-of-humanity-firestorm-assault-force (differs): authored [Adeptus Astartes] vs dump-union [Tacticus]
- war-tempered-artifice-firestorm-assault-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Infantry]
- target-augury-web-ironstorm-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Techmarine]
- adept-of-the-omnissiah-ironstorm-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Techmarine]
- bellicose-weapon-spirits-fulguris-task-force (differs): authored [Adeptus Astartes] vs dump-union [Speeder]
- raptorial-cogitator-core-fulguris-task-force (differs): authored [Adeptus Astartes] vs dump-union [Speeder]
- shroud-field-subversion-assets (differs): authored [Adeptus Astartes] vs dump-union [Phobos]
- death-in-the-dark-subversion-assets (differs): authored [Adeptus Astartes] vs dump-union [Infantry, Phobos]
- shock-deployment-armoured-speartip (multi-group-or): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Gravis, Terminator]
- honour-indefatigable-ceramite-sentinels (differs): authored [Adeptus Astartes] vs dump-union [Gravis]
- redoubtable-machine-spirit-headhunter-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Vehicle]
- gunnery-honours-headhunter-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Vehicle]
- firestorm-coordinators-headhunter-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Vehicle]
- astartes-tank-ace-headhunter-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Vehicle]

**Repo enhancements absent from dump** (left as-is):
- unparalleled-tactician-shadowmark-talon

## salamanders

**keyword_restrictions — authored kept, REVIEW:**
- immolator-forgefathers-seekers (differs): authored [Salamanders] vs dump-union [Adeptus Astartes]
- war-tempered-artifice-forgefathers-seekers (differs): authored [Salamanders] vs dump-union [Adeptus Astartes, Infantry]
- forged-in-battle-forgefathers-seekers (differs): authored [Salamanders] vs dump-union [Adeptus Astartes]
- adamantine-mantle-forgefathers-seekers (differs): authored [Salamanders] vs dump-union [Adeptus Astartes]
- rites-of-war-1st-company-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Terminator]
- iron-resolve-1st-company-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Terminator]
- adept-of-the-codex-gladius-task-force (differs): authored [Adeptus Astartes] vs dump-union [Captain]
- fury-of-the-storm-stormlance-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Mounted]
- hunters-instincts-stormlance-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Mounted]
- celerity-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- prescience-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- obfuscation-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- temporal-corridor-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- fusillade-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- the-blade-driven-deep-vanguard-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Infantry]
- execute-and-redeploy-vanguard-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Phobos]
- shadow-war-veteran-vanguard-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Phobos]
- indomitable-fury-anvil-siege-force (differs): authored [Adeptus Astartes] vs dump-union [Gravis]
- fleet-commander-anvil-siege-force (differs): authored [Adeptus Astartes] vs dump-union [Captain]
- champion-of-humanity-firestorm-assault-force (differs): authored [Adeptus Astartes] vs dump-union [Tacticus]
- target-augury-web-ironstorm-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Techmarine]
- adept-of-the-omnissiah-ironstorm-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Techmarine]
- bellicose-weapon-spirits-fulguris-task-force (differs): authored [Adeptus Astartes] vs dump-union [Speeder]
- raptorial-cogitator-core-fulguris-task-force (differs): authored [Adeptus Astartes] vs dump-union [Speeder]
- shroud-field-subversion-assets (differs): authored [Adeptus Astartes] vs dump-union [Phobos]
- death-in-the-dark-subversion-assets (differs): authored [Adeptus Astartes] vs dump-union [Infantry, Phobos]
- shock-deployment-armoured-speartip (multi-group-or): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Gravis, Terminator]
- honour-indefatigable-ceramite-sentinels (differs): authored [Adeptus Astartes] vs dump-union [Gravis]
- redoubtable-machine-spirit-headhunter-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Vehicle]
- gunnery-honours-headhunter-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Vehicle]
- firestorm-coordinators-headhunter-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Vehicle]
- astartes-tank-ace-headhunter-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Vehicle]

## space-wolves

**keyword_restrictions — authored kept, REVIEW:**
- fenrisian-grit-saga-of-the-hunter (differs): authored [Space Wolves] vs dump-union [Adeptus Astartes]
- feral-rage-saga-of-the-hunter (differs): authored [Space Wolves] vs dump-union [Adeptus Astartes]
- skjald-saga-of-the-bold (differs): authored [Space Wolves] vs dump-union [Adeptus Astartes]
- thunderwolfs-fortitude-saga-of-the-bold (differs): authored [Space Wolves] vs dump-union [Adeptus Astartes]
- hunters-guile-saga-of-the-beastslayer (differs): authored [Space Wolves] vs dump-union [Adeptus Astartes]
- helm-of-the-beastslayer-saga-of-the-beastslayer (differs): authored [Space Wolves] vs dump-union [Adeptus Astartes]
- a-giant-amongst-giants-champions-of-fenris (differs): authored [Space Wolves] vs dump-union [Adeptus Astartes, Infantry]
- preyslayer-champions-of-fenris (differs): authored [Space Wolves] vs dump-union [Adeptus Astartes, Infantry]
- grimnars-mark-saga-of-the-great-wolf (differs): authored [Space Wolves] vs dump-union [Adeptus Astartes, Captain, Terminator]
- howlmaw-saga-of-the-great-wolf (differs): authored [Space Wolves] vs dump-union [Wolf Priest]
- chariots-of-the-storm-saga-of-the-great-wolf (differs): authored [Space Wolves] vs dump-union [Adeptus Astartes]
- skjalds-foretelling-saga-of-the-great-wolf (differs): authored [Space Wolves] vs dump-union [Battle Leader, Wolf Guard]
- thirst-for-glory-legends-of-saga-and-song (differs): authored [Space Wolves] vs dump-union [Adeptus Astartes, Terminator]
- fierce-example-legends-of-saga-and-song (differs): authored [Space Wolves] vs dump-union [Space Wolves, Wolf Guard Terminators]
- eye-of-the-hunter-veterans-of-the-fang (differs): authored [Space Wolves] vs dump-union [Space Wolves, Wolf Guard Battle Leader]
- weaver-of-sagas-veterans-of-the-fang (differs): authored [Space Wolves] vs dump-union [Space Wolves, Wolf Priest]
- rites-of-war-1st-company-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Terminator]
- iron-resolve-1st-company-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Terminator]
- adept-of-the-codex-gladius-task-force (differs): authored [Adeptus Astartes] vs dump-union [Captain]
- fury-of-the-storm-stormlance-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Mounted]
- hunters-instincts-stormlance-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Mounted]
- celerity-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- prescience-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- obfuscation-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- temporal-corridor-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- fusillade-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- the-blade-driven-deep-vanguard-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Infantry]
- execute-and-redeploy-vanguard-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Phobos]
- shadow-war-veteran-vanguard-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Phobos]
- indomitable-fury-anvil-siege-force (differs): authored [Adeptus Astartes] vs dump-union [Gravis]
- fleet-commander-anvil-siege-force (differs): authored [Adeptus Astartes] vs dump-union [Captain]
- champion-of-humanity-firestorm-assault-force (differs): authored [Adeptus Astartes] vs dump-union [Tacticus]
- war-tempered-artifice-firestorm-assault-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Infantry]
- target-augury-web-ironstorm-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Techmarine]
- adept-of-the-omnissiah-ironstorm-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Techmarine]
- bellicose-weapon-spirits-fulguris-task-force (differs): authored [Adeptus Astartes] vs dump-union [Speeder]
- raptorial-cogitator-core-fulguris-task-force (differs): authored [Adeptus Astartes] vs dump-union [Speeder]
- shroud-field-subversion-assets (differs): authored [Adeptus Astartes] vs dump-union [Phobos]
- death-in-the-dark-subversion-assets (differs): authored [Adeptus Astartes] vs dump-union [Infantry, Phobos]
- shock-deployment-armoured-speartip (multi-group-or): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Gravis, Terminator]
- honour-indefatigable-ceramite-sentinels (differs): authored [Adeptus Astartes] vs dump-union [Gravis]
- redoubtable-machine-spirit-headhunter-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Vehicle]
- gunnery-honours-headhunter-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Vehicle]
- firestorm-coordinators-headhunter-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Vehicle]
- astartes-tank-ace-headhunter-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Vehicle]

**Repo enhancements absent from dump** (left as-is):
- howling-onslaught-saga-of-the-great-wolf

## tau-empire

**keyword_restrictions — authored kept, REVIEW:**
- puretide-engram-neurochip-retaliation-cadre (differs): authored [T’au Empire] vs dump-union [Battlesuit, T’au Empire]
- starflare-ignition-system-retaliation-cadre (differs): authored [T’au Empire] vs dump-union [Battlesuit, T’au Empire]
- internal-grenade-racks-retaliation-cadre (differs): authored [T’au Empire] vs dump-union [Battlesuit, T’au Empire]
- prototype-weapon-system-retaliation-cadre (differs): authored [T’au Empire] vs dump-union [Battlesuit, T’au Empire]
- kroothawk-flock-kroot-hunting-pack (differs): authored [T’au Empire] vs dump-union [Kroot]
- nomadic-hunter-kroot-hunting-pack (differs): authored [T’au Empire] vs dump-union [Trail Shaper]
- root-carved-weapons-kroot-hunting-pack (differs): authored [T’au Empire] vs dump-union [War Shaper]
- borthrod-gland-kroot-hunting-pack (differs): authored [T’au Empire] vs dump-union [Flesh Shaper]
- student-of-kauyon-auxiliary-cadre (differs): authored [T’au Empire] vs dump-union [Kroot, Shaper]
- supernova-launcher-experimental-prototype-cadre (differs): authored [T’au Empire] vs dump-union [Battlesuit]
- thermoneutronic-projector-experimental-prototype-cadre (differs): authored [T’au Empire] vs dump-union [Battlesuit]
- plasma-accelerator-rifle-experimental-prototype-cadre (differs): authored [T’au Empire] vs dump-union [Battlesuit]
- negation-emitters-advanced-acquisition-cadre (differs): authored [T’au Empire] vs dump-union [Stealth Battlesuits, T’au Empire]
- unmasking-suite-advanced-acquisition-cadre (multi-group-or): authored [T’au Empire] vs dump-union [Ghostkeel, Pathfinder Team, Stealth Battlesuits, T’au Empire]

**Repo enhancements absent from dump** (left as-is):
- fanatical-convert-auxiliary-cadre
- transponder-lock-module-auxiliary-cadre
- fusion-blades-experimental-prototype-cadre

## thousand-sons

**keyword_restrictions — authored kept, REVIEW:**
- lord-of-forbidden-lore-grand-coven (differs): authored [Thousand Sons] vs dump-union [Psyker, Thousand Sons]
- incandaeum-grand-coven (differs): authored [Thousand Sons] vs dump-union [Exalted Sorcerer]
- nethershriek-mind-eater-changehost-of-deceit (multi-group-or): authored [Thousand Sons] vs dump-union [Lord of Change, Thousand Sons]
- diabolic-savant-changehost-of-deceit (differs): authored [Thousand Sons] vs dump-union [Infantry, Thousand Sons]
- duplicitous-malediction-changehost-of-deceit (multi-group-or): authored [Thousand Sons] vs dump-union [Lord of Change, Thousand Sons]
- tome-of-true-names-changehost-of-deceit (differs): authored [Thousand Sons] vs dump-union [Infantry, Thousand Sons]
- warpmeld-dagger-warpmeld-pact (differs): authored [Thousand Sons] vs dump-union [Tzaangor Shaman]
- diamond-of-distortion-warpmeld-pact (differs): authored [Thousand Sons] vs dump-union [Tzaangor Shaman]
- bray-lord-warpmeld-pact (multi-group-or): authored [Thousand Sons] vs dump-union [Infernal Master, Sorcerer]
- flowing-flesh-warpmeld-pact (differs): authored [Thousand Sons] vs dump-union [Tzaangor Shaman]
- stave-abominus-rubricae-phalanx (differs): authored [Thousand Sons] vs dump-union [Infantry, Thousand Sons]
- perplexing-cloak-warpforged-cabal (differs): authored [Thousand Sons] vs dump-union [Infantry, Thousand Sons]
- eruption-of-vitality-ritual-of-regeneration (multi-group-or): authored [Thousand Sons] vs dump-union [Infantry, Mounted, Psyker, Thousand Sons]
- curse-of-life-ritual-of-regeneration (multi-group-or): authored [Thousand Sons] vs dump-union [Infantry, Mounted, Psyker, Thousand Sons]
- walking-rampart-sekhetar-cohort (multi-group-or): authored [Thousand Sons] vs dump-union [Exalted Sorcerer, Sorcerer]
- occulus-infernum-sekhetar-cohort (multi-group-or): authored [Thousand Sons] vs dump-union [Exalted Sorcerer, Sorcerer]
- unravelled-fates-servants-of-change (differs): authored [Thousand Sons] vs dump-union [Thousand Sons, Tzaangor Shaman]
- thicket-of-bladed-bone-servants-of-change (differs): authored [Spawn] vs dump-union [Chaos Spawn]

## tyranids

**keyword_restrictions — authored kept, REVIEW:**
- ominous-presence-crusher-stampede (differs): authored [Tyranids] vs dump-union [Monster, Tyranids]
- enraged-reserves-crusher-stampede (differs): authored [Tyranids] vs dump-union [Monster, Tyranids]
- null-nodules-crusher-stampede (differs): authored [Tyranids] vs dump-union [Monster, Tyranids]
- monstrous-nemesis-crusher-stampede (differs): authored [Tyranids] vs dump-union [Monster, Tyranids]
- chameleonic-vanguard-onslaught (differs): authored [Tyranids] vs dump-union [Vanguard Invader]
- stalker-vanguard-onslaught (differs): authored [Tyranids] vs dump-union [Vanguard Invader]
- power-of-the-hive-mind-synaptic-nexus (differs): authored [Tyranids] vs dump-union [Psyker, Tyranids]
- psychostatic-disruption-synaptic-nexus (differs): authored [Tyranids] vs dump-union [Synapse, Tyranids]
- synaptic-control-synaptic-nexus (differs): authored [Tyranids] vs dump-union [Synapse, Tyranids]
- the-dirgeheart-of-kharis-synaptic-nexus (differs): authored [Tyranids] vs dump-union [Synapse, Tyranids]
- ocular-adaptation-warrior-bioform-onslaught (multi-group-or): authored [Tyranids] vs dump-union [Tyranid Prime with Lash Whip, Tyranids, Winged Tyranid Prime]
- elevated-might-warrior-bioform-onslaught (multi-group-or): authored [Tyranids] vs dump-union [Tyranid Prime with Lash Whip, Tyranids, Winged Tyranid Prime]
- trygon-prime-subterranean-assault (differs): authored [Tyranids] vs dump-union [Trygon]
- encircling-horrors-ambush-predators (multi-group-or): authored [Tyranids] vs dump-union [Lictor, Neurolictor, Tyranids, Von Ryan’s Leapers]
- cryptophotaic-camouflage-ambush-predators (differs): authored [Tyranids] vs dump-union [Tyranids, Von Ryan’s Leapers]
- destabilising-predation-talons-of-the-norn-queen (differs): authored [Tyranids] vs dump-union [Norn Emissary, Tyranids]
- synaptoprescience-talons-of-the-norn-queen (differs): authored [Tyranids] vs dump-union [Norn Assimilator, Tyranids]

**Repo enhancements absent from dump** (left as-is):
- synaptic-lynchpin-invasion-fleet
- synaptic-tyrant-warrior-bioform-onslaught
- sensory-assimilation-warrior-bioform-onslaught

## ultramarines

**Cost changes** (old → new):
- avenging-avatar-reclamation-force: 0 → 10

**keyword_restrictions — authored kept, REVIEW:**
- rites-of-war-1st-company-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Terminator]
- iron-resolve-1st-company-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Terminator]
- adept-of-the-codex-gladius-task-force (differs): authored [Adeptus Astartes] vs dump-union [Captain]
- fury-of-the-storm-stormlance-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Mounted]
- hunters-instincts-stormlance-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Mounted]
- celerity-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- prescience-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- obfuscation-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- temporal-corridor-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- fusillade-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- the-blade-driven-deep-vanguard-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Infantry]
- execute-and-redeploy-vanguard-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Phobos]
- shadow-war-veteran-vanguard-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Phobos]
- indomitable-fury-anvil-siege-force (differs): authored [Adeptus Astartes] vs dump-union [Gravis]
- fleet-commander-anvil-siege-force (differs): authored [Adeptus Astartes] vs dump-union [Captain]
- champion-of-humanity-firestorm-assault-force (differs): authored [Adeptus Astartes] vs dump-union [Tacticus]
- war-tempered-artifice-firestorm-assault-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Infantry]
- target-augury-web-ironstorm-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Techmarine]
- adept-of-the-omnissiah-ironstorm-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Techmarine]
- bellicose-weapon-spirits-fulguris-task-force (differs): authored [Adeptus Astartes] vs dump-union [Speeder]
- raptorial-cogitator-core-fulguris-task-force (differs): authored [Adeptus Astartes] vs dump-union [Speeder]
- shroud-field-subversion-assets (differs): authored [Adeptus Astartes] vs dump-union [Phobos]
- death-in-the-dark-subversion-assets (differs): authored [Adeptus Astartes] vs dump-union [Infantry, Phobos]
- shock-deployment-armoured-speartip (multi-group-or): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Gravis, Terminator]
- honour-indefatigable-ceramite-sentinels (differs): authored [Adeptus Astartes] vs dump-union [Gravis]
- redoubtable-machine-spirit-headhunter-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Vehicle]
- gunnery-honours-headhunter-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Vehicle]
- firestorm-coordinators-headhunter-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Vehicle]
- astartes-tank-ace-headhunter-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Vehicle]

## white-scars

**keyword_restrictions — authored kept, REVIEW:**
- chogorian-huntmaster-spearpoint-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Mounted]
- rites-of-war-1st-company-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Terminator]
- iron-resolve-1st-company-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Terminator]
- adept-of-the-codex-gladius-task-force (differs): authored [Adeptus Astartes] vs dump-union [Captain]
- fury-of-the-storm-stormlance-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Mounted]
- hunters-instincts-stormlance-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Mounted]
- celerity-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- prescience-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- obfuscation-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- temporal-corridor-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- fusillade-librarius-conclave (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Psyker]
- the-blade-driven-deep-vanguard-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Infantry]
- execute-and-redeploy-vanguard-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Phobos]
- shadow-war-veteran-vanguard-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Phobos]
- indomitable-fury-anvil-siege-force (differs): authored [Adeptus Astartes] vs dump-union [Gravis]
- fleet-commander-anvil-siege-force (differs): authored [Adeptus Astartes] vs dump-union [Captain]
- champion-of-humanity-firestorm-assault-force (differs): authored [Adeptus Astartes] vs dump-union [Tacticus]
- war-tempered-artifice-firestorm-assault-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Infantry]
- target-augury-web-ironstorm-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Techmarine]
- adept-of-the-omnissiah-ironstorm-spearhead (differs): authored [Adeptus Astartes] vs dump-union [Techmarine]
- bellicose-weapon-spirits-fulguris-task-force (differs): authored [Adeptus Astartes] vs dump-union [Speeder]
- raptorial-cogitator-core-fulguris-task-force (differs): authored [Adeptus Astartes] vs dump-union [Speeder]
- shroud-field-subversion-assets (differs): authored [Adeptus Astartes] vs dump-union [Phobos]
- death-in-the-dark-subversion-assets (differs): authored [Adeptus Astartes] vs dump-union [Infantry, Phobos]
- shock-deployment-armoured-speartip (multi-group-or): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Gravis, Terminator]
- honour-indefatigable-ceramite-sentinels (differs): authored [Adeptus Astartes] vs dump-union [Gravis]
- redoubtable-machine-spirit-headhunter-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Vehicle]
- gunnery-honours-headhunter-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Vehicle]
- firestorm-coordinators-headhunter-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Vehicle]
- astartes-tank-ace-headhunter-task-force (differs): authored [Adeptus Astartes] vs dump-union [Adeptus Astartes, Vehicle]

## world-eaters

**keyword_restrictions — authored kept, REVIEW:**
- gateways-to-glory-vessels-of-wrath (differs): authored [World Eaters] vs dump-union [Daemon Prince, World Eaters]
- chosen-of-the-blood-god-cult-of-blood (differs): authored [World Eaters] vs dump-union [Monster, World Eaters]
- butcher-lord-cult-of-blood (differs): authored [World Eaters] vs dump-union [Infantry, World Eaters]
- brazen-form-cult-of-blood (differs): authored [World Eaters] vs dump-union [Monster, World Eaters]
- blood-forged-armour-khorne-daemonkin (multi-group-or): authored [World Eaters] vs dump-union [Blood Legions, World Eaters]
- disciple-of-khorne-khorne-daemonkin (differs): authored [World Eaters] vs dump-union [Lord on Juggernaut]
- malicious-vigour-possessed-slaughterband (differs): authored [World Eaters] vs dump-union [Slaughterbound]
- killing-clarity-possessed-slaughterband (differs): authored [World Eaters] vs dump-union [Daemon, World Eaters]
- frenzied-focus-possessed-slaughterband (differs): authored [World Eaters] vs dump-union [Daemon, World Eaters]
- violent-demise-possessed-slaughterband (differs): authored [World Eaters] vs dump-union [Daemon, World Eaters]
- talons-of-butchery-brazen-engines (differs): authored [Maulerfiend] vs dump-union [Maulerfiend, World Eaters]
- murder-forged-entity-brazen-engines (differs): authored [Vehicle] vs dump-union [Vehicle, World Eaters]

## New enhancements in dump (no repo entity — author in a follow-up)

- animus-damper-pantheon-of-woe
- assassins-eye-path-of-the-outcast
- dakkamek-speedwaaagh
- deathwing-assault-wrath-of-the-rock
- decoy-targets-veiled-blade-elimination-force
- esoteric-explosives-veiled-blade-elimination-force
- extra-platin-ardmob
- eye-of-the-augurium-hallowed-conclave
- farstrydr-node-hearthfyre-arsenal
- high-kahl-hearthguard-covenant
- intraneural-biotech-veiled-blade-elimination-force
- kustom-shokk-box-speedwaaagh
- mark-of-the-nekrosor-cursed-legion
- master-meknologist-speedwaaagh
- micromelta-rounds-veiled-blade-elimination-force
- mortality-shroud-aura-the-phaerons-armoury
- oathbound-exemplar-companions-of-vehemence
- on-the-archtraitors-bridge-wrath-of-the-doomed
- pledge-of-eternal-servitude-coterie-of-the-conceited
- quantum-goad-pantheon-of-woe
- reletavistic-tether-pantheon-of-woe
- sharp-eyes-abhuman-auxiliaries
- shroudwerke-talismans-farseekers
- singularity-matrix-pantheon-of-woe
- slippery-git-taktikal-brigade
- spy-skull-data-link-ceramite-sentinels
- stave-of-kurnous-spirit-conclave
- supa-burny-fuel-speedwaaagh
- synaptic-linchpin-invasion-fleet

