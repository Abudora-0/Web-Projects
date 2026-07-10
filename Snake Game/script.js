/* ══════════════════════════════════════════════
   DeSnake  |  script.js  (performance edition)
   ══════════════════════════════════════════════ */

'use strict';

// ── Canvas ────────────────────────────────────
const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');
const CANVAS_SIZE = 500;
const GRID   = 20;
canvas.width = canvas.height = CANVAS_SIZE;
const CELL   = CANVAS_SIZE / GRID; // 25px

// ── Audio ─────────────────────────────────────
const sfxFood = new Audio('food.mp3');
const sfxDie  = new Audio('gameover.mp3');
const sfxMove = new Audio('move.mp3');
const bgMusic = new Audio('music.mp3');
sfxFood.volume = 0.5;
sfxDie.volume  = 0.6;
sfxMove.volume = 0.18;
bgMusic.volume = 0.25;
bgMusic.loop   = true;
let soundOn    = true;

function play(sfx) {
  if (!soundOn) return;
  sfx.currentTime = 0;
  sfx.play().catch(() => {});
}

// ── Constants ─────────────────────────────────
const MIN_SPEED      = 7;      // ticks/sec at start
const MAX_SPEED      = 18;     // ticks/sec max
const SPEED_STEP     = 5;      // score points per level
const SPECIAL_CHANCE = 0.28;
const SPECIAL_LIFE   = 7000;   // ms

// ── Color helpers ─────────────────────────────
const C = {
  board:   '#9ead86',
  grid:    'rgba(44,52,35,.08)',
  food:    '#2c3423',
  foodGlow:'rgba(44,52,35,.3)',
  special: '#2c3423',
  specGlow:'rgba(44,52,35,.4)',
};

// Pre-computed HSL for snake body (avoids string construction each render)
function bodyColor(t) {
  // t: 0 (head) → 1 (tail)
  const s = Math.round(70 - t * 22);
  const l = Math.round(42 - t * 18);
  return `hsl(82,${Math.round(18 - t * 6)}%,${Math.round(17 + t * 9)}%)`;
}

// ── State ─────────────────────────────────────
let state     = 'start';  // 'start' | 'playing' | 'paused' | 'dead'
let snake     = [];
let dir       = { x: 1, y: 0 };
let dirQueue  = [];       // buffered inputs (max 2)
let food      = null;
let special   = null;     // { x, y, spawnTime }
let score     = 0;
let hiscore   = +localStorage.getItem('desnake_hi') || 0;
let level     = 1;
let speed     = MIN_SPEED;
let lastTick  = 0;        // timestamp of last game tick
let particles = [];
let eatFlash  = 0;
let rafId     = null;
let snakeColors = [];     // pre-computed per tick — reused every render frame

// ── DOM ───────────────────────────────────────
const scoreValEl  = document.getElementById('scoreVal');
const bestValEl   = document.getElementById('bestVal');
const levelValEl  = document.getElementById('levelVal');
const lengthValEl = document.getElementById('lengthVal');
const speedFill   = document.getElementById('speedFill');
const startScreen = document.getElementById('startScreen');
const pauseScreen = document.getElementById('pauseScreen');
const goScreen    = document.getElementById('gameoverScreen');
const preBestEl   = document.getElementById('preBest');
const goScoreEl   = document.getElementById('goScore');
const goLevelEl   = document.getElementById('goLevel');
const goLengthEl  = document.getElementById('goLength');
const goEmojiEl   = document.getElementById('goEmoji');
const newRecordEl = document.getElementById('newRecord');
const soundBtn    = document.getElementById('soundBtn');
const soundIcon   = document.getElementById('soundIcon');

// ── Init ──────────────────────────────────────
function init() {
  snake  = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
  dir    = { x: 1, y: 0 };
  dirQueue = [];
  score  = 0;
  level  = 1;
  speed  = MIN_SPEED;
  particles = [];
  eatFlash  = 0;
  special   = null;
  computeSnakeColors();
  spawnFood();
  updateUI();
}

// ── Food ──────────────────────────────────────
function spawnFood() {
  let p;
  do {
    p = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
  } while (snake.some(s => s.x === p.x && s.y === p.y));
  food = p;
}

