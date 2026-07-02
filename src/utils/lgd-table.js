import { config } from "../config/config.js";
import { insertValue } from "./insert-value.js";

export function createLGDTable(container, place, selectedDeprivation, sdz) {
  let sortKey = "niRank";
  let sortAsc = true;
  let selectedCode = null;

  function getSortedNames() {
    const rows = Object.entries(place?.data?.ranks || {})
    .map(([code, item]) => ({
      code,
      name: item.name,
      niRank: item.ranks?.[selectedDeprivation],
      lgd: item.lgd,
      lgdName: place.data.lgd?.[item.lgd]?.name
    }));
    
    const groups = {};
    rows.forEach(row => {
      if (!groups[row.lgd]) groups[row.lgd] = [];
      groups[row.lgd].push(row);
    });
    
    Object.values(groups).forEach(group => {
      group.sort((a, b) => (a.niRank ?? Infinity) - (b.niRank ?? Infinity))
      .forEach((row, i) => {
        row.lgdRank = i + 1;
      });
    });
    
    const result = Object.values(groups).flat();
    
    return result.sort((a, b) => {
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

        const scrollContainer = container; // or container.parentElement if that's the scrolling element

        scrollContainer.scrollTo({
        top:
          row.offsetTop -
          scrollContainer.clientHeight / 2 +
          row.clientHeight / 2,
        behavior: "smooth"
      });
      } else {
        row.classList.remove("selected");
      }
    });
  }

  function render() {
    const names = getSortedNames();

    container.innerHTML = `
      <table class="lgd-table">
        <thead>
          <tr>
            <th 
              data-key="niRank" 
              class="cursor-pointer w-25"
              tabindex="0"
              aria-label="Sort by NI rank">
              NI Rank
              ${sortKey === "niRank" ? (sortAsc ? " ▲" : " ▼") : ""}
            </th>
            ${place.type === "lgd" ? `
            <th
              data-key="lgdRank",
              class="cursor-pointer w-30"
              tabindex="0"
              aria-label="Sort by Council rank">
              Council Rank
              ${sortKey === "lgdRank" ? (sortAsc ? " ▲" : " ▼") : ""}
            </th>
             ` : ""}
              <th 
                data-key="name" 
                class="cursor-pointer w-45"
                tabindex="0"
                aria-label="Sort neighbourhoods alphabetically">
                Neighbourhood
                ${sortKey === "name" ? (sortAsc ? " ▲" : " ▼") : ""}
              </th>
          </tr>
        </thead>
        <tbody>
          ${names.map(child => `
            <tr class="sdz-row cursor-pointer" 
                data-code="${child.code}" 
                tabindex="-1" 
                aria-label="Focus map on ${child.name}, ranked ${child.rank ?? "unknown"}">
              <td class="border-secondary">${child.niRank ?? ""}</td>
              ${place.type === "lgd" ? `<td class="border-secondary">${child.lgdRank}</td>` : ""}
              <td class="border-secondary text-break">${child.name}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
    
    const rows = container.querySelectorAll(".sdz-row");
    
    if (rows.length) {
      const initialRow =
      selectedCode
      ? Array.from(rows).find(r => r.dataset.code === selectedCode)
      : rows[0];
      
      if (initialRow) {
        initialRow.setAttribute("tabindex", "0");
      }
    }

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
      row.addEventListener("mouseenter", () => {
        window.dispatchEvent(new CustomEvent("sdzhover", {
          detail: { code: row.dataset.code }
        }));
      });

      row.addEventListener("mouseleave", () => {
        window.dispatchEvent(new CustomEvent("sdzhover", {
          detail: { code: null }
        }));
      });

      row.addEventListener("click", () => {
        const code = row.dataset.code;
        if (!code) return;

        selectedCode = code;
        highlightRow(selectedCode);

        const url = new URL(window.location);
        url.searchParams.set("sdz", code);

        window.history.replaceState(
          {},
          "",
          `${url.pathname}${url.search}${url.hash}`
        );

        document.getElementById("in-focus").classList.add("is-open");
        document.getElementById("focus-link").href = `sdz.html?sdz=${selectedCode}`;
        document.getElementById("focus-link").textContent = place.data.ranks[selectedCode].name;

        window.dispatchEvent(
          new CustomEvent("sdzselect", {
            detail: { code }
          })
        );
      });

      row.addEventListener("keydown", e => {
        const rows = Array.from(container.querySelectorAll(".sdz-row"));
        const index = rows.indexOf(row);
        
        let nextIndex = index;
        
        if (e.key === "ArrowDown") {
          e.preventDefault();
          nextIndex = Math.min(index + 1, rows.length - 1);
        }

        if (e.key === "ArrowUp") {
          e.preventDefault();
          nextIndex = Math.max(index - 1, 0);
        }

        if (nextIndex !== index) {
          const nextRow = rows[nextIndex];

          row.setAttribute("tabindex", "-1");
          nextRow.setAttribute("tabindex", "0");

          nextRow.focus();
        }

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