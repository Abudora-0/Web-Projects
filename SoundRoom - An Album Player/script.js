/* ══════════════════════════════════════════════
   SoundRoom - records & hi-fi  |  script.js
   (crate + pressing station + turntable deck)
   ══════════════════════════════════════════════ */

'use strict';

/* ── Preset albums ───────────────────────────── */
const SP = '../Spotify Clone/songs/';  // shared songs folder

const GNX_SONGS = [
  { title: 'wacced out murals',    artist: 'Kendrick Lamar', file: 'songs/1.mp3',  cover: 'covers/1.jpg',  duration: '5:17', lyrics: '' },
  { title: 'squabble up',          artist: 'Kendrick Lamar', file: 'songs/2.mp3',  cover: 'covers/2.jpg',  duration: '2:37', lyrics: '' },
  { title: "can't be humble",      artist: 'Kendrick Lamar', file: 'songs/3.mp3',  cover: 'covers/3.jpg',  duration: '2:39', lyrics: '' },
  { title: 'tv off',               artist: 'Kendrick Lamar', file: 'songs/4.mp3',  cover: 'covers/4.jpg',  duration: '2:51', lyrics: '' },
  { title: 'man at the garden',    artist: 'Kendrick Lamar', file: 'songs/5.mp3',  cover: 'covers/5.jpg',  duration: '3:31', lyrics: '' },
  { title: 'heart pt 6',           artist: 'Kendrick Lamar', file: 'songs/6.mp3',  cover: 'covers/6.jpg',  duration: '4:09', lyrics: '' },
  { title: 'reincarnated',         artist: 'Kendrick Lamar', file: 'songs/7.mp3',  cover: 'covers/7.jpg',  duration: '4:04', lyrics: '' },
  { title: 'dodger blue',          artist: 'Kendrick Lamar', file: 'songs/8.mp3',  cover: 'covers/8.jpg',  duration: '3:29', lyrics: '' },
  { title: 'peekaboo',             artist: 'Kendrick Lamar', file: 'songs/9.mp3',  cover: 'covers/9.jpg',  duration: '3:19', lyrics: '' },
  { title: 'luther',               artist: 'Kendrick Lamar', file: 'songs/10.mp3', cover: 'covers/10.jpg', duration: '3:18', lyrics: '' },
  { title: 'man at the garden II', artist: 'Kendrick Lamar', file: 'songs/11.mp3', cover: 'covers/11.jpg', duration: '2:56', lyrics: '' },
  { title: 'gloria',               artist: 'Kendrick Lamar', file: 'songs/12.mp3', cover: 'covers/12.jpg', duration: '4:47', lyrics: '' },
];

const GNX_DEFAULT = {
  id: 'gnx-default', title: 'GNX', artist: 'Kendrick Lamar',
  year: '2024', genre: 'Hip-Hop', accent: '#e8933a',
  artUrl: 'covers/1.jpg', bgUrl: 'bg.webp', songs: GNX_SONGS,
  notes: "A blank pressing. Drop numbered rips (1.mp3, 2.mp3 ...) into this project's /songs folder and cover art into /covers to cut the record.",
};

function sp(folder, file, title, artist) {
  return { title, artist, file: SP + folder + '/' + file,
           cover: SP + folder + '/cover.jpg', duration: '-', lyrics: '' };
}

const PRESET_ALBUMS = [
  {
    id: 'billie-hmhas', title: 'HIT ME HARD AND SOFT', artist: 'Billie Eilish',
    year: '2024', genre: 'Pop', accent: '#a3e6b0',
    artUrl: SP + 'billie/cover.jpg', bgUrl: SP + 'billie/cover.jpg',
    songs: [
      sp('billie','1. SKINNY.mp3','SKINNY','Billie Eilish'),
      sp('billie','2. LUNCH.mp3','LUNCH','Billie Eilish'),
      sp('billie','3. CHIHIRO.mp3','CHIHIRO','Billie Eilish'),
      sp('billie','4. BIRDS OF A FEATHER.mp3','BIRDS OF A FEATHER','Billie Eilish'),
      sp('billie','5. WILDFLOWER.mp3','WILDFLOWER','Billie Eilish'),
      sp('billie','6. THE GREATEST.mp3','THE GREATEST','Billie Eilish'),
      sp('billie',"7. L'AMOUR DE MA VIE.mp3","L'AMOUR DE MA VIE",'Billie Eilish'),
      sp('billie','8. THE DINER.mp3','THE DINER','Billie Eilish'),
      sp('billie','9. BITTERSUITE.mp3','BITTERSUITE','Billie Eilish'),
      sp('billie','10. BLUE.mp3','BLUE','Billie Eilish'),
    ],
  },
  {
    id: 'drake-clb', title: 'Certified Lover Boy', artist: 'Drake',
    year: '2021', genre: 'Hip-Hop', accent: '#8a9bc4',
    artUrl: SP + 'drake/cover.jpg', bgUrl: SP + 'drake/cover.jpg',
    songs: [
      sp('drake','Drake - Champagne Poetry (SPOTISAVER).mp3','Champagne Poetry','Drake'),
      sp('drake','Drake - TSU (SPOTISAVER).mp3','TSU','Drake'),
      sp('drake',"Drake - Papi's Home (SPOTISAVER).mp3","Papi's Home",'Drake'),
      sp('drake','Drake, Lil Baby - Girls Want Girls (with Lil Baby) (SPOTISAVER).mp3','Girls Want Girls (ft. Lil Baby)','Drake'),
      sp('drake','Drake, Lil Durk, GIVĒON - In The Bible (with Lil Durk & Giveon) (SPOTISAVER).mp3','In The Bible (ft. Lil Durk & Giveon)','Drake'),
      sp('drake','Drake, Future, Young Thug - Way 2 Sexy (with Future & Young Thug) (SPOTISAVER).mp3','Way 2 Sexy (ft. Future & Young Thug)','Drake'),
      sp('drake','Drake - Race My Mind (SPOTISAVER).mp3','Race My Mind','Drake'),
      sp('drake','Drake, Tems - Fountains (with Tems) (SPOTISAVER).mp3','Fountains (ft. Tems)','Drake'),
      sp('drake','Drake, JAŸ-Z - Love All (with JAY-Z) (SPOTISAVER).mp3','Love All (ft. JAY-Z)','Drake'),
      sp('drake','Drake, Kid Cudi - IMY2 (with Kid Cudi) (SPOTISAVER).mp3','IMY2 (ft. Kid Cudi)','Drake'),
      sp('drake','Drake, Travis Scott - Fair Trade (with Travis Scott) (SPOTISAVER).mp3','Fair Trade (ft. Travis Scott)','Drake'),
      sp('drake','Drake, Ty Dolla $ign - Get Along Better (SPOTISAVER).mp3','Get Along Better (ft. Ty Dolla $ign)','Drake'),
      sp('drake','Drake - Pipe Down (SPOTISAVER).mp3','Pipe Down','Drake'),
      sp('drake','Drake - The Remorse (SPOTISAVER).mp3','The Remorse','Drake'),
      sp('drake','Drake - No Friends In The Industry (SPOTISAVER).mp3','No Friends In The Industry','Drake'),
      sp('drake','Drake - 7am On Bridle Path (SPOTISAVER).mp3','7am On Bridle Path','Drake'),
      sp('drake','Drake, Future - N 2 Deep (SPOTISAVER).mp3','N 2 Deep (ft. Future)','Drake'),
      sp('drake','Drake, Yebba - Yebba\'s Heartbreak (SPOTISAVER).mp3',"Yebba's Heartbreak (ft. Yebba)",'Drake'),
      sp('drake','Drake, Lil Wayne, Rick Ross - You Only Live Twice (with Lil Wayne & Rick Ross) (SPOTISAVER).mp3','You Only Live Twice (ft. Lil Wayne & Rick Ross)','Drake'),
      sp('drake','Drake - F g Fans (SPOTISAVER).mp3','F**kin\' Problems (CLB)','Drake'),
    ],
  },
  {
    id: 'dua-ro', title: 'Radical Optimism', artist: 'Dua Lipa',
    year: '2024', genre: 'Pop / Dance', accent: '#f472b6',
    artUrl: SP + 'dua/cover.jpg', bgUrl: SP + 'dua/cover.jpg',
    songs: [
      sp('dua','1. End Of An Era.mp3','End Of An Era','Dua Lipa'),
      sp('dua','2. Houdini.mp3','Houdini','Dua Lipa'),
      sp('dua','3. Training Season.mp3','Training Season','Dua Lipa'),
      sp('dua','4. These Walls.mp3','These Walls','Dua Lipa'),
      sp('dua','5. Whatcha Doing.mp3','Whatcha Doing','Dua Lipa'),
      sp('dua','6. French Exit.mp3','French Exit','Dua Lipa'),
      sp('dua','7. Illusion.mp3','Illusion','Dua Lipa'),
      sp('dua','8. Falling Forever.mp3','Falling Forever','Dua Lipa'),
      sp('dua','9. Anything For Love.mp3','Anything For Love','Dua Lipa'),
      sp('dua','10. Maria.mp3','Maria','Dua Lipa'),
      sp('dua','11. Happy For You.mp3','Happy For You','Dua Lipa'),
    ],
  },
  {
    id: 'eminem-tdoss', title: 'The Death of Slim Shady', artist: 'Eminem',
    year: '2024', genre: 'Hip-Hop / Rap', accent: '#ef4444',
    artUrl: SP + 'eminem/cover.jpg', bgUrl: SP + 'eminem/cover.jpg',
    songs: [
      sp('eminem','1. Renaissance.mp3','Renaissance','Eminem'),
      sp('eminem','2. Habits.mp3','Habits','Eminem'),
      sp('eminem','3. Trouble.mp3','Trouble','Eminem'),
      sp('eminem','4. Brand New Dance.mp3','Brand New Dance','Eminem'),
      sp('eminem','5. Evil.mp3','Evil','Eminem'),
      sp('eminem','6. All You Got - skit.mp3','All You Got (skit)','Eminem'),
      sp('eminem','7. Lucifer.mp3','Lucifer','Eminem'),
      sp('eminem','8. Antichrist.mp3','Antichrist','Eminem'),
      sp('eminem','9. Fuel.mp3','Fuel','Eminem'),
      sp('eminem','10. Road Rage.mp3','Road Rage','Eminem'),
      sp('eminem','11. Houdini.mp3','Houdini','Eminem'),
      sp('eminem','12. Breaking News - skit.mp3','Breaking News (skit)','Eminem'),
      sp('eminem','13. Guilty Conscience 2.mp3','Guilty Conscience 2','Eminem'),
      sp('eminem','14. Head Honcho.mp3','Head Honcho','Eminem'),
      sp('eminem','15. Temporary.mp3','Temporary','Eminem'),
      sp('eminem','16. Bad One.mp3','Bad One','Eminem'),
      sp('eminem','17. Tobey (feat. Big Sean and BabyTron).mp3','Tobey (ft. Big Sean & BabyTron)','Eminem'),
      sp('eminem',"18. Guess Who's Back - skit.mp3","Guess Who's Back (skit)",'Eminem'),
      sp('eminem','19. Somebody Save Me.mp3','Somebody Save Me','Eminem'),
    ],
  },
  {
    id: 'kenny-tpab', title: 'To Pimp a Butterfly', artist: 'Kendrick Lamar',
    year: '2015', genre: 'Hip-Hop / Jazz', accent: '#fbbf24',
    artUrl: SP + 'kenny/cover.jpg', bgUrl: SP + 'kenny/cover.jpg',
    songs: [
      sp('kenny',"1. Wesley's Theory.mp3","Wesley's Theory",'Kendrick Lamar'),
      sp('kenny','2. For Free_ - Interlude.mp3','For Free? (Interlude)','Kendrick Lamar'),
      sp('kenny','3. King Kunta.mp3','King Kunta','Kendrick Lamar'),
      sp('kenny','4. Institutionalized.mp3','Institutionalized','Kendrick Lamar'),
      sp('kenny','5. These Walls.mp3','These Walls','Kendrick Lamar'),
      sp('kenny','6. u.mp3','u','Kendrick Lamar'),
      sp('kenny','7. Alright.mp3','Alright','Kendrick Lamar'),
      sp('kenny','8. For Sale_ - Interlude.mp3','For Sale? (Interlude)','Kendrick Lamar'),
      sp('kenny','9. Momma.mp3','Momma','Kendrick Lamar'),
      sp('kenny','10. Hood Politics.mp3','Hood Politics','Kendrick Lamar'),
      sp('kenny','11. How Much A Dollar Cost.mp3','How Much a Dollar Cost','Kendrick Lamar'),
      sp('kenny','12. Complexion (A Zulu Love).mp3','Complexion (A Zulu Love)','Kendrick Lamar'),
      sp('kenny','13. The Blacker The Berry.mp3','The Blacker the Berry','Kendrick Lamar'),
      sp('kenny',"14. You Ain't Gotta Lie (Momma Said).mp3","You Ain't Gotta Lie (Momma Said)",'Kendrick Lamar'),
      sp('kenny','15. i.mp3','i','Kendrick Lamar'),
      sp('kenny','16. Mortal Man.mp3','Mortal Man','Kendrick Lamar'),
    ],
  },
  {
    id: 'taylor-midnights', title: 'Midnights', artist: 'Taylor Swift',
    year: '2022', genre: 'Pop / Synth-pop', accent: '#818cf8',
    artUrl: SP + 'taylor/cover.jpg', bgUrl: SP + 'taylor/cover.jpg',
    songs: [
      sp('taylor','1. Lavender Haze.mp3','Lavender Haze','Taylor Swift'),
      sp('taylor','2. Maroon.mp3','Maroon','Taylor Swift'),
      sp('taylor','3. Anti-Hero.mp3','Anti-Hero','Taylor Swift'),
      sp('taylor','4. Snow On The Beach (feat. Lana Del Rey).mp3','Snow On The Beach (ft. Lana Del Rey)','Taylor Swift'),
      sp('taylor',"5. You're On Your Own, Kid.mp3","You're On Your Own, Kid",'Taylor Swift'),
      sp('taylor','6. Midnight Rain.mp3','Midnight Rain','Taylor Swift'),
      sp('taylor','7. Question..._.mp3','Question...?','Taylor Swift'),
      sp('taylor','8. Vigilante Shit.mp3','Vigilante Shit','Taylor Swift'),
      sp('taylor','9. Bejeweled.mp3','Bejeweled','Taylor Swift'),
      sp('taylor','10. Labyrinth.mp3','Labyrinth','Taylor Swift'),
      sp('taylor','11. Karma.mp3','Karma','Taylor Swift'),
      sp('taylor','12. Sweet Nothing.mp3','Sweet Nothing','Taylor Swift'),
      sp('taylor','13. Mastermind.mp3','Mastermind','Taylor Swift'),
    ],
  },
  {
    id: 'weeknd-ah', title: 'After Hours', artist: 'The Weeknd',
    year: '2020', genre: 'R&B / Synth-pop', accent: '#dc2626',
    artUrl: SP + 'weeknd/cover.jpg', bgUrl: SP + 'weeknd/cover.jpg',
    songs: [
      sp('weeknd','1. Alone Again.mp3','Alone Again','The Weeknd'),
      sp('weeknd','2. Too Late.mp3','Too Late','The Weeknd'),
      sp('weeknd','3. Hardest To Love.mp3','Hardest To Love','The Weeknd'),
      sp('weeknd','4. Scared To Live.mp3','Scared To Live','The Weeknd'),
      sp('weeknd','5. Snowchild.mp3','Snowchild','The Weeknd'),
      sp('weeknd','6. Escape From LA.mp3','Escape From LA','The Weeknd'),
      sp('weeknd','7. Heartless.mp3','Heartless','The Weeknd'),
      sp('weeknd','8. Faith.mp3','Faith','The Weeknd'),
      sp('weeknd','9. Blinding Lights.mp3','Blinding Lights','The Weeknd'),
      sp('weeknd','10. In Your Eyes.mp3','In Your Eyes','The Weeknd'),
      sp('weeknd','11. Save Your Tears.mp3','Save Your Tears','The Weeknd'),
      sp('weeknd','12. Repeat After Me (Interlude).mp3','Repeat After Me (Interlude)','The Weeknd'),
      sp('weeknd','13. After Hours.mp3','After Hours','The Weeknd'),
      sp('weeknd','14. Until I Bleed Out.mp3','Until I Bleed Out','The Weeknd'),
    ],
  },
  GNX_DEFAULT,
];

