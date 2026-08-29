"use strict";

/* ============================================================
   THE ORDER WINDOW - app.js  (shared across all pages)
   Vanilla JS. Multipage: each page sets <body data-page="...">.
   No frameworks, no network calls. Photos in img/, SVG fallbacks.
   ============================================================ */

(function () {

/* ---------------- tiny SVG icon set (no text arrows anywhere) ---------------- */
const SVG = {
  arrowR: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6"/></svg>',
  arrowL: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H6M11 6l-6 6 6 6"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 13l4 4L19 7"/></svg>',
  star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.6 1-5.8L3.5 9.7l5.9-.9z"/></svg>',
  flame: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c1 3-1.5 4.5-1.5 7A2.5 2.5 0 0012 11c1.5 0 2-1.2 1.8-2.3C16 10 18 12.4 18 15a6 6 0 11-12 0c0-3.6 3-5.3 3.5-8C10 5 11 3.5 12 2z"/></svg>',
  bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 8h12l-1 12H7z"/><path d="M9 8V6a3 3 0 016 0v2"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2M6 7l1 13h10l1-13"/></svg>',
  repeat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9a6 6 0 016-6h7M20 5l-3-2 3-2M20 15a6 6 0 01-6 6H7M4 19l3 2-3 2" transform="translate(0 -1)"/></svg>'
};
function icon(name) { return '<span class="i">' + (SVG[name] || "") + "</span>"; }

/* ---------------- hand-drawn fallback food icons ---------------- */
const ICONS = {
  burger: () => `<svg viewBox="0 0 100 100"><ellipse cx="50" cy="34" rx="34" ry="16" fill="#e8b04b" stroke="#2a2420" stroke-width="2"/><path d="M17 34 a33 14 0 0 0 66 0 z" fill="#e8b04b" stroke="#2a2420" stroke-width="2"/><circle cx="34" cy="26" r="1.6" fill="#fff8e0"/><circle cx="46" cy="22" r="1.6" fill="#fff8e0"/><circle cx="58" cy="25" r="1.6" fill="#fff8e0"/><path d="M18 44 q32 10 64 0 v6 q-32 10 -64 0 z" fill="#5a9e46" stroke="#2a2420" stroke-width="2"/><rect x="17" y="50" width="66" height="12" rx="3" fill="#7a4a26" stroke="#2a2420" stroke-width="2"/><rect x="20" y="62" width="60" height="7" fill="#d1362f" stroke="#2a2420" stroke-width="1.5"/><path d="M15 69 a35 12 0 0 0 70 0 z" fill="#f2c879" stroke="#2a2420" stroke-width="2"/></svg>`,
  fries: () => `<svg viewBox="0 0 100 100"><path d="M28 96 L22 42 H78 L72 96 Z" fill="#d1362f" stroke="#2a2420" stroke-width="2"/><path d="M22 42 H78 L74 32 H26 Z" fill="#e8503f" stroke="#2a2420" stroke-width="2"/><g fill="#f4c95d" stroke="#a9791f" stroke-width="1.5"><rect x="30" y="10" width="7" height="38" rx="2"/><rect x="40" y="4" width="7" height="44" rx="2"/><rect x="50" y="10" width="7" height="38" rx="2"/><rect x="60" y="6" width="7" height="42" rx="2"/><rect x="70" y="14" width="7" height="34" rx="2"/></g></svg>`,
  shake: () => `<svg viewBox="0 0 100 100"><path d="M34 30 H66 L60 92 H40 Z" fill="#f6e2c4" stroke="#2a2420" stroke-width="2"/><ellipse cx="50" cy="30" rx="16" ry="6" fill="#fff3de" stroke="#2a2420" stroke-width="2"/><ellipse cx="50" cy="18" rx="12" ry="9" fill="#ffd8ea" stroke="#2a2420" stroke-width="2"/><rect x="47" y="2" width="6" height="20" rx="3" fill="#e5426b" stroke="#2a2420" stroke-width="1.5" transform="rotate(18 50 12)"/></svg>`,
  soup: () => `<svg viewBox="0 0 100 100"><path d="M14 52 h72 l-6 24 a10 10 0 0 1 -10 8 H40 a10 10 0 0 1 -10 -8 Z" fill="#e07b3a" stroke="#2a2420" stroke-width="2"/><ellipse cx="50" cy="52" rx="36" ry="9" fill="#f4a35b" stroke="#2a2420" stroke-width="2"/><path d="M8 50 q6 -8 0 -16" fill="none" stroke="#2a2420" stroke-width="3" stroke-linecap="round"/><path d="M92 50 q-6 -8 0 -16" fill="none" stroke="#2a2420" stroke-width="3" stroke-linecap="round"/></svg>`,
  salad: () => `<svg viewBox="0 0 100 100"><ellipse cx="50" cy="66" rx="38" ry="16" fill="#e7ddc4" stroke="#2a2420" stroke-width="2"/><path d="M14 62 a36 14 0 0 0 72 0 Z" fill="#f2ead2" stroke="#2a2420" stroke-width="2"/><circle cx="34" cy="50" r="9" fill="#6ea850" stroke="#2a2420" stroke-width="1.5"/><circle cx="52" cy="44" r="10" fill="#84c05f" stroke="#2a2420" stroke-width="1.5"/><circle cx="68" cy="52" r="8" fill="#5a9e46" stroke="#2a2420" stroke-width="1.5"/><circle cx="45" cy="56" r="4.5" fill="#d1362f" stroke="#2a2420" stroke-width="1.2"/></svg>`,
  wings: () => `<svg viewBox="0 0 100 100"><g stroke="#2a2420" stroke-width="2"><path d="M30 70 q-14 -4 -14 -22 q0 -14 12 -16 q6 10 6 24 z" fill="#c9762f"/><rect x="26" y="66" width="8" height="20" rx="4" fill="#efe0c0"/><path d="M70 70 q14 -4 14 -22 q0 -14 -12 -16 q-6 10 -6 24 z" fill="#c9762f"/><rect x="66" y="66" width="8" height="20" rx="4" fill="#efe0c0"/><path d="M50 34 q-18 -6 -18 -26 q10 -6 18 4 q8 -10 18 -4 q0 20 -18 26 z" fill="#d98a3d"/></g></svg>`,
  hotdog: () => `<svg viewBox="0 0 100 100"><path d="M8 46 q0 -18 18 -18 h48 q18 0 18 18 t-18 18 H26 q-18 0 -18 -18 z" fill="#f2c879" stroke="#2a2420" stroke-width="2"/><rect x="14" y="40" width="72" height="14" rx="7" fill="#b5432c" stroke="#2a2420" stroke-width="2"/><path d="M20 40 q40 14 60 0" fill="none" stroke="#f4d94a" stroke-width="2.5"/><path d="M20 54 q40 -14 60 0" fill="none" stroke="#d1362f" stroke-width="2.5"/></svg>`,
  pancake: () => `<svg viewBox="0 0 100 100"><ellipse cx="50" cy="78" rx="34" ry="9" fill="#dba24f" stroke="#2a2420" stroke-width="2"/><ellipse cx="50" cy="64" rx="30" ry="8" fill="#e8b562" stroke="#2a2420" stroke-width="2"/><ellipse cx="50" cy="50" rx="26" ry="7" fill="#f2c879" stroke="#2a2420" stroke-width="2"/><rect x="42" y="30" width="16" height="12" rx="3" fill="#fff3c2" stroke="#2a2420" stroke-width="1.5"/></svg>`,
  coffee: () => `<svg viewBox="0 0 100 100"><path d="M22 34 h44 l-5 44 a8 8 0 0 1 -8 7 H35 a8 8 0 0 1 -8 -7 Z" fill="#f4ede0" stroke="#2a2420" stroke-width="2"/><path d="M66 40 q16 -2 16 12 t-16 12" fill="none" stroke="#2a2420" stroke-width="3"/><ellipse cx="44" cy="34" rx="22" ry="5" fill="#6b4226" stroke="#2a2420" stroke-width="2"/></svg>`,
  cola: () => `<svg viewBox="0 0 100 100"><path d="M32 20 h36 l-6 68 a6 6 0 0 1 -6 6 H44 a6 6 0 0 1 -6 -6 Z" fill="#7a4326" stroke="#2a2420" stroke-width="2"/><path d="M30 34 h40" stroke="#2a2420" stroke-width="1.5"/><rect x="28" y="10" width="44" height="12" rx="3" fill="#e5e9ea" stroke="#2a2420" stroke-width="2"/><rect x="46" y="0" width="8" height="12" fill="#e5e9ea" stroke="#2a2420" stroke-width="1.5"/></svg>`,
  pie: () => `<svg viewBox="0 0 100 100"><path d="M50 14 L88 82 H12 Z" fill="#e8b04b" stroke="#2a2420" stroke-width="2"/><path d="M50 14 L88 82 H12 Z" fill="none" stroke="#c9852b" stroke-width="1.5" stroke-dasharray="4 4"/><ellipse cx="50" cy="84" rx="40" ry="7" fill="#d1362f" stroke="#2a2420" stroke-width="2"/></svg>`,
  sundae: () => `<svg viewBox="0 0 100 100"><path d="M30 46 h40 l-10 40 a10 10 0 0 1 -20 0 Z" fill="#fdf6ea" stroke="#2a2420" stroke-width="2"/><ellipse cx="50" cy="46" rx="24" ry="9" fill="#f6a6c1" stroke="#2a2420" stroke-width="2"/><ellipse cx="50" cy="34" rx="18" ry="8" fill="#fff2f6" stroke="#2a2420" stroke-width="2"/><circle cx="50" cy="20" r="9" fill="#d1362f" stroke="#2a2420" stroke-width="2"/></svg>`,
  onionrings: () => `<svg viewBox="0 0 100 100"><g fill="none" stroke="#2a2420" stroke-width="2"><ellipse cx="50" cy="30" rx="26" ry="10" fill="#f2c879"/><ellipse cx="50" cy="30" rx="12" ry="4.5" fill="#fdf6ea"/><ellipse cx="34" cy="52" rx="26" ry="10" fill="#e8b562"/><ellipse cx="34" cy="52" rx="12" ry="4.5" fill="#fdf6ea"/><ellipse cx="66" cy="66" rx="26" ry="10" fill="#f2c879"/><ellipse cx="66" cy="66" rx="12" ry="4.5" fill="#fdf6ea"/></g></svg>`,
  chili: () => `<svg viewBox="0 0 100 100"><path d="M14 50 h72 l-6 26 a10 10 0 0 1 -10 8 H40 a10 10 0 0 1 -10 -8 Z" fill="#a8271f" stroke="#2a2420" stroke-width="2"/><ellipse cx="50" cy="50" rx="36" ry="9" fill="#d1362f" stroke="#2a2420" stroke-width="2"/><circle cx="40" cy="48" r="3.5" fill="#f2c879"/><circle cx="58" cy="46" r="3.5" fill="#f2c879"/></svg>`,
  milkbottle: () => `<svg viewBox="0 0 100 100"><path d="M40 14 h20 v14 l10 14 v46 a6 6 0 0 1 -6 6 H36 a6 6 0 0 1 -6 -6 V42 l10 -14 Z" fill="#f4ede0" stroke="#2a2420" stroke-width="2"/><rect x="38" y="10" width="24" height="8" rx="2" fill="#dfe3e6" stroke="#2a2420" stroke-width="2"/><rect x="30" y="58" width="40" height="20" fill="#33a0d8" opacity="0.85"/></svg>`
};

/* ---------------- menu data ---------------- */
const MENU = [
  { id: "griddle-melt", name: "Griddle Melt Burger", category: "Mains", icon: "burger",
    desc: "Char-seared patty, American cheese, griddled onions, house sauce on a toasted bun.",
    price: 9.5, heat: 0, tags: ["Contains dairy"],
    options: [
      { name: "Size", type: "radio", required: true, choices: [{ label: "Single", delta: 0 }, { label: "Double", delta: 3 }] },
      { name: "Add-ons", type: "checkbox", choices: [{ label: "Extra Cheese", delta: 1 }, { label: "Bacon", delta: 1.5 }, { label: "Fried Egg", delta: 1.25 }] }
    ] },
  { id: "chili-dog", name: "All-Night Chili Dog", category: "Mains", icon: "hotdog",
    desc: "Snap-casing dog smothered in slow-simmered chili and yellow mustard.",
    price: 7.25, heat: 2, tags: ["Spicy"],
    options: [{ name: "Spice Level", type: "radio", required: true, choices: [{ label: "Mild", delta: 0 }, { label: "Medium", delta: 0 }, { label: "Hot", delta: 0 }] }] },
  { id: "graveyard-wings", name: "Graveyard Shift Wings", category: "Starters", icon: "wings",
    desc: "Six bone-in wings tossed in your choice of heat, served basket-style.",
    price: 8.75, heat: 3, tags: ["Spicy", "Gluten free"],
    options: [{ name: "Spice Level", type: "radio", required: true, choices: [{ label: "Mild", delta: 0 }, { label: "Medium", delta: 0 }, { label: "Hot", delta: 0 }, { label: "Ghost Pepper", delta: 1 }] }] },
  { id: "counter-fries", name: "Counter-Cut Fries", category: "Sides", icon: "fries",
    desc: "Hand-cut, double-fried, salted at the pass. Basket portion.",
    price: 4.25, heat: 0, tags: ["Vegetarian", "Gluten free"],
    options: [
      { name: "Size", type: "radio", required: true, choices: [{ label: "Regular", delta: 0 }, { label: "Large", delta: 1.5 }] },
      { name: "Add-ons", type: "checkbox", choices: [{ label: "Cheese Sauce", delta: 1 }, { label: "Gravy", delta: 1 }] }
    ] },
  { id: "onion-rings", name: "Stacked Onion Rings", category: "Sides", icon: "onionrings",
    desc: "Thick-cut rings, beer-battered, fried gold and stacked tall.",
    price: 5.0, heat: 0, tags: ["Vegetarian"] },
  { id: "night-owl-chili", name: "Night Owl Chili Bowl", category: "Starters", icon: "chili",
    desc: "Beef and bean chili, simmered since open, topped with onion and cheddar.",
    price: 6.5, heat: 2, tags: ["Spicy", "Gluten free", "Contains dairy"] },
  { id: "cobb-under-lights", name: "Cobb Under the Lights", category: "Starters", icon: "salad",
    desc: "Chopped greens, tomato, egg, bacon bits, and house ranch.",
    price: 7.75, heat: 0, tags: ["Gluten free"],
    options: [{ name: "Dressing", type: "radio", required: true, choices: [{ label: "Ranch", delta: 0 }, { label: "Blue Cheese", delta: 0 }, { label: "Vinaigrette", delta: 0 }] }] },
  { id: "grill-soup", name: "Soup of the Late Shift", category: "Starters", icon: "soup",
    desc: "Whatever's been simmering on the back burner tonight - ask, or just trust us.",
    price: 5.5, heat: 0, tags: ["Vegetarian"] },
  { id: "flapjack-stack", name: "Flapjack Stack", category: "Mains", icon: "pancake",
    desc: "Three buttermilk pancakes, butter pat, warm syrup on the side.",
    price: 6.75, heat: 0, tags: ["Vegetarian"],
    options: [{ name: "Add-ons", type: "checkbox", choices: [{ label: "Blueberries", delta: 1 }, { label: "Whipped Cream", delta: 0.75 }, { label: "Extra Syrup", delta: 0.5 }] }] },
  { id: "counter-cola", name: "Fountain Cola", category: "Drinks", icon: "cola",
    desc: "Classic fountain pour over crushed ice, bottomless refills at the counter.",
    price: 2.75, heat: 0, tags: ["Vegan"],
    options: [{ name: "Size", type: "radio", required: true, choices: [{ label: "Regular", delta: 0 }, { label: "Large", delta: 0.75 }] }] },
  { id: "diner-coffee", name: "Bottomless Diner Coffee", category: "Drinks", icon: "coffee",
    desc: "Black, strong, and always hot - the kind that keeps the graveyard shift going.",
    price: 2.25, heat: 0, tags: ["Vegan"] },
  { id: "malt-shake", name: "Malt Shop Shake", category: "Drinks", icon: "shake",
    desc: "Hand-spun thick shake topped with whipped cream and a cherry.",
    price: 5.5, heat: 0, tags: ["Contains dairy"],
    options: [{ name: "Flavor", type: "radio", required: true, choices: [{ label: "Vanilla", delta: 0 }, { label: "Chocolate", delta: 0 }, { label: "Strawberry", delta: 0 }] }] },
  { id: "cold-milk", name: "Cold Bottled Milk", category: "Drinks", icon: "milkbottle",
    desc: "Old-fashioned glass bottle, ice cold from the back cooler.",
    price: 2.0, heat: 0, tags: ["Vegetarian", "Contains dairy"] },
  { id: "neon-sundae", name: "Neon Sign Sundae", category: "Desserts", icon: "sundae",
    desc: "Vanilla soft serve, hot fudge, whipped cream, and a cherry on top.",
    price: 4.75, heat: 0, tags: ["Vegetarian", "Contains dairy"] },
  { id: "pie-of-night", name: "Slice of the Night", category: "Desserts", icon: "pie",
    desc: "Warm slice of the day's pie, baked fresh before the dinner rush.",
    price: 4.25, heat: 0, tags: ["Vegetarian"],
    options: [{ name: "Add-ons", type: "checkbox", choices: [{ label: "A la Mode", delta: 1.5 }] }] }
];
MENU.forEach((m) => { m.photo = "img/" + m.id + ".jpg"; });

const CATEGORIES = ["All", "Starters", "Mains", "Sides", "Drinks", "Desserts"];

/* ---------------- Blue Plate combo (feature B) ---------------- */
const BLUE_PLATE = {
  price: 12.99,
  main: ["griddle-melt", "chili-dog", "flapjack-stack", "graveyard-wings"],
  side: ["counter-fries", "onion-rings", "night-owl-chili", "grill-soup"],
  drink: ["counter-cola", "diner-coffee", "malt-shake", "cold-milk"]
};

/* ---------------- seeded reviews (feature I) ---------------- */
const SEED_REVIEWS = {
  "griddle-melt": [["Reggie T.", 5, "Best smash burger on the strip. The double is a two-hand job."], ["Dana K.", 4, "Sauce is the whole thing. Wish the fries came with it."]],
  "chili-dog": [["Marisol", 5, "Ordered it 'hot' and regretted nothing."], ["The Night Cabbie", 4, "My 2am usual. Never lets me down."]],
  "graveyard-wings": [["Priya S.", 5, "Ghost pepper is not a bluff. Bring milk."], ["Owen", 3, "Good crunch, wanted more sauce."]],
  "counter-fries": [["Lena", 5, "Get the large with gravy. Trust."], ["Sam W.", 4, "Salted just right at the pass."]],
  "onion-rings": [["Bud", 5, "Stacked like a tower. Shareable if you're generous."]],
  "night-owl-chili": [["Carla", 4, "Thick and beefy. Cheddar on top is a must."]],
  "cobb-under-lights": [["Fitz", 4, "Surprisingly big. Blue cheese dressing for me."]],
  "grill-soup": [["Anon", 5, "Different every night, always good. Tonight was potato-leek."]],
  "flapjack-stack": [["Mo", 5, "Breakfast at midnight is a lifestyle."], ["Grace", 4, "Syrup on the side is the right call."]],
  "counter-cola": [["Jer", 5, "Crushed ice. That's it. That's the review."]],
  "diner-coffee": [["Night Nurse", 5, "Bottomless and actually hot. Saved my shift."]],
  "malt-shake": [["Toni", 5, "Chocolate malt is thick enough to stand a spoon in."]],
  "cold-milk": [["Pete", 4, "The glass bottle is a nice touch."]],
  "neon-sundae": [["Ría", 5, "Hot fudge, cold serve, that squeak of the spoon. Perfect."]],
  "pie-of-night": [["Hal", 5, "Cherry tonight. A la mode is mandatory."]]
};

/* ---------------- promo codes (feature H) ---------------- */
const PROMOS = {
  NIGHTOWL: { label: "10% off between 10pm and 4am", pct: 0.10, ok: () => { const h = new Date().getHours(); return h >= 22 || h < 4; }, why: "Only good 10pm - 4am." },
  FIRSTBITE: { label: "$3 off orders over $20", flat: 3, ok: (sub) => sub >= 20, why: "Order needs to be over $20." },
  GRAVEYARD: { label: "Free coffee on orders over $15", flat: 2.25, ok: (sub) => sub >= 15, why: "Order needs to be over $15." }
};

/* ---------------- storage ---------------- */
const K = { cart: "ow_cart_v2", orders: "ow_orders_v2", regulars: "ow_regulars_v2", reviews: "ow_reviews_v2", draft: "ow_draft_v2" };
const readJSON = (key, fallback) => { try { const v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; } catch (e) { return fallback; } };
const writeJSON = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} };

