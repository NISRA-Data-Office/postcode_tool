# Source package libraries ####
library("dplyr")
library("readxl")
library("stringr")
library("jsonlite")

# Paths to directories ####
## Inputs ####
data_dir <- "src/r/data/"

## Outputs ####
output_dir <- "public/data/"
search_dir <- "public/search_data/"

# Input file names ####
geog_file <- "geog_data_withdz_and_area2.xlsx"
latest_cpd_file <- "CPD_LIGHT_Jan26.csv"
data_filename <- "nimdm-2026-ranks-sdz-dummy-data.csv"

# Geo code lookups ####
code_lookup <- list(
  "N92" = "ctry",
  "N09" = "lgd",
  "N10" = "dea",
  "N20" = "dz",
  "N21" = "sdz"
)

# Statistic lookups ####
stat_lookup <- list(
  "Multiple Deprivation Measure (Rank)" = "mdm",
  "Income Domain (Rank)" = "income",
  "Employment Domain (18-64 years) (Rank)" = "employment",
  "Health Deprivation and Disability Domain (Rank)" = "health",
  "Education, Skills and Training Domain (Rank)" = "education",
  "Access to Services Domain (Rank)" = "services",
  "Living Environment Domain (Rank)" = "living",
  "Crime and Disorder Domain (Rank)" = "crime"
)
