import { insertHeader, insertFooter, insertHead, insertNavButtons } from "./utils/page-layout.js";
import { config } from "./config/config.js";
import { postcodeSearch} from "./utils/postcode-search.js";
import { sharePage } from "./utils/share-page.js";
import { updateSDZ } from "./utils/update-sdz.js"
import { populateInfoBoxes } from "./utils/info-boxes.js";
import { handleOnScroll } from "./utils/scroll-button.js";

window.addEventListener("DOMContentLoaded", async () => {

  
    await insertHead();
    await postcodeSearch("postcode-search", "Enter another postcode");
    await updateSDZ({ animate: false });
    insertHeader();
    insertFooter();
    
    populateInfoBoxes() 
    handleOnScroll();   

})

window.addEventListener("popstate", () => update_sdz({ animate: true }));
window.addEventListener("sdzchange", () => update_sdz({ animate: true }));