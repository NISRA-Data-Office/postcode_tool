export let postcode_data;

export async function postcodeSearch(id, placeholder = "Search for a postcode") {

  document.getElementById(id).innerHTML = `
  <div class="input-group">
    <input
    id="postcode-input"
    type="search"
    class="form-control rounded-0 border-secondary"
    placeholder="${placeholder}"
    aria-label="${placeholder}"
    autocomplete="off"
    autocorrect="off"
    autocapitalize="off"
    spellcheck="false">

    <button
    id="postcode-go"
    class="btn btn-primary rounded-0 border-secondary"
    type="button">
    Go
    </button>
  </div>

  <div id="postcode-dropdown" class="postcode-dropdown"></div>
  `

  const input = document.getElementById("postcode-input");
  const goButton = document.getElementById("postcode-go");
  const dropdown = document.getElementById("postcode-dropdown");

  if (!input || !dropdown) return;

  input.setAttribute("autocomplete", "off");
  input.setAttribute("autocorrect", "off");
  input.setAttribute("autocapitalize", "off");
  input.setAttribute("spellcheck", "false");

  try {

    let data_cached = localStorage.getItem("postcode");

    const parsed_data = data_cached ? JSON.parse(data_cached): null;
    let ts = parsed_data?.ts;
    postcode_data = parsed_data?.postcode_data;

    if (Date.now() - ts > 60 * 60 * 1000) {
        localStorage.removeItem("postcode");
        data_cached = null;
    }

    if (!data_cached) {

      const response = await fetch("public/search_data/postcode.json");
      postcode_data = await response.json();
        
      localStorage.setItem("postcode", JSON.stringify({ ts: Date.now(), postcode_data }))
        
    }

  } catch (error) {
    console.error("Failed to load postcode lookup data:", error);
    return; 
  }

  

  let selectedIndex = -1;
  let currentMatches = [];

  function normalisePostcode(value) {
    return value.replace(/\s+/g, "").toUpperCase();
  }

  const postcodes = [];

  Object.entries(postcode_data).forEach(([sdzCode, sdz]) => {
    sdz.codes.forEach(postcode => {
      postcodes.push({
        postcode,
        searchablePostcode: normalisePostcode(postcode),
        sdzCode,
        sdzName: sdz.name
      });
    });
  });

  function goToPostcode(item) {
    window.location.href =
      `sdz.html?sdz=${encodeURIComponent(item.sdzCode)}&postcode=${encodeURIComponent(item.postcode)}`;
  }

  function hideDropdown() {
    dropdown.innerHTML = "";
    dropdown.style.display = "none";
    selectedIndex = -1;
    currentMatches = [];
  }

  function updateSelection() {
    const options = dropdown.querySelectorAll(".postcode-dropdown__item");

    options.forEach((option, index) => {
      const isSelected = index === selectedIndex;

      option.classList.toggle(
        "postcode-dropdown__item--selected",
        isSelected
      );

      option.setAttribute("aria-selected", isSelected ? "true" : "false");
    });

    if (options[selectedIndex]) {
      options[selectedIndex].scrollIntoView({
        block: "nearest"
      });
    }
  }

  function findExactMatch() {
    const search = normalisePostcode(input.value);

    return postcodes.find(
      item => item.searchablePostcode === search
    );
  }

  function findFirstPartialMatch() {
    const search = normalisePostcode(input.value);

    return postcodes.find(
      item => item.searchablePostcode.startsWith(search)
    );
  }

  function runSearch() {
    const search = normalisePostcode(input.value);

    if (!search) return;

    const exactMatch = findExactMatch();

    if (exactMatch) {
      goToPostcode(exactMatch);
      return;
    }

    const partialMatch = findFirstPartialMatch();

    if (partialMatch) {
      goToPostcode(partialMatch);
    }
  }

  function showMatches() {
    const search = normalisePostcode(input.value);

    dropdown.innerHTML = "";
    selectedIndex = -1;
    currentMatches = [];

    if (search.length < 3) {
      hideDropdown();
      return;
    }

    currentMatches = postcodes
      .filter(item => item.searchablePostcode.startsWith(search))
      .slice(0, 20);

    if (currentMatches.length === 0) {
      hideDropdown();
      return;
    }

    currentMatches.forEach((item, index) => {
      const option = document.createElement("button");
      option.type = "button";
      option.className = "postcode-dropdown__item";
      option.setAttribute("role", "option");
      option.setAttribute("aria-selected", "false");

      option.innerHTML = `
        <strong>${item.postcode}</strong>
        View: <strong>${item.sdzName}</strong> super data zone
      `;

      option.addEventListener("click", () => {
        goToPostcode(item);
      });

      option.addEventListener("mouseenter", () => {
        selectedIndex = index;
        updateSelection();
      });

      dropdown.appendChild(option);
    });

    dropdown.style.display = "block";
  }

  input.addEventListener("input", showMatches);

  input.addEventListener("keydown", event => {
    if (event.key === "ArrowDown") {
      if (currentMatches.length === 0) {
        showMatches();
      }

      if (currentMatches.length === 0) return;

      event.preventDefault();

      selectedIndex =
        selectedIndex < currentMatches.length - 1
          ? selectedIndex + 1
          : 0;

      updateSelection();
      return;
    }

    if (event.key === "ArrowUp") {
      if (currentMatches.length === 0) return;

      event.preventDefault();

      selectedIndex =
        selectedIndex > 0
          ? selectedIndex - 1
          : currentMatches.length - 1;

      updateSelection();
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();

      if (selectedIndex >= 0 && currentMatches[selectedIndex]) {
        goToPostcode(currentMatches[selectedIndex]);
        return;
      }

      runSearch();
    }

    if (event.key === "Escape") {
      hideDropdown();
    }
  });

  if (goButton) {
    goButton.addEventListener("click", runSearch);
  }

  document.addEventListener("click", event => {
    const searchBox = input.closest(".postcode-search");

    if (searchBox && !searchBox.contains(event.target)) {
      hideDropdown();
    }
  });
}