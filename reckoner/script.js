/* ==========================================================
   READY RECKONER - a pocket conversion book
   Vanilla JS. Linear factor tables + special cases for
   temperature and fuel economy. Live currency via open.er-api.
   ========================================================== */

const $ = (s, r = document) => r.querySelector(s);

/* unit spec: { id, name, k } linear (value * k = base), OR
              { id, name, to(v), from(b) } for non-linear */
const CATS = {
  length: {
    title: "Length", note: "Metric and imperial, side by side.", base: "metre",
    units: [
      ["mm", "millimetre", 0.001], ["cm", "centimetre", 0.01], ["m", "metre", 1],
      ["km", "kilometre", 1000], ["in", "inch", 0.0254], ["ft", "foot", 0.3048],
      ["yd", "yard", 0.9144], ["mi", "mile", 1609.344], ["nmi", "nautical mile", 1852],
    ],
  },
  mass: {
    title: "Mass", note: "Weights, kitchen to freight.", base: "kilogram",
    units: [
      ["mg", "milligram", 1e-6], ["g", "gram", 0.001], ["kg", "kilogram", 1],
      ["t", "tonne", 1000], ["oz", "ounce", 0.0283495], ["lb", "pound", 0.453592],
      ["st", "stone", 6.35029], ["ton_us", "short ton", 907.185],
    ],
  },
  area: {
    title: "Area", note: "Floor plans to farmland.", base: "square metre",
    units: [
      ["cm2", "sq centimetre", 1e-4], ["m2", "square metre", 1], ["ha", "hectare", 1e4],
      ["km2", "sq kilometre", 1e6], ["sqin", "square inch", 0.00064516],
      ["sqft", "square foot", 0.092903], ["sqyd", "square yard", 0.836127],
      ["acre", "acre", 4046.8564224], ["sqmi", "square mile", 2589988.11],
    ],
  },
  volume: {
    title: "Volume", note: "Litres, gallons and the awkward pint.", base: "litre",
    units: [
      ["ml", "millilitre", 0.001], ["l", "litre", 1], ["m3", "cubic metre", 1000],
      ["tsp", "teaspoon", 0.00492892], ["tbsp", "tablespoon", 0.0147868],
      ["cup", "cup (US)", 0.236588], ["floz", "fluid ounce (US)", 0.0295735],
      ["pt", "pint (US)", 0.473176], ["qt", "quart (US)", 0.946353],
      ["gal", "gallon (US)", 3.785411784], ["gal_uk", "gallon (UK)", 4.54609],
    ],
  },
  temperature: {
    title: "Temperature", note: "Celsius, Fahrenheit, Kelvin. Not a ratio.", base: "celsius",
    units: [
      ["C", "Celsius", { to: (v) => v, from: (b) => b }],
      ["F", "Fahrenheit", { to: (v) => (v - 32) * 5 / 9, from: (b) => b * 9 / 5 + 32 }],
      ["K", "Kelvin", { to: (v) => v - 273.15, from: (b) => b + 273.15 }],
      ["R", "Rankine", { to: (v) => (v - 491.67) * 5 / 9, from: (b) => (b + 273.15) * 9 / 5 }],
    ],
  },
  speed: {
    title: "Speed", note: "On the road, at sea, in the air.", base: "metre per second",
    units: [
      ["mps", "metre / second", 1], ["kmh", "kilometre / hour", 0.277778],
      ["mph", "mile / hour", 0.44704], ["kn", "knot", 0.514444], ["fps", "foot / second", 0.3048],
    ],
  },
  pressure: {
    title: "Pressure", note: "Tyres, weather, dive tables.", base: "pascal",
    units: [
      ["Pa", "pascal", 1], ["kPa", "kilopascal", 1000], ["bar", "bar", 1e5],
      ["psi", "pound / sq inch", 6894.757], ["atm", "atmosphere", 101325],
      ["mmHg", "millimetre of mercury", 133.322], ["inHg", "inch of mercury", 3386.39],
    ],
  },
  energy: {
    title: "Energy", note: "Food labels to power bills.", base: "joule",
    units: [
      ["J", "joule", 1], ["kJ", "kilojoule", 1000], ["cal", "calorie", 4.184],
      ["kcal", "kilocalorie", 4184], ["Wh", "watt hour", 3600], ["kWh", "kilowatt hour", 3.6e6],
      ["BTU", "British thermal unit", 1055.056], ["ftlb", "foot-pound", 1.35582],
    ],
  },
  power: {
    title: "Power", note: "Engines, kettles, solar arrays.", base: "watt",
    units: [
      ["W", "watt", 1], ["kW", "kilowatt", 1000], ["MW", "megawatt", 1e6],
      ["hp", "horsepower (mech)", 745.6999], ["PS", "metric horsepower", 735.49875],
      ["BTUh", "BTU / hour", 0.293071],
    ],
  },
  data: {
    title: "Data", note: "Decimal and binary, kept apart.", base: "byte",
    units: [
      ["bit", "bit", 0.125], ["B", "byte", 1], ["KB", "kilobyte", 1e3], ["KiB", "kibibyte", 1024],
      ["MB", "megabyte", 1e6], ["MiB", "mebibyte", 1048576], ["GB", "gigabyte", 1e9],
      ["GiB", "gibibyte", 1073741824], ["TB", "terabyte", 1e12], ["TiB", "tebibyte", 1099511627776],
    ],
  },
  time: {
    title: "Time", note: "Seconds to years (365.25 days).", base: "second",
    units: [
      ["ms", "millisecond", 0.001], ["s", "second", 1], ["min", "minute", 60],
      ["h", "hour", 3600], ["day", "day", 86400], ["week", "week", 604800],
      ["month", "month (avg)", 2629800], ["year", "year", 31557600],
    ],
  },
  angle: {
    title: "Angle", note: "Radians, degrees, and the surveyor's gradian.", base: "radian",
    units: [
      ["rad", "radian", 1], ["deg", "degree", 0.0174532925], ["grad", "gradian", 0.015707963],
      ["turn", "turn", 6.283185307], ["arcmin", "arcminute", 2.908882e-4], ["arcsec", "arcsecond", 4.848137e-6],
    ],
  },
  frequency: {
    title: "Frequency", note: "Hertz and revolutions.", base: "hertz",
    units: [
      ["Hz", "hertz", 1], ["kHz", "kilohertz", 1e3], ["MHz", "megahertz", 1e6],
      ["GHz", "gigahertz", 1e9], ["rpm", "revolution / minute", 0.0166667],
    ],
  },
  force: {
    title: "Force", note: "Newtons, and the pounds people still use.", base: "newton",
    units: [
      ["N", "newton", 1], ["kN", "kilonewton", 1000], ["dyn", "dyne", 1e-5],
      ["lbf", "pound-force", 4.4482216], ["kgf", "kilogram-force", 9.80665],
    ],
  },
  illuminance: {
    title: "Illuminance", note: "Lux and foot-candles.", base: "lux",
    units: [
      ["lx", "lux", 1], ["fc", "foot-candle", 10.76391], ["phot", "phot", 1e4], ["nox", "nox", 1e-3],
    ],
  },
  fuel: {
    title: "Fuel economy", note: "The one where more is less.", base: "litre / 100 km",
    units: [
      ["l100", "litre / 100 km", { to: (v) => v, from: (b) => b }],
      ["kmpl", "kilometre / litre", { to: (v) => 100 / v, from: (b) => 100 / b }],
      ["mpg_us", "mile / gallon (US)", { to: (v) => 235.215 / v, from: (b) => 235.215 / b }],
      ["mpg_uk", "mile / gallon (UK)", { to: (v) => 282.481 / v, from: (b) => 282.481 / b }],
    ],
  },
  cooking: {
    title: "Cooking", note: "Kitchen volumes, plus a stick of butter.", base: "millilitre",
    units: [
      ["ml", "millilitre", 1], ["tsp", "teaspoon", 4.92892], ["tbsp", "tablespoon", 14.7868],
      ["cup_us", "cup (US)", 236.588], ["cup_m", "cup (metric)", 250], ["floz", "fluid ounce", 29.5735],
      ["pinch", "pinch", 0.3125], ["stick", "stick of butter", 118.294],
    ],
  },
  currency: {
    title: "Currency", note: "Live mid-market rates, refreshed daily.", base: "USD",
    units: [], live: true,
  },
};

