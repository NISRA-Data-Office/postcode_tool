import { insertHeader, insertFooter, insertHead, insertNavButtons } from "./utils/page-layout.js";
import { config } from "./config/config.js";
import { postcodeSearch} from "./utils/postcode-search.js";
import { typeSelect } from "./utils/type-select.js";
import { sharePage } from "./utils/share-page.js";
import { updateSDZ } from "./utils/update-sdz.js"
import { populateInfoBoxes } from "./utils/info-boxes.js";
import { handleOnScroll } from "./utils/scroll-button.js";
import { downloadButton } from "./utils/download-button.js";
import { pageDownloadButton } from "./utils/page-download-button.js";
import { initCookieConsent } from "./utils/cookies.js";

window.addEventListener("DOMContentLoaded", async () => {

    await insertHead();
    await postcodeSearch("postcode-search");
    typeSelect("type-select");
    await updateSDZ({ animate: false });
    insertHeader();
    insertFooter();
    
    populateInfoBoxes();
    handleOnScroll();

    pageDownloadButton("download-page-btn");
    downloadButton("download-btn", "map-capture", "map");
    downloadButton("download-charts-btn","chart-capture","chart");

    initCookieConsent({
        bannerId: 'cookie-banner',
        gtmId: 'GTM-WKK8ZWP'
    });
})

window.addEventListener("popstate", () => updateSDZ({ animate: true }));
window.addEventListener("sdzchange", () => updateSDZ({ animate: true }));

