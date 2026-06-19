import { insertHeader, insertFooter, insertHead, insertNavButtons } from "./utils/page-layout.js";
import { readData } from "./utils/read-data.js";
import { config } from "./config/config.js";
import { lgdMenu } from "./utils/lgd-menu.js";
import { postcodeSearch } from "./utils/postcode-search.js";
import { typeSelect } from "./utils/type-select.js";
import { populateInfoBoxes } from "./utils/info-boxes.js";
import { insertValue } from "./utils/insert-value.js";
import { plotScaleMap } from "./utils/plotScaleMap.js";
import { createLGDTable } from "./utils/lgd-table.js";
import { scaleChart } from "./utils/scale-chart.js";
import { lgdDeprivationSummary } from "./utils/deprivation-text.js";
import { copySummary } from "./utils/copy-summary.js";
import { goStart, handleOnScroll } from "./utils/scroll-button.js";
import { sharePage } from "./utils/share-page.js";

let type_select;

window.addEventListener("DOMContentLoaded", async () => {
  await insertHead("Local Government District");
  insertHeader();
  insertFooter();
  postcodeSearch("postcode-search");

  populateInfoBoxes(
    [
      "What is the multiple deprivation measure and when do I use it?",
      "What are the types of deprivation and when do I use them?",
      "What is a ‘neighbourhood’ or super data zone?"
    ],
    ["",
     "",
    "Neighbourhoods are small areas called Super Data Zones (SDZ).They have an average population of 2,270 people."]
  );

  typeSelect("type-select");

  type_select = document.getElementById("type-select");

  copySummary();

  await update_lgd({ animate: false });

  handleOnScroll();
  const scrollBtn = document.getElementById("scroll-btn");
  scrollBtn.addEventListener("click", goStart);
});

async function update_lgd({ animate = true } = {}) {
  const params = new URLSearchParams(window.location.search);

  if (params.size === 0) {
    window.location.pathname = "/";
    return;
  }

  lgdMenu("lgd-select");

  const lgd = params.get("lgd");
  const sdz = params?.get("sdz");
  const data = await readData(lgd);
  document.getElementsByTagName("title")[0].textContent = `Deprivation in ${data.name}`;

  insertNavButtons(data);
  insertValue("place-name", data.name);

  insertValue(
    "deprivation-type",
    config.deprivation_types[type_select.value].toLowerCase()
  );

  await plotScaleMap("scale-map", data, type_select.value, { animate,
    highlightSdz: sdz
   });
    insertValue("place-name", data.name)
    
    scaleChart("lgd-scale-chart", data, type_select.value, "below", false);
    
    const lgdTableContainer = document.getElementById("lgd-table-container");
    createLGDTable(lgdTableContainer, data, type_select.value, sdz);

    type_select.addEventListener("change", () => {
      const params = new URLSearchParams(window.location.search);
      const sdz = params.get("sdz");

        insertValue("deprivation-type", config.deprivation_types[type_select.value].toLowerCase());
        plotScaleMap("scale-map", data, type_select.value, {
          highlightSdz: sdz,
          preserveView: true
        })
        scaleChart("lgd-scale-chart", data, type_select.value, "below", false);
        createLGDTable(lgdTableContainer, data, type_select.value)
    });
  
    const summaryContainer = document.getElementById("summary");

    summaryContainer.innerHTML = lgdDeprivationSummary(data, type_select.value);

    const copyBtn = document.getElementById("copy-summary");

    if (copyBtn) {
      copyBtn.setAttribute(
        "aria-label",
        `Copy deprivation summary for ${data.name} to clipboard`
      );
    }
}

window.addEventListener("popstate", () => update_lgd({ animate: true }));
window.addEventListener("lgdchange", () => update_lgd({ animate: true }));