<script lang="ts">
	import SdzBoxes from '#lib/components/SdzBoxes.svelte';
	import SdzParagraph from '#lib/components/SdzParagraph.svelte';
	import SdzSummary from '#lib/components/SdzSummary.svelte';
	import DomainSelect from '#lib/components/DomainSelect.svelte';
	import RankChart from '#lib/components/RankChart.svelte';
	import RankChartTable from '#lib/components/RankChartTable.svelte';

	let {
		name,
		domainRanks,
		count,
		parents
	}: {
		name: string;
		domainRanks: { [key: string]: number };
		count: number;
		parents: [{ name: string; code: string }];
	} = $props();

	let mdmRank = $derived(domainRanks['mdm']);
	let domain = $state('mdm');
	let selectedRank = $derived(domainRanks[domain]);
	let parentCode = $derived(parents[0].code);
	let parentName = $derived(parents[0].name);
</script>

<SdzBoxes {name} {parentName} {parentCode} {mdmRank} {count} />
<SdzParagraph {name} {mdmRank} {count} />

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
				<div id="comparison-map"></div>
			</div>
			<div class="bg-white border border-secondary p-3">
				<div id="comparison-text" class="text-center min-h-4"></div>
				<div id="comparison-scale-chart">
					<RankChart rank={selectedRank} maxRank={count} labels="below" />
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

<SdzSummary {name} {mdmRank} {domainRanks} {count} />

<h3 class="h2 mt-4">Next steps</h3>
<div id="next-steps" class="row g-4 mb-5"></div>
