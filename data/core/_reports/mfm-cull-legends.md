# MFM Legends cull — APPLIED

Drops repo units absent from the live (non-Legends) dump and prunes their wargear-options,
unit-compositions, leader-attachment refs, and now-orphaned weapons/wargear. Abilities are
reported, not edited.

| Dir | Units dropped | (legends/FW) | Wargear-opts | Comps | Leader entries | Bodyguard refs | Weapons | Wargear | Abilities orphaned |
|---|--:|:--|--:|--:|--:|--:|--:|--:|--:|
| adepta-sororitas | 2 | 0/2 | 2 | 2 | 0 | 0 | 2 | 0 | 5 |
| adeptus-astartes | 53 | 0/53 | 99 | 53 | 8 | 0 | 70 | 8 | 30 |
| adeptus-mechanicus | 4 | 0/4 | 7 | 4 | 0 | 0 | 8 | 0 | 7 |
| aeldari | 10 | 0/10 | 11 | 10 | 1 | 0 | 16 | 1 | 14 |
| agents-of-the-imperium | 6 | 0/6 | 7 | 6 | 3 | 0 | 4 | 1 | 6 |
| astra-militarum | 33 | 0/33 | 41 | 33 | 1 | 0 | 26 | 0 | 24 |
| chaos-daemons | 10 | 0/10 | 2 | 10 | 1 | 0 | 11 | 0 | 12 |
| chaos-space-marines | 29 | 0/29 | 34 | 29 | 11 | 0 | 41 | 2 | 38 |
| death-guard | 1 | 0/1 | 2 | 1 | 0 | 0 | 0 | 0 | 3 |
| drukhari | 2 | 0/2 | 0 | 2 | 0 | 0 | 3 | 0 | 2 |
| genestealer-cults | 1 | 0/1 | 0 | 1 | 0 | 0 | 1 | 0 | 3 |
| grey-knights | 2 | 0/2 | 6 | 2 | 0 | 0 | 2 | 0 | 0 |
| necrons | 8 | 0/8 | 4 | 8 | 4 | 0 | 6 | 0 | 15 |
| orks | 16 | 0/16 | 23 | 16 | 3 | 0 | 9 | 5 | 18 |
| tau-empire | 9 | 0/9 | 8 | 9 | 1 | 0 | 9 | 2 | 11 |
| tyranids | 3 | 0/3 | 1 | 3 | 1 | 0 | 3 | 0 | 4 |
| **TOTAL** | **189** | 0/189 | **247** | **189** | **34** | **0** | **211** | **19** | **192** |

## ⚠ Possible name-match bugs (dropped anyway — review)

A dropped unit whose slug closely matches a live dump unit — could be the same
unit under a drifted name rather than a true Legends entry.

- adeptus-astartes/land-speeder-tempest ~ live `land-speeder`
- orks/wartrakks ~ live `wartrakk`

## adepta-sororitas — dropped 2

- repressor (forge-world)
- battle-sanctum (forge-world)

**Weapons removed (orphaned):** dozer-ram, repressor-twin-heavy-flamer

**Abilities now referenced by 0 surviving units (review):** consecrated-ground, deadly-demise-d6, emergency-combat-embarkation, firing-deck-6, holy-cover

## adeptus-astartes — dropped 53

