document.addEventListener("DOMContentLoaded", () => {
    console.log("IT Asset Management - sovellus käynnistetty!");


    // Alustetaan navigointitoiminnallisuus
    setupNavigation();
});

// Navigaation hallinta
function setupNavigation() {
    const navLinks = document.querySelectorAll("nav-linksa");

    navLinks.forEach(link => {
        link.addEventListener("click", (event) => {
            event.preventDefault(); // Estetään perinteinen sivun uudelleenlataus

            //poistetaan "active" luokka kaikista linkeistä
            navLinks.forEach(1 => 1.classList.remove("active"));{
            })

            // Lisätään "active" luokka klikattuun linkkiin (muuttaa värin siniseksi)
            link.classList.add("active"); 

            // Haetaan klikatun linkin ID (esim "nav-devices")
            const viewID = link.id

            // Vaihdetaan näkymä ID:n  perusteella
            switchView(viewID);
        });
    }

