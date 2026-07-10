/* ═══════════════════════════════════════════════════
   DePass — Password Manager  |  script.js
   ═══════════════════════════════════════════════════ */

// ── Storage helpers ───────────────────────────────────
function getPasswords() {
  try { return JSON.parse(localStorage.getItem('depass_v2') || '[]'); } catch { return []; }
}
function savePasswords(arr) {
  localStorage.setItem('depass_v2', JSON.stringify(arr));
}

// ── Migrate old data ──────────────────────────────────
(function migrateOld() {
  const old = localStorage.getItem('passwords');
  if (!old || localStorage.getItem('depass_v2')) return;
  try {
    const arr = JSON.parse(old).map(e => ({
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now() + Math.random(),
      website: e.website, username: e.username, password: e.password,
      category: 'other', notes: '', createdAt: Date.now()
    }));
    savePasswords(arr);
  } catch {}
})();

// ── Password Strength ─────────────────────────────────
function getStrength(pw) {
  if (!pw) return { score: 0, label: '', color: '' };
  let s = 0;
  if (pw.length >= 8)  s++;
  if (pw.length >= 12) s++;
  if (pw.length >= 16) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[a-z]/.test(pw)) s++;
  if (/\d/.test(pw))    s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;

  if (s <= 2) return { score: s, pct: 20,  label: 'Very Weak', color: '#c0504a', dot: 'dot-weak' };
  if (s <= 3) return { score: s, pct: 40,  label: 'Weak',      color: '#c0504a', dot: 'dot-weak' };
  if (s <= 4) return { score: s, pct: 60,  label: 'Fair',      color: '#c9963f', dot: 'dot-medium' };
  if (s <= 5) return { score: s, pct: 80,  label: 'Strong',    color: '#6f9e6b', dot: 'dot-strong' };
  return             { score: s, pct: 100, label: 'Very Strong', color: '#6f9e6b', dot: 'dot-strong' };
}

function setStrBar(fillId, labelId, pw) {
  const str = getStrength(pw);
  const fill = document.getElementById(fillId);
  const lbl  = document.getElementById(labelId);
  if (!fill || !lbl) return;
  fill.style.width      = (str.pct || 0) + '%';
  fill.style.background = str.color || '';
  lbl.textContent       = str.label || '';
  lbl.style.color       = str.color || '';
}

