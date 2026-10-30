export const title: string = 'Deprivation in Northern Ireland';
export const rateit: string = 'NI_Deprivation_tool';
export const year: number | undefined = undefined;

export const domains: { code: string; label: string; description: string }[] = [
	{
		code: 'mdm',
		label: 'Overall MDM',
		description: `<p>This is the overall measure. It is called the Multiple Deprivation Measure, or MDM. It brings together different types of deprivation.</p>`
	},
	{
		code: 'income',
		label: 'Income',
		description: `<p>This shows how many people have a low income. It includes people who are not in work and people who have a job but do not earn very much.</p><p>This makes up 25% of a neighbourhood's overall MDM score.</p>`
	},
	{
		code: 'employment',
		label: 'Employment',
		description: `<p>This shows how many working-age people are not in work when they would like to be. This may be because of illness, disability, or caring for someone else.</p><p>This makes up 25% of a neighbourhood's overall MDM score.</p>`
	},
	{
		code: 'health',
		label: 'Health and disability',
		description: `<p>This shows where people are affected by poor health. It includes the risk of dying earlier than expected and having a lower quality of life because of physical or mental health problems.</p><p>This makes up 15% of a neighbourhood's overall MDM score.</p>`
	},
	{
		code: 'education',
		label: 'Education, skills and training',
		description: `<p>This shows where people may have fewer chances to learn and build skills. It looks at children, young people, and adults.</p><p>This makes up 15% of a neighbourhood's overall MDM score.</p>`
	},
	{
		code: 'services',
		label: 'Access to services',
		description: `<p>This shows how easy it is for people to use important services. This includes getting to services in person and using services online.</p><p>This makes up 10% of a neighbourhood's overall MDM score.</p>`
	},
	{
		code: 'living',
		label: 'Living environment',
		description: `<p>This shows problems with homes and the local area. It includes whether people can get suitable homes and whether the local environment is good to live in.</p><p>This makes up 5% of a neighbourhood's overall MDM score.</p>`
	},
	{
		code: 'crime',
		label: 'Crime and disorder',
		description: `<p>This shows the risk of crime and disorder in an area. It includes crimes against people and crimes involving property.</p><p>This makes up 5% of a neighbourhood's overall MDM score.</p>`
	}
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

export const ni = { code: 'N92000002', name: 'Northern Ireland' };
export const lgds = [
	{ code: 'N09000001', name: 'Antrim and Newtownabbey' },
	{ code: 'N09000002', name: 'Armagh City, Banbridge and Craigavon' },
	{ code: 'N09000003', name: 'Belfast' },
	{ code: 'N09000004', name: 'Causeway Coast and Glens' },
	{ code: 'N09000005', name: 'Derry City and Strabane' },
	{ code: 'N09000006', name: 'Fermanagh and Omagh' },
	{ code: 'N09000007', name: 'Lisburn and Castlereagh' },
	{ code: 'N09000008', name: 'Mid and East Antrim' },
	{ code: 'N09000009', name: 'Mid Ulster' },
	{ code: 'N09000010', name: 'Newry, Mourne and Down' },
	{ code: 'N09000011', name: 'Ards and North Down' }
];
