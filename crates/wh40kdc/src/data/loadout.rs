//! Wargear-loadout maths shared by every consumer of the dataset: how many
//! models may take an option, the maximal (take-every-swap) loadout, the valid
//! count range for each weapon, and whether an edited loadout is legal.
//!
//! The base loadout is derived, not stored: a weapon in `unit.weapon_ids` that
//! never appears as the *replacement* of any option is a **base** weapon, carried
//! by every model; a weapon that does appear as a replacement is **optional**,
//! carried only by the models that took the swap. This holds for uniform
//! infantry squads and is exactly what the conformance corpus pins. Mirror of
//! `tools/src/data/loadout.ts`.

use std::collections::{BTreeMap, HashMap, HashSet};

use crate::generated::{Unit, UnitCompositionModelsItem, WargearOption};

/// Inclusive count range a single weapon/wargear id may take in a loadout.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct WeaponBound {
    pub min: u64,
    pub max: u64,
}

/// A resolved loadout: entity id (weapon or wargear) → count across the unit.
/// Counts are signed because an intermediate swap can drive a malformed dataset
/// negative; valid data never does.
#[derive(Debug, Clone, PartialEq, Eq, Default)]
pub struct Loadout {
    pub counts: BTreeMap<String, i64>,
}

/// A loadout-rule violation. `id` is the offending weapon/wargear id.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Violation {
    pub id: String,
    pub code: ViolationCode,
    pub message: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ViolationCode {
    ExceedsMax,
    BelowMin,
    SwapConflict,
}

impl ViolationCode {
    pub fn as_str(self) -> &'static str {
        match self {
            ViolationCode::ExceedsMax => "exceeds-max",
            ViolationCode::BelowMin => "below-min",
            ViolationCode::SwapConflict => "swap-conflict",
        }
    }
}

/// The maximum number of models that may take `option` in a unit of
/// `model_count` models. See [`super`] / the TS mirror for the semantics.
pub fn option_cap(option: &WargearOption, model_count: u64) -> u64 {
    let Some(c) = option.model_constraint.as_ref() else {
        return model_count;
    };
    let mut cap = if c.any_number {
        model_count
    } else if let Some(per) = c.per_n_models {
        model_count / per.get()
    } else {
        c.max_count.map(|m| m.get()).unwrap_or(1)
    };
    if let Some(m) = c.max_count {
        cap = cap.min(m.get());
    }
    // A swap is per-model: at most one per model, so never more than
    // model_count — a `max_count` larger than the current squad size must not
    // drive a weapon count negative. (u64 floors the lower bound at zero.)
    cap.min(model_count)
}

/// The ids a single option adds for the given choice branch (default 0).
fn added_ids(option: &WargearOption, choice_index: usize) -> Vec<&str> {
    if !option.replacement.is_empty() {
        return option.replacement.iter().map(|i| i.as_str()).collect();
    }
    option
        .replacement_choice
        .get(choice_index)
        .map(|g| g.iter().map(|i| i.as_str()).collect())
        .unwrap_or_default()
}

/// Every id that any option can add — across all choice branches.
fn all_replacement_ids(options: &[&WargearOption]) -> HashSet<String> {
    let mut out = HashSet::new();
    for o in options {
        for id in &o.replacement {
            out.insert(id.to_string());
        }
        for group in &o.replacement_choice {
            for id in group {
                out.insert(id.to_string());
            }
        }
    }
    out
}

/// Every id that any option swaps OUT (the base weapon a swap replaces).
fn all_replaced_ids(options: &[&WargearOption]) -> HashSet<String> {
    let mut out = HashSet::new();
    for o in options {
        for id in &o.replaces {
            out.insert(id.to_string());
        }
    }
    out
}

