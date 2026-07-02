import { lgdMenu, lgd_codes } from "./lgd-menu.js";
import { readData } from "./read-data.js";
import { insertNavButtons } from "./page-layout.js";
import { insertValue } from "./insert-value.js";
import { config } from "../config/config.js";
import { plotScaleMap } from "./plot-scale-map.js";
import { scaleChart } from "./scale-chart.js";
import { createLGDTable } from "./lgd-table.js";
import { lgdDeprivationSummary } from "./deprivation-text.js";
import { copySummary } from "./copy-summary.js";

export async function updateLGD({ animate = true } = {}) {
  const params = new URLSearchParams(window.location.search);
  const type_select = document.getElementById("type-select");

  if (params.size === 0) {
    window.location.replace("./");
    return;
  }

  await lgdMenu("lgd-select");

  const lgd = params.get("code");

   if (!lgd_codes.includes(lgd) & lgd != "N92000002") {
    window.location.replace("./");
    return;
  }

  if (lgd == "N92000002") {
    document.getElementById("lgd-select-group").classList.add("d-none");
    document.getElementById("deprivation-summary-group").classList.add("d-none");
    document.getElementById("scale-map").classList.add("ni-map");
    document.getElementById("lgd-table-container").classList.add("ni-map");
    document.getElementById("scale-map").classList.remove("scale-map");
    document.getElementById("map-col").classList.add("col-xl-8");
    document.getElementById("map-col").classList.remove("col-xl-7");
    document.getElementById("table-col").classList.add("col-xl-4");
    document.getElementById("table-col").classList.remove("col-xl-5");
    document.getElementById("in-focus-col").classList.add("col-xl-8");
    document.getElementById("in-focus-col").classList.remove("col-xl-7");
  }

  const sdz = params?.get("sdz");
  const data = await readData(lgd);
  let sdz_data;

  if (!Object.keys(data.data.ranks).includes(sdz) & sdz != null) {
    window.location.search = `code=${lgd}`;
  }
 
  document.getElementsByTagName("title")[0].textContent = `Deprivation in ${data.name}`;

  insertNavButtons(data);
  insertValue("place-name", data.name);

  const deprivation_type = config.deprivation_types[type_select.value].toLowerCase();
  const deprivation_type_text = deprivation_type == "overall deprivation" ? deprivation_type : `${deprivation_type} deprivation`;

  if (sdz) {
    insertValue("sdz-name", data.data.ranks[sdz].name);

    document.getElementById("in-focus").classList.add("is-open");
    document.getElementById("focus-link").href = `sdz.html?sdz=${sdz}`;

    sdz_data = await readData(sdz);

    insertValue(
      "lgd-scale-caption",
      `<span class="text-purple fw-bold">${sdz_data.name}</span> is ranked ${sdz_data.data.ranks[type_select.value]} out of ${sdz_data.count} for <strong>${deprivation_type_text}</strong>.`
    );
  
  } 

  insertValue(
    "deprivation-type",
    deprivation_type_text
  );

  await plotScaleMap("scale-map", data, type_select.value, { animate,
    highlightSdz: sdz
   });

  insertValue("place-name", data.name)
    
  scaleChart(
    "lgd-scale-chart",
    sdz ? sdz_data : data,
    type_select.value,
    {
      labels: "below",
      marker: sdz ? true : false
    }
  );

  const lgdTableContainer = document.getElementById("lgd-table-container");
  createLGDTable(lgdTableContainer, data, type_select.value, sdz);

  document.getElementById("type-description").innerHTML = config.i_text[type_select.value];

  type_select.addEventListener("change", async () => {
    const params = new URLSearchParams(window.location.search);
    const sdz = params.get("sdz");

    const deprivation_type = config.deprivation_types[type_select.value].toLowerCase();
    const deprivation_type_text = deprivation_type == "overall deprivation" ? deprivation_type : `${deprivation_type} deprivation`;

    insertValue(
      "deprivation-type",
      deprivation_type_text
    );
      plotScaleMap("scale-map", data, type_select.value, {
        highlightSdz: sdz,
        preserveView: true
      })

      sdz_data = await readData(sdz);

      scaleChart(
        "lgd-scale-chart",
        sdz ? sdz_data : data,
        type_select.value,
        {
          labels: "below",
          marker: sdz ? true : false
        }
      );
      createLGDTable(lgdTableContainer, data, type_select.value, sdz)

      document.getElementById("type-description").innerHTML = config.i_text[type_select.value];

      insertValue(
      "lgd-scale-caption",
      `<span class="text-purple fw-bold">${sdz_data.name}</span> is ranked ${sdz_data.data.ranks[type_select.value]} out of ${sdz_data.count} for <strong>${deprivation_type_text}</strong>.`
    );
  });

  lgdDeprivationSummary("deprivation-summary", data, type_select.value);

  copySummary(data);

}