/* offline fallback rates (per 1 USD) - only used if the fetch fails */
const FALLBACK_RATES = {
  USD: 1, EUR: 0.92, GBP: 0.79, JPY: 156, PKR: 278, INR: 83, CAD: 1.36, AUD: 1.52,
  CHF: 0.88, CNY: 7.24, AED: 3.67, SAR: 3.75, SGD: 1.35, NZD: 1.64, ZAR: 18.4,
  BRL: 5.1, MXN: 17.1, SEK: 10.6, NOK: 10.7, TRY: 32.5, RUB: 92, KRW: 1345, HKD: 7.82,
};
const CURRENCY_NAMES = {
  USD: "US dollar", EUR: "Euro", GBP: "Pound sterling", JPY: "Japanese yen",
  PKR: "Pakistani rupee", INR: "Indian rupee", CAD: "Canadian dollar",
  AUD: "Australian dollar", CHF: "Swiss franc", CNY: "Chinese yuan",
  AED: "UAE dirham", SAR: "Saudi riyal", SGD: "Singapore dollar", NZD: "NZ dollar",
  ZAR: "South African rand", BRL: "Brazilian real", MXN: "Mexican peso",
  SEK: "Swedish krona", NOK: "Norwegian krone", TRY: "Turkish lira", RUB: "Russian rouble",
  KRW: "South Korean won", HKD: "Hong Kong dollar",
};

