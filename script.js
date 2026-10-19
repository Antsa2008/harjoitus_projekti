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

