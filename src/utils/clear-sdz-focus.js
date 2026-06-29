import { updateLGD } from "./update-lgd.js";

export function clearSdzFocus() {

    const btn = document.getElementById("clear-focus");

    btn.addEventListener("click", async () => {
        const url = new URL(window.location);
        url.searchParams.delete("sdz");

        window.history.replaceState(
            {},
            "",
            `${url.pathname}${url.search}${url.hash}`
        );

        await updateLGD({ animate: true });

        // Hide the clear button (or its parent)
        document.querySelector("#in-focus").classList.remove("is-open");

        // Notify the rest of the app
        window.dispatchEvent(new CustomEvent("sdzselect", {
            detail: { code: null }
        }));
    })

}