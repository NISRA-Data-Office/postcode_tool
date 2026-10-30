<script lang="ts">
	import { ni, lgds } from '#lib/config.ts';

	let { handleSelect, selected = null } = $props();
</script>

<select
	class="form-select rounded-0 border-secondary"
	aria-label="Select a council area"
	onchange={handleSelect}
>
	{#if !selected}
		<option value="" disabled hidden selected>Select a council area</option>
	{/if}
	{#if ni.code === selected}
		<option value={ni.code} selected>{ni.name} (all councils)</option>
	{:else}
		<option value={ni.code}>{ni.name} (all councils)</option>
	{/if}
	<optgroup label="Select a council area">
		{#each lgds as { code, name } (code)}
			{#if code === selected}
				<option value={code} selected>{name}</option>
			{:else}
				<option value={code}>{name}</option>
			{/if}
		{/each}
	</optgroup>
</select>