let cat = "length";
let precision = 4;
let rates = null;
let ratesDate = null;
let ratesStale = false;
let ledger = [];
try { ledger = JSON.parse(sessionStorage.getItem("reckoner.ledger")) || []; } catch (_) {}

const el = {
  thumbIndex: $("#thumbIndex"),
  catTitle: $("#catTitle"),
  catNote: $("#catNote"),
  fromValue: $("#fromValue"),
  toValue: $("#toValue"),
  fromUnit: $("#fromUnit"),
  toUnit: $("#toUnit"),
  swap: $("#swap"),
  precisionVal: $("#precisionVal"),
  rateLine: $("#rateLine"),
  equivUnit: $("#equivUnit"),
  equivGrid: $("#equivGrid"),
  equivSub: $("#equivSub"),
  ledgerList: $("#ledgerList"),
  ledgerClear: $("#ledgerClear"),
  toast: $("#toast"),
};

/* ---------- unit helpers ---------- */
function unitList() {
  if (cat === "currency") {
    const codes = rates ? Object.keys(rates) : Object.keys(FALLBACK_RATES);
    return codes.map((c) => [c, CURRENCY_NAMES[c] || c, null]);
  }
  return CATS[cat].units;
}
function findUnit(id) {
  return unitList().find((u) => u[0] === id);
}
function toBase(value, unit) {
  if (cat === "currency") {
    const r = (rates || FALLBACK_RATES)[unit[0]] || 1;
    return value / r;                 // base is USD
  }
  const k = unit[2];
  if (typeof k === "object") return k.to(value);
  return value * k;
}
function fromBase(base, unit) {
  if (cat === "currency") {
    const r = (rates || FALLBACK_RATES)[unit[0]] || 1;
    return base * r;
  }
  const k = unit[2];
  if (typeof k === "object") return k.from(base);
  return base / k;
}
function convert(value, from, to) {
  return fromBase(toBase(value, from), to);
}

