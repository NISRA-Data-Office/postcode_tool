import { insertHeader, insertFooter, insertHead, insertNavButtons } from "./utils/page-layout.js";
import { readData } from "./utils/read-data.js";
import { insertValue } from "./utils/insert-value.js";
import { toTitleCase } from "./utils/to-title-case.js";
import { config } from "./config/config.js";
import { postcodeSearch } from "./utils/postcode-search.js";
import { scaleChartMDM } from "./utils/scale-chart-mdm.js";
import { populateInfoBoxes } from "./utils/info-boxes.js";

window.addEventListener("DOMContentLoaded", async () => {

    await insertHead("Super Data Zone");
    insertHeader();
    insertFooter();
    postcodeSearch("postcode-search");

    const params = new URLSearchParams(window.location.search);
    const sdz = params.get("sdz");
    const postcode = params.get("postcode");

    const data = await readData(sdz);
        
    // Update headline
    const headline = document.getElementById("headline");
    headline.innerHTML = postcode ? `${postcode} is in <span class="blue-text">${data.name}</span>` : `Deprivation in <span class="blue-text">${data.name}</span>`

    insertNavButtons(data);

    const geo_description = document.getElementById("geo-description");

    geo_description.innerHTML = `
        <p class="mb-0"><span class="blue-text">${data.name}</span> is a Super Data Zone or 'neighbourhood'.</p>
        <p class="mb-0">Deprivation is calculated for these Super Data Zones.</p>
        <p><span class="blue-text">${data.name}</span> is classified as urban and is in <a href="lgd.html?lgd=${data.parents[0].code}">${data.parents[0].name}</a>.</p>
    `

    insertValue("overall-rank", data.data.ranks.mdm)
    insertValue("place-count", data.count)
    insertValue("place-name", data.name)

    scaleChartMDM("mdm-scale-chart", data);

    populateInfoBoxes(
        [
            "What is the multiple deprivation measure and when do I use it?",
            "What are the types of deprivation and when do I use them?",
            "What is a ‘neighbourhood’ or super data zone?"
        ],
        [
            "",
            "",
            ""
        ]
    )


})