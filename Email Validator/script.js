/* ═══════════════════════════════════════════════════════
   DeValidator — Email Validator  |  script.js
   Client-side engine + optional emailvalidation.io API
   ═══════════════════════════════════════════════════════ */

// ── Disposable domains (50+) ─────────────────────────────
const DISPOSABLE = new Set([
  'mailinator.com','guerrillamail.com','guerrillamail.net','guerrillamail.org',
  'guerrillamail.info','guerrillamail.biz','guerrillamail.de','grr.la',
  'yopmail.com','yopmail.fr','cool.fr.nf','jetable.fr.nf','nospam.ze.tc',
  'nomail.xl.cx','mega.zik.dj','speed.1s.fr','courriel.fr.nf','moncourrier.fr.nf',
  'monemail.fr.nf','monmail.fr.nf','trashmail.com','trashmail.me','trashmail.net',
  'trashmail.at','trashmail.io','trashmail.org','trashmail.xyz',
  'tempmail.com','temp-mail.org','temp-mail.io','tempr.email','tmpmail.net',
  'tmpmail.org','throwam.com','throwam.net','throwam.org',
  'dispostable.com','mailnull.com','spambog.com','spam4.me','spamgourmet.com',
  'sharklasers.com','guerrillamailblock.com','spam.la','spamherelots.com',
  'fakeinbox.com','fakeinbox.net','maildrop.cc','spamex.com','mailexpire.com',
  'mailmetrash.com','trashdevil.com','trashdevil.de','mailscrap.com',
  'spamthisplease.com','tempinbox.com','mailslayer.com','sogetthis.com',
  'spamobox.com','jnxjn.com','klzlk.com','discard.email','ezdisposable.com',
  'nwytg.net','mailnew.com','jetable.net','jetable.org','jetable.pp.ua',
  'notsharingmy.info','owlpic.com','filzmail.com','tempomail.fr','mailhazard.com',
  'getairmail.com','mt2014.com','mt2015.com','mt2016.com',
  'sharedmailbox.org','objectmail.com','mailseal.de',
]);

// ── Free providers ───────────────────────────────────────
const FREE = new Set([
  'gmail.com','yahoo.com','yahoo.co.uk','yahoo.co.in','yahoo.fr','yahoo.de',
  'hotmail.com','hotmail.co.uk','hotmail.fr','hotmail.de','hotmail.it',
  'outlook.com','outlook.fr','outlook.de','live.com','live.co.uk','live.fr',
  'msn.com','icloud.com','me.com','mac.com','aol.com',
  'protonmail.com','protonmail.ch','pm.me',
  'mail.com','gmx.com','gmx.net','gmx.de','gmx.us',
  'zoho.com','yandex.com','yandex.ru','tutanota.com',
]);

// ── Role prefixes ─────────────────────────────────────────
const ROLE_PREFIXES = [
  'admin','administrator','info','information','support','help','helpdesk',
  'contact','sales','billing','accounts','marketing','webmaster','hostmaster',
  'postmaster','noreply','no-reply','donotreply','do-not-reply','bounce',
  'mailer','daemon','listserv','newsletter','notification','notifications',
  'alerts','feedback','report','root','security','abuse','spam','privacy',
  'legal','careers','jobs','hr','team','office','service','services',
];

// ── Typo domain fixes ─────────────────────────────────────
const DOMAIN_FIXES = {
  'gmail.con':'gmail.com','gmail.co':'gmail.com','gmail.cm':'gmail.com',
  'gmial.com':'gmail.com','gmal.com':'gmail.com','gmai.com':'gmail.com',
  'gamail.com':'gmail.com','gnail.com':'gmail.com',
  'yahooo.com':'yahoo.com','yahoo.con':'yahoo.com','yaho.com':'yahoo.com',
  'yaoo.com':'yahoo.com','yhaoo.com':'yahoo.com',
  'hotmial.com':'hotmail.com','hotamail.com':'hotmail.com','hotmai.com':'hotmail.com',
  'hotmail.con':'hotmail.com','hotmil.com':'hotmail.com',
  'outllok.com':'outlook.com','outook.com':'outlook.com','outlook.con':'outlook.com',
  'outlok.com':'outlook.com',
  'icloud.con':'icloud.com','icoud.com':'icloud.com',
  'aol.con':'aol.com','protonmai.com':'protonmail.com',
};

