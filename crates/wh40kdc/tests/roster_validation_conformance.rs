//! Cross-implementation conformance for whole-army roster legality
//! (`check_roster_legality`) and candidate affordability
//! (`candidate_affordability`). The Rust runner must reproduce
//! `conformance/roster_validation/cases.json` and
//! `conformance/affordability/cases.json` produced by the TS reference
//! (`tools/src/data/roster-resolve.ts` / `tools/src/data/affordability.ts`).
//!
//! Driven through the actual `wh40kdc-runner` binary (the cross-impl differ's
//! path), so this pins the wire contract. Values compared exactly — sorted
//! `"<scope>|<severity>|<code>:<id>"` strings for legality, and
//! `{unitId, nextCopyCost, affordable}` objects (already sorted by the impl)
//! for affordability.

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
struct Case {
    name: String,
    args: Value,
    expected: Value,
}

fn run_corpus(area: &str, op: &str) {
    let path = conformance_dir().join(area).join("cases.json");
    let raw = std::fs::read_to_string(&path)
        .unwrap_or_else(|e| panic!("reading {}: {e}", path.display()));
    let cases: Vec<Case> = serde_json::from_str(&raw).expect("parse cases");
    assert!(!cases.is_empty(), "no {area} conformance cases found");

    let requests: Vec<Value> = cases
        .iter()
        .map(|c| json!({"op": op, "args": c.args}))
        .collect();
    let responses = drive_post_init(requests);
    assert_eq!(responses.len(), cases.len(), "response count must match");

    for (case, response) in cases.iter().zip(responses.iter()) {
        assert_eq!(
            response["ok"].as_bool(),
            Some(true),
            "{area}/{}: runner errored: {response}",
            case.name
        );
        assert_eq!(
            response["value"], case.expected,
            "{area}/{}: value diverged from the TS golden",
            case.name
        );
    }
}

#[test]
fn roster_validation_corpus_matches_reference() {
    run_corpus("roster_validation", "check_roster_legality");
}

#[test]
fn affordability_corpus_matches_reference() {
    run_corpus("affordability", "candidate_affordability");
}
