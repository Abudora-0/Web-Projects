'use strict';

/* ══════════════════════════════════════════════════════════════
   NINE FIFTY-FOUR - script.js
   1) cursor spotlight        2) synthesized sfx + ambient tick
   3) clock motif             4) combination lock puzzle
   5) rooms: sort / filter / availability / book-this-room
   6) hall of fame            7) next-slot countdown (urgency)
   8) booking form: themed select / stepper / date picker,
      price estimator, gift toggle, case-file drawer
   9) cipher gate             10) footer year
   ══════════════════════════════════════════════════════════════ */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function isoOf(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/* reveal-on-scroll with a hard fallback (some renderers never fire IO) */
function revealOnScroll(list, { stagger = 80, fallback = 2200 } = {}) {
  const els = Array.from(list);
  if (!els.length) return;
  const show = (el) => el.classList.add('in-view');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach((el, i) => { el.style.transitionDelay = `${i * stagger}ms`; io.observe(el); });
    setTimeout(() => els.forEach(show), fallback);
  } else {
    els.forEach(show);
  }
}

/* ---------------------------------------------------------------
   1) Cursor spotlight - subtle, follows pointer, ignores touch
--------------------------------------------------------------- */
(function spotlight() {
  const root = document.documentElement;
  let raf = null;
  window.addEventListener('mousemove', (e) => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      const xPct = (e.clientX / window.innerWidth) * 100;
      const yPct = (e.clientY / window.innerHeight) * 100;
      root.style.setProperty('--spot-x', xPct + '%');
      root.style.setProperty('--spot-y', yPct + '%');
      raf = null;
    });
  });
})();

/* ---------------------------------------------------------------
   2) Tiny synthesized sound effects + optional ambient ticking
--------------------------------------------------------------- */
const SFX = (function sfx() {
  let ctx = null;
  let ambientTimer = null;

  function getCtx() {
    if (!ctx) {
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (err) {
        ctx = null;
      }
    }
    return ctx;
  }
  function tone(freq, duration, type, gainPeak, delay) {
    const ac = getCtx();
    if (!ac) return;
    if (ac.state === 'suspended') ac.resume();
    const t0 = ac.currentTime + (delay || 0);
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(gainPeak || 0.08, t0 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(gain).connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  }
  function ambientBeat() {
    tone(2200, 0.004, 'square', 0.014);
    tone(1300, 0.045, 'sine', 0.011, 0.004);
  }
  return {
    tick() { tone(720, 0.05, 'square', 0.045); },
    denied() { tone(160, 0.28, 'sawtooth', 0.07); tone(110, 0.32, 'sawtooth', 0.05, 0.05); },
    unlock() {
      tone(392, 0.14, 'triangle', 0.08, 0);
      tone(523, 0.14, 'triangle', 0.08, 0.12);
      tone(659, 0.22, 'triangle', 0.09, 0.24);
    },
    click() { tone(500, 0.04, 'square', 0.035); },
    chime() { tone(880, 0.12, 'triangle', 0.06, 0); tone(1174, 0.2, 'triangle', 0.06, 0.1); },
    ambient: {
      on() {
        const ac = getCtx();
        if (!ac || ambientTimer) return;
        if (ac.state === 'suspended') ac.resume();
        ambientBeat();
        ambientTimer = setInterval(ambientBeat, 1000);
      },
      stop() { if (ambientTimer) { clearInterval(ambientTimer); ambientTimer = null; } },
      get running() { return !!ambientTimer; }
    }
  };
})();

(function ambientToggle() {
  const btn = $('#ambientToggle');
  if (!btn) return;
  const label = btn.querySelector('.at-label');
  btn.addEventListener('click', () => {
    if (SFX.ambient.running) {
      SFX.ambient.stop();
      btn.setAttribute('aria-pressed', 'false');
      if (label) label.textContent = 'Ambient off';
    } else {
      SFX.ambient.on();
      btn.setAttribute('aria-pressed', 'true');
      if (label) label.textContent = 'Ambient on';
    }
  });
})();

/* ---------------------------------------------------------------
   3) Clock motif - real analog hands + generated tick marks
--------------------------------------------------------------- */
function polar(cx, cy, r, angleDeg) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function buildTicks(group, cx, cy, rOuter, count, majorEvery, majorClass, minorClass, majorInset, minorInset) {
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const angle = (360 / count) * i;
    const isMajor = i % majorEvery === 0;
    const inset = isMajor ? majorInset : minorInset;
    const p1 = polar(cx, cy, rOuter, angle);
    const p2 = polar(cx, cy, rOuter - inset, angle);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', p1.x.toFixed(2));
    line.setAttribute('y1', p1.y.toFixed(2));
    line.setAttribute('x2', p2.x.toFixed(2));
    line.setAttribute('y2', p2.y.toFixed(2));
    line.setAttribute('class', isMajor ? majorClass : minorClass);
    frag.appendChild(line);
  }
  group.appendChild(frag);
}

