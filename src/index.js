import { insertHeader, insertFooter, insertHead } from "./utils/page-layout.js";
import { config } from "./config/config.js";
import { lgdMenu } from "./utils/lgd-menu.js";
import { postcodeSearch } from "./utils/postcode-search.js";

window.addEventListener("DOMContentLoaded", async () => {

    await insertHead("Home");
    insertHeader();
    insertFooter();

    lgdMenu("lgd-select");

    postcodeSearch("postcode-search");
    

})