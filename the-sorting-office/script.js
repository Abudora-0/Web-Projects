/* ═══════════════════════════════════════════════════════
   THE SORTING OFFICE - email validator | script.js
   Client-side engine + live DNS-over-HTTPS domain lookup
   + optional emailvalidation.io API.
   ═══════════════════════════════════════════════════════ */

/* ── Disposable domains ─────────────────────────────────── */
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
  'getairmail.com','mt2014.com','mt2015.com','mt2016.com','10minutemail.com',
  'sharedmailbox.org','objectmail.com','mailseal.de','emailondeck.com',
]);

/* ── Free providers ─────────────────────────────────────── */
const FREE = new Set([
  'gmail.com','googlemail.com','yahoo.com','yahoo.co.uk','yahoo.co.in','yahoo.fr','yahoo.de',
  'hotmail.com','hotmail.co.uk','hotmail.fr','hotmail.de','hotmail.it',
  'outlook.com','outlook.fr','outlook.de','live.com','live.co.uk','live.fr',
  'msn.com','icloud.com','me.com','mac.com','aol.com',
  'protonmail.com','protonmail.ch','proton.me','pm.me',
  'mail.com','gmx.com','gmx.net','gmx.de','gmx.us',
  'zoho.com','yandex.com','yandex.ru','tutanota.com','fastmail.com',
]);

/* ── Role prefixes ──────────────────────────────────────── */
const ROLE_PREFIXES = [
  'admin','administrator','info','information','support','help','helpdesk',
  'contact','sales','billing','accounts','marketing','webmaster','hostmaster',
  'postmaster','noreply','no-reply','donotreply','do-not-reply','bounce',
  'mailer','daemon','listserv','newsletter','notification','notifications',
  'alerts','feedback','report','root','security','abuse','spam','privacy',
  'legal','careers','jobs','hr','team','office','service','services','enquiries',
];

/* ── Typo domain fixes ──────────────────────────────────── */
const DOMAIN_FIXES = {
  'gmail.con':'gmail.com','gmail.co':'gmail.com','gmail.cm':'gmail.com',
  'gmial.com':'gmail.com','gmal.com':'gmail.com','gmai.com':'gmail.com',
  'gamail.com':'gmail.com','gnail.com':'gmail.com','gmail.comm':'gmail.com',
  'yahooo.com':'yahoo.com','yahoo.con':'yahoo.com','yaho.com':'yahoo.com',
  'yaoo.com':'yahoo.com','yhaoo.com':'yahoo.com','yahoo.co':'yahoo.com',
  'hotmial.com':'hotmail.com','hotamail.com':'hotmail.com','hotmai.com':'hotmail.com',
  'hotmail.con':'hotmail.com','hotmil.com':'hotmail.com','hotmal.com':'hotmail.com',
  'outllok.com':'outlook.com','outook.com':'outlook.com','outlook.con':'outlook.com',
  'outlok.com':'outlook.com','outloo.com':'outlook.com',
  'icloud.con':'icloud.com','icoud.com':'icloud.com','iclould.com':'icloud.com',
  'aol.con':'aol.com','protonmai.com':'protonmail.com','proton.mail':'proton.me',
};

/* ── Plus-tag / dot-trick providers ─────────────────────── */
const PLUS_PROVIDERS = new Set([
  'gmail.com','googlemail.com','outlook.com','hotmail.com','live.com',
  'fastmail.com','protonmail.com','proton.me','pm.me','icloud.com','me.com','yandex.com',
]);

const EMAIL_RE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

/* ── Deliverability notes ───────────────────────────────── */
const TIPS = {
  invalid_format: "This doesn't parse as an email. Look for spaces, a missing @, or a domain with no dot.",
  disposable:     "A disposable inbox that self-destructs. Block these at signup and require a real address for anything transactional.",
  typo:           "A one-character domain typo. Show the correction inline before the user submits - it recovers most of these.",
  role:           "A shared address (info@, sales@) read by several people or none. Fine for B2B, weak for personal onboarding.",
  gibberish:      "The local part looks keyboard-mashed. Often a throwaway or a bot - send a confirmation email before trusting it.",
  nomx:           "The domain publishes no mail server. Mail to it will bounce - treat as undeliverable.",
  free:           "A personal free-mail address. Not a problem, but useful for B2B lead scoring.",
};

