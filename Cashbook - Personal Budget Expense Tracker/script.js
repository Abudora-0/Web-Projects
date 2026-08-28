'use strict';
/* ═════════════════════════════════════════════════════════
   CASHBOOK - a personal ledger
   Plain-words quick entry → parsed lines → running balance.
   Everything stays in localStorage.
   ═════════════════════════════════════════════════════════ */

/* ── constants ───────────────────────────────────────────── */
const LS_KEY = 'cashbook.v1';

const CATS = {
  in:  ['Salary', 'Freelance', 'Investment', 'Gift', 'Refund', 'Other Income'],
  out: ['Food', 'Transport', 'Housing', 'Utilities', 'Shopping', 'Entertainment',
        'Health', 'Education', 'Subscriptions', 'Travel', 'Other']
};

const STAMP_HUE = {
  Salary: 150, Freelance: 172, Investment: 195, Gift: 285, Refund: 215, 'Other Income': 135,
  Food: 25, Transport: 212, Housing: 8, Utilities: 45, Shopping: 322, Entertainment: 268,
  Health: 178, Education: 232, Subscriptions: 300, Travel: 200, Other: 0
};

const KEYWORDS = [
  [/coffee|latte|lunch|dinner|breakfast|grocer|restaurant|pizza|burger|kebab|snack|tea\b|cafe|food|bakery|market/i, 'Food'],
  [/uber|careem|taxi|bus\b|train|fuel|petrol|diesel|gas\b|metro|parking|toll/i, 'Transport'],
  [/rent\b|mortgage|landlord|plumber|repair|furniture/i, 'Housing'],
  [/electric|water bill|internet|wifi|broadband|utility|phone bill|mobile bill|bill\b/i, 'Utilities'],
  [/netflix|spotify|subscri|prime|icloud|patreon|membership|domain|hosting/i, 'Subscriptions'],
  [/movie|cinema|game|steam|concert|ticket|party/i, 'Entertainment'],
  [/doctor|pharmacy|medicine|hospital|gym|dentist|clinic/i, 'Health'],
  [/book\b|books|course|tuition|school|university|exam|fee\b/i, 'Education'],
  [/hotel|flight|airbnb|trip|travel|visa\b|luggage/i, 'Travel'],
  [/salary|wage|paycheck|payroll/i, 'Salary'],
  [/freelance|client|gig\b|invoice|commission/i, 'Freelance'],
  [/dividend|interest|stock|crypto|profit/i, 'Investment'],
  [/gift|present\b/i, 'Gift'],
  [/refund|cashback|reimburse|returned/i, 'Refund'],
  [/cloth|shoe|sneaker|amazon|daraz|shopping|mall\b|jacket|dress/i, 'Shopping']
];

const MONTH_NAMES = ['January','February','March','April','May','June',
                     'July','August','September','October','November','December'];
const WEEKDAYS = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];

/* ── state ───────────────────────────────────────────────── */
let db = loadDb();
const NOW = new Date();
let folio = { y: NOW.getFullYear(), m: NOW.getMonth() };
let undoBuffer = null;
let confirmCb = null;

function loadDb() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const d = JSON.parse(raw);
      if (d && Array.isArray(d.entries)) {
        return {
          entries: d.entries, envelopes: d.envelopes || [], orders: d.orders || [],
          currency: d.currency || '$', theme: d.theme === 'lamp' ? 'lamp' : 'day'
        };
      }
    }
  } catch (e) { /* corrupted store → start fresh */ }
  return { entries: [], envelopes: [], orders: [], currency: '$', theme: 'day' };
}
function save() { localStorage.setItem(LS_KEY, JSON.stringify(db)); }

/* ── little helpers ──────────────────────────────────────── */
const $  = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const pad = n => String(n).padStart(2, '0');
const isoOf = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const monthKeyOf = (y, m) => `${y}-${pad(m + 1)}`;
const folioKey = () => monthKeyOf(folio.y, folio.m);
const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const esc = s => String(s).replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function fmt(n, sign) {
  const v = Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const s = sign && n !== 0 ? (n > 0 ? '+' : '−') : (n < 0 ? '−' : '');
  return `${s}${db.currency}${v}`;
}
function shortDate(isoStr) {
  const [y, m, d] = isoStr.split('-').map(Number);
  return `${d} ${MONTH_NAMES[m - 1].slice(0, 3)}`;
}
function stampHue(cat) {
  if (cat in STAMP_HUE) return STAMP_HUE[cat];
  let h = 0; for (const c of cat) h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
}
function stampColor(cat) {
  const lamp = db.theme === 'lamp';
  return `hsl(${stampHue(cat)}, ${lamp ? 42 : 48}%, ${lamp ? 68 : 34}%)`;
}
function stampHtml(cat) {
  return `<span class="stamp" style="color:${stampColor(cat)}">${esc(cat)}</span>`;
}
function customCats(type) {
  const known = new Set([...CATS.in, ...CATS.out]);
  const out = new Set();
  db.entries.forEach(e => { if ((!type || e.type === type) && !known.has(e.category)) out.add(e.category); });
  db.orders.forEach(o => { if ((!type || o.type === type) && !known.has(o.category)) out.add(o.category); });
  return [...out].sort();
}

