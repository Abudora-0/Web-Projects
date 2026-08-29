"use strict";

/* ============================================================
   SILLAGE - The Still Room
   Shared script for every page. Vanilla JS, no network calls.
   Pages set <body data-page="...">.
   ============================================================ */

(function () {

/* ---------- tiny helpers ---------- */
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const PAGE = document.body.dataset.page;
const money = (n) => "$" + (Math.round(n * 100) / 100).toFixed(2);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- SVG icons (no text arrows anywhere) ---------- */
const I = {
  arrowR: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6"/></svg>',
  arrowL: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H6M11 6l-6 6 6 6"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.4-3.4"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 13l4 4L19 7"/></svg>',
  leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20c0-8 6-14 16-14 0 10-6 16-16 14z"/><path d="M4 20c4-6 8-9 12-11"/></svg>',
  bookmark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M6 4h12v16l-6-4-6 4z"/></svg>',
  bookmarkFill: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 4h12v16l-6-4-6 4z"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  flask: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3"/><path d="M7.5 15h9"/></svg>',
  bottle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M10 2h4v3l1 2v13a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2V7l1-2z"/><path d="M9 12h6"/></svg>',
  compass: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/></svg>'
};
function icon(n) { return '<span class="ic">' + (I[n] || "") + "</span>"; }

/* ---------- the animated wordmark ---------- */
function wordmarkHTML(size) {
  const letters = "Sillage".split("").map((ch, i) =>
    '<span class="wm-l" data-i="' + i + '">' + ch + '</span>').join("");
  return '<a class="wordmark" href="index.html" aria-label="Sillage - home" style="--wm-size:' + (size || "1.5rem") + '">' +
    '<span class="wm-word">' + letters + '</span>' +
    '<svg class="wm-trail" viewBox="0 0 90 40" aria-hidden="true">' +
      '<path class="wm-wisp w1" d="M2 22 C24 14 46 26 88 16" fill="none"/>' +
      '<path class="wm-wisp w2" d="M2 28 C22 24 44 32 88 24" fill="none"/>' +
      '<path class="wm-wisp w3" d="M2 16 C26 10 40 18 70 10" fill="none"/>' +
    '</svg>' +
    '<span class="wm-dust" aria-hidden="true"></span>' +
  '</a>';
}
const _wmRigs = [];
let _wmStarted = false;
function animateWordmarks() {
  const marks = $$(".wordmark");
  if (!marks.length) return;
  if (prefersReduced) { marks.forEach((m) => m.classList.add("wm-static")); return; }

  marks.filter((m) => !m.dataset.wmRigged).forEach((m) => {
    m.dataset.wmRigged = "1";
    const dust = $(".wm-dust", m);
    const particles = [];
    for (let k = 0; k < 4; k++) {
      const p = document.createElement("span");
      p.className = "wm-particle";
      dust.appendChild(p);
      particles.push({ el: p, life: -k * 20 });
    }
    _wmRigs.push({ letters: $$(".wm-l", m), wisps: $$(".wm-wisp", m), particles: particles });
  });

  if (_wmStarted) return;
  _wmStarted = true;
  let t = 0;
  setInterval(() => {
    t += 1;
    _wmRigs.forEach((r) => {
      r.letters.forEach((l, i) => {
        const y = Math.sin((t + i * 5) * 0.08) * 1.4;
        const rot = Math.sin((t + i * 7) * 0.06) * 0.8;
        l.style.transform = "translateY(" + y.toFixed(2) + "px) rotate(" + rot.toFixed(2) + "deg)";
      });
      r.wisps.forEach((w, i) => {
        const drift = 6 + i * 4;
        w.style.transform = "translateX(" + (Math.sin((t + i * 30) * 0.05) * drift).toFixed(1) + "px)";
        w.style.opacity = (0.14 + Math.abs(Math.sin((t + i * 22) * 0.045)) * 0.32).toFixed(2);
      });
      r.particles.forEach((p) => {
        p.life += 1;
        if (p.life < 0) { p.el.style.opacity = "0"; return; }
        const prog = (p.life % 90) / 90;
        if (p.life % 90 === 0) p.seed = Math.random();
        const s = p.seed || 0.5;
        p.el.style.transform = "translate(" + (prog * (26 + s * 18)).toFixed(1) + "px, " +
          (-prog * (10 + s * 14) + Math.sin(prog * 6) * 3).toFixed(1) + "px) scale(" + (1 - prog * 0.6).toFixed(2) + ")";
        p.el.style.opacity = (Math.sin(prog * Math.PI) * 0.5).toFixed(2);
      });
    });
  }, 55);
}

/* ============================================================
   DATA
   ============================================================ */
const FAMILIES = {
  floral: { label: "Floral", latin: "Flores", hue: "#b0637a" },
  green:  { label: "Green", latin: "Herba", hue: "#5c7b47" },
  citrus: { label: "Citrus", latin: "Hesperidia", hue: "#9a9a3c" },
  woody:  { label: "Woody", latin: "Ligna", hue: "#8a6a3e" },
  amber:  { label: "Amber", latin: "Succina", hue: "#a8672f" },
  chypre: { label: "Chypre", latin: "Cyprium", hue: "#6b5a39" }
};

const NOTES = {
  bergamot:  { name: "Bergamot", latin: "Citrus bergamia", family: "citrus", photo: "bergamot", char: "Bitter-bright citrus peel, the classic eau de cologne opening." },
  mandarin:  { name: "Mandarin", latin: "Citrus reticulata", family: "citrus", photo: "bergamot", char: "Sweet, juicy, almost edible citrus." },
  pinkpepper:{ name: "Pink Pepper", latin: "Schinus molle", family: "amber", photo: "pepper", char: "A rosy, effervescent spark that lifts an opening." },
  saffron:   { name: "Saffron", latin: "Crocus sativus", family: "amber", photo: "saffron", char: "Leathery, dried, faintly medicinal - warmth with an edge." },
  neroli:    { name: "Neroli", latin: "Citrus aurantium fl.", family: "floral", photo: "neroli", char: "Orange blossom distilled - green, honeyed, clean." },
  rose:      { name: "Rose Absolute", latin: "Rosa × damascena", family: "floral", photo: "rose", char: "Jammy, spiced, dewy - hundreds of molecules in one flower." },
  jasmine:   { name: "Jasmine", latin: "Jasminum grandiflorum", family: "floral", photo: "jasmine", char: "Heady, animalic, indolic white flower. Warm skin." },
  peony:     { name: "Peony", latin: "Paeonia lactiflora", family: "floral", photo: "peony", char: "Watery, pink, transparent petals - a modern floral note." },
  iris:      { name: "Orris", latin: "Iris pallida", family: "floral", photo: "iris", char: "Cold, powdery, rooty violet. Three years of drying per batch." },
  fig:       { name: "Fig", latin: "Ficus carica", family: "green", photo: "fig", char: "Milky green fruit and bitter leaf - shade in the heat." },
  galbanum:  { name: "Galbanum", latin: "Ferula gummosa", family: "green", photo: "greenery", char: "Sharp, resinous, crushed-stem green. Bracing." },
  greenleaf: { name: "Green Leaves", latin: "folia viridia", family: "green", photo: "greenery", char: "Snapped stems and bruised leaf - a garden after rain." },
  oakmoss:   { name: "Oakmoss", latin: "Evernia prunastri", family: "chypre", photo: "oakmoss", char: "Damp forest floor, ink, inkwell. The spine of a chypre." },
  patchouli: { name: "Patchouli", latin: "Pogostemon cablin", family: "chypre", photo: "moss", char: "Earthy, wine-dark, a little musty. Ages beautifully." },
  vetiver:   { name: "Vetiver", latin: "Chrysopogon zizanioides", family: "woody", photo: "vetiver", char: "Smoky rootiness - dry grass, grapefruit rind, damp earth." },
  cedar:     { name: "Cedarwood", latin: "Cedrus atlantica", family: "woody", photo: "cedar", char: "Dry pencil shavings and warm attic timber." },
  sandalwood:{ name: "Sandalwood", latin: "Santalum album", family: "woody", photo: "sandalwood", char: "Creamy, lactonic, meditative wood. Melts into skin." },
  amber:     { name: "Amber", latin: "accord", family: "amber", photo: "amber", char: "Labdanum, benzoin and vanilla built into a warm glow." },
  labdanum:  { name: "Labdanum", latin: "Cistus ladanifer", family: "amber", photo: "amber", char: "Sticky, ambery, faintly leathered resin from rock rose." },
  incense:   { name: "Incense", latin: "Boswellia sacra", family: "amber", photo: "amber", char: "Cold smoke, stone chapel, lemon-tinged resin." },
  vanilla:   { name: "Vanilla", latin: "Vanilla planifolia", family: "amber", photo: "vanilla", char: "Boozy, dark, tobacco-edged - not the cupcake kind." },
  tonka:     { name: "Tonka Bean", latin: "Dipteryx odorata", family: "amber", photo: "vanilla", char: "Almond, hay, coumarin sweetness. Soft focus." },
  tobacco:   { name: "Tobacco", latin: "Nicotiana tabacum", family: "amber", photo: "tobacco", char: "Dried leaf, honey, pipe smoke curling in a study." },
  leather:   { name: "Leather", latin: "accord", family: "chypre", photo: "leather", char: "Birch tar and suede - a gloved hand, a saddle, smoke." },
  plum:      { name: "Plum", latin: "Prunus", family: "amber", photo: "plum", char: "Overripe stone fruit, faintly boozy, plush." },
  musk:      { name: "White Musk", latin: "accord", family: "floral", photo: null, char: "Clean skin, warm cotton, the quiet at the base." },
  aldehydes: { name: "Aldehydes", latin: "synthetic", family: "floral", photo: null, char: "Fizzy, soapy, abstract sparkle - the sound of champagne." }
};

const FRAGRANCES = [
  { id: "velours-de-rose", name: "Velours de Rose", family: "floral", latin: "Rosa × damascena", plate: "No. 14",
    photo: "rose", blurb: "A rose worn like velvet. Powdery petals warmed by skin musk, cut with a flash of pink pepper at the open, settling into cedar and a soft grey haze.",
    notes: { top: ["pinkpepper", "bergamot"], heart: ["rose", "peony"], base: ["musk", "cedar"] },
    sizes: [{ ml: 30, price: 88 }, { ml: 50, price: 132 }, { ml: 100, price: 198 }],
    radar: { floral: 5, green: 1, citrus: 2, woody: 2, amber: 1, spicy: 2 },
    longevity: 3, sillage: 3, season: ["spring", "autumn"], mood: ["calm", "warm"], freshDeep: 3, weight: 3,
    pairsWith: ["cedre-silencieux", "vanille-interdite"] },

  { id: "neige-blanche", name: "Neige Blanche", family: "floral", latin: "Convallaria majalis", plate: "No. 21",
    photo: "jasmine", blurb: "White flowers under fresh snow. Lily and jasmine held cool and quiet by sandalwood and a trace of vanilla, with an aldehydic shiver over the top.",
    notes: { top: ["aldehydes", "neroli"], heart: ["jasmine", "iris"], base: ["sandalwood", "vanilla"] },
    sizes: [{ ml: 30, price: 92 }, { ml: 50, price: 138 }, { ml: 100, price: 205 }],
    radar: { floral: 5, green: 2, citrus: 1, woody: 3, amber: 2, spicy: 0 },
    longevity: 3, sillage: 2, season: ["winter", "spring"], mood: ["calm", "sharp"], freshDeep: 2, weight: 2,
    pairsWith: ["cedre-silencieux", "zeste-dor"] },

  { id: "jardin-secret", name: "Jardin Secret", family: "green", latin: "Viola odorata", plate: "No. 07",
    photo: "greenery", blurb: "A walled garden after rain. Crushed green leaves and galbanum, a violet heart, and a mossy hush that lingers on the collar long after you leave.",
    notes: { top: ["galbanum", "greenleaf"], heart: ["iris", "peony"], base: ["oakmoss", "musk"] },
    sizes: [{ ml: 30, price: 79 }, { ml: 50, price: 118 }, { ml: 100, price: 175 }],
    radar: { floral: 3, green: 5, citrus: 2, woody: 2, amber: 0, spicy: 1 },
    longevity: 2, sillage: 3, season: ["spring", "summer"], mood: ["sharp", "calm"], freshDeep: 2, weight: 2,
    pairsWith: ["verger-de-midi", "mousse-de-chene"] },

  { id: "verger-de-midi", name: "Verger de Midi", family: "citrus", latin: "Citrus × paradisi", plate: "No. 03",
    photo: "bergamot", blurb: "A midday orchard. Grapefruit and lemon over crushed fig leaf and basil, grounded by a thread of vetiver so it does not simply vanish.",
    notes: { top: ["bergamot", "mandarin"], heart: ["fig", "greenleaf"], base: ["vetiver", "musk"] },
    sizes: [{ ml: 30, price: 72 }, { ml: 50, price: 108 }, { ml: 100, price: 160 }],
    radar: { floral: 1, green: 4, citrus: 5, woody: 2, amber: 0, spicy: 1 },
    longevity: 2, sillage: 2, season: ["summer"], mood: ["sharp"], freshDeep: 1, weight: 1,
    pairsWith: ["jardin-secret", "zeste-dor"] },

  { id: "zeste-dor", name: "Zeste d'Or", family: "citrus", latin: "Citrus aurantium", plate: "No. 01",
    photo: "neroli", blurb: "Sun-struck citrus over an orange grove at noon. Bergamot and neroli lifted by golden petitgrain, closing on white musk and dry cedar.",
    notes: { top: ["bergamot", "mandarin"], heart: ["neroli", "greenleaf"], base: ["musk", "cedar"] },
    sizes: [{ ml: 30, price: 68 }, { ml: 50, price: 102 }, { ml: 100, price: 150 }],
    radar: { floral: 3, green: 2, citrus: 5, woody: 2, amber: 0, spicy: 0 },
    longevity: 2, sillage: 2, season: ["spring", "summer"], mood: ["sharp", "calm"], freshDeep: 1, weight: 1,
    pairsWith: ["verger-de-midi", "neige-blanche"] },

  { id: "chene-et-fumee", name: "Chêne et Fumée", family: "woody", latin: "Quercus + fumus", plate: "No. 31",
    photo: "cedar", blurb: "Oak and smoke. A study in dark wood, cracked leather and resin held over a slow amber fire, with cardamom and black pepper flaring at the strike.",
    notes: { top: ["saffron", "pinkpepper"], heart: ["vetiver", "incense"], base: ["leather", "amber"] },
    sizes: [{ ml: 30, price: 105 }, { ml: 50, price: 158 }, { ml: 100, price: 235 }],
    radar: { floral: 0, green: 1, citrus: 0, woody: 5, amber: 4, spicy: 3 },
    longevity: 5, sillage: 4, season: ["autumn", "winter"], mood: ["bold", "warm"], freshDeep: 5, weight: 5,
    pairsWith: ["ambre-nocturne", "cuir-de-lune"] },

  { id: "cedre-silencieux", name: "Cèdre Silencieux", family: "woody", latin: "Cedrus atlantica", plate: "No. 27",
    photo: "cedar", blurb: "A quiet cedar library. Pencil shavings, dry iris and tonka bean settling into warm skin. The scent of an afternoon spent not talking.",
    notes: { top: ["bergamot", "pinkpepper"], heart: ["cedar", "iris"], base: ["musk", "tonka"] },
    sizes: [{ ml: 30, price: 95 }, { ml: 50, price: 142 }, { ml: 100, price: 210 }],
    radar: { floral: 2, green: 1, citrus: 2, woody: 5, amber: 2, spicy: 2 },
    longevity: 4, sillage: 2, season: ["autumn", "winter"], mood: ["calm"], freshDeep: 4, weight: 3,
    pairsWith: ["velours-de-rose", "neige-blanche"] },

  { id: "mousse-de-chene", name: "Mousse de Chêne", family: "chypre", latin: "Evernia prunastri", plate: "No. 42",
    photo: "oakmoss", blurb: "The oldest structure in perfumery, plainly stated. Bergamot over a rose heart, sinking into oakmoss, patchouli and a dry, resinous labdanum.",
    notes: { top: ["bergamot", "galbanum"], heart: ["rose", "jasmine"], base: ["oakmoss", "patchouli"] },
    sizes: [{ ml: 30, price: 99 }, { ml: 50, price: 148 }, { ml: 100, price: 220 }],
    radar: { floral: 3, green: 3, citrus: 3, woody: 3, amber: 2, spicy: 1 },
    longevity: 4, sillage: 3, season: ["autumn"], mood: ["bold", "calm"], freshDeep: 4, weight: 4,
    pairsWith: ["jardin-secret", "chene-et-fumee"] },

  { id: "ambre-nocturne", name: "Ambre Nocturne", family: "amber", latin: "Succinum + oud", plate: "No. 55",
    photo: "amber", blurb: "Midnight amber and temple incense. Saffron and rose smouldering over dark resin until dawn, dense enough to leave on a scarf for a week.",
    notes: { top: ["saffron", "pinkpepper"], heart: ["rose", "incense"], base: ["amber", "labdanum"] },
    sizes: [{ ml: 30, price: 115 }, { ml: 50, price: 172 }, { ml: 100, price: 255 }],
    radar: { floral: 2, green: 0, citrus: 0, woody: 3, amber: 5, spicy: 4 },
    longevity: 5, sillage: 5, season: ["winter"], mood: ["bold", "warm"], freshDeep: 5, weight: 5,
    pairsWith: ["chene-et-fumee", "vanille-interdite"] },

  { id: "vanille-interdite", name: "Vanille Interdite", family: "amber", latin: "Vanilla planifolia", plate: "No. 48",
    photo: "vanilla", blurb: "Forbidden vanilla. Tobacco flower and tonka wrapped in a warm, faintly smoky benzoin haze - a dessert that got into the whisky.",
    notes: { top: ["pinkpepper", "bergamot"], heart: ["tobacco", "tonka"], base: ["vanilla", "labdanum"] },
    sizes: [{ ml: 30, price: 98 }, { ml: 50, price: 147 }, { ml: 100, price: 218 }],
    radar: { floral: 1, green: 0, citrus: 1, woody: 2, amber: 5, spicy: 2 },
    longevity: 5, sillage: 4, season: ["autumn", "winter"], mood: ["warm", "bold"], freshDeep: 5, weight: 4,
    pairsWith: ["ambre-nocturne", "velours-de-rose"] },

  { id: "nuit-de-cachemire", name: "Nuit de Cachemire", family: "amber", latin: "Prunus + suede", plate: "No. 52",
    photo: "plum", blurb: "Cashmere at night. Plum and clove sinking into soft suede, amber and a last breath of resin. Worn close, read only by the person you are dancing with.",
    notes: { top: ["plum", "saffron"], heart: ["rose", "leather"], base: ["amber", "sandalwood"] },
    sizes: [{ ml: 30, price: 110 }, { ml: 50, price: 165 }, { ml: 100, price: 245 }],
    radar: { floral: 3, green: 0, citrus: 0, woody: 3, amber: 5, spicy: 3 },
    longevity: 4, sillage: 4, season: ["autumn", "winter"], mood: ["warm", "bold"], freshDeep: 4, weight: 4,
    pairsWith: ["vanille-interdite", "cuir-de-lune"] },

  { id: "cuir-de-lune", name: "Cuir de Lune", family: "chypre", latin: "accord de cuir", plate: "No. 60",
    photo: "leather", blurb: "Moon leather. Birch-tar smoke and dry iris over a mossy, ambered floor - a coat left on a chair in a room where something was decided.",
    notes: { top: ["saffron", "galbanum"], heart: ["iris", "leather"], base: ["oakmoss", "labdanum"] },
    sizes: [{ ml: 30, price: 108 }, { ml: 50, price: 162 }, { ml: 100, price: 240 }],
    radar: { floral: 2, green: 2, citrus: 0, woody: 3, amber: 3, spicy: 3 },
    longevity: 4, sillage: 3, season: ["autumn", "winter"], mood: ["bold"], freshDeep: 5, weight: 4,
    pairsWith: ["chene-et-fumee", "nuit-de-cachemire"] }
];

/* every fragrance is photographed as its own bottle: img/<id>.jpg */
FRAGRANCES.forEach((f) => { f.photo = f.id; });

const JOURNAL = [
  { slug: "anatomy-of-a-chypre", title: "Anatomy of a Chypre", dek: "Bergamot, rose, oakmoss. Three ingredients, a century of variations, and the one accord every perfumer learns to build.",
    date: "March 1924", mins: 6, related: ["mousse-de-chene", "cuir-de-lune"],
    body: [
      { p: "A chypre is not a smell so much as a shape. Coty drew it in 1917 - a bright citrus top, a floral heart, and a dark, damp base of oakmoss and labdanum - and every chypre since is a comment on that drawing." },
      { h: "The three pillars", p: "Bergamot supplies the lift: bitter, sparkling, gone in twenty minutes. Rose or jasmine fills the middle hour. Then oakmoss - inky, forest-floor, faintly bitter - holds the whole thing to the skin for the rest of the day, with labdanum adding a leathered warmth underneath." },
      { h: "Why they nearly disappeared", p: "Oakmoss contains atranol, restricted by IFRA for its allergen load. Modern chypres rebuild that base from patchouli, vetiver, and cleaned-up moss fractions. Mousse de Chêne is our attempt to keep the bitterness without the itch." },
      { p: "Wear one on a wool coat. The moss reads best on fabric that has been out in cold air." }
    ] },
  { slug: "the-trail-you-leave", title: "The Trail You Leave", dek: "Sillage is the wake a fragrance leaves in a room. Here is how it is built, and why more is not better.",
    date: "June 1924", mins: 5, related: ["ambre-nocturne", "jardin-secret"],
    body: [
      { p: "Sillage - from the French for the wake of a boat - is the scent that reaches other people after you have walked past. It is not the same as strength on your own skin. A loud perfume can sit close; a quiet one can carry across a room." },
      { h: "What projects", p: "Large, volatile molecules with high vapour pressure travel: aldehydes, certain musks, iso E super, ambroxan. Heavy resins and woods stay near the skin. A perfumer tunes the ratio to decide whether a scent announces you or waits to be found." },
      { h: "The etiquette", p: "Two sprays, below the collarbone, not on a scarf you will wear into a lift. If a colleague can name your perfume from the next desk, it is doing too much. Sillage is meant to be a rumour, not a statement." }
    ] },
  { slug: "sourcing-orris", title: "Sourcing Orris: The Three-Year Wait", dek: "The most expensive floral note in perfumery is a root, dug from a hillside in Tuscany, and left in a shed to rot correctly.",
    date: "September 1924", mins: 7, related: ["neige-blanche", "cedre-silencieux"],
    body: [
      { p: "Orris is the rhizome of Iris pallida. It smells of nothing when fresh. The scent - cold, powdery, violet-adjacent - only develops as the root dries and its oils oxidise into irones, and that takes at least three years of turning in a dry store." },
      { h: "The economics", p: "A tonne of dried rhizome yields roughly two kilograms of orris butter. At current rates that butter runs to tens of thousands per kilo, which is why most 'iris' fragrances lean on synthetic irones and use the real material as a seasoning." },
      { p: "In Cèdre Silencieux the orris is doing quiet structural work under the cedar - you would miss it if it were gone, and never quite place it if it stayed." }
    ] },
  { slug: "layering-without-the-clash", title: "Layering, Without the Clash", dek: "Two fragrances on one skin can make a third. Most attempts make a mess. A short field guide.",
    date: "November 1924", mins: 4, related: ["velours-de-rose", "vanille-interdite"],
    body: [
      { p: "Layering works when the two scents share a base and differ at the top. Put a citrus over a woody-amber and you extend the opening without disturbing the dry-down. Put two ambers together and you get a headache." },
      { h: "Reliable pairs", p: "Anything green over anything mossy. Any soft rose over any vanilla. A sharp citrus over a quiet cedar. Spray the heavier one first, let it settle for a minute, then the lighter one on top." },
      { p: "Use the Bench to test a pair before you commit a whole evening to it." }
    ] }
];

/* ---------- storage ---------- */
const K = { cart: "sillage_cart_v1", wardrobe: "sillage_wardrobe_v1", accords: "sillage_accords_v1", wear: "sillage_wear_v1", draft: "sillage_draft_v1" };
const rd = (k, f) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? f : v; } catch (e) { return f; } };
const wr = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

