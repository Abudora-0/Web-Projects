/* ══════════════════════════════════════════════
   Spotify Clone  |  script.js
   ══════════════════════════════════════════════ */

'use strict';

/* ══ State ══════════════════════════════════════ */
const audio       = new Audio();

let albums        = [];      // { folder, title, artist, year, blurb, cover, trackIds[] }
let allTracks     = {};      // id -> { id, file, title, artist, albumTitle, folder, cover, year }
let playlists     = [];      // { id, name, trackIds[], created }
let likedIds      = [];      // track ids

let ctx           = null;    // { type, id, name, trackIds[] } - current playing context
let ctxOrder      = [];      // indices into ctx.trackIds (sequential or shuffled)
let ctxPos        = -1;      // position within ctxOrder
let queue         = [];      // user-queued track ids ("Next in queue")
let playHistory   = [];      // stack of played track ids (for Previous)
let currentId     = null;    // track id currently loaded

let shuffle       = false;
let repeat        = 'off';   // 'off' | 'context' | 'one'
let volume        = 0.7;
let muted         = false;
let prevVolume    = 0.7;

let seekDragging  = false;
let volDragging   = false;
let recent        = [];      // [{ type, id }] most-recent-first
let rpMode        = null;    // 'queue' | 'nowplaying' | 'lyrics' | null
let navStack      = [];      // in-app nav history of view descriptors
let navFwdStack    = [];     // forward history
let currentView   = { v: 'home' };
let navigating    = false;   // true while replaying history (suppresses push)

/* lyrics */
let lyricLines    = null;    // parsed [{ time, text }]
let activeLyric   = -1;
let lyricsFetchToken = 0;

audio.volume = volume;
audio.preload = 'metadata';

/* ══ DOM refs ═══════════════════════════════════ */
const $  = id => document.getElementById(id);
const qs  = (s, c) => (c || document).querySelector(s);
const qsa = (s, c) => [...(c || document).querySelectorAll(s)];

const npTitle     = $('npTitle');
const npArtist    = $('npArtist');
const npCoverImg  = $('npCoverImg');
const npLike      = $('npLike');
const playIcon    = $('playIcon');
const ctrlPlay    = $('ctrlPlay');
const ctrlPrev    = $('ctrlPrev');
const ctrlNext    = $('ctrlNext');
const ctrlShuffle = $('ctrlShuffle');
const ctrlRepeat  = $('ctrlRepeat');
const seekFill    = $('seekFill');
const seekThumb   = $('seekThumb');
const timeElapsed = $('timeElapsed');
const timeDuration= $('timeDuration');
const volFill     = $('volFill');
const volThumb    = $('volThumb');
const volIcon     = $('volIcon');
const albumGrid   = $('albumGrid');
const recentGrid  = $('recentGrid');
const madeGrid    = $('madeGrid');
const greetingGrid= $('greetingGrid');
const trackList   = $('trackList');
const libList     = $('libList');
const albumHeroImg= $('albumHeroImg');
const albumTitle  = $('albumTitle');
const albumArtist = $('albumArtist');
const albumYear   = $('albumYear');
const albumType   = $('albumType');
const albumTrackCount = $('albumTrackCount');
const contentArea = $('contentArea');
const topbar      = $('topbar');
const rightPanel  = $('rightPanel');
const ctxMenu     = $('ctxMenu');

