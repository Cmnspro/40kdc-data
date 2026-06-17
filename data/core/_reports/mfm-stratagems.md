# MFM stratagems — APPLIED

APPLIED: only `cp_cost` (authoritative). phases/turn columns are DERIVED FROM
whenRules FOR REVIEW ONLY (not written — lossy on "…or the Fight phase" idioms);
`timing` + `game_version` left authored. Triage the diffs below by hand.

| Dir | Matched | cp applied | phases (review) | turn (review) | repo-only |
|---|--:|--:|--:|--:|--:|
| (core) | 9 | 1 | 1 | 0 | 1 |
| adepta-sororitas | 36 | 0 | 0 | 7 | 0 |
| adeptus-astartes | 66 | 0 | 0 | 6 | 0 |
| adeptus-custodes | 45 | 0 | 1 | 8 | 0 |
| adeptus-mechanicus | 51 | 0 | 0 | 6 | 0 |
| aeldari | 78 | 0 | 0 | 11 | 3 |
| agents-of-the-imperium | 30 | 0 | 1 | 10 | 0 |
| astra-militarum | 57 | 0 | 1 | 0 | 0 |
| black-templars | 90 | 0 | 0 | 9 | 0 |
| blood-angels | 98 | 0 | 2 | 8 | 0 |
| chaos-daemons | 46 | 0 | 0 | 6 | 0 |
| chaos-knights | 39 | 0 | 0 | 7 | 0 |
| chaos-space-marines | 92 | 0 | 1 | 14 | 1 |
| crimson-fists | 66 | 0 | 0 | 6 | 0 |
| dark-angels | 100 | 0 | 0 | 9 | 0 |
| death-guard | 45 | 0 | 0 | 4 | 0 |
| deathwatch | 71 | 0 | 0 | 6 | 0 |
| drukhari | 45 | 0 | 1 | 9 | 0 |
| emperors-children | 51 | 0 | 0 | 9 | 0 |
| genestealer-cults | 45 | 0 | 0 | 8 | 0 |
| grey-knights | 45 | 0 | 0 | 8 | 0 |
| imperial-fists | 71 | 0 | 0 | 12 | 0 |
| imperial-knights | 38 | 0 | 0 | 4 | 4 |
| iron-hands | 71 | 0 | 0 | 7 | 0 |
| leagues-of-votann | 50 | 0 | 0 | 6 | 0 |
| necrons | 63 | 0 | 0 | 22 | 0 |
| orks | 57 | 0 | 0 | 5 | 8 |
| raven-guard | 71 | 0 | 0 | 6 | 0 |
| salamanders | 68 | 0 | 0 | 6 | 0 |
| space-wolves | 99 | 0 | 0 | 8 | 0 |
| tau-empire | 30 | 0 | 0 | 5 | 9 |
| thousand-sons | 45 | 0 | 0 | 6 | 0 |
| tyranids | 50 | 0 | 0 | 10 | 4 |
| ultramarines | 77 | 0 | 0 | 5 | 0 |
| white-scars | 71 | 0 | 0 | 5 | 0 |
| world-eaters | 39 | 0 | 0 | 6 | 0 |
| **TOTAL** | **2105** | **1** | **8** | **264** | **30** |

## (core)

**CP changes:**
- heroic-intervention: 2 → 1

**Phases — authored vs derived (review only, NOT applied):**
- fire-overwatch: [movement,charge] vs [movement]

## adepta-sororitas

**Player-turn — authored vs derived (review only, NOT applied):**
- purity-of-suffering-penitent-host: either vs opponent-turn
- shield-of-aversion-bringers-of-flame: either vs opponent-turn
- shield-of-denial-champions-of-faith: either vs your-turn
- shield-of-faith-army-of-faith: either vs your-turn
- divine-guidance-army-of-faith: either vs your-turn
- suffer-not-the-unfaithful-champions-of-faith: either vs your-turn
- blinding-radiance-army-of-faith: either vs opponent-turn

## adeptus-astartes

**Player-turn — authored vs derived (review only, NOT applied):**
- armour-of-contempt-1st-company-task-force: either vs opponent-turn
- heroes-of-the-chapter-1st-company-task-force: either vs your-turn
- crucible-of-battle-firestorm-assault-force: either vs your-turn
- mercy-is-weakness-ironstorm-spearhead: either vs your-turn
- vengeful-animus-ironstorm-spearhead: either vs your-turn
- machine-wrath-armoured-speartip: either vs your-turn

