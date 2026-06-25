<script lang="ts">
  let {
    value = $bindable(""),
    total,
    shown,
  }: { value?: string; total: number; shown: number } = $props();
</script>

<div class="sticky top-0 z-20 -mx-3 border-b border-border bg-bg/95 px-3 py-3 backdrop-blur sm:-mx-4 sm:px-4">
  <div class="relative flex items-center">
    <span class="pointer-events-none absolute left-3 text-text-dim" aria-hidden="true">⌕</span>
    <input
      type="search"
      bind:value
      placeholder="Search team, player, or faction…"
      aria-label="Search team, player, or faction"
      autocomplete="off"
      autocapitalize="off"
      spellcheck="false"
      class="focus-ring min-h-11 w-full rounded-md border border-border-strong bg-panel px-9 py-2 text-base text-text placeholder:text-text-dim"
    />
    {#if value}
      <button
        type="button"
        class="focus-ring absolute right-2 flex h-8 w-8 items-center justify-center rounded text-text-dim hover:text-text"
        aria-label="Clear search"
        onclick={() => (value = "")}
      >
        ✕
      </button>
    {/if}
  </div>
  <p class="mt-1.5 font-mono text-xs text-text-dim">
    {shown} of {total} {total === 1 ? "list" : "lists"}
  </p>
</div>
