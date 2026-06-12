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
    ["", "", ""]
  );

  typeSelect("type-select");

  type_select = document.getElementById("type-select");

  type_select.addEventListener("change", async () => {
    insertValue(
      "deprivation-type",
      config.deprivation_types[type_select.value].toLowerCase()
    );

    await update_lgd({ animate: false });
  });

  await update_lgd({ animate: false });
});

async function update_lgd({ animate = true } = {}) {
  const params = new URLSearchParams(window.location.search);

  if (params.size === 0) {
    window.location.pathname = "/";
    return;
  }

  lgdMenu("lgd-select");

  const lgd = params.get("lgd");
  const data = await readData(lgd);
  document.getElementsByTagName("title")[0].textContent = `Deprivation in ${data.name}`;

  insertNavButtons(data);
  insertValue("place-name", data.name);

  insertValue(
    "deprivation-type",
    config.deprivation_types[type_select.value].toLowerCase()
  );

  await plotScaleMap("scale-map", data, type_select.value, { animate });
    insertValue("place-name", data.name)
    
    await plotScaleMap("scale-map", data, type_select.value);
    
    const lgdTableContainer = document.getElementById("lgd-table-container");
    createLGDTable(lgdTableContainer, data, type_select.value);

    type_select.addEventListener("change", () => {
        insertValue("deprivation-type", config.deprivation_types[type_select.value].toLowerCase()
    );
    
    plotScaleMap("scale-map", data, type_select.value)
    createLGDTable(lgdTableContainer, data, type_select.value)
    });
    
}

window.addEventListener("popstate", () => update_lgd({ animate: true }));
window.addEventListener("lgdchange", () => update_lgd({ animate: true }));