/* ══ Utilities ══════════════════════════════════ */
function fmt(s) {
  if (isNaN(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
}

function esc(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function cleanSongName(filename, artist) {
  let n = filename.replace(/\.mp3$/i, '');
  n = n.replace(/\s*\(SPOTISAVER\)\s*/gi, '');
  n = n.replace(/^spotifydown\.com\s*-\s*/i, '');
  n = n.replace(/^\d+\.\s+/, '');
  if (artist) {
    const first = artist.split(/[\s,]/)[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    n = n.replace(new RegExp(`^${first}[^-]*\\s*-\\s*`, 'i'), '');
  }
  return n.trim();
}

function toast(msg, dur = 2400) {
  const c = $('toastContainer');
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  c.appendChild(el);
  setTimeout(() => {
    el.classList.add('out');
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }, dur);
}

const uid = () => Math.random().toString(36).slice(2, 9);
const trackSrc = t => `songs/${t.folder}/${encodeURIComponent(t.file)}`;
const getTrack = id => allTracks[id] || null;

/* ══ Views ══════════════════════════════════════ */
function showView(id, meta) {
  qsa('.view').forEach(v => v.classList.remove('active'));
  $(id)?.classList.add('active');
  if (meta) {
    if (!navigating && !sameView(meta, currentView)) {
      navStack.push(currentView);
      navFwdStack = [];
    }
    currentView = meta;
    syncNavButtons();
  }
  contentArea.scrollTo({ top: 0, behavior: 'auto' });
}
function sameView(a, b) { return a && b && a.v === b.v && a.id === b.id; }
function syncNavButtons() {
  $('navBack').disabled = !navStack.length;
  $('navFwd').disabled  = !navFwdStack.length;
}

/* ══ Load data ══════════════════════════════════ */
const FALLBACK_ALBUMS = [
  { folder: 'billie', title: 'HIT ME HARD AND SOFT', artist: 'Billie Eilish', year: 2024,
    blurb: "Billie Eilish's third album, written and produced with her brother FINNEAS as one continuous listen.",
    songs: ['1. SKINNY.mp3', '2. LUNCH.mp3', '3. CHIHIRO.mp3', '4. BIRDS OF A FEATHER.mp3', '5. WILDFLOWER.mp3', '6. THE GREATEST.mp3', '7. L’AMOUR DE MA VIE.mp3', '8. THE DINER.mp3', '9. BITTERSUITE.mp3', '10. BLUE.mp3'] },
  { folder: 'drake', title: 'Certified Lover Boy', artist: 'Drake', year: 2021,
    blurb: "Drake's sixth studio album, a chart-dominating run of features that opened at number one.",
    songs: ['Drake - Champagne Poetry (SPOTISAVER).mp3', 'Drake - TSU (SPOTISAVER).mp3', 'Drake - Papi’s Home (SPOTISAVER).mp3', 'Drake, Lil Baby - Girls Want Girls (with Lil Baby) (SPOTISAVER).mp3', 'Drake, Lil Durk, GIVĒON - In The Bible (with Lil Durk & Giveon) (SPOTISAVER).mp3', 'Drake, Future, Young Thug - Way 2 Sexy (with Future & Young Thug) (SPOTISAVER).mp3', 'Drake - Race My Mind (SPOTISAVER).mp3', 'Drake, Tems - Fountains (with Tems) (SPOTISAVER).mp3', 'Drake, JAŸ-Z - Love All (with JAY-Z) (SPOTISAVER).mp3', 'Drake, Kid Cudi - IMY2 (with Kid Cudi) (SPOTISAVER).mp3', 'Drake, Travis Scott - Fair Trade (with Travis Scott) (SPOTISAVER).mp3', 'Drake, Ty Dolla $ign - Get Along Better (SPOTISAVER).mp3', 'Drake - Pipe Down (SPOTISAVER).mp3', 'Drake - The Remorse (SPOTISAVER).mp3', 'Drake - No Friends In The Industry (SPOTISAVER).mp3', 'Drake - 7am On Bridle Path (SPOTISAVER).mp3', 'Drake, Future - N 2 Deep (SPOTISAVER).mp3', 'Drake, Yebba - Yebba’s Heartbreak (SPOTISAVER).mp3', 'Drake, Lil Wayne, Rick Ross - You Only Live Twice (with Lil Wayne & Rick Ross) (SPOTISAVER).mp3', 'Drake - F g Fans (SPOTISAVER).mp3'] },
  { folder: 'dua', title: 'Radical Optimism', artist: 'Dua Lipa', year: 2024,
    blurb: "Dua Lipa's third album, pulling Britpop and psychedelia into her dance-pop.",
    songs: ['1. End Of An Era.mp3', '2. Houdini.mp3', '3. Training Season.mp3', '4. These Walls.mp3', '5. Whatcha Doing.mp3', '6. French Exit.mp3', '7. Illusion.mp3', '8. Falling Forever.mp3', '9. Anything For Love.mp3', '10. Maria.mp3', '11. Happy For You.mp3'] },
  { folder: 'eminem', title: 'The Death of Slim Shady', artist: 'Eminem', year: 2024,
    blurb: "Eminem's twelfth album, a concept record confronting and killing off his Slim Shady alter ego.",
    songs: ['1. Renaissance.mp3', '2. Habits.mp3', '3. Trouble.mp3', '4. Brand New Dance.mp3', '5. Evil.mp3', '6. All You Got - skit.mp3', '7. Lucifer.mp3', '8. Antichrist.mp3', '9. Fuel.mp3', '10. Road Rage.mp3', '11. Houdini.mp3', '12. Breaking News - skit.mp3', '13. Guilty Conscience 2.mp3', '14. Head Honcho.mp3', '15. Temporary.mp3', '16. Bad One.mp3', '17. Tobey (feat. Big Sean and BabyTron).mp3', '18. Guess Who’s Back - skit.mp3', '19. Somebody Save Me.mp3'] },
  { folder: 'kenny', title: 'To Pimp a Butterfly', artist: 'Kendrick Lamar', year: 2015,
    blurb: "Kendrick Lamar's third album, a dense fusion of jazz, funk and spoken word.",
    songs: ['1. Wesley\'s Theory.mp3', '2. For Free_ - Interlude.mp3', '3. King Kunta.mp3', '4. Institutionalized.mp3', '5. These Walls.mp3', '6. u.mp3', '7. Alright.mp3', '8. For Sale_ - Interlude.mp3', '9. Momma.mp3', '10. Hood Politics.mp3', '11. How Much A Dollar Cost.mp3', '12. Complexion (A Zulu Love).mp3', '13. The Blacker The Berry.mp3', '14. You Ain\'t Gotta Lie (Momma Said).mp3', '15. i.mp3', '16. Mortal Man.mp3'] },
  { folder: 'taylor', title: 'Midnights', artist: 'Taylor Swift', year: 2022,
    blurb: "Taylor Swift's tenth album, a synth-pop set built around thirteen sleepless nights.",
    songs: ['1. Lavender Haze.mp3', '2. Maroon.mp3', '3. Anti-Hero.mp3', '4. Snow On The Beach (feat. Lana Del Rey).mp3', '5. You\'re On Your Own, Kid.mp3', '6. Midnight Rain.mp3', '7. Question..._.mp3', '8. Vigilante Shit.mp3', '9. Bejeweled.mp3', '10. Labyrinth.mp3', '11. Karma.mp3', '12. Sweet Nothing.mp3', '13. Mastermind.mp3'] },
  { folder: 'weeknd', title: 'After Hours', artist: 'The Weeknd', year: 2020,
    blurb: "The Weeknd's fourth album, a synthwave and dream-pop record carried by Blinding Lights.",
    songs: ['1. Alone Again.mp3', '2. Too Late.mp3', '3. Hardest To Love.mp3', '4. Scared To Live.mp3', '5. Snowchild.mp3', '6. Escape From LA.mp3', '7. Heartless.mp3', '8. Faith.mp3', '9. Blinding Lights.mp3', '10. In Your Eyes.mp3', '11. Save Your Tears.mp3', '12. Repeat After Me (Interlude).mp3', '13. After Hours.mp3', '14. Until I Bleed Out.mp3'] },
];

async function fetchSongs(folder) {
  try {
    const res  = await fetch(`songs/${folder}/`);
    const text = await res.text();
    const div  = document.createElement('div');
    div.innerHTML = text;
    return [...div.querySelectorAll('a')]
      .map(a => decodeURIComponent(a.href.split('/').pop()))
      .filter(n => n.endsWith('.mp3'))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  } catch {
    return [];
  }
}

function registerAlbum(meta, songs) {
  const trackIds = [];
  songs.forEach(file => {
    const id = meta.folder + '::' + file;
    allTracks[id] = {
      id, file, folder: meta.folder,
      title:      cleanSongName(file, meta.artist),
      artist:     meta.artist,
      albumTitle: meta.title,
      cover:      meta.cover,
      year:       meta.year,
    };
    trackIds.push(id);
  });
  albums.push({
    folder: meta.folder, title: meta.title, artist: meta.artist,
    year: meta.year, blurb: meta.blurb || '', cover: meta.cover, trackIds,
  });
}

async function loadAlbums() {
  let folders = [];
  try {
    const res  = await fetch('songs/');
    const text = await res.text();
    const div  = document.createElement('div');
    div.innerHTML = text;
    const base = new URL('songs/', location.href).pathname; // .../Spotify Clone/songs/
    folders = [...div.querySelectorAll('a')]
      .map(a => {
        const p = new URL(a.getAttribute('href'), res.url).pathname;
        if (!p.startsWith(base)) return null;              // skip parent / breadcrumb links
        const rest = p.slice(base.length).replace(/\/$/, '');
        return rest && !rest.includes('/') && !rest.includes('.') ? decodeURIComponent(rest) : null;
      })
      .filter(Boolean);
    folders = [...new Set(folders)];
  } catch { folders = []; }

  let loadedAny = false;

  if (folders.length) {
    for (const folder of folders) {
      try {
        const info  = await (await fetch(`songs/${folder}/info.json`)).json();
        let songs   = await fetchSongs(folder);
        if (!songs.length) continue;
        // directory listings are alphabetical ("10." before "2."); if we ship a
        // known track order for this folder and the file set matches, use it
        const known = FALLBACK_ALBUMS.find(a => a.folder === folder);
        if (known && known.songs.length === songs.length &&
            known.songs.every(s => songs.includes(s))) {
          songs = known.songs.slice();
        }
        let cover = `songs/${folder}/cover.jpg`;
        try {
          const cr = await fetch(cover, { method: 'HEAD' });
          if (!cr.ok) cover = `songs/${folder}/cover.svg`;
        } catch { cover = `songs/${folder}/cover.svg`; }
        registerAlbum({
          folder,
          title:  info.title  || folder,
          artist: info.artist || 'Unknown Artist',
          year:   info.year   || new Date().getFullYear(),
          blurb:  info.blurb  || '',
          cover,
        }, songs);
        loadedAny = true;
      } catch { /* skip */ }
    }
  }

  if (!loadedAny) {
    FALLBACK_ALBUMS.forEach(a => registerAlbum({
      folder: a.folder, title: a.title, artist: a.artist, year: a.year,
      blurb: a.blurb, cover: `songs/${a.folder}/cover.jpg`,
    }, a.songs));
  }

  loadStored();
  renderAll();
  restorePlayback();
}

/* ══ Persistence ════════════════════════════════ */
function loadStored() {
  try { playlists = JSON.parse(localStorage.getItem('sp_playlists')) || []; } catch { playlists = []; }
  try { recent    = JSON.parse(localStorage.getItem('sp_recent'))    || []; } catch { recent = []; }

  // liked: v2 stores ids; migrate legacy filename list once
  try {
    const v2 = JSON.parse(localStorage.getItem('sp_liked2'));
    if (Array.isArray(v2)) {
      likedIds = v2.filter(id => allTracks[id]);
    } else {
      const legacy = JSON.parse(localStorage.getItem('sp_liked')) || [];
      likedIds = [];
      legacy.forEach(name => {
        const hit = Object.values(allTracks).find(t => t.file === name);
        if (hit) likedIds.push(hit.id);
      });
      saveLiked();
    }
  } catch { likedIds = []; }

  // prune playlists against known tracks
  playlists.forEach(p => { p.trackIds = (p.trackIds || []).filter(id => allTracks[id]); });
  recent = recent.filter(r =>
    (r.type === 'album'    && albums.some(a => a.folder === r.id)) ||
    (r.type === 'playlist' && playlists.some(p => p.id === r.id)) ||
    (r.type === 'liked'));
}

const savePlaylists = () => { try { localStorage.setItem('sp_playlists', JSON.stringify(playlists)); } catch {} };
const saveLiked     = () => { try { localStorage.setItem('sp_liked2', JSON.stringify(likedIds)); } catch {} };
const saveRecent    = () => { try { localStorage.setItem('sp_recent', JSON.stringify(recent.slice(0, 10))); } catch {} };

function savePlayback() {
  try {
    localStorage.setItem('sp_playback', JSON.stringify({
      currentId, position: audio.currentTime || 0,
      ctx: ctx ? { type: ctx.type, id: ctx.id, name: ctx.name, trackIds: ctx.trackIds } : null,
      ctxPos, queue, shuffle, repeat, volume, muted,
    }));
  } catch {}
}

function restorePlayback() {
  let s;
  try { s = JSON.parse(localStorage.getItem('sp_playback')); } catch { s = null; }
  if (!s) return;

  shuffle = !!s.shuffle;
  repeat  = ['off', 'context', 'one'].includes(s.repeat) ? s.repeat : 'off';
  volume  = typeof s.volume === 'number' ? s.volume : 0.7;
  muted   = !!s.muted;
  prevVolume = volume || 0.7;
  ctrlShuffle.classList.toggle('active', shuffle);
  syncRepeatUI();
  setVolume(muted ? 0 : volume);

  queue = Array.isArray(s.queue) ? s.queue.filter(id => allTracks[id]) : [];

  if (s.ctx && Array.isArray(s.ctx.trackIds)) {
    ctx = { ...s.ctx, trackIds: s.ctx.trackIds.filter(id => allTracks[id]) };
    buildCtxOrder();
    if (typeof s.ctxPos === 'number' && s.ctxPos >= 0 && s.ctxPos < ctxOrder.length) ctxPos = s.ctxPos;
  }

  if (s.currentId && allTracks[s.currentId]) {
    loadTrack(s.currentId, false, s.position || 0);
    toast('Resumed where you left off');
  }
  renderRightPanel();
}

/* ══ Render ═════════════════════════════════════ */
function renderAll() {
  renderGreeting();
  renderHomeGrids();
  renderRecent();
  renderLibrary();
  renderBrowse();
}

function greetingText() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

function renderGreeting() {
  if (!greetingGrid) return;
  const gs = qs('.greeting-section');
  let h1 = gs.querySelector('.greeting-title');
  if (!h1) {
    h1 = document.createElement('h1');
    h1.className = 'greeting-title section-title';
    h1.style.cssText = 'margin-bottom:20px;font-size:1.8rem;';
    gs.insertBefore(h1, greetingGrid);
  }
  h1.textContent = greetingText();

  // quick-access: liked songs + recent contexts + first albums, deduped, up to 8
  const picks = [];
  if (likedIds.length) picks.push({ type: 'liked' });
  recent.forEach(r => { if (!picks.some(p => p.type === r.type && p.id === r.id)) picks.push(r); });
  albums.forEach(a => { if (picks.length < 8 && !picks.some(p => p.type === 'album' && p.id === a.folder)) picks.push({ type: 'album', id: a.folder }); });

  greetingGrid.innerHTML = '';
  picks.slice(0, 8).forEach(p => {
    const c = ctxForPick(p);
    if (!c) return;
    const card = document.createElement('div');
    card.className = 'greeting-card';
    card.innerHTML = `
      <div class="greeting-card-img">${c.coverHtml}</div>
      <span>${esc(c.name)}</span>
      <button class="greeting-play-btn" title="Play ${esc(c.name)}"><i class="fa-solid fa-play"></i></button>`;
    card.addEventListener('click', () => openPick(p));
    card.querySelector('.greeting-play-btn').addEventListener('click', e => {
      e.stopPropagation();
      playContext(c.ctx, 0, true);
    });
    greetingGrid.appendChild(card);
  });
}

function ctxForPick(p) {
  if (p.type === 'liked') {
    if (!likedIds.length) return null;
    return {
      name: 'Liked Songs',
      coverHtml: `<div class="liked-mini"><i class="fa-solid fa-heart"></i></div>`,
      ctx: { type: 'liked', id: 'liked', name: 'Liked Songs', trackIds: likedIds.slice() },
    };
  }
  if (p.type === 'album') {
    const a = albums.find(x => x.folder === p.id);
    if (!a) return null;
    return {
      name: a.title,
      coverHtml: `<img src="${esc(a.cover)}" alt="" onerror="this.parentElement.textContent='🎵'">`,
      ctx: { type: 'album', id: a.folder, name: a.title, trackIds: a.trackIds.slice() },
    };
  }
  if (p.type === 'playlist') {
    const pl = playlists.find(x => x.id === p.id);
    if (!pl) return null;
    const c = playlistCover(pl);
    return {
      name: pl.name,
      coverHtml: c ? `<img src="${esc(c)}" alt="">` : `<div class="liked-mini pl"><i class="fa-solid fa-music"></i></div>`,
      ctx: { type: 'playlist', id: pl.id, name: pl.name, trackIds: pl.trackIds.slice() },
    };
  }
  return null;
}

function openPick(p) {
  if (p.type === 'liked')    return openLiked();
  if (p.type === 'album')    { const a = albums.find(x => x.folder === p.id); if (a) openAlbum(a); return; }
  if (p.type === 'playlist') { const pl = playlists.find(x => x.id === p.id); if (pl) openPlaylist(pl); return; }
}

function buildCard(opts) {
  const div = document.createElement('div');
  div.className = 'music-card';
  const icon = opts.icon || 'fa-music';
  const art = opts.cover
    ? `<img class="mc-img" src="${esc(opts.cover)}" alt="${esc(opts.title)}" />`
    : `<div class="mc-img-placeholder${opts.placeholderClass ? ' ' + opts.placeholderClass : ''}"><i class="fa-solid ${icon}"></i></div>`;
  div.innerHTML = `
    <div class="mc-img-wrap">
      ${art}
      <button class="mc-play-btn" title="Play ${esc(opts.title)}"><i class="fa-solid fa-play"></i></button>
    </div>
    <div class="mc-title">${esc(opts.title)}</div>
    <div class="mc-sub">${esc(opts.sub || '')}</div>`;
  const img = div.querySelector('.mc-img');
  if (img) img.addEventListener('error', () => {
    img.replaceWith(Object.assign(document.createElement('div'), {
      className: 'mc-img-placeholder' + (opts.placeholderClass ? ' ' + opts.placeholderClass : ''),
      innerHTML: `<i class="fa-solid ${icon}"></i>`,
    }));
  });
  div.addEventListener('click', opts.onClick);
  div.querySelector('.mc-play-btn').addEventListener('click', e => { e.stopPropagation(); opts.onPlay(); });
  if (opts.onCtx) div.addEventListener('contextmenu', opts.onCtx);
  return div;
}

function albumCard(a) {
  return buildCard({
    cover: a.cover, title: a.title, sub: `${a.year} • ${a.artist}`,
    onClick: () => openAlbum(a),
    onPlay:  () => playContext({ type: 'album', id: a.folder, name: a.title, trackIds: a.trackIds.slice() }, 0, true),
    onCtx:   e => { e.preventDefault(); openCtxMenu(e, albumMenu(a)); },
  });
}

function renderHomeGrids() {
  [albumGrid, madeGrid].forEach(g => g && (g.innerHTML = ''));
  albums.forEach(a => albumGrid.appendChild(albumCard(a)));
  // "Made for you" = playlists first, then a shuffled sample of albums
  const made = [];
  playlists.forEach(pl => made.push(playlistCardEl(pl)));
  albums.slice().reverse().forEach(a => made.push(albumCard(a)));
  made.forEach(el => madeGrid.appendChild(el));
}

function playlistCover(pl) {
  const first = pl.trackIds.map(getTrack).find(Boolean);
  return first ? first.cover : '';
}

function playlistCardEl(pl) {
  return buildCard({
    cover: playlistCover(pl), icon: 'fa-music',
    title: pl.name, sub: `Playlist • ${pl.trackIds.length} song${pl.trackIds.length !== 1 ? 's' : ''}`,
    onClick: () => openPlaylist(pl),
    onPlay:  () => { if (!pl.trackIds.length) return toast('This playlist is empty'); playContext({ type: 'playlist', id: pl.id, name: pl.name, trackIds: pl.trackIds.slice() }, 0, true); },
    onCtx:   e => { e.preventDefault(); openCtxMenu(e, playlistMenu(pl)); },
  });
}

function renderRecent() {
  const section = $('recentSection');
  recentGrid.innerHTML = '';
  const items = recent.map(r => {
    if (r.type === 'album')    { const a = albums.find(x => x.folder === r.id); return a ? albumCard(a) : null; }
    if (r.type === 'playlist') { const pl = playlists.find(x => x.id === r.id); return pl ? playlistCardEl(pl) : null; }
    if (r.type === 'liked' && likedIds.length) {
      return buildCard({
        cover: '', icon: 'fa-heart', placeholderClass: 'liked',
        title: 'Liked Songs', sub: `Playlist • ${likedIds.length} songs`,
        onClick: openLiked,
        onPlay:  () => playContext({ type: 'liked', id: 'liked', name: 'Liked Songs', trackIds: likedIds.slice() }, 0, true),
      });
    }
    return null;
  }).filter(Boolean).slice(0, 6);

  if (!items.length) { section.hidden = true; return; }
  section.hidden = false;
  items.forEach(el => recentGrid.appendChild(el));
}

function pushRecent(type, id) {
  recent = recent.filter(r => !(r.type === type && r.id === id));
  recent.unshift({ type, id });
  recent = recent.slice(0, 10);
  saveRecent();
  renderRecent();
  renderGreeting();
}

/* ── Library sidebar ──────────────────────────── */
let libFilter = 'all';

function renderLibrary() {
  if (!libList) return;
  libList.innerHTML = '';
  const nowCtxKey = ctx ? ctx.type + ':' + ctx.id : '';

  const add = (el) => libList.appendChild(el);

  if (libFilter === 'all' || libFilter === 'playlists') {
    const liked = document.createElement('div');
    liked.className = 'lib-item' + (nowCtxKey === 'liked:liked' ? ' active' : '');
    liked.innerHTML = `
      <div class="lib-item-cover liked-mini"><i class="fa-solid fa-heart"></i></div>
      <div class="lib-item-info">
        <div class="lib-item-name">Liked Songs</div>
        <div class="lib-item-sub">Playlist • ${likedIds.length} song${likedIds.length !== 1 ? 's' : ''}</div>
      </div>`;
    liked.addEventListener('click', openLiked);
    add(liked);

    playlists.forEach(pl => {
      const cover = playlistCover(pl);
      const item = document.createElement('div');
      item.className = 'lib-item' + (nowCtxKey === 'playlist:' + pl.id ? ' active' : '');
      item.innerHTML = `
        <div class="lib-item-cover">${cover ? `<img src="${esc(cover)}" alt="">` : '<i class="fa-solid fa-music"></i>'}</div>
        <div class="lib-item-info">
          <div class="lib-item-name">${esc(pl.name)}</div>
          <div class="lib-item-sub">Playlist • ${pl.trackIds.length} song${pl.trackIds.length !== 1 ? 's' : ''}</div>
        </div>`;
      item.addEventListener('click', () => openPlaylist(pl));
      item.addEventListener('contextmenu', e => { e.preventDefault(); openCtxMenu(e, playlistMenu(pl)); });
      add(item);
    });
  }

  if (libFilter === 'all' || libFilter === 'albums' || libFilter === 'artists') {
    const seen = new Set();
    albums.forEach(a => {
      if (libFilter === 'artists') { if (seen.has(a.artist)) return; seen.add(a.artist); }
      const item = document.createElement('div');
      item.className = 'lib-item' + (nowCtxKey === 'album:' + a.folder ? ' active' : '');
      item.dataset.folder = a.folder;
      item.innerHTML = `
        <div class="lib-item-cover">
          <img src="${esc(a.cover)}" alt="${esc(a.title)}"
               onerror="this.parentElement.innerHTML='<i class=&quot;fa-solid fa-music&quot;></i>'" />
        </div>
        <div class="lib-item-info">
          <div class="lib-item-name">${esc(libFilter === 'artists' ? a.artist : a.title)}</div>
          <div class="lib-item-sub">${libFilter === 'artists' ? 'Artist' : 'Album • ' + esc(a.artist)}</div>
        </div>`;
      item.addEventListener('click', () => openAlbum(a));
      item.addEventListener('contextmenu', e => { e.preventDefault(); openCtxMenu(e, albumMenu(a)); });
      add(item);
    });
  }

  if (!libList.children.length) {
    libList.innerHTML = `<div class="lib-empty">Nothing here yet</div>`;
  }
}

qsa('.filter-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    qsa('.filter-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    libFilter = chip.dataset.filter;
    renderLibrary();
  });
});

/* ══ Album / playlist / liked views ═════════════ */
function openAlbum(a) {
  const c = { type: 'album', id: a.folder, name: a.title, trackIds: a.trackIds.slice() };
  renderCollection({
    kind: 'Album', title: a.title, cover: a.cover, artist: a.artist, year: a.year,
    blurb: a.blurb, trackIds: a.trackIds, ctx: c,
    isLiked: () => false,
    menu: () => albumMenu(a),
  });
  pushRecent('album', a.folder);
  showView('viewAlbum', { v: 'album', id: a.folder });
  setLibActive('album:' + a.folder);
}

function openPlaylist(pl) {
  const c = { type: 'playlist', id: pl.id, name: pl.name, trackIds: pl.trackIds.slice() };
  renderCollection({
    kind: 'Playlist', title: pl.name, cover: playlistCover(pl), artist: 'You',
    year: '', blurb: '', trackIds: pl.trackIds, ctx: c, playlist: pl,
    menu: () => playlistMenu(pl),
  });
  pushRecent('playlist', pl.id);
  showView('viewAlbum', { v: 'playlist', id: pl.id });
  setLibActive('playlist:' + pl.id);
}

function openLiked() {
  if (!likedIds.length) { toast('Songs you like will appear here'); return; }
  const c = { type: 'liked', id: 'liked', name: 'Liked Songs', trackIds: likedIds.slice() };
  renderCollection({
    kind: 'Playlist', title: 'Liked Songs', cover: '', artist: 'You', year: '',
    blurb: '', trackIds: likedIds, ctx: c, liked: true,
    menu: () => [{ label: 'Play', icon: 'fa-play', fn: () => playContext(c, 0, true) }],
  });
  pushRecent('liked', 'liked');
  showView('viewAlbum', { v: 'liked' });
  setLibActive('liked:liked');
}

function setLibActive(key) {
  qsa('.lib-item').forEach(i => i.classList.remove('active'));
  renderLibrary();
}

let currentCollection = null;

function renderCollection(coll) {
  currentCollection = coll;
  albumType.textContent = coll.kind;

  const hero = qs('#viewAlbum .album-hero');
  hero.style.background = coll.liked
    ? 'linear-gradient(180deg,#3d2f6b 0%,var(--bg) 100%)'
    : 'linear-gradient(180deg,#2a3d4d 0%,var(--bg) 100%)';

  if (coll.liked) {
    albumHeroImg.innerHTML = `<div class="hero-liked"><i class="fa-solid fa-heart"></i></div>`;
  } else if (coll.cover) {
    albumHeroImg.innerHTML = `<img src="${esc(coll.cover)}" alt="${esc(coll.title)}"
      onerror="this.parentElement.innerHTML='<div class=hero-liked><i class=&quot;fa-solid fa-music&quot;></i></div>'" />`;
  } else {
    albumHeroImg.innerHTML = `<div class="hero-liked"><i class="fa-solid fa-music"></i></div>`;
  }

  albumTitle.textContent  = coll.title;
  albumArtist.textContent = coll.artist;
  albumYear.textContent   = coll.year || '';
  qsa('#viewAlbum .album-meta .dot').forEach((d, i) => { d.style.display = (i === 0 && !coll.year) ? 'none' : ''; });
  albumTrackCount.textContent = `${coll.trackIds.length} song${coll.trackIds.length !== 1 ? 's' : ''}`;

  const lb = $('albumLikeBtn');
  if (coll.kind === 'Album') {
    lb.style.display = '';
    const savedPl = playlists.find(p => p.name === coll.title);
    lb.classList.toggle('liked', !!savedPl);
    lb.querySelector('i').className = savedPl ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
    lb.onclick = () => {
      const existing = playlists.find(p => p.name === coll.title);
      if (existing) { toast(coll.title + ' is already in Your Library'); return; }
      playlists.push({ id: uid(), name: coll.title, trackIds: coll.trackIds.slice(), created: Date.now() });
      savePlaylists(); renderLibrary(); renderHomeGrids();
      lb.classList.add('liked'); lb.querySelector('i').className = 'fa-solid fa-heart';
      toast('Saved to Your Library');
    };
  } else {
    lb.style.display = 'none';
  }

  $('albumMoreBtn').onclick = e => openCtxMenu(e, coll.menu());
  $('albumPlayBtn').onclick = () => { if (coll.trackIds.length) playContext(coll.ctx, 0, true); };

  renderTrackRows(coll);
}

function renderTrackRows(coll) {
  trackList.innerHTML = '';
  const showAlbumCol = coll.kind !== 'Album';

  coll.trackIds.forEach((id, i) => {
    const t = getTrack(id);
    if (!t) return;
    const isCur = currentId === id;
    const liked = likedIds.includes(id);

    const row = document.createElement('div');
    row.className = 'track-row' + (isCur ? ' playing' : '');
    row.dataset.id = id;
    row.innerHTML = `
      <div class="track-num-wrap">
        <span class="track-num">${i + 1}</span>
        <span class="eq"><i></i><i></i><i></i><i></i></span>
        <span class="track-play-hover"><i class="fa-solid fa-play"></i></span>
      </div>
      <div class="track-title-wrap">
        <div class="track-cover">
          <img src="${esc(t.cover)}" alt=""
               onerror="this.parentElement.style.background='var(--bg3)';this.remove()" />
        </div>
        <div style="min-width:0">
          <div class="track-title">${esc(t.title)}</div>
          <div class="track-artist">${esc(t.artist)}</div>
        </div>
      </div>
      <div class="track-album">${esc(showAlbumCol ? t.albumTitle : t.albumTitle)}</div>
      <div class="track-duration">
        <button class="track-like ${liked ? 'liked' : ''}" title="${liked ? 'Remove from' : 'Save to'} Liked Songs">
          <i class="${liked ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
        </button>
        <span class="track-dur-text">-</span>
      </div>`;

    row.addEventListener('click', () => {
      if (currentId === id) togglePlayPause();
      else playContext(coll.ctx, coll.trackIds.indexOf(id), true);
    });
    row.querySelector('.track-like').addEventListener('click', e => { e.stopPropagation(); toggleLike(id); });
    row.addEventListener('contextmenu', e => { e.preventDefault(); openCtxMenu(e, trackMenu(id, coll)); });

    trackList.appendChild(row);
  });

  updateEqRows();

  // lazy durations
  coll.trackIds.forEach((id, i) => {
    const t = getTrack(id);
    if (!t) return;
    if (t.duration) {
      const cell = trackList.children[i]?.querySelector('.track-dur-text');
      if (cell) cell.textContent = fmt(t.duration);
      return;
    }
    const tmp = new Audio(trackSrc(t));
    tmp.addEventListener('loadedmetadata', () => {
      t.duration = tmp.duration;
      const cell = trackList.children[i]?.querySelector('.track-dur-text');
      if (cell) cell.textContent = fmt(tmp.duration);
    });
    tmp.addEventListener('error', () => {
      const cell = trackList.children[i]?.querySelector('.track-dur-text');
      if (cell) cell.textContent = '--';
    });
  });
}

/* ══ Liked toggle ═══════════════════════════════ */
function toggleLike(id) {
  const i = likedIds.indexOf(id);
  if (i === -1) { likedIds.push(id); toast('Added to Liked Songs'); }
  else          { likedIds.splice(i, 1); toast('Removed from Liked Songs'); }
  saveLiked();
  syncLikeUI();
  renderLibrary();
  renderRecent();
  renderGreeting();
  if (currentCollection && currentCollection.liked) {
    currentCollection.trackIds = likedIds.slice();
    currentCollection.ctx.trackIds = likedIds.slice();
    renderTrackRows(currentCollection);
  }
}

function syncLikeUI() {
  // now-playing bar
  const liked = currentId && likedIds.includes(currentId);
  npLike.classList.toggle('liked', !!liked);
  npLike.querySelector('i').className = liked ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
  // visible track rows
  qsa('.track-row').forEach(row => {
    const l = likedIds.includes(row.dataset.id);
    const btn = row.querySelector('.track-like');
    if (btn) {
      btn.classList.toggle('liked', l);
      btn.querySelector('i').className = (l ? 'fa-solid' : 'fa-regular') + ' fa-heart';
    }
  });
  if (rpMode === 'nowplaying') renderRightPanel();
}

/* ══ Playback core ══════════════════════════════ */
function buildCtxOrder() {
  if (!ctx) { ctxOrder = []; return; }
  ctxOrder = ctx.trackIds.map((_, i) => i);
  if (shuffle) {
    for (let i = ctxOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ctxOrder[i], ctxOrder[j]] = [ctxOrder[j], ctxOrder[i]];
    }
  }
}

