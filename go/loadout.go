package wh40kdc

import (
	"math"
	"sort"
)

// Wargear-loadout maths shared by every consumer of the dataset. Go mirror of
// python .../data/loadout.py.

// optionCap is the maximum number of models that may take an option in a unit
// of modelCount.
func optionCap(option map[string]any, modelCount int) int {
	c, _ := getMap(option, "model_constraint")
	if len(c) == 0 {
		return maxInt(0, modelCount)
	}
	var cap int
	switch {
	case truthy(c["any_number"]):
		cap = modelCount
	case truthy(c["per_n_models"]):
		per := asInt(c["per_n_models"])
		cap = int(math.Floor(float64(modelCount) / float64(per)))
	default:
		if c["max_count"] != nil {
			cap = asInt(c["max_count"])
		} else {
			cap = 1
		}
	}
	if c["max_count"] != nil {
		cap = minInt(cap, asInt(c["max_count"]))
	}
	// A swap is per-model: at most one per model, so never more than modelCount —
	// a max_count larger than the current squad size must not drive a weapon
	// count negative.
	return maxInt(0, minInt(cap, modelCount))
}

func addedIDs(option map[string]any, choiceIndex int) []string {
	if r := getStrList(option, "replacement"); len(r) > 0 {
		return r
	}
	choices := getList(option, "replacement_choice")
	if choiceIndex >= 0 && choiceIndex < len(choices) {
		return toStrList(choices[choiceIndex])
	}
	return nil
}

func allReplacementIDs(options []any) map[string]struct{} {
	out := map[string]struct{}{}
	for _, oAny := range options {
		o, _ := asMap(oAny)
		for _, id := range getStrList(o, "replacement") {
			out[id] = struct{}{}
		}
		for _, group := range getList(o, "replacement_choice") {
			for _, id := range toStrList(group) {
				out[id] = struct{}{}
			}
		}
	}
	return out
}

// allReplacedIDs is every id that any option swaps OUT (the base weapon a swap
// replaces).
func allReplacedIDs(options []any) map[string]struct{} {
	out := map[string]struct{}{}
	for _, oAny := range options {
		o, _ := asMap(oAny)
		for _, id := range getStrList(o, "replaces") {
			out[id] = struct{}{}
		}
	}
	return out
}

// baseWeaponIDs is the derived base (always-carried) weapon ids — the fallback
// when a unit has no recorded default_weapon_ids. A weapon_id is base iff it is
// swapped out by some option (replaces) OR it never appears on any option's
// added side. The replaces clause is load-bearing: a base weapon can also be
// re-added inside another option's choice branch and is still base. An orphan
// weapon (in weapon_ids, touched by no option) stays base.
func baseWeaponIDs(unit map[string]any, options []any) []string {
	added := allReplacementIDs(options)
	replaced := allReplacedIDs(options)
	var out []string
	for _, id := range getStrList(unit, "weapon_ids") {
		_, isAdded := added[id]
		_, isReplaced := replaced[id]
		if isReplaced || !isAdded {
			out = append(out, id)
		}
	}
	return out
}

// hasRecordedDefaults is true when every model row records a non-empty default
// loadout.
func hasRecordedDefaults(models []any) bool {
	if len(models) == 0 {
		return false
	}
	for _, mAny := range models {
		m, _ := asMap(mAny)
		if len(getStrList(m, "default_weapon_ids")) == 0 {
			return false
		}
	}
	return true
}

// allocatedModel pairs a composition model row with its allocated count.
type allocatedModel struct {
	model map[string]any
	count int
}

