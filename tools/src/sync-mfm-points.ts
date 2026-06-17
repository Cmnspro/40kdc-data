/**
 * sync-mfm-points.ts — Extract unit point costs (and enhancement costs) from the
 * online Munitorum Field Manual (https://mfm.warhammer-community.com/en/{slug})
 * and reconcile them into data/core/ as the authoritative points source.
 *
 * Default run is a DRY RUN: it parses, matches against existing entities, and
 * writes a coverage/diff report to data/core/_reports/mfm-sync.md WITHOUT touching
 * data files. Pass --write to apply matched changes.
 *
 * Source shape (see _private/mfm/SPIKE_FINDINGS.md): Next.js App Router HTML.
 * Unit costs are React-Suspense-streamed — a `<template id="P:XX">` placeholder in
 * the unit's <li> resolves from a hidden block
 *   <div hidden id="S:XX"><span>NN pts</span></div>
 * (S: and P: share the suffix). Enhancement costs are inline. 11e per-army-ordinal
 * pricing appears as band headers ("YOUR 1ST TO 2ND UNITS COST" / "YOUR 3RD + UNIT
 * COSTS") which map to the schema's unit_count_min / unit_count_max.
 *
 * Usage:
 *   npx tsx tools/src/sync-mfm-points.ts            # dry run, all factions
 *   npx tsx tools/src/sync-mfm-points.ts --write    # apply
 *   npx tsx tools/src/sync-mfm-points.ts adepta-sororitas space-marines  # subset
 *   npx tsx tools/src/sync-mfm-points.ts --refetch   # ignore HTML cache
 */
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { nameToId } from "./converters/id-generator.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..", "..");
const CACHE_DIR = path.join(REPO_ROOT, "_private", "mfm");
const REPORT_PATH = path.join(REPO_ROOT, "data", "core", "_reports", "mfm-sync.md");
const BASE_URL = "https://mfm.warhammer-community.com/en";

/**
 * Provenance stamped onto matched entities when --write applies. MFM v1.0 is the
 * 11th-edition launch points; "launch" is the registered slate in game-versions.json.
 * Confirming a cost against it is exactly what points_provisional:false records.
 */
const MFM_EDITION = "11th";
const MFM_DATASLATE = "launch";

/** MFM faction slug → repo data/core/ directory. */
const FACTION_DIR: Record<string, string> = {
  "adepta-sororitas": "adepta-sororitas",
  "adeptus-custodes": "adeptus-custodes",
  "adeptus-mechanicus": "adeptus-mechanicus",
  aeldari: "aeldari",
  "astra-militarum": "astra-militarum",
  "black-templars": "black-templars",
  "blood-angels": "blood-angels",
  "chaos-daemons": "chaos-daemons",
  "chaos-knights": "chaos-knights",
  "chaos-space-marines": "chaos-space-marines",
  "dark-angels": "dark-angels",
  "death-guard": "death-guard",
  deathwatch: "deathwatch",
  drukhari: "drukhari",
  "emperors-children": "emperors-children",
  "genestealer-cults": "genestealer-cults",
  "grey-knights": "grey-knights",
  "imperial-agents": "agents-of-the-imperium",
  "imperial-knights": "imperial-knights",
  "leagues-of-votann": "leagues-of-votann",
  necrons: "necrons",
  orks: "orks",
  "space-marines": "adeptus-astartes",
  "space-wolves": "space-wolves",
  "tau-empire": "tau-empire",
  "thousand-sons": "thousand-sons",
  tyranids: "tyranids",
  "world-eaters": "world-eaters",
};

const ALL_SLUGS = Object.keys(FACTION_DIR);

/**
 * Some MFM faction pages republish a shared roster on top of their own datasheets:
 *   - SM chapter pages repeat the generic Astartes roster (lives in adeptus-astartes).
 *   - Mono-god Chaos legions repeat their patron's daemons (chaos-daemons) and shared
 *     Heretic Astartes engines like the Defiler (chaos-space-marines).
 * A unit that misses the page's own dir but resolves in one of these shared dirs is
 * an expected duplicate (synced from that dir's own page), not a real miss.
 */
