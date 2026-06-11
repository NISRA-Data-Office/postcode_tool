import { scaleChart } from "./scale-chart.js";
import { config } from "../config/config.js";

export function insertScaleTable (id, data) {

    console.log(data);

    const parent = document.getElementById(id);
    
    const types = Object.keys(data.data.ranks);

    for (let i = 0; i < types.length; i ++) {
        parent.innerHTML += `
        <div class="row ${i == 0 ? "border-bottom": ""}">
                <div class="col-12 col-xl-3 text-xl-end d-flex flex-column justify-content-center">
                    <p class="mb-0 blue-text">${config.deprivation_types[types[i]]}:</p>
                    <p>rank ${data.data.ranks[types[i]]}</p>
                </div>
                <div id="${types[i] == "mdm" ? "overall" : types[i]}-scale-chart" class="col-12 col-xl-9"></div>
            </div>
        `

        scaleChart(`${types[i] == "mdm" ? "overall" : types[i]}-scale-chart`,
            data,
            types[i], 
            i == 0 ? "above" : i == types.length - 1 ? "below": null
        )
        
    }

}