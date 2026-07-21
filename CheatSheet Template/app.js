/* ════════════════════════════════════════════════════════════
   CONSTELLATION — shared app logic
   (theme · bookmarks · command palette · star-chart helpers)
════════════════════════════════════════════════════════════ */

'use strict';

/* ── Registry ──────────────────────────────────────────── */
window.STACKS = window.STACKS || [];

const Stacks = {
  all() { return window.STACKS; },
  get(id) { return window.STACKS.find(s => s.id === id); },
  snippetCount(sheet) {
    return sheet.sections.reduce((n, sec) => n + sec.snippets.length, 0);
  },
  totals() {
    const sheets = this.all();
    return {
      sheets: sheets.length,
      sections: sheets.reduce((n, s) => n + s.sections.length, 0),
      snippets: sheets.reduce((n, s) => n + this.snippetCount(s), 0),
    };
  },
};

/* ── Bayer-style designations (α, β, γ …) ───────────────── */
const GREEK = ['α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ', 'ν', 'ξ', 'ο', 'π'];
function designationFor(sheet) {
  const i = Stacks.all().indexOf(sheet);
  return GREEK[i] || GREEK[i % GREEK.length];
}

/* ── Theme ─────────────────────────────────────────────── */
const THEME_KEY = 'constellation-theme';

function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  const label = document.getElementById('themeLabel');
  if (label) label.textContent = t === 'dark' ? 'Night sky' : 'Dawn chart';
}

function initTheme() {
  applyTheme(localStorage.getItem(THEME_KEY) || 'dark');
  const btn = document.getElementById('themeToggle');
  if (btn) btn.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  });
}

/* ── Bookmarks ─────────────────────────────────────────── */
const BM_KEY = 'constellation-pins';

const Bookmarks = {
  load() {
    try { return JSON.parse(localStorage.getItem(BM_KEY)) || []; }
    catch { return []; }
  },
  save(list) { localStorage.setItem(BM_KEY, JSON.stringify(list)); },
  has(id) { return this.load().some(b => b.id === id); },
  toggle(entry) {
    let list = this.load();
    if (list.some(b => b.id === entry.id)) list = list.filter(b => b.id !== entry.id);
    else list.push(entry);
    this.save(list);
    return list.some(b => b.id === entry.id);
  },
};

/* ── Clipboard ─────────────────────────────────────────── */
function copyText(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  ta.remove();
  return Promise.resolve();
}

/* ── Star-chart generator ────────────────────────────────
   Deterministic per language: same id always draws the same
   constellation. Star count follows how many sections that
   language actually has, so bigger sheets look busier. ── */
function seededRandom(seed) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822519);
    h = Math.imul(h ^ (h >>> 13), 3266489917);
    h = (h ^= h >>> 16) >>> 0;
    return h / 4294967296;
  };
}

function constellationSVG(seed, opts) {
  opts = opts || {};
  const w = opts.w || 220, h = opts.h || 100;
  const n = Math.max(4, Math.min(9, opts.stars || 6));
  const rand = seededRandom(seed);
  const pad = Math.min(w, h) * 0.14;

  const pts = [];
  for (let i = 0; i < n; i++) {
    pts.push({
      x: pad + rand() * (w - pad * 2),
      y: pad + rand() * (h - pad * 2),
      r: 1.3 + rand() * 2,
    });
  }
  pts.sort((a, b) => a.x - b.x);
  // biggest star = the "primary" of the constellation
  let maxI = 0;
  pts.forEach((p, i) => { if (p.r > pts[maxI].r) maxI = i; });
  pts[maxI].r += 1.1;

  const lines = [];
  for (let i = 0; i < pts.length - 1; i++) lines.push([i, i + 1]);
  const extra = pts.length > 5 ? 1 : 0;
  for (let i = 0; i < extra; i++) {
    const a = Math.floor(rand() * pts.length);
    const b = Math.floor(rand() * pts.length);
    if (a !== b) lines.push([a, b]);
  }

  const lineSvg = lines.map(([a, b]) =>
    '<line x1="' + pts[a].x.toFixed(1) + '" y1="' + pts[a].y.toFixed(1) + '" '
    + 'x2="' + pts[b].x.toFixed(1) + '" y2="' + pts[b].y.toFixed(1) + '" '
    + 'stroke="var(--g)" stroke-width="0.6" opacity="0.4"/>'
  ).join('');

  const starSvg = pts.map((p, i) => {
    const glow = p.r > 2.6
      ? '<circle cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="' + (p.r * 2.6).toFixed(1) + '" fill="var(--g)" opacity="0.13"/>'
      : '';
    return glow + '<circle cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="' + p.r.toFixed(1) + '" fill="var(--g)" opacity="' + (i === maxI ? 1 : 0.82) + '"/>';
  }).join('');

  return '<svg viewBox="0 0 ' + w + ' ' + h + '" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">' + lineSvg + starSvg + '</svg>';
}

