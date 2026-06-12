export async function lgdMenu (id) {
    
    const lgd_select = document.getElementById(id);
    let lgd_data;

    try {
        const res = await fetch("public/map/LGD2014.geo.json");
        const data = await res.json();

        lgd_data = data.features;

    } catch (error) {
        console.error("Failed to load data:", error);
        return; 
    }

    const params = new URLSearchParams(window.location.search);
    const current_lgd = params.get("lgd");

    const placeholder = document.createElement("option");
    placeholder.textContent = "Select a council";
    placeholder.value = "";
    placeholder.disabled = true;
    placeholder.selected = !current_lgd;

    lgd_select.appendChild(placeholder);

    for (let i = 0; i < lgd_data.length; i ++) {

        let option = document.createElement("option");
        option.value = lgd_data[i].properties.LGDCode;
        option.textContent = lgd_data[i].properties.LGDNAME;

        lgd_select.appendChild(option);
    }

    if (current_lgd) {
        lgd_select.value = current_lgd;
    }    

    lgd_select.addEventListener("change", (e) => {
        const lgd = e.target.value;
        if (window.location.pathname == "/lgd.html") {
            window.history.replaceState(
                {},
                '',
                `lgd.html?lgd=${encodeURIComponent(lgd)}`
            );

            window.dispatchEvent(new Event("lgdchange"));
        } else {
            window.location.href = `lgd.html?lgd=${encodeURIComponent(lgd)}`;
        }
        
    });

}