## adeptus-custodes

**Phases — authored vs derived (review only, NOT applied):**
- unstoppable-solar-spearhead: [movement] vs [movement,charge]

**Player-turn — authored vs derived (review only, NOT applied):**
- flawless-construction-solar-spearhead: either vs opponent-turn
- wrathful-advance-solar-spearhead: either vs your-turn
- arcane-genetic-alchemy-shield-host: either vs your-turn
- witch-hunters-null-maiden-vigil: either vs your-turn
- empyric-severance-talons-of-the-emperor: either vs opponent-turn
- the-emperors-auspice-auric-champions: either vs opponent-turn
- superhuman-reserves-auric-champions: either vs your-turn
- gilded-champion-lions-of-the-emperor: either vs your-turn

## adeptus-mechanicus

**Player-turn — authored vs derived (review only, NOT applied):**
- eradication-protocols-haloscreed-battle-clade: either vs your-turn
- targeting-override-haloscreed-battle-clade: either vs your-turn
- incantation-of-the-iron-soul-data-psalm-conclave: either vs your-turn
- priority-reclamation-explorator-maniple: either vs your-turn
- bionic-endurance-skitarii-hunter-cohort: either vs opponent-turn
- binharic-offence-skitarii-hunter-cohort: either vs your-turn

## aeldari

**Player-turn — authored vs derived (review only, NOT applied):**
- death-from-on-high-windrider-host: either vs your-turn
- seers-eye-spirit-conclave: either vs your-turn
- wraithbone-armour-spirit-conclave: either vs opponent-turn
- macabre-resilience-devoted-of-ynnead: either vs opponent-turn
- emissaries-of-ynnead-devoted-of-ynnead: either vs your-turn
- warding-salvoes-guardian-battlehost: either vs your-turn
- shield-nodes-guardian-battlehost: either vs opponent-turn
- lightning-fast-reactions-warhost: either vs opponent-turn
- warrior-focus-aspect-host: either vs your-turn
- overflight-windrider-host: either vs your-turn
- ruthless-killers-eldritch-raiders: either vs your-turn

## agents-of-the-imperium

**Phases — authored vs derived (review only, NOT applied):**
- stun-grenades-ordo-hereticus-purgation-force: [command,movement,shooting,charge,fight] vs [command]

**Player-turn — authored vs derived (review only, NOT applied):**
- dispense-justice-ordo-hereticus-purgation-force: either vs your-turn
- prime-target-veiled-blade-elimination-force: either vs your-turn
- armour-of-contempt-ordo-xenos-alien-hunters: either vs opponent-turn
- hyperstimms-veiled-blade-elimination-force: either vs opponent-turn
- exact-punishment-ordo-hereticus-purgation-force: opponent-turn vs either
- inviolate-jurisdiction-ordo-hereticus-purgation-force: either vs opponent-turn
- rites-of-exorcism-ordo-malleus-daemon-hunters: either vs your-turn
- violent-acquisition-imperialis-fleet: either vs your-turn
- truesilver-armour-ordo-malleus-daemon-hunters: either vs opponent-turn
- hexagrammic-wards-ordo-malleus-daemon-hunters: either vs opponent-turn

## astra-militarum

**Phases — authored vs derived (review only, NOT applied):**
- on-my-position-bridgehead-strike: [fight] vs [charge]

## black-templars

**Player-turn — authored vs derived (review only, NOT applied):**
- spoor-of-the-unholy-vindication-task-force: either vs your-turn
- refusal-to-yield-vindication-task-force: either vs your-turn
- hearts-hardened-to-duty-companions-of-vehemence: either vs your-turn
- armour-of-contempt-1st-company-task-force: either vs opponent-turn
- heroes-of-the-chapter-1st-company-task-force: either vs your-turn
- crucible-of-battle-firestorm-assault-force: either vs your-turn
- mercy-is-weakness-ironstorm-spearhead: either vs your-turn
- vengeful-animus-ironstorm-spearhead: either vs your-turn
- machine-wrath-armoured-speartip: either vs your-turn

## blood-angels

