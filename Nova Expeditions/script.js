/* ═══════════════════════════════════════════════════════════════
   Nova Expeditions - script.js
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

// ── Sky simulator: eclipse / meteor / aurora ───────────────────────
(function () {
  const slider = document.getElementById('simSlider');
  const label = document.getElementById('simSliderLabel');
  const phaseEl = document.getElementById('readoutPhase');
  const detailEl = document.getElementById('readoutDetail');
  const tabs = Array.from(document.querySelectorAll('.sim-tab'));
  const svgs = Array.from(document.querySelectorAll('.sim-stage-svg'));
  const SVGNS = 'http://www.w3.org/2000/svg';
  if (!slider) return;

  let mode = 'eclipse';
  let meteorTimer = null;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // scatter background stars into a <g> once
  function seedStars(g, n) {
    if (!g || g.childElementCount) return;
    for (let i = 0; i < n; i++) {
      const c = document.createElementNS(SVGNS, 'circle');
      c.setAttribute('cx', (Math.random() * 400).toFixed(1));
      c.setAttribute('cy', (Math.random() * 320).toFixed(1));
      c.setAttribute('r', (Math.random() * 1.1 + 0.3).toFixed(2));
      c.setAttribute('fill', '#f5f7fa');
      c.setAttribute('opacity', (Math.random() * 0.5 + 0.2).toFixed(2));
      g.appendChild(c);
    }
  }
  seedStars(document.getElementById('meteorStars'), 90);
  seedStars(document.getElementById('auroraStars'), 90);

  /* ---------- ECLIPSE ---------- */
  const SUN_CX = 200, SUN_R = 80, MOON_R = 82;
  const E_START = SUN_CX + SUN_R + MOON_R + 30;
  const E_END = SUN_CX - (SUN_R + MOON_R + 30);
  const moon = document.getElementById('moonDisc');
  const corona = document.getElementById('corona');

  function updateEclipse(v) {
    const pct = v / 100;
    const cx = E_START + (E_END - E_START) * pct;
    moon.setAttribute('cx', cx);
    const dist = Math.abs(cx - SUN_CX);
    let coverage = clamp(1 - dist / (SUN_R + MOON_R), 0, 1);
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

  /* ---------- METEOR ---------- */
  const radiantLabel = document.getElementById('radiantLabel');
  const radiantDot = document.getElementById('radiantDot');
  const streakLayer = document.getElementById('meteorStreaks');
  let currentZHR = 0;

  function meteorAltitude(pct) {
    // radiant climbs through the night, highest just before dawn
    return Math.sin(pct * Math.PI * 0.9 + 0.1); // 0..1-ish
  }

  function spawnStreak() {
    if (mode !== 'meteor' || !streakLayer) return;
    const rx = 285, ry = Number(radiantDot.getAttribute('cy'));
    const ang = (Math.random() * 0.7 + 0.15) * Math.PI; // fan downward-left
    const len = Math.random() * 70 + 45;
    const x2 = rx - Math.cos(ang) * len;
    const y2 = ry + Math.sin(ang) * len;
    const l = document.createElementNS(SVGNS, 'line');
    l.setAttribute('class', 'streak');
    l.setAttribute('x1', rx); l.setAttribute('y1', ry);
    l.setAttribute('x2', x2.toFixed(1)); l.setAttribute('y2', y2.toFixed(1));
    l.setAttribute('stroke-width', (Math.random() * 1 + 0.8).toFixed(1));
    l.style.setProperty('--len', len.toFixed(1));
    l.style.strokeDasharray = len.toFixed(1);
    streakLayer.appendChild(l);
    setTimeout(() => l.remove(), 700);
  }

  function scheduleMeteors() {
    clearInterval(meteorTimer);
    if (mode !== 'meteor' || currentZHR <= 0) return;
    const gap = clamp(2400 - currentZHR * 22, 200, 2400);
    meteorTimer = setInterval(spawnStreak, gap);
  }

  function updateMeteor(v) {
    const pct = v / 100;
    const alt = meteorAltitude(pct);
    const cy = 120 - alt * 78;              // radiant rises up the sky
    radiantDot.setAttribute('cy', cy);
    radiantLabel.setAttribute('y', cy - 16);
    currentZHR = Math.round(Math.max(0, alt) * 92);

    const hrs = (pct * 7).toFixed(1);
    let phase, detail;
    if (alt <= 0.02) { phase = 'Dusk — radiant below the horizon'; detail = 'Almost nothing yet. The shower’s radiant hasn’t risen; only grazers skimming the horizon.'; }
    else if (pct < 0.55) { phase = `${hrs} h after dusk — rate climbing`; detail = `Radiant ${Math.round(alt * 90)}° up. Roughly ${currentZHR} meteors/hour and rising as it climbs.`; }
    else { phase = `${hrs} h after dusk — near peak`; detail = `Radiant high overhead. About ${currentZHR} meteors/hour — the pre-dawn window Nova plans the watch around.`; }
    phaseEl.textContent = phase;
    detailEl.textContent = detail;
    scheduleMeteors();
  }

  /* ---------- AURORA ---------- */
  const curtains = document.getElementById('auroraCurtains');

  function updateAurora(v) {
    const kp = Math.round(v / 100 * 9);
    if (curtains) {
      curtains.setAttribute('opacity', (0.12 + kp / 9 * 0.88).toFixed(2));
      // group transform (SVG attr) drives Kp intensity; per-curtain sway is CSS, no conflict
      const s = 0.55 + kp / 9 * 0.7;
      curtains.setAttribute('transform', `translate(0 ${((1 - kp / 9) * 34).toFixed(0)}) scale(1 ${s.toFixed(2)})`);
    }
    const places = [
      'Barely a glow on the northern horizon from the Arctic Circle.',
      'A faint green arch, low to the north from Tromsø and Abisko.',
      'Steady overhead band from northern Norway; horizon glow from Scotland.',
      'Bright, moving curtains overhead across Iceland and northern Finland.',
      'Active, structured display — visible well into the northern UK and Canada.',
      'Storm-level. Curtains overhead as far south as the Baltic and Oregon.',
      'Rare major storm — aurora reported from central Europe and the US Midwest.'
    ];
    phaseEl.textContent = `Kp ${kp} — ${kp >= 6 ? 'geomagnetic storm' : kp >= 4 ? 'active' : 'quiet'}`;
    detailEl.textContent = places[clamp(Math.floor(kp * places.length / 9.5), 0, places.length - 1)];
  }

  /* ---------- mode plumbing ---------- */
  const LABELS = {
    eclipse: 'First contact → totality → last contact',
    meteor: 'Dusk → midnight → pre-dawn',
    aurora: 'Kp index — quiet → geomagnetic storm'
  };

  function render(v) {
    if (mode === 'eclipse') updateEclipse(v);
    else if (mode === 'meteor') updateMeteor(v);
    else updateAurora(v);
  }

  function setMode(next) {
    mode = next;
    clearInterval(meteorTimer);
    if (streakLayer) streakLayer.innerHTML = '';
    tabs.forEach(t => {
      const on = t.dataset.mode === next;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
    });
    svgs.forEach(s => s.classList.toggle('is-hidden', s.dataset.mode !== next));
    label.textContent = LABELS[next];
    slider.value = next === 'aurora' ? 33 : 0;
    render(Number(slider.value));
  }

  tabs.forEach(t => t.addEventListener('click', () => setMode(t.dataset.mode)));
  slider.addEventListener('input', () => render(Number(slider.value)));

  // pause the meteor spawner when the section scrolls out of view
  const simSection = document.getElementById('simulator');
  if (simSection && 'IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) clearInterval(meteorTimer);
        else if (mode === 'meteor') scheduleMeteors();
      });
    }, { threshold: 0 }).observe(simSection);
  }

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
  const STORAGE_KEY = 'novaExpeditions_signups';

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
