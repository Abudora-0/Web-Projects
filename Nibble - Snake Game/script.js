/* ==================================================
   NIBBLE  |  script.js
   Nokia-LCD snake: modes, combos, timed bonus,
   swappable screen colour, local top-5, daily
   challenge, ghost of your best run.
   ================================================== */

'use strict';

// ── Canvas ────────────────────────────────────
const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');
const SIZE   = 500;
const GRID   = 20;
const CELL   = SIZE / GRID;           // 25px
canvas.width = canvas.height = SIZE;

// ── Audio ─────────────────────────────────────
const sfxFood = new Audio('food.mp3');
const sfxDie  = new Audio('gameover.mp3');
const sfxMove = new Audio('move.mp3');
const bgMusic = new Audio('music.mp3');
sfxFood.volume = 0.5; sfxDie.volume = 0.6; sfxMove.volume = 0.16; bgMusic.volume = 0.25;
bgMusic.loop = true;
let soundOn = true;
function play(a) { if (!soundOn) return; try { a.currentTime = 0; a.play().catch(() => {}); } catch (e) {} }

// ── Screen palettes ───────────────────────────
const SCREENS = {
  olive:   { board:'#9ead86', ink:'#2c3423', soft:'rgba(44,52,35,.5)',  glow:'rgba(44,52,35,.35)', grid:'rgba(44,52,35,.09)',  glint:'#9ead86', headHi:'#333d26', headLo:'#242c1a', wall:'#5c6647' },
  gameboy: { board:'#9bbc0f', ink:'#0f380f', soft:'rgba(15,56,15,.5)',  glow:'rgba(15,56,15,.35)', grid:'rgba(15,56,15,.10)',  glint:'#9bbc0f', headHi:'#1f5c1f', headLo:'#0f380f', wall:'#4a7a1f' },
  amber:   { board:'#241a06', ink:'#ffb641', soft:'rgba(255,182,65,.45)', glow:'rgba(255,182,65,.35)', grid:'rgba(255,182,65,.10)', glint:'#241a06', headHi:'#ffd08a', headLo:'#e8952a', wall:'#7a5a1c' },
  vfd:     { board:'#06131a', ink:'#4dd0e1', soft:'rgba(77,208,225,.4)', glow:'rgba(77,208,225,.35)', grid:'rgba(77,208,225,.09)', glint:'#06131a', headHi:'#9df3ff', headLo:'#2ba7b8', wall:'#1e5560' },
};

// ── Storage ───────────────────────────────────
const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  del(k)    { try { localStorage.removeItem(k); } catch (e) {} },
};

const MODES = ['classic', 'wrap', 'maze', 'daily'];
let settings = Object.assign({ screen: 'olive', ghost: true }, LS.get('nibble_settings', {}));
let mode = LS.get('nibble_mode', 'classic');
if (!MODES.includes(mode)) mode = 'classic';
let PAL = SCREENS[settings.screen] || SCREENS.olive;

const MODE_BLURB = {
  classic: "Hit a wall or yourself and it's over.",
  wrap:    "No walls - slide off one edge, appear on the other.",
  maze:    "Blocks on the board, and more each level. Learn the course.",
  daily:   "Everyone gets the same board today. One run, your best stands.",
};

// ── Seeded RNG (for daily + maze) ─────────────
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hashStr(s) { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); } return h >>> 0; }
function todayKey() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }

let rng = Math.random;          // swapped to a seeded generator in daily mode
function randCell() { return { x: Math.floor(rng() * GRID), y: Math.floor(rng() * GRID) }; }

// ── Constants ─────────────────────────────────
const MIN_SPEED = 7, MAX_SPEED = 18, SPEED_STEP = 5;
const SPECIAL_LIFE = 8000;
const COMBO_MS = 2600;

