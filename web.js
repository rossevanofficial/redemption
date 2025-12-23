/* ==========================================
   Redemption — web.js
   - Parallax hero layers
   - Ember particles canvas
========================================== */

(function () {
  "use strict";

  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------------------------
  // Parallax (hero-bg + hero-image)
  // ---------------------------
  (function initParallax() {
    const bg = document.querySelector(".hero-bg");
    const heroImage = document.querySelector(".hero-image");
    if (!bg && !heroImage) return;
    if (prefersReducedMotion) return;

    let ticking = false;

    function apply() {
      ticking = false;
      const y = window.scrollY || 0;
      if (bg) bg.style.transform = `translateY(${y * 0.10}px)`;
      if (heroImage) heroImage.style.transform = `translateY(${y * 0.16}px) scale(1.02)`;
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(apply);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    apply();
  })();

  // ---------------------------
  // Embers (canvas particles)
  // ---------------------------
  (function initEmbers() {
    const canvas = document.getElementById("embers");
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    if (prefersReducedMotion) return;

    let w = 0, h = 0, dpr = 1;
    let particles = [];
    const COUNT = 90;

    const rand = (min, max) => Math.random() * (max - min) + min;

    function resize() {
      const parent = canvas.parentElement;
      if (!parent) return;

      dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      w = parent.clientWidth;
      h = parent.clientHeight;

      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function makeParticle(resetToBottom = true) {
      return {
        x: rand(0, w),
        y: resetToBottom ? rand(h * 0.65, h + 60) : rand(0, h),
        r: rand(0.7, 2.0),
        vy: rand(0.08, 0.38),
        vx: rand(-0.12, 0.12),
        life: rand(0.35, 1.0),
        flicker: rand(0.6, 1.0),
        hue: rand(18, 38),
        sat: rand(70, 95),
        light: rand(55, 70),
      };
    }

    function init() {
      particles = [];
      for (let i = 0; i < COUNT; i++) particles.push(makeParticle(false));
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      for (const p of particles) {
        p.y -= p.vy;
        p.x += p.vx + Math.sin((p.y + p.x) * 0.002) * 0.08;

        p.flicker += rand(-0.03, 0.03);
        p.flicker = Math.max(0.55, Math.min(1.0, p.flicker));

        if (p.y < -30 || p.x < -50 || p.x > w + 50) {
          Object.assign(p, makeParticle(true));
        }

        const alpha = 0.16 * p.life * p.flicker;
        const radius = p.r * 6;

        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
        grd.addColorStop(0, `hsla(${p.hue}, ${p.sat}%, ${p.light}%, ${alpha})`);
        grd.addColorStop(1, `hsla(${p.hue}, ${p.sat}%, ${p.light}%, 0)`);

        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
      requestAnimationFrame(draw);
    }

    resize();
    init();
    draw();

    let t = null;
    window.addEventListener(
      "resize",
      () => {
        clearTimeout(t);
        t = setTimeout(() => {
          resize();
          init();
        }, 120);
      },
      { passive: true }
    );
  })();

})();
