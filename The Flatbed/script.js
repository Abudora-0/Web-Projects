/* ══════════════════════════════════════════════
   THE FLATBED  |  script.js
   ══════════════════════════════════════════════ */

'use strict';

/* ── API ─────────────────────────────────────── */
const API_KEY  = 'e69bf4cdf5d3dbc4af33ec8c85494fc0';
const BASE     = 'https://api.themoviedb.org/3';
const IMG      = 'https://image.tmdb.org/t/p/w500';
const IMG_SM   = 'https://image.tmdb.org/t/p/w185';
const IMG_BIG  = 'https://image.tmdb.org/t/p/original';

/* ── Storage keys ────────────────────────────── */
const K_BIN     = 'cr.bin';       // meant to watch
const K_SELECTS = 'cr.selects';   // loved
const K_WATCHED = 'cr.watched';   // seen, with rating + note

/* ── State ───────────────────────────────────── */
const state = {
  category: 'trending',
  query: '',
  page: 1,
  totalPages: 1,
  loading: false,
  genres: [],
  filters: { genre: null, yearFrom: null, yearTo: null, runtimeMax: 240, ratingMin: 0, votesMin: 0, sort: 'popularity.desc' },
  bin: 'bin',       // active drawer tab
  take: 0,
  shown: new Set(), // TMDB repeats titles across pages; keep the grid unique
  hasRecs: false,
};

const CATS = {
  trending:    { label: 'Trending this week', path: '/trending/movie/week' },
  popular:     { label: 'Popular now',        path: '/movie/popular' },
  top_rated:   { label: 'Top rated of all time', path: '/movie/top_rated' },
  now_playing: { label: 'In theatres now',    path: '/movie/now_playing' },
  upcoming:    { label: 'Coming soon',        path: '/movie/upcoming' },
};

/* ── Tiny helpers ────────────────────────────── */
const $  = id => document.getElementById(id);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const esc = s => !s ? '' : String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function getLS(k, fb) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } }
function setLS(k, v)  { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }

const bin     = () => getLS(K_BIN, []);
const selects = () => getLS(K_SELECTS, []);
const watched = () => getLS(K_WATCHED, []);
const inList  = (list, id) => list.some(m => m.id === id);
const findIn  = (list, id) => list.find(m => m.id === id);

const year    = m => m && m.release_date ? m.release_date.slice(0, 4) : '—';
const score   = m => m && m.vote_average ? m.vote_average.toFixed(1) : null;
const runtime = min => min ? `${Math.floor(min / 60)}h ${String(min % 60).padStart(2, '0')}m` : '—';
const money   = n => !n ? '—' : n >= 1e9 ? '$' + (n / 1e9).toFixed(2) + 'B' : '$' + Math.round(n / 1e6) + 'M';

