import { config } from "../config/config.js";
import { map } from "./plot-scale-map.js";
import { readData } from "./read-data.js";

export async function downloadButton (button_id, capture_id, plot_type = "map") {

    const button = document.getElementById(button_id);
    const capture = document.getElementById(capture_id);

    const placeName = document.querySelector(".place-name");
    const rawText = placeName ? placeName.textContent : "map";

    const isSdzPage = window.location.pathname.includes("sdz");
    
    button.classList.add("dropdown-toggle");
    button.setAttribute("data-bs-toggle", "dropdown");
    button.setAttribute("aria-expanded", "false");

    const wrapper = button.parentElement;
    wrapper.classList.add("dropdown");

    const menu = document.createElement("ul");
    menu.className = "dropdown-menu";

    if (plot_type === "chart") {

      menu.innerHTML = `
          <li><a class="dropdown-item" href="#" id="download-csv-${capture_id}">chart data (in CSV format)</a></li>
          <li><a class="dropdown-item" href="#" id="download-xlsx-${capture_id}">chart data (in Excel format)</a></li>
          <li><a class="dropdown-item" href="#" id="download-${capture_id}">charts (as image)</a></li>
      `;

    } else {

      menu.innerHTML = `
          <li><a class="dropdown-item" href="#" id="download-csv-${capture_id}">map data (in CSV format)</a></li>
          <li><a class="dropdown-item" href="#" id="download-xlsx-${capture_id}">map data (in Excel format)</a></li>
          ${!isSdzPage ? `<li><a class="dropdown-item" href="#" id="download-${capture_id}">map (as image)</a></li>` : ""}
          ${isSdzPage ? `<li><a class="dropdown-item" href="#" id="download-map-${capture_id}">map (as image)</a></li>` : ""}
      `;

    }

    menu.style.maxWidth = "50%";

    wrapper.appendChild(menu);

    function getDeprivationType() {
      
      let deprivationType = document.getElementById("type-select")?.value
                                                                    ?.toLowerCase()
                                                                    .trim()
                                                                    .replace(/[^a-z0-9\s-]/g, "")
                                                                    .replace(/\s+/g, "-") || "deprivation";
                                                  
      if (deprivationType === "mdm") {
        deprivationType = "overall";
      }
      
      return deprivationType;
    }
    
    function getAreaName() {
      
      return document.querySelector(".place-name")?.textContent
                                                    .toLowerCase()
                                                    .trim()
                                                    .replace(/[^a-z0-9\s-]/g, "")
                                                    .replace(/\s+/g, "-") || "area";
    }

    if (plot_type == "map") {
        document.getElementById(`download-${capture_id}`)?.addEventListener("click", async (e) => {
        e.preventDefault();

        const cardEl = document.getElementById(capture_id);
        const mapContainerEl = document.getElementById("scale-map");

        const areaName = getAreaName();
        
        const deprivationType = getDeprivationType();

        await exportCardWithMap(cardEl, map, mapContainerEl, `${deprivationType}-deprivation-in-${areaName}.png`, placeName);
      });
    }
    
    document.getElementById(`download-csv-${capture_id}`)
    ?.addEventListener("click", async (e) => {
      e.preventDefault();

      let data;
      let filenameArea;
      
      if (window.location.pathname.includes("sdz")) {
        const sdz = new URLSearchParams(window.location.search).get("sdz");
        const sdzData = await readData(sdz);

        filenameArea = sdzData.parents[0].name
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-");
        const lgdCode = sdzData.parents[0].code;
        const lgdData = await readData(lgdCode);
        const deprivationType = getDeprivationType() === "overall" ? "mdm" : getDeprivationType();
        data = extractSDZMapData(lgdData, deprivationType);
    } else {
      filenameArea = getAreaName();
      data = extractLGDTableData();
    }

    if (!data.length) return;

    const deprivationType = getDeprivationType();
          
    downloadCSV(data, `${deprivationType}-deprivation-in-${filenameArea}.csv`);
});

document.getElementById(`download-xlsx-${capture_id}`)
?.addEventListener("click", async (e) => {
  e.preventDefault();

  let data;
  let filenameArea;

  if (window.location.pathname.includes("sdz")) {
    const sdz = new URLSearchParams(window.location.search).get("sdz");
    const sdzData = await readData(sdz);

    filenameArea = sdzData.parents[0].name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-");
    const lgdCode = sdzData.parents[0].code;
    const lgdData = await readData(lgdCode);
    const deprivationType = getDeprivationType() === "overall" ? "mdm" : getDeprivationType();
    data = extractSDZMapData(lgdData, deprivationType);

    } else {
      filenameArea = getAreaName();
      data = extractLGDTableData();
    }

    if (!data.length) return;

    const areaName = getAreaName();
        
    const deprivationType = getDeprivationType();

    downloadExcel(data, `${deprivationType}-deprivation-in-${filenameArea}.xlsx`);
  });
  
  document.getElementById(`download-map-${capture_id}`)?.addEventListener("click", async (e) => {
    e.preventDefault();

    if (!isSdzPage) return;

    const cardEl = document.getElementById("map-capture");
    const mapContainerEl = document.getElementById("comparison-map");

    if (!cardEl || !mapContainerEl) {
        console.error("Comparison map elements not found");
        return;
    }

    const areaName = getAreaName();

    const deprivationType = getDeprivationType();

    await exportCardWithMap(cardEl, map, mapContainerEl,`${areaName}-${deprivationType}-comparison-map.png`, placeName);
  });
  
if (plot_type === "chart") {

    document.getElementById(`download-${capture_id}`)?.addEventListener("click", async (e) => {
    e.preventDefault();

    const chartEl = document.getElementById(capture_id);

    if (!chartEl) return;

    const canvas = await html2canvas(chartEl, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,

      onclone: (clonedDoc) => {
        const clonedCard = clonedDoc.getElementById(chartEl.id);

        if (!clonedCard) return;

        const pageTitle = document.querySelector("h2");

        if (pageTitle) {
          const title = clonedDoc.createElement("div");

          title.textContent = pageTitle.textContent;

          title.style.fontSize = "22px";
          title.style.fontWeight = "bold";
          title.style.marginBottom = "5px";
          title.style.marginTop = "16px";
          title.style.marginLeft = "5px";

          clonedCard.prepend(title);
        }
      }
    });

    const finalCanvas = await addLogoUnderCanvas(
        canvas,
        "assets/img/logo/nisra-only-colour.png",
        {
            logoHeight: 70,
            padding: 24
        }
    );

    const areaName = getAreaName();
    
    const deprivationType = getDeprivationType();

    const link = document.createElement("a");
    link.download = `${deprivationType}-deprivation-in-${areaName}.png`;
    link.href = finalCanvas.toDataURL("image/png");
    link.click();
  });
}}