- sanguinary-priest-on-bike (forge-world)
- land-speeder-tempest (forge-world)
- javelin-attack-speeder (forge-world)
- deathstorm-drop-pod (forge-world)
- dreadnought-drop-pod (forge-world)
- mortis-dreadnought (forge-world)
- chaplain-venerable-dreadnought (forge-world)
- relic-contemptor-dreadnought (forge-world)
- tarantula-air-defence-battery (forge-world)
- sokar-pattern-stormbird (forge-world)
- mastodon (forge-world)
- terrax-pattern-termite (forge-world)
- rhino-primaris (forge-world)
- relic-razorback (forge-world)
- vindicator-laser-destroyer (forge-world)
- xiphon-interceptor (forge-world)
- deimos-predator (forge-world)
- whirlwind-scorpius (forge-world)
- leviathan-dreadnought (forge-world)
- deredeo-dreadnought (forge-world)
- carab-culln-the-risen (forge-world)
- sicaran-venator (forge-world)
- sicaran-battle-tank (forge-world)
- sicaran-omega (forge-world)
- sicaran-arcus (forge-world)
- sicaran-punisher (forge-world)
- storm-eagle-gunship (forge-world)
- fire-raptor-gunship (forge-world)
- caestus-assault-ram (forge-world)
- land-raider-helios (forge-world)
- land-raider-prometheus (forge-world)
- terminus-ultra (forge-world)
- land-raider-proteus (forge-world)
- land-raider-achilles (forge-world)
- land-raider-excelsior (forge-world)
- spartan (forge-world)
- typhon (forge-world)
- cerberus (forge-world)
- kratos (forge-world)
- thunderhawk-transporter (forge-world)
- fellblade (forge-world)
- falchion (forge-world)
- techmarine-on-bike (forge-world)
- apothecary-on-bike (forge-world)
- ancient-on-bike (forge-world)
- librarian-on-bike (forge-world)
- imperial-space-marine (forge-world)
- company-champion-on-bike (forge-world)
- rapier-carrier (forge-world)
- company-veterans-on-bikes (forge-world)
- tarantula-sentry-battery (forge-world)
- ultramarines-honour-guard (forge-world)
- iron-priest-on-thunderwolf (forge-world)

**Weapons removed (orphaned):** aiolos-missile-launcher, anvilus-autocannon-battery, arachnus-heavy-lascannon-battery, arcus-multi-launcher, boreas-air-defence-missiles, cerberus-neutron-pulse-array, conversion-beamer, crushing-teeth-and-claws, cyclonic-melta-lance, deathstorm-cannon-array, deathstorm-missile-array, disintegration-combi-gun, disintegration-pistol, dreadhammer-siege-cannon, dreadnought-chainfist, fellblade-accelerator-cannon, firefury-missile-batteries, godhammer-lascannons, grav-flux-bombard, graviton-blaster, graviton-cannon, helios-launcher, hellfire-plasma-cannonade, herakles-pattern-autocannon, infernus-cannon, iron-priest-hammer, javelin-missile-launcher, kratos-battle-cannon, laser-destroyer, laser-volley-cannon, leviathan-siege-claw, leviathan-siege-drill, magna-melta-cannon, melta-blast-gun, omega-plasma-array, omnissian-power-axe, plasma-cutter, plasma-destroyer, punisher-rotary-cannon, quad-heavy-bolter, quad-heavy-bolter, quad-lascannon, quad-launcher, quad-launcher, scorpius-multi-launcher, siege-melta-array, skyreaper-battery, storm-cannon, tarantula-air-defence-missiles, tarsus-scorpii, tempest-salvo-launcher, terminus-lascannon, termite-drill, terrax-melta-cutter, twin-avenger-bolt-cannon, twin-boltgun, twin-falchion-volcano-cannon, twin-hellstrike-launcher, twin-magna-melta, twin-plasma-gun, twin-volkite-caliver, twin-volkite-charger, twin-volkite-culverin, venator-neutron-laser, vengeance-launcher, volkite-caliver, volkite-cardanelle, volkite-culverin, volkite-falconet-battery, xiphon-missile-battery

**Wargear removed (orphaned):** explorator-augury-web, hellfire-plasma-carronade, long-vigil-melee-weapon, long-vigil-ranged-weapon, on-of-the-following-2-heavy-bolters2-heavy-flamers2-volkite-culverins, plasma-blaster, twin-hellstrike-missile-launchers, up-to-2-hunter-killer-missiles

