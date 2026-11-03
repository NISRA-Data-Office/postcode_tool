export type Bounds = [[number, number], [number, number]];
export const niBounds: Bounds = [
	[-8.1775, 54.0227],
	[-5.4328, 55.313]
];

export function cleanName(name: string) {
	return name.replaceAll('_', ' ');
}
