/* ==========================================
   Redemption — web.js
   Parallax + embers + scroll reveals
========================================== */

/* ---------------------------
   Parallax (hero background)
--------------------------- */
(function(){
  const bg = document.querySelector('.hero-bg');
  const heroImage = document.querySelector('.hero-image');

  function onScroll(){
    const y = window.scrollY || 0;
    if (bg) bg.style.transform = `translateY(${y * 0.10}px)`;
    if (heroImage) heroImage.style.transform =
      `translateY(${y * 0.16}px) scale(1.02)`;
  }

  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll();
})();

/* ---------------------------
   Scroll reveal (fade-in)
--------------------------- */
(function(){
  const revealItems = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window)) {
    // Fallback: just show everything
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
   Embers (lightweight canvas)
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
      hue: rand(18,38)
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

      const alpha = 0.18 * p.life * p.flicker;
      const g = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*6);
      g.addColorStop(0, `hsla(${p.hue},80%,65%,${alpha})`);
      g.addColorStop(1, `hsla(${p.hue},80%,65%,0)`);

      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r*6,0,Math.PI*2);
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
