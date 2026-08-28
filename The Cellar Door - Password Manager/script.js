/* ═══════════════════════════════════════════════════════
   THE CELLAR DOOR - a speakeasy for your secrets
   The whole ledger is AES-256-GCM encrypted with a key
   derived from the house word (PBKDF2, 210k rounds).
   Nothing readable ever touches localStorage.
   ═══════════════════════════════════════════════════════ */

'use strict';

const STORE = 'cellardoor_v1';
const LEGACY_STORES = ['blindtiger_v1'];
const PBKDF2_ITER = 210000;

// in-memory only - gone the moment the doors close
let KEY = null;      // CryptoKey
let SALT = null;     // Uint8Array
let VAULT = null;    // { entries: [], settings: {} }

const $ = id => document.getElementById(id);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ═══ crypto plumbing ═══════════════════════════════ */
const enc = new TextEncoder();
const dec = new TextDecoder();

function b64(bytes) { return btoa(String.fromCharCode(...new Uint8Array(bytes))); }
function unb64(str) { return Uint8Array.from(atob(str), c => c.charCodeAt(0)); }

async function deriveKey(word, salt, iter) {
  const base = await crypto.subtle.importKey('raw', enc.encode(word), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: iter, hash: 'SHA-256' },
    base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']
  );
}

async function sealVault() {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, KEY, enc.encode(JSON.stringify(VAULT)));
  localStorage.setItem(STORE, JSON.stringify({
    v: 1, iter: PBKDF2_ITER, salt: b64(SALT), iv: b64(iv), data: b64(data)
  }));
  LEGACY_STORES.forEach(k => localStorage.removeItem(k));
}

function readStoredBlob() {
  let raw = localStorage.getItem(STORE);
  if (!raw) for (const k of LEGACY_STORES) { raw = localStorage.getItem(k); if (raw) break; }
  return raw ? JSON.parse(raw) : null;
}

async function unsealBlob(blob, word) {
  const salt = unb64(blob.salt);
  const key = await deriveKey(word, salt, blob.iter || PBKDF2_ITER);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(blob.iv) }, key, unb64(blob.data));
  return { vault: JSON.parse(dec.decode(plain)), key, salt };
}

function randInt(max) { // unbiased
  const lim = Math.floor(0x100000000 / max) * max;
  const buf = new Uint32Array(1);
  do { crypto.getRandomValues(buf); } while (buf[0] >= lim);
  return buf[0] % max;
}

