<script lang="ts">
	let { name, type }: { name: string; type: string } = $props();
</script>

{#if type === 'sdz'}
	<h2>How deprived is {name}?</h2>
{/if}
