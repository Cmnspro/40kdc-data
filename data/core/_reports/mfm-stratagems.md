# MFM stratagems — APPLIED

APPLIED (first-class dump columns): `cp_cost` ← cpCost, `player_turn` ← key,
`type` ← category (fill-only), `category` ← detachmentId presence.
REVIEW ONLY (not written): `phases`, prose-derived — the structured
`stratagem_phase` table is a buggy index (Insane Bravery→charge, Holy
Avarice→command, Scriptural Prognosis→all-five), so authored phases win.
`timing` + `game_version` left authored.

| Dir | Matched | cp | turn | type fill | type conflict | category | phases (review) | repo-only |
|---|--:|--:|--:|--:|--:|--:|--:|--:|
| (core) | 9 | 0 | 0 | 0 | 0 | 0 | 1 | 1 |
| adepta-sororitas | 36 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |
| adeptus-astartes | 66 | 0 | 7 | 0 | 0 | 0 | 0 | 0 |
| adeptus-custodes | 45 | 0 | 2 | 0 | 0 | 0 | 1 | 0 |
| adeptus-mechanicus | 51 | 0 | 4 | 3 | 0 | 0 | 0 | 0 |
| aeldari | 78 | 0 | 0 | 0 | 0 | 0 | 0 | 3 |
| agents-of-the-imperium | 30 | 0 | 0 | 0 | 0 | 0 | 1 | 0 |
| astra-militarum | 57 | 0 | 2 | 0 | 0 | 0 | 1 | 0 |
| black-templars | 90 | 0 | 7 | 0 | 0 | 0 | 0 | 0 |
| blood-angels | 98 | 0 | 10 | 5 | 0 | 0 | 2 | 0 |
| chaos-daemons | 46 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |
| chaos-knights | 39 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |
| chaos-space-marines | 92 | 0 | 3 | 11 | 0 | 0 | 1 | 1 |
| crimson-fists | 66 | 0 | 7 | 0 | 0 | 0 | 0 | 0 |
| dark-angels | 100 | 0 | 9 | 0 | 0 | 0 | 0 | 0 |
| death-guard | 45 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |
| deathwatch | 71 | 0 | 7 | 0 | 0 | 0 | 0 | 0 |
| drukhari | 45 | 0 | 1 | 0 | 0 | 0 | 1 | 0 |
| emperors-children | 51 | 0 | 4 | 0 | 0 | 0 | 0 | 0 |
| genestealer-cults | 45 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |
| grey-knights | 45 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |
| imperial-fists | 71 | 0 | 7 | 0 | 0 | 0 | 0 | 0 |
| imperial-knights | 38 | 0 | 2 | 0 | 0 | 0 | 0 | 4 |
| iron-hands | 71 | 0 | 7 | 0 | 0 | 0 | 0 | 0 |
| leagues-of-votann | 50 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |
| necrons | 63 | 0 | 3 | 0 | 0 | 0 | 0 | 0 |
| orks | 57 | 0 | 0 | 6 | 0 | 0 | 0 | 8 |
| raven-guard | 71 | 0 | 7 | 0 | 0 | 0 | 0 | 0 |
| salamanders | 68 | 0 | 7 | 0 | 0 | 0 | 0 | 0 |
| space-wolves | 99 | 0 | 8 | 6 | 0 | 0 | 0 | 0 |
| tau-empire | 30 | 0 | 0 | 0 | 0 | 0 | 0 | 9 |
| thousand-sons | 45 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| tyranids | 50 | 0 | 0 | 0 | 0 | 0 | 0 | 4 |
| ultramarines | 77 | 0 | 10 | 0 | 0 | 0 | 0 | 0 |
| white-scars | 71 | 0 | 8 | 0 | 0 | 0 | 0 | 0 |
| world-eaters | 39 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |
| **TOTAL** | **2105** | **0** | **131** | **31** | **0** | **0** | **8** | **30** |

## (core)

**Phases — authored vs prose-derived (review only, NOT applied):**
- fire-overwatch: [movement,charge] vs [movement]

## adepta-sororitas

**Player-turn ← key (applied):**
- inspirational-battle-canticles-chorus-of-condemnation: your-turn → either

## adeptus-astartes