/// Derived base (always-carried) weapon ids — the fallback when a unit has no
/// recorded [`LoadoutModel::default_weapon_ids`]. A `weapon_id` is base iff it
/// is swapped out by some option (`replaces`) OR it never appears on any
/// option's *added* side. The `replaces` clause is load-bearing: a base weapon
/// can also be re-added inside another option's choice branch and is still base
/// — checking only the added side would wrongly drop it. An *orphan* weapon (in
/// `weapon_ids`, touched by no option) stays base, correct for a vehicle's fixed
/// main gun.
fn base_weapon_ids(unit: &Unit, options: &[&WargearOption]) -> Vec<String> {
    let added = all_replacement_ids(options);
    let replaced = all_replaced_ids(options);
    unit.weapon_ids
        .iter()
        .map(|i| i.to_string())
        .filter(|id| replaced.contains(id) || !added.contains(id))
        .collect()
}

/// A unit-composition model row, as far as loadout maths cares: its count range,
/// whether it is a leader (taken at a fixed small count), and the weapons every
/// such model carries by default. Pass the unit's `unit_composition.models`
/// mapped into this shape.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct LoadoutModel {
    pub min: u64,
    pub max: u64,
    pub default_weapon_ids: Vec<String>,
    pub is_leader_model: bool,
}

impl From<&UnitCompositionModelsItem> for LoadoutModel {
    fn from(m: &UnitCompositionModelsItem) -> Self {
        LoadoutModel {
            min: m.min,
            max: m.max.get(),
            default_weapon_ids: m.default_weapon_ids.iter().map(|i| i.to_string()).collect(),
            is_leader_model: m.is_leader_model,
        }
    }
}

/// Map a unit-composition's model rows into the [`LoadoutModel`] shape the
/// loadout maths consumes.
pub fn loadout_models(models: &[UnitCompositionModelsItem]) -> Vec<LoadoutModel> {
    models.iter().map(LoadoutModel::from).collect()
}

/// True when every model row records a non-empty default loadout.
fn has_recorded_defaults(models: Option<&[LoadoutModel]>) -> bool {
    match models {
        Some(ms) => !ms.is_empty() && ms.iter().all(|m| !m.default_weapon_ids.is_empty()),
        None => false,
    }
}

/// Allocate `model_count` models across the composition's model-types: each
/// leader is taken at its `min` (in declared order, never exceeding the
/// remaining count), then the non-leader "bulk" types absorb the rest — each its
/// `min` first, then any leftover to the bulk type with the largest `max`. If
/// there are no non-leader rows the leaders act as the bulk sink. Deterministic;
/// mirrored across implementations and pinned by the conformance corpus.
fn allocate_models<'a>(
    models: &'a [LoadoutModel],
    model_count: u64,
) -> Vec<(&'a LoadoutModel, u64)> {
    let mut out: Vec<(&LoadoutModel, u64)> = models.iter().map(|m| (m, 0u64)).collect();
    let mut remaining = model_count;
    // Leaders first, at their declared minimum.
    for row in out.iter_mut() {
        if !row.0.is_leader_model {
            continue;
        }
        let c = row.0.min.min(remaining);
        row.1 += c;
        remaining -= c;
    }
    // Indices of the non-leader bulk rows; if none, the leaders are the sink.
    let mut bulk_idx: Vec<usize> = (0..out.len())
        .filter(|&i| !out[i].0.is_leader_model)
        .collect();
    if bulk_idx.is_empty() {
        bulk_idx = (0..out.len()).collect();
    }
    // Each bulk type takes its min, then the remainder lands on the largest-max type.
    for &i in &bulk_idx {
        let c = out[i].0.min.min(remaining);
        out[i].1 += c;
        remaining -= c;
    }
    if remaining > 0 && !bulk_idx.is_empty() {
        let sink = bulk_idx
            .iter()
            .copied()
            .reduce(|a, b| if out[b].0.max > out[a].0.max { b } else { a })
            .expect("bulk_idx is non-empty");
        out[sink].1 += remaining;
    }
    out
}

