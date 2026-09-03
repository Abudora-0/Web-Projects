/* ==========================================================
   TETROGRAD - terminal Tetris
   Vanilla canvas. 10x20 well, 7-bag, ghost, hold, lock delay,
   level gravity, high score. Pieces render as bracket pairs
   in amber phosphor. Square-wave SFX, subtle screen shake.
   ========================================================== */

const COLS = 10;
const ROWS = 20;
const HIDDEN = 2;
const TOTAL_ROWS = ROWS + HIDDEN;

const board = document.getElementById("board");
const bx = board.getContext("2d");
const nextCv = document.getElementById("next");
const nx = nextCv.getContext("2d");
const holdCv = document.getElementById("hold");
const hx = holdCv.getContext("2d");

const el = {
  overlay: document.getElementById("overlay"),
  overlayTitle: document.getElementById("overlayTitle"),
  overlayText: document.getElementById("overlayText"),
  overlayBtn: document.getElementById("overlayBtn"),
  lines: document.getElementById("lines"),
  score: document.getElementById("score"),
  level: document.getElementById("level"),
  best: document.getElementById("best"),
  pauseBtn: document.getElementById("pauseBtn"),
  restartBtn: document.getElementById("restartBtn"),
  bootLine: document.getElementById("bootLine"),
};

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const CELL = board.width / COLS;          // 30
const TERM_FONT = 'VT323, "Consolas", monospace';

const PHOS = "#ffb000";
const PHOS_HI = "#ffe08a";
const PHOS_DIM = "#8a5f06";
const PHOS_GHOST = "#4a3407";

/* piece shapes (colour field kept for the ghost/settled brightness only) */
const PIECES = {
  I: { cells: [[0,1],[1,1],[2,1],[3,1]], box: 4 },
  O: { cells: [[1,0],[2,0],[1,1],[2,1]], box: 4 },
  T: { cells: [[1,0],[0,1],[1,1],[2,1]], box: 3 },
  S: { cells: [[1,0],[2,0],[0,1],[1,1]], box: 3 },
  Z: { cells: [[0,0],[1,0],[1,1],[2,1]], box: 3 },
  J: { cells: [[0,0],[0,1],[1,1],[2,1]], box: 3 },
  L: { cells: [[2,0],[0,1],[1,1],[2,1]], box: 3 },
};
const KEYS = Object.keys(PIECES);

const BEST_KEY = "dryDock.best";
let bestScore = 0;
try { bestScore = +localStorage.getItem(BEST_KEY) || 0; } catch (_) {}

let soundOn = true;
try { const s = localStorage.getItem("tetrograd.sound"); if (s != null) soundOn = s === "1"; } catch (_) {}

let grid, bag, queue, current, holdPiece, canHold;
let score, lines, level, dropCounter, lockCounter, lockResets;
let running = false, paused = false, gameOver = false, raf = 0, lastTime = 0;
let shakeX = 0, shakeY = 0;
let fontReady = false;

/* ============ sound ============ */
let _ac = null;
function ac() { return _ac || (_ac = new (window.AudioContext || window.webkitAudioContext)()); }
function tone(freq, dur, type = "square", vol = 0.06, freqEnd = null) {
  if (!soundOn) return;
  try {
    const a = ac(), o = a.createOscillator(), g = a.createGain();
    o.connect(g); g.connect(a.destination);
    o.type = type;
    o.frequency.setValueAtTime(freq, a.currentTime);
    if (freqEnd) o.frequency.exponentialRampToValueAtTime(freqEnd, a.currentTime + dur);
    g.gain.setValueAtTime(vol, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + dur);
    o.start(); o.stop(a.currentTime + dur);
  } catch (_) {}
}
const SFX = {
  move: () => tone(220, 0.02, "square", 0.03),
  rotate: () => tone(360, 0.03, "square", 0.04),
  lock: () => tone(150, 0.05, "square", 0.05, 90),
  line: (n) => [0, 60, 120].slice(0, n === 4 ? 3 : 1).forEach((ms, i) =>
    setTimeout(() => tone(440 + i * 220, 0.08, "square", 0.06), ms)),
  tetris: () => [0, 80, 160, 260].forEach((ms, i) =>
    setTimeout(() => tone([523, 659, 784, 1047][i], 0.11, "square", 0.07), ms)),
  over: () => [0, 130, 260, 420].forEach((ms, i) =>
    setTimeout(() => tone([392, 330, 262, 175][i], 0.16, "sawtooth", 0.07), ms)),
};