export async function exportCardWithMap(cardEl, map, mapContainerEl, filename, placeName = null) {
  // Wait until map is fully rendered
  await waitForMapReady(map);

  // Snapshot the WebGL canvas
  const mapCanvas = map.getCanvas();

  if (map.triggerRepaint) {
    map.triggerRepaint();
  }

  await new Promise(requestAnimationFrame);

  let dataUrl;
  try {
    dataUrl = mapCanvas.toDataURL("image/png");
  } catch (err) {
    console.error("Map canvas export failed (likely CORS taint):", err);
    throw err;
  }

  // Capture WITHOUT touching the live DOM
  const canvas = await html2canvas(cardEl, {
    backgroundColor: "#ffffff",
    scale: 2,
    useCORS: true,

    // Force html2canvas "virtual viewport" to match your real one,
    // so Bootstrap keeps the same breakpoint (xl, etc.)
    windowWidth: document.documentElement.clientWidth,
    windowHeight: document.documentElement.clientHeight,

  onclone: (clonedDoc) => {
    // Find the equivalents in the cloned DOM
    const clonedCard = clonedDoc.getElementById(cardEl.id);
    const clonedMapContainer = clonedDoc.getElementById(mapContainerEl.id);

    if (!clonedCard || !clonedMapContainer) return;

    const pageTitle = document.querySelector("h2");

    if (pageTitle) {
        const title = clonedDoc.createElement("div");

        title.textContent = mapContainerEl.id === "comparison-map" ? `Deprivation in ${placeName.textContent} and nearby areas`
        : pageTitle.textContent;

        if (mapContainerEl.id === "comparison-map") {
            const comparisonText = clonedDoc.getElementById("comparison-text");

            if (comparisonText) {
                comparisonText.style.display = "none";
            }
        }

        title.style.fontSize = "22px";
        title.style.fontWeight = "bold";
        title.style.marginBottom = "5px";
        title.style.marginTop = "16px";
        title.style.marginLeft = "5px";

        clonedCard.prepend(title); 
    }

    // ✅ Remove/hide footer in the CLONE so it doesn't appear in the export
    const clonedFooter = clonedCard.querySelector(".card-footer");
    if (clonedFooter) clonedFooter.remove(); // or: clonedFooter.style.display = "none";

    // Make sure the cloned map container keeps its size
    const w = mapContainerEl.clientWidth;
    const h = mapContainerEl.clientHeight;
    clonedMapContainer.style.width = `${w}px`;
    clonedMapContainer.style.height = `${h}px`;

    // Replace the cloned map container contents with the snapshot image
    clonedMapContainer.innerHTML = "";
    const img = clonedDoc.createElement("img");
    img.src = dataUrl;
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.display = "block";
    clonedMapContainer.appendChild(img);

    // Lock cloned card width
    clonedCard.style.width = `${cardEl.getBoundingClientRect().width}px`;
    clonedCard.style.paddingLeft = "1px";
  }

  });

  // Download
  const link = document.createElement("a");
  link.download = filename;
  const finalCanvas = await addLogoUnderCanvas(
    canvas,
    "assets/img/logo/nisra-only-colour.png",
    {
        logoHeight: 70,
        padding: 24
    }
    );

    link.href = finalCanvas.toDataURL("image/png");
  link.click();
}

