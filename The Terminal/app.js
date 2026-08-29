"use strict";
/* =================================================================
   THE TERMINAL - gadget spec browser  |  shared app.js (multipage)
   Vanilla JS. No frameworks, no network calls. <body data-page="...">
   ================================================================= */

(function () {

/* ---------- helpers ---------- */
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const PAGE = document.body.dataset.page;
const money = (n) => "$" + n.toFixed(2);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- exploded-view SVG line art ---------- */
function svg(inner) {
  return '<svg class="diagram-svg" viewBox="0 0 300 220" xmlns="http://www.w3.org/2000/svg" fill="none">' + inner + '</svg>';
}
const D = {
  headset: svg('<line x1="150" y1="18" x2="150" y2="202" class="s-line dash" stroke-width="1"/><path d="M90 58 Q150 22 210 58" class="s-cyan" stroke-width="2"/><circle cx="150" cy="40" r="3" class="dot-cyan"/><line x1="150" y1="40" x2="228" y2="32" class="s-dim" stroke-width="1"/><text x="232" y="35" class="lbl">HEADBAND ARC</text><circle cx="150" cy="110" r="24" class="s-magenta" stroke-width="2"/><circle cx="150" cy="110" r="9" class="s-magenta" stroke-width="1"/><line x1="174" y1="110" x2="228" y2="102" class="s-dim" stroke-width="1"/><text x="232" y="105" class="lbl">BONE TRANSDUCER</text><path d="M128 168 Q150 148 172 168 Q182 182 166 195" class="s-cyan" stroke-width="2"/><line x1="172" y1="180" x2="228" y2="176" class="s-dim" stroke-width="1"/><text x="232" y="179" class="lbl">EAR RETENTION HOOK</text>'),
  mic: svg('<line x1="150" y1="18" x2="150" y2="202" class="s-line dash" stroke-width="1"/><circle cx="150" cy="50" r="26" class="s-cyan" stroke-width="2"/><path d="M132 50h36M150 32v36M138 38l24 24M162 38l-24 24" class="s-dim" stroke-width="0.75"/><line x1="176" y1="50" x2="228" y2="40" class="s-dim" stroke-width="1"/><text x="232" y="43" class="lbl">GRILLE / DIAPHRAGM</text><rect x="136" y="98" width="28" height="34" rx="3" class="s-magenta" stroke-width="2"/><line x1="164" y1="112" x2="228" y2="106" class="s-dim" stroke-width="1"/><text x="232" y="109" class="lbl">DUAL CAPSULE</text><path d="M120 195 L180 195 L166 165 L134 165 Z" class="s-cyan" stroke-width="2"/><line x1="180" y1="185" x2="228" y2="182" class="s-dim" stroke-width="1"/><text x="232" y="185" class="lbl">MAGNETIC BASE</text>'),
  earbuds: svg('<line x1="150" y1="18" x2="150" y2="202" class="s-line dash" stroke-width="1"/><path d="M112 55 h76 a6 6 0 0 1 6 6 v18 h-88 v-18 a6 6 0 0 1 6 -6 Z" class="s-cyan" stroke-width="2"/><path d="M112 55 q38 -20 76 0" class="s-dim" stroke-width="1"/><line x1="188" y1="65" x2="230" y2="55" class="s-dim" stroke-width="1"/><text x="234" y="58" class="lbl">CASE + HINGE LID</text><ellipse cx="130" cy="118" rx="13" ry="17" class="s-magenta" stroke-width="2"/><ellipse cx="170" cy="118" rx="13" ry="17" class="s-magenta" stroke-width="2"/><line x1="183" y1="118" x2="230" y2="112" class="s-dim" stroke-width="1"/><text x="234" y="115" class="lbl">L / R DRIVER PODS</text><rect x="136" y="165" width="28" height="16" rx="2" class="s-cyan" stroke-width="2"/><line x1="164" y1="173" x2="230" y2="173" class="s-dim" stroke-width="1"/><text x="234" y="176" class="lbl">CASE BATTERY CELL</text>'),
  watch: svg('<line x1="150" y1="18" x2="150" y2="202" class="s-line dash" stroke-width="1"/><circle cx="150" cy="55" r="28" class="s-cyan" stroke-width="2"/><rect x="176" y="48" width="8" height="14" rx="1" class="s-cyan" stroke-width="1.5"/><line x1="184" y1="55" x2="230" y2="45" class="s-dim" stroke-width="1"/><text x="234" y="48" class="lbl">FACE + CROWN</text><rect x="126" y="98" width="48" height="26" rx="4" class="s-magenta" stroke-width="2"/><circle cx="138" cy="111" r="3" class="dot-magenta"/><circle cx="150" cy="111" r="3" class="dot-magenta"/><circle cx="162" cy="111" r="3" class="dot-magenta"/><line x1="174" y1="111" x2="230" y2="108" class="s-dim" stroke-width="1"/><text x="234" y="111" class="lbl">SENSOR MODULE</text><path d="M132 158 q18 12 36 0 v14 q-18 12 -36 0 Z" class="s-cyan" stroke-width="2"/><line x1="168" y1="172" x2="230" y2="178" class="s-dim" stroke-width="1"/><text x="234" y="181" class="lbl">STRAP BAND</text>'),
  ring: svg('<line x1="150" y1="18" x2="150" y2="202" class="s-line dash" stroke-width="1"/><circle cx="150" cy="90" r="34" class="s-cyan" stroke-width="2"/><circle cx="150" cy="90" r="24" class="s-cyan" stroke-width="1"/><line x1="184" y1="90" x2="230" y2="80" class="s-dim" stroke-width="1"/><text x="234" y="83" class="lbl">TITANIUM BAND</text><rect x="140" y="120" width="20" height="10" rx="2" class="s-magenta" stroke-width="1.5"/><line x1="160" y1="125" x2="230" y2="130" class="s-dim" stroke-width="1"/><text x="234" y="133" class="lbl">PPG SENSOR NODE</text><path d="M124 165 A30 30 0 0 1 176 165" class="s-cyan" stroke-width="3"/><line x1="176" y1="165" x2="230" y2="172" class="s-dim" stroke-width="1"/><text x="234" y="175" class="lbl">BATTERY ARC CELL</text>'),
  glasses: svg('<line x1="150" y1="18" x2="150" y2="202" class="s-line dash" stroke-width="1"/><ellipse cx="118" cy="70" rx="26" ry="18" class="s-cyan" stroke-width="2"/><ellipse cx="182" cy="70" rx="26" ry="18" class="s-cyan" stroke-width="2"/><path d="M144 70 h12" class="s-cyan" stroke-width="2"/><line x1="208" y1="70" x2="230" y2="55" class="s-dim" stroke-width="1"/><text x="234" y="58" class="lbl">WAVEGUIDE LENS PAIR</text><path d="M208 66 q30 -6 40 10" class="s-magenta" stroke-width="2"/><line x1="230" y1="90" x2="228" y2="112" class="s-dim" stroke-width="1"/><text x="188" y="126" class="lbl">TEMPLE HINGE ARM</text><circle cx="128" cy="140" r="3" class="dot-magenta"/><line x1="128" y1="140" x2="230" y2="168" class="s-dim" stroke-width="1"/><text x="234" y="171" class="lbl">EYE-TRACK SENSOR</text>'),
  keyboard: svg('<line x1="150" y1="18" x2="150" y2="202" class="s-line dash" stroke-width="1"/><rect x="130" y="34" width="40" height="16" rx="2" class="s-cyan" stroke-width="2"/><line x1="170" y1="42" x2="230" y2="34" class="s-dim" stroke-width="1"/><text x="234" y="37" class="lbl">DOUBLESHOT KEYCAP</text><path d="M140 80 v20 M160 80 v20 M132 90 h36" class="s-magenta" stroke-width="2"/><rect x="128" y="76" width="44" height="10" rx="1" class="s-magenta" stroke-width="1.5"/><line x1="172" y1="90" x2="230" y2="92" class="s-dim" stroke-width="1"/><text x="234" y="95" class="lbl">HOT-SWAP SWITCH</text><rect x="110" y="120" width="80" height="14" rx="1" class="s-cyan" stroke-width="1.5"/><circle cx="122" cy="127" r="1.5" class="s-dim" stroke-width="1"/><circle cx="178" cy="127" r="1.5" class="s-dim" stroke-width="1"/><line x1="190" y1="127" x2="230" y2="132" class="s-dim" stroke-width="1"/><text x="234" y="135" class="lbl">GASKET PLATE</text><rect x="105" y="150" width="90" height="30" rx="2" class="s-dim dash" stroke-width="1"/><line x1="195" y1="165" x2="230" y2="172" class="s-dim" stroke-width="1"/><text x="234" y="175" class="lbl">PCB + STABILIZERS</text>'),
  mouse: svg('<line x1="150" y1="18" x2="150" y2="202" class="s-line dash" stroke-width="1"/><path d="M122 40 q28 -14 56 0 q10 30 0 66 q-28 14 -56 0 q-10 -36 0 -66 Z" class="s-cyan" stroke-width="2"/><line x1="150" y1="40" x2="150" y2="75" class="s-dim" stroke-width="1"/><line x1="178" y1="60" x2="230" y2="50" class="s-dim" stroke-width="1"/><text x="234" y="53" class="lbl">PERFORATED SHELL</text><circle cx="150" cy="130" r="10" class="s-magenta" stroke-width="2"/><line x1="160" y1="130" x2="230" y2="130" class="s-dim" stroke-width="1"/><text x="234" y="133" class="lbl">26K OPTICAL SENSOR</text><rect x="120" y="160" width="60" height="24" rx="2" class="s-cyan" stroke-width="1.5"/><circle cx="150" cy="172" r="6" class="s-dim" stroke-width="1"/><line x1="180" y1="172" x2="230" y2="176" class="s-dim" stroke-width="1"/><text x="234" y="179" class="lbl">SCROLL + PCB</text>'),
  monitor: svg('<line x1="150" y1="18" x2="150" y2="202" class="s-line dash" stroke-width="1"/><rect x="90" y="30" width="120" height="76" rx="2" class="s-cyan" stroke-width="2"/><path d="M100 40 l16 56M120 40 l16 56M140 40 l16 56M160 40 l16 56M180 40 l16 56" class="s-dim" stroke-width="0.5"/><line x1="210" y1="68" x2="238" y2="58" class="s-dim" stroke-width="1"/><text x="200" y="20" class="lbl">15.6" IPS PANEL</text><path d="M110 120 l-14 30 M190 120 l14 30" class="s-magenta" stroke-width="2"/><line x1="176" y1="140" x2="230" y2="140" class="s-dim" stroke-width="1"/><text x="234" y="143" class="lbl">FOLD-OUT HINGE LEG</text><ellipse cx="150" cy="185" rx="46" ry="8" class="s-cyan" stroke-width="1.5"/><line x1="196" y1="185" x2="230" y2="188" class="s-dim" stroke-width="1"/><text x="234" y="191" class="lbl">WEIGHTED BASE</text>'),
  hub: svg('<line x1="150" y1="18" x2="150" y2="202" class="s-line dash" stroke-width="1"/><rect x="136" y="30" width="8" height="20" class="s-cyan" stroke-width="2"/><rect x="156" y="30" width="8" height="20" class="s-cyan" stroke-width="2"/><line x1="164" y1="40" x2="230" y2="32" class="s-dim" stroke-width="1"/><text x="234" y="35" class="lbl">DUAL PRONG PLUG</text><rect x="112" y="66" width="76" height="60" rx="6" class="s-magenta" stroke-width="2"/><circle cx="150" cy="96" r="4" class="dot-magenta"/><line x1="188" y1="96" x2="230" y2="100" class="s-dim" stroke-width="1"/><text x="234" y="103" class="lbl">HUB BODY + RELAY</text><path d="M150 148 v20" class="s-cyan" stroke-width="1.5"/><circle cx="150" cy="170" r="3" class="dot-cyan"/><line x1="153" y1="170" x2="230" y2="176" class="s-dim" stroke-width="1"/><text x="234" y="179" class="lbl">ZIGBEE ANTENNA</text>'),
  cam: svg('<line x1="150" y1="18" x2="150" y2="202" class="s-line dash" stroke-width="1"/><circle cx="150" cy="55" r="22" class="s-cyan" stroke-width="2"/><circle cx="150" cy="55" r="12" class="s-cyan" stroke-width="1"/><circle cx="150" cy="55" r="4" class="dot-cyan"/><line x1="172" y1="55" x2="230" y2="45" class="s-dim" stroke-width="1"/><text x="234" y="48" class="lbl">2K IR LENS ASSY</text><rect x="118" y="90" width="64" height="46" rx="8" class="s-magenta" stroke-width="2"/><line x1="182" y1="113" x2="230" y2="113" class="s-dim" stroke-width="1"/><text x="234" y="116" class="lbl">SENSOR BODY</text><path d="M140 150 v20 h30" class="s-cyan" stroke-width="2"/><line x1="170" y1="170" x2="230" y2="176" class="s-dim" stroke-width="1"/><text x="234" y="179" class="lbl">SWIVEL MOUNT BRACKET</text>'),
  air: svg('<line x1="150" y1="18" x2="150" y2="202" class="s-line dash" stroke-width="1"/><rect x="118" y="30" width="12" height="12" class="s-cyan" stroke-width="1.5"/><rect x="134" y="30" width="12" height="12" class="s-cyan" stroke-width="1.5"/><rect x="150" y="30" width="12" height="12" class="s-cyan" stroke-width="1.5"/><rect x="166" y="30" width="12" height="12" class="s-cyan" stroke-width="1.5"/><line x1="178" y1="36" x2="230" y2="30" class="s-dim" stroke-width="1"/><text x="234" y="33" class="lbl">PM / VOC SENSOR GRID</text><rect x="110" y="70" width="80" height="34" rx="2" class="s-magenta" stroke-width="2"/><path d="M120 87 h60" class="s-dim" stroke-width="1"/><line x1="190" y1="87" x2="230" y2="90" class="s-dim" stroke-width="1"/><text x="234" y="93" class="lbl">E-INK STATUS PANEL</text><path d="M115 140 h70 M115 150 h70 M115 160 h70" class="s-cyan" stroke-width="1.5"/><line x1="185" y1="150" x2="230" y2="155" class="s-dim" stroke-width="1"/><text x="234" y="158" class="lbl">INTAKE VENT SLITS</text>')
};

/* ---------- product data ---------- */
const PRODUCTS = [
  { id: "ax7", name: "AX-7 BONE CONDUCTION HEADSET", category: "Audio", price: 129, year: 12, diagram: D.headset, photo: "ax7", stock: 14,
    tagline: "Open-ear audio via titanium bone-conduction transducers. Bypasses the eardrum entirely.",
    specs: [["Driver", "Titanium coil bone-conduction"], ["Battery", "9hr playback / 180mAh"], ["Connectivity", "BT 5.3 + USB-C"], ["Weight", "29g"], ["Rating", "IP67 sweatproof"]],
    tags: ["Wireless", "USB-C", "Open-ear", "Sport"], weight: 29, power: "180mAh",
    metrics: { battery: 3, portability: 5, capability: 3, value: 4 } },
  { id: "vox3", name: "VOX-3 DESKTOP MIC ARRAY", category: "Audio", price: 89, year: 5, diagram: D.mic, photo: "vox3", stock: 9,
    tagline: "Dual-capsule condenser array on a magnetic isolation base. Studio-clean capture from a desk.",
    specs: [["Capsule", "Dual electret condenser"], ["Pattern", "Cardioid / Omni switchable"], ["Sample Rate", "24-bit / 96kHz"], ["Mount", "Magnetic desk stand"], ["Weight", "340g"]],
    tags: ["USB-C", "Studio", "Cardioid"], weight: 340, power: "USB bus",
    metrics: { battery: 0, portability: 2, capability: 4, value: 4 } },
  { id: "pulse", name: "PULSE WIRELESS EARBUDS", category: "Audio", price: 59, year: 9, diagram: D.earbuds, photo: "pulse", stock: 31,
    tagline: "Hybrid ANC earbuds with a 20-hour case reserve. Fits the exploded pod-and-shell format.",
    specs: [["Driver", "6mm dynamic"], ["Battery", "5hr + 20hr case"], ["ANC", "Hybrid -32dB"], ["Charging", "USB-C / Wireless Qi"], ["Weight", "5g each"]],
    tags: ["Wireless", "ANC", "USB-C", "Qi"], weight: 5, power: "5h+20h",
    metrics: { battery: 4, portability: 5, capability: 4, value: 5 } },
  { id: "chrono9", name: "CHRONO-9 SMARTWATCH", category: "Wearables", price: 199, year: 11, diagram: D.watch, photo: "chrono9", stock: 11,
    tagline: "Always-on AMOLED face over a full biometric sensor stack. Six-day runtime.",
    specs: [["Display", '1.4" AMOLED always-on'], ["Sensors", "HR / SpO2 / GPS"], ["Battery", "6-day typical use"], ["Water Rating", "5ATM"], ["Weight", "38g"]],
    tags: ["Wireless", "GPS", "AMOLED", "5ATM"], weight: 38, power: "6-day",
    metrics: { battery: 4, portability: 4, capability: 5, value: 4 } },
  { id: "grip", name: "GRIP FITNESS RING", category: "Wearables", price: 149, year: 7, diagram: D.ring, photo: "grip", stock: 7,
    tagline: "Titanium-shell ring tracking sleep and recovery. Barely-there 3.4g mass.",
    specs: [["Sensors", "PPG + skin temp"], ["Battery", "6-day / 15min charge"], ["Material", "Titanium shell"], ["Weight", "3.4g"], ["Sizes", "US 6-13"]],
    tags: ["Wireless", "Titanium", "Sleep"], weight: 3.4, power: "6-day",
    metrics: { battery: 4, portability: 5, capability: 3, value: 3 } },
  { id: "aura", name: "AURA SMART GLASSES", category: "Wearables", price: 249, year: 10, diagram: D.glasses, photo: "aura", stock: 5,
    tagline: "Waveguide micro-LED HUD in a standard optical frame. Open-ear beamformed audio.",
    specs: [["Display", "Waveguide micro-LED"], ["Audio", "Open-ear beamform"], ["Battery", "4hr continuous"], ["Lens", "UV400 polarized"], ["Weight", "48g"]],
    tags: ["Wireless", "AR", "Open-ear"], weight: 48, power: "4h",
    metrics: { battery: 2, portability: 4, capability: 5, value: 3 } },
  { id: "keyframe84", name: "KEYFRAME-84 MECHANICAL KEYBOARD", category: "Peripherals", price: 139, year: 6, diagram: D.keyboard, photo: "keyframe84", stock: 22,
    tagline: "Gasket-mounted TKL with hot-swap sockets. Aluminum plate tuned for a soft, deep bottom-out.",
    specs: [["Layout", "84-key TKL"], ["Switches", "Hot-swap linear 45g"], ["Plate", "Aluminum gasket-mount"], ["Connectivity", "BT / 2.4GHz / USB-C"], ["Weight", "820g"]],
    tags: ["Wireless", "Hot-swap", "USB-C", "BT"], weight: 820, power: "4000mAh",
    metrics: { battery: 4, portability: 2, capability: 5, value: 4 } },
  { id: "vector", name: "VECTOR MOUSE", category: "Peripherals", price: 69, year: 4, diagram: D.mouse, photo: "vector", stock: 18,
    tagline: "Perforated 58g shell around a 26,000 DPI optical sensor. Built for long sessions.",
    specs: [["Sensor", "26000 DPI optical"], ["Weight", "58g perforated shell"], ["Switches", "Optical 80M-click"], ["Battery", "70hr"], ["Polling", "1000Hz / 4kHz dongle"]],
    tags: ["Wireless", "Optical", "USB-C"], weight: 58, power: "70h",
    metrics: { battery: 5, portability: 5, capability: 4, value: 5 } },
  { id: "scanline", name: "SCANLINE PORTABLE MONITOR", category: "Peripherals", price: 229, year: 8, diagram: D.monitor, photo: "scanline", stock: 8,
    tagline: '15.6" color-accurate IPS panel that folds into a kickstand cover. USB-C powered.',
    specs: [["Panel", '15.6" IPS 1080p'], ["Refresh", "60Hz / 100% sRGB"], ["Input", "USB-C / mini-HDMI"], ["Weight", "780g"], ["Power", "7W typical, bus-powered"]],
    tags: ["USB-C", "IPS", "Portable"], weight: 780, power: "USB-C DP",
    metrics: { battery: 0, portability: 3, capability: 4, value: 3 } },
  { id: "node", name: "NODE SMART PLUG HUB", category: "Home", price: 49, year: 2, diagram: D.hub, photo: "node", stock: 40,
    tagline: "A plug that's also a Zigbee bridge. Onboards the rest of the smart-home shelf.",
    specs: [["Load", "15A / 1800W max"], ["Radio", "WiFi 2.4GHz + Zigbee hub"], ["Ports", "1 outlet + 2 USB-C"], ["Control", "App / voice / schedule"], ["Weight", "120g"]],
    tags: ["WiFi", "Zigbee", "USB-C"], weight: 120, power: "AC mains",
    metrics: { battery: 0, portability: 4, capability: 4, value: 5 } },
  { id: "sentry", name: "SENTRY SECURITY CAM", category: "Home", price: 99, year: 3, diagram: D.cam, photo: "sentry", stock: 12,
    tagline: "2K IR camera on a swivel mount. Local microSD or optional cloud retention.",
    specs: [["Resolution", "2K QHD / night IR"], ["FOV", "130 wide angle"], ["Storage", "microSD / cloud optional"], ["Power", "PoE or USB-C"], ["Weight", "210g"]],
    tags: ["WiFi", "2K", "IR", "PoE"], weight: 210, power: "PoE / USB-C",
    metrics: { battery: 0, portability: 3, capability: 4, value: 4 } },
  { id: "atmos", name: "ATMOS AIR QUALITY MONITOR", category: "Home", price: 79, year: 1, diagram: D.air, photo: null, stock: 19,
    tagline: "Four-sensor air stack behind a low-power E-ink readout. A month per charge.",
    specs: [["Sensors", "PM2.5 / CO2 / VOC / humidity"], ["Display", "E-ink status panel"], ["Connectivity", "WiFi + BT"], ["Battery", "30-day / USB-C charge"], ["Weight", "180g"]],
    tags: ["WiFi", "BT", "E-ink"], weight: 180, power: "30-day",
    metrics: { battery: 5, portability: 4, capability: 3, value: 4 } }
];
const CATEGORIES = ["Audio", "Wearables", "Peripherals", "Home"];
const ALL_TAGS = Array.from(new Set(PRODUCTS.flatMap((p) => p.tags))).sort();

/* ---------- seeded field reports ---------- */
const SEED_REVIEWS = {
  ax7: [["nomad_dev", 5, "Ran a half marathon with these. Heard every car, still got the podcast. The trade-off is bass - there is none."], ["k.reyes", 4, "Vibration on the temple is noticeable at high volume. Fine at 60%."]],
  vox3: [["studioB", 5, "Swapped a $400 interface + mic for this. Nobody on the call noticed a downgrade."], ["podcaster_11", 4, "Omni mode picks up the room. Keep it on cardioid."]],
  pulse: [["transit_daily", 5, "ANC is genuinely -30 on a train. At this price that should not be possible."], ["ml_j", 4, "Case hinge feels cheap but three months in, still fine."], ["quietcar", 5, "The exploded diagram sold me and the real thing lived up to it."]],
  chrono9: [["trailrunner", 5, "Six days is not marketing - I get five and a half with GPS most days."], ["desk_jockey", 3, "AMOLED always-on eats a day. Turn it off and it's a champion."]],
  grip: [["sleep_nerd", 4, "Recovery score tracks how I actually feel about 80% of the time. Good enough to act on."], ["ringsize_L", 3, "Sizing kit is essential - I was between two and guessed wrong first time."]],
  aura: [["ar_curious", 4, "The HUD is legible outdoors, which I did not expect. Four hours is the real limit though."], ["specs_only", 5, "Finally a pair that looks like glasses and not a headset."]],
  keyframe84: [["thock_lord", 5, "Out of the box bottom-out is softer than most boards I've modded. Gasket mount is real."], ["tkl_convert", 4, "2.4GHz dongle is flawless. BT has a wake delay."]],
  vector: [["fps_grind", 5, "58g and it glides. Battery genuinely lasts the week I claimed."], ["big_hands", 3, "Small for a palm grip. Claw and fingertip are happy."]],
  scanline: [["two_screen", 4, "Kickstand cover is the whole product. sRGB coverage checks out on a colorimeter."], ["roadwork", 4, "Bus-powered off a laptop works but dims the laptop battery fast."]],
  node: [["home_assistant", 5, "Bought it as a plug, kept it as a Zigbee coordinator. Onboarded 14 devices."], ["renter", 4, "USB-C ports are a nice bonus by the bed."]],
  sentry: [["driveway_watch", 4, "Night IR is usable to about 8 metres. Local microSD means no subscription, which is the point."], ["privacy_first", 5, "No cloud required. Swivel is smooth and quiet."]],
  atmos: [["allergy_szn", 5, "Watched the PM2.5 spike every time the neighbour lit the fire pit. E-ink lasts weeks."], ["co2_aware", 4, "CO2 in a closed office hit 1400 by noon. Now I crack a window."]]
};

/* ---------- field intel articles ---------- */
const INTEL = [
  { slug: "bone-conduction", title: "How bone conduction actually works", section: "AUDIO", mins: 5, related: ["ax7"],
    synopsis: "Sound without covering the ear canal - the physics, and the trade-offs nobody mentions.",
    body: [
      { h: "THE MECHANISM", p: "A normal driver pushes air; your eardrum turns that pressure wave into motion in the cochlea. Bone conduction skips the first two steps. A transducer pressed against the skull vibrates the temporal bone directly, and the cochlea picks it up as if the sound had arrived through the ear." },
      { h: "WHY IT'S OPEN-EAR", p: "Nothing blocks the canal, so ambient sound arrives normally. That is the entire pitch: you hear traffic, a colleague, a train announcement, and your audio at the same time. For running and cycling this is a safety feature, not a compromise." },
      { h: "THE TRADE-OFFS", p: "Bass is weak - low frequencies need air displacement the skull can't provide. Above roughly 70% volume you feel a tickle on the cheekbone. And in a loud environment the open design means everyone near you gets a faint version of your podcast." },
      { p: "The AX-7 uses a titanium coil transducer to push the usable frequency floor down a little further than most, but the laws of physics still apply." }
    ] },
  { slug: "hot-swap-keyboards", title: "Hot-swap vs soldered switches", section: "PERIPHERALS", mins: 4, related: ["keyframe84"],
    synopsis: "The socket that lets you change switches without a soldering iron - what it costs you.",
    body: [
      { h: "THE SOCKET", p: "A hot-swap PCB has a small spring-loaded contact under each switch position. Push a switch in, the pins seat in the socket, done. Pull it out with a puller and drop in a different one. No heat, no flux, no risk of lifting a pad." },
      { h: "WHAT YOU GIVE UP", p: "Sockets add a fraction of a millimetre of travel and a tiny amount of contact resistance. On a well-built board you will not feel or hear it. On a cheap one, switches can wobble or lose contact over time. The socket brand matters more than the fact that it's hot-swap." },
      { h: "WHO IT'S FOR", p: "If you know exactly what switch you want forever, soldered is marginally more solid and cheaper. If you want to try tactiles next month, or mix switch weights across the board, hot-swap pays for itself the first time." },
      { p: "The KEYFRAME-84 uses five-pin sockets, so both three- and five-pin switches seat without clipping." }
    ] },
  { slug: "anc-explained", title: "Active noise cancellation, honestly", section: "AUDIO", mins: 5, related: ["pulse"],
    synopsis: "What the dB figure means, why it only works on some noise, and what 'hybrid' buys you.",
    body: [
      { h: "FEEDFORWARD + FEEDBACK", p: "A feedforward mic on the outside samples noise before it reaches your ear and generates an inverted wave to cancel it. A feedback mic inside the ear cup checks the result and corrects. 'Hybrid' ANC runs both. Feedforward handles a wider frequency range; feedback fixes what leaked past." },
      { h: "THE dB FIGURE", p: "A '-32dB' claim is a peak, usually around 100-200Hz - engine drone, an aircraft cabin, a train. That is the noise ANC is good at: low, constant, predictable. It does very little against a nearby conversation or a barista, because speech is mid-range and irregular." },
      { h: "THE COST", p: "ANC needs power - it's why ANC earbuds quote a shorter battery life with it on. It also introduces a faint pressure sensation some people dislike, and a low noise floor (hiss) on cheaper implementations." },
      { p: "PULSE quotes 5 hours with ANC engaged and around 7 with it off. The case carries four more charges." }
    ] },
  { slug: "waveguide-displays", title: "Waveguide micro-LED, in plain terms", section: "WEARABLES", mins: 6, related: ["aura"],
    synopsis: "How a HUD fits in a normal-looking lens, and why brightness and field of view fight each other.",
    body: [
      { h: "THE LIGHT PATH", p: "A micro-LED panel the size of a grain of rice sits in the temple arm. Its light is coupled into the lens - a flat piece of glass etched with microscopic gratings - bounces along by total internal reflection, and is coupled back out toward your eye by a second grating. You see a bright image floating in front of the world." },
      { h: "THE CONSTRAINTS", p: "Only a fraction of the panel's light survives the trip, so waveguide HUDs are dim outdoors unless the panel is driven hard, which costs battery. Field of view is limited by the grating geometry - most consumer units show a display roughly the size of a phone held at arm's length. Wider means thicker glass." },
      { h: "WHY IT'S WORTH IT", p: "The alternative - a bird-bath combiner or a bulky prism - looks like a headset. A waveguide can hide in a lens that passes for eyewear. That social acceptability is the reason the format exists." },
      { p: "AURA drives its panel bright enough to read in daylight, at the cost of a 4-hour runtime." }
    ] },
  { slug: "e-ink-sensors", title: "Why sensors are moving to E-ink", section: "HOME", mins: 3, related: ["atmos"],
    synopsis: "The display technology that lets a monitoring device run for a month on one charge.",
    body: [
      { h: "IT ONLY DRAWS POWER TO CHANGE", p: "An E-ink panel holds its image with zero power. Electricity is only used to flip the microcapsules when the reading updates. For a device that shows a number that changes every few minutes, that is the difference between a day of battery and a month." },
      { h: "THE LIMITS", p: "Refresh is slow and the panel is monochrome or low-colour, with no backlight. That is fine for a CO2 number or a PM2.5 bar graph, useless for anything animated." },
      { p: "ATMOS pairs four gas sensors with an E-ink readout and quotes 30 days per USB-C charge." }
    ] }
];

/* ---------- storage ---------- */
const K = {
  cart: "terminal_cart_v2", saved: "terminal_saved_v1", rigs: "terminal_rigs_v1",
  reviews: "terminal_reviews_v1", recent: "terminal_recent_v1", orders: "terminal_orders_v1",
  sold: "terminal_sold_v1", cmp: "terminal_compare_v1", watch: "terminal_watch_v1"
};
const rd = (k, f) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? f : v; } catch (e) { return f; } };
const wr = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

