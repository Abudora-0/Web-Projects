// ═══ Config ═══
const API_BASE = 'https://open.er-api.com/v6/latest/';
const FR_BASE  = 'https://api.frankfurter.dev/v1';

// Full currency database: code -> [name, country badge, symbol]
const CURRENCY_META = {
  AED:['UAE Dirham','AE','د.إ'],        AFN:['Afghan Afghani','AF','؋'],
  ALL:['Albanian Lek','AL','L'],         AMD:['Armenian Dram','AM','֏'],
  ANG:['Antillian Guilder','CW','ƒ'],    AOA:['Angolan Kwanza','AO','Kz'],
  ARS:['Argentine Peso','AR','$'],       AUD:['Australian Dollar','AU','A$'],
  AWG:['Aruban Florin','AW','ƒ'],        AZN:['Azerbaijani Manat','AZ','₼'],
  BAM:['Bosnian Mark','BA','KM'],        BBD:['Barbadian Dollar','BB','$'],
  BDT:['Bangladeshi Taka','BD','৳'],     BGN:['Bulgarian Lev','BG','лв'],
  BHD:['Bahraini Dinar','BH','.د.ب'],    BIF:['Burundian Franc','BI','FBu'],
  BMD:['Bermudian Dollar','BM','$'],     BND:['Brunei Dollar','BN','$'],
  BOB:['Bolivian Boliviano','BO','Bs'],  BRL:['Brazilian Real','BR','R$'],
  BSD:['Bahamian Dollar','BS','$'],      BTN:['Bhutanese Ngultrum','BT','Nu'],
  BWP:['Botswana Pula','BW','P'],        BYN:['Belarusian Ruble','BY','Br'],
  BZD:['Belize Dollar','BZ','$'],        CAD:['Canadian Dollar','CA','C$'],
  CDF:['Congolese Franc','CD','FC'],     CHF:['Swiss Franc','CH','Fr'],
  CLF:['Chilean Unit of Account','CL','UF'], CLP:['Chilean Peso','CL','$'],
  CNH:['Chinese Yuan (Offshore)','CN','¥'],  CNY:['Chinese Yuan','CN','¥'],
  COP:['Colombian Peso','CO','$'],       CRC:['Costa Rican Colón','CR','₡'],
  CUP:['Cuban Peso','CU','$'],           CVE:['Cape Verdean Escudo','CV','$'],
  CZK:['Czech Koruna','CZ','Kč'],        DJF:['Djiboutian Franc','DJ','Fdj'],
  DKK:['Danish Krone','DK','kr'],        DOP:['Dominican Peso','DO','$'],
  DZD:['Algerian Dinar','DZ','د.ج'],     EGP:['Egyptian Pound','EG','£'],
  ERN:['Eritrean Nakfa','ER','Nfk'],     ETB:['Ethiopian Birr','ET','Br'],
  EUR:['Euro','EU','€'],                 FJD:['Fijian Dollar','FJ','$'],
  FKP:['Falkland Pound','FK','£'],       FOK:['Faroese Króna','FO','kr'],
  GBP:['British Pound','GB','£'],        GEL:['Georgian Lari','GE','₾'],
  GGP:['Guernsey Pound','GG','£'],       GHS:['Ghanaian Cedi','GH','₵'],
  GIP:['Gibraltar Pound','GI','£'],      GMD:['Gambian Dalasi','GM','D'],
  GNF:['Guinean Franc','GN','FG'],       GTQ:['Guatemalan Quetzal','GT','Q'],
  GYD:['Guyanese Dollar','GY','$'],      HKD:['Hong Kong Dollar','HK','HK$'],
  HNL:['Honduran Lempira','HN','L'],     HRK:['Croatian Kuna','HR','kn'],
  HTG:['Haitian Gourde','HT','G'],       HUF:['Hungarian Forint','HU','Ft'],
  IDR:['Indonesian Rupiah','ID','Rp'],   ILS:['Israeli New Shekel','IL','₪'],
  IMP:['Manx Pound','IM','£'],           INR:['Indian Rupee','IN','₹'],
  IQD:['Iraqi Dinar','IQ','ع.د'],        IRR:['Iranian Rial','IR','﷼'],
  ISK:['Icelandic Króna','IS','kr'],     JEP:['Jersey Pound','JE','£'],
  JMD:['Jamaican Dollar','JM','$'],      JOD:['Jordanian Dinar','JO','د.ا'],
  JPY:['Japanese Yen','JP','¥'],         KES:['Kenyan Shilling','KE','KSh'],
  KGS:['Kyrgyzstani Som','KG','с'],      KHR:['Cambodian Riel','KH','៛'],
  KID:['Kiribati Dollar','KI','$'],      KMF:['Comorian Franc','KM','CF'],
  KRW:['South Korean Won','KR','₩'],     KWD:['Kuwaiti Dinar','KW','د.ك'],
  KYD:['Cayman Dollar','KY','$'],        KZT:['Kazakhstani Tenge','KZ','₸'],
  LAK:['Lao Kip','LA','₭'],              LBP:['Lebanese Pound','LB','ل.ل'],
  LKR:['Sri Lankan Rupee','LK','Rs'],    LRD:['Liberian Dollar','LR','$'],
  LSL:['Lesotho Loti','LS','L'],         LYD:['Libyan Dinar','LY','ل.د'],
  MAD:['Moroccan Dirham','MA','د.م.'],   MDL:['Moldovan Leu','MD','L'],
  MGA:['Malagasy Ariary','MG','Ar'],     MKD:['Macedonian Denar','MK','ден'],
  MMK:['Burmese Kyat','MM','K'],         MNT:['Mongolian Tögrög','MN','₮'],
  MOP:['Macanese Pataca','MO','P'],      MRU:['Mauritanian Ouguiya','MR','UM'],
  MUR:['Mauritian Rupee','MU','₨'],      MVR:['Maldivian Rufiyaa','MV','Rf'],
  MWK:['Malawian Kwacha','MW','MK'],     MXN:['Mexican Peso','MX','$'],
  MYR:['Malaysian Ringgit','MY','RM'],   MZN:['Mozambican Metical','MZ','MT'],
  NAD:['Namibian Dollar','NA','$'],      NGN:['Nigerian Naira','NG','₦'],
  NIO:['Nicaraguan Córdoba','NI','C$'],  NOK:['Norwegian Krone','NO','kr'],
  NPR:['Nepalese Rupee','NP','Rs'],      NZD:['New Zealand Dollar','NZ','NZ$'],
  OMR:['Omani Rial','OM','ر.ع.'],        PAB:['Panamanian Balboa','PA','B/.'],
  PEN:['Peruvian Sol','PE','S/'],        PGK:['PNG Kina','PG','K'],
  PHP:['Philippine Peso','PH','₱'],      PKR:['Pakistani Rupee','PK','₨'],
  PLN:['Polish Zloty','PL','zł'],        PYG:['Paraguayan Guaraní','PY','₲'],
  QAR:['Qatari Riyal','QA','ر.ق'],       RON:['Romanian Leu','RO','lei'],
  RSD:['Serbian Dinar','RS','дин'],      RUB:['Russian Ruble','RU','₽'],
  RWF:['Rwandan Franc','RW','FRw'],      SAR:['Saudi Riyal','SA','ر.س'],
  SBD:['Solomon Is. Dollar','SB','$'],   SCR:['Seychellois Rupee','SC','₨'],
  SDG:['Sudanese Pound','SD','ج.س'],     SEK:['Swedish Krona','SE','kr'],
  SGD:['Singapore Dollar','SG','S$'],    SHP:['St. Helena Pound','SH','£'],
  SLE:['Sierra Leonean Leone','SL','Le'],SLL:['Leone (old)','SL','Le'],
  SOS:['Somali Shilling','SO','Sh'],     SRD:['Surinamese Dollar','SR','$'],
  SSP:['South Sudanese Pound','SS','£'], STN:['São Tomé Dobra','ST','Db'],
  SYP:['Syrian Pound','SY','£'],         SZL:['Eswatini Lilangeni','SZ','L'],
  THB:['Thai Baht','TH','฿'],            TJS:['Tajikistani Somoni','TJ','SM'],
  TMT:['Turkmen Manat','TM','m'],        TND:['Tunisian Dinar','TN','د.ت'],
  TOP:['Tongan Paʻanga','TO','T$'],      TRY:['Turkish Lira','TR','₺'],
  TTD:['Trinidad Dollar','TT','$'],      TVD:['Tuvaluan Dollar','TV','$'],
  TWD:['New Taiwan Dollar','TW','NT$'],  TZS:['Tanzanian Shilling','TZ','Sh'],
  UAH:['Ukrainian Hryvnia','UA','₴'],    UGX:['Ugandan Shilling','UG','Sh'],
  USD:['US Dollar','US','$'],            UYU:['Uruguayan Peso','UY','$'],
  UZS:['Uzbekistani Som','UZ','сўм'],    VES:['Venezuelan Bolívar','VE','Bs'],
  VND:['Vietnamese Dong','VN','₫'],      VUV:['Vanuatu Vatu','VU','VT'],
  WST:['Samoan Tala','WS','T'],          XAF:['Central African CFA','CF','FCFA'],
  XCD:['East Caribbean Dollar','AG','$'],XCG:['Caribbean Guilder','CW','ƒ'],
  XDR:['IMF Special Drawing Rights','UN','SDR'], XOF:['West African CFA','SN','CFA'],
  XPF:['CFP Franc','PF','₣'],            YER:['Yemeni Rial','YE','﷼'],
  ZAR:['South African Rand','ZA','R'],   ZMW:['Zambian Kwacha','ZM','ZK'],
  ZWG:['Zimbabwe Gold','ZW','ZiG'],      ZWL:['Zimbabwean Dollar','ZW','$'],
};

