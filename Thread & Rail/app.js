"use strict";
/* =================================================================
   THREAD & RAIL - garment-district showroom  |  shared app.js
   Vanilla JS, one IIFE. Thin HTML shells with <body data-page="...">
   and <main id="main">. Chrome + footer injected here.
   ================================================================= */
(function () {

/* ---------- helpers ---------- */
const $  = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const PAGE = document.body.dataset.page;
const money = (n) => "$" + Number(n).toFixed(2);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const uniq = (a) => Array.from(new Set(a));

/* ---------- hand-drawn garment silhouettes (recolorable) ---------- */
function svgWrap(inner) {
  return '<svg class="sil" viewBox="0 0 100 130" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + inner + '</svg>';
}
const SIL = {
  coat: svgWrap('<path d="M50 8 L38 18 L30 14 L14 26 L22 40 L30 34 L26 118 L74 118 L70 34 L78 40 L86 26 L70 14 L62 18 Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M50 8 L44 30 L50 40 L56 30 Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M38 18 L50 40 M62 18 L50 40" stroke="currentColor" stroke-width="1.4"/><line x1="50" y1="46" x2="50" y2="112" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3 4"/><circle cx="50" cy="54" r="1.6" fill="currentColor"/><circle cx="50" cy="66" r="1.6" fill="currentColor"/><circle cx="50" cy="78" r="1.6" fill="currentColor"/><path d="M18 70 L34 66 M66 66 L82 70" stroke="currentColor" stroke-width="1.4"/><rect x="30" y="86" width="12" height="9" rx="1.5" stroke="currentColor" stroke-width="1.3"/><rect x="58" y="86" width="12" height="9" rx="1.5" stroke="currentColor" stroke-width="1.3"/>'),
  jacket: svgWrap('<path d="M50 10 L37 20 L28 16 L14 30 L22 44 L30 38 L28 96 L72 96 L70 38 L78 44 L86 30 L72 16 L63 20 Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M50 10 L43 32 L50 42 L57 32 Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M37 20 L50 42 M63 20 L50 42" stroke="currentColor" stroke-width="1.4"/><line x1="50" y1="48" x2="50" y2="92" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3 4"/><circle cx="50" cy="56" r="1.6" fill="currentColor"/><circle cx="50" cy="68" r="1.6" fill="currentColor"/><circle cx="50" cy="80" r="1.6" fill="currentColor"/><path d="M22 44 L22 74 M78 44 L78 74" stroke="currentColor" stroke-width="1.3"/><rect x="33" y="60" width="11" height="7" rx="1" stroke="currentColor" stroke-width="1.1"/><rect x="56" y="60" width="11" height="7" rx="1" stroke="currentColor" stroke-width="1.1"/>'),
  tee: svgWrap('<path d="M50 14 L34 20 L14 32 L22 48 L32 42 L32 108 L68 108 L68 42 L78 48 L86 32 L66 20 Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M40 16 Q50 30 60 16" stroke="currentColor" stroke-width="1.6"/><path d="M34 20 L40 16 M66 20 L60 16" stroke="currentColor" stroke-width="1.6"/>'),
  blouse: svgWrap('<path d="M50 12 L36 19 L18 30 L25 44 L33 39 L30 112 L70 112 L67 39 L75 44 L82 30 L64 19 Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M41 15 Q50 26 59 15" stroke="currentColor" stroke-width="1.5"/><line x1="50" y1="26" x2="50" y2="106" stroke="currentColor" stroke-width="1.1" stroke-dasharray="2 4"/><circle cx="50" cy="34" r="1.3" fill="currentColor"/><circle cx="50" cy="46" r="1.3" fill="currentColor"/><circle cx="50" cy="58" r="1.3" fill="currentColor"/><circle cx="50" cy="70" r="1.3" fill="currentColor"/><path d="M33 60 Q50 68 67 60" stroke="currentColor" stroke-width="1.1"/>'),
  sweater: svgWrap('<path d="M50 12 L34 18 L16 30 L24 46 L33 40 L30 114 L70 114 L67 40 L76 46 L84 30 L66 18 Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M39 14 Q50 24 61 14" stroke="currentColor" stroke-width="1.8"/><line x1="30" y1="102" x2="70" y2="102" stroke="currentColor" stroke-width="1.1"/><line x1="30" y1="107" x2="70" y2="107" stroke="currentColor" stroke-width="1.1"/><line x1="26" y1="40" x2="26" y2="48" stroke="currentColor" stroke-width="1.1"/><line x1="74" y1="40" x2="74" y2="48" stroke="currentColor" stroke-width="1.1"/><path d="M34 18 L50 34 L66 18" stroke="currentColor" stroke-width="1.2"/>'),
  turtleneck: svgWrap('<path d="M50 22 L35 26 L18 34 L25 48 L34 42 L31 114 L69 114 L66 42 L75 48 L82 34 L65 26 Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><rect x="40" y="10" width="20" height="16" rx="6" stroke="currentColor" stroke-width="1.8"/><line x1="40" y1="18" x2="60" y2="18" stroke="currentColor" stroke-width="1.2"/>'),
  trousers: svgWrap('<path d="M32 10 L68 10 L70 30 L60 30 L64 118 L54 118 L50 46 L46 118 L36 118 L40 30 L30 30 Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><line x1="50" y1="12" x2="50" y2="28" stroke="currentColor" stroke-width="1.2" stroke-dasharray="2 3"/><line x1="45" y1="34" x2="41" y2="112" stroke="currentColor" stroke-width="1" stroke-dasharray="2 4"/><line x1="55" y1="34" x2="59" y2="112" stroke="currentColor" stroke-width="1" stroke-dasharray="2 4"/><line x1="32" y1="18" x2="68" y2="18" stroke="currentColor" stroke-width="1.4"/>'),
  jeans: svgWrap('<path d="M32 10 L68 10 L70 30 L60 30 L64 118 L54 118 L50 46 L46 118 L36 118 L40 30 L30 30 Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><line x1="32" y1="18" x2="68" y2="18" stroke="currentColor" stroke-width="1.4"/><rect x="35" y="6" width="6" height="5" stroke="currentColor" stroke-width="1"/><rect x="59" y="6" width="6" height="5" stroke="currentColor" stroke-width="1"/><path d="M40 24 Q45 30 42 36" stroke="currentColor" stroke-width="1" stroke-dasharray="1.5 3"/><path d="M60 24 Q55 30 58 36" stroke="currentColor" stroke-width="1" stroke-dasharray="1.5 3"/><line x1="45" y1="36" x2="41" y2="112" stroke="currentColor" stroke-width="1" stroke-dasharray="2 4"/><line x1="55" y1="36" x2="59" y2="112" stroke="currentColor" stroke-width="1" stroke-dasharray="2 4"/>'),
  skirt: svgWrap('<path d="M36 14 L64 14 L82 104 L18 104 Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><line x1="36" y1="14" x2="64" y2="14" stroke="currentColor" stroke-width="2.4"/><line x1="50" y1="20" x2="50" y2="100" stroke="currentColor" stroke-width="1" stroke-dasharray="2 4"/><line x1="40" y1="20" x2="34" y2="100" stroke="currentColor" stroke-width="1" stroke-dasharray="2 4"/><line x1="60" y1="20" x2="66" y2="100" stroke="currentColor" stroke-width="1" stroke-dasharray="2 4"/>'),
  scarf: svgWrap('<path d="M10 40 Q50 10 90 40 Q60 50 66 66 Q40 60 34 76 Q60 74 90 90" stroke="currentColor" stroke-width="6" stroke-linecap="round" fill="none"/><path d="M10 40 L4 46 M10 40 L6 34" stroke="currentColor" stroke-width="1.3"/><path d="M90 90 L96 94 M90 90 L94 84" stroke="currentColor" stroke-width="1.3"/>'),
  tote: svgWrap('<path d="M22 40 L78 40 L74 112 Q50 118 26 112 Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M32 40 C32 20 40 12 50 12 C60 12 68 20 68 40" stroke="currentColor" stroke-width="2.2" fill="none"/><line x1="22" y1="52" x2="78" y2="52" stroke="currentColor" stroke-width="1.2" stroke-dasharray="2 3"/><line x1="30" y1="108" x2="70" y2="108" stroke="currentColor" stroke-width="1"/>'),
  belt: svgWrap('<line x1="8" y1="65" x2="60" y2="65" stroke="currentColor" stroke-width="10" stroke-linecap="round"/><rect x="58" y="52" width="30" height="26" rx="3" stroke="currentColor" stroke-width="2.2"/><line x1="66" y1="65" x2="80" y2="65" stroke="currentColor" stroke-width="2"/>')
};
const silFor = (t) => SIL[t] || SIL.tee;

/* small photo thumb with an always-present sketch fallback (shown on img error) */
function thumb(g, cls) {
  const hex = (g.colors[0] && g.colors[0].hex) || "#16130f";
  return '<span class="' + cls + '">' +
    '<img src="img/' + g.photo + '.jpg" alt="" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' +
    '<span class="' + cls + '-fb" style="color:' + hex + '">' + silFor(g.sil) + '</span></span>';
}

/* ---------- inline icons (no text arrows) ---------- */
const I = {
  hanger: '<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="9" r="2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M16 11 L16 14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M16 14 L5 24 Q4 26 6 26 L26 26 Q28 26 27 24 Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>',
  chevR: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 5 16 12 9 19"/></svg>',
  chevL: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 5 8 12 15 19"/></svg>',
  arrowR: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="12" x2="19" y2="12"/><polyline points="13 6 19 12 13 18"/></svg>',
  minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11Z"/><circle cx="12" cy="10" r="2.4"/></svg>',
  needle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 21 L18 6"/><circle cx="19.5" cy="4.5" r="2"/><path d="M18 6 l-3 -1"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>',
  repeat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.8 6.1 20.8l1.2-6.6L2.5 9l6.6-.9z"/></svg>'
};

/* ---------- catalog ---------- */
const GARMENTS = [
  { id: "trench-01", name: "Storm-Line Trench", category: "Outerwear", price: 268, sil: "coat", added: "2026-05-02", stock: 6,
    fabric: "Waxed cotton canvas, storm flap, horn buttons",
    desc: "A double-breasted trench cut for the loading dock, not the runway. The waxed canvas sheds rain, the storm flap keeps the wind out, and the belt cinches for a silhouette that holds its shape all day.",
    sizes: ["XS", "S", "M", "L", "XL"], fit: "true", fitNote: "Cut roomy over a knit. Size down if you want it sharp.",
    colors: [{ name: "Sand", hex: "#cdbb95" }, { name: "Ink", hex: "#1c1a17" }, { name: "Olive", hex: "#5c6144" }],
    care: ["Re-wax annually", "Sponge clean only", "Do not machine wash", "Hang to air"],
    pairs: ["turtleneck-01", "trousers-01", "scarf-01"] },
  { id: "jacket-01", name: "Indigo Rail Jacket", category: "Outerwear", price: 184, sil: "jacket", added: "2026-06-18", stock: 11,
    fabric: "14oz raw selvedge denim, brass rivets",
    desc: "Built like the workwear it's descended from: chest pockets deep enough for a notebook, brass rivets at the stress points, and a raw indigo that fades exactly where you bend it.",
    sizes: ["S", "M", "L", "XL"], fit: "small", fitNote: "Raw denim; it relaxes about half a size after a week.",
    colors: [{ name: "Indigo", hex: "#33445e" }, { name: "Ecru", hex: "#e8ddc4" }],
    care: ["Wash cold, inside out, sparingly", "Line dry", "Expect indigo crocking early on"],
    pairs: ["tee-01", "jeans-01", "belt-01"] },
  { id: "coat-02", name: "Cartage Wool Overcoat", category: "Outerwear", price: 412, sil: "coat", added: "2026-04-11", stock: 4,
    fabric: "Melton wool, satin lining, welt pockets",
    desc: "Heavyweight melton wool with a satin lining that lets it slide on over a blazer without a fight. Welt pockets, horn buttons, a collar built to stand up against February.",
    sizes: ["S", "M", "L", "XL"], fit: "true", fitNote: "Tailored through the chest with room for a jacket underneath.",
    colors: [{ name: "Charcoal", hex: "#302d2a" }, { name: "Camel", hex: "#b98a52" }],
    care: ["Dry clean", "Brush after wear", "Store on a wide hanger"],
    pairs: ["turtleneck-01", "trousers-01", "scarf-01"] },
  { id: "tee-01", name: "Loading-Dock Boxy Tee", category: "Tops", price: 48, sil: "tee", added: "2026-07-05", stock: 40,
    fabric: "Heavyweight combed cotton jersey",
    desc: "A boxy tee cut from heavyweight jersey so it drapes instead of clinging. Reinforced collar seam, dropped shoulder, the kind of basic you reach for first.",
    sizes: ["XS", "S", "M", "L", "XL"], fit: "true", fitNote: "Boxy by design. Size down for a trimmer line.",
    colors: [{ name: "White", hex: "#f7f4ec" }, { name: "Black", hex: "#1c1a17" }, { name: "Rust", hex: "#a4462a" }],
    care: ["Machine wash cold", "Tumble low", "It will shrink a touch the first wash"],
    pairs: ["jacket-01", "jeans-01", "tote-01"] },
  { id: "blouse-01", name: "Bias-Cut Silk Blouse", category: "Tops", price: 156, sil: "blouse", added: "2026-03-20", stock: 9,
    fabric: "Mulberry silk charmeuse, mother-of-pearl buttons",
    desc: "Cut on the bias so the silk moves with you instead of against you. Mother-of-pearl buttons up the placket, a collar that softens without going limp.",
    sizes: ["XS", "S", "M", "L"], fit: "small", fitNote: "Bias cut runs close. Size up if you're between.",
    colors: [{ name: "Ivory", hex: "#f4ecd8" }, { name: "Bottle Green", hex: "#2f4a3c" }],
    care: ["Hand wash cold or dry clean", "Iron low with a cloth", "Hang, don't fold"],
    pairs: ["skirt-01", "trousers-01", "belt-01"] },
  { id: "sweater-01", name: "Warehouse Cable Sweater", category: "Tops", price: 198, sil: "sweater", added: "2026-06-30", stock: 8,
    fabric: "Merino-wool cable knit, ribbed cuffs",
    desc: "Hand-finished cable panels in a merino heavy enough to wear as outerwear on a mild day. Ribbed cuffs and hem keep the shape after a hundred washes.",
    sizes: ["S", "M", "L", "XL"], fit: "true", fitNote: "Substantial knit; true to size over a shirt.",
    colors: [{ name: "Oatmeal", hex: "#ddd0b4" }, { name: "Navy", hex: "#232c42" }],
    care: ["Hand wash cool", "Dry flat", "Never hang a wet knit"],
    pairs: ["jeans-01", "trousers-01", "scarf-01"] },
  { id: "turtleneck-01", name: "Needle Turtleneck", category: "Tops", price: 132, sil: "turtleneck", added: "2026-07-15", stock: 15,
    fabric: "Fine-gauge merino, seamless collar",
    desc: "Fine-gauge merino knit on a seamless collar so nothing rubs at the neck. Slim through the body, long enough to stay tucked.",
    sizes: ["XS", "S", "M", "L", "XL"], fit: "true", fitNote: "Slim fit. Layers cleanly under a coat.",
    colors: [{ name: "Black", hex: "#1c1a17" }, { name: "Cream", hex: "#efe7d4" }],
    care: ["Hand wash or wool cycle", "Dry flat", "Steam, don't iron"],
    pairs: ["coat-02", "trousers-01", "skirt-01"] },
  { id: "trousers-01", name: "Cutting-Room Trousers", category: "Bottoms", price: 172, sil: "trousers", added: "2026-02-14", stock: 12,
    fabric: "Italian wool twill, pressed center crease",
    desc: "A wool twill trouser with a pressed center crease that survives a full day on your feet. Deep pockets, a tailored break at the ankle.",
    sizes: ["28", "30", "32", "34", "36", "38"], fit: "true", fitNote: "Mid-rise, straight through the leg.",
    colors: [{ name: "Charcoal", hex: "#302d2a" }, { name: "Stone", hex: "#b7ab93" }],
    care: ["Dry clean", "Press with a cloth", "Hang by the cuffs"],
    pairs: ["blouse-01", "turtleneck-01", "belt-01"] },
  { id: "jeans-01", name: "Selvedge Straight Jeans", category: "Bottoms", price: 158, sil: "jeans", added: "2026-07-10", stock: 18,
    fabric: "13oz Japanese selvedge denim",
    desc: "A straight leg cut from 13oz Japanese selvedge, chain-stitched hem, and a fade pattern that's entirely yours to earn.",
    sizes: ["28", "30", "32", "34", "36", "38"], fit: "small", fitNote: "Raw denim; buy your waist, it stretches to fit.",
    colors: [{ name: "Raw Indigo", hex: "#2b3a56" }, { name: "Washed Black", hex: "#3a3733" }],
    care: ["Wash rarely, cold, inside out", "Line dry", "Soak once before first wear"],
    pairs: ["tee-01", "jacket-01", "belt-01"] },
  { id: "skirt-01", name: "Pattern-Room Pleated Skirt", category: "Bottoms", price: 138, sil: "skirt", added: "2026-05-27", stock: 7,
    fabric: "Wool-blend twill, box pleats",
    desc: "Box pleats cut straight from the pattern room, weighted enough to hold their line whether you're sitting at a desk or crossing a street in the wind.",
    sizes: ["XS", "S", "M", "L"], fit: "true", fitNote: "Sits at the natural waist, hits below the knee.",
    colors: [{ name: "Camel", hex: "#b98a52" }, { name: "Black", hex: "#1c1a17" }],
    care: ["Dry clean", "Press pleats from the inside", "Hang from the waistband"],
    pairs: ["blouse-01", "turtleneck-01", "scarf-01"] },
  { id: "scarf-01", name: "Bolt-End Wool Scarf", category: "Accessories", price: 78, sil: "scarf", added: "2026-06-02", stock: 22,
    fabric: "Lambswool, hand-fringed edges",
    desc: "Woven from the bolt end of a lambswool run, finished with hand-tied fringe. Long enough to wrap twice and still hang loose.",
    sizes: ["One Size"], fit: "true", fitNote: "200 x 32 cm. Wraps twice comfortably.",
    colors: [{ name: "Charcoal", hex: "#302d2a" }, { name: "Rust", hex: "#a4462a" }, { name: "Cream", hex: "#efe7d4" }],
    care: ["Hand wash cool", "Dry flat", "Comb the fringe straight"],
    pairs: ["coat-02", "sweater-01", "turtleneck-01"] },
  { id: "tote-01", name: "Notions Tote", category: "Accessories", price: 128, sil: "tote", added: "2026-01-09", stock: 14,
    fabric: "Waxed canvas, leather-wrapped handles",
    desc: "Named for the notions counter it was built to haul from - waxed canvas body, leather-wrapped handles, a base stitched to carry more than it looks like it should.",
    sizes: ["One Size"], fit: "true", fitNote: "38 x 36 x 12 cm. Holds a 15-inch laptop flat.",
    colors: [{ name: "Black", hex: "#1c1a17" }, { name: "Tan", hex: "#c9a877" }],
    care: ["Wipe with a damp cloth", "Re-wax the base as needed", "The leather will patina"],
    pairs: ["tee-01", "jacket-01", "jeans-01"] },
  { id: "belt-01", name: "Grommet Leather Belt", category: "Accessories", price: 86, sil: "belt", added: "2026-07-19", stock: 20,
    fabric: "Full-grain leather, brushed brass buckle",
    desc: "Full-grain leather that breaks in rather than breaks down, with a brushed brass buckle sized to actually hold a heavy coat closed.",
    sizes: ["S", "M", "L", "XL"], fit: "true", fitNote: "Order the waist you wear; five holes, centre is your size.",
    colors: [{ name: "Black", hex: "#1c1a17" }, { name: "Cognac", hex: "#8a4a28" }],
    care: ["Condition twice a year", "Keep it out of the wash", "Store rolled, not folded"],
    pairs: ["trousers-01", "jeans-01", "jacket-01"] }
];
GARMENTS.forEach((g) => { g.photo = g.id; });
const CATEGORIES = ["Outerwear", "Tops", "Bottoms", "Accessories"];
const ALL_SIZES = ["XS", "S", "M", "L", "XL", "28", "30", "32", "34", "36", "38", "One Size"];

/* ---------- seeded fit reports ---------- */
const SEED_REVIEWS = {
  "trench-01": [["mara_k", 5, "true", "Wore it through a week of London drizzle. Bone dry, still looks pressed."], ["dockside", 4, "large", "Beautiful canvas. I took the M down to an S and it's perfect now."]],
  "jacket-01": [["raw_convert", 5, "small", "Stiff as a board for three days, then it's the only jacket you want."], ["chore_coat", 4, "true", "Indigo got on a white shirt once. Worth it."]],
  "coat-02": [["feb_commuter", 5, "true", "Slides over a blazer with zero fuss. Genuinely warm."], ["camel_fan", 5, "true", "The camel is the exact colour in the photo, which never happens."]],
  "tee-01": [["heavyweight", 5, "true", "Finally a tee that hangs instead of shrink-wrapping."], ["boxy_yes", 4, "large", "Very boxy. I love it, but know what you're buying."]],
  "blouse-01": [["silk_daily", 4, "small", "Sized up to M and it drapes beautifully."], ["pearl_buttons", 5, "true", "The buttons alone are worth it."]],
  "sweater-01": [["cable_weather", 5, "true", "Wear it as a jacket in spring. That heavy."], ["merino_moth", 4, "true", "Hand wash only is real. Follow it."]],
  "turtleneck-01": [["layer", 5, "true", "Thin enough to layer, warm enough to matter."], ["neck_sensitive", 5, "true", "Seamless collar, no itch. Bought a second."]],
  "trousers-01": [["crease_keeper", 5, "true", "Held the crease through a 12-hour travel day."], ["desk_to_dinner", 4, "true", "Slightly long; one hem and they're flawless."]],
  "jeans-01": [["fade_chaser", 5, "small", "Bought my true waist, soaked once, now they're molded to me."], ["selvedge_first", 4, "small", "Tight for a week. Patience pays."]],
  "skirt-01": [["pleat_life", 5, "true", "The pleats actually stay. Windy platform, no drama."], ["desk_skirt", 4, "true", "Sits high; tuck a fitted knit and you're set."]],
  "scarf-01": [["wrap_twice", 5, "true", "Enormous in the best way. Rust colour is gorgeous."], ["fringe_comb", 4, "true", "Shed a little at first, then settled."]],
  "tote-01": [["laptop_haul", 5, "true", "Carries far more than it looks like it should."], ["wax_base", 4, "true", "Base sags a bit when full. Re-waxed it, better."]],
  "belt-01": [["one_belt", 5, "true", "Buckle is heavy brass, not plated. Holds a coat shut."], ["cognac", 5, "true", "Patina after two months is unreal."]]
};

/* ---------- cutting-room notes ---------- */
const NOTES = [
  { slug: "reading-a-fabric-name", title: "How to read a fabric name", mins: 4, related: ["trench-01", "trousers-01"],
    lede: "Waxed cotton canvas, 14oz selvedge, melton wool - the words on the tag tell you how a garment will wear.",
    body: [
      { h: "WEIGHT IS THE FIRST NUMBER", p: "Denim is sold by ounces per square yard. A 5oz shirting drapes; a 14oz selvedge stands up on its own and takes months to break in. Wool is graded in grams per metre - 250g is a shirt-jacket, 500g is a winter coat that will outlive the trend." },
      { h: "THE FINISH DOES THE WORK", p: "\"Waxed\" cotton has been saturated with paraffin so water beads instead of soaking. It needs re-waxing once a year and it will never go in a machine. \"Mercerised\" cotton has been treated for sheen and strength. \"Garment-dyed\" means colour was added after sewing, so it fades at the seams first." },
      { h: "SELVEDGE IS A LOOM, NOT A QUALITY CLAIM", p: "It means the fabric was woven on a narrow shuttle loom that finishes its own edge - the clean self-edge you see at the cuff. It tends to correlate with denser, slower-woven cloth, but the loom is the fact; everything else is the mill." }
    ] },
  { slug: "size-down-or-up", title: "When to size down, and when not to", mins: 3, related: ["jacket-01", "blouse-01", "jeans-01"],
    lede: "Our fit tags say true, runs small, or runs large. Here's what to actually do about it.",
    body: [
      { h: "RAW DENIM: BUY YOUR WAIST", p: "Raw, unwashed denim relaxes roughly half a size in the waist within a week and stretches to your body from there. Buy the number you measure. Do not buy the number you wish you measured." },
      { h: "BIAS CUT: SIZE UP IF BETWEEN", p: "A bias-cut blouse or skirt is cut diagonally across the weave so it clings and moves. There's less ease built in. If you're between sizes, take the larger one - it will settle close." },
      { h: "OUTERWEAR: LAYER FIRST, THEN DECIDE", p: "Try a coat over the thickest thing you'll wear under it. A trench that's sharp over a shirt is a straitjacket over a cable knit. Our overcoats are cut with jacket room; the trench is not." }
    ] },
  { slug: "a-wardrobe-that-holds", title: "Building a wardrobe that holds its line", mins: 5, related: ["coat-02", "trousers-01", "turtleneck-01", "belt-01"],
    lede: "A capsule isn't a rule about numbers. It's a set of pieces that all agree with each other.",
    body: [
      { h: "ONE PALETTE, TWO NEUTRALS", p: "Pick a warm or a cool base and stay there. Our workroom palette is warm - sand, camel, oatmeal, ink. Two neutrals that go with everything (here: charcoal and cream) plus one accent you actually wear is a wardrobe. Five accents is a pile of laundry." },
      { h: "BUY THE BRIDGE PIECES FIRST", p: "A fine merino turtleneck goes under a trench, under an overcoat, over nothing. A leather belt in the right brown ties a denim jacket to wool trousers. Bridge pieces earn their cost per wear in a month." },
      { h: "LET FABRIC SET THE SEASON", p: "The same trouser pattern in linen is July and in flannel is January. Repeat the cuts you know fit you and change the cloth. Your tailor, your muscle memory, and your mirror all thank you." }
    ] },
  { slug: "care-that-buys-years", title: "The care habits that buy years", mins: 3, related: ["sweater-01", "trench-01"],
    lede: "Most garments don't wear out. They get washed to death.",
    body: [
      { h: "WASH LESS", p: "Wool and denim almost never need a wash - they need air. Hang a knit by an open window overnight and the smell is gone. A spot of dinner comes out with a damp cloth. Water and agitation are what age cloth." },
      { h: "DRY FLAT, ALWAYS, FOR KNITS", p: "A wet knit on a hanger stretches under its own weight and never recovers the shoulders. Lay it on a towel, reshape it, walk away. Same for anything with lycra." },
      { h: "HANGERS ARE NOT OPTIONAL", p: "A wide wooden hanger keeps a coat's shoulders. Wire hangers put a dimple in them within a season. Fold knits, hang wovens, and give a structured coat the widest hanger you own." }
    ] }
];

/* ---------- storage ---------- */
const K = {
  cart: "tr_cart_v1", saved: "tr_saved_v1", looks: "tr_looks_v1",
  reviews: "tr_reviews_v1", recent: "tr_recent_v1", orders: "tr_orders_v1"
};
const rd = (k, f) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? f : v; } catch (e) { return f; } };
const wr = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