/* ══════════════════════════════════════════════
   FETCH
══════════════════════════════════════════════ */
async function api(path, params = {}) {
  const url = new URL(BASE + path);
  url.searchParams.set('api_key', API_KEY);
  url.searchParams.set('language', 'en-US');
  Object.entries(params).forEach(([k, v]) => (v != null && v !== '') && url.searchParams.set(k, v));
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB ${res.status} on ${path}`);
  return res.json();
}

/* ══════════════════════════════════════════════
   BOOT
══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initReels();
  initSearch();
  initRig();
  initRigControls();
  initSplice();
  initDrawer();
  initModals();
  initScrollTop();
  initKeys();
  runTimecode();
  refreshCounts();
  fetchGenres();
  load(true);
  loadRecs();

  $('brandBtn').addEventListener('click', e => { e.preventDefault(); resetToTrending(); });
  // Guard the page counter: a second click mid-fetch would skip a page.
  $('moreBtn').addEventListener('click', () => {
    if (state.loading) return;
    state.page++;
    load(false);
  });
});

/* ══════════════════════════════════════════════
   SLATE - the fields report real state
══════════════════════════════════════════════ */
function runTimecode() {
  // Session elapsed, counted at 24 frames per second.
  const t0 = Date.now();
  const tick = () => {
    const ms = Date.now() - t0;
    const f = Math.floor((ms % 1000) / (1000 / 24));
    const s = Math.floor(ms / 1000) % 60;
    const m = Math.floor(ms / 60000) % 60;
    const h = Math.floor(ms / 3600000);
    const p = n => String(n).padStart(2, '0');
    $('sfTC').textContent = `${p(h)}:${p(m)}:${p(s)}:${p(f)}`;
  };
  tick();
  setInterval(tick, 1000 / 12);
}

function updateSlate() {
  const scene = state.query ? 'SEARCH' : (CATS[state.category]?.label || '').toUpperCase();
  $('sfScene').textContent = scene;
  $('sfTake').textContent = String(++state.take).padStart(3, '0');
  $('sfRoll').textContent = String.fromCharCode(65 + (state.take - 1) % 26);
}

/* ══════════════════════════════════════════════
   REELS (categories)
══════════════════════════════════════════════ */
function initReels() {
  $$('.reel').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('active') && !state.query) return;
      $$('.reel').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.category = btn.dataset.category;
      clearSearchField();
      load(true);
    });
  });
}

function resetToTrending() {
  $$('.reel').forEach(b => b.classList.toggle('active', b.dataset.category === 'trending'));
  state.category = 'trending';
  clearSearchField();
  resetFilters(false);
  load(true);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ══════════════════════════════════════════════
   SEARCH
══════════════════════════════════════════════ */
function initSearch() {
  const input = $('searchInput');
  const clear = $('searchClear');
  let timer;

  input.addEventListener('input', () => {
    clearTimeout(timer);
    const q = input.value.trim();
    clear.classList.toggle('hidden', !q);
    timer = setTimeout(() => { state.query = q; syncRuntimeAvailability(); load(true); }, 450);
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') { clearTimeout(timer); state.query = input.value.trim(); syncRuntimeAvailability(); load(true); }
    if (e.key === 'Escape') { input.blur(); }
  });

  clear.addEventListener('click', () => { clearSearchField(); syncRuntimeAvailability(); load(true); });
}

function clearSearchField() {
  $('searchInput').value = '';
  $('searchClear').classList.add('hidden');
  state.query = '';
}

/* ══════════════════════════════════════════════
   FILTER RIG
══════════════════════════════════════════════ */
function initRig() {
  $('filterBtn').addEventListener('click', toggleRig);
  $('rigReset').addEventListener('click', () => resetFilters(true));

  const f = state.filters;

  $('yearFrom').addEventListener('change', e => { f.yearFrom = clampYear(e.target.value); e.target.value = f.yearFrom || ''; commitFilters(); });
  $('yearTo')  .addEventListener('change', e => { f.yearTo   = clampYear(e.target.value); e.target.value = f.yearTo   || ''; commitFilters(); });

  bindRange('runtimeMax', 'runtimeOut', v => { f.runtimeMax = +v; return +v >= 240 ? 'any' : `${v} min`; });
  bindRange('ratingMin',  'ratingOut',  v => { f.ratingMin  = +v; return +v <= 0   ? 'any' : `${(+v).toFixed(1)} ★`; });
  bindRange('votesMin',   'votesOut',   v => { f.votesMin   = +v; return +v <= 0   ? 'any' : `${(+v).toLocaleString()}+`; });

  $('sortSelect').addEventListener('change', e => { f.sort = e.target.value; commitFilters(); });
}

function bindRange(id, outId, apply) {
  const input = $(id);
  const out = $(outId);
  out.textContent = apply(input.value);          // paint initial label without loading
  input.addEventListener('input', () => { out.textContent = apply(input.value); });
  input.addEventListener('change', commitFilters);
}

function clampYear(v) {
  const n = parseInt(v, 10);
  if (!n || n < 1900 || n > 2100) return null;
  return n;
}

/* ══════════════════════════════════════════════
   RIG CONTROLS - themed dropdown + number steppers
══════════════════════════════════════════════ */
const combos = [];

function initRigControls() {
  buildCombo($('sortSelect'));
  $$('#rig input[type="number"]').forEach(buildStepper);

  document.addEventListener('click', e => {
    if (!e.target.closest('.rs')) combos.forEach(c => c.close());
  });
}

function buildCombo(sel) {
  if (!sel || sel.dataset.combo) return;
  sel.dataset.combo = '1';

  const wrap = el('div', 'rs');
  sel.parentNode.insertBefore(wrap, sel);
  wrap.appendChild(sel);
  sel.classList.add('rs-native');

  const trigger = el('button', 'rs-trigger', `<span class="rs-label"></span><span class="rs-caret" aria-hidden="true"></span>`);
  trigger.type = 'button';
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');
  wrap.appendChild(trigger);

  const panel = el('div', 'rs-panel');
  panel.setAttribute('role', 'listbox');
  wrap.appendChild(panel);

  const opts = [...sel.options];
  opts.forEach((o, i) => {
    const b = el('button', 'rs-opt', esc(o.textContent));
    b.type = 'button';
    b.setAttribute('role', 'option');
    b.addEventListener('click', () => choose(i));
    panel.appendChild(b);
  });

  const label = trigger.querySelector('.rs-label');
  const sync = () => {
    label.textContent = sel.options[sel.selectedIndex]?.textContent || '';
    [...panel.children].forEach((c, i) => c.setAttribute('aria-selected', i === sel.selectedIndex ? 'true' : 'false'));
  };
  const close = () => { wrap.classList.remove('rs-open'); trigger.setAttribute('aria-expanded', 'false'); };
  const open  = () => { combos.forEach(c => c.close()); wrap.classList.add('rs-open'); trigger.setAttribute('aria-expanded', 'true'); };
  const choose = i => {
    sel.selectedIndex = Math.max(0, Math.min(opts.length - 1, i));
    sync();
    sel.dispatchEvent(new Event('change', { bubbles: true }));
    close();
    trigger.focus();
  };

  trigger.addEventListener('click', () => wrap.classList.contains('rs-open') ? close() : open());
  trigger.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      choose(sel.selectedIndex + (e.key === 'ArrowDown' ? 1 : -1));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      wrap.classList.contains('rs-open') ? close() : open();
    } else if (e.key === 'Escape') {
      close();
    }
  });

  sync();
  combos.push({ close, sync });
}

function buildStepper(input) {
  if (input.dataset.step) return;
  input.dataset.step = '1';

  const wrap = el('div', 'rig-step');
  input.parentNode.insertBefore(wrap, input);
  const aria = input.getAttribute('aria-label') || 'value';

  const btn = (glyph, dir) => {
    const b = el('button', 'rig-step-b', glyph);
    b.type = 'button';
    b.tabIndex = -1;
    b.setAttribute('aria-label', (dir < 0 ? 'Lower ' : 'Raise ') + aria);
    b.addEventListener('click', () => {
      const min = input.min !== '' ? +input.min : -Infinity;
      const max = input.max !== '' ? +input.max : Infinity;
      const fallback = dir < 0 ? (+input.placeholder || 2026) : (+input.placeholder || 1900);
      const base = input.value === '' ? fallback : +input.value;
      input.value = Math.max(min, Math.min(max, base + dir));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    return b;
  };

  wrap.appendChild(btn('−', -1));
  wrap.appendChild(input);
  wrap.appendChild(btn('+', 1));
}

function toggleRig() {
  const open = $('rig').classList.toggle('hidden');
  $('filterBtn').classList.toggle('on', !open);
  if (!open) $('rig').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

function filtersActive() {
  const f = state.filters;
  return !!(f.genre || f.yearFrom || f.yearTo || f.runtimeMax < 240 || f.ratingMin > 0 || f.votesMin > 0 || f.sort !== 'popularity.desc');
}

function commitFilters() {
  $('filterDot').classList.toggle('hidden', !filtersActive());
  load(true);
}

function resetFilters(reload) {
  state.filters = { genre: null, yearFrom: null, yearTo: null, runtimeMax: 240, ratingMin: 0, votesMin: 0, sort: 'popularity.desc' };
  $('yearFrom').value = '';
  $('yearTo').value = '';
  $('runtimeMax').value = 240; $('runtimeOut').textContent = 'any';
  $('ratingMin').value = 0;    $('ratingOut').textContent = 'any';
  $('votesMin').value = 0;     $('votesOut').textContent = 'any';
  $('sortSelect').value = 'popularity.desc';
  combos.forEach(c => c.sync());   // keep the custom dropdown label honest
  $$('.chip').forEach(c => c.classList.toggle('active', c.dataset.genre === ''));
  $('filterDot').classList.add('hidden');
  if (reload) load(true);
}

/* Runtime can't be filtered on search results - TMDB's search endpoint
   doesn't return runtime, so say so rather than silently ignoring it. */
function syncRuntimeAvailability() {
  const searching = !!state.query;
  $('runtimeField').classList.toggle('muted', searching);
  $('runtimeMax').disabled = searching;
  $('runtimeNote').classList.toggle('hidden', !searching);
}

/* ── Genres ── */
async function fetchGenres() {
  try {
    const data = await api('/genre/movie/list');
    state.genres = data.genres || [];
  } catch { state.genres = []; }
  buildChips();
}

function buildChips() {
  const wrap = $('genreChips');
  wrap.innerHTML = '';

  const all = el('button', 'chip active', 'All');
  all.dataset.genre = '';
  all.addEventListener('click', () => pickGenre(null, all));
  wrap.appendChild(all);

  state.genres.forEach(g => {
    const chip = el('button', 'chip', esc(g.name));
    chip.dataset.genre = g.id;
    chip.addEventListener('click', () => pickGenre(g.id, chip));
    wrap.appendChild(chip);
  });
}

function pickGenre(id, chip) {
  $$('.chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  state.filters.genre = id;
  commitFilters();
}

/* ══════════════════════════════════════════════
   LOAD
══════════════════════════════════════════════ */
async function load(reset) {
  if (state.loading) return;
  state.loading = true;

  if (reset) {
    state.page = 1;
    state.shown.clear();
    $('grid').innerHTML = '';
    $('empty').classList.add('hidden');
    $('moreWrap').classList.add('hidden');
    updateSlate();
    // the recs reel is only relevant on a plain browse, not a search / filtered view
    $('recs').classList.toggle('hidden', !state.hasRecs || !!state.query || filtersActive());
  }
  $('loader').classList.remove('hidden');
  $('grid').style.opacity = reset ? '1' : '.45';
  $('moreBtn').disabled = true;

  try {
    const { movies, total, totalPages, title } = await queryPool();
    state.totalPages = totalPages;

    $('bayTitle').textContent = title;
    $('bayCount').textContent = total ? `${total.toLocaleString()} titles` : '';

    if (!movies.length && reset) {
      showEmpty();
    } else {
      renderGrid(movies);
      const more = state.page < Math.min(totalPages, 500);
      $('moreWrap').classList.toggle('hidden', !more);
    }

    if (reset && movies.length) setFeature(movies[Math.floor(Math.random() * Math.min(6, movies.length))]);

  } catch (err) {
    console.error(err);
    if (reset) showEmpty('Could not reach the archive', 'TMDB did not answer. Check your connection and try again.');
  }

  $('loader').classList.add('hidden');
  $('grid').style.opacity = '1';
  $('moreBtn').disabled = false;
  state.loading = false;
}

/* Decide which endpoint answers the current state, and get results. */
async function queryPool() {
  const f = state.filters;

  /* 1. Search - TMDB's search endpoint takes no filters, so apply what we
        can client-side (year / rating / votes). Runtime isn't returned. */
  if (state.query) {
    const data = await api('/search/movie', { query: state.query, page: state.page, include_adult: false });
    let movies = data.results || [];
    const before = movies.length;
    movies = movies.filter(m => {
      const y = m.release_date ? +m.release_date.slice(0, 4) : null;
      if (f.yearFrom && (!y || y < f.yearFrom)) return false;
      if (f.yearTo   && (!y || y > f.yearTo))   return false;
      if (f.ratingMin > 0 && (m.vote_average || 0) < f.ratingMin) return false;
      if (f.votesMin  > 0 && (m.vote_count   || 0) < f.votesMin)  return false;
      if (f.genre && !(m.genre_ids || []).includes(+f.genre)) return false;
      return true;
    });
    movies = sortClientSide(movies, f.sort);
    const trimmed = before - movies.length;
    return {
      movies,
      total: data.total_results,
      totalPages: data.total_pages || 1,
      title: `“${state.query}”${trimmed ? ` · ${trimmed} filtered out` : ''}`,
    };
  }

  /* 2. Filtered browse - /discover, shaped to imitate the chosen reel. */
  if (filtersActive()) {
    const params = {
      page: state.page,
      sort_by: f.sort,
      include_adult: false,
      'vote_count.gte': f.votesMin || undefined,
      'vote_average.gte': f.ratingMin || undefined,
      'with_runtime.lte': f.runtimeMax < 240 ? f.runtimeMax : undefined,
      with_genres: f.genre || undefined,
      'primary_release_date.gte': f.yearFrom ? `${f.yearFrom}-01-01` : undefined,
      'primary_release_date.lte': f.yearTo ? `${f.yearTo}-12-31` : undefined,
    };

    // Ranking by score with no vote floor surfaces one-vote flukes.
    if (f.sort === 'vote_average.desc' && !f.votesMin) params['vote_count.gte'] = 300;

    Object.assign(params, categoryWindow(state.category, params));

    const data = await api('/discover/movie', params);
    return {
      movies: data.results || [],
      total: data.total_results,
      totalPages: data.total_pages || 1,
      title: filterTitle(),
    };
  }

  /* 3. Plain browse - the reel's own endpoint. */
  const cat = CATS[state.category] || CATS.popular;
  const data = await api(cat.path, { page: state.page });
  return {
    movies: data.results || [],
    total: data.total_results,
    totalPages: data.total_pages || 1,
    title: cat.label,
  };
}

/* Reels have no /discover equivalent, so approximate them with date windows. */
function categoryWindow(cat, params) {
  const today = new Date();
  const iso = d => d.toISOString().slice(0, 10);
  const out = {};

  if (cat === 'now_playing') {
    const from = new Date(today); from.setDate(from.getDate() - 45);
    out['primary_release_date.gte'] = maxDate(params['primary_release_date.gte'], iso(from));
    out['primary_release_date.lte'] = minDate(params['primary_release_date.lte'], iso(today));
  } else if (cat === 'upcoming') {
    const from = new Date(today); from.setDate(from.getDate() + 1);
    out['primary_release_date.gte'] = maxDate(params['primary_release_date.gte'], iso(from));
  } else if (cat === 'top_rated' && !params['vote_count.gte']) {
    out['vote_count.gte'] = 300;
  }
  return out;
}

const maxDate = (a, b) => !a ? b : !b ? a : (a > b ? a : b);
const minDate = (a, b) => !a ? b : !b ? a : (a < b ? a : b);

function filterTitle() {
  const f = state.filters;
  const genre = f.genre ? state.genres.find(g => g.id == f.genre) : null;
  const bits = [genre ? `${genre.name} films` : 'All films'];
  if (f.yearFrom && f.yearTo) bits.push(`${f.yearFrom}–${f.yearTo}`);
  else if (f.yearFrom) bits.push(`${f.yearFrom} onwards`);
  else if (f.yearTo) bits.push(`up to ${f.yearTo}`);
  if (f.runtimeMax < 240) bits.push(`under ${f.runtimeMax} min`);
  if (f.ratingMin > 0) bits.push(`${f.ratingMin.toFixed(1)}★ and up`);
  return bits.join(' · ');
}

function sortClientSide(movies, sort) {
  const by = {
    'popularity.desc':            (a, b) => (b.popularity || 0) - (a.popularity || 0),
    'vote_average.desc':          (a, b) => (b.vote_average || 0) - (a.vote_average || 0),
    'primary_release_date.desc':  (a, b) => (b.release_date || '').localeCompare(a.release_date || ''),
    'primary_release_date.asc':   (a, b) => (a.release_date || '9999').localeCompare(b.release_date || '9999'),
    'revenue.desc':               (a, b) => (b.popularity || 0) - (a.popularity || 0), // revenue absent from search
  };
  return [...movies].sort(by[sort] || by['popularity.desc']);
}

function showEmpty(title, msg) {
  $('emptyTitle').textContent = title || 'Nothing in this bin';
  $('emptyMsg').textContent = msg || (state.query
    ? 'No titles match those words - and the rig may be trimming more.'
    : 'The filter rig is set too tight. Loosen it or reset.');
  $('empty').classList.remove('hidden');
}

/* ══════════════════════════════════════════════
   FEATURE STRIP
══════════════════════════════════════════════ */
function setFeature(m) {
  if (!m) return;
  const bg = $('featureBg');
  if (m.backdrop_path) {
    const img = new Image();
    img.onload = () => { bg.style.backgroundImage = `url(${IMG_BIG}${m.backdrop_path})`; bg.classList.add('in'); };
    img.src = `${IMG_BIG}${m.backdrop_path}`;
  } else {
    bg.classList.remove('in');
  }

  const s = score(m);
  const isSel = inList(selects(), m.id);
  const isBin = inList(bin(), m.id);

  $('featureBody').innerHTML = `
    <div class="feat-flags">
      <span class="flag flag-tape">On the bench</span>
      ${year(m) !== '—' ? `<span class="flag">${year(m)}</span>` : ''}
      ${m.original_language ? `<span class="flag flag-gate">${esc(m.original_language.toUpperCase())}</span>` : ''}
    </div>
    <h1 class="feat-title">${esc(m.title)}</h1>
    <div class="feat-meta">
      ${s ? `<div class="feat-score">${iStar()}${s} <span style="color:var(--ink-3)">/ 10</span></div>` : ''}
      ${m.vote_count ? `<span class="feat-fact">${m.vote_count.toLocaleString()} votes</span>` : ''}
    </div>
    ${m.overview ? `<p class="feat-logline">${esc(m.overview)}</p>` : ''}
    <div class="feat-acts">
      <button class="btn btn-primary" id="featOpen">${iPlay()} Open the file</button>
      <button class="btn btn-ghost ${isBin ? 'on' : ''}" id="featBin">${iBin(isBin)} ${isBin ? 'In your bin' : 'Add to bin'}</button>
      <button class="btn btn-ghost ${isSel ? 'on' : ''}" id="featSel">${iHeart(isSel)} ${isSel ? 'Selected' : 'Select'}</button>
    </div>`;

  $('featOpen').addEventListener('click', () => openDetail(m.id));
  $('featBin').addEventListener('click', () => { toggleBin(m); setFeature(m); });
  $('featSel').addEventListener('click', () => { toggleSelect(m); setFeature(m); });
}

/* ══════════════════════════════════════════════
   RECOMMENDATIONS - "because you saved ..."
══════════════════════════════════════════════ */
let recsTimer = null;

function scheduleRecs() {
  clearTimeout(recsTimer);
  recsTimer = setTimeout(loadRecs, 1400);
}

async function loadRecs() {
  const section = $('recs');
  const row = $('recsRow');
  if (!section || !row) return;

  // seeds: the ones you loved, then films you rated 3+, then the queue
  const seeds = [
    ...selects(),
    ...watched().filter(x => (x.rating || 0) >= 3),
    ...bin(),
  ];
  if (!seeds.length) { state.hasRecs = false; section.classList.add('hidden'); return; }

  const seedIds = [...new Set(seeds.map(s => s.id))].slice(-6).reverse();
  const titleOf = id => (seeds.find(s => s.id === id) || {}).title;
  const owned = new Set(seeds.map(s => s.id));
  const tally = new Map();

  try {
    const batches = await Promise.all(
      seedIds.map(id => api(`/movie/${id}/recommendations`).catch(() => ({ results: [] })))
    );
    batches.forEach(b => (b.results || []).forEach(mv => {
      if (!mv.poster_path || mv.adult || owned.has(mv.id)) return;
      const cur = tally.get(mv.id) || { m: mv, hits: 0 };
      cur.hits++;
      tally.set(mv.id, cur);
    }));
  } catch { state.hasRecs = false; section.classList.add('hidden'); return; }

  const picks = [...tally.values()]
    .sort((a, b) => b.hits - a.hits || (b.m.popularity || 0) - (a.m.popularity || 0))
    .slice(0, 18)
    .map(x => x.m);

  if (picks.length < 4) { state.hasRecs = false; section.classList.add('hidden'); return; }

  const names = seedIds.map(titleOf).filter(Boolean).slice(0, 2);
  $('recsHead').textContent = names.length
    ? `Because you saved ${names.join(' and ')}`
    : 'Cut from your reels';

  row.innerHTML = '';
  picks.forEach(mv => row.appendChild(miniCard(mv, () => openDetail(mv.id))));

  state.hasRecs = true;
  if (!state.query && !filtersActive()) section.classList.remove('hidden');
}

/* ══════════════════════════════════════════════
   GRID
══════════════════════════════════════════════ */
function renderGrid(movies) {
  const grid = $('grid');
  const b = bin(), s = selects(), w = watched();

  // TMDB's paged endpoints repeat titles between pages as popularity shifts,
  // so the same poster can arrive twice. Show each film once.
  movies
    .filter(m => !state.shown.has(m.id) && state.shown.add(m.id))
    .forEach((m, i) => {
      const card = frameCard(m, { b, s, w });
      card.style.animationDelay = `${(i % 20) * 35}ms`;
      grid.appendChild(card);
    });
}

function frameCard(m, lists) {
  const b = lists?.b || bin(), s = lists?.s || selects(), w = lists?.w || watched();
  const isBin = inList(b, m.id), isSel = inList(s, m.id);
  const log = findIn(w, m.id);
  const sc = score(m);
  const cls = sc >= 7.5 ? 'high' : (sc && +sc < 5 ? 'low' : '');

  const card = el('div', 'frame' + (log ? ' is-watched' : ''));
  card.innerHTML = `
    <div class="frame-gate">
      ${m.poster_path
        ? `<img src="${IMG}${m.poster_path}" alt="${esc(m.title)}" loading="lazy">`
        : `<div class="frame-blank">${iFilm()}</div>`}
      <div class="frame-score ${cls}">${iStar()}${sc || '—'}</div>
      <div class="frame-acts">
        <button class="act act-bin ${isBin ? 'on' : ''}" title="${isBin ? 'Remove from bin' : 'Add to bin'}">${iBin(isBin)}</button>
        <button class="act act-sel ${isSel ? 'on' : ''}" title="${isSel ? 'Deselect' : 'Select'}">${iHeart(isSel)}</button>
      </div>
    </div>
    <div class="frame-cap">
      <div class="frame-title">${esc(m.title)}</div>
      <div class="frame-sub" data-year="${year(m)}" data-score="${sc || ''}">
        <span>${year(m)}</span>
        ${log && log.rating ? `<span class="frame-stars">${'★'.repeat(log.rating)}</span>` : (sc ? `<span>${sc} ★</span>` : '')}
      </div>
    </div>`;

  card.querySelector('.act-bin').addEventListener('click', e => { e.stopPropagation(); toggleBin(m); refreshFrames(m.id); });
  card.querySelector('.act-sel').addEventListener('click', e => { e.stopPropagation(); toggleSelect(m); refreshFrames(m.id); });
  card.addEventListener('click', () => openDetail(m.id));
  card.dataset.id = m.id;
  return card;
}

/* Re-paint every on-screen card for one film after a list change. */
function refreshFrames(id) {
  const isBin = inList(bin(), id), isSel = inList(selects(), id);
  const log = findIn(watched(), id);

  $$(`.frame[data-id="${id}"]`).forEach(card => {
    const bBtn = card.querySelector('.act-bin');
    const sBtn = card.querySelector('.act-sel');
    if (bBtn) { bBtn.classList.toggle('on', isBin); bBtn.innerHTML = iBin(isBin); }
    if (sBtn) { sBtn.classList.toggle('on', isSel); sBtn.innerHTML = iHeart(isSel); }

    card.classList.toggle('is-watched', !!log);

    // Your own rating outranks the crowd's once you've logged one.
    const sub = card.querySelector('.frame-sub');
    if (sub) {
      const sc = sub.dataset.score;
      const right = log && log.rating ? `<span class="frame-stars">${'★'.repeat(log.rating)}</span>`
                  : (sc ? `<span>${sc} ★</span>` : '');
      sub.innerHTML = `<span>${sub.dataset.year}</span>${right}`;
    }
  });
}

/* ══════════════════════════════════════════════
   DETAIL
══════════════════════════════════════════════ */
async function openDetail(id) {
  openModal('detailModal');
  $('detailBody').innerHTML = `<div style="min-height:340px;display:grid;place-items:center;">
    <div class="loader-reel"><span></span><span></span><span></span></div></div>`;

  try {
    const m = await api(`/movie/${id}`, { append_to_response: 'credits,videos,similar,release_dates,watch/providers' });
    renderDetail(m);
  } catch (err) {
    console.error(err);
    $('detailBody').innerHTML = `<div class="bin-empty" style="padding:80px 20px;">
      <p>Could not pull this file from the archive.</p></div>`;
  }
}

function renderDetail(m) {
  const trailer = pickTrailer(m.videos?.results || []);
  const crew = m.credits?.crew || [];
  const cast = (m.credits?.cast || []).slice(0, 14);
  const director = crew.find(c => c.job === 'Director');
  const writer = crew.find(c => ['Screenplay', 'Writer'].includes(c.job));
  const dop = crew.find(c => c.job === 'Director of Photography');
  const similar = (m.similar?.results || []).filter(s => s.poster_path).slice(0, 14);
  const cert = usCert(m.release_dates);
  const watch = watchProviders(m['watch/providers']);
  const sc = score(m);
  const log = findIn(watched(), m.id);
  const isBin = inList(bin(), m.id), isSel = inList(selects(), m.id);

  $('detailBody').innerHTML = `
    <div class="d-stage" id="dStage">
      ${m.backdrop_path ? `<div class="d-stage-img" style="background-image:url(${IMG_BIG}${m.backdrop_path})"></div>` : ''}
      <div class="d-stage-scrim"></div>
      ${trailer ? `<button class="d-play" id="dPlay">
          <span class="d-play-ring">${iPlay()}</span> Screen the trailer
        </button>` : ''}
    </div>

    <div class="d-body">
      <div class="d-top">
        ${m.poster_path ? `<div class="d-poster"><img src="${IMG}${m.poster_path}" alt="${esc(m.title)}"></div>` : ''}
        <div>
          <h2 class="d-title">${esc(m.title)}</h2>
          ${m.tagline ? `<p class="d-tagline">“${esc(m.tagline)}”</p>` : ''}
          <div class="d-meta">
            ${sc ? `<span class="d-score">${iStar()}${sc}</span>` : ''}
            ${m.vote_count ? `<span class="pill">${m.vote_count.toLocaleString()} votes</span>` : ''}
            <span class="pill">${year(m)}</span>
            <span class="pill">${runtime(m.runtime)}</span>
            ${cert ? `<span class="pill">${esc(cert)}</span>` : ''}
          </div>
        </div>
      </div>

      <div class="d-acts">
        <button class="btn ${isBin ? 'btn-ghost on' : 'btn-primary'}" id="dBin">${iBin(isBin)} ${isBin ? 'In your bin' : 'Add to bin'}</button>
        <button class="btn btn-ghost ${isSel ? 'on' : ''}" id="dSel">${iHeart(isSel)} ${isSel ? 'Selected' : 'Select'}</button>
        <button class="btn btn-ghost ${log ? 'on' : ''}" id="dSeen">${iCheck()} ${log ? 'Watched' : 'Mark watched'}</button>
      </div>

      ${m.overview ? `<p class="d-logline">${esc(m.overview)}</p>` : ''}

      <div class="d-genres">${(m.genres || []).map(g => `<span class="pill">${esc(g.name)}</span>`).join('')}</div>

      ${watch ? `
      <div class="d-h">Where to watch${watch.region !== 'US' ? ` · ${watch.region}` : ''}</div>
      <div class="watch">
        ${watch.flatrate.length ? watchGroup('Stream', watch.flatrate) : ''}
        ${watch.rent.length ? watchGroup('Rent', watch.rent) : ''}
        ${watch.buy.length ? watchGroup('Buy', watch.buy) : ''}
        ${watch.link ? `<a class="watch-src" href="${esc(watch.link)}" target="_blank" rel="noopener">Listings via JustWatch ↗</a>` : ''}
      </div>` : ''}

      <div id="logSlot"></div>

      <div class="d-h">Spec sheet</div>
      <div class="d-specs">
        ${director ? specLink('Director', director) : ''}
        ${writer ? specLink('Writer', writer) : ''}
        ${dop ? specLink('Cinematography', dop) : ''}
        <div class="spec"><div class="spec-k">Released</div><div class="spec-v">${m.release_date || '—'}</div></div>
        <div class="spec"><div class="spec-k">Runtime</div><div class="spec-v">${runtime(m.runtime)}</div></div>
        <div class="spec"><div class="spec-k">Language</div><div class="spec-v">${(m.original_language || '—').toUpperCase()}</div></div>
        <div class="spec"><div class="spec-k">Status</div><div class="spec-v">${esc(m.status || '—')}</div></div>
        ${m.budget  > 0 ? `<div class="spec"><div class="spec-k">Budget</div><div class="spec-v">${money(m.budget)}</div></div>` : ''}
        ${m.revenue > 0 ? `<div class="spec"><div class="spec-k">Box office</div><div class="spec-v">${money(m.revenue)}</div></div>` : ''}
      </div>

      ${cast.length ? `<div class="d-h">Cast - tap for their films</div><div class="row" id="castRow"></div>` : ''}
      ${similar.length ? `<div class="d-h">More like this</div><div class="rail-row" id="simRow"></div>` : ''}
    </div>`;

  // Trailer - the iframe only mounts on click, so nothing loads from
  // YouTube unless the viewer asks for it.
  if (trailer) {
    $('dPlay').addEventListener('click', () => {
      $('dStage').innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${trailer.key}?autoplay=1&rel=0"
        title="${esc(m.title)} trailer" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>`;
    });
  }

  $('dBin').addEventListener('click', () => { toggleBin(m); renderDetail(m); refreshFrames(m.id); });
  $('dSel').addEventListener('click', () => { toggleSelect(m); renderDetail(m); refreshFrames(m.id); });
  $('dSeen').addEventListener('click', () => { toggleWatched(m); renderDetail(m); refreshFrames(m.id); });

  renderLog(m);

  if (cast.length) {
    const row = $('castRow');
    cast.forEach(c => {
      const item = el('div', 'cast', `
        <div class="cast-ph">${c.profile_path ? `<img src="${IMG_SM}${c.profile_path}" alt="${esc(c.name)}" loading="lazy">` : iUser()}</div>
        <div class="cast-n">${esc(c.name)}</div>
        <div class="cast-r">${esc(c.character || '')}</div>`);
      item.addEventListener('click', () => openPerson(c.id));
      row.appendChild(item);
    });
  }

  if (similar.length) {
    const row = $('simRow');
    similar.forEach(s => row.appendChild(miniCard(s, () => openDetail(s.id))));
  }
}

