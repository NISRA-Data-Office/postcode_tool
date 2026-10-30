<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import PostcodeSearch from '#lib/components/PostcodeSearch.svelte';
	import LgdSelect from '#lib/components/LgdSelect.svelte';

	function handleLgdSelect(event) {
		const code = event.target.value;
		goto(resolve(`areas/${code}`));
	}
</script>

<main class="flex-grow-1 d-flex flex-column">
	<div id="content" class="flex-grow-1 d-flex flex-column">
		<!-- Main Content -->
		<div id="background-map" class="container flex-grow-1">
			<div class="container">
				<div class="row justify-content-center">
					<div class="col-12 col-xl-5 col-md-6 col-xl-5 mb-3">
						<div class="card h-100 d-flex flex-column rounded-0 border-secondary">
							<div class="card-body d-flex flex-column justify-content-between">
								<p class="fs-2 mb-2">Find out about deprivation in your neighbourhood:</p>

								<PostcodeSearch />
							</div>
						</div>
					</div>

					<div class="col-12 col-xl-5 col-md-6 col-xl-5 mb-3">
						<div class="card h-100 d-flex flex-column rounded-0 border-secondary">
							<div class="card-body d-flex flex-column justify-content-between">
								<p class="fs-2 mb-2">Explore deprivation by council area:</p>

								<LgdSelect handleSelect={handleLgdSelect} />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</main>
