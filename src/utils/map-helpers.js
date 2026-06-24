export async function loadShapes(filename) {
  const url = `public/map/${filename}`;

  const res = await fetch(url, { cache: "force-cache" });
  if (!res.ok) throw new Error(`Failed to load ${url}`);

  const data = await res.json();

  return (data.type === "Topology" && window.topojson)
    ? topojson.feature(data, Object.values(data.objects)[0])
    : data;
}

export function normaliseBounds(bounds) {
  if (!Array.isArray(bounds) || bounds.length !== 4) return null;

  const [lng1, lat1, lng2, lat2] = bounds;

  return [
    [Math.min(lng1, lng2), Math.min(lat1, lat2)],
    [Math.max(lng1, lng2), Math.max(lat1, lat2)]
  ];
}

export function moveToBounds(map, bounds, animate = true) {
  const normalisedBounds = normaliseBounds(bounds);
  if (!normalisedBounds) return;

  map.resize?.();

  map.fitBounds(normalisedBounds, {
    padding: 30,
    duration: animate ? 800 : 0,
    essential: true
  });
}

export function getSdzCode(feature) {
  return String(feature.properties.SDZ21_code || "");
}

export function getSdzName(feature) {
  return String(feature.properties.SDZ21_name || getSdzCode(feature));
}

export function clearFeatureState(map, source, id, stateName) {
  if (id === null || !map?.getSource(source)) return null;

  map.setFeatureState({ source, id }, { [stateName]: false });

  return null;
}

export function getPopupHtml(props, options = {}) {
  if (options.nameOnly) {
    return `<div><strong>${props.nisra_label}</strong></div>`;
  }

  const value =
    props.nisra_value == null
      ? "Not available"
      : Number(props.nisra_value).toLocaleString("en-GB");

  return `<div><strong>${props.nisra_label}</strong>: <strong>${value}</strong></div>`;
}