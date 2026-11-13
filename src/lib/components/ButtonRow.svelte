<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	import PostcodeSearch from './PostcodeSearch.svelte';
	import DataDownloadButton from './DataDownloadButton.svelte';
	import { domains } from '#lib/config.ts';
	import type { Query } from '#lib/util/dataDownload.ts';

	function sharePage() {
		navigator.clipboard.writeText(page.url.toString());
	}

	let expanded = $state(false);

	let {
		name,
		code,
		type,
		domain
	}: {
		name: string;
		code: string | string[];
		type: 'ctry' | 'lgd' | 'soa' | 'sdz';
		domain: string;
	} = $props();

	let codes = $derived(typeof code === 'string' ? [code] : code);

	let query: Query | undefined = $derived.by(() => {
		if (type === 'soa' || type === 'sdz') {
			return {
				id: ['STATISTIC', 'SOA'],
				dimension: {
					STATISTIC: {
						category: {
							index: domains.map((value) => value.statistic)
						}
					},
					SOA: {
						category: {
							index: codes
						}
					}
				}
			};
		}

		if (type === 'lgd' || type === 'ctry') {
			return {
				id: ['STATISTIC', 'SOA'],
				dimension: {
					STATISTIC: {
						category: {
							index: [domains.find((value) => value.code === domain)?.statistic]
						}
					},
					SOA: {
						category: {
							index: codes
						}
					}
				}
			};
		}
	});
</script>

<PostcodeSearch />
<div class="row mt-2 gap-1 gx-1">
	<div class="col">
		<a
			class="btn bg-purple rounded-2 border-secondary w-100 h-100"
			aria-label="About this app (opens About page)"
			href={resolve('/about')}>About</a
		>
	</div>

	<div class="dropdown col">
		<button
			class="btn dropdown-toggle bg-purple rounded-2 border-secondary w-100 h-100"
			id="download-page-btn"
			type="button"
			aria-expanded={expanded ? 'true' : 'false'}
			onclick={() => (expanded = !expanded)}>Download</button
		>
		<ul class={`dropdown-menu${expanded ? ' show' : ''}`}>
			<li><DataDownloadButton>Data (as CSV format)</DataDownloadButton></li>
			<li><DataDownloadButton>Data (as XLSX format)</DataDownloadButton></li>
		</ul>
	</div>
	<div class="col">
		<button
			class="btn bg-purple rounded-2 border-secondary w-100 h-100"
			aria-label="Share this page"
			onclick={sharePage}>Share</button
		>
	</div>
</div>
