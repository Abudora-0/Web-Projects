"use strict";
/* =================================================================
   DISPATCH - a mini social on the airwaves
   Post a transmission, copy (reply) on the same frequency, boost a
   relay, add signal. Radio-net dressing over a small, honest feed.
   Vanilla JS, one IIFE. Thin shells: <body data-page> + <main id=main>.
   ================================================================= */
(function () {

/* ---------- helpers ---------- */
const $  = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const PAGE = document.body.dataset.page;
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const DAY = 86400000;
const now = () => Date.now();

function hashStr(s) { let h = 2166136261 >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h; }
function relTime(ts) {
  const d = now() - ts;
  if (d < 45000) return "just now";
  if (d < 3600000) return Math.round(d / 60000) + "m";
  if (d < DAY) return Math.round(d / 3600000) + "h";
  if (d < 7 * DAY) return Math.round(d / DAY) + "d";
  return new Date(ts).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
function stamp(ts) {
  const dt = new Date(ts);
  return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase() +
    "  " + dt.toTimeString().slice(0, 5) + " LOCAL";
}

/* ---------- frequency plan ---------- */
const BANDS = [
  { topic: "darkroom",  freq: "7.135",  label: "DARKROOM" },
  { topic: "coffee",    freq: "14.070", label: "COFFEE" },
  { topic: "running",   freq: "3.573",  label: "ROADWORK" },
  { topic: "synths",    freq: "21.074", label: "OSCILLATORS" },
  { topic: "cycling",   freq: "10.136", label: "THE COMMUTE" },
  { topic: "garden",    freq: "18.100", label: "THE PLOT" },
  { topic: "books",     freq: "28.074", label: "THE STACKS" },
  { topic: "radio",     freq: "1.840",  label: "THE SHACK" },
  { topic: "kitchen",   freq: "24.915", label: "THE KITCHEN" },
  { topic: "general",   freq: "7.200",  label: "OPEN QSO" }
];
const bandByTopic = (t) => BANDS.find((b) => b.topic === t) || BANDS[BANDS.length - 1];
const bandByFreq  = (f) => BANDS.find((b) => b.freq === f) || null;
function freqForText(text) {
  const tag = (text.match(/#([a-z0-9]+)/i) || [])[1];
  if (tag) { const b = BANDS.find((x) => x.topic === tag.toLowerCase() || x.label.toLowerCase().replace(/\s/g, "") === tag.toLowerCase()); if (b) return b; }
  return BANDS[hashStr(text) % (BANDS.length - 1)]; // never auto-assigns "general"
}

/* ---------- seeded operators ---------- */
const OPERATORS = [
  { call: "KX7-MARLOW", name: "Marlow",  bio: "Wet prints and long exposures. Darkroom in the spare room.", joined: "2026-03-11", where: "Portland" },
  { call: "W2-JUN",     name: "Jun",     bio: "Coffee first, then everything else. Slow pour-overs, fast film.", joined: "2026-04-02", where: "Brooklyn" },
  { call: "G4-ROSA",    name: "Rosa",    bio: "Marathon in the spring. Splits, shoes, and complaints about hills.", joined: "2026-02-19", where: "Bristol" },
  { call: "VK3-ODA",    name: "Oda",     bio: "Building a modular synth one module a month. Currently soldering.", joined: "2026-05-06", where: "Melbourne" },
  { call: "N1-PIKE",    name: "Pike",    bio: "Bike commuter, all weather. Panniers over backpacks, always.", joined: "2026-01-28", where: "Cambridge" },
  { call: "EA5-LUZ",    name: "Luz",     bio: "Twelve tomato varieties and a stubborn fig tree.", joined: "2026-06-14", where: "Valencia" },
  { call: "JA1-KEN",    name: "Ken",     bio: "Second-hand bookshop. Ask me what to read next.", joined: "2026-03-30", where: "Kyoto" },
  { call: "ZL2-BRY",    name: "Bry",     bio: "Night-shift radio op. Happy to help a new operator find the band.", joined: "2025-11-09", where: "Wellington" }
];
const opByCall = (c) => OPERATORS.find((o) => o.call === c);

/* ---------- seeded transmissions ---------- */
function ago(d, h) { return now() - d * DAY - (h || 0) * 3600000; }
const SEED_TX = [
  { id: "s01", call: "KX7-MARLOW", body: "Got the darkroom working again after three years. First print tonight. #darkroom", ts: ago(0, 2) },
  { id: "s02", call: "W2-JUN", body: "Which developer are you running?", ts: ago(0, 1.4), replyTo: "s01" },
  { id: "s03", call: "KX7-MARLOW", body: "Rodinal 1:50, stand for an hour. Forgiving with old paper.", ts: ago(0, 1.1), replyTo: "s02" },
  { id: "s04", call: "ZL2-BRY", body: "Welcome back to the band. Post the first print when it's dry. Over.", ts: ago(0, 0.8), replyTo: "s01" },
  { id: "s05", call: "G4-ROSA", body: "18 miles this morning, negative split, felt like flying for exactly none of it. #running", ts: ago(0, 5) },
  { id: "s06", call: "N1-PIKE", body: "Respect. I did 12 on the bike and called it heroic.", ts: ago(0, 4.6), replyTo: "s05" },
  { id: "s07", call: "VK3-ODA", body: "New oscillator module is alive. It only makes one sound and I love it. #synths", ts: ago(1, 3) },
  { id: "s08", call: "W2-JUN", body: "What sound", ts: ago(1, 2.7), replyTo: "s07" },
  { id: "s09", call: "VK3-ODA", body: "A sort of angry bee trapped in a filter. Clip attached in spirit.", ts: ago(1, 2.5), replyTo: "s08" },
  { id: "s10", call: "EA5-LUZ", body: "First ripe tomato of the year. Ate it over the sink like an animal. #garden", ts: ago(1, 8) },
  { id: "s11", call: "JA1-KEN", body: "Someone traded in a first edition today and didn't know it. I told them. Slept fine. #books", ts: ago(2, 4) },
  { id: "s12", call: "KX7-MARLOW", body: "Print's dry. Grain like gravel, highlights I'd kill for. Worth the three years.", ts: ago(2, 6), replyTo: "s01" },
  { id: "s13", call: "W2-JUN", body: "Cold brew ratio debate, once and for all: I do 1:8 by weight, 16 hours, no chicory. Fight me on frequency. #coffee", ts: ago(2, 9) },
  { id: "s14", call: "G4-ROSA", body: "1:5 concentrate then dilute to taste. Your 1:8 is just brown water, respectfully.", ts: ago(2, 8.5), replyTo: "s13" },
  { id: "s15", call: "N1-PIKE", body: "Front derailleur finally indexed after a week of clicking. The silence is unreal. #cycling", ts: ago(3, 5) },
  { id: "s16", call: "ZL2-BRY", body: "Band conditions poor tonight, lot of static. Good night to read instead. Anyone got something short? #books", ts: ago(3, 12) },
  { id: "s17", call: "JA1-KEN", body: "Denis Johnson, Train Dreams. Under a hundred pages, will wreck you gently.", ts: ago(3, 11.6), replyTo: "s16" },
  { id: "s18", call: "EA5-LUZ", body: "The fig tree has decided this is the year. I am not ready for this volume of figs.", ts: ago(4, 3) },
  { id: "s19", call: "VK3-ODA", body: "Patch of the day: noise into a slow filter sweep into a long reverb. Fell asleep to it. #synths", ts: ago(5, 7) },
  { id: "s20", call: "KX7-MARLOW", body: "Anyone in here shoot large format? Thinking about a 4x5 and I need talking out of it. #darkroom", ts: ago(6, 4) },
  { id: "s21", call: "W2-JUN", body: "Nobody has ever been talked out of a 4x5. Buy the 4x5.", ts: ago(6, 3.5), replyTo: "s20" },
  { id: "s22", call: "G4-ROSA", body: "Taper week. I have never been more well-rested or more annoyed. #running", ts: ago(7, 6) },
  { id: "s23", call: "N1-PIKE", body: "Rode through the first properly cold morning of the year. Everything hurt, would do again.", ts: ago(9, 8) },
  { id: "s24", call: "ZL2-BRY", body: "Reminder for new operators: your call sign is yours. Pick one you'll still like in a year. Over and out. #radio", ts: ago(11, 5) }
];
/* seeded signal counts (deterministic-ish) */
const SEED_SIGNAL = { s01: 14, s03: 6, s04: 3, s05: 22, s07: 11, s09: 8, s10: 19, s11: 27, s12: 9, s13: 15, s14: 12, s16: 5, s17: 21, s18: 7, s19: 6, s20: 4, s21: 18, s22: 10, s24: 33 };
const SEED_BOOST  = { s05: 4, s11: 9, s17: 6, s24: 12 };

/* ---------- storage ---------- */
const K = {
  me: "dispatch_me_v1", tx: "dispatch_tx_v1", sig: "dispatch_signal_v1",
  boost: "dispatch_boost_v1", follow: "dispatch_follow_v1", saved: "dispatch_saved_v1",
  drafts: "dispatch_drafts_v1", seen: "dispatch_seen_v1", notif: "dispatch_notifseen_v1"
};
const rd = (k, f) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? f : v; } catch (e) { return f; } };
const wr = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

let ME = rd(K.me, null);              // { call, name, bio, joined }
let MYTX = rd(K.tx, []);              // user transmissions [{id, call, body, ts, replyTo, image, freq, edited}]
let SIG = new Set(rd(K.sig, []));     // tx ids I've added signal to
let BOOST = new Set(rd(K.boost, [])); // tx ids I've relayed
let FOLLOW = new Set(rd(K.follow, ["ZL2-BRY"])); // call signs I follow
let SAVED = rd(K.saved, []);          // tx ids logged (ordered)
let DRAFTS = rd(K.drafts, []);        // [{id, body, topic, image, ts}]
let SEEN = new Set(rd(K.seen, []));   // tx ids seen (for Scan the Band)

const saveMe     = () => wr(K.me, ME);
const saveMyTx   = () => { wr(K.tx, MYTX); bustTx(); };
const saveSig    = () => wr(K.sig, [...SIG]);
const saveBoost  = () => wr(K.boost, [...BOOST]);
const saveFollow = () => wr(K.follow, [...FOLLOW]);
const saveSaved  = () => wr(K.saved, SAVED);
const saveDrafts = () => wr(K.drafts, DRAFTS);
const saveSeen   = () => wr(K.seen, [...SEEN].slice(-400));

/* ---------- unified transmission list ---------- */
let _txCache = null, _txCacheKey = "";
function allTx() {
  const key = MYTX.length + ":" + (MYTX[MYTX.length - 1] || {}).id;
  if (_txCache && _txCacheKey === key) return _txCache;
  const raw = SEED_TX.map((t) => ({ ...t, seed: true })).concat(MYTX.map((t) => ({ ...t })));
  const byId = {}; raw.forEach((t) => (byId[t.id] = t));
  // pass 1: freq for roots
  raw.forEach((t) => { if (!t.replyTo && !t.freq) t.freq = freqForText(t.body).freq; });
  // pass 2: replies inherit the thread root's freq
  raw.forEach((t) => {
    if (!t.replyTo) return;
    let cur = t, guard = 0;
    while (cur && cur.replyTo && guard++ < 60) cur = byId[cur.replyTo];
    t.freq = (cur && cur.freq) || freqForText(t.body).freq;
  });
  _txCache = raw; _txCacheKey = key;
  return raw;
}
function bustTx() { _txCache = null; }
function tx(id) { return allTx().find((t) => t.id === id) || null; }
function rootsOf() { return allTx().filter((t) => !t.replyTo); }
function repliesTo(id) { return allTx().filter((t) => t.replyTo === id).sort((a, b) => a.ts - b.ts); }
function replyCount(id) {
  let n = 0; const walk = (pid) => repliesTo(pid).forEach((r) => { n++; walk(r.id); });
  walk(id); return n;
}
function threadRoot(t) { let cur = t; let guard = 0; while (cur && cur.replyTo && guard++ < 50) cur = tx(cur.replyTo); return cur || t; }

function signalOf(id) { return (SEED_SIGNAL[id] || 0) + (SIG.has(id) ? 1 : 0); }
function boostOf(id) { return (SEED_BOOST[id] || 0) + (BOOST.has(id) ? 1 : 0); }
function isFaded(t) { return now() - t.ts > 7 * DAY; }
function strength(id) { return clamp(Math.round(Math.log2(signalOf(id) + 1)), 0, 5); }

/* ---------- actions ---------- */
function addSignal(id) {
  if (SIG.has(id)) SIG.delete(id); else SIG.add(id);
  saveSig(); toast(SIG.has(id) ? "signal added" : "signal dropped"); repaint();
}
function relay(id) {
  if (BOOST.has(id)) BOOST.delete(id); else BOOST.add(id);
  saveBoost(); toast(BOOST.has(id) ? "relayed to your followers" : "relay pulled"); repaint();
}
function toggleSave(id) {
  const i = SAVED.indexOf(id);
  if (i === -1) SAVED.unshift(id); else SAVED.splice(i, 1);
  saveSaved(); toast(i === -1 ? "logged" : "removed from logbook"); repaint();
}
function toggleFollow(call) {
  if (FOLLOW.has(call)) FOLLOW.delete(call); else FOLLOW.add(call);
  saveFollow(); repaint();
}
function postTx({ body, topic, image, replyTo }) {
  if (!ME) { signOn(); return null; }
  let freq;
  if (replyTo) { const rt = threadRoot(tx(replyTo)); freq = (rt && rt.freq) || freqForText(body).freq; }
  else freq = ((topic && topic !== "general") ? bandByTopic(topic) : freqForText(body)).freq;
  const t = { id: "u" + now().toString(36) + Math.floor(Math.random() * 1e4).toString(36),
    call: ME.call, body: body.trim(), ts: now(), freq: freq };
  if (image) t.image = image;
  if (replyTo) t.replyTo = replyTo;
  MYTX.push(t); saveMyTx();
  toast(replyTo ? "copy sent" : "transmission out");
  return t;
}
function editTx(id, body) {
  const t = MYTX.find((x) => x.id === id); if (!t) return;
  t.body = body.trim(); t.edited = true; saveMyTx(); toast("re-keyed"); repaint();
}
function deleteTx(id) {
  MYTX = MYTX.filter((x) => x.id !== id && x.replyTo !== id);
  saveMyTx(); toast("transmission pulled"); repaint();
}
const canEdit = (t) => !t.seed && t.call === (ME || {}).call && now() - t.ts < 5 * 60000;
const isMine = (t) => !t.seed && ME && t.call === ME.call;

/* ---------- notifications (computed) ---------- */
function myNotifs() {
  if (!ME) return [];
  const mineIds = new Set(MYTX.filter((t) => !t.replyTo || true).map((t) => t.id));
  const out = [];
  MYTX.concat(SEED_TX.map((t) => ({ ...t, seed: true }))).forEach(() => {});
  // replies to my transmissions
  allTx().forEach((t) => {
    if (t.replyTo && mineIds.has(t.replyTo) && t.call !== ME.call) {
      out.push({ kind: "copy", call: t.call, txId: t.id, target: t.replyTo, ts: t.ts, text: t.body });
    }
    // mentions of me
    if (t.call !== ME.call && new RegExp("@" + ME.call.replace(/[-]/g, "\\-"), "i").test(t.body)) {
      out.push({ kind: "mention", call: t.call, txId: t.id, ts: t.ts, text: t.body });
    }
  });
  return out.sort((a, b) => b.ts - a.ts).slice(0, 40);
}
function unreadCount() {
  const last = rd(K.notif, 0);
  return myNotifs().filter((n) => n.ts > last).length;
}
function markNotifsRead() { wr(K.notif, now()); paintBell(); }

/* ---------- toast ---------- */
function toast(msg) {
  let host = $("#toast-host");
  if (!host) { host = document.createElement("div"); host.id = "toast-host"; host.className = "toast-host"; document.body.appendChild(host); }
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = msg;
  host.appendChild(el);
  requestAnimationFrame(() => el.classList.add("in"));
  setTimeout(() => { el.classList.remove("in"); setTimeout(() => el.remove(), 260); }, 2400);
}

/* ---------- icons ---------- */
const I = {
  signal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 20V13M9 20V9M14 20V5M19 20v-9"/></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4L3 21l1.1-3.5A8.4 8.4 0 1 1 21 11.5Z"/></svg>',
  relay: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 2 21 6 17 10"/><path d="M3 12V9a3 3 0 0 1 3-3h15"/><polyline points="7 22 3 18 7 14"/><path d="M21 12v3a3 3 0 0 1-3 3H3"/></svg>',
  log: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z"/></svg>',
  share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg>',
  scan: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="3" y1="12" x2="21" y2="12"/></svg>',
  pencil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
  band: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="6" x2="4" y2="18"/><line x1="9" y1="4" x2="9" y2="20"/><line x1="14" y1="8" x2="14" y2="16"/><line x1="19" y1="5" x2="19" y2="19"/></svg>',
  dial: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><line x1="12" y1="12" x2="16" y2="8"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 21 6"/><path d="M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>'
};

/* ---------- avatar (generated call-sign badge) ---------- */
function avatar(call, size) {
  size = size || 44;
  const h = hashStr(call);
  const hue = h % 360;
  const initials = (opByCall(call) || {}).name ? (opByCall(call).name[0] + (call.split("-")[1] || call)[1]) : call.slice(0, 2);
  const bg = "hsl(" + hue + " 42% 24%)";
  const fg = "hsl(" + hue + " 70% 68%)";
  return '<span class="avatar" style="width:' + size + 'px;height:' + size + 'px;background:' + bg + ';color:' + fg + ';font-size:' + (size * 0.4) + 'px">' +
    esc(initials.toUpperCase()) +
    '<span class="avatar-ring" style="border-color:' + fg + '"></span></span>';
}

/* ---------- body linkify ---------- */
function linkify(body) {
  let s = esc(body);
  s = s.replace(/#([a-z0-9]+)/gi, (m, tag) => {
    const b = BANDS.find((x) => x.topic === tag.toLowerCase());
    return b ? '<a class="tag" href="dial.html#f=' + b.freq + '">#' + esc(tag) + '</a>' : m;
  });
  s = s.replace(/@([A-Z0-9]+-[A-Z0-9]+)/g, (m, call) =>
    opByCall(call) ? '<a class="mention" href="station.html#' + call + '">@' + call + '</a>' : m);
  s = s.replace(/\b(over and out|over|copy|roger|k)\.?$/i, (m) => '<span class="signoff">' + m + '</span>');
  return s.replace(/\n/g, "<br>");
}

/* ============================================================
   CHROME
   ============================================================ */
const NAV = [
  { href: "index.html", label: "The Band", key: "band", icon: I.band },
  { href: "dial.html", label: "The Dial", key: "dial", icon: I.dial },
  { href: "logbook.html", label: "Logbook", key: "logbook", icon: I.log }
];
let onAir = 0;

function renderChrome() {
  const header = document.createElement("header");
  header.className = "topbar";
  header.innerHTML =
    '<div class="topbar-in">' +
      '<a class="brand" href="index.html" aria-label="Dispatch - home">' + logoSVG(26) + '<span class="brand-name">DISPATCH</span></a>' +
      '<button class="nav-toggle" id="nav-toggle" aria-label="Menu" aria-expanded="false">' + I.menu + '</button>' +
      '<nav class="topnav" id="topnav" aria-label="Main">' +
        NAV.map((n) => '<a href="' + n.href + '"' + (n.key === PAGE ? ' aria-current="page"' : "") + '>' + n.icon + '<span>' + n.label + '</span></a>').join("") +
        '<a href="#" class="topnav-notif" id="notif-open" aria-label="Responses">' + I.bell + '<span class="notif-dot" data-notif hidden></span></a>' +
        (ME
          ? '<a class="topnav-me" href="station.html#' + ME.call + '">' + avatar(ME.call, 26) + '<span>' + esc(ME.call) + '</span></a>'
          : '<button class="btn btn-amber btn-sm" id="signon-btn">SIGN ON</button>') +
      '</nav>' +
    '</div>' +
    '<div class="band-strip" aria-hidden="true"><span class="on-air" id="on-air"></span></div>';
  document.body.insertBefore(header, document.body.firstChild);

  const footer = document.createElement("footer");
  footer.className = "site-footer";
  footer.innerHTML =
    '<div class="foot-in">' +
      '<span class="foot-mark">DISPATCH</span>' +
      '<span>A MINI SOCIAL ON THE AIRWAVES</span>' +
      '<span>Front-end demo / nothing is transmitted, everything is local to this browser</span>' +
    '</div>';
  document.body.appendChild(footer);

  // compose FAB
  if (PAGE !== "compose") {
    const fab = document.createElement("button");
    fab.className = "compose-fab"; fab.id = "compose-fab"; fab.setAttribute("aria-label", "New transmission");
    fab.innerHTML = I.pencil + "<span>Transmit</span>";
    fab.addEventListener("click", () => openComposer({}));
    document.body.appendChild(fab);
  }

  // on-air ticker (setInterval - survives frozen preview)
  onAir = 40 + (hashStr(new Date().toDateString()) % 60) + (ME ? 1 : 0);
  paintOnAir();
  if (!reduced) setInterval(() => { onAir = clamp(onAir + (Math.random() < 0.5 ? -1 : 1), 22, 140); paintOnAir(); }, 5200);

  const nav = $("#topnav"), tog = $("#nav-toggle");
  const setNav = (o) => { nav.classList.toggle("open", o); tog.setAttribute("aria-expanded", o); tog.classList.toggle("x", o); };
  tog.addEventListener("click", (e) => { e.stopPropagation(); setNav(!nav.classList.contains("open")); });
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) setNav(false); });
  document.addEventListener("click", (e) => { if (nav.classList.contains("open") && !nav.contains(e.target) && !tog.contains(e.target)) setNav(false); });

  const so = $("#signon-btn"); if (so) so.addEventListener("click", signOn);
  $("#notif-open").addEventListener("click", (e) => { e.preventDefault(); openNotifs(); });
  paintBell();
}
function paintOnAir() { const el = $("#on-air"); if (el) el.textContent = onAir + " OPERATORS ON AIR"; }
function paintBell() { $$("[data-notif]").forEach((d) => { const n = unreadCount(); d.hidden = n === 0; d.textContent = n > 9 ? "9+" : n || ""; }); }

