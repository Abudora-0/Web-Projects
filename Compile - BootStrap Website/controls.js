/* ══════════════════════════════════════════════════════
   COMPILE - themed <select>

   Bootstrap's .form-select still drops a native, system-blue
   option list. This swaps it for an ink/paper/acid panel that
   matches the zine. The real <select> stays hidden as the value
   store, so any script reading .value or listening for `change`
   keeps working.
   ══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  let closer = null;
  function dismiss() { if (closer) { const c = closer; closer = null; c(); } }

  document.addEventListener('click', (e) => {
    if (closer && !e.target.closest('.cs')) dismiss();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && closer) { e.stopPropagation(); dismiss(); }
  }, true);

  function enhance(sel) {
    if (sel.dataset.cs) return;
    sel.dataset.cs = '1';

    const wrap = document.createElement('div');
    wrap.className = 'cs';
    sel.parentNode.insertBefore(wrap, sel);
    wrap.appendChild(sel);
    sel.classList.add('cs-native');

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'cs-trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    if (sel.getAttribute('aria-label')) trigger.setAttribute('aria-label', sel.getAttribute('aria-label'));
    trigger.innerHTML = '<span class="cs-label"></span>';

    const panel = document.createElement('div');
    panel.className = 'cs-panel';
    panel.setAttribute('role', 'listbox');

    wrap.append(trigger, panel);
    const label = trigger.querySelector('.cs-label');

    [...sel.options].forEach((o, i) => {
      if (o.disabled) return;
      const item = document.createElement('div');
      item.className = 'cs-opt';
      item.setAttribute('role', 'option');
      item.dataset.i = i;
      item.textContent = o.textContent;
      item.addEventListener('click', () => pick(i));
      panel.appendChild(item);
    });

    function sync() {
      const o = sel.options[sel.selectedIndex];
      label.textContent = o ? o.textContent : '';
      trigger.classList.toggle('cs-placeholder', !!(o && (o.disabled || o.value === '')));
      panel.querySelectorAll('.cs-opt').forEach((el) =>
        el.setAttribute('aria-selected', String(+el.dataset.i === sel.selectedIndex)));
    }
    function pick(i) {
      sel.selectedIndex = i;
      sync();
      sel.dispatchEvent(new Event('change', { bubbles: true }));
      close();
      trigger.focus();
    }

    let active = -1;
    function mark() {
      const items = [...panel.querySelectorAll('.cs-opt')];
      items.forEach((el, k) => el.classList.toggle('cs-active', k === active));
      if (items[active]) items[active].scrollIntoView({ block: 'nearest' });
    }
    function step(d) {
      const items = [...panel.querySelectorAll('.cs-opt')];
      if (!items.length) return;
      active = (active + d + items.length) % items.length;
      mark();
    }
    function flip() {
      wrap.classList.remove('cs-flip');
      const r = wrap.getBoundingClientRect();
      const ph = panel.offsetHeight || 240;
      const below = window.innerHeight - r.bottom;
      if (below < ph + 16 && r.top > below) wrap.classList.add('cs-flip');
    }
    function open() {
      dismiss();
      wrap.classList.add('cs-open');
      trigger.setAttribute('aria-expanded', 'true');
      const items = [...panel.querySelectorAll('.cs-opt')];
      active = Math.max(0, items.findIndex((el) => +el.dataset.i === sel.selectedIndex));
      mark();
      flip();
      closer = close;
    }
    function close() {
      wrap.classList.remove('cs-open', 'cs-flip');
      trigger.setAttribute('aria-expanded', 'false');
      if (closer === close) closer = null;
    }

    trigger.addEventListener('click', () => (wrap.classList.contains('cs-open') ? close() : open()));
    trigger.addEventListener('keydown', (e) => {
      const isOpen = wrap.classList.contains('cs-open');
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!isOpen) return open();
        step(e.key === 'ArrowDown' ? 1 : -1);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!isOpen) return open();
        const items = [...panel.querySelectorAll('.cs-opt')];
        if (items[active]) items[active].click();
      } else if (e.key === 'Tab' && isOpen) {
        close();
      }
    });

    /* keep the trigger label in step with a scripted `select.value = x` */
    const vd = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
    Object.defineProperty(sel, 'value', {
      configurable: true,
      get() { return vd.get.call(this); },
      set(v) { vd.set.call(this, v); sync(); }
    });

    sync();
  }

  function boot() {
    document.querySelectorAll('select.form-select, select.cs-enhance').forEach(enhance);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
