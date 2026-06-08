/* ============================================================
   VotoData — blog: parser Markdown + render de cards e artigos
   Usado por blog.html (lista) e post.html (artigo).
   Escreva posts/<slug>.md e registre em posts/posts.json.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Markdown → HTML (mínimo, suficiente) ---------- */
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function inline(s) {
    return esc(s)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');
  }
  function renderMarkdown(md) {
    const lines = md.replace(/\r/g, '').split('\n');
    let html = '', i = 0, list = null;
    function closeList() { if (list) { html += '</' + list + '>'; list = null; } }
    while (i < lines.length) {
      let ln = lines[i];
      if (/^\s*$/.test(ln)) { closeList(); i++; continue; }
      let m;
      if ((m = ln.match(/^(#{1,4})\s+(.*)$/))) { closeList(); const lvl = m[1].length; html += '<h' + lvl + '>' + inline(m[2]) + '</h' + lvl + '>'; i++; continue; }
      if (/^\s*(---|\*\*\*)\s*$/.test(ln)) { closeList(); html += '<hr>'; i++; continue; }
      if ((m = ln.match(/^\s*>\s?(.*)$/))) { closeList(); let q = m[1]; i++; while (i < lines.length && /^\s*>\s?/.test(lines[i])) { q += ' ' + lines[i].replace(/^\s*>\s?/, ''); i++; } html += '<blockquote>' + inline(q) + '</blockquote>'; continue; }
      if ((m = ln.match(/^\s*[-*]\s+(.*)$/))) { if (list !== 'ul') { closeList(); list = 'ul'; html += '<ul>'; } html += '<li>' + inline(m[1]) + '</li>'; i++; continue; }
      if ((m = ln.match(/^\s*\d+\.\s+(.*)$/))) { if (list !== 'ol') { closeList(); list = 'ol'; html += '<ol>'; } html += '<li>' + inline(m[1]) + '</li>'; i++; continue; }
      // parágrafo (junta linhas seguidas)
      closeList(); let p = ln; i++;
      while (i < lines.length && !/^\s*$/.test(lines[i]) && !/^(#{1,4}\s|\s*[-*]\s|\s*\d+\.\s|\s*>|\s*---)/.test(lines[i])) { p += ' ' + lines[i]; i++; }
      html += '<p>' + inline(p) + '</p>';
    }
    closeList();
    return html;
  }
  window.renderMarkdown = renderMarkdown;

  async function getManifest() {
    const r = await fetch('posts/posts.json', { cache: 'no-cache' });
    if (!r.ok) throw new Error('posts.json não encontrado');
    return r.json();
  }

  function vizClass(cat) {
    return 'feat-viz--' + (cat || 'default').toLowerCase().normalize('NFD').replace(/[^a-z]/g, '');
  }

  /* ---------- blog.html: lista ---------- */
  async function renderList() {
    const featEl = document.getElementById('postFeature');
    const gridEl = document.getElementById('postGrid');
    const newsEl = document.getElementById('newsList');
    let data;
    try { data = await getManifest(); }
    catch (e) {
      if (gridEl) gridEl.innerHTML = '<p class="muted">Para ver os posts, publique o site (servidor http) — a leitura de <code>posts/</code> não funciona abrindo o arquivo direto.</p>';
      return;
    }
    const posts = data.posts || [];
    const feat = posts.find(p => p.featured) || posts[0];

    if (featEl && feat) {
      featEl.innerHTML =
        '<a class="feature__art" href="post.html?slug=' + feat.slug + '">' +
          '<span class="post__cat">' + feat.cat + '</span>' +
          '<h2>' + feat.title + '</h2><p>' + feat.excerpt + '</p>' +
          '<div class="postmeta"><span>' + feat.date + '</span><span>·</span><span>' + feat.read + '</span><span>·</span><span class="am">Destaque</span></div>' +
          '<span class="btn btn--link" style="margin-top:6px">Ler análise ' + (window.vdIcon ? window.vdIcon('arrowRight') : '→') + '</span>' +
        '</a>' +
        '<a class="feature__viz ' + vizClass(feat.cat) + '" href="post.html?slug=' + feat.slug + '"><span class="pill feature__badge"><span class="dot"></span>Editorial</span></a>';
    }

    if (gridEl) {
      gridEl.innerHTML = posts.filter(p => p !== feat).map(p =>
        '<a class="post" data-cat="' + p.cat + '" href="post.html?slug=' + p.slug + '">' +
          '<span class="post__cat">' + p.cat + '</span>' +
          '<h3>' + p.title + '</h3><p>' + p.excerpt + '</p>' +
          '<div class="postmeta"><span>' + p.date + '</span><span>·</span><span>' + p.read + '</span></div>' +
        '</a>').join('');
    }

    if (newsEl && data.noticias) {
      newsEl.innerHTML = data.noticias.map(n =>
        '<div class="news__item"><span class="news__date">' + n.date + '</span><span class="news__t">' + n.t + '</span><span class="news__src">' + n.src + '</span></div>').join('');
    }

    // filtro por categoria
    const chips = [].slice.call(document.querySelectorAll('[data-filter] .chip'));
    chips.forEach(c => c.addEventListener('click', function () {
      chips.forEach(x => x.classList.toggle('on', x === c));
      const cat = c.dataset.cat;
      gridEl.querySelectorAll('.post').forEach(p => { p.style.display = (cat === 'todos' || p.dataset.cat === cat) ? '' : 'none'; });
    }));
    if (window.vdHydrate) window.vdHydrate();
  }

  /* ---------- post.html: artigo ---------- */
  async function renderArticle() {
    const root = document.getElementById('article');
    const slug = new URLSearchParams(location.search).get('slug');
    if (!slug) { root.innerHTML = '<p class="muted">Artigo não especificado.</p>'; return; }
    let meta = {};
    try { const data = await getManifest(); meta = (data.posts || []).find(p => p.slug === slug) || {}; } catch (e) {}
    let body = '';
    try {
      const r = await fetch('posts/' + slug + '.md', { cache: 'no-cache' });
      if (!r.ok) throw new Error('404');
      body = renderMarkdown(await r.text());
    } catch (e) {
      root.innerHTML = '<div class="artbody"><p class="muted">Não foi possível carregar este artigo. Publique o site (servidor http) e confira se <code>posts/' + slug + '.md</code> existe.</p><p><a class="btn btn--link" href="blog.html">' + (window.vdIcon ? window.vdIcon('arrowRight') : '') + ' Voltar ao blog</a></p></div>';
      return;
    }
    document.title = (meta.title || 'Artigo') + ' — VOTODATA';
    root.innerHTML =
      '<header class="arthead">' +
        '<a class="artback" href="blog.html">' + (window.vdIcon ? window.vdIcon('arrowRight') : '') + ' Blog &amp; Notícias</a>' +
        (meta.cat ? '<span class="post__cat" style="align-self:flex-start">' + meta.cat + '</span>' : '') +
        '<h1>' + (meta.title || slug) + '</h1>' +
        (meta.date ? '<div class="postmeta"><span>' + meta.date + '</span><span>·</span><span>' + (meta.read || '') + '</span></div>' : '') +
      '</header>' +
      '<article class="artbody">' + body + '</article>' +
      '<div class="artcta"><div class="cta-banner"><span class="eyebrow eyebrow--plain">VotoData</span><h2 class="h2">Quer ver isso aplicado ao seu território?</h2><p class="lead" style="text-align:center">Agende 15 minutos e mostramos o relatório do seu município rodando ao vivo.</p><div class="cta"><a class="btn btn--primary btn--lg" href="mailto:contato@votodata.net?subject=Demo%20VotoData%202026">Agendar demonstração</a><a class="btn btn--ghost btn--lg" href="blog.html">Ver mais artigos</a></div></div></div>';
    if (window.vdHydrate) window.vdHydrate();
  }

  function boot() {
    if (document.getElementById('article')) renderArticle();
    else if (document.getElementById('postGrid')) renderList();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
