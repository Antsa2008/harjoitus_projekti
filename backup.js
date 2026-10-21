// ==========================================
// MOCK-DATA JA lOCALSTORAGE ALUSTUS
// ==========================================

const initialDevices = [
    { id: 1, type: "Tietokone", vendor: "Lenovo", model: "ThinkPad L14", serial: "LN12345", user: "Matti Meikäläinen", status: "Käytössä", purchaseDate: "2024-01-15", warrantyEnd: "2027-01-15", price: 1200, info: "Kehittäjän kone" },
    { id: 2, type: "Puhelin", vendor: "Apple", model: "iPhone 15", serial: "AP98765", user: "Maija Meikäläinen", status: "Käytössä", purchaseDate: "2024-03-10", warrantyEnd: "2026-03-10", price: 900, info: "" },
    { id: 3, type: "Tietokone", vendor: "HP", model: "ProBook440", serial: "DL55555", user: "Ei käyttäjää", status: "Varastossa", purchaseDate: "2025-06-01", warrantyEnd: "2028-06-01", price: 1050, info: "Uusi varakone" }
];

const initialUsers = [
    { id: 1, name: "Matti Meikäläinen", email: "matti@yritys.fi", department: "IT", title: "Ohjelmistokehittäjä" },
    { id: 2, name: "Maija Meikäläinen", email: "maija@yritys.fi", department: "Markkinointi", title: "Graafikko" }
];

const initialLicenses = [
    { id: 1, name: "Office 365 Enterprise", vendor: "Microsoft", total: 10, used: 8, renewDate: "2026-12-01", cost: 150 },
    { id: 2, name: "Adobe Creative Cloud", vendor: "Adobe", total: 5, used: 5, renewDate: "2026-11-15", cost: 400 }
];

// Funktio, joka varmistaa, että data löytyy selaimesta ja palauttaa sen objektina
function getAppData() {
    if (!localStorage.getItem("devices")) localStorage.setItem("devices", JSON.stringify(initialDevices));
    if (!localStorage.getItem("users")) localStorage.setItem("users", JSON.stringify(initialUsers));
    if (!localStorage.getItem("licenses")) localStorage.setItem("licenses", JSON.stringify(initialLicenses));

    return {
        devices: JSON.parse(localStorage.getItem("devices")),
        users: JSON.parse(localStorage.getItem("users")),
        licenses: JSON.parse(localStorage.getItem("licenses"))
    };
}

// Apufunktio datan tallennukseen (kutsutaan myöhemmin kun lisätään/muokataan jotain)
function saveAppData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// ==========================================
// SOVELLUKSEN KÄYNNISTYS JA NAVIGOINTI
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    console.log("IT Asset Management - sovellus käynnistetty!");

    // Alustetaan datat muistiin heti latauksessa
    getAppData();

    // Alustetaan navigointitoiminnallisuus
    setupNavigation();

    // LISÄYS: Avataan dynaaminen Dashboard-näkymä automaattisesti käynnistyksessä
    switchView("nav-dashboard");
});

// Navigaation hallinta
function setupNavigation() {
    const navContainer = document.querySelector(".nav-links");
    const navLinks = document.querySelectorAll(".nav-links a");

    if (!navContainer || navLinks.length === 0) return;

    // Siirtää sliderin valitun linkin kohdalle
    function moveSlider(link) {
        const navRect = navContainer.getBoundingClientRect();
        const linkRect = link.getBoundingClientRect();

        navContainer.style.setProperty(
            "--slider-left",
            `${linkRect.left - navRect.left}px`
        );

        navContainer.style.setProperty(
            "--slider-width",
            `${linkRect.width}px`
        );
    }

    navLinks.forEach(link => {
        link.addEventListener("click", event => {
            event.preventDefault();

            navLinks.forEach(navLink => {
                navLink.classList.remove("active");
            });

            link.classList.add("active");

            // Animoidaan slider uuteen paikkaan
            moveSlider(link);

            // Vaihdetaan sivun sisältö
            switchView(link.id);
        });
    });

    // Asetetaan slider aluksi aktiivisen linkin alle
    const initialLink =
        navContainer.querySelector("a.active") || navLinks[0];

    initialLink.classList.add("active");
    moveSlider(initialLink);

    // Päivitetään sijainti, jos ikkunan koko muuttuu
    window.addEventListener("resize", () => {
        const activeLink = navContainer.querySelector("a.active");
        if (activeLink) moveSlider(activeLink);
    });
}