function spawnSpecial() {
  if (special) return;
  let p;
  do {
    p = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
  } while (
    snake.some(s => s.x === p.x && s.y === p.y) ||
    (food && p.x === food.x && p.y === food.y)
  );
  special = { ...p, spawnTime: performance.now() };
}

// ── Snake colors (pre-compute once per tick) ──
function computeSnakeColors() {
  const len = snake.length;
  snakeColors = snake.map((_, i) => bodyColor(i / Math.max(len - 1, 1)));
}

// ── Particles ─────────────────────────────────
function spawnParticles(gx, gy, color, count) {
  const cx = (gx + 0.5) * CELL;
  const cy = (gy + 0.5) * CELL;
  for (let i = 0; i < count; i++) {
    const ang = Math.random() * Math.PI * 2;
    const spd = Math.random() * 3.5 + 1.2;
    particles.push({
      x: cx, y: cy,
      vx: Math.cos(ang) * spd,
      vy: Math.sin(ang) * spd,
      r: Math.random() * 4 + 1.5,
      color,
      life: 1,
      decay: Math.random() * 0.032 + 0.016,
    });
  }
}

function stepParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x  += p.vx;
    p.y  += p.vy;
    p.vx *= 0.92;
    p.vy *= 0.92;
    p.life -= p.decay;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

// ── Game tick (logic only) ────────────────────
function tick(now) {
  // Expire special food
  if (special && now - special.spawnTime > SPECIAL_LIFE) special = null;

  // Consume next buffered direction
  if (dirQueue.length > 0) dir = dirQueue.shift();

  // If still waiting for first input, don't move
  if (dir.x === 0 && dir.y === 0) return;

  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

  // Wall collision
  if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID) { die(); return; }
  // Self collision
  if (snake.some((s, i) => i > 0 && s.x === head.x && s.y === head.y)) { die(); return; }

  let grew = false;

  if (food && head.x === food.x && head.y === food.y) {
    play(sfxFood);
    score++;
    eatFlash = 6;
    spawnParticles(head.x, head.y, C.food, 12);
    spawnFood();
    grew = true;
    if (score % 10 === 0 && Math.random() < SPECIAL_CHANCE) spawnSpecial();
  } else if (special && head.x === special.x && head.y === special.y) {
    play(sfxFood);
    score += 3;
    eatFlash = 12;
    spawnParticles(head.x, head.y, C.special, 20);
    special = null;
    grew = true;
  }

  snake.unshift(head);
  if (!grew) snake.pop();

  // Level & speed
  const newLevel = Math.floor(score / SPEED_STEP) + 1;
  if (newLevel !== level) {
    level = newLevel;
    speed = Math.min(MIN_SPEED + level - 1, MAX_SPEED);
  }

  if (score > hiscore) {
    hiscore = score;
    localStorage.setItem('desnake_hi', hiscore);
  }

  computeSnakeColors(); // once per tick, not per render frame
  updateUI();
}

// ── Die ───────────────────────────────────────
function die() {
  state = 'dead';
  stopLoop();
  play(sfxDie);
  bgMusic.pause();

  canvas.style.animation = 'none';
  void canvas.offsetWidth;
  canvas.style.animation = 'shake .4s ease';

  goScoreEl.textContent  = score;
  goLevelEl.textContent  = level;
  goLengthEl.textContent = snake.length;
  newRecordEl.classList.toggle('hidden', score < hiscore || score === 0);
  const emojis = ['💀', '😵', '🤕', '😤', '💥'];
  goEmojiEl.textContent = emojis[Math.floor(Math.random() * emojis.length)];

  // Keep rendering for particle fade-out, then show overlay
  startLoop(); // let particles finish animating
  setTimeout(() => {
    goScreen.classList.remove('hidden');
    // After overlay shows we can stop rendering
    setTimeout(stopLoop, 800);
  }, 500);
}

