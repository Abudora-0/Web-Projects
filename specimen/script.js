/* ==========================================================
   SPECIMEN - a type foundry specimen book
   Vanilla JS. Google Fonts loaded per card on scroll.
   Ground toggle, OpenType features, compare mode, shuffle.
   ========================================================== */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* curated catalogue - weights listed are known-good on Google Fonts */
const FONTS = [
  ["Playfair Display", "serif", [400, 700, 900]],
  ["Lora", "serif", [400, 500, 700]],
  ["Merriweather", "serif", [300, 400, 700]],
  ["PT Serif", "serif", [400, 700]],
  ["Cormorant Garamond", "serif", [400, 500, 700]],
  ["Source Serif 4", "serif", [400, 600, 700]],
  ["Libre Baskerville", "serif", [400, 700]],
  ["Spectral", "serif", [400, 500, 700]],
  ["EB Garamond", "serif", [400, 500, 700]],
  ["Bitter", "serif", [400, 500, 700]],
  ["Domine", "serif", [400, 500, 700]],
  ["Noto Serif Display", "serif", [400, 600, 700]],
  ["Inter", "sans", [400, 500, 700]],
  ["Roboto", "sans", [300, 400, 500, 700]],
  ["Work Sans", "sans", [400, 500, 700]],
  ["DM Sans", "sans", [400, 500, 700]],
  ["Manrope", "sans", [400, 600, 800]],
  ["Poppins", "sans", [400, 500, 700]],
  ["Montserrat", "sans", [400, 600, 700]],
  ["Nunito Sans", "sans", [400, 600, 700]],
  ["Karla", "sans", [400, 700]],
  ["Sora", "sans", [400, 600, 700]],
  ["Figtree", "sans", [400, 600, 700]],
  ["Outfit", "sans", [400, 600, 700]],
  ["Space Grotesk", "sans", [400, 500, 700]],
  ["Archivo", "sans", [400, 600, 700]],
  ["Plus Jakarta Sans", "sans", [400, 600, 700]],
  ["Hanken Grotesk", "sans", [400, 600, 700]],
  ["Roboto Slab", "slab", [400, 500, 700]],
  ["Zilla Slab", "slab", [400, 600, 700]],
  ["Arvo", "slab", [400, 700]],
  ["Crete Round", "slab", [400]],
  ["Alfa Slab One", "slab", [400]],
  ["JetBrains Mono", "mono", [400, 500, 700]],
  ["IBM Plex Mono", "mono", [400, 500, 600]],
  ["Space Mono", "mono", [400, 700]],
  ["Fira Code", "mono", [400, 500, 700]],
  ["Roboto Mono", "mono", [400, 500, 700]],
  ["Source Code Pro", "mono", [400, 600]],
  ["DM Mono", "mono", [400, 500]],
  ["Red Hat Mono", "mono", [400, 600]],
  ["Bebas Neue", "display", [400]],
  ["Anton", "display", [400]],
  ["Abril Fatface", "display", [400]],
  ["Righteous", "display", [400]],
  ["Bungee", "display", [400]],
  ["Monoton", "display", [400]],
  ["Staatliches", "display", [400]],
  ["Titan One", "display", [400]],
  ["Fredoka", "display", [400, 600]],
  ["Caveat", "hand", [400, 700]],
  ["Kalam", "hand", [400, 700]],
  ["Patrick Hand", "hand", [400]],
  ["Shadows Into Light", "hand", [400]],
  ["Permanent Marker", "hand", [400]],
  ["Architects Daughter", "hand", [400]],
  ["Gochi Hand", "hand", [400]],
  ["Caveat Brush", "hand", [400]],
];

const PANGRAMS = [
  "The quick brown fox jumps over the lazy dog",
  "Sphinx of black quartz, judge my vow",
  "Pack my box with five dozen liquor jugs",
  "How vexingly quick daft zebras jump",
];
const PARA =
  "In a specimen book the letters do the arguing. A face has to hold a headline and a footnote, a caption and a caps lock. Set it in your own words and the character shows: the pull of the serifs, the rhythm of the ascenders, the way the numerals 0123456789 sit on the line.";
const GLYPHS = "AaBbGgQqRr fi fl ffi 0123456789 &@#$ ?! .,;: “”";

const CAT_LABEL = { serif: "Serif", sans: "Sans", slab: "Slab", mono: "Mono", display: "Display", hand: "Hand" };
const OT_MAP = {
  liga: "'liga' 1, 'clig' 1", onum: "'onum' 1", smcp: "'smcp' 1",
  zero: "'zero' 1", calt: "'calt' 1",
};