/* ── the quick-line parser ───────────────────────────────── */
function resolveCategory(tag) {
  const t = tag.toLowerCase();
  const all = [...CATS.out, ...CATS.in, ...customCats()];
  const hit = all.find(c => c.toLowerCase().startsWith(t)) ||
              all.find(c => c.toLowerCase().includes(t));
  if (hit) return hit;
  return tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase(); // new custom category
}
function guessCategory(text, type) {
  for (const [re, cat] of KEYWORDS) if (re.test(text)) return cat;
  return type === 'in' ? 'Other Income' : 'Other';
}
function defaultEntryDate() {
  if (folio.y === NOW.getFullYear() && folio.m === NOW.getMonth()) return isoOf(new Date());
  const d = Math.min(NOW.getDate(), daysInMonth(folio.y, folio.m));
  return `${folio.y}-${pad(folio.m + 1)}-${pad(d)}`;
}

function parseQuick(text) {
  const raw = text.trim();
  if (!raw) return null;
  let amount = null, type = null, category = null, dateISO = null, recurring = false;
  const noteTokens = [];
  const today = new Date();

  for (const tok of raw.split(/\s+/)) {
    const cleaned = tok.replace(/[,$€£₹¥₨]/g, '');
    if (amount === null && /^[+\-]?\d+(\.\d{1,2})?$/.test(cleaned) && parseFloat(cleaned) !== 0) {
      amount = Math.abs(parseFloat(cleaned));
      if (cleaned.startsWith('+')) type = 'in';
      else if (cleaned.startsWith('-')) type = 'out';
      continue;
    }
    if (tok.startsWith('#') && tok.length > 1) { category = resolveCategory(tok.slice(1)); continue; }
    const low = tok.toLowerCase();
    if (low === 'monthly' || low === 'recurring') { recurring = true; continue; }
    if (low === 'today') { dateISO = isoOf(today); continue; }
    if (low === 'yesterday') {
      const d = new Date(today); d.setDate(d.getDate() - 1); dateISO = isoOf(d); continue;
    }
    const wd = WEEKDAYS.findIndex(w => w === low || (low.length >= 3 && w.startsWith(low)));
    if (wd >= 0 && low.length >= 3) {
      const d = new Date(today);
      d.setDate(d.getDate() - ((d.getDay() - wd + 7) % 7));
      dateISO = isoOf(d); continue;
    }
    const dm = tok.match(/^(\d{1,2})[\/\-.](\d{1,2})$/);
    if (dm && +dm[1] >= 1 && +dm[1] <= 31 && +dm[2] >= 1 && +dm[2] <= 12) {
      dateISO = `${today.getFullYear()}-${pad(+dm[2])}-${pad(+dm[1])}`; continue;
    }
    noteTokens.push(tok);
  }

  if (amount === null) return { ok: false, hint: 'waiting for an amount - e.g. coffee 4.50' };

  let note = noteTokens.join(' ');
  if (!type) type = /salar|income|received|bonus|refund|freelance|dividend|client paid|cashback/i.test(note) ? 'in' : 'out';
  if (!category) category = guessCategory(note, type);
  if (!dateISO) dateISO = defaultEntryDate();
  note = note ? note.charAt(0).toUpperCase() + note.slice(1) : category;
  return { ok: true, type, amount: Math.round(amount * 100) / 100, category, dateISO, note, recurring };
}

/* ── quick-line UI ───────────────────────────────────────── */
const quickInput = $('#quickInput');
const quickPreview = $('#quickPreview');

function renderQuickPreview() {
  const p = parseQuick(quickInput.value);
  if (!p) { quickPreview.innerHTML = '<span class="qp-hint">the pen is ready - amounts, #tags and dates all understood</span>'; return; }
  if (!p.ok) { quickPreview.innerHTML = `<span class="qp-hint">${esc(p.hint)}</span>`; return; }
  quickPreview.innerHTML = `
    <span class="qp-chip ${p.type === 'in' ? 'qp-in' : 'qp-out'}"><b>${p.type === 'in' ? 'CREDIT +' : 'DEBIT −'}</b> ${fmt(p.amount)}</span>
    ${stampHtml(p.category)}
    <span class="qp-chip">${shortDate(p.dateISO)}</span>
    <span class="qp-note">“${esc(p.note)}”</span>
    ${p.recurring ? '<span class="qp-chip qp-rec">↻ monthly</span>' : ''}
    <span class="qp-enter qp-hint">post with <kbd>Enter</kbd></span>`;
}

function submitQuick() {
  const p = parseQuick(quickInput.value);
  if (!p || !p.ok) return;
  addEntry(p);
  quickInput.value = '';
  renderQuickPreview();
}

/* ── entries ─────────────────────────────────────────────── */
function addEntry(p) {
  const entry = {
    id: uid(), type: p.type, amount: p.amount, category: p.category,
    note: p.note, date: p.dateISO, createdAt: Date.now(),
    orderId: p.orderId || null
  };
  db.entries.push(entry);
  if (p.recurring) {
    const order = {
      id: uid(), type: p.type, amount: p.amount, category: p.category, note: p.note,
      day: +p.dateISO.slice(8, 10), lastPosted: p.dateISO.slice(0, 7)
    };
    db.orders.push(order);
    entry.orderId = order.id;
  }
  save();
  const ek = entry.date.slice(0, 7);
  if (ek !== folioKey()) { folio = { y: +ek.slice(0, 4), m: +ek.slice(5, 7) - 1 }; }
  renderAll();
  showToast(`Posted - ${fmt(entry.amount)} ${entry.type === 'in' ? 'in' : 'out'}, ${entry.category}.` +
            (p.recurring ? ' Standing order raised.' : ''));
}