**Abilities now referenced by 0 surviving units (review):** aerial-deployment, armoured-spearhead, atomantic-arc-reactor, command-squad-bodyguard, deadly-demise-2d6, death-hold, deathstorm-assault, deredeo-strike, even-in-death-i-serve, explorator-augury-web, ferocious-assault, fire-and-redeploy, honour-guard, honour-guard-of-macragge, into-the-foe, inviolable-transport, isolate-and-destroy, line-breaker, martial-superiority, mortis-strike, overwhelming-short-range-firepower, powerful-volley, rolling-fortress, rotating-death, sentry-programming, specialised-weapon-system, sunderer-of-fortresses, swift-assault, termite-assault, titan-killer

## adeptus-mechanicus — dropped 4

- terrax-pattern-termite (forge-world)
- x-101 (forge-world)
- secutarii-hoplites (forge-world)
- secutarii-peltasts (forge-world)

**Weapons removed (orphaned):** alpha-close-combat-weapon, alpha-close-combat-weapon, arc-lance, archeotech-pistol, galvanic-caster, termite-drill, terrax-melta-cutter, twin-volkite-charger

**Abilities now referenced by 0 surviving units (review):** blind-barrage, bound-creation, mindlock, secutarii, servitor-bodyguard, termite-assault, titan-guard

## aeldari — dropped 10

- firestorm (forge-world)
- phoenix (forge-world)
- vampire-hunter (forge-world)
- vampire-raider (forge-world)
- wasp-assault-walker (forge-world)
- corsair-skyreaver-band (forge-world)
- amallyn-shadowguide (forge-world)
- bonesinger (forge-world)
- corsair-cloud-dancer-band (forge-world)
- corsair-reaver-band (forge-world)

**Weapons removed (orphaned):** aeldari-missile-launcher, brace-of-pistols, corsair-firearm, dissonance-cannon, dissonance-pistol, firestorm-scatter-laser, phoenix-missile-array, phoenix-pulse-laser, power-blade, psytronome-shaper, ranger-long-rifle, spar-glaive, twin-pulse-laser, twin-vampire-pulsar, void-sabre, wasp-feet

**Wargear removed (orphaned):** shuriken-pistol-scorpion-chainsword

**Abilities now referenced by 0 surviving units (review):** bonesinger, cloudbreakers, deadly-demise-d6-2, hover, into-the-foe, psytronome-shaper, reaver-band, reckless-abandon, skyfire, skyleap, strafing-run, the-path-least-travelled, titan-hunter, way-of-the-shaper-psychic

## agents-of-the-imperium — dropped 6

- inquisitor-in-terminator-armour (forge-world)
- damned-legionnaires (forge-world)
- janus-draik (forge-world)
- neyam-shai-murad (forge-world)
- espern-locarno (forge-world)
- ur-025 (forge-world)

**Weapons removed (orphaned):** heirloom-pistol, mk-1-assault-weapon, monomolecular-rapier, negotiator-pistol

**Wargear removed (orphaned):** if-this-model-is-equipped-with-1-psychic-gifts-its-storm-bolter

**Abilities now referenced by 0 surviving units (review):** assigned-agents, evade-and-survive, gaze-into-the-immaterium-psychic, grim-spectres, that-redeploy-units-roll-off, the-third-eye-psychic

## astra-militarum — dropped 33

