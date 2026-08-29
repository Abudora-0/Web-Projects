/* ══════════════════════════════════════════════
   DeXO - Tic Tac Toe  |  script.js
   ══════════════════════════════════════════════ */

'use strict';

// ── Audio ─────────────────────────────────────
const sfxTurn    = new Audio('ting.mp3');
const sfxWin     = new Audio('gameover.mp3');
sfxTurn.volume   = 0.5;
sfxWin.volume    = 0.6;
let soundOn      = true;

function playSound(sfx) {
  if (!soundOn) return;
  sfx.currentTime = 0;
  sfx.play().catch(() => {});
}

// ── State ─────────────────────────────────────
const WINS = [
  [0,1,2], [3,4,5], [6,7,8],   // rows
  [0,3,6], [1,4,7], [2,5,8],   // cols
  [0,4,8], [2,4,6],             // diags
];

let board      = Array(9).fill(null);  // null | 'X' | 'O'
let current    = 'X';                  // whose turn
let gameOver   = false;
let vsAI       = false;
let difficulty = 'easy';               // easy | medium | hard
let aiThinking = false;

const SCORES_KEY = 'dexo_scores';
let scores = loadScores();

// ── DOM refs ──────────────────────────────────
const cells        = Array.from(document.querySelectorAll('.cell'));
const boardEl      = document.getElementById('board');
const turnInd      = document.getElementById('turnIndicator');
const turnAvatar   = document.getElementById('turnAvatar');
const turnText     = document.getElementById('turnText');
const resultBanner = document.getElementById('resultBanner');
const resultText   = document.getElementById('resultText');
const xScoreEl     = document.getElementById('xScore');
const oScoreEl     = document.getElementById('oScore');
const drawScoreEl  = document.getElementById('drawScore');
const xScoreCard   = document.getElementById('xScoreCard');
const oScoreCard   = document.getElementById('oScoreCard');
const newGameBtn   = document.getElementById('newGameBtn');
const resetScoresBtn = document.getElementById('resetScoresBtn');
const pvpBtn       = document.getElementById('pvpBtn');
const aiBtn        = document.getElementById('aiBtn');
const diffBar      = document.getElementById('diffBar');
const soundBtn     = document.getElementById('soundBtn');
const soundIcon    = document.getElementById('soundIcon');
const confettiCanvas = document.getElementById('confettiCanvas');
const toastEl      = document.getElementById('toast');

// ── SVG generators ────────────────────────────
function makeSVG_X(forCell = false) {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('viewBox', '0 0 100 100');
  s.classList.add('mark-svg');
  if (forCell) s.classList.add('cell-pop');

  const l1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  l1.setAttribute('x1','18'); l1.setAttribute('y1','18');
  l1.setAttribute('x2','82'); l1.setAttribute('y2','82');
  l1.classList.add('x-line');

  const l2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  l2.setAttribute('x1','82'); l2.setAttribute('y1','18');
  l2.setAttribute('x2','18'); l2.setAttribute('y2','82');
  l2.classList.add('x-line');

  s.appendChild(l1); s.appendChild(l2);
  return s;
}

function makeSVG_O(forCell = false) {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('viewBox', '0 0 100 100');
  s.classList.add('mark-svg');
  if (forCell) s.classList.add('cell-pop');

  const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  c.setAttribute('cx','50'); c.setAttribute('cy','50'); c.setAttribute('r','32');
  c.classList.add('o-circle');

  s.appendChild(c);
  return s;
}

function makeTurnSVG(mark) {
  return mark === 'X' ? makeSVG_X(false) : makeSVG_O(false);
}

// ── Turn Indicator ────────────────────────────
function updateTurnIndicator() {
  turnAvatar.innerHTML = '';
  turnAvatar.appendChild(makeTurnSVG(current));
  turnInd.className = 'turn-indicator ' + (current === 'X' ? 'x-turn' : 'o-turn');
  if (vsAI && current === 'O') {
    turnText.innerHTML = `AI is thinking <span class="thinking-dots"><span></span><span></span><span></span></span>`;
  } else {
    turnText.textContent = current === 'X' ? "Player X's turn" : (vsAI ? "Your turn (O)" : "Player O's turn");
  }

  xScoreCard.classList.toggle('active-x', current === 'X' && !gameOver);
  oScoreCard.classList.toggle('active-o', current === 'O' && !gameOver);
}

// ── Make a move ───────────────────────────────
function makeMove(idx) {
  if (board[idx] || gameOver || aiThinking) return;

  board[idx] = current;
  const cell = cells[idx];
  cell.classList.add('taken');
  const svg = current === 'X' ? makeSVG_X(true) : makeSVG_O(true);
  cell.appendChild(svg);

  playSound(sfxTurn);

  const winCombo = getWinner();
  if (winCombo) {
    endGame('win', winCombo);
    return;
  }
  if (board.every(c => c)) {
    endGame('draw');
    return;
  }

  current = current === 'X' ? 'O' : 'X';
  updateTurnIndicator();

  if (vsAI && current === 'O') {
    aiThinking = true;
    boardEl.classList.add('locked');
    const delay = 380 + Math.random() * 220;
    setTimeout(aiMove, delay);
  }
}

