import { loadShapes } from "./load-shapes.js";
import { readData } from "./read-data.js";

export let map;

let sdzGeojsonData;
let niBoundaryGeojson

export async function plotNavMap(elementId, map_data, options = {}) {
  const { animate = true } = options;

  if (!sdzGeojsonData) {
    sdzGeojsonData = await loadShapes("SDZ2021.geo.json");
    niBoundaryGeojson = await loadShapes("SDZ2021-dissolved.geo.json")
  }

  const selectedCode = map_data.code;

  const features = sdzGeojsonData.features.map((feature, idx) => {
    const code = getSdzCode(feature);

    return {
      ...feature,
      id: `sdz-${idx}`,
      properties: {
        ...feature.properties,
        nisra_code: code,
        nisra_label: getSdzName(feature),
        nisra_line: code === selectedCode ? "#0078FF" : "#555",
        nisra_width: code === selectedCode ? 4 : 1,
        hover_opacity: code === selectedCode ? 0 : 0.4
      }
    };
  });

  const geojson = {
    type: "FeatureCollection",
    features
  };

  if (map) {
    map.getSource("sdz-shapes")?.setData(geojson);
    moveToBounds(map_data.bounds, animate);
    return;
  }

  const ni_data = await readData("N92000002");
  const niMaxBounds = normaliseBounds(ni_data.bounds);
  

  map = new maplibregl.Map({
  container: elementId,
  style: "public/map/style-omt.json",
  center: [-6.7, 54.7],
  zoom: 7,
  maxBounds: niMaxBounds,
  attributionControl: false,
  dragRotate: false,
});

  map.addControl(
  new maplibregl.NavigationControl({
    showCompass: false,
    showZoom: true
  }),
  "top-right"
);

  map.on("load", () => {
    map.setRenderWorldCopies(false);

    map.addSource("sdz-shapes", {
      type: "geojson",
      data: geojson,
      generateId: true
    });

    map.addLayer({
  id: "sdz-fill",
  type: "fill",
  source: "sdz-shapes",
  paint: {
    "fill-color": [
      "case",
      ["boolean", ["feature-state", "hover"], false],
      "#999999",
      "#fff"
    ],
    "fill-opacity": [
      "case",
      ["boolean", ["feature-state", "hover"], false],
      ["get", "hover_opacity"],
      0
    ]
  }
});

     map.addSource("ni-boundary", {
    type: "geojson",
    data: niBoundaryGeojson
  });

  map.addLayer({
  id: "ni-boundary-line",
  type: "line",
  source: "ni-boundary",
  paint: {
    "line-color": "#000",
    "line-width": 4
  }
});


    map.addLayer({
      id: "sdz-outline",
      type: "line",
      source: "sdz-shapes",
      paint: {
        "line-color": ["get", "nisra_line"],
        "line-width": ["get", "nisra_width"]
      }
    });

    map.on("mousemove", e => {
  const features = map.queryRenderedFeatures(e.point, {
    layers: ["sdz-fill"]
  });

  map.getCanvas().style.cursor =
    features.length > 0 ? "pointer" : "default";
});

  map.setMaxBounds(niMaxBounds);

  moveToBounds(map_data.bounds, false);

  addSdzClick(map);

    addHoverPopup(map, "sdz-fill", "sdz-shapes", { nameOnly: true });
  });
}

function addSdzClick(map) {
  map.on("click", e => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: ["sdz-fill"]
    });

    const feature = features[0];
    const code = feature?.properties?.nisra_code;

    if (!code) return;

    window.history.pushState({}, "", `?sdz=${encodeURIComponent(code)}`);

    window.dispatchEvent(new Event("sdzchange"));
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


function moveToBounds(bounds, animate = true) {
  if (!bounds || bounds.length !== 4) return;

  const [lng1, lat1, lng2, lat2] = bounds;

  const normalisedBounds = [
    [Math.min(lng1, lng2), Math.min(lat1, lat2)],
    [Math.max(lng1, lng2), Math.max(lat1, lat2)]
  ];

  map.fitBounds(normalisedBounds, {
    padding: 30,
    duration: animate ? 800 : 0
  });
}

function normaliseBounds(bounds) {
  if (!bounds || bounds.length !== 4) return null;

  const [lng1, lat1, lng2, lat2] = bounds;

  return [
    [Math.min(lng1, lng2), Math.min(lat1, lat2)],
    [Math.max(lng1, lng2), Math.max(lat1, lat2)]
  ];
}

function getSdzCode(feature) {
  return String(feature.properties.SDZ21_code || "");
}

function getSdzName(feature) {
  return String(
    feature.properties.SDZ21_name || getSdzCode(feature)
  );
}