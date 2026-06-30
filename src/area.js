import { insertHeader, insertFooter, insertHead, insertNavButtons } from "./utils/page-layout.js";
import { postcodeSearch } from "./utils/postcode-search.js";
import { typeSelect } from "./utils/type-select.js";
import { populateInfoBoxes } from "./utils/info-boxes.js";
import { handleOnScroll } from "./utils/scroll-button.js";
import { sharePage } from "./utils/share-page.js";
import { updateLGD } from "./utils/update-lgd.js";
import { clearSdzFocus } from "./utils/clear-sdz-focus.js";

window.addEventListener("DOMContentLoaded", async () => {
  await insertHead("Local Government District");
  insertHeader();
  insertFooter();
  postcodeSearch("postcode-search");

  populateInfoBoxes();

  typeSelect("type-select");

  await updateLGD({ animate: false });

  handleOnScroll();
  clearSdzFocus();

});

window.addEventListener("popstate", () => updateLGD({ animate: true }));
window.addEventListener("lgdchange", () => updateLGD({ animate: true }));