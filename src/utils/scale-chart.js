import { config } from '../config/config.js';

export function scaleChart(id, data, type, options = {}) {
  const {
    labels = "none", // "above", "below", or "none"
    marker = true,
    annotation = false,
    compareValue = null,
    comparisonScale = false
  } = options;

  const count = data.sdz_count ?? data.count;
  const value = marker && data?.data?.ranks?.[type] != null ? data.data.ranks[type] : null;

  const SCALE_WIDTH = 151.9;
  const VIEWBOX_X = -4;
  const VIEWBOX_WIDTH = 160;

  const SCALE_GROUP_X = -33.8;
  const SCALE_GROUP_Y = annotation ? -88.2 : -93.2;

  const RECT_X = 34.2;
  const RECT_Y = 95.2;
  const RECT_WIDTH = 16.7;
  const RECT_HEIGHT = 6.6;
  const RECT_GAP = 14.9;

  const MARKER_RADIUS = 3.3;
  const MARKER_STROKE = 0.5;
  const MARKER_X = value != null ? (value / count) * SCALE_WIDTH : 0;
  const MARKER_Y = RECT_Y + SCALE_GROUP_Y + RECT_HEIGHT / 2;
  const MARKER_TOP_Y = MARKER_Y - MARKER_RADIUS;
  const COMPARE_X = compareValue != null
    ? (compareValue / count) * SCALE_WIDTH
    : null;
  const selectedMarkerColor = comparisonScale ? "#D4351C" : "#f8f8f8"


  const LABEL_LEFT = "← 1 (Most deprived)";
  const LABEL_MIDDLE = "Rank";
  const LABEL_RIGHT = `(Least deprived) ${count} →`;

  const div = document.getElementById(id);

  const chartId = `${id}-${type}`;
  const scaleGroupId = `g10-${chartId}`;
  const arrowHeadId = `arrowHead-${chartId}`;

  const viewBox =
    annotation
      ? `${VIEWBOX_X} -10 ${VIEWBOX_WIDTH} 40`
      : labels == "below"
      ? `${VIEWBOX_X} -2 ${VIEWBOX_WIDTH} 20.6`
      : labels == "above"
      ? `${VIEWBOX_X} -5 ${VIEWBOX_WIDTH} 20.6`
      : `${VIEWBOX_X} -4 ${VIEWBOX_WIDTH} 16.6`;

  const labelAboveSvg =
    labels == "above"
      ? `
  <text x="0" y="-1" font-size="5" text-anchor="start">
    ${LABEL_LEFT}
  </text>

  <text x="75" y="-1" font-size="5" text-anchor="middle">
    ${LABEL_MIDDLE}
  </text>

  <text x="150" y="-1" font-size="5" text-anchor="end">
    ${LABEL_RIGHT}
  </text>
`
      : "";

  const labelBelowY = annotation ? 22 : 15;

  const labelBelowSvg =
    labels == "below"
      ? `
  <text x="0" y="${labelBelowY}" font-size="5" text-anchor="start">
    ${LABEL_LEFT}
  </text>

  <text x="75" y="${labelBelowY}" font-size="5" text-anchor="middle">
    ${LABEL_MIDDLE}
  </text>

  <text x="150" y="${labelBelowY}" font-size="5" text-anchor="end">
    ${LABEL_RIGHT}
  </text>
`
      : "";

  let annotationSvg = "";

  if (annotation && marker) {
    const placeName = data.name;
    const boxLabel = `Rank: ${value}`;

    const BOX_HEIGHT = 14;
    const BOX_Y = -9;
    const BOX_GAP = 6.4;
    const BOX_MIN_X = -1.3;
    const BOX_MAX_X = 154.5;

    const arrowFromLeft = value > count / 2;
    const longestLine = Math.max(placeName.length, boxLabel.length);
    const boxWidth = Math.max(28, longestLine * 2.8 + 5);

    const boxX = arrowFromLeft
      ? Math.max(BOX_MIN_X, MARKER_X - BOX_GAP - boxWidth)
      : Math.min(BOX_MAX_X - boxWidth, MARKER_X + BOX_GAP);

    const boxMidY = BOX_Y + BOX_HEIGHT / 2;

    annotationSvg = `
  <defs>
    <marker
      id="${arrowHeadId}"
      viewBox="0 0 8 6"
      refX="8"
      refY="3"
      markerWidth="8"
      markerHeight="6"
      orient="auto"
      markerUnits="strokeWidth">
      <path d="M0,0 L8,3 L0,6 L2,3 Z" fill="#042433" />
    </marker>
  </defs>

  <rect
    x="${boxX}"
    y="${BOX_Y}"
    width="${boxWidth}"
    height="${BOX_HEIGHT}"
    rx="0.3"
    fill="#ffffff"
    stroke="#042433"
    stroke-width="0.2" />

  <text
    x="${boxX + 0.8}"
    y="${BOX_Y + 1.5}"
    fill="var(--nisra_purple)"
    font-size="5"
    font-family="sans-serif"
    dominant-baseline="hanging"
    font-weight="bold">
    <tspan x="${boxX + 0.8}" dy="0">${placeName}</tspan>
  </text>

  <text
    x="${boxX + 0.8}"
    y="${BOX_Y + 1.5}"
    fill="var(--nisra_blue)"
    font-size="5"
    font-family="sans-serif"
    dominant-baseline="hanging"
    >
    <tspan x="${boxX + 0.8}" dy="6">${boxLabel}</tspan>
  </text>

  <line
    x1="${arrowFromLeft ? boxX + boxWidth : boxX}"
    y1="${boxMidY}"
    x2="${MARKER_X}"
    y2="${boxMidY}"
    stroke="#042433"
    stroke-width="0.4" />

  <line
    x1="${MARKER_X}"
    y1="${boxMidY}"
    x2="${MARKER_X}"
    y2="${MARKER_TOP_Y}"
    stroke="#042433"
    stroke-width="0.4"
    marker-end="url(#${arrowHeadId})" />
`;
  }

  const markerSvg =
    marker && value != null
      ? `
  <circle
    cx="${MARKER_X}"
    cy="${MARKER_Y}"
    r="${MARKER_RADIUS}"
    stroke="#042433"
    stroke-width="${MARKER_STROKE}"
    stroke-miterlimit="8"
    fill="${selectedMarkerColor}"
    id="marker-${chartId}" />
`
      : "";

      
  const compareMarkerSvg =
    compareValue != null
      ? `
  <circle
    cx="${COMPARE_X}"
    cy="${MARKER_Y}"
    r="${MARKER_RADIUS}"
    fill="#ce70d2"
    stroke="#042433"
    stroke-width="${MARKER_STROKE}"
    id="compare-marker-${chartId}" />
`
      : "";


  div.innerHTML = `
<svg
  viewBox="${viewBox}"
  xmlns="http://www.w3.org/2000/svg">

  ${annotationSvg}

  <g
    id="${scaleGroupId}"
    transform="translate(${SCALE_GROUP_X}, ${SCALE_GROUP_Y})">
  </g>

  ${labelAboveSvg}

  ${markerSvg}
  ${compareMarkerSvg}

  ${labelBelowSvg}

</svg>
`;

  const g10 = document.getElementById(scaleGroupId);

  for (let i = 0; i < config.scale_colours.length; i++) {
    const colour = config.scale_colours[i];

    g10.innerHTML += `
      <rect
        style="fill:${colour};fill-opacity:1;stroke:#ffffff;stroke-width:0.4"
        id="rect${i + 1}-${chartId}"
        width="${RECT_WIDTH}"
        height="${RECT_HEIGHT}"
        x="${RECT_X + i * RECT_GAP}"
        y="${RECT_Y}" />
    `;
  }
}