function deleteEntry(id) {
  const idx = db.entries.findIndex(e => e.id === id);
  if (idx < 0) return;
  undoBuffer = db.entries[idx];
  db.entries.splice(idx, 1);
  save(); renderAll();
  showToast(`Struck out - “${undoBuffer.note}”.`, () => {
    if (!undoBuffer) return;
    db.entries.push(undoBuffer); undoBuffer = null;
    save(); renderAll();
  });
}

/* standing orders: post any lines that have come due */
function postStandingOrders() {
  const today = new Date();
  let posted = 0;
  db.orders.forEach(o => {
    let [y, m] = o.lastPosted.split('-').map(Number);
    m -= 1;
    for (;;) {
      m += 1; if (m > 11) { m = 0; y += 1; }
      const due = new Date(y, m, Math.min(o.day, daysInMonth(y, m)));
      if (due > today) break;
      db.entries.push({
        id: uid(), type: o.type, amount: o.amount, category: o.category,
        note: o.note, date: isoOf(due), createdAt: Date.now(), orderId: o.id
      });
      o.lastPosted = monthKeyOf(y, m);
      posted++;
    }
  });
  if (posted) { save(); showToast(`${posted} standing ${posted === 1 ? 'order' : 'orders'} posted while you were away.`); }
}

/* ── balances ────────────────────────────────────────────── */
function balanceBefore(y, m) {
  const first = `${monthKeyOf(y, m)}-01`;
  return db.entries.reduce((s, e) => e.date < first ? s + (e.type === 'in' ? e.amount : -e.amount) : s, 0);
}
function folioEntries() {
  const k = folioKey();
  return db.entries
    .filter(e => e.date.slice(0, 7) === k)
    .sort((a, b) => a.date === b.date ? a.createdAt - b.createdAt : (a.date < b.date ? -1 : 1));
}

/* ── ledger rendering ────────────────────────────────────── */
function renderFolioBar() {
  $('#folioLabel').textContent = `${MONTH_NAMES[folio.m]} ${folio.y}`;
  const months = db.entries.map(e => e.date.slice(0, 7)).sort();
  let no = 1;
  if (months.length) {
    const [fy, fm] = months[0].split('-').map(Number);
    no = Math.max(1, (folio.y * 12 + folio.m) - (fy * 12 + fm - 1) + 1);
  }
  $('#folioNo').textContent = `FOLIO Nº ${no}`;
  const isNow = folio.y === NOW.getFullYear() && folio.m === NOW.getMonth();
  $('#todayBtn').classList.toggle('hidden', isNow);
}

function renderLedger() {
  const body = $('#ledgerBody');
  const all = folioEntries();
  const q = $('#searchInput').value.trim().toLowerCase();
  const tf = $('#typeFilter').value;
  const filtering = q !== '' || tf !== '';

  // true running balances over the unfiltered folio
  let run = balanceBefore(folio.y, folio.m);
  const bf = run;
  const balById = {};
  all.forEach(e => { run += e.type === 'in' ? e.amount : -e.amount; balById[e.id] = run; });
  const cf = run;

  const rows = all.filter(e =>
    (!tf || e.type === tf) &&
    (!q || e.note.toLowerCase().includes(q) || e.category.toLowerCase().includes(q)));

  $('#emptyState').classList.toggle('hidden', all.length > 0);
  if (!all.length) { body.innerHTML = ''; renderSummary(bf, 0, 0); return; }

  let html = '';
  if (!filtering) {
    html += `<tr class="carry-row"><td class="date">1 ${MONTH_NAMES[folio.m].slice(0, 3)}</td>
      <td>Balance brought forward</td><td class="num"></td><td class="num"></td>
      <td class="num bal ${bf < 0 ? 'overdrawn' : ''}">${fmt(bf)}</td></tr>`;
  }
  let lastDate = null;
  rows.forEach(e => {
    const dayFirst = e.date !== lastDate; lastDate = e.date;
    html += `<tr class="entry-row ${dayFirst ? 'day-first' : ''}" data-id="${e.id}">
      <td class="date">${dayFirst ? shortDate(e.date) : ''}</td>
      <td class="part-cell">
        <span class="part-note">${esc(e.note)}</span>
        ${stampHtml(e.category)}
        ${e.orderId ? '<span class="rec-mark" title="standing order">↻</span>' : ''}
        <span class="row-actions">
          <button class="row-btn" data-act="edit" title="Amend entry">✎</button>
          <button class="row-btn" data-act="del" title="Strike out">✕</button>
        </span>
      </td>
      <td class="num debit">${e.type === 'out' ? fmt(e.amount) : ''}</td>
      <td class="num credit">${e.type === 'in' ? fmt(e.amount) : ''}</td>
      <td class="num bal ${balById[e.id] < 0 ? 'overdrawn' : ''}">${fmt(balById[e.id])}</td>
    </tr>`;
  });
  if (filtering && !rows.length) {
    html += `<tr class="carry-row"><td class="date"></td><td colspan="4">Nothing in this folio matches.</td></tr>`;
  }
  if (!filtering) {
    html += `<tr class="carry-row cf-row"><td class="date"></td>
      <td>Balance carried forward</td><td class="num"></td><td class="num"></td>
      <td class="num bal ${cf < 0 ? 'overdrawn' : ''}">${fmt(cf)}</td></tr>`;
  }
  body.innerHTML = html;

  const inSum  = all.filter(e => e.type === 'in').reduce((s, e) => s + e.amount, 0);
  const outSum = all.filter(e => e.type === 'out').reduce((s, e) => s + e.amount, 0);
  renderSummary(bf, inSum, outSum);
}

