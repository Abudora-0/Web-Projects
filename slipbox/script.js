/* ==========================================================
   SLIPBOX - a card-catalogue notebook
   Vanilla JS. Cards in localStorage, markdown-lite render,
   [[wikilinks]] with backlinks.
   ========================================================== */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const STORE = "slipbox.cards";
const uid = () => "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const now = () => Date.now();

let cards = [];
let activeId = null;
let editing = false;
let filterTag = null;
let query = "";
let sort = "updated";

/* ---------- storage ---------- */
function load() {
  try { cards = JSON.parse(localStorage.getItem(STORE)) || []; }
  catch (_) { cards = []; }
  if (!cards.length) seed();
}
function save() {
  try { localStorage.setItem(STORE, JSON.stringify(cards)); } catch (_) {}
}
function seed() {
  const t = now();
  const day = 86400000;
  cards = [
    {
      id: uid(), title: "What a slipbox is",
      body: "A slipbox is a box of small notes, each on its own card, each doing one job.\n\nThe power is not the cards, it is the links. A note earns its place by connecting to another. See [[Writing a good card]] and [[Linking with brackets]].\n\n- one idea per card\n- your own words\n- always link to something",
      tags: ["method", "start"], pinned: true, created: t - 9 * day, updated: t - 5 * 60000,
    },
    {
      id: uid(), title: "Writing a good card",
      body: "# Keep it small\nIf a card needs scrolling, it is two cards.\n\n# Keep it yours\nCopying a quote is filing, not thinking. Rewrite the point so *you* would say it.\n\nRelated: [[What a slipbox is]], [[Linking with brackets]].",
      tags: ["method"], pinned: false, created: t - 6 * day, updated: t - 2 * day,
    },
    {
      id: uid(), title: "Linking with brackets",
      body: "Type `[[` then a card title `]]` to link it. Example: [[What a slipbox is]].\n\nEvery card shows, at the bottom, the other cards that point *to* it. Follow those backlinks and the box starts to think with you.\n\nA link to a card that does not exist yet shows greyed out. That is a to-do.",
      tags: ["method", "how-to"], pinned: false, created: t - 4 * day, updated: t - 26 * 60000,
    },
  ];
  save();
}

/* ---------- markdown-lite ---------- */
function escapeHtml(s) {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}
function renderMarkdown(src) {
  const titles = new Set(cards.map((c) => c.title.toLowerCase()));
  const lines = src.split(/\r?\n/);
  let html = "";
  let inList = false;
  const closeList = () => { if (inList) { html += "</ul>"; inList = false; } };

  for (let raw of lines) {
    const line = raw.trimEnd();
    const h = line.match(/^(#{1,3})\s+(.*)$/);
    if (h) {
      closeList();
      const lvl = h[1].length;
      html += `<h${lvl}>${inline(h[2])}</h${lvl}>`;
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      if (!inList) { html += "<ul>"; inList = true; }
      html += `<li>${inline(line.replace(/^\s*[-*]\s+/, ""))}</li>`;
      continue;
    }
    if (!line.trim()) { closeList(); continue; }
    closeList();
    html += `<p>${inline(line)}</p>`;
  }
  closeList();
  return html;

  function inline(text) {
    let t = escapeHtml(text);
    t = t.replace(/`([^`]+)`/g, "<code>$1</code>");
    t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    t = t.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
    t = t.replace(/\[\[([^\]]+)\]\]/g, (m, name) => {
      const missing = !titles.has(name.trim().toLowerCase());
      return `<a class="wikilink${missing ? " missing" : ""}" data-link="${escapeAttr(name.trim())}">${escapeHtml(name.trim())}</a>`;
    });
    t = t.replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener">$1</a>');
    return t;
  }
}
function escapeAttr(s) { return s.replace(/"/g, "&quot;"); }

/* ---------- links / backlinks ---------- */
function outLinks(card) {
  const set = new Set();
  const re = /\[\[([^\]]+)\]\]/g;
  let m;
  while ((m = re.exec(card.body))) set.add(m[1].trim().toLowerCase());
  return set;
}
function backlinksFor(card) {
  const target = card.title.trim().toLowerCase();
  return cards.filter((c) => c.id !== card.id && outLinks(c).has(target));
}

/* ---------- render: drawer ---------- */
function allTags() {
  const map = new Map();
  cards.forEach((c) => (c.tags || []).forEach((t) => map.set(t, (map.get(t) || 0) + 1)));
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}

function renderTabs() {
  const wrap = $("#tagTabs");
  const tags = allTags();
  wrap.innerHTML = tags
    .map(([t, n]) => `<button class="tab ${filterTag === t ? "on" : ""}" data-tag="${escapeAttr(t)}" type="button">${escapeHtml(t)} ${n}</button>`)
    .join("");
}

function visibleCards() {
  let list = cards.slice();
  if (filterTag) list = list.filter((c) => (c.tags || []).includes(filterTag));
  if (query) {
    const q = query.toLowerCase();
    list = list.filter((c) =>
      c.title.toLowerCase().includes(q) ||
      c.body.toLowerCase().includes(q) ||
      (c.tags || []).some((t) => t.includes(q)));
  }
  const cmp = {
    updated: (a, b) => b.updated - a.updated,
    created: (a, b) => b.created - a.created,
    title: (a, b) => a.title.localeCompare(b.title),
  }[sort];
  list.sort((a, b) => (b.pinned - a.pinned) || cmp(a, b));
  return list;
}

function renderList() {
  const list = visibleCards();
  const ul = $("#cardList");
  $("#boxCount").textContent = cards.length + (cards.length === 1 ? " card" : " cards");
  if (!list.length) {
    ul.innerHTML = `<li style="cursor:default;background:transparent;border:0;color:var(--ink-faint);font-family:var(--font-type);font-size:.8rem">Nothing filed under that.</li>`;
    return;
  }
  ul.innerHTML = list.map((c) => {
    const snip = c.body.replace(/[#*`\[\]]/g, "").replace(/\s+/g, " ").trim().slice(0, 80);
    return `<li data-id="${c.id}" class="${c.id === activeId ? "active" : ""} ${c.pinned ? "pinned" : ""}">
      <div class="cl-title">${c.pinned ? '<span class="pin-dot">*</span>' : ""}${escapeHtml(c.title || "Untitled")}</div>
      <div class="cl-snip">${escapeHtml(snip) || "empty card"}</div>
      ${(c.tags || []).length ? `<div class="cl-tags">${c.tags.map((t) => `<span>#${escapeHtml(t)}</span>`).join("")}</div>` : ""}
    </li>`;
  }).join("");
}

