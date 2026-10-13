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

    // compact header with shadow once the page is scrolled
    const update = () => {
        if (el.isConnected) {
            el.classList.toggle("is-scrolled", window.scrollY > 8);
        } else {
            window.removeEventListener("scroll", update);
        }
    };

    window.addEventListener("scroll", update, { passive: true });
    update();
}