/* migrate the old single-page cart */
(function () {
  if (localStorage.getItem(K.cart)) return;
  const old = rd("threadAndRailCart", null);
  if (Array.isArray(old)) wr(K.cart, old);
})();

let cart  = rd(K.cart, []).filter((l) => l && GARMENTS.some((g) => g.id === l.id));
let saved = rd(K.saved, []).filter((id) => GARMENTS.some((g) => g.id === id));
const saveCart  = () => { wr(K.cart, cart); paintCounts(); };
const saveSaved = () => { wr(K.saved, saved); paintCounts(); };

const gar = (id) => GARMENTS.find((g) => g.id === id);
const isSaved = (id) => saved.indexOf(id) !== -1;
const lineKey = (l) => l.id + "|" + l.size + "|" + l.color;
const cartQty = () => cart.reduce((n, l) => n + l.qty, 0);
const cartTotal = () => cart.reduce((s, l) => { const g = gar(l.id); return g ? s + g.price * l.qty : s; }, 0);

function reviewsFor(id) {
  const seed = (SEED_REVIEWS[id] || []).map(([n, s, fit, t]) => ({ name: n, stars: s, fit: fit, text: t, seed: true }));
  return seed.concat(rd(K.reviews, {})[id] || []);
}
function ratingFor(id) {
  const r = reviewsFor(id);
  if (!r.length) return null;
  return { avg: r.reduce((s, x) => s + x.stars, 0) / r.length, count: r.length };
}
function fitVerdict(id) {
  const r = reviewsFor(id);
  if (!r.length) return null;
  const tally = { small: 0, true: 0, large: 0 };
  r.forEach((x) => { if (tally[x.fit] != null) tally[x.fit]++; });
  const top = Object.keys(tally).sort((a, b) => tally[b] - tally[a])[0];
  return top;
}
function starRow(avg, cls) {
  let o = '<span class="stars ' + (cls || "") + '" aria-hidden="true">';
  for (let i = 1; i <= 5; i++) o += '<span class="star' + (avg >= i - 0.35 ? " on" : "") + '">' + I.star + "</span>";
  return o + "</span>";
}
const fitLabel = { small: "Runs small", true: "True to size", large: "Runs large" };

