/* ═══════════════════════════════════════════════════
   IRONCLAD - script.js
   ═══════════════════════════════════════════════════ */

// Swap no-js -> js as the very first statement. If this file ever fails
// to parse, the class stays "no-js" and the reveal CSS keeps everything
// visible instead of leaving a blank page.
document.documentElement.classList.replace('no-js', 'js');

// Safety net: if a JS error stops the reveal observer from ever running,
// nothing on screen gets its .visible class. Detect that 1.2s after load
// and un-hide everything so the page is never blank.
window.addEventListener('load', () => setTimeout(() => {
  if (document.querySelector('.reveal.visible, .reveal-right.visible')) return;
  document.querySelectorAll('.reveal, .reveal-right').forEach(el => el.classList.add('visible'));
}, 1200));

// ── Countdown ────────────────────────────────────────
(function () {
  // Set deal end 30 days from now on first load, persist it
  let target;
  try {
    target = localStorage.getItem('ironclad_deal_end');
    if (!target || Date.now() > +target) {
      target = Date.now() + 30 * 24 * 60 * 60 * 1000;
      localStorage.setItem('ironclad_deal_end', target);
    }
  } catch (e) {
    target = Date.now() + 30 * 24 * 60 * 60 * 1000;
  }
  const el = document.getElementById('countdown');
  if (!el) return;
  function tick() {
    const diff = +target - Date.now();
    if (diff <= 0) { el.textContent = 'EXPIRED'; return; }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    el.textContent = `${d}d ${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`;
    setTimeout(tick, 1000);
  }
  tick();
})();

// ── Navbar scroll ────────────────────────────────────
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', scrollY > 30);
}, { passive: true });

// ── Hamburger ────────────────────────────────────────
document.getElementById('hamburger').addEventListener('click', function () {
  this.classList.toggle('open');
  document.getElementById('navLinks').classList.toggle('open');
});
document.querySelectorAll('#navLinks a').forEach(a => {
  a.addEventListener('click', () => {
    document.getElementById('hamburger').classList.remove('open');
    document.getElementById('navLinks').classList.remove('open');
  });
});

// ── Scroll Reveal ────────────────────────────────────
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); } });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal, .reveal-right').forEach(el => revealObs.observe(el));

// ── Stats counter ────────────────────────────────────
const statsObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const target = +el.dataset.target;
    const dur = 1600;
    const step = target / (dur / 16);
    let cur = 0;
    const t = setInterval(() => {
      cur = Math.min(cur + step, target);
      el.textContent = Math.floor(cur).toLocaleString();
      if (cur >= target) clearInterval(t);
    }, 16);
    statsObs.unobserve(el);
  });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-num').forEach(el => statsObs.observe(el));

