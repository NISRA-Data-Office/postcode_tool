import { insertHeader, insertFooter, insertHead, insertNavButtons } from "./utils/page-layout.js";
import { readData } from "./utils/read-data.js";
import { config } from "./config/config.js";
import { lgdMenu, lgd_codes } from "./utils/lgd-menu.js";
import { postcodeSearch } from "./utils/postcode-search.js";
import { typeSelect } from "./utils/type-select.js";
import { populateInfoBoxes } from "./utils/info-boxes.js";
import { insertValue } from "./utils/insert-value.js";
import { plotScaleMap } from "./utils/plot-scale-map.js";
import { createLGDTable } from "./utils/lgd-table.js";
import { scaleChart } from "./utils/scale-chart.js";
import { lgdDeprivationSummary } from "./utils/deprivation-text.js";
import { copySummary } from "./utils/copy-summary.js";
import { handleOnScroll } from "./utils/scroll-button.js";
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

  await update_lgd({ animate: false });

  handleOnScroll();

});

async function update_lgd({ animate = true } = {}) {
  const params = new URLSearchParams(window.location.search);

  if (params.size === 0) {
    window.location.pathname = "/";
    return;
  }

  await lgdMenu("lgd-select");

  const lgd = params.get("lgd");

   if (!lgd_codes.includes(lgd)) {
    window.location.pathname = "/";
    window.location.search = "";
    return;
  }

  const sdz = params?.get("sdz");
  const data = await readData(lgd);

  if (!Object.keys(data.data.ranks).includes(sdz) & sdz != null) {
    window.location.search = `lgd=${lgd}`;
  }
 
  document.getElementsByTagName("title")[0].textContent = `Deprivation in ${data.name}`;

  insertNavButtons(data);
  insertValue("place-name", data.name);

  if (sdz) {
    insertValue("sdz-name", data.data.ranks[sdz].name);

    document.getElementById("in-focus").classList.add("is-open");
    document.getElementById("focus-link").href = `/sdz.html?sdz=${sdz}`;
  
  }

  insertValue(
    "deprivation-type",
    config.deprivation_types[type_select.value].toLowerCase()
  );

  await plotScaleMap("scale-map", data, type_select.value, { animate,
    highlightSdz: sdz,
    enableComparison: false
   });

  insertValue("place-name", data.name)
    
  scaleChart("lgd-scale-chart", data, type_select.value, {
    labels: "below",
    marker: false
  });

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
        scaleChart("lgd-scale-chart", data, type_select.value, {
          labels: "below",
          marker: false
        });
        createLGDTable(lgdTableContainer, data, type_select.value, sdz)
    });
  
    const summaryContainer = document.getElementById("summary");

    summaryContainer.innerHTML = lgdDeprivationSummary(data, type_select.value);

    copySummary(data);

}

window.addEventListener("popstate", () => update_lgd({ animate: true }));
window.addEventListener("lgdchange", () => update_lgd({ animate: true }));

window.clearSdzFocus = async function () {
  
  // Remove the SDZ query parameter
  const url = new URL(window.location);
  url.searchParams.delete("sdz");

  window.history.replaceState(
    {},
    "",
    `${url.pathname}${url.search}${url.hash}`
  );

  await update_lgd({ animate: true });

  // Hide the clear button (or its parent)
  document.querySelector("#in-focus").classList.remove("is-open");

  // Notify the rest of the app
  window.dispatchEvent(new CustomEvent("sdzselect", {
    detail: { code: null }
  }));
};