// ── Email format regex ────────────────────────────────────
const EMAIL_RE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

// ── Client-side validation engine ────────────────────────
function validateEmailClient(email) {
  email = email.trim().toLowerCase();
  const atIdx = email.lastIndexOf('@');
  const format_valid = EMAIL_RE.test(email);
  const username = atIdx > 0 ? email.slice(0, atIdx) : email;
  const domain   = atIdx > 0 ? email.slice(atIdx + 1) : '';
  const tld      = domain.includes('.') ? domain.split('.').pop() : '';

  const disposable = DISPOSABLE.has(domain);
  const free       = FREE.has(domain);
  const role       = ROLE_PREFIXES.some(p =>
    username === p ||
    username.startsWith(p + '.') ||
    username.startsWith(p + '_') ||
    username.startsWith(p + '-')
  );
  const suggestion = DOMAIN_FIXES[domain] || null;

  let score = format_valid ? 100 : 0;
  if (format_valid) {
    if (disposable) score -= 40;
    if (suggestion) score -= 25;
    if (role)       score -= 10;
  }
  score = Math.max(0, Math.min(100, score));

  const issues = [];
  if (!format_valid) issues.push('Invalid format');
  if (disposable)    issues.push('Disposable domain');
  if (suggestion)    issues.push(`Possible typo`);
  if (role)          issues.push('Role-based address');

  let state = 'valid';
  if (!format_valid || disposable) state = 'invalid';
  else if (suggestion || role)     state = 'risky';

  return { email, format_valid, username, domain, tld, disposable, role, free,
           has_mx: format_valid ? 'unknown' : false,
           smtp_check: 'client-only',
           suggestion,
           score, state, issues };
}

// ── Merge optional API result ─────────────────────────────
function mergeApiResult(client, api) {
  if (!api) return client;
  return {
    ...client,
    has_mx:     api.mx_found   !== undefined ? api.mx_found   : client.has_mx,
    smtp_check: api.smtp_check !== undefined ? api.smtp_check : client.smtp_check,
    disposable: api.disposable !== undefined ? api.disposable : client.disposable,
    score:      api.quality_score !== undefined
                  ? Math.round(parseFloat(api.quality_score) * 100)
                  : client.score,
    state:      api.result || client.state,
  };
}

// ── Utility ───────────────────────────────────────────────
function esc(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60)    return 'just now';
  if (s < 3600)  return Math.floor(s/60) + 'm ago';
  if (s < 86400) return Math.floor(s/3600) + 'h ago';
  return Math.floor(s/86400) + 'd ago';
}

function switchTab(name) {
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.toggle('hidden', p.id !== 'tab-' + name));
}