/* ---------- cart ops ---------- */
function addToCart(g, size, colorName, qty) {
  const line = { id: g.id, size: size, color: colorName, qty: clamp(qty, 1, 99) };
  const ex = cart.find((l) => lineKey(l) === lineKey(line));
  if (ex) ex.qty = clamp(ex.qty + qty, 1, 99);
  else cart.push(line);
  saveCart();
  toast(g.name + " added to your rail");
}
function setLineQty(key, q) {
  const l = cart.find((x) => lineKey(x) === key); if (!l) return;
  l.qty = q;
  if (l.qty <= 0) cart = cart.filter((x) => lineKey(x) !== key);
  saveCart();
}
function removeLine(key) { cart = cart.filter((l) => lineKey(l) !== key); saveCart(); }

function toggleSave(id) {
  const i = saved.indexOf(id);
  if (i === -1) { saved.unshift(id); toast(gar(id).name + " pinned to the fitting room"); }
  else { saved.splice(i, 1); toast(gar(id).name + " unpinned"); }
  saveSaved();
  if (pageRepaint) pageRepaint();
}
function pushRecent(id) {
  let r = rd(K.recent, []).filter((x) => x !== id);
  r.unshift(id);
  wr(K.recent, r.slice(0, 8));
}

/* ---------- toast ---------- */
function toast(msg) {
  let host = $("#toast-host");
  if (!host) { host = document.createElement("div"); host.id = "toast-host"; host.className = "toast-host"; document.body.appendChild(host); }
  const el = document.createElement("div");
  el.className = "toast";
  el.innerHTML = '<span class="toast-mark">' + I.needle + "</span>" + esc(msg);
  host.appendChild(el);
  requestAnimationFrame(() => el.classList.add("in"));
  setTimeout(() => { el.classList.remove("in"); setTimeout(() => el.remove(), 300); }, 2600);
}

/* ============================================================
   CHROME
   ============================================================ */