/* ---------- formatting ---------- */
function fmt(n) {
  if (!isFinite(n)) return "-";
  const abs = Math.abs(n);
  if (abs !== 0 && (abs < 1e-4 || abs >= 1e12)) return n.toExponential(Math.min(precision, 6));
  const fixed = n.toFixed(precision);
  return fixed.replace(/\.?0+$/, "") || "0";
}

/* ---------- build UI ---------- */
function buildThumbs() {
  el.thumbIndex.innerHTML = Object.entries(CATS)
    .map(([id, c]) => `<button class="thumb ${id === cat ? "on" : ""}" data-cat="${id}" type="button">${c.title}</button>`)
    .join("");
}

function fillUnitSelects(keepPair) {
  const list = unitList();
  const opts = list.map((u) => `<option value="${u[0]}">${u[1]} (${u[0]})</option>`).join("");
  const prevFrom = el.fromUnit.value, prevTo = el.toUnit.value;
  el.fromUnit.innerHTML = opts;
  el.toUnit.innerHTML = opts;
  if (keepPair && list.some((u) => u[0] === prevFrom)) el.fromUnit.value = prevFrom;
  else el.fromUnit.selectedIndex = defaultFrom();
  if (keepPair && list.some((u) => u[0] === prevTo)) el.toUnit.value = prevTo;
  else el.toUnit.selectedIndex = defaultTo();
}
function defaultFrom() {
  return { length: 2, mass: 5, volume: 9, temperature: 1, currency: idxOf("USD"), data: 4, cooking: 1 }[cat] ?? 0;
}
function defaultTo() {
  return { length: 4, mass: 2, volume: 10, temperature: 0, currency: idxOf("EUR"), data: 6, cooking: 2 }[cat] ?? 1;
}
function idxOf(code) {
  return unitList().findIndex((u) => u[0] === code);
}

function selectCat(id) {
  cat = id;
  buildThumbs();
  el.catTitle.textContent = CATS[id].title;
  el.catNote.textContent = CATS[id].note;
  el.rateLine.hidden = id !== "currency";
  if (id === "currency" && !rates) fetchRates();
  if (id === "currency") updateRateLine();
  fillUnitSelects(false);
  run();
}

/* ---------- run a conversion ---------- */
function parseValue() {
  const raw = el.fromValue.value.trim().replace(/,/g, "");
  const n = parseFloat(raw);
  return isFinite(n) ? n : 0;
}
function run(note) {
  const value = parseValue();
  const from = findUnit(el.fromUnit.value);
  const to = findUnit(el.toUnit.value);
  if (!from || !to) return;
  const out = convert(value, from, to);
  el.toValue.textContent = fmt(out);
  buildEquiv(from);
  if (note) addLedger(value, from, to, out);
}

function buildEquiv(from) {
  el.equivUnit.textContent = `${from[1]}`;
  el.equivSub.innerHTML = `One <b>${from[1]}</b> ${cat === "currency" ? "buys" : "is"}`;
  const list = unitList().filter((u) => u[0] !== from[0]);
  el.equivGrid.innerHTML = list.map((u) => {
    const v = convert(1, from, u);
    return `<div class="equiv-cell"><b>${fmt(v)}</b><span>${u[1]}</span></div>`;
  }).join("");
}

