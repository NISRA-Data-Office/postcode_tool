<script lang="ts">
	import { domainLabel, compareRanks } from '#lib/util/textHelpers.ts';
	let {
		name,
		rank,
		nameCompare,
		rankCompare,
		domain,
		maxRank
	}: {
		name?: string;
		rank?: number;
		nameCompare?: string;
		rankCompare?: number;
		domain: string;
		maxRank: number;
	} = $props();
</script>

<div id="comparison-text" class="text-center min-h-4">
	{#if name && rank}
		{#if nameCompare && rankCompare && nameCompare != name}
			<p class="mb-0">
				<strong class="text-lilac">{nameCompare}</strong>
				{compareRanks(rank, rankCompare, maxRank)} <strong class="text-red">{name}</strong>.
			</p>
		{:else}
			<p class="mb-0">
				<strong class="text-red">{name}</strong> is ranked {rank} out of {maxRank} for
				<b>{domainLabel(domain)}</b>.
			</p>
			<p class="mb-0">Hover over an area to compare deprivation.</p>
		{/if}
	{/if}
</div>