const POPULAR_PAIRS = [
  ['EUR','USD'],['GBP','USD'],['USD','JPY'],['USD','PKR'],
  ['USD','INR'],['USD','CNY'],['USD','CAD'],['USD','AED'],
  ['AUD','USD'],['USD','CHF'],
];

const TICKER_PAIRS = [
  ['EUR','USD'],['GBP','USD'],['USD','JPY'],['USD','CHF'],['USD','CAD'],
  ['AUD','USD'],['USD','CNY'],['USD','INR'],['USD','PKR'],['USD','AED'],
  ['USD','TRY'],['USD','BRL'],['USD','KRW'],['USD','MXN'],['USD','ZAR'],
];

// ═══ State ═══
let rates = {};
let baseCode = '';
let lastUpdated = '';
let allCodes = [];
let fromValue = 'USD';
let toValue = 'EUR';
let activeDropdown = null;          // 'from' | 'to' | null
let favorites = JSON.parse(localStorage.getItem('xchange-favs') || '[]');
let frSupported = null;             // Set of frankfurter-supported codes
let frNow = null, frPrev = null;    // frankfurter USD-based snapshots (now / 7d ago)
let chartDays = 30;

// ═══ DOM ═══
const $ = id => document.getElementById(id);
const fromAmountEl = $('fromAmount'), toAmountEl = $('toAmount');
const fromPickerBtn = $('fromPickerBtn'), toPickerBtn = $('toPickerBtn');
const fromFlagEl = $('fromFlag'), toFlagEl = $('toFlag');
const fromCodeEl = $('fromCode'), fromNameEl = $('fromName');
const toCodeEl = $('toCode'), toNameEl = $('toName');
const fromChevron = $('fromChevron'), toChevron = $('toChevron');
const swapBtn = $('swapBtn'), rateBadge = $('rateBadge'), inverseBadge = $('inverseBadge');
const pairsGrid = $('pairsGrid'), resultsGrid = $('resultsGrid');
const searchInput = $('searchInput'), rateTimeEl = $('rateTime');
const themeBtn = $('themeBtn'), themeIcon = $('themeIcon');
const dropdownPanel = $('dropdownPanel'), dropdownSearch = $('dropdownSearch'), dropdownList = $('dropdownList');
const dataStatus = $('dataStatus'), tickerTrack = $('tickerTrack');
const favSection = $('favSection'), favBoard = $('favBoard'), favInfo = $('favInfo');
const chartSection = $('chartSection'), chartCanvas = $('chartCanvas'), chartMeta = $('chartMeta'), chartTitle = $('chartTitle');
const copyResultBtn = $('copyResultBtn'), shareBtn = $('shareBtn');
const allTitle = $('allTitle'), stripInfo = $('stripInfo');