/* ── State ──────────────────────────────────── */
let albums        = [];
let activeAlbum   = null;
let playerAlbum   = null;
let currentIndex  = 0;
let isPlaying     = false;
let isShuffle     = false;
let repeatMode    = 0;       // 0=off 1=all 2=one
let volume        = 0.7;
let isMuted       = false;
let playbackSpeed = 1;
let likedSongs    = {};
let seekDragging  = false;
let volDragging   = false;
let currentSyncedLyrics = null;
let activeLyricsLine    = -1;
let lyricsReadyPromise  = Promise.resolve();
let playIntentId        = 0;

/* Never makes playback wait more than this long on a slow/failed lyrics lookup. */
function withTimeout(promise, ms) {
  return Promise.race([
    Promise.resolve(promise),
    new Promise(function(resolve) { setTimeout(resolve, ms); }),
  ]);
}

const SPEEDS  = [0.5, 0.75, 1, 1.25, 1.5, 2];
let speedIdx  = 2;

const audio = new Audio();

/* ══════════════════════════════════════════════
   AUDIO ENGINE  (real VU meters + surface noise + tone)
══════════════════════════════════════════════ */
const ampSettings = Object.assign(
  { bass: 0, treble: 0, crackle: false },
  (function () { try { return JSON.parse(localStorage.getItem('soundroom_amp')) || {}; } catch (e) { return {}; } })()
);
function saveAmp() { try { localStorage.setItem('soundroom_amp', JSON.stringify(ampSettings)); } catch (e) {} }

let AC = null, srcNode = null, bassNode = null, trebleNode = null, analyser = null, freqData = null;
let noiseSrc = null, noiseGain = null, vuRaf = null, audioEngineFailed = false;

function initAudioEngine() {
  if (AC || audioEngineFailed) return;
  // On file:// a local media file is treated as cross-origin: routing it through
  // createMediaElementSource() taints the graph and SILENCES playback. Skip the
  // engine there so the audio still comes out; VU falls back to its CSS bounce.
  if (location.protocol === 'file:') { audioEngineFailed = true; return; }
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) { audioEngineFailed = true; return; }
    AC = new Ctx();
    srcNode    = AC.createMediaElementSource(audio);
    bassNode   = AC.createBiquadFilter();  bassNode.type   = 'lowshelf';  bassNode.frequency.value = 200;
    trebleNode = AC.createBiquadFilter();  trebleNode.type = 'highshelf'; trebleNode.frequency.value = 3200;
    analyser   = AC.createAnalyser();      analyser.fftSize = 128; analyser.smoothingTimeConstant = 0.82;
    freqData   = new Uint8Array(analyser.frequencyBinCount);

    srcNode.connect(bassNode);
    bassNode.connect(trebleNode);
    trebleNode.connect(analyser);
    analyser.connect(AC.destination);

    noiseGain = AC.createGain();
    noiseGain.gain.value = 0;
    noiseGain.connect(AC.destination);
    noiseSrc = AC.createBufferSource();
    noiseSrc.buffer = makeCrackleBuffer();
    noiseSrc.loop = true;
    noiseSrc.connect(noiseGain);
    noiseSrc.start();

    bassNode.gain.value   = ampSettings.bass;
    trebleNode.gain.value = ampSettings.treble;
    startVU();
  } catch (e) {
    audioEngineFailed = true;
    AC = null; srcNode = null; analyser = null;
  }
}