const NAV = [
  { href: "rack.html", label: "The Rack", key: "rack" },
  { href: "lookbook.html", label: "Lookbook", key: "lookbook" },
  { href: "atelier.html", label: "Cutting Room", key: "atelier" },
  { href: "fitting.html", label: "Fitting Room", key: "fitting" }
];

function renderChrome() {
  const header = document.createElement("header");
  header.className = "site-header";
  header.innerHTML =
    '<div class="header-inner">' +
      '<a class="wordmark" href="index.html" aria-label="Thread & Rail - home">' +
        '<span class="wm-thread">Thread</span><span class="wm-amp">&amp;</span><span class="wm-rail">Rail</span>' +
        '<svg class="wm-stitch" viewBox="0 0 160 8" aria-hidden="true"><line x1="2" y1="4" x2="158" y2="4" stroke="var(--thread)" stroke-width="2" stroke-linecap="round" stroke-dasharray="7 5"/></svg>' +
      '</a>' +
      '<button class="nav-toggle" id="nav-toggle" aria-label="Menu" aria-expanded="false">' + I.menu + '</button>' +
      '<nav class="site-nav" id="site-nav" aria-label="Main">' +
        NAV.map((n) => '<a href="' + n.href + '"' + (n.key === PAGE ? ' aria-current="page"' : "") + ">" + n.label + "</a>").join("") +
        '<a href="fitting.html" class="nav-mini' + (PAGE === "fitting" ? '" aria-current="page' : "") + '"><span>Pinned</span><span class="mini-badge" data-saved-count>0</span></a>' +
        '<a href="rail.html" class="nav-mini nav-rail' + (PAGE === "rail" ? '" aria-current="page' : "") + '">' + I.hanger + '<span>Your Rail</span><span class="mini-badge" data-cart-count>0</span></a>' +
      '</nav>' +
    '</div>' +
    '<div class="tape-strip" aria-hidden="true"></div>';
  document.body.insertBefore(header, document.body.firstChild);

  const footer = document.createElement("footer");
  footer.className = "site-footer";
  footer.innerHTML =
    '<div class="footer-inner">' +
      '<span class="foot-mark">Thread <span class="amp">&amp;</span> Rail</span>' +
      '<span>Garment District Showroom / Rack No. 04</span>' +
      '<span>Front-end demo. No payment is processed and no data leaves your browser.</span>' +
      '<span>Garment photos under Creative Commons / see img/_credits.json</span>' +
    '</div>';
  document.body.appendChild(footer);

  // animated running-stitch wordmark (one interval, survives frozen preview)
  const stitch = $(".wm-stitch line");
  if (stitch && !reduced) {
    let off = 0;
    setInterval(() => { off = (off - 1) % 24; stitch.setAttribute("stroke-dashoffset", off); }, 90);
  }

  const nav = $("#site-nav"), tog = $("#nav-toggle");
  function setNav(open) { nav.classList.toggle("open", open); tog.setAttribute("aria-expanded", open ? "true" : "false"); tog.classList.toggle("x", open); }
  tog.addEventListener("click", (e) => { e.stopPropagation(); setNav(!nav.classList.contains("open")); });
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) setNav(false); });
  document.addEventListener("click", (e) => { if (nav.classList.contains("open") && !nav.contains(e.target) && !tog.contains(e.target)) setNav(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setNav(false); });
}

function paintCounts() {
  $$("[data-cart-count]").forEach((el) => { const c = cartQty(); el.textContent = String(c); el.classList.toggle("zero", c === 0); });
  $$("[data-saved-count]").forEach((el) => { el.textContent = String(saved.length); el.classList.toggle("zero", saved.length === 0); });
  if (pageRepaint) pageRepaint();
}
let pageRepaint = null;

/* ============================================================
   THEMED CONTROLS
   ============================================================ */
function enhanceSelect(sel) {
  if (!sel || sel.dataset.tr) return;
  sel.dataset.tr = "1";
  const wrap = document.createElement("div"); wrap.className = "tr-sel";
  sel.parentNode.insertBefore(wrap, sel); wrap.appendChild(sel);
  sel.classList.add("tr-sel-native");
  const trig = document.createElement("button");
  trig.type = "button"; trig.className = "tr-sel-trigger";
  trig.setAttribute("aria-haspopup", "listbox"); trig.setAttribute("aria-expanded", "false");
  const panel = document.createElement("div"); panel.className = "tr-sel-panel"; panel.setAttribute("role", "listbox"); panel.hidden = true;
  wrap.appendChild(trig); wrap.appendChild(panel);
  function build() {
    panel.innerHTML = "";
    Array.from(sel.options).forEach((o) => {
      const d = document.createElement("div");
      d.className = "tr-sel-opt"; d.setAttribute("role", "option"); d.textContent = o.textContent;
      if (o.value === sel.value) d.setAttribute("aria-selected", "true");
      d.addEventListener("click", () => { sel.value = o.value; sel.dispatchEvent(new Event("change", { bubbles: true })); close(); });
      panel.appendChild(d);
    });
  }
  function sync() {
    const o = sel.options[sel.selectedIndex];
    trig.innerHTML = "<span>" + (o ? esc(o.textContent) : "") + '</span><span class="tr-sel-caret">' + I.chevR + "</span>";
  }
  function open() { build(); panel.hidden = false; trig.setAttribute("aria-expanded", "true"); }
  function close() { panel.hidden = true; trig.setAttribute("aria-expanded", "false"); }
  trig.addEventListener("click", () => (panel.hidden ? open() : close()));
  document.addEventListener("click", (e) => { if (!wrap.contains(e.target)) close(); });
  sel.addEventListener("change", sync);
  sync();
}

function stepperHTML(value, key) {
  return '<span class="tr-step" data-step' + (key ? ' data-key="' + esc(key) + '"' : "") + '>' +
    '<button type="button" class="tr-step-b" data-d="-1" aria-label="Decrease">' + I.minus + '</button>' +
    '<span class="tr-step-v" data-v>' + value + '</span>' +
    '<button type="button" class="tr-step-b" data-d="1" aria-label="Increase">' + I.plus + '</button></span>';
}
function bindSteppers(root, cb) {
  $$(".tr-step", root).forEach((el) => {
    if (el.dataset.b) return; el.dataset.b = "1";
    el.addEventListener("click", (e) => {
      const b = e.target.closest("[data-d]"); if (!b) return;
      const d = Number(b.dataset.d);
      if (el.dataset.key) { const l = cart.find((x) => lineKey(x) === el.dataset.key); if (l) { setLineQty(el.dataset.key, l.qty + d); } }
      if (cb) cb(d, el);
    });
  });
}

/* ---------- garment image (photo <-> sketch) ---------- */
function garmentImage(g, opts) {
  opts = opts || {};
  const colorHex = opts.colorHex || (g.colors[0] && g.colors[0].hex) || "#16130f";
  return '<div class="gimg ' + (opts.cls || "") + '" data-gimg style="--sil-color:' + colorHex + '">' +
    '<div class="gimg-photo" data-view="photo"><img src="img/' + g.photo + '.jpg" alt="' + esc(g.name) + '" loading="lazy" onerror="this.closest(\'[data-gimg]\').dataset.nophoto=\'1\'"></div>' +
    '<div class="gimg-sketch" data-view="sketch">' + silFor(g.sil) + '</div>' +
    (opts.toggle === false ? "" :
      '<div class="gimg-tabs"><button type="button" data-gv="photo" class="on">Photo</button><button type="button" data-gv="sketch">Sketch</button></div>') +
  '</div>';
}
function bindGImg(root) {
  $$("[data-gimg]", root).forEach((el) => {
    if (el.dataset.nophoto) el.dataset.view = "sketch";
    else el.dataset.view = el.dataset.view || "photo";
    $$("[data-gv]", el).forEach((b) => b.addEventListener("click", () => {
      el.dataset.view = b.dataset.gv;
      $$("[data-gv]", el).forEach((x) => x.classList.toggle("on", x === b));
    }));
  });
}

/* ---------- garment card ---------- */
function card(g) {
  const r = ratingFor(g.id);
  const low = g.stock <= 5;
  return '<article class="gcard reveal" data-id="' + g.id + '">' +
    '<button type="button" class="gcard-pin' + (isSaved(g.id) ? " on" : "") + '" data-pin="' + g.id + '" aria-label="Pin to fitting room" aria-pressed="' + isSaved(g.id) + '">' + I.pin + '</button>' +
    '<a class="gcard-hit" href="garment.html#' + g.id + '">' +
      '<span class="gcard-swatch" aria-hidden="true"></span>' +
      garmentImage(g, { toggle: false, cls: "card" }) +
      '<div class="gcard-body">' +
        '<p class="gcard-cat">' + g.category + '</p>' +
        '<h3 class="gcard-name">' + esc(g.name) + '</h3>' +
        '<p class="gcard-fabric">' + esc(g.fabric) + '</p>' +
        '<span class="swing-tag">' + money(g.price) + ' <span class="st-dot"></span> ' + g.sizes.length + (g.sizes.length === 1 ? " size" : " sizes") + '</span>' +
        (r ? '<span class="gcard-rate">' + starRow(r.avg, "sm") + " " + r.avg.toFixed(1) + "</span>" : "") +
        (low ? '<span class="gcard-low">Only ' + g.stock + ' left on the rail</span>' : "") +
      '</div>' +
    '</a>' +
    '<div class="gcard-actions">' +
      '<button type="button" class="btn btn-ink btn-sm" data-quick="' + g.id + '">Add to Rail</button>' +
      '<a class="btn btn-line btn-sm" href="garment.html#' + g.id + '">Details</a>' +
    '</div>' +
  '</article>';
}
function bindCards(root) {
  bindGImg(root);
  $$("[data-pin]", root).forEach((b) => b.addEventListener("click", (e) => {
    e.preventDefault(); toggleSave(b.dataset.pin);
    const on = isSaved(b.dataset.pin);
    b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on));
  }));
  $$("[data-quick]", root).forEach((b) => b.addEventListener("click", (e) => {
    e.preventDefault();
    const g = gar(b.dataset.quick);
    addToCart(g, g.sizes[Math.min(1, g.sizes.length - 1)], g.colors[0].name, 1);
    flyTag(b);
  }));
}