const meta = code => {
  const m = CURRENCY_META[code];
  return m ? { name: m[0], cc: m[1], sym: m[2] } : { name: code, cc: code.slice(0, 2), sym: '' };
};

// ═══ Theme ═══
const savedTheme = localStorage.getItem('xchange-theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

themeBtn.addEventListener('click', () => {
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('xchange-theme', next);
  updateThemeIcon(next);
  drawChart(); // re-render with new palette
});

function updateThemeIcon(theme) {
  themeIcon.innerHTML = theme === 'light'
    ? '<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>'
    : '<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>';
}

// ═══ Station clocks ═══
function tickClocks() {
  const now = new Date();
  const fmt = d => d.toTimeString().slice(0, 8);
  $('clockLocal').textContent = fmt(now);
  $('clockUtc').textContent = now.toISOString().slice(11, 19);
}
tickClocks();
setInterval(tickClocks, 1000);

// ═══ Fetch rates (with offline cache fallback) ═══
async function fetchRates(base) {
  if (base === baseCode && Object.keys(rates).length) return true;
  try {
    showError(null);
    const res = await fetch(API_BASE + base);
    if (!res.ok) throw new Error('Network error');
    const data = await res.json();
    if (data.result !== 'success') throw new Error('API error');
    rates = data.rates;
    baseCode = base;
    lastUpdated = data.time_last_update_utc || '';
    localStorage.setItem('xchange-cache', JSON.stringify({ base, rates, updated: lastUpdated }));
    setStatus('live');
    setUpdatedLabel();
    if (!allCodes.length) {
      allCodes = Object.keys(rates).sort();
      stripInfo.textContent = `${allCodes.length} CURRENCIES · LIVE RATES`;
    }
    return true;
  } catch (e) {
    // fall back to cached rates
    const cached = JSON.parse(localStorage.getItem('xchange-cache') || 'null');
    if (cached && cached.base === base) {
      rates = cached.rates;
      baseCode = base;
      lastUpdated = cached.updated;
      setStatus('offline');
      setUpdatedLabel(' (cached)');
      if (!allCodes.length) allCodes = Object.keys(rates).sort();
      return true;
    }
    setStatus('offline');
    showError('Failed to load rates. Check your connection and try again.');
    return false;
  }
}

function setStatus(state) {
  dataStatus.className = 'data-status ' + state;
  dataStatus.innerHTML = `<span class="status-dot"></span>${state === 'live' ? 'LIVE' : 'OFFLINE'}`;
}

function setUpdatedLabel(suffix = '') {
  if (!lastUpdated) return;
  const d = new Date(lastUpdated);
  rateTimeEl.textContent = 'Rates updated ' + d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + suffix;
}

// ═══ Frankfurter (history + 7-day change) ═══
async function loadFrankfurter() {
  try {
    const [curRes, nowRes] = await Promise.all([
      fetch(`${FR_BASE}/currencies`),
      fetch(`${FR_BASE}/latest?base=USD`),
    ]);
    frSupported = new Set(Object.keys(await curRes.json()));
    frSupported.add('USD');
    const nowData = await nowRes.json();
    frNow = { ...nowData.rates, USD: 1 };
    const prevDate = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
    const prevRes = await fetch(`${FR_BASE}/${prevDate}?base=USD`);
    const prevData = await prevRes.json();
    frPrev = { ...prevData.rates, USD: 1 };
  } catch (e) {
    frSupported = new Set();
  }
}

// % change of pair over last 7 days, or null
function pairChange(from, to) {
  if (!frNow || !frPrev || !frNow[from] || !frNow[to] || !frPrev[from] || !frPrev[to]) return null;
  const now = frNow[to] / frNow[from];
  const prev = frPrev[to] / frPrev[from];
  return (now / prev - 1) * 100;
}

function changeHtml(pct) {
  if (pct === null || !isFinite(pct)) return '<span class="row-change">-</span>';
  const cls = pct > 0.005 ? 'up' : pct < -0.005 ? 'down' : '';
  const arrow = pct > 0.005 ? '▲' : pct < -0.005 ? '▼' : '·';
  return `<span class="row-change ${cls}">${arrow} ${Math.abs(pct).toFixed(2)}%</span>`;
}

// ═══ Ticker ═══
function renderTicker() {
  const items = TICKER_PAIRS
    .filter(([f, t]) => rates[f] && rates[t])
    .map(([f, t]) => {
      const r = rates[t] / rates[f];
      return `<span class="tick-item"><span class="tick-pair">${f}/${t}</span><span class="tick-val">${formatRate(r)}</span></span>`;
    }).join('');
  tickerTrack.innerHTML = items + items; // duplicated for seamless loop
}

// ═══ Custom dropdown ═══
function openDropdown(which) {
  activeDropdown = which;
  const trigger = which === 'from' ? fromPickerBtn : toPickerBtn;
  const rect = trigger.getBoundingClientRect();
  dropdownPanel.style.display = 'block';
  const panelW = Math.min(340, window.innerWidth * 0.92);
  let left = rect.left + window.scrollX;
  if (left + panelW > window.innerWidth - 8) left = window.innerWidth - panelW - 8;
  dropdownPanel.style.left = left + 'px';
  dropdownPanel.style.top = (rect.bottom + window.scrollY + 6) + 'px';
  (which === 'from' ? fromChevron : toChevron).style.transform = 'rotate(180deg)';
  dropdownSearch.value = '';
  renderDropdownList('', which === 'from' ? fromValue : toValue);
  dropdownSearch.focus();
}

function closeDropdown() {
  if (!activeDropdown) return;
  dropdownPanel.style.display = 'none';
  fromChevron.style.transform = '';
  toChevron.style.transform = '';
  activeDropdown = null;
}

function renderDropdownList(query, selectedVal) {
  const q = query.trim().toLowerCase();
  const match = code => !q || code.toLowerCase().includes(q) || meta(code).name.toLowerCase().includes(q);
  const favs = allCodes.filter(c => favorites.includes(c) && match(c));
  const rest = allCodes.filter(c => !favorites.includes(c) && match(c));
  dropdownList.innerHTML = '';
  [...favs, ...rest].forEach(code => {
    const m = meta(code);
    const li = document.createElement('li');
    if (code === selectedVal) li.classList.add('selected');
    li.setAttribute('role', 'option');
    li.innerHTML = `
      <span class="dl-star">${favorites.includes(code) ? '★' : ''}</span>
      <span class="dl-code">${code}</span>
      <span class="dl-name">${m.name}${m.sym ? ' · ' + m.sym : ''}</span>
      <span class="dl-badge">${m.cc}</span>
    `;
    li.addEventListener('mousedown', e => {
      e.preventDefault();
      selectCurrency(activeDropdown, code);
    });
    dropdownList.appendChild(li);
  });
  const sel = dropdownList.querySelector('.selected');
  if (sel) sel.scrollIntoView({ block: 'nearest' });
}

async function selectCurrency(which, code) {
  if (which === 'from') { fromValue = code; await fetchRates(code); }
  else toValue = code;
  updatePickers();
  convert();
  renderAllBoard();
  updateChart();
  closeDropdown();
}

fromPickerBtn.addEventListener('click', () => {
  if (activeDropdown === 'from') return closeDropdown();
  closeDropdown(); openDropdown('from');
});
toPickerBtn.addEventListener('click', () => {
  if (activeDropdown === 'to') return closeDropdown();
  closeDropdown(); openDropdown('to');
});

dropdownSearch.addEventListener('input', () => {
  renderDropdownList(dropdownSearch.value, activeDropdown === 'from' ? fromValue : toValue);
});

document.addEventListener('mousedown', e => {
  if (!dropdownPanel.contains(e.target) &&
      !fromPickerBtn.contains(e.target) && !toPickerBtn.contains(e.target)) {
    closeDropdown();
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeDropdown();
  if (e.target.matches('input')) return;
  if (e.key === 's' || e.key === 'S') swapBtn.click();
  if (e.key === '/') { e.preventDefault(); fromAmountEl.focus(); fromAmountEl.select(); }
});

// ═══ Picker display ═══
function updatePickers() {
  const fm = meta(fromValue), tm = meta(toValue);
  fromFlagEl.textContent = fm.cc;
  toFlagEl.textContent = tm.cc;
  fromCodeEl.textContent = fromValue;
  fromNameEl.textContent = fm.name;
  toCodeEl.textContent = toValue;
  toNameEl.textContent = tm.name;
}

// ═══ Convert + split-flap result ═══
function convert() {
  const amount = parseFloat(fromAmountEl.value);
  if (!fromValue || !toValue || isNaN(amount) || !rates[toValue] || !rates[fromValue]) {
    setFlap('-');
    rateBadge.textContent = 'Fetching rates…';
    inverseBadge.textContent = '';
    return;
  }
  const rate = rates[toValue] / rates[fromValue];
  setFlap(formatNumber(amount * rate));
  const sym = meta(toValue).sym;
  rateBadge.textContent = `1 ${fromValue} = ${formatRate(rate)} ${toValue}${sym ? ' (' + sym + ')' : ''}`;
  inverseBadge.textContent = `1 ${toValue} = ${formatRate(1 / rate)} ${fromValue}`;
  updateUrl();
}

function setFlap(str) {
  toAmountEl.innerHTML = '';
  [...str].forEach((ch, i) => {
    const span = document.createElement('span');
    const sep = ch === ',' || ch === '.' || ch === ' ';
    span.className = 'flap' + (sep ? ' flap--sep' : '');
    span.textContent = ch;
    if (!sep) span.style.animationDelay = (i * 35) + 'ms';
    toAmountEl.appendChild(span);
  });
}

function formatNumber(n) {
  if (n >= 1) return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  return n.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 });
}
function formatRate(r) {
  if (r >= 1) return r.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  return r.toFixed(6);
}

