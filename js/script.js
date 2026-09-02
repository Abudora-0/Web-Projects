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
  { slug: "arcade-hub", name: "Arcade Hub", cat: "game", accent: "#12d0e6", built: "2026-06",
    tagline: "Eight mini-games in one CRT arcade cabinet.",
    sig: "Eight games in one", tags: ["8 games", "Scanlines", "High scores"] },
  { slug: "deep-six", name: "Deep Six", cat: "game", accent: "#46c98a", built: "2026-09",
    tagline: "Minesweeper as a submarine sonar console.",
    sig: "Sonar-sweep reveals", tags: ["First-click safe", "Chording", "Best-dive log"] },
  { slug: "dry-dock", name: "Dry Dock", cat: "game", accent: "#f2a81e", built: "2026-09",
    tagline: "Tetris as a dockyard container crane.",
    sig: "Clear a tier, ship sails", tags: ["Canvas", "7-bag", "Hold + ghost"] },

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
  { slug: "lightbooth", name: "Lightbooth", cat: "tool", accent: "#d94f8c", built: "2026-09",
    tagline: "A colour-matching booth with an eyedropper and palette puller.",
    sig: "Loupe + palette extract", tags: ["Eyedropper", "OKLCH", "WCAG contrast"] },
  { slug: "specimen", name: "Specimen", cat: "tool", accent: "#e2483d", built: "2026-09",
    tagline: "A type-foundry specimen book of nearly sixty faces.",
    sig: "Set in your own words", tags: ["Google Fonts", "Type tester", "Pairings"] },
  { slug: "slipbox", name: "Slipbox", cat: "tool", accent: "#a9762f", built: "2026-09",
    tagline: "Notes as index cards in a card catalogue.",
    sig: "Bracket links + backlinks", tags: ["Markdown-lite", "Wikilinks", "localStorage"] },
  { slug: "reckoner", name: "Ready Reckoner", cat: "tool", accent: "#297a52", built: "2026-09",
    tagline: "A pocket conversion book for units and live currency.",
    sig: "Everything, plus currency", tags: ["18 categories", "Live rates", "Equivalents"] },

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

/* ---------- hero rail: latest builds ---------- */

const RAIL_SLUGS = ["reckoner", "slipbox", "specimen", "lightbooth", "dry-dock"];
const railList = $("#railList");
const heroRail = $("#heroRail");
if (railList && heroRail) {
  const rows = RAIL_SLUGS.map((s) => PROJECTS.find((p) => p.slug === s)).filter(Boolean);
  if (rows.length) {
    railList.innerHTML = rows
      .map(
        (p) =>
          `<li><a href="${p.slug}/" data-slug="${p.slug}">` +
          `<span class="rail-dot" style="--d:${p.accent}"></span>` +
          `<span class="rail-name">${p.name}</span>` +
          `<span class="rail-sig">${p.sig || CAT_LABEL[p.cat] || ""}</span></a></li>`
      )
      .join("");
    heroRail.hidden = false;
    railList.querySelectorAll("a").forEach((a) => {
      const p = rows.find((r) => r.slug === a.dataset.slug);
      a.addEventListener("click", (e) => { e.preventDefault(); jumpToCard(p.slug); });
      a.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") setAccent(p.accent); });
      a.addEventListener("pointerleave", resetAccent);
      a.addEventListener("focus", () => setAccent(p.accent));
      a.addEventListener("blur", resetAccent);
    });
  }
}

/* =========================================================
   SPECTRUM BAR - one accent per project, doubles as scroll progress
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
const toTop = $("#toTop");
let toTopShown = false;
scrollJobs.push(() => {
  const s = window.scrollY > 24;
  if (s !== navScrolled) { navScrolled = s; nav.classList.toggle("scrolled", s); }
  if (toTop) {
    const t = window.scrollY > window.innerHeight * 0.8;
    if (t !== toTopShown) { toTopShown = t; toTop.classList.toggle("show", t); }
  }
});
onScrollFrame();

const burger = $("#hamburger");
const navLinks = $("#navLinks");
function setMenu(open) {
  navLinks.classList.toggle("open", open);
  burger.classList.toggle("open", open);
  burger.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("menu-open", open);
}
burger.addEventListener("click", () => setMenu(!navLinks.classList.contains("open")));
$$("#navLinks a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && navLinks.classList.contains("open")) setMenu(false);
});

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

/* ---------- copy email ---------- */

