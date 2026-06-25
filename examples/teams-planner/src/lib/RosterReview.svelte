<script lang="ts">
  /**
   * Read-only army-list view for a BCP opponent. Strips the BCP header, parses
   * the body with the package importer, and renders the resolved roster
   * (detachment, points, warlord, units + wargear). Falls back to the raw text
   * when a list can't be parsed (image-only submissions, odd formats) so a list
   * is never unreadable — just less structured.
   */
  import type { Roster, RosterUnit } from "@alpaca-software/40kdc-data";
  import { parsePlayerRoster, splitBcpList, type OpponentPlayer } from "./opponents";

  let { player, large = false }: { player: OpponentPlayer; large?: boolean } = $props();

  const parsed = $derived(parsePlayerRoster(player));
  const header = $derived(player.armyListText ? splitBcpList(player.armyListText).header : {});
  const roster = $derived(parsed?.ok ? parsed.roster : null);
  let showRaw = $state(false);

  function wargearLine(u: RosterUnit): string {
    return u.wargear
      .filter((w) => w.ref.raw_name && !/^close combat weapon$/i.test(w.ref.raw_name))
      .map((w) => (w.count > 1 ? `${w.count}× ${w.ref.raw_name}` : w.ref.raw_name))
      .join(", ");
  }

  function pts(r: Roster): string {
    const c = r.points.total_computed;
    const lim = r.points.declared_limit;
    return lim ? `${c} / ${lim} pts` : `${c} pts`;
  }
</script>

<div class="flex flex-col gap-3 {large ? 'text-base' : 'text-sm'}">
  <header class="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-panel-border pb-2">
    <span class="font-heading {large ? 'text-xl' : 'text-base'} font-bold text-text">{player.name}</span>
    {#if player.faction}<span class="text-accent">{player.faction}</span>{/if}
    {#if header["disposition used"]}
      <span class="text-text-muted">· {header["disposition used"]}</span>
    {/if}
    {#if header["detachment used"]}
      <span class="text-text-dim">· {header["detachment used"]}</span>
    {/if}
    {#if roster}<span class="ml-auto font-mono text-text-muted">{pts(roster)}</span>{/if}
  </header>

  {#if roster}
    {@const warlord = roster.units.find((u) => u.is_warlord)}
    {#if warlord || roster.diagnostics.unresolved_units > 0}
      <div class="flex flex-wrap gap-2 text-xs">
        {#if warlord}
          <span class="rounded bg-accent-dim px-2 py-0.5 text-accent">★ Warlord: {warlord.ref.raw_name}</span>
        {/if}
        {#if roster.diagnostics.unresolved_units > 0}
          <span class="rounded bg-surface px-2 py-0.5 text-warning" title="Units the dataset couldn't match (rendered from raw names)">
            {roster.diagnostics.unresolved_units} unresolved
          </span>
        {/if}
      </div>
    {/if}

    <ul class="flex flex-col divide-y divide-panel-border/60">
      {#each roster.units as unit (unit.ref.raw_name + unit.points)}
        <li class="flex flex-col gap-0.5 py-1.5">
          <div class="flex items-baseline gap-2">
            {#if unit.is_warlord}<span class="text-accent" title="Warlord">★</span>{/if}
            <span class="font-medium text-text">
              {unit.model_count > 1 ? `${unit.model_count}× ` : ""}{unit.ref.raw_name}
            </span>
            {#if !unit.ref.resolved}
              <span class="text-warning" title="not matched in dataset">⚠</span>
            {/if}
            {#if unit.points != null}<span class="ml-auto font-mono text-text-dim">{unit.points}</span>{/if}
          </div>
          {#if unit.enhancement}
            <div class="pl-4 text-xs text-accent">+ {unit.enhancement.raw_name}</div>
          {/if}
          {#if unit.leader_attachment}
            <div class="pl-4 text-xs text-text-dim">↳ {unit.leader_attachment.role}: {unit.leader_attachment.bodyguard_ref.raw_name}</div>
          {/if}
          {#if wargearLine(unit)}
            <div class="pl-4 text-xs text-text-dim">{wargearLine(unit)}</div>
          {/if}
        </li>
      {/each}
    </ul>
  {:else if player.armyListText}
    <p class="text-xs text-text-dim">
      Couldn't parse this list into datasheets{parsed && !parsed.ok ? ` (${parsed.reason})` : ""} — showing the raw text.
    </p>
  {:else}
    <p class="text-sm text-text-dim">No list submitted (or it's an image — BCP allows image uploads).</p>
  {/if}

  {#if player.armyListText}
    <button
      type="button"
      class="focus-ring self-start text-xs text-text-dim underline hover:text-text-muted"
      onclick={() => (showRaw = !showRaw)}
    >
      {showRaw ? "Hide" : "Show"} raw list text
    </button>
    {#if showRaw || !roster}
      <pre class="max-h-[40vh] overflow-auto whitespace-pre-wrap rounded bg-bg-dark p-3 text-xs text-text-muted">{player.armyListText}</pre>
    {/if}
  {/if}
</div>
