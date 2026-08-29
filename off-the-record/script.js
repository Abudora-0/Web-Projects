/* ══════════════════════════════════════════════
   Incognito Mode Clone  |  script.js
   ══════════════════════════════════════════════ */

'use strict';

// ── Session timer ─────────────────────────────
const sessionStart = Date.now();
const timerEl = document.getElementById('sessionTimer');

function formatTime(ms) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map(n => String(n).padStart(2, '0')).join(':');
}

setInterval(() => {
  timerEl.textContent = formatTime(Date.now() - sessionStart);
}, 1000);

// ── Search bar ────────────────────────────────
const searchInput = document.getElementById('searchInput');
const searchGo    = document.getElementById('searchGo');

function doSearch() {
  const raw = searchInput.value.trim();
  if (!raw) return;
  // Detect URL vs search query
  const isURL = /^(https?:\/\/)/.test(raw) || /^(www\.)?[\w-]+\.\w{2,}(\/|$)/.test(raw);
  const url = isURL
    ? (raw.startsWith('http') ? raw : 'https://' + raw)
    : `https://www.google.com/search?q=${encodeURIComponent(raw)}`;
  window.open(url, '_blank', 'noopener');
  searchInput.value = '';
}

searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
searchGo.addEventListener('click', doSearch);

// Focus search on page load (after animations settle)
setTimeout(() => searchInput.focus(), 700);

// ── Cookie toggle ─────────────────────────────
const cookieCheck = document.getElementById('cookieCheck');
const cookieCard  = document.getElementById('cookieToggle');

// Restore saved preference
const savedCookie = localStorage.getItem('incog_cookies_blocked');
if (savedCookie === 'true') cookieCheck.checked = true;

cookieCheck.addEventListener('change', () => {
  localStorage.setItem('incog_cookies_blocked', cookieCheck.checked);
  updateScore();
});

// Also allow clicking the whole card to toggle
document.getElementById('cookieCard').addEventListener('click', (e) => {
  if (e.target.closest('.toggle-switch')) return; // let the label handle it
  cookieCheck.checked = !cookieCheck.checked;
  cookieCheck.dispatchEvent(new Event('change'));
});

// ── Privacy score ─────────────────────────────
const ringFill  = document.getElementById('ringFill');
const scoreNum  = document.getElementById('scoreNum');
const scoreLabel = document.getElementById('scoreLabel');
const CIRCUMFERENCE = 150.8; // 2π × 24

function updateScore() {
  const blocked  = cookieCheck.checked;
  const score    = blocked ? 85 : 60;
  const offset   = CIRCUMFERENCE - (CIRCUMFERENCE * score / 100);

  ringFill.style.strokeDashoffset = offset;
  ringFill.style.stroke = blocked ? '#5a7d54' : '#a03c38';
  scoreNum.textContent  = score;
  scoreLabel.textContent = blocked ? 'Enhanced Protection' : 'Standard Protection';
}

// Initial paint (must run after ringFill/scoreNum consts exist)
updateScore();

// ── Privacy tips ──────────────────────────────
const TIPS = [
  'Use a VPN to hide your IP address from websites and your ISP.',
  'Incognito mode doesn\'t protect you from keyloggers or screen capture.',
  'Your DNS queries may still be logged - consider a private DNS provider.',
  'Downloaded files are saved even after you close incognito windows.',
  'Browser extensions can still see your activity unless disabled.',
  'Always look for 🔒 HTTPS to ensure your connection is encrypted.',
  'Public Wi-Fi users may see your unencrypted traffic - use HTTPS.',
  'Consider Tor Browser for stronger anonymity and routing.',
  'Signing into Google accounts removes incognito protections.',
  'Clearing your cache after browsing adds an extra layer of privacy.',
];

const tipText = document.getElementById('tipText');
const tipDots = document.getElementById('tipDots');
let currentTip = 0;

// Build dots
TIPS.forEach((_, i) => {
  const dot = document.createElement('div');
  dot.className = 'tip-dot' + (i === 0 ? ' active' : '');
  dot.addEventListener('click', () => showTip(i));
  tipDots.appendChild(dot);
});

function showTip(idx) {
  currentTip = idx;
  tipText.style.opacity = '0';
  setTimeout(() => {
    tipText.textContent = TIPS[idx];
    tipText.style.opacity = '1';
  }, 180);
  document.querySelectorAll('.tip-dot').forEach((d, i) => {
    d.classList.toggle('active', i === idx);
  });
}

