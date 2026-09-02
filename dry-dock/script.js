/* ==========================================================
   DRY DOCK - container-stacking Tetris
   Vanilla canvas. 10x20 field, 7-bag randomiser, ghost piece,
   hold, lock delay, tide-based gravity, tier clears.
   ========================================================== */

const COLS = 10;
const ROWS = 20;
const HIDDEN = 2;                 // spawn rows above the visible field
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
  trolley: document.getElementById("trolley"),
};

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const CELL = board.width / COLS;   // 30

/* container livery per piece */
const PIECES = {
  I: { color: "#3fb1d6", cells: [[0,1],[1,1],[2,1],[3,1]], box: 4 },
  O: { color: "#f2c94c", cells: [[1,0],[2,0],[1,1],[2,1]], box: 4 },
  T: { color: "#a06cd5", cells: [[1,0],[0,1],[1,1],[2,1]], box: 3 },
  S: { color: "#5fb96a", cells: [[1,0],[2,0],[0,1],[1,1]], box: 3 },
  Z: { color: "#e2483d", cells: [[0,0],[1,0],[1,1],[2,1]], box: 3 },
  J: { color: "#4f7fd6", cells: [[0,0],[0,1],[1,1],[2,1]], box: 3 },
  L: { color: "#f2a81e", cells: [[2,0],[0,1],[1,1],[2,1]], box: 3 },
};
const KEYS = Object.keys(PIECES);

const BEST_KEY = "dryDock.best";
let bestScore = 0;
try { bestScore = +localStorage.getItem(BEST_KEY) || 0; } catch (_) {}

let grid, bag, queue, current, holdPiece, canHold;
let score, lines, level, dropCounter, lockCounter, lockResets;
let running = false, paused = false, gameOver = false, raf = 0, lastTime = 0;

function reset() {
  grid = Array.from({ length: TOTAL_ROWS }, () => Array(COLS).fill(null));
  bag = [];
  queue = [];
  for (let i = 0; i < 5; i++) queue.push(nextFromBag());
  holdPiece = null;
  canHold = true;
  score = 0; lines = 0; level = 1;
  dropCounter = 0; lockCounter = 0; lockResets = 0;
  gameOver = false;
  spawn();
  updateStats();
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
  // build a box x box matrix
  const m = Array.from({ length: def.box }, () => Array(def.box).fill(0));
  def.cells.forEach(([cx, cy]) => { m[cy][cx] = 1; });
  return { type, color: def.color, m, x: Math.floor((COLS - def.box) / 2), y: 0 };
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
  const kicks = [0, 1, -1, 2, -2];
  for (const k of kicks) {
    if (!collides(current, k, 0, rotated)) {
      current.m = rotated;
      current.x += k;
      bumpLock();
      return;
    }
  }
}

function move(dx) {
  if (!collides(current, dx, 0)) { current.x += dx; bumpLock(); }
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
  if (collides(current, 0, 1) && lockResets < 15) {
    lockCounter = 0;
    lockResets++;
  }
}

function lockPiece() {
  const m = current.m;
  let aboveField = false;
  for (let r = 0; r < m.length; r++) {
    for (let c = 0; c < m[r].length; c++) {
      if (!m[r][c]) continue;
      const gy = current.y + r, gx = current.x + c;
      if (gy < 0) { aboveField = true; continue; }
      grid[gy][gx] = current.color;
    }
  }
  if (aboveField) return endGame();
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
      grid.unshift(Array(COLS).fill(null));
      cleared++;
      r++;
    }
  }
  if (!cleared) return;
  lines += cleared;
  const table = [0, 100, 300, 500, 800];
  score += table[cleared] * level;
  const newLevel = Math.floor(lines / 10) + 1;
  if (newLevel > level) level = newLevel;
  updateStats();
  flashOverlayTick(cleared);
}

let tickMsg = "";
let tickTimer = 0;
function flashOverlayTick(n) {
  tickMsg = n === 4 ? "Full ship sailed" : n + (n === 1 ? " tier shipped" : " tiers shipped");
  clearTimeout(tickTimer);
  tickTimer = setTimeout(() => { tickMsg = ""; }, 1100);
}