/* ---------- flying swing-tag micro-interaction ---------- */
function flyTag(fromEl) {
  const target = $(".nav-rail") || $("[data-cart-count]");
  if (!fromEl || !target) return;
  const a = fromEl.getBoundingClientRect(), b = target.getBoundingClientRect();
  const tag = document.createElement("div");
  tag.className = "fly-tag";
  tag.style.left = (a.left + a.width / 2 - 26) + "px";
  tag.style.top = (a.top + a.height / 2 - 12) + "px";
  document.body.appendChild(tag);
  requestAnimationFrame(() => {
    tag.style.transform = "translate(" + (b.left + b.width / 2 - (a.left + a.width / 2)) + "px," +
      (b.top + b.height / 2 - (a.top + a.height / 2)) + "px) scale(0.2) rotate(16deg)";
    tag.style.opacity = "0";
  });
  setTimeout(() => tag.remove(), 750);
  $$("[data-cart-count]").forEach((el) => { el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); });
}

/* ---------- reveal-on-load ----------
   IntersectionObserver never fires and CSS transitions freeze at frame 0
   in the preview renderer, so a hard backstop force-shows everything. */
let _revealBackstop = false;
function armReveals(root) {
  const els = $$(".reveal", root || document);
  if (reduced || !("IntersectionObserver" in window)) { els.forEach((e) => e.classList.add("in")); return; }
  const io = new IntersectionObserver((ents) => {
    ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { threshold: 0.06 });
  els.forEach((e) => io.observe(e));
  if (!_revealBackstop) {
    _revealBackstop = true;
    setTimeout(() => {
      const s = document.createElement("style");
      s.textContent = ".reveal{opacity:1!important;transform:none!important;transition:none!important}";
      document.head.appendChild(s);
    }, 1100);
  }
}

/* ============================================================
   PAGES
   ============================================================ */
const pages = {};

/* ---- FLOOR (home) ---- */
pages.floor = function () {
  const main = $("#main");
  const fresh = GARMENTS.slice().sort((a, b) => new Date(b.added) - new Date(a.added)).slice(0, 4);
  const rackPreview = GARMENTS.slice(0, 8);
  main.innerHTML =
    '<section class="hero reveal">' +
      '<p class="kicker">Front of house / showroom floor</p>' +
      '<h1>Everything on the rack is real stock.<br>Nothing at checkout is a real charge.</h1>' +
      '<p class="hero-sub">Browse the rolling rack, open any garment for fabric, fit and colourways, and pin what you like. Your rail follows you across a reload, right up until you check out.</p>' +
      '<div class="hero-cta"><a class="btn btn-ink" href="rack.html">Walk the rack ' + I.arrowR + '</a><a class="btn btn-line" href="lookbook.html">See the lookbook</a></div>' +
    '</section>' +
    '<section class="strip reveal"><div class="strip-head"><h2>New this week</h2><a href="rack.html#new">All arrivals</a></div>' +
      '<div class="catalog four">' + fresh.map(card).join("") + '</div></section>' +
    '<section class="rack-section reveal">' +
      '<div class="strip-head"><h2>On the rack now</h2><a href="rack.html">Full rail</a></div>' +
      '<div class="rack-rod" aria-hidden="true"></div>' +
      '<div class="rack-rail" id="rack-rail">' + rackPreview.map(hangerHTML).join("") + '</div>' +
    '</section>' +
    '<section class="cat-links reveal">' + CATEGORIES.map((c) =>
      '<a class="cat-link" href="rack.html#' + c + '"><span>' + c + '</span>' + I.arrowR + '</a>').join("") + '</section>' +
    '<section class="note-teaser reveal">' +
      '<p class="kicker">From the cutting room</p>' +
      '<div class="note-grid">' + NOTES.slice(0, 3).map((n) =>
        '<a class="note-card" href="atelier.html#' + n.slug + '"><span class="nc-mins">' + n.mins + ' min</span><h3>' + esc(n.title) + '</h3><p>' + esc(n.lede) + '</p></a>').join("") +
      '</div>' +
    '</section>';
  bindCards(main);
  bindRack(main);
  armReveals(main);
};

function hangerHTML(g, idx) {
  idx = idx || 0;
  return '<div class="garment-hook" style="--sway:' + (4 + (idx % 5) * 0.4).toFixed(2) + 's;--sway-delay:' + (-(idx % 7) * 0.35).toFixed(2) + 's">' +
    '<a class="hanger-card" href="garment.html#' + g.id + '">' +
      '<span class="hanger-swatch"></span>' +
      '<span class="hanger-sil" style="--sil-color:' + g.colors[0].hex + '">' +
        '<img src="img/' + g.photo + '.jpg" alt="' + esc(g.name) + '" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' +
        '<span class="hanger-sil-fb">' + silFor(g.sil) + '</span>' +
      '</span>' +
      '<span class="hanger-body"><span class="hanger-cat">' + g.category + '</span><span class="hanger-name">' + esc(g.name) + '</span>' +
        '<span class="swing-tag sm">' + money(g.price) + '</span></span>' +
    '</a></div>';
}
function bindRack(root) {
  const rail = $("#rack-rail", root);
  if (!rail) return;
  // drag-to-scroll
  let down = false, sx = 0, sl = 0;
  rail.addEventListener("pointerdown", (e) => { down = true; sx = e.clientX; sl = rail.scrollLeft; rail.classList.add("grabbing"); });
  window.addEventListener("pointerup", () => { down = false; rail.classList.remove("grabbing"); });
  window.addEventListener("pointermove", (e) => { if (down) rail.scrollLeft = sl - (e.clientX - sx); });
}

/* ---- RACK (catalog) ---- */
pages.rack = function () {
  const main = $("#main");
  let q = "", cat = "All", sort = "newest";
  const sizeSet = new Set(), colorSet = new Set();
  let pMin = 0, pMax = 450, inStock = false;
  if (location.hash) {
    const h = decodeURIComponent(location.hash.slice(1));
    if (CATEGORIES.indexOf(h) !== -1) cat = h;
  }
  const COLORS = uniq(GARMENTS.flatMap((g) => g.colors.map((c) => c.name))).sort();

  main.innerHTML =
    '<div class="page-head reveal"><h1>The Rack</h1><p>' + GARMENTS.length + ' pieces on the rail. Filter by category, size, colour or price.</p></div>' +
    '<section class="controls reveal">' +
      '<div class="pills" id="pills"></div>' +
      '<label class="search-wrap"><span class="s-ico">' + I.search + '</span>' +
        '<input id="q" type="search" placeholder="wool, denim, tote..." autocomplete="off"></label>' +
      '<label class="sort-wrap"><span>Sort</span><select id="sort">' +
        '<option value="newest">Newest first</option><option value="price-asc">Price: low to high</option>' +
        '<option value="price-desc">Price: high to low</option><option value="name">Name A-Z</option><option value="rating">Best reviewed</option>' +
      '</select></label>' +
      '<button type="button" class="btn btn-line btn-sm" id="filters-toggle">Filters</button>' +
      '<span class="rc"><b id="rc">--</b> shown</span>' +
    '</section>' +
    '<section class="filter-panel" id="filter-panel" hidden>' +
      '<div class="fp-block"><span class="fp-label">Size</span><div class="chip-row" id="size-chips">' +
        ALL_SIZES.filter((s) => GARMENTS.some((g) => g.sizes.indexOf(s) !== -1)).map((s) => '<button type="button" class="chip" data-size="' + s + '">' + s + '</button>').join("") + '</div></div>' +
      '<div class="fp-block"><span class="fp-label">Colour</span><div class="chip-row" id="color-chips">' +
        COLORS.map((c) => '<button type="button" class="chip" data-color="' + esc(c) + '">' + esc(c) + '</button>').join("") + '</div></div>' +
      '<div class="fp-block"><span class="fp-label">Price</span><div class="price-band">' +
        stepperHTML(pMin, null) + '<span class="pb-to">to</span>' + stepperHTML(pMax, null) + '<span class="pb-out" id="pb-out"></span></div></div>' +
      '<label class="fp-check"><input type="checkbox" id="instock"> In stock only</label>' +
      '<button type="button" class="btn btn-line btn-sm" id="fp-reset">Reset</button>' +
    '</section>' +
    '<div id="catalog" class="catalog"></div>' +
    '<p id="empty" class="empty-state" hidden>Nothing on the rack matches that. Loosen a filter or clear the search.</p>' +
    '<section id="recent-rail" class="recent-rail"></section>';

  const steppers = $$("#filter-panel .tr-step");
  bindSteppers($("#filter-panel"), (d, el) => {
    if (steppers.indexOf(el) === 0) pMin = clamp(pMin + d * 10, 0, pMax);
    else pMax = clamp(pMax + d * 10, pMin, 600);
    steppers[0].querySelector("[data-v]").textContent = pMin;
    steppers[1].querySelector("[data-v]").textContent = pMax;
    draw();
  });

  function list() {
    let arr = GARMENTS.slice();
    if (cat !== "All") arr = arr.filter((g) => g.category === cat);
    if (inStock) arr = arr.filter((g) => g.stock > 0);
    arr = arr.filter((g) => g.price >= pMin && g.price <= pMax);
    if (sizeSet.size) arr = arr.filter((g) => g.sizes.some((s) => sizeSet.has(s)));
    if (colorSet.size) arr = arr.filter((g) => g.colors.some((c) => colorSet.has(c.name)));
    const qq = q.trim().toLowerCase();
    if (qq) arr = arr.filter((g) => (g.name + " " + g.category + " " + g.fabric + " " + g.desc).toLowerCase().includes(qq));
    if (sort === "price-asc") arr.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") arr.sort((a, b) => b.price - a.price);
    else if (sort === "name") arr.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "rating") arr.sort((a, b) => ((ratingFor(b.id) || {}).avg || 0) - ((ratingFor(a.id) || {}).avg || 0));
    else arr.sort((a, b) => new Date(b.added) - new Date(a.added));
    return arr;
  }
  function draw() {
    const arr = list();
    $("#rc").textContent = String(arr.length);
    $("#pb-out").textContent = money(pMin) + " - " + money(pMax);
    $("#empty").hidden = arr.length > 0;
    $("#catalog").innerHTML = arr.map(card).join("");
    bindCards($("#catalog"));
    armReveals($("#catalog"));
    drawRecent();
  }
  function drawRecent() {
    const ids = rd(K.recent, []).filter((id) => gar(id)).slice(0, 5);
    const rail = $("#recent-rail");
    if (!ids.length) { rail.innerHTML = ""; return; }
    rail.innerHTML = '<h2 class="rail-h">Recently viewed</h2><div class="rail-strip">' +
      ids.map((id) => { const g = gar(id); return '<a class="rail-item" href="garment.html#' + id + '">' +
        thumb(g, "ri") + '<span>' + esc(g.name) + '</span></a>'; }).join("") + '</div>';
  }

  // pills
  function renderPills() {
    $("#pills").innerHTML = ["All"].concat(CATEGORIES).map((c) =>
      '<button type="button" class="pill' + (c === cat ? " active" : "") + '" data-cat="' + c + '">' + c + '</button>').join("");
    $$("#pills .pill").forEach((p) => p.addEventListener("click", () => { cat = p.dataset.cat; renderPills(); draw(); }));
  }
  renderPills();
  draw();
  $("#q").addEventListener("input", (e) => { q = e.target.value; draw(); });
  enhanceSelect($("#sort")); $("#sort").addEventListener("change", (e) => { sort = e.target.value; draw(); });
  $("#filters-toggle").addEventListener("click", () => { const fp = $("#filter-panel"); fp.hidden = !fp.hidden; });
  $("#instock").addEventListener("change", (e) => { inStock = e.target.checked; draw(); });
  $$("#size-chips .chip").forEach((b) => b.addEventListener("click", () => { b.classList.toggle("on"); sizeSet.has(b.dataset.size) ? sizeSet.delete(b.dataset.size) : sizeSet.add(b.dataset.size); draw(); }));
  $$("#color-chips .chip").forEach((b) => b.addEventListener("click", () => { b.classList.toggle("on"); colorSet.has(b.dataset.color) ? colorSet.delete(b.dataset.color) : colorSet.add(b.dataset.color); draw(); }));
  $("#fp-reset").addEventListener("click", () => {
    sizeSet.clear(); colorSet.clear(); inStock = false; pMin = 0; pMax = 450;
    $("#instock").checked = false;
    $$("#filter-panel .chip").forEach((c) => c.classList.remove("on"));
    steppers[0].querySelector("[data-v]").textContent = pMin;
    steppers[1].querySelector("[data-v]").textContent = pMax;
    draw();
  });
  armReveals(main);
  pageRepaint = draw;
};

