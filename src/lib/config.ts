export const title: string = 'Deprivation in Northern Ireland';
export const rateit: string = 'NI_Deprivation_tool';
export const year: number | undefined = undefined;

export const domains: { code: string; label: string }[] = [
	{ code: 'mdm', label: 'Overall MDM' },
	{ code: 'income', label: 'Income' },
	{ code: 'employment', label: 'Employment' },
	{ code: 'health', label: 'Health and disability' },
	{ code: 'education', label: 'Education, skills and training' },
	{ code: 'services', label: 'Access to services' },
	{ code: 'living', label: 'Living environment' },
	{ code: 'crime', label: 'Crime and disorder' }
];

export const colourPalette: string[] = [
	'#00205B',
	'#385384',
	'#7086AD',
	'#A8B8D6',
	'#E0EBFF',
	'#EEFBE0',
	'#CDE5B0',
	'#ABD07F',
	'#8ABA4F',
	'#68A41E'
];