/* ── summary + auditor's notes ───────────────────────────── */
function renderSummary(bf, inSum, outSum) {
  const net = inSum - outSum, cf = bf + net;
  $('#sumBf').textContent = fmt(bf);
  $('#sumIn').textContent = inSum ? fmt(inSum, true) : '—';
  $('#sumOut').textContent = outSum ? fmt(-outSum, true) : '—';
  const netEl = $('#sumNet');
  netEl.textContent = fmt(net, true);
  netEl.className = 'mono ' + (net > 0 ? 'pos' : net < 0 ? 'neg' : '');
  const cfEl = $('#sumCf');
  cfEl.textContent = fmt(cf);
  cfEl.className = 'mono ' + (cf < 0 ? 'neg' : '');

  const rate = inSum > 0 ? Math.round((net / inSum) * 100) : 0;
  const shown = Math.max(0, Math.min(100, rate));
  $('#savingsRate').textContent = `${Math.max(0, rate)}%`;
  const fill = $('#savingsFill');
  fill.style.width = shown + '%';
  fill.classList.toggle('low', rate < 20);
  renderNotes(inSum, outSum, net, rate);
}

function renderNotes(inSum, outSum, net, rate) {
  const all = folioEntries();
  const notes = [];
  if (!all.length) {
    $('#notesList').innerHTML = '<li>Nothing to remark upon yet. A blank folio is an honest one.</li>';
    return;
  }
  const outs = all.filter(e => e.type === 'out');

  if (outs.length) {
    const byCat = {};
    outs.forEach(e => byCat[e.category] = (byCat[e.category] || 0) + e.amount);
    const [topCat, topAmt] = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0];
    notes.push(`Most ink spent on <b>${esc(topCat)}</b> - ${fmt(topAmt)}, ${Math.round(topAmt / outSum * 100)}% of all debits.`);

    const isNow = folio.y === NOW.getFullYear() && folio.m === NOW.getMonth();
    const days = isNow ? NOW.getDate() : daysInMonth(folio.y, folio.m);
    notes.push(`Averaging <b>${fmt(outSum / days)}</b> a day out the door.`);

    const prev = folio.m === 0 ? { y: folio.y - 1, m: 11 } : { y: folio.y, m: folio.m - 1 };
    const pk = monthKeyOf(prev.y, prev.m);
    const prevOut = db.entries.filter(e => e.type === 'out' && e.date.slice(0, 7) === pk)
                              .reduce((s, e) => s + e.amount, 0);
    if (prevOut > 0) {
      const diff = Math.round(((outSum - prevOut) / prevOut) * 100);
      if (diff !== 0) notes.push(`Debits are <b>${diff > 0 ? 'up' : 'down'} ${Math.abs(diff)}%</b> on the previous folio.`);
    }
    const big = outs.slice().sort((a, b) => b.amount - a.amount)[0];
    notes.push(`Largest single line: <b>${fmt(big.amount)}</b> - “${esc(big.note)}”, ${shortDate(big.date)}.`);
  }
  if (inSum > 0 && rate >= 20) notes.push(`<b>${rate}%</b> of income put away. The auditor approves.`);
  else if (inSum > 0 && net < 0) notes.push(`Spending has <b>outrun income</b> this folio. The red pen is out.`);

  $('#notesList').innerHTML = notes.slice(0, 4).map(n => `<li>${n}</li>`).join('');
}

/* ── envelopes ───────────────────────────────────────────── */
function envSpent(cat) {
  const k = folioKey();
  return db.entries.filter(e => e.type === 'out' && e.category === cat && e.date.slice(0, 7) === k)
                   .reduce((s, e) => s + e.amount, 0);
}
function fillClass(pct) { return pct > 100 ? 'over' : pct >= 75 ? 'warn' : ''; }

