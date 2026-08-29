/* ══════════════════════════════════════════════════════
   HALCYON - a window on the sky
   The page paints itself from live weather: sky gradient,
   sun/moon position, clouds, rain, snow, stars, lightning.
   Data: Open-Meteo (forecast + geocoding + air quality),
   no API key required.
   ══════════════════════════════════════════════════════ */

const GEO_URL  = "https://geocoding-api.open-meteo.com/v1/search";
const WX_URL   = "https://api.open-meteo.com/v1/forecast";
const AQ_URL   = "https://air-quality-api.open-meteo.com/v1/air-quality";
const HIST_URL = "https://archive-api.open-meteo.com/v1/archive";

const $ = (s) => document.querySelector(s);
const pad = (n) => String(n).padStart(2, "0");
const setLine = (el, text) => { el.textContent = text || ""; el.hidden = !text; };
const MONTHS = ["january","february","march","april","may","june","july","august","september","october","november","december"];

/* ── State ─────────────────────────────────────── */
let unit = localStorage.getItem("halcyon-unit") || "C";
let kept = JSON.parse(localStorage.getItem("halcyon-kept") || "[]");
let place = null;      // { name, admin, country, lat, lon }
let wx = null;
let lastAir = null;
let lastHistory = null; // { avg, recordMax, recordYear, years, monthDay, lat, lon }
let clockTimer = null;

const cToF = (c) => c * 9 / 5 + 32;
const kmhToMph = (k) => k * 0.621371;
const kmToMi = (k) => k * 0.621371;
const t = (c) => Math.round(unit === "C" ? c : cToF(c)) + "°";
const windText = (kmh) => unit === "C" ? `${Math.round(kmh)} km/h` : `${Math.round(kmhToMph(kmh))} mph`;
const distText = (km) => unit === "C" ? `${km.toFixed(1)} km` : `${kmToMi(km).toFixed(1)} mi`;

/* ── Weather vocabulary ────────────────────────── */
function group(code) {
  if (code <= 1) return "clear";
  if (code === 2) return "partly";
  if (code === 3) return "overcast";
  if (code === 45 || code === 48) return "fog";
  if (code >= 51 && code <= 57) return "drizzle";
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow";
  if (code >= 95) return "storm";
  return "partly";
}

const PHRASES = {
  clear:    { day: "clear skies", night: "a clear, open night" },
  partly:   { day: "a few clouds drifting", night: "clouds passing the moon" },
  overcast: { day: "grey and overcast", night: "a low, heavy night sky" },
  fog:      { day: "fog sitting low", night: "fog thick in the dark" },
  drizzle:  { day: "a fine drizzle", night: "drizzle under the streetlights" },
  rain:     { day: "rain coming down", night: "rain on the rooftops" },
  snow:     { day: "snow falling softly", night: "snow in the lamplight" },
  storm:    { day: "thunder in the air", night: "a storm rolling through" },
};

const SHORT = {
  clear: "clear", partly: "some cloud", overcast: "overcast", fog: "fog",
  drizzle: "drizzle", rain: "rain", snow: "snow", storm: "storms",
};

/* ── Sky palettes ──────────────────────────────── */
/* [top, mid, low, ink("light"|"dark"), cloudColor] */
const LIGHT = {
  ink: "#fff6e9", soft: "rgba(255,246,233,0.66)", faint: "rgba(255,246,233,0.34)",
  glass: "rgba(12,16,28,0.34)", edge: "rgba(255,246,233,0.16)",
};
const DARK = {
  ink: "#182230", soft: "rgba(24,34,48,0.70)", faint: "rgba(24,34,48,0.40)",
  glass: "rgba(255,255,255,0.40)", edge: "rgba(24,34,48,0.16)",
};

const PAL = {
  clear: {
    dawn:  ["#2b3a67", "#b56576", "#f2b880", "light", "rgba(255,235,220,0.35)"],
    day:   ["#3f8ad1", "#7fb7e6", "#cfe7f5", "dark",  "rgba(255,255,255,0.75)"],
    dusk:  ["#232242", "#8a4a6d", "#e0855a", "light", "rgba(255,220,200,0.28)"],
    night: ["#05070f", "#111a35", "#26325c", "light", "rgba(200,212,240,0.10)"],
  },
  partly: {
    dawn:  ["#2e3a5e", "#a86878", "#e4b088", "light", "rgba(255,240,225,0.4)"],
    day:   ["#4a86c2", "#86aed3", "#ccdde9", "dark",  "rgba(255,255,255,0.8)"],
    dusk:  ["#252547", "#7e5270", "#cf8560", "light", "rgba(255,225,205,0.3)"],
    night: ["#070a14", "#151d38", "#2b3558", "light", "rgba(205,215,240,0.12)"],
  },
  overcast: {
    day:   ["#5d6b78", "#8b98a3", "#c3ccd2", "dark",  "rgba(255,255,255,0.5)"],
    night: ["#0d1219", "#1d2530", "#333f4d", "light", "rgba(190,200,215,0.08)"],
  },
  fog: {
    day:   ["#8e99a3", "#b6bfc6", "#dfe4e7", "dark",  "rgba(255,255,255,0.65)"],
    night: ["#11161c", "#232b33", "#3b454f", "light", "rgba(200,208,218,0.10)"],
  },
  drizzle: {
    day:   ["#48586a", "#68798b", "#9dabb8", "light", "rgba(230,238,245,0.30)"],
    night: ["#080e18", "#16202e", "#2b3a4d", "light", "rgba(200,212,230,0.10)"],
  },
  rain: {
    day:   ["#3c4c5c", "#5d7082", "#93a4b2", "light", "rgba(225,233,242,0.28)"],
    night: ["#070c15", "#141e2b", "#283749", "light", "rgba(195,208,226,0.10)"],
  },
  snow: {
    day:   ["#9fb4c7", "#cdd9e4", "#f2f5f8", "dark",  "rgba(255,255,255,0.8)"],
    night: ["#141d2c", "#2a394e", "#4e6076", "light", "rgba(220,230,244,0.14)"],
  },
  storm: {
    day:   ["#1c2029", "#333a47", "#535e6f", "light", "rgba(120,130,148,0.45)"],
    night: ["#05070c", "#12161f", "#252c3a", "light", "rgba(90,100,120,0.4)"],
  },
};

