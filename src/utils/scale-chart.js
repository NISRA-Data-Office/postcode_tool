import { scaleColours } from './ScaleColours.js';

export function scaleChart(id, data, type, showLabels = null, showMarker = true, options = {}) {

  const value = data.data.ranks[type];
  const count = data.children_count ?? data.count
  const {
  compareValue = null,
  markerColor = "#f8f8f8",
  markerStroke = "#042433",
  compareColor = "#F59E0B"
  } = options;

  const x_position = value / count * -151.90294;

  const viewBox =
    showLabels == "below"
      ? "-1.3229166 -2 154.5487732 20.583334"
      : showLabels == "above"
      ? "-1.3229166 -5 154.5487732 20.583334"
      : "-1.3229166 -4 154.5487732 16.583334";

  const div = document.getElementById(id);

  div.innerHTML = `
<svg
   viewBox="${viewBox}"
   xmlns="http://www.w3.org/2000/svg">
   <g
     id="g10-${id}-${type}"
     transform="translate(-33.784712,-93.201939)">
   </g>

   ${
     showLabels == "above"
       ? `
    <text x="0" y="-1" font-size="5" text-anchor="start">
        ← 1 (Most deprived)
    </text>

    <text x="75" y="-1" font-size="5" text-anchor="middle">
        Rank
    </text>

    <text x="150" y="-1" font-size="5" text-anchor="end">
        (Least deprived) ${count} →
    </text>
   `
       : ""
   }
    ${
      showMarker
      ? `
     <rect
      x="${x_position}"
      y="0.2645835"
      width="1.3229166"
      height="10.054167"
      stroke="${markerStroke}"
      stroke-width="0.529167"
      stroke-miterlimit="8"
      fill="${markerColor}"
      transform="scale(-1,1)"
      id="marker" />
      `
      : ""
    }
    ${
    compareValue != null
    ? `
  <rect
    x="${compareValue / count * -151.90294}"
    y="0.2645835"
    width="1.3229166"
    height="10.054167"
    stroke="${compareColor}"
    stroke-width="0.6"
    fill="${compareColor}"
    transform="scale(-1,1)"
    id="compare-marker" />
    `
    : ""
    }
   ${
     showLabels == "below"
       ? `
    <text x="0" y="15" font-size="5" text-anchor="start">
        ← 1 (Most deprived)
    </text>

    <text x="75" y="15" font-size="5" text-anchor="middle">
        Rank
    </text>

    <text x="150" y="15" font-size="5" text-anchor="end">
        (Least deprived) ${count} →
    </text>
   `
       : ""
   }

</svg>
`;

const g10 = document.getElementById(`g10-${id}-${type}`);

  for (let i = 0; i < scaleColours.length; i++) {
    const colour = scaleColours[i];

    g10.innerHTML += `
      <rect
        style="fill:${colour};fill-opacity:1;stroke:#ffffff;stroke-width:0.79375"
        id="rect${i + 1}"
        width="16.710997"
        height="6.5831203"
        x=${34.181587 + i * 14.933132}
        y="95.202042" />
    `;
  }
}