/* migrate v1 cart once */
(function migrate() {
  if (localStorage.getItem(K.cart)) return;
  const old = readJSON("order-window-cart-v1", null);
  if (Array.isArray(old) && old.length) writeJSON(K.cart, old.map((l) => Object.assign({ kind: "item" }, l)));
})();

let cart = readJSON(K.cart, []).map((l) => Object.assign({ kind: "item" }, l));
const saveCart = () => { writeJSON(K.cart, cart); paintCartEverywhere(); };

let regulars = readJSON(K.regulars, []);
const saveRegulars = () => writeJSON(K.regulars, regulars);
const isRegular = (id) => regulars.indexOf(id) !== -1;
function toggleRegular(id) {
  const i = regulars.indexOf(id);
  if (i === -1) { regulars.push(id); toast(findItem(id).name + " added to Regulars."); }
  else { regulars.splice(i, 1); toast(findItem(id).name + " removed from Regulars."); }
  saveRegulars();
}

/* ---------------- helpers ---------------- */
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const money = (n) => "$" + (Math.round(n * 100) / 100).toFixed(2);
const findItem = (id) => MENU.find((m) => m.id === id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function reviewsFor(id) {
  const seed = (SEED_REVIEWS[id] || []).map(([name, stars, text]) => ({ name, stars, text, seed: true }));
  const mine = readJSON(K.reviews, {})[id] || [];
  return seed.concat(mine);
}
function ratingFor(id) {
  const rs = reviewsFor(id);
  if (!rs.length) return null;
  return { avg: rs.reduce((s, r) => s + r.stars, 0) / rs.length, count: rs.length };
}
function starRow(avg, size) {
  let out = '<span class="stars' + (size ? " " + size : "") + '" aria-hidden="true">';
  for (let i = 1; i <= 5; i++) out += '<span class="star' + (avg >= i - 0.25 ? " on" : "") + '">' + SVG.star + "</span>";
  return out + "</span>";
}

function optionUnitDelta(item, sel) {
  let d = 0;
  (item.options || []).forEach((g) => {
    const s = sel[g.name];
    if (!s) return;
    if (g.type === "radio") { const c = g.choices.find((c) => c.label === s); if (c) d += c.delta; }
    else (s || []).forEach((lbl) => { const c = g.choices.find((c) => c.label === lbl); if (c) d += c.delta; });
  });
  return d;
}
function describeSelections(item, sel) {
  const parts = [];
  (item.options || []).forEach((g) => {
    const s = sel[g.name];
    if (!s) return;
    if (g.type === "radio") parts.push(s);
    else if (s.length) parts.push(s.join(", "));
  });
  return parts.join(" · ");
}
function selectionsKey(sel) {
  return JSON.stringify(Object.keys(sel).sort().reduce((a, k) => { a[k] = Array.isArray(sel[k]) ? sel[k].slice().sort() : sel[k]; return a; }, {}));
}

/* line price / describe: works for kind 'item' and 'combo' */
function lineUnitPrice(line) {
  if (line.kind === "combo") return BLUE_PLATE.price;
  const item = findItem(line.itemId);
  return item ? item.price + optionUnitDelta(item, line.selections || {}) : 0;
}
function lineName(line) {
  if (line.kind === "combo") return "Blue Plate Special";
  const item = findItem(line.itemId);
  return item ? item.name : "Item";
}
function lineDetail(line) {
  if (line.kind === "combo") {
    return [line.main, line.side, line.drink].map((id) => (findItem(id) || {}).name).filter(Boolean).join(" + ");
  }
  const item = findItem(line.itemId);
  return item ? describeSelections(item, line.selections || {}) : "";
}
const cartCount = () => cart.reduce((s, l) => s + l.qty, 0);
const cartSubtotal = () => cart.reduce((s, l) => s + lineUnitPrice(l) * l.qty, 0);

function addLine(line) {
  const existing = cart.find((l) => l.key === line.key);
  if (existing) existing.qty += line.qty;
  else cart.push(line);
  saveCart();
}
function addItemToCart(item, selections, qty) {
  addLine({ kind: "item", key: item.id + "::" + selectionsKey(selections), itemId: item.id, selections: selections, qty: qty });
  toast(item.name + " pinned to the spike.");
  bounceSpike();
}
function changeQty(key, delta) {
  const l = cart.find((x) => x.key === key);
  if (!l) return;
  l.qty += delta;
  if (l.qty <= 0) cart = cart.filter((x) => x.key !== key);
  saveCart();
}
function removeLine(key) { cart = cart.filter((x) => x.key !== key); saveCart(); }
function clearCart() { cart = []; saveCart(); }

/* ---------------- kitchen queue (feature G) ---------------- */
function queueSnapshot() {
  const h = new Date().getHours();
  const byHour = [4, 3, 2, 1, 1, 1, 1, 2, 3, 4, 4, 5, 5, 4, 4, 5, 6, 7, 9, 11, 12, 11, 8, 6];
  let drift = 0;
  try { drift = JSON.parse(sessionStorage.getItem("ow_qdrift") || "0"); } catch (e) {}
  const tickets = Math.max(0, (byHour[h] || 4) + drift);
  return { tickets: tickets, waitMin: 6 + tickets * 2 };
}
function nudgeQueue(by) {
  let drift = 0;
  try { drift = JSON.parse(sessionStorage.getItem("ow_qdrift") || "0"); } catch (e) {}
  drift += by != null ? by : (Math.random() < 0.5 ? -1 : 1);
  drift = Math.max(-3, Math.min(6, drift));
  try { sessionStorage.setItem("ow_qdrift", JSON.stringify(drift)); } catch (e) {}
}
function paintQueue() {
  const q = queueSnapshot();
  $$(".queue-ticker").forEach((el) => {
    el.innerHTML = icon("clock") + "<span><strong>" + q.tickets + "</strong> " +
      (q.tickets === 1 ? "ticket" : "tickets") + " on the rail</span><span class=\"qt-dot\"></span><span>~" + q.waitMin + " min wait</span>";
  });
}

/* ---------------- toast ---------------- */
let toastT = null;
function toast(msg) {
  const el = $("#ow-toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastT);
  toastT = setTimeout(() => el.classList.remove("show"), 2200);
}

/* ---------------- shared chrome ---------------- */
const PAGE = document.body.dataset.page;
const NAV = [
  { href: "index.html", label: "The Board", key: "board" },
  { href: "combo.html", label: "Blue Plate", key: "combo" },
  { href: "regulars.html", label: "Regulars", key: "regulars" }
];

function renderChrome() {
  const header = document.createElement("header");
  header.className = "diner-header";
  header.innerHTML =
    '<div class="checker-strip" aria-hidden="true"></div>' +
    '<div class="header-inner">' +
      '<a class="sign" href="index.html">' +
        '<span class="sign-main">THE ORDER WINDOW</span>' +
        '<span class="sign-sub">// late-night short order</span>' +
      '</a>' +
      '<button class="nav-toggle" id="nav-toggle" aria-label="Open menu" aria-expanded="false">' + SVG.menu + '</button>' +
      '<nav class="diner-nav" id="diner-nav" aria-label="Main">' +
        NAV.map((n) => '<a href="' + n.href + '"' + (n.key === PAGE ? ' aria-current="page"' : "") + ">" + n.label + "</a>").join("") +
        '<a href="cart.html" class="nav-spike' + (PAGE === "cart" ? '" aria-current="page' : "") + '">' + SVG.bag + '<span>The Spike</span><span class="nav-spike-count" data-cart-count>0</span></a>' +
      '</nav>' +
      '<span class="open-badge">OPEN</span>' +
    '</div>' +
    '<div class="queue-strip"><div class="queue-ticker"></div></div>';
  document.body.insertBefore(header, document.body.firstChild);

  const footer = document.createElement("footer");
  footer.className = "diner-footer";
  footer.innerHTML =
    '<div class="footer-inner">' +
      '<p><strong>The Order Window</strong> - open till the grill goes cold.</p>' +
      '<p>219 Ashcombe Lane &middot; Nightly 6pm - 4am &middot; (555) 019-2200</p>' +
      '<p class="footer-fine">Front-end demo. Nothing is really fired to a kitchen. Food photos under Creative Commons - see img/_credits.json.</p>' +
    '</div>';
  document.body.appendChild(footer);

  const nav = $("#diner-nav");
  const tog = $("#nav-toggle");
  tog.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    tog.setAttribute("aria-expanded", open ? "true" : "false");
    tog.innerHTML = open ? SVG.x : SVG.menu;
  });
  document.addEventListener("click", (e) => {
    if (nav.classList.contains("open") && !nav.contains(e.target) && !tog.contains(e.target)) {
      nav.classList.remove("open"); tog.setAttribute("aria-expanded", "false"); tog.innerHTML = SVG.menu;
    }
  });
}

