/* ============================================================
   VotoData — site público · chrome + ícones + interações
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Ícones (stroke, 24x24) ---------- */
  const P = {
    map:'<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path d="M9 4v14M15 6v14"/>',
    trendingUp:'<path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/>',
    radar:'<path d="M12 12 19 5"/><path d="M12 3a9 9 0 1 0 9 9"/><path d="M12 7a5 5 0 1 0 5 5"/><circle cx="12" cy="12" r="1"/>',
    target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    shield:'<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z"/><path d="m9 12 2 2 4-4"/>',
    check:'<path d="M20 6 9 17l-5-5"/>',
    x:'<path d="M18 6 6 18M6 6l12 12"/>',
    block:'<circle cx="12" cy="12" r="9"/><path d="m5.6 5.6 12.8 12.8"/>',
    arrowRight:'<path d="M5 12h14M13 6l6 6-6 6"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/>',
    mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    lockOpen:'<rect x="4" y="11" width="16" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.5-2"/>',
    bolt:'<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>',
    database:'<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
    dashboard:'<rect x="3" y="3" width="8" height="9" rx="1"/><rect x="13" y="3" width="8" height="5" rx="1"/><rect x="13" y="12" width="8" height="9" rx="1"/><rect x="3" y="16" width="8" height="5" rx="1"/>',
    api:'<path d="M4 7h6a3 3 0 0 1 0 6H7m0-6v10"/><path d="M20 7v10M16 7v10M16 12h4"/>',
    bell:'<path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    phone:'<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/>',
    article:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    model:'<circle cx="12" cy="5" r="2.4"/><circle cx="5" cy="18" r="2.4"/><circle cx="19" cy="18" r="2.4"/><path d="M12 7.4v4M10.5 13 6.7 16M13.5 13l3.8 3"/>',
    user:'<circle cx="12" cy="8" r="4"/><path d="M5 21c0-3.9 3.1-7 7-7s7 3.1 7 7"/>',
    bank:'<path d="M3 9 12 4l9 5"/><path d="M5 9v8M19 9v8M9 9v8M15 9v8M3 20h18"/>',
    users:'<circle cx="9" cy="8" r="3.4"/><path d="M2.5 20c0-3.3 2.9-6 6.5-6s6.5 2.7 6.5 6"/><path d="M16 5.2A3.4 3.4 0 0 1 18 12M21.5 20c0-2.6-1.8-4.9-4.5-5.6"/>',
    folder:'<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    gavel:'<path d="m14 8-6 6"/><path d="m11 5 5 5-2.5 2.5-5-5L11 5Z"/><path d="m6.5 9.5 5 5L9 17l-5-5 2.5-2.5Z"/><path d="M5 21h9"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
    chevDown:'<path d="m6 9 6 6 6-6"/>',
    chevRight:'<path d="m9 6 6 6-6 6"/>',
    play:'<path d="M7 5v14l12-7Z"/>',
    verified:'<path d="m12 2 2.4 1.8 3-.2.9 2.9 2.5 1.7-1 2.8 1 2.8-2.5 1.7-.9 2.9-3-.2L12 22l-2.4-1.8-3 .2-.9-2.9L3.2 16l1-2.8-1-2.8 2.5-1.7.9-2.9 3 .2L12 2Z"/><path d="m9 12 2 2 4-4"/>',
    sparkle:'<path d="M12 3v6M12 15v6M3 12h6M15 12h6" opacity=".4"/><path d="M12 8a4 4 0 0 0 4 4 4 4 0 0 0-4 4 4 4 0 0 0-4-4 4 4 0 0 0 4-4Z"/>',
    flask:'<path d="M9 3h6M10 3v6L4.5 18a2 2 0 0 0 1.8 3h11.4a2 2 0 0 0 1.8-3L14 9V3"/><path d="M7.5 14h9"/>',
    layers:'<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5M3 16.5 12 21l9-4.5"/>',
    cpu:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2"/>',
    file:'<path d="M7 3h7l5 5v13a0 0 0 0 1 0 0H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M14 3v5h5"/>',
    quote:'<path d="M7 7H4v6a4 4 0 0 0 4 4M17 7h-3v6a4 4 0 0 0 4 4" opacity=".9"/>',
    flag:'<path d="M5 21V4M5 4c4-2 8 2 12 0v9c-4 2-8-2-12 0"/>',
    chart:'<path d="M4 20V4M4 20h16M9 16V9M14 16v-4M19 16V7"/>',
    rust:'<circle cx="12" cy="12" r="9"/><path d="M12 7v10M8 9h6a2 2 0 0 1 0 4H8M14 13l3 4"/>',
    headset:'<path d="M5 13a7 7 0 0 1 14 0"/><rect x="3" y="13" width="4" height="6" rx="1.5"/><rect x="17" y="13" width="4" height="6" rx="1.5"/><path d="M19 19a4 4 0 0 1-4 3h-2"/>',
    twitter:'<path d="M4 4l7 9.5L4.5 20H7l5-5.4L16 20h4l-7.3-9.9L19.5 4H17l-4.6 5L8.8 4H4Z"/>',
    instagram:'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>',
    facebook:'<path d="M14 8h2V5h-2c-2 0-3 1.3-3 3v2H9v3h2v6h3v-6h2l1-3h-3V8.5c0-.3.2-.5.5-.5Z"/>',
    whatsapp:'<path d="M4 20l1.4-4A8 8 0 1 1 9 19.2L4 20Z"/><path d="M9 9c0 4 2 6 6 6M9 9c0-1 .8-1 1.2-.7.3.3 1 1.6 1 2 0 .3-.6.8-.8 1M15 15c1 0 1-.8.7-1.2-.3-.3-1.6-1-2-1-.3 0-.8.6-1 .8"/>',
    linkedin:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 10v7M7 7v.01M11 17v-4a2 2 0 0 1 4 0v4M11 10v7"/>',
    chat:'<path d="M21 12a8 8 0 0 1-11.5 7.2L4 21l1.8-5.5A8 8 0 1 1 21 12Z"/>',
  };

  function svg(name, cls) {
    const d = P[name] || P.sparkle;
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" '
      + 'stroke-linecap="round" stroke-linejoin="round"' + (cls ? ' class="' + cls + '"' : '') + '>' + d + '</svg>';
  }
  window.vdIcon = svg;

  /* ---------- Config compartilhada ---------- */
  const NAV = [
    { id:'candidatos', label:'Candidatos', href:'candidatos.html' },
    { id:'partidos',   label:'Partidos',   href:'partidos.html' },
    { id:'agencias',   label:'Agências',   href:'agencies.html' },
    { id:'produto',    label:'Produto',    href:'produto.html' },
    { id:'research',   label:'Research',   href:'research.html' },
  ];
  const DEMO = 'mailto:contato@votodata.net?subject=Demo%20VotoData%202026';
  // Tela de login. Hoje aponta para login.html (mesmo deploy).
  // Quando o app Angular subir, troque para 'https://app.votodata.net'.
  const APP_LOGIN = 'login.html';

  function brand(big) {
    return '<a class="brand" href="index.html" aria-label="VotoData — início">'
      + '<img src="assets/brasao.png" alt="">'
      + '<span class="brand__wm">VOTO<b>DATA</b></span></a>';
  }

  /* ---------- Header ---------- */
  function buildHeader(active) {
    const links = NAV.map(n => '<a href="' + n.href + '"' + (n.id === active ? ' class="is-active"' : '') + '>' + n.label + '</a>').join('');
    const h = document.createElement('header');
    h.className = 'site-header';
    h.innerHTML =
      '<div class="wrap">' + brand() +
        '<nav class="nav">' + links + '</nav>' +
        '<div class="header-cta">' +
          '<a class="btn btn--ghost" href="' + APP_LOGIN + '">' + svg('lockOpen') + 'Entrar</a>' +
          '<a class="btn btn--primary" href="' + DEMO + '">' + svg('calendar') + 'Demo</a>' +
        '</div>' +
        '<button class="menu-btn" aria-label="Menu">' + svg('menu') + '</button>' +
      '</div>';
    document.body.prepend(h);

    // mobile drawer
    const m = document.createElement('div');
    m.className = 'mnav';
    m.innerHTML =
      '<div class="mnav__top">' + brand() + '<button class="mnav__x" aria-label="Fechar">' + svg('x') + '</button></div>' +
      NAV.map(n => '<a href="' + n.href + '">' + n.label + '</a>').join('') +
      '<a href="index.html">Início</a>' +
      '<a class="btn btn--ghost btn--lg" href="' + APP_LOGIN + '">' + svg('lockOpen') + 'Entrar na plataforma</a>' +
      '<a class="btn btn--primary btn--lg" href="' + DEMO + '">' + svg('calendar') + 'Agendar demo</a>';
    document.body.appendChild(m);

    h.querySelector('.menu-btn').addEventListener('click', () => m.classList.add('is-open'));
    m.querySelector('.mnav__x').addEventListener('click', () => m.classList.remove('is-open'));
    m.querySelectorAll('a').forEach(a => a.addEventListener('click', () => m.classList.remove('is-open')));

    const onScroll = () => h.classList.toggle('is-scrolled', window.scrollY > 12);
    onScroll(); window.addEventListener('scroll', onScroll, { passive:true });
  }

  /* ---------- Footer ---------- */
  function buildFooter() {
    const soc = [
      ['twitter','https://x.com/votodata'],['instagram','https://instagram.com/meuvotodata'],
      ['facebook','https://facebook.com/votodata'],['whatsapp','https://wa.me/5511951417671'],
      ['linkedin','https://linkedin.com/company/votodata'],
    ].map(([i,u]) => '<a href="' + u + '" target="_blank" rel="noopener" aria-label="' + i + '">' + svg(i) + '</a>').join('');

    const f = document.createElement('footer');
    f.className = 'site-footer';
    f.innerHTML =
      '<div class="wrap">' +
        '<div class="footer-grid">' +
          '<div class="footer-brand">' + brand() +
            '<p>O sistema operacional de inteligência eleitoral para campanhas, partidos e agências que decidem com dados.</p>' +
            '<div class="footer-soc">' + soc + '</div></div>' +
          '<div class="footer-col"><h4>Plataforma</h4>' +
            '<a href="candidatos.html">Candidatos</a><a href="partidos.html">Partidos</a>' +
            '<a href="agencies.html">Agências</a><a href="produto.html">Produto</a><a href="pricing.html">Planos</a></div>' +
          '<div class="footer-col"><h4>Conteúdo</h4>' +
            '<a href="blog.html">Blog</a><a href="research.html">Research Unit</a>' +
            '<a href="produto.html#manifesto">Manifesto</a><a href="contato.html">Contato</a></div>' +
          '<div class="footer-col"><h4>Legal</h4>' +
            '<a href="legal.html#privacidade">Privacidade</a><a href="legal.html#termos">Termos de Uso</a>' +
            '<a href="mailto:contato@votodata.net">contato@votodata.net</a></div>' +
        '</div>' +
        '<div class="footer-bot">' +
          '<span class="mono">© 2026 VOTODATA · Inteligência Eleitoral</span>' +
          '<span>Dados exclusivamente de fontes públicas oficiais · Compliance TSE/LGPD</span>' +
        '</div>' +
      '</div>';
    document.body.appendChild(f);
  }

  /* ---------- Inline icon hydration: <i data-i="map"></i> ---------- */
  function hydrateIcons(root) {
    (root || document).querySelectorAll('[data-i]').forEach(el => {
      if (el.dataset.done) return;
      el.innerHTML = svg(el.dataset.i);
      el.dataset.done = '1';
    });
  }

  /* ---------- FAQ accordion ---------- */
  function initFaq() {
    document.querySelectorAll('.faq__q').forEach(q => {
      if (q.dataset.bound) return; q.dataset.bound = '1';
      q.addEventListener('click', () => {
        const item = q.closest('.faq__item');
        const a = item.querySelector('.faq__a');
        const open = item.classList.toggle('is-open');
        a.style.maxHeight = open ? a.scrollHeight + 'px' : 0;
      });
    });
  }

  /* ---------- Scroll reveal (IO-free, robust) ---------- */
  let revealHooked = false;
  function revealPass() {
    const vh = window.innerHeight || 800;
    document.querySelectorAll('[data-reveal]:not(.is-in)').forEach(e => {
      if (e.getBoundingClientRect().top < vh * 0.92) e.classList.add('is-in');
    });
  }
  function initReveal() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('[data-reveal]').forEach(e => e.classList.add('is-in'));
      return;
    }
    document.body.classList.add('reveal-on');
    revealPass();
    if (!revealHooked) {
      revealHooked = true;
      window.addEventListener('scroll', () => requestAnimationFrame(revealPass), { passive: true });
      window.addEventListener('resize', () => requestAnimationFrame(revealPass), { passive: true });
    }
    // safety: never leave content hidden
    setTimeout(revealPass, 250);
    setTimeout(() => document.querySelectorAll('[data-reveal]:not(.is-in)').forEach(e => e.classList.add('is-in')), 2500);
  }

  /* ---------- WhatsApp flutuante (todas as páginas) ---------- */
  function buildWhats() {
    if (document.querySelector('.wfab')) return;
    var msg = encodeURIComponent('Olá! Vim pelo site da VotoData e quero saber mais sobre a plataforma.');
    var a = document.createElement('a');
    a.className = 'wfab';
    a.href = 'https://wa.me/5511951417671?text=' + msg;
    a.target = '_blank'; a.rel = 'noopener';
    a.setAttribute('aria-label', 'Falar no WhatsApp');
    a.innerHTML = svg('whatsapp') + '<span class="wfab__lbl">Fale com a gente</span>';
    document.body.appendChild(a);
  }

  function hydrate() { hydrateIcons(); initFaq(); initReveal(); }
  window.vdHydrate = hydrate;

  /* ---------- Boot ---------- */
  function boot() {
    const active = document.body.dataset.page || '';
    buildHeader(active);
    buildFooter();
    buildWhats();
    hydrate();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
