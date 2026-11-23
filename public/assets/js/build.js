const glyphs = "<>/{}=;:.#*abcdefhimnoprstuv".split("");
const font = `13px ui-monospace, "SF Mono", Menlo, monospace`;
const blue = "74, 92, 255";

// wireframe of a website, coordinates relative to the frame
const layout = [
    { x: 0, y: 0, w: 1, h: 1, label: "<html>", kind: "frame" },
    { x: .05, y: .13, w: .9, h: .07, label: "<nav>", kind: "box" },
    { x: .05, y: .27, w: .52, h: .14, label: "<h1>", kind: "text" },
    { x: .05, y: .45, w: .18, h: .06, label: "<button>", kind: "button" },
    { x: .65, y: .27, w: .3, h: .24, label: "<img>", kind: "image" },
    { x: .05, y: .6, w: .28, h: .32, label: "<article>", kind: "box" },
    { x: .36, y: .6, w: .28, h: .32, label: "<article>", kind: "box" },
    { x: .67, y: .6, w: .28, h: .32, label: "<article>", kind: "box" },
];

const STEP = 700;
const FLIGHT = 1300;
const HOLD = 3500;
const DISSOLVE = 1400;

const rand = (a, b) => a + Math.random() * (b - a);
const easeOut = t => 1 - Math.pow(1 - t, 3);
const easeIn = t => t * t * t;
const clamp = t => Math.max(0, Math.min(1, t));
const glyph = () => glyphs[(Math.random() * glyphs.length) | 0];

