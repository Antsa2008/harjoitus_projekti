document.addEventListener("DOMContentLoaded", () => {
    console.log("IT Asset Management - sovellus käynnistetty!");

    // Alustetaan navigointitoiminnallisuus
    setupNavigation();
});

// Navigaation hallinta
function setupNavigation() {
    const navLinks = document.querySelectorAll(".nav-links");

    navLinks.forEach(link => {
        link.addEventListener("click", (event) => {
            event.preventDefault();

            // Poistetaan active-luokka kaikista linkeistä
            navLinks.forEach(navLink => {
                navLink.classList.remove("active");
            });

            // Aktivoidaan klikattu linkki
            link.classList.add("active");

            // Haetaan klikatun linkin ID
            const viewID = link.id;

            // Vaihdetaan näkymä ID:n perusteella
            switchView(viewID);
        });
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
}