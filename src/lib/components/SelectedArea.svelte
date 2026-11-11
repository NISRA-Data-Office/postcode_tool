<script lang="ts">
	import { resolve } from '$app/paths';
	let {
		name,
		code = $bindable()
	}: {
		name?: string;
		code?: string;
	} = $props();
</script>

{#if name && code}
	<div class="row mb-4">
		<div class="col-12 col-xl-7">
			<div class="bg-grey p-2 border border-secondary">
				<p class="fs-4">
					View deprivation profile for: <a
						id="focus-link"
						class="sdz-name text-blue"
						href={resolve('/areas/[code]', { code: code })}>{name}</a
					>
				</p>
				<div>
					<button
						id="clear-focus"
						class="btn col bg-purple rounded-2 border-secondary"
						aria-label="Clear focus from map and table below"
						onclick={() => (code = undefined)}>Clear focus</button
					>
				</div>
			</div>
		</div>
	</div>
{/if}
