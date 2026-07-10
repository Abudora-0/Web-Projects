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
  'Your DNS queries may still be logged — consider a private DNS provider.',
  'Downloaded files are saved even after you close incognito windows.',
  'Browser extensions can still see your activity unless disabled.',
  'Always look for 🔒 HTTPS to ensure your connection is encrypted.',
  'Public Wi-Fi users may see your unencrypted traffic — use HTTPS.',
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
