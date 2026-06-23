import { loadShapes } from "./load-shapes.js";
import { readData } from "./read-data.js";
import { config } from "../config/config.js";

export let map;

let lgdGeojsonData;
let sdzGeojsonData;
let currentLgdBounds = null;
let selectedSdzId = null;
let currentIsCountryMap = false;

let tableHoveredSdzId = null;
let sdzFeatureIdByCode = new Map();
let tableHoverListenerAdded = false;

export async function plotScaleMap(elementId, map_data, deprivation_type, options = {}) {
  const { animate = true, highlightSdz = null, preserveView = false } = options;

  if (!lgdGeojsonData) lgdGeojsonData = await loadShapes("LGD2014.geo.json");
  if (!sdzGeojsonData) sdzGeojsonData = await loadShapes("SDZ2021.geo.json");

  const isCountryMap = map_data.type === "ctry";
  currentIsCountryMap = isCountryMap;

  const selectedLgdCode = map_data.code;
  const selectedLgdName = map_data.name;

  const ranks = map_data.data?.ranks || {};
  const sdzCodes = new Set(Object.keys(ranks));

  const range_min = 1;
  const range_max = map_data.sdz_count || sdzCodes.size;
  const range = range_max - range_min || 1;

  const lgdFeatures = lgdGeojsonData.features
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
          nisra_fill_hover: darkenColour(fill, 0.18),
          nisra_hasValue: false,
          nisra_opacity: 0
        }
      };
    });

  const sdzFeatures = sdzGeojsonData.features
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
      const highlightedSdz = highlightSdz && sdzCode === highlightSdz;

      const fill =
        rawValue == null
          ? "#eeeeee"
          : getColour((rawValue - range_min) / range);

      return {
        ...feature,
        id: `sdz-${idx}`,
        properties: {
          ...feature.properties,
          nisra_label: getSdzName(feature),
          nisra_code: sdzCode,
          nisra_value: rawValue,
          nisra_fill: fill,
          nisra_fill_hover: darkenColour(fill, 0.18),
          nisra_hasValue: rawValue !== null && rawValue !== undefined,
          nisra_highlight: highlightedSdz,
          nisra_opacity: 0.6
        }
      };
    });

  sdzFeatureIdByCode = new Map(
    sdzFeatures.map(feature => [
      feature.properties.nisra_code,
      feature.id
    ])
  );

  const styledLgdGeojson = {
    ...lgdGeojsonData,
    features: lgdFeatures
  };

  const styledSdzGeojson = {
    ...sdzGeojsonData,
    features: sdzFeatures
  };

  let mapBounds = map_data.bounds;

  if (highlightSdz) {
    const highlightedSdzData = await readData(highlightSdz);

    if (Array.isArray(highlightedSdzData?.bounds)) {
      mapBounds = [
        highlightedSdzData.bounds[0] - 0.05,
        highlightedSdzData.bounds[1] - 0.05,
        highlightedSdzData.bounds[2] + 0.05,
        highlightedSdzData.bounds[3] + 0.05
      ];
    }
  }

  if (map) {
    if (selectedSdzId !== null) {
      map.setFeatureState(
        { source: "sdz-shapes", id: selectedSdzId },
        { selected: false }
      );

      selectedSdzId = null;
    }

    if (tableHoveredSdzId !== null) {
      map.setFeatureState(
        { source: "sdz-shapes", id: tableHoveredSdzId },
        { hover: false }
      );

      tableHoveredSdzId = null;
    }

    map.getSource("lgd-shapes")?.setData(styledLgdGeojson);
    map.getSource("sdz-shapes")?.setData(styledSdzGeojson);

    currentLgdBounds = isCountryMap ? null : map_data.bounds;

    if (!preserveView) {
      moveToBounds(mapBounds, animate);
    }

    return;
  }

  const ni_data = await readData("N92000002");
  const niMaxBounds = normaliseBounds(ni_data.bounds);

  map = new maplibregl.Map({
  container: elementId,
  style: "public/map/style-omt.json",
  center: [-6.7, 54.7],
  zoom: window.innerWidth < 1200 ? 6 : 7.5,
  maxBounds: niMaxBounds,
  attributionControl: false,
  preserveDrawingBuffer: true,
  canvasContextAttributes: {
    preserveDrawingBuffer: true
  }
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

    map.setMaxBounds(niMaxBounds);

    map.addSource("lgd-shapes", {
      type: "geojson",
      data: styledLgdGeojson,
      generateId: true
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

    map.on("mousemove", e => {
      const layers = currentIsCountryMap
        ? ["sdz-fill"]
        : ["sdz-fill", "lgd-fill"];

      const features = map.queryRenderedFeatures(e.point, { layers });

      map.getCanvas().style.cursor =
        features.length > 0 ? "pointer" : "default";
    });

    moveToBounds(mapBounds, false);

    map.setMinZoom(map.getZoom() - 3);
    map.setMaxZoom(map.getZoom() + 4);

    addHoverPopup(map, "lgd-fill", "lgd-shapes", {
      nameOnly: true,
      enabled: () => !currentIsCountryMap
    });

    addHoverPopup(map, "sdz-fill", "sdz-shapes", {
      enabled: () => true
    });

    addLgdClick(map);
    addSdzClick(map);
    addTableHoverListener();
  });
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

function addOutlineLayer(id, source, line_width) {
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
        line_width + 1,
        line_width
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

function addTableHoverListener() {
  if (tableHoverListenerAdded) return;

  tableHoverListenerAdded = true;

  window.addEventListener("sdzhover", e => {
    if (!map?.getSource("sdz-shapes")) return;

    if (tableHoveredSdzId !== null) {
      map.setFeatureState(
        { source: "sdz-shapes", id: tableHoveredSdzId },
        { hover: false }
      );

      tableHoveredSdzId = null;
    }

    const code = e.detail?.code;
    if (!code) return;

    tableHoveredSdzId = code;

    map.setFeatureState(
      { source: "sdz-shapes", id: code },
      { hover: true }
    );
  });
}

function getColour(norm) {
  if (norm == null || Number.isNaN(norm) || norm < 0) return "#d3d3d3";

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
  if (!hex || typeof hex !== "string" || !hex.startsWith("#") || hex.length !== 7) {
    return hex;
  }

  const r = Math.round(parseInt(hex.slice(1, 3), 16) * (1 - amount));
  const g = Math.round(parseInt(hex.slice(3, 5), 16) * (1 - amount));
  const b = Math.round(parseInt(hex.slice(5, 7), 16) * (1 - amount));

  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
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

    if (hoveredId !== null) {
      map.setFeatureState({ source: sourceId, id: hoveredId }, { hover: false });
    }

    hoveredId = feature.id;
    map.setFeatureState({ source: sourceId, id: hoveredId }, { hover: true });

    const props = feature.properties;

    const html = options.nameOnly
      ? `<div><strong>${props.nisra_label}</strong></div>`
      : `<div><strong>${props.nisra_label}</strong>: <strong>${
          props.nisra_value == null
            ? "Not available"
            : Number(props.nisra_value).toLocaleString("en-GB")
        }</strong></div>`;

    popup
      .setLngLat(e.lngLat)
      .setHTML(html)
      .addTo(map);
  });

  map.on("mouseleave", layerId, () => {
    if (hoveredId !== null) {
      map.setFeatureState({ source: sourceId, id: hoveredId }, { hover: false });
      hoveredId = null;
    }

    popup.remove();
  });
}

function addLgdClick(map) {
  map.on("click", e => {
    if (currentIsCountryMap) return;

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

function moveToBounds(bounds, animate = true) {
  if (!Array.isArray(bounds) || bounds.length !== 4) return;

  map.resize();

  const normalisedBounds = normaliseBounds(bounds);

  map.fitBounds(normalisedBounds, {
    padding: 30,
    duration: animate ? 800 : 0,
    essential: true
  });
}

function normaliseBounds(bounds) {
  const [lng1, lat1, lng2, lat2] = bounds;

  return [
    [Math.min(lng1, lng2), Math.min(lat1, lat2)],
    [Math.max(lng1, lng2), Math.max(lat1, lat2)]
  ];
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

function getSdzCode(feature) {
  return String(feature.properties.SDZ21_code || "");
}

function getSdzName(feature) {
  return String(
    feature.properties.SDZ21_name ||
      getSdzCode(feature)
  );
}

function addSdzClick(map) {
  map.on("click", "sdz-fill", e => {
    const feature = e.features?.[0];
    if (!feature) return;

    if (selectedSdzId !== null) {
      map.setFeatureState(
        { source: "sdz-shapes", id: selectedSdzId },
        { selected: false }
      );
    }

    selectedSdzId = feature.id;

    map.setFeatureState(
      { source: "sdz-shapes", id: selectedSdzId },
      { selected: true }
    );

    const sdzCode = feature.properties?.nisra_code;

    const source = map.getSource("sdz-shapes");
    const currentData = source?._data;

    if (source && currentData?.features) {
      source.setData({
        ...currentData,
        features: currentData.features.map(f => ({
          ...f,
          properties: {
            ...f.properties,
            nisra_highlight: false
          }
        }))
      });
    }

    const url = new URL(window.location);
    url.searchParams.set("sdz", sdzCode);

    window.history.replaceState(
      {},
      "",
      `${url.pathname}${url.search}${url.hash}`
    );

    if (currentLgdBounds) {
      moveToBounds(currentLgdBounds);
    }

    window.dispatchEvent(new CustomEvent("sdzselect", {
      detail: { code: sdzCode }
    }));
  });
}