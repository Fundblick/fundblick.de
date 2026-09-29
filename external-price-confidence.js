'use strict';

(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.FundBlickExternalPriceConfidence = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  const blockedHosts = [
    'ebay.', 'autouncle.', 'dasparking.', 'idealo.', 'kleinanzeigen.'
  ];

  const blockedContext = /(?:\bim\s+vergleich\b|\bpreisvergleich\b|\bgebraucht\s+kaufen\b|\bonline\s+entdecken\b|\bgro(?:ß|ss)e\s+auswahl\b|\bsuchergebnisse?\b|\bdrucken\b|\bbedrucken\b|\bpersonalisier\w*\b|\bkonfigurator\w*\b|\bwerbeartikel\b|\bstaffelpreis\w*\b|\bgro(?:ß|ss)handel\w*\b)/i;

  function host(value) {
    try { return new URL(String(value || '')).hostname.toLowerCase().replace(/^www\./, ''); }
    catch { return ''; }
  }

  function hasBlockedHost(value) {
    const h = host(value);
    return blockedHosts.some(part => h.includes(part));
  }

  function hasBlockedContext(item) {
    const text = `${String(item?.title || '')} ${String(item?.description || '')}`;
    return blockedContext.test(text);
  }

  function canTrustStructuredPrice(item) {
    if (!item || !String(item.price || '').trim()) return false;
    if (String(item.priceConfidence || '').toLowerCase() === 'verified') return true;
    if (!item.productCandidate) return false;
    if (!String(item.image || '').trim()) return false;
    if (['video', 'guide', 'comparison', 'local'].includes(String(item.resultType || '').toLowerCase())) return false;
    if (hasBlockedHost(item.url || item.productUrl)) return false;
    if (hasBlockedContext(item)) return false;
    return true;
  }

  function annotate(items) {
    return (Array.isArray(items) ? items : []).map(item => {
      if (!canTrustStructuredPrice(item)) return item;
      if (String(item.priceConfidence || '').toLowerCase() === 'verified') return item;
      return { ...item, priceConfidence: 'verified' };
    });
  }

  return Object.freeze({ annotate, canTrustStructuredPrice, hasBlockedContext, hasBlockedHost });
});
