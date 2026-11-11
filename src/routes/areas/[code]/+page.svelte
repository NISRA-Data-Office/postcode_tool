<script lang="ts">
	import { page } from '$app/state';
	import Breadcrumb from '#lib/components/Breadcrumb.svelte';
	import { getBreadcrumbLinks } from '#lib/util/linkHelpers.ts';
	import SdzPage from '#lib/components/SdzPage.svelte';
	import SoaPage from '#lib/components/SoaPage.svelte';
	import LgdPage from '#lib/components/LgdPage.svelte';

	let {
		data
	}: {
		data: {
			code: string;
			name: string;
			data: {
				ranks: { [key: string]: number | object };
			};
			count: number;
			parents?: [{ name: string; code: string }];
			type: string;
			bounds: [number, number, number, number];
		};
	} = $props();

	let name = $derived(data.name);
	let count = $derived(data.count);
	let code = $derived(data.code);
	let postcode: string | undefined = $derived(page.url.searchParams.get('postcode'));
</script>

<svelte:head>
	{#if postcode && ['sdz', 'soa'].includes(data.type)}
		<title>Deprivation in {postcode}</title>
	{:else}
		<title>Deprivation in {name}</title>
	{/if}
</svelte:head>

<main class="flex-grow-1">
	<div id="content" class="container">
		<Breadcrumb links={getBreadcrumbLinks(data)} />
		{#if data.type === 'sdz' && data.parents}
			<SdzPage
				{code}
				{name}
				parents={data.parents}
				domainRanks={data.data.ranks}
				{count}
				bounds={data.bounds}
				{postcode}
			/>
		{:else if data.type === 'soa' && data.parents}
			<SoaPage
				{code}
				{name}
				parents={data.parents}
				domainRanks={data.data.ranks}
				{count}
				urbanRural={data.urban_rural}
				bounds={data.bounds}
			/>
		{:else if data.type === 'lgd'}
			<LgdPage
				{code}
				{name}
				childrenType={{ name: 'super output areas', count: 890 }}
				numChildren={Object.keys(data.data.ranks).length}
				ranks={data.data.ranks}
				bounds={data.bounds}
			/>
		{/if}
	</div>
</main>
