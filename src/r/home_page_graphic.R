source("src/r/config.R")

library(sf)
library(ggplot2)
library(purrr)
library(V8)
library(ggspatial)

nimdm <- read.csv(paste0(data_dir, "nimdm-2026-ranks-sdz-dummy-data.csv")) %>% 
  filter(statistic == "Multiple Deprivation Measure (Rank)")

colour_scale_file <- readLines("src/utils/ScaleColours.js", warn = FALSE) %>%
  sub("export ", "", .) %>%
  paste(collapse = "\n")

ctx <- V8::v8()
ctx$eval(colour_scale_file)

scale_colours <- ctx$get("scaleColours")

sdz <- st_read("public/map/SDZ2021.geo.json", quiet = TRUE)

map_data <- sdz %>%
  left_join(nimdm, by = c("SDZ21_code" = "sdz2021_code")) %>%
  mutate(
    decile = ntile(value, length(scale_colours)),
    decile = factor(decile, levels = 1:length(scale_colours))
  )


p <- ggplot(map_data) +
  annotation_map_tile(
    type = "cartolight",
    zoomin = 0,
    cachedir = "tile-cache"
  ) +
  geom_sf(
    aes(fill = decile),
    colour = "white",
    linewidth = 0.15,
    alpha = 0.6
  ) +
  scale_fill_manual(
    values = scale_colours,
    na.value = "grey90"
  ) +
  theme_void() +
  theme(
    legend.position = "none"
  )

ggsave(
  "assets/img/nimdm_sdz_map.png",
  plot = p,
  width = 1600,
  units = "px",
  dpi = 300
)