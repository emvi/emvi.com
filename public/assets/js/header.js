export function initHeader(el) {
    // language switch using the alternate links in <head>
    el.querySelectorAll(".lang > a").forEach(a => {
        a.addEventListener("click", e => {
            e.preventDefault();

            if (a.classList.contains("active")) {
                return;
            }

            const lang = a.getAttribute("data-lang");
            const target = Array.from(document.querySelectorAll("link[rel='alternate']"))
                .find(link => link.getAttribute("hreflang") === lang);

            if (target) {
                location = target.getAttribute("href").replace(/^emvi.com\//, "");
            }
        });
    });

    // mobile menu
    const toggle = el.querySelector(".toggle");

    if (toggle) {
        toggle.addEventListener("click", () => {
            const open = el.classList.toggle("header--open");
            toggle.setAttribute("aria-expanded", String(open));
        });

        el.querySelectorAll(".nav-item").forEach(a => {
            a.addEventListener("click", () => {
                el.classList.remove("header--open");
                toggle.setAttribute("aria-expanded", "false");
            });
        });
    }

    // compact header with shadow once the page is scrolled
    // dark header switches to light once the dark hero has been scrolled past
    const dark = !el.classList.contains("header--light");
    const bar = el.querySelector(".content");

    const update = () => {
        if (el.isConnected) {
            el.classList.toggle("is-scrolled", window.scrollY > 8);

            if (dark) {
                const hero = document.querySelector(".start");
                const middle = bar ? bar.getBoundingClientRect().top + bar.offsetHeight / 2 : 40;
                el.classList.toggle("header--light", !hero || hero.getBoundingClientRect().bottom < middle);
            }
        } else {
            window.removeEventListener("scroll", update);
        }
    };

    window.addEventListener("scroll", update, { passive: true });
    update();
}
