<script lang="ts">
	import { resolve } from '$app/paths';
	interface Props {
		links: [{ label: string; href?: string }];
	}
	let { links }: Props = $props();
</script>

<nav id="nav">
	<ol class="breadcrumb mb-0 mt-2 mb-2 text-secondary">
		{#each links as link (link.label)}
			<li class="breadcrumb-item">
				{#if link.href}
					<a href={resolve(link.href)} class="p-1">{link.label}</a>
				{:else}
					{link.label}
				{/if}
			</li>
		{/each}
	</ol>
</nav>
