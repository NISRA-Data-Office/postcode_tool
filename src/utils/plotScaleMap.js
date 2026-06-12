import { loadShapes } from "./load-shapes.js";
import { scaleColours } from "./ScaleColours.js";

export let map;

let lgdGeojsonData;
let sdzGeojsonData;

export async function plotScaleMap(elementId, map_data, deprivation_type, options = {}) {
  const { animate = true } = options;

  if (!lgdGeojsonData) lgdGeojsonData = await loadShapes("LGD2014.geo.json");
  if (!sdzGeojsonData) sdzGeojsonData = await loadShapes("SDZ2021.geo.json");

  const selectedLgdCode = map_data.code;
  const selectedLgdName = map_data.name;

  const ranks = map_data.data?.ranks || {};
  const sdzCodes = new Set(Object.keys(ranks));

  const values = Object.values(ranks)
    .map(row => row?.[deprivation_type])
    .filter(v => v != null);

  const range_min = values.length ? Math.floor(Math.min(...values)) : 0;
  const range_max = values.length ? Math.ceil(Math.max(...values)) : 1;
  const range = range_max - range_min || 1;

  const lgdFeatures = lgdGeojsonData.features
    .filter(feature => {
      const lgdCode = getLgdCode(feature);
      const lgdName = getLgdName(feature);

      return lgdCode !== selectedLgdCode && lgdName !== selectedLgdName;
    })
    .map((feature, idx) => ({
      ...feature,
      id: `lgd-${idx}`,
      properties: {
        ...feature.properties,
        nisra_label: getLgdName(feature),
        nisra_code: getLgdCode(feature),
        nisra_value: null,
        nisra_fill: "#eeeeee",
        nisra_hasValue: false
      }
    }));

  const sdzFeatures = sdzGeojsonData.features
    .filter(feature =>
      feature.properties.LGD_code === selectedLgdCode &&
      sdzCodes.has(getSdzCode(feature))
    )
    .map((feature, idx) => {
      const sdzCode = getSdzCode(feature);
      const rawValue = ranks[sdzCode]?.[deprivation_type];

      return {
        ...feature,
        id: `sdz-${idx}`,
        properties: {
          ...feature.properties,
          nisra_label: getSdzName(feature),
          nisra_code: sdzCode,
          nisra_value: rawValue,
          nisra_fill: rawValue == null
            ? "#eeeeee"
            : getColour((rawValue - range_min) / range),
          nisra_hasValue: rawValue !== null && rawValue !== undefined
        }
      };
    });

  const styledLgdGeojson = {
    ...lgdGeojsonData,
    features: lgdFeatures
  };

  const styledSdzGeojson = {
    ...sdzGeojsonData,
    features: sdzFeatures
  };

  if (map) {
    map.getSource("lgd-shapes")?.setData(styledLgdGeojson);
    map.getSource("sdz-shapes")?.setData(styledSdzGeojson);
    moveToBounds(map_data.bounds, animate);
    return;
  }

  map = new maplibregl.Map({
    container: elementId,
    style: "public/map/style-omt.json",
    center: [-6.7, 54.7],
    zoom: window.innerWidth < 1200 ? 6 : 7.5,
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

    map.addSource("lgd-shapes", {
      type: "geojson",
      data: styledLgdGeojson,
      generateId: true
    });

    map.addSource("sdz-shapes", {
      type: "geojson",
      data: styledSdzGeojson,
      generateId: true
    });

    addFillLayer("lgd-fill", "lgd-shapes");
    addFillLayer("sdz-fill", "sdz-shapes");

    addOutlineLayer("lgd-outline", "lgd-shapes");
    addOutlineLayer("sdz-outline", "sdz-shapes");

    moveToBounds(map_data.bounds, false);

    map.setMinZoom(map.getZoom() - 1);
    map.setMaxZoom(map.getZoom() + 4);

    addHoverPopup(map, "lgd-fill", "lgd-shapes", { nameOnly: true });
    addHoverPopup(map, "sdz-fill", "sdz-shapes");

    addLgdClick(map);
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
        ["boolean", ["get", "nisra_hasValue"], false],
        ["get", "nisra_fill"],
        "#eeeeee"
      ],
      "fill-opacity": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        0.8,
        0.7
      ]
    }
  });
}

function addOutlineLayer(id, source) {
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
        2,
        1
      ],
      "line-opacity": 0.9
    }
  });
}

function getColour(norm) {
  if (norm == null || Number.isNaN(norm) || norm < 0) return "#d3d3d3";

  const idx = Math.max(
    0,
    Math.min(scaleColours.length - 1, Math.floor(norm * scaleColours.length))
  );

  return scaleColours[idx];
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
    map.getCanvas().style.cursor = "pointer";

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
    map.getCanvas().style.cursor = "";

    if (hoveredId !== null) {
      map.setFeatureState({ source: sourceId, id: hoveredId }, { hover: false });
      hoveredId = null;
    }

    popup.remove();
  });
}

function addLgdClick(map) {
  map.on("click", e => {
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
  ).replaceAll("_", " ");
}