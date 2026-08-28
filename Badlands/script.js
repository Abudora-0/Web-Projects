'use strict';
// ══════════════════════════════════════════════════════
//  BADLANDS  -  an endless runner in the Google dino mould
// ══════════════════════════════════════════════════════

const C  = document.getElementById('c');
const cx = C.getContext('2d');
const CW = 800, CH = 290;
C.width = CW; C.height = CH;

// ── Palette ────────────────────────────────────────────
const DAY   = { bg:'#f6e7c8', fg:'#5b3a29', gr:'#c9a86b', cl:'#eedcb3' };
const NIGHT = { bg:'#221735', fg:'#e8d8b0', gr:'#4a3a63', cl:'#332448' };
let pal = { ...DAY };
let nightMode = false;

// ── Layout ─────────────────────────────────────────────
const GY = 236;        // ground y (top of ground line)
const DINO_X  = 80;   // dino fixed x
const DW = 44, DH = 56;       // standing dims
const DDW = 58, DDH = 34;     // ducking dims

// ── State ──────────────────────────────────────────────
let state = 'start';  // start | run | dead
let score = 0, hiScore = +localStorage.getItem('dr_hi') || 0;
let speed = 6, maxSpeed = 6;
let frame = 0, tick = 0;
let dodgeCount = 0, combo = 0, comboTimer = 0;
let shakeX = 0, shakeY = 0;
let raf;

// ── Dino ───────────────────────────────────────────────
const dino = {
  y: GY - DH, vy: 0,
  jumping: false, ducking: false, dead: false,
  legFrame: 0,
  shield: 0, slow: 0, boost: 0,
};
const GRAVITY = 0.88, JUMP_V = -17;

// ── Obstacles / power-ups / particles ──────────────────
let obstacles = [], pups = [], parts = [];
let spawnTimer = 0, nextSpawn = 105;
let pupTimer = 0, nextPup = 420;

// ── Ground ─────────────────────────────────────────────
let gOff = 0;
const bumps = Array.from({ length: 90 }, () => ({
  x: Math.random() * CW * 6,
  w: Math.random() * 18 + 3,
  h: Math.random() * 4 + 1,
}));

// ── Clouds ─────────────────────────────────────────────
const clouds = [
  { x: 180, y: 38, w: 90, h: 26 },
  { x: 460, y: 62, w: 68, h: 20 },
  { x: 700, y: 32, w: 95, h: 30 },
  { x: 960, y: 52, w: 74, h: 22 },
];

// ── Stars (night only) ─────────────────────────────────
const stars = Array.from({ length: 60 }, () => ({
  x: Math.random() * CW,
  y: Math.random() * (GY - 60) + 10,
  r: Math.random() * 1.4 + 0.4,
}));

// ══════════════════════════════════════════════════════
//  AUDIO  (Web Audio - no files needed)
// ══════════════════════════════════════════════════════
let _ac = null;
function ac() { return _ac || (_ac = new (window.AudioContext || window.webkitAudioContext)()); }
function tone(freq, dur, type = 'square', vol = 0.14, freqEnd = null) {
  try {
    const a = ac(), o = a.createOscillator(), g = a.createGain();
    o.connect(g); g.connect(a.destination);
    o.type = type;
    o.frequency.setValueAtTime(freq, a.currentTime);
    if (freqEnd) o.frequency.exponentialRampToValueAtTime(freqEnd, a.currentTime + dur);
    g.gain.setValueAtTime(vol, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + dur);
    o.start(a.currentTime); o.stop(a.currentTime + dur);
  } catch (e) {}
}
const SFX = {
  jump:      () => tone(200, 0.13, 'square', 0.14, 440),
  die:       () => { tone(440, 0.12, 'sawtooth', 0.28); setTimeout(() => tone(200, 0.32, 'sawtooth', 0.22, 80), 130); },
  milestone: () => [0, 110, 220].forEach((ms, i) => setTimeout(() => tone([660, 880, 1100][i], 0.1, 'sine', 0.12), ms)),
  powerup:   () => [0, 75, 150, 225].forEach((ms, i) => setTimeout(() => tone([440, 550, 660, 880][i], 0.07, 'sine', 0.12), ms)),
  night:     () => tone(300, 0.35, 'sine', 0.1, 200),
};

