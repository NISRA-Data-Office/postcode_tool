export const config = {
    // Dashboard title
    "title": "Deprivation in Northern Ireland",

    // Deprivation year, eg 2026
    // Set to null to display dummy data message
    "year": null,

    "rateit": "link-to-rateit",

    "deprivation_types": {
        "mdm": "Overall deprivation",
        "income": "Income",
        "employment": "Employment",
        "health": "Health and disability",
        "education": "Education, skills and training",
        "services" : "Access to services",
        "living": "Living environment",
        "crime": "Crime and disorder"
    },

    "i_text": {
        "mdm": "This is an overall measure called the Multiple Deprivation Measure. It combines different types of deprivation in this area.",
        "income": "This shows how many people live in low income households. These households earn less than 60% of the Northern Ireland average.",
        "employment": "This shows how many working age people are not in work.",
        "health": "This shows how many people have poor health or a disability that affects their daily life.",
        "education": "",
        "services" : "This shows how easy it is for people to get to key services, both in person and online.",
        "living": "This shows problems with housing, access to suitable homes, and the local environment.",
        "crime": "This shows levels of crime and disorder in the area."
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