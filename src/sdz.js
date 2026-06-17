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
import { plotNavMap } from "./utils/plotNavMap.js";
import { plotScaleMap } from "./utils/plotScaleMap.js";
import { copySummary } from "./utils/copy-summary.js";
import { goStart, handleOnScroll } from "./utils/scroll-button.js";
import { sharePage } from "./utils/share-page.js";
import { populateNextStepBoxes } from "./utils/next-steps.js";

  let currentSelectedName = "";
  let currentSelectedValue = null;
  let currentLgdData = null;

window.addEventListener("DOMContentLoaded", async () => {

    await insertHead("Super Data Zone");
    insertHeader();
    insertFooter();
    postcodeSearch("postcode-search");

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
    const scrollBtn = document.getElementById("scroll-btn");
    scrollBtn.addEventListener("click", goStart);
    copySummary();
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

      const headline = document.getElementById("headline");
      if (postcode) {
        headline.innerHTML =`${postcode} is in <span class="blue-text">${data.name}</span>`;
        document.getElementsByTagName("title")[0].textContent = `Deprivation in ${postcode}`;
      } else {
        headline.innerHTML = `Deprivation in <span class="blue-text">${data.name}</span>`;
        document.getElementsByTagName("title")[0].textContent = `Deprivation in ${data.name}`;
      }

      const geo_description = document.getElementById("geo-description");

      geo_description.innerHTML = `
        <p class="mb-0"><span class="blue-text">${data.name}</span> is a Super Data Zone or 'neighbourhood'.</p>
        <p class="mb-0">Deprivation is calculated for these Super Data Zones.</p>
        <p><span class="blue-text">${data.name}</span> is classified as ${data.data.urban_rural} and is in <a style="color: var(--nisra_blue);" href="lgd.html?lgd=${data.parents[0].code}">${data.parents[0].name}</a>.</p>`
    
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

    scaleChart("comparison-scale-chart", {
    data: { ranks: { mdm: currentSelectedValue } },
    children_count: currentLgdData.children_count
    }, "mdm", "below", true, {
    markerColor: "#D4351C",
    markerStroke: "#D4351C"
    });



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

    const lgdLink = `lgd.html?lgd=${data.parents[0].code}&sdz=${data.code}`;
    const deprivationLink = "https://www.nisra.gov.uk/statistics/people-and-communities/deprivation-and-poverty";

    populateNextStepBoxes([
  {
    text: `Explore deprivation in areas surrounding ${data.name} using maps and tables`,
    link: `${lgdLink}`
  },
  {
    text: `Back to top and enter another postcode`,
    link: "postcode-search"
  },
  {
    text: `View other deprivation resources. Reports, detailed tables and background information`,
    link: `${deprivationLink}`
  }
]);


}

function updateComparisonText(diff, hoveredName) {
  const el = document.getElementById("comparison-text");
  if (!el) return;

  let text;

  if (diff === 0) {
    text = `<strong>${hoveredName}</strong> has a similar deprivation ranking`;
  } 
  else if (diff > 0) {
    text = `<strong>${hoveredName}</strong> is less deprived than ${currentSelectedName}`;
  } 
  else {
    text = `<strong>${hoveredName}</strong> is more deprived than ${currentSelectedName}`;
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

  scaleChart("comparison-scale-chart", {
  data: { ranks: { mdm: currentSelectedValue } },
  children_count: currentLgdData.children_count
  }, "mdm", "below", true, {
  compareValue: hovered.value,
  markerColor: "#D4351C",
  markerStroke: "#D4351C",
  compareColor: "#F59E0B"
});
});