/* signal-ring logo */
function logoSVG(size) {
  size = size || 26;
  return '<svg class="logo" width="' + size + '" height="' + size + '" viewBox="0 0 32 32" fill="none" aria-hidden="true">' +
    '<circle cx="16" cy="16" r="13" stroke="currentColor" stroke-width="2" opacity="0.32"/>' +
    '<circle cx="16" cy="16" r="8" stroke="currentColor" stroke-width="2.4" opacity="0.7"/>' +
    '<circle cx="16" cy="16" r="3.4" fill="var(--amber)"/>' +
  '</svg>';
}

let _repaint = null;
function repaint() { paintBell(); if (_repaint) _repaint(); }

/* ============================================================
   THEMED SELECT
   ============================================================ */
function enhanceSelect(sel) {
  if (!sel || sel.dataset.dp) return;
  sel.dataset.dp = "1";
  const wrap = document.createElement("div"); wrap.className = "dp-sel";
  sel.parentNode.insertBefore(wrap, sel); wrap.appendChild(sel);
  sel.classList.add("dp-sel-native"); sel.tabIndex = -1;
  const trig = document.createElement("button");
  trig.type = "button"; trig.className = "dp-sel-trigger";
  trig.setAttribute("aria-haspopup", "listbox"); trig.setAttribute("aria-expanded", "false");
  const panel = document.createElement("div"); panel.className = "dp-sel-panel"; panel.setAttribute("role", "listbox"); panel.hidden = true;
  wrap.appendChild(trig); wrap.appendChild(panel);
  const CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';
  function sync() { const o = sel.options[sel.selectedIndex]; trig.innerHTML = "<span>" + esc(o ? o.textContent : "") + '</span><span class="dp-caret">' + CHEV + "</span>"; }
  function build() {
    panel.innerHTML = "";
    Array.from(sel.options).forEach((o) => {
      const d = document.createElement("div");
      d.className = "dp-sel-opt"; d.setAttribute("role", "option"); d.textContent = o.textContent;
      if (o.value === sel.value) d.setAttribute("aria-selected", "true");
      d.addEventListener("click", () => { sel.value = o.value; sel.dispatchEvent(new Event("change", { bubbles: true })); close(); });
      panel.appendChild(d);
    });
  }
  const open = () => { build(); panel.hidden = false; trig.setAttribute("aria-expanded", "true"); };
  const close = () => { panel.hidden = true; trig.setAttribute("aria-expanded", "false"); };
  trig.addEventListener("click", () => (panel.hidden ? open() : close()));
  document.addEventListener("click", (e) => { if (!wrap.contains(e.target)) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  sel.addEventListener("change", sync);
  new MutationObserver(sync).observe(sel, { childList: true });
  sync();
}

/* ============================================================
   COMPOSER
   ============================================================ */
const LIMIT = 300;
function composerHTML(opts) {
  const d = opts.draft || {};
  return '<form class="composer" id="composer">' +
    (opts.replyTo ? '<p class="composer-ctx">copying <b>' + esc(tx(opts.replyTo).call) + '</b> on <b>' + esc(tx(opts.replyTo).freq) + ' MHz</b></p>' : "") +
    '<div class="composer-row">' + avatar((ME || {}).call || "NEW-OP", 40) +
      '<textarea class="composer-input" id="c-body" rows="3" maxlength="' + (LIMIT + 40) + '" placeholder="' + (opts.replyTo ? "key up your copy..." : "key up a transmission...") + '">' + esc(d.body || "") + '</textarea>' +
    '</div>' +
    '<div class="composer-foot">' +
      (opts.replyTo ? '' :
        '<label class="c-freq"><span>freq</span><select id="c-topic">' +
        BANDS.map((b) => '<option value="' + b.topic + '"' + (b.topic === (d.topic || "general") ? " selected" : "") + '>' + b.freq + ' MHz / ' + b.label + '</option>').join("") +
        '</select></label>') +
      '<button type="button" class="c-img-btn" id="c-img-btn" title="Attach a picture URL">+ PIC</button>' +
      '<span class="power-meter" id="c-meter" aria-hidden="true"><i></i></span>' +
      '<span class="power-count" id="c-count">' + LIMIT + '</span>' +
      (opts.replyTo ? '' : '<button type="button" class="btn btn-line btn-sm" id="c-hold">HOLD</button>') +
      '<button type="submit" class="btn btn-amber btn-sm" id="c-send">' + (opts.replyTo ? "SEND COPY" : "TRANSMIT") + '</button>' +
    '</div>' +
    '<input type="url" class="c-img-field" id="c-img" placeholder="https://... picture url" value="' + esc(d.image || "") + '" hidden>' +
  '</form>';
}
function bindComposer(root, opts, onDone) {
  opts = opts || {};
  const form = $("#composer", root);
  if (!form) return;
  const body = $("#c-body", form), count = $("#c-count", form), meter = $("#c-meter i", form);
  const topicSel = $("#c-topic", form);
  if (topicSel) enhanceSelect(topicSel);
  const imgField = $("#c-img", form), imgBtn = $("#c-img-btn", form);
  imgBtn && imgBtn.addEventListener("click", () => { imgField.hidden = !imgField.hidden; if (!imgField.hidden) imgField.focus(); });
  function gauge() {
    const n = body.value.trim().length;
    const left = LIMIT - n;
    count.textContent = left;
    count.classList.toggle("over", left < 0);
    count.classList.toggle("warn", left >= 0 && left < 40);
    const pct = clamp(n / LIMIT, 0, 1.15);
    meter.style.width = Math.min(100, pct * 100) + "%";
    meter.parentElement.classList.toggle("hot", pct > 1);
  }
  body.addEventListener("input", gauge); gauge();
  autoGrow(body);
  const hold = $("#c-hold", form);
  hold && hold.addEventListener("click", () => {
    const v = body.value.trim(); if (!v) { toast("nothing to hold"); return; }
    DRAFTS.unshift({ id: "d" + now().toString(36), body: v, topic: topicSel ? topicSel.value : "general", image: imgField.value.trim(), ts: now() });
    saveDrafts(); body.value = ""; gauge(); toast("held in drafts");
    if (opts.draftId) { DRAFTS = DRAFTS.filter((x) => x.id !== opts.draftId); saveDrafts(); }
    if (onDone) onDone(null);
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = body.value.trim();
    if (!ME) { signOn(); return; }
    if (v.length < 1) { toast("key up something first"); return; }
    if (v.length > LIMIT) { toast("overmodulated - trim it down"); return; }
    const t = postTx({ body: v, topic: topicSel ? topicSel.value : undefined, image: imgField.value.trim(), replyTo: opts.replyTo });
    if (opts.draftId) { DRAFTS = DRAFTS.filter((x) => x.id !== opts.draftId); saveDrafts(); }
    body.value = ""; gauge();
    if (onDone) onDone(t);
  });
}
function autoGrow(ta) {
  const fit = () => { ta.style.height = "auto"; ta.style.height = Math.min(320, ta.scrollHeight) + "px"; };
  ta.addEventListener("input", fit); setTimeout(fit, 0);
}
function openComposer(opts) {
  const ov = document.createElement("div");
  ov.className = "modal-overlay";
  ov.innerHTML = '<div class="modal modal-compose" role="dialog" aria-modal="true" aria-label="New transmission">' +
    '<button class="modal-x" aria-label="Close">' + I.x + "</button>" + composerHTML(opts) + "</div>";
  document.body.appendChild(ov);
  document.body.style.overflow = "hidden";
  const close = () => { ov.remove(); document.body.style.overflow = ""; };
  ov.addEventListener("click", (e) => { if (e.target === ov || e.target.closest(".modal-x")) close(); });
  document.addEventListener("keydown", function k(e) { if (e.key === "Escape") { close(); document.removeEventListener("keydown", k); } });
  bindComposer(ov, opts, (t) => { close(); if (t) location.href = "transmission.html#" + threadRoot(t).id; else repaint(); });
  setTimeout(() => $("#c-body", ov).focus(), 30);
}

/* ============================================================
   CARDS
   ============================================================ */
function signalMeterHTML(id) {
  const s = strength(id);
  return '<span class="sig-meter" title="' + signalOf(id) + ' signal">' +
    [1, 2, 3, 4, 5].map((i) => '<i class="' + (i <= s ? "on" : "") + '"></i>').join("") + "</span>";
}
function txCard(t, opts) {
  opts = opts || {};
  const op = opByCall(t.call) || { name: t.call.split("-")[1] || t.call };
  const rc = replyCount(t.id), sg = signalOf(t.id), bs = boostOf(t.id);
  const band = bandByFreq(t.freq);
  const faded = isFaded(t) && !opts.full;
  SEEN.add(t.id);
  return '<article class="tx' + (faded ? " faded" : "") + (opts.full ? " tx-full" : "") + (isMine(t) ? " mine" : "") + '" data-id="' + t.id + '">' +
    (faded ? '<span class="static-veil" aria-hidden="true"></span>' : "") +
    '<a class="tx-av" href="station.html#' + t.call + '">' + avatar(t.call, opts.full ? 48 : 42) + "</a>" +
    '<div class="tx-main">' +
      '<div class="tx-head">' +
        '<a class="tx-call" href="station.html#' + t.call + '">' + esc(t.call) + "</a>" +
        '<span class="tx-name">' + esc(op.name) + "</span>" +
        '<span class="tx-sep">/</span>' +
        '<a class="tx-freq" href="dial.html#f=' + t.freq + '">' + t.freq + ' MHz' + (band ? " " + band.label : "") + "</a>" +
        '<span class="tx-dot">&middot;</span><time class="tx-time">' + relTime(t.ts) + "</time>" +
        (t.edited ? '<span class="tx-edit">re-keyed</span>' : "") +
        (isMine(t) ? '<span class="tx-menu"><button class="tx-menu-b" aria-label="Options">&middot;&middot;&middot;</button><span class="tx-menu-pop">' +
          (canEdit(t) ? '<button data-edit="' + t.id + '">Re-key</button>' : "") +
          '<button data-del="' + t.id + '" class="danger">' + I.trash + ' Pull</button></span></span>' : "") +
      "</div>" +
      (t.replyTo && !opts.full && !opts.noCtx ? '<p class="tx-rectx">copy to <a href="transmission.html#' + t.replyTo + '">' + esc((tx(t.replyTo) || {}).call || "?") + "</a></p>" : "") +
      '<div class="tx-body">' + linkify(t.body) + "</div>" +
      (t.image ? '<a class="tx-img" href="' + esc(t.image) + '" target="_blank" rel="noopener"><img src="' + esc(t.image) + '" alt="" loading="lazy" onerror="this.closest(\'.tx-img\').remove()"></a>' : "") +
      (opts.full ? '<p class="tx-stamp">' + stamp(t.ts) + "</p>" : "") +
      '<div class="tx-actions">' +
        '<button class="act act-copy" data-copy="' + t.id + '" title="Copy (reply)">' + I.copy + '<span>' + (rc || "") + "</span></button>" +
        '<button class="act act-relay' + (BOOST.has(t.id) ? " on" : "") + '" data-relay="' + t.id + '" title="Relay">' + I.relay + '<span>' + (bs || "") + "</span></button>" +
        '<button class="act act-sig' + (SIG.has(t.id) ? " on" : "") + '" data-sig="' + t.id + '" title="Add signal">' + I.signal + '<span>' + (sg || "") + "</span></button>" +
        '<button class="act act-log' + (SAVED.indexOf(t.id) !== -1 ? " on" : "") + '" data-log="' + t.id + '" title="Log it">' + I.log + "</button>" +
        '<button class="act act-share" data-share="' + t.id + '" title="Copy link">' + I.share + "</button>" +
        signalMeterHTML(t.id) +
      "</div>" +
    "</div>" +
  "</article>";
}
function bindTx(root, opts) {
  opts = opts || {};
  $$(".tx", root).forEach((el) => {
    const id = el.dataset.id;
    if (!opts.full) {
      el.addEventListener("click", (e) => {
        if (e.target.closest("a,button,.tx-menu")) return;
        location.href = "transmission.html#" + id;
      });
    }
  });
  $$("[data-copy]", root).forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); openComposer({ replyTo: b.dataset.copy }); }));
  $$("[data-relay]", root).forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); relay(b.dataset.relay); }));
  $$("[data-sig]", root).forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); addSignal(b.dataset.sig); }));
  $$("[data-log]", root).forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); toggleSave(b.dataset.log); }));
  $$("[data-share]", root).forEach((b) => b.addEventListener("click", (e) => {
    e.stopPropagation();
    const url = location.origin + location.pathname.replace(/[^/]*$/, "") + "transmission.html#" + b.dataset.share;
    try { navigator.clipboard.writeText(url); toast("link copied"); } catch (x) { toast(url); }
  }));
  $$(".tx-menu-b", root).forEach((b) => b.addEventListener("click", (e) => {
    e.stopPropagation();
    const pop = b.nextElementSibling;
    $$(".tx-menu-pop.show", root).forEach((p) => { if (p !== pop) p.classList.remove("show"); });
    pop.classList.toggle("show");
  }));
  document.addEventListener("click", () => $$(".tx-menu-pop.show", root).forEach((p) => p.classList.remove("show")), { once: true });
  $$("[data-del]", root).forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); if (confirm("Pull this transmission?")) deleteTx(b.dataset.del); }));
  $$("[data-edit]", root).forEach((b) => b.addEventListener("click", (e) => {
    e.stopPropagation();
    const t = tx(b.dataset.edit);
    const nv = prompt("Re-key transmission:", t.body);
    if (nv != null && nv.trim()) editTx(t.id, nv);
  }));
}

