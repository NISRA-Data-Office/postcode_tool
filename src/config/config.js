export const config = {
    // Dashboard title
    "title": "Deprivation in Northern Ireland",

    // Deprivation year, eg 2026
    // Set to null to display test data message
    "year": null,

    "rateit": "NI_Deprivation_tool",

    "deprivation_types": {
        "mdm": {
            "title": "Overall MDM",
            "description": "<p>This is the overall measure. It is called the Multiple Deprivation Measure, or MDM. It brings together different types of deprivation in this neighbourhood.</p>"
        },
        "income": {
            "title": "Income",
            "description": `<p>This shows how many people have a low income. It includes people who are not in work and people who have a job but do not earn very much.</p><p>This makes up 25% of a neighbourhood's overall MDM deprivation score.</p>`
        },
        "employment": {
            "title": "Employment",
            "description": `<p>This shows how many working-age people are not in work when they would like to be. This may be because of illness, disability, or caring for someone else.</p><p>This makes up 25% of a neighbourhood's overall MDM deprivation score.</p>`
        },
        "health": {
            "title": "Health and disability",
            "description": `<p>This shows where people are affected by poor health. It includes the risk of dying earlier than expected and having a lower quality of life because of physical or mental health problems.</p><p>This makes up 15% of a neighbourhood's overall MDM deprivation score.</p>`
        },
        "education": {
            "title": "Education, skills and training",
            "description": `<p>This shows where people may have fewer chances to learn and build skills. It looks at children, young people, and adults.</p><p>This makes up 15% of a neighbourhood's overall MDM deprivation score.</p>`
        },
        "services": {
            "title": "Access to services",
            "description": `<p>This shows how easy it is for people to use important services. This includes getting to services in person and using services online.</p><p>This makes up 10% of a neighbourhood's overall MDM deprivation score.</p>`
        },
        "living": {
            "title": "Living environment",
            "description": `<p>This shows problems with homes and the local area. It includes whether people can get suitable homes and whether the local environment is good to live in.</p><p>This makes up 5% of a neighbourhood's overall MDM deprivation score.</p>`
        },
        "crime": {
            "title": "Crime and disorder",
            "description": `<p>This shows the risk of crime and disorder in an area. It includes crimes against people and crimes involving property.</p><p>This makes up 5% of a neighbourhood's overall MDM deprivation score.</p>`
        }
    },


    scale_colours: [
        "#00205B",
        "#385384",
        "#7086AD",
        "#A8B8D6",
        "#E0EBFF",
        "#EEFBE0",
        "#CDE5B0",
        "#ABD07F",
        "#8ABA4F",
        "#68A41E"
    ]
    
}