export async function addLogoUnderCanvas(originalCanvas, logoSrc, options = {}) {
  const {
    padding = 24,
    logoHeight = 60
  } = options;

  const logo = new Image();
  logo.src = logoSrc;
  logo.crossOrigin = "anonymous";

  await new Promise((resolve, reject) => {
    logo.onload = resolve;
    logo.onerror = reject;
  });

  // Scale logo proportionally
  const scale = logoHeight / logo.height;
  const logoWidth = logo.width * scale;

  const newCanvas = document.createElement("canvas");
  newCanvas.width = originalCanvas.width;
  newCanvas.height =
    originalCanvas.height + padding * 2 + logoHeight;

  const ctx = newCanvas.getContext("2d");

  // White background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);

  // Draw original capture
  ctx.drawImage(originalCanvas, 0, 0);

  // Bottom-right position
  const x = newCanvas.width - logoWidth - padding;
  const y = originalCanvas.height + padding;

  ctx.drawImage(
    logo,
    x,
    y,
    logoWidth,
    logoHeight
  );

  return newCanvas;
}

async function waitForMapReady(map) {
  // Make sure MapLibre has the correct size (important if container/layout changed)
  map.resize();

  // If it's already loaded and not moving, don't wait for an event that may never fire
  const alreadyReady =
    (map.loaded?.() || map.isStyleLoaded?.()) &&
    !map.isMoving?.() &&
    (map.areTilesLoaded ? map.areTilesLoaded() : true);

  if (alreadyReady) return;

  // Otherwise wait for idle, but also force a render cycle
  await new Promise((resolve) => {
    const done = () => resolve();

    map.once("idle", done);

    // Nudge a render so 'idle' can happen without needing a manual resize
    if (map.triggerRepaint) map.triggerRepaint();
  });
}

export function extractLGDTableData() {
    const table = document.querySelector("#lgd-table-container table");
    if (!table) return [];

    const rows = table.querySelectorAll("tr");

    return Array.from(rows).map(row =>
        Array.from(row.querySelectorAll("th, td")).map(cell =>
            cell.textContent
            .replace(/[▲▼]/g, "")
            .trim()
        )
    );
}

export function extractSDZMapData(lgdData, deprivationType) {

    const rows = [["SDZ", "Rank"]];

    Object.values(lgdData.data.ranks).forEach(sdz => {

        rows.push([
            sdz.name,
            sdz.ranks?.[deprivationType] ?? ""
        ]);

    });

    return rows;
}

export function extractSDZData(sdzData) {
    const rows = [];
    
    rows.push(["Measure", "Rank"]);

    const ranks = sdzData?.data?.ranks || {};
    const types = config.deprivation_types;

    Object.entries(types).forEach(([key, label]) => {
        const value = ranks[key];

        rows.push([
            label.title,
            value ?? ""
        ]);
    });

    return rows;
}

export function downloadCSV(data, filename) {
    const csv = data
        .map(row => row.map(val => `"${val}"`).join(","))
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;

    link.click();
}

export function downloadExcel(data, filename) {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    const sheetName = "data";

    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    XLSX.writeFile(wb, filename);
}