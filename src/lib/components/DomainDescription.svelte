<script lang="ts">
	import { domains } from '#lib/config.ts';

	let { domain }: { domain: string } = $props();

	let description = $derived(domains.filter((x) => x.code === domain)[0].description);
</script>

{#each description as para, index (index)}
	<p>{para}</p>
{/each}
