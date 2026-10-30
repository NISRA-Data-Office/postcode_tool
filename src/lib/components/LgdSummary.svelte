<script lang="ts">
	import { domains } from '#lib/config.ts';
	let {
		name,
		domain,
		numChildren,
		domainRanks
	}: {
		name: string;
		domain: string;
		numChildren: number;
		domainRanks: [{ code: string; name: string; rank: number }];
	} = $props();

	let domainInfo = $derived(domains[domains.findIndex((x) => x.code == domain)]);
	let countTop100 = $derived(domainRanks.filter((x) => x.rank <= 100).length);
	let ranks = $derived(domainRanks.map((x) => x.rank));
	let whichMin = $derived(ranks.findIndex((x) => x === Math.min(...ranks)));
	let whichMax = $derived(ranks.findIndex((x) => x === Math.max(...ranks)));
	let mostDeprived = $derived(domainRanks[whichMin]);
	let leastDeprived = $derived(domainRanks[whichMax]);

	function domainLabel(label: string, code: string) {
		let val = label[0].toLowerCase() + label.slice(1);
		if (code != 'mdm') {
			val += ' domain';
		}

		return val;
	}
</script>

<div id="deprivation-summary-group" class="bg-grey border border-secondary p-3 my-4">
	<h3 id="summary-heading" class="h2">
		<span class="deprivation-type">{domainInfo.label}</span> summary for
		<span class="text-purple place-name">{name}</span>
	</h3>
	<div class="bg-white p-2 border border-secondary" id="deprivation-summary">
		{@html domainInfo.description}
		<p>
			There are {numChildren} neighbourhoods in <span class="text-purple fw-bold">{name}</span>. The
			most deprived neighbourhood is <span class="text-purple fw-bold">{mostDeprived.name}</span>
			and the least deprived is <span class="text-purple fw-bold">{leastDeprived.name}</span>.
		</p>

		<p>
			<span class="text-purple fw-bold">{name}</span> contains {countTop100} of the 100 most deprived
			neighbourhoods in Northern Ireland when using the {domainLabel(
				domainInfo.label,
				domainInfo.code
			)}.
		</p>
	</div>
	<div class="d-flex align-items-center gap-3 my-3">
		<button
			class="btn bg-purple border-secondary rounded-2"
			id="copy-summary"
			onclick={copySummary}
		>
			Copy summary
		</button>

		<span id="text-copied" class="fw-bold d-none"> Summary copied to clipboard </span>
	</div>
</div>
