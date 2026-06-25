import { insertHeader, insertFooter, insertHead, insertNavButtons } from "./utils/page-layout.js";
import { readData } from "./utils/read-data.js";
import { insertValue } from "./utils/insert-value.js";
import { config } from "./config/config.js";
import { postcodeSearch, postcode_data } from "./utils/postcode-search.js";
import { getDeprivationSummary, getHeadline, getParagraph } from "./utils/deprivation-text.js";
import { scaleChart } from "./utils/scale-chart.js";
import { populateInfoBoxes } from "./utils/info-boxes.js";
import { insertScaleTable } from "./utils/insert-scale-table.js";
import { plotScaleMap } from "./utils/plot-scale-map.js";
import { plotNavMap } from "./utils/plot-nav-map.js";
import { copySummary } from "./utils/copy-summary.js";
import { handleOnScroll } from "./utils/scroll-button.js";
import { sharePage } from "./utils/share-page.js";
import { populateNextStepBoxes } from "./utils/next-steps.js";

  let currentSelectedName = "";
  let currentSelectedValue = null;
  let currentLgdData = null;

window.addEventListener("DOMContentLoaded", async () => {

    await insertHead("Super Data Zone");
    insertHeader();
    insertFooter();
    await postcodeSearch("postcode-search");

    populateInfoBoxes(
        [
            "What is the multiple deprivation measure and when do I use it?",
            "What are the types of deprivation and when do I use them?",
            "What is a ‘neighbourhood’ or super data zone?"
        ],
        [
            "",
            "",
            "Neighbourhoods are small areas called Super Data Zones (SDZ).They have an average population of 2,270 people."
        ]
    ) 
    handleOnScroll();
    
    await update_sdz({ animate: false });

})

async function update_sdz({ animate = true } = {}) {
      const params = new URLSearchParams(window.location.search);
    
      if (params.size === 0) {
        window.location.pathname = "/";
        return;
      }
    
      const sdz = params.get("sdz");
      const postcode = params?.get("postcode");
      const data = await readData(sdz);
      if (!data) {
        window.location.pathname = "/";
        window.location.search = "";
        return;
      }

      const headline = document.getElementById("headline");
      const page_title = document.getElementsByTagName("title")[0];

      const valid_postcode = postcode_data[sdz].codes.includes(postcode);

      if (valid_postcode) {
        headline.innerHTML =`${postcode} is in <span class="blue-text">${data.name}</span>`;
        page_title.textContent = `Deprivation in ${postcode}`;
      } else {
        headline.innerHTML = `Deprivation in <span class="blue-text">${data.name}</span>`;
        page_title.textContent = `Deprivation in ${data.name}`;
      }

      const geo_description = document.getElementById("geo-description");

      geo_description.innerHTML = `
        <p class="mb-0"><span class="blue-text">${data.name}</span> is a Super Data Zone or 'neighbourhood'.</p>
        <p class="mb-0">Deprivation is calculated for these Super Data Zones.</p>
        <p><span class="blue-text">${data.name}</span> is classified as <span class="blue-text">${data.data.urban_rural}</span> and is in <a style="color: var(--nisra_blue);" href="lgd.html?lgd=${data.parents[0].code}">${data.parents[0].name}</a>.</p>`
    
    insertNavButtons(data);
    insertValue("place-name", data.name);
    insertValue("overall-rank", data.data.ranks.mdm)
    insertValue("place-count", data.count)
    
    await plotNavMap("scale-map", data, { animate });

      const lgdCode = data.parents[0].code;
      const lgdData = await readData(lgdCode);

      currentSelectedName = data.name;
      currentSelectedValue = data.data.ranks.mdm;
      currentLgdData = lgdData;

      await plotScaleMap("comparison-map", lgdData, "mdm", {
        animate,
        highlightSdz: data.code,
        forceLgdView: true,
        enableComparison: true   
      });

   scaleChart("comparison-scale-chart",
  {
    data: { ranks: { mdm: currentSelectedValue } },
    count: currentLgdData.sdz_count
  },
  "mdm",
  {
    labels: "below",
    marker: true,
    comparisonScale: true
  }
);

    const deprivation_headline = document.getElementById("deprivation-headline");
    deprivation_headline.innerHTML = getHeadline(data, data.count)
    document.getElementById("deprivation-headline").innerHTML = getHeadline(data);

    document.getElementById("deprivation-paragraph").innerHTML = getParagraph(data)

    document.getElementById("deprivation-summary").innerHTML = getDeprivationSummary(data);

    scaleChart("mdm-scale-chart", data, "mdm", {
      labels: "below",
      annotation: true
    });

    updateComparisonText(0, currentSelectedName, true)

    insertScaleTable("deprivation-scales", data);

    populateNextStepBoxes(data);

    copySummary(data);

}

function updateComparisonText(diff, hoveredName, clickedSdz = false, onMouseLeave = false) {
  const el = document.getElementById("comparison-text");
  if (!el) return;
  
  const hoveredStyled = `<span style="color:#F59E0B;"><strong>${hoveredName}</strong></span>`;
  const selectedStyled = `<span style="color:#D4351C;"><strong>${currentSelectedName}</strong></span>`;

  let text;

  if (clickedSdz == true || onMouseLeave == true) {
    text = `Hover over on an area to compare deprivation with ${selectedStyled}`;
    el.innerHTML = text;
    return;
  }

  if (diff === 0) {
    text = `${hoveredStyled} has a similar deprivation ranking`;
  } 
  else if (diff > 0) {
    text = `${hoveredStyled} is less deprived than ${selectedStyled}`;
  } 
  else {
    text = `${hoveredStyled} is more deprived than ${selectedStyled}`;
  }

  el.innerHTML = text;
}

window.addEventListener("popstate", () => update_sdz({ animate: true }));
window.addEventListener("sdzchange", () => update_sdz({ animate: true }));
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

  updateComparisonText(diff, hovered.name);

  scaleChart("comparison-scale-chart",
  {
    data: { ranks: { mdm: currentSelectedValue } },
    count: currentLgdData.sdz_count
  },
  "mdm",
  {
    labels: "below",
    marker: true,
    compareValue: hovered.value,
    comparisonScale: true
  }
);
});

window.addEventListener("sdzhoverout", (e) => {
  updateComparisonText(0, currentSelectedName, false, true)

  scaleChart("comparison-scale-chart",
  {
    data: { ranks: { mdm: currentSelectedValue } },
    count: currentLgdData.sdz_count
  },
  "mdm",
  {
    labels: "below",
    marker: true,
    comparisonScale: true,
    compareValue: null
  }
);

})
