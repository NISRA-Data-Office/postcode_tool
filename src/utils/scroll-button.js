let buttonVisibleOnPX = 200;

const goStart = () => {
    document.body.scrollIntoView();
}

const scrollElement = () => {
    return document.documentElement || document.body;
};

export const handleOnScroll = () => {

    const scroll_btn = document.getElementById("scroll-btn");

    scroll_btn.classList.add("border-0");
    scroll_btn.classList.add("border-top");
    scroll_btn.classList.add("border-secondary");
    scroll_btn.classList.add("position-fixed");
    scroll_btn.classList.add("w-100");
    scroll_btn.classList.add("py-1");
    scroll_btn.classList.add("bg-light");
    scroll_btn.classList.add("text-center");
    scroll_btn.classList.add("fw-bold");
    scroll_btn.classList.add("fixed-bottom");

    if (!scroll_btn) return;

    if (scrollElement().scrollTop > buttonVisibleOnPX) {
        scroll_btn.classList.remove("d-none");
    } else {
        scroll_btn.classList.add("d-none");
    }

    scroll_btn.addEventListener("click", goStart);
};

window.addEventListener("scroll", handleOnScroll);