function initClockFace(svg, cx, cy, rOuter, style) {
  const group = svg.querySelector('.ticks');
  if (!group) return;
  if (style === 'mini') {
    buildTicks(group, cx, cy, rOuter, 12, 1, 'tick', 'tick', 3, 3);
  } else {
    buildTicks(group, cx, cy, rOuter, 60, 5, 'tick-major', 'tick-minor', 12, 6);
  }
}

function updateClockHands(svg, cx, cy) {
  const now = new Date();
  const h = now.getHours() % 12;
  const m = now.getMinutes();
  const s = now.getSeconds();
  const hourAngle = h * 30 + m * 0.5;
  const minuteAngle = m * 6 + s * 0.1;
  const secondAngle = s * 6;

  const origin = `${cx}px ${cy}px`;
  const hourEl = svg.querySelector('.hand-hour');
  const minEl = svg.querySelector('.hand-minute');
  const secEl = svg.querySelector('.hand-second');
  if (hourEl) { hourEl.style.transformOrigin = origin; hourEl.style.transform = `rotate(${hourAngle}deg)`; }
  if (minEl) { minEl.style.transformOrigin = origin; minEl.style.transform = `rotate(${minuteAngle}deg)`; }
  if (secEl) { secEl.style.transformOrigin = origin; secEl.style.transform = `rotate(${secondAngle}deg)`; }
}

(function clocks() {
  const clockDefs = [
    { el: document.getElementById('miniClock'), cx: 22, cy: 22, r: 20, style: 'mini' },
    { el: document.getElementById('miniClockFooter'), cx: 22, cy: 22, r: 20, style: 'mini' },
    { el: document.getElementById('caseClock'), cx: 100, cy: 100, r: 94, style: 'case' }
  ].filter((d) => d.el);

  clockDefs.forEach((d) => initClockFace(d.el, d.cx, d.cy, d.r, d.style));

  function tick() {
    clockDefs.forEach((d) => updateClockHands(d.el, d.cx, d.cy));
  }
  tick();
  setInterval(tick, 1000);
})();

/* ---------------------------------------------------------------
   Booking slot maths - shared by rooms, countdown, availability
--------------------------------------------------------------- */
const SLOT_HOURS = [10, 12, 14, 16, 18, 20];

function upcomingSlots(count, from = new Date()) {
  const slots = [];
  let cursor = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  let guard = 0;
  while (slots.length < count && guard++ < 40) {
    for (const h of SLOT_HOURS) {
      const c = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate(), h, 0, 0, 0);
      if (c.getTime() > from.getTime()) {
        slots.push(c);
        if (slots.length >= count) break;
      }
    }
    cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1);
  }
  return slots;
}

function slotLabel(d, now = new Date()) {
  const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const midnightNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const midnightD = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const days = Math.round((midnightD - midnightNow) / 86400000);
  if (days === 0) return `Today ${time}`;
  if (days === 1) return `Tomorrow ${time}`;
  return `${d.toLocaleDateString([], { weekday: 'short' })} ${time}`;
}

