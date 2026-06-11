export const config = {
    // Dashboard title
    "title": "Deprivation in Northern Ireland",

    // Set order of page links and display text in navigation bar
    "navigation": [
        { href: "index.html", text: "Home" },
        { href: "lgd.html", text: "LGD" },
        { href: "sdz.html", text: "SDZ" }  
    ],
    
    "portal_url": "https://data.nisra.gov.uk/",

    // Departmental abbreviations. See departments.js for available options
    "department": "DoF",

    // Data portal tables to use in the dashboard.
    "matrix": [
        "EXAMPLETABLE1",
        "EXAMPLETABLE2"
    ],
    
    "rateit": "link-to-rateit"
    
}