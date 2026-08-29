/* =========================================================
   Abudora - portfolio
   ========================================================= */

/* ---------- the work ---------- */

const PROJECTS = [
  // games
  { slug: "badlands", name: "Badlands", cat: "game", accent: "#f0a03c", built: "2026-06",
    tagline: "Endless desert runner in a handheld-console shell.",
    sig: "Endless runner", tags: ["Canvas", "Game loop", "Power-ups"] },
  { slug: "nibble", name: "Nibble", cat: "game", accent: "#9ead86", built: "2026-06",
    tagline: "Nokia 3310 snake with four modes and a ghost run.",
    sig: "Four snake modes", tags: ["Canvas", "Local scores", "Modes"] },
  { slug: "tic-tac-toe", name: "Tic Tac Toe", cat: "game", accent: "#f2d47f", built: "2026-06",
    tagline: "Schoolyard chalkboard with a minimax AI.",
    sig: "Minimax AI", tags: ["Minimax", "3 levels", "Sound"] },
  { slug: "animated-car", name: "Neon Drive", cat: "game", accent: "#ff2e97", built: "2026-06",
    tagline: "A pure-SVG synthwave car with gears and turbo.",
    sig: "Pure-SVG car", tags: ["SVG", "Web Audio", "Night mode"] },
  { slug: "arcade-hub", name: "Arcade Hub", cat: "game", accent: "#12d0e6", built: "2026-06",
    tagline: "Eight mini-games in one CRT arcade cabinet.",
    sig: "Eight games in one", tags: ["8 games", "Scanlines", "High scores"] },

  // tools
  { slug: "cashbook", name: "Cashbook", cat: "tool", accent: "#b5292f", built: "2026-08",
    tagline: "A banker's ledger for personal budgets.",
    sig: "Plain-English entry", tags: ["Chart.js", "Budgets", "CSV export"] },
  { slug: "the-flatbed", name: "The Flatbed", cat: "tool", accent: "#ff5a1f", built: "2026-08",
    tagline: "Film discovery on an editing light table.",
    sig: "Recommends from your bins", tags: ["TMDB API", "Recommender", "Trailers"] },
  { slug: "soundroom", name: "SoundRoom", cat: "tool", accent: "#e8933a", built: "2026-08",
    tagline: "A record shop with a turntable and real VU meters.",
    sig: "Real VU meters", tags: ["Web Audio", "VU meters", "Playlists"] },
  { slug: "halcyon", name: "Halcyon", cat: "tool", accent: "#6aa9d8", built: "2026-08",
    tagline: "The page is the sky - a living weather poster.",
    sig: "The page is the sky", tags: ["Open-Meteo", "PWA", "Scrub the day"] },
  { slug: "xchange", name: "Xchange", cat: "tool", accent: "#ffce2e", built: "2026-06",
    tagline: "A split-flap airport board for 166 currencies.",
    sig: "Split-flap board", tags: ["Live rates", "History", "Favourites"] },
  { slug: "the-cellar-door", name: "The Cellar Door", cat: "tool", accent: "#c9a227", built: "2026-08",
    tagline: "A prohibition speakeasy that is also a password vault.",
    sig: "AES-256 vault", tags: ["AES-256", "2FA codes", "Breach check"] },
  { slug: "taskly", name: "Taskly", cat: "tool", accent: "#d0913f", built: "2026-06",
    tagline: "A stationery legal pad for your to-do list.",
    sig: "Drag-and-drop pad", tags: ["Drag & drop", "Priorities", "Undo"] },
  { slug: "vernier", name: "Vernier", cat: "tool", accent: "#ff6248", built: "2026-08",
    tagline: "A cyanotype blueprint calculator, six sheets deep.",
    sig: "Six calculator sheets", tags: ["6 modes", "Converter", "Tape log"] },
  { slug: "the-sorting-office", name: "The Sorting Office", cat: "tool", accent: "#b0413e", built: "2026-06",
    tagline: "A postal desk that inspects email addresses.",
    sig: "Live DNS lookups", tags: ["DoH lookup", "Batch", "Heuristics"] },
  { slug: "meridian", name: "Meridian", cat: "tool", accent: "#c8a45c", built: "2026-06",
    tagline: "A luxury horology analog clock with five finishes.",
    sig: "Five dial finishes", tags: ["SVG", "Timezones", "Dial finishes"] },

  // clones
  { slug: "spotify-clone", name: "Spotify", cat: "clone", accent: "#1db954", built: "2026-06",
    tagline: "A web music player with queue, lyrics and resume-on-reload.",
    sig: "Resume-on-reload", tags: ["Queue", "Karaoke", "localStorage"] },
  { slug: "windows-11-ui-clone", name: "Windows 11", cat: "clone", accent: "#4b6bff", built: "2026-06",
    tagline: "A desktop with taskbar, start menu and working apps.",
    sig: "Working window manager", tags: ["Window manager", "Start menu", "Apps"] },
  { slug: "compile", name: "Compile", cat: "clone", accent: "#a4e22e", built: "2026-06",
    tagline: "A tech-news zine on Bootstrap 5, restyled as an acid dev-zine.",
    sig: "Acid dev-zine", tags: ["Bootstrap 5", "Responsive", "Zine"] },
  { slug: "ephemeris", name: "Ephemeris", cat: "clone", accent: "#e3c27b", built: "2026-06",
    tagline: "A star atlas of code - 13 constellations, 220 snippets.",
    sig: "220 code snippets", tags: ["Prism.js", "Global search", "Reference"] },
  { slug: "off-the-record", name: "Off the Record", cat: "clone", accent: "#a03c38", built: "2026-06",
    tagline: "The incognito page as detective noir, with a fingerprint dossier.",
    sig: "Browser-fingerprint dossier", tags: ["Fingerprint", "Noir", "No storage"] },

  // sites
  { slug: "dispatch", name: "Dispatch", cat: "site", accent: "#ffb000", built: "2026-08",
    tagline: "A mini social network styled as a radio net.",
    sig: "Posts on the airwaves", tags: ["Multipage", "Threads", "Onboarding"] },
  { slug: "deblog", name: "DeBlog", cat: "site", accent: "#c0392b", built: "2026-06",
    tagline: "A broadsheet newspaper blog across five pages.",
    sig: "Broadsheet layout", tags: ["Multipage", "Search", "Evening edition"] },
  { slug: "ironclad", name: "Ironclad", cat: "site", accent: "#ff6600", built: "2026-06",
    tagline: "A brutalist gym poster with an AI workout planner.",
    sig: "AI workout planner", tags: ["Planner", "BMI gauge", "Countdown"] },
  { slug: "cinder-and-salt", name: "Cinder & Salt", cat: "site", accent: "#d5622d", built: "2026-06",
    tagline: "A warm artisan eatery, everything cooked over fire.",
    sig: "Cooked over fire", tags: ["Split hero", "Menu", "Map"] },
  { slug: "the-order-window", name: "The Order Window", cat: "site", accent: "#ff3d81", built: "2026-08",
    tagline: "A late-night diner take-out counter.",
    sig: "Combo builder + checkout", tags: ["Multipage", "Combo builder", "Checkout"] },
  { slug: "thread-and-rail", name: "Thread & Rail", cat: "site", accent: "#b81f2c", built: "2026-08",
    tagline: "A garment-district showroom with a fitting room.",
    sig: "Fitting-room look builder", tags: ["Multipage", "Lookbook", "Fit finder"] },
  { slug: "kestrel", name: "Kestrel", cat: "site", accent: "#8a7355", built: "2026-08",
    tagline: "A small-batch clothing label, editorial to the last page.",
    sig: "localStorage bag", tags: ["Bag", "Lookbook", "Archive timer"] },
  { slug: "kino", name: "Kino", cat: "site", accent: "#e8a33d", built: "2026-08",
    tagline: "A streaming service in near-black and amber.",
    sig: "Persistent My List", tags: ["Poster wall", "My List", "Trailers"] },
  { slug: "sillage", name: "Sillage", cat: "site", accent: "#a2564e", built: "2026-08",
    tagline: "A botanical fragrance house, catalogued like a herbarium.",
    sig: "Scent radar + quiz", tags: ["Multipage", "Scent quiz", "Blending bench"] },
  { slug: "the-terminal", name: "The Terminal", cat: "site", accent: "#12d0e6", built: "2026-08",
    tagline: "A dark HUD gadget store with a spec diff and command palette.",
    sig: "Spec diff + palette", tags: ["Multipage", "Spec diff", "Command palette"] },
  { slug: "deadstock", name: "DEADSTOCK", cat: "site", accent: "#ccff00", built: "2026-08",
    tagline: "A hype-drop streetwear store with box-opening reveals.",
    sig: "Box-opening reveals", tags: ["Multipage", "Countdown", "Raffle"] },
  { slug: "umbral", name: "Umbral", cat: "site", accent: "#ff7a33", built: "2026-08",
    tagline: "An astro-tourism company with a 3-mode sky simulator.",
    sig: "3-mode sky simulator", tags: ["Parallax", "Sky sim", "Countdowns"] },
  { slug: "ember-and-anvil", name: "Ember & Anvil", cat: "site", accent: "#ff6a1a", built: "2026-08",
    tagline: "A blacksmith forge that tempers metal as you scroll.",
    sig: "Scroll-driven forge", tags: ["Scroll-driven", "Spark burst", "Atmosphere"] },
  { slug: "nine-fifty-four", name: "Nine Fifty-Four", cat: "site", accent: "#b8863f", built: "2026-08",
    tagline: "A noir escape-room venue with a real, solvable lock.",
    sig: "A real solvable lock", tags: ["4-dial lock", "Cipher gate", "Hall of fame"] },
  { slug: "willowcomb", name: "Willowcomb", cat: "site", accent: "#e9a227", built: "2026-08",
    tagline: "A boutique raw-honey brand with a live 12-hive dashboard.",
    sig: "Live 12-hive dashboard", tags: ["Hive dashboard", "Harvest calendar", "Cart"] },
];