/* ---------------- mini cart drawer (shared) ---------------- */
function mountDrawer() {
  const host = $("#drawer-mount") || document.body.appendChild(document.createElement("div"));
  host.innerHTML =
    '<button class="spike-btn" id="spike-btn" aria-haspopup="dialog" aria-controls="cart-drawer" aria-label="Open the order spike">' +
      '<span class="spike-bell" aria-hidden="true"></span><span class="spike-rod" aria-hidden="true"></span>' +
      '<span class="spike-base" aria-hidden="true"></span><span class="spike-count" data-cart-count>0</span>' +
    '</button>' +
    '<div class="overlay" id="overlay"></div>' +
    '<aside class="drawer" id="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title">' +
      '<div class="drawer-head"><h2 id="drawer-title">The Spike</h2>' +
        '<button class="drawer-close" id="drawer-close" aria-label="Close">' + SVG.x + '</button></div>' +
      '<div class="drawer-body" id="drawer-body"></div>' +
      '<div class="drawer-foot">' +
        '<div class="subtotal-row"><span>Subtotal</span><span data-cart-subtotal>$0.00</span></div>' +
        '<a class="btn-solid block" id="drawer-review" href="cart.html">Review the order' + icon("arrowR") + '</a>' +
        '<a class="btn-ghost block" id="drawer-checkout" href="checkout.html">Fire it now' + icon("arrowR") + '</a>' +
      '</div>' +
    '</aside>' +
    '<div class="toast" id="ow-toast" role="status" aria-live="polite"></div>';

  const overlay = $("#overlay"), drawer = $("#cart-drawer");
  const open = () => { paintDrawer(); overlay.classList.add("show"); drawer.classList.add("open"); document.addEventListener("keydown", onEsc); };
  const close = () => { overlay.classList.remove("show"); drawer.classList.remove("open"); document.removeEventListener("keydown", onEsc); };
  function onEsc(e) { if (e.key === "Escape") close(); }
  $("#spike-btn").addEventListener("click", open);
  $("#drawer-close").addEventListener("click", close);
  overlay.addEventListener("click", close);
  $("#spike-btn").addEventListener("animationend", () => $("#spike-btn").classList.remove("bounce"));
}

