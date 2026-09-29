'use strict';

(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.FundBlickExternalSearchPolicy = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  const DEFAULTS = Object.freeze({
    minLocalResults: 10,
    minQueryLength: 2,
    maxQueryLength: 120
  });

  function normalizeQuery(value, maxLength = DEFAULTS.maxQueryLength) {
    const limit = Number.isFinite(Number(maxLength)) ? Math.max(1, Number(maxLength)) : DEFAULTS.maxQueryLength;
    return String(value || '')
      .replace(/[\u0000-\u001f\u007f]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, limit);
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
    if (!validQuery(query, input)) return false;
    if (input.externalEnabled === false) return false;
    if (input.pending === true) return false;
    if (input.alreadyRequested === true) return false;

    const thresholdRaw = Number(input.minLocalResults ?? DEFAULTS.minLocalResults);
    const threshold = Number.isFinite(thresholdRaw) ? Math.max(0, Math.floor(thresholdRaw)) : DEFAULTS.minLocalResults;
    return localResultCount(input.localResults) < threshold;
  }

  function requestKey(query, language = 'de', country = 'DE') {
    const q = normalizeQuery(query).toLocaleLowerCase();
    const lang = String(language || 'de').trim().toLocaleLowerCase();
    const region = String(country || 'DE').trim().toLocaleUpperCase();
    return `${region}:${lang}:${q}`;
  }

  function normalizeExternalResult(item) {
    if (!item || typeof item !== 'object') return null;
    const title = String(item.title || '').trim();
    const url = String(item.url || '').trim();
    const description = String(item.description || '').trim();
    if (!title || !/^https?:\/\//i.test(url)) return null;
    return Object.freeze({
      kind: 'external-web',
      title,
      url,
      description,
      source: 'web'
    });
  }

  function normalizeExternalResults(items) {
    return (Array.isArray(items) ? items : []).map(normalizeExternalResult).filter(Boolean);
  }

  return Object.freeze({
    DEFAULTS,
    normalizeQuery,
    validQuery,
    localResultCount,
    shouldUseExternalSearch,
    requestKey,
    normalizeExternalResult,
    normalizeExternalResults
  });
});
