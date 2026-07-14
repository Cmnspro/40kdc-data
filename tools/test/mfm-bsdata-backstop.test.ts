import { mkdtempSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import * as path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  analyzeBsdataRevision,
  JjRevisionTree,
  parseBsdataCli,
  resolvePrivateOutputPath,
  type RevisionTree,
} from "../src/mfm/bsdata-backstop.js";
import { MfmDump } from "../src/mfm/loader.js";
import { REPO_ROOT } from "../src/mfm/repo-files.js";

const COMMIT = "a".repeat(40);
const RAW_PROSE = "This prose-like profile value must never become a mechanical fact.";
const temporaryDirectories: string[] = [];

class MemoryRevisionTree implements RevisionTree {
  readonly requestedRefs: string[] = [];

  constructor(private readonly files: Readonly<Record<string, string>>, private readonly commit = COMMIT) {}

  resolveRevision(ref: string): string {
    this.requestedRefs.push(ref);
    return this.commit;
  }

  listFiles(commit: string): readonly string[] {
    expect(commit).toBe(this.commit);
    return Object.keys(this.files).reverse();
  }

  readFile(commit: string, file: string): string {
    expect(commit).toBe(this.commit);
    return this.files[file];
  }
}

function revisionFiles(): Record<string, string> {
  return {
    "system.json": JSON.stringify({
      gameSystem: {
        id: "game-system",
        profileTypes: [
          {
            id: "profile-unit",
            name: "Unit",
            characteristicTypes: [
              { id: "char-m", name: "M" },
              { id: "char-t", name: "T" },
            ],
          },
          {
            id: "profile-ranged",
            name: "Ranged Weapons",
            characteristicTypes: [
              { id: "char-range", name: "Range" },
              { id: "char-a", name: "A" },
            ],
          },
        ],
        costTypes: [{ id: "cost-points", name: "pts" }],
      },
    }),
    "source.json": JSON.stringify({
      catalogue: {
        id: "catalogue-source",
        gameSystemId: "game-system",
        catalogueLinks: [{ id: "import-target", targetId: "catalogue-target" }],
        selectionEntries: [
          {
            id: "unit-one",
            name: "Fixture Cohort",
            type: "unit",
            hidden: false,
            costs: [{ typeId: "cost-points", value: 90 }],
            profiles: [
              {
                id: "unit-profile",
                name: "Fixture Cohort",
                typeId: "profile-unit",
                characteristics: [
                  { typeId: "char-m", $text: "6\"" },
                  { typeId: "char-t", $text: "4" },
                  { typeId: "char-a", $text: RAW_PROSE },
                ],
              },
            ],
            entryLinks: [
              {
                id: "weapon-link",
                targetId: "weapon-one",
                costs: [{ typeId: "cost-points", value: 95 }],
                categoryLinks: [{ id: "category-wargear", name: "Wargear" }],
              },
            ],
          },
          {
            id: "bad-label",
            name: "https://example.invalid/unsafe",
            type: "model",
            hidden: true,
          },
        ],
      },
    }),
    "target.json": JSON.stringify({
      catalogue: {
        id: "catalogue-target",
        gameSystemId: "game-system",
        sharedSelectionEntries: [
          {
            id: "weapon-one",
            name: "Fixture Projector",
            type: "upgrade",
            hidden: false,
            profiles: [
              {
                id: "weapon-profile",
                name: "Fixture Projector",
                typeId: "profile-ranged",
                characteristics: [
                  { typeId: "char-range", $text: "24\"" },
                  { typeId: "char-a", $text: "D6+1" },
                ],
              },
            ],
          },
        ],
      },
    }),
  };
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) rmSync(directory, { recursive: true, force: true });
});