// ══════════════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════════════
const FR  = (x, y, w, h) => cx.fillRect(x, y, w, h);
const fmt = n => String(Math.min(99999, Math.floor(n))).padStart(5, '0');

const hiEl = document.getElementById('hiEl');
const scEl = document.getElementById('scEl');
const puBar = document.getElementById('puBar');
hiEl.textContent = fmt(hiScore);

const PUP_COL = { shield: '#00e5ff', slow: '#ffd740', boost: '#ff4081' };
const PUP_LBL = { shield: 'SHIELD', slow: 'SLOW', boost: '×2' };
const PUP_DUR = { shield: 300, slow: 180, boost: 240 };

// ══════════════════════════════════════════════════════
//  DRAW HELPERS
// ══════════════════════════════════════════════════════

// ── Dino ───────────────────────────────────────────────
function drawDino(ox, oy, lf, duck, dead) {
  const col = dead ? (nightMode ? '#666' : '#9a9a9a') : pal.fg;
  const bg  = pal.bg;

  // Shield halo
  if (dino.shield > 0 && !dead) {
    cx.save();
    cx.globalAlpha = 0.25 + Math.sin(frame * 0.25) * 0.2;
    cx.strokeStyle = '#00e5ff';
    cx.lineWidth = 3;
    const hw = (duck ? DDW : DW) / 2, hh = (duck ? DDH : DH) / 2;
    cx.beginPath();
    cx.ellipse(ox + hw, oy + hh, hw + 9, hh + 9, 0, 0, Math.PI * 2);
    cx.stroke();
    cx.restore();
  }

  cx.fillStyle = col;

  if (duck) {
    FR(ox + 2,  oy + 10, 38, 20); // body
    FR(ox + 36, oy,      22, 12); // head
    FR(ox + 50, oy + 6,   8,  8); // snout
    FR(ox,      oy + 12,  6, 16); // tail top
    FR(ox + 2,  oy + 22,  4,  8); // tail bot
    cx.fillStyle = bg;
    FR(ox + 48, oy + 2,   6,  5); // eye
    cx.fillStyle = col;
    FR(ox + 12, oy + 28, 10,  6); // leg L
    FR(ox + 28, oy + 28, 10,  6); // leg R
  } else {
    FR(ox + 4,  oy + 20, 28, 22); // torso
    FR(ox + 20, oy + 8,  14, 14); // neck
    FR(ox + 22, oy,      20, 14); // head
    FR(ox + 34, oy + 8,  10,  8); // snout
    FR(ox,      oy + 22, 10, 12); // tail up
    FR(ox + 2,  oy + 30,  8,  8); // tail low
    FR(ox + 20, oy + 28,  8,  6); // arm nub
    cx.fillStyle = bg;
    FR(ox + 36, oy + 2,   6,  6); // eye
    cx.fillStyle = col;
    if (!dead) {
      if (lf === 0) {
        FR(ox + 10, oy + 42, 8, 14); FR(ox + 8,  oy + 54, 10, 4); // L fwd
        FR(ox + 22, oy + 42, 8,  6);                               // R back
      } else if (lf === 1) {
        FR(ox + 10, oy + 42, 8,  6);                               // L back
        FR(ox + 22, oy + 42, 8, 14); FR(ox + 20, oy + 54, 10, 4); // R fwd
      } else {
        FR(ox + 10, oy + 42, 8, 10); // air
        FR(ox + 22, oy + 42, 8, 10);
      }
    } else {
      FR(ox + 6,  oy + 42, 8, 6); // dead: splayed
      FR(ox + 24, oy + 42, 8, 6);
    }
  }

  // Boost trail glow
  if (dino.boost > 0 && !dead) {
    cx.save();
    cx.globalAlpha = 0.12 + Math.sin(frame * 0.3) * 0.08;
    cx.fillStyle = '#ff4081';
    FR(ox - 6, oy, (duck ? DDW : DW) + 10, duck ? DDH : DH);
    cx.restore();
  }
}

