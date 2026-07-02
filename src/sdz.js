import { insertHeader, insertFooter, insertHead, insertNavButtons } from "./utils/page-layout.js";
import { config } from "./config/config.js";
import { postcodeSearch} from "./utils/postcode-search.js";
import { sharePage } from "./utils/share-page.js";
import { updateSDZ } from "./utils/update-sdz.js"
import { populateInfoBoxes } from "./utils/info-boxes.js";
import { handleOnScroll } from "./utils/scroll-button.js";
import { downloadButton } from "./utils/download-button.js";

window.addEventListener("DOMContentLoaded", async () => {

    await insertHead();
    await postcodeSearch("postcode-search");
    await updateSDZ({ animate: false });
    insertHeader();
    insertFooter();
    
    populateInfoBoxes() 
    handleOnScroll();

    downloadButton("download-btn", "chart-capture", "map");
})

window.addEventListener("popstate", () => updateSDZ({ animate: true }));
window.addEventListener("sdzchange", () => updateSDZ({ animate: true }));