// ═══ Shareable URL ═══
function updateUrl() {
  const params = new URLSearchParams({ from: fromValue, to: toValue, amount: fromAmountEl.value || '1' });
  try { history.replaceState(null, '', location.pathname + '?' + params); } catch (e) { /* file:// blocks this */ }
}

shareBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(location.href).then(() => flashBtn(shareBtn, 'Copied!'));
});

copyResultBtn.addEventListener('click', () => {
  const amount = parseFloat(fromAmountEl.value);
  if (isNaN(amount) || !rates[toValue] || !rates[fromValue]) return;
  const result = amount * (rates[toValue] / rates[fromValue]);
  navigator.clipboard.writeText(`${formatNumber(result)} ${toValue}`).then(() => flashBtn(copyResultBtn, 'Copied!'));
});

function flashBtn(btn, label) {
  const orig = btn.innerHTML;
  btn.classList.add('done');
  btn.innerHTML = label;
  setTimeout(() => { btn.classList.remove('done'); btn.innerHTML = orig; }, 1400);
}

// ═══ Swap / amount / quick amounts ═══
swapBtn.addEventListener('click', async () => {
  [fromValue, toValue] = [toValue, fromValue];
  updatePickers();
  await fetchRates(fromValue);
  convert();
  renderAllBoard();
  updateChart();
});