// ── Favicon helper ────────────────────────────────────
function faviconUrl(website) {
  try {
    const host = website.replace(/^https?:\/\//, '').replace(/\/.*/, '').toLowerCase();
    return `https://www.google.com/s2/favicons?sz=32&domain=${host}`;
  } catch { return ''; }
}

function siteLetter(website) {
  return (website || '?').replace(/^(https?:\/\/)?(www\.)?/, '').charAt(0).toUpperCase();
}

// ── Render passwords ──────────────────────────────────
let currentCat    = 'all';
let currentSearch = '';

function renderPasswords() {
  let arr = getPasswords();

  if (currentSearch) {
    const q = currentSearch.toLowerCase();
    arr = arr.filter(e =>
      e.website.toLowerCase().includes(q) ||
      e.username.toLowerCase().includes(q)
    );
  }
  if (currentCat !== 'all') arr = arr.filter(e => e.category === currentCat);

  const list = document.getElementById('passList');

  if (!arr.length) {
    const allEmpty = !currentSearch && currentCat === 'all' && !getPasswords().length;
    list.innerHTML = `<div class="empty-state">
      <i class="fas fa-vault"></i>
      <p>${allEmpty ? 'No passwords saved yet. Click <strong>+ Add Password</strong> to get started.' : 'No passwords match your filter.'}</p>
    </div>`;
    return;
  }

  list.innerHTML = arr.map(e => {
    const str = getStrength(e.password);
    const dotCls = str.dot || 'dot-weak';
    const fav = faviconUrl(e.website);
    const letter = siteLetter(e.website);
    const catCls = 'cat-' + (e.category || 'other');
    const catLabel = e.category ? e.category.charAt(0).toUpperCase() + e.category.slice(1) : 'Other';
    const masked = '•'.repeat(Math.min(e.password.length, 14));
    const safeId = CSS.escape(e.id);

    return `
    <div class="pass-item" data-id="${e.id}">
      <div class="pass-favicon" id="fav-${e.id}">
        <img src="${fav}" alt="" onload="this.style.display='block'" onerror="this.style.display='none';document.getElementById('fav-${e.id}').textContent='${letter}'" style="display:none" />
        ${letter}
      </div>

      <div class="pass-field">
        <div class="pass-field-label">Website</div>
        <div class="pass-field-val">
          ${esc(e.website)}
          <button onclick="copyField('${esc(e.website)}')" title="Copy website"><i class="fas fa-copy"></i></button>
        </div>
      </div>

      <div class="pass-field">
        <div class="pass-field-label">Username</div>
        <div class="pass-field-val">
          <span style="overflow:hidden;text-overflow:ellipsis">${esc(e.username)}</span>
          <button onclick="copyField('${esc(e.username)}')" title="Copy username"><i class="fas fa-copy"></i></button>
        </div>
      </div>

      <div class="pass-field">
        <div class="pass-field-label">Password</div>
        <div class="pass-field-val">
          <span class="pass-pw-text" id="pw-text-${e.id}">${masked}</span>
          <button onclick="togglePwView('${e.id}')" title="Show/hide" id="pw-eye-${e.id}"><i class="fas fa-eye"></i></button>
          <button onclick="copyField('${escJs(e.password)}')" title="Copy password"><i class="fas fa-copy"></i></button>
          <span class="strength-dot ${dotCls}" title="${str.label}"></span>
        </div>
      </div>

      <div class="pass-field">
        <div class="pass-field-label">Category</div>
        <div class="pass-field-val">
          <span class="pass-cat-badge ${catCls}">${catLabel}</span>
        </div>
      </div>

      <div class="pass-actions">
        <button class="icon-btn-sm" onclick="openEditModal('${e.id}')" title="Edit"><i class="fas fa-pen"></i></button>
        <button class="icon-btn-sm danger" onclick="promptDelete('${e.id}','${esc(e.website)}')" title="Delete"><i class="fas fa-trash"></i></button>
      </div>
    </div>`;
  }).join('');

  updateStats();
}

// ── Show/hide password in row ─────────────────────────
const _revealed = new Set();
function togglePwView(id) {
  const arr  = getPasswords();
  const item = arr.find(e => e.id === id);
  if (!item) return;
  const span = document.getElementById('pw-text-' + id);
  const btn  = document.getElementById('pw-eye-' + id);
  if (!span || !btn) return;
  if (_revealed.has(id)) {
    _revealed.delete(id);
    span.textContent = '•'.repeat(Math.min(item.password.length, 14));
    btn.innerHTML = '<i class="fas fa-eye"></i>';
  } else {
    _revealed.add(id);
    span.textContent = item.password;
    btn.innerHTML = '<i class="fas fa-eye-slash"></i>';
  }
}

// ── Stats ─────────────────────────────────────────────
function updateStats() {
  const arr  = getPasswords();
  const total = arr.length;
  let strong = 0, weak = 0;
  const pwCounts = {};
  arr.forEach(e => {
    const s = getStrength(e.password);
    if (s.pct >= 80) strong++;
    else if (s.pct <= 40) weak++;
    pwCounts[e.password] = (pwCounts[e.password] || 0) + 1;
  });
  const dupes = arr.filter(e => pwCounts[e.password] > 1).length;

  document.getElementById('stTotal').textContent  = total;
  document.getElementById('stStrong').textContent = strong;
  document.getElementById('stWeak').textContent   = weak;
  document.getElementById('stDupe').textContent   = dupes;
  document.getElementById('navCount').textContent = total;
}

// ── Copy helper ───────────────────────────────────────
function copyField(txt) {
  navigator.clipboard.writeText(txt)
    .then(() => showToast('📋 Copied to clipboard'))
    .catch(() => showToast('❌ Copy failed', true));
}

// ── Escape helpers ────────────────────────────────────
function esc(s)   { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function escJs(s) { return String(s).replace(/\\/g,'\\\\').replace(/'/g,"\\'"); }

// ── Add / Edit modal ──────────────────────────────────
let _editId = null;

function openAddModal() {
  _editId = null;
  document.getElementById('modalTitle').innerHTML = '<i class="fas fa-plus-circle"></i> Add Password';
  document.getElementById('formSubmitBtn').innerHTML = '<i class="fas fa-save"></i> Save';
  document.getElementById('addForm').reset();
  setStrBar('formStrFill','formStrLabel','');
  document.getElementById('fEyeIcon').className = 'fas fa-eye';
  document.getElementById('fPassword').type = 'password';
  document.getElementById('addModal').classList.remove('hidden');
}

function openEditModal(id) {
  const arr  = getPasswords();
  const item = arr.find(e => e.id === id);
  if (!item) return;
  _editId = id;
  document.getElementById('modalTitle').innerHTML = '<i class="fas fa-pen"></i> Edit Password';
  document.getElementById('formSubmitBtn').innerHTML = '<i class="fas fa-save"></i> Update';
  document.getElementById('fWebsite').value  = item.website;
  document.getElementById('fUsername').value = item.username;
  document.getElementById('fPassword').value = item.password;
  document.getElementById('fCategory').value = item.category || 'other';
  document.getElementById('fNotes').value    = item.notes || '';
  document.getElementById('fPassword').type  = 'password';
  document.getElementById('fEyeIcon').className = 'fas fa-eye';
  setStrBar('formStrFill','formStrLabel', item.password);
  document.getElementById('addModal').classList.remove('hidden');
}

function closeAddModal() {
  document.getElementById('addModal').classList.add('hidden');
  _editId = null;
}

document.getElementById('openAddModal').addEventListener('click', openAddModal);
document.getElementById('modalClose').addEventListener('click', closeAddModal);
document.getElementById('addModal').addEventListener('click', e => {
  if (e.target === document.getElementById('addModal')) closeAddModal();
});

// Toggle password visibility in form
document.getElementById('fTogglePass').addEventListener('click', () => {
  const inp  = document.getElementById('fPassword');
  const icon = document.getElementById('fEyeIcon');
  if (inp.type === 'password') { inp.type = 'text';     icon.className = 'fas fa-eye-slash'; }
  else                         { inp.type = 'password'; icon.className = 'fas fa-eye'; }
});

// Real-time strength
document.getElementById('fPassword').addEventListener('input', function () {
  setStrBar('formStrFill','formStrLabel', this.value);
});

// Form submit
document.getElementById('addForm').addEventListener('submit', e => {
  e.preventDefault();
  const w = document.getElementById('fWebsite').value.trim();
  const u = document.getElementById('fUsername').value.trim();
  const p = document.getElementById('fPassword').value;
  const c = document.getElementById('fCategory').value;
  const n = document.getElementById('fNotes').value.trim();
  if (!w || !u || !p) return;

  let arr = getPasswords();
  if (_editId) {
    arr = arr.map(e => e.id === _editId ? { ...e, website:w, username:u, password:p, category:c, notes:n, updatedAt:Date.now() } : e);
    showToast('✅ Password updated');
  } else {
    arr.push({ id: crypto.randomUUID ? crypto.randomUUID() : Date.now()+'', website:w, username:u, password:p, category:c, notes:n, createdAt:Date.now() });
    showToast('✅ Password saved');
  }
  savePasswords(arr);
  closeAddModal();
  renderPasswords();
});

// ── Delete modal ──────────────────────────────────────
let _deleteId = null;

function promptDelete(id, website) {
  _deleteId = id;
  document.getElementById('deleteTarget').textContent = website;
  document.getElementById('deleteModal').classList.remove('hidden');
}

document.getElementById('deleteCancelBtn').addEventListener('click', () => {
  document.getElementById('deleteModal').classList.add('hidden');
});
document.getElementById('deleteModalClose').addEventListener('click', () => {
  document.getElementById('deleteModal').classList.add('hidden');
});
document.getElementById('deleteConfirmBtn').addEventListener('click', () => {
  if (!_deleteId) return;
  let arr = getPasswords().filter(e => e.id !== _deleteId);
  savePasswords(arr);
  _deleteId = null;
  document.getElementById('deleteModal').classList.add('hidden');
  renderPasswords();
  showToast('🗑 Password deleted');
});

// ── Search ────────────────────────────────────────────
document.getElementById('globalSearch').addEventListener('input', function () {
  currentSearch = this.value.trim();
  renderPasswords();
});

// ── Category filter ───────────────────────────────────
document.getElementById('catChips').addEventListener('click', e => {
  const chip = e.target.closest('.cat-chip');
  if (!chip) return;
  document.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active-chip'));
  chip.classList.add('active-chip');
  currentCat = chip.dataset.cat;
  renderPasswords();
});

// ── Tabs ──────────────────────────────────────────────
document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.add('hidden'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.remove('hidden');
  });
});

// ── Export CSV ────────────────────────────────────────
document.getElementById('exportBtn').addEventListener('click', () => {
  const arr = getPasswords();
  if (!arr.length) { showToast('No passwords to export'); return; }
  const header = 'Website,Username,Password,Category,Notes\n';
  const rows   = arr.map(e =>
    `"${e.website}","${e.username}","${e.password}","${e.category}","${(e.notes||'').replace(/"/g,'""')}"`
  ).join('\n');
  const blob = new Blob([header + rows], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'depass-export.csv'; a.click();
  URL.revokeObjectURL(url);
  showToast('📤 Exported ' + arr.length + ' passwords');
});

// ── Password Generator ────────────────────────────────
let _lastGenerated = '';

const UPPER  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWER  = 'abcdefghijklmnopqrstuvwxyz';
const NUMS   = '0123456789';
const SYMS   = '!@#$%^&*()-_=+[]{}|;:,.<>?';
const AMBIG  = /[0Ol1I]/g;

function generatePassword() {
  const len      = +document.getElementById('lenRange').value;
  const useUpper = document.getElementById('inclUpper').checked;
  const useLower = document.getElementById('inclLower').checked;
  const useNums  = document.getElementById('inclNums').checked;
  const useSyms  = document.getElementById('inclSyms').checked;
  const noAmbig  = document.getElementById('exclAmb').checked;

  let charset = '';
  if (useUpper) charset += UPPER;
  if (useLower) charset += LOWER;
  if (useNums)  charset += NUMS;
  if (useSyms)  charset += SYMS;
  if (!charset) charset = LOWER + NUMS;
  if (noAmbig)  charset = charset.replace(AMBIG, '');

  let pw = '';
  const arr = new Uint8Array(len * 2);
  crypto.getRandomValues(arr);
  for (let i = 0; pw.length < len; i++) {
    pw += charset[arr[i] % charset.length];
  }
  pw = pw.slice(0, len);

  _lastGenerated = pw;
  document.getElementById('genOutput').textContent = pw;
  setStrBar('genStrFill','genStrLabel', pw);
}

document.getElementById('lenRange').addEventListener('input', function () {
  document.getElementById('lenVal').textContent = this.value;
});

document.getElementById('genBtn').addEventListener('click', generatePassword);
document.getElementById('genRefreshBtn').addEventListener('click', generatePassword);

document.getElementById('genCopyBtn').addEventListener('click', () => {
  if (!_lastGenerated) return;
  navigator.clipboard.writeText(_lastGenerated).then(() => showToast('📋 Password copied'));
});

// "Use in Add Form" button
document.getElementById('genUseBtn').addEventListener('click', () => {
  if (!_lastGenerated) { showToast('Generate a password first'); return; }
  openAddModal();
  document.getElementById('fPassword').value = _lastGenerated;
  setStrBar('formStrFill','formStrLabel', _lastGenerated);
  // Switch to passwords tab
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.add('hidden'));
  document.querySelector('[data-tab="passwords"]').classList.add('active');
  document.getElementById('tab-passwords').classList.remove('hidden');
});

// "Fill from generator" in modal
document.getElementById('fillFromGen').addEventListener('click', () => {
  if (!_lastGenerated) {
    // Auto-generate one
    generatePassword();
  }
  document.getElementById('fPassword').value = _lastGenerated;
  setStrBar('formStrFill','formStrLabel', _lastGenerated);
  showToast('🔑 Password filled from generator');
});

// Auto-generate on page load
generatePassword();

// ── Security Audit ────────────────────────────────────
document.getElementById('runAuditBtn').addEventListener('click', runAudit);

function runAudit() {
  const arr     = getPasswords();
  const results = document.getElementById('auditResults');

  if (!arr.length) {
    results.innerHTML = '<div class="audit-placeholder"><i class="fas fa-shield-halved"></i><p>No passwords to audit yet.</p></div>';
    return;
  }

  const weak      = arr.filter(e => getStrength(e.password).pct <= 40);
  const fair      = arr.filter(e => { const s = getStrength(e.password); return s.pct > 40 && s.pct < 80; });
  const pwCounts  = {};
  arr.forEach(e => { pwCounts[e.password] = (pwCounts[e.password] || 0) + 1; });
  const dupes     = arr.filter(e => pwCounts[e.password] > 1);
  const old       = arr.filter(e => e.createdAt && (Date.now() - e.createdAt) > 90 * 86400000);

  let html = '';

  if (!weak.length && !dupes.length) {
    html = `<div class="audit-all-good"><i class="fas fa-shield-halved"></i><p>All passwords look good! No critical issues found.</p></div>`;
  }

  if (weak.length) {
    html += `<div class="audit-group-title"><i class="fas fa-circle-xmark" style="color:#c0504a"></i> Weak Passwords (${weak.length})</div>`;
    html += weak.map(e => `
      <div class="audit-item danger">
        <i class="fas fa-triangle-exclamation"></i>
        <div class="audit-item-text">
          <div class="audit-item-site">${esc(e.website)}</div>
          <div class="audit-item-desc">Password is too weak — consider updating it. ${getStrength(e.password).label}.</div>
        </div>
        <button class="btn-ghost-sm" onclick="openEditModal('${e.id}');switchTab('passwords')">Fix</button>
      </div>`).join('');
  }

  if (dupes.length) {
    const seen = new Set();
    const uniqueDupes = dupes.filter(e => { const k = e.password; if (seen.has(k)) return false; seen.add(k); return true; });
    html += `<div class="audit-group-title" style="margin-top:.75rem"><i class="fas fa-clone" style="color:#c9963f"></i> Reused Passwords (${dupes.length})</div>`;
    html += uniqueDupes.map(e => {
      const sites = arr.filter(x => x.password === e.password).map(x => x.website).join(', ');
      return `<div class="audit-item warn">
        <i class="fas fa-clone"></i>
        <div class="audit-item-text">
          <div class="audit-item-site">Same password on: ${esc(sites)}</div>
          <div class="audit-item-desc">Using the same password on multiple sites is a security risk.</div>
        </div>
      </div>`;
    }).join('');
  }

  if (fair.length) {
    html += `<div class="audit-group-title" style="margin-top:.75rem"><i class="fas fa-circle-info" style="color:#b08d57"></i> Could Be Stronger (${fair.length})</div>`;
    html += fair.map(e => `
      <div class="audit-item info">
        <i class="fas fa-arrow-up"></i>
        <div class="audit-item-text">
          <div class="audit-item-site">${esc(e.website)}</div>
          <div class="audit-item-desc">Password is fair — adding symbols and more length would help.</div>
        </div>
        <button class="btn-ghost-sm" onclick="openEditModal('${e.id}');switchTab('passwords')">Improve</button>
      </div>`).join('');
  }

  if (old.length) {
    html += `<div class="audit-group-title" style="margin-top:.75rem"><i class="fas fa-clock" style="color:#888"></i> Old Passwords (${old.length})</div>`;
    html += old.map(e => `
      <div class="audit-item" style="border-color:#3a3f47">
        <i class="fas fa-clock" style="color:#555"></i>
        <div class="audit-item-text">
          <div class="audit-item-site">${esc(e.website)}</div>
          <div class="audit-item-desc">Password hasn't been updated in over 90 days.</div>
        </div>
      </div>`).join('');
  }

  results.innerHTML = html;
}

function switchTab(name) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.add('hidden'));
  document.querySelector(`[data-tab="${name}"]`).classList.add('active');
  document.getElementById('tab-' + name).classList.remove('hidden');
}

// ── Toast ─────────────────────────────────────────────
let _toastTimer = null;
function showToast(msg, isErr = false) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.style.borderColor = isErr ? 'rgba(231,76,60,.4)' : 'var(--border)';
  el.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

// ── Keyboard shortcuts ────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.getElementById('addModal').classList.add('hidden');
    document.getElementById('deleteModal').classList.add('hidden');
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    document.getElementById('globalSearch').focus();
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
    e.preventDefault();
    openAddModal();
  }
});

// ── Init ──────────────────────────────────────────────
renderPasswords();
updateStats();
