'use strict';

(function (root, factory) {
  const api = factory(root && root.FundBlickExternalSearchPolicy);
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.FundBlickExternalSearchClient = api;
})(typeof window !== 'undefined' ? window : globalThis, function (policy) {
  const sessionCache = new Map();
  const pending = new Map();

  function endpoint(value) {
    const raw = String(value || '').trim();
    if (!raw) return null;
    try {
      const url = new URL(raw, typeof location !== 'undefined' ? location.href : 'https://fundblick.de/');
      if (url.protocol !== 'https:') return null;
      return url;
    } catch {
      return null;
    }
  }

  function normalizeQuery(value) {
    return policy?.normalizeQuery ? policy.normalizeQuery(value) : String(value || '').trim().slice(0, 200);
  }

  function requestKey(query, language, country) {
    return policy?.requestKey ? policy.requestKey(query, language, country) : `${country}:${language}:${normalizeQuery(query).toLowerCase()}`;
  }

  function normalizeResults(items) {
    if (policy?.normalizeExternalResults) return policy.normalizeExternalResults(items);
    return (Array.isArray(items) ? items : []).filter(Boolean);
  }

  async function search(options = {}) {
    const query = normalizeQuery(options.query);
    const base = endpoint(options.endpoint);
    if (!query) return { ok: false, skipped: 'invalid-query', results: [] };
    if (!base) return { ok: false, skipped: 'endpoint-disabled', results: [] };

    const language = String(options.language || 'de').trim().toLowerCase();
    const country = String(options.country || 'DE').trim().toUpperCase();
    const key = requestKey(query, language, country);
    if (sessionCache.has(key)) return { ...sessionCache.get(key), cached: true };
    if (pending.has(key)) return pending.get(key);

    const timeoutMs = Math.max(500, Math.min(10000, Number(options.timeoutMs) || 4000));
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const url = new URL('/search', base);
    url.searchParams.set('q', query);
    url.searchParams.set('lang', language);
    url.searchParams.set('country', country);

    const task = (async () => {
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: { Accept: 'application/json' },
          signal: controller.signal,
          credentials: 'omit',
          referrerPolicy: 'no-referrer'
        });
        if (!response.ok) return { ok: false, status: response.status, results: [] };
        const body = await response.json();
        const result = { ok: true, status: response.status, query, results: normalizeResults(body?.results) };
        sessionCache.set(key, result);
        return result;
      } catch (error) {
        return { ok: false, timeout: error?.name === 'AbortError', results: [] };
      } finally {
        clearTimeout(timer);
        pending.delete(key);
      }
    })();

    pending.set(key, task);
    return task;
  }

  function clearSessionCache() {
    sessionCache.clear();
  }

  return Object.freeze({ search, clearSessionCache, _endpoint: endpoint });
});