function playContext(newCtx, startIndex, autoplay) {
  if (!newCtx || !newCtx.trackIds.length) return;
  ctx = { ...newCtx, trackIds: newCtx.trackIds.slice() };
  buildCtxOrder();
  if (shuffle) {
    // make the chosen track first in the shuffled order
    const at = ctxOrder.indexOf(startIndex);
    if (at > 0) { ctxOrder.splice(at, 1); ctxOrder.unshift(startIndex); }
    ctxPos = 0;
  } else {
    ctxPos = Math.max(0, Math.min(startIndex, ctxOrder.length - 1));
  }
  queue = [];
  playHistory = [];
  loadTrack(ctx.trackIds[ctxOrder[ctxPos]], autoplay !== false);
  renderLibrary();
  renderRightPanel();
}

function loadTrack(id, autoplay, seekTo) {
  const t = getTrack(id);
  if (!t) return;
  if (currentId && currentId !== id) playHistory.push(currentId);
  currentId = id;

  audio.src = trackSrc(t);
  audio.volume = muted ? 0 : volume;
  if (seekTo) audio.currentTime = seekTo;

  npTitle.textContent  = t.title;
  npArtist.textContent = t.artist;
  npCoverImg.src = t.cover;
  npCoverImg.style.display = '';
  const ph = $('npCoverPlaceholder');
  if (ph) ph.style.display = 'none';
  document.title = `${t.title} • ${t.artist} | Spotify`;

  syncLikeUI();
  updateTrackHighlight();
  setMediaSession(t);
  resetLyrics();
  if (rpMode === 'lyrics' || rpMode === 'nowplaying') loadLyrics(t);
  renderRightPanel();

  if (autoplay) {
    audio.play().catch(() => {
      audio.src = `songs/${t.folder}/${t.file}`;
      audio.play().catch(e => toast('Playback error: ' + e.message));
    });
  }
  savePlayback();
}

