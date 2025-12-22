/* ==========================================
   Redemption — web.js
   Parallax + embers canvas + optional reveals
========================================== */

(function () {
  // ---------------------------
  // Parallax (background + house)
  // ---------------------------
  const bg = document.querySelector(".hero-bg");
  const house = document.querySelector(".hero-house");

  function onScroll() {
    const y = window.scrollY || 0;
    if (bg) bg.style.transform = `translateY(${y * 0.10}px)`;
    if (house) house.style.transform = `translateY(${y * 0.16}px)`;
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---------------------------
  // Embers (lightweight canvas particles)
  // ---------------------------
  const canvas = document.getElementById("embers");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  let w, h, dpr;
  let particles = [];

  const COUNT = 80; // subtle, cinematic

  function resize() {
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    w = canvas.clientWidth = canvas.parentElement.clientWidth;
    h = canvas.clientHeight = canvas.parentElement.clientHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function makeParticle(resetToBottom = true) {
    return {
      x: rand(0, w),
      y: resetToBottom ? rand(h * 0.60, h + 60) : rand(0, h),
      r: rand(0.6, 2.0),
      vy: rand(0.08, 0.35),
      vx: rand(-0.10, 0.10),
      life: rand(0.35, 1.0),
      flicker: rand(0.6, 1.0),
      hue: rand(18, 38), // ember oranges
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

      // render
      const alpha = 0.18 * p.life * p.flicker;
      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
      grd.addColorStop(
        0,
        `hsla(${p.hue}, ${p.sat}%, ${p.light}%, ${alpha})`
      );
      grd.addColorStop(1, `hsla(${p.hue}, ${p.sat}%, ${p.light}%, 0)`);

      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalCompositeOperation = "source-over";
    requestAnimationFrame(draw);
  }

  window.addEventListener(
    "resize",
    () => {
      resize();
      init();
    },
    { passive: true }
  );

  resize();
  init();
  draw();

  // ---------------------------
  // Optional: reveal-on-scroll
  // Add class="reveal" to sections/cards
  // ---------------------------
  const reveals = document.querySelectorAll(".reveal");
  if (reveals.length) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) e.target.classList.add("is-visible");
        }
      },
      { threshold: 0.12 }
    );
    reveals.forEach((el) => io.observe(el));
  }
})();
