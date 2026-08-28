/* ═══════════════════════════════════════════════
   Kino - script.js
   ═══════════════════════════════════════════════ */

const TMDB       = 'https://image.tmdb.org/t/p/w500';
const TMDB_BACK  = 'https://image.tmdb.org/t/p/w780';
const LS_LIST    = 'kino.mylist';

const SHOWS = {
  trending: [
    { id:1,  title:'Stranger Things',        poster:'/49WJfeN0moxb9IPfGn8AIqMGskD.jpg', backdrop:'/rcA35mCmHNf47b6W0wT5sLRZq21.jpg', year:2022, match:97, rating:'U/A 16+', seasons:'4 Seasons', genres:'Sci-Fi, Horror, Drama',      trailer:'b9EkMc79ZSU', desc:'When a boy vanishes in Hawkins, Indiana, supernatural forces, secret government experiments and one terrifying monster collide in this gripping sci-fi horror.' },
    { id:2,  title:'Money Heist',            poster:'/reEMJA1uzscCbkpeRJeTT2bjqUp.jpg', backdrop:'/7D430eqZj8y3oVkLFfsWXGRcpEG.jpg', year:2021, match:95, rating:'A',        seasons:'5 Seasons', genres:'Crime, Thriller, Drama',      trailer:'_InqQJRqGW4', desc:'A criminal mastermind who goes by "The Professor" recruits a team to carry out an ambitious heist against the Royal Mint of Spain.' },
    { id:3,  title:'Wednesday',              poster:'/jeGtaMwGxPmQN5xM4ClnwPQcNQG.jpg', backdrop:'/iHSwvRVsRyxpX7FE7GbviaDvgGZ.jpg', year:2022, match:96, rating:'U/A 16+', seasons:'1 Season',  genres:'Horror, Comedy, Mystery',    trailer:'Di310WS8zLk', desc:'Wednesday Addams navigates life at Nevermore Academy, unravelling a monstrous killing spree while mastering her own emerging psychic ability.' },
    { id:4,  title:'Squid Game',             poster:'/dDlEmu3EZ0Pgg93K2SVNLCjCSvE.jpg', backdrop:'/oaGvjB0DvdhXhOAuADfHb261ZHa.jpg', year:2021, match:99, rating:'A',        seasons:'2 Seasons', genres:'Thriller, Survival, Drama',  trailer:'oqxAJKy0ii4', desc:'Hundreds of cash-strapped players accept a strange invitation to compete in children’s games, where a deadly contest with a vast prize awaits.' },
    { id:5,  title:'Dark',                   poster:'/apbrbWs8M9lyOpJYU5WXrpFbk1Z.jpg', backdrop:'/hm58ncp41BqHSEzPu1tXi5bWMBZ.jpg', year:2020, match:94, rating:'A',        seasons:'3 Seasons', genres:'Sci-Fi, Thriller, Mystery',  trailer:null,          desc:'A family saga with a supernatural twist, set in a German town where the disappearance of two children exposes the fractured pasts of four families.' },
    { id:6,  title:'Ozark',                  poster:'/pHkHCHEuYPCUVrEjnDpSmNSnKtP.jpg', backdrop:'/1TqjBBZ9BFwcHRIJ8xQzuGWmfhI.jpg', year:2022, match:93, rating:'A',        seasons:'4 Seasons', genres:'Crime, Thriller, Drama',      trailer:'5hAXVqrljbs', desc:'A financial planner moves his family to the Missouri Ozarks to launder money for a cartel, then must navigate an ever more dangerous web of crime.' },
    { id:7,  title:'The Crown',              poster:'/hYZ4a0JvPETdfgJJ5iswaac8mFk.jpg', backdrop:'/1GKp0s2UkVwqTqkq1JxDIiIbNmo.jpg', year:2023, match:91, rating:'U/A 16+', seasons:'6 Seasons', genres:'Historical, Drama, Biography', trailer:'JWtnJjn6ng0', desc:'The political rivalries and romance of Queen Elizabeth II’s reign and the events that shaped the second half of the twentieth century.' },
    { id:8,  title:'Peaky Blinders',         poster:'/vUUqzWa2LnHIVqkaKVn3nyfVnBs.jpg', backdrop:'/3JsD7ILMXoqSm0VX0RtMJfXxhLw.jpg', year:2022, match:96, rating:'A',        seasons:'6 Seasons', genres:'Crime, Drama, Historical',    trailer:'oVzVdvGIC7U', desc:'A gangster-family epic set in 1900s England, centred on the Peaky Blinders and their ambitious, fearless leader Tommy Shelby.' },
  ],
  popular: [
    { id:9,  title:'Narcos',                 poster:'/rTmal9fDbwh5F0waol2hq35U4ah.jpg', backdrop:'/xBO8R3CsZbMeRvDGGlnIFdBBKZN.jpg', year:2017, match:90, rating:'A',        seasons:'3 Seasons', genres:'Crime, Biography, Drama',     trailer:null,          desc:'A chronicled look at the criminal exploits of Colombian drug lord Pablo Escobar and the kingpins who followed him.' },
    { id:10, title:'Bridgerton',             poster:'/luoKpgVwi1E5nQsi7W0UuKHu2Rq.jpg', backdrop:'/or06FN3Dka5tukK1e9sl16pB3iy.jpg', year:2023, match:88, rating:'A',        seasons:'3 Seasons', genres:'Romance, Drama, Period',      trailer:'gpv7ayf_tyE', desc:'The eight close-knit Bridgerton siblings look for love and happiness in London’s competitive Regency-era high society.' },
    { id:11, title:'You',                    poster:'/41yaWnIT8AjIHqrMGkWuHgOHsoY.jpg', backdrop:'/vykGSCLRxeibBqijExHsNLF0qRb.jpg', year:2023, match:92, rating:'A',        seasons:'4 Seasons', genres:'Thriller, Drama, Crime',      trailer:null,          desc:'A bookstore manager uses social media and technology to stalk, manipulate and insert himself into the life of each of his targets.' },
    { id:12, title:'Cobra Kai',              poster:'/6POBOFEd3KWfAkzHpRtdBWiL5TS.jpg', backdrop:'/5n5SdAW5LUPkBnhsPHklgmqjVA9.jpg', year:2023, match:94, rating:'U/A 13+', seasons:'6 Seasons', genres:'Drama, Action, Sport',        trailer:null,          desc:'Decades after the All Valley Karate Tournament, a down-and-out Johnny Lawrence seeks redemption by reopening the Cobra Kai dojo.' },
    { id:13, title:'Emily in Paris',         poster:'/qDumpdBKGJd1gSAFqnfHRw5K1OD.jpg', backdrop:'/jTswp6KyDYKtvC52GbHagrZbGvD.jpg', year:2023, match:85, rating:'U/A 16+', seasons:'4 Seasons', genres:'Romance, Comedy, Drama',      trailer:null,          desc:'An ambitious American from Chicago lands her dream job in Paris and juggles work, friends and a very complicated love life.' },
    { id:14, title:'Lupin',                  poster:'/sgxzT54GnvgeMnOZgpQQx9csAdd.jpg', backdrop:'/3Rfvhy1Nl6sSGJwyjHl4j6pAQkm.jpg', year:2023, match:89, rating:'U/A 13+', seasons:'3 Seasons', genres:'Crime, Thriller, Mystery',   trailer:'ga0iTWXCGa0', desc:'Inspired by Arsène Lupin, gentleman thief Assane Diop sets out to avenge his father for an injustice by a wealthy family.' },
    { id:15, title:'The Witcher',            poster:'/7vjaCdMw15FEbXyLQTVa04URsPm.jpg', backdrop:'/pBpKrEHzFNiOFQv1zYfIGbRofGw.jpg', year:2023, match:88, rating:'A',        seasons:'3 Seasons', genres:'Fantasy, Adventure, Drama',   trailer:null,          desc:'Geralt of Rivia, a solitary monster hunter, struggles to find his place in a world where people often prove more wicked than beasts.' },
    { id:16, title:'Mindhunter',             poster:'/z8onk7LV9Mmw6zKz4hT6pzzvmvl.jpg', backdrop:'/mQHHQWUeRjWeSM6uWNrHiWl3NhC.jpg', year:2019, match:95, rating:'A',        seasons:'2 Seasons', genres:'Crime, Thriller, Drama',      trailer:null,          desc:'In the late 1970s two FBI agents broaden criminal science by getting inside the minds of imprisoned serial killers.' },
    { id:17, title:'The Umbrella Academy',   poster:'/scZlQQqnsc1pZKTG4rFHlheIXJx.jpg', backdrop:'/luKKRHvJLPRPQeXE2siRpPm3BLo.jpg', year:2023, match:90, rating:'U/A 16+', seasons:'3 Seasons', genres:'Superhero, Sci-Fi, Comedy',   trailer:null,          desc:'A dysfunctional family of adopted sibling superheroes reunites to solve their father’s death and stop an apocalypse.' },
  ],
  new: [
    { id:18, title:'Sex Education',          poster:'/7ERbQEt6V0qHiGrjQ6t0C5Lh4tV.jpg', backdrop:'/mBxnXjTPT0wGtNpWJNm7DTWHX7R.jpg', year:2023, match:93, rating:'A',        seasons:'4 Seasons', genres:'Comedy, Drama, Coming-of-age', trailer:null, desc:'Awkward teenager Otis has a talent for sex advice thanks to his therapist mother, so his classmates persuade him to run an underground clinic.' },
    { id:19, title:'The Haunting of Hill House', poster:'/dlcmumHHVeFNjOPIwINM6ouBrha.jpg', backdrop:'/jbDmXI1cDV45VoHNLYdMKlV6ZK6.jpg', year:2018, match:96, rating:'A',    seasons:'1 Season',  genres:'Horror, Drama, Supernatural', trailer:null, desc:'Flashing between past and present, a fractured family confronts the haunting memories of their old home and the events that drove them out.' },
    { id:20, title:'Manifest',               poster:'/oGnxm4MF0xtJzGMrHHRVRcqHUna.jpg', backdrop:'/6Q7A9VbAVd9O1wUB0uCVBqJKsQZ.jpg', year:2023, match:87, rating:'U/A 13+', seasons:'4 Seasons', genres:'Sci-Fi, Mystery, Drama',      trailer:null, desc:'When Flight 828 lands safely, its 191 passengers learn the world has moved on without them for five and a half years.' },
    { id:21, title:'The Good Place',         poster:'/1CPxuGfj5vSGRMRcjNFXUEW5p7S.jpg', backdrop:'/9SsHDhBfkwPVxvYSzEAHCuCMXXk.jpg', year:2020, match:91, rating:'U/A 7+',  seasons:'4 Seasons', genres:'Comedy, Fantasy, Philosophy',  trailer:null, desc:'An ordinary woman ends up in an extraordinary afterlife and, with the help of a wise mentor, tries to become a better person.' },
    { id:22, title:'Outer Banks',            poster:'/zfzNBrOFLrGFnmPHGRlzWexbS0u.jpg', backdrop:'/k2tVCbSBzLzm8RaBL4jM6KLhB1q.jpg', year:2023, match:89, rating:'U/A 16+', seasons:'3 Seasons', genres:'Adventure, Teen, Mystery',    trailer:null, desc:'A group of teenagers on a small island hunt for a legendary treasure while the divide between the rich and the poor closes in.' },
    { id:23, title:'Black Mirror',           poster:'/7iPNRzgouguSSZCiUBkwdU3DCNQ.jpg', backdrop:'/xOOSJfJVJdAJvuPqMBaXBQKrGFv.jpg', year:2023, match:92, rating:'A',        seasons:'6 Seasons', genres:'Sci-Fi, Thriller, Anthology', trailer:null, desc:'An anthology exploring a twisted near future where humanity’s greatest innovations and darkest instincts collide.' },
    { id:24, title:'The OA',                 poster:'/q4tZ2AhUv7fZFGgOIjijZPt1Wpl.jpg', backdrop:'/3s76ChK1GEJQ93lXqLlFMJEDSI1.jpg', year:2019, match:88, rating:'U/A 16+', seasons:'2 Seasons', genres:'Mystery, Sci-Fi, Drama',      trailer:null, desc:'A blind woman resurfaces after seven years missing, her sight restored, and leads five strangers through a strange set of movements.' },
    { id:25, title:'Ginny & Georgia',        poster:'/h5J4W4veyxMXDMjeMLxOs6DQPkS.jpg', backdrop:'/mS5rkEGpBVDqePEcPlPEKqBnLNa.jpg', year:2023, match:86, rating:'U/A 16+', seasons:'3 Seasons', genres:'Drama, Comedy, Family',       trailer:null, desc:'Fifteen-year-old Ginny is often more grown-up than her charming, chaotic thirty-year-old mother, who is chasing a fresh start.' },
  ],
};