const SHARED_ROSTERS: Record<string, string[]> = {
  "black-templars": ["adeptus-astartes"],
  "blood-angels": ["adeptus-astartes"],
  "dark-angels": ["adeptus-astartes"],
  deathwatch: ["adeptus-astartes"],
  "space-wolves": ["adeptus-astartes"],
  "death-guard": ["chaos-daemons", "chaos-space-marines"],
  "thousand-sons": ["chaos-daemons", "chaos-space-marines"],
  "world-eaters": ["chaos-daemons", "chaos-space-marines"],
  "emperors-children": ["chaos-daemons", "chaos-space-marines"],
};

interface PointTier {
  models: number;
  cost: number;
  unit_count_min?: number;
  unit_count_max?: number | null;
}
interface MfmUnit {
  name: string;
  tiers: PointTier[];
}
interface MfmEnhancement {
  name: string;
  cost: number;
}
interface MfmFaction {
  slug: string;
  version: string;
  units: MfmUnit[];
  enhancements: MfmEnhancement[];
}

// ─────────────────────────── fetch + cache ───────────────────────────

async function getHtml(slug: string, refetch: boolean): Promise<string> {
  const cached = path.join(CACHE_DIR, `${slug}.html`);
  if (!refetch && fs.existsSync(cached)) return fs.readFileSync(cached, "utf8");
  const res = await fetch(`${BASE_URL}/${slug}`, {
    headers: { "User-Agent": "Mozilla/5.0 (40kdc-data points sync)" },
  });
  if (!res.ok) throw new Error(`Fetch ${slug} failed: ${res.status}`);
  const html = await res.text();
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(cached, html);
  return html;
}

// ─────────────────────────── parsing ───────────────────────────

/** Map a band header like "YOUR 1ST TO 2ND UNITS COST" → {min,max}, or null. */
function parseBand(header: string): { min: number; max: number | null } | null {
  const m = header.match(
    /YOUR\s+(\d+)(?:ST|ND|RD|TH)(?:\s+TO\s+(\d+)(?:ST|ND|RD|TH))?(\s*\+)?\s+UNITS?\s+COSTS?/i
  );
  if (!m) return null;
  const min = parseInt(m[1], 10);
  if (m[2]) return { min, max: parseInt(m[2], 10) }; // "1ST TO 2ND"
  if (m[3]) return { min, max: null }; // "3RD +"
  return { min, max: min }; // "1ST UNIT"
}

function parseFaction(slug: string, html: string): MfmFaction {
  const version = (html.match(/v\d+\.\d+/) ?? ["v?"])[0];

  // 1. Suspense-streamed cost map: S:XX suffix → cost number.
  const costBySuffix = new Map<string, number>();
  const costRe = /<div hidden id="S:([0-9a-f]+)">\s*<span>(\d+)\s*pts<\/span>/gi;
  for (let m; (m = costRe.exec(html)); ) {
    costBySuffix.set(m[1], parseInt(m[2], 10));
  }

  // 2. Units. Split the document on the unit-name marker; each unit's block runs
  //    until the next name marker. Within it, find band groups (header + <ul>) or,
  //    failing that, a single bare <ul> of model tiers.
  const nameRe = /<div class="[^"]*text-xl text-white">([^<]+)<\/div>/gi;
  const markers: { name: string; start: number; end: number }[] = [];
  for (let m; (m = nameRe.exec(html)); ) {
    markers.push({ name: decode(m[1]).trim(), start: m.index, end: m.index + m[0].length });
  }
  const units: MfmUnit[] = [];
  for (let i = 0; i < markers.length; i++) {
    const block = html.slice(markers[i].end, markers[i + 1]?.start ?? html.length);
    const tiers = parseUnitTiers(block, costBySuffix);
    if (tiers.length) units.push({ name: markers[i].name, tiers });
  }

  // 3. Enhancements (inline, name + "NN pts").
  const enhRe =
    /<li><div class="flex flex-row justify-between"><span>([^<]+)<\/span><span>(\d+)\s*pts<\/span>/gi;
  const enhancements: MfmEnhancement[] = [];
  for (let m; (m = enhRe.exec(html)); ) {
    enhancements.push({ name: decode(m[1]).trim(), cost: parseInt(m[2], 10) });
  }

  return { slug, version, units, enhancements };
}