/* ============================================================
   SIGN ON
   ============================================================ */
const PREFIXES = ["KX7", "W2", "G4", "VK3", "N1", "EA5", "JA1", "ZL2", "K6", "M0", "DL8", "OH2"];
function suggestCall(name) {
  const p = PREFIXES[hashStr(name + now()) % PREFIXES.length];
  const tail = (name.replace(/[^a-z]/gi, "").toUpperCase().slice(0, 7)) || "OPERATOR";
  return p + "-" + tail;
}
function signOn() {
  const ov = document.createElement("div");
  ov.className = "modal-overlay";
  ov.innerHTML = '<div class="modal modal-signon" role="dialog" aria-modal="true" aria-label="Sign on">' +
    '<button class="modal-x" aria-label="Close">' + I.x + "</button>" +
    logoSVG(40) +
    "<h2>Sign on</h2>" +
    '<p class="signon-sub">Pick a name and a call sign. Your call sign is how the band knows you - choose one you will still like in a year.</p>' +
    '<label class="field"><span>Name</span><input id="so-name" type="text" maxlength="24" placeholder="what people call you"></label>' +
    '<label class="field"><span>Call sign</span><input id="so-call" type="text" maxlength="16" placeholder="KX7-YOU" style="text-transform:uppercase"></label>' +
    '<button type="button" class="link-btn" id="so-suggest">suggest one</button>' +
    '<label class="field"><span>Rig / bio <em>(optional)</em></span><input id="so-bio" type="text" maxlength="90" placeholder="one line about your setup"></label>' +
    '<p class="signon-err" id="so-err"></p>' +
    '<button type="button" class="btn btn-amber btn-block" id="so-go">GO ON AIR</button>' +
  "</div>";
  document.body.appendChild(ov);
  document.body.style.overflow = "hidden";
  const close = () => { ov.remove(); document.body.style.overflow = ""; };
  ov.addEventListener("click", (e) => { if (e.target === ov || e.target.closest(".modal-x")) close(); });
  const nameI = $("#so-name", ov), callI = $("#so-call", ov), bioI = $("#so-bio", ov), err = $("#so-err", ov);
  $("#so-suggest", ov).addEventListener("click", () => { callI.value = suggestCall(nameI.value.trim() || "operator"); });
  nameI.addEventListener("input", () => { if (!callI.value) callI.placeholder = suggestCall(nameI.value.trim() || "you"); });
  $("#so-go", ov).addEventListener("click", () => {
    const name = nameI.value.trim();
    let call = callI.value.trim().toUpperCase() || callI.placeholder;
    if (name.length < 2) { err.textContent = "Add a name."; return; }
    if (!/^[A-Z0-9]{1,4}-[A-Z0-9]{1,10}$/.test(call)) { err.textContent = "Call sign looks like PREFIX-NAME, e.g. KX7-JAMIE."; return; }
    if (OPERATORS.some((o) => o.call === call)) { err.textContent = "That call sign is taken on the band."; return; }
    ME = { call: call, name: name, bio: bioI.value.trim(), joined: new Date().toISOString().slice(0, 10), where: "" };
    saveMe();
    close();
    toast("you're on air, " + call);
    location.reload();
  });
  setTimeout(() => nameI.focus(), 30);
}