// ── Cacti ──────────────────────────────────────────────
// Each type: (x, baseY) → draws on canvas
const CACTUS = [
  // 0: small single  w=28 h=50
  (x) => { const y=GY; FR(x+8,y-50,10,50); FR(x,y-44,6,18); FR(x,y-38,8,6); FR(x+20,y-36,6,14); FR(x+18,y-30,8,6); },
  // 1: tall single   w=28 h=70
  (x) => { const y=GY; FR(x+8,y-70,10,70); FR(x,y-60,6,24); FR(x,y-48,8,6); FR(x+20,y-52,6,22); FR(x+18,y-40,8,6); },
  // 2: double small  w=64 h=50
  (x) => { const y=GY;
    FR(x+8,y-50,10,50);  FR(x,y-44,6,18);   FR(x,y-38,8,6);   FR(x+20,y-36,6,14); FR(x+18,y-30,8,6);
    FR(x+42,y-46,10,46); FR(x+34,y-40,6,16); FR(x+34,y-34,8,6); FR(x+54,y-32,6,12); FR(x+52,y-26,8,6); },
  // 3: tall + small  w=66 h=70
  (x) => { const y=GY;
    FR(x+8,y-70,10,70);  FR(x,y-60,6,24);   FR(x,y-48,8,6);   FR(x+20,y-52,6,22); FR(x+18,y-40,8,6);
    FR(x+46,y-46,10,46); FR(x+38,y-40,6,16); FR(x+38,y-34,8,6); FR(x+58,y-32,6,12); FR(x+56,y-26,8,6); },
  // 4: triple small  w=92 h=50
  (x) => { const y=GY; [0,32,64].forEach(d=>{ FR(x+d+8,y-50,10,50); FR(x+d,y-44,6,18); FR(x+d,y-38,8,6); FR(x+d+20,y-36,6,14); FR(x+d+18,y-30,8,6); }); },
];
const CACTUS_W = [28, 28, 64, 66, 92];
const CACTUS_H = [50, 70, 50, 70, 50];

// ── Birds ──────────────────────────────────────────────
function drawBird(obs) {
  const { x, y } = obs;
  const wf = Math.floor(frame / 9) % 3;
  cx.fillStyle = pal.fg;
  FR(x + 8,  y + 8, 24, 8);  // body
  FR(x + 28, y + 4, 12, 9);  // head
  FR(x + 38, y + 7,  6, 4);  // beak
  if (wf === 0)      FR(x, y + 2,  22, 6); // wing up
  else if (wf === 1) FR(x, y + 8,  22, 6); // wing mid
  else               FR(x, y + 13, 22, 6); // wing down
}

// ── Power-up orbs ──────────────────────────────────────
function drawPup(p) {
  const col = PUP_COL[p.type];
  const bob = Math.sin(frame * 0.1 + p.phase) * 4;
  const px = p.x, py = p.y + bob;
  cx.save();
  cx.fillStyle = pal.bg;
  cx.beginPath(); cx.arc(px, py, 14, 0, Math.PI * 2); cx.fill();
  cx.strokeStyle = col;
  cx.lineWidth = 2;
  cx.shadowBlur = 14; cx.shadowColor = col;
  cx.stroke();
  cx.fillStyle = col;
  cx.shadowBlur = 6;
  cx.font = p.type === 'boost' ? '8px "Press Start 2P"' : '7px "Press Start 2P"';
  cx.textAlign = 'center';
  cx.textBaseline = 'middle';
  cx.fillText(PUP_LBL[p.type].length > 5 ? p.type[0].toUpperCase() : PUP_LBL[p.type], px, py);
  cx.restore();
}

