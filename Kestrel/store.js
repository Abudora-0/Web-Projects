/* ═══════════════════════════════════════════════
   KESTREL - store.js
   Shared across every page: the range, the bag,
   saved items, formatting, nav badges, toasts.
   ═══════════════════════════════════════════════ */

const U = (id, w = 800, q = 70) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=${q}`;

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=60';

const PRODUCTS = [
  { id: 1,  name: 'The Camden Overshirt',        cat: 'outerwear',   img: U('photo-1602810318383-e386cc2a3ccf'), price: 8900,  was: 0,     colour: 'Tobacco',
    fabric: '11 oz cotton moleskin, brushed both sides', care: 'Machine wash cold, hang to dry, warm iron.',
    blurb: 'A shirt with the presence of a jacket. Cut a touch long, with a chest patch pocket and corozo buttons. Softens with every wash.' },
  { id: 2,  name: 'Balmacaan Wool Coat',         cat: 'outerwear',   img: U('photo-1544022613-e87ca75a784a'),     price: 32000, was: 38000, colour: 'Stone',
    fabric: '80% Italian wool, 20% cashmere, 620 gsm', care: 'Dry clean only. Brush after wear.',
    blurb: 'Raglan shoulders, a full canvas, and a body long enough to sit over a suit. The one coat that ends the search.' },
  { id: 3,  name: 'The Workhorse Denim Jacket',  cat: 'denim',       img: U('photo-1551028719-00167b16eac5'),     price: 11500, was: 0,     colour: 'Rinsed Indigo',
    fabric: '13.5 oz Japanese selvedge denim', care: 'Wash rarely, cold, inside out.',
    blurb: 'A type-III cut with a slightly dropped shoulder. Rigid at first, then it becomes yours.' },
  { id: 4,  name: 'Merino Crew',                 cat: 'knitwear',    img: U('photo-1576566588028-4147f3842f27'),  price: 7500,  was: 0,     colour: 'Oat',
    fabric: 'Extra-fine merino, 18.5 micron', care: 'Hand wash cool or wool cycle. Dry flat.',
    blurb: 'A mid-weight crew that holds its shape. Ribbed cuffs and hem, a clean set-in sleeve.' },
  { id: 5,  name: 'Lambswool Sweater',           cat: 'knitwear',    img: U('photo-1620799140408-edc6dcb6d633'),  price: 8900,  was: 0,     colour: 'Moss',
    fabric: 'British lambswool, 7-gauge', care: 'Hand wash cool. Dry flat, reshape damp.',
    blurb: 'Knitted in a Scottish mill that has been at it for a century. Warm without weight.' },
  { id: 6,  name: 'Shawl-Collar Cardigan',       cat: 'knitwear',    img: U('photo-1434389677669-e08b4cac3105'),  price: 12500, was: 16000, colour: 'Charcoal',
    fabric: 'Lambswool and nylon, chunky 5-gauge', care: 'Hand wash cool. Dry flat.',
    blurb: 'A heavyweight cardigan with a rolled shawl collar and horn buttons. Wear it as outerwear indoors.' },
  { id: 7,  name: 'Oxford Shirt',                cat: 'shirts',      img: U('photo-1596755094514-f87e34085b2c'),  price: 5900,  was: 0,     colour: 'White',
    fabric: '140 gsm cotton oxford, button-down collar', care: 'Machine wash warm. Iron damp.',
    blurb: 'The one you reach for. A roomy but not boxy body, a collar with the right amount of roll.' },
  { id: 8,  name: 'Heavyweight Tee',             cat: 'shirts',      img: U('photo-1521572163474-6864f9cf17ab'),  price: 3200,  was: 0,     colour: 'Bone',
    fabric: '240 gsm combed cotton, tubular knit', care: 'Machine wash cold. Tumble low.',
    blurb: 'A tee with structure. Ribbed collar that won’t stretch out, a hem that sits where it should.' },
  { id: 9,  name: 'Pleated Wide Trouser',        cat: 'trousers',    img: U('photo-1594633312681-425c7b97ccd1'),  price: 8500,  was: 0,     colour: 'Charcoal',
    fabric: 'Wool-blend flannel, 320 gsm', care: 'Dry clean or cold hand wash.',
    blurb: 'A single forward pleat, a wide straight leg, and a proper waistband. Cut to break just once on the shoe.' },
  { id: 10, name: 'Twill Chino',                 cat: 'trousers',    img: U('photo-1473966968600-fa801b869a1a'),  price: 6500,  was: 8500,  colour: 'Stone',
    fabric: '10 oz cotton twill, garment dyed', care: 'Machine wash cold. Hang to dry.',
    blurb: 'A slim-straight chino with a slightly cropped leg. Softened and dyed after it’s made.' },
  { id: 11, name: 'Selvedge Straight Jean',      cat: 'denim',       img: U('photo-1542272604-787c3835535d'),     price: 9800,  was: 0,     colour: 'Raw Indigo',
    fabric: '14 oz unwashed selvedge denim', care: 'First wash after six months, cold, inside out.',
    blurb: 'A true straight leg with a mid rise. Rigid indigo that fades to your own map.' },
  { id: 12, name: 'Canvas Weekender Tote',       cat: 'accessories', img: U('photo-1553062407-98eeb64c6a62'),     price: 5500,  was: 0,     colour: 'Natural',
    fabric: '18 oz cotton canvas, leather handles', care: 'Spot clean. It is meant to age.',
    blurb: 'Big enough for two days away. Bridle-leather handles and a single inner pocket. Nothing else.' },
];

const CAT_LABEL = {
  all: 'New In', outerwear: 'Outerwear', knitwear: 'Knitwear',
  shirts: 'Shirts', trousers: 'Trousers', denim: 'Denim', accessories: 'Accessories',
};

const SIZES = ['XS', 'S', 'M', 'L', 'XL'];
const FREE_SHIP_OVER = 12000;
const FLAT_SHIP = 500;

const productById = id => PRODUCTS.find(p => p.id === +id);
const fmtPrice = n => 'Rs ' + Number(n).toLocaleString('en-PK');

/* ── Persistence ───────────────────────────────────── */
const LS_BAG   = 'kestrel.bag';     // [{ id, size, qty }]
const LS_SAVED = 'kestrel.saved';   // [id, id, ...]

function _get(key, fb) { try { return JSON.parse(localStorage.getItem(key)) ?? fb; } catch { return fb; } }
function _set(key, v)   { try { localStorage.setItem(key, JSON.stringify(v)); } catch {} }

const Store = {
  bag()   { return _get(LS_BAG, []); },
  saved() { return _get(LS_SAVED, []); },

  bagCount()  { return this.bag().reduce((n, l) => n + l.qty, 0); },
  savedCount() { return this.saved().length; },

  addToBag(id, size, qty = 1) {
    const bag = this.bag();
    const line = bag.find(l => l.id === +id && l.size === size);
    if (line) line.qty += qty;
    else bag.push({ id: +id, size, qty });
    _set(LS_BAG, bag);
    this._sync();
  },
  setQty(id, size, qty) {
    let bag = this.bag();
    if (qty <= 0) bag = bag.filter(l => !(l.id === +id && l.size === size));
    else { const l = bag.find(l => l.id === +id && l.size === size); if (l) l.qty = qty; }
    _set(LS_BAG, bag);
    this._sync();
  },
  removeLine(id, size) {
    _set(LS_BAG, this.bag().filter(l => !(l.id === +id && l.size === size)));
    this._sync();
  },

  isSaved(id) { return this.saved().includes(+id); },
  toggleSaved(id) {
    const s = this.saved();
    const i = s.indexOf(+id);
    if (i === -1) s.push(+id); else s.splice(i, 1);
    _set(LS_SAVED, s);
    this._sync();
    return i === -1;
  },

  subtotal() {
    return this.bag().reduce((sum, l) => {
      const p = productById(l.id);
      return sum + (p ? p.price * l.qty : 0);
    }, 0);
  },
  shipping() {
    const st = this.subtotal();
    return st === 0 || st >= FREE_SHIP_OVER ? 0 : FLAT_SHIP;
  },
  total() { return this.subtotal() + this.shipping(); },

  _sync() {
    updateNavBadges();
    document.dispatchEvent(new CustomEvent('kestrel:store'));
  },
};

/* ── Nav badges (every page has the nav) ───────────── */
function updateNavBadges() {
  const b = document.getElementById('bagCount');
  const w = document.getElementById('wishlistCount');
  const wi = document.getElementById('wishlistIcon');
  if (b) { b.textContent = Store.bagCount(); b.classList.toggle('show', Store.bagCount() > 0); }
  if (w) { w.textContent = Store.savedCount(); w.classList.toggle('show', Store.savedCount() > 0); }
  if (wi) wi.className = Store.savedCount() > 0 ? 'fas fa-heart' : 'far fa-heart';
}

/* ── Toast ─────────────────────────────────────────── */
let _toastT = null;
function showToast(msg) {
  let el = document.getElementById('toast');
  if (!el) { el = document.createElement('div'); el.id = 'toast'; el.className = 'toast'; document.body.appendChild(el); }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(_toastT);
  _toastT = setTimeout(() => el.classList.remove('show'), 2200);
}

/* ── Shared mini-card ──────────────────────────────── */
const productHref = id => `product.html#${id}`;

function miniCardHTML(p) {
  return `
  <a class="mini" href="${productHref(p.id)}">
    <div class="mini-img"><img src="${p.img}" alt="${p.name}" loading="lazy"
      onerror="this.src='${FALLBACK_IMG}'"></div>
    <div class="mini-name">${p.name}</div>
    <div class="mini-price">${fmtPrice(p.price)}</div>
  </a>`;
}

document.addEventListener('DOMContentLoaded', updateNavBadges);
