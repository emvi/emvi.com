const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const revealSelector = [
    ".services .grid > li",
    ".technologies .grid > li",
    "section .box > *",
    ".team > div"
].join(",");

let observer = null;

function getObserver() {
    if (!observer) {
        observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    el.classList.add("is-visible");
                    observer.unobserve(el);

                    // hand transitions back to the element's own styles (e.g. hover effects)
                    setTimeout(() => {
                        el.removeAttribute("data-reveal");
                        el.classList.remove("is-visible");
                        el.style.removeProperty("--reveal-delay");
                    }, 1500);
                }
            });
        }, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 });
    }

    return observer;
}

// staggered fade-in of cards and content blocks while scrolling
export function initReveal(root = document) {
    if (reducedMotion.matches || !("IntersectionObserver" in window)) {
        return;
    }

    document.documentElement.classList.add("js-reveal");

    root.querySelectorAll(revealSelector).forEach(el => {
        if (el.dataset.revealReady) {
            return;
        }

        el.dataset.revealReady = "true";
        const siblings = Array.from(el.parentElement.children).filter(child => child.matches(revealSelector));
        const index = Math.max(0, siblings.indexOf(el));
        el.setAttribute("data-reveal", "");
        el.style.setProperty("--reveal-delay", `${Math.min(index, 8) * 0.07}s`);
        getObserver().observe(el);
    });
}

// glow following the pointer on cards
export function initGlow(root = document) {
    root.querySelectorAll(".services .grid > li, .technologies .grid > li").forEach(el => {
        if (el.dataset.glowReady) {
            return;
        }

        el.dataset.glowReady = "true";
        el.addEventListener("pointermove", e => {
            const rect = el.getBoundingClientRect();
            el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
            el.style.setProperty("--my", `${e.clientY - rect.top}px`);
        });
    });
}