/** Parse the model/cost tiers (with optional ordinal bands) from a unit block. */
function parseUnitTiers(block: string, costBySuffix: Map<string, number>): PointTier[] {
  const tiers: PointTier[] = [];
  // Band groups: a "YOUR … COST" header immediately followed by its <ul>.
  const groupRe =
    /<div class="[^"]*">(YOUR[^<]*?COSTS?)<\/div><ul[^>]*>(.*?)<\/ul>/gis;
  let sawBand = false;
  for (let g; (g = groupRe.exec(block)); ) {
    const band = parseBand(g[1]);
    if (!band) continue;
    sawBand = true;
    for (const t of parseLis(g[2], costBySuffix)) {
      tiers.push({ ...t, unit_count_min: band.min, unit_count_max: band.max });
    }
  }
  if (!sawBand) {
    // No ordinal bands: a single bare <ul> of model tiers.
    const ul = block.match(/<ul[^>]*class="leaders[^"]*"[^>]*>(.*?)<\/ul>/is);
    if (ul) tiers.push(...parseLis(ul[1], costBySuffix));
  }
  return tiers;
}

/** Parse `<li><span>N models</span><template id="P:XX"></template></li>` items. */
function parseLis(ulInner: string, costBySuffix: Map<string, number>): PointTier[] {
  const liRe = /<li><span>(\d+)\s*models?<\/span><template id="P:([0-9a-f]+)">/gi;
  const out: PointTier[] = [];
  for (let m; (m = liRe.exec(ulInner)); ) {
    const cost = costBySuffix.get(m[2]);
    if (cost === undefined) continue;
    out.push({ models: parseInt(m[1], 10), cost });
  }
  return out;
}