const ALL = [...Object.values(SHOWS)].flat();
const byId = id => ALL.find(x => x.id === +id);
const posterUrl = item => `${TMDB}${item.poster}`;
const fallbackPoster = item => `https://picsum.photos/seed/${item.id}kino/300/450`;

/* ── My List (localStorage) ───────────────────────────── */
const getList = () => { try { return JSON.parse(localStorage.getItem(LS_LIST)) || []; } catch { return []; } };
const setList = v  => { try { localStorage.setItem(LS_LIST, JSON.stringify(v)); } catch {} };
const inList  = id => getList().includes(+id);

function toggleList(id) {
  const list = getList();
  const i = list.indexOf(+id);
  if (i === -1) { list.push(+id); showToast('Added to My List'); }
  else          { list.splice(i, 1); showToast('Removed from My List'); }
  setList(list);
  renderMyListRow();
  refreshListButtons(+id);
}

function refreshListButtons(id) {
  const on = inList(id);
  document.querySelectorAll(`.chb-list[data-id="${id}"]`).forEach(b => {
    b.classList.toggle('on', on);
    b.innerHTML = `<i class="fas fa-${on ? 'check' : 'plus'}"></i>`;
  });
  const mAdd = document.getElementById('modalAdd');
  if (mAdd && +mAdd.dataset.id === +id) {
    mAdd.classList.toggle('on', on);
    mAdd.innerHTML = `<i class="fas fa-${on ? 'check' : 'plus'}"></i> ${on ? 'In My List' : 'My List'}`;
  }
}

