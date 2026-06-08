/* ============================================================
   VotoData — renderizador das páginas de público + variações
   Lê window.PAGE e injeta as seções em #app. Requer site.js (vdIcon).
   ============================================================ */
(function () {
  "use strict";
  const I = window.vdIcon || ((n) => "");
  const P = window.PAGE;
  if (!P) return;
  const DEMO = P.demo || 'mailto:contato@votodata.net?subject=Demo%20VotoData%202026';

  const el = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const ctaBtns = (arr) => (arr || []).map((c) =>
    '<a class="btn ' + (c.primary ? 'btn--primary' : c.link ? 'btn--link' : 'btn--ghost') + ' btn--lg" href="' + (c.href || DEMO) + '">'
    + (c.icon ? '<i data-i="' + c.icon + '"></i>' : '') + c.label + (c.arrow ? ' <i data-i="arrowRight"></i>' : '') + '</a>').join('');

  /* ---------- HERO mock ---------- */
  function mockHTML(m) {
    if (!m) return '';
    let inner = '<div class="amock__bar"><span class="amock__dot"></span><span class="amock__dot"></span><span class="amock__dot"></span><span class="amock__t">' + (m.title || 'votodata') + '</span></div>';
    if (m.kpis) inner += '<div class="amock__kpis">' + m.kpis.map((k) =>
      '<div class="amock__kpi"><div class="amock__kv ' + (k.tone || '') + '">' + k.v + '</div><div class="amock__kl">' + k.l + '</div></div>').join('') + '</div>';
    if (m.chart) inner += '<div class="amock__chart">' + m.chart.map((h, i) =>
      '<span class="amock__col' + (i === m.chartHi ? ' amock__col--am' : '') + '" style="height:' + h + '%"></span>').join('') + '</div>';
    if (m.bars) inner += '<div class="sim__bars" style="margin-top:14px">' + m.bars.map((b) =>
      '<div class="simbar"><span class="simbar__n">' + b.n + '</span><span class="simbar__track"><span class="simbar__fill ' + (b.fill || '') + '" style="width:' + b.w + '%"></span></span><span class="simbar__v">' + b.v + '</span><span class="simbar__st simbar__st--' + b.st + '">' + b.stl + '</span></div>').join('') + '</div>';
    if (m.rows) inner += '<div class="amock__rows">' + m.rows.map((r) =>
      '<div class="amock__row"><span>' + r.l + '</span><span class="mono">' + r.v + '</span></div>').join('') + '</div>';
    return '<div class="amock panel">' + inner + '</div>';
  }

  /* ---------- Sections ---------- */
  function heroSec() {
    return '<section class="ahero" data-screen-label="' + P.page + ' — Hero"><div class="wrap"><div class="ahero__inner">'
      + '<div class="ahero__text">'
      + '<span class="pill ahero__eyebrow"><span class="dot dot--live"></span>' + P.eyebrow + '</span>'
      + '<h1 class="display">' + P.title + '</h1>'
      + '<p class="lead">' + P.lead + '</p>'
      + '<div class="ahero__cta">' + ctaBtns(P.ctas) + '</div>'
      + '</div>'
      + '<div class="ahero__media">' + mockHTML(P.mock) + '</div>'
      + '</div></div></section>';
  }

  function head(s, amber) {
    return '<div class="section-head" data-reveal>'
      + '<span class="eyebrow ' + (amber ? 'eyebrow--amber' : '') + '">' + s.eyebrow + '</span>'
      + '<h2 class="h2">' + s.title + '</h2>'
      + (s.lead ? '<p class="lead">' + s.lead + '</p>' : '') + '</div>';
  }

  function diagSec() {
    const s = P.diag;
    return '<section class="section"><div class="wrap">' + head(s, true)
      + '<div class="grid g3" style="margin-top:46px">'
      + s.items.map((it) => '<div class="card card--glow" data-reveal>'
        + '<div class="card__ico ' + (it.danger ? 'card__ico--danger' : 'card__ico--amber') + '"><i data-i="' + it.icon + '"></i></div>'
        + '<h3 class="h3">' + it.h + '</h3><p>' + it.p + '</p></div>').join('')
      + '</div></div></section>';
  }

  function stackSec() {
    const s = P.stack;
    return '<div class="wrap"><div class="divider"></div></div>'
      + '<section class="section"><div class="wrap">' + head(s)
      + '<div class="stack-grid">'
      + s.items.map((it) => '<div class="card feat card--glow" data-reveal>'
        + '<div class="card__ico ' + (it.amber ? 'card__ico--amber' : '') + '"><i data-i="' + it.icon + '"></i></div>'
        + '<div><h3 class="h3">' + it.h + '</h3><p>' + it.p + '</p></div></div>').join('')
      + '</div></div></section>';
  }

  function fluxoSec() {
    const s = P.fluxo;
    return '<section class="section"><div class="wrap">' + head(s)
      + '<div class="steps" style="margin-top:42px">'
      + s.steps.map((st, i) => '<div class="step" data-reveal>'
        + '<span class="step__n">0' + (i + 1) + '</span><h3>' + st.h + '</h3><p>' + st.p + '</p></div>').join('')
      + '</div></div></section>';
  }

  function provaSec() {
    const s = P.prova;
    return '<section class="section"><div class="wrap">' + head(s, true)
      + '<div class="prova panel" data-reveal style="margin-top:34px">'
      + '<div class="prova__ico"><i data-i="' + (s.icon || 'verified') + '"></i></div>'
      + '<div class="prova__body"><p>' + s.p + '</p>'
      + '<span class="tag"><i data-i="check" style="width:15px"></i>' + s.badge + '</span></div>'
      + '</div></div></section>';
  }

  function escopoSec() {
    const s = P.escopo;
    return '<section class="section section--tight"><div class="wrap">'
      + '<div class="escopo" data-reveal>'
      + '<div class="escopo__l"><span class="eyebrow eyebrow--plain">' + s.eyebrow + '</span>'
      + '<h2 class="h2" style="margin-top:12px">' + s.title + '</h2><p>' + s.p + '</p></div>'
      + '<a class="btn btn--primary btn--lg" href="' + (s.cta.href || DEMO) + '"><i data-i="calendar"></i>' + s.cta.label + '</a>'
      + '</div></div></section>';
  }

  function faqSec() {
    const s = P.faq;
    return '<section class="section"><div class="wrap" style="max-width:880px">'
      + '<div class="section-head" data-reveal style="margin-bottom:34px"><span class="eyebrow">FAQ</span><h2 class="h2">Perguntas rápidas.</h2></div>'
      + '<div class="faq" data-reveal>'
      + s.items.map((q) => '<div class="faq__item"><button class="faq__q">' + q.q + '<i data-i="plus"></i></button>'
        + '<div class="faq__a"><p>' + q.a + '</p></div></div>').join('')
      + '</div></div></section>';
  }

  function ctaSec() {
    const s = P.cta;
    return '<section class="section"><div class="wrap"><div class="cta-banner" data-reveal>'
      + '<span class="eyebrow eyebrow--plain">' + (s.eyebrow || 'Próximo passo') + '</span>'
      + '<h2 class="h2">' + s.title + '</h2>'
      + '<p class="lead" style="text-align:center">' + s.p + '</p>'
      + '<div class="cta">' + ctaBtns(s.buttons) + '</div></div>'
      + '<p class="disclaimer" style="margin:32px auto 0;text-align:center"><b>Disclaimer.</b> Todas as informações disponíveis no VotoData são extraídas exclusivamente de fontes públicas oficiais. A plataforma não recomenda, ranqueia nem sugere candidatos ou partidos. O objetivo é oferecer transparência através de dados, nunca interferir na decisão do eleitor.</p>'
      + '</div></section>';
  }

  /* ---------- Variant switcher ---------- */
  const KEY = 'vd-layout-' + P.page;
  const DEFAULTS = Object.assign({ hero: 'split', stack: 'cards' }, P.layout || {});
  function loadLayout() { try { return Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { return Object.assign({}, DEFAULTS); } }
  function applyLayout(l) { document.body.dataset.hero = l.hero; document.body.dataset.stack = l.stack; }

  function buildSwitch(cur) {
    const seg = (group, opts) => '<div class="vswitch__group"><label>' + (group === 'hero' ? 'Layout do hero' : 'Seções de recursos') + '</label><div class="seg" data-group="' + group + '">'
      + opts.map((o) => '<button data-v="' + o + '"' + (cur[group] === o ? ' class="is-on"' : '') + '>' + o + '</button>').join('') + '</div></div>';
    const w = el('<aside class="vswitch is-min"><div class="vswitch__head"><h5>Variações de layout</h5><span class="vswitch__chev">' + I('chevDown') + '</span></div>'
      + '<div class="vswitch__body">'
      + seg('hero', ['centrado', 'split', 'editorial'])
      + seg('stack', ['cards', 'lista'])
      + '<p class="vswitch__hint">Compare direções e escolha. A preferência fica salva neste navegador.</p>'
      + '</div></aside>');
    document.body.appendChild(w);
    w.querySelector('.vswitch__head').addEventListener('click', () => w.classList.toggle('is-min'));
    w.querySelectorAll('.seg').forEach((seg) => {
      seg.addEventListener('click', (e) => {
        const b = e.target.closest('button'); if (!b) return;
        const g = seg.dataset.group, v = b.dataset.v;
        seg.querySelectorAll('button').forEach((x) => x.classList.toggle('is-on', x === b));
        const l = loadLayout(); l[g] = v; localStorage.setItem(KEY, JSON.stringify(l)); applyLayout(l);
      });
    });
  }

  /* ---------- Mount ---------- */
  const layout = loadLayout();
  applyLayout(layout);
  const app = document.getElementById('app');
  app.innerHTML = heroSec() + diagSec() + stackSec() + fluxoSec() + provaSec() + escopoSec() + faqSec() + ctaSec();
  // buildSwitch(layout);

  // hydrate icons + interactions now that DOM exists (site.js boot already ran on empty body)
  if (window.vdHydrate) window.vdHydrate();
})();