// ── State ─────────────────────────────────────
let state = 'start';           // start | playing | paused | dead
let snake = [], dir = { x: 1, y: 0 }, dirQueue = [];
let food = null, special = null;
let score = 0, level = 1, speed = MIN_SPEED;
let walls = [];                // maze cells: [{x,y}]
let wallSet = new Set();
let combo = 0, comboUntil = 0, lastEat = 0;
let particles = [], eatFlash = 0;
let lastTick = 0, rafId = null;
let snakeColors = [];
let runPath = [];              // this run's head path (for ghost)
let ghostPath = null, ghostIdx = 0;
let tickCount = 0;
let bestNow = 0;               // best score for the current mode

// ── DOM ───────────────────────────────────────
const $ = id => document.getElementById(id);
const scoreValEl = $('scoreVal'), bestValEl = $('bestVal'), levelValEl = $('levelVal'), lengthValEl = $('lengthVal');
const speedFill = $('speedFill');
const startScreen = $('startScreen'), pauseScreen = $('pauseScreen'), goScreen = $('gameoverScreen');
const goScoreEl = $('goScore'), goLevelEl = $('goLevel'), goLengthEl = $('goLength'), goEmojiEl = $('goEmoji');
const soundBtn = $('soundBtn'), soundIcon = $('soundIcon');
const modeBlurbEl = $('modeBlurb');

// combo pill (created in JS, lives over the canvas)
const comboPill = document.createElement('div');
comboPill.className = 'combo-pill hidden';
comboPill.innerHTML = '<span id="comboMult">x2</span><span class="combo-bar"><span id="comboBar"></span></span>';
canvas.parentElement.appendChild(comboPill);
const comboMultEl = $('comboMult'), comboBarEl = $('comboBar');

// ── Screen colour ─────────────────────────────
function applyScreen(name) {
  settings.screen = SCREENS[name] ? name : 'olive';
  PAL = SCREENS[settings.screen];
  document.documentElement.dataset.screen = settings.screen;
  LS.set('nibble_settings', settings);
  document.querySelectorAll('.swatch').forEach(s => s.classList.toggle('is-on', s.dataset.screen === settings.screen));
  if (state !== 'playing') drawIdle();
}

// ── Maze ──────────────────────────────────────
function buildMaze(lvl) {
  const gen = mulberry32(hashStr('nibble-maze') ^ (lvl * 2654435761));
  const cells = [];
  const taken = new Set();
  const safe = new Set();
  // keep the middle-left corridor clear (snake starts there heading right)
  for (let x = 5; x < 15; x++) for (let y = 8; y < 12; y++) safe.add(x + ',' + y);
  const clusters = Math.min(3 + lvl, 11);
  for (let c = 0; c < clusters; c++) {
    const horiz = gen() < 0.5;
    const len = 2 + Math.floor(gen() * 3);
    let x = 1 + Math.floor(gen() * (GRID - 2));
    let y = 1 + Math.floor(gen() * (GRID - 2));
    for (let i = 0; i < len; i++) {
      const key = x + ',' + y;
      if (x > 0 && x < GRID - 1 && y > 0 && y < GRID - 1 && !taken.has(key) && !safe.has(key)) {
        taken.add(key); cells.push({ x, y });
      }
      if (horiz) x++; else y++;
    }
  }
  return cells;
}
function setWalls(list) {
  walls = list.filter(w => !snake.some(s => s.x === w.x && s.y === w.y));
  wallSet = new Set(walls.map(w => w.x + ',' + w.y));
}

// ── Init ──────────────────────────────────────
function init() {
  // daily / maze use seeded randomness
  if (mode === 'daily') { rng = mulberry32(hashStr('nibble-' + todayKey())); }
  else                  { rng = Math.random; }

  snake = [{ x: 7, y: 10 }, { x: 6, y: 10 }, { x: 5, y: 10 }];
  dir = { x: 1, y: 0 };
  dirQueue = [];
  score = 0; level = 1; speed = MIN_SPEED;
  combo = 0; comboUntil = 0; lastEat = 0;
  particles = []; eatFlash = 0; special = null;
  tickCount = 0;
  runPath = [];

  setWalls(mode === 'maze' ? buildMaze(1) : []);

  // ghost of the best run in this mode
  ghostPath = null; ghostIdx = 0;
  if (settings.ghost && mode !== 'daily') {
    const g = LS.get('nibble_ghost_' + mode, null);
    if (g && Array.isArray(g.path) && g.path.length) ghostPath = g.path;
  }

  computeSnakeColors();
  spawnFood();
  updateUI();
  updateComboPill(performance.now());
}

