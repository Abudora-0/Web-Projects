/* ==========================================================
   SAPPER - Minesweeper the Windows 95 way
   Vanilla JS. DOM grid, first-click-safe, flood reveal,
   chording, question marks, LED counters, smiley states,
   best times, menu bar, optional Web-Audio sound.
   ========================================================== */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const LEVELS = {
  patrol: { cols: 9,  rows: 9,  mines: 10, label: "Beginner" },
  hunter: { cols: 16, rows: 16, mines: 40, label: "Intermediate" },
  deep:   { cols: 30, rows: 16, mines: 99, label: "Expert" },
};

const el = {
  grid: $("#grid"),
  scope: $("#scope"),
  contacts: $("#contacts"),
  clock: $("#clock"),
  diveBtn: $("#diveBtn"),
  verdict: $("#verdict"),
  verdictLine: $("#verdictLine"),
  verdictSub: $("#verdictSub"),
  verdictBtn: $("#verdictBtn"),
  readout: $("#readout"),
  best: $("#best"),
  depthSelect: $("#depthSelect"),
  gameMenu: $("#gameMenu"),
  helpMenu: $("#helpMenu"),
  gameBtn: $("#gameBtn"),
  helpBtn: $("#helpBtn"),
  customRig: $("#customRig"),
  customSpec: $("#customSpec"),
  rigGo: $("#rigGo"),
  rigCancel: $("#rigCancel"),
  infoModal: $("#infoModal"),
  infoTitle: $("#infoTitle"),
  infoBody: $("#infoBody"),
  infoOk: $("#infoOk"),
};

let prefs = { marks: true, sound: false };
try { prefs = { ...prefs, ...(JSON.parse(localStorage.getItem("sapper.prefs")) || {}) }; } catch (_) {}
function savePrefs() { try { localStorage.setItem("sapper.prefs", JSON.stringify(prefs)); } catch (_) {} }

let state = {
  level: "patrol",
  custom: { cols: 12, rows: 12, mines: 24 },
  cols: 9, rows: 9, mines: 10,
  board: [],          // { mine, open, flag, question, count }
  started: false,
  over: false,
  won: false,
  flags: 0,
  safeLeft: 0,
  cursor: 0,
  t0: 0,
  timer: null,
};

/* ============ seven-segment LED ============ */
const SEG_PTS = {
  a: "M2 2 L9 2", f: "M1.6 3 L1.6 10", b: "M9.4 3 L9.4 10", g: "M2 11 L9 11",
  e: "M1.6 12 L1.6 19", c: "M9.4 12 L9.4 19", d: "M2 20 L9 20",
};
const SEG_MAP = {
  "0": "abcdef", "1": "bc", "2": "abdeg", "3": "abcdg", "4": "bcfg",
  "5": "acdfg", "6": "acdefg", "7": "abc", "8": "abcdefg", "9": "abcdfg",
  "-": "g", " ": "",
};
function ledDigit(ch, ox) {
  let s = "";
  for (const seg of "abcdefg") {
    const on = (SEG_MAP[ch] || "").includes(seg);
    s += `<path class="${on ? "seg-on" : "seg-off"}" transform="translate(${ox} 0)" d="${SEG_PTS[seg]}" stroke-width="2.2" stroke-linecap="round" fill="none"/>`;
  }
  return s;
}
function ledString(n) {
  let str;
  if (n < 0) str = "-" + String(Math.min(99, -n)).padStart(2, "0");
  else str = String(Math.min(999, n)).padStart(3, "0");
  return str.slice(-3);
}
function setLED(node, n) {
  const str = ledString(n);
  node.innerHTML =
    `<svg viewBox="0 0 34 22" aria-hidden="true">` +
    ledDigit(str[0], 1) + ledDigit(str[1], 12) + ledDigit(str[2], 23) +
    `</svg>`;
  node.setAttribute("aria-label", (node.id === "clock" ? "Seconds elapsed " : "Mines remaining ") + str);
}

