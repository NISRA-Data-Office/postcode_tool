<script lang="ts">
	import { ni, lgds } from '#lib/config.ts';

	let { handleSelect, selected = null } = $props();
</script>

<select
	class="form-select rounded-0 border-secondary"
	aria-label="Select a council area"
	onchange={handleSelect}
    bind:value={selected}
    placeholder="Select a council area"
>
	<option value={ni.code}>{ni.name} (all councils)</option>
	<optgroup label="Select a council area">
		{#each lgds as { code, name } (code)}
			<option value={code}>{name}</option>
		{/each}
	</optgroup>
</select>
