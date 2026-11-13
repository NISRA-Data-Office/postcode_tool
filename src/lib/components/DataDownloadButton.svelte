<script lang="ts">
	import { downloadDataset } from '#lib/util/dataDownload.ts';
	import type { Query } from '#lib/util/dataDownload.ts';
	import type { Snippet } from 'svelte';

	let {
		dataset,
		fileName,
		format,
		query,
		children
	}: {
		dataset: string;
		fileName: string;
		format: 'csv' | 'xlsx';
		query: Query;
		children: Snippet;
	} = $props();
</script>

<button class="dropdown-item">
	{@render children()}
</button>
