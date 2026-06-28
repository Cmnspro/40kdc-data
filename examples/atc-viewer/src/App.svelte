<script lang="ts">
  import AppHeader from "../../_shared/AppHeader.svelte";
  import AppFooter from "../../_shared/AppFooter.svelte";
  import type { OpponentPlayer, OpponentTeam } from "../../_shared/opponents";
  import { atcByVariant, ATC_VARIANTS, type AtcVariant } from "./lib/atc-data";
  import Hero from "./lib/Hero.svelte";
  import SearchBar from "./lib/SearchBar.svelte";
  import TeamGroup from "./lib/TeamGroup.svelte";

  // Which event is shown — 8-player (default) or 5-player. Local view state.
  let variant = $state<AtcVariant>("8s");
  const atcData = $derived(atcByVariant[variant]);

  let query = $state("");

  // Switching events clears the filter so the new field shows in full.
  function selectVariant(v: AtcVariant): void {
    if (v === variant) return;
    variant = v;
    query = "";
  }

  const norm = (s: string | null | undefined) => (s ?? "").toLowerCase();
  const totalPlayers = $derived(atcData.teams.reduce((n, t) => n + t.players.length, 0));

  type FilteredTeam = { team: OpponentTeam; players: OpponentPlayer[] };

  // A team shows when its name matches (then all its players show) or when any of
  // its players match name/faction (then only the matching players show).
  const filtered = $derived.by<FilteredTeam[]>(() => {
    const q = query.trim().toLowerCase();
    const out: FilteredTeam[] = [];
    for (const team of atcData.teams) {
      const teamMatch = q === "" || norm(team.name).includes(q);
      const players = teamMatch
        ? team.players
        : team.players.filter((p) => norm(p.name).includes(q) || norm(p.faction).includes(q));
      if (players.length > 0) out.push({ team, players });
    }
    return out;
  });

  const shownPlayers = $derived(filtered.reduce((n, t) => n + t.players.length, 0));
</script>

<div class="flex min-h-dvh flex-col">
  <AppHeader title="ATC Viewer" tag="opponent lists" appId="atc-viewer" />

  <main class="mx-auto w-full max-w-5xl flex-1 px-3 pb-10 sm:px-4">
    <Hero eventName={atcData.event.name} />

    <!-- Event toggle: 8-player vs 5-player. -->
    <div class="mt-4 inline-flex rounded-md border border-panel-border bg-panel p-0.5" role="group" aria-label="Event">
      {#each ATC_VARIANTS as v (v)}
        <button
          type="button"
          class="focus-ring rounded px-3 py-1 text-sm font-semibold transition-colors {variant === v
            ? 'bg-accent text-accent-foreground'
            : 'text-text-muted hover:text-text'}"
          aria-pressed={variant === v}
          onclick={() => selectVariant(v)}
        >
          {v}
        </button>
      {/each}
    </div>

    <div class="mt-3">
      <SearchBar bind:value={query} total={totalPlayers} shown={shownPlayers} />
    </div>

    <div class="mt-4 flex flex-col gap-8">
      {#each filtered as { team, players } (team.id)}
        <TeamGroup {team} {players} />
      {:else}
        <p class="py-12 text-center text-text-dim">No team, player, or faction matches “{query}”.</p>
      {/each}
    </div>
  </main>

  <AppFooter version={__DATA_VERSION__} build={__BUILD_SHA__} />
</div>