/// The base loadout counts: id → count across the unit with no swaps applied.
/// When the composition records per-model [`LoadoutModel::default_weapon_ids`],
/// those are authoritative — base = Σ over model-types of (allocated count ×
/// default weapons). Otherwise it falls back to [`base_weapon_ids`] × model_count.
fn base_counts(
    unit: &Unit,
    model_count: u64,
    options: &[&WargearOption],
    models: Option<&[LoadoutModel]>,
) -> BTreeMap<String, i64> {
    let mut counts: BTreeMap<String, i64> = BTreeMap::new();
    if has_recorded_defaults(models) {
        let models = models.expect("has_recorded_defaults implies Some");
        for (model, count) in allocate_models(models, model_count) {
            if count == 0 {
                continue;
            }
            for id in &model.default_weapon_ids {
                *counts.entry(id.to_string()).or_insert(0) += count as i64;
            }
        }
        return counts;
    }
    for id in base_weapon_ids(unit, options) {
        *counts.entry(id).or_insert(0) += model_count as i64;
    }
    counts
}

/// The base loadout: every model in its out-of-the-box configuration, no swaps
/// applied. This is the legal default a freshly-added unit ships with. Reads the
/// composition's recorded `default_weapon_ids` when present (authoritative),
/// otherwise derives the base set. [`maximal_loadout`] starts from this set and
/// then applies every option at full cap.
pub fn base_loadout(
    unit: &Unit,
    model_count: u64,
    options: &[&WargearOption],
    models: Option<&[LoadoutModel]>,
) -> Loadout {
    Loadout {
        counts: base_counts(unit, model_count, options, models),
    }
}

/// The maximal loadout: every base weapon on every model, then each option
/// applied at its full [`option_cap`] (choices take their first branch).
pub fn maximal_loadout(
    unit: &Unit,
    model_count: u64,
    options: &[&WargearOption],
    models: Option<&[LoadoutModel]>,
) -> Loadout {
    let mut counts = base_counts(unit, model_count, options, models);
    for option in options {
        let cap = option_cap(option, model_count) as i64;
        if cap == 0 {
            continue;
        }
        for id in &option.replaces {
            *counts.entry(id.to_string()).or_insert(0) -= cap;
        }
        for id in added_ids(option, 0) {
            *counts.entry(id.to_string()).or_insert(0) += cap;
        }
    }
    counts.retain(|_, n| *n != 0);
    Loadout { counts }
}

/// Inclusive valid count range for each weapon/wargear id, used to clamp a UI's
/// per-weapon inputs so invalid loadouts are unreachable.
pub fn weapon_bounds(
    unit: &Unit,
    model_count: u64,
    options: &[&WargearOption],
    models: Option<&[LoadoutModel]>,
) -> BTreeMap<String, WeaponBound> {
    let mut bounds: BTreeMap<String, WeaponBound> = BTreeMap::new();
    for (id, count) in base_counts(unit, model_count, options, models) {
        let n = count.max(0) as u64;
        bounds.insert(id, WeaponBound { min: n, max: n });
    }
    for option in options {
        let cap = option_cap(option, model_count);
        for id in &option.replaces {
            let b = bounds
                .entry(id.to_string())
                .or_insert(WeaponBound { min: 0, max: 0 });
            b.min = b.min.saturating_sub(cap);
        }
        let mut adds: HashSet<String> = HashSet::new();
        for id in &option.replacement {
            adds.insert(id.to_string());
        }
        for group in &option.replacement_choice {
            for id in group {
                adds.insert(id.to_string());
            }
        }
        for id in adds {
            let b = bounds.entry(id).or_insert(WeaponBound { min: 0, max: 0 });
            b.max += cap;
        }
    }
    bounds
}

/// Clamp a single weapon's requested count into its valid range. Ids with no
/// bound are returned unchanged (floored at zero).
pub fn clamp_weapon_count(bounds: &BTreeMap<String, WeaponBound>, id: &str, requested: u64) -> u64 {
    match bounds.get(id) {
        Some(b) => requested.min(b.max).max(b.min),
        None => requested,
    }
}

