(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------- footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- toast ---------- */
  function toast(msg) {
    var wrap = document.getElementById('toastWrap');
    if (!wrap) return;
    var el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    wrap.appendChild(el);
    setTimeout(function () {
      el.classList.add('out');
      el.addEventListener('animationend', function () { el.remove(); }, { once: true });
    }, 2600);
  }

  /* ================================================================
     CUSTOM SELECT  (themed dropdown)
     Markup: <div class="sel" data-sel> .sel-trigger / .sel-panel ul
             + sibling <select class="sel-native">
  ================================================================ */
  function initSelect(root) {
    var native = root.parentElement.querySelector('.sel-native');
    var trigger = $('.sel-trigger', root);
    var panel = $('.sel-panel', root);
    var valueEl = $('.sel-value', root);
    if (!native || !trigger || !panel) return;

    function build() {
      panel.innerHTML = '';
      $$('option', native).forEach(function (opt) {
        var li = document.createElement('li');
        li.className = 'sel-opt';
        li.setAttribute('role', 'option');
        li.dataset.value = opt.value;
        li.textContent = opt.textContent;
        li.setAttribute('aria-selected', opt.selected ? 'true' : 'false');
        li.addEventListener('click', function () { choose(opt.value); });
        panel.appendChild(li);
      });
      sync();
    }

    function sync() {
      var sel = native.options[native.selectedIndex];
      if (valueEl) valueEl.textContent = sel ? sel.textContent : '';
      $$('.sel-opt', panel).forEach(function (li) {
        li.setAttribute('aria-selected', li.dataset.value === native.value ? 'true' : 'false');
      });
    }

    function open() {
      root.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      document.addEventListener('click', outside, true);
      document.addEventListener('keydown', onKey);
    }
    function close() {
      root.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
      document.removeEventListener('click', outside, true);
      document.removeEventListener('keydown', onKey);
    }
    function outside(e) { if (!root.contains(e.target)) close(); }
    function onKey(e) { if (e.key === 'Escape') { close(); trigger.focus(); } }

    function choose(val) {
      native.value = val;
      native.dispatchEvent(new Event('change', { bubbles: true }));
      sync();
      close();
      trigger.focus();
    }

    trigger.addEventListener('click', function () {
      root.classList.contains('is-open') ? close() : open();
    });
    native.addEventListener('change', sync);
    build();
  }
  $$('[data-sel]').forEach(initSelect);

  /* ================================================================
     NUMBER STEPPER
  ================================================================ */
  function makeStepper(value, min, max, onChange) {
    var wrap = document.createElement('div');
    wrap.className = 'stepper';
    var dec = document.createElement('button');
    dec.type = 'button'; dec.textContent = '−'; dec.setAttribute('aria-label', 'One fewer');
    var input = document.createElement('input');
    input.type = 'number'; input.value = value; input.min = min; input.max = max;
    input.setAttribute('aria-label', 'Quantity');
    var inc = document.createElement('button');
    inc.type = 'button'; inc.textContent = '+'; inc.setAttribute('aria-label', 'One more');

    function clamp(n) { return Math.max(min, Math.min(max, isNaN(n) ? min : n)); }
    function set(n, fire) {
      n = clamp(n);
      input.value = n;
      dec.disabled = n <= min;
      inc.disabled = n >= max;
      if (fire !== false) onChange(n);
    }
    dec.addEventListener('click', function () { set(parseInt(input.value, 10) - 1); });
    inc.addEventListener('click', function () { set(parseInt(input.value, 10) + 1); });
    input.addEventListener('input', function () { set(parseInt(input.value, 10)); });
    input.addEventListener('blur', function () { set(parseInt(input.value, 10)); });

    wrap.appendChild(dec); wrap.appendChild(input); wrap.appendChild(inc);
    set(value, false);
    return { el: wrap, set: function (n) { set(n); }, get: function () { return parseInt(input.value, 10); } };
  }

  /* ================================================================
     HONEYCOMB
  ================================================================ */
  var CELLS = {
    wildflower: {
      kind: 'jar', taste: 'balanced',
      tag: 'Varietal', title: 'Wildflower Honey', price: '$12 / 12oz jar',
      desc: 'Sun-warmed meadow blend, floral and bright, with a clean citrus finish. Whatever is blooming that week ends up in the jar.',
      pairs: ['A wedge of sharp cheddar', 'Warm cornbread', 'Plain Greek yogurt']
    },
    waggle: {
      kind: 'wisdom', tag: 'Hive Wisdom', title: 'The Waggle Dance',
      desc: 'A foraging bee performs a figure-eight dance on the comb to tell her sisters exactly where the best flowers are - direction, distance, even quality, all in a wiggle.'
    },
    lavender: {
      kind: 'jar', taste: 'delicate',
      tag: 'Varietal', title: 'Lavender Honey', price: '$14 / 12oz jar',
      desc: 'Infused with Provence lavender grown along our southern fence line. Calming florals sit over a soft caramel base.',
      pairs: ['A pot of Earl Grey', 'Shortbread', 'Goat cheese on toast']
    },
    queen: {
      kind: 'wisdom', tag: 'Hive Wisdom', title: 'Queen for Life',
      desc: 'A queen can lay up to 2,000 eggs a day and live two to five years. Her summer workers, by contrast, wear out and are gone within six weeks.'
    },
    buckwheat: {
      kind: 'jar', taste: 'robust',
      tag: 'Varietal', title: 'Buckwheat Honey', price: '$13 / 12oz jar',
      desc: 'Dark, robust, and malty - like molasses met a forest floor. Iron-rich, bold, and not for the faint of toast.',
      pairs: ['Aged blue cheese', 'A glaze for roast pork', 'Black coffee, stirred in']
    },
    pollinator: {
      kind: 'wisdom', tag: 'Hive Wisdom', title: 'One in Three Bites',
      desc: 'Roughly one out of every three bites of food we eat exists because a pollinator, often a honeybee, visited a flower first.'
    },
    orange: {
      kind: 'jar', taste: 'delicate',
      tag: 'Varietal', title: 'Orange Blossom Honey', price: '$13 / 12oz jar',
      desc: 'Light and citrus-sweet, harvested each spring beneath the blossoming groves two valleys over.',
      pairs: ['Ricotta and berries', 'A drizzle over pancakes', 'Sparkling water and lemon']
    },
    comb: {
      kind: 'jar', taste: 'balanced',
      tag: 'Whole Comb', title: 'Raw Comb Cut', price: '$18 / 8oz cut',
      desc: 'Honey still sealed inside its original wax cells. Chew it like nature intended, wax and all.',
      pairs: ['A cheese board, whole', 'Buttered sourdough', 'Straight off the knife']
    },
    clover: {
      kind: 'jar', taste: 'delicate',
      tag: 'Varietal', title: 'Clover Honey', price: '$11 / 12oz jar',
      desc: 'Our house classic: mild, golden, and endlessly versatile. The honey jar you probably grew up with.',
      pairs: ['Peanut butter sandwiches', 'A spoon in hot tea', 'Baking, anything']
    }
  };

  var FACTS = [
    'Tap a cell to break its seal.',
    'Bees from one hive may visit 50 million flowers to fill a single jar.',
    'A honeybee flies about 15 miles per hour.',
    'The buzz you hear is her wings beating 230 times a second.',
    'Honey never spoils. Sealed jars have been found edible after 3,000 years.',
    'Foragers tell temperature by the flowers, and time by the sun.'
  ];

  var grid = document.getElementById('honeycombGrid');
  var panel = document.getElementById('combPanel');
  var panelEmpty = document.getElementById('combPanelEmpty');
  var cpeFact = document.getElementById('cpeFact');
  var combCount = document.getElementById('combCount');
  var hexButtons = grid ? $$('.hex', grid) : [];
  var factTimer = null;

  function rotateFacts() {
    if (reduceMotion || !cpeFact) return;
    var i = 1;
    clearInterval(factTimer);
    factTimer = setInterval(function () {
      if (!panelEmpty || !panelEmpty.isConnected) { clearInterval(factTimer); return; }
      cpeFact.textContent = FACTS[i % FACTS.length];
      i++;
    }, 5000);
  }

  function renderCell(key) {
    var data = CELLS[key];
    if (!data || !panel) return;
    clearInterval(factTimer);

    var html = '<div class="panel-card">' +
      '<button class="panel-close" type="button" aria-label="Reseal this cell">×</button>' +
      '<span class="panel-tag">' + data.tag + '</span>' +
      '<h3>' + data.title + '</h3>' +
      (data.price ? '<p class="panel-price">' + data.price + '</p>' : '') +
      '<p class="panel-desc">' + data.desc + '</p>';

    if (data.pairs && data.pairs.length) {
      html += '<div class="panel-notes"><h4>Pour it over</h4><ul>' +
        data.pairs.map(function (p) { return '<li>' + p + '</li>'; }).join('') +
        '</ul></div>';
    }
    if (data.kind === 'jar') {
      html += '<button class="btn btn-primary panel-add" type="button" data-add="' + key + '">Add to your box</button>';
    }
    html += '</div>';
    panel.innerHTML = html;

    $('.panel-close', panel).addEventListener('click', resetPanel);
    var addBtn = $('[data-add]', panel);
    if (addBtn) addBtn.addEventListener('click', function () {
      addJarByCell(key);
    });
  }

  function resetPanel() {
    if (!panel || !panelEmpty) return;
    hexButtons.forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
    panel.innerHTML = '';
    panel.appendChild(panelEmpty);
    if (cpeFact) cpeFact.textContent = FACTS[0];
    rotateFacts();
  }

  if (grid) {
    var activeHex = null;

    function activate(btn) {
      if (activeHex === btn) { resetPanel(); activeHex = null; return; }
      activeHex = btn;
      hexButtons.forEach(function (o) { o.setAttribute('aria-expanded', o === btn ? 'true' : 'false'); });
      renderCell(btn.getAttribute('data-cell'));
    }

    hexButtons.forEach(function (btn) {
      btn.addEventListener('click', function () { activate(btn); });
      btn.addEventListener('mouseenter', function () {
        if (window.matchMedia('(hover: hover)').matches && !activeHex) {
          hexButtons.forEach(function (o) { o.setAttribute('aria-expanded', o === btn ? 'true' : 'false'); });
          renderCell(btn.getAttribute('data-cell'));
        }
      });
    });
    grid.addEventListener('mouseleave', function () {
      if (!activeHex) resetPanel();
    });

    /* honey-fill reveal on scroll-in */
    var pour = function () { grid.classList.add('is-poured'); };
    if ('IntersectionObserver' in window && !reduceMotion) {
      var pourObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { pour(); pourObs.disconnect(); }
        });
      }, { threshold: 0.35 });
      pourObs.observe(grid);
      setTimeout(pour, 1800);
    } else {
      pour();
    }
    rotateFacts();
  }

  /* ---------- comb filter ---------- */
  var tasteSort = document.getElementById('tasteSort');
  if (tasteSort && grid) {
    tasteSort.addEventListener('change', function () {
      var v = tasteSort.value;
      var shown = 0;
      hexButtons.forEach(function (btn) {
        var d = CELLS[btn.getAttribute('data-cell')] || {};
        var match =
          v === 'all' ||
          (v === 'jars' && d.kind === 'jar') ||
          (v === 'wisdom' && d.kind === 'wisdom') ||
          (v === d.taste);
        btn.classList.toggle('is-dimmed', !match);
        if (match) shown++;
      });
      if (combCount) combCount.textContent = shown + (shown === 1 ? ' cell' : ' cells');
      if (activeHex && activeHex.classList.contains('is-dimmed')) { resetPanel(); activeHex = null; }
    });
  }

  /* ================================================================
     PROCESS scroll reveal
  ================================================================ */
  var steps = $$('.process-step');
  if (steps.length) {
    if ('IntersectionObserver' in window && !reduceMotion) {
      var stepObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            var delay = steps.indexOf(el) % 5 * 80;
            setTimeout(function () { el.classList.add('in-view'); }, delay);
            stepObs.unobserve(el);
          }
        });
      }, { threshold: 0.2, rootMargin: '0px 0px -60px 0px' });
      steps.forEach(function (s) { stepObs.observe(s); });
      setTimeout(function () { steps.forEach(function (s) { s.classList.add('in-view'); }); }, 2400);
    } else {
      steps.forEach(function (s) { s.classList.add('in-view'); });
    }
  }

  /* ================================================================
     HARVEST CALENDAR
  ================================================================ */
  var CAL = [
    { m: 'Jan', bloom: 'Hives clustered tight. No forage - the bees live on last summer’s stores.', jars: [] },
    { m: 'Feb', bloom: 'First hazel and willow catkins. A trickle of pollen, no surplus yet.', jars: [] },
    { m: 'Mar', bloom: 'Fruit blossom opens two valleys over.', jars: ['Orange Blossom (last year’s)'] },
    { m: 'Apr', bloom: 'Orchards in full bloom, dandelions everywhere.', jars: ['Orange Blossom'] },
    { m: 'May', bloom: 'Clover and the first meadow flowers come on strong.', jars: ['Clover', 'Wildflower'] },
    { m: 'Jun', bloom: 'Peak meadow. Everything the bees can reach is open.', jars: ['Wildflower', 'Clover', 'Raw Comb Cut'] },
    { m: 'Jul', bloom: 'Lavender along the south fence; late wildflower.', jars: ['Lavender', 'Wildflower', 'Raw Comb Cut'] },
    { m: 'Aug', bloom: 'Buckwheat field in flower - dark honey weather.', jars: ['Buckwheat', 'Wildflower'] },
    { m: 'Sep', bloom: 'Goldenrod and aster, the last big flow of the year.', jars: ['Wildflower', 'Buckwheat'] },
    { m: 'Oct', bloom: 'Bees packing the brood nest with winter stores.', jars: ['Raw Comb Cut'] },
    { m: 'Nov', bloom: 'Forage over. We leave every frame the colony needs.', jars: [] },
    { m: 'Dec', bloom: 'The cluster tightens. Nothing leaves the hive.', jars: [] }
  ];
  var calMonths = document.getElementById('calMonths');
  var calMonthName = document.getElementById('calMonthName');
  var calBloom = document.getElementById('calBloom');
  var calJars = document.getElementById('calJars');

  if (calMonths) {
    CAL.forEach(function (entry, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.textContent = entry.m;
      if (entry.jars.length) b.classList.add('has-jars');
      b.addEventListener('click', function () { showMonth(i); });
      calMonths.appendChild(b);
    });
    function showMonth(i) {
      var e = CAL[i];
      $$('button', calMonths).forEach(function (btn, idx) {
        btn.setAttribute('aria-selected', idx === i ? 'true' : 'false');
      });
      calMonthName.textContent = { Jan: 'January', Feb: 'February', Mar: 'March', Apr: 'April', May: 'May', Jun: 'June', Jul: 'July', Aug: 'August', Sep: 'September', Oct: 'October', Nov: 'November', Dec: 'December' }[e.m];
      calBloom.textContent = e.bloom;
      calJars.innerHTML = e.jars.length
        ? e.jars.map(function (j) { return '<li>' + j + '</li>'; }).join('')
        : '<li class="none">Nothing new to jar this month.</li>';
    }
    showMonth(new Date().getMonth());
  }

  /* ================================================================
     THE HIVES  (roster + dashboard)
  ================================================================ */
  var HIVES = [
    { n: 1, name: 'Old Willow', queen: 'Queen Bramble, 3rd year', forage: 'Creek-side willow and clover', mood: 'calm' },
    { n: 2, name: 'The Landing', queen: 'Queen Juniper, 2nd year', forage: 'Orchard blossom in spring', mood: 'busy' },
    { n: 3, name: 'Sunrise Row', queen: 'Queen Marigold, 1st year', forage: 'East meadow wildflower', mood: 'calm' },
    { n: 4, name: 'Fencepost', queen: 'Queen Sage, 2nd year', forage: 'Lavender along the south line', mood: 'calm' },
    { n: 5, name: 'The Buckwheat Hive', queen: 'Queen Cinder, 3rd year', forage: 'The buckwheat field, August', mood: 'feisty' },
    { n: 6, name: 'Little Elm', queen: 'Queen Poppy, 1st year', forage: 'Dandelion and early clover', mood: 'busy' },
    { n: 7, name: 'Hollow Log', queen: 'Queen Fern, 4th year', forage: 'Whatever is closest, always', mood: 'calm' },
    { n: 8, name: 'The Overlook', queen: 'Queen Hazel, 2nd year', forage: 'High meadow aster and goldenrod', mood: 'busy' },
    { n: 9, name: 'Stone Wall', queen: 'Queen Dahlia, 1st year', forage: 'Orange grove, two valleys over', mood: 'calm' },
    { n: 10, name: 'The Split', queen: 'Queen Wren, 1st year', forage: 'New colony, still finding range', mood: 'busy' },
    { n: 11, name: 'Meadowbrook', queen: 'Queen Clover, 3rd year', forage: 'The heart of the wildflower meadow', mood: 'calm' },
    { n: 12, name: 'Last Light', queen: 'Queen Ember, 2nd year', forage: 'West edge, late-season flow', mood: 'feisty' }
  ];
  var roster = document.getElementById('hiveRoster');
  if (roster) {
    var moodWord = { calm: 'Calm', busy: 'Busy', feisty: 'Feisty' };
    roster.innerHTML = HIVES.map(function (h) {
      return '<article class="hive-card">' +
        '<div class="hive-card-top"><h3>' + h.name + '</h3><span class="hive-no">No. ' + h.n + '</span></div>' +
        '<p class="hive-queen">' + h.queen + '</p>' +
        '<span class="hive-mood ' + h.mood + '">' + moodWord[h.mood] + ' today</span>' +
        '<p class="hive-forage">' + h.forage + '</p>' +
        '</article>';
    }).join('');
  }

  /* dashboard count-up */
  var dashNums = $$('.dash-num');
  function countUp(el) {
    var target = parseFloat(el.dataset.count);
    var decimals = parseInt(el.dataset.decimals || '0', 10);
    var suffix = el.dataset.suffix || '';
    var live = el.dataset.live === '1';
    function paint(v) {
      var num = live ? Math.round(v).toLocaleString() : v.toFixed(decimals);
      el.innerHTML = num + suffix;
    }
    if (reduceMotion) { paint(target); return; }
    var steps = 32, i = 0;
    var timer = setInterval(function () {
      i++;
      var p = i / steps;
      var eased = 1 - Math.pow(1 - p, 3);
      paint(target * eased);
      if (i >= steps) { clearInterval(timer); paint(target); }
    }, 34);
  }
  var dash = document.getElementById('hiveDash');
  var dashRan = false;
  function runDash() {
    if (dashRan) return;
    dashRan = true;
    dashNums.forEach(countUp);
    startForagerDrift();
  }
  if (dash && dashNums.length) {
    if ('IntersectionObserver' in window) {
      var dashObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { runDash(); dashObs.disconnect(); }
        });
      }, { threshold: 0.4 });
      dashObs.observe(dash);
      setTimeout(runDash, 3000);
    } else {
      runDash();
    }
  }
  function startForagerDrift() {
    if (reduceMotion) return;
    var el = document.getElementById('foragersOut');
    if (!el) return;
    setInterval(function () {
      var base = 9200;
      var drift = Math.round((Math.random() - 0.5) * 900);
      el.textContent = (base + drift).toLocaleString();
    }, 3500);
  }

  /* ================================================================
     BUILD A BOX
  ================================================================ */
  var JARS = [
    { id: 'clover', name: 'Clover Honey', taste: 'Delicate', base: 11, note: 'House classic - mild and golden.' },
    { id: 'orange', name: 'Orange Blossom', taste: 'Delicate', base: 13, note: 'Light, citrus-sweet, spring-harvested.' },
    { id: 'lavender', name: 'Lavender Honey', taste: 'Delicate', base: 14, note: 'Calming florals over soft caramel.' },
    { id: 'wildflower', name: 'Wildflower Honey', taste: 'Balanced', base: 12, note: 'Bright meadow blend, citrus finish.' },
    { id: 'comb', name: 'Raw Comb Cut', taste: 'Balanced', base: 18, note: 'Honey sealed in its own wax. 8oz cut.' },
    { id: 'buckwheat', name: 'Buckwheat Honey', taste: 'Robust', base: 13, note: 'Dark, malty, iron-rich. Bold on toast.' }
  ];
  var SIZE_MULT = { '8': 0.72, '12': 1, '16': 1.34 };
  var SIZE_LABEL = { '8': '8oz', '12': '12oz', '16': '1lb' };

  var box = {};
  try { box = JSON.parse(localStorage.getItem('willowcombBox')) || {}; } catch (e) { box = {}; }
  var jarSize = document.getElementById('jarSize');
  var jarListEl = document.getElementById('jarList');
  var steppers = {};

  function saveBox() {
    try { localStorage.setItem('willowcombBox', JSON.stringify(box)); } catch (e) {}
  }
  function priceFor(jar) {
    var mult = SIZE_MULT[jarSize ? jarSize.value : '12'] || 1;
    return jar.base * mult;
  }
  function money(n) { return '$' + n.toFixed(2); }

  function renderJarList() {
    if (!jarListEl) return;
    jarListEl.innerHTML = '';
    steppers = {};
    JARS.forEach(function (jar) {
      var li = document.createElement('li');
      li.className = 'jar-row';
      var qty = box[jar.id] || 0;
      if (qty > 0) li.classList.add('in-box');

      var info = document.createElement('div');
      info.className = 'jar-info';
      info.innerHTML = '<h3>' + jar.name + '</h3><p>' + jar.note + '</p>' +
        '<span class="jar-taste">' + jar.taste + '</span>';

      var price = document.createElement('div');
      price.className = 'jar-price';
      price.textContent = money(priceFor(jar)) + ' / ' + SIZE_LABEL[jarSize ? jarSize.value : '12'];

      var st = makeStepper(qty, 0, 12, function (n) {
        if (n > 0) box[jar.id] = n; else delete box[jar.id];
        li.classList.toggle('in-box', n > 0);
        saveBox();
        renderSummary();
      });
      steppers[jar.id] = st;

      li.appendChild(info);
      li.appendChild(price);
      li.appendChild(st.el);
      jarListEl.appendChild(li);
    });
  }

  var summaryLines = document.getElementById('summaryLines');
  var summaryTotals = document.getElementById('summaryTotals');
  var sumJars = document.getElementById('sumJars');
  var sumSubtotal = document.getElementById('sumSubtotal');
  var sumPerk = document.getElementById('sumPerk');
  var sumGrand = document.getElementById('sumGrand');
  var reserveBtn = document.getElementById('reserveBtn');
  var summaryNote = document.getElementById('summaryNote');

  function renderSummary() {
    if (!summaryLines) return;
    var ids = Object.keys(box).filter(function (id) { return box[id] > 0; });
    var count = 0, subtotal = 0;

    if (!ids.length) {
      summaryLines.innerHTML = '<li class="summary-empty">No jars yet. Add a few from the list.</li>';
      summaryTotals.hidden = true;
      reserveBtn.disabled = true;
      summaryNote.textContent = 'A jar or two makes a fine start.';
      return;
    }

    summaryLines.innerHTML = ids.map(function (id) {
      var jar = JARS.find(function (j) { return j.id === id; });
      var q = box[id];
      var line = priceFor(jar) * q;
      count += q;
      subtotal += line;
      return '<li><span>' + q + '× ' + jar.name + '</span><span>' + money(line) + '</span></li>';
    }).join('');

    var freeComb = count >= 3;
    summaryTotals.hidden = false;
    sumJars.textContent = count;
    sumSubtotal.textContent = money(subtotal);
    sumPerk.hidden = !freeComb;
    sumGrand.textContent = money(subtotal);
    reserveBtn.disabled = false;

    if (count >= 3) summaryNote.textContent = 'Ships free, with a comb cut on us.';
    else summaryNote.textContent = (3 - count) + ' more for free shipping and a comb cut.';
  }

  function addJarByCell(cellKey) {
    var jar = JARS.find(function (j) { return j.id === cellKey; });
    if (!jar) { toast('That one is not in the box builder yet.'); return; }
    var next = Math.min(12, (box[jar.id] || 0) + 1);
    box[jar.id] = next;
    saveBox();
    if (steppers[jar.id]) steppers[jar.id].set(next);
    renderSummary();
    toast(jar.name + ' added to your box');
    var target = document.getElementById('build-a-box');
    if (target) target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }

  if (jarSize) {
    jarSize.addEventListener('change', function () { renderJarList(); renderSummary(); });
  }
  if (reserveBtn) {
    reserveBtn.addEventListener('click', function () {
      var count = Object.keys(box).reduce(function (a, id) { return a + (box[id] || 0); }, 0);
      toast('Box reserved - ' + count + (count === 1 ? ' jar' : ' jars') + '. We’ll email you to arrange pickup.');
      box = {};
      saveBox();
      renderJarList();
      renderSummary();
    });
  }
  renderJarList();
  renderSummary();

  /* ================================================================
     ADOPT A HIVE tiers
  ================================================================ */
  var TIERS = [
    { name: 'The Frame', price: '$60', per: 'for the season', blurb: 'A share of one hive’s summer.',
      perks: ['Two 12oz jars as they’re harvested', 'Your name on the hive', 'Seasonal dispatch from the meadow'] },
    { name: 'The Colony', price: '$140', per: 'for the season', featured: true, badge: 'Most adopted',
      blurb: 'The whole year of one hive, start to finish.',
      perks: ['Six jars across the season', 'A raw comb cut in high summer', 'Your name on the hive and the label', 'Invite to the autumn extraction day'] },
    { name: 'The Beeyard', price: '$320', per: 'for the season',
      blurb: 'A hand in the whole operation.',
      perks: ['A jar from every varietal we press', 'Two comb cuts', 'A guided visit for four', 'First pick of small-batch releases'] }
  ];
  var tierGrid = document.getElementById('tierGrid');
  if (tierGrid) {
    tierGrid.innerHTML = TIERS.map(function (t) {
      return '<article class="tier-card' + (t.featured ? ' featured' : '') + '">' +
        (t.badge ? '<span class="tier-badge">' + t.badge + '</span>' : '') +
        '<h3>' + t.name + '</h3>' +
        '<p class="tier-price">' + t.price + ' <span>' + t.per + '</span></p>' +
        '<p>' + t.blurb + '</p>' +
        '<ul class="tier-perks">' + t.perks.map(function (p) { return '<li>' + p + '</li>'; }).join('') + '</ul>' +
        '<button class="btn btn-primary" type="button" data-tier="' + t.name + '">Adopt ' + t.name + '</button>' +
        '</article>';
    }).join('');
    tierGrid.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-tier]');
      if (!btn) return;
      toast('Nice - ' + btn.dataset.tier + ' adoption. Drop your email below and we’ll set it up.');
      var club = document.getElementById('hive-club');
      if (club) club.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      var input = document.getElementById('hiveEmail');
      if (input) setTimeout(function () { input.focus(); }, reduceMotion ? 0 : 500);
    });
  }

  /* ================================================================
     HIVE CLUB signup  (+ pollen burst + bee counter)
  ================================================================ */
  var STORAGE_KEY = 'willowcombHiveClub';
  var form = document.getElementById('hiveForm');
  var emailInput = document.getElementById('hiveEmail');
  var msgEl = document.getElementById('hiveFormMsg');

  function getSignups() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      var list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (e) { return []; }
  }
  function saveSignup(email) {
    try {
      var list = getSignups();
      if (list.indexOf(email) === -1) list.push(email);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {}
  }
  function isValidEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }
  function showMessage(text, kind) {
    if (!msgEl) return;
    msgEl.textContent = text;
    msgEl.classList.remove('is-success', 'is-error');
    if (kind) msgEl.classList.add(kind);
  }
  function beeNumber() { return 46 + getSignups().length; }

  function pollenBurst(originEl) {
    if (reduceMotion || !originEl) return;
    var section = document.querySelector('.hive-club-section');
    if (!section) return;
    var r = originEl.getBoundingClientRect();
    var sr = section.getBoundingClientRect();
    var cx = r.left - sr.left + r.width / 2;
    var cy = r.top - sr.top + r.height / 2;
    for (var i = 0; i < 14; i++) {
      var p = document.createElement('span');
      p.className = 'pollen';
      p.style.left = cx + 'px';
      p.style.top = cy + 'px';
      var ang = Math.random() * Math.PI * 2;
      var dist = 40 + Math.random() * 90;
      p.style.setProperty('--px', Math.cos(ang) * dist + 'px');
      p.style.setProperty('--py', (Math.sin(ang) * dist - 20) + 'px');
      section.appendChild(p);
      (function (node) {
        requestAnimationFrame(function () { node.classList.add('go'); });
        setTimeout(function () { node.remove(); }, 1000);
      })(p);
    }
  }

  function showSuccessState(email, burstFrom) {
    if (!form) return;
    var wrap = form.querySelector('.hive-form-row');
    if (wrap) wrap.style.display = 'none';
    showMessage('You’re in the hive, ' + email + '. Watch your inbox for the next harvest.', 'is-success');
    var count = document.createElement('p');
    count.className = 'hive-bee-count';
    count.textContent = 'You’re bee no. ' + beeNumber() + ' in the Hive Club.';
    if (!form.querySelector('.hive-bee-count')) form.appendChild(count);
    if (burstFrom) pollenBurst(burstFrom);
  }

  if (form && emailInput) {
    var existing = getSignups();
    if (existing.length) showSuccessState(existing[existing.length - 1], null);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var value = emailInput.value.trim();
      if (!value || !isValidEmail(value)) {
        emailInput.classList.add('field-invalid');
        showMessage('That doesn’t look like a full email address - try again?', 'is-error');
        emailInput.focus();
        return;
      }
      emailInput.classList.remove('field-invalid');
      saveSignup(value);
      showSuccessState(value, form.querySelector('button[type="submit"]'));
    });
    emailInput.addEventListener('input', function () {
      emailInput.classList.remove('field-invalid');
    });
  }

  /* ================================================================
     HEADER: sticky shadow, mobile nav, scrollspy
  ================================================================ */
  var header = document.getElementById('siteHeader');
  var nav = document.getElementById('siteNav');
  var navToggle = document.getElementById('navToggle');
  var navLinks = nav ? $$('a', nav) : [];

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navLinks.forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  function onScroll() {
    var y = window.pageYOffset;
    if (header) header.classList.toggle('is-stuck', y > 8);

    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    var pct = max > 0 ? y / max : 0;
    var dipper = document.getElementById('scrollDipper');
    var dipFill = document.getElementById('dipFill');
    if (dipper) dipper.classList.toggle('is-visible', y > 400);
    if (dipFill) dipFill.style.transform = 'translateY(' + (22 - pct * 22).toFixed(1) + 'px)';

    var current = sections[0];
    sections.forEach(function (s) {
      if (s.getBoundingClientRect().top <= 120) current = s;
    });
    navLinks.forEach(function (a) {
      a.classList.toggle('is-current', current && a.getAttribute('href') === '#' + current.id);
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- hero parallax ---------- */
  var heroImg = document.querySelector('.hero-photo img');
  if (heroImg && !reduceMotion) {
    window.addEventListener('scroll', function () {
      var y = window.pageYOffset;
      if (y < window.innerHeight) heroImg.style.transform = 'translateY(' + (y * 0.18).toFixed(1) + 'px) scale(1.04)';
    }, { passive: true });
  }
})();