/* ---- GARMENT detail ---- */
pages.garment = function () {
  const main = $("#main");
  function render() {
    const g = gar(decodeURIComponent(location.hash.slice(1)));
    if (!g) { main.innerHTML = '<div class="pad"><p class="empty-state">That piece has left the rail. <a href="rack.html">Back to the rack</a>.</p></div>'; return; }
    pushRecent(g.id);
    let size = g.sizes[0], color = g.colors[0], qty = 1;
    const r = ratingFor(g.id), fv = fitVerdict(g.id);
    const related = g.pairs.map(gar).filter(Boolean).slice(0, 3);

    main.innerHTML =
      '<div class="crumb"><a href="rack.html">The Rack</a> / <a href="rack.html#' + g.category + '">' + g.category + '</a> / <span>' + esc(g.name) + '</span></div>' +
      '<article class="detail">' +
        '<div class="detail-visual reveal">' + garmentImage(g, { cls: "detail", colorHex: color.hex }) + '</div>' +
        '<div class="detail-info reveal">' +
          '<p class="d-cat">' + g.category + '</p>' +
          '<div class="d-titlerow"><h1>' + esc(g.name) + '</h1>' +
            '<button type="button" class="pin-btn' + (isSaved(g.id) ? " on" : "") + '" id="d-pin" aria-pressed="' + isSaved(g.id) + '">' + I.pin + '<span>' + (isSaved(g.id) ? "Pinned" : "Pin") + '</span></button></div>' +
          (r ? '<div class="d-rate">' + starRow(r.avg) + '<span>' + r.avg.toFixed(1) + " / " + r.count + " fit report" + (r.count === 1 ? "" : "s") + "</span></div>" : "") +
          '<p class="d-price">' + money(g.price) + '</p>' +
          '<p class="d-fabric">' + esc(g.fabric) + '</p>' +
          '<p class="d-desc">' + esc(g.desc) + '</p>' +
          '<div class="fit-line"><span class="fit-pill fit-' + g.fit + '">' + fitLabel[g.fit] + '</span>' +
            (fv && fv !== g.fit ? '<span class="fit-note">Buyers say it runs ' + (fv === "true" ? "true" : fv) + '</span>' : '<span class="fit-note">' + esc(g.fitNote) + '</span>') + '</div>' +
          '<div class="picker"><span class="p-label">Size</span><div class="size-row" id="size-row">' +
            g.sizes.map((s) => '<button type="button" class="size-chip' + (s === size ? " on" : "") + '" data-size="' + s + '">' + s + '</button>').join("") + '</div>' +
            '<button type="button" class="link-btn" id="size-guide-btn">Size guide</button></div>' +
          '<div class="picker"><span class="p-label">Colour <em id="color-name">' + esc(color.name) + '</em></span><div class="color-row" id="color-row">' +
            g.colors.map((c) => '<button type="button" class="color-sw' + (c.hex === color.hex ? " on" : "") + '" data-hex="' + c.hex + '" data-name="' + esc(c.name) + '" style="background:' + c.hex + '" aria-label="' + esc(c.name) + '"></button>').join("") + '</div></div>' +
          '<div class="picker qty"><span class="p-label">Quantity</span>' + stepperHTML(qty, null) + '</div>' +
          '<div class="d-buy"><button type="button" class="btn btn-ink btn-lg" id="d-add">Add to Rail</button>' +
            '<span class="d-stock' + (g.stock <= 5 ? " low" : "") + '">' + (g.stock <= 5 ? "Only " + g.stock + " left" : g.stock + " on the rail") + '</span></div>' +
          '<details class="d-care"><summary>Care</summary><ul>' + g.care.map((c) => "<li>" + esc(c) + "</li>").join("") + '</ul></details>' +
        '</div>' +
      '</article>' +
      (related.length ? '<section class="d-related"><h2>Styled with</h2><div class="catalog three">' + related.map(card).join("") + '</div></section>' : "") +
      '<section class="d-reviews"><h2>Fit reports</h2><div id="review-list"></div>' +
        '<form class="review-form" id="review-form">' +
          '<span class="p-label">Leave a fit report</span>' +
          '<div class="rf-row"><label>Handle<input type="text" id="rf-name" maxlength="24"></label>' +
          '<label>Stars<select id="rf-stars"><option value="5">5</option><option value="4">4</option><option value="3">3</option><option value="2">2</option><option value="1">1</option></select></label>' +
          '<label>Fit<select id="rf-fit"><option value="true">True to size</option><option value="small">Runs small</option><option value="large">Runs large</option></select></label></div>' +
          '<label class="rf-text">Notes<textarea id="rf-text" rows="2" maxlength="240"></textarea></label>' +
          '<button type="submit" class="btn btn-ink btn-sm">Post report</button><span class="rf-err" id="rf-err"></span>' +
        '</form></section>';

    bindGImg(main);
    bindCards($(".d-related"));
    const visual = $(".detail-visual .gimg");

    $("#d-pin").addEventListener("click", () => {
      toggleSave(g.id);
      const on = isSaved(g.id);
      $("#d-pin").classList.toggle("on", on);
      $("#d-pin span").textContent = on ? "Pinned" : "Pin";
    });
    $$("#size-row .size-chip").forEach((b) => b.addEventListener("click", () => {
      size = b.dataset.size;
      $$("#size-row .size-chip").forEach((x) => x.classList.toggle("on", x === b));
    }));
    $$("#color-row .color-sw").forEach((b) => b.addEventListener("click", () => {
      color = { name: b.dataset.name, hex: b.dataset.hex };
      $$("#color-row .color-sw").forEach((x) => x.classList.toggle("on", x === b));
      $("#color-name").textContent = color.name;
      if (visual) visual.style.setProperty("--sil-color", color.hex);
    }));
    bindSteppers($(".picker.qty"), (d) => { qty = clamp(qty + d, 1, 9); $(".picker.qty [data-v]").textContent = qty; });
    $("#d-add").addEventListener("click", (e) => { addToCart(g, size, color.name, qty); flyTag(e.target); });
    $("#size-guide-btn").addEventListener("click", () => openSizeGuide(g));

    function drawReviews() {
      $("#review-list").innerHTML = reviewsFor(g.id).map((rv) =>
        '<div class="review"><div class="review-head"><span class="rv-name">' + esc(rv.name) + '</span>' + starRow(rv.stars, "sm") +
        '<span class="rv-fit">' + (fitLabel[rv.fit] || "") + '</span></div><p>' + esc(rv.text) + '</p></div>'
      ).join("") || '<p class="muted">No fit reports yet.</p>';
    }
    drawReviews();
    enhanceSelect($("#rf-stars")); enhanceSelect($("#rf-fit"));
    $("#review-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const nm = $("#rf-name").value.trim(), tx = $("#rf-text").value.trim();
      if (nm.length < 2) { $("#rf-err").textContent = "Add a handle."; return; }
      if (tx.length < 4) { $("#rf-err").textContent = "A little more detail?"; return; }
      const all = rd(K.reviews, {});
      (all[g.id] = all[g.id] || []).push({ name: nm, stars: Number($("#rf-stars").value), fit: $("#rf-fit").value, text: tx });
      wr(K.reviews, all);
      toast("Fit report posted");
      render();
    });
    armReveals(main);
  }
  render();
  window.addEventListener("hashchange", () => location.reload());
};

function openSizeGuide(g) {
  const numeric = /^\d+$/.test(g.sizes[0]);
  const rows = numeric
    ? [["Waist (in)", g.sizes.join('"  ')], ["Inseam", "32\" standard, hem on request"]]
    : [["XS", "chest 34-36"], ["S", "chest 36-38"], ["M", "chest 39-41"], ["L", "chest 42-44"], ["XL", "chest 45-47"]];
  const wrap = document.createElement("div");
  wrap.className = "modal-overlay";
  wrap.innerHTML = '<div class="modal" role="dialog" aria-modal="true" aria-label="Size guide">' +
    '<button class="modal-x" aria-label="Close">' + I.x + '</button>' +
    '<h2>Size guide / ' + esc(g.name) + '</h2>' +
    '<p class="muted">Measurements in inches, garment laid flat then doubled. ' + esc(g.fitNote) + '</p>' +
    '<table class="size-table">' + rows.map((r) => "<tr><td>" + esc(r[0]) + "</td><td>" + esc(r[1]) + "</td></tr>").join("") + "</table>" +
  '</div>';
  document.body.appendChild(wrap);
  const close = () => wrap.remove();
  wrap.addEventListener("click", (e) => { if (e.target === wrap || e.target.closest(".modal-x")) close(); });
  document.addEventListener("keydown", function esc2(e) { if (e.key === "Escape") { close(); document.removeEventListener("keydown", esc2); } });
}

