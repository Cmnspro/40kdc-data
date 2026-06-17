"""Wargear-loadout maths shared by every consumer of the dataset.

How many models may take an option, what the maximal (take-every-swap) loadout
looks like, the valid count range for each weapon, and whether an edited
loadout is legal.

The base loadout is derived, not stored: a weapon in ``unit.weapon_ids`` that
never appears as the *replacement* of any option is a **base** weapon, carried
by every model; a weapon that does appear as a replacement is **optional**,
carried only by the models that took the swap.

Python mirror of ``tools/src/data/loadout.ts`` /
``crates/wh40kdc/src/data/loadout.rs``.
"""

from __future__ import annotations

import math
from typing import Any

WargearOption = dict[str, Any]
Unit = dict[str, Any]


def option_cap(option: WargearOption, model_count: int) -> int:
    """Maximum number of models that may take ``option`` in a unit of ``model_count``.

    ``any_number`` → all models; else ``per_n_models`` → floor(n / per); else
    ``max_count ?? 1``; then clamped by ``max_count`` when set. A null
    constraint is treated as unrestricted (every model). Never negative.
    """
    c = option.get("model_constraint")
    if not c:
        return max(0, model_count)
    if c.get("any_number"):
        cap = model_count
    elif c.get("per_n_models"):
        cap = math.floor(model_count / c["per_n_models"])
    else:
        max_count = c.get("max_count")
        cap = max_count if max_count is not None else 1
    if c.get("max_count") is not None:
        cap = min(cap, c["max_count"])
    return max(0, cap)


def _added_ids(option: WargearOption, choice_index: int = 0) -> list[str]:
    """The ids a single option can add, given the chosen choice branch (default 0)."""
    if option.get("replacement"):
        return option["replacement"]
    choices = option.get("replacement_choice") or []
    if 0 <= choice_index < len(choices):
        return choices[choice_index]
    return []


def _all_replacement_ids(options: list[WargearOption]) -> set[str]:
    """Every id that any option can add — across all choice branches."""
    out: set[str] = set()
    for o in options:
        out.update(o.get("replacement") or [])
        for group in o.get("replacement_choice") or []:
            out.update(group)
    return out


def _base_weapon_ids(unit: Unit, options: list[WargearOption]) -> list[str]:
    """Base (always-carried) weapon ids: in ``weapon_ids``, never a replacement."""
    replacements = _all_replacement_ids(options)
    return [id_ for id_ in unit.get("weapon_ids") or [] if id_ not in replacements]


def maximal_loadout(
    unit: Unit,
    model_count: int,
    options: list[WargearOption],
) -> dict[str, int]:
    """The maximal loadout: id → count across the unit.

    Every base weapon on every model, then each option applied at its full
    :func:`option_cap` (choices take their first branch). Swaps move count
    from the replaced id to the added id; add-ons only add.
    """
    counts: dict[str, int] = {}
    for id_ in _base_weapon_ids(unit, options):
        counts[id_] = counts.get(id_, 0) + model_count
    for option in options:
        cap = option_cap(option, model_count)
        if cap == 0:
            continue
        for id_ in option.get("replaces") or []:
            counts[id_] = counts.get(id_, 0) - cap
        for id_ in _added_ids(option):
            counts[id_] = counts.get(id_, 0) + cap
    # Drop any id that nets to zero so the loadout reads cleanly.
    return {id_: n for id_, n in counts.items() if n != 0}