/* ── Sample mailbag ─────────────────────────────────────── */
const SAMPLE_MAILBAG = [
  'jane.okafor@acme.co.uk',
  'sales@bigcorp.com',
  'j.o.h.n+newsletters@gmail.com',
  'm.hassan@outlook.con',
  'xkq4v9zzp@mailinator.com',
  'asdfghjkl2847@gmail.com',
  'contact@nonexistent-domain-xyz-42.test',
  'MARIA.SANTOS@Yahoo.Com',
  'noreply@github.com',
  'not an email',
  'lars@fastmail.com',
  'temp9981@10minutemail.com',
].join('\n');

/* ══════════════════════════════════════════════════════════
   ENGINE
   ══════════════════════════════════════════════════════════ */
function gibberishScore(local) {
  const core = String(local).split('+')[0].replace(/[._-]/g, '');
  if (core.length < 4) return 0;
  const lower = core.toLowerCase();
  const letters = core.replace(/[^a-z]/gi, '');
  let s = 0;

  const vowels = (core.match(/[aeiou]/gi) || []).length;
  const vRatio = letters.length ? vowels / letters.length : 0;
  if (letters.length >= 5 && vRatio < 0.16) s += 0.42;
  if (core.length >= 7 && vowels === 0) s += 0.26;

  const runs = (core.match(/[bcdfghjklmnpqrstvwxz]{4,}/gi) || []).map((x) => x.length);
  if (runs.length && Math.max.apply(null, runs) >= 5) s += 0.34;

  if (/(.)\1{3,}/.test(core)) s += 0.3;

  const rows = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm', '1234567890', 'abcdefgh'];
  const kb = rows.some((r) => {
    for (let i = 0; i <= r.length - 4; i++) if (lower.indexOf(r.slice(i, i + 4)) !== -1) return true;
    return false;
  });
  if (kb) s += 0.34;

  const digits = (core.match(/\d/g) || []).length;
  if (core.length > 6 && digits / core.length > 0.42) s += 0.24;

  if (letters.length >= 9) {
    const uniq = new Set(lower).size / core.length;
    if (uniq > 0.85 && vRatio < 0.34) s += 0.2;
  }
  return Math.min(1, s);
}

function canonicalize(username, domain) {
  let local = username;
  let d = domain;
  if (d === 'gmail.com' || d === 'googlemail.com') {
    local = local.split('+')[0].replace(/\./g, '');
    d = 'gmail.com';
  } else if (PLUS_PROVIDERS.has(d)) {
    local = local.split('+')[0];
  } else {
    return null;
  }
  const canon = local + '@' + d;
  return canon === (username + '@' + domain) ? null : canon;
}

async function dohDomain(domain) {
  if (!domain || !domain.includes('.')) return { mx: false, a: false, err: false };
  const ask = (type) => fetch(
    'https://cloudflare-dns.com/dns-query?name=' + encodeURIComponent(domain) + '&type=' + type,
    { headers: { accept: 'application/dns-json' } }
  ).then((r) => (r.ok ? r.json() : Promise.reject()));
  try {
    const mxr = await ask('MX');
    const mx = Array.isArray(mxr.Answer) && mxr.Answer.some((x) => x.type === 15);
    if (mx) return { mx: true, a: true, err: false };
    const ar = await ask('A');
    const a = Array.isArray(ar.Answer) && ar.Answer.some((x) => x.type === 1);
    return { mx: false, a: a, err: false };
  } catch (e) {
    return { mx: false, a: false, err: true };
  }
}

function validateEmailClient(email) {
  email = email.trim().toLowerCase();
  const atIdx = email.lastIndexOf('@');
  const format_valid = EMAIL_RE.test(email);
  const username = atIdx > 0 ? email.slice(0, atIdx) : email;
  const domain = atIdx > 0 ? email.slice(atIdx + 1) : '';
  const tld = domain.includes('.') ? domain.split('.').pop() : '';

  const disposable = DISPOSABLE.has(domain);
  const free = FREE.has(domain);
  const role = ROLE_PREFIXES.some((p) =>
    username === p || username.startsWith(p + '.') || username.startsWith(p + '_') || username.startsWith(p + '-')
  );
  const suggestion = DOMAIN_FIXES[domain] || null;
  const gib = format_valid ? gibberishScore(username) : 0;
  const gibberish = gib >= 0.6;
  const canonical = format_valid ? canonicalize(username, domain) : null;

  let score = format_valid ? 100 : 0;
  if (format_valid) {
    if (disposable) score -= 42;
    if (suggestion) score -= 25;
    if (gibberish) score -= 28;
    if (role) score -= 10;
  }
  score = Math.max(0, Math.min(100, score));

  const issues = [];
  if (!format_valid) issues.push('Invalid format');
  if (disposable) issues.push('Disposable domain');
  if (suggestion) issues.push('Possible typo');
  if (gibberish) issues.push('Looks auto-generated');
  if (role) issues.push('Role-based address');

  let state = 'valid';
  if (!format_valid || disposable) state = 'invalid';
  else if (suggestion || role || gibberish) state = 'risky';

  return {
    email, format_valid, username, domain, tld, disposable, role, free,
    gibberish, gib, canonical, suggestion,
    has_mx: format_valid ? 'unknown' : false,
    dns_a: null, smtp_check: 'client-only',
    score, state, issues,
  };
}

