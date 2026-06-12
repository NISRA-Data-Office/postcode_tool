import { insertHeader, insertFooter, insertHead, insertNavButtons } from "./utils/page-layout.js";
import { readData } from "./utils/read-data.js";
import { config } from "./config/config.js";
import { lgdMenu } from "./utils/lgd-menu.js";
import { postcodeSearch } from "./utils/postcode-search.js";
import { typeSelect } from "./utils/type-select.js";
import { populateInfoBoxes } from "./utils/info-boxes.js";
import { insertValue } from "./utils/insert-value.js";
import { plotScaleMap } from "./utils/plotScaleMap.js";



window.addEventListener("DOMContentLoaded", async () => {

    await insertHead("Local Government District");
    insertHeader();
    insertFooter();


    const params = new URLSearchParams(window.location.search);
    const lgd = params.get("lgd");

    const data = await readData(lgd);

    insertNavButtons(data);

    lgdMenu("lgd-select");
    
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
                ""
            ]
        )  
    
    typeSelect("type-select");

    insertValue("place-name", data.name)

    const type_select = document.getElementById("type-select")
    insertValue("deprivation-type", config.deprivation_types[type_select.value].toLowerCase())

    await plotScaleMap("scale-map", data, type_select.value)

    type_select.addEventListener("change", () => {
        insertValue("deprivation-type", config.deprivation_types[type_select.value].toLowerCase())
        // Add events to update map and update table here
        plotScaleMap("scale-map", data, type_select.value)
    });

    


})