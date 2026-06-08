# VOTODATA — Site institucional

Site público da VotoData (marketing + acesso por código), no design system VotoData
(dark-first, brasão, Space Grotesk + Inter, ciano/âmbar). HTML/CSS/JS estático puro —
**sem build, sem framework, sem dependências de servidor.** Abre em qualquer navegador e
publica em qualquer host estático.

---

## 📁 Estrutura

```
site/
├── index.html          → Home / landing
├── candidatos.html     → Painel do Candidato      (com variações de layout)
├── partidos.html       → Party Command Center      (com variações de layout)
├── agencies.html       → Agency Intelligence Hub    (com variações de layout)
├── produto.html        → Ecossistema de produtos
├── contato.html        → Canais + formulário
├── legal.html          → Privacidade, Termos, Fontes de dados
├── blog.html           → Blog & Notícias (lista gerada de posts/)
├── post.html           → Renderiza um artigo: post.html?slug=<arquivo>
├── acesso.html         → Resgate de código → trial + prévia do relatório
├── login.html          → Tela de login da plataforma (app.votodata.net)
│
├── arquitetura.html    → Diagrama do ecossistema      (INTERNO)
├── operacao.html       → Manual de operação: DNS, systemd, Caddy (INTERNO)
├── apps.html           → Apps iOS/Field e superfícies web (INTERNO)
├── dados.html          → Do banco ao candidato: tenants, leads (INTERNO)
│
├── site.css            → Estilos + tokens do design system (todas as páginas)
├── site.js             → Header, footer, ícones SVG, FAQ, scroll-reveal
├── audience.css        → Layouts das páginas de público + seletor de variações
├── audience.js         → Renderiza candidatos/partidos/agencies a partir de dados
├── arch.css / arch.js  → Estilos + ícones dos painéis internos
├── blog.js             → Parser Markdown + render de cards e artigos
├── posts/
│   ├── posts.json      → Manifesto dos artigos (registre cada post aqui)
│   └── *.md            → Um arquivo por artigo
└── assets/
    ├── brasao.png
    ├── brasil-estados.svg
    └── brasil-mini.svg
```

Cada página `.html` é independente; todas compartilham `site.css` + `site.js`.

---

## 🚀 Publicar no Cloudflare Pages

1. Cloudflare Dashboard → **Workers & Pages → Create → Pages → Direct Upload**.
2. Arraste a **pasta `site/`** (ou o `.zip`). É só conteúdo estático — sem comando de build.
3. Em **Custom domains**, adicione `votodata.net` e `www.votodata.net` e siga as instruções
   de DNS que o Cloudflare mostrar.

> Os caminhos são todos relativos (`site.css`, `assets/…`, `candidatos.html`), então funciona
> direto, sem configuração.

**Antes de publicar:** apague os painéis internos (`arquitetura.html`, `operacao.html`,
`apps.html`, `dados.html`) — são para você, não para o público.

## ✍️ Blog a partir de Markdown

1. Escreva o artigo em `posts/meu-artigo.md` (Markdown: `#`, `##`, `**negrito**`, listas, `>` citação, links).
2. Registre no `posts/posts.json` (slug = nome do arquivo sem `.md`, título, categoria, data, resumo).
3. Pronto: vira card no `blog.html` e abre em `post.html?slug=meu-artigo`.

> O blog lê arquivos via `fetch`, então funciona **servido por http** (Cloudflare Pages / `npx serve`),
> não abrindo o arquivo direto do disco.

---

## ✏️ Como editar

### Textos das páginas de público (candidatos / partidos / agências)
Essas três páginas são geradas por `audience.js` a partir de um objeto `window.PAGE` no topo
do próprio `.html`. Para mudar a copy, edite o objeto — ex. em `candidatos.html`:

```js
window.PAGE = {
  title: 'Você sabe onde sua votação se concentra — <span class="cy">...</span>',
  lead:  '...',
  stack: { items: [ { icon: 'map', h: 'Título', p: 'Descrição' }, ... ] },
  ...
}
```

`<span class="cy">` = destaque ciano · `<span class="am">` = âmbar.

### Demais páginas (home, produto, contato, legal, blog, acesso)
São HTML normal — edite o conteúdo direto no arquivo.

### Header e footer (todas as páginas)
Definidos uma única vez em `site.js` (funções `buildHeader` / `buildFooter`).
Mudou ali, muda em todas.

### Cores, fontes, espaçamento
Tokens no `:root` do `site.css` (espelham o design system). Use `var(--primary)`,
`var(--accent)`, `var(--text)`, etc. — não invente cores novas.

---

## 🔑 Botão "Entrar" → plataforma

O header tem um botão **Entrar** apontando para a plataforma logada. A URL fica numa
constante única — `site.js`:

```js
const APP_LOGIN = 'https://app.votodata.net';
```

Troque esse valor quando o app Angular estiver no ar. Muda em todas as páginas de uma vez.

---

## 🎟️ Página de acesso por código (`acesso.html`)

Fluxo: candidato recebe um código → resgata em `votodata.net/acesso` → vê uma **prévia do
relatório personalizado** (KPIs, desempenho por zona, próximas ações) + CTA para entrar na
plataforma.

**Estado atual = protótipo:** qualquer código com 4+ caracteres libera a prévia (código de
teste: `VOTO-2026`). Os dados do relatório são ilustrativos.

**Para produção**, troque a validação no `<script>` do final do arquivo por uma chamada à
sua API:

```js
// hoje: libera com qualquer código 4+
// produção: validar contra api.votodata.net e buscar os dados reais do território
const resp = await fetch('https://api.votodata.net/acesso/' + codigo);
```

---

## 🗺️ Arquitetura (visão geral)

Abra `arquitetura.html` no navegador para o mapa visual completo. Resumo:

```
votodata.net          → este site (estático, Cloudflare Pages)
app.votodata.net      → plataforma logada (Angular) — a construir
api.votodata.net      → API Rust + Postgres (Hetzner)
service-book.…        → service-book existente
```

**Prioridade nº 1 do backend:** tirar a API do `cargo run` →
`cargo build --release` → binário → serviço **systemd** → **Caddy** (HTTPS automático).
Assim a API fica de pé 24/7 sozinha.

**Banco:** Postgres é a escolha certa para dados eleitorais. Só considere `pgvector`
(extensão do próprio Postgres) se for fazer busca semântica/embeddings — não migre de banco.

---

## ✅ Checklist "ir ao ar"

- [x] Site institucional desenhado e responsivo
- [x] Botão "Entrar" → app.votodata.net
- [ ] Deploy do site no Cloudflare Pages
- [ ] DNS: `votodata.net` → Pages
- [ ] Binário Rust + systemd + Caddy (HTTPS)
- [ ] DNS: `api.votodata.net` → servidor Hetzner
- [ ] App Angular + DNS `app.votodata.net`
- [ ] Validação real do código em `acesso.html`

---

© 2026 VOTODATA · Inteligência Eleitoral · dados exclusivamente de fontes públicas oficiais.