let cart = rd(K.cart, []);
const saveCart = () => { wr(K.cart, cart); paintCounts(); };
let wardrobe = rd(K.wardrobe, {});   // { fragId: "day" | "evening" | "" }

const frag = (id) => FRAGRANCES.find((f) => f.id === id);
const note = (id) => NOTES[id];
const priceFrom = (f) => Math.min.apply(null, f.sizes.map((s) => s.price));
const sizeOf = (f, ml) => f.sizes.find((s) => s.ml === ml) || f.sizes[0];
const RADAR_AXES = ["floral", "green", "citrus", "woody", "amber", "spicy"];

/* ---------- cart ops ---------- */
function cartCount() { return cart.reduce((s, l) => s + l.qty, 0); }
function lineUnit(l) {
  if (l.kind === "sample") return 34;
  const f = frag(l.id); return f ? sizeOf(f, l.ml).price : 0;
}
function lineTotal(l) { return lineUnit(l) * l.qty; }
function cartSubtotal() { return cart.reduce((s, l) => s + lineTotal(l), 0); }
function addToCart(id, ml, qty) {
  const key = id + "::" + ml;
  const ex = cart.find((l) => l.key === key);
  if (ex) ex.qty = clamp(ex.qty + qty, 1, 20);
  else cart.push({ kind: "bottle", key: key, id: id, ml: ml, qty: qty });
  saveCart();
  toast(frag(id).name + " · " + ml + "ml added to your collection.");
}
function addSampleSet(ids) {
  cart = cart.filter((l) => l.kind !== "sample");
  cart.push({ kind: "sample", key: "sample-set", ids: ids.slice(), qty: 1 });
  saveCart();
  toast("Discovery set of " + ids.length + " added.");
}
function setLineQty(key, q) { const l = cart.find((x) => x.key === key); if (!l) return; l.qty = clamp(q, 1, 20); saveCart(); }
function removeLine(key) { cart = cart.filter((l) => l.key !== key); saveCart(); }

