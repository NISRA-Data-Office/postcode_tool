import fs from 'fs/promises';
import path from 'path';
import type { PageLoad, EntryGenerator } from './$types';
import { asset } from '$app/paths';

export const entries: EntryGenerator = async () => {
	const dataPath = path.resolve('static/public/data');
	const files = await fs.readdir(dataPath);
	return files.map((file) => {
		const parseFileName = file.split('.');
		const fileName = parseFileName.slice(0, parseFileName.length - 1).join('');
		return { code: fileName };
	});
};

export const load: PageLoad = async ({ params, fetch }) => {
	let code = params.code;
	let resp = await fetch(asset(`public/data/${code}.json`));
	return resp.json();
};
