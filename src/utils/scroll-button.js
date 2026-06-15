let buttonVisibleOnPX = 200;

export const goStart = () => {
    document.body.scrollIntoView();
}

const scrollElement = () => {
    return document.documentElement || document.body;
};

const handleOnScroll = () => {
    const scroll_btn = document.getElementById("scroll-btn");
    if (!scroll_btn) return;

    if (scrollElement().scrollTop > buttonVisibleOnPX) {
        scroll_btn.classList.remove("hidden");
    } else {
        scroll_btn.classList.add("hidden");
    }
};

window.addEventListener("scroll", handleOnScroll);