/* ---------- wardrobe ops ---------- */
function inWardrobe(id) { return Object.prototype.hasOwnProperty.call(wardrobe, id); }
function toggleWardrobe(id) {
  if (inWardrobe(id)) { delete wardrobe[id]; toast(frag(id).name + " removed from your wardrobe."); }
  else { wardrobe[id] = ""; toast(frag(id).name + " kept in your wardrobe."); }
  wr(K.wardrobe, wardrobe);
  if (pageRepaint) pageRepaint();
}

/* ---------- toast ---------- */
let toastT;
function toast(msg) {
  const el = $("#toast"); if (!el) return;
  el.textContent = msg; el.classList.add("show");
  clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove("show"), 2600);
}

/* ============================================================
   SHARED CHROME
   ============================================================ */
const NAV = [
  { href: "catalogue.html", label: "The Herbarium", key: "catalogue" },
  { href: "notes.html", label: "Notes", key: "notes" },
  { href: "bench.html", label: "The Bench", key: "bench" },
  { href: "finder.html", label: "Find Your Trail", key: "finder" },
  { href: "journal.html", label: "Journal", key: "journal" }
];

function renderChrome() {
  const defs = document.createElement("div");
  defs.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
  defs.setAttribute("aria-hidden", "true");
  defs.innerHTML =
    '<svg><defs><linearGradient id="btlGlass" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#ffffff" stop-opacity="0.55"/>' +
      '<stop offset="0.45" stop-color="#ffffff" stop-opacity="0.12"/>' +
      '<stop offset="1" stop-color="#ffffff" stop-opacity="0.04"/>' +
    '</linearGradient></defs></svg>';
  document.body.appendChild(defs);

  const header = document.createElement("header");
  header.className = "site-header";
  header.innerHTML =
    '<div class="header-in">' +
      wordmarkHTML("1.45rem") +
      '<button class="nav-toggle" id="nav-toggle" aria-label="Menu" aria-expanded="false">' + I.menu + '</button>' +
      '<nav class="site-nav" id="site-nav" aria-label="Main">' +
        NAV.map((n) => '<a href="' + n.href + '"' + (n.key === PAGE ? ' aria-current="page"' : "") + ">" + n.label + "</a>").join("") +
        '<a class="nav-collection" href="wardrobe.html"' + (PAGE === "wardrobe" ? ' aria-current="page"' : "") + ">" +
          I.bottle + "<span>Collection</span><span class=\"nav-count\" data-count>0</span></a>" +
      '</nav>' +
    '</div>';
  document.body.insertBefore(header, document.body.firstChild);

  const footer = document.createElement("footer");
  footer.className = "site-footer";
  footer.innerHTML =
    '<div class="footer-in">' +
      '<div class="footer-brand">' + wordmarkHTML("1.6rem") +
        '<p>A still room of hand-blended fragrances. This is a front-end demonstration - no payment is taken and nothing leaves your browser.</p></div>' +
      '<div class="footer-cols">' +
        '<div><h4>The House</h4><a href="catalogue.html">The Herbarium</a><a href="notes.html">Raw Materials</a><a href="journal.html">Journal</a></div>' +
        '<div><h4>Tools</h4><a href="finder.html">Find Your Trail</a><a href="bench.html">The Blending Bench</a><a href="wardrobe.html">Your Wardrobe</a></div>' +
        '<div><h4>Visit</h4><p>14 Ashcombe Lane<br>Open by appointment<br>Tue to Sat</p></div>' +
      '</div>' +
    '</div>' +
    '<p class="footer-fine">Photographs of raw materials under Creative Commons - see img/_credits.json. Type set in IM Fell English &amp; EB Garamond.</p>';
  document.body.appendChild(footer);

  const nav = $("#site-nav"), tog = $("#nav-toggle");
  function setNav(open) {
    nav.classList.toggle("open", open);
    tog.setAttribute("aria-expanded", open ? "true" : "false");
    tog.innerHTML = open ? I.x : I.menu;
  }
  tog.addEventListener("click", (e) => { e.stopPropagation(); setNav(!nav.classList.contains("open")); });
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) setNav(false); });
  document.addEventListener("click", (e) => { if (nav.classList.contains("open") && !nav.contains(e.target) && !tog.contains(e.target)) setNav(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && nav.classList.contains("open")) setNav(false); });

  const t = document.createElement("div");
  t.id = "toast"; t.className = "toast"; t.setAttribute("role", "status"); t.setAttribute("aria-live", "polite");
  document.body.appendChild(t);
}

function paintCounts() {
  const c = cartCount();
  $$("[data-count]").forEach((el) => { el.textContent = String(c); el.classList.toggle("empty", c === 0); });
  if (pageRepaint) pageRepaint();
}
let pageRepaint = null;

/* ============================================================
   THEMED CONTROLS
   ============================================================ */
