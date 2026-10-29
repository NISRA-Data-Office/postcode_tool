export function getBreadcrumbLinks(data) {
	let links: {
		label: string;
		href?: string;
	}[] = [{ label: 'Home', href: '/' }];
	if (data.parents) {
		const parentLinks = data.parents.map((x) => ({ label: x.name, href: `/areas/${x.code}` }));
		links.push(...parentLinks);
	}

	links.push({ label: data.name });
	return links;
}
