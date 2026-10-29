<script>
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import favicon from '#lib/assets/favicon.svg';

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

	<link rel="icon" href={resolve(`assets/img/icon/favicon.ico`)} type="image/vnd.microsoft.icon" />
	<link
		rel="icon"
		type="image/png"
		href={resolve(`assets/img/icon/favicon-96x96.png`)}
		sizes="96x96"
	/>
	<link rel="icon" type="image/svg+xml" href={resolve(`assets/img/icon/favicon.svg`)} />
	<link rel="shortcut icon" href={resolve(`assets/img/icon/favicon.ico`)} />
	<link rel="apple-touch-icon" sizes="180x180" href="assets/img/icon/apple-touch-icon.png" />

	<link rel="stylesheet" href="https://unpkg.com/maplibre-gl@5.6.2/dist/maplibre-gl.css" />

	<link rel="stylesheet" href={resolve(`assets/css/styles.css`)} />
</svelte:head>

<div id="cookie-banner"></div>
<banner id="banner"></banner>

{@render children()}