function specLink(label, person) {
  return `<div class="spec"><div class="spec-k">${label}</div>
    <div class="spec-v link" data-person="${person.id}" onclick="openPerson(${person.id})">${esc(person.name)}</div></div>`;
}

function miniCard(m, onClick) {
  const item = el('div', 'mini', `
    <div class="mini-p">${m.poster_path ? `<img src="${IMG_SM}${m.poster_path}" alt="${esc(m.title)}" loading="lazy">` : iFilm()}</div>
    <div class="mini-t">${esc(m.title)}</div>
    <div class="mini-y">${year(m)}</div>`);
  item.addEventListener('click', onClick);
  return item;
}

function pickTrailer(videos) {
  const yt = videos.filter(v => v.site === 'YouTube');
  return yt.find(v => v.type === 'Trailer' && v.official)
      || yt.find(v => v.type === 'Trailer')
      || yt.find(v => v.type === 'Teaser')
      || null;
}

function usCert(releaseDates) {
  const us = (releaseDates?.results || []).find(r => r.iso_3166_1 === 'US');
  const rated = (us?.release_dates || []).find(r => r.certification);
  return rated ? `Rated ${rated.certification}` : null;
}

/* Where to watch - pick the viewer's region, fall back to US then GB. */
function watchProviders(wp) {
  const results = wp?.results;
  if (!results) return null;
  const pref = (navigator.language || 'en-US').split('-')[1];
  const region = [pref && pref.toUpperCase(), 'US', 'GB'].find(r => r && results[r]);
  if (!region) return null;
  const r = results[region];
  const map = arr => (arr || []).slice(0, 10).map(p => ({ name: p.provider_name, logo: p.logo_path }));
  const flatrate = map(r.flatrate), rent = map(r.rent), buy = map(r.buy);
  if (!flatrate.length && !rent.length && !buy.length) return null;
  return { region, link: r.link, flatrate, rent, buy };
}