function phaseFrom(frac) {
  if (frac < -0.06 || frac > 1.06) return "night";
  if (frac <= 0.09) return "dawn";
  if (frac >= 0.91) return "dusk";
  return "day";
}

function palette(g, phase) {
  const set = PAL[g];
  return set[phase] || set[phase === "dawn" || phase === "dusk" ? "day" : phase] || set.day || set.night;
}

/* ── Fetch layer ───────────────────────────────── */
async function geocode(query, count = 6) {
  const res = await fetch(`${GEO_URL}?name=${encodeURIComponent(query)}&count=${count}&language=en&format=json`);
  if (!res.ok) throw new Error("geocoding failed");
  const data = await res.json();
  return (data.results || []).map(r => ({
    name: r.name, admin: r.admin1 || "", country: r.country_code || "",
    lat: r.latitude, lon: r.longitude,
  }));
}

async function fetchForecast(lat, lon) {
  const p = new URLSearchParams({
    latitude: lat, longitude: lon,
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,dew_point_2m",
    minutely_15: "precipitation",
    hourly: "temperature_2m,precipitation_probability,weather_code,cloud_cover,visibility,uv_index",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max",
    timezone: "auto", past_days: "1", forecast_days: "7",
  });
  const res = await fetch(`${WX_URL}?${p}`);
  if (!res.ok) throw new Error("forecast failed");
  return res.json();
}

