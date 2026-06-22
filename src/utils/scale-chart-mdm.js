
  import { config } from '../config/config.js';
  
  export function scaleChartMDM (id, data) {

  const value = data.data.ranks.mdm;
  const count = data.count;

  const markerWidth = 1.3229166;
  const boxHeight = 14;
  const boxY = -9.0;
  const gap = 6.4;
  const svgMinX = -1.3229166;
  const svgMaxX = 154.5487732;
  const scaleY = 4.5;

  const x_position = value / count * -151.90294;
  const markerCenter = -x_position - markerWidth / 2;
  const placeName = data.name;
  const arrowFromLeft = value > count / 2;
  const boxLabel = `rank: ${value}`;

  const longestLine = Math.max(placeName.length, boxLabel.length);
  const boxWidth = Math.max(28, longestLine * 2.8 + 5);

  const boxX = arrowFromLeft
    ? Math.max(svgMinX, markerCenter - gap - boxWidth)
    : Math.min(svgMaxX - boxWidth, markerCenter + gap);

  const boxMidY = boxY + boxHeight / 2;

  const div = document.getElementById(id);

  div.innerHTML = `
  <svg
  viewBox="-1.3229166 -10 154.5487732 40"
  xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker
      id="arrowHead"
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
    x=${boxX}
    y=${boxY}
    width=${boxWidth}
    height=${boxHeight}
    rx="0.3"
    fill="#ffffff"
    stroke="#042433"
    stroke-width="0.2" />



  <text
    x=${boxX + 0.8}
    y=${boxY + 1.5}
    fill="var(--nisra_blue)"
    font-size="5"
    font-family="sans-serif"
    dominant-baseline="hanging">
    <tspan x=${boxX + 0.8} dy="0">${placeName}</tspan>
    <tspan x=${boxX + 0.8} dy="6">${boxLabel}</tspan>
  </text>

  <line
    x1=${arrowFromLeft ? boxX + boxWidth : boxX}
    y1=${boxMidY}
    x2=${markerCenter}
    y2=${boxMidY}
    stroke="#042433"
    stroke-width="0.35" />

  <line
    x1=${markerCenter}
    y1=${boxMidY}
    x2=${markerCenter}
    y2=${scaleY}
    stroke="#042433"
    stroke-width="0.35"
    marker-end="url(#arrowHead)" />

  <g
    id="g10"
    transform="translate(-33.784712,-88.201939)">
  </g>
  <g transform="translate(0, -88.201939)">
    <rect
      x="${x_position}"
      y="93.466519"
      width="1.3229166"
      height="10.054167"
      stroke="#042433"
      stroke-width="0.529167"
      stroke-miterlimit="8"
      fill="#f8f8f8"
      transform="scale(-1,1)"
      id="marker" />
    </g>

   <text x="0" y="22" font-size="5" text-anchor="start">
          ← 1 (Most deprived)
      </text>

      <text x="75" y="22" font-size="5" text-anchor="middle">
          Rank
      </text>

      <text x="150" y="22" font-size="5" text-anchor="end">
          (Least deprived) ${count} →
      </text>
</svg>

`

const g10 = document.getElementById("g10");
for (let i = 0; i < config.scale_colours.length; i ++) {
  let colour = config.scale_colours[i]
  g10.innerHTML += `
    <rect
        style="fill:${colour};fill-opacity:1;stroke:#ffffff;stroke-width:0.79375"
        id="rect${i + 1}"
        width="16.710997"
        height="6.5831203"
        x=${34.181587 + i * 14.933132}
        y="95.202042" />
  `
}

}


  
  




