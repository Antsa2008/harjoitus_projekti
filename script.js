// ==========================================
// MOCK-DATA JA LOCALSTORAGE ALUSTUS
// ==========================================


// Muistetaan, mitä laitetta ollaan muokkaamassa.
// null tarkoittaa uuden laitteen lisäämistä.
let editingDeviceId = null;
let editingUserId = null;

let editingLicensesId = null;
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

    setupUserFormListener();
    setupUserButtons();

    setupLicenseFormListener();
    setupLicenseButtons();

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

        // Näytetään seuraavan 30 päivän aikana erääntyvät lisensit.
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const reminderLimit = new Date(today);
        reminderLimit.setDate(reminderLimit.getDate() + 30);

        const upcomingRenewals = data.licenses
            .filter(license => {
                if (!license.renewalDate) return false;

                const date = new Date(`${license.renewalDate}T00:00:00`);

                return  (
                    !Number.isNaN(date.getTime()) &&
                    date >= today &&
                    date <= reminderLimit
                );

            })
            .sort((a, b) =>
                a.renewalDate.localeCompare(b.renewalDate)
            );

        // Laitteet, joiden takuu pättyy seuraavan 30 päivän aikana.
        const upcomingWarranties = data.devices
            .filter(device => {
                if (!device.warrantyEnd) return false;

                const date = new Date(`${device.warrantyEnd}T00:00:00`);

                return (
                    !Number.isNaN(date.getTime()) &&
                    date >= today &&
                    date <= reminderLimit
                );
            })
            .sort((a, b) =>
                a.warrantyEnd.localeCompare(b.warrantyEnd)
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
            <div class="row g-3 mt-2">
                <div class="col-md-6">
                    <div class="card shadow-sm h-100">
                        <div class="card-header bg-light">
                            <h2 class="h5 mb-0">Lähestyvät takuun päättymiset</h2>
                        </div>
                        <div class="card-body">
                            ${
                                upcomingWarranties.length === 0
                                    ? '<p class="text-muted mb-0">Ei lähestyviä takuun päättymisiä seuraavan 30 päivän aikana.</p>'
                                    : `
                                        <ul class="list-group lst-group-flush">
                                            ${upcomingWarranties.map(device => `
                                                <li class="list-group-item px-o">
                                                    <strong>${escapeHtml(device.vendor)}
            ${escapeHtml(device.model)}</strong>
                                                    <br>
                                                    <small class="text-muted">
                                                        Sarjanumero:
            ${escapeHtml(device.serial)}
                                                        · Takuu päättyy:
            ${escapeHtml(device.warrantyEnd)} 
                                                    </small>
                                                </li>
                                            `)}.join("")}
                                        </ul>
                                    `
                                    
                            }
                        </div>
                    </div>
                </div>

                <div class="col-md-6">
                    <div class="card shadow-sm h-100">
                        <div class="card-header bg-light">
                            <h2 class="h5 mb-0">Lähestyvät lisenssien uusimiset</h2>
                        </div>
                        <div class="card-body">
                            ${
                                upcomingRenewals-length === 0
                                    ? '<p class="text-muted mb-0">Ei lähestyviä lisenssien uusimisia seuraavan 30 päivän aikana</p>'
                                    : `
                                        <ul class="list-group list-group-flush">
                                            ${upcomingRenewals.map(license => `)}
                                                < class="list-group-item px-0">
                                                    <strong>${escapeHtml(license.name)}
            </strong>
                                                    <br>
                                                    <small class="text-muted">
                                                        Uusimispäivä:
            ${escapeHtml(license.renewalDate)}
                                                    </small>
                                                </li>
                                            `).join("")}
                                        </ul>
                                    `
                            }
                        </div>
                    </div>
                </div>
            </div>
            
        `;

    } else if (viewID === "nav-devices") {
        renderDevicesView(contentArea, data.devices);

    } else if (viewID === "nav-users") {
        renderUsersView(contentArea, data.users);

    } else if (viewID === "nav-licenses") {
        renderLicensesView(contentArea, data.licenses);
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

                    <div class="col-md-3">
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
                            class="text-muted"
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

                    <tbody id="device-table-body"></tbody>
                </table>
            </div>
        </div>
    `;

    //Näytetään kaikki laitteet näkymän avautuessa
    renderDeviceTableRows(devices);
}   
  

