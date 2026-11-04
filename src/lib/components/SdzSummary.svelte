<script lang="ts">
	import { headline, paragraph } from '#lib/util/textHelpers.ts';
	import { domains } from '#lib/config.ts';

	let {
		name,
		mdmRank,
		domainRanks,
		count
	}: {
		name: string;
		mdmRank: number;
		domainRanks: { [key: string]: number };
		count: number;
	} = $props();

	let percent = $derived(mdmRank / count);

	let summaryHeading: HTMLHeadingElement;
	let summaryText: HTMLDivElement;
	let textCopied: HTMLSpanElement;

	async function copySummary() {
		const textParts = [summaryHeading.textContent, summaryText.textContent, 'Source: NISRA'];
		const text = textParts.join('\n\n');
		await navigator.clipboard.writeText(text);
		textCopied.classList.remove('d-none');
		setTimeout(() => textCopied.classList.add('d-none'), 2000);
	}
</script>

<div class="bg-grey border border-secondary p-3 mt-4">
	<h3 id="summary-heading" class="h2" bind:this={summaryHeading}>
		Deprivation summary for <span class="text-purple place-name">{name}</span>
	</h3>
	<div class="bg-white p-2 border border-secondary" id="deprivation-summary" bind:this={summaryText}>
		<h4>
			The overall deprivation rank of
			<span class="text-purple fw-bold">{name}</span>
			is
			<span>{mdmRank}</span>
			out of {count} neighbourhoods.
		</h4>
		<p class="mb-0">
			Rank 1 is the most deprived neighbourhood and rank {count} is the least deprived.
		</p>

		<p class="mb-0">
			<span class="text-purple fw-bold">{name}</span>
			{headline(mdmRank, count, percent)}
		</p>

		<p class="mb-0">
			{paragraph(mdmRank, count, percent)} <span class="text-purple fw-bold">{name}</span>
		</p>

		<ul class="deprivation-headline">
			{#each domains as domain (domain.code)}
				{#if domain.code != 'mdm'}
					<li>
						<strong>{domain.label}:</strong>
						<span class="text-purple fw-bold">{name}</span> is ranked
						<strong>{domainRanks[domain.code]}</strong> out of {count} neighbourhoods.
					</li>
				{/if}
			{/each}
		</ul>
	</div>
	<div class="d-flex align-items-center gap-3 my-3">
		<button class="btn bg-purple border-secondary rounded-2" id="copy-summary" onclick={copySummary}>
			Copy summary
		</button>

		<span id="text-copied" class="fw-bold d-none" bind:this={textCopied}>Summary copied to clipboard </span>
	</div>
</div>
