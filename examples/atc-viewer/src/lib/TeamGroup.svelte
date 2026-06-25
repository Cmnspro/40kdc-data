<script lang="ts">
  import type { OpponentPlayer, OpponentTeam } from "../../../_shared/opponents";
  import PlayerCard from "./PlayerCard.svelte";

  let { team, players }: { team: OpponentTeam; players: OpponentPlayer[] } = $props();
</script>

<section class="flex flex-col gap-3">
  <header
    class="sticky top-0 z-10 -mx-3 flex items-baseline gap-2 border-b border-border bg-bg/95 px-3 py-2 backdrop-blur sm:-mx-4 sm:px-4"
  >
    <h2 class="font-heading text-lg font-bold uppercase tracking-wide text-text">
      {team.name ?? "—"}
    </h2>
    <span class="font-mono text-xs text-text-dim">{players.length}</span>
  </header>

  <div class="grid grid-cols-1 gap-3 lg:grid-cols-2">
    {#each players as player (player.id)}
      <PlayerCard {player} />
    {/each}
  </div>
</section>
