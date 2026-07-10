/* ══════════════════════════════════════════════
   FinTrack  |  script.js
   ══════════════════════════════════════════════ */

'use strict';

/* ── Config ──────────────────────────────────── */
const CATEGORIES = {
  income:  ['Salary', 'Freelance', 'Investment', 'Bonus', 'Gift', 'Other'],
  expense: ['Food', 'Transport', 'Rent', 'Shopping', 'Entertainment', 'Utilities', 'Healthcare', 'Education', 'Travel', 'Other'],
};
const CAT_ICONS = {
  Salary:'💼', Freelance:'💻', Investment:'📈', Bonus:'🎁', Gift:'🎀',
  Food:'🍔', Transport:'🚗', Rent:'🏠', Shopping:'🛍️', Entertainment:'🎬',
  Utilities:'⚡', Healthcare:'🏥', Education:'📚', Travel:'✈️', Other:'📌',
};
const COLORS = ['#2e9e6b','#d9a13c','#d05a4e','#4da8a0','#7a9e4d','#c07a94','#5b8db0','#a3763f','#3fae7a','#8b6bb0'];

/* ── State ───────────────────────────────────── */
let transactions = parse('ft_transactions', []);
let budgets      = parse('ft_budgets', []);
let currency     = parse('ft_currency', '$');
let editingId    = null;
let charts       = {};

/* ── Helpers ─────────────────────────────────── */
function parse(k, fb) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } }
function save()  { localStorage.setItem('ft_transactions', JSON.stringify(transactions)); localStorage.setItem('ft_budgets', JSON.stringify(budgets)); }
const $  = id => document.getElementById(id);
const el = (tag, cls) => { const e = document.createElement(tag); if (cls) e.className = cls; return e; };
function fmt(n) { return currency + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 }); }

/* ══════════════════════════════════════════════
   INIT
══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', init);

function init() {
  setDate('date'); setDate('qDate');
  loadTheme();
  loadCurrency();
  populateCategories('category', 'income');
  populateCategories('qCategory', 'income');
  populateExpenseCats('budgetCategory');
  populateMonthFilters();
  renderAll();
  bindNav();
  bindForm();
  bindQuickModal();
  bindBudgetModal();
  bindFilters();
  bindTheme();
  bindCurrency();
  bindHamburger();
  bindViewAll();
  bindExport();
}

/* ── Date helper ── */
function setDate(id) {
  const el = $(id);
  if (el) el.valueAsDate = new Date();
}

/* ══════════════════════════════════════════════
   THEME
══════════════════════════════════════════════ */
function loadTheme() {
  if (parse('ft_theme', 'dark') === 'light') applyTheme('light');
}
function applyTheme(t) {
  document.body.classList.toggle('light', t === 'light');
  const icon = $('themeIcon');
  if (!icon) return;
  if (t === 'light') {
    icon.innerHTML = '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
  } else {
    icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
  }
}
function bindTheme() {
  $('toggleTheme').addEventListener('click', () => {
    const t = document.body.classList.contains('light') ? 'dark' : 'light';
    localStorage.setItem('ft_theme', t);
    applyTheme(t);
    renderCharts(); // re-render for theme colors
  });
}

/* ══════════════════════════════════════════════
   CURRENCY
══════════════════════════════════════════════ */
function loadCurrency() {
  const sel = $('currencySelect');
  if (!sel) return;
  sel.value = currency;
}
function bindCurrency() {
  $('currencySelect').addEventListener('change', e => {
    currency = e.target.value;
    localStorage.setItem('ft_currency', JSON.stringify(currency));
    renderAll();
  });
}

/* ══════════════════════════════════════════════
   NAVIGATION
══════════════════════════════════════════════ */
function bindNav() {
  document.querySelectorAll('.nav-btn, .mobile-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll('.nav-btn, .mobile-nav-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll(`.nav-btn[data-tab="${tab}"], .mobile-nav-btn[data-tab="${tab}"]`).forEach(b => b.classList.add('active'));
      document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
      $(tab).classList.add('active');
      if (tab === 'reports') renderReports();
      $('mobileNav').classList.add('hidden');
      $('hamburger').classList.remove('open');
    });
  });
}