// ── Ground ─────────────────────────────────────────────
function drawGround() {
  cx.fillStyle = pal.gr;
  FR(0, GY + 2, CW, 2);
  bumps.forEach(b => {
    const bx = ((b.x - gOff * 0.65) % (CW * 6) + CW * 6) % (CW * 6);
    if (bx < CW + 24) FR(bx, GY + 4, b.w, b.h);
  });
}

// ── Clouds ─────────────────────────────────────────────
function drawClouds() {
  cx.fillStyle = pal.cl;
  clouds.forEach(c => {
    cx.beginPath();
    cx.roundRect(c.x, c.y, c.w, c.h, c.h / 2);
    cx.fill();
    cx.beginPath();
    cx.arc(c.x + c.w * 0.3, c.y + 3, c.h * 0.62, Math.PI, 0);
    cx.fill();
  });
}

// ── Stars ──────────────────────────────────────────────
function drawStars() {
  if (!nightMode) return;
  cx.fillStyle = `rgba(220,220,220,${0.4 + Math.sin(frame * 0.018) * 0.3})`;
  stars.forEach(s => { cx.beginPath(); cx.arc(s.x, s.y, s.r, 0, Math.PI * 2); cx.fill(); });
}

// ── Particles ──────────────────────────────────────────
function spawnParticles(x, y, col, n = 22) {
  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 * i / n) + (Math.random() - 0.5) * 0.6;
    const sp = Math.random() * 4 + 1.5;
    parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 2.5,
      life: 1, d: 0.025 + Math.random() * 0.02, s: Math.random() * 5 + 2, col });
  }
}
function updateParticles() {
  parts = parts.filter(p => p.life > 0.02);
  parts.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.18; p.life -= p.d; p.s *= 0.975; });
}
function drawParticles() {
  parts.forEach(p => {
    cx.save(); cx.globalAlpha = p.life;
    cx.fillStyle = p.col;
    FR(p.x - p.s / 2, p.y - p.s / 2, p.s, p.s);
    cx.restore();
  });
}

// ── Overlay text helper ────────────────────────────────
function txt(str, x, y, size, col) {
  cx.fillStyle = col;
  cx.font = `${size}px "Press Start 2P"`;
  cx.textAlign = 'center';
  cx.textBaseline = 'middle';
  cx.fillText(str, x, y);
}

// ── Start screen ───────────────────────────────────────
function drawStartScreen() {
  // idle dino bob
  const bob = Math.sin(frame * 0.055) * 3;
  drawDino(DINO_X, GY - DH + bob, Math.floor(frame / 9) % 2, false, false);

  cx.fillStyle = 'rgba(0,0,0,0.18)';
  FR(0, 0, CW, CH);

  txt('BADLANDS', CW / 2, CH / 2 - 26, 22, pal.fg);
  txt('PRESS SPACE TO START', CW / 2, CH / 2 + 6, 8, nightMode ? '#8a76a8' : '#a3825f');
  txt('↑ JUMP  ·  ↓ DUCK  ·  COLLECT POWER-UPS', CW / 2, CH / 2 + 28, 6, nightMode ? '#5e4d80' : '#c2a077');
}