/* ---------- render: the open card ---------- */
function openCard(id, { edit = false } = {}) {
  const card = cards.find((c) => c.id === id);
  if (!card) return;
  activeId = id;
  editing = edit;
  $("#emptyState").hidden = true;
  $("#indexCard").hidden = false;

  $("#titleInput").value = card.title;
  $("#tagInput").value = (card.tags || []).join(", ");
  $("#bodyEdit").value = card.body;
  $("#bodyView").innerHTML = renderMarkdown(card.body || "*empty card*");

  $("#metaFiled").textContent = "filed " + fmtDate(card.created);
  $("#metaEdited").textContent = "edited " + fmtDate(card.updated);
  const words = (card.body.trim().match(/\S+/g) || []).length;
  $("#metaCount").textContent = `${words} ${words === 1 ? "word" : "words"} / ${card.body.length} chars`;

  $("#pinBtn").classList.toggle("on", !!card.pinned);
  $("#pinBtn").textContent = card.pinned ? "Pinned" : "Pin";

  reflectEditing();
  renderBacklinks(card);
  renderList();
}

function reflectEditing() {
  $("#bodyView").hidden = editing;
  $("#bodyEdit").hidden = !editing;
  $("#editToggle").classList.toggle("on", editing);
  $("#editToggle").textContent = editing ? "Done" : "Edit";
  $("#titleInput").readOnly = false;
  if (editing) $("#bodyEdit").focus();
}

function renderBacklinks(card) {
  const links = backlinksFor(card);
  const box = $("#backlinks");
  if (!links.length) { box.hidden = true; return; }
  box.hidden = false;
  $("#backlinksList").innerHTML = links
    .map((c) => `<li data-id="${c.id}">${escapeHtml(c.title)}</li>`)
    .join("");
}

