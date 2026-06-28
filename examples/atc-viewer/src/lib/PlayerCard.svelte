<script lang="ts">
  /**
   * One opponent's list, collapsed by default. The import is deferred until the
   * card scrolls near the viewport (IntersectionObserver) so 248 lists don't all
   * parse on first paint — important on the phones people browse this with at the
   * event. The header (name/faction) always renders immediately; the badge,
   * one-line summary, and the full list fill in once parsed / expanded.
   */
  import RosterReview from "../../../_shared/RosterReview.svelte";
  import { parsePlayerRoster, splitBcpList, type OpponentPlayer } from "../../../_shared/opponents";
  import { ds } from "./dataset";
  import { builderLink } from "./builder-link";
  import ValidationBadge from "./ValidationBadge.svelte";

  let { player }: { player: OpponentPlayer } = $props();

  let el: HTMLElement | undefined = $state();
  let visible = $state(false);
  let expanded = $state(false);

  $effect(() => {
    if (!el || visible) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          visible = true;
          obs.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  });

  // Expanding forces a parse even if the observer hasn't fired yet (a click means
  // the card is on screen anyway).
  const parsed = $derived(visible || expanded ? parsePlayerRoster(player, ds) : null);
  const roster = $derived(parsed?.ok ? parsed.roster : null);
  const link = $derived(roster ? builderLink(roster) : null);

  const listHeader = $derived(player.armyListText ? splitBcpList(player.armyListText).header : {});
  const disposition = $derived(listHeader["disposition used"] || null);
  const warlordName = $derived(roster?.units.find((u) => u.is_warlord)?.ref.raw_name ?? null);
  const summaryPts = $derived(
    roster
      ? roster.points.declared_limit
        ? `${roster.points.total_computed} / ${roster.points.declared_limit} pts`
        : `${roster.points.total_computed} pts`
      : null,
  );
</script>

<article
  bind:this={el}
  class="flex min-w-0 scroll-mt-20 flex-col gap-3 rounded-md border border-panel-border bg-surface p-3 shadow-sm sm:p-4"
>
  <div class="flex min-h-6 flex-wrap items-center justify-between gap-2">
    {#if visible || expanded}
      <ValidationBadge {parsed} {roster} {link} />
    {/if}
    {#if link}
      <a
        class="focus-ring inline-flex min-h-9 items-center gap-1 rounded-md bg-accent px-3 py-1.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover"
        href={link}
        target="_blank"
        rel="noopener noreferrer"
      >
        Open in list builder ↗
      </a>
    {/if}
  </div>

  <button
    type="button"
    class="focus-ring -m-1 flex items-start gap-3 rounded p-1 text-left hover:bg-panel-hover"
    aria-expanded={expanded}
    onclick={() => (expanded = !expanded)}
  >
    <div class="flex min-w-0 flex-1 flex-col gap-1">
      <div class="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span class="font-heading text-base font-bold text-text">{player.name ?? "—"}</span>
        {#if player.faction}<span class="text-sm text-accent">{player.faction}</span>{/if}
      </div>
      {#if summaryPts}
        <div class="flex flex-wrap gap-x-2 font-mono text-xs tabular-nums text-text-dim">
          <span>{summaryPts}</span>
          {#if disposition}<span>· {disposition}</span>{/if}
          {#if warlordName}<span class="text-text-muted">· ★ {warlordName}</span>{/if}
        </div>
      {:else if !player.armyListText}
        <div class="text-xs text-text-dim">No list submitted</div>
      {:else if visible || expanded}
        <div class="text-xs text-text-dim">Raw list only</div>
      {/if}
    </div>
    <span
      class="mt-0.5 shrink-0 text-text-dim transition-transform duration-200 {expanded ? 'rotate-90' : ''}"
      aria-hidden="true">▸</span
    >
  </button>

  {#if expanded}
    <div class="border-t border-panel-border pt-3">
      <RosterReview {player} dataset={ds} {parsed} showHeader={false} />
    </div>
  {/if}
</article>