function nextTrack(auto) {
  if (queue.length) {
    const id = queue.shift();
    loadTrack(id, true);
    renderRightPanel();
    return;
  }
  if (!ctx || !ctxOrder.length) return;
  if (repeat === 'one' && auto) { audio.currentTime = 0; audio.play(); return; }

  if (ctxPos < ctxOrder.length - 1) {
    ctxPos++;
  } else if (repeat === 'context' || repeat === 'all') {
    if (shuffle) buildCtxOrder();
    ctxPos = 0;
  } else {
    if (auto) { audio.pause(); audio.currentTime = 0; playIcon.className = 'fa-solid fa-play'; }
    return;
  }
  loadTrack(ctx.trackIds[ctxOrder[ctxPos]], true);
  renderRightPanel();
}

function prevTrack() {
  if (audio.currentTime > 3 || !playHistory.length) { audio.currentTime = 0; return; }
  const id = playHistory.pop();
  currentId = null; // avoid re-pushing
  // adjust ctxPos if the previous track is in the context order
  if (ctx) {
    const ti = ctx.trackIds.indexOf(id);
    const oi = ctxOrder.indexOf(ti);
    if (oi !== -1) ctxPos = oi;
  }
  loadTrack(id, true);
  renderRightPanel();
}

function togglePlayPause() {
  if (!currentId) {
    if (ctx && ctx.trackIds.length) loadTrack(ctx.trackIds[ctxOrder[ctxPos] ?? 0], true);
    else if (albums[0]) playContext({ type: 'album', id: albums[0].folder, name: albums[0].title, trackIds: albums[0].trackIds.slice() }, 0, true);
    return;
  }
  if (audio.paused) audio.play(); else audio.pause();
}

