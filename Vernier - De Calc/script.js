/* ══════════════════════════════════════════════════════════
   VERNIER - precision calculation instrument  |  script.js
   Sheets: 01 standard · 02 scientific · 03 programmer ·
           04 converter · 05 date · 06 finance
   ══════════════════════════════════════════════════════════ */

'use strict';

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

/* ── Sheet metadata ─────────────────────────────────────── */
const SHEETS = {
  standard:   { no: '01', dwg: 'VRN-1001', title: 'STANDARD ARITHMETIC UNIT' },
  scientific: { no: '02', dwg: 'VRN-1002', title: 'SCIENTIFIC COMPUTATION UNIT' },
  programmer: { no: '03', dwg: 'VRN-1003', title: 'BASE & BITWISE REGISTER UNIT' },
  converter:  { no: '04', dwg: 'VRN-1004', title: 'SCHEDULE OF UNIT EQUIVALENTS' },
  date:       { no: '05', dwg: 'VRN-1005', title: 'CALENDAR INTERVAL GAUGE' },
  finance:    { no: '06', dwg: 'VRN-1006', title: 'AMORTISATION & GROWTH TABLES' },
};

let mode = 'standard';

/* ── Toast ──────────────────────────────────────────────── */
const toastEl = $('#toast');
let toastTimer;
function toast(msg) {
  toastEl.textContent = '- ' + msg.toUpperCase() + ' -';
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1700);
}

/* ── Number formatting ──────────────────────────────────── */
function fmt(n) {
  if (typeof n !== 'number') return String(n);
  if (!isFinite(n)) return n > 0 ? 'Infinity' : '-Infinity';
  let s = parseFloat(n.toPrecision(12)).toString();
  if (s.replace('-', '').replace('.', '').length > 14) s = n.toExponential(6);
  return s;
}
function fmtMoney(n) {
  return n.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
}

/* ════════════════════════════════════════════════════════
   CALC ENGINE - sheets 01 + 02
   ══════════════════════════════════════════════════════ */
let expr       = '';
let result     = '0';
let justEvaled = false;
let memory     = 0;
let lastAns    = 0;
let hasAns     = false;
let degMode    = true;

const roExpr    = $('#roExpr');
const roResult  = $('#roResult');
const memBadge  = $('#memBadge');
const ansBadge  = $('#ansBadge');
const angleTag  = $('#angleTag');

/* function names, longest first so replacements never overlap */
const FN_NAMES = ['asin','acos','atan','sinh','cosh','tanh','sin','cos','tan','log','ln','abs'];

function makeFns() {
  const toRad   = (x) => degMode ? x * Math.PI / 180 : x;
  const fromRad = (x) => degMode ? x * 180 / Math.PI : x;
  return [
    (x) => fromRad(Math.asin(x)),
    (x) => fromRad(Math.acos(x)),
    (x) => fromRad(Math.atan(x)),
    Math.sinh, Math.cosh, Math.tanh,
    (x) => Math.sin(toRad(x)),
    (x) => Math.cos(toRad(x)),
    (x) => Math.tan(toRad(x)),
    Math.log10, Math.log, Math.abs,
  ];
}