/* ── Card markup ──────────────────────────────────────── */
function cardHTML(item, rank) {
  const on = inList(item.id);
  return `
  <div class="movie-card" data-id="${item.id}" title="${item.title}">
    <div class="card-img-wrap">
      <img src="${posterUrl(item)}" alt="${item.title}" loading="lazy"
           onerror="this.onerror=null;this.src='${fallbackPoster(item)}'" />
    </div>
    <div class="card-hover">
      <div class="card-hover-title">${item.title}</div>
      <div class="card-hover-btns">
        <button class="chb play" data-act="play" aria-label="Play trailer"><i class="fas fa-play"></i></button>
        <button class="chb chb-list ${on ? 'on' : ''}" data-act="list" data-id="${item.id}" aria-label="My List"><i class="fas fa-${on ? 'check' : 'plus'}"></i></button>
        <button class="chb" data-act="info" aria-label="More info"><i class="fas fa-chevron-down"></i></button>
      </div>
    </div>
    ${rank ? `<div class="card-num">${rank}</div>` : ''}
  </div>`;
}

function wireCards(container) {
  container.querySelectorAll('.movie-card').forEach(card => {
    const item = byId(card.dataset.id);
    if (!item) return;
    card.addEventListener('click', e => {
      const btn = e.target.closest('[data-act]');
      if (btn && btn.dataset.act === 'list')      { e.stopPropagation(); toggleList(item.id); return; }
      if (btn && btn.dataset.act === 'play')      { e.stopPropagation(); openModal(item); playTrailer(item); return; }
      openModal(item);
    });
  });
}