/* ---------------------------------------------------------------
   4) Combination lock puzzle
--------------------------------------------------------------- */
const LOCK = (function lockPuzzle() {
  const COMBINATION = [1, 9, 5, 4]; // the house opened its doors in 1954
  const current = [0, 0, 0, 0];

  const dialsHost = document.getElementById('dials');
  const lockRig = document.getElementById('lockRig');
  const statusEl = document.getElementById('lockStatus');
  const tryBtn = document.getElementById('tryBtn');
  const hintBtn = document.getElementById('hintBtn');
  const hintBox = document.getElementById('hintBox');
  const vault = document.getElementById('vault');

  const HINTS = [
    "The dial doesn't lie. Every good case starts with the year on the file.",
    'Check the masthead above - this house first opened its doors in a year. That year is your combination.',
    'Fine. Set the wheels to 1 · 9 · 5 · 4 and pull the lever.'
  ];
  let hintLevel = 0;

  let solved = false;
  const dialWindows = [];

  function buildDials() {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 4; i++) {
      const dial = document.createElement('div');
      dial.className = 'dial';
      dial.dataset.index = String(i);

      const upBtn = document.createElement('button');
      upBtn.type = 'button';
      upBtn.className = 'dial-btn up';
      upBtn.textContent = '▲';
      upBtn.setAttribute('aria-label', `Increase digit ${i + 1}`);
      upBtn.tabIndex = -1;

      const win = document.createElement('div');
      win.className = 'dial-window';
      win.textContent = '0';
      win.tabIndex = 0;
      win.setAttribute('role', 'spinbutton');
      win.setAttribute('aria-label', `Combination digit ${i + 1} of 4`);
      win.setAttribute('aria-valuemin', '0');
      win.setAttribute('aria-valuemax', '9');
      win.setAttribute('aria-valuenow', '0');

      const downBtn = document.createElement('button');
      downBtn.type = 'button';
      downBtn.className = 'dial-btn down';
      downBtn.textContent = '▼';
      downBtn.setAttribute('aria-label', `Decrease digit ${i + 1}`);
      downBtn.tabIndex = -1;

      upBtn.addEventListener('click', () => changeDigit(i, 1));
      downBtn.addEventListener('click', () => changeDigit(i, -1));
      win.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp' || e.key === 'Up') { e.preventDefault(); changeDigit(i, 1); }
        else if (e.key === 'ArrowDown' || e.key === 'Down') { e.preventDefault(); changeDigit(i, -1); }
        else if (e.key === 'Home') { e.preventDefault(); setDigit(i, 0); }
        else if (e.key === 'End') { e.preventDefault(); setDigit(i, 9); }
        else if (e.key === 'Enter') { e.preventDefault(); attempt(); }
      });

      dial.appendChild(upBtn);
      dial.appendChild(win);
      dial.appendChild(downBtn);
      frag.appendChild(dial);
      dialWindows.push({ dial, win });
    }
    dialsHost.appendChild(frag);
  }

  function setDigit(i, value) {
    current[i] = value;
    const { win, dial } = dialWindows[i];
    win.textContent = String(value);
    win.setAttribute('aria-valuenow', String(value));
    dial.classList.toggle('correct', value === COMBINATION[i]);
    SFX.tick();
    if (lockRig.classList.contains('denied')) {
      lockRig.classList.remove('denied');
      statusEl.classList.remove('bad');
    }
  }

  function changeDigit(i, delta) {
    if (solved) return;
    const next = (current[i] + delta + 10) % 10;
    setDigit(i, next);
  }

  function attempt() {
    if (solved) return;
    const isMatch = current.every((v, i) => v === COMBINATION[i]);
    if (isMatch) succeed();
    else fail();
  }

  function fail() {
    lockRig.classList.add('shake', 'denied');
    statusEl.textContent = 'Denied. The tumblers didn’t catch - try again.';
    statusEl.classList.add('bad');
    statusEl.classList.remove('good');
    SFX.denied();
    window.setTimeout(() => lockRig.classList.remove('shake'), 450);
  }

  function succeed() {
    solved = true;
    lockRig.classList.remove('denied', 'shake');
    lockRig.classList.add('unlock-anim');
    statusEl.textContent = 'Access granted. The vault clicks open.';
    statusEl.classList.add('good');
    statusEl.classList.remove('bad');
    tryBtn.disabled = true;
    tryBtn.textContent = 'Unlocked';
    SFX.unlock();
    vault.classList.add('unlocked');
    document.getElementById('vaultSeal').setAttribute('aria-hidden', 'true');
    document.dispatchEvent(new CustomEvent('nf:unlocked'));
    window.setTimeout(() => {
      const rooms = document.getElementById('rooms');
      if (rooms) rooms.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 750);
  }

  function nextHint() {
    if (hintLevel >= HINTS.length) return;
    hintBox.textContent = HINTS[hintLevel];
    hintBox.classList.add('visible');
    hintLevel++;
    if (hintLevel >= HINTS.length) {
      hintBtn.textContent = 'No More Hints';
      hintBtn.disabled = true;
    } else {
      hintBtn.textContent = 'Another Hint';
    }
    SFX.click();
  }

  buildDials();
  tryBtn.addEventListener('click', attempt);
  hintBtn.addEventListener('click', nextHint);

  return { attempt };
})();

/* ---------------------------------------------------------------
   5) Rooms - data, sort/filter, availability, book-this-room
--------------------------------------------------------------- */
const ROOMS = [
  {
    id: 'cartographer',
    name: 'The Cartographer’s Study',
    difficulty: 1, duration: 45, price: 32, good: 'first-timers',
    teaser: 'A retired map-maker vanished mid-sentence. His last chart points somewhere in this study - if you can read it before the ink dries. Gentle introduction, great for first-timers and families.'
  },
  {
    id: 'pharmacist',
    name: 'The Pharmacist’s Ledger',
    difficulty: 2, duration: 60, price: 34, good: 'first-timers',
    teaser: 'Behind the counter of a shuttered apothecary, a ledger of poisons and antidotes hides a name nobody was meant to read. Steady hands and sharper eyes required.'
  },
  {
    id: 'vault12',
    name: 'Vault 12',
    difficulty: 4, duration: 75, price: 38, good: 'veterans',
    teaser: 'The bank closed in 1961 and the vault has been sealed ever since - except someone got in first, and left the door rigged behind them. Built for groups who’ve done this before.'
  },
  {
    id: 'bellhaven',
    name: 'Nightshift at Bellhaven',
    difficulty: 5, duration: 90, price: 42, good: 'veterans',
    teaser: 'The asylum’s night orderly never finished his final round. Neither will you, unless every lock, ledger and locked ward gives up its secret first. Our hardest case. No refunds on nerve.'
  }
];

function prefillBooking(detail) {
  document.dispatchEvent(new CustomEvent('nf:book', { detail: detail || {} }));
}

