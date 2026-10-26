// ==========================================
// MOCK-DATA JA LOCALSTORAGE ALUSTUS
// ==========================================


// Muistetaan, mitä laitetta ollaan muokkaamassa.
// null tarkoittaa uuden laitteen lisäämistä.
let editingDeviceId = null;

// ==========================================
// DATAN HAKU JA TALLENNUS
// ==========================================

function getAppData() {
    if (!localStorage.getItem("devices")) {
        localStorage.setItem("devices", JSON.stringify(initialDevices));
    }

    if (!localStorage.getItem("users")) {
        localStorage.setItem("users", JSON.stringify(initialUsers));
    }

    if (!localStorage.getItem("licenses")) {
        localStorage.setItem("licenses", JSON.stringify(initialLicenses));
    }

    return {
        devices: JSON.parse(localStorage.getItem("devices")),
        users: JSON.parse(localStorage.getItem("users")),
        licenses: JSON.parse(localStorage.getItem("licenses"))
    };
}

function saveAppData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Suojataan HTML-tulostukseen tulevat tekstiarvot.
function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// ==========================================
// SOVELLUKSEN KÄYNNISTYS
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    console.log("IT Asset Management - sovellus käynnistetty!");

    getAppData();
    setupNavigation();
    setupDeviceFormListener();
    setupDeviceButtons();

    switchView("nav-dashboard");
});

// ==========================================
// NAVIGOINTI
// ==========================================

function setupNavigation() {
    const navContainer = document.querySelector(".nav-links");
    const navLinks = document.querySelectorAll(".nav-links a");

    if (!navContainer || navLinks.length === 0) return;

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
            moveSlider(link);
            switchView(link.id);
        });
    });

    const initialLink =
        navContainer.querySelector("a.active") || navLinks[0];

    initialLink.classList.add("active");
    moveSlider(initialLink);

    window.addEventListener("resize", () => {
        const activeLink = navContainer.querySelector("a.active");
        if (activeLink) moveSlider(activeLink);
    });
}

// ==========================================
// NÄKYMIEN VAIHTO
// ==========================================

function switchView(viewID) {
    const contentArea = document.getElementById("app-content");

    if (!contentArea) return;

    const data = getAppData();

    if (viewID === "nav-dashboard") {
        const totalDevices = data.devices.length;

        const inUseDevices = data.devices.filter(
            d => d.status === "Käytössä"
        ).length;

        const inStorageDevices = data.devices.filter(
            d => d.status === "Varastossa"
        ).length;

        const inMaintenanceDevices = data.devices.filter(
            d => d.status === "Huollossa"
        ).length;

        const totalLicenses = data.licenses.reduce(
            (acc, license) => acc + Number(license.total || 0),
            0
        );

        const freeLicenses = data.licenses.reduce(
            (acc, license) =>
                acc + Number(license.total || 0) -
                Number(license.used || 0),
            0
        );

        contentArea.innerHTML = `
            <h1 class="mb-4">Dashboard</h1>

            <div class="row g-3">
                <div class="col-md-4">
                    <div class="card text-white bg-primary h-100 shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title">IT-Laitteet</h5>
                            <p class="display-5 fw-bold mb-1">
                                ${totalDevices}
                            </p>
                            <small>
                                Käytössä: ${inUseDevices} |
                                Varastossa: ${inStorageDevices} |
                                Huollossa: ${inMaintenanceDevices}
                            </small>
                        </div>
                    </div>
                </div>

                <div class="col-md-4">
                    <div class="card text-white bg-success h-100 shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title">Ohjelmistolisenssit</h5>
                            <p class="display-5 fw-bold mb-1">
                                ${totalLicenses}
                            </p>
                            <small>
                                Vapaita lisenssejä jäljellä:
                                <span class="fw-bold text-warning">
                                    ${freeLicenses}
                                </span> kpl
                            </small>
                        </div>
                    </div>
                </div>

                <div class="col-md-4">
                    <div class="card text-white bg-dark h-100 shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title">Työntekijät</h5>
                            <p class="display-5 fw-bold mb-1">
                                ${data.users.length}
                            </p>
                            <small>Aktiivisia käyttäjiä järjestelmässä</small>
                        </div>
                    </div>
                </div>
            </div>
        `;

    } else if (viewID === "nav-devices") {
        renderDevicesView(contentArea, data.devices);

    } else if (viewID === "nav-users") {
        contentArea.innerHTML = `
            <h1>Käyttäjät</h1>
            <p>Täällä hallinnoidaan työntekijöitä ja heidän laitteitaan.</p>
        `;

    } else if (viewID === "nav-licenses") {
        contentArea.innerHTML = `
            <h1>Lisenssit</h1>
            <p>
                Täällä pidetään kirjaa ohjelmistolisensseistä
                (esim. Office 365, Adobe).
            </p>
        `;
    }

    contentArea.classList.remove("view-enter");
    void contentArea.offsetWidth;
    contentArea.classList.add("view-enter");
}

