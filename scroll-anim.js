document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger);

    // ─── LOGO CANVAS SETUP ───────────────────────────────────────────
    const canvas = document.getElementById("logo-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // ─── ANIMATED BACKGROUND CANVAS ──────────────────────────────────
    const bgCanvas = document.getElementById("bg-canvas");
    const bgCtx = bgCanvas ? bgCanvas.getContext("2d") : null;

    // ─── THEME COLORS ────────────────────────────────────────────────
    const THEME = {
        bg1: "#f0fdfa", // Icy light mint/teal
        bg2: "#f8fafc", // Crisp clean slate
        primary: "#0F2E3A", // Deep trust navy
        primaryLight: "rgba(15, 46, 58, 0.08)",
        primaryMedium: "rgba(15, 46, 58, 0.2)",
        teal: "#0D9488", // Accent medical teal
        tealLight: "rgba(13, 148, 136, 0.08)",
        tealMedium: "rgba(13, 148, 136, 0.25)",
        cyan: "#06B6D4", // Health cyan
        mint: "#10B981" // Active herbal/pharma mint
    };

    // ─── FLOATING ORBS (BACKGROUND PARTICLES) ────────────────────────
    const orbs = [];
    const ORB_COUNT = 18;

    function createOrbs() {
        orbs.length = 0;
        if (!bgCanvas) return;
        const w = bgCanvas.width;
        const h = bgCanvas.height;
        for (let i = 0; i < ORB_COUNT; i++) {
            orbs.push({
                x: Math.random() * w,
                y: Math.random() * h,
                radius: 30 + Math.random() * 120,
                speedX: (Math.random() - 0.5) * 0.3,
                speedY: (Math.random() - 0.5) * 0.2,
                opacity: 0.04 + Math.random() * 0.10,
                color: Math.random() > 0.5 ? THEME.teal : THEME.primary,
                phase: Math.random() * Math.PI * 2,
                pulseSpeed: 0.003 + Math.random() * 0.006,
            });
        }
    }

    // ─── SPARKLE PARTICLES ───────────────────────────────────────────
    const sparkles = [];
    const SPARKLE_COUNT = 35;

    function createSparkles() {
        sparkles.length = 0;
        if (!bgCanvas) return;
        const w = bgCanvas.width;
        const h = bgCanvas.height;
        for (let i = 0; i < SPARKLE_COUNT; i++) {
            sparkles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                size: 1 + Math.random() * 2.5,
                speedY: -0.15 - Math.random() * 0.35,
                speedX: (Math.random() - 0.5) * 0.2,
                opacity: Math.random(),
                fadeDir: Math.random() > 0.5 ? 1 : -1,
                fadeSpeed: 0.005 + Math.random() * 0.012,
            });
        }
    }

    let bgAnimId = null;
    let time = 0;

    function drawBackground() {
        if (!bgCanvas || !bgCtx) return;
        const w = bgCanvas.width;
        const h = bgCanvas.height;

        // Fill with theme gradient
        const grad = bgCtx.createLinearGradient(0, 0, w, 0);
        grad.addColorStop(0, THEME.bg1);
        grad.addColorStop(1, THEME.bg2);
        bgCtx.fillStyle = grad;
        bgCtx.fillRect(0, 0, w, h);

        // Subtle radial glow at centre
        const centreGlow = bgCtx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.45);
        centreGlow.addColorStop(0, "rgba(13, 148, 136, 0.08)");
        centreGlow.addColorStop(0.5, "rgba(15, 46, 58, 0.03)");
        centreGlow.addColorStop(1, "transparent");
        bgCtx.fillStyle = centreGlow;
        bgCtx.fillRect(0, 0, w, h);

        // Draw floating orbs
        for (const orb of orbs) {
            orb.x += orb.speedX;
            orb.y += orb.speedY;
            orb.phase += orb.pulseSpeed;

            // Wrap around edges
            if (orb.x < -orb.radius) orb.x = w + orb.radius;
            if (orb.x > w + orb.radius) orb.x = -orb.radius;
            if (orb.y < -orb.radius) orb.y = h + orb.radius;
            if (orb.y > h + orb.radius) orb.y = -orb.radius;

            const pulse = Math.sin(orb.phase) * 0.03;
            const alpha = orb.opacity + pulse;

            const g = bgCtx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
            g.addColorStop(0, orb.color === THEME.teal
                ? `rgba(13, 148, 136, ${alpha})`
                : `rgba(15, 46, 58, ${alpha})`);
            g.addColorStop(1, "transparent");
            bgCtx.fillStyle = g;
            bgCtx.fillRect(orb.x - orb.radius, orb.y - orb.radius, orb.radius * 2, orb.radius * 2);
        }

        // Draw sparkle particles
        for (const s of sparkles) {
            s.x += s.speedX;
            s.y += s.speedY;
            s.opacity += s.fadeDir * s.fadeSpeed;

            if (s.opacity >= 1) { s.opacity = 1; s.fadeDir = -1; }
            if (s.opacity <= 0) {
                s.opacity = 0;
                s.fadeDir = 1;
                s.x = Math.random() * w;
                s.y = h + 10;
            }
            if (s.y < -10) { s.y = h + 10; s.x = Math.random() * w; }

            bgCtx.beginPath();
            bgCtx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            bgCtx.fillStyle = `rgba(6, 182, 212, ${s.opacity * 0.45})`; // Health Cyan Sparkles
            bgCtx.fill();
        }

        // Subtle rotating ring decoration
        time += 0.002;
        bgCtx.save();
        bgCtx.translate(w / 2, h / 2);
        bgCtx.rotate(time);
        bgCtx.beginPath();
        bgCtx.arc(0, 0, Math.min(w, h) * 0.32, 0, Math.PI * 1.2);
        bgCtx.strokeStyle = `rgba(13, 148, 136, 0.06)`;
        bgCtx.lineWidth = 1;
        bgCtx.stroke();
        bgCtx.rotate(-time * 0.6);
        bgCtx.beginPath();
        bgCtx.arc(0, 0, Math.min(w, h) * 0.28, Math.PI * 0.3, Math.PI * 1.8);
        bgCtx.strokeStyle = `rgba(15, 46, 58, 0.04)`;
        bgCtx.lineWidth = 0.8;
        bgCtx.stroke();
        bgCtx.restore();

        bgAnimId = requestAnimationFrame(drawBackground);
    }

    // ─── RESIZE HANDLER ──────────────────────────────────────────────
    function resizeCanvases() {
        const dpr = window.devicePixelRatio || 1;

        // Logo canvas: match its CSS display size
        const logoRect = canvas.getBoundingClientRect();
        canvas.width = logoRect.width * dpr;
        canvas.height = logoRect.height * dpr;
        ctx.scale(dpr, dpr);

        // Background canvas: fill full container
        if (bgCanvas) {
            const container = bgCanvas.parentElement;
            bgCanvas.width = container.clientWidth * dpr;
            bgCanvas.height = container.clientHeight * dpr;
            bgCtx.scale(dpr, dpr);
            createOrbs();
            createSparkles();
        }
    }

    // ─── RENDER LOGO FRAME (contain-fit within smaller canvas) ─────────
    function renderFrame(frameIndex) {
        const img = images[frameIndex];
        if (!img) return;

        const dpr = window.devicePixelRatio || 1;
        const displayW = canvas.width / dpr;
        const displayH = canvas.height / dpr;

        // 1. Clear everything
        ctx.clearRect(0, 0, displayW, displayH);

        // 3. "Contain" fit — show full logo inside the canvas
        const imgRatio = img.width / img.height;
        const canvasRatio = displayW / displayH;
        let drawW, drawH, x, y;

        if (canvasRatio > imgRatio) {
            drawH = displayH;
            drawW = displayH * imgRatio;
            x = (displayW - drawW) / 2;
            y = 0;
        } else {
            drawW = displayW;
            drawH = displayW / imgRatio;
            x = 0;
            y = (displayH - drawH) / 2;
        }

        ctx.drawImage(img, x, y, drawW, drawH);
    }

    // ─── IMAGE LOADING ───────────────────────────────────────────────
    const totalFrames = 200;
    const images = [];
    let loadedCount = 0;

    const preloader = document.getElementById("preloader");
    const percentText = document.getElementById("loading-percentage");
    const barFill = document.getElementById("loading-bar-fill");

    for (let i = 1; i <= totalFrames; i++) {
        const img = new Image();
        const num = String(i).padStart(3, "0");
        img.src = `images/logo-frame/ezgif-frame-${num}.png`;

        img.onload = () => {
            loadedCount++;
            images[i - 1] = img;
            updateProgress();
        };
        img.onerror = () => {
            console.warn(`Failed to load frame ${i}`);
            loadedCount++;
            if (i > 1 && images[i - 2]) images[i - 1] = images[i - 2];
            updateProgress();
        };
    }

    function updateProgress() {
        const percent = Math.round((loadedCount / totalFrames) * 100);
        if (percentText) percentText.innerText = `${percent}%`;
        if (barFill) barFill.style.width = `${percent}%`;

        if (loadedCount === totalFrames) {
            setTimeout(initAnimation, 300);
        }
    }

    // ─── MAIN ANIMATION INIT ─────────────────────────────────────────
    function initAnimation() {
        // Fade out preloader
        if (preloader) {
            preloader.classList.add("opacity-0", "pointer-events-none");
            setTimeout(() => { preloader.style.display = "none"; }, 800);
        }

        // Set canvas sizes
        resizeCanvases();

        // Start background animation loop
        drawBackground();

        // Draw first frame
        renderFrame(0);

        // GSAP ScrollTrigger
        const animationState = { frame: 0 };

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: ".hero-section",
                pin: true,
                start: "top top",
                end: "+=3500",
                scrub: 1.2,
            },
        });

        tl.to(animationState, {
            frame: totalFrames - 1,
            snap: "frame",
            ease: "none",
            duration: 1,
            onUpdate: () => {
                renderFrame(Math.round(animationState.frame));
            },
        }, 0);

        // Handle resize
        window.addEventListener("resize", () => {
            resizeCanvases();
            renderFrame(Math.round(animationState.frame));
            ScrollTrigger.refresh();
        });
    }
});
