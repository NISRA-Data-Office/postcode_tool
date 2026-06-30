import { scaleChart } from "./scale-chart.js";
import { config } from "../config/config.js";

export function insertScaleTable (id, data) {

    const parent = document.getElementById(id);

    parent.innerHTML = "";
    
    const types = Object.keys(data.data.ranks);

    for (let i = 0; i < types.length; i ++) {
        parent.innerHTML += `
        <div class="row ${i == 0 ? "border-bottom border-dark mb-3": ""}">
                <div class="col-12 col-xl-4 text-xl-end d-flex flex-column justify-content-center">
                    <p id="${types[i]}-i-button" class="mb-0 text-blue i-button fs-5">${config.deprivation_types[types[i]]}: <img src="assets/img/logo/i-button.svg" width="18" tabindex="0"></p>
                    <p>rank ${data.data.ranks[types[i]]}</p>
                </div>
                <div id="${types[i] == "mdm" ? "overall" : types[i]}-scale-chart" class="col-12 col-xl-8"></div>
                <div id="${types[i]}-i-text" class="i-text-panel border border-secondary">
                    <div class="d-flex flex-row align-items-start p-2">
                        <img src="assets/img/logo/i-button.svg" width="18" class="me-2 mt-1">
                        <p class="mb-0">${config.i_text[types[i]]}</p>
                    </div>
                </div>
            </div>
        `
    }

    for (let i = 0; i < types.length; i ++) {

        scaleChart(`${types[i] == "mdm" ? "overall" : types[i]}-scale-chart`,
            data,
            types[i], 
            {labels: i == 0 ? "above" : i == types.length - 1 ? "below": null}
        )

        document.getElementById(`${types[i]}-i-button`).addEventListener("click", () => {
            document.getElementById(`${types[i]}-i-text`).classList.toggle("is-open");
        })

        document.getElementById(`${types[i]}-i-button`).addEventListener("keydown", (event) => {
            if (event.key == "Enter") {
                document.getElementById(`${types[i]}-i-button`).click();    
            } 
        })
        
    }

}