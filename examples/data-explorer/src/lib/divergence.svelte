<script lang="ts">
  import { abilities } from "@alpaca-software/40kdc-data";
  import type { AbilityView } from "@alpaca-software/40kdc-data";
  import { explorer } from "./store.svelte.js";
  import {
    parseDivergenceReport,
    type DivergencePairEnd,
  } from "./divergence-store.js";

  // ── Divergence report upload ──────────────────────────────────────────────
  let divergenceError = $state<string | null>(null);
  let reportInput = $state<HTMLInputElement | null>(null);

  async function loadReport(e: Event): Promise<void> {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    divergenceError = null;
    try {
      const idx = parseDivergenceReport(JSON.parse(await file.text()));
      explorer.setDivergence(idx);
    } catch (err) {
      divergenceError = err instanceof Error ? err.message : String(err);
      explorer.setDivergence(null);
    } finally {
      // Reset so re-picking the same file fires `change` again.
      if (reportInput) reportInput.value = "";
    }
  }

  function clearReport(): void {
    divergenceError = null;
    explorer.setDivergence(null);
  }

  function fmt(n: number): string {
    return Number.isFinite(n) ? n.toFixed(2) : "—";
  }

  // A high gap is the bad case (raw-close, describer-far), so the red→green ramp
  // is inverted relative to the veracity score badge.
  function gapClass(g: number): string {
    return g >= 0.6 ? "weak" : g >= 0.4 ? "mid" : "ok";
  }

  /**
   * The DSL describer-English for an ability, computed locally — never the GW
   * prose (dropped at parse, IP boundary). Resolve the AbilityView by id, falling
   * back to a faction scan when an id recurs across factions, mirroring how
   * roundtrip.svelte's `describe()` helper renders.
   */
  function describe(factionId: string, abilityId: string): string {
    let view: AbilityView | undefined = abilities.get(abilityId);
    if (!view) {
      for (const a of abilities.byFaction(factionId)) {
        if (a.id === abilityId) {
          view = a;
          break;
        }
      }
    }
    if (!view) return "(ability not in dataset)";
    try {
      return view.describe();
    } catch (e) {
      return `(describer error: ${e instanceof Error ? e.message : String(e)})`;
    }
  }

  // Clusters ranked by gap descending — the worst divergence first.
  const clustersByGap = $derived(
    explorer.divergence
      ? [...explorer.divergence.clusters].sort((a, b) => b.gap - a.gap)
      : [],
  );
</script>

<div class="toolbar">
  <div style="flex:1">
    <strong>Divergence</strong>
    <span class="dim">raw-prose-close, describer-far ability pairs</span>
  </div>
  <div>
    <input
      type="file"
      accept=".json,application/json"
      bind:this={reportInput}
      onchange={loadReport}
      hidden
    />
    {#if explorer.divergence}
      <button onclick={clearReport}>Clear report</button>
    {:else}
      <button onclick={() => reportInput?.click()}>Load divergence report…</button>
    {/if}
  </div>
</div>

{#if divergenceError}
  <div class="source-status error">Divergence report — {divergenceError}</div>
{:else if explorer.divergence}
  {@const d = explorer.divergence}
  <div class="source-status veracity-status">
    {d.totals.divergent_clusters} divergent clusters, {d.totals.divergent_pairs} pairs,
    scope <code>{d.scope}</code> · {d.model} · mean gap {fmt(d.totals.mean_gap)} · max gap
    {fmt(d.totals.max_gap)}
  </div>
{:else}
  <div class="source-status">
    No divergence report loaded. Generate one with
    <code>wh40kdc_embeddings divergence</code> and upload it above.
  </div>
{/if}

{#snippet pairEnd(end: DivergencePairEnd)}
  <div class="panel">
    <div class="pair-end-head">
      <button
        class="link-id"
        title="Inspect in Roundtrip QA"
        onclick={() => explorer.inspect(end.ability_id)}
      >
        <code class="col-id">{end.ability_id}</code>
      </button>
      <span class="chip">{end.faction}</span>
    </div>
    <div class="prose">{describe(end.faction, end.ability_id)}</div>
  </div>
{/snippet}

{#if explorer.divergence}
  {#if clustersByGap.length > 0}
    <div class="collation">
      {#each clustersByGap as c (c.medoid)}
        <details class="collation-row">
          <summary>
            <span class="chevron" aria-hidden="true">▶</span>
            <span class="col-name">{c.medoid}</span>
            <span class="chip">{c.size} members</span>
            <span class="score-badge {gapClass(c.gap)}" title="raw_mean − en_mean gap"
              >gap {fmt(c.gap)}</span
            >
            <span class="dim">raw {fmt(c.raw_mean_sim)} · en {fmt(c.en_mean_sim)}</span>
          </summary>
          <div class="col-body">
            <div>
              <div class="section-label">Members</div>
              <ul class="member-list">
                {#each c.members as m (m.faction + "/" + m.ability_id)}
                  <li>
                    <button class="link-id" onclick={() => explorer.inspect(m.ability_id)}>
                      <code class="col-id">{m.ability_id}</code>
                    </button>
                    <span class="dim">[{m.faction}, {m.ability_type}]</span>
                  </li>
                {/each}
              </ul>
            </div>
            <div>
              <div class="section-label">Divergent pairs</div>
              {#each c.pairs as p (p.a.faction + "/" + p.a.ability_id + "↔" + p.b.faction + "/" + p.b.ability_id)}
                <div class="pair">
                  <div class="pair-sims">
                    <span class="score-badge {gapClass(p.gap)}">gap {fmt(p.gap)}</span>
                    <span class="dim">raw {fmt(p.raw_sim)} · en {fmt(p.en_sim)}</span>
                  </div>
                  <div class="pair-ends">
                    {@render pairEnd(p.a)}
                    {@render pairEnd(p.b)}
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </details>
      {/each}
    </div>
  {:else}
    <div class="empty-state">No divergent clusters in this report.</div>
  {/if}
{/if}

<style>
  .member-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }
  .link-id {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    font: inherit;
  }
  .link-id:hover code {
    color: var(--accent);
  }
  .pair {
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: var(--space-2);
    margin-top: var(--space-2);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }
  .pair-sims {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }
  .pair-ends {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-2);
  }
  @media (min-width: 900px) {
    .pair-ends {
      grid-template-columns: 1fr 1fr;
    }
  }
  .pair-end-head {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-bottom: var(--space-1);
  }
</style>
