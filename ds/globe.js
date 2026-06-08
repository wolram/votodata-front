/* ============================================================
   VotoData — Globe (canvas 3D orthographic)
   Esfera rotativa arrastável com capitais do mundo e arcos
   com pulsos animados (cometas) viajando entre as capitais.
   Uso:  <canvas data-vd-globe ...></canvas>  + VDGlobe.init()
   ============================================================ */
(function () {
  "use strict";

  var COL = {
    fill:     "#0C1322",
    grid:     "rgba(45, 55, 78, 0.55)",
    gridBack: "rgba(45, 55, 78, 0.16)",
    point:    "#06B6D4",
    pointHi:  "#67E3F9",
    accent:   "#F59E0B",
    accentHi: "#FCD34D",
    arcCy:    "rgba(6, 182, 212, ",
    arcAm:    "rgba(245, 158, 11, "
  };

  // Capitais (lat, lon). hot = país com eleição em 2026 (âmbar).
  var POINTS = [
    { lat: -15.8, lon: -47.9, r: 3.4, hot: true,  name: "Brasília" },
    { lat:  38.9, lon: -77.0, r: 3.0, hot: true,  name: "Washington" },
    { lat:  19.4, lon: -99.1, r: 2.2,             name: "Cidade do México" },
    { lat:   4.7, lon: -74.1, r: 2.0,             name: "Bogotá" },
    { lat: -34.6, lon: -58.4, r: 2.2,             name: "Buenos Aires" },
    { lat: -33.4, lon: -70.6, r: 1.8,             name: "Santiago" },
    { lat:  38.7, lon:  -9.1, r: 2.6, hot: true,  name: "Lisboa" },
    { lat:  40.4, lon:  -3.7, r: 2.0,             name: "Madri" },
    { lat:  48.9, lon:   2.3, r: 2.2,             name: "Paris" },
    { lat:  51.5, lon:  -0.1, r: 2.4,             name: "Londres" },
    { lat:  52.5, lon:  13.4, r: 2.2,             name: "Berlim" },
    { lat:  41.9, lon:  12.5, r: 2.0,             name: "Roma" },
    { lat:  46.1, lon:  14.5, r: 2.6, hot: true,  name: "Liubliana" },
    { lat:  47.5, lon:  19.0, r: 2.8, hot: true,  name: "Budapeste" },
    { lat:  42.7, lon:  23.3, r: 2.6, hot: true,  name: "Sófia" },
    { lat:  35.2, lon:  33.4, r: 2.2, hot: true,  name: "Nicósia" },
    { lat:  35.9, lon:  14.5, r: 2.0, hot: true,  name: "Valeta" },
    { lat:  40.2, lon:  44.5, r: 2.4, hot: true,  name: "Yerevan" },
    { lat:  59.3, lon:  18.1, r: 2.8, hot: true,  name: "Estocolmo" },
    { lat:  56.9, lon:  24.1, r: 2.6, hot: true,  name: "Riga" },
    { lat:  55.7, lon:  12.6, r: 2.6, hot: true,  name: "Copenhague" },
    { lat:  55.8, lon:  37.6, r: 2.8, hot: true,  name: "Moscou" },
    { lat:  28.6, lon:  77.2, r: 2.0,             name: "Nova Délhi" },
    { lat:  35.7, lon: 139.7, r: 2.0,             name: "Tóquio" },
    { lat: -25.7, lon:  28.2, r: 1.8,             name: "Pretória" },
    { lat:  -6.2, lon: 106.8, r: 1.8,             name: "Jacarta" },
    { lat: -35.3, lon: 149.1, r: 1.8,             name: "Camberra" }
  ];

  // Rede de arcos: pares [origem, destino] (índices em POINTS).
  var LINKS = [
    [0, 1], [0, 6], [0, 4], [0, 3],            // Brasília → Américas / Lisboa
    [1, 9], [1, 21], [1, 0],                   // Washington → Londres / Moscou
    [9, 8], [9, 10], [9, 6],                   // Londres → Europa ocidental
    [13, 14], [13, 12], [13, 11],              // Budapeste → vizinhança
    [18, 19], [18, 20], [18, 10],              // Estocolmo → bálticos
    [21, 13], [21, 17], [21, 23],              // Moscou → leste / Tóquio
    [8, 7], [10, 13], [6, 9], [15, 16],        // teias europeias
    [1, 22], [23, 25], [0, 24]                 // globais
  ];

  // estado de animação por link (fase + velocidade)
  var FLOW = LINKS.map(function (lk, i) {
    return {
      a: lk[0], b: lk[1],
      phase: (i * 0.137) % 1,
      speed: 0.10 + (i % 5) * 0.018,
      amber: POINTS[lk[0]].hot && POINTS[lk[1]].hot
    };
  });

  function toXYZ(lat, lon) {
    var phi = lat * Math.PI / 180, lam = lon * Math.PI / 180;
    return {
      x: Math.cos(phi) * Math.sin(lam),
      y: Math.sin(phi),
      z: Math.cos(phi) * Math.cos(lam)
    };
  }
  function rotateY(p, a) {
    var c = Math.cos(a), s = Math.sin(a);
    return { x: p.x * c + p.z * s, y: p.y, z: -p.x * s + p.z * c };
  }
  function rotateX(p, a) {
    var c = Math.cos(a), s = Math.sin(a);
    return { x: p.x, y: p.y * c - p.z * s, z: p.y * s + p.z * c };
  }
  // ponto ao longo do arco (great-circle-ish, levantado da esfera) em t∈[0,1]
  function arcPoint(pa, pb, t) {
    var x = pa.x + (pb.x - pa.x) * t;
    var y = pa.y + (pb.y - pa.y) * t;
    var z = pa.z + (pb.z - pa.z) * t;
    var len = Math.sqrt(x * x + y * y + z * z) || 1;
    var lift = 1 + 0.22 * Math.sin(Math.PI * t);
    return { x: x / len * lift, y: y / len * lift, z: z / len * lift };
  }

  function initOne(canvas) {
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var size = canvas.clientWidth || 280;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    var R = size * 0.42;
    var cx = size / 2, cy = size / 2;

    var rotY = -0.7, rotX = -0.30;
    var autoSpin = 0.0015;
    var dragging = false, lastX = 0, lastY = 0, vel = autoSpin;
    var time = 0;

    // pré-computa XYZ unitário das capitais (estático no globo)
    var P3 = POINTS.map(function (p) { return toXYZ(p.lat, p.lon); });

    function project(p3) {
      var p = rotateY(p3, rotY);
      p = rotateX(p, rotX);
      return { x: cx + p.x * R, y: cy - p.y * R, z: p.z };
    }

    function graticule() {
      for (var lon = -180; lon < 180; lon += 30) {
        drawArcPath(function (t) { return toXYZ(-90 + t * 180, lon); });
      }
      for (var lat = -60; lat <= 60; lat += 30) {
        drawArcPath(function (t) { return toXYZ(lat, -180 + t * 360); });
      }
    }
    function drawArcPath(fn) {
      var N = 48, started = false, prevFront = null;
      ctx.beginPath();
      for (var i = 0; i <= N; i++) {
        var p = project(fn(i / N));
        var front = p.z >= 0;
        if (front !== prevFront && prevFront !== null) {
          ctx.strokeStyle = prevFront ? COL.grid : COL.gridBack;
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          started = true;
        } else if (!started) {
          ctx.moveTo(p.x, p.y);
          started = true;
        } else {
          ctx.lineTo(p.x, p.y);
        }
        prevFront = front;
      }
      ctx.strokeStyle = prevFront ? COL.grid : COL.gridBack;
      ctx.stroke();
    }

    // arco-base tênue (linha de rota)
    function drawRoute(pa, pb, amber) {
      var N = 40, moved = false;
      ctx.beginPath();
      for (var i = 0; i <= N; i++) {
        var pr = project(arcPoint(pa, pb, i / N));
        if (pr.z < -0.18) { moved = false; continue; }
        if (!moved) { ctx.moveTo(pr.x, pr.y); moved = true; }
        else ctx.lineTo(pr.x, pr.y);
      }
      ctx.strokeStyle = (amber ? COL.arcAm : COL.arcCy) + "0.13)";
      ctx.lineWidth = 1 * dpr;
      ctx.stroke();
    }

    // cometa: cauda curta que viaja de pa→pb na posição 'head'
    function drawComet(pa, pb, head, amber) {
      var TAIL = 0.16, STEPS = 14;
      var base = amber ? COL.arcAm : COL.arcCy;
      for (var s = 0; s < STEPS; s++) {
        var t1 = head - TAIL * (s / STEPS);
        var t0 = head - TAIL * ((s + 1) / STEPS);
        if (t1 < 0 || t1 > 1) continue;
        var a = project(arcPoint(pa, pb, Math.max(0, t0)));
        var b = project(arcPoint(pa, pb, t1));
        if (a.z < -0.18 || b.z < -0.18) continue;
        var fade = (1 - s / STEPS);
        var depth = 0.45 + 0.55 * Math.max(0, b.z);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = base + (fade * fade * 0.9 * depth).toFixed(3) + ")";
        ctx.lineWidth = (0.6 + fade * 2.0) * dpr;
        ctx.lineCap = "round";
        ctx.stroke();
      }
      // cabeça brilhante
      var h = project(arcPoint(pa, pb, head));
      if (h.z >= -0.1) {
        var rr = 2.1 * dpr * (0.7 + 0.3 * Math.max(0, h.z));
        ctx.beginPath();
        ctx.arc(h.x, h.y, rr * 2.6, 0, Math.PI * 2);
        ctx.fillStyle = base + "0.16)";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(h.x, h.y, rr, 0, Math.PI * 2);
        ctx.fillStyle = amber ? COL.accentHi : COL.pointHi;
        ctx.fill();
      }
    }

    function render() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);

      // esfera
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      var grad = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.35, R * 0.2, cx, cy, R);
      grad.addColorStop(0, "#13203A");
      grad.addColorStop(1, COL.fill);
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.lineWidth = 1 * dpr;
      graticule();

      // rotas-base + cometas
      ctx.lineCap = "round";
      for (var f = 0; f < FLOW.length; f++) {
        var fl = FLOW[f];
        drawRoute(P3[fl.a], P3[fl.b], fl.amber);
      }
      for (var g = 0; g < FLOW.length; g++) {
        var fg = FLOW[g];
        var head = ((time * fg.speed + fg.phase) % 1 + 1) % 1;
        drawComet(P3[fg.a], P3[fg.b], head, fg.amber);
      }
      ctx.lineCap = "butt";

      // capitais
      for (var i = 0; i < POINTS.length; i++) {
        var p = POINTS[i];
        var pr = project(P3[i]);
        if (pr.z < 0) continue;
        var alpha = 0.4 + 0.6 * pr.z;
        var pulse = p.hot ? (0.78 + 0.22 * Math.sin(time * 2.2 + i)) : 1;
        var rad = (p.r || 2.4) * dpr * (0.7 + 0.3 * pr.z);

        // halo pulsante (capitais com eleição em 2026)
        if (p.hot) {
          ctx.beginPath();
          ctx.arc(pr.x, pr.y, rad * (2.6 + 1.4 * (1 - pulse)) , 0, Math.PI * 2);
          ctx.fillStyle = "rgba(245,158,11," + (alpha * 0.10 * pulse).toFixed(3) + ")";
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(pr.x, pr.y, rad * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(6,182,212," + (alpha * 0.12).toFixed(3) + ")";
          ctx.fill();
        }
        // núcleo
        ctx.beginPath();
        ctx.arc(pr.x, pr.y, rad, 0, Math.PI * 2);
        ctx.fillStyle = p.hot ? COL.accent : COL.point;
        ctx.globalAlpha = alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // rim light
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(103,227,249,0.18)";
      ctx.lineWidth = 1.5 * dpr;
      ctx.stroke();
    }

    function tick() {
      time += 0.016;
      if (!dragging) {
        vel += (autoSpin - vel) * 0.04;
        rotY += vel;
      }
      render();
      raf = requestAnimationFrame(tick);
    }

    // interação
    canvas.addEventListener("pointerdown", function (e) {
      dragging = true; lastX = e.clientX; lastY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dx = e.clientX - lastX, dy = e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      rotY += dx * 0.006;
      rotX += dy * 0.006;
      rotX = Math.max(-1.2, Math.min(1.2, rotX));
      vel = dx * 0.006;
    });
    function endDrag() { dragging = false; }
    canvas.addEventListener("pointerup", endDrag);
    canvas.addEventListener("pointercancel", endDrag);

    var raf;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      // estado estático legível: alguns cometas no meio do percurso
      autoSpin = 0; vel = 0; time = 3.0; render();
    } else {
      tick();
    }

    window.addEventListener("resize", function () {
      var ns = canvas.clientWidth || size;
      if (Math.abs(ns - size) > 2) {
        size = ns; canvas.width = size * dpr; canvas.height = size * dpr;
        R = size * 0.42; cx = size / 2; cy = size / 2;
        render();
      }
    });
  }

  function init() {
    document.querySelectorAll("canvas[data-vd-globe]").forEach(initOne);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else { init(); }

  window.VDGlobe = { init: init };
})();