def weapon_bounds(
    unit: Unit,
    model_count: int,
    options: list[WargearOption],
) -> dict[str, dict[str, int]]:
    """Inclusive valid count range (``{"min", "max"}``) for each weapon/wargear id.

    A base weapon ranges ``[model_count − max swaps away, model_count]``; an
    optional (replacement) id ranges ``[0, Σ caps that add it]``.
    """
    bounds: dict[str, dict[str, int]] = {}
    for id_ in _base_weapon_ids(unit, options):
        bounds[id_] = {"min": model_count, "max": model_count}
    for option in options:
        cap = option_cap(option, model_count)
        for id_ in option.get("replaces") or []:
            b = bounds.get(id_, {"min": 0, "max": 0})
            bounds[id_] = {"min": max(0, b["min"] - cap), "max": b["max"]}
        # A replacement id can appear in multiple options / both choice
        # branches; sum the caps so its ceiling reflects every way to add it.
        adds: set[str] = set(option.get("replacement") or [])
        for group in option.get("replacement_choice") or []:
            adds.update(group)
        for id_ in adds:
            b = bounds.get(id_, {"min": 0, "max": 0})
            bounds[id_] = {"min": b["min"], "max": b["max"] + cap}
    return bounds


def clamp_weapon_count(
    bounds: dict[str, dict[str, int]],
    id: str,
    requested: float,
) -> int:
    """Clamp a single weapon's requested count into its valid range.

    Ids with no bound (not part of this unit's loadout) are returned unchanged
    but floored at zero.
    """
    try:
        n = max(0, math.floor(requested))
    except (ValueError, OverflowError):
        n = 0
    b = bounds.get(id)
    if b is None:
        return n
    return min(b["max"], max(b["min"], n))


def validate_loadout(
    unit: Unit,
    model_count: int,
    options: list[WargearOption],
    counts: dict[str, int],
) -> list[dict[str, str]]:
    """Report every weapon/wargear count that falls outside its valid range."""
    bounds = weapon_bounds(unit, model_count, options)
    out: list[dict[str, str]] = []
    for id_, n in counts.items():
        b = bounds.get(id_)
        if b is None:
            continue
        if n > b["max"]:
            out.append(
                {"id": id_, "code": "exceeds-max", "message": f"{id_}: {n} exceeds max {b['max']}"}
            )
        elif n < b["min"]:
            out.append(
                {"id": id_, "code": "below-min", "message": f"{id_}: {n} below min {b['min']}"}
            )
    out.extend(_swap_conflicts(unit, model_count, options, counts))
    # Deterministic order so the result is stable for cross-impl comparison.
    out.sort(key=lambda v: (v["id"], v["code"]))
    return out


def _swap_conflicts(
    unit: Unit,
    model_count: int,
    options: list[WargearOption],
    counts: dict[str, int],
) -> list[dict[str, str]]:
    """Swap-conservation violations the per-id :func:`weapon_bounds` can't see.

    A model's replaceable slot holds the base weapon OR one of its swap
    replacements, never both, so ``count(base) + sum(count(replacements))``
    cannot exceed ``model_count``. Enforced only for the unambiguous shape — a
    base weapon swapped out by plain (non-choice) options that replace it alone,
    whose replacement ids are unique within this unit's option set and aren't
    themselves base weapons. Mirror of ``tools/src/data/loadout.ts``.
    """
    base_ids = set(_base_weapon_ids(unit, options))
    added_by: dict[str, int] = {}
    for o in options:
        for id_ in o.get("replacement") or []:
            added_by[id_] = added_by.get(id_, 0) + 1
        for group in o.get("replacement_choice") or []:
            for id_ in group:
                added_by[id_] = added_by.get(id_, 0) + 1
    out: list[dict[str, str]] = []
    for base in base_ids:
        clean_adds: set[str] = set()
        messy = False
        for o in options:
            replaces = o.get("replaces") or []
            if base not in replaces:
                continue
            if len(replaces) != 1 or (o.get("replacement_choice") or []):
                messy = True
                break
            for b in o.get("replacement") or []:
                if b in base_ids or added_by.get(b, 0) > 1:
                    messy = True
                    break
                clean_adds.add(b)
            if messy:
                break
        if messy or not clean_adds:
            continue
        total = counts.get(base, 0) + sum(counts.get(b, 0) for b in clean_adds)
        if total > model_count:
            out.append(
                {
                    "id": base,
                    "code": "swap-conflict",
                    "message": (
                        f"{base} and its swap replacement(s) total {total}, "
                        f"exceeding {model_count} (a model takes the base weapon "
                        f"or a swap, not both)"
                    ),
                }
            )
    return out