async function fetchAir(lat, lon) {
  try {
    const p = new URLSearchParams({
      latitude: lat, longitude: lon,
      current: "european_aqi,pm2_5,alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen",
    });
    const res = await fetch(`${AQ_URL}?${p}`);
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

async function fetchQuickTemp(lat, lon) {
  try {
    const p = new URLSearchParams({ latitude: lat, longitude: lon, current: "temperature_2m" });
    const res = await fetch(`${WX_URL}?${p}`);
    if (!res.ok) return null;
    const j = await res.json();
    return j.current ? j.current.temperature_2m : null;
  } catch { return null; }
}

/* 8 years of daily highs, filtered client-side to this calendar date -
   one heavier call, so it's always fired off in the background rather
   than blocking the main render. */
async function fetchHistoricalToday(lat, lon, monthDay) {
  try {
    const endYear = new Date().getUTCFullYear() - 1;
    const startYear = endYear - 7;
    const p = new URLSearchParams({
      latitude: lat, longitude: lon,
      start_date: `${startYear}-01-01`, end_date: `${endYear}-12-31`,
      daily: "temperature_2m_max", timezone: "auto",
    });
    const res = await fetch(`${HIST_URL}?${p}`);
    if (!res.ok) return null;
    const j = await res.json();
    const rows = j.daily.time
      .map((d, i) => ({ d, max: j.daily.temperature_2m_max[i] }))
      .filter(r => r.d.slice(5) === monthDay && r.max != null);
    if (!rows.length) return null;
    const avg = rows.reduce((a, r) => a + r.max, 0) / rows.length;
    const record = rows.reduce((a, r) => (r.max > a.max ? r : a), rows[0]);
    return { avg, recordMax: record.max, recordYear: record.d.slice(0, 4), years: rows.length };
  } catch { return null; }
}

/* ── Sky scene painter ─────────────────────────── */
function stationNow(offsetSec) {
  return new Date(Date.now() + offsetSec * 1000); // read with getUTC* = station wall clock
}

function sunFraction(data) {
  const ti = todayDailyIndex(data);
  const rise = new Date(data.daily.sunrise[ti]);
  const set = new Date(data.daily.sunset[ti]);
  const n = stationNow(data.utc_offset_seconds);
  const now = new Date(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate(), n.getUTCHours(), n.getUTCMinutes());
  return { frac: (now - rise) / (set - rise), rise, set, now };
}

function paintSky(data, scrubIdx) {
  const cur = data.current;
  const scrubbing = scrubIdx != null;

  let g, cloudCover, frac, rise, set, now;
  const base = sunFraction(data);
  rise = base.rise; set = base.set;

  if (scrubbing) {
    g = group(data.hourly.weather_code[scrubIdx]);
    cloudCover = data.hourly.cloud_cover ? data.hourly.cloud_cover[scrubIdx] : cur.cloud_cover;
    now = new Date(data.hourly.time[scrubIdx]);
    const dateStr = data.hourly.time[scrubIdx].slice(0, 10);
    const di = data.daily.time.indexOf(dateStr);
    if (di >= 0) { rise = new Date(data.daily.sunrise[di]); set = new Date(data.daily.sunset[di]); }
    frac = (now - rise) / (set - rise);
  } else {
    g = group(cur.weather_code);
    cloudCover = cur.cloud_cover;
    frac = base.frac; now = base.now;
  }

  const phase = phaseFrom(frac);
  const [top, mid, low, inkKind, cloudColor] = palette(g, phase);
  const theme = inkKind === "dark" ? DARK : LIGHT;

  const rs = document.documentElement.style;
  rs.setProperty("--sky-top", top);
  rs.setProperty("--sky-mid", mid);
  rs.setProperty("--sky-low", low);
  rs.setProperty("--ink", theme.ink);
  rs.setProperty("--ink-soft", theme.soft);
  rs.setProperty("--ink-faint", theme.faint);
  rs.setProperty("--glass", theme.glass);
  rs.setProperty("--glass-edge", theme.edge);

  /* stars - only on clear-ish nights */
  const stars = $("#stars");
  stars.innerHTML = "";
  if (phase === "night" && (g === "clear" || g === "partly")) {
    const field = document.createElement("div");
    field.className = "star-field";
    const shadows = [];
    const w = window.innerWidth, h = window.innerHeight;
    for (let i = 0; i < 130; i++) {
      const x = Math.round(Math.random() * w);
      const y = Math.round(Math.random() * h * 0.75);
      const a = (0.25 + Math.random() * 0.75).toFixed(2);
      const r = Math.random() > 0.88 ? 1.6 : 1;
      shadows.push(`${x}px ${y}px 0 ${r}px rgba(255,252,240,${a})`);
    }
    field.style.boxShadow = shadows.join(",");
    stars.appendChild(field);
  }

  /* sun or moon */
  const cel = $("#celestial");
  let discFrac, isSun;
  if (frac >= 0 && frac <= 1) { discFrac = frac; isSun = true; }
  else {
    // position the moon across the night window
    const nightLen = 24 * 3600e3 - (set - rise);
    const sinceSet = now > set ? now - set : now - (new Date(set.getTime() - 24 * 3600e3));
    discFrac = Math.max(0.03, Math.min(0.97, sinceSet / nightLen));
    isSun = false;
  }
  const hideDisc = (g === "overcast" || g === "fog" || g === "storm" || g === "rain");
  if (hideDisc) {
    cel.innerHTML = "";
  } else {
    const x = 9 + discFrac * 82;
    const y = 60 - Math.sin(Math.PI * discFrac) * 44;
    cel.innerHTML = `<div class="disc ${isSun ? "sun" : "moon"}" style="left:${x.toFixed(1)}%;top:${y.toFixed(1)}%"></div>`;
  }

  /* clouds */
  const clouds = $("#clouds");
  clouds.innerHTML = "";
  const n = Math.round((cloudCover / 100) * 6) + (g === "storm" ? 3 : 0);
  for (let i = 0; i < n; i++) {
    const c = document.createElement("div");
    c.className = "cloud";
    const wv = 24 + Math.random() * 26;
    c.style.cssText = `width:${wv}vw;height:${8 + Math.random() * 8}vh;top:${2 + Math.random() * 36}%;left:${-12 + Math.random() * 86}%;background:${cloudColor};animation-duration:${55 + Math.random() * 70}s;animation-delay:-${Math.random() * 60}s;`;
    clouds.appendChild(c);
  }

  /* precipitation */
  const precip = $("#precip");
  precip.innerHTML = "";
  const mkDrops = (count, minDur, maxDur) => {
    for (let i = 0; i < count; i++) {
      const d = document.createElement("span");
      d.className = "drop";
      d.style.cssText = `left:${Math.random() * 100}%;animation-duration:${(minDur + Math.random() * (maxDur - minDur)).toFixed(2)}s;animation-delay:-${(Math.random() * 2).toFixed(2)}s;opacity:${0.4 + Math.random() * 0.6};`;
      precip.appendChild(d);
    }
  };
  if (g === "drizzle") mkDrops(26, 1.1, 1.7);
  if (g === "rain") mkDrops(60, 0.6, 1.1);
  if (g === "storm") mkDrops(85, 0.45, 0.85);
  if (g === "snow") {
    for (let i = 0; i < 42; i++) {
      const f = document.createElement("span");
      f.className = "flake";
      const s = 2.5 + Math.random() * 3.5;
      f.style.cssText = `left:${Math.random() * 100}%;width:${s}px;height:${s}px;animation-duration:${(6 + Math.random() * 7).toFixed(1)}s;animation-delay:-${(Math.random() * 10).toFixed(1)}s;opacity:${0.35 + Math.random() * 0.6};`;
      precip.appendChild(f);
    }
  }

  $("#flash").className = g === "storm" ? "storm" : "";
  return { g, phase, frac };
}

/* ── Deck renderers ────────────────────────────── */
function currentHourIndex(data) {
  const n = stationNow(data.utc_offset_seconds);
  const key = `${n.getUTCFullYear()}-${pad(n.getUTCMonth() + 1)}-${pad(n.getUTCDate())}T${pad(n.getUTCHours())}:00`;
  const idx = data.hourly.time.indexOf(key);
  return idx >= 0 ? idx : 0;
}

function todayDailyIndex(data) {
  const n = stationNow(data.utc_offset_seconds);
  const key = `${n.getUTCFullYear()}-${pad(n.getUTCMonth() + 1)}-${pad(n.getUTCDate())}`;
  const idx = data.daily.time.indexOf(key);
  return idx >= 0 ? idx : 0;
}

/* Meeus-derived approximation: days since a known new moon, mod the
   synodic month, mapped to one of the 8 named phases. */
function moonPhase(date) {
  const synodic = 29.530588853;
  const knownNewMoon = Date.UTC(2000, 0, 6, 18, 14);
  const days = (date.getTime() - knownNewMoon) / 86400000;
  const age = ((days % synodic) + synodic) % synodic;
  const names = ["new moon", "waxing crescent", "first quarter", "waxing gibbous", "full moon", "waning gibbous", "last quarter", "waning crescent"];
  const glyphs = ["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘"];
  const i = Math.round(age / (synodic / 8)) % 8;
  return { name: names[i], glyph: glyphs[i], age };
}

function daylightLabel(riseISO, setISO) {
  const mins = Math.round((new Date(setISO) - new Date(riseISO)) / 60000);
  const h = Math.floor(mins / 60), m = mins % 60;
  return `${h}h ${m}m of daylight`;
}

/* Scans the remaining hours of today for the driest contiguous
   stretch, so the hero can say something forward-looking rather
   than just describing the current instant. */
function bestWindowToday(data, hIdx) {
  const times = data.hourly.time;
  const probs = data.hourly.precipitation_probability;
  if (hIdx >= times.length - 1) return null;

  const todayDate = times[hIdx].slice(0, 10);
  let endIdx = hIdx;
  while (endIdx + 1 < times.length && times[endIdx + 1].slice(0, 10) === todayDate) endIdx++;
  endIdx = Math.min(endIdx, hIdx + 11); // don't look more than ~12h ahead
  if (endIdx - hIdx < 1) return null;   // too close to midnight to say anything useful

  let best = null;
  for (let start = hIdx; start <= endIdx; start++) {
    for (let end = start + 1; end <= endIdx; end++) {
      const slice = probs.slice(start, end + 1);
      const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
      const len = end - start + 1;
      if (!best || avg < best.avg - 2 || (Math.abs(avg - best.avg) <= 2 && len > best.len)) {
        best = { start, end, avg, len };
      }
    }
  }
  if (!best) return null;

  const label = (i) => times[i].slice(11, 16);
  const spansRest = best.end === endIdx && best.start === hIdx;
  const spansToEnd = best.end === endIdx;

  if (best.avg < 15) {
    return spansRest ? "dry for the rest of the day" : `dry ${label(best.start)}–${label(best.end)}${spansToEnd ? "" : ", then rain returns"}`;
  }
  if (best.avg < 40) {
    return `best chance of staying dry ${label(best.start)}–${label(best.end)}`;
  }
  return `rain likely most of the day - driest around ${label(best.start)}`;
}

/* Short-range precipitation read from the 15-minute series: when will
   rain start, or when will the rain that's falling now let up. Stays
   quiet (returns "") when nothing changes in the next two hours. */
function rainNowcast(data) {
  const m = data.minutely_15;
  if (!m || !m.time || !m.precipitation) return "";
  const n = stationNow(data.utc_offset_seconds);
  const nowMs = Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate(), n.getUTCHours(), n.getUTCMinutes());

  let cur = -1;
  for (let i = 0; i < m.time.length; i++) {
    if (Date.parse(m.time[i] + ":00Z") <= nowMs) cur = i; else break;
  }
  if (cur < 0) return "";

  const WET = 0.05; // mm per 15 min - anything above this is "raining"
  const horizon = Math.min(cur + 8, m.time.length - 1); // ~2 hours
  const roundMin = (mins) => mins <= 20 ? Math.round(mins / 5) * 5 : Math.round(mins / 10) * 10;
  const say = (mins) => {
    const r = roundMin(mins);
    if (r <= 5) return "any minute now";
    if (r < 60) return `in about ${r} minutes`;
    if (r === 60) return "in about an hour";
    return "in a little over an hour";
  };

  const rainingNow = m.precipitation[cur] > WET;
  if (rainingNow) {
    for (let i = cur + 1; i <= horizon; i++) {
      if (m.precipitation[i] <= WET) {
        const dry = i + 1 <= horizon ? m.precipitation.slice(i, horizon + 1).every(v => v <= WET) : true;
        return dry ? `rain eases ${say((i - cur) * 15)}` : `a break in the rain ${say((i - cur) * 15)}`;
      }
    }
    return "rain settled in for the next couple of hours";
  }
  for (let i = cur + 1; i <= horizon; i++) {
    if (m.precipitation[i] > WET) return `rain starting ${say((i - cur) * 15)}`;
  }
  return "";
}

/* apparent temperature + wind + rain + sun, turned into a plain
   "what to wear" sentence for the hero. */
function whatToWear(data, todayIdx, hIdx) {
  const cur = data.current;
  const feels = cur.apparent_temperature;
  const rainMax = data.daily.precipitation_probability_max[todayIdx] ?? 0;
  const gust = cur.wind_gusts_10m ?? cur.wind_speed_10m ?? 0;
  const uv = data.hourly.uv_index ? (data.hourly.uv_index[hIdx] ?? 0) : 0;

  let core;
  if (feels < 0) core = "thermals and a proper coat";
  else if (feels < 8) core = "a warm coat kind of day";
  else if (feels < 15) core = "a jacket kind of day";
  else if (feels < 22) core = "t-shirt weather, a layer for later";
  else if (feels < 29) core = "shorts and shade";
  else core = "keep to the shade, drink water";

  const extra = [];
  if (rainMax >= 55) extra.push("bring an umbrella");
  else if (rainMax >= 30) extra.push("maybe an umbrella");
  if (gust >= 40) extra.push("something windproof");
  if (uv >= 6 && cur.is_day) extra.push("sunscreen");

  return extra.length ? `${core} - ${extra.join(", ")}` : core;
}

const POLLEN_TYPES = [
  ["alder_pollen", "alder", [10, 50, 200]],
  ["birch_pollen", "birch", [10, 50, 200]],
  ["olive_pollen", "olive", [10, 50, 200]],
  ["grass_pollen", "grass", [5, 20, 50]],
  ["mugwort_pollen", "mugwort", [5, 20, 50]],
  ["ragweed_pollen", "ragweed", [5, 20, 50]],
];
const POLLEN_WORDS = ["low", "moderate", "high", "very high"];

function renderPollen(aq) {
  const el = $("#pollenLine");
  if (!aq || !aq.current) { setLine(el, ""); return; }
  const active = [];
  for (const [key, name, [t1, t2, t3]] of POLLEN_TYPES) {
    const v = aq.current[key];
    if (v == null || v < t1) continue;
    const level = v >= t3 ? 3 : v >= t2 ? 2 : 1;
    active.push({ name, level });
  }
  if (!active.length) { setLine(el, ""); return; }
  active.sort((a, b) => b.level - a.level);
  const top = active.slice(0, 2)
    .map(p => `<b>${p.name}</b> pollen ${POLLEN_WORDS[p.level]}`)
    .join(", ");
  el.innerHTML = top;
  el.hidden = false;
}

function drawHourCurve(hourly, startIdx) {
  const N = 24;
  const temps = hourly.temperature_2m.slice(startIdx, startIdx + N).map(c => unit === "C" ? c : cToF(c));
  const probs = hourly.precipitation_probability.slice(startIdx, startIdx + N);
  const times = hourly.time.slice(startIdx, startIdx + N);
  const svg = $("#hourCurve");
  if (temps.length < 2) { svg.innerHTML = ""; return; }

  const W = 800, H = 150, padX = 16, padT = 34, padB = 40;
  const iw = W - padX * 2, ih = H - padT - padB;
  const min = Math.min(...temps), max = Math.max(...temps);
  const span = Math.max(max - min, 2);
  const px = (i) => padX + (i / (temps.length - 1)) * iw;
  const py = (v) => padT + (1 - (v - min) / span) * ih;
  curveGeo = { startIdx, count: temps.length, W, padX, iw, top: padT - 8, bot: H - padB + 8 };

  const pts = temps.map((v, i) => `${px(i).toFixed(1)},${py(v).toFixed(1)}`);
  let marks = "";
  for (let i = 0; i < temps.length; i += 3) {
    const x = px(i), y = py(temps[i]);
    marks += `<circle cx="${x}" cy="${y}" r="3" fill="var(--ink)"/>
      <text x="${x}" y="${y - 12}" text-anchor="middle" font-size="13" font-weight="500" fill="var(--ink)" font-family="Sora,sans-serif">${Math.round(temps[i])}°</text>
      <text x="${x}" y="${H - 20}" text-anchor="middle" font-size="10" font-weight="300" fill="var(--ink-soft)" font-family="Sora,sans-serif">${times[i].slice(11, 16)}</text>`;
    if (probs[i] >= 25) {
      marks += `<text x="${x}" y="${H - 5}" text-anchor="middle" font-size="9" font-weight="300" fill="var(--ink-faint)" font-family="Sora,sans-serif">☂${probs[i]}%</text>`;
    }
  }
  svg.innerHTML = `
    <polyline points="${pts.join(" ")}" fill="none" stroke="var(--ink-faint)" stroke-width="4" stroke-linejoin="round" stroke-linecap="round" opacity="0.35" transform="translate(0 2)"/>
    <polyline points="${pts.join(" ")}" fill="none" stroke="var(--ink)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
    ${marks}
    <line id="scrubCursor" x1="0" y1="${curveGeo.top}" x2="0" y2="${curveGeo.bot}" stroke="var(--ink)" stroke-width="1.5" stroke-dasharray="2 3" style="visibility:hidden"/>`;
}

/* ── Scrub the day ─────────────────────────────── */
let curveGeo = null;
let scrubbing = false;
let scrubSaved = null;

function hourIdxFromClientX(clientX) {
  if (!curveGeo || !wx) return null;
  const svg = $("#hourCurve");
  const r = svg.getBoundingClientRect();
  const vx = (clientX - r.left) / r.width * curveGeo.W;
  const step = curveGeo.iw / Math.max(curveGeo.count - 1, 1);
  let k = Math.round((vx - curveGeo.padX) / step);
  k = Math.max(0, Math.min(curveGeo.count - 1, k));
  return curveGeo.startIdx + k;
}

function scrubTo(clientX) {
  const idx = hourIdxFromClientX(clientX);
  if (idx == null) return;
  if (!scrubbing) {
    scrubbing = true;
    scrubSaved = { temp: $("#bigTemp").textContent, phrase: $("#phrase").textContent };
    $("#scrubHint").classList.add("gone");
  }
  const local = curveGeo.startIdx;
  const cursor = $("#scrubCursor");
  if (cursor) {
    const step = curveGeo.iw / Math.max(curveGeo.count - 1, 1);
    const x = curveGeo.padX + (idx - local) * step;
    cursor.setAttribute("x1", x.toFixed(1));
    cursor.setAttribute("x2", x.toFixed(1));
    cursor.style.visibility = "visible";
  }

  const res = paintSky(wx, idx);
  drawSunPath(res.frac);
  $("#bigTemp").textContent = t(wx.hourly.temperature_2m[idx]);
  const timeStr = wx.hourly.time[idx].slice(11, 16);
  const dayNight = res.frac >= 0 && res.frac <= 1 ? "day" : "night";
  $("#phrase").textContent = `${PHRASES[res.g][dayNight]} · ${timeStr}`;
  const st = $("#scrubTime");
  st.textContent = `· ${timeStr}`;
  st.classList.add("on");
}

function endScrub() {
  const cursor = $("#scrubCursor");
  if (cursor) cursor.style.visibility = "hidden";
  $("#scrubTime").classList.remove("on");
  $("#scrubTime").textContent = "";
  if (!scrubbing) return;
  scrubbing = false;
  if (wx) {
    const res = paintSky(wx);
    drawSunPath(res.frac);
  }
  if (scrubSaved) {
    $("#bigTemp").textContent = scrubSaved.temp;
    $("#phrase").textContent = scrubSaved.phrase;
    scrubSaved = null;
  }
}

(function wireScrub() {
  const svg = $("#hourCurve");
  if (!svg) return;
  let down = false;
  svg.addEventListener("pointerdown", (e) => { down = true; svg.setPointerCapture?.(e.pointerId); scrubTo(e.clientX); });
  svg.addEventListener("pointermove", (e) => {
    if (e.pointerType === "mouse" && !down) { scrubTo(e.clientX); return; }
    if (down) { e.preventDefault(); scrubTo(e.clientX); }
  });
  svg.addEventListener("pointerup", () => { down = false; endScrub(); });
  svg.addEventListener("pointercancel", () => { down = false; endScrub(); });
  svg.addEventListener("pointerleave", () => { if (!down) endScrub(); });
})();

function drawSunPath(frac) {
  const f = Math.max(0.02, Math.min(0.98, frac));
  const a = Math.PI * (1 - f);
  const x = 80 + 62 * Math.cos(a), y = 48 - 40 * Math.sin(a);
  const night = frac < 0 || frac > 1;
  $("#sunPath").innerHTML = `
    <path d="M18 48 A62 62 0 0 1 142 48" fill="none" stroke="var(--ink-faint)" stroke-width="1.5" stroke-dasharray="1 5" stroke-linecap="round"/>
    <line x1="8" y1="48" x2="152" y2="48" stroke="var(--ink-faint)" stroke-width="1"/>
    ${night ? "" : `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5" fill="var(--ink)"/>`}`;
}

const AIR_WORDS = [
  [20, "lovely"], [40, "fine"], [60, "a little tired"], [80, "poor"], [100, "heavy"], [Infinity, "hazardous"],
];
function renderAir(aq) {
  if (!aq || !aq.current || aq.current.european_aqi == null) {
    $("#airWord").textContent = "unmeasured here";
    $("#airDetail").textContent = "";
    return;
  }
  const v = Math.round(aq.current.european_aqi);
  const [, word] = AIR_WORDS.find(([lim]) => v <= lim);
  $("#airWord").textContent = word;
  $("#airDetail").textContent = `european aqi ${v}` + (aq.current.pm2_5 != null ? ` · pm2.5 ${Math.round(aq.current.pm2_5)} µg/m³` : "");
}

function renderHistory() {
  const el = $("#historyLine");
  if (!lastHistory || !wx) { setLine(el, ""); return; }
  const todayIdx = todayDailyIndex(wx);
  const todayHigh = wx.daily.temperature_2m_max[todayIdx];
  const { avg, recordMax, years, monthDay } = lastHistory;
  const [mm, dd] = monthDay.split("-").map(Number);
  const dateLabel = `${MONTHS[mm - 1]} ${dd}`;
  const diff = todayHigh - avg;
  const diffDisplay = Math.round(unit === "C" ? diff : diff * 9 / 5);

  if (todayHigh >= recordMax - 0.3) {
    setLine(el, `the warmest ${dateLabel} in ${years} years`);
  } else if (diff >= 2) {
    setLine(el, `${diffDisplay}° above the ${years}-year average for ${dateLabel}`);
  } else if (diff <= -2) {
    setLine(el, `${Math.abs(diffDisplay)}° below the ${years}-year average for ${dateLabel}`);
  } else {
    setLine(el, `about average for ${dateLabel}, in line with the last ${years} years`);
  }
}

function compass(deg) {
  const dirs = ["north", "north-east", "east", "south-east", "south", "south-west", "west", "north-west"];
  return dirs[Math.round(deg / 45) % 8];
}

/* ── Main render ───────────────────────────────── */
function render(data, air) {
  wx = data;
  if (air !== undefined) lastAir = air;
  const cur = data.current;
  const daily = data.daily;
  const hIdx = currentHourIndex(data);
  const todayIdx = todayDailyIndex(data);

  const { g, frac } = paintSky(data);

  // hero
  const dayNight = cur.is_day ? "day" : "night";
  $("#bigTemp").textContent = t(cur.temperature_2m);
  $("#phrase").textContent = `${PHRASES[g][dayNight]} over ${place.name.toLowerCase()}`;
  $("#feels").textContent = t(cur.apparent_temperature);
  $("#hi").textContent = t(daily.temperature_2m_max[todayIdx]);
  $("#lo").textContent = t(daily.temperature_2m_min[todayIdx]);
  $("#rain").textContent = (daily.precipitation_probability_max[todayIdx] ?? 0) + "%";
  startClock(data.utc_offset_seconds);

  // yesterday-at-this-hour comparison
  const yIdx = hIdx - 24;
  let compareText = "";
  if (yIdx >= 0 && data.hourly.temperature_2m[yIdx] != null) {
    const diff = Math.round(cur.temperature_2m - data.hourly.temperature_2m[yIdx]);
    compareText = diff === 0
      ? "same as this time yesterday"
      : `${Math.abs(diff)}° ${diff > 0 ? "warmer" : "cooler"} than this time yesterday`;
  }
  setLine($("#compareLine"), compareText);

  // short-range rain nowcast + what to wear
  setLine($("#nowcastLine"), rainNowcast(data));
  setLine($("#wearLine"), whatToWear(data, todayIdx, hIdx));

  // best window today
  setLine($("#windowLine"), bestWindowToday(data, hIdx));

  // week (today forward, 7 days)
  const weekDays = daily.time.slice(todayIdx);
  $("#weekList").innerHTML = weekDays.map((iso, i) => {
    const d = new Date(iso + "T12:00");
    const name = i === 0 ? "today" : d.toLocaleDateString("en-GB", { weekday: "short" }).toLowerCase();
    const di = todayIdx + i;
    return `<div class="week-row">
      <span class="d-name">${name}</span>
      <span class="d-cond">${SHORT[group(daily.weather_code[di])]}</span>
      <span class="d-rain">☂ ${daily.precipitation_probability_max[di] ?? 0}%</span>
      <span class="d-temp"><b>${t(daily.temperature_2m_max[di])}</b><span>${t(daily.temperature_2m_min[di])}</span></span>
    </div>`;
  }).join("");

  // details
  const vis = data.hourly.visibility ? data.hourly.visibility[hIdx] : null;
  const uv = data.hourly.uv_index ? data.hourly.uv_index[hIdx] : null;
  const uvWord = uv == null ? "" : uv < 3 ? " · low" : uv < 6 ? " · moderate" : uv < 8 ? " · high" : " · very high";
  const rows = [
    ["wind", `${windText(cur.wind_speed_10m)} ${compass(cur.wind_direction_10m)}`],
    ["gusts", windText(cur.wind_gusts_10m)],
    ["humidity", `${cur.relative_humidity_2m}%`],
    ["pressure", `${Math.round(cur.surface_pressure)} hPa`],
    ["uv index", uv != null ? uv.toFixed(1) + uvWord : "—"],
    ["visibility", vis != null ? distText(vis / 1000) : "—"],
    ["dew point", t(cur.dew_point_2m)],
    ["cloud cover", `${cur.cloud_cover}%`],
  ];
  $("#detailList").innerHTML = rows.map(([k, v]) =>
    `<div class="d-row"><dt>${k}</dt><dd>${v}</dd></div>`).join("");

  // sun & air
  $("#sunriseT").textContent = daily.sunrise[todayIdx].slice(11, 16);
  $("#sunsetT").textContent = daily.sunset[todayIdx].slice(11, 16);
  drawSunPath(frac);
  const moon = moonPhase(stationNow(data.utc_offset_seconds));
  $("#sunExtra").textContent = `${daylightLabel(daily.sunrise[todayIdx], daily.sunset[todayIdx])} · ${moon.glyph} ${moon.name}`;
  renderAir(lastAir);
  renderPollen(lastAir);
  renderHistory();

  // hourly
  drawHourCurve(data.hourly, hIdx);
  endScrub();

  updateKeepBtn();
  renderKept();
  updateUrlHash();
  $("#hero").hidden = false;
  $("#deck").hidden = false;
}

function updateUrlHash() {
  if (!place) return;
  const slug = encodeURIComponent(place.name);
  history.replaceState(null, "", `#${slug}@${place.lat.toFixed(4)},${place.lon.toFixed(4)}`);
}

function placeFromHash() {
  const m = location.hash.match(/^#(.+)@(-?\d+\.?\d*),(-?\d+\.?\d*)$/);
  if (!m) return null;
  return { name: decodeURIComponent(m[1]), admin: "", country: "", lat: parseFloat(m[2]), lon: parseFloat(m[3]) };
}

/* ── Clock / kicker ────────────────────────────── */
function startClock(offsetSec) {
  clearInterval(clockTimer);
  const tick = () => {
    const n = stationNow(offsetSec);
    const days = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
    const months = ["january","february","march","april","may","june","july","august","september","october","november","december"];
    $("#kickerDate").textContent = `${days[n.getUTCDay()]} ${n.getUTCDate()} ${months[n.getUTCMonth()]}`;
    $("#kickerClock").textContent = `${pad(n.getUTCHours())}:${pad(n.getUTCMinutes())}`;
  };
  tick();
  clockTimer = setInterval(tick, 1000);
}

/* ── Kept places ───────────────────────────────── */
function persistKept() { localStorage.setItem("halcyon-kept", JSON.stringify(kept)); }
function isKept() { return place && kept.some(k => k.lat === place.lat && k.lon === place.lon); }

function updateKeepBtn() {
  const on = isKept();
  $("#keepBtn").classList.toggle("kept-now", on);
  $("#keepStar").textContent = on ? "★" : "☆";
  $("#keepText").textContent = on ? "kept" : "keep this place";
}

function renderKept() {
  $("#keptRow").innerHTML = kept.map((k, i) =>
    `<button class="kept-chip" data-i="${i}"><span class="kept-name">${k.name.toLowerCase()}</span><span class="kept-temp" data-temp="${i}"></span><span class="x" data-x="${i}">✕</span></button>`).join("");
  kept.forEach((k, i) => {
    fetchQuickTemp(k.lat, k.lon).then(v => {
      if (v == null) return;
      const el = $(`[data-temp="${i}"]`);
      if (el) el.textContent = " · " + t(v);
    });
  });
}

$("#keepBtn").addEventListener("click", () => {
  if (!place) return;
  if (isKept()) kept = kept.filter(k => !(k.lat === place.lat && k.lon === place.lon));
  else { kept.push(place); if (kept.length > 8) kept.shift(); }
  persistKept(); updateKeepBtn(); renderKept();
});

$("#keptRow").addEventListener("click", (e) => {
  const x = e.target.closest("[data-x]");
  if (x) {
    kept.splice(Number(x.dataset.x), 1);
    persistKept(); updateKeepBtn(); renderKept();
    return;
  }
  const chip = e.target.closest("[data-i]");
  if (chip) loadPlace(kept[Number(chip.dataset.i)]);
});

/* ── Toast / loading ───────────────────────────── */
let toastTimer = null;
function toast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 4500);
}
function loading(on) {
  $("#loading").hidden = !on;
  if (on) { $("#hero").hidden = true; $("#deck").hidden = true; }
}