function bounceSpike() {
  const b = $("#spike-btn");
  if (!b) return;
  b.classList.remove("bounce");
  void b.offsetWidth;
  b.classList.add("bounce");
}

function paintDrawer() {
  const body = $("#drawer-body");
  if (!body) return;
  if (!cart.length) {
    body.innerHTML = '<p class="spike-empty">The spike is empty. Nothing on order yet.</p>';
  } else {
    body.innerHTML = cart.map((line) => {
      const total = lineUnitPrice(line) * line.qty;
      const d = lineDetail(line);
      return '<div class="cart-line">' +
        '<div class="cart-line-top"><strong>' + esc(lineName(line)) + '</strong><span>' + money(total) + '</span></div>' +
        (d ? '<div class="cart-line-opts">' + esc(d) + '</div>' : '') +
        '<div class="cart-line-bottom">' + stepperHTML(line.qty, "drawer", line.key) +
        '<button type="button" class="remove-line" data-remove="' + line.key + '">Remove</button></div>' +
      '</div>';
    }).join("");
    bindSteppers(body);
    $$("[data-remove]", body).forEach((b) => b.addEventListener("click", () => { removeLine(b.dataset.remove); paintDrawer(); }));
  }
  const dis = !cart.length;
  $("#drawer-review").classList.toggle("is-disabled", dis);
  $("#drawer-checkout").classList.toggle("is-disabled", dis);
}

/* one place to repaint every cart badge / subtotal on the page */
function paintCartEverywhere() {
  const c = cartCount();
  $$("[data-cart-count]").forEach((el) => { el.textContent = String(c); el.classList.toggle("empty", c === 0); });
  $$("[data-cart-subtotal]").forEach((el) => { el.textContent = money(cartSubtotal()); });
  paintDrawer();
  if (pageRepaint) pageRepaint();
}
let pageRepaint = null;

/* ---------------- themed <select> (feature: dropdowns) ---------------- */
function enhanceSelect(sel) {
  if (!sel || sel.dataset.ow) return;
  sel.dataset.ow = "1";
  const wrap = document.createElement("div");
  wrap.className = "ow-sel";
  sel.parentNode.insertBefore(wrap, sel);
  wrap.appendChild(sel);
  sel.classList.add("ow-sel-native");

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "ow-sel-trigger";
  trigger.setAttribute("aria-haspopup", "listbox");
  trigger.setAttribute("aria-expanded", "false");
  const panel = document.createElement("div");
  panel.className = "ow-sel-panel";
  panel.setAttribute("role", "listbox");
  panel.hidden = true;
  wrap.appendChild(trigger);
  wrap.appendChild(panel);

  function build() {
    panel.innerHTML = "";
    Array.from(sel.options).forEach((opt) => {
      const o = document.createElement("div");
      o.className = "ow-sel-opt";
      o.setAttribute("role", "option");
      o.textContent = opt.textContent;
      if (opt.disabled) o.setAttribute("aria-disabled", "true");
      if (opt.value === sel.value && !opt.disabled) o.setAttribute("aria-selected", "true");
      o.addEventListener("click", () => {
        if (opt.disabled) return;
        sel.value = opt.value;
        sel.dispatchEvent(new Event("change", { bubbles: true }));
        close();
      });
      panel.appendChild(o);
    });
  }
  function sync() {
    const opt = sel.options[sel.selectedIndex];
    trigger.innerHTML = "<span>" + (opt ? esc(opt.textContent) : "") + "</span>" + SVG.chevron;
    trigger.classList.toggle("empty", !sel.value);
  }
  function openPanel() { build(); panel.hidden = false; trigger.setAttribute("aria-expanded", "true"); }
  function close() { panel.hidden = true; trigger.setAttribute("aria-expanded", "false"); }
  trigger.addEventListener("click", () => (panel.hidden ? openPanel() : close()));
  document.addEventListener("click", (e) => { if (!wrap.contains(e.target)) close(); });
  sel.addEventListener("change", sync);
  sync();
}

/* ---------------- themed stepper (feature: counters) ---------------- */
function stepperHTML(value, scope, key) {
  return '<span class="ow-stepper" data-stepper' + (key ? ' data-key="' + esc(key) + '"' : "") +
    ' data-scope="' + (scope || "") + '">' +
    '<button type="button" class="ow-step" data-step="-1" aria-label="One fewer">' + SVG.minus + '</button>' +
    '<span class="ow-step-val" data-step-val>' + value + '</span>' +
    '<button type="button" class="ow-step" data-step="1" aria-label="One more">' + SVG.plus + '</button>' +
  '</span>';
}
function bindSteppers(root, onChange) {
  $$(".ow-stepper", root).forEach((el) => {
    if (el.dataset.bound) return;
    el.dataset.bound = "1";
    el.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-step]");
      if (!btn) return;
      const delta = Number(btn.dataset.step);
      if (el.dataset.key) {
        changeQty(el.dataset.key, delta);
        if (el.dataset.scope === "drawer") paintDrawer();
      }
      if (onChange) onChange(delta, el);
    });
  });
}

