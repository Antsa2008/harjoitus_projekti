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