/* ============================================================
   NOTIFICATIONS PANEL
   ============================================================ */
function openNotifs() {
  const list = myNotifs();
  const ov = document.createElement("div");
  ov.className = "modal-overlay modal-overlay-top";
  ov.innerHTML = '<div class="modal modal-notif" role="dialog" aria-modal="true" aria-label="Responses">' +
    '<div class="notif-head"><h2>Responses</h2><button class="modal-x" aria-label="Close">' + I.x + "</button></div>" +
    (!ME ? '<p class="notif-empty">Sign on to get responses.</p>' :
      !list.length ? '<p class="notif-empty">Quiet on your frequency. Transmit something.</p>' :
      '<div class="notif-list">' + list.map((n) => {
        const op = opByCall(n.call) || { name: n.call };
        return '<a class="notif-item" href="transmission.html#' + n.txId + '">' + avatar(n.call, 32) +
          '<div><p><b>' + esc(n.call) + "</b> " + (n.kind === "copy" ? "copied you" : "mentioned you") + ' <span class="notif-time">' + relTime(n.ts) + "</span></p>" +
          '<p class="notif-text">' + esc(n.text.slice(0, 90)) + "</p></div></a>";
      }).join("") + "</div>") +
  "</div>";
  document.body.appendChild(ov);
  document.body.style.overflow = "hidden";
  const close = () => { ov.remove(); document.body.style.overflow = ""; markNotifsRead(); };
  ov.addEventListener("click", (e) => { if (e.target === ov || e.target.closest(".modal-x")) close(); });
  document.addEventListener("keydown", function k(e) { if (e.key === "Escape") { close(); document.removeEventListener("keydown", k); } });
}

