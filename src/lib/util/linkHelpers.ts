export function getBreadcrumbLinks(data) {
	const currentPage = { label: data.name, href: null };
	const parents = data.parents;
	const parentLinks = parents.map((x) => ({ label: x.name, href: `/areas/${x.code}` }));
	return [{ label: 'home', href: '/' }, ...parentLinks, currentPage];
}
