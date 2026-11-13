const API_URL = 'https://ws-data.nisra.gov.uk/public/api.jsonrpc';

type Dimension = { [key: string]: { category: { index: string[] } } };

export type Query = {
	id?: string[];
	dimension?: Dimension;
};

type Data = {
	jsonrpc: string;
	method: string;
	params: {
		class: string;
		id: string[];
		dimension: Dimension;
		extension: {
			pivot: null;
			codes: boolean;
			language: { code: string };
			format: { type: string; version: string | number };
			matrix: string;
		};
		version: string;
	};
};

export function downloadDataset(
	dataset: string,
	fileName: string,
	fileType: 'csv' | 'xlsx',
	query?: Query
) {
	let url = new URL(API_URL);
	let data: Data = {
		jsonrpc: '2.0',
		method: 'PxStat.Data.Cube_API.ReadDataset',
		params: {
			class: 'query',
			id: [],
			dimension: {},
			extension: {
				pivot: null,
				codes: false,
				language: {
					code: 'en'
				},
				format: {
					type: fileType.toUpperCase(),
					version: fileType === 'xlsx' ? 2007 : '1.0'
				},
				matrix: dataset
			},
			version: '2.0'
		}
	};

	if (query && query.id) {
		data.params.id = query.id;
	}

	if (query && query.dimension) {
		data.params.dimension = query.dimension;
	}

	// use post instead of get to avoid url getting too long
	fetch(url, {
		method: 'POST',
		body: JSON.stringify(data)
	})
		.then((response) => response.json())
		.then((data) => {
			if (fileType === 'xlsx') {
				const res = data['result'];
				const parts = res.split(';base64,');
				const mimeType = parts[0].substring(5);
				const fileData = Uint8Array.fromBase64(parts[1]);
				download(fileName, fileData, fileType, mimeType);
			} else {
				const res = data['result'];
				const mimeType = 'text/csv';
				download(fileName, res, fileType, mimeType);
			}
		});
}

export function download(
	fileName: string,
	fileData: BlobPart,
	fileExtension: string,
	mimeType: string
) {
	const data = new Blob([fileData], { type: mimeType });
	const downloadUrl = URL.createObjectURL(data);
	const a = document.createElement('a');
	a.href = downloadUrl;
	a.download = `${fileName}.${fileExtension}`;
	a.click();
}