// ── Food ──────────────────────────────────────
function occupied(p) {
  return snake.some(s => s.x === p.x && s.y === p.y) ||
         wallSet.has(p.x + ',' + p.y) ||
         (food && p.x === food.x && p.y === food.y) ||
         (special && p.x === special.x && p.y === special.y);
}
function spawnFood() {
  let p, guard = 0;
  do { p = randCell(); } while (occupied(p) && guard++ < 400);
  food = p;
}
function spawnSpecial() {
  if (special) return;
  let p, guard = 0;
  do { p = randCell(); } while (occupied(p) && guard++ < 400);
  special = { x: p.x, y: p.y, spawnTime: performance.now() };
}
function specialValue(now) {
  const remaining = Math.max(0, 1 - (now - special.spawnTime) / SPECIAL_LIFE);
  return Math.max(2, Math.round(2 + 8 * remaining));   // 10 -> 2
}

// ── Snake colours ─────────────────────────────
function bodyColor(t) {
  // subtle darkening head->tail, tinted to the ink
  const hi = PAL.headHi, lo = PAL.headLo;
  return t < 0.001 ? hi : mix(hi, lo, Math.min(1, 0.25 + t));
}
function mix(a, b, t) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const r = Math.round(((pa >> 16) & 255) * (1 - t) + ((pb >> 16) & 255) * t);
  const g = Math.round(((pa >> 8) & 255) * (1 - t) + ((pb >> 8) & 255) * t);
  const bl = Math.round((pa & 255) * (1 - t) + (pb & 255) * t);
  return 'rgb(' + r + ',' + g + ',' + bl + ')';
}
function computeSnakeColors() {
  const len = snake.length;
  snakeColors = snake.map((_, i) => bodyColor(i / Math.max(len - 1, 1)));
}

// ── Particles ─────────────────────────────────
function spawnParticles(gx, gy, count) {
  const cx = (gx + 0.5) * CELL, cy = (gy + 0.5) * CELL;
  for (let i = 0; i < count; i++) {
    const ang = rng() * Math.PI * 2, spd = rng() * 3.5 + 1.2;
    particles.push({ x: cx, y: cy, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
      r: rng() * 4 + 1.5, life: 1, decay: rng() * 0.032 + 0.016 });
  }
}
function stepParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx; p.y += p.vy; p.vx *= 0.92; p.vy *= 0.92; p.life -= p.decay;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

// ── Game tick ─────────────────────────────────
function tick(now) {
  if (special && now - special.spawnTime > SPECIAL_LIFE) special = null;

  if (dirQueue.length) dir = dirQueue.shift();
  if (dir.x === 0 && dir.y === 0) return;

  let hx = snake[0].x + dir.x, hy = snake[0].y + dir.y;

  if (mode === 'wrap') {
    hx = (hx + GRID) % GRID;
    hy = (hy + GRID) % GRID;
  } else if (hx < 0 || hx >= GRID || hy < 0 || hy >= GRID) {
    die(); return;
  }
  const head = { x: hx, y: hy };

  if (wallSet.has(hx + ',' + hy)) { die(); return; }
  if (snake.some((s, i) => i > 0 && s.x === hx && s.y === hy)) { die(); return; }

  let grew = false;
  const comboActive = now < comboUntil;

  if (food && hx === food.x && hy === food.y) {
    combo = comboActive ? combo + 1 : 1;
    comboUntil = now + COMBO_MS;
    lastEat = now;
    const mult = comboMult();
    score += 1 * mult;
    eatFlash = 6;
    play(sfxFood);
    spawnParticles(hx, hy, 12);
    spawnFood();
    grew = true;
    if (score % 10 < 3 && rng() < 0.32) spawnSpecial();
  } else if (special && hx === special.x && hy === special.y) {
    combo = comboActive ? combo + 1 : 1;
    comboUntil = now + COMBO_MS;
    lastEat = now;
    const mult = comboMult();
    score += specialValue(now) * mult;
    eatFlash = 12;
    play(sfxFood);
    spawnParticles(hx, hy, 22);
    special = null;
    grew = true;
  }

  snake.unshift(head);
  if (!grew) snake.pop();

  // ghost + run path
  runPath.push([hx, hy]);
  if (runPath.length > 5000) runPath.shift();
  ghostIdx++;

  // level & speed
  const newLevel = Math.floor(score / SPEED_STEP) + 1;
  if (newLevel !== level) {
    level = newLevel;
    speed = Math.min(MIN_SPEED + level - 1, MAX_SPEED);
    if (mode === 'maze') setWalls(buildMaze(level));
  }

  if (score > bestNow) { bestNow = score; bestValEl.textContent = bestNow; }

  computeSnakeColors();
  updateUI();
  tickCount++;
}