function enhanceSelect(sel) {
  if (!sel || sel.dataset.sl) return;
  sel.dataset.sl = "1";
  const wrap = document.createElement("div"); wrap.className = "sl-sel";
  sel.parentNode.insertBefore(wrap, sel); wrap.appendChild(sel);
  sel.classList.add("sl-sel-native");
  const trig = document.createElement("button");
  trig.type = "button"; trig.className = "sl-sel-trigger";
  trig.setAttribute("aria-haspopup", "listbox"); trig.setAttribute("aria-expanded", "false");
  const panel = document.createElement("div"); panel.className = "sl-sel-panel"; panel.setAttribute("role", "listbox"); panel.hidden = true;
  wrap.appendChild(trig); wrap.appendChild(panel);
  function build() {
    panel.innerHTML = "";
    Array.from(sel.options).forEach((o) => {
      const d = document.createElement("div");
      d.className = "sl-sel-opt"; d.setAttribute("role", "option"); d.textContent = o.textContent;
      if (o.disabled) d.setAttribute("aria-disabled", "true");
      if (o.value === sel.value && !o.disabled) d.setAttribute("aria-selected", "true");
      d.addEventListener("click", () => { if (o.disabled) return; sel.value = o.value; sel.dispatchEvent(new Event("change", { bubbles: true })); close(); });
      panel.appendChild(d);
    });
  }
  function sync() {
    const o = sel.options[sel.selectedIndex];
    trig.innerHTML = "<span>" + (o ? esc(o.textContent) : "") + "</span>" + I.chevron;
    trig.classList.toggle("empty", !sel.value);
  }
  function open() { build(); panel.hidden = false; trig.setAttribute("aria-expanded", "true"); }
  function close() { panel.hidden = true; trig.setAttribute("aria-expanded", "false"); }
  trig.addEventListener("click", () => (panel.hidden ? open() : close()));
  document.addEventListener("click", (e) => { if (!wrap.contains(e.target)) close(); });
  sel.addEventListener("change", sync);
  sync();
}

function stepperHTML(value, key) {
  return '<span class="sl-step" data-step' + (key ? ' data-key="' + esc(key) + '"' : "") + '>' +
    '<button type="button" class="sl-step-b" data-d="-1" aria-label="One fewer">' + I.minus + '</button>' +
    '<span class="sl-step-v" data-v>' + value + '</span>' +
    '<button type="button" class="sl-step-b" data-d="1" aria-label="One more">' + I.plus + '</button></span>';
}
function bindSteppers(root, cb) {
  $$(".sl-step", root).forEach((el) => {
    if (el.dataset.b) return; el.dataset.b = "1";
    el.addEventListener("click", (e) => {
      const b = e.target.closest("[data-d]"); if (!b) return;
      const d = Number(b.dataset.d);
      if (el.dataset.key) { const l = cart.find((x) => x.key === el.dataset.key); if (l) setLineQty(el.dataset.key, l.qty + d); }
      if (cb) cb(d, el);
    });
  });
}

/* ============================================================
   REUSABLE SVG: bottle, radar, scent map, meter
   ============================================================ */
function bottleSVG(hue, opts) {
  opts = opts || {};
  const eng = opts.engrave ? '<text x="30" y="58" text-anchor="middle" class="btl-engrave">' + esc(opts.engrave) + '</text>' : "";
  return '<svg viewBox="0 0 60 96" class="btl ' + (opts.cls || "") + '" aria-hidden="true">' +
    '<ellipse cx="30" cy="92" rx="15" ry="3" fill="rgba(43,40,34,0.14)"/>' +
    '<rect x="23" y="4" width="14" height="10" rx="2" fill="' + hue + '"/>' +
    '<rect x="26" y="12" width="8" height="5" fill="' + hue + '" opacity="0.7"/>' +
    '<path d="M18 24 q0-6 6-9 v-2 h12 v2 q6 3 6 9 l3 46 q1 12 -11 12 h-11 q-12 0 -11 -12 z" fill="' + hue + '" opacity="0.9"/>' +
    '<path d="M18 24 q0-6 6-9 v-2 h12 v2 q6 3 6 9 l3 46 q1 12 -11 12 h-11 q-12 0 -11 -12 z" fill="url(#btlGlass)"/>' +
    '<rect x="15" y="46" width="30" height="30" rx="3" fill="var(--vellum)" stroke="rgba(43,40,34,0.25)" stroke-width="0.6"/>' +
    '<line x1="19" y1="54" x2="41" y2="54" stroke="rgba(43,40,34,0.3)" stroke-width="0.5"/>' +
    (opts.engrave ? "" : '<line x1="19" y1="61" x2="41" y2="61" stroke="rgba(43,40,34,0.18)" stroke-width="0.5"/><line x1="19" y1="66" x2="37" y2="66" stroke="rgba(43,40,34,0.18)" stroke-width="0.5"/>') +
    '<path class="btl-shimmer" d="M21 22 L26 20 L24 60 L19 62 Z" fill="#fff" opacity="0.25"/>' +
    eng +
  '</svg>';
}

function radarSVG(series, opts) {
  opts = opts || {};
  const size = opts.size || 220, cx = size / 2, cy = size / 2, R = size / 2 - 26;
  const n = RADAR_AXES.length;
  const pt = (i, r) => {
    const a = -Math.PI / 2 + i * 2 * Math.PI / n;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  };
  let g = "";
  for (let ring = 1; ring <= 5; ring++) {
    const pts = RADAR_AXES.map((_, i) => pt(i, R * ring / 5).map((v) => v.toFixed(1)).join(",")).join(" ");
    g += '<polygon points="' + pts + '" fill="none" stroke="var(--hairline)" stroke-width="0.7"/>';
  }
  RADAR_AXES.forEach((ax, i) => {
    const [x, y] = pt(i, R);
    g += '<line x1="' + cx + '" y1="' + cy + '" x2="' + x.toFixed(1) + '" y2="' + y.toFixed(1) + '" stroke="var(--hairline)" stroke-width="0.7"/>';
    const [lx, ly] = pt(i, R + 15);
    g += '<text x="' + lx.toFixed(1) + '" y="' + (ly + 3).toFixed(1) + '" text-anchor="middle" class="radar-ax">' + (ax === "spicy" ? "Spice" : FAMILIES[ax].label) + '</text>';
  });
  (Array.isArray(series) ? series : [series]).forEach((s, si) => {
    const pts = RADAR_AXES.map((ax, i) => pt(i, R * (s.values[ax] || 0) / 5).map((v) => v.toFixed(1)).join(",")).join(" ");
    const col = s.color || "var(--rose-dust)";
    g += '<polygon points="' + pts + '" fill="' + col + '" fill-opacity="' + (series.length > 1 ? 0.16 : 0.22) + '" stroke="' + col + '" stroke-width="1.6"/>';
  });
  return '<svg viewBox="0 0 ' + size + ' ' + size + '" class="radar" role="img" aria-label="Scent family profile">' + g + '</svg>';
}

function scentMapSVG(list, opts) {
  opts = opts || {};
  const w = opts.w || 640, h = opts.h || 420, pad = 44;
  let g = '<rect x="' + pad + '" y="' + pad + '" width="' + (w - pad * 2) + '" height="' + (h - pad * 2) + '" fill="none" stroke="var(--hairline)"/>';
  for (let i = 1; i < 5; i++) {
    const x = pad + (w - pad * 2) * i / 5, y = pad + (h - pad * 2) * i / 5;
    g += '<line x1="' + x + '" y1="' + pad + '" x2="' + x + '" y2="' + (h - pad) + '" stroke="var(--hairline)" stroke-width="0.5"/>';
    g += '<line x1="' + pad + '" y1="' + y + '" x2="' + (w - pad) + '" y2="' + y + '" stroke="var(--hairline)" stroke-width="0.5"/>';
  }
  g += '<text x="' + (w / 2) + '" y="' + (h - 14) + '" text-anchor="middle" class="map-ax">fresh  →  deep</text>';
  g += '<text x="16" y="' + (h / 2) + '" text-anchor="middle" class="map-ax" transform="rotate(-90 16 ' + (h / 2) + ')">light  →  heavy</text>';
  list.forEach((f) => {
    const x = pad + (w - pad * 2) * (f.freshDeep - 0.5) / 5;
    const y = pad + (h - pad * 2) * (f.weight - 0.5) / 5;
    g += '<a href="fragrance.html#' + f.id + '"><circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="6" fill="' + FAMILIES[f.family].hue + '"/>' +
      '<text x="' + (x + 10).toFixed(1) + '" y="' + (y + 4).toFixed(1) + '" class="map-pt">' + esc(f.name) + '</text></a>';
  });
  return '<svg viewBox="0 0 ' + w + ' ' + h + '" class="scent-map" role="img" aria-label="Fragrances plotted by weight and freshness">' + g + '</svg>';
}

function meterHTML(label, value, max) {
  max = max || 5;
  const pct = Math.round(value / max * 100);
  let dots = "";
  for (let i = 1; i <= max; i++) dots += '<span class="mt-dot' + (i <= Math.round(value) ? " on" : "") + '"></span>';
  return '<div class="meter"><span class="mt-label">' + label + '</span><span class="mt-dots">' + dots + '</span>' +
    '<span class="mt-val">' + value.toFixed(1) + '</span></div>';
}

/* ============================================================
   FRAGRANCE CARD (specimen plate)
   ============================================================ */
function specimenCard(f, opts) {
  opts = opts || {};
  return '<article class="specimen" data-id="' + f.id + '">' +
    '<button type="button" class="spec-keep' + (inWardrobe(f.id) ? " on" : "") + '" data-keep="' + f.id + '" aria-label="Keep in wardrobe" aria-pressed="' + inWardrobe(f.id) + '">' +
      (inWardrobe(f.id) ? I.bookmarkFill : I.bookmark) + '</button>' +
    (opts.compare ? '<label class="spec-compare"><input type="checkbox" data-cmp="' + f.id + '"><span>Compare</span></label>' : "") +
    '<a class="spec-hit" href="fragrance.html#' + f.id + '">' +
      '<span class="spec-photo"><img src="img/' + f.photo + '.jpg" alt="" loading="lazy" onerror="this.style.display=\'none\'">' +
        '<span class="spec-plate">' + f.plate + '</span></span>' +
      '<span class="spec-body">' +
        '<span class="spec-latin">' + esc(f.latin) + '</span>' +
        '<span class="spec-name">' + esc(f.name) + '</span>' +
        '<span class="spec-fam" style="--fh:' + FAMILIES[f.family].hue + '"><span class="fam-dot"></span>' + FAMILIES[f.family].label + '</span>' +
        '<span class="spec-price">from ' + money(priceFrom(f)) + '</span>' +
      '</span>' +
    '</a>' +
  '</article>';
}
function bindSpecimens(root) {
  $$("[data-keep]", root).forEach((b) => b.addEventListener("click", (e) => {
    e.preventDefault(); toggleWardrobe(b.dataset.keep);
    const on = inWardrobe(b.dataset.keep);
    b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on));
    b.innerHTML = on ? I.bookmarkFill : I.bookmark;
  }));
}