function renderRow(rowId, items, numbered = false) {
  const track = document.getElementById('row-' + rowId);
  if (!track) return;
  track.innerHTML = items.map((it, i) => cardHTML(it, numbered ? i + 1 : 0)).join('');
  wireCards(track);
}

function renderMyListRow() {
  const block = document.getElementById('block-mylist');
  const items = getList().map(byId).filter(Boolean);
  if (!items.length) { block.classList.add('hidden'); return; }
  block.classList.remove('hidden');
  renderRow('mylist', items);
}

renderMyListRow();
renderRow('trending', SHOWS.trending, true);
renderRow('popular',  SHOWS.popular);
renderRow('new',      SHOWS.new);

/* ── Row scroll arrows ────────────────────────────────── */
document.querySelectorAll('.row-arrow').forEach(btn => {
  btn.addEventListener('click', () => {
    const track = document.getElementById('row-' + btn.dataset.row);
    if (!track) return;
    const dir = btn.classList.contains('row-next') ? 1 : -1;
    track.scrollBy({ left: dir * track.clientWidth * 0.8, behavior: 'smooth' });
  });
});

/* ── Poster wall (hero background) ─────────────────────── */
(function () {
  const wall = document.getElementById('posterWall');
  if (!wall) return;
  const pool = [...ALL, ...ALL].sort(() => Math.random() - 0.5).slice(0, 28);
  wall.innerHTML = pool.map(it =>
    `<img src="${posterUrl(it)}" alt="" loading="eager"
       onerror="this.onerror=null;this.src='${fallbackPoster(it)}'">`).join('');
})();

/* ── Search ───────────────────────────────────────────── */
const navSearch      = document.getElementById('navSearch');
const searchInput    = document.getElementById('searchInput');
const searchResults  = document.getElementById('searchResults');
const rowsSection    = document.getElementById('rowsSection');

document.getElementById('navSearchToggle').addEventListener('click', () => {
  navSearch.classList.toggle('hidden');
  if (!navSearch.classList.contains('hidden')) searchInput.focus();
});
document.getElementById('searchClear').addEventListener('click', () => {
  searchInput.value = '';
  runSearch();
  searchInput.focus();
});

