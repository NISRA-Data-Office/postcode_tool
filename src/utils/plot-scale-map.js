import { loadShapes, normaliseBounds, moveToBounds, getSdzCode, getSdzName, clearFeatureState, getPopupHtml } from "./map-helpers.js";
import { readData } from "./read-data.js";
import { config } from "../config/config.js";
import { insertValue } from "./insert-value.js";
import { scaleChart } from "./scale-chart.js";

export let map;

let lgdGeojsonData;
let sdzGeojsonData;

let currentLgdBounds = null;
let selectedSdzId = null;

const mapState = {
  isCountryMap: false,
  enableComparison: false,
  selectedSdz: null,
  selectedValue: null
};

export async function plotScaleMap(
  elementId,
  map_data,
  deprivation_type,
  options = {}
) {
  const {
    animate = true,
    highlightSdz = null,
    preserveView = false,
    enableComparison = false
  } = options;

  if (!lgdGeojsonData) lgdGeojsonData = await loadShapes("LGD2014.geo.json");
  if (!sdzGeojsonData) sdzGeojsonData = await loadShapes("SDZ2021.geo.json");

  mapState.isCountryMap = map_data.type === "ctry";
  mapState.enableComparison = enableComparison;
  mapState.selectedSdz = highlightSdz;
  const effectiveType = deprivation_type || "mdm";
  mapState.selectedValue = map_data.data?.ranks?.[highlightSdz]?.ranks?.[effectiveType];

  const selectedLgdCode = map_data.code;
  const selectedLgdName = map_data.name;

  const ranks = map_data.data?.ranks || {};
  const sdzCodes = new Set(Object.keys(ranks));
  const typeForColour = deprivation_type || "mdm";

  const rangeMin = 1;
  const rangeMax = map_data.sdz_count || sdzCodes.size;
  const range = rangeMax - rangeMin || 1;

  const styledLgdGeojson = {
    ...lgdGeojsonData,
    features: buildLgdFeatures({
      selectedLgdCode,
      selectedLgdName,
      isCountryMap: mapState.isCountryMap
    })
  };

  const styledSdzGeojson = {
    ...sdzGeojsonData,
    features: buildSdzFeatures({
      sdzCodes,
      ranks,
      deprivation_type: typeForColour,
      selectedLgdCode,
      isCountryMap: mapState.isCountryMap,
      rangeMin,
      range,
      highlightSdz
    })
  };

  let mapBounds = await getTargetBounds(map_data, highlightSdz);

  if (map) {

    map.removeFeatureState({ source: "sdz-shapes" });
    map.removeFeatureState({ source: "lgd-shapes" });

    clearCurrentFeatureStates();

    map.getSource("lgd-shapes")?.setData(styledLgdGeojson);

    if (animate) {
      animateSourceColours("sdz-shapes", styledSdzGeojson, 1000);
    } else {
      map.getSource("sdz-shapes")?.setData(styledSdzGeojson);
    }

    currentLgdBounds = mapState.isCountryMap ? null : map_data.bounds;

    if (!preserveView) {
      moveToBounds(map, mapBounds, animate);
    }

    return;
  }

  const niData = await readData("N92000002");
  const niMaxBounds = normaliseBounds(niData.bounds);

  map = new maplibregl.Map({
  container: elementId,
  style: "public/map/style-omt.json",
  center: [-6.7, 54.7],
  zoom: window.innerWidth < 1200 ? 6 : 7.5,
  maxBounds: niMaxBounds,
  attributionControl: false,
  preserveDrawingBuffer: true,
  cooperativeGestures: true,
  dragRotate: false,
  touchZoomRotate: false
});

  map.addControl(
    new maplibregl.NavigationControl({
      showZoom: true,
      showCompass: false,
      visualizePitch: false
    }),
    "top-right"
  );

  map.addControl(new maplibregl.FullscreenControl());

  map.on("load", () => {
    map.setRenderWorldCopies(false);

    map.addSource("lgd-shapes", {
      type: "geojson",
      data: styledLgdGeojson
    });

    map.addSource("sdz-shapes", {
      type: "geojson",
      data: styledSdzGeojson,
      promoteId: "nisra_code"
    });

    addFillLayer("lgd-fill", "lgd-shapes", "water_name");
    addFillLayer("sdz-fill", "sdz-shapes", "water_name");

    addOutlineLayer("lgd-outline", "lgd-shapes", 2);
    addOutlineLayer("sdz-outline", "sdz-shapes", 1);

    addCursorPointer();

    moveToBounds(map, mapBounds, false);

    map.setMinZoom(map.getZoom() - 3);
    map.setMaxZoom(map.getZoom() + 4);

    addHoverPopup(map, "lgd-fill", "lgd-shapes", {
      nameOnly: true,
      enabled: () => !mapState.isCountryMap
    });

    addHoverPopup(map, "sdz-fill", "sdz-shapes", {
      enabled: () => true,
      enableComparison: mapState.enableComparison,
      highlightSdz: mapState.selectedSdz,
      selectedValue: mapState.selectedValue
  });

    addLgdClick(map);
    addSdzClick(map);

    window.addEventListener("sdzselect", e => {
      selectSdzByCode(e.detail?.code);
    });
  });
}

