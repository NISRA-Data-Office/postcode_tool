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
			type: 'sdz' | 'soa' | 'lgd' | 'ctry';
			bounds: [number, number, number, number];
		};
	} = $props();

	let name = $derived(data.name);
	let count = $derived(data.count);
	let code = $derived(data.code);
	let type = $derived(data.type);
</script>

<svelte:head>
	<title>Deprivation in {name}</title>
</svelte:head>

<main class="flex-grow-1">
	<div id="content" class="container">
		<Breadcrumb links={getBreadcrumbLinks(data)} />
		{#if type === 'sdz' && data.parents}
			<SdzPage
				{code}
				{name}
				parents={data.parents}
				domainRanks={data.data.ranks}
				{count}
				bounds={data.bounds}
			/>
		{:else if type === 'soa' && data.parents}
			<SoaPage
				{code}
				{name}
				parents={data.parents}
				domainRanks={data.data.ranks}
				{count}
				urbanRural={data.urban_rural}
				bounds={data.bounds}
			/>
		{:else if type === 'lgd' || type === 'ctry'}
			<LgdPage
				{name}
				{code}
				{type}
				childrenType={{ name: 'super output areas', count: 890 }}
				numChildren={Object.keys(data.data.ranks).length}
				ranks={data.data.ranks}
				bounds={data.bounds}
			/>
		{/if}
	</div>
</main>