fromAmountEl.addEventListener('input', () => { convert(); renderAllBoard(); });

document.querySelectorAll('.qa-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    fromAmountEl.value = btn.dataset.val;
    convert();
    renderAllBoard();
  });
});

// ═══ Favorites ═══
function toggleFav(code) {
  favorites = favorites.includes(code) ? favorites.filter(c => c !== code) : [...favorites, code];
  localStorage.setItem('xchange-favs', JSON.stringify(favorites));
  renderFavBoard();
  renderAllBoard();
}

const STAR_SVG = '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
const STAR_OUTLINE_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
const COPY_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>';

// ═══ Currency board rows (favorites + all currencies) ═══
function currencyRow(code) {
  const amount = parseFloat(fromAmountEl.value) || 1;
  const rate = rates[code] / rates[fromValue];
  const converted = amount * rate;
  const m = meta(code);
  const isFav = favorites.includes(code);
  const row = document.createElement('div');
  row.className = 'board-row';
  row.innerHTML = `
    <span class="row-badge">${m.cc}</span>
    <span class="row-code">${code}</span>
    <span class="row-name">${m.name}${m.sym ? `<span class="row-symbol">${m.sym}</span>` : ''}</span>
    <span class="row-rate">${formatNumber(converted)}</span>
    ${changeHtml(pairChange(fromValue, code))}
    <span class="row-actions">
      <button class="icon-btn star-btn ${isFav ? 'starred' : ''}" title="${isFav ? 'Remove from' : 'Add to'} favourites">${isFav ? STAR_SVG : STAR_OUTLINE_SVG}</button>
      <button class="icon-btn copy-btn" title="Copy">${COPY_SVG}</button>
    </span>
  `;
  row.querySelector('.star-btn').addEventListener('click', () => toggleFav(code));
  row.querySelector('.copy-btn').addEventListener('click', function () {
    navigator.clipboard.writeText(`${formatNumber(converted)} ${code}`).then(() => {
      this.classList.add('copied');
      setTimeout(() => this.classList.remove('copied'), 1200);
    });
  });
  return row;
}