function buildLgdFeatures({ selectedLgdCode, selectedLgdName, isCountryMap }) {
  return lgdGeojsonData.features
    .filter(feature => {
      if (isCountryMap) return false;

      const lgdCode = getLgdCode(feature);
      const lgdName = getLgdName(feature);

      return lgdCode !== selectedLgdCode && lgdName !== selectedLgdName;
    })
    .map((feature, idx) => {
      const fill = "#eeeeee";

      return {
        ...feature,
        id: `lgd-${idx}`,
        properties: {
          ...feature.properties,
          nisra_label: getLgdName(feature),
          nisra_code: getLgdCode(feature),
          nisra_value: null,
          nisra_fill: fill,
          nisra_fill_hover: darkenColour(fill),
          nisra_hasValue: false,
          nisra_opacity: 0
        }
      };
    });
}

function buildSdzFeatures({
  sdzCodes,
  ranks,
  deprivation_type,
  selectedLgdCode,
  isCountryMap,
  rangeMin,
  range,
  highlightSdz
}) {
  return sdzGeojsonData.features
    .filter(feature => {
      const sdzCode = getSdzCode(feature);

      return (
        sdzCodes.has(sdzCode) &&
        (isCountryMap || feature.properties.LGD_code === selectedLgdCode)
      );
    })
    .map((feature, idx) => {
      const sdzCode = getSdzCode(feature);
      const rawValue = ranks[sdzCode]?.ranks?.[deprivation_type];

      const fill =
        rawValue == null
          ? "#eeeeee"
          : getColour((rawValue - rangeMin) / range);

      return {
        ...feature,
        id: `sdz-${idx}`,
        properties: {
          ...feature.properties,
          nisra_label: getSdzName(feature),
          nisra_code: sdzCode,
          nisra_value: rawValue,
          nisra_fill: fill,
          nisra_fill_hover: darkenColour(fill),
          nisra_hasValue: rawValue != null,
          nisra_highlight: highlightSdz && sdzCode === highlightSdz,
          nisra_opacity: 1
        }
      };
    });
}

async function getTargetBounds(map_data, highlightSdz) {
  if (!highlightSdz) return map_data.bounds;

  const highlightedSdzData = await readData(highlightSdz);

  if (!Array.isArray(highlightedSdzData?.bounds)) {
    return map_data.bounds;
  }

  return [
    highlightedSdzData.bounds[0] - 0.05,
    highlightedSdzData.bounds[1] - 0.05,
    highlightedSdzData.bounds[2] + 0.05,
    highlightedSdzData.bounds[3] + 0.05
  ];
}

function addFillLayer(id, source, beforeId) {
  map.addLayer({
    id,
    type: "fill",
    source,
    paint: {
      "fill-color": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        ["get", "nisra_fill_hover"],
        ["get", "nisra_fill"]
      ],
      "fill-opacity": ["get", "nisra_opacity"]
    }
  },
  beforeId);
}

function addOutlineLayer(id, source, lineWidth) {
  // Base outline layer
  map.addLayer({
    id,
    type: "line",
    source,
    paint: {
      "line-color": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        "#222222",
        "#555555"
      ],
      "line-width": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        lineWidth + 1,
        lineWidth
      ],
      "line-opacity": 0.9
    }
  });

  // Red selected / highlighted outline, above normal map lines
  map.addLayer({
    id: `${id}-selected`,
    type: "line",
    source,
    paint: {
      "line-color": "#D4351C",
      "line-width": [
        "case",
        [
          "any",
          ["boolean", ["get", "nisra_highlight"], false],
          ["boolean", ["feature-state", "selected"], false]
        ],
        lineWidth + 4,
        0
      ],
      "line-opacity": [
        "case",
        [
          "any",
          ["boolean", ["get", "nisra_highlight"], false],
          ["boolean", ["feature-state", "selected"], false]
        ],
        1,
        0
      ]
    }
  });

  // Lilac comparison hover outline, above everything else
  map.addLayer({
    id: `${id}-compare-hover`,
    type: "line",
    source,
    paint: {
      "line-color": "#ce70d2",
      "line-width": [
        "case",
        ["boolean", ["feature-state", "compareHover"], false],
        lineWidth + 4,
        0
      ],
      "line-opacity": [
        "case",
        ["boolean", ["feature-state", "compareHover"], false],
        1,
        0
      ]
    }
  });
}