/* ---------------- ticket card ---------------- */
function ticketCard(item) {
  const r = ratingFor(item.id);
  const needsChoice = (item.options || []).some((g) => g.required);
  return '<article class="ticket" data-id="' + item.id + '">' +
    '<button type="button" class="ticket-reg' + (isRegular(item.id) ? " on" : "") + '" data-reg="' + item.id + '" aria-label="Toggle Regular" aria-pressed="' + isRegular(item.id) + '">' + SVG.star + '</button>' +
    '<a class="ticket-hit" href="item.html#' + item.id + '">' +
      '<span class="ticket-cat">' + item.category + '</span>' +
      '<span class="ticket-photo">' +
        '<img src="' + item.photo + '" alt="' + esc(item.name) + '" loading="lazy" onerror="this.style.display=\'none\'">' +
        '<span class="ticket-photo-fb">' + ICONS[item.icon]() + '</span>' +
      '</span>' +
      '<h3>' + esc(item.name) + '</h3>' +
      (r ? '<div class="ticket-rating">' + starRow(r.avg, "sm") + '<span>' + r.avg.toFixed(1) + '</span></div>' : '<div class="ticket-rating muted">No reviews yet</div>') +
      '<p>' + esc(item.desc) + '</p>' +
      (item.tags && item.tags.length ? '<div class="ticket-tags">' + item.tags.map((t) => '<span class="tag' + (t === "Spicy" ? " hot" : "") + '">' + (t === "Spicy" ? SVG.flame : "") + t + '</span>').join("") + '</div>' : '') +
    '</a>' +
    '<div class="ticket-foot">' +
      '<span class="ticket-price">' + money(item.price) + (needsChoice ? '<i>+ options</i>' : '') + '</span>' +
      (needsChoice
        ? '<a class="ticket-add" href="item.html#' + item.id + '">Choose</a>'
        : '<button type="button" class="ticket-add" data-quickadd="' + item.id + '">Add' + icon("plus") + '</button>') +
    '</div>' +
  '</article>';
}

function bindTicketGrid(root) {
  $$("[data-reg]", root).forEach((b) => b.addEventListener("click", (e) => {
    e.preventDefault();
    toggleRegular(b.dataset.reg);
    const on = isRegular(b.dataset.reg);
    b.classList.toggle("on", on);
    b.setAttribute("aria-pressed", String(on));
    if (pageRepaint) pageRepaint();
  }));
  $$("[data-quickadd]", root).forEach((b) => b.addEventListener("click", (e) => {
    e.preventDefault();
    const item = findItem(b.dataset.quickadd);
    const sel = {};
    (item.options || []).forEach((g) => { sel[g.name] = g.type === "checkbox" ? [] : null; });
    addItemToCart(item, sel, 1);
  }));
}

/* ============================================================
   PAGES
   ============================================================ */
const pages = {};

/* ---- The Board ---- */
pages.board = function () {
  const main = $("#main");
  main.innerHTML =
    '<section class="special-slot" id="special-slot"></section>' +
    '<section class="usual-slot" id="usual-slot"></section>' +
    '<div class="toolbar">' +
      '<div class="search-wrap">' + SVG.search +
        '<input type="search" id="search-input" placeholder="Search the menu..." autocomplete="off" aria-label="Search the menu">' +
      '</div>' +
      '<label class="sort-wrap"><span>Sort</span>' +
        '<select id="sort-select">' +
          '<option value="pick">Kitchen\'s pick</option>' +
          '<option value="price-asc">Price: low to high</option>' +
          '<option value="price-desc">Price: high to low</option>' +
          '<option value="name">Name A - Z</option>' +
          '<option value="rating">Top rated</option>' +
        '</select>' +
      '</label>' +
    '</div>' +
    '<nav class="categories" id="cats" aria-label="Filter by category"></nav>' +
    '<div class="rail-head"><h2 id="rail-title">Tonight\'s Board</h2><span class="rail-line" aria-hidden="true"></span></div>' +
    '<div class="rail" id="rail" aria-live="polite"></div>';

  let cat = "All", q = "", sort = "pick", regOnly = false;
  const special = pickSpecial();

  function list() {
    let items = MENU.slice();
    if (regOnly) items = items.filter((m) => isRegular(m.id));
    if (cat !== "All") items = items.filter((m) => m.category === cat);
    const qq = q.trim().toLowerCase();
    if (qq) items = items.filter((m) => (m.name + " " + m.desc + " " + m.category + " " + (m.tags || []).join(" ")).toLowerCase().includes(qq));
    if (sort === "price-asc") items.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") items.sort((a, b) => b.price - a.price);
    else if (sort === "name") items.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "rating") items.sort((a, b) => ((ratingFor(b.id) || {}).avg || 0) - ((ratingFor(a.id) || {}).avg || 0));
    return items;
  }
  function drawCats() {
    const host = $("#cats");
    host.innerHTML = CATEGORIES.map((c) => '<button type="button" class="cat-btn' + (!regOnly && cat === c ? " active" : "") + '">' + c + "</button>").join("") +
      '<button type="button" class="cat-btn reg' + (regOnly ? " active" : "") + '">' + SVG.star + "Regulars</button>";
    const btns = $$(".cat-btn", host);
    CATEGORIES.forEach((c, i) => btns[i].addEventListener("click", () => { cat = c; regOnly = false; drawCats(); draw(); }));
    btns[CATEGORIES.length].addEventListener("click", () => { regOnly = !regOnly; drawCats(); draw(); });
  }
  function draw() {
    const items = list();
    $("#rail-title").textContent = regOnly ? "Your Regulars" : (cat === "All" ? "Tonight's Board" : cat + " - Tonight's Board");
    const rail = $("#rail");
    if (!items.length) {
      rail.innerHTML = '<p class="empty-note">' + (regOnly ? "No Regulars yet. Tap the star on any ticket to pin it here." : "Nothing on the board matches. Try another search or category.") + '</p>';
      return;
    }
    rail.innerHTML = items.map(ticketCard).join("");
    bindTicketGrid(rail);
  }
  function drawSpecial() {
    const el = $("#special-slot");
    const it = special.item;
    el.innerHTML =
      '<div class="special-flag">Tonight\'s Special</div>' +
      '<div class="special-card">' +
        '<a class="special-photo" href="item.html#' + it.id + '">' +
          '<img src="' + it.photo + '" alt="' + esc(it.name) + '" onerror="this.style.display=\'none\'">' +
          '<span class="ticket-photo-fb">' + ICONS[it.icon]() + '</span>' +
        '</a>' +
        '<div class="special-body">' +
          '<span class="ticket-cat">' + it.category + '</span>' +
          '<h3>' + esc(it.name) + '</h3>' +
          '<p>' + esc(it.desc) + '</p>' +
          '<div class="special-price"><span class="was">' + money(it.price) + '</span>' +
            '<span class="now">' + money(special.price) + '</span>' +
            '<span class="off">' + special.pctLabel + ' off tonight</span></div>' +
          (special.needsChoice
            ? '<a class="btn-solid" href="item.html#' + it.id + '">See the ticket' + icon("arrowR") + '</a>'
            : '<button type="button" class="btn-solid" id="special-add">Add to order' + icon("plus") + '</button>') +
        '</div>' +
      '</div>';
    const addBtn = $("#special-add");
    if (addBtn) addBtn.addEventListener("click", () => {
      const sel = {};
      (it.options || []).forEach((g) => { sel[g.name] = g.type === "checkbox" ? [] : null; });
      addLine({ kind: "item", key: it.id + "::special::" + special.dayKey, itemId: it.id, selections: sel, qty: 1, special: special.price });
      toast("Tonight's special added at " + money(special.price) + ".");
      bounceSpike();
    });
  }
  function drawUsual() {
    const el = $("#usual-slot");
    const orders = readJSON(K.orders, []);
    if (!orders.length) { el.innerHTML = ""; return; }
    const last = orders[0];
    el.innerHTML =
      '<div class="usual-card">' +
        '<div><span class="usual-kicker">The Usual</span>' +
        '<p>' + last.lines.map((l) => l.qty + "× " + esc(lineName(l))).join(", ") + '</p></div>' +
        '<button type="button" class="btn-solid" id="reorder-btn">' + icon("repeat") + 'Order it again</button>' +
      '</div>';
    $("#reorder-btn").addEventListener("click", () => { reorder(last); });
  }

  drawCats();
  drawSpecial();
  drawUsual();
  draw();

  $("#search-input").addEventListener("input", (e) => { q = e.target.value; draw(); });
  enhanceSelect($("#sort-select"));
  $("#sort-select").addEventListener("change", (e) => { sort = e.target.value; draw(); });

  pageRepaint = () => { drawCats(); draw(); drawUsual(); };
};