// ── Game-over screen ───────────────────────────────────
function drawDeadScreen() {
  // full-bleed scrim - dims the whole screen so the panel reads as an end card
  cx.fillStyle = nightMode ? 'rgba(9,6,20,0.62)' : 'rgba(38,20,12,0.5)';
  FR(0, 0, CW, CH);

  // centred pixel panel
  const pw = 344, ph = 188;
  const px = Math.round((CW - pw) / 2), py = Math.round((CH - ph) / 2);
  cx.fillStyle = nightMode ? '#221735' : '#f6e7c8';
  FR(px, py, pw, ph);
  cx.fillStyle = nightMode ? '#4a3a63' : '#c9a86b';
  FR(px, py, pw, 3); FR(px, py + ph - 3, pw, 3);
  FR(px, py, 3, ph); FR(px + pw - 3, py, 3, ph);

  const mid = CW / 2;
  const newBest = score > 0 && score >= hiScore;

  txt('GAME OVER', mid, py + 34, 17, pal.fg);
  cx.fillStyle = nightMode ? '#4a3a63' : '#c9a86b';
  FR(mid - 104, py + 52, 208, 2);

  txt(`SCORE  ${fmt(score)}`,   mid, py + 80,  9, pal.fg);
  txt(`BEST   ${fmt(hiScore)}`, mid, py + 100, 9, newBest ? '#f4a259' : pal.fg);

  if (newBest) txt('* NEW BEST *', mid, py + 122, 6, '#f4a259');
  else txt(`DODGED ${dodgeCount}  ·  TOP SPEED ${maxSpeed.toFixed(1)}`, mid, py + 122, 5.5, nightMode ? '#8a76a8' : '#a3825f');

  // blinking prompt
  if (Math.floor(frame / 30) % 2 === 0)
    txt('PRESS SPACE TO RESTART', mid, py + 154, 6.5, nightMode ? '#a68fce' : '#9a5f38');
}

// ══════════════════════════════════════════════════════
//  HUD (DOM)
// ══════════════════════════════════════════════════════
function updateHUD() {
  scEl.textContent = fmt(score);
  puBar.innerHTML = '';
  [['shield', dino.shield], ['slow', dino.slow], ['boost', dino.boost]].forEach(([t, rem]) => {
    if (rem <= 0) return;
    const pct = Math.max(0, (rem / PUP_DUR[t]) * 100);
    const tag = document.createElement('div');
    tag.className = `pu-tag ${t}`;
    tag.innerHTML = `${PUP_LBL[t]} <div class="pu-bar-inner" style="width:${pct}%"></div>`;
    puBar.appendChild(tag);
  });
}

// ══════════════════════════════════════════════════════
//  GAME LOOP
// ══════════════════════════════════════════════════════
function loop() {
  raf = requestAnimationFrame(loop);
  frame++;
  if (state === 'run') update();
  // settle the impact jolt on every screen, not just while running
  shakeX *= 0.82; shakeY *= 0.82;
  if (Math.abs(shakeX) < 0.15) shakeX = 0;
  if (Math.abs(shakeY) < 0.15) shakeY = 0;
  render();
}

function update() {
  tick++;

  // Score
  if (tick % 5 === 0) {
    score += dino.boost > 0 ? 2 : 1;
    if (score % 100 === 0) { SFX.milestone(); flashScore(); }
    if (score % 400 === 0) toggleNight();
  }
  updateHUD();

  // Speed
  const baseSpeed = Math.min(14, 6 + score * 0.009);
  speed = dino.slow > 0 ? baseSpeed * 0.52 : baseSpeed;
  if (baseSpeed > maxSpeed) maxSpeed = baseSpeed;

  // Jump physics
  if (dino.jumping || dino.y < GY - DH) {
    dino.vy += GRAVITY;
    dino.y  += dino.vy;
    const gnd = GY - (dino.ducking ? DDH : DH);
    if (dino.y >= gnd) { dino.y = gnd; dino.vy = 0; dino.jumping = false; }
  }

  // Leg animation
  if (!dino.ducking && !dino.jumping) {
    const interval = Math.max(3, Math.floor(10 - speed * 0.6));
    if (tick % interval === 0) dino.legFrame = (dino.legFrame + 1) % 2;
  } else if (dino.jumping) dino.legFrame = 2;

  // Power-up timers
  if (dino.shield > 0) dino.shield--;
  if (dino.slow   > 0) dino.slow--;
  if (dino.boost  > 0) dino.boost--;

  // Ground / clouds
  gOff = (gOff + speed) % (CW * 6);
  clouds.forEach(c => { c.x -= speed * 0.14; if (c.x + c.w < 0) c.x = CW + Math.random() * 180 + 50; });

  // Spawn obstacles
  spawnTimer++;
  if (spawnTimer >= nextSpawn) {
    spawnObstacle();
    spawnTimer = 0;
    const minGap = Math.max(45, 90 - score * 0.05);
    nextSpawn = Math.floor(Math.random() * 55) + minGap;
  }
  obstacles.forEach(o => o.x -= speed);
  obstacles.forEach(o => {
    if (!o.passed && o.x + o.w < DINO_X) {
      o.passed = true;
      dodgeCount++;
      combo++;
      comboTimer = 130;
    }
  });
  obstacles = obstacles.filter(o => o.x + o.w + 60 > 0);

  // Spawn power-ups (after score 200)
  if (score > 200) {
    pupTimer++;
    if (pupTimer >= nextPup) {
      spawnPup();
      pupTimer = 0;
      nextPup = Math.floor(Math.random() * 300) + 360;
    }
  }
  pups.forEach(p => p.x -= speed);
  pups = pups.filter(p => {
    if (p.x + 20 < 0) return false;
    if (hitPup(p)) { collectPup(p); return false; }
    return true;
  });

  // Combo timer
  if (comboTimer > 0) comboTimer--;
  else combo = 0;

  // Particles
  updateParticles();

  // Collision
  if (checkCollision()) triggerGameOver();
}

