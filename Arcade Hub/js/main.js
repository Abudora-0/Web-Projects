/* ══════════════════════════════════════════════
   ArcadeHub  |  main.js
   ══════════════════════════════════════════════ */

'use strict';

/* ── Game registry ──────────────────────────── */
const GAMES = [
  { id: 'memory',   name: 'Memory Game',  emoji: '🧠', href: 'memory.html',   scoreKey: 'memoryBestTime',   scoreLabel: 'Best Time' },
  { id: 'snake',    name: 'Snake',         emoji: '🐍', href: 'snake.html',    scoreKey: 'snakeHighScore',   scoreLabel: 'High Score' },
  { id: 'wordle',   name: 'Wordle',        emoji: '📝', href: 'wordle.html',   scoreKey: 'wordleBestScore',  scoreLabel: 'Best Score' },
  { id: '2048',     name: '2048',          emoji: '🎯', href: '2048.html',     scoreKey: '2048BestScore',    scoreLabel: 'Best Score' },
  { id: 'hangman',  name: 'Hangman',       emoji: '🔤', href: 'hangman.html',  scoreKey: 'hangmanWins',      scoreLabel: 'Win Streak' },
  { id: 'tictactoe',name: 'Tic Tac Toe',  emoji: '⭕', href: 'tictactoe.html',scoreKey: 'tttWins',          scoreLabel: 'Total Wins' },
  { id: 'simon',    name: 'Simon Says',    emoji: '🎮', href: 'simon.html',    scoreKey: 'simonBestLevel',   scoreLabel: 'Best Level' },
  { id: 'quiz',     name: 'Quiz Master',   emoji: '🎓', href: 'quiz.html',     scoreKey: 'quizBestScore',    scoreLabel: 'Best Score' },
];

/* ── Persistence ──────────────────────────── */
function getLS(key, fallback = null) {
  try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function setLS(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

/* ── Init ──────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initNavbar();
  initHamburger();
  initFilters();
  initFavourites();
  initScrollTop();
  updateScoreCards();
  buildLeaderboard();
  buildRecentlyPlayed();
  animateHeroCounters();
  initScrollSpy();
});

/* ══════════════════════════════════════════════
   PARTICLES
══════════════════════════════════════════════ */
function initParticles() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx  = canvas.getContext('2d');
  let dots   = [];
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const COLORS = ['rgba(0,212,255,', 'rgba(131,56,236,', 'rgba(255,0,110,'];
  for (let i = 0; i < 60; i++) {
    dots.push({
      x: Math.random() * (W || 1200),
      y: Math.random() * (H || 800),
      r: Math.random() * 1.5 + 0.5,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      col: COLORS[Math.floor(Math.random() * COLORS.length)],
      a: Math.random() * 0.5 + 0.2,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    dots.forEach(d => {
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = d.col + d.a + ')';
      ctx.fill();
      d.x += d.dx; d.y += d.dy;
      if (d.x < 0) d.x = W;
      if (d.x > W) d.x = 0;
      if (d.y < 0) d.y = H;
      if (d.y > H) d.y = 0;
    });
    // Draw lines between close dots
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const dx = dots[i].x - dots[j].x;
        const dy = dots[i].y - dots[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(dots[i].x, dots[i].y);
          ctx.lineTo(dots[j].x, dots[j].y);
          ctx.strokeStyle = 'rgba(0,212,255,' + (0.06 * (1 - dist / 120)) + ')';
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
}

/* ══════════════════════════════════════════════
   NAVBAR
══════════════════════════════════════════════ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.style.background = window.scrollY > 20
      ? 'rgba(8,12,31,.97)'
      : 'rgba(8,12,31,.85)';
  }, { passive: true });
}

function initHamburger() {
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('navMenu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    btn.classList.toggle('open');
    menu.classList.toggle('open');
  });

  menu.querySelectorAll('.nav-link').forEach(l => {
    l.addEventListener('click', () => {
      btn.classList.remove('open');
      menu.classList.remove('open');
    });
  });
}

/* ══════════════════════════════════════════════
   SCROLL SPY
══════════════════════════════════════════════ */
function initScrollSpy() {
  const links    = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => {
          l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px' });

  sections.forEach(s => obs.observe(s));
}

/* ══════════════════════════════════════════════
   FILTER TABS
══════════════════════════════════════════════ */
function initFilters() {
  const btns  = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.game-card');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      cards.forEach(card => {
        const match = filter === 'all' || card.dataset.cat === filter;
        card.classList.toggle('hidden', !match);
      });
    });
  });
}

