import { lgdMenu, lgd_codes } from "./lgd-menu.js";
import { readData } from "./read-data.js";
import { insertNavButtons } from "./page-layout.js";
import { insertValue } from "./insert-value.js";
import { config } from "../config/config.js";
import { plotScaleMap, selectSdzByCode } from "./plot-scale-map.js";
import { scaleChart } from "./scale-chart.js";
import { createLGDTable } from "./lgd-table.js";
import { lgdDeprivationSummary, updateComparisonText } from "./deprivation-text.js";
import { copySummary } from "./copy-summary.js";

let comparisonListenersRegistered = false;
let comparisonState = { data: null, sdzData: null, selectedType: null };

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

  const sdz = params?.get("sdz");
  const data = await readData(lgd);
  let sdz_data = null;
  let currentSelectedName = null;
  let currentSelectedValue = null;
  comparisonState = { data, sdzData: null, selectedType: type_select.value || "mdm" };

  if (!Object.keys(data.data.ranks).includes(sdz) & sdz != null) {
    window.location.search = `code=${lgd}`;
  }
 
  document.getElementsByTagName("title")[0].textContent = `Deprivation in ${data.name}`;

  insertNavButtons(data);
  insertValue("place-name", data.name);

  const deprivation_type = config.deprivation_types[type_select.value].title;
  const deprivation_type_text = deprivation_type == "overall mdm" ? "overall MDM" : `${deprivation_type} deprivation`;

  if (lgd == "N92000002") {
    document.getElementById("deprivation-summary-group").classList.add("d-none");
    
    const explainer = document.getElementById("ni-explainer");
    if (explainer) {
      explainer.classList.add("d-none");
    }

    const headline = document.querySelector("#headline").parentElement;

    let ni_description = document.getElementById("ni-description");

    if (!ni_description) {
      ni_description = document.createElement("p");
      ni_description.id = "ni-description";

      const paragraphs = headline.querySelectorAll("p");
      headline.insertBefore(ni_description, paragraphs[paragraphs.length - 1]);
    }

    ni_description.innerHTML = `<p>Northern Ireland is made up of ${data.sdz_count} Super Data Zones, referred to here as 'neighbourhoods'. Each neighbourhood has an average population of 2,240 people.</p>
                                <p>The neighbourhood ranked 1 is the most deprived and the neighbourhood ranked ${data.sdz_count} is the least deprived.</p>
    `;

    document.getElementById("map-explanation").textContent = "Using the map or table, click on a neighbourhood to focus on that area.";
    document.getElementById("sdz-description").classList.add("d-none");
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

  if (lgd !== "N92000002") {
    const headline = document.querySelector("#headline").parentElement;
    let explainer = document.getElementById("ni-explainer");
    
    if (!explainer) {
      explainer = document.createElement("p");
      explainer.id = "ni-explainer";

      const paragraphs = headline.querySelectorAll("p");
      headline.insertBefore(explainer, paragraphs[paragraphs.length - 1]);
    }

    const neighbourhood_count = Object.keys(data.data.ranks || {}).length;
    const council_name = data.name;

    explainer.innerHTML = `There are ${data.sdz_count} neighbourhoods in Northern Ireland. ${council_name} is made up of ${neighbourhood_count} neighbourhoods.
                           The neighbourhood ranked 1 is the most deprived and the neighbourhood ranked ${neighbourhood_count} is the least deprived in ${council_name}.
    `;
  }

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
    const selectedType = type_select.value || "mdm";

    if (!code) {
      sdz_data = null;
      currentSelectedValue = null;

      scaleChart("lgd-scale-chart",
        {
          data: { ranks: { [selectedType]: null } },
          count: data.sdz_count
        },
        selectedType,
        {
          labels: "below",
          marker: false,
          comparisonScale: false
        }
      );

      document.getElementById("comparison-text").innerHTML = "";

      insertValue("lgd-scale-caption", ``);
      return;
    }

    const newSdzData = await readData(code);
    if (!newSdzData) return;

    await selectSdzByCode(code, { moveToSdz: false });

    // Critical: update the shared selected state
    sdz_data = newSdzData;
    comparisonState = { ...comparisonState, sdzData: newSdzData, selectedType: selectedType };
    currentSelectedName = newSdzData.name;
    currentSelectedValue = newSdzData.data.ranks[selectedType];

    scaleChart("lgd-scale-chart",
      {
        data: { ranks: { [selectedType]: currentSelectedValue } },
        count: data.sdz_count
      },
      selectedType,
      {
        labels: "below",
        marker: true,
        comparisonScale: true
      }
    );

    updateComparisonText(newSdzData, newSdzData, true, false, selectedType);

    insertValue(
      "lgd-scale-caption",
      `<span class="text-purple fw-bold">${newSdzData.name}</span> is ranked ${currentSelectedValue} out of ${newSdzData.count} for <strong>${deprivation_type_text}</strong>.`
    );
  });

  type_select.onchange = async () => {
    const params = new URLSearchParams(window.location.search);
    const sdz = params.get("sdz");
    const selectedType = type_select.value || "mdm";

    const deprivation_type = config.deprivation_types[selectedType].title;
    const deprivation_type_text = deprivation_type == "overall mdm" ? "overall MDM" : `${deprivation_type} deprivation`;

    insertValue(
      "deprivation-type",
      deprivation_type_text
    );

    await plotScaleMap("scale-map",
      data,
      selectedType,
      {
        animate,
        highlightSdz: sdz,
        forceLgdView: true,
        enableComparison: true,
        enableSdzClick: true
      });

    sdz_data = sdz ? await readData(sdz) : null;
    currentSelectedValue = sdz_data?.data?.ranks?.[selectedType] ?? null;
    comparisonState = { data, sdzData: sdz_data, selectedType };

    scaleChart("lgd-scale-chart",
      {
        data: { ranks: { [selectedType]: currentSelectedValue } },
        count: data.sdz_count
      },
      selectedType,
      {
        labels: "below",
        marker: sdz_data ? true : false,
        comparisonScale: sdz_data ? true : false
      });

    createLGDTable(lgdTableContainer, data, selectedType, sdz)

    document.getElementById("type-description").innerHTML = config.deprivation_types[selectedType].description;

    lgdDeprivationSummary("deprivation-summary", data, selectedType);

    if (sdz_data) {
      currentSelectedName = sdz_data.name;
      currentSelectedValue = sdz_data.data.ranks[selectedType];
      updateComparisonText(sdz_data, sdz_data, true, false, selectedType);

      insertValue(
        "lgd-scale-caption",
        `<span class="text-purple fw-bold">${sdz_data.name}</span> is ranked ${currentSelectedValue} out of ${sdz_data.count} for <strong>${deprivation_type_text}</strong>.`
      );
    } else {
      document.getElementById("comparison-text").innerHTML = "";
      insertValue("lgd-scale-caption", ``);
    }
  };

  lgdDeprivationSummary("deprivation-summary", data, type_select.value);

  if (!comparisonListenersRegistered) {
    window.addEventListener("sdzhovercompare", e => {
      const { hovered, selected } = e.detail;
      const selectedType = comparisonState.selectedType || type_select.value || "mdm";
      const activeSdzData = comparisonState.sdzData;
      if (!activeSdzData || !hovered?.value || !selected?.value) return;

      currentSelectedValue = activeSdzData.data.ranks[selectedType];
      updateComparisonText(activeSdzData, hovered, false, false, selectedType);

      scaleChart("lgd-scale-chart",
        {
          data: { ranks: { [selectedType]: currentSelectedValue } },
          count: comparisonState.data.sdz_count
        },
        selectedType,
        {
          labels: "below",
          marker: true,
          compareValue: hovered.value,
          comparisonScale: true
        }
      );
    });

    window.addEventListener("sdzhoverout", () => {
      const selectedType = comparisonState.selectedType || type_select.value || "mdm";
      const activeSdzData = comparisonState.sdzData;
      if (!activeSdzData) return;

      currentSelectedValue = activeSdzData.data.ranks[selectedType];
      updateComparisonText(activeSdzData, activeSdzData, true, false, selectedType);

      scaleChart("lgd-scale-chart",
        {
          data: { ranks: { [selectedType]: currentSelectedValue } },
          count: comparisonState.data.sdz_count
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

    comparisonListenersRegistered = true;
  }

  if (sdz) {
    currentSelectedName = sdz_data?.name ?? null;
    currentSelectedValue = sdz_data?.data?.ranks?.[type_select.value] ?? null;

    updateComparisonText(sdz_data ?? { name: data.name, count: data.sdz_count, data: { ranks: { [type_select.value]: null } } }, sdz_data ?? { name: data.name, value: null }, true, false, type_select.value);
  }

  copySummary(data);

}