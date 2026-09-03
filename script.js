// ---------- SHARED HELPERS ----------
function burstConfetti(count){
  const colors = ['#B5502E', '#D9A441', '#7A2436', '#EFE2C6'];
  const n = count || 26;
  for(let i=0; i<n; i++){
    const el = document.createElement('span');
    el.className = 'confetti-piece';
    el.style.left = Math.random()*100 + 'vw';
    el.style.background = colors[Math.floor(Math.random()*colors.length)];
    el.style.animationDuration = (2.2 + Math.random()*1.4) + 's';
    el.style.opacity = String(0.7 + Math.random()*0.3);
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  }
}

function revealStagger(elements, delay, startDelay){
  const list = Array.prototype.slice.call(elements);
  const step = delay || 90;
  const base = startDelay || 0;
  list.forEach((el, i) => {
    setTimeout(() => el.classList.add('in'), base + i*step);
  });
}

// ---------- START GATE -> LOADER + MUSIC ----------
// Browsers block audio-with-sound before a real user gesture (no way around
// this). So the page opens on a "toca para empezar" screen: that tap IS the
// gesture that starts the music (from 0:00, audible immediately) and, at the
// same time, kicks off the heart loader.
(function(){
  const startGate = document.getElementById('startGate');
  const startBtn = document.getElementById('startBtn');
  const audio = document.getElementById('bgMusic');
  const loader = document.getElementById('loader');
  const pctEl = document.getElementById('loaderPct');
  const rect = document.getElementById('heartRect');
  const main = document.getElementById('main');

  function runLoader(){
    let pct = 0;
    const duration = 2200; // ms
    const start = performance.now();

    function tick(now){
      const elapsed = now - start;
      pct = Math.min(100, Math.round((elapsed/duration)*100));
      pctEl.textContent = pct + '%';
      const y = 90 - (pct/100)*90;
      rect.setAttribute('y', y);

      if(elapsed < duration){
        requestAnimationFrame(tick);
      } else {
        setTimeout(() => {
          loader.classList.add('fade-out');
          main.classList.remove('hidden');
          document.body.style.overflow = 'auto';
          revealStagger(document.querySelectorAll('.hero .reveal-el'), 110, 100);
        }, 250);
      }
    }
    requestAnimationFrame(tick);
  }

  document.body.style.overflow = 'hidden';

  if(!startGate || !startBtn){
    runLoader();
    return;
  }

  startBtn.addEventListener('click', () => {
    if(audio){
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
    startGate.classList.add('fade-out');
    setTimeout(() => {
      startGate.remove();
      runLoader();
    }, 400);
  }, { once:true });
})();

// ---------- AMBIENT PARTICLES ----------
(function(){
  const ambient = document.getElementById('ambient');
  if(!ambient) return;
  const glyphs = ['♥', '✦', '❀'];
  const colors = ['#B5502E', '#D9A441', '#7A2436'];
  const count = 16;
  for(let i=0; i<count; i++){
    const span = document.createElement('span');
    span.className = 'ambient-piece';
    span.textContent = glyphs[Math.floor(Math.random()*glyphs.length)];
    span.style.setProperty('--x', Math.random()*100 + 'vw');
    span.style.setProperty('--dx', (Math.random()*60 - 30) + 'px');
    span.style.setProperty('--dur', (12 + Math.random()*14) + 's');
    span.style.setProperty('--delay', (Math.random()*-20) + 's');
    span.style.setProperty('--size', (10 + Math.random()*14) + 'px');
    span.style.setProperty('--c', colors[Math.floor(Math.random()*colors.length)]);
    ambient.appendChild(span);
  }
})();

// ---------- SCROLL PROGRESS ----------
(function(){
  const bar = document.getElementById('progressBar');
  if(!bar) return;
  function update(){
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const pct = h > 0 ? Math.min(1, window.scrollY / h) : 0;
    bar.style.transform = 'scaleX(' + pct + ')';
  }
  window.addEventListener('scroll', update, { passive:true });
  window.addEventListener('resize', update);
  update();
})();

// ---------- SCROLL-TRIGGERED SEQUENTIAL REVEAL ----------
// Reveals matching elements as they scroll into view, one at a time: even if
// several cross the trigger line in the same scroll tick, `step` ms are
// forced between each reveal so they never pop in together.
function setupSequentialReveal(selector, opts){
  const o = opts || {};
  const targets = Array.prototype.slice.call(document.querySelectorAll(selector));
  if(!targets.length) return;
  if(!('IntersectionObserver' in window)){
    targets.forEach(el => el.classList.add('in'));
    return;
  }
  const order = new Map(targets.map((el, i) => [el, i]));
  let slot = 0;
  const step = o.step || 0;

  const io = new IntersectionObserver((entries) => {
    const hits = entries.filter(e => e.isIntersecting);
    hits.sort((a, b) => order.get(a.target) - order.get(b.target));
    hits.forEach(entry => {
      const mySlot = slot++;
      setTimeout(() => entry.target.classList.add('in'), mySlot * step);
      io.unobserve(entry.target);
    });
  }, { threshold: o.threshold != null ? o.threshold : 0.3, rootMargin: o.rootMargin || '0px' });
  targets.forEach(el => io.observe(el));
}

setupSequentialReveal('.envelope-section .reveal-el', { threshold:0.3, step:100 });
setupSequentialReveal('.letter-section .reveal-el', { threshold:0.15, rootMargin:'0px 0px -8% 0px', step:320 });
setupSequentialReveal('.journey-section .reveal-el', { threshold:0.15, rootMargin:'0px 0px -8% 0px', step:180 });
setupSequentialReveal('.reasons-section .reveal-el', { threshold:0.15, rootMargin:'0px 0px -8% 0px', step:120 });

// ---------- REASON CARDS ----------
(function(){
  const cards = document.querySelectorAll('.reason-card');
  cards.forEach(card => {
    card.addEventListener('click', () => card.classList.toggle('flipped'));
  });
})();

// ---------- CAROUSEL DOTS ----------
(function(){
  const carousel = document.getElementById('carousel');
  const dotsWrap = document.getElementById('dots');
  if(!carousel) return;
  const items = carousel.querySelectorAll('.polaroid');
  items.forEach((_, i) => {
    const d = document.createElement('span');
    if(i === 0) d.classList.add('active');
    dotsWrap.appendChild(d);
  });
  const dots = dotsWrap.querySelectorAll('span');

  function updateDots(){
    const scrollLeft = carousel.scrollLeft;
    const width = items[0].getBoundingClientRect().width + 22; // gap
    const idx = Math.round(scrollLeft / width);
    dots.forEach((d,i) => d.classList.toggle('active', i === idx));
  }
  carousel.addEventListener('scroll', () => {
    window.requestAnimationFrame(updateDots);
  }, { passive:true });
})();

// ---------- POLAROID TILT ----------
(function(){
  const polaroids = document.querySelectorAll('.polaroid');
  if(!polaroids.length) return;

  polaroids.forEach(card => {
    const baseStr = getComputedStyle(card).getPropertyValue('--r') || '0deg';
    const base = parseFloat(baseStr) || 0;

    function move(clientX, clientY){
      const rect = card.getBoundingClientRect();
      const px = (clientX - rect.left) / rect.width;   // 0..1
      const py = (clientY - rect.top) / rect.height;   // 0..1
      const rx = (0.5 - py) * 14; // tilt up/down
      const ry = (px - 0.5) * 16; // tilt left/right
      card.style.transition = 'none';
      card.style.transform = 'rotate(' + base + 'deg) perspective(700px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) scale(1.04)';
    }
    function reset(){
      card.style.transition = 'transform .5s cubic-bezier(.2,.8,.3,1)';
      card.style.transform = 'rotate(' + base + 'deg)';
    }

    card.addEventListener('pointermove', (e) => {
      if(e.pointerType === 'touch') return;
      move(e.clientX, e.clientY);
    });
    card.addEventListener('pointerleave', reset);
    card.addEventListener('pointerdown', (e) => {
      if(e.pointerType === 'touch') move(e.clientX, e.clientY);
    });
    card.addEventListener('pointerup', reset);
  });
})();

// ---------- LIGHTBOX ----------
(function(){
  const lightbox = document.getElementById('lightbox');
  const imgEl = document.getElementById('lightboxImg');
  const closeBtn = document.getElementById('lightboxClose');
  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');
  if(!lightbox) return;

  let photos = [];
  let index = 0;

  function refreshPhotos(){
    photos = Array.prototype.slice.call(document.querySelectorAll('.polaroid img'));
  }
  refreshPhotos();

  function show(i){
    index = (i + photos.length) % photos.length;
    const img = photos[index];
    imgEl.src = img.src;
    imgEl.alt = img.alt;
  }
  function open(i){
    refreshPhotos();
    show(i);
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function close(){
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = 'auto';
  }

  document.addEventListener('click', (e) => {
    const img = e.target.closest('.polaroid img');
    if(img){
      refreshPhotos();
      open(photos.indexOf(img));
    }
  });

  closeBtn.addEventListener('click', close);
  nextBtn.addEventListener('click', () => show(index+1));
  prevBtn.addEventListener('click', () => show(index-1));
  lightbox.addEventListener('click', (e) => { if(e.target === lightbox) close(); });

  document.addEventListener('keydown', (e) => {
    if(!lightbox.classList.contains('open')) return;
    if(e.key === 'Escape') close();
    if(e.key === 'ArrowRight') show(index+1);
    if(e.key === 'ArrowLeft') show(index-1);
  });

  let touchStartX = 0;
  lightbox.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive:true });
  lightbox.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if(Math.abs(dx) > 40) show(index + (dx < 0 ? 1 : -1));
  }, { passive:true });
})();