tipText.style.transition = 'opacity .18s ease';

const tipInterval = setInterval(() => {
  showTip((currentTip + 1) % TIPS.length);
}, 5000);

// ── Redaction reveal ──────────────────────────
(function () {
  const redact = document.getElementById('redact');
  if (!redact) return;
  function reveal() {
    if (redact.classList.contains('revealed')) return;
    redact.classList.add('revealing');
    setTimeout(() => {
      redact.textContent = redact.dataset.word;
      redact.classList.remove('revealing');
      redact.classList.add('revealed');
      redact.removeAttribute('role');
      redact.removeAttribute('tabindex');
      redact.setAttribute('aria-label', redact.dataset.word);
    }, 560);
  }
  redact.addEventListener('click', reveal);
  redact.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); reveal(); }
  });
})();

// ── The file on you ───────────────────────────
(function () {
  const list = document.getElementById('dfList');
  if (!list) return;

  const now = new Date();
  document.getElementById('dfTime').textContent = now.toTimeString().slice(0, 8);

  const ua = navigator.userAgent;
  const grab = re => { const m = ua.match(re); return m ? m[1] : null; };

  function detectBrowser() {
    let v;
    if ((v = grab(/Firefox\/([\d.]+)/))) return 'Firefox ' + v;
    if ((v = grab(/Edg\/([\d.]+)/)))    return 'Edge ' + v.split('.')[0];
    if ((v = grab(/OPR\/([\d.]+)/)))    return 'Opera ' + v.split('.')[0];
    if ((v = grab(/Chrome\/([\d.]+)/))) return 'Chrome ' + v.split('.')[0];
    if (/Safari/.test(ua) && (v = grab(/Version\/([\d.]+)/))) return 'Safari ' + v;
    return 'an unrecognised browser';
  }
  function detectOS() {
    let v;
    if (/Windows NT 10/.test(ua)) return 'Windows 10 or 11';
    if ((v = grab(/Windows NT ([\d.]+)/))) return 'Windows (NT ' + v + ')';
    if ((v = grab(/Mac OS X ([\d_]+)/)))   return 'macOS ' + v.replace(/_/g, '.');
    if ((v = grab(/Android ([\d.]+)/)))    return 'Android ' + v;
    if ((v = grab(/(?:iPhone|iPad).*?OS ([\d_]+)/))) return 'iOS ' + v.replace(/_/g, '.');
    if (/Linux/.test(ua)) return 'Linux';
    return 'an unrecognised system';
  }

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown';
  const off = -now.getTimezoneOffset() / 60;
  const tzStr = 'UTC' + (off >= 0 ? '+' : '-') + Math.abs(off);
  const place = tz.includes('/') ? tz.split('/').pop().replace(/_/g, ' ') : tz;

  let gpu = 'blocked or unavailable';
  try {
    const cv = document.createElement('canvas');
    const gl = cv.getContext('webgl') || cv.getContext('experimental-webgl');
    if (gl) {
      const dbg = gl.getExtension('WEBGL_debug_renderer_info');
      gpu = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
    }
  } catch (e) { /* keep default */ }

  const dnt = (navigator.doNotTrack === '1' || window.doNotTrack === '1') ? 'on - asking sites not to track' : 'not set';
  const cookieBlocked = document.getElementById('cookieCheck') && document.getElementById('cookieCheck').checked;
  const cookies = (navigator.cookieEnabled ? 'accepted by the browser' : 'refused by the browser') +
                  (cookieBlocked ? ', third parties blocked here' : '');
  const input = navigator.maxTouchPoints > 0 ? 'touchscreen, ' + navigator.maxTouchPoints + ' points' : 'mouse and keyboard';
  const langs = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language]).join(', ');
  const cores = navigator.hardwareConcurrency ? navigator.hardwareConcurrency + ' logical cores' : 'not disclosed';
  const mem = navigator.deviceMemory ? navigator.deviceMemory + ' GB RAM (approx)' : null;
  const net = (navigator.connection && navigator.connection.effectiveType)
    ? navigator.connection.effectiveType.toUpperCase() + '-class connection' : null;

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const scrOk = screen.width > 0 && screen.height > 0;
  const rows = [
    ['Browser', detectBrowser()],
    ['System', detectOS()],
    ['Screen', scrOk ? screen.width + ' x ' + screen.height + ' px' : 'not reported',
      scrOk ? 'at ' + (window.devicePixelRatio || 1) + 'x pixel density' : null],
    ['Window', window.innerWidth + ' x ' + window.innerHeight + ' px, this moment'],
    ['Time zone', tz + '  (' + tzStr + ')', 'places you near ' + place],
    ['Languages', langs],
    ['Do Not Track', dnt],
    ['Cookies', cookies],
    ['Input', input],
    ['Hardware', cores + (mem ? ',  ' + mem : '')],
    ['Graphics', gpu, 'the canvas fingerprint - clearing cookies will not touch it'],
  ];
  if (net) rows.push(['Network', net]);

  list.innerHTML = rows.map((r, i) =>
    '<div class="df-row" style="animation-delay:' + (90 + i * 45) + 'ms">' +
      '<dt>' + r[0] + '</dt><dd>' + esc(r[1]) +
      (r[2] ? '<span class="df-sub">' + esc(r[2]) + '</span>' : '') +
    '</dd></div>').join('');

  // distinctiveness - illustrative, not a real fingerprint test
  let bits = 0;
  bits += /RTX|GTX|Radeon|Apple M\d|Adreno|Mali|GeForce/i.test(gpu) ? 3 : (/Intel|Iris|ANGLE/i.test(gpu) ? 2 : (gpu.length > 12 ? 1.5 : 0));
  bits += (navigator.languages || []).length > 1 ? 1.5 : 0.5;
  bits += navigator.deviceMemory ? 1 : 0;
  bits += navigator.hardwareConcurrency ? 1 : 0;
  bits += (scrOk && (screen.width % 100 !== 0 || screen.height % 100 !== 0)) ? 1.5 : 0.5;
  bits += navigator.maxTouchPoints > 0 ? 0.5 : 1;
  bits += dnt === 'not set' ? 0.5 : 0;
  const pct = Math.max(20, Math.min(96, Math.round(bits / 14 * 100) + 15));
  setTimeout(() => { document.getElementById('dfFpBar').style.width = pct + '%'; }, 450);
  document.getElementById('dfFpVerdict').textContent =
    pct < 45 ? 'blends into the crowd' : pct < 72 ? 'stands out in a line-up' : 'one of a kind';

  const sig = [detectBrowser(), detectOS(), screen.width + 'x' + screen.height, tz, langs, gpu, cores].join('|');
  let hsh = 0x811c9dc5;
  for (let i = 0; i < sig.length; i++) { hsh ^= sig.charCodeAt(i); hsh = Math.imul(hsh, 0x01000193); }
  const hex = (hsh >>> 0).toString(16).toUpperCase().padStart(8, '0');
  document.getElementById('dfHash').textContent = '#' + hex.slice(0, 4) + '-' + hex.slice(4);
})();

