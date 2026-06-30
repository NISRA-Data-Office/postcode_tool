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
        '#00205b', 
        '#0B3270',
        '#164385',
        '#22559B',
        '#2D66B0',
        '#3878c5',
        '#44839B',
        '#508E72',
        '#5C9948',
        '#68A41E'
    ]
    
}