/* ============================================================
   PAGES
   ============================================================ */
const pages = {};

/* ---- HOME ---- */
pages.home = function () {
  const m = $("#main");
  const feat = ["velours-de-rose", "chene-et-fumee", "verger-de-midi"].map(frag);
  const latest = JOURNAL[JOURNAL.length - 1];
  m.innerHTML =
    '<section class="hero">' +
      '<div class="hero-photo"><img src="img/atm-perfume.jpg" alt="" onerror="this.style.display=\'none\'"></div>' +
      '<div class="hero-veil"></div>' +
      '<div class="hero-in">' +
        '<p class="eyebrow">The Still Room &middot; est. 1921</p>' +
        wordmarkHTML("clamp(3.2rem, 11vw, 6.5rem)") +
        '<p class="hero-line">Fragrance kept the old way - macerated in the dark, decanted by hand, and labelled like specimens. Find the one that leaves the right trail behind you.</p>' +
        '<div class="hero-cta">' +
          '<a class="btn btn-fill" href="catalogue.html">Open the herbarium' + icon("arrowR") + '</a>' +
          '<a class="btn btn-line" href="finder.html">' + icon("compass") + 'Find your trail</a>' +
        '</div>' +
      '</div>' +
    '</section>' +
    '<section class="band">' +
      '<div class="band-head"><h2>Recent plates</h2><a class="lnk" href="catalogue.html">All twelve' + icon("arrowR") + '</a></div>' +
      '<div class="spec-grid">' + feat.map((f) => specimenCard(f)).join("") + '</div>' +
    '</section>' +
    '<section class="tiles">' +
      '<a class="tile" href="bench.html"><span class="tile-ic">' + I.flask + '</span><h3>The Blending Bench</h3><p>Layer two or three and see the accord you would actually wear.</p></a>' +
      '<a class="tile" href="notes.html"><span class="tile-ic">' + I.leaf + '</span><h3>Raw Materials</h3><p>Twenty-odd notes - rose to oakmoss - and every fragrance built on each.</p></a>' +
      '<a class="tile" href="finder.html"><span class="tile-ic">' + I.compass + '</span><h3>Find Your Trail</h3><p>Four questions. A shortlist, plotted on the scent map.</p></a>' +
    '</section>' +
    '<section class="band journal-teaser">' +
      '<div class="band-head"><h2>From the Journal</h2><a class="lnk" href="journal.html">All entries' + icon("arrowR") + '</a></div>' +
      '<a class="jt-card" href="journal.html#' + latest.slug + '">' +
        '<span class="jt-date">' + latest.date + ' &middot; ' + latest.mins + ' min</span>' +
        '<h3>' + esc(latest.title) + '</h3><p>' + esc(latest.dek) + '</p>' +
        '<span class="lnk">Read the entry' + icon("arrowR") + '</span>' +
      '</a>' +
    '</section>';
  bindSpecimens(m);
};

/* ---- CATALOGUE ---- */
pages.catalogue = function () {
  const m = $("#main");
  m.innerHTML =
    '<div class="page-head"><p class="eyebrow">Twelve fragrances, pressed and labelled</p><h1>The Herbarium</h1></div>' +
    '<div class="cat-tools">' +
      '<div class="search-field">' + I.search + '<input type="search" id="cat-search" placeholder="Search name or note..." autocomplete="off" aria-label="Search"></div>' +
      '<label class="cat-sort"><span>Arrange</span><select id="cat-sort">' +
        '<option value="plate">By plate number</option>' +
        '<option value="price-asc">Price: low to high</option>' +
        '<option value="price-desc">Price: high to low</option>' +
        '<option value="name">Name A - Z</option>' +
        '<option value="sillage">Loudest sillage</option>' +
        '<option value="longevity">Longest wear</option>' +
      '</select></label>' +
      '<label class="cmp-toggle"><input type="checkbox" id="cmp-toggle"><span>Compare</span></label>' +
    '</div>' +
    '<div class="fam-chips" id="fam-chips"></div>' +
    '<div id="cmp-bar" class="cmp-bar" hidden></div>' +
    '<div class="spec-grid" id="spec-grid"></div>' +
    '<p class="empty" id="cat-empty" hidden>No plate matches that.</p>';

  let famKey = "all", q = "", sort = "plate", cmp = false;
  const cmpSet = new Set();

  function chips() {
    const host = $("#fam-chips");
    host.innerHTML = '<button type="button" class="chip' + (famKey === "all" ? " on" : "") + '" data-f="all">All families</button>' +
      Object.keys(FAMILIES).map((k) => '<button type="button" class="chip' + (famKey === k ? " on" : "") + '" data-f="' + k + '" style="--fh:' + FAMILIES[k].hue + '"><span class="fam-dot"></span>' + FAMILIES[k].label + '</button>').join("");
    $$(".chip", host).forEach((b) => b.addEventListener("click", () => { famKey = b.dataset.f; chips(); draw(); }));
  }
  function list() {
    let arr = FRAGRANCES.slice();
    if (famKey !== "all") arr = arr.filter((f) => f.family === famKey);
    const qq = q.trim().toLowerCase();
    if (qq) arr = arr.filter((f) => {
      const hay = (f.name + " " + f.latin + " " + FAMILIES[f.family].label + " " +
        [].concat(f.notes.top, f.notes.heart, f.notes.base).map((n) => NOTES[n].name).join(" ")).toLowerCase();
      return hay.indexOf(qq) !== -1;
    });
    if (sort === "price-asc") arr.sort((a, b) => priceFrom(a) - priceFrom(b));
    else if (sort === "price-desc") arr.sort((a, b) => priceFrom(b) - priceFrom(a));
    else if (sort === "name") arr.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "sillage") arr.sort((a, b) => b.sillage - a.sillage);
    else if (sort === "longevity") arr.sort((a, b) => b.longevity - a.longevity);
    else arr.sort((a, b) => a.plate.localeCompare(b.plate, undefined, { numeric: true }));
    return arr;
  }
  function drawCmpBar() {
    const bar = $("#cmp-bar");
    if (!cmp || cmpSet.size === 0) { bar.hidden = true; bar.innerHTML = ""; return; }
    bar.hidden = false;
    const picks = Array.from(cmpSet).map(frag);
    bar.innerHTML = '<div class="cmp-radars">' +
      picks.map((f) => '<figure>' + radarSVG({ values: f.radar, color: FAMILIES[f.family].hue }, { size: 168 }) +
        '<figcaption>' + esc(f.name) + '</figcaption></figure>').join("") +
      '</div><button type="button" class="btn btn-line sm" id="cmp-clear">Clear comparison</button>';
    $("#cmp-clear").addEventListener("click", () => { cmpSet.clear(); draw(); });
  }
  function draw() {
    const arr = list();
    const grid = $("#spec-grid");
    $("#cat-empty").hidden = arr.length > 0;
    grid.innerHTML = arr.map((f) => specimenCard(f, { compare: cmp })).join("");
    bindSpecimens(grid);
    $$("[data-cmp]", grid).forEach((c) => {
      c.checked = cmpSet.has(c.dataset.cmp);
      c.addEventListener("change", () => {
        if (c.checked) { if (cmpSet.size >= 3) { c.checked = false; toast("Compare up to three at once."); return; } cmpSet.add(c.dataset.cmp); }
        else cmpSet.delete(c.dataset.cmp);
        drawCmpBar();
      });
    });
    drawCmpBar();
  }
  chips(); draw();
  $("#cat-search").addEventListener("input", (e) => { q = e.target.value; draw(); });
  enhanceSelect($("#cat-sort"));
  $("#cat-sort").addEventListener("change", (e) => { sort = e.target.value; draw(); });
  $("#cmp-toggle").addEventListener("change", (e) => { cmp = e.target.checked; if (!cmp) cmpSet.clear(); draw(); });
  pageRepaint = draw;
};