/* ══════════════════════════════════════════════
   FAVOURITES
══════════════════════════════════════════════ */
function initFavourites() {
  const favs = getLS('arcadeFavs', []);

  document.querySelectorAll('.fav-btn').forEach(btn => {
    const id = btn.dataset.game;
    if (favs.includes(id)) {
      btn.classList.add('faved');
      btn.textContent = '♥';
    }

    btn.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      const favList = getLS('arcadeFavs', []);
      const idx     = favList.indexOf(id);
      if (idx === -1) {
        favList.push(id);
        btn.classList.add('faved');
        btn.textContent = '♥';
        toast('Added to favourites ❤');
      } else {
        favList.splice(idx, 1);
        btn.classList.remove('faved');
        btn.textContent = '♡';
        toast('Removed from favourites');
      }
      setLS('arcadeFavs', favList);
      updateHeroCounters();
      updateStatCards();
    });
  });
}

/* ══════════════════════════════════════════════
   SCORES - cards & leaderboard
══════════════════════════════════════════════ */
function updateScoreCards() {
  GAMES.forEach(g => {
    const el  = document.getElementById('score-' + g.id);
    const raw = localStorage.getItem(g.scoreKey);
    if (el) el.textContent = (raw && raw !== '0' && raw !== '-' && raw !== '00:00') ? raw : '-';
  });
  updateStatCards();
}

function updateStatCards() {
  let sessions  = 0;
  let totalScore = 0;
  let withRecords = 0;
  const favs   = getLS('arcadeFavs', []);

  GAMES.forEach(g => {
    const raw = localStorage.getItem(g.scoreKey);
    if (raw && raw !== '0' && raw !== '-' && raw !== '00:00') {
      withRecords++;
      totalScore += parseInt(raw) || 0;
      sessions++;
    }
  });
  sessions = getLS('arcadeSessions', sessions);

  animateCounter(document.getElementById('statSessions'), sessions);
  animateCounter(document.getElementById('statTotal'),    totalScore);
  animateCounter(document.getElementById('statBest'),     withRecords);
  animateCounter(document.getElementById('statFav'),      favs.length);
}

function buildLeaderboard() {
  const rows = document.getElementById('lbRows');
  if (!rows) return;

  rows.innerHTML = GAMES.map(g => {
    const raw   = localStorage.getItem(g.scoreKey);
    const score = (raw && raw !== '0' && raw !== '-' && raw !== '00:00') ? raw : null;
    return '<div class="lb-row">' +
      '<div class="lb-game"><span class="lb-game-emoji">' + g.emoji + '</span>' + g.name + '</div>' +
      '<span class="lb-score' + (score ? '' : ' empty') + '">' + (score || 'No record yet') + '</span>' +
    '</div>';
  }).join('');
}

/* ══════════════════════════════════════════════
   RECENTLY PLAYED
══════════════════════════════════════════════ */
function buildRecentlyPlayed() {
  const recent  = getLS('arcadeRecent', []);
  const section = document.getElementById('recentSection');
  const strip   = document.getElementById('recentStrip');
  if (!section || !strip || !recent.length) return;

  section.classList.add('visible');
  strip.innerHTML = recent.slice(0, 5).map(id => {
    const g = GAMES.find(x => x.id === id);
    if (!g) return '';
    return '<a href="' + g.href + '" class="recent-chip">' +
      '<span class="rc-emoji">' + g.emoji + '</span>' +
      '<span>' + g.name + '</span>' +
    '</a>';
  }).join('');
}

