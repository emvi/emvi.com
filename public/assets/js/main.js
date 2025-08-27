(function() {
    document.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll(".projects-slides").forEach(container => {
            new Glide(container, {
                animationDuration: 800,
                hoverpause: false,
                keyboard: true,
                gap: 0
            }).mount();
        });
    });
})();
