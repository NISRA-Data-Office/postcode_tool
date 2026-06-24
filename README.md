# Deprivation in Northern Ireland

An interactive web application for exploring deprivation across Northern Ireland using the Northern Ireland Multiple Deprivation Measure (NIMDM).

The application allows users to:

* Search for a postcode and view deprivation information for its neighbourhood (Super Data Zone).
* Explore deprivation across Local Government Districts (LGDs).
* Compare different domains of deprivation.
* View deprivation rankings on interactive maps.
* Generate plain-language summaries of deprivation statistics.

The application is built using JavaScript, MapLibre GL and Bootstrap, with data preparation carried out in R.

---

## Features

### Home page

Users can:

* Search for a postcode.
* Select a Local Government District.
* Navigate directly to deprivation profiles.

### Local Government District profiles

Each LGD page includes:

* Interactive deprivation map.
* Ranked table of neighbourhoods (Super Data Zones).
* Domain selection for different deprivation measures.
* Summary information describing deprivation within the council area.
* Navigation to neighbouring areas and individual neighbourhood profiles.

### Super Data Zone profiles

Each neighbourhood profile includes:

* Overall deprivation rank.
* Interactive location map.
* Domain-specific deprivation rankings.
* Plain-language deprivation summaries.
* Navigation to surrounding areas.
* Postcode search functionality.

### About page

Provides:

* Publication information.
* Data sources.
* Accessibility information.
* Links to supporting resources and publications.

---

## Deprivation Measures

The application supports the following measures:

| Measure             | Description                                |
| ------------------- | ------------------------------------------ |
| Overall deprivation | Multiple Deprivation Measure               |
| Income              | Income deprivation                         |
| Employment          | Employment deprivation                     |
| Health              | Health and disability deprivation          |
| Education           | Education, skills and training deprivation |
| Services            | Access to services deprivation             |
| Living environment  | Living environment deprivation             |
| Crime               | Crime and disorder deprivation             |

Rank 1 represents the most deprived area.

---

## Technology Stack

### Front End

* HTML5
* JavaScript (ES Modules)
* Bootstrap 5
* MapLibre GL JS

### Data Processing

* R
* dplyr
* readxl
* jsonlite
* sf
* ggplot2

### Mapping

* GeoJSON boundary files
* OpenMapTiles style configuration
* MapLibre GL

---

## Project Structure

```text
.
├── index.html
├── lgd.html
├── sdz.html
├── about.html
│
├── src
│   ├── config
│   ├── utils
│   ├── r
│   └── assets
│
├── public
│   ├── data
│   ├── map
│   └── search_data
│
└── assets
```

### Key JavaScript Files

| File                | Purpose                          |
| ------------------- | -------------------------------- |
| index.js            | Home page functionality          |
| lgd.js              | Local Government District page   |
| sdz.js              | Super Data Zone page             |
| postcode-search.js  | Postcode lookup and navigation   |
| plotScaleMap.js     | LGD deprivation map              |
| plotNavMap.js       | SDZ location map                 |
| scale-chart.js      | Deprivation scale visualisations |
| deprivation-text.js | Summary text generation          |

---

## Data Preparation

Data preparation is carried out using R scripts located in:

```text
src/r/
```

### process_data.R

Creates geography JSON files for:

* Local Government Districts
* Super Data Zones

The script combines:

* Geography hierarchy information
* Population estimates
* Area measurements
* Urban/rural classifications
* Deprivation rankings

Output:

```text
public/data/
```

### search_json.R

Builds postcode lookup data from the Central Postcode Directory.

Output:

```text
public/search_data/postcode.json
```

### home_page_graphic.R

Creates the homepage deprivation map image.

Output:

```text
assets/img/nimdm_sdz_map.png
```

---

## JSON Structure

### Local Government District

```json
{
  "code": "N09000001",
  "name": "Antrim and Newtownabbey",
  "type": "lgd",
  "children": [],
  "children_count": 890,
  "bounds": [],
  "data": {
    "ranks": {}
  }
}
```

### Super Data Zone

```json
{
  "code": "N21000001",
  "name": "Example SDZ",
  "type": "sdz",
  "parents": [],
  "bounds": [],
  "data": {
    "ranks": {
      "mdm": 123,
      "income": 150
    }
  }
}
```

---

## Running the Application

This application loads JSON and GeoJSON files using `fetch()`, so it must be served through a local web server rather than opened directly from the file system.

### Recommended: Visual Studio Code Live Server

1. Open the project folder in Visual Studio Code.
2. Install the **Live Server** extension by Ritwick Dey.
3. Right-click `index.html`.
4. Select **Open with Live Server**.
5. The application will open automatically in your default web browser.

Live Server provides automatic page refresh whenever project files are saved, making it ideal for development and testing.

### Alternative Local Servers

Any local web server capable of serving static files can be used if preferred.

---

## Accessibility

The application is designed to:

* Support keyboard navigation.
* Provide descriptive labels for form controls.
* Use colour alongside text and rankings.
* Include plain-language summaries.
* Link to the NISRA accessibility statement.

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

The current version uses dummy deprivation data for development and demonstration purposes.

Production releases should be populated with official deprivation statistics and accompanying metadata.