const state = {
  text: "The quick brown fox jumps over the lazy dog",
  size: 64, weight: 400, leading: 1.15, tracking: 0,
  align: "left", transform: "none", view: "pangram",
  ground: "paper", density: "comfortable",
  cat: "all", q: "",
  ot: { liga: false, onum: false, smcp: false, zero: false, calt: true },
};

let favs = [];
try { favs = JSON.parse(localStorage.getItem("specimen.favs")) || []; } catch (_) {}
let compare = [];

const book = $("#book");
const loaded = new Set();

function fontLinkHref(name, weights) {
  return `https://fonts.googleapis.com/css2?family=${name.trim().replace(/\s+/g, "+")}:wght@${weights.join(";")}&display=swap`;
}
function loadFont(name, weights) {
  if (loaded.has(name)) return;
  loaded.add(name);
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = fontLinkHref(name, weights);
  document.head.appendChild(link);
}

/* ---------- helpers ---------- */
function activeWeight(weights) {
  return weights.reduce((best, w) =>
    Math.abs(w - state.weight) < Math.abs(best - state.weight) ? w : best, weights[0]);
}
function fallbackFor(name) {
  const f = FONTS.find(([n]) => n === name);
  const cat = f ? f[1] : "sans";
  return { serif: "Georgia, serif", slab: "Georgia, serif", sans: "system-ui, sans-serif",
    mono: "ui-monospace, monospace", display: "Impact, system-ui, sans-serif",
    hand: "Comic Sans MS, cursive" }[cat];
}
function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function otSettings() {
  const on = Object.entries(state.ot).filter(([, v]) => v).map(([k]) => OT_MAP[k]).filter(Boolean);
  return on.length ? `font-feature-settings:${on.join(", ")};` : "";
}
function commonStyle(name, w) {
  return `--setFont:'${name}', ${fallbackFor(name)};font-weight:${w};` +
    `letter-spacing:${state.tracking}em;text-transform:${state.transform};` +
    `text-align:${state.align};${otSettings()}`;
}

/* ---------- build cards ---------- */
function render() {
  book.innerHTML = "";
  const list = FONTS.filter(([name, cat]) => {
    if (state.cat === "fav") return favs.includes(name);
    if (state.cat !== "all" && cat !== state.cat) return false;
    if (state.q && !name.toLowerCase().includes(state.q)) return false;
    return true;
  });
  $("#shownCount").textContent = list.length;

  list.forEach(([name, cat, weights], i) => {
    const card = document.createElement("section");
    card.className = "face";
    card.dataset.font = name;
    card.dataset.weights = weights.join(",");
    const dots = weights.map(() => "<i></i>").join("");
    card.innerHTML = `
      <div class="face-head">
        <div class="face-id">
          <span class="face-no">${String(i + 1).padStart(2, "0")}</span>
          <span class="face-name">${name}</span>
          <span class="face-cat">${CAT_LABEL[cat]}</span>
          <span class="face-weights" title="${weights.length} weights">${dots}</span>
        </div>
        <div class="face-tools">
          <button class="face-tool ${favs.includes(name) ? "kept" : ""}" data-act="fav" type="button">${favs.includes(name) ? "Kept" : "Keep"}</button>
          <button class="face-tool ${compare.includes(name) ? "in-compare" : ""}" data-act="compare" type="button">Compare</button>
          <button class="face-tool" data-act="pair" type="button">Pair</button>
          <button class="face-tool" data-act="copy" type="button">Embed</button>
        </div>
      </div>
      <div class="face-body"></div>`;
    book.appendChild(card);
    io.observe(card);
    revealIO.observe(card);
    paintBody(card);
  });
  // backstop for reveal if IO never fires
  setTimeout(() => $$(".face").forEach((c) => c.classList.add("in")), 1800);
}

function paintBody(card) {
  const name = card.dataset.font;
  const weights = card.dataset.weights.split(",").map(Number);
  const w = activeWeight(weights);
  const body = card.querySelector(".face-body");
  const common = commonStyle(name, w);

  if (state.view === "glyphs") {
    body.innerHTML = `<div class="glyph-row" style="${common}">${escapeHtml(GLYPHS)}</div>`;
  } else if (state.view === "paragraph") {
    body.innerHTML =
      `<div class="face-set" style="${common}font-size:${Math.max(15, state.size / 3.2)}px;line-height:${state.leading};">${escapeHtml(PARA)}</div>`;
  } else {
    const txt = state.text || PANGRAMS[0];
    body.innerHTML =
      `<div class="face-set" style="${common}font-size:${state.size}px;line-height:${state.leading};">${escapeHtml(txt)}</div>`;
  }
}
function repaintAll() { $$(".face").forEach(paintBody); }