/* migrate v1 cart */
(function () {
  if (localStorage.getItem(K.cart)) return;
  const old = rd("terminal_cart_v1", null);
  if (Array.isArray(old)) wr(K.cart, old);
})();

let cart = rd(K.cart, []).filter((l) => l && PRODUCTS.some((p) => p.id === l.id));
const saveCart = () => { wr(K.cart, cart); paintCounts(); };
let saved = rd(K.saved, []);
const saveSaved = () => { wr(K.saved, saved); paintCounts(); };
let compareIds = rd(K.cmp, []);
const saveCompare = () => wr(K.cmp, compareIds);

const prod = (id) => PRODUCTS.find((p) => p.id === id);
const soldMap = () => rd(K.sold, {});
const effStock = (p) => Math.max(0, p.stock - (soldMap()[p.id] || 0));
const isSaved = (id) => saved.indexOf(id) !== -1;

function reviewsFor(id) {
  const seed = (SEED_REVIEWS[id] || []).map(([n, s, t]) => ({ name: n, stars: s, text: t, seed: true }));
  const mine = (rd(K.reviews, {})[id] || []);
  return seed.concat(mine);
}
function ratingFor(id) {
  const r = reviewsFor(id);
  if (!r.length) return null;
  return { avg: r.reduce((s, x) => s + x.stars, 0) / r.length, count: r.length };
}
function stars(avg, cls) {
  let o = '<span class="stars ' + (cls || "") + '" aria-hidden="true">';
  for (let i = 1; i <= 5; i++) o += '<span class="star' + (avg >= i - 0.3 ? " on" : "") + '">*</span>';
  return o + "</span>";
}

