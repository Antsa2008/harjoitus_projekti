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

            navLinksforEach(link => {
                link.addEventListener
            })