export function headline(mdmRank: number, count: number, percent: number) {
	if (mdmRank === 1) {
		return `is more deprived than all neighbourhoods in Northern Ireland.`;
	} else if (percent < 0.5) {
		return `is more deprived than most neighbourhoods in Northern Ireland.`;
	} else if (percent < 0.6) {
		return `is ranked around the middle for deprivation in Northern Ireland.`;
	} else if (mdmRank < count) {
		return `is less deprived than most neighbourhoods in Northern Ireland.`;
	} else if (mdmRank === count) {
		return `is less deprived than all neighbourhoods in Northern Ireland.`;
	}
}

export function paragraph(mdmRank: number, count: number, percent: number) {
	const percentDisplay = Math.round(100 * percent);
	const percentInvDisplay = Math.round(100 * (1 - percent));

	if (mdmRank === 1) {
		return 'No neighbourhoods in Northern Ireland are more deprived than';
	} else if (percent < 0.01) {
		return 'Fewer than 1% of neighbourhoods in Northern Ireland are more deprived than';
	} else if (percent < 0.1) {
		return 'Only 1% of neighbourhoods in Northern Ireland are more deprived than';
	} else if (percent <= 0.2) {
		return 'About 10% of neighbourhoods in Northern Ireland are more deprived than';
	} else if (percent <= 0.3) {
		return 'About three quarters of neighbourhoods in Northern Ireland are less deprived than';
	} else if (percent <= 0.4) {
		return 'About two thirds of neighbourhoods in Northern Ireland are less deprived than';
	} else if (percent < 0.5) {
		return `Just under half (${percentDisplay}%) of neighbourhoods in Northern Ireland are more deprived than`;
	} else if (percent == 0.5) {
		return 'Half of neighbourhoods in Northern Ireland are more deprived than';
	} else if (percent <= 0.6) {
		return `Just over half (${percentDisplay}%) of neighbourhoods in Northern Ireland are more deprived than`;
	} else if (percent <= 0.7) {
		return 'About two thirds of neighbourhoods in Northern Ireland are more deprived than';
	} else if (percent <= 0.8) {
		return 'About three quarters of neighbourhoods in Northern Ireland are more deprived than';
	} else if (percent <= 0.9) {
		return `${percentDisplay}% of neighbourhoods in Northern Ireland are more deprived than`;
	} else if (percent <= 0.99) {
		return `Only ${percentInvDisplay}% of neighbourhoods in Northern Ireland are less deprived than`;
	} else if (percent < 1) {
		return 'Fewer than 1% of neighbourhoods in Northern Ireland are less deprived than';
	} else if (mdmRank === count) {
		return `All neighbourhoods in Northern Ireland are more deprived than`;
	}
}
