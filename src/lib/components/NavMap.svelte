<script lang="ts">
	import { asset } from '$app/paths';
	import { niBounds, cleanName } from '#lib/util/mapHelpers.ts';
	import type { Bounds } from '#lib/util/mapHelpers.ts';

	import { setWorkerUrl } from 'maplibre-gl';
	import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
	setWorkerUrl(maplibreWorkerUrl);

	import {
		MapLibre,
		NavigationControl,
		FullScreenControl,
		GeoJSONSource,
		FillLayer,
		LineLayer,
		FeatureState,
		Popup
	} from 'svelte-maplibre-gl';
	import type * as maplibregl from 'maplibre-gl';

	let {
		boundaryFile,
		selectedArea,
		bounds,
		handleClick,
		promoteId = 'SDZ21_code',
		nameProp = 'SDZ21_name'
	}: {
		boundaryFile: string;
		selectedArea: string;
		bounds: [number, number, number, number];
		handleClick: Function;
		promoteId: string;
		nameProp: string;
	} = $props();
	let hovered:
		| {
				feature: maplibregl.MapGeoJSONFeature | undefined;
				lngLat: maplibregl.LngLat | undefined;
		  }
		| undefined = $state.raw();
	let map: maplibregl.Map | undefined = $state.raw();

	let style = asset('public/map/style-omt.json');
	let mapBounds: Bounds = $derived([
		[bounds[2], bounds[3]],
		[bounds[0], bounds[1]]
	]);

	$effect(() => {
		map?.fitBounds(mapBounds, {
			padding: 30,
			duration: 800
		});
	});
</script>

<div id="nav-map" class="map flex-grow-1 border border-secondary" tabindex="-1">
	<MapLibre
		bind:map
		class="navmap"
		{style}
		inlineStyle="height: 100%;"
		maxBounds={niBounds}
		bounds={mapBounds}
		attributionControl={false}
		cooperativeGestures={false}
		dragRotate={false}
	>
		<NavigationControl position="top-right" showCompass={false} showZoom={false} />
		<FullScreenControl />
		<GeoJSONSource id="area-boundaries" data={asset(boundaryFile)} {promoteId}>
			<FillLayer
				id="area-fill"
				paint={{
					'fill-color': ['case', ['boolean', ['feature-state', 'hover'], false], '#999999', '#fff'],
					'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.4, 0]
				}}
				onmousemove={(ev) => {
					if (map) {
						if (ev.features?.[0]) {
							hovered = {
								feature: ev.features[0],
								lngLat: ev.lngLat
							};
							const isSelected = ev.features[0].id === selectedArea;
							map.getCanvas().style.cursor = isSelected ? 'default' : 'pointer';
						} else {
							map.getCanvas().style.cursor = 'default';
						}
					}
				}}
				onmouseleave={() => {
					hovered = undefined;
				}}
				onclick={handleClick}
			/>
			<LineLayer
				id="area-outline"
				paint={{
					'line-color': ['case', ['==', ['get', promoteId], selectedArea], '#0078FF', '#555'],
					'line-width': ['case', ['==', ['get', promoteId], selectedArea], 4, 1]
				}}
			/>
			{#if hovered && hovered.feature}
				<FeatureState id={hovered.feature.id} state={{ hover: true }} />
				{#if hovered.lngLat}
					<Popup
						closeButton={false}
						closeOnClick={false}
						offset={[0, -6]}
						class="nisra-popup"
						lnglat={hovered.lngLat}
					>
						<div>
							<strong>
								{#if hovered.feature.id != selectedArea}
									View:
								{/if}
								{cleanName(hovered.feature.properties[nameProp])}
							</strong>
						</div>
					</Popup>
				{/if}
			{/if}
		</GeoJSONSource>
	</MapLibre>
</div>
