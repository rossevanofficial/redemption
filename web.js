/* ==========================================
   Redemption / Site — web.js
   - Parallax hero layers
   - Ember particles canvas
   - Optional reveal-on-scroll
========================================== */

(function () {
  "use strict";

  // ---------------------------
  // Helpers
  // ---------------------------
  const $ = (sel, root = document) => root.querySelector(sel);

  // Respect reduced motion
  const prefersReducedMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------------------------
  // Parallax (hero-bg + hero-image)
  // ---------------------------
  (function initParallax() {
    const bg = $(".hero-bg");
    const heroImage = $(".hero-image");

    if (!bg && !heroImage) return;
    if (prefersReducedMotion) return;

    let ticking = false;

    function apply() {
      ticking = false;
      const y = window.scrollY || 0;

      // subtle parallax
      if (bg) bg.style.transform = `translateY(${y * 0.10}px)`;
      if (heroImage) heroImage.style.transform = `translateY(${y * 0.16}px) scale(1.02)`;
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(apply);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    apply();
  })();

  // ---------------------------
  // Embers (canvas particles)
  // ---------------------------
  (function initEmbers() {
    const canvas = $("#embers");
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    if (prefersReducedMotion) {
      // If reduced motion, keep canvas cleared (no animation)
      const resizeStatic = () => {
        const parent = canvas.parentElement;
        if (!parent) return;
        canvas.width = Math.floor(parent.clientWidth);
        canvas.height = Math.floor(parent.clientHeight);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      };
      window.addEventListener("resize", resizeStatic, { passive: true });
      resizeStatic();
      return;
    }

    let w = 0, h = 0, dpr = 1;
    let particles = [];

    // Density: tuned for rain/night mood
    const COUNT = 90;

    function rand(min, max) {
      return Math.random() * (max - min) + min;
    }

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

      // Cinematic blending
      ctx.globalCompositeOperation = "lighter";

      for (const p of particles) {
        // motion
        p.y -= p.vy;
        p.x += p.vx + Math.sin((p.y + p.x) * 0.002) * 0.08;

        // flicker
        p.flicker += rand(-0.03, 0.03);
        p.flicker = Math.max(0.55, Math.min(1.0, p.flicker));

        // respawn
        if (p.y < -30 || p.x < -50 || p.x > w + 50) {
          Object.assign(p, makeParticle(true));
        }

        // render glow
        const alpha = 0.16 * p.life * p.flicker; // slightly softer
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
      window.requestAnimationFrame(draw);
    }

    // init
    resize();
    init();
    draw();

    // keep stable on resize (debounced)
    let resizeTimer = null;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
        init();
      }, 120);
    }, { passive: true });
  })();

  // ---------------------------
  // Optional: reveal-on-scroll
  // Add class="reveal" in HTML where you want fade-in
  // ---------------------------
  (function initReveal() {
    const items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    // If reduced motion, just show everything
    if (prefersReducedMotion) {
      items.forEach(el => el.classList.add("is-visible"));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      }
    }, { threshold: 0.15 });

    items.forEach(el => io.observe(el));
  })();

})();