// ── UI update ─────────────────────────────────
function updateUI() {
  scoreValEl.textContent  = score;
  bestValEl.textContent   = hiscore;
  levelValEl.textContent  = level;
  lengthValEl.textContent = snake.length;
  const pct = ((speed - MIN_SPEED) / (MAX_SPEED - MIN_SPEED)) * 100;
  speedFill.style.width = Math.max(6, pct) + '%';
}

// ── RAF management ────────────────────────────
function startLoop() {
  if (rafId) return;
  lastTick = performance.now();
  rafId = requestAnimationFrame(loop);
}

function stopLoop() {
  if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
}

// ── Main loop ─────────────────────────────────
function loop(now) {
  rafId = requestAnimationFrame(loop);

  if (state === 'playing') {
    const interval = 1000 / speed;
    // Drift-free: advance lastTick by fixed interval, capped to avoid spiral-of-death
    if (now - lastTick >= interval) {
      lastTick = Math.max(lastTick + interval, now - interval);
      tick(now);
    }
  }

  render(now);
}

// ── Render ────────────────────────────────────
function render(now) {
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  drawBoard();
  stepParticles();
  drawParticles();
  if (food)    drawFood(now);
  if (special) drawSpecial(now);
  drawSnake(now);

  if (eatFlash > 0) {
    ctx.fillStyle = `rgba(44,52,35,${eatFlash * 0.011})`;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    eatFlash--;
  }
}

// ── Board ─────────────────────────────────────
function drawBoard() {
  ctx.fillStyle = C.board;
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  ctx.strokeStyle = C.grid;
  ctx.lineWidth = 0.5;
  for (let i = 1; i < GRID; i++) {
    ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, CANVAS_SIZE); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(CANVAS_SIZE, i * CELL); ctx.stroke();
  }
}

// ── Rounded rect helper ───────────────────────
function rrect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y,     x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x,     y + h, r);
  ctx.arcTo(x,     y + h, x,     y,     r);
  ctx.arcTo(x,     y,     x + w, y,     r);
  ctx.closePath();
}

// ── Food ──────────────────────────────────────
function drawFood(now) {
  const { x, y } = food;
  const cx = x * CELL + CELL / 2;
  const cy = y * CELL + CELL / 2;
  const pulse = (Math.sin(now * 0.005) + 1) / 2;

  ctx.save();
  ctx.shadowColor = C.foodGlow;
  ctx.shadowBlur  = 8 + pulse * 8;
  ctx.fillStyle   = C.food;
  ctx.beginPath(); ctx.arc(cx, cy, CELL * 0.37, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur  = 0;
  // Highlight
  ctx.fillStyle = 'rgba(158,173,134,.55)';
  ctx.beginPath(); ctx.arc(cx - CELL*.1, cy - CELL*.1, CELL*.13, 0, Math.PI * 2); ctx.fill();
  // Stem
  ctx.strokeStyle = '#2c3423'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(cx + 1, cy - CELL*.37); ctx.lineTo(cx + 3, cy - CELL*.5); ctx.stroke();
  ctx.restore();
}

// ── Special food ──────────────────────────────
function drawSpecial(now) {
  const { x, y, spawnTime } = special;
  const cx = x * CELL + CELL / 2;
  const cy = y * CELL + CELL / 2;
  const pulse = (Math.sin(now * 0.008) + 1) / 2;
  const remaining = 1 - (now - spawnTime) / SPECIAL_LIFE;

  ctx.save();
  ctx.shadowColor = C.specGlow;
  ctx.shadowBlur  = 10 + pulse * 14;
  ctx.fillStyle   = C.special;
  ctx.beginPath(); ctx.arc(cx, cy, CELL * 0.38, 0, Math.PI * 2); ctx.fill();
  // Rotating spokes
  ctx.shadowBlur  = 0;
  ctx.strokeStyle = '#9ead86'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + now * 0.0012;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * CELL*.38, cy + Math.sin(a) * CELL*.38);
    ctx.lineTo(cx + Math.cos(a) * CELL*.56, cy + Math.sin(a) * CELL*.56);
    ctx.stroke();
  }
  // Highlight
  ctx.fillStyle = 'rgba(44,52,35,.5)';
  ctx.beginPath(); ctx.arc(cx - CELL*.1, cy - CELL*.1, CELL*.12, 0, Math.PI * 2); ctx.fill();
  // Countdown arc
  ctx.strokeStyle = 'rgba(44,52,35,.55)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(cx, cy, CELL*.47, -Math.PI/2, -Math.PI/2 + Math.PI*2*remaining);
  ctx.stroke();
  ctx.restore();
}

