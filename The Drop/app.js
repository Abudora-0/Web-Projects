/* DEADSTOCK - shared app: data, chrome, cart, checkout, countdown, per-page logic */
(function () {
  "use strict";

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var money = function (n) { return "$" + n.toFixed(2); };
  var esc = function (s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  };

  /* ================= DATA ================= */
  var PRODUCTS = [
    { id: "puddle", name: "PUDDLE JUMPER", cat: "Footwear", price: 190, status: "available", isNew: true,
      photo: "img/sneaker-puddle.jpg", gallery: ["img/sneaker-puddle.jpg", "img/sneaker-alt.jpg"],
      sizes: ["7", "8", "9", "10", "11", "12"], stock: 34,
      colorways: [{ name: "Storm Black", hex: "#141414" }, { name: "Wet Cement", hex: "#6f6f68" }],
      blurb: "The everyday runner, built for weather you didn't check for. Water-shedding mesh, gum outsole, zero apologies.",
      details: { Upper: "Recycled knit mesh", Sole: "Gum rubber cup", Weight: "298 g", Drop: "8 mm" } },

    { id: "rooftop", name: "ROOFTOP LOW", cat: "Footwear", price: 175, status: "low-stock",
      photo: "img/sneaker-rooftop.jpg", gallery: ["img/sneaker-rooftop.jpg"],
      sizes: ["7", "8", "9", "10", "11", "12"], stock: 6,
      colorways: [{ name: "Bleach White", hex: "#e9e9e2" }],
      blurb: "Low, clean, and loud about it. A minimal court silhouette that reads from across the block.",
      details: { Upper: "Primeknit", Sole: "Boost-style foam", Weight: "265 g", Fit: "True to size" } },

    { id: "court", name: "COURT KING", cat: "Footwear", price: 160, status: "available",
      photo: "img/sneaker-court.jpg", gallery: ["img/sneaker-court.jpg"],
      sizes: ["7", "8", "9", "10", "11", "12"], stock: 21,
      colorways: [{ name: "Chalk / Acid", hex: "#dfe6cf" }, { name: "Blackout", hex: "#111111" }],
      blurb: "A hardcourt classic with the volume turned up. Leather-look upper, foam midsole, made for standing around looking unbothered.",
      details: { Upper: "Synthetic leather", Sole: "EVA foam", Weight: "312 g", Lining: "Textile" } },

    { id: "crystal", name: "CRYSTAL CUT", cat: "Footwear", price: 320, status: "sold-out",
      photo: "img/sneaker-crystal.jpg", gallery: ["img/sneaker-crystal.jpg"],
      sizes: ["7", "8", "9", "10", "11"], stock: 0,
      colorways: [{ name: "Full Ice", hex: "#f2f2f2" }],
      blurb: "The one everyone missed. A platform low buried under hand-set rhinestones. 40 pairs, gone in a minute.",
      details: { Upper: "Rhinestone-set canvas", Sole: "Vulcanised platform", Weight: "402 g", Run: "40 pairs" } },

    { id: "skyline", name: "SKYLINE HOODIE", cat: "Hoodies", price: 110, status: "available", isNew: true,
      photo: "img/hoodie-skyline.jpg", gallery: ["img/hoodie-skyline.jpg"],
      sizes: ["S", "M", "L", "XL"], stock: 48,
      colorways: [{ name: "Fog Grey", hex: "#b9b9b0" }, { name: "Jet", hex: "#0e0e0e" }],
      blurb: "400 gsm loopback fleece, oversized hood, dropped shoulders. The one you'll reach for until it falls apart.",
      details: { Fabric: "400 gsm cotton fleece", Fit: "Oversized", Hood: "Double-layer", Made: "Portugal" } },

    { id: "offduty", name: "OFF-DUTY CREW", cat: "Hoodies", price: 90, status: "available",
      photo: "img/hoodie-grass.jpg", gallery: ["img/hoodie-grass.jpg"],
      sizes: ["S", "M", "L", "XL"], stock: 27,
      colorways: [{ name: "Heather Grey", hex: "#a9a9a0" }],
      blurb: "A mid-weight crewneck with nothing to prove. Ribbed everything, boxy cut, soft enough to sleep in.",
      details: { Fabric: "320 gsm cotton", Fit: "Relaxed", Neck: "Ribbed 2x2", Made: "Portugal" } },

    { id: "shawl", name: "SHAWL KNIT JACKET", cat: "Jackets", price: 165, status: "low-stock",
      photo: "img/jacket-knit.jpg", gallery: ["img/jacket-knit.jpg"],
      sizes: ["S", "M", "L", "XL"], stock: 9,
      colorways: [{ name: "Ash Marl", hex: "#9c9c92" }],
      blurb: "Chunky shawl-collar cardigan in a heavy cotton knit. Layers over everything, works nine months of the year.",
      details: { Fabric: "Heavy cotton knit", Collar: "Shawl", Closure: "Horn buttons", Fit: "Regular" } },

    { id: "leather", name: "CUT LEATHER JACKET", cat: "Jackets", price: 480, status: "upcoming",
      photo: "img/jacket-leather.jpg", gallery: ["img/jacket-leather.jpg"],
      sizes: ["S", "M", "L", "XL"], stock: 0,
      colorways: [{ name: "Oxblood", hex: "#5a1e1e" }, { name: "Bone", hex: "#cfc7b8" }, { name: "Black", hex: "#111111" }],
      blurb: "Quilted-panel lamb leather moto, cut short and sharp. Drops next Friday. Raffle only.",
      details: { Shell: "Lamb nappa", Lining: "Viscose twill", Panels: "Diamond quilt", Run: "Numbered" } },

    { id: "tees", name: "ESSENTIALS TEE 5-PACK", cat: "Essentials", price: 70, status: "available", isNew: true,
      photo: "img/tee-stack.jpg", gallery: ["img/tee-stack.jpg"],
      sizes: ["S", "M", "L", "XL", "XXL"], stock: 60,
      colorways: [{ name: "The Full Rack", hex: "#8f8f86" }],
      blurb: "Five heavyweight blanks - grey, navy, black, olive, white. Boxy, 220 gsm, taped neck. Build the rotation.",
      details: { Fabric: "220 gsm cotton", Fit: "Boxy", Neck: "Taped", Pack: "5 tees" } },

    { id: "snapback", name: "AMERICANA SNAPBACK", cat: "Accessories", price: 45, status: "available",
      photo: "img/cap-snapback.jpg", gallery: ["img/cap-snapback.jpg"],
      sizes: null, stock: 40,
      colorways: [{ name: "Black / Flag", hex: "#101010" }],
      blurb: "Structured six-panel with a flag-print brim and raised embroidery. One size, snap-adjust.",
      details: { Crown: "Structured 6-panel", Brim: "Flat, flag print", Closure: "Snapback", Fit: "One size" } },

    { id: "utility", name: "CROSSBODY UTILITY BAG", cat: "Accessories", price: 95, status: "low-stock",
      photo: "img/backpack-utility.jpg", gallery: ["img/backpack-utility.jpg"],
      sizes: null, stock: 7,
      colorways: [{ name: "Blackout", hex: "#121212" }, { name: "Coyote", hex: "#7a6a4f" }],
      blurb: "Modular sling with red-tab organiser panels, weather-sealed zips, and enough room for a lens or a bad decision.",
      details: { Shell: "600D ripstop", Zips: "Sealed", Volume: "6 L", Strap: "Adjustable sternum" } }
  ];

  var CATS = ["all", "Footwear", "Hoodies", "Jackets", "Essentials", "Accessories"];
  var productById = function (id) { return PRODUCTS.find(function (p) { return p.id === id; }); };

  /* ================= STATE ================= */
  var K = {
    cart: "deadstock_cart_v1", stash: "deadstock_stash_v1", recent: "deadstock_recent_v1",
    orders: "deadstock_orders_v1", raffle: "deadstock_raffle_v1", list: "deadstock_list_v1",
    sold: "deadstock_sold_v1"
  };
  function load(k, f) { try { var r = localStorage.getItem(k); return r ? JSON.parse(r) : f; } catch (e) { return f; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  var state = {
    cart: load(K.cart, []),
    stash: load(K.stash, []),
    recent: load(K.recent, []),
    orders: load(K.orders, []),
    raffle: load(K.raffle, []),
    sold: load(K.sold, {})   // per-product units sold this session, feeds the stock meter
  };
  var saveCart = function () { save(K.cart, state.cart); };
  var saveStash = function () { save(K.stash, state.stash); };

  function effectiveStock(p) {
    var base = p.stock || 0;
    return Math.max(0, base - (state.sold[p.id] || 0));
  }
  function effectiveStatus(p) {
    if (p.status === "sold-out" || p.status === "upcoming") return p.status;
    var s = effectiveStock(p);
    if (s <= 0) return "sold-out";
    if (s <= Math.max(3, Math.round((p.stock || 20) * 0.2))) return "low-stock";
    return "available";
  }

  /* ================= TOAST ================= */
  var toastStack;
  function toast(msg, err) {
    if (!toastStack) return;
    var el = document.createElement("div");
    el.className = "toast" + (err ? " err" : "");
    el.textContent = msg;
    toastStack.appendChild(el);
    setTimeout(function () { el.remove(); }, 2900);
  }

  /* ================= CHROME (header / footer / drawer) ================= */
  var NAV = [
    { href: "index.html", label: "HOME", page: "home" },
    { href: "shop.html", label: "SHOP", page: "shop" },
    { href: "lookbook.html", label: "LOOKBOOK", page: "lookbook" },
    { href: "stash.html", label: "STASH", page: "stash" }
  ];
  var BOLT = '<svg viewBox="0 0 100 100" width="24" height="24" aria-hidden="true"><polygon points="60,4 16,56 44,56 38,96 84,42 54,42" fill="currentColor" stroke="#0a0a0a" stroke-width="4" stroke-linejoin="round"/></svg>';

  function renderChrome() {
    var page = document.body.dataset.page || "";
    var host = $("#chrome");
    if (host) {
      host.innerHTML =
        '<div class="tape" aria-hidden="true"><span>' + ('DROP 004 &nbsp;/&nbsp; NO RESTOCKS &nbsp;/&nbsp; ONCE IT&rsquo;S GONE IT&rsquo;S GONE &nbsp;/&nbsp; ').repeat(6) + '</span></div>' +
        '<header class="site-header"><div class="header-inner">' +
          '<button class="hamburger" id="hamb" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>' +
          '<a class="logo" href="index.html"><span class="logo-mark">' + BOLT + '</span><span class="logo-text">DEADSTOCK</span></a>' +
          '<nav class="nav" id="nav">' + NAV.map(function (n) {
            return '<a href="' + n.href + '"' + (n.page === page ? ' aria-current="page"' : "") + '>' + n.label + '</a>';
          }).join("") + '</nav>' +
          '<div class="header-icons">' +
            '<button class="icon-btn" id="openCart" aria-label="Cart"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h2l2.2 11.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L21 9H6"/><circle cx="10" cy="21" r="1.4"/><circle cx="17" cy="21" r="1.4"/></svg><span class="icon-badge" id="cartBadge">0</span></button>' +
          '</div>' +
        '</div></header>';

      $("#hamb").addEventListener("click", function () {
        var n = $("#nav"); var open = n.classList.toggle("open");
        this.setAttribute("aria-expanded", String(open));
      });
      $("#openCart").addEventListener("click", openDrawer);
    }

    var foot = $("#chrome-footer");
    if (foot) {
      foot.innerHTML =
        '<footer class="site-footer"><div class="footer-inner">' +
          '<div class="footer-brand"><span class="logo-text">DEADSTOCK</span><p>A front-end demo store. No real orders, no real money, no real restocks. Every drop is fiction, built by hand.</p></div>' +
          '<div class="footer-col"><h4>Shop</h4><a href="shop.html">All pieces</a><a href="shop.html#Footwear">Footwear</a><a href="shop.html#Hoodies">Hoodies</a><a href="lookbook.html">Lookbook</a></div>' +
          '<div class="footer-col"><h4>Account</h4><a href="stash.html">The Stash</a><a href="cart.html">Cart</a><a href="orders.html">Order history</a></div>' +
          '<div class="footer-col"><h4>Info</h4><a href="index.html#list">Get on the list</a><a href="shop.html">Size guide</a><a href="lookbook.html">Drop calendar</a></div>' +
        '</div><p class="footer-fine">DEADSTOCK - HAND-CUT DEMO &middot; NOTHING HERE IS FOR SALE</p></footer>';
    }

    mountDrawer();
    updateCartBadge();
  }

  /* ================= CART DRAWER + CHECKOUT (shared, used on every page) ================= */
  var drawer, drawerBackdrop;
  function mountDrawer() {
    var mount = $("#drawer-mount");
    if (!mount) return;
    mount.innerHTML =
      '<div class="drawer-backdrop" id="drawerBackdrop" hidden></div>' +
      '<aside class="drawer" id="drawer" role="dialog" aria-modal="true" aria-label="Cart" hidden>' +
        '<div class="drawer-head"><h2>YOUR CART</h2><button class="modal-x" id="closeDrawer" aria-label="Close">&times;</button></div>' +
        '<div class="drawer-body" id="drawerBody"></div>' +
        '<div class="drawer-foot" id="drawerFoot"></div>' +
      '</aside>';
    drawer = $("#drawer");
    drawerBackdrop = $("#drawerBackdrop");
    $("#closeDrawer").addEventListener("click", closeDrawer);
    drawerBackdrop.addEventListener("click", closeDrawer);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && drawer && !drawer.hidden) closeDrawer();
    });
  }
  function openDrawer() {
    if (!drawer) return;
    drawerBackdrop.hidden = false; drawer.hidden = false;
    drawer.classList.remove("closing");
    document.body.style.overflow = "hidden";
    renderDrawer();
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.add("closing");
    setTimeout(function () {
      drawer.hidden = true; drawerBackdrop.hidden = true;
      drawer.classList.remove("closing");
      document.body.style.overflow = "";
    }, reduceMotion ? 0 : 260);
  }
  function renderDrawer() {
    var body = $("#drawerBody"), foot = $("#drawerFoot");
    if (!state.cart.length) {
      body.innerHTML = '<p class="cart-empty">CART&rsquo;S EMPTY.<br>GO COP SOMETHING.</p>';
      foot.innerHTML = '<a class="btn ghost block" href="shop.html">BROWSE THE DROP</a>';
      return;
    }
    body.innerHTML = state.cart.map(function (it) {
      return '<div class="mini-row" data-cid="' + esc(it.cid) + '">' +
        '<div class="mini-row-media"><img src="' + esc(it.photo) + '" alt=""></div>' +
        '<div><p class="mini-row-name">' + esc(it.name) + '</p>' +
        '<p class="mini-row-meta">' + esc(it.colorway) + (it.size ? " &middot; " + esc(it.size) : "") + '</p>' +
        '<span class="mini-qty"><button data-d="-1" aria-label="Less">&minus;</button><span>' + it.qty + '</span><button data-d="1" aria-label="More">+</button></span></div>' +
        '<div style="text-align:right"><div style="font-weight:800">' + money(it.price * it.qty) + '</div>' +
        '<button class="cart-row-remove" data-remove>REMOVE</button></div>' +
      '</div>';
    }).join("");
    var sub = cartSubtotal();
    foot.innerHTML =
      '<div class="summary-row total"><span>SUBTOTAL</span><span>' + money(sub) + '</span></div>' +
      '<a class="btn block" href="cart.html">CHECKOUT</a>';
    $$(".mini-row", body).forEach(function (row) {
      var cid = row.dataset.cid;
      row.querySelectorAll(".mini-qty button").forEach(function (b) {
        b.addEventListener("click", function () { changeQty(cid, +b.dataset.d); renderDrawer(); });
      });
      row.querySelector("[data-remove]").addEventListener("click", function () {
        removeFromCart(cid); renderDrawer(); toast("Removed from cart.");
      });
    });
  }

  function cartSubtotal() { return state.cart.reduce(function (s, it) { return s + it.price * it.qty; }, 0); }
  function cartCount() { return state.cart.reduce(function (s, it) { return s + it.qty; }, 0); }
  function updateCartBadge() { var b = $("#cartBadge"); if (b) b.textContent = String(cartCount()); }

  function addToCart(product, colorway, size, qty) {
    var cid = product.id + "|" + colorway.name + "|" + (size || "one");
    var ex = state.cart.find(function (it) { return it.cid === cid; });
    if (ex) ex.qty = Math.min(20, ex.qty + qty);
    else state.cart.push({
      cid: cid, id: product.id, name: product.name, price: product.price,
      colorway: colorway.name, size: size, qty: qty, photo: product.photo
    });
    state.sold[product.id] = (state.sold[product.id] || 0) + qty;
    save(K.sold, state.sold);
    saveCart(); updateCartBadge();
    document.dispatchEvent(new CustomEvent("cart:change"));
  }
  function removeFromCart(cid) {
    var it = state.cart.find(function (x) { return x.cid === cid; });
    if (it) { state.sold[it.id] = Math.max(0, (state.sold[it.id] || 0) - it.qty); save(K.sold, state.sold); }
    state.cart = state.cart.filter(function (x) { return x.cid !== cid; });
    saveCart(); updateCartBadge();
    document.dispatchEvent(new CustomEvent("cart:change"));
  }
  function changeQty(cid, d) {
    var it = state.cart.find(function (x) { return x.cid === cid; });
    if (!it) return;
    var next = it.qty + d;
    if (next <= 0) return removeFromCart(cid);
    it.qty = Math.min(20, next);
    state.sold[it.id] = Math.max(0, (state.sold[it.id] || 0) + d);
    save(K.sold, state.sold);
    saveCart(); updateCartBadge();
    document.dispatchEvent(new CustomEvent("cart:change"));
  }

  /* ================= STASH (wishlist) ================= */
  function inStash(id) { return state.stash.indexOf(id) !== -1; }
  function toggleStash(id) {
    var i = state.stash.indexOf(id);
    if (i === -1) { state.stash.push(id); toast("Saved to the Stash."); }
    else { state.stash.splice(i, 1); toast("Removed from the Stash."); }
    saveStash();
    document.dispatchEvent(new CustomEvent("stash:change"));
  }

  /* ================= RECENTLY VIEWED ================= */
  function pushRecent(id) {
    state.recent = [id].concat(state.recent.filter(function (x) { return x !== id; })).slice(0, 8);
    save(K.recent, state.recent);
  }

  /* ================= CUSTOM SELECT ================= */
  function enhanceSelect(native) {
    if (native.dataset.enh) return;
    native.dataset.enh = "1";
    var wrap = document.createElement("div");
    wrap.className = "ds-sel";
    native.parentNode.insertBefore(wrap, native);
    wrap.appendChild(native);
    var trig = document.createElement("button");
    trig.type = "button"; trig.className = "ds-sel-trigger";
    trig.setAttribute("aria-haspopup", "listbox"); trig.setAttribute("aria-expanded", "false");
    if (native.getAttribute("aria-label")) trig.setAttribute("aria-label", native.getAttribute("aria-label"));
    trig.innerHTML = '<span class="ds-sel-val"></span><span class="ds-sel-caret">&#9662;</span>';
    wrap.appendChild(trig);
    var panel = document.createElement("ul");
    panel.className = "ds-sel-panel"; panel.setAttribute("role", "listbox");
    wrap.appendChild(panel);
    function build() {
      panel.innerHTML = "";
      $$("option", native).forEach(function (o) {
        var li = document.createElement("li");
        li.className = "ds-sel-opt"; li.setAttribute("role", "option");
        li.dataset.value = o.value; li.textContent = o.textContent;
        li.setAttribute("aria-selected", o.selected ? "true" : "false");
        li.addEventListener("click", function () { pick(o.value); });
        panel.appendChild(li);
      });
      sync();
    }
    function sync() {
      var o = native.options[native.selectedIndex];
      wrap.querySelector(".ds-sel-val").textContent = o ? o.textContent : "";
      $$(".ds-sel-opt", panel).forEach(function (li) {
        li.setAttribute("aria-selected", li.dataset.value === native.value ? "true" : "false");
      });
    }
    function open() { wrap.classList.add("open"); trig.setAttribute("aria-expanded", "true"); setTimeout(function () { document.addEventListener("click", out, true); }, 0); document.addEventListener("keydown", onKey); }
    function close() { wrap.classList.remove("open"); trig.setAttribute("aria-expanded", "false"); document.removeEventListener("click", out, true); document.removeEventListener("keydown", onKey); }
    function out(e) { if (!wrap.contains(e.target)) close(); }
    function onKey(e) { if (e.key === "Escape") { close(); trig.focus(); } }
    function pick(v) { native.value = v; native.dispatchEvent(new Event("change", { bubbles: true })); sync(); close(); trig.focus(); }
    trig.addEventListener("click", function () { wrap.classList.contains("open") ? close() : open(); });
    native.addEventListener("change", sync);
    build();
  }
  function enhanceSelects(root) { $$("select.ds-select", root || document).forEach(enhanceSelect); }

  /* ================= STEPPER ================= */
  function makeStepper(value, min, max, onChange) {
    var el = document.createElement("div");
    el.className = "stepper";
    el.innerHTML = '<button type="button" data-d="-1" aria-label="Less">&minus;</button><span class="val">' + value + '</span><button type="button" data-d="1" aria-label="More">+</button>';
    var val = el.querySelector(".val");
    function set(n, fire) {
      n = Math.max(min, Math.min(max, n));
      val.textContent = n;
      el.querySelector('[data-d="-1"]').disabled = n <= min;
      el.querySelector('[data-d="1"]').disabled = n >= max;
      if (fire !== false) onChange(n);
    }
    el.querySelectorAll("button").forEach(function (b) {
      b.addEventListener("click", function () { set(+val.textContent + (+b.dataset.d)); });
    });
    set(value, false);
    return { el: el, get: function () { return +val.textContent; }, set: function (n) { set(n); } };
  }

  /* ================= COUNTDOWN ================= */
  function nextDrop() {
    var now = new Date();
    var t = new Date(now); t.setHours(11, 0, 0, 0);
    var diff = (5 - now.getDay() + 7) % 7;           // Friday
    if (diff === 0 && now >= t) diff = 7;
    t.setDate(now.getDate() + diff);
    return t;
  }
  function initCountdown(root) {
    var els = {
      d: $(".cd-num.d", root), h: $(".cd-num.h", root), m: $(".cd-num.m", root), s: $(".cd-num.s", root)
    };
    if (!els.d) return;
    var target = nextDrop(), lastS = null;
    var pad = function (n) { return String(n).padStart(2, "0"); };
    function tick() {
      var rem = target - Date.now();
      if (rem <= 0) { target = new Date(target.getTime() + 7 * 864e5); rem = target - Date.now(); toast("THE DROP IS LIVE."); }
      var d = Math.floor(rem / 864e5), h = Math.floor(rem % 864e5 / 36e5), m = Math.floor(rem % 36e5 / 6e4), s = Math.floor(rem % 6e4 / 1e3);
      els.d.textContent = pad(d); els.h.textContent = pad(h); els.m.textContent = pad(m);
      if (s !== lastS) {
        els.s.textContent = pad(s);
        if (!reduceMotion) { els.s.classList.remove("tick"); void els.s.offsetWidth; els.s.classList.add("tick"); }
        lastS = s;
      }
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ================= CARD MARKUP ================= */
  function badgeFor(p) {
    var st = effectiveStatus(p);
    if (st === "sold-out") return { t: "SOLD OUT", c: "sold" };
    if (st === "upcoming") return { t: "DROPS SOON", c: "soon" };
    if (st === "low-stock") return { t: "LOW STOCK", c: "low" };
    if (p.isNew) return { t: "JUST DROPPED", c: "new" };
    return null;
  }
  function cardHTML(p, opts) {
    opts = opts || {};
    var st = effectiveStatus(p);
    var b = badgeFor(p);
    var wished = inStash(p.id);
    var stock = effectiveStock(p);
    var meter = "";
    if (opts.meter && st === "low-stock" && stock > 0) {
      var pct = Math.max(6, Math.round(stock / (p.stock || 20) * 100));
      meter = '<div class="stock-meter' + (stock <= 3 ? " crit" : "") + '"><div class="stock-meter-track"><div class="stock-meter-fill" style="width:' + pct + '%"></div></div>' +
        '<div class="stock-meter-label">' + stock + ' LEFT</div></div>';
    }
    return '<a class="pcard' + (st === "sold-out" ? " is-sold" : "") + '" href="product.html#' + p.id + '">' +
      (b ? '<span class="badge ' + b.c + '">' + b.t + '</span>' : "") +
      '<button class="wish-btn' + (wished ? " on" : "") + '" data-wish="' + p.id + '" aria-label="Save ' + esc(p.name) + '" aria-pressed="' + wished + '">' + (wished ? "&#9733;" : "&#9734;") + '</button>' +
      '<div class="pcard-media"><img src="' + esc(p.photo) + '" alt="' + esc(p.name) + '" loading="lazy"></div>' +
      '<div class="pcard-body">' +
        '<span class="pcard-cat">' + esc(p.cat) + '</span>' +
        '<span class="pcard-name">' + esc(p.name) + '</span>' +
        '<div class="pcard-foot"><span class="pcard-price">' + money(p.price) + '</span><span class="pcard-cat">VIEW</span></div>' +
        meter +
      '</div></a>';
  }
  function wireCards(root) {
    $$("[data-wish]", root).forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        toggleStash(btn.dataset.wish);
        var on = inStash(btn.dataset.wish);
        btn.classList.toggle("on", on);
        btn.setAttribute("aria-pressed", String(on));
        btn.innerHTML = on ? "&#9733;" : "&#9734;";
      });
    });
  }

  /* ================= PAGE: HOME ================= */
  function pageHome() {
    initCountdown();
    var feat = $("#featured");
    if (feat) {
      var picks = PRODUCTS.filter(function (p) { return effectiveStatus(p) !== "sold-out"; }).slice(0, 3);
      feat.innerHTML = picks.map(function (p) { return cardHTML(p, { meter: true }); }).join("");
      wireCards(feat);
    }
    var soon = $("#dropSoon");
    if (soon) {
      var up = PRODUCTS.filter(function (p) { return p.status === "upcoming"; });
      soon.innerHTML = up.length ? up.map(function (p) { return cardHTML(p); }).join("") : '<p class="pcard-cat">Nothing on the calendar. Check back Friday.</p>';
      wireCards(soon);
    }
    var recent = $("#recentStrip");
    if (recent) renderRecent(recent);
    wireList();
  }

  function renderRecent(host) {
    var ids = state.recent.filter(function (id) { return productById(id); });
    if (!ids.length) { var sec = host.closest(".section"); if (sec) sec.hidden = true; return; }
    host.innerHTML = ids.map(function (id) { return cardHTML(productById(id)); }).join("");
    wireCards(host);
  }

  function wireList() {
    var form = $("#listForm");
    if (!form) return;
    var done = state.raffle;   // reuse list flag
    var listed = load(K.list, []);
    if (listed.length) form.innerHTML = '<p class="list-done">YOU&rsquo;RE ON THE LIST. WATCH YOUR INBOX.</p>';
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = $("#listEmail").value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { toast("That's not an email.", true); return; }
      listed.push(email); save(K.list, listed);
      form.innerHTML = '<p class="list-done">YOU&rsquo;RE ON THE LIST. WATCH YOUR INBOX.</p>';
      toast("You're on the list.");
    });
  }

  /* ================= PAGE: SHOP ================= */
  function pageShop() {
    var hashCat = decodeURIComponent(location.hash.slice(1));
    var f = { cat: CATS.indexOf(hashCat) !== -1 ? hashCat : "all", q: "", sort: "featured", maxPrice: 500, size: "all" };

    var grid = $("#shopGrid"), noRes = $("#shopNoRes");
    var chips = $("#shopChips"), search = $("#shopSearch"), sortSel = $("#shopSort"), priceRange = $("#shopPrice"), priceOut = $("#shopPriceOut"), sizeSel = $("#shopSize");

    chips.innerHTML = CATS.map(function (c) {
      return '<button class="chip' + (c === f.cat ? " on" : "") + '" data-cat="' + c + '">' + (c === "all" ? "ALL" : c.toUpperCase()) + '</button>';
    }).join("");

    var allSizes = ["all"].concat(Array.from(new Set(PRODUCTS.reduce(function (a, p) { return a.concat(p.sizes || []); }, []))));
    sizeSel.innerHTML = allSizes.map(function (s) { return '<option value="' + s + '">' + (s === "all" ? "ANY SIZE" : "SIZE " + s) + '</option>'; }).join("");

    enhanceSelects($("#shopBar"));

    function render() {
      var list = PRODUCTS.filter(function (p) {
        if (f.cat !== "all" && p.cat !== f.cat) return false;
        if (f.q && (p.name + " " + p.cat).toLowerCase().indexOf(f.q) === -1) return false;
        if (p.price > f.maxPrice) return false;
        if (f.size !== "all" && (!p.sizes || p.sizes.indexOf(f.size) === -1)) return false;
        return true;
      });
      var sorters = {
        featured: function (a, b) { return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0); },
        priceLow: function (a, b) { return a.price - b.price; },
        priceHigh: function (a, b) { return b.price - a.price; },
        name: function (a, b) { return a.name.localeCompare(b.name); }
      };
      list.sort(sorters[f.sort] || sorters.featured);
      grid.innerHTML = list.map(function (p) { return cardHTML(p, { meter: true }); }).join("");
      noRes.hidden = list.length !== 0;
      wireCards(grid);
      $("#shopCount").textContent = list.length + (list.length === 1 ? " PIECE" : " PIECES");
    }

    chips.addEventListener("click", function (e) {
      var b = e.target.closest(".chip"); if (!b) return;
      f.cat = b.dataset.cat;
      $$(".chip", chips).forEach(function (c) { c.classList.toggle("on", c.dataset.cat === f.cat); });
      history.replaceState(null, "", f.cat === "all" ? "shop.html" : "shop.html#" + f.cat);
      render();
    });
    search.addEventListener("input", function () { f.q = search.value.trim().toLowerCase(); render(); });
    sortSel.addEventListener("change", function () { f.sort = sortSel.value; render(); });
    sizeSel.addEventListener("change", function () { f.size = sizeSel.value; render(); });
    priceRange.addEventListener("input", function () { f.maxPrice = +priceRange.value; priceOut.textContent = "$" + priceRange.value; render(); });

    render();
  }

  /* ================= PAGE: PRODUCT ================= */
  function pageProduct() {
    window.addEventListener("hashchange", function () { location.reload(); });
    var id = decodeURIComponent(location.hash.slice(1));
    var p = productById(id);
    var root = $("#pdp");
    if (!p) { root.innerHTML = '<p class="no-results">PIECE NOT FOUND. <a href="shop.html" style="color:var(--neon)">BACK TO SHOP</a></p>'; return; }
    pushRecent(p.id);
    document.title = p.name + " / DEADSTOCK";

    var sel = { cw: 0, size: null, qty: 1, img: 0 };
    var st = effectiveStatus(p);
    var waitOnly = st === "sold-out" || st === "upcoming";

    root.innerHTML =
      '<div class="pdp"><div class="pdp-gallery">' +
        '<div class="pdp-main" id="pdpMain"><img src="' + esc(p.gallery[0]) + '" alt="' + esc(p.name) + '"></div>' +
        (p.gallery.length > 1 ? '<div class="pdp-thumbs" id="pdpThumbs">' + p.gallery.map(function (g, i) {
          return '<button class="pdp-thumb' + (i === 0 ? " on" : "") + '" data-i="' + i + '"><img src="' + esc(g) + '" alt=""></button>';
        }).join("") + '</div>' : "") +
      '</div>' +
      '<div class="pdp-info">' +
        '<p class="pdp-cat">' + esc(p.cat) + (badgeFor(p) ? ' &middot; ' + badgeFor(p).t : "") + '</p>' +
        '<h1 class="pdp-name">' + esc(p.name) + '</h1>' +
        '<p class="pdp-price">' + money(p.price) + '</p>' +
        '<p class="pdp-blurb">' + esc(p.blurb) + '</p>' +
        '<div class="pdp-field"><p class="pdp-field-label">Colourway / <b id="cwName">' + esc(p.colorways[0].name) + '</b></p><div class="swatches" id="swatches"></div></div>' +
        (p.sizes ? '<div class="pdp-field"><p class="pdp-field-label">Size <button class="size-guide-link" id="sizeGuideBtn">size guide</button></p><div class="sizes" id="sizes"></div></div>' : "") +
        (waitOnly ? "" : '<div class="pdp-field"><p class="pdp-field-label">Quantity</p><div id="qtyMount"></div></div>') +
        '<div id="stockMount"></div>' +
        '<div class="pdp-actions"><button class="btn" id="pdpAdd">' + (st === "sold-out" ? "JOIN THE WAITLIST" : st === "upcoming" ? "ENTER THE RAFFLE" : "ADD TO CART") + '</button>' +
          '<button class="btn ghost" id="pdpStash">' + (inStash(p.id) ? "&#9733; IN STASH" : "&#9734; STASH IT") + '</button></div>' +
        '<p class="pdp-note" id="pdpNote"></p>' +
        '<ul class="pdp-detail-list">' + Object.keys(p.details).map(function (k) {
          return '<li><span>' + esc(k) + '</span><span>' + esc(p.details[k]) + '</span></li>';
        }).join("") + '</ul>' +
      '</div></div>' +
      '<section class="section"><div class="section-head"><h2>Also in the drop</h2></div><div class="pgrid" id="related"></div></section>';

    // gallery
    var main = $("#pdpMain"), mainImg = main.querySelector("img");
    main.addEventListener("click", function () { main.classList.toggle("zoomed"); });
    $$("#pdpThumbs .pdp-thumb").forEach(function (t) {
      t.addEventListener("click", function () {
        sel.img = +t.dataset.i;
        mainImg.src = p.gallery[sel.img];
        $$("#pdpThumbs .pdp-thumb").forEach(function (x) { x.classList.toggle("on", x === t); });
        main.classList.remove("zoomed");
      });
    });

    // swatches
    var sw = $("#swatches");
    sw.innerHTML = p.colorways.map(function (c, i) {
      return '<button class="swatch' + (i === 0 ? " on" : "") + '" data-i="' + i + '" style="background:' + c.hex + '" aria-label="' + esc(c.name) + '"></button>';
    }).join("");
    sw.addEventListener("click", function (e) {
      var b = e.target.closest(".swatch"); if (!b) return;
      sel.cw = +b.dataset.i;
      $$(".swatch", sw).forEach(function (x) { x.classList.toggle("on", x === b); });
      $("#cwName").textContent = p.colorways[sel.cw].name;
    });

    // sizes
    if (p.sizes) {
      var sz = $("#sizes");
      sz.innerHTML = p.sizes.map(function (s) { return '<button class="size-btn" data-s="' + s + '">' + s + '</button>'; }).join("");
      sz.addEventListener("click", function (e) {
        var b = e.target.closest(".size-btn"); if (!b) return;
        sel.size = b.dataset.s;
        $$(".size-btn", sz).forEach(function (x) { x.classList.toggle("on", x === b); });
        $("#pdpNote").textContent = "";
      });
      $("#sizeGuideBtn").addEventListener("click", function () { openSizeGuide(p); });
    }

    // qty
    if (!waitOnly) {
      var stepper = makeStepper(1, 1, Math.min(10, Math.max(1, effectiveStock(p))), function (n) { sel.qty = n; });
      $("#qtyMount").appendChild(stepper.el);
    }

    // stock meter
    var stock = effectiveStock(p);
    if (st === "low-stock" && stock > 0) {
      var pct = Math.max(6, Math.round(stock / (p.stock || 20) * 100));
      $("#stockMount").innerHTML = '<div class="stock-meter' + (stock <= 3 ? " crit" : "") + '" style="max-width:240px"><div class="stock-meter-track"><div class="stock-meter-fill" style="width:' + pct + '%"></div></div><div class="stock-meter-label">ONLY ' + stock + ' LEFT AT THIS PRICE</div></div>';
    }

    // add / waitlist / raffle
    $("#pdpAdd").addEventListener("click", function () {
      var st2 = effectiveStatus(p);
      if (p.sizes && !sel.size && st2 !== "upcoming") { $("#pdpNote").textContent = "PICK A SIZE FIRST."; toast("Pick a size first.", true); return; }
      if (st2 === "upcoming") {
        if (state.raffle.indexOf(p.id) !== -1) { $("#pdpNote").textContent = "YOU'RE ALREADY IN THIS RAFFLE."; return; }
        var num = "R-" + Math.random().toString(36).slice(2, 7).toUpperCase();
        state.raffle.push(p.id); save(K.raffle, state.raffle);
        $("#pdpNote").textContent = "YOU'RE IN. ENTRY " + num + ". WINNERS PINGED FRIDAY 11:00.";
        toast("Raffle entry locked: " + num);
        return;
      }
      if (st2 === "sold-out") {
        $("#pdpNote").textContent = "YOU'RE ON THE WAITLIST. WE'LL PING YOU IF A PAIR COMES BACK.";
        toast("Added to the waitlist.");
        return;
      }
      addToCart(p, p.colorways[sel.cw], sel.size, sel.qty);
      $("#pdpNote").textContent = "ADDED " + sel.qty + " TO CART.";
      toast(p.name + " added to cart.");
      openDrawer();
    });
    $("#pdpStash").addEventListener("click", function () {
      toggleStash(p.id);
      $("#pdpStash").innerHTML = inStash(p.id) ? "&#9733; IN STASH" : "&#9734; STASH IT";
    });

    // related
    var rel = PRODUCTS.filter(function (x) { return x.id !== p.id && x.cat === p.cat; }).slice(0, 4);
    if (rel.length < 4) rel = rel.concat(PRODUCTS.filter(function (x) { return x.id !== p.id && rel.indexOf(x) === -1; })).slice(0, 4);
    var relEl = $("#related");
    relEl.innerHTML = rel.map(function (x) { return cardHTML(x); }).join("");
    wireCards(relEl);
  }

  function openSizeGuide(p) {
    var isShoe = p.cat === "Footwear";
    var overlay = document.createElement("div");
    overlay.className = "overlay";
    var rows = isShoe
      ? [["7", "40", "25.0"], ["8", "41", "25.7"], ["9", "42.5", "26.7"], ["10", "44", "27.9"], ["11", "45", "28.6"], ["12", "46.5", "29.4"]]
      : [["S", "46", "71"], ["M", "51", "73"], ["L", "56", "75"], ["XL", "61", "77"], ["XXL", "66", "79"]];
    var head = isShoe ? ["US", "EU", "Foot"] : ["Size", "Chest", "Length"];
    overlay.innerHTML =
      '<div class="modal"><button class="modal-x modal-close" aria-label="Close">&times;</button>' +
      '<h3>Size guide</h3>' +
      '<div style="display:flex;align-items:center;gap:.6rem;margin-bottom:.5rem">' +
        '<span class="pdp-field-label" style="margin:0">Units</span>' +
        '<select class="ds-select" id="sgUnit" aria-label="Units"><option value="metric">CM</option><option value="imperial">IN</option></select>' +
      '</div>' +
      '<table class="size-table"><thead><tr>' + head.map(function (h) { return "<th>" + h + "</th>"; }).join("") + '</tr></thead>' +
      '<tbody id="sgBody"></tbody></table>' +
      '<p class="form-note">Measurements are a guide. Between sizes? Size up for the boxy fits, down for footwear.</p></div>';
    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";
    function close() { overlay.remove(); document.body.style.overflow = ""; }
    overlay.querySelector(".modal-close").addEventListener("click", close);
    overlay.addEventListener("mousedown", function (e) { if (e.target === overlay) close(); });

    var body = overlay.querySelector("#sgBody");
    function fill(unit) {
      body.innerHTML = rows.map(function (r) {
        var cells = r.slice();
        if (unit === "imperial" && !isShoe) { cells[1] = (r[1] / 2.54).toFixed(1); cells[2] = (r[2] / 2.54).toFixed(1); }
        if (unit === "imperial" && isShoe) { cells[2] = (r[2] / 2.54).toFixed(1); }
        return "<tr>" + cells.map(function (c) { return "<td>" + c + "</td>"; }).join("") + "</tr>";
      }).join("");
    }
    fill("metric");
    enhanceSelect(overlay.querySelector("#sgUnit"));
    overlay.querySelector("#sgUnit").addEventListener("change", function () { fill(this.value); });
  }

  /* ================= PAGE: LOOKBOOK ================= */
  function pageLookbook() {
    var grid = $("#lookGrid");
    if (!grid) return;
    var shots = [
      { src: "img/sneaker-puddle.jpg", cap: "DROP 004 / PUDDLE JUMPER" },
      { src: "img/jacket-leather.jpg", cap: "COMING FRIDAY / CUT LEATHER" },
      { src: "img/hoodie-skyline.jpg", cap: "SKYLINE HOODIE, FOG GREY" },
      { src: "img/sneaker-rooftop.jpg", cap: "ROOFTOP LOW / 6 PAIRS LEFT" },
      { src: "img/hoodie-grass.jpg", cap: "OFF-DUTY CREW" },
      { src: "img/sneaker-court.jpg", cap: "COURT KING / CHALK-ACID" },
      { src: "img/tee-stack.jpg", cap: "BUILD THE ROTATION" },
      { src: "img/cap-snapback.jpg", cap: "AMERICANA SNAPBACK" },
      { src: "img/jacket-knit.jpg", cap: "SHAWL KNIT / ASH MARL" },
      { src: "img/backpack-utility.jpg", cap: "CROSSBODY UTILITY" }
    ];
    grid.innerHTML = shots.map(function (s) {
      return '<figure data-full="' + esc(s.src) + '"><img src="' + esc(s.src) + '" alt="' + esc(s.cap) + '" loading="lazy"><figcaption>' + esc(s.cap) + '</figcaption></figure>';
    }).join("");
    grid.addEventListener("click", function (e) {
      var fig = e.target.closest("figure"); if (!fig) return;
      var lb = document.createElement("div");
      lb.className = "lightbox";
      lb.innerHTML = '<button class="lightbox-close" aria-label="Close">&times;</button><img src="' + esc(fig.dataset.full) + '" alt="">';
      document.body.appendChild(lb);
      document.body.style.overflow = "hidden";
      function close() { lb.remove(); document.body.style.overflow = ""; }
      lb.querySelector(".lightbox-close").addEventListener("click", close);
      lb.addEventListener("click", function (ev) { if (ev.target === lb) close(); });
      document.addEventListener("keydown", function onk(ev) { if (ev.key === "Escape") { close(); document.removeEventListener("keydown", onk); } });
    });
  }

  /* ================= PAGE: STASH ================= */
  function pageStash() {
    function render() {
      var host = $("#stashGrid"), empty = $("#stashEmpty");
      var items = state.stash.map(productById).filter(Boolean);
      empty.hidden = items.length !== 0;
      host.innerHTML = items.map(function (p) { return cardHTML(p, { meter: true }); }).join("");
      wireCards(host);
      $("#stashCount").textContent = items.length + (items.length === 1 ? " PIECE" : " PIECES");
    }
    render();
    document.addEventListener("stash:change", render);
  }

  /* ================= PAGE: CART / CHECKOUT ================= */
  function pageCart() {
    var root = $("#cartRoot");
    var step = 0; // 0 cart, 1 shipping, 2 confirm

    function render() {
      if (!state.cart.length && step !== 2) {
        root.innerHTML = '<p class="cart-empty">CART&rsquo;S EMPTY.<br><a href="shop.html" style="color:var(--neon)">GO COP SOMETHING.</a></p>';
        return;
      }
      if (step === 0) return renderCart();
      if (step === 1) return renderShipping();
      if (step === 2) return renderConfirm();
    }

    function steps(active) {
      return '<ol class="checkout-steps">' +
        ["CART", "SHIPPING", "CONFIRMED"].map(function (s, i) {
          return '<li class="' + (i === active ? "on" : i < active ? "done" : "") + '">' + s + '</li>';
        }).join("") + '</ol>';
    }

    function renderCart() {
      root.innerHTML = steps(0) +
        '<div class="cart-layout"><div class="cart-list" id="cartList"></div>' +
        '<aside class="summary"><h3>Summary</h3>' +
          '<div class="summary-row"><span>Subtotal</span><span id="sumSub">' + money(cartSubtotal()) + '</span></div>' +
          '<div class="summary-row"><span>Shipping</span><span>' + (cartSubtotal() >= 200 ? "FREE" : "$12.00") + '</span></div>' +
          '<div class="summary-row total"><span>Total</span><span id="sumTot">' + money(cartSubtotal() + (cartSubtotal() >= 200 ? 0 : 12)) + '</span></div>' +
          '<button class="btn block" id="toShipping" style="margin-top:1rem">CONTINUE</button>' +
          '<a class="btn ghost block" href="shop.html" style="margin-top:.6rem">KEEP SHOPPING</a>' +
        '</aside></div>';
      var list = $("#cartList");
      list.innerHTML = state.cart.map(function (it) {
        return '<div class="cart-row" data-cid="' + esc(it.cid) + '">' +
          '<div class="cart-row-media"><img src="' + esc(it.photo) + '" alt=""></div>' +
          '<div><p class="cart-row-name">' + esc(it.name) + '</p>' +
          '<p class="cart-row-meta">' + esc(it.colorway) + (it.size ? " &middot; SIZE " + esc(it.size) : "") + '</p>' +
          '<span class="mini-qty"><button data-d="-1" aria-label="Less">&minus;</button><span>' + it.qty + '</span><button data-d="1" aria-label="More">+</button></span></div>' +
          '<div class="cart-row-right"><span class="cart-row-price">' + money(it.price * it.qty) + '</span>' +
          '<button class="cart-row-remove" data-remove>REMOVE</button></div></div>';
      }).join("");
      $$(".cart-row", list).forEach(function (row) {
        var cid = row.dataset.cid;
        row.querySelectorAll(".mini-qty button").forEach(function (b) {
          b.addEventListener("click", function () { changeQty(cid, +b.dataset.d); render(); });
        });
        row.querySelector("[data-remove]").addEventListener("click", function () { removeFromCart(cid); render(); toast("Removed."); });
      });
      $("#toShipping").addEventListener("click", function () { step = 1; render(); });
    }

    function renderShipping() {
      root.innerHTML = steps(1) +
        '<div class="cart-layout"><form id="shipForm" novalidate>' +
          '<label class="field-label" for="sfName">Full name</label><input class="field-input" id="sfName" autocomplete="name" required>' +
          '<label class="field-label" for="sfAddr">Address</label><input class="field-input" id="sfAddr" autocomplete="street-address" required>' +
          '<div class="field-grid thirds">' +
            '<div><label class="field-label" for="sfCity">City</label><input class="field-input" id="sfCity" autocomplete="address-level2" required></div>' +
            '<div><label class="field-label" for="sfState">State / Region</label><select class="ds-select" id="sfState" aria-label="State"></select></div>' +
            '<div><label class="field-label" for="sfZip">ZIP</label><input class="field-input" id="sfZip" autocomplete="postal-code" required></div>' +
          '</div>' +
          '<label class="field-label" for="sfCountry">Country</label><select class="ds-select" id="sfCountry" aria-label="Country"></select>' +
          '<label class="field-label" for="sfEmail">Email</label><input class="field-input" id="sfEmail" type="email" autocomplete="email" required>' +
          '<label class="field-label" for="sfShip">Delivery speed</label><select class="ds-select" id="sfShip" aria-label="Delivery speed"><option value="std">Standard - 5 to 7 days</option><option value="exp">Express - 2 days (+$18)</option></select>' +
          '<p class="form-note">This is a demo. No payment is collected, nothing is shipped anywhere, no email is sent.</p>' +
          '<div style="display:flex;gap:.7rem;margin-top:1.2rem;flex-wrap:wrap"><button class="btn" type="submit">PLACE ORDER</button><button class="btn ghost" type="button" id="backCart">BACK</button></div>' +
        '</form>' +
        '<aside class="summary"><h3>Order</h3>' +
          state.cart.map(function (it) { return '<div class="summary-row"><span>' + it.qty + '&times; ' + esc(it.name) + '</span><span>' + money(it.price * it.qty) + '</span></div>'; }).join("") +
          '<div class="summary-row total"><span>Total</span><span id="shipTotal">' + money(cartSubtotal()) + '</span></div>' +
        '</aside></div>';

      var countries = ["United States", "Canada", "United Kingdom", "Germany", "Japan", "Australia", "Pakistan", "India", "Brazil", "Nigeria"];
      var usStates = ["CA", "NY", "TX", "FL", "IL", "WA", "OR", "GA", "PA", "MA", "CO", "AZ"];
      $("#sfCountry").innerHTML = countries.map(function (c) { return '<option>' + c + '</option>'; }).join("");
      $("#sfState").innerHTML = usStates.map(function (s) { return '<option>' + s + '</option>'; }).join("");
      enhanceSelects(root);

      function recalcTotal() {
        var t = cartSubtotal() + (cartSubtotal() >= 200 ? 0 : 12) + ($("#sfShip").value === "exp" ? 18 : 0);
        $("#shipTotal").textContent = money(t);
      }
      recalcTotal();
      $("#sfShip").addEventListener("change", recalcTotal);
      $("#backCart").addEventListener("click", function () { step = 0; render(); });
      $("#shipForm").addEventListener("submit", function (e) {
        e.preventDefault();
        if (!this.checkValidity()) { this.reportValidity(); return; }
        var order = {
          num: "DS-" + Date.now().toString().slice(-6),
          name: $("#sfName").value.trim(),
          email: $("#sfEmail").value.trim(),
          items: state.cart.slice(),
          total: cartSubtotal() + (cartSubtotal() >= 200 ? 0 : 12) + ($("#sfShip").value === "exp" ? 18 : 0),
          country: $("#sfCountry").value,
          ts: Date.now()
        };
        state.orders.unshift(order); save(K.orders, state.orders);
        state.cart = []; saveCart(); updateCartBadge();
        window._lastOrder = order;
        step = 2; render();
        toast("Order confirmed: " + order.num);
      });
    }

    function renderConfirm() {
      var o = window._lastOrder || state.orders[0] || { num: "DS-000000", name: "friend" };
      root.innerHTML = steps(2) +
        '<div style="max-width:520px;margin:2rem auto;text-align:center">' +
          '<div class="confirm-stamp">JUST DROPPED</div>' +
          '<h2 style="font-family:var(--display);font-size:2rem;margin:0 0 .5rem;text-transform:uppercase">Order confirmed</h2>' +
          '<p style="font-family:var(--display);font-size:1.3rem;letter-spacing:.05em">#' + esc(o.num) + '</p>' +
          '<p style="color:var(--mute);line-height:1.6;margin:1rem 0 1.5rem">Locked in, ' + esc(o.name || "friend") + '. This is a front-end demo - no real order was placed and nothing was charged. Your gear lives in your order history.</p>' +
          '<div style="display:flex;gap:.7rem;justify-content:center;flex-wrap:wrap"><a class="btn" href="orders.html">VIEW ORDER HISTORY</a><a class="btn ghost" href="shop.html">BACK TO SHOP</a></div>' +
        '</div>';
    }

    render();
    document.addEventListener("cart:change", function () { if (step === 0) render(); });
  }

  /* ================= PAGE: ORDERS ================= */
  function pageOrders() {
    var root = $("#ordersRoot");
    if (!state.orders.length) {
      root.innerHTML = '<p class="cart-empty">NO ORDERS YET.<br><a href="shop.html" style="color:var(--neon)">START A COLLECTION.</a></p>';
      return;
    }
    root.innerHTML = state.orders.map(function (o) {
      return '<div class="summary" style="position:static;margin-bottom:1.2rem;max-width:none">' +
        '<div class="summary-row total" style="margin-top:0;border:none;padding-top:0"><span>#' + esc(o.num) + '</span><span>' + money(o.total) + '</span></div>' +
        '<p class="form-note" style="margin:0 0 .8rem">' + new Date(o.ts).toLocaleDateString() + ' &middot; ' + esc(o.country || "") + '</p>' +
        o.items.map(function (it) { return '<div class="summary-row"><span>' + it.qty + '&times; ' + esc(it.name) + ' (' + esc(it.colorway) + (it.size ? ", " + esc(it.size) : "") + ')</span><span>' + money(it.price * it.qty) + '</span></div>'; }).join("") +
      '</div>';
    }).join("");
  }

  /* ================= BOOT ================= */
  document.addEventListener("DOMContentLoaded", function () {
    toastStack = document.createElement("div");
    toastStack.className = "toast-stack";
    document.body.appendChild(toastStack);
    var noise = document.createElement("div");
    noise.className = "noise"; noise.setAttribute("aria-hidden", "true");
    document.body.appendChild(noise);

    renderChrome();

    var pages = {
      home: pageHome, shop: pageShop, product: pageProduct,
      lookbook: pageLookbook, stash: pageStash, cart: pageCart, orders: pageOrders
    };
    var fn = pages[document.body.dataset.page];
    if (fn) fn();

    document.addEventListener("cart:change", updateCartBadge);
  });
})();