function updateTrackHighlight() {
  qsa('.track-row').forEach(row => {
    const isCur = row.dataset.id === currentId;
    row.classList.toggle('playing', isCur);
  });
  updateEqRows();
}

function updateEqRows() {
  const playing = currentId && !audio.paused;
  qsa('.track-row').forEach(row => {
    row.classList.toggle('is-playing-anim', row.dataset.id === currentId && playing);
  });
}

/* ══ Audio events ═══════════════════════════════ */
audio.addEventListener('play', () => {
  playIcon.className = 'fa-solid fa-pause';
  ctrlPlay.title = 'Pause';
  updateEqRows();
  if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
});
audio.addEventListener('pause', () => {
  playIcon.className = 'fa-solid fa-play';
  ctrlPlay.title = 'Play';
  updateEqRows();
  if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
  savePlayback();
});
audio.addEventListener('ended', () => nextTrack(true));

let saveTick = 0;
audio.addEventListener('timeupdate', () => {
  if (audio.duration && !seekDragging) {
    const pct = (audio.currentTime / audio.duration) * 100;
    seekFill.style.width = pct + '%';
    seekThumb.style.left = pct + '%';
    timeElapsed.textContent  = fmt(audio.currentTime);
    timeDuration.textContent = fmt(audio.duration);
  }
  updateLyricHighlight();
  if (Date.now() - saveTick > 4000) { saveTick = Date.now(); savePlayback(); }
});
audio.addEventListener('loadedmetadata', () => {
  timeDuration.textContent = fmt(audio.duration);
  if (currentId && getTrack(currentId)) getTrack(currentId).duration = audio.duration;
});

/* ══ Controls ═══════════════════════════════════ */
ctrlPlay.addEventListener('click', togglePlayPause);
ctrlPrev.addEventListener('click', prevTrack);
ctrlNext.addEventListener('click', () => nextTrack(false));

ctrlShuffle.addEventListener('click', () => {
  shuffle = !shuffle;
  ctrlShuffle.classList.toggle('active', shuffle);
  if (ctx) {
    const curTi = ctxOrder[ctxPos];
    buildCtxOrder();
    if (shuffle && curTi != null) {
      const at = ctxOrder.indexOf(curTi);
      if (at > 0) { ctxOrder.splice(at, 1); ctxOrder.unshift(curTi); }
      ctxPos = 0;
    } else if (curTi != null) {
      ctxPos = ctxOrder.indexOf(curTi);
    }
  }
  toast(shuffle ? 'Shuffle on' : 'Shuffle off');
  renderRightPanel();
  savePlayback();
});

ctrlRepeat.addEventListener('click', () => {
  repeat = repeat === 'off' ? 'context' : repeat === 'context' ? 'one' : 'off';
  syncRepeatUI();
  toast(repeat === 'off' ? 'Repeat off' : repeat === 'context' ? 'Repeat all' : 'Repeat one');
  savePlayback();
});

function syncRepeatUI() {
  ctrlRepeat.classList.toggle('active', repeat !== 'off');
  ctrlRepeat.querySelector('i').className = repeat === 'one' ? 'fa-solid fa-repeat-1' : 'fa-solid fa-repeat';
}

/* ── Seek + volume (pointer events -> touch friendly) ── */
const seekBarWrap = $('seekBarWrap');
const volBarWrap  = $('volBarWrap');

function relPct(el, clientX) {
  const r = el.getBoundingClientRect();
  return Math.max(0, Math.min(1, (clientX - r.left) / r.width));
}
function seekTo(clientX) {
  const p = relPct(seekBarWrap.querySelector('.seek-bar-bg'), clientX);
  seekFill.style.width = (p * 100) + '%';
  seekThumb.style.left = (p * 100) + '%';
  if (audio.duration) { audio.currentTime = p * audio.duration; timeElapsed.textContent = fmt(audio.currentTime); }
}
seekBarWrap.addEventListener('pointerdown', e => { seekDragging = true; seekBarWrap.setPointerCapture(e.pointerId); seekTo(e.clientX); });
seekBarWrap.addEventListener('pointermove', e => { if (seekDragging) seekTo(e.clientX); });
seekBarWrap.addEventListener('pointerup',   e => { seekDragging = false; try { seekBarWrap.releasePointerCapture(e.pointerId); } catch {} savePlayback(); });

function volTo(clientX) {
  const p = relPct(volBarWrap.querySelector('.vol-bar-bg'), clientX);
  muted = false;
  setVolume(p);
}
volBarWrap.addEventListener('pointerdown', e => { volDragging = true; volBarWrap.setPointerCapture(e.pointerId); volTo(e.clientX); });
volBarWrap.addEventListener('pointermove', e => { if (volDragging) volTo(e.clientX); });
volBarWrap.addEventListener('pointerup',   e => { volDragging = false; try { volBarWrap.releasePointerCapture(e.pointerId); } catch {} savePlayback(); });

function setVolume(v) {
  volume = Math.max(0, Math.min(1, v));
  audio.volume = muted ? 0 : volume;
  const pct = (muted ? 0 : volume) * 100;
  volFill.style.width = pct + '%';
  volThumb.style.left = pct + '%';
  if (muted || volume === 0) volIcon.className = 'fa-solid fa-volume-xmark';
  else if (volume < 0.4)     volIcon.className = 'fa-solid fa-volume-low';
  else                       volIcon.className = 'fa-solid fa-volume-high';
}

$('volMute').addEventListener('click', () => {
  if (muted) { muted = false; setVolume(prevVolume || 0.5); }
  else       { prevVolume = volume || 0.5; muted = true; setVolume(0); }
  savePlayback();
});

/* ══ Now-playing bar: like + cover click ════════ */
npLike.addEventListener('click', () => { if (currentId) toggleLike(currentId); });
$('npCover').addEventListener('click', () => openRightPanel('nowplaying'));

/* ══ Media Session API ══════════════════════════ */
function setMediaSession(t) {
  if (!('mediaSession' in navigator)) return;
  try {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: t.title, artist: t.artist, album: t.albumTitle,
      artwork: [96, 192, 512].map(s => ({ src: t.cover, sizes: `${s}x${s}`, type: 'image/jpeg' })),
    });
  } catch {}
}
if ('mediaSession' in navigator) {
  const ms = navigator.mediaSession;
  ms.setActionHandler('play',  () => audio.play());
  ms.setActionHandler('pause', () => audio.pause());
  ms.setActionHandler('previoustrack', prevTrack);
  ms.setActionHandler('nexttrack', () => nextTrack(false));
  ms.setActionHandler('seekbackward', d => { audio.currentTime = Math.max(0, audio.currentTime - (d.seekOffset || 10)); });
  ms.setActionHandler('seekforward',  d => { audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + (d.seekOffset || 10)); });
  try { ms.setActionHandler('seekto', d => { if (d.seekTime != null) audio.currentTime = d.seekTime; }); } catch {}
}

