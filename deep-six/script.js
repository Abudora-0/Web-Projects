/* ==========================================================
   DEEP SIX - sonar minesweeper
   Vanilla JS. DOM grid of cells. First-click safe, flood
   reveal, chording, keyboard play, per-depth best times.
   ========================================================== */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const pad3 = (n) => String(Math.max(0, Math.min(999, n | 0))).padStart(3, "0");

const LEVELS = {
  patrol: { cols: 9,  rows: 9,  mines: 10, label: "Patrol" },
  hunter: { cols: 16, rows: 16, mines: 40, label: "Hunter" },
  deep:   { cols: 30, rows: 16, mines: 99, label: "Deep" },
};
const CUSTOM_BOUNDS = { cols: [5, 40], rows: [5, 24], mines: [2, 0] };

const el = {
  grid: $("#grid"),
  scope: $("#scope"),
  sweep: $("#sweep"),
  contacts: $("#contacts"),
  clock: $("#clock"),
  diveBtn: $("#diveBtn"),
  diveFace: $("#diveFace"),
  verdict: $("#verdict"),
  verdictLine: $("#verdictLine"),
  verdictSub: $("#verdictSub"),
  verdictBtn: $("#verdictBtn"),
  readout: $("#readout"),
  best: $("#best"),
  bestVal: $("#bestVal"),
  depthSelect: $("#depthSelect"),
  customRig: $("#customRig"),
  customSpec: $("#customSpec"),
  rigGo: $("#rigGo"),
};

let state = {
  level: "patrol",
  custom: { cols: 12, rows: 12, mines: 24 },
  cols: 9, rows: 9, mines: 10,
  board: [],          // { mine, open, flag, count }
  started: false,
  over: false,
  won: false,
  flags: 0,
  safeLeft: 0,
  cursor: 0,
  t0: 0,
  timer: null,
};

/* ---------- best times ---------- */
const BEST_KEY = "deepSix.best";
function loadBest() {
  try { return JSON.parse(localStorage.getItem(BEST_KEY)) || {}; }
  catch (_) { return {}; }
}
function saveBest(obj) {
  try { localStorage.setItem(BEST_KEY, JSON.stringify(obj)); } catch (_) {}
}
function bestKeyFor() {
  return state.level === "custom"
    ? `custom-${state.cols}x${state.rows}-${state.mines}`
    : state.level;
}
function refreshBest() {
  const best = loadBest();
  const v = best[bestKeyFor()];
  const name = state.level === "custom" ? "Custom" : LEVELS[state.level].label;
  el.best.innerHTML = `Best ${name} dive: <span id="bestVal">${v ? v + " s" : "--"}</span>`;
}

/* ---------- build ---------- */
function idx(c, r) { return r * state.cols + c; }
function inBounds(c, r) { return c >= 0 && c < state.cols && r >= 0 && r < state.rows; }
function neighbours(i) {
  const c = i % state.cols, r = (i / state.cols) | 0;
  const out = [];
  for (let dc = -1; dc <= 1; dc++) {
    for (let dr = -1; dr <= 1; dr++) {
      if (!dc && !dr) continue;
      if (inBounds(c + dc, r + dr)) out.push(idx(c + dc, r + dr));
    }
  }
  return out;
}

function newGame() {
  clearInterval(state.timer);
  const cfg = state.level === "custom"
    ? { ...state.custom }
    : LEVELS[state.level];
  state.cols = cfg.cols;
  state.rows = cfg.rows;
  state.mines = Math.min(cfg.mines, state.cols * state.rows - 1);
  state.board = Array.from({ length: state.cols * state.rows }, () => ({
    mine: false, open: false, flag: false, count: 0,
  }));
  state.started = false;
  state.over = false;
  state.won = false;
  state.flags = 0;
  state.safeLeft = state.cols * state.rows - state.mines;
  state.cursor = 0;
  state.t0 = 0;

  el.diveBtn.dataset.state = "";
  el.diveFace.textContent = "surface";
  el.verdict.hidden = true;
  el.verdict.classList.remove("lost");
  el.clock.textContent = "000";
  el.clock.classList.remove("warn");
  el.contacts.textContent = pad3(state.mines);
  el.contacts.classList.remove("warn");
  el.readout.textContent =
    "Left-click sweeps a sector. Right-click marks a mine. Clear every safe sector to surface.";

  renderGrid();
  refreshBest();
}

function renderGrid() {
  const scopeW = Math.min(el.scope.parentElement.clientWidth - 40, 940);
  const cell = Math.max(
    18,
    Math.min(38, Math.floor((scopeW - (state.cols - 1) * 3) / state.cols))
  );
  el.grid.style.setProperty("--cell", cell + "px");
  el.grid.style.gridTemplateColumns = `repeat(${state.cols}, var(--cell))`;
  el.grid.innerHTML = "";
  const frag = document.createDocumentFragment();
  for (let i = 0; i < state.board.length; i++) {
    const b = document.createElement("button");
    b.className = "cell";
    b.type = "button";
    b.dataset.i = i;
    b.setAttribute("role", "gridcell");
    b.setAttribute("aria-label", "unsweept sector");
    frag.appendChild(b);
  }
  el.grid.appendChild(frag);
  paintCursor();
}

