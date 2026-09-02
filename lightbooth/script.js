/* ==========================================================
   LIGHTBOOTH - colour sampling bench
   Image eyedropper + palette extractor. Vanilla JS + canvas.
   ========================================================== */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const img = $("#image");
const ix = img.getContext("2d", { willReadFrequently: true });
const loupe = $("#loupe");
const loupeCv = $("#loupeCanvas");
const lx = loupeCv.getContext("2d");

const el = {
  fileInput: $("#fileInput"),
  pasteBtn: $("#pasteBtn"),
  stage: $("#stage"),
  stageHint: $("#stageHint"),
  loupeHex: $("#loupeHex"),
  paletteRow: $("#paletteRow"),
  shelfRow: $("#shelfRow"),
  shelfEmpty: $("#shelfEmpty"),
  chipBig: $("#chipBig"),
  chipSave: $("#chipSave"),
  valHex: $("#valHex"),
  valRgb: $("#valRgb"),
  valHsl: $("#valHsl"),
  valOklch: $("#valOklch"),
  ramp: $("#ramp"),
  cpText: $("#cpText"),
  cpBg: $("#cpBg"),
  cpSwap: $("#cpSwap"),
  ratio: $("#ratio"),
  badges: $("#badges"),
  cpSample: $("#cpSample"),
  exportBtn: $("#exportBtn"),
  clearShelf: $("#clearShelf"),
  dropVeil: $("#dropVeil"),
  toast: $("#toast"),
};

let imgData = null;         // ImageData of the drawn image
let selected = [58, 58, 58];
let shelf = [];
const SHELF_KEY = "lightbooth.shelf";
try { shelf = JSON.parse(localStorage.getItem(SHELF_KEY)) || []; } catch (_) {}

/* ============ colour maths ============ */
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const to255 = (n) => clamp(Math.round(n), 0, 255);

function toHex([r, g, b]) {
  return "#" + [r, g, b].map((v) => to255(v).toString(16).padStart(2, "0")).join("").toUpperCase();
}
function rgbToHsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}
function srgbToLinear(c) {
  c /= 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
function rgbToOklch([r, g, b]) {
  const lr = srgbToLinear(r), lg = srgbToLinear(g), lb = srgbToLinear(b);
  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;
  const l_ = Math.cbrt(l), m_ = Math.cbrt(m), s_ = Math.cbrt(s);
  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const A = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;
  const C = Math.sqrt(A * A + B * B);
  let H = Math.atan2(B, A) * 180 / Math.PI;
  if (H < 0) H += 360;
  return [L, C, H];
}
function relLuminance([r, g, b]) {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}
function contrastRatio(a, b) {
  const la = relLuminance(a), lb = relLuminance(b);
  const hi = Math.max(la, lb), lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}
function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}
function mix(a, b, t) {
  return a.map((v, i) => v + (b[i] - v) * t);
}

/* ============ formats for a colour ============ */
function fmts(rgb) {
  const hsl = rgbToHsl(rgb);
  const [L, C, H] = rgbToOklch(rgb);
  return {
    hex: toHex(rgb),
    rgb: `${to255(rgb[0])}, ${to255(rgb[1])}, ${to255(rgb[2])}`,
    hsl: `${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%`,
    oklch: `${L.toFixed(3)} ${C.toFixed(3)} ${H.toFixed(1)}`,
    rgbFull: `rgb(${to255(rgb[0])} ${to255(rgb[1])} ${to255(rgb[2])})`,
    hslFull: `hsl(${hsl[0]} ${hsl[1]}% ${hsl[2]}%)`,
    oklchFull: `oklch(${L.toFixed(3)} ${C.toFixed(3)} ${H.toFixed(1)})`,
  };
}

/* ============ image loading ============ */
let lastSource = null, lastDims = [0, 0];
function fitImage(source, w, h) {
  lastSource = source; lastDims = [w, h];
  const stageW = el.stage.clientWidth || el.stage.parentElement.clientWidth || 640;
  const maxW = Math.max(260, Math.min(stageW - 2, 900));
  const maxH = Math.max(220, Math.round(window.innerHeight * 0.62));
  const scale = Math.max(0.05, Math.min(maxW / w, maxH / h, 1));
  img.width = Math.max(1, Math.round(w * scale));
  img.height = Math.max(1, Math.round(h * scale));
  ix.drawImage(source, 0, 0, img.width, img.height);
  imgData = ix.getImageData(0, 0, img.width, img.height);
  extractPalette();
}