**Phases — authored vs derived (review only, NOT applied):**
- death-from-the-skies-the-angelic-host: [charge] vs [movement]
- no-barrier-to-retribution-wrath-of-the-doomed: [shooting] vs [charge]

**Player-turn — authored vs derived (review only, NOT applied):**
- armour-of-contempt-the-lost-brethren: either vs opponent-turn
- no-barrier-to-retribution-wrath-of-the-doomed: opponent-turn vs your-turn
- angelic-grace-liberator-assault-group: either vs your-turn
- heroes-of-the-chapter-1st-company-task-force: either vs your-turn
- crucible-of-battle-firestorm-assault-force: either vs your-turn
- mercy-is-weakness-ironstorm-spearhead: either vs your-turn
- vengeful-animus-ironstorm-spearhead: either vs your-turn
- machine-wrath-armoured-speartip: either vs your-turn

## chaos-daemons

**Player-turn — authored vs derived (review only, NOT applied):**
- draught-of-terror-daemonic-incursion: either vs your-turn
- fever-visions-plague-legion: either vs your-turn
- pyrogenesis-scintillating-legion: either vs your-turn
- plague-of-woes-plague-legion: opponent-turn vs either
- spiteful-demise-shadow-legion: either vs your-turn
- thieves-of-pain-legion-of-excess: either vs your-turn

## chaos-knights

**Player-turn — authored vs derived (review only, NOT applied):**
- claimed-for-the-dark-gods-lords-of-dread: either vs your-turn
- spiteful-demise-lords-of-dread: either vs your-turn
- titanic-duel-lords-of-dread: either vs your-turn
- trophy-hunter-lords-of-dread: either vs your-turn
- runes-of-disdain-lords-of-dread: either vs opponent-turn
- feral-arrogance-helhunt-lance: either vs your-turn
- beasthide-manifestation-helhunt-lance: either vs opponent-turn

## chaos-space-marines

**Phases — authored vs derived (review only, NOT applied):**
- seize-the-prize-hurons-marauders: [fight] vs [movement]

**Player-turn — authored vs derived (review only, NOT applied):**
- unfailingly-obdurate-renegade-raiders: either vs opponent-turn
- desperate-pledge-soulforged-warpack: either vs your-turn
- vengeful-destruction-renegade-warband: either vs your-turn
- chosen-for-glory-chaos-cult: either vs your-turn
- contemptuous-disregard-veterans-of-the-long-war: either vs opponent-turn
- talons-sunk-deep-nightmare-hunt: either vs your-turn
- prey-on-the-weak-nightmare-hunt: either vs your-turn
- sadistic-display-nightmare-hunt: either vs your-turn
- profane-zeal-pactbound-zealots: either vs your-turn
- never-outgunned-renegade-warband: either vs your-turn
- bloody-example-dread-talons: either vs your-turn
- eye-of-the-gods-pactbound-zealots: either vs your-turn
- endless-ire-veterans-of-the-long-war: either vs your-turn
- monstrous-visages-creations-of-bile: either vs opponent-turn

## crimson-fists

**Player-turn — authored vs derived (review only, NOT applied):**
- armour-of-contempt-liberator-assault-group: either vs opponent-turn
- heroes-of-the-chapter-1st-company-task-force: either vs your-turn
- crucible-of-battle-firestorm-assault-force: either vs your-turn
- mercy-is-weakness-ironstorm-spearhead: either vs your-turn
- vengeful-animus-ironstorm-spearhead: either vs your-turn
- machine-wrath-armoured-speartip: either vs your-turn

## dark-angels

**Player-turn — authored vs derived (review only, NOT applied):**
- armour-of-contempt-inner-circle-task-force: either vs opponent-turn
- unforgiven-fury-unforgiven-task-force: either vs your-turn
- inescapable-justice-wrath-of-the-rock: either vs your-turn
- talon-strike-company-of-hunters: either vs your-turn
- heroes-of-the-chapter-1st-company-task-force: either vs your-turn
- crucible-of-battle-firestorm-assault-force: either vs your-turn
- mercy-is-weakness-ironstorm-spearhead: either vs your-turn
- vengeful-animus-ironstorm-spearhead: either vs your-turn
- machine-wrath-armoured-speartip: either vs your-turn

## death-guard

