/**
 * Divergence client for the explorer's Divergence view.
 *
 * The out-of-repo embeddings harness (`wh40kdc_embeddings divergence`) clusters
 * paired abilities by raw-GW-prose cosine, then within each raw-close cluster flags
 * member pairs whose DSL describer-English drifted apart — similar source rules
 * encoded inconsistently in the DSL, i.e. high-value re-authoring targets. Its
 * report (`_reports/divergence-<scope>.json`) is gitignored and machine-local; it
 * carries GW prose snippets (`gw`/`english`/`a_gw`/`a_english`/`b_gw`/`b_english`)
 * and must never be bundled, fetched from a CDN, committed, or persisted. It enters
 * the explorer only via an in-memory file upload, and we retain ONLY the structural
 * fields — ids, factions, types, sims, and gaps — dropping every prose snippet at
 * parse time so no GW-derived prose ever lands in app state.
 *
 * This mirrors `veracity-store.ts`'s parse/validate/IP-drop idioms; it does not
 * fetch (the report is upload-fed), so there is no URL/cache layer.
 */

export interface DivergenceTotals {
  abilities_paired: number;
  divergent_clusters: number;
  divergent_pairs: number;
  mean_gap: number;
  max_gap: number;
}

/** One cluster member — structural fields only; `gw`/`english` are dropped. */
export interface DivergenceMember {
  ability_id: string;
  faction: string;
  ability_type: string;
}

/** One end of a divergent pair — structural fields only; prose is dropped. */
export interface DivergencePairEnd {
  ability_id: string;
  faction: string;
}

export interface DivergencePair {
  a: DivergencePairEnd;
  b: DivergencePairEnd;
  raw_sim: number;
  en_sim: number;
  gap: number;
}

export interface DivergenceCluster {
  size: number;
  medoid: string;
  raw_min_sim: number;
  raw_mean_sim: number;
  en_min_sim: number;
  en_mean_sim: number;
  gap: number;
  members: DivergenceMember[];
  pairs: DivergencePair[];
}

/** Parsed, app-side divergence index — structural fields only. */
export interface DivergenceIndex {
  scope: string;
  model: string;
  totals: DivergenceTotals;
  clusters: DivergenceCluster[];
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

/**
 * Parse + validate one pair end (`a`/`b`). Keeps only `ability_id`/`faction`;
 * any `a_gw`/`a_english`/… prose snippets on the input are intentionally dropped.
 */
function parsePairEnd(
  raw: unknown,
  ci: number,
  pi: number,
  which: "a" | "b",
): DivergencePairEnd {
  if (typeof raw !== "object" || raw === null) {
    throw new Error(`clusters[${ci}].pairs[${pi}].${which} is not an object.`);
  }
  const e = raw as Record<string, unknown>;
  if (typeof e.ability_id !== "string" || typeof e.faction !== "string") {
    throw new Error(
      `clusters[${ci}].pairs[${pi}].${which} is missing a string ability_id/faction.`,
    );
  }
  return { ability_id: e.ability_id, faction: e.faction };
}

/**
 * Parse + validate a harness divergence report into a {@link DivergenceIndex}.
 * Throws a friendly message on a bad shape (parity with `parseReport`'s guard).
 * Retains only structural fields per `DivergenceIndex`; every GW prose snippet
 * (`gw`/`english`/`a_gw`/`a_english`/`b_gw`/`b_english`) is discarded at parse.
 */
export function parseDivergenceReport(raw: unknown): DivergenceIndex {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    throw new Error("Unexpected report shape (expected a JSON object).");
  }
  const r = raw as Record<string, unknown>;
  if (r.kind !== "divergence") {
    throw new Error(
      `Not a divergence report (kind=${JSON.stringify(r.kind)}). Generate it with ` +
        "`wh40kdc_embeddings divergence`.",
    );
  }
  if (!Array.isArray(r.clusters)) {
    throw new Error("Report is missing a `clusters` array.");
  }

