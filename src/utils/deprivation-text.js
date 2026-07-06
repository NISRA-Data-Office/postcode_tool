import { config } from "../config/config.js";

export function getHeadline(data) {

    const mdm = data.data.ranks.mdm;
    const count = data.count;

    if (mdm === 1) return " is more deprived than all neighbourhoods in Northern Ireland.";
    if (mdm >= 2 && mdm <= count * 0.5) return " is more deprived than most neighbourhoods in Northern Ireland.";
    if (mdm >= count * 0.5 && mdm < count * 0.6) return " is ranked around the middle for deprivation in Northern Ireland.";
    if (mdm >= count * 0.6 && mdm < count) return " is less deprived than most neighbourhoods in Northern Ireland.";
    if (mdm === count) return " is less deprived than all neighbourhoods in Northern Ireland.";
}

export function getParagraph(data) {

  const mdm = data.data.ranks.mdm;
  const count = data.count;
  const percent = Math.round(data.data.ranks.mdm/data.count * 100);
  const name = data.name;

  const placeName = `<span class="text-purple fw-bold">${name}</span>`;

  if (mdm === 1) return `No neighbourhoods in Northern Ireland are more deprived than ${placeName}.`;
  if (mdm >= 2 && mdm < count * 0.015) return `Fewer than 1% of neighbourhoods are more deprived than ${placeName}.`;
  if (mdm < count * 0.1) return `Only ${percent}% of neighbourhoods are more deprived than ${placeName}.`;
  if (mdm< count * 0.2) return `${100 - percent}% of neighbourhoods are less deprived than ${placeName}.`;
  if (mdm < count * 0.3) return `About three quarters of neighbourhoods are less deprived than ${placeName}.`;
  if (mdm < count * 0.4) return `About two thirds of neighbourhoods are more deprived than ${placeName}.`;
  if (mdm < count * 0.5) return `Just under half (${percent}%) of neighbourhoods are more deprived than ${placeName}.`;
  if (mdm < count * 0.6) return `Just over half (${percent}%) of neighbourhoods are more deprived than ${placeName}.`;
  if (mdm < count * 0.7) return `About two thirds of neighbourhoods are more deprived than ${placeName}.`;
  if (mdm < count * 0.8) return `About three quarters of neighbourhoods are more deprived than ${placeName}.`;
  if (mdm < count * 0.9) return `${percent}% of neighbourhoods are more deprived than ${placeName}.`;
  if (mdm < count * 0.99) return `Only ${100 - percent}% of neighbourhoods are less deprived than ${placeName}.`;
  if (mdm < count) return `Fewer than 1% of neighbourhoods are less deprived than ${placeName}.`;
  if (mdm === count) return `All neighbourhoods are more deprived than ${placeName}.`;
}

export function getDeprivationSummary(id, data) {

  const ranks = data.data.ranks;
  const count = data.count;
  const name = data.name;
  const headlineText = getHeadline(data);
  const paragraphText = getParagraph(data)

  let summary_text = `
    <h4>
      The overall deprivation rank of 
      <span class="text-purple fw-bold">
        ${name}
      </span>
      is 
      <span>
        ${ranks.mdm}
      </span>
      out of ${count} neighbourhoods.
    </h4>

    <p class="mb-0">Rank 1 is the most deprived neighbourhood and rank 850 is the least deprived.</p>
    
    <p class="mb-0"><span class="text-purple fw-bold">${name}</span>${headlineText}</p>

    <p class="mb-0">${paragraphText}</p>
    
    <ul class="deprivation-headline">
  `

   const rank_keys = Object.keys(data.data.ranks)
    .filter((x) => x != "mdm");

  for (let i = 0; i < rank_keys.length; i ++) {
    summary_text += `
      <li>
        <strong>${config.deprivation_types[rank_keys[i]].title}:</strong> 
        <span class="text-purple fw-bold">${name}</span> is ranked 
        <strong>${ranks[rank_keys[i]]}</strong> out of ${count} neighbourhoods.
      </li>
    `
  }

  summary_text += `</ul>`

  document.getElementById(id).innerHTML = summary_text;

}

export function lgdDeprivationSummary(id, data, type) {
  
  const place = data;
  const deprivation_type = "mdm";
  const children = Object.entries(place.data?.ranks || {}).map(([code, item]) => ({
    code,
    name: item.name,
    rank: item.ranks?.[deprivation_type]
  }));

  const valid = children.filter(d => d.rank != null);
  const sorted = valid.sort((a, b) => a.rank - b.rank);

  const mostDeprived = sorted[0];
  const leastDeprived = sorted[sorted.length - 1];
  
  const maxRank = Math.max(...valid.map(d => d.rank));
  const topMostCount = valid.filter(d => d.rank <= 100).length;

  document.getElementById(id).innerHTML = `
      <p>
        Levels of deprivation and disadvantage vary widely across councils and across Northern Ireland.
      </p>
      <p>
        There are ${children.length} super data zones in <span class="text-purple fw-bold">${place.name}</span>. 
        The most deprived neighbourhood is <span class="text-purple fw-bold">${mostDeprived?.name}</span>
        and the least deprived is <span class="text-purple fw-bold">${leastDeprived?.name}</span>.
      </p>

      <p>
        <span class="text-purple fw-bold">${place.name}</span> contains ${topMostCount} of the 100 most deprived neighbourhoods in Northern Ireland.
      </p>
  `;
}

export function updateComparisonText(diff, currentSelectedName, hoveredName, clickedSdz = false, onMouseLeave = false, type) {
  const el = document.getElementById("comparison-text");
  if (!el) return;
  
  const hoveredStyled = `<span style="color:#BA3CBE;"><strong>${hoveredName}</strong></span>`;
  const selectedStyled = `<span style="color:#D4351C;"><strong>${currentSelectedName}</strong></span>`;

  let text;

  if (clickedSdz == true || onMouseLeave == true) {
    text = `Hover over on an area to compare deprivation with ${selectedStyled}`;
    el.innerHTML = text;
    return;
  }

  if (Math.abs(diff) <= 85) {
    text = `${hoveredStyled} has a similar deprivation ranking to ${selectedStyled}`;
  } 
  else if (diff > 0) {
    text = `${hoveredStyled} is less deprived than ${selectedStyled}`;
  } 
  else {
    text = `${hoveredStyled} is more deprived than ${selectedStyled}`;
  }

  if (type != "mdm") {
    text += ` in ${config.deprivation_types[type].title.toLowerCase()}.`;
  }
  

  el.innerHTML = text;
}