**Player-turn — authored vs derived (review only, NOT applied):**
- blessings-of-filth-champions-of-contagion: either vs your-turn
- grotesque-fortitude-champions-of-contagion: either vs opponent-turn
- disgustingly-resilient-virulent-vectorium: either vs opponent-turn
- malignance-magnified-champions-of-contagion: either vs your-turn

## deathwatch

**Player-turn — authored vs derived (review only, NOT applied):**
- armour-of-contempt-black-spear-task-force: either vs opponent-turn
- heroes-of-the-chapter-1st-company-task-force: either vs your-turn
- crucible-of-battle-firestorm-assault-force: either vs your-turn
- mercy-is-weakness-ironstorm-spearhead: either vs your-turn
- vengeful-animus-ironstorm-spearhead: either vs your-turn
- machine-wrath-armoured-speartip: either vs your-turn

## drukhari

**Phases — authored vs derived (review only, NOT applied):**
- preternatural-agility-spectacle-of-spite: [charge,movement] vs [charge]

**Player-turn — authored vs derived (review only, NOT applied):**
- malicious-frenzy-reapers-wager: either vs your-turn
- fighting-shadows-realspace-raiders: either vs opponent-turn
- instinctive-spite-realspace-raiders: either vs your-turn
- connoisseurs-of-pain-covenite-coterie: either vs opponent-turn
- insensible-to-pain-realspace-raiders: either vs opponent-turn
- tailored-toxins-kabalite-cartel: either vs your-turn
- symphony-of-suffering-covenite-coterie: either vs your-turn
- poisoners-art-covenite-coterie: either vs your-turn
- vicious-blades-skysplinter-assault: either vs your-turn

## emperors-children

**Player-turn — authored vs derived (review only, NOT applied):**
- heightened-jealousy-slaaneshs-chosen: either vs your-turn
- sustained-by-agony-carnival-of-excess: either vs your-turn
- incessant-violence-peerless-bladesmen: either vs your-turn
- contemptuous-disregard-court-of-the-phoenician: either vs opponent-turn
- diabolic-majesty-slaaneshs-chosen: either vs your-turn
- unbound-arrogance-coterie-of-the-conceited: either vs your-turn
- ecstatic-slaughter-carnival-of-excess: either vs your-turn
- protection-of-the-dark-prince-coterie-of-the-conceited: either vs your-turn
- armour-of-abhorrence-coterie-of-the-conceited: either vs opponent-turn

## genestealer-cults

**Player-turn — authored vs derived (review only, NOT applied):**
- devoted-crew-outlander-claw: either vs opponent-turn
- avenge-the-star-children-final-day: either vs opponent-turn
- coordinated-trap-host-of-ascension: either vs your-turn
- primed-and-readied-host-of-ascension: either vs your-turn
- saintly-paroxysm-biosanctic-broodsurge: either vs your-turn
- in-the-shadow-of-iron-brood-brothers-auxilia: either vs your-turn
- evasive-vanguard-biosanctic-broodsurge: either vs your-turn
- along-shadowed-trails-outlander-claw: either vs your-turn

## grey-knights

**Player-turn — authored vs derived (review only, NOT applied):**
- aggressive-anticipation-augurium-task-force: either vs your-turn
- appointed-hour-augurium-task-force: either vs your-turn
- abominus-class-targets-sanctic-spearhead: either vs your-turn
- forewarned-evasion-augurium-task-force: either vs opponent-turn
- warding-chant-banishers: either vs opponent-turn
- truesilver-will-sanctic-spearhead: either vs your-turn
- duty-unending-brotherhood-strike: opponent-turn vs either
- unending-fidelity-hallowed-conclave: either vs opponent-turn

## imperial-fists

**Player-turn — authored vs derived (review only, NOT applied):**
- armour-of-contempt-emperors-shield: either vs opponent-turn
- fury-of-the-first-emperors-shield: either vs your-turn
- codex-discipline-bastion-task-force: either vs your-turn
- light-of-vengeance-bastion-task-force: either vs your-turn
- angels-defiant-bastion-task-force: either vs opponent-turn
- guided-disruption-bastion-task-force: either vs your-turn
- shock-bombardment-bastion-task-force: either vs your-turn
- heroes-of-the-chapter-1st-company-task-force: either vs your-turn
- crucible-of-battle-firestorm-assault-force: either vs your-turn
- mercy-is-weakness-ironstorm-spearhead: either vs your-turn
- vengeful-animus-ironstorm-spearhead: either vs your-turn
- machine-wrath-armoured-speartip: either vs your-turn

