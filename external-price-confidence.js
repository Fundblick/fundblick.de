'use strict';

(function (root, factory) {
  const api = factory(root);
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.FundBlickExternalPriceConfidence = api;
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  const evidence=typeof require==='function'?require('./external-price-evidence.js'):root.FundBlickExternalPriceEvidence;
  const blockedHosts = [
    'ebay.', 'autouncle.', 'dasparking.', 'idealo.', 'kleinanzeigen.'
  ];

  const blockedContext = /(?:\bim\s+vergleich\b|\bpreisvergleich\b|\bgebraucht\s+kaufen\b|\bonline\s+entdecken\b|\bgro(?:ß|ss)e\s+auswahl\b|\bsuchergebnisse?\b|\bdrucken\b|\bbedrucken\b|\bpersonalisier\w*\b|\bkonfigurator\w*\b|\bwerbeartikel\b|\bstaffelpreis\w*\b|\bgro(?:ß|ss)handel\w*\b|\bzum\s+besten\s+preis\s+kaufen\b|\balle\s+preise\b|\btreffer\s+gefunden\b|\bsortiert\s+nach\b)/i;

  const listingTitle = /(?:\bzum\s+besten\s+preis\s+kaufen\b|\bgünstig\s+online\s+kaufen\b|\bonline\s+kaufen\b|\bangebote\b|\bsortiment\b|\bauswahl\b)/i;
  const listingUrl = /(?:\/search(?:\/|\?|$)|\/suche(?:\/|\?|$)|\/kategorie(?:\/|\?|$)|\/category(?:\/|\?|$)|\/produkte(?:\/|\?|$)|\/products(?:\/|\?|$)|\/shop(?:\/|\?|$)|filters?=|sort=|page=)/i;

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

  function looksLikeListingPage(item) {
    const title = String(item?.title || '');
    const url = String(item?.url || item?.productUrl || '');
    if (listingUrl.test(url)) return true;
    let directDetail=false;try{directDetail=/\/(?:p|dp|product|produkt)\/[^/]+/i.test(new URL(url).pathname)&&item.productCandidate===true&&String(item.priceConfidence||'').toLowerCase()==='structured'}catch{}
    if (!directDetail && listingTitle.test(title) && !/\b(?:\d+[.,]?\d*\s*(?:l|ml|kg|g|stück|stk\.?|pack|set)|[a-z]+\s+\d{2,}[a-z0-9-]*)\b/i.test(title)) return true;
    return false;
  }

  function canTrustStructuredPrice(item) {
    if (!item || !String(item.price || '').trim()) return false;
    if(evidence?.isNonOfferPrice(item))return false;
    if (String(item.priceConfidence || '').toLowerCase() === 'verified') return true;
    if (!item.productCandidate) return false;
    if (!String(item.image || '').trim()) return false;
    if (['video', 'guide', 'comparison', 'local'].includes(String(item.resultType || '').toLowerCase())) return false;
    if (hasBlockedHost(item.url || item.productUrl)) return false;
    if (hasBlockedContext(item)) return false;
    if (looksLikeListingPage(item)) return false;
    return true;
  }

  function annotate(items) {
    return (Array.isArray(items) ? items : []).map(item => {
      if(evidence?.isNonOfferPrice(item))return {...item,priceConfidence:'ambiguous',priceIssue:'non-offer-amount'};
      const visible=evidence?.visiblePrice(item);if(visible)item={...item,price:visible};
      if (!canTrustStructuredPrice(item)) return item;
      if (String(item.priceConfidence || '').toLowerCase() === 'verified') return item;
      return { ...item, priceConfidence: 'verified' };
    });
  }

  return Object.freeze({ annotate, canTrustStructuredPrice, hasBlockedContext, hasBlockedHost, looksLikeListingPage });
});