function loadFromImg(image) {
  fitImage(image, image.naturalWidth, image.naturalHeight);
  el.stageHint.textContent = "Move over the image for the loupe. Click to keep a colour.";
}

function loadFile(file) {
  if (!file || !file.type.startsWith("image/")) { toast("That is not an image"); return; }
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.onload = () => { loadFromImg(image); URL.revokeObjectURL(url); };
  image.onerror = () => { toast("Could not read that image"); URL.revokeObjectURL(url); };
  image.src = url;
}

/* a generated colour test card so the bench is never empty */
function drawTestCard() {
  const w = 760, h = 460;
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const g = c.getContext("2d");
  // sky-to-water gradient
  const grad = g.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "#f4b26b");
  grad.addColorStop(0.42, "#d9648f");
  grad.addColorStop(0.55, "#7a4a86");
  grad.addColorStop(1, "#16324a");
  g.fillStyle = grad;
  g.fillRect(0, 0, w, h);
  // sun
  g.fillStyle = "#ffe6a8";
  g.beginPath(); g.arc(w * 0.7, h * 0.4, 46, 0, Math.PI * 2); g.fill();
  // container-stack silhouette
  const cols = ["#e2483d", "#3fb1d6", "#f2a81e", "#5fb96a", "#4f7fd6"];
  for (let i = 0; i < 14; i++) {
    g.fillStyle = cols[i % cols.length];
    const bw = 46, bh = 26 + (i % 3) * 10;
    g.fillRect(30 + i * 50, h - 70 - bh, bw, bh);
  }
  g.fillStyle = "#0c1f2e";
  g.fillRect(0, h - 44, w, 44);
  // reference swatch strip
  const sw = ["#111111", "#ffffff", "#808080", "#c0392b", "#2ecc71", "#2946ff", "#f1c40f"];
  sw.forEach((s, i) => { g.fillStyle = s; g.fillRect(i * (w / sw.length), 0, w / sw.length, 26); });
  fitImage(c, w, h);
  el.stageHint.textContent = "Drop an image anywhere, or load one. Sampling the test card for now.";
}

/* ============ palette extraction (coarse quantise) ============ */
function extractPalette() {
  if (!imgData) return;
  const buckets = new Map();
  const d = imgData.data;
  const step = Math.max(4, Math.floor(d.length / 4 / 12000)) * 4;
  for (let i = 0; i < d.length; i += step) {
    if (d[i + 3] < 128) continue;
    const r = d[i], g = d[i + 1], b = d[i + 2];
    const key = (r >> 4) + "," + (g >> 4) + "," + (b >> 4);
    let e = buckets.get(key);
    if (!e) { e = { r: 0, g: 0, b: 0, n: 0 }; buckets.set(key, e); }
    e.r += r; e.g += g; e.b += b; e.n++;
  }
  const list = [...buckets.values()]
    .map((e) => ({ rgb: [e.r / e.n, e.g / e.n, e.b / e.n], n: e.n }))
    .sort((a, b) => b.n - a.n);

  // greedily pick distinct colours
  const picked = [];
  for (const item of list) {
    if (picked.length >= 6) break;
    const far = picked.every((p) => dist(p, item.rgb) > 48);
    if (far) picked.push(item.rgb);
  }
  while (picked.length < Math.min(6, list.length)) picked.push(list[picked.length].rgb);

  el.paletteRow.innerHTML = "";
  picked.forEach((rgb) => el.paletteRow.appendChild(makeChip(rgb.map(Math.round))));
  if (picked[0]) select(picked[0].map(Math.round));
}
function dist(a, b) {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);
}

function makeChip(rgb, onShelf) {
  const wrap = document.createElement(onShelf ? "div" : "button");
  wrap.className = onShelf ? "chip shelf-chip" : "chip";
  if (!onShelf) wrap.type = "button";
  wrap.style.position = "relative";
  const hex = toHex(rgb);
  wrap.innerHTML =
    `<span class="chip-sw" style="background:${hex}"></span>` +
    `<span class="chip-hex">${hex.replace("#", "")}</span>` +
    (onShelf ? `<button class="del" aria-label="Remove" title="Remove">x</button>` : "");
  wrap.addEventListener("click", (e) => {
    if (e.target.classList.contains("del")) {
      shelf = shelf.filter((s) => toHex(s) !== hex);
      persistShelf(); renderShelf();
      return;
    }
    select(rgb);
  });
  return wrap;
}

