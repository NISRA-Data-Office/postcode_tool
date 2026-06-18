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
                class="next-step-btn purple-bg black-border text-white d-flex align-items-center justify-content-center text-center fs-5 p-3 mt-3 w-100 h-100"
                data-target="${item.link}"
                aria-label="${item.title}">
                ${item.text}
            </button>
        </div>
    `;
} else {
    // Use link to navigate to different page
    html += `
        <div class="col-12 col-md-6 col-lg-4 mb-4 d-flex">
            <a 
                href="${item.link}" 
                class="text-white purple-bg black-border d-flex align-items-center justify-content-center text-center fs-5 p-3 mt-3 w-100 h-100 text-decoration-none"
                aria-label="${item.title}"
                ${item.newTab ? 'target="_blank" rel="noopener"' : ''}>
                ${item.text}
            </a>
        </div>
    `;
}

});

next_step_boxes.innerHTML = html;
}
