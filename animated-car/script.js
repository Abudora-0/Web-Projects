/* ─── Speed table ────────────────────────────────────────────
   [bgSeconds, wheelSeconds, bounceSeconds, kmh display, gear] */
const SPEEDS = [
  [28, 0.55, 0.65, 20,  "1st"],
  [20, 0.40, 0.52, 40,  "2nd"],
  [14, 0.28, 0.40, 60,  "3rd"],
  [10, 0.19, 0.28, 90,  "4th"],
  [7,  0.13, 0.18, 130, "5th"],
  [4.5,0.08, 0.11, 180, "6th"],
];

const TURBO_MULTIPLIER = 0.45; // speed boost factor during turbo
const TURBO_DURATION   = 3000; // ms

let speedLevel  = 2;
let isNight     = false;
let isRaining   = false;
let isTurbo     = false;
let turboTimer  = null;
let exhaustTimer = null;

/* ─── Elements ──────────────────────────────────────────────── */
const bgLayer      = document.getElementById('bgLayer');
const roadMarkings = document.getElementById('roadMarkings');
const backWheel    = document.getElementById('backWheel');
const frontWheel   = document.getElementById('frontWheel');
const carWrap      = document.getElementById('carWrap');
const speedDisplay = document.getElementById('speedDisplay');
const speedFill    = document.getElementById('speedFill');
const gearDisplay  = document.getElementById('gearDisplay');
const nightBtn     = document.getElementById('nightBtn');
const rainBtn      = document.getElementById('rainBtn');
const turboBtn     = document.getElementById('turboBtn');
const hornBtn      = document.getElementById('hornBtn');
const rainContainer= document.getElementById('rainContainer');
const exhaustEl    = document.getElementById('exhaustContainer');
const hornAudio    = new Audio('sound.mp3');

/* ─── Apply speed ───────────────────────────────────────────── */
function applySpeed(turboBoost = false) {
  let [bgS, wheelS, bounceS, kmh, gear] = SPEEDS[speedLevel];

  if (turboBoost) {
    bgS     *= TURBO_MULTIPLIER;
    wheelS  *= TURBO_MULTIPLIER;
    bounceS *= TURBO_MULTIPLIER;
    kmh     = Math.round(kmh * (1 / TURBO_MULTIPLIER) * 0.7);
  }

  bgLayer.style.animationDuration      = bgS + 's';
  roadMarkings.style.animationDuration  = bgS + 's';
  backWheel.style.animationDuration     = wheelS + 's';
  frontWheel.style.animationDuration    = wheelS + 's';
  carWrap.style.animationDuration       = bounceS + 's';

  speedDisplay.textContent = kmh;
  gearDisplay.textContent  = gear;

  const pct = (speedLevel + 1) / SPEEDS.length * 100;
  speedFill.style.width = pct + '%';

  // Color the speed number
  if (speedLevel <= 1)      speedDisplay.style.color = '#4ade80';
  else if (speedLevel <= 3) speedDisplay.style.color = '#fb923c';
  else                      speedDisplay.style.color = '#f87171';

  if (turboBoost) {
    speedDisplay.classList.add('turbo-active');
  } else {
    speedDisplay.classList.remove('turbo-active');
  }
}

function changeSpeed(dir) {
  if (isTurbo) return; // block during turbo
  speedLevel = Math.max(0, Math.min(SPEEDS.length - 1, speedLevel + dir));
  applySpeed();
}

/* ─── Night mode ────────────────────────────────────────────── */
function toggleNight() {
  isNight = !isNight;
  document.body.classList.toggle('night', isNight);
  nightBtn.classList.toggle('active', isNight);

  const icon = document.getElementById('nightIcon');
  if (isNight) {
    icon.innerHTML = `<path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"/>`;
    nightBtn.querySelector('svg').style.color = '#fde68a';
  } else {
    icon.innerHTML = `<path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>`;
    nightBtn.querySelector('svg').style.color = '';
  }
}

