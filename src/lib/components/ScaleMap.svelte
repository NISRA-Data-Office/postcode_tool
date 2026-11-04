<script lang="ts">
	import { asset } from '$app/paths';
	import { niBounds, cleanName, prepAreaFeatures } from '#lib/util/mapHelpers.ts';
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

	import lgdBoundaries from '#lib/assets/LGD2014.geo.json';
	import areaData from '#lib/assets/N92000002.json';
	import areaBoundaries from '#lib/assets/SDZ2021.geo.json';

	let {
		selected,
		domain,
		type,
		area,
		name,
		bounds,
		promoteId = 'SDZ21_code',
		nameProp = 'SDZ21_name',
		lgdProp = 'LGD_code',
		hoveredArea = $bindable(undefined),
		handleClick
	}: {
		selected: string;
		domain: string;
		type: 'lgd' | 'ctry';
		area: string;
		name: string;
		boundaryFile: string;
		bounds: [number, number, number, number];
		promoteId: string;
		nameProp: string;
		hoveredArea: string | number | undefined;
		handleClick?: function;
	} = $props();

	let style = asset('public/map/style-omt.json');
	let areaGeojson = $derived(
		prepAreaFeatures(areaBoundaries, areaData.data.ranks, promoteId, nameProp)
	);

	let hovered:
		| {
				feature: maplibregl.MapGeoJSONFeature | undefined;
				lngLat: maplibregl.LngLat | undefined;
		  }
		| undefined = $state.raw();

	let map: maplibregl.Map | undefined = $state.raw();

	let mapBounds: Bounds = $derived([
		[bounds[2], bounds[3]],
		[bounds[0], bounds[1]]
	]);

	$effect(() => {
		map?.fitBounds(mapBounds, {
			padding: 30,
			duration: 800
		});

		if (handleClick && map) {
			map.getCanvas().style.cursor = hovered.feature ? 'pointer' : 'default';
		} else if (map) {
			map.getCanvas().style.cursor = 'default';
		}
	});

	let layerFilter: maplibregl.FilterSpecification | undefined = $derived(
		type === 'lgd' ? ['==', ['get', lgdProp], area] : undefined
	);

	let lgdFilter: maplibregl.FilterSpecification | undefined = $derived(
		type === 'lgd' ? ['!=', ['get', 'LGDCode'], area] : undefined
	);

	let hoveredRank: number | undefined = $derived(
		hoveredArea ? areaData.data.ranks[hoveredArea].ranks[domain] : undefined
	);

	function mousemove(ev) {
		if (map) {
			if (ev.features?.[0]) {
				hovered = {
					feature: ev.features[0],
					lngLat: ev.lngLat
				};
				hoveredArea = hovered.feature?.id;
			}
		}
	}

	function mouseleave() {
		hovered = undefined;
		hoveredArea = undefined;
	}
</script>

<MapLibre
	bind:map
	{style}
	inlineStyle="height: 100%;"
	maxBounds={niBounds}
	{bounds}
	attributionControl={false}
	cooperativeGestures={true}
	dragRotate={false}
	touchZoomRotate={false}
>
	<NavigationControl
		position="top-right"
		showCompass={false}
		showZoom={true}
		visualizePitch={false}
	/>
	<FullScreenControl />
	<GeoJSONSource id="area-boundaries" data={areaGeojson} {promoteId}>
		<FillLayer
			id="area-fill"
			paint={{
				'fill-color': ['string', ['get', `fill-${domain}`], '#eeeeee'],
				'fill-opacity': 1
			}}
			onmousemove={mousemove}
			onmouseleave={mouseleave}
			filter={layerFilter}
		/>
		<LineLayer
			id="area-outline"
			paint={{
				'line-color': '#555555',
				'line-width': 1,
				'line-opacity': 0.9
			}}
			filter={layerFilter}
		/>
		<LineLayer
			id="area-outline-selected"
			paint={{
				'line-color': ['case', ['==', ['get', promoteId], selected], '#d4351c', '#000000'],
				'line-width': ['case', ['==', ['get', promoteId], selected], 5, 0],
				'line-opacity': ['case', ['==', ['get', promoteId], selected], 1, 0]
			}}
			filter={layerFilter}
		/>
		<LineLayer
			id="area-outline-hover"
			paint={{
				'line-color': [
					'case',
					['boolean', ['feature-state', 'hover'], false],
					'#ce70d2',
					'#000000'
				],
				'line-width': ['case', ['boolean', ['feature-state', 'hover'], false], 5, 0],
				'line-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 1, 0]
			}}
			filter={layerFilter}
		/>
	</GeoJSONSource>
	{#if type === 'lgd'}
		<GeoJSONSource id="lgd-boundaries" data={lgdBoundaries} promoteId="LGDcode">
			<FillLayer
				id="lgd-fill"
				paint={{
					'fill-opacity': 0
				}}
				onmousemove={mousemove}
				onmouseleave={mouseleave}
				filter={lgdFilter}
			/>
			<LineLayer
				id="lgd-outline"
				paint={{
					'line-color': [
						'case',
						['boolean', ['feature-state', 'hover'], false],
						'#222222',
						'#555555'
					],
					'line-width': ['case', ['boolean', ['feature-state', 'hover'], false], 3, 2],
					'line-opacity': 0.9
				}}
				filter={lgdFilter}
				beforeId="area-fill"
			/>
		</GeoJSONSource>
	{/if}
	{#if hovered && hovered.feature}
		<FeatureState id={hovered.feature.id} source={hovered.feature.source} state={{ hover: true }} />
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
						{#if hovered.feature.source === 'area-boundaries'}
							{cleanName(hovered.feature.properties[nameProp])}: {hoveredRank}
						{:else if hovered.feature.source === 'lgd-boundaries'}
							{hovered.feature.properties.LGDNAME}
						{/if}
					</strong>
				</div>
			</Popup>
		{/if}
	{/if}
</MapLibre>