/* ---- LOOKBOOK ---- */
pages.lookbook = function () {
  const main = $("#main");
  let filter = "All";
  main.innerHTML =
    '<div class="page-head reveal"><h1>Lookbook</h1><p>The rail, shot on the showroom floor. Tap any frame to open it full-size.</p></div>' +
    '<div class="lb-filter reveal">' + ["All"].concat(CATEGORIES).map((c) =>
      '<button type="button" class="pill' + (c === "All" ? " active" : "") + '" data-lb="' + c + '">' + c + '</button>').join("") + '</div>' +
    '<div class="lookgrid" id="lookgrid"></div>';
  function draw() {
    const arr = filter === "All" ? GARMENTS : GARMENTS.filter((g) => g.category === filter);
    $("#lookgrid").innerHTML = arr.map((g, i) =>
      '<button type="button" class="lb-frame reveal' + (i % 5 === 0 ? " tall" : "") + '" data-look="' + g.id + '">' +
        '<img src="img/' + g.photo + '.jpg" alt="' + esc(g.name) + '" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' +
        '<span class="lb-fb" style="color:' + g.colors[0].hex + '">' + silFor(g.sil) + '</span>' +
        '<span class="lb-cap"><span>' + esc(g.name) + '</span><span>' + money(g.price) + '</span></span>' +
      '</button>').join("");
    $$("#lookgrid .lb-frame").forEach((f) => f.addEventListener("click", () => openLightbox(f.dataset.look)));
    armReveals($("#lookgrid"));
  }
  $$("#main .lb-filter .pill").forEach((p) => p.addEventListener("click", () => {
    filter = p.dataset.lb;
    $$("#main .lb-filter .pill").forEach((x) => x.classList.toggle("active", x === p));
    draw();
  }));
  draw();
  armReveals(main);
};
function openLightbox(id) {
  const g = gar(id); if (!g) return;
  const wrap = document.createElement("div");
  wrap.className = "lightbox";
  wrap.innerHTML = '<button class="lb-x" aria-label="Close">' + I.x + '</button>' +
    '<button class="lb-prev" aria-label="Previous">' + I.chevL + '</button>' +
    '<figure class="lb-fig"><img src="img/' + g.photo + '.jpg" alt="' + esc(g.name) + '" onerror="this.style.display=\'none\'">' +
      '<figcaption><strong>' + esc(g.name) + '</strong> / ' + esc(g.fabric) + ' / ' + money(g.price) +
      ' <a href="garment.html#' + g.id + '">Open on the rack</a></figcaption></figure>' +
    '<button class="lb-next" aria-label="Next">' + I.chevR + '</button>';
  document.body.appendChild(wrap);
  document.body.style.overflow = "hidden";
  let idx = GARMENTS.findIndex((x) => x.id === id);
  function show(n) {
    idx = (n + GARMENTS.length) % GARMENTS.length;
    const gg = GARMENTS[idx];
    wrap.querySelector("img").src = "img/" + gg.photo + ".jpg";
    wrap.querySelector("img").style.display = "";
    wrap.querySelector("figcaption").innerHTML = '<strong>' + esc(gg.name) + '</strong> / ' + esc(gg.fabric) + ' / ' + money(gg.price) +
      ' <a href="garment.html#' + gg.id + '">Open on the rack</a>';
  }
  const close = () => { wrap.remove(); document.body.style.overflow = ""; document.removeEventListener("keydown", key); };
  function key(e) { if (e.key === "Escape") close(); if (e.key === "ArrowLeft") show(idx - 1); if (e.key === "ArrowRight") show(idx + 1); }
  wrap.addEventListener("click", (e) => {
    if (e.target === wrap || e.target.closest(".lb-x")) return close();
    if (e.target.closest(".lb-prev")) show(idx - 1);
    if (e.target.closest(".lb-next")) show(idx + 1);
  });
  document.addEventListener("keydown", key);
}

/* ---- ATELIER (cutting-room notes) ---- */
pages.atelier = function () {
  const main = $("#main");
  function render() {
    const slug = decodeURIComponent(location.hash.slice(1));
    const note = NOTES.find((n) => n.slug === slug);
    if (note) {
      main.innerHTML =
        '<div class="crumb"><a href="atelier.html">Cutting Room</a> / <span>' + esc(note.title) + '</span></div>' +
        '<article class="longform reveal">' +
          '<p class="kicker">' + note.mins + ' min read</p><h1>' + esc(note.title) + '</h1>' +
          '<p class="lf-lede">' + esc(note.lede) + '</p>' +
          note.body.map((b) => '<h2>' + esc(b.h) + '</h2><p>' + esc(b.p) + '</p>').join("") +
          (note.related && note.related.length ? '<h2>On the rail</h2><div class="catalog three">' + note.related.map((id) => card(gar(id))).filter(Boolean).join("") + '</div>' : "") +
        '</article>';
      bindCards(main);
    } else {
      main.innerHTML =
        '<div class="page-head reveal"><h1>From the Cutting Room</h1><p>Short notes on fabric, fit and keeping clothes alive. Written by the people who cut the patterns.</p></div>' +
        '<div class="note-grid big">' + NOTES.map((n) =>
          '<a class="note-card reveal" href="atelier.html#' + n.slug + '"><span class="nc-mins">' + n.mins + ' min</span><h2>' + esc(n.title) + '</h2><p>' + esc(n.lede) + '</p><span class="nc-go">Read ' + I.arrowR + '</span></a>').join("") + '</div>';
    }
    armReveals(main);
  }
  render();
  window.addEventListener("hashchange", () => location.reload());
};

/* ---- FITTING ROOM (saved + look builder + fit finder) ---- */
pages.fitting = function () {
  const main = $("#main");
  function draw() {
    const pinned = saved.map(gar).filter(Boolean);
    main.innerHTML =
      '<div class="page-head reveal"><h1>The Fitting Room</h1><p>Everything you have pinned, plus a bench for building a look and a quick fit finder.</p></div>' +
      '<section class="fr-pinned reveal"><h2>Pinned pieces</h2>' +
        (pinned.length
          ? '<div class="catalog">' + pinned.map(card).join("") + '</div>' +
            '<button type="button" class="btn btn-line btn-sm" id="pin-clear">Clear the board</button>'
          : '<p class="empty-state">Nothing pinned yet. Use the pin on any garment to hold it here.</p>') +
      '</section>' +
      '<section class="look-builder reveal"><h2>Build a look</h2>' +
        '<p class="muted">One piece per slot. The bench totals the price and adds the whole look to your rail.</p>' +
        '<div class="look-grid" id="look-grid"></div>' +
        '<div class="look-console" id="look-console"></div>' +
        '<div class="look-saved" id="look-saved"></div>' +
      '</section>' +
      '<section class="fit-finder reveal"><h2>Fit finder</h2>' +
        '<p class="muted">Tell us the size you usually take. We will nudge each piece up or down based on how it is cut and what buyers report.</p>' +
        '<label class="ff-field"><span>Your usual size</span><select id="ff-size">' +
          '<option value="">Pick one</option>' + ["XS", "S", "M", "L", "XL"].map((s) => '<option value="' + s + '">' + s + '</option>').join("") + '</select></label>' +
        '<div id="ff-out" class="ff-out"></div>' +
      '</section>';

    // pinned
    bindCards($(".fr-pinned"));
    const pc = $("#pin-clear");
    if (pc) pc.addEventListener("click", () => { saved = []; saveSaved(); draw(); });

    // look builder
    const slots = { Outerwear: "", Tops: "", Bottoms: "", Accessories: "" };
    if (location.hash.startsWith("#look=")) {
      decodeURIComponent(location.hash.slice(6)).split(".").forEach((id) => { const g = gar(id); if (g) slots[g.category] = id; });
    }
    $("#look-grid").innerHTML = CATEGORIES.map((c) =>
      '<div class="look-slot"><span class="ls-label">' + c + '</span>' +
        '<select data-slot="' + c + '"><option value="">- empty -</option>' +
        GARMENTS.filter((g) => g.category === c).map((g) => '<option value="' + g.id + '">' + esc(g.name) + ' (' + money(g.price) + ')</option>').join("") + '</select>' +
        '<div class="ls-preview" data-lp="' + c + '"></div></div>').join("");
    $$("[data-slot]").forEach((sel) => {
      sel.value = slots[sel.dataset.slot];
      enhanceSelect(sel);
      sel.addEventListener("change", () => { slots[sel.dataset.slot] = sel.value; paintLook(); });
    });
    function paintLook() {
      CATEGORIES.forEach((c) => {
        const g = gar(slots[c]); const el = $('[data-lp="' + c + '"]');
        el.innerHTML = g
          ? thumb(g, "lp") + '<span>' + esc(g.name) + '</span>'
          : '<span class="lp-empty">- empty -</span>';
        el.classList.toggle("filled", !!g);
      });
      const picked = CATEGORIES.map((c) => gar(slots[c])).filter(Boolean);
      const total = picked.reduce((s, g) => s + g.price, 0);
      $("#look-console").innerHTML =
        '<div class="lc-readout"><div><span>Pieces</span><b>' + picked.length + " / 4</b></div>" +
        '<div><span>Total</span><b>' + money(total) + '</b></div></div>' +
        (picked.length
          ? '<div class="lc-actions">' +
            '<form class="look-save-form" id="look-save-form"><input type="text" id="look-name" placeholder="name this look..." maxlength="28"><button type="submit" class="btn btn-line btn-sm">Save look</button></form>' +
            '<button type="button" class="btn btn-ink btn-sm" id="look-to-rail">Add look to rail</button></div>'
          : '<p class="muted">Fill at least one slot.</p>');
      const f = $("#look-save-form");
      if (f) f.addEventListener("submit", (e) => {
        e.preventDefault();
        const nm = $("#look-name").value.trim();
        if (nm.length < 2) { toast("Name the look first"); return; }
        const all = rd(K.looks, []);
        all.unshift({ name: nm, ids: picked.map((g) => g.id), at: Date.now() });
        wr(K.looks, all.slice(0, 20));
        $("#look-name").value = "";
        toast("Look saved");
        paintSavedLooks();
      });
      const tr = $("#look-to-rail");
      if (tr) tr.addEventListener("click", (e) => { picked.forEach((g) => addToCart(g, g.sizes[Math.min(1, g.sizes.length - 1)], g.colors[0].name, 1)); flyTag(e.target); });
    }
    function paintSavedLooks() {
      const all = rd(K.looks, []);
      const host = $("#look-saved");
      if (!all.length) { host.innerHTML = ""; return; }
      host.innerHTML = '<h3>Saved looks</h3><div class="look-list">' + all.map((lk, i) =>
        '<div class="look-row"><div><strong>' + esc(lk.name) + '</strong><p>' + lk.ids.map((id) => esc((gar(id) || {}).name || id)).join(" + ") + '</p>' +
        '<span class="lk-total">' + money(lk.ids.reduce((s, id) => s + ((gar(id) || {}).price || 0), 0)) + '</span></div>' +
        '<div class="look-row-act"><button type="button" class="btn btn-line btn-sm" data-load="' + i + '">Load</button>' +
        '<button type="button" class="icon-btn" data-del="' + i + '" aria-label="Delete">' + I.trash + '</button></div></div>').join("") + '</div>';
      $$("[data-load]", host).forEach((b) => b.addEventListener("click", () => {
        const lk = all[+b.dataset.load];
        CATEGORIES.forEach((c) => { slots[c] = ""; });
        lk.ids.forEach((id) => { const g = gar(id); if (g) slots[g.category] = id; });
        $$("[data-slot]").forEach((sel) => { sel.value = slots[sel.dataset.slot]; sel.dispatchEvent(new Event("change", { bubbles: true })); });
        window.scrollTo({ top: 0, behavior: "smooth" });
      }));
      $$("[data-del]", host).forEach((b) => b.addEventListener("click", () => { all.splice(+b.dataset.del, 1); wr(K.looks, all); paintSavedLooks(); }));
    }
    paintLook(); paintSavedLooks();

    // fit finder
    enhanceSelect($("#ff-size"));
    $("#ff-size").addEventListener("change", (e) => {
      const base = e.target.value;
      if (!base) { $("#ff-out").innerHTML = ""; return; }
      const order = ["XS", "S", "M", "L", "XL"];
      const bi = order.indexOf(base);
      $("#ff-out").innerHTML = GARMENTS.filter((g) => g.sizes.some((s) => order.indexOf(s) !== -1)).map((g) => {
        let rec = bi;
        if (g.fit === "small") rec = Math.min(order.length - 1, bi + 1);
        if (g.fit === "large") rec = Math.max(0, bi - 1);
        const recSize = order[rec];
        const has = g.sizes.indexOf(recSize) !== -1 ? recSize : g.sizes[Math.min(g.sizes.length - 1, Math.max(0, rec))];
        return '<a class="ff-row" href="garment.html#' + g.id + '"><span>' + esc(g.name) + '</span>' +
          '<span class="ff-rec">' + esc(has) + (rec !== bi ? ' <em>(' + (rec > bi ? "sized up" : "sized down") + ')</em>' : "") + '</span></a>';
      }).join("");
    });
    armReveals(main);
  }
  draw();
  pageRepaint = draw;
};

