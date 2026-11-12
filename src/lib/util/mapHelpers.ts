import { colourPalette, domains } from '#lib/config.ts';

export type Bounds = [[number, number], [number, number]];
export const niBounds: Bounds = [
	[-8.1775, 54.0227],
	[-5.4328, 55.313]
];

export function cleanName(name: string) {
	return name.replaceAll('_', ' ');
}

function rankToFill(rank: number, maxRank: number, palette: string[]) {
	const pctRank = (rank - 1) / maxRank;
	return palette[Math.floor(pctRank * palette.length)];
}

export function prepAreaFeatures(areaData, rankData, idProp, nameProp) {
	const areaCount = areaData.features.length;

	areaData.features = areaData.features.map((feat) => {
		let id = feat.properties[idProp];
		let colours: { [key: string]: string } = {};
		let ranks = rankData[id].ranks;
		domains.forEach((domain) => {
			colours[`fill-${domain.code}`] = rankToFill(ranks[domain.code], areaCount, colourPalette);
		});

		return {
			...feat,
			properties: {
				...feat.properties,
				...ranks,
				...colours,
				label: cleanName(feat.properties[nameProp]),
				hoverColour: '',
				highlight: false
			}
		};
	});

	return areaData;
}

export function clipBounds(bounds: Bounds, maxBounds: Bounds): Bounds {
	let [[s, w], [n, e]] = bounds;
	let [[sMax, wMax], [nMax, eMax]] = maxBounds;
	
	return [
		[Math.max(s, sMax), Math.max(w, wMax)],
		[Math.min(n, nMax), Math.min(e, eMax)]
	];
}