/* ── Load pipeline ─────────────────────────────── */
async function loadPlace(p) {
  place = p;
  lastHistory = null;
  loading(true);
  $("#suggestions").classList.remove("open");
  try {
    const [data, air] = await Promise.all([fetchForecast(p.lat, p.lon), fetchAir(p.lat, p.lon)]);
    loading(false);
    render(data, air);
    localStorage.setItem("halcyon-last", JSON.stringify(p));
    loadHistory(p, data);
  } catch (err) {
    console.error(err);
    loading(false);
    toast("the sky isn’t answering - check your connection");
    if (wx) { $("#hero").hidden = false; $("#deck").hidden = false; }
  }
}

function loadHistory(p, data) {
  const monthDay = data.daily.time[todayDailyIndex(data)].slice(5);
  fetchHistoricalToday(p.lat, p.lon, monthDay).then(hist => {
    if (!hist) return;
    if (!place || place.lat !== p.lat || place.lon !== p.lon) return; // place changed while this was in flight
    lastHistory = { ...hist, monthDay };
    renderHistory();
  });
}

async function searchAndLoad(query) {
  if (!query.trim()) { toast("name a place first"); return; }
  loading(true);
  try {
    const results = await geocode(query, 1);
    if (!results.length) {
      loading(false);
      toast(`couldn’t find “${query.toLowerCase()}” anywhere`);
      if (wx) { $("#hero").hidden = false; $("#deck").hidden = false; }
      return;
    }
    await loadPlace(results[0]);
  } catch (err) {
    console.error(err);
    loading(false);
    toast("the sky isn’t answering - check your connection");
    if (wx) { $("#hero").hidden = false; $("#deck").hidden = false; }
  }
}

