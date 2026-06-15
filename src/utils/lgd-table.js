export function createLGDTable(container, place, selectedDeprivation) {
  let sortKey = "rank";
  let sortAsc = true;
  let selectedCode = null;

  function getSortedNames() {
    return (place?.children || [])
      .map(child => ({
        ...child,
        rank: place?.data?.ranks?.[child.code]?.[selectedDeprivation]
      }))
      .sort((a, b) => {
        let valA = a[sortKey];
        let valB = b[sortKey];

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

    container.innerHTML = `
    <table class="lgd-table">
      <thead>
        <tr>
          <th data-key="rank" style="cursor:pointer;">
            Rank (of ${place.children_count})
            ${sortKey === "rank" ? (sortAsc ? " ▲" : " ▼") : ""}
          </th>
          <th data-key="name" style="cursor:pointer;">
            Neighbourhood or super data zone
            ${sortKey === "name" ? (sortAsc ? " ▲" : " ▼") : ""}
          </th>
        </tr>
      </thead>
      <tbody>
        ${names.map(child => `
          <tr class="sdz-row" data-code="${child.code}" style="cursor:pointer;" title="See ${child.name} deprivation profile">
            <td>${child.rank ?? ""}</td>
            <td>${child.name}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
    `;

    container.querySelectorAll("th[data-key]").forEach(th => {
      th.addEventListener("click", () => {
        const key = th.dataset.key;

        if (sortKey === key) {
          sortAsc = !sortAsc;
        } else {
          sortKey = key;
          sortAsc = true;
        }

        render();
      });
    });

    container.querySelectorAll(".sdz-row").forEach(row => {
      row.addEventListener("click", () => {
        const code = row.dataset.code;

        if (code) {
          window.location.href = `sdz.html?sdz=${code}`;
        }
      });
    });

    if (selectedCode) {
      highlightRow(selectedCode);
    }
  }

  window.addEventListener("sdzselect", (e) => {
    selectedCode = e.detail.code;
    highlightRow(selectedCode);
  });

  render();
}