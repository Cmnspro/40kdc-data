"""Whole-army roster legality against the roster_validation corpus.

Drives the ``check_roster_legality`` runner op (the wire contract) and compares
the sorted ``"<scope>|<severity>|<code>:<id>"`` strings exactly. Ties out with
the TS reference and the Rust/Go ports via
``conformance/roster_validation/cases.json``.
"""

from __future__ import annotations

from typing import Any

import pytest

from wh40kdc.runner import create_runner_state, dispatch

from ..conftest import load_corpus_json


def _cases() -> list[dict[str, Any]]:
    return load_corpus_json("roster_validation", "cases.json")


@pytest.fixture(scope="module")
def runner_state(dataset: Any) -> Any:
    state = create_runner_state()
    # Reuse the session dataset so the op doesn't rebuild it per case.
    state._dataset = dataset
    state.initialized = True
    return state


@pytest.mark.parametrize("case", _cases(), ids=lambda c: c["name"])
def test_roster_validation_case(runner_state: Any, case: dict[str, Any]) -> None:
    resp = dispatch(runner_state, {"op": "check_roster_legality", "args": case["args"]})
    assert resp["ok"], resp
    assert resp["value"] == case["expected"]
