/* =========================================================
   Abudora - portfolio
   ========================================================= */

/* ---------- the work ---------- */

const PROJECTS = [
  // games
  { slug: "badlands",          name: "Badlands",        cat: "game",  accent: "#f0a03c",
    tagline: "Endless desert runner in a handheld-console shell.",
    tags: ["Canvas", "Game loop", "Power-ups"] },
  { slug: "nibble",            name: "Nibble",          cat: "game",  accent: "#9ead86",
    tagline: "Nokia 3310 snake with four modes and a ghost run.",
    tags: ["Canvas", "Local scores", "Modes"] },
  { slug: "tic-tac-toe",       name: "Tic Tac Toe",     cat: "game",  accent: "#f2d47f",
    tagline: "Schoolyard chalkboard with a minimax AI.",
    tags: ["Minimax", "3 levels", "Sound"] },
  { slug: "animated-car",      name: "Neon Drive",      cat: "game",  accent: "#ff2e97",
    tagline: "A pure-SVG synthwave car with gears and turbo.",
    tags: ["SVG", "Web Audio", "Night mode"] },
  { slug: "arcade-hub",        name: "Arcade Hub",      cat: "game",  accent: "#12d0e6",
    tagline: "Eight mini-games in one CRT arcade cabinet.",
    tags: ["8 games", "Scanlines", "High scores"] },

  // tools
  { slug: "cashbook",          name: "Cashbook",        cat: "tool",  accent: "#b5292f",
    tagline: "A banker's ledger for personal budgets.",
    tags: ["Chart.js", "Budgets", "CSV export"] },
  { slug: "the-flatbed",       name: "The Flatbed",     cat: "tool",  accent: "#ff5a1f",
    tagline: "Film discovery on an editing light table.",
    tags: ["TMDB API", "Recommender", "Trailers"] },
  { slug: "soundroom",         name: "SoundRoom",       cat: "tool",  accent: "#e8933a",
    tagline: "A record shop with a turntable and real VU meters.",
    tags: ["Web Audio", "VU meters", "Playlists"] },
  { slug: "halcyon",           name: "Halcyon",         cat: "tool",  accent: "#6aa9d8",
    tagline: "The page is the sky - a living weather poster.",
    tags: ["Open-Meteo", "PWA", "Scrub the day"] },
  { slug: "xchange",           name: "Xchange",         cat: "tool",  accent: "#ffce2e",
    tagline: "A split-flap airport board for 166 currencies.",
    tags: ["Live rates", "History", "Favourites"] },
  { slug: "the-cellar-door",   name: "The Cellar Door", cat: "tool",  accent: "#c9a227",
    tagline: "A prohibition speakeasy that is also a password vault.",
    tags: ["AES-256", "2FA codes", "Breach check"] },
  { slug: "taskly",            name: "Taskly",          cat: "tool",  accent: "#d0913f",
    tagline: "A stationery legal pad for your to-do list.",
    tags: ["Drag & drop", "Priorities", "Undo"] },
  { slug: "vernier",           name: "Vernier",         cat: "tool",  accent: "#ff6248",
    tagline: "A cyanotype blueprint calculator, six sheets deep.",
    tags: ["6 modes", "Converter", "Tape log"] },
  { slug: "the-sorting-office", name: "The Sorting Office", cat: "tool", accent: "#b0413e",
    tagline: "A postal desk that inspects email addresses.",
    tags: ["DoH lookup", "Batch", "Heuristics"] },
  { slug: "meridian",          name: "Meridian",        cat: "tool",  accent: "#c8a45c",
    tagline: "A luxury horology analog clock with five finishes.",
    tags: ["SVG", "Timezones", "Dial finishes"] },

  // clones
  { slug: "spotify-clone",     name: "Spotify",         cat: "clone", accent: "#1db954",
    tagline: "A web music player with queue, lyrics and resume-on-reload.",
    tags: ["Queue", "Karaoke", "localStorage"] },
  { slug: "windows-11-ui-clone", name: "Windows 11",    cat: "clone", accent: "#4b6bff",
    tagline: "A desktop with taskbar, start menu and working apps.",
    tags: ["Window manager", "Start menu", "Apps"] },
  { slug: "compile",           name: "Compile",         cat: "clone", accent: "#a4e22e",
    tagline: "A tech-news zine on Bootstrap 5, restyled as an acid dev-zine.",
    tags: ["Bootstrap 5", "Responsive", "Zine"] },
  { slug: "ephemeris",         name: "Ephemeris",       cat: "clone", accent: "#e3c27b",
    tagline: "A star atlas of code - 13 constellations, 220 snippets.",
    tags: ["Prism.js", "Global search", "Reference"] },
  { slug: "off-the-record",    name: "Off the Record",  cat: "clone", accent: "#a03c38",
    tagline: "The incognito page as detective noir, with a fingerprint dossier.",
    tags: ["Fingerprint", "Noir", "No storage"] },

  // sites
  { slug: "dispatch",          name: "Dispatch",        cat: "site",  accent: "#ffb000",
    tagline: "A mini social network styled as a radio net.",
    tags: ["Multipage", "Threads", "Onboarding"] },
  { slug: "deblog",            name: "DeBlog",          cat: "site",  accent: "#c0392b",
    tagline: "A broadsheet newspaper blog across five pages.",
    tags: ["Multipage", "Search", "Evening edition"] },
  { slug: "ironclad",          name: "Ironclad",        cat: "site",  accent: "#ff6600",
    tagline: "A brutalist gym poster with an AI workout planner.",
    tags: ["Planner", "BMI gauge", "Countdown"] },
  { slug: "cinder-and-salt",   name: "Cinder & Salt",   cat: "site",  accent: "#d5622d",
    tagline: "A warm artisan eatery, everything cooked over fire.",
    tags: ["Split hero", "Menu", "Map"] },
  { slug: "the-order-window",  name: "The Order Window", cat: "site", accent: "#ff3d81",
    tagline: "A late-night diner take-out counter.",
    tags: ["Multipage", "Combo builder", "Checkout"] },
  { slug: "thread-and-rail",   name: "Thread & Rail",   cat: "site",  accent: "#b81f2c",
    tagline: "A garment-district showroom with a fitting room.",
    tags: ["Multipage", "Lookbook", "Fit finder"] },
  { slug: "kestrel",           name: "Kestrel",         cat: "site",  accent: "#8a7355",
    tagline: "A small-batch clothing label, editorial to the last page.",
    tags: ["Bag", "Lookbook", "Archive timer"] },
  { slug: "kino",              name: "Kino",            cat: "site",  accent: "#e8a33d",
    tagline: "A streaming service in near-black and amber.",
    tags: ["Poster wall", "My List", "Trailers"] },
  { slug: "sillage",           name: "Sillage",         cat: "site",  accent: "#a2564e",
    tagline: "A botanical fragrance house, catalogued like a herbarium.",
    tags: ["Multipage", "Scent quiz", "Blending bench"] },
  { slug: "the-terminal",      name: "The Terminal",    cat: "site",  accent: "#12d0e6",
    tagline: "A dark HUD gadget store with a spec diff and command palette.",
    tags: ["Multipage", "Spec diff", "Command palette"] },
  { slug: "deadstock",         name: "DEADSTOCK",       cat: "site",  accent: "#ccff00",
    tagline: "A hype-drop streetwear store with box-opening reveals.",
    tags: ["Multipage", "Countdown", "Raffle"] },
  { slug: "umbral",            name: "Umbral",          cat: "site",  accent: "#ff7a33",
    tagline: "An astro-tourism company with a 3-mode sky simulator.",
    tags: ["Parallax", "Sky sim", "Countdowns"] },
  { slug: "ember-and-anvil",   name: "Ember & Anvil",   cat: "site",  accent: "#ff6a1a",
    tagline: "A blacksmith forge that tempers metal as you scroll.",
    tags: ["Scroll-driven", "Spark burst", "Atmosphere"] },
  { slug: "nine-fifty-four",   name: "Nine Fifty-Four", cat: "site",  accent: "#b8863f",
    tagline: "A noir escape-room venue with a real, solvable lock.",
    tags: ["4-dial lock", "Cipher gate", "Hall of fame"] },
  { slug: "willowcomb",        name: "Willowcomb",      cat: "site",  accent: "#e9a227",
    tagline: "A boutique raw-honey brand with a live 12-hive dashboard.",
    tags: ["Hive dashboard", "Harvest calendar", "Cart"] },
];

