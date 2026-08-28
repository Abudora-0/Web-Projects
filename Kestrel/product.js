/* ═══════════════════════════════════════════════
   KESTREL - product.js  (PDP)
   Depends on store.js
   ═══════════════════════════════════════════════ */

// id comes from the hash (#3) - survives serve's clean-url redirects,
// unlike a query string; falls back to ?id= if present.
const pid = location.hash.replace(/^#(id=)?/, '') ||
            new URLSearchParams(location.search).get('id');
const product = productById(pid);
let chosenSize = null;

const pdp = document.getElementById('pdp');

// jumping between pieces (pairs-with) only changes the hash - reload for a clean slate
window.addEventListener('hashchange', () => location.reload());

if (!product) {
  pdp.innerHTML = `
    <div class="pdp-missing">
      <h1>Piece not found</h1>
      <p>That link may be out of date.</p>
      <a class="link-underline" href="index.html#products">Back to the range</a>
    </div>`;
} else {
  render();
}

function render() {
  const p = product;
  document.title = `${p.name} - Kestrel`;
  const onSale = p.was && p.was > p.price;
  const saved = Store.isSaved(p.id);

  pdp.innerHTML = `
    <nav class="crumb">
      <a href="index.html">Home</a> <span>/</span>
      <a href="index.html#products">${CAT_LABEL[p.cat] || 'Shop'}</a> <span>/</span>
      <span class="crumb-here">${p.name}</span>
    </nav>

    <div class="pdp-grid">
      <div class="pdp-media">
        <img src="${p.img.replace('w=800', 'w=1100')}" alt="${p.name} in ${p.colour}"
             onerror="this.onerror=null;this.src='${fallbackImg(p.id)}'" />
      </div>

      <div class="pdp-info">
        <h1 class="pdp-title">${p.name}</h1>
        <p class="pdp-colour">${p.colour}</p>
        <p class="pdp-price">
          <span class="${onSale ? 'is-sale' : ''}">${fmtPrice(p.price)}</span>
          ${onSale ? `<span class="pdp-was">${fmtPrice(p.was)}</span>` : ''}
        </p>

        <p class="pdp-blurb">${p.blurb}</p>

        <div class="pdp-sizes">
          <div class="pdp-sizes-head">
            <span class="pdp-label">Size</span>
            <a href="size-guide.html" class="pdp-guide">Size guide</a>
          </div>
          <div class="size-row" id="sizeRow">
            ${SIZES.map(s => `<button type="button" class="size-btn" data-size="${s}">${s}</button>`).join('')}
          </div>
          <p class="size-error" id="sizeError" hidden>Choose a size first.</p>
        </div>

        <div class="pdp-actions">
          <button class="btn-solid" id="addBtn">Add to bag</button>
          <button class="btn-line ${saved ? 'is-on' : ''}" id="saveBtn">
            <i class="${saved ? 'fas' : 'far'} fa-heart"></i> <span>${saved ? 'Saved' : 'Save'}</span>
          </button>
        </div>

        <dl class="pdp-details">
          <div><dt>Fabric</dt><dd>${p.fabric}</dd></div>
          <div><dt>Care</dt><dd>${p.care} <a class="link-inline" href="care.html">Full care guide</a></dd></div>
          <div><dt>Shipping</dt><dd>Free over Rs 12,000, otherwise Rs 500. Ships in 2-4 days.</dd></div>
          <div><dt>Returns</dt><dd>30 days, unworn with tags. Repairs free for the first year.</dd></div>
        </dl>
      </div>
    </div>`;

  const sizeRow  = document.getElementById('sizeRow');
  const sizeErr  = document.getElementById('sizeError');

  sizeRow.addEventListener('click', e => {
    const btn = e.target.closest('.size-btn');
    if (!btn) return;
    chosenSize = btn.dataset.size;
    sizeRow.querySelectorAll('.size-btn').forEach(b => b.classList.toggle('chosen', b === btn));
    sizeErr.hidden = true;
  });

  document.getElementById('addBtn').addEventListener('click', () => {
    if (!chosenSize) { sizeErr.hidden = false; return; }
    Store.addToBag(p.id, chosenSize, 1);
    showToast(`Added - ${p.name}, ${chosenSize}`);
  });

  document.getElementById('saveBtn').addEventListener('click', e => {
    const added = Store.toggleSaved(p.id);
    const b = e.currentTarget;
    b.classList.toggle('is-on', added);
    b.querySelector('i').className = added ? 'fas fa-heart' : 'far fa-heart';
    b.querySelector('span').textContent = added ? 'Saved' : 'Save';
  });

  document.getElementById('sizeError').hidden = true;
  renderPairs();
}

function renderPairs() {
  const pool = PRODUCTS.filter(x => x.id !== product.id);
  // same category first, then fill from the rest
  const same = pool.filter(x => x.cat === product.cat);
  const rest = pool.filter(x => x.cat !== product.cat);
  const picks = [...same, ...rest].slice(0, 4);

  const sec = document.getElementById('pairsSec');
  document.getElementById('pairsRow').innerHTML = picks.map(miniCardHTML).join('');
  sec.hidden = false;
}