/* ============================================================
   BAND CONDITIONS + SCAN
   ============================================================ */
function bandConditions() {
  const h = hashStr(new Date().toDateString());
  const grades = ["POOR", "FAIR", "FAIR", "GOOD", "GOOD", "EXCELLENT"];
  const g = grades[h % grades.length];
  const notes = { POOR: "heavy static, keep it short", FAIR: "workable, some fading", GOOD: "clear across the band", EXCELLENT: "band's wide open" };
  return { grade: g, note: notes[g] };
}
function scanBand() {
  const pool = rootsOf().filter((t) => !SEEN.has(t.id));
  const pick = (pool.length ? pool : rootsOf())[Math.floor(Math.random() * (pool.length || rootsOf().length))];
  if (pick) location.href = "transmission.html#" + pick.id;
}

/* ============================================================
   PAGES
   ============================================================ */
const pages = {};

/* ---- BAND (feed) ---- */
pages.band = function () {
  const main = $("#main");
  let feed = location.hash === "#following" ? "following" : "all";
  const bc = bandConditions();
  main.innerHTML =
    '<div class="feed-head">' +
      '<h1>The Band</h1>' +
      '<div class="band-cond bc-' + bc.grade.toLowerCase() + '"><span>BAND CONDITIONS</span><b>' + bc.grade + '</b><em>' + bc.note + '</em></div>' +
    '</div>' +
    '<div class="feed-compose" id="feed-compose">' + composerHTML({}) + '</div>' +
    '<div class="feed-tabs">' +
      '<button class="ftab' + (feed === "all" ? " on" : "") + '" data-feed="all">All transmissions</button>' +
      '<button class="ftab' + (feed === "following" ? " on" : "") + '" data-feed="following">Following</button>' +
      '<button class="ftab scan" id="scan-btn">' + I.scan + ' Scan the band</button>' +
    '</div>' +
    '<div id="feed" class="feed"></div>';

  bindComposer($("#feed-compose"), {}, (t) => { if (t) draw(); });
  function list() {
    let arr = rootsOf().slice();
    if (feed === "following") arr = arr.filter((t) => FOLLOW.has(t.call) || (ME && t.call === ME.call));
    return arr.sort((a, b) => b.ts - a.ts);
  }
  function draw() {
    const arr = list();
    $("#feed").innerHTML = arr.length
      ? arr.map((t) => txCard(t)).join("")
      : '<p class="empty">Nobody you follow has transmitted yet. <a href="dial.html">Find some operators</a>.</p>';
    bindTx($("#feed"));
    paintBell();
  }
  draw();
  $$(".ftab[data-feed]").forEach((b) => b.addEventListener("click", () => {
    feed = b.dataset.feed;
    $$(".ftab").forEach((x) => x.classList.toggle("on", x === b));
    location.hash = feed === "following" ? "#following" : "";
    draw();
  }));
  $("#scan-btn").addEventListener("click", scanBand);
  _repaint = draw;
};

