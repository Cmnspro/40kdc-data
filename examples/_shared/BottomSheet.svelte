<script lang="ts">
  import type { Snippet } from "svelte";

  /**
   * Bottom-anchored sheet shared by the 40kdc example apps. Same native
   * `<dialog>` foundation as `Modal.svelte` — focus trapping, Escape-to-close,
   * and background inertness come for free — but pinned to the bottom of the
   * viewport, full-width, with a grab handle and a scrollable body. Used for
   * mobile flows where a centered modal would feel wrong (e.g. the list
   * builder's unit picker / unit detail panels on a phone).
   *
   * Styling is fully scoped with the shadowboxing palette hardcoded (not read
   * from host CSS variables), matching `Modal.svelte`, so the sheet looks
   * identical regardless of how the host app styles itself.
   */
  interface Props {
    /** Controls visibility. Bindable so the host (and Escape/backdrop) stay in sync. */
    open?: boolean;
    /** Heading shown in the sheet chrome. */
    title: string;
    /** Sheet body. */
    children: Snippet;
    /** Fired after the sheet closes (Escape, backdrop, or close button). */
    onClose?: () => void;
  }

  let { open = $bindable(false), title, children, onClose }: Props = $props();

  let dialogEl = $state<HTMLDialogElement | null>(null);

  // Drive the native open/closed state from the `open` prop. showModal() throws
  // if already open and close() is a no-op when closed, so guard both.
  $effect(() => {
    const el = dialogEl;
    if (!el) return;
    if (open && !el.open) el.showModal();
    else if (!open && el.open) el.close();
  });

  function handleClose(): void {
    open = false;
    onClose?.();
  }

  // Clicking the ::backdrop registers as a click on the dialog element itself
  // (the inner .panel is a child target, so its clicks don't reach here).
  function handleBackdropClick(event: MouseEvent): void {
    if (event.target === dialogEl) handleClose();
  }
</script>

<dialog bind:this={dialogEl} onclose={handleClose} onclick={handleBackdropClick}>
  <div class="panel" role="document">
    <div class="handle" aria-hidden="true"></div>
    <header>
      <h2>{title}</h2>
      <button type="button" class="close" aria-label="Close" onclick={handleClose}>×</button>
    </header>
    <div class="body">
      {@render children()}
    </div>
  </div>
</dialog>

<style>
  dialog {
    padding: 0;
    border: none;
    background: transparent;
    color: #ededf0;
    width: 100%;
    max-width: 40rem;
    /* Pin to the bottom, centered horizontally. Tailwind v4 Preflight resets
       `margin: 0` on the universal selector, so re-assert the placement here. */
    margin: auto auto 0;
    max-height: 90vh;
  }
  dialog::backdrop {
    background: rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
  }
  dialog[open] {
    animation: sheet-up 180ms ease-out;
  }
  @keyframes sheet-up {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    dialog[open] {
      animation: none;
    }
  }
  .panel {
    display: flex;
    flex-direction: column;
    max-height: 90vh;
    background: #1b1b1f;
    border: 1px solid #2e2e34;
    border-bottom: none;
    border-radius: 12px 12px 0 0;
    box-shadow:
      0 1px 0 0 rgba(255, 255, 255, 0.08) inset,
      0 -2px 0 0 rgba(0, 0, 0, 0.8),
      0 -20px 40px -8px rgba(0, 0, 0, 0.95);
    overflow: hidden;
    font-family: "Barlow", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    /* Honour the home-indicator inset on iOS so the body isn't clipped. */
    padding-bottom: env(safe-area-inset-bottom, 0);
  }
  .handle {
    flex: 0 0 auto;
    width: 2.25rem;
    height: 0.25rem;
    margin: 0.5rem auto 0.25rem;
    border-radius: 999px;
    background: #66666f;
  }
  header {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.5rem 1rem 0.75rem;
    border-bottom: 1px solid #262629;
    background: #151517;
  }
  h2 {
    margin: 0;
    font-family: "Barlow Condensed", system-ui, sans-serif;
    font-size: 1.15rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #14b8a6;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .close {
    flex: 0 0 auto;
    font: inherit;
    font-size: 1.35rem;
    line-height: 1;
    width: 2.5rem;
    height: 2.5rem;
    display: grid;
    place-items: center;
    background: #0c0c0e;
    color: #a8a8b2;
    border: 1px solid #66666f; /* control outline — matches --color-border-strong */
    border-radius: 4px;
    cursor: pointer;
  }
  .close:hover {
    color: #ededf0;
    border-color: #14b8a6;
  }
  .close:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px #14b8a6;
  }
  .body {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 0.9rem 1rem 1.1rem;
    font-size: 0.95rem;
    line-height: 1.5;
    color: #ededf0;
  }
</style>