// ── FAQ Accordion ─────────────────────────────────────
document.querySelectorAll('.faq-item').forEach(item => {
  item.querySelector('.faq-q').addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(o => o.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

// ── Testimonial Slider ────────────────────────────────
(function () {
  const track  = document.getElementById('testiTrack');
  const cards  = track.querySelectorAll('.testi-card');
  const dots   = document.getElementById('testiDots');
  const prev   = document.getElementById('testiPrev');
  const next   = document.getElementById('testiNext');
  let idx      = 0;

  function visibleCount() {
    const w = track.offsetWidth;
    if (w < 500) return 1;
    if (w < 800) return 2;
    return 3;
  }
  function maxIdx() { return Math.max(0, cards.length - visibleCount()); }

  // Build dots
  function buildDots() {
    dots.innerHTML = '';
    const count = maxIdx() + 1;
    for (let i = 0; i < count; i++) {
      const d = document.createElement('div');
      d.className = 'testi-dot' + (i === idx ? ' active' : '');
      d.addEventListener('click', () => go(i));
      dots.appendChild(d);
    }
  }

  function go(to) {
    idx = Math.max(0, Math.min(to, maxIdx()));
    const cardW = cards[0].offsetWidth + 16; // gap 1rem = 16px
    track.style.transform = `translateX(-${idx * cardW}px)`;
    track.style.transition = 'transform .4s ease';
    dots.querySelectorAll('.testi-dot').forEach((d, i) =>
      d.classList.toggle('active', i === idx)
    );
  }

  prev.addEventListener('click', () => go(idx - 1));
  next.addEventListener('click', () => go(idx + 1));

  // Auto-advance
  let auto = setInterval(() => go(idx + 1 > maxIdx() ? 0 : idx + 1), 5000);
  track.addEventListener('mouseenter', () => clearInterval(auto));
  track.addEventListener('mouseleave', () => { auto = setInterval(() => go(idx + 1 > maxIdx() ? 0 : idx + 1), 5000); });

  window.addEventListener('resize', () => { idx = 0; go(0); buildDots(); });
  buildDots();
})();

// ── AI Workout Planner ────────────────────────────────
const PLANS = {
  weight_loss: {
    beginner: {
      3: [
        { day: 'Monday',    ex: ['20 min brisk walk', 'Bodyweight squats 3×15', 'Push-ups 3×10', 'Plank 3×30s'] },
        { day: 'Wednesday', ex: ['Jumping jacks 3×30s', 'Lunges 3×12', 'Dumbbell rows 3×12', 'Mountain climbers 3×20'] },
        { day: 'Friday',    ex: ['30 min cardio (bike/treadmill)', 'Glute bridges 3×15', 'Lat pulldowns 3×12', 'Bicycle crunches 3×20'] },
      ],
      4: [
        { day: 'Monday',    ex: ['20 min brisk walk', 'Bodyweight squats 3×15', 'Push-ups 3×10', 'Plank 3×30s'] },
        { day: 'Tuesday',   ex: ['Jumping jacks 3×30s', 'Lunges 3×12', 'Dumbbell rows 3×12', 'Mountain climbers 3×20'] },
        { day: 'Thursday',  ex: ['30 min cardio', 'Glute bridges 3×15', 'Lat pulldowns 3×12', 'Bicycle crunches 3×20'] },
        { day: 'Saturday',  ex: ['Full body circuit ×3: burpees, squat jumps, push-ups, high knees (45s each)'] },
      ],
      5: [
        { day: 'Monday',    ex: ['25 min walk + 5 min jog', 'Bodyweight squats 3×15', 'Push-ups 3×12'] },
        { day: 'Tuesday',   ex: ['HIIT: 30s on / 30s off ×8 rounds (burpees, jumping jacks)'] },
        { day: 'Wednesday', ex: ['Lunges 3×12', 'Dumbbell rows 3×12', 'Plank 3×45s'] },
        { day: 'Friday',    ex: ['30 min steady-state cardio', 'Glute bridges 3×15', 'Crunches 3×20'] },
        { day: 'Saturday',  ex: ['Full body circuit ×4: squat, push-up, row, lunge (12 reps each)'] },
      ],
      6: [
        { day: 'Monday',    ex: ['Cardio 25 min', 'Squats 3×15', 'Push-ups 3×12'] },
        { day: 'Tuesday',   ex: ['HIIT 20 min', 'Plank 3×45s', 'Mountain climbers 3×20'] },
        { day: 'Wednesday', ex: ['Light walk 30 min (active recovery)'] },
        { day: 'Thursday',  ex: ['Lunges 3×12', 'Dumbbell rows 3×12', 'Glute bridges 3×15'] },
        { day: 'Friday',    ex: ['Cardio 35 min'] },
        { day: 'Saturday',  ex: ['Full body circuit ×4 (all major movements, 12 reps each)'] },
      ],
    },
    intermediate: {
      3: [
        { day: 'Monday',    ex: ['HIIT 25 min', 'Barbell squats 4×12', 'Bench press 4×10', 'Cable rows 4×12'] },
        { day: 'Wednesday', ex: ['Treadmill sprint intervals 20 min', 'Romanian deadlifts 4×10', 'Shoulder press 4×10', 'Tricep dips 4×12'] },
        { day: 'Friday',    ex: ['Cardio 40 min', 'Bulgarian split squats 3×10', 'Pull-ups 3×8', 'Core circuit 3×15'] },
      ],
      4: [
        { day: 'Monday',    ex: ['Upper: Bench 4×10, Pull-ups 4×8, OHP 3×10, Rows 3×12'] },
        { day: 'Tuesday',   ex: ['Lower: Squats 4×10, RDL 4×10, Leg press 3×12, Calf raises 3×20'] },
        { day: 'Thursday',  ex: ['HIIT 30 min + Core (4 exercises, 3×15)'] },
        { day: 'Saturday',  ex: ['Full body strength circuit + 20 min steady cardio'] },
      ],
      5: [
        { day: 'Monday',    ex: ['Push: Bench 4×10, OHP 3×10, Tricep pushdown 3×12'] },
        { day: 'Tuesday',   ex: ['Pull: Pull-ups 4×8, Rows 4×12, Bicep curls 3×12'] },
        { day: 'Wednesday', ex: ['Legs: Squats 4×10, RDL 4×10, Leg curl 3×12'] },
        { day: 'Friday',    ex: ['HIIT 30 min'] },
        { day: 'Saturday',  ex: ['Full body + 20 min cardio'] },
      ],
      6: [
        { day: 'Monday',    ex: ['Push day (Bench, OHP, Triceps)'] },
        { day: 'Tuesday',   ex: ['Pull day (Pull-ups, Rows, Biceps)'] },
        { day: 'Wednesday', ex: ['Legs (Squats, RDL, Lunges)'] },
        { day: 'Thursday',  ex: ['HIIT 30 min + Core'] },
        { day: 'Friday',    ex: ['Upper body hypertrophy'] },
        { day: 'Saturday',  ex: ['LISS cardio 45 min'] },
      ],
    },
    advanced: {
      3: [
        { day: 'Monday',    ex: ['Barbell squats 5×5', 'Deadlift 4×5', 'Bench press 4×8', 'HIIT finisher 15 min'] },
        { day: 'Wednesday', ex: ['Power cleans 4×5', 'Pull-ups weighted 4×8', 'OHP 4×8', 'Sprint intervals 20 min'] },
        { day: 'Friday',    ex: ['Leg press 4×12', 'Incline bench 4×10', 'Cable rows 4×12', 'AMRAP finisher 10 min'] },
      ],
      4: [
        { day: 'Monday',    ex: ['Lower power: Squat 5×5, RDL 4×5, Leg press 3×10'] },
        { day: 'Tuesday',   ex: ['Upper power: Bench 5×5, Pull-ups weighted 4×6, OHP 4×6'] },
        { day: 'Thursday',  ex: ['Metabolic conditioning: 5 rounds 400m run + 15 KB swings + 10 box jumps'] },
        { day: 'Saturday',  ex: ['Full body hypertrophy + 20 min incline treadmill'] },
      ],
      5: [
        { day: 'Monday',    ex: ['Push power (Bench 5×5, OHP 4×5)'] },
        { day: 'Tuesday',   ex: ['Pull power (Weighted pull-ups 5×5, Deadlift 4×5)'] },
        { day: 'Wednesday', ex: ['Legs power (Squat 5×5, Bulgarian split 4×8)'] },
        { day: 'Friday',    ex: ['HIIT 35 min + Core circuit'] },
        { day: 'Saturday',  ex: ['Full body volume + cardio'] },
      ],
      6: [
        { day: 'Monday',    ex: ['Upper power'] },
        { day: 'Tuesday',   ex: ['Lower power'] },
        { day: 'Wednesday', ex: ['Metcon (conditioning WOD)'] },
        { day: 'Thursday',  ex: ['Upper hypertrophy'] },
        { day: 'Friday',    ex: ['Lower hypertrophy'] },
        { day: 'Saturday',  ex: ['Long cardio 50 min + mobility work'] },
      ],
    },
  },
  muscle: {
    beginner: {
      3: [
        { day: 'Monday',    ex: ['Bench press 3×10', 'Barbell rows 3×10', 'Lat pulldown 3×12', 'Bicep curls 3×12'] },
        { day: 'Wednesday', ex: ['Squats 3×10', 'Romanian deadlifts 3×10', 'Leg press 3×12', 'Calf raises 3×20'] },
        { day: 'Friday',    ex: ['Overhead press 3×10', 'Incline dumbbell press 3×10', 'Face pulls 3×15', 'Tricep pushdown 3×12'] },
      ],
      4: [
        { day: 'Monday',    ex: ['Upper A: Bench 4×10, Rows 4×10, Curls 3×12, Pushdown 3×12'] },
        { day: 'Tuesday',   ex: ['Lower A: Squats 4×10, RDL 3×10, Leg curl 3×12, Calf raises 4×15'] },
        { day: 'Thursday',  ex: ['Upper B: OHP 4×10, Pull-ups 3×8, Incline fly 3×12, Lateral raises 3×15'] },
        { day: 'Friday',    ex: ['Lower B: Leg press 4×12, Lunges 3×12, Hip thrust 3×15'] },
      ],
      5: [
        { day: 'Monday',    ex: ['Chest + Triceps'] },
        { day: 'Tuesday',   ex: ['Back + Biceps'] },
        { day: 'Wednesday', ex: ['Legs + Glutes'] },
        { day: 'Friday',    ex: ['Shoulders + Traps'] },
        { day: 'Saturday',  ex: ['Arms + Core'] },
      ],
      6: [
        { day: 'Monday',    ex: ['Chest 4 exercises'] },
        { day: 'Tuesday',   ex: ['Back 4 exercises'] },
        { day: 'Wednesday', ex: ['Legs 4 exercises'] },
        { day: 'Thursday',  ex: ['Shoulders 3 exercises'] },
        { day: 'Friday',    ex: ['Arms 4 exercises'] },
        { day: 'Saturday',  ex: ['Weak points + Core'] },
      ],
    },
    intermediate: {
      3: [
        { day: 'Monday',    ex: ['Bench 4×10, Incline 3×10, Rows 4×10, Pull-ups 3×8, Curls 3×12'] },
        { day: 'Wednesday', ex: ['Squats 4×8, RDL 4×10, Leg press 3×12, Hip thrust 3×15, Calves 4×15'] },
        { day: 'Friday',    ex: ['OHP 4×10, Lateral raises 3×15, Tricep dips 3×12, Face pulls 3×15, Shrugs 3×15'] },
      ],
      4: [
        { day: 'Monday',    ex: ['Upper Push: Bench 4×10, OHP 4×10, Incline fly 3×12, Lateral raises 3×15'] },
        { day: 'Tuesday',   ex: ['Lower: Squats 5×8, RDL 4×10, Leg curl 3×12, Calf raises 4×20'] },
        { day: 'Thursday',  ex: ['Upper Pull: Weighted pull-ups 4×8, Rows 4×10, Shrugs 3×12, Bicep curls 4×12'] },
        { day: 'Saturday',  ex: ['Lower hypertrophy + core: Leg press, lunges, hip thrust, abs circuit'] },
      ],
      5: [
        { day: 'Monday',    ex: ['Push A: Bench 4×10, OHP 3×10, Triceps 3×12'] },
        { day: 'Tuesday',   ex: ['Pull A: Pull-ups 4×8, Rows 4×10, Biceps 3×12'] },
        { day: 'Wednesday', ex: ['Legs A: Squats 5×8, Leg curl 3×12, Calf raises 4×15'] },
        { day: 'Friday',    ex: ['Push B: Incline bench, Laterals, Cables'] },
        { day: 'Saturday',  ex: ['Pull B + Legs B: Deadlift, Hip thrust, Curls'] },
      ],
      6: [
        { day: 'Monday',    ex: ['Chest'] },
        { day: 'Tuesday',   ex: ['Back'] },
        { day: 'Wednesday', ex: ['Legs'] },
        { day: 'Thursday',  ex: ['Shoulders'] },
        { day: 'Friday',    ex: ['Arms'] },
        { day: 'Saturday',  ex: ['Weak points + Core + stretching'] },
      ],
    },
    advanced: {
      4: [
        { day: 'Monday',    ex: ['Upper power: Bench 5×5, Pull-ups 5×5, OHP 4×6'] },
        { day: 'Tuesday',   ex: ['Lower power: Squat 5×5, Deadlift 4×4, RDL 3×8'] },
        { day: 'Thursday',  ex: ['Upper volume: Incline 4×10, Cable rows 4×12, Laterals 4×15, Arms 4×12'] },
        { day: 'Saturday',  ex: ['Lower volume: Leg press 4×12, Lunges 4×10, Hip thrust 4×12, Calves 5×20'] },
      ],
      5: [
        { day: 'Monday',    ex: ['Chest power + Triceps'] },
        { day: 'Tuesday',   ex: ['Back power + Biceps'] },
        { day: 'Wednesday', ex: ['Legs power'] },
        { day: 'Friday',    ex: ['Shoulders volume'] },
        { day: 'Saturday',  ex: ['Arms + Core + weak points'] },
      ],
      6: [
        { day: 'Monday',    ex: ['Chest power (Bench 5×5, weighted dips)'] },
        { day: 'Tuesday',   ex: ['Back power (Deadlift 5×3, weighted pull-ups)'] },
        { day: 'Wednesday', ex: ['Legs (Squat 5×5, hack squat, RDL)'] },
        { day: 'Thursday',  ex: ['Shoulders (OHP 5×5, laterals, face pulls)'] },
        { day: 'Friday',    ex: ['Arms (Barbell curls, skull crushers, cables)'] },
        { day: 'Saturday',  ex: ['Weak point hypertrophy + core'] },
      ],
    },
  },
  endurance: {
    beginner: {
      3: [
        { day: 'Monday',    ex: ['30 min easy jog', 'Bodyweight squats 3×15', 'Lunges 3×12', 'Core circuit 3×'] },
        { day: 'Wednesday', ex: ['20 min swim or bike', 'Step-ups 3×15', 'Hip bridges 3×20'] },
        { day: 'Friday',    ex: ['35 min brisk walk/jog', 'Calf raises 4×20', 'Plank 3×45s'] },
      ],
      4: [
        { day: 'Monday',    ex: ['30 min steady jog'] },
        { day: 'Wednesday', ex: ['Interval run: 6×400m with 90s rest'] },
        { day: 'Friday',    ex: ['45 min easy cardio (bike or swim)'] },
        { day: 'Sunday',    ex: ['Long run 50–60 min (slow pace)'] },
      ],
      5: [
        { day: 'Monday',    ex: ['30 min easy run'] },
        { day: 'Tuesday',   ex: ['Strength circuit: squats, lunges, push-ups 3×15'] },
        { day: 'Wednesday', ex: ['Intervals: 8×200m sprints'] },
        { day: 'Friday',    ex: ['40 min tempo run'] },
        { day: 'Sunday',    ex: ['60 min long slow run'] },
      ],
      6: [
        { day: 'Monday',    ex: ['Easy run 30 min'] },
        { day: 'Tuesday',   ex: ['Strength 45 min'] },
        { day: 'Wednesday', ex: ['Intervals 30 min'] },
        { day: 'Thursday',  ex: ['Cross-train (swim/bike) 40 min'] },
        { day: 'Friday',    ex: ['Tempo run 30 min'] },
        { day: 'Sunday',    ex: ['Long run 60–70 min'] },
      ],
    },
    intermediate: {
      4: [
        { day: 'Monday',    ex: ['Easy run 45 min'] },
        { day: 'Tuesday',   ex: ['Strength training 50 min'] },
        { day: 'Thursday',  ex: ['Interval run: 10×400m'] },
        { day: 'Saturday',  ex: ['Long run 75 min'] },
      ],
      5: [
        { day: 'Monday',    ex: ['Easy run 40 min'] },
        { day: 'Tuesday',   ex: ['Strength + core 50 min'] },
        { day: 'Wednesday', ex: ['Tempo run 35 min'] },
        { day: 'Friday',    ex: ['Intervals 12×400m'] },
        { day: 'Sunday',    ex: ['Long run 90 min'] },
      ],
      6: [
        { day: 'Monday',    ex: ['Easy run 40 min'] },
        { day: 'Tuesday',   ex: ['Strength 50 min'] },
        { day: 'Wednesday', ex: ['Intervals'] },
        { day: 'Thursday',  ex: ['Cross-train 45 min'] },
        { day: 'Friday',    ex: ['Tempo run 40 min'] },
        { day: 'Sunday',    ex: ['Long run 100 min'] },
      ],
    },
    advanced: {
      5: [
        { day: 'Monday',    ex: ['Recovery run 50 min easy'] },
        { day: 'Tuesday',   ex: ['Strength + plyometrics 60 min'] },
        { day: 'Wednesday', ex: ['VO₂ max intervals: 6×1000m'] },
        { day: 'Friday',    ex: ['Tempo run 50 min at race pace'] },
        { day: 'Sunday',    ex: ['Long run 110+ min'] },
      ],
      6: [
        { day: 'Monday',    ex: ['Easy run 50 min'] },
        { day: 'Tuesday',   ex: ['Strength + plyos'] },
        { day: 'Wednesday', ex: ['Intervals 12×800m'] },
        { day: 'Thursday',  ex: ['Hilly run 50 min'] },
        { day: 'Friday',    ex: ['Tempo 45 min'] },
        { day: 'Sunday',    ex: ['Long run 120 min'] },
      ],
    },
  },
  flexibility: {
    beginner: {
      3: [
        { day: 'Monday',    ex: ['Sun salutation 3×', 'Hip flexor stretch 2×60s each', 'Cat-cow 2×10', 'Seated forward fold 3×30s'] },
        { day: 'Wednesday', ex: ['Yin yoga: pigeon pose 2×90s, butterfly 2×60s, supine twist 2×60s each'] },
        { day: 'Friday',    ex: ['Full body stretching routine 30 min (all major muscle groups)'] },
      ],
      4: [
        { day: 'Monday',    ex: ['Upper body mobility: shoulder circles, chest stretch, thoracic rotation'] },
        { day: 'Wednesday', ex: ['Lower body mobility: hip flexor, hamstring, pigeon, figure-four'] },
        { day: 'Friday',    ex: ['Yoga flow 30 min'] },
        { day: 'Sunday',    ex: ['Yin yoga 40 min'] },
      ],
      5: [
        { day: 'Monday',    ex: ['Upper mobility 20 min'] },
        { day: 'Tuesday',   ex: ['Lower mobility 20 min'] },
        { day: 'Wednesday', ex: ['Yoga flow 30 min'] },
        { day: 'Friday',    ex: ['Yin yoga 40 min'] },
        { day: 'Saturday',  ex: ['Full body stretch + breathwork 30 min'] },
      ],
      6: [
        { day: 'Monday',    ex: ['Shoulders + chest mobility'] },
        { day: 'Tuesday',   ex: ['Hips + hamstrings'] },
        { day: 'Wednesday', ex: ['Spine + thoracic mobility'] },
        { day: 'Thursday',  ex: ['Yoga flow 30 min'] },
        { day: 'Friday',    ex: ['Yin yoga 40 min'] },
        { day: 'Sunday',    ex: ['Full body + meditation 30 min'] },
      ],
    },
    intermediate: {
      4: [
        { day: 'Monday',    ex: ['Dynamic stretching + mobility drills 30 min'] },
        { day: 'Tuesday',   ex: ['Yoga flow 45 min (Vinyasa)'] },
        { day: 'Thursday',  ex: ['Deep stretch: splits prep, backbends, hip openers 40 min'] },
        { day: 'Saturday',  ex: ['Yin yoga 60 min'] },
      ],
      5: [
        { day: 'Monday',    ex: ['Dynamic warm-up + upper mobility 25 min'] },
        { day: 'Tuesday',   ex: ['Vinyasa yoga 40 min'] },
        { day: 'Wednesday', ex: ['Hip flexor + hamstring deep stretch 30 min'] },
        { day: 'Friday',    ex: ['Backbend + chest opening sequence 30 min'] },
        { day: 'Sunday',    ex: ['Yin yoga 60 min'] },
      ],
      6: [
        { day: 'Monday',    ex: ['Mobility flow A'] },
        { day: 'Tuesday',   ex: ['Yoga flow 45 min'] },
        { day: 'Wednesday', ex: ['Hip + hamstring deep stretch'] },
        { day: 'Thursday',  ex: ['Shoulder + chest opening'] },
        { day: 'Friday',    ex: ['Splits + backbend work'] },
        { day: 'Sunday',    ex: ['Yin yoga 60 min + breathwork'] },
      ],
    },
    advanced: {
      5: [
        { day: 'Monday',    ex: ['Advanced hip mobility: full lotus prep, pigeon variations 40 min'] },
        { day: 'Tuesday',   ex: ['Ashtanga-style yoga 60 min'] },
        { day: 'Wednesday', ex: ['Backbend intensive: wheel, king pigeon, camel 30 min'] },
        { day: 'Friday',    ex: ['Splits + shoulder flexibility deep work 40 min'] },
        { day: 'Sunday',    ex: ['Yin yoga 75 min'] },
      ],
      6: [
        { day: 'Monday',    ex: ['Hip deep-dive 40 min'] },
        { day: 'Tuesday',   ex: ['Ashtanga yoga 60 min'] },
        { day: 'Wednesday', ex: ['Backbends + inversions 40 min'] },
        { day: 'Thursday',  ex: ['Shoulder + wrist mobility'] },
        { day: 'Friday',    ex: ['Splits intensive'] },
        { day: 'Sunday',    ex: ['Yin + Nidra 75 min'] },
      ],
    },
  },
};

// Chip selection logic
function setupChipGroup(groupId) {
  document.querySelectorAll(`#${groupId} .chip`).forEach(c => {
    c.addEventListener('click', () => {
      document.querySelectorAll(`#${groupId} .chip`).forEach(x => x.classList.remove('active'));
      c.classList.add('active');
    });
  });
}
['goalGroup','levelGroup','daysGroup'].forEach(setupChipGroup);

document.getElementById('genPlanBtn').addEventListener('click', () => {
  const goal  = document.querySelector('#goalGroup .chip.active')?.dataset.val || 'weight_loss';
  const level = document.querySelector('#levelGroup .chip.active')?.dataset.val || 'beginner';
  const days  = document.querySelector('#daysGroup .chip.active')?.dataset.val || '4';

  const goalLabel  = { weight_loss:'Weight Loss', muscle:'Muscle Building', endurance:'Endurance', flexibility:'Flexibility' }[goal];
  const levelLabel = level.charAt(0).toUpperCase() + level.slice(1);

  // Get plan, fall back gracefully
  let plan = PLANS[goal]?.[level]?.[+days];
  if (!plan) {
    // try closest day count
    const available = Object.keys(PLANS[goal]?.[level] || {}).map(Number).sort((a,b)=>a-b);
    if (!available.length) { plan = [{ day:'Day 1', ex:['Rest & stretch - plan unavailable for this combo'] }]; }
    else {
      const closest = available.reduce((a,b) => Math.abs(b - +days) < Math.abs(a - +days) ? b : a);
      plan = PLANS[goal][level][closest];
    }
  }

  const result = document.getElementById('aiResult');
  const title  = document.getElementById('aiResultTitle');
  const grid   = document.getElementById('aiPlanGrid');

  title.textContent = `${goalLabel} · ${levelLabel} · ${days} days/week`;
  grid.innerHTML = plan.map(d => `
    <div class="ai-day">
      <div class="ai-day-name"><i class="fas fa-calendar-day" style="font-size:.65rem;margin-right:.35rem"></i>${d.day}</div>
      <div class="ai-exercises">${d.ex.map(e => `• ${e}`).join('<br>')}</div>
    </div>`).join('');

  result.classList.remove('hidden');
  result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

document.getElementById('copyPlan').addEventListener('click', () => {
  const title = document.getElementById('aiResultTitle').textContent;
  const days  = [...document.querySelectorAll('.ai-day')].map(d =>
    d.querySelector('.ai-day-name').textContent + ':\n' +
    d.querySelector('.ai-exercises').innerText
  ).join('\n\n');
  navigator.clipboard.writeText(`IRONCLAD - ${title}\n\n${days}`)
    .then(() => {
      const btn = document.getElementById('copyPlan');
      btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
      setTimeout(() => btn.innerHTML = '<i class="fas fa-copy"></i> Copy Plan', 2000);
    });
});

// ── Number steppers (brutalist counter) ──────────────
(function () {
  document.querySelectorAll('.bmi-inputs input[type="number"]').forEach(input => {
    const labelText = (input.closest('.bmi-field')?.querySelector('label')?.textContent || 'value').trim();
    input.style.marginTop = '';
    const wrap = document.createElement('div');
    wrap.className = 'num-stepper';
    input.parentNode.insertBefore(wrap, input);

    const btn = (glyph, dir) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'num-btn';
      b.textContent = glyph;
      b.tabIndex = -1;
      b.setAttribute('aria-label', (dir < 0 ? 'Decrease ' : 'Increase ') + labelText);
      b.addEventListener('click', () => {
        const step = +(input.step) || 1;
        const min = input.min !== '' ? +input.min : -Infinity;
        const max = input.max !== '' ? +input.max : Infinity;
        const base = input.value === '' ? +(input.placeholder) || 0 : +input.value;
        input.value = Math.min(max, Math.max(min, Math.round((base + dir * step) * 100) / 100));
        input.dispatchEvent(new Event('input', { bubbles: true }));
      });
      return b;
    };

    wrap.appendChild(btn('−', -1));
    wrap.appendChild(input);
    wrap.appendChild(btn('+', 1));
  });
})();

// ── BMI Calculator ────────────────────────────────────
const metricBtn   = document.getElementById('metricBtn');
const imperialBtn = document.getElementById('imperialBtn');
const bmiMetric   = document.getElementById('bmiMetric');
const bmiImperial = document.getElementById('bmiImperial');
let useMetric = true;

metricBtn.addEventListener('click', () => {
  useMetric = true;
  metricBtn.classList.add('active'); imperialBtn.classList.remove('active');
  bmiMetric.classList.remove('hidden'); bmiImperial.classList.add('hidden');
});
imperialBtn.addEventListener('click', () => {
  useMetric = false;
  imperialBtn.classList.add('active'); metricBtn.classList.remove('active');
  bmiImperial.classList.remove('hidden'); bmiMetric.classList.add('hidden');
});

document.getElementById('calcBmi').addEventListener('click', () => {
  let bmi;
  if (useMetric) {
    const w = +document.getElementById('weightKg').value;
    const h = +document.getElementById('heightCm').value / 100;
    if (!w || !h) return;
    bmi = w / (h * h);
  } else {
    const w = +document.getElementById('weightLbs').value;
    const ft = +document.getElementById('heightFt').value;
    const inc = +document.getElementById('heightIn').value || 0;
    const totalIn = ft * 12 + inc;
    if (!w || !totalIn) return;
    bmi = (w * 703) / (totalIn * totalIn);
  }

  bmi = Math.round(bmi * 10) / 10;
  let cat, color, advice;
  if (bmi < 18.5) {
    cat = 'Underweight'; color = '#3498db';
    advice = '🥗 You may need to increase calorie intake with nutrient-dense foods. Consider working with our nutritionist and a strength training plan to build healthy mass.';
  } else if (bmi < 25) {
    cat = 'Normal Weight'; color = '#2ecc71';
    advice = '✅ Great work! You\'re in a healthy BMI range. Maintain your lifestyle with consistent exercise and a balanced diet. Consider our Pro plan for continued improvement.';
  } else if (bmi < 30) {
    cat = 'Overweight'; color = '#f39c12';
    advice = '🔥 A focused cardio + strength routine combined with a calorie-controlled diet can bring you to a healthy range. Try our AI Workout Planner with "Weight Loss" goal!';
  } else {
    cat = 'Obese'; color = '#e74c3c';
    advice = '⚠️ We strongly recommend starting with low-impact cardio (walking, swimming) and consulting our trainers. Small consistent steps lead to big changes - we\'re here for you.';
  }

  // Gauge: BMI 10–40 range maps to 0–283 dashoffset
  const pct = Math.max(0, Math.min(1, (bmi - 10) / 30));
  const offset = 283 - pct * 283;

  const result = document.getElementById('bmiResult');
  result.classList.remove('hidden');
  document.getElementById('bmiNumber').textContent = bmi;
  document.getElementById('bmiCatText').textContent = cat;
  document.getElementById('gaugeFill').style.stroke = color;
  document.getElementById('bmiCatText').style.fill = color;
  document.getElementById('gaugeFill').style.strokeDashoffset = 283;
  document.getElementById('bmiAdvice').textContent = advice;

  setTimeout(() => {
    document.getElementById('gaugeFill').style.strokeDashoffset = offset;
  }, 60);

  result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});
