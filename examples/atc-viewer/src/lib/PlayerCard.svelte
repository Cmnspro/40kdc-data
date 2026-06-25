<script lang="ts">
  /**
   * One opponent's list. The import is deferred until the card scrolls near the
   * viewport (IntersectionObserver) so 248 lists don't all parse on first paint —
   * important on the phones people browse this with at the event.
   */
  import RosterReview from "../../../_shared/RosterReview.svelte";
  import { parsePlayerRoster, type OpponentPlayer } from "../../../_shared/opponents";
  import { ds } from "./dataset";
  import { builderLink } from "./builder-link";
  import ValidationBadge from "./ValidationBadge.svelte";

  let { player }: { player: OpponentPlayer } = $props();

  let el: HTMLElement | undefined = $state();
  let visible = $state(false);

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

  const parsed = $derived(visible ? parsePlayerRoster(player, ds) : null);
  const roster = $derived(parsed?.ok ? parsed.roster : null);
  const link = $derived(roster ? builderLink(roster) : null);
</script>

<article bind:this={el} class="flex flex-col gap-3 rounded-md border border-panel-border bg-surface p-3 shadow-sm sm:p-4">
  {#if visible}
    <div class="flex flex-wrap items-center justify-between gap-2">
      <ValidationBadge {parsed} {roster} {link} />
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
    <RosterReview {player} dataset={ds} />
  {:else}
    <!-- Placeholder until the card scrolls into view -->
    <div class="flex items-baseline gap-2">
      <span class="font-heading text-base font-bold text-text">{player.name ?? "—"}</span>
      {#if player.faction}<span class="text-sm text-accent">{player.faction}</span>{/if}
    </div>
    <div class="h-4 w-2/3 animate-pulse rounded bg-panel-surface"></div>
  {/if}
</article>