/* ============ engine ============ */
function reset() {
  grid = Array.from({ length: TOTAL_ROWS }, () => Array(COLS).fill(0));
  bag = [];
  queue = [];
  for (let i = 0; i < 5; i++) queue.push(nextFromBag());
  holdPiece = null;
  canHold = true;
  score = 0; lines = 0; level = 1;
  dropCounter = 0; lockCounter = 0; lockResets = 0;
  gameOver = false;
  shakeX = shakeY = 0;
  spawn();
  updateStats(true);
}

function nextFromBag() {
  if (!bag.length) {
    bag = KEYS.slice();
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
  }
  return bag.pop();
}

function makePiece(type) {
  const def = PIECES[type];
  const m = Array.from({ length: def.box }, () => Array(def.box).fill(0));
  def.cells.forEach(([cx, cy]) => { m[cy][cx] = 1; });
  return { type, m, x: Math.floor((COLS - def.box) / 2), y: 0 };
}

function spawn() {
  const type = queue.shift();
  queue.push(nextFromBag());
  current = makePiece(type);
  current.y = HIDDEN - topOffset(current.m);
  lockCounter = 0; lockResets = 0;
  if (collides(current, 0, 0)) endGame();
  drawNext();
}
function topOffset(m) {
  for (let r = 0; r < m.length; r++) if (m[r].some(Boolean)) return r;
  return 0;
}

function rotate(m, dir) {
  const n = m.length;
  const out = Array.from({ length: n }, () => Array(n).fill(0));
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (dir > 0) out[c][n - 1 - r] = m[r][c];
      else out[n - 1 - r][c] = m[r][c];
    }
  }
  return out;
}

function collides(piece, offX, offY, matrix) {
  const m = matrix || piece.m;
  for (let r = 0; r < m.length; r++) {
    for (let c = 0; c < m[r].length; c++) {
      if (!m[r][c]) continue;
      const nx2 = piece.x + c + offX;
      const ny2 = piece.y + r + offY;
      if (nx2 < 0 || nx2 >= COLS || ny2 >= TOTAL_ROWS) return true;
      if (ny2 >= 0 && grid[ny2][nx2]) return true;
    }
  }
  return false;
}

function tryRotate(dir) {
  const rotated = rotate(current.m, dir);
  for (const k of [0, 1, -1, 2, -2]) {
    if (!collides(current, k, 0, rotated)) {
      current.m = rotated;
      current.x += k;
      bumpLock();
      SFX.rotate();
      return;
    }
  }
}

function move(dx) {
  if (!collides(current, dx, 0)) { current.x += dx; bumpLock(); SFX.move(); }
}

function softDrop() {
  if (!collides(current, 0, 1)) { current.y++; score += 1; dropCounter = 0; }
  else lockCounter = LOCK_DELAY;
  updateStats();
}

function hardDrop() {
  let dist = 0;
  while (!collides(current, 0, 1)) { current.y++; dist++; }
  score += dist * 2;
  lockPiece();
}

const LOCK_DELAY = 500;
function bumpLock() {
  if (collides(current, 0, 1) && lockResets < 15) { lockCounter = 0; lockResets++; }
}

function lockPiece() {
  const m = current.m;
  let aboveField = false;
  for (let r = 0; r < m.length; r++) {
    for (let c = 0; c < m[r].length; c++) {
      if (!m[r][c]) continue;
      const gy = current.y + r, gx = current.x + c;
      if (gy < 0) { aboveField = true; continue; }
      grid[gy][gx] = 1;
    }
  }
  if (aboveField) return endGame();
  SFX.lock();
  if (!reduceMotion) { shakeX = (Math.random() - 0.5) * 2.5; shakeY = 2; }
  clearTiers();
  updateStats();
  canHold = true;
  spawn();
}

