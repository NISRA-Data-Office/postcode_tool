<script lang="ts">
	import { downloadDataset } from '#lib/util/dataDownload.ts';
	import type { Query } from '#lib/util/dataDownload.ts';
	import type { Snippet } from 'svelte';

	let {
		dataset,
		fileName,
		format,
		query,
		afterDownload,
		children
	}: {
		dataset: string;
		fileName: string;
		format: 'csv' | 'xlsx';
		query?: Query;
		afterDownload?: Function;
		children: Snippet;
	} = $props();
</script>

<button
	class="dropdown-item"
	onclick={() => {
		downloadDataset(dataset, fileName, format, query);
		if (afterDownload) afterDownload();
	}}
>
	{@render children()}
</button>