// ==========================================
// VAIHE 2 & 3: DYNAAMINEN NÄKYMIEN VAIHTO
// ==========================================
function switchView(viewID) {
    const contentArea = document.getElementById("app-content");

    // Varmistetaan, että contentArea-elementti on olemassa sivulla
    if (!contentArea) return;

    // Haetaan tuorein data localStoragesta laskureita ja taulukoita varten
    const data = getAppData();

    if (viewID === "nav-dashboard") {
        // Lasketaan laitteiden tilat dynaamisesti datasta
        const totalDevices = data.devices.length;
        const inUseDevices = data.devices.filter(d => d.status === "Käytössä").length;
        const inStorageDevices = data.devices.filter(d => d.status === "Varastossa").length;
        const inMaintenanceDevices = data.devices.filter(d => d.status === "Huollossa").length;
        
        // Lasketaan lisenssien kokonaismäärät ja vapaat paikat dynaamisesti datasta
        const totalLicenses = data.licenses.reduce((acc, l) => acc + l.total, 0);
        const freeLicenses = data.licenses.reduce((acc, l) => acc + (l.total - l.used), 0);

        // Luodaan dynaaminen HTML-rakenne Bootstrap-korteilla
        contentArea.innerHTML = `
            <h1 class="mb-4">Dashboard</h1>
            <div class="row g-3">
                <!-- IT-Laitteiden kortti -->
                <div class="col-md-4">
                    <div class="card text-white bg-primary h-100 shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title">IT-Laitteet</h5>
                            <p class="display-5 fw-bold mb-1">${totalDevices}</p>
                            <small>Käytössä: ${inUseDevices} | Varastossa: ${inStorageDevices} | Huollossa: ${inMaintenanceDevices}</small>
                        </div>
                    </div>
                </div>
                <!-- Ohjelmistolisenssien kortti -->
                <div class="col-md-4">
                    <div class="card text-white bg-success h-100 shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title">Ohjelmistolisenssit</h5>
                            <p class="display-5 fw-bold mb-1">${totalLicenses}</p>
                            <small>Vapaita lisenssejä jäljellä: <span class="fw-bold text-warning">${freeLicenses}</span> kpl</small>
                        </div>
                    </div>
                </div>
                <!-- Työntekijöiden kortti -->
                <div class="col-md-4">
                    <div class="card text-white bg-dark h-100 shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title">Työntekijät</h5>
                            <p class="display-5 fw-bold mb-1">${data.users.length}</p>
                            <small>Aktiivisia käyttäjiä järjestelmässä</small>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else if (viewID === "nav-devices") {
        // PÄIVITYS (Vaihe 3): Kutsutaan dynaamista tulostusfunktiota pelkän tekstin sijaan
        renderDevicesView(contentArea, data.devices);
    } else if (viewID === "nav-users") {
        contentArea.innerHTML = `
            <h1>Käyttäjät</h1>
            <p>Täällä hallinnoidaan työntekijöitä ja heidän laitteitaan.</p>
        `;
    } else if (viewID === "nav-licenses") {
        contentArea.innerHTML = `
            <h1>Lisenssit</h1>
            <p>Täällä pidetään kirjaa ohjelmistolisensseistä (esim. Office 365, Adobe).</p>
        `;
    }

    // Käynnistetään sisältöanimaatio uudelleen
    contentArea.classList.remove("view-enter");
    void contentArea.offsetWidth;
    contentArea.classList.add("view-enter");
}

// ==========================================
// VAIHE 3: APUFUNKTIOT TULOSTAMISEEN
// ==========================================

// Tulostaa laiteluettelon selkeään Bootstrap-taulukkoon
function renderDevicesView(container, devices) {
    let tableRows = "";
    
    devices.forEach(device => {
        // Määritetään badge-väri laitteen tilan mukaan
        let badgeColor = "bg-secondary";
        if (device.status === "Käytössä") badgeColor = "bg-success";
        if (device.status === "Varastossa") badgeColor = "bg-info text-dark";
        if (device.status === "Huollossa") badgeColor = "bg-danger";

        tableRows += `
            <tr>
                <td><strong>${device.type}</strong></td>
                <td>${device.vendor} ${device.model}</td>
                <td><code class="text-dark">${device.serial}</code></td>
                <td>${device.user}</td>
                <td><span class="badge ${badgeColor}">${device.status}</span></td>
                <td>${device.warrantyEnd}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary py-0 px-2">Muokkaa</button>
                </td>
            </tr>
        `;
    });

    container.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>IT-Laitteet</h1>
            <button class="btn btn-primary" id="btn-add-device">+ Lisää uusi laite</button>
        </div>
        
        <div class="card shadow-sm">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                        <tr>
                            <th>Tyyppi</th>
                            <th>Malli</th>
                            <th>Sarjanumero</th>
                            <th>Käyttäjä</th>
                            <th>Tila</th>
                            <th>Takuu päättyy</th>
                            <th>Toiminnot</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

