//! Battle-size → points/detachment caps, in one place.
//!
//! 11e battle sizes set both the army points ceiling and the detachment-point
//! budget: `incursion` = 1000 pts / 2 DP, `strike-force` = 2000 pts / 3 DP.
//! Centralised so the roster-legality checker and the importers agree on a
//! single source of truth. Mirror of `tools/src/data/battle-sizes.ts`.

use crate::import::BattleSize;

/// Army points ceiling for a battle size; `None` when the size is unknown.
pub fn points_limit_for_battle_size(battle_size: Option<BattleSize>) -> Option<u64> {
    match battle_size {
        Some(BattleSize::StrikeForce) => Some(2000),
        Some(BattleSize::Incursion) => Some(1000),
        None => None,
    }
}

/// 11e detachment-point budget for a battle size; `None` when the size is unknown.
pub fn detachment_cap_for_battle_size(battle_size: Option<BattleSize>) -> Option<u64> {
    match battle_size {
        Some(BattleSize::StrikeForce) => Some(3),
        Some(BattleSize::Incursion) => Some(2),
        None => None,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn caps_match_the_reference() {
        assert_eq!(
            points_limit_for_battle_size(Some(BattleSize::StrikeForce)),
            Some(2000)
        );
        assert_eq!(
            points_limit_for_battle_size(Some(BattleSize::Incursion)),
            Some(1000)
        );
        assert_eq!(points_limit_for_battle_size(None), None);
        assert_eq!(
            detachment_cap_for_battle_size(Some(BattleSize::StrikeForce)),
            Some(3)
        );
        assert_eq!(
            detachment_cap_for_battle_size(Some(BattleSize::Incursion)),
            Some(2)
        );
        assert_eq!(detachment_cap_for_battle_size(None), None);
    }
}