function factorial(n) {
  if (!Number.isInteger(n) || n < 0) throw new Error('n! needs a whole number');
  if (n > 170) return Infinity;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

/* wrap every factorial operand:  "(2+3)!" -> "@F((2+3))" */
function factorialize(e) {
  let idx;
  while ((idx = e.indexOf('!')) !== -1) {
    let start = idx - 1;
    if (start < 0) throw new Error('Bad factorial');
    if (e[start] === ')') {
      let depth = 0;
      while (start >= 0) {
        if (e[start] === ')') depth++;
        else if (e[start] === '(') { depth--; if (depth === 0) break; }
        start--;
      }
      if (depth !== 0) throw new Error('Bad factorial');
      // include a function/marker name directly before the '('
      while (start > 0 && /[@\w.]/.test(e[start - 1])) start--;
    } else {
      while (start >= 0 && /[\d.]/.test(e[start])) start--;
      start++;
      if (start > idx - 1) throw new Error('Bad factorial');
    }
    e = e.slice(0, start) + '@F(' + e.slice(start, idx) + ')' + e.slice(idx + 1);
  }
  return e;
}

function safeEval(raw) {
  let e = raw
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/\^/g, '**')
    .replace(/²/g, '**2')
    .replace(/³/g, '**3')
    .replace(/π/g, '(3.141592653589793)')
    .replace(/ℯ/g, '(2.718281828459045)')
    .replace(/\bmod\b/g, '%')
    .replace(/Ans/g, `(${lastAns})`);

  // function names -> numeric markers
  FN_NAMES.forEach((name, i) => { e = e.split(name + '(').join('@' + i + '('); });
  e = e.split('√(').join('@S(').split('∛(').join('@C(');

  e = factorialize(e);

  // sanity check - after removing every known token, nothing may remain
  const stripped = e
    .replace(/\d+\.?\d*e[+-]?\d+/gi, '')   // scientific-notation literals (from Ans)
    .replace(/@\d+/g, '')
    .replace(/@[FSC]/g, '')
    .replace(/[\d+\-*/.()%\s]/g, '');
  if (stripped.length > 0) throw new Error('Invalid expression');

  // markers -> runtime calls
  e = e
    .replace(/@(\d+)\(/g, '_f[$1](')
    .replace(/@F\(/g, '_ft(')
    .replace(/@S\(/g, 'Math.sqrt(')
    .replace(/@C\(/g, 'Math.cbrt(');

  // eslint-disable-next-line no-new-func
  const val = Function('_f', '_ft', 'Math', `"use strict"; return (${e});`)(makeFns(), factorial, Math);
  if (typeof val !== 'number' || !isFinite(val)) {
    throw new Error(Number.isNaN(val) ? 'Not a number' : 'Out of range');
  }
  return val;
}

function autoCloseParens(e) {
  const opens  = (e.match(/\(/g) || []).length;
  const closes = (e.match(/\)/g) || []).length;
  return e + ')'.repeat(Math.max(0, opens - closes));
}

function updateCalcDisplay() {
  roExpr.textContent = expr || ' ';
  const len = result.length;
  roResult.className = 'ro-result' +
    (result === 'Error' ? ' err' : len > 14 ? ' xsm' : len > 10 ? ' sm' : '');
  roResult.textContent = result;
  memBadge.classList.toggle('hidden', memory === 0);
  ansBadge.classList.toggle('hidden', !hasAns);
  roExpr.scrollLeft = roExpr.scrollWidth;
}

function livePreview() {
  if (!expr || justEvaled) return;
  try { result = fmt(safeEval(autoCloseParens(expr))); }
  catch { /* keep last good result */ }
}

function appendFn(fn) {
  if (justEvaled) { expr = fn + result; justEvaled = false; }
  else expr += fn;
}

function getCurrentValue() {
  try {
    if (justEvaled) return parseFloat(result);
    if (!expr) return parseFloat(result);
    return safeEval(autoCloseParens(expr));
  } catch { return null; }
}

const MULTI_TOKENS = [
  'asin(','acos(','atan(','sinh(','cosh(','tanh(',
  'sin(','cos(','tan(','log(','abs(','ln(',
  '√(','∛(',' mod ','Ans',
];

function handleAction(action) {
  const ops = ['+', '−', '×', '÷', '^'];

  if (ops.includes(action)) {
    if (justEvaled) { expr = result; justEvaled = false; }
    if (expr && ops.includes(expr.slice(-1))) expr = expr.slice(0, -1);
    if (!expr) expr = result === 'Error' ? '0' : result;
    expr += action;
    highlightOp(action);
    updateCalcDisplay();
    return;
  }

  switch (action) {
    case '0': case '1': case '2': case '3': case '4':
    case '5': case '6': case '7': case '8': case '9': {
      if (justEvaled) { expr = ''; justEvaled = false; }
      if (action === '0' && expr === '0') break;
      expr += action;
      break;
    }
    case '.': {
      if (justEvaled) { expr = ''; justEvaled = false; }
      const lastNum = expr.split(/[+\-−×÷^(!²³\s]/).pop();
      if (!lastNum.includes('.')) {
        if (!lastNum) expr += '0';
        expr += '.';
      }
      break;
    }

    case 'AC':
      expr = ''; result = '0'; justEvaled = false;
      clearOpHighlight();
      break;

    case 'backspace': {
      if (justEvaled) { expr = ''; result = '0'; justEvaled = false; break; }
      const tok = MULTI_TOKENS.find(t => expr.endsWith(t));
      expr = tok ? expr.slice(0, -tok.length) : expr.slice(0, -1);
      if (!expr) result = '0';
      break;
    }

    case '=': {
      if (!expr) break;
      const fullExpr = autoCloseParens(expr);
      try {
        const val = safeEval(fullExpr);
        const res = fmt(val);
        lastAns = val; hasAns = true;
        addHistory(fullExpr, res, mode === 'scientific' ? 'SCI' : 'STD');
        result = res;
        expr = fullExpr;
        justEvaled = true;
        clearOpHighlight();
      } catch (err) {
        result = 'Error';
        toast(err.message || 'Invalid expression');
        setTimeout(() => {
          if (result === 'Error') { result = '0'; expr = ''; updateCalcDisplay(); }
        }, 1400);
      }
      break;
    }

    case 'negate': {
      if (justEvaled) {
        result = result.startsWith('-') ? result.slice(1) : '-' + result;
        expr = result; justEvaled = false;
      } else if (expr) {
        const m = expr.match(/^(.*?)(-?\d+\.?\d*)$/);
        if (m) {
          const num = m[2];
          expr = m[1] + (num.startsWith('-') ? num.slice(1) : '-' + num);
        }
      }
      break;
    }

    case '%': {
      if (!expr) break;
      const m = expr.match(/^(.*[+−×÷])(-?\d*\.?\d+)$/);
      if (m) {
        try {
          const base = safeEval(autoCloseParens(m[1].slice(0, -1)));
          const pct  = parseFloat(m[2]);
          expr = m[1] + fmt(base * pct / 100);
        } catch { expr += '/100'; }
      } else {
        expr += '/100';
      }
      break;
    }

    /* memory + ans */
    case 'MC': memory = 0; updateCalcDisplay(); toast('Memory cleared'); return;
    case 'MR': {
      if (justEvaled) { expr = ''; justEvaled = false; }
      expr += fmt(memory);
      break;
    }
    case 'M+': { const v = getCurrentValue(); if (v !== null) { memory += v; toast('Added to memory'); } updateCalcDisplay(); return; }
    case 'M-': { const v = getCurrentValue(); if (v !== null) { memory -= v; toast('Subtracted from memory'); } updateCalcDisplay(); return; }
    case 'MS': { const v = getCurrentValue(); if (v !== null) { memory = v; toast('Stored to memory'); } updateCalcDisplay(); return; }
    case 'ans': {
      if (!hasAns) { toast('No result yet'); return; }
      if (justEvaled) { expr = ''; justEvaled = false; }
      expr += 'Ans';
      break;
    }

    /* scientific */
    case 'sin': case 'cos': case 'tan':
    case 'asin': case 'acos': case 'atan':
    case 'sinh': case 'cosh': case 'tanh':
    case 'log': case 'ln':
      appendFn(action + '(');
      break;
    case 'abs':  appendFn('abs(');  break;
    case 'sqrt': appendFn('√(');    break;
    case 'cbrt': appendFn('∛(');    break;
    case 'sq':   { if (justEvaled) { expr = result; justEvaled = false; } if (expr) expr += '²'; break; }
    case 'cube': { if (justEvaled) { expr = result; justEvaled = false; } if (expr) expr += '³'; break; }
    case 'fact': { if (justEvaled) { expr = result; justEvaled = false; } if (expr) expr += '!'; break; }
    case 'pow':  { if (justEvaled) { expr = result; justEvaled = false; } if (expr) expr += '^'; break; }
    case 'mod':  { if (justEvaled) { expr = result; justEvaled = false; } if (expr) expr += ' mod '; break; }
    case 'recip': {
      try {
        const v = justEvaled ? parseFloat(result) : safeEval(autoCloseParens(expr || result));
        const res = fmt(1 / v);
        addHistory(`1/(${fmt(v)})`, res, 'SCI');
        lastAns = 1 / v; hasAns = true;
        result = res; expr = res; justEvaled = true;
      } catch { result = 'Error'; }
      break;
    }
    case 'pi':    { if (justEvaled) { expr = ''; justEvaled = false; } expr += 'π'; break; }
    case 'euler': { if (justEvaled) { expr = ''; justEvaled = false; } expr += 'ℯ'; break; }
    case '(': {
      if (justEvaled) { expr = ''; justEvaled = false; }
      expr += '(';
      break;
    }
    case ')': expr += ')'; break;

    default: break;
  }

  livePreview();
  const acBtn = $('[data-action="AC"]');
  if (acBtn) acBtn.textContent = expr ? 'C' : 'AC';
  updateCalcDisplay();
}

function highlightOp(op) {
  $$('.main-grid .key-op').forEach(b => b.classList.toggle('active-op', b.dataset.action === op));
}
function clearOpHighlight() {
  $$('.main-grid .key-op').forEach(b => b.classList.remove('active-op'));
}

/* ════════════════════════════════════════════════════════
   PROGRAMMER - sheet 03
   ══════════════════════════════════════════════════════ */
const prog = {
  cur: 0n,        // current register value (unsigned, masked)
  acc: 0n,        // accumulator
  op: null,       // pending operator
  base: 16,
  word: 32,
  fresh: true,    // next digit starts a new entry
};

const progExpr   = $('#progExpr');
const progResult = $('#progResult');
const signedTag  = $('#signedTag');
const wordTag    = $('#wordTag');
const bitGrid    = $('#bitGrid');

const WORD_NAMES = { 8: 'BYTE', 16: 'WORD', 32: 'DWORD', 64: 'QWORD' };
const OP_SYMBOL  = {
  AND: 'AND', OR: 'OR', XOR: 'XOR', NAND: 'NAND', NOR: 'NOR',
  SHL: '<<', SHR: '>>', ADD: '+', SUB: '−', MUL: '×', DIV: '÷', MOD: 'mod',
};

const pMask = () => (1n << BigInt(prog.word)) - 1n;

function pSigned(v) {
  const hi = 1n << BigInt(prog.word - 1);
  return v >= hi ? v - (1n << BigInt(prog.word)) : v;
}

function fmtBase(v, base, grouped = true) {
  let s = v.toString(base).toUpperCase();
  if (!grouped) return s;
  if (base === 10) return BigInt(s).toLocaleString('en-US');
  const size = base === 8 ? 3 : 4;
  const out = [];
  for (let i = s.length; i > 0; i -= size) out.unshift(s.slice(Math.max(0, i - size), i));
  return out.join(' ');
}

function pApply(a, op, b) {
  const m = pMask();
  switch (op) {
    case 'AND':  return a & b;
    case 'OR':   return a | b;
    case 'XOR':  return a ^ b;
    case 'NAND': return ~(a & b) & m;
    case 'NOR':  return ~(a | b) & m;
    case 'SHL':  return (a << (b & 63n)) & m;
    case 'SHR':  return a >> (b & 63n);
    case 'ADD':  return (a + b) & m;
    case 'SUB':  return (a - b) & m;
    case 'MUL':  return (a * b) & m;
    case 'DIV':  if (b === 0n) throw new Error('Division by zero'); return a / b;
    case 'MOD':  if (b === 0n) throw new Error('Division by zero'); return a % b;
    default:     return b;
  }
}

function renderBits() {
  const perRow = 16;
  const rows = [];
  for (let hi = prog.word - 1; hi >= 0; hi -= perRow) {
    const lo = Math.max(0, hi - perRow + 1);
    let cells = '';
    for (let i = hi; i >= lo; i--) {
      const on = (prog.cur >> BigInt(i)) & 1n;
      const gap = i !== hi && (i + 1) % 4 === 0 ? ' gap' : '';
      cells += `<button class="bit${on ? ' on' : ''}${gap}" data-bit="${i}" title="bit ${i}">${on}</button>`;
    }
    rows.push(`<div class="bit-row"><span class="bit-idx">${hi}</span>${cells}<span class="bit-idx right">${lo}</span></div>`);
  }
  bitGrid.innerHTML = rows.join('');
}

function updateProgDisplay() {
  progResult.textContent = fmtBase(prog.cur, prog.base);
  const len = progResult.textContent.length;
  progResult.className = 'ro-result' + (len > 18 ? ' xsm' : len > 12 ? ' sm' : '');
  progExpr.textContent = prog.op !== null
    ? `${fmtBase(prog.acc, prog.base)} ${OP_SYMBOL[prog.op]}` : ' ';
  signedTag.textContent = 'SIGNED ' + pSigned(prog.cur).toLocaleString('en-US');
  wordTag.textContent = `${WORD_NAMES[prog.word]} · ${prog.word}-BIT`;
  [16, 10, 8, 2].forEach(b => { $('#bv' + b).textContent = fmtBase(prog.cur, b); });
  $$('.base-row').forEach(r => r.classList.toggle('active', +r.dataset.base === prog.base));
  $$('.prog-grid [data-prog^="d"]').forEach(k => {
    const d = parseInt(k.dataset.prog.slice(1), 16);
    k.toggleAttribute('disabled', d >= prog.base);
  });
  renderBits();
}

function handleProg(cmd) {
  try {
    if (cmd.startsWith('d')) {                       // digit
      const d = BigInt(parseInt(cmd.slice(1), 16));
      if (d >= BigInt(prog.base)) return;
      if (prog.fresh) { prog.cur = 0n; prog.fresh = false; }
      const next = prog.cur * BigInt(prog.base) + d;
      if (next > pMask()) { toast(`${WORD_NAMES[prog.word]} register full`); return; }
      prog.cur = next;
    } else if (cmd === 'AC') {
      prog.cur = 0n; prog.acc = 0n; prog.op = null; prog.fresh = true;
    } else if (cmd === 'BSP') {
      if (prog.fresh) prog.cur = 0n;
      else prog.cur = prog.cur / BigInt(prog.base);
    } else if (cmd === 'NOT') {
      prog.cur = ~prog.cur & pMask();
      prog.fresh = true;
    } else if (cmd === 'NEG') {
      prog.cur = (~prog.cur + 1n) & pMask();
      prog.fresh = true;
    } else if (cmd === 'EQ') {
      if (prog.op !== null) {
        const a = prog.acc, b = prog.cur, op = prog.op;
        prog.cur = pApply(a, op, b);
        addHistory(
          `${fmtBase(a, prog.base)} ${OP_SYMBOL[op]} ${fmtBase(b, prog.base)} · ${baseName(prog.base)}/${prog.word}b`,
          fmtBase(prog.cur, prog.base),
          'PRG',
          prog.cur.toString()
        );
        prog.op = null;
      }
      prog.fresh = true;
    } else if (OP_SYMBOL[cmd]) {                     // binary operator
      if (prog.op !== null && !prog.fresh) prog.cur = pApply(prog.acc, prog.op, prog.cur);
      prog.acc = prog.cur;
      prog.op = cmd;
      prog.fresh = true;
    }
  } catch (err) {
    toast(err.message);
    prog.op = null; prog.fresh = true;
  }
  updateProgDisplay();
}

function baseName(b) { return { 16: 'HEX', 10: 'DEC', 8: 'OCT', 2: 'BIN' }[b]; }

/* ════════════════════════════════════════════════════════
   CONVERTER - sheet 04
   ══════════════════════════════════════════════════════ */
const CONV = {
  length: { label: 'LENGTH', units: {
    mm:  ['Millimetre', 0.001],       cm: ['Centimetre', 0.01],
    m:   ['Metre', 1],                km: ['Kilometre', 1000],
    in:  ['Inch', 0.0254],            ft: ['Foot', 0.3048],
    yd:  ['Yard', 0.9144],            mi: ['Mile', 1609.344],
    nmi: ['Nautical mile', 1852],
  }},
  area: { label: 'AREA', units: {
    mm2: ['Square millimetre', 1e-6], cm2: ['Square centimetre', 1e-4],
    m2:  ['Square metre', 1],         ha:  ['Hectare', 1e4],
    km2: ['Square kilometre', 1e6],   in2: ['Square inch', 0.00064516],
    ft2: ['Square foot', 0.09290304], ac:  ['Acre', 4046.8564224],
  }},
  volume: { label: 'VOLUME', units: {
    ml:  ['Millilitre', 0.001],       l:   ['Litre', 1],
    m3:  ['Cubic metre', 1000],       tsp: ['Teaspoon (US)', 0.00492892159375],
    tbsp:['Tablespoon (US)', 0.01478676478125],
    cup: ['Cup (US)', 0.2365882365],  pt:  ['Pint (US)', 0.473176473],
    qt:  ['Quart (US)', 0.946352946], gal: ['Gallon (US)', 3.785411784],
    in3: ['Cubic inch', 0.016387064], ft3: ['Cubic foot', 28.316846592],
  }},
  mass: { label: 'MASS', units: {
    mg: ['Milligram', 1e-6],  g:  ['Gram', 1e-3],
    kg: ['Kilogram', 1],      t:  ['Tonne', 1000],
    oz: ['Ounce', 0.028349523125],   lb: ['Pound', 0.45359237],
    st: ['Stone', 6.35029318],
  }},
  temperature: { label: 'TEMPERATURE', units: {
    c: ['Celsius',    { to: (x) => x,                from: (x) => x }],
    f: ['Fahrenheit', { to: (x) => (x - 32) * 5 / 9, from: (x) => x * 9 / 5 + 32 }],
    k: ['Kelvin',     { to: (x) => x - 273.15,       from: (x) => x + 273.15 }],
  }},
  speed: { label: 'SPEED', units: {
    mps: ['Metre / second', 1],       kmh: ['Kilometre / hour', 1 / 3.6],
    mph: ['Mile / hour', 0.44704],    kn:  ['Knot', 0.5144444444444445],
    fts: ['Foot / second', 0.3048],   mach:['Mach (sea level)', 340.29],
    c:   ['Speed of light', 299792458],
  }},
  time: { label: 'TIME', units: {
    ms:  ['Millisecond', 0.001],      s:   ['Second', 1],
    min: ['Minute', 60],              h:   ['Hour', 3600],
    d:   ['Day', 86400],              wk:  ['Week', 604800],
    mo:  ['Month (avg)', 2629746],    yr:  ['Year (Julian)', 31557600],
  }},
  data: { label: 'DATA', units: {
    bit: ['Bit', 0.125],              b:   ['Byte', 1],
    kb:  ['Kilobyte (1024)', 1024],   mb:  ['Megabyte', 1048576],
    gb:  ['Gigabyte', 1073741824],    tb:  ['Terabyte', 1099511627776],
    pb:  ['Petabyte', 1125899906842624],
  }},
  angle: { label: 'ANGLE', units: {
    deg:  ['Degree', Math.PI / 180],  rad: ['Radian', 1],
    grad: ['Gradian', Math.PI / 200], amin:['Arcminute', Math.PI / 10800],
    asec: ['Arcsecond', Math.PI / 648000], turn: ['Turn', 2 * Math.PI],
  }},
  pressure: { label: 'PRESSURE', units: {
    pa:  ['Pascal', 1],               kpa: ['Kilopascal', 1000],
    bar: ['Bar', 1e5],                atm: ['Atmosphere', 101325],
    psi: ['PSI', 6894.757293168],     mmhg:['mmHg', 133.322387415],
  }},
  energy: { label: 'ENERGY', units: {
    j:   ['Joule', 1],                kj:  ['Kilojoule', 1000],
    cal: ['Calorie', 4.184],          kcal:['Kilocalorie', 4184],
    wh:  ['Watt-hour', 3600],         kwh: ['Kilowatt-hour', 3.6e6],
    btu: ['BTU', 1055.05585262],
  }},
};

const convCat   = $('#convCat');
const convFromU = $('#convFromU');
const convToU   = $('#convToU');
const convFromV = $('#convFromV');
const convToV   = $('#convToV');
const convTable = $('#convTable');

function unitToBase(cat, key, v) {
  const u = CONV[cat].units[key][1];
  return typeof u === 'number' ? v * u : u.to(v);
}
function baseToUnit(cat, key, v) {
  const u = CONV[cat].units[key][1];
  return typeof u === 'number' ? v / u : u.from(v);
}

function fillUnitSelects(cat) {
  const opts = Object.entries(CONV[cat].units)
    .map(([k, [label]]) => `<option value="${k}">${label}</option>`).join('');
  convFromU.innerHTML = opts;
  convToU.innerHTML = opts;
  const keys = Object.keys(CONV[cat].units);
  convToU.value = keys[Math.min(1, keys.length - 1)];
}

function runConvert(fromSide = true) {
  const cat = convCat.value;
  const src = fromSide ? convFromV : convToV;
  const dst = fromSide ? convToV : convFromV;
  const sU  = fromSide ? convFromU.value : convToU.value;
  const dU  = fromSide ? convToU.value : convFromU.value;
  const v = parseFloat(src.value);
  if (isNaN(v)) { dst.value = ''; convTable.innerHTML = ''; return; }
  const base = unitToBase(cat, sU, v);
  dst.value = fmt(baseToUnit(cat, dU, base));

  // schedule of equivalents
  convTable.innerHTML = Object.entries(CONV[cat].units).map(([k, [label]]) => {
    const hot = k === convFromU.value || k === convToU.value;
    return `<div class="conv-row${hot ? ' hot' : ''}">
      <span class="cu">${label}</span>
      <span class="cv">${fmt(baseToUnit(cat, k, base))}</span>
    </div>`;
  }).join('');
}

function initConverter() {
  convCat.innerHTML = Object.entries(CONV)
    .map(([k, { label }]) => `<option value="${k}">${label}</option>`).join('');
  fillUnitSelects(convCat.value);
  convCat.addEventListener('change', () => { fillUnitSelects(convCat.value); runConvert(true); });
  convFromU.addEventListener('change', () => runConvert(true));
  convToU.addEventListener('change', () => runConvert(true));
  convFromV.addEventListener('input', () => runConvert(true));
  convToV.addEventListener('input', () => runConvert(false));
  $('#convSwap').addEventListener('click', () => {
    const u = convFromU.value;
    convFromU.value = convToU.value;
    convToU.value = u;
    runConvert(true);
  });
  runConvert(true);
}

/* ════════════════════════════════════════════════════════
   DATE - sheet 05
   ══════════════════════════════════════════════════════ */
const DAY_MS = 86400000;

function toISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function fmtDateLong(d) {
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
function parseDateInput(el) {
  if (!el.value) return null;
  const [y, m, d] = el.value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function runDateDiff() {
  let a = parseDateInput($('#dateA'));
  let b = parseDateInput($('#dateB'));
  const out = $('#dateDiffOut');
  if (!a || !b) { out.innerHTML = '<div class="out-row">Select both dates.</div>'; return; }
  if (a > b) [a, b] = [b, a];

  let y = b.getFullYear() - a.getFullYear();
  let m = b.getMonth() - a.getMonth();
  let d = b.getDate() - a.getDate();
  if (d < 0) { m--; d += new Date(b.getFullYear(), b.getMonth(), 0).getDate(); }
  if (m < 0) { y--; m += 12; }

  const days = Math.round((b - a) / DAY_MS);
  out.innerHTML = `
    <div class="out-big">${y}<b>Y</b> ${m}<b>M</b> ${d}<b>D</b></div>
    <div class="out-rows">
      <div class="out-row"><span>TOTAL DAYS</span><b>${days.toLocaleString()}</b></div>
      <div class="out-row"><span>TOTAL WEEKS</span><b>${Math.floor(days / 7).toLocaleString()} wk ${days % 7} d</b></div>
      <div class="out-row"><span>TOTAL HOURS</span><b>${(days * 24).toLocaleString()}</b></div>
    </div>`;
}

function runDateOffset() {
  const base = parseDateInput($('#dateBase'));
  const out = $('#dateOffOut');
  if (!base) { out.innerHTML = '<div class="out-row">Select a datum date.</div>'; return; }
  const sign = +$('#dateSign').value;
  const y = +$('#offY').value || 0;
  const m = +$('#offM').value || 0;
  const d = +$('#offD').value || 0;
  const r = new Date(base);
  r.setFullYear(r.getFullYear() + sign * y);
  r.setMonth(r.getMonth() + sign * m);
  r.setDate(r.getDate() + sign * d);
  const days = Math.round((r - base) / DAY_MS);
  out.innerHTML = `
    <div class="out-big">${fmtDateLong(r)}</div>
    <div class="out-rows">
      <div class="out-row"><span>NET SHIFT</span><b>${days >= 0 ? '+' : ''}${days.toLocaleString()} days</b></div>
    </div>`;
}

function initDate() {
  const today = toISO(new Date());
  $('#dateA').value = today;
  $('#dateB').value = today;
  $('#dateBase').value = today;
  ['dateA', 'dateB'].forEach(id => $('#' + id).addEventListener('input', runDateDiff));
  ['dateBase', 'dateSign', 'offY', 'offM', 'offD'].forEach(id =>
    $('#' + id).addEventListener('input', runDateOffset));
  runDateDiff();
  runDateOffset();
}

/* ════════════════════════════════════════════════════════
   FINANCE - sheet 06
   ══════════════════════════════════════════════════════ */
function runLoan() {
  const P = +$('#loanP').value || 0;
  const rate = +$('#loanR').value || 0;
  const yrs = +$('#loanY').value || 0;
  const out = $('#loanOut');
  const n = Math.round(yrs * 12);
  if (P <= 0 || n <= 0) { out.innerHTML = '<div class="out-row">Enter a principal and term.</div>'; return; }
  const r = rate / 1200;
  const emi = r === 0 ? P / n : P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
  const total = emi * n;
  const interest = total - P;
  const pPct = Math.max(2, Math.min(98, P / total * 100));
  out.innerHTML = `
    <div class="out-big">${fmtMoney(emi)} <b>/ MO</b></div>
    <div class="out-rows">
      <div class="out-row"><span>PAYMENTS</span><b>${n} × monthly</b></div>
      <div class="out-row"><span>TOTAL INTEREST</span><b>${fmtMoney(interest)}</b></div>
      <div class="out-row"><span>TOTAL REPAID</span><b>${fmtMoney(total)}</b></div>
    </div>
    <div class="fin-bar"><div class="fb-p" style="width:${pPct}%"></div><div class="fb-i" style="width:${100 - pPct}%"></div></div>
    <div class="fin-legend"><span><span class="sq p"></span>PRINCIPAL ${pPct.toFixed(1)}%</span><span><span class="sq i"></span>INTEREST ${(100 - pPct).toFixed(1)}%</span></div>`;
}

function runCompound() {
  const P = +$('#cgP').value || 0;
  const rate = +$('#cgR').value || 0;
  const yrs = +$('#cgY').value || 0;
  const f = +$('#cgF').value || 1;
  const out = $('#cgOut');
  if (P <= 0) { out.innerHTML = '<div class="out-row">Enter a principal.</div>'; return; }
  const A = P * Math.pow(1 + rate / 100 / f, f * yrs);
  out.innerHTML = `
    <div class="out-big">${fmtMoney(A)}</div>
    <div class="out-rows">
      <div class="out-row"><span>INTEREST EARNED</span><b>${fmtMoney(A - P)}</b></div>
      <div class="out-row"><span>GROWTH MULTIPLE</span><b>× ${(A / P).toFixed(3)}</b></div>
    </div>`;
}

function initFinance() {
  ['loanP', 'loanR', 'loanY'].forEach(id => $('#' + id).addEventListener('input', runLoan));
  ['cgP', 'cgR', 'cgY', 'cgF'].forEach(id => $('#' + id).addEventListener('input', runCompound));
  runLoan();
  runCompound();
}

/* ════════════════════════════════════════════════════════
   REVISION RECORD - history
   ══════════════════════════════════════════════════════ */
const HISTORY_KEY = 'vernier_history';
const SEQ_KEY     = 'vernier_seq';
const MAX_HIST    = 30;
const revList = $('#revList');

function getHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
  catch { return []; }
}
function seqLetter(n) {
  let s = '';
  n = Math.max(1, n);
  while (n > 0) { n--; s = String.fromCharCode(65 + (n % 26)) + s; n = Math.floor(n / 26); }
  return s;
}
function addHistory(exprStr, resStr, tag, rawVal) {
  const seq = (parseInt(localStorage.getItem(SEQ_KEY)) || 0) + 1;
  localStorage.setItem(SEQ_KEY, seq);
  const h = getHistory();
  h.unshift({ seq, expr: exprStr, res: resStr, tag, raw: rawVal || null, time: Date.now() });
  if (h.length > MAX_HIST) h.pop();
  localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
  renderHistory();
}
function escHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function timeAgo(ts) {
  const diff = (Date.now() - ts) / 1000;
  if (diff < 60) return 'now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return new Date(ts).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}
function renderHistory() {
  const h = getHistory();
  if (!h.length) {
    revList.innerHTML = '<div class="rev-empty">NO REVISIONS ISSUED<br>- SHEET CLEAN -</div>';
    $('#tbRev').textContent = '-';
    return;
  }
  revList.innerHTML = h.map((item, i) => `
    <div class="rev-item" data-index="${i}">
      <span class="rev-letter">${seqLetter(item.seq)}</span>
      <div class="rev-body">
        <div class="rev-expr">${escHtml(item.expr)}</div>
        <div class="rev-res">= ${escHtml(item.res)}</div>
        <div class="rev-mode">${item.tag}</div>
      </div>
      <span class="rev-time">${timeAgo(item.time)}</span>
    </div>`).join('');
  $('#tbRev').textContent = seqLetter(h[0].seq);
}

revList.addEventListener('click', (e) => {
  const item = e.target.closest('.rev-item');
  if (!item) return;
  const entry = getHistory()[+item.dataset.index];
  if (!entry) return;
  if (entry.tag === 'PRG') {
    switchMode('programmer');
    prog.cur = BigInt(entry.raw || 0) & pMask();
    prog.op = null; prog.fresh = true;
    updateProgDisplay();
  } else {
    if (mode !== 'standard' && mode !== 'scientific') switchMode('standard');
    result = entry.res;
    expr = entry.res;
    lastAns = parseFloat(entry.res) || 0;
    hasAns = true;
    justEvaled = true;
    updateCalcDisplay();
  }
  toast('Revision ' + seqLetter(entry.seq) + ' restored');
});

$('#voidBtn').addEventListener('click', () => {
  localStorage.removeItem(HISTORY_KEY);
  renderHistory();
  toast('Record voided');
});

/* ════════════════════════════════════════════════════════
   MODE SWITCHING + TITLE BLOCK
   ══════════════════════════════════════════════════════ */
function switchMode(m) {
  mode = m;
  document.body.dataset.mode = m;
  $$('.tab').forEach(t => t.classList.toggle('active', t.dataset.mode === m));

  $('#panelCalc').classList.toggle('hidden', m !== 'standard' && m !== 'scientific');
  $('#sciGrid').classList.toggle('hidden', m !== 'scientific');
  $('#panelProg').classList.toggle('hidden', m !== 'programmer');
  $('#panelConv').classList.toggle('hidden', m !== 'converter');
  $('#panelDate').classList.toggle('hidden', m !== 'date');
  $('#panelFin').classList.toggle('hidden', m !== 'finance');

  $('#degBtn').classList.toggle('hidden', m !== 'scientific');
  angleTag.classList.toggle('hidden', m !== 'scientific');

  const s = SHEETS[m];
  $('#tbTitle').textContent = s.title;
  $('#tbDwg').textContent = s.dwg;
  $('#tbSheet').textContent = `${s.no} OF 06`;
}

$('#tabs').addEventListener('click', (e) => {
  const tab = e.target.closest('.tab');
  if (tab) switchMode(tab.dataset.mode);
});

/* ════════════════════════════════════════════════════════
   WIRING
   ══════════════════════════════════════════════════════ */
// calc keys
$('#panelCalc').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (btn) handleAction(btn.dataset.action);
});

// programmer keys
$('#progGrid').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-prog]');
  if (btn) handleProg(btn.dataset.prog);
});
$('#baseRows').addEventListener('click', (e) => {
  const row = e.target.closest('.base-row');
  if (!row) return;
  prog.base = +row.dataset.base;
  updateProgDisplay();
});
$$('.word-btn').forEach(b => b.addEventListener('click', () => {
  prog.word = +b.dataset.word;
  $$('.word-btn').forEach(x => x.classList.toggle('active', x === b));
  prog.cur &= pMask();
  prog.acc &= pMask();
  updateProgDisplay();
}));
bitGrid.addEventListener('click', (e) => {
  const bit = e.target.closest('[data-bit]');
  if (!bit) return;
  prog.cur ^= 1n << BigInt(+bit.dataset.bit);
  prog.fresh = false;
  updateProgDisplay();
});

// toolbar
$('#degBtn').addEventListener('click', () => {
  degMode = !degMode;
  $('#degBtn').textContent = degMode ? 'DEG' : 'RAD';
  angleTag.textContent = degMode ? 'DEG' : 'RAD';
  $('#degBtn').classList.toggle('active', !degMode);
  livePreview();
  updateCalcDisplay();
  toast(degMode ? 'Degrees' : 'Radians');
});

$('#revBtn').addEventListener('click', () => {
  document.body.classList.toggle('rev-open');
  $('#revBtn').classList.toggle('active', document.body.classList.contains('rev-open'));
});

// copy
$('#copyBtn').addEventListener('click', () => {
  navigator.clipboard.writeText(result).then(() => toast('Result copied'));
});
$('#progCopyBtn').addEventListener('click', () => {
  navigator.clipboard.writeText(fmtBase(prog.cur, prog.base, false)).then(() => toast('Value copied'));
});

// legend
const legend = $('#legend');
function toggleLegend(force) {
  legend.classList.toggle('hidden', force !== undefined ? !force : undefined);
}
$('#legendBtn').addEventListener('click', () => toggleLegend());
$('#legendClose').addEventListener('click', () => toggleLegend(false));
legend.addEventListener('click', (e) => { if (e.target === legend) toggleLegend(false); });

/* ── Keyboard ───────────────────────────────────────────── */
const KEY_MAP = {
  '0':'0','1':'1','2':'2','3':'3','4':'4','5':'5','6':'6','7':'7','8':'8','9':'9',
  '.': '.', ',': '.',
  '+': '+', '-': '−', '*': '×', '/': '÷',
  'Enter': '=', '=': '=',
  'Backspace': 'backspace',
  'Delete': 'AC', 'Escape': 'AC',
  '%': '%', '(': '(', ')': ')',
  '^': 'pow', '!': 'fact',
};

const PROG_KEY_MAP = {
  '0':'d0','1':'d1','2':'d2','3':'d3','4':'d4','5':'d5','6':'d6','7':'d7','8':'d8','9':'d9',
  'a':'dA','b':'dB','c':'dC','d':'dD','e':'dE','f':'dF',
  '+':'ADD','-':'SUB','*':'MUL','/':'DIV','%':'MOD',
  '&':'AND','|':'OR','^':'XOR','~':'NOT','<':'SHL','>':'SHR',
  'Enter':'EQ','=':'EQ','Backspace':'BSP','Delete':'AC','Escape':'AC',
};

const MODE_ORDER = ['standard', 'scientific', 'programmer', 'converter', 'date', 'finance'];

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !legend.classList.contains('hidden')) { toggleLegend(false); return; }

  // Alt+1..6 -> sheets
  if (e.altKey && e.key >= '1' && e.key <= '6') {
    e.preventDefault();
    switchMode(MODE_ORDER[+e.key - 1]);
    return;
  }

  const t = e.target;
  if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT') return;

  if (e.key === '?' && !e.ctrlKey) { e.preventDefault(); toggleLegend(); return; }
  // stop Space from re-triggering the last clicked key button
  if (e.key === ' ') { e.preventDefault(); return; }

  if (mode === 'programmer') {
    const cmd = PROG_KEY_MAP[e.key.length === 1 ? e.key.toLowerCase() : e.key];
    if (!cmd) return;
    e.preventDefault();
    handleProg(cmd);
    flashKey(`[data-prog="${cmd}"]`);
    return;
  }

  if (mode !== 'standard' && mode !== 'scientific') return;
  let action = KEY_MAP[e.key];
  if (!action) return;
  if ((action === 'pow' || action === 'fact' || action === '(' || action === ')') && mode !== 'scientific') {
    if (action === 'pow' || action === 'fact') return;   // sci-only postfix keys
  }
  e.preventDefault();
  handleAction(action);
  flashKey(`[data-action="${CSS.escape(action)}"]`);
});