// ── Render result ─────────────────────────────────────────
function renderResult(data) {
  const card = document.getElementById('resultCard');
  card.classList.remove('hidden');

  const statusMap = {
    valid:   ['badge-valid',   'fa-circle-check',           'Valid'],
    risky:   ['badge-risky',   'fa-triangle-exclamation',   'Risky'],
    invalid: ['badge-invalid', 'fa-circle-xmark',           'Invalid'],
  };
  const [cls, icon, lbl] = statusMap[data.state] || statusMap['invalid'];
  document.getElementById('resultsHeader').innerHTML = `
    <span class="status-badge ${cls}"><i class="fas ${icon}"></i> ${lbl}</span>
    <span class="results-email">${esc(data.email)}</span>`;

  // Score bar
  const fill = document.getElementById('scoreFill');
  const val  = document.getElementById('scoreVal');
  fill.style.width = '0';
  const scoreColor = data.score >= 70 ? '#2e7d4f' : data.score >= 40 ? '#b97f10' : '#b0413e';
  fill.style.background = scoreColor;
  val.textContent = data.score + '%';
  val.style.color = scoreColor;
  setTimeout(() => { fill.style.width = data.score + '%'; }, 60);

  // Detail grid
  const items = [
    ['Username',      data.username || '—',   ''],
    ['Domain',        data.domain   || '—',   ''],
    ['TLD',           '.' + (data.tld || '—'), ''],
    ['Format',        data.format_valid ? 'Valid' : 'Invalid',  data.format_valid ? 'v-true' : 'v-false'],
    ['Disposable',    data.disposable ? 'Yes' : 'No',           data.disposable ? 'v-false' : 'v-true'],
    ['Role Account',  data.role ? 'Yes' : 'No',                 data.role ? 'v-warn' : 'v-true'],
    ['Free Provider', data.free ? 'Yes' : 'No',                 data.free ? 'v-warn' : ''],
    ['MX Record',
      data.has_mx === true ? 'Found' : data.has_mx === false ? 'Not found' : 'Unknown',
      data.has_mx === true ? 'v-true' : data.has_mx === false ? 'v-false' : 'v-muted'],
    ['SMTP Check',    data.smtp_check === 'client-only' ? 'N/A (client)' : (data.smtp_check || '—'),
                      data.smtp_check === 'client-only' ? 'v-muted' : ''],
    ['Suggestion',    data.suggestion ? `→ ${esc(data.suggestion)}` : '—',
                      data.suggestion ? 'v-sugg' : 'v-muted'],
  ];

  document.getElementById('resultCont').innerHTML = items.map(([k, v, c]) =>
    `<div class="result-item">
       <div class="result-key">${esc(k)}</div>
       <div class="result-value ${c}">${v}</div>
     </div>`
  ).join('');

  addHistory(data);
}

// ── History ───────────────────────────────────────────────
function loadHistory() {
  try { return JSON.parse(localStorage.getItem('dv_history') || '[]'); } catch { return []; }
}
function saveHistory(h) { localStorage.setItem('dv_history', JSON.stringify(h)); }

function addHistory(data) {
  let h = loadHistory();
  h = h.filter(x => x.email !== data.email);
  h.unshift({ email: data.email, state: data.state, score: data.score, ts: Date.now() });
  if (h.length > 30) h = h.slice(0, 30);
  saveHistory(h);
  renderHistory();
  updateHistCount();
}

function renderHistory() {
  const h     = loadHistory();
  const list  = document.getElementById('histList');
  const empty = document.getElementById('histEmpty');

  if (!h.length) {
    list.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  const stateIcon  = { valid:'fa-circle-check', risky:'fa-triangle-exclamation', invalid:'fa-circle-xmark' };
  const stateColor = { valid:'#2e7d4f', risky:'#b97f10', invalid:'#b0413e' };

  list.innerHTML = h.map((x, i) => `
    <div class="hist-item">
      <i class="fas ${stateIcon[x.state] || 'fa-circle-question'}" style="color:${stateColor[x.state]||'#6f6350'};font-size:.8rem;flex-shrink:0"></i>
      <span class="hist-email">${esc(x.email)}</span>
      <span class="hist-meta">${timeAgo(x.ts)} &middot; ${x.score}%</span>
      <button class="hist-re" data-idx="${i}"><i class="fas fa-rotate-right"></i> Re-check</button>
    </div>`).join('');

  list.querySelectorAll('.hist-re').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = h[+btn.dataset.idx];
      switchTab('single');
      document.getElementById('emailInput').value = item.email;
      runValidation(item.email);
    });
  });
}

function updateHistCount() {
  const h = loadHistory();
  document.getElementById('histCount').textContent = h.length || '';
}

// ── Validation runner ─────────────────────────────────────
let lastApiKey = localStorage.getItem('dv_apikey') || '';