function resumeAC() { if (AC && AC.state === 'suspended') AC.resume().catch(function () {}); }

/* 4s of steady groove hiss with occasional dust pops */
function makeCrackleBuffer() {
  const len = Math.floor(AC.sampleRate * 4);
  const buf = AC.createBuffer(1, len, AC.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * 0.045;
  for (let p = 0; p < len; p++) {
    if (Math.random() < 0.0009) {
      const amp = Math.random() * 0.45 + 0.25;
      for (let j = 0; j < 80 && p + j < len; j++) {
        d[p + j] += amp * Math.exp(-j / 10) * (Math.random() * 2 - 1);
      }
    }
  }
  return buf;
}

/* crackle is only audible while the record actually turns */
function updateCrackleGain() {
  if (!noiseGain || !AC) return;
  const target = (ampSettings.crackle && isPlaying) ? 0.28 : 0;
  noiseGain.gain.setTargetAtTime(target, AC.currentTime, 0.15);
}

function startVU() {
  const viz = document.getElementById('visualizer');
  viz.classList.add('live');
  const bars = viz.querySelectorAll('.viz-bar');
  const n = bars.length;
  cancelAnimationFrame(vuRaf);
  (function frame() {
    vuRaf = requestAnimationFrame(frame);
    if (!analyser) return;
    analyser.getByteFrequencyData(freqData);
    const usable = Math.floor(freqData.length * 0.72);
    for (let i = 0; i < n; i++) {
      const src = Math.floor((i / n) * usable);
      let v = freqData[src] / 255;
      if (!isPlaying) v = 0.05 + 0.03 * Math.sin(performance.now() / 380 + i * 0.7);
      bars[i].style.transform = 'scaleY(' + Math.max(0.06, v).toFixed(3) + ')';
    }
  })();
}

/* ── Persistence ─────────────────────────────── */
function saveAlbums() {
  const saveable = albums.map(a => ({
    ...a,
    songs: a.songs.map(s => ({
      title: s.title, artist: s.artist,
      duration: s.duration, lyrics: s.lyrics,
      syncedLyrics: s.syncedLyrics || null,
      filePath: s.filePath || null,
      coverPath: s.coverPath || null,
    })),
    artPath: a.artPath || null,
    bgPath:  a.bgPath  || null,
  }));
  try { localStorage.setItem('albumStudio_albums', JSON.stringify(saveable)); } catch (e) {}
}

function loadStoredAlbums() {
  try {
    const raw = localStorage.getItem('albumStudio_albums');
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

function saveLiked() {
  try { localStorage.setItem('albumStudio_liked', JSON.stringify(likedSongs)); } catch (e) {}
}

function loadLiked() {
  try {
    const raw = localStorage.getItem('albumStudio_liked');
    if (raw) likedSongs = JSON.parse(raw);
  } catch (e) {}
}

function uid() { return Math.random().toString(36).slice(2, 9); }

function cloneAlbum(src) { return JSON.parse(JSON.stringify(src)); }

/* ── Spins (play count per album) ── */
function loadSpins() { try { return JSON.parse(localStorage.getItem('soundroom_spins')) || {}; } catch (e) { return {}; } }
function getSpins(id) { return loadSpins()[id] || 0; }
function bumpSpins(id) {
  var all = loadSpins();
  all[id] = (all[id] || 0) + 1;
  try { localStorage.setItem('soundroom_spins', JSON.stringify(all)); } catch (e) {}
}

/* ── Runtime helpers ── */
function durToSec(str) {
  if (!str) return 0;
  var p = String(str).split(':').map(Number);
  if (p.length === 2 && !isNaN(p[0]) && !isNaN(p[1])) return p[0] * 60 + p[1];
  if (p.length === 3 && p.every(function (n) { return !isNaN(n); })) return p[0] * 3600 + p[1] * 60 + p[2];
  return 0;
}
function fmtDur(sec) {
  var m = Math.floor(sec / 60), s = Math.round(sec % 60);
  return m + ':' + (s < 10 ? '0' : '') + s;
}
function albumRuntime(a) {
  var total = 0, unknown = false;
  a.songs.forEach(function (s) { var d = durToSec(s.duration); if (d) total += d; else unknown = true; });
  return total ? fmtDur(total) + (unknown ? '+' : '') : '';
}

/* ══════════════════════════════════════════════
   INIT
══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  loadLiked();
  initAlbums();
  buildVisualizer();
  bindStudioEvents();
  bindPlayerEvents();
  bindAudio();
  bindAmpControls();
  bindNumStepper();
  bindTrackDropdown();
  buildAlbumTabs();
  loadAlbumIntoStudio(activeAlbum);
});

/* ── Amp controls: crackle toggle + tone sliders ── */
function bindAmpControls() {
  var crk = document.getElementById('crackleBtn');
  var bs  = document.getElementById('bassSlider');
  var ts  = document.getElementById('trebleSlider');

  crk.setAttribute('aria-pressed', String(!!ampSettings.crackle));
  bs.value = ampSettings.bass;
  ts.value = ampSettings.treble;

  var noEngineOnFile = (location.protocol === 'file:');
  var ampRow = document.querySelector('.amp-row');
  if (noEngineOnFile && ampRow) {
    ampRow.classList.add('amp-disabled');
    ampRow.title = 'Crackle, tone and the live VU meters need the page served over http (open it through a local server, not the file itself).';
  }
  var hinted = false;
  function ampHint() {
    if (hinted) return; hinted = true;
    toast('Crackle & tone need the page served over http - not the local file');
  }

  crk.addEventListener('click', function () {
    ampSettings.crackle = !ampSettings.crackle;
    crk.setAttribute('aria-pressed', String(ampSettings.crackle));
    saveAmp();
    initAudioEngine();
    resumeAC();
    updateCrackleGain();
    if (ampSettings.crackle && audioEngineFailed) ampHint();
  });

  function tone(slider, node, key) {
    slider.addEventListener('input', function () {
      ampSettings[key] = parseInt(slider.value, 10) || 0;
      saveAmp();
      initAudioEngine();
      resumeAC();
      if (audioEngineFailed) { ampHint(); return; }
      if (node()) node().gain.setTargetAtTime(ampSettings[key], AC.currentTime, 0.02);
    });
  }
  tone(bs, function () { return bassNode; },   'bass');
  tone(ts, function () { return trebleNode; }, 'treble');
}

/* ── Brass number stepper (year) ── */
function bindNumStepper() {
  document.querySelectorAll('.num-stepper').forEach(function (wrap) {
    var input = wrap.querySelector('input[type="number"]');
    wrap.querySelectorAll('.num-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var step = parseInt(btn.dataset.step, 10) || 0;
        var min  = input.min !== '' ? +input.min : -Infinity;
        var max  = input.max !== '' ? +input.max : Infinity;
        var cur  = parseInt(input.value, 10);
        if (isNaN(cur)) cur = step > 0 ? min !== -Infinity ? min : new Date().getFullYear()
                                       : max !== Infinity ? max : new Date().getFullYear();
        else cur += step;
        input.value = Math.max(min, Math.min(max, cur));
        input.dispatchEvent(new Event('input', { bubbles: true }));
      });
    });
  });
}

/* ── Custom track dropdown for the lyric sheet ── */
function bindTrackDropdown() {
  var cs      = document.getElementById('lyricsSongCs');
  var trigger = cs.querySelector('.cs-trigger');
  var panel   = document.getElementById('lyricsSongPanel');
  var native  = document.getElementById('lyricsSongSel');

  trigger.addEventListener('click', function (e) {
    e.stopPropagation();
    cs.classList.toggle('open');
    trigger.setAttribute('aria-expanded', String(cs.classList.contains('open')));
  });
  document.addEventListener('click', function (e) {
    if (!cs.contains(e.target)) { cs.classList.remove('open'); trigger.setAttribute('aria-expanded', 'false'); }
  });
  panel.addEventListener('click', function (e) {
    var opt = e.target.closest('.cs-opt');
    if (!opt) return;
    native.value = opt.dataset.value;
    native.dispatchEvent(new Event('change', { bubbles: true }));
    syncTrackDropdown();
    cs.classList.remove('open');
    trigger.setAttribute('aria-expanded', 'false');
  });
}

/* rebuild the custom panel from the (hidden) native select */
function syncTrackDropdown() {
  var native  = document.getElementById('lyricsSongSel');
  var panel   = document.getElementById('lyricsSongPanel');
  var valueEl = document.querySelector('#lyricsSongCs .cs-value');
  var opts = Array.prototype.map.call(native.options, function (o) {
    return '<li class="cs-opt' + (o.value === native.value ? ' active' : '') +
           '" role="option" data-value="' + o.value + '">' + esc(o.textContent) + '</li>';
  }).join('');
  panel.innerHTML = opts;
  var sel = native.options[native.selectedIndex];
  valueEl.textContent = sel ? sel.textContent : '-';
}

function initAlbums() {
  const stored = loadStoredAlbums();
  if (stored && stored.length) {
    albums = stored;
    // Re-hydrate file paths for presets (blob URLs don't persist across sessions)
    albums.forEach(a => {
      const preset = PRESET_ALBUMS.find(p => p.id === a.id);
      if (preset) {
        a.songs.forEach((s, i) => {
          if (!s.file  || s.file.startsWith('blob:'))  s.file  = preset.songs[i] ? preset.songs[i].file  : '';
          if (!s.cover || s.cover.startsWith('blob:')) s.cover = preset.songs[i] ? preset.songs[i].cover : '';
        });
        if (!a.artUrl || a.artUrl.startsWith('blob:')) a.artUrl = preset.artUrl;
        if (!a.bgUrl  || a.bgUrl.startsWith('blob:'))  a.bgUrl  = preset.bgUrl;
      }
    });
    // Add any preset albums that aren't in stored data yet
    PRESET_ALBUMS.forEach(preset => {
      if (!albums.find(a => a.id === preset.id)) {
        albums.push(cloneAlbum(preset));
      }
    });
  } else {
    albums = PRESET_ALBUMS.map(p => cloneAlbum(p));
  }
  activeAlbum = albums[0];
}