// ── End game ──────────────────────────────────
function endGame(type, winCombo) {
  gameOver = true;
  boardEl.classList.add('locked');

  if (type === 'win') {
    const winner = current;
    winCombo.forEach(i => cells[i].classList.add('win-cell'));
    drawWinLine(winCombo);
    playSound(sfxWin);

    if (winner === 'X') {
      scores.x++;
      resultBanner.className = 'result-banner x-wins';
      resultText.innerHTML = `<i class="fas fa-trophy"></i> Player X Wins!`;
    } else {
      scores.o++;
      resultBanner.className = 'result-banner o-wins';
      resultText.innerHTML = vsAI
        ? `<i class="fas fa-robot"></i> AI Wins! Better luck next time.`
        : `<i class="fas fa-trophy"></i> Player O Wins!`;
    }
    resultBanner.classList.remove('hidden');
    xScoreCard.classList.remove('active-x');
    oScoreCard.classList.remove('active-o');
    saveScores();
    renderScores(true);
    launchConfetti(winner === 'X' ? '#f5f0dc' : '#f2d47f');
  } else {
    scores.draw++;
    resultBanner.className = 'result-banner draw';
    resultText.innerHTML = `<i class="fas fa-handshake"></i> It's a Draw!`;
    resultBanner.classList.remove('hidden');
    cells.forEach(c => c.classList.add('draw-cell'));
    xScoreCard.classList.remove('active-x');
    oScoreCard.classList.remove('active-o');
    saveScores();
    renderScores(false);
  }
  turnInd.className = 'turn-indicator';
  turnAvatar.innerHTML = '';
  turnAvatar.style.display = 'none';
  turnText.textContent = 'Game over';
}

// ── Check winner ──────────────────────────────
function getWinner() {
  for (const combo of WINS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return combo;
    }
  }
  return null;
}

// ── Win line ──────────────────────────────────
function drawWinLine(combo) {
  // We'll highlight via CSS only (win-cell glow) - clean & reliable.
  // Optionally add a subtle overlay line on the board wrap.
  const boardRect = boardEl.getBoundingClientRect();
  // Just rely on the cell glow - it looks great.
}

// ── New game ──────────────────────────────────
function newGame() {
  board     = Array(9).fill(null);
  current   = 'X';
  gameOver  = false;
  aiThinking= false;
  boardEl.classList.remove('locked');

  cells.forEach(cell => {
    cell.innerHTML = '';
    cell.className = 'cell';
  });

  resultBanner.classList.add('hidden');
  turnAvatar.style.display = '';
  updateTurnIndicator();
}

// ── Scores ────────────────────────────────────
function loadScores() {
  try { return JSON.parse(localStorage.getItem(SCORES_KEY)) || { x:0, o:0, draw:0 }; }
  catch { return { x:0, o:0, draw:0 }; }
}
function saveScores() { localStorage.setItem(SCORES_KEY, JSON.stringify(scores)); }
function renderScores(bump) {
  xScoreEl.textContent    = scores.x;
  oScoreEl.textContent    = scores.o;
  drawScoreEl.textContent = scores.draw;
  if (bump) {
    const el = current === 'X' ? xScoreEl : oScoreEl;
    el.classList.remove('bump');
    void el.offsetWidth;
    el.classList.add('bump');
  }
}

// ── AI ────────────────────────────────────────
const AI_MARK    = 'O';
const HUMAN_MARK = 'X';

function aiMove() {
  aiThinking = false;
  if (gameOver) return;

  let idx;
  if (difficulty === 'easy') {
    idx = randomMove();
  } else if (difficulty === 'medium') {
    idx = Math.random() < 0.65 ? bestMove() : randomMove();
  } else {
    idx = bestMove();
  }
  if (idx !== null && idx !== undefined) makeMove(idx);
  boardEl.classList.remove('locked');
}

function randomMove() {
  const empty = board.map((v,i) => v === null ? i : null).filter(v => v !== null);
  if (!empty.length) return null;
  return empty[Math.floor(Math.random() * empty.length)];
}

function bestMove() {
  let bestScore = -Infinity, bestIdx = null;
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = AI_MARK;
      const score = minimax(board, 0, false, -Infinity, Infinity);
      board[i] = null;
      if (score > bestScore) { bestScore = score; bestIdx = i; }
    }
  }
  return bestIdx;
}

function checkWinnerBoard(b) {
  for (const [a, bI, c] of WINS) {
    if (b[a] && b[a] === b[bI] && b[a] === b[c]) return b[a];
  }
  return null;
}

