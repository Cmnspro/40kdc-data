"""Cheapest-next-copy pricing + affordability against the affordability corpus.

Drives the ``candidate_affordability`` runner op (the wire contract) and
compares the ``[{unitId, nextCopyCost, affordable}]`` dicts exactly. Ties out
with the TS reference and the Rust/Go ports via
``conformance/affordability/cases.json``.
"""

from __future__ import annotations

from typing import Any

import pytest

from wh40kdc.runner import create_runner_state, dispatch

from ..conftest import load_corpus_json


def _cases() -> list[dict[str, Any]]:
    return load_corpus_json("affordability", "cases.json")


@pytest.fixture(scope="module")
def runner_state(dataset: Any) -> Any:
    state = create_runner_state()
    state._dataset = dataset
    state.initialized = True
    return state


@pytest.mark.parametrize("case", _cases(), ids=lambda c: c["name"])
def test_affordability_case(runner_state: Any, case: dict[str, Any]) -> None:
    resp = dispatch(runner_state, {"op": "candidate_affordability", "args": case["args"]})
    assert resp["ok"], resp
    assert resp["value"] == case["expected"]