/* ============ selection + readouts ============ */
function select(rgb) {
  selected = rgb.map(to255);
  const f = fmts(selected);
  el.chipBig.style.setProperty("--c", f.hex);
  el.valHex.textContent = f.hex;
  el.valRgb.textContent = f.rgb;
  el.valHsl.textContent = f.hsl;
  el.valOklch.textContent = f.oklch;
  buildRamp();
  el.cpText.style.setProperty("--c", f.hex);
  updateContrast();
}

function buildRamp() {
  const white = [255, 255, 255], black = [0, 0, 0];
  const stops = [
    mix(selected, white, 0.6),
    mix(selected, white, 0.3),
    selected,
    mix(selected, black, 0.3),
    mix(selected, black, 0.6),
  ];
  el.ramp.innerHTML = "";
  stops.forEach((s) => {
    const hex = toHex(s);
    const span = document.createElement("span");
    span.style.background = hex;
    span.dataset.hex = hex;
    span.style.setProperty("--lbl", relLuminance(s) > 0.5 ? "#000" : "#fff");
    span.title = hex;
    span.addEventListener("click", () => select(s.map(Math.round)));
    el.ramp.appendChild(span);
  });
}

/* ============ contrast ============ */
function chipRgb(node) {
  return hexToRgb(node.style.getPropertyValue("--c").trim() || "#000000");
}
function updateContrast() {
  const t = chipRgb(el.cpText), b = chipRgb(el.cpBg);
  const ratio = contrastRatio(t, b);
  el.ratio.textContent = ratio.toFixed(2);
  const tests = [
    ["AA text", ratio >= 4.5],
    ["AA large", ratio >= 3],
    ["AAA text", ratio >= 7],
    ["UI 3:1", ratio >= 3],
  ];
  el.badges.innerHTML = tests
    .map(([lbl, ok]) => `<span class="badge ${ok ? "pass" : "fail"}">${lbl}</span>`)
    .join("");
  el.cpSample.style.setProperty("--cp-bg", toHex(b));
  el.cpSample.style.setProperty("--cp-fg", toHex(t));
}
el.cpSwap.addEventListener("click", () => {
  const t = el.cpText.style.getPropertyValue("--c");
  el.cpText.style.setProperty("--c", el.cpBg.style.getPropertyValue("--c"));
  el.cpBg.style.setProperty("--c", t);
  updateContrast();
});
[el.cpText, el.cpBg].forEach((node) => {
  node.addEventListener("click", () => {
    node.style.setProperty("--c", toHex(selected));
    updateContrast();
  });
});

/* ============ shelf ============ */
function persistShelf() {
  try { localStorage.setItem(SHELF_KEY, JSON.stringify(shelf)); } catch (_) {}
}
function renderShelf() {
  el.shelfRow.innerHTML = "";
  if (!shelf.length) {
    const p = document.createElement("p");
    p.className = "shelf-empty";
    p.textContent = "Click the image or a palette chip to keep a colour here.";
    el.shelfRow.appendChild(p);
    return;
  }
  shelf.forEach((rgb) => el.shelfRow.appendChild(makeChip(rgb, true)));
}
function keepSelected() {
  const hex = toHex(selected);
  if (shelf.some((s) => toHex(s) === hex)) { toast("Already on the shelf"); return; }
  shelf.push(selected.slice());
  persistShelf();
  renderShelf();
  toast(hex + " kept");
}
el.chipSave.addEventListener("click", keepSelected);
el.clearShelf.addEventListener("click", () => { shelf = []; persistShelf(); renderShelf(); });

/* ============ copy ============ */
$$(".copy").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const f = fmts(selected);
    const map = { hex: f.hex, rgb: f.rgbFull, hsl: f.hslFull, oklch: f.oklchFull };
    const text = map[btn.dataset.copy];
    try { await navigator.clipboard.writeText(text); }
    catch (_) {
      const ta = document.createElement("textarea");
      ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); } catch (e) {}
      ta.remove();
    }
    btn.classList.add("done");
    const old = btn.textContent;
    btn.textContent = "ok";
    setTimeout(() => { btn.classList.remove("done"); btn.textContent = old; }, 1000);
  });
});

/* ============ export ============ */
el.exportBtn.addEventListener("click", () => {
  const list = shelf.length ? shelf : [...el.paletteRow.querySelectorAll(".chip-sw")]
    .map((n) => hexToRgb(rgbStrToHex(getComputedStyle(n).backgroundColor)));
  if (!list.length) { toast("Nothing to export"); return; }
  const hexes = list.map(toHex);
  const css = ":root {\n" + hexes.map((h, i) => `  --swatch-${i + 1}: ${h};`).join("\n") + "\n}";
  const json = JSON.stringify(hexes, null, 2);
  const blob = new Blob(
    [`/* Lightbooth palette */\n\n${css}\n\n/* JSON */\n${json}\n`],
    { type: "text/plain" }
  );
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "lightbooth-palette.txt";
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
});
function rgbStrToHex(str) {
  const m = str.match(/\d+/g);
  return m ? toHex([+m[0], +m[1], +m[2]]) : "#000000";
}

