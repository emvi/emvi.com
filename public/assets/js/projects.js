export function initProjects(root = document) {
    if (typeof window.Glide === "undefined") {
        return;
    }

    root.querySelectorAll(".projects-slides").forEach(container => {
        if (container.dataset.glideReady) {
            return;
        }

        container.dataset.glideReady = "true";
        new window.Glide(container, {
            animationDuration: 900,
            animationTimingFunc: "cubic-bezier(.22, 1, .36, 1)",
            hoverpause: true,
            keyboard: true,
            gap: 24
        }).mount();
    });
}