function comboMult() { return Math.min(1 + Math.floor((combo - 1) / 2), 5); }

// ── Die ───────────────────────────────────────
function die() {
  state = 'dead';
  stopLoop();
  play(sfxDie);
  bgMusic.pause();

  canvas.style.animation = 'none'; void canvas.offsetWidth; canvas.style.animation = 'shake .4s ease';

  goScoreEl.textContent = score;
  goLevelEl.textContent = level;
  goLengthEl.textContent = snake.length;
  const emojis = ['☠', '😵', '😵‍💫', '💥', '😤'];
  goEmojiEl.textContent = emojis[Math.floor(Math.random() * emojis.length)];

  maybeSubmitScore();

  startLoop();  // let particles finish
  setTimeout(() => {
    goScreen.classList.remove('hidden');
    setTimeout(stopLoop, 800);
  }, 480);
}

// ── High scores ───────────────────────────────
const hiEntry = $('hiEntry'), hiInitials = $('hiInitials');
let pendingScore = null;

function loadScores() { return LS.get('nibble_scores_v1', {}); }
function modeScores(m) { const s = loadScores(); return Array.isArray(s[m]) ? s[m] : []; }

function qualifies(m, sc) {
  if (sc <= 0) return false;
  const list = modeScores(m);
  return list.length < 5 || sc > list[list.length - 1].score;
}

function maybeSubmitScore() {
  hiEntry.classList.add('hidden');
  pendingScore = null;

  // ghost: keep the path if this is the best run for the mode
  if (mode !== 'daily' && score > 0) {
    const g = LS.get('nibble_ghost_' + mode, null);
    if (!g || score > g.score) LS.set('nibble_ghost_' + mode, { score, path: runPath.slice() });
  }

  if (mode === 'daily') {
    // daily keeps a single best for today, no initials
    const key = 'nibble_daily_' + todayKey();
    const prev = LS.get(key, 0);
    if (score > prev) {
      LS.set(key, score);
      const all = loadScores();
      all.daily = [{ name: todayKey().slice(5), score, len: snake.length, date: todayKey(), you: true }];
      LS.set('nibble_scores_v1', all);
      renderRecords('daily');
    }
    return;
  }

  if (qualifies(mode, score)) {
    pendingScore = score;
    hiInitials.value = LS.get('nibble_initials', 'AAA');
    hiEntry.classList.remove('hidden');
    setTimeout(() => hiInitials.focus(), 60);
  }
}

function submitScore(m, sc, name) {
  const all = loadScores();
  const list = Array.isArray(all[m]) ? all[m] : [];
  const entry = { name: (name || 'AAA').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3).padEnd(3, ' ').trim() || 'AAA',
                  score: sc, len: snake.length, date: todayKey(), you: true };
  list.forEach(e => delete e.you);
  list.push(entry);
  list.sort((a, b) => b.score - a.score);
  all[m] = list.slice(0, 5);
  LS.set('nibble_scores_v1', all);
  renderRecords(m);
}