// allocateModels allocates modelCount models across the composition's
// model-types: each leader is taken at its min (in declared order, never
// exceeding the remaining count), then the non-leader "bulk" types absorb the
// rest — each its min first, then any leftover to the bulk type with the
// largest max. If there is no non-leader type, the leaders are the sink.
// Deterministic; pinned by the conformance corpus.
func allocateModels(models []any, modelCount int) []*allocatedModel {
	out := make([]*allocatedModel, 0, len(models))
	for _, mAny := range models {
		m, _ := asMap(mAny)
		out = append(out, &allocatedModel{model: m, count: 0})
	}
	remaining := maxInt(0, modelCount)
	// Leaders first, at their declared minimum.
	for _, row := range out {
		if !truthy(row.model["is_leader_model"]) {
			continue
		}
		c := minInt(asInt(row.model["min"]), remaining)
		row.count += c
		remaining -= c
	}
	bulk := make([]*allocatedModel, 0, len(out))
	for _, row := range out {
		if !truthy(row.model["is_leader_model"]) {
			bulk = append(bulk, row)
		}
	}
	if len(bulk) == 0 {
		// No non-leader type: pour any remainder onto the leaders.
		bulk = append(bulk, out...)
	}
	// Each bulk type takes its min, then the remainder lands on the largest-max type.
	for _, row := range bulk {
		c := minInt(asInt(row.model["min"]), remaining)
		row.count += c
		remaining -= c
	}
	if remaining > 0 && len(bulk) > 0 {
		sink := bulk[0]
		for _, row := range bulk[1:] {
			if asInt(row.model["max"]) > asInt(sink.model["max"]) {
				sink = row
			}
		}
		sink.count += remaining
	}
	return out
}

// baseCounts is the base loadout counts: id -> count across the unit with no
// swaps applied. When the composition records per-model default_weapon_ids,
// those are authoritative — base = sum over model-types of (allocated count ×
// default weapons). Otherwise it falls back to baseWeaponIDs × modelCount.
func baseCounts(unit map[string]any, modelCount int, options []any, models []any) map[string]int {
	counts := map[string]int{}
	if hasRecordedDefaults(models) {
		for _, row := range allocateModels(models, modelCount) {
			if row.count == 0 {
				continue
			}
			for _, id := range getStrList(row.model, "default_weapon_ids") {
				counts[id] += row.count
			}
		}
		return counts
	}
	for _, id := range baseWeaponIDs(unit, options) {
		counts[id] += modelCount
	}
	return counts
}

// baseLoadout is the base (legal, no-swap) loadout: id -> count, every base
// weapon on every model. The legal default a freshly-added unit ships with —
// each model in its out-of-the-box configuration. maximalLoadout starts from
// this set and then applies every option at full cap.
func baseLoadout(unit map[string]any, modelCount int, options []any, models []any) map[string]int {
	return baseCounts(unit, modelCount, options, models)
}

// maximalLoadout is the maximal (take-every-swap) loadout: id -> count.
func maximalLoadout(unit map[string]any, modelCount int, options []any, models []any) map[string]int {
	counts := baseCounts(unit, modelCount, options, models)
	for _, oAny := range options {
		o, _ := asMap(oAny)
		cap := optionCap(o, modelCount)
		if cap == 0 {
			continue
		}
		for _, id := range getStrList(o, "replaces") {
			counts[id] -= cap
		}
		for _, id := range addedIDs(o, 0) {
			counts[id] += cap
		}
	}
	for id, n := range counts {
		if n == 0 {
			delete(counts, id)
		}
	}
	return counts
}

type intRange struct{ min, max int }

func weaponBounds(unit map[string]any, modelCount int, options []any, models []any) map[string]intRange {
	bounds := map[string]intRange{}
	for id, count := range baseCounts(unit, modelCount, options, models) {
		bounds[id] = intRange{count, count}
	}
	for _, oAny := range options {
		o, _ := asMap(oAny)
		cap := optionCap(o, modelCount)
		for _, id := range getStrList(o, "replaces") {
			b := bounds[id]
			bounds[id] = intRange{maxInt(0, b.min-cap), b.max}
		}
		adds := map[string]struct{}{}
		for _, id := range getStrList(o, "replacement") {
			adds[id] = struct{}{}
		}
		for _, group := range getList(o, "replacement_choice") {
			for _, id := range toStrList(group) {
				adds[id] = struct{}{}
			}
		}
		for id := range adds {
			b := bounds[id]
			bounds[id] = intRange{b.min, b.max + cap}
		}
	}
	return bounds
}