## imperial-knights

**Player-turn — authored vs derived (review only, NOT applied):**
- drive-them-out-gate-warden-lance: either vs your-turn
- courageous-stand-questoris-companions: either vs opponent-turn
- titanic-duel-questoris-companions: either vs your-turn
- moment-of-glory-questoris-companions: either vs your-turn

## iron-hands

**Player-turn — authored vs derived (review only, NOT applied):**
- armour-of-contempt-hammer-of-avernii: either vs opponent-turn
- ruthless-butchery-hammer-of-avernii: either vs your-turn
- heroes-of-the-chapter-1st-company-task-force: either vs your-turn
- crucible-of-battle-firestorm-assault-force: either vs your-turn
- mercy-is-weakness-ironstorm-spearhead: either vs your-turn
- vengeful-animus-ironstorm-spearhead: either vs your-turn
- machine-wrath-armoured-speartip: either vs your-turn

## leagues-of-votann

**Player-turn — authored vs derived (review only, NOT applied):**
- brekkeknots-hearthband: either vs opponent-turn
- adaptable-avarice-persecution-prospect: either vs your-turn
- weavewerke-buttress-delve-assault-shift: opponent-turn vs either
- auxiliary-contract-mercenary-oathband: either vs your-turn
- opportunistic-escalation-brandfast-oathband: opponent-turn vs either
- reactive-reprisal-needgaard-oathband: opponent-turn vs either

## necrons

**Player-turn — authored vs derived (review only, NOT applied):**
- molecular-targeting-cryptek-conclave: either vs your-turn
- methodical-murder-cursed-legion: either vs your-turn
- image-of-death-cursed-legion: either vs opponent-turn
- the-spoor-of-frailty-annihilation-legion: either vs your-turn
- entrophasic-aura-targeting-pantheon-of-woe: either vs your-turn
- enslaved-artifice-obeisance-phalanx: either vs your-turn
- nanoassembly-protocols-obeisance-phalanx: either vs opponent-turn
- curse-of-the-cryptek-canoptek-court: either vs opponent-turn
- merciless-reclamation-starshatter-arsenal: either vs your-turn
- unyielding-forms-starshatter-arsenal: either vs opponent-turn
- cynosure-of-eradication-canoptek-court: either vs your-turn
- disharmonisation-cascade-pantheon-of-woe: either vs your-turn
- mass-transmogrification-pantheon-of-woe: either vs your-turn
- your-time-is-nigh-obeisance-phalanx: either vs opponent-turn
- mortis-protocols-cursed-legion: either vs your-turn
- masks-of-death-annihilation-legion: either vs opponent-turn
- protocol-of-the-undying-legions-awakened-dynasty: either vs opponent-turn
- hyperphasic-recall-hypercrypt-legion: either vs opponent-turn
- protocol-of-the-vengeful-stars-awakened-dynasty: opponent-turn vs either
- microscarab-swarm-cryptek-conclave: either vs opponent-turn
- animus-curse-cryptek-conclave: either vs opponent-turn
- quantum-deflection-hypercrypt-legion: either vs opponent-turn

## orks

**Player-turn — authored vs derived (review only, NOT applied):**
- ard-as-nails-war-horde: either vs opponent-turn
- armed-to-da-teef-bully-boyz: either vs your-turn
- careen-war-horde: either vs your-turn
- speediest-freeks-kult-of-speed: either vs opponent-turn
- too-arrogant-to-die-bully-boyz: either vs opponent-turn

## raven-guard

**Player-turn — authored vs derived (review only, NOT applied):**
- armour-of-contempt-company-of-hunters: either vs opponent-turn
- heroes-of-the-chapter-1st-company-task-force: either vs your-turn
- crucible-of-battle-firestorm-assault-force: either vs your-turn
- mercy-is-weakness-ironstorm-spearhead: either vs your-turn
- vengeful-animus-ironstorm-spearhead: either vs your-turn
- machine-wrath-armoured-speartip: either vs your-turn

## salamanders