/* Tulostaa laitteet taulukkoon. */
function renderDeviceTableRows(devices) {
    const tbody = document.getElementById("device-table-body");

    if (!tbody) return;

    const countElement = document.getElementById(
        "device-result-count"
    );

    const alldevices = getAppData().devices;

    if (countElement) {
        countElement.textContent =
            `Näytetään ${devices.length} / ${alldevices.length} laitetta.`;
    }

    if (devices.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7"
                    class="text-center text-muted py-4">
                    Hakuehdoilla ei löytynyt laitteita.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = devices.map(device => {
        let badgeColor = "bg-secondary";

        if (device.status === "Käytössä") {
            badgeColor = "bg-success";
        } else if (device.status === "Varastossa") {
            badgeColor = "bg-info text-dark";
        } else if (device.status === "Huollossa") {
            badgeColor = "bg-danger";
        }

        return `
            <tr>
                <td>
                    <strong>${escapeHtml(device.type)}</strong>
                </td>

                <td>
                    ${escapeHtml(device.vendor)}
                    ${escapeHtml(device.model)}
                </td>

                <td>
                    <code class="text-dark">
                        ${escapeHtml(device.serial)}
                    </code>
                </td>

                <td>
                    ${device.user
                        ? escapeHtml(device.user)
                        : '<span class="text-muted">Ei käyttäjää</span>'}
                </td>

                <td>
                    <span class="badge ${badgeColor}">
                        ${escapeHtml(device.status)}
                    </span>
                </td>

                <td>
                    ${escapeHtml(device.warrantyEnd || "-")}
                </td>

                <td>
                    <div class="d-flex gap-2">
                        <button
                            type="button"
                            class="btn btn-sm btn-outline-primary py-0 px-2 btn-edit-device"
                            data-device-id="${escapeHtml(device.id)}">
                            Muokkaa
                        </button>

                        <button
                            type="button"
                            class="btn btn-sm btn-outline-danger py-0 px-2 btn-delete-device"
                            data-device-id="${escapeHtml(device.id)}">
                            Poista
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}

/* Suodattaa laitteet hakutekstin ja valintojen perusteella. */

function filterDevices() {
    const searchInput = document.getElementById("device-search");
    const typeFilter = document.getElementById("device-type-filter");
    const statusFilter = document.getElementById("device-status-filter");

    if (!searchInput || !typeFilter || !statusFilter) return;

    const searchTerm = searchInput.value.trim().toLocaleLowerCase("fi");
    const selectedType = typeFilter.value;
    const selectedStatus = statusFilter.value;

    const allDevices = getAppData().devices;

    const filteredDevices = allDevices.filter(device => {   
        // Haetaan useasta kentästä yhdellä hakusanalla.
        const searchableText = [
            device.type,
            device.vendor,
            device.model,
            device.serial,
            device.user
        ]
            .map(value => String(value ?? ""))
            .join(" ")
            .toLocaleLowerCase("fi");

        const matchesSearch = 
            searchableText.includes(searchTerm);

        const matchesType = 
            !selectedType || device.type === selectedType;

        const matchesStatus = 
            !selectedStatus || device.status === selectedStatus;

        return matchesSearch && matchesType && matchesStatus;
    });

    renderDeviceTableRows(filteredDevices);
}

function setupDeviceButtons() {
    const contentArea = document.getElementById("app-content");

    if (!contentArea) return;

    contentArea.addEventListener("click", event => {
        const addButton = event.target.closest("#btn-add-device");

        if (addButton) {
            editingDeviceId = null;
            resetDeviceForm();
            setDeviceModalMode(false);
            return;
        }
        
        // Laitteen muokkaus
        const editButton = event.target.closest(".btn-edit-device");

        if (editButton) {
            const deviceId = Number(editButton.dataset.deviceId);
            openEditDeviceModal(deviceId);
        }

        // Laitteen poisto
        const deleteButton = event.target.closest(".btn-delete-device");

        if (deleteButton) {
            const deviceId = Number(deleteButton.dataset.deviceId);
            const data = getAppData();

            const device = data.devices.find(
                item => Number(item.id) === deviceId
            );

            if (!device) {
                alert("Poistettavaa laitetta ei löytynyt.");
                return;
            }

            const confirmed = confirm(
                `Haluatko varmasti poistaa laitteen: ${device.vendor} ${device.model} (${device.serial})?`
            );
            if (!confirmed) return;


                const updatedDevices = data.devices.filter(
                    item => Number(item.id) !== deviceId
                );

                saveAppData("devices", updatedDevices);

                // Päivitetään laitetaulukko heti.
                filterDevices();
                return;
        }
    });

    // Hakutekstin muuttuminen
    contentArea.addEventListener("input", event => {
        if (event.target.id === "device-search") {
            filterDevices();
        }
    });

    // Suodatinvalintojen muuttuminen
    contentArea.addEventListener("change", event => {
        if (
            event.target.id === "device-type-filter" ||
            event.target.id === "device-status-filter"
        ) {
            filterDevices();
        }
    });

    // Suodattimien tyhjentäminen
    contentArea.addEventListener("click", event => {
        const clearButton = event.target.closest("#btn-reset-filters");

        if (!clearButton) return;

        const searchInput = document.getElementById("device-search");
        const typeFilter = document.getElementById("device-type-filter");
        const statusFilter = document.getElementById("device-status-filter");

        if (searchInput) searchInput.value = "";
        if (typeFilter) typeFilter.value = "";
        if (statusFilter) statusFilter.value = "";

        filterDevices();
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

// ==========================================
// KÄYTTÄJIEN HALLINTA
// ==========================================
function renderUsersView(container, users) {
    container.innerHTML = `
        <div class="d-flex justify-content-between
                    align-items-center flex-wrap gap-3 mb-4">

            <h1 class="mb-0">Käyttäjät</h1>

            <button type="button"
                    class="btn btn-primary"
                    id="btn-add-user"
                    data-bs-toggle="modal"
                    data-bs-target="#userModal">
                + Lisää käyttäjä
            </button>
        </div>

        <div class="card shadow-sm mb-4">
            <div class="card-body">

                <label for="user-search" class="form-label">
                    Hae käyttäjiä
                </label>

                <input type="search"
                       class="form-control"
                       id="user-search"
                       placeholder="Nimi, sähköposti, osasto tai tehtävä..."
                       autocomplete="off">

                <small id="user-result-count"
                       class="text-muted d-block mt-3"
                       aria-live="polite"></small>
            </div>
        </div>

        <div class="card shadow-sm">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">

                    <thead class="table-light">
                        <tr>
                            <th>Nimi</th>
                            <th>Sähköposti</th>
                            <th>Osasto</th>
                            <th>Tehtävänimike</th>
                            <th>Laitteita</th>
                            <th>Toiminnot</th>
                        </tr>
                    </thead>

                    <tbody id="user-table-body"></tbody>

                </table>
            </div>
        </div>
    `;

    renderUserTableRows(users);
}


// ------------------------------------------
// KÄYTTÄJIEN TAULUKKO
// ------------------------------------------

function renderUserTableRows(users) {
    const tbody = document.getElementById("user-table-body");

    if (!tbody) return;

    const allUsers = getAppData().users;
    const countElement = document.getElementById("user-result-count");

    if (countElement) {
        countElement.textContent =
            `Näytetään ${users.length} / ${allUsers.length} käyttäjää.`;
    }

    if (users.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-4">
                    Käyttäjiä ei löytynyt.
                </td>
            </tr>
        `;
        return;
    }

    const devices = getAppData().devices;

    tbody.innerHTML = users.map(user => {
        // Nykyiset laitteet yhdistetään käyttäjään nimen perusteella.
        const assignedDevices = devices.filter(device =>
            device.user &&
            String(device.user).trim().toLocaleLowerCase("fi") ===
            String(user.name ?? "").trim().toLocaleLowerCase("fi")
        );

        return `
            <tr>
                <td>
                    <strong>${escapeHtml(user.name)}</strong>
                </td>

                <td>
                    <a href="mailto:${escapeHtml(user.email)}">
                        ${escapeHtml(user.email)}
                    </a>
                </td>

                <td>${escapeHtml(user.department)}</td>

                <td>${escapeHtml(user.role)}</td>

                <td>
                    <span class="badge bg-secondary">
                        ${assignedDevices.length}
                    </span>
                </td>

                <td>
                    <div class="d-flex gap-2">
                        <button type="button"
                                class="btn btn-sm btn-outline-primary
                                       btn-edit-user"
                                data-user-id="${escapeHtml(user.id)}">
                            Muokkaa
                        </button>

                        <button type="button"
                                class="btn btn-sm btn-outline-danger
                                       btn-delete-user"
                                data-user-id="${escapeHtml(user.id)}">
                            Poista
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}


// ------------------------------------------
// KÄYTTÄJIEN HAKU
// ------------------------------------------

function filterUsers() {
    const searchInput = document.getElementById("user-search");

    if (!searchInput) return;

    const searchTerm =
        searchInput.value.trim().toLocaleLowerCase("fi");

    const users = getAppData().users;

    const filteredUsers = users.filter(user => {
        const searchableText = [
            user.name,
            user.email,
            user.department,
            user.role
        ]
            .map(value => String(value ?? ""))
            .join(" ")
            .toLocaleLowerCase("fi");

        return searchableText.includes(searchTerm);
    });

    renderUserTableRows(filteredUsers);
}


// ------------------------------------------
// KÄYTTÄJIEN PAINIKKEET JA HAKU
// ------------------------------------------

function setupUserButtons() {
    const contentArea = document.getElementById("app-content");

    if (!contentArea) return;

    contentArea.addEventListener("click", event => {

        // Uusi käyttäjä
        const addButton = event.target.closest("#btn-add-user");

        if (addButton) {
            editingUserId = null;
            resetUserForm();
            setUserModalMode(false);
            return;
        }

        // Käyttäjän muokkaus
        const editButton = event.target.closest(".btn-edit-user");

        if (editButton) {
            openEditUserModal(Number(editButton.dataset.userId));
            return;
        }

        // Käyttäjän poisto
        const deleteButton = event.target.closest(".btn-delete-user");

        if (deleteButton) {
            deleteUser(Number(deleteButton.dataset.userId));
        }
    });

    // Hakutekstin muuttuminen
    contentArea.addEventListener("input", event => {
        if (event.target.id === "user-search") {
            filterUsers();
        }
    });
}


// ------------------------------------------
// KÄYTTÄJÄN POISTAMINEN
// ------------------------------------------

function deleteUser(userId) {
    const data = getAppData();

    const user = data.users.find(
        item => Number(item.id) === userId
    );

    if (!user) {
        alert("Poistettavaa käyttäjää ei löytynyt.");
        return;
    }

    // Estetään poistaminen, jos käyttäjällä on laitteita.
    const assignedDevices = data.devices.filter(device =>
        device.user &&
        String(device.user).trim().toLocaleLowerCase("fi") ===
        String(user.name ?? "").trim().toLocaleLowerCase("fi")
    );

    if (assignedDevices.length > 0) {
        alert(
            `Käyttäjää ei voi poistaa, koska hänellä on ` +
            `${assignedDevices.length} laitetta liitettynä.\n\n` +
            `Siirrä laitteet ensin toiselle käyttäjälle tai poista ` +
            `niiden käyttäjämerkintä.`
        );
        return;
    }

    const confirmed = confirm(
        `Haluatko varmasti poistaa käyttäjän ${user.name}?`
    );

    if (!confirmed) return;

    const updatedUsers = data.users.filter(
        item => Number(item.id) !== userId
    );

    saveAppData("users", updatedUsers);

    // Päivitetään käyttäjälista heti.
    filterUsers();
}


// ------------------------------------------
// KÄYTTÄJÄN MUOKKAUS
// ------------------------------------------

function openEditUserModal(userId) {
    const users = getAppData().users;

    const user = users.find(
        item => Number(item.id) === userId
    );

    if (!user) {
        alert("Käyttäjää ei löytynyt.");
        return;
    }

    editingUserId = user.id;

    document.getElementById("user-name").value =
        user.name || "";

    document.getElementById("user-email").value =
        user.email || "";

    document.getElementById("user-department").value =
        user.department || "";

    document.getElementById("user-role").value =
        user.role || "";

    setUserModalMode(true);

    const modalElement = document.getElementById("userModal");

    if (!modalElement || typeof bootstrap === "undefined") {
        alert("Käyttäjän muokkausikkunaa ei voitu avata.");
        return;
    }

    bootstrap.Modal.getOrCreateInstance(modalElement).show();
}


// ------------------------------------------
// MODALIN OTSIKKO JA LOMAKKEEN TYHJENNYS
// ------------------------------------------

function setUserModalMode(isEditing) {
    const title = document.getElementById("userModalLabel");

    const submitButton = document.querySelector(
        "#form-user button[type='submit']"
    );

    if (title) {
        title.textContent = isEditing
            ? "Muokkaa käyttäjää"
            : "Lisää uusi käyttäjä";
    }

    if (submitButton) {
        submitButton.textContent = isEditing
            ? "Tallenna muutokset"
            : "Tallenna käyttäjä";
    }
}


function resetUserForm() {
    const form = document.getElementById("form-user");

    if (form) form.reset();
}


// ------------------------------------------
// KÄYTTÄJÄN LISÄYS JA MUOKKAUS
// ------------------------------------------

function setupUserFormListener() {
    const form = document.getElementById("form-user");

    if (!form) {
        console.error("Käyttäjälomaketta ei löytynyt.");
        return;
    }

    form.addEventListener("submit", event => {
        event.preventDefault();

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const data = getAppData();

        const userValues = {
            name: document.getElementById("user-name").value.trim(),
            email: document.getElementById("user-email").value.trim(),
            department: document.getElementById("user-department").value.trim(),
            role: document.getElementById("user-role").value.trim()
        };

        // Sähköpostiosoitteen on oltava yksilöllinen.
        const duplicateEmail = data.users.some(user =>
            String(user.email ?? "").trim().toLowerCase() ===
                userValues.email.toLowerCase() &&
            Number(user.id) !== Number(editingUserId)
        );

        if (duplicateEmail) {
            alert("Tällä sähköpostiosoitteella on jo käyttäjä.");
            return;
        }

        // Nimen on oltava yksilöllinen, koska nykyiset laitteet
        // yhdistetään käyttäjiin nimen perusteella.
        const duplicateName = data.users.some(user =>
            String(user.name ?? "").trim().toLocaleLowerCase("fi") ===
                userValues.name.toLocaleLowerCase("fi") &&
            Number(user.id) !== Number(editingUserId)
        );

        if (duplicateName) {
            alert("Tällä nimellä on jo rekisteröity käyttäjä.");
            return;
        }

        if (editingUserId !== null) {
            // Päivitetään olemassa oleva käyttäjä.
            const index = data.users.findIndex(
                user => Number(user.id) === Number(editingUserId)
            );

            if (index === -1) {
                alert("Muokattavaa käyttäjää ei löytynyt.");
                return;
            }

            const oldName = data.users[index].name;

            // Jos nimi muuttuu, päivitetään myös laitteiden
            // käyttäjämerkinnät, jotta yhteys säilyy.
            data.devices = data.devices.map(device => {
                if (
                    device.user &&
                    String(device.user).trim().toLocaleLowerCase("fi") ===
                    String(oldName ?? "").trim().toLocaleLowerCase("fi")
                ) {
                    return {
                        ...device,
                        user: userValues.name
                    };
                }

                return device;
            });

            data.users[index] = {
                ...data.users[index],
                ...userValues
            };

            saveAppData("devices", data.devices);
            saveAppData("users", data.users);

        } else {
            // Luodaan uusi käyttäjä.
            const newUser = {
                id: Date.now(),
                ...userValues
            };

            data.users.push(newUser);
            saveAppData("users", data.users);
        }

        // Suljetaan modal ja palautetaan lomake alkutilaan.
        const modalElement = document.getElementById("userModal");

        if (modalElement && typeof bootstrap !== "undefined") {
            bootstrap.Modal.getOrCreateInstance(modalElement).hide();
        }

        form.reset();

        editingUserId = null;
        setUserModalMode(false);

        // Päivitetään aktiivinen näkymä.
        const activeNavLink = document.querySelector(
            ".nav-links a.active"
        );

        if (activeNavLink && activeNavLink.id === "nav-users") {
            switchView("nav-users");
        } else {
            switchView("nav-dashboard");
        }
    });
}

/* ==========================================
   OHJELMISTOLISENSSIEN HALLINTA
   ========================================== */

   function renderLicensesView(container, licenses) {
    container.innerHTML = `
        <div class="d-flex justify-content-between
                    align-items-center flex-wrap gap-3 mb-4">

            <h1 class="mb-0">Ohjelmistolisenssit</h1>

            <button type="button"
                    class="btn btn-primary"
                    id="btn-add-license"
                    data-bs-toggle="modal"
                    data-bs-target="#licenseModal">
                + Lisää lisenssi
            </button>
        </div>

        <div class="row g-3 mb-4" id="license-summary"></div>

        <div class="card shadow-sm">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                        <tr>
                            <th>Ohjelmisto</th>
                            <th>Toimittaja</th>
                            <th>Lisenssejä</th>
                            <th>Käytössä</th>
                            <th>Vapaana</th>
                            <th>Uusimispäivä</th>
                            <th>Kustannus</th>
                            <th>Toiminnot</th>
                        </tr>
                    </thead>
                    <tbody id="license-table-body"></tbody>
                </table>
            </div>
        </div>
    `;

    renderLicenseTableRows(licenses);
}

    function renderLicenseTableRows(licenses) {
        const tbody = document.getElementById("license-table-body");

        if (!tbody) return;

        if (licenses.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center text-muted py-4">
                        Lisenssejä ei löytynyt.
                    </td>
                </tr>
            `;
            return;
        }

    tbody.innerHTML = licenses.map(license => {
        const total = Number(license.total || 0);
        const used = Number(license.used || 0);
        const free = total - used; 

        return `
            <tr>
                <td><strong>${escapeHtml(license.name)}</strong></td>
                <td>${escapeHtml(license.vendor || "-")}</td>
                <td>${total}</td>
                <td>${used}</td>
                <td>
                    <span class>"badge ${free > 0 ? "bg-succes" : "bg-danger"}>
                        ${free}
                    </span>
                </td>
                <td>${escapeHtml(license.renewalDate || "-")}</td>
                <td>${Number(license.cost || 0).toLocaleString("fi-FI", {
                    style: "currency",
                    currency: "EUR"
                })}</td>
                <td>
                    <div class="d-flex gap-2">
                        <button>
                            type="button"
                            class="btn btn-sm btn-outline-primary btn-edit-license"
                            data-license-id="${escapeHtml(license.id)}">
                            Muokkaa
                        </button>

                        <button>
                            type="button"
                            class="btn btn-sm btn-outline-danger btn-delete-license"
                            data-license-id="${escapeHtml(license.id)}">
                            Poista
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}

// Lisenssitaulukon päivitys
function setupLicenseButtons() {
    const contentArea = document.getElementById("app-content");
    if (!contentArea) return;

    contentArea.addEventListener("click", event => {
        const addButton = event.target.closest("#btn-add-license");

        if (addButton) {
            editingLicensesId = null;
            resetLicenseForm();
            setLicenseModalMode(false);
            return;
        }

        const editButton = event.target.closest(".btn-edit-license");

        if (editButton) {
            openEditLicenseModal(Number(editButton.dataset.licenseId));
            return;
        }

        const deleteButton = event.target.closest(".btn-delete-license");

        if (deleteButton) {
            deleteLicense(Number(deleteButton.dataset.licenseId));
        }
    });
}

// Lomakkeen tyhjennys
function resetLicenseForm() {
    const form = document.getElementById("form-license");
    if (form) form.reset();

    const totalInput = document.getElementById("license-total");
    const usedInput = document.getElementById("license-used");

    if (totalInput) totalInput.value = "1";
    if (usedInput) usedInput.value = "0";
}

// Modalin otsikko ja tallennuspainike
function setLicenseModalMode(isEditing) {
    const title = document.getElementById("licenseModalLabel");
    const submitButton = document.querySelector(
        "#form-license button[type='submit']"
    );

    if (title) {
        title.textContent = isEditing
            ? "Muokkaa ohjelmistolisenssiä"
            : "Lisää ohjelmistolisenssi";
    }

    if (submitButton) {
        submitButton.textContent = isEditing
            ? "Tallenna muutokset"
            : "Tallenna lisenssi";
    }
}

// Lisenssin muokkauslomakkeen avaaminen
function openEditLicenseModal(licenseId) {
    const licenses = getAppData().licenses;

    const license = licenses.find(
        item => Number(item.id) === licenseId
    );

    if (!license) {
        alert("Muokattavaa lisenssiä ei löytynyt.");
        return;
    }

    editingLicensesId = license.id;

    document.getElementById("license-name").value =
        license.name || "";
    document.getElementById("license-vendor").value =
        license.vendor || "";
    document.getElementById("license-total").value =
        license.total ?? 1;
    document.getElementById("license-used").value =
        license.used ?? 0;
    document.getElementById("license-renewal").value =
        license.renewalDate || "";
    document.getElementById("license-cost").value =
        license.cost ?? "";

    setLicenseModalMode(true);

    const modalElement = document.getElementById("licenseModal");

    if (!modalElement || typeof bootstrap === "undefined") {
        alert("Lisenssin muokkausikkunaa ei voitu avata.");
        return;
    }

    bootstrap.Modal.getOrCreateInstance(modalElement).show();
}

// Lisenssin poistaminen
function deleteLicense(licenseId) {
    const data = getAppData();

    const license = data.licenses.find(
        item => Number(item.id) === licenseId
    );

    if (!license) {
        alert("Poistettavaa lisenssiä ei löytynyt.");
        return;
    }

    if (!confirm(`Haluatko varmasti poistaa lisenssin ${license.name}?`)) {
        return;
    }

    data.licenses = data.licenses.filter(
        item => Number(item.id) !== licenseId
    );

    saveAppData("licenses", data.licenses);

    switchView("nav-licenses");
}

// Lisenssin lisääminen ja muokkaaminen
function setupLicenseFormListener() {
    const form = document.getElementById("form-license");
    if (!form) {
        console.error("Lisenssilomaketta ei löytynyt.");
        return;
    }

    form.addEventListener("submit", event => {
        event.preventDefault();

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const data = getAppData();

        const total = Number(
            document.getElementById("license-total").value
        );
        const used = Number(
            document.getElementById("license-used").value
        );

        if (!Number.isInteger(total) || total < 1) {
            alert("Lisenssien kokonaismäärän on oltava vähintään 1.");
            return;
        }

        if (!Number.isInteger(used) || used < 0) {
            alert("Käytössä olevien lisenssien määrän on oltava vähintään 0.");
            return;
        }

        if (used > total) {
            alert("Käytössä olevien lisenssien määrä ei voi ylittää kokonaismäärää.");
            return;
        }

        const costValue = document.getElementById("license-cost").value;
        const cost = costValue === "" ? 0 : Number(costValue);

        if (!Number.isFinite(cost) || cost < 0) {
            alert("Kustannuksen on oltava kelvollinen, nollaa suurempi tai nolla.");
            return;
        }

        const licenseValues = {
            name: document.getElementById("license-name").value.trim(),
            vendor: document.getElementById("license-vendor").value.trim(),
            total,
            used,
            renewalDate: document.getElementById("license-renewal").value,
            cost
        };

        if (editingLicensesId !== null) {
            const index = data.licenses.findIndex(
                item => Number(item.id) === Number(editingLicensesId)
            );

            if (index === -1) {
                alert("Muokattavaa lisenssiä ei löytynyt.");
                return;
            }

            data.licenses[index] = {
                ...data.licenses[index],
                ...licenseValues
            };
        } else {
            data.licenses.push({
                id: Date.now(),
                ...licenseValues
            });
        }

        saveAppData("licenses", data.licenses);

        const modalElement = document.getElementById("licenseModal");

        if (modalElement && typeof bootstrap !== "undefined") {
            bootstrap.Modal.getOrCreateInstance(modalElement).hide();
        }

        resetLicenseForm();
        editingLicensesId = null;
        setLicenseModalMode(false);

        const activeNavLink = document.querySelector(
            ".nav-links a.active"
        );

        if (activeNavLink && activeNavLink.id === "nav-licenses") {
            switchView("nav-licenses");
        } else {
            switchView("nav-dashboard");
        }
    });
}