/* ══ Right panel (Queue / Now playing / Lyrics) ═ */
function openRightPanel(mode) {
  if (rpMode === mode) return closeRightPanel();
  rpMode = mode;
  rightPanel.hidden = false;
  $('spotifyApp').classList.add('right-open');
  const btnFor = { queue: 'btnQueue', nowplaying: 'btnNowPlaying', lyrics: 'btnLyrics' };
  qsa('.np-extra-btn').forEach(b => b.classList.remove('active'));
  $(btnFor[mode])?.classList.add('active');
  const t = currentId && getTrack(currentId);
  if ((mode === 'lyrics' || mode === 'nowplaying') && t) loadLyrics(t);
  renderRightPanel();
}
function closeRightPanel() {
  rpMode = null;
  rightPanel.hidden = true;
  $('spotifyApp').classList.remove('right-open');
  qsa('.np-extra-btn').forEach(b => b.classList.remove('active'));
}
$('rpClose').addEventListener('click', closeRightPanel);
$('btnQueue').addEventListener('click', () => openRightPanel('queue'));
$('btnNowPlaying').addEventListener('click', () => openRightPanel('nowplaying'));
$('btnLyrics').addEventListener('click', () => openRightPanel('lyrics'));

function miniRow(id, opts = {}) {
  const t = getTrack(id);
  if (!t) return '';
  const cur = id === currentId;
  return `<div class="rp-row${cur ? ' current' : ''}" data-id="${esc(id)}" data-act="${opts.act || 'play'}">
      <div class="rp-row-cover"><img src="${esc(t.cover)}" alt="" onerror="this.remove()"></div>
      <div class="rp-row-info">
        <div class="rp-row-title">${esc(t.title)}</div>
        <div class="rp-row-artist">${esc(t.artist)}</div>
      </div>
      ${opts.removable ? `<button class="rp-row-x" data-remove="${esc(opts.qi)}" title="Remove from queue"><i class="fa-solid fa-xmark"></i></button>` : ''}
    </div>`;
}

function renderRightPanel() {
  if (rpMode == null) return;
  const body = $('rpBody');
  const t = currentId && getTrack(currentId);
  $('rpTitle').textContent = rpMode === 'queue' ? 'Queue' : rpMode === 'lyrics' ? 'Lyrics' : 'Now playing';

  if (rpMode === 'queue') {
    let html = '';
    html += `<h3 class="rp-sub">Now playing</h3>`;
    html += t ? miniRow(currentId) : `<div class="rp-empty">Nothing playing</div>`;
    if (queue.length) {
      html += `<div class="rp-sub-row"><h3 class="rp-sub">Next in queue</h3><button class="rp-clear" id="rpClearQueue">Clear queue</button></div>`;
      html += queue.map((id, i) => miniRow(id, { removable: true, qi: i })).join('');
    }
    if (ctx) {
      const upcoming = ctxOrder.slice(ctxPos + 1).map(i => ctx.trackIds[i]);
      if (upcoming.length) {
        html += `<h3 class="rp-sub">Next from: ${esc(ctx.name)}</h3>`;
        html += upcoming.slice(0, 30).map(id => miniRow(id, { act: 'ctx' })).join('');
      }
    }
    body.innerHTML = html;
    $('rpClearQueue')?.addEventListener('click', () => { queue = []; renderRightPanel(); savePlayback(); toast('Queue cleared'); });
  }

  else if (rpMode === 'nowplaying') {
    if (!t) { body.innerHTML = `<div class="rp-empty">Nothing playing</div>`; return; }
    const alb = albums.find(a => a.folder === t.folder);
    const next = queue[0] || (ctx && ctxOrder[ctxPos + 1] != null ? ctx.trackIds[ctxOrder[ctxPos + 1]] : null);
    body.innerHTML = `
      <div class="np-panel-art"><img src="${esc(t.cover)}" alt="" onerror="this.style.display='none'"></div>
      <div class="np-panel-head">
        <div>
          <div class="np-panel-title">${esc(t.title)}</div>
          <div class="np-panel-artist">${esc(t.artist)}</div>
        </div>
        <button class="np-panel-like ${likedIds.includes(currentId) ? 'liked' : ''}" id="npPanelLike">
          <i class="${likedIds.includes(currentId) ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
        </button>
      </div>
      ${alb && alb.blurb ? `<div class="np-panel-card">
        <div class="np-panel-card-h">About ${esc(t.artist)}</div>
        <p>${esc(alb.blurb)}</p>
      </div>` : ''}
      <div class="np-panel-card">
        <div class="np-panel-card-h">Credits</div>
        <div class="cred-row"><span>${esc(t.artist)}</span><span>Main artist</span></div>
        <div class="cred-row"><span>${esc(t.albumTitle)}</span><span>Album, ${esc(String(t.year || ''))}</span></div>
      </div>
      <div class="np-panel-card lyr-card" id="npLyrCard">
        <div class="np-panel-card-h">Lyrics <button class="lyr-expand" id="lyrExpand">Open</button></div>
        <div class="lyr-mini" id="lyrMini"><div class="rp-empty">…</div></div>
      </div>
      ${next ? `<h3 class="rp-sub">Next in queue</h3>${miniRow(next)}` : ''}
    `;
    $('npPanelLike')?.addEventListener('click', () => currentId && toggleLike(currentId));
    $('lyrExpand')?.addEventListener('click', () => openRightPanel('lyrics'));
    renderLyricsInto($('lyrMini'), true);
  }

  else if (rpMode === 'lyrics') {
    if (!t) { body.innerHTML = `<div class="rp-empty">Nothing playing</div>`; return; }
    body.innerHTML = `<div class="lyr-full" id="lyrFull"></div>`;
    renderLyricsInto($('lyrFull'), false);
  }
}

$('rpBody').addEventListener('click', e => {
  const rm = e.target.closest('[data-remove]');
  if (rm) {
    queue.splice(+rm.dataset.remove, 1);
    renderRightPanel(); savePlayback();
    return;
  }
  const row = e.target.closest('.rp-row');
  if (!row) return;
  const id = row.dataset.id;
  if (row.dataset.act === 'ctx' && ctx) {
    const ti = ctx.trackIds.indexOf(id);
    const oi = ctxOrder.indexOf(ti);
    if (oi !== -1) { ctxPos = oi; loadTrack(id, true); renderRightPanel(); }
  } else if (row.dataset.act === 'play' && id !== currentId) {
    // clicking a queued row: play it, drop the ones before it in queue
    const qpos = queue.indexOf(id);
    if (qpos !== -1) queue.splice(0, qpos + 1);
    loadTrack(id, true);
    renderRightPanel();
  }
});

/* ══ Lyrics (lrclib.net) ════════════════════════ */
function resetLyrics() { lyricLines = null; activeLyric = -1; }

function parseLRC(lrc) {
  const re = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/g;
  const out = [];
  lrc.split('\n').forEach(line => {
    const stamps = []; let m; re.lastIndex = 0;
    while ((m = re.exec(line))) {
      stamps.push(parseInt(m[1], 10) * 60 + parseInt(m[2], 10) + (m[3] ? parseFloat('0.' + m[3]) : 0));
    }
    const text = line.replace(re, '').trim();
    stamps.forEach(s => out.push({ time: s, text }));
  });
  return out.sort((a, b) => a.time - b.time);
}

function loadLyrics(t) {
  const token = ++lyricsFetchToken;
  lyricLines = 'loading';
  renderLyricsTargets();
  const qsp = `track_name=${encodeURIComponent(t.title)}&artist_name=${encodeURIComponent(t.artist)}`;
  fetch(`https://lrclib.net/api/get?${qsp}`)
    .then(r => r.ok ? r.json() : null)
    .then(d => {
      if (d && (d.syncedLyrics || d.plainLyrics)) return d;
      return fetch(`https://lrclib.net/api/search?${qsp}`)
        .then(r => r.ok ? r.json() : [])
        .then(list => (Array.isArray(list) ? list.find(x => x.syncedLyrics) || list.find(x => x.plainLyrics) : null));
    })
    .then(d => {
      if (token !== lyricsFetchToken) return;
      if (d && d.syncedLyrics)      lyricLines = parseLRC(d.syncedLyrics);
      else if (d && d.plainLyrics)  lyricLines = d.plainLyrics.split('\n').map(x => ({ time: null, text: x }));
      else                          lyricLines = 'none';
      activeLyric = -1;
      renderLyricsTargets();
    })
    .catch(() => { if (token === lyricsFetchToken) { lyricLines = 'error'; renderLyricsTargets(); } });
}

function renderLyricsTargets() {
  const mini = $('lyrMini'); if (mini) renderLyricsInto(mini, true);
  const full = $('lyrFull'); if (full) renderLyricsInto(full, false);
}

function renderLyricsInto(el, mini) {
  if (!el) return;
  if (lyricLines === 'loading') { el.innerHTML = `<div class="rp-empty">Finding lyrics…</div>`; return; }
  if (lyricLines === 'none')    { el.innerHTML = `<div class="rp-empty">No lyrics found for this track</div>`; return; }
  if (lyricLines === 'error')   { el.innerHTML = `<div class="rp-empty">Couldn't load lyrics${location.protocol === 'file:' ? ' - try running from a local server' : ''}</div>`; return; }
  if (!Array.isArray(lyricLines)) { el.innerHTML = `<div class="rp-empty">…</div>`; return; }
  const synced = lyricLines.some(l => l.time != null);
  const lines = mini ? lyricLines.slice(0, 6) : lyricLines;
  el.innerHTML = lines.map((l, i) =>
    `<p class="lyr-line${l.time != null ? ' timed' : ''}" data-i="${i}">${esc(l.text || ' ')}</p>`).join('');
  el.dataset.synced = synced ? '1' : '0';
  updateLyricHighlight(true);
}