function pickSpecial() {
  const now = new Date();
  const dayKey = now.getFullYear() + "-" + now.getMonth() + "-" + now.getDate();
  let h = 0;
  for (let i = 0; i < dayKey.length; i++) h = (h * 31 + dayKey.charCodeAt(i)) >>> 0;
  const item = MENU[h % MENU.length];
  const pct = [0.15, 0.2, 0.25][(h >> 3) % 3];
  return {
    item: item, dayKey: dayKey,
    price: Math.round(item.price * (1 - pct) * 100) / 100,
    pctLabel: Math.round(pct * 100) + "%",
    needsChoice: (item.options || []).some((g) => g.required)
  };
}

function reorder(order) {
  order.lines.forEach((l) => {
    if (l.kind === "combo") addLine({ kind: "combo", key: l.key, main: l.main, side: l.side, drink: l.drink, qty: l.qty });
    else addLine({ kind: "item", key: l.key, itemId: l.itemId, selections: l.selections || {}, qty: l.qty });
  });
  toast("Re-ordered. Check the spike.");
  bounceSpike();
}

/* ---- Item detail ---- */
pages.item = function () {
  const main = $("#main");
  function render() {
    const id = decodeURIComponent(location.hash.slice(1));
    const item = findItem(id);
    if (!item) {
      main.innerHTML = '<div class="pad"><p class="empty-note">That ticket is not on the board. <a href="index.html">Back to the board</a>.</p></div>';
      return;
    }
    const sel = {};
    (item.options || []).forEach((g) => { sel[g.name] = g.type === "checkbox" ? [] : (g.required ? g.choices[0].label : null); });
    let qty = 1;
    const r = ratingFor(item.id);

    main.innerHTML =
      '<div class="crumb"><a href="index.html">' + icon("arrowL") + 'The Board</a></div>' +
      '<div class="item-wrap">' +
        '<div class="item-photo">' +
          '<img src="' + item.photo + '" alt="' + esc(item.name) + '" onerror="this.style.display=\'none\'">' +
          '<span class="ticket-photo-fb">' + ICONS[item.icon]() + '</span>' +
          '<button type="button" class="item-reg' + (isRegular(item.id) ? " on" : "") + '" id="item-reg" aria-pressed="' + isRegular(item.id) + '">' + SVG.star + '<span>Regular</span></button>' +
        '</div>' +
        '<div class="item-info">' +
          '<span class="ticket-cat">' + item.category + '</span>' +
          '<h1>' + esc(item.name) + '</h1>' +
          (r ? '<div class="item-rating">' + starRow(r.avg) + '<span>' + r.avg.toFixed(1) + ' &middot; ' + r.count + ' review' + (r.count === 1 ? "" : "s") + '</span></div>' : '') +
          '<p class="item-desc">' + esc(item.desc) + '</p>' +
          (item.tags && item.tags.length ? '<div class="ticket-tags">' + item.tags.map((t) => '<span class="tag' + (t === "Spicy" ? " hot" : "") + '">' + (t === "Spicy" ? SVG.flame : "") + t + '</span>').join("") + '</div>' : '') +
          (item.heat ? '<div class="heat-row">Heat <span class="flames">' + [1, 2, 3].map((n) => '<span class="flame' + (item.heat >= n ? " on" : "") + '">' + SVG.flame + '</span>').join("") + '</span></div>' : '') +
          '<div id="item-options"></div>' +
          '<div class="item-buy">' +
            stepperHTML(qty, "item") +
            '<button type="button" class="btn-solid big" id="item-add">Add to order &middot; <span id="item-total">' + money(item.price) + '</span></button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<section class="pairs"><h2>Goes well with</h2><div class="rail sm" id="pairs-rail"></div></section>' +
      '<section class="reviews"><h2>From the counter</h2><div id="review-list"></div>' +
        '<form class="review-form" id="review-form">' +
          '<p class="rf-title">Leave a note</p>' +
          '<div class="rf-row"><label>Name<input type="text" id="rf-name" maxlength="30"></label>' +
          '<label>Stars<select id="rf-stars"><option value="5">5</option><option value="4">4</option><option value="3">3</option><option value="2">2</option><option value="1">1</option></select></label></div>' +
          '<label class="rf-text">Your note<textarea id="rf-text" rows="2" maxlength="180"></textarea></label>' +
          '<button type="submit" class="btn-solid">Post it</button>' +
          '<span class="field-error" id="rf-err"></span>' +
        '</form>' +
      '</section>';

    const optHost = $("#item-options");
    function drawOptions() {
      optHost.innerHTML = (item.options || []).map((g) => {
        const pills = g.choices.map((c) => {
          const type = g.type === "checkbox" ? "checkbox" : "radio";
          const on = g.type === "checkbox" ? sel[g.name].includes(c.label) : sel[g.name] === c.label;
          return '<label class="option-pill"><input type="' + type + '" name="opt-' + esc(g.name) + '" value="' + esc(c.label) + '"' + (on ? " checked" : "") +
            ' data-group="' + esc(g.name) + '" data-type="' + g.type + '"><span>' + esc(c.label) + (c.delta ? " (+" + money(c.delta) + ")" : "") + "</span></label>";
        }).join("");
        return '<fieldset class="option-group"><legend>' + esc(g.name) + (g.required ? " *" : "") + "</legend><div class=\"option-pills\">" + pills + "</div></fieldset>";
      }).join("");
      $$("input[data-group]", optHost).forEach((inp) => inp.addEventListener("change", () => {
        const g = inp.dataset.group;
        if (inp.dataset.type === "checkbox") {
          const s = new Set(sel[g]);
          inp.checked ? s.add(inp.value) : s.delete(inp.value);
          sel[g] = Array.from(s);
        } else sel[g] = inp.value;
        paintTotal();
      }));
    }
    function unit() { return item.price + optionUnitDelta(item, sel); }
    function paintTotal() { $("#item-total").textContent = money(unit() * qty); }

    drawOptions();
    bindSteppers(main.querySelector(".item-buy"), (delta) => { qty = Math.max(1, Math.min(20, qty + delta)); $(".item-buy [data-step-val]").textContent = qty; paintTotal(); });

    $("#item-add").addEventListener("click", () => {
      const miss = (item.options || []).some((g) => g.required && !sel[g.name]);
      if (miss) { toast("Pick an option before it goes on the spike."); return; }
      addItemToCart(item, JSON.parse(JSON.stringify(sel)), qty);
    });
    $("#item-reg").addEventListener("click", () => {
      toggleRegular(item.id);
      const on = isRegular(item.id);
      $("#item-reg").classList.toggle("on", on);
      $("#item-reg").setAttribute("aria-pressed", String(on));
    });

    /* pairings: other categories, up to 4 */
    const pairs = MENU.filter((m) => m.category !== item.category).sort(() => 0.5 - Math.random()).slice(0, 4);
    $("#pairs-rail").innerHTML = pairs.map(ticketCard).join("");
    bindTicketGrid($("#pairs-rail"));

    drawReviews();
    function drawReviews() {
      $("#review-list").innerHTML = reviewsFor(item.id).map((rv) =>
        '<div class="review"><div class="review-head"><strong>' + esc(rv.name) + '</strong>' + starRow(rv.stars, "sm") + '</div><p>' + esc(rv.text) + '</p></div>'
      ).join("") || '<p class="muted">No notes yet. Be the first.</p>';
    }
    enhanceSelect($("#rf-stars"));
    $("#review-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const name = $("#rf-name").value.trim();
      const text = $("#rf-text").value.trim();
      const err = $("#rf-err");
      if (name.length < 2) { err.textContent = "Add a name."; return; }
      if (text.length < 4) { err.textContent = "Add a couple words."; return; }
      const all = readJSON(K.reviews, {});
      (all[item.id] = all[item.id] || []).push({ name: name, stars: Number($("#rf-stars").value), text: text });
      writeJSON(K.reviews, all);
      e.target.reset();
      enhanceSelect($("#rf-stars"));
      err.textContent = "";
      drawReviews();
      toast("Thanks for the note.");
    });
  }
  render();
  window.addEventListener("hashchange", () => location.reload());
};

