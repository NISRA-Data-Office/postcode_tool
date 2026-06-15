import { insertHeader, insertFooter, insertHead } from "./utils/page-layout.js";
import { config } from "./config/config.js";


window.addEventListener("DOMContentLoaded", async () => {

    await insertHead("Home");
    insertHeader();
    insertFooter();

    const nav = document.getElementById("nav");

    nav.innerHTML = `
    <ol class="breadcrumb mb-0 mt-2 mb-2 text-secondary">
      <li class="breadcrumb-item">
        <a href="index.html">Home</a>
      </li>
      <li class="breadcrumb-item">
        About
      </li>
    </ol>
  `
    

})