function hold() {
  if (!canHold) return;
  const cur = current.type;
  if (holdPiece) {
    queue.unshift(holdPiece);
  }
  holdPiece = cur;
  canHold = false;
  spawn();
  drawHold();
}

function gravityInterval() {
  // classic-ish curve, faster with the tide
  const g = Math.max(60, 800 - (level - 1) * 70);
  return g;
}

function updateStats() {
  el.lines.textContent = lines;
  el.score.textContent = score;
  el.level.textContent = level;
  if (score > bestScore) {
    bestScore = score;
    try { localStorage.setItem(BEST_KEY, String(bestScore)); } catch (_) {}
  }
  el.best.textContent = bestScore;
}

/* ---------- rendering ---------- */
function drawCellRect(ctx, x, y, size, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x + 1, y + 1, size - 2, size - 2);
  // container ribs
  ctx.strokeStyle = "rgba(0,0,0,0.28)";
  ctx.lineWidth = 1;
  for (let i = 1; i < 4; i++) {
    const gx = x + (size / 4) * i;
    ctx.beginPath();
    ctx.moveTo(gx, y + 3);
    ctx.lineTo(gx, y + size - 3);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.strokeRect(x + 1.5, y + 1.5, size - 3, size - 3);
}

function draw() {
  bx.fillStyle = "#071620";
  bx.fillRect(0, 0, board.width, board.height);

  // waterline grid
  bx.strokeStyle = "rgba(124,160,184,0.08)";
  bx.lineWidth = 1;
  for (let c = 1; c < COLS; c++) {
    bx.beginPath(); bx.moveTo(c * CELL, 0); bx.lineTo(c * CELL, board.height); bx.stroke();
  }
  for (let r = 1; r < ROWS; r++) {
    bx.beginPath(); bx.moveTo(0, r * CELL); bx.lineTo(board.width, r * CELL); bx.stroke();
  }

  // settled containers
  for (let r = HIDDEN; r < TOTAL_ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c]) drawCellRect(bx, c * CELL, (r - HIDDEN) * CELL, CELL, grid[r][c]);
    }
  }

  if (current && running) {
    // ghost
    let gy = 0;
    while (!collides(current, 0, gy + 1)) gy++;
    drawPiece(bx, current, 0, gy, true);
    // active
    drawPiece(bx, current, 0, 0, false);
  }

  // tier-clear toast
  if (tickMsg) {
    bx.fillStyle = "rgba(242,168,30,0.92)";
    bx.fillRect(0, board.height / 2 - 20, board.width, 40);
    bx.fillStyle = "#10293b";
    bx.font = "600 15px Oswald, sans-serif";
    bx.textAlign = "center";
    bx.textBaseline = "middle";
    bx.fillText(tickMsg, board.width / 2, board.height / 2);
  }
}

function drawPiece(ctx, piece, offX, offY, ghost) {
  const m = piece.m;
  for (let r = 0; r < m.length; r++) {
    for (let c = 0; c < m[r].length; c++) {
      if (!m[r][c]) continue;
      const gx = (piece.x + c + offX) * CELL;
      const gy = (piece.y + r + offY - HIDDEN) * CELL;
      if (piece.y + r + offY < HIDDEN) continue;
      if (ghost) {
        ctx.strokeStyle = piece.color;
        ctx.globalAlpha = 0.45;
        ctx.lineWidth = 2;
        ctx.strokeRect(gx + 2, gy + 2, CELL - 4, CELL - 4);
        ctx.globalAlpha = 1;
      } else {
        drawCellRect(ctx, gx, gy, CELL, piece.color);
      }
    }
  }
}

function drawMini(ctx, cv, type) {
  ctx.clearRect(0, 0, cv.width, cv.height);
  if (!type) return;
  const def = PIECES[type];
  const size = 22;
  const m = makePiece(type).m;
  const w = m[0].length * size, h = m.length * size;
  const ox = (cv.width - w) / 2;
  const oy = (cv.height - h) / 2;
  for (let r = 0; r < m.length; r++) {
    for (let c = 0; c < m[r].length; c++) {
      if (m[r][c]) drawCellRect(ctx, ox + c * size, oy + r * size, size, def.color);
    }
  }
}