function watchGroup(label, list) {
  return `<div class="watch-g">
    <span class="watch-k">${label}</span>
    <div class="watch-logos">
      ${list.map(p => `<span class="watch-logo" title="${esc(p.name)}">${
        p.logo ? `<img src="${IMG_SM}${p.logo}" alt="${esc(p.name)}" loading="lazy">` : esc(p.name)
      }</span>`).join('')}
    </div>
  </div>`;
}

/* ══════════════════════════════════════════════
   THE LOG - watched, your rating, your note
══════════════════════════════════════════════ */
function renderLog(m) {
  const slot = $('logSlot');
  const log = findIn(watched(), m.id);
  if (!log) { slot.innerHTML = ''; return; }

  slot.innerHTML = `
    <div class="log">
      <div class="log-row">
        <span class="log-q">Your rating</span>
        <div class="stars" id="logStars">
          ${[1,2,3,4,5].map(n => `<button class="star ${log.rating >= n ? 'lit' : ''}" data-n="${n}" aria-label="${n} star${n>1?'s':''}">${iStarBig()}</button>`).join('')}
        </div>
        ${log.rating ? `<button class="log-clear" id="logClear">clear</button>` : ''}
      </div>
      <textarea class="log-note" id="logNote" placeholder="Grease-pencil note - what stayed with you?">${esc(log.note || '')}</textarea>
      <div class="log-stamp">Logged ${fmtDate(log.ts)}${log.noteTs && log.noteTs !== log.ts ? ` · note updated ${fmtDate(log.noteTs)}` : ''}</div>
    </div>`;

  $$('#logStars .star').forEach(btn => {
    btn.addEventListener('click', () => {
      const n = +btn.dataset.n;
      updateLog(m.id, l => { l.rating = l.rating === n ? 0 : n; });
      renderLog(m);
      refreshFrames(m.id);
      toast(`Rated ${'★'.repeat(findIn(watched(), m.id).rating) || '—'}`);
    });
  });

  if ($('logClear')) $('logClear').addEventListener('click', () => {
    updateLog(m.id, l => { l.rating = 0; });
    renderLog(m); refreshFrames(m.id);
  });

  // Save the note as they type, quietly.
  let t;
  $('logNote').addEventListener('input', e => {
    clearTimeout(t);
    const v = e.target.value;
    t = setTimeout(() => { updateLog(m.id, l => { l.note = v; l.noteTs = Date.now(); }); }, 600);
  });
}