function flashKey(sel) {
  const btn = $(sel);
  if (!btn) return;
  btn.classList.add('active-key');
  setTimeout(() => btn.classList.remove('active-key'), 110);
}

/* ── Themed <select> ────────────────────────────────────── */
const SEL_CHEV = '<svg class="vr-sel-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';

function enhanceSelect(sel) {
  if (!sel || sel.dataset.vr) return;
  sel.dataset.vr = '1';

  const wrap = document.createElement('div');
  wrap.className = 'vr-sel';
  sel.parentNode.insertBefore(wrap, sel);
  wrap.appendChild(sel);
  sel.classList.add('vr-sel-native');
  sel.setAttribute('tabindex', '-1');

  const trig = document.createElement('button');
  trig.type = 'button';
  trig.className = 'vr-sel-trigger';
  trig.setAttribute('aria-haspopup', 'listbox');
  trig.setAttribute('aria-expanded', 'false');
  if (sel.getAttribute('aria-label')) trig.setAttribute('aria-label', sel.getAttribute('aria-label'));

  const panel = document.createElement('div');
  panel.className = 'vr-sel-panel';
  panel.setAttribute('role', 'listbox');
  panel.hidden = true;

  wrap.appendChild(trig);
  wrap.appendChild(panel);

  function sync() {
    const o = sel.options[sel.selectedIndex];
    trig.innerHTML = '<span>' + (o ? o.textContent : '') + '</span>' + SEL_CHEV;
  }
  function build() {
    panel.innerHTML = '';
    [...sel.options].forEach((o) => {
      const d = document.createElement('div');
      d.className = 'vr-sel-opt';
      d.setAttribute('role', 'option');
      d.textContent = o.textContent;
      if (o.value === sel.value) d.setAttribute('aria-selected', 'true');
      d.addEventListener('click', () => {
        sel.value = o.value;
        sel.dispatchEvent(new Event('change', { bubbles: true }));
        close();
        trig.focus();
      });
      panel.appendChild(d);
    });
  }
  const open  = () => { build(); panel.hidden = false; trig.setAttribute('aria-expanded', 'true'); };
  const close = () => { panel.hidden = true; trig.setAttribute('aria-expanded', 'false'); };

  trig.addEventListener('click', () => (panel.hidden ? open() : close()));
  document.addEventListener('click', (e) => { if (!wrap.contains(e.target)) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  sel.addEventListener('change', sync);

  // re-sync when the option list is swapped out (converter category change)
  new MutationObserver(sync).observe(sel, { childList: true });

  // re-sync when code assigns .value directly (unit swap, fillUnitSelects)
  const desc = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
  Object.defineProperty(sel, 'value', {
    configurable: true,
    get() { return desc.get.call(this); },
    set(v) { desc.set.call(this, v); sync(); },
  });

  sync();
}

/* ── Init ───────────────────────────────────────────────── */
(function init() {
  const now = new Date();
  $('#tbDate').textContent = now.toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).toUpperCase();

  if (window.innerWidth > 1020) {
    document.body.classList.add('rev-open');
    $('#revBtn').classList.add('active');
  }

  initConverter();
  initDate();
  initFinance();
  $$('select').forEach(enhanceSelect);
  renderHistory();
  updateCalcDisplay();
  updateProgDisplay();
  switchMode('standard');
})();