/* ---- TRANSMISSION (thread) ---- */
pages.tx = function () {
  const main = $("#main");
  function render() {
    const id = decodeURIComponent(location.hash.slice(1));
    const t = tx(id);
    if (!t) { main.innerHTML = '<div class="pad"><p class="empty">Signal lost. <a href="index.html">Back to the band</a>.</p></div>'; return; }
    // ancestors
    const chain = []; let cur = t;
    while (cur && cur.replyTo) { const p = tx(cur.replyTo); if (!p) break; chain.unshift(p); cur = p; }

    main.innerHTML =
      '<a class="back-link" href="' + (chain[0] ? "transmission.html#" + chain[0].id : "index.html") + '">' + I.back + ' ' + (chain.length ? "up the thread" : "the band") + '</a>' +
      (chain.length ? '<div class="thread-anc">' + chain.map((p) => txCard(p, { noCtx: true })).join("") + '</div>' : "") +
      '<div id="focus">' + txCard(t, { full: true }) + '</div>' +
      '<div class="reply-box" id="reply-box">' + composerHTML({ replyTo: t.id }) + '</div>' +
      '<h2 class="resp-h">' + replyCount(t.id) + ' response' + (replyCount(t.id) === 1 ? "" : "s") + ' on ' + t.freq + ' MHz</h2>' +
      '<div id="responses" class="responses"></div>';

    bindTx($("#focus"), { full: true });
    bindTx($(".thread-anc") || document.createElement("div"));
    bindComposer($("#reply-box"), { replyTo: t.id }, (nt) => { if (nt) render(); });

    function drawResp() {
      const build = (pid, depth) => repliesTo(pid).map((r) =>
        '<div class="resp" style="--d:' + Math.min(depth, 4) + '">' + txCard(r) + "</div>" + build(r.id, depth + 1)
      ).join("");
      const html = build(t.id, 0);
      $("#responses").innerHTML = html || '<p class="empty">No responses yet. Be the first to copy.</p>';
      bindTx($("#responses"));
    }
    drawResp();
    _repaint = drawResp;
  }
  render();
  window.addEventListener("hashchange", () => location.reload());
};

