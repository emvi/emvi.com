const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const glyphs = "emvigo{}<>/=;:.".split("");
const glows = ["rgba(110, 206, 157, .55)", "rgba(80, 220, 160, .35)", "rgba(242, 95, 92, .35)"];

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

    const canvas = el.querySelector(".start-canvas");

    if (canvas) {
        initField(el, canvas);
    }
}

// particle stream of glyphs winding through the hero, with floating labels
function initField(el, canvas) {
    const ctx = canvas.getContext("2d");
    const labels = (canvas.dataset.labels || "").split(",").map(l => l.trim()).filter(Boolean);
    let w = 0, h = 0, dpr = 1, time = 0, last = 0, visible = true, frame = 0;
    let particles = [];

    const streams = [
        { cx: .66, amp: .12, phase: 0, freq: 1.7 },
        { cx: .52, amp: .1, phase: 2.2, freq: 1.3 },
    ];

    const center = (s, t) => ({
        x: w * (s.cx + s.amp * Math.sin(t * Math.PI * s.freq + s.phase + time * .00015)),
        y: h * (-.08 + t * 1.16),
    });

    const spawn = (p, t = Math.random()) => {
        p.s = streams[Math.random() < .62 ? 0 : 1];
        p.t = t;
        p.off = (Math.random() + Math.random() + Math.random() - 1.5) * (w < 700 ? 90 : 140);
        p.v = .00025 + Math.random() * .0005;
        p.dot = Math.random() < .3;
        p.size = p.dot ? 1 + Math.random() * 2.2 : 11 + Math.random() * 4;
        p.ch = glyphs[(Math.random() * glyphs.length) | 0];
        p.a = .15 + Math.random() * .7;
        return p;
    };

    const resize = () => {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = el.offsetWidth;
        h = el.offsetHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const count = Math.round(Math.min(900, w * h / 1400));
        particles = Array.from({ length: count }, () => spawn({}));
        draw();
    };

    const drawLabel = (text, i) => {
        if (!ctx.roundRect) {
            return;
        }

        const s = streams[i % streams.length];
        const t = ((i + 1) / (labels.length + 1) + time * .000012 * (i % 2 ? 1 : -1) + 1) % 1;
        const c = center(s, t);
        const x = c.x + Math.sin(time * .0004 + i * 2) * 40 + (i % 2 ? 60 : -90);
        const y = c.y + Math.cos(time * .0003 + i) * 16;
        const fade = Math.sin(t * Math.PI);

        ctx.font = `500 13px ui-monospace, "SF Mono", Menlo, monospace`;
        const tw = ctx.measureText(text).width;
        const bw = tw + 26, bh = 30;

        ctx.save();
        ctx.globalAlpha = Math.min(1, fade * 1.6);
        ctx.shadowColor = glows[i % glows.length];
        ctx.shadowBlur = 18;
        ctx.fillStyle = "rgba(24, 24, 24, .9)";
        ctx.beginPath();
        ctx.roundRect(x, y, bw, bh, 6);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "rgba(255, 255, 255, .14)";
        ctx.stroke();
        ctx.fillStyle = "rgba(255, 255, 255, .62)";
        ctx.fillText(text, x + 13, y + 19.5);

        // cursor
        ctx.fillStyle = "rgba(255, 255, 255, .35)";
        ctx.beginPath();
        ctx.moveTo(x - 12, y - 14);
        ctx.lineTo(x + 2, y - 8);
        ctx.lineTo(x - 4, y - 5);
        ctx.lineTo(x - 7, y + 1);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    };

    const draw = () => {
        ctx.clearRect(0, 0, w, h);
        ctx.textAlign = "center";
        ctx.font = `13px ui-monospace, "SF Mono", Menlo, monospace`;

        for (const p of particles) {
            const c = center(p.s, p.t);
            const x = c.x + p.off * (1 + .25 * Math.sin(p.t * 9 + p.off));
            const fade = Math.sin(p.t * Math.PI);
            ctx.globalAlpha = p.a * fade;
            ctx.fillStyle = "#fff";

            if (p.dot) {
                ctx.beginPath();
                ctx.arc(x, c.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillText(p.ch, x, c.y);
            }
        }

        ctx.globalAlpha = 1;
        ctx.textAlign = "left";
        labels.forEach(drawLabel);
    };

    const tick = now => {
        frame = 0;

        if (!el.isConnected) {
            window.removeEventListener("resize", resize);
            return;
        }

        const dt = Math.min(48, now - (last || now));
        last = now;
        time += dt;

        for (const p of particles) {
            p.t += p.v * dt * .06;

            if (p.t > 1) {
                spawn(p, 0);
            }

            if (Math.random() < .002) {
                p.ch = glyphs[(Math.random() * glyphs.length) | 0];
            }
        }

        draw();

        if (visible) {
            frame = requestAnimationFrame(tick);
        }
    };

    resize();
    window.addEventListener("resize", resize);

    if (reducedMotion.matches) {
        return;
    }

    new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;

        if (visible && !frame) {
            last = 0;
            frame = requestAnimationFrame(tick);
        }
    }).observe(el);
}
