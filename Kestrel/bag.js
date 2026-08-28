/* ═══════════════════════════════════════════════
   KESTREL - bag.js
   Depends on store.js
   ═══════════════════════════════════════════════ */

const layout = document.getElementById('bagLayout');

function render() {
  const bag = Store.bag();

  if (!bag.length) {
    layout.innerHTML = `
      <div class="bag-empty">
        <p class="bag-empty-lead">Your bag is empty.</p>
        <a class="btn-solid" href="index.html#products">Shop the range</a>
      </div>`;
    return;
  }

  const lines = bag.map(l => {
    const p = productById(l.id);
    if (!p) return '';
    return `
      <div class="bag-line" data-id="${l.id}" data-size="${l.size}">
        <a class="bag-line-img" href="${productHref(p.id)}">
          <img src="${p.img}" alt="${p.name}" onerror="this.src='${FALLBACK_IMG}'">
        </a>
        <div class="bag-line-body">
          <div class="bag-line-top">
            <div>
              <a class="bag-line-name" href="${productHref(p.id)}">${p.name}</a>
              <div class="bag-line-meta">${p.colour} &middot; Size ${l.size}</div>
            </div>
            <button class="bag-line-x" data-act="remove" aria-label="Remove">
              <i class="fas fa-xmark"></i>
            </button>
          </div>
          <div class="bag-line-bottom">
            <div class="qty">
              <button data-act="dec" aria-label="Decrease quantity">&minus;</button>
              <span class="qty-n">${l.qty}</span>
              <button data-act="inc" aria-label="Increase quantity">+</button>
            </div>
            <div class="bag-line-price">${fmtPrice(p.price * l.qty)}</div>
          </div>
        </div>
      </div>`;
  }).join('');

  const sub  = Store.subtotal();
  const ship = Store.shipping();
  const tot  = Store.total();
  const toFree = FREE_SHIP_OVER - sub;

  layout.innerHTML = `
    <div class="bag-lines">${lines}</div>

    <aside class="bag-summary">
      <h2>Summary</h2>
      <div class="sum-row"><span>Subtotal</span><span>${fmtPrice(sub)}</span></div>
      <div class="sum-row">
        <span>Shipping</span>
        <span>${ship === 0 ? 'Free' : fmtPrice(ship)}</span>
      </div>
      ${ship > 0 && toFree > 0
        ? `<p class="sum-hint">Rs ${toFree.toLocaleString('en-PK')} more for free shipping.</p>` : ''}
      <div class="sum-row sum-total"><span>Total</span><span>${fmtPrice(tot)}</span></div>
      <button class="btn-solid bag-checkout" id="checkoutBtn">Proceed to checkout</button>
      <a class="bag-cont" href="index.html#products">Continue shopping</a>
      <p class="bag-note">Taxes calculated at checkout. This is a demo &mdash; no payment is taken.</p>
    </aside>`;

  layout.querySelectorAll('.bag-line').forEach(row => {
    const id = +row.dataset.id;
    const size = row.dataset.size;
    row.addEventListener('click', e => {
      const btn = e.target.closest('[data-act]');
      if (!btn) return;
      const line = Store.bag().find(l => l.id === id && l.size === size);
      if (!line) return;
      if (btn.dataset.act === 'inc')    Store.setQty(id, size, line.qty + 1);
      if (btn.dataset.act === 'dec')    Store.setQty(id, size, line.qty - 1);
      if (btn.dataset.act === 'remove') Store.removeLine(id, size);
    });
  });

  document.getElementById('checkoutBtn').addEventListener('click', () => {
    showToast('Checkout is a demo on this project');
  });
}

render();
document.addEventListener('kestrel:store', render);