/* ══════════════════════════════════════════════
   STUDIO - album tabs
══════════════════════════════════════════════ */
function buildAlbumTabs() {
  const tabs = document.getElementById('albumTabs');
  tabs.innerHTML = '';
  albums.forEach(function(a) {
    var btn = document.createElement('button');
    btn.className = 'album-tab' + (a.id === activeAlbum.id ? ' active' : '');
    btn.dataset.id = a.id;
    btn.style.setProperty('--wear', Math.min(1, getSpins(a.id) / 16).toFixed(2));
    var sp = getSpins(a.id);
    btn.title = a.title || 'Untitled';
    if (sp) btn.title += ' - ' + sp + (sp === 1 ? ' spin' : ' spins');
    btn.innerHTML = esc(a.title || 'Untitled') + ' <span class="tab-del" data-del="' + a.id + '">✕</span>';
    tabs.appendChild(btn);
  });
}

document.getElementById('albumTabs').addEventListener('click', function(e) {
  var del = e.target.closest('[data-del]');
  if (del) {
    var delId = del.dataset.del;
    if (albums.length === 1) { toast('At least one album is required'); return; }
    albums = albums.filter(function(a) { return a.id !== delId; });
    if (activeAlbum.id === delId) activeAlbum = albums[0];
    saveAlbums();
    buildAlbumTabs();
    loadAlbumIntoStudio(activeAlbum);
    return;
  }
  var tab = e.target.closest('.album-tab');
  if (!tab) return;
  var found = albums.find(function(a) { return a.id === tab.dataset.id; });
  if (found) {
    saveCurrentAlbumFromUI();
    activeAlbum = found;
    buildAlbumTabs();
    loadAlbumIntoStudio(activeAlbum);
  }
});

document.getElementById('newAlbumBtn').addEventListener('click', function() {
  saveCurrentAlbumFromUI();
  var blank = {
    id: uid(), title: 'New Album', artist: '', year: '', genre: '',
    accent: '#e8933a', artUrl: '', bgUrl: '', songs: [],
  };
  albums.push(blank);
  activeAlbum = blank;
  buildAlbumTabs();
  loadAlbumIntoStudio(activeAlbum);
  document.getElementById('inputTitle').focus();
  saveAlbums();
});

/* ══════════════════════════════════════════════
   STUDIO - load album into UI
══════════════════════════════════════════════ */
function loadAlbumIntoStudio(a) {
  var preview     = document.getElementById('artPreview');
  var placeholder = document.getElementById('artPlaceholder');
  if (a.artUrl) {
    preview.src = a.artUrl;
    preview.classList.remove('hidden');
    placeholder.classList.add('hidden');
  } else {
    preview.src = '';
    preview.classList.add('hidden');
    placeholder.classList.remove('hidden');
  }

  var bgPrev  = document.getElementById('bgPreview');
  var bgLabel = document.getElementById('bgLabel');
  if (a.bgUrl) {
    bgPrev.src = a.bgUrl;
    bgPrev.classList.remove('hidden');
    bgLabel.style.display = 'none';
  } else {
    bgPrev.classList.add('hidden');
    bgLabel.style.display = '';
  }

  document.getElementById('inputTitle').value  = a.title  || '';
  document.getElementById('inputArtist').value = a.artist || '';
  document.getElementById('inputYear').value   = a.year   || '';
  document.getElementById('inputGenre').value  = a.genre  || '';
  document.getElementById('inputNotes').value  = a.notes  || '';

  document.querySelectorAll('.swatch[data-color]').forEach(function(s) { s.classList.remove('active'); });
  var match = Array.from(document.querySelectorAll('.swatch[data-color]')).find(function(s) {
    return s.dataset.color === a.accent;
  });
  if (match) match.classList.add('active');
  setAccent(a.accent || '#e8933a');
  applyAutoAccentFromArt(a, a.artUrl);

  renderSongList(a.songs);
}

/* ══════════════════════════════════════════════
   STUDIO - bind events
══════════════════════════════════════════════ */
function bindStudioEvents() {
  var artZone  = document.getElementById('artZone');
  var artInput = document.getElementById('artInput');
  artZone.addEventListener('click', function() { artInput.click(); });
  artInput.addEventListener('change', function(e) { handleArtFile(e.target.files[0]); });
  artZone.addEventListener('dragover',  function(e) { e.preventDefault(); artZone.classList.add('dragover'); });
  artZone.addEventListener('dragleave', function()  { artZone.classList.remove('dragover'); });
  artZone.addEventListener('drop', function(e) {
    e.preventDefault(); artZone.classList.remove('dragover');
    handleArtFile(e.dataTransfer.files[0]);
  });

  var bgZone  = document.getElementById('bgZone');
  var bgInput = document.getElementById('bgInput');
  bgZone.addEventListener('click', function() { bgInput.click(); });
  bgInput.addEventListener('change', function(e) { handleBgFile(e.target.files[0]); });

  ['inputTitle','inputArtist','inputYear','inputGenre','inputNotes'].forEach(function(id) {
    document.getElementById(id).addEventListener('input', saveCurrentAlbumFromUI);
  });

  document.getElementById('colorSwatches').addEventListener('click', function(e) {
    var sw = e.target.closest('.swatch');
    if (!sw) return;
    document.querySelectorAll('.swatch').forEach(function(s) { s.classList.remove('active'); });
    sw.classList.add('active');
    var color = sw.dataset.color || document.getElementById('customColor').value;
    activeAlbum.accent     = color;
    activeAlbum.accentAuto = false; // user's manual pick wins over the cover-derived colour
    setAccent(color);
    saveAlbums();
  });

  document.getElementById('customColor').addEventListener('input', function(e) {
    var color = e.target.value;
    var sw    = e.target.closest('.swatch');
    document.querySelectorAll('.swatch').forEach(function(s) { s.classList.remove('active'); });
    if (sw) { sw.classList.add('active'); sw.dataset.color = color; }
    activeAlbum.accent     = color;
    activeAlbum.accentAuto = false; // user's manual pick wins over the cover-derived colour
    setAccent(color);
    saveAlbums();
  });

  var songDropZone = document.getElementById('songDropZone');
  var songInput    = document.getElementById('songInput');
  songDropZone.addEventListener('click', function() { songInput.click(); });
  songInput.addEventListener('change', function(e) { addSongFiles(e.target.files); });
  songDropZone.addEventListener('dragover',  function(e) { e.preventDefault(); songDropZone.classList.add('dragover'); });
  songDropZone.addEventListener('dragleave', function()  { songDropZone.classList.remove('dragover'); });
  songDropZone.addEventListener('drop', function(e) {
    e.preventDefault(); songDropZone.classList.remove('dragover');
    addSongFiles(e.dataTransfer.files);
  });

  document.getElementById('addMoreInput').addEventListener('change', function(e) {
    addSongFiles(e.target.files);
  });

  document.getElementById('clearAllBtn').addEventListener('click', function() {
    if (!activeAlbum.songs.length) return;
    if (!confirm('Clear all songs from this album?')) return;
    activeAlbum.songs = [];
    renderSongList([]);
    saveAlbums();
  });

  document.getElementById('launchBtn').addEventListener('click', launchPlayer);

  document.getElementById('lyricsModalClose').addEventListener('click', closeLyricsModal);
  document.getElementById('lyricsModal').addEventListener('click', function(e) {
    if (e.target === document.getElementById('lyricsModal')) closeLyricsModal();
  });
  document.getElementById('lyricsSave').addEventListener('click', saveLyricsFromModal);
  document.getElementById('lyricsSongSel').addEventListener('change', function(e) {
    var idx = parseInt(e.target.value);
    document.getElementById('lyricsTextarea').value = (activeAlbum.songs[idx] && activeAlbum.songs[idx].lyrics) || '';
  });
}

function handleArtFile(file) {
  if (!file || !file.type.startsWith('image/')) return;
  var url = URL.createObjectURL(file);
  activeAlbum.artUrl = url;
  // a freshly chosen cover always gets to re-theme the room, even if an
  // older cover's colour had been manually overridden
  activeAlbum.accentAuto = true;
  document.getElementById('artPreview').src = url;
  document.getElementById('artPreview').classList.remove('hidden');
  document.getElementById('artPlaceholder').classList.add('hidden');
  applyAutoAccentFromArt(activeAlbum, url);
  saveAlbums();
}

function handleBgFile(file) {
  if (!file || !file.type.startsWith('image/')) return;
  var url = URL.createObjectURL(file);
  activeAlbum.bgUrl = url;
  document.getElementById('bgPreview').src = url;
  document.getElementById('bgPreview').classList.remove('hidden');
  document.getElementById('bgLabel').style.display = 'none';
  saveAlbums();
}

function saveCurrentAlbumFromUI() {
  if (!activeAlbum) return;
  activeAlbum.title  = document.getElementById('inputTitle').value;
  activeAlbum.artist = document.getElementById('inputArtist').value;
  activeAlbum.year   = document.getElementById('inputYear').value;
  activeAlbum.genre  = document.getElementById('inputGenre').value;
  activeAlbum.notes  = document.getElementById('inputNotes').value;
  saveAlbums();
  var tab = document.querySelector('.album-tab[data-id="' + activeAlbum.id + '"]');
  if (tab) tab.firstChild.textContent = (activeAlbum.title || 'Untitled') + ' ';
}

/* ── Song ingestion ─────────────────────────── */
function addSongFiles(files) {
  var arr = Array.from(files).filter(function(f) { return f.type.startsWith('audio/'); });
  if (!arr.length) { toast('No audio files found'); return; }

  arr.forEach(function(f) {
    var url  = URL.createObjectURL(f);
    var name = f.name.replace(/\.[^.]+$/, '').replace(/^\d+[-_. ]+/, '');
    var song = {
      title: name, artist: activeAlbum.artist || 'Unknown Artist',
      file: url, cover: '', duration: '-', lyrics: '',
    };
    activeAlbum.songs.push(song);
    var idx = activeAlbum.songs.length - 1;
    loadAudioDuration(url).then(function(dur) {
      song.duration = fmtTime(dur);
      updateRowDuration(idx);
    });
  });

  document.getElementById('songDropZone').classList.add('hidden');
  renderSongList(activeAlbum.songs);
  updateSongCount();
  saveAlbums();
  toast(arr.length + ' song' + (arr.length > 1 ? 's' : '') + ' added');
}