function addCursorPointer() {
  map.on("mousemove", e => {
    const layers = mapState.isCountryMap
      ? ["sdz-fill"]
      : ["sdz-fill", "lgd-fill"];

    const features = map.queryRenderedFeatures(e.point, { layers });

   if (mapState.enableComparison) {
    map.getCanvas().style.cursor = "default";
    } else {
      map.getCanvas().style.cursor =
        features.length > 0 ? "pointer" : "default";
    }
  });
}

function addHoverPopup(map, layerId, sourceId, options = {}) {
  let hoveredId = null;

  const {
    enableComparison = false,
    highlightSdz = null,
    selectedValue = null
  } = options;

  const popup = new maplibregl.Popup({
    closeButton: false,
    closeOnClick: false,
    offset: [0, -6],
    className: "nisra-popup"
  });

  const clearHoverState = ({ emitOut = false } = {}) => {
    if (hoveredId === null) return;

    clearFeatureState(map, sourceId, hoveredId, "compareHover");
    clearFeatureState(map, sourceId, hoveredId, "hover");
    hoveredId = null;

    if (emitOut && enableComparison) {
      window.dispatchEvent(new Event("sdzhoverout"));
    }

    popup.remove();
  };

  map.on("mousemove", layerId, e => {
    if (options.enabled && !options.enabled()) {
      clearHoverState({ emitOut: false });
      popup.remove();
      return;
    }

    const feature = e.features?.[0];
    if (!feature) {
      clearHoverState({ emitOut: false });
      return;
    }

    const props = feature.properties;

    if (
      enableComparison &&
      sourceId === "sdz-shapes" &&
      props.nisra_code !== mapState.selectedSdz &&
      props.nisra_value != null &&
      mapState.selectedValue != null
    ) {
      window.dispatchEvent(new CustomEvent("sdzhovercompare", {
        detail: {
          hovered: {
            code: props.nisra_code,
            value: Number(props.nisra_value),
            name: props.nisra_label
          },
          selected: {
            code: mapState.selectedSdz,
            value: Number(mapState.selectedValue)
          }
        }
      }));
    }

    clearHoverState({ emitOut: false });

    hoveredId = feature.id;

    map.setFeatureState(
      { source: sourceId, id: hoveredId },
      enableComparison
        ? { hover: true, compareHover: true }
        : { hover: true }
    );

    popup
      .setLngLat(e.lngLat)
      .setHTML(getPopupHtml(feature.properties, options))
      .addTo(map);
  });

  map.on("mouseleave", layerId, () => clearHoverState({ emitOut: true }));
  map.on("mouseleave", () => clearHoverState({ emitOut: true }));
}

function addLgdClick(map) {
  map.on("click", e => {

    if (mapState.enableComparison) return;
    if (mapState.isCountryMap) return;

    const features = map.queryRenderedFeatures(e.point, {
      layers: ["lgd-fill", "lgd-outline"]
    });

    const feature = features[0];

    const lgdCode =
      feature?.properties?.nisra_code ||
      feature?.properties?.LGDCode ||
      feature?.properties?.LGD_code ||
      feature?.properties?.LGD2014CODE;

    if (!lgdCode) return;

    document.getElementById("in-focus").classList.remove("is-open");

    window.history.pushState(
      {},
      "",
      `area.html?code=${encodeURIComponent(lgdCode)}`
    );

    window.dispatchEvent(new Event("lgdchange"));
  });
}

function addSdzClick(map) {
  map.on("click", "sdz-fill", e => {

    if (mapState.enableComparison) return;

    const feature = e.features?.[0];
    if (!feature) return;

    const sdzCode = feature.properties?.nisra_code;
    const sdzName = feature.properties?.nisra_label;
    if (!sdzCode) return;

    const url = new URL(window.location);
    url.searchParams.set("sdz", sdzCode);

  
    insertValue("sdz-name", sdzName);

    document.getElementById("in-focus").classList.add("is-open");
    document.getElementById("focus-link").href = `sdz.html?sdz=${sdzCode}`;
      
 

    window.history.replaceState(
      {},
      "",
      `${url.pathname}${url.search}${url.hash}`
    );

    window.dispatchEvent(
      new CustomEvent("sdzselect", {
        detail: { code: sdzCode }
      })
    );
  });
}

function removeStaticSdzHighlight() {
  const source = map.getSource("sdz-shapes");
  const currentData = source?._data;

  if (!source || !currentData?.features) return;

  source.setData({
    ...currentData,
    features: currentData.features.map(feature => ({
      ...feature,
      properties: {
        ...feature.properties,
        nisra_highlight: false
      }
    }))
  });
}

function clearCurrentFeatureStates() {
  selectedSdzId = clearFeatureState(
    map,
    "sdz-shapes",
    selectedSdzId,
    "selected"
  );
}

let colourAnimationToken = 0;

