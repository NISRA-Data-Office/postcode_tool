<script lang="ts">
	import { domains } from '#lib/config.ts';
	let { selected = $bindable('mdm') } = $props();
</script>

<select
	id="type-select"
	class="form-select rounded-0 border-secondary"
	aria-label="Select a type of deprivation"
	bind:value={selected}
>
	{#each domains as domain (domain.code)}
		{#if domain.code === selected}
			<option value={domain.code} selected>{domain.label}</option>
		{:else}
			<option value={domain.code}>{domain.label}</option>
		{/if}
	{/each}
</select>