/* ============ face states ============ */
const FACES = {
  idle: `<circle cx="10" cy="10" r="9" fill="#ffd83b" stroke="#000" stroke-width="1"/><circle cx="7" cy="8" r="1.3" fill="#000"/><circle cx="13" cy="8" r="1.3" fill="#000"/><path d="M5.5 12.2 Q10 16 14.5 12.2" fill="none" stroke="#000" stroke-width="1.5" stroke-linecap="round"/>`,
  ooh: `<circle cx="10" cy="10" r="9" fill="#ffd83b" stroke="#000" stroke-width="1"/><circle cx="7" cy="7.6" r="1.6" fill="#000"/><circle cx="13" cy="7.6" r="1.6" fill="#000"/><circle cx="10" cy="13.2" r="2.1" fill="#000"/>`,
  win: `<circle cx="10" cy="10" r="9" fill="#ffd83b" stroke="#000" stroke-width="1"/><path d="M3 7.5 H17" stroke="#000" stroke-width="1.4"/><path d="M4 7.5 Q4 11.5 7 11.5 Q9.6 11.5 9.6 7.8 M16 7.5 Q16 11.5 13 11.5 Q10.4 11.5 10.4 7.8" fill="#000"/><path d="M6 13.5 Q10 16.5 14 13.5" fill="none" stroke="#000" stroke-width="1.5" stroke-linecap="round"/>`,
  dead: `<circle cx="10" cy="10" r="9" fill="#ffd83b" stroke="#000" stroke-width="1"/><path d="M5 6.5 L9 10.5 M9 6.5 L5 10.5 M11 6.5 L15 10.5 M15 6.5 L11 10.5" stroke="#000" stroke-width="1.4" stroke-linecap="round"/><path d="M6 15 Q10 12 14 15" fill="none" stroke="#000" stroke-width="1.5" stroke-linecap="round"/>`,
};
function setFace(name) {
  el.diveBtn.dataset.state = name;
  el.diveBtn.innerHTML = `<svg viewBox="0 0 20 20" aria-hidden="true">${FACES[name] || FACES.idle}</svg>`;
}

/* ============ cell glyphs ============ */
const FLAG_SVG = `<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 8.5 L14 5.6 L7 3 Z" fill="#ff0000"/><path d="M7 3 V16" stroke="#000" stroke-width="1.6"/><path d="M4 16 H16 M3 18 H17" stroke="#000" stroke-width="2"/></svg>`;
function bombSVG(wrong) {
  return `<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 4 V16 M4 10 H16 M5.5 5.5 L14.5 14.5 M14.5 5.5 L5.5 14.5" stroke="#000" stroke-width="1.5"/><circle cx="10" cy="10" r="4.6" fill="#000"/><circle cx="8.2" cy="8.2" r="1.3" fill="#fff"/>${wrong ? '<path d="M3 3 L17 17 M17 3 L3 17" stroke="#ff0000" stroke-width="2.2"/>' : ""}</svg>`;
}

/* ============ sound ============ */
let _ac = null;
function ac() { return _ac || (_ac = new (window.AudioContext || window.webkitAudioContext)()); }
function tone(freq, dur, type = "square", vol = 0.09, freqEnd = null) {
  if (!prefs.sound) return;
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
  dig: () => tone(320, 0.05, "square", 0.06),
  flag: () => tone(660, 0.04, "triangle", 0.06),
  boom: () => { tone(180, 0.18, "sawtooth", 0.16); setTimeout(() => tone(90, 0.3, "sawtooth", 0.12, 50), 90); },
  win: () => [0, 90, 180, 300].forEach((ms, i) => setTimeout(() => tone([523, 659, 784, 1047][i], 0.12, "square", 0.08), ms)),
};

/* ============ best times ============ */
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
  el.best.innerHTML = `Best ${name}: <b>${v != null ? v + " s" : "--"}</b>`;
}

/* ============ engine ============ */
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
  const cfg = state.level === "custom" ? { ...state.custom } : LEVELS[state.level];
  state.cols = cfg.cols;
  state.rows = cfg.rows;
  state.mines = Math.min(cfg.mines, state.cols * state.rows - 1);
  state.board = Array.from({ length: state.cols * state.rows }, () => ({
    mine: false, open: false, flag: false, question: false, count: 0,
  }));
  state.started = false;
  state.over = false;
  state.won = false;
  state.flags = 0;
  state.safeLeft = state.cols * state.rows - state.mines;
  state.cursor = 0;
  state.t0 = 0;

  setFace("idle");
  el.verdict.hidden = true;
  el.verdict.classList.remove("lost");
  setLED(el.clock, 0);
  setLED(el.contacts, state.mines);
  el.readout.textContent =
    "Left-click clears a square. Right-click flags a mine. Clear every safe square.";

  renderGrid();
  refreshBest();
  syncMenuTicks();
}

function renderGrid() {
  const wellW = Math.min((el.scope.parentElement.clientWidth || 640) - 30, 940);
  const cell = state.cols >= 30
    ? Math.max(16, Math.min(22, Math.floor(wellW / state.cols)))
    : Math.max(20, Math.min(30, Math.floor(wellW / state.cols)));
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
    b.setAttribute("aria-label", "covered square");
    frag.appendChild(b);
  }
  el.grid.appendChild(frag);
  paintCursor();
}

