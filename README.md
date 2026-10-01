# Deprivation in Northern Ireland

This project is a static web application for exploring deprivation across Northern Ireland using the Northern Ireland Multiple Deprivation Measure (MDM) and related domain measures. It is designed around a simple client-side workflow:

- search for a postcode or select a council area;
- view deprivation rankings for a Local Government District (LGD);
- drill down to individual Super Data Zones (SDZs), which are treated as neighbourhoods in the app;
- compare deprivation domains such as income, employment, health, education, services, living environment and crime;
- read plain-language summaries and download chart/map outputs.

The interface is built with HTML, JavaScript, Bootstrap and MapLibre GL. The data files are prepared separately in R and served as static JSON.

---

## What the app does

### Home page

The home page is the entry point for the application. It includes:

- a postcode search box;
- a council-area selector; and
- links into the deprivation profiles for each area.

The main page script for this is in `src/index.js` and is loaded from `index.html`.

### Local Government District profiles

Each LGD profile page shows a detailed area view. The current implementation in `src/area.js` and `src/utils/update-lgd.js` includes:

- the selected council area name and deprivation type;
- a MapLibre-based deprivation map;
- a ranked neighbourhood table;
- a deprivation scale chart;
- a type selector for different deprivation domains;
- summary text with plain-language descriptions;
- focus handling for a selected neighbourhood;
- download buttons for the page and map export;
- postcode search and continued navigation to SDZ pages.

### Super Data Zone profiles

Each SDZ profile page shows the neighbourhood-level detail for a single area. The current implementation in `src/sdz.js` and `src/utils/update-sdz.js` includes:

- overall rank and local context;
- neighbourhood name and parent LGD information;
- a navigation map for the SDZ and surrounding area;
- deprivation summaries for the selected type;
- scale comparisons relative to the wider LGD;
- next-step guidance and contextual narrative text;
- the ability to copy the summary to the clipboard;
- download buttons for chart and map outputs.

### About page

The About page is wired up in `src/about.js` and `about.html`, but it is still a lightweight information page rather than a fully expanded historical or methodology page. It currently provides the site shell and links to central NISRA resources through the shared footer/header components.

---

## Deprivation measures used in the app

The app currently supports the following levels and domains:

| Key            | Measure                                    | Notes                                          |
| -------------- | ------------------------------------------ | ---------------------------------------------- |
| `mdm`        | Overall deprivation                        | Multiple Deprivation Measure                   |
| `income`     | Income deprivation                         | Relative material deprivation                  |
| `employment` | Employment deprivation                     | Work-related deprivation                       |
| `health`     | Health and disability deprivation          | Health burden and disability impact            |
| `education`  | Education, skills and training deprivation | Educational opportunity and attainment impacts |
| `services`   | Access to services deprivation             | Service accessibility deprivation              |
| `living`     | Living environment deprivation             | Housing and local environment deprivation      |
| `crime`      | Crime and disorder deprivation             | Crime-related deprivation                      |

In the app, lower rank numbers indicate greater deprivation. The configuration for these measures is defined in `src/config/config.js`.

---

## Project structure

```text
.
├── README.md
├── index.html
├── area.html
├── sdz.html
├── about.html
├── assets/
│   ├── css/
│   └── img/
├── public/
│   ├── data/
│   ├── map/
│   └── search_data/
├── src/
│   ├── about.js
│   ├── area.js
│   ├── index.js
│   ├── sdz.js
│   ├── config/
│   │   └── config.js
│   ├── r/
│   │   ├── config.R
│   │   ├── process_data.R
│   │   ├── home_page_graphic.R
│   │   ├── update_search_index.R
│   │   └── data/
│   └── utils/
│       ├── page-layout.js
│       ├── postcode-search.js
│       ├── update-lgd.js
│       ├── update-sdz.js
│       ├── plot-scale-map.js
│       ├── plot-nav-map.js
│       ├── deprivation-text.js
│       ├── lgd-menu.js
│       ├── lgd-table.js
│       └── many other helper modules
└── .Rproj
```

The actual page scripts are not all named after the older README list. The current implementation is distributed across the ES module files in `src/utils/` and the page entry points in `src/*.js`.

---

## Data model and source files

The app uses static data files generated for the site rather than a backend API.

### LGD and SDZ data

The JSON files in `public/data/` contain the main deprivation dataset. A representative example is:

