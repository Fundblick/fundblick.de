'use strict';

(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.FundBlickExternalSearchPolicy = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  const DEFAULTS = Object.freeze({ minLocalResults: 10, minQueryLength: 2, maxQueryLength: 120 });

  function normalizeQuery(value, maxLength = DEFAULTS.maxQueryLength) {
    const limit = Number.isFinite(Number(maxLength)) ? Math.max(1, Number(maxLength)) : DEFAULTS.maxQueryLength;
    return String(value || '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, limit);
  }
  function validQuery(value, options = {}) {
    const query = normalizeQuery(value, options.maxQueryLength);
    const minRaw = Number(options.minQueryLength ?? DEFAULTS.minQueryLength);
    const min = Number.isFinite(minRaw) ? Math.max(1, Math.floor(minRaw)) : DEFAULTS.minQueryLength;
    return query.length >= min;
  }
  function localResultCount(value) {
    if (Array.isArray(value)) return value.length;
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  }
  function shouldUseExternalSearch(input = {}) {
    const query = normalizeQuery(input.query, input.maxQueryLength);
    if (!validQuery(query, input) || input.externalEnabled === false || input.pending === true || input.alreadyRequested === true) return false;
    const thresholdRaw = Number(input.minLocalResults ?? DEFAULTS.minLocalResults);
    const threshold = Number.isFinite(thresholdRaw) ? Math.max(0, Math.floor(thresholdRaw)) : DEFAULTS.minLocalResults;
    return localResultCount(input.localResults) < threshold;
  }
  function requestKey(query, language = 'de', country = 'DE') {
    return `${String(country || 'DE').trim().toLocaleUpperCase()}:${String(language || 'de').trim().toLocaleLowerCase()}:${normalizeQuery(query).toLocaleLowerCase()}`;
  }
  function cleanText(value, max = 1000) {
    return String(value || '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;|&#160;/gi, ' ')
      .replace(/&amp;/gi, '&').replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'")
      .replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
      .replace(/\s+/g, ' ').trim().slice(0, max);
  }
  function hostOf(value) {
    try { return new URL(String(value || '')).hostname.replace(/^www\./i, ''); } catch { return ''; }
  }
  function safeHttpUrl(value) {
    try { const url = new URL(String(value || '')); return /^https?:$/.test(url.protocol) ? url.href : ''; } catch { return ''; }
  }
  function firstValue(item, keys) {
    for (const key of keys) {
      const value = item?.[key];
      if (value !== undefined && value !== null && String(value).trim() !== '') return value;
    }
    return '';
  }
  function normalizedPrice(item) {
    const raw = firstValue(item, ['price','priceText','price_text','formattedPrice','formatted_price']);
    if (typeof raw === 'number' && Number.isFinite(raw)) return `${raw.toFixed(2).replace('.', ',')} €`;
    const text = cleanText(raw, 80);
    return /\d/.test(text) ? text : '';
  }
  function normalizedCurrency(item, price) {
    const raw = cleanText(firstValue(item, ['currency','priceCurrency','price_currency']), 20).toUpperCase();
    if (raw === '€' || raw.includes('EUR')) return 'EUR';
    if (raw === '$' || raw.includes('USD')) return 'USD';
    if (raw === '£' || raw.includes('GBP')) return 'GBP';
    const code = raw.match(/\b(EUR|USD|GBP|CHF|PLN|CZK|RON|MDL)\b/);
    if (code) return code[1];
    const priceText = cleanText(price, 80).toUpperCase();
    if (priceText.includes('€') || priceText.includes('EUR')) return 'EUR';
    if (priceText.includes('$') || priceText.includes('USD')) return 'USD';
    if (priceText.includes('£') || priceText.includes('GBP')) return 'GBP';
    const fromPrice = priceText.match(/\b(EUR|USD|GBP|CHF|PLN|CZK|RON|MDL)\b/);
    return fromPrice ? fromPrice[1] : '';
  }
  function normalizedProductStatus(item) {
    const raw = cleanText(firstValue(item, ['productStatus','product_status','availability']), 40).toLowerCase();
    return ['in_stock','out_of_stock','preorder','backorder','unknown'].includes(raw) ? raw : 'unknown';
  }
  function likelyProductPage(url, title, description) {
    const u = String(url || '').toLowerCase();
    const text = `${title} ${description}`.toLowerCase();
    if (/\/(product|produkt|p|dp|item|artikel)\//.test(u) || /[?&](sku|product|article|item|pid)=/.test(u)) return true;
    if (/\b(€|eur|kaufen|bestellen|angebot|preis|shop)\b/.test(text)) return true;
    return false;
  }
  function normalizeExternalResult(item) {
    if (!item || typeof item !== 'object') return null;
    const title = cleanText(item.title, 300);
    const url = safeHttpUrl(firstValue(item, ['productUrl','product_url','url']));
    const description = cleanText(item.description, 1000);
    if (!title || !url) return null;
    const host = hostOf(url);
    const image = safeHttpUrl(firstValue(item, ['image','imageUrl','image_url','thumbnail','thumbnailUrl','thumbnail_url']));
    const price = normalizedPrice(item);
    const currency = normalizedCurrency(item, price);
    const merchant = cleanText(firstValue(item, ['merchant','shop','store','seller']), 120) || host;
    const productStatus = normalizedProductStatus(item);
    const productCandidate = item.productCandidate === true || likelyProductPage(url, title, description);
    return Object.freeze({ kind:'external-web', title, url, productUrl:url, description, source:'web', host, merchant, image, price, currency, productStatus, productCandidate });
  }
  function normalizeExternalResults(items) {
    const seen = new Set();
    return (Array.isArray(items) ? items : []).map(normalizeExternalResult).filter(item => {
      if (!item) return false;
      const key = item.url.replace(/#.*$/, '').replace(/\/$/, '');
      if (seen.has(key)) return false;
      seen.add(key); return true;
    });
  }
  return Object.freeze({ DEFAULTS, normalizeQuery, validQuery, localResultCount, shouldUseExternalSearch, requestKey, cleanText, normalizeExternalResult, normalizeExternalResults });
});