function renderFavBoard() {
  const favs = favorites.filter(c => rates[c]);
  favSection.hidden = favs.length === 0;
  if (!favs.length) return;
  favInfo.textContent = `${parseFloat(fromAmountEl.value) || 1} ${fromValue} in your board`;
  favBoard.innerHTML = '';
  favs.forEach(code => favBoard.appendChild(currencyRow(code)));
}

function renderAllBoard() {
  if (!allCodes.length) return;
  const amount = parseFloat(fromAmountEl.value) || 1;
  const query = searchInput.value.trim().toLowerCase();
  allTitle.textContent = `${amount} ${fromValue} IN ALL CURRENCIES`;
  resultsGrid.innerHTML = '';
  allCodes
    .filter(code => !query || code.toLowerCase().includes(query) || meta(code).name.toLowerCase().includes(query))
    .forEach(code => resultsGrid.appendChild(currencyRow(code)));
  renderFavBoard();
}

searchInput.addEventListener('input', renderAllBoard);

// ═══ Popular routes ═══
function renderPopularPairs() {
  pairsGrid.innerHTML = '';
  POPULAR_PAIRS.forEach(([from, to]) => {
    if (!rates[from] || !rates[to]) return;
    const rate = rates[to] / rates[from];
    const row = document.createElement('div');
    row.className = 'board-row clickable';
    row.innerHTML = `
      <span class="route-pair">${from}<span class="route-arrow">/</span>${to}</span>
      <span class="row-name">${meta(from).name} to ${meta(to).name}</span>
      <span class="row-rate">${formatRate(rate)}</span>
      ${changeHtml(pairChange(from, to))}
    `;
    row.addEventListener('click', async () => {
      fromValue = from; toValue = to;
      fromAmountEl.value = 1;
      updatePickers();
      await fetchRates(from);
      convert();
      renderAllBoard();
      updateChart();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    pairsGrid.appendChild(row);
  });
}

// ═══ History chart ═══
let chartData = null;

document.querySelectorAll('.range-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.range-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    chartDays = parseInt(btn.dataset.days, 10);
    updateChart();
  });
});

