const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
        const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
        menuToggle.setAttribute("aria-expanded", String(!isOpen));
        menuToggle.setAttribute("aria-label", isOpen ? "Menyuni ochish" : "Menyuni yopish");
        navLinks.classList.toggle("is-open", !isOpen);
    });

    navLinks.addEventListener("click", (event) => {
        if (event.target instanceof HTMLAnchorElement) {
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Menyuni ochish");
            navLinks.classList.remove("is-open");
        }
    });
}

document.querySelectorAll(".current-year").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
});

const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector(".form-status");

if (contactForm && formStatus) {
    const submitButton = contactForm.querySelector('button[type="submit"]');

    contactForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (!(contactForm instanceof HTMLFormElement) || !submitButton) {
            return;
        }

        submitButton.disabled = true;
        formStatus.textContent = "So‘rov yuborilmoqda...";

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(Object.fromEntries(new FormData(contactForm))),
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "So‘rov yuborilmadi. Qayta urinib ko‘ring.");
            }

            formStatus.textContent = result.message;
            contactForm.reset();
        } catch (error) {
            formStatus.textContent = error instanceof Error
                ? error.message
                : "So‘rov yuborilmadi. Qayta urinib ko‘ring.";
        } finally {
            submitButton.disabled = false;
        }
    });
}