/* ---------- cart ops ---------- */
const cartCount = () => cart.reduce((n, l) => n + l.qty, 0);
const cartSubtotal = () => cart.reduce((s, l) => { const p = prod(l.id); return p ? s + p.price * l.qty : s; }, 0);
function addToCart(id, qty) {
  const p = prod(id);
  if (!p || effStock(p) <= 0) { toast("UNIT OUT OF STOCK", "error"); return; }
  const ex = cart.find((l) => l.id === id);
  const max = effStock(p);
  if (ex) ex.qty = clamp(ex.qty + qty, 1, max);
  else cart.push({ id: id, qty: clamp(qty, 1, max) });
  saveCart();
  toast(p.name + " -> cart x" + qty);
}
function setCartQty(id, q) {
  const l = cart.find((x) => x.id === id); if (!l) return;
  const p = prod(id);
  l.qty = clamp(q, 1, effStock(p) || 99);
  if (q <= 0) cart = cart.filter((x) => x.id !== id);
  saveCart();
}
function removeCart(id) { cart = cart.filter((l) => l.id !== id); saveCart(); }

function toggleSave(id) {
  const i = saved.indexOf(id);
  if (i === -1) { saved.unshift(id); toast(prod(id).name + " saved"); }
  else { saved.splice(i, 1); toast(prod(id).name + " unsaved"); }
  saveSaved();
  if (pageRepaint) pageRepaint();
}
function toggleCompare(id) {
  const i = compareIds.indexOf(id);
  if (i >= 0) compareIds.splice(i, 1);
  else { if (compareIds.length >= 4) { toast("COMPARE BUFFER FULL (4)", "error"); return; } compareIds.push(id); }
  saveCompare();
  toast("compare buffer: " + compareIds.length + "/4");
  if (pageRepaint) pageRepaint();
}

