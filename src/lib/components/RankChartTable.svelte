<script lang="ts">
	import { asset } from '$app/paths';
	import RankChart from './RankChart.svelte';
	import { domains } from '#lib/config.ts';

	let {
		ranks,
		maxRank
	}: {
		ranks: { [key: string]: number };
		maxRank: number;
	} = $props();

	let expanded = $state(domains.map(() => false));

	function toggleDetails(index: number) {
		expanded[index] = !expanded[index];
	}
</script>

{#each domains as { code, label, description }, index (code)}
	<div class={index == 0 ? 'row border-bottom border-dark mb-3' : 'row'}>
		<div class="col-12 col-xl-4 text-xl-end d-flex flex-column justify-content-center">
			<button
				type="button"
				onclick={() => toggleDetails(index)}
				class="mb-0 text-blue cursor-pointer fs-5"
				>{label} <img src={asset('assets/img/logo/i-button.svg')} width="18" tabindex="0" />
			</button>
			<p>Rank {ranks[code]}</p>
		</div>
		<div class="col-12 col-xl-8">
			{#if index === 0}
				<RankChart rank={ranks[code]} {maxRank} labels="above" />
			{:else if index === domains.length}
				<RankChart rank={ranks[code]} {maxRank} labels="above" />
			{:else}
				<RankChart rank={ranks[code]} {maxRank} />
			{/if}
		</div>
		<div class="i-text-panel is-open border border-secondary" hidden={!expanded[index]}>
			<div class="d-flex flex-row align-items-start p-2">
				<img src={asset('assets/img/logo/i-button.svg')} width="18" class="me-2 mt-1" />
				<div class="mb-0">{@html description}</div>
			</div>
		</div>
	</div>
{/each}

<style>
	button {
		all: unset;
	}
</style>
