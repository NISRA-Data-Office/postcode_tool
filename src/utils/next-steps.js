export function populateNextStepBoxes(info) {
    const next_step_boxes = document.getElementById("next-steps");

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
                style="background-color: var(--nisra_purple); border: none; cursor: pointer;">
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
                    style="background-color: var(--nisra_purple);">
                    ${item.text}
                </div>
            </a>
        </div>
    `;
}

});

next_step_boxes.innerHTML = html;
}
