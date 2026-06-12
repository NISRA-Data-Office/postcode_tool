import { config } from "../config/config.js";

export function typeSelect (id) {
        const type_select = document.getElementById(id);

        const types = Object.keys(config.deprivation_types);

        for (let i = 0; i < types.length; i ++) {
            let option = document.createElement("option");
            option.value = types[i];
            option.textContent = config.deprivation_types[types[i]];
            type_select.appendChild(option)
        }
    }