function loadAudioDuration(url) {
  return new Promise(function(resolve) {
    var a = new Audio();
    a.addEventListener('loadedmetadata', function() { resolve(a.duration); });
    a.addEventListener('error', function() { resolve(0); });
    a.src = url;
  });
}

function updateRowDuration(idx) {
  var row = document.querySelector('.song-build-row[data-idx="' + idx + '"]');
  if (row) {
    var dur = row.querySelector('.sbr-duration');
    if (dur && activeAlbum.songs[idx]) dur.textContent = activeAlbum.songs[idx].duration || '-';
  }
}

/* ── Render song list ─────────────────────────── */
function renderSongList(songs) {
  var list = document.getElementById('songBuilderList');
  var drop = document.getElementById('songDropZone');
  if (!songs.length) {
    drop.classList.remove('hidden');
    list.innerHTML = '';
    updateSongCount();
    return;
  }
  drop.classList.add('hidden');
  list.innerHTML = songs.map(function(s, i) { return songRowHTML(s, i); }).join('');
  updateSongCount();
  attachRowEvents();
}

function songRowHTML(s, i) {
  var cover = s.cover || '';
  var coverHtml = cover
    ? '<img src="' + esc(cover) + '" alt="" />'
    : '<i class="fa-solid fa-image"></i>';
  var fileName = '';
  if (s.file && typeof s.file === 'string') {
    fileName = s.file.split('/').pop().split('?')[0].slice(0, 40);
  }
  return '<div class="song-build-row" data-idx="' + i + '" draggable="true">' +
    '<span class="sbr-drag"><i class="fa-solid fa-grip-vertical"></i></span>' +
    '<span class="sbr-num">' + (i + 1) + '</span>' +
    '<div class="sbr-cover-zone" data-cover="' + i + '">' + coverHtml + '</div>' +
    '<div class="sbr-info">' +
      '<input class="sbr-title-input" data-title="' + i + '" value="' + esc(s.title) + '" placeholder="Track title" />' +
      '<div class="sbr-file-name">' + esc(fileName) + '</div>' +
    '</div>' +
    '<button class="sbr-lyrics-btn ' + (s.lyrics ? 'has-lyrics' : '') + '" data-lyrics="' + i + '" title="Edit lyrics">' +
      '<i class="fa-solid fa-align-left"></i>' +
    '</button>' +
    '<span class="sbr-duration">' + (s.duration || '-') + '</span>' +
    '<button class="sbr-del" data-del="' + i + '" title="Remove"><i class="fa-solid fa-xmark"></i></button>' +
  '</div>';
}

function attachRowEvents() {
  document.querySelectorAll('.sbr-title-input').forEach(function(inp) {
    inp.addEventListener('input', function(e) {
      var idx = parseInt(e.target.dataset.title);
      if (activeAlbum.songs[idx]) activeAlbum.songs[idx].title = e.target.value;
      saveAlbums();
    });
  });

  document.querySelectorAll('.sbr-cover-zone').forEach(function(zone) {
    zone.addEventListener('click', function() {
      var idx = parseInt(zone.dataset.cover);
      var fi  = document.createElement('input');
      fi.type = 'file'; fi.accept = 'image/*';
      fi.onchange = function() {
        var file = fi.files[0];
        if (!file) return;
        var url = URL.createObjectURL(file);
        activeAlbum.songs[idx].cover = url;
        zone.innerHTML = '<img src="' + url + '" alt="" />';
        saveAlbums();
      };
      fi.click();
    });
  });

  document.querySelectorAll('.sbr-lyrics-btn').forEach(function(btn) {
    btn.addEventListener('click', function() { openLyricsModal(parseInt(btn.dataset.lyrics)); });
  });

  document.querySelectorAll('.sbr-del').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var idx = parseInt(btn.dataset.del);
      activeAlbum.songs.splice(idx, 1);
      renderSongList(activeAlbum.songs);
      saveAlbums();
    });
  });

  var dragSrc = null;
  document.querySelectorAll('.song-build-row').forEach(function(row) {
    row.addEventListener('dragstart', function() { dragSrc = row; row.classList.add('dragging'); });
    row.addEventListener('dragend',   function() { row.classList.remove('dragging'); dragSrc = null; });
    row.addEventListener('dragover',  function(e) { e.preventDefault(); });
    row.addEventListener('drop', function(e) {
      e.preventDefault();
      if (!dragSrc || dragSrc === row) return;
      var fromIdx = parseInt(dragSrc.dataset.idx);
      var toIdx   = parseInt(row.dataset.idx);
      var moved   = activeAlbum.songs.splice(fromIdx, 1)[0];
      activeAlbum.songs.splice(toIdx, 0, moved);
      renderSongList(activeAlbum.songs);
      saveAlbums();
    });
  });
}

function updateSongCount() {
  document.getElementById('songCount').textContent = (activeAlbum && activeAlbum.songs) ? activeAlbum.songs.length : 0;
}

/* ── Lyrics modal ─────────────────────────────── */
function openLyricsModal(songIdx) {
  if (!activeAlbum.songs.length) return;
  var sel = document.getElementById('lyricsSongSel');
  sel.innerHTML = activeAlbum.songs.map(function(s, i) {
    return '<option value="' + i + '"' + (i === songIdx ? ' selected' : '') + '>' + esc(s.title || ('Track ' + (i + 1))) + '</option>';
  }).join('');
  sel.value = String(songIdx);
  syncTrackDropdown();
  document.getElementById('lyricsTextarea').value = (activeAlbum.songs[songIdx] && activeAlbum.songs[songIdx].lyrics) || '';
  document.getElementById('lyricsModal').classList.remove('hidden');
}

function closeLyricsModal() {
  document.getElementById('lyricsModal').classList.add('hidden');
}

function saveLyricsFromModal() {
  var idx  = parseInt(document.getElementById('lyricsSongSel').value);
  var text = document.getElementById('lyricsTextarea').value;
  if (activeAlbum.songs[idx]) {
    activeAlbum.songs[idx].lyrics = text;
    activeAlbum.songs[idx].syncedLyrics = null;
    saveAlbums();
    renderSongList(activeAlbum.songs);
    toast('Lyrics saved');
  }
  closeLyricsModal();
}

/* ══════════════════════════════════════════════
   PLAYER - launch
══════════════════════════════════════════════ */
function launchPlayer() {
  saveCurrentAlbumFromUI();
  if (!activeAlbum.songs.length) { toast('Press at least one track before it goes on the deck'); return; }

  playerAlbum  = activeAlbum;
  currentIndex = 0;
  isShuffle    = false;
  repeatMode   = 0;
  speedIdx     = 2;
  playbackSpeed= 1;

  bumpSpins(playerAlbum.id);

  document.getElementById('studioView').classList.add('hidden');
  document.getElementById('playerView').classList.remove('hidden');

  renderPlayerUI();
  loadTrack(0, false);
}

function renderPlayerUI() {
  var a = playerAlbum;
  document.getElementById('topbarAlbumName').textContent = a.title  || 'Untitled';
  document.getElementById('topbarArtist').textContent    = a.artist || 'Unknown';
  document.getElementById('tlAlbumName').textContent     = a.title  || 'Untitled';
  document.getElementById('tlArtist').textContent        = a.artist || 'Unknown';
  document.getElementById('tlYearGenre').textContent     = [a.year, a.genre].filter(Boolean).join(' · ') || '-';
  var tlImg = document.getElementById('tlCoverImg');
  tlImg.src = a.artUrl || (a.songs[0] ? a.songs[0].cover : '') || '';

  renderAbout();
  renderTracklist();
  renderQueue();
  applyBackground();
  setAccent(a.accent || '#e8933a');
  updateShuffleBtn();
  updateRepeatBtn();
  updateSpeedBtn();
  audio.volume = isMuted ? 0 : volume;
  setVolFill(volume * 100);
  updateVolIcon();
}

function applyBackground() {
  var bg = (playerAlbum && (playerAlbum.bgUrl || playerAlbum.artUrl)) || '';
  document.getElementById('playerBg').style.backgroundImage = bg ? 'url("' + bg + '")' : 'none';
}

/* ── Load track ──────────────────────────────── */
function loadTrack(idx, autoplay) {
  var songs = playerAlbum.songs;
  if (!songs.length) return;
  currentIndex = ((idx % songs.length) + songs.length) % songs.length;
  var song = songs[currentIndex];

  audio.src = song.file || '';
  audio.volume = isMuted ? 0 : volume;
  audio.playbackRate = playbackSpeed;

  document.getElementById('stageTitle').textContent  = song.title  || ('Track ' + (currentIndex + 1));
  document.getElementById('stageArtist').textContent = song.artist || playerAlbum.artist || '';
  document.getElementById('vinylArtImg').src = song.cover || playerAlbum.artUrl || '';

  document.querySelectorAll('.track-item').forEach(function(r, i) {
    r.classList.toggle('active', i === currentIndex);
    var bars = r.querySelector('.ti-playing');
    if (bars) bars.classList.toggle('hidden', i !== currentIndex);
  });

  document.querySelectorAll('.queue-item').forEach(function(r, i) {
    r.classList.toggle('active', i === currentIndex);
  });

  setSeekFill(0);
  document.getElementById('timeNow').textContent   = '0:00';
  document.getElementById('timeTotal').textContent = song.duration || '0:00';

  updateLikeBtn();
  setPlayState(false);

  var trackAtRequest = currentIndex;
  var myIntent        = ++playIntentId;
  lyricsReadyPromise = withTimeout(renderLyricsPanel(currentIndex), 4000);

  if (autoplay) {
    initAudioEngine();
    resumeAC();
    lyricsReadyPromise.then(function() {
      if (currentIndex !== trackAtRequest || myIntent !== playIntentId) return;
      audio.play().then(function() { setPlayState(true); }).catch(function() { setPlayState(false); });
    });
  }
}

