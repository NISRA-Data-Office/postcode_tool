export async function postcodeSearch(id) {
  const input = document.getElementById(id);
  if (!input) return;

  const response = await fetch("public/search_data/postcode.json");
  const data = await response.json();

  const dropdown = document.createElement("div");
  dropdown.className = "postcode-dropdown";
  dropdown.style.display = "none";
  input.insertAdjacentElement("afterend", dropdown);

  const postcodes = [];

  Object.entries(data).forEach(([sdzCode, sdz]) => {
    sdz.codes.forEach(postcode => {
      postcodes.push({
        postcode,
        sdzCode,
        sdzName: sdz.name
      });
    });
  });

  function normalisePostcode(value) {
    return value.replace(/\s+/g, "").toUpperCase();
  }

  input.addEventListener("input", () => {
    const search = normalisePostcode(input.value);

    dropdown.innerHTML = "";

    if (search.length < 3) {
      dropdown.style.display = "none";
      return;
    }

    const matches = postcodes
      .filter(item => item.postcode.startsWith(search))
      .slice(0, 20);

    if (matches.length === 0) {
      dropdown.style.display = "none";
      return;
    }

    matches.forEach(item => {
      const option = document.createElement("button");
      option.type = "button";
      option.className = "postcode-dropdown__item";

      option.innerHTML = `
        <strong>${item.postcode}</strong>
        View: <strong>${item.sdzName}</strong> super data zone
      `;

      option.addEventListener("click", () => {
        window.location.href =
          `sdz.html?sdz=${encodeURIComponent(item.sdzCode)}&postcode=${encodeURIComponent(item.postcode)}`;
      });

      dropdown.appendChild(option);
    });

    dropdown.style.display = "block";
  });

  input.addEventListener("keydown", e => {
  if (e.key !== "Enter") return;

  const search = normalisePostcode(input.value);

  const match = postcodes.find(
    item => item.postcode === search
  );

  if (match) {
    window.location.href =
      `sdz.html?sdz=${encodeURIComponent(match.sdzCode)}&postcode=${encodeURIComponent(match.postcode)}`;
  }
});
}