- elysian-drop-sentinel (forge-world)
- arvus-lighter (forge-world)
- tauros-assault-vehicle (forge-world)
- hydra-platform (forge-world)
- manticore-platform (forge-world)
- earthshaker-platform (forge-world)
- sentinel-powerlifter (forge-world)
- tauros-venator (forge-world)
- centaur-light-carrier (forge-world)
- storm-chimera (forge-world)
- aquila-lander (forge-world)
- vendetta-gunship (forge-world)
- salamander-scout-vehicle (forge-world)
- atlas-recovery-vehicle (forge-world)
- salamander-command-vehicle (forge-world)
- griffon-mortar-carrier (forge-world)
- stygies-destroyer-tank-hunter (forge-world)
- armageddon-pattern-medusa (forge-world)
- valkyrie-sky-talon (forge-world)
- minotaur (forge-world)
- macharius-omega (forge-world)
- dominus-armoured-siege-bombard (forge-world)
- gorgon-heavy-transport (forge-world)
- arkurian-stormhammer (forge-world)
- elysian-sniper-squad (forge-world)
- rein-and-raus (forge-world)
- death-rider-commissar (forge-world)
- quartermaster-cadre-squad (forge-world)
- mukaali-riders (forge-world)
- sabre-weapons-battery (forge-world)
- heavy-quad-launcher-team (forge-world)
- death-korps-grenadier-squad (forge-world)
- heavy-mortar-team (forge-world)

**Weapons removed (orphaned):** armoured-frame, commissars-close-combat-weapon, commissars-pistol, dominus-triple-bombard, gorgon-mortar, griffon-heavy-mortar, hellstrike-missile, hydra-quad-autocannon, landing-ramp, medical-scalpels, medusa-siege-cannon, minotaur-twin-earthshaker-cannon, omega-pattern-plasma-blastgun, powerlifter, quartermasters-close-combat-weapon, quartermasters-pistol, sergeants-close-combat-weapon, sergeants-pistol, stomping-feet, stormhammer-cannon, stub-pistol, stygies-laser-destroyer, tauros-grenade-launcher, twin-multi-laser, vendetta-hellstrike-rack, vendetta-twin-lascannon

**Abilities now referenced by 0 surviving units (review):** aerial-deployment, anti-armour-gunship, armoured-frontis, artillery-team, auspex-surveyor, blistering-advance, defence-searchlight, desert-riders, fire-support, mark-the-target, medicae-medi-packs, meteoric-descent, mindlock, mobile-hunter-killer, outflank, overwhelming-short-range-firepower, pinning-bombardment, powerlifter-charge, primed-and-ready, recovery-vehicle, sentinel-directives, tank-hunter, the-ratling-twins, turbo-boost

## chaos-daemons — dropped 10

- scabeiathrax-the-bloated (forge-world)
- zarakynel (forge-world)
- aetaosraukeres (forge-world)
- anggrath-the-unbound (forge-world)
- giant-chaos-spawn (forge-world)
- herald-of-slaanesh-on-steed-of-slaanesh (forge-world)
- furies (forge-world)
- pox-riders (forge-world)
- plague-toads (forge-world)
- spined-chaos-beast (forge-world)

**Weapons removed (orphaned):** blade-of-decay, bloodlash, bolt-of-tzeentch, churning-fangs-and-claws, daemonic-claws, jagged-claws-and-tusked-maw, pox-rider-plaguesword, souleater-blade, staff-of-cataclysm, warpfire-talons, yawning-maw

**Abilities now referenced by 0 surviving units (review):** bounding-assault, deadly-demise-d6-2, emissary-of-the-blood-god-aura, emissary-of-the-great-mutator-aura, emissary-of-the-plague-god-aura, emissary-of-the-prince-of-excess-aura, grandfather-s-blessing, lethal-caress, pouncing-leap, prey-on-the-weak, regenerating-monstrosity, warp-spines

## chaos-space-marines — dropped 29

