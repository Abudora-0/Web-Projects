/* ═════════════════════════════════════════════════════════
   CASHBOOK - custom form controls

   The native <select> pop-up (system-blue highlight, white rows)
   and the native date picker ignore the ledger palette. Both are
   rebuilt here from paper, ink and the red margin rule.

   The real <select> / <input> elements stay in the DOM as the
   value store, so script.js is untouched: reading `.value` and
   listening for `change` behave exactly as before.
   ═════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const DOW = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const pad = (n) => String(n).padStart(2, '0');

  /* one popup open at a time; store its closer */
  let closeOpenPopup = null;
  function dismiss() { if (closeOpenPopup) { const c = closeOpenPopup; closeOpenPopup = null; c(); } }

  /* open upward when the panel would fall off the bottom and there's
     more headroom above the field than below it */
  function flipIfNeeded(wrap, panel, flipClass) {
    wrap.classList.remove(flipClass);
    const r = wrap.getBoundingClientRect();
    const ph = panel.offsetHeight || 280;
    const below = window.innerHeight - r.bottom;
    const above = r.top;
    if (below < ph + 14 && above > below) wrap.classList.add(flipClass);
  }

  document.addEventListener('click', (e) => {
    if (closeOpenPopup && !e.target.closest('.cb, .dp')) dismiss();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && closeOpenPopup) { e.stopPropagation(); dismiss(); }
  }, true);

  /* ─────────────────────────────  SELECT  ───────────────────────────── */
  function enhanceSelect(sel) {
    if (sel.dataset.enhanced) return;
    sel.dataset.enhanced = '1';

    const wrap = sel.closest('.select-wrap') || sel.parentElement;
    wrap.classList.add('cb');
    sel.classList.add('cb-native');
    sel.removeAttribute('required'); // always has a value; hidden + required is a trap

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'cb-trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    if (sel.getAttribute('aria-label')) trigger.setAttribute('aria-label', sel.getAttribute('aria-label'));
    if (sel.title) trigger.title = sel.title;
    trigger.innerHTML = '<span class="cb-value"></span><span class="cb-caret" aria-hidden="true"></span>';

    const panel = document.createElement('div');
    panel.className = 'cb-panel';
    panel.setAttribute('role', 'listbox');

    wrap.append(trigger, panel);
    const valueEl = trigger.querySelector('.cb-value');
    let activeIdx = -1;

    function syncValue() {
      const o = sel.options[sel.selectedIndex];
      valueEl.textContent = o ? o.textContent : '';
      panel.querySelectorAll('.cb-opt').forEach((el) =>
        el.setAttribute('aria-selected', String(+el.dataset.i === sel.selectedIndex)));
    }

    function buildList() {
      panel.innerHTML = '';
      [...sel.options].forEach((o, i) => {
        const item = document.createElement('div');
        item.className = 'cb-opt';
        item.setAttribute('role', 'option');
        item.dataset.i = i;
        item.textContent = o.textContent;
        item.addEventListener('click', () => { pick(i); });
        panel.appendChild(item);
      });
      syncValue();
    }

    function pick(i) {
      sel.selectedIndex = i;
      syncValue();
      sel.dispatchEvent(new Event('change', { bubbles: true }));
      close();
      trigger.focus();
    }

    function markActive() {
      panel.querySelectorAll('.cb-opt').forEach((el, i) =>
        el.classList.toggle('cb-active', i === activeIdx));
      if (activeIdx >= 0 && panel.children[activeIdx])
        panel.children[activeIdx].scrollIntoView({ block: 'nearest' });
    }
    function moveActive(d) {
      const n = sel.options.length;
      if (!n) return;
      activeIdx = ((activeIdx < 0 ? sel.selectedIndex : activeIdx) + d + n) % n;
      markActive();
    }

    function open() {
      dismiss();
      wrap.classList.add('cb-open');
      trigger.setAttribute('aria-expanded', 'true');
      flipIfNeeded(wrap, panel, 'cb-flip');
      activeIdx = sel.selectedIndex;
      markActive();
      closeOpenPopup = close;
    }
    function close() {
      wrap.classList.remove('cb-open', 'cb-flip');
      trigger.setAttribute('aria-expanded', 'false');
      if (closeOpenPopup === close) closeOpenPopup = null;
    }

    trigger.addEventListener('click', () => {
      wrap.classList.contains('cb-open') ? close() : open();
    });
    trigger.addEventListener('keydown', (e) => {
      const isOpen = wrap.classList.contains('cb-open');
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault(); e.stopPropagation();
        if (!isOpen) return open();
        moveActive(e.key === 'ArrowDown' ? 1 : -1);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault(); e.stopPropagation();
        if (!isOpen) return open();
        if (activeIdx >= 0) pick(activeIdx);
      } else if (e.key === 'Tab' && isOpen) {
        close();
      } else if (/^[a-z0-9$€£₹¥₨]$/i.test(e.key) && isOpen) {
        const k = e.key.toLowerCase();
        const hit = [...sel.options].findIndex((o) => o.textContent.trim().toLowerCase().startsWith(k));
        if (hit >= 0) { activeIdx = hit; markActive(); }
      }
    });

    /* intercept `select.value = x` (no event) so the label keeps up */
    const vDesc = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
    Object.defineProperty(sel, 'value', {
      configurable: true,
      get() { return vDesc.get.call(this); },
      set(v) { vDesc.set.call(this, v); syncValue(); }
    });

    /* rebuild when script.js repopulates `select.innerHTML` */
    new MutationObserver(buildList).observe(sel, { childList: true });

    buildList();
  }

  /* ───────────────────────────  DATE PICKER  ─────────────────────────── */
  function enhanceDate(input) {
    if (input.dataset.enhanced) return;
    input.dataset.enhanced = '1';

    if (input.type === 'date') input.type = 'text';
    input.readOnly = true;
    input.autocomplete = 'off';
    input.setAttribute('inputmode', 'none');
    const allowClear = !input.required;

    const wrap = document.createElement('span');
    wrap.className = 'dp';
    input.parentNode.insertBefore(wrap, input);
    wrap.appendChild(input);
    input.classList.add('dp-input');

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'dp-btn';
    btn.setAttribute('aria-label', 'Choose a date');
    btn.innerHTML =
      '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="2" stroke-linecap="round"><rect x="3" y="4.5" width="18" height="16" rx="2"/>' +
      '<path d="M3 9.5h18M8 2.5v4M16 2.5v4"/></svg>';

    const panel = document.createElement('div');
    panel.className = 'dp-panel';
    wrap.append(btn, panel);

    let iso = input.getAttribute('value') || '';
    let viewY, viewM;

    const fmtDisplay = (s) => {
      if (!s) return '';
      const [y, m, d] = s.split('-').map(Number);
      return `${d} ${MONTHS[m - 1].slice(0, 3)} ${y}`;
    };

    /* .value speaks ISO to script.js; the field shows a friendly date */
    const vDesc = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
    const showDisplay = () => vDesc.set.call(input, fmtDisplay(iso));
    Object.defineProperty(input, 'value', {
      configurable: true,
      get() { return iso; },
      set(v) { iso = v || ''; showDisplay(); }
    });
    showDisplay();

    function commit(next, fire) {
      iso = next || '';
      showDisplay();
      if (fire) input.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function build() {
      const today = new Date();
      const start = new Date(viewY, viewM, 1).getDay();
      const dim = new Date(viewY, viewM + 1, 0).getDate();
      let h = `<div class="dp-head">
        <button type="button" class="dp-nav" data-d="-1" aria-label="Previous month">&lsaquo;</button>
        <span class="dp-title">${MONTHS[viewM]} ${viewY}</span>
        <button type="button" class="dp-nav" data-d="1" aria-label="Next month">&rsaquo;</button>
      </div><div class="dp-grid">`;
      DOW.forEach((d) => { h += `<span class="dp-dow">${d}</span>`; });
      for (let i = 0; i < start; i++) h += '<span></span>';
      for (let d = 1; d <= dim; d++) {
        const cell = `${viewY}-${pad(viewM + 1)}-${pad(d)}`;
        const cls = ['dp-day'];
        if (cell === iso) cls.push('dp-sel');
        if (viewY === today.getFullYear() && viewM === today.getMonth() && d === today.getDate())
          cls.push('dp-today');
        h += `<button type="button" class="${cls.join(' ')}" data-iso="${cell}">${d}</button>`;
      }
      h += `</div><div class="dp-foot">
        ${allowClear ? '<button type="button" class="dp-link" data-act="clear">Clear</button>' : '<span></span>'}
        <button type="button" class="dp-link" data-act="today">Today</button>
      </div>`;
      panel.innerHTML = h;
    }

    function open() {
      dismiss();
      const base = iso ? iso.split('-').map(Number) : null;
      const now = new Date();
      viewY = base ? base[0] : now.getFullYear();
      viewM = base ? base[1] - 1 : now.getMonth();
      build();
      wrap.classList.add('dp-open');
      flipIfNeeded(wrap, panel, 'dp-flip');
      closeOpenPopup = close;
    }
    function close() {
      wrap.classList.remove('dp-open', 'dp-flip');
      if (closeOpenPopup === close) closeOpenPopup = null;
    }

    const toggle = () => (wrap.classList.contains('dp-open') ? close() : open());
    btn.addEventListener('click', toggle);
    input.addEventListener('click', toggle);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') { e.preventDefault(); open(); }
    });

    panel.addEventListener('click', (e) => {
      const nav = e.target.closest('.dp-nav');
      if (nav) {
        viewM += Number(nav.dataset.d);
        if (viewM < 0) { viewM = 11; viewY--; }
        if (viewM > 11) { viewM = 0; viewY++; }
        build();
        return;
      }
      const day = e.target.closest('.dp-day');
      if (day) { commit(day.dataset.iso, true); close(); return; }
      const link = e.target.closest('.dp-link');
      if (link) {
        if (link.dataset.act === 'clear') commit('', true);
        else {
          const t = new Date();
          commit(`${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`, true);
        }
        close();
      }
    });
  }

  /* ───────────────────────────────  BOOT  ──────────────────────────────── */
  function boot() {
    document.querySelectorAll('.select-wrap > select').forEach(enhanceSelect);
    document.querySelectorAll('#entryDate, input.js-datepicker').forEach(enhanceDate);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