**Player-turn ← key (applied):**
- tactical-decapitation-orbital-assault-force: your-turn → either
- codex-discipline-bastion-task-force: your-turn → either
- shock-bombardment-bastion-task-force: your-turn → either
- guided-disruption-bastion-task-force: your-turn → either
- angels-defiant-bastion-task-force: opponent-turn → either
- light-of-vengeance-bastion-task-force: your-turn → either
- priority-strike-ceramite-sentinels: your-turn → either

## adeptus-custodes

**Player-turn ← key (applied):**
- flawless-construction-might-of-the-moritoi: opponent-turn → either
- hardened-resolve-tharanatoi-hammerblow: opponent-turn → either

**Phases — authored vs prose-derived (review only, NOT applied):**
- unstoppable-solar-spearhead: [movement] vs [movement,charge]

## adeptus-mechanicus

**Player-turn ← key (applied):**
- scriptural-prognosis-lords-of-the-forge: opponent-turn → either
- overloaded-safeguards-lords-of-the-forge: your-turn → either
- echoes-of-the-conduit-wars-luminen-auto-choir: your-turn → either
- servo-driven-charge-eradication-cohort: your-turn → either

**Type ← category (filled — was unset):**
- servo-driven-charge-eradication-cohort: → wargear
- threat-cogitation-targeters-eradication-cohort: → wargear
- unshackled-wrath-eradication-cohort: → wargear

## agents-of-the-imperium

**Phases — authored vs prose-derived (review only, NOT applied):**
- stun-grenades-ordo-hereticus-purgation-force: [command,movement,shooting,charge,fight] vs [command]

## astra-militarum

**Player-turn ← key (applied):**
- thick-skulled-obdurance-abhuman-auxiliaries: opponent-turn → either
- engine-of-wrath-steel-hammer: your-turn → either

**Phases — authored vs prose-derived (review only, NOT applied):**
- on-my-position-bridgehead-strike: [fight] vs [charge]

## black-templars

**Player-turn ← key (applied):**
- tactical-decapitation-orbital-assault-force: your-turn → either
- codex-discipline-bastion-task-force: your-turn → either
- shock-bombardment-bastion-task-force: your-turn → either
- guided-disruption-bastion-task-force: your-turn → either
- angels-defiant-bastion-task-force: opponent-turn → either
- light-of-vengeance-bastion-task-force: your-turn → either
- priority-strike-ceramite-sentinels: your-turn → either

## blood-angels

**Player-turn ← key (applied):**
- insensate-rampage-rage-cursed-onslaught: opponent-turn → either
- martial-paragon-legacy-of-grace: your-turn → either
- no-barrier-to-retribution-wrath-of-the-doomed: opponent-turn → your-turn
- tactical-decapitation-orbital-assault-force: your-turn → either
- codex-discipline-bastion-task-force: your-turn → either
- shock-bombardment-bastion-task-force: your-turn → either
- guided-disruption-bastion-task-force: your-turn → either
- angels-defiant-bastion-task-force: opponent-turn → either
- light-of-vengeance-bastion-task-force: your-turn → either
- priority-strike-ceramite-sentinels: your-turn → either

**Type ← category (filled — was unset):**
- a-grim-warning-rage-cursed-onslaught: → battle-tactic
- limb-from-limb-rage-cursed-onslaught: → battle-tactic
- deathless-duty-rage-cursed-onslaught: → strategic-ploy
- insensate-rampage-rage-cursed-onslaught: → strategic-ploy
- red-wrath-rage-cursed-onslaught: → strategic-ploy

**Phases — authored vs prose-derived (review only, NOT applied):**
- death-from-the-skies-the-angelic-host: [charge] vs [movement]
- no-barrier-to-retribution-wrath-of-the-doomed: [shooting] vs [charge]

## chaos-daemons

**Player-turn ← key (applied):**
- call-to-murder-lords-of-the-warp: your-turn → either

## chaos-knights

**Player-turn ← key (applied):**
- merciless-fusillade-helhunt-lance: your-turn → either

## chaos-space-marines

**Player-turn ← key (applied):**
- plunging-talons-murdertalon-raiders: your-turn → either
- empyric-dislocation-warpstrike-champions: opponent-turn → either
- balefire-boon-cult-of-the-arkifane: your-turn → either