async function sha1hex(str) {
  const buf = await crypto.subtle.digest('SHA-1', enc.encode(str));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

/* ═══ TOTP (one-time codes) ═════════════════════════ */
function base32Decode(s) {
  const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  s = String(s || '').replace(/[\s=-]/g, '').toUpperCase();
  let bits = 0, val = 0;
  const out = [];
  for (const c of s) {
    const i = A.indexOf(c);
    if (i < 0) return null;
    val = (val << 5) | i; bits += 5;
    if (bits >= 8) { out.push((val >>> (bits - 8)) & 0xff); bits -= 8; }
  }
  return new Uint8Array(out);
}
function totpValid(secret) {
  const k = base32Decode(secret);
  return !!(k && k.length >= 10);
}
async function totpCode(secret, period = 30, digits = 6, atMs = Date.now()) {
  const key = base32Decode(secret);
  if (!key || !key.length) return null;
  const counter = Math.floor(atMs / 1000 / period);
  const buf = new ArrayBuffer(8);
  const dv = new DataView(buf);
  dv.setUint32(0, Math.floor(counter / 4294967296), false);
  dv.setUint32(4, counter >>> 0, false);
  const ck = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', ck, buf));
  const off = sig[sig.length - 1] & 0xf;
  const bin = ((sig[off] & 0x7f) << 24) | (sig[off + 1] << 16) | (sig[off + 2] << 8) | sig[off + 3];
  return String(bin % 10 ** digits).padStart(digits, '0');
}
// accepts a raw base32 secret or an otpauth:// URI
function parseTotpInput(v) {
  v = String(v || '').trim();
  if (!v) return '';
  const m = v.match(/[?&]secret=([^&\s]+)/i);
  if (m) v = decodeURIComponent(m[1]);
  return v.replace(/[\s=-]/g, '').toUpperCase();
}

/* ═══ proof (strength) ══════════════════════════════ */
function proofOf(pw, knownBits) {
  if (!pw && knownBits == null) return { bits: 0, pct: 0, tier: '', cls: '', badge: '' };
  let bits;
  if (knownBits != null) {
    bits = knownBits;
  } else {
    let cs = 0;
    if (/[a-z]/.test(pw)) cs += 26;
    if (/[A-Z]/.test(pw)) cs += 26;
    if (/[0-9]/.test(pw)) cs += 10;
    if (/[^A-Za-z0-9]/.test(pw)) cs += 33;
    bits = pw.length * Math.log2(cs || 1);
    const low = pw.toLowerCase();
    if (/(.)\1{2,}/.test(pw)) bits *= 0.75;
    if (/(0123|1234|2345|3456|4567|5678|6789|abcd|bcde|cdef|qwer|wert|erty|asdf|sdfg|zxcv|xcvb)/.test(low)) bits *= 0.6;
    if (pw.length >= 6 && pw.slice(0, Math.floor(pw.length / 2)) === pw.slice(Math.ceil(pw.length / 2))) bits *= 0.5;
    if (/(password|letmein|welcome|admin|iloveyou|dragon|monkey|qwerty|123456|abc123)/.test(low)) bits = Math.min(bits, 18);
  }
  bits = Math.round(bits);
  let tier, cls;
  if (bits < 35)      { tier = 'Watered Down';  cls = 'pf-water'; }
  else if (bits < 55) { tier = 'Light Pour';    cls = 'pf-light'; }
  else if (bits < 75) { tier = 'House Pour';    cls = 'pf-house'; }
  else                { tier = 'Full Proof';    cls = 'pf-full'; }
  return {
    bits,
    pct: Math.min(100, Math.round(bits / 90 * 100)),
    tier, cls,
    badge: Math.min(bits, 151) + ' proof'
  };
}

const PROOF_COLORS = { 'pf-water': '#c04b40', 'pf-light': '#cd9040', 'pf-house': '#c9a227', 'pf-full': '#8aa47b' };

function paintProof(fillEl, labelEl, pf) {
  fillEl.style.width = pf.pct + '%';
  fillEl.style.background = PROOF_COLORS[pf.cls] || 'transparent';
  labelEl.textContent = pf.tier ? `${pf.tier} · ${pf.bits}` : '';
  labelEl.style.color = PROOF_COLORS[pf.cls] || '';
}

/* ═══ toast ═════════════════════════════════════════ */
let _toastTimer = null;
function toast(msg, type) {
  const el = $('toast');
  $('toastMsg').textContent = msg;
  el.classList.remove('burning');
  el.classList.toggle('err', type === 'err');
  el.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
}

function toastBurn(msg, secs) {
  const el = $('toast');
  $('toastMsg').textContent = msg;
  el.classList.remove('err', 'burning');
  el.style.setProperty('--burn', secs + 's');
  void el.offsetWidth; // restart the fuse
  el.classList.add('show', 'burning');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show', 'burning'), secs * 1000);
}

/* ═══ clipboard with a fuse ═════════════════════════ */
let _burnTimer = null;
function copyBurn(txt, what) {
  navigator.clipboard.writeText(txt).then(() => {
    toastBurn(`${what} copied - the evidence burns in 20s`, 20);
    clearTimeout(_burnTimer);
    _burnTimer = setTimeout(() => { navigator.clipboard.writeText(' ').catch(() => {}); }, 20000);
  }).catch(() => toast('The clipboard refused the handoff', 'err'));
}

/* ═══ helpers ═══════════════════════════════════════ */
function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function newId() { return crypto.randomUUID ? crypto.randomUUID() : Date.now() + '-' + randInt(1e9); }

const MEDALS = [
  ['#ecd28a', '#c9a227'], ['#a9c29a', '#7d9b6e'], ['#d1938a', '#a05a50'],
  ['#9db0cc', '#64789c'], ['#b492c2', '#7c5a8c'], ['#d9a06a', '#a56a32']
];
function medalStyle(site) {
  let h = 0;
  for (const ch of String(site)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const [a, b] = MEDALS[h % MEDALS.length];
  return `background:linear-gradient(160deg,${a},${b})`;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function since(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return `since ${MONTHS[d.getMonth()]} ’${String(d.getFullYear()).slice(2)}`;
}
function agoWords(ts) {
  const days = Math.floor((Date.now() - ts) / 86400000);
  if (days < 1) return 'today';
  if (days < 60) return days + ' day' + (days === 1 ? '' : 's') + ' ago';
  const mo = Math.round(days / 30);
  if (mo < 24) return mo + ' months ago';
  return Math.round(mo / 12) + ' years ago';
}

function cleanHost(site) {
  return String(site).replace(/^(https?:\/\/)?(www\.)?/i, '').replace(/\/.*$/, '');
}
function siteUrl(site) {
  const s = String(site).trim();
  if (/^https?:\/\//i.test(s)) return s;
  const host = cleanHost(s);
  return /\.[a-z]{2,}$/i.test(host) ? 'https://' + host : null;
}

const ICONS = {
  copy: '<svg viewBox="0 0 24 24" class="ico"><rect x="8" y="8" width="12" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  eye: '<svg viewBox="0 0 24 24" class="ico"><path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  eyeOff: '<svg viewBox="0 0 24 24" class="ico"><path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z" fill="none" stroke="currentColor" stroke-width="2"/><line x1="4" y1="20" x2="20" y2="4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  pen: '<svg viewBox="0 0 24 24" class="ico"><path d="M17 3l4 4L8 20H4v-4L17 3Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  trash: '<svg viewBox="0 0 24 24" class="ico"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  out: '<svg viewBox="0 0 24 24" class="ico"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};

/* ═══ themed dropdown (custom select) ═══════════════ */
function enhanceSelect(native) {
  if (native.dataset.enhanced) return;
  native.dataset.enhanced = '1';
  const wrap = document.createElement('div');
  wrap.className = 'cd-sel';
  native.parentNode.insertBefore(wrap, native);
  wrap.appendChild(native);

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'cd-sel-trigger';
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');
  if (native.getAttribute('aria-label')) trigger.setAttribute('aria-label', native.getAttribute('aria-label'));
  trigger.innerHTML = '<span class="cd-sel-val"></span><span class="cd-sel-caret">◆</span>';
  wrap.appendChild(trigger);

  const panel = document.createElement('ul');
  panel.className = 'cd-sel-panel';
  panel.setAttribute('role', 'listbox');
  wrap.appendChild(panel);

  function build() {
    panel.innerHTML = '';
    [...native.options].forEach(opt => {
      const li = document.createElement('li');
      li.className = 'cd-sel-opt';
      li.setAttribute('role', 'option');
      li.dataset.value = opt.value;
      li.textContent = opt.textContent;
      li.setAttribute('aria-selected', opt.selected ? 'true' : 'false');
      li.addEventListener('click', () => pick(opt.value));
      panel.appendChild(li);
    });
    sync();
  }
  function sync() {
    const sel = native.options[native.selectedIndex];
    wrap.querySelector('.cd-sel-val').textContent = sel ? sel.textContent : '';
    [...panel.children].forEach(li =>
      li.setAttribute('aria-selected', li.dataset.value === native.value ? 'true' : 'false'));
  }
  function open() {
    wrap.classList.add('open');
    trigger.setAttribute('aria-expanded', 'true');
    setTimeout(() => document.addEventListener('click', outside, true), 0);
    document.addEventListener('keydown', onKey);
  }
  function close() {
    wrap.classList.remove('open');
    trigger.setAttribute('aria-expanded', 'false');
    document.removeEventListener('click', outside, true);
    document.removeEventListener('keydown', onKey);
  }
  function outside(e) { if (!wrap.contains(e.target)) close(); }
  function onKey(e) { if (e.key === 'Escape') { close(); trigger.focus(); } }
  function pick(v) {
    native.value = v;
    native.dispatchEvent(new Event('change', { bubbles: true }));
    sync(); close(); trigger.focus();
  }
  trigger.addEventListener('click', () => wrap.classList.contains('open') ? close() : open());
  native.addEventListener('change', sync);
  build();
  return { sync };
}
function enhanceAllSelects(root) {
  (root || document).querySelectorAll('select.cd-select').forEach(enhanceSelect);
}

/* ═══ brass stepper (counter) ══════════════════════ */
function buildStepper(host) {
  const range = $(host.dataset.for);
  if (!range) return;
  const min = +range.min, max = +range.max;
  host.innerHTML =
    `<button type="button" class="cd-step-btn" data-d="-1" aria-label="less">−</button>` +
    `<span class="cd-step-val">${range.value}</span>` +
    `<button type="button" class="cd-step-btn" data-d="1" aria-label="more">+</button>`;
  const valEl = host.querySelector('.cd-step-val');
  function set(n) {
    n = Math.max(min, Math.min(max, n));
    range.value = n;
    valEl.textContent = n;
    range.dispatchEvent(new Event('input', { bubbles: true }));
  }
  host.querySelectorAll('.cd-step-btn').forEach(b =>
    b.addEventListener('click', () => set(+range.value + (+b.dataset.d))));
  range.addEventListener('input', () => { valEl.textContent = range.value; });
}

/* ═══ door flow ═════════════════════════════════════ */
const REJECTIONS = [
  'That ain’t the word, friend.',
  'The house doesn’t know you.',
  'Not tonight, pal. Not tonight.',
  'Try the joint next door.',
  'Wrong word. The peephole closes.'
];
let _rejectN = 0;

function doorError() {
  const msg = $('doorMsg');
  msg.textContent = REJECTIONS[_rejectN++ % REJECTIONS.length];
  msg.classList.remove('err');
  void msg.offsetWidth;
  msg.classList.add('err');
}

function showDoor(mode) {
  $('door').classList.remove('open', 'peeking');
  $('door').style.display = '';
  $('app').classList.add('hidden');
  $('doorCreate').classList.toggle('hidden', mode !== 'create');
  $('doorUnlock').classList.toggle('hidden', mode !== 'unlock');
  const msg = $('doorMsg');
  msg.classList.remove('err');
  if (mode === 'create') {
    msg.textContent = 'New joint. Choose the house word - it becomes the encryption key.';
    const legacy = readLegacy();
    $('migrateNote').textContent = legacy.length
      ? `Found ${legacy.length} record${legacy.length > 1 ? 's' : ''} from the old vault - they’ll be moved in and sealed.` : '';
    setTimeout(() => $('createPw').focus(), 80);
  } else {
    msg.textContent = 'What’s the word?';
    $('unlockPw').value = '';
    setTimeout(() => $('unlockPw').focus(), 80);
  }
}

function openDoors() {
  $('door').classList.add('open');
  $('app').classList.remove('hidden');
  renderAll();
  restartIdleTimer();
  setTimeout(() => { $('door').style.display = 'none'; }, reduceMotion ? 0 : 1100);
}

function migrateEntry(e) {
  return {
    id: e.id || newId(),
    kind: e.kind || 'login',
    site: e.site || '', user: e.user || '', pw: e.pw || '',
    cat: e.cat || 'other', notes: e.notes || '', fav: !!e.fav,
    totp: e.totp || '', rotateEvery: e.rotateEvery || 0,
    history: Array.isArray(e.history) ? e.history.slice(-6) : [],
    createdAt: e.createdAt || Date.now(),
    pwChangedAt: e.pwChangedAt || e.createdAt || Date.now()
  };
}

function readLegacy() {
  try {
    const old = JSON.parse(localStorage.getItem('depass_v2') || localStorage.getItem('passwords') || '[]');
    return old.map(e => migrateEntry({
      site: e.website || '', user: e.username || '', pw: e.password || '',
      cat: e.category || 'other', notes: e.notes || '', createdAt: e.createdAt || Date.now()
    })).filter(e => e.site && e.pw);
  } catch { return []; }
}

$('doorCreate').addEventListener('submit', async e => {
  e.preventDefault();
  const w1 = $('createPw').value, w2 = $('createPw2').value;
  const msg = $('doorMsg');
  if (w1.length < 8) { msg.textContent = 'The house word needs at least 8 characters.'; msg.classList.add('err'); return; }
  if (w1 !== w2)     { msg.textContent = 'The two words don’t match. Say it again, slower.'; msg.classList.add('err'); return; }
  msg.classList.remove('err');
  msg.textContent = 'Sealing the ledger…';
  SALT = crypto.getRandomValues(new Uint8Array(16));
  KEY = await deriveKey(w1, SALT, PBKDF2_ITER);
  VAULT = { entries: readLegacy(), settings: { autolock: 5, emblems: false, created: Date.now() } };
  await sealVault();
  localStorage.removeItem('depass_v2');
  localStorage.removeItem('passwords');
  $('createPw').value = $('createPw2').value = '';
  openDoors();
  toast(VAULT.entries.length ? `Welcome in - ${VAULT.entries.length} old records moved behind the door` : 'Welcome in. The house knows you now.');
});

$('doorUnlock').addEventListener('submit', async e => {
  e.preventDefault();
  const word = $('unlockPw').value;
  if (!word) return;
  try {
    const res = await unsealBlob(readStoredBlob(), word);
    VAULT = res.vault; KEY = res.key; SALT = res.salt;
    VAULT.entries = (VAULT.entries || []).map(migrateEntry);
    VAULT.settings = VAULT.settings || { autolock: 5 };
    $('unlockPw').value = '';
    await sealVault();      // re-seal under the new store key
    openDoors();
  } catch {
    doorError();
    $('unlockPw').select();
  }
});

['unlockPw', 'createPw'].forEach(id => {
  $(id).addEventListener('focus', () => $('door').classList.add('peeking'));
});

$('lostLink').addEventListener('click', () => {
  askConfirm(
    'Lost the word?',
    'There is no back door and no reset - that’s the whole point. The only way forward is to burn this ledger and start a new one. Every record inside is lost.',
    'Burn it, start over',
    () => { localStorage.removeItem(STORE); LEGACY_STORES.forEach(k => localStorage.removeItem(k)); showDoor('create'); toast('The old ledger is ash. Choose a new word.'); }
  );
});

/* ═══ locking ═══════════════════════════════════════ */
let _idleTimer = null;

function lockUp(silent) {
  KEY = null; SALT = null; VAULT = null;
  clearTimeout(_idleTimer);
  clearTimeout(_burnTimer);
  stopTotpTick();
  $('cardGrid').innerHTML = '';
  $('searchInput').value = '';
  _search = ''; _cat = 'all'; _sort = 'name';
  _selectMode = false; _selected.clear();
  $('bulkBar').classList.add('hidden');
  document.querySelectorAll('#catChips .chip').forEach(c => c.classList.toggle('on', c.dataset.cat === 'all'));
  $('sortSel').value = 'name';
  $('sortSel').dispatchEvent(new Event('change'));
  $('inspectResults').innerHTML = '<div class="inspect-empty"><p>◆</p><p>The floor hasn’t been walked tonight.</p></div>';
  $('houseScore').innerHTML = '';
  $('houseLedger').innerHTML = '';
  $('mixHistory').classList.add('hidden');
  _mixHist = [];
  document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden'));
  switchPane('ledger');
  showDoor('unlock');
  if (!silent) toast('Doors closed. The street looks empty again.');
}

$('lockBtn').addEventListener('click', () => lockUp());

function restartIdleTimer() {
  clearTimeout(_idleTimer);
  if (!VAULT) return;
  const mins = VAULT.settings.autolock ?? 5;
  if (!mins) return;
  _idleTimer = setTimeout(() => lockUp(true), mins * 60000);
}
['pointerdown', 'keydown', 'wheel'].forEach(ev =>
  document.addEventListener(ev, () => { if (VAULT) restartIdleTimer(); }, { passive: true })
);

/* ═══ ledger rendering ══════════════════════════════ */
let _search = '';
let _cat = 'all';
let _sort = 'name';
let _selectMode = false;
const _selected = new Set();
const _revealed = new Set();

const CATS = { personal: 'Personal', work: 'Work', social: 'Social', banking: 'Banking', other: 'Other', note: 'Note' };

function renderAll() {
  renderLedger();
  renderHouseLedger();
  $('memberCount').textContent = VAULT ? VAULT.entries.length : 0;
}

function entryCat(e) { return e.kind === 'note' ? 'note' : (e.cat || 'other'); }

function dueForReview(e) {
  if (e.kind === 'note') return false;
  const months = e.rotateEvery || 0;
  const base = e.pwChangedAt || e.createdAt || Date.now();
  if (months) return Date.now() - base > months * 30 * 86400000;
  return Date.now() - base > 180 * 86400000;   // default house rule
}

function visibleEntries() {
  let arr = [...VAULT.entries];
  if (_cat !== 'all') arr = arr.filter(e => entryCat(e) === _cat);
  if (_search) {
    const q = _search.toLowerCase();
    arr = arr.filter(e =>
      e.site.toLowerCase().includes(q) ||
      e.user.toLowerCase().includes(q) ||
      (e.notes || '').toLowerCase().includes(q));
  }
  const counts = {};
  VAULT.entries.forEach(e => { if (e.pw) counts[e.pw] = (counts[e.pw] || 0) + 1; });
  const sorters = {
    name:   (a, b) => (b.fav - a.fav) || a.site.localeCompare(b.site),
    recent: (a, b) => (b.createdAt || 0) - (a.createdAt || 0),
    weak:   (a, b) => (proofOf(a.pw).bits || 999) - (proofOf(b.pw).bits || 999),
    reused: (a, b) => (counts[b.pw] || 0) - (counts[a.pw] || 0) || a.site.localeCompare(b.site)
  };
  arr.sort(sorters[_sort] || sorters.name);
  return arr;
}

function renderLedger() {
  const grid = $('cardGrid');
  const arr = visibleEntries();
  grid.classList.toggle('picking', _selectMode);

  if (!arr.length) {
    const bone = !VAULT.entries.length;
    grid.innerHTML = `<div class="empty-ledger">
      <p class="big">${bone ? 'The books are empty' : 'Nobody by that name'}</p>
      <p>${bone ? 'Not a soul on the ledger yet. Put someone on the books.' : 'No member matches that search or room.'}</p>
    </div>`;
    stopTotpTick();
    return;
  }

  const emblems = VAULT.settings.emblems;
  grid.innerHTML = arr.map(e => {
    const isNote = e.kind === 'note';
    const pf = e.pw ? proofOf(e.pw) : null;
    const shown = _revealed.has(e.id);
    const url = siteUrl(e.site);
    const initial = esc(cleanHost(e.site).charAt(0).toUpperCase() || '?');
    const medal = emblems && url
      ? `<span class="mc-medal emblem" style="${medalStyle(e.site)}"><img src="https://icons.duckduckgo.com/ip3/${encodeURIComponent(cleanHost(e.site))}.ico" alt="" onerror="this.remove();this.parentNode.textContent='${initial}'"/><i>${initial}</i></span>`
      : `<div class="mc-medal" style="${medalStyle(e.site)}">${isNote ? '◆' : initial}</div>`;

    return `
    <article class="mcard ${isNote ? 'is-note' : ''} ${_selected.has(e.id) ? 'picked' : ''}" data-id="${esc(e.id)}">
      <label class="mc-pick"><input type="checkbox" ${_selected.has(e.id) ? 'checked' : ''} aria-label="Select ${esc(e.site)}"/><span>✓</span></label>
      <div class="mc-top">
        ${medal}
        <div class="mc-id">
          <h3 class="mc-site">${esc(e.site)}</h3>
          ${e.user ? `<div class="mc-user"><span>${esc(e.user)}</span>
            <button class="mc-copy" data-act="copyuser" title="Copy name">${ICONS.copy}</button></div>` : ''}
        </div>
        ${url && !isNote ? `<a class="mc-open" href="${esc(url)}" target="_blank" rel="noopener noreferrer" title="Open the establishment">${ICONS.out}</a>` : ''}
        <button class="mc-fav ${e.fav ? 'on' : ''}" data-act="fav" title="Regular of the house">${e.fav ? '★' : '☆'}</button>
      </div>

      ${e.pw ? `<div class="mc-pwrow">
        <span class="mc-pw ${shown ? '' : 'masked'}">${shown ? esc(e.pw) : '•'.repeat(Math.min(e.pw.length, 16))}</span>
        <button class="mc-pwbtn" data-act="reveal" title="${shown ? 'Hide' : 'Reveal'}">${shown ? ICONS.eyeOff : ICONS.eye}</button>
        <button class="mc-pwbtn" data-act="copypw" title="Copy${isNote ? '' : ' the word (burns in 20s)'}">${ICONS.copy}</button>
      </div>` : ''}

      ${e.totp && totpValid(e.totp) ? `<div class="mc-totp" data-secret="${esc(e.totp)}">
        <span class="mc-totp-label">one-time code</span>
        <span class="mc-totp-code">••• •••</span>
        <span class="mc-totp-ring"><svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="8"/><circle cx="10" cy="10" r="8" class="mc-totp-arc"/></svg></span>
        <button class="mc-pwbtn" data-act="copytotp" title="Copy code">${ICONS.copy}</button>
      </div>` : ''}

      <div class="mc-meta">
        ${pf ? `<span class="proof-badge ${pf.cls}" title="${pf.tier}">${pf.badge}</span>` : `<span class="mc-cat">Secret</span>`}
        <span class="mc-cat">${isNote ? 'Note' : (CATS[e.cat] || 'Other')}</span>
        ${dueForReview(e) ? `<span class="mc-due" title="This word is due a review">due a review</span>` : ''}
        <span class="mc-since">${since(e.createdAt)}</span>
        <div class="mc-actions">
          <button class="mc-act" data-act="edit" title="Edit">${ICONS.pen}</button>
          <button class="mc-act danger" data-act="del" title="Strike from the books">${ICONS.trash}</button>
        </div>
      </div>
      ${e.notes && !isNote ? `<div class="mc-notes">${esc(e.notes)}</div>` : ''}
      ${isNote && e.notes ? `<div class="mc-notes body">${esc(e.notes)}</div>` : ''}
    </article>`;
  }).join('');

  startTotpTick();
}

/* ── live one-time codes ── */
let _totpTimer = null;
async function tickTotp() {
  const rows = document.querySelectorAll('#cardGrid .mc-totp');
  if (!rows.length) return stopTotpTick();
  const now = Date.now();
  const rem = 30 - Math.floor(now / 1000) % 30;
  for (const row of rows) {
    const code = await totpCode(row.dataset.secret, 30, 6, now);
    if (code) row.querySelector('.mc-totp-code').textContent = code.slice(0, 3) + ' ' + code.slice(3);
    const arc = row.querySelector('.mc-totp-arc');
    if (arc) {
      const c = 2 * Math.PI * 8;
      arc.style.strokeDasharray = c;
      arc.style.strokeDashoffset = c * (1 - rem / 30);
      arc.style.stroke = rem <= 5 ? '#c04b40' : '#c9a227';
    }
  }
}
function startTotpTick() {
  if (!document.querySelector('#cardGrid .mc-totp')) return;
  stopTotpTick();
  tickTotp();
  _totpTimer = setInterval(tickTotp, 1000);
}
function stopTotpTick() { clearInterval(_totpTimer); _totpTimer = null; }

$('cardGrid').addEventListener('click', async e => {
  const pick = e.target.closest('.mc-pick');
  if (pick) return;                       // handled by change event
  if (e.target.closest('.mc-open')) return;
  const btn = e.target.closest('[data-act]');
  if (!btn || !VAULT) return;
  const id = btn.closest('.mcard').dataset.id;
  const entry = VAULT.entries.find(x => x.id === id);
  if (!entry) return;
  switch (btn.dataset.act) {
    case 'copyuser': copyBurn(entry.user, 'Name'); break;
    case 'copypw':   copyBurn(entry.pw, entry.kind === 'note' ? 'The secret' : 'The word'); break;
    case 'copytotp': {
      const code = await totpCode(entry.totp);
      if (code) copyBurn(code, 'One-time code');
      break;
    }
    case 'reveal':
      _revealed.has(id) ? _revealed.delete(id) : _revealed.add(id);
      renderLedger();
      break;
    case 'fav':
      entry.fav = !entry.fav;
      sealVault(); renderLedger();
      break;
    case 'edit': openMemberModal(id); break;
    case 'del':
      askConfirm('Strike from the books?', `<b>${esc(entry.site)}</b> gets struck from the ledger for good. No carbon copy.`, 'Strike it', () => {
        VAULT.entries = VAULT.entries.filter(x => x.id !== id);
        _selected.delete(id);
        sealVault(); renderAll();
        toast('Struck from the books.');
      });
      break;
  }
});

$('cardGrid').addEventListener('change', e => {
  const cb = e.target.closest('.mc-pick input');
  if (!cb) return;
  const id = cb.closest('.mcard').dataset.id;
  cb.checked ? _selected.add(id) : _selected.delete(id);
  cb.closest('.mcard').classList.toggle('picked', cb.checked);
  updateBulkBar();
});

$('searchInput').addEventListener('input', function () { _search = this.value.trim(); renderLedger(); });

$('catChips').addEventListener('click', e => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  document.querySelectorAll('#catChips .chip').forEach(c => c.classList.remove('on'));
  chip.classList.add('on');
  _cat = chip.dataset.cat;
  renderLedger();
});

$('sortSel').addEventListener('change', function () { _sort = this.value; renderLedger(); });

/* ═══ bulk / "round up" ═════════════════════════════ */
function updateBulkBar() {
  $('bulkCount').textContent = _selected.size;
  $('bulkBar').classList.toggle('hidden', !_selectMode);
}
$('selectModeBtn').addEventListener('click', () => {
  _selectMode = !_selectMode;
  $('selectModeBtn').classList.toggle('on', _selectMode);
  $('selectModeBtn').textContent = _selectMode ? 'Never mind' : 'Round up';
  if (!_selectMode) _selected.clear();
  updateBulkBar();
  renderLedger();
});
$('bulkCancel').addEventListener('click', () => $('selectModeBtn').click());
$('bulkCatSel').addEventListener('change', function () {
  const cat = this.value;
  if (!cat || !_selected.size) { this.value = ''; return; }
  let n = 0;
  VAULT.entries.forEach(e => {
    if (_selected.has(e.id) && e.kind !== 'note') { e.cat = cat; n++; }
  });
  this.value = '';
  sealVault(); renderLedger();
  toast(`${n} moved to ${CATS[cat]}.`);
});
$('bulkDel').addEventListener('click', () => {
  if (!_selected.size) return;
  askConfirm('Strike the lot?', `<b>${_selected.size}</b> record${_selected.size === 1 ? '' : 's'} struck from the ledger for good.`, 'Strike them', () => {
    VAULT.entries = VAULT.entries.filter(e => !_selected.has(e.id));
    _selected.clear();
    sealVault(); renderAll(); updateBulkBar();
    toast('Struck from the books.');
  });
});

/* ═══ member modal ═════════════════════════════════ */
let _editId = null;
let _modalKind = 'login';

function setModalKind(kind) {
  _modalKind = kind;
  $('memberForm').dataset.kind = kind;
  document.querySelectorAll('.kind-opt').forEach(b => b.classList.toggle('on', b.dataset.kind === kind));
  $('fSite').placeholder = kind === 'note' ? 'Chase debit card' : 'github.com';
  $('fNotes').placeholder = kind === 'note' ? 'card number, CVV, expiry, PIN…' : 'security questions, PINs, tabs owed…';
  $('fPw').required = false;
  $('fUser').required = false;
  $('memberSubmit').textContent = _editId ? 'Amend' : (kind === 'note' ? 'Keep the secret' : 'Add to the Books');
}
document.querySelectorAll('.kind-opt').forEach(b =>
  b.addEventListener('click', () => setModalKind(b.dataset.kind)));

function renderPwHistory(entry) {
  const box = $('pwHistory'), list = $('pwHistoryList');
  const hist = (entry && entry.history) || [];
  if (!hist.length) { box.classList.add('hidden'); return; }
  box.classList.remove('hidden');
  list.innerHTML = hist.slice().reverse().map((h, i) => `
    <li>
      <span class="pwh-word masked" data-word="${esc(h.pw)}">${'•'.repeat(Math.min(h.pw.length, 14))}</span>
      <span class="pwh-when">${agoWords(h.at)}</span>
      <button type="button" class="mc-pwbtn" data-pwh-reveal="${i}" title="Reveal">${ICONS.eye}</button>
      <button type="button" class="mc-pwbtn" data-pwh-copy="${esc(h.pw)}" title="Copy">${ICONS.copy}</button>
    </li>`).join('');
}
$('pwHistoryList').addEventListener('click', e => {
  const rev = e.target.closest('[data-pwh-reveal]');
  const cp = e.target.closest('[data-pwh-copy]');
  if (rev) {
    const span = rev.closest('li').querySelector('.pwh-word');
    span.classList.toggle('masked');
    span.textContent = span.classList.contains('masked')
      ? '•'.repeat(Math.min(span.dataset.word.length, 14)) : span.dataset.word;
  }
  if (cp) copyBurn(cp.dataset.pwhCopy, 'Old word');
});

function openMemberModal(id) {
  _editId = id || null;
  $('memberForm').reset();
  $('fTotpNote').textContent = '';
  const e = id ? VAULT.entries.find(x => x.id === id) : null;

  setModalKind(e ? (e.kind || 'login') : 'login');

  if (e) {
    $('memberTitle').textContent = e.kind === 'note' ? 'Amend the Secret' : 'Amend the Record';
    $('memberSubmit').textContent = 'Amend';
    $('fSite').value = e.site; $('fUser').value = e.user; $('fPw').value = e.pw;
    $('fCat').value = e.cat || 'other'; $('fNotes').value = e.notes || '';
    $('fTotp').value = e.totp || '';
    $('fRotate').value = String(e.rotateEvery || 0);
  } else {
    $('memberTitle').textContent = 'New Member';
  }
  enhanceAllSelects($('memberForm'));
  $('fPw').type = 'password';
  paintProof($('fProofFill'), $('fProofLabel'), proofOf($('fPw').value));
  renderPwHistory(e);
  $('memberModal').classList.remove('hidden');
  setTimeout(() => $('fSite').focus(), 60);
}

$('addBtn').addEventListener('click', () => openMemberModal());

$('fPw').addEventListener('input', function () {
  paintProof($('fProofFill'), $('fProofLabel'), proofOf(this.value));
});
$('fTotp').addEventListener('input', function () {
  const s = parseTotpInput(this.value);
  $('fTotpNote').textContent = !s ? '' : totpValid(s) ? 'Looks like a valid key.' : 'That doesn’t look like a setup key yet.';
  $('fTotpNote').style.color = totpValid(s) ? 'var(--gin)' : 'var(--faint)';
});
$('fPwToggle').addEventListener('click', () => {
  const f = $('fPw');
  f.type = f.type === 'password' ? 'text' : 'password';
});
$('fFromMixer').addEventListener('click', () => {
  const { pw, bits } = mixDrink();
  $('fPw').value = pw;
  paintProof($('fProofFill'), $('fProofLabel'), proofOf(pw, bits));
  toast('The Mixologist poured one for you.');
});

$('memberForm').addEventListener('submit', async e => {
  e.preventDefault();
  const kind = _modalKind;
  const site = $('fSite').value.trim();
  const user = $('fUser').value.trim();
  const pw = $('fPw').value;
  const notes = $('fNotes').value.trim();
  const totp = parseTotpInput($('fTotp').value);
  const rotateEvery = +$('fRotate').value || 0;

  if (!site) { toast('Give it a name first.', 'err'); return; }
  if (kind === 'login' && !pw) { toast('A login needs a word.', 'err'); return; }
  if (kind === 'note' && !pw && !notes) { toast('A secret needs a value or some details.', 'err'); return; }
  if (totp && !totpValid(totp)) { toast('That one-time code key isn’t valid.', 'err'); return; }

  if (_editId) {
    const entry = VAULT.entries.find(x => x.id === _editId);
    if (entry) {
      if (entry.pw && entry.pw !== pw) {
        entry.history = [...(entry.history || []), { pw: entry.pw, at: entry.pwChangedAt || entry.createdAt || Date.now() }].slice(-6);
        entry.pwChangedAt = Date.now();
      }
      Object.assign(entry, { kind, site, user, pw, cat: kind === 'note' ? entry.cat : $('fCat').value, notes, totp, rotateEvery });
    }
    toast(kind === 'note' ? 'Secret amended.' : 'Record amended.');
  } else {
    VAULT.entries.push(migrateEntry({
      kind, site, user, pw, cat: kind === 'note' ? 'other' : $('fCat').value,
      notes, totp, rotateEvery, createdAt: Date.now(), pwChangedAt: Date.now()
    }));
    toast(kind === 'note' ? `${site} kept behind the door.` : `${site} is on the books.`);
  }
  await sealVault();
  $('memberModal').classList.add('hidden');
  _editId = null;
  renderAll();
});

/* ═══ the mixologist ════════════════════════════════ */
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const DIGIT = '0123456789';
const SYMB  = '!@#$%^&*()-_=+[]{};:,.<>?';
const AMBIG = /[0Ol1I]/g;

const WORDS = ('amber angel apron attic acorn alley anthem arch atlas avenue badge banjo ballad barrel basil baton bay beacon bell belt bench berry birch bistro blaze bloom blues bolt bonnet boot booth bourbon bower brass breeze briar brick bridge brim brogue bronze brook broom bugle butler button cameo candle cane canvas caper card cellar charm chess chime cigar clover club coat cobble cocoa coin collar copper cork corner crate cravat creed crown cuff dandy dapper derby dice dime diner ditty dome door duke dusk echo ember engine fable fedora felt fern fiddle flask flint floor fog fox foyer frost gala garnet gate gimlet gin glove grand grape gravel groove guild gusto harbor harp hat haven hazel heel hinge holly honey hound idol ink ivory jade jazz jewel jig judge juke julep keel key knock lace lamp lapel latch ledger lemon letter lilac lily lime linen lock loft lounge lucky main maple marble mask match maven medal mellow menu mercy mink mint mirror mocha moon moxie muse night nickel noble north note oak ocean olive onyx opal opera orbit organ otter oyster page palm panel pantry parade parlor patent pearl penny piano pier pipe plaza plume pocket polka pomade porch port poster prize punch quartz queen quill radio rag rail raven regal relic ribbon ring ritz river rogue rose rouge rumble sable saloon sash satin scarf scoop script sedan sepia shade shadow shine silk silver siren sleek slick smoke socket soda spade speak spiff spirit spool spruce stage stair star stein stool story stout straw stride string stroll suede sugar suite swing syrup taffy tango taxi tempo ticket tiger tile tin tonic torch trunk tulip tweed twine usher valet vault velvet verve vessel vest vigil vine vinyl violet wager waltz wax whisk willow wing wink wire wool word zest zither').split(' ');

let _mode = 'chars';
let _lastMix = null;
let _mixHist = [];

function mixChars() {
  const len = +$('optLen').value;
  const sets = [];
  if ($('optUp').checked)  sets.push(UPPER);
  if ($('optLo').checked)  sets.push(LOWER);
  if ($('optNum').checked) sets.push(DIGIT);
  if ($('optSym').checked) sets.push(SYMB);
  if (!sets.length) sets.push(LOWER, DIGIT);
  const strain = $('optAmb').checked;
  const cleaned = sets.map(s => strain ? s.replace(AMBIG, '') : s).filter(s => s.length);
  const charset = cleaned.join('');
  let pw;
  for (let tries = 0; tries < 60; tries++) {
    pw = Array.from({ length: len }, () => charset[randInt(charset.length)]).join('');
    if (cleaned.every(s => [...pw].some(c => s.includes(c)))) break;
  }
  return { pw, bits: len * Math.log2(charset.length) };
}

function mixWords() {
  const n = +$('optWords').value;
  const sep = $('optSep').value;
  const caps = $('optCaps').checked;
  const num = $('optNumSuffix').checked;
  const picked = Array.from({ length: n }, () => WORDS[randInt(WORDS.length)]);
  let bits = n * Math.log2(WORDS.length);
  if (caps) {
    const i = randInt(n);
    picked[i] = picked[i][0].toUpperCase() + picked[i].slice(1);
    bits += Math.log2(n);
  }
  let pw = picked.join(sep);
  if (num) { pw += sep + randInt(100); bits += Math.log2(100); }
  return { pw, bits };
}

function mixDrink() { return _mode === 'chars' ? mixChars() : mixWords(); }

function pushMixHistory(pw) {
  _mixHist = [pw, ..._mixHist.filter(p => p !== pw)].slice(0, 5);
  const box = $('mixHistory'), list = $('mixHistoryList');
  if (_mixHist.length <= 1) { box.classList.add('hidden'); return; }
  box.classList.remove('hidden');
  list.innerHTML = _mixHist.slice(1).map(p => `
    <li><code>${esc(p)}</code><button class="mc-pwbtn" data-mixcopy="${esc(p)}" title="Copy">${ICONS.copy}</button></li>`).join('');
}
$('mixHistoryList').addEventListener('click', e => {
  const b = e.target.closest('[data-mixcopy]');
  if (b) copyBurn(b.dataset.mixcopy, 'The pour');
});

function pourAndShow(record) {
  _lastMix = mixDrink();
  $('mixOutput').textContent = _lastMix.pw;
  paintProof($('mixProofFill'), $('mixProofLabel'), proofOf(_lastMix.pw, _lastMix.bits));
  if (record) pushMixHistory(_lastMix.pw);
}

function setMode(m) {
  _mode = m;
  $('modeChars').classList.toggle('on', m === 'chars');
  $('modeWords').classList.toggle('on', m === 'words');
  $('recipeChars').classList.toggle('hidden', m !== 'chars');
  $('recipeWords').classList.toggle('hidden', m !== 'words');
  pourAndShow();
}

$('modeChars').addEventListener('click', () => setMode('chars'));
$('modeWords').addEventListener('click', () => setMode('words'));
$('mixBtn').addEventListener('click', () => pourAndShow(true));
$('mixAgain').addEventListener('click', () => pourAndShow(true));
$('optLen').addEventListener('input', () => pourAndShow());
$('optWords').addEventListener('input', () => pourAndShow());
['optUp', 'optLo', 'optNum', 'optSym', 'optAmb', 'optCaps', 'optNumSuffix'].forEach(id =>
  $(id).addEventListener('change', () => pourAndShow()));
$('optSep').addEventListener('change', () => pourAndShow());

$('mixCopy').addEventListener('click', () => { if (_lastMix) copyBurn(_lastMix.pw, 'The pour'); });

$('mixUse').addEventListener('click', () => {
  if (!_lastMix) pourAndShow();
  switchPane('ledger');
  openMemberModal();
  $('fPw').value = _lastMix.pw;
  paintProof($('fProofFill'), $('fProofLabel'), proofOf(_lastMix.pw, _lastMix.bits));
});

/* ═══ house inspection ══════════════════════════════ */
let _breachCache = {};

function renderHouseLedger() {
  const box = $('houseLedger');
  if (!VAULT || !VAULT.entries.length) { box.innerHTML = ''; return; }
  const arr = VAULT.entries;
  const logins = arr.filter(e => e.kind !== 'note');
  const byRoom = {};
  logins.forEach(e => { byRoom[e.cat] = (byRoom[e.cat] || 0) + 1; });
  const notes = arr.length - logins.length;
  const avg = logins.length ? Math.round(logins.reduce((s, e) => s + proofOf(e.pw).bits, 0) / logins.length) : 0;
  const oldest = logins.reduce((o, e) => (!o || (e.pwChangedAt || e.createdAt) < (o.pwChangedAt || o.createdAt)) ? e : o, null);
  const favs = arr.filter(e => e.fav).length;

  box.innerHTML = `
    <div class="hl-grid">
      <div class="hl-stat"><b>${arr.length}</b><span>on the books</span></div>
      <div class="hl-stat"><b>${avg}</b><span>average proof</span></div>
      <div class="hl-stat"><b>${favs}</b><span>regulars</span></div>
      <div class="hl-stat"><b>${notes}</b><span>secrets kept</span></div>
    </div>
    <div class="hl-rooms">
      ${Object.entries(byRoom).sort((a, b) => b[1] - a[1]).map(([c, n]) =>
        `<span class="hl-room">${CATS[c] || c}<b>${n}</b></span>`).join('') || '<span class="hl-room">no logins yet</span>'}
    </div>
    ${oldest ? `<p class="hl-oldest">Oldest word on the books: <b>${esc(oldest.site)}</b>, last changed ${agoWords(oldest.pwChangedAt || oldest.createdAt)}.</p>` : ''}`;
}

function inspectItem(e, cls, desc, fixable) {
  return `<div class="insp-item ${cls}">
    <div class="insp-body">
      <div class="insp-site">${esc(e.site)}</div>
      <div class="insp-desc">${desc}</div>
    </div>
    ${fixable ? `<button class="btn-line insp-fix" data-fix="${esc(e.id)}">See to it</button>` : ''}
  </div>`;
}

function walkFloor(breaches) {
  const arr = VAULT.entries.filter(e => e.kind !== 'note');
  const box = $('inspectResults');
  if (!arr.length) {
    box.innerHTML = '<div class="inspect-empty"><p>◆</p><p>No logins on the books. Nothing to inspect.</p></div>';
    $('houseScore').innerHTML = '';
    return;
  }

  const weak = arr.filter(e => proofOf(e.pw).bits < 45);
  const counts = {};
  arr.forEach(e => { counts[e.pw] = (counts[e.pw] || 0) + 1; });
  const reusedGroups = [...new Set(arr.filter(e => counts[e.pw] > 1).map(e => e.pw))];
  const stale = arr.filter(dueForReview);
  const breached = breaches ? arr.filter(e => breaches[e.pw]) : [];
  const noTotp = arr.filter(e => e.cat === 'banking' && !e.totp);

  let html = '';

  if (breached.length) {
    html += `<div class="insp-group">Word on the street <span class="tag-count">${breached.length}</span></div>`;
    html += breached.map(e => inspectItem(e, 'bad',
      `This word has turned up in <b>${breaches[e.pw].toLocaleString()}</b> known breaches. The whole town knows it - change it tonight.`, true)).join('');
  }
  if (weak.length) {
    html += `<div class="insp-group">Watered-down pours <span class="tag-count">${weak.length}</span></div>`;
    html += weak.map(e => inspectItem(e, 'bad', `${proofOf(e.pw).badge} - too thin to serve. Let the Mixologist pour a stiffer one.`, true)).join('');
  }
  if (reusedGroups.length) {
    html += `<div class="insp-group">Double pours <span class="tag-count">${reusedGroups.length}</span></div>`;
    html += reusedGroups.map(pw => {
      const sites = arr.filter(e => e.pw === pw);
      return `<div class="insp-item warn"><div class="insp-body">
        <div class="insp-site">${sites.map(s => esc(s.site)).join(' · ')}</div>
        <div class="insp-desc">The same word opens ${sites.length} doors. One raid and they all fall.</div>
      </div></div>`;
    }).join('');
  }
  if (stale.length) {
    html += `<div class="insp-group">Past their prime <span class="tag-count">${stale.length}</span></div>`;
    html += stale.map(e => inspectItem(e, 'note',
      `Last changed ${agoWords(e.pwChangedAt || e.createdAt)}${e.rotateEvery ? ` · you asked to review this every ${e.rotateEvery} months` : ''}. Even good bottles turn.`, true)).join('');
  }
  if (noTotp.length) {
    html += `<div class="insp-group">No second lock <span class="tag-count">${noTotp.length}</span></div>`;
    html += noTotp.map(e => inspectItem(e, 'note',
      `A banking door with no one-time code on it. Add 2FA and store the setup key here.`, true)).join('');
  }

  const flagged = new Set([...breached, ...weak, ...stale].map(e => e.id));
  arr.forEach(e => { if (counts[e.pw] > 1) flagged.add(e.id); });
  const healthy = arr.length - flagged.size;
  const pct = Math.round(healthy / arr.length * 100);
  const stars = Math.max(1, Math.round(pct / 20));
  const verdicts = ['A raid waiting to happen.', 'The floor needs a mop.', 'Respectable, but tighten up.', 'A well-run establishment.', 'Spotless. The house approves.'];
  $('houseScore').innerHTML = `
    <div class="hs-stars">${'★'.repeat(stars)}${'☆'.repeat(5 - stars)}</div>
    <div class="hs-line">${pct}% of the books in good order - ${verdicts[stars - 1]}</div>`;

  box.innerHTML = html || '<div class="insp-clear">Every word strong, none repeated, all fresh. The house is in perfect order.</div>';
}

$('inspectRun').addEventListener('click', () => walkFloor(Object.keys(_breachCache).length ? _breachCache : null));

$('breachBtn').addEventListener('click', async () => {
  const logins = VAULT.entries.filter(e => e.kind !== 'note' && e.pw);
  if (!logins.length) { toast('No logins - nothing to ask about.'); return; }
  const box = $('inspectResults');
  box.innerHTML = '<div class="insp-checking">Asking around town… only the first 5 characters of each hash leave the building (k-anonymity).</div>';
  const unique = [...new Set(logins.map(e => e.pw))];
  try {
    const found = {};
    for (const pw of unique) {
      if (pw in _breachCache) { if (_breachCache[pw]) found[pw] = _breachCache[pw]; continue; }
      const h = await sha1hex(pw);
      const res = await fetch('https://api.pwnedpasswords.com/range/' + h.slice(0, 5), { headers: { 'Add-Padding': 'true' } });
      if (!res.ok) throw new Error('bad response');
      const suffix = h.slice(5);
      let count = 0;
      for (const line of (await res.text()).split('\n')) {
        const [s, c] = line.trim().split(':');
        if (s === suffix) { count = parseInt(c, 10) || 0; break; }
      }
      _breachCache[pw] = count;
      if (count) found[pw] = count;
    }
    walkFloor(found);
    toast(Object.keys(found).length
      ? `The street is talking - ${Object.keys(found).length} word${Object.keys(found).length > 1 ? 's are' : ' is'} known out there.`
      : 'Nobody’s talking. None of your words are on the street.');
  } catch {
    box.innerHTML = '<div class="inspect-empty"><p>◆</p><p>Couldn’t reach the grapevine - check the connection and try again.</p></div>';
  }
});

$('inspectResults').addEventListener('click', e => {
  const btn = e.target.closest('[data-fix]');
  if (!btn) return;
  switchPane('ledger');
  openMemberModal(btn.dataset.fix);
});

/* ═══ back office ═══════════════════════════════════ */
$('backOfficeBtn').addEventListener('click', () => {
  $('setAutolock').value = String(VAULT.settings.autolock ?? 5);
  $('setAutolock').dispatchEvent(new Event('change', { bubbles: false }));
  enhanceAllSelects($('officeModal'));
  $('officeModal').classList.remove('hidden');
});

$('setAutolock').addEventListener('change', async function () {
  if (!VAULT) return;
  VAULT.settings.autolock = +this.value;
  await sealVault();
  restartIdleTimer();
});

$('changeForm').addEventListener('submit', async e => {
  e.preventDefault();
  const oldW = $('chOld').value, n1 = $('chNew').value, n2 = $('chNew2').value;
  if (n1.length < 8) { toast('The new word needs at least 8 characters.', 'err'); return; }
  if (n1 !== n2) { toast('The new words don’t match.', 'err'); return; }
  try {
    await unsealBlob(readStoredBlob(), oldW);
  } catch { toast('That’s not the current word.', 'err'); return; }
  SALT = crypto.getRandomValues(new Uint8Array(16));
  KEY = await deriveKey(n1, SALT, PBKDF2_ITER);
  await sealVault();
  $('changeForm').reset();
  toast('The word has changed. Spread it quietly.');
});

$('expSealed').addEventListener('click', () => {
  const blob = localStorage.getItem(STORE);
  if (!blob) return;
  const payload = JSON.stringify({ ...JSON.parse(blob), app: 'cellar-door', exportedAt: new Date().toISOString() }, null, 2);
  download('cellar-door-ledger.json', payload, 'application/json');
  toast('Sealed backup slipped out the side door.');
});

let _pendingImport = null;

/* ── tiny CSV parser ── */
function parseCSV(text) {
  const rows = [];
  let row = [], field = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') q = false;
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\r') { /* skip */ }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter(r => r.some(x => x.trim() !== ''));
}
function csvToEntries(text) {
  const rows = parseCSV(text);
  if (rows.length < 2) return [];
  const head = rows[0].map(h => h.trim().toLowerCase());
  const col = (...names) => {
    for (const n of names) { const i = head.indexOf(n); if (i !== -1) return i; }
    for (let i = 0; i < head.length; i++) if (names.some(n => head[i].includes(n))) return i;
    return -1;
  };
  const iSite = col('url', 'website', 'site', 'login_uri', 'name');
  const iUser = col('username', 'user', 'login_username', 'email', 'login');
  const iPw   = col('password', 'login_password', 'pass');
  const iNote = col('note', 'notes', 'extra', 'comments');
  const iTotp = col('totp', 'login_totp', 'otpauth', 'two-factor');
  if (iPw === -1 && iSite === -1) return [];
  return rows.slice(1).map(r => {
    const site = cleanHost((r[iSite] || '').trim()) || (r[iSite] || '').trim();
    return migrateEntry({
      site, user: (r[iUser] || '').trim(), pw: (r[iPw] || '').trim(),
      notes: (r[iNote] || '').trim(), totp: parseTotpInput(r[iTotp] || ''),
      cat: 'other', createdAt: Date.now()
    });
  }).filter(e => e.site && (e.pw || e.notes));
}

$('impFile').addEventListener('change', function () {
  const file = this.files[0];
  this.value = '';
  if (!file) return;
  const reader = new FileReader();
  const isCsv = /\.csv$/i.test(file.name) || file.type === 'text/csv';
  reader.onload = () => {
    if (isCsv) {
      const entries = csvToEntries(reader.result);
      if (!entries.length) { toast('Couldn’t read any logins from that CSV.', 'err'); return; }
      askConfirm('Plain paper coming in',
        `That file has <b>${entries.length}</b> record${entries.length === 1 ? '' : 's'} in plain text. They’ll be read in and sealed under your house word.`,
        'Bring them in',
        async () => {
          const sig = new Set(VAULT.entries.map(x => `${x.site}${x.user}${x.pw}`));
          let added = 0, skipped = 0;
          for (const e of entries) {
            if (sig.has(`${e.site}${e.user}${e.pw}`)) { skipped++; continue; }
            VAULT.entries.push(e); added++;
          }
          await sealVault();
          $('officeModal').classList.add('hidden');
          renderAll();
          toast(`Brought in ${added}${skipped ? `, ${skipped} already on the books` : ''}.`);
        });
      return;
    }
    try {
      const blob = JSON.parse(reader.result);
      if (!blob.salt || !blob.iv || !blob.data) throw new Error('not a ledger');
      _pendingImport = blob;
      $('impPw').value = '';
      $('importModal').classList.remove('hidden');
      setTimeout(() => $('impPw').focus(), 60);
    } catch { toast('That file isn’t a sealed ledger or a CSV.', 'err'); }
  };
  reader.readAsText(file);
});

$('importForm').addEventListener('submit', async e => {
  e.preventDefault();
  if (!_pendingImport) return;
  try {
    const { vault } = await unsealBlob(_pendingImport, $('impPw').value);
    const have = new Set(VAULT.entries.map(x => x.id));
    const sig = new Set(VAULT.entries.map(x => `${x.site}${x.user}${x.pw}`));
    let added = 0, skipped = 0;
    for (const entry of (vault.entries || [])) {
      const e = migrateEntry(entry);
      if (have.has(e.id) || sig.has(`${e.site}${e.user}${e.pw}`)) { skipped++; continue; }
      VAULT.entries.push(e); added++;
    }
    await sealVault();
    _pendingImport = null;
    $('importModal').classList.add('hidden');
    renderAll();
    toast(`Unsealed - ${added} member${added === 1 ? '' : 's'} merged in${skipped ? `, ${skipped} already on the books` : ''}.`);
  } catch {
    toast('Wrong word for that backup.', 'err');
    $('impPw').select();
  }
});

$('expCsv').addEventListener('click', () => {
  if (!VAULT.entries.length) { toast('Empty books - nothing to export.'); return; }
  askConfirm(
    'Plain paper, plain words',
    'A CSV is <b>unencrypted</b> - anyone who finds the file reads every word in it. Only take it out if you know where it’s going.',
    'Print it anyway',
    () => {
      const q = s => `"${String(s ?? '').replace(/"/g, '""')}"`;
      const rows = VAULT.entries.map(e => [e.site, e.user, e.pw, e.kind === 'note' ? 'note' : e.cat, e.notes].map(q).join(','));
      download('cellar-door-plain.csv', 'site,username,password,category,notes\n' + rows.join('\n'), 'text/csv');
      toast(`${VAULT.entries.length} records out in plain sight. Watch your back.`);
    }
  );
});

$('burnBtn').addEventListener('click', () => {
  askConfirm(
    'Burn the ledger?',
    'Every record, every word, the house word itself - <b>all of it, gone for good</b>. There is no ash to read.',
    'Strike the match',
    () => {
      localStorage.removeItem(STORE);
      LEGACY_STORES.forEach(k => localStorage.removeItem(k));
      KEY = null; SALT = null; VAULT = null;
      stopTotpTick();
      document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden'));
      showDoor('create');
      toast('The ledger is ash.');
    }
  );
});

function download(name, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

/* ═══ generic confirm ═══════════════════════════════ */
let _confirmCb = null;

function askConfirm(title, html, yesLabel, cb) {
  $('confirmTitle').textContent = title;
  $('confirmText').innerHTML = html;
  $('confirmYes').textContent = yesLabel;
  _confirmCb = cb;
  $('confirmModal').classList.remove('hidden');
}
$('confirmYes').addEventListener('click', () => {
  $('confirmModal').classList.add('hidden');
  const cb = _confirmCb; _confirmCb = null;
  if (cb) cb();
});
$('confirmNo').addEventListener('click', () => { _confirmCb = null; $('confirmModal').classList.add('hidden'); });

/* ═══ panes, modals, shortcuts ══════════════════════ */
function switchPane(name) {
  document.querySelectorAll('.rtab').forEach(t => t.classList.toggle('active', t.dataset.pane === name));
  document.querySelectorAll('.pane').forEach(p => p.classList.add('hidden'));
  $('pane-' + name).classList.remove('hidden');
  if (name !== 'ledger') stopTotpTick(); else startTotpTick();
}
document.querySelectorAll('.rtab').forEach(t =>
  t.addEventListener('click', () => switchPane(t.dataset.pane)));

document.querySelectorAll('[data-close]').forEach(btn =>
  btn.addEventListener('click', () => $(btn.dataset.close).classList.add('hidden')));

document.querySelectorAll('.overlay').forEach(o =>
  o.addEventListener('mousedown', e => { if (e.target === o) o.classList.add('hidden'); }));

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden'));
  if (!VAULT) return;
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); $('searchInput').focus(); }
  if ((e.ctrlKey || e.metaKey) && e.key === 'l') { e.preventDefault(); lockUp(); }
  if ((e.ctrlKey || e.metaKey) && e.key === 'n') { e.preventDefault(); openMemberModal(); }
});

/* ═══ curtain up ════════════════════════════════════ */
enhanceAllSelects(document);
document.querySelectorAll('.cd-stepper').forEach(buildStepper);
$('optLen').addEventListener('input', function () { const s = document.querySelector('.cd-stepper[data-for="optLen"] .cd-step-val'); if (s) s.textContent = this.value; });
$('optWords').addEventListener('input', function () { const s = document.querySelector('.cd-stepper[data-for="optWords"] .cd-step-val'); if (s) s.textContent = this.value; });
pourAndShow();
showDoor(readStoredBlob() ? 'unlock' : 'create');
