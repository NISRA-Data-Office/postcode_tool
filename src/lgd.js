import { insertHeader, insertFooter, insertHead } from "./utils/page-layout.js";
import { readData } from "./utils/read-data.js";
import { config } from "./config/config.js";



window.addEventListener("DOMContentLoaded", async () => {

    await insertHead("Local Government District");
    insertHeader();
    insertFooter();


    const params = new URLSearchParams(window.location.search);
    const lgd = params.get("lgd");

    const data = await readData(lgd);
        
    // Update headline
    const headline = document.getElementById("headline");
    headline.innerHTML = `Deprivation in <span class="blue-text">${data.name}</span>`;


})