/* ---- COMPOSE (page) ---- */
pages.compose = function () {
  const main = $("#main");
  const pre = new URLSearchParams(location.hash.replace(/^#/, "")).get("re");
  main.innerHTML =
    '<a class="back-link" href="index.html">' + I.back + ' the band</a>' +
    '<h1>New transmission</h1>' +
    '<div class="compose-page">' + composerHTML(pre ? { replyTo: pre } : {}) + '</div>' +
    (DRAFTS.length ? '<section class="drafts"><h2>Held transmissions</h2><div id="draft-list"></div></section>' : "");
  bindComposer($(".compose-page"), pre ? { replyTo: pre } : {}, (t) => { if (t) location.href = "transmission.html#" + threadRoot(t).id; });
  drawDrafts();
  function drawDrafts() {
    const host = $("#draft-list"); if (!host) return;
    host.innerHTML = DRAFTS.map((d) =>
      '<div class="draft-row"><div><p>' + esc(d.body) + '</p><span>' + bandByTopic(d.topic).freq + ' MHz &middot; held ' + relTime(d.ts) + '</span></div>' +
      '<div class="draft-act"><button class="btn btn-line btn-sm" data-load="' + d.id + '">Load</button><button class="icon-btn" data-drop="' + d.id + '">' + I.trash + '</button></div></div>').join("");
    $$("[data-load]", host).forEach((b) => b.addEventListener("click", () => {
      const d = DRAFTS.find((x) => x.id === b.dataset.load);
      $("#c-body").value = d.body; $("#c-body").dispatchEvent(new Event("input"));
      if ($("#c-topic")) { $("#c-topic").value = d.topic; $("#c-topic").dispatchEvent(new Event("change")); }
      if (d.image) { $("#c-img").hidden = false; $("#c-img").value = d.image; }
      DRAFTS = DRAFTS.filter((x) => x.id !== d.id); saveDrafts();
      window.scrollTo({ top: 0, behavior: "smooth" });
      pages.compose();
    }));
    $$("[data-drop]", host).forEach((b) => b.addEventListener("click", () => { DRAFTS = DRAFTS.filter((x) => x.id !== b.dataset.drop); saveDrafts(); pages.compose(); }));
  }
};

/* ---- STATION (profile) ---- */
pages.station = function () {
  const main = $("#main");
  function render() {
    const call = decodeURIComponent(location.hash.slice(1)) || (ME || {}).call;
    if (!call) { main.innerHTML = '<div class="pad"><p class="empty">No station selected. <a href="dial.html">Browse operators</a>.</p></div>'; return; }
    const op = opByCall(call) || (ME && ME.call === call ? ME : null);
    const mine = ME && ME.call === call;
    const theirTx = allTx().filter((t) => t.call === call);
    const roots = theirTx.filter((t) => !t.replyTo).sort((a, b) => b.ts - a.ts);
    const resp = theirTx.filter((t) => t.replyTo).sort((a, b) => b.ts - a.ts);
    const totalSig = theirTx.reduce((s, t) => s + signalOf(t.id), 0);
    const topFreq = (() => { const m = {}; theirTx.forEach((t) => { m[t.freq] = (m[t.freq] || 0) + 1; }); return Object.keys(m).sort((a, b) => m[b] - m[a])[0]; })();
    let tab = "tx";

    main.innerHTML =
      '<div class="station">' +
        '<div class="station-card">' +
          avatar(call, 76) +
          '<div class="station-id">' +
            '<h1>' + esc(call) + '</h1>' +
            '<p class="station-name">' + esc((op || {}).name || call.split("-")[1]) + (op && op.where ? ' &middot; ' + esc(op.where) : "") + '</p>' +
            '<p class="station-bio">' + esc((op || {}).bio || "No rig details on file.") + '</p>' +
            '<p class="station-meta">On air since ' + new Date(((op || {}).joined || "2026-01-01") + "T00:00").toLocaleDateString("en-GB", { month: "long", year: "numeric" }) + '</p>' +
          '</div>' +
          '<div class="station-act">' +
            (mine ? '<button class="btn btn-line btn-sm" id="edit-me">Edit station</button>'
                  : '<button class="btn ' + (FOLLOW.has(call) ? "btn-line" : "btn-amber") + ' btn-sm" id="follow-btn">' + (FOLLOW.has(call) ? "Following" : "Follow") + '</button>') +
            '<button class="btn btn-line btn-sm" id="qsl-btn">QSL card</button>' +
          '</div>' +
        '</div>' +
        '<div class="station-stats">' +
          '<div><b>' + roots.length + '</b><span>transmissions</span></div>' +
          '<div><b>' + resp.length + '</b><span>copies</span></div>' +
          '<div><b>' + totalSig + '</b><span>signal received</span></div>' +
          '<div><b>' + (topFreq || "-") + '</b><span>home freq</span></div>' +
        '</div>' +
        '<div class="feed-tabs">' +
          '<button class="ftab on" data-stab="tx">Transmissions</button>' +
          '<button class="ftab" data-stab="resp">Copies</button>' +
        '</div>' +
        '<div id="station-feed" class="feed"></div>' +
      '</div>';

    function drawFeed() {
      const arr = tab === "tx" ? roots : resp;
      $("#station-feed").innerHTML = arr.length ? arr.map((t) => txCard(t)).join("") : '<p class="empty">Nothing here yet.</p>';
      bindTx($("#station-feed"));
    }
    drawFeed();
    $$("[data-stab]").forEach((b) => b.addEventListener("click", () => { tab = b.dataset.stab; $$(".ftab").forEach((x) => x.classList.toggle("on", x === b)); drawFeed(); }));
    const fb = $("#follow-btn"); if (fb) fb.addEventListener("click", () => { toggleFollow(call); render(); });
    const qb = $("#qsl-btn"); if (qb) qb.addEventListener("click", () => openQSL(call, { roots: roots.length, resp: resp.length, sig: totalSig, topFreq }));
    const em = $("#edit-me"); if (em) em.addEventListener("click", editStation);
    _repaint = drawFeed;
  }
  render();
  window.addEventListener("hashchange", () => location.reload());
};
function editStation() {
  const ov = document.createElement("div"); ov.className = "modal-overlay";
  ov.innerHTML = '<div class="modal modal-signon" role="dialog" aria-modal="true"><button class="modal-x" aria-label="Close">' + I.x + '</button>' +
    '<h2>Edit station</h2>' +
    '<label class="field"><span>Name</span><input id="e-name" value="' + esc(ME.name) + '" maxlength="24"></label>' +
    '<label class="field"><span>Rig / bio</span><input id="e-bio" value="' + esc(ME.bio || "") + '" maxlength="90"></label>' +
    '<label class="field"><span>Where</span><input id="e-where" value="' + esc(ME.where || "") + '" maxlength="24"></label>' +
    '<button class="btn btn-amber btn-block" id="e-save">Save</button></div>';
  document.body.appendChild(ov); document.body.style.overflow = "hidden";
  const close = () => { ov.remove(); document.body.style.overflow = ""; };
  ov.addEventListener("click", (e) => { if (e.target === ov || e.target.closest(".modal-x")) close(); });
  $("#e-save", ov).addEventListener("click", () => {
    ME.name = $("#e-name", ov).value.trim() || ME.name;
    ME.bio = $("#e-bio", ov).value.trim();
    ME.where = $("#e-where", ov).value.trim();
    saveMe(); close(); location.reload();
  });
}
function openQSL(call, s) {
  const op = opByCall(call) || ME;
  const ov = document.createElement("div"); ov.className = "modal-overlay";
  ov.innerHTML = '<div class="modal modal-qsl" role="dialog" aria-modal="true" aria-label="QSL card">' +
    '<button class="modal-x" aria-label="Close">' + I.x + '</button>' +
    '<div class="qsl">' +
      '<div class="qsl-top"><span>QSL CARD</span>' + logoSVG(22) + '</div>' +
      '<div class="qsl-call">' + esc(call) + '</div>' +
      '<div class="qsl-name">' + esc((op || {}).name || "") + (op && op.where ? " / " + esc(op.where) : "") + '</div>' +
      '<div class="qsl-grid">' +
        '<div><span>SINCE</span><b>' + new Date(((op || {}).joined || "2026-01-01") + "T00:00").toLocaleDateString("en-GB", { month: "short", year: "numeric" }).toUpperCase() + '</b></div>' +
        '<div><span>TX</span><b>' + s.roots + '</b></div>' +
        '<div><span>COPIES</span><b>' + s.resp + '</b></div>' +
        '<div><span>SIGNAL</span><b>' + s.sig + '</b></div>' +
        '<div><span>HOME FREQ</span><b>' + (s.topFreq || "-") + ' MHz</b></div>' +
        '<div><span>CONFIRMED</span><b>73</b></div>' +
      '</div>' +
      '<div class="qsl-foot">DISPATCH BAND / ' + stamp(now()).split("  ")[0] + '</div>' +
    '</div>' +
  '</div>';
  document.body.appendChild(ov); document.body.style.overflow = "hidden";
  const close = () => { ov.remove(); document.body.style.overflow = ""; };
  ov.addEventListener("click", (e) => { if (e.target === ov || e.target.closest(".modal-x")) close(); });
}

/* ---- THE DIAL (discover) ---- */
pages.dial = function () {
  const main = $("#main");
  let q = "";
  const hf = new URLSearchParams(location.hash.replace(/^#/, "")).get("f");
  main.innerHTML =
    '<h1>The Dial</h1>' +
    '<p class="page-sub">Tune around. Every frequency is a channel - click one to hear only that traffic.</p>' +
    '<label class="dial-search">' + I.search + '<input id="dq" type="search" placeholder="search transmissions, operators, frequencies..." autocomplete="off"></label>' +
    '<div class="dial-grid">' +
      '<section class="dial-freqs"><h2>Frequencies</h2><div id="freq-list"></div></section>' +
      '<section class="dial-ops"><h2>Operators on the band</h2><div id="op-list"></div></section>' +
    '</section>' +
    '<div id="dial-results"></div>';

  function freqActivity() {
    const m = {};
    allTx().forEach((t) => { m[t.freq] = (m[t.freq] || 0) + 1 + signalOf(t.id) * 0.2; });
    return m;
  }
  function drawFreqs() {
    const act = freqActivity();
    $("#freq-list").innerHTML = BANDS.map((b) => {
      const n = allTx().filter((t) => t.freq === b.freq).length;
      const hot = (act[b.freq] || 0) > 12;
      return '<button class="freq-chip' + (hf === b.freq ? " on" : "") + '" data-f="' + b.freq + '">' +
        '<b>' + b.freq + ' MHz</b><span>' + b.label + '</span>' +
        '<em>' + n + ' tx' + (hot ? ' &middot; busy' : "") + '</em></button>';
    }).join("");
    $$("[data-f]", $("#freq-list")).forEach((c) => c.addEventListener("click", () => { location.hash = "f=" + c.dataset.f; location.reload(); }));
  }
  function drawOps() {
    const withMe = ME ? [ME].concat(OPERATORS) : OPERATORS;
    $("#op-list").innerHTML = withMe.map((o) => {
      const n = allTx().filter((t) => t.call === o.call).length;
      return '<a class="op-row" href="station.html#' + o.call + '">' + avatar(o.call, 38) +
        '<div><b>' + esc(o.call) + '</b><span>' + esc(o.name) + ' &middot; ' + n + ' tx</span></div>' +
        (o.call !== (ME || {}).call ? '<button class="btn ' + (FOLLOW.has(o.call) ? "btn-line" : "btn-amber") + ' btn-xs" data-fo="' + o.call + '">' + (FOLLOW.has(o.call) ? "Following" : "Follow") + '</button>' : '<span class="op-you">YOU</span>') +
        '</a>';
    }).join("");
    $$("[data-fo]", $("#op-list")).forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); toggleFollow(b.dataset.fo); drawOps(); }));
  }
  function drawResults() {
    const box = $("#dial-results");
    if (hf) {
      const band = bandByFreq(hf);
      const arr = rootsOf().filter((t) => t.freq === hf).sort((a, b) => b.ts - a.ts);
      box.innerHTML = '<div class="tuned-head"><h2>Tuned to ' + hf + ' MHz' + (band ? " / " + band.label : "") + '</h2>' +
        '<a href="dial.html" class="link-btn">clear</a></div>' +
        (arr.length ? arr.map((t) => txCard(t)).join("") : '<p class="empty">Nothing on this frequency yet.</p>');
      bindTx(box); return;
    }
    if (q.trim().length < 2) { box.innerHTML = ""; return; }
    const qq = q.trim().toLowerCase();
    const arr = allTx().filter((t) => (t.body + " " + t.call + " " + t.freq).toLowerCase().includes(qq)).sort((a, b) => b.ts - a.ts).slice(0, 40);
    box.innerHTML = '<h2 class="resp-h">' + arr.length + ' hit' + (arr.length === 1 ? "" : "s") + ' for "' + esc(q.trim()) + '"</h2>' +
      (arr.length ? arr.map((t) => txCard(t, { noCtx: true })).join("") : '<p class="empty">Nothing matched. Try a frequency or a call sign.</p>');
    bindTx(box);
  }
  drawFreqs(); drawOps(); drawResults();
  $("#dq").addEventListener("input", (e) => { q = e.target.value; if (!hf) drawResults(); });
  _repaint = () => { drawFreqs(); drawResults(); };
};