/* ---- FRAGRANCE DETAIL ---- */
pages.fragrance = function () {
  const m = $("#main");
  function render() {
    const f = frag(decodeURIComponent(location.hash.slice(1)));
    if (!f) { m.innerHTML = '<div class="pad"><p class="empty">No such plate. <a href="catalogue.html">Back to the herbarium</a>.</p></div>'; return; }
    let ml = f.sizes[0].ml, qty = 1;
    const wear = rd(K.wear, {})[f.id] || null;
    const effLong = wear ? (f.longevity + wear.longevity) / 2 : f.longevity;
    const effSill = wear ? (f.sillage + wear.sillage) / 2 : f.sillage;

    m.innerHTML =
      '<div class="crumb"><a href="catalogue.html">' + icon("arrowL") + 'The Herbarium</a></div>' +
      '<article class="fr">' +
        '<div class="fr-visual">' +
          '<div class="fr-photo">' +
            '<span class="fr-bottle-fb">' + bottleSVG(FAMILIES[f.family].hue, { cls: "big" }) + '</span>' +
            '<img src="img/' + f.photo + '.jpg" alt="The ' + esc(f.name) + ' flacon" onerror="this.style.display=\'none\'">' +
            '<span class="fr-plate">Plate ' + f.plate + '</span></div>' +
          '<p class="fr-photo-cap">The flacon &middot; heart note: ' + esc(NOTES[f.notes.heart[0]].name) + ' <i>(' + esc(NOTES[f.notes.heart[0]].latin) + ')</i></p>' +
        '</div>' +
        '<div class="fr-info">' +
          '<p class="fr-latin">' + esc(f.latin) + ' &middot; Plate ' + f.plate + '</p>' +
          '<div class="fr-titlerow"><h1>' + esc(f.name) + '</h1>' +
            '<button type="button" class="keep-btn' + (inWardrobe(f.id) ? " on" : "") + '" id="fr-keep" aria-pressed="' + inWardrobe(f.id) + '">' +
              (inWardrobe(f.id) ? I.bookmarkFill : I.bookmark) + '<span>' + (inWardrobe(f.id) ? "Kept" : "Keep") + '</span></button>' +
          '</div>' +
          '<p class="fr-fam" style="--fh:' + FAMILIES[f.family].hue + '"><span class="fam-dot"></span>' + FAMILIES[f.family].label + ' &middot; <i>' + FAMILIES[f.family].latin + '</i></p>' +
          '<p class="fr-blurb">' + esc(f.blurb) + '</p>' +

          '<div class="fr-grid2">' +
            '<div class="pyramid">' +
              '<p class="mini-h">The pyramid</p>' +
              ['base', 'heart', 'top'].map((tier) =>
                '<div class="tier tier-' + tier + '"><span class="tier-k">' + tier[0].toUpperCase() + tier.slice(1) + '</span>' +
                '<span class="tier-n">' + f.notes[tier].map((n) => '<a href="notes.html#' + n + '">' + esc(NOTES[n].name) + '</a>').join(" · ") + '</span></div>').join("") +
            '</div>' +
            '<div class="fr-radar"><p class="mini-h">Family profile</p>' + radarSVG({ values: f.radar, color: FAMILIES[f.family].hue }, { size: 210 }) + '</div>' +
          '</div>' +

          '<div class="fr-meters">' +
            '<p class="mini-h">On skin' + (wear ? ' <span class="mt-note">(your log folded in)</span>' : "") + '</p>' +
            meterHTML("Longevity", effLong) + meterHTML("Sillage", effSill) +
            '<button type="button" class="lnk sm" id="wear-open">' + icon("plus") + 'Log your wear-test</button>' +
            '<form class="wear-form" id="wear-form" hidden>' +
              '<label>Longevity <select id="wear-long">' + [1,2,3,4,5].map((n) => '<option value="' + n + '"' + (n === 3 ? " selected" : "") + '>' + n + ' / 5</option>').join("") + '</select></label>' +
              '<label>Sillage <select id="wear-sill">' + [1,2,3,4,5].map((n) => '<option value="' + n + '"' + (n === 3 ? " selected" : "") + '>' + n + ' / 5</option>').join("") + '</select></label>' +
              '<button type="submit" class="btn btn-line sm">Save log</button>' +
            '</form>' +
          '</div>' +

          '<div class="fr-buy">' +
            '<div class="size-row" id="size-row">' +
              f.sizes.map((s) => '<button type="button" class="size-opt' + (s.ml === ml ? " on" : "") + '" data-ml="' + s.ml + '"><b>' + s.ml + ' ml</b><span>' + money(s.price) + '</span></button>').join("") +
            '</div>' +
            '<div class="buy-actions">' + stepperHTML(qty, null) +
              '<button type="button" class="btn btn-fill" id="add-btn">Add · <span id="add-price">' + money(sizeOf(f, ml).price) + '</span></button>' +
            '</div>' +
          '</div>' +

          '<div class="pairs"><p class="mini-h">Wears well with</p><div class="pair-list">' +
            f.pairsWith.map((pid) => { const p = frag(pid); return '<a class="pair" href="fragrance.html#' + pid + '"><span class="pair-dot" style="background:' + FAMILIES[p.family].hue + '"></span>' + esc(p.name) + '</a>'; }).join("") +
          '</div></div>' +
        '</div>' +
      '</article>';

    // wiring
    $("#fr-keep").addEventListener("click", () => {
      toggleWardrobe(f.id);
      const on = inWardrobe(f.id);
      const b = $("#fr-keep"); b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on));
      b.innerHTML = (on ? I.bookmarkFill : I.bookmark) + '<span>' + (on ? "Kept" : "Keep") + '</span>';
    });
    const priceEl = $("#add-price");
    $("#size-row").addEventListener("click", (e) => {
      const b = e.target.closest(".size-opt"); if (!b) return;
      ml = Number(b.dataset.ml);
      $$(".size-opt", $("#size-row")).forEach((x) => x.classList.toggle("on", Number(x.dataset.ml) === ml));
      priceEl.textContent = money(sizeOf(f, ml).price);
    });
    bindSteppers($(".buy-actions"), (d) => { qty = clamp(qty + d, 1, 20); $(".buy-actions [data-v]").textContent = qty; });
    $("#add-btn").addEventListener("click", () => addToCart(f.id, ml, qty));
    $("#wear-open").addEventListener("click", () => { const wf = $("#wear-form"); wf.hidden = !wf.hidden; });
    enhanceSelect($("#wear-long")); enhanceSelect($("#wear-sill"));
    $("#wear-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const all = rd(K.wear, {});
      all[f.id] = { longevity: Number($("#wear-long").value), sillage: Number($("#wear-sill").value) };
      wr(K.wear, all);
      toast("Wear-test saved.");
      render();
    });
  }
  render();
  window.addEventListener("hashchange", () => location.reload());
};

/* ---- NOTES (raw materials) ---- */
pages.notes = function () {
  const m = $("#main");
  const order = ["bergamot", "mandarin", "neroli", "pinkpepper", "saffron", "rose", "jasmine", "peony", "iris",
    "fig", "galbanum", "greenleaf", "oakmoss", "patchouli", "vetiver", "cedar", "sandalwood",
    "amber", "labdanum", "incense", "vanilla", "tonka", "tobacco", "leather", "plum", "musk", "aldehydes"];
  function foundIn(nid) {
    return FRAGRANCES.filter((f) => [].concat(f.notes.top, f.notes.heart, f.notes.base).indexOf(nid) !== -1);
  }
  function render() {
    const sel = decodeURIComponent(location.hash.slice(1));
    if (sel && NOTES[sel]) { renderOne(sel); return; }
    m.innerHTML =
      '<div class="page-head"><p class="eyebrow">The organ - every material on the bench</p><h1>Raw Materials</h1></div>' +
      '<div class="note-grid">' +
        order.map((nid) => { const nt = NOTES[nid]; return '<a class="note-card" href="notes.html#' + nid + '" style="--fh:' + FAMILIES[nt.family].hue + '">' +
          '<span class="note-photo">' + (nt.photo ? '<img src="img/' + nt.photo + '.jpg" alt="" loading="lazy" onerror="this.style.display=\'none\'">' : '<span class="note-noimg">' + I.leaf + '</span>') + '</span>' +
          '<span class="note-name">' + esc(nt.name) + '</span><span class="note-latin">' + esc(nt.latin) + '</span></a>'; }).join("") +
      '</div>';
  }
  function renderOne(nid) {
    const nt = NOTES[nid], fin = foundIn(nid);
    m.innerHTML =
      '<div class="crumb"><a href="notes.html">' + icon("arrowL") + 'All materials</a></div>' +
      '<article class="note-one" style="--fh:' + FAMILIES[nt.family].hue + '">' +
        '<div class="note-one-photo">' + (nt.photo ? '<img src="img/' + nt.photo + '.jpg" alt="' + esc(nt.name) + '" onerror="this.style.display=\'none\'">' : '<span class="note-noimg big">' + I.leaf + '</span>') + '</div>' +
        '<div class="note-one-body">' +
          '<p class="fr-latin">' + esc(nt.latin) + '</p>' +
          '<h1>' + esc(nt.name) + '</h1>' +
          '<p class="fr-fam" style="--fh:' + FAMILIES[nt.family].hue + '"><span class="fam-dot"></span>' + FAMILIES[nt.family].label + ' family</p>' +
          '<p class="fr-blurb">' + esc(nt.char) + '</p>' +
          '<p class="mini-h">On the shelf in</p>' +
          (fin.length ? '<div class="pair-list">' + fin.map((f) => '<a class="pair" href="fragrance.html#' + f.id + '"><span class="pair-dot" style="background:' + FAMILIES[f.family].hue + '"></span>' + esc(f.name) + '</a>').join("") + '</div>'
            : '<p class="muted">Not currently used in a released fragrance.</p>') +
        '</div>' +
      '</article>';
  }
  render();
  window.addEventListener("hashchange", () => location.reload());
};

