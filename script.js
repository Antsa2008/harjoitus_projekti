 // ==========================================
 // MOCK-DATA JA LOCALSTORAGE ALUSTUS
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

// ==========================================
// SOVELLUKSEN KÄYNNISTYS
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    console.log("IT Asset Management - sovellus käynnistetty!");

    getAppData();
    setupNavigation();
    setupDeviceFormListener();

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
                acc + Number(license.total || 0) - Number(license.used || 0),
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
    let tableRows = "";

    devices.forEach(device => {
        let badgeColor = "bg-secondary";

        if (device.status === "Käytössä") {
            badgeColor = "bg-success";
        }

        if (device.status === "Varastossa") {
            badgeColor = "bg-info text-dark";
        }

        if (device.status === "Huollossa") {
            badgeColor = "bg-danger";
        }

        tableRows += `
            <tr>
                <td><strong>${device.type}</strong></td>
                <td>${device.vendor} ${device.model}</td>
                <td>
                    <code class="text-dark">${device.serial}</code>
                </td>
                <td>
                    ${device.user || '<span class="text-muted">Ei käyttäjää</span>'}
                </td>
                <td>
                    <span class="badge ${badgeColor}">
                        ${device.status}
                    </span>
                </td>
                <td>${device.warrantyEnd || "-"}</td>
                <td>
                    <button
                        type="button"
                        class="btn btn-sm btn-outline-primary py-0 px-2"
                        disabled
                        title="Muokkaustoimintoa ei ole vielä toteutettu">
                        Muokkaa
                    </button>
                </td>
            </tr>
        `;
    });

    container.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>IT-Laitteet</h1>

            <button
                type="button"
                class="btn btn-primary"
                data-bs-toggle="modal"
                data-bs-target="#addDeviceModal">
                + Lisää uusi laite
            </button>
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
                        ${
                            tableRows ||
                            `<tr>
                                <td colspan="7"
                                    class="text-center text-muted py-4">
                                    Ei laitteita järjestelmässä.
                                </td>
                            </tr>`
                        }
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// ==========================================
// UUDEN LAITTEEN LISÄÄMINEN
// ==========================================

function setupDeviceFormListener() {
    const form = document.getElementById("form-add-device");

    if (!form) {
        console.error("Laitteen lisäyslomaketta ei löytynyt.");
        return;
    }

    form.addEventListener("submit", event => {
        event.preventDefault();

        // Tarkistetaan HTML-lomakkeen required-kentät.
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const data = getAppData();

        const newDevice = {
            id: Date.now(),
            type: document.getElementById("device-type").value,
            vendor: document.getElementById("device-vendor").value.trim(),
            model: document.getElementById("device-model").value.trim(),
            serial: document.getElementById("device-serial").value.trim(),
            user: document.getElementById("device-user").value.trim(),
            status: document.getElementById("device-status").value,
            purchaseDate: document.getElementById("device-purchase").value,
            warrantyEnd: document.getElementById("device-warranty").value,
            price: Number(document.getElementById("device-price").value) || 0,
            info: document.getElementById("device-info").value.trim()
        };

        // Tarkistetaan, ettei sarjanumeroa ole jo käytetty.
        const duplicate = data.devices.some(device =>
            String(device.serial).trim().toLowerCase() ===
            newDevice.serial.toLowerCase()
        );

        if (duplicate) {
            alert("Tällä sarjanumerolla on jo rekisteröity laite.");
            return;
        }

        // Tallennetaan uusi laite.
        data.devices.push(newDevice);
        saveAppData("devices", data.devices);

        // Tyhjennetään lomake.
        form.reset();

        // Suljetaan modal.
        const modalElement = document.getElementById("addDeviceModal");
        const modalInstance = bootstrap.Modal.getInstance(modalElement);

        if (modalInstance) {
            modalInstance.hide();
        }

        // Päivitetään nykyinen näkymä.
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