function placeMines(safeIndex) {
  const safe = new Set([safeIndex, ...neighbours(safeIndex)]);
  const spots = [];
  for (let i = 0; i < state.board.length; i++) if (!safe.has(i)) spots.push(i);
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

function startTimer() {
  state.t0 = Date.now();
  state.timer = setInterval(() => {
    setLED(el.clock, Math.floor((Date.now() - state.t0) / 1000));
  }, 250);
}
function elapsed() { return Math.floor((Date.now() - state.t0) / 1000); }

function reveal(i, depth = 0) {
  if (state.over) return;
  const b = state.board[i];
  if (b.open || b.flag) return;

  if (!state.started) {
    placeMines(i);
    state.started = true;
    startTimer();
  }
  if (b.mine) return lose(i);
  SFX.dig();

  const stack = [[i, 0]];
  while (stack.length) {
    const [k, d] = stack.pop();
    const cell = state.board[k];
    if (cell.open || cell.flag) continue;
    cell.open = true;
    cell.question = false;
    state.safeLeft--;
    paintCell(k, d);
    if (cell.count === 0) {
      for (const n of neighbours(k)) {
        if (!state.board[n].open && !state.board[n].mine) stack.push([n, d + 1]);
      }
    }
  }
  if (state.safeLeft <= 0) win();
}

function chord(i) {
  const b = state.board[i];
  if (!b.open || b.count === 0 || state.over) return;
  const near = neighbours(i);
  const flagged = near.filter((k) => state.board[k].flag).length;
  if (flagged !== b.count) return;
  for (const k of near) if (!state.board[k].flag && !state.board[k].open) reveal(k);
}

/* right-click: cycle none -> flag -> question -> none (question only if enabled) */
function cycleMark(i) {
  if (state.over) return;
  const b = state.board[i];
  if (b.open) return;
  if (b.flag) {
    b.flag = false;
    state.flags--;
    if (prefs.marks) b.question = true;
    tone(520, 0.03, "triangle", 0.05);
  } else if (b.question) {
    b.question = false;
  } else {
    b.flag = true;
    state.flags++;
    SFX.flag();
  }
  setLED(el.contacts, state.mines - state.flags);
  paintCell(i);
}

/* ============ paint ============ */
function cellNode(i) { return el.grid.children[i]; }
function paintCell(i, cascadeDepth) {
  const b = state.board[i];
  const node = cellNode(i);
  if (!node) return;
  node.className = "cell";
  node.innerHTML = "";
  node.textContent = "";

  if (!b.open) {
    if (b.flag) { node.innerHTML = FLAG_SVG; node.setAttribute("aria-label", "flagged"); }
    else if (b.question) { node.textContent = "?"; node.style.color = "#000"; node.setAttribute("aria-label", "question mark"); }
    else node.setAttribute("aria-label", "covered square");
    return;
  }

  node.classList.add("open");
  if (cascadeDepth != null && !reduceMotion && cascadeDepth > 0) {
    node.style.animationDelay = Math.min(cascadeDepth * 14, 220) + "ms";
  }
  if (b.mine) {
    node.classList.add("mine");
    node.innerHTML = bombSVG(false);
    node.setAttribute("aria-label", "mine");
  } else if (b.count > 0) {
    node.classList.add("n" + b.count);
    node.textContent = b.count;
    node.setAttribute("aria-label", b.count + " adjacent mines");
  } else {
    node.setAttribute("aria-label", "empty");
  }
}
function paintAll() { for (let i = 0; i < state.board.length; i++) paintCell(i); }

function paintCursor() {
  $$(".cell.cursor", el.grid).forEach((n) => n.classList.remove("cursor"));
  const node = cellNode(state.cursor);
  if (node) node.classList.add("cursor");
}

/* ============ end states ============ */
function lose(hitIndex) {
  state.over = true;
  clearInterval(state.timer);
  SFX.boom();
  const mines = [];
  for (let i = 0; i < state.board.length; i++) {
    const b = state.board[i];
    if (b.mine && !b.flag) mines.push(i);
    if (b.flag && !b.mine) {
      const node = cellNode(i);
      node.classList.add("open", "wrong");
      node.innerHTML = bombSVG(true);
    }
  }
  mines.forEach((i, k) => {
    setTimeout(() => {
      const b = state.board[i];
      b.open = true;
      const node = cellNode(i);
      node.classList.add("open", "mine");
      node.innerHTML = bombSVG(false);
    }, reduceMotion ? 0 : Math.min(k * 18, 400));
  });
  const hit = cellNode(hitIndex);
  hit.classList.add("mine", "blown", "open");
  hit.innerHTML = bombSVG(false);
  setFace("dead");
  el.readout.textContent = "Boom. You hit a mine.";
  el.verdict.hidden = false;
  el.verdict.classList.add("lost");
  el.verdictLine.textContent = "You hit a mine";
  el.verdictSub.textContent =
    "Row " + ((hitIndex / state.cols | 0) + 1) + ", column " + (hitIndex % state.cols + 1) + ".";
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
  state.flags = state.mines;
  setLED(el.contacts, 0);
  setFace("win");
  SFX.win();
  el.readout.textContent = "Field cleared. Nice sweep.";

  const best = loadBest();
  const key = bestKeyFor();
  const isBest = best[key] == null || secs < best[key];
  if (isBest) { best[key] = secs; saveBest(best); }
  refreshBest();

  el.verdict.hidden = false;
  el.verdictLine.textContent = "You cleared it";
  el.verdictSub.textContent = isBest ? `${secs} seconds - a new best.` : `${secs} seconds.`;
}

/* ============ grid input ============ */
let armed = false;
el.grid.addEventListener("pointerdown", (e) => {
  if (e.button === 0 && !state.over) { armed = true; setFace("ooh"); }
});
window.addEventListener("pointerup", () => {
  if (armed && !state.over) setFace("idle");
  armed = false;
});
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
  cycleMark(+node.dataset.i);
});
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
  if (!el.customRig.hidden || !el.infoModal.hidden) {
    if (e.key === "Escape") { el.customRig.hidden = true; el.infoModal.hidden = true; }
    return;
  }
  const k = e.key.toLowerCase();
  if (e.key === "F2" || k === "r") { newGame(); return; }
  const moves = { arrowup: -state.cols, arrowdown: state.cols, arrowleft: -1, arrowright: 1 };
  if (k in moves) {
    e.preventDefault();
    const c = state.cursor % state.cols;
    if (k === "arrowleft" && c === 0) return;
    if (k === "arrowright" && c === state.cols - 1) return;
    const next = state.cursor + moves[k];
    if (next < 0 || next >= state.board.length) return;
    state.cursor = next;
    paintCursor();
    cellNode(state.cursor).focus();
  } else if (k === "f") {
    e.preventDefault();
    cycleMark(state.cursor);
  } else if (k === " " || k === "enter") {
    e.preventDefault();
    if (state.board[state.cursor].open) chord(state.cursor);
    else reveal(state.cursor);
  }
});

