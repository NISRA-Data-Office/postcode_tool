export function cleanPostcode(postcode: string): string {
	let out = postcode.toUpperCase();
	out = out.replaceAll(/\s+/g, ' ');
	out = out.trim();
	if (out.charAt(out.length - 3) != ' ') {
		out = out.slice(0, -3) + ' ' + out.slice(-3);
	}
	return out;
}

export function isPostcode(postcode: string): boolean {
	let pc = postcode.trim().replaceAll(/\s+/g, '').toLowerCase();
	let pcRe = /^bt\d{2,3}\w{2}$/;
	return pcRe.test(pc);
}