// ---------- ENVELOPE OPEN ----------
(function(){
  const sealBtn = document.getElementById('sealBtn');
  const envelope = document.getElementById('envelope');
  const envelopeHint = document.getElementById('envelopeHint');
  const letterSection = document.getElementById('letterSection');
  const journeySection = document.getElementById('journeySection');
  const closingGallery = document.getElementById('closingGallery');
  const reasonsSection = document.getElementById('reasonsSection');
  const revealSection = document.getElementById('revealSection');

  if(!sealBtn) return;

  sealBtn.addEventListener('click', (e) => {
    if(envelope.classList.contains('open')) return;

    const rect = sealBtn.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const size = Math.max(rect.width, rect.height) * 1.4;
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size/2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size/2) + 'px';
    sealBtn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 650);

    envelope.classList.add('open');
    envelopeHint.classList.add('faded');

    burstConfetti();

    setTimeout(() => {
      letterSection.classList.remove('hidden');
      journeySection.classList.remove('hidden');
      closingGallery.classList.remove('hidden');
      reasonsSection.classList.remove('hidden');
      revealSection.classList.remove('hidden');
      letterSection.scrollIntoView({ behavior:'smooth', block:'start' });

      revealStagger(closingGallery.querySelectorAll('.polaroid'), 180, 100);

      initScratchCard();
      initStars();
    }, 550);
  });
})();

