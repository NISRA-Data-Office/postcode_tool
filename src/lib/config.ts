export const title: string = 'Deprivation in Northern Ireland';
export const rateit: string = 'NI_Deprivation_tool';
export const year: number | undefined = undefined;

export const domains: { code: string; label: string; description: string[]; statistic: string }[] =
	[
		{
			code: 'mdm',
			label: 'Overall MDM',
			description: [
				'This is the overall measure. It is called the Multiple Deprivation Measure, or MDM. It brings together different types of deprivation.'
			],
			statistic: '1'
		},
		{
			code: 'income',
			label: 'Income',
			description: [
				'This shows how many people have a low income. It includes people who are not in work and people who have a job but do not earn very much.',
				"This makes up 25% of a neighbourhood's overall MDM score."
			],
			statistic: '2'
		},
		{
			code: 'employment',
			label: 'Employment',
			description: [
				'This shows how many working-age people are not in work when they would like to be. This may be because of illness, disability, or caring for someone else.',
				"This makes up 25% of a neighbourhood's overall MDM score."
			],
			statistic: '4'
		},
		{
			code: 'health',
			label: 'Health and disability',
			description: [
				'This shows where people are affected by poor health. It includes the risk of dying earlier than expected and having a lower quality of life because of physical or mental health problems.',
				"This makes up 15% of a neighbourhood's overall MDM score."
			],
			statistic: '6'
		},
		{
			code: 'education',
			label: 'Education, skills and training',
			description: [
				'This shows where people may have fewer chances to learn and build skills. It looks at children, young people, and adults.',
				"This makes up 15% of a neighbourhood's overall MDM score."
			],
			statistic: '7'
		},
		{
			code: 'services',
			label: 'Access to services',
			description: [
				'This shows how easy it is for people to use important services. This includes getting to services in person and using services online.',
				"This makes up 10% of a neighbourhood's overall MDM score."
			],
			statistic: '8'
		},
		{
			code: 'living',
			label: 'Living environment',
			description: [
				'This shows problems with homes and the local area. It includes whether people can get suitable homes and whether the local environment is good to live in.',
				"This makes up 5% of a neighbourhood's overall MDM score."
			],
			statistic: '9'
		},
		{
			code: 'crime',
			label: 'Crime and disorder',
			description: [
				'This shows the risk of crime and disorder in an area. It includes crimes against people and crimes involving property.',
				"This makes up 5% of a neighbourhood's overall MDM score."
			],
			statistic: '10'
		},
		{
			code: 'idac',
			label: 'Income deprivation affecting children',
			description: [
				'This shows the proportion of the population aged 15 and under living in low income households.'
			],
			statistic: '13'
		},
		{
			code: 'idap',
			label: 'Income deprivation affecting older people',
			description: [
				'This shows the proportion of the population aged 65 and over living in low income households.'
			],
			statistic: '15'
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

export const datasetId: string = 'NIMDM17T2';