/* lazy-load fonts as cards approach */
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const card = entry.target;
    loadFont(card.dataset.font, card.dataset.weights.split(",").map(Number));
    setTimeout(() => paintBody(card), 60);
    io.unobserve(card);
  });
}, { rootMargin: "700px 0px" });

const revealIO = new IntersectionObserver((entries, obs) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("in");
    obs.unobserve(entry.target);
  });
}, { rootMargin: "80px" });

/* ---------- range + text controls ---------- */
function bindRange(id, key, fmt) {
  const input = $("#" + id);
  const out = $("#" + id.replace("Range", "Val"));
  const apply = () => {
    state[key] = parseFloat(input.value);
    if (out) out.textContent = fmt ? fmt(state[key]) : state[key];
    repaintAll();
  };
  input.addEventListener("input", apply);
  apply();
}
bindRange("sizeRange", "size", (v) => Math.round(v));
bindRange("weightRange", "weight", (v) => Math.round(v));
bindRange("leadingRange", "leading", (v) => v.toFixed(2));
bindRange("trackingRange", "tracking", (v) => v.toFixed(3));

$("#sampleText").addEventListener("input", (e) => { state.text = e.target.value; repaintAll(); });
$("#alignSel").addEventListener("change", (e) => { state.align = e.target.value; repaintAll(); });
$("#caseSel").addEventListener("change", (e) => { state.transform = e.target.value; repaintAll(); });
$("#groundSel").addEventListener("change", (e) => {
  state.ground = e.target.value;
  document.body.dataset.ground = state.ground;
});
$("#densitySel").addEventListener("change", (e) => {
  state.density = e.target.value;
  document.body.dataset.density = state.density;
});
$("#otGrid").addEventListener("change", (e) => {
  const box = e.target.closest("input[data-ot]");
  if (!box) return;
  state.ot[box.dataset.ot] = box.checked;
  repaintAll();
});

$("#viewSeg").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  $$("#viewSeg button").forEach((b) => b.classList.toggle("on", b === btn));
  state.view = btn.dataset.view;
  repaintAll();
});

$("#filterBar").addEventListener("click", (e) => {
  const chip = e.target.closest(".fchip");
  if (!chip) return;
  $$(".fchip").forEach((c) => c.classList.toggle("on", c === chip));
  state.cat = chip.dataset.cat;
  render();
});
$("#fontSearch").addEventListener("input", (e) => {
  state.q = e.target.value.trim().toLowerCase();
  render();
});

/* ---------- shuffle ---------- */
$("#shuffleBtn").addEventListener("click", () => {
  const list = $$(".face");
  if (!list.length) return;
  const card = list[Math.floor(Math.random() * list.length)];
  const sizes = [40, 56, 72, 96, 120];
  const aligns = ["left", "center", "right"];
  $("#sizeRange").value = sizes[Math.floor(Math.random() * sizes.length)];
  $("#sizeRange").dispatchEvent(new Event("input"));
  const w = card.dataset.weights.split(",").map(Number);
  $("#weightRange").value = w[w.length - 1];
  $("#weightRange").dispatchEvent(new Event("input"));
  $("#alignSel").value = aligns[Math.floor(Math.random() * aligns.length)];
  $("#alignSel").dispatchEvent(new Event("change"));
  card.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
  card.classList.remove("in");
  void card.offsetWidth;
  card.classList.add("in");
  toast("Jumped to " + card.dataset.font);
});

/* ---------- card tools ---------- */
book.addEventListener("click", (e) => {
  const btn = e.target.closest(".face-tool");
  if (!btn) return;
  const card = btn.closest(".face");
  const name = card.dataset.font;
  const weights = card.dataset.weights.split(",").map(Number);
  const act = btn.dataset.act;

  if (act === "fav") {
    favs = favs.includes(name) ? favs.filter((f) => f !== name) : [...favs, name];
    try { localStorage.setItem("specimen.favs", JSON.stringify(favs)); } catch (_) {}
    if (state.cat === "fav") render();
    else { btn.classList.toggle("kept"); btn.textContent = favs.includes(name) ? "Kept" : "Keep"; }
  } else if (act === "compare") {
    toggleCompare(name);
    $$(`.face-tool[data-act="compare"]`).forEach((b) =>
      b.classList.toggle("in-compare", compare.includes(b.closest(".face").dataset.font)));
  } else if (act === "copy") {
    copy(`@import url('${fontLinkHref(name, weights)}');\nfont-family: "${name}", ${fallbackFor(name)};`,
      `${name} embed copied`);
  } else if (act === "pair") {
    openPairing(name);
  }
});

