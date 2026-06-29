import { insertHeader, insertFooter, insertHead, insertNavButtons } from "./utils/page-layout.js";
import { readData } from "./utils/read-data.js";
import { insertValue } from "./utils/insert-value.js";
import { config } from "./config/config.js";
import { postcodeSearch, postcode_data } from "./utils/postcode-search.js";
import { getDeprivationSummary, getHeadline, getParagraph } from "./utils/deprivation-text.js";
import { scaleChart } from "./utils/scale-chart.js";
import { populateInfoBoxes } from "./utils/info-boxes.js";
import { insertScaleTable } from "./utils/insert-scale-table.js";
import { plotNavMap } from "./utils/plot-nav-map.js";
import { copySummary } from "./utils/copy-summary.js";
import { handleOnScroll } from "./utils/scroll-button.js";
import { sharePage } from "./utils/share-page.js";
import { populateNextStepBoxes } from "./utils/next-steps.js";

window.addEventListener("DOMContentLoaded", async () => {

  
    await insertHead("Super Data Zone");
    await postcodeSearch("postcode-search", "Enter another postcode");
    await update_sdz({ animate: false });
    insertHeader();
    insertFooter();
    
    populateInfoBoxes() 
    handleOnScroll();   

})

async function update_sdz({ animate = true } = {}) {
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
        headline.innerHTML =`${postcode} is in <span class="text-blue">${data.name}</span>`;
        page_title.textContent = `Deprivation in ${postcode}`;
      } else {
        window.history.replaceState(
          {},
          "",
          `sdz.html?sdz=${encodeURIComponent(sdz)}`
        )
        headline.innerHTML = `Deprivation in <span class="text-blue">${data.name}</span>`;
        page_title.textContent = `Deprivation in ${data.name}`;
      }

      const geo_description = document.getElementById("geo-description");

      geo_description.innerHTML = `
        <p><span class="text-blue">${data.name}</span> is a Super Data Zone or 'neighbourhood'.</p>
        <p class="mt-auto">Deprivation is calculated for these neighbourhoods.</p>
        <p class="mt-auto"><span class="text-blue">${data.name}</span> is classified as ${data.data.urban_rural} and is in <a style="color: var(--nisra_blue);" href="lgd.html?lgd=${data.parents[0].code}" title="View deprivation profile for ${data.parents[0].name}">${data.parents[0].name}</a>.</p>`
    
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

window.addEventListener("popstate", () => update_sdz({ animate: true }));
window.addEventListener("sdzchange", () => update_sdz({ animate: true }));