/* ---------- recently viewed ---------- */
function pushRecent(id) {
  let r = rd(K.recent, []).filter((x) => x !== id);
  r.unshift(id);
  wr(K.recent, r.slice(0, 8));
}

/* ---------- toast ---------- */
function toast(msg, type) {
  const log = $("#status-log");
  if (!log) return;
  const el = document.createElement("div");
  el.className = "status-toast" + (type === "error" ? " error" : "");
  el.textContent = "> " + msg;
  log.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

/* ============================================================
   CHROME
   ============================================================ */
const NAV = [
  { href: "index.html", label: "CATALOG", key: "catalog" },
  { href: "compare.html", label: "COMPARE", key: "compare" },
  { href: "build.html", label: "BUILD A RIG", key: "build" },
  { href: "intel.html", label: "FIELD INTEL", key: "intel" }
];

function renderChrome() {
  const header = document.createElement("header");
  header.className = "topbar";
  header.innerHTML =
    '<a class="brand" href="index.html" aria-label="The Terminal - home">' +
      '<span class="brand-prompt">&gt;</span><span class="brand-name">THE&nbsp;TERMINAL</span><span class="brand-cursor" id="brand-cursor"></span>' +
    '</a>' +
    '<button class="nav-toggle" id="nav-toggle" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>' +
    '<nav class="topnav" id="topnav" aria-label="Main">' +
      NAV.map((n) => '<a href="' + n.href + '"' + (n.key === PAGE ? ' aria-current="page"' : "") + ">" + n.label + "</a>").join("") +
      '<a href="saved.html" class="nav-mini' + (PAGE === "saved" ? '" aria-current="page' : "") + '">SAVED<span class="nav-badge" data-saved-count>0</span></a>' +
      '<a href="cart.html" class="nav-mini nav-cart' + (PAGE === "cart" ? '" aria-current="page' : "") + '">CART<span class="nav-badge" data-cart-count>0</span></a>' +
    '</nav>' +
    '<div class="topbar-status" aria-hidden="true"><span class="status-dot"></span> LINK ESTABLISHED</div>';
  document.body.insertBefore(header, document.body.firstChild);

  const footer = document.createElement("footer");
  footer.className = "site-footer";
  footer.innerHTML =
    '<span>THE TERMINAL SYSTEMS / SPEC DATABASE v3.2</span>' +
    '<span>NO NETWORK CALLS &middot; NO REAL PAYMENTS &middot; LOCAL DEMO ONLY &middot; <kbd>:</kbd> for command palette</span>' +
    '<span>Product photos under Creative Commons - see img/_credits.json</span>';
  document.body.appendChild(footer);

  const sl = document.createElement("div");
  sl.id = "status-log"; sl.className = "status-log"; sl.setAttribute("aria-live", "polite");
  document.body.appendChild(sl);

  // blinking cursor (setInterval - survives frozen preview)
  const cur = $("#brand-cursor");
  if (cur && !reduced) setInterval(() => { cur.style.opacity = cur.style.opacity === "0" ? "1" : "0"; }, 530);

  const nav = $("#topnav"), tog = $("#nav-toggle");
  function setNav(open) { nav.classList.toggle("open", open); tog.setAttribute("aria-expanded", open ? "true" : "false"); tog.classList.toggle("x", open); }
  tog.addEventListener("click", (e) => { e.stopPropagation(); setNav(!nav.classList.contains("open")); });
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) setNav(false); });
  document.addEventListener("click", (e) => { if (nav.classList.contains("open") && !nav.contains(e.target) && !tog.contains(e.target)) setNav(false); });
}

function paintCounts() {
  $$("[data-cart-count]").forEach((el) => { const c = cartCount(); el.textContent = String(c); el.classList.toggle("empty", c === 0); });
  $$("[data-saved-count]").forEach((el) => { el.textContent = String(saved.length); el.classList.toggle("empty", saved.length === 0); });
  if (pageRepaint) pageRepaint();
}
let pageRepaint = null;

/* ============================================================
   THEMED CONTROLS
   ============================================================ */
function enhanceSelect(sel) {
  if (!sel || sel.dataset.tm) return;
  sel.dataset.tm = "1";
  const wrap = document.createElement("div"); wrap.className = "tm-sel";
  sel.parentNode.insertBefore(wrap, sel); wrap.appendChild(sel);
  sel.classList.add("tm-sel-native");
  const trig = document.createElement("button");
  trig.type = "button"; trig.className = "tm-sel-trigger";
  trig.setAttribute("aria-haspopup", "listbox"); trig.setAttribute("aria-expanded", "false");
  const panel = document.createElement("div"); panel.className = "tm-sel-panel"; panel.setAttribute("role", "listbox"); panel.hidden = true;
  wrap.appendChild(trig); wrap.appendChild(panel);
  function build() {
    panel.innerHTML = "";
    Array.from(sel.options).forEach((o) => {
      const d = document.createElement("div");
      d.className = "tm-sel-opt"; d.setAttribute("role", "option"); d.textContent = o.textContent;
      if (o.disabled) d.setAttribute("aria-disabled", "true");
      if (o.value === sel.value && !o.disabled) d.setAttribute("aria-selected", "true");
      d.addEventListener("click", () => { if (o.disabled) return; sel.value = o.value; sel.dispatchEvent(new Event("change", { bubbles: true })); close(); });
      panel.appendChild(d);
    });
  }
  function sync() {
    const o = sel.options[sel.selectedIndex];
    trig.innerHTML = "<span>" + (o ? esc(o.textContent) : "") + '</span><span class="tm-sel-caret">v</span>';
  }
  function open() { build(); panel.hidden = false; trig.setAttribute("aria-expanded", "true"); }
  function close() { panel.hidden = true; trig.setAttribute("aria-expanded", "false"); }
  trig.addEventListener("click", () => (panel.hidden ? open() : close()));
  document.addEventListener("click", (e) => { if (!wrap.contains(e.target)) close(); });
  sel.addEventListener("change", sync);
  sync();
}

function stepperHTML(value, key) {
  return '<span class="tm-step" data-step' + (key ? ' data-key="' + esc(key) + '"' : "") + '>' +
    '<button type="button" class="tm-step-b" data-d="-1" aria-label="Decrease">[ - ]</button>' +
    '<span class="tm-step-v" data-v>' + value + '</span>' +
    '<button type="button" class="tm-step-b" data-d="1" aria-label="Increase">[ + ]</button></span>';
}
function bindSteppers(root, cb) {
  $$(".tm-step", root).forEach((el) => {
    if (el.dataset.b) return; el.dataset.b = "1";
    el.addEventListener("click", (e) => {
      const b = e.target.closest("[data-d]"); if (!b) return;
      const d = Number(b.dataset.d);
      if (el.dataset.key) { const l = cart.find((x) => x.id === el.dataset.key); if (l) setCartQty(el.dataset.key, l.qty + d); }
      if (cb) cb(d, el);
    });
  });
}

/* ---------- product image (photo <-> schematic) ---------- */
function productImage(p, opts) {
  opts = opts || {};
  const hasPhoto = !!p.photo;
  return '<div class="pimg ' + (opts.cls || "") + '" data-pimg>' +
    (hasPhoto
      ? '<div class="pimg-photo" data-view="photo"><img src="img/' + p.photo + '.jpg" alt="' + esc(p.name) + '" loading="lazy" onerror="this.closest(\'[data-pimg]\').dataset.nophoto=\'1\'"></div>'
      : "") +
    '<div class="pimg-schem" data-view="schem">' + p.diagram + '</div>' +
    (hasPhoto
      ? (opts.toggle !== false
          ? '<div class="pimg-tabs"><button type="button" data-pv="photo" class="on">PHOTO</button><button type="button" data-pv="schem">SCHEMATIC</button></div>'
          : "")
      : '<div class="pimg-tag">SCHEMATIC ONLY</div>') +
  '</div>';
}
function bindPImg(root) {
  $$("[data-pimg]", root).forEach((el) => {
    if (el.dataset.nophoto) el.dataset.view = "schem";
    else el.dataset.view = el.dataset.view || "photo";
    $$("[data-pv]", el).forEach((b) => b.addEventListener("click", () => {
      el.dataset.view = b.dataset.pv;
      $$("[data-pv]", el).forEach((x) => x.classList.toggle("on", x === b));
    }));
  });
}

/* ---------- spec gauges ---------- */
function gaugeCluster(m) {
  const rows = [["BATTERY", m.battery], ["PORTABILITY", m.portability], ["CAPABILITY", m.capability], ["VALUE", m.value]];
  return '<div class="gauges">' + rows.map(([k, v]) =>
    '<div class="gauge"><span class="gauge-k">' + k + '</span>' +
    '<span class="gauge-bar">' + [1, 2, 3, 4, 5].map((i) => '<i class="' + (i <= v ? "on" : "") + '"></i>').join("") + '</span></div>'
  ).join("") + "</div>";
}