function switchTab(tab) {
  document.querySelectorAll('.nav-btn, .mobile-nav-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tab);
  });
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  $(tab).classList.add('active');
}

function bindHamburger() {
  const btn  = $('hamburger');
  const menu = $('mobileNav');
  btn.addEventListener('click', () => {
    btn.classList.toggle('open');
    menu.classList.toggle('hidden');
  });
}

function bindViewAll() {
  $('viewAllBtn').addEventListener('click', () => switchTab('transactions'));
}

/* ══════════════════════════════════════════════
   CATEGORIES
══════════════════════════════════════════════ */
function populateCategories(selectId, type) {
  const sel = $(selectId);
  if (!sel) return;
  sel.innerHTML = '<option value="">Select category</option>';
  (CATEGORIES[type] || []).forEach(c => {
    const o = document.createElement('option');
    o.value = o.textContent = c;
    sel.appendChild(o);
  });
}

function populateExpenseCats(selectId) {
  populateCategories(selectId, 'expense');
}

/* ══════════════════════════════════════════════
   TYPE TOGGLE
══════════════════════════════════════════════ */
function bindTypeToggle(formPrefix) {
  const isMain  = formPrefix === 'main';
  const typeHid = isMain ? $('type')  : $('qType');
  const catSel  = isMain ? $('category') : $('qCategory');

  document.querySelectorAll(`.type-btn[data-form="${isMain ? '' : 'quick'}"]`).forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll(`.type-btn[data-form="${isMain ? '' : 'quick'}"]`).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      typeHid.value = btn.dataset.type;
      populateCategories(catSel.id, btn.dataset.type);
    });
  });
}

// Bind main form type toggle
function bindMainTypeToggle() {
  const typeHid = $('type');
  const catSel  = $('category');
  document.querySelectorAll('.type-btn:not([data-form="quick"])').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.type-btn:not([data-form="quick"])').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      typeHid.value = btn.dataset.type;
      populateCategories('category', btn.dataset.type);
    });
  });
}

function bindQuickTypeToggle() {
  const typeHid = $('qType');
  document.querySelectorAll('.type-btn[data-form="quick"]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.type-btn[data-form="quick"]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      typeHid.value = btn.dataset.type;
      populateCategories('qCategory', btn.dataset.type);
    });
  });
}

/* ══════════════════════════════════════════════
   TRANSACTION FORM
══════════════════════════════════════════════ */
function bindForm() {
  bindMainTypeToggle();
  $('transactionForm').addEventListener('submit', submitTransaction);
  $('cancelEditBtn').addEventListener('click', cancelEdit);
}

function submitTransaction(e) {
  e.preventDefault();

  const tx = {
    id:        editingId || Date.now(),
    type:      $('type').value,
    amount:    parseFloat($('amount').value),
    category:  $('category').value,
    date:      $('date').value,
    note:      $('note').value.trim(),
    recurring: $('recurring').checked,
  };

  if (editingId) {
    const idx = transactions.findIndex(t => t.id === editingId);
    if (idx !== -1) transactions[idx] = tx;
    cancelEdit();
    toast('Transaction updated', 'success');
  } else {
    transactions.unshift(tx);
    toast('Transaction added', 'success');
  }

  save();
  populateMonthFilters();
  $('transactionForm').reset();
  setDate('date');
  // reset type toggle to income
  document.querySelectorAll('.type-btn:not([data-form="quick"])').forEach(b => b.classList.remove('active'));
  document.querySelector('.type-btn.income-btn:not([data-form="quick"])').classList.add('active');
  $('type').value = 'income';
  populateCategories('category', 'income');
  renderAll();
}

function cancelEdit() {
  editingId = null;
  $('formTitle').textContent = 'Add Transaction';
  $('submitBtn').innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Add Transaction';
  $('cancelEditBtn').classList.add('hidden');
  $('transactionForm').reset();
  setDate('date');
  document.querySelectorAll('.type-btn:not([data-form="quick"])').forEach(b => b.classList.remove('active'));
  document.querySelector('.type-btn.income-btn:not([data-form="quick"])').classList.add('active');
  $('type').value = 'income';
  populateCategories('category', 'income');
}