function updateLyricHighlight(force) {
  if (!Array.isArray(lyricLines)) return;
  const synced = lyricLines.some(l => l.time != null);
  if (!synced) return;
  const t = audio.currentTime;
  let idx = -1;
  for (let i = 0; i < lyricLines.length; i++) {
    if (lyricLines[i].time != null && lyricLines[i].time <= t + 0.15) idx = i; else if (lyricLines[i].time != null) break;
  }
  if (idx === activeLyric && !force) return;
  activeLyric = idx;
  ['lyrFull', 'lyrMini'].forEach(cid => {
    const el = $(cid);
    if (!el) return;
    qsa('.lyr-line', el).forEach(p => {
      const i = +p.dataset.i;
      p.classList.toggle('active', i === idx);
      p.classList.toggle('sung', i < idx);
    });
    if (cid === 'lyrFull' && idx >= 0) {
      const active = el.querySelector('.lyr-line.active');
      if (active) {
        const c = el;
        const delta = active.offsetTop - c.clientHeight / 2 + active.offsetHeight / 2;
        c.scrollTo({ top: delta, behavior: 'smooth' });
      }
    }
  });
}

/* ══ Context menu ═══════════════════════════════ */
function openCtxMenu(evt, items) {
  evt.preventDefault?.();
  evt.stopPropagation?.();          // don't let this same click reach the outside-click closer
  const r = evt.currentTarget?.getBoundingClientRect?.() || evt.target?.getBoundingClientRect?.();
  const x = evt.clientX || (r ? r.left : 0);
  const y = evt.clientY || (r ? r.bottom : 0);
  ctxMenu.innerHTML = renderMenuItems(items);
  ctxMenu.hidden = false;
  const w = ctxMenu.offsetWidth, h = ctxMenu.offsetHeight;
  ctxMenu.style.left = Math.min(x, innerWidth - w - 8) + 'px';
  ctxMenu.style.top  = Math.min(y, innerHeight - h - 8) + 'px';
  bindMenu(items);
}
function renderMenuItems(items) {
  return items.map((it, i) => {
    if (it.divider) return `<div class="ctx-div"></div>`;
    if (it.sub) return `<div class="ctx-item has-sub" data-i="${i}">
        <span><i class="fa-solid ${it.icon || 'fa-chevron-right'}"></i>${esc(it.label)}</span>
        <i class="fa-solid fa-chevron-right ctx-caret"></i>
        <div class="ctx-sub">${renderMenuItems(it.sub)}</div>
      </div>`;
    return `<div class="ctx-item" data-i="${i}"><span><i class="fa-solid ${it.icon || 'fa-circle'}"></i>${esc(it.label)}</span></div>`;
  }).join('');
}
function bindMenu(items) {
  const wire = (container, list) => {
    [...container.children].forEach(child => {
      const idx = +child.dataset.i;
      const it = list[idx];
      if (!it) return;
      if (it.sub) {
        const sub = child.querySelector('.ctx-sub');
        if (sub) wire(sub, it.sub);
      } else if (it.fn) {
        child.addEventListener('click', e => { e.stopPropagation(); closeCtxMenu(); it.fn(); });
      }
    });
  };
  wire(ctxMenu, items);
}
function closeCtxMenu() { ctxMenu.hidden = true; ctxMenu.innerHTML = ''; }
document.addEventListener('click', e => { if (!ctxMenu.hidden && !ctxMenu.contains(e.target)) closeCtxMenu(); });
document.addEventListener('scroll', closeCtxMenu, true);
window.addEventListener('resize', closeCtxMenu);
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeCtxMenu(); if (rpMode) closeRightPanel(); } });

function addToPlaylistSub(trackIds) {
  const sub = playlists.map(pl => ({
    label: pl.name, icon: 'fa-music',
    fn: () => {
      const add = trackIds.filter(id => !pl.trackIds.includes(id));
      pl.trackIds.push(...add);
      savePlaylists(); renderLibrary(); renderHomeGrids();
      toast(add.length ? `Added to ${pl.name}` : `Already in ${pl.name}`);
    },
  }));
  sub.unshift({
    label: 'New playlist', icon: 'fa-plus',
    fn: () => { const pl = createPlaylist(); pl.trackIds.push(...trackIds); savePlaylists(); renderLibrary(); renderHomeGrids(); toast(`Added to ${pl.name}`); },
  });
  return sub;
}

function trackMenu(id, coll) {
  const t = getTrack(id);
  const liked = likedIds.includes(id);
  const items = [
    { label: 'Add to queue', icon: 'fa-list', fn: () => { queue.push(id); toast('Added to queue'); renderRightPanel(); savePlayback(); } },
    { label: 'Play next', icon: 'fa-forward-step', fn: () => { queue.unshift(id); toast('Playing next'); renderRightPanel(); savePlayback(); } },
    { divider: true },
    { label: liked ? 'Remove from Liked Songs' : 'Save to Liked Songs', icon: liked ? 'fa-heart-crack' : 'fa-heart', fn: () => toggleLike(id) },
    { label: 'Add to playlist', icon: 'fa-plus', sub: addToPlaylistSub([id]) },
  ];
  if (coll && coll.playlist) {
    items.push({ divider: true }, {
      label: 'Remove from this playlist', icon: 'fa-trash',
      fn: () => {
        coll.playlist.trackIds = coll.playlist.trackIds.filter(x => x !== id);
        savePlaylists();
        coll.trackIds = coll.playlist.trackIds; coll.ctx.trackIds = coll.playlist.trackIds.slice();
        renderTrackRows(coll); renderLibrary(); renderHomeGrids();
        toast('Removed from ' + coll.playlist.name);
      },
    });
  }
  const alb = albums.find(a => a.folder === t.folder);
  if (alb) items.push({ divider: true }, { label: 'Go to album', icon: 'fa-compact-disc', fn: () => openAlbum(alb) });
  return items;
}

function albumMenu(a) {
  const c = { type: 'album', id: a.folder, name: a.title, trackIds: a.trackIds.slice() };
  return [
    { label: 'Play', icon: 'fa-play', fn: () => playContext(c, 0, true) },
    { label: 'Add to queue', icon: 'fa-list', fn: () => { queue.push(...a.trackIds); toast(`Added ${a.trackIds.length} songs to queue`); renderRightPanel(); savePlayback(); } },
    { divider: true },
    { label: 'Add all to playlist', icon: 'fa-plus', sub: addToPlaylistSub(a.trackIds.slice()) },
    { label: 'Save album to Your Library', icon: 'fa-heart', fn: () => {
      if (playlists.some(p => p.name === a.title)) return toast('Already in Your Library');
      playlists.push({ id: uid(), name: a.title, trackIds: a.trackIds.slice(), created: Date.now() });
      savePlaylists(); renderLibrary(); renderHomeGrids(); toast('Saved to Your Library');
    } },
  ];
}

function playlistMenu(pl) {
  const c = { type: 'playlist', id: pl.id, name: pl.name, trackIds: pl.trackIds.slice() };
  return [
    { label: 'Play', icon: 'fa-play', fn: () => pl.trackIds.length ? playContext(c, 0, true) : toast('This playlist is empty') },
    { label: 'Add to queue', icon: 'fa-list', fn: () => { if (!pl.trackIds.length) return toast('Empty playlist'); queue.push(...pl.trackIds); toast('Added to queue'); renderRightPanel(); savePlayback(); } },
    { divider: true },
    { label: 'Rename', icon: 'fa-pen', fn: () => {
      const name = prompt('Rename playlist', pl.name);
      if (name && name.trim()) { pl.name = name.trim(); savePlaylists(); renderLibrary(); renderHomeGrids(); if (currentView.v === 'playlist' && currentView.id === pl.id) { navigating = true; openPlaylist(pl); navigating = false; } }
    } },
    { label: 'Delete', icon: 'fa-trash', fn: () => {
      if (!confirm(`Delete playlist "${pl.name}"?`)) return;
      playlists = playlists.filter(p => p.id !== pl.id);
      savePlaylists(); renderLibrary(); renderHomeGrids();
      recent = recent.filter(r => !(r.type === 'playlist' && r.id === pl.id)); saveRecent(); renderRecent();
      if (currentView.v === 'playlist' && currentView.id === pl.id) goHome();
      toast('Playlist deleted');
    } },
  ];
}

/* ══ Playlists ══════════════════════════════════ */
function createPlaylist(name) {
  const n = name || `My Playlist #${playlists.length + 1}`;
  const pl = { id: uid(), name: n, trackIds: [], created: Date.now() };
  playlists.push(pl);
  savePlaylists();
  return pl;
}
$('createPlaylistBtn').addEventListener('click', () => {
  const pl = createPlaylist();
  renderLibrary(); renderHomeGrids();
  openPlaylist(pl);
  toast('Playlist created - add songs from any track menu');
});

/* ══ Navigation ═════════════════════════════════ */
function renderView(d) {
  navigating = true;
  if (d.v === 'home') {
    qsa('.nav-item').forEach(n => n.classList.remove('active'));
    $('navHome').classList.add('active');
    showView('viewHome');
  } else if (d.v === 'search') {
    qsa('.nav-item').forEach(n => n.classList.remove('active'));
    $('navSearch').classList.add('active');
    showView('viewSearch');
  } else if (d.v === 'album') {
    const a = albums.find(x => x.folder === d.id);
    if (a) openAlbum(a); else showView('viewHome');
  } else if (d.v === 'playlist') {
    const pl = playlists.find(x => x.id === d.id);
    if (pl) openPlaylist(pl); else showView('viewHome');
  } else if (d.v === 'liked') {
    openLiked();
  }
  currentView = d;
  navigating = false;
  syncNavButtons();
}

