<script lang="ts">
  /**
   * The threat matrix: a matchup grid of OUR players (rows) × the selected
   * opposing team's players (columns). Each cell is a triple-toggle verdict —
   * So-so (yellow, the default) → Good (green) → Bad (red) → So-so — rendered as
   * a thumb. Presentational: it never mutates the doc in place; every edit builds
   * the next doc and calls `onChange`, so the App owns persistence + live-sync
   * (exactly like the team plan). Cells are keyed `<ourPlayerId>:<opponentId>`
   * so concurrent edits commute under the sync server.
   */
  import Modal from "../../../../_shared/Modal.svelte";
  import RosterReview from "../../../../_shared/RosterReview.svelte";
  import { DISPOSITION_COLORS } from "../dispositions";
  import { factionOptions, type TeamPlan } from "../coverage";
  import type { OpponentData, OpponentPlayer } from "../../../../_shared/opponents";
  import { ds } from "../dataset";
  import { cellKey, seedOurPlayers, type MatrixDoc } from "./matrix-doc";
  import { nextVerdict, VERDICT_HUE, type Verdict } from "./types";

  let {
    doc,
    plan,
    opponents = null,
    onChange,
  }: {
    doc: MatrixDoc;
    /** The current team plan — source for the "refresh team from plan" action. */
    plan: TeamPlan;
    /** Local full opponent data (with list text) for review; absent on a device
     *  that only joined the live matrix without loading the BCP JSON. */
    opponents?: OpponentData | null;
    onChange: (next: MatrixDoc) => void;
  } = $props();

  let selectedTeamId = $state<string | null>(null);
  let present = $state(false);
  let reviewPlayer = $state<OpponentPlayer | null>(null);
  let reviewOpen = $state(false);

  const teams = $derived(doc.teamOrder.map((id) => doc.teamsById[id]).filter(Boolean));
  const selectedTeam = $derived(
    teams.find((t) => t.id === selectedTeamId) ?? teams.find((t) => t.id !== doc.ourTeamId) ?? teams[0] ?? null,
  );

  const allFactions = factionOptions();
  const factionName = (id: string) => allFactions.find((f) => f.id === id)?.name ?? id;

  // ── verdict mutators (immutable; emit next doc) ──────────────────────────────
  function getVerdict(ourId: string, opponentId: string): Verdict | null {
    return doc.cellsById[cellKey(ourId, opponentId)] ?? null;
  }
  function cycleVerdict(ourId: string, opponentId: string): void {
    const cells = { ...doc.cellsById };
    const key = cellKey(ourId, opponentId);
    const next = nextVerdict(cells[key] ?? null);
    if (next === null) delete cells[key];
    else cells[key] = next;
    onChange({ ...doc, cellsById: cells });
  }

  function setOurTeam(id: string | null): void {
    onChange({ ...doc, ourTeamId: id });
  }

  /** Re-snapshot our rows from the live plan (the plan isn't carried over the
   *  matrix sync channel, so rows are a deliberate snapshot). */
  function refreshOurTeam(): void {
    onChange({ ...doc, ourPlayers: seedOurPlayers(plan), ourTeamName: plan.teamName || null });
  }

  function openReview(opponentId: string): void {
    const full = opponents?.teams.flatMap((t) => t.players).find((p) => p.id === opponentId);
    if (full) {
      reviewPlayer = full;
      reviewOpen = true;
    }
  }

  // ── cell appearance (so-so=yellow default, good=green, bad=red) ──────────────
  const VERDICT_LABEL: Record<"good" | "bad" | "soso", string> = {
    good: "good matchup",
    bad: "bad matchup",
    soso: "so-so (default)",
  };
  function cellGlyph(v: Verdict | null): string {
    return v === "bad" ? "👎" : "👍"; // soso reuses 👍, rotated sideways below
  }
  function cellStyle(v: Verdict | null): string {
    if (v === "good") return `background:${VERDICT_HUE.good};border-color:${VERDICT_HUE.good};`;
    if (v === "bad") return `background:${VERDICT_HUE.bad};border-color:${VERDICT_HUE.bad};`;
    return `background:color-mix(in srgb, ${VERDICT_HUE.soso} 18%, transparent);border-color:${VERDICT_HUE.soso};`;
  }
</script>

