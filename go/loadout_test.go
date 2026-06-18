package wh40kdc

import "testing"

// War Dog Brigand's lone option swaps the diabolus heavy stubber for a havoc
// multi-launcher — one or the other, never both. Each id is independently in
// [0,1], so only the swap-conservation check catches the conflict. Mirror of
// the TS/Rust/Python loadout tests.
func TestValidateLoadoutSwapConflict(t *testing.T) {
	ds := EmbeddedDataset()
	wd, ok := ds.Units.Get("war-dog-brigand")
	if !ok {
		t.Fatal("war-dog-brigand not in dataset")
	}
	opts := wd.WargearOptions()

	both := map[string]int{"diabolus-heavy-stubber": 1, "havoc-multi-launcher": 1}
	v := validateLoadout(wd.Raw, 1, opts, both, nil)
	if len(v) != 1 || v[0]["id"] != "diabolus-heavy-stubber" || v[0]["code"] != "swap-conflict" {
		t.Fatalf("expected one swap-conflict on diabolus-heavy-stubber, got %v", v)
	}

	if got := validateLoadout(wd.Raw, 1, opts, map[string]int{"diabolus-heavy-stubber": 1}, nil); len(got) != 0 {
		t.Fatalf("keeping the stubber should be legal, got %v", got)
	}
	if got := validateLoadout(wd.Raw, 1, opts, map[string]int{"havoc-multi-launcher": 1}, nil); len(got) != 0 {
		t.Fatalf("swapping to the havoc launcher should be legal, got %v", got)
	}
}
