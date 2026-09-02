/* ==========================================================
   SPECIMEN - a type foundry specimen book
   Vanilla JS. Google Fonts loaded per card on scroll.
   ========================================================== */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* curated catalogue - weights listed are known-good on Google Fonts */
const FONTS = [
  // serif
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
  // sans
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
  // slab
  ["Roboto Slab", "slab", [400, 500, 700]],
  ["Zilla Slab", "slab", [400, 600, 700]],
  ["Arvo", "slab", [400, 700]],
  ["Crete Round", "slab", [400]],
  ["Alfa Slab One", "slab", [400]],
  // mono
  ["JetBrains Mono", "mono", [400, 500, 700]],
  ["IBM Plex Mono", "mono", [400, 500, 600]],
  ["Space Mono", "mono", [400, 700]],
  ["Fira Code", "mono", [400, 500, 700]],
  ["Roboto Mono", "mono", [400, 500, 700]],
  ["Source Code Pro", "mono", [400, 600]],
  ["DM Mono", "mono", [400, 500]],
  ["Red Hat Mono", "mono", [400, 600]],
  // display
  ["Bebas Neue", "display", [400]],
  ["Anton", "display", [400]],
  ["Abril Fatface", "display", [400]],
  ["Righteous", "display", [400]],
  ["Bungee", "display", [400]],
  ["Monoton", "display", [400]],
  ["Staatliches", "display", [400]],
  ["Titan One", "display", [400]],
  ["Fredoka", "display", [400, 600]],
  // hand
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
  "In a specimen book the letters do the arguing. A face has to hold a headline and a footnote, a caption and a caps lock. Set it in your own words and the character shows: the pull of the serifs, the rhythm of the ascenders, the way the numerals sit on the line.";
const GLYPHS = "AaBbGgQqRr 0123456789 &@#$ ?! ,.;: “”";

const CAT_LABEL = {
  serif: "Serif", sans: "Sans", slab: "Slab", mono: "Mono", display: "Display", hand: "Hand",
};

const state = {
  text: "The quick brown fox jumps over the lazy dog",
  size: 64,
  weight: 400,
  leading: 1.15,
  tracking: 0,
  align: "left",
  transform: "none",
  view: "pangram",
  cat: "all",
  q: "",
};

let favs = [];
try { favs = JSON.parse(localStorage.getItem("specimen.favs")) || []; } catch (_) {}

const book = $("#book");
const loaded = new Set();

function fontLinkHref(name, weights) {
  const fam = name.trim().replace(/\s+/g, "+");
  const w = weights.join(";");
  return `https://fonts.googleapis.com/css2?family=${fam}:wght@${w}&display=swap`;
}
function loadFont(name, weights) {
  if (loaded.has(name)) return;
  loaded.add(name);
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = fontLinkHref(name, weights);
  document.head.appendChild(link);
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
    card.innerHTML = `
      <div class="face-head">
        <div class="face-id">
          <span class="face-no">${String(i + 1).padStart(2, "0")}</span>
          <span class="face-name">${name}</span>
          <span class="face-cat">${CAT_LABEL[cat]}</span>
        </div>
        <div class="face-tools">
          <button class="face-tool ${favs.includes(name) ? "kept" : ""}" data-act="fav" type="button">${favs.includes(name) ? "Kept" : "Keep"}</button>
          <button class="face-tool" data-act="pair" type="button">Pair</button>
          <button class="face-tool" data-act="copy" type="button">Embed</button>
        </div>
      </div>
      <div class="face-body"></div>`;
    book.appendChild(card);
    io.observe(card);
    paintBody(card);
  });
}

function activeWeight(weights) {
  // snap the requested weight to the nearest the family actually ships
  return weights.reduce((best, w) =>
    Math.abs(w - state.weight) < Math.abs(best - state.weight) ? w : best, weights[0]);
}

