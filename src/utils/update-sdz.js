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
        headline.innerHTML = `How deprived is <span class="text-purple">${data.name}</span>?`;
        page_title.textContent = `Deprivation in ${data.name}`;
    }

    const geo_description = document.getElementById("geo-description");

    geo_description.innerHTML = `
        <p>${valid_postcode ? `<strong>${postcode}</strong> is in ` : ``} <span class="text-purple fw-bold">${data.name}</span>${valid_postcode ? ", " : " is"} a Super Data Zone, in <a class="text-blue" href="area.html?code=${data.parents[0].code} "title="View deprivation profile for ${data.parents[0].name}"> ${data.parents[0].name}</a>.</p>
        <p>Super Data Zones - referred to here as 'neighbourhoods' - have an average population of 2,240 people.
    `
 
    insertNavButtons(data);
    
    insertValue("place-name", data.name);
    
    // insertValue("deprivation-place-name", data.name)
    insertValue("overall-rank", data.data.ranks.mdm)
    insertValue("place-count", data.count)
    
    await plotNavMap("nav-map", data, { animate });

    document.getElementById("deprivation-headline").innerHTML = getHeadline(data);

    document.getElementById("deprivation-paragraph").innerHTML = getParagraph(data)

    getDeprivationSummary("deprivation-summary", data);

    scaleChart("mdm-scale-chart", data, "mdm", {
      labels: "below",
      annotation: true
    });

    insertScaleTable("deprivation-scales", data);

    populateNextStepBoxes(data);

    copySummary(data);

}