const copyBtn = $(".cp-copy");
if (copyBtn) {
  copyBtn.addEventListener("click", async () => {
    const text = copyBtn.dataset.copy;
    try {
      await navigator.clipboard.writeText(text);
    } catch (_) {
      const t = document.createElement("textarea");
      t.value = text; document.body.appendChild(t); t.select();
      try { document.execCommand("copy"); } catch (e) {}
      t.remove();
    }
    const label = copyBtn.textContent;
    copyBtn.textContent = "Copied";
    copyBtn.classList.add("done");
    setTimeout(() => { copyBtn.textContent = label; copyBtn.classList.remove("done"); }, 1600);
  });
}

/* ---------- skill icons (simple-icons paths + a few hand-drawn) ---------- */

const SKILL_ICONS = {
  "JavaScript": { f: 1, d: "M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z" },
  "C++": { f: 1, d: "M22.394 6c-.167-.29-.398-.543-.652-.69L12.926.22c-.509-.294-1.34-.294-1.848 0L2.26 5.31c-.508.293-.923 1.013-.923 1.6v10.18c0 .294.104.62.271.91.167.29.398.543.652.69l8.816 5.09c.508.293 1.34.293 1.848 0l8.816-5.09c.254-.147.485-.4.652-.69.167-.29.27-.616.27-.91V6.91c.003-.294-.1-.62-.268-.91zM12 19.11c-3.92 0-7.109-3.19-7.109-7.11 0-3.92 3.19-7.11 7.11-7.11a7.133 7.133 0 016.156 3.553l-3.076 1.78a3.567 3.567 0 00-3.08-1.78A3.56 3.56 0 008.444 12 3.56 3.56 0 0012 15.555a3.57 3.57 0 003.08-1.778l3.078 1.78A7.135 7.135 0 0112 19.11zm7.11-6.715h-.79v.79h-.79v-.79h-.79v-.79h.79v-.79h.79v.79h.79zm2.962 0h-.79v.79h-.79v-.79h-.79v-.79h.79v-.79h.79v.79h.79z" },
  "Python": { f: 1, d: "M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09zm13.09 3.95l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01zm-6.47 14.25l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08z" },
  "PHP": { f: 1, d: "M7.01 10.207h-.944l-.515 2.648h.838c.556 0 .97-.105 1.242-.314.272-.21.455-.559.55-1.049.092-.47.05-.802-.124-.995-.175-.193-.523-.29-1.047-.29zM12 5.688C5.373 5.688 0 8.514 0 12s5.373 6.313 12 6.313S24 15.486 24 12c0-3.486-5.373-6.312-12-6.312zm-3.26 7.451c-.261.25-.575.438-.917.551-.336.108-.765.164-1.285.164H5.357l-.327 1.681H3.652l1.23-6.326h2.65c.797 0 1.378.209 1.744.628.366.418.476 1.002.33 1.752a2.836 2.836 0 0 1-.305.847c-.143.255-.33.49-.561.703zm4.024.715l.543-2.799c.063-.318.039-.536-.068-.651-.107-.116-.336-.174-.687-.174H11.46l-.704 3.625H9.388l1.23-6.327h1.367l-.327 1.682h1.218c.767 0 1.295.134 1.586.401s.378.7.263 1.299l-.572 2.944h-1.389zm7.597-2.265a2.782 2.782 0 0 1-.305.847c-.143.255-.33.49-.561.703a2.44 2.44 0 0 1-.917.551c-.336.108-.765.164-1.286.164h-1.18l-.327 1.682h-1.378l1.23-6.326h2.649c.797 0 1.378.209 1.744.628.366.417.477 1.001.331 1.751zM17.766 10.207h-.943l-.516 2.648h.838c.557 0 .971-.105 1.242-.314.272-.21.455-.559.551-1.049.092-.47.049-.802-.125-.995s-.524-.29-1.047-.29z" },
  "Java": { f: 1, d: "M11.915 0 11.7.215C9.515 2.4 7.47 6.39 6.046 10.483c-1.064 1.024-3.633 2.81-3.711 3.551-.093.87 1.746 2.611 1.55 3.235-.198.625-1.304 1.408-1.014 1.939.1.188.823.011 1.277-.491a13.389 13.389 0 0 0-.017 2.14c.076.906.27 1.668.643 2.232.372.563.956.911 1.667.911.397 0 .727-.114 1.024-.264.298-.149.571-.33.91-.5.68-.34 1.634-.666 3.53-.604 1.903.062 2.872.39 3.559.704.687.314 1.15.664 1.925.664.767 0 1.395-.336 1.807-.9.412-.563.631-1.33.72-2.24.06-.623.055-1.32 0-2.066.454.45 1.117.604 1.213.424.29-.53-.816-1.314-1.013-1.937-.198-.624 1.642-2.366 1.549-3.236-.08-.748-2.707-2.568-3.748-3.586C16.428 6.374 14.308 2.394 12.13.215zm.175 6.038a2.95 2.95 0 0 1 2.943 2.942 2.95 2.95 0 0 1-2.943 2.943A2.95 2.95 0 0 1 9.148 8.98a2.95 2.95 0 0 1 2.942-2.942zM8.685 7.983a3.515 3.515 0 0 0-.145.997c0 1.951 1.6 3.55 3.55 3.55 1.95 0 3.55-1.598 3.55-3.55 0-.329-.046-.648-.132-.951.334.095.64.208.915.336a42.699 42.699 0 0 1 2.042 5.829c.678 2.545 1.01 4.92.846 6.607-.082.844-.29 1.51-.606 1.94-.315.431-.713.651-1.315.651-.593 0-.932-.27-1.673-.61-.741-.338-1.825-.694-3.792-.758-1.974-.064-3.073.293-3.821.669-.375.188-.659.373-.911.5s-.466.2-.752.2c-.53 0-.876-.209-1.16-.64-.285-.43-.474-1.101-.545-1.948-.141-1.693.176-4.069.823-6.614a43.155 43.155 0 0 1 1.934-5.783c.348-.167.749-.31 1.192-.425zm-3.382 4.362a.216.216 0 0 1 .13.031c-.166.56-.323 1.116-.463 1.665a33.849 33.849 0 0 0-.547 2.555 3.9 3.9 0 0 0-.2-.39c-.58-1.012-.914-1.642-1.16-2.08.315-.24 1.679-1.755 2.24-1.781zm13.394.01c.562.027 1.926 1.543 2.24 1.783-.246.438-.58 1.068-1.16 2.08a4.428 4.428 0 0 0-.163.309 32.354 32.354 0 0 0-.562-2.49 40.579 40.579 0 0 0-.482-1.652.216.216 0 0 1 .127-.03z" },
  "SQL": { f: 0, s: '<ellipse cx="12" cy="5.5" rx="7" ry="2.7"/><path d="M5 5.5v13c0 1.5 3.13 2.7 7 2.7s7-1.2 7-2.7v-13"/><path d="M5 12c0 1.5 3.13 2.7 7 2.7s7-1.2 7-2.7"/>' },
  "HTML": { f: 1, d: "M1.5 0h21l-1.91 21.563L11.977 24l-8.564-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.23-2.622L5.412 4.41l.698 8.01h9.126l-.326 3.426-2.91.804-2.955-.81-.188-2.11H6.248l.33 4.171L12 19.351l5.379-1.443.744-8.157H8.531z" },
  "CSS": { f: 1, d: "M0 0v20.16A3.84 3.84 0 0 0 3.84 24h16.32A3.84 3.84 0 0 0 24 20.16V3.84A3.84 3.84 0 0 0 20.16 0Zm14.256 13.08c1.56 0 2.28 1.08 2.304 2.64h-1.608c.024-.288-.048-.6-.144-.84-.096-.192-.288-.264-.552-.264-.456 0-.696.264-.696.84-.024.576.288.888.768 1.08.72.288 1.608.744 1.92 1.296q.432.648.432 1.656c0 1.608-.912 2.592-2.496 2.592-1.656 0-2.4-1.032-2.424-2.688h1.68c0 .792.264 1.176.792 1.176.264 0 .456-.072.552-.24.192-.312.24-1.176-.048-1.512-.312-.408-.912-.6-1.32-.816q-.828-.396-1.224-.936c-.24-.36-.36-.888-.36-1.536 0-1.44.936-2.472 2.424-2.448m5.4 0c1.584 0 2.304 1.08 2.328 2.64h-1.608c0-.288-.048-.6-.168-.84-.096-.192-.264-.264-.528-.264-.48 0-.72.264-.72.84s.288.888.792 1.08c.696.288 1.608.744 1.92 1.296.264.432.408.984.408 1.656.024 1.608-.888 2.592-2.472 2.592-1.68 0-2.424-1.056-2.448-2.688h1.68c0 .744.264 1.176.792 1.176.264 0 .456-.072.552-.24.216-.312.264-1.176-.048-1.512-.288-.408-.888-.6-1.32-.816-.552-.264-.96-.576-1.2-.936s-.36-.888-.36-1.536c-.024-1.44.912-2.472 2.4-2.448m-11.031.018c.711-.006 1.419.198 1.839.63.432.432.672 1.128.648 1.992H9.336c.024-.456-.096-.792-.432-.96-.312-.144-.768-.048-.888.24-.12.264-.192.576-.168.864v3.504c0 .744.264 1.128.768 1.128a.65.65 0 0 0 .552-.264c.168-.24.192-.552.168-.84h1.776c.096 1.632-.984 2.712-2.568 2.688-1.536 0-2.496-.864-2.472-2.472v-4.032c0-.816.24-1.44.696-1.848.432-.408 1.146-.624 1.857-.63" },
  "React": { f: 1, d: "M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z" },
  "Next.js": { f: 1, d: "M18.665 21.978C16.758 23.255 14.465 24 12 24 5.377 24 0 18.623 0 12S5.377 0 12 0s12 5.377 12 12c0 3.583-1.574 6.801-4.067 9.001L9.219 7.2H7.2v9.596h1.615V9.251l9.85 12.727Zm-3.332-8.533 1.6 2.061V7.2h-1.6v6.245Z" },
  "Tailwind": { f: 1, d: "M12.001,4.8c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 C13.666,10.618,15.027,12,18.001,12c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C16.337,6.182,14.976,4.8,12.001,4.8z M6.001,12c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 c1.177,1.194,2.538,2.576,5.512,2.576c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C10.337,13.382,8.976,12,6.001,12z" },
  "Node.js": { f: 1, d: "M11.998,24c-0.321,0-0.641-0.084-0.922-0.247l-2.936-1.737c-0.438-0.245-0.224-0.332-0.08-0.383 c0.585-0.203,0.703-0.25,1.328-0.604c0.065-0.037,0.151-0.023,0.218,0.017l2.256,1.339c0.082,0.045,0.197,0.045,0.272,0l8.795-5.076 c0.082-0.047,0.134-0.141,0.134-0.238V6.921c0-0.099-0.053-0.192-0.137-0.242l-8.791-5.072c-0.081-0.047-0.189-0.047-0.271,0 L3.075,6.68C2.99,6.729,2.936,6.825,2.936,6.921v10.15c0,0.097,0.054,0.189,0.139,0.235l2.409,1.392 c1.307,0.654,2.108-0.116,2.108-0.89V7.787c0-0.142,0.114-0.253,0.256-0.253h1.115c0.139,0,0.255,0.112,0.255,0.253v10.021 c0,1.745-0.95,2.745-2.604,2.745c-0.508,0-0.909,0-2.026-0.551L2.28,18.675c-0.57-0.329-0.922-0.945-0.922-1.604V6.921 c0-0.659,0.353-1.275,0.922-1.603l8.795-5.082c0.557-0.315,1.296-0.315,1.848,0l8.794,5.082c0.57,0.329,0.924,0.944,0.924,1.603 v10.15c0,0.659-0.354,1.273-0.924,1.604l-8.794,5.078C12.643,23.916,12.324,24,11.998,24z M19.099,13.993 c0-1.9-1.284-2.406-3.987-2.763c-2.731-0.361-3.009-0.548-3.009-1.187c0-0.528,0.235-1.233,2.258-1.233 c1.807,0,2.473,0.389,2.747,1.607c0.024,0.115,0.129,0.199,0.247,0.199h1.141c0.071,0,0.138-0.031,0.186-0.081 c0.048-0.054,0.074-0.123,0.067-0.196c-0.177-2.098-1.571-3.076-4.388-3.076c-2.508,0-4.004,1.058-4.004,2.833 c0,1.925,1.488,2.457,3.895,2.695c2.88,0.282,3.103,0.703,3.103,1.269c0,0.983-0.789,1.402-2.642,1.402 c-2.327,0-2.839-0.584-3.011-1.742c-0.02-0.124-0.126-0.215-0.253-0.215h-1.137c-0.141,0-0.254,0.112-0.254,0.253 c0,1.482,0.806,3.248,4.655,3.248C17.501,17.007,19.099,15.91,19.099,13.993z" },
  "Git & GitHub": { f: 1, d: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" },
  "Vercel": { f: 1, d: "m12 1.608 12 20.784H0Z" },
  "Figma": { f: 1, d: "M15.852 8.981h-4.588V0h4.588c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.491-4.49 4.491zM12.735 7.51h3.117c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-3.117V7.51zm0 1.471H8.148c-2.476 0-4.49-2.014-4.49-4.49S5.672 0 8.148 0h4.588v8.981zm-4.587-7.51c-1.665 0-3.019 1.355-3.019 3.019s1.354 3.02 3.019 3.02h3.117V1.471H8.148zm4.587 15.019H8.148c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h4.588v8.98zM8.148 8.981c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h3.117V8.981H8.148zM8.172 24c-2.489 0-4.515-2.014-4.515-4.49s2.014-4.49 4.49-4.49h4.588v4.441c0 2.503-2.047 4.539-4.563 4.539zm-.024-7.51a3.023 3.023 0 0 0-3.019 3.019c0 1.665 1.365 3.019 3.044 3.019 1.705 0 3.093-1.376 3.093-3.068v-2.97H8.148zm7.704 0h-.098c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h.098c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.49-4.49 4.49zm-.097-7.509c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h.098c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-.098z" },
  "Data structures": { f: 0, s: '<circle cx="12" cy="5" r="2.4"/><circle cx="5.5" cy="18.5" r="2.4"/><circle cx="18.5" cy="18.5" r="2.4"/><path d="M10.4 7 6.9 16.4M13.6 7l3.5 9.4"/>' },
  "OOP": { f: 0, s: '<rect x="3.5" y="3.5" width="12" height="12" rx="2"/><rect x="8.5" y="8.5" width="12" height="12" rx="2"/>' },
};

$$(".skill-col li").forEach((li) => {
  const ic = SKILL_ICONS[li.textContent.trim()];
  if (!ic) return;
  const inner = ic.d ? `<path d="${ic.d}"/>` : ic.s;
  const attrs = ic.f
    ? 'fill="currentColor"'
    : 'fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"';
  li.insertAdjacentHTML("afterbegin",
    `<svg class="skill-ico" viewBox="0 0 24 24" aria-hidden="true" ${attrs}>${inner}</svg>`);
});

/* ---------- year + brand backstop ---------- */

$("#footYear").textContent = new Date().getFullYear();
setTimeout(() => {
  const ba = $(".brand .ba");
  if (ba && parseFloat(getComputedStyle(ba).opacity) < 0.5) $(".brand").classList.add("brand-settled");
}, 2000);
