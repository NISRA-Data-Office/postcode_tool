import { readData } from "./read-data.js";
import { postcode_data } from "./postcode-search.js";
import { insertNavButtons } from "./page-layout.js";
import { insertValue } from "./insert-value.js";
import { plotNavMap } from "./plot-nav-map.js";
import { getHeadline, getParagraph, getDeprivationSummary } from "./deprivation-text.js";
import { scaleChart } from "./scale-chart.js";
import { insertScaleTable } from "./insert-scale-table.js";
import { populateNextStepBoxes } from "./next-steps.js";
import { copySummary } from "./copy-summary.js";

export async function updateSDZ({ animate = true } = {}) {

    const params = new URLSearchParams(window.location.search);

    if (params.size === 0) {
    window.location.replace("./");
    return;
    }

    const sdz = params.get("sdz");
    const postcode = params?.get("postcode");
    const data = await readData(sdz);
    if (!data) {
    window.location.replace("./");
    return;
    }

    const headline = document.getElementById("headline");
    const page_title = document.getElementsByTagName("title")[0];

    const valid_postcode = postcode_data[sdz].codes.includes(postcode);

    if (valid_postcode) {
    headline.innerHTML =`How deprived is ${postcode}?`;
    page_title.textContent = `Deprivation in ${postcode}`;
    } else {
    window.history.replaceState(
        {},
        "",
        `sdz.html?sdz=${encodeURIComponent(sdz)}`
    )
    headline.innerHTML = `How deprived is ${data.name}?`;
    page_title.textContent = `Deprivation in ${data.name}?`;
    }

    const geo_description = document.getElementById("geo-description");

    geo_description.innerHTML = `
    <p><span class="text-blue">${data.name}</span> is a Super Data Zone or 'neighbourhood'.</p>
    <p class="mt-auto">Deprivation is calculated for these neighbourhoods.</p>
    <p class="mt-auto"><span class="text-blue">${data.name}</span> is classified as ${data.data.urban_rural} and is in <a style="color: var(--nisra_blue);" href="area.html?code=${data.parents[0].code}" title="View deprivation profile for ${data.parents[0].name}">${data.parents[0].name}</a>.</p>`
    
    insertNavButtons(data);
    insertValue("place-name", data.name);
    insertValue("overall-rank", data.data.ranks.mdm)
    insertValue("place-count", data.count)
    
    await plotNavMap("nav-map", data, { animate });

    document.getElementById("deprivation-headline").innerHTML = getHeadline(data);

    document.getElementById("deprivation-paragraph").innerHTML = getParagraph(data)

    document.getElementById("deprivation-summary").innerHTML = getDeprivationSummary(data);

    scaleChart("mdm-scale-chart", data, "mdm", {
      labels: "below",
      annotation: true
    });

    insertScaleTable("deprivation-scales", data);

    populateNextStepBoxes(data);

    copySummary(data);

}