// ==========================================
// LAITELISTAN TULOSTUS
// ==========================================

function renderDevicesView(container, devices) {
   container.innerHTML = `
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
            <h1 class="mb-0">IT-Laitteet</h1> 

            <button
                type="button"
                class="btn btn-primary"
                id="btn-add-device"
                data-bs-toggle="modal"
                data-bs-target="#addDeviceModal">
                + Lisää uusi laite
            </button>
        </div>

        <!-- Haku ja suodattimet -->
        <div class="card shadow-sm mb-4">
            <div class="card-body">
                <div class="row g-3 align-items-end">

                    <div class="col-md-6">
                        <label for="device-search" 
                                class="form-label">
                            Hae laitteita:
                        </label>

                        <input
                            type="search"
                            class="form-control"
                            id="device-search"
                            placeholder="Malli, sarjanumero, käyttäjä..."
                            autocomplete="off">   
                    </div>

                    <div class="col-md-3">
                        <label for="device-type-filter"
                                class="form-label">
                            Laitetyyppi:
                        </label>

                        <select class="form-select"
                                id="device-type-filter">
                            <option value="">Kaikki tyypit</option>
                            <option value="Tietokone">Tietokone</option>
                            <option value="Puhelin">Puhelin</option>
                            <option value="Tabletti">Tabletti</option>
                            <option value="Muu">Muu laite</option>
                        </select>
                    </div>

                    <div class="col-md-3"></div>
                        <label for="device-status-filter"
                                class="form-label">
                            Laitteen tila:
                        </label>

                        <select class="form-select"
                                id="device-status-filter">
                            <option value="">Kaikki tilat</option>
                            <option value="Varastossa">Varastossa</option>
                            <option value="Käytössä">Käytössä</option>
                            <option value="Huollossa">Huollossa</option>
                        </select>
                    </div>

                    <div class="col-12 d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <small id="device-result-count"
                            class="text-muted">
                            aria-live="polite">
                        </small>

                        <button 
                            type="button"
                            class="btn btn-outline-secondary btn-sm"
                            id="btn-reset-filters">
                            Tyhjennä suodattimet
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Laitetaulukko -->
        <div class="card shadow-sm">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light"></thead>
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

                    <tbody id="device-table-body"></tbody>
                </table>
            </div>
        </div>
    `;

    //Näytetään kaikki laitteet näkymän avautuessa
    renderDeviceTableRows(devices);
}   
    
// ==========================================
// JATKA TÄSTÄ TIISTAINA 27.10.2026
// ==========================================
                
      

function setupDeviceButtons() {
    const contentArea = document.getElementById("app-content");

    if (!contentArea) return;

    // Tapahtumankäsittely toimii myös uudelleen luoduille taulukkoriveille.
    contentArea.addEventListener("click", event => {
        const addButton = event.target.closest("#btn-add-device");

        if (addButton) {
            editingDeviceId = null;
            resetDeviceForm();
            setDeviceModalMode(false);
            return;
        }

        const editButton = event.target.closest(".btn-edit-device");

        if (editButton) {
            const deviceId = Number(editButton.dataset.deviceId);
            openEditDeviceModal(deviceId);
        }
    });
}

// ==========================================
// LOMAKKEEN TÄYTTÄMINEN MUOKKAUSTA VARTEN
// ==========================================