/* ── Search + autocomplete ─────────────────────── */
const input = $("#placeInput");
const suggBox = $("#suggestions");
let suggTimer = null, suggItems = [], suggActive = -1;

input.addEventListener("input", () => {
  clearTimeout(suggTimer);
  const q = input.value.trim();
  if (q.length < 2) { suggBox.classList.remove("open"); return; }
  suggTimer = setTimeout(async () => {
    try {
      suggItems = await geocode(q, 6);
      suggActive = -1;
      if (!suggItems.length) { suggBox.classList.remove("open"); return; }
      suggBox.innerHTML = suggItems.map((s, i) =>
        `<button class="sugg-item" data-i="${i}">${s.name}<small>${[s.admin, s.country].filter(Boolean).join(", ").toLowerCase()}</small></button>`).join("");
      suggBox.classList.add("open");
    } catch { suggBox.classList.remove("open"); }
  }, 280);
});

suggBox.addEventListener("click", (e) => {
  const item = e.target.closest("[data-i]");
  if (!item) return;
  const p = suggItems[Number(item.dataset.i)];
  input.value = "";
  loadPlace(p);
});

input.addEventListener("keydown", (e) => {
  const open = suggBox.classList.contains("open");
  if (e.key === "ArrowDown" && open) {
    e.preventDefault();
    suggActive = (suggActive + 1) % suggItems.length;
    highlight();
  } else if (e.key === "ArrowUp" && open) {
    e.preventDefault();
    suggActive = (suggActive - 1 + suggItems.length) % suggItems.length;
    highlight();
  } else if (e.key === "Enter") {
    if (open && suggActive >= 0) { const p = suggItems[suggActive]; input.value = ""; loadPlace(p); }
    else { searchAndLoad(input.value); input.value = ""; }
    suggBox.classList.remove("open");
  } else if (e.key === "Escape") {
    suggBox.classList.remove("open");
  }
});