function fmtDate(ts) {
  const d = new Date(ts);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  if (sameDay) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

/* ---------- mutations ---------- */
function currentCard() { return cards.find((c) => c.id === activeId); }

function persistFromInputs() {
  const card = currentCard();
  if (!card) return;
  card.title = $("#titleInput").value.trim() || "Untitled";
  card.body = $("#bodyEdit").value;
  card.tags = $("#tagInput").value.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
  card.updated = now();
  save();
}

function newCard() {
  const card = {
    id: uid(), title: "", body: "", tags: filterTag ? [filterTag] : [],
    pinned: false, created: now(), updated: now(),
  };
  cards.unshift(card);
  save();
  renderTabs();
  openCard(card.id, { edit: true });
  $("#titleInput").focus();
}

/* ---------- events ---------- */
$("#newCard").addEventListener("click", newCard);
$("#newCardEmpty").addEventListener("click", newCard);

$("#cardList").addEventListener("click", (e) => {
  const li = e.target.closest("li[data-id]");
  if (li) openCard(li.dataset.id);
});

$("#tagTabs").addEventListener("click", (e) => {
  const btn = e.target.closest(".tab");
  if (!btn) return;
  filterTag = filterTag === btn.dataset.tag ? null : btn.dataset.tag;
  renderTabs();
  renderList();
});

$("#search").addEventListener("input", (e) => { query = e.target.value.trim(); renderList(); });
$("#sortSel").addEventListener("change", (e) => { sort = e.target.value; renderList(); });

$("#editToggle").addEventListener("click", () => {
  if (editing) persistFromInputs();
  editing = !editing;
  reflectEditing();
  if (!editing) openCard(activeId);
});

$("#titleInput").addEventListener("input", () => { persistFromInputs(); renderList(); renderTabs(); });
$("#bodyEdit").addEventListener("input", () => {
  persistFromInputs();
  const card = currentCard();
  const words = (card.body.trim().match(/\S+/g) || []).length;
  $("#metaCount").textContent = `${words} ${words === 1 ? "word" : "words"} / ${card.body.length} chars`;
});
$("#tagInput").addEventListener("change", () => { persistFromInputs(); renderTabs(); renderList(); });

$("#pinBtn").addEventListener("click", () => {
  const card = currentCard();
  if (!card) return;
  card.pinned = !card.pinned;
  card.updated = now();
  save();
  openCard(card.id, { edit: editing });
});

$("#deleteBtn").addEventListener("click", () => {
  const card = currentCard();
  if (!card) return;
  if (!confirm(`Discard the card "${card.title || "Untitled"}"? This cannot be undone.`)) return;
  cards = cards.filter((c) => c.id !== card.id);
  save();
  activeId = null;
  renderTabs();
  renderList();
  const next = visibleCards()[0];
  if (next) openCard(next.id);
  else { $("#indexCard").hidden = true; $("#emptyState").hidden = false; }
  toast("Card discarded");
});

/* wikilinks + backlinks navigation */
$("#bodyView").addEventListener("click", (e) => {
  const link = e.target.closest(".wikilink");
  if (!link) return;
  e.preventDefault();
  const name = link.dataset.link.toLowerCase();
  const target = cards.find((c) => c.title.trim().toLowerCase() === name);
  if (target) openCard(target.id);
  else {
    const card = {
      id: uid(), title: link.dataset.link, body: "", tags: [],
      pinned: false, created: now(), updated: now(),
    };
    cards.unshift(card);
    save();
    renderTabs();
    openCard(card.id, { edit: true });
    toast("New card started");
  }
});
$("#backlinksList").addEventListener("click", (e) => {
  const li = e.target.closest("li[data-id]");
  if (li) openCard(li.dataset.id);
});

/* export / import */
$("#exportJson").addEventListener("click", () => {
  download("slipbox.json", JSON.stringify(cards, null, 2), "application/json");
});
$("#exportMd").addEventListener("click", () => {
  const md = cards.map((c) =>
    `---\ntitle: ${c.title}\ntags: ${(c.tags || []).join(", ")}\nfiled: ${new Date(c.created).toISOString()}\n---\n\n${c.body}\n`
  ).join("\n\n");
  download("slipbox.md", md, "text/markdown");
});
$("#importFile").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const incoming = JSON.parse(reader.result);
      if (!Array.isArray(incoming)) throw new Error("not an array");
      let added = 0;
      incoming.forEach((c) => {
        if (!c || typeof c.title !== "string") return;
        cards.push({
          id: uid(),
          title: c.title,
          body: typeof c.body === "string" ? c.body : "",
          tags: Array.isArray(c.tags) ? c.tags.map(String) : [],
          pinned: !!c.pinned,
          created: +c.created || now(),
          updated: +c.updated || now(),
        });
        added++;
      });
      save();
      renderTabs();
      renderList();
      toast(`Imported ${added} ${added === 1 ? "card" : "cards"}`);
    } catch (_) { toast("That file was not a Slipbox export"); }
    e.target.value = "";
  };
  reader.readAsText(file);
});
function download(name, text, type) {
  const blob = new Blob([text], { type });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

let toastT;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastT);
  toastT = setTimeout(() => { t.hidden = true; }, 1600);
}

document.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") { e.preventDefault(); persistFromInputs(); toast("Saved"); }
  if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && activeId) {
    editing = !editing; reflectEditing(); if (!editing) { persistFromInputs(); openCard(activeId); }
  }
});

/* ---------- boot ---------- */
load();
renderTabs();
renderList();
const first = visibleCards()[0];
if (first) openCard(first.id);