hiEntry.addEventListener('submit', e => {
  e.preventDefault();
  if (pendingScore == null) return;
  const name = (hiInitials.value || 'AAA').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3) || 'AAA';
  LS.set('nibble_initials', name);
  submitScore(mode, pendingScore, name);
  pendingScore = null;
  hiEntry.classList.add('hidden');
  setRecordsTab(mode);
});
hiInitials.addEventListener('input', () => {
  hiInitials.value = hiInitials.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3);
});

// records board
const recordsList = $('recordsList'), recordsEmpty = $('recordsEmpty');
let recordsTab = MODES.includes(mode) ? mode : 'classic';

function renderRecords(m) {
  if (m !== recordsTab) return;
  const list = modeScores(m);
  recordsList.innerHTML = list.map(e =>
    '<li class="' + (e.you ? 'you' : '') + '">' +
      '<span class="rec-name">' + escapeHtml(e.name) + '</span>' +
      '<span class="rec-score">' + e.score + '</span>' +
      '<span class="rec-meta">len ' + (e.len || '-') + '</span>' +
    '</li>').join('');
  recordsEmpty.classList.toggle('hidden', list.length > 0);
}
function escapeHtml(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function setRecordsTab(m) {
  recordsTab = m;
  document.querySelectorAll('.rec-tab').forEach(t => t.classList.toggle('is-on', t.dataset.mode === m));
  renderRecords(m);
}
document.querySelectorAll('.rec-tab').forEach(t => t.addEventListener('click', () => setRecordsTab(t.dataset.mode)));

// ── UI ────────────────────────────────────────
function updateUI() {
  scoreValEl.textContent = score;
  levelValEl.textContent = level;
  lengthValEl.textContent = snake.length;
  const pct = ((speed - MIN_SPEED) / (MAX_SPEED - MIN_SPEED)) * 100;
  speedFill.style.width = Math.max(6, pct) + '%';
}
function updateComboPill(now) {
  const mult = comboMult();
  if (state === 'playing' && mult > 1 && now < comboUntil) {
    comboPill.classList.remove('hidden');
    comboMultEl.textContent = 'x' + mult;
    comboBarEl.style.width = Math.max(0, (comboUntil - now) / COMBO_MS * 100) + '%';
  } else {
    comboPill.classList.add('hidden');
    if (now >= comboUntil) combo = 0;
  }
}

// ── RAF ───────────────────────────────────────
function startLoop() { if (rafId) return; lastTick = performance.now(); rafId = requestAnimationFrame(loop); }
function stopLoop()  { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } }

function loop(now) {
  rafId = requestAnimationFrame(loop);
  if (state === 'playing') {
    const interval = 1000 / speed;
    if (now - lastTick >= interval) {
      lastTick = Math.max(lastTick + interval, now - interval);
      tick(now);
    }
  }
  updateComboPill(now);
  render(now);
}

// ── Render ────────────────────────────────────
function render(now) {
  ctx.clearRect(0, 0, SIZE, SIZE);
  drawBoard();
  if (walls.length) drawWalls();
  if (ghostPath) drawGhost();
  stepParticles();
  drawParticles();
  if (food) drawFood(now);
  if (special) drawSpecial(now);
  drawSnake();
  if (eatFlash > 0) {
    ctx.globalAlpha = eatFlash * 0.02;
    ctx.fillStyle = PAL.ink;
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.globalAlpha = 1;
    eatFlash--;
  }
}

function drawBoard() {
  ctx.fillStyle = PAL.board;
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.strokeStyle = PAL.grid;
  ctx.lineWidth = 0.5;
  for (let i = 1; i < GRID; i++) {
    ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, SIZE); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(SIZE, i * CELL); ctx.stroke();
  }
}

function drawWalls() {
  ctx.fillStyle = PAL.wall;
  for (const w of walls) {
    const x = w.x * CELL, y = w.y * CELL;
    ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2);
    ctx.fillStyle = PAL.soft;
    ctx.fillRect(x + 1, y + 1, CELL - 2, 3);
    ctx.fillStyle = PAL.wall;
  }
}

