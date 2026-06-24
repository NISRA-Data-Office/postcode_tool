import { loadShapes, normaliseBounds, moveToBounds, getSdzCode, getSdzName, clearFeatureState, getPopupHtml } from "./map-helpers.js";
import { readData } from "./read-data.js";
import { config } from "../config/config.js";

export let map;

let lgdGeojsonData;
let sdzGeojsonData;

let currentLgdBounds = null;
let selectedSdzId = null;
let tableHoveredSdzId = null;
let tableHoverListenerAdded = false;

const mapState = {
  isCountryMap: false
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
    preserveView = false
  } = options;

  if (!lgdGeojsonData) lgdGeojsonData = await loadShapes("LGD2014.geo.json");
  if (!sdzGeojsonData) sdzGeojsonData = await loadShapes("SDZ2021.geo.json");

  mapState.isCountryMap = map_data.type === "ctry";

  const selectedLgdCode = map_data.code;
  const selectedLgdName = map_data.name;

  const ranks = map_data.data?.ranks || {};
  const sdzCodes = new Set(Object.keys(ranks));

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
      deprivation_type,
      selectedLgdCode,
      isCountryMap: mapState.isCountryMap,
      rangeMin,
      range,
      highlightSdz
    })
  };

  let mapBounds = await getTargetBounds(map_data, highlightSdz);

  if (map) {
    clearCurrentFeatureStates();

    map.getSource("lgd-shapes")?.setData(styledLgdGeojson);

    if (animate) {
      animateSourceColours("sdz-shapes", styledSdzGeojson, 500);
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

    addFillLayer("lgd-fill", "lgd-shapes");
    addFillLayer("sdz-fill", "sdz-shapes");

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
      enabled: () => true
    });

    addLgdClick(map);
    addSdzClick(map);
    addTableHoverListener();
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
          nisra_opacity: 0.6
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

function addFillLayer(id, source) {
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
  });
}

function addOutlineLayer(id, source, lineWidth) {
  map.addLayer({
    id,
    type: "line",
    source,
    paint: {
      "line-color": [
        "case",
        ["boolean", ["get", "nisra_highlight"], false],
        "#D4351C",
        ["boolean", ["feature-state", "selected"], false],
        "#D4351C",
        ["boolean", ["feature-state", "hover"], false],
        "#222222",
        "#555555"
      ],
      "line-width": [
        "case",
        ["boolean", ["get", "nisra_highlight"], false],
        3,
        ["boolean", ["feature-state", "selected"], false],
        3,
        ["boolean", ["feature-state", "hover"], false],
        lineWidth + 1,
        lineWidth
      ],
      "line-opacity": [
        "case",
        ["boolean", ["get", "nisra_highlight"], false],
        1,
        0.9
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

    map.getCanvas().style.cursor =
      features.length > 0 ? "pointer" : "default";
  });
}

function addTableHoverListener() {
  if (tableHoverListenerAdded) return;

  tableHoverListenerAdded = true;

  window.addEventListener("sdzhover", e => {
    if (!map?.getSource("sdz-shapes")) return;

    tableHoveredSdzId = clearFeatureState(
      map,
      "sdz-shapes",
      tableHoveredSdzId,
      "hover"
    );

    const code = e.detail?.code;
    if (!code) return;

    tableHoveredSdzId = code;

    map.setFeatureState(
      { source: "sdz-shapes", id: code },
      { hover: true }
    );
  });
}

function addHoverPopup(map, layerId, sourceId, options = {}) {
  let hoveredId = null;

  const popup = new maplibregl.Popup({
    closeButton: false,
    closeOnClick: false,
    offset: [0, -6],
    className: "nisra-popup"
  });

  map.on("mousemove", layerId, e => {
    if (options.enabled && !options.enabled()) {
      popup.remove();
      return;
    }

    const feature = e.features?.[0];
    if (!feature) return;

    hoveredId = clearFeatureState(map, sourceId, hoveredId, "hover");

    hoveredId = feature.id;

    map.setFeatureState(
      { source: sourceId, id: hoveredId },
      { hover: true }
    );

    popup
      .setLngLat(e.lngLat)
      .setHTML(getPopupHtml(feature.properties, options))
      .addTo(map);
  });

  map.on("mouseleave", layerId, () => {
    hoveredId = clearFeatureState(map, sourceId, hoveredId, "hover");
    popup.remove();
  });
}

function addLgdClick(map) {
  map.on("click", e => {
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

    window.history.pushState(
      {},
      "",
      `lgd.html?lgd=${encodeURIComponent(lgdCode)}`
    );

    window.dispatchEvent(new Event("lgdchange"));
  });
}

function addSdzClick(map) {
  map.on("click", "sdz-fill", e => {
    const feature = e.features?.[0];
    if (!feature) return;

    selectedSdzId = clearFeatureState(
      map,
      "sdz-shapes",
      selectedSdzId,
      "selected"
    );

    selectedSdzId = feature.id;

    map.setFeatureState(
      { source: "sdz-shapes", id: selectedSdzId },
      { selected: true }
    );

    const sdzCode = feature.properties?.nisra_code;

    removeStaticSdzHighlight();

    const url = new URL(window.location);
    url.searchParams.set("sdz", sdzCode);

    window.history.replaceState(
      {},
      "",
      `${url.pathname}${url.search}${url.hash}`
    );

    if (currentLgdBounds) {
      moveToBounds(map, currentLgdBounds);
    }

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

  tableHoveredSdzId = clearFeatureState(
    map,
    "sdz-shapes",
    tableHoveredSdzId,
    "hover"
  );
}

function animateSourceColours(sourceId, newGeojson, duration = 500) {
  const source = map.getSource(sourceId);
  const oldGeojson = source?._data;

  if (!source || !oldGeojson?.features) {
    source?.setData(newGeojson);
    return;
  }

  const oldFillByCode = new Map(
    oldGeojson.features.map(feature => [
      feature.properties.nisra_code,
      feature.properties.nisra_fill
    ])
  );

  const start = performance.now();

  function frame(now) {
    const t = Math.min(1, (now - start) / duration);

    const animatedGeojson = {
      ...newGeojson,
      features: newGeojson.features.map(feature => {
        const code = feature.properties.nisra_code;
        const from = oldFillByCode.get(code) || feature.properties.nisra_fill;
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