function goHome() {
  qsa('.nav-item').forEach(n => n.classList.remove('active'));
  $('navHome').classList.add('active');
  showView('viewHome', { v: 'home' });
}
$('navHome').addEventListener('click', e => { e.preventDefault(); goHome(); });
$('navSearch').addEventListener('click', e => {
  e.preventDefault();
  qsa('.nav-item').forEach(n => n.classList.remove('active'));
  $('navSearch').classList.add('active');
  showView('viewSearch', { v: 'search' });
  setTimeout(() => $('searchInput')?.focus(), 60);
});
$('navBack').addEventListener('click', () => {
  if (!navStack.length) return;
  navFwdStack.push(currentView);
  renderView(navStack.pop());
});
$('navFwd').addEventListener('click', () => {
  if (!navFwdStack.length) return;
  navStack.push(currentView);
  renderView(navFwdStack.pop());
});

contentArea.addEventListener('scroll', () => {
  topbar.classList.toggle('scrolled', contentArea.scrollTop > 60);
});

/* ══ Search ═════════════════════════════════════ */
const searchInput = $('searchInput');
searchInput.addEventListener('input', () => runSearch(searchInput.value));
$('searchClear').addEventListener('click', () => { searchInput.value = ''; runSearch(''); searchInput.focus(); });

function runSearch(raw) {
  const q = raw.toLowerCase().trim();
  $('searchClear').hidden = !raw;
  const browseWrap = $('browseWrap');
  const results = $('searchResults');

  if (!q) { browseWrap.hidden = false; results.hidden = true; results.innerHTML = ''; return; }
  browseWrap.hidden = true; results.hidden = false;

  const matchAlbums = albums.filter(a =>
    a.title.toLowerCase().includes(q) || a.artist.toLowerCase().includes(q));
  const matchTracks = Object.values(allTracks).filter(t =>
    t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q) || t.albumTitle.toLowerCase().includes(q));
  const matchPlaylists = playlists.filter(p => p.name.toLowerCase().includes(q));

  if (!matchAlbums.length && !matchTracks.length && !matchPlaylists.length) {
    results.innerHTML = `<div class="search-none">
      <h2>No results found for "${esc(raw.trim())}"</h2>
      <p>Please make sure your words are spelled correctly, or use fewer or different keywords.</p>
    </div>`;
    return;
  }

  // top result: exact-ish album/artist, else first track
  let top = matchAlbums.find(a => a.artist.toLowerCase() === q || a.title.toLowerCase() === q)
    || matchAlbums[0] || null;
  let topIsTrack = false;
  if (!top && matchTracks.length) { top = matchTracks[0]; topIsTrack = true; }

  let html = '<div class="search-top-row">';
  if (top) {
    html += `<div class="search-top">
      <h2 class="section-title">Top result</h2>
      <div class="top-card" id="topCard">
        <div class="top-card-img">${topIsTrack
          ? `<img src="${esc(top.cover)}" alt="" onerror="this.style.display='none'">`
          : `<img src="${esc(top.cover)}" alt="" onerror="this.style.display='none'">`}</div>
        <div class="top-card-title">${esc(top.title)}</div>
        <div class="top-card-sub">${topIsTrack ? 'Song • ' + esc(top.artist) : 'Album • ' + esc(top.artist)}</div>
        <button class="top-card-play" id="topPlay"><i class="fa-solid fa-play"></i></button>
      </div>
    </div>`;
  }
  if (matchTracks.length) {
    html += `<div class="search-songs">
      <h2 class="section-title">Songs</h2>
      <div class="song-hits">${matchTracks.slice(0, 6).map(t => `
        <div class="song-hit" data-id="${esc(t.id)}">
          <div class="song-hit-cover"><img src="${esc(t.cover)}" alt="" onerror="this.remove()"></div>
          <div class="song-hit-info">
            <div class="song-hit-title">${esc(t.title)}</div>
            <div class="song-hit-artist">${esc(t.artist)}</div>
          </div>
          <button class="song-hit-like ${likedIds.includes(t.id) ? 'liked' : ''}" data-like="${esc(t.id)}"><i class="${likedIds.includes(t.id) ? 'fa-solid' : 'fa-regular'} fa-heart"></i></button>
          <span class="song-hit-dur" data-dur="${esc(t.id)}">${t.duration ? fmt(t.duration) : ''}</span>
        </div>`).join('')}</div>
    </div>`;
  }
  html += '</div>';

  const albCards = [...matchAlbums, ...matchPlaylists];
  if (albCards.length) {
    html += `<h2 class="section-title" style="margin:28px 0 16px">Albums &amp; playlists</h2><div class="card-grid" id="searchAlbGrid"></div>`;
  }
  results.innerHTML = html;

  if (top) {
    const play = () => topIsTrack
      ? playContext({ type: 'search', id: 'q', name: 'Search results', trackIds: matchTracks.map(t => t.id) }, 0, true)
      : playContext({ type: 'album', id: top.folder, name: top.title, trackIds: top.trackIds.slice() }, 0, true);
    $('topPlay')?.addEventListener('click', e => { e.stopPropagation(); play(); });
    $('topCard')?.addEventListener('click', () => topIsTrack ? play() : openAlbum(top));
  }

  qsa('.song-hit', results).forEach(el => {
    const id = el.dataset.id;
    el.addEventListener('click', () => {
      const ids = matchTracks.map(t => t.id);
      playContext({ type: 'search', id: 'q', name: 'Search results', trackIds: ids }, ids.indexOf(id), true);
    });
    el.addEventListener('contextmenu', e => { e.preventDefault(); openCtxMenu(e, trackMenu(id)); });
  });
  qsa('[data-like]', results).forEach(btn => btn.addEventListener('click', e => {
    e.stopPropagation(); toggleLike(btn.dataset.like);
    const l = likedIds.includes(btn.dataset.like);
    btn.classList.toggle('liked', l);
    btn.querySelector('i').className = (l ? 'fa-solid' : 'fa-regular') + ' fa-heart';
  }));
  qsa('[data-dur]', results).forEach(span => {
    const t = getTrack(span.dataset.dur);
    if (!t || t.duration) return;
    const tmp = new Audio(trackSrc(t));
    tmp.addEventListener('loadedmetadata', () => { t.duration = tmp.duration; span.textContent = fmt(tmp.duration); });
  });

  const ag = $('searchAlbGrid');
  if (ag) {
    matchAlbums.forEach(a => ag.appendChild(albumCard(a)));
    matchPlaylists.forEach(p => ag.appendChild(playlistCardEl(p)));
  }
}

function renderBrowse() {
  const grid = $('browseGrid');
  if (!grid) return;
  const genres = [
    { name: 'Pop', color: '#e8115b' }, { name: 'Hip-Hop', color: '#8d67ab' },
    { name: 'R&B', color: '#1e3264' }, { name: 'Dance/EDM', color: '#e13300' },
    { name: 'Rock', color: '#ba5d07' }, { name: 'Latin', color: '#0d73ec' },
    { name: 'Podcasts', color: '#006450' }, { name: 'Chill', color: '#477d95' },
    { name: 'Classical', color: '#503750' }, { name: 'Afrobeats', color: '#148a08' },
  ];
  grid.innerHTML = '';
  genres.forEach(g => {
    const el = document.createElement('div');
    el.className = 'genre-card';
    el.style.background = g.color;
    el.innerHTML = `<span>${g.name}</span><span class="genre-icon">♪</span>`;
    el.addEventListener('click', () => { searchInput.value = g.name; runSearch(g.name); });
    grid.appendChild(el);
  });
}

/* ══ Extra buttons ══════════════════════════════ */
$('btnDevice').addEventListener('click', () => toast('This device'));
$('btnFullscreen').addEventListener('click', () => {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
  else document.exitFullscreen?.();
});
$('topbarNotif').addEventListener('click', () => toast('No new notifications'));
$('topbarUser').addEventListener('click', e => openCtxMenu(e, [
  { label: 'Account', icon: 'fa-user', fn: () => toast('Account') },
  { label: 'Profile', icon: 'fa-id-badge', fn: () => toast('Profile') },
  { divider: true },
  { label: 'Log out', icon: 'fa-arrow-right-from-bracket', fn: () => toast('This is a demo - no account to log out of') },
]));

/* ══ Mobile sidebar ═════════════════════════════ */
const sidebar = $('sidebar'), overlay = $('sidebarOverlay');
$('mobileMenuBtn').addEventListener('click', () => { sidebar.classList.add('open'); overlay.classList.remove('hidden'); });
overlay.addEventListener('click', () => { sidebar.classList.remove('open'); overlay.classList.add('hidden'); });
libList.addEventListener('click', () => { if (innerWidth <= 768) { sidebar.classList.remove('open'); overlay.classList.add('hidden'); } });

/* ══ Keyboard shortcuts ═════════════════════════ */
document.addEventListener('keydown', e => {
  if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
  if (e.code === 'Space')      { e.preventDefault(); togglePlayPause(); }
  else if (e.code === 'ArrowRight' && e.shiftKey) { e.preventDefault(); nextTrack(false); }
  else if (e.code === 'ArrowLeft'  && e.shiftKey) { e.preventDefault(); prevTrack(); }
  else if (e.code === 'ArrowRight') { audio.currentTime = Math.min(audio.currentTime + 5, audio.duration || 0); }
  else if (e.code === 'ArrowLeft')  { audio.currentTime = Math.max(audio.currentTime - 5, 0); }
  else if (e.code === 'ArrowUp')    { e.preventDefault(); setVolume(volume + 0.05); }
  else if (e.code === 'ArrowDown')  { e.preventDefault(); setVolume(volume - 0.05); }
  else if (e.key === 'm' || e.key === 'M') $('volMute').click();
  else if (e.key === 's' || e.key === 'S') ctrlShuffle.click();
  else if (e.key === 'r' || e.key === 'R') ctrlRepeat.click();
});

window.addEventListener('beforeunload', savePlayback);

/* ══ Boot ═══════════════════════════════════════ */
setVolume(0.7);
syncNavButtons();
loadAlbums();
