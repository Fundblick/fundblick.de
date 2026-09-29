'use strict';

(function (root) {
  if (!root || typeof document === 'undefined') return;
  const cards = document.getElementById('cards');
  const summary = document.getElementById('summary');
  if (!cards || !summary) return;

  let lastSignature = '';
  let timer = null;

  function loading(text) {
    return /werden geladen|loading|yükleniyor|загружа|يتم التحميل|ładow|se încarcă|caricamento|зарежд|učitav|φόρτ|cargando|chargement|carreg|در حال بارگذاری|duke u ngarkuar|加载|tê barkirin/i.test(String(text || ''));
  }

  function visibleCount() {
    return cards.querySelectorAll('.product-card:not([hidden])').length;
  }

  function emit() {
    const text = String(summary.textContent || '').trim();
    if (!text || loading(text)) return;
    const detail = Object.freeze({
      query: new URLSearchParams(location.search).get('q') || '',
      visibleResults: visibleCount(),
      summary: text
    });
    const signature = `${detail.query}\u0000${detail.visibleResults}\u0000${detail.summary}`;
    if (signature === lastSignature) return;
    lastSignature = signature;
    root.dispatchEvent(new CustomEvent('fundblick:search-rendered', { detail }));
  }

  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(emit, 0);
  }

  new MutationObserver(schedule).observe(summary, { childList:true, subtree:true, characterData:true });
  new MutationObserver(schedule).observe(cards, { childList:true, subtree:true, attributes:true, attributeFilter:['hidden','class'] });
  root.addEventListener('pageshow', schedule);
})(typeof window !== 'undefined' ? window : null);
