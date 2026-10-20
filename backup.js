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

    // Alustetaan navigointitoiminnallisuus
    setupNavigation();
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
// Funktio, joka vaihtaa näkymän sisällön ID:n perusteella

function switchView(viewID) {
    const contentArea = document.getElementById("app-content");

    // Varmistetaan, että contentArea-elementti on olemassa sivulla
    if (!contentArea) return;

    if (viewID === "nav-dashboard") {
        contentArea.innerHTML = `
            <h1>Dashboard</h1>
            <p>Tähän tulee yhteenveto laitteista, käyttäjistä ja lisensseistä.</p>
        `;
    } else if (viewID === "nav-devices") {
        contentArea.innerHTML = `
            <h1>Laitteet</h1>
            <p>Täällä voit hallinnoida yrityksen tietokoneita ja puhelimia.</p>
        `;
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