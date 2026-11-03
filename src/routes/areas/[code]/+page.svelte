<script lang="ts">
	import Breadcrumb from '#lib/components/Breadcrumb.svelte';
	import { getBreadcrumbLinks } from '#lib/util/linkHelpers.ts';
	import SdzPage from '#lib/components/SdzPage.svelte';
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
</script>

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
			/>
		{:else if data.type === 'lgd'}
			<LgdPage
				{name}
				childrenType={{ name: 'Super data zone', count: 850 }}
				numChildren={Object.keys(data.data.ranks).length}
				ranks={data.data.ranks}
			/>
		{/if}
	</div>
</main>
