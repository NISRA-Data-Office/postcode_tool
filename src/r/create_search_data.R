source("src/r/config.R")

# Import CPD ####

cpd <- read.csv(paste0(search_dir, latest_cpd_file))

# Create search data csv ####

search_data <- cpd %>% 
  filter(SDZ2021 != "000000000") %>%
  mutate(namew = "",
         type = "postcode",
         parent_type = "sdz",
         name = paste0(
           substr(postcode, 1, nchar(postcode) - 3),
           " ",
           substr(postcode, nchar(postcode) - 2, nchar(postcode))
         )) %>%
  select(code = SDZ2021,
         name,
         namew,
         type,
         parent = SDZ2021,
         parent_type)

sdz_search_data <- children %>%
  filter(type == "sdz") %>%
  mutate(name = gsub("_", " ", name),
         namew = "",
         parent_type = "lgd") %>%
  select(code,
         name,
         namew,
         type,
         parent = grandparent_code,
         parent_type
  )

search_data <- search_data %>% 
  bind_rows(sdz_search_data)

write.csv(search_data,
          paste0(search_dir, search_data_filename),
          quote = FALSE,
          row.names = FALSE)