el.diveBtn.addEventListener("click", newGame);
el.verdictBtn.addEventListener("click", newGame);

/* ============ menu bar ============ */
function openMenu(which) {
  closeMenus();
  const menu = which === "game" ? el.gameMenu : el.helpMenu;
  const btn = which === "game" ? el.gameBtn : el.helpBtn;
  menu.hidden = false;
  btn.setAttribute("aria-expanded", "true");
}
function closeMenus() {
  el.gameMenu.hidden = true;
  el.helpMenu.hidden = true;
  el.gameBtn.setAttribute("aria-expanded", "false");
  el.helpBtn.setAttribute("aria-expanded", "false");
}
el.gameBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  el.gameMenu.hidden ? openMenu("game") : closeMenus();
});
el.helpBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  el.helpMenu.hidden ? openMenu("help") : closeMenus();
});
document.addEventListener("click", closeMenus);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenus(); });

function syncMenuTicks() {
  $$(".depth", el.gameMenu).forEach((d) =>
    d.classList.toggle("on", d.dataset.level === state.level));
  $('[data-act="marks"]', el.gameMenu).classList.toggle("on", prefs.marks);
  $('[data-act="sound"]', el.gameMenu).classList.toggle("on", prefs.sound);
}

el.gameMenu.addEventListener("click", (e) => {
  const mi = e.target.closest(".mi");
  if (!mi) return;
  e.stopPropagation();
  const depth = mi.classList.contains("depth") ? mi.dataset.level : null;
  const act = mi.dataset.act;
  if (depth) {
    state.level = depth;
    if (depth === "custom") { syncCustom(); el.customRig.hidden = false; }
    else newGame();
  } else if (act === "new") {
    newGame();
  } else if (act === "marks") {
    prefs.marks = !prefs.marks;
    savePrefs();
    if (!prefs.marks) {
      state.board.forEach((b, i) => { if (b.question) { b.question = false; paintCell(i); } });
    }
    syncMenuTicks();
  } else if (act === "sound") {
    prefs.sound = !prefs.sound;
    savePrefs();
    if (prefs.sound) tone(880, 0.05, "square", 0.06);
    syncMenuTicks();
  } else if (act === "best") {
    showBestTimes();
  }
  closeMenus();
});
el.helpMenu.addEventListener("click", (e) => {
  const mi = e.target.closest(".mi");
  if (!mi) return;
  e.stopPropagation();
  if (mi.dataset.act === "controls") showInfo("Controls", CONTROLS_HTML);
  if (mi.dataset.act === "about") showInfo("About Sapper", ABOUT_HTML);
  closeMenus();
});

