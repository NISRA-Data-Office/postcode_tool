

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

export function getDeprivationSummary(rank, count, name, headlineText = "", paragraphText = "") {
  return `
    <h4>
      The overall deprivation rank of 
      <span style="color: var(--nisra_blue);">
        ${name}
      </span>
      is 
      <span>
        ${rank.mdm}
      </span>
      out of ${count} neighbourhoods.
    </h4>

    <span style="color:var(--nisra_blue)">
      ${name}
    </span>
    ${headlineText}
    <br style="margin-bottom:20px">
    ${paragraphText}
    <br>
    
    <ul class="deprivation-headline" style="text-align:left;margin-bottom:5px; margin-top:5px">
      <li>
        <strong>Income:</strong>
        <span style="color:var(--nisra_blue)">${name}</span>
        is ranked <strong>${rank.income}</strong>
        out of ${count} neighbourhoods for income deprivation.
      </li>

      <li>
        <strong>Employment:</strong>
        <span style="color:var(--nisra_blue)">${name}</span>
        is ranked <strong>${rank.employment}</strong>
        out of ${count} neighbourhoods for employment deprivation.
      </li>

      <li>
        <strong>Health:</strong>
        <span style="color:var(--nisra_blue)">${name}</span>
        is ranked <strong>${rank.health}</strong>
        out of ${count} neighbourhoods for health and disability deprivation.
      </li>

      <li>
        <strong>Education:</strong>
        <span style="color:var(--nisra_blue)">${name}</span>
        is ranked <strong>${rank.education}</strong>
        out of ${count} neighbourhoods for education skill and training deprivation.
      </li>

      <li>
        <strong>Services:</strong>
        <span style="color:var(--nisra_blue)">${name}</span>
        is ranked <strong>${rank.services}</strong>
        out of ${count} neighbourhoods for access to services deprivation.
      </li>

      <li>
        <strong>Environment:</strong>
        <span style="color:var(--nisra_blue)">${name}</span>
        is ranked <strong>${rank.living}</strong>
        out of ${count} neighbourhoods for environmental deprivation.
      </li>

      <li>
        <strong>Crime and disorder:</strong>
        <span style="color:var(--nisra_blue)">${name}</span>
        is ranked <strong>${rank.crime}</strong>
        out of ${count} neighbourhoods for crime deprivation.
      </li>
    </ul>
  `;
}