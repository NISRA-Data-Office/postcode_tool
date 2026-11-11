<script lang="ts">
	import { page } from '$app/state';
	import AreaTitle from './AreaTitle.svelte';
	import ButtonRow from './ButtonRow.svelte';
	import SdzBoxes from './SdzBoxes.svelte';
	import AreaParagraph from './AreaParagraph.svelte';
	import AreaSummary from './AreaSummary.svelte';
	import DomainSelect from './DomainSelect.svelte';
	import RankChart from './RankChart.svelte';
	import RankChartTable from './RankChartTable.svelte';
	import ScaleMap from './ScaleMap.svelte';
	import RankComparison from './RankComparison.svelte';
	import areaData from '#lib/assets/N92000002.json';

	let {
		code,
		name,
		domainRanks,
		count,
		parents,
		bounds,
		postcode
	}: {
		code: string;
		name: string;
		domainRanks: { [key: string]: number };
		count: number;
		parents: [{ name: string; code: string }];
		bounds: [number, number, number, number];
		postcode?: string;
	} = $props();

	let mdmRank = $derived(domainRanks['mdm']);
	let domain = $state('mdm');
	let selectedRank = $derived(domainRanks[domain]);
	let parentCode = $derived(parents[0].code);
	let parentName = $derived(parents[0].name);
	let scaleMapBounds = $derived([
		bounds[0] - 0.05,
		bounds[1] - 0.05,
		bounds[2] + 0.05,
		bounds[3] + 0.05
	]);

	let hoveredArea: string | number | undefined = $state();
	let hoveredRank: number | undefined = $derived(
		hoveredArea && areaData ? areaData.data.ranks[hoveredArea]?.ranks[domain] : undefined
	);
	let hoveredName: string | undefined = $derived(
		hoveredArea && areaData ? areaData.data.ranks[hoveredArea]?.name : undefined
	);
</script>

<div class="row mb-4">
	<div class="col-12 col-xl-8">
		<AreaTitle type="sdz" {name} />
	</div>
	<div class="col-12 col-xl-4">
		<ButtonRow />
	</div>
</div>

<SdzBoxes {name} {parentName} {parentCode} {mdmRank} {count} selected={code} {bounds} {postcode}/>
<AreaParagraph {name} {mdmRank} {count} />

<div class="row align-items-center justify-content-center">
	<div class="col-12 col-xl-8">
		<div id="mdm-scale-chart">
			<RankChart rank={mdmRank} maxRank={count} labels="below" {name} />
		</div>
	</div>
</div>

<p class="fs-4">This is an overall measure, called the Multiple Deprivation Measure.</p>
<div id="info-boxes"></div>

<h3 class="h2 mt-4">Compare with nearby areas</h3>

<div class="row mb-4">
	<div class="col-12 col-xl-4">
		<p class="mt-3 mb-1">Select a type of deprivation:</p>
		<DomainSelect bind:selected={domain} />
	</div>
</div>

<div class="row">
	<div class="col-12 col-xl-7">
		<div id="map-capture">
			<div class="map-container border border-secondary border-bottom-0">
				<div id="comparison-map">
					<ScaleMap
						selected={code}
						{domain}
						type="lgd"
						area={parentCode}
						name={parentName}
						bounds={scaleMapBounds}
						bind:hoveredArea
					/>
				</div>
			</div>
			<div class="bg-white border border-secondary p-3">
				<RankComparison
					{name}
					rank={selectedRank}
					nameCompare={hoveredName}
					rankCompare={hoveredRank}
					{domain}
					maxRank={count}
				/>
				<div id="comparison-scale-chart">
					<RankChart rank={selectedRank} rankCompare={hoveredRank} maxRank={count} labels="below" />
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
</div>

<h3 class="h2 mt-5">
	There are different types of deprivation in <span class="place-name text-purple">{name}</span>
</h3>

<div class="row align-items-center justify-content-center">
	<div class="col col-xl-10">
		<div id="chart-capture">
			<div id="deprivation-scales" class="mt-4">
				<RankChartTable ranks={domainRanks} maxRank={count} />
			</div>
		</div>
	</div>
</div>

<button
	class="btn col bg-purple rounded-2 border-secondary"
	id="download-charts-btn"
	aria-label="Download charts dropdown">Download</button
>

<AreaSummary {name} {mdmRank} {domainRanks} {count} />

<h3 class="h2 mt-4">Next steps</h3>
<div id="next-steps" class="row g-4 mb-5"></div>