func validateLoadout(unit map[string]any, modelCount int, options []any, counts map[string]int, models []any) []map[string]string {
	bounds := weaponBounds(unit, modelCount, options, models)
	var out []map[string]string
	for id, n := range counts {
		b, ok := bounds[id]
		if !ok {
			continue
		}
		if n > b.max {
			out = append(out, map[string]string{"id": id, "code": "exceeds-max", "message": id + ": " + itoa(n) + " exceeds max " + itoa(b.max)})
		} else if n < b.min {
			out = append(out, map[string]string{"id": id, "code": "below-min", "message": id + ": " + itoa(n) + " below min " + itoa(b.min)})
		}
	}
	out = append(out, swapConflicts(unit, modelCount, options, counts, models)...)
	sort.SliceStable(out, func(i, j int) bool {
		if out[i]["id"] != out[j]["id"] {
			return out[i]["id"] < out[j]["id"]
		}
		return out[i]["code"] < out[j]["code"]
	})
	return out
}

// swapConflicts reports swap-conservation violations the per-id weaponBounds
// can't see: a model's replaceable slot holds the base weapon OR one of its
// swap replacements, never both, so count(base) + sum(count(replacements))
// cannot exceed modelCount. Enforced only for the unambiguous shape — a base
// weapon swapped out by plain (non-choice) options that replace it alone, whose
// replacement ids are unique within this unit's option set and aren't
// themselves base weapons. Mirror of tools/src/data/loadout.ts.
func swapConflicts(unit map[string]any, modelCount int, options []any, counts map[string]int, models []any) []map[string]string {
	baseMap := baseCounts(unit, modelCount, options, models)
	baseIDs := map[string]struct{}{}
	for id := range baseMap {
		baseIDs[id] = struct{}{}
	}
	addedBy := map[string]int{}
	for _, oAny := range options {
		o, _ := asMap(oAny)
		for _, id := range getStrList(o, "replacement") {
			addedBy[id]++
		}
		for _, group := range getList(o, "replacement_choice") {
			for _, id := range toStrList(group) {
				addedBy[id]++
			}
		}
	}
	var out []map[string]string
	for base := range baseIDs {
		cleanAdds := map[string]struct{}{}
		messy := false
		for _, oAny := range options {
			o, _ := asMap(oAny)
			replaces := getStrList(o, "replaces")
			if !contains(replaces, base) {
				continue
			}
			if len(replaces) != 1 || len(getList(o, "replacement_choice")) > 0 {
				messy = true
				break
			}
			for _, b := range getStrList(o, "replacement") {
				if _, isBase := baseIDs[b]; isBase || addedBy[b] > 1 {
					messy = true
					break
				}
				cleanAdds[b] = struct{}{}
			}
			if messy {
				break
			}
		}
		if messy || len(cleanAdds) == 0 {
			continue
		}
		// The slot can hold at most as many weapons as there are models carrying
		// this base weapon by default — its base count (modelCount when not
		// per-model).
		cap, ok := baseMap[base]
		if !ok {
			cap = modelCount
		}
		total := counts[base]
		for b := range cleanAdds {
			total += counts[b]
		}
		if total > cap {
			out = append(out, map[string]string{
				"id":      base,
				"code":    "swap-conflict",
				"message": base + " and its swap replacement(s) total " + itoa(total) + ", exceeding " + itoa(cap) + " (a model takes the base weapon or a swap, not both)",
			})
		}
	}
	return out
}

func toStrList(v any) []string {
	l, _ := asList(v)
	out := make([]string, 0, len(l))
	for _, e := range l {
		if s, ok := e.(string); ok {
			out = append(out, s)
		}
	}
	return out
}

func maxInt(a, b int) int {
	if a > b {
		return a
	}
	return b
}
func minInt(a, b int) int {
	if a < b {
		return a
	}
	return b
}