function renderEnvelopes() {
  const grid = $('#envelopeGrid');
  if (!db.envelopes.length) {
    grid.innerHTML = `<p class="env-empty">No envelopes sealed yet. An envelope holds one category's monthly allowance - spending against it draws the envelope down.</p>`;
  } else {
    grid.innerHTML = db.envelopes.map(v => {
      const spent = envSpent(v.category);
      const pct = v.limit > 0 ? (spent / v.limit) * 100 : 0;
      const left = v.limit - spent;
      return `<div class="envelope" data-id="${v.id}">
        <span class="env-actions">
          <button class="row-btn" data-act="edit" title="Re-seal">✎</button>
          <button class="row-btn" data-act="del" title="Discard">✕</button>
        </span>
        ${pct > 100 ? '<span class="env-over-stamp">OVERSPENT</span>' : ''}
        <div class="env-cat">${stampHtml(v.category)}</div>
        <div class="env-figures"><span>${fmt(spent)} drawn</span><b>of ${fmt(v.limit)}</b></div>
        <div class="env-track"><div class="env-fill ${fillClass(pct)}" style="width:${Math.min(100, pct)}%"></div></div>
        <div class="env-remaining">${left >= 0
          ? `<b class="pos">${fmt(left)}</b> still sealed inside`
          : `<b class="neg">${fmt(-left)}</b> over the allowance`}</div>
      </div>`;
    }).join('');
  }
  // rail snapshot
  const rail = $('#railEnvelopes');
  if (!db.envelopes.length) {
    rail.innerHTML = `<p class="rail-env-none">none sealed - <a id="railEnvLink">make one</a></p>`;
    const link = $('#railEnvLink');
    if (link) link.onclick = () => { switchTab('envelopes'); openEnvModal(); };
  } else {
    rail.innerHTML = db.envelopes.map(v => {
      const spent = envSpent(v.category);
      const pct = v.limit > 0 ? (spent / v.limit) * 100 : 0;
      return `<div class="rail-env">
        <div class="rail-env-top"><span>${esc(v.category)}</span><span>${Math.round(pct)}%</span></div>
        <div class="rail-env-track"><div class="rail-env-fill ${fillClass(pct)}" style="width:${Math.min(100, pct)}%"></div></div>
      </div>`;
    }).join('');
  }
}

function renderOrders() {
  const list = $('#ordersList');
  if (!db.orders.length) {
    list.innerHTML = '<p class="orders-empty">No standing orders. Write a line ending in <code>monthly</code> and it will post itself every month.</p>';
    return;
  }
  list.innerHTML = db.orders.map(o => `
    <div class="order-row" data-id="${o.id}">
      <span class="order-day">DAY ${pad(o.day)}</span>
      <span class="order-note">${esc(o.note)}</span>
      ${stampHtml(o.category)}
      <span class="order-amt ${o.type === 'in' ? 'pos' : 'neg'}">${fmt(o.type === 'in' ? o.amount : -o.amount, true)}</span>
      <button class="row-btn" data-act="del" title="Cancel order">✕</button>
    </div>`).join('');
}

/* ── reports ─────────────────────────────────────────────── */
function renderReports() {
  $('#catSub').textContent = `debits by category - ${MONTH_NAMES[folio.m]} ${folio.y}`;
  const outs = folioEntries().filter(e => e.type === 'out');
  const wrap = $('#catBars');
  if (!outs.length) {
    wrap.innerHTML = '<p class="cat-bars-empty">No debits in this folio - nothing went anywhere.</p>';
  } else {
    const byCat = {};
    outs.forEach(e => byCat[e.category] = (byCat[e.category] || 0) + e.amount);
    const total = outs.reduce((s, e) => s + e.amount, 0);
    wrap.innerHTML = Object.entries(byCat).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => `
      <div class="cat-bar-row">
        <div class="cat-bar-top">${stampHtml(cat)}<span class="amt">${fmt(amt)} · ${Math.round(amt / total * 100)}%</span></div>
        <div class="cat-bar-track"><div class="cat-bar-fill" style="width:${(amt / total * 100).toFixed(1)}%;background:${stampColor(cat)}"></div></div>
      </div>`).join('');
  }
  drawTrend();
}

function drawTrend() {
  const canvas = $('#trendCanvas');
  const cssW = canvas.clientWidth;
  if (!cssW) return; // panel hidden
  const cssH = 240, dpr = window.devicePixelRatio || 1;
  canvas.width = cssW * dpr; canvas.height = cssH * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const css = getComputedStyle(document.documentElement);
  const cInk3 = css.getPropertyValue('--ink3').trim();
  const cRule = css.getPropertyValue('--rule').trim();
  const cRed = css.getPropertyValue('--red').trim();
  const cGreen = css.getPropertyValue('--green').trim();

  // six months ending at the viewed folio
  const months = [];
  for (let i = 5; i >= 0; i--) {
    let m = folio.m - i, y = folio.y;
    while (m < 0) { m += 12; y -= 1; }
    months.push({ y, m, key: monthKeyOf(y, m), in: 0, out: 0 });
  }
  db.entries.forEach(e => {
    const mo = months.find(x => x.key === e.date.slice(0, 7));
    if (mo) mo[e.type === 'in' ? 'in' : 'out'] += e.amount;
  });
  $('#trendSub').textContent = `credits and debits, ${MONTH_NAMES[months[0].m].slice(0, 3)} ${months[0].y} - ${MONTH_NAMES[folio.m].slice(0, 3)} ${folio.y}`;

  const max = Math.max(1, ...months.map(x => Math.max(x.in, x.out)));
  const padL = 8, padR = 8, padT = 18, padB = 30;
  const plotW = cssW - padL - padR, plotH = cssH - padT - padB;
  const slot = plotW / 6, barW = Math.min(26, slot / 3);

  ctx.clearRect(0, 0, cssW, cssH);
  ctx.font = '10px "IBM Plex Mono", monospace';

  // dashed guide lines
  ctx.strokeStyle = cRule; ctx.lineWidth = 1; ctx.setLineDash([3, 4]);
  for (let g = 1; g <= 3; g++) {
    const gy = padT + plotH - (plotH * g / 3);
    ctx.beginPath(); ctx.moveTo(padL, gy); ctx.lineTo(cssW - padR, gy); ctx.stroke();
  }
  ctx.setLineDash([]);

  months.forEach((mo, i) => {
    const cx = padL + slot * i + slot / 2;
    const hIn = (mo.in / max) * plotH, hOut = (mo.out / max) * plotH;
    ctx.fillStyle = cGreen;
    ctx.fillRect(cx - barW - 2, padT + plotH - hIn, barW, hIn);
    ctx.fillStyle = cRed;
    ctx.fillRect(cx + 2, padT + plotH - hOut, barW, hOut);
    ctx.fillStyle = cInk3;
    ctx.textAlign = 'center';
    const isFolio = mo.y === folio.y && mo.m === folio.m;
    ctx.fillText(`${MONTH_NAMES[mo.m].slice(0, 3)}${isFolio ? ' •' : ''}`, cx, cssH - 12);
  });

  // baseline (solid, drawn last)
  ctx.strokeStyle = cInk3; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(padL, padT + plotH + .5); ctx.lineTo(cssW - padR, padT + plotH + .5); ctx.stroke();
}