// ---------- SCRATCH CARD ----------
function initScratchCard(){
  const wrap = document.getElementById('scratchWrap');
  const canvas = document.getElementById('scratchCanvas');
  const hint = document.getElementById('scratchHint');
  if(!wrap || !canvas || canvas.dataset.ready) return;
  canvas.dataset.ready = '1';

  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  function size(){
    const r = wrap.getBoundingClientRect();
    canvas.width = r.width * dpr;
    canvas.height = r.height * dpr;
    canvas.style.width = r.width + 'px';
    canvas.style.height = r.height + 'px';
    paint();
  }

  function paint(){
    const w = canvas.width, h = canvas.height;
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#7A2436');
    grad.addColorStop(1, '#B5502E');
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = 'rgba(246,239,228,.9)';
    ctx.font = (28*dpr) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎁', w/2, h/2 - 18*dpr);
    ctx.font = 'italic ' + (15*dpr) + 'px serif';
    ctx.fillText('rasca aquí', w/2, h/2 + 22*dpr);
  }

  size();
  window.addEventListener('resize', size);

  let drawing = false;
  let done = false;

  function radiusPx(){ return 26 * dpr; }

  function scratchAt(clientX, clientY){
    const r = canvas.getBoundingClientRect();
    const x = (clientX - r.left) * dpr;
    const y = (clientY - r.top) * dpr;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, radiusPx(), 0, Math.PI*2);
    ctx.fill();
  }

  function checkProgress(){
    const sampleW = 40, sampleH = 40;
    const off = document.createElement('canvas');
    off.width = sampleW; off.height = sampleH;
    const octx = off.getContext('2d');
    octx.drawImage(canvas, 0, 0, sampleW, sampleH);
    const data = octx.getImageData(0, 0, sampleW, sampleH).data;
    let transparent = 0;
    for(let i=3; i<data.length; i+=4){
      if(data[i] < 40) transparent++;
    }
    const pct = transparent / (sampleW*sampleH);
    if(pct > 0.5 && !done){
      done = true;
      clear();
    }
  }

  function clear(){
    canvas.classList.add('cleared');
    hint.classList.add('faded');
    burstConfetti(34);
    setTimeout(() => { canvas.style.display = 'none'; }, 650);
  }

  function pos(e){
    if(e.touches && e.touches[0]) return { x:e.touches[0].clientX, y:e.touches[0].clientY };
    return { x:e.clientX, y:e.clientY };
  }

  function start(e){
    if(done) return;
    drawing = true;
    const p = pos(e);
    scratchAt(p.x, p.y);
  }
  function moveHandler(e){
    if(!drawing || done) return;
    e.preventDefault();
    const p = pos(e);
    scratchAt(p.x, p.y);
    checkProgress();
  }
  function end(){ drawing = false; }

  canvas.addEventListener('mousedown', start);
  canvas.addEventListener('mousemove', moveHandler);
  window.addEventListener('mouseup', end);

  canvas.addEventListener('touchstart', start, { passive:true });
  canvas.addEventListener('touchmove', moveHandler, { passive:false });
  canvas.addEventListener('touchend', end);
}

// ---------- TWINKLING STARS ----------
function initStars(){
  const canvas = document.getElementById('starsCanvas');
  const section = document.getElementById('revealSection');
  if(!canvas || !section || canvas.dataset.ready) return;
  canvas.dataset.ready = '1';

  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let stars = [];

  function size(){
    const r = section.getBoundingClientRect();
    canvas.width = r.width * dpr;
    canvas.height = r.height * dpr;
    canvas.style.width = r.width + 'px';
    canvas.style.height = r.height + 'px';
    buildStars();
  }

  function buildStars(){
    const count = Math.round((canvas.width * canvas.height) / 26000);
    stars = [];
    for(let i=0; i<count; i++){
      stars.push({
        x: Math.random()*canvas.width,
        y: Math.random()*canvas.height,
        r: (0.6 + Math.random()*1.4) * dpr,
        phase: Math.random()*Math.PI*2,
        speed: 0.6 + Math.random()*1.2
      });
    }
  }

  function draw(t){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      const alpha = 0.25 + 0.55 * (0.5 + 0.5*Math.sin(t*0.001*s.speed + s.phase));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(217,164,65,' + alpha.toFixed(3) + ')';
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  size();
  window.addEventListener('resize', size);
  requestAnimationFrame(draw);
}