/* ---------- product card ---------- */
function card(p) {
  const r = ratingFor(p.id);
  const st = effStock(p);
  const stockCls = st === 0 ? "out" : st <= 3 ? "low" : "";
  const stockTxt = st === 0 ? "OUT OF STOCK" : st <= 3 ? "LOW STOCK / " + st + " LEFT" : "IN BAY: " + st;
  return '<article class="pcard" data-id="' + p.id + '">' +
    '<button type="button" class="pcard-save' + (isSaved(p.id) ? " on" : "") + '" data-save="' + p.id + '" aria-label="Save" aria-pressed="' + isSaved(p.id) + '">[' + (isSaved(p.id) ? "*" : "+") + ']</button>' +
    '<a class="pcard-hit" href="product.html#' + p.id + '">' +
      '<span class="pcard-cat">' + p.category + '</span>' +
      productImage(p, { toggle: false, cls: "card" }) +
      '<h3 class="pcard-name">' + esc(p.name) + '</h3>' +
      (r ? '<div class="pcard-rate">' + stars(r.avg, "sm") + '<span>' + r.avg.toFixed(1) + '</span></div>' : '<div class="pcard-rate muted">NO REPORTS</div>') +
      '<span class="pcard-price">' + money(p.price) + '</span>' +
      '<span class="pcard-stock ' + stockCls + '">' + stockTxt + '</span>' +
    '</a>' +
    '<div class="pcard-actions">' +
      '<button type="button" class="btn btn-primary btn-sm" data-add="' + p.id + '"' + (st === 0 ? " disabled" : "") + '>+ CART</button>' +
      '<a class="btn btn-ghost btn-sm" href="product.html#' + p.id + '">SPEC</a>' +
      '<button type="button" class="btn btn-text btn-sm cmp' + (compareIds.indexOf(p.id) >= 0 ? " on" : "") + '" data-cmp="' + p.id + '">' + (compareIds.indexOf(p.id) >= 0 ? "x CMP" : "CMP") + '</button>' +
    '</div>' +
  '</article>';
}
function bindCards(root) {
  bindPImg(root);
  $$("[data-save]", root).forEach((b) => b.addEventListener("click", (e) => {
    e.preventDefault(); toggleSave(b.dataset.save);
    const on = isSaved(b.dataset.save);
    b.classList.toggle("on", on); b.textContent = "[" + (on ? "*" : "+") + "]"; b.setAttribute("aria-pressed", String(on));
  }));
  $$("[data-add]", root).forEach((b) => b.addEventListener("click", () => addToCart(b.dataset.add, 1)));
  $$("[data-cmp]", root).forEach((b) => b.addEventListener("click", () => { toggleCompare(b.dataset.cmp); }));
}

/* ============================================================
   COMMAND PALETTE
   ============================================================ */
function mountPalette() {
  const el = document.createElement("div");
  el.className = "palette"; el.id = "palette"; el.hidden = true;
  el.innerHTML =
    '<div class="palette-box">' +
      '<div class="palette-line"><span class="palette-prompt">terminal:~$</span>' +
      '<input type="text" id="palette-input" autocomplete="off" spellcheck="false" placeholder="type a command - help"></div>' +
      '<div class="palette-hint" id="palette-hint"></div>' +
    '</div>';
  document.body.appendChild(el);
  const input = $("#palette-input"), hint = $("#palette-hint");
  const open = () => { el.hidden = false; input.value = ""; hint.textContent = ""; setTimeout(() => input.focus(), 10); };
  const close = () => { el.hidden = true; };
  window.__palette = { open, close };

  document.addEventListener("keydown", (e) => {
    const t = document.activeElement;
    const typing = /^(INPUT|TEXTAREA)$/.test(t.tagName) && t.id !== "palette-input";
    if (!typing && (e.key === ":" || (e.key === "k" && (e.ctrlKey || e.metaKey)))) { e.preventDefault(); open(); }
    if (e.key === "Escape" && !el.hidden) close();
  });
  el.addEventListener("click", (e) => { if (e.target === el) close(); });

  const COMMANDS = [
    ["help", "list commands"],
    ["catalog", "-> the catalog"],
    ["compare", "-> comparison buffer"],
    ["build", "-> build a rig"],
    ["intel", "-> field intel"],
    ["saved", "-> saved units"],
    ["cart", "-> cart"],
    ["find <q>", "search the catalog for q"],
    ["open <name>", "open a product by name"],
    ["clear", "clear compare buffer"]
  ];
  input.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const raw = input.value.trim().toLowerCase();
    if (!raw) return;
    const [cmd, ...rest] = raw.split(/\s+/);
    const arg = rest.join(" ");
    const go = (u) => { location.href = u; };
    if (cmd === "help") { hint.innerHTML = COMMANDS.map((c) => '<span><b>' + c[0] + '</b> - ' + c[1] + '</span>').join(""); return; }
    if (cmd === "catalog" || cmd === "home") return go("index.html");
    if (cmd === "compare") return go("compare.html");
    if (cmd === "build") return go("build.html");
    if (cmd === "intel") return go("intel.html");
    if (cmd === "saved") return go("saved.html");
    if (cmd === "cart") return go("cart.html");
    if (cmd === "clear") { compareIds = []; saveCompare(); toast("compare buffer cleared"); close(); if (pageRepaint) pageRepaint(); return; }
    if (cmd === "find" || cmd === "grep" || cmd === "search") {
      if (!arg) { hint.textContent = "usage: find <query>"; return; }
      try { sessionStorage.setItem("tm_query", arg); } catch (e2) {}
      return go("index.html");
    }
    if (cmd === "open" || cmd === "cd") {
      const hit = PRODUCTS.find((p) => p.name.toLowerCase().includes(arg) || p.id === arg);
      if (hit) return go("product.html#" + hit.id);
      hint.textContent = "no unit matches \"" + arg + "\"";
      return;
    }
    hint.textContent = "unknown command: " + cmd + "  (try: help)";
  });
}

/* ============================================================
   PAGES
   ============================================================ */
const pages = {};

/* ---- CATALOG ---- */
pages.catalog = function () {
  const main = $("#main");
  let q = "", cat = "all", sort = "newest", inStock = false;
  const tagSet = new Set();
  let pMin = 0, pMax = 260;
  try { const sq = sessionStorage.getItem("tm_query"); if (sq) { q = sq; sessionStorage.removeItem("tm_query"); } } catch (e) {}
  if (location.hash) { const h = decodeURIComponent(location.hash.slice(1)); if (CATEGORIES.indexOf(h) !== -1) cat = h; }

  main.innerHTML =
    '<section class="toolbar">' +
      '<label class="field"><span class="field-label">search &gt;</span>' +
        '<input id="q" type="text" placeholder="name, category, spec, tag..." autocomplete="off" value="' + esc(q) + '"></label>' +
      '<label class="field"><span class="field-label">category</span><select id="cat">' +
        '<option value="all">ALL CATEGORIES</option>' + CATEGORIES.map((c) => '<option value="' + c + '"' + (c === cat ? " selected" : "") + ">" + c.toUpperCase() + "</option>").join("") +
      '</select></label>' +
      '<label class="field"><span class="field-label">sort</span><select id="sort">' +
        '<option value="newest">NEWEST</option><option value="price-asc">PRICE LOW</option><option value="price-desc">PRICE HIGH</option>' +
        '<option value="name">NAME A-Z</option><option value="rating">TOP RATED</option><option value="light">LIGHTEST</option>' +
      '</select></label>' +
      '<button type="button" class="btn btn-ghost btn-sm" id="filters-toggle">[ FILTERS ]</button>' +
      '<div class="field results-count"><span class="field-label">results</span><span id="rc">--</span></div>' +
    '</section>' +
    '<section class="filter-panel" id="filter-panel" hidden>' +
      '<div class="fp-block"><span class="field-label">price band</span>' +
        '<div class="price-band">' + stepperHTML(pMin, null) + '<span class="pb-sep">..</span>' + stepperHTML(pMax, null) +
        '<span class="pb-out" id="pb-out"></span></div></div>' +
      '<div class="fp-block"><span class="field-label">tags</span><div class="tag-chips" id="tag-chips">' +
        ALL_TAGS.map((t) => '<button type="button" class="tchip" data-tag="' + t + '">' + t + '</button>').join("") + '</div></div>' +
      '<label class="fp-check"><input type="checkbox" id="instock"> in stock only</label>' +
      '<button type="button" class="btn btn-text btn-sm" id="fp-reset">reset filters</button>' +
    '</section>' +
    '<div id="catalog" class="catalog"></div>' +
    '<p id="empty" class="empty-state" hidden>&gt; NO RECORDS MATCH QUERY. ADJUST FILTERS.</p>' +
    '<section id="recent-rail" class="recent-rail"></section>';

  const steppers = $$("#filter-panel .tm-step");
  bindSteppers($("#filter-panel"), (d, el) => {
    const isMin = steppers.indexOf(el) === 0;
    if (isMin) pMin = clamp(pMin + d * 10, 0, pMax);
    else pMax = clamp(pMax + d * 10, pMin, 400);
    steppers[0].querySelector("[data-v]").textContent = pMin;
    steppers[1].querySelector("[data-v]").textContent = pMax;
    draw();
  });

  function list() {
    let arr = PRODUCTS.slice();
    if (cat !== "all") arr = arr.filter((p) => p.category === cat);
    if (inStock) arr = arr.filter((p) => effStock(p) > 0);
    arr = arr.filter((p) => p.price >= pMin && p.price <= pMax);
    if (tagSet.size) arr = arr.filter((p) => Array.from(tagSet).every((t) => p.tags.indexOf(t) !== -1));
    const qq = q.trim().toLowerCase();
    if (qq) arr = arr.filter((p) => (p.name + " " + p.category + " " + p.tagline + " " + p.tags.join(" ") + " " + p.specs.flat().join(" ")).toLowerCase().includes(qq));
    if (sort === "price-asc") arr.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") arr.sort((a, b) => b.price - a.price);
    else if (sort === "name") arr.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "rating") arr.sort((a, b) => ((ratingFor(b.id) || {}).avg || 0) - ((ratingFor(a.id) || {}).avg || 0));
    else if (sort === "light") arr.sort((a, b) => a.weight - b.weight);
    else arr.sort((a, b) => b.year - a.year);
    return arr;
  }
  function draw() {
    const arr = list();
    $("#rc").textContent = String(arr.length).padStart(2, "0");
    $("#pb-out").textContent = money(pMin) + " - " + money(pMax);
    $("#empty").hidden = arr.length > 0;
    $("#catalog").innerHTML = arr.map(card).join("");
    bindCards($("#catalog"));
    drawRecent();
  }
  function drawRecent() {
    const ids = rd(K.recent, []).filter((id) => prod(id)).slice(0, 5);
    const rail = $("#recent-rail");
    if (!ids.length) { rail.innerHTML = ""; return; }
    rail.innerHTML = '<h2 class="rail-h">&gt; recently_viewed</h2><div class="rail-strip">' +
      ids.map((id) => { const p = prod(id); return '<a class="rail-item" href="product.html#' + id + '">' +
        (p.photo ? '<img src="img/' + p.photo + '.jpg" alt="" onerror="this.style.display=\'none\'">' : '<span class="rail-schem">' + p.diagram + '</span>') +
        '<span>' + esc(p.name) + '</span></a>'; }).join("") + '</div>';
  }

  draw();
  $("#q").addEventListener("input", (e) => { q = e.target.value; draw(); });
  enhanceSelect($("#cat")); $("#cat").addEventListener("change", (e) => { cat = e.target.value; draw(); });
  enhanceSelect($("#sort")); $("#sort").addEventListener("change", (e) => { sort = e.target.value; draw(); });
  $("#filters-toggle").addEventListener("click", () => { const fp = $("#filter-panel"); fp.hidden = !fp.hidden; });
  $("#instock").addEventListener("change", (e) => { inStock = e.target.checked; draw(); });
  $$("#tag-chips .tchip").forEach((b) => b.addEventListener("click", () => {
    b.classList.toggle("on");
    if (tagSet.has(b.dataset.tag)) tagSet.delete(b.dataset.tag); else tagSet.add(b.dataset.tag);
    draw();
  }));
  $("#fp-reset").addEventListener("click", () => {
    tagSet.clear(); inStock = false; pMin = 0; pMax = 260;
    $("#instock").checked = false;
    $$("#tag-chips .tchip").forEach((b) => b.classList.remove("on"));
    steppers[0].querySelector("[data-v]").textContent = pMin;
    steppers[1].querySelector("[data-v]").textContent = pMax;
    draw();
  });
  pageRepaint = draw;
};

