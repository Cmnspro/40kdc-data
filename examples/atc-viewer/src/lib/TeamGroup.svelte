<script lang="ts">
  import type { OpponentPlayer, OpponentTeam } from "../../../_shared/opponents";
  import PlayerCard from "./PlayerCard.svelte";

  let { team, players }: { team: OpponentTeam; players: OpponentPlayer[] } = $props();

  const s = $derived(team.standing);
  const roundClass = (r: "W" | "D" | "L") =>
    r === "W"
      ? "bg-emerald-500/15 text-emerald-400"
      : r === "L"
        ? "bg-rose-500/15 text-rose-400"
        : "bg-amber-500/15 text-amber-400";
</script>

<section class="flex flex-col gap-3">
  <header
    class="sticky top-0 z-10 -mx-3 flex flex-wrap items-baseline gap-x-2 gap-y-1 border-b border-border bg-bg/95 px-3 py-2 backdrop-blur sm:-mx-4 sm:px-4"
  >
    {#if s}
      <span
        class="rounded bg-accent px-1.5 py-0.5 font-mono text-xs font-bold tabular-nums text-accent-foreground"
        title="Final placing">#{s.placing}</span
      >
    {/if}
    <h2 class="font-heading text-lg font-bold uppercase tracking-wide text-text">
      {team.name ?? "—"}
    </h2>
    <span class="font-mono text-xs text-text-dim">{players.length}</span>
    {#if s?.dropped}
      <span class="rounded bg-panel-border px-1 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-text-dim">dropped</span>
    {/if}
    {#if s}
      <span class="ml-auto flex flex-wrap items-center gap-x-2 font-mono text-xs tabular-nums text-text-dim">
        <span class="text-text-muted">{s.matchPoints} MP</span>
        <span>· {s.gameWins} GW</span>
        <span>· {s.battlePoints} BP</span>
        {#if s.rounds.length}
          <span class="ml-1 inline-flex gap-0.5">
            {#each s.rounds as r, i (i)}
              <span class="rounded px-1 py-0.5 text-[0.6rem] font-bold {roundClass(r.result)}" title={`Round ${i + 1}: ${r.points} BP`}
                >{r.result}</span
              >
            {/each}
          </span>
        {/if}
      </span>
    {/if}
  </header>

  <div class="grid grid-cols-1 gap-3 lg:grid-cols-2">
    {#each players as player (player.id)}
      <PlayerCard {player} />
    {/each}
  </div>
</section>