function updateLog(id, mutate) {
  const list = watched();
  const entry = list.find(x => x.id === id);
  if (!entry) return;
  mutate(entry);
  setLS(K_WATCHED, list);
}

function fmtDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

/* ══════════════════════════════════════════════
   PERSON
══════════════════════════════════════════════ */
async function openPerson(id) {
  openModal('personModal');
  $('personBody').innerHTML = `<div style="min-height:300px;display:grid;place-items:center;">
    <div class="loader-reel"><span></span><span></span><span></span></div></div>`;

  try {
    const p = await api(`/person/${id}`, { append_to_response: 'movie_credits' });
    renderPerson(p);
  } catch (err) {
    console.error(err);
    $('personBody').innerHTML = `<div class="bin-empty" style="padding:70px 20px;"><p>Could not pull that file.</p></div>`;
  }
}
window.openPerson = openPerson;   // spec-sheet links call this inline

function renderPerson(p) {
  const acted = (p.movie_credits?.cast || []);
  const crewed = (p.movie_credits?.crew || []).filter(c => ['Director', 'Screenplay', 'Writer', 'Director of Photography'].includes(c.job));

  // One entry per film, best-known first.
  const seen = new Set();
  const films = [...acted, ...crewed]
    .filter(f => f.poster_path && !seen.has(f.id) && seen.add(f.id))
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, 24);

  const bio = (p.biography || '').split('\n').filter(Boolean)[0] || 'No biography on file.';

  $('personBody').innerHTML = `
    <div class="p-head">
      <div class="p-photo">${p.profile_path ? `<img src="${IMG}${p.profile_path}" alt="${esc(p.name)}">` : iUser()}</div>
      <div style="min-width:0">
        <h2 class="p-name">${esc(p.name)}</h2>
        <div class="p-role">${esc(p.known_for_department || '')}${p.birthday ? ` · born ${fmtDate(p.birthday)}` : ''}${p.place_of_birth ? ` · ${esc(p.place_of_birth)}` : ''}</div>
        <p class="p-bio">${esc(bio)}</p>
      </div>
    </div>
    <div class="p-films">
      <div class="d-h">${films.length ? `${films.length} films on file` : 'No films on file'}</div>
      <div class="p-grid" id="pGrid"></div>
    </div>`;

  const grid = $('pGrid');
  films.forEach(f => grid.appendChild(miniCard(f, () => { closeModal('personModal'); openDetail(f.id); })));
}

