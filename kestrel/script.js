/* ═══════════════════════════════════════════════
   KESTREL - script.js  (home)
   Depends on store.js
   ═══════════════════════════════════════════════ */

let currentFilter = 'all';

// ── Render products ───────────────────────────────────
function renderProducts(filter = 'all') {
  const grid = document.getElementById('productsGrid');
  const data = filter === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.cat === filter);

  grid.innerHTML = data.map(p => {
    const onSale = p.was && p.was > p.price;
    const off = onSale ? Math.round((1 - p.price / p.was) * 100) : 0;
    const saved = Store.isSaved(p.id);
    return `
    <article class="prod-card" data-id="${p.id}">
      <a class="prod-img-wrap" href="${productHref(p.id)}">
        <img src="${p.img}" alt="${p.name} in ${p.colour}" loading="lazy"
             onerror="this.onerror=null;this.src='${fallbackImg(p.id)}'" />
        ${onSale ? `<span class="prod-badge">Archive &minus;${off}%</span>` : ''}
        <div class="prod-hover-actions"><span class="prod-view">View product</span></div>
      </a>
      <button class="wishlist-btn ${saved ? 'wishlisted' : ''}" data-id="${p.id}" aria-label="Save ${p.name}">
        <i class="${saved ? 'fas' : 'far'} fa-heart"></i>
      </button>
      <a class="prod-info" href="${productHref(p.id)}">
        <div class="prod-name">${p.name}</div>
        <div class="prod-colour">${p.colour}</div>
        <div class="prod-price-row">
          <span class="prod-price ${onSale ? 'is-sale' : ''}">${fmtPrice(p.price)}</span>
          ${onSale ? `<span class="prod-was">${fmtPrice(p.was)}</span>` : ''}
        </div>
      </a>
    </article>`;
  }).join('');

  grid.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      const id = +btn.dataset.id;
      const added = Store.toggleSaved(id);
      btn.classList.toggle('wishlisted', added);
      btn.querySelector('i').className = added ? 'fas fa-heart' : 'far fa-heart';
      showToast(added ? 'Saved' : 'Removed from saved');
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

document.querySelectorAll('.cat-card[data-filter]').forEach(card => {
  card.addEventListener('click', e => {
    e.preventDefault();
    setFilter(card.dataset.filter);
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
  });
});

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
  const end = Date.now() + 18 * 3600 * 1000;
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

// ── Navbar shadow on scroll ───────────────────────────
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', scrollY > 4);
}, { passive: true });

// ── Init ──────────────────────────────────────────────
renderProducts('all');
