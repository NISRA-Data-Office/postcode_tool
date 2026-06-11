

export function getHeadline(rank, count) {
    if (rank.mdm === 1) return " is more deprived than all neighbourhoods in Northern Ireland.";
    if (rank.mdm >= 2 && rank.mdm <= count * 0.5) return " is more deprived than most neighbourhoods in Northern Ireland.";
    if (rank.mdm >= count * 0.5 && rank.mdm < count * 0.6) return " is ranked around the middle for deprivation in Northern Ireland.";
    if (rank.mdm >= count * 0.6 && rank.mdm < count) return " is less deprived than most neighbourhoods in Northern Ireland.";
    if (rank.mdm === count) return " is less deprived than all neighbourhoods in Northern Ireland.";
}

export function getParagraph(rank, count, percent, name) {
    const placeName = `<span style="color:var(--nisra_blue)">${name}</span>`;

    if (rank.mdm === 1) return `No neighbourhoods in Northern Ireland are more deprived than ${placeName}.`;
    if (rank.mdm >= 2 && rank.mdm < count * 0.015) return `Fewer than 1% of neighbourhoods are more deprived than ${placeName}.`;
    if (rank.mdm < count * 0.1) return `Only ${percent}% of neighbourhoods are more deprived than ${placeName}.`;
    if (rank.mdm< count * 0.2) return `${100 - percent}% of neighbourhoods are less deprived than ${placeName}.`;
    if (rank.mdm < count * 0.3) return `About three quarters of neighbourhoods are less deprived than ${placeName}.`;
    if (rank.mdm < count * 0.4) return `About two thirds of neighbourhoods are more deprived than ${placeName}.`;
    if (rank.mdm < count * 0.5) return `Just under half (${percent}%) of neighbourhoods are more deprived than ${placeName}.`;
    if (rank.mdm < count * 0.6) return `Just over half (${percent}%) of neighbourhoods are more deprived than ${placeName}.`;
    if (rank.mdm < count * 0.7) return `About two thirds of neighbourhoods are more deprived than ${placeName}.`;
    if (rank.mdm < count * 0.8) return `About three quarters of neighbourhoods are more deprived than ${placeName}.`;
    if (rank.mdm < count * 0.9) return `${percent}% of neighbourhoods more deprived than ${placeName}.`;
    if (rank.mdm < count * 0.99) return `Only ${100 - percent}% of neighbourhoods are less deprived than ${placeName}.`;
    if (rank.mdm < count) return `Fewer than 1% of neighbourhoods are less deprived than ${placeName}.`;
    if (rank.mdm === count) return `All neighbourhoods are more deprived than ${placeName}.`;
  }