// particles assemble a website wireframe block by block, then dissolve and start over
export function initBuild(el, canvas, reducedMotion) {
    const ctx = canvas.getContext("2d");
    let w = 0, h = 0, frame = null, blocks = [], ambient = [];
    let clock = 0, last = 0, raf = 0, visible = true;
    const buildEnd = (layout.length - 1) * STEP + FLIGHT;
    const cycle = buildEnd + HOLD + DISSOLVE;

    const targets = (b, r) => {
        const points = [];
        const push = (x, y, text) => points.push({ x, y, text });

        if (b.kind === "text") {
            for (let y = r.y + 10; y < r.y + r.h; y += 16) {
                const end = r.x + r.w * rand(.55, 1);

                for (let x = r.x; x < end; x += 9) {
                    push(x, y, true);
                }
            }

            return points;
        }

        const step = 11;

        for (let x = r.x; x <= r.x + r.w; x += step) {
            push(x, r.y);
            push(x, r.y + r.h);
        }

        for (let y = r.y + step; y < r.y + r.h; y += step) {
            push(r.x, y);
            push(r.x + r.w, y);
        }

        if (b.kind === "image") {
            for (let t = .1; t < .95; t += .07) {
                push(r.x + r.w * t, r.y + r.h * t);
                push(r.x + r.w * t, r.y + r.h * (1 - t));
            }
        }

        if (b.kind === "box" && r.h > 60) {
            for (let y = r.y + r.h * .55; y < r.y + r.h - 10; y += 14) {
                for (let x = r.x + 10; x < r.x + r.w * rand(.5, .85); x += 9) {
                    push(x, y, true);
                }
            }
        }

        return points;
    };

    const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = el.offsetWidth;
        h = el.offsetHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // next to the text on wide screens, faded behind it otherwise
        const wide = w >= 1280;
        const fw = wide ? Math.min(w * .3, 540) : Math.min(w * .86, 640);
        const fh = fw * .72;
        frame = {
            x: wide ? w - fw - Math.max(32, (w - 1200) / 2 - 120) : (w - fw) / 2,
            y: wide ? (h - fh) / 2 + 20 : h * .1,
            w: fw,
            h: fh,
            alpha: wide ? 1 : .35,
        };

        blocks = layout.map((b, i) => {
            const r = { x: frame.x + b.x * fw, y: frame.y + b.y * fh, w: b.w * fw, h: b.h * fh };
            const particles = targets(b, r).map(t => {
                const angle = rand(-Math.PI, 0);
                const dist = rand(120, 420);
                return {
                    tx: t.x, ty: t.y, text: t.text,
                    sx: t.x + Math.cos(angle) * dist * 1.4,
                    sy: t.y + Math.sin(angle) * dist - 80,
                    dx: rand(-1, 1), dy: rand(-1, .3),
                    delay: rand(0, 380),
                    ch: glyph(),
                };
            });
            return { ...b, r, particles, start: i * STEP };
        });

        ambient = Array.from({ length: Math.round(w * h / 9000) }, () => ({
            x: rand(0, w), y: rand(0, h), v: rand(.006, .02), a: rand(.05, .25), ch: glyph(),
        }));

        draw();
    };

    const chip = (text, x, y, alpha) => {
        if (!ctx.roundRect || alpha <= 0) {
            return;
        }

        ctx.font = `500 ${font}`;
        const bw = ctx.measureText(text).width + 24;
        ctx.save();
        ctx.globalAlpha = alpha * frame.alpha;
        ctx.shadowColor = `rgba(${blue}, .6)`;
        ctx.shadowBlur = 18;
        ctx.fillStyle = "rgba(24, 24, 24, .92)";
        ctx.beginPath();
        ctx.roundRect(x, y, bw, 28, 6);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "rgba(255, 255, 255, .16)";
        ctx.stroke();
        ctx.fillStyle = "rgba(255, 255, 255, .75)";
        ctx.fillText(text, x + 12, y + 18.5);
        ctx.fillStyle = "rgba(255, 255, 255, .45)";
        ctx.beginPath();
        ctx.moveTo(x + bw + 4, y + 30);
        ctx.lineTo(x + bw + 18, y + 36);
        ctx.lineTo(x + bw + 12, y + 39);
        ctx.lineTo(x + bw + 9, y + 45);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    };

    const draw = () => {
        ctx.clearRect(0, 0, w, h);
        ctx.font = font;
        ctx.textAlign = "center";
        ctx.fillStyle = "#fff";

        for (const p of ambient) {
            ctx.globalAlpha = p.a;
            ctx.fillText(p.ch, p.x, p.y);
        }

        const t = clock % cycle;
        const out = clamp((t - buildEnd - HOLD) / DISSOLVE);

        for (const b of blocks) {
            const local = t - b.start;

            if (local < 0) {
                continue;
            }

            const settled = clamp((local - FLIGHT) / 400) * (1 - out);
            const fa = frame.alpha;

            // solid shape once the particles have arrived
            if (settled > 0) {
                ctx.save();
                ctx.globalAlpha = settled * fa;

                if (b.kind === "button") {
                    ctx.fillStyle = `rgb(${blue})`;
                    ctx.fillRect(b.r.x, b.r.y, b.r.w, b.r.h);
                } else if (b.kind !== "text") {
                    ctx.strokeStyle = "rgba(255, 255, 255, .28)";
                    ctx.strokeRect(b.r.x + .5, b.r.y + .5, b.r.w, b.r.h);
                }

                if (b.kind === "frame") {
                    const bar = b.r.y + b.r.h * .08;
                    ctx.beginPath();
                    ctx.moveTo(b.r.x, bar);
                    ctx.lineTo(b.r.x + b.r.w, bar);
                    ctx.stroke();
                    ctx.fillStyle = "rgba(255, 255, 255, .3)";

                    for (let i = 0; i < 3; i++) {
                        ctx.beginPath();
                        ctx.arc(b.r.x + 16 + i * 14, b.r.y + b.r.h * .04, 3.5, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }

                ctx.restore();
            }

            ctx.fillStyle = "#fff";

            for (const p of b.particles) {
                const k = easeOut(clamp((local - p.delay) / (FLIGHT - 380)));

                if (k <= 0) {
                    continue;
                }

                const o = easeIn(out);
                const x = p.sx + (p.tx - p.sx) * k + p.dx * o * 260;
                const y = p.sy + (p.ty - p.sy) * k + p.dy * o * 260;
                const base = p.text ? .75 : .45;
                ctx.globalAlpha = fa * (1 - out) * (k < 1 ? .3 + .7 * k : base * (1 - settled * .5));

                if (b.kind === "button" && settled > .5) {
                    continue;
                }

                ctx.fillText(p.ch, x, y + 4);
            }

            // label while the block is being built
            const label = clamp(local / 250) * (1 - clamp((local - FLIGHT - 300) / 400));
            chip(b.label, b.r.x + b.r.w - 30, b.r.y - 34, label);
            ctx.font = font;
            ctx.textAlign = "center";
        }

        ctx.globalAlpha = 1;
    };

    const tick = now => {
        raf = 0;

        if (!el.isConnected) {
            window.removeEventListener("resize", resize);
            return;
        }

        const dt = Math.min(48, now - (last || now));
        last = now;
        clock += dt;

        for (const p of ambient) {
            p.y -= p.v * dt;

            if (p.y < -10) {
                p.y = h + 10;
                p.x = rand(0, w);
            }

            if (Math.random() < .002) {
                p.ch = glyph();
            }
        }

        for (const b of blocks) {
            for (const p of b.particles) {
                if (Math.random() < .0008) {
                    p.ch = glyph();
                }
            }
        }

        draw();

        if (visible) {
            raf = requestAnimationFrame(tick);
        }
    };

    window.addEventListener("resize", resize);

    if (reducedMotion.matches) {
        clock = buildEnd + 1000;
        resize();
        return;
    }

    resize();

    new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;

        if (visible && !raf) {
            last = 0;
            raf = requestAnimationFrame(tick);
        }
    }).observe(el);
}