<div class="flex flex-col gap-3 {present ? 'text-lg' : ''}">
  {#if teams.length === 0}
    <p class="rounded border border-panel-border bg-panel-surface p-4 text-sm text-text-dim">
      No opponents loaded yet. Load a BCP event JSON to populate the teams, or join a live matrix link.
    </p>
  {:else}
    <!-- Team selector + controls -->
    <div class="flex flex-wrap items-center gap-2">
      <label class="sr-only" for="team-select">Opposing team</label>
      <select
        id="team-select"
        class="focus-ring rounded border border-panel-border bg-panel-surface px-2 py-1 {present ? 'text-lg' : 'text-sm'} text-text"
        bind:value={selectedTeamId}
      >
        {#each teams as t (t.id)}
          <option value={t.id}>{t.name}{t.id === doc.ourTeamId ? " (us)" : ""}</option>
        {/each}
      </select>

      <div class="ml-auto flex items-center gap-2 text-xs">
        <button
          type="button"
          class="focus-ring rounded border border-panel-border px-2 py-1 text-text-dim hover:text-text"
          onclick={refreshOurTeam}
          title="Re-snapshot our rows from the current team plan (Plan tab)"
        >
          refresh from plan
        </button>
        {#if selectedTeam}
          <button
            type="button"
            class="focus-ring rounded border border-panel-border px-2 py-1 text-text-dim hover:text-text"
            onclick={() => setOurTeam(doc.ourTeamId === selectedTeam.id ? null : selectedTeam.id)}
            title="Mark this loaded team as your own (excluded as an opponent)"
          >
            {doc.ourTeamId === selectedTeam.id ? "✓ our team" : "mark as us"}
          </button>
        {/if}
        <button
          type="button"
          class="focus-ring rounded border border-panel-border px-2 py-1 text-text-dim hover:text-text"
          onclick={() => (present = !present)}
          title="Large high-contrast layout for casting to a TV"
        >
          {present ? "exit present" : "present"}
        </button>
      </div>
    </div>

    <!-- The matchup grid -->
    {#if selectedTeam}
      {#if doc.ourPlayers.length === 0}
        <p class="rounded border border-panel-border bg-panel-surface p-4 text-sm text-text-dim">
          No players on our team yet. Build the roster on the <strong>Plan</strong> tab, then hit
          <strong>refresh from plan</strong> to load our players as rows.
        </p>
      {/if}
      <div class="overflow-x-auto rounded border border-panel-border">
        <table class="w-full border-collapse {present ? 'text-lg' : 'text-sm'}">
          <thead>
            <tr class="bg-panel-surface text-left">
              <th class="sticky left-0 z-10 bg-panel-surface px-3 py-2 font-heading text-xs font-bold uppercase tracking-wider text-text-muted">
                {doc.ourTeamName || "Our team"}
              </th>
              {#each selectedTeam.players as opp (opp.id)}
                <th class="px-3 py-2 text-center align-top font-normal">
                  <div class="flex flex-col items-center gap-0.5">
                    <span class="font-medium text-text">{opp.name}</span>
                    {#if opp.faction}<span class="text-xs text-text-dim">{opp.faction}</span>{/if}
                    {#if opp.disposition}
                      <span class="rounded px-1 text-xs" style="color:{DISPOSITION_COLORS[opp.disposition]}">●&nbsp;{opp.disposition.replace(/-/g, " ")}</span>
                    {/if}
                    <button
                      type="button"
                      class="focus-ring mt-0.5 rounded border border-panel-border px-1.5 py-0.5 text-xs text-text-dim hover:text-text disabled:cursor-default disabled:opacity-50"
                      onclick={() => openReview(opp.id)}
                      disabled={!opponents}
                      title={opponents ? "Expand list" : "Load the BCP JSON on this device to read lists"}
                    >📋 list</button>
                  </div>
                </th>
              {/each}
            </tr>
          </thead>
          <tbody>
            {#each doc.ourPlayers as our (our.id)}
              <tr class="border-t border-panel-border/60 hover:bg-panel-hover/40">
                <th scope="row" class="sticky left-0 z-10 bg-panel px-3 py-2 text-left font-normal">
                  <div class="font-medium text-text">{our.name || "—"}</div>
                  {#if our.factionIds.length > 0}
                    <div class="text-xs text-text-dim">{our.factionIds.map(factionName).join(", ")}</div>
                  {/if}
                </th>

                {#each selectedTeam.players as opp (opp.id)}
                  {@const v = getVerdict(our.id, opp.id)}
                  <td class="px-2 py-1.5 text-center align-middle">
                    <button
                      type="button"
                      class="focus-ring rounded border leading-none {present ? 'px-3 py-1.5 text-2xl' : 'px-2 py-1 text-lg'}"
                      style={cellStyle(v)}
                      onclick={() => cycleVerdict(our.id, opp.id)}
                      aria-label={`${our.name || "our player"} vs ${opp.name}: ${VERDICT_LABEL[v ?? "soso"]}`}
                    >
                      <span class="inline-block" style={v === null ? "transform:rotate(90deg);opacity:0.75;" : ""}>{cellGlyph(v)}</span>
                    </button>
                  </td>
                {/each}
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  {/if}
</div>

<Modal bind:open={reviewOpen} title="List review">
  {#if reviewPlayer}
    <RosterReview player={reviewPlayer} dataset={ds} large={present} />
  {/if}
</Modal>
