import { insertHeader, insertFooter, insertHead } from "./utils/page-layout.js";
import { config } from "./config/config.js";
import { lgdMenu } from "./utils/lgd-menu.js";

window.addEventListener("DOMContentLoaded", async () => {

    await insertHead("Home");
    insertHeader();
    insertFooter();

    lgdMenu("lgd-select");   
    

})