/* ---------- compare ---------- */
const tray = $("#compareTray");
function toggleCompare(name) {
  const i = compare.indexOf(name);
  if (i >= 0) compare.splice(i, 1);
  else { compare.push(name); if (compare.length > 2) compare.shift(); }
  reflectCompare();
}
function reflectCompare() {
  tray.hidden = compare.length === 0;
  $("#ctSlot0").textContent = compare[0] || "--";
  $("#ctSlot1").textContent = compare[1] || "--";
  $("#ctGo").disabled = compare.length !== 2;
}
$("#ctClear").addEventListener("click", () => {
  compare = [];
  reflectCompare();
  $$(`.face-tool[data-act="compare"]`).forEach((b) => b.classList.remove("in-compare"));
});
$("#ctGo").addEventListener("click", () => {
  const cols = compare.map((name) => {
    const f = FONTS.find(([n]) => n === name);
    loadFont(name, f[2]);
    const w = activeWeight(f[2]);
    return `<div class="cv-col">
      <span class="cv-cat">${CAT_LABEL[f[1]]}</span>
      <h3>${name}</h3>
      <div class="cv-sample" style="${commonStyle(name, w)}font-size:${Math.min(state.size, 88)}px;line-height:${state.leading};">${escapeHtml(state.text || PANGRAMS[0])}</div>
      <div class="cv-sample" style="font-family:'${name}',${fallbackFor(name)};font-size:16px;line-height:1.6;${otSettings()}">${escapeHtml(PARA)}</div>
    </div>`;
  }).join("");
  $("#cvCols").innerHTML = cols;
  $("#compareView").hidden = false;
});
$("#cvClose").addEventListener("click", () => { $("#compareView").hidden = true; });
$("#compareView").addEventListener("click", (e) => { if (e.target === $("#compareView")) $("#compareView").hidden = true; });

/* ---------- pairing ---------- */
const pairing = $("#pairing");
let pairCurrent = null;
function pairFor(name) {
  const f = FONTS.find(([n]) => n === name);
  const cat = f ? f[1] : "sans";
  const wants = cat === "serif" || cat === "slab" ? ["sans", "mono"] : ["serif", "slab"];
  const pool = FONTS.filter(([n, c]) => wants.includes(c) && n !== name);
  return pool[Math.floor(Math.random() * pool.length)];
}
function openPairing(name) {
  pairCurrent = name;
  $("#pairFor").textContent = name;
  loadFont(name, FONTS.find(([n]) => n === name)[2]);
  drawPair();
  pairing.hidden = false;
}
function drawPair() {
  const [pName, , pW] = pairFor(pairCurrent);
  loadFont(pName, pW);
  const head = FONTS.find(([n]) => n === pairCurrent);
  const headFirst = ["display", "serif", "slab"].includes(head[1]);
  const hName = headFirst ? pairCurrent : pName;
  const bName = headFirst ? pName : pairCurrent;
  $("#pairPreview").innerHTML =
    `<h4 style="font-family:'${hName}',${fallbackFor(hName)}">${hName} sets the headline</h4>` +
    `<p style="font-family:'${bName}',${fallbackFor(bName)}">${escapeHtml(PARA)}</p>` +
    `<p class="pairing-k" style="margin-top:10px">${hName} + ${bName}</p>`;
}
$("#pairShuffle").addEventListener("click", drawPair);
$("#pairingClose").addEventListener("click", () => { pairing.hidden = true; });
pairing.addEventListener("click", (e) => { if (e.target === pairing) pairing.hidden = true; });
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") { pairing.hidden = true; $("#compareView").hidden = true; }
});

/* ---------- utils ---------- */
async function copy(text, msg) {
  try { await navigator.clipboard.writeText(text); }
  catch (_) {
    const ta = document.createElement("textarea");
    ta.value = text; document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    ta.remove();
  }
  toast(msg);
}
let toastT;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastT);
  toastT = setTimeout(() => { t.hidden = true; }, 1600);
}

/* ---------- boot ---------- */
render();

/* a set-up book for preview captures: ?demo */
if (/[?&]demo\b/.test(location.search)) {
  $("#sampleText").value = "Typeface";
  $("#sampleText").dispatchEvent(new Event("input"));
  $("#sizeRange").value = 108;
  $("#sizeRange").dispatchEvent(new Event("input"));
  $("#weightRange").value = 700;
  $("#weightRange").dispatchEvent(new Event("input"));
  const target = $$(".face").find((c) => c.dataset.font === "Playfair Display");
  if (target) {
    loadFont("Playfair Display", [400, 700, 900]);
    setTimeout(() => paintBody(target), 40);
  }
  $$(".face").forEach((c) => c.classList.add("in"));
}
