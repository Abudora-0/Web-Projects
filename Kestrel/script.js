/* ═══════════════════════════════════════════════
   Kestrel - script.js
   ═══════════════════════════════════════════════ */

const U = (id, w = 600, q = 68) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=${q}`;

// ── The range ────────────────────────────────────────
const PRODUCTS = [
  { id: 1,  name: 'The Camden Overshirt',        cat: 'outerwear',   img: U('photo-1602810318383-e386cc2a3ccf'), price: 6900,  was: 0,     colour: 'Tobacco' },
  { id: 2,  name: 'Balmacaan Wool Coat',         cat: 'outerwear',   img: U('photo-1544022613-e87ca75a784a'),     price: 16500, was: 19000, colour: 'Stone' },
  { id: 3,  name: 'The Workhorse Denim Jacket',  cat: 'denim',       img: U('photo-1551028719-00167b16eac5'),     price: 7800,  was: 0,     colour: 'Rinsed Indigo' },
  { id: 4,  name: 'Merino Crew',                 cat: 'knitwear',    img: U('photo-1576566588028-4147f3842f27'),  price: 4200,  was: 0,     colour: 'Oat' },
  { id: 5,  name: 'Lambswool Sweater',           cat: 'knitwear',    img: U('photo-1620799140408-edc6dcb6d633'),  price: 4900,  was: 0,     colour: 'Moss' },
  { id: 6,  name: 'Shawl-Collar Cardigan',       cat: 'knitwear',    img: U('photo-1434389677669-e08b4cac3105'),  price: 6400,  was: 8200,  colour: 'Charcoal' },
  { id: 7,  name: 'Oxford Shirt',                cat: 'shirts',      img: U('photo-1596755094514-f87e34085b2c'),  price: 3600,  was: 0,     colour: 'White' },
  { id: 8,  name: 'Heavyweight Tee',             cat: 'shirts',      img: U('photo-1521572163474-6864f9cf17ab'),  price: 1900,  was: 0,     colour: 'Bone' },
  { id: 9,  name: 'Pleated Wide Trouser',        cat: 'trousers',    img: U('photo-1594633312681-425c7b97ccd1'),  price: 5400,  was: 0,     colour: 'Charcoal' },
  { id: 10, name: 'Twill Chino',                 cat: 'trousers',    img: U('photo-1473966968600-fa801b869a1a'),  price: 3900,  was: 4900,  colour: 'Stone' },
  { id: 11, name: 'Selvedge Straight Jean',      cat: 'denim',       img: U('photo-1542272604-787c3835535d'),     price: 5800,  was: 0,     colour: 'Raw Indigo' },
  { id: 12, name: 'Canvas Weekender Tote',       cat: 'accessories', img: U('photo-1553062407-98eeb64c6a62'),     price: 3200,  was: 0,     colour: 'Natural' },
];

const CAT_LABEL = {
  all: 'New In', outerwear: 'Outerwear', knitwear: 'Knitwear',
  shirts: 'Shirts', trousers: 'Trousers', denim: 'Denim', accessories: 'Accessories',
};

// ── State ─────────────────────────────────────────────
const wishlist = new Set();
const bag      = [];
let   currentFilter = 'all';

const rupees = n => '₹' + n.toLocaleString('en-IN');

// ── Render products ───────────────────────────────────
function renderProducts(filter = 'all') {
  const grid = document.getElementById('productsGrid');
  const data = filter === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.cat === filter);

  grid.innerHTML = data.map(p => {
    const onSale = p.was && p.was > p.price;
    const off = onSale ? Math.round((1 - p.price / p.was) * 100) : 0;
    const wl  = wishlist.has(p.id);
    return `
    <article class="prod-card" data-id="${p.id}">
      <div class="prod-img-wrap">
        <img src="${p.img}" alt="${p.name} in ${p.colour}" loading="lazy"
             onerror="this.src='https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=60'" />
        ${onSale ? `<span class="prod-badge">Archive &minus;${off}%</span>` : ''}
        <button class="wishlist-btn ${wl ? 'wishlisted' : ''}" data-id="${p.id}" aria-label="Save ${p.name}">
          <i class="${wl ? 'fas' : 'far'} fa-heart"></i>
        </button>
        <div class="prod-hover-actions">
          <button class="add-bag-btn" data-id="${p.id}">Add to bag</button>
        </div>
      </div>
      <div class="prod-info">
        <div class="prod-name">${p.name}</div>
        <div class="prod-colour">${p.colour}</div>
        <div class="prod-price-row">
          <span class="prod-price ${onSale ? 'is-sale' : ''}">${rupees(p.price)}</span>
          ${onSale ? `<span class="prod-was">${rupees(p.was)}</span>` : ''}
        </div>
      </div>
    </article>`;
  }).join('');

  grid.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = +btn.dataset.id;
      if (wishlist.has(id)) {
        wishlist.delete(id);
        btn.classList.remove('wishlisted');
        btn.querySelector('i').className = 'far fa-heart';
        showToast('Removed from saved');
      } else {
        wishlist.add(id);
        btn.classList.add('wishlisted');
        btn.querySelector('i').className = 'fas fa-heart';
        showToast('Saved');
      }
      updateBadges();
    });
  });

  grid.querySelectorAll('.add-bag-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = +btn.dataset.id;
      if (!bag.includes(id)) bag.push(id);
      updateBadges();
      showToast('Added to bag');
    });
  });
}

// ── Filters ───────────────────────────────────────────
function setFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll('.filter-chip').forEach(c =>
    c.classList.toggle('active-chip', c.dataset.filter === filter));
  const head = document.querySelector('.products-sec .section-head h2');
  if (head) head.textContent = CAT_LABEL[filter] || 'New In';
  renderProducts(filter);
}

document.querySelectorAll('.filter-chip').forEach(chip => {
  chip.addEventListener('click', () => setFilter(chip.dataset.filter));
});

// Collection cards jump to the grid pre-filtered
document.querySelectorAll('.cat-card[data-filter]').forEach(card => {
  card.addEventListener('click', e => {
    e.preventDefault();
    setFilter(card.dataset.filter);
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
  });
});

// ── Badges ────────────────────────────────────────────
function updateBadges() {
  const wBadge = document.getElementById('wishlistCount');
  const bBadge = document.getElementById('bagCount');
  wBadge.textContent = wishlist.size;
  bBadge.textContent = bag.length;
  wBadge.classList.toggle('show', wishlist.size > 0);
  bBadge.classList.toggle('show', bag.length > 0);
  document.getElementById('wishlistIcon').className = wishlist.size > 0 ? 'fas fa-heart' : 'far fa-heart';
}

// ── Carousel ──────────────────────────────────────────
(function () {
  const slides   = document.getElementById('slides');
  const dotsWrap = document.getElementById('carouselDots');
  const count    = slides.children.length;
  let   idx      = 0;

  for (let i = 0; i < count; i++) {
    const d = document.createElement('button');
    d.className = 'c-dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', `Slide ${i + 1}`);
    d.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(d);
  }

  function goTo(n) {
    idx = (n + count) % count;
    slides.style.transform = `translateX(-${idx * 100}%)`;
    dotsWrap.querySelectorAll('.c-dot').forEach((d, i) => d.classList.toggle('active', i === idx));
  }

  document.getElementById('prevBtn').addEventListener('click', () => goTo(idx - 1));
  document.getElementById('nextBtn').addEventListener('click', () => goTo(idx + 1));

  let auto = setInterval(() => goTo(idx + 1), 5500);
  const stage = slides.parentElement;
  stage.addEventListener('mouseenter', () => clearInterval(auto));
  stage.addEventListener('mouseleave', () => { auto = setInterval(() => goTo(idx + 1), 5500); });
})();

// ── Archive timer ─────────────────────────────────────
(function () {
  const end = Date.now() + 18 * 3600 * 1000;   // an 18-hour window
  function tick() {
    const diff = Math.max(0, end - Date.now());
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    document.getElementById('sHours').textContent = String(h).padStart(2, '0');
    document.getElementById('sMins').textContent  = String(m).padStart(2, '0');
    document.getElementById('sSecs').textContent  = String(s).padStart(2, '0');
    if (diff > 0) setTimeout(tick, 1000);
  }
  tick();
})();

// ── Newsletter ────────────────────────────────────────
document.getElementById('nlForm')?.addEventListener('submit', e => {
  e.preventDefault();
  e.target.reset();
  showToast('You’re on the list');
});

// ── Toast ─────────────────────────────────────────────
let _tt = null;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(_tt);
  _tt = setTimeout(() => el.classList.remove('show'), 2200);
}

// ── Navbar shadow on scroll ───────────────────────────
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', scrollY > 4);
}, { passive: true });

// ── Init ──────────────────────────────────────────────
renderProducts('all');