function clearTiers() {
  let cleared = 0;
  for (let r = TOTAL_ROWS - 1; r >= 0; r--) {
    if (grid[r].every((v) => v)) {
      grid.splice(r, 1);
      grid.unshift(Array(COLS).fill(0));
      cleared++;
      r++;
    }
  }
  if (!cleared) return;
  lines += cleared;
  score += [0, 100, 300, 500, 800][cleared] * level;
  const newLevel = Math.floor(lines / 10) + 1;
  if (newLevel > level) level = newLevel;
  if (!reduceMotion) { shakeY = 3 + cleared * 1.6; }
  if (cleared === 4) SFX.tetris(); else SFX.line(cleared);
  flashTick(cleared);
  updateStats();
}

let tickMsg = "", tickTimer = 0;
function flashTick(n) {
  tickMsg = ["", "LINE", "DOUBLE", "TRIPLE", "TETRIS!"][n] || "";
  clearTimeout(tickTimer);
  tickTimer = setTimeout(() => { tickMsg = ""; }, 950);
}

function hold() {
  if (!canHold) return;
  const cur = current.type;
  if (holdPiece) queue.unshift(holdPiece);
  holdPiece = cur;
  canHold = false;
  tone(300, 0.03, "triangle", 0.04);
  spawn();
  drawHold();
}

function gravityInterval() {
  return Math.max(60, 800 - (level - 1) * 70);
}

function pad(n, w) { return String(n).padStart(w, "0"); }
function updateStats(silent) {
  const prev = el.score.textContent;
  el.lines.textContent = pad(lines, 3);
  el.score.textContent = pad(score, 6);
  el.level.textContent = pad(level, 2);
  if (score > bestScore) {
    bestScore = score;
    try { localStorage.setItem(BEST_KEY, String(bestScore)); } catch (_) {}
  }
  el.best.textContent = pad(bestScore, 6);
  if (!silent && !reduceMotion && prev !== el.score.textContent) {
    el.score.classList.remove("bump");
    void el.score.offsetWidth;
    el.score.classList.add("bump");
  }
}

