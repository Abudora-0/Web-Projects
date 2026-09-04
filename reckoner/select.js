/* ==========================================================
   Themed <select> - a hidden native select stays the value
   store; a button + animated panel sit on top. Reading
   .value or listening for `change` keeps working.
   Opt in with class "sel-enhance"; add data-sel-search for a
   filter box (long lists). Rebuilds if the <select>'s
   options are rewritten.
   ========================================================== */
(function () {
  "use strict";

  const RENDER_CAP = 80;
  let closer = null;
  function dismiss() { if (closer) { const c = closer; closer = null; c(); } }

  document.addEventListener("click", (e) => {
    if (closer && !e.target.closest(".sel")) dismiss();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && closer) { e.stopPropagation(); dismiss(); }
  }, true);

  function enhance(sel) {
    if (sel.dataset.sel) return;
    sel.dataset.sel = "1";
    const withSearch = sel.hasAttribute("data-sel-search");

    const wrap = document.createElement("div");
    wrap.className = "sel";
    sel.parentNode.insertBefore(wrap, sel);
    wrap.appendChild(sel);
    sel.classList.add("sel-native");

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "sel-trigger";
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");
    if (sel.getAttribute("aria-label")) trigger.setAttribute("aria-label", sel.getAttribute("aria-label"));
    trigger.innerHTML = '<span class="sel-label"></span><span class="sel-caret" aria-hidden="true"></span>';

    const panel = document.createElement("div");
    panel.className = "sel-panel";
    panel.setAttribute("role", "listbox");

    let search = null, list, hint;
    if (withSearch) {
      search = document.createElement("input");
      search.type = "text";
      search.className = "sel-search";
      search.placeholder = "Filter";
      search.setAttribute("aria-label", "Filter options");
      panel.appendChild(search);
    }
    list = document.createElement("div");
    list.className = "sel-list";
    panel.appendChild(list);
    hint = document.createElement("p");
    hint.className = "sel-hint";
    hint.hidden = true;
    panel.appendChild(hint);

    wrap.append(trigger, panel);
    const label = trigger.querySelector(".sel-label");

    let opts = [];               // { i, text, node }
    function buildList() {
      list.innerHTML = "";
      opts = [];
      [...sel.options].forEach((o, i) => {
        if (o.disabled) return;
        const node = document.createElement("div");
        node.className = "sel-opt";
        node.setAttribute("role", "option");
        node.dataset.i = i;
        node.textContent = o.textContent;
        node.addEventListener("click", () => pick(i));
        opts.push({ i, text: o.textContent.toLowerCase(), node });
      });
      applyFilter();
      sync();
    }

    function applyFilter() {
      const q = (search && search.value.trim().toLowerCase()) || "";
      let shown = 0, hidden = 0;
      list.innerHTML = "";
      for (const o of opts) {
        if (q && !o.text.includes(q)) continue;
        if (shown < RENDER_CAP) { list.appendChild(o.node); shown++; }
        else hidden++;
      }
      hint.hidden = hidden === 0;
      if (hidden) hint.textContent = hidden + " more - keep typing";
      active = -1;
      mark();
    }

    function sync() {
      const o = sel.options[sel.selectedIndex];
      label.textContent = o ? o.textContent : "";
      list.querySelectorAll(".sel-opt").forEach((n) =>
        n.setAttribute("aria-selected", String(+n.dataset.i === sel.selectedIndex)));
    }
    function pick(i) {
      sel.selectedIndex = i;
      sync();
      sel.dispatchEvent(new Event("change", { bubbles: true }));
      close();
      trigger.focus();
    }

    let active = -1;
    function shownItems() { return [...list.querySelectorAll(".sel-opt")]; }
    function mark() {
      const items = shownItems();
      items.forEach((n, k) => n.classList.toggle("sel-active", k === active));
      if (items[active]) items[active].scrollIntoView({ block: "nearest" });
    }
    function step(d) {
      const items = shownItems();
      if (!items.length) return;
      active = (active + d + items.length) % items.length;
      mark();
    }

    function flip() {
      wrap.classList.remove("sel-flip");
      const r = wrap.getBoundingClientRect();
      const ph = panel.offsetHeight || 260;
      const below = window.innerHeight - r.bottom;
      if (below < ph + 16 && r.top > below) wrap.classList.add("sel-flip");
    }
    function open() {
      dismiss();
      wrap.classList.add("sel-open");
      trigger.setAttribute("aria-expanded", "true");
      if (search) { search.value = ""; applyFilter(); }
      const items = shownItems();
      active = Math.max(0, items.findIndex((n) => +n.dataset.i === sel.selectedIndex));
      mark();
      flip();
      if (search) setTimeout(() => search.focus(), 30);
      closer = close;
    }
    function close() {
      wrap.classList.remove("sel-open", "sel-flip");
      trigger.setAttribute("aria-expanded", "false");
      if (closer === close) closer = null;
    }

    trigger.addEventListener("click", () => (wrap.classList.contains("sel-open") ? close() : open()));

    let typeBuf = "", typeAt = 0;
    function typeAhead(ch) {
      const now = Date.now();
      typeBuf = now - typeAt > 700 ? ch : typeBuf + ch;
      typeAt = now;
      const hit = opts.find((o) => o.text.startsWith(typeBuf));
      if (hit) {
        if (wrap.classList.contains("sel-open")) {
          const items = shownItems();
          active = items.indexOf(hit.node);
          mark();
        } else {
          pick(hit.i);
        }
      }
    }

    trigger.addEventListener("keydown", (e) => {
      const isOpen = wrap.classList.contains("sel-open");
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (!isOpen) return open();
        step(e.key === "ArrowDown" ? 1 : -1);
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (!isOpen) return open();
        const items = shownItems();
        (items[active] || items[0]) && (items[active] || items[0]).click();
      } else if (e.key === "Tab" && isOpen) {
        close();
      } else if (!isOpen && e.key.length === 1 && /\S/.test(e.key)) {
        typeAhead(e.key.toLowerCase());
      }
    });

    if (search) {
      search.addEventListener("input", applyFilter);
      search.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); step(e.key === "ArrowDown" ? 1 : -1); }
        else if (e.key === "Enter") {
          e.preventDefault();
          const items = shownItems();
          (items[active] || items[0]) && (items[active] || items[0]).click();
        } else if (e.key === "Escape") { close(); trigger.focus(); }
      });
    }

    /* keep the label in step with a scripted select.value = x */
    const vd = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value");
    Object.defineProperty(sel, "value", {
      configurable: true,
      get() { return vd.get.call(this); },
      set(v) { vd.set.call(this, v); sync(); },
    });

    /* rebuild when the page rewrites the option list */
    new MutationObserver(() => buildList()).observe(sel, { childList: true });

    buildList();
  }

  function boot() {
    document.querySelectorAll("select.sel-enhance").forEach(enhance);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  window.enhanceSelect = enhance;
})();
