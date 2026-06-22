import { scaleChart } from "./scale-chart.js";
import { config } from "../config/config.js";

const i_text = {
    "mdm": "This is an overall measure, called the Index of Multiple Deprivation. It is calculated by combining different types of deprivation in this neighbourhood.",
    "income": "This type of deprivation identifies the proportion of the population living in households whose equivalised income is below 60% of the NI median.",
    "employment": "This type of deprivation identifies the proportion of the working age population excluded from work.",
    "health": "This type of deprivation identifies proportions of the population whose quality of life is impaired by poor health or disability.",
    "education": "This type of deprivation identifies the prevalence of poor educational outcomes for children and low levels of qualifications for working age adults.        ",
    "services" : "This type of deprivation measures the extent to which people have poor physical and online access to key services.",
    "living": "This type of deprivation identifies the prevalence of shortcomings in the quality of housing, access to suitable housing, and the outdoor physical environment.",
    "crime": "This type of deprivation identifies rates of crime and disorder."
}

export function insertScaleTable (id, data) {

    const parent = document.getElementById(id);

    parent.innerHTML = "";
    
    const types = Object.keys(data.data.ranks);

    for (let i = 0; i < types.length; i ++) {
        parent.innerHTML += `
        <div class="row ${i == 0 ? "border-bottom": ""}">
                <div class="col-12 col-xl-4 text-xl-end d-flex flex-column justify-content-center">
                    <p id="${types[i]}-i-button" class="mb-0 blue-text i-button">${config.deprivation_types[types[i]]}: <img src="assets/img/logo/i-button.svg" width="18"></p>
                    <p>rank ${data.data.ranks[types[i]]}</p>
                </div>
                <div id="${types[i] == "mdm" ? "overall" : types[i]}-scale-chart" class="col-12 col-xl-8"></div>
                <div id="${types[i]}-i-text" class="card d-none my-2"><div class="card-body">${i_text[types[i]]}</div></div>
            </div>
            <div id="${types[i]}-i-text" class="card d-none my-2"><div class="card-body">${i_text[types[i]]}</div></div>
        `
    }

    for (let i = 0; i < types.length; i ++) {

        scaleChart(`${types[i] == "mdm" ? "overall" : types[i]}-scale-chart`,
            data,
            types[i], 
            i == 0 ? "above" : i == types.length - 1 ? "below": null
        )

        document.getElementById(`${types[i]}-i-button`).addEventListener("click", () => {
            document.getElementById(`${types[i]}-i-text`).classList.toggle("d-none")
        })
        
    }

}