/* ── Command palette (global search) ───────────────────── */
const Palette = (() => {
  let index = null;
  let overlay, input, results, selIdx = 0, items = [];

  function buildIndex() {
    if (index) return index;
    index = [];
    Stacks.all().forEach(sheet => {
      index.push({
        type: 'sheet',
        sheet,
        haystack: (sheet.name + ' ' + sheet.tag + ' ' + sheet.desc + ' ' + (sheet.keywords || '')).toLowerCase(),
      });
      sheet.sections.forEach((sec, si) => {
        sec.snippets.forEach((sn, ni) => {
          index.push({
            type: 'snippet',
            sheet, sec, sn,
            anchor: sheet.id + '-' + si + '-' + ni,
            haystack: (sheet.name + ' ' + sec.title + ' ' + sn.label + ' ' + sn.desc + ' ' + sn.code).toLowerCase(),
          });
        });
      });
    });
    return index;
  }

  function search(q) {
    q = q.toLowerCase().trim();
    if (!q) return [];
    const terms = q.split(/\s+/);
    const scored = [];
    buildIndex().forEach(entry => {
      if (!terms.every(t => entry.haystack.includes(t))) return;
      let score = entry.type === 'sheet' ? 50 : 0;
      const primary = entry.type === 'sheet' ? entry.sheet.name : entry.sn.label;
      if (primary.toLowerCase().includes(q)) score += 30;
      if (primary.toLowerCase().startsWith(q)) score += 20;
      scored.push({ entry, score });
    });
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 24).map(s => s.entry);
  }

  function render(q) {
    items = search(q);
    selIdx = 0;
    if (!q.trim()) {
      results.innerHTML = '<div class="pal-empty">Type to search the whole sky —<br>snippet names, descriptions, even the code itself.</div>';
      return;
    }
    if (!items.length) {
      results.innerHTML = '<div class="pal-empty">No star charted for “' + escapeHtml(q) + '”.</div>';
      return;
    }
    let html = '', lastGroup = '';
    items.forEach((it, i) => {
      const group = it.type === 'sheet' ? 'Constellations' : it.sheet.name;
      if (group !== lastGroup) { html += '<div class="pal-group">' + escapeHtml(group) + '</div>'; lastGroup = group; }
      if (it.type === 'sheet') {
        html += '<div class="pal-item' + (i === selIdx ? ' sel' : '') + '" data-i="' + i + '">'
          + '<span class="pal-mono">' + escapeHtml(designationFor(it.sheet)) + '</span>'
          + '<span class="pal-text"><span class="pal-label">' + escapeHtml(it.sheet.name) + ' — full chart</span>'
          + '<span class="pal-sub">' + escapeHtml(it.sheet.tag) + ' · ' + it.sheet.sections.length + ' regions</span></span>'
          + '<span class="pal-jump">open ↵</span></div>';
      } else {
        html += '<div class="pal-item' + (i === selIdx ? ' sel' : '') + '" data-i="' + i + '">'
          + '<span class="pal-mono">' + escapeHtml(designationFor(it.sheet)) + '</span>'
          + '<span class="pal-text"><span class="pal-label">' + escapeHtml(it.sn.label) + '</span>'
          + '<span class="pal-sub">' + escapeHtml(it.sec.title) + '</span></span>'
          + '<span class="pal-jump">jump ↵</span></div>';
      }
    });
    results.innerHTML = html;
    results.querySelectorAll('.pal-item').forEach(el => {
      el.addEventListener('click', () => go(items[+el.dataset.i]));
      el.addEventListener('mousemove', () => setSel(+el.dataset.i));
    });
  }

  function setSel(i) {
    selIdx = i;
    results.querySelectorAll('.pal-item').forEach(el =>
      el.classList.toggle('sel', +el.dataset.i === i));
    const el = results.querySelector('.pal-item.sel');
    if (el) el.scrollIntoView({ block: 'nearest' });
  }

  function go(it) {
    if (!it) return;
    close();
    if (it.type === 'sheet') location.href = 'sheet.html?lang=' + it.sheet.id;
    else location.href = 'sheet.html?lang=' + it.sheet.id + '#' + it.anchor;
    // same-page hash jump: force the flash handler
    if (it.type === 'snippet' && window.SHEET_ID === it.sheet.id) {
      setTimeout(() => flashHash(), 50);
    }
  }

  function open() {
    overlay.classList.add('open');
    input.value = '';
    render('');
    input.focus();
  }
  function close() { overlay.classList.remove('open'); }

  function init() {
    overlay = document.getElementById('paletteOverlay');
    if (!overlay) return;
    input = document.getElementById('paletteInput');
    results = document.getElementById('paletteResults');

    input.addEventListener('input', () => render(input.value));
    input.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSel(Math.min(selIdx + 1, items.length - 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setSel(Math.max(selIdx - 1, 0)); }
      else if (e.key === 'Enter') { e.preventDefault(); go(items[selIdx]); }
      else if (e.key === 'Escape') close();
    });
    overlay.addEventListener('mousedown', e => { if (e.target === overlay) close(); });

    document.querySelectorAll('[data-open-palette]').forEach(el =>
      el.addEventListener('click', open));

    document.addEventListener('keydown', e => {
      const typing = /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); open(); }
      else if (e.key === '/' && !typing) { e.preventDefault(); open(); }
      else if (e.key === 'Escape') close();
    });
  }

  return { init, open };
})();

/* ── Helpers ───────────────────────────────────────────── */
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function svgIcon(name) {
  const icons = {
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="1"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>',
  };
  return icons[name] || '';
}

/* copy + confirmation chip on a snippet card */
function wireCopy(btn, card, code) {
  btn.addEventListener('click', () => {
    copyText(code).then(() => {
      card.classList.remove('stamped');
      void card.offsetWidth; /* restart animation */
      card.classList.add('stamped');
    });
  });
}

/* flash + scroll the snippet the URL hash points at */
function flashHash() {
  const id = location.hash.slice(1);
  if (!id) return;
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ block: 'center' });
  el.classList.remove('flash');
  void el.offsetWidth;
  el.classList.add('flash');
}

/* ── Boot ──────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  Palette.init();
});
