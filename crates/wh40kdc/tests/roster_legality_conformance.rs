//! Cross-implementation conformance for tier-aware whole-unit loadout legality.
//! The Rust runner must reproduce `conformance/roster_legality/cases.json`
//! produced by the TS reference (`tools/src/data/loadout.ts` `checkUnitLegality`).
//!
//! Driven through the actual `wh40kdc-runner` binary (the cross-impl differ's
//! path), so this pins the wire contract. Values compared exactly (sorted
//! `"code:id"` strings).

#![cfg(feature = "bundled-data")]

use std::io::Write;
use std::path::PathBuf;
use std::process::{Command, Stdio};

use serde::Deserialize;
use serde_json::{json, Value};

const RUNNER_BIN: &str = env!("CARGO_BIN_EXE_wh40kdc-runner");

fn conformance_dir() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../conformance")
}

fn spec_version() -> i64 {
    std::fs::read_to_string(conformance_dir().join("SPEC_VERSION"))
        .expect("read SPEC_VERSION")
        .trim()
        .parse()
        .expect("SPEC_VERSION integer")
}

fn drive_post_init(requests: Vec<Value>) -> Vec<Value> {
    let v = spec_version();
    let mut full = vec![
        json!({"op": "init", "args": {"spec_version": v, "locale": "C", "tz": "UTC", "seed": 0}}),
    ];
    full.extend(requests);

    let mut child = Command::new(RUNNER_BIN)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .expect("spawn runner");
    {
        let mut stdin = child.stdin.take().expect("runner stdin");
        for req in &full {
            writeln!(stdin, "{req}").expect("write request");
        }
        writeln!(stdin, "{}", json!({"op": "shutdown"})).expect("write shutdown");
    }
    let out = child.wait_with_output().expect("wait for runner");
    assert!(
        out.status.success(),
        "runner exited {:?}; stderr: {}",
        out.status.code(),
        String::from_utf8_lossy(&out.stderr),
    );
    let stdout = String::from_utf8(out.stdout).expect("runner stdout is utf-8");
    let responses: Vec<Value> = stdout
        .lines()
        .filter(|l| !l.is_empty())
        .map(|l| serde_json::from_str(l).unwrap_or_else(|e| panic!("non-JSON line {l:?}: {e}")))
        .collect();
    assert_eq!(responses[0]["ok"].as_bool(), Some(true), "init failed");
    responses[1..responses.len() - 1].to_vec()
}

#[derive(Deserialize)]
struct LegalityCase {
    name: String,
    args: Value,
    expected: Value,
}

#[test]
fn roster_legality_corpus_matches_reference() {
    let path = conformance_dir().join("roster_legality").join("cases.json");
    let raw = std::fs::read_to_string(&path)
        .unwrap_or_else(|e| panic!("reading {}: {e}", path.display()));
    let cases: Vec<LegalityCase> = serde_json::from_str(&raw).expect("parse legality cases");
    assert!(
        !cases.is_empty(),
        "no roster_legality conformance cases found"
    );

    let requests: Vec<Value> = cases
        .iter()
        .map(|c| json!({"op": "check_unit_legality", "args": c.args}))
        .collect();
    let responses = drive_post_init(requests);
    assert_eq!(responses.len(), cases.len(), "response count must match");

    for (case, response) in cases.iter().zip(responses.iter()) {
        assert_eq!(
            response["ok"].as_bool(),
            Some(true),
            "roster_legality/{}: runner errored: {response}",
            case.name
        );
        assert_eq!(
            response["value"], case.expected,
            "roster_legality/{}: value diverged from the TS golden",
            case.name
        );
    }
}
