<script lang="ts">
	import { asset } from '$app/paths';
	import { page } from '$app/state';

	import PostcodeSearch from './PostcodeSearch.svelte';

	function sharePage() {
		navigator.clipboard.writeText(page.url.toString());
	}
</script>

<PostcodeSearch />
<div class="row mt-2 gap-1 gx-1">
	<a
		class="btn col bg-purple rounded-2 border-secondary"
		aria-label="About this app (opens About page)"
		href={asset(`about.html`)}>About</a
	>
	<button class="btn col bg-purple rounded-2 border-secondary" id="download-page-btn"
		>Download</button
	>
	<button
		class="btn col bg-purple rounded-2 border-secondary"
		aria-label="Share this page"
		onclick={sharePage}>Share</button
	>
</div>
