/* ============================================================
   VOTODATA — dataviz
   Area sparklines (stat cards) · ranked spark rows · choropleth BR
   ============================================================ */
(function () {
  "use strict";

  var BRAND = "#06B6D4";
  var uid = 0;

  /* ---------- datasets (sigla, nome, valor) ---------- */
  var DATA = {
    reqs: {
      label: "Amostra coletada",
      fmt: function (n) { return n >= 1000 ? (n / 1000).toFixed(2).replace(".", ",") + "k" : String(n); },
      rows: [
        { uf: "SP", nome: "São Paulo", v: 1270 },
        { uf: "MG", nome: "Minas Gerais", v: 688 },
        { uf: "RJ", nome: "Rio de Janeiro", v: 601 },
        { uf: "BA", nome: "Bahia", v: 487 },
        { uf: "RS", nome: "Rio Grande do Sul", v: 395 },
        { uf: "PR", nome: "Paraná", v: 342 },
        { uf: "PE", nome: "Pernambuco", v: 268 },
        { uf: "CE", nome: "Ceará", v: 231 },
        { uf: "PA", nome: "Pará", v: 179 },
        { uf: "SC", nome: "Santa Catarina", v: 154 },
        { uf: "GO", nome: "Goiás", v: 118 },
        { uf: "DF", nome: "Distrito Federal", v: 96 },
        { uf: "MA", nome: "Maranhão", v: 92 },
        { uf: "ES", nome: "Espírito Santo", v: 71 },
        { uf: "PB", nome: "Paraíba", v: 48 }
      ]
    }
  };

  /* ---------- deterministic RNG + series ---------- */
  function rng(seed) {
    var s = seed % 2147483647; if (s <= 0) s += 2147483646;
    return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  }
  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = (h * 16777619) >>> 0; }
    return h % 100000;
  }
  // smooth-ish trending series for area sparks
  function trend(seed, n, up) {
    var r = rng(seed), a = [], v = 0.35 + r() * 0.2;
    for (var i = 0; i < n; i++) {
      v += (r() - (up ? 0.38 : 0.55)) * 0.16;
      v = Math.max(0.06, Math.min(0.95, v));
      a.push(v);
    }
    return a;
  }
  // spiky series for row sparks
  function spiky(seed, n) {
    var r = rng(seed), a = [];
    for (var i = 0; i < n; i++) {
      var base = 0.14 + r() * 0.12;
      var spike = r() > 0.78 ? 0.5 + r() * 0.5 : 0;
      a.push(Math.min(1, base + spike));
    }
    return a;
  }

  function pathFrom(data, w, h, pad) {
    var n = data.length, step = w / (n - 1);
    return data.map(function (v, i) {
      var x = i * step;
      var y = h - pad - v * (h - pad * 2);
      return x.toFixed(1) + "," + y.toFixed(1);
    });
  }

  function areaSparkSVG(data, color) {
    var w = 240, h = 92, pad = 6;
    var pts = pathFrom(data, w, h, pad);
    uid++;
    var area = "M0," + h + " L" + pts.join(" L") + " L" + w + "," + h + " Z";
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none">'
      + '<defs><linearGradient id="ar' + uid + '" x1="0" y1="0" x2="0" y2="1">'
      + '<stop offset="0" stop-color="' + color + '" stop-opacity="0.28"/>'
      + '<stop offset="1" stop-color="' + color + '" stop-opacity="0"/></linearGradient></defs>'
      + '<path d="' + area + '" fill="url(#ar' + uid + ')"/>'
      + '<polyline points="' + pts.join(" ") + '" fill="none" stroke="' + color + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>'
      + '</svg>';
  }

  function lineSparkSVG(data, color) {
    var w = 120, h = 26, pad = 3;
    var pts = pathFrom(data, w, h, pad);
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none">'
      + '<polyline points="' + pts.join(" ") + '" fill="none" stroke="' + color + '" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>'
      + '</svg>';
  }

  /* ---------- stat card sparklines ---------- */
  function renderStatSparks() {
    document.querySelectorAll("[data-cf-spark]").forEach(function (el) {
      var seed = hash(el.getAttribute("data-cf-spark") || String(uid));
      var up = el.getAttribute("data-dir") !== "down";
      var color = el.getAttribute("data-color") || BRAND;
      el.innerHTML = areaSparkSVG(trend(seed, 30, up), color);
    });
  }

  /* ---------- ranked spark rows ---------- */
  function renderSparkLists() {
    document.querySelectorAll("[data-sparklist]").forEach(function (el) {
      var key = el.getAttribute("data-sparklist");
      var ds = DATA[key]; if (!ds) return;
      var html = "";
      ds.rows.forEach(function (row) {
        html += '<div class="vd-spark-row" data-uf="' + row.uf + '">'
          + '<span class="vd-spark-row__name" title="' + row.nome + '">' + row.nome + '</span>'
          + '<span class="vd-spark-row__spark">' + lineSparkSVG(spiky(hash(row.uf + key), 26), BRAND) + '</span>'
          + '<span class="vd-spark-row__val">' + ds.fmt(row.v) + '</span>'
          + '</div>';
      });
      el.innerHTML = html;
      el.addEventListener("mouseover", function (e) {
        var r = e.target.closest(".vd-spark-row"); if (r) highlight(key, r.getAttribute("data-uf"), true);
      });
      el.addEventListener("mouseout", function (e) {
        var r = e.target.closest(".vd-spark-row"); if (r) highlight(key, r.getAttribute("data-uf"), false);
      });
    });
  }

  /* ---------- choropleth ---------- */
  function lerpColor(t) {
    var stops = [
      [0.00, [18, 28, 48]],
      [0.30, [17, 80, 95]],
      [0.62, [6, 182, 212]],
      [1.00, [127, 227, 242]]
    ];
    for (var i = 1; i < stops.length; i++) {
      if (t <= stops[i][0]) {
        var a = stops[i - 1], b = stops[i];
        var f = (t - a[0]) / (b[0] - a[0]);
        var c = a[1].map(function (ch, k) { return Math.round(ch + (b[1][k] - ch) * f); });
        return "rgb(" + c[0] + "," + c[1] + "," + c[2] + ")";
      }
    }
    return "rgb(127,227,242)";
  }

  function paintMap(svg, el, key) {
    var ds = DATA[key]; if (!ds) return;
    var vals = ds.rows.map(function (r) { return r.v; });
    var max = Math.max.apply(null, vals), min = Math.min.apply(null, vals);
    var byUf = {}; ds.rows.forEach(function (r) { byUf[r.uf] = r; });

    svg.removeAttribute("width"); svg.removeAttribute("height");

    var wrap = document.createElement("div");
    wrap.className = "vd-brazil";
    wrap.appendChild(svg);
    var tip = document.createElement("div");
    tip.className = "vd-brazil__tip";
    wrap.appendChild(tip);
    el.innerHTML = ""; el.appendChild(wrap);

    svg.querySelectorAll(".uf").forEach(function (path) {
      var uf = path.getAttribute("data-sigla");
      var row = byUf[uf];
      var t = row ? (row.v - min) / (max - min || 1) : -1;
      path.style.fill = row ? lerpColor(0.10 + t * 0.90) : "#141C2E";
      path.addEventListener("mousemove", function (e) {
        var rect = wrap.getBoundingClientRect();
        tip.style.left = (e.clientX - rect.left) + "px";
        tip.style.top = (e.clientY - rect.top) + "px";
        tip.style.opacity = "1";
        tip.innerHTML = "<b>" + (path.getAttribute("data-nome") || uf) + "</b> · <span>"
          + (row ? ds.fmt(row.v) : "—") + "</span>";
        highlight(key, uf, true);
      });
      path.addEventListener("mouseleave", function () {
        tip.style.opacity = "0"; highlight(key, uf, false);
      });
    });
  }

  function loadMaps() {
    document.querySelectorAll("[data-brazil-map]").forEach(function (el) {
      var key = el.getAttribute("data-brazil-map");
      // already inlined?
      var existing = el.querySelector("svg");
      if (existing) { paintMap(existing, el, key); return; }
      el.innerHTML = '<div class="vd-cf__loading">Carregando mapa…</div>';
      fetch("assets/brasil-estados.svg")
        .then(function (r) { return r.text(); })
        .then(function (txt) {
          var doc = new DOMParser().parseFromString(txt, "image/svg+xml");
          var svg = doc.querySelector("svg");
          if (!svg) throw new Error("no svg");
          // strip background plates + glow so it integrates into the card
          svg.querySelectorAll('rect').forEach(function (r) { r.remove(); });
          var g = svg.querySelector("#estados"); if (g) g.removeAttribute("filter");
          paintMap(svg, el, key);
        })
        .catch(function () {
          el.innerHTML = '<div class="vd-cf__loading">Mapa indisponível neste contexto.</div>';
        });
    });
  }

  /* ---------- hover sync ---------- */
  function highlight(key, uf, on) {
    document.querySelectorAll('[data-sparklist="' + key + '"] .vd-spark-row[data-uf="' + uf + '"]').forEach(function (r) {
      r.classList.toggle("is-hot", on);
    });
    document.querySelectorAll('[data-brazil-map="' + key + '"] .uf[data-sigla="' + uf + '"]').forEach(function (p) {
      p.classList.toggle("is-hot", on);
    });
  }

  function init() {
    renderStatSparks();
    renderSparkLists();
    loadMaps();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  window.VDDataviz = { init: init };
})();