// ══════════════════════════════════════════════════════
//  RENDER
// ══════════════════════════════════════════════════════
function render() {
  cx.save();
  // the impact jolt shakes the world, never the overlay
  if (Math.abs(shakeX) > 0.3 || Math.abs(shakeY) > 0.3)
    cx.translate(shakeX + (Math.random() - 0.5) * 2, shakeY + (Math.random() - 0.5) * 2);

  cx.fillStyle = pal.bg;
  FR(0, 0, CW, CH);

  drawStars();
  drawClouds();
  drawGround();

  pups.forEach(drawPup);
  obstacles.forEach(o => { cx.fillStyle = pal.fg; o.type === 'cactus' ? CACTUS[o.ct](o.x) : drawBird(o); });

  if (state !== 'start')
    drawDino(DINO_X, dino.y, dino.legFrame, dino.ducking, dino.dead);

  drawParticles();

  // Combo badge
  if (combo >= 3 && comboTimer > 0 && state === 'run') {
    cx.save();
    cx.globalAlpha = Math.min(1, comboTimer / 50);
    txt(`×${combo} COMBO`, DINO_X + 64, dino.y - 12, 8, '#ffd740');
    cx.restore();
  }

  cx.restore();

  // ── Overlays: drawn on the steady frame, always full-bleed ──
  if (state === 'start') drawStartScreen();
  if (state === 'dead')  drawDeadScreen();
}

// ══════════════════════════════════════════════════════
//  GAME CONTROL
// ══════════════════════════════════════════════════════
function spawnObstacle() {
  const useBird = score > 300 && Math.random() < 0.28;
  if (useBird) {
    const y = Math.random() < 0.5 ? GY - 80 : GY - 42;
    obstacles.push({ type: 'bird', x: CW + 20, y, w: 44, h: 22, passed: false });
  } else {
    const maxT = score < 100 ? 2 : score < 250 ? 3 : 5;
    const ct = Math.floor(Math.random() * maxT);
    obstacles.push({ type: 'cactus', ct, x: CW + 10, y: GY - CACTUS_H[ct], w: CACTUS_W[ct], h: CACTUS_H[ct], passed: false });
  }
}

function spawnPup() {
  const types = ['shield', 'slow', 'boost'];
  const type = types[Math.floor(Math.random() * 3)];
  pups.push({ type, x: CW + 20, y: GY - 22, w: 28, h: 28, phase: Math.random() * Math.PI * 2 });
}

