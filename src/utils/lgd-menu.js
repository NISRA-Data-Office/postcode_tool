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

    for (let i = 0; i < lgd_data.length; i ++) {

        let option = document.createElement("option");
        option.value = lgd_data[i].properties.LGDCode;
        option.textContent = lgd_data[i].properties.LGDNAME;

        lgd_select.appendChild(option);
    }

    const params = new URLSearchParams(window.location.search);
    const current_lgd = params.get("lgd");

    if (current_lgd) {
        lgd_select.value = current_lgd;
    } else {
        lgd_select.selectedIndex = 0;
    }

    lgd_select.addEventListener("change", (e) => {
        const lgd = e.target.value;
        window.location.href = `lgd.html?lgd=${encodeURIComponent(lgd)}`;
    });

}