/* ---- BENCH (blending) ---- */
pages.bench = function () {
  const m = $("#main");
  const pick = [FRAGRANCES[0].id, FRAGRANCES[5].id, ""];
  m.innerHTML =
    '<div class="page-head"><p class="eyebrow">Two or three, on one skin</p><h1>The Blending Bench</h1>' +
      '<p class="head-sub">Layering works when the scents share a base and differ up top. Choose a pair (or a trio), see the accord, and keep it if it holds.</p></div>' +
    '<div class="bench-slots" id="bench-slots"></div>' +
    '<div class="bench-out" id="bench-out"></div>' +
    '<div class="bench-saved" id="bench-saved"></div>';

  function slotSelect(i) {
    const opts = '<option value="">' + (i === 2 ? "Add a third (optional)" : "Choose a fragrance") + '</option>' +
      FRAGRANCES.map((f) => '<option value="' + f.id + '">' + esc(f.name) + '</option>').join("");
    return '<div class="bench-slot"><span class="slot-k">' + ["Base layer", "Over the top", "A third"][i] + '</span>' +
      '<select data-slot="' + i + '">' + opts + '</select>' +
      '<div class="slot-preview" data-prev="' + i + '"></div></div>';
  }
  $("#bench-slots").innerHTML = [0, 1, 2].map(slotSelect).join("");
  $$("[data-slot]").forEach((sel) => {
    const i = Number(sel.dataset.slot);
    sel.value = pick[i];
    enhanceSelect(sel);
    sel.addEventListener("change", () => { pick[i] = sel.value; paint(); });
  });

  function combined() {
    const chosen = pick.filter(Boolean).map(frag);
    if (!chosen.length) return null;
    const values = {};
    RADAR_AXES.forEach((ax) => { values[ax] = Math.min(5, chosen.reduce((s, f) => s + f.radar[ax], 0) / Math.max(1, chosen.length) + (chosen.length > 1 ? 0.4 : 0)); });
    const allNotes = {};
    chosen.forEach((f) => ["top", "heart", "base"].forEach((t) => f.notes[t].forEach((n) => { allNotes[n] = t; })));
    const long = chosen.reduce((s, f) => s + f.longevity, 0) / chosen.length;
    const sill = Math.min(5, chosen.reduce((s, f) => s + f.sillage, 0) / chosen.length + (chosen.length - 1) * 0.5);
    // clash check: 2+ heavy ambers
    const ambers = chosen.filter((f) => f.family === "amber").length;
    const clash = ambers >= 2;
    return { chosen, values, allNotes, long, sill, clash };
  }
  function paint() {
    $$("[data-prev]").forEach((el) => {
      const f = frag(pick[Number(el.dataset.prev)]);
      el.innerHTML = f ? '<img src="img/' + f.photo + '.jpg" alt="" onerror="this.style.display=\'none\'"><span>' + esc(f.name) + '</span>' : "";
      el.classList.toggle("filled", !!f);
    });
    const c = combined();
    const out = $("#bench-out");
    if (!c) { out.innerHTML = '<p class="empty">Pick at least one fragrance to build an accord.</p>'; return; }
    const series = c.chosen.map((f) => ({ values: f.radar, color: FAMILIES[f.family].hue }));
    out.innerHTML =
      '<div class="bench-card">' +
        '<div class="bench-radar">' + radarSVG(series, { size: 240 }) +
          '<div class="bench-legend">' + c.chosen.map((f) => '<span><i style="background:' + FAMILIES[f.family].hue + '"></i>' + esc(f.name) + '</span>').join("") + '</div>' +
        '</div>' +
        '<div class="bench-detail">' +
          '<p class="mini-h">The accord</p>' +
          (c.clash ? '<p class="bench-warn">' + icon("compass") + 'Two ambers stacked - this will likely read as heavy and muddled. Swap one for a citrus or a green.</p>' : "") +
          '<p class="bench-notes">' + Object.keys(c.allNotes).sort((a, b) => ["top", "heart", "base"].indexOf(c.allNotes[a]) - ["top", "heart", "base"].indexOf(c.allNotes[b])).map((n) => esc(NOTES[n].name)).join(" · ") + '</p>' +
          meterHTML("Longevity", c.long) + meterHTML("Sillage", c.sill) +
          '<form class="accord-save" id="accord-save">' +
            '<input type="text" id="accord-name" placeholder="Name this accord..." maxlength="32" aria-label="Accord name">' +
            '<button type="submit" class="btn btn-line sm">Keep it</button>' +
          '</form>' +
        '</div>' +
      '</div>';
    $("#accord-save").addEventListener("submit", (e) => {
      e.preventDefault();
      const nm = $("#accord-name").value.trim();
      if (nm.length < 2) { toast("Give the accord a name first."); return; }
      const all = rd(K.accords, []);
      all.unshift({ name: nm, ids: pick.filter(Boolean), at: Date.now() });
      wr(K.accords, all.slice(0, 20));
      $("#accord-name").value = "";
      toast("Accord kept.");
      paintSaved();
    });
  }
  function paintSaved() {
    const all = rd(K.accords, []);
    const host = $("#bench-saved");
    if (!all.length) { host.innerHTML = ""; return; }
    host.innerHTML = '<h2 class="mini-h">Your kept accords</h2>' +
      '<div class="accord-list">' + all.map((a, i) =>
        '<div class="accord"><div><strong>' + esc(a.name) + '</strong><p>' + a.ids.map((id) => esc(frag(id).name)).join(" + ") + '</p></div>' +
        '<div class="accord-actions"><button type="button" class="lnk sm" data-load="' + i + '">Load</button>' +
        '<button type="button" class="lnk sm" data-del="' + i + '">Discard</button></div></div>').join("") + '</div>';
    $$("[data-load]", host).forEach((b) => b.addEventListener("click", () => {
      const a = all[Number(b.dataset.load)];
      [0, 1, 2].forEach((i) => { pick[i] = a.ids[i] || ""; const s = $('[data-slot="' + i + '"]'); s.value = pick[i]; s.dispatchEvent(new Event("change", { bubbles: true })); });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }));
    $$("[data-del]", host).forEach((b) => b.addEventListener("click", () => {
      all.splice(Number(b.dataset.del), 1); wr(K.accords, all); paintSaved();
    }));
  }
  paint(); paintSaved();
};

/* ---- FINDER (quiz) ---- */
pages.finder = function () {
  const m = $("#main");
  const Q = [
    { k: "time", q: "When do you reach for a fragrance?", a: [["day", "Daytime, always"], ["night", "Evenings and occasions"], ["both", "Either, depending"]] },
    { k: "weight", q: "How much do you want it to say?", a: [["light", "A whisper - close to the skin"], ["mid", "A presence, not a broadcast"], ["big", "Loud and unmissable"]] },
    { k: "season", q: "The weather you dress for most", a: [["warm", "Warm and bright"], ["cool", "Cold and grey"], ["any", "All of it"]] },
    { k: "family", q: "Pick the world you'd rather be in", a: [["fresh", "A citrus grove / a wet garden"], ["floral", "A florist's cold room"], ["warm", "A library / a fire / resin"]] }
  ];
  let step = 0; const ans = {};

  function draw() {
    if (step < Q.length) {
      const cur = Q[step];
      m.innerHTML =
        '<div class="page-head"><p class="eyebrow">Four questions</p><h1>Find Your Trail</h1></div>' +
        '<div class="quiz">' +
          '<div class="quiz-prog"><span style="width:' + (step / Q.length * 100) + '%"></span></div>' +
          '<p class="quiz-n">' + (step + 1) + ' of ' + Q.length + '</p>' +
          '<h2 class="quiz-q">' + cur.q + '</h2>' +
          '<div class="quiz-opts">' + cur.a.map((o) => '<button type="button" class="quiz-opt" data-v="' + o[0] + '">' + esc(o[1]) + '</button>').join("") + '</div>' +
          (step > 0 ? '<button type="button" class="lnk sm" id="quiz-back">' + icon("arrowL") + 'Back</button>' : "") +
        '</div>';
      $$(".quiz-opt").forEach((b) => b.addEventListener("click", () => { ans[cur.k] = b.dataset.v; step++; draw(); }));
      const bk = $("#quiz-back"); if (bk) bk.addEventListener("click", () => { step--; draw(); });
    } else {
      const scored = FRAGRANCES.map((f) => {
        let s = 0;
        if (ans.time === "day" && f.season.indexOf("summer") + f.season.indexOf("spring") > -2) s += f.weight <= 3 ? 2 : 0;
        if (ans.time === "night") s += f.weight >= 3 ? 2 : 0;
        if (ans.weight === "light") s += (4 - f.sillage);
        if (ans.weight === "mid") s += 3 - Math.abs(3 - f.sillage);
        if (ans.weight === "big") s += f.sillage;
        if (ans.season === "warm" && (f.season.indexOf("summer") > -1 || f.season.indexOf("spring") > -1)) s += 2;
        if (ans.season === "cool" && (f.season.indexOf("winter") > -1 || f.season.indexOf("autumn") > -1)) s += 2;
        if (ans.season === "any") s += 1;
        if (ans.family === "fresh" && (f.family === "citrus" || f.family === "green")) s += 3;
        if (ans.family === "floral" && f.family === "floral") s += 3;
        if (ans.family === "warm" && (f.family === "amber" || f.family === "woody" || f.family === "chypre")) s += 3;
        return { f, s };
      }).sort((a, b) => b.s - a.s);
      const top = scored.slice(0, 4).map((x) => x.f);
      m.innerHTML =
        '<div class="page-head"><p class="eyebrow">Your shortlist</p><h1>Four to try</h1>' +
          '<p class="head-sub">Plotted below by weight and freshness. Tap a point to open the plate.</p></div>' +
        '<div class="map-wrap">' + scentMapSVG(top) + '</div>' +
        '<div class="spec-grid">' + top.map((f) => specimenCard(f)).join("") + '</div>' +
        '<div class="quiz-again"><button type="button" class="btn btn-line" id="quiz-restart">' + icon("compass") + 'Start over</button>' +
          '<a class="btn btn-fill" href="finder.html" onclick="return false" style="display:none"></a></div>';
      bindSpecimens(m);
      $("#quiz-restart").addEventListener("click", () => { step = 0; for (const k in ans) delete ans[k]; draw(); });
    }
  }
  draw();
};

/* ---- JOURNAL ---- */
pages.journal = function () {
  const m = $("#main");
  function render() {
    const slug = decodeURIComponent(location.hash.slice(1));
    const art = JOURNAL.find((a) => a.slug === slug);
    if (art) {
      m.innerHTML =
        '<div class="crumb"><a href="journal.html">' + icon("arrowL") + 'The Journal</a></div>' +
        '<article class="article">' +
          '<p class="art-meta">' + art.date + ' &middot; ' + art.mins + ' minute read</p>' +
          '<h1>' + esc(art.title) + '</h1>' +
          '<p class="art-dek">' + esc(art.dek) + '</p>' +
          art.body.map((b) => (b.h ? '<h2>' + esc(b.h) + '</h2>' : "") + '<p>' + esc(b.p) + '</p>').join("") +
          (art.related && art.related.length ?
            '<div class="art-related"><p class="mini-h">Mentioned</p><div class="spec-grid">' +
              art.related.map((id) => specimenCard(frag(id))).join("") + '</div></div>' : "") +
        '</article>';
      bindSpecimens(m);
    } else {
      m.innerHTML =
        '<div class="page-head"><p class="eyebrow">Notes from the still room</p><h1>The Journal</h1></div>' +
        '<div class="jr-list">' + JOURNAL.slice().reverse().map((a) =>
          '<a class="jr-item" href="journal.html#' + a.slug + '">' +
            '<span class="jr-date">' + a.date + ' &middot; ' + a.mins + ' min</span>' +
            '<h2>' + esc(a.title) + '</h2><p>' + esc(a.dek) + '</p>' +
            '<span class="lnk">Read' + icon("arrowR") + '</span></a>').join("") +
        '</div>';
    }
  }
  render();
  window.addEventListener("hashchange", () => location.reload());
};