async function runValidation(email) {
  const btn = document.getElementById('submitBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking…';

  const client = validateEmailClient(email);

  if (lastApiKey) {
    try {
      const res = await fetch(`https://emailvalidation.io/v1/?email=${encodeURIComponent(email)}&apikey=${lastApiKey}`);
      if (res.ok) {
        const api = await res.json();
        renderResult(mergeApiResult(client, api));
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-magnifying-glass"></i> Validate';
        return;
      }
    } catch { /* fall through */ }
  }

  renderResult(client);
  btn.disabled = false;
  btn.innerHTML = '<i class="fas fa-magnifying-glass"></i> Validate';
}

// ── Batch ─────────────────────────────────────────────────
let _batchResults = [];

function runBatch() {
  const lines = document.getElementById('batchInput').value
    .split('\n').map(l => l.trim()).filter(Boolean);
  if (!lines.length) return;

  _batchResults = lines.map(validateEmailClient);

  const valid   = _batchResults.filter(r => r.state === 'valid').length;
  const invalid = _batchResults.filter(r => r.state === 'invalid').length;
  const risky   = _batchResults.filter(r => r.state === 'risky').length;

  document.getElementById('batchSummary').innerHTML = `
    <span class="sum-pill sum-total"><i class="fas fa-list"></i> ${lines.length} total</span>
    <span class="sum-pill sum-valid"><i class="fas fa-circle-check"></i> ${valid} valid</span>
    <span class="sum-pill sum-risky"><i class="fas fa-triangle-exclamation"></i> ${risky} risky</span>
    <span class="sum-pill sum-invalid"><i class="fas fa-circle-xmark"></i> ${invalid} invalid</span>`;

  const stateIcon  = { valid:'fa-circle-check', risky:'fa-triangle-exclamation', invalid:'fa-circle-xmark' };
  const stateColor = { valid:'#2e7d4f', risky:'#b97f10', invalid:'#b0413e' };

  document.getElementById('batchBody').innerHTML = _batchResults.map(r => `
    <tr>
      <td class="bt-email">${esc(r.email)}</td>
      <td><span style="color:${stateColor[r.state]};display:flex;align-items:center;gap:.4rem;font-size:.8rem;font-weight:600">
        <i class="fas ${stateIcon[r.state]}"></i>${r.state}
      </span></td>
      <td style="font-weight:600;color:${r.score>=70?'#2e7d4f':r.score>=40?'#b97f10':'#b0413e'}">${r.score}%</td>
      <td style="font-size:.75rem;color:#6f6350">${r.issues.join(', ') || '—'}</td>
    </tr>`).join('');

  document.getElementById('batchResults').classList.remove('hidden');
  showToast(`Validated ${lines.length} email${lines.length !== 1 ? 's' : ''}`);
}

// ── CSV export ────────────────────────────────────────────
function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ── Toast ─────────────────────────────────────────────────
let _toastTimer = null;
function showToast(msg, isErr = false) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.style.borderColor = isErr ? 'rgba(231,76,60,.4)' : 'var(--border)';
  el.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
}

