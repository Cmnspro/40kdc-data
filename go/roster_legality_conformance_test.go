package wh40kdc

import (
	"encoding/json"
	"testing"
)

// Tier-aware whole-unit loadout legality against the roster_legality corpus.
// Driven through the runner's check_unit_legality op — the cross-impl differ's
// path — and compared exactly (sorted "code:id" strings). Ties out with the TS
// reference and the Rust/Python ports via conformance/roster_legality/cases.json.
func TestRosterLegalityCorpus(t *testing.T) {
	var cases []struct {
		Name     string         `json:"name"`
		Args     map[string]any `json:"args"`
		Expected []string       `json:"expected"`
	}
	if err := json.Unmarshal(loadCorpus(t, "roster_legality", "cases.json"), &cases); err != nil {
		t.Fatalf("parse roster_legality cases: %v", err)
	}
	if len(cases) == 0 {
		t.Fatal("no roster_legality conformance cases found")
	}

	s := NewRunnerState()
	init := s.Dispatch(map[string]any{
		"op":   "init",
		"args": map[string]any{"spec_version": float64(SpecVersion), "locale": "C", "tz": "UTC", "seed": float64(0)},
	})
	if init["ok"] != true {
		t.Fatalf("init failed: %v", init)
	}

	for _, c := range cases {
		resp := s.Dispatch(map[string]any{"op": "check_unit_legality", "args": c.Args})
		if resp["ok"] != true {
			t.Fatalf("roster_legality/%s: runner errored: %v", c.Name, resp)
		}
		got := toStrSlice(resp["value"])
		if !equalStrSlices(got, c.Expected) {
			t.Fatalf("roster_legality/%s: got %v, want %v", c.Name, got, c.Expected)
		}
	}
}

func toStrSlice(v any) []string {
	l, _ := v.([]any)
	out := make([]string, 0, len(l))
	for _, e := range l {
		if s, ok := e.(string); ok {
			out = append(out, s)
		}
	}
	return out
}

func equalStrSlices(a, b []string) bool {
	if len(a) != len(b) {
		return false
	}
	for i := range a {
		if a[i] != b[i] {
			return false
		}
	}
	return true
}