/* ── records office ──────────────────────────────────────── */
function download(name, text, mime) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: mime }));
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}
function exportCsv() {
  if (!db.entries.length) { showToast('The books are empty - nothing to export.'); return; }
  const rows = [['date', 'type', 'category', 'amount', 'note'],
    ...db.entries.slice().sort((a, b) => a.date < b.date ? -1 : 1)
      .map(e => [e.date, e.type === 'in' ? 'credit' : 'debit', e.category, e.amount.toFixed(2),
                 `"${e.note.replace(/"/g, '""')}"`])];
  download('cashbook.csv', rows.map(r => r.join(',')).join('\n'), 'text/csv');
  showToast('CSV handed over.');
}
function backupJson() {
  download('cashbook-backup.json', JSON.stringify(db, null, 2), 'application/json');
  showToast('Backup pressed and filed.');
}
function importJson(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const d = JSON.parse(reader.result);
      if (!d || !Array.isArray(d.entries)) throw new Error('bad');
      db = {
        entries: d.entries, envelopes: d.envelopes || [], orders: d.orders || [],
        currency: d.currency || db.currency, theme: d.theme === 'lamp' ? 'lamp' : 'day'
      };
      save(); applyTheme(); $('#currencySel').value = db.currency;
      renderAll();
      showToast(`Restored - ${db.entries.length} lines back on the books.`);
    } catch (e) { showToast('That file is not a Cashbook backup.'); }
  };
  reader.readAsText(file);
}

/* ── specimen ledger ─────────────────────────────────────── */
function seedSpecimen() {
  const mk = (offsetMonths, day, type, amount, category, note) => {
    let y = NOW.getFullYear(), m = NOW.getMonth() - offsetMonths;
    while (m < 0) { m += 12; y -= 1; }
    const d = Math.min(day, daysInMonth(y, m));
    return { id: uid(), type, amount, category, note, date: `${y}-${pad(m + 1)}-${pad(d)}`, createdAt: Date.now(), orderId: null };
  };
  const spec = [];
  for (let off = 3; off >= 0; off--) {
    spec.push(mk(off, 1, 'in', 2600, 'Salary', 'Monthly salary'));
    spec.push(mk(off, 3, 'out', 850, 'Housing', 'Rent'));
    spec.push(mk(off, 4, 'out', 62.4 + off * 3, 'Utilities', 'Electric bill'));
    spec.push(mk(off, 5, 'out', 11.99, 'Subscriptions', 'Streaming'));
    spec.push(mk(off, 6, 'out', 74.1 + off * 9, 'Food', 'Weekly groceries'));
    spec.push(mk(off, 9, 'out', 12.5, 'Transport', 'Fuel top-up'));
    spec.push(mk(off, 11, 'out', 4.8, 'Food', 'Coffee with a friend'));
    spec.push(mk(off, 13, 'out', 68 + off * 6, 'Food', 'Groceries again'));
    if (off % 2 === 0) spec.push(mk(off, 15, 'in', 420, 'Freelance', 'Client invoice'));
    spec.push(mk(off, 17, 'out', 29.99, 'Entertainment', 'Cinema night'));
    spec.push(mk(off, 20, 'out', 55 + off * 4, 'Shopping', 'Bits and pieces'));
    spec.push(mk(off, 24, 'out', 18.6, 'Health', 'Pharmacy'));
    spec.push(mk(off, 26, 'out', 70.2, 'Food', 'End-of-month groceries'));
  }
  const today = new Date();
  db.entries = spec.filter(e => e.date <= isoOf(today));
  db.envelopes = [
    { id: uid(), category: 'Food', limit: 320 },
    { id: uid(), category: 'Entertainment', limit: 60 },
    { id: uid(), category: 'Shopping', limit: 100 }
  ];
  db.orders = [
    { id: uid(), type: 'in', amount: 2600, category: 'Salary', note: 'Monthly salary', day: 1, lastPosted: monthKeyOf(NOW.getFullYear(), NOW.getMonth()) },
    { id: uid(), type: 'out', amount: 850, category: 'Housing', note: 'Rent', day: 3, lastPosted: monthKeyOf(NOW.getFullYear(), NOW.getMonth()) }
  ];
  save(); renderAll();
  showToast('Specimen ledger opened - four folios of example entries.');
}