  const clusters: DivergenceCluster[] = [];
  let pairCount = 0;
  for (const [ci, rawCluster] of (r.clusters as unknown[]).entries()) {
    if (typeof rawCluster !== "object" || rawCluster === null) {
      throw new Error(`clusters[${ci}] is not an object.`);
    }
    const cl = rawCluster as Record<string, unknown>;

    if (!Array.isArray(cl.members)) {
      throw new Error(`clusters[${ci}] is missing a \`members\` array.`);
    }
    const members: DivergenceMember[] = [];
    for (const [mi, rawMember] of (cl.members as unknown[]).entries()) {
      if (typeof rawMember !== "object" || rawMember === null) {
        throw new Error(`clusters[${ci}].members[${mi}] is not an object.`);
      }
      const m = rawMember as Record<string, unknown>;
      if (typeof m.ability_id !== "string" || typeof m.faction !== "string") {
        throw new Error(
          `clusters[${ci}].members[${mi}] is missing a string ability_id/faction.`,
        );
      }
      // Keep only structural fields; `gw`/`english` prose snippets are dropped.
      members.push({
        ability_id: m.ability_id,
        faction: m.faction,
        ability_type: typeof m.ability_type === "string" ? m.ability_type : "(unknown)",
      });
    }

    if (!Array.isArray(cl.pairs)) {
      throw new Error(`clusters[${ci}] is missing a \`pairs\` array.`);
    }
    const pairs: DivergencePair[] = [];
    for (const [pi, rawPair] of (cl.pairs as unknown[]).entries()) {
      if (typeof rawPair !== "object" || rawPair === null) {
        throw new Error(`clusters[${ci}].pairs[${pi}] is not an object.`);
      }
      const p = rawPair as Record<string, unknown>;
      // Keep only the two structural ends + sims; `a_gw`/`a_english`/… are dropped.
      pairs.push({
        a: parsePairEnd(p.a, ci, pi, "a"),
        b: parsePairEnd(p.b, ci, pi, "b"),
        raw_sim: isFiniteNumber(p.raw_sim) ? p.raw_sim : NaN,
        en_sim: isFiniteNumber(p.en_sim) ? p.en_sim : NaN,
        gap: isFiniteNumber(p.gap) ? p.gap : NaN,
      });
    }
    pairCount += pairs.length;

    clusters.push({
      size: isFiniteNumber(cl.size) ? cl.size : members.length,
      medoid: typeof cl.medoid === "string" ? cl.medoid : "(unknown)",
      raw_min_sim: isFiniteNumber(cl.raw_min_sim) ? cl.raw_min_sim : NaN,
      raw_mean_sim: isFiniteNumber(cl.raw_mean_sim) ? cl.raw_mean_sim : NaN,
      en_min_sim: isFiniteNumber(cl.en_min_sim) ? cl.en_min_sim : NaN,
      en_mean_sim: isFiniteNumber(cl.en_mean_sim) ? cl.en_mean_sim : NaN,
      gap: isFiniteNumber(cl.gap) ? cl.gap : NaN,
      members,
      pairs,
    });
  }

  const t = (r.totals ?? {}) as Record<string, unknown>;
  const totals: DivergenceTotals = {
    abilities_paired: isFiniteNumber(t.abilities_paired) ? t.abilities_paired : NaN,
    divergent_clusters: isFiniteNumber(t.divergent_clusters)
      ? t.divergent_clusters
      : clusters.length,
    divergent_pairs: isFiniteNumber(t.divergent_pairs) ? t.divergent_pairs : pairCount,
    mean_gap: isFiniteNumber(t.mean_gap) ? t.mean_gap : NaN,
    max_gap: isFiniteNumber(t.max_gap) ? t.max_gap : NaN,
  };

  return {
    scope: typeof r.scope === "string" ? r.scope : "(unknown)",
    model: typeof r.model === "string" ? r.model : "(unknown)",
    totals,
    clusters,
  };
}