/* ---------- mine placement (first click safe) ---------- */
function placeMines(safeIndex) {
  const safe = new Set([safeIndex, ...neighbours(safeIndex)]);
  const spots = [];
  for (let i = 0; i < state.board.length; i++) if (!safe.has(i)) spots.push(i);
  // Fisher-Yates partial shuffle
  for (let n = 0; n < state.mines; n++) {
    const j = n + Math.floor(Math.random() * (spots.length - n));
    [spots[n], spots[j]] = [spots[j], spots[n]];
    state.board[spots[n]].mine = true;
  }
  for (let i = 0; i < state.board.length; i++) {
    if (state.board[i].mine) continue;
    state.board[i].count = neighbours(i).filter((k) => state.board[k].mine).length;
  }
}

/* ---------- timer ---------- */
function startTimer() {
  state.t0 = Date.now();
  state.timer = setInterval(() => {
    const s = Math.floor((Date.now() - state.t0) / 1000);
    el.clock.textContent = pad3(s);
    el.clock.classList.toggle("warn", s >= 300);
  }, 250);
}
function elapsed() { return Math.floor((Date.now() - state.t0) / 1000); }

/* ---------- reveal ---------- */
function reveal(i) {
  if (state.over) return;
  const b = state.board[i];
  if (b.open || b.flag) return;

  if (!state.started) {
    placeMines(i);
    state.started = true;
    startTimer();
  }

  if (b.mine) return lose(i);

  // flood fill for zero-count sectors
  const stack = [i];
  while (stack.length) {
    const k = stack.pop();
    const cell = state.board[k];
    if (cell.open || cell.flag) continue;
    cell.open = true;
    state.safeLeft--;
    paintCell(k);
    if (cell.count === 0) {
      for (const n of neighbours(k)) {
        if (!state.board[n].open && !state.board[n].mine) stack.push(n);
      }
    }
  }
  if (state.safeLeft <= 0) win();
}

/* chord - reveal neighbours when flag count matches */
function chord(i) {
  const b = state.board[i];
  if (!b.open || b.count === 0 || state.over) return;
  const near = neighbours(i);
  const flagged = near.filter((k) => state.board[k].flag).length;
  if (flagged !== b.count) return;
  for (const k of near) if (!state.board[k].flag && !state.board[k].open) reveal(k);
}

function toggleFlag(i) {
  if (state.over) return;
  const b = state.board[i];
  if (b.open) return;
  b.flag = !b.flag;
  state.flags += b.flag ? 1 : -1;
  const left = state.mines - state.flags;
  el.contacts.textContent = pad3(left);
  el.contacts.classList.toggle("warn", left < 0);
  paintCell(i);
}

/* ---------- paint ---------- */
function cellNode(i) { return el.grid.children[i]; }
function paintCell(i) {
  const b = state.board[i];
  const node = cellNode(i);
  if (!node) return;
  node.className = "cell";
  node.textContent = "";
  if (b.flag) {
    node.classList.add("flag");
    node.textContent = "◈";
    node.setAttribute("aria-label", "marked mine");
    return;
  }
  if (!b.open) {
    node.setAttribute("aria-label", "unsweept sector");
    return;
  }
  node.classList.add("open");
  if (b.mine) {
    node.classList.add("mine");
    node.textContent = "✹";
    node.setAttribute("aria-label", "mine");
  } else if (b.count > 0) {
    node.classList.add("n" + b.count);
    node.textContent = b.count;
    node.setAttribute("aria-label", b.count + " mines adjacent");
  } else {
    node.setAttribute("aria-label", "clear");
  }
}
function paintAll() { for (let i = 0; i < state.board.length; i++) paintCell(i); }

function paintCursor() {
  $$(".cell.cursor", el.grid).forEach((n) => n.classList.remove("cursor"));
  const node = cellNode(state.cursor);
  if (node) node.classList.add("cursor");
}

/* ---------- end states ---------- */
function lose(hitIndex) {
  state.over = true;
  clearInterval(state.timer);
  for (let i = 0; i < state.board.length; i++) {
    const b = state.board[i];
    if (b.mine && !b.flag) { b.open = true; paintCell(i); }
    if (b.flag && !b.mine) { cellNode(i).classList.add("wrong"); }
  }
  const hit = cellNode(hitIndex);
  hit.classList.add("mine", "blown", "open");
  hit.textContent = "✹";
  el.diveBtn.dataset.state = "lost";
  el.diveFace.textContent = "lost";
  el.readout.textContent = "Mine detonated. The boat is lost. Start a new dive.";
  el.verdict.hidden = false;
  el.verdict.classList.add("lost");
  el.verdictLine.textContent = "Mine detonated";
  el.verdictSub.textContent = "Contact at sector " +
    (hitIndex % state.cols + 1) + "-" + ((hitIndex / state.cols | 0) + 1);
}