const CAT_LABEL = { game: "Game", tool: "Tool", clone: "Clone", site: "Site" };

/* ---------- helpers ---------- */

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const pad2 = (n) => String(n).padStart(2, "0");

/* ---------- build the grid ---------- */

const grid = $("#exhibits");

PROJECTS.forEach((p, i) => {
  const el = document.createElement("a");
  el.className = "exhibit";
  el.href = `../${p.slug}/`;
  el.dataset.cat = p.cat;
  el.dataset.search = `${p.name} ${p.tagline} ${p.tags.join(" ")} ${CAT_LABEL[p.cat]}`.toLowerCase();
  el.style.setProperty("--tint", p.accent);
  el.setAttribute("aria-label", `${p.name} - ${p.tagline} Open project.`);

  el.innerHTML = `
    <div class="exhibit-screen" style="--tint:${p.accent}">
      <span class="exhibit-badge">${pad2(i + 1)} / ${PROJECTS.length}</span>
      <span class="exhibit-open">Open
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg>
      </span>
      <iframe data-src="../${p.slug}/" title="${p.name} preview" loading="lazy" tabindex="-1" scrolling="no" aria-hidden="true"></iframe>
    </div>
    <div class="exhibit-meta">
      <h3 class="exhibit-name">${p.name}</h3>
      <p class="exhibit-tagline">${p.tagline}</p>
      <div class="exhibit-tags">${p.tags.map((t) => `<span>${t}</span>`).join("")}</div>
    </div>`;

  el.addEventListener("click", (e) => {
    e.preventDefault();
    launch(el, el.href);
  });

  grid.appendChild(el);
});