function drawGhost() {
  const p = ghostPath[ghostIdx];
  if (!p) return;
  ctx.strokeStyle = PAL.soft;
  ctx.lineWidth = 1.5;
  const x = p[0] * CELL, y = p[1] * CELL;
  ctx.strokeRect(x + 4, y + 4, CELL - 8, CELL - 8);
  // a couple of trailing dots
  for (let k = 1; k <= 3; k++) {
    const q = ghostPath[ghostIdx - k * 2];
    if (!q) break;
    ctx.globalAlpha = 0.25 - k * 0.06;
    ctx.fillStyle = PAL.ink;
    ctx.fillRect(q[0] * CELL + CELL / 2 - 1.5, q[1] * CELL + CELL / 2 - 1.5, 3, 3);
  }
  ctx.globalAlpha = 1;
}

function rrect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawFood(now) {
  const cx = food.x * CELL + CELL / 2, cy = food.y * CELL + CELL / 2;
  const pulse = (Math.sin(now * 0.005) + 1) / 2;
  ctx.save();
  ctx.shadowColor = PAL.glow; ctx.shadowBlur = 8 + pulse * 8;
  ctx.fillStyle = PAL.ink;
  ctx.beginPath(); ctx.arc(cx, cy, CELL * 0.37, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = PAL.soft;
  ctx.beginPath(); ctx.arc(cx - CELL * 0.1, cy - CELL * 0.1, CELL * 0.12, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = PAL.ink; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(cx + 1, cy - CELL * 0.37); ctx.lineTo(cx + 3, cy - CELL * 0.5); ctx.stroke();
  ctx.restore();
}

function drawSpecial(now) {
  const cx = special.x * CELL + CELL / 2, cy = special.y * CELL + CELL / 2;
  const pulse = (Math.sin(now * 0.008) + 1) / 2;
  const remaining = Math.max(0, 1 - (now - special.spawnTime) / SPECIAL_LIFE);
  ctx.save();
  ctx.shadowColor = PAL.glow; ctx.shadowBlur = 10 + pulse * 14;
  ctx.fillStyle = PAL.ink;
  ctx.beginPath(); ctx.arc(cx, cy, CELL * 0.34, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
  // spokes
  ctx.strokeStyle = PAL.glint; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + now * 0.0012;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * CELL * 0.34, cy + Math.sin(a) * CELL * 0.34);
    ctx.lineTo(cx + Math.cos(a) * CELL * 0.52, cy + Math.sin(a) * CELL * 0.52);
    ctx.stroke();
  }
  // countdown arc
  ctx.strokeStyle = PAL.soft; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, CELL * 0.48, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * remaining);
  ctx.stroke();
  // value
  ctx.fillStyle = PAL.glint;
  ctx.font = 'bold ' + Math.round(CELL * 0.42) + 'px ' + "'VT323', monospace";
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(String(specialValue(now)), cx, cy + 1);
  ctx.restore();
}

function drawSnake() {
  const pad = 1.5;
  for (let i = snake.length - 1; i >= 0; i--) {
    const seg = snake[i];
    const bx = seg.x * CELL, by = seg.y * CELL;
    const r = i === 0 ? CELL * 0.34 : CELL * 0.26;
    if (i === 0) {
      const g = ctx.createLinearGradient(bx, by, bx + CELL, by + CELL);
      g.addColorStop(0, PAL.headHi); g.addColorStop(1, PAL.headLo);
      ctx.fillStyle = g;
      ctx.shadowColor = PAL.glow; ctx.shadowBlur = 10;
    } else {
      ctx.fillStyle = snakeColors[i]; ctx.shadowBlur = 0;
    }
    rrect(bx + pad, by + pad, CELL - pad * 2, CELL - pad * 2, r);
    ctx.fill();
  }
  ctx.shadowBlur = 0;
  if (dir.x !== 0 || dir.y !== 0) drawEyes(snake[0]);
}

