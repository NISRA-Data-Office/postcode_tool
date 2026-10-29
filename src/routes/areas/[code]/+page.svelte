<script lang="ts">
	import { resolve } from '$app/paths';
	import Breadcrumb from '#lib/components/Breadcrumb.svelte';
	import AreaTitle from '#lib/components/AreaTitle.svelte';
	import SdzBoxes from '#lib/components/SdzBoxes.svelte';
	import SdzParagraph from '#lib/components/SdzParagraph.svelte';
	import { getBreadcrumbLinks } from '#lib/util/linkHelpers.ts';

	let { data } = $props();

	let name = $derived(data.name);
	let code = $derived(data.code);
	let domain = $state('mdm');
	let mdmRank = $derived(data.data.ranks['mdm']);
	let domainRank = $derived(data.data.ranks[domain]);
	let count = $derived(data.count);
	let parentCode = $derived(data.parents[0].code);
	let parentName = $derived(data.parents[0].name);
</script>

<main class="flex-grow-1">
	<div id="content" class="container">
		<Breadcrumb links={getBreadcrumbLinks(data)} />
		<div class="row mb-4">
			<div class="col-12 col-xl-8">
				<AreaTitle type={data.type} name={data.name} />
			</div>
			<div class="col-12 col-xl-4">
				<div id="postcode-search" class="position-relative"></div>
				<div class="row mt-2 gap-1 gx-1">
					<a
						class="btn col bg-purple rounded-2 border-secondary"
						aria-label="About this app (opens About page)"
						href={resolve(`about.html`)}>About</a
					>
					<button class="btn col bg-purple rounded-2 border-secondary" id="download-page-btn"
						>Download</button
					>
					<button
						class="btn col bg-purple rounded-2 border-secondary"
						aria-label="Share this page"
						onclick={sharePage()}>Share</button
					>
				</div>
			</div>
		</div>
		{#if data.type === 'sdz'}
			<SdzBoxes {name} {code} {parentName} {parentCode} {mdmRank} {count} />
			<SdzParagraph {name} {mdmRank} {count} />
		{/if}

		<div class="row align-items-center justify-content-center">
			<div class="col-12 col-xl-8">
				<div id="mdm-scale-chart"></div>
			</div>
		</div>

		<p class="fs-4">This is an overall measure, called the Multiple Deprivation Measure.</p>
		<div id="info-boxes"></div>

		<h3 class="h2 mt-4">Compare with nearby areas</h3>

		<div class="row mb-4">
			<div class="col-12 col-xl-4">
				<p class="mt-3 mb-1">Select a type of deprivation:</p>
				<select
					id="type-select"
					class="form-select rounded-0 border-secondary"
					aria-label="Select a type of deprivation"
				></select>
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
						<div id="comparison-scale-chart"></div>
						<div class="text-center py-1">
							Areas grouped into deprivation deciles (based on rank)
						</div>
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
			There are different types of deprivation in <span class="place-name text-purple"></span>
		</h3>

		<div class="row align-items-center justify-content-center">
			<div class="col col-xl-10">
				<div id="chart-capture">
					<div id="deprivation-scales" class="mt-4"></div>
				</div>
			</div>
		</div>

		<button
			class="btn col bg-purple rounded-2 border-secondary"
			id="download-charts-btn"
			aria-label="Download charts dropdown">Download</button
		>

		<div class="bg-grey border border-secondary p-3 mt-4">
			<h3 id="summary-heading" class="h2">
				Deprivation summary for <span class="text-purple place-name"></span>
			</h3>
			<div class="bg-white p-2 border border-secondary" id="deprivation-summary"></div>
			<div class="d-flex align-items-center gap-3 my-3">
				<button class="btn bg-purple border-secondary rounded-2" id="copy-summary">
					Copy summary
				</button>

				<span id="text-copied" class="fw-bold d-none"> Summary copied to clipboard </span>
			</div>
		</div>

		<h3 class="h2 mt-4">Next steps</h3>
		<div id="next-steps" class="row g-4 mb-5"></div>
	</div>
</main>

<button id="scroll-btn" class="d-none">Back to top</button>
<footer id="footer"></footer>
