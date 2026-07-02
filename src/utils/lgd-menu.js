export let lgd_codes;

export async function lgdMenu (id) {
    
    const lgd_select = document.getElementById(id);
    let lgd_data;

    try {
        const res = await fetch("public/data/N92000002.json");
        const data = await res.json();

        lgd_data = data.data.lgd;
        lgd_codes = Object.keys(lgd_data);

    } catch (error) {
        console.error("Failed to load data:", error);
        return; 
    }

    const params = new URLSearchParams(window.location.search);
    const current_lgd = params.get("code");

    const placeholder = document.createElement("option");
    placeholder.textContent = "Select a council area";
    placeholder.value = "";
    placeholder.disabled = true;
    placeholder.selected = !current_lgd;

    const current_options = lgd_select.options;
    let has_placeholder = false;
    
    for (let i = 0; i < current_options.length; i ++) {
        if (current_options[i].value == placeholder.value) {
            has_placeholder = true;
        } 
    }

    if (!has_placeholder) {
        lgd_select.appendChild(placeholder);
    }

    for (let i = 0; i < lgd_codes.length; i ++) {

        const lgd_key = lgd_codes[i];
        const lgd_name = lgd_data[lgd_key].name;

        let option = document.createElement("option");
        option.value = lgd_key;
        option.textContent = lgd_name;

        let has_option = false;

        for (let j = 0; j < current_options.length; j ++) {
            if (current_options[j].value == option.value) {
                has_option = true;
            } 
        }

        if (!has_option) {
            lgd_select.appendChild(option);
        }
        
    }

    if (current_lgd) {
        lgd_select.value = current_lgd;
    }    

    lgd_select.addEventListener("change", (e) => {
        const lgd = e.target.value;

        
        if (window.location.pathname.includes("area.html")) {
            window.history.pushState(
                {},
                '',
                `area.html?code=${encodeURIComponent(lgd)}`
            );

            window.dispatchEvent(new Event("lgdchange"));
        } else {
            window.location.href = `area.html?code=${encodeURIComponent(lgd)}`;
        }
        
    });

}
