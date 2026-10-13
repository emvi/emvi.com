import { initHeader } from "./header.js";
import { initStart } from "./start.js";
import { initProjects } from "./projects.js";
import { initReveal, initGlow } from "./effects.js";

const components = {
    header: initHeader,
    start: initStart,
};

function init(root = document) {
    root.querySelectorAll("[data-component]").forEach(el => {
        if (el.dataset.componentReady) {
            return;
        }

        const fn = components[el.dataset.component];

        if (fn) {
            fn(el);
            el.dataset.componentReady = "true";
        }
    });

    initProjects(root);
    initGlow(root);
    initReveal(root);
}

document.addEventListener("DOMContentLoaded", () => {
    init();

    // the admin UI swaps element HTML in place after edits
    let pending = false;
    new MutationObserver(() => {
        if (!pending) {
            pending = true;
            requestAnimationFrame(() => {
                pending = false;
                init();
            });
        }
    }).observe(document.body, { childList: true, subtree: true });
});