function drawNext() {
  nx.clearRect(0, 0, nextCv.width, nextCv.height);
  const size = 20;
  queue.slice(0, 4).forEach((type, i) => {
    const def = PIECES[type];
    const m = makePiece(type).m;
    const w = m[0].length * size;
    const ox = (nextCv.width - w) / 2;
    const oy = 10 + i * 62;
    for (let r = 0; r < m.length; r++) {
      for (let c = 0; c < m[r].length; c++) {
        if (m[r][c]) drawCellRect(nx, ox + c * size, oy + r * size, size, def.color);
      }
    }
  });
}
function drawHold() { drawMini(hx, holdCv, holdPiece); }

/* ---------- loop ---------- */
function loop(time) {
  raf = requestAnimationFrame(loop);
  if (!running || paused) { lastTime = time; return; }
  const dt = time - lastTime;
  lastTime = time;

  dropCounter += dt;
  if (dropCounter > gravityInterval()) {
    dropCounter = 0;
    if (!collides(current, 0, 1)) {
      current.y++;
    }
  }

  if (collides(current, 0, 1)) {
    lockCounter += dt;
    if (lockCounter >= LOCK_DELAY) lockPiece();
  } else {
    lockCounter = 0;
  }

  moveTrolley();
  draw();
}

function moveTrolley() {
  if (!el.trolley || !current) return;
  const cx = (current.x + current.m.length / 2) / COLS;
  el.trolley.style.left = `${10 + cx * 80}%`;
}

/* ---------- state ---------- */
function startGame() {
  reset();
  running = true;
  paused = false;
  el.overlay.hidden = true;
  lastTime = performance.now();
  if (!raf) raf = requestAnimationFrame(loop);
  drawNext();
  drawHold();
}

function togglePause() {
  if (!running || gameOver) return;
  paused = !paused;
  el.pauseBtn.textContent = paused ? "Resume" : "Pause";
  if (paused) {
    el.overlay.hidden = false;
    el.overlayTitle.textContent = "Held on the hook";
    el.overlayText.textContent = "Operations paused. The crane is waiting.";
    el.overlayBtn.textContent = "Resume loading";
  } else {
    el.overlay.hidden = true;
  }
}

function endGame() {
  gameOver = true;
  running = false;
  el.overlay.hidden = false;
  el.overlayTitle.textContent = "Stack toppled";
  el.overlayText.textContent = `Shift over. ${lines} tiers shipped, ${score} tonnage moved.`;
  el.overlayBtn.textContent = "New shift";
  updateStats();
}

/* ---------- input ---------- */
document.addEventListener("keydown", (e) => {
  if (["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp", " "].includes(e.key)) e.preventDefault();
  if (!running || paused || gameOver) {
    if (e.key.toLowerCase() === "p") togglePause();
    return;
  }
  switch (e.key) {
    case "ArrowLeft": move(-1); break;
    case "ArrowRight": move(1); break;
    case "ArrowDown": softDrop(); break;
    case "ArrowUp":
    case "x": case "X": tryRotate(1); break;
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

/* ---------- boot ---------- */
reset();
running = false;
draw();
drawNext();
el.best.textContent = bestScore;

/* a partly-loaded ship for preview captures: ?demo */
if (/[?&]demo\b/.test(location.search)) {
  startGame();
  const plan = [
    [-5, 0], [-4, 0], [-2, 1], [0, 0], [2, 0], [3, 1], [4, 0], [-3, 0], [1, 0], [-1, 2],
  ];
  let i = 0;
  const tick = () => {
    if (i >= plan.length || gameOver) { draw(); return; }
    const [dx, rot] = plan[i++];
    for (let r = 0; r < rot; r++) tryRotate(1);
    for (let s = 0; s < Math.abs(dx); s++) move(Math.sign(dx));
    hardDrop();
    draw();
    setTimeout(tick, 40);
  };
  setTimeout(tick, 60);
}
