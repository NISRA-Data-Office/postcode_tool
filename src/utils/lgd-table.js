export function createLGDTable(container, place, selectedDeprivation) {
  let sortKey = "rank";
  let sortAsc = true;

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
          <tr>
            <td>${child.rank ?? ""}</td>
            <td>${child.name}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
`;

    // Add click handlers
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
  }

  render();
}