<script lang="ts">
  /**
   * The per-list validation verdict — the honest signal this whole app exists to
   * show. Green: imported and round-trips through the share registry (earns a
   * builder link). Amber: imported but didn't fully round-trip. Red: didn't
   * parse. Dim: no list text (image-only submission).
   */
  import type { ImportResult, Roster } from "@alpaca-software/40kdc-data";

  let {
    parsed,
    roster,
    link,
  }: { parsed: ImportResult | null; roster: Roster | null; link: string | null } = $props();
</script>

{#if roster && link}
  <span class="badge badge-ok">✓ imports cleanly</span>
{:else if roster && roster.diagnostics.unresolved_units > 0}
  <span class="badge badge-warn">
    ⚠ {roster.diagnostics.unresolved_units} unit{roster.diagnostics.unresolved_units === 1
      ? ""
      : "s"} unresolved
  </span>
{:else if roster}
  <span class="badge badge-warn" title="Fully resolved, but an id wasn't in the share registry">
    ⚠ no share link
  </span>
{:else if parsed && !parsed.ok}
  <span class="badge badge-bad">✕ couldn't parse</span>
{:else}
  <span class="badge badge-dim">— no list text</span>
{/if}

<style>
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.125rem 0.5rem;
    border-radius: var(--radius-sm);
    font-size: 0.75rem;
    font-weight: 600;
    white-space: nowrap;
  }
  .badge-ok {
    color: var(--color-success);
    background: color-mix(in oklch, var(--color-success) 14%, transparent);
  }
  .badge-warn {
    color: var(--color-warning);
    background: color-mix(in oklch, var(--color-warning) 14%, transparent);
  }
  .badge-bad {
    color: var(--color-danger);
    background: color-mix(in oklch, var(--color-danger) 14%, transparent);
  }
  .badge-dim {
    color: var(--color-text-dim);
    background: var(--color-panel-surface);
  }
</style>
