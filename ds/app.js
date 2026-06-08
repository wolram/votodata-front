/* VotoData Design System — interactions */
(function () {
  "use strict";

  // ---- Color data ----
  var CYAN = [
    ["50", "#ECFEFF"], ["100", "#CFF9FE"], ["200", "#A5F0FC"], ["300", "#67E3F9"], ["400", "#22D0EE"],
    ["500", "#06B6D4"], ["600", "#0891B2"], ["700", "#0E7490"], ["800", "#155E75"], ["900", "#164E63"]
  ];
  var AMBER = [["300", "#FCD34D"], ["400", "#FBBF24"], ["500", "#F59E0B"], ["600", "#D97706"], ["700", "#B45309"]];
  var INK = [
    ["950", "#080D1A"], ["900", "#0F172A"], ["850", "#131B2E"], ["800", "#1A2336"], ["750", "#1E293B"],
    ["700", "#222A3D"], ["600", "#334155"], ["400", "#64748B"], ["300", "#94A3B8"], ["white", "#F8FAFC"]
  ];
  var SEMANTIC = [
    ["Sucesso", "#22C55E", "--vd-success"], ["Atenção", "#F59E0B", "--vd-warning"],
    ["Erro", "#EF4444", "--vd-danger"], ["Info", "#3B82F6", "--vd-info"]
  ];
  var SERIES = [
    ["Série 1", "#06B6D4"], ["Série 2", "#F59E0B"], ["Série 3", "#3B82F6"], ["Série 4", "#22C55E"],
    ["Série 5", "#A78BFA"], ["Série 6", "#F472B6"], ["Série 7", "#2DD4BF"], ["Série 8", "#FACC15"]
  ];
  var STAR = { "500": 1 };

  function luminance(hex) {
    var r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }
  function renderRamp(id, data, prefix) {
    var host = document.getElementById(id);
    if (!host) return;
    data.forEach(function (s) {
      var hex = s[1];
      var div = document.createElement("div");
      div.className = "ds-swatch " + (luminance(hex) > 0.6 ? "is-light" : "is-dark");
      div.style.background = hex;
      div.setAttribute("data-copy", hex);
      var star = (prefix === "cyan" || prefix === "amber") && STAR[s[0]] ? '<span class="star">★</span>' : "";
      div.innerHTML = star + '<span class="step">' + s[0] + '</span><span class="hex">' + hex + '</span>';
      host.appendChild(div);
    });
  }
  function renderTokens(id, data) {
    var host = document.getElementById(id);
    if (!host) return;
    data.forEach(function (s) {
      var name = s[0], hex = s[1], varName = s[2] || "";
      var div = document.createElement("div");
      div.className = "ds-token";
      div.setAttribute("data-copy", varName || hex);
      div.innerHTML = '<div class="ds-token__chip" style="background:' + hex + '"></div>' +
        '<span class="ds-token__name">' + name + '</span>' +
        '<span class="ds-token__val">' + (varName || hex) + '</span>';
      host.appendChild(div);
    });
  }
  renderRamp("rampCyan", CYAN, "cyan");
  renderRamp("rampAmber", AMBER, "amber");
  renderRamp("rampInk", INK, "ink");
  renderTokens("semanticTokens", SEMANTIC);
  renderTokens("seriesTokens", SERIES);

  // ---- Copy-to-clipboard (swatches, tokens, code) ----
  var toast = document.getElementById("dsToast");
  var toastTimer = null;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg + " ✓";
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 1400);
  }
  function copy(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { showToast(text); });
    } else {
      var ta = document.createElement("textarea");
      ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); showToast(text); } catch (e) {}
      document.body.removeChild(ta);
    }
  }
  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-copy]");
    if (el) { copy(el.getAttribute("data-copy")); }
  });

  // ---- Scroll-spy nav ----
  var nav = document.getElementById("dsNav");
  if (nav) {
    var links = Array.prototype.slice.call(nav.querySelectorAll("a[href^='#']"));
    var map = {};
    links.forEach(function (a) {
      var id = a.getAttribute("href").slice(1);
      var sec = document.getElementById(id);
      if (sec) map[id] = a;
    });
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (l) { l.classList.remove("active"); });
          var a = map[en.target.id];
          if (a) a.classList.add("active");
        }
      });
    }, { rootMargin: "-10% 0px -75% 0px", threshold: 0 });
    Object.keys(map).forEach(function (id) {
      var sec = document.getElementById(id);
      if (sec) obs.observe(sec);
    });
  }

  // ---- Tabs (demo) ----
  document.addEventListener("click", function (e) {
    var tab = e.target.closest(".vd-tab");
    if (!tab) return;
    var group = tab.closest(".vd-tabs");
    if (!group) return;
    group.querySelectorAll(".vd-tab").forEach(function (t) { t.classList.remove("vd-tab--active"); });
    tab.classList.add("vd-tab--active");
  });

  // ---- Theme toggle (demo container) ----
  document.addEventListener("change", function (e) {
    var t = e.target.closest("[data-theme-toggle]");
    if (!t) return;
    var target = document.querySelector(t.getAttribute("data-theme-toggle"));
    if (target) target.setAttribute("data-theme", t.checked ? "light" : "dark");
  });
})();