(function renderRooms() {
  const grid = document.getElementById('roomsGrid');
  const sortSel = document.getElementById('roomSort');
  const firstOnly = document.getElementById('roomFirstOnly');
  const roomSelect = document.getElementById('bkRoom');
  const logSelect = document.getElementById('logRoom');
  if (!grid) return;

  ROOMS.forEach((room) => {
    if (roomSelect) {
      const opt = document.createElement('option');
      opt.value = room.name;
      opt.textContent = `${room.name} - ${room.duration} min`;
      roomSelect.appendChild(opt);
    }
    if (logSelect) {
      const opt = document.createElement('option');
      opt.value = room.id;
      opt.textContent = room.name;
      logSelect.appendChild(opt);
    }
  });

  function ordered() {
    let list = ROOMS.slice();
    if (firstOnly && firstOnly.checked) list = list.filter((r) => r.good === 'first-timers');
    const mode = sortSel ? sortSel.value : 'difficulty';
    if (mode === 'duration') list.sort((a, b) => a.duration - b.duration);
    else if (mode === 'firsttimers') {
      list.sort((a, b) =>
        (a.good === 'first-timers' ? 0 : 1) - (b.good === 'first-timers' ? 0 : 1) || a.difficulty - b.difficulty);
    } else list.sort((a, b) => a.difficulty - b.difficulty);
    return list;
  }

  function draw() {
    const list = ordered();
    grid.innerHTML = '';
    if (!list.length) {
      grid.innerHTML = '<p class="rooms-empty">No rooms match that filter.</p>';
      return;
    }
    const now = new Date();
    list.forEach((room) => {
      const slots = upcomingSlots(3, now);
      const pips = Array.from({ length: 5 }, (_, i) =>
        `<span class="pip ${i < room.difficulty ? 'on' : ''}"></span>`).join('');
      const slotBtns = slots.map((s) =>
        `<button type="button" class="slot-pill" data-iso="${isoOf(s)}" data-room="${room.name}">${slotLabel(s, now)}</button>`
      ).join('');

      const card = document.createElement('article');
      card.className = 'room-card';
      card.dataset.room = room.id;
      card.innerHTML = `
        <div class="room-card-top">
          <h3 class="room-name">${room.name}</h3>
          <span class="room-duration">${room.duration} min</span>
        </div>
        <div class="room-diff">${pips}<span class="room-diff-label">Difficulty</span></div>
        <p class="room-teaser">${room.teaser}</p>
        <div class="room-meta">
          <span class="room-price">from $${room.price} <i>/ person</i></span>
          <span class="room-good">${room.good === 'first-timers' ? 'Good for first-timers' : 'For veterans'}</span>
        </div>
        <div class="room-slots" aria-label="Next available times">${slotBtns}</div>
        <div class="room-card-foot">
          <button type="button" class="btn ghost room-book" data-room="${room.name}">Book this room</button>
          <span>2-8 players</span>
        </div>
      `;
      grid.appendChild(card);
    });
    revealOnScroll(grid.querySelectorAll('.room-card'), { stagger: 90, fallback: 1800 });
  }

  grid.addEventListener('click', (e) => {
    const pill = e.target.closest('.slot-pill');
    const book = e.target.closest('.room-book');
    if (pill) { SFX.click(); prefillBooking({ room: pill.dataset.room, iso: pill.dataset.iso }); }
    else if (book) { SFX.click(); prefillBooking({ room: book.dataset.room }); }
  });
  if (sortSel) { sortSel.addEventListener('change', draw); enhanceSelect(sortSel); }
  if (firstOnly) firstOnly.addEventListener('change', draw);

  draw();
})();