**Player-turn — authored vs derived (review only, NOT applied):**
- armour-of-contempt-forgefathers-seekers: either vs opponent-turn
- crucible-of-battle-forgefathers-seekers: either vs your-turn
- heroes-of-the-chapter-1st-company-task-force: either vs your-turn
- mercy-is-weakness-ironstorm-spearhead: either vs your-turn
- vengeful-animus-ironstorm-spearhead: either vs your-turn
- machine-wrath-armoured-speartip: either vs your-turn

## space-wolves

**Player-turn — authored vs derived (review only, NOT applied):**
- champions-guidance-saga-of-the-bold: either vs your-turn
- territorial-advantage-saga-of-the-hunter: either vs your-turn
- armour-of-contempt-1st-company-task-force: either vs opponent-turn
- heroes-of-the-chapter-1st-company-task-force: either vs your-turn
- crucible-of-battle-firestorm-assault-force: either vs your-turn
- mercy-is-weakness-ironstorm-spearhead: either vs your-turn
- vengeful-animus-ironstorm-spearhead: either vs your-turn
- machine-wrath-armoured-speartip: either vs your-turn

## tau-empire

**Player-turn — authored vs derived (review only, NOT applied):**
- a-trap-well-laid-kroot-hunting-pack: either vs your-turn
- fail-safe-detonator-retaliation-cadre: either vs your-turn
- experimental-modifications-auxiliary-cadre: either vs your-turn
- stimm-injectors-retaliation-cadre: either vs opponent-turn
- emp-grenades-kroot-hunting-pack: either vs opponent-turn

## thousand-sons

**Player-turn — authored vs derived (review only, NOT applied):**
- sulphurous-veil-changehost-of-deceit: either vs opponent-turn
- hex-marked-armour-warpforged-cabal: either vs opponent-turn
- destined-by-fate-grand-coven: either vs your-turn
- warped-vicissitude-warpmeld-pact: either vs opponent-turn
- deranged-ferocity-warpmeld-pact: either vs your-turn
- revenge-of-the-rubricae-rubricae-phalanx: opponent-turn vs either

## tyranids

**Player-turn — authored vs derived (review only, NOT applied):**
- irresistible-will-synaptic-nexus: either vs your-turn
- reinforced-hive-node-synaptic-nexus: either vs opponent-turn
- teeming-masses-unending-swarm: either vs opponent-turn
- swarming-masses-unending-swarm: either vs your-turn
- surprise-assault-vanguard-onslaught: either vs your-turn
- rapid-regeneration-invasion-fleet: either vs opponent-turn
- ablative-carapace-assimilation-swarm: either vs opponent-turn
- synaptic-goading-unending-swarm: either vs your-turn
- overrun-invasion-fleet: either vs your-turn
- reclaim-biomass-assimilation-swarm: either vs your-turn

## ultramarines

**Player-turn — authored vs derived (review only, NOT applied):**
- heroes-of-the-chapter-1st-company-task-force: either vs your-turn
- crucible-of-battle-firestorm-assault-force: either vs your-turn
- mercy-is-weakness-ironstorm-spearhead: either vs your-turn
- vengeful-animus-ironstorm-spearhead: either vs your-turn
- machine-wrath-armoured-speartip: either vs your-turn

## white-scars

**Player-turn — authored vs derived (review only, NOT applied):**
- heroes-of-the-chapter-1st-company-task-force: either vs your-turn
- crucible-of-battle-firestorm-assault-force: either vs your-turn
- mercy-is-weakness-ironstorm-spearhead: either vs your-turn
- vengeful-animus-ironstorm-spearhead: either vs your-turn
- machine-wrath-armoured-speartip: either vs your-turn

## world-eaters

**Player-turn — authored vs derived (review only, NOT applied):**
- daemonic-fury-khorne-daemonkin: either vs your-turn
- blessing-of-burning-blood-khorne-daemonkin: either vs opponent-turn
- daemonic-resistance-possessed-slaughterband: either vs opponent-turn
- a-worthy-skull-khorne-daemonkin: either vs your-turn
- skulls-for-the-skull-throne-berzerker-warband: either vs your-turn
- in-the-shadow-of-brass-idols-cult-of-blood: either vs opponent-turn

Stratagems in dump with no repo match (author in a follow-up): 106

