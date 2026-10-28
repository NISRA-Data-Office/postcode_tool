import { readData } from "./read-data.js";
import { map } from "./plot-scale-map.js";
import { extractLGDTableData, extractSDZData, downloadCSV, downloadExcel, exportCardWithMap, addLogoUnderCanvas } from "./download-button.js";

export function pageDownloadButton(buttonId) {
    
    const button = document.getElementById(buttonId);

    if (!button) return;

    button.classList.add("dropdown-toggle");
    button.setAttribute("data-bs-toggle", "dropdown");
    button.setAttribute("aria-expanded", "false");

    const wrapper = button.parentElement;
    wrapper.classList.add("dropdown");

    const menu = document.createElement("ul");

    menu.className = "dropdown-menu";

    const isSdzPage = window.location.pathname.includes("sdz");
    
    menu.innerHTML = `
        <li><a class="dropdown-item" href="#" id="page-download-csv">data (in CSV format)</a></li>
        <li><a class="dropdown-item" href="#" id="page-download-xlsx">data (in Excel format)</a></li>
        <li><a class="dropdown-item" href="#" id="page-download-pdf">page (as PDF)</a></li>
        <li><a class="dropdown-item" href="#" id="page-download-map">map (as image)</a></li>
        ${isSdzPage ? `<li><a class="dropdown-item" href="#" id="page-download-chart">charts (as image)</a></li>`: ""}
    `;

    menu.style.maxWidth = "50%";

    wrapper.appendChild(menu);

    const getAreaName = () =>
        document.querySelector(".place-name")
            ?.textContent
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-") || "area";

    const getDeprivationType = () => {

        let deprivationType =
            document.getElementById("type-select")
                ?.value
                ?.toLowerCase()
                .trim()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-") || "deprivation";

        if (deprivationType === "mdm") {
            deprivationType = "overall";
        }

        return deprivationType;
    };

    document.getElementById("page-download-csv")
        ?.addEventListener("click", async (e) => {

            e.preventDefault();

            let data;
            
            if (window.location.pathname.includes("sdz")) {
                const sdz = new URLSearchParams(window.location.search).get("sdz");
                const sdzData = await readData(sdz);
                data = extractSDZData(sdzData);
            } else {
                data = extractLGDTableData();
            }

            if (!data.length) return;

            downloadCSV(data,`${getDeprivationType()}-deprivation-in-${getAreaName()}.csv`);
        });

        document.getElementById("page-download-xlsx")
        ?.addEventListener("click", async (e) => {

            e.preventDefault();

            let data;

            if (window.location.pathname.includes("sdz")) {
                const sdz = new URLSearchParams(window.location.search).get("sdz");
                const sdzData = await readData(sdz);
                data = extractSDZData(sdzData);
            } else {
                data = extractLGDTableData();
            }

            if (!data.length) return;

            downloadExcel(
                data,
                `${getDeprivationType()}-deprivation-in-${getAreaName()}.xlsx`
            );
        });

        document.getElementById("page-download-map")
            ?.addEventListener("click", async (e) => {

                e.preventDefault();

                const placeName = document.querySelector(".place-name");

                const cardEl = document.getElementById("map-capture");
                    
                    const mapContainerEl = document.getElementById("comparison-map") || document.getElementById("scale-map");

                    const deprivationLabel = document.getElementById("type-select")?.selectedOptions?.[0]?.textContent || "Deprivation";

                await exportCardWithMap(cardEl, map, mapContainerEl, `${getDeprivationType()}-deprivation-in-${getAreaName()}.png`, placeName, deprivationLabel);
            });

            document.getElementById("page-download-chart")
                ?.addEventListener("click", async (e) => {
                    
                    e.preventDefault();
                    
                    const chartEl = document.getElementById("chart-capture");
                    
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
                    
                    const finalCanvas = await addLogoUnderCanvas(canvas, "assets/img/logo/nisra-only-colour.svg",
                        {
                            logoHeight: 70,
                            padding: 24
                        }
                    );
                    
                    const link = document.createElement("a");

                    link.download = `${getAreaName()}-deprivation-charts.png`;
                    link.href = finalCanvas.toDataURL("image/png");

                    link.click();
                });
                
                document.getElementById("page-download-pdf")
                    ?.addEventListener("click", (e) => {
                        
                        e.preventDefault();
                        window.print();
                    });
}