function drawEyes(head) {
  const bx = head.x * CELL, by = head.y * CELL;
  const er = CELL * 0.1, pr = CELL * 0.054, o = CELL * 0.27, c = CELL / 2;
  let e1, e2;
  if      (dir.x === 1)  { e1 = { x: bx + c + o * 0.6, y: by + c - o * 0.6 }; e2 = { x: bx + c + o * 0.6, y: by + c + o * 0.6 }; }
  else if (dir.x === -1) { e1 = { x: bx + c - o * 0.6, y: by + c - o * 0.6 }; e2 = { x: bx + c - o * 0.6, y: by + c + o * 0.6 }; }
  else if (dir.y === -1) { e1 = { x: bx + c - o * 0.6, y: by + c - o * 0.6 }; e2 = { x: bx + c + o * 0.6, y: by + c - o * 0.6 }; }
  else                   { e1 = { x: bx + c - o * 0.6, y: by + c + o * 0.6 }; e2 = { x: bx + c + o * 0.6, y: by + c + o * 0.6 }; }
  ctx.fillStyle = PAL.glint;
  ctx.beginPath(); ctx.arc(e1.x, e1.y, er, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(e2.x, e2.y, er, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = PAL.ink;
  ctx.beginPath(); ctx.arc(e1.x, e1.y, pr, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(e2.x, e2.y, pr, 0, Math.PI * 2); ctx.fill();
}

function drawParticles() {
  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = PAL.ink;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ── Idle board (start / quit) ─────────────────
function drawIdle() {
  ctx.clearRect(0, 0, SIZE, SIZE);
  drawBoard();
  if (mode === 'maze') { setWalls(buildMaze(1)); drawWalls(); }
}

// ── Input ─────────────────────────────────────
function setDir(dx, dy) {
  if (state === 'start') { startGame(); return; }
  if (state !== 'playing') return;
  const ref = dirQueue.length ? dirQueue[dirQueue.length - 1] : dir;
  if (dx !== 0 && ref.x !== 0) return;
  if (dy !== 0 && ref.y !== 0) return;
  if (ref.x === dx && ref.y === dy) return;
  if (dirQueue.length < 2) { dirQueue.push({ x: dx, y: dy }); play(sfxMove); }
}

document.addEventListener('keydown', e => {
  if (e.target === hiInitials) return;
  switch (e.key) {
    case 'ArrowUp': case 'w': case 'W': e.preventDefault(); setDir(0, -1); break;
    case 'ArrowDown': case 's': case 'S': e.preventDefault(); setDir(0, 1); break;
    case 'ArrowLeft': case 'a': case 'A': e.preventDefault(); setDir(-1, 0); break;
    case 'ArrowRight': case 'd': case 'D': e.preventDefault(); setDir(1, 0); break;
    case ' ': e.preventDefault(); state === 'start' ? startGame() : togglePause(); break;
    case 'p': case 'P': togglePause(); break;
    case 'Enter': if (state === 'start' || state === 'dead') startGame(); break;
  }
});

let touchStart = null;
canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  const t = e.touches[0];
  touchStart = { x: t.clientX, y: t.clientY };
}, { passive: false });
canvas.addEventListener('touchend', e => {
  if (!touchStart) return;
  const dx = e.changedTouches[0].clientX - touchStart.x;
  const dy = e.changedTouches[0].clientY - touchStart.y;
  if (Math.abs(dx) > Math.abs(dy)) { if (Math.abs(dx) > 16) setDir(dx > 0 ? 1 : -1, 0); }
  else { if (Math.abs(dy) > 16) setDir(0, dy > 0 ? 1 : -1); }
  touchStart = null;
}, { passive: true });

const DPAD = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
document.querySelectorAll('.dp-btn[data-dir]').forEach(btn => {
  const [dx, dy] = DPAD[btn.dataset.dir];
  const h = e => { e.preventDefault(); setDir(dx, dy); };
  btn.addEventListener('touchstart', h, { passive: false });
  btn.addEventListener('mousedown', h);
});

// ── Game flow ─────────────────────────────────
function startGame() {
  closeSettings();
  init();
  bestNow = topBestForMode(mode);
  bestValEl.textContent = bestNow;
  state = 'playing';
  startScreen.classList.add('hidden');
  goScreen.classList.add('hidden');
  pauseScreen.classList.add('hidden');
  hiEntry.classList.add('hidden');
  stopLoop(); startLoop();
  if (soundOn) bgMusic.play().catch(() => {});
}
function topBestForMode(m) {
  if (m === 'daily') return LS.get('nibble_daily_' + todayKey(), 0);
  const l = modeScores(m);
  return l.length ? l[0].score : 0;
}
function togglePause() {
  if (state === 'playing') {
    state = 'paused';
    pauseScreen.classList.remove('hidden');
    bgMusic.pause();
    comboPill.classList.add('hidden');
    stopLoop();
    render(performance.now());
  } else if (state === 'paused') {
    state = 'playing';
    pauseScreen.classList.add('hidden');
    if (soundOn) bgMusic.play().catch(() => {});
    startLoop();
  }
}
$('startBtn').addEventListener('click', startGame);
$('resumeBtn').addEventListener('click', togglePause);
$('quitBtn').addEventListener('click', () => {
  state = 'start';
  stopLoop();
  bgMusic.pause();
  comboPill.classList.add('hidden');
  pauseScreen.classList.add('hidden');
  startScreen.classList.remove('hidden');
  drawIdle();
});
$('playAgainBtn').addEventListener('click', startGame);

// ── Mode select (start screen) ────────────────
function setMode(m) {
  mode = m;
  LS.set('nibble_mode', m);
  document.querySelectorAll('.mode-chip').forEach(c => c.classList.toggle('is-on', c.dataset.mode === m));
  modeBlurbEl.textContent = MODE_BLURB[m];
  setRecordsTab(m);
  drawIdle();
}
document.querySelectorAll('.mode-chip').forEach(c => c.addEventListener('click', () => setMode(c.dataset.mode)));

// ── Sound ─────────────────────────────────────
soundBtn.addEventListener('click', () => {
  soundOn = !soundOn;
  soundBtn.classList.toggle('muted', !soundOn);
  soundIcon.className = soundOn ? 'fas fa-volume-high' : 'fas fa-volume-xmark';
  if (!soundOn) bgMusic.pause();
  else if (state === 'playing') bgMusic.play().catch(() => {});
});

// ── Settings ──────────────────────────────────
const settingsPanel = $('settingsPanel'), settingsBtn = $('settingsBtn'), ghostToggle = $('ghostToggle');
function closeSettings() { settingsPanel.classList.add('hidden'); settingsBtn.classList.remove('on'); }
settingsBtn.addEventListener('click', () => {
  const open = settingsPanel.classList.toggle('hidden');
  settingsBtn.classList.toggle('on', !open);
});
document.querySelectorAll('.swatch').forEach(s => s.addEventListener('click', () => applyScreen(s.dataset.screen)));
ghostToggle.addEventListener('click', () => {
  settings.ghost = !settings.ghost;
  ghostToggle.textContent = settings.ghost ? 'On' : 'Off';
  ghostToggle.setAttribute('aria-pressed', String(settings.ghost));
  LS.set('nibble_settings', settings);
});
$('wipeBtn').addEventListener('click', () => {
  ['nibble_scores_v1', 'nibble_initials'].forEach(LS.del);
  MODES.forEach(m => LS.del('nibble_ghost_' + m));
  LS.del('nibble_daily_' + todayKey());
  bestNow = 0; bestValEl.textContent = 0;
  renderRecords(recordsTab);
  $('wipeBtn').textContent = 'Done';
  setTimeout(() => { $('wipeBtn').textContent = 'Wipe'; }, 1500);
});

// ── Boot ──────────────────────────────────────
applyScreen(settings.screen);
ghostToggle.textContent = settings.ghost ? 'On' : 'Off';
ghostToggle.setAttribute('aria-pressed', String(settings.ghost));
setMode(mode);
bestNow = topBestForMode(mode);
bestValEl.textContent = bestNow;
lengthValEl.textContent = 3;
updateUI();
drawIdle();
