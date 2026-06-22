export function populateNextStepBoxes(data) {



    const next_step_boxes = document.getElementById("next-steps");

    const info = [
    {
      text: `Explore deprivation in areas surrounding ${data.name} using maps and tables`,
      link: `lgd.html?lgd=${data.parents[0].code}&sdz=${data.code}`
    },
    {
      text: `Back to top and enter another postcode`,
      link: "postcode-search"
    },
    {
      text: `View other deprivation resources. Reports, detailed tables and background information`,
      link: `https://www.nisra.gov.uk/statistics/people-and-communities/deprivation-and-poverty`
    }
  ]

    let html = "";

    info.forEach(item => {
    // Navigate to element on the same page
    if (document.getElementById(item.link)) {
    html += `
        <div class="col-12 col-md-6 col-lg-4 mb-4 d-flex">
            <button 
                type="button"
                class="next-step-btn text-white d-flex align-items-center justify-content-center text-center fs-5 p-3 mt-3 w-100 h-100"
                data-target="${item.link}"
                style="background-color: var(--nisra_purple); border: 2px solid black;">
                ${item.text}
            </button>
        </div>
    `;
} else {
    // Use link to navigate to different page
    html += `
        <div class="col-12 col-md-6 col-lg-4 mb-4 d-flex">
            <a href="${item.link}" class="text-decoration-none d-flex w-100">
                <div 
                    class="text-white d-flex align-items-center justify-content-center text-center fs-5 p-3 mt-3 w-100 h-100"
                    style="background-color: var(--nisra_purple); border: 2px solid black;">
                    ${item.text}
                </div>
            </a>
        </div>
    `;
}

});

next_step_boxes.innerHTML = html;

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".next-step-btn");
  if (!btn) return;

  const targetId = btn.dataset.target;
  const input = document.getElementById(targetId);

  if (input) {
    input.scrollIntoView({ behavior: "smooth", block: "center" });
    input.focus({ preventScroll: true });
  }
});
}
