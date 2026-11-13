<script lang="ts">
	import { resolve } from '$app/paths';

	let {
		name,
		parentCode
	}: {
		name: string;
		parentCode: string;
	} = $props();
</script>

<h3 class="h2 mt-4">Next steps</h3>
<div id="next-steps" class="row g-4 mb-5">
	<div class="col-12 col-md-6 col-lg-4 mb-4 d-flex">
		<a
			href={resolve('/areas/[code]', { code: parentCode })}
			class="text-white bg-purple rounded-2 border border-secondary d-flex align-items-center justify-content-center text-center fs-5 p-3 mt-3 w-100 h-100 text-decoration-none"
		>
			Explore deprivation in areas around {name}
		</a>
	</div>
	<div class="col-12 col-md-6 col-lg-4 mb-4 d-flex">
		<a
			href="#top"
			class="text-white bg-purple rounded-2 border border-secondary d-flex align-items-center justify-content-center text-center fs-5 p-3 mt-3 w-100 h-100 text-decoration-none"
		>
			Back to top and enter another postcode
		</a>
	</div>
	<div class="col-12 col-md-6 col-lg-4 mb-4 d-flex">
		<a
			href="https://www.nisra.gov.uk/statistics/people-and-communities/deprivation-and-poverty"
			class="text-white bg-purple rounded-2 border border-secondary d-flex align-items-center justify-content-center text-center fs-5 p-3 mt-3 w-100 h-100 text-decoration-none"
		>
			View more deprivation resources and information
		</a>
	</div>
</div>
