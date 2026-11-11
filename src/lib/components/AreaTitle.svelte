<script lang="ts">
	let { name, type }: { name: string; type: string } = $props();
</script>

<h2 id="headline" class="h1 mt-3">
	{#if type === 'sdz'}
		How deprived is <span class="text-purple">{name}</span>?
	{:else if type === 'lgd'}
		Deprivation in <span class="text-purple">{name}</span>
	{/if}
</h2>