**Type ← category (filled — was unset):**
- empyric-dislocation-warpstrike-champions: → battle-tactic
- warp-tainted-warpstrike-champions: → strategic-ploy
- siegebreaker-strike-warpstrike-champions: → strategic-ploy
- armour-of-corruption-warpstrike-champions: → strategic-ploy
- warp-flicker-warpstrike-champions: → strategic-ploy
- portal-of-spite-warpstrike-champions: → battle-tactic
- touch-of-the-arkifane-cult-of-the-arkifane: → battle-tactic
- balefire-boon-cult-of-the-arkifane: → battle-tactic
- biomechanoid-regeneration-cult-of-the-arkifane: → epic-deed
- forge-fire-surge-cult-of-the-arkifane: → strategic-ploy
- unholy-fortitude-cult-of-the-arkifane: → strategic-ploy

**Phases — authored vs prose-derived (review only, NOT applied):**
- seize-the-prize-hurons-marauders: [fight] vs [movement]

## crimson-fists

**Player-turn ← key (applied):**
- tactical-decapitation-orbital-assault-force: your-turn → either
- codex-discipline-bastion-task-force: your-turn → either
- shock-bombardment-bastion-task-force: your-turn → either
- guided-disruption-bastion-task-force: your-turn → either
- angels-defiant-bastion-task-force: opponent-turn → either
- light-of-vengeance-bastion-task-force: your-turn → either
- priority-strike-ceramite-sentinels: your-turn → either

## dark-angels

**Player-turn ← key (applied):**
- exacting-punishment-interrogation-conclave: your-turn → either
- terrifying-zeal-interrogation-conclave: your-turn → either
- tactical-decapitation-orbital-assault-force: your-turn → either
- codex-discipline-bastion-task-force: your-turn → either
- shock-bombardment-bastion-task-force: your-turn → either
- guided-disruption-bastion-task-force: your-turn → either
- angels-defiant-bastion-task-force: opponent-turn → either
- light-of-vengeance-bastion-task-force: your-turn → either
- priority-strike-ceramite-sentinels: your-turn → either

## death-guard

**Player-turn ← key (applied):**
- fresh-vectors-contagion-engines: your-turn → either

## deathwatch

**Player-turn ← key (applied):**
- tactical-decapitation-orbital-assault-force: your-turn → either
- codex-discipline-bastion-task-force: your-turn → either
- shock-bombardment-bastion-task-force: your-turn → either
- guided-disruption-bastion-task-force: your-turn → either
- angels-defiant-bastion-task-force: opponent-turn → either
- light-of-vengeance-bastion-task-force: your-turn → either
- priority-strike-ceramite-sentinels: your-turn → either

## drukhari

**Player-turn ← key (applied):**
- prioritised-victim-kabalite-agonysts: your-turn → either

**Phases — authored vs prose-derived (review only, NOT applied):**
- preternatural-agility-spectacle-of-spite: [charge,movement] vs [charge]

## emperors-children

**Player-turn ← key (applied):**
- delight-in-agony-elegant-brutes: opponent-turn → either
- psychedelic-soulflame-elegant-brutes: your-turn → either
- possessive-mania-frenzied-host: opponent-turn → either
- honour-is-for-fools-spectacle-of-slaughter: your-turn → either

## genestealer-cults

**Player-turn ← key (applied):**
- living-up-to-legend-heroes-of-the-uprising: your-turn → either
- surging-broodworship-heroes-of-the-uprising: your-turn → either

## grey-knights

**Player-turn ← key (applied):**
- sanctified-kill-zone-warpbane-task-force: your-turn → either

## imperial-fists

**Player-turn ← key (applied):**
- codex-discipline-bastion-task-force: your-turn → either
- light-of-vengeance-bastion-task-force: your-turn → either
- angels-defiant-bastion-task-force: opponent-turn → either
- guided-disruption-bastion-task-force: your-turn → either
- shock-bombardment-bastion-task-force: your-turn → either
- tactical-decapitation-orbital-assault-force: your-turn → either
- priority-strike-ceramite-sentinels: your-turn → either

## imperial-knights

**Player-turn ← key (applied):**
- neural-lash-throne-bonded-outriders: your-turn → either
- strength-from-exile-freeblade-company: your-turn → either

## iron-hands

**Player-turn ← key (applied):**
- tactical-decapitation-orbital-assault-force: your-turn → either
- codex-discipline-bastion-task-force: your-turn → either
- shock-bombardment-bastion-task-force: your-turn → either
- guided-disruption-bastion-task-force: your-turn → either
- angels-defiant-bastion-task-force: opponent-turn → either
- light-of-vengeance-bastion-task-force: your-turn → either
- priority-strike-ceramite-sentinels: your-turn → either