let searchDebounce;
searchInput.addEventListener('input', () => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(runSearch, 150);
});

function runSearch() {
  const q = searchInput.value.trim().toLowerCase();
  if (!q) {
    searchResults.classList.add('hidden');
    rowsSection.classList.remove('hidden');
    return;
  }
  const hits = ALL.filter(x =>
    x.title.toLowerCase().includes(q) || x.genres.toLowerCase().includes(q));

  rowsSection.classList.add('hidden');
  searchResults.classList.remove('hidden');
  document.getElementById('srHeading').textContent =
    hits.length ? `Results for “${searchInput.value.trim()}”` : 'No matches';
  document.getElementById('srEmpty').classList.toggle('hidden', hits.length > 0);

  const grid = document.getElementById('srGrid');
  grid.innerHTML = hits.map(it => cardHTML(it, 0)).join('');
  wireCards(grid);
}

/* ── Modal ────────────────────────────────────────────── */
const modal      = document.getElementById('movieModal');
const modalHero  = document.getElementById('modalHero');

function openModal(item) {
  restoreHero();

  const banner = document.getElementById('modalBanner');
  banner.src = `${TMDB_BACK}${item.backdrop}`;
  banner.onerror = () => { banner.onerror = null; banner.src = `https://picsum.photos/seed/${item.id}back/780/439`; };

  document.getElementById('modalTitle').textContent   = item.title;
  document.getElementById('modalMatch').textContent   = item.match + '% match';
  document.getElementById('modalYear').textContent    = item.year;
  document.getElementById('modalRating').textContent  = item.rating;
  document.getElementById('modalSeasons').textContent = item.seasons;
  document.getElementById('modalDesc').textContent    = item.desc;
  document.getElementById('modalGenres').textContent  = item.genres;

  const add = document.getElementById('modalAdd');
  add.dataset.id = item.id;
  const on = inList(item.id);
  add.classList.toggle('on', on);
  add.innerHTML = `<i class="fas fa-${on ? 'check' : 'plus'}"></i> ${on ? 'In My List' : 'My List'}`;
  add.onclick = () => toggleList(item.id);

  document.getElementById('modalPlay').onclick = () => playTrailer(item);

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function playTrailer(item) {
  if (item.trailer) {
    const p = new URLSearchParams({ autoplay: '1', rel: '0', modestbranding: '1', origin: location.origin });
    modalHero.innerHTML =
      `<iframe class="modal-trailer" src="https://www.youtube-nocookie.com/embed/${item.trailer}?${p}"
        title="${item.title} trailer" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>`;
  } else {
    window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(item.title + ' trailer')}`,
      '_blank', 'noopener');
  }
}

let heroHTML = '';
function restoreHero() {
  if (!heroHTML) heroHTML = modalHero.innerHTML;
  else modalHero.innerHTML = heroHTML;
}

function closeModal() {
  restoreHero();                     // kills any playing trailer
  modal.classList.add('hidden');
  document.body.style.overflow = '';
}

document.getElementById('modalClose').addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ── FAQ accordion ────────────────────────────────────── */
document.querySelectorAll('.faq-item').forEach(item => {
  item.querySelector('.faq-q').addEventListener('click', () => {
    const open = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(o => o.classList.remove('open'));
    if (!open) item.classList.add('open');
  });
});

/* ── Navbar solid on scroll ───────────────────────────── */
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('solid', scrollY > 60);
}, { passive: true });

/* ── Toast ────────────────────────────────────────────── */
let _toastT = null;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(_toastT);
  _toastT = setTimeout(() => el.classList.remove('show'), 2000);
}

/* ── Email validation ─────────────────────────────────── */
function handleGetStarted(source = 'hero') {
  const input = document.getElementById(source === 'footer' ? 'footerEmail' : 'heroEmail');
  const note  = document.getElementById(source === 'footer' ? 'footerNote'  : 'heroNote');
  const email = input.value.trim();
  const re    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email)        { note.style.color = '#e8a33d'; note.textContent = 'Email is required.'; input.style.borderColor = '#e8a33d'; return; }
  if (!re.test(email)) { note.style.color = '#e8a33d'; note.textContent = 'Enter a valid email address.'; input.style.borderColor = '#e8a33d'; return; }

  note.style.color = '#5fbf6f';
  note.textContent = '✓ Great — let’s set up your Kino membership.';
  input.style.borderColor = '#5fbf6f';
}

['heroEmail', 'footerEmail'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleGetStarted(id === 'footerEmail' ? 'footer' : 'hero');
  });
});