/* ---------- counts ---------- */

const counts = PROJECTS.reduce((a, p) => ((a[p.cat] = (a[p.cat] || 0) + 1), a), {});
$("#cAll").textContent   = PROJECTS.length;
$("#cSite").textContent  = counts.site  || 0;
$("#cTool").textContent  = counts.tool  || 0;
$("#cGame").textContent  = counts.game  || 0;
$("#cClone").textContent = counts.clone || 0;
$("#heroCount").textContent = PROJECTS.length;

/* ---------- scale the preview iframes to their card ---------- */

const LOGICAL_W = 1280;
function rescale() {
  $$(".exhibit-screen").forEach((s) => {
    s.style.setProperty("--scale", s.clientWidth / LOGICAL_W);
  });
}
rescale();
let rz;
window.addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(rescale, 150); });

/* ---------- lazy previews: a windowed loader ----------
   Only cards near the viewport get a live iframe. Cards that
   scroll well away are unloaded again so we never keep 35
   documents (and 5 game loops) alive at once. */

const MAX_CONCURRENT = 2;
let inFlight = 0;
const queue = [];
let paused = false;

try {
  paused = localStorage.getItem("previewsPaused") === "1";
} catch (_) {}
if (reduceMotion) paused = true;
if (navigator.connection && navigator.connection.saveData) paused = true;

function pump() {
  if (paused) return;
  while (inFlight < MAX_CONCURRENT && queue.length) {
    const frame = queue.shift();
    if (!frame || frame.dataset.state) continue;
    inFlight++;
    frame.dataset.state = "loading";
    frame.addEventListener("load", () => {
      inFlight--;
      if (frame.dataset.state === "loading") {
        frame.dataset.state = "live";
        frame.closest(".exhibit-screen").classList.add("loaded");
      }
      pump();
    }, { once: true });
    frame.src = frame.dataset.src;
  }
}

function unload(frame) {
  const q = queue.indexOf(frame);
  if (q > -1) queue.splice(q, 1);
  if (frame.dataset.state === "loading") inFlight = Math.max(0, inFlight - 1);
  frame.removeAttribute("src");
  delete frame.dataset.state;
  frame.closest(".exhibit-screen").classList.remove("loaded");
}

const NEAR = () => window.innerHeight * 0.5 + 300;
const FAR  = () => window.innerHeight + 700;

function sweep() {
  const near = NEAR(), far = FAR();
  $$(".exhibit").forEach((el) => {
    const frame = el.querySelector(".exhibit-screen iframe");
    if (!frame) return;
    const r = el.getBoundingClientRect();
    const offscreen = r.top - window.innerHeight > 0 ? r.top - window.innerHeight : (r.bottom < 0 ? -r.bottom : 0);
    const hidden = el.classList.contains("hidden");

    if (!hidden && offscreen < near && !frame.dataset.state && !queue.includes(frame)) {
      queue.push(frame);
    } else if ((hidden || offscreen > far) && frame.dataset.state) {
      unload(frame);
    }
  });
  pump();
}