// ── DOM ready ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // Tabs
  document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.dataset.tab);
      if (btn.dataset.tab === 'history') renderHistory();
    });
  });

  // Single form
  const input = document.getElementById('emailInput');
  const rtDot = document.getElementById('rtDot');
  const hint  = document.getElementById('suggHint');

  document.getElementById('validateForm').addEventListener('submit', e => {
    e.preventDefault();
    const v = input.value.trim();
    if (v) runValidation(v);
  });

  // Real-time dot (debounced 320ms)
  let rtTimer = null;
  input.addEventListener('input', () => {
    rtDot.className = 'rt-dot typing';
    hint.classList.add('hidden');
    clearTimeout(rtTimer);
    rtTimer = setTimeout(() => {
      const v = input.value.trim();
      if (!v) { rtDot.className = 'rt-dot'; input.classList.remove('v-ok','v-err'); return; }

      const atIdx = v.lastIndexOf('@');
      const domain = atIdx > 0 ? v.slice(atIdx + 1).toLowerCase() : '';
      const fix = DOMAIN_FIXES[domain];

      if (fix) {
        hint.classList.remove('hidden');
        const suggested = v.slice(0, atIdx + 1) + fix;
        hint.innerHTML = `<i class="fas fa-lightbulb"></i> Did you mean <span class="sugg-link" id="suggApply">${esc(suggested)}</span>?`;
        document.getElementById('suggApply').addEventListener('click', () => {
          input.value = suggested;
          hint.classList.add('hidden');
          rtDot.className = 'rt-dot ok';
          input.classList.remove('v-ok','v-err'); input.classList.add('v-ok');
        });
      }

      if (EMAIL_RE.test(v)) {
        rtDot.className = 'rt-dot ok';
        input.classList.remove('v-ok','v-err'); input.classList.add('v-ok');
      } else {
        rtDot.className = 'rt-dot err';
        input.classList.remove('v-ok','v-err'); input.classList.add('v-err');
      }
    }, 320);
  });

  // Copy result
  document.getElementById('copyResult').addEventListener('click', () => {
    const card = document.getElementById('resultCard');
    if (card.classList.contains('hidden')) return;
    const email = card.querySelector('.results-email')?.textContent || '';
    const vals  = [...card.querySelectorAll('.result-item')].map(el =>
      `${el.querySelector('.result-key').textContent}: ${el.querySelector('.result-value').textContent}`
    ).join('\n');
    navigator.clipboard.writeText(`Email: ${email}\n${vals}`)
      .then(() => showToast('Copied to clipboard'))
      .catch(() => showToast('Copy failed', true));
  });

  // Export single
  document.getElementById('exportSingle').addEventListener('click', () => {
    const card = document.getElementById('resultCard');
    if (card.classList.contains('hidden')) return;
    const email = card.querySelector('.results-email')?.textContent || '';
    const rows  = [...card.querySelectorAll('.result-item')].map(el => {
      const k = el.querySelector('.result-key').textContent;
      const v = el.querySelector('.result-value').textContent;
      return `"${k.replace(/"/g,'""')}","${v.replace(/"/g,'""')}"`;
    });
    downloadCSV(`"Email","${email.replace(/"/g,'""')}"\n"Field","Value"\n${rows.join('\n')}`, 'email-validation.csv');
    showToast('Exported');
  });

  // API key toggle
  const apiToggle = document.getElementById('apiToggle');
  const apiRow    = document.getElementById('apiRow');
  const apiInput  = document.getElementById('apiKeyInput');
  if (lastApiKey) apiInput.value = lastApiKey;

  apiToggle.addEventListener('click', () => {
    apiRow.classList.toggle('hidden');
    const open = !apiRow.classList.contains('hidden');
    apiToggle.innerHTML = `<i class="fas fa-key"></i> ${open ? 'Hide API key' : 'Use API key for live SMTP check'}`;
  });

  document.getElementById('saveApiKey').addEventListener('click', () => {
    lastApiKey = apiInput.value.trim();
    localStorage.setItem('dv_apikey', lastApiKey);
    showToast(lastApiKey ? 'API key saved' : 'API key cleared');
  });

  // Batch
  const batchInput = document.getElementById('batchInput');
  const batchCount = document.getElementById('batchCount');

  batchInput.addEventListener('input', () => {
    const n = batchInput.value.split('\n').map(l => l.trim()).filter(Boolean).length;
    batchCount.textContent = n === 1 ? '1 email' : `${n} emails`;
  });

  document.getElementById('batchBtn').addEventListener('click', runBatch);

  document.getElementById('clearBatch').addEventListener('click', () => {
    batchInput.value = '';
    batchCount.textContent = '0 emails';
    document.getElementById('batchResults').classList.add('hidden');
    _batchResults = [];
  });

  document.getElementById('exportBatch').addEventListener('click', () => {
    if (!_batchResults.length) return;
    const header = 'Email,Status,Score,Disposable,Role,Issues\n';
    const rows   = _batchResults.map(r =>
      `"${r.email}","${r.state}","${r.score}","${r.disposable}","${r.role}","${r.issues.join('; ').replace(/"/g,'""')}"`
    ).join('\n');
    downloadCSV(header + rows, 'batch-validation.csv');
    showToast('CSV exported');
  });

  // History - clear
  document.getElementById('clearHist').addEventListener('click', () => {
    localStorage.removeItem('dv_history');
    renderHistory();
    updateHistCount();
    showToast('History cleared');
  });

  // Init
  renderHistory();
  updateHistCount();
});
