import { loadShapes } from "./load-shapes.js";

export let map;

let sdzGeojsonData;

export async function plotScaleMap(elementId, map_data, options = {}) {
  const { animate = true } = options;

  if (!sdzGeojsonData) {
    sdzGeojsonData = await loadShapes("SDZ2021.geo.json");
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

        nisra_fill: code === selectedCode ? "#0078FF" : "#eeeeee"
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

  map = new maplibregl.Map({
    container: elementId,
    style: "public/map/style-omt.json",
    center: [-6.7, 54.7],
    zoom: 7,
    attributionControl: false
  });

  map.addControl(
    new maplibregl.NavigationControl(),
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
        "fill-color": ["get", "nisra_fill"],
        "fill-opacity": 0.7
      }
    });

    map.addLayer({
      id: "sdz-outline",
      type: "line",
      source: "sdz-shapes",
      paint: {
        "line-color": "#555",
        "line-width": 1
      }
    });

    moveToBounds(map_data.bounds, false);

    addSdzClick(map);
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

function getSdzCode(feature) {
  return String(feature.properties.SDZ21_code || "");
}

function getSdzName(feature) {
  return String(
    feature.properties.SDZ21_name || getSdzCode(feature)
  ).replaceAll("_", " ");
}