function startEdit(id) {
  const tx = transactions.find(t => t.id === id);
  if (!tx) return;
  editingId = id;
  switchTab('transactions');

  $('formTitle').textContent = 'Edit Transaction';
  $('submitBtn').innerHTML   = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Save Changes';
  $('cancelEditBtn').classList.remove('hidden');

  $('type').value = tx.type;
  document.querySelectorAll('.type-btn:not([data-form="quick"])').forEach(b => {
    b.classList.toggle('active', b.dataset.type === tx.type);
  });
  populateCategories('category', tx.type);
  $('amount').value    = tx.amount;
  $('category').value  = tx.category;
  $('date').value      = tx.date;
  $('note').value      = tx.note;
  $('recurring').checked = tx.recurring;

  $('formCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  save();
  populateMonthFilters();
  renderAll();
  toast('Transaction deleted', 'danger');
}

/* ══════════════════════════════════════════════
   QUICK-ADD MODAL
══════════════════════════════════════════════ */
function bindQuickModal() {
  bindQuickTypeToggle();
  $('fabBtn').addEventListener('click', openQuick);
  $('quickClose').addEventListener('click', closeQuick);
  $('quickModalBg').addEventListener('click', closeQuick);
  $('quickForm').addEventListener('submit', submitQuick);
}

function openQuick() {
  populateCategories('qCategory', $('qType').value || 'income');
  setDate('qDate');
  $('quickModal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  setTimeout(() => $('qAmount').focus(), 80);
}
function closeQuick() {
  $('quickModal').classList.add('hidden');
  document.body.style.overflow = '';
  $('quickForm').reset();
  setDate('qDate');
  document.querySelectorAll('.type-btn[data-form="quick"]').forEach(b => b.classList.remove('active'));
  document.querySelector('.type-btn.income-btn[data-form="quick"]').classList.add('active');
  $('qType').value = 'income';
  populateCategories('qCategory', 'income');
}

function submitQuick(e) {
  e.preventDefault();
  const tx = {
    id:        Date.now(),
    type:      $('qType').value,
    amount:    parseFloat($('qAmount').value),
    category:  $('qCategory').value,
    date:      $('qDate').value,
    note:      $('qNote').value.trim(),
    recurring: false,
  };
  transactions.unshift(tx);
  save();
  populateMonthFilters();
  renderAll();
  closeQuick();
  toast('Transaction added', 'success');
}

/* ══════════════════════════════════════════════
   BUDGET MODAL
══════════════════════════════════════════════ */
function bindBudgetModal() {
  $('addBudgetBtn').addEventListener('click', () => { $('budgetModal').classList.remove('hidden'); document.body.style.overflow = 'hidden'; });
  $('closeBudgetModal').addEventListener('click', closeBudgetModal);
  $('cancelBudgetBtn').addEventListener('click', closeBudgetModal);
  $('budgetModalBg').addEventListener('click', closeBudgetModal);
  $('budgetForm').addEventListener('submit', submitBudget);
}
function closeBudgetModal() { $('budgetModal').classList.add('hidden'); document.body.style.overflow = ''; }

function submitBudget(e) {
  e.preventDefault();
  budgets.push({ id: Date.now(), category: $('budgetCategory').value, limit: parseFloat($('budgetLimit').value) });
  save();
  $('budgetForm').reset();
  closeBudgetModal();
  renderBudgets();
  toast('Budget created', 'success');
}

function deleteBudget(id) {
  budgets = budgets.filter(b => b.id !== id);
  save();
  renderBudgets();
  toast('Budget deleted', 'danger');
}

/* ══════════════════════════════════════════════
   FILTERS
══════════════════════════════════════════════ */
function bindFilters() {
  ['searchInput','filterType','filterMonth'].forEach(id => {
    $(id).addEventListener('input',  renderTransactionsList);
    $(id).addEventListener('change', renderTransactionsList);
  });
}

function filteredTransactions() {
  const q     = $('searchInput').value.toLowerCase();
  const type  = $('filterType').value;
  const month = $('filterMonth').value;
  return transactions.filter(tx => {
    const matchQ = !q || tx.note.toLowerCase().includes(q) || tx.category.toLowerCase().includes(q);
    const matchT = !type  || tx.type === type;
    const txMon  = new Date(tx.date).toLocaleString('default', { month: 'long', year: 'numeric' });
    const matchM = !month || txMon === month;
    return matchQ && matchT && matchM;
  });
}

function populateMonthFilters() {
  const months = [...new Set(transactions.map(tx =>
    new Date(tx.date).toLocaleString('default', { month: 'long', year: 'numeric' })
  ))].sort().reverse();

  ['filterMonth','reportMonth'].forEach(id => {
    const sel = $(id);
    if (!sel) return;
    const label = id === 'reportMonth' ? 'This Month' : 'All months';
    sel.innerHTML = `<option value="">${label}</option>`;
    months.forEach(m => {
      const o = document.createElement('option'); o.value = o.textContent = m; sel.appendChild(o);
    });
  });
}

/* ══════════════════════════════════════════════
   RENDER ALL
══════════════════════════════════════════════ */
function renderAll() {
  renderSummary();
  renderInsights();
  renderTransactionsList();
  renderRecentTransactions();
  renderBudgets();
  renderCharts();
}

/* ── Summary stats ── */
function renderSummary() {
  const now = new Date();
  const curMon = now.toLocaleString('default', { month: 'long', year: 'numeric' });
  const monTxs = transactions.filter(tx =>
    new Date(tx.date).toLocaleString('default', { month: 'long', year: 'numeric' }) === curMon
  );
  const income  = monTxs.filter(t => t.type === 'income').reduce((s,t) => s + t.amount, 0);
  const expense = monTxs.filter(t => t.type === 'expense').reduce((s,t) => s + t.amount, 0);
  const balance = income - expense;
  const rate    = income > 0 ? Math.max(0, Math.round((balance / income) * 100)) : 0;

  animateVal('totalIncome',  income,  fmt);
  animateVal('totalExpense', expense, fmt);
  animateVal('balance',      balance, v => (v < 0 ? '-' : '') + fmt(v));
  $('savingsRate').textContent = rate + '%';
  $('incomePeriod').textContent  = curMon;
  $('expensePeriod').textContent = curMon;
}

/* ── Insights ── */
function renderInsights() {
  const now = new Date();
  const curMon = now.toLocaleString('default', { month: 'long', year: 'numeric' });
  const monTxs = transactions.filter(tx =>
    new Date(tx.date).toLocaleString('default', { month: 'long', year: 'numeric' }) === curMon
  );
  const expenses = monTxs.filter(t => t.type === 'expense');

  // Top category
  const catTotals = {};
  expenses.forEach(t => { catTotals[t.category] = (catTotals[t.category] || 0) + t.amount; });
  const topCat = Object.entries(catTotals).sort((a,b) => b[1]-a[1])[0];

  const chipTop = $('insightTopCat');
  chipTop.querySelector('span').textContent = topCat
    ? `Top: ${CAT_ICONS[topCat[0]] || ''} ${topCat[0]} (${fmt(topCat[1])})`
    : 'Add transactions to see insights';

  // Avg daily spend
  const dayOfMonth  = now.getDate();
  const totalSpend  = expenses.reduce((s,t) => s + t.amount, 0);
  const avgDay      = dayOfMonth > 0 ? totalSpend / dayOfMonth : 0;
  $('insightAvgDay').querySelector('span').textContent = `Avg daily spend: ${fmt(avgDay)}`;

  // Tx count
  $('insightTxCount').querySelector('span').textContent = `${monTxs.length} transaction${monTxs.length !== 1 ? 's' : ''} this month`;
}

/* ── Recent transactions ── */
function renderRecentTransactions() {
  const wrap = $('recentTransactions');
  const list = transactions.slice(0, 6);
  if (!list.length) {
    wrap.innerHTML = `<div class="empty-state">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M21 15V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
      <h3>No transactions yet</h3>
      <p>Press the + button to add your first transaction</p>
    </div>`;
    return;
  }
  wrap.innerHTML = '';
  list.forEach(tx => {
    const div = el('div', `recent-item`);
    const sign = tx.type === 'income' ? '+' : '-';
    div.innerHTML = `
      <div class="recent-icon">${CAT_ICONS[tx.category] || '📌'}</div>
      <div class="recent-body">
        <div class="recent-cat">${tx.category}</div>
        <div class="recent-desc">${tx.note || new Date(tx.date).toLocaleDateString()}</div>
      </div>
      <div>
        <div class="recent-amount ${tx.type}">${sign}${fmt(tx.amount)}</div>
        <div style="font-size:.7rem;color:var(--text3);text-align:right;">${new Date(tx.date).toLocaleDateString()}</div>
      </div>`;
    wrap.appendChild(div);
  });
}

/* ── Full transactions list ── */
function renderTransactionsList() {
  const list = filteredTransactions();
  const ul   = $('transactionList');
  const badge = $('txCountBadge');
  if (badge) badge.textContent = list.length;

  if (!list.length) {
    ul.innerHTML = `<li><div class="empty-state">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <h3>No transactions found</h3>
      <p>Try adjusting your filters</p>
    </div></li>`;
    return;
  }

  ul.innerHTML = '';
  list.forEach((tx, i) => {
    const li   = el('li', 'tx-item');
    li.style.animationDelay = Math.min(i * 30, 300) + 'ms';
    const sign = tx.type === 'income' ? '+' : '-';
    li.innerHTML = `
      <div class="tx-icon">${CAT_ICONS[tx.category] || '📌'}</div>
      <div class="tx-info">
        <div class="tx-cat">
          ${tx.category}
          ${tx.recurring ? '<span class="recurring-tag">🔄 Recurring</span>' : ''}
        </div>
        <div class="tx-desc">${tx.note || 'No description'}</div>
      </div>
      <div class="tx-right">
        <div>
          <div class="tx-amount ${tx.type}">${sign}${fmt(tx.amount)}</div>
          <div class="tx-date">${new Date(tx.date).toLocaleDateString()}</div>
        </div>
        <div class="tx-actions">
          <button class="tx-action-btn edit" title="Edit" onclick="startEdit(${tx.id})">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg>
          </button>
          <button class="tx-action-btn del" title="Delete" onclick="deleteTransaction(${tx.id})">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>
      </div>`;
    ul.appendChild(li);
  });
}

/* ── Budgets ── */
function renderBudgets() {
  const wrap = $('budgetsList');
  if (!budgets.length) {
    wrap.innerHTML = `<div class="empty-state">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <h3>No budgets yet</h3>
      <p>Create a budget to track your spending limits</p>
    </div>`;
    return;
  }
  wrap.innerHTML = '';
  budgets.forEach(b => {
    const spent = transactions
      .filter(t => t.type === 'expense' && t.category === b.category)
      .reduce((s,t) => s + t.amount, 0);
    const pct   = Math.round((spent / b.limit) * 100);
    const over  = spent > b.limit;
    const warn  = !over && pct >= 80;

    const div = el('div', `budget-item${over ? ' over' : ''}`);
    div.innerHTML = `
      <div class="budget-head">
        <div class="budget-cat">
          <div class="budget-emoji">${CAT_ICONS[b.category] || '📌'}</div>
          ${b.category}
        </div>
        <button class="budget-del" onclick="deleteBudget(${b.id})" title="Delete budget">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="budget-nums">
        <span>${fmt(spent)} / ${fmt(b.limit)}</span>
        <span class="budget-pct">${pct}%</span>
      </div>
      <div class="budget-bar">
        <div class="budget-bar-fill" style="width:${Math.min(pct,100)}%"></div>
      </div>
      <div class="budget-status ${over ? 'over' : warn ? 'warn' : 'ok'}">
        ${over
          ? `⚠ Over budget by ${fmt(spent - b.limit)}`
          : warn
            ? `⚡ ${fmt(b.limit - spent)} remaining — nearly at limit`
            : `✓ ${fmt(b.limit - spent)} remaining`}
      </div>`;
    wrap.appendChild(div);
  });
}

/* ══════════════════════════════════════════════
   CHARTS
══════════════════════════════════════════════ */
function chartColors() {
  const s = getComputedStyle(document.documentElement);
  return {
    text:   s.getPropertyValue('--text').trim()  || '#f4f4f5',
    text2:  s.getPropertyValue('--text2').trim() || '#a1a1aa',
    border: s.getPropertyValue('--border').trim()|| 'rgba(255,255,255,.07)',
    bg2:    s.getPropertyValue('--bg2').trim()   || '#111116',
  };
}

function renderCharts() {
  renderExpenseChart();
  renderTrendChart();
}

function renderExpenseChart() {
  const data = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    data[t.category] = (data[t.category] || 0) + t.amount;
  });
  const labels = Object.keys(data);
  const empty  = $('expenseChartEmpty');
  const wrap   = document.querySelector('#expenseChart').parentElement;

  if (!labels.length) {
    $('expenseChart').style.display = 'none';
    empty.classList.remove('hidden');
    return;
  }
  $('expenseChart').style.display = '';
  empty.classList.add('hidden');

  const c = chartColors();
  if (charts.expense) charts.expense.destroy();
  charts.expense = new Chart($('expenseChart'), {
    type: 'doughnut',
    data: { labels, datasets: [{ data: Object.values(data), backgroundColor: COLORS, borderColor: c.bg2, borderWidth: 3, hoverOffset: 8 }] },
    options: {
      responsive: true, maintainAspectRatio: true, cutout: '62%',
      plugins: {
        legend: { position: 'bottom', labels: { color: c.text2, padding: 14, font: { size: 12, weight: '600' } } },
        tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${fmt(ctx.raw)}` } }
      }
    }
  });
}

function renderTrendChart() {
  const monthly = {};
  transactions.forEach(tx => {
    const key = new Date(tx.date).toLocaleString('default', { month: 'short', year: 'numeric' });
    if (!monthly[key]) monthly[key] = { income: 0, expense: 0 };
    if (tx.type === 'income') monthly[key].income += tx.amount;
    else monthly[key].expense += tx.amount;
  });

  const labels = Object.keys(monthly).sort((a,b) => new Date('1 '+a) - new Date('1 '+b));
  const empty  = $('trendChartEmpty');

  if (!labels.length) {
    $('trendChart').style.display = 'none';
    empty.classList.remove('hidden');
    return;
  }
  $('trendChart').style.display = '';
  empty.classList.add('hidden');

  const c = chartColors();
  if (charts.trend) charts.trend.destroy();
  charts.trend = new Chart($('trendChart'), {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Income',   data: labels.map(m => monthly[m].income),  borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,.08)', borderWidth: 2.5, tension: .4, fill: true, pointRadius: 4, pointBackgroundColor: '#10b981' },
        { label: 'Expenses', data: labels.map(m => monthly[m].expense), borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,.08)',   borderWidth: 2.5, tension: .4, fill: true, pointRadius: 4, pointBackgroundColor: '#ef4444' },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: true,
      plugins: { legend: { labels: { color: c.text2, font: { size: 12, weight: '600' } } }, tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ${fmt(ctx.raw)}` } } },
      scales: {
        y: { ticks: { color: c.text2, callback: v => currency + v }, grid: { color: c.border } },
        x: { ticks: { color: c.text2 }, grid: { color: c.border } }
      }
    }
  });
}