function setPlayState(playing) {
  isPlaying = playing;
  var ico   = document.getElementById('playIco');
  var vinyl = document.getElementById('vinylDisc');
  var tonearm = document.getElementById('tonearm');
  ico.className = playing ? 'fa-solid fa-pause' : 'fa-solid fa-play';
  vinyl.classList.toggle('playing', playing);
  tonearm.classList.toggle('on-disc', playing);
  document.querySelectorAll('.viz-bar').forEach(function(b) { b.classList.toggle('playing', playing); });
  var bars = document.querySelector('.track-item[data-idx="' + currentIndex + '"] .ti-playing');
  if (bars) bars.classList.toggle('paused', !playing);
  if (playing) resumeAC();
  updateCrackleGain();
}

function setSeekFill(pct) {
  pct = Math.max(0, Math.min(100, pct));
  document.getElementById('seekFill').style.width = pct + '%';
  document.getElementById('seekThumb').style.left = pct + '%';
}

function setVolFill(pct) {
  pct = Math.max(0, Math.min(100, pct));
  document.getElementById('volFill').style.width  = pct + '%';
  document.getElementById('volThumb').style.left  = pct + '%';
}

function fmtTime(s) {
  if (!isFinite(s) || s < 0) return '0:00';
  var m   = Math.floor(s / 60);
  var sec = Math.floor(s % 60);
  return m + ':' + (sec < 10 ? '0' : '') + sec;
}

/* ── Tracklist / Queue / About ────────────────── */
function renderTracklist() {
  var list = document.getElementById('tracklistEl');
  // Side B starts halfway through, like a real pressing
  var sideBStart = playerAlbum.songs.length >= 4
    ? Math.ceil(playerAlbum.songs.length / 2)
    : -1;
  function sideMeta(from, to) {
    var arr = playerAlbum.songs.slice(from, to);
    var sec = arr.reduce(function (t, s) { return t + durToSec(s.duration); }, 0);
    return arr.length + (arr.length === 1 ? ' track' : ' tracks') + (sec ? ' · ' + fmtDur(sec) : '');
  }
  function sideTag(name, from, to) {
    return '<div class="side-divider">' + name + '<span class="sd-meta">' + sideMeta(from, to) + '</span></div>';
  }
  renderTracklist._sideBStart = sideBStart;
  list.innerHTML = playerAlbum.songs.map(function(s, i) {
    var cover = s.cover || playerAlbum.artUrl || '';
    var divider = '';
    if (i === 0 && sideBStart !== -1) divider = sideTag('Side A', 0, sideBStart);
    else if (i === sideBStart)        divider = sideTag('Side B', sideBStart, playerAlbum.songs.length);
    return divider + '<div class="track-item" data-idx="' + i + '">' +
      '<span class="ti-num">' + (i + 1) + '</span>' +
      '<div class="ti-cover"><img src="' + esc(cover) + '" alt="" onerror="this.src=\'\'" /></div>' +
      '<div class="ti-info">' +
        '<div class="ti-title">' + esc(s.title || ('Track ' + (i + 1))) + '</div>' +
        '<div class="ti-artist">' + esc(s.artist || playerAlbum.artist || '') + '</div>' +
      '</div>' +
      '<div class="ti-playing' + (i !== currentIndex ? ' hidden' : '') + '">' +
        '<div class="ti-bar"></div><div class="ti-bar"></div><div class="ti-bar"></div><div class="ti-bar"></div>' +
      '</div>' +
      '<span class="ti-dur">' + (s.duration || '-') + '</span>' +
    '</div>';
  }).join('');

  list.querySelectorAll('.track-item').forEach(function(row) {
    row.addEventListener('click', function() { loadTrack(parseInt(row.dataset.idx), true); });
  });
}

/* refresh just the Side A/B counts+timing without rebuilding the list */
function renderTracklistMeta() {
  var start = renderTracklist._sideBStart;
  if (start === undefined || !playerAlbum) return;
  var metas = document.querySelectorAll('#tracklistEl .side-divider .sd-meta');
  if (metas.length < 1) return;
  function meta(from, to) {
    var arr = playerAlbum.songs.slice(from, to);
    var sec = arr.reduce(function (t, s) { return t + durToSec(s.duration); }, 0);
    return arr.length + (arr.length === 1 ? ' track' : ' tracks') + (sec ? ' · ' + fmtDur(sec) : '');
  }
  metas[0].textContent = meta(0, start === -1 ? playerAlbum.songs.length : start);
  if (metas[1] && start !== -1) metas[1].textContent = meta(start, playerAlbum.songs.length);
}

function renderQueue() {
  var qlist = document.getElementById('queueList');
  qlist.innerHTML = playerAlbum.songs.map(function(s, i) {
    var cover = s.cover || playerAlbum.artUrl || '';
    return '<div class="queue-item" data-idx="' + i + '">' +
      '<div class="qi-cover"><img src="' + esc(cover) + '" alt="" onerror="this.src=\'\'" /></div>' +
      '<div><div class="qi-title">' + esc(s.title || ('Track ' + (i + 1))) + '</div>' +
      '<div class="qi-artist">' + esc(s.artist || playerAlbum.artist || '') + '</div></div>' +
      '<span class="qi-dur">' + (s.duration || '-') + '</span>' +
    '</div>';
  }).join('');
  qlist.querySelectorAll('.queue-item').forEach(function(row) {
    row.addEventListener('click', function() { loadTrack(parseInt(row.dataset.idx), true); });
  });
}

function renderAbout() {
  var a = playerAlbum;
  var runtime = albumRuntime(a);
  var spins = getSpins(a.id);
  document.getElementById('aboutPanel').innerHTML =
    '<div class="about-cover"><img src="' + esc(a.artUrl || '') + '" alt="" onerror="this.src=\'\'" /></div>' +
    '<div class="about-title">' + esc(a.title || 'Untitled') + '</div>' +
    '<div class="about-artist">' + esc(a.artist || 'Unknown Artist') + '</div>' +
    '<div class="about-stats">' +
      '<div class="stat-row"><span class="stat-label">Year</span><span class="stat-value">' + esc(a.year || '-') + '</span></div>' +
      '<div class="stat-row"><span class="stat-label">Genre</span><span class="stat-value">' + esc(a.genre || '-') + '</span></div>' +
      '<div class="stat-row"><span class="stat-label">Tracks</span><span class="stat-value">' + a.songs.length + '</span></div>' +
      (runtime ? '<div class="stat-row"><span class="stat-label">Runtime</span><span class="stat-value">' + runtime + '</span></div>' : '') +
      '<div class="stat-row"><span class="stat-label">Spins</span><span class="stat-value">' + spins + '</span></div>' +
    '</div>' +
    (a.notes ? '<div class="about-notes">' + esc(a.notes) + '</div>' : '');
}

function renderLyricsPanel(idx) {
  var song = playerAlbum && playerAlbum.songs && playerAlbum.songs[idx];
  currentSyncedLyrics = null;
  activeLyricsLine    = -1;
  var disp = document.getElementById('lyricsDisplay');

  if (song && song.syncedLyrics && song.syncedLyrics.length) {
    currentSyncedLyrics = song.syncedLyrics;
    renderSyncedLyrics(song.syncedLyrics);
    updateSyncedLyricsHighlight();
    return Promise.resolve();
  }

  var lyrics = song && song.lyrics && song.lyrics.trim();
  if (lyrics) {
    disp.innerHTML = '<div class="lyrics-text">' + escLines(lyrics) + '</div>';
    return Promise.resolve();
  } else if (song && song.title && song.artist) {
    disp.innerHTML =
      '<div class="lyrics-empty">' +
        '<i class="fa-solid fa-spinner fa-spin"></i>' +
        '<p>Looking up lyrics&hellip;</p>' +
      '</div>';
    return fetchLyricsOnline(song, idx);
  } else {
    renderLyricsEmpty(idx, false);
    return Promise.resolve();
  }
}

/* karaoke-style line-synced lyrics */
function renderSyncedLyrics(lines) {
  var disp = document.getElementById('lyricsDisplay');
  disp.innerHTML =
    '<div class="lyrics-synced" id="syncedLyricsWrap">' +
      '<p class="lyrics-line lyrics-pad" aria-hidden="true">&nbsp;</p>' +
      lines.map(function(l) {
        return '<p class="lyrics-line" data-time="' + l.time + '">' + (esc(l.text) || '&nbsp;') + '</p>';
      }).join('') +
      '<p class="lyrics-line lyrics-pad" aria-hidden="true">&nbsp;</p>' +
    '</div>';
}

function updateSyncedLyricsHighlight() {
  if (!currentSyncedLyrics || !currentSyncedLyrics.length) return;
  var t   = audio.currentTime;
  var idx = -1;
  for (var i = 0; i < currentSyncedLyrics.length; i++) {
    if (currentSyncedLyrics[i].time <= t) idx = i; else break;
  }
  if (idx === activeLyricsLine) return;
  activeLyricsLine = idx;

  var wrap = document.getElementById('syncedLyricsWrap');
  if (!wrap) return;
  var lines = wrap.querySelectorAll('.lyrics-line:not(.lyrics-pad)');
  lines.forEach(function(el, i) {
    el.classList.toggle('active', i === idx);
    el.classList.toggle('sung', i < idx);
  });
  if (idx >= 0 && lines[idx]) {
    scrollLyricLineIntoView(lines[idx]);
  }
}

/* Scrolls only the lyrics booklet itself - never scrollIntoView(), which
   walks every scrollable ancestor (including the page) and visibly
   shifts the whole layout when a new karaoke line becomes active. */