## leagues-of-votann

**Player-turn ← key (applied):**
- built-to-last-armoured-trailblazers: opponent-turn → either

## necrons

**Player-turn ← key (applied):**
- dominance-protocols-hand-of-the-dynasty: either → your-turn
- will-of-the-conqueror-hand-of-the-dynasty: your-turn → either
- subsurface-quantumweave-the-phaerons-armoury: opponent-turn → either

## orks

**Type ← category (filled — was unset):**
- mount-up-ladz-blitz-brigade: → strategic-ploy
- armoured-duellists-blitz-brigade: → battle-tactic
- impervious-blitz-brigade: → strategic-ploy
- mekanised-brutality-blitz-brigade: → strategic-ploy
- run-em-down-blitz-brigade: → strategic-ploy
- yooz-in-trouble-now-blitz-brigade: → strategic-ploy

## raven-guard

**Player-turn ← key (applied):**
- tactical-decapitation-orbital-assault-force: your-turn → either
- codex-discipline-bastion-task-force: your-turn → either
- shock-bombardment-bastion-task-force: your-turn → either
- guided-disruption-bastion-task-force: your-turn → either
- angels-defiant-bastion-task-force: opponent-turn → either
- light-of-vengeance-bastion-task-force: your-turn → either
- priority-strike-ceramite-sentinels: your-turn → either

## salamanders

**Player-turn ← key (applied):**
- tactical-decapitation-orbital-assault-force: your-turn → either
- codex-discipline-bastion-task-force: your-turn → either
- shock-bombardment-bastion-task-force: your-turn → either
- guided-disruption-bastion-task-force: your-turn → either
- angels-defiant-bastion-task-force: opponent-turn → either
- light-of-vengeance-bastion-task-force: your-turn → either
- priority-strike-ceramite-sentinels: your-turn → either

## space-wolves

**Player-turn ← key (applied):**
- the-foe-foreseen-saga-of-the-great-wolf: opponent-turn → either
- tactical-decapitation-orbital-assault-force: your-turn → either
- codex-discipline-bastion-task-force: your-turn → either
- shock-bombardment-bastion-task-force: your-turn → either
- guided-disruption-bastion-task-force: your-turn → either
- angels-defiant-bastion-task-force: opponent-turn → either
- light-of-vengeance-bastion-task-force: your-turn → either
- priority-strike-ceramite-sentinels: your-turn → either

**Type ← category (filled — was unset):**
- the-foe-foreseen-saga-of-the-great-wolf: → battle-tactic
- unrelenting-hunters-saga-of-the-great-wolf: → strategic-ploy
- grimnars-command-saga-of-the-great-wolf: → strategic-ploy
- eye-of-the-pack-saga-of-the-great-wolf: → battle-tactic
- battle-instincts-saga-of-the-great-wolf: → strategic-ploy
- fenrisian-ferocity-saga-of-the-great-wolf: → strategic-ploy

## ultramarines

**Player-turn ← key (applied):**
- armour-of-contempt-blade-of-ultramar: opponent-turn → either
- tactical-foresight-blade-of-ultramar: opponent-turn → either
- furious-dedication-reclamation-force: your-turn → either
- tactical-decapitation-orbital-assault-force: your-turn → either
- codex-discipline-bastion-task-force: your-turn → either
- shock-bombardment-bastion-task-force: your-turn → either
- guided-disruption-bastion-task-force: your-turn → either
- angels-defiant-bastion-task-force: opponent-turn → either
- light-of-vengeance-bastion-task-force: your-turn → either
- priority-strike-ceramite-sentinels: your-turn → either

## white-scars

**Player-turn ← key (applied):**
- armour-of-contempt-spearpoint-task-force: opponent-turn → either
- tactical-decapitation-orbital-assault-force: your-turn → either
- codex-discipline-bastion-task-force: your-turn → either
- shock-bombardment-bastion-task-force: your-turn → either
- guided-disruption-bastion-task-force: your-turn → either
- angels-defiant-bastion-task-force: opponent-turn → either
- light-of-vengeance-bastion-task-force: your-turn → either
- priority-strike-ceramite-sentinels: your-turn → either

## world-eaters

**Player-turn ← key (applied):**
- apoplectic-clarity-brazen-engines: your-turn → either

Stratagems in dump with no repo match (author via faction-pack flow): 106

