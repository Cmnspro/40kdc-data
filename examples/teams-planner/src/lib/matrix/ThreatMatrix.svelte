<script lang="ts">
  /**
   * The threat matrix: per opposing team, a table of THEIR players (rows) ×
   * editable threat axes (columns). Presentational — it never mutates the doc
   * in place; every edit builds the next doc and calls `onChange`, so the App
   * owns persistence + live-sync (exactly like the team plan). Cells are keyed
   * `<playerId>:<axisId>` so concurrent edits commute under the sync server.
   */
  import Modal from "../../../../_shared/Modal.svelte";
  import RosterReview from "../RosterReview.svelte";
  import { DISPOSITION_COLORS } from "../dispositions";
  import type { OpponentData, OpponentPlayer } from "../opponents";
  import {
    cellKey,
    type MatrixDoc,
  } from "./matrix-doc";
  import {
    RATING_MAX,
    TIER_VALUES,
    type AxisKind,
    type CellValue,
    type ThreatAxis,
  } from "./types";

  let {
    doc,
    opponents = null,
    onChange,
  }: {
    doc: MatrixDoc;
    /** Local full opponent data (with list text) for review; absent on a device
     *  that only joined the live matrix without loading the BCP JSON. */
    opponents?: OpponentData | null;
    onChange: (next: MatrixDoc) => void;
  } = $props();

  let selectedTeamId = $state<string | null>(null);
  let present = $state(false);
  let editingAxes = $state(false);
  let reviewPlayer = $state<OpponentPlayer | null>(null);
  let reviewOpen = $state(false);

  const teams = $derived(doc.teamOrder.map((id) => doc.teamsById[id]).filter(Boolean));
  const axes = $derived(doc.axisOrder.map((id) => doc.axesById[id]).filter(Boolean));
  const selectedTeam = $derived(
    teams.find((t) => t.id === selectedTeamId) ?? teams.find((t) => t.id !== doc.ourTeamId) ?? teams[0] ?? null,
  );

  // ── cell + axis mutators (immutable; emit next doc) ──────────────────────────
  function setCell(playerId: string, axisId: string, value: CellValue): void {
    const cells = { ...doc.cellsById };
    const key = cellKey(playerId, axisId);
    if (value === null || value === "" ) delete cells[key];
    else cells[key] = value;
    onChange({ ...doc, cellsById: cells });
  }
  function getCell(playerId: string, axisId: string): CellValue {
    return doc.cellsById[cellKey(playerId, axisId)] ?? null;
  }

  function setOurTeam(id: string | null): void {
    onChange({ ...doc, ourTeamId: id });
  }

  function slugify(label: string): string {
    const base = label.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "axis";
    let id = base;
    let n = 2;
    while (doc.axesById[id]) id = `${base}-${n++}`;
    return id;
  }
  function addAxis(): void {
    const id = slugify("new");
    onChange({
      ...doc,
      axesById: { ...doc.axesById, [id]: { id, label: "New axis", kind: "rating" } },
      axisOrder: [...doc.axisOrder, id],
    });
  }
  function patchAxis(id: string, patch: Partial<ThreatAxis>): void {
    onChange({ ...doc, axesById: { ...doc.axesById, [id]: { ...doc.axesById[id], ...patch } } });
  }
  function removeAxis(id: string): void {
    const axesById = { ...doc.axesById };
    delete axesById[id];
    const cellsById: Record<string, CellValue> = {};
    for (const [k, v] of Object.entries(doc.cellsById)) if (!k.endsWith(`:${id}`)) cellsById[k] = v;
    onChange({ ...doc, axesById, axisOrder: doc.axisOrder.filter((a) => a !== id), cellsById });
  }
  function moveAxis(id: string, dir: -1 | 1): void {
    const order = [...doc.axisOrder];
    const i = order.indexOf(id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= order.length) return;
    [order[i], order[j]] = [order[j], order[i]];
    onChange({ ...doc, axisOrder: order });
  }

  function openReview(playerId: string): void {
    const full = opponents?.teams.flatMap((t) => t.players).find((p) => p.id === playerId);
    if (full) {
      reviewPlayer = full;
      reviewOpen = true;
    }
  }

  // ── cell heat (threat reads hot=red) ─────────────────────────────────────────
  function ratingStyle(n: number): string {
    if (n <= 0) return "";
    const hue = ["#22c55e", "#f59e0b", "#ef4444"][Math.min(n, RATING_MAX) - 1];
    return `color:${hue};`;
  }
  const TIER_HUE: Record<string, string> = { low: "#22c55e", med: "#f59e0b", high: "#ef4444" };
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
        {#if selectedTeam}
          <button
            type="button"
            class="focus-ring rounded border border-panel-border px-2 py-1 text-text-dim hover:text-text"
            onclick={() => setOurTeam(doc.ourTeamId === selectedTeam.id ? null : selectedTeam.id)}
            title="Mark this as your own team (excluded from scoring)"
          >
            {doc.ourTeamId === selectedTeam.id ? "✓ our team" : "mark as us"}
          </button>
        {/if}
        <button
          type="button"
          class="focus-ring rounded border border-panel-border px-2 py-1 text-text-dim hover:text-text"
          onclick={() => (editingAxes = !editingAxes)}
        >
          {editingAxes ? "done" : "edit columns"}
        </button>
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

    <!-- Axis editor -->
    {#if editingAxes}
      <div class="flex flex-col gap-2 rounded border border-panel-border bg-panel-surface p-3">
        {#each axes as axis (axis.id)}
          <div class="flex flex-wrap items-center gap-2 text-sm">
            <input
              class="focus-ring w-40 rounded border border-panel-border bg-bg px-2 py-1 text-text"
              value={axis.label}
              oninput={(e) => patchAxis(axis.id, { label: e.currentTarget.value })}
            />
            <select
              class="focus-ring rounded border border-panel-border bg-bg px-2 py-1 text-text-muted"
              value={axis.kind}
              onchange={(e) => patchAxis(axis.id, { kind: e.currentTarget.value as AxisKind })}
            >
              <option value="rating">rating (★)</option>
              <option value="tier">tier (low/med/high)</option>
              <option value="flag">flag (yes/no)</option>
              <option value="text">text (note)</option>
            </select>
            <button type="button" class="focus-ring px-1 text-text-dim hover:text-text" onclick={() => moveAxis(axis.id, -1)} aria-label="move left">←</button>
            <button type="button" class="focus-ring px-1 text-text-dim hover:text-text" onclick={() => moveAxis(axis.id, 1)} aria-label="move right">→</button>
            <button type="button" class="focus-ring px-1 text-danger hover:opacity-80" onclick={() => removeAxis(axis.id)} aria-label="remove">✕</button>
          </div>
        {/each}
        <button type="button" class="focus-ring self-start rounded border border-panel-border px-2 py-1 text-sm text-accent hover:bg-panel-hover" onclick={addAxis}>+ add column</button>
      </div>
    {/if}

    <!-- The matrix -->
    {#if selectedTeam}
      <div class="overflow-x-auto rounded border border-panel-border">
        <table class="w-full border-collapse {present ? 'text-lg' : 'text-sm'}">
          <thead>
            <tr class="bg-panel-surface text-left">
              <th class="sticky left-0 z-10 bg-panel-surface px-3 py-2 font-heading text-xs font-bold uppercase tracking-wider text-text-muted">
                {selectedTeam.name}
              </th>
              {#each axes as axis (axis.id)}
                <th class="px-3 py-2 text-center font-heading text-xs font-bold uppercase tracking-wider text-text-muted">{axis.label}</th>
              {/each}
            </tr>
          </thead>
          <tbody>
            {#each selectedTeam.players as p (p.id)}
              <tr class="border-t border-panel-border/60 hover:bg-panel-hover/40">
                <th scope="row" class="sticky left-0 z-10 bg-panel px-3 py-2 text-left font-normal">
                  <button
                    type="button"
                    class="focus-ring text-left font-medium text-text hover:text-accent disabled:cursor-default disabled:hover:text-text"
                    onclick={() => openReview(p.id)}
                    disabled={!opponents}
                    title={opponents ? "Review list" : "Load the BCP JSON on this device to review lists"}
                  >
                    {p.name}
                  </button>
                  <div class="flex flex-wrap items-center gap-1 text-xs text-text-dim">
                    {#if p.faction}<span>{p.faction}</span>{/if}
                    {#if p.disposition}
                      <span class="rounded px-1" style="color:{DISPOSITION_COLORS[p.disposition]}">●&nbsp;{p.disposition.replace(/-/g, " ")}</span>
                    {/if}
                  </div>
                </th>

                {#each axes as axis (axis.id)}
                  {@const val = getCell(p.id, axis.id)}
                  <td class="px-2 py-1.5 text-center align-middle">
                    {#if axis.kind === "rating"}
                      <div class="flex justify-center gap-0.5" role="group" aria-label={axis.label}>
                        {#each Array(RATING_MAX) as _, i}
                          <button
                            type="button"
                            class="focus-ring leading-none {present ? 'text-2xl' : 'text-lg'}"
                            style={typeof val === "number" && val > i ? ratingStyle(val) : "color:var(--color-border-strong);"}
                            onclick={() => setCell(p.id, axis.id, val === i + 1 ? null : i + 1)}
                            aria-label={`${i + 1} of ${RATING_MAX}`}
                          >★</button>
                        {/each}
                      </div>
                    {:else if axis.kind === "tier"}
                      <div class="flex justify-center gap-1">
                        {#each TIER_VALUES as t}
                          <button
                            type="button"
                            class="focus-ring rounded px-1.5 py-0.5 text-xs uppercase"
                            style={val === t ? `background:${TIER_HUE[t]};color:#0b0b0d;` : "color:var(--color-text-dim);border:1px solid var(--color-panel-border);"}
                            onclick={() => setCell(p.id, axis.id, val === t ? null : t)}
                          >{t}</button>
                        {/each}
                      </div>
                    {:else if axis.kind === "flag"}
                      <button
                        type="button"
                        class="focus-ring rounded px-2 py-0.5 text-sm"
                        style={val === true ? "background:var(--color-danger);color:#0b0b0d;" : "color:var(--color-text-dim);border:1px solid var(--color-panel-border);"}
                        onclick={() => setCell(p.id, axis.id, val === true ? null : true)}
                        aria-pressed={val === true}
                      >{val === true ? "yes" : "—"}</button>
                    {:else}
                      <input
                        class="focus-ring w-full min-w-[8rem] rounded border border-panel-border bg-bg px-2 py-1 text-left text-sm text-text"
                        value={typeof val === "string" ? val : ""}
                        placeholder="…"
                        onchange={(e) => setCell(p.id, axis.id, e.currentTarget.value)}
                      />
                    {/if}
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
    <RosterReview player={reviewPlayer} large={present} />
  {/if}
</Modal>