function highlight() {
  suggBox.querySelectorAll(".sugg-item").forEach((el, i) => el.classList.toggle("active", i === suggActive));
}

document.addEventListener("click", (e) => {
  if (!$("#search").contains(e.target)) suggBox.classList.remove("open");
});

/* ── Geolocation ───────────────────────────────── */
$("#geoBtn").addEventListener("click", () => locate(true));

function locate(fromClick) {
  if (!navigator.geolocation) {
    if (fromClick) toast("your browser keeps its location secret");
    return bootFallback();
  }
  loading(true);
  // getCurrentPosition's own timeout doesn't tick while the permission
  // prompt is open - don't leave the page on the loader forever
  const safety = setTimeout(() => { if (!wx) bootFallback(); }, 8000);
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      clearTimeout(safety);
      const { latitude, longitude } = pos.coords;
      const p = { name: "right here", admin: "", country: "", lat: latitude, lon: longitude };
      await loadPlace(p);
      // borrow a nicer name from the forecast's timezone city
      if (wx && wx.timezone && wx.timezone.includes("/")) {
        place.name = wx.timezone.split("/").pop().replace(/_/g, " ");
        render(wx);
      }
    },
    () => {
      clearTimeout(safety);
      if (fromClick) toast("couldn’t find you - search instead?");
      bootFallback();
    },
    { timeout: 7000, maximumAge: 3600000 }
  );
}

