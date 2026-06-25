<script lang="ts">
  import { flip } from "svelte/animate";
  import type { ForceDispositionId } from "@alpaca-software/40kdc-data";
  import { DISPOSITION_LABELS, DISPOSITIONS } from "../../../../_shared/matchup-grid.js";
  import {
    effectivePlacement,
    factionKeywordIdentity,
    fdAssignmentIssues,
    playerCoverage,
    sanitizeTeamSize,
    type Player,
    type TeamPlan,
    type TeamSize,
  } from "../coverage";
  import { entitlement } from "../../../../_shared/entitlement.svelte";
  import { ds } from "../dataset";
  import type { MatrixDoc } from "../matrix/matrix-doc";
  import type { MatrixTeam } from "../matrix/types";
  import { generateCpuTeam } from "./archetypes";
  import { matrixTeamToSimPlayers } from "./from-matrix";
  import CardRow from "./CardRow.svelte";
  import FactionCard from "./FactionCard.svelte";
  import { CARD_MS, receiveCard, sendCard } from "./transitions";
  import type { Round, SimPlayer } from "./types";

  /**
   * Pre-sim setup, in the mat's own card language: your plan players sit on
   * a bench; click (or drag toward the roster) to move one onto your pool
   * row, where its card grows a disposition picker. The opposition is dealt
   * as face-up cards. Legality issues are shown but never block — it's a
   * practice tool.
   */
  let {
    plan,
    matrixDoc,
    onstart,
  }: {
    plan: TeamPlan;
    /** Threat-matrix doc — source for importing a scouted opponent team as the
     *  opposing side. Only surfaced to entitled users (matrix-tab gate). */
    matrixDoc: MatrixDoc;
    onstart: (user: SimPlayer[], cpu: SimPlayer[], size: TeamSize, round: Round) => void;
  } = $props();

  let round = $state<Round>(1);
  /** Which plan players are in, by id (defaults to the first `plan.size`).
   *  Deliberately a mount-time snapshot: the simulator view remounts on every
   *  entry, and a remote plan edit mid-setup shouldn't yank selections. */
  // svelte-ignore state_referenced_locally
  let included = $state<Set<string>>(new Set(plan.players.slice(0, plan.size).map((p) => p.id)));
  /** Each included player's disposition for the round. */
  let fdByPlayer = $state<Record<string, ForceDispositionId>>(seedFds());
  /** Where the opposing team comes from: a random archetype roll, or a scouted
   *  team imported from the threat matrix. */
  let opponentSource = $state<"random" | "matrix">("random");
  /** The randomly-rolled opposing team (used in "random" mode). */
  let randomTeam = $state<SimPlayer[]>([]);
  let cpuError = $state<string | null>(null);
  /** Which scouted team is selected for import (used in "matrix" mode). */
  let selectedMatrixTeamId = $state<string | null>(null);

  /** Default each player to their best-tier covered disposition, spreading
   *  across the five before repeating. */
  function seedFds(): Record<string, ForceDispositionId> {
    const out: Record<string, ForceDispositionId> = {};
    const taken = new Set<ForceDispositionId>();
    for (const p of plan.players) {
      const covered = [...playerCoverage(p)];
      const ranked = covered
        .map((d) => ({ d, eff: effectivePlacement(p, d) }))
        .sort((a, b) => tierRank(b.eff?.tier) - tierRank(a.eff?.tier));
      const fresh = ranked.find((r) => !taken.has(r.d)) ?? ranked[0];
      const fd = fresh?.d ?? DISPOSITIONS[0];
      out[p.id] = fd;
      taken.add(fd);
    }
    return out;
  }

  function tierRank(t: string | undefined): number {
    return t === "want" ? 3 : t === "pref" ? 2 : t === "could" ? 1 : 0;
  }

  function toggle(id: string) {
    const next = new Set(included);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    included = next;
  }

  const selected = $derived(plan.players.filter((p) => included.has(p.id)));
  const bench = $derived(plan.players.filter((p) => !included.has(p.id)));
  const size = $derived(sanitizeTeamSize(selected.length));
  const sizeOk = $derived(selected.length >= 3 && selected.length <= 8);

  // ── Opponent import (threat matrix) ─────────────────────────────────────────
  // Scouted opponent teams loaded in the matrix, minus our own. Entitled users
  // only — the matrix is gated, so non-patrons never see the import affordance.
  const matrixOpponentTeams = $derived<MatrixTeam[]>(
    entitlement.connected
      ? matrixDoc.teamOrder
          .map((id) => matrixDoc.teamsById[id])
          .filter((t): t is MatrixTeam => !!t && t.id !== matrixDoc.ourTeamId)
      : [],
  );
  const canImport = $derived(matrixOpponentTeams.length > 0);
  // Both sides must be equal, so only teams whose player count matches the
  // chosen roster size are importable.
  const importableTeams = $derived(matrixOpponentTeams.filter((t) => t.players.length === size));
  const selectedMatrixTeam = $derived(
    importableTeams.find((t) => t.id === selectedMatrixTeamId) ?? importableTeams[0] ?? null,
  );
  /** The opposing team fed to the sim: the scouted import in matrix mode, else
   *  the random roll. */
  const cpuTeam = $derived<SimPlayer[]>(
    opponentSource === "matrix"
      ? selectedMatrixTeam
        ? matrixTeamToSimPlayers(selectedMatrixTeam, matrixDoc)
        : []
      : randomTeam,
  );

  /** A plan player as a sim card (factionless players go neutral). */
  function asSimPlayer(p: Player, i: number): SimPlayer {
    return {
      id: p.id,
      name: p.name || `Player ${i + 1}`,
      factionId: p.factionIds[0] ?? "",
      fd: fdByPlayer[p.id] ?? DISPOSITIONS[0],
    };
  }

  const issues = $derived.by(() => {
    if (!sizeOk) return [];
    const out = fdAssignmentIssues(size, selected.map((p) => fdByPlayer[p.id])).map(
      (i) => i.detail,
    );
    const keywords = new Map<string, string[]>();
    for (const p of selected) {
      // The fielded army's keyword: derived from the player's first faction.
      const f = p.factionIds[0];
      if (!f) continue;
      const k = factionKeywordIdentity(f);
      keywords.set(k, [...(keywords.get(k) ?? []), p.name || "(unnamed)"]);
    }
    for (const [k, names] of keywords) {
      if (names.length > 1) {
        out.push(
          `${names.join(" and ")} share the ${ds.factions.get(k)?.name ?? k} faction keyword`,
        );
      }
    }
    return out;
  });

  function reroll() {
    if (!sizeOk) return;
    try {
      randomTeam = generateCpuTeam(size);
      cpuError = null;
    } catch (e) {
      randomTeam = [];
      cpuError = e instanceof Error ? e.message : String(e);
    }
  }

  // Roll an opposing team whenever the size changes (and on first render), but
  // only in random mode — an imported scouted team must never be clobbered.
  $effect(() => {
    void size;
    if (opponentSource === "random") reroll();
  });

  function start() {
    if (!sizeOk || cpuTeam.length !== size) return;
    onstart(selected.map(asSimPlayer), cpuTeam, size, round);
  }

  function coveredOptions(p: Player): ForceDispositionId[] {
    const covered = playerCoverage(p);
    return covered.size > 0 ? DISPOSITIONS.filter((d) => covered.has(d)) : DISPOSITIONS;
  }