function animateSourceColours(sourceId, newGeojson, duration = 2000) {
  const token = ++colourAnimationToken;

  const source = map.getSource(sourceId);
  const oldGeojson_raw = source?._data;

  if (!source || !oldGeojson_raw?.features?.length) {
    source?.setData(newGeojson);
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const lgd = params.get("code");

  const oldFeaturesForCurrentLgd = oldGeojson_raw.features.filter(
    feature => feature.properties.LGD_code === lgd
  );

  if (!oldFeaturesForCurrentLgd.length) {
    source.setData(newGeojson);
    return;
  }

  const oldFillByCode = new Map(
    oldFeaturesForCurrentLgd.map(feature => [
      feature.properties.nisra_code,
      feature.properties.nisra_fill
    ])
  );

  const start = performance.now();

  function frame(now) {
    if (token !== colourAnimationToken) return;

    const t = Math.min(1, (now - start) / duration);

    const animatedGeojson = {
      ...newGeojson,
      features: newGeojson.features.map(feature => {
        const code = feature.properties.nisra_code;
        const from = oldFillByCode.get(code) ?? feature.properties.nisra_fill;
        const to = feature.properties.nisra_fill;
        const fill = interpolateColour(from, to, t);

        return {
          ...feature,
          properties: {
            ...feature.properties,
            nisra_fill: fill,
            nisra_fill_hover: darkenColour(fill)
          }
        };
      })
    };

    source.setData(animatedGeojson);

    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      source.setData(newGeojson);
    }
  }

  requestAnimationFrame(frame);
}

function interpolateColour(from, to, t) {
  const start = hexToRgb(from);
  const end = hexToRgb(to);

  if (!start || !end) {
    return to;
  }

  return rgbToHex([
    lerp(start[0], end[0], t),
    lerp(start[1], end[1], t),
    lerp(start[2], end[2], t)
  ]);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function hexToRgb(hex) {
  if (
    !hex ||
    typeof hex !== "string" ||
    !hex.startsWith("#") ||
    hex.length !== 7
  ) {
    return null;
  }

  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16)
  ];
}

function rgbToHex([r, g, b]) {
  const clamp = value =>
    Math.max(0, Math.min(255, Math.round(value)));

  return `#${clamp(r).toString(16).padStart(2, "0")}${clamp(g)
    .toString(16)
    .padStart(2, "0")}${clamp(b)
    .toString(16)
    .padStart(2, "0")}`;
}

function getColour(norm) {
  if (norm == null || Number.isNaN(norm) || norm < 0) {
    return "#d3d3d3";
  }

  const idx = Math.max(
    0,
    Math.min(
      config.scale_colours.length - 1,
      Math.floor(norm * config.scale_colours.length)
    )
  );

  return config.scale_colours[idx];
}

function darkenColour(hex, amount = 0.18) {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  return rgbToHex(rgb.map(value => value * (1 - amount)));
}

function getLgdCode(feature) {
  return String(
    feature.properties.LGDCode ||
      feature.properties.LGD2014CODE ||
      feature.properties.LGD_code ||
      feature.properties.LGD_CODE ||
      feature.properties.LGDCODE ||
      feature.properties.code ||
      ""
  );
}

function getLgdName(feature) {
  return String(
    feature.properties.LGDNAME ||
      feature.properties.LGD_name ||
      feature.properties.LGD_NAME ||
      feature.properties.name ||
      ""
  );
}

async function selectSdzByCode(code, options = {}) {
  const { moveToSdz = true } = options;

  if (!code || !map?.getSource("sdz-shapes")) return;

  selectedSdzId = clearFeatureState(
    map,
    "sdz-shapes",
    selectedSdzId,
    "selected"
  );

  selectedSdzId = code;

  map.setFeatureState(
    { source: "sdz-shapes", id: selectedSdzId },
    { selected: true }
  );

  removeStaticSdzHighlight();

  if (moveToSdz) {
    const sdzBounds = await getTargetBounds(
      { bounds: currentLgdBounds },
      code
    );

    const sdz_data = await readData(code);
    const type_select = document.getElementById("type-select");

    const deprivation_type = config.deprivation_types[type_select.value].title.toLowerCase();
    const deprivation_type_text = deprivation_type == "overall mdm" ? "overall MDM" : `${deprivation_type} deprivation`;

    scaleChart(
      "lgd-scale-chart",
      sdz_data,
      type_select.value,
      {
        labels: "below",
        marker: true
      }
    );

    insertValue(
      "lgd-scale-caption",
      `<span class="text-purple fw-bold">${sdz_data.name}</span> is ranked ${sdz_data.data.ranks[type_select.value]} out of ${sdz_data.count} for <strong>${deprivation_type_text}</strong>.`
    );

    moveToBounds(map, sdzBounds, true);
    
  }
}