/* ============ dialogs ============ */
const CONTROLS_HTML =
  "<table><tr><td>Left-click</td><td>clear a square</td></tr>" +
  "<tr><td>Right-click</td><td>flag / question / clear</td></tr>" +
  "<tr><td>Both / middle / double</td><td>chord a number</td></tr>" +
  "<tr><td>Arrows</td><td>move the keyboard cursor</td></tr>" +
  "<tr><td>F</td><td>flag under the cursor</td></tr>" +
  "<tr><td>Space / Enter</td><td>clear or chord</td></tr>" +
  "<tr><td>F2 or R</td><td>new game</td></tr></table>";
const ABOUT_HTML =
  "<p>Sapper is Minesweeper rebuilt from scratch in vanilla JavaScript, " +
  "dressed the way it looked on Windows 95: silver bevels, an LED mine counter, " +
  "and the smiley reset button that goes wide-eyed while you dig.</p>" +
  "<p>First click is always safe. Best times are kept in your browser.</p>";

function showInfo(title, html) {
  el.infoTitle.textContent = title;
  el.infoBody.innerHTML = html;
  el.infoModal.hidden = false;
}
function showBestTimes() {
  const best = loadBest();
  const rows = ["patrol", "hunter", "deep"].map((k) =>
    `<tr><td>${LEVELS[k].label}</td><td>${best[k] != null ? best[k] + " sec" : "--"}</td></tr>`).join("");
  showInfo("Best Times", `<table>${rows}</table>`);
}
el.infoOk.addEventListener("click", () => { el.infoModal.hidden = true; });
el.infoModal.addEventListener("click", (e) => { if (e.target === el.infoModal) el.infoModal.hidden = true; });

/* ============ custom-field dialog ============ */
el.customRig.addEventListener("click", (e) => {
  const step = e.target.closest(".step");
  if (!step) return;
  const wrap = step.closest("[data-stepper]");
  const dir = +step.dataset.step;
  const cur = state.custom;
  if (wrap.dataset.stepper === "cols") cur.cols = clampRange(cur.cols + dir, 5, 40);
  if (wrap.dataset.stepper === "rows") cur.rows = clampRange(cur.rows + dir, 5, 24);
  if (wrap.dataset.stepper === "mines") cur.mines = clampRange(cur.mines + dir, 2, cur.cols * cur.rows - 10);
  cur.mines = Math.min(cur.mines, cur.cols * cur.rows - 10);
  syncCustom();
});
function clampRange(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function syncCustom() {
  $("#colsVal").textContent = state.custom.cols;
  $("#rowsVal").textContent = state.custom.rows;
  $("#minesVal").textContent = state.custom.mines;
  el.customSpec.textContent = `${state.custom.cols} x ${state.custom.rows}`;
}
el.rigGo.addEventListener("click", () => {
  state.level = "custom";
  el.customRig.hidden = true;
  newGame();
});
el.rigCancel.addEventListener("click", () => {
  el.customRig.hidden = true;
  if (state.level === "custom") { state.level = "patrol"; }
  syncMenuTicks();
});
el.customRig.addEventListener("click", (e) => { if (e.target === el.customRig) el.rigCancel.click(); });

/* ============ resize ============ */
let rz;
window.addEventListener("resize", () => {
  clearTimeout(rz);
  rz = setTimeout(() => { renderGrid(); paintAll(); paintCursor(); }, 150);
});

/* ============ boot ============ */
setFace("idle");
syncCustom();
newGame();

/* pre-swept board for preview captures: ?demo */
if (/[?&]demo\b/.test(location.search)) {
  placeMines(40);
  state.started = true;
  startTimer();
  state.t0 = Date.now() - 47000;
  reveal(40);
  [0, 9, 18].forEach((i) => { if (!state.board[i].open) cycleMark(i); });
  if (!state.board[8].open) { cycleMark(8); cycleMark(8); } // a question mark
  setLED(el.clock, 47);
}
