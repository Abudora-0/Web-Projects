/* ═══════════════════════════════════════════════════════════════
   Umbral - script.js
   ═══════════════════════════════════════════════════════════════ */

// ── Starfield (parallax, twinkling, mouse + scroll reactive) ────
(function () {
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  let w, h, dpr;
  let layers = [];
  let mouseX = 0, mouseY = 0;     // target, normalized -1..1
  let curX = 0, curY = 0;         // eased current values
  let lastScrollY = window.scrollY;

  const LAYER_DEFS = [
    { count: 130, radius: [0.5, 1.2], speed: 0.6,  alpha: [0.25, 0.55], twinkle: 0.35 },
    { count: 70,  radius: [0.8, 1.8], speed: 1.3,  alpha: [0.35, 0.75], twinkle: 0.55 },
    { count: 34,  radius: [1.2, 2.4], speed: 2.4,  alpha: [0.5, 0.95],  twinkle: 0.8  },
  ];

  function rand(a, b) { return a + Math.random() * (b - a); }

  function buildLayers() {
    layers = LAYER_DEFS.map(def => ({
      def,
      stars: Array.from({ length: def.count }, () => ({
        x: rand(0, w),
        y: rand(0, h),
        r: rand(def.radius[0], def.radius[1]),
        baseAlpha: rand(def.alpha[0], def.alpha[1]),
        phase: rand(0, Math.PI * 2),
        twinkleSpeed: rand(0.6, 1.6),
      })),
    }));
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildLayers();
  }

  window.addEventListener('resize', resize, { passive: true });

  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / w) * 2 - 1;
    mouseY = (e.clientY / h) * 2 - 1;
  }, { passive: true });

  // Gentle drift on touch devices where mousemove rarely fires
  window.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    if (!t) return;
    mouseX = (t.clientX / w) * 2 - 1;
    mouseY = (t.clientY / h) * 2 - 1;
  }, { passive: true });

  let scrollOffset = 0;
  window.addEventListener('scroll', () => {
    const delta = window.scrollY - lastScrollY;
    lastScrollY = window.scrollY;
    scrollOffset += delta;
  }, { passive: true });

  let t = 0;
  function draw() {
    t += 0.016;
    // ease mouse toward target for a smooth parallax feel
    curX += (mouseX - curX) * 0.04;
    curY += (mouseY - curY) * 0.04;

    ctx.clearRect(0, 0, w, h);

    layers.forEach((layer, i) => {
      const depth = (i + 1) / layers.length; // farther layers move less
      const px = curX * 14 * depth;
      const py = curY * 10 * depth + (scrollOffset * 0.02 * depth * -1);

      layer.stars.forEach(s => {
        const twinkle = Math.sin(t * s.twinkleSpeed + s.phase) * layer.def.twinkle;
        const alpha = Math.max(0, Math.min(1, s.baseAlpha + twinkle * 0.3));
        let x = s.x + px;
        let y = s.y + py;
        // wrap so parallax/scroll never leaves visible gaps
        x = ((x % w) + w) % w;
        y = ((y % h) + h) % h;
        ctx.beginPath();
        ctx.arc(x, y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245, 247, 250, ${alpha.toFixed(3)})`;
        ctx.fill();
      });
    });

    // slowly relax accumulated scroll offset so it doesn't drift forever
    scrollOffset *= 0.98;

    requestAnimationFrame(draw);
  }

  resize();
  requestAnimationFrame(draw);
})();

// ── Header: scrolled state + mobile nav ──────────────────────────
(function () {
  const header = document.getElementById('siteHeader');
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');

  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();

// ── Scroll reveal ─────────────────────────────────────────────────
(function () {
  const items = document.querySelectorAll('.reveal');
  const showAll = () => items.forEach(el => el.classList.add('visible'));

  // only now opt into the hidden-then-animate styling; if any of this
  // script fails to run, .reveal content stays plainly visible
  document.documentElement.classList.add('js-reveal');

  if (!('IntersectionObserver' in window)) { showAll(); return; }

  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  items.forEach(el => revealObs.observe(el));

  // safety net for renderers that pause the observer's frame loop
  const sweep = () => document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) el.classList.add('visible');
  });
  window.addEventListener('scroll', sweep, { passive: true });
  setTimeout(sweep, 1500);
  setTimeout(showAll, 4000);
})();

// ── Hero countdown (real Date math, ticks every second) ──────────
(function () {
  // Geminid Base Camp: Atacama - peak night 14 December 2026, 02:00 local time
  const target = new Date('2026-12-14T02:00:00').getTime();
  const dEl = document.getElementById('cd-d');
  const hEl = document.getElementById('cd-h');
  const mEl = document.getElementById('cd-m');
  const sEl = document.getElementById('cd-s');
  const subEl = document.getElementById('countdownSub');
  if (!dEl) return;

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      dEl.textContent = hEl.textContent = mEl.textContent = sEl.textContent = '00';
      subEl.textContent = 'The Geminid peak has arrived over the Atacama - clear skies to the crew on site.';
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    dEl.textContent = pad(d);
    hEl.textContent = pad(h);
    mEl.textContent = pad(m);
    sEl.textContent = pad(s);
    setTimeout(tick, 1000);
  }
  tick();
})();

// ── Expedition card countdowns (days remaining, real Date math) ──
(function () {
  document.querySelectorAll('.expedition-card').forEach(card => {
    const target = new Date(card.dataset.date).getTime();
    const el = card.querySelector('.days-left');
    if (!el) return;
    const diff = target - Date.now();
    const days = Math.max(0, Math.ceil(diff / 86400000));
    el.textContent = days.toLocaleString();
  });
})();

// ── How It Works: expandable steps + timeline fill on scroll ─────
(function () {
  const steps = Array.from(document.querySelectorAll('.step'));
  const fill = document.getElementById('timelineFill');

  steps.forEach(step => {
    const head = step.querySelector('.step-head');
    head.addEventListener('click', () => {
      const isOpen = step.dataset.open === 'true';
      step.dataset.open = String(!isOpen);
      head.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  if (!fill || steps.length === 0) return;

  const stepObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('visible');
    });
    const visibleCount = steps.filter(s => s.classList.contains('visible')).length;
    fill.style.height = (visibleCount / steps.length) * 100 + '%';
  }, { threshold: 0.5 });

  steps.forEach(s => stepObs.observe(s));
})();

// ── Sky simulator: eclipse (SVG) / meteor + aurora (canvas) ─────────
(function () {
  const slider = document.getElementById('simSlider');
  const label = document.getElementById('simSliderLabel');
  const phaseEl = document.getElementById('readoutPhase');
  const detailEl = document.getElementById('readoutDetail');
  const tabs = Array.from(document.querySelectorAll('.sim-tab'));
  const eclipseSvg = document.getElementById('eclipseSvg');
  const canvas = document.getElementById('simCanvas');
  if (!slider || !canvas) return;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let mode = 'eclipse';
  let sliderVal = 0;

  /* ================= ECLIPSE (unchanged SVG) ================= */
  const SUN_CX = 200, SUN_R = 80, MOON_R = 82;
  const E_START = SUN_CX + SUN_R + MOON_R + 30;
  const E_END = SUN_CX - (SUN_R + MOON_R + 30);
  const moon = document.getElementById('moonDisc');
  const corona = document.getElementById('corona');

  function updateEclipse(v) {
    const pct = v / 100;
    const cx = E_START + (E_END - E_START) * pct;
    moon.setAttribute('cx', cx);
    const coverage = clamp(1 - Math.abs(cx - SUN_CX) / (SUN_R + MOON_R), 0, 1);
    const cp = Math.round(coverage * 100);
    corona.setAttribute('opacity', coverage > 0.9 ? String((coverage - 0.9) / 0.1) : '0');
    let phase, detail;
    if (cp === 0 && pct < 0.5) { phase = 'First Contact'; detail = 'Coverage 0% — the Moon has just touched the Sun’s edge.'; }
    else if (cp === 0 && pct >= 0.5) { phase = 'Fourth Contact'; detail = 'Coverage 0% — the Moon has cleared the Sun. Eclipse over.'; }
    else if (cp >= 99) { phase = 'Totality'; detail = 'Coverage 100% — the corona is out. This is the moment an eclipse expedition is built around.'; }
    else if (pct < 0.5) { phase = 'Partial — Moon advancing'; detail = `Coverage ${cp}% — the disc is being eaten from one side.`; }
    else { phase = 'Partial — Moon receding'; detail = `Coverage ${cp}% — totality has passed; the disc is re-emerging.`; }
    phaseEl.textContent = phase;
    detailEl.textContent = detail;
  }

  /* ================= CANVAS SETUP ================= */
  const ctx = canvas.getContext('2d');
  const W = 480;                       // logical drawing units
  const HORIZON = W * 0.82;
  const SCALE = canvas.width / W;
  ctx.scale(SCALE, SCALE);

  // shared star field
  const stars = Array.from({ length: 150 }, () => ({
    x: Math.random() * W,
    y: Math.random() * HORIZON,
    r: Math.random() * 1.1 + 0.25,
    a: Math.random() * 0.5 + 0.25,
    tw: Math.random() * Math.PI * 2,
    ts: Math.random() * 1.4 + 0.5
  }));

  // ridge silhouettes (two layers)
  function makeRidge(baseY, amp, seed) {
    const pts = [];
    for (let x = -20; x <= W + 20; x += 26) {
      pts.push([x, baseY + Math.sin(x * 0.03 + seed) * amp + Math.sin(x * 0.011 + seed * 2) * amp * 0.6]);
    }
    return pts;
  }
  const ridgeFar = makeRidge(HORIZON - 6, 10, 1.3);
  const ridgeNear = makeRidge(HORIZON + 14, 20, 4.1);

  function drawRidge(pts, fill) {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.lineTo(W + 20, W + 20); ctx.lineTo(-20, W + 20); ctx.closePath();
    ctx.fillStyle = fill; ctx.fill();
  }

  function drawStars(t, dim) {
    for (const s of stars) {
      const tw = 0.55 + 0.45 * Math.sin(t * s.ts + s.tw);
      ctx.globalAlpha = s.a * tw * (dim || 1);
      ctx.fillStyle = '#f5f7fa';
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  /* ================= METEOR ================= */
  const RADIANT_X = W * 0.66;
  let radiantY = 120, zhr = 0, spawnAcc = 0;
  const meteors = [];
  const trains = [];

  // radiant climbs steadily through the night, highest just before dawn
  function meteorAltitude(pct) { return Math.sin((0.06 + pct * 0.92) * Math.PI / 2); } // ~0.09 -> ~1

  function spawnMeteor() {
    // fly away from the radiant, biased downward
    const ang = Math.atan2(HORIZON - radiantY, (Math.random() - 0.5) * W) +
                (Math.random() - 0.5) * 0.55;
    const speed = Math.random() * 3.6 + 4;
    const big = Math.random() < 0.16;
    const d0 = Math.random() * 70 + 12;
    meteors.push({
      x: RADIANT_X + Math.cos(ang) * d0,
      y: radiantY + Math.sin(ang) * d0,
      vx: Math.cos(ang) * speed,
      vy: Math.sin(ang) * speed,
      len: (big ? 70 : 40) + Math.random() * 34,
      life: 1,
      decay: big ? 0.009 : 0.014 + Math.random() * 0.012,
      w: big ? 2.6 : 1.5,
      big
    });
  }

  function drawMeteorScene(t, dt) {
    // sky
    const g = ctx.createLinearGradient(0, 0, 0, HORIZON);
    g.addColorStop(0, '#04050b'); g.addColorStop(0.7, '#070d18'); g.addColorStop(1, '#0b1322');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, HORIZON);

    // milky-way smudge
    ctx.save();
    ctx.translate(W * 0.5, HORIZON * 0.42); ctx.rotate(-0.5);
    const mw = ctx.createLinearGradient(-W * 0.5, 0, W * 0.5, 0);
    mw.addColorStop(0, 'rgba(150,170,220,0)');
    mw.addColorStop(0.5, 'rgba(150,170,220,0.06)');
    mw.addColorStop(1, 'rgba(150,170,220,0)');
    ctx.fillStyle = mw; ctx.fillRect(-W * 0.5, -60, W, 120);
    ctx.restore();

    drawStars(t, 1);

    // radiant marker
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = '#ff7a33'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(RADIANT_X - 6, radiantY); ctx.lineTo(RADIANT_X + 6, radiantY);
    ctx.moveTo(RADIANT_X, radiantY - 6); ctx.lineTo(RADIANT_X, radiantY + 6);
    ctx.stroke();
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = '#ffb27a'; ctx.font = '10px "IBM Plex Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('radiant', RADIANT_X, radiantY - 12);
    ctx.globalAlpha = 1;

    // persistent trains
    for (let i = trains.length - 1; i >= 0; i--) {
      const tr = trains[i];
      tr.life -= dt * 0.9;
      if (tr.life <= 0) { trains.splice(i, 1); continue; }
      ctx.globalAlpha = tr.life * 0.5;
      ctx.strokeStyle = '#9fe8d0'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(tr.x1, tr.y1); ctx.lineTo(tr.x2, tr.y2); ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // spawn — tuned for a lively watch, not a literal naked-eye rate
    if (!reduceMotion && zhr > 0) {
      spawnAcc += dt * (zhr / 12);
      while (spawnAcc >= 1) { spawnMeteor(); spawnAcc -= 1; }
    }

    // meteors
    ctx.lineCap = 'round';
    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      if (!reduceMotion) { m.x += m.vx * dt * 60; m.y += m.vy * dt * 60; m.life -= m.decay * dt * 60; }
      if (m.life <= 0 || m.y > HORIZON || m.x < -40 || m.x > W + 40) {
        if (m.big && m.life <= 0) trains.push({ x1: m.x, y1: m.y, x2: m.x - m.vx * 6, y2: m.y - m.vy * 6, life: 1 });
        meteors.splice(i, 1); continue;
      }
      const sp = Math.hypot(m.vx, m.vy) || 1;
      const tx = m.x - m.vx / sp * m.len;
      const ty = m.y - m.vy / sp * m.len;
      const fade = Math.min(1, m.life * 1.6);
      const grd = ctx.createLinearGradient(m.x, m.y, tx, ty);
      grd.addColorStop(0, `rgba(255,250,240,${fade})`);
      grd.addColorStop(0.25, `rgba(255,224,190,${fade * 0.75})`);
      grd.addColorStop(1, 'rgba(255,210,170,0)');
      ctx.strokeStyle = grd; ctx.lineWidth = m.w;
      ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(tx, ty); ctx.stroke();
      // glowing head
      const hg = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.big ? 5 : 3);
      hg.addColorStop(0, `rgba(255,252,245,${fade})`);
      hg.addColorStop(1, 'rgba(255,240,220,0)');
      ctx.fillStyle = hg;
      ctx.beginPath(); ctx.arc(m.x, m.y, m.big ? 5 : 3, 0, 7); ctx.fill();
    }

    // ground
    drawRidge(ridgeFar, '#070b14');
    drawRidge(ridgeNear, '#04060c');
  }

  function updateMeteor(v) {
    const pct = v / 100;
    const alt = meteorAltitude(pct);
    radiantY = HORIZON - 20 - Math.max(0, alt) * (HORIZON - 70);
    zhr = Math.round(Math.max(0, alt) * 95);
    // seed in-flight meteors at varied positions so a first (or non-animating) frame is already full
    if (meteors.length < 4 && zhr > 4) {
      const n = Math.min(22, 5 + ((zhr / 6) | 0));
      for (let i = 0; i < n; i++) {
        spawnMeteor();
        const m = meteors[meteors.length - 1];
        const adv = Math.random() * 40;              // slide it partway along its path
        m.x += m.vx * adv; m.y += m.vy * adv;
        m.life = Math.random() * 0.75 + 0.2;
      }
    }
    const hrs = (pct * 7).toFixed(1);
    if (alt <= 0.04) {
      phaseEl.textContent = 'Dusk — radiant still low';
      detailEl.textContent = 'Only a handful of long, slow "earthgrazers" skimming the horizon. Worth staying up for what comes next.';
    } else if (pct < 0.55) {
      phaseEl.textContent = `${hrs} h after dusk — rate climbing`;
      detailEl.textContent = `Radiant about ${Math.round(alt * 88)}° up. Roughly ${zhr} an hour and rising as it climbs.`;
    } else {
      phaseEl.textContent = `${hrs} h after dusk — near peak`;
      detailEl.textContent = `Radiant high overhead, about ${zhr} an hour. The pre-dawn window Umbral plans the watch around.`;
    }
  }

  /* ================= AURORA ================= */
  const auroraLayers = [
    { speed: 0.05, phase: 0, amp: 34, base: 120, hgt: 150, hue: 150 },
    { speed: -0.08, phase: 2, amp: 46, base: 90, hgt: 190, hue: 155 },
    { speed: 0.11, phase: 4, amp: 30, base: 150, hgt: 130, hue: 145 },
    { speed: -0.06, phase: 1, amp: 55, base: 70, hgt: 220, hue: 160 },
    { speed: 0.09, phase: 3.4, amp: 40, base: 110, hgt: 170, hue: 150 }
  ];
  let kpNow = 3, auroraT = 0;

  function drawAuroraScene(t, dt) {
    auroraT += reduceMotion ? 0 : dt;
    const g = ctx.createLinearGradient(0, 0, 0, HORIZON + 40);
    g.addColorStop(0, '#03040a'); g.addColorStop(0.6, '#050c14'); g.addColorStop(1, '#07131a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, W);

    drawStars(t, clamp(1 - kpNow / 14, 0.35, 1));

    const nLayers = Math.round(clamp(1.6 + kpNow * 0.42, 2, 5));
    const drop = (kpNow / 9) * 90;
    const baseAlpha = 0.10 + (kpNow / 9) * 0.42;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let li = 0; li < nLayers; li++) {
      const L = auroraLayers[li];
      const topAt = x => L.base + drop
        + Math.sin(x * 0.012 + auroraT * L.speed + L.phase) * L.amp
        + Math.sin(x * 0.031 + auroraT * L.speed * 1.7) * L.amp * 0.35;

      const grad = ctx.createLinearGradient(0, L.base + drop - 30, 0, L.base + drop + L.hgt);
      grad.addColorStop(0, `hsla(${kpNow >= 6 ? 305 : L.hue}, 90%, 62%, 0)`);
      if (kpNow >= 6) grad.addColorStop(0.12, `hsla(300, 90%, 64%, ${baseAlpha * 0.5})`);
      grad.addColorStop(0.32, `hsla(${L.hue}, 92%, 58%, ${baseAlpha})`);
      grad.addColorStop(0.6, `hsla(${L.hue + 20}, 88%, 52%, ${baseAlpha * 0.7})`);
      grad.addColorStop(1, `hsla(190, 90%, 55%, 0)`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0, topAt(0));
      for (let x = 0; x <= W; x += 8) ctx.lineTo(x, topAt(x));
      for (let x = W; x >= 0; x -= 8) ctx.lineTo(x, topAt(x) + L.hgt);
      ctx.closePath();
      ctx.fill();

      // vertical ray texture
      ctx.globalAlpha = baseAlpha * 0.5;
      ctx.strokeStyle = `hsl(${L.hue}, 95%, 72%)`;
      ctx.lineWidth = 1;
      for (let x = (li * 13) % 24; x < W; x += 24) {
        const y0 = topAt(x);
        ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y0 + L.hgt * (0.5 + Math.random() * 0.4)); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    ctx.restore();

    drawRidge(ridgeFar, '#060b12');
    drawRidge(ridgeNear, '#03060b');
  }

  function updateAurora(v) {
    kpNow = Math.round(v / 100 * 9);
    const places = [
      'Barely a colourless glow on the northern horizon, even from the Arctic Circle.',
      'A faint green arch, low to the north — Tromsø, Abisko, Fairbanks.',
      'A steady green band overhead in northern Norway; a horizon glow from Scotland.',
      'Bright, slowly moving curtains overhead across Iceland and northern Finland.',
      'Active and structured — folds and rays, visible well into the northern UK and Canada.',
      'Storm-level. Curtains overhead as far south as the Baltic states and Oregon.',
      'Rare severe storm — aurora photographed from central Europe and the US Midwest.'
    ];
    phaseEl.textContent = `Kp ${kpNow} — ${kpNow >= 6 ? 'geomagnetic storm' : kpNow >= 4 ? 'active' : 'quiet'}`;
    detailEl.textContent = places[clamp(Math.round(kpNow / 9 * (places.length - 1)), 0, places.length - 1)];
  }

  /* ================= LOOP + MODE PLUMBING ================= */
  const LABELS = {
    eclipse: 'First contact → totality → last contact',
    meteor: 'Dusk → midnight → pre-dawn',
    aurora: 'Kp index — quiet → geomagnetic storm'
  };

  let raf = 0, last = 0, visible = true;
  function frame(now) {
    raf = 0;
    const dt = Math.min(0.05, (now - last) / 1000) || 0.016;
    last = now;
    const t = now / 1000;
    ctx.clearRect(0, 0, W, W);
    if (mode === 'meteor') drawMeteorScene(t, dt);
    else if (mode === 'aurora') drawAuroraScene(t, dt);
    if ((mode === 'meteor' || mode === 'aurora') && visible && !reduceMotion) raf = requestAnimationFrame(frame);
  }
  function kick() {
    if (raf || reduceMotion) { if (reduceMotion) frame(performance.now()); return; }
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function stop() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }

  function render(v) {
    sliderVal = v;
    if (mode === 'eclipse') updateEclipse(v);
    else if (mode === 'meteor') updateMeteor(v);
    else updateAurora(v);
    if (mode !== 'eclipse') { frame(performance.now()); kick(); }  // draw at least one frame
  }

  function setMode(next) {
    mode = next;
    stop();
    meteors.length = 0; trains.length = 0; spawnAcc = 0;
    tabs.forEach(tb => {
      const on = tb.dataset.mode === next;
      tb.classList.toggle('is-active', on);
      tb.setAttribute('aria-selected', String(on));
    });
    eclipseSvg.classList.toggle('is-hidden', next !== 'eclipse');
    canvas.classList.toggle('is-hidden', next === 'eclipse');
    label.textContent = LABELS[next];
    slider.value = next === 'aurora' ? 45 : next === 'meteor' ? 30 : 0;
    render(Number(slider.value));
  }

  tabs.forEach(tb => tb.addEventListener('click', () => setMode(tb.dataset.mode)));
  slider.addEventListener('input', () => render(Number(slider.value)));

  const simSection = document.getElementById('simulator');
  if (simSection && 'IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (!visible) stop(); else if (mode !== 'eclipse') kick();
    }, { threshold: 0 }).observe(simSection);
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else if (mode !== 'eclipse' && visible) kick();
  });

  updateEclipse(0);
})();

// ── Expedition detail modal ────────────────────────────────────────
(function () {
  const modal = document.getElementById('expeditionModal');
  if (!modal) return;
  const els = {
    img: document.getElementById('expModalImg'),
    type: document.getElementById('expModalType'),
    title: document.getElementById('expModalTitle'),
    meta: document.getElementById('expModalMeta'),
    seeing: document.getElementById('expModalSeeing'),
    itinerary: document.getElementById('expModalItinerary'),
    oddsBar: document.getElementById('expModalOddsBar'),
    odds: document.getElementById('expModalOdds'),
    oddsNote: document.getElementById('expModalOddsNote'),
    countdown: document.getElementById('expModalCountdown'),
    price: document.getElementById('expModalPrice'),
    seats: document.getElementById('expModalSeats')
  };
  let lastFocus = null;

  function open(card) {
    let data;
    try { data = JSON.parse(card.querySelector('.expedition-data').textContent); }
    catch (e) { return; }

    const img = card.querySelector('.expedition-photo img');
    els.img.src = img.src;
    els.img.alt = img.alt;
    els.type.textContent = card.querySelector('.expedition-type').textContent;
    els.title.textContent = card.querySelector('h3').textContent;
    els.meta.innerHTML = card.querySelector('.expedition-meta').innerHTML;
    els.seeing.textContent = data.seeing;
    els.itinerary.innerHTML = data.itinerary.map(s => `<li>${s}</li>`).join('');
    els.odds.textContent = data.odds;
    els.oddsNote.textContent = data.oddsNote;
    els.oddsBar.style.width = '0%';
    requestAnimationFrame(() => { els.oddsBar.style.width = data.odds + '%'; });
    els.price.textContent = data.price;
    els.seats.textContent = data.seats;

    const days = Math.max(0, Math.ceil((new Date(card.dataset.date).getTime() - Date.now()) / 86400000));
    els.countdown.textContent = days.toLocaleString() + ' days';

    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    modal.querySelector('.exp-modal-close').focus();
  }

  function close() {
    modal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  document.querySelectorAll('.expedition-card').forEach(card => {
    card.querySelector('.expedition-open').addEventListener('click', () => open(card));
  });
  modal.addEventListener('click', e => { if (e.target.hasAttribute('data-close')) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) close(); });
})();

// ── Newsletter / waitlist signup (client-side only) ───────────────
(function () {
  const form = document.getElementById('signupForm');
  const input = document.getElementById('emailInput');
  const feedback = document.getElementById('signupFeedback');
  if (!form) return;

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const STORAGE_KEY = 'umbral_signups';

  function getSignups() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveSignup(email) {
    try {
      const list = getSignups();
      if (!list.includes(email)) list.push(email);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      return true;
    } catch (e) {
      return false;
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = input.value.trim();

    if (!EMAIL_RE.test(email)) {
      input.classList.add('invalid');
      feedback.dataset.state = 'error';
      feedback.textContent = 'That doesn’t look like a valid email address - please check it and try again.';
      input.focus();
      return;
    }

    input.classList.remove('invalid');
    const existing = getSignups();
    const already = existing.includes(email);
    saveSignup(email);

    feedback.dataset.state = 'success';
    feedback.textContent = already
      ? 'You’re already on the manifest with this email - no need to sign up twice.'
      : 'Transmission received - you’re on the manifest. (Saved on this device; we’ll be in touch about the next departure.)';
    form.reset();
  });

  // Clear the error state as soon as the visitor starts fixing it
  input.addEventListener('input', () => {
    if (input.classList.contains('invalid')) {
      input.classList.remove('invalid');
      feedback.textContent = '';
      feedback.removeAttribute('data-state');
    }
  });
})();

// ── Footer year ────────────────────────────────────────────────────
document.getElementById('footerYear').textContent = new Date().getFullYear();