/* ---------------------------------------------------------------
   6) Hall of fame - seeded records + your own runs (localStorage)
--------------------------------------------------------------- */
(function hallOfFame() {
  const gridEl = document.getElementById('hofGrid');
  const form = document.getElementById('hofForm');
  if (!gridEl || !form) return;

  const KEY = 'ninefiftyfour-times';
  const SEED = {
    cartographer: [['The Vesper Twins', 1122], ['K. Ndlovu + 3', 1265], ['Team Marlowe', 1458]],
    pharmacist: [['The Understudies', 1880], ['R. Okafor', 2015], ['Cold Open', 2233]],
    vault12: [['Nightjar', 2641], ['The Sixth Floor', 2955], ['H. Ashworth', 3190]],
    bellhaven: [['No Refunds on Nerve', 3720], ['The Last Round', 4088], ['Ward B', 4402]]
  };

  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } };
  const save = (a) => localStorage.setItem(KEY, JSON.stringify(a));
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.round(s % 60)).padStart(2, '0')}`;
  const roomName = (id) => (ROOMS.find((r) => r.id === id) || {}).name || id;

  function draw() {
    const mine = load();
    gridEl.innerHTML = '';
    ROOMS.forEach((room) => {
      const seeded = (SEED[room.id] || []).map(([name, seconds]) => ({ name, seconds, mine: false }));
      const personal = mine.filter((m) => m.room === room.id).map((m) => ({ name: m.name, seconds: m.seconds, mine: true }));
      const rows = seeded.concat(personal).sort((a, b) => a.seconds - b.seconds).slice(0, 5);

      const board = document.createElement('div');
      board.className = 'hof-room';
      board.innerHTML = `
        <h3 class="hof-room-name">${room.name}</h3>
        <ol class="hof-list">
          ${rows.map((r, i) => `
            <li class="hof-row${r.mine ? ' mine' : ''}">
              <span class="hof-rank">${i + 1}</span>
              <span class="hof-name">${r.name}${r.mine ? ' <em>you</em>' : ''}</span>
              <span class="hof-time">${fmt(r.seconds)}</span>
            </li>`).join('')}
        </ol>`;
      gridEl.appendChild(board);
    });
    revealOnScroll(gridEl.querySelectorAll('.hof-room'), { stagger: 80, fallback: 1800 });
  }

  function parseTime(str) {
    const m = String(str).trim().match(/^(\d{1,3}):([0-5]\d)$/);
    if (!m) return null;
    return Number(m[1]) * 60 + Number(m[2]);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const err = document.getElementById('err-log');
    const name = document.getElementById('logName').value.trim();
    const room = document.getElementById('logRoom').value;
    const seconds = parseTime(document.getElementById('logTime').value);
    err.textContent = '';

    if (name.length < 2) { err.textContent = 'Give the team a name.'; return; }
    if (!room) { err.textContent = 'Pick which room you escaped.'; return; }
    if (seconds === null) { err.textContent = 'Time must look like 42:15.'; return; }
    const cap = (ROOMS.find((r) => r.id === room) || {}).duration;
    if (cap && seconds > cap * 60) { err.textContent = `That room only runs ${cap} minutes.`; return; }

    const all = load();
    all.push({ room, name, seconds, at: Date.now() });
    save(all);
    form.reset();
    SFX.chime();
    err.textContent = '';
    draw();
    const row = gridEl.querySelector(`.hof-room:nth-child(${ROOMS.findIndex((r) => r.id === room) + 1}) .hof-row.mine`);
    if (row) row.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  draw();
})();

/* ---------------------------------------------------------------
   7) Countdown to next available booking slot (urgency states)
--------------------------------------------------------------- */
(function nextSlotCountdown() {
  const valueEl = document.getElementById('countdownValue');
  const captionEl = document.getElementById('countdownCaption');
  if (!valueEl) return;

  function render() {
    const now = new Date();
    const target = upcomingSlots(1, now)[0];
    const ms = Math.max(0, target.getTime() - now.getTime());
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;

    valueEl.innerHTML =
      `<span class="cd-seg"><b>${String(h).padStart(2, '0')}</b><i>hrs</i></span>` +
      `<span class="cd-seg"><b>${String(m).padStart(2, '0')}</b><i>min</i></span>` +
      `<span class="cd-seg"><b>${String(s).padStart(2, '0')}</b><i>sec</i></span>`;

    const mins = ms / 60000;
    valueEl.classList.toggle('warn', mins <= 60 && mins > 15);
    valueEl.classList.toggle('crit', mins <= 15);

    const dayLabel = target.toDateString() === now.toDateString() ? 'today' : 'tomorrow';
    const timeLabel = target.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    captionEl.textContent = mins <= 15
      ? `Last call - the ${timeLabel} slot locks in under fifteen minutes. Phone the desk to hold it.`
      : `Doors next open ${dayLabel} at ${timeLabel}. Walk-ins welcome if a table is free - booking ahead is safer.`;
  }

  render();
  setInterval(render, 1000);
})();

/* ---------------------------------------------------------------
   Themed controls - select / stepper / date picker
--------------------------------------------------------------- */
function enhanceSelect(sel) {
  if (!sel || sel.dataset.enhanced) return;
  sel.dataset.enhanced = '1';
  sel.classList.add('nf-native');

  const wrap = document.createElement('div');
  wrap.className = 'nf-sel';
  sel.parentNode.insertBefore(wrap, sel);
  wrap.appendChild(sel);

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'nf-sel-trigger';
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');

  const panel = document.createElement('div');
  panel.className = 'nf-sel-panel';
  panel.setAttribute('role', 'listbox');
  panel.hidden = true;

  wrap.appendChild(trigger);
  wrap.appendChild(panel);

  function rebuild() {
    panel.innerHTML = '';
    Array.from(sel.options).forEach((opt) => {
      const o = document.createElement('div');
      o.className = 'nf-sel-opt';
      o.textContent = opt.textContent;
      o.setAttribute('role', 'option');
      if (opt.disabled) o.setAttribute('aria-disabled', 'true');
      if (opt.value === sel.value && !opt.disabled) o.setAttribute('aria-selected', 'true');
      o.addEventListener('click', () => {
        if (opt.disabled) return;
        sel.value = opt.value;
        sel.dispatchEvent(new Event('change', { bubbles: true }));
        close();
      });
      panel.appendChild(o);
    });
  }
  function sync() {
    const opt = sel.options[sel.selectedIndex];
    trigger.textContent = opt ? opt.textContent : '';
    trigger.classList.toggle('empty', !sel.value);
    rebuild();
  }
  function open() { rebuild(); panel.hidden = false; trigger.setAttribute('aria-expanded', 'true'); }
  function close() { panel.hidden = true; trigger.setAttribute('aria-expanded', 'false'); }

  trigger.addEventListener('click', () => (panel.hidden ? open() : close()));
  document.addEventListener('click', (e) => { if (!wrap.contains(e.target)) close(); });
  sel.addEventListener('change', sync);
  sync();
}

function buildStepper(input) {
  if (!input || input.dataset.stepper) return;
  input.dataset.stepper = '1';
  input.classList.add('nf-native-num');

  const wrap = document.createElement('div');
  wrap.className = 'nf-stepper';
  input.parentNode.insertBefore(wrap, input);

  const min = input.min !== '' ? Number(input.min) : -Infinity;
  const max = input.max !== '' ? Number(input.max) : Infinity;

  const dec = document.createElement('button');
  dec.type = 'button'; dec.className = 'nf-step-btn'; dec.textContent = '−';
  dec.setAttribute('aria-label', 'Fewer');
  const inc = document.createElement('button');
  inc.type = 'button'; inc.className = 'nf-step-btn'; inc.textContent = '+';
  inc.setAttribute('aria-label', 'More');

  wrap.appendChild(dec);
  wrap.appendChild(input);
  wrap.appendChild(inc);

  function clamp(fire) {
    let v = Math.round(Number(input.value));
    if (!Number.isFinite(v)) v = Number.isFinite(min) ? min : 0;
    v = Math.max(min, Math.min(max, v));
    if (String(v) !== input.value) input.value = String(v);
    dec.disabled = v <= min;
    inc.disabled = v >= max;
    if (fire) input.dispatchEvent(new Event('change', { bubbles: true }));
  }
  function bump(d) {
    input.value = String((Number(input.value) || 0) + d);
    clamp(true);
  }
  dec.addEventListener('click', () => bump(-1));
  inc.addEventListener('click', () => bump(1));
  input.addEventListener('input', () => clamp(false));
  input.addEventListener('change', () => clamp(false));
  clamp(false);
}

function enhanceDate(input) {
  if (!input || input.dataset.enhanced) return;
  input.dataset.enhanced = '1';
  input.classList.add('nf-native');

  const wrap = document.createElement('div');
  wrap.className = 'nf-date';
  input.parentNode.insertBefore(wrap, input);
  wrap.appendChild(input);

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'nf-date-trigger';
  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.setAttribute('aria-expanded', 'false');

  const panel = document.createElement('div');
  panel.className = 'nf-date-panel';
  panel.hidden = true;

  wrap.appendChild(trigger);
  wrap.appendChild(panel);

  const today = new Date(); today.setHours(0, 0, 0, 0);
  let view = new Date(today.getFullYear(), today.getMonth(), 1);

  function selected() {
    if (!input.value) return null;
    const [y, m, d] = input.value.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  function sync() {
    const s = selected();
    trigger.textContent = s
      ? s.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
      : 'Pick a date on the calendar';
    trigger.classList.toggle('empty', !s);
  }
  function build() {
    const y = view.getFullYear();
    const m = view.getMonth();
    const first = new Date(y, m, 1);
    const startDow = first.getDay();
    const days = new Date(y, m + 1, 0).getDate();
    const sel = selected();

    let html = `<div class="nf-date-head">
        <button type="button" class="nf-date-nav" data-dir="-1" aria-label="Previous month">‹</button>
        <span>${first.toLocaleDateString([], { month: 'long', year: 'numeric' })}</span>
        <button type="button" class="nf-date-nav" data-dir="1" aria-label="Next month">›</button>
      </div><div class="nf-date-grid">`;
    ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach((d) => { html += `<span class="nf-date-dow">${d}</span>`; });
    for (let i = 0; i < startDow; i++) html += '<span></span>';
    for (let d = 1; d <= days; d++) {
      const cur = new Date(y, m, d);
      const past = cur < today;
      const isSel = sel && cur.getTime() === sel.getTime();
      html += `<button type="button" class="nf-date-day${isSel ? ' sel' : ''}" data-d="${d}"${past ? ' disabled' : ''}>${d}</button>`;
    }
    html += '</div>';
    panel.innerHTML = html;
  }
  function open() { build(); panel.hidden = false; trigger.setAttribute('aria-expanded', 'true'); }
  function close() { panel.hidden = true; trigger.setAttribute('aria-expanded', 'false'); }

  trigger.addEventListener('click', () => (panel.hidden ? open() : close()));
  panel.addEventListener('click', (e) => {
    const nav = e.target.closest('.nf-date-nav');
    if (nav) { view.setMonth(view.getMonth() + Number(nav.dataset.dir)); build(); return; }
    const day = e.target.closest('.nf-date-day');
    if (day && !day.disabled) {
      const picked = new Date(view.getFullYear(), view.getMonth(), Number(day.dataset.d));
      input.value = isoOf(picked);
      input.dispatchEvent(new Event('change', { bubbles: true }));
      close();
    }
  });
  document.addEventListener('click', (e) => { if (!wrap.contains(e.target)) close(); });
  input.addEventListener('change', sync);
  sync();
}

/* ---------------------------------------------------------------
   8) Booking form - validation, storage, drawer, price, gift
--------------------------------------------------------------- */
(function bookingForm() {
  const form = document.getElementById('bookingForm');
  if (!form) return;
  const result = document.getElementById('bookingResult');

  const STORAGE_KEY = 'ninefiftyfour-bookings';
  const LEGACY_KEYS = ['lockedroom-bookings'];

  const roomSel = document.getElementById('bkRoom');
  const partyInput = document.getElementById('bkParty');
  const dateInput = document.getElementById('bkDate');
  const giftInput = document.getElementById('bkGift');
  const priceEl = document.getElementById('priceEstimate');
  const viewBtn = document.getElementById('viewBookings');

  enhanceSelect(roomSel);
  buildStepper(partyInput);
  enhanceDate(dateInput);
  enhanceSelect(document.getElementById('logRoom'));

  const fields = {
    name: { input: document.getElementById('bkName'), error: document.getElementById('err-name') },
    email: { input: document.getElementById('bkEmail'), error: document.getElementById('err-email') },
    date: { input: dateInput, error: document.getElementById('err-date') },
    room: { input: roomSel, error: document.getElementById('err-room') },
    party: { input: partyInput, error: document.getElementById('err-party') }
  };

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function loadBookings() {
    for (const k of [STORAGE_KEY, ...LEGACY_KEYS]) {
      try {
        const v = JSON.parse(localStorage.getItem(k));
        if (Array.isArray(v)) return v;
      } catch (e) { /* ignore */ }
    }
    return [];
  }
  function saveBookings(a) { localStorage.setItem(STORAGE_KEY, JSON.stringify(a)); }

  /* migrate any legacy record set once */
  if (!localStorage.getItem(STORAGE_KEY)) {
    const legacy = loadBookings();
    if (legacy.length) saveBookings(legacy);
  }

  function clearErrors() {
    Object.values(fields).forEach((f) => { f.error.textContent = ''; f.input.style.borderColor = ''; });
  }
  function setError(key, message) {
    fields[key].error.textContent = message;
    fields[key].input.style.borderColor = 'var(--blood)';
  }
  function todayStr() { return isoOf(new Date()); }

  function roomFor(name) { return ROOMS.find((r) => r.name === name); }

  function updatePrice() {
    const room = roomFor(roomSel.value);
    const party = Number(partyInput.value);
    if (!room || !party) {
      priceEl.textContent = 'Pick a room to see the price.';
      return;
    }
    const total = room.price * party;
    priceEl.innerHTML =
      `${party} ${party === 1 ? 'person' : 'people'} &times; $${room.price} = <strong>$${total}</strong> ` +
      '<span>estimated, settled at the door</span>';
  }
  roomSel.addEventListener('change', updatePrice);
  partyInput.addEventListener('change', updatePrice);
  updatePrice();

  function validate() {
    clearErrors();
    let valid = true;

    const name = fields.name.input.value.trim();
    if (name.length < 2) { setError('name', 'We need a name for the file.'); valid = false; }

    const email = fields.email.input.value.trim();
    if (!EMAIL_RE.test(email)) { setError('email', 'That doesn’t look like a working address.'); valid = false; }

    const dateVal = fields.date.input.value;
    if (!dateVal) { setError('date', 'Pick a date on the calendar.'); valid = false; }
    else if (dateVal < todayStr()) { setError('date', 'That date has already passed.'); valid = false; }

    if (!fields.room.input.value) { setError('room', 'Every case needs a room.'); valid = false; }

    const partyVal = Number(fields.party.input.value);
    if (!Number.isInteger(partyVal) || partyVal < 2 || partyVal > 8) {
      setError('party', 'Parties run 2 to 8 people.');
      valid = false;
    }
    return valid;
  }

  function confirmationCode(prefix) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = prefix;
    for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validate()) {
      result.classList.remove('visible');
      return;
    }
    const isGift = giftInput.checked;
    const entry = {
      name: fields.name.input.value.trim(),
      email: fields.email.input.value.trim(),
      date: fields.date.input.value,
      room: fields.room.input.value,
      party: Number(fields.party.input.value),
      note: document.getElementById('bkNote').value.trim(),
      gift: isGift,
      confirmation: confirmationCode(isGift ? 'GIFT-' : '954-'),
      bookedAt: new Date().toISOString()
    };
    const all = loadBookings();
    all.push(entry);
    saveBookings(all);

    const prettyDate = new Date(entry.date + 'T00:00:00').toLocaleDateString([], {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const room = roomFor(entry.room);
    const est = room ? ` Estimated $${room.price * entry.party} at the door.` : '';

    result.innerHTML = isGift
      ? `<span class="stamp">Voucher Filed</span><br/>
         Confirmation <strong>${entry.confirmation}</strong>. We’ll email a printable voucher for
         <strong>${entry.party}</strong> in <strong>${entry.room}</strong> to ${entry.email}.
         The recipient books their own night.${est}`
      : `<span class="stamp">Case Filed</span><br/>
         Confirmation <strong>${entry.confirmation}</strong> for <strong>${entry.party}</strong> on
         <strong>${prettyDate}</strong> in <strong>${entry.room}</strong>.${est}<br/>
         We’ll hold the room in your name, ${entry.name.split(' ')[0]}. Details saved on this device.`;
    result.classList.add('visible');
    SFX.chime();

    form.reset();
    partyInput.value = '4';
    partyInput.dispatchEvent(new Event('change', { bubbles: true }));
    roomSel.dispatchEvent(new Event('change', { bubbles: true }));
    dateInput.dispatchEvent(new Event('change', { bubbles: true }));
    clearErrors();
    refreshCount();
  });

  /* ---- book-this-room / slot pills ---- */
  document.addEventListener('nf:book', (e) => {
    const { room, iso } = e.detail || {};
    if (room) {
      roomSel.value = room;
      roomSel.dispatchEvent(new Event('change', { bubbles: true }));
    }
    if (iso) {
      dateInput.value = iso;
      dateInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
    updatePrice();
    const target = document.getElementById('booking');
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const nameInput = document.getElementById('bkName');
    if (nameInput) setTimeout(() => nameInput.focus({ preventScroll: true }), 400);
  });

  /* ---- case-file drawer ---- */
  const drawer = document.createElement('div');
  drawer.className = 'nf-drawer';
  drawer.hidden = true;
  drawer.innerHTML = `
    <div class="nf-drawer-scrim" data-close></div>
    <aside class="nf-drawer-panel" role="dialog" aria-modal="true" aria-label="Your case files">
      <div class="nf-drawer-head">
        <h3 class="stencil">Your Case Files</h3>
        <button type="button" class="nf-drawer-x" data-close aria-label="Close">×</button>
      </div>
      <div class="nf-drawer-body" id="nfDrawerBody"></div>
    </aside>`;
  document.body.appendChild(drawer);
  const drawerBody = drawer.querySelector('#nfDrawerBody');

  function renderDrawer() {
    const all = loadBookings().slice().reverse();
    if (!all.length) {
      drawerBody.innerHTML = '<p class="nf-file-empty">Nothing filed yet. Book a session and it shows up here.</p>';
      return;
    }
    drawerBody.innerHTML = all.map((b) => {
      const idx = loadBookings().findIndex((x) => x.confirmation === b.confirmation);
      const d = new Date(b.date + 'T00:00:00').toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
      return `<article class="nf-file">
        <div class="nf-file-top">
          <span class="nf-file-code">${b.confirmation}</span>
          ${b.gift ? '<span class="nf-file-tag">Gift</span>' : ''}
        </div>
        <p class="nf-file-room">${b.room}</p>
        <p class="nf-file-meta">${b.gift ? 'Voucher' : d} · ${b.party} players</p>
        ${b.note ? `<p class="nf-file-note">${b.note}</p>` : ''}
        <button type="button" class="nf-file-del" data-i="${idx}">Discard file</button>
      </article>`;
    }).join('');
  }

  function refreshCount() {
    if (viewBtn) viewBtn.textContent = `Your Case Files (${loadBookings().length})`;
  }

  function openDrawer() { renderDrawer(); drawer.hidden = false; document.body.style.overflow = 'hidden'; }
  function closeDrawer() { drawer.hidden = true; document.body.style.overflow = ''; }

  if (viewBtn) viewBtn.addEventListener('click', openDrawer);
  drawer.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) { closeDrawer(); return; }
    const del = e.target.closest('.nf-file-del');
    if (del) {
      const i = Number(del.dataset.i);
      const all = loadBookings();
      if (i >= 0 && i < all.length) {
        all.splice(i, 1);
        saveBookings(all);
        renderDrawer();
        refreshCount();
      }
    }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !drawer.hidden) closeDrawer(); });

  refreshCount();
})();

/* ---------------------------------------------------------------
   9) Cipher gate - a second lock on the bonus section
--------------------------------------------------------------- */
(function cipherGate() {
  const gate = document.getElementById('cipherGate');
  if (!gate) return;
  const input = document.getElementById('cipherInput');
  const btn = document.getElementById('cipherBtn');
  const msg = document.getElementById('cipherMsg');
  const prize = document.getElementById('cipherPrize');

  const KEY = 'ninefiftyfour-cipher';
  const ANSWER = 'NINEFIFTYFOUR';
  const norm = (s) => s.toUpperCase().replace(/[^A-Z]/g, '');

  function unlock(fromStore) {
    prize.hidden = false;
    gate.classList.add('solved');
    input.disabled = true;
    btn.disabled = true;
    btn.textContent = 'Open';
    msg.textContent = fromStore ? '' : 'The door gives. Take the key.';
    if (!fromStore) SFX.unlock();
  }

  if (localStorage.getItem(KEY) === '1') unlock(true);

  function attempt() {
    if (norm(input.value) === ANSWER) {
      localStorage.setItem(KEY, '1');
      unlock(false);
    } else {
      msg.textContent = 'Not it. Read the numbers again.';
      gate.classList.add('shake');
      SFX.denied();
      setTimeout(() => gate.classList.remove('shake'), 450);
    }
  }
  btn.addEventListener('click', attempt);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); attempt(); } });
})();

/* ---------------------------------------------------------------
   10) Footer year
--------------------------------------------------------------- */
(function footerYear() {
  const y = document.getElementById('year');
  if (y) y.textContent = String(new Date().getFullYear());
})();