const CAT_LABEL = { game: "Game", tool: "Tool", clone: "Clone", site: "Site" };
const DEFAULT_ACCENT = "#5570ff";

/* ---------- helpers ---------- */

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const pad2 = (n) => String(n).padStart(2, "0");
const clamp01 = (n) => Math.max(0, Math.min(1, n));

/* =========================================================
   ADAPTIVE ACCENT - the chrome adopts the hovered project
   ========================================================= */

const root = document.documentElement;
let accentTimer;
function setAccent(hex) {
  clearTimeout(accentTimer);
  root.style.setProperty("--accent", hex);
}
function resetAccent() {
  clearTimeout(accentTimer);
  accentTimer = setTimeout(() => root.style.setProperty("--accent", DEFAULT_ACCENT), 260);
}

/* =========================================================
   BUILD THE GRID
   ========================================================= */

const grid = $("#exhibits");
const PLAY = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>`;
const cardBySlug = {};

PROJECTS.forEach((p, i) => {
  const el = document.createElement("a");
  el.className = "exhibit";
  el.href = `${p.slug}/`;
  el.dataset.cat = p.cat;
  el.dataset.slug = p.slug;
  el.dataset.name = p.name;
  el.dataset.i = i;
  el.dataset.search = `${p.name} ${p.tagline} ${p.sig} ${p.tags.join(" ")} ${CAT_LABEL[p.cat]}`.toLowerCase();
  el.style.setProperty("--tint", p.accent);
  // a small fixed drift for the scatter-on-launch effect
  el.style.setProperty("--sx", (Math.random() * 44 - 22).toFixed(1) + "px");
  el.style.setProperty("--sy", (Math.random() * 30 + 6).toFixed(1) + "px");
  el.setAttribute("aria-label", `${p.name} - ${p.tagline} Open project.`);

  el.innerHTML = `
    <div class="exhibit-screen" style="--tint:${p.accent}">
      <img class="exhibit-shot" src="assets/thumb/${p.slug}.webp" alt="" loading="lazy" decoding="async" width="1100" height="688" />
      <div class="screen-bar"><i></i><i></i><i></i><span class="screen-url">/${p.slug}</span></div>
      <span class="exhibit-open">Open
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg>
      </span>
      <button type="button" class="preview-btn" aria-pressed="false">${PLAY}<span>Preview</span></button>
      <div class="frame-slot"></div>
    </div>
    <div class="exhibit-meta">
      <span class="exhibit-idx">${pad2(i + 1)} / ${PROJECTS.length}</span>
      <h3 class="exhibit-name">${p.name}</h3>
      <p class="exhibit-tagline">${p.tagline}</p>
      <div class="exhibit-tags">${p.tags.map((t) => `<span>${t}</span>`).join("")}</div>
    </div>`;

  el.addEventListener("click", (e) => {
    if (e.target.closest(".preview-btn")) return;
    e.preventDefault();
    launch(el);
  });
  el.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") setAccent(p.accent); });
  el.addEventListener("pointerleave", resetAccent);
  el.addEventListener("focus", () => setAccent(p.accent));
  el.addEventListener("blur", resetAccent);

  grid.appendChild(el);
  cardBySlug[p.slug] = el;
});

/* ---------- counts ---------- */

const counts = PROJECTS.reduce((a, p) => ((a[p.cat] = (a[p.cat] || 0) + 1), a), {});
$("#cAll").textContent   = PROJECTS.length;
$("#cSite").textContent  = counts.site  || 0;
$("#cTool").textContent  = counts.tool  || 0;
$("#cGame").textContent  = counts.game  || 0;
$("#cClone").textContent = counts.clone || 0;
$("#heroCount").textContent = PROJECTS.length;

/* =========================================================
   SPECTRUM BAR - 35 accents, doubles as scroll progress
   ========================================================= */

const spectrum = $("#spectrum");
PROJECTS.forEach((p, i) => {
  const seg = document.createElement("button");
  seg.type = "button";
  seg.className = "seg";
  seg.tabIndex = -1;
  seg.style.background = p.accent;
  seg.style.setProperty("--tint", p.accent);
  seg.dataset.slug = p.slug;
  seg.setAttribute("aria-label", `${p.name} - jump`);
  seg.innerHTML = `<span class="seg-tip">${pad2(i + 1)} &middot; ${p.name}</span>`;
  seg.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") setAccent(p.accent); });
  seg.addEventListener("pointerleave", resetAccent);
  seg.addEventListener("click", () => jumpToCard(p.slug));
  spectrum.appendChild(seg);
});
const segs = $$(".seg", spectrum);
let litCount = -1;

function updateSpectrum() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const pct = max > 0 ? clamp01(window.scrollY / max) : 0;
  const lit = Math.round(pct * segs.length);
  if (lit === litCount) return;
  litCount = lit;
  segs.forEach((s, i) => s.classList.toggle("lit", i < lit));
}

/* one rAF-batched scroll handler for everything that reacts to scroll */
const scrollJobs = [updateSpectrum];
let scrollRaf = 0;
function onScrollFrame() {
  scrollRaf = 0;
  for (const job of scrollJobs) job();
}
window.addEventListener("scroll", () => {
  if (!scrollRaf) scrollRaf = requestAnimationFrame(onScrollFrame);
}, { passive: true });
window.addEventListener("resize", onScrollFrame);
onScrollFrame();

function jumpToCard(slug) {
  const card = cardBySlug[slug];
  if (!card) return;
  if (grid.classList.contains("as-index")) card.classList.add("row-open");
  card.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
  card.classList.remove("returned");
  void card.offsetWidth;
  card.classList.add("returned");
  setTimeout(() => card.classList.remove("returned"), 1800);
}

/* =========================================================
   PREVIEWS - one live iframe at a time, on demand
   ========================================================= */

const LOGICAL_W = 1280;
const MAX_LIVE = 2;
const live = [];
let autoPreview = window.matchMedia("(hover: hover) and (pointer: fine)").matches && !reduceMotion;
if (navigator.connection && navigator.connection.saveData) autoPreview = false;

let previewsOff = false;
try { previewsOff = localStorage.getItem("previewsOff") === "1"; } catch (_) {}

function scaleFrame(screen) {
  screen.style.setProperty("--scale", screen.clientWidth / LOGICAL_W);
}

function mount(el, pinned) {
  const rec = live.find((r) => r.el === el);
  if (rec) { rec.pinned = rec.pinned || pinned; return; }
  while (live.length >= MAX_LIVE) {
    const victim = live.find((r) => !r.pinned) || live[0];
    unmount(victim.el);
  }
  const screen = el.querySelector(".exhibit-screen");
  const slot = el.querySelector(".frame-slot");
  scaleFrame(screen);
  screen.classList.add("loading");

  const frame = document.createElement("iframe");
  frame.title = el.dataset.name + " preview";
  frame.setAttribute("scrolling", "no");
  frame.setAttribute("tabindex", "-1");
  frame.setAttribute("aria-hidden", "true");
  frame.setAttribute("loading", "eager");
  frame.addEventListener("load", () => {
    screen.classList.remove("loading");
    screen.classList.add("live");
  }, { once: true });
  frame.src = el.dataset.slug + "/";
  slot.appendChild(frame);

  const btn = el.querySelector(".preview-btn");
  btn.setAttribute("aria-pressed", "true");
  btn.querySelector("span").textContent = "Live";

  live.push({ el, frame, pinned: !!pinned });
}

function unmount(el) {
  const idx = live.findIndex((r) => r.el === el);
  if (idx < 0) return;
  live.splice(idx, 1);
  const screen = el.querySelector(".exhibit-screen");
  screen.classList.remove("live", "loading");
  el.querySelector(".frame-slot").innerHTML = "";
  const btn = el.querySelector(".preview-btn");
  btn.setAttribute("aria-pressed", "false");
  btn.querySelector("span").textContent = "Preview";
}

grid.addEventListener("click", (e) => {
  const btn = e.target.closest(".preview-btn");
  if (!btn) return;
  e.preventDefault();
  e.stopPropagation();
  const el = btn.closest(".exhibit");
  const rec = live.find((r) => r.el === el);
  if (rec) unmount(el);
  else mount(el, true);
});

if (autoPreview) {
  let hoverT;
  grid.addEventListener("pointerenter", (e) => {
    if (previewsOff || grid.classList.contains("as-index")) return;
    const el = e.target.closest(".exhibit");
    if (!el || e.pointerType !== "mouse") return;
    clearTimeout(hoverT);
    hoverT = setTimeout(() => mount(el, false), 260);
  }, true);
  grid.addEventListener("pointerleave", (e) => {
    const el = e.target.closest(".exhibit");
    if (!el) return;
    clearTimeout(hoverT);
    const rec = live.find((r) => r.el === el);
    if (rec && !rec.pinned) setTimeout(() => {
      const r2 = live.find((r) => r.el === el);
      if (r2 && !r2.pinned && !el.matches(":hover")) unmount(el);
    }, 380);
  }, true);
}

let rz;
window.addEventListener("resize", () => {
  clearTimeout(rz);
  rz = setTimeout(() => live.forEach((r) => scaleFrame(r.el.querySelector(".exhibit-screen"))), 150);
});

const toggle = $("#previewToggle");
function reflectToggle() {
  document.body.classList.toggle("previews-paused", previewsOff);
  toggle.setAttribute("aria-pressed", String(previewsOff));
  $(".pt-label", toggle).textContent = previewsOff ? "Hover previews off" : "Hover previews on";
}
if (!autoPreview) toggle.hidden = true;
reflectToggle();
toggle.addEventListener("click", () => {
  previewsOff = !previewsOff;
  try { localStorage.setItem("previewsOff", previewsOff ? "1" : "0"); } catch (_) {}
  reflectToggle();
});

/* =========================================================
   WALL / INDEX VIEW
   ========================================================= */

const viewToggle = $("#viewToggle");
let indexView = false;
try { indexView = localStorage.getItem("portfolioView") === "index"; } catch (_) {}

function reflectView() {
  grid.classList.toggle("as-index", indexView);
  viewToggle.setAttribute("aria-pressed", String(indexView));
  $(".vt-label", viewToggle).textContent = indexView ? "Index" : "Wall";
  if (indexView) live.slice().forEach((r) => unmount(r.el));
}
reflectView();
viewToggle.addEventListener("click", () => {
  indexView = !indexView;
  try { localStorage.setItem("portfolioView", indexView ? "index" : "wall"); } catch (_) {}
  reflectView();
});

/* =========================================================
   REVEAL - staggered on load, with a hard visibility backstop
   ========================================================= */

const revealIO = new IntersectionObserver((entries, obs) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("in");
    obs.unobserve(entry.target);
  });
}, { rootMargin: "120px" });

function armReveal(el, i) {
  revealIO.observe(el);
  setTimeout(() => el.classList.add("in"), Math.min(i, 14) * 40);
}
$$(".exhibit").forEach(armReveal);

// never leave anything invisible if the entrance transition is inert
setTimeout(() => {
  $$(".exhibit").forEach((el) => {
    el.classList.add("in");
    if (getComputedStyle(el).opacity === "0") {
      el.style.transition = "none";
      el.style.opacity = "1";
      el.style.transform = "none";
    }
  });
}, 2200);

/* =========================================================
   FILTER + SEARCH
   ========================================================= */

const chips = $$(".chip");
const searchInput = $("#search");
const noHits = $("#noHits");
let activeCat = "all";

function applyFilter() {
  const q = searchInput.value.trim().toLowerCase();
  let shown = 0;
  $$(".exhibit").forEach((el) => {
    const okCat = activeCat === "all" || el.dataset.cat === activeCat;
    const okQ = !q || el.dataset.search.includes(q);
    const show = okCat && okQ;
    el.classList.toggle("hidden", !show);
    if (show) shown++;
  });
  noHits.hidden = shown > 0;
  live.slice().forEach((r) => { if (r.el.classList.contains("hidden")) unmount(r.el); });
}

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    chips.forEach((c) => { c.classList.remove("active"); c.setAttribute("aria-selected", "false"); });
    chip.classList.add("active");
    chip.setAttribute("aria-selected", "true");
    activeCat = chip.dataset.cat;
    applyFilter();
  });
});
searchInput.addEventListener("input", applyFilter);
$("#clearFilters").addEventListener("click", () => {
  searchInput.value = "";
  chips.forEach((c) => c.classList.remove("active"));
  chips[0].classList.add("active");
  activeCat = "all";
  applyFilter();
});

/* =========================================================
   CURSOR SPOTLIGHT - a soft light tracks the pointer on the wall
   ========================================================= */

if (window.matchMedia("(hover: hover) and (pointer: fine)").matches && !reduceMotion) {
  const workSection = $("#work");
  let sx = 0, sy = 0, spotRaf = 0;
  workSection.addEventListener("pointermove", (e) => {
    const r = workSection.getBoundingClientRect();
    sx = e.clientX - r.left;
    sy = e.clientY - r.top;
    if (spotRaf) return;
    spotRaf = requestAnimationFrame(() => {
      spotRaf = 0;
      workSection.style.setProperty("--mx", sx + "px");
      workSection.style.setProperty("--my", sy + "px");
    });
  });
  workSection.addEventListener("pointerenter", () => workSection.classList.add("lit"));
  workSection.addEventListener("pointerleave", () => workSection.classList.remove("lit"));
}

/* =========================================================
   COMMAND PALETTE
   ========================================================= */

const palette = $("#palette");
const palInput = $("#palInput");
const palList = $("#palList");
let palIndex = 0;

const ACTIONS = [
  ...PROJECTS.map((p) => ({
    label: p.name, hint: CAT_LABEL[p.cat], kind: "project",
    key: `${p.name} ${p.sig} ${p.tags.join(" ")} ${p.cat}`.toLowerCase(),
    run: () => launch(cardBySlug[p.slug]),
  })),
  { label: "Shuffle - open a random project", hint: "Action", key: "shuffle random lucky dice", run: () => shuffle() },
  { label: "Toggle Wall / Index view", hint: "View", key: "wall index list view toggle", run: () => viewToggle.click() },
  { label: "Toggle hover previews", hint: "View", key: "previews hover toggle", run: () => toggle.click() },
  { label: "Go to Work", hint: "Section", key: "work projects wall", run: () => scrollToId("work") },
  { label: "Go to About", hint: "Section", key: "about bio", run: () => scrollToId("about") },
  { label: "Go to Contact", hint: "Section", key: "contact email github linkedin", run: () => scrollToId("contact") },
  { label: "GitHub - Abudora-0", hint: "Link", key: "github source code repo", run: () => window.open("https://github.com/Abudora-0", "_blank", "noopener") },
];

function scrollToId(id) {
  $("#" + id).scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
}

function renderPalette() {
  const q = palInput.value.trim().toLowerCase();
  const rank = (a) => {
    const li = a.label.toLowerCase().indexOf(q);
    if (li === 0) return 0;
    if (li > 0) return 1 + li / 100;
    return 5 + a.key.indexOf(q) / 100;
  };
  const matches = (q
    ? ACTIONS.filter((a) => a.key.includes(q) || a.label.toLowerCase().includes(q))
        .sort((a, b) => rank(a) - rank(b))
    : ACTIONS
  ).slice(0, 40);
  palIndex = 0;
  palList.innerHTML = matches
    .map((a, i) => `<li role="option" data-i="${i}" class="${i === 0 ? "on" : ""}">
      <span>${a.label}</span><span class="pal-hint">${a.hint}</span></li>`)
    .join("") || `<li class="pal-empty">Nothing matches "${palInput.value}"</li>`;
  palList._matches = matches;
}

function openPalette() {
  palette.hidden = false;
  document.body.classList.add("palette-open");
  palInput.value = "";
  renderPalette();
  palInput.focus();
}
function closePalette() {
  palette.hidden = true;
  document.body.classList.remove("palette-open");
}
function runPalette(i) {
  const a = palList._matches && palList._matches[i];
  if (!a) return;
  closePalette();
  setTimeout(a.run, 60);
}

$("#paletteBtn").addEventListener("click", openPalette);
palette.addEventListener("click", (e) => { if (e.target === palette) closePalette(); });
palInput.addEventListener("input", renderPalette);
palList.addEventListener("click", (e) => {
  const li = e.target.closest("li[data-i]");
  if (li) runPalette(+li.dataset.i);
});
palInput.addEventListener("keydown", (e) => {
  const items = $$("li[data-i]", palList);
  if (e.key === "ArrowDown") { e.preventDefault(); palIndex = Math.min(palIndex + 1, items.length - 1); }
  else if (e.key === "ArrowUp") { e.preventDefault(); palIndex = Math.max(palIndex - 1, 0); }
  else if (e.key === "Enter") { e.preventDefault(); return runPalette(palIndex); }
  else return;
  items.forEach((el, i) => el.classList.toggle("on", i === palIndex));
  items[palIndex] && items[palIndex].scrollIntoView({ block: "nearest" });
});

document.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    palette.hidden ? openPalette() : closePalette();
  } else if (e.key === "Escape" && !palette.hidden) {
    closePalette();
  } else if (e.key === "/" && palette.hidden && !/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) {
    e.preventDefault();
    openPalette();
  }
});

/* =========================================================
   SHUFFLE
   ========================================================= */

function shuffle() {
  const pool = $$(".exhibit").filter((el) => !el.classList.contains("hidden"));
  if (!pool.length) return;
  launch(pool[Math.floor(Math.random() * pool.length)]);
}
$("#shuffleBtn").addEventListener("click", shuffle);

/* =========================================================
   LAUNCH TRANSITION  (+ scatter)
   ========================================================= */

const launchEl = $("#launch");

function launch(card) {
  if (!card) return;
  const href = card.getAttribute("href");
  try { sessionStorage.setItem("fromProject", card.dataset.slug); } catch (_) {}
  if (reduceMotion) { location.href = href; return; }

  const screen = card.querySelector(".exhibit-screen");
  const r = screen.getBoundingClientRect();
  const tint = card.style.getPropertyValue("--tint") || DEFAULT_ACCENT;
  setAccent(tint.trim());

  card.classList.add("is-launching");
  grid.classList.add("scatter");

  launchEl.style.cssText =
    `top:${r.top}px;left:${r.left}px;width:${r.width}px;height:${r.height}px;--tint:${tint};`;
  launchEl.innerHTML = `<span class="launch-name">${card.dataset.name}</span>`;

  document.body.classList.add("launching");
  launchEl.setAttribute("aria-hidden", "false");

  requestAnimationFrame(() => requestAnimationFrame(() => launchEl.classList.add("go")));
  setTimeout(() => launchEl.classList.add("go"), 30);
  setTimeout(() => { location.href = href; }, 430);
}

function resetLaunch() {
  launchEl.classList.remove("go");
  launchEl.innerHTML = "";
  launchEl.setAttribute("aria-hidden", "true");
  document.body.classList.remove("launching");
  grid.classList.remove("scatter");
  $$(".exhibit.is-launching").forEach((el) => el.classList.remove("is-launching"));
}
window.addEventListener("pageshow", (e) => { if (e.persisted) resetLaunch(); });

/* =========================================================
   RETURN PULSE - highlight the card you came back from
   ========================================================= */

function returnPulse() {
  let slug;
  try { slug = sessionStorage.getItem("fromProject"); sessionStorage.removeItem("fromProject"); } catch (_) {}
  if (!slug || !cardBySlug[slug]) return;
  const card = cardBySlug[slug];
  setTimeout(() => {
    const r = card.getBoundingClientRect();
    if (r.top < 60 || r.bottom > window.innerHeight) {
      card.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    }
    card.classList.remove("returned");
    void card.offsetWidth;
    card.classList.add("returned");
    setTimeout(() => card.classList.remove("returned"), 2200);
  }, 90);
}
returnPulse();
window.addEventListener("pageshow", (e) => { if (e.persisted) returnPulse(); });

/* =========================================================
   NAV
   ========================================================= */

const nav = $("#nav");
let navScrolled = false;
scrollJobs.push(() => {
  const s = window.scrollY > 24;
  if (s !== navScrolled) { navScrolled = s; nav.classList.toggle("scrolled", s); }
});
onScrollFrame();

const burger = $("#hamburger");
const navLinks = $("#navLinks");
burger.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  burger.classList.toggle("open", open);
  burger.setAttribute("aria-expanded", String(open));
});
$$("#navLinks a").forEach((a) => a.addEventListener("click", () => {
  navLinks.classList.remove("open");
  burger.classList.remove("open");
  burger.setAttribute("aria-expanded", "false");
}));

/* =========================================================
   MAGNETIC BUTTONS
   ========================================================= */

if (window.matchMedia("(hover: hover) and (pointer: fine)").matches && !reduceMotion) {
  $$("[data-magnetic]").forEach((btn) => {
    let raf = 0;
    btn.addEventListener("pointermove", (e) => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.25;
      const y = (e.clientY - r.top - r.height / 2) * 0.38;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        btn.style.setProperty("--mag-x", x.toFixed(1) + "px");
        btn.style.setProperty("--mag-y", y.toFixed(1) + "px");
      });
    });
    btn.addEventListener("pointerleave", () => {
      btn.style.removeProperty("--mag-x");
      btn.style.removeProperty("--mag-y");
    });
  });
}

/* =========================================================
   HERO TYPING
   ========================================================= */

const typed = $("#typed");
const ROLES = ["things for the web.", "games.", "tools.", "clones.", "full sites."];
let ri = 0, ci = 0, deleting = false;
function type() {
  if (reduceMotion) { typed.textContent = "things for the web."; return; }
  const word = ROLES[ri];
  ci += deleting ? -1 : 1;
  typed.textContent = word.slice(0, ci);
  let delay = deleting ? 45 : 95;
  if (!deleting && ci === word.length) { delay = 1900; deleting = true; }
  else if (deleting && ci === 0) { deleting = false; ri = (ri + 1) % ROLES.length; delay = 320; }
  setTimeout(type, delay);
}
type();

/* =========================================================
   ABOUT COUNTERS
   ========================================================= */

function animateCount(el) {
  const target = +el.dataset.target;
  const dur = 1300;
  const t0 = performance.now();
  (function tick(now) {
    const p = Math.min((now - t0) / dur, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(tick);
  })(t0);
}
function runCount(el) {
  if (el.dataset.done) return;
  el.dataset.done = "1";
  if (reduceMotion) el.textContent = el.dataset.target;
  else animateCount(el);
}
const countIO = new IntersectionObserver((entries, obs) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    runCount(entry.target);
    obs.unobserve(entry.target);
  });
}, { threshold: 0.6 });
$$("[data-target]").forEach((el) => countIO.observe(el));
setTimeout(() => {
  $$("[data-target]").forEach((el) => {
    if (el.dataset.done) return;
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) runCount(el);
    else { el.dataset.done = "1"; el.textContent = el.dataset.target; }
  });
}, 2600);

/* =========================================================
   KONAMI - a run through the whole spectrum
   ========================================================= */

const KONAMI = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];
let kbuf = [];
document.addEventListener("keydown", (e) => {
  kbuf.push(e.key.toLowerCase());
  kbuf = kbuf.slice(-KONAMI.length);
  if (kbuf.join(",") === KONAMI.join(",")) spectrumRun();
});

function spectrumRun() {
  if (document.body.classList.contains("konami")) return;
  document.body.classList.add("konami");
  clearTimeout(accentTimer);
  const toast = $("#konamiToast");
  toast.hidden = false;
  segs.forEach((s) => s.classList.add("lit"));

  const end = () => {
    root.style.setProperty("--accent", DEFAULT_ACCENT);
    document.body.classList.remove("konami");
    toast.hidden = true;
    updateSpectrum();
  };

  if (reduceMotion) { setTimeout(end, 1600); return; }

  let k = 0;
  const total = PROJECTS.length;
  const iv = setInterval(() => {
    root.style.setProperty("--accent", PROJECTS[k % total].accent);
    if (++k >= total) { clearInterval(iv); setTimeout(end, 700); }
  }, 110);
  setTimeout(() => { clearInterval(iv); end(); }, total * 110 + 1500);
}

/* ---------- year + brand backstop ---------- */

$("#footYear").textContent = new Date().getFullYear();
setTimeout(() => {
  const ba = $(".brand .ba");
  if (ba && parseFloat(getComputedStyle(ba).opacity) < 0.5) $(".brand").classList.add("brand-settled");
}, 2000);