/* ---- Blue Plate combo ---- */
pages.combo = function () {
  const main = $("#main");
  const pick = { main: BLUE_PLATE.main[0], side: BLUE_PLATE.side[0], drink: BLUE_PLATE.drink[0] };

  function alacarte() { return ["main", "side", "drink"].reduce((s, k) => s + (findItem(pick[k]) || {}).price, 0); }

  function slot(kind, label) {
    const opts = BLUE_PLATE[kind].map((id) => {
      const it = findItem(id);
      return '<option value="' + id + '">' + esc(it.name) + " (" + money(it.price) + ")</option>";
    }).join("");
    return '<div class="combo-slot"><label class="combo-label">' + label + '</label>' +
      '<select data-combo="' + kind + '">' + opts + '</select>' +
      '<div class="combo-preview" data-preview="' + kind + '"></div></div>';
  }

  main.innerHTML =
    '<div class="crumb"><a href="index.html">' + icon("arrowL") + 'The Board</a></div>' +
    '<div class="combo-head"><h1>The Blue Plate Special</h1>' +
      '<p>Pick a main, a side, and a drink. One flat price, whatever you choose.</p></div>' +
    '<div class="combo-grid">' + slot("main", "The Main") + slot("side", "The Side") + slot("drink", "The Drink") + '</div>' +
    '<div class="combo-summary" id="combo-summary"></div>';

  $$("[data-combo]").forEach((sel) => {
    sel.value = pick[sel.dataset.combo];
    enhanceSelect(sel);
    sel.addEventListener("change", () => { pick[sel.dataset.combo] = sel.value; paint(); });
  });

  function paint() {
    ["main", "side", "drink"].forEach((k) => {
      const it = findItem(pick[k]);
      $('[data-preview="' + k + '"]').innerHTML =
        '<img src="' + it.photo + '" alt="' + esc(it.name) + '" onerror="this.style.display=\'none\'"><span class="ticket-photo-fb">' + ICONS[it.icon]() + '</span>';
    });
    const save = alacarte() - BLUE_PLATE.price;
    $("#combo-summary").innerHTML =
      '<div class="cs-lines">' +
        ["main", "side", "drink"].map((k) => '<div><span>' + esc(findItem(pick[k]).name) + '</span><span>' + money(findItem(pick[k]).price) + '</span></div>').join("") +
      '</div>' +
      '<div class="cs-total"><span>A la carte</span><span class="strike">' + money(alacarte()) + '</span></div>' +
      '<div class="cs-total big"><span>Blue Plate price</span><span>' + money(BLUE_PLATE.price) + '</span></div>' +
      (save > 0 ? '<div class="cs-save">You save ' + money(save) + '</div>' : "") +
      '<button type="button" class="btn-solid block big" id="combo-add">Add the Blue Plate' + icon("plus") + '</button>';
    $("#combo-add").addEventListener("click", () => {
      addLine({ kind: "combo", key: "combo::" + pick.main + "::" + pick.side + "::" + pick.drink, main: pick.main, side: pick.side, drink: pick.drink, qty: 1 });
      toast("Blue Plate added to the spike.");
      bounceSpike();
    });
  }
  paint();
};

/* ---- Cart (The Spike) ---- */
pages.cart = function () {
  const main = $("#main");
  function draw() {
    if (!cart.length) {
      main.innerHTML = '<div class="crumb"><a href="index.html">' + icon("arrowL") + 'The Board</a></div>' +
        '<div class="cart-empty"><p>The spike is empty.</p><a class="btn-solid" href="index.html">Start an order' + icon("arrowR") + '</a></div>';
      return;
    }
    main.innerHTML =
      '<div class="crumb"><a href="index.html">' + icon("arrowL") + 'Keep ordering</a></div>' +
      '<h1 class="page-title">The Spike</h1>' +
      '<div class="cart-list">' + cart.map((line) => {
        const item = line.kind === "item" ? findItem(line.itemId) : null;
        const d = lineDetail(line);
        return '<div class="cart-row">' +
          '<span class="cart-row-photo">' +
            (item ? '<img src="' + item.photo + '" alt="" onerror="this.style.display=\'none\'"><span class="ticket-photo-fb">' + ICONS[item.icon]() + '</span>'
                  : '<span class="combo-badge">Blue<br>Plate</span>') +
          '</span>' +
          '<div class="cart-row-main">' +
            '<div class="cart-row-top"><strong>' + esc(lineName(line)) + '</strong><span>' + money(lineUnitPrice(line) * line.qty) + '</span></div>' +
            (d ? '<p class="cart-row-opts">' + esc(d) + '</p>' : '') +
            '<div class="cart-row-ctl">' + stepperHTML(line.qty, "cart", line.key) +
              (item ? '<a class="link-btn" href="item.html#' + line.itemId + '">Edit</a>' : '<a class="link-btn" href="combo.html">Rebuild</a>') +
              '<button type="button" class="link-btn danger" data-remove="' + esc(line.key) + '">' + icon("trash") + 'Remove</button>' +
            '</div>' +
          '</div>' +
        '</div>';
      }).join("") + '</div>' +
      '<div class="cart-foot">' +
        '<div class="cart-sub"><span>Subtotal</span><span data-cart-subtotal>' + money(cartSubtotal()) + '</span></div>' +
        '<p class="cart-note">Tax, tip and delivery are set on the next step.</p>' +
        '<a class="btn-solid block big" href="checkout.html">Fire the order' + icon("arrowR") + '</a>' +
        '<button type="button" class="link-btn" id="clear-cart">Clear the spike</button>' +
      '</div>';
    bindSteppers(main, (delta, el) => { if (el.dataset.key) draw(); });
    $$("[data-remove]", main).forEach((b) => b.addEventListener("click", () => { removeLine(b.dataset.remove); draw(); }));
    $("#clear-cart").addEventListener("click", () => { if (confirm("Clear the whole order?")) { clearCart(); draw(); } });
  }
  draw();
  pageRepaint = draw;
};

