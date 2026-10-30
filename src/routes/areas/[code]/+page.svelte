<script lang="ts">
	import { asset } from '$app/paths';
	import Breadcrumb from '#lib/components/Breadcrumb.svelte';
	import { getBreadcrumbLinks } from '#lib/util/linkHelpers.ts';
	import AreaTitle from '#lib/components/AreaTitle.svelte';
	import SdzPage from '#lib/components/SdzPage.svelte';

	let {
		data
	}: {
		data: {
			name: string;
			data: {
				ranks: { [key: string]: number };
			};
			count: number;
			parents?: [{ name: string; code: string }];
			type: string;
		};
	} = $props();

	let name = $derived(data.name);
	let count = $derived(data.count);
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
						href={asset(`about.html`)}>About</a
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
		{#if data.type === 'sdz' && data.parents}
			<SdzPage {name} parents={data.parents} domainRanks={data.data.ranks} {count} />
		{/if}
	</div>
</main>

<button id="scroll-btn" class="d-none">Back to top</button>