function scrollLyricLineIntoView(el) {
  var container = document.getElementById('tabLyrics');
  if (!container) return;
  var elRect   = el.getBoundingClientRect();
  var contRect = container.getBoundingClientRect();
  var delta    = (elRect.top - contRect.top) - (container.clientHeight / 2) + (elRect.height / 2);
  container.scrollTo({ top: container.scrollTop + delta, behavior: 'smooth' });
}

function renderLyricsEmpty(idx, failed) {
  if (currentIndex !== idx) return;
  var disp = document.getElementById('lyricsDisplay');
  disp.innerHTML =
    '<div class="lyrics-empty">' +
      '<i class="fa-solid fa-align-left"></i>' +
      '<p>' + (failed ? 'Couldn&rsquo;t find lyrics online' : 'No lyrics added') + '</p>' +
      '<button class="lyrics-edit-btn" id="lyricsEditBtn">Add manually</button>' +
    '</div>';
  var eb = document.getElementById('lyricsEditBtn');
  if (eb) eb.addEventListener('click', function() {
    backToStudio();
    setTimeout(function() { openLyricsModal(idx); }, 300);
  });
}

/* Free, key-less, CORS-open lyrics lookup - personal-use convenience only.
   Tries lrclib.net first for line-synced (karaoke) lyrics, falls back to
   plain unsynced lyrics from lyrics.ovh if no synced match is found. */
function fetchLyricsOnline(song, idx) {
  return fetchSyncedLyrics(song)
    .then(function(result) {
      if (currentIndex !== idx) return;
      if (result && result.synced && result.synced.length) {
        song.syncedLyrics = result.synced;
        if (result.plain) song.lyrics = result.plain;
        saveAlbums();
        return renderLyricsPanel(idx);
      }
      if (result && result.plain) {
        song.lyrics = result.plain;
        saveAlbums();
        document.getElementById('lyricsDisplay').innerHTML = '<div class="lyrics-text">' + escLines(result.plain) + '</div>';
        return;
      }
      return fetchPlainLyricsFallback(song, idx);
    })
    .catch(function() { return fetchPlainLyricsFallback(song, idx); });
}

function fetchSyncedLyrics(song) {
  var qs = 'track_name=' + encodeURIComponent(song.title) + '&artist_name=' + encodeURIComponent(song.artist);
  return fetch('https://lrclib.net/api/get?' + qs)
    .then(function(res) { return res.ok ? res.json() : null; })
    .then(function(data) {
      if (data && (data.syncedLyrics || data.plainLyrics)) {
        return { synced: data.syncedLyrics ? parseLRC(data.syncedLyrics) : null, plain: data.plainLyrics || null };
      }
      return fetch('https://lrclib.net/api/search?' + qs)
        .then(function(res) { return res.ok ? res.json() : []; })
        .then(function(list) {
          var hit = Array.isArray(list) ? list.find(function(r) { return r.syncedLyrics || r.plainLyrics; }) : null;
          if (!hit) return null;
          return { synced: hit.syncedLyrics ? parseLRC(hit.syncedLyrics) : null, plain: hit.plainLyrics || null };
        });
    })
    .catch(function() { return null; });
}

function fetchPlainLyricsFallback(song, idx) {
  var url = 'https://api.lyrics.ovh/v1/' + encodeURIComponent(song.artist) + '/' + encodeURIComponent(song.title);
  return fetch(url)
    .then(function(res) { return res.ok ? res.json() : null; })
    .then(function(data) {
      if (currentIndex !== idx) return;
      var text = data && data.lyrics ? data.lyrics.replace(/\r\n/g, '\n').trim() : '';
      if (text) {
        song.lyrics = text;
        saveAlbums();
        document.getElementById('lyricsDisplay').innerHTML = '<div class="lyrics-text">' + escLines(text) + '</div>';
      } else {
        renderLyricsEmpty(idx, true);
      }
    })
    .catch(function() { renderLyricsEmpty(idx, true); });
}

/* Parses standard .lrc timestamp lines: [mm:ss.xx]text (multiple stamps per line allowed) */
function parseLRC(lrc) {
  var re  = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/g;
  var out = [];
  lrc.split('\n').forEach(function(line) {
    var stamps = [];
    var m;
    re.lastIndex = 0;
    while ((m = re.exec(line))) {
      var min  = parseInt(m[1], 10);
      var sec  = parseInt(m[2], 10);
      var frac = m[3] ? parseFloat('0.' + m[3]) : 0;
      stamps.push(min * 60 + sec + frac);
    }
    var text = line.replace(re, '').trim();
    stamps.forEach(function(t) { out.push({ time: t, text: text }); });
  });
  out.sort(function(a, b) { return a.time - b.time; });
  return out;
}

/* ── Panel tabs ──────────────────────────────── */
document.querySelectorAll('.panel-tab').forEach(function(tab) {
  tab.addEventListener('click', function() {
    document.querySelectorAll('.panel-tab').forEach(function(t) { t.classList.remove('active'); });
    document.querySelectorAll('.tab-pane').forEach(function(p) { p.classList.remove('active'); });
    tab.classList.add('active');
    var id = 'tab' + tab.dataset.tab.charAt(0).toUpperCase() + tab.dataset.tab.slice(1);
    var el = document.getElementById(id);
    if (el) el.classList.add('active');
  });
});

/* ── Visualizer ──────────────────────────────── */
function buildVisualizer() {
  var viz = document.getElementById('visualizer');
  viz.innerHTML = '';
  for (var i = 0; i < 28; i++) {
    var bar = document.createElement('div');
    bar.className = 'viz-bar';
    // full-height bar; the analyser scales it down each frame (with a
    // fallback CSS bounce until the audio engine is running)
    var dur = (0.3 + Math.random() * 0.6).toFixed(2);
    var del = (Math.random() * 0.5).toFixed(2);
    bar.style.cssText = 'height:36px; --dur:' + dur + 's; animation-delay:' + del + 's;';
    viz.appendChild(bar);
  }
  if (analyser) startVU();
}

/* ── Accent ──────────────────────────────────── */
function setAccent(color) {
  var root = document.documentElement.style;
  root.setProperty('--accent', color);
  root.setProperty('--accent-d', darken(color, 0.8));
  root.setProperty('--glow', hex2rgba(color, 0.25));

  // The room itself takes on the vinyl colour: the walls get a
  // dark hue-preserving tint, the lamp glow gets a soft wash.
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(color)) {
    root.setProperty('--room',      roomTint(color, 24));
    root.setProperty('--room-2',    roomTint(color, 38));
    root.setProperty('--glow-soft', hex2rgba(color, 0.12));
  }
}

/* Dark wall tint that keeps the accent's hue: scales the colour so
   its brightest channel sits near `peak` (0-255), plus a warm floor
   so even cold blues never go pitch black. */
function roomTint(hex, peak) {
  var c = hexToRgb(hex);
  var max = Math.max(c[0], c[1], c[2], 1);
  var f = peak / max;
  return 'rgb(' +
    Math.round(c[0] * f + 8) + ',' +
    Math.round(c[1] * f + 6) + ',' +
    Math.round(c[2] * f + 4) + ')';
}

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(function(x) { return x + x; }).join('');
  var n = parseInt(hex, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function darken(hex, factor) {
  var c = hexToRgb(hex);
  return 'rgb(' + Math.round(c[0]*factor) + ',' + Math.round(c[1]*factor) + ',' + Math.round(c[2]*factor) + ')';
}

function hex2rgba(hex, a) {
  var c = hexToRgb(hex);
  return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')';
}

function rgbToHex(r, g, b) {
  function h(v) { return Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0'); }
  return '#' + h(r) + h(g) + h(b);
}

/* Samples a small canvas of the cover art and picks the most "vivid"
   colour (saturated, mid-lightness) rather than a flat average, so
   the room tint matches the artwork's character instead of going muddy. */
function extractAccentFromImage(url) {
  return new Promise(function(resolve) {
    if (!url) { resolve(null); return; }
    var img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function() {
      try {
        var size   = 48;
        var canvas = document.createElement('canvas');
        canvas.width = size; canvas.height = size;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, size, size);
        var data = ctx.getImageData(0, 0, size, size).data;

        var buckets = {};
        for (var i = 0; i < data.length; i += 4) {
          var r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
          if (a < 128) continue;
          var max = Math.max(r, g, b), min = Math.min(r, g, b);
          var lightness = (max + min) / 2;
          if (lightness < 20 || lightness > 235) continue; // skip near-black / near-white
          var sat = max === min ? 0 : (max - min) / (255 - Math.abs(max + min - 255));
          var key    = (r >> 4) + ',' + (g >> 4) + ',' + (b >> 4);
          var bucket = buckets[key] || (buckets[key] = { r: 0, g: 0, b: 0, count: 0, weight: 0 });
          bucket.r += r; bucket.g += g; bucket.b += b;
          bucket.count++;
          // saturation dominates the score (a small vivid patch should beat a large
          // dull backdrop); population only breaks ties between similarly-vivid buckets
          bucket.weight += Math.pow(sat, 2.2) + 0.02;
        }

        var best = null;
        for (var key2 in buckets) {
          var cand = buckets[key2];
          if (!best || cand.weight > best.weight) best = cand;
        }
        if (!best) { resolve(null); return; }
        resolve(rgbToHex(
          Math.round(best.r / best.count),
          Math.round(best.g / best.count),
          Math.round(best.b / best.count)
        ));
      } catch (e) {
        resolve(null); // tainted canvas (cross-origin) or decode failure
      }
    };
    img.onerror = function() { resolve(null); };
    img.src = url;
  });
}

/* Auto-themes an album from its cover art, unless the user has picked a
   swatch manually (album.accentAuto === false). Applies live to whichever
   view (studio/player) currently has this album open. */
function applyAutoAccentFromArt(album, url) {
  if (!url || !album) return;
  if (album.accentAuto === false) return;
  if (album.accentSourceUrl === url) return; // already derived for this art

  extractAccentFromImage(url).then(function(hex) {
    if (!hex || album.accentAuto === false) return;
    album.accent          = hex;
    album.accentSourceUrl = url;
    saveAlbums();

    if (activeAlbum === album) {
      setAccent(hex);
      document.querySelectorAll('.swatch[data-color]').forEach(function(s) { s.classList.remove('active'); });
      var customInput = document.getElementById('customColor');
      if (customInput) customInput.value = hex;
    } else if (playerAlbum === album) {
      setAccent(hex);
    }
  });
}

/* ══════════════════════════════════════════════
   PLAYER - controls
══════════════════════════════════════════════ */
function bindPlayerEvents() {
  document.getElementById('backBtn').addEventListener('click', backToStudio);
  document.getElementById('ctrlPlay').addEventListener('click', togglePlay);
  document.getElementById('ctrlNext').addEventListener('click', nextTrack);
  document.getElementById('ctrlPrev').addEventListener('click', prevTrack);

  document.getElementById('ctrlShuffle').addEventListener('click', function() {
    isShuffle = !isShuffle;
    updateShuffleBtn();
  });

  document.getElementById('ctrlRepeat').addEventListener('click', function() {
    repeatMode = (repeatMode + 1) % 3;
    updateRepeatBtn();
  });

  document.getElementById('speedBtn').addEventListener('click', function() {
    speedIdx = (speedIdx + 1) % SPEEDS.length;
    playbackSpeed = SPEEDS[speedIdx];
    audio.playbackRate = playbackSpeed;
    updateSpeedBtn();
  });

  document.getElementById('likeBtn').addEventListener('click', toggleLike);
  document.getElementById('volIconBtn').addEventListener('click', toggleMute);

  document.getElementById('btnFullscreen').addEventListener('click', function() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(function() {});
      document.getElementById('btnFullscreen').querySelector('i').className = 'fa-solid fa-compress';
    } else {
      document.exitFullscreen();
      document.getElementById('btnFullscreen').querySelector('i').className = 'fa-solid fa-expand';
    }
  });

  document.getElementById('btnLyrics').addEventListener('click', function() {
    document.querySelectorAll('.panel-tab').forEach(function(t) { t.classList.remove('active'); });
    document.querySelectorAll('.tab-pane').forEach(function(p) { p.classList.remove('active'); });
    document.querySelector('.panel-tab[data-tab="lyrics"]').classList.add('active');
    document.getElementById('tabLyrics').classList.add('active');
  });

  /* Seek */
  var seekTrack = document.getElementById('seekTrack');
  seekTrack.addEventListener('mousedown', function(e) { seekDragging = true; seekTo(e, seekTrack); });
  document.addEventListener('mousemove', function(e) { if (seekDragging) seekTo(e, seekTrack); });
  document.addEventListener('mouseup',   function()  { seekDragging = false; });

  /* Vol */
  var volTrack = document.getElementById('volTrack');
  volTrack.addEventListener('mousedown', function(e) { volDragging = true; setVol(e, volTrack); });
  document.addEventListener('mousemove', function(e) { if (volDragging) setVol(e, volTrack); });
  document.addEventListener('mouseup',   function()  { volDragging = false; });
}