- dreadclaw-drop-pod (forge-world)
- greater-blight-drone (forge-world)
- hell-blade (forge-world)
- blood-slaughterer (forge-world)
- chaos-deimos-predator (forge-world)
- decimator (forge-world)
- hell-talon (forge-world)
- kharybdis-assault-claw (forge-world)
- chaos-thunderhawk (forge-world)
- kytan-ravager (forge-world)
- greater-brass-scorpion (forge-world)
- gellerpox-infected (forge-world)
- negavolt-cultists (forge-world)
- renegade-plague-ogryns (forge-world)
- mutoid-vermin (forge-world)
- rogue-psyker (forge-world)
- sorcerer-on-bike (forge-world)
- sorcerer-on-disc-of-tzeentch (forge-world)
- sorcerer-on-palanquin-of-nurgle (forge-world)
- sorcerer-on-steed-of-slaanesh (forge-world)
- chaos-lord-on-palanquin-of-nurgle (forge-world)
- chaos-lord-on-steed-of-slaanesh (forge-world)
- chaos-lord-on-juggernaut (forge-world)
- chaos-lord-on-disc-of-tzeentch (forge-world)
- chaos-lord-on-bike (forge-world)
- renegade-enforcer (forge-world)
- renegade-ogryn-brutes (forge-world)
- renegade-heavy-weapons-squad (forge-world)
- renegade-ogryn-beast-handler (forge-world)

**Weapons removed (orphaned):** befouled-claws-and-fangs, belly-flamer, bile-maw, blade-struts, blade-struts, blightreaper-cannon, brutal-weapons, chaos-stave, decimator-butcher-cannon, decimator-claw, decimator-conversion-beamer, diseased-claws-and-fangs, electro-goads, enforcer-melee-weapon, enforcer-pistol, greater-plague-probe, hellcrusher-claws, hellflamer, hellmaw-flame-cannons, impaler-harpoon, infernus-cannon, kharybdis-storm-launcher, kytan-cleaver, kytan-gatling-cannon, magna-melta-cannon, mauler-goad-and-ripper-claw, melta-array, nurglings-claws-and-teeth, ogryn-plague-claws, ogryn-power-drill, ogryn-weapon, plasma-destroyer, psychic-strike, renegade-firearm, scorpion-cannon, shotgun, slaughter-blade, soulburner-petard, storm-laser, twin-decimator-claws, twin-slaughter-blade

**Wargear removed (orphaned):** any-numbers-of-models-heavy-stubbers, twin-decimator-claw

**Abilities now referenced by 0 surviving units (review):** aerial-assault, altered-reality-psychic, armoured-spearhead, beastmaster, bloodlust, bloody-stampede, bomb-rack, covering-fire, cursed-wardings-psychic, cut-off-their-escape, dark-favour-psychic, dark-pacts, dreadclaw-assault, enforcer, feculent-despair-aura-psychic, flames-of-change-psychic, gift-of-poxes-psychic, heavy-weapons-team, hovering-death, infernal-regeneration, infernal-speed, interceptor, kharybdis-assault, lord-of-fate, mischief-makers-aura, ogryn-combat-stimms, ogryns, psychic-barrier-psychic, revolting-regeneration, runes-of-the-blood-god, scuttling-gait, servants-of-the-abyss, super-heavy-walker, swift-assault, thunderhawk-cluster-bombs, unholy-power, voltagheist-field, wall-of-muscle

## death-guard — dropped 1

- death-guard-possessed (forge-world)

**Abilities now referenced by 0 surviving units (review):** diseased-icon, infectious-bloodshed, possessed

## drukhari — dropped 2

- reaper (forge-world)
- raven-strike-fighter (forge-world)

**Weapons removed (orphaned):** prow-blade, splinterstorm-cannon, storm-vortex-projector

**Abilities now referenced by 0 surviving units (review):** power-from-pain, strafing-run

## genestealer-cults — dropped 1

- tectonic-fragdrill (forge-world)

**Weapons removed (orphaned):** fragdrill

**Abilities now referenced by 0 surviving units (review):** manufactorum-cover, tectonic-fragdrill, underground-egress

## grey-knights — dropped 2

- grey-knights-dreadnought (forge-world)
- grey-knights-relic-razorback (forge-world)

**Weapons removed (orphaned):** nemesis-doomglaive, twin-psycannon

## necrons — dropped 8