/* ── Reports ── */
function renderReports() {
  renderCategoryChart();
  renderIncomeExpenseChart();
  renderMonthlySummary();
}

function renderCategoryChart() {
  const data = {};
  transactions.filter(t => t.type === 'expense').forEach(t => { data[t.category] = (data[t.category] || 0) + t.amount; });
  const labels = Object.keys(data);
  if (charts.cat) charts.cat.destroy();
  const c = chartColors();
  charts.cat = new Chart($('categoryChart'), {
    type: 'bar',
    data: { labels, datasets: [{ label: 'Spending', data: Object.values(data), backgroundColor: COLORS, borderRadius: 6 }] },
    options: {
      responsive: true, indexAxis: 'y',
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${fmt(ctx.raw)}` } } },
      scales: {
        x: { ticks: { color: c.text2, callback: v => currency + v }, grid: { color: c.border } },
        y: { ticks: { color: c.text2 } }
      }
    }
  });
}

function renderIncomeExpenseChart() {
  const months = {};
  transactions.forEach(tx => {
    const k = new Date(tx.date).toLocaleString('default', { month: 'short', year: 'numeric' });
    if (!months[k]) months[k] = { income:0, expense:0 };
    if (tx.type === 'income') months[k].income += tx.amount;
    else months[k].expense += tx.amount;
  });
  const labels = Object.keys(months).sort((a,b) => new Date('1 '+a) - new Date('1 '+b));
  if (charts.ie) charts.ie.destroy();
  const c = chartColors();
  charts.ie = new Chart($('incomeExpenseChart'), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Income',   data: labels.map(m => months[m].income),  backgroundColor: '#10b981', borderRadius: 6 },
        { label: 'Expenses', data: labels.map(m => months[m].expense), backgroundColor: '#ef4444', borderRadius: 6 },
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: c.text2, font: { weight:'600' } } }, tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ${fmt(ctx.raw)}` } } },
      scales: {
        y: { ticks: { color: c.text2, callback: v => currency + v }, grid: { color: c.border } },
        x: { ticks: { color: c.text2 }, grid: { color: c.border } }
      }
    }
  });
}

