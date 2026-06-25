<script lang="ts">
  /**
   * One opponent's list, collapsed by default. The import is deferred until the
   * card scrolls near the viewport (IntersectionObserver) so 248 lists don't all
   * parse on first paint — important on the phones people browse this with at the
   * event. The header (name/faction) always renders immediately; the badge,
   * one-line summary, and the full list fill in once parsed / expanded.
   */
  import { tick } from "svelte";
  import RosterReview from "../../../_shared/RosterReview.svelte";
  import { parsePlayerRoster, splitBcpList, type OpponentPlayer } from "../../../_shared/opponents";
  import { ds } from "./dataset";
  import { builderLink } from "./builder-link";
  import { OWN_PLAYER_ID, reveal } from "./me.svelte";
  import ValidationBadge from "./ValidationBadge.svelte";

  let { player }: { player: OpponentPlayer } = $props();

  const isMe = $derived(player.id === OWN_PLAYER_ID);

  let el: HTMLElement | undefined = $state();
  let visible = $state(false);
  let expanded = $state(false);
  let flash = $state(false);

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

  // The Hero "Come say Hi!" button fires reveal(); only the author's own card
  // reacts — expand, scroll into view, and briefly flash. Skip the initial run
  // (token 0) so the page doesn't auto-jump on load.
  let lastSeen = 0;
  $effect(() => {
    if (!isMe) return;
    const t = reveal.token;
    if (t === 0 || t === lastSeen) return;
    lastSeen = t;
    visible = true;
    expanded = true;
    flash = true;
    // Jump near first, then re-center once layout settles: cards lazily parse as
    // the page scrolls past them and each gains a summary line, so a single
    // scroll computed against a pre-parse layout drifts off-target.
    tick().then(() => {
      el?.scrollIntoView({ block: "center" });
      setTimeout(() => el?.scrollIntoView({ behavior: "smooth", block: "center" }), 350);
      setTimeout(() => (flash = false), 2000);
    });
  });
</script>

<article
  bind:this={el}
  id={isMe ? `player-${player.id}` : undefined}
  class="flex min-w-0 scroll-mt-20 flex-col gap-3 rounded-md border bg-surface p-3 shadow-sm transition-shadow duration-700 sm:p-4 {isMe
    ? 'border-accent/60'
    : 'border-panel-border'} {flash ? 'ring-2 ring-accent' : ''}"
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
        {#if isMe}
          <span class="rounded bg-accent-dim px-1.5 py-0.5 text-xs font-semibold text-accent">★ that's me</span>
        {/if}
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
