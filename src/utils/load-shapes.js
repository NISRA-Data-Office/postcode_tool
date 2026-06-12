export async function loadShapes(filename = "LGD2014.geo.json") {
  const url = `public/map/${filename}`;

  const res = await fetch(url, { cache: "force-cache" });
  if (!res.ok) throw new Error(`Failed to load ${url}`);

  const data = await res.json();

  return (data.type === "Topology" && window.topojson)
    ? topojson.feature(data, Object.values(data.objects)[0])
    : data;
}