/* ---------- ledger ---------- */
function addLedger(value, from, to, out) {
  const entry = `${fmt(value)} ${from[0]} = ${fmt(out)} ${to[0]}`;
  if (ledger[0] === entry) return;
  ledger.unshift(entry);
  ledger = ledger.slice(0, 12);
  try { sessionStorage.setItem("reckoner.ledger", JSON.stringify(ledger)); } catch (_) {}
  renderLedger();
}
function renderLedger() {
  if (!ledger.length) {
    el.ledgerList.innerHTML = `<li class="ledger-empty">Conversions you run get noted here.</li>`;
    return;
  }
  el.ledgerList.innerHTML = ledger
    .map((e) => {
      const [l, r] = e.split(" = ");
      return `<li><b>${l}</b> = ${r}</li>`;
    })
    .join("");
}
el.ledgerClear.addEventListener("click", () => {
  ledger = [];
  try { sessionStorage.removeItem("reckoner.ledger"); } catch (_) {}
  renderLedger();
});

/* ---------- currency fetch ---------- */
async function fetchRates() {
  updateRateLine("Fetching rates...");
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD");
    if (!res.ok) throw new Error("bad response");
    const data = await res.json();
    if (!data || !data.rates) throw new Error("no rates");
    // keep the curated set, in a sensible order
    rates = {};
    Object.keys(CURRENCY_NAMES).forEach((c) => {
      if (data.rates[c] != null) rates[c] = data.rates[c];
    });
    // include any others the API gave, after the curated ones
    Object.keys(data.rates).forEach((c) => { if (rates[c] == null) rates[c] = data.rates[c]; });
    ratesDate = data.time_last_update_utc
      ? new Date(data.time_last_update_utc).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10);
    ratesStale = false;
  } catch (_) {
    rates = { ...FALLBACK_RATES };
    ratesStale = true;
    ratesDate = null;
  }
  if (cat === "currency") {
    fillUnitSelects(true);
    updateRateLine();
    run();
  }
}
function updateRateLine(msg) {
  if (msg) { el.rateLine.textContent = msg; el.rateLine.classList.remove("stale"); return; }
  if (ratesStale || !rates) {
    el.rateLine.textContent = "Offline - showing stored approximate rates, not live.";
    el.rateLine.classList.add("stale");
  } else {
    el.rateLine.textContent = `Live mid-market rates, as of ${ratesDate}. Source: open.er-api.com.`;
    el.rateLine.classList.remove("stale");
  }
}

/* ---------- events ---------- */
el.thumbIndex.addEventListener("click", (e) => {
  const btn = e.target.closest(".thumb");
  if (btn) selectCat(btn.dataset.cat);
});
el.fromValue.addEventListener("input", () => run());
el.fromValue.addEventListener("change", () => run(true));
el.fromUnit.addEventListener("change", () => run(true));
el.toUnit.addEventListener("change", () => run(true));
el.swap.addEventListener("click", () => {
  const f = el.fromUnit.value;
  el.fromUnit.value = el.toUnit.value;
  el.toUnit.value = f;
  // carry the result back into the input so a swap reads naturally
  const cur = parseFloat(el.toValue.textContent.replace(/,/g, ""));
  if (isFinite(cur)) el.fromValue.value = cur;
  run(true);
});

document.querySelector('[data-stepper="precision"]').addEventListener("click", (e) => {
  const step = e.target.closest(".step");
  if (!step) return;
  precision = Math.max(0, Math.min(8, precision + Number(step.dataset.step)));
  el.precisionVal.textContent = precision;
  run();
});

let toastT;
function toast(msg) {
  el.toast.textContent = msg;
  el.toast.hidden = false;
  clearTimeout(toastT);
  toastT = setTimeout(() => { el.toast.hidden = true; }, 1500);
}

/* copy result on click */
el.toValue.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(el.toValue.textContent);
    toast("Result copied");
  } catch (_) {}
});

/* ---------- boot ---------- */
buildThumbs();
selectCat("length");
renderLedger();

/* a worked page for preview captures: ?demo */
if (/[?&]demo\b/.test(location.search)) {
  ledger = ["5 kg = 11.0231 lb", "180 C = 356 F", "1 mi = 1.6093 km"];
  renderLedger();
  el.fromValue.value = "26.2";
  el.fromUnit.value = "mi";
  el.toUnit.value = "km";
  run();
}
