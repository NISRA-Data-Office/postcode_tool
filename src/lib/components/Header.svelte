<script lang="ts">
	import { asset } from '$app/paths';
	import { title, rateit, year } from '#lib/config.js';
</script>

<banner id="banner" class="navbar p-0 bg-navy">
	<div class="container-fluid bg-blue align-items-center justify-content-center py-2">
		<p class="m-0">
			This is a new service. Help us improve it and <a href="mailto:deprivation@nisra.gov.uk">give your feedback by email</a>.
		</p>
	</div>
	<div class="container-fluid align-items-center justify-content-center" role="banner">
		<div class="container row py-2">
			<div
				class="col-12 col-xl-6 d-flex align-items-center justify-content-center justify-content-xl-start p-0"
			>
				<a
					class="navbar-brand ps-2 no-external-icon"
					href="https://www.nisra.gov.uk/"
					target="_blank"
					rel="noopener noreferrer"
				>
					<img
						src={asset(`assets/img/logo/nisra-only-white.svg`)}
						alt="NISRA logo"
						height="60"
						class="me-3"
						role="img"
						title="NISRA website (opens in new tab)"
					/>
				</a>
			</div>
			<div
				class="col-12 col-xl-6 d-flex text-center align-items-center justify-content-center justify-content-xl-end text-white p-0"
			>
				<h1 class="mb-0">{title}</h1>
			</div>
		</div>
	</div>
	<div class="container-fluid bg-green py-1 d-flex flex-column" role="banner"></div>
	<div class="container-fluid bg-grey py-2 d-flex flex-column text-black" role="banner">
		<p class="m-0">
			{year ? `The ${year}` : 'Test'} statistics on deprivation in Northern Ireland, including the Multiple
			Deprivation Measure (NIMDM).
		</p>
		<p class="m-0">
			Deprivation refers to people's unmet needs, a lack of access to opportunities and resources
			which we might expect in our society.
		</p>
	</div>
</banner>