/// Report every weapon/wargear count outside its valid range, sorted by
/// `(id, code)` for stable cross-impl comparison.
pub fn validate_loadout(
    unit: &Unit,
    model_count: u64,
    options: &[&WargearOption],
    counts: &HashMap<String, i64>,
    models: Option<&[LoadoutModel]>,
) -> Vec<Violation> {
    let bounds = weapon_bounds(unit, model_count, options, models);
    let mut out = Vec::new();
    for (id, &n) in counts {
        let Some(b) = bounds.get(id) else { continue };
        if n > b.max as i64 {
            out.push(Violation {
                id: id.clone(),
                code: ViolationCode::ExceedsMax,
                message: format!("{id}: {n} exceeds max {}", b.max),
            });
        } else if n < b.min as i64 {
            out.push(Violation {
                id: id.clone(),
                code: ViolationCode::BelowMin,
                message: format!("{id}: {n} below min {}", b.min),
            });
        }
    }
    out.extend(swap_conflicts(unit, model_count, options, counts, models));
    out.sort_by(|a, b| a.id.cmp(&b.id).then(a.code.as_str().cmp(b.code.as_str())));
    out
}

/// Swap-conservation violations the independent per-id [`weapon_bounds`] can't
/// see: a model's replaceable slot holds the base weapon OR one of its swap
/// replacements, never both, so `count(base) + Σ count(replacements)` cannot
/// exceed `model_count`. Enforced only for the unambiguous shape — a base weapon
/// swapped out by plain (non-choice) options that replace it alone, whose
/// replacement ids are unique within this unit's option set and aren't
/// themselves base weapons. Mirror of `tools/src/data/loadout.ts`.
fn swap_conflicts(
    unit: &Unit,
    model_count: u64,
    options: &[&WargearOption],
    counts: &HashMap<String, i64>,
    models: Option<&[LoadoutModel]>,
) -> Vec<Violation> {
    let base_map = base_counts(unit, model_count, options, models);
    let base_ids: HashSet<String> = base_map.keys().cloned().collect();
    let mut added_by: HashMap<String, u32> = HashMap::new();
    for o in options {
        for id in &o.replacement {
            *added_by.entry(id.to_string()).or_insert(0) += 1;
        }
        for group in &o.replacement_choice {
            for id in group {
                *added_by.entry(id.to_string()).or_insert(0) += 1;
            }
        }
    }
    let mut out = Vec::new();
    for base in &base_ids {
        let mut clean_adds: HashSet<String> = HashSet::new();
        let mut messy = false;
        for o in options {
            if !o.replaces.iter().any(|r| r.as_str() == base.as_str()) {
                continue;
            }
            // Only a plain, single-target swap of this exact base weapon is unambiguous.
            if o.replaces.len() != 1 || !o.replacement_choice.is_empty() {
                messy = true;
                break;
            }
            for b in &o.replacement {
                if base_ids.contains(b.as_str())
                    || added_by.get(b.as_str()).copied().unwrap_or(0) > 1
                {
                    messy = true;
                    break;
                }
                clean_adds.insert(b.to_string());
            }
            if messy {
                break;
            }
        }
        if messy || clean_adds.is_empty() {
            continue;
        }
        // The slot can hold at most as many weapons as there are models carrying
        // this base weapon by default — its base count (model_count when not
        // per-model).
        let cap = base_map.get(base).copied().unwrap_or(model_count as i64);
        let mut total = counts.get(base).copied().unwrap_or(0);
        for b in &clean_adds {
            total += counts.get(b).copied().unwrap_or(0);
        }
        if total > cap {
            out.push(Violation {
                id: base.clone(),
                code: ViolationCode::SwapConflict,
                message: format!(
                    "{base} and its swap replacement(s) total {total}, exceeding {cap} \
                     (a model takes the base weapon or a swap, not both)"
                ),
            });
        }
    }
    out
}

#[cfg(all(test, feature = "bundled-data"))]
mod tests {
    use super::*;
    use crate::Dataset;

    fn berzerkers() -> (&'static crate::generated::Unit, Vec<&'static WargearOption>) {
        let ds = Dataset::embedded();
        let bz = ds
            .units
            .get("khorne-berzerkers")
            .expect("berzerkers in dataset");
        (bz, ds.wargear_options_of(bz))
    }

