package wh40kdc

import (
	"encoding/json"
	"testing"
)

// Whole-army roster legality against the roster_validation corpus, driven
// through the runner's check_roster_legality op (the cross-impl differ's path)
// and compared exactly (sorted "<scope>|<severity>|<code>:<id>" strings). Ties
// out with the TS reference via conformance/roster_validation/cases.json.
func TestRosterValidationCorpus(t *testing.T) {
	var cases []struct {
		Name     string         `json:"name"`
		Args     map[string]any `json:"args"`
		Expected []string       `json:"expected"`
	}
	if err := json.Unmarshal(loadCorpus(t, "roster_validation", "cases.json"), &cases); err != nil {
		t.Fatalf("parse roster_validation cases: %v", err)
	}
	if len(cases) == 0 {
		t.Fatal("no roster_validation conformance cases found")
	}

	s := newInitedRunner(t)
	for _, c := range cases {
		resp := s.Dispatch(map[string]any{"op": "check_roster_legality", "args": c.Args})
		if resp["ok"] != true {
			t.Fatalf("roster_validation/%s: runner errored: %v", c.Name, resp)
		}
		got := toStrSlice(resp["value"])
		if !equalStrSlices(got, c.Expected) {
			t.Fatalf("roster_validation/%s: got %v, want %v", c.Name, got, c.Expected)
		}
	}
}

// Cheapest-next-copy pricing + affordability against the affordability corpus,
// driven through the runner's candidate_affordability op. Expected entries are
// objects, compared via canonical JSON round-trip. Ties out with the TS
// reference via conformance/affordability/cases.json.
func TestAffordabilityCorpus(t *testing.T) {
	var cases []struct {
		Name     string           `json:"name"`
		Args     map[string]any   `json:"args"`
		Expected []map[string]any `json:"expected"`
	}
	if err := json.Unmarshal(loadCorpus(t, "affordability", "cases.json"), &cases); err != nil {
		t.Fatalf("parse affordability cases: %v", err)
	}
	if len(cases) == 0 {
		t.Fatal("no affordability conformance cases found")
	}

	s := newInitedRunner(t)
	for _, c := range cases {
		resp := s.Dispatch(map[string]any{"op": "candidate_affordability", "args": c.Args})
		if resp["ok"] != true {
			t.Fatalf("affordability/%s: runner errored: %v", c.Name, resp)
		}
		gotJSON, err := json.Marshal(resp["value"])
		if err != nil {
			t.Fatalf("affordability/%s: marshal got: %v", c.Name, err)
		}
		wantJSON, err := json.Marshal(c.Expected)
		if err != nil {
			t.Fatalf("affordability/%s: marshal want: %v", c.Name, err)
		}
		if string(gotJSON) != string(wantJSON) {
			t.Fatalf("affordability/%s: got %s, want %s", c.Name, gotJSON, wantJSON)
		}
	}
}

func newInitedRunner(t *testing.T) *RunnerState {
	t.Helper()
	s := NewRunnerState()
	init := s.Dispatch(map[string]any{
		"op":   "init",
		"args": map[string]any{"spec_version": float64(SpecVersion), "locale": "C", "tz": "UTC", "seed": float64(0)},
	})
	if init["ok"] != true {
		t.Fatalf("init failed: %v", init)
	}
	return s
}