function paintBody(card) {
  const name = card.dataset.font;
  const weights = card.dataset.weights.split(",").map(Number);
  const w = activeWeight(weights);
  const body = card.querySelector(".face-body");
  const common =
    `--setFont:'${name}', ${fallbackFor(name)};` +
    `font-weight:${w};` +
    `letter-spacing:${state.tracking}em;` +
    `text-transform:${state.transform};` +
    `text-align:${state.align};`;

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
  if (!loaded.has(name) && isNearViewport(card)) loadFont(name, weights);
}

function repaintAll() { $$(".face").forEach(paintBody); }

function fallbackFor(name) {
  const f = FONTS.find(([n]) => n === name);
  const cat = f ? f[1] : "sans";
  return { serif: "Georgia, serif", slab: "Georgia, serif", sans: "system-ui, sans-serif",
    mono: "ui-monospace, monospace", display: "Impact, system-ui, sans-serif",
    hand: "Comic Sans MS, cursive" }[cat];
}
function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function isNearViewport(elm) {
  const r = elm.getBoundingClientRect();
  return r.top < window.innerHeight * 1.5 && r.bottom > -window.innerHeight;
}

/* lazy-load fonts as cards approach */
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const card = entry.target;
    const weights = card.dataset.weights.split(",").map(Number);
    loadFont(card.dataset.font, weights);
    setTimeout(() => paintBody(card), 60);
    io.unobserve(card);
  });
}, { rootMargin: "600px 0px" });

/* ---------- controls ---------- */
function bindRange(id, key, fmt, after) {
  const input = $("#" + id);
  const out = $("#" + id.replace("Range", "Val"));
  const apply = () => {
    state[key] = parseFloat(input.value);
    if (out) out.textContent = fmt ? fmt(state[key]) : state[key];
    repaintAll();
    if (after) after();
  };
  input.addEventListener("input", apply);
  apply();
}
bindRange("sizeRange", "size", (v) => Math.round(v));
bindRange("weightRange", "weight", (v) => Math.round(v));
bindRange("leadingRange", "leading", (v) => v.toFixed(2));
bindRange("trackingRange", "tracking", (v) => v.toFixed(3));

$("#sampleText").addEventListener("input", (e) => {
  state.text = e.target.value;
  repaintAll();
});
$("#alignSel").addEventListener("change", (e) => { state.align = e.target.value; repaintAll(); });
$("#caseSel").addEventListener("change", (e) => { state.transform = e.target.value; repaintAll(); });

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

/* card tools */
book.addEventListener("click", (e) => {
  const btn = e.target.closest(".face-tool");
  if (!btn) return;
  const card = btn.closest(".face");
  const name = card.dataset.font;
  const weights = card.dataset.weights.split(",").map(Number);
  if (btn.dataset.act === "fav") {
    if (favs.includes(name)) favs = favs.filter((f) => f !== name);
    else favs.push(name);
    try { localStorage.setItem("specimen.favs", JSON.stringify(favs)); } catch (_) {}
    if (state.cat === "fav") render();
    else {
      btn.classList.toggle("kept");
      btn.textContent = favs.includes(name) ? "Kept" : "Keep";
    }
  } else if (btn.dataset.act === "copy") {
    const fam = name.replace(/\s+/g, "+");
    const embed =
      `@import url('${fontLinkHref(name, weights)}');\n` +
      `font-family: "${name}", ${fallbackFor(name)};`;
    copy(embed, `${name} embed copied`);
  } else if (btn.dataset.act === "pair") {
    openPairing(name);
  }
});

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
  const f = FONTS.find(([n]) => n === name);
  loadFont(name, f[2]);
  drawPair();
  pairing.hidden = false;
}
function drawPair() {
  const [pName, , pW] = pairFor(pairCurrent);
  loadFont(pName, pW);
  const head = FONTS.find(([n]) => n === pairCurrent);
  const body = FONTS.find(([n]) => n === pName);
  const headFirst = head[1] === "display" || head[1] === "serif" || head[1] === "slab";
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
document.addEventListener("keydown", (e) => { if (e.key === "Escape") pairing.hidden = true; });

/* ---------- toast ---------- */
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
