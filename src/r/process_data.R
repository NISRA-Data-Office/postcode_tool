source("src/r/config.R")

# Import geographical information ####

geog_levels <- read_excel(paste0(data_dir, geog_file),
                          sheet = "Number of Geogs")

children <- read_excel(paste0(data_dir, geog_file),
                       sheet = "ParentChild") %>%
  mutate(ChildName = case_when(
    grepl("_", ChildName) ~ gsub("_", " ", ChildName),
    TRUE ~ gsub(" And "," and ", str_to_title(ChildName))
  )) %>%
  rename(code = ChildCode,
         name = ChildName,
         parent_code = ParentCode) %>%
  mutate(type = unlist(code_lookup[substr(code, 1, 3)])) %>%
  filter(type %in% c("sdz", "lgd", "dea"))

grandparent_lookup <- children %>% 
  select(parent_code = code, grandparent_code = parent_code)

children <- left_join(
  children,
  grandparent_lookup,
  by = "parent_code"
) %>% 
  filter(type != "dea")


map_bounds <- read_excel(paste0(data_dir, geog_file),
                         sheet = "MapBounds") %>%
  rename(geog = "...1")


hectares <- read_excel(paste0(data_dir, geog_file),
                       sheet = "geog_areas") %>%
  filter(substr(geocode, 1, 3) != "N08") %>%
  mutate(type = unlist(code_lookup[substr(geocode, 1, 3)])) %>%
  filter(type %in% c("sdz", "lgd"))

lgd_description <- read_excel(paste0(data_dir, geog_file),
                              sheet = "lgd_description")

# Import CPD ####

cpd <- read.csv(paste0(data_dir, latest_cpd_file))

## Urban Rural status ####

urban_rural <- cpd %>%
  filter(SDZ2021 != "000000000") %>%
  select(SDZ2021, SETTLEMENT15_URBAN_RURAL) %>%
  distinct() %>%
  group_by(SDZ2021) %>%
  mutate(rows = n(),
         type = case_when(rows == 2 ~ "a mix of urban and rural",
                          TRUE ~ tolower(SETTLEMENT15_URBAN_RURAL))) %>%
  ungroup() %>% 
  select(-SETTLEMENT15_URBAN_RURAL, - rows) %>% 
  distinct()

# Import MDM data ####

nimdm <- read.csv(paste0(data_dir, data_filename))

# Import from Data Portal ####

## MYE01T012 - MYE by SDZ ####

sdz_mye_raw <- fromJSON(
  txt = paste0(
    "https://ws-data.nisra.gov.uk/public/api.jsonrpc?data=%7B%22jsonrpc%22:%222.0%22,%22method%22:%22PxStat.Data.Cube_API.ReadDataset%22,%22params%22:%7B%22class%22:%22query%22,%22id%22:%5B%22TLIST(A1)%22,%22broadage4%22,%22Sex%22%5D,%22dimension%22:%7B%22TLIST(A1)%22:%7B%22category%22:%7B%22index%22:%5B%22",
    "2024%22%5D%7D%7D,%22broadage4%22:%7B%22category%22:%7B%22index%22:%5B%22All%22%5D%7D%7D,%22Sex%22:%7B%22category%22:%7B%22index%22:%5B%22All%22%5D%7D%7D%7D,%22extension%22:%7B%22pivot%22:null,%22codes%22:false,%22language%22:%7B%22code%22:%22en%22%7D,%22format%22:%7B%22type%22:%22JSON-stat%22,%22version%22:%222.0%22%7D,%22matrix%22:%22MYE01T012%22%7D,%22version%22:%222.0%22%7D%7D"
  )
)

sdz_mye <- data.frame(
  area = sdz_mye_raw$result$dimension$SDZ2021$category$index,
  mye = sdz_mye_raw$result$value
)


## MYE01T06 - MYE by LGD ####

lgd_mye_raw <- fromJSON(
  txt = paste0(
    "https://ws-data.nisra.gov.uk/public/api.jsonrpc?data=%7B%22jsonrpc%22:%222.0%22,%22method%22:%22PxStat.Data.Cube_API.ReadDataset%22,%22params%22:%7B%22class%22:%22query%22,%22id%22:%5B%22TLIST(A1)%22,%22rounded_unrounded%22%5D,%22dimension%22:%7B%22TLIST(A1)%22:%7B%22category%22:%7B%22index%22:%5B%22",
    "2024%22%5D%7D%7D,%22rounded_unrounded%22:%7B%22category%22:%7B%22index%22:%5B%22Unrounded%22%5D%7D%7D%7D,%22extension%22:%7B%22pivot%22:null,%22codes%22:false,%22language%22:%7B%22code%22:%22en%22%7D,%22format%22:%7B%22type%22:%22JSON-stat%22,%22version%22:%222.0%22%7D,%22matrix%22:%22MYE01T06%22%7D,%22version%22:%222.0%22%7D%7D"
  )
)