</script>

<div class="flex flex-col gap-4">
  <section class="rounded-md border border-panel-border bg-panel-surface p-3">
    <h2 class="mb-2 font-heading text-sm font-bold uppercase tracking-wider text-text-muted">
      Your team
    </h2>
    {#if plan.players.length < 3}
      <p class="py-4 text-center text-sm text-text-dim">
        Add at least 3 players on the Plan tab to practice pairings.
      </p>
    {:else}
      <!-- Active roster: card + on-card disposition picker. Click to bench. -->
      <div class="roster" role="list" aria-label="Playing this round">
        {#each selected as p, i (p.id)}
          <div
            class="roster-cell"
            animate:flip={{ duration: CARD_MS }}
            in:receiveCard={{ key: `setup-${p.id}` }}
            out:sendCard={{ key: `setup-${p.id}` }}
          >
            <FactionCard
              player={asSimPlayer(p, i)}
              size="lg"
              selectable
              onpick={() => toggle(p.id)}
              title="{p.name || 'player'} — click to move to the bench"
            />
            <select
              class="focus-ring fd-pick"
              value={fdByPlayer[p.id]}
              aria-label="Disposition for {p.name || 'player'}"
              onchange={(e) => {
                fdByPlayer = {
                  ...fdByPlayer,
                  [p.id]: (e.currentTarget as HTMLSelectElement).value as ForceDispositionId,
                };
              }}
            >
              {#each coveredOptions(p) as d (d)}
                <option value={d}>{DISPOSITION_LABELS[d]}</option>
              {/each}
            </select>
          </div>
        {/each}
        {#if selected.length === 0}
          <p class="self-center text-sm italic text-text-dim">Pick players from the bench below.</p>
        {/if}
      </div>
      <p class="mt-2 text-[11px] text-text-dim">
        {selected.length} selected — pairing modules need 3–8 players.
      </p>
      {#each issues as issue (issue)}
        <div class="mt-1 rounded border border-warning/40 bg-warning/10 px-2 py-1 text-[11px] text-warning">
          ⚠ {issue}
        </div>
      {/each}

      {#if bench.length > 0}
        <div class="mt-3 border-t border-dashed border-panel-border pt-2">
          <span class="text-[10px] font-bold uppercase tracking-wider text-text-dim">Bench — click to add</span>
          <div class="roster mt-1" role="list" aria-label="Bench">
            {#each bench as p, i (p.id)}
              <div
                class="roster-cell"
                animate:flip={{ duration: CARD_MS }}
                in:receiveCard={{ key: `setup-${p.id}` }}
                out:sendCard={{ key: `setup-${p.id}` }}
              >
                <FactionCard
                  player={asSimPlayer(p, i)}
                  size="sm"
                  selectable
                  onpick={() => toggle(p.id)}
                  title="{p.name || 'player'} — click to add to the roster"
                />
              </div>
            {/each}
          </div>
        </div>
      {/if}
    {/if}
  </section>

  <section class="rounded-md border border-panel-border bg-panel-surface p-3">
    <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
      <h2 class="font-heading text-sm font-bold uppercase tracking-wider text-text-muted">
        Opposing team
      </h2>
      <div class="flex items-center gap-2">
        {#if canImport}
          <!-- Entitled users can rehearse a real ATC matchup by importing a
               scouted team from the threat matrix instead of a random roll. -->
          <div class="flex overflow-hidden rounded border border-border-strong text-xs" role="group" aria-label="Opponent source">
            <button
              type="button"
              class="focus-ring px-2 py-1 uppercase tracking-wide
                     {opponentSource === 'random' ? 'bg-accent text-accent-foreground' : 'text-text-muted hover:text-text'}"
              aria-pressed={opponentSource === "random"}
              onclick={() => (opponentSource = "random")}
            >⟳ Random</button>
            <button
              type="button"
              class="focus-ring px-2 py-1 uppercase tracking-wide
                     {opponentSource === 'matrix' ? 'bg-accent text-accent-foreground' : 'text-text-muted hover:text-text'}"
              aria-pressed={opponentSource === "matrix"}
              onclick={() => (opponentSource = "matrix")}
            >📋 From threat matrix</button>
          </div>
        {/if}
        {#if opponentSource === "random"}
          <button
            type="button"
            class="focus-ring rounded border border-border-strong px-2 py-1 text-xs uppercase tracking-wide text-text-muted hover:border-accent hover:text-accent"
            onclick={reroll}
            disabled={!sizeOk}
          >
            ↻ Reroll
          </button>
        {/if}
      </div>
    </div>

    {#if opponentSource === "matrix"}
      {#if !sizeOk}
        <p class="text-sm text-text-dim">Select 3–8 players first.</p>
      {:else if importableTeams.length === 0}
        <p class="text-sm text-text-dim">
          No scouted team has {size} players. Adjust your roster size, or load the event and set
          rosters on the <strong>Threat matrix</strong> tab.
        </p>
      {:else}
        <label class="mb-2 flex flex-col gap-1">
          <span class="font-heading text-[10px] font-bold uppercase tracking-wider text-text-dim">
            Scouted team
          </span>
          <select
            class="focus-ring rounded border border-border-strong bg-panel px-2 py-1.5 text-sm text-text"
            value={selectedMatrixTeam?.id ?? ""}
            aria-label="Scouted opponent team"
            onchange={(e) => (selectedMatrixTeamId = (e.currentTarget as HTMLSelectElement).value)}
          >
            {#each importableTeams as t (t.id)}
              <option value={t.id}>{t.name}</option>
            {/each}
          </select>
        </label>
        <CardRow label="" players={cpuTeam} size="md" />
      {/if}
    {:else if cpuError}
      <p class="text-sm text-danger">{cpuError}</p>
    {:else if cpuTeam.length === 0}
      <p class="text-sm text-text-dim">Select 3–8 players to roll an opposing team.</p>
    {:else}
      <CardRow label="" players={cpuTeam} size="md" />
    {/if}
  </section>

  <div class="flex flex-wrap items-end gap-3">
    <label class="flex flex-col gap-1">
      <span class="font-heading text-[10px] font-bold uppercase tracking-wider text-text-dim">
        Event round
      </span>
      <select
        class="focus-ring rounded border border-border-strong bg-panel px-2 py-1.5 text-sm text-text"
        value={String(round)}
        onchange={(e) => (round = Number((e.currentTarget as HTMLSelectElement).value) as Round)}
      >
        <option value="1">Round 1 (refused play Layout A)</option>
        <option value="2">Round 2 (refused play Layout B)</option>
        <option value="3">Round 3 (refused play Layout C)</option>
      </select>
    </label>
    <button
      type="button"
      class="focus-ring rounded bg-accent px-4 py-2 text-sm font-semibold uppercase tracking-wide text-accent-foreground hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
      onclick={start}
      disabled={!sizeOk || cpuTeam.length !== size}
    >
      Start pairings
    </button>
  </div>
</div>

<style>
  .roster {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    align-items: flex-start;
    min-height: 3rem;
  }
  .roster-cell {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    align-items: center;
  }
  .fd-pick {
    width: 7.25rem;
    border-radius: 0.25rem;
    border: 1px solid var(--color-border-strong, #66666f);
    background: var(--color-panel, #16171c);
    color: var(--color-text, #ececf0);
    font-size: 0.68rem;
    padding: 0.25rem;
  }
</style>
