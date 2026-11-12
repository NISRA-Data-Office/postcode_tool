<script lang="ts">
	import { onMount } from 'svelte';
	import { afterNavigate, goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import NavMap from './NavMap.svelte';
	import { cleanPostcode, isPostcode } from '#lib/util/postcodeHelpers.ts';

	let {
		name,
		parentName,
		parentCode,
		mdmRank,
		count,
		urbanRural,
		selected,
		bounds
	}: {
		name: string;
		parentName?: string;
		parentCode?: string;
		mdmRank: number;
		count: number;
		urbanRural: string;
		selected: string;
		bounds: [number, number, number, number];
	} = $props();

	function handleClick(ev) {
		let areaCode: string = ev.features?.[0].id;
		if (areaCode) {
			goto(resolve('/areas/[code]', { code: areaCode }), { reset: false });
		}
	}

	let urbanRuralDescription = $derived.by(() => {
		let article = urbanRural.toLowerCase() === 'urban' ? 'an' : 'a';
		let description =
			urbanRural.toLowerCase() === 'mixed urban/rural'
				? 'mixed urban and rural'
				: urbanRural.toLowerCase();
		return `${article} ${description} area`;
	});

	let postcode: string | undefined = $state();

	onMount(() => {
		let pc = page.url.searchParams.get('postcode');
		if (pc && isPostcode(pc)) {
			postcode = cleanPostcode(pc);
			document.title = `Deprivation in ${postcode}`;
		}
	});

	afterNavigate(() => {
		let pc = page.url.searchParams.get('postcode');
		if (pc && isPostcode(pc)) {
			postcode = cleanPostcode(pc);
			document.title = `Deprivation in ${postcode}`;
		} else {
			postcode = undefined;
		}
	});
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
					{#if postcode}
						{postcode} is in <span class="text-purple fw-bold">{name}</span>,
					{:else}
						<span class="text-purple fw-bold">{name}</span> is
					{/if}
					a Super Output Area{#if parentCode && parentName}, in
						<a
							class="text-blue"
							href={resolve(`areas/${parentCode}`)}
							title="View deprivation profile for {parentName}">{parentName}</a
						>
					{/if}.
				</p>
				<p>
					Super Output Areas - referred to here as 'neighbourhoods' - have an average population of
					2,030 people.
				</p>
				<p>
					{name} is in {urbanRuralDescription}.
				</p>
			</div>
		</div>
	</div>

	<div class="col-12 col-xl-4 mb-3 d-flex flex-column">
		<NavMap
			boundaryFile="public/map/soa2011.geojson"
			selectedArea={selected}
			{bounds}
			{handleClick}
			promoteId="area_code"
			nameProp="area_name"
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