/* ══════════════════════════════════════════════
   LISTS
══════════════════════════════════════════════ */
function snap(m) {
  return { id: m.id, title: m.title, poster_path: m.poster_path, vote_average: m.vote_average, release_date: m.release_date };
}

function toggleBin(m) {
  const list = bin();
  const i = list.findIndex(x => x.id === m.id);
  if (i === -1) { list.push(snap(m)); toast('Added to your bin'); }
  else { list.splice(i, 1); toast('Removed from your bin'); }
  setLS(K_BIN, list);
  refreshCounts();
  scheduleRecs();
}

function toggleSelect(m) {
  const list = selects();
  const i = list.findIndex(x => x.id === m.id);
  if (i === -1) { list.push(snap(m)); toast('Marked as a select'); }
  else { list.splice(i, 1); toast('Removed from selects'); }
  setLS(K_SELECTS, list);
  refreshCounts();
  scheduleRecs();
}

function toggleWatched(m) {
  const list = watched();
  const i = list.findIndex(x => x.id === m.id);
  if (i === -1) {
    list.push({ ...snap(m), rating: 0, note: '', ts: Date.now() });
    toast('Logged as watched');
    // Watching it clears it off the queue.
    const b = bin();
    const bi = b.findIndex(x => x.id === m.id);
    if (bi !== -1) { b.splice(bi, 1); setLS(K_BIN, b); }
  } else {
    list.splice(i, 1);
    toast('Removed from your log');
  }
  setLS(K_WATCHED, list);
  refreshCounts();
  scheduleRecs();
}

