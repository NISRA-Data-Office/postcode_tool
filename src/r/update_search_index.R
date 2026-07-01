source("src/r/config.R")

# Import CPD ####

cpd <- read.csv(paste0(data_dir, latest_cpd_file)) %>%
  filter(SDZ2021 != "000000000" & X != 666666 & Y != 666666) %>%
  mutate(
    postcode = paste0(
      substr(PC5, 1, nchar(PC5) - 3),
      " ",
      substr(PC5, nchar(PC5) - 2, nchar(PC5))
    ),
    SDZ2021_name = gsub("_", " ", SDZ2021_name)
  )

# Create search data json ####

SDZs <- cpd$SDZ2021 %>%
  unique()

search_json <- list()

for (sdz in SDZs) {

  sdz_name <- cpd %>%
    filter(SDZ2021 == sdz) %>%
    first() %>%
    pull(SDZ2021_name)

  postcodes <- cpd %>%
    filter(SDZ2021 == sdz) %>%
    pull(postcode)

  search_json[[sdz]] <- list(
    name = sdz_name,
    codes = postcodes
  )
}

write_json(
  search_json,
  paste0(search_dir, "postcode.json"),
  auto_unbox = TRUE,
  pretty = TRUE
)