/* ── toasts ──────────────────────────────────────────────── */
function showToast(msg, undoFn) {
  const wrap = $('#toastWrap');
  const t = document.createElement('div');
  t.className = 'toast';
  const span = document.createElement('span');
  span.textContent = msg;
  t.appendChild(span);
  if (undoFn) {
    const b = document.createElement('button');
    b.className = 'toast-undo'; b.textContent = 'undo';
    b.onclick = () => { undoFn(); t.remove(); };
    t.appendChild(b);
  }
  wrap.appendChild(t);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 260); }, undoFn ? 6000 : 3200);
}

/* ── modals ──────────────────────────────────────────────── */
function openModal(id) { $('#' + id).classList.remove('hidden'); }
function closeModal(id) { $('#' + id).classList.add('hidden'); }
function anyModalOpen() { return $$('.modal').some(m => !m.classList.contains('hidden')); }

let entryModalType = 'out';
function fillCategorySelect(sel, type, chosen) {
  const opts = [...CATS[type], ...customCats(type)];
  sel.innerHTML = opts.map(c => `<option value="${esc(c)}" ${c === chosen ? 'selected' : ''}>${esc(c)}</option>`).join('');
}
function setEntryType(type) {
  entryModalType = type;
  $$('#entryTypeToggle .type-btn').forEach(b => b.classList.toggle('active', b.dataset.type === type));
  fillCategorySelect($('#entryCategory'), type, $('#entryCategory').value);
}
function openEntryModal(entry) {
  $('#entryTitle').textContent = entry ? 'Amend Entry' : 'New Entry';
  $('#entrySaveBtn').textContent = entry ? 'amend entry' : 'post entry';
  $('#entryId').value = entry ? entry.id : '';
  $('#entryAmount').value = entry ? entry.amount : '';
  $('#entryDate').value = entry ? entry.date : defaultEntryDate();
  $('#entryNote').value = entry ? entry.note : '';
  $('#entryRepeat').checked = false;
  $('#repeatRow').style.display = entry ? 'none' : '';
  setEntryType(entry ? entry.type : 'out');
  fillCategorySelect($('#entryCategory'), entry ? entry.type : 'out', entry ? entry.category : undefined);
  openModal('entryModal');
  setTimeout(() => $('#entryAmount').focus(), 50);
}
function openEnvModal(env) {
  $('#envTitle').textContent = env ? 'Re-seal Envelope' : 'New Envelope';
  $('#envId').value = env ? env.id : '';
  $('#envLimit').value = env ? env.limit : '';
  const taken = new Set(db.envelopes.filter(v => !env || v.id !== env.id).map(v => v.category));
  const opts = [...CATS.out, ...customCats('out')].filter(c => !taken.has(c));
  $('#envCategory').innerHTML = opts.map(c =>
    `<option value="${esc(c)}" ${env && c === env.category ? 'selected' : ''}>${esc(c)}</option>`).join('');
  openModal('envModal');
}
function askConfirm(title, msg, okLabel, cb) {
  $('#confirmTitle').textContent = title;
  $('#confirmMsg').textContent = msg;
  $('#confirmOk').textContent = okLabel;
  confirmCb = cb;
  openModal('confirmModal');
}

/* ── tabs & theme ────────────────────────────────────────── */
function switchTab(name) {
  $$('.index-tab').forEach(b => {
    const on = b.dataset.tab === name;
    b.classList.toggle('active', on);
    b.setAttribute('aria-selected', on);
  });
  $$('.panel').forEach(p => p.classList.toggle('active', p.id === 'panel-' + name));
  if (name === 'reports') requestAnimationFrame(drawTrend);
}
function applyTheme() {
  document.documentElement.dataset.theme = db.theme;
  document.querySelector('meta[name="theme-color"]').content = db.theme === 'lamp' ? '#121813' : '#f4efe4';
}

/* ── render all ──────────────────────────────────────────── */
function renderAll() {
  renderFolioBar();
  renderLedger();
  renderEnvelopes();
  renderOrders();
  renderReports();
  renderQuickPreview();
}