/* ─── Rain ──────────────────────────────────────────────────── */
function buildRain() {
  rainContainer.innerHTML = '';
  for (let i = 0; i < 120; i++) {
    const drop = document.createElement('div');
    drop.className = 'raindrop';
    const height = 14 + Math.random() * 22;
    drop.style.cssText = `
      left: ${Math.random() * 100}%;
      height: ${height}px;
      opacity: ${0.4 + Math.random() * 0.5};
      --fall-dur: ${0.5 + Math.random() * 0.6}s;
      --fall-delay: ${Math.random() * 1.2}s;
    `;
    rainContainer.appendChild(drop);
  }
}

function toggleRain() {
  isRaining = !isRaining;
  document.body.classList.toggle('raining', isRaining);
  rainBtn.classList.toggle('active', isRaining);
  if (isRaining && !rainContainer.children.length) buildRain();
}

/* ─── Exhaust smoke ─────────────────────────────────────────── */
function spawnSmoke() {
  const puff = document.createElement('div');
  puff.className = 'smoke-puff';
  const size = 18 + Math.random() * 22;
  // Position at back of car (left side of car-wrap)
  const rect = carWrap.getBoundingClientRect();
  const sceneRect = document.getElementById('scene').getBoundingClientRect();
  puff.style.cssText = `
    width:${size}px; height:${size}px;
    left:${rect.left - sceneRect.left - size}px;
    top:${rect.bottom - sceneRect.top - size - 20}px;
  `;
  exhaustEl.appendChild(puff);
  setTimeout(() => puff.remove(), 1200);
}

function startExhaust() {
  if (exhaustTimer) return;
  exhaustTimer = setInterval(spawnSmoke, 180);
}
function stopExhaust() {
  clearInterval(exhaustTimer);
  exhaustTimer = null;
}

/* ─── Turbo boost ───────────────────────────────────────────── */
function fireTurbo() {
  if (isTurbo) return;
  isTurbo = true;
  turboBtn.classList.add('firing');
  turboBtn.disabled = true;
  document.body.classList.add('turbo');
  speedDisplay.classList.add('turbo-active');
  startExhaust();
  applySpeed(true);

  turboTimer = setTimeout(() => {
    isTurbo = false;
    turboBtn.classList.remove('firing');
    document.body.classList.remove('turbo');
    stopExhaust();
    applySpeed(false);

    // Cooldown before re-enable
    setTimeout(() => { turboBtn.disabled = false; }, 4000);
  }, TURBO_DURATION);
}

/* ─── Honk ──────────────────────────────────────────────────── */
function honk() {
  hornAudio.currentTime = 0;
  hornAudio.play().catch(() => {});
  hornBtn.style.transform = 'scale(0.93)';
  setTimeout(() => hornBtn.style.transform = '', 150);
}

/* ─── Stars ─────────────────────────────────────────────────── */
function buildStars() {
  const starsEl = document.getElementById('stars');
  for (let i = 0; i < 80; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const size = 1 + Math.random() * 2.5;
    s.style.cssText = `
      width:${size}px; height:${size}px;
      top:${Math.random() * 55}%;
      left:${Math.random() * 100}%;
      --tw: ${1.5 + Math.random() * 3}s;
      animation-delay: ${Math.random() * 3}s;
    `;
    starsEl.appendChild(s);
  }
}

/* ─── Event listeners ───────────────────────────────────────── */
document.getElementById('spdUp').addEventListener('click',   () => changeSpeed(1));
document.getElementById('spdDown').addEventListener('click', () => changeSpeed(-1));
nightBtn.addEventListener('click', toggleNight);
rainBtn.addEventListener('click',  toggleRain);
turboBtn.addEventListener('click', fireTurbo);
hornBtn.addEventListener('click',  honk);

document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return;
  switch (e.code) {
    case 'ArrowUp':   case 'Equal': case 'NumpadAdd':      changeSpeed(1);  break;
    case 'ArrowDown': case 'Minus': case 'NumpadSubtract': changeSpeed(-1); break;
    case 'KeyN':  toggleNight(); break;
    case 'KeyR':  toggleRain();  break;
    case 'KeyT':  fireTurbo();   break;
    case 'Space': e.preventDefault(); honk(); break;
  }
});

/* ─── Init ──────────────────────────────────────────────────── */
buildStars();
applySpeed();
