import { readData } from "./read-data.js";
import { postcode_data } from "./postcode-search.js";
import { insertNavButtons } from "./page-layout.js";
import { insertValue } from "./insert-value.js";
import { plotNavMap } from "./plot-nav-map.js";
import { plotScaleMap } from "./plot-scale-map.js";
import { getHeadline, getParagraph, getDeprivationSummary, updateComparisonText } from "./deprivation-text.js";
import { scaleChart } from "./scale-chart.js";
import { insertScaleTable } from "./insert-scale-table.js";
import { populateNextStepBoxes } from "./next-steps.js";
import { copySummary } from "./copy-summary.js";
import { config } from "../config/config.js";

let currentSelectedName = "";
let currentSelectedValue = null;
let currentLgdData = null;

export async function updateSDZ({ animate = true } = {}) {
    const params = new URLSearchParams(window.location.search);
    const type_select = document.getElementById("type-select");
  
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
        <p>${valid_postcode ? `<strong>${postcode}</strong> is in ` : ``} <span class="text-purple fw-bold">${data.name}</span>${valid_postcode ? ", " : " is"} a small area${valid_postcode ? "": ","} called a Super Data Zone, in <a class="text-blue" href="area.html?code=${data.parents[0].code} "title="View deprivation profile for ${data.parents[0].name}"> ${data.parents[0].name}</a>.</p>
        <p>Super Data Zones - referred to here as 'neighbourhoods' - have an average population of 2,240 people.
    `
 
    insertNavButtons(data);
    
    insertValue("place-name", data.name);
    
    insertValue("overall-rank", data.data.ranks.mdm)
    insertValue("place-count", data.count)
    
    await plotNavMap("nav-map", data, { animate });

    document.getElementById("deprivation-headline").innerHTML = getHeadline(data);

    document.getElementById("deprivation-paragraph").innerHTML = getParagraph(data)

    getDeprivationSummary("deprivation-summary", data);

      const lgdCode = data.parents[0].code;
      const lgdData = await readData(lgdCode);

      currentSelectedName = data.name;
      const selectedType = type_select.value || "mdm";
      currentSelectedValue = data.data.ranks[selectedType];
      currentLgdData = lgdData;

      await plotScaleMap("comparison-map",
        lgdData,
        selectedType,
        {
        animate,
        highlightSdz: data.code,
        forceLgdView: true,
        enableComparison: true   
      });

    scaleChart("comparison-scale-chart",
      {
        data: { ranks: { [selectedType]: currentSelectedValue } },
        count: currentLgdData.sdz_count
      },
      selectedType,
      {
        labels: "below",
        marker: true,
        comparisonScale: true
      });

    scaleChart("mdm-scale-chart", data, "mdm", {
      labels: "below",
      annotation: true
    });

    updateComparisonText(0, currentSelectedName, currentSelectedName, true, false, type_select.value);

    insertScaleTable("deprivation-scales", data);

    populateNextStepBoxes(data);

    copySummary(data);

    document.addEventListener("click", (e) => {
  const btn = e.target.closest(".next-step-btn");
  if (!btn) return;

  const targetId = btn.dataset.target;
  const input = document.getElementById(targetId);

  if (input) {
    input.scrollIntoView({ behavior: "smooth", block: "center" });
    input.focus({ preventScroll: true });
  }

});
 
window.addEventListener("sdzhovercompare", (e) => {

  const { hovered, selected } = e.detail;

  if (!hovered?.value || !selected?.value) return;

  const diff = hovered.value - selected.value;

  updateComparisonText(diff, currentSelectedName, hovered.name, false, false, type_select.value);

  scaleChart("comparison-scale-chart",
  {
    data: { ranks: { [selectedType]: currentSelectedValue } },
    count: currentLgdData.sdz_count
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

window.addEventListener("sdzhoverout", (e) => {
  updateComparisonText(0, currentSelectedName, currentSelectedName, false, true, type_select.value);

  const selectedType = type_select.value || "mdm";

  scaleChart("comparison-scale-chart",
  {
    data: { ranks: { [selectedType]: currentSelectedValue } },
    count: currentLgdData.sdz_count
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

  type_select.addEventListener("change", async () => {
    const selectedType = type_select.value || "mdm";
    currentSelectedValue = data.data.ranks[selectedType];

    await plotScaleMap("comparison-map", lgdData, selectedType, {
      animate,
      highlightSdz: data.code,
      forceLgdView: true,
      enableComparison: true   
    });

    scaleChart(
      "comparison-scale-chart",
      lgdData,
      selectedType,
      {
        labels: "below",
        comparisonScale: true
      }
    );

  });

}