function refreshCounts() {
  const b = bin().length, s = selects().length, w = watched().length;
  $('nBin').textContent = b;
  $('nSelects').textContent = s;
  $('nWatched').textContent = w;
  const badge = $('binsCount');
  badge.textContent = b;
  badge.dataset.count = b;
}

/* ══════════════════════════════════════════════
   BINS DRAWER
══════════════════════════════════════════════ */
const BIN_HINTS = {
  bin:     'Films you mean to watch. Marking one watched clears it from here.',
  selects: 'The ones you loved.',
  watched: 'Your log - ratings and notes live on each film’s page.',
};

function initDrawer() {
  $('binsBtn').addEventListener('click', () => { openModal('binsModal'); renderDrawer(); });
  $$('.dtab').forEach(tab => {
    tab.addEventListener('click', () => {
      $$('.dtab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.bin = tab.dataset.bin;
      renderDrawer();
    });
  });
}

function renderDrawer() {
  const which = state.bin;
  const list = which === 'bin' ? bin() : which === 'selects' ? selects() : watched();
  const body = $('drawerBody');
  $('drawerHint').textContent = BIN_HINTS[which];

  if (!list.length) {
    body.innerHTML = `<div class="bin-empty">${iFilm()}<p>${
      which === 'bin' ? 'Nothing queued up yet.' :
      which === 'selects' ? 'No selects yet.' :
      'Nothing logged yet.'}</p></div>`;
    return;
  }

  body.innerHTML = '';
  // Newest first for the log; kept order elsewhere.
  const rows = which === 'watched' ? [...list].sort((a, b) => (b.ts || 0) - (a.ts || 0)) : [...list].reverse();

  rows.forEach(m => {
    const line = el('div', 'line', `
      <div class="line-p">${m.poster_path ? `<img src="${IMG_SM}${m.poster_path}" alt="" loading="lazy">` : ''}</div>
      <div class="line-b">
        <div class="line-t">${esc(m.title)}</div>
        <div class="line-m">${year(m)}${score(m) ? ` · ${score(m)} ★` : ''}${
          m.rating ? ` · <span class="line-stars">${'★'.repeat(m.rating)}</span>` : ''}</div>
        ${m.note ? `<div class="line-note">“${esc(m.note)}”</div>` : ''}
      </div>
      <button class="line-x" title="Remove">${iX()}</button>`);

    line.addEventListener('click', () => { closeModal('binsModal'); openDetail(m.id); });
    line.querySelector('.line-x').addEventListener('click', e => {
      e.stopPropagation();
      if (which === 'bin') toggleBin(m);
      else if (which === 'selects') toggleSelect(m);
      else toggleWatched(m);
      renderDrawer();
      refreshFrames(m.id);
    });
    body.appendChild(line);
  });
}

/* ══════════════════════════════════════════════
   RANDOM SPLICE - obeys the rig
══════════════════════════════════════════════ */
function initSplice() {
  $('spliceBtn').addEventListener('click', splice);
}

async function splice() {
  const f = state.filters;
  const btn = $('spliceBtn');
  btn.classList.add('on');

  try {
    const params = {
      sort_by: 'popularity.desc',
      include_adult: false,
      'vote_count.gte': Math.max(f.votesMin, 150),
      'vote_average.gte': f.ratingMin || undefined,
      'with_runtime.lte': f.runtimeMax < 240 ? f.runtimeMax : undefined,
      with_genres: f.genre || undefined,
      'primary_release_date.gte': f.yearFrom ? `${f.yearFrom}-01-01` : undefined,
      'primary_release_date.lte': f.yearTo ? `${f.yearTo}-12-31` : undefined,
    };

    // Ask once to learn how deep the pool goes, then jump somewhere random in it.
    const probe = await api('/discover/movie', { ...params, page: 1 });
    const pages = Math.min(probe.total_pages || 1, 30);
    if (!probe.results?.length) { toast('The rig is too tight to splice anything'); return; }

    const page = Math.floor(Math.random() * pages) + 1;
    const data = page === 1 ? probe : await api('/discover/movie', { ...params, page });
    const pool = (data.results || []).filter(m => m.poster_path);
    if (!pool.length) { toast('Nothing on that reel - try again'); return; }

    openDetail(pool[Math.floor(Math.random() * pool.length)].id);
  } catch (err) {
    console.error(err);
    toast('Could not reach the archive');
  } finally {
    setTimeout(() => btn.classList.remove('on'), 300);
  }
}

/* ══════════════════════════════════════════════
   MODALS
══════════════════════════════════════════════ */
function initModals() {
  $$('[data-close]').forEach(node => {
    node.addEventListener('click', () => closeModal(node.dataset.close === 'detail' ? 'detailModal'
      : node.dataset.close === 'person' ? 'personModal' : 'binsModal'));
  });
}

function openModal(id) {
  $(id).classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  $(id).classList.add('hidden');
  if (id === 'detailModal') $('detailBody').innerHTML = '';   // stop any playing trailer
  const anyOpen = ['detailModal', 'personModal', 'binsModal'].some(m => !$(m).classList.contains('hidden'));
  if (!anyOpen) document.body.style.overflow = '';
}

function topModal() {
  // Person sits above detail; close the innermost first.
  if (!$('personModal').classList.contains('hidden')) return 'personModal';
  if (!$('detailModal').classList.contains('hidden')) return 'detailModal';
  if (!$('binsModal').classList.contains('hidden')) return 'binsModal';
  return null;
}

/* ══════════════════════════════════════════════
   KEYBOARD
══════════════════════════════════════════════ */
function initKeys() {
  document.addEventListener('keydown', e => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName);

    if (e.key === 'Escape') {
      const top = topModal();
      if (top) { closeModal(top); return; }
    }
    if (typing || e.metaKey || e.ctrlKey || e.altKey) return;

    if (e.key === '/') { e.preventDefault(); $('searchInput').focus(); }
    else if (e.key.toLowerCase() === 'f') { toggleRig(); }
    else if (e.key.toLowerCase() === 'b') { openModal('binsModal'); renderDrawer(); }
    else if (e.key.toLowerCase() === 'r') { splice(); }
  });
}