/* ---- LOGBOOK ---- */
pages.logbook = function () {
  const main = $("#main");
  let tab = "mine";
  main.innerHTML =
    '<h1>Logbook</h1>' +
    '<p class="page-sub">Your own traffic, the transmissions you have logged, and anything you are holding.</p>' +
    '<div class="feed-tabs">' +
      '<button class="ftab on" data-lt="mine">Your traffic</button>' +
      '<button class="ftab" data-lt="logged">Logged</button>' +
      '<button class="ftab" data-lt="drafts">Held (' + DRAFTS.length + ')</button>' +
    '</div>' +
    '<div id="lb-feed" class="feed"></div>';
  function draw() {
    const box = $("#lb-feed");
    if (tab === "mine") {
      if (!ME) { box.innerHTML = '<p class="empty"><button class="link-btn" id="lb-signon">Sign on</button> to start your log.</p>'; $("#lb-signon") && $("#lb-signon").addEventListener("click", signOn); return; }
      const arr = MYTX.slice().sort((a, b) => b.ts - a.ts);
      box.innerHTML = arr.length ? arr.map((t) => txCard(t, { noCtx: false })).join("") : '<p class="empty">You have not transmitted yet. <a href="compose.html">Key up.</a></p>';
      bindTx(box);
    } else if (tab === "logged") {
      const arr = SAVED.map(tx).filter(Boolean);
      box.innerHTML = arr.length ? arr.map((t) => txCard(t, { noCtx: true })).join("") : '<p class="empty">Nothing logged. Hit the flag on any transmission.</p>';
      bindTx(box);
    } else {
      box.innerHTML = DRAFTS.length ? DRAFTS.map((d) =>
        '<div class="draft-row"><div><p>' + esc(d.body) + '</p><span>' + bandByTopic(d.topic).freq + ' MHz &middot; held ' + relTime(d.ts) + '</span></div>' +
        '<div class="draft-act"><a class="btn btn-line btn-sm" href="compose.html">Open compose</a><button class="icon-btn" data-drop="' + d.id + '">' + I.trash + '</button></div></div>').join("")
        : '<p class="empty">No held transmissions.</p>';
      $$("[data-drop]", box).forEach((b) => b.addEventListener("click", () => { DRAFTS = DRAFTS.filter((x) => x.id !== b.dataset.drop); saveDrafts(); draw(); }));
    }
  }
  draw();
  $$("[data-lt]").forEach((b) => b.addEventListener("click", () => { tab = b.dataset.lt; $$(".ftab").forEach((x) => x.classList.toggle("on", x === b)); draw(); }));
  _repaint = draw;
};

/* ============================================================
   KEYBOARD
   ============================================================ */
function keys() {
  document.addEventListener("keydown", (e) => {
    const t = document.activeElement;
    if (/^(INPUT|TEXTAREA)$/.test(t.tagName) || t.isContentEditable) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "n") { e.preventDefault(); openComposer({}); }
    else if (e.key === ".") { e.preventDefault(); scanBand(); }
    else if (e.key === "/") { e.preventDefault(); location.href = "dial.html"; }
    else if (e.key === "g") { window._g = true; setTimeout(() => (window._g = false), 700); }
    else if (window._g && e.key === "b") location.href = "index.html";
    else if (window._g && e.key === "d") location.href = "dial.html";
    else if (window._g && e.key === "l") location.href = "logbook.html";
  });
}

/* ============================================================
   INIT
   ============================================================ */
function start() {
  renderChrome();
  keys();
  if (pages[PAGE]) pages[PAGE]();
  saveSeen();
  window.addEventListener("beforeunload", saveSeen);
  if (!ME && PAGE === "band" && !rd("dispatch_greeted", false)) {
    wr("dispatch_greeted", true);
    setTimeout(signOn, 700);
  }
}
start();

})();