function decode(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&#x2019;|’/g, "’")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

// ─────────────────────────── reconcile ───────────────────────────

function readJson<T>(p: string): T[] {
  return fs.existsSync(p) ? (JSON.parse(fs.readFileSync(p, "utf8")) as T[]) : [];
}

interface UnitRecord {
  id: string;
  name: string;
  points?: PointTier[];
  points_provisional?: boolean;
  game_version?: { edition: string; dataslate: string };
  [k: string]: unknown;
}
interface EnhRecord {
  id: string;
  name: string;
  cost: number;
  [k: string]: unknown;
}

function tiersEqual(a: PointTier[] = [], b: PointTier[] = []): boolean {
  const norm = (t: PointTier[]) =>
    JSON.stringify(
      [...t]
        .map((x) => ({
          models: x.models,
          cost: x.cost,
          min: x.unit_count_min ?? null,
          max: x.unit_count_max ?? null,
        }))
        .sort((p, q) => p.models - q.models || (p.min ?? 0) - (q.min ?? 0))
    );
  return norm(a) === norm(b);
}

interface FactionResult {
  slug: string;
  dir: string;
  version: string;
  unitMatched: number;
  unitChanged: { name: string; from: PointTier[]; to: PointTier[] }[];
  unitUnmatched: string[];
  enhMatched: number;
  enhChanged: { name: string; from: number; to: number }[];
  enhUnmatched: string[];
  bandedUnits: string[];
  sharedSkipped: number;
}

/** Per-dir cache of unit ids, for shared-roster duplicate detection. */
const dirUnitIds = new Map<string, Set<string>>();
function unitIdsOf(dir: string): Set<string> {
  let s = dirUnitIds.get(dir);
  if (!s) {
    const p = path.join(REPO_ROOT, "data", "core", dir, "units.json");
    s = new Set(readJson<UnitRecord>(p).map((u) => u.id));
    dirUnitIds.set(dir, s);
  }
  return s;
}
/** True if `id` belongs to one of `slug`'s shared rosters. */
function isSharedRoster(slug: string, id: string): boolean {
  return (SHARED_ROSTERS[slug] ?? []).some((dir) => unitIdsOf(dir).has(id));
}

function reconcile(mfm: MfmFaction, write: boolean): FactionResult {
  const dir = path.join(REPO_ROOT, "data", "core", FACTION_DIR[mfm.slug]);
  const unitsPath = path.join(dir, "units.json");
  const enhPath = path.join(dir, "enhancements.json");
  const unitsExisted = fs.existsSync(unitsPath);
  const units = readJson<UnitRecord>(unitsPath);
  const enhs = readJson<EnhRecord>(enhPath);

  const unitById = new Map(units.map((u) => [u.id, u]));
  const res: FactionResult = {
    slug: mfm.slug,
    dir: FACTION_DIR[mfm.slug],
    version: mfm.version,
    unitMatched: 0,
    unitChanged: [],
    unitUnmatched: [],
    enhMatched: 0,
    enhChanged: [],
    enhUnmatched: [],
    bandedUnits: [],
    sharedSkipped: 0,
  };
  for (const mu of mfm.units) {
    let id: string;
    try {
      id = nameToId(mu.name);
    } catch {
      res.unitUnmatched.push(mu.name);
      continue;
    }
    const rec = unitById.get(id);
    if (!rec) {
      if (isSharedRoster(mfm.slug, id)) res.sharedSkipped++;
      else res.unitUnmatched.push(`${mu.name} (${id})`);
      continue;
    }
    res.unitMatched++;
    if (mu.tiers.some((t) => t.unit_count_min !== undefined)) res.bandedUnits.push(mu.name);
    if (!tiersEqual(rec.points, mu.tiers)) {
      res.unitChanged.push({ name: mu.name, from: rec.points ?? [], to: mu.tiers });
      if (write) applyUnit(rec, mu.tiers);
    } else if (write) {
      stampProvenance(rec); // confirm provisional flag even when value unchanged
    }
  }

  const enhById = new Map(enhs.map((e) => [e.id, e]));
  const enhByNameId = new Map(enhs.map((e) => [nameToId(e.name), e] as const));
  for (const me of mfm.enhancements) {
    // MFM appends a parenthetical tag (e.g. " (Upgrade)") that isn't in the entity name.
    const cleanName = me.name.replace(/\s*\([^)]*\)\s*$/, "").trim();
    const nid = nameToId(cleanName);
    // Enhancement ids are `${name-id}-${detachment-id}`; match by id prefix or by name.
    const rec =
      enhByNameId.get(nid) ??
      enhs.find((e) => e.id === nid || e.id.startsWith(`${nid}-`));
    if (!rec) {
      res.enhUnmatched.push(`${me.name} (${nid})`);
      continue;
    }
    res.enhMatched++;
    if (rec.cost !== me.cost) {
      res.enhChanged.push({ name: me.name, from: rec.cost, to: me.cost });
      if (write) {
        rec.cost = me.cost;
        stampProvenance(rec as unknown as UnitRecord);
      }
    } else if (write) {
      stampProvenance(rec as unknown as UnitRecord);
    }
  }

  if (write) {
    // Only rewrite files that already existed — never create a new entity file
    // (e.g. SM chapter dirs carry no units.json; their units live in adeptus-astartes).
    if (unitsExisted) fs.writeFileSync(unitsPath, JSON.stringify(units, null, 2) + "\n");
    if (fs.existsSync(enhPath)) fs.writeFileSync(enhPath, JSON.stringify(enhs, null, 2) + "\n");
  }
  return res;
}

function applyUnit(rec: UnitRecord, tiers: PointTier[]): void {
  // Drop band keys when absent to keep the simple case clean.
  rec.points = tiers.map((t) =>
    t.unit_count_min === undefined
      ? { models: t.models, cost: t.cost }
      : { models: t.models, cost: t.cost, unit_count_min: t.unit_count_min, unit_count_max: t.unit_count_max ?? null }
  );
  stampProvenance(rec);
}

function stampProvenance(rec: UnitRecord): void {
  rec.points_provisional = false;
  if (rec.game_version) {
    rec.game_version.edition = MFM_EDITION;
    rec.game_version.dataslate = MFM_DATASLATE;
  }
}

// ─────────────────────────── report ───────────────────────────

