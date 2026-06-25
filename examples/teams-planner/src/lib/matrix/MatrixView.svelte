<script lang="ts">
  /**
   * Matrix tab wrapper: load a BCP event JSON (the private pull from
   * scripts/fetch-bcp-event.ts), go live so the table can be scored on a TV and
   * referenced on an iPad, then the ThreatMatrix itself. State (the matrix doc +
   * the local opponents) lives in App.svelte so the live-sync wiring stays in
   * one place.
   */
  import ThreatMatrix from "./ThreatMatrix.svelte";
  import { loadOpponents, type OpponentData } from "../../../../_shared/opponents";
  import type { TeamPlan } from "../coverage";
  import type { MatrixDoc } from "./matrix-doc";

  let {
    doc,
    plan,
    opponents = null,
    showGoLive = false,
    onChange,
    onLoadOpponents,
    onGoLive,
    onFlash,
  }: {
    doc: MatrixDoc;
    plan: TeamPlan;
    opponents?: OpponentData | null;
    showGoLive?: boolean;
    onChange: (next: MatrixDoc) => void;
    onLoadOpponents: (data: OpponentData) => void;
    onGoLive: () => void;
    onFlash: (msg: string) => void;
  } = $props();

  let fileInput: HTMLInputElement;

  async function onFile(e: Event): Promise<void> {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    try {
      const data = loadOpponents(JSON.parse(await file.text()));
      if (!data) {
        onFlash("That doesn't look like a BCP event pull (no teams found).");
        return;
      }
      onLoadOpponents(data);
      onFlash(`Loaded ${data.teams.length} teams from ${data.event.name ?? "the event"}.`);
    } catch {
      onFlash("Couldn't read that file as JSON.");
    } finally {
      if (fileInput) fileInput.value = "";
    }
  }
</script>

<div class="flex flex-col gap-3">
  <div class="flex flex-wrap items-center gap-2">
    <input
      bind:this={fileInput}
      type="file"
      accept="application/json,.json"
      class="hidden"
      onchange={onFile}
    />
    <button
      type="button"
      class="focus-ring rounded border border-panel-border bg-panel-surface px-3 py-1.5 text-sm text-text hover:bg-panel-hover"
      onclick={() => fileInput?.click()}
    >
      Load BCP event JSON
    </button>
    {#if doc.eventName}
      <span class="text-sm text-text-muted">{doc.eventName}</span>
    {/if}
    {#if showGoLive && doc.teamOrder.length > 0}
      <button
        type="button"
        class="focus-ring ml-auto rounded border border-accent/40 bg-accent-dim px-3 py-1.5 text-sm text-accent hover:bg-accent-dim/80"
        onclick={onGoLive}
        title="Make this matrix a live shared doc — score it on the TV, open the link on an iPad"
      >
        Go live
      </button>
    {/if}
  </div>

  <ThreatMatrix {doc} {plan} {opponents} {onChange} />
</div>
