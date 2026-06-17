//! Unit point-cost maths shared by every consumer of the dataset: given a unit,
//! a model count, and the unit's army ordinal, which `points` tier applies.
//!
//! 11e prices some datasheets by **army ordinal** — how many copies of that
//! datasheet you have already taken. The schema models this with optional
//! `unit_count_min`/`unit_count_max` bands on each `points` tier (1-based,
//! inclusive; an open-ended top band has `unit_count_max: null`). Selecting a
//! cost is a two-step filter: keep the tiers whose ordinal band contains this
//! copy, then pick the highest model-count tier the count reaches. A tier with
//! no `unit_count_min` is unbanded and applies to every copy (the common case).
//! Only native `points` are handled here; `allied_points` is a separate concern.
//! Mirror of `tools/src/data/pricing.ts`.

use crate::generated::{Unit, UnitPointsItem};

/// True when `ordinal` (1-based army copy) falls within `tier`'s ordinal band.
fn tier_covers_ordinal(tier: &UnitPointsItem, ordinal: u64) -> bool {
    let Some(min) = tier.unit_count_min else {
        return true; // unbanded: applies to every copy
    };
    if ordinal < min.get() {
        return false;
    }
    match tier.unit_count_max {
        Some(max) => ordinal <= max.get(),
        None => true, // open-ended top band
    }
}

/// Base point cost for a unit of `model_count` models taken as its `ordinal`-th
/// army copy (1-based). Among the tiers whose ordinal band covers this copy,
/// returns the cost of the highest `models` threshold the count reaches (lowest
/// tier when none is reached). Returns 0 when no tier applies — the caller
/// surfaces a violation rather than guessing.
pub fn base_unit_points(unit: &Unit, model_count: u64, ordinal: u64) -> u64 {
    let mut tiers: Vec<&UnitPointsItem> = unit
        .points
        .iter()
        .filter(|t| tier_covers_ordinal(t, ordinal))
        .collect();
    tiers.sort_by_key(|t| t.models.get());
    let Some(&first) = tiers.first() else {
        return 0;
    };
    let mut chosen = first;
    for t in &tiers {
        if model_count >= t.models.get() {
            chosen = t;
        }
    }
    chosen.cost
}

/// True when no points tier covers `model_count` for this `ordinal` (an
/// out-of-composition count, or an ordinal with no banded price). Mirrors the
/// band filter of [`base_unit_points`].
pub fn points_tier_missing(unit: &Unit, model_count: u64, ordinal: u64) -> bool {
    match unit
        .points
        .iter()
        .filter(|t| tier_covers_ordinal(t, ordinal))
        .map(|t| t.models.get())
        .min()
    {
        Some(min_models) => model_count < min_models,
        None => true,
    }
}

#[cfg(all(test, feature = "bundled-data"))]
mod tests {
    use super::*;
    use crate::Dataset;

    /// World Eaters Chaos Terminators (the id is shared with Emperor's Children,
    /// so resolve the WE copy via `by_faction`).
    fn we_chaos_terminators() -> &'static Unit {
        Dataset::embedded()
            .units
            .by_faction("world-eaters")
            .into_iter()
            .find(|u| u.id.as_str() == "chaos-terminators")
            .expect("WE chaos terminators in dataset")
    }

    #[test]
    fn ordinal_bands_we_chaos_terminators() {
        let ct = we_chaos_terminators();
        // 1st–2nd copy: lower band.
        assert_eq!(base_unit_points(ct, 5, 1), 175);
        assert_eq!(base_unit_points(ct, 5, 2), 175);
        assert_eq!(base_unit_points(ct, 10, 1), 350);
        // 3rd+ copy: higher band (open-ended top).
        assert_eq!(base_unit_points(ct, 5, 3), 185);
        assert_eq!(base_unit_points(ct, 10, 3), 360);
        assert_eq!(base_unit_points(ct, 5, 7), 185);
        // Defaults to the 1st copy's model selection within the band.
        assert_eq!(base_unit_points(ct, 7, 1), 175);
    }

    #[test]
    fn unbanded_unit_ignores_ordinal() {
        let ds = Dataset::embedded();
        let bz = ds.units.get("khorne-berzerkers").expect("berzerkers");
        assert_eq!(base_unit_points(bz, 10, 1), base_unit_points(bz, 10, 99));
    }

    #[test]
    fn tier_missing_below_smallest_band_tier() {
        let ct = we_chaos_terminators();
        assert!(!points_tier_missing(ct, 5, 1));
        assert!(!points_tier_missing(ct, 5, 3));
        assert!(points_tier_missing(ct, 4, 1));
    }
}