/* ── wiring ──────────────────────────────────────────────── */
function init() {
  applyTheme();
  $('#currencySel').value = db.currency;
  postStandingOrders();
  renderAll();

  // quick line
  quickInput.addEventListener('input', renderQuickPreview);
  quickInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); submitQuick(); }
    if (e.key === 'Escape') { quickInput.value = ''; renderQuickPreview(); quickInput.blur(); }
  });
  $('#fullEntryBtn').addEventListener('click', () => openEntryModal());

  // folio nav
  $('#prevMonth').addEventListener('click', () => stepFolio(-1));
  $('#nextMonth').addEventListener('click', () => stepFolio(1));
  $('#todayBtn').addEventListener('click', () => { folio = { y: NOW.getFullYear(), m: NOW.getMonth() }; renderAll(); });

  // tabs
  $$('.index-tab').forEach(b => b.addEventListener('click', () => switchTab(b.dataset.tab)));

  // filters
  $('#searchInput').addEventListener('input', renderLedger);
  $('#typeFilter').addEventListener('change', renderLedger);

  // ledger row actions (delegated)
  $('#ledgerBody').addEventListener('click', e => {
    const btn = e.target.closest('.row-btn'); if (!btn) return;
    const id = btn.closest('tr').dataset.id;
    if (btn.dataset.act === 'del') deleteEntry(id);
    else openEntryModal(db.entries.find(x => x.id === id));
  });

  // envelopes
  $('#addEnvBtn').addEventListener('click', () => openEnvModal());
  $('#envelopeGrid').addEventListener('click', e => {
    const btn = e.target.closest('.row-btn'); if (!btn) return;
    const id = btn.closest('.envelope').dataset.id;
    const env = db.envelopes.find(v => v.id === id);
    if (btn.dataset.act === 'del') {
      db.envelopes = db.envelopes.filter(v => v.id !== id);
      save(); renderEnvelopes();
      showToast(`Envelope discarded - ${env.category}.`);
    } else openEnvModal(env);
  });
  $('#ordersList').addEventListener('click', e => {
    const btn = e.target.closest('.row-btn'); if (!btn) return;
    const id = btn.closest('.order-row').dataset.id;
    const o = db.orders.find(x => x.id === id);
    db.orders = db.orders.filter(x => x.id !== id);
    save(); renderOrders();
    showToast(`Standing order cancelled - “${o.note}”. Posted lines remain.`);
  });

  // entry modal
  $$('#entryTypeToggle .type-btn').forEach(b =>
    b.addEventListener('click', () => setEntryType(b.dataset.type)));
  $('#entryForm').addEventListener('submit', e => {
    e.preventDefault();
    const amount = Math.round(parseFloat($('#entryAmount').value) * 100) / 100;
    if (!(amount > 0)) return;
    const data = {
      type: entryModalType, amount,
      category: $('#entryCategory').value,
      dateISO: $('#entryDate').value,
      note: $('#entryNote').value.trim() || $('#entryCategory').value,
      recurring: $('#entryRepeat').checked
    };
    const id = $('#entryId').value;
    if (id) {
      const en = db.entries.find(x => x.id === id);
      Object.assign(en, { type: data.type, amount: data.amount, category: data.category, note: data.note, date: data.dateISO });
      save(); renderAll();
      showToast('Entry amended.');
    } else {
      addEntry(data);
    }
    closeModal('entryModal');
  });

  // envelope modal
  $('#envForm').addEventListener('submit', e => {
    e.preventDefault();
    const limit = Math.round(parseFloat($('#envLimit').value) * 100) / 100;
    if (!(limit > 0)) return;
    const id = $('#envId').value, cat = $('#envCategory').value;
    if (id) {
      Object.assign(db.envelopes.find(v => v.id === id), { category: cat, limit });
      showToast('Envelope re-sealed.');
    } else {
      db.envelopes.push({ id: uid(), category: cat, limit });
      showToast(`Envelope sealed - ${fmt(limit)} for ${cat} each month.`);
    }
    save(); renderEnvelopes(); closeModal('envModal');
  });

  // confirm modal
  $('#confirmOk').addEventListener('click', () => { closeModal('confirmModal'); if (confirmCb) confirmCb(); confirmCb = null; });
  $('#confirmCancel').addEventListener('click', () => { closeModal('confirmModal'); confirmCb = null; });

  // records office
  $('#exportCsvBtn').addEventListener('click', exportCsv);
  $('#backupBtn').addEventListener('click', backupJson);
  $('#importInput').addEventListener('change', e => {
    if (e.target.files[0]) importJson(e.target.files[0]);
    e.target.value = '';
  });
  $('#clearBtn').addEventListener('click', () =>
    askConfirm('Burn the books?', 'Every entry, envelope and standing order in this browser will be destroyed. A downloaded backup is the only way back.', 'burn them', () => {
      db.entries = []; db.envelopes = []; db.orders = [];
      save(); renderAll();
      showToast('The books are ash. A fresh folio awaits.');
    }));
  $('#seedBtn').addEventListener('click', seedSpecimen);

  // masthead tools
  $('#currencySel').addEventListener('change', e => { db.currency = e.target.value; save(); renderAll(); });
  $('#themeBtn').addEventListener('click', () => {
    db.theme = db.theme === 'lamp' ? 'day' : 'lamp';
    save(); applyTheme(); renderAll();
  });

  // generic modal close
  $$('[data-close]').forEach(el => el.addEventListener('click', () => closeModal(el.dataset.close)));

  // keyboard
  document.addEventListener('keydown', e => {
    const typing = /^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement.tagName);
    if (e.key === 'Escape') {
      $$('.modal').forEach(m => m.classList.add('hidden'));
      confirmCb = null;
      return;
    }
    if (typing || anyModalOpen() || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === '/') { e.preventDefault(); switchTab('ledger'); $('#searchInput').focus(); }
    else if (e.key === 'n' || e.key === 'N') { e.preventDefault(); openEntryModal(); }
    else if (e.key === '[') stepFolio(-1);
    else if (e.key === ']') stepFolio(1);
    else if (e.key === 't' || e.key === 'T') $('#themeBtn').click();
  });

  window.addEventListener('resize', () => {
    if ($('#panel-reports').classList.contains('active')) drawTrend();
  });
}

function stepFolio(dir) {
  let m = folio.m + dir, y = folio.y;
  if (m < 0) { m = 11; y -= 1; }
  if (m > 11) { m = 0; y += 1; }
  folio = { y, m };
  renderAll();
}

init();