/* ---- PRODUCT ---- */
pages.product = function () {
  const main = $("#main");
  function render() {
    const p = prod(decodeURIComponent(location.hash.slice(1)));
    if (!p) { main.innerHTML = '<div class="pad"><p class="empty-state">&gt; UNIT NOT IN DATABASE. <a href="index.html">back to catalog</a></p></div>'; return; }
    pushRecent(p.id);
    let qty = 1;
    const r = ratingFor(p.id);
    const st = effStock(p);
    const related = PRODUCTS.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 3);

    main.innerHTML =
      '<div class="crumb"><a href="index.html">&gt; catalog</a> / <a href="index.html#' + p.category + '">' + p.category.toLowerCase() + '</a> / <span>' + esc(p.id) + '</span></div>' +
      '<article class="pdetail">' +
        '<div class="pd-visual">' + productImage(p, { cls: "detail" }) + '</div>' +
        '<div class="pd-info">' +
          '<span class="pd-cat">' + p.category + '</span>' +
          '<div class="pd-titlerow"><h1>' + esc(p.name) + '</h1>' +
            '<button type="button" class="save-btn' + (isSaved(p.id) ? " on" : "") + '" id="pd-save" aria-pressed="' + isSaved(p.id) + '">[' + (isSaved(p.id) ? "* SAVED" : "+ SAVE") + ']</button></div>' +
          (r ? '<div class="pd-rate">' + stars(r.avg) + '<span>' + r.avg.toFixed(1) + ' / ' + r.count + ' field report' + (r.count === 1 ? "" : "s") + '</span></div>' : "") +
          '<div class="pd-price">' + money(p.price) + '</div>' +
          '<p class="pd-desc">' + esc(p.tagline) + '</p>' +
          '<div class="pd-tags">' + p.tags.map((t) => '<span class="ptag">' + t + '</span>').join("") + '</div>' +
          '<table class="spec-table">' + p.specs.map(([k, v]) => '<tr><td>' + esc(k) + '</td><td>' + esc(v) + '</td></tr>').join("") + '</table>' +
          '<div class="pd-gauges"><span class="mini-h">&gt; unit_profile</span>' + gaugeCluster(p.metrics) + '</div>' +
          '<div class="pd-stock ' + (st === 0 ? "out" : st <= 3 ? "low" : "") + '">' + (st === 0 ? "OUT OF STOCK" : st <= 3 ? "LOW STOCK - " + st + " IN BAY" : "IN BAY: " + st + " UNITS") + '</div>' +
          '<div class="pd-buy">' + stepperHTML(qty, null) +
            '<button type="button" class="btn btn-primary" id="pd-add"' + (st === 0 ? " disabled" : "") + '>ADD TO CART</button>' +
            '<button type="button" class="btn btn-ghost" id="pd-cmp">' + (compareIds.indexOf(p.id) >= 0 ? "x IN COMPARE" : "+ COMPARE") + '</button>' +
          '</div>' +
        '</div>' +
      '</article>' +
      '<section class="pd-related"><h2 class="mini-h">&gt; related_units</h2><div class="catalog sm">' + related.map(card).join("") + '</div></section>' +
      '<section class="pd-reviews"><h2 class="mini-h">&gt; field_reports</h2>' +
        '<div id="review-list"></div>' +
        '<form class="review-form" id="review-form">' +
          '<span class="mini-h">&gt; log_report</span>' +
          '<div class="rf-row"><label>handle <input type="text" id="rf-name" maxlength="24"></label>' +
          '<label>rating <select id="rf-stars"><option value="5">5 / 5</option><option value="4">4 / 5</option><option value="3">3 / 5</option><option value="2">2 / 5</option><option value="1">1 / 5</option></select></label></div>' +
          '<label class="rf-text">report <textarea id="rf-text" rows="2" maxlength="240"></textarea></label>' +
          '<button type="submit" class="btn btn-primary btn-sm">TRANSMIT</button><span class="field-err" id="rf-err"></span>' +
        '</form>' +
      '</section>';

    bindPImg(main);
    bindCards($(".pd-related"));
    $("#pd-save").addEventListener("click", () => {
      toggleSave(p.id);
      const on = isSaved(p.id);
      $("#pd-save").classList.toggle("on", on);
      $("#pd-save").textContent = "[" + (on ? "* SAVED" : "+ SAVE") + "]";
    });
    bindSteppers($(".pd-buy"), (d) => { qty = clamp(qty + d, 1, st || 9); $(".pd-buy [data-v]").textContent = qty; });
    $("#pd-add").addEventListener("click", () => addToCart(p.id, qty));
    $("#pd-cmp").addEventListener("click", () => { toggleCompare(p.id); $("#pd-cmp").textContent = compareIds.indexOf(p.id) >= 0 ? "x IN COMPARE" : "+ COMPARE"; });

    function drawReviews() {
      $("#review-list").innerHTML = reviewsFor(p.id).map((rv) =>
        '<div class="review"><div class="review-head"><span class="review-name">' + esc(rv.name) + '</span>' + stars(rv.stars, "sm") + '</div><p>' + esc(rv.text) + '</p></div>'
      ).join("") || '<p class="muted">No field reports logged.</p>';
    }
    drawReviews();
    enhanceSelect($("#rf-stars"));
    $("#review-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const nm = $("#rf-name").value.trim(), tx = $("#rf-text").value.trim();
      if (nm.length < 2) { $("#rf-err").textContent = "handle required"; return; }
      if (tx.length < 4) { $("#rf-err").textContent = "report too short"; return; }
      const all = rd(K.reviews, {});
      (all[p.id] = all[p.id] || []).push({ name: nm, stars: Number($("#rf-stars").value), text: tx });
      wr(K.reviews, all);
      e.target.reset(); enhanceSelect($("#rf-stars")); $("#rf-err").textContent = "";
      render();
      toast("field report transmitted");
    });
  }
  render();
  window.addEventListener("hashchange", () => location.reload());
};

/* ---- COMPARE ---- */
pages.compare = function () {
  const main = $("#main");
  if (location.hash) {
    const ids = decodeURIComponent(location.hash.slice(1)).split(",").filter((id) => prod(id));
    if (ids.length) { compareIds = ids.slice(0, 4); saveCompare(); }
  }
  function draw() {
    const picks = compareIds.map(prod).filter(Boolean);
    main.innerHTML =
      '<div class="page-head"><h1>&gt; DIFF --spec-compare</h1><p class="head-sub">Rows where the units differ are flagged. On numeric specs the standout value is highlighted.</p></div>' +
      (picks.length >= 2 ? compareTable(picks) : "") +
      '<section class="cmp-picker"><h2 class="mini-h">&gt; ' + (picks.length ? "add / swap units" : "select 2 to 4 units") + '</h2>' +
        '<div class="catalog sm">' + PRODUCTS.map((p) => {
          const on = compareIds.indexOf(p.id) >= 0;
          return '<button type="button" class="cmp-pick' + (on ? " on" : "") + '" data-pick="' + p.id + '">' +
            (p.photo ? '<img src="img/' + p.photo + '.jpg" alt="" onerror="this.style.display=\'none\'">' : '<span class="rail-schem">' + p.diagram + '</span>') +
            '<span class="cmp-pick-name">' + esc(p.name) + '</span><span class="cmp-pick-flag">' + (on ? "[ x ]" : "[ + ]") + '</span></button>';
        }).join("") + '</div>' +
        (picks.length ? '<button type="button" class="btn btn-text btn-sm" id="cmp-clear">clear buffer</button>' : "") +
      '</section>';
    $$("[data-pick]", main).forEach((b) => b.addEventListener("click", () => { toggleCompare(b.dataset.pick); draw(); }));
    const cl = $("#cmp-clear"); if (cl) cl.addEventListener("click", () => { compareIds = []; saveCompare(); draw(); });
    $$("[data-rm-cmp]", main).forEach((b) => b.addEventListener("click", () => { toggleCompare(b.dataset.rmCmp); draw(); }));
    bindPImg(main);
  }
  function compareTable(picks) {
    const keys = [];
    picks.forEach((p) => p.specs.forEach(([k]) => { if (keys.indexOf(k) === -1) keys.push(k); }));
    const numOf = (s) => { const m = String(s).match(/-?\d+(\.\d+)?/); return m ? parseFloat(m[0]) : null; };
    const diffRow = (label, vals, higherBetter) => {
      const nums = vals.map(numOf);
      const distinct = new Set(vals.map((v) => String(v).trim().toLowerCase())).size > 1;
      let best = null;
      if (higherBetter != null && nums.every((n) => n != null)) {
        best = higherBetter ? Math.max.apply(null, nums) : Math.min.apply(null, nums);
      }
      return '<tr class="' + (distinct ? "row-diff" : "") + '"><td>' + esc(label) + '</td>' +
        vals.map((v, i) => '<td class="' + (best != null && nums[i] === best ? "cell-best" : "") + '">' + esc(v) + (best != null && nums[i] === best ? ' <span class="best-mark">^</span>' : "") + '</td>').join("") + '</tr>';
    };
    return '<div class="cmp-wrap"><table class="compare-table">' +
      '<thead><tr><th>&nbsp;</th>' + picks.map((p) => '<th>' + esc(p.name) + '<button type="button" class="th-rm" data-rm-cmp="' + p.id + '" aria-label="remove">x</button></th>').join("") + '</tr></thead>' +
      '<tbody>' +
        '<tr><td>UNIT</td>' + picks.map((p) => '<td class="cmp-diag">' + (p.photo ? '<img src="img/' + p.photo + '.jpg" alt="" onerror="this.style.display=\'none\'">' : p.diagram) + '</td>').join("") + '</tr>' +
        '<tr class="row-diff"><td>CATEGORY</td>' + picks.map((p) => '<td>' + p.category + '</td>').join("") + '</tr>' +
        diffRow("PRICE", picks.map((p) => money(p.price)), false) +
        diffRow("WEIGHT", picks.map((p) => p.weight + "g"), false) +
        diffRow("RATING", picks.map((p) => { const rr = ratingFor(p.id); return rr ? rr.avg.toFixed(1) : "-"; }), true) +
        keys.map((k) => diffRow(k, picks.map((p) => { const f = p.specs.find(([kk]) => kk === k); return f ? f[1] : "-"; }), null)).join("") +
      '</tbody></table></div>';
  }
  draw();
  pageRepaint = draw;
};