function renderMonthlySummary() {
  const months = {};
  transactions.forEach(tx => {
    const k = new Date(tx.date).toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!months[k]) months[k] = { income:0, expense:0 };
    if (tx.type === 'income') months[k].income += tx.amount;
    else months[k].expense += tx.amount;
  });

  const keys = Object.keys(months).sort().reverse();
  if (!keys.length) {
    $('monthlySummary').innerHTML = `<div class="empty-state"><p>No data yet</p></div>`;
    return;
  }
  let html = `<table class="summary-table"><thead><tr><th>Month</th><th>Income</th><th>Expenses</th><th>Balance</th></tr></thead><tbody>`;
  keys.forEach(m => {
    const { income, expense } = months[m];
    const bal = income - expense;
    html += `<tr>
      <td>${m}</td>
      <td style="color:var(--green);font-weight:700;">${fmt(income)}</td>
      <td style="color:var(--red);font-weight:700;">${fmt(expense)}</td>
      <td style="color:${bal>=0?'var(--green)':'var(--red)'};font-weight:700;">${bal<0?'-':''}${fmt(bal)}</td>
    </tr>`;
  });
  html += `</tbody></table>`;
  $('monthlySummary').innerHTML = html;
}

/* ══════════════════════════════════════════════
   EXPORT CSV
══════════════════════════════════════════════ */
function bindExport() {
  $('exportBtn').addEventListener('click', () => {
    let csv = 'Date,Category,Type,Amount,Description\n';
    transactions.forEach(tx => {
      csv += `${tx.date},${tx.category},${tx.type},${tx.amount},"${(tx.note||'').replace(/"/g,'""')}"\n`;
    });
    const url = URL.createObjectURL(new Blob([csv], { type:'text/csv' }));
    const a   = Object.assign(document.createElement('a'), { href:url, download:`fintrack-${new Date().toISOString().slice(0,10)}.csv` });
    a.click();
    URL.revokeObjectURL(url);
    toast('Exported to CSV', 'success');
  });
}

/* ══════════════════════════════════════════════
   ANIMATED VALUE
══════════════════════════════════════════════ */
function animateVal(id, target, formatter) {
  const el = $(id);
  if (!el) return;
  const start    = parseFloat(el.dataset.raw || '0') || 0;
  el.dataset.raw = target;
  const diff  = target - start;
  const steps = 24;
  let   frame = 0;
  const tick  = () => {
    frame++;
    const v = start + diff * (frame / steps);
    el.textContent = formatter(frame >= steps ? target : v);
    if (frame < steps) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ══════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════ */
function toast(msg, type = 'success', dur = 2800) {
  const wrap = $('toastWrap');
  const t    = document.createElement('div');
  t.className = `toast ${type}`;
  const icon = type === 'success'
    ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>'
    : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>';
  t.innerHTML = icon + ' ' + msg;
  wrap.appendChild(t);
  setTimeout(() => {
    t.classList.add('out');
    t.addEventListener('animationend', () => t.remove(), { once: true });
  }, dur);
}