/* ============ rendering ============ */
function bracket(ctx, x, y, size, mode) {
  const col = mode === "ghost" ? PHOS_GHOST : mode === "active" ? PHOS_HI : PHOS;
  ctx.fillStyle = col;
  ctx.font = `${Math.round(size * 1.2)}px ${TERM_FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (mode !== "ghost") {
    ctx.shadowColor = mode === "active" ? "rgba(255,200,90,0.75)" : "rgba(255,176,0,0.4)";
    ctx.shadowBlur = mode === "active" ? size * 0.45 : size * 0.22;
  }
  ctx.fillText("[]", x + size / 2, y + size / 2 + size * 0.06);
  ctx.shadowBlur = 0;
}

function draw() {
  bx.setTransform(1, 0, 0, 1, 0, 0);
  bx.fillStyle = "#0d0b06";
  bx.fillRect(0, 0, board.width, board.height);

  // decay + apply shake
  if (shakeX || shakeY) {
    bx.translate(shakeX, shakeY);
    shakeX *= 0.8; shakeY *= 0.8;
    if (Math.abs(shakeX) < 0.15) shakeX = 0;
    if (Math.abs(shakeY) < 0.15) shakeY = 0;
  }

  // faint well grid
  bx.strokeStyle = "rgba(255,176,0,0.06)";
  bx.lineWidth = 1;
  for (let c = 1; c < COLS; c++) {
    bx.beginPath(); bx.moveTo(c * CELL, 0); bx.lineTo(c * CELL, board.height); bx.stroke();
  }
  for (let r = 1; r < ROWS; r++) {
    bx.beginPath(); bx.moveTo(0, r * CELL); bx.lineTo(board.width, r * CELL); bx.stroke();
  }

  for (let r = HIDDEN; r < TOTAL_ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c]) bracket(bx, c * CELL, (r - HIDDEN) * CELL, CELL, "settled");
    }
  }

  if (current && running) {
    let gy = 0;
    while (!collides(current, 0, gy + 1)) gy++;
    drawPiece(bx, current, 0, gy, "ghost");
    drawPiece(bx, current, 0, 0, "active");
  }

  if (tickMsg) {
    bx.fillStyle = "#0d0b06";
    bx.fillRect(0, board.height / 2 - 22, board.width, 44);
    bx.fillStyle = PHOS_HI;
    bx.font = `34px ${TERM_FONT}`;
    bx.textAlign = "center";
    bx.textBaseline = "middle";
    bx.shadowColor = "rgba(255,176,0,0.6)";
    bx.shadowBlur = 12;
    bx.fillText(tickMsg, board.width / 2, board.height / 2);
    bx.shadowBlur = 0;
  }
}

function drawPiece(ctx, piece, offX, offY, mode) {
  const m = piece.m;
  for (let r = 0; r < m.length; r++) {
    for (let c = 0; c < m[r].length; c++) {
      if (!m[r][c]) continue;
      if (piece.y + r + offY < HIDDEN) continue;
      const gx = (piece.x + c + offX) * CELL;
      const gy = (piece.y + r + offY - HIDDEN) * CELL;
      bracket(ctx, gx, gy, CELL, mode);
    }
  }
}

function drawTray(ctx, cv, type, size) {
  const def = PIECES[type];
  const m = makePiece(type).m;
  // trim to occupied bounds for centring
  let minR = 9, maxR = -1, minC = 9, maxC = -1;
  m.forEach((row, r) => row.forEach((v, c) => {
    if (v) { minR = Math.min(minR, r); maxR = Math.max(maxR, r); minC = Math.min(minC, c); maxC = Math.max(maxC, c); }
  }));
  const w = (maxC - minC + 1) * size, h = (maxR - minR + 1) * size;
  const ox = (cv.width - w) / 2 - minC * size;
  const oy = (cv.height - h) / 2 - minR * size;
  for (let r = minR; r <= maxR; r++)
    for (let c = minC; c <= maxC; c++)
      if (m[r][c]) bracket(ctx, ox + c * size, oy + r * size, size, "settled");
}

function drawNext() {
  nx.clearRect(0, 0, nextCv.width, nextCv.height);
  const size = 16;
  queue.slice(0, 3).forEach((type, i) => {
    const oy = 8 + i * 66;
    const m = makePiece(type).m;
    let minC = 9, maxC = -1, minR = 9, maxR = -1;
    m.forEach((row, r) => row.forEach((v, c) => {
      if (v) { minR = Math.min(minR, r); maxR = Math.max(maxR, r); minC = Math.min(minC, c); maxC = Math.max(maxC, c); }
    }));
    const w = (maxC - minC + 1) * size;
    const ox = (nextCv.width - w) / 2 - minC * size;
    for (let r = minR; r <= maxR; r++)
      for (let c = minC; c <= maxC; c++)
        if (m[r][c]) bracket(nx, ox + c * size, oy + (r - minR) * size, size, "settled");
  });
}
function drawHold() {
  hx.clearRect(0, 0, holdCv.width, holdCv.height);
  if (holdPiece) drawTray(hx, holdCv, holdPiece, 16);
}

/* ============ loop ============ */
function loop(time) {
  raf = requestAnimationFrame(loop);
  if (!running || paused) { lastTime = time; if (!paused) draw(); return; }
  const dt = time - lastTime;
  lastTime = time;

  dropCounter += dt;
  if (dropCounter > gravityInterval()) {
    dropCounter = 0;
    if (!collides(current, 0, 1)) current.y++;
  }
  if (collides(current, 0, 1)) {
    lockCounter += dt;
    if (lockCounter >= LOCK_DELAY) lockPiece();
  } else {
    lockCounter = 0;
  }
  draw();
}

/* ============ state ============ */
function startGame() {
  reset();
  running = true;
  paused = false;
  el.overlay.hidden = true;
  el.pauseBtn.textContent = "[ PAUSE ]";
  lastTime = performance.now();
  if (!raf) raf = requestAnimationFrame(loop);
  drawNext();
  drawHold();
  draw();
}

function togglePause() {
  if (!running || gameOver) return;
  paused = !paused;
  el.pauseBtn.textContent = paused ? "[ RESUME ]" : "[ PAUSE ]";
  if (paused) {
    el.overlay.hidden = false;
    el.overlayTitle.textContent = "PAUSED";
    el.overlayText.textContent = "Press P to resume.";
    el.overlayBtn.textContent = "[ RESUME ]";
  } else {
    el.overlay.hidden = true;
    draw();
  }
}

function endGame() {
  gameOver = true;
  running = false;
  SFX.over();
  el.overlay.hidden = false;
  el.overlayTitle.textContent = "GAME OVER";
  el.overlayText.textContent = `SCORE ${pad(score, 6)} / LINES ${pad(lines, 3)}`;
  el.overlayBtn.textContent = "[ NEW GAME ]";
  updateStats(true);
}

/* ============ input ============ */
document.addEventListener("keydown", (e) => {
  if (["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp", " "].includes(e.key)) e.preventDefault();
  const k = e.key.toLowerCase();
  if (k === "m") {
    soundOn = !soundOn;
    try { localStorage.setItem("tetrograd.sound", soundOn ? "1" : "0"); } catch (_) {}
    if (soundOn) tone(660, 0.05, "square", 0.05);
    return;
  }
  if (!running || paused || gameOver) {
    if (k === "p") togglePause();
    if ((k === "enter" || k === " ") && !el.overlay.hidden) el.overlayBtn.click();
    return;
  }
  switch (e.key) {
    case "ArrowLeft": move(-1); break;
    case "ArrowRight": move(1); break;
    case "ArrowDown": softDrop(); break;
    case "ArrowUp": case "x": case "X": tryRotate(1); break;
    case "z": case "Z": tryRotate(-1); break;
    case " ": hardDrop(); break;
    case "c": case "C": hold(); break;
    case "p": case "P": togglePause(); break;
  }
  draw();
});

el.overlayBtn.addEventListener("click", () => {
  if (paused) { togglePause(); return; }
  startGame();
});
el.pauseBtn.addEventListener("click", togglePause);
el.restartBtn.addEventListener("click", startGame);

/* ============ boot sequence ============ */
function boot() {
  const lines2 = ["ELEKTRONIKA 60", "> LOAD TETROGRAD", "> SYS READY"];
  if (reduceMotion) { el.bootLine.textContent = lines2[lines2.length - 1]; return; }
  let li = 0, ci = 0;
  el.bootLine.textContent = "";
  const step = () => {
    const target = lines2[li];
    if (ci <= target.length) {
      el.bootLine.textContent = target.slice(0, ci++);
      setTimeout(step, 45);
    } else if (li < lines2.length - 1) {
      li++; ci = 0;
      setTimeout(step, 420);
    }
  };
  setTimeout(step, 200);
}

/* ============ boot ============ */
reset();
running = false;
boot();
el.best.textContent = pad(bestScore, 6);
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => { fontReady = true; draw(); drawNext(); drawHold(); });
}
draw();
drawNext();

/* a partly-stacked well for preview captures: ?demo */
if (/[?&]demo\b/.test(location.search)) {
  startGame();
  const plan = [[-5, 0], [-4, 0], [-2, 1], [0, 0], [2, 0], [3, 1], [4, 0], [-3, 0], [1, 0], [-1, 2]];
  let i = 0;
  const tick = () => {
    if (i >= plan.length || gameOver) { draw(); return; }
    const [dx, rot] = plan[i++];
    for (let r = 0; r < rot; r++) tryRotate(1);
    for (let s = 0; s < Math.abs(dx); s++) move(Math.sign(dx));
    hardDrop();
    draw();
    setTimeout(tick, 45);
  };
  setTimeout(tick, 500);
}