/* Call this from game pages to log a play: window.arcadeLogPlay('snake') */
window.arcadeLogPlay = function(gameId) {
  let recent = getLS('arcadeRecent', []);
  recent = recent.filter(x => x !== gameId);
  recent.unshift(gameId);
  if (recent.length > 8) recent.pop();
  setLS('arcadeRecent', recent);

  let sessions = getLS('arcadeSessions', 0);
  setLS('arcadeSessions', sessions + 1);
};

/* ══════════════════════════════════════════════
   ANIMATED COUNTERS
══════════════════════════════════════════════ */
function animateCounter(el, target) {
  if (!el) return;
  const start    = parseInt(el.textContent.replace(/,/g, '')) || 0;
  const duration = 700;
  const step     = 16;
  const steps    = duration / step;
  const inc      = (target - start) / steps;
  let current    = start;
  let frame      = 0;

  const tick = () => {
    frame++;
    current += inc;
    el.textContent = Math.round(frame >= steps ? target : current).toLocaleString();
    if (frame < steps) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function animateHeroCounters() {
  const favs = getLS('arcadeFavs', []);
  const sessions = getLS('arcadeSessions', 0);

  // Static games count
  document.querySelectorAll('.hs-num[data-target]').forEach(el => {
    const target = parseInt(el.dataset.target) || 0;
    animateCounter(el, target);
  });

  const heroPlayed = document.getElementById('heroPlayed');
  const heroFav    = document.getElementById('heroFav');
  if (heroPlayed) { heroPlayed.dataset.target = sessions; animateCounter(heroPlayed, sessions); }
  if (heroFav)    { heroFav.dataset.target = favs.length; animateCounter(heroFav, favs.length); }
}

function updateHeroCounters() {
  const favs     = getLS('arcadeFavs', []);
  const sessions = getLS('arcadeSessions', 0);
  const heroFav     = document.getElementById('heroFav');
  const heroPlayed  = document.getElementById('heroPlayed');
  if (heroFav)   animateCounter(heroFav,   favs.length);
  if (heroPlayed) animateCounter(heroPlayed, sessions);
}

/* ══════════════════════════════════════════════
   RESET STATS
══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('clearStatsBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    if (!confirm('Reset all scores and stats? This cannot be undone.')) return;
    GAMES.forEach(g => localStorage.removeItem(g.scoreKey));
    setLS('arcadeSessions', 0);
    setLS('arcadeRecent', []);
    updateScoreCards();
    buildLeaderboard();
    buildRecentlyPlayed();
    updateHeroCounters();
    toast('All stats reset');
  });
});

/* ══════════════════════════════════════════════
   SCROLL TOP
══════════════════════════════════════════════ */
function initScrollTop() {
  const btn = document.getElementById('scrollTopBtn');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ══════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════ */
function toast(msg, dur) {
  dur = dur || 2500;
  let wrap = document.getElementById('toastWrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.id = 'toastWrap';
    wrap.className = 'toast-wrap';
    document.body.appendChild(wrap);
  }
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => {
    el.classList.add('out');
    el.addEventListener('animationend', () => el.remove());
  }, dur);
}

/* ══════════════════════════════════════════════
   UTILITIES (shared with game pages)
══════════════════════════════════════════════ */
function formatTime(ms) {
  const s = Math.floor((ms / 1000) % 60);
  const m = Math.floor(ms / 60000);
  return m.toString().padStart(2, '0') + ':' + s.toString().padStart(2, '0');
}

function showNotification(message, type) {
  toast(message);
}

window.gameUtils = { formatTime, showNotification, toast };
