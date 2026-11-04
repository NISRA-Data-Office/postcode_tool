<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { domains } from '#lib/config.ts';
	import AreaTitle from './AreaTitle.svelte';
	import DomainSelect from './DomainSelect.svelte';
	import LgdSelect from './LgdSelect.svelte';
	import LgdSummary from './LgdSummary.svelte';
	import ButtonRow from './ButtonRow.svelte';
	import DomainDescription from './DomainDescription.svelte';
	import ScaleMap from './ScaleMap.svelte';
	import RankChart from './RankChart.svelte';
	import RankComparison from './RankComparison.svelte';
	import SelectedArea from './SelectedArea.svelte';
	import areaData from '#lib/assets/N92000002.json';
	import RankTable from './RankTable.svelte';

	let {
		name,
		code,
		childrenType,
		numChildren,
		ranks,
		bounds
	}: {
		name: string;
		code: string;
		childrenType: { name: string; count: number };
		numChildren: number;
		ranks: { [key: string]: { name: string; ranks: { [key: string]: number } } };
		bounds: [number, number, number, number];
	} = $props();

	let domain = $state('mdm');
	let domainIdx = $derived(domains.findIndex((value) => value.code === domain));
	let selected: string | undefined = $state();
	let hoveredArea: string | undefined = $state();

	function handleLgdSelect(event) {
		const code = event.target.value;
		if (code === page.params.code) return;
		selected = undefined;
		goto(resolve('/areas/[code]', { code: code }), { reset: false });
	}

	let domainRanks = $derived(
		Object.keys(ranks).map((key) => {
			return {
				code: key,
				name: ranks[key].name,
				rank: ranks[key].ranks[domain]
			};
		})
	);

	function handleScaleMapClick() {
		let areaType: string = hoveredArea && hoveredArea.slice(0, 3) == 'N09' ? 'lgd' : 'area';
		if (hoveredArea && areaType === 'lgd') {
			goto(resolve('/areas/[code]', { code: hoveredArea }), { reset: false });
		} else {
			selected = hoveredArea;
		}
	}

	let hoveredRank: number | undefined = $derived(
		hoveredArea ? areaData.data.ranks[hoveredArea]?.ranks[domain] : undefined
	);

	let hoveredName: string | undefined = $derived(
		hoveredArea ? areaData.data.ranks[hoveredArea]?.name : undefined
	);

	let selectedName: string | undefined = $derived(
		selected ? areaData.data.ranks[selected]?.name : undefined
	);

	let selectedRank: number | undefined = $derived(
		selected ? areaData.data.ranks[selected]?.ranks[domain] : undefined
	);
</script>

<div class="row mb-4">
	<div class="col-12 col-xl-8">
		<AreaTitle type="lgd" {name} />
		<p class="h4 my-3">
			Currently viewing: <span class="deprivation-type text-purple">{domains[domainIdx].label}</span
			>.
		</p>
		<DomainDescription {domain} />
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
</div>
<SelectedArea name={selectedName} bind:code={selected} />
<div class="row">
	<p id="map-explanation">
		Using the map or table, click on a neighbourhood to focus on that area. Click a neighbouring
		council on the map to explore deprivation in that area.
	</p>
	<div id="map-col" class="col-12 col-xl-7 mb-3">
		<div id="map-capture">
			<div id="scale-map" class="map scale-map border border-secondary" tabindex="-1">
				<ScaleMap
					{domain}
					type="lgd"
					area={code}
					{name}
					{bounds}
					bind:hoveredArea
					bind:selected
					handleClick={handleScaleMapClick}
				/>
			</div>
			<div class="p-3 border border-secondary border-top-0">
				<RankComparison
					name={selectedName}
					rank={selectedRank}
					nameCompare={hoveredName}
					rankCompare={hoveredRank}
					{domain}
					maxRank={childrenType.count}
				/>
				<div id="lgd-scale-chart">
					<RankChart
						rank={selectedRank}
						rankCompare={hoveredRank}
						maxRank={childrenType.count}
						labels="below"
					/>
				</div>
				<div class="text-center py-1">Areas grouped into deprivation deciles (based on rank)</div>
				<button
					class="btn col bg-purple rounded-2 border-secondary"
					id="download-btn"
					aria-label="Download dropdown">Download</button
				>
			</div>
		</div>
	</div>
	<RankTable ranks={domainRanks} bind:selected />
</div>
<LgdSummary {name} {domain} {numChildren} {domainRanks} />
