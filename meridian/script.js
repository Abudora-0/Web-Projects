/* ── Config ──────────────────────────────────────── */
const DAYS   = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

let use24h = false;
let timezone = "local"; // "local" or IANA string

/* ── Build tick marks & numbers ─────────────────── */
function buildClockFace() {
  const ticksG   = document.getElementById("ticks");
  const numbersG = document.getElementById("numbers");
  const cx = 150, cy = 150, r = 138;

  // 60 ticks total (12 major + 48 minor)
  for (let i = 0; i < 60; i++) {
    const angle  = (i * 6 - 90) * (Math.PI / 180);
    const isMajor = i % 5 === 0;
    const len    = isMajor ? 14 : 7;
    const width  = isMajor ? 2.5 : 1;
    const r1     = r - 4;
    const r2     = r1 - len;

    const x1 = cx + r1 * Math.cos(angle);
    const y1 = cy + r1 * Math.sin(angle);
    const x2 = cx + r2 * Math.cos(angle);
    const y2 = cy + r2 * Math.sin(angle);

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1); line.setAttribute("y1", y1);
    line.setAttribute("x2", x2); line.setAttribute("y2", y2);
    line.setAttribute("stroke", isMajor ? "var(--tick-major)" : "var(--tick-minor)");
    line.setAttribute("stroke-width", width);
    line.setAttribute("stroke-linecap", "round");
    ticksG.appendChild(line);
  }

  // Hour numbers (1-12)
  const numR = r - 30;
  for (let i = 1; i <= 12; i++) {
    const angle = ((i * 30) - 90) * (Math.PI / 180);
    const x = cx + numR * Math.cos(angle);
    const y = cy + numR * Math.sin(angle);

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", x);
    text.setAttribute("y", y);
    text.setAttribute("fill", "var(--num-color)");
    text.setAttribute("font-size", i % 3 === 0 ? "16" : "12");
    text.setAttribute("font-weight", i % 3 === 0 ? "600" : "400");
    text.textContent = i;
    numbersG.appendChild(text);
  }
}

/* ── Get time in selected timezone ──────────────── */
function getTime() {
  const now = new Date();
  if (timezone === "local") return now;

  // Use Intl to get time parts in the selected timezone
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric", minute: "numeric", second: "numeric",
    hour12: false, fractional: true
  }).formatToParts(now);

  const get = type => parseInt(parts.find(p => p.type === type)?.value || "0");
  const h = get("hour") % 24;
  const m = get("minute");
  const s = get("second");
  const ms = now.getMilliseconds();

  // Return a synthetic Date-like object
  return { getHours: () => h, getMinutes: () => m, getSeconds: () => s,
           getMilliseconds: () => ms, getDay: () => now.getDay(),
           getMonth: () => now.getMonth(), getDate: () => now.getDate(),
           getFullYear: () => now.getFullYear() };
}

function getDateForTZ() {
  const now = new Date();
  if (timezone === "local") return now;

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "long", year: "numeric", month: "short", day: "numeric"
  }).formatToParts(now);

  const get = type => parts.find(p => p.type === type)?.value || "";
  return {
    day: get("weekday"), month: get("month"),
    date: get("day"),    year: get("year")
  };
}

/* ── Rotate hand ─────────────────────────────────── */
function rotate(el, deg) {
  el.style.transform = `rotate(${deg}deg)`;
}

/* ── Main tick ───────────────────────────────────── */
const hourHand   = document.getElementById("hourHand");
const minuteHand = document.getElementById("minuteHand");
const secondHand = document.getElementById("secondHand");
const digitalEl  = document.getElementById("digitalTime");
const dateEl     = document.getElementById("dateDisplay");
const tzLabelEl  = document.getElementById("tzLabel");

function tick() {
  const d  = getTime();
  const h  = d.getHours();
  const m  = d.getMinutes();
  const s  = d.getSeconds();
  const ms = d.getMilliseconds();

  // Smooth degrees (include sub-second precision)
  const secDeg = (s + ms / 1000) * 6;
  const minDeg = (m + s / 60) * 6;
  const hrDeg  = ((h % 12) + m / 60) * 30;

  rotate(hourHand,   hrDeg);
  rotate(minuteHand, minDeg);
  rotate(secondHand, secDeg);

  // Digital time
  const hDisplay = use24h ? h : (h % 12 || 12);
  const hStr = String(hDisplay).padStart(2, "0");
  const mStr = String(m).padStart(2, "0");
  const sStr = String(s).padStart(2, "0");
  const ampm = use24h ? "" : (h >= 12 ? " PM" : " AM");
  digitalEl.textContent = `${hStr}:${mStr}:${sStr}${ampm}`;

  // Date
  const dd = getDateForTZ();
  if (typeof dd.day === "string") {
    dateEl.textContent = `${dd.day}, ${dd.month} ${dd.date}, ${dd.year}`;
  } else {
    dateEl.textContent = `${DAYS[dd.getDay()]}, ${MONTHS[dd.getMonth()]} ${dd.getDate()}, ${dd.getFullYear()}`;
  }

  requestAnimationFrame(tick);
}

/* ── 12/24h toggle ───────────────────────────────── */
document.getElementById("toggleHour").addEventListener("click", function () {
  use24h = !use24h;
  this.textContent = use24h ? "24h" : "12h";
});

/* ── Timezone select ─────────────────────────────── */
document.getElementById("tzSelect").addEventListener("change", function () {
  timezone = this.value;
  const labels = {
    local: "Local Time", "America/New_York": "New York (ET)",
    "America/Los_Angeles": "Los Angeles (PT)", "Europe/London": "London (GMT/BST)",
    "Europe/Paris": "Paris (CET)", "Asia/Dubai": "Dubai (GST)",
    "Asia/Karachi": "Karachi (PKT)", "Asia/Kolkata": "Mumbai (IST)",
    "Asia/Tokyo": "Tokyo (JST)", "Australia/Sydney": "Sydney (AEST)"
  };
  tzLabelEl.textContent = labels[timezone] || timezone;
});

/* ── Theme switcher ──────────────────────────────── */
document.querySelectorAll(".theme-dot").forEach(btn => {
  btn.addEventListener("click", function () {
    document.querySelectorAll(".theme-dot").forEach(b => b.classList.remove("active"));
    this.classList.add("active");
    document.documentElement.setAttribute("data-theme", this.dataset.theme);
    // Rebuild ticks so CSS vars update
    document.getElementById("ticks").innerHTML = "";
    document.getElementById("numbers").innerHTML = "";
    buildClockFace();
  });
});

/* ── Init ────────────────────────────────────────── */
buildClockFace();
requestAnimationFrame(tick);
