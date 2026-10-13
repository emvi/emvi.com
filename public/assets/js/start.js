const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

export function initStart(el) {
    const arrow = el.querySelector(".arrow");

    if (arrow) {
        arrow.addEventListener("click", () => {
            const next = el.nextElementSibling;

            if (next) {
                next.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth" });
            }
        });
    }

    // subtle parallax for the background image
    const bg = el.querySelector(".start-bg");

    if (!bg || reducedMotion.matches) {
        return;
    }

    let ticking = false;
    const update = () => {
        ticking = false;

        if (!el.isConnected) {
            window.removeEventListener("scroll", onScroll);
            return;
        }

        const y = Math.min(window.scrollY, el.offsetHeight);
        bg.style.transform = `translate3d(0, ${y * 0.3}px, 0)`;
    };
    const onScroll = () => {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(update);
        }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
}
