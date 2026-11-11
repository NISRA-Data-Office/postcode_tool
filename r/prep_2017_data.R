library(tidyverse)

download_tf <- function(url, ext = "") {
  if (ext == "") {
    ext <- tools::file_ext(url)
  }
  tf <- fs::file_temp(ext = ext)
  download.file(url, tf, mode = "wb", quiet = TRUE)
  tf
}

download_unzip <- function(url) {
  tf_zip <- download_tf(url, ext = "zip")
  tf_unzip <- fs::dir_create(fs::file_temp())
  unzip(tf_zip, exdir = tf_unzip)
  tf_unzip
}


# soa shapefile -----------------------------------------------------------

soa_url <- "https://www.nisra.gov.uk/files/nisra/publications/SOA2011_Esri_Shapefile_0.zip"

soa_dir <- download_unzip(soa_url)
soa <- sf::read_sf(fs::path(soa_dir, "SOA2011.shp"))

colnames(soa)[1:2] <- c("area_code", "area_name")
soa <- sf::st_transform(soa, "WGS84")

lgd_lkp_url <- "https://www.nisra.gov.uk/files/nisra/publications/11DC_Lookup_1_1.xls"
lgd_lkp_tf <- download_tf(lgd_lkp_url, ext = "xls")

lgd_lkp <- readxl::read_xls(lgd_lkp_tf, sheet = "SOA2001_2_LGD2014")
colnames(lgd_lkp) <- c("area_code", "lgd2014", "lgd2014_name")
soa <- left_join(soa, lgd_lkp)

# rmapshaper::ms_simplify preserves topology
# this prevents gaps between adjacent SOAs
soa_simpl <- rmapshaper::ms_simplify(soa, keep = 0.1)

# file extension needs to be json or can't use 'import ... from ...' with vite
sf::write_sf(
  soa_simpl, 
  "src/lib/assets/soa2011.json",
  driver = "GeoJSON",
  layer_options = "COORDINATE_PRECISION=6",
  delete_dsn = TRUE
)

# second copy is for the nav map so it can run without loading the whole thing
# this should be fixed
sf::write_sf(
  soa_simpl, 
  "static/public/map/soa2011.geojson",
  driver = "GeoJSON",
  layer_options = "COORDINATE_PRECISION=6",
  delete_dsn = TRUE
)

bboxes <- lapply(sf::st_geometry(soa_simpl), \(geom) {
  bb <- sf::st_bbox(geom)
  unname(unclass(bb[c(3, 2, 1, 4)]))
})

lgds <- sf::read_sf("src/lib/assets/LGD2014.geo.json")
lgd_bboxes <- lapply(sf::st_geometry(lgds), \(geom) {
  bb <- sf::st_bbox(geom)
  unname(unclass(bb[c(3, 2, 1, 4)]))
})

ni_bbox <- unname(unclass(sf::st_bbox(soa_simpl)))[c(3, 2, 1, 4)]


# deprivation data --------------------------------------------------------

# format for NI and LGD files:
# code, name, type, area_count, bounds, data: ranks: list(area = data)
# where area_data = list(name, lgd, ranks = list(domain = rank))
# format for area:
# code, name, type, count, parents = list(code, name), bounds, data
# where data = list(ranks = list(domain = rank))
# unclear where bounds came from

ranks_url <- "https://ws-data.nisra.gov.uk/public/api.restful/PxStat.Data.Cube_API.ReadDataset/NIMDM17T2/CSV/1.0/en"
ranks_raw <- read_csv(ranks_url)

domain_code <- function(x) {
  from <- c(1, 2, 4, 6, 7, 8, 9, 10)
  to <- c("mdm", "income", "employment", "health", "education", "services", "living", "crime")
  recode_values(x, from = from, to = to, default = NA_character_)
}

ranks <- ranks_raw |> 
  mutate(domain = domain_code(STATISTIC)) |> 
  filter(!is.na(domain)) |> 
  select(domain, soa2001 = SOA, soa2001_name = `Super Output Area`, rank = VALUE)

soa_data <- lapply(lgd_lkp$area_code, \(code) {
  area_ranks <- filter(ranks, soa2001 == code)
  area_nm <- soa$area_name[soa$area_code == code]
  area_nm <- gsub("_", " ", area_nm, fixed = TRUE)
  ranks_list <- as.list(area_ranks$rank)
  names(ranks_list) <- area_ranks$domain
  lgd_row <- lgd_lkp[lgd_lkp$area_code == code, ]
  
  list(
    code = code,
    name = area_nm,
    type = "soa",
    count = 890L,
    parents = list(
      list(code = lgd_row$lgd2014, name = lgd_row$lgd2014_name)
    ),
    bounds = bboxes[[match(code, soa$area_code)]],
    data = list(ranks = ranks_list)
  )
})

names(soa_data) <- lgd_lkp$area_code

lgd_codes <- unique(lgd_lkp$lgd2014)
lgd_data <- lapply(lgd_codes, \(code) {
  nm <- lgd_lkp$lgd2014_name[lgd_lkp$lgd2014 == code][[1]]
  children <- vapply(soa_data, \(x) x[["parents"]][[1]][["code"]] == code, logical(1))
  children_ranks <- lapply(which(children), \(i) {
    i_data <- soa_data[[i]]
    list(name = i_data[["name"]], ranks = i_data[["data"]][["ranks"]])
  })
  names(children_ranks) <- vapply(which(children), \(i) soa_data[[i]][["code"]], character(1))
  
  list(
    code = code,
    name = nm,
    type = "lgd",
    bounds = lgd_bboxes[[which(lgds$LGDCode == code)]],
    data = list(ranks = children_ranks)
  )
})

names(lgd_data) <- lgd_codes

ni_data <- list(
  code = "N92000002",
  name = "Northern Ireland",
  type = "ctry",
  bounds = ni_bbox,
  data = list(
    ranks = lapply(soa_data, \(x) {
      list(
        name = x[["name"]], 
        lgd = x[["parents"]][[1]][["code"]], 
        ranks = x[["data"]][["ranks"]])
    })
  )
)


# write data out ----------------------------------------------------------

write_json <- \(x, file) jsonlite::write_json(x, file, auto_unbox = TRUE)

write_json(ni_data, "src/lib/assets/N92000002.json")

fs::dir_delete("static/public/data")
fs::dir_create("static/public/data")

write_json(ni_data, "static/public/data/N92000002.json")

walk(names(lgd_data), \(lgd) {
  write_json(lgd_data[[lgd]], glue::glue("static/public/data/{lgd}.json"))
})

walk(names(soa_data), \(soa) {
  write_json(soa_data[[soa]], glue::glue("static/public/data/{soa}.json"))
})


# postcode search ---------------------------------------------------------

cpd <- read_csv("https://raw.githubusercontent.com/nisra-explore/postcode-search/refs/heads/main/CPD_LIGHT.csv",
                show_col_types = FALSE)
cpd <- cpd |> 
  mutate(
    postcode = paste0(
      substr(PC5, 1, nchar(PC5) - 3),
      " ",
      substr(PC5, nchar(PC5) - 2, nchar(PC5))
    ),
    SOA2001NAME = gsub("_", " ", SOA2001NAME)
  )

cpd_soas <- unique(cpd$SOA2001)
search_data <- lapply(cpd_soas, \(soa) {
  nm <- cpd$SOA2001NAME[cpd$SOA2001 == soa][[1]]
  pcs <- cpd$postcode[cpd$SOA2001 == soa]
  list(name = nm, codes = pcs)
})
names(search_data) <- cpd_soas

write_json(search_data, "src/lib/assets/postcode.json")
