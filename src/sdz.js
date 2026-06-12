import { insertHeader, insertFooter, insertHead, insertNavButtons } from "./utils/page-layout.js";
import { readData } from "./utils/read-data.js";
import { insertValue } from "./utils/insert-value.js";
import { config } from "./config/config.js";
import { postcodeSearch } from "./utils/postcode-search.js";
import { getDeprivationSummary, getHeadline, getParagraph } from "./utils/deprivation-text.js";
import { scaleChartMDM } from "./utils/scale-chart-mdm.js";
import { populateInfoBoxes } from "./utils/info-boxes.js";
import { scaleChart } from "./utils/scale-chart.js";
import { insertScaleTable } from "./utils/insert-scale-table.js";
import { plotScaleMap } from "./utils/sdzScaleMap.js";
import { copySummary } from "./utils/copy-summary.js";

window.addEventListener("DOMContentLoaded", async () => {

    await insertHead("Super Data Zone");
    insertHeader();
    insertFooter();
    postcodeSearch("postcode-search");
        
    
    async function update_sdz({ animate = true } = {}) {
      const params = new URLSearchParams(window.location.search);
    
      if (params.size === 0) {
        window.location.pathname = "/";
        return;
      }
    
      const sdz = params.get("sdz");
      const data = await readData(sdz);
      document.getElementsByTagName("title")[0].textContent = `Deprivation in ${data.name}`;

      const headline = document.getElementById("headline");
      headline.innerHTML = `Deprivation in <span class="blue-text">${data.name}</span>`;

      const geo_description = document.getElementById("geo-description");

      geo_description.innerHTML = `
        <p class="mb-0"><span class="blue-text">${data.name}</span> is a Super Data Zone or 'neighbourhood'.</p>
        <p class="mb-0">Deprivation is calculated for these Super Data Zones.</p>
        <p><span class="blue-text">${data.name}</span> is classified as ${data.data.urban_rural} and is in <a href="lgd.html?lgd=${data.parents[0].code}">${data.parents[0].name}</a>.</p>
     `
    
      insertNavButtons(data);
      insertValue("place-name", data.name);
      insertValue("overall-rank", data.data.ranks.mdm)
      insertValue("place-count", data.count)
    
      await plotScaleMap("scale-map", data, { animate });

    const deprivation_headline = document.getElementById("deprivation-headline");
    deprivation_headline.innerHTML = getHeadline(data.data.ranks, data.count)

    const deprivation_paragraph = document.getElementById("deprivation-paragraph");
    deprivation_paragraph.innerHTML = getParagraph(data.data.ranks, data.count, Math.round(data.data.ranks.mdm/data.count * 100), data.name)

    const deprivation_summary = document.getElementById("deprivation-summary")
    deprivation_summary.innerHTML = getDeprivationSummary(
        data.data.ranks,
        data.count,
        data.name,
        getHeadline(data.data.ranks, data.count),
        getParagraph(data.data.ranks, data.count, Math.round(data.data.ranks.mdm/data.count * 100), data.name)
    )

    scaleChartMDM("mdm-scale-chart", data);

    insertScaleTable("deprivation-scales", data);

    }
    
    window.addEventListener("popstate", () => update_sdz({ animate: true }));
    window.addEventListener("sdzchange", () => update_sdz({ animate: true }));

   

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

    copySummary();
    await update_sdz({ animate: false });

})