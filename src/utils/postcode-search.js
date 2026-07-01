export let postcode_data;

export async function postcodeSearch(id, placeholder = "Search for a postcode or neighbourhood") {

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
    class="btn rounded-0 border-secondary bg-purple"
    type="button">
    Go
    </button>
  </div>

  <div id="postcode-dropdown" class="postcode-dropdown border border-secondary position-absolute d-none"></div>

  <div id="postcode-invalid" class="text-danger d-none mt-1 position-absolute border border-secondary bg-white p-1">
    No results found. Please check your postcode or area name and try again.
  </div>
  `

  const input = document.getElementById("postcode-input");
  const goButton = document.getElementById("postcode-go");
  const dropdown = document.getElementById("postcode-dropdown");
  const invalid = document.getElementById("postcode-invalid");
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

  function normaliseSearchValue(value) {
    return value.replace(/\s+/g, "").toUpperCase();
  }

  const postcodes = [];
  const sdzs = [];

  Object.entries(postcode_data).forEach(([sdzCode, sdz]) => {
    const normalisedName = normaliseSearchValue(sdz.name);

    sdzs.push({
      sdzCode,
      sdzName: sdz.name,
      searchableName: normalisedName,
      postcode: null
    });

    sdz.codes.forEach(postcode => {
      postcodes.push({
        postcode,
        searchablePostcode: normaliseSearchValue(postcode),
        searchableName: normalisedName,
        sdzCode,
        sdzName: sdz.name
      });
    });
  });

  function goToPostcode(item) {
    const params = new URLSearchParams({ sdz: item.sdzCode });

    if (item.postcode) {
      params.set("postcode", item.postcode);
    }

    window.location.href = `sdz.html?${params.toString()}`;
  }

  function hideDropdown() {
    dropdown.innerHTML = "";
    dropdown.classList.add("d-none");
    dropdown.classList.remove("d-block");
    selectedIndex = -1;
    currentMatches = [];
  }

  function showInvalid() {
    invalid.classList.remove("d-none");
  }

  function hideInvalid() {
    invalid.classList.add("d-none");
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

  function isPostcodeSearch(search) {
    return search.startsWith("BT");
  }

  function matchesSearch(item, search) {
    if (!isPostcodeSearch(search)) {
      return false;
    }

    return (
      item.searchablePostcode === search ||
      item.searchablePostcode.startsWith(search)
    );
  }

  function findExactMatch() {
    const search = normaliseSearchValue(input.value);

    return postcodes.find(item => matchesSearch(item, search));
  }

  function findFirstPartialMatch() {
    const search = normaliseSearchValue(input.value);

    const nameMatch = sdzs.find(item => item.searchableName === search || item.searchableName.startsWith(search));

    if (nameMatch) {
      return {
        sdzCode: nameMatch.sdzCode,
        sdzName: nameMatch.sdzName,
        postcode: null
      };
    }

    return postcodes.find(item => matchesSearch(item, search));
  }

  function runSearch() {
    const search = normaliseSearchValue(input.value);

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
    const search = normaliseSearchValue(input.value);

    dropdown.innerHTML = "";
    selectedIndex = -1;
    currentMatches = [];

    if (search.length < 3) {
      hideDropdown();
      hideInvalid();
      return;
    }

    const nameMatches = sdzs.filter(item => item.searchableName === search || item.searchableName.startsWith(search));
    const postcodeMatches = isPostcodeSearch(search)
      ? postcodes.filter(item => matchesSearch(item, search)).slice(0, 20)
      : [];

    currentMatches = [
      ...nameMatches.map(item => ({
        sdzCode: item.sdzCode,
        sdzName: item.sdzName,
        postcode: null,
        isNameMatch: true
      })),
      ...postcodeMatches
    ].slice(0, 20);

    if (currentMatches.length === 0) {
      hideDropdown();
      showInvalid();
      return;
    } else {
      hideInvalid();
    }

    currentMatches.forEach((item, index) => {
      const option = document.createElement("button");
      option.type = "button";
      option.className = "postcode-dropdown__item";
      option.classList.add("d-block");
      option.classList.add("w-100");
      option.classList.add("p-2");
      option.classList.add("border-0");
      option.classList.add("border-bottom");
      option.classList.add("text-start");
      option.setAttribute("role", "option");
      option.setAttribute("aria-selected", "false");

      option.innerHTML = item.isNameMatch
        ? `View: <strong>${item.sdzName}</strong> neighbourhood`
        : `
          <strong>${item.postcode}</strong>
          View: <strong>${item.sdzName}</strong> neighbourhood
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

    dropdown.classList.add("d-block");
    dropdown.classList.remove("d-none");
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