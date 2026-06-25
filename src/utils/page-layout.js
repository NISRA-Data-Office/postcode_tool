import { config } from "../config/config.js";

export function insertHeader () {

    const banner = document.getElementById("banner");

    banner.classList.add("navbar");
    banner.classList.add("p-0");
    banner.style.backgroundColor = "var(--nisra_navy)";

banner.innerHTML = `
  <div class="container-fluid blue-bg align-items-center justify-content-center py-2">
    <p class="m-0">We welcome feedback from users through our <a href="https://dttselfserve.nidirect.gov.uk/NISRA/RateIt#/${config.rateit}" target="_blank" rel="noopener noreferrer">short survey</a></p>
  </div>
  <div class="container-fluid align-items-center justify-content-center" role="banner">
    <div class="container row py-2">
      <div class="col-12 col-xl-6 d-flex align-items-center justify-content-center justify-content-xl-start p-0">
      <a class="navbar-brand ps-2" href="https://www.nisra.gov.uk/" target="_blank" rel="noopener noreferrer">
      <img src="assets/img/logo/nisra-only-white.svg"
            alt="NISRA logo" height="60" class="me-3" role="img" title="NISRA Website (opens in new tab)">
     </a></div>
      <div class="col-12 col-xl-6 d-flex align-items-center justify-content-center justify-content-xl-end text-white p-0">
    <h1 class="mb-0">${config.title}</h1>
</div>
    </div>
  </div>
  <div class="container-fluid align-items-center justify-content-center green-bg py-2" role="banner">
    ${config.year ? `The ${config.year}` : "Dummy"} statistics on deprivation in Northern Ireland, including the Multiple Deprivation Measure (MDM)
    </div>
`
}

export function insertNavButtons(data) {
  const nav = document.getElementById("nav");

  nav.innerHTML = `
    <ol class="breadcrumb mb-0 mt-2 mb-2 text-secondary">
      <li class="breadcrumb-item">
        <a href="index.html" class="p-1" >Home</a>
      </li>
      <li class="breadcrumb-item">
        ${data.type == "sdz" ? `<a href="lgd.html?lgd=${data.parents[0].code}" class="p-1">${data.parents[0].name}</a>` : data.name }
      </li>
      ${data.type == "sdz" ? `<li class="breadcrumb-item" class="p-1">${data.name}</li>`: ""}
    </ol>
  `
  
}


export function insertFooter () {

    const footer = document.getElementById("footer");

    footer.classList.add("footer");
    footer.classList.add("py-4");
    footer.classList.add("bg-nisra");
    footer.classList.add("text-nisra");
    footer.classList.add("pb-5");
    
    footer.innerHTML = `
    <div class="container">
      <!-- 3 column section -->
      <div class="row mb-3">
        <div class="col-md-4">
          <h3 class="h5">Data Tools</h3>
          <ul class="list-unstyled">
            <li><a href="https://explore.nisra.gov.uk/local-stats/">Local Statistics Explorer</a></li>
            <li><a href="https://data.nisra.gov.uk">Data Portal</a></li>
            <li><a href="https://build.nisra.gov.uk/en/">Census Flexible Table Builder</a></li>
          </ul>
        </div>
        <div class="col-md-4">
          <h3 class="h5">Corporate</h3>
          <ul class="list-unstyled">
            <li><a href="https://www.nisra.gov.uk/">NISRA Website</a></li>
            <li><a href="https://www.nisra.gov.uk/about-us/careers">Careers</a></li>
            <li><a href="https://www.nisra.gov.uk/contact">Contact</a></li>
          </ul>
        </div>
        <div class="col-md-4">
          <h3 class="h5">Follow</h3>
          <ul class="list-inline">
            <li class="list-inline-item">
              <a href="https://www.facebook.com/nisra.gov.uk">
                <img src="assets/img/logo/facebook-brands-solid-full.svg" title="Facebook" role="img" class="img-50"/>
              </a>
            </li>
            <li class="list-inline-item">
              <a href="https://x.com/NISRA/">
                <img src="assets/img/logo/x-twitter-brands-solid-full.svg" title="Twitter/X" role="img" class="img-50"/>
              </a>
            </li>
            <li class="list-inline-item">
              <a href="https://www.youtube.com/user/nisrastats">
                <img src="assets/img/logo/youtube-brands-solid-full.svg" title="YouTube" role="img" class="img-50"/>
              </a>
            </li>
            <li class="list-inline-item">
              <a href="https://www.linkedin.com/company/northern-ireland-statistics-and-research-agency/">
                <img src="assets/img/logo/linkedin-in-brands-solid-full.svg" title="LinkedIn" role="img" class="img-50"/>
              </a>
            </li>
            <li class="list-inline-item">
              <a href="https://www.instagram.com/nisra.gov.uk/">
                <img src="assets/img/logo/instagram-brands-solid-full.svg" title="Instagram" role="img" class="img-50"/>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Horizontal list with separators -->
      <ul class="list-inline footer-links text-center mb-0">
        <li class="list-inline-item"><a href="https://www.nisra.gov.uk/crown-copyright">© Crown Copyright</a></li>
        <li class="list-inline-item">|</li>
        <li class="list-inline-item"><a href="https://www.nisra.gov.uk/terms-and-conditions">Terms and conditions</a></li>
        <li class="list-inline-item">|</li>
        <li class="list-inline-item"><a href="https://www.nisra.gov.uk/cookies">Cookies</a></li>
        <li class="list-inline-item">|</li>
        <li class="list-inline-item"><a href="https://www.nisra.gov.uk/nisra-privacy-notice">Privacy</a></li>
        <li class="list-inline-item">|</li>
        <li class="list-inline-item"><a href="https://datavis.nisra.gov.uk/dissemination/accessibility-statement-visualisations.html">Accessibility Statement</a></li>
      </ul>
    </div>
    `

}

export async function insertHead(title) {
  const head = document.head;

  // Clear existing head safely if you really need to
  head.innerHTML = `
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${config.title} - ${title}</title>

    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css">

    <link rel="icon" href="assets/img/icon/favicon.ico" type="image/vnd.microsoft.icon" />
    <link rel="icon" type="image/png" href="assets/img/icon/favicon-96x96.png" sizes="96x96" />
    <link rel="icon" type="image/svg+xml" href="assets/img/icon/favicon.svg" />
    <link rel="shortcut icon" href="assets/img/icon/favicon.ico" />
    <link rel="apple-touch-icon" sizes="180x180" href="assets/img/icon/apple-touch-icon.png" />
    <meta name="apple-mobile-web-app-title" content="${config.title} - ${title}" />

    <link rel="stylesheet" href="https://unpkg.com/maplibre-gl@5.6.2/dist/maplibre-gl.css">

    <link rel="stylesheet" href="assets/css/styles.css">
  `;

  // helper to load scripts in order
  const loadScript = (src) =>
    new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.defer = true;
      s.onload = resolve;
      s.onerror = reject;
      head.appendChild(s);
    });

  await loadScript("https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js");
  await loadScript("https://unpkg.com/maplibre-gl@5.6.2/dist/maplibre-gl.js");

  document.body.removeAttribute("style");

}