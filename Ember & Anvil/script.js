/* ===== EMBER & ANVIL - script.js ===== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------
   * Footer year
   * ------------------------------------------------------- */
  var yearEl = document.getElementById("footerYear");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------
   * Mobile nav toggle
   * ------------------------------------------------------- */
  var navToggle = document.getElementById("navToggle");
  var primaryNav = document.getElementById("primaryNav");
  if (navToggle && primaryNav) {
    navToggle.addEventListener("click", function () {
      var open = primaryNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    primaryNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        primaryNav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------------------------------------------------------
   * Active nav link highlighting
   * ------------------------------------------------------- */
  var navLinks = document.querySelectorAll("[data-nav]");
  var navSections = Array.prototype.map.call(navLinks, function (link) {
    var id = link.getAttribute("href").replace("#", "");
    return document.getElementById(id);
  }).filter(Boolean);

  if ("IntersectionObserver" in window && navSections.length) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    navSections.forEach(function (section) { navObserver.observe(section); });
  }

  /* ---------------------------------------------------------
   * Scroll-driven metal tempering effect
   * Interpolates a CSS custom property across the classic
   * heat-tint spectrum: straw -> bronze -> purple -> blue
   * as the user scrolls through the hero + craft sections.
   * ------------------------------------------------------- */
  var temperTrack = document.querySelector(".temper-track");
  var temperReadout = document.getElementById("temperReadout");
  var root = document.documentElement;

  var temperStops = [
    { t: 0.00, rgb: [232, 197, 71], name: "straw" },   // pale gold
    { t: 0.33, rgb: [205, 127, 50], name: "bronze" },  // bronze/amber
    { t: 0.66, rgb: [122, 63, 160], name: "purple" },  // purple
    { t: 1.00, rgb: [42, 93, 158], name: "blue" }      // blue
  ];

  function lerp(a, b, t) { return a + (b - a) * t; }

  function colorAt(progress) {
    progress = Math.max(0, Math.min(1, progress));
    for (var i = 0; i < temperStops.length - 1; i++) {
      var a = temperStops[i], b = temperStops[i + 1];
      if (progress >= a.t && progress <= b.t) {
        var localT = (progress - a.t) / (b.t - a.t || 1);
        var rgb = [
          Math.round(lerp(a.rgb[0], b.rgb[0], localT)),
          Math.round(lerp(a.rgb[1], b.rgb[1], localT)),
          Math.round(lerp(a.rgb[2], b.rgb[2], localT))
        ];
        var name = localT < 0.5 ? a.name : b.name;
        return { rgb: rgb, name: name };
      }
    }
    var last = temperStops[temperStops.length - 1];
    return { rgb: last.rgb, name: last.name };
  }

  var tempTicking = false;
  function updateTemper() {
    tempTicking = false;
    if (!temperTrack) return;
    var rect = temperTrack.getBoundingClientRect();
    var total = rect.height - window.innerHeight;
    var scrolled = -rect.top;
    var progress = total > 0 ? scrolled / total : 0;
    var result = colorAt(progress);

    root.style.setProperty("--temper-color", "rgb(" + result.rgb.join(",") + ")");
    root.style.setProperty("--temper-color-rgb", result.rgb.join(","));
    if (temperReadout) temperReadout.textContent = result.name;
    var marker = document.getElementById("temperMarker");
    if (marker) marker.style.left = (Math.max(0, Math.min(1, progress)) * 100).toFixed(1) + "%";
  }

  function onScrollTemper() {
    if (!tempTicking) {
      window.requestAnimationFrame(updateTemper);
      tempTicking = true;
    }
  }

  window.addEventListener("scroll", onScrollTemper, { passive: true });
  window.addEventListener("resize", onScrollTemper);
  updateTemper();

  /* ---------------------------------------------------------
   * Process step reveal on scroll
   * ------------------------------------------------------- */
  var steps = document.querySelectorAll(".step");
  if ("IntersectionObserver" in window && steps.length) {
    var stepObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          stepObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25 });
    steps.forEach(function (step) { stepObserver.observe(step); });
  } else {
    steps.forEach(function (step) { step.classList.add("in-view"); });
  }

  /* ---------------------------------------------------------
   * Generic scroll-reveal (section heads, cards, form)
   * ------------------------------------------------------- */
  var revealTargets = document.querySelectorAll(".section-head, .reveal, .reveal-stagger");
  if ("IntersectionObserver" in window && revealTargets.length && !reduceMotion) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("revealed");
        revealObs.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    revealTargets.forEach(function (t) { revealObs.observe(t); });
  } else {
    revealTargets.forEach(function (t) { t.classList.add("revealed"); });
  }

  /* ---------------------------------------------------------
   * Forge tally: count up when the strip scrolls in
   * ------------------------------------------------------- */
  var countEls = document.querySelectorAll("[data-count-to]");
  function runCount(el) {
    var target = parseInt(el.getAttribute("data-count-to"), 10) || 0;
    var suffix = el.getAttribute("data-count-suffix") || "";
    if (reduceMotion || target <= 1) {
      el.textContent = target.toLocaleString() + suffix;
      return;
    }
    var start = null;
    var dur = 1500;
    function frame(ts) {
      if (start === null) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(eased * target).toLocaleString() + suffix;
      if (p < 1) window.requestAnimationFrame(frame);
      else el.textContent = target.toLocaleString() + suffix;
    }
    window.requestAnimationFrame(frame);
  }
  if ("IntersectionObserver" in window && countEls.length) {
    var countObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        runCount(entry.target);
        countObs.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    countEls.forEach(function (el) { countObs.observe(el); });
  } else {
    Array.prototype.forEach.call(countEls, runCount);
  }

  /* ---------------------------------------------------------
   * Themed <select>: a forged dropdown, no OS chrome
   * ------------------------------------------------------- */
  (function forgeSelects() {
    var openWrap = null;
    function closeOpen() { if (openWrap) { openWrap.classList.remove("cs-open"); openWrap = null; } }
    document.addEventListener("click", function (e) {
      if (openWrap && !e.target.closest(".cs")) closeOpen();
    });
    document.addEventListener("keydown", function (e) {
      if (openWrap && e.key === "Escape") { e.stopPropagation(); closeOpen(); }
    }, true);

    document.querySelectorAll("select").forEach(function (sel) {
      var wrap = document.createElement("div");
      wrap.className = "cs";
      sel.parentNode.insertBefore(wrap, sel);
      wrap.appendChild(sel);
      sel.classList.add("cs-native");

      var trigger = document.createElement("button");
      trigger.type = "button";
      trigger.className = "cs-trigger";
      trigger.setAttribute("aria-haspopup", "listbox");
      trigger.setAttribute("aria-expanded", "false");
      trigger.innerHTML = '<span class="cs-label"></span><span class="cs-chev" aria-hidden="true"></span>';

      var panel = document.createElement("div");
      panel.className = "cs-panel";
      panel.setAttribute("role", "listbox");
      wrap.appendChild(trigger);
      wrap.appendChild(panel);
      var label = trigger.querySelector(".cs-label");

      Array.prototype.forEach.call(sel.options, function (o, i) {
        var opt = document.createElement("div");
        opt.className = "cs-opt";
        opt.setAttribute("role", "option");
        opt.textContent = o.textContent;
        opt.addEventListener("click", function () {
          sel.selectedIndex = i;
          sync();
          sel.dispatchEvent(new Event("change", { bubbles: true }));
          closeOpen();
          trigger.focus();
        });
        panel.appendChild(opt);
      });

      function sync() {
        var o = sel.options[sel.selectedIndex];
        label.textContent = o ? o.textContent : "";
        panel.querySelectorAll(".cs-opt").forEach(function (el, i) {
          el.setAttribute("aria-selected", i === sel.selectedIndex ? "true" : "false");
        });
      }

      trigger.addEventListener("click", function () {
        var wasOpen = wrap.classList.contains("cs-open");
        closeOpen();
        if (!wasOpen) {
          wrap.classList.add("cs-open");
          trigger.setAttribute("aria-expanded", "true");
          openWrap = wrap;
        } else {
          trigger.setAttribute("aria-expanded", "false");
        }
      });
      trigger.addEventListener("keydown", function (e) {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          var next = sel.selectedIndex + (e.key === "ArrowDown" ? 1 : -1);
          sel.selectedIndex = Math.max(0, Math.min(sel.options.length - 1, next));
          sync();
          sel.dispatchEvent(new Event("change", { bubbles: true }));
        } else if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          trigger.click();
        }
      });

      new MutationObserver(function () {
        trigger.setAttribute("aria-expanded", wrap.classList.contains("cs-open") ? "true" : "false");
      }).observe(wrap, { attributes: true, attributeFilter: ["class"] });

      sync();
    });
  })();

  /* ---------------------------------------------------------
   * Blade-length slider readout
   * ------------------------------------------------------- */
  var lengthInput = document.getElementById("cLength");
  var lengthValue = document.getElementById("cLengthValue");
  function updateLength() {
    if (!lengthInput) return;
    var v = parseFloat(lengthInput.value);
    if (lengthValue) lengthValue.textContent = (v % 1 === 0 ? v : v.toFixed(1)) + '"';
    var min = parseFloat(lengthInput.min);
    var max = parseFloat(lengthInput.max);
    lengthInput.style.setProperty("--range-fill", (((v - min) / (max - min)) * 100).toFixed(1) + "%");
  }
  if (lengthInput) {
    lengthInput.addEventListener("input", updateLength);
    updateLength();
  }

  /* ---------------------------------------------------------
   * Hammer-strike interaction: canvas spark burst
   * ------------------------------------------------------- */
  var strikeBtn = document.getElementById("strikeBtn");
  var canvas = document.getElementById("sparkCanvas");
  var waresSection = document.getElementById("wares");
  var showcaseVeil = document.getElementById("showcaseVeil");
  var hasStruck = false;

  function sizeCanvas() {
    if (!canvas) return;
    var rect = canvas.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    var ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener("resize", sizeCanvas);
  sizeCanvas();

  var particles = [];
  var sparkAnimId = null;

  function spawnSparks() {
    if (!canvas) return;
    var rect = canvas.getBoundingClientRect();
    var originX = rect.width / 2;
    var originY = rect.height - 40;
    var count = reduceMotion ? 14 : 44;

    for (var i = 0; i < count; i++) {
      var angle = (-Math.PI / 2) + (Math.random() - 0.5) * Math.PI * 0.95;
      var speed = 2.4 + Math.random() * 5.2;
      particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 0.012 + Math.random() * 0.018,
        size: 1.2 + Math.random() * 2.2,
        hue: Math.random() < 0.5 ? "255,180,90" : "255,90,40"
      });
    }
    if (!sparkAnimId) runSparkLoop();
  }

  function runSparkLoop() {
    var ctx = canvas.getContext("2d");
    var rect = canvas.getBoundingClientRect();

    ctx.clearRect(0, 0, rect.width, rect.height);

    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.18; /* gravity */
      p.vx *= 0.985;
      p.life -= p.decay;

      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.fillStyle = "rgba(" + p.hue + "," + p.life + ")";
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();

      /* trailing streak for a hot, elongated spark look */
      ctx.beginPath();
      ctx.strokeStyle = "rgba(" + p.hue + "," + (p.life * 0.5) + ")";
      ctx.lineWidth = p.size * 0.6;
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - p.vx * 1.6, p.y - p.vy * 1.6);
      ctx.stroke();
    }

    if (particles.length > 0) {
      sparkAnimId = window.requestAnimationFrame(runSparkLoop);
    } else {
      sparkAnimId = null;
    }
  }

  function revealShowcase() {
    if (!waresSection) return;
    waresSection.classList.remove("showcase-locked");
    waresSection.classList.add("showcase-revealed");
    if (showcaseVeil) showcaseVeil.setAttribute("aria-hidden", "true");
  }

  function strikeAnvil() {
    if (!strikeBtn) return;
    strikeBtn.classList.add("struck");
    window.setTimeout(function () {
      strikeBtn.classList.remove("struck");
    }, 420);

    spawnSparks();

    if (!hasStruck) {
      hasStruck = true;
      window.setTimeout(function () {
        revealShowcase();
        window.setTimeout(function () {
          waresSection.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
        }, 250);
      }, 380);
    }
  }

  if (strikeBtn) {
    strikeBtn.addEventListener("click", strikeAnvil);
    strikeBtn.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        strikeAnvil();
      }
    });
    /* press H anywhere (outside a field) to strike */
    document.addEventListener("keydown", function (e) {
      if (!e.key || e.key.toLowerCase() !== "h") return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) return;
      strikeAnvil();
    });
  }

  /* ---------------------------------------------------------
   * Testimonials carousel (hand-built, no library)
   * ------------------------------------------------------- */
  var testimonials = [
    {
      quote: "Ordered a Drover for elk season and it's the last knife I'll ever need to buy. The temper line alone is worth the wait.",
      name: "R. Halloway",
      role: "Guide, Blue Ridge Outfitters"
    },
    {
      quote: "I've bought three chef's knives from big-name shops. None of them hold an edge like the Nine Fires does.",
      name: "M. Oyelaran",
      role: "Line Cook"
    },
    {
      quote: "Commissioned a hatchet for my son's first camp trip. It arrived with a note about the steel's heat history. Small shop, big heart.",
      name: "D. Castellano",
      role: "Customer, repeat commission"
    },
    {
      quote: "You can feel every hammer strike in the balance of the blade. That's not a knife you get from a catalog.",
      name: "T. Whitlock",
      role: "Bushcraft Instructor"
    }
  ];

  var track = document.getElementById("carouselTrack");
  var dotsWrap = document.getElementById("carouselDots");
  var prevBtn = document.getElementById("carouselPrev");
  var nextBtn = document.getElementById("carouselNext");
  var carouselRoot = document.getElementById("carousel");
  var currentSlide = 0;
  var autoTimer = null;

  function buildCarousel() {
    if (!track || !dotsWrap) return;
    testimonials.forEach(function (t, i) {
      var slide = document.createElement("div");
      slide.className = "testimonial";
      slide.setAttribute("role", "group");
      slide.setAttribute("aria-roledescription", "slide");
      slide.setAttribute("aria-label", (i + 1) + " of " + testimonials.length);

      var quote = document.createElement("blockquote");
      quote.textContent = t.quote;

      var cite = document.createElement("cite");
      cite.textContent = t.name;
      var role = document.createElement("span");
      role.className = "cite-role";
      role.textContent = t.role;
      cite.appendChild(role);

      slide.appendChild(quote);
      slide.appendChild(cite);
      track.appendChild(slide);

      var dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", "Show testimonial " + (i + 1));
      dot.setAttribute("aria-selected", i === 0 ? "true" : "false");
      dot.addEventListener("click", function () { goToSlide(i); });
      dotsWrap.appendChild(dot);
    });
  }

  function goToSlide(index) {
    if (!track) return;
    var count = testimonials.length;
    currentSlide = (index + count) % count;
    track.style.transform = "translateX(-" + (currentSlide * 100) + "%)";
    dotsWrap.querySelectorAll("button").forEach(function (dot, i) {
      dot.setAttribute("aria-selected", i === currentSlide ? "true" : "false");
    });
  }

  function startAuto() {
    if (reduceMotion) return;
    stopAuto();
    autoTimer = window.setInterval(function () { goToSlide(currentSlide + 1); }, 6000);
  }
  function stopAuto() {
    if (autoTimer) { window.clearInterval(autoTimer); autoTimer = null; }
  }

  buildCarousel();
  if (track) {
    if (prevBtn) prevBtn.addEventListener("click", function () { goToSlide(currentSlide - 1); stopAuto(); startAuto(); });
    if (nextBtn) nextBtn.addEventListener("click", function () { goToSlide(currentSlide + 1); stopAuto(); startAuto(); });
    if (carouselRoot) {
      carouselRoot.addEventListener("mouseenter", stopAuto);
      carouselRoot.addEventListener("mouseleave", startAuto);
      carouselRoot.addEventListener("focusin", stopAuto);
      carouselRoot.addEventListener("focusout", startAuto);
    }
    startAuto();
  }

  /* ---------------------------------------------------------
   * Commission form: client validation + localStorage
   * ------------------------------------------------------- */
  var form = document.getElementById("commissionForm");
  var successPanel = document.getElementById("commissionSuccess");
  var againBtn = document.getElementById("commissionAnother");
  var STORAGE_KEY = "emberAnvilCommissions";

  function setFieldError(inputId, errorId, message) {
    var input = document.getElementById(inputId);
    var errorEl = document.getElementById(errorId);
    var row = input ? input.closest(".form-row") : null;
    if (errorEl) errorEl.textContent = message || "";
    if (row) row.classList.toggle("has-error", !!message);
    if (input) input.setAttribute("aria-invalid", message ? "true" : "false");
  }

  function validateForm(data) {
    var valid = true;

    if (!data.name || data.name.trim().length < 2) {
      setFieldError("cName", "cNameError", "Tell us what to call you (2+ characters).");
      valid = false;
    } else {
      setFieldError("cName", "cNameError", "");
    }

    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailPattern.test(data.email.trim())) {
      setFieldError("cEmail", "cEmailError", "Enter a valid email address.");
      valid = false;
    } else {
      setFieldError("cEmail", "cEmailError", "");
    }

    if (!data.message || data.message.trim().length < 10) {
      setFieldError("cMessage", "cMessageError", "Give us at least a sentence to work with (10+ characters).");
      valid = false;
    } else {
      setFieldError("cMessage", "cMessageError", "");
    }

    return valid;
  }

  function saveCommission(entry) {
    var existing = [];
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) existing = JSON.parse(raw);
      if (!Array.isArray(existing)) existing = [];
    } catch (err) {
      existing = [];
    }
    existing.push(entry);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    } catch (err) {
      /* storage unavailable (e.g. private mode quota) - fail silently, UI still confirms */
    }
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var steelEl = document.getElementById("cSteel");
      var lengthEl = document.getElementById("cLength");
      var data = {
        name: document.getElementById("cName").value,
        email: document.getElementById("cEmail").value,
        message: document.getElementById("cMessage").value
      };

      if (!validateForm(data)) return;

      saveCommission({
        name: data.name.trim(),
        email: data.email.trim(),
        steel: steelEl ? steelEl.value : "",
        bladeLength: lengthEl ? parseFloat(lengthEl.value) : null,
        message: data.message.trim(),
        submittedAt: new Date().toISOString()
      });

      form.hidden = true;
      if (successPanel) {
        successPanel.hidden = false;
        successPanel.focus && successPanel.focus();
      }
    });
  }

  if (againBtn) {
    againBtn.addEventListener("click", function () {
      form.reset();
      ["cName", "cEmail", "cMessage"].forEach(function (id) {
        var row = document.getElementById(id).closest(".form-row");
        if (row) row.classList.remove("has-error");
      });
      successPanel.hidden = true;
      form.hidden = false;
      document.getElementById("cName").focus();
    });
  }
})();