function buildReport(results: FactionResult[], write: boolean): string {
  const L: string[] = [];
  L.push(`# MFM points sync — ${write ? "APPLIED" : "DRY RUN"}`);
  L.push("");
  L.push(`Source: ${BASE_URL}/{slug} (version ${results[0]?.version ?? "?"})`);
  L.push("");
  const tot = (f: (r: FactionResult) => number) => results.reduce((a, r) => a + f(r), 0);
  L.push("## Coverage");
  L.push("");
  L.push("| Faction | Units matched | Unit unmatched | Shared-SM skipped | Unit changed | Banded | Enh matched | Enh unmatched | Enh changed |");
  L.push("|---|--:|--:|--:|--:|--:|--:|--:|--:|");
  for (const r of results) {
    L.push(
      `| ${r.slug} → ${r.dir} | ${r.unitMatched} | ${r.unitUnmatched.length} | ${r.sharedSkipped} | ${r.unitChanged.length} | ${r.bandedUnits.length} | ${r.enhMatched} | ${r.enhUnmatched.length} | ${r.enhChanged.length} |`
    );
  }
  L.push(
    `| **TOTAL** | **${tot((r) => r.unitMatched)}** | **${tot((r) => r.unitUnmatched.length)}** | **${tot((r) => r.sharedSkipped)}** | **${tot((r) => r.unitChanged.length)}** | **${tot((r) => r.bandedUnits.length)}** | **${tot((r) => r.enhMatched)}** | **${tot((r) => r.enhUnmatched.length)}** | **${tot((r) => r.enhChanged.length)}** |`
  );
  L.push("");
  for (const r of results) {
    if (!r.unitUnmatched.length && !r.unitChanged.length && !r.enhUnmatched.length && !r.enhChanged.length)
      continue;
    L.push(`## ${r.slug} → ${r.dir}`);
    if (r.unitUnmatched.length) {
      L.push("", "**New units in MFM, no repo entity** (needs authoring before points can attach):");
      r.unitUnmatched.forEach((n) => L.push(`- ${n}`));
    }
    if (r.unitChanged.length) {
      L.push("", "**Unit point changes** (old → new):");
      r.unitChanged.forEach((c) => L.push(`- ${c.name}: ${fmtTiers(c.from)} → ${fmtTiers(c.to)}`));
    }
    if (r.enhUnmatched.length) {
      L.push("", "**Unmatched enhancements:**");
      r.enhUnmatched.forEach((n) => L.push(`- ${n}`));
    }
    if (r.enhChanged.length) {
      L.push("", "**Enhancement cost changes:**");
      r.enhChanged.forEach((c) => L.push(`- ${c.name}: ${c.from} → ${c.to}`));
    }
    L.push("");
  }
  return L.join("\n") + "\n";
}

function fmtTiers(t: PointTier[]): string {
  if (!t.length) return "(none)";
  return t
    .map((x) =>
      x.unit_count_min === undefined
        ? `${x.models}m=${x.cost}`
        : `${x.models}m=${x.cost}[#${x.unit_count_min}-${x.unit_count_max ?? "+"}]`
    )
    .join(", ");
}

// ─────────────────────────── main ───────────────────────────

async function main() {
  const argv = process.argv.slice(2);
  const write = argv.includes("--write");
  const refetch = argv.includes("--refetch");
  const slugs = argv.filter((a) => !a.startsWith("--"));
  const targets = slugs.length ? slugs : ALL_SLUGS;

  const results: FactionResult[] = [];
  for (const slug of targets) {
    if (!FACTION_DIR[slug]) {
      console.error(`Unknown slug: ${slug}`);
      continue;
    }
    const html = await getHtml(slug, refetch);
    const mfm = parseFaction(slug, html);
    console.log(
      `${slug}: parsed ${mfm.units.length} units, ${mfm.enhancements.length} enhancements (${mfm.version})`
    );
    results.push(reconcile(mfm, write));
  }

  const report = buildReport(results, write);
  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, report);

  // Machine-readable unmatched dump for curation.
  const unmatched = results
    .filter((r) => r.unitUnmatched.length || r.enhUnmatched.length)
    .map((r) => ({ slug: r.slug, dir: r.dir, units: r.unitUnmatched, enh: r.enhUnmatched }));
  fs.writeFileSync(path.join(CACHE_DIR, "unmatched.json"), JSON.stringify(unmatched, null, 2));
  console.log(`\nReport → ${path.relative(REPO_ROOT, REPORT_PATH)}`);
  console.log(
    `Units matched ${results.reduce((a, r) => a + r.unitMatched, 0)}, ` +
      `unmatched ${results.reduce((a, r) => a + r.unitUnmatched.length, 0)}, ` +
      `changed ${results.reduce((a, r) => a + r.unitChanged.length, 0)}.`
  );
  if (!write) console.log("DRY RUN — no files written. Re-run with --write to apply.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