/* ══════════════════════════════════════════════
   SCROLL TOP
══════════════════════════════════════════════ */
function initScrollTop() {
  const btn = $('scrollTop');
  window.addEventListener('scroll', () => btn.classList.toggle('show', window.scrollY > 520), { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ══════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════ */
function toast(msg, dur = 2200) {
  const wrap = $('toastWrap');
  const t = el('div', 'toast', `${iCheck()} ${esc(msg)}`);
  wrap.appendChild(t);
  setTimeout(() => {
    t.classList.add('out');
    t.addEventListener('animationend', () => t.remove(), { once: true });
  }, dur);
}

/* ══════════════════════════════════════════════
   ICONS
══════════════════════════════════════════════ */
const iStar = () => `<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
const iStarBig = () => `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
const iPlay = () => `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"/></svg>`;
const iCheck = () => `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
const iX = () => `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
const iUser = () => `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
const iFilm = () => `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="7" y1="4" x2="7" y2="20"/><line x1="17" y1="4" x2="17" y2="20"/><line x1="3" y1="12" x2="21" y2="12"/></svg>`;

const iBin = on => on
  ? `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M3 7h18v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M3 7l2-4h14l2 4z"/></svg>`
  : `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h18v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M3 7l2-4h14l2 4"/></svg>`;

const iHeart = on => on
  ? `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`
  : `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
