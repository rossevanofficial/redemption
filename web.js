/* ==========================================
   Redemption — web.js
   Embers canvas + scroll parallax + reveal
========================================== */

(function () {
  // -----------------------------------------
  // Helpers
  // -----------------------------------------
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

  // -----------------------------------------
  // Auto-add reveal classes to prologue elements
  // (so you don't have to modify index.html)
  // -----------------------------------------
  const prologueTitle = document.querySelector("#prologue .section-title");
  const prologueKicker = document.querySelector("#prologue .section-kicker");
  const prologueMedia = document.querySelector("#prologue .prologue-media");
  const prologueCopy = document.querySelector("#prologue .prologue-copy");

  const revealTargets = [];
  if (prologueKicker) { prologueKicker.classList.add("reveal"); revealTargets.push(prologueKicker); }
  if (prologueTitle)  { prologueTitle.classList.add("reveal", "delay-1"); revealTargets.push(prologueTitle); }
  if (prologueMedia)  { prologueMedia.classList.add("reveal", "delay-2"); revealTargets.push(prologueMedia); }
  if (prologueCopy)   { prologueCopy.classList.add("reveal", "delay-3"); revealTargets.push(prologueCopy); }

  // -----------------------------------------
  // Reveal on scroll (IntersectionObserver)
  // -----------------------------------------
  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      }
    }, { threshold: 0.15 });

    document.querySelectorAll(".reveal").forEach(el => io.observe(el));
  } else {
    // Fallback: show instantly
    document.querySelectorAll(".reveal").forEach(el => el.classList.add("is-visible"));
  }

  // -----------------------------------------
  // Cinematic scroll transforms
  // -----------------------------------------
  const heroBg = document.querySelector(".hero-bg");
  const heroImage = document.querySelector(".hero-image");
  const prologueMediaEl = document.querySelector(".prologue-media");

  function onScroll() {
    if (prefersReducedMotion) return;

    const y = window.scrollY || 0;

    // Hero parallax
    if (heroBg) heroBg.style.transform = `translateY(${y * 0.08}px)`;

    if (heroImage) {
      const drift = y * 0.12;
      heroImage.style.transform = `translateY(${drift}px) scale(1.03)`;
    }

    // Prologue subtle drift when in view
    if (prologueMediaEl) {
      const rect = prologueMediaEl.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      const t = 1 - clamp(rect.top / vh, 0, 1); // 0→1 as it enters
      const lift = (t - 0.5) * -18; // gentle
      prologueMediaEl.style.transform = `translateY(${lift}px)`;
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // -----------------------------------------
  // Embers (canvas particles)
  // -----------------------------------------
  const canvas = document.getElementById("embers");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });

  let w = 0, h = 0, dpr = 1;
  let particles = [];

  // Mobile-aware density
  const isMobile = window.matchMedia("(max-width: 720px)").matches;
  const baseCount = isMobile ? 55 : 95;
  const count = prefersReducedMotion ? 0 : baseCount;

  function resize() {
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    w = canvas.clientWidth = canvas.parentElement.clientWidth;
    h = canvas.clientHeight = canvas.parentElement.clientHeight;

    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function makeParticle(resetToBottom = true) {
    return {
      x: rand(0, w),
      y: resetToBottom ? rand(h * 0.65, h + 80) : rand(0, h),
      r: rand(0.6, 2.0),
      vy: rand(0.07, 0.32),
      vx: rand(-0.10, 0.10),
      life: rand(0.35, 1.0),
      flicker: rand(0.6, 1.0),
      hue: rand(18, 38),
      sat: rand(70, 95),
      light: rand(52, 68)
    };
  }

  function init() {
    particles = [];
    for (let i = 0; i < count; i++) particles.push(makeParticle(false));
  }

  function draw() {
    if (prefersReducedMotion || count === 0) return;

    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";

    for (const p of particles) {
      // motion
      p.y -= p.vy;
      p.x += p.vx + Math.sin((p.y + p.x) * 0.002) * 0.06;

      // flicker
      p.flicker += rand(-0.03, 0.03);
      p.flicker = clamp(p.flicker, 0.55, 1.0);

      // respawn
      if (p.y < -40 || p.x < -60 || p.x > w + 60) {
        Object.assign(p, makeParticle(true));
      }

      // render glow
      const alpha = 0.16 * p.life * p.flicker;
      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
      grd.addColorStop(0, `hsla(${p.hue}, ${p.sat}%, ${p.light}%, ${alpha})`);
      grd.addColorStop(1, `hsla(${p.hue}, ${p.sat}%, ${p.light}%, 0)`);

      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalCompositeOperation = "source-over";
    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", () => { resize(); init(); }, { passive: true });
  resize();
  init();
  draw();
})();
