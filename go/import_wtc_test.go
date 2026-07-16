package wh40kdc

// WTC header Force Disposition + wargear-item fallback. Go mirror of the
// disposition/wargear blocks in tools/test/import/newrecruit-wtc.test.ts.

import (
	"strings"
	"testing"
)

const sororitasWtc = `+++++++++++++++++++++++++++++++++++++++++++++++
+ FACTION KEYWORD: Imperium - Adepta Sororitas
+ DETACHMENT: Champions of Faith (Righteous Purpose)
+ FORCE DISPOSITION: Disruption
+ TOTAL ARMY POINTS: 150pts
+
+ WARLORD: Char1: Palatine
+ NUMBER OF UNITS: 2
+++++++++++++++++++++++++++++++++++++++++++++++

Char1: 1x Palatine (50 pts): Palatine blade, Plasma pistol, Warlord

10x Battle Sisters Squad (100 pts)
• 9x Battle Sister
    7 with Bolt pistol, Boltgun, Close combat weapon
    1 with Simulacrum Imperialis, Bolt pistol, Boltgun, Close combat weapon
    1 with Bolt pistol, Close combat weapon, Multi-melta
• 1x Sister Superior: Bolt pistol, Close combat weapon, Power weapon, Boltgun
`

func importSororitasWtc(t *testing.T, text string) map[string]any {
	t.Helper()
	result := tryImportRoster(text, EmbeddedDataset())
	if ok, _ := result["ok"].(bool); !ok {
		t.Fatalf("import failed: %v", result["error"])
	}
	return result["roster"].(map[string]any)
}

func TestWtcFullBodyKeepsSingleLineCharacters(t *testing.T) {
	// Real WTC-full exports mix compact-style lines into the full layout:
	// single-model characters arrive as one `CharN: 1x Unit (pts): wargear`
	// line, and model-type bullets may inline their loadout after a colon.
	roster := importSororitasWtc(t, sororitasWtc)
	units := getList(roster, "units")
	if len(units) != 2 {
		t.Fatalf("units = %d, want 2 (single-line Palatine must not vanish)", len(units))
	}
	palatine := units[0].(map[string]any)
	if getStr(refOf(palatine), "id") != "palatine" {
		t.Fatalf("first unit = %v, want palatine", refOf(palatine)["id"])
	}
	if warlord, _ := palatine["is_warlord"].(bool); !warlord {
		t.Fatal("Palatine should carry the Warlord marker")
	}
}

func TestWtcForceDispositionResolves(t *testing.T) {
	roster := importSororitasWtc(t, sororitasWtc)
	if got := roster["force_disposition"]; got != "disruption" {
		t.Fatalf("force_disposition = %v, want disruption", got)
	}
}

func TestWtcUnknownDispositionWarns(t *testing.T) {
	bad := strings.ReplaceAll(sororitasWtc, "Disruption", "Total Mayhem")
	roster := importSororitasWtc(t, bad)
	if got := roster["force_disposition"]; got != nil {
		t.Fatalf("force_disposition = %v, want nil", got)
	}
	diag := roster["diagnostics"].(map[string]any)
	found := false
	for _, wAny := range getList(diag, "warnings") {
		if getStr(wAny.(map[string]any), "code") == "disposition-unresolved" {
			found = true
		}
	}
	if !found {
		t.Fatal("expected a disposition-unresolved warning")
	}
}

func TestWargearItemFallbackResolvesSimulacrum(t *testing.T) {
	roster := importSororitasWtc(t, sororitasWtc)
	var squad map[string]any
	for _, uAny := range getList(roster, "units") {
		u := uAny.(map[string]any)
		if getStr(refOf(u), "id") == "battle-sisters-squad" {
			squad = u
		}
	}
	if squad == nil {
		t.Fatal("battle-sisters-squad did not resolve")
	}
	var simulacrum map[string]any
	for _, wAny := range getList(squad, "wargear") {
		w := wAny.(map[string]any)
		if getStr(refOf(w), "raw_name") == "Simulacrum Imperialis" {
			simulacrum = w
		}
	}
	if simulacrum == nil {
		t.Fatal("Simulacrum Imperialis entry missing")
	}
	if got := getStr(refOf(simulacrum), "id"); got != "simulacrum-imperialis" {
		t.Fatalf("Simulacrum ref id = %q, want simulacrum-imperialis", got)
	}
	diag := roster["diagnostics"].(map[string]any)
	if n := asInt(diag["unresolved_weapons"]); n != 0 {
		t.Fatalf("unresolved_weapons = %d, want 0", n)
	}
}