/* ---- BUILD A RIG ---- */
pages.build = function () {
  const main = $("#main");
  const slots = { Audio: "", Wearables: "", Peripherals: "", Home: "" };
  if (location.hash.startsWith("#rig=")) {
    decodeURIComponent(location.hash.slice(5)).split(".").forEach((id) => { const p = prod(id); if (p) slots[p.category] = id; });
  }
  main.innerHTML =
    '<div class="page-head"><h1>&gt; BUILD --rig</h1><p class="head-sub">One unit per bay. The console totals price, mass and battery reserve as you go.</p></div>' +
    '<div class="rig-grid" id="rig-grid"></div>' +
    '<div class="rig-console" id="rig-console"></div>' +
    '<div class="rig-saved" id="rig-saved"></div>';

  function bayOptions(catName) {
    return '<option value="">-- empty --</option>' + PRODUCTS.filter((p) => p.category === catName)
      .map((p) => '<option value="' + p.id + '">' + esc(p.name) + '  (' + money(p.price) + ')</option>').join("");
  }
  $("#rig-grid").innerHTML = CATEGORIES.map((c) =>
    '<div class="rig-bay"><span class="bay-k">' + c.toUpperCase() + ' BAY</span>' +
    '<select data-bay="' + c + '">' + bayOptions(c) + '</select>' +
    '<div class="bay-preview" data-bprev="' + c + '"></div></div>'
  ).join("");
  $$("[data-bay]").forEach((sel) => {
    sel.value = slots[sel.dataset.bay];
    enhanceSelect(sel);
    sel.addEventListener("change", () => { slots[sel.dataset.bay] = sel.value; paint(); });
  });

  function paint() {
    CATEGORIES.forEach((c) => {
      const p = prod(slots[c]);
      const el = $('[data-bprev="' + c + '"]');
      el.innerHTML = p
        ? (p.photo ? '<img src="img/' + p.photo + '.jpg" alt="" onerror="this.style.display=\'none\'">' : '<span class="rail-schem">' + p.diagram + '</span>') + '<span>' + esc(p.name) + '</span>'
        : '<span class="bay-empty">no unit</span>';
      el.classList.toggle("filled", !!p);
    });
    const picked = CATEGORIES.map((c) => prod(slots[c])).filter(Boolean);
    const total = picked.reduce((s, p) => s + p.price, 0);
    const mass = picked.reduce((s, p) => s + p.weight, 0);
    const batt = Math.round(picked.reduce((s, p) => s + p.metrics.battery, 0) / (picked.length || 1) * 20);
    $("#rig-console").innerHTML =
      '<div class="rc-readout">' +
        '<div><span class="rc-k">UNITS</span><span class="rc-v">' + picked.length + ' / 4</span></div>' +
        '<div><span class="rc-k">TOTAL</span><span class="rc-v">' + money(total) + '</span></div>' +
        '<div><span class="rc-k">MASS</span><span class="rc-v">' + (mass >= 1000 ? (mass / 1000).toFixed(2) + " kg" : mass + " g") + '</span></div>' +
        '<div><span class="rc-k">BATT RESERVE</span><span class="rc-v">' + batt + '%</span></div>' +
      '</div>' +
      (picked.length ?
        '<div class="rc-actions">' +
          '<form class="rig-save-form" id="rig-save-form"><input type="text" id="rig-name" placeholder="name this loadout..." maxlength="28"><button type="submit" class="btn btn-ghost btn-sm">SAVE LOADOUT</button></form>' +
          '<button type="button" class="btn btn-primary btn-sm" id="rig-to-cart">ADD RIG TO CART</button>' +
        '</div>' : '<p class="muted">Fill at least one bay.</p>');
    const f = $("#rig-save-form");
    if (f) f.addEventListener("submit", (e) => {
      e.preventDefault();
      const nm = $("#rig-name").value.trim();
      if (nm.length < 2) { toast("name the loadout first", "error"); return; }
      const all = rd(K.rigs, []);
      all.unshift({ name: nm, ids: picked.map((p) => p.id), at: Date.now() });
      wr(K.rigs, all.slice(0, 20));
      $("#rig-name").value = "";
      toast("loadout saved");
      paintSaved();
    });
    const tc = $("#rig-to-cart");
    if (tc) tc.addEventListener("click", () => { picked.forEach((p) => addToCart(p.id, 1)); });
  }
  function paintSaved() {
    const all = rd(K.rigs, []);
    const host = $("#rig-saved");
    if (!all.length) { host.innerHTML = ""; return; }
    host.innerHTML = '<h2 class="mini-h">&gt; saved_loadouts</h2><div class="rig-list">' + all.map((rg, i) =>
      '<div class="rig-row"><div><strong>' + esc(rg.name) + '</strong><p>' + rg.ids.map((id) => esc((prod(id) || {}).name || id)).join(" + ") + '</p>' +
      '<span class="rig-total">' + money(rg.ids.reduce((s, id) => s + ((prod(id) || {}).price || 0), 0)) + '</span></div>' +
      '<div class="rig-row-act"><button type="button" class="btn btn-text btn-sm" data-load="' + i + '">LOAD</button>' +
      '<button type="button" class="btn btn-text btn-sm" data-del="' + i + '">DELETE</button></div></div>'
    ).join("") + '</div>';
    $$("[data-load]", host).forEach((b) => b.addEventListener("click", () => {
      const rg = all[+b.dataset.load];
      CATEGORIES.forEach((c) => { slots[c] = ""; });
      rg.ids.forEach((id) => { const p = prod(id); if (p) slots[p.category] = id; });
      $$("[data-bay]").forEach((sel) => { sel.value = slots[sel.dataset.bay]; sel.dispatchEvent(new Event("change", { bubbles: true })); });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }));
    $$("[data-del]", host).forEach((b) => b.addEventListener("click", () => { all.splice(+b.dataset.del, 1); wr(K.rigs, all); paintSaved(); }));
  }
  paint(); paintSaved();
};

/* ---- FIELD INTEL ---- */
pages.intel = function () {
  const main = $("#main");
  function render() {
    const slug = decodeURIComponent(location.hash.slice(1));
    const art = INTEL.find((a) => a.slug === slug);
    if (art) {
      main.innerHTML =
        '<div class="crumb"><a href="intel.html">&gt; field_intel</a> / <span>' + esc(art.slug) + '</span></div>' +
        '<article class="manpage">' +
          '<div class="man-head"><span>' + esc(art.slug.toUpperCase()) + '(1)</span><span>THE TERMINAL FIELD MANUAL</span><span>' + esc(art.slug.toUpperCase()) + '(1)</span></div>' +
          '<h2 class="man-sec">NAME</h2><p>' + esc(art.title) + ' - ' + esc(art.synopsis) + '</p>' +
          '<h2 class="man-sec">SECTION</h2><p>' + art.section + ' &middot; ' + art.mins + ' min read</p>' +
          '<h2 class="man-sec">DESCRIPTION</h2>' +
          art.body.map((b) => (b.h ? '<h3 class="man-sub">' + esc(b.h) + '</h3>' : "") + '<p>' + esc(b.p) + '</p>').join("") +
          (art.related && art.related.length ? '<h2 class="man-sec">SEE ALSO</h2><div class="catalog sm">' + art.related.map((id) => card(prod(id))).join("") + '</div>' : "") +
        '</article>';
      bindCards(main);
    } else {
      main.innerHTML =
        '<div class="page-head"><h1>&gt; FIELD INTEL</h1><p class="head-sub">Short technical briefs on how these units actually work. Manual-page format.</p></div>' +
        '<div class="intel-list">' + INTEL.map((a) =>
          '<a class="intel-item" href="intel.html#' + a.slug + '">' +
            '<span class="ii-sec">' + a.section + ' &middot; ' + a.mins + ' min</span>' +
            '<h2>' + esc(a.title) + '</h2><p>' + esc(a.synopsis) + '</p>' +
            '<span class="ii-go">read &gt;</span></a>'
        ).join("") + '</div>';
    }
  }
  render();
  window.addEventListener("hashchange", () => location.reload());
};

