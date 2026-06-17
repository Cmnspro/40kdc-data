<script lang="ts">
import {
	loadoutBounds,
	clampCount,
	itemName,
	loadoutViolations,
	type BuilderUnit,
} from '$lib/data/builder';

interface Props {
	unit: BuilderUnit;
	/** Army faction, so a shared chassis resolves the right copy's wargear. */
	armyFaction?: string;
	onchange: (loadout: Map<string, number>) => void;
}
let { unit, armyFaction, onchange }: Props = $props();

// Bounds drive which ids are adjustable and their valid ranges.
const bounds = $derived(loadoutBounds(unit, armyFaction));
// Show every id that has a bound (base + optional), in stable id order.
const rows = $derived(
	[...bounds.entries()]
		.filter(([, b]) => b.max > 0)
		.sort((a, b) => a[0].localeCompare(b[0]))
		.map(([id, b]) => ({ id, name: itemName(id), min: b.min, max: b.max })),
);
const violations = $derived(new Set(loadoutViolations(unit, armyFaction).map((v) => v.id)));

function setCount(id: string, requested: number) {
	const next = new Map(unit.loadout);
	next.set(id, clampCount(bounds, id, requested));
	onchange(next);
}
</script>

{#if rows.length === 0}
	<p class="text-text-muted px-1 py-0.5 text-sm italic">Fixed loadout — no options.</p>
{:else}
	<div class="flex flex-col gap-1">
		{#each rows as row (row.id)}
			{@const count = unit.loadout.get(row.id) ?? 0}
			{@const fixed = row.min === row.max}
			<div
				class="flex items-center gap-1.5 text-sm {violations.has(row.id)
					? 'text-amber-300'
					: 'text-text'}"
			>
				<span class="flex-1 truncate" title={row.name}>{row.name}</span>
				{#if fixed}
					<span class="text-text-muted tabular-nums">×{count}</span>
				{:else}
					<button
						class="btn btn-icon"
						disabled={count <= row.min}
						onclick={() => setCount(row.id, count - 1)}
						aria-label="decrease {row.name}">−</button
					>
					<span class="w-6 text-center tabular-nums">{count}</span>
					<button
						class="btn btn-icon"
						disabled={count >= row.max}
						onclick={() => setCount(row.id, count + 1)}
						aria-label="increase {row.name}">+</button
					>
					<span class="text-text-muted w-8 text-right">/{row.max}</span>
				{/if}
			</div>
		{/each}
	</div>
{/if}