    #[test]
    fn maximal_loadout_berzerkers_at_10_matches_locked_numbers() {
        let (bz, opts) = berzerkers();
        assert_eq!(opts.len(), 4, "3 swaps + 1 add-on");
        let lo = maximal_loadout(bz, 10, &opts, None);
        let get = |k: &str| lo.counts.get(k).copied().unwrap_or(0);
        assert_eq!(get("bolt-pistol"), 7);
        assert_eq!(get("chainblade"), 8);
        assert_eq!(get("plasma-pistol"), 3);
        assert_eq!(get("khornate-eviscerator"), 2);
        assert_eq!(get("icon-of-khorne"), 1);
    }

    #[test]
    fn base_loadout_berzerkers_at_10_is_the_legal_default() {
        let (bz, opts) = berzerkers();
        let lo = base_loadout(bz, 10, &opts, None);
        // Base weapons only (never a replacement) — none of the swap/add-on ids.
        assert_eq!(lo.counts.get("bolt-pistol").copied(), Some(10));
        assert_eq!(lo.counts.get("chainblade").copied(), Some(10));
        assert_eq!(lo.counts.get("plasma-pistol").copied(), None);
        assert_eq!(lo.counts.len(), 2);
        // The legal default validates clean (the maximal set is what gets edited).
        let counts: HashMap<String, i64> = lo.counts.into_iter().collect();
        assert!(validate_loadout(bz, 10, &opts, &counts, None).is_empty());
    }

    #[test]
    fn option_cap_floors_a_ratio() {
        let (_bz, opts) = berzerkers();
        let ratio = opts
            .iter()
            .find(|o| {
                o.model_constraint
                    .as_ref()
                    .and_then(|c| c.per_n_models)
                    .is_some()
            })
            .expect("a per_n_models option");
        assert_eq!(option_cap(ratio, 10), 2);
        assert_eq!(option_cap(ratio, 9), 1);
    }

    #[test]
    fn validate_flags_over_cap_and_accepts_maximal() {
        let (bz, opts) = berzerkers();
        let mut over = HashMap::new();
        over.insert("plasma-pistol".to_string(), 4i64);
        let v = validate_loadout(bz, 10, &opts, &over, None);
        assert_eq!(v.len(), 1);
        assert_eq!(v[0].id, "plasma-pistol");
        assert_eq!(v[0].code, ViolationCode::ExceedsMax);

        let lo = maximal_loadout(bz, 10, &opts, None);
        let counts: HashMap<String, i64> = lo.counts.into_iter().collect();
        assert!(validate_loadout(bz, 10, &opts, &counts, None).is_empty());
    }

    #[test]
    fn validate_flags_swap_conflict() {
        // War Dog Brigand swaps the diabolus heavy stubber for a havoc
        // multi-launcher — one or the other, never both. Per-id bounds pass
        // (each in [0,1]); only the swap-conservation check catches the conflict.
        let ds = Dataset::embedded();
        let wd = ds.units.get("war-dog-brigand").expect("war-dog in dataset");
        let opts = ds.wargear_options_of(wd);
        let mut both = HashMap::new();
        both.insert("diabolus-heavy-stubber".to_string(), 1i64);
        both.insert("havoc-multi-launcher".to_string(), 1i64);
        let v = validate_loadout(wd, 1, &opts, &both, None);
        assert_eq!(v.len(), 1);
        assert_eq!(v[0].id, "diabolus-heavy-stubber");
        assert_eq!(v[0].code, ViolationCode::SwapConflict);

        let mut keep = HashMap::new();
        keep.insert("diabolus-heavy-stubber".to_string(), 1i64);
        assert!(validate_loadout(wd, 1, &opts, &keep, None).is_empty());
        let mut swap = HashMap::new();
        swap.insert("havoc-multi-launcher".to_string(), 1i64);
        assert!(validate_loadout(wd, 1, &opts, &swap, None).is_empty());
    }
}