```json
{
  "code": "N09000001",
  "name": "Antrim and Newtownabbey",
  "type": "lgd",
  "sdz_count": 850,
  "bounds": [-5.8682, 54.5682, -6.4959, 54.8119],
  "data": {
    "ranks": {
      "N21000001": {
        "name": "Dunsilly A",
        "ranks": {
          "mdm": 666,
          "income": 675,
          "employment": 647,
          "health": 646,
          "education": 648,
          "services": 234,
          "living": 487,
          "crime": 682
        }
      }
    }
  }
}
```

This is the structure consumed by `src/utils/read-data.js` and then rendered into the map, table and summary views.

### Postcode search data

The postcode lookup file is loaded from:

```text
public/search_data/postcode.json
```

This is used by `src/utils/postcode-search.js` to search by postcode or neighbourhood name and route users straight to the relevant SDZ page.

---

## Configuration notes

The app configuration is stored in `src/config/config.js` and currently includes:

- the public site title;
- a `year` value that is currently `null`;
- a `rateit` survey identifier;
- deprivation domain titles and descriptions;
- the colour scale used for map and chart outputs.

This means the site is currently configured in a test or placeholder state, and the page banner will display “Test statistics on deprivation in Northern Ireland...” unless a production year is set.

---

## Data preparation in R

The pre-processing is handled by scripts in `src/r/`.

### `src/r/process_data.R`

Generates the main JSON files for LGDs and SDZs, including rankings, geographic boundaries and hierarchy information.

Important note: this script should be re-run whenever the synthetic data is replaced with final data. In other words, any change to the authoritative deprivation dataset or geography inputs should be reflected in the generated JSON files under `public/data/` before deployment.

### `src/r/update_search_index.R`

Builds the postcode lookup used for search and routing to SDZ pages.

This script reads a cleaned postcode CSV hosted by Techlab from the `nisra-explore/postcode-search` repository, which is linked in the script itself. The CSV used here is not the raw NISRA-hosted CPD file: it has already been cleaned to remove invalid, inaccurate or inactive postcodes before upload. This means the search data may differ from the CPD version available for download from the NISRA website. The script should be re-run whenever a new CPD is issued, which typically happens twice a year.

### `src/r/home_page_graphic.R`

Creates the map graphic used on the homepage and other promoted outputs.

This asset should be regenerated whenever updated deprivation data is added or refreshed, so that the homepage graphic matches the latest published rankings.

### `src/r/config.R`

Stores common configuration variables used by the R data build scripts.

---

## Running the app locally

This project is a static site and must be served over HTTP because the page code fetches JSON and map resources with browser APIs.

### Recommended: VS Code Live Server

1. Open the project folder in VS Code.
2. Install the Live Server extension by Ritwick Dey: https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer
3. In the Explorer, right-click `index.html`.
4. Select **Open with Live Server**.
5. The app will open in your default browser.

Live Server is the recommended option for local development because it serves the project correctly and automatically refreshes the page when files change.

> Do not open the HTML files directly from disk for regular use, because the app loads JSON and other static assets through browser fetch calls.

---

## Important current status notes

- The project is a static front-end app; there is no backend or database.
- The current `about.html` is intentionally minimal and not yet a full publication page.
- The app uses a cookie banner and GTM configuration handled in `src/utils/cookies.js`.
- The app is currently configured for a test dataset state in `src/config/config.js` (`year: null`).
- Rank 1 represents the most deprived area, while the highest numeric ranking is the least deprived within that comparison set.

---

## Accessibility and publishing context

The app includes accessibility and publishing elements such as:

- descriptive labels and text alternatives for interactive controls;
- plain-language summaries of deprivation across domains;
- links to NISRA statistical resources and related pages;
- Bootstrap and custom styling for readability and navigation.

The project is intended to present NISRA deprivation statistics in a more accessible, exploratory web format, but some supporting informational content is still being expanded in the About page and related content files.

---

## Data Sources

The application uses:

* Northern Ireland Multiple Deprivation Measure (NIMDM)
* Central Postcode Directory (CPD)
* Mid-Year Population Estimates
* NISRA geography datasets
* Local Government District geography files
* Super Data Zone geography files

---

## Disclaimer

The current version uses test deprivation data for development and demonstration purposes.

Production releases should be populated with official deprivation statistics and accompanying metadata.