let raf = 0;
const scheduleSweep = () => {
  if (raf) return;
  raf = requestAnimationFrame(() => { raf = 0; sweep(); });
};
window.addEventListener("scroll", scheduleSweep, { passive: true });
window.addEventListener("resize", scheduleSweep, { passive: true });
setInterval(sweep, 1500);
setTimeout(sweep, 400);

// preview toggle
const toggle = $("#previewToggle");
function reflectToggle() {
  document.body.classList.toggle("previews-paused", paused);
  toggle.setAttribute("aria-pressed", String(paused));
  $(".pt-label", toggle).textContent = paused ? "Previews off" : "Previews on";
}
reflectToggle();
toggle.addEventListener("click", () => {
  paused = !paused;
  try { localStorage.setItem("previewsPaused", paused ? "1" : "0"); } catch (_) {}
  reflectToggle();
  if (!paused) sweep();
});

/* ---------- reveal on scroll ---------- */

const revealIO = new IntersectionObserver((entries, obs) => {
  entries.forEach((entry, i) => {
    if (!entry.isIntersecting) return;
    setTimeout(() => entry.target.classList.add("in"), (i % 6) * 60);
    obs.unobserve(entry.target);
  });
}, { threshold: 0.08 });
$$(".exhibit").forEach((el) => revealIO.observe(el));
setTimeout(() => $$(".exhibit:not(.in)").forEach((el) => el.classList.add("in")), 1800);

/* ---------- filter + search ---------- */

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
  rescale();
  sweep();
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

/* ---------- launch transition ---------- */

const launchEl = $("#launch");

function launch(card, href) {
  if (reduceMotion) { location.href = href; return; }

  const screen = card.querySelector(".exhibit-screen");
  const r = screen.getBoundingClientRect();
  const slug = href.replace(/[./]/g, (m) => (m === "/" ? "-" : "")); // harmless id
  const tint = card.style.getPropertyValue("--tint") || "#333";

  launchEl.style.cssText =
    `top:${r.top}px;left:${r.left}px;width:${r.width}px;height:${r.height}px;` +
    `--tint:${tint};--scale:${r.width / LOGICAL_W};` +
    `--fill-scale:${Math.max(window.innerWidth / LOGICAL_W, window.innerHeight / 800)};` +
    `background:linear-gradient(180deg,#191920,#0e0e12);`;

  const live = screen.querySelector("iframe");
  const clone = document.createElement("iframe");
  clone.setAttribute("scrolling", "no");
  clone.setAttribute("tabindex", "-1");
  clone.setAttribute("aria-hidden", "true");
  clone.src = (live && live.src) || (live && live.dataset.src) || href;
  launchEl.innerHTML = "";
  launchEl.appendChild(clone);

  document.body.classList.add("launching");
  launchEl.setAttribute("aria-hidden", "false");

  requestAnimationFrame(() => {
    requestAnimationFrame(() => launchEl.classList.add("go"));
  });

  setTimeout(() => { location.href = href; }, 430);
}

// coming back via bfcache: reset the overlay
window.addEventListener("pageshow", (e) => {
  if (e.persisted) {
    launchEl.classList.remove("go");
    launchEl.innerHTML = "";
    launchEl.setAttribute("aria-hidden", "true");
    document.body.classList.remove("launching");
  }
});

/* ---------- nav: scrolled state + mobile menu ---------- */

const nav = $("#nav");
const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 24);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

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

/* ---------- hero typing ---------- */

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

/* ---------- about counters ---------- */

function animateCount(el) {
  const target = +el.dataset.target;
  const dur = 1300;
  const t0 = performance.now();
  (function tick(now) {
    const p = Math.min((now - t0) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * eased);
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
// backstop for environments where the observer is inert: never leave a 0
setTimeout(() => {
  $$("[data-target]").forEach((el) => {
    if (el.dataset.done) return;
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) runCount(el);
    else { el.dataset.done = "1"; el.textContent = el.dataset.target; }
  });
}, 2600);

/* ---------- year ---------- */

$("#footYear").textContent = new Date().getFullYear();
