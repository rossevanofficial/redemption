/* ==========================================================
   Redemption — Upgraded Cinematic web.js
   Inertia Parallax Camera Engine + Organic Thermal Embers
========================================================== */

/* ---------------------------
   Smooth Inertia Camera Tracking
--------------------------- */
(function(){
  const bg = document.querySelector('.hero-bg');
  const heroImage = document.querySelector('.hero-image');
  
  let targetY = 0;
  let currentY = 0;
  const ease = 0.08; // Lower value = smoother cinematic gliding

  window.addEventListener('scroll', () => {
    targetY = window.scrollY || 0;
  }, { passive: true });

  function updateCamera() {
    // Linear interpolation loop to create lens inertia
    currentY += (targetY - currentY) * ease;
    
    // Limits processing calculations if numbers are fractional
    if (Math.abs(targetY - currentY) > 0.01) {
      if (bg) bg.style.transform = `translate3d(0, ${currentY * 0.08}px, 0)`;
      if (heroImage) heroImage.style.transform = `translate3d(0, ${currentY * 0.12}px, 0) scale(1.03)`;
    }
    
    requestAnimationFrame(updateCamera);
  }
  
  updateCamera();
})();

/* ---------------------------
   Scroll reveal (fade-in)
--------------------------- */
(function(){
  const revealItems = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window)) {
    revealItems.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -10% 0px'
    }
  );

  revealItems.forEach(el => observer.observe(el));
})();

/* ---------------------------
   Embers (Organic Thermal Particle Engine)
--------------------------- */
(function(){
  const canvas = document.getElementById('embers');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha:true });
  let w, h, dpr;
  let particles = [];
  const count = 70;

  function resize(){
    dpr = Math.min(2, window.devicePixelRatio || 1);
    w = canvas.clientWidth = canvas.parentElement.clientWidth;
    h = canvas.clientHeight = canvas.parentElement.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }

  function rand(min,max){ return Math.random()*(max-min)+min; }

  function makeParticle(reset=true){
    return {
      x: rand(0,w),
      y: reset ? rand(h*0.6,h+60) : rand(0,h),
      r: rand(0.6,1.8),
      vy: rand(0.08,0.3),
      vx: rand(-0.08,0.08),
      life: rand(0.4,1),
      flicker: rand(0.6,1),
      hue: rand(18,34) // Warm ember thermal spectrum spectrum range
    };
  }

  function init(){
    particles = [];
    for(let i=0;i<count;i++) particles.push(makeParticle(false));
  }

  function draw(){
    ctx.clearRect(0,0,w,h);
    ctx.globalCompositeOperation = 'lighter';

    for(const p of particles){
      p.y -= p.vy;
      p.x += p.vx;

      if (p.y < -30 || p.x < -50 || p.x > w+50) {
        Object.assign(p, makeParticle());
      }

      // Organic canvas pulsing wave logic
      const alpha = (0.22 * p.life * p.flicker) * (Math.sin(Date.now() * 0.004 * p.flicker) * 0.3 + 0.7);
      const sizeModifier = p.r * (1 + Math.sin(Date.now() * 0.008 + p.x) * 0.15);

      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, sizeModifier * 5);
      g.addColorStop(0, `hsla(${p.hue}, 85%, 60%, ${alpha})`);
      g.addColorStop(0.3, `hsla(${p.hue - 4}, 80%, 45%, ${alpha * 0.6})`); // Multi-tone heat signatures
      g.addColorStop(1, `hsla(${p.hue}, 80%, 45%, 0)`);

      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, sizeModifier * 5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => {
    resize();
    init();
  }, { passive:true });

  resize();
  init();
  draw();
})();

/* ---------------------------
   Cinematic Audio Framework
--------------------------- */
(function(){
  const audio = document.getElementById('themeAudio');
  const continueBtn = document.getElementById('continueBtn');
  const stopBtn = document.getElementById('stopBtn');
  const statusText = document.getElementById('musicStatus');
  let secondaryTimeout = null;

  if (!audio) return;

  function initialInteractionPlay() {
    audio.play().then(() => {
      if (statusText) statusText.textContent = "Playing preview theme...";
      document.removeEventListener('click', initialInteractionPlay);
      
      secondaryTimeout = setTimeout(() => {
        audio.pause();
        if (statusText) statusText.textContent = "Preview finished. Click '🔥 Continue' to keep listening.";
      }, 15000);
    }).catch(err => console.log("Audio autoplay restricted by browser layout permissions."));
  }

  document.addEventListener('click', initialInteractionPlay);

  if (continueBtn) {
    continueBtn.addEventListener('click', (e) => {
      e.stopPropagation(); 
      clearTimeout(secondaryTimeout);
      audio.play();
      if (statusText) statusText.textContent = "Looping official novel theme track.";
    });
  }

  if (stopBtn) {
    stopBtn.addEventListener('click', (e) => {
      e.stopPropagation(); 
      clearTimeout(secondaryTimeout);
      audio.pause();
      audio.currentTime = 0;
      if (statusText) statusText.textContent = "Audio playback stopped.";
    });
  }
})();