// ── Shred the evidence ────────────────────────
(function () {
  const card = document.getElementById('shredCard');
  const btn  = document.getElementById('shredBtn');
  const face = document.getElementById('shredFace');
  const done = document.getElementById('shredDone');
  if (!btn) return;

  btn.addEventListener('click', () => {
    if (card.classList.contains('shredding')) return;
    card.classList.add('shredding');

    setTimeout(() => {
      try { localStorage.clear(); } catch (e) { /* private mode */ }
      try { sessionStorage.clear(); } catch (e) { /* private mode */ }
      if (typeof cookieCheck !== 'undefined' && cookieCheck) {
        cookieCheck.checked = false;
        updateScore();
      }
      face.hidden = true;
      done.hidden = false;
    }, 650);

    setTimeout(() => {
      card.classList.remove('shredding');
      done.hidden = true;
      face.hidden = false;
    }, 4200);
  });
})();

// ── Keyboard shortcuts ────────────────────────
document.addEventListener('keydown', e => {
  // Ctrl+/ or ? focuses the search bar
  if ((e.key === '/' || e.key === '?') && !e.ctrlKey && document.activeElement !== searchInput) {
    e.preventDefault();
    searchInput.focus();
    searchInput.select();
  }
  // Escape clears search
  if (e.key === 'Escape' && document.activeElement === searchInput) {
    searchInput.blur();
    searchInput.value = '';
  }
});