describe("BSData snapshot backstop", () => {
  it("parses JSON, extracts allowlisted facts, rejects prose, and resolves import chains", () => {
    const tree = new MemoryRevisionTree(revisionFiles());
    const report = analyzeBsdataRevision(tree, "pinned-ref");

    expect(tree.requestedRefs).toEqual(["pinned-ref"]);
    expect(report.source).toEqual({ requested_ref: "pinned-ref", resolved_commit: COMMIT, files: 3 });
    expect(report.mfm.data_version).toBeNull();
    expect(report.facts.find((fact) => fact.id === "unit-one")).toMatchObject({
      name: "Fixture Cohort",
      points: 90,
      profiles: [{ characteristics: { movement: '6"', toughness: "4" } }],
    });
    expect(report.facts.find((fact) => fact.id === "weapon-link")).toMatchObject({
      name: "Fixture Projector",
      points: 95,
      category_hints: ["Wargear"],
    });
    expect(report.facts.find((fact) => fact.id === "bad-label")?.name).toBe("bad-label");
    expect(JSON.stringify(report.facts)).not.toContain(RAW_PROSE);
    expect(report.parser_warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "rejected-characteristic-value", id: "char-a" }),
        expect.objectContaining({ kind: "rejected-entry-name", id: "bad-label" }),
      ]),
    );
    expect(report.heuristic_warnings).toContainEqual(
      expect.objectContaining({ kind: "hidden-entry", id: "bad-label" }),
    );
    expect(report.links).toHaveLength(1);
    expect(report.links[0]).toMatchObject({
      id: "weapon-link",
      target_id: "weapon-one",
      target_file: "target.json",
      chain: [
        { kind: "catalogue-link", target_file: "target.json" },
        { kind: "entry-link", target_file: "target.json", target_id: "weapon-one" },
      ],
    });
  });

  it("sorts reports deterministically and preserves snapshot-skew evidence", () => {
    const first = analyzeBsdataRevision(new MemoryRevisionTree(revisionFiles()), "old-main");
    const second = analyzeBsdataRevision(new MemoryRevisionTree(revisionFiles()), "old-main");
    expect(second).toEqual(first);
    expect(first.source.requested_ref).toBe("old-main");
    expect(first.source.resolved_commit).toBe(COMMIT);
  });

  it("preserves duplicate profile rows as multisets", () => {
    const files = revisionFiles();
    const source = JSON.parse(files["source.json"]) as {
      catalogue: { selectionEntries: Record<string, unknown>[] };
    };
    source.catalogue.selectionEntries.push(
      {
        id: "duplicate-one",
        name: "Duplicate Profile",
        type: "model",
        profiles: [
          {
            id: "duplicate-profile-one",
            name: "Duplicate Profile",
            typeId: "profile-unit",
            characteristics: [{ typeId: "char-m", $text: '6"' }],
          },
        ],
      },
      {
        id: "duplicate-two",
        name: "Duplicate Profile",
        type: "model",
        profiles: [
          {
            id: "duplicate-profile-two",
            name: "Duplicate Profile",
            typeId: "profile-unit",
            characteristics: [{ typeId: "char-m", $text: '7"' }],
          },
        ],
      },
    );
    files["source.json"] = JSON.stringify(source);
    const dump = new MfmDump({
      metadata: { data_version: 42 },
      data: {
        datasheet: [],
        wargear_item: [],
        datasheet_points_step: [],
        wargear_item_profile: [],
        keyword: [],
        miniature: [
          {
            id: "miniature-one",
            localisations: { en: { name: "Duplicate Profile" } },
            movement: '5"',
            toughness: "4",
            save: "3+",
            wounds: "2",
            leadership: "7+",
            objectiveControl: "1",
          },
          {
            id: "miniature-two",
            localisations: { en: { name: "Duplicate Profile" } },
            movement: '6"',
            toughness: "4",
            save: "3+",
            wounds: "2",
            leadership: "7+",
            objectiveControl: "1",
          },
        ],
      },
    } as never);

    expect(analyzeBsdataRevision(new MemoryRevisionTree(files), "pinned", dump).mechanical_differences).toContainEqual({
      kind: "profile-characteristic-mismatch",
      key: "duplicate profile/movement",
      mfm: ['5"', '6"'],
      bsdata: ['6"', '7"'],
    });
  });

  it("fails malformed JSON, malformed roots, wrong game-system targets, and non-commit refs", () => {
    expect(() => analyzeBsdataRevision(new MemoryRevisionTree({ "bad.json": "{" }), "ref")).toThrow(
      "Malformed BSData JSON in bad.json",
    );
    expect(() =>
      analyzeBsdataRevision(
        new MemoryRevisionTree({ "bad.json": JSON.stringify({ gameSystem: { id: "x" }, catalogue: { id: "y" } }) }),
        "ref",
      ),
    ).toThrow("Expected exactly one BSData root in bad.json");

    const files = revisionFiles();
    files["source.json"] = JSON.stringify({ catalogue: { id: "source", gameSystemId: "other" } });
    expect(() => analyzeBsdataRevision(new MemoryRevisionTree(files), "ref")).toThrow(
      "Catalogue source.json targets an unexpected game system",
    );
    expect(() => analyzeBsdataRevision(new MemoryRevisionTree(revisionFiles(), "short"), "ref")).toThrow(
      "Revision did not resolve to one full commit: ref",
    );
  });

  it("keeps report output beneath the real private root, including through symlinks", () => {
    const privateRoot = resolvePrivateOutputPath("_private");
    expect(resolvePrivateOutputPath("_private/mfm/fixture-report.json")).toBe(
      path.join(privateRoot, "mfm", "fixture-report.json"),
    );
    expect(() => resolvePrivateOutputPath(path.join(REPO_ROOT, "tools", "report.json"))).toThrow(
      "BSData report output must remain under the repository _private directory",
    );
    expect(() => resolvePrivateOutputPath(path.join(REPO_ROOT, "data", "report.json"))).toThrow(
      "BSData report output must remain under the repository _private directory",
    );
    expect(() => resolvePrivateOutputPath("../report.json")).toThrow(
      "BSData report output must remain under the repository _private directory",
    );

    const escapeTarget = mkdtempSync(path.join(tmpdir(), "mfm-output-escape-"));
    temporaryDirectories.push(escapeTarget);
    const escapeLink = path.join(privateRoot, `mfm-output-escape-${process.pid}`);
    symlinkSync(escapeTarget, escapeLink);
    try {
      expect(() => resolvePrivateOutputPath(path.join(escapeLink, "report.json"))).toThrow(
        "BSData report output must remain under the repository _private directory",
      );
    } finally {
      rmSync(escapeLink, { force: true });
    }
  });

  it("executes revision commands through the injected adapter", () => {
    const checkout = mkdtempSync(path.join(tmpdir(), "mfm-bsdata-checkout-"));
    temporaryDirectories.push(checkout);
    const calls: Array<{ command: string; args: readonly string[]; cwd: string }> = [];
    const tree = new JjRevisionTree(checkout, (command, args, options) => {
      calls.push({ command, args, cwd: options.cwd });
      if (args[0] === "log") return `${COMMIT}\n`;
      if (args[1] === "list") return "a file.json\n";
      return "fixture";
    });

    expect(tree.resolveRevision("pinned")).toBe(COMMIT);
    expect(tree.resolveRevision(COMMIT)).toBe(COMMIT);
    expect(tree.listFiles(COMMIT)).toEqual(["a file.json"]);
    expect(tree.readFile(COMMIT, "a file.json")).toBe("fixture");
    expect(calls).toEqual([
      {
        command: "jj",
        args: ["log", "-r", "pinned", "--no-graph", "-T", 'commit_id ++ "\\n"'],
        cwd: checkout,
      },
      {
        command: "jj",
        args: ["log", "-r", `commit_id(${COMMIT})`, "--no-graph", "-T", 'commit_id ++ "\\n"'],
        cwd: checkout,
      },
      {
        command: "jj",
        args: ["file", "list", "-r", `commit_id(${COMMIT})`],
        cwd: checkout,
      },
      {
        command: "jj",
        args: ["file", "show", "-r", `commit_id(${COMMIT})`, '"a file.json"'],
        cwd: checkout,
      },
    ]);
  });

  it("requires an explicit checkout and source ref", () => {
    expect(parseBsdataCli(["--bsdata", "checkout", "--source-ref", "pinned"])).toEqual({
      bsdata: "checkout",
      sourceRef: "pinned",
      output: "_private/mfm/bsdata-backstop.json",
    });
    expect(() => parseBsdataCli(["--bsdata", "checkout"])).toThrow();
    expect(() => parseBsdataCli(["--source-ref", "pinned"])).toThrow();
  });
});
