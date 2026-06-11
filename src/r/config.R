library("dplyr")
library("readxl")
library("stringr")
library("jsonlite")

data_dir <- "src/r/data/"
output_dir <- "public/data/"
search_dir <- "public/search_data/"

geog_file <- "geog_data_withdz_and_area2.xlsx"
template_file <- "template - main_no_data.json"
latest_cpd_file <- "CPD_LIGHT_Jan26.csv"
search_data_filename <- "postcode_JAN2026.csv"

code_lookup <- list(
  "N92" = "ctry",
  "N09" = "lgd",
  "N10" = "dea",
  "N20" = "dz",
  "N21" = "sdz"
)

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