function checkCollision() {
  if (dino.shield > 0) return false;
  const duck = dino.ducking;
  const dw = duck ? DDW : DW, dh = duck ? DDH : DH;
  const SH = 0.2, SHT = duck ? 0.48 : 0.18;
  const dx1 = DINO_X + dw * SH, dx2 = DINO_X + dw * (1 - SH);
  const dy1 = dino.y + dh * SHT, dy2 = dino.y + dh * (1 - 0.08);
  for (const o of obstacles) {
    const ox1 = o.x + o.w * 0.16, ox2 = o.x + o.w * 0.84;
    const oy1 = o.y + o.h * 0.16, oy2 = o.y + o.h * 0.96;
    if (dx2 > ox1 && dx1 < ox2 && dy2 > oy1 && dy1 < oy2) return true;
  }
  return false;
}

function hitPup(p) {
  const dw = dino.ducking ? DDW : DW, dh = dino.ducking ? DDH : DH;
  return DINO_X < p.x + p.w && DINO_X + dw > p.x && dino.y < p.y + p.h && dino.y + dh > p.y;
}

function collectPup(p) {
  SFX.powerup();
  spawnParticles(p.x, p.y, PUP_COL[p.type], 14);
  if (p.type === 'shield') dino.shield = PUP_DUR.shield;
  if (p.type === 'slow')   dino.slow   = PUP_DUR.slow;
  if (p.type === 'boost')  dino.boost  = PUP_DUR.boost;
}

function toggleNight() {
  nightMode = !nightMode;
  pal = nightMode ? { ...NIGHT } : { ...DAY };
  document.body.classList.toggle('night', nightMode);
  SFX.night();
}

function flashScore() {
  scEl.style.color = '#f4a259';
  setTimeout(() => scEl.style.color = '', 500);
}

function startGame() {
  state = 'run'; score = 0; frame = 0; tick = 0;
  dodgeCount = 0; combo = 0; comboTimer = 0;
  speed = 6; maxSpeed = 6;
  obstacles = []; pups = []; parts = [];
  spawnTimer = 0; nextSpawn = 105;
  pupTimer = 0; nextPup = 420;
  nightMode = false; pal = { ...DAY };
  document.body.classList.remove('night');
  gOff = 0; shakeX = 0; shakeY = 0;
  dino.y = GY - DH; dino.vy = 0;
  dino.jumping = false; dino.ducking = false; dino.dead = false; dino.legFrame = 0;
  dino.shield = 0; dino.slow = 0; dino.boost = 0;
  updateHUD();
}

function triggerGameOver() {
  state = 'dead'; dino.dead = true;
  shakeX = 11; shakeY = 7;
  spawnParticles(DINO_X + DW / 2, dino.y + DH / 2, pal.fg, 26);
  SFX.die();
  if (score > hiScore) {
    hiScore = score;
    localStorage.setItem('dr_hi', hiScore);
    hiEl.textContent = fmt(hiScore);
  }
}

function jump() {
  if (state === 'start' || state === 'dead') { startGame(); return; }
  if (state !== 'run' || dino.jumping || dino.ducking) return;
  dino.jumping = true; dino.vy = JUMP_V;
  SFX.jump();
}
function duckOn()  { if (state === 'run' && !dino.jumping) { dino.ducking = true;  dino.y = GY - DDH; } }
function duckOff() { if (state === 'run')                  { dino.ducking = false; if (!dino.jumping) dino.y = GY - DH; } }

// ── Controls ───────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.code === 'Space' || e.code === 'ArrowUp')   { e.preventDefault(); jump(); }
  if (e.code === 'ArrowDown') { e.preventDefault(); duckOn(); }
});
document.addEventListener('keyup', e => {
  if (e.code === 'ArrowDown') duckOff();
});
document.getElementById('bJump').addEventListener('touchstart', e => { e.preventDefault(); jump(); }, { passive: false });
document.getElementById('bDuck').addEventListener('touchstart', e => { e.preventDefault(); duckOn(); }, { passive: false });
document.getElementById('bDuck').addEventListener('touchend',   e => { e.preventDefault(); duckOff(); }, { passive: false });
C.addEventListener('click', jump);

// ── Boot ───────────────────────────────────────────────
document.fonts.ready.then(() => {
  cancelAnimationFrame(raf);
  loop();
});