async function updateChart() {
  if (!frSupported || !frSupported.has(fromValue) || !frSupported.has(toValue) || fromValue === toValue) {
    chartSection.hidden = true;
    return;
  }
  chartSection.hidden = false;
  chartTitle.textContent = `${fromValue}/${toValue} HISTORY`;
  chartMeta.innerHTML = '<span>Loading…</span>';
  try {
    const start = new Date(Date.now() - chartDays * 864e5).toISOString().slice(0, 10);
    const res = await fetch(`${FR_BASE}/${start}..?from=${fromValue}&to=${toValue}`);
    const data = await res.json();
    const points = Object.entries(data.rates)
      .map(([date, obj]) => ({ date, val: obj[toValue] }))
      .sort((a, b) => a.date.localeCompare(b.date));
    if (points.length < 2) throw new Error('no data');
    chartData = points;
    drawChart();
  } catch (e) {
    chartData = null;
    chartMeta.innerHTML = '<span>History unavailable for this pair.</span>';
    const ctx = chartCanvas.getContext('2d');
    ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
  }
}

function drawChart() {
  if (!chartData) return;
  const css = getComputedStyle(document.documentElement);
  const amber = css.getPropertyValue('--amber').trim();
  const line = css.getPropertyValue('--line').trim();
  const faint = css.getPropertyValue('--faint').trim();
  const green = css.getPropertyValue('--green').trim();
  const red = css.getPropertyValue('--red').trim();

  const dpr = window.devicePixelRatio || 1;
  const w = chartCanvas.clientWidth || chartCanvas.parentElement.clientWidth - 40;
  const h = 220;
  chartCanvas.width = w * dpr;
  chartCanvas.height = h * dpr;
  chartCanvas.style.height = h + 'px';
  const ctx = chartCanvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);

  const vals = chartData.map(p => p.val);
  const min = Math.min(...vals), max = Math.max(...vals);
  const pad = (max - min) * 0.12 || max * 0.01;
  const lo = min - pad, hi = max + pad;
  const P = { l: 8, r: 8, t: 10, b: 22 };
  const x = i => P.l + (i / (chartData.length - 1)) * (w - P.l - P.r);
  const y = v => P.t + (1 - (v - lo) / (hi - lo)) * (h - P.t - P.b);

  // gridlines
  ctx.strokeStyle = line;
  ctx.lineWidth = 1;
  for (let g = 0; g <= 3; g++) {
    const gy = P.t + (g / 3) * (h - P.t - P.b);
    ctx.beginPath(); ctx.moveTo(P.l, gy); ctx.lineTo(w - P.r, gy); ctx.stroke();
  }

  // area fill
  ctx.beginPath();
  chartData.forEach((p, i) => i === 0 ? ctx.moveTo(x(i), y(p.val)) : ctx.lineTo(x(i), y(p.val)));
  ctx.lineTo(x(chartData.length - 1), h - P.b);
  ctx.lineTo(x(0), h - P.b);
  ctx.closePath();
  const grad = ctx.createLinearGradient(0, P.t, 0, h - P.b);
  grad.addColorStop(0, amber + '33');
  grad.addColorStop(1, amber + '00');
  ctx.fillStyle = grad;
  ctx.fill();

  // line
  ctx.beginPath();
  chartData.forEach((p, i) => i === 0 ? ctx.moveTo(x(i), y(p.val)) : ctx.lineTo(x(i), y(p.val)));
  ctx.strokeStyle = amber;
  ctx.lineWidth = 2;
  ctx.stroke();

  // end dot
  const last = chartData[chartData.length - 1];
  ctx.beginPath();
  ctx.arc(x(chartData.length - 1), y(last.val), 3.5, 0, Math.PI * 2);
  ctx.fillStyle = amber;
  ctx.fill();

  // date labels
  ctx.fillStyle = faint;
  ctx.font = '10px "IBM Plex Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(chartData[0].date, P.l, h - 6);
  ctx.textAlign = 'right';
  ctx.fillText(last.date, w - P.r, h - 6);

  // meta line
  const first = chartData[0].val;
  const chg = (last.val / first - 1) * 100;
  const cls = chg >= 0 ? 'up' : 'down';
  chartMeta.innerHTML = `
    <span>HIGH <strong>${formatRate(max)}</strong> · LOW <strong>${formatRate(min)}</strong></span>
    <span>PERIOD <span class="${cls}">${chg >= 0 ? '▲' : '▼'} ${Math.abs(chg).toFixed(2)}%</span> · CLOSE <strong>${formatRate(last.val)}</strong></span>
  `;
}

window.addEventListener('resize', () => drawChart());

// ═══ Error ═══
function showError(msg) {
  let el = document.querySelector('.error-msg');
  if (!msg) { if (el) el.remove(); return; }
  if (!el) {
    el = document.createElement('div');
    el.className = 'error-msg';
    document.querySelector('main').prepend(el);
  }
  el.textContent = msg;
}

// ═══ Init ═══
(async function init() {
  // restore state from URL
  const params = new URLSearchParams(location.search);
  const pf = (params.get('from') || '').toUpperCase();
  const pt = (params.get('to') || '').toUpperCase();
  if (/^[A-Z]{3}$/.test(pf)) fromValue = pf;
  if (/^[A-Z]{3}$/.test(pt)) toValue = pt;
  const pa = parseFloat(params.get('amount'));
  if (!isNaN(pa) && pa >= 0) fromAmountEl.value = pa;

  updatePickers();
  const ok = await fetchRates(fromValue);
  if (!ok) return;
  convert();
  renderTicker();
  renderPopularPairs();
  renderAllBoard();

  // history + change data loads in the background, then boards refresh with Δ%
  await loadFrankfurter();
  renderPopularPairs();
  renderAllBoard();
  updateChart();
})();