// ── Snake ─────────────────────────────────────
function drawSnake(now) {
  const pad = 1.5;

  // Draw body segments back-to-front (tail first, head last)
  for (let i = snake.length - 1; i >= 0; i--) {
    const seg = snake[i];
    const bx  = seg.x * CELL;
    const by  = seg.y * CELL;
    const r   = i === 0 ? CELL * 0.34 : CELL * 0.26;

    if (i === 0) {
      // Head: linear gradient (position-specific, must be created each frame)
      const g = ctx.createLinearGradient(bx, by, bx + CELL, by + CELL);
      g.addColorStop(0, '#333d26');
      g.addColorStop(1, '#242c1a');
      ctx.fillStyle   = g;
      ctx.shadowColor = 'rgba(44,52,35,.25)';
      ctx.shadowBlur  = 10;
    } else {
      ctx.fillStyle = snakeColors[i]; // pre-computed, no string construction here
      ctx.shadowBlur = 0;
    }

    rrect(bx + pad, by + pad, CELL - pad * 2, CELL - pad * 2, r);
    ctx.fill();
  }

  ctx.shadowBlur = 0;
  if (dir.x !== 0 || dir.y !== 0) drawEyes(snake[0]);
}

// ── Eyes ──────────────────────────────────────
function drawEyes(head) {
  const bx = head.x * CELL;
  const by = head.y * CELL;
  const er = CELL * 0.1;
  const pr = CELL * 0.054;
  const o  = CELL * 0.27;
  const c  = CELL / 2;

  let e1, e2;
  if      (dir.x ===  1) { e1={x:bx+c+o*.6,y:by+c-o*.6}; e2={x:bx+c+o*.6,y:by+c+o*.6}; }
  else if (dir.x === -1) { e1={x:bx+c-o*.6,y:by+c-o*.6}; e2={x:bx+c-o*.6,y:by+c+o*.6}; }
  else if (dir.y === -1) { e1={x:bx+c-o*.6,y:by+c-o*.6}; e2={x:bx+c+o*.6,y:by+c-o*.6}; }
  else                   { e1={x:bx+c-o*.6,y:by+c+o*.6}; e2={x:bx+c+o*.6,y:by+c+o*.6}; }

  ctx.fillStyle = '#9ead86';
  ctx.beginPath(); ctx.arc(e1.x, e1.y, er, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(e2.x, e2.y, er, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#2c3423';
  ctx.beginPath(); ctx.arc(e1.x, e1.y, pr, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(e2.x, e2.y, pr, 0, Math.PI*2); ctx.fill();
}

// ── Particles ─────────────────────────────────
function drawParticles() {
  for (const p of particles) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle   = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}

// ── Direction input ───────────────────────────
function setDir(dx, dy) {
  if (state === 'start') { startGame(); return; }
  if (state !== 'playing') return;

  // Check against tail of queue (or current dir if queue is empty)
  const ref = dirQueue.length > 0 ? dirQueue[dirQueue.length - 1] : dir;

  // No 180° reversal, no duplicate
  if (dx !== 0 && ref.x !== 0) return;
  if (dy !== 0 && ref.y !== 0) return;
  if (ref.x === dx && ref.y === dy) return;

  if (dirQueue.length < 2) dirQueue.push({ x: dx, y: dy });
  play(sfxMove);
}

// ── Keyboard ──────────────────────────────────
document.addEventListener('keydown', e => {
  switch (e.key) {
    case 'ArrowUp':    case 'w': case 'W': e.preventDefault(); setDir(0, -1); break;
    case 'ArrowDown':  case 's': case 'S': e.preventDefault(); setDir(0,  1); break;
    case 'ArrowLeft':  case 'a': case 'A': e.preventDefault(); setDir(-1, 0); break;
    case 'ArrowRight': case 'd': case 'D': e.preventDefault(); setDir(1,  0); break;
    case ' ':
      e.preventDefault();
      if (state === 'start') startGame();
      else togglePause();
      break;
    case 'p': case 'P': togglePause(); break;
    case 'Enter':
      if (state === 'start' || state === 'dead') startGame();
      break;
  }
});

// ── Touch swipe ───────────────────────────────
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
  if (Math.abs(dx) > Math.abs(dy)) { if (Math.abs(dx) > 18) setDir(dx > 0 ? 1 : -1, 0); }
  else                              { if (Math.abs(dy) > 18) setDir(0, dy > 0 ? 1 : -1); }
  touchStart = null;
}, { passive: true });

// ── D-pad ─────────────────────────────────────
const DPAD_MAP = { up:[0,-1], down:[0,1], left:[-1,0], right:[1,0] };
document.querySelectorAll('.dp-btn[data-dir]').forEach(btn => {
  const [dx, dy] = DPAD_MAP[btn.dataset.dir];
  const handler = (e) => { e.preventDefault(); setDir(dx, dy); };
  btn.addEventListener('touchstart', handler, { passive: false });
  btn.addEventListener('mousedown',  handler);
});

// ── Game flow ─────────────────────────────────
function startGame() {
  init();
  state = 'playing';
  startScreen.classList.add('hidden');
  goScreen.classList.add('hidden');
  pauseScreen.classList.add('hidden');
  stopLoop();
  startLoop();
  if (soundOn) bgMusic.play().catch(() => {});
}

function togglePause() {
  if (state === 'playing') {
    state = 'paused';
    pauseScreen.classList.remove('hidden');
    bgMusic.pause();
    stopLoop(); // no need to run RAF while paused
  } else if (state === 'paused') {
    state = 'playing';
    pauseScreen.classList.add('hidden');
    if (soundOn) bgMusic.play().catch(() => {});
    startLoop();
  }
}

// ── Buttons ───────────────────────────────────
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('resumeBtn').addEventListener('click', togglePause);
document.getElementById('quitBtn').addEventListener('click', () => {
  state = 'start';
  stopLoop();
  bgMusic.pause();
  pauseScreen.classList.add('hidden');
  startScreen.classList.remove('hidden');
  drawIdleBoard();
});
document.getElementById('playAgainBtn').addEventListener('click', startGame);

soundBtn.addEventListener('click', () => {
  soundOn = !soundOn;
  soundBtn.classList.toggle('muted', !soundOn);
  soundIcon.className = soundOn ? 'fas fa-volume-high' : 'fas fa-volume-xmark';
  if (!soundOn) bgMusic.pause();
  else if (state === 'playing') bgMusic.play().catch(() => {});
});

// ── Canvas shake ──────────────────────────────
const shakeCSS = document.createElement('style');
shakeCSS.textContent = `
@keyframes shake {
  0%,100% { transform: translate(0,0) rotate(0); }
  15%     { transform: translate(-5px, 4px) rotate(-1deg); }
  30%     { transform: translate( 5px,-3px) rotate( 1deg); }
  50%     { transform: translate(-4px, 5px); }
  70%     { transform: translate( 4px,-4px) rotate( 1deg); }
  85%     { transform: translate(-2px, 2px) rotate(-1deg); }
}`;
document.head.appendChild(shakeCSS);

// ── Idle board ────────────────────────────────
function drawIdleBoard() {
  ctx.fillStyle = C.board;
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  ctx.strokeStyle = C.grid;
  ctx.lineWidth = 0.5;
  for (let i = 1; i < GRID; i++) {
    ctx.beginPath(); ctx.moveTo(i*CELL,0); ctx.lineTo(i*CELL,CANVAS_SIZE); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,i*CELL); ctx.lineTo(CANVAS_SIZE,i*CELL); ctx.stroke();
  }
}

// ── Boot ──────────────────────────────────────
preBestEl.textContent = hiscore;
bestValEl.textContent = hiscore;
updateUI();
drawIdleBoard();
// RAF NOT started here — starts only when game begins