function openEditDeviceModal(deviceId) {
    const data = getAppData();

    const device = data.devices.find(
        item => Number(item.id) === deviceId
    );

    if (!device) {
        alert("Laitetta ei löytynyt.");
        return;
    }

    editingDeviceId = device.id;

    // Täytetään lomake valitun laitteen tiedoilla.
    document.getElementById("device-type").value = device.type;
    document.getElementById("device-vendor").value = device.vendor || "";
    document.getElementById("device-model").value = device.model || "";
    document.getElementById("device-serial").value = device.serial || "";

    // Vanhoissa tiedoissa käyttäjä voi olla "Ei käyttäjää".
    document.getElementById("device-user").value =
        device.user === "Ei käyttäjää" ? "" : (device.user || "");

    document.getElementById("device-status").value =
        device.status || "Varastossa";

    document.getElementById("device-purchase").value =
        device.purchaseDate || "";

    document.getElementById("device-warranty").value =
        device.warrantyEnd || "";

    document.getElementById("device-price").value =
        device.price ?? "";

    document.getElementById("device-info").value =
        device.info || "";

    setDeviceModalMode(true);

    // Avataan olemassa oleva Bootstrap-modal.
    const modalElement = document.getElementById("addDeviceModal");

    if (!modalElement || typeof bootstrap === "undefined") {
        alert("Muokkausikkunaa ei voitu avata. Tarkista Bootstrapin lataus.");
        return;
    }

    bootstrap.Modal.getOrCreateInstance(modalElement).show();
}

// ==========================================
// MODALIN OTSIKKO JA TALLENNUSPAINIKE
// ==========================================

function setDeviceModalMode(isEditing) {
    const title = document.getElementById("addDeviceModalLabel");
    const submitButton = document.querySelector(
        "#form-add-device button[type='submit']"
    );

    if (title) {
        title.textContent = isEditing
            ? "Muokkaa IT-laitetta"
            : "Lisää uusi IT-laite";
    }

    if (submitButton) {
        submitButton.textContent = isEditing
            ? "Tallenna muutokset"
            : "Tallenna laite";
    }
}

function resetDeviceForm() {
    const form = document.getElementById("form-add-device");

    if (form) form.reset();
}

// ==========================================
// UUDEN LAITTEEN LISÄÄMINEN JA MUOKKAAMINEN
// ==========================================

function setupDeviceFormListener() {
    const form = document.getElementById("form-add-device");

    if (!form) {
        console.error("Laitteen lisäyslomaketta ei löytynyt.");
        return;
    }

    form.addEventListener("submit", event => {
        event.preventDefault();

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const data = getAppData();

        // Kootaan lomakkeen tiedot yhteen.
        const deviceValues = {
            type: document.getElementById("device-type").value,
            vendor: document.getElementById("device-vendor").value.trim(),
            model: document.getElementById("device-model").value.trim(),
            serial: document.getElementById("device-serial").value.trim(),
            user: document.getElementById("device-user").value.trim()
                || "Ei käyttäjää",
            status: document.getElementById("device-status").value,
            purchaseDate: document.getElementById("device-purchase").value,
            warrantyEnd: document.getElementById("device-warranty").value,
            price: Number(document.getElementById("device-price").value) || 0,
            info: document.getElementById("device-info").value.trim()
        };

        // Sarjanumeron on oltava yksilöllinen.
        // Muokkauksessa sallitaan laitteen oma nykyinen sarjanumero.
        const duplicate = data.devices.some(device =>
            String(device.serial).trim().toLowerCase() ===
                deviceValues.serial.toLowerCase() &&
            Number(device.id) !== Number(editingDeviceId)
        );

        if (duplicate) {
            alert("Tällä sarjanumerolla on jo rekisteröity laite.");
            return;
        }

        if (editingDeviceId !== null) {
            // MUOKKAUS: päivitetään olemassa oleva laite.
            const index = data.devices.findIndex(
                device =>
                    Number(device.id) === Number(editingDeviceId)
            );

            if (index === -1) {
                alert("Muokattavaa laitetta ei löytynyt.");
                return;
            }

            data.devices[index] = {
                ...data.devices[index],
                ...deviceValues
            };

            saveAppData("devices", data.devices);

        } else {
            // LISÄYS: luodaan uusi laite.
            const newDevice = {
                id: Date.now(),
                ...deviceValues
            };

            data.devices.push(newDevice);
            saveAppData("devices", data.devices);
        }

        // Suljetaan ikkuna ja palautetaan lomake alkutilaan.
        const modalElement = document.getElementById("addDeviceModal");

        if (modalElement && typeof bootstrap !== "undefined") {
            bootstrap.Modal.getOrCreateInstance(modalElement).hide();
        }

        form.reset();
        editingDeviceId = null;
        setDeviceModalMode(false);

        // Päivitetään näkyvä näkymä.
        const activeNavLink = document.querySelector(
            ".nav-links a.active"
        );

        if (activeNavLink && activeNavLink.id === "nav-devices") {
            switchView("nav-devices");
        } else {
            switchView("nav-dashboard");
        }
    });
}