function win() {
  state.over = true;
  state.won = true;
  clearInterval(state.timer);
  const secs = elapsed();
  for (let i = 0; i < state.board.length; i++) {
    const b = state.board[i];
    if (b.mine && !b.flag) { b.flag = true; paintCell(i); }
  }
  el.contacts.textContent = "000";
  el.diveBtn.dataset.state = "won";
  el.diveFace.textContent = "clear";
  el.readout.textContent = "All sectors clear. Surfacing.";

  const best = loadBest();
  const key = bestKeyFor();
  const isBest = !best[key] || secs < best[key];
  if (isBest) { best[key] = secs; saveBest(best); }
  refreshBest();

  el.verdict.hidden = false;
  el.verdictLine.textContent = "All clear";
  el.verdictSub.textContent = isBest
    ? `Surfaced in ${secs} s - best dive yet`
    : `Surfaced in ${secs} s`;
}

/* ---------- input ---------- */
el.grid.addEventListener("click", (e) => {
  const node = e.target.closest(".cell");
  if (!node) return;
  const i = +node.dataset.i;
  state.cursor = i;
  paintCursor();
  if (state.board[i].open) chord(i);
  else reveal(i);
});
el.grid.addEventListener("contextmenu", (e) => {
  const node = e.target.closest(".cell");
  if (!node) return;
  e.preventDefault();
  toggleFlag(+node.dataset.i);
});
/* middle-click or double-click also chords */
el.grid.addEventListener("auxclick", (e) => {
  if (e.button !== 1) return;
  const node = e.target.closest(".cell");
  if (node) { e.preventDefault(); chord(+node.dataset.i); }
});
el.grid.addEventListener("dblclick", (e) => {
  const node = e.target.closest(".cell");
  if (node) chord(+node.dataset.i);
});

document.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  if (k === "r") { newGame(); return; }
  const moves = { arrowup: -state.cols, arrowdown: state.cols, arrowleft: -1, arrowright: 1 };
  if (k in moves) {
    e.preventDefault();
    const c = state.cursor % state.cols, r = (state.cursor / state.cols) | 0;
    if (k === "arrowleft" && c === 0) return;
    if (k === "arrowright" && c === state.cols - 1) return;
    const next = state.cursor + moves[k];
    if (next < 0 || next >= state.board.length) return;
    state.cursor = next;
    paintCursor();
    cellNode(state.cursor).focus();
  } else if (k === "f") {
    e.preventDefault();
    toggleFlag(state.cursor);
  } else if (k === " " || k === "enter") {
    e.preventDefault();
    if (state.board[state.cursor].open) chord(state.cursor);
    else reveal(state.cursor);
  }
});

el.diveBtn.addEventListener("click", newGame);
el.verdictBtn.addEventListener("click", newGame);

/* depth select */
el.depthSelect.addEventListener("click", (e) => {
  const btn = e.target.closest(".depth");
  if (!btn) return;
  $$(".depth", el.depthSelect).forEach((d) => d.classList.remove("active"));
  btn.classList.add("active");
  state.level = btn.dataset.level;
  el.customRig.hidden = state.level !== "custom";
  if (state.level !== "custom") newGame();
});

/* custom steppers */
el.customRig.addEventListener("click", (e) => {
  const step = e.target.closest(".step");
  if (!step) return;
  const wrap = step.closest("[data-stepper]");
  const key = wrap.dataset.stepper;
  const dir = +step.dataset.step;
  const cur = state.custom;
  if (key === "cols") cur.cols = clampRange(cur.cols + dir, 5, 40);
  if (key === "rows") cur.rows = clampRange(cur.rows + dir, 5, 24);
  if (key === "mines") cur.mines = clampRange(cur.mines + dir, 2, cur.cols * cur.rows - 10);
  cur.mines = Math.min(cur.mines, cur.cols * cur.rows - 10);
  syncCustom();
});
function clampRange(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function syncCustom() {
  $("#colsVal").textContent = state.custom.cols;
  $("#rowsVal").textContent = state.custom.rows;
  $("#minesVal").textContent = state.custom.mines;
  el.customSpec.textContent = `${state.custom.cols} x ${state.custom.rows} · ${state.custom.mines}`;
}
el.rigGo.addEventListener("click", () => { state.level = "custom"; newGame(); });

/* resize - re-fit cells if the board would overflow */
let rz;
window.addEventListener("resize", () => {
  clearTimeout(rz);
  rz = setTimeout(() => {
    renderGrid();
    paintAll();
    paintCursor();
  }, 150);
});

syncCustom();
newGame();

/* a pre-swept board for preview captures: ?demo */
if (/[?&]demo\b/.test(location.search)) {
  placeMines(40);
  state.started = true;
  startTimer();
  state.t0 = Date.now() - 47000;
  reveal(40);
  [0, 9, 18, 8, 17].forEach((i) => { if (!state.board[i].open) toggleFlag(i); });
  el.clock.textContent = pad3(47);
}
