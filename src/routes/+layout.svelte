<script>
	import { page } from '$app/state';
	import { asset } from '$app/paths';

	import Header from '#lib/components/Header.svelte';
	import Footer from '#lib/components/Footer.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<title>{page.data.title}</title>
	<meta name="apple-mobile-web-app-title" content={page.data.title} />
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />

	<link
		href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap"
		rel="stylesheet"
	/>

	<link
		href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
		rel="stylesheet"
	/>
	<link
		rel="stylesheet"
		href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css"
	/>

	<link rel="icon" href={asset(`assets/img/icon/favicon.ico`)} type="image/vnd.microsoft.icon" />
	<link
		rel="icon"
		type="image/png"
		href={asset(`assets/img/icon/favicon-96x96.png`)}
		sizes="96x96"
	/>
	<link rel="icon" type="image/svg+xml" href={asset(`assets/img/icon/favicon.svg`)} />
	<link rel="shortcut icon" href={asset(`assets/img/icon/favicon.ico`)} />
	<link
		rel="apple-touch-icon"
		sizes="180x180"
		href={asset(`assets/img/icon/apple-touch-icon.png`)}
	/>

	<link rel="stylesheet" href="https://unpkg.com/maplibre-gl@5.6.2/dist/maplibre-gl.css" />

	<link rel="stylesheet" href={asset(`assets/css/styles.css`)} />
</svelte:head>

<Header />

<div id="cookie-banner"></div>

{@render children()}

<button id="scroll-btn" class="d-none">Back to top</button>

<div class="bg-grey h5 text-end mt-1 mb-0 border">
	<div class="container py-1">
		<a
			href="https://www.nisra.gov.uk/statistics/people-and-communities/deprivation-and-poverty"
			target="_blank"
			rel="noopener"
			title="Deprivation statistics on the NISRA website (opens in new tab)"
		>
			View more deprivation resources and information
		</a>
	</div>
</div>
<Footer />
