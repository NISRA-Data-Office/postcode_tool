source("src/r/config.R")

# Import CPD ####

cpd <- read_csv("https://raw.githubusercontent.com/nisra-explore/postcode-search/refs/heads/main/CPD_LIGHT.csv",
                show_col_types = FALSE) %>%
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