function minimax(b, depth, isMaximizing, alpha, beta) {
  const winner = checkWinnerBoard(b);
  if (winner === AI_MARK)    return 10 - depth;
  if (winner === HUMAN_MARK) return depth - 10;
  if (b.every(c => c))       return 0;

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!b[i]) {
        b[i] = AI_MARK;
        best = Math.max(best, minimax(b, depth+1, false, alpha, beta));
        b[i] = null;
        alpha = Math.max(alpha, best);
        if (beta <= alpha) break;
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!b[i]) {
        b[i] = HUMAN_MARK;
        best = Math.min(best, minimax(b, depth+1, true, alpha, beta));
        b[i] = null;
        beta = Math.min(beta, best);
        if (beta <= alpha) break;
      }
    }
    return best;
  }
}

// ── Confetti ──────────────────────────────────
function launchConfetti(primaryColor) {
  confettiCanvas.style.display = 'block';
  confettiCanvas.width  = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
  const ctx = confettiCanvas.getContext('2d');

  const COLORS = [primaryColor, '#f2d47f', '#a8d8b9', '#9fc4e8', '#e8a4b8', '#f5f0dc'];
  const particles = Array.from({ length: 110 }, () => ({
    x: Math.random() * confettiCanvas.width,
    y: -20 - Math.random() * 100,
    w: Math.random() * 9 + 4,
    h: Math.random() * 5 + 3,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    dx: (Math.random() - 0.5) * 5,
    dy: Math.random() * 3.5 + 2,
    g: 0.12,
    rot: Math.random() * 360,
    drot: (Math.random() - 0.5) * 12,
    opacity: 1,
  }));

  let frame;
  const H = confettiCanvas.height;
  function animate() {
    ctx.clearRect(0, 0, confettiCanvas.width, H);
    let alive = false;
    for (const p of particles) {
      p.x += p.dx;
      p.y += p.dy;
      p.dy += p.g;
      p.rot += p.drot;
      if (p.y < H + 20) alive = true;
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.opacity - Math.max(0, (p.y - H * 0.7) / (H * 0.3)));
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (alive) frame = requestAnimationFrame(animate);
    else { confettiCanvas.style.display = 'none'; }
  }
  animate();
  setTimeout(() => { cancelAnimationFrame(frame); confettiCanvas.style.display = 'none'; }, 4500);
}

// ── Toast ─────────────────────────────────────
let toastTimer;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1800);
}

// ── Event listeners ───────────────────────────
cells.forEach(cell => {
  cell.addEventListener('click', () => {
    if (vsAI && current === 'O') return;
    makeMove(+cell.dataset.index);
  });
});

newGameBtn.addEventListener('click', newGame);

resetScoresBtn.addEventListener('click', () => {
  scores = { x:0, o:0, draw:0 };
  saveScores();
  renderScores(false);
  toast('Scores reset');
});

pvpBtn.addEventListener('click', () => {
  vsAI = false;
  pvpBtn.classList.add('active');
  aiBtn.classList.remove('active');
  diffBar.classList.add('hidden');
  newGame();
});

aiBtn.addEventListener('click', () => {
  vsAI = true;
  aiBtn.classList.add('active');
  pvpBtn.classList.remove('active');
  diffBar.classList.remove('hidden');
  newGame();
});

document.querySelectorAll('.diff-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    difficulty = btn.dataset.diff;
    document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    newGame();
    toast(`Difficulty: ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`);
  });
});

soundBtn.addEventListener('click', () => {
  soundOn = !soundOn;
  soundBtn.classList.toggle('muted', !soundOn);
  soundIcon.className = soundOn ? 'fas fa-volume-high' : 'fas fa-volume-xmark';
  toast(soundOn ? 'Sound on' : 'Sound off');
});

// ── Keyboard ──────────────────────────────────
// Numpad layout: 7=top-left ... 3=bottom-right (standard numpad)
// But for visual board: 1=top-left, 2=top-mid, 3=top-right, etc.
const KEY_CELL = {
  '1':0, '2':1, '3':2,
  '4':3, '5':4, '6':5,
  '7':6, '8':7, '9':8,
  // Numpad (numpad 7 = top-left of numpad)
  'Numpad7':0, 'Numpad8':1, 'Numpad9':2,
  'Numpad4':3, 'Numpad5':4, 'Numpad6':5,
  'Numpad1':6, 'Numpad2':7, 'Numpad3':8,
};

document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return;

  if (e.key === 'r' || e.key === 'R') { newGame(); return; }

  const idx = KEY_CELL[e.key] ?? KEY_CELL[e.code];
  if (idx !== undefined) {
    if (vsAI && current === 'O') return;
    makeMove(idx);
  }
});

// ── Init ──────────────────────────────────────
renderScores(false);
updateTurnIndicator();
