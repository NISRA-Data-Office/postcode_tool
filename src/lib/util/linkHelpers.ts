export function getBreadcrumbLinks(data: {
	name: string;
	parents?: { name: string; code: string }[];
}) {
	let links: [
		{
			label: string;
			href?: string;
		}
	] = [{ label: 'Home', href: '/' }];
	if (data.parents) {
		const parentLinks = data.parents.map((x) => ({ label: x.name, href: `/areas/${x.code}` }));
		links.push(...parentLinks);
	}

	links.push({ label: data.name });
	return links;
}