function bootFallback() {
  if (wx) { loading(false); return; }
  const last = localStorage.getItem("halcyon-last");
  if (last) { loadPlace(JSON.parse(last)); return; }
  loadPlace({ name: "London", admin: "England", country: "GB", lat: 51.5072, lon: -0.1276 });
}

/* ── Units ─────────────────────────────────────── */
document.querySelectorAll(".u-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    unit = btn.dataset.unit;
    localStorage.setItem("halcyon-unit", unit);
    document.querySelectorAll(".u-btn").forEach(b => b.classList.toggle("on", b.dataset.unit === unit));
    if (wx) render(wx);
  });
});

/* ── Keyboard shortcut: "/" focuses search ─────── */
document.addEventListener("keydown", (e) => {
  if (e.key !== "/") return;
  const tag = document.activeElement && document.activeElement.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA") return;
  e.preventDefault();
  input.focus();
});

/* ── Quiet auto-refresh every 15 minutes ───────── */
setInterval(() => {
  if (!place) return;
  Promise.all([fetchForecast(place.lat, place.lon), fetchAir(place.lat, place.lon)])
    .then(([data, air]) => render(data, air))
    .catch(() => {});
}, 15 * 60 * 1000);

/* ── PWA install ───────────────────────────────── */
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}

/* ── Boot ──────────────────────────────────────── */
document.querySelectorAll(".u-btn").forEach(b => b.classList.toggle("on", b.dataset.unit === unit));
const hashPlace = placeFromHash();
if (hashPlace) loadPlace(hashPlace);
else locate(false);
