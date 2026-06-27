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
  import type { ForceDispositionId } from "@alpaca-software/40kdc-data";
  import Modal from "../../../../_shared/Modal.svelte";
  import RosterReview from "../../../../_shared/RosterReview.svelte";
  import { DISPOSITION_LABELS, DISPOSITIONS } from "../../../../_shared/matchup-grid.js";
  import { DISPOSITION_COLORS } from "../dispositions";
  import { factionOptions, type TeamPlan } from "../coverage";
  import type { OpponentData, OpponentPlayer } from "../../../../_shared/opponents";
  import { ds } from "../dataset";
  import { cellKey, effectiveDisposition, seedOurPlayers, type MatrixDoc } from "./matrix-doc";
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

  // ── live triage (per-device view state, not synced) ──────────────────────────
  // Each row and column NAME is a TRIPLE TOGGLE: active → greyed (set aside, stays
  // in place) → picked (greyed AND sorted out of the way — rows to the bottom,
  // opponent columns to the right) → active. Separately, 🎯 *targets* one opponent
  // column as the matchup under discussion (its own button, radio). Ephemeral on
  // purpose: none of it rides the synced doc, and it resets on reload.
  type TriState = "grey" | "picked"; // absent = active
  let rowStatus = $state<Record<string, TriState>>({}); // ourPlayerId → state
  let colStatus = $state<Record<string, TriState>>({}); // opponentId → state
  let targetOppId = $state<string | null>(null);

  const isPicked = (s: TriState | undefined) => s === "picked";
  const isDimmed = (s: TriState | undefined) => s === "grey" || s === "picked";
  const hasTriage = $derived(
    Object.keys(rowStatus).length > 0 || Object.keys(colStatus).length > 0 || targetOppId !== null,
  );

  // active → grey → picked → active. Reassign a fresh map so $state tracks it.
  function cycle(map: Record<string, TriState>, id: string): Record<string, TriState> {
    const next = { ...map };
    if (!next[id]) next[id] = "grey";
    else if (next[id] === "grey") next[id] = "picked";
    else delete next[id];
    return next;
  }
  const cycleRow = (ourId: string): void => void (rowStatus = cycle(rowStatus, ourId));
  const cycleCol = (oppId: string): void => void (colStatus = cycle(colStatus, oppId));

  /** Radio-toggle the opponent we're focused on (clear by re-clicking). */
  function toggleTarget(oppId: string): void {
    targetOppId = targetOppId === oppId ? null : oppId;
  }

  const STATE_TITLE: Record<"active" | "grey" | "picked", string> = {
    active: "active — click to grey out",
    grey: "greyed (set aside) — click to pick & sort away",
    picked: "picked (sorted away) — click to restore",
  };
  const triageTitle = (s: TriState | undefined): string => STATE_TITLE[s ?? "active"];

  const teams = $derived(doc.teamOrder.map((id) => doc.teamsById[id]).filter(Boolean));
  const selectedTeam = $derived(
    teams.find((t) => t.id === selectedTeamId) ?? teams.find((t) => t.id !== doc.ourTeamId) ?? teams[0] ?? null,
  );
  /** Our player chosen as the lead-off defender into the *selected* opponent. */
  const leadOffId = $derived(selectedTeam ? (doc.leadOffByTeam[selectedTeam.id] ?? null) : null);

  const allFactions = factionOptions();
  const factionName = (id: string) => allFactions.find((f) => f.id === id)?.name ?? id;

  // Only *picked* items sort out of the way (greyed ones stay in place). Array.sort
  // is stable, so active + greyed keep their loaded order and the top-left stays
  // the live, undecided block. (`Number(false)=0 < Number(true)=1`.)
  const sortedRows = $derived(
    [...doc.ourPlayers].sort((a, b) => Number(isPicked(rowStatus[a.id])) - Number(isPicked(rowStatus[b.id]))),
  );
  const sortedCols = $derived(
    selectedTeam
      ? [...selectedTeam.players].sort((a, b) => Number(isPicked(colStatus[a.id])) - Number(isPicked(colStatus[b.id])))
      : [],
  );

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

  /** Hand-enter (or clear, with "") an opponent's Force Disposition. Stored as an
   *  id-keyed override; clearing falls the cell back to the parsed default. */
  function setDisposition(opponentId: string, value: string): void {
    const next = { ...doc.dispositionsById };
    if (value === "") delete next[opponentId];
    else next[opponentId] = value as ForceDispositionId;
    onChange({ ...doc, dispositionsById: next });
  }

  /** Mark (or, if re-clicked, clear) our lead-off defender vs the selected team.
   *  Radio-like: at most one lead-off per opponent team. */
  function setLeadOff(ourId: string): void {
    if (!selectedTeam) return;
    const next = { ...doc.leadOffByTeam };
    if (next[selectedTeam.id] === ourId) delete next[selectedTeam.id];
    else next[selectedTeam.id] = ourId;
    onChange({ ...doc, leadOffByTeam: next });
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
        {#if hasTriage}
          <button
            type="button"
            class="focus-ring rounded border border-panel-border px-2 py-1 text-text-dim hover:text-text"
            onclick={() => {
              rowStatus = {};
              colStatus = {};
              targetOppId = null;
            }}
            title="Restore all greyed/picked rows and columns and clear the target"
          >
            reset
          </button>
        {/if}
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
        <table class="w-full table-fixed border-collapse {present ? 'text-lg' : 'text-sm'}">
          <colgroup>
            <col style="width: {present ? '13rem' : '10rem'}" />
            {#each sortedCols as opp (opp.id)}<col />{/each}
          </colgroup>
          <thead>
            <tr class="bg-panel-surface text-left">
              <th class="sticky left-0 z-10 bg-panel-surface px-3 py-2 font-heading text-xs font-bold uppercase tracking-wider text-text-muted">
                {doc.ourTeamName || "Our team"}
              </th>
              {#each sortedCols as opp (opp.id)}
                {@const eff = effectiveDisposition(doc, opp)}
                {@const status = colStatus[opp.id]}
                {@const targeted = targetOppId === opp.id}
                <th
                  class="px-2 py-2 text-center align-top font-normal {isDimmed(status) ? 'opacity-30 grayscale' : ''} {targeted ? 'bg-accent-dim/40 ring-2 ring-inset ring-accent' : ''}"
                >
                  <div class="flex flex-col items-center gap-0.5">
                    <div class="flex max-w-full items-center gap-0.5">
                      <button
                        type="button"
                        class="focus-ring shrink-0 rounded text-xs leading-none {targeted ? 'opacity-100' : 'opacity-40 hover:opacity-90'}"
                        aria-pressed={targeted}
                        onclick={() => toggleTarget(opp.id)}
                        title={targeted ? `${opp.name} is the target — click to clear` : `Target ${opp.name}`}
                        aria-label={targeted ? `${opp.name} is the target; click to clear` : `Target ${opp.name}`}
                      >🎯</button>
                      <button
                        type="button"
                        class="focus-ring max-w-full cursor-pointer truncate rounded px-1 font-medium text-text"
                        onclick={() => cycleCol(opp.id)}
                        title={`${opp.name}: ${triageTitle(status)}`}
                        aria-label={`${opp.name}: ${triageTitle(status)}`}
                      >{opp.name}</button>
                    </div>
                    {#if opp.faction}<span class="truncate text-xs text-text-dim">{opp.faction}</span>{/if}
                    {#if eff}
                      <span class="rounded px-1 text-xs" style="color:{DISPOSITION_COLORS[eff]}">●&nbsp;{eff.replace(/-/g, " ")}</span>
                    {/if}
                    <select
                      class="focus-ring mt-0.5 max-w-[8rem] rounded border border-panel-border bg-panel px-1 py-0.5 text-xs text-text-muted"
                      value={eff ?? ""}
                      aria-label="Force Disposition for {opp.name}"
                      title="Record this opponent's Force Disposition"
                      onchange={(e) => setDisposition(opp.id, (e.currentTarget as HTMLSelectElement).value)}
                    >
                      <option value="">— disposition —</option>
                      {#each DISPOSITIONS as d (d)}
                        <option value={d}>{DISPOSITION_LABELS[d]}</option>
                      {/each}
                    </select>
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
            {#each sortedRows as our (our.id)}
              {@const isLeadOff = our.id === leadOffId}
              {@const status = rowStatus[our.id]}
              <tr class="border-t border-panel-border/60 hover:bg-panel-hover/40 {isLeadOff ? 'bg-accent-dim/20' : ''} {isDimmed(status) ? 'opacity-30 grayscale' : ''}">
                <th
                  scope="row"
                  class="sticky left-0 z-10 px-3 py-2 text-left font-normal {isLeadOff ? 'border-l-4 border-accent bg-accent-dim/40' : 'bg-panel'}"
                >
                  <div class="flex items-start gap-1.5">
                    <button
                      type="button"
                      class="focus-ring mt-0.5 shrink-0 rounded leading-none {present ? 'text-xl' : 'text-base'} {isLeadOff ? 'opacity-100' : 'opacity-40 hover:opacity-90'}"
                      aria-pressed={isLeadOff}
                      onclick={() => setLeadOff(our.id)}
                      title={isLeadOff
                        ? `${our.name || "our player"} is our lead-off defender vs ${selectedTeam.name} — click to clear`
                        : `Set ${our.name || "our player"} as lead-off defender vs ${selectedTeam.name}`}
                      aria-label={isLeadOff
                        ? `${our.name || "our player"} is the lead-off defender vs ${selectedTeam.name}; click to clear`
                        : `Set ${our.name || "our player"} as lead-off defender vs ${selectedTeam.name}`}
                    >🛡</button>
                    <div>
                      <div class="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          class="focus-ring cursor-pointer truncate rounded font-medium text-text"
                          onclick={() => cycleRow(our.id)}
                          title={`${our.name || "this player"}: ${triageTitle(status)}`}
                          aria-label={`${our.name || "this player"}: ${triageTitle(status)}`}
                        >{our.name || "—"}</button>
                        {#if status === "picked"}
                          <span
                            class="rounded bg-panel-border px-1 py-0.5 font-medium uppercase leading-none tracking-wide text-text-dim {present ? 'text-xs' : 'text-[0.6rem]'}"
                          >picked</span>
                        {/if}
                        {#if isLeadOff}
                          <span
                            class="rounded bg-accent px-1 py-0.5 font-bold uppercase leading-none tracking-wider text-white {present ? 'text-xs' : 'text-[0.6rem]'}"
                          >Lead off</span>
                        {/if}
                      </div>
                      {#if our.factionIds.length > 0}
                        <div class="text-xs text-text-dim">{our.factionIds.map(factionName).join(", ")}</div>
                      {/if}
                    </div>
                  </div>
                </th>

                {#each sortedCols as opp (opp.id)}
                  {@const v = getVerdict(our.id, opp.id)}
                  <td
                    class="px-1.5 py-1 text-center align-middle {isDimmed(colStatus[opp.id]) ? 'opacity-30 grayscale' : ''} {targetOppId === opp.id && !isDimmed(status) ? 'bg-accent-dim/20' : ''}"
                  >
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