/* ---- Checkout ---- */
pages.checkout = function () {
  const main = $("#main");
  if (!cart.length) {
    main.innerHTML = '<div class="cart-empty"><p>Nothing to fire - the spike is empty.</p><a class="btn-solid" href="index.html">Back to the board' + icon("arrowR") + '</a></div>';
    return;
  }
  const draft = readJSON(K.draft, {});
  const st = { step: "review", mode: draft.mode || "pickup", tip: draft.tip != null ? draft.tip : 0.15, promo: null, name: draft.name || "", address: draft.address || "", notes: draft.notes || "" };

  const DELIVERY_FEE = 4.5;
  function discount(sub) {
    if (!st.promo) return 0;
    const p = PROMOS[st.promo];
    return Math.min(sub, p.pct ? sub * p.pct : p.flat);
  }
  function totals() {
    const sub = cartSubtotal();
    const disc = discount(sub);
    const deliv = st.mode === "delivery" ? DELIVERY_FEE : 0;
    const tipBase = sub - disc;
    const tip = st.tip === "roundup" ? Math.max(0, Math.ceil(tipBase + deliv) - (tipBase + deliv)) : tipBase * st.tip;
    return { sub, disc, deliv, tip, grand: sub - disc + deliv + tip };
  }

  function shell(body) {
    main.innerHTML = '<div class="crumb"><a href="cart.html">' + icon("arrowL") + 'The Spike</a></div>' +
      '<div class="checkout-card">' + body + '</div>';
  }
  function totalsHTML() {
    const t = totals();
    return '<div class="totals">' +
      '<div><span>Subtotal</span><span>' + money(t.sub) + '</span></div>' +
      (t.disc ? '<div class="disc"><span>' + st.promo + '</span><span>-' + money(t.disc) + '</span></div>' : "") +
      (t.deliv ? '<div><span>Delivery</span><span>' + money(t.deliv) + '</span></div>' : "") +
      '<div><span>Tip</span><span>' + money(t.tip) + '</span></div>' +
      '<div class="grand"><span>Total</span><span>' + money(t.grand) + '</span></div>' +
    '</div>';
  }

  function stepReview() {
    st.step = "review";
    shell('<h1>Ticket Review</h1><p class="checkout-sub">Check the order before it goes on the wheel.</p>' +
      '<div class="review-lines">' + cart.map((l) => '<div class="review-line"><span>' + l.qty + '× ' + esc(lineName(l)) + (lineDetail(l) ? ' <i>(' + esc(lineDetail(l)) + ')</i>' : "") + '</span><span>' + money(lineUnitPrice(l) * l.qty) + '</span></div>').join("") + '</div>' +
      '<div class="review-line total"><span>Subtotal</span><span>' + money(cartSubtotal()) + '</span></div>' +
      '<div class="checkout-nav"><a class="btn-ghost" href="cart.html">' + icon("arrowL") + 'Edit order</a>' +
      '<button type="button" class="btn-solid" id="to-details">Next: details' + icon("arrowR") + '</button></div>');
    $("#to-details").addEventListener("click", stepDetails);
  }

  function stepDetails() {
    st.step = "details";
    shell('<h1>Details</h1><p class="checkout-sub">Where is this order headed, and how do you want it?</p>' +
      '<div class="field-row">' +
        '<label class="fld"><span>Pickup or delivery</span><select id="ck-mode"><option value="pickup">Pickup at the window</option><option value="delivery">Delivery (+' + money(DELIVERY_FEE) + ')</option></select></label>' +
        '<label class="fld"><span>Tip</span><select id="ck-tip">' +
          '<option value="0">No tip</option><option value="0.1">10%</option><option value="0.15">15%</option><option value="0.2">20%</option><option value="roundup">Round up</option>' +
        '</select></label>' +
      '</div>' +
      '<label class="fld"><span>Name</span><input type="text" id="ck-name" value="' + esc(st.name) + '"><span class="field-error" id="err-name"></span></label>' +
      '<label class="fld" id="addr-fld"><span>Delivery address</span><input type="text" id="ck-address" value="' + esc(st.address) + '"><span class="field-error" id="err-address"></span></label>' +
      '<label class="fld"><span>Notes for the kitchen (optional)</span><textarea id="ck-notes" rows="2">' + esc(st.notes) + '</textarea></label>' +
      '<div class="promo-row">' +
        '<input type="text" id="ck-promo" placeholder="Promo code" autocomplete="off" aria-label="Promo code">' +
        '<button type="button" class="btn-ghost" id="apply-promo">Apply</button>' +
        '<span class="promo-msg" id="promo-msg"></span>' +
      '</div>' +
      '<p class="promo-hint">Try <button type="button" class="codechip" data-code="NIGHTOWL">NIGHTOWL</button> <button type="button" class="codechip" data-code="FIRSTBITE">FIRSTBITE</button> <button type="button" class="codechip" data-code="GRAVEYARD">GRAVEYARD</button></p>' +
      totalsHTML() +
      '<div class="checkout-nav"><button type="button" class="btn-ghost" id="back-review">' + icon("arrowL") + 'Back</button>' +
      '<button type="button" class="btn-solid" id="fire-btn">Fire the order' + icon("arrowR") + '</button></div>');

    const modeSel = $("#ck-mode"), tipSel = $("#ck-tip");
    modeSel.value = st.mode; tipSel.value = String(st.tip);
    enhanceSelect(modeSel); enhanceSelect(tipSel);
    function syncAddr() { $("#addr-fld").style.display = st.mode === "delivery" ? "" : "none"; }
    syncAddr();
    modeSel.addEventListener("change", () => { st.mode = modeSel.value; syncAddr(); refreshTotals(); });
    tipSel.addEventListener("change", () => { st.tip = tipSel.value === "roundup" ? "roundup" : Number(tipSel.value); refreshTotals(); });
    ["ck-name", "ck-address", "ck-notes"].forEach((id) => $("#" + id).addEventListener("input", () => {
      st.name = $("#ck-name").value; st.address = $("#ck-address").value; st.notes = $("#ck-notes").value;
      writeJSON(K.draft, { mode: st.mode, tip: st.tip, name: st.name, address: st.address, notes: st.notes });
    }));

    function refreshTotals() {
      const holder = $(".totals");
      holder.outerHTML = totalsHTML();
      writeJSON(K.draft, { mode: st.mode, tip: st.tip, name: st.name, address: st.address, notes: st.notes });
    }
    function applyPromo(code) {
      code = (code || "").trim().toUpperCase();
      const msg = $("#promo-msg");
      const p = PROMOS[code];
      if (!p) { st.promo = null; msg.textContent = "No such code."; msg.className = "promo-msg bad"; refreshTotals(); return; }
      if (!(p.ok ? p.ok(cartSubtotal()) : true)) { st.promo = null; msg.textContent = p.why || "Not eligible."; msg.className = "promo-msg bad"; refreshTotals(); return; }
      st.promo = code; msg.textContent = p.label; msg.className = "promo-msg good"; refreshTotals();
    }
    $("#apply-promo").addEventListener("click", () => applyPromo($("#ck-promo").value));
    $$(".codechip").forEach((c) => c.addEventListener("click", () => { $("#ck-promo").value = c.dataset.code; applyPromo(c.dataset.code); }));
    $("#back-review").addEventListener("click", stepReview);
    $("#fire-btn").addEventListener("click", () => {
      let ok = true;
      $("#err-name").textContent = ""; if ($("#err-address")) $("#err-address").textContent = "";
      if (!$("#ck-name").value.trim()) { $("#err-name").textContent = "The kitchen needs a name for the ticket."; ok = false; }
      if (st.mode === "delivery" && !$("#ck-address").value.trim()) { $("#err-address").textContent = "Where's it headed?"; ok = false; }
      if (!ok) { toast("Fill in the ticket before it fires."); return; }
      stepTimer();
    });
  }

  function stepTimer() {
    st.step = "timer";
    shell('<div class="timer-step">' +
      '<div class="timer-ring-wrap"><svg viewBox="0 0 120 120"><circle class="timer-ring-bg" cx="60" cy="60" r="50"></circle>' +
      '<circle class="timer-ring-fg" id="ring" cx="60" cy="60" r="50"></circle></svg><div class="timer-num" id="tnum">5</div></div>' +
      '<div class="timer-label" id="tlabel">Firing your order...</div></div>');
    const TOTAL = 5;
    let left = TOTAL;
    const C = 2 * Math.PI * 50;
    const ring = $("#ring");
    ring.style.strokeDasharray = String(C);
    ring.style.strokeDashoffset = "0";
    nudgeQueue(2);
    const iv = setInterval(() => {
      left -= 1;
      ring.style.strokeDashoffset = String(C * ((TOTAL - left) / TOTAL));
      $("#tnum").textContent = String(Math.max(0, left));
      if (left <= 0) { clearInterval(iv); $("#tlabel").textContent = "Order's up!"; setTimeout(stepDone, 400); }
    }, 700);
  }

  function stepDone() {
    const t = totals();
    const num = "#" + String(Math.floor(1000 + Math.random() * 9000));
    const q = queueSnapshot();
    const eta = q.waitMin + (st.mode === "delivery" ? 15 : 0) + 4;
    const order = {
      num: num, at: Date.now(), mode: st.mode, total: t.grand,
      lines: cart.map((l) => JSON.parse(JSON.stringify(l))),
      name: st.name, address: st.address
    };
    const orders = readJSON(K.orders, []);
    orders.unshift(order);
    writeJSON(K.orders, orders.slice(0, 20));
    clearCart();
    localStorage.removeItem(K.draft);
    shell('<div class="confirm-step">' +
      '<svg class="bell-icon" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="26" r="20" fill="#b5292f" stroke="#2a2420" stroke-width="2"/><circle cx="32" cy="50" r="5" fill="#dfe3e6" stroke="#2a2420" stroke-width="2"/><circle cx="32" cy="18" r="3.5" fill="#ffb238"/></svg>' +
      '<h1>Order\'s Up!</h1><div class="order-number">' + num + '</div>' +
      '<p class="eta">' + (st.mode === "delivery" ? "On the road" : "Ready at the window") + ' in about <strong>' + eta + ' minutes</strong>.</p>' +
      '<p class="eta-sub">Paid: ' + money(t.grand) + (st.mode === "delivery" ? " &middot; " + esc(st.address) : "") + '</p>' +
      '<div class="checkout-nav center"><a class="btn-ghost" href="regulars.html">Order history</a><a class="btn-solid" href="index.html">New order' + icon("arrowR") + '</a></div>' +
    '</div>');
    paintCartEverywhere();
  }

  stepReview();
};

/* ---- Regulars + history ---- */
pages.regulars = function () {
  const main = $("#main");
  let tab = location.hash === "#history" ? "history" : "regulars";

  function draw() {
    const favs = regulars.map(findItem).filter(Boolean);
    const orders = readJSON(K.orders, []);
    main.innerHTML =
      '<h1 class="page-title">Regulars</h1>' +
      '<div class="tabs">' +
        '<button type="button" class="tab' + (tab === "regulars" ? " on" : "") + '" data-tab="regulars">Favorites (' + favs.length + ')</button>' +
        '<button type="button" class="tab' + (tab === "history" ? " on" : "") + '" data-tab="history">Order history (' + orders.length + ')</button>' +
      '</div>' +
      (tab === "regulars"
        ? (favs.length
            ? '<div class="rail">' + favs.map(ticketCard).join("") + '</div>'
            : '<p class="empty-note">No Regulars yet. Tap the star on any ticket and it lands here for one-tap ordering.</p>')
        : (orders.length
            ? '<div class="orders">' + orders.map((o, i) =>
                '<div class="order-card">' +
                  '<div class="order-card-top"><strong>' + o.num + '</strong><span>' + new Date(o.at).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) + '</span></div>' +
                  '<p class="order-card-lines">' + o.lines.map((l) => l.qty + "× " + esc(lineName(l))).join(", ") + '</p>' +
                  '<div class="order-card-foot"><span>' + (o.mode === "delivery" ? "Delivery" : "Pickup") + ' &middot; ' + money(o.total) + '</span>' +
                  '<button type="button" class="btn-solid sm" data-reorder="' + i + '">' + icon("repeat") + 'Order again</button></div>' +
                '</div>').join("") +
              '</div><button type="button" class="link-btn" id="clear-history">Clear history</button>'
            : '<p class="empty-note">No orders yet. When you fire one, it shows up here to re-order in a tap.</p>'));

    $$("[data-tab]").forEach((b) => b.addEventListener("click", () => { tab = b.dataset.tab; location.hash = tab === "history" ? "history" : ""; draw(); }));
    bindTicketGrid(main);
    $$("[data-reorder]").forEach((b) => b.addEventListener("click", () => reorder(orders[Number(b.dataset.reorder)])));
    const clr = $("#clear-history");
    if (clr) clr.addEventListener("click", () => { if (confirm("Clear order history?")) { localStorage.removeItem(K.orders); draw(); } });
  }
  draw();
  pageRepaint = draw;
};

/* ============================================================
   INIT
   ============================================================ */
renderChrome();
mountDrawer();
paintQueue();
setInterval(() => { nudgeQueue(); paintQueue(); }, 16000);
paintCartEverywhere();

if (pages[PAGE]) pages[PAGE]();

})();
