const labels = [
  `What you can use the rankings for?`,
  `What you should not use the rankings for?`,
  `Comparing the Multiple Deprivation Measures with the individual domains`
];

const content = [
  `<p>You can use the rankings to:</p>
  <ul class="tick-list">
    <li>Compare areas to see which are more or less deprived</li>
    <li>Find the most and least deprived areas</li>
    <li>Look at patterns across places to see where deprivation is highest or lowest</li>
    <li>See how areas change over time, including which areas move in or out of the most deprived group</li>
   </ul>
   <p>You can do this for Northern Ireland as a whole, for each Local Government District, or for other large areas.</p>`,

  `<p>You should not use the rankings to:</p>
  <ul class="x-list">
    <li>Identify deprived people or groups &ndash; they describe areas, not individuals</li>
    <li>Measure how deprived an area is in absolute terms &ndash; they only rank areas against each other</li>
    <li>Say how much more deprived one area is than another &ndash; they only show order, not size of difference</li>
    <li>Track changes in absolute deprivation over time &ndash; they show a point in time, not change in level</li>
    <li>Measure wealth or affluence &ndash; not being deprived does not always mean being well off</li>
    <li>Compare with other UK countries &ndash; each country uses different data and methods</li>
   </ul>`,
   

  `<p>The seven types of deprivation each make up part of the overall measure. They are combined using set weights.</p>
   <p>The overall measure gives a single summary for each area. However, it can hide important differences between the types of deprivation.</p>
   <p>NISRA encourages you to look at both the overall measure and the individual types. This is especially helpful when focusing on a specific issue or when choosing ways to improve deprivation.</p>`
];

export function populateInfoBoxes() {
  const info_boxes = document.getElementById("info-boxes");
  info_boxes.classList.add("mt-4");

  let buttons = "";
  for (let i = 0; i < labels.length; i++) {
    let button_style = "";
    if (i === labels.length - 1) {
      button_style += "border-right: 2px solid var(--nisra_navy);";
    }

    buttons += `
      <div class="col-12 col-sm p-0">
        <h2 class="accordion-header h-100" role="heading">
          <button
            class="accordion-button collapsed h-100 info-tab-btn"
            type="button"
            style="${button_style}"
            data-index="${i}"
            aria-expanded="false"
            aria-controls="infoCollapse"
          >
            ${labels[i]}
          </button>
        </h2>
      </div>
    `;
  }

  info_boxes.innerHTML = `
    <div class="row justify-content-center">
      <div class="accordion py-4" id="infoAccordion">
        <div class="row g-3">
          ${buttons}
        </div>

        <div class="info-card-wrap">
          <div id="info-card" class="card my-3 rounded-0 border border-secondary">

            <div id="infoCollapse" class="accordion-collapse collapse" data-active-index="">
              <div class="accordion-body">
                <h2 id="infoTitle" style="color:var(--nisra_navy);"></h2>
                <div id="infoBody"></div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  `;

  // Hook up behaviour
  const collapseEl = document.getElementById("infoCollapse");
  const titleEl = document.getElementById("infoTitle");
  const bodyEl = document.getElementById("infoBody");
  const btns = info_boxes.querySelectorAll(".info-tab-btn");

  // Bootstrap Collapse controller
  const bsCollapse = bootstrap.Collapse.getOrCreateInstance(collapseEl, { toggle: false });

  function setActiveButton(activeIdx) {
    btns.forEach((b, idx) => {
      const isActive = idx === activeIdx;
      b.classList.toggle("collapsed", !isActive);
      b.setAttribute("aria-expanded", String(isActive));
    });
  }

  function setContent(idx) {
    titleEl.textContent = labels[idx];
    bodyEl.innerHTML = content[idx];
    collapseEl.dataset.activeIndex = String(idx);
  }

  btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.index);
      const isOpen = collapseEl.classList.contains("show");
      const activeIdx = collapseEl.dataset.activeIndex === "" ? null : Number(collapseEl.dataset.activeIndex);

      const parentCol = btn.closest(".col-12");
      const cardWrap = document.querySelector(".info-card-wrap");

      if (window.innerWidth <= 575) {
        parentCol.after(cardWrap);
      }

      if (!isOpen) {
        setContent(idx);
        setActiveButton(idx);
        bsCollapse.show();
        return;
      }

      // If open and clicking same header: close with animation
      if (activeIdx === idx) {
        setActiveButton(-1); // mark all collapsed
        bsCollapse.hide();
        collapseEl.dataset.activeIndex = "";
        return;
      }

      // If open and clicking different header: NO animation, just swap content
      setContent(idx);
      setActiveButton(idx);
    });
  });

  // When collapse fully hides, make sure buttons reflect state
  collapseEl.addEventListener("hide.bs.collapse", () => {
    btns.forEach((b) => {
      b.classList.add("collapsed");
      b.setAttribute("aria-expanded", "false");
    });
    
    const cardWrap = document.querySelector(".info-card-wrap");
    const accordion = document.getElementById("infoAccordion");
    
    accordion.appendChild(cardWrap);
  });
}