lgd_mye <- data.frame(
  area = lgd_mye_raw$result$dimension$LGD2014$category$index,
  mye = lgd_mye_raw$result$value
)

# JSON creation ####


## LGD JSONs to contain ranks of all SDZ ####

LGDs <- children %>%
  filter(type == "lgd") %>%
  pull("code")

lgd_count <- geog_levels %>%
  filter(geog_code == "lgd") %>%
  pull("number")

sdz_count <- geog_levels %>%
  filter(geog_code == "sdz") %>%
  pull("number")

for (lgd in LGDs) {

  cat("Processing Local Government District", lgd, "...", which(LGDs == lgd), "of", lgd_count, "\n\n")

  lgd_children <- list()

  child_rows <- children %>%
    filter(grandparent_code == lgd)

  for (i in 1:nrow(child_rows)) {
    lgd_children[[i]] <- list(
      code = child_rows$code[i],
      name = child_rows$name[i],
      type = child_rows$type[[i]]
    )
  }

  lgd_bounds <- map_bounds %>%
    filter(geog_code == paste0(lgd, "_focusin"))

  lgd_data <- list(
    code = lgd,
    name = children$name[children$code == lgd],
    comment = "This json includes data for the MDM app.",
    type = "lgd",
    parents = list(),
    children = lgd_children,
    children_count = sdz_count,
    bounds = c(
      c(lgd_bounds$long_max, lgd_bounds$lat_min),
      c(lgd_bounds$long_min, lgd_bounds$lat_max)
    ),
    data = list(
      ranks = list(),
      population = lgd_mye %>%
        filter(area == lgd) %>%
        pull("mye"),
      hectares = hectares %>%
        filter(geocode == lgd) %>%
        pull("Area_ha"),
      location = lgd_description %>%
        filter(geog_code == lgd) %>%
        pull("geog_location")
    )
  )

  assign(paste0(lgd, "_data"), lgd_data)

}

## SDZ JSONs to contain ranks of individual data ####

SDZs <- children %>%
  filter(type == "sdz") %>%
  pull("code")

for (sdz in SDZs) {

  cat("Processing Super Data Zone:", sdz, "...", which(SDZs == sdz), "of", sdz_count, "\n\n")

  sdz_info <- children %>% 
    filter(code == sdz)

  sdz_bounds <- map_bounds %>% 
    filter(geog_code == sdz)

  sdz_ranks <- nimdm %>% 
    filter(sdz2021_code == sdz) %>% 
    mutate(stat = stat_lookup[statistic])

  sdz_data_values <- list()

  for (i in 1:nrow(sdz_ranks)) {
    sdz_data_values[sdz_ranks$stat[[i]]] <- sdz_ranks$value[i]
  }

  sdz_data <- list(
    code = sdz,
    name = sdz_info$name,
    comment = "This json includes data for the MDM app",
    type = "sdz",
    count = sdz_count,
    parents = list(
      list(code = sdz_info$grandparent_code,
           name = children %>%
             filter(code == sdz_info$grandparent_code) %>%
             pull("name"),
           type = "lgd")
    ),
    children = list(),
    bounds = c(
      c(sdz_bounds$long_max, sdz_bounds$lat_min),
      c(sdz_bounds$long_min, sdz_bounds$lat_max)
    ),
    data = list(ranks = sdz_data_values,
                population = sdz_mye %>%
                  filter(area == sdz) %>%
                  pull("mye"),
                hectares = hectares %>%
                  filter(geocode == sdz) %>%
                  pull("Area_ha"),
                urban_rural = urban_rural %>%
                  filter(SDZ2021 == sdz) %>%
                  pull("type")
    )
  )

  write_json(sdz_data,
             paste0(output_dir, sdz, ".json"),
             auto_unbox = TRUE,
             pretty = TRUE)

  lgd_data <- get(paste0(sdz_info$grandparent_code, "_data"))
  lgd_data$data$ranks[[sdz]] <- sdz_data_values
  assign(paste0(sdz_info$grandparent_code, "_data"), lgd_data)


}

# Write out LGD JSONs ####

for (lgd in LGDs) {

  write_json(get(paste0(lgd, "_data")),
             paste0(output_dir, lgd, ".json"),
             auto_unbox = TRUE,
             pretty = TRUE)

  cat("Writing data for Local Government District", lgd, "...", which(LGDs == lgd), "of", lgd_count, "\n\n")

}