import { insertHeader, insertFooter, insertHead, insertNavButtons } from "./utils/page-layout.js";
import { readData } from "./utils/read-data.js";
import { insertValue } from "./utils/insert-value.js";
import { latest_year, updateYearSpans, first_year } from "./utils/update-years.js";
import { toTitleCase } from "./utils/to-title-case.js";
import { config } from "./config/config.js";

window.addEventListener("DOMContentLoaded", async () => {

    await insertHead("Super Data Zone");
    insertHeader();
    insertFooter();

    const params = new URLSearchParams(window.location.search);
    const sdz = params.get("sdz");
    const postcode = params.get("postcode");

    const data = await readData(sdz);
        
    // Update headline
    const headline = document.getElementById("headline");
    headline.innerHTML = postcode ? `${postcode} is in <span class="blue-text">${data.name}</span>` : `Deprivation in <span class="blue-text">${data.name}</span>`

    insertNavButtons(data);


})