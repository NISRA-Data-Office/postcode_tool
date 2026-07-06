import { lgdMenu, lgd_codes } from "./lgd-menu.js";
import { readData } from "./read-data.js";
import { insertNavButtons } from "./page-layout.js";
import { insertValue } from "./insert-value.js";
import { config } from "../config/config.js";
import { plotScaleMap } from "./plot-scale-map.js";
import { scaleChart } from "./scale-chart.js";
import { createLGDTable } from "./lgd-table.js";
import { lgdDeprivationSummary, updateComparisonText } from "./deprivation-text.js";
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
  let currentSelectedName = null;
  let currentSelectedValue = null;

  if (!Object.keys(data.data.ranks).includes(sdz) & sdz != null) {
    window.location.search = `code=${lgd}`;
  }
 
  document.getElementsByTagName("title")[0].textContent = `Deprivation in ${data.name}`;

  insertNavButtons(data);
  insertValue("place-name", data.name);

  const deprivation_type = config.deprivation_types[type_select.value].title.toLowerCase();
  const deprivation_type_text = deprivation_type == "overall mdm" ? "overall MDM" : `${deprivation_type} deprivation`;

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

  await plotScaleMap("scale-map", data, type_select.value, {
    animate,
    highlightSdz: sdz,
    enableComparison: true,
    enableSdzClick: true
  });

  insertValue("place-name", data.name);

  currentSelectedValue = sdz ? sdz_data.data.ranks[type_select.value] : null;

  scaleChart(
    "lgd-scale-chart",
    {
      data: { ranks: { [type_select.value]: currentSelectedValue } },
      count: data.sdz_count
    },
    type_select.value,
    {
      labels: "below",
      marker: sdz ? true : false,
      comparisonScale: sdz ? true : false
    }
  );

  const lgdTableContainer = document.getElementById("lgd-table-container");
  createLGDTable(lgdTableContainer, data, type_select.value, sdz);

  document.getElementById("type-description").innerHTML = config.deprivation_types[type_select.value].description;

  // Update chart and caption when an SDZ is selected (via map or table)
  window.addEventListener("sdzselect", async e => {
    const code = e?.detail?.code;

    if (!code) {
      sdz_data = null;
      currentSelectedValue = null;

      scaleChart("lgd-scale-chart",
        {
          data: { ranks: { [type_select.value]: null } },
          count: data.sdz_count
        },
        type_select.value,
        {
          labels: "below",
          marker: false,
          comparisonScale: false
        }
      );

      insertValue("lgd-scale-caption", ``);
      return;
    }

    const newSdzData = await readData(code);
    if (!newSdzData) return;

    // Critical: update the shared selected state
    sdz_data = newSdzData;
    currentSelectedName = newSdzData.name;
    currentSelectedValue = newSdzData.data.ranks[type_select.value];

    scaleChart("lgd-scale-chart",
      {
        data: { ranks: { [type_select.value]: currentSelectedValue } },
        count: data.sdz_count
      },
      type_select.value,
      {
        labels: "below",
        marker: true,
        comparisonScale: true
      }
    );

    insertValue(
      "lgd-scale-caption",
      `<span class="text-purple fw-bold">${newSdzData.name}</span> is ranked ${currentSelectedValue} out of ${newSdzData.count} for <strong>${deprivation_type_text}</strong>.`
    );
  });

  type_select.addEventListener("change", async () => {
    const params = new URLSearchParams(window.location.search);
    const sdz = params.get("sdz");

    const deprivation_type = config.deprivation_types[type_select.value].title.toLowerCase();
    const deprivation_type_text = deprivation_type == "overall mdm" ? "overall MDM" : `${deprivation_type} deprivation`;

    insertValue(
      "deprivation-type",
      deprivation_type_text
    );

       await plotScaleMap("scale-map",
        data,
        type_select.value,
        {
        animate,
        highlightSdz: sdz,
        forceLgdView: true,
        enableComparison: true,
        enableSdzClick: true   
      });

      sdz_data = await readData(sdz);

      scaleChart("lgd-scale-chart",
            {
              data: { ranks: { [type_select.value]: sdz_data ? sdz_data.data.ranks[type_select.value] : null } },
              count: data.sdz_count
            },
            type_select.value,
            {
              labels: "below",
              marker: sdz ? true : false,
              comparisonScale: sdz ? true : false
            });


      createLGDTable(lgdTableContainer, data, type_select.value, sdz)

      document.getElementById("type-description").innerHTML = config.deprivation_types[type_select.value].description;

      insertValue(
      "lgd-scale-caption",
      `<span class="text-purple fw-bold">${sdz_data.name}</span> is ranked ${sdz_data.data.ranks[type_select.value]} out of ${sdz_data.count} for <strong>${deprivation_type_text}</strong>.`
    );
  });

  lgdDeprivationSummary("deprivation-summary", data, type_select.value);

  if (sdz) {
    currentSelectedName = sdz_data.name;
    currentSelectedValue = sdz_data.data.ranks[type_select.value];

    updateComparisonText(sdz_data, sdz_data, true, false, type_select.value);

    window.addEventListener("sdzhovercompare", e => {
      const { hovered, selected } = e.detail;
      if (!hovered?.value || !selected?.value) return;

      updateComparisonText(sdz_data, hovered, false, false, type_select.value);

      scaleChart("lgd-scale-chart",
        {
          data: { ranks: { [type_select.value]: currentSelectedValue } },
          count: data.sdz_count
        },
        type_select.value,
        {
          labels: "below",
          marker: true,
          compareValue: hovered.value,
          comparisonScale: true
        }
      );
    });

    window.addEventListener("sdzhoverout", () => {
      updateComparisonText(sdz_data, sdz_data, true, false, type_select.value);

      const selectedType = type_select.value || "mdm";
      currentSelectedValue = sdz_data.data.ranks[selectedType];

      scaleChart("lgd-scale-chart",
        {
          data: { ranks: { [selectedType]: currentSelectedValue } },
          count: data.sdz_count
        },
        selectedType,
        {
          labels: "below",
          marker: true,
          comparisonScale: true,
          compareValue: null
        }
      );
    });

    type_select.addEventListener("change", () => {
      currentSelectedValue = sdz_data.data.ranks[type_select.value];
      updateComparisonText(sdz_data, sdz_data, true, false, type_select.value);
    });
    
  }

  copySummary(data);

}