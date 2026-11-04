<script lang="ts">
	import Breadcrumb from '#lib/components/Breadcrumb.svelte';
	import { getBreadcrumbLinks } from '#lib/util/linkHelpers.ts';
</script>

<div id="content" class="container mt-4">
	<Breadcrumb links={getBreadcrumbLinks({ name: 'About' })} />
	<h2 class="h1">About and essential info</h2>
	<ul class="mt-2">
		<li>When this data was released. Expectations for future updates?</li>
		<li>Data source(s)</li>
		<li>Where data can be downloaded</li>
		<li>Any missing or suppressed data clearly explained</li>
		<li>Quality assurance information</li>
		<li>Contact information</li>
		<li>Link to accessibility statement</li>
		<li>Link to publication and data pages</li>
	</ul>
</div>
