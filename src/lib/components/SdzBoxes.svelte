<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import NavMap from './NavMap.svelte';

	let {
		name,
		parentName,
		parentCode,
		mdmRank,
		count,
		selected,
		bounds
	}: {
		name: string;
		parentName?: string;
		parentCode?: string;
		mdmRank: number;
		count: number;
		selected: string;
		bounds: [number, number, number, number];
	} = $props();

	function handleClick(ev) {
		let areaCode: string = ev.features?.[0].id;
		if (areaCode) {
			goto(resolve('/areas/[code]', { code: areaCode }), { reset: false });
		}
	}
</script>

<div class="row">
	<div class="col-12 col-xl-4 mb-3">
		<div class="bg-grey border border-secondary pt-2 px-3 h-100 d-flex flex-column">
			<div>
				<h3 class="fw-bold fs-3 text-center">Multiple Deprivation Measure</h3>
			</div>

			<div class="d-flex flex-column justify-content-center align-items-center mb-3">
				<h4 class="mb-2 mt-4">Deprivation Rank:</h4>
				<p class="overall-rank display-1 mb-1 fw-bold mt-0 text-blue">{mdmRank}</p>
				<p class="fw-bold fs-3 text-blue">out of <span class="place-count">{count}</span></p>
			</div>

			<div class="mt-auto">
				<p class="text-center mt-3 mb-0">Rank 1 is the most deprived</p>
				<p class="text-center mb-2">
					<span class="place-count">{count}</span> is the least deprived.
				</p>
			</div>
		</div>
	</div>

	<div class="col-12 col-xl-4 mb-3">
		<div class="bg-grey border border-secondary h-100 px-3 pt-2 d-flex flex-column">
			<h3 class="fw-bold fs-3 text-break">About <span class="place-name">{name}</span></h3>
			<div id="geo-description" class="fs-5">
				<p>
					<span class="text-purple fw-bold">{name}</span> is a Super Data Zone{#if parentCode && parentName},
						in
						<a
							class="text-blue"
							href={resolve(`areas/${parentCode}`)}
							title="View deprivation profile for {parentName}">{parentName}</a
						>
					{/if}.
				</p>
				<p>
					Super Data Zones - referred to here as 'neighbourhoods' - have an average population of
					2,240 people.
				</p>
			</div>
		</div>
	</div>

	<div class="col-12 col-xl-4 mb-3 d-flex flex-column">
		<NavMap
			boundaryFile="public/map/SDZ2021.geo.json"
			selectedArea={selected}
			{bounds}
			{handleClick}
		/>
	</div>
</div>

<div class="row justify-content-end">
	<div class="col-12 col-xl-4">
		<p class="mb-0">
			Click on a neighbouring area using the map above to view its deprivation profile.
		</p>
	</div>
</div>
