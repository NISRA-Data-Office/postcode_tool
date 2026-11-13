# Deprivation in Northern Ireland

## Development

Before starting, make sure you have installed node from the software center.

Install dependencies with `npm install` then run locally with

```
npm run dev
```

Make changes in a branch then open a pull request for review.

## Data

There are R scripts for preparing data in the `r` folder. These haven't been updated since restructuring, paths will need fixed before they can be rerun.

Data files are created separately for Northern Ireland, each Local Government District, and each Super Data Zone. These are under `static/public/data` and are named with the area code. Data for each area page is loaded under `src/routes/areas/[code]/+page.ts`, which just reads from these files.

## Structure

This project uses [Svelte](https://svelte.dev/), a framework for building web apps. The project follows a standard structure:

- `src/lib` - helper functions and assets used in the app
- `src/lib/components` - svelte components used in pages
- `src/routes` - correspond to different pages available in the app
- `src/routes/areas/[code]` - used to generate a page for each area

There are some other folders in this repository:

- `tests` - end-to-end tests using playwright (these need updated)
- `r` - R scripts used to generate data (also need updated)
- `static` - files which are served "as-is" when the app is built, mostly just holding data files (which could be moved elsewhere) and assets used in the old version of the app

## Building

Build website by running:

```
npm run build
```

This creates a folder called "build" which contains the built website.

Alternatively, pushes to main will automatically be deployed to Github pages at <https://nisra-data-office.github.io/postcode_tool/>.