/* ---- WARDROBE (saved + cart + sample builder) ---- */
pages.wardrobe = function () {
  const m = $("#main");
  const sampleSel = new Set();

  function draw() {
    const kept = Object.keys(wardrobe).map(frag).filter(Boolean);
    const day = kept.filter((f) => f.weight <= 3 || f.season.indexOf("summer") > -1 || f.season.indexOf("spring") > -1);
    const eve = kept.filter((f) => day.indexOf(f) === -1);

    m.innerHTML =
      '<div class="page-head"><p class="eyebrow">Kept, and to hand</p><h1>Your Wardrobe</h1></div>' +
      '<section class="wd-sec">' +
        (kept.length
          ? '<div class="wd-bucket"><h2 class="mini-h">Daytime</h2>' + (day.length ? '<div class="spec-grid sm">' + day.map((f) => specimenCard(f)).join("") + '</div>' : '<p class="muted">Nothing here yet.</p>') + '</div>' +
            '<div class="wd-bucket"><h2 class="mini-h">Evening</h2>' + (eve.length ? '<div class="spec-grid sm">' + eve.map((f) => specimenCard(f)).join("") + '</div>' : '<p class="muted">Nothing here yet.</p>') + '</div>'
          : '<p class="empty">Your wardrobe is empty. Use the bookmark on any plate to keep it here.</p>') +
      '</section>' +

      '<section class="wd-sec">' +
        '<h2 class="mini-h">Discovery set</h2>' +
        '<p class="head-sub">Choose up to six as 2ml samples for a flat ' + money(34) + '. The full amount comes off your first bottle.</p>' +
        '<div class="sample-grid" id="sample-grid">' +
          FRAGRANCES.map((f) => '<label class="sample-chip"><input type="checkbox" data-s="' + f.id + '"><span class="fam-dot" style="background:' + FAMILIES[f.family].hue + '"></span>' + esc(f.name) + '</label>').join("") +
        '</div>' +
        '<div class="sample-foot"><span id="sample-count">0 of 6 chosen</span>' +
          '<button type="button" class="btn btn-line sm" id="sample-add" disabled>Add discovery set</button></div>' +
      '</section>' +

      '<section class="wd-sec">' +
        '<h2 class="mini-h">Your collection</h2>' +
        '<div id="cart-list"></div>' +
      '</section>';

    // samples
    $$("[data-s]").forEach((c) => {
      c.checked = sampleSel.has(c.dataset.s);
      c.addEventListener("change", () => {
        if (c.checked) { if (sampleSel.size >= 6) { c.checked = false; toast("Six is the limit for a discovery set."); return; } sampleSel.add(c.dataset.s); }
        else sampleSel.delete(c.dataset.s);
        $("#sample-count").textContent = sampleSel.size + " of 6 chosen";
        $("#sample-add").disabled = sampleSel.size < 2;
      });
    });
    $("#sample-add").addEventListener("click", () => { if (sampleSel.size >= 2) { addSampleSet(Array.from(sampleSel)); sampleSel.clear(); draw(); } });

    drawCart();
    bindSpecimens(m);
  }

  function drawCart() {
    const host = $("#cart-list");
    if (!cart.length) { host.innerHTML = '<p class="empty">No bottles in your collection yet. <a href="catalogue.html">Choose one</a>.</p>'; return; }
    host.innerHTML =
      '<div class="cart-lines">' + cart.map((l) => {
        if (l.kind === "sample") {
          return '<div class="cart-line"><span class="cl-photo sample">' + I.bottle + '</span>' +
            '<div class="cl-main"><div class="cl-top"><strong>Discovery set</strong><span>' + money(34) + '</span></div>' +
            '<p class="cl-meta">' + l.ids.map((id) => esc(frag(id).name)).join(", ") + '</p>' +
            '<button type="button" class="lnk sm" data-rm="' + l.key + '">Remove</button></div></div>';
        }
        const f = frag(l.id);
        return '<div class="cart-line"><span class="cl-photo"><img src="img/' + f.photo + '.jpg" alt="" onerror="this.style.display=\'none\'"></span>' +
          '<div class="cl-main"><div class="cl-top"><strong>' + esc(f.name) + '</strong><span>' + money(lineTotal(l)) + '</span></div>' +
          '<p class="cl-meta">' + l.ml + ' ml</p>' +
          '<div class="cl-ctl">' + stepperHTML(l.qty, l.key) +
          '<button type="button" class="lnk sm" data-rm="' + l.key + '">Remove</button></div></div></div>';
      }).join("") + '</div>' +
      '<div class="cart-foot"><div class="cart-sub"><span>Subtotal</span><span>' + money(cartSubtotal()) + '</span></div>' +
        '<p class="muted sm">Shipping and engraving are set at checkout.</p>' +
        '<a class="btn btn-fill block" href="checkout.html">To the wrapping table' + icon("arrowR") + '</a></div>';
    bindSteppers(host, () => draw());
    $$("[data-rm]", host).forEach((b) => b.addEventListener("click", () => { removeLine(b.dataset.rm); draw(); }));
  }

  draw();
  pageRepaint = draw;
};

/* ---- CHECKOUT ---- */
pages.checkout = function () {
  const m = $("#main");
  if (!cart.length) {
    m.innerHTML = '<div class="pad"><p class="empty">Nothing to wrap. <a href="catalogue.html">Back to the herbarium</a>.</p></div>';
    return;
  }
  const draft = rd(K.draft, {});
  const st = { step: "ship", ship: draft.ship || {}, engrave: draft.engrave || "" };
  const ENGRAVE_FEE = 12;

  function totals() {
    const sub = cartSubtotal();
    const eng = st.engrave ? ENGRAVE_FEE : 0;
    return { sub, eng, grand: sub + eng };
  }
  function shell(body) {
    m.innerHTML = '<div class="crumb"><a href="wardrobe.html">' + icon("arrowL") + 'Your collection</a></div>' +
      '<div class="steps"><span class="' + (st.step === "ship" ? "on" : "done") + '">1 Shipping</span>' +
      '<span class="' + (st.step === "engrave" ? "on" : (st.step === "done" ? "done" : "")) + '">2 Engrave</span>' +
      '<span class="' + (st.step === "done" ? "on" : "") + '">3 Sealed</span></div>' +
      '<div class="co-card">' + body + '</div>';
  }
  function field(id, label, opt) {
    return '<label class="co-fld' + (opt ? " wide" : "") + '"><span>' + label + '</span>' +
      '<input type="text" id="' + id + '" value="' + esc(st.ship[id] || "") + '"><span class="fld-err" id="' + id + '-err"></span></label>';
  }

  function stepShip() {
    st.step = "ship";
    shell('<h1>Shipping</h1><p class="head-sub">A demonstration checkout - no payment is taken and nothing is dispatched.</p>' +
      '<div class="co-form">' +
        field("name", "Full name") + field("addr", "Address") +
        field("city", "City") + field("region", "State / Region") +
        field("postal", "Postal code") + field("country", "Country") +
      '</div>' +
      '<div class="co-nav"><a class="btn btn-line" href="wardrobe.html">' + icon("arrowL") + 'Back</a>' +
        '<button type="button" class="btn btn-fill" id="to-engrave">Next: engraving' + icon("arrowR") + '</button></div>');
    $("#to-engrave").addEventListener("click", () => {
      let ok = true;
      ["name", "addr", "city", "region", "postal", "country"].forEach((id) => {
        const v = $("#" + id).value.trim();
        $("#" + id + "-err").textContent = v ? "" : "Needed to wrap the parcel.";
        if (v) st.ship[id] = v; else ok = false;
      });
      wr(K.draft, { ship: st.ship, engrave: st.engrave });
      if (ok) stepEngrave(); else toast("A few lines are still blank.");
    });
  }

  function stepEngrave() {
    st.step = "engrave";
    const f0 = frag(cart.find((l) => l.kind === "bottle") ? cart.find((l) => l.kind === "bottle").id : FRAGRANCES[0].id);
    shell('<h1>Engrave the bottle</h1>' +
      '<p class="head-sub">Up to three initials, pressed into the label of every full bottle in this order. Adds ' + money(ENGRAVE_FEE) + '.</p>' +
      '<div class="engrave-row">' +
        '<div class="engrave-preview" id="engrave-preview">' + bottleSVG(FAMILIES[f0.family].hue, { cls: "big", engrave: st.engrave || "" }) + '</div>' +
        '<div class="engrave-ctl">' +
          '<label class="co-fld"><span>Initials</span><input type="text" id="engrave-in" maxlength="3" value="' + esc(st.engrave) + '" placeholder="e.g. A M R" autocomplete="off"></label>' +
          '<label class="co-check"><input type="checkbox" id="engrave-skip"' + (st.engrave ? "" : " checked") + '><span>No engraving, thank you</span></label>' +
        '</div>' +
      '</div>' +
      '<div class="co-nav"><button type="button" class="btn btn-line" id="back-ship">' + icon("arrowL") + 'Back</button>' +
        '<button type="button" class="btn btn-fill" id="place">Seal the order · <span id="grand">' + money(totals().grand) + '</span></button></div>');
    const inp = $("#engrave-in"), skip = $("#engrave-skip");
    function refresh() {
      st.engrave = skip.checked ? "" : inp.value.toUpperCase().replace(/[^A-Z ]/g, "").slice(0, 3);
      if (!skip.checked) inp.value = st.engrave;
      $("#engrave-preview").innerHTML = bottleSVG(FAMILIES[f0.family].hue, { cls: "big", engrave: st.engrave });
      $("#grand").textContent = money(totals().grand);
      wr(K.draft, { ship: st.ship, engrave: st.engrave });
    }
    inp.addEventListener("input", () => { if (inp.value.trim()) skip.checked = false; refresh(); });
    skip.addEventListener("change", refresh);
    $("#back-ship").addEventListener("click", stepShip);
    $("#place").addEventListener("click", stepDone);
    refresh();
  }

  function stepDone() {
    st.step = "done";
    const t = totals();
    const d = new Date();
    const ord = "SIL-" + d.getFullYear() + String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0") + "-" + Math.floor(1000 + Math.random() * 9000);
    const bottles = cart.filter((l) => l.kind === "bottle").reduce((s, l) => s + l.qty, 0);
    const samples = cart.some((l) => l.kind === "sample");
    cart = []; wr(K.cart, cart); localStorage.removeItem(K.draft);
    paintCounts();
    shell('<div class="sealed">' +
      '<div class="wax">' + I.check + '</div>' +
      '<h1>Sealed</h1>' +
      '<p class="head-sub">Thank you, ' + esc((st.ship.name || "").split(" ")[0]) + '. Your parcel will be wrapped in glassine and posted to the address on file.</p>' +
      '<p class="order-no">' + ord + '</p>' +
      '<p class="muted">' + bottles + ' bottle' + (bottles === 1 ? "" : "s") + (samples ? " + a discovery set" : "") +
        (st.engrave ? ' &middot; engraved “' + esc(st.engrave) + '”' : "") + ' &middot; ' + money(t.grand) + '</p>' +
      '<a class="btn btn-fill" href="catalogue.html">Back to the herbarium' + icon("arrowR") + '</a>' +
    '</div>');
  }

  stepShip();
};

/* ============================================================
   INIT
   ============================================================ */
renderChrome();
paintCounts();
if (pages[PAGE]) pages[PAGE]();
animateWordmarks();

})();
