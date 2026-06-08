/* ============================================================
   VOTODATA — Mapa de Influência Regional · engine
   Choropleth interativo. Depende de mapa.data.js (geometria+dados).
   Auto-inicializa todo elemento .vdmap[data-vd-map].
   API global: window.vdMapApply({palette,metric,monitor})
   ============================================================ */
(function () {
  "use strict";
  if (!window.VD_UF) { console.error("mapa.data.js não carregado"); return; }

  /* ---------- paletas (on-brand: ciano ↔ âmbar) ---------- */
  var PALETTES = {
    heat: ["#11394C", "#0E7490", "#1FB6D4", "#86E7D9", "#FCD34D", "#F59E0B"],
    cyan: ["#0E2A38", "#0E5E78", "#0891B2", "#22D0EE", "#7DE7F8"]
  };
  // gradiente geográfico norte→sul, dentro do DS
  var REGION_COLORS = {
    "Norte": "#155E75", "Nordeste": "#0891B2", "Centro-Oeste": "#22D0EE",
    "Sudeste": "#FBBF24", "Sul": "#F59E0B"
  };
  var REGIONS = ["Norte", "Nordeste", "Centro-Oeste", "Sudeste", "Sul"];

  var METRICS = {
    eleitores: { label: "Eleitores", noun: "do eleitorado", source: "TSE 2024", total: window.VD_MAP_TOTALS.eleitores },
    populacao: { label: "População", noun: "da população", source: "IBGE 2022", total: window.VD_MAP_TOTALS.populacao }
  };

  /* ---------- helpers de cor ---------- */
  function hexToRgb(h) { h = h.replace("#", ""); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
  function mix(a, b, t) { return [Math.round(a[0] + (b[0] - a[0]) * t), Math.round(a[1] + (b[1] - a[1]) * t), Math.round(a[2] + (b[2] - a[2]) * t)]; }
  function rgbCss(c) { return "rgb(" + c[0] + "," + c[1] + "," + c[2] + ")"; }
  function ramp(t, stops) {
    t = Math.max(0, Math.min(1, t));
    var n = stops.length - 1, p = t * n, i = Math.floor(p);
    if (i >= n) return rgbCss(hexToRgb(stops[n]));
    return rgbCss(mix(hexToRgb(stops[i]), hexToRgb(stops[i + 1]), p - i));
  }
  function gradientCss(stops) { return "linear-gradient(90deg," + stops.join(",") + ")"; }

  /* ---------- formatação pt-BR ---------- */
  function fmtCompact(v) {
    if (v >= 1e6) return (v / 1e6).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " mi";
    if (v >= 1e3) return Math.round(v / 1e3).toLocaleString("pt-BR") + " mil";
    return String(v);
  }
  function fmtInt(v) { return v.toLocaleString("pt-BR"); }
  function fmtPct(v) { return v.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "%"; }

  var ICON = {
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    cursor: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m4 3 7 18 2.5-7.5L21 11 4 3Z"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></svg>'
  };

  /* ---------- instância ---------- */
  function createMap(root) {
    var variant = root.getAttribute("data-variant") || "full";
    var state = {
      metric: root.getAttribute("data-metric") || "eleitores",
      palette: root.getAttribute("data-palette") || "heat",
      region: null,
      selected: "SP",
      exponent: 0.5,
      scope: "uf"
    };
    var UF = window.VD_UF;
    var bySig = {};
    UF.forEach(function (u) { bySig[u.sigla] = u; });
    var MAX = {
      eleitores: Math.max.apply(null, UF.map(function (u) { return u.eleitores; })),
      populacao: Math.max.apply(null, UF.map(function (u) { return u.populacao; })),
      municipios: Math.max.apply(null, UF.map(function (u) { return u.municipios; }))
    };

    var stage = root.querySelector("[data-vdmap-stage]");
    var aside = root.querySelector("[data-vdmap-aside]");

    /* ----- build stage ----- */
    stage.innerHTML =
      '<div class="vdmap-toolbar">' +
        '<div class="vdseg" data-vdmap-seg>' +
          '<button data-metric="eleitores">Eleitores</button>' +
          '<button data-metric="populacao">População</button>' +
        '</div>' +
        '<div class="vdmap-chips" data-vdmap-chips></div>' +
        '<span class="vdmap-toolbar__spacer"></span>' +
        '<div class="vdmap-search" data-vdmap-search>' +
          '<span class="vdmap-search__ico">' + ICON.search + '</span>' +
          '<input class="vdmap-search__field" type="text" placeholder="Buscar estado…" autocomplete="off" spellcheck="false" aria-label="Buscar estado">' +
          '<div class="vdmap-search__menu" data-vdmap-searchmenu></div>' +
        '</div>' +
      '</div>' +
      '<div class="vdmap-canvas">' +
        '<svg class="vdmap-svg" viewBox="' + window.VD_BRASIL_VIEWBOX + '" role="img" aria-label="Mapa do Brasil por unidade federativa">' +
          '<g data-vdmap-states>' + window.VD_BRASIL_PATHS + '</g>' +
        '</svg>' +
        '<span class="pill vdmap-live"><span class="dot dot--live"></span>Monitorando · ao vivo</span>' +
        '<div class="vdmap-tip" data-vdmap-tip></div>' +
      '</div>' +
      '<div class="vdmap-legend" data-vdmap-legend></div>';

    var svg = stage.querySelector(".vdmap-svg");
    var tip = stage.querySelector("[data-vdmap-tip]");
    var canvas = stage.querySelector(".vdmap-canvas");
    var legend = stage.querySelector("[data-vdmap-legend]");
    var chipsWrap = stage.querySelector("[data-vdmap-chips]");
    var seg = stage.querySelector("[data-vdmap-seg]");
    var paths = {};
    Array.prototype.forEach.call(svg.querySelectorAll(".uf"), function (p) { paths[p.getAttribute("data-sigla")] = p; });

    /* region chips */
    chipsWrap.innerHTML = REGIONS.map(function (r) {
      return '<button class="vdmap-chip" data-region="' + r + '">' +
        '<span class="vdmap-chip__dot" style="background:' + REGION_COLORS[r] + '"></span>' + r + '</button>';
    }).join("");

    /* ----- build aside ----- */
    if (aside) {
      aside.innerHTML =
        '<div class="vdmap-detail panel" data-vdmap-detail></div>' +
        '<div class="vdmap-rank panel">' +
          '<div class="vdmap-rank__head">' +
            '<span class="vdmap-rank__title" data-vdmap-ranktitle>Ranking</span>' +
            '<div class="vdmap-rank__toggle" data-vdmap-scope>' +
              '<button data-scope="uf" class="is-on">UF</button>' +
              '<button data-scope="muni">Municípios</button>' +
            '</div>' +
          '</div>' +
          '<div class="vdmap-rank__list" data-vdmap-ranklist></div>' +
        '</div>';
    }
    var detailEl = aside && aside.querySelector("[data-vdmap-detail]");
    var rankList = aside && aside.querySelector("[data-vdmap-ranklist]");
    var rankTitle = aside && aside.querySelector("[data-vdmap-ranktitle]");
    var scopeToggle = aside && aside.querySelector("[data-vdmap-scope]");
    var searchWrap = stage.querySelector("[data-vdmap-search]");
    var searchField = searchWrap.querySelector(".vdmap-search__field");
    var searchMenu = searchWrap.querySelector("[data-vdmap-searchmenu]");

    /* optional KPI strip */
    var kpiEl = root.querySelector("[data-vdmap-kpis]");
    if (kpiEl) {
      kpiEl.innerHTML =
        kpi(fmtCompact(window.VD_MAP_TOTALS.populacao).replace(" mi", "M"), "Habitantes · IBGE 2022") +
        kpi(fmtCompact(window.VD_MAP_TOTALS.eleitores).replace(" mi", "M"), "Eleitores · TSE 2024") +
        kpi(fmtInt(window.VD_MAP_TOTALS.municipios), "Municípios · 100% cobertos") +
        kpi('<span class="cy">27</span>', "UF + DF · cobertura nacional");
      function kpi(v, l) { return '<div class="vdmap-kpi"><span class="vdmap-kpi__v">' + v + '</span><span class="vdmap-kpi__l">' + l + '</span></div>'; }
    }

    /* ---------- coloração ---------- */
    function colorFor(u) {
      if (state.palette === "region") return REGION_COLORS[u.regiao];
      var stops = PALETTES[state.palette] || PALETTES.heat;
      var t = Math.pow(u[state.metric] / MAX[state.metric], state.exponent);
      return ramp(t, stops);
    }
    function paintStates() {
      UF.forEach(function (u) {
        var p = paths[u.sigla]; if (!p) return;
        p.style.fill = colorFor(u);
        p.style.fillOpacity = state.palette === "region" ? "0.62" : "1";
      });
    }

    /* ---------- legenda ---------- */
    function renderLegend() {
      if (state.palette === "region") {
        legend.className = "vdmap-legend vdmap-legend--region";
        legend.innerHTML = '<span class="vdmap-legend__label">Regiões</span>' +
          REGIONS.map(function (r) {
            return '<span class="vdmap-legend__swatch"><i style="background:' + REGION_COLORS[r] + '"></i>' + r + '</span>';
          }).join("");
      } else {
        var stops = PALETTES[state.palette];
        var vals = UF.map(function (u) { return u[state.metric]; });
        var mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals);
        legend.className = "vdmap-legend";
        legend.innerHTML =
          '<span class="vdmap-legend__label">' + METRICS[state.metric].label + '</span>' +
          '<div class="vdmap-ramp">' +
            '<div class="vdmap-ramp__bar" style="background:' + gradientCss(stops) + '"></div>' +
            '<div class="vdmap-ramp__scale"><span>' + fmtCompact(mn) + '</span>' +
              '<span>' + fmtCompact(Math.round((mn + mx) / 2)) + '</span>' +
              '<span>' + fmtCompact(mx) + '</span></div>' +
          '</div>';
      }
    }

    /* ---------- ranking ---------- */
    function sortedByMetric() {
      return UF.slice().sort(function (a, b) { return b[state.metric] - a[state.metric]; });
    }
    function renderRank() {
      if (!rankList) return;
      var sorted = sortedByMetric();
      var mx = sorted[0][state.metric];
      rankTitle.textContent = "Ranking · " + METRICS[state.metric].label;
      rankList.innerHTML = sorted.map(function (u, i) {
        var w = Math.max(4, u[state.metric] / mx * 100);
        var dim = state.region && u.regiao !== state.region ? " is-dim" : "";
        var sel = u.sigla === state.selected ? " is-sel" : "";
        return '<div class="vdmap-row' + sel + dim + '" data-sig="' + u.sigla + '">' +
          '<span class="vdmap-row__n">' + (i + 1) + '</span>' +
          '<span class="vdmap-row__sig">' + u.sigla + '</span>' +
          '<span class="vdmap-row__barwrap"><span class="vdmap-row__bar" style="width:' + w + '%;background:' + colorFor(u) + '"></span></span>' +
          '<span class="vdmap-row__v">' + fmtCompact(u[state.metric]) + '</span>' +
        '</div>';
      }).join("");
    }

    /* ---------- drill-down municipal ---------- */
    function renderMuni() {
      if (!rankList) return;
      var u = bySig[state.selected];
      var data = window.VD_MUNI && window.VD_MUNI[state.selected];
      rankTitle.textContent = "Municípios · " + u.sigla;
      if (!data) { rankList.innerHTML = '<div class="vdmap-search__empty">Sem dados municipais.</div>'; return; }
      var rows = data.list.slice().sort(function (a, b) { return b.eleitores - a.eleitores; });
      var mx = rows.length ? rows[0].eleitores : 1;
      var html = rows.map(function (m, i) {
        var w = Math.max(5, m.eleitores / mx * 100);
        return '<div class="vdmap-mrow">' +
          '<span class="vdmap-mrow__fill" style="width:' + w + '%"></span>' +
          '<span class="vdmap-row__n">' + (i + 1) + '</span>' +
          '<span class="vdmap-mrow__name">' + m.nome + '</span>' +
          '<span class="vdmap-row__v">' + fmtCompact(m.eleitores) + '</span>' +
        '</div>';
      }).join("");
      if (data.restMunicipios > 0) {
        var w2 = Math.max(5, data.restEleitores / mx * 100);
        html += '<div class="vdmap-mrow vdmap-mrow--rest">' +
          '<span class="vdmap-mrow__fill" style="width:' + Math.min(100, w2) + '%"></span>' +
          '<span class="vdmap-row__n">+</span>' +
          '<span class="vdmap-mrow__name">demais ' + fmtInt(data.restMunicipios) + ' municípios</span>' +
          '<span class="vdmap-row__v">' + fmtCompact(data.restEleitores) + '</span>' +
        '</div>';
      }
      html += '<div class="vdmap-mfoot">' +
        '<span class="vdmap-mfoot__l">' + rows.length + ' maiores · ' + fmtInt(u.municipios) + ' no total</span>' +
        '<span class="vdmap-mfoot__v">' + fmtCompact(u.eleitores) + ' eleitores</span>' +
      '</div>';
      rankList.innerHTML = html;
    }
    function renderScope() {
      if (scopeToggle) Array.prototype.forEach.call(scopeToggle.children, function (b) {
        b.classList.toggle("is-on", b.getAttribute("data-scope") === state.scope);
      });
      if (state.scope === "muni") renderMuni(); else renderRank();
    }

    /* ---------- detalhe ---------- */
    function renderDetail() {
      if (!detailEl) return;
      var u = bySig[state.selected];
      var rank = sortedByMetric().map(function (x) { return x.sigla; }).indexOf(u.sigla) + 1;
      var share = u[state.metric] / METRICS[state.metric].total * 100;
      var munTxt = u.municipios > 0 ? fmtInt(u.municipios) : "—";
      detailEl.innerHTML =
        '<div class="vdmap-detail__head">' +
          '<span class="vdmap-detail__sig">' + u.sigla + '</span>' +
          '<div style="min-width:0">' +
            '<div class="vdmap-detail__name">' + u.nome + '</div>' +
            '<div class="vdmap-detail__meta">' +
              '<span class="vdmap-detail__cap">' + ICON.pin + u.capital + '</span>' +
              '<span class="tag tag--mut">' + u.regiao + '</span>' +
            '</div>' +
          '</div>' +
          '<span class="vdmap-detail__rank">#' + rank + ' · ' + METRICS[state.metric].label + '</span>' +
        '</div>' +
        '<div class="vdmap-stats">' +
          statRow("Eleitores", fmtInt(u.eleitores), u.eleitores / MAX.eleitores, "") +
          statRow("População", fmtInt(u.populacao), u.populacao / MAX.populacao, "--am") +
          statRow("Municípios", munTxt, (u.municipios || 0) / MAX.municipios, "--mut") +
        '</div>' +
        '<div class="vdmap-detail__share">' +
          '<span class="vdmap-detail__sharev cy">' + fmtPct(share) + '</span>' +
          '<span class="vdmap-detail__sharel">' + METRICS[state.metric].noun + ' nacional · fonte ' + METRICS[state.metric].source + '</span>' +
        '</div>';
    }
    function statRow(label, val, frac, mod) {
      return '<div class="vdmap-stat">' +
        '<div class="vdmap-stat__top"><span class="vdmap-stat__l">' + label + '</span>' +
        '<span class="vdmap-stat__v">' + val + '</span></div>' +
        '<div class="vdmap-stat__track"><span class="vdmap-stat__fill vdmap-stat__fill' + mod + '" style="width:' + Math.max(3, frac * 100) + '%"></span></div></div>';
    }

    /* ---------- seleção / filtro ---------- */
    function applySelection() {
      Object.keys(paths).forEach(function (s) { paths[s].classList.toggle("is-sel", s === state.selected); });
      if (rankList && state.scope === "uf") Array.prototype.forEach.call(rankList.children, function (r) {
        r.classList.toggle("is-sel", r.getAttribute("data-sig") === state.selected);
      });
    }
    function applyFilter() {
      root.classList.toggle("is-filtering", !!state.region);
      UF.forEach(function (u) {
        paths[u.sigla].classList.toggle("is-dim", !!state.region && u.regiao !== state.region);
      });
      Array.prototype.forEach.call(chipsWrap.children, function (c) {
        c.classList.toggle("is-on", c.getAttribute("data-region") === state.region);
      });
      if (rankList && state.scope === "uf") Array.prototype.forEach.call(rankList.children, function (r) {
        var u = bySig[r.getAttribute("data-sig")];
        if (u) r.classList.toggle("is-dim", !!state.region && u.regiao !== state.region);
      });
    }
    function syncSeg() {
      Array.prototype.forEach.call(seg.children, function (b) {
        b.classList.toggle("is-on", b.getAttribute("data-metric") === state.metric);
      });
    }

    /* ---------- tooltip ---------- */
    function showTip(u, ev) {
      var rect = canvas.getBoundingClientRect();
      tip.innerHTML =
        '<div class="vdmap-tip__top"><span class="vdmap-tip__sig">' + u.sigla + '</span>' +
        '<span class="vdmap-tip__name">' + u.nome + '</span></div>' +
        '<div class="vdmap-tip__reg">' + u.regiao + ' · ' + u.capital + '</div>' +
        '<div class="vdmap-tip__row"><span class="vdmap-tip__v">' + fmtCompact(u[state.metric]) + '</span>' +
        '<span class="vdmap-tip__l">' + METRICS[state.metric].label + '</span></div>' +
        '<div class="vdmap-tip__hint">' + ICON.cursor + 'Clique para abrir o perfil</div>';
      tip.classList.add("is-on");
      var x = ev.clientX - rect.left, y = ev.clientY - rect.top;
      var tw = tip.offsetWidth, th = tip.offsetHeight;
      x = x + 18 + tw > rect.width ? x - tw - 18 : x + 18;
      y = Math.max(4, Math.min(y - th / 2, rect.height - th - 4));
      tip.style.transform = "translate(" + x + "px," + y + "px)";
    }
    function hideTip() { tip.classList.remove("is-on"); }

    /* ---------- eventos ---------- */
    UF.forEach(function (u) {
      var p = paths[u.sigla]; if (!p) return;
      p.addEventListener("mousemove", function (e) { showTip(u, e); });
      p.addEventListener("mouseleave", hideTip);
      p.addEventListener("click", function () { select(u.sigla); });
    });
    seg.addEventListener("click", function (e) {
      var b = e.target.closest("[data-metric]"); if (!b) return;
      state.metric = b.getAttribute("data-metric"); refresh();
    });
    chipsWrap.addEventListener("click", function (e) {
      var b = e.target.closest("[data-region]"); if (!b) return;
      var r = b.getAttribute("data-region");
      state.region = state.region === r ? null : r;
      applyFilter();
    });
    if (rankList) rankList.addEventListener("click", function (e) {
      var r = e.target.closest("[data-sig]"); if (!r) return;
      select(r.getAttribute("data-sig"));
    });
    if (scopeToggle) scopeToggle.addEventListener("click", function (e) {
      var b = e.target.closest("[data-scope]"); if (!b) return;
      state.scope = b.getAttribute("data-scope");
      renderScope(); applySelection(); applyFilter();
    });

    /* ---------- busca de estado ---------- */
    function searchMatches(q) {
      q = q.trim().toLowerCase(); if (!q) return [];
      var starts = [], contains = [];
      UF.forEach(function (u) {
        var hay = (u.sigla + " " + u.nome + " " + u.capital).toLowerCase();
        if (u.sigla.toLowerCase() === q || u.nome.toLowerCase().indexOf(q) === 0) starts.push(u);
        else if (hay.indexOf(q) >= 0) contains.push(u);
      });
      return starts.concat(contains).slice(0, 7);
    }
    function renderSearchMenu(list) {
      if (!list.length) {
        searchMenu.innerHTML = '<div class="vdmap-search__empty">Nenhum estado encontrado.</div>';
        searchMenu.classList.add("is-on"); return;
      }
      searchMenu.innerHTML = list.map(function (u, i) {
        return '<button class="vdmap-search__item' + (i === 0 ? ' is-active' : '') + '" data-sig="' + u.sigla + '">' +
          '<span class="vdmap-search__sig">' + u.sigla + '</span>' +
          '<span class="vdmap-search__nm">' + u.nome + '</span>' +
          '<span class="vdmap-search__rg">' + u.regiao + '</span></button>';
      }).join("");
      searchMenu.classList.add("is-on");
    }
    function highlightSearch(list, active) {
      var set = {}; list.forEach(function (u) { set[u.sigla] = 1; });
      root.classList.toggle("is-searching", active);
      UF.forEach(function (u) { paths[u.sigla].classList.toggle("is-found", active && !!set[u.sigla]); });
    }
    function closeSearch() { searchMenu.classList.remove("is-on"); highlightSearch([], false); }
    function chooseSearch(sig) {
      select(sig);
      searchField.value = bySig[sig].nome;
      searchMenu.classList.remove("is-on");
      highlightSearch([], false);
      var p = paths[sig];
      p.classList.remove("is-pulse"); void p.getBBox(); p.classList.add("is-pulse");
      setTimeout(function () { p.classList.remove("is-pulse"); }, 1100);
    }
    searchField.addEventListener("input", function () {
      var list = searchMatches(this.value);
      renderSearchMenu(list);
      highlightSearch(list, this.value.trim().length > 0);
    });
    searchField.addEventListener("focus", function () {
      if (this.value.trim()) { var l = searchMatches(this.value); renderSearchMenu(l); highlightSearch(l, true); }
    });
    searchField.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { var l = searchMatches(this.value); if (l.length) chooseSearch(l[0].sigla); }
      else if (e.key === "Escape") { this.value = ""; closeSearch(); this.blur(); }
    });
    searchMenu.addEventListener("click", function (e) {
      var b = e.target.closest("[data-sig]"); if (!b) return;
      chooseSearch(b.getAttribute("data-sig"));
    });
    document.addEventListener("click", function (e) {
      if (!searchWrap.contains(e.target)) closeSearch();
    });

    function select(sig) {
      state.selected = sig; applySelection(); renderDetail();
      if (state.scope === "muni") renderMuni();
    }

    /* ---------- refresh completo ---------- */
    function refresh() {
      paintStates(); renderLegend(); renderScope(); renderDetail();
      applySelection(); applyFilter(); syncSeg();
    }

    /* API p/ Tweaks */
    root.__vdmap = {
      set: function (patch) {
        if (patch.metric && METRICS[patch.metric]) state.metric = patch.metric;
        if (patch.palette) state.palette = patch.palette;
        if (typeof patch.exponent === "number") state.exponent = patch.exponent;
        if (typeof patch.region !== "undefined") state.region = patch.region;
        refresh();
      }
    };

    refresh();
  }

  /* ---------- boot ---------- */
  function boot() {
    var maps = document.querySelectorAll(".vdmap[data-vd-map]");
    window.__vdmaps = [];
    Array.prototype.forEach.call(maps, function (m) { createMap(m); window.__vdmaps.push(m); });
  }
  window.vdMapApply = function (patch) {
    (window.__vdmaps || []).forEach(function (m) { if (m.__vdmap) m.__vdmap.set(patch); });
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
