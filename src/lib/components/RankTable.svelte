<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	type RankEntry = { name: string; code: string; rank: number; councilRank: number };
	type RawRankEntry = { name: string; code: string; rank: number };

	let {
		ranks,
		selected = $bindable()
	}: {
		ranks: RawRankEntry[];
		selected?: string;
	} = $props();

	let sortCol: 'name' | 'rank' | 'councilRank' = $state('rank');
	let sortDir: 'asc' | 'desc' = $state('asc');
	let tableContainer: HTMLDivElement;
	let tableBody: HTMLElement;

	function prepRanks(ranks: RawRankEntry[]): RankEntry[] {
		ranks.sort((a, b) => a.rank - b.rank);
		return ranks.map((d, i) => {
			return { ...d, councilRank: i + 1 } as RankEntry;
		});
	}

	let ranksPrep: RankEntry[] = $derived(prepRanks(ranks));

	let sortFn = $derived((a: RankEntry, b: RankEntry) => {
		if (sortDir == 'asc') {
			return a[sortCol] < b[sortCol] ? -1 : 1;
		} else {
			return a[sortCol] > b[sortCol] ? -1 : 1;
		}
	});

	let sortSym = $derived(sortDir === 'asc' ? '▲' : '▼');

	let ranksSorted = $derived(ranksPrep.sort(sortFn));

	$effect(() => {
		if (selected) {
			let selectedIdx = ranksSorted.findIndex((row) => row.code === selected);
			let selectedRow = tableBody.children[selectedIdx];
			if (selectedRow && selectedRow.offsetTop) {
				tableContainer.scrollTo({
					top:
						selectedRow.offsetTop - tableContainer.clientHeight / 2 + selectedRow.clientHeight / 2,
					behavior: 'smooth'
				});
			}
		} else {
			tableContainer.scrollTo({
				top: 0,
				behavior: 'smooth'
			});
		}
	});
</script>

<div id="table-col" class="col-12 col-xl-5 mb-3">
	<div id="lgd-table-container" bind:this={tableContainer}>
		<table class="lgd-table">
			<thead>
				<tr>
					<th data-key="niRank" class="cursor-pointer w-25" tabindex="0">
						<button
							aria-label="Sort by NI rank"
							onclick={() => {
								if (sortCol === 'rank') {
									sortDir = sortDir === 'asc' ? 'desc' : 'asc';
								} else {
									sortCol = 'rank';
									sortDir = 'asc';
								}
								ranksSorted = ranksPrep.sort(sortFn);
							}}
						>
							NI Rank{#if sortCol == 'rank'}
								{sortSym}{/if}
						</button>
					</th>
					<th data-key="lgdRank" class="cursor-pointer w-30" tabindex="0">
						<button
							aria-label="Sort by council rank"
							onclick={() => {
								if (sortCol === 'councilRank') {
									sortDir = sortDir === 'asc' ? 'desc' : 'asc';
								} else {
									sortCol = 'councilRank';
									sortDir = 'asc';
								}
								ranksSorted = ranksPrep.sort(sortFn);
							}}
						>
							Council Rank{#if sortCol == 'councilRank'}
								{sortSym}{/if}
						</button>
					</th>
					<th data-key="name" class="cursor-pointer w-45" tabindex="0">
						<button
							aria-label="Sort by neighbourhood alphabetically"
							onclick={() => {
								if (sortCol === 'name') {
									sortDir = sortDir === 'asc' ? 'desc' : 'asc';
								} else {
									sortCol = 'name';
									sortDir = 'asc';
								}
								ranksSorted = ranksPrep.sort(sortFn);
							}}
						>
							Neighbourhood{#if sortCol == 'name'}
								{sortSym}{/if}
						</button>
					</th>
				</tr>
			</thead>
			<tbody bind:this={tableBody}>
				{#each ranksSorted as { name, code, rank, councilRank }, index (index)}
					<tr
						class={`sdz-row cursor-pointer ${code === selected ? 'selected' : ''}`}
						data-code={code}
						tabindex="-1"
						aria-label={`Focus map on on ${name}`}
						onclick={() => (selected = code)}
					>
						<td class="border-secondary">{rank}</td>
						<td class="border-secondary">{councilRank}</td>
						<td class="border-secondary">{name}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<style>
	button {
		all: unset;
	}
</style>
