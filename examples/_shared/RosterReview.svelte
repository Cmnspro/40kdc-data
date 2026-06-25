<script lang="ts">
  /**
   * Read-only army-list view for one opponent. Strips the event-export header,
   * parses the body with the package importer, and renders the resolved roster
   * (detachment, points, warlord, units + wargear). Falls back to the raw text
   * when a list can't be parsed (image-only submissions, odd formats) so a list
   * is never unreadable, just less structured.
   */
  import type { Dataset, ImportResult, Roster, RosterUnit } from "@alpaca-software/40kdc-data";
  import { parsePlayerRoster, splitBcpList, type OpponentPlayer } from "./opponents";

  // `dataset` is injected (rather than imported as a singleton) so this lives in
  // _shared without coupling to any one app's dataset module. `parsed` lets a
  // caller that already imported the list (e.g. for a validation badge) hand the
  // result in so it isn't parsed twice; omit it and we parse internally.
  // `showHeader` is off when the host card already renders the name/faction line.
  let {
    player,
    dataset,
    large = false,
    parsed,
    showHeader = true,
  }: {
    player: OpponentPlayer;
    dataset: Dataset;
    large?: boolean;
    parsed?: ImportResult | null;
    showHeader?: boolean;
  } = $props();

  const result = $derived(parsed !== undefined ? parsed : parsePlayerRoster(player, dataset));
  const header = $derived(player.armyListText ? splitBcpList(player.armyListText).header : {});
  const roster = $derived(result?.ok ? result.roster : null);
  let showRaw = $state(false);

  // The GW-app body carries model-group labels like "• Attached as: Support ()"
  // / "Bodyguard ()" that the importer keeps as wargear with an empty qualifier.
  // Drop them from the display (the real fix is upstream in the importer).
  const ROLE_ARTIFACT = /^(attached as:\s*)?(leader|support|bodyguard)\s*(\(\s*\))?$/i;

  function wargearLine(u: RosterUnit): string {
    return u.wargear
      .filter(
        (w) =>
          w.ref.raw_name &&
          !/^close combat weapon$/i.test(w.ref.raw_name) &&
          !ROLE_ARTIFACT.test(w.ref.raw_name.trim()),
      )
      .map((w) => (w.count > 1 ? `${w.count}× ${w.ref.raw_name}` : w.ref.raw_name))
      .join(", ");
  }

  function pts(r: Roster): string {
    const c = r.points.total_computed;
    const lim = r.points.declared_limit;
    return lim ? `${c} / ${lim} pts` : `${c} pts`;
  }
</script>

<div class="flex min-w-0 flex-col gap-3 {large ? 'text-base' : 'text-sm'}">
  {#if showHeader}
    <header class="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-panel-border pb-2">
      <span class="font-heading {large ? 'text-xl' : 'text-base'} font-bold text-text">{player.name}</span>
      {#if player.faction}<span class="text-accent">{player.faction}</span>{/if}
      {#if header["disposition used"]}
        <span class="text-text-muted">· {header["disposition used"]}</span>
      {/if}
      {#if header["detachment used"]}
        <span class="text-text-dim">· {header["detachment used"]}</span>
      {/if}
      {#if roster}<span class="ml-auto font-mono tabular-nums text-text-muted">{pts(roster)}</span>{/if}
    </header>
  {/if}

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

    <ul class="flex flex-col divide-y divide-panel-border/40">
      <!-- Key by index: a roster can legitimately hold duplicate units (e.g. two
           identical 5-Kasrkin squads), and raw_name+points is not unique — a
           collision throws each_key_duplicate and crashes the whole render. The
           list is static per parse, so the index is a safe, unique key. -->
      {#each roster.units as unit, i (i)}
        <li class="flex min-w-0 flex-col gap-1 py-2.5">
          <div class="flex min-w-0 items-baseline gap-2">
            {#if unit.is_warlord}<span class="text-accent" title="Warlord">★</span>{/if}
            <span class="min-w-0 break-words [overflow-wrap:anywhere] font-medium text-text">
              {unit.model_count > 1 ? `${unit.model_count}× ` : ""}{unit.ref.raw_name}
            </span>
            {#if !unit.ref.resolved}
              <span class="text-warning" title="not matched in dataset">⚠</span>
            {/if}
            {#if unit.points != null}<span class="ml-auto shrink-0 font-mono tabular-nums text-text-dim">{unit.points}</span>{/if}
          </div>
          {#if unit.enhancement}
            <div class="break-words [overflow-wrap:anywhere] pl-4 text-xs text-accent">+ {unit.enhancement.raw_name}</div>
          {/if}
          {#if unit.leader_attachment}
            <div class="break-words [overflow-wrap:anywhere] pl-4 text-xs text-text-dim">↳ {unit.leader_attachment.role}: {unit.leader_attachment.bodyguard_ref.raw_name}</div>
          {/if}
          {#if wargearLine(unit)}
            <div class="break-words [overflow-wrap:anywhere] pl-4 text-xs leading-relaxed text-text-dim">{wargearLine(unit)}</div>
          {/if}
        </li>
      {/each}
    </ul>
  {:else if player.armyListText}
    <p class="text-xs text-text-dim">
      Couldn't parse this list into datasheets{result && !result.ok ? ` (${result.reason})` : ""}; showing the raw text.
    </p>
  {:else}
    <p class="text-sm text-text-dim">No text list submitted (it may be an image-only entry).</p>
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
      <pre class="max-h-[40vh] max-w-full overflow-auto whitespace-pre-wrap [overflow-wrap:anywhere] rounded bg-bg-dark p-3 text-xs text-text-muted">{player.armyListText}</pre>
    {/if}
  {/if}
</div>
