<script lang="ts">
	interface Props {
		links: [{ label: string; href?: string }];
	}
	let { links }: Props = $props();
</script>

<nav id="nav">
	<ol class="breadcrumb mb-0 mt-2 mb-2 text-secondary">
		{#each links as link}
			<li class="breadcrumb-item">
				{#if link.href}
					<a href={link.href} class="p-1">{link.label}</a>
				{:else}
					{link.label}
				{/if}
			</li>
		{/each}
	</ol>
</nav>