/* ---- SAVED / WATCHLIST ---- */
pages.saved = function () {
  const main = $("#main");
  function draw() {
    const items = saved.map(prod).filter(Boolean);
    const watch = rd(K.watch, {});
    main.innerHTML =
      '<div class="page-head"><h1>&gt; SAVED --units</h1><p class="head-sub">Bookmarked units, with an optional price watch. Targets are checked against a simulated market drift.</p></div>' +
      (items.length
        ? '<div class="saved-list">' + items.map((p) => {
            const w = watch[p.id];
            const cur = p.price - (marketDrift(p.id));
            const hit = w && cur <= w;
            return '<div class="saved-row">' +
              '<a class="saved-thumb" href="product.html#' + p.id + '">' +
                (p.photo ? '<img src="img/' + p.photo + '.jpg" alt="" onerror="this.style.display=\'none\'">' : '<span class="rail-schem">' + p.diagram + '</span>') + '</a>' +
              '<div class="saved-main">' +
                '<a href="product.html#' + p.id + '"><strong>' + esc(p.name) + '</strong></a>' +
                '<div class="saved-price">list ' + money(p.price) + ' &middot; now <span class="' + (cur < p.price ? "drop" : "") + '">' + money(cur) + '</span>' +
                  (hit ? ' <span class="watch-hit">TARGET HIT</span>' : "") + '</div>' +
                '<div class="watch-ctl">' +
                  (w ? '<span class="watch-set">watching @ ' + money(w) + '</span><button type="button" class="btn btn-text btn-sm" data-unwatch="' + p.id + '">stop</button>'
                     : '<span class="mini-h">set target</span>' + stepperHTML(Math.round(p.price * 0.9), null) + '<button type="button" class="btn btn-ghost btn-sm" data-watch="' + p.id + '">WATCH</button>') +
                '</div>' +
              '</div>' +
              '<button type="button" class="btn btn-text btn-sm" data-unsave="' + p.id + '">unsave</button>' +
            '</div>';
          }).join("") + '</div>' +
          '<div class="saved-foot"><a class="btn btn-ghost btn-sm" href="compare.html#' + saved.slice(0, 4).join(",") + '">COMPARE SAVED</a></div>'
        : '<p class="empty-state">&gt; NO SAVED UNITS. Use [+] on any card.</p>');

    $$("[data-unsave]", main).forEach((b) => b.addEventListener("click", () => { toggleSave(b.dataset.unsave); draw(); }));
    $$("[data-unwatch]", main).forEach((b) => b.addEventListener("click", () => {
      const w = rd(K.watch, {}); delete w[b.dataset.unwatch]; wr(K.watch, w); draw();
    }));
    $$(".saved-row").forEach((row) => {
      const wb = $("[data-watch]", row);
      if (!wb) return;
      const step = $(".tm-step", row);
      let target = Math.round(prod(wb.dataset.watch).price * 0.9);
      bindSteppers(row, (d, el) => { target = clamp(target + d * 5, 5, 500); el.querySelector("[data-v]").textContent = target; });
      wb.addEventListener("click", () => {
        const w = rd(K.watch, {}); w[wb.dataset.watch] = target; wr(K.watch, w);
        toast("price watch set @ " + money(target)); draw();
      });
    });
  }
  function marketDrift(id) {
    // deterministic-ish small drift per id per day
    const d = new Date(); let h = d.getDate() + d.getMonth() * 31;
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
    return (h % 18); // $0-17 off
  }
  draw();
  pageRepaint = draw;
};

/* ---- CART + CHECKOUT ---- */
pages.cart = function () {
  const main = $("#main");
  let step = "items";
  const ship = {};

  function draw() {
    if (step === "items") return drawItems();
    if (step === "shipping") return drawShipping();
    if (step === "confirm") return; // handled by submit
  }
  function drawItems() {
    main.innerHTML =
      '<div class="page-head"><h1>&gt; cart --list</h1></div>' +
      (cart.length
        ? '<div class="cart-lines">' + cart.map((l) => {
            const p = prod(l.id);
            return '<div class="cart-line">' +
              '<a class="cl-thumb" href="product.html#' + p.id + '">' + (p.photo ? '<img src="img/' + p.photo + '.jpg" alt="" onerror="this.style.display=\'none\'">' : '<span class="rail-schem">' + p.diagram + '</span>') + '</a>' +
              '<div class="cl-main"><div class="cl-top"><strong>' + esc(p.name) + '</strong><span>' + money(p.price * l.qty) + '</span></div>' +
              '<div class="cl-meta">' + money(p.price) + ' / unit &middot; ' + effStock(p) + ' in bay</div>' +
              '<div class="cl-ctl">' + stepperHTML(l.qty, p.id) + '<button type="button" class="btn btn-text btn-sm" data-rm="' + p.id + '">REMOVE</button></div></div>' +
            '</div>';
          }).join("") + '</div>' +
          '<div class="cart-foot"><div class="cart-sub"><span>SUBTOTAL</span><span>' + money(cartSubtotal()) + '</span></div>' +
          '<button type="button" class="btn btn-primary btn-block" id="to-ship">PROCEED TO CHECKOUT &gt;</button></div>'
        : '<p class="empty-state">&gt; CART BUFFER EMPTY. <a href="index.html">browse the catalog</a></p>') +
      orderHistoryHTML();
    bindSteppers(main, () => draw());
    $$("[data-rm]", main).forEach((b) => b.addEventListener("click", () => { removeCart(b.dataset.rm); draw(); }));
    const ts = $("#to-ship"); if (ts) ts.addEventListener("click", () => { step = "shipping"; draw(); });
    bindHistory(main);
  }
  function drawShipping() {
    main.innerHTML =
      '<div class="page-head"><h1>&gt; shipping --form</h1></div>' +
      '<form class="ship-form co-card" id="ship-form" novalidate>' +
        fld("name", "full name") + fld("address", "address line") +
        '<div class="fld-row">' + fld("city", "city") + fld("zip", "postal code") + '</div>' +
        fld("country", "country") +
        '<div class="cart-foot"><div class="cart-sub"><span>ORDER TOTAL</span><span>' + money(cartSubtotal()) + '</span></div>' +
        '<div class="co-nav"><button type="button" class="btn btn-ghost" id="ship-back">&lt; BACK</button>' +
        '<button type="submit" class="btn btn-primary" id="ship-submit">SUBMIT ORDER</button></div></div>' +
      '</form>';
    $("#ship-back").addEventListener("click", () => { step = "items"; draw(); });
    $("#ship-form").addEventListener("input", (e) => e.target.classList.remove("field-error"));
    $("#ship-form").addEventListener("submit", (e) => {
      e.preventDefault();
      let ok = true;
      ["name", "address", "city", "zip", "country"].forEach((k) => {
        const el = $("#f-" + k), v = el.value.trim();
        if (!v) { el.classList.add("field-error"); ok = false; } else ship[k] = v;
      });
      if (!ok) { toast("MISSING REQUIRED SHIPPING FIELDS", "error"); return; }
      submitOrder();
    });
  }
  function fld(k, label) {
    return '<label class="field"><span class="field-label">' + label + '</span><input id="f-' + k + '" type="text" autocomplete="off"></label>';
  }
  function submitOrder() {
    const orderId = "TRM-" + Array.from({ length: 6 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 31)]).join("");
    const items = cart.map((l) => ({ id: l.id, name: prod(l.id).name, qty: l.qty, price: prod(l.id).price }));
    const total = cartSubtotal();
    const count = cartCount();
    // decrement stock (session)
    const sm = soldMap();
    cart.forEach((l) => { sm[l.id] = (sm[l.id] || 0) + l.qty; });
    wr(K.sold, sm);
    const orders = rd(K.orders, []);
    orders.unshift({ id: orderId, at: Date.now(), items: items, total: total, ship: Object.assign({}, ship) });
    wr(K.orders, orders.slice(0, 20));
    cart = []; wr(K.cart, cart); paintCounts();
    step = "confirm";

    const lines = [
      "$ submit_order --items=" + count + " --total=" + money(total),
      "",
      "> validating shipping payload ......... OK",
      "> ship_to: " + ship.name,
      "> address: " + ship.address + ", " + ship.city + " " + ship.zip,
      "> region:  " + ship.country,
      "> reserving inventory ................. OK",
      "> generating order record ............. OK",
      "",
      'ORDER CONFIRMED - <span class="order-id">' + orderId + '</span>',
      "",
      "no payment was processed. no data left this device.",
      "> session complete.",
    ];
    main.innerHTML = '<div class="page-head"><h1>&gt; order --confirm</h1></div><pre id="confirm-log" class="confirm-log"></pre>' +
      '<div class="co-nav center"><a class="btn btn-ghost" href="index.html">NEW SESSION</a></div>' + orderHistoryHTML();
    const cl = $("#confirm-log");
    let i = 0;
    (function pr() {
      if (i >= lines.length) { bindHistory(main); return; }
      const div = document.createElement("div"); div.innerHTML = lines[i]; cl.appendChild(div); i++;
      setTimeout(pr, reduced ? 0 : 150);
    })();
  }
  function orderHistoryHTML() {
    const orders = rd(K.orders, []);
    if (!orders.length) return "";
    return '<section class="order-history"><h2 class="mini-h">&gt; order_history</h2>' +
      orders.map((o) =>
        '<details class="oh-item"><summary><span>' + o.id + '</span><span>' + new Date(o.at).toLocaleDateString() + '</span><span>' + money(o.total) + '</span></summary>' +
        '<div class="oh-body">' + o.items.map((it) => '<div class="oh-line"><span>' + it.qty + ' x ' + esc(it.name) + '</span><span>' + money(it.price * it.qty) + '</span></div>').join("") +
        '<button type="button" class="btn btn-text btn-sm" data-reorder="' + o.id + '">RE-ORDER</button></div></details>'
      ).join("") + '</section>';
  }
  function bindHistory(root) {
    $$("[data-reorder]", root).forEach((b) => b.addEventListener("click", () => {
      const o = rd(K.orders, []).find((x) => x.id === b.dataset.reorder);
      if (o) { o.items.forEach((it) => addToCart(it.id, it.qty)); step = "items"; draw(); }
    }));
  }
  draw();
  pageRepaint = () => { if (step === "items") draw(); };
};

/* ============================================================
   BOOT (index only)
   ============================================================ */
const BOOT_LINES = [
  "TERMINAL SYSTEMS BIOS v3.2",
  "> initializing display buffer ......... OK",
  "> mounting spec database ............... OK",
  "> loading catalog [12 units] ........... OK",
  "> calibrating HUD overlay .............. OK",
  "> restoring cart from local storage .... OK",
  "> handshake: mission control ........... OK",
  "",
  "welcome. type nothing - just browse. press : for commands.",
];
function runBoot(done) {
  const boot = document.createElement("div");
  boot.id = "boot-screen";
  boot.innerHTML = '<div class="boot-inner"><pre id="boot-log" class="boot-log"></pre><div class="boot-bar"><div class="boot-bar-fill" id="boot-bar-fill"></div></div></div>';
  document.body.appendChild(boot);
  if (reduced) { boot.remove(); done(); return; }
  const logEl = $("#boot-log"), barEl = $("#boot-bar-fill");
  let li = 0, ci = 0, built = "";
  (function typeNext() {
    if (li >= BOOT_LINES.length) {
      barEl.style.width = "100%";
      setTimeout(() => { boot.classList.add("boot-done"); done(); setTimeout(() => boot.remove(), 320); }, 240);
      return;
    }
    const line = BOOT_LINES[li];
    if (ci <= line.length) {
      logEl.innerHTML = built + line.slice(0, ci) + '<span class="boot-cur">&#9608;</span>';
      ci++;
      barEl.style.width = Math.round(((li + ci / Math.max(line.length, 1)) / BOOT_LINES.length) * 100) + "%";
      setTimeout(typeNext, line.length === 0 ? 40 : 11);
    } else { built += line + "\n"; li++; ci = 0; setTimeout(typeNext, 55); }
  })();
}

/* ============================================================
   INIT
   ============================================================ */
function start() {
  renderChrome();
  mountPalette();
  paintCounts();
  if (pages[PAGE]) pages[PAGE]();
}
if (PAGE === "catalog" && !reduced) {
  document.body.classList.add("booting");
  runBoot(() => { document.body.classList.remove("booting"); start(); });
} else {
  start();
}

})();