/* ============ loupe + sampling ============ */
function pixelAt(cx, cy) {
  if (!imgData) return [0, 0, 0];
  const x = clamp(Math.floor(cx), 0, imgData.width - 1);
  const y = clamp(Math.floor(cy), 0, imgData.height - 1);
  const i = (y * imgData.width + x) * 4;
  return [imgData.data[i], imgData.data[i + 1], imgData.data[i + 2]];
}
function canvasCoords(e) {
  const r = img.getBoundingClientRect();
  const sx = img.width / r.width, sy = img.height / r.height;
  return { x: (e.clientX - r.left) * sx, y: (e.clientY - r.top) * sy, cx: e.clientX, cy: e.clientY };
}
img.addEventListener("pointermove", (e) => {
  if (!imgData) return;
  const { x, y, cx, cy } = canvasCoords(e);
  const span = 13;                 // source pixels shown across the loupe
  const cellPx = 130 / span;       // magnified pixel size
  lx.imageSmoothingEnabled = false;
  lx.clearRect(0, 0, 130, 130);
  lx.drawImage(img, x - span / 2, y - span / 2, span, span, 0, 0, 130, 130);
  // centre-pixel marker
  lx.strokeStyle = "rgba(255,255,255,0.9)";
  lx.lineWidth = 1;
  lx.strokeRect(65 - cellPx / 2, 65 - cellPx / 2, cellPx, cellPx);
  lx.strokeStyle = "rgba(0,0,0,0.7)";
  lx.strokeRect(65 - cellPx / 2 - 1, 65 - cellPx / 2 - 1, cellPx + 2, cellPx + 2);
  const rgb = pixelAt(x, y);
  el.loupeHex.textContent = toHex(rgb);
  loupe.hidden = false;
  loupe.style.left = cx + "px";
  loupe.style.top = cy + "px";
});
img.addEventListener("pointerleave", () => { loupe.hidden = true; });
img.addEventListener("click", (e) => {
  const { x, y } = canvasCoords(e);
  const rgb = pixelAt(x, y);
  select(rgb);
  keepSelected();
});

/* ============ drag + drop, paste, file ============ */
el.fileInput.addEventListener("change", (e) => loadFile(e.target.files[0]));
["dragenter", "dragover"].forEach((ev) =>
  window.addEventListener(ev, (e) => { e.preventDefault(); el.dropVeil.hidden = false; })
);
["dragleave", "drop"].forEach((ev) =>
  window.addEventListener(ev, (e) => {
    e.preventDefault();
    if (ev === "dragleave" && e.relatedTarget) return;
    el.dropVeil.hidden = true;
  })
);
window.addEventListener("drop", (e) => {
  const file = e.dataTransfer.files && e.dataTransfer.files[0];
  if (file) loadFile(file);
});
el.pasteBtn.addEventListener("click", async () => {
  try {
    const items = await navigator.clipboard.read();
    for (const item of items) {
      const type = item.types.find((t) => t.startsWith("image/"));
      if (type) { loadFile(new File([await item.getType(type)], "pasted", { type })); return; }
    }
    toast("No image on the clipboard");
  } catch (_) { toast("Clipboard access was blocked"); }
});
window.addEventListener("paste", (e) => {
  const item = [...(e.clipboardData?.items || [])].find((i) => i.type.startsWith("image/"));
  if (item) loadFile(item.getAsFile());
});

let toastT;
function toast(msg) {
  el.toast.textContent = msg;
  el.toast.hidden = false;
  clearTimeout(toastT);
  toastT = setTimeout(() => { el.toast.hidden = true; }, 1600);
}

/* refit the current image when the bench resizes */
let rzT;
window.addEventListener("resize", () => {
  clearTimeout(rzT);
  rzT = setTimeout(() => {
    if (lastSource) fitImage(lastSource, lastDims[0], lastDims[1]);
  }, 200);
});

/* ============ boot ============ */
renderShelf();
drawTestCard();
// a second pass once layout has definitely settled (rAF is paused while hidden)
window.addEventListener("load", () => { if (lastSource) fitImage(lastSource, lastDims[0], lastDims[1]); });
