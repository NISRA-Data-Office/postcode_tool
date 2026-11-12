<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import searchData from '#lib/assets/postcode.json';

	let selectedIndex = $state(-1);
	let invalid = $state(false);
	let inputText: string | undefined = $state();

	let isPostcode = $derived(inputText && inputText.slice(0, 2).toLowerCase() == 'bt');
	let postcodeLookup = Object.entries(searchData)
		.map((entry) => {
			return entry[1].codes.map((postcode) => ({
				areaCode: entry[0],
				areaName: entry[1].name,
				postcode: postcode
			}));
		})
		.flat();

	function loadOptions(query) {
		if (!isPostcode || query.length < 3) return [];
		const candidates = postcodeLookup.filter((x) =>
			x.postcode.toLowerCase().startsWith(query.toLowerCase())
		);
		const results = candidates.sort((a, b) => (a.postcode < b.postcode ? -1 : 1)).slice(0, 10);
		return results;
	}

	let currentMatches = $derived(inputText ? loadOptions(inputText) : []);

	function cleanPostcode(postcode: string): string {
		return postcode.toUpperCase().trim().replaceAll(/\s+/g, ' ');
	}
</script>

<div id="postcode-search" class="position-relative">
	<div class="input-group">
		<input
			id="postcode-input"
			type="search"
			class="form-control rounded-0 border-secondary"
			placeholder="Search for a postcode"
			aria-label="Search for a postcode"
			autocomplete="off"
			autocorrect="off"
			autocapitalize="off"
			spellcheck="false"
			onkeyup={(ev) => {
				if (ev.key === 'Enter' && currentMatches && currentMatches.length > 0) {
					let areaCode = currentMatches[0].areaCode;
					let query = new URLSearchParams({ postcode: currentMatches[0].postcode });
					currentMatches = [];
					inputText = '';
					goto(resolve(`/areas/[code]?${query}`, { code: areaCode }));
				}
			}}
			bind:value={inputText}
		/>
		<button id="postcode-go" class="btn rounded-0 border-secondary bg-purple" type="button">
			<i class="bi bi-search"></i>
		</button>
		{#if currentMatches && currentMatches.length > 0}
			<div
				id="postcode-dropdown"
				class="postcode-dropdown border border-secondary position-absolute"
			>
				{#each currentMatches as { postcode, areaName, areaCode }, index (index)}
					<button
						type="button"
						class="postcode-dropdown__item d-block w-100 p-2 border-0 border-bottom text-start"
						role="option"
						aria-selected="false"
						onclick={() => {
							let query = new URLSearchParams({ postcode: postcode });
							goto(resolve(`/areas/[code]?${query}`, { code: areaCode }));
							currentMatches = [];
							inputText = '';
						}}
						onmouseenter={() => (selectedIndex = index)}
					>
						<strong>{postcode}</strong> View <strong>{areaName}</strong>
					</button>
				{/each}
			</div>
		{/if}
		{#if invalid}
			<div
				id="postcode-invalid"
				class="postcode-invalid text-danger mt-1 position-absolute border border-secondary bg-white p-1"
			>
				No results found. Please check your postcode or area name and try again.
			</div>
		{/if}
	</div>
</div>