function applyDNS(data, dns) {
  data.dns_a = dns.a;
  if (dns.err) { data.has_mx = 'unknown'; return data; }
  data.has_mx = dns.mx;
  if (data.format_valid && !dns.mx && !dns.a && !data.free) {
    data.has_mx = false;
    data.score = Math.max(0, data.score - 35);
    data.state = 'invalid';
    if (data.issues.indexOf('No mail server') === -1) data.issues.push('No mail server');
  }
  return data;
}

function mergeApiResult(client, api) {
  if (!api) return client;
  return Object.assign({}, client, {
    has_mx: api.mx_found !== undefined ? api.mx_found : client.has_mx,
    smtp_check: api.smtp_check !== undefined ? api.smtp_check : client.smtp_check,
    disposable: api.disposable !== undefined ? api.disposable : client.disposable,
    score: api.quality_score !== undefined ? Math.round(parseFloat(api.quality_score) * 100) : client.score,
    state: api.result || client.state,
  });
}

/* ══════════════════════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════════════════════ */
const $ = (s) => document.getElementById(s);
function esc(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return Math.floor(s / 60) + 'm ago';
  if (s < 86400) return Math.floor(s / 3600) + 'h ago';
  return Math.floor(s / 86400) + 'd ago';
}
function switchTab(name) {
  document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t.dataset.tab === name));
  document.querySelectorAll('.tab-pane').forEach((p) => p.classList.toggle('hidden', p.id !== 'tab-' + name));
  if (name === 'history') { renderHistory(); renderLedgerStats(); }
}
function downloadFile(text, filename, type) {
  const blob = new Blob([text], { type: type || 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
let _toastTimer = null;
function showToast(msg, isErr) {
  const el = $('toast');
  el.textContent = msg;
  el.classList.toggle('err', !!isErr);
  el.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
}

/* ══════════════════════════════════════════════════════════
   RENDER SINGLE RESULT
   ══════════════════════════════════════════════════════════ */
function renderResult(data, opts) {
  opts = opts || {};
  const card = $('resultCard');
  card.classList.remove('hidden');

  const statusMap = {
    valid: ['badge-valid', 'fa-circle-check', 'Valid'],
    risky: ['badge-risky', 'fa-triangle-exclamation', 'Risky'],
    invalid: ['badge-invalid', 'fa-circle-xmark', 'Invalid'],
  };
  const sm = statusMap[data.state] || statusMap.invalid;
  $('resultsHeader').innerHTML =
    '<span class="status-badge ' + sm[0] + '"><i class="fas ' + sm[1] + '"></i> ' + sm[2] + '</span>' +
    '<span class="results-email">' + esc(data.email) + '</span>';

  const fill = $('scoreFill');
  const val = $('scoreVal');
  fill.style.width = '0';
  const color = data.score >= 70 ? 'var(--ink-green)' : data.score >= 40 ? 'var(--ink-amber)' : 'var(--post-red)';
  fill.style.background = color;
  val.textContent = data.score + '%';
  val.style.color = color;
  setTimeout(() => { fill.style.width = data.score + '%'; }, 60);

  const mxText = data.has_mx === 'checking' ? '<i class="fas fa-spinner fa-spin"></i> looking up'
    : data.has_mx === true ? 'Found'
    : data.has_mx === false ? (data.dns_a ? 'None (site only)' : 'Not found')
    : 'Unknown';
  const mxCls = data.has_mx === true ? 'v-true' : data.has_mx === false ? 'v-false' : 'v-muted';

  const items = [
    ['Username', esc(data.username || '-'), ''],
    ['Domain', esc(data.domain || '-'), ''],
    ['TLD', '.' + esc(data.tld || '-'), ''],
    ['Format', data.format_valid ? 'Valid' : 'Invalid', data.format_valid ? 'v-true' : 'v-false'],
    ['Mail server', mxText, mxCls],
    ['Disposable', data.disposable ? 'Yes' : 'No', data.disposable ? 'v-false' : 'v-true'],
    ['Auto-generated', data.gibberish ? 'Likely' : 'No', data.gibberish ? 'v-warn' : 'v-true'],
    ['Role account', data.role ? 'Yes' : 'No', data.role ? 'v-warn' : 'v-true'],
    ['Free provider', data.free ? 'Yes' : 'No', data.free ? 'v-warn' : ''],
    ['Delivers to', data.canonical ? esc(data.canonical) : 'as addressed', data.canonical ? 'v-sugg' : 'v-muted'],
    ['Suggestion', data.suggestion ? esc(data.username + '@' + data.suggestion) : '-', data.suggestion ? 'v-sugg' : 'v-muted'],
    ['SMTP check', data.smtp_check === 'client-only' ? 'not run' : (data.smtp_check || '-'), data.smtp_check === 'client-only' ? 'v-muted' : ''],
  ];
  $('resultCont').innerHTML = items.map((it) =>
    '<div class="result-item"><div class="result-key">' + esc(it[0]) + '</div><div class="result-value ' + it[2] + '">' + it[1] + '</div></div>'
  ).join('');

  // deliverability notes
  const tipKeys = [];
  if (!data.format_valid) tipKeys.push('invalid_format');
  if (data.disposable) tipKeys.push('disposable');
  if (data.suggestion) tipKeys.push('typo');
  if (data.gibberish) tipKeys.push('gibberish');
  if (data.has_mx === false) tipKeys.push('nomx');
  if (data.role) tipKeys.push('role');
  if (!tipKeys.length && data.free) tipKeys.push('free');
  const tp = $('tipsPanel');
  if (tipKeys.length) {
    tp.classList.remove('hidden');
    tp.innerHTML = '<div class="tips-h"><i class="fas fa-clipboard-list"></i> Notes from the inspector</div>' +
      tipKeys.map((k) => '<p class="tip"><i class="fas fa-angle-right"></i> ' + esc(TIPS[k]) + '</p>').join('');
  } else {
    tp.classList.add('hidden'); tp.innerHTML = '';
  }

  if (!opts.skipHistory) addHistory(data);
  window._lastResult = data;
}

/* ══════════════════════════════════════════════════════════
   HISTORY + LEDGER STATS
   ══════════════════════════════════════════════════════════ */
function loadHistory() {
  try { return JSON.parse(localStorage.getItem('dv_history') || '[]'); } catch (e) { return []; }
}
function saveHistory(h) { localStorage.setItem('dv_history', JSON.stringify(h)); }

function addHistory(data) {
  let h = loadHistory();
  h = h.filter((x) => x.email !== data.email);
  h.unshift({
    email: data.email, state: data.state, score: data.score, ts: Date.now(),
    domain: data.domain, disposable: !!data.disposable, suggestion: data.suggestion || null,
  });
  if (h.length > 60) h = h.slice(0, 60);
  saveHistory(h);
  renderHistory();
  renderLedgerStats();
  updateHistCount();
}

function renderHistory() {
  const h = loadHistory();
  const list = $('histList');
  const empty = $('histEmpty');
  if (!h.length) { list.innerHTML = ''; empty.classList.remove('hidden'); return; }
  empty.classList.add('hidden');

  const icon = { valid: 'fa-circle-check', risky: 'fa-triangle-exclamation', invalid: 'fa-circle-xmark' };
  const cls = { valid: 'st-valid', risky: 'st-risky', invalid: 'st-invalid' };
  list.innerHTML = h.map((x, i) =>
    '<div class="hist-item">' +
      '<i class="fas ' + (icon[x.state] || 'fa-circle-question') + ' hist-ic ' + (cls[x.state] || '') + '"></i>' +
      '<span class="hist-email">' + esc(x.email) + '</span>' +
      '<span class="hist-meta">' + timeAgo(x.ts) + ' &middot; ' + x.score + '%</span>' +
      '<button class="hist-re" data-idx="' + i + '"><i class="fas fa-rotate-right"></i> Re-check</button>' +
    '</div>'
  ).join('');
  list.querySelectorAll('.hist-re').forEach((btn) => btn.addEventListener('click', () => {
    const item = h[+btn.dataset.idx];
    switchTab('single');
    $('emailInput').value = item.email;
    runValidation(item.email);
  }));
}

function renderLedgerStats() {
  const h = loadHistory();
  const host = $('ledgerStats');
  if (h.length < 2) { host.innerHTML = ''; return; }

  const total = h.length;
  const by = (s) => h.filter((x) => x.state === s).length;
  const pass = Math.round(by('valid') / total * 100);

  const dispCount = {};
  h.filter((x) => x.disposable && x.domain).forEach((x) => { dispCount[x.domain] = (dispCount[x.domain] || 0) + 1; });
  const topDisp = Object.keys(dispCount).sort((a, b) => dispCount[b] - dispCount[a])[0];

  const typoCount = {};
  h.filter((x) => x.suggestion).forEach((x) => { typoCount[x.suggestion] = (typoCount[x.suggestion] || 0) + 1; });
  const topTypo = Object.keys(typoCount).sort((a, b) => typoCount[b] - typoCount[a])[0];

  // last 14 days sparkbars
  const days = 14;
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const buckets = new Array(days).fill(0);
  h.forEach((x) => {
    const d = Math.floor((now - new Date(x.ts).setHours(0, 0, 0, 0)) / 86400000);
    if (d >= 0 && d < days) buckets[days - 1 - d]++;
  });
  const peak = Math.max(1, Math.max.apply(null, buckets));
  const bars = buckets.map((n) =>
    '<span class="spk-bar" style="height:' + Math.round(n / peak * 100) + '%" title="' + n + '"></span>'
  ).join('');

  host.innerHTML =
    '<div class="ledger-stats">' +
      '<div class="ls-row">' +
        '<div class="ls-tile"><span class="ls-num">' + total + '</span><span class="ls-lbl">inspected</span></div>' +
        '<div class="ls-tile"><span class="ls-num">' + pass + '%</span><span class="ls-lbl">first-class</span></div>' +
        '<div class="ls-tile"><span class="ls-num st-risky">' + by('risky') + '</span><span class="ls-lbl">quarantined</span></div>' +
        '<div class="ls-tile"><span class="ls-num st-invalid">' + by('invalid') + '</span><span class="ls-lbl">returned</span></div>' +
      '</div>' +
      '<div class="ls-spark"><span class="ls-lbl">last ' + days + ' days</span><div class="spark">' + bars + '</div></div>' +
      (topDisp || topTypo ?
        '<div class="ls-notes">' +
          (topDisp ? '<span><i class="fas fa-fire"></i> most-seen disposable: <b>' + esc(topDisp) + '</b></span>' : '') +
          (topTypo ? '<span><i class="fas fa-spell-check"></i> most-corrected typo: <b>&rarr; ' + esc(topTypo) + '</b></span>' : '') +
        '</div>' : '') +
    '</div>';
}

function updateHistCount() {
  const n = loadHistory().length;
  $('histCount').textContent = n || '';
}

/* ══════════════════════════════════════════════════════════
   RUN SINGLE
   ══════════════════════════════════════════════════════════ */
let lastApiKey = localStorage.getItem('dv_apikey') || '';

async function runValidation(email) {
  const btn = $('submitBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking';

  const client = validateEmailClient(email);

  // API path
  if (lastApiKey) {
    try {
      const res = await fetch('https://emailvalidation.io/v1/?email=' + encodeURIComponent(email) + '&apikey=' + lastApiKey);
      if (res.ok) {
        renderResult(mergeApiResult(client, await res.json()));
        btn.disabled = false; btn.innerHTML = '<i class="fas fa-magnifying-glass"></i> Validate';
        return;
      }
    } catch (e) { /* fall through */ }
  }

  // client + live DNS
  if (client.format_valid) client.has_mx = 'checking';
  renderResult(client, { skipHistory: true });
  if (client.format_valid) {
    const dns = await dohDomain(client.domain);
    applyDNS(client, dns);
  }
  renderResult(client);
  btn.disabled = false;
  btn.innerHTML = '<i class="fas fa-magnifying-glass"></i> Validate';
}

/* ══════════════════════════════════════════════════════════
   BATCH
   ══════════════════════════════════════════════════════════ */
let _batchResults = [];
const EMAIL_EXTRACT = /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+/g;

function parseBatch(text) {
  return Array.from(new Set((text.match(EMAIL_EXTRACT) || []).map((e) => e.trim().toLowerCase())));
}

async function runBatch() {
  const raw = $('batchInput').value;
  const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return;

  const btn = $('batchBtn');
  btn.disabled = true;
  _batchResults = lines.map(validateEmailClient);

  if ($('batchMx').checked) {
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking domains';
    const uniqueDomains = Array.from(new Set(_batchResults.filter((r) => r.format_valid).map((r) => r.domain)));
    const dnsMap = {};
    const chunk = 6;
    for (let i = 0; i < uniqueDomains.length; i += chunk) {
      const slice = uniqueDomains.slice(i, i + chunk);
      const res = await Promise.all(slice.map((d) => dohDomain(d)));
      slice.forEach((d, j) => { dnsMap[d] = res[j]; });
    }
    _batchResults.forEach((r) => { if (r.format_valid && dnsMap[r.domain]) applyDNS(r, dnsMap[r.domain]); });
  }
  btn.disabled = false;
  btn.innerHTML = '<i class="fas fa-play"></i> Sort the Mailbag';

  renderBatch();
  showToast('Sorted ' + lines.length + ' address' + (lines.length !== 1 ? 'es' : ''));
}

function renderBatch() {
  const rs = _batchResults;
  const valid = rs.filter((r) => r.state === 'valid').length;
  const risky = rs.filter((r) => r.state === 'risky').length;
  const invalid = rs.filter((r) => r.state === 'invalid').length;

  $('batchSummary').innerHTML =
    '<span class="sum-pill sum-total"><i class="fas fa-list"></i> ' + rs.length + ' total</span>' +
    '<span class="sum-pill sum-valid"><i class="fas fa-circle-check"></i> ' + valid + ' deliverable</span>' +
    '<span class="sum-pill sum-risky"><i class="fas fa-triangle-exclamation"></i> ' + risky + ' quarantine</span>' +
    '<span class="sum-pill sum-invalid"><i class="fas fa-circle-xmark"></i> ' + invalid + ' return</span>';

  $('segmentBar').innerHTML =
    '<span class="seg-lbl">Sort into:</span>' +
    '<button class="btn-ghost sm" data-seg="valid"><i class="fas fa-inbox"></i> Deliverable (' + valid + ')</button>' +
    '<button class="btn-ghost sm" data-seg="risky"><i class="fas fa-box-archive"></i> Quarantine (' + risky + ')</button>' +
    '<button class="btn-ghost sm" data-seg="invalid"><i class="fas fa-rotate-left"></i> Return to sender (' + invalid + ')</button>';
  $('segmentBar').querySelectorAll('[data-seg]').forEach((b) => b.addEventListener('click', () => exportSegment(b.dataset.seg)));

  const icon = { valid: 'fa-circle-check', risky: 'fa-triangle-exclamation', invalid: 'fa-circle-xmark' };
  const cls = { valid: 'st-valid', risky: 'st-risky', invalid: 'st-invalid' };
  $('batchBody').innerHTML = rs.map((r) =>
    '<tr>' +
      '<td class="bt-email">' + esc(r.email) + '</td>' +
      '<td><span class="bt-status ' + cls[r.state] + '"><i class="fas ' + icon[r.state] + '"></i>' + r.state + '</span></td>' +
      '<td class="bt-score ' + (r.score >= 70 ? 'st-valid' : r.score >= 40 ? 'st-risky' : 'st-invalid') + '">' + r.score + '%</td>' +
      '<td class="bt-issues">' + (r.issues.join(', ') || '-') + '</td>' +
    '</tr>'
  ).join('');

  $('batchResults').classList.remove('hidden');
}

function exportSegment(seg) {
  const label = { valid: 'deliverable', risky: 'quarantine', invalid: 'return-to-sender' }[seg];
  const list = _batchResults.filter((r) => r.state === seg).map((r) => r.email);
  if (!list.length) { showToast('Nothing in that pile', true); return; }
  navigator.clipboard.writeText(list.join('\n'))
    .then(() => showToast(list.length + ' addresses copied (' + label + ')'))
    .catch(() => {});
  downloadFile(list.join('\n'), 'sorting-office-' + label + '.txt', 'text/plain');
}

/* ══════════════════════════════════════════════════════════
   POSTMARK REPORT (feature J)
   ══════════════════════════════════════════════════════════ */
function makeStamp(d) {
  const pad = (s, n) => (s + '                                   ').slice(0, n);
  return [
    '=== THE SORTING OFFICE ============',
    ' ' + pad(d.email, 33),
    ' status ......... ' + d.state.toUpperCase(),
    ' deliverability . ' + d.score + '%',
    ' mail server .... ' + (d.has_mx === true ? 'found' : d.has_mx === false ? 'none' : 'unknown'),
    ' flags .......... ' + (d.issues.length ? d.issues.join(', ') : 'none'),
    ' inspected ...... ' + new Date().toLocaleDateString(),
    '==================================',
  ].join('\n');
}
function postmark(d) {
  const stamp = makeStamp(d);
  try { location.replace('#insp=' + btoa(d.email)); } catch (e) {}
  navigator.clipboard.writeText(stamp + '\n' + location.href)
    .then(() => showToast('Postmark + shareable link copied'))
    .catch(() => showToast('Postmark:\n' + stamp));
}

/* ══════════════════════════════════════════════════════════
   THEME (feature I)
   ══════════════════════════════════════════════════════════ */
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t === 'night' ? 'night' : 'day');
  const i = $('themeBtn').querySelector('i');
  i.className = t === 'night' ? 'fas fa-sun' : 'fas fa-moon';
}
function toggleTheme() {
  const next = document.documentElement.getAttribute('data-theme') === 'night' ? 'day' : 'night';
  localStorage.setItem('dv_theme', next);
  applyTheme(next);
  showToast(next === 'night' ? 'Night shift' : 'Day shift');
}

/* ══════════════════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  applyTheme(localStorage.getItem('dv_theme') || 'day');

  document.querySelectorAll('.tab').forEach((btn) =>
    btn.addEventListener('click', () => switchTab(btn.dataset.tab)));

  const input = $('emailInput');
  const rtDot = $('rtDot');
  const hint = $('suggHint');

  $('validateForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = input.value.trim();
    if (v) runValidation(v);
  });

  let rtTimer = null;
  input.addEventListener('input', () => {
    rtDot.className = 'rt-dot typing';
    hint.classList.add('hidden');
    clearTimeout(rtTimer);
    rtTimer = setTimeout(() => {
      const v = input.value.trim();
      if (!v) { rtDot.className = 'rt-dot'; input.classList.remove('v-ok', 'v-err'); return; }
      const atIdx = v.lastIndexOf('@');
      const domain = atIdx > 0 ? v.slice(atIdx + 1).toLowerCase() : '';
      const fix = DOMAIN_FIXES[domain];
      if (fix) {
        hint.classList.remove('hidden');
        const suggested = v.slice(0, atIdx + 1) + fix;
        hint.innerHTML = '<i class="fas fa-lightbulb"></i> Did you mean <span class="sugg-link" id="suggApply">' + esc(suggested) + '</span>?';
        $('suggApply').addEventListener('click', () => {
          input.value = suggested; hint.classList.add('hidden');
          rtDot.className = 'rt-dot ok'; input.classList.remove('v-err'); input.classList.add('v-ok');
        });
      }
      const ok = EMAIL_RE.test(v);
      rtDot.className = 'rt-dot ' + (ok ? 'ok' : 'err');
      input.classList.remove('v-ok', 'v-err');
      input.classList.add(ok ? 'v-ok' : 'v-err');
    }, 320);
  });

  $('copyResult').addEventListener('click', () => {
    const card = $('resultCard');
    if (card.classList.contains('hidden')) return;
    const email = card.querySelector('.results-email').textContent;
    const vals = Array.from(card.querySelectorAll('.result-item')).map((el) =>
      el.querySelector('.result-key').textContent + ': ' + el.querySelector('.result-value').textContent).join('\n');
    navigator.clipboard.writeText('Email: ' + email + '\n' + vals)
      .then(() => showToast('Copied to clipboard')).catch(() => showToast('Copy failed', true));
  });

  $('exportSingle').addEventListener('click', () => {
    const card = $('resultCard');
    if (card.classList.contains('hidden')) return;
    const email = card.querySelector('.results-email').textContent;
    const rows = Array.from(card.querySelectorAll('.result-item')).map((el) => {
      const k = el.querySelector('.result-key').textContent;
      const v = el.querySelector('.result-value').textContent;
      return '"' + k.replace(/"/g, '""') + '","' + v.replace(/"/g, '""') + '"';
    });
    downloadFile('"Email","' + email.replace(/"/g, '""') + '"\n"Field","Value"\n' + rows.join('\n'), 'email-validation.csv');
    showToast('Exported');
  });

  $('postmarkBtn').addEventListener('click', () => { if (window._lastResult) postmark(window._lastResult); });

  // API key
  const apiToggle = $('apiToggle');
  const apiRow = $('apiRow');
  const apiInput = $('apiKeyInput');
  if (lastApiKey) apiInput.value = lastApiKey;
  apiToggle.addEventListener('click', () => {
    apiRow.classList.toggle('hidden');
    const open = !apiRow.classList.contains('hidden');
    apiToggle.innerHTML = '<i class="fas fa-key"></i> ' + (open ? 'Hide API key' : 'Use API key for live SMTP check');
  });
  $('saveApiKey').addEventListener('click', () => {
    lastApiKey = apiInput.value.trim();
    localStorage.setItem('dv_apikey', lastApiKey);
    showToast(lastApiKey ? 'API key saved' : 'API key cleared');
  });

  // Batch
  const batchInput = $('batchInput');
  const setCount = () => {
    const n = batchInput.value.split('\n').map((l) => l.trim()).filter(Boolean).length;
    $('batchCount').textContent = n === 1 ? '1 email' : n + ' emails';
  };
  batchInput.addEventListener('input', setCount);
  $('batchBtn').addEventListener('click', runBatch);
  $('sampleBatch').addEventListener('click', () => { batchInput.value = SAMPLE_MAILBAG; setCount(); showToast('Sample mailbag loaded'); });
  $('clearBatch').addEventListener('click', () => {
    batchInput.value = ''; setCount();
    $('batchResults').classList.add('hidden'); _batchResults = [];
  });
  $('exportBatch').addEventListener('click', () => {
    if (!_batchResults.length) return;
    const header = 'Email,Status,Score,MailServer,Disposable,Role,Gibberish,Issues\n';
    const rows = _batchResults.map((r) =>
      '"' + r.email + '","' + r.state + '","' + r.score + '","' + (r.has_mx === true ? 'found' : r.has_mx === false ? 'none' : 'n/a') +
      '","' + r.disposable + '","' + r.role + '","' + r.gibberish + '","' + r.issues.join('; ').replace(/"/g, '""') + '"'
    ).join('\n');
    downloadFile(header + rows, 'batch-validation.csv');
    showToast('CSV exported');
  });

  // File drop
  const dz = $('dropzone');
  ['dragenter', 'dragover'].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.add('drag'); }));
  ['dragleave', 'drop'].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); if (ev === 'dragleave' && dz.contains(e.relatedTarget)) return; dz.classList.remove('drag'); }));
  dz.addEventListener('drop', (e) => {
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const found = parseBatch(String(reader.result));
      if (!found.length) { showToast('No email addresses in that file', true); return; }
      const existing = parseBatch(batchInput.value);
      batchInput.value = Array.from(new Set(existing.concat(found))).join('\n');
      setCount();
      showToast('Loaded ' + found.length + ' address' + (found.length !== 1 ? 'es' : '') + ' from ' + file.name);
    };
    reader.readAsText(file);
  });

  // Ledger
  $('clearHist').addEventListener('click', () => {
    localStorage.removeItem('dv_history');
    renderHistory(); renderLedgerStats(); updateHistCount();
    showToast('Ledger cleared');
  });

  // Theme + shortcuts
  $('themeBtn').addEventListener('click', toggleTheme);
  const sheet = $('shortcutsSheet');
  const openSheet = () => sheet.classList.remove('hidden');
  const closeSheet = () => sheet.classList.add('hidden');
  $('shortcutsBtn').addEventListener('click', openSheet);
  $('shortcutsClose').addEventListener('click', closeSheet);
  sheet.addEventListener('click', (e) => { if (e.target === sheet) closeSheet(); });

  // Keyboard
  const typing = () => /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeSheet(); return; }
    if (typing()) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && document.activeElement === batchInput) { e.preventDefault(); runBatch(); }
      return;
    }
    if (e.key === '/') { e.preventDefault(); switchTab('single'); input.focus(); }
    else if (e.key === '?') { openSheet(); }
    else if (e.key === 'n' || e.key === 'N') { toggleTheme(); }
    else if (e.key === '1') switchTab('single');
    else if (e.key === '2') switchTab('batch');
    else if (e.key === '3') switchTab('history');
  });
  document.addEventListener('paste', (e) => {
    if (typing()) return;
    const t = ((e.clipboardData || window.clipboardData).getData('text') || '').trim();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) {
      switchTab('single'); input.value = t; runValidation(t);
    }
  });

  // Shared postmark link
  const m = location.hash.match(/^#insp=(.+)$/);
  if (m) {
    try {
      const email = atob(decodeURIComponent(m[1]));
      if (/@/.test(email)) { input.value = email; runValidation(email); }
    } catch (err) { /* ignore */ }
  }

  renderHistory();
  renderLedgerStats();
  updateHistCount();
});