/* ---- RAIL (cart) ---- */
pages.rail = function () {
  const main = $("#main");
  function draw() {
    main.innerHTML =
      '<div class="page-head reveal"><h1>Your Rail</h1><p>Everything you have tagged. Adjust quantities, then take it to the fitting room.</p></div>' +
      (cart.length
        ? '<div class="rail-lines">' + cart.map((l) => {
            const g = gar(l.id); const key = lineKey(l);
            return '<div class="rail-line">' +
              '<a class="rl-thumb" href="garment.html#' + g.id + '">' + thumb(g, "rl") + '</a>' +
              '<div class="rl-main"><div class="rl-top"><strong>' + esc(g.name) + '</strong><span>' + money(g.price * l.qty) + '</span></div>' +
              '<p class="rl-meta">' + esc(l.size) + ' / ' + esc(l.color) + ' / ' + money(g.price) + ' each</p>' +
              '<div class="rl-ctl">' + stepperHTML(l.qty, key) + '<button type="button" class="link-btn" data-rm="' + key + '">Remove</button></div></div>' +
            '</div>';
          }).join("") + '</div>' +
          '<div class="rail-foot"><div class="rail-sub"><span>Subtotal</span><span>' + money(cartTotal()) + '</span></div>' +
          '<p class="muted">Shipping and anything else is settled at the fitting room. Nothing is charged.</p>' +
          '<a class="btn btn-ink btn-lg btn-block" href="checkout.html">Proceed to the fitting room ' + I.arrowR + '</a></div>'
        : '<div class="rail-empty"><span>' + I.hanger + '</span><p>Your rail is empty.</p><a class="btn btn-ink" href="rack.html">Walk the rack</a></div>');
    bindSteppers(main, () => draw());
    $$("[data-rm]", main).forEach((b) => b.addEventListener("click", () => { removeLine(b.dataset.rm); draw(); }));
    armReveals(main);
  }
  draw();
  pageRepaint = draw;
};

/* ---- CHECKOUT ---- */
pages.checkout = function () {
  const main = $("#main");
  let step = cart.length ? "review" : "empty";
  const ship = {};

  function frame(inner) {
    return '<div class="page-head reveal"><h1>The Fitting Room</h1></div>' +
      '<ol class="steps"><li' + (step === "review" ? ' class="on"' : (step === "details" || step === "confirm" ? ' class="done"' : "")) + '>Review</li>' +
      '<li' + (step === "details" ? ' class="on"' : (step === "confirm" ? ' class="done"' : "")) + '>Details</li>' +
      '<li' + (step === "confirm" ? ' class="on"' : "") + '>Confirmation</li></ol>' +
      '<div class="checkout-body">' + inner + '</div>' + orderHistoryHTML();
  }
  function draw() {
    if (step === "empty") {
      main.innerHTML = frame('<div class="rail-empty"><span>' + I.hanger + '</span><p>Nothing on your rail to check out.</p><a class="btn btn-ink" href="rack.html">Walk the rack</a></div>');
      bindHistory(main); armReveals(main); return;
    }
    if (step === "review") {
      main.innerHTML = frame(
        '<h2>Review your rail</h2><div class="review-lines">' + cart.map((l) => {
          const g = gar(l.id);
          return '<div class="rv-line"><div><strong>' + esc(g.name) + '</strong><span>' + esc(l.size) + ' / ' + esc(l.color) + ' / qty ' + l.qty + '</span></div><span>' + money(g.price * l.qty) + '</span></div>';
        }).join("") + '</div>' +
        '<div class="rail-sub"><span>Subtotal</span><span>' + money(cartTotal()) + '</span></div>' +
        '<button type="button" class="btn btn-ink btn-block" id="to-details">Continue to details</button>');
      $("#to-details").addEventListener("click", () => { step = "details"; draw(); });
    } else if (step === "details") {
      main.innerHTML = frame(
        '<h2>Where is it going?</h2><form class="ship-form" id="ship-form" novalidate>' +
          fld("name", "Full name") + fld("address", "Address") +
          '<div class="fld-row">' + fld("city", "City") + fld("zip", "Postal code") + '</div>' +
          fld("country", "Country") +
          '<p class="form-note">Front-end demo. No payment is collected and nothing is transmitted anywhere.</p>' +
          '<div class="form-actions"><button type="button" class="btn btn-line" id="back-review">Back</button>' +
          '<button type="submit" class="btn btn-ink">Place order</button></div>' +
        '</form>');
      $("#back-review").addEventListener("click", () => { step = "review"; draw(); });
      $("#ship-form").addEventListener("input", (e) => e.target.classList.remove("invalid"));
      $("#ship-form").addEventListener("submit", (e) => {
        e.preventDefault();
        let ok = true;
        ["name", "address", "city", "zip", "country"].forEach((k) => {
          const el = $("#f-" + k), v = el.value.trim();
          if (!v) { el.classList.add("invalid"); ok = false; } else ship[k] = v;
        });
        if (!ok) { toast("A few fields still need filling"); return; }
        placeOrder();
      });
    } else if (step === "confirm") {
      main.innerHTML = frame(
        '<div class="confirm-card"><p class="cc-label">Order confirmed</p><h2 id="order-no">' + ship._order + '</h2>' +
        '<p>' + esc(ship._summary) + '</p></div>' +
        '<a class="btn btn-ink btn-block" href="rack.html">Back to the rack</a>');
    }
    bindHistory(main); armReveals(main);
  }
  function fld(k, label) {
    return '<label class="field"><span>' + label + '</span><input id="f-' + k + '" type="text" autocomplete="off"></label>';
  }
  function placeOrder() {
    const now = new Date();
    const id = "TR-" + String(now.getFullYear()).slice(2) + String(now.getMonth() + 1).padStart(2, "0") + String(now.getDate()).padStart(2, "0") + "-" + Math.floor(1000 + Math.random() * 9000);
    const items = cart.map((l) => ({ id: l.id, name: gar(l.id).name, size: l.size, color: l.color, qty: l.qty, price: gar(l.id).price }));
    const total = cartTotal(), count = cartQty();
    const orders = rd(K.orders, []);
    orders.unshift({ id: id, at: Date.now(), items: items, total: total, ship: Object.assign({}, ship) });
    wr(K.orders, orders.slice(0, 20));
    ship._order = id;
    ship._summary = "Thank you, " + ship.name + ". " + count + " piece" + (count === 1 ? "" : "s") + " from the rail (" + money(total) +
      ") will be pressed, wrapped in tissue and marked for the address on file. This is a front-end demo: no payment was charged and no data left your browser.";
    cart = []; wr(K.cart, cart); paintCounts();
    step = "confirm"; draw();
  }
  function orderHistoryHTML() {
    const orders = rd(K.orders, []);
    if (!orders.length) return "";
    return '<section class="order-history"><h2>Order history</h2>' +
      orders.map((o) =>
        '<details class="oh-item"><summary><span>' + o.id + '</span><span>' + new Date(o.at).toLocaleDateString() + '</span><span>' + money(o.total) + '</span></summary>' +
        '<div class="oh-body">' + o.items.map((it) => '<div class="oh-line"><span>' + it.qty + ' x ' + esc(it.name) + ' (' + esc(it.size) + " / " + esc(it.color) + ')</span><span>' + money(it.price * it.qty) + '</span></div>').join("") +
        '<button type="button" class="btn btn-line btn-sm" data-reorder="' + o.id + '">' + I.repeat + ' Re-order</button></div></details>').join("") + '</section>';
  }
  function bindHistory(root) {
    $$("[data-reorder]", root).forEach((b) => b.addEventListener("click", () => {
      const o = rd(K.orders, []).find((x) => x.id === b.dataset.reorder);
      if (o) { o.items.forEach((it) => addToCart(gar(it.id), it.size, it.color, it.qty)); step = "review"; draw(); }
    }));
  }
  draw();
  pageRepaint = () => { if (step === "review" || step === "empty") { step = cart.length ? "review" : "empty"; draw(); } };
};

/* ============================================================
   INIT
   ============================================================ */
function start() {
  renderChrome();
  paintCounts();
  if (pages[PAGE]) pages[PAGE]();
  armReveals(document);
}
start();

})();