- tomb-citadel-walls (forge-world)
- sentry-pylon (forge-world)
- night-shroud (forge-world)
- gauss-pylon (forge-world)
- anrakyr-the-traveller (forge-world)
- vargard-obyron (forge-world)
- lord (forge-world)
- nemesor-zahndrekh (forge-world)

**Weapons removed (orphaned):** focused-death-ray, gauss-annihilator, gauss-exterminator, gauss-exterminator, heat-cannon, tesla-arc

**Abilities now referenced by 0 surviving units (review):** counter-tactics, deadly-demise-3d6, death-sphere-bombardment, ghostwalk-mantle, lord-of-the-pyrrhian-eternals, mind-in-the-machine, phase-shift-generator-aura, phase-shifted-cover, phased-cover, relentless-march, teleportation-matrix, the-lord-s-will, the-vargard-s-duty, transient-madness, ziggurat-dock

## orks — dropped 16

- chinork-warkopta (forge-world)
- attack-fighta (forge-world)
- fighta-bommer (forge-world)
- kannonwagon (forge-world)
- lifta-wagon (forge-world)
- kill-krusha (forge-world)
- deff-rolla-battle-fortress (forge-world)
- deffkoptas-with-big-shootas (forge-world)
- da-red-gobbo (forge-world)
- big-mek-on-warbike (forge-world)
- painboy-on-warbike (forge-world)
- big-gunz (forge-world)
- wartrakks (forge-world)
- skorchas (forge-world)
- grot-bomm-launcha (forge-world)
- warbuggies (forge-world)

**Weapons removed (orphaned):** grot-guided-bomm, grot-guided-bomms, icon-of-da-revolushun, krusha-kannon, kustom-grot-blasta, lifta-droppa, rack-of-rokkits, rattler-kannon, spiked-wheel

**Wargear removed (orphaned):** kopta-rockets, up-to-2-big-bomms, up-to-3-big-shootas, up-to-5-big-shootas, wing-missilessmall-bomms

**Abilities now referenced by 0 surviving units (review):** aerial-deployment, big-bomms, big-booms, big-gunz, da-bigger-dey-are-da-better-dey-drop, da-biggest-booms, da-revolushun, deadly-demise-d6-2, firing-deck-22, firing-deck-6, furious-barrage, has-yoo-been-a-good-little-grot-this-year, interceptor, outflank, rolling-fortress, small-bomms, speed-freeks, strafing-run

## tau-empire — dropped 9

- tx42-piranha (forge-world)
- orca-dropship (forge-world)
- shaso-ralai (forge-world)
- xv9-hazard-battlesuits (forge-world)
- knarloc-riders (forge-world)
- great-knarloc (forge-world)
- drone-sentry-turret (forge-world)
- remote-sensor-tower (forge-world)
- heavy-gun-drones (forge-world)

**Weapons removed (orphaned):** experimental-pulse-submunitions-rifle, fusion-cascade, great-knarloc-beak-and-talons, knarloc-beak-and-talons, kroot-bolt-thrower, long-barrelled-burst-cannon, phased-ion-gun, twin-hazard-burst-cannon, twin-kroot-gun

**Wargear removed (orphaned):** baggage-harness, markerlight

**Abilities now referenced by 0 surviving units (review):** baggage-harness-aura, drone-escort, jet-pack-insertion, loping-stride, markerlight, orbital-comms-array-aura, outflank, photon-casters, reinforced-cover, sentinel-protocols, thunderous-pounce

## tyranids — dropped 3

- dimachaeron (forge-world)
- sky-slasher-swarms (forge-world)
- malanthrope (forge-world)

**Weapons removed (orphaned):** claws-and-teeth, grasping-tail, massive-scything-sickle-talons

**Abilities now referenced by 0 surviving units (review):** chitinous-horrors, digestion-spine, enhanced-toxic-miasma, prey-adaptation

