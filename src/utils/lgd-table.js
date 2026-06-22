import { config } from "../config/config.js";

export function createLGDTable(container, place, selectedDeprivation, sdz) {
  let sortKey = "rank";
  let sortAsc = true;
  let selectedCode = null;

  function getSortedNames() {
    return Object.entries(place?.data?.ranks || {})
      .map(([code, item]) => ({
        code,
        name: item.name,
        rank: item.ranks?.[selectedDeprivation],
        lgd: place.data.lgd?.[item.lgd].name
      }))
      .sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];

        if (sortKey === "name") {
          return sortAsc
            ? (valA || "").localeCompare(valB || "")
            : (valB || "").localeCompare(valA || "");
        }

        return sortAsc
          ? (valA ?? Infinity) - (valB ?? Infinity)
          : (valB ?? Infinity) - (valA ?? Infinity);
      });
  }

  function highlightRow(code) {
    const rows = container.querySelectorAll(".sdz-row");

    rows.forEach(row => {
      if (row.dataset.code === code) {
        row.classList.add("selected");

        row.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      } else {
        row.classList.remove("selected");
      }
    });
  }

  function render() {
    const names = getSortedNames();
    
    const selectedDeprivationLabel = config.deprivation_types[selectedDeprivation];
    const sdzCount = place?.sdz_count ?? names.length;

    container.innerHTML = `
      <table class="lgd-table">
        <thead>
          <tr>
            <th 
              data-key="rank" 
              style="cursor:pointer;"
              tabindex="0"
              aria-label="Sort by rank">
              Rank
              ${sortKey === "rank" ? (sortAsc ? " ▲" : " ▼") : ""}
            </th>
            <th 
              data-key="name" 
              style="cursor:pointer;"
              tabindex="0"
              aria-label="Sort neighbourhoods alphabetically">
              Neighbourhood
              ${sortKey === "name" ? (sortAsc ? " ▲" : " ▼") : ""}
            </th>
            ${place.type === "ctry" ? `<th data-key="lgd" style="cursor:pointer;" tabindex="0", aria-label="Sort councils alphabetically">Council${sortKey === "lgd" ? (sortAsc ? " ▲" : " ▼") : ""}</th>` : ""}
          </tr>
        </thead>
        <tbody>
          ${names.map(child => `
            <tr class="sdz-row" 
                data-code="${child.code}" 
                style="cursor:pointer;"
                tabindex="0" 
                aria-label="View deprivation profile for ${child.name}, ranked ${child.rank ?? "unknown"}">
              <td>${child.rank ?? ""}</td>
              <td>${child.name}</td>
              ${place.type === "ctry" ? `<td>${child.lgd}</td>` : ""}
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;

    container.querySelectorAll("th[data-key]").forEach(th => {
      const handleSort = () => {
        const key = th.dataset.key;

        if (sortKey === key) {
          sortAsc = !sortAsc;
        } else {
          sortKey = key;
          sortAsc = true;
        }

        render();
      };

      th.addEventListener("click", handleSort);

      th.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleSort();
        }
      });
    });

    container.querySelectorAll(".sdz-row").forEach(row => {
      row.addEventListener("click", () => {
        const code = row.dataset.code;

        if (code) {
          window.location.href = `sdz.html?sdz=${code}`;
        }
      });

      row.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          row.click();
        }
      });
    });

    if (sdz) {
      selectedCode = sdz;
    }

    if (selectedCode) {
      highlightRow(selectedCode);
    }
  }

  window.addEventListener("sdzselect", e => {
    selectedCode = e.detail.code;
    highlightRow(selectedCode);
  });

  render();
}