function seekTo(e, track) {
  var rect = track.getBoundingClientRect();
  var pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  if (audio.duration) audio.currentTime = pct * audio.duration;
  setSeekFill(pct * 100);
}

function setVol(e, track) {
  var rect = track.getBoundingClientRect();
  var pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  volume   = pct;
  isMuted  = (pct === 0);
  audio.volume = volume;
  setVolFill(pct * 100);
  updateVolIcon();
}

function togglePlay() {
  if (!audio.src) return;
  initAudioEngine();
  resumeAC();
  if (isPlaying) {
    playIntentId++; // invalidate any pending "start once lyrics are ready" wait
    audio.pause();
    setPlayState(false);
  } else {
    var myIntent = ++playIntentId;
    lyricsReadyPromise.then(function() {
      if (myIntent !== playIntentId) return;
      audio.play().then(function() { setPlayState(true); }).catch(function() {});
    });
  }
}

function nextTrack() {
  var next = isShuffle
    ? Math.floor(Math.random() * playerAlbum.songs.length)
    : (currentIndex + 1) % playerAlbum.songs.length;
  loadTrack(next, isPlaying);
}

function prevTrack() {
  if (audio.currentTime > 3) { audio.currentTime = 0; return; }
  var prev = (currentIndex - 1 + playerAlbum.songs.length) % playerAlbum.songs.length;
  loadTrack(prev, isPlaying);
}

function toggleMute() {
  isMuted = !isMuted;
  audio.volume = isMuted ? 0 : volume;
  setVolFill(isMuted ? 0 : volume * 100);
  updateVolIcon();
}

function updateVolIcon() {
  var ico = document.getElementById('volIco');
  var v   = isMuted ? 0 : volume;
  ico.className = v === 0 ? 'fa-solid fa-volume-xmark' :
                  v < 0.4 ? 'fa-solid fa-volume-low' : 'fa-solid fa-volume-high';
}

function toggleLike() {
  var key = playerAlbum.id + '_' + currentIndex;
  likedSongs[key] = !likedSongs[key];
  saveLiked();
  updateLikeBtn();
  toast(likedSongs[key] ? '❤ Filed under favourites' : 'Taken out of favourites');
}

function updateLikeBtn() {
  var key     = playerAlbum ? (playerAlbum.id + '_' + currentIndex) : '';
  var isLiked = !!likedSongs[key];
  var btn     = document.getElementById('likeBtn');
  btn.classList.toggle('liked', isLiked);
  btn.innerHTML = isLiked
    ? '<i class="fa-solid fa-heart"></i>'
    : '<i class="fa-regular fa-heart"></i>';
}

function updateShuffleBtn() {
  document.getElementById('ctrlShuffle').classList.toggle('active', isShuffle);
}

function updateRepeatBtn() {
  var btn = document.getElementById('ctrlRepeat');
  btn.classList.toggle('active', repeatMode > 0);
  if (repeatMode === 2) {
    btn.innerHTML = '<i class="fa-solid fa-repeat"></i><sup style="font-size:.55rem;margin-left:1px;color:var(--accent)">1</sup>';
  } else {
    btn.innerHTML = '<i class="fa-solid fa-repeat"></i>';
  }
}

function updateSpeedBtn() {
  document.getElementById('speedBtn').textContent = SPEEDS[speedIdx] + '×';
}

function backToStudio() {
  audio.pause();
  setPlayState(false);
  document.getElementById('playerView').classList.add('hidden');
  document.getElementById('studioView').classList.remove('hidden');
}

/* ══════════════════════════════════════════════
   AUDIO EVENTS
══════════════════════════════════════════════ */
function bindAudio() {
  audio.addEventListener('timeupdate', function() {
    if (!audio.duration || seekDragging) return;
    var pct = (audio.currentTime / audio.duration) * 100;
    setSeekFill(pct);
    document.getElementById('timeNow').textContent   = fmtTime(audio.currentTime);
    document.getElementById('timeTotal').textContent = fmtTime(audio.duration);
    updateSyncedLyricsHighlight();
  });

  audio.addEventListener('loadedmetadata', function() {
    document.getElementById('timeTotal').textContent = fmtTime(audio.duration);
    if (playerAlbum && playerAlbum.songs && playerAlbum.songs[currentIndex]) {
      var song = playerAlbum.songs[currentIndex];
      var had = song.duration;
      song.duration = fmtTime(audio.duration);
      if (had !== song.duration) {
        var row = document.querySelector('.track-item[data-idx="' + currentIndex + '"] .ti-dur');
        if (row) row.textContent = song.duration;
        renderAbout();
        var dividers = document.querySelectorAll('.side-divider .sd-meta');
        if (dividers.length) renderTracklistMeta();
      }
    }
  });

  audio.addEventListener('ended', function() {
    if (repeatMode === 2) {
      audio.currentTime = 0;
      audio.play().catch(function() {});
    } else if (repeatMode === 1) {
      nextTrack();
    } else {
      var isLast = currentIndex === playerAlbum.songs.length - 1;
      if (isLast && !isShuffle) {
        setPlayState(false);
        setSeekFill(100);
      } else {
        nextTrack();
      }
    }
  });

  audio.addEventListener('play',  function() { setPlayState(true); });
  audio.addEventListener('pause', function() { setPlayState(false); });

  audio.volume = volume;
  setVolFill(volume * 100);
  updateVolIcon();
}

/* ══════════════════════════════════════════════
   KEYBOARD
══════════════════════════════════════════════ */
document.addEventListener('keydown', function(e) {
  if (document.getElementById('playerView').classList.contains('hidden')) return;
  var tag = document.activeElement.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

  switch (e.code) {
    case 'Space':
      e.preventDefault(); togglePlay(); break;
    case 'ArrowRight':
      e.preventDefault(); if (audio.duration) audio.currentTime = Math.min(audio.duration, audio.currentTime + 5); break;
    case 'ArrowLeft':
      e.preventDefault(); audio.currentTime = Math.max(0, audio.currentTime - 5); break;
    case 'ArrowUp':
      e.preventDefault();
      volume = Math.min(1, volume + 0.05); isMuted = false;
      audio.volume = volume; setVolFill(volume * 100); updateVolIcon(); break;
    case 'ArrowDown':
      e.preventDefault();
      volume = Math.max(0, volume - 0.05);
      audio.volume = volume; setVolFill(volume * 100); updateVolIcon(); break;
    case 'KeyM':  toggleMute(); break;
    case 'KeyN':  nextTrack();  break;
    case 'KeyP':  prevTrack();  break;
  }
});

/* ══════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════ */
function toast(msg, dur) {
  dur = dur || 2800;
  var wrap = document.getElementById('toastWrap');
  var el   = document.createElement('div');
  el.className   = 'toast';
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(function() {
    el.classList.add('out');
    el.addEventListener('animationend', function() { el.remove(); });
  }, dur);
}

/* ── Helpers ─────────────────────────────────── */
function esc(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escLines(str) {
  return esc(str).replace(/\n/g, '<br>');
}
