<script lang="ts">
	import { colourPalette } from '#lib/config.ts';

	let {
		rank,
		maxRank,
		rankCompare,
		name,
		labels
	}: {
		rank: number;
		maxRank: number;
		rankCompare?: number;
		name?: string;
		labels?: string;
	} = $props();

	let rankProp = $derived(rank / maxRank);
	let rankCompareProp = $derived(rankCompare ? rankCompare / maxRank : null);

	let minX = -4;
	let minY = $derived(name ? -10 : labels === 'above' ? -5 : labels === 'below' ? -2 : -4);
	let width = 160;
	let height = $derived(name ? 40 : labels ? 20.6 : 16.6);

	let viewBox = $derived(`${minX} ${minY} ${width} ${height}`);
	const scaleWidth = 151.9;
	const scaleGroupX = -33.8;
	const scaleGroupY = $derived(name ? -88.2 : -93.2);
	const rectWidth = 16.7;
	const rectHeight = 6.6;
	const rectGap = 14.9;
	const rectX = 34.2;
	const rectY = 95.2;

	const markerR = 3.3;
	const markerStroke = '#042433';
	const markerStrokeWidth = 0.5;
	const markerCx = $derived(rankProp * scaleWidth);
	const markerCompareCx = $derived(rankCompareProp ? rankCompareProp * scaleWidth : null);
	const markerCy = $derived(rectY + scaleGroupY + rectHeight / 2);
	const markerColour = '#d4351c';
	const markerCompareColour = '#ce70d2';

	const labelLeft = '← 1 (Most deprived)';
	const labelMiddle = 'Rank';
	let labelRight = $derived(`(Least deprived) ${maxRank} →`);
	let labelY = $derived(
		labels === 'above' ? -1 : labels == 'below' && name ? 22 : labels == 'below' ? 15 : null
	);
	const labelLeftX = 0;
	const labelMiddleX = 75;
	const labelRightX = 150;

	let boxMinX = -1.3;
	let boxMaxX = 154.5;
	let boxY = -9;
	let boxGap = 6.4;
	let boxHeight = 14;
	let boxMidY = $derived(boxY + boxHeight / 2);
	let markerTopY = $derived(markerCy - markerR);
	let boxWidth = $derived(name ? Math.max(33, name.length * 2.8 + 5) : null);
	let boxX = $derived(
		!boxWidth
			? null
			: rankProp > 0.5
				? Math.max(boxMinX, markerCx - boxGap - boxWidth)
				: Math.min(boxMaxX - boxWidth, markerCx + boxGap)
	);
</script>

<svg xmlns="http://www.w3.org/2000/svg" {viewBox}>
	<g transform={`translate(${scaleGroupX}, ${scaleGroupY})`}>
		{#each colourPalette as colour, index (index)}
			<rect
				style={`fill: ${colour}; fill-opcaity:1; stroke: #949494; stroke-width: 0.4`}
				width={rectWidth}
				height={rectHeight}
				x={rectX + index * rectGap}
				y={rectY}
			/>
		{/each}
	</g>
	<circle
		cx={markerCx}
		cy={markerCy}
		r={markerR}
		stroke={markerStroke}
		stroke-width={markerStrokeWidth}
		stroke-miterlimit="8"
		fill={markerColour}
	/>
	{#if rankCompare}
		<circle
			cx={markerCompareCx}
			cy={markerCy}
			r={markerR}
			stroke={markerStroke}
			stroke-width={markerStrokeWidth}
			stroke-miterlimit="8"
			fill={markerCompareColour}
		/>
	{/if}
	{#if labels}
		<text x={labelLeftX} y={labelY} font-size="5" text-anchor="start">{labelLeft}</text>
		<text x={labelMiddleX} y={labelY} font-size="5" text-anchor="middle">{labelMiddle}</text>
		<text x={labelRightX} y={labelY} font-size="5" text-anchor="end">{labelRight}</text>
	{/if}
	{#if name && boxX}
		<defs>
			<marker
				id="arrow-head"
				viewBox="0 0 8 6"
				refX="8"
				refY="3"
				markerWidth="8"
				markerHeight="6"
				orient="auto"
				markerUnits="strokeWidth"
			>
				<path d="M0,0 L8,3 L0,6 L2,3 Z" fill="#042433" />
			</marker>
		</defs>

		<rect
			x={boxX}
			y={boxY}
			width={boxWidth}
			height={boxHeight}
			rx="0.3"
			fill="#ffffff"
			stroke="#042433"
			stroke-width="0.2"
		/>

		<text
			x={boxX + 0.8}
			y={boxY + 1.5}
			fill="var(--nisra_purple)"
			font-size="5"
			font-family="sans-serif"
			dominant-baseline="hanging"
			font-weight="bold"
		>
			<tspan x={boxX + 0.8} dy="0">{name}</tspan>
		</text>

		<text
			x={boxX + 0.8}
			y={boxY + 1.5}
			fill="var(--nisra_blue)"
			font-size="5"
			font-family="sans-serif"
			dominant-baseline="hanging"
		>
			<tspan x={boxX + 0.8} dy="6">Rank: {rank}</tspan>
		</text>

		<line
			x1={rankProp > 0.5 && boxWidth ? boxX + boxWidth : boxX}
			y1={boxMidY}
			x2={markerCx}
			y2={boxMidY}
			stroke="#042433"
			stroke-width="0.4"
		/>

		<line
			x1={markerCx}
			y1={boxMidY}
			x2={markerCx}
			y2={markerTopY}
			stroke="#042433"
			stroke-width="0.4"
			marker-end="url(#arrow-head)"
		/>
	{/if}
</svg>
