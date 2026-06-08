/* VotoData — painéis internos: ícones + copiar código + tabs */
(function () {
  var P = {
    dashboard:'<rect x="3" y="3" width="8" height="9" rx="1"/><rect x="13" y="3" width="8" height="5" rx="1"/><rect x="13" y="12" width="8" height="9" rx="1"/><rect x="3" y="16" width="8" height="5" rx="1"/>',
    article:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    phone:'<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/>',
    tablet:'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M11 18h2"/>',
    users:'<circle cx="9" cy="8" r="3.4"/><path d="M2.5 20c0-3.3 2.9-6 6.5-6s6.5 2.7 6.5 6"/><path d="M16 5.2A3.4 3.4 0 0 1 18 12M21.5 20c0-2.6-1.8-4.9-4.5-5.6"/>',
    user:'<circle cx="12" cy="8" r="4"/><path d="M5 21c0-3.9 3.1-7 7-7s7 3.1 7 7"/>',
    cpu:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2"/>',
    bolt:'<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>',
    database:'<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
    layers:'<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5M3 16.5 12 21l9-4.5"/>',
    map:'<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path d="M9 4v14M15 6v14"/>',
    shield:'<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z"/><path d="m9 12 2 2 4-4"/>',
    server:'<rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 7.5h.01M7 16.5h.01"/>',
    globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18"/>',
    key:'<circle cx="8" cy="15" r="4"/><path d="m10.8 12.2 8.2-8.2M17 5l2 2M14 8l2 2"/>',
    radar:'<path d="M12 12 19 5"/><path d="M12 3a9 9 0 1 0 9 9"/><path d="M12 7a5 5 0 1 0 5 5"/><circle cx="12" cy="12" r="1"/>',
    bell:'<path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    api:'<path d="M4 7h6a3 3 0 0 1 0 6H7m0-6v10"/><path d="M20 7v10M16 7v10M16 12h4"/>',
    cart:'<circle cx="9" cy="20" r="1.6"/><circle cx="18" cy="20" r="1.6"/><path d="M2 3h2l2.5 12h11l2-8H5"/>',
    flask:'<path d="M9 3h6M10 3v6L4.5 18a2 2 0 0 0 1.8 3h11.4a2 2 0 0 0 1.8-3L14 9V3"/><path d="M7.5 14h9"/>',
    lock:'<rect x="4" y="11" width="16" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    building:'<path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M17 21V9h2a2 2 0 0 1 2 2v10M8 7h2M8 11h2M8 15h2"/>',
    download:'<path d="M12 3v12M7 11l5 5 5-5M5 21h14"/>',
    sync:'<path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 16v-5M12 8h.01"/>',
    alert:'<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h16.9a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>',
    down:'<path d="M12 5v14M6 13l6 6 6-6"/>',
    back:'<path d="M19 12H5M11 18l-6-6 6-6"/>'
  };
  function ic(n){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+(P[n]||'')+'</svg>';}
  window.archIcon = ic;
  document.querySelectorAll('[data-i]').forEach(function(el){el.innerHTML=ic(el.dataset.i);});
  document.querySelectorAll('.code__bar .cp').forEach(function(b){
    b.addEventListener('click',function(){
      var pre=b.closest('.code').querySelector('pre');
      navigator.clipboard && navigator.clipboard.writeText(pre.innerText).then(function(){var t=b.textContent;b.textContent='copiado ✓';setTimeout(function(){b.textContent=t;},1400);});
    });
  });
})();
