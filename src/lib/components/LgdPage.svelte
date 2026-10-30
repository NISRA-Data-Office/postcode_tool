<script lang="ts">
	import { goto } from '$app/navigation';
	import { asset, resolve } from '$app/paths';
	import { page } from '$app/state';
	import { domains } from '#lib/config.ts';
	import AreaTitle from './AreaTitle.svelte';
	import DomainSelect from './DomainSelect.svelte';
	import LgdSelect from './LgdSelect.svelte';
	import LgdSummary from './LgdSummary.svelte';
	import ButtonRow from './ButtonRow.svelte';

	let {
		name,
		childrenType,
		numChildren,
		ranks
	}: {
		name: string;
		code: string;
		childrenType: { name: string; count: number };
		numChildren: number;
		ranks: { [key: string]: { name: string; ranks: { [key: string]: number } } };
	} = $props();

	let domain = $state('mdm');
	let domainIdx = $derived(domains.findIndex((value) => value.code === domain));

	function handleLgdSelect(event) {
		const code = event.target.value;
		if (code === page.params.code) return;
		goto(resolve(`areas/${code}`));
	}

    let domainRanks = $derived(Object.keys(ranks).map((key) => {
        return {
            code: key,
            name: ranks[key].name,
            rank: ranks[key].ranks[domain]
        };
    }));
</script>

<div class="row mb-4">
	<div class="col-12 col-xl-8">
		<AreaTitle type="lgd" {name} />
		<p class="h4 my-3">
			Currently viewing: <span class="deprivation-type text-purple">{domains[domainIdx].label}</span
			>.
		</p>
		<p id="type-description">{@html domains[domainIdx].description}</p>
		<p id="sdz-description">
			Northern Ireland is made up of {childrenType.count}
			{childrenType.name}, referred to here as 'neighbourhoods', which have an average population of
			2,240 people.
		</p>
		<p>
			The neighbourhood ranked 1 is the most deprived and the neighbourhood ranked {childrenType.count}
			is the least deprived.
		</p>
		{#if numChildren != childrenType.count}
			<p>{name} is made up of {numChildren} neighbourhoods.</p>
		{/if}
	</div>
	<div class="col-12 col-xl-4">
		<ButtonRow />
		<div id="lgd-select-group">
			<p class="mt-3 mb-1">Select another area:</p>
			<LgdSelect selected={page.params.code} handleSelect={handleLgdSelect} />
		</div>
		<p class="mt-3 mb-1">Select a type of deprivation:</p>
		<DomainSelect bind:selected={domain} />
	</div>

    <LgdSummary {name} {domain} {numChildren} {domainRanks} />	
</div>
